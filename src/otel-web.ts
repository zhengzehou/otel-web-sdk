import {
  context,
  Context,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  Span,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

const SDK_VERSION = '0.3.3'
const DEFAULT_SERVICE_NAME = 'web-app'
const ROUTE_EVENT = '__databuff_otel_route_change__'

export type DatabuffOtelLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface DatabuffOtelConfig {
  serviceName: string
  endpoint?: string
  logsEndpoint?: string
  serviceVersion?: string
  environment?: string
  sampleRate?: number
  headers?: Record<string, string>
  propagateTo?: Array<string | RegExp>
  captureDocumentLoad?: boolean
  captureFetch?: boolean
  captureXhr?: boolean
  captureUserInteractions?: boolean
  captureErrors?: boolean
  captureConsole?: boolean
  captureRoutes?: boolean
  captureWebVitals?: boolean
  pageLoadWindowMillis?: number
  interactionWindowMillis?: number
  includeUrlQuery?: boolean
  minLogLevel?: DatabuffOtelLogLevel
  logCookieKeys?: string[]
  logLocalStorageKeys?: string[]
  logSessionStorageKeys?: string[]
  debug?: boolean
  attributes?: Record<string, string | number | boolean>
}

interface ResolvedConfig extends Required<Omit<DatabuffOtelConfig,
  'serviceVersion' | 'environment' | 'endpoint' | 'logsEndpoint' | 'headers' | 'propagateTo' | 'attributes'
>> {
  endpoint: string
  logsEndpoint: string
  serviceVersion?: string
  environment?: string
  headers: Record<string, string>
  propagateTo: Array<string | RegExp>
  attributes: Record<string, string | number | boolean>
}

export interface DatabuffOtelApi {
  readonly version: string
  readonly initialized: boolean
  init(config: DatabuffOtelConfig): DatabuffOtelApi
  flush(): Promise<void>
  shutdown(): Promise<void>
  recordError(error: unknown, attributes?: Record<string, string | number | boolean>): void
  log(body: unknown, severity?: DatabuffOtelLogLevel, attributes?: Record<string, string | number | boolean>): void
  startSpan<T>(name: string, fn: (span: Span) => T, attributes?: Record<string, string | number | boolean>): T
}

declare global {
  interface Window {
    DatabuffOtel?: DatabuffOtelApi
  }
}

let traceProvider: WebTracerProvider | undefined
let loggerProvider: LoggerProvider | undefined
let resolvedConfig: ResolvedConfig | undefined
let removeGlobalHooks: (() => void) | undefined
let unregisterInstrumentations: (() => void) | undefined
let navigationCorrelation: { span: Span; timer: number } | undefined
let interactionCorrelation: { span: Span; timer: number } | undefined
const xhrRequestMeta = new WeakMap<XMLHttpRequest, { method: string; url: string }>()

function clampSampleRate(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return 1
  return Math.max(0, Math.min(1, value))
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function wildcardToRegExp(value: string): RegExp {
  const escaped = value.split('*').map(escapeRegExp).join('.*')
  return new RegExp(`^${escaped}`)
}

function normalizeEndpoint(value: string | undefined, signal: 'traces' | 'logs'): string {
  const script = document.currentScript as HTMLScriptElement | null
  const fallbackBase = script?.src ? new URL(script.src, location.href).origin : location.origin
  const input = (value || fallbackBase).replace(/\/$/, '')
  if (/\/v1\/(?:traces|logs)$/.test(input)) return input.replace(/\/v1\/(?:traces|logs)$/, `/v1/${signal}`)
  return `${input}/v1/${signal}`
}

function safeJsonObject(value: string | undefined): Record<string, string> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).map(([key, item]) => [key, String(item)]))
  } catch {
    console.warn('[DatabuffOtel] Ignoring invalid JSON in data-headers.')
    return {}
  }
}

function readBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback
  return !['false', '0', 'off', 'no'].includes(value.toLowerCase())
}

function normalizeLogLevel(value: string | undefined): DatabuffOtelLogLevel {
  const level = value?.toUpperCase()
  return level === 'DEBUG' || level === 'INFO' || level === 'WARN' || level === 'ERROR'
    ? level
    : 'ERROR'
}

function normalizeKeyList(values: string[] | undefined): string[] {
  if (!values?.length) return []
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

function readKeyList(value: string | undefined): string[] {
  return normalizeKeyList(value?.split(','))
}

function currentScriptConfig(): { autoStart: boolean; config: DatabuffOtelConfig } {
  const script = document.currentScript as HTMLScriptElement | null
  const data = script?.dataset ?? {}
  const propagateTo = data.propagateTo
    ?.split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(wildcardToRegExp)

  return {
    autoStart: readBool(data.autostart, true),
    config: {
      serviceName: data.service || DEFAULT_SERVICE_NAME,
      endpoint: data.endpoint,
      logsEndpoint: data.logsEndpoint,
      serviceVersion: data.version,
      environment: data.environment,
      sampleRate: data.sampleRate == null ? undefined : Number(data.sampleRate),
      headers: safeJsonObject(data.headers),
      propagateTo,
      captureDocumentLoad: readBool(data.documentLoad, true),
      captureFetch: readBool(data.fetch, true),
      captureXhr: readBool(data.xhr, true),
      captureUserInteractions: readBool(data.userInteractions, true),
      captureErrors: readBool(data.errors, true),
      captureConsole: readBool(data.console, true),
      captureRoutes: readBool(data.routes, true),
      captureWebVitals: readBool(data.webVitals, true),
      pageLoadWindowMillis: data.pageLoadWindow == null ? undefined : Number(data.pageLoadWindow),
      interactionWindowMillis: data.interactionWindow == null ? undefined : Number(data.interactionWindow),
      includeUrlQuery: readBool(data.includeUrlQuery, false),
      minLogLevel: normalizeLogLevel(data.minLogLevel),
      logCookieKeys: readKeyList(data.logCookieKeys),
      logLocalStorageKeys: readKeyList(data.logLocalStorageKeys),
      logSessionStorageKeys: readKeyList(data.logSessionStorageKeys),
      debug: readBool(data.debug, false),
    },
  }
}

function resolveConfig(config: DatabuffOtelConfig): ResolvedConfig {
  return {
    serviceName: config.serviceName || DEFAULT_SERVICE_NAME,
    endpoint: normalizeEndpoint(config.endpoint, 'traces'),
    logsEndpoint: normalizeEndpoint(config.logsEndpoint ?? config.endpoint, 'logs'),
    serviceVersion: config.serviceVersion,
    environment: config.environment,
    sampleRate: clampSampleRate(config.sampleRate),
    headers: config.headers ?? {},
    propagateTo: config.propagateTo ?? [],
    captureDocumentLoad: config.captureDocumentLoad ?? true,
    captureFetch: config.captureFetch ?? true,
    captureXhr: config.captureXhr ?? true,
    captureUserInteractions: config.captureUserInteractions ?? true,
    captureErrors: config.captureErrors ?? true,
    captureConsole: config.captureConsole ?? true,
    captureRoutes: config.captureRoutes ?? true,
    captureWebVitals: config.captureWebVitals ?? true,
    pageLoadWindowMillis: Math.max(0, config.pageLoadWindowMillis ?? 5000),
    interactionWindowMillis: Math.max(0, config.interactionWindowMillis ?? 3000),
    includeUrlQuery: config.includeUrlQuery ?? false,
    minLogLevel: normalizeLogLevel(config.minLogLevel),
    logCookieKeys: normalizeKeyList(config.logCookieKeys),
    logLocalStorageKeys: normalizeKeyList(config.logLocalStorageKeys),
    logSessionStorageKeys: normalizeKeyList(config.logSessionStorageKeys),
    debug: config.debug ?? false,
    attributes: config.attributes ?? {},
  }
}

function pageUrl(config: ResolvedConfig): string {
  const url = new URL(location.href)
  if (!config.includeUrlQuery) {
    url.search = ''
    url.hash = ''
  }
  return url.href
}

function pageRoute(config?: ResolvedConfig): string {
  const url = new URL(location.href)
  const path = url.pathname || '/'
  const query = config?.includeUrlQuery ? url.search : ''
  const hash = url.hash || ''
  return path + query + hash
}

function withPageRoute(name: string, config?: ResolvedConfig): string {
  const base = (name || '').trim()
  const route = pageRoute(config)
  if (!route || base === route || base.endsWith(' ' + route)) return base
  return base ? base + ' ' + route : route
}

function finishCorrelation(kind: 'navigation' | 'interaction'): void {
  const current = kind === 'navigation' ? navigationCorrelation : interactionCorrelation
  if (!current) return
  window.clearTimeout(current.timer)
  current.span.end()
  if (kind === 'navigation') navigationCorrelation = undefined
  else interactionCorrelation = undefined
}

function currentCorrelationSpan(): Span | undefined {
  return interactionCorrelation?.span ?? navigationCorrelation?.span
}

function startNavigationSpan(reason: string, previousUrl?: string): void {
  if (!resolvedConfig) return
  finishCorrelation('navigation')
  const tracer = trace.getTracer('@databuff/otel-web', SDK_VERSION)
  const span = tracer.startSpan(withPageRoute(reason === 'load' ? 'page.load' : 'page.view', resolvedConfig), {
    attributes: {
      'url.full': pageUrl(resolvedConfig),
      'page.title': document.title,
      'navigation.type': reason,
      ...(previousUrl ? { 'navigation.previous_url': previousUrl } : {}),
    },
  })
  const timer = window.setTimeout(() => {
    if (navigationCorrelation?.span === span) finishCorrelation('navigation')
  }, resolvedConfig.pageLoadWindowMillis)
  navigationCorrelation = { span, timer }
}

function elementName(element: HTMLElement): string {
  const text = element.textContent?.replace(/\s+/g, ' ').trim() || ''
  return (
    element.dataset.otelName ||
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    (element instanceof HTMLInputElement ? element.value : '') ||
    text ||
    element.id ||
    element.getAttribute('name') ||
    element.tagName.toLowerCase()
  ).slice(0, 120)
}

function elementPath(element: HTMLElement): string {
  const parts: string[] = []
  let current: HTMLElement | null = element
  while (current && parts.length < 5) {
    let part = current.tagName.toLowerCase()
    if (current.id) {
      part += `#${current.id.replace(/[^a-zA-Z0-9_-]/g, '')}`
      parts.unshift(part)
      break
    }
    const classes = Array.from(current.classList)
      .map(item => item.replace(/[^a-zA-Z0-9_-]/g, ''))
      .filter(Boolean)
      .slice(0, 2)
    if (classes.length) part += `.${classes.join('.')}`
    parts.unshift(part)
    current = current.parentElement
  }
  return parts.join(' > ').slice(0, 300)
}

function startInteractionSpan(element: HTMLElement): void {
  if (!resolvedConfig) return
  finishCorrelation('interaction')
  const name = elementName(element)
  const tracer = trace.getTracer('@databuff/otel-web', SDK_VERSION)
  const parent = navigationCorrelation?.span
  const parentContext = parent ? trace.setSpan(context.active(), parent) : context.active()
  const span = tracer.startSpan(withPageRoute(`ui.click ${name}`, resolvedConfig), {
    attributes: {
      'event.name': 'click',
      'ui.element.name': name,
      'ui.element.type': element.tagName.toLowerCase(),
      'ui.element.id': element.id,
      'ui.element.role': element.getAttribute('role') || '',
      'ui.element.path': elementPath(element),
      'url.full': pageUrl(resolvedConfig),
    },
  }, parentContext)
  const timer = window.setTimeout(() => {
    if (interactionCorrelation?.span === span) finishCorrelation('interaction')
  }, resolvedConfig.interactionWindowMillis)
  interactionCorrelation = { span, timer }
}

function applyRequestAttributes(span: Span, method: string, rawUrl: string, status?: number): void {
  const normalizedMethod = (method || 'GET').toUpperCase()
  try {
    const url = new URL(rawUrl, location.href)
    span.updateName(`${normalizedMethod} ${url.pathname}`)
    span.setAttribute('http.request.method', normalizedMethod)
    span.setAttribute('server.address', url.hostname)
    span.setAttribute('url.path', url.pathname)
    if (status != null) span.setAttribute('http.response.status_code', status)
  } catch {
    span.updateName(`${normalizedMethod} request`)
  }
  span.setAttribute('http.request.source', 'browser')
}

function toException(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error(String(error))
  }
}

const severityNumbers = {
  DEBUG: SeverityNumber.DEBUG,
  INFO: SeverityNumber.INFO,
  WARN: SeverityNumber.WARN,
  ERROR: SeverityNumber.ERROR,
} as const

function stringifyLogBody(body: unknown): string {
  if (typeof body === 'string') return body
  if (body instanceof Error) return body.stack || body.message
  try {
    const serialized = JSON.stringify(body)
    return serialized === undefined ? String(body) : serialized
  } catch {
    return String(body)
  }
}

interface LogBodyContext {
  cookie?: Record<string, string>
  localStorage?: Record<string, string>
  sessionStorage?: Record<string, string>
}

function decodeCookiePart(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function readCookieValues(keys: string[]): Record<string, string> {
  if (!keys.length || typeof document === 'undefined') return {}
  const available = new Map<string, string>()
  try {
    for (const item of document.cookie.split(';')) {
      const separator = item.indexOf('=')
      if (separator < 0) continue
      const rawName = item.slice(0, separator).trim()
      const rawValue = item.slice(separator + 1)
      const value = decodeCookiePart(rawValue)
      available.set(rawName, value)
      available.set(decodeCookiePart(rawName), value)
    }
  } catch {
    return {}
  }
  const result: Record<string, string> = {}
  for (const key of keys) {
    const value = available.get(key)
    if (value !== undefined) result[key] = value
  }
  return result
}

function readStorageValues(
  storageName: 'localStorage' | 'sessionStorage',
  keys: string[],
): Record<string, string> {
  if (!keys.length || typeof window === 'undefined') return {}
  const result: Record<string, string> = {}
  try {
    const storage = window[storageName]
    for (const key of keys) {
      const value = storage.getItem(key)
      if (value !== null) result[key] = value
    }
  } catch {
    return {}
  }
  return result
}

function readLogBodyContext(config: ResolvedConfig | undefined): LogBodyContext | undefined {
  if (!config) return undefined
  const cookie = readCookieValues(config.logCookieKeys)
  const localStorage = readStorageValues('localStorage', config.logLocalStorageKeys)
  const sessionStorage = readStorageValues('sessionStorage', config.logSessionStorageKeys)
  const result: LogBodyContext = {}
  if (Object.keys(cookie).length) result.cookie = cookie
  if (Object.keys(localStorage).length) result.localStorage = localStorage
  if (Object.keys(sessionStorage).length) result.sessionStorage = sessionStorage
  return Object.keys(result).length ? result : undefined
}

function buildLogBody(body: unknown): string {
  const contextValues = readLogBodyContext(resolvedConfig)
  if (!contextValues) return stringifyLogBody(body)
  return JSON.stringify({
    message: stringifyLogBody(body),
    context: contextValues,
  })
}

function emitLog(
  body: unknown,
  severity: DatabuffOtelLogLevel = 'INFO',
  attributes: Record<string, string | number | boolean> = {},
  explicitContext?: Context,
): void {
  const minimumLevel = resolvedConfig?.minLogLevel ?? 'ERROR'
  if (severityNumbers[severity] < severityNumbers[minimumLevel]) return
  const logger = logs.getLogger('@databuff/otel-web', SDK_VERSION)
  const baseContext = explicitContext ?? context.active()
  let parentSpan = trace.getSpan(baseContext) ?? currentCorrelationSpan()
  let syntheticSpan: Span | undefined

  if (!parentSpan) {
    syntheticSpan = trace.getTracer('@databuff/otel-web', SDK_VERSION).startSpan(
      `log.${severity.toLowerCase()}`,
      {
        attributes: {
          'event.name': 'log.emit',
          'log.severity': severity,
        },
      },
      baseContext,
    )
    if (severity === 'ERROR') syntheticSpan.setStatus({ code: SpanStatusCode.ERROR })
    parentSpan = syntheticSpan
  }

  const logContext = parentSpan ? trace.setSpan(baseContext, parentSpan) : baseContext
  logger.emit({
    severityNumber: severityNumbers[severity],
    severityText: severity,
    body: buildLogBody(body),
    attributes,
    context: logContext,
  })
  syntheticSpan?.end()
}

function recordError(error: unknown, attributes: Record<string, string | number | boolean> = {}): void {
  const exception = toException(error)
  const tracer = trace.getTracer('@databuff/otel-web', SDK_VERSION)
  const correlationSpan = currentCorrelationSpan()
  const parentContext = correlationSpan ? trace.setSpan(context.active(), correlationSpan) : context.active()
  const span = tracer.startSpan(withPageRoute('browser.error', resolvedConfig), {
    attributes: {
      'error.type': exception.name,
      'error.message': exception.message,
      ...attributes,
    },
  }, parentContext)
  emitLog(exception.message, 'ERROR', {
    'event.name': 'browser.error',
    'exception.type': exception.name,
    'exception.message': exception.message,
    'exception.stacktrace': exception.stack || '',
    ...attributes,
  }, trace.setSpan(parentContext, span))
  span.recordException(exception)
  span.setStatus({ code: SpanStatusCode.ERROR, message: exception.message })
  span.end()
}

function recordWebVital(metric: Metric): void {
  const tracer = trace.getTracer('@databuff/otel-web', SDK_VERSION)
  const span = tracer.startSpan(withPageRoute(`web.vital.${metric.name.toLowerCase()}`, resolvedConfig), {
    attributes: {
      'web_vital.name': metric.name,
      'web_vital.value': metric.value,
      'web_vital.rating': metric.rating,
      'web_vital.delta': metric.delta,
      'web_vital.id': metric.id,
      'url.full': resolvedConfig ? pageUrl(resolvedConfig) : location.href,
    },
  })
  span.end()
}

function installGlobalHooks(config: ResolvedConfig): () => void {
  const removers: Array<() => void> = []

  if (config.captureFetch && typeof window.fetch === 'function') {
    const instrumentedFetch = window.fetch
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const parent = currentCorrelationSpan()
      if (!parent) return instrumentedFetch(input, init)
      return context.with(trace.setSpan(context.active(), parent), () => instrumentedFetch(input, init))
    }) as typeof window.fetch
    removers.push(() => { window.fetch = instrumentedFetch })
  }

  if (config.captureXhr && typeof XMLHttpRequest !== 'undefined') {
    const instrumentedOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = (function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null,
    ) {
      xhrRequestMeta.set(this, { method: method.toUpperCase(), url: String(url) })
      const invoke = () => instrumentedOpen.call(this, method, String(url), async, username, password)
      const parent = currentCorrelationSpan()
      return parent ? context.with(trace.setSpan(context.active(), parent), invoke) : invoke()
    }) as typeof XMLHttpRequest.prototype.open
    removers.push(() => { XMLHttpRequest.prototype.open = instrumentedOpen })
  }

  if (config.captureUserInteractions) {
    const onClick = (event: MouseEvent) => {
      const rawTarget = event.target
      if (!(rawTarget instanceof Element)) return
      const element = rawTarget.closest<HTMLElement>(
        '[data-otel-name],button,[role="button"],input[type="button"],input[type="submit"],a[href]',
      )
      if (!element || element.hasAttribute('disabled')) return
      startInteractionSpan(element)
    }
    document.addEventListener('click', onClick, true)
    removers.push(() => document.removeEventListener('click', onClick, true))
  }

  if (config.captureDocumentLoad && !config.captureRoutes) startNavigationSpan('load')

  if (config.captureErrors) {
    const onError = (event: ErrorEvent) => recordError(event.error || event.message, {
      'code.filepath': event.filename || '',
      'code.lineno': event.lineno,
      'code.column': event.colno,
    })
    const onRejection = (event: PromiseRejectionEvent) => recordError(event.reason, {
      'error.source': 'unhandledrejection',
    })
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    removers.push(() => window.removeEventListener('error', onError))
    removers.push(() => window.removeEventListener('unhandledrejection', onRejection))
  }

  if (config.captureConsole) {
    const originalWarn = console.warn
    const originalError = console.error
    let emittingConsoleLog = false
    const capture = (severity: 'WARN' | 'ERROR', original: typeof console.warn, args: unknown[]) => {
      original.apply(console, args)
      if (emittingConsoleLog) return
      emittingConsoleLog = true
      try {
        emitLog(args.map(stringifyLogBody).join(' '), severity, {
          'event.name': 'console',
          'console.severity': severity.toLowerCase(),
        })
      } finally {
        emittingConsoleLog = false
      }
    }
    console.warn = (...args: unknown[]) => capture('WARN', originalWarn, args)
    console.error = (...args: unknown[]) => capture('ERROR', originalError, args)
    removers.push(() => {
      console.warn = originalWarn
      console.error = originalError
    })
  }

  if (config.captureRoutes) {
    let previousHref = location.href
    let previousUrl = pageUrl(config)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    const notify = (type: string) => {
      const nextHref = location.href
      const nextUrl = pageUrl(config)
      if (nextHref === previousHref) return
      const oldUrl = previousUrl
      previousHref = nextHref
      previousUrl = nextUrl
      startNavigationSpan(type, oldUrl)
    }

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args)
      window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: 'pushState' }))
      return result
    }
    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args)
      window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: 'replaceState' }))
      return result
    }

    const onRoute = (event: Event) => notify((event as CustomEvent<string>).detail || 'history')
    const onPopState = () => notify('popstate')
    const onHashChange = () => notify('hashchange')
    window.addEventListener(ROUTE_EVENT, onRoute)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    startNavigationSpan('load')

    removers.push(() => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      window.removeEventListener(ROUTE_EVENT, onRoute)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    })
  }

  if (config.captureWebVitals) {
    onCLS(recordWebVital)
    onFCP(recordWebVital)
    onINP(recordWebVital)
    onLCP(recordWebVital)
    onTTFB(recordWebVital)
  }

  return () => {
    removers.splice(0).forEach(remove => remove())
    finishCorrelation('interaction')
    finishCorrelation('navigation')
  }
}

function init(configInput: DatabuffOtelConfig): DatabuffOtelApi {
  if (traceProvider) {
    if (resolvedConfig?.debug) console.warn('[DatabuffOtel] init() ignored: SDK is already initialized.')
    return api
  }

  const config = resolveConfig(configInput)
  resolvedConfig = config

  if (config.debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  const resourceAttributes: Record<string, string | number | boolean> = {
    'service.name': config.serviceName,
    'telemetry.sdk.distribution': '@databuff/otel-web',
    'telemetry.sdk.distribution.version': SDK_VERSION,
    ...config.attributes,
  }
  if (config.serviceVersion) resourceAttributes['service.version'] = config.serviceVersion
  if (config.environment) resourceAttributes['deployment.environment.name'] = config.environment

  const resource = resourceFromAttributes(resourceAttributes)
  const traceExporter = new OTLPTraceExporter({
    url: config.endpoint,
    headers: config.headers,
  })
  const spanProcessor = new BatchSpanProcessor(traceExporter, {
    scheduledDelayMillis: 3000,
    exportTimeoutMillis: 10000,
    maxQueueSize: 1024,
    maxExportBatchSize: 256,
  })
  traceProvider = new WebTracerProvider({
    resource,
    sampler: new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(config.sampleRate) }),
    spanProcessors: [spanProcessor],
  })
  traceProvider.register({ contextManager: new ZoneContextManager() })

  const logExporter = new OTLPLogExporter({
    url: config.logsEndpoint,
    headers: config.headers,
  })
  const logProcessor = new BatchLogRecordProcessor({
    exporter: logExporter,
    scheduledDelayMillis: 3000,
    exportTimeoutMillis: 10000,
    maxQueueSize: 1024,
    maxExportBatchSize: 256,
  })
  loggerProvider = new LoggerProvider({ resource, processors: [logProcessor] })
  logs.setGlobalLoggerProvider(loggerProvider)

  const ignoredExporters = [config.endpoint, config.logsEndpoint]
    .map(endpoint => new RegExp(`^${escapeRegExp(endpoint)}(?:\\?|$)`))
  const instrumentations = []
  if (config.captureDocumentLoad) instrumentations.push(new DocumentLoadInstrumentation())
  if (config.captureFetch) {
    instrumentations.push(new FetchInstrumentation({
      ignoreUrls: ignoredExporters,
      propagateTraceHeaderCorsUrls: config.propagateTo,
      requestHook: (span, request) => {
        const method = request instanceof Request ? request.method : request.method || 'GET'
        span.setAttribute('http.request.method', method.toUpperCase())
      },
      applyCustomAttributesOnSpan: (span, request, result) => {
        const method = request instanceof Request ? request.method : request.method || 'GET'
        const requestUrl = request instanceof Request ? request.url : ''
        const resultUrl = result instanceof Response ? result.url : ''
        applyRequestAttributes(span, method, resultUrl || requestUrl, result.status)
      },
    }))
  }
  if (config.captureXhr) {
    instrumentations.push(new XMLHttpRequestInstrumentation({
      ignoreUrls: ignoredExporters,
      propagateTraceHeaderCorsUrls: config.propagateTo,
      applyCustomAttributesOnSpan: (span, xhr) => {
        const request = xhrRequestMeta.get(xhr)
        applyRequestAttributes(
          span,
          request?.method || 'GET',
          xhr.responseURL || request?.url || '',
          xhr.status,
        )
      },
    }))
  }

  unregisterInstrumentations = registerInstrumentations({ instrumentations })
  removeGlobalHooks = installGlobalHooks(config)

  if (config.debug) {
    console.info('[DatabuffOtel] initialized', {
      serviceName: config.serviceName,
      tracesEndpoint: config.endpoint,
      logsEndpoint: config.logsEndpoint,
      minLogLevel: config.minLogLevel,
      logCookieKeys: config.logCookieKeys,
      logLocalStorageKeys: config.logLocalStorageKeys,
      logSessionStorageKeys: config.logSessionStorageKeys,
      sampleRate: config.sampleRate,
    })
  }
  return api
}

const api: DatabuffOtelApi = {
  version: SDK_VERSION,
  get initialized() {
    return traceProvider != null
  },
  init,
  async flush() {
    await Promise.all([
      traceProvider?.forceFlush(),
      loggerProvider?.forceFlush(),
    ])
  },
  async shutdown() {
    removeGlobalHooks?.()
    removeGlobalHooks = undefined
    unregisterInstrumentations?.()
    unregisterInstrumentations = undefined
    await Promise.all([
      traceProvider?.shutdown(),
      loggerProvider?.shutdown(),
    ])
    logs.disable()
    traceProvider = undefined
    loggerProvider = undefined
    resolvedConfig = undefined
  },
  recordError,
  log: emitLog,
  startSpan<T>(name: string, fn: (span: Span) => T, attributes = {}): T {
    const tracer = trace.getTracer('@databuff/otel-web', SDK_VERSION)
    return tracer.startActiveSpan(name, { attributes }, context.active(), span => {
      try {
        const result = fn(span)
        if (result instanceof Promise) {
          return result.catch(error => {
            span.recordException(toException(error))
            span.setStatus({ code: SpanStatusCode.ERROR })
            throw error
          }).finally(() => span.end()) as T
        }
        span.end()
        return result
      } catch (error) {
        span.recordException(toException(error))
        span.setStatus({ code: SpanStatusCode.ERROR })
        span.end()
        throw error
      }
    })
  },
}

const existing = window.DatabuffOtel
if (!existing) {
  window.DatabuffOtel = api
  const scriptOptions = currentScriptConfig()
  if (scriptOptions.autoStart) init(scriptOptions.config)
} else {
  console.warn('[DatabuffOtel] SDK is already loaded; duplicate script ignored.')
}

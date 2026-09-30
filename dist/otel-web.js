"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/@opentelemetry/api/build/esm/version.js
  var VERSION = "1.9.1";

  // node_modules/@opentelemetry/api/build/esm/internal/semver.js
  var re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
  function _makeCompatibilityCheck(ownVersion) {
    const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
    const rejectedVersions = /* @__PURE__ */ new Set();
    const myVersionMatch = ownVersion.match(re);
    if (!myVersionMatch) {
      return () => false;
    }
    const ownVersionParsed = {
      major: +myVersionMatch[1],
      minor: +myVersionMatch[2],
      patch: +myVersionMatch[3],
      prerelease: myVersionMatch[4]
    };
    if (ownVersionParsed.prerelease != null) {
      return function isExactmatch(globalVersion) {
        return globalVersion === ownVersion;
      };
    }
    function _reject(v2) {
      rejectedVersions.add(v2);
      return false;
    }
    function _accept(v2) {
      acceptedVersions.add(v2);
      return true;
    }
    return function isCompatible2(globalVersion) {
      if (acceptedVersions.has(globalVersion)) {
        return true;
      }
      if (rejectedVersions.has(globalVersion)) {
        return false;
      }
      const globalVersionMatch = globalVersion.match(re);
      if (!globalVersionMatch) {
        return _reject(globalVersion);
      }
      const globalVersionParsed = {
        major: +globalVersionMatch[1],
        minor: +globalVersionMatch[2],
        patch: +globalVersionMatch[3],
        prerelease: globalVersionMatch[4]
      };
      if (globalVersionParsed.prerelease != null) {
        return _reject(globalVersion);
      }
      if (ownVersionParsed.major !== globalVersionParsed.major) {
        return _reject(globalVersion);
      }
      if (ownVersionParsed.major === 0) {
        if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
          return _accept(globalVersion);
        }
        return _reject(globalVersion);
      }
      if (ownVersionParsed.minor <= globalVersionParsed.minor) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    };
  }
  var isCompatible = _makeCompatibilityCheck(VERSION);

  // node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
  var major = VERSION.split(".")[0];
  var GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
  var _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  function registerGlobal(type, instance, diag3, allowOverride = false) {
    var _a;
    const api2 = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
      version: VERSION
    };
    if (!allowOverride && api2[type]) {
      const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
      diag3.error(err.stack || err.message);
      return false;
    }
    if (api2.version !== VERSION) {
      const err = new Error(`@opentelemetry/api: Registration of version v${api2.version} for ${type} does not match previously registered API v${VERSION}`);
      diag3.error(err.stack || err.message);
      return false;
    }
    api2[type] = instance;
    diag3.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
    return true;
  }
  function getGlobal(type) {
    var _a, _b;
    const globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
    if (!globalVersion || !isCompatible(globalVersion)) {
      return;
    }
    return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
  }
  function unregisterGlobal(type, diag3) {
    diag3.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
    const api2 = _global[GLOBAL_OPENTELEMETRY_API_KEY];
    if (api2) {
      delete api2[type];
    }
  }

  // node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
  var DiagComponentLogger = class {
    constructor(props) {
      this._namespace = props.namespace || "DiagComponentLogger";
    }
    debug(...args) {
      return logProxy("debug", this._namespace, args);
    }
    error(...args) {
      return logProxy("error", this._namespace, args);
    }
    info(...args) {
      return logProxy("info", this._namespace, args);
    }
    warn(...args) {
      return logProxy("warn", this._namespace, args);
    }
    verbose(...args) {
      return logProxy("verbose", this._namespace, args);
    }
  };
  function logProxy(funcName, namespace, args) {
    const logger2 = getGlobal("diag");
    if (!logger2) {
      return;
    }
    return logger2[funcName](namespace, ...args);
  }

  // node_modules/@opentelemetry/api/build/esm/diag/types.js
  var DiagLogLevel;
  (function(DiagLogLevel2) {
    DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
    DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
    DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
    DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
    DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
    DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
    DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
  })(DiagLogLevel || (DiagLogLevel = {}));

  // node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
  function createLogLevelDiagLogger(maxLevel, logger2) {
    if (maxLevel < DiagLogLevel.NONE) {
      maxLevel = DiagLogLevel.NONE;
    } else if (maxLevel > DiagLogLevel.ALL) {
      maxLevel = DiagLogLevel.ALL;
    }
    logger2 = logger2 || {};
    function _filterFunc(funcName, theLevel) {
      const theFunc = logger2[funcName];
      if (typeof theFunc === "function" && maxLevel >= theLevel) {
        return theFunc.bind(logger2);
      }
      return function() {
      };
    }
    return {
      error: _filterFunc("error", DiagLogLevel.ERROR),
      warn: _filterFunc("warn", DiagLogLevel.WARN),
      info: _filterFunc("info", DiagLogLevel.INFO),
      debug: _filterFunc("debug", DiagLogLevel.DEBUG),
      verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
    };
  }

  // node_modules/@opentelemetry/api/build/esm/api/diag.js
  var API_NAME = "diag";
  var DiagAPI = class _DiagAPI {
    /** Get the singleton instance of the DiagAPI API */
    static instance() {
      if (!this._instance) {
        this._instance = new _DiagAPI();
      }
      return this._instance;
    }
    /**
     * Private internal constructor
     * @private
     */
    constructor() {
      function _logProxy(funcName) {
        return function(...args) {
          const logger2 = getGlobal("diag");
          if (!logger2)
            return;
          return logger2[funcName](...args);
        };
      }
      const self2 = this;
      const setLogger = (logger2, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
        var _a, _b, _c;
        if (logger2 === self2) {
          const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
          self2.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
          return false;
        }
        if (typeof optionsOrLogLevel === "number") {
          optionsOrLogLevel = {
            logLevel: optionsOrLogLevel
          };
        }
        const oldLogger = getGlobal("diag");
        const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger2);
        if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
          const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
          oldLogger.warn(`Current logger will be overwritten from ${stack}`);
          newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
        }
        return registerGlobal("diag", newLogger, self2, true);
      };
      self2.setLogger = setLogger;
      self2.disable = () => {
        unregisterGlobal(API_NAME, self2);
      };
      self2.createComponentLogger = (options) => {
        return new DiagComponentLogger(options);
      };
      self2.verbose = _logProxy("verbose");
      self2.debug = _logProxy("debug");
      self2.info = _logProxy("info");
      self2.warn = _logProxy("warn");
      self2.error = _logProxy("error");
    }
  };

  // node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js
  var BaggageImpl = class _BaggageImpl {
    constructor(entries) {
      this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
    }
    getEntry(key) {
      const entry = this._entries.get(key);
      if (!entry) {
        return void 0;
      }
      return Object.assign({}, entry);
    }
    getAllEntries() {
      return Array.from(this._entries.entries());
    }
    setEntry(key, entry) {
      const newBaggage = new _BaggageImpl(this._entries);
      newBaggage._entries.set(key, entry);
      return newBaggage;
    }
    removeEntry(key) {
      const newBaggage = new _BaggageImpl(this._entries);
      newBaggage._entries.delete(key);
      return newBaggage;
    }
    removeEntries(...keys) {
      const newBaggage = new _BaggageImpl(this._entries);
      for (const key of keys) {
        newBaggage._entries.delete(key);
      }
      return newBaggage;
    }
    clear() {
      return new _BaggageImpl();
    }
  };

  // node_modules/@opentelemetry/api/build/esm/baggage/internal/symbol.js
  var baggageEntryMetadataSymbol = /* @__PURE__ */ Symbol("BaggageEntryMetadata");

  // node_modules/@opentelemetry/api/build/esm/baggage/utils.js
  var diag = DiagAPI.instance();
  function createBaggage(entries = {}) {
    return new BaggageImpl(new Map(Object.entries(entries)));
  }
  function baggageEntryMetadataFromString(str) {
    if (typeof str !== "string") {
      diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
      str = "";
    }
    return {
      __TYPE__: baggageEntryMetadataSymbol,
      toString() {
        return str;
      }
    };
  }

  // node_modules/@opentelemetry/api/build/esm/context/context.js
  function createContextKey(description) {
    return Symbol.for(description);
  }
  var BaseContext = class _BaseContext {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
      const self2 = this;
      self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
      self2.getValue = (key) => self2._currentContext.get(key);
      self2.setValue = (key, value) => {
        const context2 = new _BaseContext(self2._currentContext);
        context2._currentContext.set(key, value);
        return context2;
      };
      self2.deleteValue = (key) => {
        const context2 = new _BaseContext(self2._currentContext);
        context2._currentContext.delete(key);
        return context2;
      };
    }
  };
  var ROOT_CONTEXT = new BaseContext();

  // node_modules/@opentelemetry/api/build/esm/diag/consoleLogger.js
  var consoleMap = [
    { n: "error", c: "error" },
    { n: "warn", c: "warn" },
    { n: "info", c: "info" },
    { n: "debug", c: "debug" },
    { n: "verbose", c: "trace" }
  ];
  var _originalConsoleMethods = {};
  if (typeof console !== "undefined") {
    const keys = [
      "error",
      "warn",
      "info",
      "debug",
      "trace",
      "log"
    ];
    for (const key of keys) {
      if (typeof console[key] === "function") {
        _originalConsoleMethods[key] = console[key];
      }
    }
  }
  var DiagConsoleLogger = class {
    constructor() {
      function _consoleFunc(funcName) {
        return function(...args) {
          let theFunc = _originalConsoleMethods[funcName];
          if (typeof theFunc !== "function") {
            theFunc = _originalConsoleMethods["log"];
          }
          if (typeof theFunc !== "function" && console) {
            theFunc = console[funcName];
            if (typeof theFunc !== "function") {
              theFunc = console.log;
            }
          }
          if (typeof theFunc === "function") {
            return theFunc.apply(console, args);
          }
        };
      }
      for (let i2 = 0; i2 < consoleMap.length; i2++) {
        this[consoleMap[i2].n] = _consoleFunc(consoleMap[i2].c);
      }
    }
  };

  // node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js
  var NoopMeter = class {
    constructor() {
    }
    /**
     * @see {@link Meter.createGauge}
     */
    createGauge(_name, _options) {
      return NOOP_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createHistogram}
     */
    createHistogram(_name, _options) {
      return NOOP_HISTOGRAM_METRIC;
    }
    /**
     * @see {@link Meter.createCounter}
     */
    createCounter(_name, _options) {
      return NOOP_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createUpDownCounter}
     */
    createUpDownCounter(_name, _options) {
      return NOOP_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableGauge}
     */
    createObservableGauge(_name, _options) {
      return NOOP_OBSERVABLE_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createObservableCounter}
     */
    createObservableCounter(_name, _options) {
      return NOOP_OBSERVABLE_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableUpDownCounter}
     */
    createObservableUpDownCounter(_name, _options) {
      return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(_callback, _observables) {
    }
    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(_callback) {
    }
  };
  var NoopMetric = class {
  };
  var NoopCounterMetric = class extends NoopMetric {
    add(_value, _attributes) {
    }
  };
  var NoopUpDownCounterMetric = class extends NoopMetric {
    add(_value, _attributes) {
    }
  };
  var NoopGaugeMetric = class extends NoopMetric {
    record(_value, _attributes) {
    }
  };
  var NoopHistogramMetric = class extends NoopMetric {
    record(_value, _attributes) {
    }
  };
  var NoopObservableMetric = class {
    addCallback(_callback) {
    }
    removeCallback(_callback) {
    }
  };
  var NoopObservableCounterMetric = class extends NoopObservableMetric {
  };
  var NoopObservableGaugeMetric = class extends NoopObservableMetric {
  };
  var NoopObservableUpDownCounterMetric = class extends NoopObservableMetric {
  };
  var NOOP_METER = new NoopMeter();
  var NOOP_COUNTER_METRIC = new NoopCounterMetric();
  var NOOP_GAUGE_METRIC = new NoopGaugeMetric();
  var NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
  var NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
  var NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
  var NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
  var NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
  function createNoopMeter() {
    return NOOP_METER;
  }

  // node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js
  var defaultTextMapGetter = {
    get(carrier, key) {
      if (carrier == null) {
        return void 0;
      }
      return carrier[key];
    },
    keys(carrier) {
      if (carrier == null) {
        return [];
      }
      return Object.keys(carrier);
    }
  };
  var defaultTextMapSetter = {
    set(carrier, key, value) {
      if (carrier == null) {
        return;
      }
      carrier[key] = value;
    }
  };

  // node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
  var NoopContextManager = class {
    active() {
      return ROOT_CONTEXT;
    }
    with(_context, fn, thisArg, ...args) {
      return fn.call(thisArg, ...args);
    }
    bind(_context, target) {
      return target;
    }
    enable() {
      return this;
    }
    disable() {
      return this;
    }
  };

  // node_modules/@opentelemetry/api/build/esm/api/context.js
  var API_NAME2 = "context";
  var NOOP_CONTEXT_MANAGER = new NoopContextManager();
  var ContextAPI = class _ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }
    /** Get the singleton instance of the Context API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _ContextAPI();
      }
      return this._instance;
    }
    /**
     * Set the current context manager.
     *
     * @returns true if the context manager was successfully registered, else false
     */
    setGlobalContextManager(contextManager) {
      return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
    }
    /**
     * Get the currently active context
     */
    active() {
      return this._getContextManager().active();
    }
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context2, fn, thisArg, ...args) {
      return this._getContextManager().with(context2, fn, thisArg, ...args);
    }
    /**
     * Bind a context to a target function or event emitter
     *
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     * @param target function or event emitter to bind
     */
    bind(context2, target) {
      return this._getContextManager().bind(context2, target);
    }
    _getContextManager() {
      return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
    }
    /** Disable and remove the global context manager */
    disable() {
      this._getContextManager().disable();
      unregisterGlobal(API_NAME2, DiagAPI.instance());
    }
  };

  // node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
  var TraceFlags;
  (function(TraceFlags2) {
    TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
    TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
  })(TraceFlags || (TraceFlags = {}));

  // node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js
  var INVALID_SPANID = "0000000000000000";
  var INVALID_TRACEID = "00000000000000000000000000000000";
  var INVALID_SPAN_CONTEXT = {
    traceId: INVALID_TRACEID,
    spanId: INVALID_SPANID,
    traceFlags: TraceFlags.NONE
  };

  // node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
  var NonRecordingSpan = class {
    constructor(spanContext = INVALID_SPAN_CONTEXT) {
      this._spanContext = spanContext;
    }
    // Returns a SpanContext.
    spanContext() {
      return this._spanContext;
    }
    // By default does nothing
    setAttribute(_key, _value) {
      return this;
    }
    // By default does nothing
    setAttributes(_attributes) {
      return this;
    }
    // By default does nothing
    addEvent(_name, _attributes) {
      return this;
    }
    addLink(_link) {
      return this;
    }
    addLinks(_links) {
      return this;
    }
    // By default does nothing
    setStatus(_status) {
      return this;
    }
    // By default does nothing
    updateName(_name) {
      return this;
    }
    // By default does nothing
    end(_endTime) {
    }
    // isRecording always returns false for NonRecordingSpan.
    isRecording() {
      return false;
    }
    // By default does nothing
    recordException(_exception, _time) {
    }
  };

  // node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
  var SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
  function getSpan(context2) {
    return context2.getValue(SPAN_KEY) || void 0;
  }
  function getActiveSpan() {
    return getSpan(ContextAPI.getInstance().active());
  }
  function setSpan(context2, span) {
    return context2.setValue(SPAN_KEY, span);
  }
  function deleteSpan(context2) {
    return context2.deleteValue(SPAN_KEY);
  }
  function setSpanContext(context2, spanContext) {
    return setSpan(context2, new NonRecordingSpan(spanContext));
  }
  function getSpanContext(context2) {
    var _a;
    return (_a = getSpan(context2)) === null || _a === void 0 ? void 0 : _a.spanContext();
  }

  // node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
  var isHex = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1
  ]);
  function isValidHex(id, length) {
    if (typeof id !== "string" || id.length !== length)
      return false;
    let r2 = 0;
    for (let i2 = 0; i2 < id.length; i2 += 4) {
      r2 += (isHex[id.charCodeAt(i2)] | 0) + (isHex[id.charCodeAt(i2 + 1)] | 0) + (isHex[id.charCodeAt(i2 + 2)] | 0) + (isHex[id.charCodeAt(i2 + 3)] | 0);
    }
    return r2 === length;
  }
  function isValidTraceId(traceId) {
    return isValidHex(traceId, 32) && traceId !== INVALID_TRACEID;
  }
  function isValidSpanId(spanId) {
    return isValidHex(spanId, 16) && spanId !== INVALID_SPANID;
  }
  function isSpanContextValid(spanContext) {
    return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
  }
  function wrapSpanContext(spanContext) {
    return new NonRecordingSpan(spanContext);
  }

  // node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
  var contextApi = ContextAPI.getInstance();
  var NoopTracer = class {
    // startSpan starts a noop span.
    startSpan(name, options, context2 = contextApi.active()) {
      const root = Boolean(options === null || options === void 0 ? void 0 : options.root);
      if (root) {
        return new NonRecordingSpan();
      }
      const parentFromContext = context2 && getSpanContext(context2);
      if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
        return new NonRecordingSpan(parentFromContext);
      } else {
        return new NonRecordingSpan();
      }
    }
    startActiveSpan(name, arg2, arg3, arg4) {
      let opts;
      let ctx;
      let fn;
      if (arguments.length < 2) {
        return;
      } else if (arguments.length === 2) {
        fn = arg2;
      } else if (arguments.length === 3) {
        opts = arg2;
        fn = arg3;
      } else {
        opts = arg2;
        ctx = arg3;
        fn = arg4;
      }
      const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
      const span = this.startSpan(name, opts, parentContext);
      const contextWithSpanSet = setSpan(parentContext, span);
      return contextApi.with(contextWithSpanSet, fn, void 0, span);
    }
  };
  function isSpanContext(spanContext) {
    return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
  }

  // node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
  var NOOP_TRACER = new NoopTracer();
  var ProxyTracer = class {
    constructor(provider, name, version, options) {
      this._provider = provider;
      this.name = name;
      this.version = version;
      this.options = options;
    }
    startSpan(name, options, context2) {
      return this._getTracer().startSpan(name, options, context2);
    }
    startActiveSpan(_name, _options, _context, _fn) {
      const tracer = this._getTracer();
      return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
    }
    /**
     * Try to get a tracer from the proxy tracer provider.
     * If the proxy tracer provider has no delegate, return a noop tracer.
     */
    _getTracer() {
      if (this._delegate) {
        return this._delegate;
      }
      const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
      if (!tracer) {
        return NOOP_TRACER;
      }
      this._delegate = tracer;
      return this._delegate;
    }
  };

  // node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
  var NoopTracerProvider = class {
    getTracer(_name, _version, _options) {
      return new NoopTracer();
    }
  };

  // node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
  var NOOP_TRACER_PROVIDER = new NoopTracerProvider();
  var ProxyTracerProvider = class {
    /**
     * Get a {@link ProxyTracer}
     */
    getTracer(name, version, options) {
      var _a;
      return (_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer(this, name, version, options);
    }
    getDelegate() {
      var _a;
      return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
    }
    /**
     * Set the delegate tracer provider
     */
    setDelegate(delegate) {
      this._delegate = delegate;
    }
    getDelegateTracer(name, version, options) {
      var _a;
      return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
    }
  };

  // node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js
  var SamplingDecision;
  (function(SamplingDecision3) {
    SamplingDecision3[SamplingDecision3["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision3[SamplingDecision3["RECORD"] = 1] = "RECORD";
    SamplingDecision3[SamplingDecision3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
  })(SamplingDecision || (SamplingDecision = {}));

  // node_modules/@opentelemetry/api/build/esm/trace/span_kind.js
  var SpanKind;
  (function(SpanKind2) {
    SpanKind2[SpanKind2["INTERNAL"] = 0] = "INTERNAL";
    SpanKind2[SpanKind2["SERVER"] = 1] = "SERVER";
    SpanKind2[SpanKind2["CLIENT"] = 2] = "CLIENT";
    SpanKind2[SpanKind2["PRODUCER"] = 3] = "PRODUCER";
    SpanKind2[SpanKind2["CONSUMER"] = 4] = "CONSUMER";
  })(SpanKind || (SpanKind = {}));

  // node_modules/@opentelemetry/api/build/esm/trace/status.js
  var SpanStatusCode;
  (function(SpanStatusCode2) {
    SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
    SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
    SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
  })(SpanStatusCode || (SpanStatusCode = {}));

  // node_modules/@opentelemetry/api/build/esm/context-api.js
  var context = ContextAPI.getInstance();

  // node_modules/@opentelemetry/api/build/esm/diag-api.js
  var diag2 = DiagAPI.instance();

  // node_modules/@opentelemetry/api/build/esm/metrics/NoopMeterProvider.js
  var NoopMeterProvider = class {
    getMeter(_name, _version, _options) {
      return NOOP_METER;
    }
  };
  var NOOP_METER_PROVIDER = new NoopMeterProvider();

  // node_modules/@opentelemetry/api/build/esm/api/metrics.js
  var API_NAME3 = "metrics";
  var MetricsAPI = class _MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }
    /** Get the singleton instance of the Metrics API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _MetricsAPI();
      }
      return this._instance;
    }
    /**
     * Set the current global meter provider.
     * Returns true if the meter provider was successfully registered, else false.
     */
    setGlobalMeterProvider(provider) {
      return registerGlobal(API_NAME3, provider, DiagAPI.instance());
    }
    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
      return getGlobal(API_NAME3) || NOOP_METER_PROVIDER;
    }
    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version, options) {
      return this.getMeterProvider().getMeter(name, version, options);
    }
    /** Remove the global meter provider */
    disable() {
      unregisterGlobal(API_NAME3, DiagAPI.instance());
    }
  };

  // node_modules/@opentelemetry/api/build/esm/metrics-api.js
  var metrics = MetricsAPI.getInstance();

  // node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js
  var NoopTextMapPropagator = class {
    /** Noop inject function does nothing */
    inject(_context, _carrier) {
    }
    /** Noop extract function does nothing and returns the input context */
    extract(context2, _carrier) {
      return context2;
    }
    fields() {
      return [];
    }
  };

  // node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js
  var BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
  function getBaggage(context2) {
    return context2.getValue(BAGGAGE_KEY) || void 0;
  }
  function getActiveBaggage() {
    return getBaggage(ContextAPI.getInstance().active());
  }
  function setBaggage(context2, baggage) {
    return context2.setValue(BAGGAGE_KEY, baggage);
  }
  function deleteBaggage(context2) {
    return context2.deleteValue(BAGGAGE_KEY);
  }

  // node_modules/@opentelemetry/api/build/esm/api/propagation.js
  var API_NAME4 = "propagation";
  var NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
  var PropagationAPI = class _PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
      this.createBaggage = createBaggage;
      this.getBaggage = getBaggage;
      this.getActiveBaggage = getActiveBaggage;
      this.setBaggage = setBaggage;
      this.deleteBaggage = deleteBaggage;
    }
    /** Get the singleton instance of the Propagator API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _PropagationAPI();
      }
      return this._instance;
    }
    /**
     * Set the current propagator.
     *
     * @returns true if the propagator was successfully registered, else false
     */
    setGlobalPropagator(propagator) {
      return registerGlobal(API_NAME4, propagator, DiagAPI.instance());
    }
    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param context Context carrying tracing data to inject
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     */
    inject(context2, carrier, setter = defaultTextMapSetter) {
      return this._getGlobalPropagator().inject(context2, carrier, setter);
    }
    /**
     * Extract context from a carrier
     *
     * @param context Context which the newly created context will inherit from
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     */
    extract(context2, carrier, getter = defaultTextMapGetter) {
      return this._getGlobalPropagator().extract(context2, carrier, getter);
    }
    /**
     * Return a list of all fields which may be used by the propagator.
     */
    fields() {
      return this._getGlobalPropagator().fields();
    }
    /** Remove the global propagator */
    disable() {
      unregisterGlobal(API_NAME4, DiagAPI.instance());
    }
    _getGlobalPropagator() {
      return getGlobal(API_NAME4) || NOOP_TEXT_MAP_PROPAGATOR;
    }
  };

  // node_modules/@opentelemetry/api/build/esm/propagation-api.js
  var propagation = PropagationAPI.getInstance();

  // node_modules/@opentelemetry/api/build/esm/api/trace.js
  var API_NAME5 = "trace";
  var TraceAPI = class _TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
      this._proxyTracerProvider = new ProxyTracerProvider();
      this.wrapSpanContext = wrapSpanContext;
      this.isSpanContextValid = isSpanContextValid;
      this.deleteSpan = deleteSpan;
      this.getSpan = getSpan;
      this.getActiveSpan = getActiveSpan;
      this.getSpanContext = getSpanContext;
      this.setSpan = setSpan;
      this.setSpanContext = setSpanContext;
    }
    /** Get the singleton instance of the Trace API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new _TraceAPI();
      }
      return this._instance;
    }
    /**
     * Set the current global tracer.
     *
     * @returns true if the tracer provider was successfully registered, else false
     */
    setGlobalTracerProvider(provider) {
      const success = registerGlobal(API_NAME5, this._proxyTracerProvider, DiagAPI.instance());
      if (success) {
        this._proxyTracerProvider.setDelegate(provider);
      }
      return success;
    }
    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
      return getGlobal(API_NAME5) || this._proxyTracerProvider;
    }
    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version) {
      return this.getTracerProvider().getTracer(name, version);
    }
    /** Remove the global tracer provider */
    disable() {
      unregisterGlobal(API_NAME5, DiagAPI.instance());
      this._proxyTracerProvider = new ProxyTracerProvider();
    }
  };

  // node_modules/@opentelemetry/api/build/esm/trace-api.js
  var trace = TraceAPI.getInstance();

  // node_modules/@opentelemetry/api-logs/build/esm/types/LogRecord.js
  var SeverityNumber;
  (function(SeverityNumber2) {
    SeverityNumber2[SeverityNumber2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    SeverityNumber2[SeverityNumber2["TRACE"] = 1] = "TRACE";
    SeverityNumber2[SeverityNumber2["TRACE2"] = 2] = "TRACE2";
    SeverityNumber2[SeverityNumber2["TRACE3"] = 3] = "TRACE3";
    SeverityNumber2[SeverityNumber2["TRACE4"] = 4] = "TRACE4";
    SeverityNumber2[SeverityNumber2["DEBUG"] = 5] = "DEBUG";
    SeverityNumber2[SeverityNumber2["DEBUG2"] = 6] = "DEBUG2";
    SeverityNumber2[SeverityNumber2["DEBUG3"] = 7] = "DEBUG3";
    SeverityNumber2[SeverityNumber2["DEBUG4"] = 8] = "DEBUG4";
    SeverityNumber2[SeverityNumber2["INFO"] = 9] = "INFO";
    SeverityNumber2[SeverityNumber2["INFO2"] = 10] = "INFO2";
    SeverityNumber2[SeverityNumber2["INFO3"] = 11] = "INFO3";
    SeverityNumber2[SeverityNumber2["INFO4"] = 12] = "INFO4";
    SeverityNumber2[SeverityNumber2["WARN"] = 13] = "WARN";
    SeverityNumber2[SeverityNumber2["WARN2"] = 14] = "WARN2";
    SeverityNumber2[SeverityNumber2["WARN3"] = 15] = "WARN3";
    SeverityNumber2[SeverityNumber2["WARN4"] = 16] = "WARN4";
    SeverityNumber2[SeverityNumber2["ERROR"] = 17] = "ERROR";
    SeverityNumber2[SeverityNumber2["ERROR2"] = 18] = "ERROR2";
    SeverityNumber2[SeverityNumber2["ERROR3"] = 19] = "ERROR3";
    SeverityNumber2[SeverityNumber2["ERROR4"] = 20] = "ERROR4";
    SeverityNumber2[SeverityNumber2["FATAL"] = 21] = "FATAL";
    SeverityNumber2[SeverityNumber2["FATAL2"] = 22] = "FATAL2";
    SeverityNumber2[SeverityNumber2["FATAL3"] = 23] = "FATAL3";
    SeverityNumber2[SeverityNumber2["FATAL4"] = 24] = "FATAL4";
  })(SeverityNumber || (SeverityNumber = {}));

  // node_modules/@opentelemetry/api-logs/build/esm/NoopLogger.js
  var NoopLogger = class {
    emit(_logRecord) {
    }
    enabled() {
      return false;
    }
  };
  var NOOP_LOGGER = new NoopLogger();
  function createNoopLogger() {
    return NOOP_LOGGER;
  }

  // node_modules/@opentelemetry/api-logs/build/esm/internal/global-utils.js
  var GLOBAL_LOGS_API_KEY = /* @__PURE__ */ Symbol.for("io.opentelemetry.js.api.logs");
  var _global2 = globalThis;
  function makeGetter(requiredVersion, instance, fallback) {
    return (version) => version === requiredVersion ? instance : fallback;
  }
  var API_BACKWARDS_COMPATIBILITY_VERSION = 1;

  // node_modules/@opentelemetry/api-logs/build/esm/NoopLoggerProvider.js
  var NoopLoggerProvider = class {
    getLogger(_name, _version, _options) {
      return new NoopLogger();
    }
  };
  var NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();

  // node_modules/@opentelemetry/api-logs/build/esm/ProxyLogger.js
  var ProxyLogger = class {
    constructor(provider, name, version, options) {
      this._provider = provider;
      this.name = name;
      this.version = version;
      this.options = options;
    }
    /**
     * Emit a log record. This method should only be used by log appenders.
     *
     * @param logRecord
     */
    emit(logRecord) {
      this._getLogger().emit(logRecord);
    }
    enabled(options) {
      return this._getLogger().enabled(options);
    }
    /**
     * Try to get a logger from the proxy logger provider.
     * If the proxy logger provider has no delegate, return a noop logger.
     */
    _getLogger() {
      if (this._delegate) {
        return this._delegate;
      }
      const logger2 = this._provider._getDelegateLogger(this.name, this.version, this.options);
      if (!logger2) {
        return NOOP_LOGGER;
      }
      this._delegate = logger2;
      return this._delegate;
    }
  };

  // node_modules/@opentelemetry/api-logs/build/esm/ProxyLoggerProvider.js
  var ProxyLoggerProvider = class {
    getLogger(name, version, options) {
      var _a;
      return (_a = this._getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger(this, name, version, options);
    }
    /**
     * Get the delegate logger provider.
     * Used by tests only.
     * @internal
     */
    _getDelegate() {
      var _a;
      return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER;
    }
    /**
     * Set the delegate logger provider
     * @internal
     */
    _setDelegate(delegate) {
      this._delegate = delegate;
    }
    /**
     * @internal
     */
    _getDelegateLogger(name, version, options) {
      var _a;
      return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
    }
  };

  // node_modules/@opentelemetry/api-logs/build/esm/api/logs.js
  var LogsAPI = class _LogsAPI {
    constructor() {
      this._proxyLoggerProvider = new ProxyLoggerProvider();
    }
    static getInstance() {
      if (!this._instance) {
        this._instance = new _LogsAPI();
      }
      return this._instance;
    }
    setGlobalLoggerProvider(provider) {
      if (_global2[GLOBAL_LOGS_API_KEY]) {
        return this.getLoggerProvider();
      }
      _global2[GLOBAL_LOGS_API_KEY] = makeGetter(API_BACKWARDS_COMPATIBILITY_VERSION, provider, NOOP_LOGGER_PROVIDER);
      this._proxyLoggerProvider._setDelegate(provider);
      return provider;
    }
    /**
     * Returns the global logger provider.
     *
     * @returns LoggerProvider
     */
    getLoggerProvider() {
      var _a, _b;
      return (_b = (_a = _global2[GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(_global2, API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
    }
    /**
     * Returns a Logger, creating one if one with the given name, version,
     * schemaUrl, and attributes is not already created.
     *
     * Getting a Logger may be expensive, especially when `attributes` are
     * provided. Reuse Logger instances where possible instead of calling
     * `getLogger()` on hot paths.
     *
     * @param name The name of the logger or instrumentation library.
     * @param version The version of the logger or instrumentation library.
     * @param options The options of the logger or instrumentation library.
     * @returns {@link Logger}
     */
    getLogger(name, version, options) {
      return this.getLoggerProvider().getLogger(name, version, options);
    }
    /** Remove the global logger provider */
    disable() {
      delete _global2[GLOBAL_LOGS_API_KEY];
      this._proxyLoggerProvider = new ProxyLoggerProvider();
    }
  };

  // node_modules/@opentelemetry/api-logs/build/esm/index.js
  var logs = LogsAPI.getInstance();

  // node_modules/@opentelemetry/context-zone-peer-dep/build/esm/util.js
  function isListenerObject(obj) {
    return typeof obj === "object" && obj !== null && "addEventListener" in obj && typeof obj.addEventListener === "function" && "removeEventListener" in obj && typeof obj.removeEventListener === "function";
  }

  // node_modules/@opentelemetry/context-zone-peer-dep/build/esm/ZoneContextManager.js
  var ZONE_CONTEXT_KEY = "OT_ZONE_CONTEXT";
  var ZoneContextManager = class {
    constructor() {
      /**
       * whether the context manager is enabled or not
       */
      __publicField(this, "_enabled", false);
    }
    /**
     * @param context A context (span) to be executed within target function
     * @param target Function to be executed within the context
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    _bindFunction(context2, target) {
      const manager = this;
      const contextWrapper = function(...args) {
        return manager.with(context2, () => target.apply(this, args));
      };
      Object.defineProperty(contextWrapper, "length", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: target.length
      });
      return contextWrapper;
    }
    /**
     * @param context A context (span) to be bind to target
     * @param obj target object on which the listeners will be patched
     */
    _bindListener(context2, obj) {
      const target = obj;
      if (target.__ot_listeners !== void 0) {
        return obj;
      }
      target.__ot_listeners = {};
      if (typeof target.addEventListener === "function") {
        target.addEventListener = this._patchAddEventListener(target, target.addEventListener, context2);
      }
      if (typeof target.removeEventListener === "function") {
        target.removeEventListener = this._patchRemoveEventListener(target, target.removeEventListener);
      }
      return obj;
    }
    /**
     * Creates a new zone
     * @param zoneName zone name
     * @param context A context (span) to be bind with Zone
     */
    _createZone(zoneName, context2) {
      return Zone.current.fork({
        name: zoneName,
        properties: {
          [ZONE_CONTEXT_KEY]: context2
        },
        onCancelTask(parentZoneDelegate, currentZone, targetZone, task) {
          if (task.state === "notScheduled" || task.state === "running") {
            return task;
          }
          return parentZoneDelegate.cancelTask(targetZone, task);
        }
      });
    }
    /**
     * Patches addEventListener method
     * @param target any target that has "addEventListener" method
     * @param original reference to the patched method
     * @param [context] context to be bind to the listener
     */
    _patchAddEventListener(target, original, context2) {
      const contextManager = this;
      return function(event, listener, opts) {
        if (target.__ot_listeners === void 0) {
          target.__ot_listeners = {};
        }
        let listeners = target.__ot_listeners[event];
        if (listeners === void 0) {
          listeners = /* @__PURE__ */ new WeakMap();
          target.__ot_listeners[event] = listeners;
        }
        const patchedListener = contextManager.bind(context2, listener);
        listeners.set(listener, patchedListener);
        return original.call(this, event, patchedListener, opts);
      };
    }
    /**
     * Patches removeEventListener method
     * @param target any target that has "removeEventListener" method
     * @param original reference to the patched method
     */
    _patchRemoveEventListener(target, original) {
      return function(event, listener) {
        if (target.__ot_listeners === void 0 || target.__ot_listeners[event] === void 0) {
          return original.call(this, event, listener);
        }
        const events = target.__ot_listeners[event];
        const patchedListener = events.get(listener);
        events.delete(listener);
        return original.call(this, event, patchedListener || listener);
      };
    }
    /**
     * Returns the active context
     */
    active() {
      if (!this._enabled || !Zone.current) {
        return ROOT_CONTEXT;
      }
      return Zone.current.get(ZONE_CONTEXT_KEY) || ROOT_CONTEXT;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function or event emitter. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */
    bind(context2, target) {
      if (typeof target === "function") {
        return this._bindFunction(context2, target);
      } else if (isListenerObject(target)) {
        this._bindListener(context2, target);
      }
      return target;
    }
    /**
     * Disable the context manager (clears all the contexts)
     */
    disable() {
      this._enabled = false;
      return this;
    }
    /**
     * Enables the context manager and creates a default(root) context
     */
    enable() {
      this._enabled = true;
      return this;
    }
    /**
     * Calls the callback function [fn] with the provided [context].
     *     If [context] is undefined then it will use the active context.
     *     The context will be set as active
     * @param context A context (span) to be called with provided callback
     * @param fn Callback function
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context2, fn, thisArg, ...args) {
      let zoneName = "otel:with";
      if (fn.name) {
        zoneName += `:${fn.name}`;
      }
      return this._createZone(zoneName, context2).run(fn, thisArg, args);
    }
  };

  // node_modules/zone.js/fesm2015/zone.js
  var __defProp2 = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 || (b2 = {}))
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp2(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp2(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __publicField2 = (obj, key, value) => {
    __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  var global2 = globalThis;
  function __symbol__(name) {
    const rawPrefix = global2["__Zone_symbol_prefix"];
    const symbolPrefix = typeof rawPrefix === "string" ? rawPrefix : "__zone_symbol__";
    return symbolPrefix + name;
  }
  function initZone() {
    const performance2 = global2["performance"];
    function mark(name) {
      performance2 && performance2["mark"] && performance2["mark"](name);
    }
    function performanceMeasure(name, label) {
      performance2 && performance2["measure"] && performance2["measure"](name, label);
    }
    mark("Zone");
    const _ZoneImpl = class _ZoneImpl2 {
      constructor(parent, zoneSpec) {
        __publicField2(this, "_parent");
        __publicField2(this, "_name");
        __publicField2(this, "_properties");
        __publicField2(this, "_zoneDelegate");
        this._parent = parent;
        this._name = zoneSpec ? zoneSpec.name || "unnamed" : "<root>";
        this._properties = zoneSpec && zoneSpec.properties || {};
        this._zoneDelegate = new _ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
      }
      static assertZonePatched() {
        if (global2["Promise"] !== patches["ZoneAwarePromise"]) {
          throw new Error("Zone.js has detected that ZoneAwarePromise `(window|global).Promise` has been overwritten.\nMost likely cause is that a Promise polyfill has been loaded after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. If you must load one, do so before loading zone.js.)");
        }
      }
      static get root() {
        let zone = _ZoneImpl2.current;
        while (zone.parent) {
          zone = zone.parent;
        }
        return zone;
      }
      static get current() {
        return _currentZoneFrame.zone;
      }
      static get currentTask() {
        return _currentTask;
      }
      static __load_patch(name, fn, ignoreDuplicate = false) {
        if (Object.hasOwn(patches, name)) {
          const checkDuplicate = global2[__symbol__("forceDuplicateZoneCheck")] === true;
          if (!ignoreDuplicate && checkDuplicate) {
            throw Error("Already loaded patch: " + name);
          }
        } else if (!global2["__Zone_disable_" + name]) {
          const perfName = "Zone:" + name;
          mark(perfName);
          patches[name] = fn(global2, _ZoneImpl2, _api);
          performanceMeasure(perfName, perfName);
        }
      }
      get parent() {
        return this._parent;
      }
      get name() {
        return this._name;
      }
      get(key) {
        const zone = this.getZoneWith(key);
        if (zone)
          return zone._properties[key];
      }
      getZoneWith(key) {
        let current = this;
        while (current) {
          if (Object.hasOwn(current._properties, key)) {
            return current;
          }
          current = current._parent;
        }
        return null;
      }
      fork(zoneSpec) {
        if (!zoneSpec)
          throw new Error("ZoneSpec required!");
        return this._zoneDelegate.fork(this, zoneSpec);
      }
      wrap(callback, source) {
        if (typeof callback !== "function") {
          throw new Error("Expecting function got: " + callback);
        }
        const _callback = this._zoneDelegate.intercept(this, callback, source);
        const zone = this;
        return function() {
          return zone.runGuarded(_callback, this, arguments, source);
        };
      }
      run(callback, applyThis, applyArgs, source) {
        _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
        try {
          return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
        } finally {
          _currentZoneFrame = _currentZoneFrame.parent;
        }
      }
      runGuarded(callback, applyThis = null, applyArgs, source) {
        _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
        try {
          try {
            return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
          } catch (error) {
            if (this._zoneDelegate.handleError(this, error)) {
              throw error;
            }
          }
        } finally {
          _currentZoneFrame = _currentZoneFrame.parent;
        }
      }
      runTask(task, applyThis, applyArgs) {
        if (task.zone != this) {
          throw new Error("A task can only be run in the zone of creation! (Creation: " + (task.zone || NO_ZONE).name + "; Execution: " + this.name + ")");
        }
        const zoneTask = task;
        const { type, data: { isPeriodic = false, isRefreshable = false } = {} } = task;
        if (task.state === notScheduled && (type === eventTask || type === macroTask)) {
          return;
        }
        const reEntryGuard = task.state != running;
        reEntryGuard && zoneTask._transitionTo(running, scheduled);
        const previousTask = _currentTask;
        _currentTask = zoneTask;
        _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
        try {
          if (type == macroTask && task.data && !isPeriodic && !isRefreshable) {
            task.cancelFn = void 0;
          }
          try {
            return this._zoneDelegate.invokeTask(this, zoneTask, applyThis, applyArgs);
          } catch (error) {
            if (this._zoneDelegate.handleError(this, error)) {
              throw error;
            }
          }
        } finally {
          const state = task.state;
          if (state !== notScheduled && state !== unknown) {
            if (type == eventTask || isPeriodic || isRefreshable && state === scheduling) {
              reEntryGuard && zoneTask._transitionTo(scheduled, running, scheduling);
            } else {
              const zoneDelegates = zoneTask._zoneDelegates;
              this._updateTaskCount(zoneTask, -1);
              reEntryGuard && zoneTask._transitionTo(notScheduled, running, notScheduled);
              if (isRefreshable) {
                zoneTask._zoneDelegates = zoneDelegates;
              }
            }
          }
          _currentZoneFrame = _currentZoneFrame.parent;
          _currentTask = previousTask;
        }
      }
      scheduleTask(task) {
        if (task.zone && task.zone !== this) {
          let newZone = this;
          while (newZone) {
            if (newZone === task.zone) {
              throw Error(`can not reschedule task to ${this.name} which is descendants of the original zone ${task.zone.name}`);
            }
            newZone = newZone.parent;
          }
        }
        task._transitionTo(scheduling, notScheduled);
        const zoneDelegates = [];
        task._zoneDelegates = zoneDelegates;
        task._zone = this;
        try {
          task = this._zoneDelegate.scheduleTask(this, task);
        } catch (err) {
          task._transitionTo(unknown, scheduling, notScheduled);
          this._zoneDelegate.handleError(this, err);
          throw err;
        }
        if (task._zoneDelegates === zoneDelegates) {
          this._updateTaskCount(task, 1);
        }
        if (task.state == scheduling) {
          task._transitionTo(scheduled, scheduling);
        }
        return task;
      }
      scheduleMicroTask(source, callback, data, customSchedule) {
        return this.scheduleTask(new ZoneTask(microTask, source, callback, data, customSchedule, void 0));
      }
      scheduleMacroTask(source, callback, data, customSchedule, customCancel) {
        return this.scheduleTask(new ZoneTask(macroTask, source, callback, data, customSchedule, customCancel));
      }
      scheduleEventTask(source, callback, data, customSchedule, customCancel) {
        return this.scheduleTask(new ZoneTask(eventTask, source, callback, data, customSchedule, customCancel));
      }
      cancelTask(task) {
        if (task.zone != this)
          throw new Error("A task can only be cancelled in the zone of creation! (Creation: " + (task.zone || NO_ZONE).name + "; Execution: " + this.name + ")");
        if (task.state !== scheduled && task.state !== running) {
          return;
        }
        task._transitionTo(canceling, scheduled, running);
        try {
          this._zoneDelegate.cancelTask(this, task);
        } catch (err) {
          task._transitionTo(unknown, canceling);
          this._zoneDelegate.handleError(this, err);
          throw err;
        }
        this._updateTaskCount(task, -1);
        task._transitionTo(notScheduled, canceling);
        task.runCount = -1;
        return task;
      }
      _updateTaskCount(task, count) {
        const zoneDelegates = task._zoneDelegates;
        if (count == -1) {
          task._zoneDelegates = null;
        }
        for (let i2 = 0; i2 < zoneDelegates.length; i2++) {
          zoneDelegates[i2]._updateTaskCount(task.type, count);
        }
      }
    };
    __publicField2(_ZoneImpl, "__symbol__", __symbol__);
    let ZoneImpl = _ZoneImpl;
    const DELEGATE_ZS = {
      name: "",
      onHasTask: (delegate, _2, target, hasTaskState) => delegate.hasTask(target, hasTaskState),
      onScheduleTask: (delegate, _2, target, task) => delegate.scheduleTask(target, task),
      onInvokeTask: (delegate, _2, target, task, applyThis, applyArgs) => delegate.invokeTask(target, task, applyThis, applyArgs),
      onCancelTask: (delegate, _2, target, task) => delegate.cancelTask(target, task)
    };
    class _ZoneDelegate {
      constructor(zone, parentDelegate, zoneSpec) {
        __publicField2(this, "_zone");
        __publicField2(this, "_taskCounts", {
          "microTask": 0,
          "macroTask": 0,
          "eventTask": 0
        });
        __publicField2(this, "_forkDlgt");
        __publicField2(this, "_forkZS");
        __publicField2(this, "_forkCurrZone");
        __publicField2(this, "_interceptDlgt");
        __publicField2(this, "_interceptZS");
        __publicField2(this, "_interceptCurrZone");
        __publicField2(this, "_invokeDlgt");
        __publicField2(this, "_invokeZS");
        __publicField2(this, "_invokeCurrZone");
        __publicField2(this, "_handleErrorDlgt");
        __publicField2(this, "_handleErrorZS");
        __publicField2(this, "_handleErrorCurrZone");
        __publicField2(this, "_scheduleTaskDlgt");
        __publicField2(this, "_scheduleTaskZS");
        __publicField2(this, "_scheduleTaskCurrZone");
        __publicField2(this, "_invokeTaskDlgt");
        __publicField2(this, "_invokeTaskZS");
        __publicField2(this, "_invokeTaskCurrZone");
        __publicField2(this, "_cancelTaskDlgt");
        __publicField2(this, "_cancelTaskZS");
        __publicField2(this, "_cancelTaskCurrZone");
        __publicField2(this, "_hasTaskDlgt");
        __publicField2(this, "_hasTaskDlgtOwner");
        __publicField2(this, "_hasTaskZS");
        __publicField2(this, "_hasTaskCurrZone");
        this._zone = zone;
        this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
        this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
        this._forkCurrZone = zoneSpec && (zoneSpec.onFork ? this._zone : parentDelegate._forkCurrZone);
        this._interceptZS = zoneSpec && (zoneSpec.onIntercept ? zoneSpec : parentDelegate._interceptZS);
        this._interceptDlgt = zoneSpec && (zoneSpec.onIntercept ? parentDelegate : parentDelegate._interceptDlgt);
        this._interceptCurrZone = zoneSpec && (zoneSpec.onIntercept ? this._zone : parentDelegate._interceptCurrZone);
        this._invokeZS = zoneSpec && (zoneSpec.onInvoke ? zoneSpec : parentDelegate._invokeZS);
        this._invokeDlgt = zoneSpec && (zoneSpec.onInvoke ? parentDelegate : parentDelegate._invokeDlgt);
        this._invokeCurrZone = zoneSpec && (zoneSpec.onInvoke ? this._zone : parentDelegate._invokeCurrZone);
        this._handleErrorZS = zoneSpec && (zoneSpec.onHandleError ? zoneSpec : parentDelegate._handleErrorZS);
        this._handleErrorDlgt = zoneSpec && (zoneSpec.onHandleError ? parentDelegate : parentDelegate._handleErrorDlgt);
        this._handleErrorCurrZone = zoneSpec && (zoneSpec.onHandleError ? this._zone : parentDelegate._handleErrorCurrZone);
        this._scheduleTaskZS = zoneSpec && (zoneSpec.onScheduleTask ? zoneSpec : parentDelegate._scheduleTaskZS);
        this._scheduleTaskDlgt = zoneSpec && (zoneSpec.onScheduleTask ? parentDelegate : parentDelegate._scheduleTaskDlgt);
        this._scheduleTaskCurrZone = zoneSpec && (zoneSpec.onScheduleTask ? this._zone : parentDelegate._scheduleTaskCurrZone);
        this._invokeTaskZS = zoneSpec && (zoneSpec.onInvokeTask ? zoneSpec : parentDelegate._invokeTaskZS);
        this._invokeTaskDlgt = zoneSpec && (zoneSpec.onInvokeTask ? parentDelegate : parentDelegate._invokeTaskDlgt);
        this._invokeTaskCurrZone = zoneSpec && (zoneSpec.onInvokeTask ? this._zone : parentDelegate._invokeTaskCurrZone);
        this._cancelTaskZS = zoneSpec && (zoneSpec.onCancelTask ? zoneSpec : parentDelegate._cancelTaskZS);
        this._cancelTaskDlgt = zoneSpec && (zoneSpec.onCancelTask ? parentDelegate : parentDelegate._cancelTaskDlgt);
        this._cancelTaskCurrZone = zoneSpec && (zoneSpec.onCancelTask ? this._zone : parentDelegate._cancelTaskCurrZone);
        this._hasTaskZS = null;
        this._hasTaskDlgt = null;
        this._hasTaskDlgtOwner = null;
        this._hasTaskCurrZone = null;
        const zoneSpecHasTask = zoneSpec && zoneSpec.onHasTask;
        const parentHasTask = parentDelegate && parentDelegate._hasTaskZS;
        if (zoneSpecHasTask || parentHasTask) {
          this._hasTaskZS = zoneSpecHasTask ? zoneSpec : DELEGATE_ZS;
          this._hasTaskDlgt = parentDelegate;
          this._hasTaskDlgtOwner = this;
          this._hasTaskCurrZone = this._zone;
          if (!zoneSpec.onScheduleTask) {
            this._scheduleTaskZS = DELEGATE_ZS;
            this._scheduleTaskDlgt = parentDelegate;
            this._scheduleTaskCurrZone = this._zone;
          }
          if (!zoneSpec.onInvokeTask) {
            this._invokeTaskZS = DELEGATE_ZS;
            this._invokeTaskDlgt = parentDelegate;
            this._invokeTaskCurrZone = this._zone;
          }
          if (!zoneSpec.onCancelTask) {
            this._cancelTaskZS = DELEGATE_ZS;
            this._cancelTaskDlgt = parentDelegate;
            this._cancelTaskCurrZone = this._zone;
          }
        }
      }
      get zone() {
        return this._zone;
      }
      fork(targetZone, zoneSpec) {
        return this._forkZS ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec) : new ZoneImpl(targetZone, zoneSpec);
      }
      intercept(targetZone, callback, source) {
        return this._interceptZS ? this._interceptZS.onIntercept(this._interceptDlgt, this._interceptCurrZone, targetZone, callback, source) : callback;
      }
      invoke(targetZone, callback, applyThis, applyArgs, source) {
        return this._invokeZS ? this._invokeZS.onInvoke(this._invokeDlgt, this._invokeCurrZone, targetZone, callback, applyThis, applyArgs, source) : callback.apply(applyThis, applyArgs);
      }
      handleError(targetZone, error) {
        return this._handleErrorZS ? this._handleErrorZS.onHandleError(this._handleErrorDlgt, this._handleErrorCurrZone, targetZone, error) : true;
      }
      scheduleTask(targetZone, task) {
        let returnTask = task;
        if (this._scheduleTaskZS) {
          if (this._hasTaskZS) {
            returnTask._zoneDelegates.push(this._hasTaskDlgtOwner);
          }
          returnTask = this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt, this._scheduleTaskCurrZone, targetZone, task);
          if (!returnTask)
            returnTask = task;
        } else {
          if (task.scheduleFn) {
            task.scheduleFn(task);
          } else if (task.type == microTask) {
            scheduleMicroTask(task);
          } else {
            throw new Error("Task is missing scheduleFn.");
          }
        }
        return returnTask;
      }
      invokeTask(targetZone, task, applyThis, applyArgs) {
        return this._invokeTaskZS ? this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis, applyArgs) : task.callback.apply(applyThis, applyArgs);
      }
      cancelTask(targetZone, task) {
        let value;
        if (this._cancelTaskZS) {
          value = this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt, this._cancelTaskCurrZone, targetZone, task);
        } else {
          if (!task.cancelFn) {
            throw Error("Task is not cancelable");
          }
          value = task.cancelFn(task);
        }
        return value;
      }
      hasTask(targetZone, isEmpty) {
        try {
          this._hasTaskZS && this._hasTaskZS.onHasTask(this._hasTaskDlgt, this._hasTaskCurrZone, targetZone, isEmpty);
        } catch (err) {
          this.handleError(targetZone, err);
        }
      }
      _updateTaskCount(type, count) {
        const counts = this._taskCounts;
        const prev = counts[type];
        const next = counts[type] = prev + count;
        if (next < 0) {
          throw new Error("More tasks executed then were scheduled.");
        }
        if (prev == 0 || next == 0) {
          const isEmpty = {
            microTask: counts["microTask"] > 0,
            macroTask: counts["macroTask"] > 0,
            eventTask: counts["eventTask"] > 0,
            change: type
          };
          this.hasTask(this._zone, isEmpty);
        }
      }
    }
    class ZoneTask {
      constructor(type, source, callback, options, scheduleFn, cancelFn) {
        __publicField2(this, "type");
        __publicField2(this, "source");
        __publicField2(this, "invoke");
        __publicField2(this, "callback");
        __publicField2(this, "data");
        __publicField2(this, "scheduleFn");
        __publicField2(this, "cancelFn");
        __publicField2(this, "_zone", null);
        __publicField2(this, "runCount", 0);
        __publicField2(this, "_zoneDelegates", null);
        __publicField2(this, "_state", "notScheduled");
        this.type = type;
        this.source = source;
        this.data = options;
        this.scheduleFn = scheduleFn;
        this.cancelFn = cancelFn;
        if (!callback) {
          throw new Error("callback is not defined");
        }
        this.callback = callback;
        const self2 = this;
        if (type === eventTask && options && options.useG) {
          this.invoke = ZoneTask.invokeTask;
        } else {
          this.invoke = function() {
            return ZoneTask.invokeTask.call(global2, self2, this, arguments);
          };
        }
      }
      static invokeTask(task, target, args) {
        if (!task) {
          task = this;
        }
        _numberOfNestedTaskFrames++;
        try {
          task.runCount++;
          return task.zone.runTask(task, target, args);
        } finally {
          try {
            if (_numberOfNestedTaskFrames === 1 && !global2[enableNativeMicrotaskDraining]) {
              drainMicroTaskQueueSynchronously();
            }
          } finally {
            _numberOfNestedTaskFrames--;
          }
        }
      }
      get zone() {
        return this._zone;
      }
      get state() {
        return this._state;
      }
      cancelScheduleRequest() {
        this._transitionTo(notScheduled, scheduling);
      }
      _transitionTo(toState, fromState1, fromState2) {
        if (this._state === fromState1 || this._state === fromState2) {
          this._state = toState;
          if (toState == notScheduled) {
            this._zoneDelegates = null;
          }
        } else {
          throw new Error(`${this.type} '${this.source}': can not transition to '${toState}', expecting state '${fromState1}'${fromState2 ? " or '" + fromState2 + "'" : ""}, was '${this._state}'.`);
        }
      }
      toString() {
        if (this.data && typeof this.data.handleId !== "undefined") {
          return this.data.handleId.toString();
        } else {
          return Object.prototype.toString.call(this);
        }
      }
      // add toJSON method to prevent cyclic error when
      // call JSON.stringify(zoneTask)
      toJSON() {
        return {
          type: this.type,
          state: this.state,
          source: this.source,
          zone: this.zone.name,
          runCount: this.runCount
        };
      }
    }
    const symbolSetTimeout = __symbol__("setTimeout");
    const symbolPromise = __symbol__("Promise");
    const symbolThen = __symbol__("then");
    const enableNativeMicrotaskDraining = __symbol__("enable_native_microtask_draining");
    let _microTaskQueue = [];
    let _isDrainingMicrotaskQueue = false;
    let nativeMicroTaskQueuePromise;
    function nativeScheduleMicroTask(func) {
      var _a;
      if (!nativeMicroTaskQueuePromise && global2[symbolPromise]) {
        nativeMicroTaskQueuePromise = global2[symbolPromise].resolve(0);
      }
      if (nativeMicroTaskQueuePromise) {
        const thenFn = (_a = nativeMicroTaskQueuePromise[symbolThen]) != null ? _a : nativeMicroTaskQueuePromise["then"];
        thenFn.call(nativeMicroTaskQueuePromise, func);
      } else {
        global2[symbolSetTimeout](func, 0);
      }
    }
    function scheduleMicroTask(task) {
      const isNativeDrainingEnabled = global2[enableNativeMicrotaskDraining];
      const shouldDrainWithNative = isNativeDrainingEnabled && _microTaskQueue.length === 0 && !_isDrainingMicrotaskQueue;
      const shouldDrainWithoutNative = !isNativeDrainingEnabled && _numberOfNestedTaskFrames === 0 && _microTaskQueue.length === 0;
      if (shouldDrainWithNative || shouldDrainWithoutNative) {
        nativeScheduleMicroTask(drainMicroTaskQueueSynchronously);
      }
      if (task) {
        _microTaskQueue.push(task);
      }
    }
    function drainMicroTaskQueueSynchronously() {
      if (_isDrainingMicrotaskQueue) {
        return;
      }
      _isDrainingMicrotaskQueue = true;
      try {
        while (_microTaskQueue.length) {
          const queue = _microTaskQueue;
          _microTaskQueue = [];
          for (const task of queue) {
            try {
              task.zone.runTask(task, null, null);
            } catch (error) {
              _api.onUnhandledError(error);
            }
          }
        }
      } finally {
        if (global2[enableNativeMicrotaskDraining]) {
          _isDrainingMicrotaskQueue = false;
          _api.microtaskDrainDone();
        } else {
          try {
            _api.microtaskDrainDone();
          } finally {
            _isDrainingMicrotaskQueue = false;
          }
        }
      }
    }
    const NO_ZONE = { name: "NO ZONE" };
    const notScheduled = "notScheduled", scheduling = "scheduling", scheduled = "scheduled", running = "running", canceling = "canceling", unknown = "unknown";
    const microTask = "microTask", macroTask = "macroTask", eventTask = "eventTask";
    const patches = /* @__PURE__ */ Object.create(null);
    const _api = {
      symbol: __symbol__,
      currentZoneFrame: () => _currentZoneFrame,
      onUnhandledError: noop,
      microtaskDrainDone: noop,
      scheduleMicroTask,
      showUncaughtError: () => !ZoneImpl[__symbol__("ignoreConsoleErrorUncaughtError")],
      patchEventTarget: () => [],
      patchOnProperties: noop,
      patchMethod: () => noop,
      bindArguments: () => [],
      patchThen: () => noop,
      patchMacroTask: () => noop,
      patchEventPrototype: () => noop,
      getGlobalObjects: () => void 0,
      ObjectDefineProperty: () => noop,
      ObjectGetOwnPropertyDescriptor: () => void 0,
      ObjectCreate: () => void 0,
      ArraySlice: () => [],
      patchClass: () => noop,
      wrapWithCurrentZone: () => noop,
      filterProperties: () => [],
      attachOriginToPatched: () => noop,
      _redefineProperty: () => noop,
      patchCallbacks: () => noop,
      nativeScheduleMicroTask
    };
    let _currentZoneFrame = { parent: null, zone: new ZoneImpl(null, null) };
    let _currentTask = null;
    let _numberOfNestedTaskFrames = 0;
    function noop() {
    }
    performanceMeasure("Zone", "Zone");
    return ZoneImpl;
  }
  function loadZone() {
    var _a;
    const global22 = globalThis;
    const checkDuplicate = global22[__symbol__("forceDuplicateZoneCheck")] === true;
    if (global22["Zone"] && (checkDuplicate || typeof global22["Zone"].__symbol__ !== "function")) {
      throw new Error("Zone already loaded.");
    }
    (_a = global22["Zone"]) != null ? _a : global22["Zone"] = initZone();
    return global22["Zone"];
  }
  var ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var ObjectDefineProperty = Object.defineProperty;
  var ObjectGetPrototypeOf = Object.getPrototypeOf;
  var ObjectCreate = Object.create;
  var ArraySlice = Array.prototype.slice;
  var ADD_EVENT_LISTENER_STR = "addEventListener";
  var REMOVE_EVENT_LISTENER_STR = "removeEventListener";
  var ZONE_SYMBOL_ADD_EVENT_LISTENER = __symbol__(ADD_EVENT_LISTENER_STR);
  var ZONE_SYMBOL_REMOVE_EVENT_LISTENER = __symbol__(REMOVE_EVENT_LISTENER_STR);
  var TRUE_STR = "true";
  var FALSE_STR = "false";
  var ZONE_SYMBOL_PREFIX = __symbol__("");
  function wrapWithCurrentZone(callback, source) {
    return Zone.current.wrap(callback, source);
  }
  function scheduleMacroTaskWithCurrentZone(source, callback, data, customSchedule, customCancel) {
    return Zone.current.scheduleMacroTask(source, callback, data, customSchedule, customCancel);
  }
  var zoneSymbol = __symbol__;
  var isWindowExists = typeof window !== "undefined";
  var internalWindow = isWindowExists ? window : void 0;
  var _global3 = isWindowExists && internalWindow || globalThis;
  var REMOVE_ATTRIBUTE = "removeAttribute";
  function bindArguments(args, source) {
    for (let i2 = args.length - 1; i2 >= 0; i2--) {
      if (typeof args[i2] === "function") {
        args[i2] = wrapWithCurrentZone(args[i2], source + "_" + i2);
      }
    }
    return args;
  }
  function patchPrototype(prototype, fnNames) {
    const source = prototype.constructor["name"];
    for (let i2 = 0; i2 < fnNames.length; i2++) {
      const name = fnNames[i2];
      const delegate = prototype[name];
      if (delegate) {
        const prototypeDesc = ObjectGetOwnPropertyDescriptor(prototype, name);
        if (!isPropertyWritable(prototypeDesc)) {
          continue;
        }
        prototype[name] = ((delegate2) => {
          const patched = function() {
            return delegate2.apply(this, bindArguments(arguments, source + "." + name));
          };
          attachOriginToPatched(patched, delegate2);
          return patched;
        })(delegate);
      }
    }
  }
  function isPropertyWritable(propertyDesc) {
    if (!propertyDesc) {
      return true;
    }
    if (propertyDesc.writable === false) {
      return false;
    }
    return !(typeof propertyDesc.get === "function" && typeof propertyDesc.set === "undefined");
  }
  var isWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
  var isNode = !("nw" in _global3) && typeof _global3.process !== "undefined" && _global3.process.toString() === "[object process]";
  var isBrowser = !isNode && !isWebWorker && !!(isWindowExists && internalWindow["HTMLElement"]);
  var isMix = typeof _global3.process !== "undefined" && _global3.process.toString() === "[object process]" && !isWebWorker && !!(isWindowExists && internalWindow["HTMLElement"]);
  var zoneSymbolEventNames = /* @__PURE__ */ Object.create(null);
  var enableBeforeunloadSymbol = zoneSymbol("enable_beforeunload");
  var wrapFn = function(event) {
    event = event || _global3.event;
    if (!event) {
      return;
    }
    let eventNameSymbol = zoneSymbolEventNames[event.type];
    if (!eventNameSymbol) {
      eventNameSymbol = zoneSymbolEventNames[event.type] = zoneSymbol("ON_PROPERTY" + event.type);
    }
    const target = this || event.target || _global3;
    const listener = target[eventNameSymbol];
    let result;
    if (isBrowser && target === internalWindow && event.type === "error") {
      const errorEvent = event;
      result = listener && listener.call(this, errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error);
      if (result === true) {
        event.preventDefault();
      }
    } else {
      result = listener && listener.apply(this, arguments);
      if (
        // https://github.com/angular/angular/issues/47579
        // https://www.w3.org/TR/2011/WD-html5-20110525/history.html#beforeunloadevent
        // This is the only specific case we should check for. The spec defines that the
        // `returnValue` attribute represents the message to show the user. When the event
        // is created, this attribute must be set to the empty string.
        event.type === "beforeunload" && // To prevent any breaking changes resulting from this change, given that
        // it was already causing a significant number of failures in G3, we have hidden
        // that behavior behind a global configuration flag. Consumers can enable this
        // flag explicitly if they want the `beforeunload` event to be handled as defined
        // in the specification.
        _global3[enableBeforeunloadSymbol] && // The IDL event definition is `attribute DOMString returnValue`, so we check whether
        // `typeof result` is a string.
        typeof result === "string"
      ) {
        event.returnValue = result;
      } else if (result != void 0 && !result) {
        event.preventDefault();
      }
    }
    return result;
  };
  function patchProperty(obj, prop, prototype) {
    let desc = ObjectGetOwnPropertyDescriptor(obj, prop);
    if (!desc && prototype) {
      const prototypeDesc = ObjectGetOwnPropertyDescriptor(prototype, prop);
      if (prototypeDesc) {
        desc = { enumerable: true, configurable: true };
      }
    }
    if (!desc || !desc.configurable) {
      return;
    }
    const onPropPatchedSymbol = zoneSymbol("on" + prop + "patched");
    if (Object.hasOwn(obj, onPropPatchedSymbol) && obj[onPropPatchedSymbol]) {
      return;
    }
    delete desc.writable;
    delete desc.value;
    const originalDescGet = desc.get;
    const originalDescSet = desc.set;
    const eventName = prop.slice(2);
    let eventNameSymbol = zoneSymbolEventNames[eventName];
    if (!eventNameSymbol) {
      eventNameSymbol = zoneSymbolEventNames[eventName] = zoneSymbol("ON_PROPERTY" + eventName);
    }
    desc.set = function(newValue) {
      let target = this;
      if (!target && obj === _global3) {
        target = _global3;
      }
      if (!target) {
        return;
      }
      const previousValue = target[eventNameSymbol];
      if (typeof previousValue === "function") {
        target.removeEventListener(eventName, wrapFn);
      }
      originalDescSet == null ? void 0 : originalDescSet.call(target, null);
      target[eventNameSymbol] = newValue;
      if (typeof newValue === "function") {
        target.addEventListener(eventName, wrapFn, false);
      }
    };
    desc.get = function() {
      let target = this;
      if (!target && obj === _global3) {
        target = _global3;
      }
      if (!target) {
        return null;
      }
      const listener = target[eventNameSymbol];
      if (listener) {
        return listener;
      } else if (originalDescGet) {
        let value = originalDescGet.call(this);
        if (value) {
          desc.set.call(this, value);
          if (typeof target[REMOVE_ATTRIBUTE] === "function") {
            target.removeAttribute(prop);
          }
          return value;
        }
      }
      return null;
    };
    ObjectDefineProperty(obj, prop, desc);
    obj[onPropPatchedSymbol] = true;
  }
  function patchOnProperties(obj, properties, prototype) {
    if (properties) {
      for (let i2 = 0; i2 < properties.length; i2++) {
        patchProperty(obj, "on" + properties[i2], prototype);
      }
    } else {
      const onProperties = [];
      for (const prop in obj) {
        if (prop.slice(0, 2) == "on") {
          onProperties.push(prop);
        }
      }
      for (let j = 0; j < onProperties.length; j++) {
        patchProperty(obj, onProperties[j], prototype);
      }
    }
  }
  var originalInstanceKey = zoneSymbol("originalInstance");
  function patchClass(className) {
    const OriginalClass = _global3[className];
    if (!OriginalClass)
      return;
    _global3[zoneSymbol(className)] = OriginalClass;
    _global3[className] = function() {
      const a2 = bindArguments(arguments, className);
      switch (a2.length) {
        case 0:
          this[originalInstanceKey] = new OriginalClass();
          break;
        case 1:
          this[originalInstanceKey] = new OriginalClass(a2[0]);
          break;
        case 2:
          this[originalInstanceKey] = new OriginalClass(a2[0], a2[1]);
          break;
        case 3:
          this[originalInstanceKey] = new OriginalClass(a2[0], a2[1], a2[2]);
          break;
        case 4:
          this[originalInstanceKey] = new OriginalClass(a2[0], a2[1], a2[2], a2[3]);
          break;
        default:
          throw new Error("Arg list too long.");
      }
    };
    attachOriginToPatched(_global3[className], OriginalClass);
    const instance = new OriginalClass(function() {
    });
    let prop;
    for (prop in instance) {
      if (className === "XMLHttpRequest" && prop === "responseBlob")
        continue;
      (function(prop2) {
        if (typeof instance[prop2] === "function") {
          _global3[className].prototype[prop2] = function() {
            return this[originalInstanceKey][prop2].apply(this[originalInstanceKey], arguments);
          };
        } else {
          ObjectDefineProperty(_global3[className].prototype, prop2, {
            set: function(fn) {
              if (typeof fn === "function") {
                this[originalInstanceKey][prop2] = wrapWithCurrentZone(fn, className + "." + prop2);
                attachOriginToPatched(this[originalInstanceKey][prop2], fn);
              } else {
                this[originalInstanceKey][prop2] = fn;
              }
            },
            get: function() {
              return this[originalInstanceKey][prop2];
            }
          });
        }
      })(prop);
    }
    for (prop in OriginalClass) {
      if (prop !== "prototype" && Object.hasOwn(OriginalClass, prop)) {
        _global3[className][prop] = OriginalClass[prop];
      }
    }
  }
  function copySymbolProperties(src, dest) {
    if (typeof Object.getOwnPropertySymbols !== "function") {
      return;
    }
    const symbols = Object.getOwnPropertySymbols(src);
    symbols.forEach((symbol) => {
      const desc = Object.getOwnPropertyDescriptor(src, symbol);
      Object.defineProperty(dest, symbol, {
        get: function() {
          return src[symbol];
        },
        set: function(value) {
          if (desc && (!desc.writable || typeof desc.set !== "function")) {
            return;
          }
          src[symbol] = value;
        },
        enumerable: desc ? desc.enumerable : true,
        configurable: desc ? desc.configurable : true
      });
    });
  }
  var shouldCopySymbolProperties = false;
  function patchMethod(target, name, patchFn) {
    let proto = target;
    while (proto && !Object.hasOwn(proto, name)) {
      proto = ObjectGetPrototypeOf(proto);
    }
    if (!proto && target[name]) {
      proto = target;
    }
    const delegateName = zoneSymbol(name);
    let delegate = null;
    if (proto && (!(delegate = proto[delegateName]) || !Object.hasOwn(proto, delegateName))) {
      delegate = proto[delegateName] = proto[name];
      const desc = proto && ObjectGetOwnPropertyDescriptor(proto, name);
      if (isPropertyWritable(desc)) {
        const patchDelegate = patchFn(delegate, delegateName, name);
        proto[name] = function() {
          return patchDelegate(this, arguments);
        };
        attachOriginToPatched(proto[name], delegate);
        if (shouldCopySymbolProperties) {
          copySymbolProperties(delegate, proto[name]);
        }
      }
    }
    return delegate;
  }
  function patchMacroTask(obj, funcName, metaCreator) {
    let setNative = null;
    function scheduleTask(task) {
      const data = task.data;
      data.args[data.cbIdx] = function() {
        task.invoke.apply(this, arguments);
      };
      setNative.apply(data.target, data.args);
      return task;
    }
    setNative = patchMethod(obj, funcName, (delegate) => function(self2, args) {
      const meta = metaCreator(self2, args);
      if (meta.cbIdx >= 0 && typeof args[meta.cbIdx] === "function") {
        return scheduleMacroTaskWithCurrentZone(meta.name, args[meta.cbIdx], meta, scheduleTask);
      } else {
        return delegate.apply(self2, args);
      }
    });
  }
  function attachOriginToPatched(patched, original) {
    patched[zoneSymbol("OriginalDelegate")] = original;
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  var OPTIMIZED_ZONE_EVENT_TASK_DATA = {
    useG: true
  };
  var zoneSymbolEventNames2 = /* @__PURE__ */ Object.create(null);
  var globalSources = {};
  var EVENT_NAME_SYMBOL_REGX = new RegExp("^" + ZONE_SYMBOL_PREFIX + "(\\w+)(true|false)$");
  var IMMEDIATE_PROPAGATION_SYMBOL = zoneSymbol("propagationStopped");
  var KNOWN_EVENT_LISTENER_OPTIONS = ["capture", "once", "passive", "signal"];
  function prepareEventNames(eventName, eventNameToString) {
    const falseEventName = (eventNameToString ? eventNameToString(eventName) : eventName) + FALSE_STR;
    const trueEventName = (eventNameToString ? eventNameToString(eventName) : eventName) + TRUE_STR;
    const symbol = ZONE_SYMBOL_PREFIX + falseEventName;
    const symbolCapture = ZONE_SYMBOL_PREFIX + trueEventName;
    zoneSymbolEventNames2[eventName] = {
      [FALSE_STR]: symbol,
      [TRUE_STR]: symbolCapture
    };
  }
  function patchEventTarget(_global22, api2, apis, patchOptions) {
    const ADD_EVENT_LISTENER = patchOptions && patchOptions.add || ADD_EVENT_LISTENER_STR;
    const REMOVE_EVENT_LISTENER = patchOptions && patchOptions.rm || REMOVE_EVENT_LISTENER_STR;
    const LISTENERS_EVENT_LISTENER = patchOptions && patchOptions.listeners || "eventListeners";
    const REMOVE_ALL_LISTENERS_EVENT_LISTENER = patchOptions && patchOptions.rmAll || "removeAllListeners";
    const zoneSymbolAddEventListener = zoneSymbol(ADD_EVENT_LISTENER);
    const ADD_EVENT_LISTENER_SOURCE = "." + ADD_EVENT_LISTENER + ":";
    const PREPEND_EVENT_LISTENER = "prependListener";
    const PREPEND_EVENT_LISTENER_SOURCE = "." + PREPEND_EVENT_LISTENER + ":";
    const invokeTask = function(task, target, event) {
      if (task.isRemoved) {
        return;
      }
      const delegate = task.callback;
      if (typeof delegate === "object" && delegate.handleEvent) {
        task.callback = (event2) => delegate.handleEvent(event2);
        task.originalDelegate = delegate;
      }
      let error;
      try {
        task.invoke(task, target, [event]);
      } catch (err) {
        error = err;
      }
      const options = task.options;
      if (options && typeof options === "object" && options.once) {
        const delegate2 = task.originalDelegate ? task.originalDelegate : task.callback;
        target[REMOVE_EVENT_LISTENER].call(target, event.type, delegate2, options);
      }
      return error;
    };
    function globalCallback(context2, event, isCapture) {
      event = event || _global22.event;
      if (!event) {
        return;
      }
      const target = context2 || event.target || _global22;
      const tasks = target[zoneSymbolEventNames2[event.type][isCapture ? TRUE_STR : FALSE_STR]];
      if (tasks) {
        const errors = [];
        if (tasks.length === 1) {
          const err = invokeTask(tasks[0], target, event);
          err && errors.push(err);
        } else {
          const copyTasks = tasks.slice();
          for (let i2 = 0; i2 < copyTasks.length; i2++) {
            if (event && event[IMMEDIATE_PROPAGATION_SYMBOL] === true) {
              break;
            }
            const err = invokeTask(copyTasks[i2], target, event);
            err && errors.push(err);
          }
        }
        if (errors.length === 1) {
          throw errors[0];
        } else {
          for (let i2 = 0; i2 < errors.length; i2++) {
            const err = errors[i2];
            api2.nativeScheduleMicroTask(() => {
              throw err;
            });
          }
        }
      }
    }
    const globalZoneAwareCallback = function(event) {
      return globalCallback(this, event, false);
    };
    const globalZoneAwareCaptureCallback = function(event) {
      return globalCallback(this, event, true);
    };
    function patchEventTargetMethods(obj, patchOptions2) {
      if (!obj) {
        return false;
      }
      let useGlobalCallback = true;
      if (patchOptions2 && patchOptions2.useG !== void 0) {
        useGlobalCallback = patchOptions2.useG;
      }
      const validateHandler = patchOptions2 && patchOptions2.vh;
      let checkDuplicate = true;
      if (patchOptions2 && patchOptions2.chkDup !== void 0) {
        checkDuplicate = patchOptions2.chkDup;
      }
      let returnTarget = false;
      if (patchOptions2 && patchOptions2.rt !== void 0) {
        returnTarget = patchOptions2.rt;
      }
      let proto = obj;
      while (proto && !Object.hasOwn(proto, ADD_EVENT_LISTENER)) {
        proto = ObjectGetPrototypeOf(proto);
      }
      if (!proto && obj[ADD_EVENT_LISTENER]) {
        proto = obj;
      }
      if (!proto) {
        return false;
      }
      if (proto[zoneSymbolAddEventListener]) {
        return false;
      }
      const eventNameToString = patchOptions2 && patchOptions2.eventNameToString;
      const taskData = {};
      const nativeAddEventListener = proto[zoneSymbolAddEventListener] = proto[ADD_EVENT_LISTENER];
      const nativeRemoveEventListener = proto[zoneSymbol(REMOVE_EVENT_LISTENER)] = proto[REMOVE_EVENT_LISTENER];
      const nativeListeners = proto[zoneSymbol(LISTENERS_EVENT_LISTENER)] = proto[LISTENERS_EVENT_LISTENER];
      const nativeRemoveAllListeners = proto[zoneSymbol(REMOVE_ALL_LISTENERS_EVENT_LISTENER)] = proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER];
      let nativePrependEventListener;
      if (patchOptions2 && patchOptions2.prepend) {
        nativePrependEventListener = proto[zoneSymbol(patchOptions2.prepend)] = proto[patchOptions2.prepend];
      }
      function buildEventListenerOptions(options, passive) {
        if (!passive) {
          return options;
        }
        if (typeof options === "boolean") {
          return { capture: options, passive: true };
        }
        if (!options) {
          return { passive: true };
        }
        if (typeof options === "object" && options.passive !== false) {
          options.passive = true;
          return options;
        }
        return options;
      }
      const customScheduleGlobal = function(task) {
        if (taskData.isExisting) {
          return;
        }
        return nativeAddEventListener.call(taskData.target, taskData.eventName, taskData.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, taskData.options);
      };
      const customCancelGlobal = function(task) {
        if (!task.isRemoved) {
          const symbolEventNames = zoneSymbolEventNames2[task.eventName];
          let symbolEventName;
          if (symbolEventNames) {
            symbolEventName = symbolEventNames[task.capture ? TRUE_STR : FALSE_STR];
          }
          const existingTasks = symbolEventName && task.target[symbolEventName];
          if (existingTasks) {
            for (let i2 = 0; i2 < existingTasks.length; i2++) {
              const existingTask = existingTasks[i2];
              if (existingTask === task) {
                existingTasks.splice(i2, 1);
                task.isRemoved = true;
                if (task.removeAbortListener) {
                  task.removeAbortListener();
                  task.removeAbortListener = null;
                }
                if (existingTasks.length === 0) {
                  task.allRemoved = true;
                  task.target[symbolEventName] = null;
                }
                break;
              }
            }
          }
        }
        if (!task.allRemoved) {
          return;
        }
        return nativeRemoveEventListener.call(task.target, task.eventName, task.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, task.options);
      };
      const customScheduleNonGlobal = function(task) {
        return nativeAddEventListener.call(taskData.target, taskData.eventName, task.invoke, taskData.options);
      };
      const customSchedulePrepend = function(task) {
        return nativePrependEventListener.call(taskData.target, taskData.eventName, task.invoke, taskData.options);
      };
      const customCancelNonGlobal = function(task) {
        return nativeRemoveEventListener.call(task.target, task.eventName, task.invoke, task.options);
      };
      const customSchedule = useGlobalCallback ? customScheduleGlobal : customScheduleNonGlobal;
      const customCancel = useGlobalCallback ? customCancelGlobal : customCancelNonGlobal;
      const compareTaskCallbackVsDelegate = function(task, delegate) {
        const typeOfDelegate = typeof delegate;
        return typeOfDelegate === "function" && task.callback === delegate || typeOfDelegate === "object" && task.originalDelegate === delegate;
      };
      const compare = (patchOptions2 == null ? void 0 : patchOptions2.diff) || compareTaskCallbackVsDelegate;
      const unpatchedEvents = Zone[zoneSymbol("UNPATCHED_EVENTS")];
      const passiveEvents = _global22[zoneSymbol("PASSIVE_EVENTS")];
      function copyEventListenerOptions(options) {
        if (typeof options !== "object" || options === null) {
          return options;
        }
        const newOptions = __spreadValues({}, options);
        for (const key of KNOWN_EVENT_LISTENER_OPTIONS) {
          if (!Object.hasOwn(newOptions, key) && key in options) {
            newOptions[key] = options[key];
          }
        }
        return newOptions;
      }
      const makeAddListener = function(nativeListener, addSource, customScheduleFn, customCancelFn, returnTarget2 = false, prepend = false) {
        return function() {
          const target = this || _global22;
          let eventName = arguments[0];
          if (patchOptions2 && patchOptions2.transferEventName) {
            eventName = patchOptions2.transferEventName(eventName);
          }
          let delegate = arguments[1];
          if (!delegate) {
            return nativeListener.apply(this, arguments);
          }
          if (isNode && eventName === "uncaughtException") {
            return nativeListener.apply(this, arguments);
          }
          let isEventListenerObject = false;
          if (typeof delegate !== "function") {
            if (!delegate.handleEvent) {
              return nativeListener.apply(this, arguments);
            }
            isEventListenerObject = true;
          }
          if (validateHandler && !validateHandler(nativeListener, delegate, target, arguments)) {
            return;
          }
          const passive = !!passiveEvents && passiveEvents.indexOf(eventName) !== -1;
          const options = buildEventListenerOptions(copyEventListenerOptions(arguments[2]), passive);
          const signal = options == null ? void 0 : options.signal;
          if (signal == null ? void 0 : signal.aborted) {
            return;
          }
          if (unpatchedEvents) {
            for (let i2 = 0; i2 < unpatchedEvents.length; i2++) {
              if (eventName === unpatchedEvents[i2]) {
                if (passive) {
                  return nativeListener.call(target, eventName, delegate, options);
                } else {
                  return nativeListener.apply(this, arguments);
                }
              }
            }
          }
          const capture = !options ? false : typeof options === "boolean" ? true : options.capture;
          const once = options && typeof options === "object" ? options.once : false;
          const zone = Zone.current;
          let symbolEventNames = zoneSymbolEventNames2[eventName];
          if (!symbolEventNames) {
            prepareEventNames(eventName, eventNameToString);
            symbolEventNames = zoneSymbolEventNames2[eventName];
          }
          const symbolEventName = symbolEventNames[capture ? TRUE_STR : FALSE_STR];
          let existingTasks = target[symbolEventName];
          let isExisting = false;
          if (existingTasks) {
            isExisting = true;
            if (checkDuplicate) {
              for (let i2 = 0; i2 < existingTasks.length; i2++) {
                if (compare(existingTasks[i2], delegate)) {
                  return;
                }
              }
            }
          } else {
            existingTasks = target[symbolEventName] = [];
          }
          let source;
          const constructorName = target.constructor["name"];
          const targetSource = globalSources[constructorName];
          if (targetSource) {
            source = targetSource[eventName];
          }
          if (!source) {
            source = constructorName + addSource + (eventNameToString ? eventNameToString(eventName) : eventName);
          }
          taskData.options = options;
          if (once) {
            taskData.options.once = false;
          }
          taskData.target = target;
          taskData.capture = capture;
          taskData.eventName = eventName;
          taskData.isExisting = isExisting;
          const data = useGlobalCallback ? OPTIMIZED_ZONE_EVENT_TASK_DATA : void 0;
          if (data) {
            data.taskData = taskData;
          }
          if (signal) {
            taskData.options.signal = void 0;
          }
          const task = zone.scheduleEventTask(source, delegate, data, customScheduleFn, customCancelFn);
          if (signal) {
            taskData.options.signal = signal;
            const onAbort = () => task.zone.cancelTask(task);
            nativeListener.call(signal, "abort", onAbort, { once: true });
            task.removeAbortListener = () => signal.removeEventListener("abort", onAbort);
          }
          taskData.target = null;
          if (data) {
            data.taskData = null;
          }
          if (once) {
            taskData.options.once = true;
          }
          if (typeof task.options !== "boolean") {
            task.options = options;
          }
          task.target = target;
          task.capture = capture;
          task.eventName = eventName;
          if (isEventListenerObject) {
            task.originalDelegate = delegate;
          }
          if (!prepend) {
            existingTasks.push(task);
          } else {
            existingTasks.unshift(task);
          }
          if (returnTarget2) {
            return target;
          }
        };
      };
      proto[ADD_EVENT_LISTENER] = makeAddListener(nativeAddEventListener, ADD_EVENT_LISTENER_SOURCE, customSchedule, customCancel, returnTarget);
      if (nativePrependEventListener) {
        proto[PREPEND_EVENT_LISTENER] = makeAddListener(nativePrependEventListener, PREPEND_EVENT_LISTENER_SOURCE, customSchedulePrepend, customCancel, returnTarget, true);
      }
      proto[REMOVE_EVENT_LISTENER] = function() {
        const target = this || _global22;
        let eventName = arguments[0];
        if (patchOptions2 && patchOptions2.transferEventName) {
          eventName = patchOptions2.transferEventName(eventName);
        }
        const options = arguments[2];
        const capture = !options ? false : typeof options === "boolean" ? true : options.capture;
        const delegate = arguments[1];
        if (!delegate) {
          return nativeRemoveEventListener.apply(this, arguments);
        }
        if (validateHandler && !validateHandler(nativeRemoveEventListener, delegate, target, arguments)) {
          return;
        }
        const symbolEventNames = zoneSymbolEventNames2[eventName];
        let symbolEventName;
        if (symbolEventNames) {
          symbolEventName = symbolEventNames[capture ? TRUE_STR : FALSE_STR];
        }
        const existingTasks = symbolEventName && target[symbolEventName];
        if (existingTasks) {
          for (let i2 = 0; i2 < existingTasks.length; i2++) {
            const existingTask = existingTasks[i2];
            if (compare(existingTask, delegate)) {
              existingTasks.splice(i2, 1);
              existingTask.isRemoved = true;
              if (existingTasks.length === 0) {
                existingTask.allRemoved = true;
                target[symbolEventName] = null;
                if (!capture && typeof eventName === "string") {
                  const onPropertySymbol = ZONE_SYMBOL_PREFIX + "ON_PROPERTY" + eventName;
                  target[onPropertySymbol] = null;
                }
              }
              existingTask.zone.cancelTask(existingTask);
              if (returnTarget) {
                return target;
              }
              return;
            }
          }
        }
        return nativeRemoveEventListener.apply(this, arguments);
      };
      proto[LISTENERS_EVENT_LISTENER] = function() {
        const target = this || _global22;
        let eventName = arguments[0];
        if (patchOptions2 && patchOptions2.transferEventName) {
          eventName = patchOptions2.transferEventName(eventName);
        }
        const listeners = [];
        const tasks = findEventTasks(target, eventNameToString ? eventNameToString(eventName) : eventName);
        for (let i2 = 0; i2 < tasks.length; i2++) {
          const task = tasks[i2];
          let delegate = task.originalDelegate ? task.originalDelegate : task.callback;
          listeners.push(delegate);
        }
        return listeners;
      };
      proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER] = function() {
        const target = this || _global22;
        let eventName = arguments[0];
        if (!eventName) {
          const keys = Object.keys(target);
          for (let i2 = 0; i2 < keys.length; i2++) {
            const prop = keys[i2];
            const match = EVENT_NAME_SYMBOL_REGX.exec(prop);
            let evtName = match && match[1];
            if (evtName && evtName !== "removeListener") {
              this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].call(this, evtName);
            }
          }
          this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].call(this, "removeListener");
        } else {
          if (patchOptions2 && patchOptions2.transferEventName) {
            eventName = patchOptions2.transferEventName(eventName);
          }
          const symbolEventNames = zoneSymbolEventNames2[eventName];
          if (symbolEventNames) {
            const symbolEventName = symbolEventNames[FALSE_STR];
            const symbolCaptureEventName = symbolEventNames[TRUE_STR];
            const tasks = target[symbolEventName];
            const captureTasks = target[symbolCaptureEventName];
            if (tasks) {
              const removeTasks = tasks.slice();
              for (let i2 = 0; i2 < removeTasks.length; i2++) {
                const task = removeTasks[i2];
                let delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                this[REMOVE_EVENT_LISTENER].call(this, eventName, delegate, task.options);
              }
            }
            if (captureTasks) {
              const removeTasks = captureTasks.slice();
              for (let i2 = 0; i2 < removeTasks.length; i2++) {
                const task = removeTasks[i2];
                let delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                this[REMOVE_EVENT_LISTENER].call(this, eventName, delegate, task.options);
              }
            }
          }
        }
        if (returnTarget) {
          return this;
        }
      };
      attachOriginToPatched(proto[ADD_EVENT_LISTENER], nativeAddEventListener);
      attachOriginToPatched(proto[REMOVE_EVENT_LISTENER], nativeRemoveEventListener);
      if (nativeRemoveAllListeners) {
        attachOriginToPatched(proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER], nativeRemoveAllListeners);
      }
      if (nativeListeners) {
        attachOriginToPatched(proto[LISTENERS_EVENT_LISTENER], nativeListeners);
      }
      return true;
    }
    let results = [];
    for (let i2 = 0; i2 < apis.length; i2++) {
      results[i2] = patchEventTargetMethods(apis[i2], patchOptions);
    }
    return results;
  }
  function findEventTasks(target, eventName) {
    if (!eventName) {
      const foundTasks = [];
      for (let prop in target) {
        const match = EVENT_NAME_SYMBOL_REGX.exec(prop);
        let evtName = match && match[1];
        if (evtName && (!eventName || evtName === eventName)) {
          const tasks = target[prop];
          if (tasks) {
            for (let i2 = 0; i2 < tasks.length; i2++) {
              foundTasks.push(tasks[i2]);
            }
          }
        }
      }
      return foundTasks;
    }
    let symbolEventName = zoneSymbolEventNames2[eventName];
    if (!symbolEventName) {
      prepareEventNames(eventName);
      symbolEventName = zoneSymbolEventNames2[eventName];
    }
    const captureFalseTasks = target[symbolEventName[FALSE_STR]];
    const captureTrueTasks = target[symbolEventName[TRUE_STR]];
    if (!captureFalseTasks) {
      return captureTrueTasks ? captureTrueTasks.slice() : [];
    } else {
      return captureTrueTasks ? captureFalseTasks.concat(captureTrueTasks) : captureFalseTasks.slice();
    }
  }
  function patchEventPrototype(global22, api2) {
    const Event = global22["Event"];
    if (Event && Event.prototype) {
      api2.patchMethod(Event.prototype, "stopImmediatePropagation", (delegate) => function(self2, args) {
        self2[IMMEDIATE_PROPAGATION_SYMBOL] = true;
        delegate && delegate.apply(self2, args);
      });
    }
  }
  function patchQueueMicrotask(global22, api2) {
    api2.patchMethod(global22, "queueMicrotask", (delegate) => {
      return function(self2, args) {
        Zone.current.scheduleMicroTask("queueMicrotask", args[0]);
      };
    });
  }
  var taskSymbol = zoneSymbol("zoneTask");
  function patchTimer(window2, setName, cancelName, nameSuffix) {
    let setNative = null;
    let clearNative = null;
    setName += nameSuffix;
    cancelName += nameSuffix;
    const tasksByHandleId = {};
    function scheduleTask(task) {
      const data = task.data;
      data.args[0] = function() {
        return task.invoke.apply(this, arguments);
      };
      const handleOrId = setNative.apply(window2, data.args);
      if (isNumber(handleOrId)) {
        data.handleId = handleOrId;
      } else {
        data.handle = handleOrId;
        data.isRefreshable = isFunction(handleOrId == null ? void 0 : handleOrId.refresh);
      }
      return task;
    }
    function clearTask(task) {
      const { handle, handleId } = task.data;
      return clearNative.call(window2, handle != null ? handle : handleId);
    }
    setNative = patchMethod(window2, setName, (delegate) => function(self2, args) {
      var _a;
      if (isFunction(args[0])) {
        const options = {
          isRefreshable: false,
          isPeriodic: nameSuffix === "Interval",
          delay: nameSuffix === "Timeout" || nameSuffix === "Interval" ? args[1] || 0 : void 0,
          args
        };
        const callback = args[0];
        args[0] = function timer() {
          try {
            return callback.apply(this, arguments);
          } finally {
            const { handle: handle2, handleId: handleId2, isPeriodic: isPeriodic2, isRefreshable: isRefreshable2 } = options;
            if (!isPeriodic2 && !isRefreshable2) {
              if (handleId2) {
                delete tasksByHandleId[handleId2];
              } else if (handle2) {
                handle2[taskSymbol] = null;
              }
            }
          }
        };
        const task = scheduleMacroTaskWithCurrentZone(setName, args[0], options, scheduleTask, clearTask);
        if (!task) {
          return task;
        }
        const { handleId, handle, isRefreshable, isPeriodic } = task.data;
        if (handleId) {
          tasksByHandleId[handleId] = task;
        } else if (handle) {
          handle[taskSymbol] = task;
          if (isRefreshable && !isPeriodic) {
            const originalRefresh = handle.refresh;
            handle.refresh = function() {
              const { zone, state } = task;
              if (state === "notScheduled") {
                task._state = "scheduled";
                zone._updateTaskCount(task, 1);
              } else if (state === "running") {
                task._state = "scheduling";
              }
              return originalRefresh.call(this);
            };
          }
        }
        return (_a = handle != null ? handle : handleId) != null ? _a : task;
      } else {
        return delegate.apply(window2, args);
      }
    });
    clearNative = patchMethod(window2, cancelName, (delegate) => function(self2, args) {
      const id = args[0];
      let task;
      if (isNumber(id)) {
        task = tasksByHandleId[id];
        delete tasksByHandleId[id];
      } else {
        task = id == null ? void 0 : id[taskSymbol];
        if (task) {
          id[taskSymbol] = null;
        } else {
          task = id;
        }
      }
      if (task == null ? void 0 : task.type) {
        if (task.cancelFn) {
          task.zone.cancelTask(task);
        }
      } else {
        delegate.apply(window2, args);
      }
    });
  }
  function patchCustomElements(_global22, api2) {
    const { isBrowser: isBrowser2, isMix: isMix2 } = api2.getGlobalObjects();
    if (!isBrowser2 && !isMix2 || !_global22["customElements"] || !("customElements" in _global22)) {
      return;
    }
    const callbacks = [
      "connectedCallback",
      "disconnectedCallback",
      "adoptedCallback",
      "attributeChangedCallback",
      "formAssociatedCallback",
      "formDisabledCallback",
      "formResetCallback",
      "formStateRestoreCallback"
    ];
    api2.patchCallbacks(api2, _global22.customElements, "customElements", "define", callbacks);
  }
  function eventTargetPatch(_global22, api2) {
    if (Zone[api2.symbol("patchEventTarget")]) {
      return;
    }
    const { eventNames, zoneSymbolEventNames: zoneSymbolEventNames3, TRUE_STR: TRUE_STR2, FALSE_STR: FALSE_STR2, ZONE_SYMBOL_PREFIX: ZONE_SYMBOL_PREFIX2 } = api2.getGlobalObjects();
    for (let i2 = 0; i2 < eventNames.length; i2++) {
      const eventName = eventNames[i2];
      const falseEventName = eventName + FALSE_STR2;
      const trueEventName = eventName + TRUE_STR2;
      const symbol = ZONE_SYMBOL_PREFIX2 + falseEventName;
      const symbolCapture = ZONE_SYMBOL_PREFIX2 + trueEventName;
      zoneSymbolEventNames3[eventName] = {};
      zoneSymbolEventNames3[eventName][FALSE_STR2] = symbol;
      zoneSymbolEventNames3[eventName][TRUE_STR2] = symbolCapture;
    }
    const EVENT_TARGET = _global22["EventTarget"];
    if (!EVENT_TARGET || !EVENT_TARGET.prototype) {
      return;
    }
    api2.patchEventTarget(_global22, api2, [EVENT_TARGET && EVENT_TARGET.prototype]);
    return true;
  }
  function patchEvent(global22, api2) {
    api2.patchEventPrototype(global22, api2);
  }
  function filterProperties(target, onProperties, ignoreProperties) {
    if (!ignoreProperties || ignoreProperties.length === 0) {
      return onProperties;
    }
    const tip = ignoreProperties.filter((ip) => ip.target === target);
    if (tip.length === 0) {
      return onProperties;
    }
    const targetIgnoreProperties = tip[0].ignoreProperties;
    return onProperties.filter((op) => targetIgnoreProperties.indexOf(op) === -1);
  }
  function patchFilteredProperties(target, onProperties, ignoreProperties, prototype) {
    if (!target) {
      return;
    }
    const filteredProperties = filterProperties(target, onProperties, ignoreProperties);
    patchOnProperties(target, filteredProperties, prototype);
  }
  function getOnEventNames(target) {
    return Object.getOwnPropertyNames(target).filter((name) => name.startsWith("on") && name.length > 2).map((name) => name.substring(2));
  }
  function propertyDescriptorPatch(api2, _global22) {
    if (isNode && !isMix) {
      return;
    }
    if (Zone[api2.symbol("patchEvents")]) {
      return;
    }
    const ignoreProperties = _global22["__Zone_ignore_on_properties"];
    let patchTargets = [];
    if (isBrowser) {
      const internalWindow2 = window;
      patchTargets = patchTargets.concat([
        "Document",
        "SVGElement",
        "Element",
        "HTMLElement",
        "HTMLBodyElement",
        "HTMLMediaElement",
        "HTMLFrameSetElement",
        "HTMLFrameElement",
        "HTMLIFrameElement",
        "HTMLMarqueeElement",
        "Worker"
      ]);
      patchFilteredProperties(internalWindow2, getOnEventNames(internalWindow2), ignoreProperties, ObjectGetPrototypeOf(internalWindow2));
    }
    patchTargets = patchTargets.concat([
      "XMLHttpRequest",
      "XMLHttpRequestEventTarget",
      "IDBIndex",
      "IDBRequest",
      "IDBOpenDBRequest",
      "IDBDatabase",
      "IDBTransaction",
      "IDBCursor",
      "WebSocket"
    ]);
    for (let i2 = 0; i2 < patchTargets.length; i2++) {
      const target = _global22[patchTargets[i2]];
      (target == null ? void 0 : target.prototype) && patchFilteredProperties(target.prototype, getOnEventNames(target.prototype), ignoreProperties);
    }
  }
  function patchBrowser(Zone3) {
    Zone3.__load_patch("timers", (global22) => {
      const set = "set";
      const clear = "clear";
      patchTimer(global22, set, clear, "Timeout");
      patchTimer(global22, set, clear, "Interval");
      patchTimer(global22, set, clear, "Immediate");
    });
    Zone3.__load_patch("requestAnimationFrame", (global22) => {
      patchTimer(global22, "request", "cancel", "AnimationFrame");
      patchTimer(global22, "mozRequest", "mozCancel", "AnimationFrame");
      patchTimer(global22, "webkitRequest", "webkitCancel", "AnimationFrame");
    });
    Zone3.__load_patch("blocking", (global22, Zone4) => {
      const blockingMethods = ["alert", "prompt", "confirm"];
      for (let i2 = 0; i2 < blockingMethods.length; i2++) {
        const name = blockingMethods[i2];
        patchMethod(global22, name, (delegate, symbol, name2) => {
          return function(s2, args) {
            return Zone4.current.run(delegate, global22, args, name2);
          };
        });
      }
    });
    Zone3.__load_patch("EventTarget", (global22, Zone4, api2) => {
      patchEvent(global22, api2);
      eventTargetPatch(global22, api2);
      const XMLHttpRequestEventTarget = global22["XMLHttpRequestEventTarget"];
      if (XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype) {
        api2.patchEventTarget(global22, api2, [XMLHttpRequestEventTarget.prototype]);
      }
    });
    Zone3.__load_patch("MutationObserver", (global22, Zone4, api2) => {
      patchClass("MutationObserver");
      patchClass("WebKitMutationObserver");
    });
    Zone3.__load_patch("IntersectionObserver", (global22, Zone4, api2) => {
      patchClass("IntersectionObserver");
    });
    Zone3.__load_patch("FileReader", (global22, Zone4, api2) => {
      patchClass("FileReader");
    });
    Zone3.__load_patch("on_property", (global22, Zone4, api2) => {
      propertyDescriptorPatch(api2, global22);
    });
    Zone3.__load_patch("customElements", (global22, Zone4, api2) => {
      patchCustomElements(global22, api2);
    });
    Zone3.__load_patch("XHR", (global22, Zone4) => {
      patchXHR(global22);
      const XHR_TASK = zoneSymbol("xhrTask");
      const XHR_SYNC = zoneSymbol("xhrSync");
      const XHR_LISTENER = zoneSymbol("xhrListener");
      const XHR_SCHEDULED = zoneSymbol("xhrScheduled");
      const XHR_URL = zoneSymbol("xhrURL");
      const XHR_ERROR_BEFORE_SCHEDULED = zoneSymbol("xhrErrorBeforeScheduled");
      function patchXHR(window2) {
        const XMLHttpRequest2 = window2["XMLHttpRequest"];
        if (!XMLHttpRequest2) {
          return;
        }
        const XMLHttpRequestPrototype = XMLHttpRequest2.prototype;
        function findPendingTask(target) {
          return target[XHR_TASK];
        }
        let oriAddListener = XMLHttpRequestPrototype[ZONE_SYMBOL_ADD_EVENT_LISTENER];
        let oriRemoveListener = XMLHttpRequestPrototype[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
        if (!oriAddListener) {
          const XMLHttpRequestEventTarget = window2["XMLHttpRequestEventTarget"];
          if (XMLHttpRequestEventTarget) {
            const XMLHttpRequestEventTargetPrototype = XMLHttpRequestEventTarget.prototype;
            oriAddListener = XMLHttpRequestEventTargetPrototype[ZONE_SYMBOL_ADD_EVENT_LISTENER];
            oriRemoveListener = XMLHttpRequestEventTargetPrototype[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
          }
        }
        const READY_STATE_CHANGE = "readystatechange";
        const SCHEDULED = "scheduled";
        function scheduleTask(task) {
          const data = task.data;
          const target = data.target;
          target[XHR_SCHEDULED] = false;
          target[XHR_ERROR_BEFORE_SCHEDULED] = false;
          const listener = target[XHR_LISTENER];
          if (!oriAddListener) {
            oriAddListener = target[ZONE_SYMBOL_ADD_EVENT_LISTENER];
            oriRemoveListener = target[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
          }
          if (listener) {
            oriRemoveListener.call(target, READY_STATE_CHANGE, listener);
          }
          const newListener = target[XHR_LISTENER] = () => {
            if (target.readyState === target.DONE) {
              if (!data.aborted && target[XHR_SCHEDULED] && task.state === SCHEDULED) {
                const loadTasks = target[Zone4.__symbol__("loadfalse")];
                if (target.status !== 0 && loadTasks && loadTasks.length > 0) {
                  const oriInvoke = task.invoke;
                  task.invoke = function() {
                    const loadTasks2 = target[Zone4.__symbol__("loadfalse")];
                    for (let i2 = 0; i2 < loadTasks2.length; i2++) {
                      if (loadTasks2[i2] === task) {
                        loadTasks2.splice(i2, 1);
                      }
                    }
                    if (!data.aborted && task.state === SCHEDULED) {
                      oriInvoke.call(task);
                    }
                  };
                  loadTasks.push(task);
                } else {
                  task.invoke();
                }
              } else if (!data.aborted && target[XHR_SCHEDULED] === false) {
                target[XHR_ERROR_BEFORE_SCHEDULED] = true;
              }
            }
          };
          oriAddListener.call(target, READY_STATE_CHANGE, newListener);
          const storedTask = target[XHR_TASK];
          if (!storedTask) {
            target[XHR_TASK] = task;
          }
          sendNative.apply(target, data.args);
          target[XHR_SCHEDULED] = true;
          return task;
        }
        function placeholderCallback() {
        }
        function clearTask(task) {
          const data = task.data;
          data.aborted = true;
          return abortNative.apply(data.target, data.args);
        }
        const openNative = patchMethod(XMLHttpRequestPrototype, "open", () => function(self2, args) {
          self2[XHR_SYNC] = args[2] == false;
          self2[XHR_URL] = args[1];
          return openNative.apply(self2, args);
        });
        const XMLHTTPREQUEST_SOURCE = "XMLHttpRequest.send";
        const fetchTaskAborting = zoneSymbol("fetchTaskAborting");
        const fetchTaskScheduling = zoneSymbol("fetchTaskScheduling");
        const sendNative = patchMethod(XMLHttpRequestPrototype, "send", () => function(self2, args) {
          if (Zone4.current[fetchTaskScheduling] === true) {
            return sendNative.apply(self2, args);
          }
          if (self2[XHR_SYNC]) {
            return sendNative.apply(self2, args);
          } else {
            const options = {
              target: self2,
              url: self2[XHR_URL],
              isPeriodic: false,
              args,
              aborted: false
            };
            const task = scheduleMacroTaskWithCurrentZone(XMLHTTPREQUEST_SOURCE, placeholderCallback, options, scheduleTask, clearTask);
            if (self2 && self2[XHR_ERROR_BEFORE_SCHEDULED] === true && !options.aborted && task.state === SCHEDULED) {
              task.invoke();
            }
          }
        });
        const abortNative = patchMethod(XMLHttpRequestPrototype, "abort", () => function(self2, args) {
          const task = findPendingTask(self2);
          if (task && typeof task.type == "string") {
            if (task.cancelFn == null || task.data && task.data.aborted) {
              return;
            }
            task.zone.cancelTask(task);
          } else if (Zone4.current[fetchTaskAborting] === true) {
            return abortNative.apply(self2, args);
          }
        });
      }
    });
    Zone3.__load_patch("geolocation", (global22) => {
      if (global22["navigator"] && global22["navigator"].geolocation) {
        patchPrototype(global22["navigator"].geolocation, ["getCurrentPosition", "watchPosition"]);
      }
    });
    Zone3.__load_patch("PromiseRejectionEvent", (global22, Zone4) => {
      function findPromiseRejectionHandler(evtName) {
        return function(e2) {
          const eventTasks = findEventTasks(global22, evtName);
          eventTasks.forEach((eventTask) => {
            const PromiseRejectionEvent = global22["PromiseRejectionEvent"];
            if (PromiseRejectionEvent) {
              const evt = new PromiseRejectionEvent(evtName, {
                promise: e2.promise,
                reason: e2.rejection
              });
              eventTask.invoke(evt);
            }
          });
        };
      }
      if (global22["PromiseRejectionEvent"]) {
        Zone4[zoneSymbol("unhandledPromiseRejectionHandler")] = findPromiseRejectionHandler("unhandledrejection");
        Zone4[zoneSymbol("rejectionHandledHandler")] = findPromiseRejectionHandler("rejectionhandled");
      }
    });
    Zone3.__load_patch("queueMicrotask", (global22, Zone4, api2) => {
      patchQueueMicrotask(global22, api2);
    });
  }
  function patchPromise(Zone3) {
    Zone3.__load_patch("ZoneAwarePromise", (global22, Zone4, api2) => {
      const ObjectGetOwnPropertyDescriptor2 = Object.getOwnPropertyDescriptor;
      const ObjectDefineProperty2 = Object.defineProperty;
      function readableObjectToString(obj) {
        if (obj && obj.toString === Object.prototype.toString) {
          const className = obj.constructor && obj.constructor.name;
          return (className ? className : "") + ": " + JSON.stringify(obj);
        }
        return obj ? obj.toString() : Object.prototype.toString.call(obj);
      }
      const __symbol__2 = api2.symbol;
      const _uncaughtPromiseErrors = [];
      const isDisableWrappingUncaughtPromiseRejection = global22[__symbol__2("DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION")] !== false;
      const symbolPromise = __symbol__2("Promise");
      const symbolThen = __symbol__2("then");
      const creationTrace = "__creationTrace__";
      api2.onUnhandledError = (e2) => {
        if (api2.showUncaughtError()) {
          const rejection = e2 && e2.rejection;
          if (rejection && e2.zone && e2.task) {
            console.error("Unhandled Promise rejection:", rejection instanceof Error ? rejection.message : rejection, "; Zone:", e2.zone.name, "; Task:", e2.task && e2.task.source, "; Value:", rejection, rejection instanceof Error ? rejection.stack : void 0);
          } else {
            console.error(e2);
          }
        }
      };
      api2.microtaskDrainDone = () => {
        while (_uncaughtPromiseErrors.length) {
          const uncaughtPromiseError = _uncaughtPromiseErrors.shift();
          try {
            uncaughtPromiseError.zone.runGuarded(() => {
              if (uncaughtPromiseError.throwOriginal) {
                throw uncaughtPromiseError.rejection;
              }
              throw uncaughtPromiseError;
            });
          } catch (error) {
            handleUnhandledRejection(error);
          }
        }
      };
      const UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL = __symbol__2("unhandledPromiseRejectionHandler");
      function handleUnhandledRejection(e2) {
        api2.onUnhandledError(e2);
        try {
          const handler = Zone4[UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL];
          if (typeof handler === "function") {
            handler.call(this, e2);
          }
        } catch (err) {
        }
      }
      function isThenable(value) {
        return value && typeof value.then === "function";
      }
      function forwardResolution(value) {
        return value;
      }
      function forwardRejection(rejection) {
        return ZoneAwarePromise.reject(rejection);
      }
      const symbolState = __symbol__2("state");
      const symbolValue = __symbol__2("value");
      const symbolFinally = __symbol__2("finally");
      const symbolParentPromiseValue = __symbol__2("parentPromiseValue");
      const symbolParentPromiseState = __symbol__2("parentPromiseState");
      const source = "Promise.then";
      const UNRESOLVED = null;
      const RESOLVED = true;
      const REJECTED = false;
      const REJECTED_NO_CATCH = 0;
      function makeResolver(promise, state) {
        return (v2) => {
          try {
            resolvePromise(promise, state, v2);
          } catch (err) {
            resolvePromise(promise, false, err);
          }
        };
      }
      const once = function() {
        let wasCalled = false;
        return function wrapper(wrappedFunction) {
          return function() {
            if (wasCalled) {
              return;
            }
            wasCalled = true;
            wrappedFunction.apply(null, arguments);
          };
        };
      };
      const TYPE_ERROR = "Promise resolved with itself";
      const CURRENT_TASK_TRACE_SYMBOL = __symbol__2("currentTaskTrace");
      function resolvePromise(promise, state, value) {
        const onceWrapper = once();
        if (promise === value) {
          throw new TypeError(TYPE_ERROR);
        }
        if (promise[symbolState] === UNRESOLVED) {
          let then = null;
          try {
            if (typeof value === "object" || typeof value === "function") {
              then = value && value.then;
            }
          } catch (err) {
            onceWrapper(() => {
              resolvePromise(promise, false, err);
            })();
            return promise;
          }
          if (state !== REJECTED && value instanceof ZoneAwarePromise && Object.hasOwn(value, symbolState) && Object.hasOwn(value, symbolValue) && value[symbolState] !== UNRESOLVED) {
            clearRejectedNoCatch(value);
            resolvePromise(promise, value[symbolState], value[symbolValue]);
          } else if (state !== REJECTED && typeof then === "function") {
            try {
              then.call(value, onceWrapper(makeResolver(promise, state)), onceWrapper(makeResolver(promise, false)));
            } catch (err) {
              onceWrapper(() => {
                resolvePromise(promise, false, err);
              })();
            }
          } else {
            promise[symbolState] = state;
            const queue = promise[symbolValue];
            promise[symbolValue] = value;
            if (promise[symbolFinally] === symbolFinally) {
              if (state === RESOLVED) {
                promise[symbolState] = promise[symbolParentPromiseState];
                promise[symbolValue] = promise[symbolParentPromiseValue];
              }
            }
            if (state === REJECTED && value instanceof Error) {
              const trace2 = Zone4.currentTask && Zone4.currentTask.data && Zone4.currentTask.data[creationTrace];
              if (trace2) {
                ObjectDefineProperty2(value, CURRENT_TASK_TRACE_SYMBOL, {
                  configurable: true,
                  enumerable: false,
                  writable: true,
                  value: trace2
                });
              }
            }
            for (let i2 = 0; i2 < queue.length; ) {
              scheduleResolveOrReject(promise, queue[i2++], queue[i2++], queue[i2++], queue[i2++]);
            }
            if (queue.length == 0 && state == REJECTED) {
              promise[symbolState] = REJECTED_NO_CATCH;
              let uncaughtPromiseError = value;
              try {
                throw new Error("Uncaught (in promise): " + readableObjectToString(value) + (value && value.stack ? "\n" + value.stack : ""));
              } catch (err) {
                uncaughtPromiseError = err;
              }
              if (isDisableWrappingUncaughtPromiseRejection) {
                uncaughtPromiseError.throwOriginal = true;
              }
              uncaughtPromiseError.rejection = value;
              uncaughtPromiseError.promise = promise;
              uncaughtPromiseError.zone = Zone4.current;
              uncaughtPromiseError.task = Zone4.currentTask;
              _uncaughtPromiseErrors.push(uncaughtPromiseError);
              api2.scheduleMicroTask();
            }
          }
        }
        return promise;
      }
      const REJECTION_HANDLED_HANDLER = __symbol__2("rejectionHandledHandler");
      function clearRejectedNoCatch(promise) {
        if (promise[symbolState] === REJECTED_NO_CATCH) {
          try {
            const handler = Zone4[REJECTION_HANDLED_HANDLER];
            if (handler && typeof handler === "function") {
              handler.call(this, { rejection: promise[symbolValue], promise });
            }
          } catch (err) {
          }
          promise[symbolState] = REJECTED;
          for (let i2 = 0; i2 < _uncaughtPromiseErrors.length; i2++) {
            if (promise === _uncaughtPromiseErrors[i2].promise) {
              _uncaughtPromiseErrors.splice(i2, 1);
            }
          }
        }
      }
      function scheduleResolveOrReject(promise, zone, chainPromise, onFulfilled, onRejected) {
        clearRejectedNoCatch(promise);
        const promiseState = promise[symbolState];
        const delegate = promiseState ? typeof onFulfilled === "function" ? onFulfilled : forwardResolution : typeof onRejected === "function" ? onRejected : forwardRejection;
        zone.scheduleMicroTask(source, () => {
          try {
            const parentPromiseValue = promise[symbolValue];
            const isFinallyPromise = !!chainPromise && symbolFinally === chainPromise[symbolFinally];
            if (isFinallyPromise) {
              chainPromise[symbolParentPromiseValue] = parentPromiseValue;
              chainPromise[symbolParentPromiseState] = promiseState;
            }
            const value = zone.run(delegate, void 0, isFinallyPromise && delegate !== forwardRejection && delegate !== forwardResolution ? [] : [parentPromiseValue]);
            resolvePromise(chainPromise, true, value);
          } catch (error) {
            resolvePromise(chainPromise, false, error);
          }
        }, chainPromise);
      }
      const ZONE_AWARE_PROMISE_TO_STRING = "function ZoneAwarePromise() { [native code] }";
      const noop = function() {
      };
      const AggregateError = global22.AggregateError;
      class ZoneAwarePromise {
        static toString() {
          return ZONE_AWARE_PROMISE_TO_STRING;
        }
        static resolve(value) {
          if (value instanceof ZoneAwarePromise) {
            return value;
          }
          return resolvePromise(new this(null), RESOLVED, value);
        }
        static reject(error) {
          return resolvePromise(new this(null), REJECTED, error);
        }
        static withResolvers() {
          const result = {};
          result.promise = new ZoneAwarePromise((res, rej) => {
            result.resolve = res;
            result.reject = rej;
          });
          return result;
        }
        static any(values) {
          if (!values || typeof values[Symbol.iterator] !== "function") {
            return Promise.reject(new AggregateError([], "All promises were rejected"));
          }
          const promises = [];
          let count = 0;
          try {
            for (let v2 of values) {
              count++;
              promises.push(ZoneAwarePromise.resolve(v2));
            }
          } catch (err) {
            return Promise.reject(new AggregateError([], "All promises were rejected"));
          }
          if (count === 0) {
            return Promise.reject(new AggregateError([], "All promises were rejected"));
          }
          let finished = false;
          const errors = [];
          return new ZoneAwarePromise((resolve, reject) => {
            for (let i2 = 0; i2 < promises.length; i2++) {
              promises[i2].then((v2) => {
                if (finished) {
                  return;
                }
                finished = true;
                resolve(v2);
              }, (err) => {
                errors.push(err);
                count--;
                if (count === 0) {
                  finished = true;
                  reject(new AggregateError(errors, "All promises were rejected"));
                }
              });
            }
          });
        }
        static race(values) {
          let resolve;
          let reject;
          let promise = new this((res, rej) => {
            resolve = res;
            reject = rej;
          });
          function onResolve(value) {
            resolve(value);
          }
          function onReject(error) {
            reject(error);
          }
          for (let value of values) {
            if (!isThenable(value)) {
              value = this.resolve(value);
            }
            value.then(onResolve, onReject);
          }
          return promise;
        }
        static all(values) {
          return ZoneAwarePromise.allWithCallback(values);
        }
        static allSettled(values) {
          const P2 = this && this.prototype instanceof ZoneAwarePromise ? this : ZoneAwarePromise;
          return P2.allWithCallback(values, {
            thenCallback: (value) => ({ status: "fulfilled", value }),
            errorCallback: (err) => ({ status: "rejected", reason: err })
          });
        }
        static allWithCallback(values, callback) {
          let resolve;
          let reject;
          let promise = new this((res, rej) => {
            resolve = res;
            reject = rej;
          });
          let unresolvedCount = 2;
          let valueIndex = 0;
          const resolvedValues = [];
          for (let value of values) {
            if (!isThenable(value)) {
              value = this.resolve(value);
            }
            const curValueIndex = valueIndex;
            try {
              value.then((value2) => {
                resolvedValues[curValueIndex] = callback ? callback.thenCallback(value2) : value2;
                unresolvedCount--;
                if (unresolvedCount === 0) {
                  resolve(resolvedValues);
                }
              }, (err) => {
                if (!callback) {
                  reject(err);
                } else {
                  resolvedValues[curValueIndex] = callback.errorCallback(err);
                  unresolvedCount--;
                  if (unresolvedCount === 0) {
                    resolve(resolvedValues);
                  }
                }
              });
            } catch (thenErr) {
              reject(thenErr);
            }
            unresolvedCount++;
            valueIndex++;
          }
          unresolvedCount -= 2;
          if (unresolvedCount === 0) {
            resolve(resolvedValues);
          }
          return promise;
        }
        constructor(executor) {
          const promise = this;
          if (!(promise instanceof ZoneAwarePromise)) {
            throw new Error("Must be an instanceof Promise.");
          }
          promise[symbolState] = UNRESOLVED;
          promise[symbolValue] = [];
          try {
            const onceWrapper = once();
            executor && executor(onceWrapper(makeResolver(promise, RESOLVED)), onceWrapper(makeResolver(promise, REJECTED)));
          } catch (error) {
            resolvePromise(promise, false, error);
          }
        }
        get [Symbol.toStringTag]() {
          return "Promise";
        }
        get [Symbol.species]() {
          return ZoneAwarePromise;
        }
        then(onFulfilled, onRejected) {
          var _a;
          let C2 = (_a = this.constructor) == null ? void 0 : _a[Symbol.species];
          if (!C2 || typeof C2 !== "function") {
            C2 = this.constructor || ZoneAwarePromise;
          }
          const chainPromise = new C2(noop);
          const zone = Zone4.current;
          if (this[symbolState] == UNRESOLVED) {
            this[symbolValue].push(zone, chainPromise, onFulfilled, onRejected);
          } else {
            scheduleResolveOrReject(this, zone, chainPromise, onFulfilled, onRejected);
          }
          return chainPromise;
        }
        catch(onRejected) {
          return this.then(null, onRejected);
        }
        finally(onFinally) {
          var _a;
          let C2 = (_a = this.constructor) == null ? void 0 : _a[Symbol.species];
          if (!C2 || typeof C2 !== "function") {
            C2 = ZoneAwarePromise;
          }
          const chainPromise = new C2(noop);
          chainPromise[symbolFinally] = symbolFinally;
          const zone = Zone4.current;
          if (this[symbolState] == UNRESOLVED) {
            this[symbolValue].push(zone, chainPromise, onFinally, onFinally);
          } else {
            scheduleResolveOrReject(this, zone, chainPromise, onFinally, onFinally);
          }
          return chainPromise;
        }
      }
      ZoneAwarePromise["resolve"] = ZoneAwarePromise.resolve;
      ZoneAwarePromise["reject"] = ZoneAwarePromise.reject;
      ZoneAwarePromise["race"] = ZoneAwarePromise.race;
      ZoneAwarePromise["all"] = ZoneAwarePromise.all;
      const NativePromise = global22[symbolPromise] = global22["Promise"];
      global22["Promise"] = ZoneAwarePromise;
      const symbolThenPatched = __symbol__2("thenPatched");
      function patchThen(Ctor) {
        const proto = Ctor.prototype;
        const prop = ObjectGetOwnPropertyDescriptor2(proto, "then");
        if (prop && (prop.writable === false || !prop.configurable)) {
          return;
        }
        const originalThen = proto.then;
        proto[symbolThen] = originalThen;
        Ctor.prototype.then = function(onResolve, onReject) {
          const wrapped = new ZoneAwarePromise((resolve, reject) => {
            originalThen.call(this, resolve, reject);
          });
          return wrapped.then(onResolve, onReject);
        };
        Ctor[symbolThenPatched] = true;
      }
      api2.patchThen = patchThen;
      function zoneify(fn) {
        return function(self2, args) {
          let resultPromise = fn.apply(self2, args);
          if (resultPromise instanceof ZoneAwarePromise) {
            return resultPromise;
          }
          let ctor = resultPromise.constructor;
          if (!ctor[symbolThenPatched]) {
            patchThen(ctor);
          }
          return resultPromise;
        };
      }
      if (NativePromise) {
        patchThen(NativePromise);
        const nativeTry = NativePromise["try"];
        if (nativeTry && typeof nativeTry === "function") {
          ZoneAwarePromise["try"] = nativeTry;
        }
        patchMethod(global22, "fetch", (delegate) => zoneify(delegate));
      }
      Promise[Zone4.__symbol__("uncaughtPromiseErrors")] = _uncaughtPromiseErrors;
      return ZoneAwarePromise;
    });
  }
  function patchToString(Zone3) {
    Zone3.__load_patch("toString", (global22) => {
      const originalFunctionToString = Function.prototype.toString;
      const ORIGINAL_DELEGATE_SYMBOL = zoneSymbol("OriginalDelegate");
      const PROMISE_SYMBOL = zoneSymbol("Promise");
      const ERROR_SYMBOL = zoneSymbol("Error");
      const newFunctionToString = function toString() {
        if (typeof this === "function") {
          const originalDelegate = this[ORIGINAL_DELEGATE_SYMBOL];
          if (originalDelegate) {
            if (typeof originalDelegate === "function") {
              return originalFunctionToString.call(originalDelegate);
            } else {
              return Object.prototype.toString.call(originalDelegate);
            }
          }
          if (this === Promise) {
            const nativePromise = global22[PROMISE_SYMBOL];
            if (nativePromise) {
              return originalFunctionToString.call(nativePromise);
            }
          }
          if (this === Error) {
            const nativeError = global22[ERROR_SYMBOL];
            if (nativeError) {
              return originalFunctionToString.call(nativeError);
            }
          }
        }
        return originalFunctionToString.call(this);
      };
      newFunctionToString[ORIGINAL_DELEGATE_SYMBOL] = originalFunctionToString;
      Function.prototype.toString = newFunctionToString;
      const originalObjectToString = Object.prototype.toString;
      const PROMISE_OBJECT_TO_STRING = "[object Promise]";
      Object.prototype.toString = function() {
        if (typeof Promise === "function" && this instanceof Promise) {
          return PROMISE_OBJECT_TO_STRING;
        }
        return originalObjectToString.call(this);
      };
    });
  }
  function patchCallbacks(api2, target, targetName, method, callbacks) {
    const symbol = Zone.__symbol__(method);
    if (target[symbol]) {
      return;
    }
    const nativeDelegate = target[symbol] = target[method];
    target[method] = function(name, opts, options) {
      if (opts && opts.prototype) {
        callbacks.forEach(function(callback) {
          const source = `${targetName}.${method}::` + callback;
          const prototype = opts.prototype;
          try {
            if (Object.hasOwn(prototype, callback)) {
              const descriptor = api2.ObjectGetOwnPropertyDescriptor(prototype, callback);
              if (descriptor && descriptor.value) {
                descriptor.value = api2.wrapWithCurrentZone(descriptor.value, source);
                api2._redefineProperty(opts.prototype, callback, descriptor);
              } else if (prototype[callback]) {
                prototype[callback] = api2.wrapWithCurrentZone(prototype[callback], source);
              }
            } else if (prototype[callback]) {
              prototype[callback] = api2.wrapWithCurrentZone(prototype[callback], source);
            }
          } catch (e2) {
          }
        });
      }
      return nativeDelegate.call(target, name, opts, options);
    };
    api2.attachOriginToPatched(target[method], nativeDelegate);
  }
  function patchUtil(Zone3) {
    Zone3.__load_patch("util", (global22, Zone4, api2) => {
      const eventNames = getOnEventNames(global22);
      api2.patchOnProperties = patchOnProperties;
      api2.patchMethod = patchMethod;
      api2.bindArguments = bindArguments;
      api2.patchMacroTask = patchMacroTask;
      const SYMBOL_BLACK_LISTED_EVENTS = Zone4.__symbol__("BLACK_LISTED_EVENTS");
      const SYMBOL_UNPATCHED_EVENTS = Zone4.__symbol__("UNPATCHED_EVENTS");
      if (global22[SYMBOL_UNPATCHED_EVENTS]) {
        global22[SYMBOL_BLACK_LISTED_EVENTS] = global22[SYMBOL_UNPATCHED_EVENTS];
      }
      if (global22[SYMBOL_BLACK_LISTED_EVENTS]) {
        Zone4[SYMBOL_BLACK_LISTED_EVENTS] = Zone4[SYMBOL_UNPATCHED_EVENTS] = global22[SYMBOL_BLACK_LISTED_EVENTS];
      }
      api2.patchEventPrototype = patchEventPrototype;
      api2.patchEventTarget = patchEventTarget;
      api2.ObjectDefineProperty = ObjectDefineProperty;
      api2.ObjectGetOwnPropertyDescriptor = ObjectGetOwnPropertyDescriptor;
      api2.ObjectCreate = ObjectCreate;
      api2.ArraySlice = ArraySlice;
      api2.patchClass = patchClass;
      api2.wrapWithCurrentZone = wrapWithCurrentZone;
      api2.filterProperties = filterProperties;
      api2.attachOriginToPatched = attachOriginToPatched;
      api2._redefineProperty = Object.defineProperty;
      api2.patchCallbacks = patchCallbacks;
      api2.getGlobalObjects = () => ({
        globalSources,
        zoneSymbolEventNames: zoneSymbolEventNames2,
        eventNames,
        isBrowser,
        isMix,
        isNode,
        TRUE_STR,
        FALSE_STR,
        ZONE_SYMBOL_PREFIX,
        ADD_EVENT_LISTENER_STR,
        REMOVE_EVENT_LISTENER_STR
      });
    });
  }
  function patchCommon(Zone3) {
    patchPromise(Zone3);
    patchToString(Zone3);
    patchUtil(Zone3);
  }
  var Zone2 = loadZone();
  patchCommon(Zone2);
  patchBrowser(Zone2);

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/OTLPExporterBase.js
  var OTLPExporterBase = class {
    constructor(delegate) {
      __publicField(this, "_delegate");
      this._delegate = delegate;
    }
    /**
     * Export items.
     * @param items
     * @param resultCallback
     */
    export(items, resultCallback) {
      this._delegate.export(items, resultCallback);
    }
    forceFlush() {
      return this._delegate.forceFlush();
    }
    shutdown() {
      return this._delegate.shutdown();
    }
    setMetrics(metrics2) {
      this._delegate.setMetrics(metrics2);
    }
  };

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/types.js
  var OTLPExporterError = class extends Error {
    constructor(message, code, data) {
      super(message);
      __publicField(this, "code");
      __publicField(this, "name", "OTLPExporterError");
      __publicField(this, "data");
      this.data = data;
      this.code = code;
    }
  };

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/shared-configuration.js
  function validateTimeoutMillis(timeoutMillis) {
    if (Number.isFinite(timeoutMillis) && timeoutMillis > 0) {
      return timeoutMillis;
    }
    throw new Error(`Configuration: timeoutMillis is invalid, expected number greater than 0 (actual: '${timeoutMillis}')`);
  }
  function wrapStaticHeadersInFunction(headers) {
    if (headers == null) {
      return void 0;
    }
    return async () => headers;
  }
  function mergeOtlpSharedConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration) {
    return {
      timeoutMillis: validateTimeoutMillis(userProvidedConfiguration.timeoutMillis ?? fallbackConfiguration.timeoutMillis ?? defaultConfiguration.timeoutMillis),
      concurrencyLimit: userProvidedConfiguration.concurrencyLimit ?? fallbackConfiguration.concurrencyLimit ?? defaultConfiguration.concurrencyLimit,
      compression: userProvidedConfiguration.compression ?? fallbackConfiguration.compression ?? defaultConfiguration.compression
    };
  }
  function getSharedConfigurationDefaults() {
    return {
      timeoutMillis: 1e4,
      concurrencyLimit: 30,
      compression: "none"
    };
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/bounded-queue-export-promise-handler.js
  var BoundedQueueExportPromiseHandler = class {
    /**
     * @param concurrencyLimit maximum promises allowed in a queue at the same time.
     */
    constructor(concurrencyLimit) {
      __publicField(this, "_concurrencyLimit");
      __publicField(this, "_sendingPromises", []);
      this._concurrencyLimit = concurrencyLimit;
    }
    pushPromise(promise) {
      if (this.hasReachedLimit()) {
        throw new Error("Concurrency Limit reached");
      }
      this._sendingPromises.push(promise);
      const popPromise = () => {
        const index = this._sendingPromises.indexOf(promise);
        void this._sendingPromises.splice(index, 1);
      };
      promise.then(popPromise, popPromise);
    }
    hasReachedLimit() {
      return this._sendingPromises.length >= this._concurrencyLimit;
    }
    async awaitAll() {
      await Promise.all(this._sendingPromises);
    }
  };
  function createBoundedQueueExportPromiseHandler(options) {
    return new BoundedQueueExportPromiseHandler(options.concurrencyLimit);
  }

  // node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
  var SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
  function suppressTracing(context2) {
    return context2.setValue(SUPPRESS_TRACING_KEY, true);
  }
  function isTracingSuppressed(context2) {
    return context2.getValue(SUPPRESS_TRACING_KEY) === true;
  }

  // node_modules/@opentelemetry/core/build/esm/baggage/constants.js
  var BAGGAGE_KEY_PAIR_SEPARATOR = "=";
  var BAGGAGE_PROPERTIES_SEPARATOR = ";";
  var BAGGAGE_ITEMS_SEPARATOR = ",";
  var BAGGAGE_HEADER = "baggage";
  var BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
  var BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
  var BAGGAGE_MAX_TOTAL_LENGTH = 8192;

  // node_modules/@opentelemetry/core/build/esm/baggage/utils.js
  function serializeKeyPairs(keyPairs) {
    return keyPairs.reduce((hValue, current) => {
      const value = `${hValue}${hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR : ""}${current}`;
      return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
    }, "");
  }
  function getKeyPairs(baggage) {
    return baggage.getAllEntries().map(([key, value]) => {
      let entry = `${encodeURIComponent(key)}=${encodeURIComponent(value.value)}`;
      if (value.metadata !== void 0) {
        entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
      }
      return entry;
    });
  }
  function parsePairKeyValue(entry) {
    if (!entry)
      return;
    const metadataSeparatorIndex = entry.indexOf(BAGGAGE_PROPERTIES_SEPARATOR);
    const keyPairPart = metadataSeparatorIndex === -1 ? entry : entry.substring(0, metadataSeparatorIndex);
    const separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
    if (separatorIndex <= 0)
      return;
    const rawKey = keyPairPart.substring(0, separatorIndex).trim();
    const rawValue = keyPairPart.substring(separatorIndex + 1).trim();
    if (!rawKey || !rawValue)
      return;
    let key;
    let value;
    try {
      key = decodeURIComponent(rawKey);
      value = decodeURIComponent(rawValue);
    } catch {
      return;
    }
    let metadata;
    if (metadataSeparatorIndex !== -1 && metadataSeparatorIndex < entry.length - 1) {
      const metadataString = entry.substring(metadataSeparatorIndex + 1);
      metadata = baggageEntryMetadataFromString(metadataString);
    }
    return { key, value, metadata };
  }
  function parseBaggageHeaderString(value, baggage, count, totalSize) {
    let start = 0;
    while (start < value.length && count < BAGGAGE_MAX_NAME_VALUE_PAIRS) {
      const end = value.indexOf(BAGGAGE_ITEMS_SEPARATOR, start);
      const entryEnd = end === -1 ? value.length : end;
      const entryLength = entryEnd - start;
      if (entryLength <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS) {
        const keyPair = parsePairKeyValue(value.substring(start, entryEnd));
        if (keyPair) {
          const entrySize = (count === 0 ? 0 : 1) + entryLength;
          if (totalSize + entrySize > BAGGAGE_MAX_TOTAL_LENGTH)
            break;
          baggage[keyPair.key] = keyPair.metadata ? { value: keyPair.value, metadata: keyPair.metadata } : { value: keyPair.value };
          count++;
          totalSize += entrySize;
        }
      }
      if (end === -1)
        break;
      start = end + 1;
    }
    return [count, totalSize];
  }

  // node_modules/@opentelemetry/core/build/esm/baggage/propagation/W3CBaggagePropagator.js
  var W3CBaggagePropagator = class {
    inject(context2, carrier, setter) {
      const baggage = propagation.getBaggage(context2);
      if (!baggage || isTracingSuppressed(context2))
        return;
      const keyPairs = getKeyPairs(baggage).filter((pair) => {
        return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
      }).slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
      const headerValue = serializeKeyPairs(keyPairs);
      if (headerValue.length > 0) {
        setter.set(carrier, BAGGAGE_HEADER, headerValue);
      }
    }
    extract(context2, carrier, getter) {
      const headerValue = getter.get(carrier, BAGGAGE_HEADER);
      if (!headerValue) {
        return context2;
      }
      const baggage = {};
      let count = 0;
      let totalSize = 0;
      if (Array.isArray(headerValue)) {
        for (let i2 = 0; i2 < headerValue.length; i2++) {
          [count, totalSize] = parseBaggageHeaderString(headerValue[i2], baggage, count, totalSize);
        }
      } else {
        [count] = parseBaggageHeaderString(headerValue, baggage, count, totalSize);
      }
      if (count === 0) {
        return context2;
      }
      return propagation.setBaggage(context2, propagation.createBaggage(baggage));
    }
    fields() {
      return [BAGGAGE_HEADER];
    }
  };

  // node_modules/@opentelemetry/core/build/esm/common/attributes.js
  function sanitizeAttributes(attributes) {
    const out = {};
    if (typeof attributes !== "object" || attributes == null) {
      return out;
    }
    for (const key in attributes) {
      if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
        continue;
      }
      if (!isAttributeKey(key)) {
        diag2.warn(`Invalid attribute key: ${key}`);
        continue;
      }
      const val = attributes[key];
      if (!isAttributeValue(val)) {
        diag2.warn(`Invalid attribute value set for key: ${key}`);
        continue;
      }
      if (Array.isArray(val)) {
        out[key] = val.slice();
      } else {
        out[key] = val;
      }
    }
    return out;
  }
  function isAttributeKey(key) {
    return typeof key === "string" && key !== "";
  }
  function isAttributeValue(val) {
    if (val == null) {
      return true;
    }
    if (Array.isArray(val)) {
      return isHomogeneousAttributeValueArray(val);
    }
    return isValidPrimitiveAttributeValueType(typeof val);
  }
  function isHomogeneousAttributeValueArray(arr) {
    let type;
    for (const element of arr) {
      if (element == null)
        continue;
      const elementType = typeof element;
      if (elementType === type) {
        continue;
      }
      if (!type) {
        if (isValidPrimitiveAttributeValueType(elementType)) {
          type = elementType;
          continue;
        }
        return false;
      }
      return false;
    }
    return true;
  }
  function isValidPrimitiveAttributeValueType(valType) {
    switch (valType) {
      case "number":
      case "boolean":
      case "string":
        return true;
    }
    return false;
  }

  // node_modules/@opentelemetry/core/build/esm/common/logging-error-handler.js
  function loggingErrorHandler() {
    return (ex) => {
      diag2.error(stringifyException(ex));
    };
  }
  function stringifyException(ex) {
    if (typeof ex === "string") {
      return ex;
    } else {
      return JSON.stringify(flattenException(ex));
    }
  }
  function flattenException(ex) {
    const result = {};
    let current = ex;
    while (current !== null) {
      Object.getOwnPropertyNames(current).forEach((propertyName) => {
        if (result[propertyName])
          return;
        const value = current[propertyName];
        if (value) {
          result[propertyName] = String(value);
        }
      });
      current = Object.getPrototypeOf(current);
    }
    return result;
  }

  // node_modules/@opentelemetry/core/build/esm/common/global-error-handler.js
  var delegateHandler = loggingErrorHandler();
  function globalErrorHandler(ex) {
    try {
      delegateHandler(ex);
    } catch {
    }
  }

  // node_modules/@opentelemetry/core/build/esm/platform/browser/environment.js
  function getStringFromEnv(_2) {
    return void 0;
  }
  function getNumberFromEnv(_2) {
    return void 0;
  }
  function getStringListFromEnv(_2) {
    return void 0;
  }

  // node_modules/@opentelemetry/core/build/esm/version.js
  var VERSION2 = "2.11.0";

  // node_modules/@opentelemetry/semantic-conventions/build/esm/stable_attributes.js
  var ATTR_ERROR_TYPE = "error.type";
  var ATTR_EXCEPTION_MESSAGE = "exception.message";
  var ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
  var ATTR_EXCEPTION_TYPE = "exception.type";
  var ATTR_HTTP_REQUEST_METHOD = "http.request.method";
  var ATTR_HTTP_REQUEST_METHOD_ORIGINAL = "http.request.method_original";
  var ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
  var ATTR_SERVER_ADDRESS = "server.address";
  var ATTR_SERVER_PORT = "server.port";
  var ATTR_SERVICE_NAME = "service.name";
  var ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
  var TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
  var ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
  var ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
  var ATTR_URL_FULL = "url.full";
  var ATTR_USER_AGENT_ORIGINAL = "user_agent.original";

  // node_modules/@opentelemetry/core/build/esm/semconv.js
  var ATTR_PROCESS_RUNTIME_NAME = "process.runtime.name";

  // node_modules/@opentelemetry/core/build/esm/platform/browser/sdk-info.js
  var SDK_INFO = {
    [ATTR_TELEMETRY_SDK_NAME]: "opentelemetry",
    [ATTR_PROCESS_RUNTIME_NAME]: "browser",
    [ATTR_TELEMETRY_SDK_LANGUAGE]: TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS,
    [ATTR_TELEMETRY_SDK_VERSION]: VERSION2
  };

  // node_modules/@opentelemetry/core/build/esm/platform/browser/index.js
  var otperformance = performance;

  // node_modules/@opentelemetry/core/build/esm/common/time.js
  var NANOSECOND_DIGITS = 9;
  var NANOSECOND_DIGITS_IN_MILLIS = 6;
  var MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
  var SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
  function millisToHrTime(epochMillis) {
    const epochSeconds = epochMillis / 1e3;
    const seconds = Math.trunc(epochSeconds);
    const nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS);
    return [seconds, nanos];
  }
  function hrTime(performanceNow) {
    const timeOrigin = millisToHrTime(otperformance.timeOrigin);
    const now = millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now());
    return addHrTimes(timeOrigin, now);
  }
  function timeInputToHrTime(time) {
    if (isTimeInputHrTime(time)) {
      return time;
    } else if (typeof time === "number") {
      if (time < otperformance.timeOrigin / 2) {
        return hrTime(time);
      } else {
        return millisToHrTime(time);
      }
    } else if (time instanceof Date) {
      return millisToHrTime(time.getTime());
    } else {
      throw TypeError("Invalid input type");
    }
  }
  function hrTimeDuration(startTime, endTime) {
    let seconds = endTime[0] - startTime[0];
    let nanos = endTime[1] - startTime[1];
    if (nanos < 0) {
      seconds -= 1;
      nanos += SECOND_TO_NANOSECONDS;
    }
    return [seconds, nanos];
  }
  function hrTimeToNanoseconds(time) {
    return time[0] * SECOND_TO_NANOSECONDS + time[1];
  }
  function hrTimeToMilliseconds(time) {
    return time[0] * 1e3 + time[1] / 1e6;
  }
  function isTimeInputHrTime(value) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
  }
  function isTimeInput(value) {
    return isTimeInputHrTime(value) || typeof value === "number" || value instanceof Date;
  }
  function addHrTimes(time1, time2) {
    const out = [time1[0] + time2[0], time1[1] + time2[1]];
    if (out[1] >= SECOND_TO_NANOSECONDS) {
      out[1] -= SECOND_TO_NANOSECONDS;
      out[0] += 1;
    }
    return out;
  }

  // node_modules/@opentelemetry/core/build/esm/ExportResult.js
  var ExportResultCode;
  (function(ExportResultCode2) {
    ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
    ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
  })(ExportResultCode || (ExportResultCode = {}));

  // node_modules/@opentelemetry/core/build/esm/propagation/composite.js
  var CompositePropagator = class {
    /**
     * Construct a composite propagator from a list of propagators.
     *
     * @param [config] Configuration object for composite propagator
     */
    constructor(config = {}) {
      __publicField(this, "_propagators");
      __publicField(this, "_fields");
      this._propagators = config.propagators ?? [];
      const fields = /* @__PURE__ */ new Set();
      for (const propagator of this._propagators) {
        const propagatorFields = typeof propagator.fields === "function" ? propagator.fields() : [];
        for (const field of propagatorFields) {
          fields.add(field);
        }
      }
      this._fields = Array.from(fields);
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same carrier key, the propagator later in the list
     * will "win".
     *
     * @param context Context to inject
     * @param carrier Carrier into which context will be injected
     */
    inject(context2, carrier, setter) {
      for (const propagator of this._propagators) {
        try {
          propagator.inject(context2, carrier, setter);
        } catch (err) {
          diag2.warn(`Failed to inject with ${propagator.constructor.name}. Err: ${err.message}`);
        }
      }
    }
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same context key, the propagator later in the list
     * will "win".
     *
     * @param context Context to add values to
     * @param carrier Carrier from which to extract context
     */
    extract(context2, carrier, getter) {
      return this._propagators.reduce((ctx, propagator) => {
        try {
          return propagator.extract(ctx, carrier, getter);
        } catch (err) {
          diag2.warn(`Failed to extract with ${propagator.constructor.name}. Err: ${err.message}`);
        }
        return ctx;
      }, context2);
    }
    fields() {
      return this._fields.slice();
    }
  };

  // node_modules/@opentelemetry/core/build/esm/internal/validators.js
  var VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
  var VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
  var VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
  var VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
  var VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
  var INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
  function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
  }
  function validateValue(value) {
    return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
  }

  // node_modules/@opentelemetry/core/build/esm/trace/TraceState.js
  var MAX_TRACE_STATE_ITEMS = 32;
  var MAX_TRACE_STATE_LEN = 512;
  var LIST_MEMBERS_SEPARATOR = ",";
  var LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
  var TraceState = class _TraceState {
    constructor(rawTraceState) {
      __publicField(this, "_length");
      __publicField(this, "_rawTraceState");
      __publicField(this, "_internalState");
      this._rawTraceState = typeof rawTraceState === "string" ? rawTraceState : "";
      this._length = this._rawTraceState.length;
    }
    set(key, value) {
      if (!validateKey(key) || !validateValue(value)) {
        return this;
      }
      const currState = this._getState();
      const currValue = currState.get(key);
      let newLength = this._length;
      if (typeof currValue === "string") {
        newLength += value.length - currValue.length;
      } else {
        newLength += key.length + value.length + (currState.size > 0 ? 2 : 1);
      }
      if (newLength > MAX_TRACE_STATE_LEN) {
        return this;
      }
      const newState = new Map(currState);
      newState.delete(key);
      newState.set(key, value);
      return this._fromState(newState, newLength);
    }
    unset(key) {
      const currState = this._getState();
      const currValue = currState.get(key);
      if (typeof currValue !== "string") {
        return this;
      }
      let newLength = this._length - (key.length + currValue.length + 1);
      if (currState.size > 1) {
        newLength = newLength - 1;
      }
      const newState = new Map(currState);
      newState.delete(key);
      return this._fromState(newState, newLength);
    }
    get(key) {
      const currState = this._getState();
      return currState.get(key);
    }
    serialize() {
      let serialized = "";
      let index = 0;
      for (const entry of this._getState()) {
        if (index > 0) {
          serialized = LIST_MEMBERS_SEPARATOR + serialized;
        }
        serialized = `${entry[0]}${LIST_MEMBER_KEY_VALUE_SPLITTER}${entry[1]}` + serialized;
        index++;
      }
      return serialized;
    }
    _getState() {
      if (this._internalState) {
        return this._internalState;
      }
      const vendorMembers = this._rawTraceState.split(LIST_MEMBERS_SEPARATOR);
      const vendorEntries = /* @__PURE__ */ new Map();
      let currentLength = 0;
      for (const member of vendorMembers) {
        const m2 = member.trim();
        const idx = m2.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
        if (idx === -1) {
          continue;
        }
        const key = m2.slice(0, idx);
        const value = m2.slice(idx + 1);
        if (!validateKey(key) || !validateValue(value)) {
          continue;
        }
        const futureLength = currentLength + m2.length + (vendorEntries.size > 0 ? 1 : 0);
        if (futureLength > MAX_TRACE_STATE_LEN) {
          continue;
        }
        vendorEntries.set(key, value);
        currentLength = futureLength;
        if (vendorEntries.size >= MAX_TRACE_STATE_ITEMS) {
          break;
        }
      }
      this._length = currentLength;
      this._internalState = new Map(Array.from(vendorEntries.entries()).reverse());
      return this._internalState;
    }
    _fromState(state, length) {
      const traceState = Object.create(_TraceState.prototype);
      traceState._internalState = state;
      traceState._length = length;
      return traceState;
    }
  };

  // node_modules/@opentelemetry/core/build/esm/trace/W3CTraceContextPropagator.js
  var TRACE_PARENT_HEADER = "traceparent";
  var TRACE_STATE_HEADER = "tracestate";
  var VERSION3 = "00";
  var VERSION_PART = "(?!ff)[\\da-f]{2}";
  var TRACE_ID_PART = "(?![0]{32})[\\da-f]{32}";
  var PARENT_ID_PART = "(?![0]{16})[\\da-f]{16}";
  var FLAGS_PART = "[\\da-f]{2}";
  var TRACE_PARENT_REGEX = new RegExp(`^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`);
  function parseTraceParent(traceParent) {
    const match = TRACE_PARENT_REGEX.exec(traceParent);
    if (!match)
      return null;
    if (match[1] === "00" && match[5])
      return null;
    return {
      traceId: match[2],
      spanId: match[3],
      traceFlags: parseInt(match[4], 16)
    };
  }
  var W3CTraceContextPropagator = class {
    inject(context2, carrier, setter) {
      const spanContext = trace.getSpanContext(context2);
      if (!spanContext || isTracingSuppressed(context2) || !isSpanContextValid(spanContext))
        return;
      const traceParent = `${VERSION3}-${spanContext.traceId}-${spanContext.spanId}-0${Number(spanContext.traceFlags || TraceFlags.NONE).toString(16)}`;
      setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
      if (spanContext.traceState) {
        setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
      }
    }
    extract(context2, carrier, getter) {
      const traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER);
      if (!traceParentHeader)
        return context2;
      const traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
      if (typeof traceParent !== "string")
        return context2;
      const spanContext = parseTraceParent(traceParent);
      if (!spanContext)
        return context2;
      spanContext.isRemote = true;
      const traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
      if (traceStateHeader) {
        const state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
        spanContext.traceState = new TraceState(typeof state === "string" ? state : void 0);
      }
      return trace.setSpanContext(context2, spanContext);
    }
    fields() {
      return [TRACE_PARENT_HEADER, TRACE_STATE_HEADER];
    }
  };

  // node_modules/@opentelemetry/core/build/esm/utils/lodash.merge.js
  var objectTag = "[object Object]";
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  var objectCtorString = funcToString.call(Object);
  var getPrototypeOf = Object.getPrototypeOf;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
  var nativeObjectToString = objectProto.toString;
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
      return false;
    }
    const proto = getPrototypeOf(value);
    if (proto === null) {
      return true;
    }
    const Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
  }
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  function getRawTag(value) {
    const isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    let unmasked = false;
    try {
      value[symToStringTag] = void 0;
      unmasked = true;
    } catch {
    }
    const result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  // node_modules/@opentelemetry/core/build/esm/utils/merge.js
  var MAX_LEVEL = 20;
  function merge(...args) {
    let result = args.shift();
    const objects = /* @__PURE__ */ new WeakMap();
    while (args.length > 0) {
      result = mergeTwoObjects(result, args.shift(), 0, objects);
    }
    return result;
  }
  function takeValue(value) {
    if (isArray(value)) {
      return value.slice();
    }
    return value;
  }
  function mergeTwoObjects(one, two, level = 0, objects) {
    let result;
    if (level > MAX_LEVEL) {
      return void 0;
    }
    level++;
    if (isPrimitive(one) || isPrimitive(two) || isFunction2(two)) {
      result = takeValue(two);
    } else if (isArray(one)) {
      result = one.slice();
      if (isArray(two)) {
        for (let i2 = 0, j = two.length; i2 < j; i2++) {
          result.push(takeValue(two[i2]));
        }
      } else if (isObject(two)) {
        const keys = Object.keys(two);
        for (let i2 = 0, j = keys.length; i2 < j; i2++) {
          const key = keys[i2];
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
          }
          result[key] = takeValue(two[key]);
        }
      }
    } else if (isObject(one)) {
      if (isObject(two)) {
        if (!shouldMerge(one, two)) {
          return two;
        }
        result = Object.assign({}, one);
        const keys = Object.keys(two);
        for (let i2 = 0, j = keys.length; i2 < j; i2++) {
          const key = keys[i2];
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
          }
          const twoValue = two[key];
          if (isPrimitive(twoValue)) {
            if (typeof twoValue === "undefined") {
              delete result[key];
            } else {
              result[key] = twoValue;
            }
          } else {
            const obj1 = result[key];
            const obj2 = twoValue;
            if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) {
              delete result[key];
            } else {
              if (isObject(obj1) && isObject(obj2)) {
                const arr1 = objects.get(obj1) || [];
                const arr2 = objects.get(obj2) || [];
                arr1.push({ obj: one, key });
                arr2.push({ obj: two, key });
                objects.set(obj1, arr1);
                objects.set(obj2, arr2);
              }
              result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
            }
          }
        }
      } else {
        result = two;
      }
    }
    return result;
  }
  function wasObjectReferenced(obj, key, objects) {
    const arr = objects.get(obj[key]) || [];
    for (let i2 = 0, j = arr.length; i2 < j; i2++) {
      const info = arr[i2];
      if (info.key === key && info.obj === obj) {
        return true;
      }
    }
    return false;
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isFunction2(value) {
    return typeof value === "function";
  }
  function isObject(value) {
    return !isPrimitive(value) && !isArray(value) && !isFunction2(value) && typeof value === "object";
  }
  function isPrimitive(value) {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
  }
  function shouldMerge(one, two) {
    if (!isPlainObject(one) || !isPlainObject(two)) {
      return false;
    }
    return true;
  }

  // node_modules/@opentelemetry/core/build/esm/utils/timeout.js
  var TimeoutError = class _TimeoutError extends Error {
    constructor(message) {
      super(message);
      Object.setPrototypeOf(this, _TimeoutError.prototype);
    }
  };
  function callWithTimeout(promise, timeout) {
    let timeoutHandle;
    const timeoutPromise = new Promise(function timeoutFunction(_resolve, reject) {
      timeoutHandle = setTimeout(function timeoutHandler() {
        reject(new TimeoutError("Operation timed out."));
      }, timeout);
    });
    return Promise.race([promise, timeoutPromise]).then((result) => {
      clearTimeout(timeoutHandle);
      return result;
    }, (reason) => {
      clearTimeout(timeoutHandle);
      throw reason;
    });
  }

  // node_modules/@opentelemetry/core/build/esm/utils/url.js
  function urlMatches(url, urlToMatch) {
    if (typeof urlToMatch === "string") {
      return url === urlToMatch;
    } else {
      return !!url.match(urlToMatch);
    }
  }
  function isUrlIgnored(url, ignoredUrls) {
    if (!ignoredUrls) {
      return false;
    }
    for (const ignoreUrl of ignoredUrls) {
      if (urlMatches(url, ignoreUrl)) {
        return true;
      }
    }
    return false;
  }

  // node_modules/@opentelemetry/core/build/esm/utils/promise.js
  var Deferred = class {
    constructor() {
      __publicField(this, "_promise");
      __publicField(this, "_resolve");
      __publicField(this, "_reject");
      this._promise = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      });
    }
    get promise() {
      return this._promise;
    }
    resolve(val) {
      this._resolve(val);
    }
    reject(err) {
      this._reject(err);
    }
  };

  // node_modules/@opentelemetry/core/build/esm/utils/callback.js
  var BindOnceFuture = class {
    constructor(callback, that) {
      __publicField(this, "_isCalled", false);
      __publicField(this, "_deferred", new Deferred());
      __publicField(this, "_callback");
      __publicField(this, "_that");
      this._callback = callback;
      this._that = that;
    }
    get isCalled() {
      return this._isCalled;
    }
    get promise() {
      return this._deferred.promise;
    }
    call(...args) {
      if (!this._isCalled) {
        this._isCalled = true;
        try {
          Promise.resolve(this._callback.call(this._that, ...args)).then((val) => this._deferred.resolve(val), (err) => this._deferred.reject(err));
        } catch (err) {
          this._deferred.reject(err);
        }
      }
      return this._deferred.promise;
    }
  };

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/logging-response-handler.js
  function isPartialSuccessResponse(response) {
    return Object.prototype.hasOwnProperty.call(response, "partialSuccess");
  }
  function createLoggingPartialSuccessResponseHandler() {
    return {
      handleResponse(response) {
        if (response == null || !isPartialSuccessResponse(response) || response.partialSuccess == null || Object.keys(response.partialSuccess).length === 0) {
          return;
        }
        diag2.warn("Received Partial Success response:", JSON.stringify(response.partialSuccess));
      }
    };
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-export-delegate.js
  var OTLPExportDelegate = class {
    constructor(transport, serializer, responseHandler, promiseQueue, metrics2, timeout) {
      __publicField(this, "_metrics");
      __publicField(this, "_diagLogger");
      __publicField(this, "_transport");
      __publicField(this, "_serializer");
      __publicField(this, "_responseHandler");
      __publicField(this, "_promiseQueue");
      __publicField(this, "_timeout");
      this._transport = transport;
      this._serializer = serializer;
      this._responseHandler = responseHandler;
      this._promiseQueue = promiseQueue;
      this._timeout = timeout;
      this._diagLogger = diag2.createComponentLogger({
        namespace: "OTLPExportDelegate"
      });
      this._metrics = metrics2;
    }
    export(internalRepresentation, resultCallback) {
      this._diagLogger.debug("items to be sent", internalRepresentation);
      if (this._promiseQueue.hasReachedLimit()) {
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error("Concurrent export limit reached")
        });
        return;
      }
      const serializedRequest = this._serializer.serializeRequest(internalRepresentation);
      if (serializedRequest == null) {
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error("Nothing to send")
        });
        return;
      }
      const finishExport = this._metrics.startExport(internalRepresentation);
      this._promiseQueue.pushPromise(this._transport.send(serializedRequest, this._timeout).then((response) => {
        if (response.status === "success") {
          finishExport(void 0);
          if (response.data != null) {
            try {
              this._responseHandler.handleResponse(this._serializer.deserializeResponse(response.data));
            } catch (e2) {
              this._diagLogger.warn("Export succeeded but could not deserialize response - is the response specification compliant?", e2, response.data);
            }
          }
          resultCallback({
            code: ExportResultCode.SUCCESS
          });
          return;
        } else if (response.status === "failure" && response.error) {
          finishExport(response.error);
          resultCallback({
            code: ExportResultCode.FAILED,
            error: response.error
          });
          return;
        } else if (response.status === "retryable") {
          finishExport("export_max_retries");
          resultCallback({
            code: ExportResultCode.FAILED,
            error: response.error ?? new OTLPExporterError("Export failed with retryable status")
          });
        } else {
          finishExport("export_failed");
          resultCallback({
            code: ExportResultCode.FAILED,
            error: new OTLPExporterError("Export failed with unknown error")
          });
        }
      }, (reason) => {
        finishExport(reason);
        resultCallback({
          code: ExportResultCode.FAILED,
          error: reason
        });
      }));
    }
    forceFlush() {
      return this._promiseQueue.awaitAll();
    }
    setMetrics(metrics2) {
      this._metrics = metrics2;
    }
    async shutdown() {
      this._diagLogger.debug("shutdown started");
      await this.forceFlush();
      this._transport.shutdown();
    }
  };
  function createOtlpExportDelegate(components, settings) {
    return new OTLPExportDelegate(components.transport, components.serializer, createLoggingPartialSuccessResponseHandler(), components.promiseHandler, components.metrics, settings.timeout);
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-network-export-delegate.js
  function createOtlpNetworkExportDelegate(options, serializer, metrics2, transport) {
    return createOtlpExportDelegate({
      transport,
      serializer,
      promiseHandler: createBoundedQueueExportPromiseHandler(options),
      metrics: metrics2
    }, { timeout: options.timeoutMillis });
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/semconv.js
  var ATTR_HTTP_RESPONSE_STATUS_CODE2 = "http.response.status_code";
  var ATTR_OTEL_COMPONENT_NAME = "otel.component.name";
  var ATTR_OTEL_COMPONENT_TYPE = "otel.component.type";
  var ATTR_SERVER_ADDRESS2 = "server.address";
  var ATTR_SERVER_PORT2 = "server.port";
  var ATTR_ERROR_TYPE2 = "error.type";

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/version.js
  var VERSION4 = "0.222.0";

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/ExporterMetrics.js
  var componentCounter = /* @__PURE__ */ new Map();
  var ExporterMetrics = class {
    constructor(options) {
      __publicField(this, "inflight");
      __publicField(this, "exported");
      __publicField(this, "duration");
      __publicField(this, "standardAttrs");
      __publicField(this, "responseAttributesFromError");
      __publicField(this, "helper");
      const { componentType, metricsHelper, meterProvider, url, responseAttributesFromError } = options;
      this.responseAttributesFromError = responseAttributesFromError;
      const meter = meterProvider ? meterProvider.getMeter("@opentelemetry/otlp-exporter", VERSION4) : createNoopMeter();
      const counter = componentCounter.get(componentType) ?? 0;
      componentCounter.set(componentType, counter + 1);
      this.standardAttrs = {
        [ATTR_OTEL_COMPONENT_TYPE]: componentType,
        [ATTR_OTEL_COMPONENT_NAME]: `${componentType}/${counter}`
      };
      if (url) {
        let urlToParse = url;
        if (!url.includes("://")) {
          urlToParse = `http://${url}`;
        }
        try {
          const parsedUrl = new URL(urlToParse);
          this.standardAttrs[ATTR_SERVER_ADDRESS2] = parsedUrl.hostname;
          let port = void 0;
          if (parsedUrl.port) {
            port = Number(parsedUrl.port);
          } else if (parsedUrl.protocol === "http:") {
            port = 80;
          } else if (parsedUrl.protocol === "https:") {
            port = 443;
          }
          if (typeof port === "number") {
            this.standardAttrs[ATTR_SERVER_PORT2] = port;
          }
        } catch {
        }
      }
      this.helper = metricsHelper;
      this.inflight = meter.createUpDownCounter(`otel.sdk.exporter.${this.helper.name}.inflight`, {
        unit: `{${this.helper.name}}`,
        description: `The number of ${this.helper.name}s which were passed to the exporter, but that have not been exported yet (neither successful, nor failed).`
      });
      this.exported = meter.createCounter(`otel.sdk.exporter.${this.helper.name}.exported`, {
        unit: `{${this.helper.name}}`,
        description: `The number of ${this.helper.name}s for which the export has finished, either successful or failed.`
      });
      this.duration = meter.createHistogram("otel.sdk.exporter.operation.duration", {
        unit: "s",
        description: "The duration of exporting a batch of telemetry records.",
        advice: {
          explicitBucketBoundaries: []
        }
      });
    }
    startExport(request) {
      const numItems = this.helper.countItems(request);
      const startTime = hrTime();
      this.inflight.add(numItems, this.standardAttrs);
      return (error) => {
        const endTime = hrTime();
        this.inflight.add(-numItems, this.standardAttrs);
        const exportedAttrs = error ? {
          ...this.standardAttrs,
          [ATTR_ERROR_TYPE2]: error instanceof Error ? error.name : "export_failed"
        } : this.standardAttrs;
        this.exported.add(numItems, exportedAttrs);
        const durationAttrs = {
          ...exportedAttrs,
          ...this.responseAttributesFromError(error)
        };
        const duration = hrTimeToMilliseconds(hrTimeDuration(startTime, endTime)) / 1e3;
        this.duration.record(duration, durationAttrs);
      };
    }
  };

  // node_modules/@opentelemetry/otlp-transformer/build/esm/trace/index.js
  var TraceExporterMetricsHelper = {
    name: "span",
    countItems: (request) => request.length
  };

  // node_modules/@opentelemetry/otlp-transformer/build/esm/logs/index.js
  var LogsExporterMetricsHelper = {
    name: "log",
    countItems: (request) => request.length
  };

  // node_modules/@opentelemetry/otlp-transformer/build/esm/common/protobuf/utils.js
  function estimateVarintSize(v2) {
    if (v2 < 0)
      return 10;
    if (v2 < 128)
      return 1;
    if (v2 < 16384)
      return 2;
    if (v2 < 2097152)
      return 3;
    if (v2 < 268435456)
      return 4;
    if (v2 < 34359738368)
      return 5;
    if (v2 < 4398046511104)
      return 6;
    if (v2 < 562949953421312)
      return 7;
    if (v2 < 72057594037927940)
      return 8;
    return 9;
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/common/protobuf/protobuf-writer.js
  var GROWING_BUFFER_DEBUG_MESSAGE = "ProtobufWriter: estimated size was too small, growing buffer.";
  var RESERVED_LENGTH_BYTES = 1;
  var ProtobufWriter = class {
    constructor(estimatedSize = 65536) {
      __publicField(this, "_buffer");
      // Avoid using TextEncoder type. While the global is there on all supported runtimes, types may differ.
      __publicField(this, "_textEncoder");
      __publicField(this, "_dataView");
      __publicField(this, "pos", 0);
      this._buffer = new Uint8Array(estimatedSize);
      this._textEncoder = new TextEncoder();
      this._dataView = new DataView(this._buffer.buffer, this._buffer.byteOffset);
    }
    /**
     * Ensure buffer has capacity for at least size more bytes
     */
    _ensureCapacity(size) {
      const needed = this.pos + size;
      if (needed <= this._buffer.length) {
        return;
      }
      diag2.debug(GROWING_BUFFER_DEBUG_MESSAGE);
      let newSize = this._buffer.length * 2;
      while (newSize < needed) {
        newSize *= 2;
      }
      const newBuffer = new Uint8Array(newSize);
      newBuffer.set(this._buffer);
      this._buffer = newBuffer;
      this._dataView = new DataView(this._buffer.buffer, this._buffer.byteOffset);
    }
    /**
     * Get the written bytes as a Uint8Array
     */
    finish() {
      return this._buffer.subarray(0, this.pos);
    }
    /**
     * Insert placeholder for length. Update later with {@link finishLengthDelimited}
     * Returns the position where to write the length.
     */
    startLengthDelimited() {
      const lengthPos = this.pos;
      this._ensureCapacity(RESERVED_LENGTH_BYTES);
      this.pos += RESERVED_LENGTH_BYTES;
      return lengthPos;
    }
    /**
     * Write length varint at placeholder position and shift content forward if needed.
     * Most messages are small (< 128 bytes), so we reserve 1 byte and only shift
     * when the length needs more bytes.
     */
    finishLengthDelimited(pos, length) {
      const v2 = length >>> 0;
      const varintSize = estimateVarintSize(v2);
      if (varintSize > RESERVED_LENGTH_BYTES) {
        const additionalBytes = varintSize - RESERVED_LENGTH_BYTES;
        this._ensureCapacity(additionalBytes);
        this._buffer.copyWithin(pos + varintSize, pos + RESERVED_LENGTH_BYTES, this.pos);
        this.pos += additionalBytes;
      }
      let writePos = pos;
      if (v2 < 128) {
        this._buffer[writePos] = v2;
      } else if (v2 < 16384) {
        this._buffer[writePos++] = v2 & 127 | 128;
        this._buffer[writePos] = v2 >>> 7;
      } else if (v2 < 2097152) {
        this._buffer[writePos++] = v2 & 127 | 128;
        this._buffer[writePos++] = v2 >>> 7 & 127 | 128;
        this._buffer[writePos] = v2 >>> 14;
      } else if (v2 < 268435456) {
        this._buffer[writePos++] = v2 & 127 | 128;
        this._buffer[writePos++] = v2 >>> 7 & 127 | 128;
        this._buffer[writePos++] = v2 >>> 14 & 127 | 128;
        this._buffer[writePos] = v2 >>> 21;
      } else {
        this._buffer[writePos++] = v2 & 127 | 128;
        this._buffer[writePos++] = v2 >>> 7 & 127 | 128;
        this._buffer[writePos++] = v2 >>> 14 & 127 | 128;
        this._buffer[writePos++] = v2 >>> 21 & 127 | 128;
        this._buffer[writePos] = v2 >>> 28;
      }
    }
    /**
     * Write a sint32 value using zigzag encoding
     */
    writeSint32(value) {
      this.writeVarint((value << 1 ^ value >> 31) >>> 0);
    }
    /**
     * Write a signed 64-bit fixed integer (sfixed64) from a JS number.
     * Handles negative values via two's complement.
     */
    writeSfixed64(value) {
      let low;
      let high;
      if (value >= 0) {
        low = value >>> 0;
        high = value / 4294967296 >>> 0;
      } else {
        const abs = Math.abs(value);
        low = abs >>> 0;
        high = abs / 4294967296 >>> 0;
        low = ~low >>> 0;
        high = ~high >>> 0;
        low = low + 1 >>> 0;
        if (low === 0) {
          high = high + 1 >>> 0;
        }
      }
      this.writeFixed64(low, high);
    }
    /**
     * Write a varint (variable-length integer)
     */
    writeVarint(value) {
      this._ensureCapacity(estimateVarintSize(value));
      if (value >= 0 && value <= 4294967295) {
        let v2 = value >>> 0;
        while (v2 > 127) {
          this._buffer[this.pos++] = v2 & 127 | 128;
          v2 >>>= 7;
        }
        this._buffer[this.pos++] = v2;
      } else {
        let low;
        let high;
        if (value >= 0) {
          low = value >>> 0;
          high = value / 4294967296 >>> 0;
        } else {
          const abs = Math.abs(value);
          low = abs >>> 0;
          high = abs / 4294967296 >>> 0;
          low = ~low >>> 0;
          high = ~high >>> 0;
          low = low + 1 >>> 0;
          if (low === 0) {
            high = high + 1 >>> 0;
          }
        }
        while (high > 0 || low > 127) {
          this._buffer[this.pos++] = low & 127 | 128;
          low = (low >>> 7 | high << 25) >>> 0;
          high >>>= 7;
        }
        this._buffer[this.pos++] = low & 127;
      }
    }
    /**
     * Write a 32-bit fixed integer (little-endian)
     */
    writeFixed32(value) {
      this._ensureCapacity(4);
      const v2 = value >>> 0;
      this._buffer[this.pos++] = v2 & 255;
      this._buffer[this.pos++] = v2 >>> 8 & 255;
      this._buffer[this.pos++] = v2 >>> 16 & 255;
      this._buffer[this.pos++] = v2 >>> 24 & 255;
    }
    /**
     * Write a 64-bit fixed integer (little-endian)
     * @param low - Low 32 bits
     * @param high - High 32 bits
     */
    writeFixed64(low, high) {
      this._ensureCapacity(8);
      const l2 = low >>> 0;
      const h2 = high >>> 0;
      this._buffer[this.pos++] = l2 & 255;
      this._buffer[this.pos++] = l2 >>> 8 & 255;
      this._buffer[this.pos++] = l2 >>> 16 & 255;
      this._buffer[this.pos++] = l2 >>> 24 & 255;
      this._buffer[this.pos++] = h2 & 255;
      this._buffer[this.pos++] = h2 >>> 8 & 255;
      this._buffer[this.pos++] = h2 >>> 16 & 255;
      this._buffer[this.pos++] = h2 >>> 24 & 255;
    }
    /**
     * Write length-delimited data (varint length + bytes)
     */
    writeBytes(bytes) {
      this.writeVarint(bytes.length);
      this._ensureCapacity(bytes.length);
      this._buffer.set(bytes, this.pos);
      this.pos += bytes.length;
    }
    /**
     * Write a field key (field number + wire type)
     */
    writeTag(fieldNumber, wireType) {
      this.writeVarint(fieldNumber << 3 | wireType);
    }
    /**
     * Write a double (64-bit IEEE 754)
     */
    writeDouble(value) {
      this._ensureCapacity(8);
      this._dataView.setFloat64(this.pos, value, true);
      this.pos += 8;
    }
    /**
     * Write a string as UTF-8 bytes (length-delimited)
     */
    writeString(str) {
      let isAscii = true;
      const len = str.length;
      for (let i2 = 0; i2 < len; i2++) {
        if (str.charCodeAt(i2) > 127) {
          isAscii = false;
          break;
        }
      }
      if (isAscii) {
        this.writeVarint(len);
        this._ensureCapacity(len);
        for (let i2 = 0; i2 < len; i2++) {
          this._buffer[this.pos++] = str.charCodeAt(i2);
        }
      } else {
        const bytes = this._textEncoder.encode(str);
        this.writeBytes(bytes);
      }
    }
  };

  // node_modules/@opentelemetry/otlp-transformer/build/esm/common/hex-to-binary.js
  function intValue(charCode) {
    if (charCode >= 48 && charCode <= 57) {
      return charCode - 48;
    }
    if (charCode >= 97 && charCode <= 102) {
      return charCode - 87;
    }
    return charCode - 55;
  }
  function hexToBinary(hexStr) {
    const buf = new Uint8Array(hexStr.length / 2);
    let offset = 0;
    for (let i2 = 0; i2 < hexStr.length; i2 += 2) {
      const hi = intValue(hexStr.charCodeAt(i2));
      const lo = intValue(hexStr.charCodeAt(i2 + 1));
      buf[offset++] = hi << 4 | lo;
    }
    return buf;
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/common/protobuf/common-serializer.js
  function writeHrTimeAsFixed64(serializer, hrTime2) {
    const seconds = hrTime2[0];
    const nanos = hrTime2[1];
    const nanosPerSecond = 1e9;
    const secondsLower16Bits = seconds & 65535;
    const secondsUpperBits = seconds / 65536 >>> 0;
    const nanosFromLower16Bits = secondsLower16Bits * nanosPerSecond;
    const nanosFromUpperBits = secondsUpperBits * nanosPerSecond;
    const lower16ContributionLow32 = nanosFromLower16Bits >>> 0;
    const lower16ContributionHigh32 = Math.floor(nanosFromLower16Bits / 4294967296);
    const upperBitsContributionLow32 = (nanosFromUpperBits & 65535) * 65536 >>> 0;
    const upperBitsContributionHigh32 = nanosFromUpperBits / 65536 >>> 0;
    const low32WithCarry = lower16ContributionLow32 + upperBitsContributionLow32 + nanos;
    const totalLow = low32WithCarry >>> 0;
    const carry = Math.floor(low32WithCarry / 4294967296);
    const totalHigh = lower16ContributionHigh32 + upperBitsContributionHigh32 + carry >>> 0;
    serializer.writeFixed64(totalLow, totalHigh);
  }
  function writeAttributes(writer, attributes, fieldNumber) {
    for (const key in attributes) {
      if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
        continue;
      }
      const value = attributes[key];
      writer.writeTag(fieldNumber, 2);
      const kvStart = writer.startLengthDelimited();
      const startPos = writer.pos;
      writeKeyValue(writer, key, value);
      writer.finishLengthDelimited(kvStart, writer.pos - startPos);
    }
  }
  function writeKeyValue(writer, key, value) {
    writer.writeTag(1, 2);
    writer.writeString(key);
    writer.writeTag(2, 2);
    const valueStart = writer.startLengthDelimited();
    const startPos = writer.pos;
    writeAnyValue(writer, value);
    writer.finishLengthDelimited(valueStart, writer.pos - startPos);
  }
  var MIN_64_BIT_INT = -(2 ** 63);
  var MAX_64_BIT_INT = 2 ** 63;
  function writeAnyValue(writer, value) {
    const t2 = typeof value;
    if (t2 === "string") {
      writer.writeTag(1, 2);
      writer.writeString(value);
    } else if (t2 === "boolean") {
      writer.writeTag(2, 0);
      writer.writeVarint(value ? 1 : 0);
    } else if (t2 === "number") {
      const numValue = value;
      if (Number.isInteger(numValue) && numValue >= MIN_64_BIT_INT && numValue < MAX_64_BIT_INT) {
        writer.writeTag(3, 0);
        writer.writeVarint(numValue);
      } else {
        writer.writeTag(4, 1);
        writer.writeDouble(numValue);
      }
    } else if (value instanceof Uint8Array) {
      writer.writeTag(7, 2);
      writer.writeBytes(value);
    } else if (Array.isArray(value)) {
      writer.writeTag(5, 2);
      const arrayStart = writer.startLengthDelimited();
      const arrayStartPos = writer.pos;
      for (const item of value) {
        writer.writeTag(1, 2);
        const itemStart = writer.startLengthDelimited();
        const itemStartPos = writer.pos;
        writeAnyValue(writer, item);
        writer.finishLengthDelimited(itemStart, writer.pos - itemStartPos);
      }
      writer.finishLengthDelimited(arrayStart, writer.pos - arrayStartPos);
    } else if (t2 === "object" && value != null) {
      writer.writeTag(6, 2);
      const kvlistStart = writer.startLengthDelimited();
      const kvlistStartPos = writer.pos;
      const obj = value;
      for (const k2 in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k2)) {
          continue;
        }
        const v2 = obj[k2];
        writer.writeTag(1, 2);
        const kvStart = writer.startLengthDelimited();
        const kvStartPos = writer.pos;
        writer.writeTag(1, 2);
        writer.writeString(k2);
        writer.writeTag(2, 2);
        const valueStart = writer.startLengthDelimited();
        const valueStartPos = writer.pos;
        writeAnyValue(writer, v2);
        writer.finishLengthDelimited(valueStart, writer.pos - valueStartPos);
        writer.finishLengthDelimited(kvStart, writer.pos - kvStartPos);
      }
      writer.finishLengthDelimited(kvlistStart, writer.pos - kvlistStartPos);
    }
  }
  function writeInstrumentationScope(writer, scope, fieldNumber) {
    writer.writeTag(fieldNumber, 2);
    const start = writer.startLengthDelimited();
    const startPos = writer.pos;
    writer.writeTag(1, 2);
    writer.writeString(scope.name);
    if (scope.version) {
      writer.writeTag(2, 2);
      writer.writeString(scope.version);
    }
    if (scope.attributes) {
      writeAttributes(writer, scope.attributes, 3);
    }
    if (scope.droppedAttributesCount) {
      writer.writeTag(4, 0);
      writer.writeVarint(scope.droppedAttributesCount);
    }
    writer.finishLengthDelimited(start, writer.pos - startPos);
  }
  function writeResource(writer, resource, fieldNumber) {
    writer.writeTag(fieldNumber, 2);
    const resourceStart = writer.startLengthDelimited();
    const resourceStartPos = writer.pos;
    if (resource.attributes) {
      writeAttributes(writer, resource.attributes, 1);
    }
    writer.writeTag(2, 0);
    writer.writeVarint(0);
    writer.finishLengthDelimited(resourceStart, writer.pos - resourceStartPos);
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/common/protobuf/protobuf-size-estimator.js
  function utf8ByteLength(str) {
    const len = str.length;
    let byteLen = 0;
    for (let i2 = 0; i2 < len; i2++) {
      const code = str.charCodeAt(i2);
      if (code < 128) {
        byteLen += 1;
      } else if (code < 2048) {
        byteLen += 2;
      } else if (code < 55296 || code >= 57344) {
        byteLen += 3;
      } else {
        i2++;
        byteLen += 4;
      }
    }
    return byteLen;
  }
  var ProtobufSizeEstimator = class {
    constructor() {
      __publicField(this, "pos", 0);
    }
    startLengthDelimited() {
      return this.pos;
    }
    finishLengthDelimited(_2, length) {
      this.pos += estimateVarintSize(length);
    }
    writeVarint(value) {
      this.pos += estimateVarintSize(value);
    }
    writeSint32(value) {
      this.pos += estimateVarintSize((value << 1 ^ value >> 31) >>> 0);
    }
    writeSfixed64(_value) {
      this.pos += 8;
    }
    writeFixed32(_value) {
      this.pos += 4;
    }
    writeFixed64(_low, _high) {
      this.pos += 8;
    }
    writeBytes(bytes) {
      this.pos += estimateVarintSize(bytes.length);
      this.pos += bytes.length;
    }
    writeTag(fieldNumber, wireType) {
      this.writeVarint(fieldNumber << 3 | wireType);
    }
    writeDouble(_value) {
      this.pos += 8;
    }
    writeString(str) {
      const byteLen = utf8ByteLength(str);
      this.pos += estimateVarintSize(byteLen);
      this.pos += byteLen;
    }
  };

  // node_modules/@opentelemetry/otlp-transformer/build/esm/logs/protobuf/logs-serializer.js
  function serializeLogRecord(writer, logRecord) {
    const logStart = writer.startLengthDelimited();
    const logStartPos = writer.pos;
    writer.writeTag(1, 1);
    writeHrTimeAsFixed64(writer, logRecord.hrTime);
    if (logRecord.severityNumber !== void 0 && logRecord.severityNumber !== SeverityNumber.UNSPECIFIED) {
      writer.writeTag(2, 0);
      writer.writeVarint(logRecord.severityNumber);
    }
    if (logRecord.severityText) {
      writer.writeTag(3, 2);
      writer.writeString(logRecord.severityText);
    }
    if (logRecord.body !== void 0) {
      writer.writeTag(5, 2);
      const bodyStart = writer.startLengthDelimited();
      const bodyStartPos = writer.pos;
      writeAnyValue(writer, logRecord.body);
      writer.finishLengthDelimited(bodyStart, writer.pos - bodyStartPos);
    }
    if (logRecord.attributes) {
      writeAttributes(writer, logRecord.attributes, 6);
    }
    writer.writeTag(7, 0);
    writer.writeVarint(logRecord.droppedAttributesCount);
    if (logRecord.spanContext?.traceFlags) {
      writer.writeTag(8, 5);
      writer.writeFixed32(logRecord.spanContext.traceFlags);
    }
    if (logRecord.spanContext?.traceId) {
      writer.writeTag(9, 2);
      writer.writeBytes(hexToBinary(logRecord.spanContext.traceId));
    }
    if (logRecord.spanContext?.spanId) {
      writer.writeTag(10, 2);
      writer.writeBytes(hexToBinary(logRecord.spanContext.spanId));
    }
    writer.writeTag(11, 1);
    writeHrTimeAsFixed64(writer, logRecord.hrTimeObserved);
    if (logRecord.eventName) {
      writer.writeTag(12, 2);
      writer.writeString(logRecord.eventName);
    }
    writer.finishLengthDelimited(logStart, writer.pos - logStartPos);
  }
  function serializeScopeLogs(writer, scope, logRecords) {
    const scopeLogsStart = writer.startLengthDelimited();
    const scopeLogsStartPos = writer.pos;
    writeInstrumentationScope(writer, scope, 1);
    for (const logRecord of logRecords) {
      writer.writeTag(2, 2);
      serializeLogRecord(writer, logRecord);
    }
    if (scope.schemaUrl) {
      writer.writeTag(3, 2);
      writer.writeString(scope.schemaUrl);
    }
    writer.finishLengthDelimited(scopeLogsStart, writer.pos - scopeLogsStartPos);
  }
  function serializeResourceLogs(writer, resource, scopeMap) {
    const resourceLogsStart = writer.startLengthDelimited();
    const resourceLogsStartPos = writer.pos;
    writeResource(writer, resource, 1);
    for (const scopeLogs of scopeMap.values()) {
      writer.writeTag(2, 2);
      const scope = scopeLogs[0].instrumentationScope;
      serializeScopeLogs(writer, scope, scopeLogs);
    }
    if (resource.schemaUrl) {
      writer.writeTag(3, 2);
      writer.writeString(resource.schemaUrl);
    }
    writer.finishLengthDelimited(resourceLogsStart, writer.pos - resourceLogsStartPos);
  }
  function createResourceMap(logRecords) {
    const resourceMap = /* @__PURE__ */ new Map();
    for (const record of logRecords) {
      const resource = record.resource;
      const scope = record.instrumentationScope;
      let ismMap = resourceMap.get(resource);
      if (!ismMap) {
        ismMap = /* @__PURE__ */ new Map();
        resourceMap.set(resource, ismMap);
      }
      let records = ismMap.get(scope);
      if (!records) {
        records = [];
        ismMap.set(scope, records);
      }
      records.push(record);
    }
    return resourceMap;
  }
  function serializeLogsExportRequest(logRecords) {
    const resourceMap = createResourceMap(logRecords);
    const estimator = new ProtobufSizeEstimator();
    for (const [resource, scopeMap] of resourceMap) {
      estimator.writeTag(1, 2);
      serializeResourceLogs(estimator, resource, scopeMap);
    }
    const writer = new ProtobufWriter(estimator.pos);
    for (const [resource, scopeMap] of resourceMap) {
      writer.writeTag(1, 2);
      serializeResourceLogs(writer, resource, scopeMap);
    }
    return writer.finish();
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/common/protobuf/protobuf-reader.js
  var ProtobufReader = class {
    constructor(buf) {
      __publicField(this, "pos", 0);
      __publicField(this, "_buf");
      __publicField(this, "_textDecoder");
      this._buf = buf;
      this._textDecoder = new TextDecoder();
    }
    isAtEnd() {
      return this.pos >= this._buf.length;
    }
    /** Read a varint and decode it as a tag, returning field number and wire type. */
    readTag() {
      const raw = this.readVarint();
      return { fieldNumber: raw >>> 3, wireType: raw & 7 };
    }
    /**
     * Read a base-128 varint.
     * Returns a JS `number`; precision above 2^53 is silently lost.
     * Throws if the buffer is truncated mid-varint.
     */
    readVarint() {
      let result = 0;
      let shift = 0;
      let terminated = false;
      while (this.pos < this._buf.length) {
        const b2 = this._buf[this.pos++];
        result += (b2 & 127) * Math.pow(2, shift);
        shift += 7;
        if ((b2 & 128) === 0) {
          terminated = true;
          break;
        }
      }
      if (!terminated) {
        throw new Error("Truncated buffer: unexpected end of data while reading varint");
      }
      return result;
    }
    /** Read a length-delimited byte sequence (bytes field or embedded message). */
    readBytes() {
      const len = this.readVarint();
      if (this.pos + len > this._buf.length) {
        throw new Error(`Truncated buffer: expected ${len} bytes at position ${this.pos}, but only ${this._buf.length - this.pos} available`);
      }
      const slice = this._buf.subarray(this.pos, this.pos + len);
      this.pos += len;
      return slice;
    }
    /** Read a length-delimited UTF-8 string. */
    readString() {
      return this._textDecoder.decode(this.readBytes());
    }
    /**
     * Skip an unknown field.
     * Handles wire types 0 (varint), 1 (64-bit), 2 (length-delimited),
     * and 5 (32-bit).
     *
     * Wire types 3 and 4 (start-group / end-group) are deprecated in proto3
     * and are not used by any OpenTelemetry proto definition. Encountering
     * them is treated as an error.
     */
    skip(wireType) {
      switch (wireType) {
        case 0:
          this.readVarint();
          break;
        case 1:
          this.pos += 8;
          break;
        case 2:
          this.readBytes();
          break;
        case 5:
          this.pos += 4;
          break;
        default:
          throw new Error(`Unknown wire type ${wireType}, cannot safely skip`);
      }
    }
  };

  // node_modules/@opentelemetry/otlp-transformer/build/esm/logs/protobuf/response-deserializer.js
  function deserializePartialSuccess(data) {
    const reader = new ProtobufReader(data);
    const result = {};
    while (!reader.isAtEnd()) {
      const { fieldNumber, wireType } = reader.readTag();
      switch (fieldNumber) {
        case 1:
          if (wireType === 0) {
            result.rejectedLogRecords = reader.readVarint();
          } else {
            reader.skip(wireType);
          }
          break;
        case 2:
          if (wireType === 2) {
            result.errorMessage = reader.readString();
          } else {
            reader.skip(wireType);
          }
          break;
        default:
          reader.skip(wireType);
          break;
      }
    }
    return result;
  }
  function deserializeExportLogsServiceResponse(data) {
    const reader = new ProtobufReader(data);
    const result = {};
    while (!reader.isAtEnd()) {
      const { fieldNumber, wireType } = reader.readTag();
      switch (fieldNumber) {
        case 1:
          if (wireType === 2) {
            result.partialSuccess = deserializePartialSuccess(reader.readBytes());
          } else {
            reader.skip(wireType);
          }
          break;
        default:
          reader.skip(wireType);
          break;
      }
    }
    return result;
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/logs/protobuf/logs.js
  var ProtobufLogsSerializer = {
    serializeRequest: (arg) => {
      return serializeLogsExportRequest(arg);
    },
    deserializeResponse: (arg) => {
      return deserializeExportLogsServiceResponse(arg);
    }
  };

  // node_modules/@opentelemetry/resources/build/esm/default-service-name.js
  var serviceName;
  function defaultServiceName() {
    if (serviceName === void 0) {
      try {
        const argv0 = globalThis.process.argv0;
        serviceName = argv0 ? `unknown_service:${argv0}` : "unknown_service";
      } catch {
        serviceName = "unknown_service";
      }
    }
    return serviceName;
  }

  // node_modules/@opentelemetry/resources/build/esm/utils.js
  var isPromiseLike = (val) => {
    return val !== null && typeof val === "object" && typeof val.then === "function";
  };

  // node_modules/@opentelemetry/resources/build/esm/ResourceImpl.js
  var ResourceImpl = class _ResourceImpl {
    constructor(resource, options) {
      __publicField(this, "_rawAttributes");
      __publicField(this, "_asyncAttributesPending", false);
      __publicField(this, "_schemaUrl");
      __publicField(this, "_memoizedAttributes");
      const attributes = resource.attributes ?? {};
      this._rawAttributes = Object.entries(attributes).map(([k2, v2]) => {
        if (isPromiseLike(v2)) {
          this._asyncAttributesPending = true;
        }
        return [k2, v2];
      });
      this._rawAttributes = guardedRawAttributes(this._rawAttributes);
      this._schemaUrl = validateSchemaUrl(options?.schemaUrl);
    }
    static FromAttributeList(attributes, options) {
      const res = new _ResourceImpl({}, options);
      res._rawAttributes = guardedRawAttributes(attributes);
      res._asyncAttributesPending = attributes.filter(([_2, val]) => isPromiseLike(val)).length > 0;
      return res;
    }
    get asyncAttributesPending() {
      return this._asyncAttributesPending;
    }
    async waitForAsyncAttributes() {
      if (!this.asyncAttributesPending) {
        return;
      }
      for (let i2 = 0; i2 < this._rawAttributes.length; i2++) {
        const [k2, v2] = this._rawAttributes[i2];
        this._rawAttributes[i2] = [k2, isPromiseLike(v2) ? await v2 : v2];
      }
      this._asyncAttributesPending = false;
    }
    get attributes() {
      if (this.asyncAttributesPending) {
        diag2.error("Accessing resource attributes before async attributes settled");
      }
      if (this._memoizedAttributes) {
        return this._memoizedAttributes;
      }
      const attrs = {};
      for (const [k2, v2] of this._rawAttributes) {
        if (isPromiseLike(v2)) {
          diag2.debug(`Unsettled resource attribute ${k2} skipped`);
          continue;
        }
        if (v2 != null) {
          attrs[k2] ?? (attrs[k2] = v2);
        }
      }
      if (!this._asyncAttributesPending) {
        this._memoizedAttributes = attrs;
      }
      return attrs;
    }
    getRawAttributes() {
      return this._rawAttributes;
    }
    get schemaUrl() {
      return this._schemaUrl;
    }
    merge(resource) {
      if (resource == null)
        return this;
      const mergedSchemaUrl = mergeSchemaUrl(this, resource);
      const mergedOptions = mergedSchemaUrl ? { schemaUrl: mergedSchemaUrl } : void 0;
      return _ResourceImpl.FromAttributeList([...resource.getRawAttributes(), ...this.getRawAttributes()], mergedOptions);
    }
  };
  function resourceFromAttributes(attributes, options) {
    return ResourceImpl.FromAttributeList(Object.entries(attributes), options);
  }
  function defaultResource() {
    return resourceFromAttributes({
      [ATTR_SERVICE_NAME]: defaultServiceName(),
      [ATTR_TELEMETRY_SDK_LANGUAGE]: SDK_INFO[ATTR_TELEMETRY_SDK_LANGUAGE],
      [ATTR_TELEMETRY_SDK_NAME]: SDK_INFO[ATTR_TELEMETRY_SDK_NAME],
      [ATTR_TELEMETRY_SDK_VERSION]: SDK_INFO[ATTR_TELEMETRY_SDK_VERSION]
    });
  }
  function guardedRawAttributes(attributes) {
    return attributes.map(([k2, v2]) => {
      if (isPromiseLike(v2)) {
        return [
          k2,
          v2.catch((err) => {
            diag2.debug("promise rejection for resource attribute: %s - %s", k2, err);
            return void 0;
          })
        ];
      }
      return [k2, v2];
    });
  }
  function validateSchemaUrl(schemaUrl) {
    if (typeof schemaUrl === "string" || schemaUrl === void 0) {
      return schemaUrl;
    }
    diag2.warn("Schema URL must be string or undefined, got %s. Schema URL will be ignored.", schemaUrl);
    return void 0;
  }
  function mergeSchemaUrl(old, updating) {
    const oldSchemaUrl = old?.schemaUrl;
    const updatingSchemaUrl = updating?.schemaUrl;
    const isOldEmpty = oldSchemaUrl === void 0 || oldSchemaUrl === "";
    const isUpdatingEmpty = updatingSchemaUrl === void 0 || updatingSchemaUrl === "";
    if (isOldEmpty) {
      return updatingSchemaUrl;
    }
    if (isUpdatingEmpty) {
      return oldSchemaUrl;
    }
    if (oldSchemaUrl === updatingSchemaUrl) {
      return oldSchemaUrl;
    }
    diag2.warn('Schema URL merge conflict: old resource has "%s", updating resource has "%s". Resulting resource will have undefined Schema URL.', oldSchemaUrl, updatingSchemaUrl);
    return void 0;
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/trace/protobuf/trace-serializer.js
  var SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK = 256;
  var SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK = 512;
  function buildSpanFlags(traceFlags, isRemote) {
    let flags = traceFlags & 255 | SPAN_FLAGS_CONTEXT_HAS_IS_REMOTE_MASK;
    if (isRemote) {
      flags |= SPAN_FLAGS_CONTEXT_IS_REMOTE_MASK;
    }
    return flags;
  }
  function serializeStatus(writer, status) {
    const statusStart = writer.startLengthDelimited();
    const statusStartPos = writer.pos;
    if (status.message) {
      writer.writeTag(2, 2);
      writer.writeString(status.message);
    }
    writer.writeTag(3, 0);
    writer.writeVarint(status.code);
    writer.finishLengthDelimited(statusStart, writer.pos - statusStartPos);
  }
  function serializeEvent(writer, event) {
    const eventStart = writer.startLengthDelimited();
    const eventStartPos = writer.pos;
    writer.writeTag(1, 1);
    writeHrTimeAsFixed64(writer, event.time);
    writer.writeTag(2, 2);
    writer.writeString(event.name);
    if (event.attributes) {
      writeAttributes(writer, event.attributes, 3);
    }
    writer.writeTag(4, 0);
    writer.writeVarint(event.droppedAttributesCount || 0);
    writer.finishLengthDelimited(eventStart, writer.pos - eventStartPos);
  }
  function serializeLink(writer, link) {
    const linkStart = writer.startLengthDelimited();
    const linkStartPos = writer.pos;
    const context2 = link.context;
    writer.writeTag(1, 2);
    writer.writeBytes(hexToBinary(context2.traceId));
    writer.writeTag(2, 2);
    writer.writeBytes(hexToBinary(context2.spanId));
    const linkTraceState = context2.traceState?.serialize();
    if (linkTraceState) {
      writer.writeTag(3, 2);
      writer.writeString(linkTraceState);
    }
    if (link.attributes) {
      writeAttributes(writer, link.attributes, 4);
    }
    writer.writeTag(5, 0);
    writer.writeVarint(link.droppedAttributesCount || 0);
    const linkFlags = buildSpanFlags(context2.traceFlags, context2.isRemote);
    if (linkFlags) {
      writer.writeTag(6, 5);
      writer.writeFixed32(linkFlags);
    }
    writer.finishLengthDelimited(linkStart, writer.pos - linkStartPos);
  }
  function serializeSpan(writer, span) {
    const spanStart = writer.startLengthDelimited();
    const spanStartPos = writer.pos;
    const ctx = span.spanContext();
    writer.writeTag(1, 2);
    writer.writeBytes(hexToBinary(ctx.traceId));
    writer.writeTag(2, 2);
    writer.writeBytes(hexToBinary(ctx.spanId));
    const traceState = ctx.traceState?.serialize();
    if (traceState) {
      writer.writeTag(3, 2);
      writer.writeString(traceState);
    }
    if (span.parentSpanContext?.spanId) {
      writer.writeTag(4, 2);
      writer.writeBytes(hexToBinary(span.parentSpanContext.spanId));
    }
    writer.writeTag(5, 2);
    writer.writeString(span.name);
    const kind = span.kind == null ? 0 : span.kind + 1;
    if (kind !== 0) {
      writer.writeTag(6, 0);
      writer.writeVarint(kind);
    }
    writer.writeTag(7, 1);
    writeHrTimeAsFixed64(writer, span.startTime);
    writer.writeTag(8, 1);
    writeHrTimeAsFixed64(writer, span.endTime);
    if (span.attributes) {
      writeAttributes(writer, span.attributes, 9);
    }
    writer.writeTag(10, 0);
    writer.writeVarint(span.droppedAttributesCount);
    for (const event of span.events) {
      writer.writeTag(11, 2);
      serializeEvent(writer, event);
    }
    writer.writeTag(12, 0);
    writer.writeVarint(span.droppedEventsCount);
    for (const link of span.links) {
      writer.writeTag(13, 2);
      serializeLink(writer, link);
    }
    writer.writeTag(14, 0);
    writer.writeVarint(span.droppedLinksCount);
    writer.writeTag(15, 2);
    serializeStatus(writer, span.status);
    const flags = buildSpanFlags(ctx.traceFlags, span.parentSpanContext?.isRemote);
    if (flags) {
      writer.writeTag(16, 5);
      writer.writeFixed32(flags);
    }
    writer.finishLengthDelimited(spanStart, writer.pos - spanStartPos);
  }
  function serializeScopeSpans(writer, scope, spans) {
    const scopeSpansStart = writer.startLengthDelimited();
    const scopeSpansStartPos = writer.pos;
    writeInstrumentationScope(writer, scope, 1);
    for (const span of spans) {
      writer.writeTag(2, 2);
      serializeSpan(writer, span);
    }
    if (scope.schemaUrl) {
      writer.writeTag(3, 2);
      writer.writeString(scope.schemaUrl);
    }
    writer.finishLengthDelimited(scopeSpansStart, writer.pos - scopeSpansStartPos);
  }
  function serializeResourceSpans(writer, resource, scopeMap) {
    const resourceSpansStart = writer.startLengthDelimited();
    const resourceSpansStartPos = writer.pos;
    writeResource(writer, resource, 1);
    for (const scopeSpans of scopeMap.values()) {
      writer.writeTag(2, 2);
      const scope = scopeSpans[0].instrumentationScope;
      serializeScopeSpans(writer, scope, scopeSpans);
    }
    if (resource.schemaUrl) {
      writer.writeTag(3, 2);
      writer.writeString(resource.schemaUrl);
    }
    writer.finishLengthDelimited(resourceSpansStart, writer.pos - resourceSpansStartPos);
  }
  function createResourceMap2(spans) {
    const resourceMap = /* @__PURE__ */ new Map();
    for (const span of spans) {
      const resource = span.resource;
      const scope = span.instrumentationScope;
      let scopeMap = resourceMap.get(resource);
      if (!scopeMap) {
        scopeMap = /* @__PURE__ */ new Map();
        resourceMap.set(resource, scopeMap);
      }
      let records = scopeMap.get(scope);
      if (!records) {
        records = [];
        scopeMap.set(scope, records);
      }
      records.push(span);
    }
    return resourceMap;
  }
  function serializeTraceExportRequest(spans) {
    const resourceMap = createResourceMap2(spans);
    const estimator = new ProtobufSizeEstimator();
    for (const [resource, scopeMap] of resourceMap) {
      estimator.writeTag(1, 2);
      serializeResourceSpans(estimator, resource, scopeMap);
    }
    const writer = new ProtobufWriter(estimator.pos);
    for (const [resource, scopeMap] of resourceMap) {
      writer.writeTag(1, 2);
      serializeResourceSpans(writer, resource, scopeMap);
    }
    return writer.finish();
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/trace/protobuf/response-deserializer.js
  function deserializePartialSuccess2(data) {
    const reader = new ProtobufReader(data);
    const result = {};
    while (!reader.isAtEnd()) {
      const { fieldNumber, wireType } = reader.readTag();
      switch (fieldNumber) {
        case 1:
          if (wireType === 0) {
            result.rejectedSpans = reader.readVarint();
          } else {
            reader.skip(wireType);
          }
          break;
        case 2:
          if (wireType === 2) {
            result.errorMessage = reader.readString();
          } else {
            reader.skip(wireType);
          }
          break;
        default:
          reader.skip(wireType);
          break;
      }
    }
    return result;
  }
  function deserializeExportTraceServiceResponse(data) {
    const reader = new ProtobufReader(data);
    const result = {};
    while (!reader.isAtEnd()) {
      const { fieldNumber, wireType } = reader.readTag();
      switch (fieldNumber) {
        case 1:
          if (wireType === 2) {
            result.partialSuccess = deserializePartialSuccess2(reader.readBytes());
          } else {
            reader.skip(wireType);
          }
          break;
        default:
          reader.skip(wireType);
          break;
      }
    }
    return result;
  }

  // node_modules/@opentelemetry/otlp-transformer/build/esm/trace/protobuf/trace.js
  var ProtobufTraceSerializer = {
    serializeRequest: (arg) => {
      return serializeTraceExportRequest(arg);
    },
    deserializeResponse: (arg) => {
      return deserializeExportTraceServiceResponse(arg);
    }
  };

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/retrying-transport.js
  var MAX_ATTEMPTS = 5;
  var INITIAL_BACKOFF = 1e3;
  var MAX_BACKOFF = 5e3;
  var BACKOFF_MULTIPLIER = 1.5;
  var JITTER = 0.2;
  function getJitter() {
    return Math.random() * (2 * JITTER) - JITTER;
  }
  var RetryingTransport = class {
    constructor(transport) {
      __publicField(this, "_transport");
      this._transport = transport;
    }
    retry(data, timeoutMillis, inMillis) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this._transport.send(data, timeoutMillis).then(resolve, reject);
        }, inMillis);
      });
    }
    async send(data, timeoutMillis) {
      let attempts = MAX_ATTEMPTS;
      let nextBackoff = INITIAL_BACKOFF;
      const deadline = Date.now() + timeoutMillis;
      let result = await this._transport.send(data, timeoutMillis);
      while (result.status === "retryable" && attempts > 0) {
        attempts--;
        const backoff = Math.max(Math.min(nextBackoff * (1 + getJitter()), MAX_BACKOFF), 0);
        nextBackoff = nextBackoff * BACKOFF_MULTIPLIER;
        const retryInMillis = result.retryInMillis ?? backoff;
        const remainingTimeoutMillis = deadline - Date.now();
        if (retryInMillis > remainingTimeoutMillis) {
          diag2.info(`Export retry time ${Math.round(retryInMillis)}ms exceeds remaining timeout ${Math.round(remainingTimeoutMillis)}ms, not retrying further.`);
          return result;
        }
        diag2.verbose(`Scheduling export retry in ${Math.round(retryInMillis)}ms`);
        result = await this.retry(data, remainingTimeoutMillis, retryInMillis);
      }
      if (result.status === "success") {
        diag2.verbose(`Export succeeded after ${MAX_ATTEMPTS - attempts} retry attempts.`);
      } else if (result.status === "retryable") {
        diag2.info(`Export failed after maximum retry attempts (${MAX_ATTEMPTS}).`);
      } else {
        diag2.info(`Export failed with non-retryable error: ${result.error}`);
      }
      return result;
    }
    shutdown() {
      return this._transport.shutdown();
    }
  };
  function createRetryingTransport(options) {
    return new RetryingTransport(options.transport);
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/is-export-retryable.js
  function isExportHTTPErrorRetryable(statusCode) {
    return statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504;
  }
  function parseRetryAfterToMills(retryAfter) {
    if (retryAfter == null) {
      return void 0;
    }
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isInteger(seconds)) {
      return seconds > 0 ? seconds * 1e3 : -1;
    }
    const delay = new Date(retryAfter).getTime() - Date.now();
    if (delay >= 0) {
      return delay;
    }
    return 0;
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/transport/fetch-transport.js
  var MAX_KEEPALIVE_BODY_SIZE = 60 * 1024;
  var MAX_KEEPALIVE_REQUESTS = 9;
  var pendingBodySize = 0;
  var pendingKeepaliveCount = 0;
  var FetchTransport = class {
    constructor(parameters) {
      __publicField(this, "_parameters");
      this._parameters = parameters;
    }
    async send(data, timeoutMillis) {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), timeoutMillis);
      let fetchApi = globalThis.fetch;
      if (typeof fetchApi.__original === "function") {
        fetchApi = fetchApi.__original;
      }
      const requestSize = data.byteLength;
      const wouldExceedSize = pendingBodySize + requestSize > MAX_KEEPALIVE_BODY_SIZE;
      const wouldExceedCount = pendingKeepaliveCount >= MAX_KEEPALIVE_REQUESTS;
      const useKeepalive = !wouldExceedSize && !wouldExceedCount;
      if (useKeepalive) {
        pendingBodySize += requestSize;
        pendingKeepaliveCount++;
      } else {
        const reason = wouldExceedSize ? "size limit" : "count limit";
        diag2.debug(`keepalive disabled: ${(requestSize / 1024).toFixed(1)}KB payload, ${pendingKeepaliveCount} pending (${reason})`);
      }
      try {
        const url = new URL(this._parameters.url);
        const response = await fetchApi(url.href, {
          method: "POST",
          headers: await this._parameters.headers(),
          body: data,
          signal: abortController.signal,
          keepalive: useKeepalive,
          mode: globalThis.location ? globalThis.location.origin === url.origin ? "same-origin" : "cors" : "no-cors"
        });
        if (response.status >= 200 && response.status <= 299) {
          diag2.debug(`export response success (status: ${response.status})`);
          return { status: "success" };
        } else if (isExportHTTPErrorRetryable(response.status)) {
          diag2.warn(`export response retryable (status: ${response.status})`);
          const retryAfter = response.headers.get("Retry-After");
          const retryInMillis = parseRetryAfterToMills(retryAfter);
          return { status: "retryable", retryInMillis };
        }
        diag2.error(`export response failure (status: ${response.status})`);
        return {
          status: "failure",
          error: new Error(`Fetch request failed with non-retryable status ${response.status}`)
        };
      } catch (error) {
        if (isFetchNetworkErrorRetryable(error)) {
          diag2.warn(`export request retryable (network error: ${error})`);
          return {
            status: "retryable",
            error: new Error("Fetch request encountered a network error", {
              cause: error
            })
          };
        }
        diag2.error(`export request failure (error: ${error})`);
        return {
          status: "failure",
          error: new Error("Fetch request errored", { cause: error })
        };
      } finally {
        clearTimeout(timeout);
        if (useKeepalive) {
          pendingBodySize -= requestSize;
          pendingKeepaliveCount--;
        }
      }
    }
    shutdown() {
    }
  };
  function createFetchTransport(parameters) {
    return new FetchTransport(parameters);
  }
  function isFetchNetworkErrorRetryable(error) {
    return error instanceof TypeError && !error.cause;
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/otlp-browser-http-export-delegate.js
  function createOtlpFetchExportDelegate(options, serializer, metrics2) {
    return createOtlpNetworkExportDelegate(options, serializer, metrics2, createRetryingTransport({
      transport: createFetchTransport(options)
    }));
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/util.js
  function validateAndNormalizeHeaders(partialHeaders) {
    const headers = {};
    Object.entries(partialHeaders ?? {}).forEach(([key, value]) => {
      if (typeof value !== "undefined") {
        headers[key] = String(value);
      } else {
        diag2.warn(`Header "${key}" has invalid value (${value}) and will be ignored`);
      }
    });
    return headers;
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/otlp-http-configuration.js
  function mergeHeaders(userProvidedHeaders, fallbackHeaders, defaultHeaders) {
    return async () => {
      const requiredHeaders = {
        ...await defaultHeaders()
      };
      const headers = {};
      if (fallbackHeaders != null) {
        Object.assign(headers, await fallbackHeaders());
      }
      if (userProvidedHeaders != null) {
        Object.assign(headers, validateAndNormalizeHeaders(await userProvidedHeaders()));
      }
      return Object.assign(headers, requiredHeaders);
    };
  }
  function validateUserProvidedUrl(url) {
    if (url == null) {
      return void 0;
    }
    try {
      const base = globalThis.location?.href;
      return new URL(url, base).href;
    } catch {
      throw new Error(`Configuration: Could not parse user-provided export URL: '${url}'`);
    }
  }
  function mergeOtlpHttpConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration) {
    return {
      ...mergeOtlpSharedConfigurationWithDefaults(userProvidedConfiguration, fallbackConfiguration, defaultConfiguration),
      headers: mergeHeaders(userProvidedConfiguration.headers, fallbackConfiguration.headers, defaultConfiguration.headers),
      url: validateUserProvidedUrl(userProvidedConfiguration.url) ?? fallbackConfiguration.url ?? defaultConfiguration.url
    };
  }
  function getHttpConfigurationDefaults(requiredHeaders, signalResourcePath) {
    return {
      ...getSharedConfigurationDefaults(),
      headers: async () => requiredHeaders,
      url: "http://localhost:4318/" + signalResourcePath
    };
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/convert-legacy-http-options.js
  function convertLegacyHeaders(config) {
    if (typeof config.headers === "function") {
      return config.headers;
    }
    return wrapStaticHeadersInFunction(config.headers);
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/convert-legacy-browser-http-options.js
  function convertLegacyBrowserHttpOptions(config, signalResourcePath, requiredHeaders) {
    return mergeOtlpHttpConfigurationWithDefaults(
      {
        url: config.url,
        timeoutMillis: config.timeoutMillis,
        headers: convertLegacyHeaders(config),
        concurrencyLimit: config.concurrencyLimit
      },
      {},
      // no fallback for browser case
      getHttpConfigurationDefaults(requiredHeaders, signalResourcePath)
    );
  }

  // node_modules/@opentelemetry/otlp-exporter-base/build/esm/configuration/create-legacy-browser-delegate.js
  function createLegacyOtlpBrowserExporterMetrics(metricsComponentType, exporterMetricsHelper, url, meterProvider) {
    return new ExporterMetrics({
      componentType: metricsComponentType,
      metricsHelper: exporterMetricsHelper,
      url,
      meterProvider,
      responseAttributesFromError: (error) => {
        if (!error) {
          return {
            [ATTR_HTTP_RESPONSE_STATUS_CODE2]: 200
          };
        }
        if (!(error instanceof Error)) {
          return {};
        }
        if (error.message.startsWith("Fetch request failed with non-retryable status ")) {
          const statusStr = error.message.substring("Fetch request failed with non-retryable status ".length);
          return {
            [ATTR_HTTP_RESPONSE_STATUS_CODE2]: Number(statusStr)
          };
        }
        return {};
      }
    });
  }
  function createLegacyOtlpBrowserExportDelegate(config, serializer, metricsComponentType, exporterMetricsHelper, meterProvider, signalResourcePath, requiredHeaders) {
    const options = convertLegacyBrowserHttpOptions(config, signalResourcePath, requiredHeaders);
    return createOtlpFetchExportDelegate(options, serializer, createLegacyOtlpBrowserExporterMetrics(metricsComponentType, exporterMetricsHelper, options.url, config.selfObsMeterProvider));
  }

  // node_modules/@opentelemetry/exporter-logs-otlp-proto/build/esm/semconv.js
  var OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER = "otlp_http_log_exporter";

  // node_modules/@opentelemetry/exporter-logs-otlp-proto/build/esm/platform/browser/OTLPLogExporter.js
  var OTLPLogExporter = class extends OTLPExporterBase {
    constructor(config = {}) {
      super(createLegacyOtlpBrowserExportDelegate(config, ProtobufLogsSerializer, OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_LOG_EXPORTER, LogsExporterMetricsHelper, config.selfObsMeterProvider, "v1/logs", { "Content-Type": "application/x-protobuf" }));
    }
  };

  // node_modules/@opentelemetry/exporter-trace-otlp-proto/build/esm/semconv.js
  var OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER = "otlp_http_span_exporter";

  // node_modules/@opentelemetry/exporter-trace-otlp-proto/build/esm/platform/browser/OTLPTraceExporter.js
  var DEFAULT_COLLECTOR_RESOURCE_PATH = "v1/traces";
  var OTLPTraceExporter = class extends OTLPExporterBase {
    constructor(config = {}) {
      super(createLegacyOtlpBrowserExportDelegate(config, ProtobufTraceSerializer, OTEL_COMPONENT_TYPE_VALUE_OTLP_HTTP_SPAN_EXPORTER, TraceExporterMetricsHelper, config.selfObsMeterProvider, DEFAULT_COLLECTOR_RESOURCE_PATH, { "Content-Type": "application/x-protobuf" }));
    }
  };

  // node_modules/@opentelemetry/instrumentation/build/esm/autoLoaderUtils.js
  function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider2) {
    for (let i2 = 0, j = instrumentations.length; i2 < j; i2++) {
      const instrumentation = instrumentations[i2];
      if (tracerProvider) {
        instrumentation.setTracerProvider(tracerProvider);
      }
      if (meterProvider) {
        instrumentation.setMeterProvider(meterProvider);
      }
      if (loggerProvider2 && instrumentation.setLoggerProvider) {
        instrumentation.setLoggerProvider(loggerProvider2);
      }
      if (!instrumentation.getConfig().enabled) {
        instrumentation.enable();
      }
    }
  }
  function disableInstrumentations(instrumentations) {
    instrumentations.forEach((instrumentation) => instrumentation.disable());
  }

  // node_modules/@opentelemetry/instrumentation/build/esm/autoLoader.js
  function registerInstrumentations(options) {
    const tracerProvider = options.tracerProvider || trace.getTracerProvider();
    const meterProvider = options.meterProvider || metrics.getMeterProvider();
    const loggerProvider2 = options.loggerProvider || logs.getLoggerProvider();
    const instrumentations = options.instrumentations?.flat() ?? [];
    enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider2);
    return () => {
      disableInstrumentations(instrumentations);
    };
  }

  // node_modules/@opentelemetry/instrumentation/build/esm/shimmer.js
  var logger = console.error.bind(console);
  function defineProperty(obj, name, value) {
    const enumerable = !!obj[name] && Object.prototype.propertyIsEnumerable.call(obj, name);
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable,
      writable: true,
      value
    });
  }
  var wrap = (nodule, name, wrapper) => {
    if (!nodule || !nodule[name]) {
      logger("no original function " + String(name) + " to wrap");
      return;
    }
    if (!wrapper) {
      logger("no wrapper function");
      logger(new Error().stack);
      return;
    }
    const original = nodule[name];
    if (typeof original !== "function" || typeof wrapper !== "function") {
      logger("original object and wrapper must be functions");
      return;
    }
    const wrapped = wrapper(original, name);
    defineProperty(wrapped, "__original", original);
    defineProperty(wrapped, "__unwrap", () => {
      if (nodule[name] === wrapped) {
        defineProperty(nodule, name, original);
      }
    });
    defineProperty(wrapped, "__wrapped", true);
    defineProperty(nodule, name, wrapped);
    return wrapped;
  };
  var massWrap = (nodules, names, wrapper) => {
    if (!nodules) {
      logger("must provide one or more modules to patch");
      logger(new Error().stack);
      return;
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }
    if (!(names && Array.isArray(names))) {
      logger("must provide one or more functions to wrap on modules");
      return;
    }
    nodules.forEach((nodule) => {
      names.forEach((name) => {
        wrap(nodule, name, wrapper);
      });
    });
  };
  var unwrap = (nodule, name) => {
    if (!nodule || !nodule[name]) {
      logger("no function to unwrap.");
      logger(new Error().stack);
      return;
    }
    const wrapped = nodule[name];
    if (!wrapped.__unwrap) {
      logger("no original to unwrap to -- has " + String(name) + " already been unwrapped?");
    } else {
      wrapped.__unwrap();
      return;
    }
  };
  var massUnwrap = (nodules, names) => {
    if (!nodules) {
      logger("must provide one or more modules to patch");
      logger(new Error().stack);
      return;
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }
    if (!(names && Array.isArray(names))) {
      logger("must provide one or more functions to unwrap on modules");
      return;
    }
    nodules.forEach((nodule) => {
      names.forEach((name) => {
        unwrap(nodule, name);
      });
    });
  };
  function shimmer(options) {
    if (options && options.logger) {
      if (typeof options.logger !== "function") {
        logger("new logger isn't a function, not replacing");
      } else {
        logger = options.logger;
      }
    }
  }
  shimmer.wrap = wrap;
  shimmer.massWrap = massWrap;
  shimmer.unwrap = unwrap;
  shimmer.massUnwrap = massUnwrap;

  // node_modules/@opentelemetry/instrumentation/build/esm/instrumentation.js
  var InstrumentationAbstract = class {
    constructor(instrumentationName, instrumentationVersion, config) {
      __publicField(this, "_config", {});
      __publicField(this, "_tracer");
      __publicField(this, "_meter");
      __publicField(this, "_logger");
      __publicField(this, "_diag");
      __publicField(this, "instrumentationName");
      __publicField(this, "instrumentationVersion");
      /* Api to wrap instrumented method */
      __publicField(this, "_wrap", wrap);
      /* Api to unwrap instrumented methods */
      __publicField(this, "_unwrap", unwrap);
      /* Api to mass wrap instrumented method */
      __publicField(this, "_massWrap", massWrap);
      /* Api to mass unwrap instrumented methods */
      __publicField(this, "_massUnwrap", massUnwrap);
      this.instrumentationName = instrumentationName;
      this.instrumentationVersion = instrumentationVersion;
      this.setConfig(config);
      this._diag = diag2.createComponentLogger({
        namespace: instrumentationName
      });
      this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
      this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
      this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
      this._updateMetricInstruments();
    }
    /* Returns meter */
    get meter() {
      return this._meter;
    }
    /**
     * Sets MeterProvider to this plugin
     * @param meterProvider
     */
    setMeterProvider(meterProvider) {
      this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
      this._updateMetricInstruments();
    }
    /* Returns logger */
    get logger() {
      return this._logger;
    }
    /**
     * Sets LoggerProvider to this plugin
     * @param loggerProvider
     */
    setLoggerProvider(loggerProvider2) {
      this._logger = loggerProvider2.getLogger(this.instrumentationName, this.instrumentationVersion);
    }
    /**
     * @experimental
     *
     * Get module definitions defined by {@link init}.
     * This can be used for experimental compile-time instrumentation.
     *
     * @returns an array of {@link InstrumentationModuleDefinition}
     */
    getModuleDefinitions() {
      const initResult = this.init() ?? [];
      if (!Array.isArray(initResult)) {
        return [initResult];
      }
      return initResult;
    }
    /**
     * Sets the new metric instruments with the current Meter.
     */
    _updateMetricInstruments() {
      return;
    }
    /* Returns InstrumentationConfig */
    getConfig() {
      return this._config;
    }
    /**
     * Sets InstrumentationConfig to this plugin
     * @param config
     */
    setConfig(config) {
      this._config = {
        enabled: true,
        ...config
      };
    }
    /**
     * Sets TracerProvider to this plugin
     * @param tracerProvider
     */
    setTracerProvider(tracerProvider) {
      this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
    }
    /* Returns tracer */
    get tracer() {
      return this._tracer;
    }
    /**
     * Execute span customization hook, if configured, and log any errors.
     * Any semantics of the trigger and info are defined by the specific instrumentation.
     * @param hookHandler The optional hook handler which the user has configured via instrumentation config
     * @param triggerName The name of the trigger for executing the hook for logging purposes
     * @param span The span to which the hook should be applied
     * @param info The info object to be passed to the hook, with useful data the hook may use
     */
    _runSpanCustomizationHook(hookHandler, triggerName, span, info) {
      if (!hookHandler) {
        return;
      }
      try {
        hookHandler(span, info);
      } catch (e2) {
        this._diag.error("Error running span customization hook due to exception in handler", { triggerName }, e2);
      }
    }
  };

  // node_modules/@opentelemetry/instrumentation/build/esm/platform/browser/instrumentation.js
  var InstrumentationBase = class extends InstrumentationAbstract {
    constructor(instrumentationName, instrumentationVersion, config) {
      super(instrumentationName, instrumentationVersion, config);
      if (this._config.enabled) {
        this.enable();
      }
    }
  };

  // node_modules/@opentelemetry/instrumentation/build/esm/utils.js
  function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
    let error;
    let result;
    try {
      result = execute();
    } catch (e2) {
      error = e2;
    } finally {
      onFinish(error, result);
      if (error && !preventThrowingError) {
        throw error;
      }
      return result;
    }
  }

  // node_modules/@opentelemetry/sdk-trace/build/esm/enums.js
  var ExceptionEventName = "exception";

  // node_modules/@opentelemetry/sdk-trace/build/esm/inspect.js
  var inspectCustom = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
  function settledResourceAttributes(resource) {
    const attrs = {};
    for (const [k2, v2] of resource.getRawAttributes()) {
      if (typeof v2?.then === "function") {
        continue;
      }
      if (v2 != null) {
        attrs[k2] ?? (attrs[k2] = v2);
      }
    }
    return attrs;
  }
  function formatInspect(className, payload, depth, options, inspect) {
    if (typeof depth === "number" && depth < 0) {
      const tag = `[${className}]`;
      return options?.stylize ? options.stylize(tag, "special") : tag;
    }
    if (typeof inspect !== "function" || !options) {
      return payload;
    }
    const childOptions = {
      ...options,
      depth: options.depth == null ? options.depth : options.depth - 1
    };
    return `${className} ${inspect(payload, childOptions)}`;
  }

  // node_modules/@opentelemetry/sdk-trace/build/esm/Span.js
  var SpanImpl = class {
    /**
     * Constructs a new SpanImpl instance.
     */
    constructor(opts) {
      // Below properties are included to implement ReadableSpan for export
      // purposes but are not intended to be written-to directly.
      __publicField(this, "_spanContext");
      __publicField(this, "kind");
      __publicField(this, "parentSpanContext");
      __publicField(this, "attributes", {});
      __publicField(this, "links", []);
      __publicField(this, "events", []);
      __publicField(this, "startTime");
      __publicField(this, "resource");
      __publicField(this, "instrumentationScope");
      __publicField(this, "_droppedAttributesCount", 0);
      __publicField(this, "_droppedEventsCount", 0);
      __publicField(this, "_droppedLinksCount", 0);
      __publicField(this, "_attributesCount", 0);
      __publicField(this, "name");
      __publicField(this, "status", {
        code: SpanStatusCode.UNSET
      });
      __publicField(this, "endTime", [0, 0]);
      __publicField(this, "_ended", false);
      __publicField(this, "_duration", [-1, -1]);
      __publicField(this, "_spanProcessor");
      __publicField(this, "_spanLimits");
      __publicField(this, "_attributeValueLengthLimit");
      __publicField(this, "_recordEndMetrics");
      __publicField(this, "_performanceStartTime");
      __publicField(this, "_performanceOffset");
      __publicField(this, "_startTimeProvided");
      const now = Date.now();
      this._spanContext = opts.spanContext;
      this._performanceStartTime = otperformance.now();
      this._performanceOffset = now - (this._performanceStartTime + otperformance.timeOrigin);
      this._startTimeProvided = opts.startTime != null;
      this._spanLimits = opts.spanLimits;
      this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit ?? 0;
      this._spanProcessor = opts.spanProcessor;
      this.name = opts.name;
      this.parentSpanContext = opts.parentSpanContext;
      this.kind = opts.kind;
      if (opts.links) {
        for (const link of opts.links) {
          this.addLink(link);
        }
      }
      this.startTime = this._getTime(opts.startTime ?? now);
      this.resource = opts.resource;
      this.instrumentationScope = opts.scope;
      this._recordEndMetrics = opts.recordEndMetrics;
      if (opts.attributes != null) {
        this.setAttributes(opts.attributes);
      }
      this._spanProcessor.onStart(this, opts.context);
    }
    spanContext() {
      return this._spanContext;
    }
    setAttribute(key, value) {
      if (value == null || this._isSpanEnded())
        return this;
      if (key.length === 0) {
        diag2.warn(`Invalid attribute key: ${key}`);
        return this;
      }
      if (!isAttributeValue(value)) {
        diag2.warn(`Invalid attribute value set for key: ${key}`);
        return this;
      }
      const { attributeCountLimit } = this._spanLimits;
      const isNewKey = !Object.prototype.hasOwnProperty.call(this.attributes, key);
      if (attributeCountLimit !== void 0 && this._attributesCount >= attributeCountLimit && isNewKey) {
        this._droppedAttributesCount++;
        return this;
      }
      this.attributes[key] = this._truncateToSize(value);
      if (isNewKey) {
        this._attributesCount++;
      }
      return this;
    }
    setAttributes(attributes) {
      for (const key in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, key)) {
          this.setAttribute(key, attributes[key]);
        }
      }
      return this;
    }
    /**
     *
     * @param name Span Name
     * @param [attributesOrStartTime] Span attributes or start time
     *     if type is {@type TimeInput} and 3rd param is undefined
     * @param [timeStamp] Specified time stamp for the event
     */
    addEvent(name, attributesOrStartTime, timeStamp) {
      if (this._isSpanEnded())
        return this;
      const { eventCountLimit } = this._spanLimits;
      if (eventCountLimit === 0) {
        diag2.warn("No events allowed.");
        this._droppedEventsCount++;
        return this;
      }
      if (eventCountLimit !== void 0 && this.events.length >= eventCountLimit) {
        if (this._droppedEventsCount === 0) {
          diag2.debug("Dropping extra events.");
        }
        this.events.shift();
        this._droppedEventsCount++;
      }
      if (isTimeInput(attributesOrStartTime)) {
        if (!isTimeInput(timeStamp)) {
          timeStamp = attributesOrStartTime;
        }
        attributesOrStartTime = void 0;
      }
      const sanitized = sanitizeAttributes(attributesOrStartTime);
      const { attributePerEventCountLimit } = this._spanLimits;
      const attributes = {};
      let droppedAttributesCount = 0;
      let eventAttributesCount = 0;
      for (const attr in sanitized) {
        if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) {
          continue;
        }
        const attrVal = sanitized[attr];
        if (attributePerEventCountLimit !== void 0 && eventAttributesCount >= attributePerEventCountLimit) {
          droppedAttributesCount++;
          continue;
        }
        attributes[attr] = this._truncateToSize(attrVal);
        eventAttributesCount++;
      }
      this.events.push({
        name,
        attributes,
        time: this._getTime(timeStamp),
        droppedAttributesCount
      });
      return this;
    }
    addLink(link) {
      if (this._isSpanEnded())
        return this;
      const { linkCountLimit } = this._spanLimits;
      if (linkCountLimit === 0) {
        this._droppedLinksCount++;
        return this;
      }
      if (linkCountLimit !== void 0 && this.links.length >= linkCountLimit) {
        if (this._droppedLinksCount === 0) {
          diag2.debug("Dropping extra links.");
        }
        this.links.shift();
        this._droppedLinksCount++;
      }
      const { attributePerLinkCountLimit } = this._spanLimits;
      const sanitized = sanitizeAttributes(link.attributes);
      const attributes = {};
      let droppedAttributesCount = 0;
      let linkAttributesCount = 0;
      for (const attr in sanitized) {
        if (!Object.prototype.hasOwnProperty.call(sanitized, attr)) {
          continue;
        }
        const attrVal = sanitized[attr];
        if (attributePerLinkCountLimit !== void 0 && linkAttributesCount >= attributePerLinkCountLimit) {
          droppedAttributesCount++;
          continue;
        }
        attributes[attr] = this._truncateToSize(attrVal);
        linkAttributesCount++;
      }
      const processedLink = { context: link.context };
      if (linkAttributesCount > 0) {
        processedLink.attributes = attributes;
      }
      if (droppedAttributesCount > 0) {
        processedLink.droppedAttributesCount = droppedAttributesCount;
      }
      this.links.push(processedLink);
      return this;
    }
    addLinks(links) {
      for (const link of links) {
        this.addLink(link);
      }
      return this;
    }
    setStatus(status) {
      if (this._isSpanEnded())
        return this;
      if (status.code === SpanStatusCode.UNSET)
        return this;
      if (this.status.code === SpanStatusCode.OK)
        return this;
      const newStatus = { code: status.code };
      if (status.code === SpanStatusCode.ERROR) {
        if (typeof status.message === "string") {
          newStatus.message = status.message;
        } else if (status.message != null) {
          diag2.warn(`Dropping invalid status.message of type '${typeof status.message}', expected 'string'`);
        }
      }
      this.status = newStatus;
      return this;
    }
    updateName(name) {
      if (this._isSpanEnded())
        return this;
      this.name = name;
      return this;
    }
    end(endTime) {
      if (this._isSpanEnded()) {
        diag2.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
        return;
      }
      this.endTime = this._getTime(endTime);
      this._duration = hrTimeDuration(this.startTime, this.endTime);
      if (this._duration[0] < 0) {
        diag2.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime);
        this.endTime = this.startTime.slice();
        this._duration = [0, 0];
      }
      if (this._droppedEventsCount > 0) {
        diag2.warn(`Dropped ${this._droppedEventsCount} events because eventCountLimit reached`);
      }
      if (this._droppedLinksCount > 0) {
        diag2.warn(`Dropped ${this._droppedLinksCount} links because linkCountLimit reached`);
      }
      if (this._spanProcessor.onEnding) {
        this._spanProcessor.onEnding(this);
      }
      this._recordEndMetrics?.();
      this._ended = true;
      this._spanProcessor.onEnd(this);
    }
    _getTime(inp) {
      if (typeof inp === "number" && inp <= otperformance.now()) {
        return hrTime(inp + this._performanceOffset);
      }
      if (typeof inp === "number") {
        return millisToHrTime(inp);
      }
      if (inp instanceof Date) {
        return millisToHrTime(inp.getTime());
      }
      if (isTimeInputHrTime(inp)) {
        return inp;
      }
      if (this._startTimeProvided) {
        return millisToHrTime(Date.now());
      }
      const msDuration = otperformance.now() - this._performanceStartTime;
      return addHrTimes(this.startTime, millisToHrTime(msDuration));
    }
    isRecording() {
      return this._ended === false;
    }
    recordException(exception, time) {
      const attributes = {};
      if (typeof exception === "string") {
        attributes[ATTR_EXCEPTION_MESSAGE] = exception;
      } else if (exception) {
        if (exception.code) {
          attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
        } else if (exception.name) {
          attributes[ATTR_EXCEPTION_TYPE] = exception.name;
        }
        if (exception.message) {
          attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
        }
        if (exception.stack) {
          attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
        }
      }
      if (attributes[ATTR_EXCEPTION_TYPE] || attributes[ATTR_EXCEPTION_MESSAGE]) {
        this.addEvent(ExceptionEventName, attributes, time);
      } else {
        diag2.warn(`Failed to record an exception ${exception}`);
      }
    }
    get duration() {
      return this._duration;
    }
    get ended() {
      return this._ended;
    }
    get droppedAttributesCount() {
      return this._droppedAttributesCount;
    }
    get droppedEventsCount() {
      return this._droppedEventsCount;
    }
    get droppedLinksCount() {
      return this._droppedLinksCount;
    }
    _isSpanEnded() {
      if (this._ended) {
        const error = new Error(`Operation attempted on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`);
        diag2.warn(`Cannot execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`, error);
      }
      return this._ended;
    }
    // Utility function to truncate given value within size
    // for value type of string, will truncate to given limit
    // for type of non-string, will return same value
    _truncateToLimitUtil(value, limit) {
      if (value.length <= limit) {
        return value;
      }
      return value.substring(0, limit);
    }
    /**
     * If the given attribute value is of type string and has more characters than given {@code attributeValueLengthLimit} then
     * return string with truncated to {@code attributeValueLengthLimit} characters
     *
     * If the given attribute value is array of strings then
     * return new array of strings with each element truncated to {@code attributeValueLengthLimit} characters
     *
     * Otherwise return same Attribute {@code value}
     *
     * @param value Attribute value
     * @returns truncated attribute value if required, otherwise same value
     */
    _truncateToSize(value) {
      const limit = this._attributeValueLengthLimit;
      if (limit <= 0) {
        diag2.warn(`Attribute value limit must be positive, got ${limit}`);
        return value;
      }
      if (typeof value === "string") {
        return this._truncateToLimitUtil(value, limit);
      }
      if (Array.isArray(value)) {
        return value.map((val) => typeof val === "string" ? this._truncateToLimitUtil(val, limit) : val);
      }
      return value;
    }
    [inspectCustom](depth, options, inspect) {
      const payload = {
        name: this.name,
        kind: this.kind,
        spanContext: this._spanContext,
        parentSpanContext: this.parentSpanContext,
        status: this.status,
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this._duration,
        ended: this._ended,
        attributes: this.attributes,
        events: this.events,
        links: this.links,
        droppedAttributesCount: this._droppedAttributesCount,
        droppedEventsCount: this._droppedEventsCount,
        droppedLinksCount: this._droppedLinksCount,
        instrumentationScope: this.instrumentationScope,
        resource: { attributes: settledResourceAttributes(this.resource) }
      };
      return formatInspect("SpanImpl", payload, depth, options, inspect);
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/Sampler.js
  var SamplingDecision2;
  (function(SamplingDecision3) {
    SamplingDecision3[SamplingDecision3["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision3[SamplingDecision3["RECORD"] = 1] = "RECORD";
    SamplingDecision3[SamplingDecision3["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
  })(SamplingDecision2 || (SamplingDecision2 = {}));

  // node_modules/@opentelemetry/sdk-trace/build/esm/semconv.js
  var ATTR_OTEL_COMPONENT_NAME2 = "otel.component.name";
  var ATTR_OTEL_COMPONENT_TYPE2 = "otel.component.type";
  var ATTR_OTEL_SPAN_PARENT_ORIGIN = "otel.span.parent.origin";
  var ATTR_OTEL_SPAN_SAMPLING_RESULT = "otel.span.sampling_result";
  var METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED = "otel.sdk.processor.span.processed";
  var METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_CAPACITY = "otel.sdk.processor.span.queue.capacity";
  var METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_SIZE = "otel.sdk.processor.span.queue.size";
  var METRIC_OTEL_SDK_SPAN_LIVE = "otel.sdk.span.live";
  var METRIC_OTEL_SDK_SPAN_STARTED = "otel.sdk.span.started";
  var OTEL_COMPONENT_TYPE_VALUE_BATCHING_SPAN_PROCESSOR = "batching_span_processor";

  // node_modules/@opentelemetry/sdk-trace/build/esm/TracerMetrics.js
  var TracerMetrics = class {
    constructor(meter) {
      __publicField(this, "startedSpans");
      __publicField(this, "liveSpans");
      this.startedSpans = meter.createCounter(METRIC_OTEL_SDK_SPAN_STARTED, {
        unit: "{span}",
        description: "The number of created spans."
      });
      this.liveSpans = meter.createUpDownCounter(METRIC_OTEL_SDK_SPAN_LIVE, {
        unit: "{span}",
        description: "The number of currently live spans."
      });
    }
    startSpan(parentSpanCtx, samplingDecision) {
      const samplingDecisionStr = samplingDecisionToString(samplingDecision);
      this.startedSpans.add(1, {
        [ATTR_OTEL_SPAN_PARENT_ORIGIN]: parentOrigin(parentSpanCtx),
        [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
      });
      if (samplingDecision === SamplingDecision2.NOT_RECORD) {
        return () => {
        };
      }
      const liveSpanAttributes = {
        [ATTR_OTEL_SPAN_SAMPLING_RESULT]: samplingDecisionStr
      };
      this.liveSpans.add(1, liveSpanAttributes);
      return () => {
        this.liveSpans.add(-1, liveSpanAttributes);
      };
    }
  };
  function parentOrigin(parentSpanContext) {
    if (!parentSpanContext) {
      return "none";
    }
    if (parentSpanContext.isRemote) {
      return "remote";
    }
    return "local";
  }
  function samplingDecisionToString(decision) {
    switch (decision) {
      case SamplingDecision2.RECORD_AND_SAMPLED:
        return "RECORD_AND_SAMPLE";
      case SamplingDecision2.RECORD:
        return "RECORD_ONLY";
      case SamplingDecision2.NOT_RECORD:
        return "DROP";
    }
  }

  // node_modules/@opentelemetry/sdk-trace/build/esm/version.js
  var VERSION5 = "2.11.0";

  // node_modules/@opentelemetry/sdk-trace/build/esm/Tracer.js
  var Tracer = class {
    /**
     * Constructs a new Tracer instance.
     */
    constructor(instrumentationScope, options) {
      __publicField(this, "_sampler");
      __publicField(this, "_spanLimits");
      __publicField(this, "_idGenerator");
      __publicField(this, "instrumentationScope");
      __publicField(this, "_resource");
      __publicField(this, "_spanProcessor");
      __publicField(this, "_tracerMetrics");
      this.instrumentationScope = instrumentationScope;
      this._sampler = options.sampler;
      this._spanLimits = options.spanLimits;
      this._resource = options.resource;
      this._idGenerator = options.idGenerator;
      this._spanProcessor = options.spanProcessor;
      const meter = options.meterProvider.getMeter("@opentelemetry/sdk-trace", VERSION5);
      this._tracerMetrics = new TracerMetrics(meter);
    }
    /**
     * Starts a new Span or returns the default NoopSpan based on the sampling
     * decision.
     */
    startSpan(name, options = {}, context2 = context.active()) {
      if (options.root) {
        context2 = trace.deleteSpan(context2);
      }
      const parentSpan = trace.getSpan(context2);
      if (isTracingSuppressed(context2)) {
        diag2.debug("Instrumentation suppressed, returning Noop Span");
        const nonRecordingSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
        return nonRecordingSpan;
      }
      const parentSpanContext = parentSpan?.spanContext();
      const spanId = this._idGenerator.generateSpanId();
      let validParentSpanContext;
      let traceId;
      let traceState;
      if (!parentSpanContext || !trace.isSpanContextValid(parentSpanContext)) {
        traceId = this._idGenerator.generateTraceId();
      } else {
        traceId = parentSpanContext.traceId;
        traceState = parentSpanContext.traceState;
        validParentSpanContext = parentSpanContext;
      }
      const spanKind = options.kind ?? SpanKind.INTERNAL;
      const links = (options.links ?? []).map((link) => {
        return {
          context: link.context,
          attributes: sanitizeAttributes(link.attributes)
        };
      });
      const attributes = sanitizeAttributes(options.attributes);
      const samplingResult = this._sampler.shouldSample(context2, traceId, name, spanKind, attributes, links);
      const recordEndMetrics = this._tracerMetrics.startSpan(parentSpanContext, samplingResult.decision);
      traceState = samplingResult.traceState ?? traceState;
      const traceFlags = samplingResult.decision === SamplingDecision.RECORD_AND_SAMPLED ? TraceFlags.SAMPLED : TraceFlags.NONE;
      const spanContext = { traceId, spanId, traceFlags, traceState };
      if (samplingResult.decision === SamplingDecision.NOT_RECORD) {
        diag2.debug("Recording is off, propagating context in a non-recording span");
        const nonRecordingSpan = trace.wrapSpanContext(spanContext);
        return nonRecordingSpan;
      }
      const initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
      const span = new SpanImpl({
        resource: this._resource,
        scope: this.instrumentationScope,
        context: context2,
        spanContext,
        name,
        kind: spanKind,
        links,
        parentSpanContext: validParentSpanContext,
        attributes: initAttributes,
        startTime: options.startTime,
        spanProcessor: this._spanProcessor,
        spanLimits: this._spanLimits,
        recordEndMetrics
      });
      return span;
    }
    startActiveSpan(name, arg2, arg3, arg4) {
      let opts;
      let ctx;
      let fn;
      if (arguments.length < 2) {
        return;
      } else if (arguments.length === 2) {
        fn = arg2;
      } else if (arguments.length === 3) {
        opts = arg2;
        fn = arg3;
      } else {
        opts = arg2;
        ctx = arg3;
        fn = arg4;
      }
      const parentContext = ctx ?? context.active();
      const span = this.startSpan(name, opts, parentContext);
      const contextWithSpanSet = trace.setSpan(parentContext, span);
      return context.with(contextWithSpanSet, fn, void 0, span);
    }
    [inspectCustom](depth, options, inspect) {
      const payload = {
        instrumentationScope: this.instrumentationScope,
        resource: { attributes: settledResourceAttributes(this._resource) },
        spanLimits: this._spanLimits
      };
      return formatInspect("Tracer", payload, depth, options, inspect);
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/MultiSpanProcessor.js
  var MultiSpanProcessor = class {
    constructor(spanProcessors) {
      __publicField(this, "_spanProcessors");
      this._spanProcessors = spanProcessors;
    }
    forceFlush() {
      const promises = [];
      for (const spanProcessor of this._spanProcessors) {
        promises.push(spanProcessor.forceFlush());
      }
      return new Promise((resolve) => {
        Promise.all(promises).then(() => {
          resolve();
        }).catch((error) => {
          globalErrorHandler(error || new Error("MultiSpanProcessor: forceFlush failed"));
          resolve();
        });
      });
    }
    onStart(span, context2) {
      for (const spanProcessor of this._spanProcessors) {
        spanProcessor.onStart(span, context2);
      }
    }
    onEnding(span) {
      for (const spanProcessor of this._spanProcessors) {
        if (spanProcessor.onEnding) {
          spanProcessor.onEnding(span);
        }
      }
    }
    onEnd(span) {
      for (const spanProcessor of this._spanProcessors) {
        spanProcessor.onEnd(span);
      }
    }
    shutdown() {
      const promises = [];
      for (const spanProcessor of this._spanProcessors) {
        promises.push(spanProcessor.shutdown());
      }
      return new Promise((resolve, reject) => {
        Promise.all(promises).then(() => {
          resolve();
        }, reject);
      });
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/sampler/AlwaysOffSampler.js
  var AlwaysOffSampler = class {
    shouldSample() {
      return {
        decision: SamplingDecision2.NOT_RECORD
      };
    }
    toString() {
      return "AlwaysOffSampler";
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/sampler/AlwaysOnSampler.js
  var AlwaysOnSampler = class {
    shouldSample() {
      return {
        decision: SamplingDecision2.RECORD_AND_SAMPLED
      };
    }
    toString() {
      return "AlwaysOnSampler";
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/sampler/ParentBasedSampler.js
  var ParentBasedSampler = class {
    constructor(config) {
      __publicField(this, "_root");
      __publicField(this, "_remoteParentSampled");
      __publicField(this, "_remoteParentNotSampled");
      __publicField(this, "_localParentSampled");
      __publicField(this, "_localParentNotSampled");
      this._root = config.root;
      if (!this._root) {
        globalErrorHandler(new Error("ParentBasedSampler must have a root sampler configured"));
        this._root = new AlwaysOnSampler();
      }
      this._remoteParentSampled = config.remoteParentSampled ?? new AlwaysOnSampler();
      this._remoteParentNotSampled = config.remoteParentNotSampled ?? new AlwaysOffSampler();
      this._localParentSampled = config.localParentSampled ?? new AlwaysOnSampler();
      this._localParentNotSampled = config.localParentNotSampled ?? new AlwaysOffSampler();
    }
    shouldSample(context2, traceId, spanName, spanKind, attributes, links) {
      const parentContext = trace.getSpanContext(context2);
      if (!parentContext || !isSpanContextValid(parentContext)) {
        return this._root.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      if (parentContext.isRemote) {
        if (parentContext.traceFlags & TraceFlags.SAMPLED) {
          return this._remoteParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
        }
        return this._remoteParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      if (parentContext.traceFlags & TraceFlags.SAMPLED) {
        return this._localParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      }
      return this._localParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
    }
    toString() {
      return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/export/SpanProcessorMetrics.js
  var componentCounter2 = /* @__PURE__ */ new Map();
  var SpanProcessorMetrics = class {
    constructor(componentType, meter, queueConfig) {
      __publicField(this, "processedSpans");
      __publicField(this, "queueSize");
      __publicField(this, "queueSizeCallback");
      __publicField(this, "standardAttrs");
      __publicField(this, "droppedAttrs");
      const counter = componentCounter2.get(componentType) ?? 0;
      componentCounter2.set(componentType, counter + 1);
      this.standardAttrs = {
        [ATTR_OTEL_COMPONENT_TYPE2]: componentType,
        [ATTR_OTEL_COMPONENT_NAME2]: `${componentType}/${counter}`
      };
      this.droppedAttrs = {
        ...this.standardAttrs,
        [ATTR_ERROR_TYPE]: "queue_full"
      };
      this.processedSpans = meter.createCounter(METRIC_OTEL_SDK_PROCESSOR_SPAN_PROCESSED, {
        unit: "{span}",
        description: "The number of spans for which the processing has finished, either successful or failed."
      });
      if (queueConfig) {
        const { capacity, getQueueSize } = queueConfig;
        const queueCapacity = meter.createUpDownCounter(METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_CAPACITY, {
          unit: "{span}",
          description: "The maximum number of spans the queue of a given instance of an SDK span processor can hold."
        });
        queueCapacity.add(capacity, this.standardAttrs);
        this.queueSize = meter.createObservableUpDownCounter(METRIC_OTEL_SDK_PROCESSOR_SPAN_QUEUE_SIZE, {
          unit: "{span}",
          description: "The number of spans in the queue of a given instance of an SDK span processor."
        });
        this.queueSizeCallback = (result) => result.observe(getQueueSize(), this.standardAttrs);
        this.queueSize.addCallback(this.queueSizeCallback);
      }
    }
    dropSpans(count) {
      this.processedSpans.add(count, this.droppedAttrs);
    }
    finishSpans(count, error) {
      if (!error) {
        this.processedSpans.add(count, this.standardAttrs);
        return;
      }
      const attrs = {
        ...this.standardAttrs,
        [ATTR_ERROR_TYPE]: error.name
      };
      this.processedSpans.add(count, attrs);
    }
    shutdown() {
      if (this.queueSize && this.queueSizeCallback) {
        this.queueSize.removeCallback(this.queueSizeCallback);
      }
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/export/BatchSpanProcessorBase.js
  var BatchSpanProcessorBase = class {
    constructor(options) {
      __publicField(this, "_maxExportBatchSize");
      __publicField(this, "_maxQueueSize");
      __publicField(this, "_scheduledDelayMillis");
      __publicField(this, "_exportTimeoutMillis");
      __publicField(this, "_exporter");
      __publicField(this, "_metrics");
      __publicField(this, "_isExporting", false);
      __publicField(this, "_finishedSpans", []);
      __publicField(this, "_timer");
      __publicField(this, "_shutdownOnce");
      __publicField(this, "_droppedSpansCount", 0);
      this._exporter = options.exporter;
      this._maxExportBatchSize = options.maxExportBatchSize ?? 512;
      this._maxQueueSize = options.maxQueueSize ?? 2048;
      this._scheduledDelayMillis = options.scheduledDelayMillis ?? 5e3;
      this._exportTimeoutMillis = options.exportTimeoutMillis ?? 3e4;
      this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
      if (this._maxExportBatchSize > this._maxQueueSize) {
        diag2.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize");
        this._maxExportBatchSize = this._maxQueueSize;
      }
      const meter = options.selfObsMeterProvider ? options.selfObsMeterProvider.getMeter("@opentelemetry/sdk-trace") : createNoopMeter();
      this._metrics = new SpanProcessorMetrics(OTEL_COMPONENT_TYPE_VALUE_BATCHING_SPAN_PROCESSOR, meter, {
        capacity: this._maxQueueSize,
        getQueueSize: () => this._finishedSpans.length
      });
    }
    forceFlush() {
      if (this._shutdownOnce.isCalled) {
        return this._shutdownOnce.promise;
      }
      return this._flushAll();
    }
    // does nothing.
    onStart(_span, _parentContext) {
    }
    onEnd(span) {
      if (this._shutdownOnce.isCalled) {
        return;
      }
      if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
        return;
      }
      this._addToBuffer(span);
    }
    shutdown() {
      return this._shutdownOnce.call();
    }
    _shutdown() {
      return Promise.resolve().then(() => {
        return this.onShutdown();
      }).then(() => {
        return this._flushAll();
      }).then(() => {
        this._metrics.shutdown();
        return this._exporter.shutdown();
      });
    }
    /** Add a span in the buffer. */
    _addToBuffer(span) {
      if (this._finishedSpans.length >= this._maxQueueSize) {
        if (this._droppedSpansCount === 0) {
          diag2.debug("maxQueueSize reached, dropping spans");
        }
        this._droppedSpansCount++;
        this._metrics.dropSpans(1);
        return;
      }
      if (this._droppedSpansCount > 0) {
        diag2.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`);
        this._droppedSpansCount = 0;
      }
      this._finishedSpans.push(span);
      this._maybeStartTimer();
    }
    /**
     * Send all spans to the exporter respecting the batch size limit
     * This function is used only on forceFlush or shutdown,
     * for all other cases _flush should be used
     * */
    _flushAll() {
      return new Promise((resolve, reject) => {
        const promises = [];
        const count = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
        for (let i2 = 0, j = count; i2 < j; i2++) {
          promises.push(this._flushOneBatch());
        }
        Promise.all(promises).then(() => {
          resolve();
        }).catch(reject);
      });
    }
    _flushOneBatch() {
      this._clearTimer();
      if (this._finishedSpans.length === 0) {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Timeout"));
        }, this._exportTimeoutMillis);
        context.with(suppressTracing(context.active()), () => {
          let spans;
          if (this._finishedSpans.length <= this._maxExportBatchSize) {
            spans = this._finishedSpans;
            this._finishedSpans = [];
          } else {
            spans = this._finishedSpans.splice(0, this._maxExportBatchSize);
          }
          const doExport = () => this._exporter.export(spans, (result) => {
            clearTimeout(timer);
            this._metrics.finishSpans(spans.length, result.error);
            if (result.code === ExportResultCode.SUCCESS) {
              resolve();
            } else {
              reject(result.error ?? new Error("BatchSpanProcessor: span export failed"));
            }
          });
          let pendingResources = null;
          for (let i2 = 0, len = spans.length; i2 < len; i2++) {
            const span = spans[i2];
            if (span.resource.asyncAttributesPending && span.resource.waitForAsyncAttributes) {
              pendingResources ?? (pendingResources = []);
              pendingResources.push(span.resource.waitForAsyncAttributes());
            }
          }
          if (pendingResources === null) {
            doExport();
          } else {
            Promise.all(pendingResources).then(doExport, (err) => {
              globalErrorHandler(err);
              reject(err);
            });
          }
        });
      });
    }
    _maybeStartTimer() {
      if (this._isExporting)
        return;
      const flush = () => {
        this._isExporting = true;
        this._flushOneBatch().finally(() => {
          this._isExporting = false;
          if (this._finishedSpans.length > 0) {
            this._clearTimer();
            this._maybeStartTimer();
          }
        }).catch((e2) => {
          this._isExporting = false;
          globalErrorHandler(e2);
        });
      };
      if (this._finishedSpans.length >= this._maxExportBatchSize) {
        return flush();
      }
      if (this._timer !== void 0)
        return;
      this._timer = setTimeout(() => flush(), this._scheduledDelayMillis);
      if (typeof this._timer !== "number") {
        this._timer.unref();
      }
    }
    _clearTimer() {
      if (this._timer !== void 0) {
        clearTimeout(this._timer);
        this._timer = void 0;
      }
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/platform/browser/export/BatchSpanProcessor.js
  var BatchSpanProcessor = class extends BatchSpanProcessorBase {
    constructor(options) {
      super(options);
      __publicField(this, "_visibilityChangeListener");
      __publicField(this, "_pageHideListener");
      this.onInit(options);
    }
    onInit(options) {
      if (options.disableAutoFlushOnDocumentHide !== true && typeof document !== "undefined") {
        this._visibilityChangeListener = () => {
          if (document.visibilityState === "hidden") {
            this.forceFlush().catch((error) => {
              globalErrorHandler(error);
            });
          }
        };
        this._pageHideListener = () => {
          this.forceFlush().catch((error) => {
            globalErrorHandler(error);
          });
        };
        document.addEventListener("visibilitychange", this._visibilityChangeListener);
        document.addEventListener("pagehide", this._pageHideListener);
      }
    }
    onShutdown() {
      if (typeof document !== "undefined") {
        if (this._visibilityChangeListener) {
          document.removeEventListener("visibilitychange", this._visibilityChangeListener);
        }
        if (this._pageHideListener) {
          document.removeEventListener("pagehide", this._pageHideListener);
        }
      }
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/platform/browser/RandomIdGenerator.js
  var TRACE_ID_BYTES = 16;
  var SPAN_ID_BYTES = 8;
  var TRACE_BUFFER = new Uint8Array(TRACE_ID_BYTES);
  var SPAN_BUFFER = new Uint8Array(SPAN_ID_BYTES);
  var HEX = Array.from({ length: 256 }, (_2, i2) => i2.toString(16).padStart(2, "0"));
  function randomFill(buf) {
    for (let i2 = 0; i2 < buf.length; i2++) {
      buf[i2] = Math.random() * 256 >>> 0;
    }
    for (let i2 = 0; i2 < buf.length; i2++) {
      if (buf[i2] > 0)
        return;
    }
    buf[buf.length - 1] = 1;
  }
  function toHex(buf) {
    let hex = "";
    for (let i2 = 0; i2 < buf.length; i2++) {
      hex += HEX[buf[i2]];
    }
    return hex;
  }
  var RandomIdGenerator = class {
    /**
     * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
     * characters corresponding to 128 bits.
     */
    generateTraceId() {
      randomFill(TRACE_BUFFER);
      return toHex(TRACE_BUFFER);
    }
    /**
     * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
     * characters corresponding to 64 bits.
     */
    generateSpanId() {
      randomFill(SPAN_BUFFER);
      return toHex(SPAN_BUFFER);
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/TracerProvider.js
  var ForceFlushState;
  (function(ForceFlushState2) {
    ForceFlushState2[ForceFlushState2["resolved"] = 0] = "resolved";
    ForceFlushState2[ForceFlushState2["timeout"] = 1] = "timeout";
    ForceFlushState2[ForceFlushState2["error"] = 2] = "error";
    ForceFlushState2[ForceFlushState2["unresolved"] = 3] = "unresolved";
  })(ForceFlushState || (ForceFlushState = {}));
  var TracerProvider = class {
    constructor(options = {}) {
      __publicField(this, "_resource");
      __publicField(this, "_activeSpanProcessor");
      __publicField(this, "_forceFlushTimeoutMillis");
      __publicField(this, "_tracerOptions");
      __publicField(this, "_tracers", /* @__PURE__ */ new Map());
      this._forceFlushTimeoutMillis = options.forceFlushTimeoutMillis ?? 3e4;
      this._resource = options.resource ?? defaultResource();
      const spanProcessors = options.spanProcessors ?? [];
      this._activeSpanProcessor = new MultiSpanProcessor(spanProcessors);
      this._tracerOptions = {
        resource: this._resource,
        sampler: options.sampler ?? new ParentBasedSampler({
          root: new AlwaysOnSampler()
        }),
        spanLimits: {
          attributeCountLimit: options.spanLimits?.attributeCountLimit ?? 128,
          attributeValueLengthLimit: options.spanLimits?.attributeValueLengthLimit ?? Infinity,
          eventCountLimit: options.spanLimits?.eventCountLimit ?? 128,
          linkCountLimit: options.spanLimits?.linkCountLimit ?? 128,
          attributePerEventCountLimit: options.spanLimits?.attributePerEventCountLimit ?? 128,
          attributePerLinkCountLimit: options.spanLimits?.attributePerLinkCountLimit ?? 128
        },
        idGenerator: options.idGenerator || new RandomIdGenerator(),
        spanProcessor: this._activeSpanProcessor,
        meterProvider: options.meterProvider ?? {
          getMeter() {
            return createNoopMeter();
          }
        }
      };
    }
    getTracer(name, version, options) {
      const key = `${name}@${version || ""}:${options?.schemaUrl || ""}`;
      if (!this._tracers.has(key)) {
        this._tracers.set(key, new Tracer({ name, version, schemaUrl: options?.schemaUrl }, this._tracerOptions));
      }
      return this._tracers.get(key);
    }
    forceFlush(options) {
      const timeout = options?.timeoutMillis ?? this._forceFlushTimeoutMillis;
      const promises = this._activeSpanProcessor["_spanProcessors"].map((spanProcessor) => {
        return new Promise((resolve) => {
          let state;
          const timeoutInterval = setTimeout(() => {
            resolve(new Error(`Span processor did not completed within timeout period of ${timeout} ms`));
            state = ForceFlushState.timeout;
          }, timeout);
          spanProcessor.forceFlush().then(() => {
            clearTimeout(timeoutInterval);
            if (state !== ForceFlushState.timeout) {
              state = ForceFlushState.resolved;
              resolve(state);
            }
          }).catch((error) => {
            clearTimeout(timeoutInterval);
            state = ForceFlushState.error;
            resolve(error);
          });
        });
      });
      return new Promise((resolve, reject) => {
        Promise.all(promises).then((results) => {
          const errors = results.filter((result) => result !== ForceFlushState.resolved);
          if (errors.length > 0) {
            reject(errors);
          } else {
            resolve();
          }
        }).catch((error) => reject([error]));
      });
    }
    shutdown() {
      return this._activeSpanProcessor.shutdown();
    }
    [inspectCustom](depth, options, inspect) {
      const processors = this._activeSpanProcessor["_spanProcessors"];
      const payload = {
        resource: { attributes: settledResourceAttributes(this._resource) },
        tracers: Array.from(this._tracers.keys()),
        spanProcessors: processors.map((p2) => p2.constructor?.name ?? "SpanProcessor")
      };
      return formatInspect("TracerProvider", payload, depth, options, inspect);
    }
  };

  // node_modules/@opentelemetry/sdk-trace/build/esm/sampler/TraceIdRatioBasedSampler.js
  var TraceIdRatioBasedSampler = class {
    constructor(ratio = 0) {
      __publicField(this, "_ratio");
      __publicField(this, "_upperBound");
      this._ratio = this._normalize(ratio);
      this._upperBound = this._ratio === 1 ? 4294967296 : Math.floor(this._ratio * 4294967295);
    }
    shouldSample(context2, traceId) {
      return {
        decision: isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound ? SamplingDecision2.RECORD_AND_SAMPLED : SamplingDecision2.NOT_RECORD
      };
    }
    toString() {
      return `TraceIdRatioBased{${this._ratio}}`;
    }
    _normalize(ratio) {
      if (typeof ratio !== "number" || isNaN(ratio))
        return 0;
      return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
    }
    _accumulate(traceId) {
      let accumulation = 0;
      for (let i2 = 0; i2 < 32; i2 += 8) {
        let part = 0;
        for (let j = 0; j < 8; j++) {
          const c2 = traceId.charCodeAt(i2 + j);
          const v2 = c2 < 58 ? c2 - 48 : c2 < 71 ? c2 - 55 : c2 - 87;
          part = part << 4 | v2;
        }
        accumulation = (accumulation ^ part) >>> 0;
      }
      return accumulation;
    }
  };

  // node_modules/@opentelemetry/sdk-trace-base/build/esm/config.js
  var TracesSamplerValues;
  (function(TracesSamplerValues2) {
    TracesSamplerValues2["AlwaysOff"] = "always_off";
    TracesSamplerValues2["AlwaysOn"] = "always_on";
    TracesSamplerValues2["ParentBasedAlwaysOff"] = "parentbased_always_off";
    TracesSamplerValues2["ParentBasedAlwaysOn"] = "parentbased_always_on";
    TracesSamplerValues2["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
    TracesSamplerValues2["TraceIdRatio"] = "traceidratio";
  })(TracesSamplerValues || (TracesSamplerValues = {}));
  var DEFAULT_RATIO = 1;
  function loadDefaultConfig() {
    return {
      sampler: buildSamplerFromEnv(),
      forceFlushTimeoutMillis: 3e4,
      generalLimits: {
        attributeValueLengthLimit: getNumberFromEnv("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
        attributeCountLimit: getNumberFromEnv("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? 128
      },
      spanLimits: {
        attributeValueLengthLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? Infinity,
        attributeCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? 128,
        linkCountLimit: getNumberFromEnv("OTEL_SPAN_LINK_COUNT_LIMIT") ?? 128,
        eventCountLimit: getNumberFromEnv("OTEL_SPAN_EVENT_COUNT_LIMIT") ?? 128,
        attributePerEventCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT") ?? 128,
        attributePerLinkCountLimit: getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT") ?? 128
      }
    };
  }
  function buildSamplerFromEnv() {
    const sampler = getStringFromEnv("OTEL_TRACES_SAMPLER") ?? TracesSamplerValues.ParentBasedAlwaysOn;
    switch (sampler) {
      case TracesSamplerValues.AlwaysOn:
        return new AlwaysOnSampler();
      case TracesSamplerValues.AlwaysOff:
        return new AlwaysOffSampler();
      case TracesSamplerValues.ParentBasedAlwaysOn:
        return new ParentBasedSampler({
          root: new AlwaysOnSampler()
        });
      case TracesSamplerValues.ParentBasedAlwaysOff:
        return new ParentBasedSampler({
          root: new AlwaysOffSampler()
        });
      case TracesSamplerValues.TraceIdRatio:
        return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
      case TracesSamplerValues.ParentBasedTraceIdRatio:
        return new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv())
        });
      default:
        diag2.error(`OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "${TracesSamplerValues.ParentBasedAlwaysOn}".`);
        return new ParentBasedSampler({
          root: new AlwaysOnSampler()
        });
    }
  }
  function getSamplerProbabilityFromEnv() {
    const probability = getNumberFromEnv("OTEL_TRACES_SAMPLER_ARG");
    if (probability == null) {
      diag2.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${DEFAULT_RATIO}.`);
      return DEFAULT_RATIO;
    }
    if (probability < 0 || probability > 1) {
      diag2.error(`OTEL_TRACES_SAMPLER_ARG=${probability} was given, but it is out of range ([0..1]), defaulting to ${DEFAULT_RATIO}.`);
      return DEFAULT_RATIO;
    }
    return probability;
  }

  // node_modules/@opentelemetry/sdk-trace-base/build/esm/utility.js
  var DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
  var DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
  function reconfigureLimits(userConfig) {
    const spanLimits = Object.assign({}, userConfig.spanLimits);
    spanLimits.attributeCountLimit = userConfig.spanLimits?.attributeCountLimit ?? userConfig.generalLimits?.attributeCountLimit ?? getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT") ?? getNumberFromEnv("OTEL_ATTRIBUTE_COUNT_LIMIT") ?? DEFAULT_ATTRIBUTE_COUNT_LIMIT;
    spanLimits.attributeValueLengthLimit = userConfig.spanLimits?.attributeValueLengthLimit ?? userConfig.generalLimits?.attributeValueLengthLimit ?? getNumberFromEnv("OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? getNumberFromEnv("OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT") ?? DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT;
    return Object.assign({}, userConfig, { spanLimits });
  }

  // node_modules/@opentelemetry/sdk-trace-base/build/esm/BasicTracerProvider-shim.js
  var BasicTracerProvider = class extends TracerProvider {
    constructor(config = {}) {
      const mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
      delete mergedConfig.generalLimits;
      super(mergedConfig);
    }
  };

  // node_modules/@opentelemetry/sdk-trace-base/build/esm/BatchSpanProcessor-shim.js
  var BatchSpanProcessor2 = class extends BatchSpanProcessor {
    constructor(exporter, config) {
      if (!config) {
        config = {};
      }
      const envFallbacks = [
        ["maxExportBatchSize", "OTEL_BSP_MAX_EXPORT_BATCH_SIZE"],
        ["maxQueueSize", "OTEL_BSP_MAX_QUEUE_SIZE"],
        ["scheduledDelayMillis", "OTEL_BSP_SCHEDULE_DELAY"],
        ["exportTimeoutMillis", "OTEL_BSP_EXPORT_TIMEOUT"]
      ];
      for (const [configName, envName] of envFallbacks) {
        if (config[configName] === void 0) {
          const envFallback = getNumberFromEnv(envName);
          if (envFallback !== void 0) {
            config[configName] = envFallback;
          }
        }
      }
      super({ exporter, ...config });
    }
  };

  // node_modules/@opentelemetry/sdk-trace-web/build/esm/StackContextManager.js
  var StackContextManager = class {
    constructor() {
      /**
       * whether the context manager is enabled or not
       */
      __publicField(this, "_enabled", false);
      /**
       * Keeps the reference to current context
       */
      __publicField(this, "_currentContext", ROOT_CONTEXT);
    }
    /**
     *
     * @param context
     * @param target Function to be executed within the context
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    _bindFunction(context2 = ROOT_CONTEXT, target) {
      const manager = this;
      const contextWrapper = function(...args) {
        return manager.with(context2, () => target.apply(this, args));
      };
      Object.defineProperty(contextWrapper, "length", {
        enumerable: false,
        configurable: true,
        writable: false,
        value: target.length
      });
      return contextWrapper;
    }
    /**
     * Returns the active context
     */
    active() {
      return this._currentContext;
    }
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param context A context (span) to be bind to target
     * @param target a function or event emitter. When target or one of its callbacks is called,
     *  the provided context will be used as the active context for the duration of the call.
     */
    bind(context2, target) {
      if (context2 === void 0) {
        context2 = this.active();
      }
      if (typeof target === "function") {
        return this._bindFunction(context2, target);
      }
      return target;
    }
    /**
     * Disable the context manager (clears the current context)
     */
    disable() {
      this._currentContext = ROOT_CONTEXT;
      this._enabled = false;
      return this;
    }
    /**
     * Enables the context manager and creates a default(root) context
     */
    enable() {
      if (this._enabled) {
        return this;
      }
      this._enabled = true;
      this._currentContext = ROOT_CONTEXT;
      return this;
    }
    /**
     * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
     * The context will be set as active
     * @param context
     * @param fn Callback function
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context2, fn, thisArg, ...args) {
      const previousContext = this._currentContext;
      this._currentContext = context2 || ROOT_CONTEXT;
      try {
        return fn.call(thisArg, ...args);
      } finally {
        this._currentContext = previousContext;
      }
    }
  };

  // node_modules/@opentelemetry/sdk-trace-web/build/esm/WebTracerProvider.js
  function setupContextManager(contextManager) {
    if (contextManager === null) {
      return;
    }
    if (contextManager === void 0) {
      const defaultContextManager = new StackContextManager();
      defaultContextManager.enable();
      context.setGlobalContextManager(defaultContextManager);
      return;
    }
    contextManager.enable();
    context.setGlobalContextManager(contextManager);
  }
  function setupPropagator(propagator) {
    if (propagator === null) {
      return;
    }
    if (propagator === void 0) {
      propagation.setGlobalPropagator(new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator()
        ]
      }));
      return;
    }
    propagation.setGlobalPropagator(propagator);
  }
  var WebTracerProvider = class extends BasicTracerProvider {
    /**
     * Constructs a new Tracer instance.
     * @param config Web Tracer config
     */
    constructor(config = {}) {
      super(config);
    }
    /**
     * Register this TracerProvider for use with the OpenTelemetry API.
     * Undefined values may be replaced with defaults, and
     * null values will be skipped.
     *
     * @param config Configuration object for SDK registration
     */
    register(config = {}) {
      trace.setGlobalTracerProvider(this);
      setupPropagator(config.propagator);
      setupContextManager(config.contextManager);
    }
  };

  // node_modules/@opentelemetry/sdk-trace-web/build/esm/enums/PerformanceTimingNames.js
  var PerformanceTimingNames;
  (function(PerformanceTimingNames2) {
    PerformanceTimingNames2["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames2["CONNECT_START"] = "connectStart";
    PerformanceTimingNames2["DECODED_BODY_SIZE"] = "decodedBodySize";
    PerformanceTimingNames2["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames2["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames2["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames2["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames2["ENCODED_BODY_SIZE"] = "encodedBodySize";
    PerformanceTimingNames2["FETCH_START"] = "fetchStart";
    PerformanceTimingNames2["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames2["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames2["NAVIGATION_START"] = "navigationStart";
    PerformanceTimingNames2["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames2["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames2["REQUEST_START"] = "requestStart";
    PerformanceTimingNames2["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames2["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames2["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames2["START_TIME"] = "startTime";
    PerformanceTimingNames2["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames2["UNLOAD_EVENT_START"] = "unloadEventStart";
  })(PerformanceTimingNames || (PerformanceTimingNames = {}));

  // node_modules/@opentelemetry/sdk-trace-web/build/esm/semconv.js
  var ATTR_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
  var ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";

  // node_modules/@opentelemetry/sdk-trace-web/build/esm/utils.js
  var urlNormalizingAnchor;
  function getUrlNormalizingAnchor() {
    if (!urlNormalizingAnchor) {
      urlNormalizingAnchor = document.createElement("a");
    }
    return urlNormalizingAnchor;
  }
  function hasKey(obj, key) {
    return key in obj;
  }
  function addSpanNetworkEvent(span, performanceName, entries, ignoreZeros = true) {
    if (hasKey(entries, performanceName) && typeof entries[performanceName] === "number" && !(ignoreZeros && entries[performanceName] === 0)) {
      return span.addEvent(performanceName, entries[performanceName]);
    }
    return void 0;
  }
  function addSpanNetworkEvents(span, resource, ignoreNetworkEvents = false, ignoreZeros, skipOldSemconvContentLengthAttrs) {
    if (ignoreZeros === void 0) {
      ignoreZeros = resource[PerformanceTimingNames.START_TIME] !== 0;
    }
    if (!ignoreNetworkEvents) {
      addSpanNetworkEvent(span, PerformanceTimingNames.FETCH_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_END, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.SECURE_CONNECTION_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_END, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.REQUEST_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_START, resource, ignoreZeros);
      addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_END, resource, ignoreZeros);
    }
    if (!skipOldSemconvContentLengthAttrs) {
      const encodedLength = resource[PerformanceTimingNames.ENCODED_BODY_SIZE];
      if (encodedLength !== void 0) {
        span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
      }
      const decodedLength = resource[PerformanceTimingNames.DECODED_BODY_SIZE];
      if (decodedLength !== void 0 && encodedLength !== decodedLength) {
        span.setAttribute(ATTR_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, decodedLength);
      }
    }
  }
  function sortResources(filteredResources) {
    return filteredResources.slice().sort((a2, b2) => {
      const valueA = a2[PerformanceTimingNames.FETCH_START];
      const valueB = b2[PerformanceTimingNames.FETCH_START];
      if (valueA > valueB) {
        return 1;
      } else if (valueA < valueB) {
        return -1;
      }
      return 0;
    });
  }
  function getOrigin() {
    return typeof location !== "undefined" ? location.origin : void 0;
  }
  function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources = /* @__PURE__ */ new WeakSet(), initiatorType) {
    const parsedSpanUrl = parseUrl(spanUrl);
    spanUrl = parsedSpanUrl.toString();
    const filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType);
    if (filteredResources.length === 0) {
      return {
        mainRequest: void 0
      };
    }
    if (filteredResources.length === 1) {
      return {
        mainRequest: filteredResources[0]
      };
    }
    const sorted = sortResources(filteredResources);
    if (parsedSpanUrl.origin !== getOrigin() && sorted.length > 1) {
      let corsPreFlightRequest = sorted[0];
      let mainRequest = findMainRequest(sorted, corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END], endTimeHR);
      const responseEnd = corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END];
      const fetchStart = mainRequest[PerformanceTimingNames.FETCH_START];
      if (fetchStart < responseEnd) {
        mainRequest = corsPreFlightRequest;
        corsPreFlightRequest = void 0;
      }
      return {
        corsPreFlightRequest,
        mainRequest
      };
    } else {
      return {
        mainRequest: filteredResources[0]
      };
    }
  }
  function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
    const spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
    const minTime = hrTimeToNanoseconds(timeInputToHrTime(corsPreFlightRequestEndTime));
    let mainRequest = resources[1];
    let bestGap;
    const length = resources.length;
    for (let i2 = 1; i2 < length; i2++) {
      const resource = resources[i2];
      const resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START]));
      const resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END]));
      const currentGap = spanEndTime - resourceEndTime;
      if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
        bestGap = currentGap;
        mainRequest = resource;
      }
    }
    return mainRequest;
  }
  function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
    const startTime = hrTimeToNanoseconds(startTimeHR);
    const endTime = hrTimeToNanoseconds(endTimeHR);
    let filteredResources = resources.filter((resource) => {
      const resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START]));
      const resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END]));
      return resource.initiatorType.toLowerCase() === (initiatorType || "xmlhttprequest") && resource.name === spanUrl && resourceStartTime >= startTime && resourceEndTime <= endTime;
    });
    if (filteredResources.length > 0) {
      filteredResources = filteredResources.filter((resource) => {
        return !ignoredResources.has(resource);
      });
    }
    return filteredResources;
  }
  function parseUrl(url) {
    if (typeof URL === "function") {
      return new URL(url, typeof document !== "undefined" ? document.baseURI : typeof location !== "undefined" ? location.href : void 0);
    }
    const element = getUrlNormalizingAnchor();
    element.href = url;
    return element;
  }
  function shouldPropagateTraceHeaders(spanUrl, propagateTraceHeaderCorsUrls) {
    let propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
    if (typeof propagateTraceHeaderUrls === "string" || propagateTraceHeaderUrls instanceof RegExp) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }
    const parsedSpanUrl = parseUrl(spanUrl);
    if (parsedSpanUrl.origin === getOrigin()) {
      return true;
    } else {
      return propagateTraceHeaderUrls.some((propagateTraceHeaderUrl) => urlMatches(spanUrl, propagateTraceHeaderUrl));
    }
  }

  // node_modules/@opentelemetry/instrumentation-document-load/build/esm/enums/AttributeNames.js
  var AttributeNames;
  (function(AttributeNames2) {
    AttributeNames2["DOCUMENT_LOAD"] = "documentLoad";
    AttributeNames2["DOCUMENT_FETCH"] = "documentFetch";
    AttributeNames2["RESOURCE_FETCH"] = "resourceFetch";
  })(AttributeNames || (AttributeNames = {}));

  // node_modules/@opentelemetry/instrumentation-document-load/build/esm/version.js
  var PACKAGE_VERSION = "0.67.0";
  var PACKAGE_NAME = "@opentelemetry/instrumentation-document-load";

  // node_modules/@opentelemetry/instrumentation-document-load/build/esm/enums/EventNames.js
  var EventNames;
  (function(EventNames3) {
    EventNames3["FIRST_PAINT"] = "firstPaint";
    EventNames3["FIRST_CONTENTFUL_PAINT"] = "firstContentfulPaint";
  })(EventNames || (EventNames = {}));

  // node_modules/@opentelemetry/instrumentation-document-load/build/esm/utils.js
  var getPerformanceNavigationEntries = () => {
    const entries = {};
    const performanceNavigationTiming = otperformance.getEntriesByType?.("navigation")[0];
    if (performanceNavigationTiming) {
      const keys = Object.values(PerformanceTimingNames);
      keys.forEach((key) => {
        if (hasKey(performanceNavigationTiming, key)) {
          const value = performanceNavigationTiming[key];
          if (typeof value === "number") {
            entries[key] = value;
          }
        }
      });
    } else {
      const perf = otperformance;
      const performanceTiming = perf.timing;
      if (performanceTiming) {
        const keys = Object.values(PerformanceTimingNames);
        keys.forEach((key) => {
          if (hasKey(performanceTiming, key)) {
            const value = performanceTiming[key];
            if (typeof value === "number") {
              entries[key] = value;
            }
          }
        });
      }
    }
    return entries;
  };
  var performancePaintNames = {
    "first-paint": EventNames.FIRST_PAINT,
    "first-contentful-paint": EventNames.FIRST_CONTENTFUL_PAINT
  };
  var addSpanPerformancePaintEvents = (span) => {
    const performancePaintTiming = otperformance.getEntriesByType?.("paint");
    if (performancePaintTiming) {
      performancePaintTiming.forEach(({ name, startTime }) => {
        if (hasKey(performancePaintNames, name)) {
          span.addEvent(performancePaintNames[name], startTime);
        }
      });
    }
  };

  // node_modules/@opentelemetry/instrumentation-document-load/build/esm/instrumentation.js
  var DocumentLoadInstrumentation = class extends InstrumentationBase {
    constructor(config = {}) {
      super(PACKAGE_NAME, PACKAGE_VERSION, config);
      __publicField(this, "component", "document-load");
      __publicField(this, "version", "1");
      __publicField(this, "moduleName", this.component);
    }
    init() {
    }
    /**
     * callback to be executed when page is loaded
     */
    _onDocumentLoaded() {
      window.setTimeout(() => {
        this._collectPerformance();
      });
    }
    /**
     * Adds spans for all resources
     * @param rootSpan
     */
    _addResourcesSpans(rootSpan) {
      const resources = otperformance.getEntriesByType?.("resource");
      if (resources) {
        resources.forEach((resource) => {
          this._initResourceSpan(resource, rootSpan);
        });
      }
    }
    /**
     * Collects information about performance and creates appropriate spans
     */
    _collectPerformance() {
      const metaElement = Array.from(document.getElementsByTagName("meta")).find((e2) => e2.getAttribute("name") === TRACE_PARENT_HEADER);
      const entries = getPerformanceNavigationEntries();
      const traceparent = metaElement && metaElement.content || "";
      context.with(propagation.extract(ROOT_CONTEXT, { traceparent }), () => {
        const rootSpan = this._startSpan(AttributeNames.DOCUMENT_LOAD, PerformanceTimingNames.FETCH_START, entries);
        if (!rootSpan) {
          return;
        }
        context.with(trace.setSpan(context.active(), rootSpan), () => {
          const fetchSpan = this._startSpan(AttributeNames.DOCUMENT_FETCH, PerformanceTimingNames.FETCH_START, entries);
          if (fetchSpan) {
            fetchSpan.setAttribute(ATTR_URL_FULL, location.href);
            context.with(trace.setSpan(context.active(), fetchSpan), () => {
              addSpanNetworkEvents(fetchSpan, entries, this.getConfig().ignoreNetworkEvents);
              this._addCustomAttributesOnSpan(fetchSpan, this.getConfig().applyCustomAttributesOnSpan?.documentFetch);
              this._endSpan(fetchSpan, PerformanceTimingNames.RESPONSE_END, entries);
            });
          }
        });
        rootSpan.setAttribute(ATTR_URL_FULL, location.href);
        rootSpan.setAttribute(ATTR_USER_AGENT_ORIGINAL, navigator.userAgent);
        this._addResourcesSpans(rootSpan);
        if (!this.getConfig().ignoreNetworkEvents) {
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.FETCH_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.UNLOAD_EVENT_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.UNLOAD_EVENT_END, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_INTERACTIVE, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_END, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.DOM_COMPLETE, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.LOAD_EVENT_START, entries);
          addSpanNetworkEvent(rootSpan, PerformanceTimingNames.LOAD_EVENT_END, entries);
        }
        if (!this.getConfig().ignorePerformancePaintEvents) {
          addSpanPerformancePaintEvents(rootSpan);
        }
        this._addCustomAttributesOnSpan(rootSpan, this.getConfig().applyCustomAttributesOnSpan?.documentLoad);
        this._endSpan(rootSpan, PerformanceTimingNames.LOAD_EVENT_END, entries);
      });
    }
    /**
     * Helper function for ending span
     * @param span
     * @param performanceName name of performance entry for time end
     * @param entries
     */
    _endSpan(span, performanceName, entries) {
      if (span) {
        if (hasKey(entries, performanceName)) {
          span.end(entries[performanceName]);
        } else {
          span.end();
        }
      }
    }
    /**
     * Creates and ends a span with network information about resource added as timed events
     * @param resource
     * @param parentSpan
     */
    _initResourceSpan(resource, parentSpan) {
      const span = this._startSpan(AttributeNames.RESOURCE_FETCH, PerformanceTimingNames.FETCH_START, resource, parentSpan);
      if (span) {
        span.setAttribute(ATTR_URL_FULL, resource.name);
        addSpanNetworkEvents(span, resource, this.getConfig().ignoreNetworkEvents);
        this._addCustomAttributesOnResourceSpan(span, resource, this.getConfig().applyCustomAttributesOnSpan?.resourceFetch);
        this._endSpan(span, PerformanceTimingNames.RESPONSE_END, resource);
      }
    }
    /**
     * Helper function for starting a span
     * @param spanName name of span
     * @param performanceName name of performance entry for time start
     * @param entries
     * @param parentSpan
     */
    _startSpan(spanName, performanceName, entries, parentSpan) {
      if (hasKey(entries, performanceName) && typeof entries[performanceName] === "number") {
        const span = this.tracer.startSpan(spanName, {
          startTime: entries[performanceName]
        }, parentSpan ? trace.setSpan(context.active(), parentSpan) : void 0);
        return span;
      }
      return void 0;
    }
    /**
     * executes callback {_onDocumentLoaded} when the page is loaded
     */
    _waitForPageLoad() {
      if (window.document.readyState === "complete") {
        this._onDocumentLoaded();
      } else {
        this._onDocumentLoaded = this._onDocumentLoaded.bind(this);
        window.addEventListener("load", this._onDocumentLoaded);
      }
    }
    /**
     * adds custom attributes to root span if configured
     */
    _addCustomAttributesOnSpan(span, applyCustomAttributesOnSpan) {
      if (applyCustomAttributesOnSpan) {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("addCustomAttributesOnSpan", error);
        }, true);
      }
    }
    /**
     * adds custom attributes to span if configured
     */
    _addCustomAttributesOnResourceSpan(span, resource, applyCustomAttributesOnSpan) {
      if (applyCustomAttributesOnSpan) {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span, resource), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("addCustomAttributesOnResourceSpan", error);
        }, true);
      }
    }
    /**
     * implements enable function
     */
    enable() {
      window.removeEventListener("load", this._onDocumentLoaded);
      this._waitForPageLoad();
    }
    /**
     * implements disable function
     */
    disable() {
      window.removeEventListener("load", this._onDocumentLoaded);
    }
  };

  // node_modules/@opentelemetry/instrumentation-fetch/build/esm/semconv.js
  var ATTR_HTTP_REQUEST_BODY_SIZE = "http.request.body.size";

  // node_modules/@opentelemetry/instrumentation-fetch/build/esm/utils.js
  var DIAG_LOGGER = diag2.createComponentLogger({
    namespace: "@opentelemetry/opentelemetry-instrumentation-fetch/utils"
  });
  function getFetchBodyLength(...args) {
    if (args[0] instanceof URL || typeof args[0] === "string") {
      const requestInit = args[1];
      if (!requestInit?.body) {
        return Promise.resolve();
      }
      if (requestInit.body instanceof ReadableStream) {
        const { body, length } = _getBodyNonDestructively(requestInit.body);
        requestInit.body = body;
        return length;
      } else {
        return Promise.resolve(getXHRBodyLength(requestInit.body));
      }
    } else {
      const info = args[0];
      if (!info?.body) {
        return Promise.resolve();
      }
      return info.clone().text().then((t2) => getByteLength(t2));
    }
  }
  function _getBodyNonDestructively(body) {
    if (!body.pipeThrough) {
      DIAG_LOGGER.warn("Platform has ReadableStream but not pipeThrough!");
      return {
        body,
        length: Promise.resolve(void 0)
      };
    }
    let length = 0;
    let resolveLength;
    const lengthPromise = new Promise((resolve) => {
      resolveLength = resolve;
    });
    const transform = new TransformStream({
      start() {
      },
      async transform(chunk, controller) {
        const bytearray = await chunk;
        length += bytearray.byteLength;
        controller.enqueue(chunk);
      },
      flush() {
        resolveLength(length);
      }
    });
    return {
      body: body.pipeThrough(transform),
      length: lengthPromise
    };
  }
  function isDocument(value) {
    return typeof Document !== "undefined" && value instanceof Document;
  }
  function getXHRBodyLength(body) {
    if (isDocument(body)) {
      return new XMLSerializer().serializeToString(document).length;
    }
    if (typeof body === "string") {
      return getByteLength(body);
    }
    if (body instanceof Blob) {
      return body.size;
    }
    if (body instanceof FormData) {
      return getFormDataSize(body);
    }
    if (body instanceof URLSearchParams) {
      return getByteLength(body.toString());
    }
    if (body.byteLength !== void 0) {
      return body.byteLength;
    }
    DIAG_LOGGER.warn("unknown body type");
    return void 0;
  }
  var TEXT_ENCODER = new TextEncoder();
  function getByteLength(s2) {
    return TEXT_ENCODER.encode(s2).byteLength;
  }
  function getFormDataSize(formData) {
    let size = 0;
    for (const [key, value] of formData.entries()) {
      size += key.length;
      if (value instanceof Blob) {
        size += value.size;
      } else {
        size += value.length;
      }
    }
    return size;
  }
  function normalizeHttpRequestMethod(method) {
    const knownMethods3 = getKnownMethods();
    const methUpper = method.toUpperCase();
    if (methUpper in knownMethods3) {
      return methUpper;
    } else {
      return "_OTHER";
    }
  }
  var DEFAULT_KNOWN_METHODS = {
    CONNECT: true,
    DELETE: true,
    GET: true,
    HEAD: true,
    OPTIONS: true,
    PATCH: true,
    POST: true,
    PUT: true,
    TRACE: true,
    // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
    QUERY: true
  };
  var knownMethods;
  function getKnownMethods() {
    if (knownMethods === void 0) {
      const cfgMethods = getStringListFromEnv("OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS");
      if (cfgMethods && cfgMethods.length > 0) {
        knownMethods = {};
        cfgMethods.forEach((m2) => {
          knownMethods[m2] = true;
        });
      } else {
        knownMethods = DEFAULT_KNOWN_METHODS;
      }
    }
    return knownMethods;
  }
  var HTTP_PORT_FROM_PROTOCOL = {
    "https:": "443",
    "http:": "80"
  };
  function serverPortFromUrl(url) {
    const serverPort = Number(url.port || HTTP_PORT_FROM_PROTOCOL[url.protocol]);
    if (serverPort && !isNaN(serverPort)) {
      return serverPort;
    } else {
      return void 0;
    }
  }

  // node_modules/@opentelemetry/instrumentation-fetch/build/esm/version.js
  var VERSION6 = "0.222.0";

  // node_modules/@opentelemetry/instrumentation-fetch/build/esm/fetch.js
  var OBSERVER_WAIT_TIME_MS = 300;
  var hasBrowserPerformanceAPI = typeof PerformanceObserver !== "undefined";
  var FetchInstrumentation = class extends InstrumentationBase {
    constructor(config = {}) {
      super("@opentelemetry/instrumentation-fetch", VERSION6, config);
      __publicField(this, "component", "fetch");
      __publicField(this, "version", VERSION6);
      __publicField(this, "moduleName", this.component);
      __publicField(this, "_usedResources", /* @__PURE__ */ new WeakSet());
      __publicField(this, "_tasksCount", 0);
    }
    init() {
    }
    /**
     * Add cors pre flight child span
     * @param span
     * @param corsPreFlightRequest
     */
    _addChildSpan(span, corsPreFlightRequest) {
      const childSpan = this.tracer.startSpan("CORS Preflight", {
        startTime: corsPreFlightRequest[PerformanceTimingNames.FETCH_START]
      }, trace.setSpan(context.active(), span));
      addSpanNetworkEvents(childSpan, corsPreFlightRequest, this.getConfig().ignoreNetworkEvents, void 0, true);
      childSpan.end(corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END]);
    }
    /**
     * Adds more attributes to span just before ending it
     * @param span
     * @param response
     */
    _addFinalSpanAttributes(span, response) {
      const parsedUrl = parseUrl(response.url);
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, response.status);
      span.setAttribute(ATTR_SERVER_ADDRESS, parsedUrl.hostname);
      const serverPort = serverPortFromUrl(parsedUrl);
      if (serverPort) {
        span.setAttribute(ATTR_SERVER_PORT, serverPort);
      }
    }
    /**
     * Add headers
     * @param options
     * @param spanUrl
     */
    _addHeaders(options, spanUrl) {
      if (!shouldPropagateTraceHeaders(spanUrl, this.getConfig().propagateTraceHeaderCorsUrls)) {
        const headers = {};
        propagation.inject(context.active(), headers);
        if (Object.keys(headers).length > 0) {
          this._diag.debug("headers inject skipped due to CORS policy");
        }
        return;
      }
      if (options instanceof Request) {
        propagation.inject(context.active(), options.headers, {
          set: (h2, k2, v2) => h2.set(k2, typeof v2 === "string" ? v2 : String(v2))
        });
      } else {
        const headers = new Headers(options.headers);
        propagation.inject(context.active(), headers, {
          set: (h2, k2, v2) => h2.set(k2, typeof v2 === "string" ? v2 : String(v2))
        });
        options.headers = headers;
      }
    }
    /**
     * Clears the resource timings and all resources assigned with spans
     *     when {@link FetchPluginConfig.clearTimingResources} is
     *     set to true (default false)
     * @private
     */
    _clearResources() {
      if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
        performance.clearResourceTimings();
        this._usedResources = /* @__PURE__ */ new WeakSet();
      }
    }
    /**
     * Creates a new span
     * @param url
     * @param options
     */
    _createSpan(url, options = {}) {
      if (isUrlIgnored(url, this.getConfig().ignoreUrls)) {
        this._diag.debug("ignoring span as url matches ignored url");
        return;
      }
      const attributes = {};
      const origMethod = options.method;
      const normMethod = normalizeHttpRequestMethod(options.method || "GET");
      const name = normMethod;
      attributes[ATTR_HTTP_REQUEST_METHOD] = normMethod;
      if (normMethod !== origMethod) {
        attributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = origMethod;
      }
      attributes[ATTR_URL_FULL] = url;
      return this.tracer.startSpan(name, {
        kind: SpanKind.CLIENT,
        attributes
      });
    }
    /**
     * Finds appropriate resource and add network events to the span
     * @param span
     * @param resourcesObserver
     * @param endTime
     */
    _findResourceAndAddNetworkEvents(span, resourcesObserver, endTime) {
      let resources = resourcesObserver.entries;
      if (!resources.length) {
        if (!performance.getEntriesByType) {
          return;
        }
        resources = performance.getEntriesByType("resource");
      }
      const resource = getResource(resourcesObserver.spanUrl, resourcesObserver.startTime, endTime, resources, this._usedResources, "fetch");
      if (resource.mainRequest) {
        const mainRequest = resource.mainRequest;
        this._markResourceAsUsed(mainRequest);
        const corsPreFlightRequest = resource.corsPreFlightRequest;
        if (corsPreFlightRequest) {
          this._addChildSpan(span, corsPreFlightRequest);
          this._markResourceAsUsed(corsPreFlightRequest);
        }
        addSpanNetworkEvents(span, mainRequest, this.getConfig().ignoreNetworkEvents, void 0, true);
      }
    }
    /**
     * Marks certain [resource]{@link PerformanceResourceTiming} when information
     * from this is used to add events to span.
     * This is done to avoid reusing the same resource again for next span
     * @param resource
     */
    _markResourceAsUsed(resource) {
      this._usedResources.add(resource);
    }
    /**
     * Finish span, add attributes, network events etc.
     * @param span
     * @param spanData
     * @param response
     */
    _endSpan(span, spanData, response) {
      const endTime = millisToHrTime(Date.now());
      const performanceEndTime = hrTime();
      this._addFinalSpanAttributes(span, response);
      if (response.status >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.setAttribute(ATTR_ERROR_TYPE, String(response.status));
      }
      setTimeout(() => {
        spanData.observer?.disconnect();
        this._findResourceAndAddNetworkEvents(span, spanData, performanceEndTime);
        this._tasksCount--;
        this._clearResources();
        span.end(endTime);
      }, OBSERVER_WAIT_TIME_MS);
    }
    /**
     * Patches the constructor of fetch
     */
    _patchConstructor() {
      return (original) => {
        const plugin = this;
        return function patchConstructor(...args) {
          if (!plugin._isEnabled) {
            return original.apply(this, args);
          }
          const self2 = this;
          const url = parseUrl(args[0] instanceof Request ? args[0].url : String(args[0])).href;
          let options;
          if (args[0] instanceof Request) {
            options = args[1] != null ? new Request(args[0], args[1]) : args[0];
          } else {
            options = args[1] || {};
          }
          const createdSpan = plugin._createSpan(url, options);
          if (!createdSpan) {
            return original.apply(this, args);
          }
          const spanData = plugin._prepareSpanData(url);
          if (plugin.getConfig().measureRequestSize) {
            getFetchBodyLength(...args).then((bodyLength) => {
              if (!bodyLength)
                return;
              createdSpan.setAttribute(ATTR_HTTP_REQUEST_BODY_SIZE, bodyLength);
            }).catch((error) => {
              plugin._diag.warn("getFetchBodyLength", error);
            });
          }
          function endSpanOnError(span, error) {
            plugin._applyAttributesAfterFetch(span, options, error);
            plugin._endSpan(span, spanData, {
              status: error.status || 0,
              statusText: error.message,
              url
            });
          }
          function endSpanOnSuccess(span, response) {
            plugin._applyAttributesAfterFetch(span, options, response);
            if (response.status >= 200 && response.status < 400) {
              plugin._endSpan(span, spanData, response);
            } else {
              plugin._endSpan(span, spanData, {
                status: response.status,
                statusText: response.statusText,
                url
              });
            }
          }
          function onSuccess(span, response) {
            try {
              const resClone = response.clone();
              const body = resClone.body;
              if (body) {
                const reader = body.getReader();
                const read = () => {
                  reader.read().then(({ done }) => {
                    if (done) {
                      endSpanOnSuccess(span, response);
                    } else {
                      read();
                    }
                  }, (error) => {
                    endSpanOnError(span, error);
                  });
                };
                read();
              } else {
                endSpanOnSuccess(span, response);
              }
            } catch (error) {
              plugin._diag.error("Failed to read fetch response body", error);
              plugin._endSpan(span, spanData, {
                status: 0,
                url
              });
            }
            return response;
          }
          function onError(span, error) {
            try {
              endSpanOnError(span, error);
            } catch (e2) {
              plugin._diag.error("Failed to end span on fetch error", e2);
              plugin._endSpan(span, spanData, {
                status: error.status || 0,
                url
              });
            }
            throw error;
          }
          return context.with(trace.setSpan(context.active(), createdSpan), () => {
            plugin._callRequestHook(createdSpan, options);
            plugin._addHeaders(options, url);
            plugin._tasksCount++;
            return original.apply(self2, options instanceof Request ? [options] : [url, options]).then(onSuccess.bind(self2, createdSpan), onError.bind(self2, createdSpan));
          });
        };
      };
    }
    _applyAttributesAfterFetch(span, request, result) {
      const applyCustomAttributesOnSpan = this.getConfig().applyCustomAttributesOnSpan;
      if (applyCustomAttributesOnSpan) {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span, request, result), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("applyCustomAttributesOnSpan", error);
        }, true);
      }
    }
    _callRequestHook(span, request) {
      const requestHook = this.getConfig().requestHook;
      if (requestHook) {
        safeExecuteInTheMiddle(() => requestHook(span, request), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("requestHook", error);
        }, true);
      }
    }
    /**
     * Prepares a span data - needed later for matching appropriate network
     *     resources
     * @param spanUrl
     */
    _prepareSpanData(spanUrl) {
      const startTime = hrTime();
      const entries = [];
      if (typeof PerformanceObserver !== "function") {
        return { entries, startTime, spanUrl };
      }
      const observer = new PerformanceObserver((list) => {
        const perfObsEntries = list.getEntries();
        perfObsEntries.forEach((entry) => {
          if (entry.initiatorType === "fetch" && entry.name === spanUrl) {
            entries.push(entry);
          }
        });
      });
      observer.observe({
        entryTypes: ["resource"]
      });
      return { entries, observer, startTime, spanUrl };
    }
    /**
     * implements enable function
     */
    enable() {
      if (!hasBrowserPerformanceAPI) {
        this._diag.warn("this instrumentation is intended for web usage only, it does not instrument server-side fetch()");
        return;
      }
      if (this._isEnabled) {
        return;
      }
      if (this._isFetchPatched) {
        this._diag.debug("fetch constructor already patched");
        this._isEnabled = true;
        return;
      }
      try {
        this._wrap(globalThis, "fetch", this._patchConstructor());
        this._isFetchPatched = true;
        this._isEnabled = true;
      } catch (err) {
        this._diag.warn("Failed to patch globalThis.fetch; instrumentation will not be enabled. Another script may have locked globalThis.fetch via Object.defineProperty.", err);
      }
    }
    /**
     * deactivates fetch instrumentation
     */
    disable() {
      if (!hasBrowserPerformanceAPI) {
        return;
      }
      if (!this._isEnabled) {
        return;
      }
      this._isEnabled = false;
      this._usedResources = /* @__PURE__ */ new WeakSet();
    }
  };

  // node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/semconv.js
  var ATTR_HTTP_REQUEST_BODY_SIZE2 = "http.request.body.size";

  // node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/enums/EventNames.js
  var EventNames2;
  (function(EventNames3) {
    EventNames3["METHOD_OPEN"] = "open";
    EventNames3["METHOD_SEND"] = "send";
    EventNames3["EVENT_ABORT"] = "abort";
    EventNames3["EVENT_ERROR"] = "error";
    EventNames3["EVENT_LOAD"] = "loaded";
    EventNames3["EVENT_TIMEOUT"] = "timeout";
  })(EventNames2 || (EventNames2 = {}));

  // node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/utils.js
  var DIAG_LOGGER2 = diag2.createComponentLogger({
    namespace: "@opentelemetry/opentelemetry-instrumentation-xml-http-request/utils"
  });
  function isDocument2(value) {
    return typeof Document !== "undefined" && value instanceof Document;
  }
  function getXHRBodyLength2(body) {
    if (isDocument2(body)) {
      return new XMLSerializer().serializeToString(document).length;
    }
    if (typeof body === "string") {
      return getByteLength2(body);
    }
    if (body instanceof Blob) {
      return body.size;
    }
    if (body instanceof FormData) {
      return getFormDataSize2(body);
    }
    if (body instanceof URLSearchParams) {
      return getByteLength2(body.toString());
    }
    if (body.byteLength !== void 0) {
      return body.byteLength;
    }
    DIAG_LOGGER2.warn("unknown body type");
    return void 0;
  }
  var TEXT_ENCODER2 = new TextEncoder();
  function getByteLength2(s2) {
    return TEXT_ENCODER2.encode(s2).byteLength;
  }
  function getFormDataSize2(formData) {
    let size = 0;
    for (const [key, value] of formData.entries()) {
      size += key.length;
      if (value instanceof Blob) {
        size += value.size;
      } else {
        size += value.length;
      }
    }
    return size;
  }
  function normalizeHttpRequestMethod2(method) {
    const knownMethods3 = getKnownMethods2();
    const methUpper = method.toUpperCase();
    if (methUpper in knownMethods3) {
      return methUpper;
    } else {
      return "_OTHER";
    }
  }
  var DEFAULT_KNOWN_METHODS2 = {
    CONNECT: true,
    DELETE: true,
    GET: true,
    HEAD: true,
    OPTIONS: true,
    PATCH: true,
    POST: true,
    PUT: true,
    TRACE: true,
    // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
    QUERY: true
  };
  var knownMethods2;
  function getKnownMethods2() {
    if (knownMethods2 === void 0) {
      const cfgMethods = getStringListFromEnv("OTEL_INSTRUMENTATION_HTTP_KNOWN_METHODS");
      if (cfgMethods && cfgMethods.length > 0) {
        knownMethods2 = {};
        cfgMethods.forEach((m2) => {
          knownMethods2[m2] = true;
        });
      } else {
        knownMethods2 = DEFAULT_KNOWN_METHODS2;
      }
    }
    return knownMethods2;
  }
  var HTTP_PORT_FROM_PROTOCOL2 = {
    "https:": "443",
    "http:": "80"
  };
  function serverPortFromUrl2(url) {
    const serverPort = Number(url.port || HTTP_PORT_FROM_PROTOCOL2[url.protocol]);
    if (serverPort && !isNaN(serverPort)) {
      return serverPort;
    } else {
      return void 0;
    }
  }

  // node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/version.js
  var VERSION7 = "0.222.0";

  // node_modules/@opentelemetry/instrumentation-xml-http-request/build/esm/xhr.js
  var OBSERVER_WAIT_TIME_MS2 = 300;
  var XMLHttpRequestInstrumentation = class extends InstrumentationBase {
    constructor(config = {}) {
      super("@opentelemetry/instrumentation-xml-http-request", VERSION7, config);
      __publicField(this, "component", "xml-http-request");
      __publicField(this, "version", VERSION7);
      __publicField(this, "moduleName", this.component);
      __publicField(this, "_tasksCount", 0);
      __publicField(this, "_xhrMem", /* @__PURE__ */ new WeakMap());
      __publicField(this, "_usedResources", /* @__PURE__ */ new WeakSet());
    }
    init() {
    }
    /**
     * Adds custom headers to XMLHttpRequest
     * @param xhr
     * @param spanUrl
     * @private
     */
    _addHeaders(xhr, spanUrl) {
      const url = parseUrl(spanUrl).href;
      if (!shouldPropagateTraceHeaders(url, this.getConfig().propagateTraceHeaderCorsUrls)) {
        const headers2 = {};
        propagation.inject(context.active(), headers2);
        if (Object.keys(headers2).length > 0) {
          this._diag.debug("headers inject skipped due to CORS policy");
        }
        return;
      }
      const headers = {};
      propagation.inject(context.active(), headers);
      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, String(headers[key]));
      });
    }
    /**
     * Add cors pre flight child span
     * @param span
     * @param corsPreFlightRequest
     * @private
     */
    _addChildSpan(span, corsPreFlightRequest) {
      context.with(trace.setSpan(context.active(), span), () => {
        const childSpan = this.tracer.startSpan("CORS Preflight", {
          startTime: corsPreFlightRequest[PerformanceTimingNames.FETCH_START]
        });
        addSpanNetworkEvents(childSpan, corsPreFlightRequest, this.getConfig().ignoreNetworkEvents, void 0, true);
        childSpan.end(corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END]);
      });
    }
    /**
     * Add attributes when span is going to end
     * @param span
     * @param xhr
     * @private
     */
    _addFinalSpanAttributes(span, xhrMem) {
      if (xhrMem.status) {
        span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, xhrMem.status);
      }
    }
    _applyAttributesAfterXHR(span, xhr) {
      const applyCustomAttributesOnSpan = this.getConfig().applyCustomAttributesOnSpan;
      if (typeof applyCustomAttributesOnSpan === "function") {
        safeExecuteInTheMiddle(() => applyCustomAttributesOnSpan(span, xhr), (error) => {
          if (!error) {
            return;
          }
          this._diag.error("applyCustomAttributesOnSpan", error);
        }, true);
      }
    }
    /**
     * will collect information about all resources created
     * between "send" and "end" with additional waiting for main resource
     * @param xhr
     * @param spanUrl
     * @private
     */
    _addResourceObserver(xhr, spanUrl) {
      const xhrMem = this._xhrMem.get(xhr);
      if (!xhrMem || typeof PerformanceObserver !== "function" || typeof PerformanceResourceTiming !== "function") {
        return;
      }
      xhrMem.createdResources = {
        observer: new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const parsedUrl = parseUrl(spanUrl);
          entries.forEach((entry) => {
            if (entry.initiatorType === "xmlhttprequest" && entry.name === parsedUrl.href) {
              if (xhrMem.createdResources) {
                xhrMem.createdResources.entries.push(entry);
              }
            }
          });
        }),
        entries: []
      };
      xhrMem.createdResources.observer.observe({
        entryTypes: ["resource"]
      });
    }
    /**
     * Clears the resource timings and all resources assigned with spans
     *     when {@link XMLHttpRequestInstrumentationConfig.clearTimingResources} is
     *     set to true (default false)
     * @private
     */
    _clearResources() {
      if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
        otperformance.clearResourceTimings();
        this._xhrMem = /* @__PURE__ */ new WeakMap();
        this._usedResources = /* @__PURE__ */ new WeakSet();
      }
    }
    /**
     * Finds appropriate resource and add network events to the span
     * @param span
     */
    _findResourceAndAddNetworkEvents(xhrMem, span, spanUrl, startTime, endTime) {
      if (!spanUrl || !startTime || !endTime || !xhrMem.createdResources) {
        return;
      }
      let resources = xhrMem.createdResources.entries;
      if (!resources || !resources.length) {
        resources = otperformance.getEntriesByType("resource");
      }
      const resource = getResource(parseUrl(spanUrl).href, startTime, endTime, resources, this._usedResources);
      if (resource.mainRequest) {
        const mainRequest = resource.mainRequest;
        this._markResourceAsUsed(mainRequest);
        const corsPreFlightRequest = resource.corsPreFlightRequest;
        if (corsPreFlightRequest) {
          this._addChildSpan(span, corsPreFlightRequest);
          this._markResourceAsUsed(corsPreFlightRequest);
        }
        addSpanNetworkEvents(span, mainRequest, this.getConfig().ignoreNetworkEvents, void 0, true);
      }
    }
    /**
     * Removes the previous information about span.
     * This might happened when the same xhr is used again.
     * @param xhr
     * @private
     */
    _cleanPreviousSpanInformation(xhr) {
      const xhrMem = this._xhrMem.get(xhr);
      if (xhrMem) {
        const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
        if (callbackToRemoveEvents) {
          callbackToRemoveEvents();
        }
        this._xhrMem.delete(xhr);
      }
    }
    /**
     * Creates a new span when method "open" is called
     * @param xhr
     * @param url
     * @param method
     * @private
     */
    _createSpan(xhr, url, method) {
      const parsedUrl = parseUrl(url);
      if (isUrlIgnored(parsedUrl.href, this.getConfig().ignoreUrls)) {
        this._diag.debug("ignoring span as url matches ignored url");
        return;
      }
      const attributes = {};
      const origMethod = method;
      const normMethod = normalizeHttpRequestMethod2(method);
      const name = normMethod;
      attributes[ATTR_HTTP_REQUEST_METHOD] = normMethod;
      if (normMethod !== origMethod) {
        attributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = origMethod;
      }
      attributes[ATTR_URL_FULL] = parsedUrl.toString();
      attributes[ATTR_SERVER_ADDRESS] = parsedUrl.hostname;
      const serverPort = serverPortFromUrl2(parsedUrl);
      if (serverPort) {
        attributes[ATTR_SERVER_PORT] = serverPort;
      }
      const currentSpan = this.tracer.startSpan(name, {
        kind: SpanKind.CLIENT,
        attributes
      });
      currentSpan.addEvent(EventNames2.METHOD_OPEN);
      this._cleanPreviousSpanInformation(xhr);
      this._xhrMem.set(xhr, {
        span: currentSpan,
        spanUrl: url
      });
      return currentSpan;
    }
    /**
     * Marks certain [resource]{@link PerformanceResourceTiming} when information
     * from this is used to add events to span.
     * This is done to avoid reusing the same resource again for next span
     * @param resource
     * @private
     */
    _markResourceAsUsed(resource) {
      this._usedResources.add(resource);
    }
    /**
     * Patches the method open
     * @private
     */
    _patchOpen() {
      return (original) => {
        const plugin = this;
        return function patchOpen(...args) {
          if (!plugin._isEnabled) {
            return original.apply(this, args);
          }
          const method = args[0];
          const url = args[1];
          plugin._createSpan(this, url, method);
          return original.apply(this, args);
        };
      };
    }
    /**
     * Patches the method send
     * @private
     */
    _patchSend() {
      const plugin = this;
      function endSpanTimeout(eventName, xhrMem, performanceEndTime, endTime) {
        const callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
        if (typeof callbackToRemoveEvents === "function") {
          callbackToRemoveEvents();
        }
        const { span, spanUrl, sendStartTime } = xhrMem;
        if (span) {
          plugin._findResourceAndAddNetworkEvents(xhrMem, span, spanUrl, sendStartTime, performanceEndTime);
          span.addEvent(eventName, endTime);
          plugin._addFinalSpanAttributes(span, xhrMem);
          span.end(endTime);
          plugin._tasksCount--;
        }
        plugin._clearResources();
      }
      function endSpan(eventName, xhr, isError, errorType) {
        const xhrMem = plugin._xhrMem.get(xhr);
        if (!xhrMem) {
          return;
        }
        xhrMem.status = xhr.status;
        xhrMem.statusText = xhr.statusText;
        plugin._xhrMem.delete(xhr);
        if (xhrMem.span) {
          const span = xhrMem.span;
          plugin._applyAttributesAfterXHR(span, xhr);
          if (isError) {
            if (errorType) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: errorType
              });
              span.setAttribute(ATTR_ERROR_TYPE, errorType);
            }
          } else if (xhrMem.status && xhrMem.status >= 400) {
            span.setStatus({ code: SpanStatusCode.ERROR });
            span.setAttribute(ATTR_ERROR_TYPE, String(xhrMem.status));
          }
        }
        const performanceEndTime = hrTime();
        const endTime = Date.now();
        setTimeout(() => {
          endSpanTimeout(eventName, xhrMem, performanceEndTime, endTime);
        }, OBSERVER_WAIT_TIME_MS2);
      }
      function onError() {
        endSpan(EventNames2.EVENT_ERROR, this, true, "error");
      }
      function onAbort() {
        endSpan(EventNames2.EVENT_ABORT, this, false);
      }
      function onTimeout() {
        endSpan(EventNames2.EVENT_TIMEOUT, this, true, "timeout");
      }
      function onLoad() {
        if (this.status < 299) {
          endSpan(EventNames2.EVENT_LOAD, this, false);
        } else {
          endSpan(EventNames2.EVENT_ERROR, this, false);
        }
      }
      function unregister(xhr) {
        xhr.removeEventListener("abort", onAbort);
        xhr.removeEventListener("error", onError);
        xhr.removeEventListener("load", onLoad);
        xhr.removeEventListener("timeout", onTimeout);
        const xhrMem = plugin._xhrMem.get(xhr);
        if (xhrMem) {
          xhrMem.callbackToRemoveEvents = void 0;
        }
      }
      return (original) => {
        return function patchSend(...args) {
          if (!plugin._isEnabled) {
            return original.apply(this, args);
          }
          const xhrMem = plugin._xhrMem.get(this);
          if (!xhrMem) {
            return original.apply(this, args);
          }
          const currentSpan = xhrMem.span;
          const spanUrl = xhrMem.spanUrl;
          if (currentSpan && spanUrl) {
            if (plugin.getConfig().measureRequestSize && args?.[0]) {
              const body = args[0];
              const bodyLength = getXHRBodyLength2(body);
              if (bodyLength !== void 0) {
                currentSpan.setAttribute(ATTR_HTTP_REQUEST_BODY_SIZE2, bodyLength);
              }
            }
            context.with(trace.setSpan(context.active(), currentSpan), () => {
              plugin._tasksCount++;
              xhrMem.sendStartTime = hrTime();
              currentSpan.addEvent(EventNames2.METHOD_SEND);
              this.addEventListener("abort", onAbort);
              this.addEventListener("error", onError);
              this.addEventListener("load", onLoad);
              this.addEventListener("timeout", onTimeout);
              xhrMem.callbackToRemoveEvents = () => {
                unregister(this);
                if (xhrMem.createdResources) {
                  xhrMem.createdResources.observer.disconnect();
                }
              };
              plugin._addHeaders(this, spanUrl);
              plugin._addResourceObserver(this, spanUrl);
            });
          }
          return original.apply(this, args);
        };
      };
    }
    /**
     * implements enable function
     */
    enable() {
      if (this._isEnabled) {
        return;
      }
      if (this._isXhrPatched) {
        this._diag.debug("reactivating existing patch on", this.moduleName, this.version);
        this._isEnabled = true;
        return;
      }
      try {
        this._diag.debug("applying patch to", this.moduleName, this.version);
        this._wrap(XMLHttpRequest.prototype, "open", this._patchOpen());
        this._wrap(XMLHttpRequest.prototype, "send", this._patchSend());
        this._isXhrPatched = true;
        this._isEnabled = true;
      } catch (err) {
        this._unwrap(XMLHttpRequest.prototype, "open");
        this._unwrap(XMLHttpRequest.prototype, "send");
        this._diag.warn("Failed to patch globalThis.XMLHttpRequest; instrumentation will not be enabled. Another script may have locked globalThis.XMLHttpRequest via Object.defineProperty.", err);
      }
    }
    /**
     * implements disable function
     */
    disable() {
      if (!this._isEnabled) {
        return;
      }
      this._isEnabled = false;
      this._tasksCount = 0;
      this._xhrMem = /* @__PURE__ */ new WeakMap();
      this._usedResources = /* @__PURE__ */ new WeakSet();
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/utils/validation.js
  function isLogAttributeValue(val) {
    return isLogAttributeValueInternal(val, /* @__PURE__ */ new WeakSet());
  }
  function isLogAttributeValueInternal(val, visited) {
    if (val == null) {
      return true;
    }
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      return true;
    }
    if (val instanceof Uint8Array) {
      return true;
    }
    if (typeof val === "object") {
      if (visited.has(val)) {
        return false;
      }
      visited.add(val);
      if (Array.isArray(val)) {
        for (const item of val) {
          if (!isLogAttributeValueInternal(item, visited)) {
            return false;
          }
        }
        return true;
      }
      const obj = val;
      if (obj.constructor !== Object && obj.constructor !== void 0) {
        return false;
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && !isLogAttributeValueInternal(obj[key], visited)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  var AddAttributeDecision;
  (function(AddAttributeDecision2) {
    AddAttributeDecision2[AddAttributeDecision2["DROP_INVALID"] = 0] = "DROP_INVALID";
    AddAttributeDecision2[AddAttributeDecision2["DROP_LIMIT_REACHED"] = 1] = "DROP_LIMIT_REACHED";
    AddAttributeDecision2[AddAttributeDecision2["ADD_NEW"] = 2] = "ADD_NEW";
    AddAttributeDecision2[AddAttributeDecision2["ADD_OVERWRITE_EXISTING"] = 3] = "ADD_OVERWRITE_EXISTING";
  })(AddAttributeDecision || (AddAttributeDecision = {}));
  function addAttribute(attributes, limits, currentAttributesCount, key, value) {
    if (key.length === 0) {
      diag2.warn(`Invalid attribute key: ${key}`);
      return AddAttributeDecision.DROP_INVALID;
    }
    if (!isLogAttributeValue(value)) {
      diag2.warn(`Invalid attribute value set for key: ${key}`);
      return AddAttributeDecision.DROP_INVALID;
    }
    const isNewKey = !Object.prototype.hasOwnProperty.call(attributes, key);
    if (isNewKey && currentAttributesCount >= limits.attributeCountLimit) {
      return AddAttributeDecision.DROP_LIMIT_REACHED;
    }
    attributes[key] = truncateToSize(value, limits.attributeValueLengthLimit);
    if (isNewKey) {
      return AddAttributeDecision.ADD_NEW;
    }
    return AddAttributeDecision.ADD_OVERWRITE_EXISTING;
  }
  function truncateToSize(value, limit) {
    if (limit <= 0) {
      diag2.warn(`Attribute value limit must be positive, got ${limit}`);
      return value;
    }
    if (value == null) {
      return value;
    }
    if (typeof value === "string") {
      if (value.length <= limit) {
        return value;
      }
      return value.substring(0, limit);
    }
    if (value instanceof Uint8Array) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((val) => truncateToSize(val, limit));
    }
    if (typeof value === "object") {
      const truncatedObj = {};
      for (const [k2, v2] of Object.entries(value)) {
        truncatedObj[k2] = truncateToSize(v2, limit);
      }
      return truncatedObj;
    }
    return value;
  }
  function normalizeScopeAttributes(limits, attributes) {
    if (attributes == null) {
      return {};
    }
    const normalizedAttributes = {};
    let currentAttributesCount = 0;
    let droppedAttributesCount = 0;
    for (const [key, value] of Object.entries(attributes)) {
      const decision = addAttribute(normalizedAttributes, limits, currentAttributesCount, key, value);
      if (decision === AddAttributeDecision.ADD_NEW) {
        currentAttributesCount += 1;
      } else if (decision === AddAttributeDecision.DROP_INVALID) {
        droppedAttributesCount += 1;
      } else if (decision === AddAttributeDecision.DROP_LIMIT_REACHED) {
        droppedAttributesCount += 1;
      } else {
      }
    }
    return {
      attributes: currentAttributesCount > 0 ? normalizedAttributes : void 0,
      droppedAttributesCount
    };
  }

  // node_modules/@opentelemetry/sdk-logs/build/esm/LogRecordImpl.js
  var LogRecordImpl = class {
    constructor(_sharedState, instrumentationScope, logRecord) {
      __publicField(this, "resource");
      __publicField(this, "instrumentationScope");
      __publicField(this, "attributes", {});
      __publicField(this, "_hrTime");
      __publicField(this, "_hrTimeObserved");
      __publicField(this, "_spanContext");
      __publicField(this, "_severityText");
      __publicField(this, "_severityNumber");
      __publicField(this, "_body");
      __publicField(this, "_eventName");
      __publicField(this, "_attributesCount", 0);
      __publicField(this, "_droppedAttributesCount", 0);
      __publicField(this, "_isReadonly", false);
      __publicField(this, "_logRecordLimits");
      const { timestamp, observedTimestamp, eventName, severityNumber, severityText, body, attributes = {}, exception, context: context2 } = logRecord;
      const now = Date.now();
      this._hrTime = timeInputToHrTime(timestamp ?? now);
      this._hrTimeObserved = timeInputToHrTime(observedTimestamp ?? now);
      if (context2) {
        const spanContext = trace.getSpanContext(context2);
        if (spanContext && isSpanContextValid(spanContext)) {
          this._spanContext = spanContext;
        }
      }
      this.severityNumber = severityNumber;
      this.severityText = severityText;
      this.body = body;
      this.resource = _sharedState.resource;
      this.instrumentationScope = instrumentationScope;
      this._logRecordLimits = _sharedState.logRecordLimits;
      this._eventName = eventName;
      this.setAttributes(attributes);
      if (exception != null) {
        this._setException(exception);
      }
    }
    get hrTime() {
      return this._hrTime;
    }
    set hrTime(hrTime2) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._hrTime = hrTime2;
    }
    get hrTimeObserved() {
      return this._hrTimeObserved;
    }
    set hrTimeObserved(hrTimeObserved) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._hrTimeObserved = hrTimeObserved;
    }
    get spanContext() {
      return this._spanContext;
    }
    set spanContext(spanContext) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._spanContext = spanContext;
    }
    set severityText(severityText) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._severityText = severityText;
    }
    get severityText() {
      return this._severityText;
    }
    set severityNumber(severityNumber) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._severityNumber = severityNumber;
    }
    get severityNumber() {
      return this._severityNumber;
    }
    set body(body) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._body = body;
    }
    get body() {
      return this._body;
    }
    get eventName() {
      return this._eventName;
    }
    set eventName(eventName) {
      if (this._isLogRecordReadonly()) {
        return;
      }
      this._eventName = eventName;
    }
    get droppedAttributesCount() {
      return this._droppedAttributesCount;
    }
    setAttribute(key, value) {
      if (this._isLogRecordReadonly()) {
        return this;
      }
      const decision = addAttribute(this.attributes, this._logRecordLimits, this._attributesCount, key, value);
      if (decision === AddAttributeDecision.DROP_LIMIT_REACHED) {
        this._droppedAttributesCount++;
        if (this._droppedAttributesCount === 1) {
          diag2.warn("Dropping extra attributes.");
        }
      } else if (decision === AddAttributeDecision.ADD_NEW) {
        this._attributesCount++;
      }
      return this;
    }
    setAttributes(attributes) {
      for (const [k2, v2] of Object.entries(attributes)) {
        this.setAttribute(k2, v2);
      }
      return this;
    }
    setBody(body) {
      this.body = body;
      return this;
    }
    setEventName(eventName) {
      this.eventName = eventName;
      return this;
    }
    setSeverityNumber(severityNumber) {
      this.severityNumber = severityNumber;
      return this;
    }
    setSeverityText(severityText) {
      this.severityText = severityText;
      return this;
    }
    /**
     * @internal
     * A LogRecordProcessor may freely modify logRecord for the duration of the OnEmit call.
     * If logRecord is needed after OnEmit returns (i.e. for asynchronous processing) only reads are permitted.
     */
    _makeReadonly() {
      this._isReadonly = true;
    }
    _setException(exception) {
      let hasMinimumAttributes = false;
      if (typeof exception === "string" || typeof exception === "number") {
        if (!Object.hasOwn(this.attributes, ATTR_EXCEPTION_MESSAGE)) {
          this.setAttribute(ATTR_EXCEPTION_MESSAGE, String(exception));
        }
        hasMinimumAttributes = true;
      } else if (exception && typeof exception === "object") {
        const exceptionObj = exception;
        if (exceptionObj.code) {
          if (!Object.hasOwn(this.attributes, ATTR_EXCEPTION_TYPE)) {
            this.setAttribute(ATTR_EXCEPTION_TYPE, exceptionObj.code.toString());
          }
          hasMinimumAttributes = true;
        } else if (exceptionObj.name) {
          if (!Object.hasOwn(this.attributes, ATTR_EXCEPTION_TYPE)) {
            this.setAttribute(ATTR_EXCEPTION_TYPE, exceptionObj.name);
          }
          hasMinimumAttributes = true;
        }
        if (exceptionObj.message) {
          if (!Object.hasOwn(this.attributes, ATTR_EXCEPTION_MESSAGE)) {
            this.setAttribute(ATTR_EXCEPTION_MESSAGE, exceptionObj.message);
          }
          hasMinimumAttributes = true;
        }
        if (exceptionObj.stack) {
          if (!Object.hasOwn(this.attributes, ATTR_EXCEPTION_STACKTRACE)) {
            this.setAttribute(ATTR_EXCEPTION_STACKTRACE, exceptionObj.stack);
          }
          hasMinimumAttributes = true;
        }
      }
      if (!hasMinimumAttributes) {
        diag2.warn(`Failed to record an exception ${exception}`);
      }
    }
    _isLogRecordReadonly() {
      if (this._isReadonly) {
        diag2.warn("Can not execute the operation on emitted log record");
      }
      return this._isReadonly;
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/Logger.js
  var Logger = class {
    constructor(instrumentationScope, sharedState) {
      __publicField(this, "_instrumentationScope");
      __publicField(this, "_sharedState");
      __publicField(this, "_loggerConfig");
      this._instrumentationScope = instrumentationScope;
      this._sharedState = sharedState;
      this._loggerConfig = this._sharedState.getLoggerConfig(this._instrumentationScope);
    }
    emit(logRecord) {
      const currentContext = logRecord.context || context.active();
      if (!this.enabled(logRecord)) {
        return;
      }
      const logRecordInstance = new LogRecordImpl(this._sharedState, this._instrumentationScope, {
        context: currentContext,
        ...logRecord
      });
      this._sharedState.loggerMetrics.emitLog();
      this._sharedState.activeProcessor.onEmit(logRecordInstance, currentContext);
      logRecordInstance._makeReadonly();
    }
    enabled(options) {
      if (this._sharedState.hasShutdown) {
        return false;
      }
      const loggerConfig = this._loggerConfig;
      if (loggerConfig.disabled) {
        return false;
      }
      const severityNumber = options?.severityNumber;
      if (typeof severityNumber === "number" && severityNumber !== SeverityNumber.UNSPECIFIED && severityNumber < loggerConfig.minimumSeverity) {
        return false;
      }
      const currentContext = options?.context || context.active();
      if (loggerConfig.traceBased) {
        const spanContext = trace.getSpanContext(currentContext);
        if (spanContext && isSpanContextValid(spanContext)) {
          const isSampled = (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;
          if (!isSampled) {
            return false;
          }
        }
      }
      const enabledOpts = {
        context: currentContext,
        instrumentationScope: this._instrumentationScope,
        severityNumber: options?.severityNumber,
        eventName: options?.eventName
      };
      for (const processor of this._sharedState.processors) {
        if (!processor.enabled || processor.enabled(enabledOpts)) {
          return true;
        }
      }
      return false;
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/export/NoopLogRecordProcessor.js
  var NoopLogRecordProcessor = class {
    forceFlush() {
      return Promise.resolve();
    }
    onEmit(_logRecord, _context) {
    }
    shutdown() {
      return Promise.resolve();
    }
    enabled(_options) {
      return false;
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/MultiLogRecordProcessor.js
  var MultiLogRecordProcessor = class {
    constructor(processors) {
      __publicField(this, "processors");
      this.processors = processors;
    }
    async forceFlush(options) {
      const timeout = options?.timeoutMillis ?? 3e4;
      await Promise.all(this.processors.map((processor) => callWithTimeout(processor.forceFlush(), timeout)));
    }
    onEmit(logRecord, context2) {
      this.processors.forEach((processors) => processors.onEmit(logRecord, context2));
    }
    async shutdown() {
      await Promise.all(this.processors.map((processor) => processor.shutdown()));
    }
    enabled(options) {
      for (const processor of this.processors) {
        if (!processor.enabled || processor.enabled(options)) {
          return true;
        }
      }
      return false;
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/internal/utils.js
  function normalizeAnyValue(value) {
    if (value === void 0) {
      return ["u", null];
    }
    if (value === null) {
      return ["n", null];
    }
    const valueType = typeof value;
    if (valueType === "string") {
      return ["s", value];
    }
    if (valueType === "boolean") {
      return ["b", value];
    }
    if (valueType === "number") {
      if (Number.isNaN(value))
        return ["nan", null];
      if (value === Infinity)
        return ["inf", null];
      if (value === -Infinity)
        return ["-inf", null];
      if (Object.is(value, -0))
        return ["n0", null];
      return ["d", value];
    }
    if (value instanceof Uint8Array) {
      return ["bytes", Array.from(value)];
    }
    if (Array.isArray(value)) {
      return ["arr", value.map(normalizeAnyValue)];
    }
    return [
      "map",
      Object.entries(value).sort(([a2], [b2]) => a2.localeCompare(b2)).map(([k2, v2]) => [k2, normalizeAnyValue(v2)])
    ];
  }
  function getInstrumentationScopeKey(scope) {
    return JSON.stringify([
      scope.name,
      scope.version || "",
      scope.schemaUrl || "",
      normalizeAnyValue(scope.attributes),
      // we include the dropped attributes count to avoid collisions between scopes with the same identifying
      // characteristics, but different dropped counts. While there still can be collisions this is the best we can do if
      // we want to resolve the same logger without relying on object identity.
      scope.droppedAttributesCount ?? 0
    ]);
  }

  // node_modules/@opentelemetry/sdk-logs/build/esm/semconv.js
  var METRIC_OTEL_SDK_LOG_CREATED = "otel.sdk.log.created";
  var METRIC_OTEL_SDK_PROCESSOR_LOG_PROCESSED = "otel.sdk.processor.log.processed";
  var METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_CAPACITY = "otel.sdk.processor.log.queue.capacity";
  var METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_SIZE = "otel.sdk.processor.log.queue.size";
  var ATTR_OTEL_COMPONENT_NAME3 = "otel.component.name";
  var ATTR_OTEL_COMPONENT_TYPE3 = "otel.component.type";
  var OTEL_COMPONENT_TYPE_VALUE_BATCHING_LOG_PROCESSOR = "batching_log_processor";
  var ATTR_ERROR_TYPE3 = "error.type";

  // node_modules/@opentelemetry/sdk-logs/build/esm/LoggerMetrics.js
  var LoggerMetrics = class {
    constructor(meter) {
      __publicField(this, "createdLogs");
      this.createdLogs = meter.createCounter(METRIC_OTEL_SDK_LOG_CREATED, {
        unit: "{log_record}",
        description: "The number of logs submitted to enabled SDK Loggers."
      });
    }
    emitLog() {
      this.createdLogs.add(1);
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/version.js
  var VERSION8 = "0.222.0";

  // node_modules/@opentelemetry/sdk-logs/build/esm/internal/LoggerProviderSharedState.js
  var DEFAULT_LOGGER_CONFIG = {
    disabled: false,
    minimumSeverity: SeverityNumber.UNSPECIFIED,
    traceBased: false
  };
  var DEFAULT_LOGGER_CONFIGURATOR = () => ({
    ...DEFAULT_LOGGER_CONFIG
  });
  var LoggerProviderSharedState = class {
    constructor(resource, logRecordLimits, processors, loggerConfigurator, meterProvider) {
      __publicField(this, "loggers", /* @__PURE__ */ new Map());
      __publicField(this, "activeProcessor");
      __publicField(this, "registeredLogRecordProcessors", []);
      __publicField(this, "resource");
      __publicField(this, "logRecordLimits");
      __publicField(this, "processors");
      __publicField(this, "loggerMetrics");
      __publicField(this, "hasShutdown", false);
      __publicField(this, "_loggerConfigurator");
      __publicField(this, "_loggerConfigs", /* @__PURE__ */ new Map());
      this.resource = resource;
      this.logRecordLimits = logRecordLimits;
      this.processors = processors;
      if (processors.length > 0) {
        this.registeredLogRecordProcessors = processors;
        this.activeProcessor = new MultiLogRecordProcessor(this.registeredLogRecordProcessors);
      } else {
        this.activeProcessor = new NoopLogRecordProcessor();
      }
      this._loggerConfigurator = loggerConfigurator ?? DEFAULT_LOGGER_CONFIGURATOR;
      const meter = meterProvider ? meterProvider.getMeter("@opentelemetry/sdk-logs", VERSION8) : createNoopMeter();
      this.loggerMetrics = new LoggerMetrics(meter);
    }
    /**
     * Get the LoggerConfig for a given instrumentation scope.
     * Uses the LoggerConfigurator function to compute the config on first access
     * and caches the result.
     *
     * @experimental This feature is in development as per the OpenTelemetry specification.
     */
    getLoggerConfig(instrumentationScope) {
      const key = getInstrumentationScopeKey(instrumentationScope);
      let config = this._loggerConfigs.get(key);
      if (config) {
        return config;
      }
      config = this._loggerConfigurator(instrumentationScope);
      this._loggerConfigs.set(key, config);
      return config;
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/LoggerProvider.js
  var DEFAULT_LOGGER_NAME = "unknown";
  var LoggerProvider = class {
    constructor(config = {}) {
      __publicField(this, "_shutdownOnce");
      __publicField(this, "_sharedState");
      const mergedConfig = {
        resource: config.resource ?? defaultResource(),
        logRecordLimits: {
          attributeCountLimit: config.logRecordLimits?.attributeCountLimit ?? 128,
          attributeValueLengthLimit: config.logRecordLimits?.attributeValueLengthLimit ?? Infinity
        },
        loggerConfigurator: config.loggerConfigurator ?? DEFAULT_LOGGER_CONFIGURATOR,
        processors: config.processors ?? [],
        meterProvider: config.meterProvider
      };
      this._sharedState = new LoggerProviderSharedState(mergedConfig.resource, mergedConfig.logRecordLimits, mergedConfig.processors, mergedConfig.loggerConfigurator, mergedConfig.meterProvider);
      this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
    }
    /**
     * Get a logger with the configuration of the LoggerProvider.
     */
    getLogger(name, version, options) {
      if (this._shutdownOnce.isCalled) {
        diag2.warn("A shutdown LoggerProvider cannot provide a Logger");
        return createNoopLogger();
      }
      if (!name) {
        diag2.warn("Logger requested without instrumentation scope name.");
      }
      const loggerName = name || DEFAULT_LOGGER_NAME;
      const instrumentationScope = {
        name: loggerName,
        version,
        schemaUrl: options?.schemaUrl,
        ...normalizeScopeAttributes(this._sharedState.logRecordLimits, options?.attributes)
      };
      const key = getInstrumentationScopeKey(instrumentationScope);
      if (!this._sharedState.loggers.has(key)) {
        this._sharedState.loggers.set(key, new Logger(instrumentationScope, this._sharedState));
      }
      return this._sharedState.loggers.get(key);
    }
    /**
     * Notifies all registered LogRecordProcessor to flush any buffered data.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    forceFlush(options) {
      if (this._shutdownOnce.isCalled) {
        diag2.warn("invalid attempt to force flush after LoggerProvider shutdown");
        return this._shutdownOnce.promise;
      }
      return this._sharedState.activeProcessor.forceFlush(options);
    }
    /**
     * Flush all buffered data and shut down the LoggerProvider and all registered
     * LogRecordProcessor.
     *
     * Returns a promise which is resolved when all flushes are complete.
     */
    shutdown() {
      if (this._shutdownOnce.isCalled) {
        diag2.warn("shutdown may only be called once per LoggerProvider");
        return this._shutdownOnce.promise;
      }
      return this._shutdownOnce.call();
    }
    _shutdown() {
      this._sharedState.hasShutdown = true;
      return this._sharedState.activeProcessor.shutdown();
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/export/LogRecordProcessorMetrics.js
  var componentCounter3 = /* @__PURE__ */ new Map();
  var LogRecordProcessorMetrics = class {
    constructor(componentType, meter, queueConfig) {
      __publicField(this, "processedLogs");
      __publicField(this, "queueSize");
      __publicField(this, "queueSizeCallback");
      __publicField(this, "standardAttrs");
      __publicField(this, "droppedAttrs");
      const counter = componentCounter3.get(componentType) ?? 0;
      componentCounter3.set(componentType, counter + 1);
      this.standardAttrs = {
        [ATTR_OTEL_COMPONENT_TYPE3]: componentType,
        [ATTR_OTEL_COMPONENT_NAME3]: `${componentType}/${counter}`
      };
      this.droppedAttrs = {
        ...this.standardAttrs,
        [ATTR_ERROR_TYPE3]: "queue_full"
      };
      this.processedLogs = meter.createCounter(METRIC_OTEL_SDK_PROCESSOR_LOG_PROCESSED, {
        unit: "{log_record}",
        description: "The number of log records for which the processing has finished, either successful or failed."
      });
      if (queueConfig) {
        const { capacity, getQueueSize } = queueConfig;
        const queueCapacity = meter.createUpDownCounter(METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_CAPACITY, {
          unit: "{log_record}",
          description: "The maximum number of log records the queue of a given instance of an SDK log processor can hold."
        });
        queueCapacity.add(capacity, this.standardAttrs);
        this.queueSize = meter.createObservableUpDownCounter(METRIC_OTEL_SDK_PROCESSOR_LOG_QUEUE_SIZE, {
          unit: "{log_record}",
          description: "The number of log records in the queue of a given instance of an SDK log processor."
        });
        this.queueSizeCallback = (result) => result.observe(getQueueSize(), this.standardAttrs);
        this.queueSize.addCallback(this.queueSizeCallback);
      }
    }
    dropLogs(count) {
      this.processedLogs.add(count, this.droppedAttrs);
    }
    finishLogs(count, error) {
      if (!error) {
        this.processedLogs.add(count, this.standardAttrs);
        return;
      }
      const attrs = {
        ...this.standardAttrs,
        [ATTR_ERROR_TYPE3]: error.name
      };
      this.processedLogs.add(count, attrs);
    }
    shutdown() {
      if (this.queueSize && this.queueSizeCallback) {
        this.queueSize.removeCallback(this.queueSizeCallback);
      }
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/export/BatchLogRecordProcessorBase.js
  async function waitForResources(logRecords) {
    const pendingResources = [];
    for (let i2 = 0, len = logRecords.length; i2 < len; i2++) {
      const logRecord = logRecords[i2];
      if (logRecord.resource.asyncAttributesPending && logRecord.resource.waitForAsyncAttributes) {
        pendingResources.push(logRecord.resource.waitForAsyncAttributes());
      }
    }
    if (pendingResources != null && pendingResources.length > 0) {
      await Promise.all(pendingResources);
    }
  }
  var ExportOperation = class {
    constructor(exporter, logRecords, exportTimeoutMillis, metrics2) {
      __publicField(this, "_exportCompleted");
      __publicField(this, "_exportScheduledPromise");
      __publicField(this, "_metrics");
      __publicField(this, "_exportScheduledResolve");
      this._exportScheduledPromise = new Promise((resolve) => {
        this._exportScheduledResolve = resolve;
      });
      this._exportCompleted = this._executeExport(exporter, logRecords, exportTimeoutMillis);
      this._metrics = metrics2;
    }
    /** Get the promise that resolves when the export completes */
    get exportCompleted() {
      return this._exportCompleted;
    }
    /** Get the promise that resolves when exporter.export() has been called */
    get exportScheduled() {
      return this._exportScheduledPromise;
    }
    async _executeExport(exporter, logRecords, exportTimeoutMillis) {
      try {
        await waitForResources(logRecords);
        await context.with(suppressTracing(context.active()), async () => {
          return this._exportWithTimeout(exporter, logRecords, exportTimeoutMillis);
        });
      } catch (e2) {
        globalErrorHandler(e2);
        this._exportScheduledResolve();
      }
    }
    async _exportWithTimeout(exporter, logRecords, exportTimeoutMillis) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Timeout"));
        }, exportTimeoutMillis);
        exporter.export(logRecords, (result) => {
          this._metrics.finishLogs(logRecords.length, result.error);
          clearTimeout(timer);
          if (result.code === ExportResultCode.SUCCESS) {
            resolve();
          } else {
            reject(result.error ?? new Error("BatchLogRecordProcessor: log record export failed"));
          }
        });
        this._exportScheduledResolve();
      });
    }
  };
  var BatchLogRecordProcessorBase = class {
    constructor(options) {
      __publicField(this, "_maxExportBatchSize");
      __publicField(this, "_maxQueueSize");
      __publicField(this, "_scheduledDelayMillis");
      __publicField(this, "_exportTimeoutMillis");
      __publicField(this, "_exporter");
      __publicField(this, "_metrics");
      __publicField(this, "_currentExport", null);
      __publicField(this, "_finishedLogRecords", []);
      __publicField(this, "_timer");
      __publicField(this, "_shutdownOnce");
      __publicField(this, "_flushing", false);
      this._exporter = options.exporter;
      this._maxExportBatchSize = options.maxExportBatchSize ?? 512;
      this._maxQueueSize = options.maxQueueSize ?? 2048;
      this._scheduledDelayMillis = options.scheduledDelayMillis ?? 1e3;
      this._exportTimeoutMillis = options.exportTimeoutMillis ?? 3e4;
      this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
      if (this._maxExportBatchSize > this._maxQueueSize) {
        diag2.warn("BatchLogRecordProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize");
        this._maxExportBatchSize = this._maxQueueSize;
      }
      const meter = options?.selfObsMeterProvider ? options.selfObsMeterProvider.getMeter("@opentelemetry/sdk-logs") : createNoopMeter();
      this._metrics = new LogRecordProcessorMetrics(OTEL_COMPONENT_TYPE_VALUE_BATCHING_LOG_PROCESSOR, meter, {
        capacity: this._maxQueueSize,
        getQueueSize: () => this._finishedLogRecords.length
      });
    }
    onEmit(logRecord) {
      if (this._shutdownOnce.isCalled) {
        return;
      }
      this._addToBuffer(logRecord);
    }
    forceFlush() {
      if (this._shutdownOnce.isCalled) {
        return this._shutdownOnce.promise;
      }
      return this._flushAll();
    }
    /** Add a LogRecord in the buffer. */
    _addToBuffer(logRecord) {
      if (this._finishedLogRecords.length >= this._maxQueueSize) {
        this._metrics.dropLogs(1);
        return;
      }
      this._finishedLogRecords.push(logRecord);
      this._maybeStartTimer();
    }
    shutdown() {
      return this._shutdownOnce.call();
    }
    async _shutdown() {
      this.onShutdown();
      await this._flushAll();
      this._metrics.shutdown();
      await this._exporter.shutdown();
    }
    /**
     * Send all LogRecords to the exporter respecting the batch size limit
     * This function is used only on forceFlush or shutdown,
     * for all other cases _exportOneBatch should be used
     * */
    async _flushAll() {
      if (this._flushing) {
        return;
      }
      this._flushing = true;
      let toFlush = this._finishedLogRecords;
      this._finishedLogRecords = [];
      this._clearTimer();
      const inFlight = this._currentExport;
      if (inFlight !== null) {
        await this._exporter.forceFlush();
        await inFlight.exportCompleted;
        this._currentExport = null;
      }
      while (toFlush.length > 0) {
        let batch;
        if (toFlush.length <= this._maxExportBatchSize) {
          batch = toFlush;
          toFlush = [];
        } else {
          batch = toFlush.splice(0, this._maxExportBatchSize);
        }
        const exportOp = new ExportOperation(this._exporter, batch, this._exportTimeoutMillis, this._metrics);
        this._currentExport = exportOp;
        try {
          await exportOp.exportScheduled;
          await this._exporter.forceFlush();
          await exportOp.exportCompleted;
        } catch (e2) {
          globalErrorHandler(e2);
        } finally {
          this._currentExport = null;
        }
      }
      this._flushing = false;
      this._maybeStartTimer();
    }
    /**
     * Extracts one batch from the buffer.
     * Returns null if buffer is empty.
     */
    _extractBatch() {
      if (this._finishedLogRecords.length === 0) {
        return null;
      }
      if (this._finishedLogRecords.length <= this._maxExportBatchSize) {
        const batch = this._finishedLogRecords;
        this._finishedLogRecords = [];
        return batch;
      } else {
        return this._finishedLogRecords.splice(0, this._maxExportBatchSize);
      }
    }
    _exportOneBatch() {
      this._clearTimer();
      const logRecords = this._extractBatch();
      if (logRecords === null) {
        return;
      }
      const exportOp = new ExportOperation(this._exporter, logRecords, this._exportTimeoutMillis, this._metrics);
      this._currentExport = exportOp;
      exportOp.exportCompleted.then(() => {
        this._currentExport = null;
        this._maybeStartTimer();
      }).catch((error) => {
        this._currentExport = null;
        globalErrorHandler(error);
        this._maybeStartTimer();
      });
    }
    _maybeStartTimer() {
      if (this._shutdownOnce.isCalled) {
        return;
      }
      if (this._flushing) {
        return;
      }
      if (this._finishedLogRecords.length === 0) {
        return;
      }
      if (this._currentExport !== null) {
        return;
      }
      if (this._finishedLogRecords.length >= this._maxExportBatchSize) {
        this._exportOneBatch();
        return;
      }
      if (this._timer !== void 0) {
        return;
      }
      this._timer = setTimeout(() => {
        this._timer = void 0;
        this._exportOneBatch();
      }, this._scheduledDelayMillis);
      if (typeof this._timer !== "number") {
        this._timer.unref();
      }
    }
    _clearTimer() {
      if (this._timer !== void 0) {
        clearTimeout(this._timer);
        this._timer = void 0;
      }
    }
  };

  // node_modules/@opentelemetry/sdk-logs/build/esm/platform/browser/export/BatchLogRecordProcessor.js
  var BatchLogRecordProcessor = class extends BatchLogRecordProcessorBase {
    constructor(options) {
      super(options);
      __publicField(this, "_visibilityChangeListener");
      __publicField(this, "_pageHideListener");
      this._onInit(options);
    }
    onShutdown() {
      if (typeof document === "undefined") {
        return;
      }
      if (this._visibilityChangeListener) {
        document.removeEventListener("visibilitychange", this._visibilityChangeListener);
      }
      if (this._pageHideListener) {
        document.removeEventListener("pagehide", this._pageHideListener);
      }
    }
    _onInit(options) {
      if (options.disableAutoFlushOnDocumentHide === true || typeof document === "undefined") {
        return;
      }
      this._visibilityChangeListener = () => {
        if (document.visibilityState === "hidden") {
          void this.forceFlush();
        }
      };
      this._pageHideListener = () => {
        void this.forceFlush();
      };
      document.addEventListener("visibilitychange", this._visibilityChangeListener);
      document.addEventListener("pagehide", this._pageHideListener);
    }
  };

  // node_modules/web-vitals/dist/web-vitals.js
  var t = -1;
  var n = () => t;
  var e = (n2) => {
    addEventListener("pageshow", (e2) => {
      e2.persisted && (t = e2.timeStamp, n2(e2));
    }, true);
  };
  var i = (t2, n2, e2, i2) => {
    let o2, s2;
    return (a2) => {
      n2.value >= 0 && (a2 || i2) && (s2 = n2.value - (o2 ?? 0), (s2 || void 0 === o2) && (o2 = n2.value, n2.delta = s2, n2.rating = ((t3, n3) => t3 > n3[1] ? "poor" : t3 > n3[0] ? "needs-improvement" : "good")(n2.value, e2), t2(n2)));
    };
  };
  var o = (t2) => {
    requestAnimationFrame(() => requestAnimationFrame(() => t2()));
  };
  var s = () => {
    const t2 = performance.getEntriesByType("navigation")[0];
    if (t2 && t2.responseStart > 0 && t2.responseStart < performance.now()) return t2;
  };
  var a = () => s()?.activationStart ?? 0;
  var r = -1;
  var c = /* @__PURE__ */ new Set();
  var f = () => "hidden" !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
  var h = (t2) => {
    if ("hidden" === document.visibilityState) {
      if ("visibilitychange" === t2.type) for (const t3 of c) t3();
      isFinite(r) || (r = "visibilitychange" === t2.type ? t2.timeStamp : 0, removeEventListener("prerenderingchange", h, true));
    }
  };
  var d = (t2 = false) => {
    if (t2 && (r = 1 / 0), r < 0) {
      const t3 = a(), n2 = document.prerendering ? void 0 : globalThis.performance.getEntriesByType("visibility-state").find((n3) => "hidden" === n3.name && n3.startTime >= t3)?.startTime;
      r = n2 ?? f(), addEventListener("visibilitychange", h, true), addEventListener("prerenderingchange", h, true), e(() => {
        setTimeout(() => {
          r = f();
        });
      });
    }
    return { get firstHiddenTime() {
      return r;
    }, onHidden(t3) {
      c.add(t3);
    } };
  };
  var l = (t2, e2 = -1, i2, o2 = 0, r2, c2, f2) => {
    const h2 = s(), d2 = h2?.navigationId || 0;
    let l2 = "navigate";
    i2 ? l2 = i2 : n() >= 0 ? l2 = "back-forward-cache" : h2 && (document.prerendering || a() > 0 ? l2 = "prerender" : document.wasDiscarded ? l2 = "restore" : h2.type && (l2 = h2.type.replace(/_/g, "-")));
    return { name: t2, value: e2, rating: "good", delta: 0, entries: [], id: `v6-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`, navigationType: l2, navigationId: o2 || d2, navigationInteractionId: r2, navigationURL: c2 || h2?.name, navigationStartTime: f2 || 0 };
  };
  var g = /* @__PURE__ */ new WeakMap();
  function u(t2, n2) {
    let e2 = g.get(n2);
    return e2 || (e2 = /* @__PURE__ */ new WeakMap(), g.set(n2, e2)), e2.get(t2) || e2.set(t2, new n2()), e2.get(t2);
  }
  var v = class {
    constructor() {
      __publicField(this, "t");
      __publicField(this, "i", 0);
      __publicField(this, "o", []);
    }
    h(t2) {
      if (t2.hadRecentInput) return;
      const n2 = this.o[0], e2 = this.o.at(-1);
      this.i && n2 && e2 && t2.startTime - e2.startTime < 1e3 && t2.startTime - n2.startTime < 5e3 ? (this.i += t2.value, this.o.push(t2)) : (this.i = t2.value, this.o = [t2]), this.t?.(t2);
    }
  };
  var m = (t2, n2, e2 = {}) => {
    try {
      const i2 = t2.filter((t3) => PerformanceObserver.supportedEntryTypes.includes(t3));
      if (i2.length > 0) {
        const t3 = new PerformanceObserver((t4) => {
          queueMicrotask(() => {
            const e3 = t4.getEntries();
            i2.length > 1 && e3.sort((t5, n3) => t5.startTime + t5.duration - (n3.startTime + n3.duration)), n2(e3);
          });
        });
        for (const n3 of i2) t3.observe({ type: n3, buffered: true, ...e2 });
        return t3;
      }
    } catch {
    }
  };
  var p = (t2) => globalThis.PerformanceObserver?.supportedEntryTypes?.includes("soft-navigation") && "function" == typeof globalThis.PerformanceSoftNavigation?.prototype?.getLargestInteractionContentfulPaint && t2 && t2.reportSoftNavs;
  var b = (t2, n2) => {
    if (t2.set(n2.navigationId, n2), t2.size > 2) {
      const n3 = t2.keys().next().value;
      void 0 !== n3 && t2.delete(n3);
    }
  };
  var T = (t2) => {
    let n2 = false;
    return () => {
      n2 || (t2(), n2 = true);
    };
  };
  var y = class {
    constructor() {
      __publicField(this, "l");
    }
  };
  var _ = (t2) => {
    document.prerendering ? addEventListener("prerenderingchange", t2, true) : t2();
  };
  var E = [1800, 3e3];
  var M = (t2, s2 = {}) => {
    const r2 = p(s2);
    _(() => {
      const c2 = u(s2, y), f2 = d();
      let h2, g2 = l("FCP");
      const v2 = m(["paint"], (t3) => {
        for (const n2 of t3) "first-contentful-paint" === n2.name && (v2.disconnect(), n2.startTime < f2.firstHiddenTime && (g2.value = Math.max(n2.startTime - a(), 0), g2.entries.push(n2), g2.navigationId = n2.navigationId || g2.navigationId, h2(true)));
      });
      if (v2 && (h2 = i(t2, g2, E, s2.reportAllChanges), e((e2) => {
        g2 = l("FCP", -1, "back-forward-cache", g2.navigationId, g2.navigationInteractionId, g2.navigationURL, n()), h2 = i(t2, g2, E, s2.reportAllChanges), o(() => {
          g2.value = performance.now() - e2.timeStamp, h2(true);
        });
      })), r2) {
        m(["soft-navigation"], (n2) => {
          n2.forEach((n3) => {
            c2.l && n3.navigationId && b(c2.l, n3);
            const e2 = Math.max((n3.presentationTime || n3.paintTime || 0) - n3.startTime, 0);
            g2 = l("FCP", e2, "soft-navigation", n3.navigationId, n3.interactionId, n3.name, n3.startTime), h2 = i(t2, g2, E, s2.reportAllChanges), h2(true);
          });
        }, s2);
      }
    });
  };
  var L = [0.1, 0.25];
  var P = (t2, s2 = {}) => {
    const a2 = d();
    M(T(() => {
      let r2, c2 = l("CLS", 0);
      const f2 = u(s2, v), h2 = (n2, e2, o2, a3, h3) => {
        c2 = l("CLS", 0, n2, e2, o2, a3, h3), f2.i = 0, r2 = i(t2, c2, L, s2.reportAllChanges);
      }, d2 = (t3 = false) => {
        f2.i > c2.value && (c2.value = f2.i, c2.entries = f2.o), r2(t3);
      }, g2 = (t3) => {
        d2(true), h2("soft-navigation", t3.navigationId, t3.interactionId, t3.name, t3.startTime);
      }, b2 = (t3) => {
        for (const n2 of t3) "soft-navigation" !== n2.entryType ? f2.h(n2) : g2(n2);
        d2();
      }, T2 = ["layout-shift"];
      p(s2) && T2.push("soft-navigation");
      const y2 = m(T2, b2);
      y2 && (r2 = i(t2, c2, L, s2.reportAllChanges), a2.onHidden(() => {
        b2(y2.takeRecords()), r2(true);
      }), e(() => {
        h2("back-forward-cache", c2.navigationId, c2.navigationInteractionId, c2.navigationURL, n()), o(r2);
      }), setTimeout(r2));
    }));
  };
  var w = 0;
  var I = 1 / 0;
  var k = 0;
  var C = (t2) => {
    for (const n2 of t2) n2.interactionId && (I = Math.min(I, n2.interactionId), k = Math.max(k, n2.interactionId), w = k ? (k - I) / 7 + 1 : 0);
  };
  var F;
  var N = () => F ? w : performance.interactionCount ?? 0;
  var B = () => {
    "interactionCount" in performance || F || (F = m(["event"], C, { durationThreshold: 0 }));
  };
  var S = class {
    constructor() {
      __publicField(this, "u", 0);
      __publicField(this, "v", []);
      __publicField(this, "m", /* @__PURE__ */ new Map());
      __publicField(this, "p");
      __publicField(this, "T");
    }
    _() {
      return N() - this.u;
    }
    M() {
      this.u = N(), this.v.length = 0, this.m.clear();
    }
    L(t2) {
      const n2 = this._(), e2 = Math.min(this.v.length - 1, Math.floor(n2 / 50));
      return !n2 || -1 !== e2 || "soft-navigation" !== t2 && "back-forward-cache" !== t2 ? this.v[e2] : { P: 8, id: -1, entries: [] };
    }
    h(t2) {
      if (this.p?.(t2), !t2.interactionId) return;
      const n2 = this.v.at(-1);
      let e2 = this.m.get(t2.interactionId);
      if (e2 || this.v.length < 10 || t2.duration > n2.P) {
        if (e2 ? t2.duration > e2.P ? (e2.entries = [t2], e2.P = t2.duration) : t2.duration === e2.P && t2.startTime === e2.entries[0].startTime && e2.entries.push(t2) : (e2 = { id: t2.interactionId, entries: [t2], P: t2.duration }, this.m.set(e2.id, e2), this.v.push(e2)), this.v.sort((t3, n3) => n3.P - t3.P), this.v.length > 10) {
          const t3 = this.v.splice(10);
          for (const n3 of t3) this.m.delete(n3.id);
        }
        this.T?.(e2);
      }
    }
  };
  var q = (t2) => {
    const n2 = "requestIdleCallback" in globalThis ? 1e3 : 0, e2 = globalThis.requestIdleCallback || setTimeout, i2 = globalThis.cancelIdleCallback || clearTimeout;
    if ("hidden" === document.visibilityState) t2();
    else {
      const o2 = T(t2);
      let s2 = -1;
      const a2 = () => {
        i2(s2), o2();
      };
      addEventListener("visibilitychange", a2, { once: true, capture: true }), s2 = e2(() => {
        removeEventListener("visibilitychange", a2, { capture: true }), o2();
      }, { timeout: n2 });
    }
  };
  var A = [200, 500];
  var x = (t2, o2 = {}) => {
    if (!globalThis.PerformanceEventTiming || !("interactionId" in PerformanceEventTiming.prototype)) return;
    const s2 = d();
    _(() => {
      B();
      let a2, r2 = l("INP");
      const c2 = u(o2, S), f2 = (n2, e2, s3, f3, h3) => {
        c2.M(), r2 = l("INP", -1, n2, e2, s3, f3, h3), a2 = i(t2, r2, A, o2.reportAllChanges);
      }, h2 = () => {
        const t3 = c2.L(r2.navigationType);
        t3 && t3.P !== r2.value && (r2.value = t3.P, r2.entries = t3.entries, a2());
      }, d2 = (t3) => {
        h2(), a2(true), f2("soft-navigation", t3.navigationId, t3.interactionId, t3.name, t3.startTime);
      }, g2 = (t3, n2 = false) => {
        q(() => {
          for (const n3 of t3) "soft-navigation" !== n3.entryType ? c2.h(n3) : d2(n3);
          h2(), n2 && a2(true);
        });
      }, v2 = ["event", "first-input"];
      p(o2) && v2.push("soft-navigation");
      const b2 = m(v2, g2, { ...o2, durationThreshold: o2.durationThreshold ?? 40 });
      a2 = i(t2, r2, A, o2.reportAllChanges), b2 && (s2.onHidden(() => {
        g2(b2.takeRecords(), true);
      }), e(() => {
        f2("back-forward-cache", r2.navigationId, r2.navigationInteractionId, r2.navigationURL, n());
      }));
    });
  };
  var H = class {
    constructor() {
      __publicField(this, "p");
      __publicField(this, "l");
    }
    h(t2) {
      this.p?.(t2);
    }
  };
  var O = [2500, 4e3];
  var U = (t2, s2 = {}) => {
    let r2 = false;
    const c2 = p(s2);
    _(() => {
      let f2, h2 = d(), g2 = l("LCP");
      const v2 = u(s2, H), p2 = (n2, e2, o2, a2, c3) => {
        g2 = l("LCP", -1, n2, e2, o2, a2, c3), f2 = i(t2, g2, O, s2.reportAllChanges), r2 = false, "soft-navigation" === n2 && (h2 = d(true));
      }, T2 = (t3) => {
        v2.l && t3.navigationId && b(v2.l, t3), r2 || f2(true), p2("soft-navigation", t3.navigationId, t3.interactionId, t3.name, t3.startTime);
        const n2 = t3.getLargestInteractionContentfulPaint?.();
        n2 && y2([n2]);
      }, y2 = (t3) => {
        s2.reportAllChanges || c2 || (t3 = t3.slice(-1));
        for (const n2 of t3) {
          if (!n2) continue;
          if ("soft-navigation" === n2.entryType) {
            T2(n2);
            continue;
          }
          let t4 = 0, e2 = [], i2 = n2.startTime;
          if ("largest-contentful-paint" === n2.entryType) t4 = Math.max(n2.startTime - a(), 0), v2.h(n2), e2 = [n2];
          else if ("interaction-contentful-paint" === n2.entryType) {
            const o2 = n2;
            if (!g2.navigationId) continue;
            if ("interactionId" in o2 && o2.interactionId != g2.navigationInteractionId) continue;
            i2 = o2.largestContentfulPaint?.renderTime || 0, t4 = Math.max(i2 - n2.startTime, 0), o2.largestContentfulPaint && (v2.h(o2.largestContentfulPaint), e2 = [o2.largestContentfulPaint]);
          }
          i2 < h2.firstHiddenTime && (g2.value = t4, g2.entries = e2, f2());
        }
      }, _2 = ["largest-contentful-paint"];
      c2 && _2.push("interaction-contentful-paint", "soft-navigation");
      const E2 = m(_2, y2);
      if (E2) {
        f2 = i(t2, g2, O, s2.reportAllChanges);
        const a2 = ["keydown", "click", "visibilitychange"], h3 = (t3) => {
          if (t3.isTrusted && !r2) {
            const t4 = g2.id;
            q(() => {
              if (!r2) {
                if (!c2) {
                  E2.disconnect();
                  for (const t5 of a2) removeEventListener(t5, h3, { capture: true });
                }
                t4 === g2.id && (r2 = true, f2(true));
              }
            });
          }
        };
        for (const t3 of a2) addEventListener(t3, h3, { capture: true });
        e((e2) => {
          p2("back-forward-cache", g2.navigationId, g2.navigationInteractionId, g2.navigationURL, n()), f2 = i(t2, g2, O, s2.reportAllChanges), o(() => {
            g2.value = performance.now() - e2.timeStamp, r2 = true, f2(true);
          });
        });
      }
    });
  };
  var W = [800, 1800];
  var $ = (t2) => {
    document.prerendering ? _(() => $(t2)) : "complete" !== document.readyState ? addEventListener("load", () => $(t2), true) : setTimeout(t2);
  };
  var D = (t2, o2 = {}) => {
    const r2 = p(o2);
    let c2 = l("TTFB"), f2 = i(t2, c2, W, o2.reportAllChanges);
    $(() => {
      const h2 = s();
      if (h2) {
        const s2 = h2.responseStart;
        if (c2.value = Math.max(s2 - a(), 0), c2.entries = [h2], f2(true), e(() => {
          c2 = l("TTFB", 0, "back-forward-cache", c2.navigationId, c2.navigationInteractionId, c2.navigationURL, n()), f2 = i(t2, c2, W, o2.reportAllChanges), f2(true);
        }), r2) {
          m(["soft-navigation"], (n2) => {
            n2.forEach((n3) => {
              n3.navigationId && (c2 = l("TTFB", 0, "soft-navigation", n3.navigationId, n3.interactionId, n3.name, n3.startTime), c2.entries = [n3], f2 = i(t2, c2, W, o2.reportAllChanges), f2(true));
            });
          }, o2);
        }
      }
    });
  };

  // src/otel-web.ts
  var SDK_VERSION = "0.3.3";
  var DEFAULT_SERVICE_NAME = "web-app";
  var ROUTE_EVENT = "__databuff_otel_route_change__";
  var traceProvider;
  var loggerProvider;
  var resolvedConfig;
  var removeGlobalHooks;
  var unregisterInstrumentations;
  var navigationCorrelation;
  var interactionCorrelation;
  var xhrRequestMeta = /* @__PURE__ */ new WeakMap();
  function clampSampleRate(value) {
    if (value == null || Number.isNaN(value)) return 1;
    return Math.max(0, Math.min(1, value));
  }
  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function wildcardToRegExp(value) {
    const escaped = value.split("*").map(escapeRegExp).join(".*");
    return new RegExp(`^${escaped}`);
  }
  function normalizeEndpoint(value, signal) {
    const script = document.currentScript;
    const fallbackBase = script?.src ? new URL(script.src, location.href).origin : location.origin;
    const input = (value || fallbackBase).replace(/\/$/, "");
    if (/\/v1\/(?:traces|logs)$/.test(input)) return input.replace(/\/v1\/(?:traces|logs)$/, `/v1/${signal}`);
    return `${input}/v1/${signal}`;
  }
  function safeJsonObject(value) {
    if (!value) return {};
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return Object.fromEntries(Object.entries(parsed).map(([key, item]) => [key, String(item)]));
    } catch {
      console.warn("[DatabuffOtel] Ignoring invalid JSON in data-headers.");
      return {};
    }
  }
  function readBool(value, fallback) {
    if (value == null || value === "") return fallback;
    return !["false", "0", "off", "no"].includes(value.toLowerCase());
  }
  function normalizeLogLevel(value) {
    const level = value?.toUpperCase();
    return level === "DEBUG" || level === "INFO" || level === "WARN" || level === "ERROR" ? level : "ERROR";
  }
  function normalizeKeyList(values) {
    if (!values?.length) return [];
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
  }
  function readKeyList(value) {
    return normalizeKeyList(value?.split(","));
  }
  function currentScriptConfig() {
    const script = document.currentScript;
    const data = script?.dataset ?? {};
    const propagateTo = data.propagateTo?.split(",").map((item) => item.trim()).filter(Boolean).map(wildcardToRegExp);
    return {
      autoStart: readBool(data.autostart, true),
      config: {
        serviceName: data.service || DEFAULT_SERVICE_NAME,
        endpoint: data.endpoint,
        logsEndpoint: data.logsEndpoint,
        serviceVersion: data.version,
        environment: data.environment,
        sampleRate: data.sampleRate == null ? void 0 : Number(data.sampleRate),
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
        pageLoadWindowMillis: data.pageLoadWindow == null ? void 0 : Number(data.pageLoadWindow),
        interactionWindowMillis: data.interactionWindow == null ? void 0 : Number(data.interactionWindow),
        includeUrlQuery: readBool(data.includeUrlQuery, false),
        minLogLevel: normalizeLogLevel(data.minLogLevel),
        logCookieKeys: readKeyList(data.logCookieKeys),
        logLocalStorageKeys: readKeyList(data.logLocalStorageKeys),
        logSessionStorageKeys: readKeyList(data.logSessionStorageKeys),
        debug: readBool(data.debug, false)
      }
    };
  }
  function resolveConfig(config) {
    return {
      serviceName: config.serviceName || DEFAULT_SERVICE_NAME,
      endpoint: normalizeEndpoint(config.endpoint, "traces"),
      logsEndpoint: normalizeEndpoint(config.logsEndpoint ?? config.endpoint, "logs"),
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
      pageLoadWindowMillis: Math.max(0, config.pageLoadWindowMillis ?? 5e3),
      interactionWindowMillis: Math.max(0, config.interactionWindowMillis ?? 3e3),
      includeUrlQuery: config.includeUrlQuery ?? false,
      minLogLevel: normalizeLogLevel(config.minLogLevel),
      logCookieKeys: normalizeKeyList(config.logCookieKeys),
      logLocalStorageKeys: normalizeKeyList(config.logLocalStorageKeys),
      logSessionStorageKeys: normalizeKeyList(config.logSessionStorageKeys),
      debug: config.debug ?? false,
      attributes: config.attributes ?? {}
    };
  }
  function pageUrl(config) {
    const url = new URL(location.href);
    if (!config.includeUrlQuery) {
      url.search = "";
      url.hash = "";
    }
    return url.href;
  }
  function pageRoute(config) {
    const url = new URL(location.href);
    const path = url.pathname || "/";
    const query = config?.includeUrlQuery ? url.search : "";
    const hash = url.hash || "";
    return path + query + hash;
  }
  function withPageRoute(name, config) {
    const base = (name || "").trim();
    const route = pageRoute(config);
    if (!route || base === route || base.endsWith(" " + route)) return base;
    return base ? base + " " + route : route;
  }
  function finishCorrelation(kind) {
    const current = kind === "navigation" ? navigationCorrelation : interactionCorrelation;
    if (!current) return;
    window.clearTimeout(current.timer);
    current.span.end();
    if (kind === "navigation") navigationCorrelation = void 0;
    else interactionCorrelation = void 0;
  }
  function currentCorrelationSpan() {
    return interactionCorrelation?.span ?? navigationCorrelation?.span;
  }
  function startNavigationSpan(reason, previousUrl) {
    if (!resolvedConfig) return;
    finishCorrelation("navigation");
    const tracer = trace.getTracer("@databuff/otel-web", SDK_VERSION);
    const span = tracer.startSpan(withPageRoute(reason === "load" ? "page.load" : "page.view", resolvedConfig), {
      attributes: {
        "url.full": pageUrl(resolvedConfig),
        "page.title": document.title,
        "navigation.type": reason,
        ...previousUrl ? { "navigation.previous_url": previousUrl } : {}
      }
    });
    const timer = window.setTimeout(() => {
      if (navigationCorrelation?.span === span) finishCorrelation("navigation");
    }, resolvedConfig.pageLoadWindowMillis);
    navigationCorrelation = { span, timer };
  }
  function elementName(element) {
    const text = element.textContent?.replace(/\s+/g, " ").trim() || "";
    return (element.dataset.otelName || element.getAttribute("aria-label") || element.getAttribute("title") || (element instanceof HTMLInputElement ? element.value : "") || text || element.id || element.getAttribute("name") || element.tagName.toLowerCase()).slice(0, 120);
  }
  function elementPath(element) {
    const parts = [];
    let current = element;
    while (current && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        part += `#${current.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
        parts.unshift(part);
        break;
      }
      const classes = Array.from(current.classList).map((item) => item.replace(/[^a-zA-Z0-9_-]/g, "")).filter(Boolean).slice(0, 2);
      if (classes.length) part += `.${classes.join(".")}`;
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(" > ").slice(0, 300);
  }
  function startInteractionSpan(element) {
    if (!resolvedConfig) return;
    finishCorrelation("interaction");
    const name = elementName(element);
    const tracer = trace.getTracer("@databuff/otel-web", SDK_VERSION);
    const parent = navigationCorrelation?.span;
    const parentContext = parent ? trace.setSpan(context.active(), parent) : context.active();
    const span = tracer.startSpan(withPageRoute(`ui.click ${name}`, resolvedConfig), {
      attributes: {
        "event.name": "click",
        "ui.element.name": name,
        "ui.element.type": element.tagName.toLowerCase(),
        "ui.element.id": element.id,
        "ui.element.role": element.getAttribute("role") || "",
        "ui.element.path": elementPath(element),
        "url.full": pageUrl(resolvedConfig)
      }
    }, parentContext);
    const timer = window.setTimeout(() => {
      if (interactionCorrelation?.span === span) finishCorrelation("interaction");
    }, resolvedConfig.interactionWindowMillis);
    interactionCorrelation = { span, timer };
  }
  function applyRequestAttributes(span, method, rawUrl, status) {
    const normalizedMethod = (method || "GET").toUpperCase();
    try {
      const url = new URL(rawUrl, location.href);
      span.updateName(`${normalizedMethod} ${url.pathname}`);
      span.setAttribute("http.request.method", normalizedMethod);
      span.setAttribute("server.address", url.hostname);
      span.setAttribute("url.path", url.pathname);
      if (status != null) span.setAttribute("http.response.status_code", status);
    } catch {
      span.updateName(`${normalizedMethod} request`);
    }
    span.setAttribute("http.request.source", "browser");
  }
  function toException(error) {
    if (error instanceof Error) return error;
    if (typeof error === "string") return new Error(error);
    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error(String(error));
    }
  }
  var severityNumbers = {
    DEBUG: SeverityNumber.DEBUG,
    INFO: SeverityNumber.INFO,
    WARN: SeverityNumber.WARN,
    ERROR: SeverityNumber.ERROR
  };
  function stringifyLogBody(body) {
    if (typeof body === "string") return body;
    if (body instanceof Error) return body.stack || body.message;
    try {
      const serialized = JSON.stringify(body);
      return serialized === void 0 ? String(body) : serialized;
    } catch {
      return String(body);
    }
  }
  function decodeCookiePart(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  function readCookieValues(keys) {
    if (!keys.length || typeof document === "undefined") return {};
    const available = /* @__PURE__ */ new Map();
    try {
      for (const item of document.cookie.split(";")) {
        const separator = item.indexOf("=");
        if (separator < 0) continue;
        const rawName = item.slice(0, separator).trim();
        const rawValue = item.slice(separator + 1);
        const value = decodeCookiePart(rawValue);
        available.set(rawName, value);
        available.set(decodeCookiePart(rawName), value);
      }
    } catch {
      return {};
    }
    const result = {};
    for (const key of keys) {
      const value = available.get(key);
      if (value !== void 0) result[key] = value;
    }
    return result;
  }
  function readStorageValues(storageName, keys) {
    if (!keys.length || typeof window === "undefined") return {};
    const result = {};
    try {
      const storage = window[storageName];
      for (const key of keys) {
        const value = storage.getItem(key);
        if (value !== null) result[key] = value;
      }
    } catch {
      return {};
    }
    return result;
  }
  function readLogBodyContext(config) {
    if (!config) return void 0;
    const cookie = readCookieValues(config.logCookieKeys);
    const localStorage = readStorageValues("localStorage", config.logLocalStorageKeys);
    const sessionStorage = readStorageValues("sessionStorage", config.logSessionStorageKeys);
    const result = {};
    if (Object.keys(cookie).length) result.cookie = cookie;
    if (Object.keys(localStorage).length) result.localStorage = localStorage;
    if (Object.keys(sessionStorage).length) result.sessionStorage = sessionStorage;
    return Object.keys(result).length ? result : void 0;
  }
  function buildLogBody(body) {
    const contextValues = readLogBodyContext(resolvedConfig);
    if (!contextValues) return stringifyLogBody(body);
    return JSON.stringify({
      message: stringifyLogBody(body),
      context: contextValues
    });
  }
  function emitLog(body, severity = "INFO", attributes = {}, explicitContext) {
    const minimumLevel = resolvedConfig?.minLogLevel ?? "ERROR";
    if (severityNumbers[severity] < severityNumbers[minimumLevel]) return;
    const logger2 = logs.getLogger("@databuff/otel-web", SDK_VERSION);
    const baseContext = explicitContext ?? context.active();
    let parentSpan = trace.getSpan(baseContext) ?? currentCorrelationSpan();
    let syntheticSpan;
    if (!parentSpan) {
      syntheticSpan = trace.getTracer("@databuff/otel-web", SDK_VERSION).startSpan(
        `log.${severity.toLowerCase()}`,
        {
          attributes: {
            "event.name": "log.emit",
            "log.severity": severity
          }
        },
        baseContext
      );
      if (severity === "ERROR") syntheticSpan.setStatus({ code: SpanStatusCode.ERROR });
      parentSpan = syntheticSpan;
    }
    const logContext = parentSpan ? trace.setSpan(baseContext, parentSpan) : baseContext;
    logger2.emit({
      severityNumber: severityNumbers[severity],
      severityText: severity,
      body: buildLogBody(body),
      attributes,
      context: logContext
    });
    syntheticSpan?.end();
  }
  function recordError(error, attributes = {}) {
    const exception = toException(error);
    const tracer = trace.getTracer("@databuff/otel-web", SDK_VERSION);
    const correlationSpan = currentCorrelationSpan();
    const parentContext = correlationSpan ? trace.setSpan(context.active(), correlationSpan) : context.active();
    const span = tracer.startSpan(withPageRoute("browser.error", resolvedConfig), {
      attributes: {
        "error.type": exception.name,
        "error.message": exception.message,
        ...attributes
      }
    }, parentContext);
    emitLog(exception.message, "ERROR", {
      "event.name": "browser.error",
      "exception.type": exception.name,
      "exception.message": exception.message,
      "exception.stacktrace": exception.stack || "",
      ...attributes
    }, trace.setSpan(parentContext, span));
    span.recordException(exception);
    span.setStatus({ code: SpanStatusCode.ERROR, message: exception.message });
    span.end();
  }
  function recordWebVital(metric) {
    const tracer = trace.getTracer("@databuff/otel-web", SDK_VERSION);
    const span = tracer.startSpan(withPageRoute(`web.vital.${metric.name.toLowerCase()}`, resolvedConfig), {
      attributes: {
        "web_vital.name": metric.name,
        "web_vital.value": metric.value,
        "web_vital.rating": metric.rating,
        "web_vital.delta": metric.delta,
        "web_vital.id": metric.id,
        "url.full": resolvedConfig ? pageUrl(resolvedConfig) : location.href
      }
    });
    span.end();
  }
  function installGlobalHooks(config) {
    const removers = [];
    if (config.captureFetch && typeof window.fetch === "function") {
      const instrumentedFetch = window.fetch;
      window.fetch = ((input, init2) => {
        const parent = currentCorrelationSpan();
        if (!parent) return instrumentedFetch(input, init2);
        return context.with(trace.setSpan(context.active(), parent), () => instrumentedFetch(input, init2));
      });
      removers.push(() => {
        window.fetch = instrumentedFetch;
      });
    }
    if (config.captureXhr && typeof XMLHttpRequest !== "undefined") {
      const instrumentedOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = (function(method, url, async = true, username, password) {
        xhrRequestMeta.set(this, { method: method.toUpperCase(), url: String(url) });
        const invoke = () => instrumentedOpen.call(this, method, String(url), async, username, password);
        const parent = currentCorrelationSpan();
        return parent ? context.with(trace.setSpan(context.active(), parent), invoke) : invoke();
      });
      removers.push(() => {
        XMLHttpRequest.prototype.open = instrumentedOpen;
      });
    }
    if (config.captureUserInteractions) {
      const onClick = (event) => {
        const rawTarget = event.target;
        if (!(rawTarget instanceof Element)) return;
        const element = rawTarget.closest(
          '[data-otel-name],button,[role="button"],input[type="button"],input[type="submit"],a[href]'
        );
        if (!element || element.hasAttribute("disabled")) return;
        startInteractionSpan(element);
      };
      document.addEventListener("click", onClick, true);
      removers.push(() => document.removeEventListener("click", onClick, true));
    }
    if (config.captureDocumentLoad && !config.captureRoutes) startNavigationSpan("load");
    if (config.captureErrors) {
      const onError = (event) => recordError(event.error || event.message, {
        "code.filepath": event.filename || "",
        "code.lineno": event.lineno,
        "code.column": event.colno
      });
      const onRejection = (event) => recordError(event.reason, {
        "error.source": "unhandledrejection"
      });
      window.addEventListener("error", onError);
      window.addEventListener("unhandledrejection", onRejection);
      removers.push(() => window.removeEventListener("error", onError));
      removers.push(() => window.removeEventListener("unhandledrejection", onRejection));
    }
    if (config.captureConsole) {
      const originalWarn = console.warn;
      const originalError = console.error;
      let emittingConsoleLog = false;
      const capture = (severity, original, args) => {
        original.apply(console, args);
        if (emittingConsoleLog) return;
        emittingConsoleLog = true;
        try {
          emitLog(args.map(stringifyLogBody).join(" "), severity, {
            "event.name": "console",
            "console.severity": severity.toLowerCase()
          });
        } finally {
          emittingConsoleLog = false;
        }
      };
      console.warn = (...args) => capture("WARN", originalWarn, args);
      console.error = (...args) => capture("ERROR", originalError, args);
      removers.push(() => {
        console.warn = originalWarn;
        console.error = originalError;
      });
    }
    if (config.captureRoutes) {
      let previousHref = location.href;
      let previousUrl = pageUrl(config);
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      const notify = (type) => {
        const nextHref = location.href;
        const nextUrl = pageUrl(config);
        if (nextHref === previousHref) return;
        const oldUrl = previousUrl;
        previousHref = nextHref;
        previousUrl = nextUrl;
        startNavigationSpan(type, oldUrl);
      };
      history.pushState = function(...args) {
        const result = originalPushState.apply(this, args);
        window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: "pushState" }));
        return result;
      };
      history.replaceState = function(...args) {
        const result = originalReplaceState.apply(this, args);
        window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: "replaceState" }));
        return result;
      };
      const onRoute = (event) => notify(event.detail || "history");
      const onPopState = () => notify("popstate");
      const onHashChange = () => notify("hashchange");
      window.addEventListener(ROUTE_EVENT, onRoute);
      window.addEventListener("popstate", onPopState);
      window.addEventListener("hashchange", onHashChange);
      startNavigationSpan("load");
      removers.push(() => {
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
        window.removeEventListener(ROUTE_EVENT, onRoute);
        window.removeEventListener("popstate", onPopState);
        window.removeEventListener("hashchange", onHashChange);
      });
    }
    if (config.captureWebVitals) {
      P(recordWebVital);
      M(recordWebVital);
      x(recordWebVital);
      U(recordWebVital);
      D(recordWebVital);
    }
    return () => {
      removers.splice(0).forEach((remove) => remove());
      finishCorrelation("interaction");
      finishCorrelation("navigation");
    };
  }
  function init(configInput) {
    if (traceProvider) {
      if (resolvedConfig?.debug) console.warn("[DatabuffOtel] init() ignored: SDK is already initialized.");
      return api;
    }
    const config = resolveConfig(configInput);
    resolvedConfig = config;
    if (config.debug) {
      diag2.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }
    const resourceAttributes = {
      "service.name": config.serviceName,
      "telemetry.sdk.distribution": "@databuff/otel-web",
      "telemetry.sdk.distribution.version": SDK_VERSION,
      ...config.attributes
    };
    if (config.serviceVersion) resourceAttributes["service.version"] = config.serviceVersion;
    if (config.environment) resourceAttributes["deployment.environment.name"] = config.environment;
    const resource = resourceFromAttributes(resourceAttributes);
    const traceExporter = new OTLPTraceExporter({
      url: config.endpoint,
      headers: config.headers
    });
    const spanProcessor = new BatchSpanProcessor2(traceExporter, {
      scheduledDelayMillis: 3e3,
      exportTimeoutMillis: 1e4,
      maxQueueSize: 1024,
      maxExportBatchSize: 256
    });
    traceProvider = new WebTracerProvider({
      resource,
      sampler: new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(config.sampleRate) }),
      spanProcessors: [spanProcessor]
    });
    traceProvider.register({ contextManager: new ZoneContextManager() });
    const logExporter = new OTLPLogExporter({
      url: config.logsEndpoint,
      headers: config.headers
    });
    const logProcessor = new BatchLogRecordProcessor({
      exporter: logExporter,
      scheduledDelayMillis: 3e3,
      exportTimeoutMillis: 1e4,
      maxQueueSize: 1024,
      maxExportBatchSize: 256
    });
    loggerProvider = new LoggerProvider({ resource, processors: [logProcessor] });
    logs.setGlobalLoggerProvider(loggerProvider);
    const ignoredExporters = [config.endpoint, config.logsEndpoint].map((endpoint) => new RegExp(`^${escapeRegExp(endpoint)}(?:\\?|$)`));
    const instrumentations = [];
    if (config.captureDocumentLoad) instrumentations.push(new DocumentLoadInstrumentation());
    if (config.captureFetch) {
      instrumentations.push(new FetchInstrumentation({
        ignoreUrls: ignoredExporters,
        propagateTraceHeaderCorsUrls: config.propagateTo,
        requestHook: (span, request) => {
          const method = request instanceof Request ? request.method : request.method || "GET";
          span.setAttribute("http.request.method", method.toUpperCase());
        },
        applyCustomAttributesOnSpan: (span, request, result) => {
          const method = request instanceof Request ? request.method : request.method || "GET";
          const requestUrl = request instanceof Request ? request.url : "";
          const resultUrl = result instanceof Response ? result.url : "";
          applyRequestAttributes(span, method, resultUrl || requestUrl, result.status);
        }
      }));
    }
    if (config.captureXhr) {
      instrumentations.push(new XMLHttpRequestInstrumentation({
        ignoreUrls: ignoredExporters,
        propagateTraceHeaderCorsUrls: config.propagateTo,
        applyCustomAttributesOnSpan: (span, xhr) => {
          const request = xhrRequestMeta.get(xhr);
          applyRequestAttributes(
            span,
            request?.method || "GET",
            xhr.responseURL || request?.url || "",
            xhr.status
          );
        }
      }));
    }
    unregisterInstrumentations = registerInstrumentations({ instrumentations });
    removeGlobalHooks = installGlobalHooks(config);
    if (config.debug) {
      console.info("[DatabuffOtel] initialized", {
        serviceName: config.serviceName,
        tracesEndpoint: config.endpoint,
        logsEndpoint: config.logsEndpoint,
        minLogLevel: config.minLogLevel,
        logCookieKeys: config.logCookieKeys,
        logLocalStorageKeys: config.logLocalStorageKeys,
        logSessionStorageKeys: config.logSessionStorageKeys,
        sampleRate: config.sampleRate
      });
    }
    return api;
  }
  var api = {
    version: SDK_VERSION,
    get initialized() {
      return traceProvider != null;
    },
    init,
    async flush() {
      await Promise.all([
        traceProvider?.forceFlush(),
        loggerProvider?.forceFlush()
      ]);
    },
    async shutdown() {
      removeGlobalHooks?.();
      removeGlobalHooks = void 0;
      unregisterInstrumentations?.();
      unregisterInstrumentations = void 0;
      await Promise.all([
        traceProvider?.shutdown(),
        loggerProvider?.shutdown()
      ]);
      logs.disable();
      traceProvider = void 0;
      loggerProvider = void 0;
      resolvedConfig = void 0;
    },
    recordError,
    log: emitLog,
    startSpan(name, fn, attributes = {}) {
      const tracer = trace.getTracer("@databuff/otel-web", SDK_VERSION);
      return tracer.startActiveSpan(name, { attributes }, context.active(), (span) => {
        try {
          const result = fn(span);
          if (result instanceof Promise) {
            return result.catch((error) => {
              span.recordException(toException(error));
              span.setStatus({ code: SpanStatusCode.ERROR });
              throw error;
            }).finally(() => span.end());
          }
          span.end();
          return result;
        } catch (error) {
          span.recordException(toException(error));
          span.setStatus({ code: SpanStatusCode.ERROR });
          span.end();
          throw error;
        }
      });
    }
  };
  var existing = window.DatabuffOtel;
  if (!existing) {
    window.DatabuffOtel = api;
    const scriptOptions = currentScriptConfig();
    if (scriptOptions.autoStart) init(scriptOptions.config);
  } else {
    console.warn("[DatabuffOtel] SDK is already loaded; duplicate script ignored.");
  }
})();
/*! Bundled license information:

zone.js/fesm2015/zone.js:
  (**
   * @license Angular
   * (c) 2010-2026 Google LLC. https://angular.dev/
   * License: MIT
   *)
*/

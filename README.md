# Databuff OpenTelemetry Web SDK

可通过 `<script>` 直接引入的浏览器 OpenTelemetry SDK，适用于 Vue 2、Vue 3、React、Angular 和原生网页。

## Span names and page routes

SDK 在浏览器端创建自动 Span 时，会在名称末尾追加当前页面路由（不含 Host），并把结果作为 Span name 直接上报；后端无需再拼接或修改字段。

例如当前页面为 https://portal.example.com/dashboard：

    page.load /dashboard
    page.view /dashboard
    ui.click 保存订单 /dashboard
    web.vital.inp /dashboard
    browser.error /dashboard

fetch 和 XMLHttpRequest 的名称本来就是 HTTP 方法加 URL path，例如 GET /api/orders；它们继续保留接口 path。页面 Host 不会出现在名称中。

默认不带查询参数。如需把查询参数纳入名称，可以配置：

    HTML: data-include-url-query="true"
    JavaScript: includeUrlQuery: true

Hash 路由会保留，例如 /#/orders。名称的完整值会写入 OTLP Span name/resource，因此现有链路查询可以按完整名称使用，不需要后端改造。

## Vue 最简接入

SDK 必须放在 Vue 入口脚本之前，并且不要给 SDK 脚本添加 `async` 或 `defer`。否则 Vue 启动阶段已经发出的接口无法补采。

```html
<head>
  <script
    src="https://collect.example.com/sdk/otel-web.min.js?v=0.3.3"
    data-service="portal-web"
    data-endpoint="https://collect.example.com"
    data-environment="production"
    data-version="1.0.0"
    data-propagate-to="https://api.example.com/*">
  </script>

  <!-- 必须位于 SDK 后面 -->
  <script type="module" src="/src/main.ts"></script>
</head>
```

SDK 通过 OTLP/HTTP protobuf 分别发送：

```text
https://collect.example.com/v1/traces
https://collect.example.com/v1/logs
```

## 自动追踪链路

首屏加载和路由跳转期间发出的请求会成为页面 Span 的子节点：

```text
page.load / page.view
└─ GET /api/dashboard
```

点击按钮后发出的请求会成为点击 Span 的子节点：

```text
ui.click 保存订单
└─ POST /api/orders
```

点击 Span 包含：

- `ui.element.name`：按钮名称
- `ui.element.type`：button、a、input 等
- `ui.element.id`
- `ui.element.role`
- `ui.element.path`：元素路径

按钮名称按以下顺序识别：`data-otel-name`、`aria-label`、`title`、按钮 value、可见文本、id、name。

普通按钮通常无需改动：

```html
<button>保存订单</button>
```

复杂图标按钮建议明确命名：

```html
<button data-otel-name="删除用户" aria-label="删除用户">
  <svg>...</svg>
</button>
```

## 链路关联窗口

以下两个参数是父子链路的关联时间窗口，不是接口超时时间，也不会决定接口是否采集：

```html
data-page-load-window="10000"
data-interaction-window="5000"
```

### `data-page-load-window`

页面首次加载或路由切换后，在指定时间内**开始发起**的接口和日志会关联到当前 `page.load` 或 `page.view` Span。单位为毫秒。

例如设置为 10000ms：

```text
page.load
├─ 1秒后 GET /api/user
├─ 3秒后 GET /api/menu
└─ 8秒后 GET /api/dashboard
```

第 10 秒后开始的接口仍会被采集，但不会再被强制归到这个页面 Span 下。请求只要在窗口内开始，即使完成时已经超过窗口，父子关系也不会改变。

### `data-interaction-window`

用户点击按钮后，在指定时间内开始发起的接口和日志会关联到对应的 `ui.click` Span。单位为毫秒。

例如设置为 5000ms：

```text
ui.click 保存订单
├─ 立即 POST /api/orders
├─ 2秒后 GET /api/orders/status
└─ console.error('保存失败')
```

第 5 秒后才开始的接口仍会被采集，但不会再被强制归到本次点击 Span 下。

页面窗口和点击窗口重叠时，点击关联优先：

```text
page.load
└─ ui.click 保存订单
   └─ POST /api/orders
```

默认值和通常建议值：

```html
data-page-load-window="5000"
data-interaction-window="3000"
```

窗口应覆盖正常的页面初始化和点击处理时间，但不建议设置得过长，否则可能把无关接口错误地关联到较早的页面加载或点击。

## 网络请求采集与跨域传播

自动采集 `fetch` 和 `XMLHttpRequest`，请求 Span 会包含：

- HTTP 方法
- URL path
- 服务端地址
- HTTP 状态码
- 网络耗时事件

同源请求会自动注入并传播 `traceparent`，不需要配置 `data-propagate-to`。

例如页面和接口都是 `https://portal.example.com`：

```text
页面：https://portal.example.com/dashboard
接口：https://portal.example.com/api/user
```

跨域业务 API 必须显式配置：

```html
data-propagate-to="https://api.example.com/*,https://gateway.example.com/*"
```

例如页面位于 `https://portal.example.com`，接口位于 `https://api.example.com/orders`，匹配后请求头会出现：

```text
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
                └──────── traceId ────────┘ └── parent spanId ──┘
```

请求头格式为：

```text
版本-traceId-parentSpanId-采样标记
```

浏览器请求 Span、后端接口 Span 和关联日志应使用相同的 `traceId`；它们各自的 `spanId` 通常不同。

不要把不受控制的第三方域名加入 `data-propagate-to`。跨域 API 还必须允许以下 CORS 请求头：

```text
traceparent
tracestate
baggage
```

只有后端正确接收并提取 `traceparent`，浏览器请求 Span 才能与 Java、Node 等服务端 Span 形成完整的分布式链路。
## 默认自动采集

- 页面加载与 Vue Router/History 路由切换
- `fetch` 和 `XMLHttpRequest`
- 按钮、链接和 `[role="button"]` 点击
- JavaScript Error 和未处理的 Promise rejection
- `console.debug`、`console.info`、`console.log`、`console.warn`、`console.error`（受最低日志级别过滤；默认仅采集 ERROR）
- CLS、FCP、INP、LCP、TTFB Web Vitals

## Web Vitals 指标说明

当前 SDK 使用 `web-vitals` 采集页面性能。在 OpenTelemetry 中，这些数据全部通过 `/v1/traces` 作为 **Span** 上报，不是 OTLP Metric，也不是 Log。

| Span 名称 | 指标 | 测量内容 | `web_vital.value` 类型/单位 | 良好 | 需要改进 | 较差 |
|---|---|---|---|---:|---:|---:|
| `web.vital.ttfb` | TTFB | 页面导航开始到收到响应第一个字节 | `number`，毫秒 | ≤ 800ms | 800–1800ms | > 1800ms |
| `web.vital.fcp` | FCP | 页面首次绘制文字、图片、SVG 等内容 | `number`，毫秒 | ≤ 1800ms | 1800–3000ms | > 3000ms |
| `web.vital.lcp` | LCP | 视口中最大图片、文字块或视频完成绘制 | `number`，毫秒 | ≤ 2500ms | 2500–4000ms | > 4000ms |
| `web.vital.inp` | INP | 点击、触摸或键盘操作到下一帧绘制 | `number`，毫秒 | ≤ 200ms | 200–500ms | > 500ms |
| `web.vital.cls` | CLS | 页面生命周期中意外布局偏移的程度 | `number`，无单位 | ≤ 0.1 | 0.1–0.25 | > 0.25 |

其中 LCP、INP、CLS 是当前 Core Web Vitals；FCP 是感知加载速度指标；TTFB 是网络和服务端响应的基础诊断指标。

每个 Web Vital Span 包含以下属性：

```text
span.name = web.vital.inp
web_vital.name = INP
web_vital.value = 185
web_vital.rating = good
web_vital.delta = 185
web_vital.id = v4-...
url.full = https://portal.example.com/page
```

- `web_vital.value`：指标当前值。除 CLS 无单位外，其余指标单位均为毫秒。
- `web_vital.rating`：`good`、`needs-improvement` 或 `poor`。
- `web_vital.delta`：本次报告相对上次报告的变化量。
- `web_vital.id`：当前页面访问中该指标的唯一标识。

加载阶段可以按下面的时间关系理解：

```text
页面导航开始
├─ TTFB：收到服务器响应的第一个字节
├─ FCP：首次显示文字或图片等实际内容
└─ LCP：页面主要的大块内容完成显示
```

交互与稳定性指标：

- INP 高：通常表示主线程任务过长、事件处理器执行慢，或者渲染工作过重。没有发生点击、触摸或键盘操作时，页面可能不会产生 INP。
- CLS 高：通常由未设置尺寸的图片、异步插入内容、字体切换、广告或 iframe 尺寸变化引起。
- TTFB 低但 FCP/LCP 高：通常表示服务端响应正常，但 JavaScript、CSS、字体、图片或 Vue 渲染阶段较慢。

LCP、INP、CLS 等指标可能要到页面进入后台或页面生命周期接近结束时才得到最终值；浏览器隐藏或关闭页面时，批处理器会尝试自动刷新。

官方定义：[Web Vitals](https://web.dev/articles/vitals)、[TTFB](https://web.dev/articles/optimize-ttfb)、[FCP](https://web.dev/articles/fcp)、[LCP](https://web.dev/articles/lcp)、[INP](https://web.dev/articles/inp)、[CLS](https://web.dev/articles/cls)。
## 常用配置

```html
<script
  src="/sdk/otel-web.min.js?v=0.3.3"
  data-service="portal-web"
  data-endpoint="https://collect.example.com/v1/traces"
  data-logs-endpoint="https://collect.example.com/v1/logs"
  data-sample-rate="1"
  data-min-log-level="ERROR"
  data-propagate-to="https://api.example.com/*"
  data-page-load-window="5000"
  data-interaction-window="3000"
  data-include-url-query="false"
  data-debug="true">
</script>
```

- `data-page-load-window`：首屏或路由请求关联窗口，默认 5000ms。
- `data-interaction-window`：点击后请求关联窗口，默认 3000ms。
- `data-sample-rate`：调试时建议设为 `1`。
- `data-min-log-level`：最低日志采集级别，默认为 `ERROR`。

日志级别配置：

| 配置值 | 实际采集范围 |
|---|---|
| `DEBUG` | DEBUG、INFO、WARN、ERROR |
| `INFO` | INFO、WARN、ERROR |
| `WARN` | WARN、ERROR |
| `ERROR` | ERROR；默认值 |

例如需要采集 `console.info()` 和 `console.log()`：

```html
<script src="/sdk/otel-web.min.js?v=0.3.3" data-min-log-level="INFO"></script>
```

JavaScript 初始化方式：

```js
DatabuffOtel.init({
  serviceName: 'portal-web',
  endpoint: 'https://collect.example.com',
  minLogLevel: 'WARN'
})
```

可按需关闭：

```html
data-document-load="false"
data-fetch="false"
data-xhr="false"
data-user-interactions="false"
data-errors="false"
data-console="false"
data-routes="false"
data-web-vitals="false"
```

## 日志附加 Cookie 和 Storage

SDK 可以按白名单读取 Cookie、`localStorage`、`sessionStorage` 中指定键的当前值，并写入每条日志的 `body`。三项默认均为空；不配置就不会读取。

通过 `<script>` 属性配置，多个键名使用英文逗号分隔：

```html
<script
  src="/sdk/otel-web.min.js?v=0.3.3"
  data-service="portal-web"
  data-endpoint="https://collect.example.com"
  data-log-cookie-keys="tenantId,userId"
  data-log-local-storage-keys="userProfile,locale"
  data-log-session-storage-keys="requestId">
</script>
```

通过 JavaScript 初始化配置：

```js
DatabuffOtel.init({
  serviceName: 'portal-web',
  endpoint: 'https://collect.example.com',
  logCookieKeys: ['tenantId', 'userId'],
  logLocalStorageKeys: ['userProfile', 'locale'],
  logSessionStorageKeys: ['requestId']
})
```

配置后，日志 `body` 是 JSON 字符串，原始日志内容保留在 `message`：

```json
{
  "message": "checkout failed",
  "context": {
    "cookie": {
      "tenantId": "tenant-01",
      "userId": "10086"
    },
    "localStorage": {
      "userProfile": "{\"name\":\"Alice\"}",
      "locale": "zh-CN"
    },
    "sessionStorage": {
      "requestId": "req-123"
    }
  }
}
```

- 每次生成日志时读取当前值，因此登录用户或会话值变化后无需重新初始化 SDK。
- 未找到的键会跳过；如果所有配置键都没有值，`body` 保持原来的格式。
- `HttpOnly` Cookie 无法被浏览器 JavaScript 读取，不会出现在日志中。
- Storage 中保存的 JSON 仍按字符串写入，不会自动解析。
- 请不要配置密码、登录令牌、身份证号等敏感字段，并控制字段长度，避免日志体过大。
## 手动 API

```js
DatabuffOtel.log('checkout failed', 'ERROR', { 'order.id': '123' })

await DatabuffOtel.startSpan('checkout.submit', async span => {
  span.setAttribute('cart.items', 3)
  await submitOrder()
})

await DatabuffOtel.flush()
```

### 日志与 Trace 关联

从 `0.3.2` 开始，所有 OTLP 日志都会携带 `traceId` 和 `spanId`：

- 页面加载或路由期间的日志关联 `page.load` / `page.view`。
- 按钮点击关联窗口内的日志关联对应的 `ui.click`。
- JavaScript 异常日志关联 `browser.error`。
- 当日志级别达到配置阈值且没有活动业务 Span 时，`DatabuffOtel.log()` 以及 `console.debug()`、`console.info()`、`console.log()`、`console.warn()`、`console.error()` 会创建对应的 `log.*` 短 Span。默认阈值为 `ERROR`，因此这些非 ERROR 控制台日志默认不会上报。

日志表中应能看到：

```text
log_id   = ...
trace_id = 32 位十六进制字符串
span_id  = 16 位十六进制字符串
```

如果希望关联的短 Span 也一定能在 Trace 页面查询到，调试阶段请使用 `data-sample-rate="1"`。
## 排查

浏览器控制台执行：

```js
DatabuffOtel.version        // 应为 0.3.3
DatabuffOtel.initialized    // 应为 true
console.error('otel log test')
await DatabuffOtel.flush()
```

如果没有首屏接口 Span，检查 SDK 是否位于 Vue 入口脚本之前。如果有浏览器请求 Span，但后端 Span 没有成为子节点，检查业务 API 请求是否携带 `traceparent`，以及后端是否启用了 OpenTelemetry 服务端插桩。

## Collector CORS

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins:
            - https://your-web.example.com
          allowed_headers:
            - Content-Type
            - Authorization
            - traceparent
            - tracestate
            - baggage
```

页面 CSP 需要在 `connect-src` 中同时允许 Collector 和业务 API 地址。

## 注意

浏览器端 OpenTelemetry 自动插桩和 JavaScript Logs 仍可能包含实验性能力，建议先在预发布环境验证。生产环境应限制 Collector 来源、请求大小和速率，并使用短期令牌或入口鉴权。
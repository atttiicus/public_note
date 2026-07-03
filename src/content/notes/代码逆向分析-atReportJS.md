---
title: atReport.js 逆向分析报告
description: 逆向分析 atReport.js 代码，主要分析其接口机制、停留时长监听机制、用户PV的机制
tags: ['逆向分析', 'AI', '前端', '埋点']
---

# atReport.js 逆向分析报告

腾讯/英雄联盟官网数据上报 SDK，Webpack 打包后 minified，约 226KB。

---

## 一、点击监听实现

### 监听方式

使用 `mousedown` 而非 `click` 事件，挂载在 `document` 上（事件委托）：

```javascript
document.addEventListener("mousedown", this.handlerClickThis, false)
```

### 处理链

```
mousedown 触发
  → Bn(event, clickConfig)  // 解析目标元素，匹配过滤规则
  → realTarget              // 实际被点击的 DOM 元素
  → Dn(element, Nn)         // 提取上报参数（坐标、元素属性等）
  → dtReport("click", params, "onDirectUserAction", target)
```

### autoClick 模式

当 `setSite.autoClick = true` 时，SDK 自动监听所有 `<a>` 和 `<button>` 标签，无需手动埋点。`clickConfig` 中内置了对这两类标签的选择器规则。

### 事件类型映射

```javascript
const REPORT_EVENT_MAP = {
    click:       "at_click",
    show_area:   "at_show_area",
    show_page:   "at_imp",
    stay_page:   "at_stay_page",
    stay_area:   "at_stay_area",
    scroll_page: "at_scroll_page"
}
```

---

## 二、数据上报机制与接口格式

### 上报优先级

1. **`Navigator.sendBeacon`**（优先）：页面卸载时也能可靠发出
2. **`fetch` POST**（备选）：常规场景

```javascript
// sendBeacon
navigator.sendBeacon(uploadUrl, JSON.stringify(payload))

// fetch
fetch(`https://aegis.qq.com/collect?${queryString}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload
})
```

### 上报端点

| 场景 | 地址 |
|------|------|
| 标准内网 | `https://h.trace.qq.com/kv` |
| 海外 | `https://htrace.wetvinfo.com/kv` |
| Aegis 监控 | `https://aegis.qq.com/collect` |

### 上报参数结构

```javascript
{
    // SDK 标识
    attaid: "00400014144",
    token: "6478159937",
    product_id: appkey,
    sdk_version: "4.5.14-web",

    // 设备 & 用户
    platform: "web",
    uin: deviceId,           // 设备唯一 ID（UUID v4）
    openid: "",              // 用户 openid（可选）

    // 视口信息
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    // 页面路由
    url: location.href,
    hostname: location.hostname,
    pathname: location.pathname,
    query: location.search,

    // 事件本身
    eventType: "at_click",   // 映射后的事件类型
    ...extraParams           // 各事件附加参数
}
```

### 唯一设备 ID 生成

```javascript
// UUID v4
"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
})
```

---

## 三、停留时长监听机制

### 页面停留（stay_page）

利用 **Visibility API** 精确排除页面不可见时间：

```javascript
// 监听页面可见性变化
document.addEventListener("visibilitychange", () => {
    const now = Date.now()
    if (document.hidden) {
        // 页面隐藏：不计入停留时间
        pageHiddenTime += now - pageEnterTime
    }
    pageEnterTime = now
})

// 上报时计算净停留时长
const staytime = clamp(
    Date.now() - pageEnterTime + pageHiddenTime,
    0, maxStaytime
)

dtReport("stay_page", { url, staytime, isExit: true }, "onSendBeacon")
```

页面关闭/跳转时通过 `sendBeacon` 保证数据不丢失。

### 区域停留（stay_area / autoAreaStay）

使用 **`IntersectionObserver`** 检测带 `dt-areaid` 属性的 DOM 元素进入/离开视口：

```javascript
// HTML 侧标记
<div dt-areaid="banner_top">...</div>

// SDK 内部
new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > threshold) {
            startTimer(entry.target)   // 元素进入：开始计时
        } else {
            reportAndStop(entry.target) // 元素离开：上报并停止
        }
    })
}, { threshold: [0.5] })   // 50% 可见才算进入
```

关键配置：
```javascript
{
    keyAttribute: "dt-areaid",  // 标识停留区域的 HTML 属性名
    areaDelay:    1000,          // 进入后延迟 1s 才开始计时（防抖）
    areaThreshold: 0.5,          // 交叉比例阈值：50%
}
```

---

## 四、PV 上报机制

### 初始化入口

```javascript
// 1. 页面端配置
var setSite = {
    siteType: "os",
    pageType: "main",
    project: "base",
    autoClick: true,
    autoAreaStay: true
}

// 2. pgv 页面访问计数（腾讯 PGV 统计）
if (typeof pgvMain === "function") pgvMain()

// 3. AT SDK 初始化（读取 setSite）
if (typeof LOL_SEND_DATA_FN_AT === "function") LOL_SEND_DATA_FN_AT()
```

### SDK 内部初始化流程

```
LOL_SEND_DATA_FN_AT()
  → 读取全局 setSite 配置
  → 初始化 window.ATInfo（uid、sdkVersion、appkey）
  → 生成设备 ID（UUID v4，持久化到 localStorage）
  → 注册路由监听（SPA 支持）
  → 触发首次 show_page 上报
```

### SPA 路由变化支持

监听多种路由事件，500ms 防抖：

```javascript
["replaceState", "pushState", "popstate", "hashchange"].forEach((ev) => {
    window.addEventListener(ev, debounce(listenRouterChange, 500))
})
```

每次路由变化自动上报新的 `show_page`（`at_imp`）。

### LOLSetUserIDAT（用户 ID 绑定）

```javascript
window.LOLSetUserIDAT({
    openid: "xxx",     // 必须纯字母数字
    gopenid: "xxx",
    roleid: "xxx"
})
```

调用后将用户 ID 附加到后续所有上报参数中。

---

## 整体数据流

```
用户行为
  │
  ├─ 点击  → mousedown 委托 → Bn() 匹配目标 → dtReport("click")
  │
  ├─ 页面访问 → LOL_SEND_DATA_FN_AT 初始化 → dtReport("show_page")
  │             路由变化防抖 500ms → dtReport("show_page")
  │
  ├─ 页面停留 → Visibility API 排除隐藏时间
  │             beforeunload / pagehide → dtReport("stay_page") via sendBeacon
  │
  └─ 区域停留 → IntersectionObserver 检测 dt-areaid 元素
                进入视口 50% 且持续 1s → 开始计时
                离开视口 → dtReport("stay_area")
                                │
                                ↓
                    参数构造 getParamsAfterMap()
                    事件类型映射 REPORT_EVENT_MAP
                                │
                                ↓
                    Navigator.sendBeacon (优先)
                    fetch POST (备选)
                                │
                    ┌───────────┴───────────┐
                    h.trace.qq.com/kv    aegis.qq.com/collect
```

---
title: ping_tcss_tgideas_https.js 逆向分析
description: 腾讯 TGIdeas 游戏平台客户端数据采集 SDK（tcss 3.4.6.8）的完整逆向分析，涵盖性能监控、用户行为埋点、DMP 上报三套体系的接口格式、数据上报机制与初始化流程。
tags: ['逆向分析', '前端', '埋点', '性能监控']
---

# ping_tcss_tgideas_https.js 逆向分析

**文件大小**：53,917 字节（约 54KB）  
**版本**：tcss.3.4.6.8 / tcsso.3.4.6.8  
**模块形式**：IIFE 自执行函数  
**定性**：腾讯 TGIdeas 游戏平台综合客户端数据采集 SDK，集成性能监控、用户行为分析、DMP 上报三套体系。

---

## 整体架构

```
ping_tcss_tgideas_https_min.js
├── Promise Polyfill（完整实现，兼容 IE8+）
├── 工具函数（对象操作、_typeof、URL 解析、Cookie 管理）
├── PTT 系统（页面性能跟踪 + 用户行为 + 生命周期）
├── DMP 系统（数据管理平台，游戏用户行为上报）
└── TCSS 系统（采样统计，设备信息，会话管理）
```

三个核心全局对象：

- `window.Tcss`：TCSS 统计主对象
- `window.PTT`：PTT 组件主类
- `window.PTTRun`：运行时实例

---

## 性能监控

使用 `performance.timing` 采集传统导航性能指标，在 `pagehide`/`unload` 时上报：

```javascript
// 页面加载时间
loadpage = (timing.loadEventEnd - timing.navigationStart) / 1000

// DOM 就绪时间
domready = (timing.domComplete - timing.responseEnd) / 1000

// 白屏时间
blank = (timing.domInteractive - timing.navigationStart) / 1000
```

**性能分级**：

| 指标 | S（快） | A | B | C（慢） |
|------|---------|---|---|---------|
| loadpage | < 1s | 1~3s | 3~5s | > 5s |
| domready | < 1s | ≥ 1s | — | — |
| blank | < 0.5s | 0.5~1s | 1~1.5s | > 1.5s |

上报事件名：`pttloadpage`、`pttdomready`、`pttblank`。

> 该 SDK 不采集 FCP、LCP、FID、CLS、TTFB 等现代 Web Vitals 指标。

---

## 错误监控

```javascript
window.onerror = function() {
    __MossoSendClick(
        "ptterror",
        // 错误消息 ||| 文件路径（去参数）||| 行号
        arguments[0] + "|||" + arguments[1].split("?")[0] + "|||" + arguments[2],
        // 系统 + 浏览器 + 网络类型
        PTTRun.PTTSystem + PTTRun.PTTSystemVer + "|||" + PTTRun.detectBrowser + "|||" + PTTRun.PTTNetType,
        PTTRun.virtualURL
    )
}
```

Promise 的 `unhandledRejection` 仅在控制台输出 warn，不上报。

---

## 数据上报机制与接口格式

### 上报方式

```javascript
// 优先 sendBeacon；iOS、麻将、欢乐斗地主页面降级为 Image 信标
if (!navigator.sendBeacon || /iphone|ipad/.test(system) || /majiang|hlddz/.test(url)) {
    k = new Image(1, 1)
    k.src = url.slice(0, 3000)   // Image 信标，限 3000 字符
} else {
    navigator.sendBeacon(url)
}
```

### 上报端点

| 用途 | 地址 |
|------|------|
| 主上报（PV/点击/性能） | `https://pingfore.[domain]/pingd?` |
| DMP 行为分析 | `//dmplog.qq.com/gingame/report/click` |

### 主上报参数（pingfore）

```
dm=        域名
url=       页面 URL
rdm=       引用域
rurl=      引用 URL
pvid=      页面访问 ID
ssid=      会话 ID
ts_uid=    时间戳 UID
scr=       屏幕分辨率
lang=      语言
rand=      随机数（0~100000）
hottag=    热点标签（点击目标描述）
hotx/hoty= 点击坐标
ext=       扩展信息
```

### DMP 上报参数

```javascript
{
    action: "pv" | "btn" | "timeline",
    game: gameName,
    openid / game_openid / game_appid,
    platid / partition / roleid,
    targetid / targettype,   // 推荐内容目标
    from: "v4|ams|tgl|ingame|other",
    staytime: milliseconds,
    recid: "",               // 推荐 ID
    sourceid: "",            // hash 解析的来源
    adtag: "",               // 广告标签
    fortest1~5: ""           // 测试字段
}
```

DMP 请求超时 1500ms，超时仅打印 `console.log`，不重试。

---

## 停留时长监听

```javascript
// 记录进入时间
PTTDate = Date.now()

// 页面卸载时计算并上报
window.addEventListener("pagehide", () => {
    PTTRun.newStayTime(Date.now() - PTTDate)
})
```

**停留时长分级**（`newStayTime`）：`0~3s` / `3~7s` / `7~10s` / `10s+` / `infinite`

页面可见性通过 `pagehide`/`unload` 处理，与 atReport.js 使用 Visibility API 精确扣除隐藏时间的方式不同，该方案为粗粒度统计。

---

## 用户行为监控

### 点击追踪

```javascript
watchClick: function(e) {
    var el = window.event ? window.event.srcElement : e.target
    switch (el.tagName) {
        case "A":      hottag = `<A href=${el.href}>${el.innerHTML}</A>`
        case "IMG":    hottag = `<IMG src=${el.src}>`
        case "INPUT":  hottag = `<INPUT type=${el.type} value=${el.value}>`
        case "BUTTON": hottag = `<BUTTON>${el.innerText}</BUTTON>`
    }
}
```

### 元素曝光检测

采用 MutationObserver（DOM 变化监听）与 scroll/resize 节流（视口判断）双重机制：

```javascript
new MutationObserver(callback).observe(document, {
    childList: true, subtree: true, attributes: true
})

// 视口判断
isInViewport(element) {
    var rect = element.getBoundingClientRect()
    return rect.right >= 0 && rect.left <= viewportWidth && ...
}
```

---

## 用户生命周期与分级

**留存分类**（按首访间隔天数）：

| 间隔 | 分类标签 |
|------|----------|
| 0 天 | 当日回访 |
| 1 天 | 次留 |
| 2~6 天 | 3留~6留 |
| 7 天 | 周留 |
| 8~14 天 | 8-14留 |
| 15 天 | 15留 |
| 30 天 | 月留 |
| > 30 天 | 老用户 |

**三维度用户标记**：

- `oldUser`：OS 系统历史用户（基于 `PTTuserFirstTime`）
- `osSysUser`：OS 系统页面用户
- `actOldUser`：活动页历史用户

**周留存环**（`weekloop`）：记录最近若干周的访问情况，格式示例：`"0-0-1-0"`。

---

## Cookie 与会话管理

```javascript
setCookie(name, value) {
    "ts_uid"   → 永久存储（730 天）
    "ssid"     → sessionStorage（页面级）
    "ts_refer" → 180 天
    "ts_last"  → 30 分钟
}

// 序列化写入单个 Cookie
pgv_info = "ssid=XXX&ts_uid=XXX&ts_refer=XXX&ts_last=XXX"
```

**跨域 Cookie 同步**（`crossDomain: "on"`）：通过 URL 参数 `tcss_uid`、`tcss_sid`、`tcss_refer`、`tcss_last` 实现跨子域会话信息传递。

---

## 设备与浏览器识别

**来源渠道**（通过 UA 识别）：

```
dcv_tiem / dcv_ingame / dcv_qq / dcv_wx / dcv_helper
dcv_weibo / dcv_qqvideo / dcv_qzone / dcv_yyb / dcv_qqnews
dcv_ttkb / dcv_other / dcv_pc
```

**操作系统**：android / iphone / ipad / ipod / windows / mac / unix  
**浏览器**：Chrome / Firefox / Safari / IE / QQ 浏览器 / UC / 搜狗 / 遨游 / 2345 / Opera

---

## DMP 游戏白名单

内置约 130+ 腾讯游戏域名（部分示例）：

```
pvp.qq.com、jx3.qq.com、codm.qq.com、kings.qq.com
timi.qq.com、speedm.qq.com、football.qq.com ...
```

只有白名单内的域名才会触发 DMP 上报逻辑。

---

## setSite 配置参数

```javascript
var setSite = {
    siteType:      "os",    // 站点类型
    pageType:      "main",  // 页面定位
    project:       "base",  // 模块名称
    osact:         0,       // OS 活动标识
    pageName:      "",      // 页面名称
    targetId:      "",      // DMP 内容目标 ID
    targetType:    "news",  // news / video / moment / other
    from:          "v4",    // 来源渠道
    virtualDomain: "",      // 虚拟域名（用于统计归类）
    virtualURL:    "",
    sessionSpan:   30,      // 会话超时（分钟）
    hot:           false,   // 热点坐标监控
    crossDomain:   "off",   // 跨域 Cookie 同步
    coordinateId:  "",      // 坐标参考元素 ID
}
```

---

## 全局 API

| 函数 | 说明 |
|------|------|
| `pgvMain(setSite)` | 主初始化入口 |
| `PTTSendClick(name, code, note, url?)` | 手动上报点击事件 |
| `PTTSendReport(eventObj, async?)` | DMP 上报 |
| `pgvSendClick(config)` | 兼容旧版接口 |
| `pgvWatchClick(event)` | 手动绑定点击监听 |
| `pgvGetArgs(config)` | 获取跨域参数 |
| `exposure.run()` | 手动启动曝光检测 |
| `LOLSetUserIDAT({openid, roleid})` | 绑定用户 ID（需配合 LOL atReport.js 使用） |

---

## 初始化完整流程

```
pgvMain(setSite)
  │
  ├─ 1. 初始化 Tcss/PTTRun 对象
  ├─ 2. 生成设备 ID（UUID v4，持久化到 localStorage）
  ├─ 3. 采集设备 / 浏览器 / 网络信息
  ├─ 4. 建立 pagehide / unload 监听（计算停留时长）
  ├─ 5. autoSend() 自动上报
  │     ├─ routeLine（访问路线）
  │     ├─ weekloop（周留存）
  │     ├─ systemInfo / browserInfo / deviceSize / viewSize / netType
  │     └─ exposure(window)（触发曝光检测）
  ├─ 6. 处理 __PTTbtnBuffer（pgvMain 前缓存的点击事件）
  ├─ 7. 处理 __PTTreportBuffer（缓存的 DMP 上报）
  └─ 8. 触发 PTTCallback 回调
```

---

## 与 atReport.js 的关系

两个 SDK 在腾讯 LOL 官网上同时使用，分工明确：

| | ping_tcss_tgideas | atReport.js |
|---|---|---|
| 定位 | 性能监控 + 基础行为统计 | 精细用户行为上报 |
| 停留计算 | pagehide/unload（粗粒度） | Visibility API（精确排除隐藏时间） |
| 曝光检测 | MutationObserver + scroll | IntersectionObserver |
| 用户分级 | 详细留存分级（次留/周留/月留） | 无 |
| DMP 集成 | 有（游戏白名单） | 无 |
| 上报端点 | `pingfore.*/pingd` | `h.trace.qq.com/kv` |
| 初始化入口 | `pgvMain(setSite)` | `LOL_SEND_DATA_FN_AT()` |
| 兼容性 | IE8+（含完整 Polyfill） | 现代浏览器为主 |

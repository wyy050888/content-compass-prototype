# 内容罗盘原型 · 修改边界

目标：一次需求只读取并修改所属功能，避免复制数据、弹窗和交互。

## 内容结构

| 能力 | 唯一数据源 | 选择入口 | 详情 |
| --- | --- | --- | --- |
| 智能文案 / 混剪结构选择 | `embedded-pages/js/misc-structure.js` 的 `contentStructures` | `js/modules/app-creation-home.js` 的结构选择器 | 模板库 iframe 的 `clOpenDetail` |

- 智能文案与混剪选择器只消费模板库桥接字段：`id`、`name`、`formula`、`source`、`status`、`sampleCount`、`stageNames`、`mixProfile`、`autoProductIds`、`productNames`、`scriptTypes`、`defaultForScriptTypes`。
- `提炼失败`只留在模板库处理，不进入混剪选择器。
- 混剪中的文案样稿可按 `mixProfile` 配置；不得再保存结构名称、公式、阶段或来源副本。
- 结构名称、公式、来源、阶段、适用脚本类型和默认匹配关系均不得在 `js/modules/` 维护副本。

## 组件复用规则

- 主应用弹层优先使用 `.modal-overlay + .modal-card`；已有静态 `.modal-backdrop + .modal` 的功能先原样维护，不在新功能中继续新增第三种写法。
- 模板库详情由模板库自身渲染；主应用只负责打开/关闭 iframe，不复制详情 HTML、样式或数据。
- 新页面继续放 `fragments/page-{page-id}.js`；只有导航存在对应 `data-page` 时才允许在 `index.html` 加载。

## 文件归属

| 改动类型 | 首选文件 |
| --- | --- |
| 壳层、路由、跨页编排 | `js/modules/app-shell.js` |
| 模板库结构、状态、样本、详情 | `embedded-pages/js/misc-structure.js` |
| 混剪结构选择 | `js/modules/app-creation-mix-catalog.js` 的 `mix*Structure*` 函数 |
| 混剪结构决策回填 | `js/modules/app-creation-mix-script.js` 的 `syncMixStructureDecision` |
| 模板库与主应用通信 | `embedded-pages/js/misc-structure-bridge.js` 的 `templateBridge*` + `js/modules/app-creation-mix-catalog.js` 的 `mixTemplate*` |
| 全局样式 | `css/main-{base,ai-create,ai-home,pull,qianchuan,pull-result,ai-agent,library,automation,mix}.css`；新样式必须按功能命名并紧邻所属区块 |

## 删除前检查

删除页面/组件前必须确认：

1. `index.html` 未加载该片段；
2. 没有 `data-page`、`switchPage(...)` 或事件处理器引用；
3. 嵌入页与桥接消息未依赖该 DOM ID。

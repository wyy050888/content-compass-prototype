# 内容罗盘原型 · 结构说明

本原型采用模块化结构,便于局部修改、大幅降低 token 消耗。

## 目录结构

```
内容罗盘原型/
├── index.html                       # 骨架:导航+顶栏+片段加载点+脚本引用
├── CLAUDE.md                        # Claude 工作地图(改哪→改哪完整速查表)
├── README_结构说明.md               # 本文档
│
├── css/                             # 主应用样式(共 19 个)
│   ├── main-*.css                   # 全局样式 10 个:base / ai-create / ai-home / pull /
│   │                                #   qianchuan / pull-result / ai-agent / library /
│   │                                #   automation / mix
│   └── 局部样式 9 个:competitor / lapan-detail / product-detail-assets /
│       script-library / script-agent / embedded-library / creation-persona-picker /
│       creation-product-picker / creation-video-picker
│
├── js/
│   ├── modules/                     # 主逻辑:页面路由+交互(28 个功能模块,逐个映射见 CLAUDE.md)
│   └── 独立交互 11 个:competitor / lapan-detail / product-detail-assets /
│       product-detail-media-cards / product-detail-media-bridge / script-library /
│       script-material-catalog / asset-audit / creation-persona-picker /
│       creation-product-picker / creation-video-picker
│
├── fragments/                       # 页面/弹窗 HTML 片段(共 32 个)
│   ├── page-*.js                    # 29 个页面(creation/pull/brands/products/promotion/...)
│   └── _modals-*.js                 # 3 个弹窗:core / promotion / content
│
└── embedded-pages/                  # 嵌入 iframe 页(图片库/创作素材/外部参考/成片视频)
    ├── 图片库.html / 创作素材.html / 外部参考视频.html / 成片视频.html
    ├── styles-*.css                 # 嵌入页全局样式 9 个:base / ai-home / pull / qianchuan /
    │                                #   pull-entry / agent / copy / structure / automation
    ├── js/                          # 嵌入页脚本 15 个:pull-* / misc-* / business / core /
    │                                #   image-library / finished-videos(逐个映射见 CLAUDE.md)
    └── 局部文件:creation-material.* / external-reference.*(-overrides) /
        finished-videos.*(-overrides) / host-embed.css
```

### 关于智能拉片结果页(page-pull)
该页由独立设计稿拆分而来,涉及三个文件协同:
- `fragments/page-pull.js` —— 页面 HTML(已去掉原独立页的顶部导航 `header.topbar`)
- `css/lapan-detail.css` —— 该页专用样式,全部选择器已加 `#page-pull` 前缀,**不影响其他页面**
- `js/lapan-detail.js` —— 该页专用交互(分镜渲染、tab 切换等),独立 IIFE 不污染全局

> 注:为避免新页面 class(如 `.page-head`、`.video-box`、`.tab`)与全局冲突,样式与脚本均作用域隔离在 `#page-pull` 内。原有的拉片页旧交互绑定已用 `if(backToEntry)` 守卫跳过(新页面无该元素),其余逻辑未改。

## 如何预览

**双击 `index.html` 即可**(无需本地服务器)。所有片段通过 `<script src>` 同步加载,file:// 协议下正常工作。

## 改某处 → 改哪个文件(速查表)

| 需求 | 修改文件 |
|------|---------|
| 全局样式(颜色/间距/布局/组件) | `css/main-*.css`(10 个文件,见 CLAUDE.md 速查表) |
| 竞品分析弹窗样式 | `css/competitor.css` |
| 智能拉片结果页样式 | `css/lapan-detail.css` |
| 页面切换 / 通用交互逻辑 | `js/modules/`(见 CLAUDE.md 速查表) |
| 竞品分析交互逻辑 | `js/competitor.js` |
| 智能拉片结果页交互 | `js/lapan-detail.js` |
| 某个页面内容(如品牌库) | `fragments/page-brands.js` |
| 智能拉片结果页内容 | `fragments/page-pull.js` |
| 产品、品牌、创作弹窗 | `fragments/_modals-core.js` |
| 推广自动化弹窗 | `fragments/_modals-promotion.js` |
| 文案、模板、脚本弹窗 | `fragments/_modals-content.js` |
| 创作素材结构 / 样式 / 交互 | `embedded-pages/创作素材.html` / `creation-material.css` / `creation-material.js` |
| 产品详情媒体卡片 / 跨视频库交互 | `js/product-detail-media-cards.js` / `product-detail-media-bridge.js` |
| 导航菜单 / 顶部栏 / 账户选择器 | `index.html` |

> 页面对应文件名规则:`fragments/page-{页面id}.js`。页面 id 见导航按钮的 `data-page` 属性。

## 修改页面 HTML 的注意事项

fragment 文件结构如下,HTML 包在反引号(`` ` ``)之间:

```js
(function(){var s=document.currentScript;if(!s)return;s.insertAdjacentHTML('beforebegin',`

      <section class="page" id="page-brands">
        ...这里是原样 HTML,可直接编辑...
      </section>`);})();
```

修改时:
- ✅ 正常编辑反引号之间的 HTML 即可,所见即所得
- ⚠️ 避免在 HTML 中引入反引号 `` ` ``、`${`、反斜杠 `\`(若必须,需转义为 `` \` ``、`\${`、`\\`)
- ⚠️ 不要删除首尾的注入代码(第一行和最后一行的 `(function...` 与 `...)();`)

## 原理简述

- 每个 fragment 用 `document.currentScript.insertAdjacentHTML('beforebegin', ...)` 把自身 HTML 注入到 `<script src>` 标签所在位置,保证 DOM 顺序与原文件**完全一致**。
- `js/modules/*.js` 在所有片段之后按顺序加载,此时 DOM 已完整,共享全局作用域,原逻辑无需任何改动。
- 已通过三层校验:静态 DOM 还原(216998 字符一致)、运行时模拟执行(206496 字符一致)、文件结构核对。

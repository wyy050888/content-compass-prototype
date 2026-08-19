# 内容罗盘原型 · Claude 工作地图

一个面向兴趣电商团队的 AI 内容生产与经营增长平台**静态 HTML 原型**（双击 `index.html` 即开，无构建、无服务器）。

## 核心规则（先读这个）

1. **改主逻辑去 `js/modules/`，不要改 `js/app.js`**。`js/app.js` 是拆分前的旧文件，已废弃，仅作回退参考。
2. `js/modules/` 下 10 个文件是**共享同一个全局作用域**的经典脚本，`index.html` 按顺序加载。**切分点都是顶层函数/注释边界，模块之间函数互相引用、共享 `let/const` 状态，不需要 import/export。**
3. 新增/修改功能时，只改它所属的那个模块文件，别动其他模块。每个模块独立 `?v=` 版本号做缓存刷新。
4. 中文内容一律 UTF-8 读写；避免引入反引号模板串里的 `` `${` ``/`` ` ``/`\` 未转义（fragments 同理）。
5. 改完用 `node --check` 验语法；拆分类大动作用「拼接字节一致 + 共享作用域 smoke test」验等价（见文末）。

## 改哪里 → 改哪个文件

| 需求 | 文件 |
|---|---|
| 路由 `switchPage`、侧栏收起/展开、顶栏账户选择器、推广账户侧栏 | `js/modules/app-shell.js` |
| 智能拉片入口页：链接添加 / 素材库选择 / 本地上传 / 解析进度 / 历史记录 | `js/modules/app-pull-entry.js` |
| 拉片结果详情：复制、字段 chip、画面缩略图跳转、口播行、分镜 tab | `js/modules/app-pull-result.js` |
| AI创作：agent 选择器、新建菜单、内容结构选择、模型选择、配音选择 | `js/modules/app-creation-home.js` |
| 智能文案表单：产品选择、卖点提炼、原文建议、表单校验、文案库数据 | `js/modules/app-creation-copy.js` |
| 智能脚本 Agent：来源文案、素材库、脚本库选择器、素材弹窗 | `js/modules/app-creation-script.js` |
| 参考视频 / 文案改写 / 聊天 | `js/modules/app-creation-reference.js` |
| 智能混剪：结构选择、素材选择、混剪数据同步、行级操作 | `js/modules/app-creation-mix.js` |
| 混剪任务编排：任务步骤条、结果渲染、Agent 任务提交 | `js/modules/app-creation-task.js` |
| 经营自动化、推广配置子Tab、文案编辑/查看弹窗、组织权限、人群画像 | `js/modules/app-promotion-org.js` |
| 某个页面 HTML 片段 | `fragments/page-{page-id}.js` |
| 产品/品牌/创作弹窗 | `fragments/_modals-core.js` |
| 推广自动化弹窗 | `fragments/_modals-promotion.js` |
| 文案/模板/脚本弹窗 | `fragments/_modals-content.js` |
| 全局样式 | `css/main.css` |
| 竞品 / 拉片 / 产品详情资产 / 脚本库 等局部样式 | `css/{competitor,lapan-detail,product-detail-assets,script-library,...}.css` |
| 嵌入页（图片库/创作素材/外部参考/成片） | `embedded-pages/*.html` + `embedded-pages/*.css/js` |

## 数据源唯一性（避免复制数据）

- 内容结构（智能文案/混剪选择器）的唯一数据源是模板库 iframe（`embedded-pages/js/misc.js` 的 `contentStructures`）；`js/modules/` 里**不得维护结构名称/公式/阶段/来源的副本**，只消费桥接字段。
- 文案库数据唯一源：`js/modules/app-creation-copy.js` 的 `window.ContentCompassCopyLibrary`。
- 模板库详情由模板库自身渲染，主应用只负责开关 iframe。

## 组件复用规则

- 弹层优先 `.modal-overlay + .modal-card`；已有 `.modal-backdrop + .modal` 的功能原样维护，不新增第三种写法。
- 新页面继续放 `fragments/page-{page-id}.js`，只有导航存在对应 `data-page` 才在 `index.html` 加载。

## 已知问题（改之前先知道）

- `js/modules/app-promotion-org.js` 里 `copyStructureCatalog` **全项目从未定义**（只有引用）。它在真实浏览器里被 `renderCopyStructureLibrary()` 首行 `if (!copyStructureTbody) return` 提前返回掩盖（`#copyStructureTbody` DOM 不存在）。若以后要接这个「文案结构库」功能，需先补 `copyStructureCatalog` 数据定义。

## 拆分校验方法（改拆分结构时用）

```bash
# 1) 语法完整
for f in js/modules/*.js; do node --check "$f" || echo "FAIL $f"; done
# 2) 拼接字节 == 原 app.js（若 app.js 仍在）
cat js/modules/*.js | cmp - js/app.js && echo 一致
# 3) 共享作用域 smoke test：用 node vm 按顺序 runInContext 加载 10 个模块，
#    原 app.js 与拆分后 modules 报相同的错误即为等价（对照实验）。
```

## 版本号约定

`index.html` 里每个 `<link>`/`<script>` 带 `?v=YYYYMMDDx` 缓存戳，改哪个文件就只 bump 那个文件的戳。

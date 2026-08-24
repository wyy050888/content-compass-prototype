/* 智能拉片结果详情页交互(独立 IIFE,不污染全局)*/
(() => {

const TAG_COLORS = {
  "氛围烘托": "tag-purple",
  "用户痛点": "tag-blue",
  "产品介绍": "tag-orange",
  "营销卖点": "tag-red",
  "产品功效": "tag-cyan",
  "适用人群": "tag-blue",
  "营销活动": "tag-orange"
};

const shots = [
  {
    no: 1, time: "00:00–00:04", dur: "4秒", g: "g1",
    tags: ["氛围烘托", "用户痛点"],
    desc: "穿白色长款上衣的女性手拿康佳除螨仪,在床上来回移动操作,展示除螨仪的使用",
    script: "这不吸真是不知道啊,真没想到我每天竟然跟这些东西睡在一起。",
    tone: "惊讶生活化",
    scene: "卧室、布置精致的卧室,有带金色雕花床头的床、床头柜及绿植",
    lens: ["拍摄角度:平视", "景别:中景", "运镜:固定"]
  },
  {
    no: 2, time: "00:04–00:09", dur: "4秒", g: "g2",
    tags: ["用户痛点"],
    desc: "特写除螨仪集尘盒内的脏污,女性手指指向集尘盒,随后继续用除螨仪在床面来回移动",
    script: "这秋天呢,可是螨虫的高发期,家里床上的螨虫数量就非常大。",
    tone: "细致讲解",
    scene: "卧室、卧室床面,铺有带花纹的浅棕色床单",
    lens: ["拍摄角度:平视+俯拍", "景别:特写+中景", "运镜:固定"]
  },
  {
    no: 3, time: "00:09–00:11", dur: "2秒", g: "g3",
    tags: ["用户痛点", "氛围烘托"],
    desc: "女性拆开除螨仪集尘盒,展示内部滤芯上附着的毛发与脏污",
    script: "螨虫呢,也是我们肉眼看不见的。",
    tone: "–",
    scene: "卧室、卧室床面,铺有浅粉色床品",
    lens: ["拍摄角度:俯拍", "景别:特写", "运镜:固定"]
  },
  {
    no: 4, time: "00:11–00:18", dur: "7秒", g: "g4",
    tags: ["用户痛点", "氛围烘托", "产品介绍", "营销卖点"],
    desc: "女性坐在床边手持除螨仪介绍,随后展示除螨仪底部的紫外线灯及清洁刷",
    script: "咱们家里记着啊,一定要除螨,我们家除螨一直都用这个康佳的除螨仪,它有1万帕的超大吸力,",
    tone: "专业讲解",
    scene: "卧室、布置精致的卧室,有带金色雕花床头的床",
    lens: ["拍摄角度:平视", "景别:中景+特写", "运镜:固定"]
  },
  {
    no: 5, time: "00:18–00:24", dur: "6秒", g: "g5",
    tags: ["营销卖点"],
    desc: "手持除螨仪吸走灰色布面上的毛发,随后吸走透明板上的杂粮颗粒",
    script: "被褥表面的毛发一推一拉就吸得干干净净的,就算是深层的螨虫,你也不用担心,",
    tone: "–",
    scene: "室内、展示除螨仪吸力的实验场景",
    lens: ["拍摄角度:平视+俯拍", "景别:中景+特写", "运镜:固定"]
  },
  {
    no: 6, time: "00:24–00:29", dur: "4秒", g: "g6",
    tags: ["营销卖点", "产品功效"],
    desc: "除螨仪在白色床面移动,动画演示震出螨虫,随后展示内部紫外线杀菌的动画效果",
    script: "它是这种双排打头的,每分钟能发出上万次的强劲震动。",
    tone: "–",
    scene: "卧室、卧室白色床面,搭配动画演示场景",
    lens: ["拍摄角度:平视", "景别:中景+动画特写", "运镜:固定"]
  },
  {
    no: 7, time: "00:29–00:31", dur: "2秒", g: "g7",
    tags: [],
    desc: "特写除螨仪集尘盒内吸入的脏污,随后女性坐在床边用除螨仪操作",
    script: "就算你螨虫藏得再深,也全都能震出来吸走。",
    tone: "惊讶讲解",
    scene: "卧室、布置精致的卧室床面",
    lens: ["拍摄角度:平视", "景别:特写+中景", "运镜:固定"]
  },
  {
    no: 8, time: "00:31–00:35", dur: "4秒", g: "g8",
    tags: [],
    desc: "手持除螨仪吸附织物表面,随后女性坐在床边继续用除螨仪在抱枕上操作",
    script: "这个是我昨天刚换的,没想到吸出来这么多脏东西。",
    tone: "亲切提醒",
    scene: "卧室、卧室床面及抱枕",
    lens: ["拍摄角度:平视", "景别:特写+中景", "运镜:固定"]
  }
];

const grid = document.getElementById("shotsGrid");
grid.style.gridTemplateColumns = `56px repeat(${shots.length}, 232px)`;

const vLabel = t => t.split("").join("<br>");
let html = "";

// 画面分析(跨 编号/缩略图/时间/标签 4 行)
html += `<div class="cell rowlabel" style="grid-row: span 4;">${vLabel("画面分析")}</div>`;
shots.forEach(s => html += `<div class="cell shot-head">分镜${s.no}</div>`);
shots.forEach(s => html += `
  <div class="cell shot-thumb-cell">
    <div class="shot-thumb ${s.g}">
      <span class="wm">仅供学习参考</span>
      <span class="dur">${s.dur}</span>
    </div>
  </div>`);
shots.forEach(s => html += `<div class="cell shot-time">${s.time}</div>`);
shots.forEach(s => html += `
  <div class="cell tag-cell">${s.tags.map(t =>
    `<span class="tag ${TAG_COLORS[t] || ""}">${t}</span>`).join("") || "&nbsp;"}</div>`);

html += `<div class="cell rowlabel">${vLabel("画面描述")}</div>`;
shots.forEach(s => html += `<div class="cell">${s.desc}</div>`);

html += `<div class="cell rowlabel">脚本</div>`;
shots.forEach(s => html += `<div class="cell">${s.script}</div>`);

html += `<div class="cell rowlabel">${vLabel("表达方式")}</div>`;
shots.forEach(s => html += `<div class="cell">${s.tone}</div>`);

html += `<div class="cell rowlabel">场景</div>`;
shots.forEach(s => html += `<div class="cell">${s.scene}</div>`);

html += `<div class="cell rowlabel">镜头</div>`;
shots.forEach(s => html += `<div class="cell" style="color:#8f959e;">${s.lens.join("<br>")}</div>`);

grid.innerHTML = html;

// ===== 画面逐帧 =====
const FRAME_COUNT = 27; // 00:00 - 00:26
const gradNames = ["g1","g2","g3","g4","g5","g6","g7","g8"];
const copySvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/></svg>`;

let framesHtml = "";
for (let i = 0; i < FRAME_COUNT; i++) {
  const t = "00:" + String(i).padStart(2, "0");
  framesHtml += `
    <div class="frame-item">
      <div class="frame-thumb ${gradNames[i % gradNames.length]}">
        <span class="no">${i + 1}</span>
        <span class="ops"><button type="button" class="frame-copy" data-frame-index="${i}" aria-label="复制第 ${i + 1} 帧图片" title="复制此帧图片">${copySvg}</button></span>
      </div>
      <div class="frame-time">${t}</div>
    </div>`;
}
document.getElementById("framesGrid").innerHTML = framesHtml;

const frameGradients = {
  g1: ["#e88770", "#d56393"], g2: ["#5a8fd8", "#7a78e0"],
  g3: ["#46b8a8", "#4f8de0"], g4: ["#d1a34a", "#d9765a"],
  g5: ["#806cc4", "#bc7195"], g6: ["#77ae78", "#4f89a5"],
  g7: ["#bd776b", "#765f99"], g8: ["#6f88a6", "#5f7188"]
};

async function copyFrameImage(button) {
  const thumb = button.closest(".frame-thumb");
  const gradientName = [...thumb.classList].find(name => frameGradients[name]);
  const colors = frameGradients[gradientName] || frameGradients.g1;
  const canvas = document.createElement("canvas");
  canvas.width = 360; canvas.height = 288;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, colors[0]); gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob || !navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("clipboard unavailable");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

document.getElementById("framesGrid").addEventListener("click", async event => {
  const button = event.target.closest(".frame-copy");
  if (!button) return;
  try {
    await copyFrameImage(button);
    button.title = "已复制";
    if (typeof showToast === "function") showToast("图片已复制到剪贴板");
  } catch {
    button.title = "当前浏览器不支持复制图片";
    if (typeof showToast === "function") showToast("当前浏览器不支持复制图片");
  }
});

// ===== 角标悬浮提示:出现在第X个镜头 =====
// 必须挂到 #page-pull 内部,CSS 选择器 #page-pull .chip-tip 才能匹配
const chipTip = document.createElement("div");
chipTip.className = "chip-tip";
const _pagePull = document.getElementById("page-pull");
(_pagePull || document.body).appendChild(chipTip);

document.querySelectorAll("#page-pull .ref-num").forEach(chip => {
  const n = chip.textContent.trim();
  chip.title = `出现在第${n}个镜头`; // 原生 tooltip 兜底
  chip.addEventListener("mouseenter", () => {
    chipTip.textContent = `出现在第${n}个镜头`;
    const r = chip.getBoundingClientRect();
    chipTip.style.left = (r.left + r.width / 2) + "px";
    chipTip.style.top = (r.top - 8) + "px";
    chipTip.classList.add("show");
  });
  chip.addEventListener("mouseleave", () => chipTip.classList.remove("show"));
});

// ===== Tab 切换 =====
const tabs = document.querySelectorAll("#page-pull .tab");
const shotsWrap = document.getElementById("shotsWrap");
const framesWrap = document.getElementById("framesWrap");
const mainCard = document.querySelector("#page-pull .main-card");
const pageHead = document.querySelector("#page-pull .page-head");

tabs.forEach((t, idx) => {
  t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    const isFrames = idx === 1;
    shotsWrap.style.display = isFrames ? "none" : "";
    framesWrap.style.display = isFrames ? "block" : "none";
    mainCard.style.display = isFrames ? "none" : "";
    pageHead.style.display = isFrames ? "none" : "";
  });
});

  // 返回拉片入口列表(对应原 backToEntry)
  var _backBtn = document.getElementById("lpBackBtn");
  if (_backBtn) _backBtn.addEventListener("click", function () {
    if (typeof switchPage === "function") switchPage("pull-entry");
  });

// ===== 下载与保存爆款内容结构 =====
document.getElementById("downloadPullResult")?.addEventListener("click", () => {
  const payload = {
    source: document.getElementById("resultSource")?.textContent || "—",
    formula: document.querySelector("#page-pull .sum-row .val")?.textContent?.trim() || "",
    shots: shots.map(item => ({ no:item.no, time:item.time, tags:item.tags, desc:item.desc, script:item.script }))
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "爆款拆解结果.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 800);
  if (typeof showToast === "function") showToast("拆解结果已开始下载");
});

document.getElementById("downloadPullSource")?.addEventListener("click", () => {
  if (typeof showToast === "function") showToast("原视频下载已开始（演示）");
});

const structureDraft = {
  name:"除螨仪结果直给型内容结构",
  formula:"结果冲击 → 痛点解释 → 产品演示 → 多场景证明 → 行动引导",
  savedSignature:"",
  stages:[
    { name:"结果冲击", template:"先展示可视化结果，再提出反常识问题。", visual:"开场使用结果特写，主体居中，前 3 秒完成冲击。", edit:"快速切入，重点词与结果画面同步。" },
    { name:"痛点解释", template:"说明问题为什么容易被忽略，以及会影响谁。", visual:"生活场景与脏污细节交替，保留证据画面。", edit:"中快节奏，按语义切分镜头。" },
    { name:"产品演示", template:"用真实操作展示解决过程，不堆砌参数。", visual:"全景交代动作，特写展示关键功能与结果。", edit:"动作连续，功能点与口播逐项对齐。" },
    { name:"行动引导", template:"总结适用人群和场景，引导查看完整信息。", visual:"产品定帧、品牌露出和清晰行动入口。", edit:"节奏收束，尾帧保留足够阅读时间。" }
  ]
};

function structureEscape(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function structureStageMarkup(stage, index, total) {
  return `<article class="pull-structure-stage" data-structure-stage="${index}"><header><div><span>阶段 ${index + 1}</span><strong>${structureEscape(stage.name || "未命名阶段")}</strong></div><div><button type="button" data-stage-move="up" ${index === 0 ? "disabled" : ""}>上移</button><button type="button" data-stage-move="down" ${index === total - 1 ? "disabled" : ""}>下移</button><button class="danger" type="button" data-stage-delete ${total <= 2 ? "disabled" : ""}>删除</button></div></header><div class="pull-structure-stage-grid"><label>阶段名称 *<input value="${structureEscape(stage.name)}" maxlength="60" data-stage-field="name"></label><label class="wide">表达模板 *<textarea maxlength="300" data-stage-field="template">${structureEscape(stage.template)}</textarea></label><label>画面要求 *<textarea maxlength="300" data-stage-field="visual">${structureEscape(stage.visual)}</textarea></label><label>剪辑要求 *<textarea maxlength="300" data-stage-field="edit">${structureEscape(stage.edit)}</textarea></label></div><small>来源证据：分镜 ${Math.min(index + 1, shots.length)} · ${structureEscape(shots[Math.min(index, shots.length - 1)]?.time || "—")} · 只读证据摘要</small></article>`;
}

function structureSignature() {
  return JSON.stringify({ name:structureDraft.name.trim(), formula:structureDraft.formula.trim(), stages:structureDraft.stages });
}

function syncStructureSaveState(modal) {
  const saved = structureDraft.savedSignature && structureDraft.savedSignature === structureSignature();
  const footerSave = modal.querySelector("[data-structure-save]");
  const entry = document.getElementById("savePullStructure");
  if (footerSave) {
    footerSave.textContent = saved ? "已保存" : (structureDraft.savedSignature ? "保存更新" : "保存到模板库");
    footerSave.disabled = Boolean(saved);
  }
  if (entry) entry.textContent = saved ? "已保存" : (structureDraft.savedSignature ? "保存更新" : "保存为爆款内容结构");
}

function renderStructureStages(modal) {
  modal.querySelector("[data-structure-stage-list]").innerHTML = structureDraft.stages.map((stage, index) => structureStageMarkup(stage, index, structureDraft.stages.length)).join("");
  syncStructureSaveState(modal);
}

function openStructureEditor() {
  const overlay = document.createElement("div");
  overlay.className = "pull-structure-overlay";
  overlay.innerHTML = `<section class="pull-structure-modal" role="dialog" aria-modal="true" aria-label="保存为爆款内容结构"><header class="pull-structure-head"><div><span>爆款拆解沉淀</span><h3>保存为爆款内容结构</h3><p>只沉淀结构、节奏和镜头方法，不复制参考视频原句与画面。</p></div><button type="button" data-structure-close>×</button></header><div class="pull-structure-body"><div class="pull-structure-base"><label>结构名称 *<input data-structure-name maxlength="100" value="${structureEscape(structureDraft.name)}"></label><label>内容公式 *<textarea data-structure-formula maxlength="500">${structureEscape(structureDraft.formula)}</textarea></label><div><span>来源</span><strong>爆款拆解沉淀 · 当前解析结果</strong></div></div><div class="pull-structure-stage-title"><div><strong>结构阶段</strong><small>至少保留 2 个完整阶段；来源证据只读</small></div><button type="button" data-stage-add>＋ 新增阶段</button></div><div class="pull-structure-stage-list" data-structure-stage-list></div><div class="pull-structure-error" data-structure-error hidden></div></div><footer><span>首次保存创建资产，后续保存更新同一资产</span><div><button type="button" data-structure-close>取消</button><button class="primary" type="button" data-structure-save>保存到模板库</button></div></footer></section>`;
  document.body.append(overlay);
  renderStructureStages(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener("click", event => {
    if (event.target === overlay || event.target.closest("[data-structure-close]")) return close();
    if (event.target.closest("[data-stage-add]")) {
      structureDraft.stages.push({ name:"新阶段", template:"", visual:"", edit:"" });
      renderStructureStages(overlay);
      overlay.querySelector(`[data-structure-stage="${structureDraft.stages.length - 1}"]`)?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    const stageNode = event.target.closest("[data-structure-stage]");
    if (!stageNode) return;
    const index = Number(stageNode.dataset.structureStage);
    if (event.target.closest("[data-stage-delete]")) {
      if (structureDraft.stages.length <= 2) return;
      structureDraft.stages.splice(index, 1);
      renderStructureStages(overlay);
      return;
    }
    const move = event.target.closest("[data-stage-move]")?.dataset.stageMove;
    if (move) {
      const target = move === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= structureDraft.stages.length) return;
      [structureDraft.stages[index], structureDraft.stages[target]] = [structureDraft.stages[target], structureDraft.stages[index]];
      renderStructureStages(overlay);
    }
  });
  overlay.addEventListener("input", event => {
    if (event.target.matches("[data-structure-name]")) structureDraft.name = event.target.value;
    if (event.target.matches("[data-structure-formula]")) structureDraft.formula = event.target.value;
    const field = event.target.dataset.stageField;
    const stageNode = event.target.closest("[data-structure-stage]");
    if (field && stageNode) {
      const stage = structureDraft.stages[Number(stageNode.dataset.structureStage)];
      if (stage) stage[field] = event.target.value;
      if (field === "name") stageNode.querySelector("header strong").textContent = event.target.value.trim() || "未命名阶段";
    }
    syncStructureSaveState(overlay);
  });
  overlay.querySelector("[data-structure-save]").addEventListener("click", () => {
    const error = overlay.querySelector("[data-structure-error]");
    const invalidStage = structureDraft.stages.findIndex(stage => !stage.name.trim() || !stage.template.trim() || !stage.visual.trim() || !stage.edit.trim());
    let message = "";
    if (!structureDraft.name.trim() || structureDraft.name.trim().length > 100) message = "请输入 1～100 个字符的结构名称。";
    else if (!structureDraft.formula.trim() || structureDraft.formula.trim().length > 500) message = "请输入 1～500 个字符的内容公式。";
    else if (structureDraft.stages.length < 2) message = "至少保留 2 个结构阶段。";
    else if (invalidStage >= 0) message = `请补全阶段 ${invalidStage + 1} 的名称、表达模板、画面要求和剪辑要求。`;
    if (message) {
      error.hidden = false;
      error.textContent = message;
      if (invalidStage >= 0) overlay.querySelector(`[data-structure-stage="${invalidStage}"]`)?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    error.hidden = true;
    structureDraft.savedSignature = structureSignature();
    syncStructureSaveState(overlay);
    if (typeof showToast === "function") showToast("已保存到模板库 · 爆款内容结构");
  });
}

document.getElementById("savePullStructure")?.addEventListener("click", openStructureEditor);

})();

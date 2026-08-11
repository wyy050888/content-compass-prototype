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

})();

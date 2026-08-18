(() => {
  const root = document.getElementById("page-script-library");
  if (!root) return;
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => {
    const d = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `${d.getFullYear() === 2026 ? "" : `${d.getFullYear()}/`}${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const baseRows = (mode = "depend") => [
    { id:1, time:"00—03s", voice:"刚换的床单，也能吸出一杯脏东西。", shotType:"特写", cameraMove:"固定", visual:"透明尘杯脏污特写，0.8 秒后切换至整洁床面，形成结果反差。", material:"M-CL-101 · 2s", videoPrompt:"透明尘杯脏污特写，毛发碎屑清晰可见，自然光，竖屏 9:16，固定镜头，3 秒。" },
    { id:2, time:"03—06s", voice:"看得见的是表面，看不见的都藏在床垫深处。", shotType:"特写", cameraMove:"推进", visual:"手掌按压床垫，切入纤维与毛发碎屑微距，镜头缓慢推进。", material:"M-CL-102 · 3s", videoPrompt:"床垫纤维微距，毛发碎屑可见，从中景推进至特写，卧室自然光，竖屏 9:16，3 秒。" },
    { id:3, time:"06—10s", voice:"轻净 Pro 一边拍打一边吸，把深处的脏东西直接带出来。", shotType:"中景", cameraMove:"平移跟拍", visual:"真人手持产品在床垫上匀速推进，补充底部与床面接触的近景。", material:"M-PE-202 · 4s", videoPrompt:"真人手持轻净 Pro 在床垫表面匀速推进，侧面平移跟拍，真实使用感，竖屏 9:16，4 秒。" },
    { id:4, time:"10—14s", voice:"推过的地方，毛发和细小碎屑都会进到透明尘杯里。", shotType:"近景", cameraMove:"推进", visual:"床面推进与尘杯内部变化交叉剪辑，最后停留在吸入后的尘杯结果。", material:"M-CL-103 · 4s", videoPrompt:"透明尘杯内部变化过程，毛发碎屑逐渐累积，固定近景，竖屏 9:16，4 秒。" }
  ].map(row => ({ ...row, material: mode === "depend" ? row.material : "" }));

  // 抖音八大人群(与智能脚本 agent 的 personaCatalog 保持一致,后续可改为从全局数据源拉取)
  const SCRIPT_AUDIENCE_OPTIONS = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
  const SCRIPT_GENDER_OPTIONS = ["不限", "女性", "男性"];
  const SCRIPT_AGE_OPTIONS = ["18-23", "24-30", "31-40", "41-50", "50+"];
  // 产品 → 默认人群三件套(参照 personaCatalog,缺省时使用,新脚本在编辑表单中可手动改)
  const PRODUCT_PERSONA_DEFAULTS = {
    "轻净 Pro 除螨仪": { audience: "精致妈妈", gender: "女性", age: "24-30" },
    "轻享空气炸锅 A8": { audience: "新锐白领", gender: "不限", age: "24-30" },
    "净界洗地机 S5": { audience: "资深中产", gender: "不限", age: "31-40" }
  };
  const productPersonaDefault = product => PRODUCT_PERSONA_DEFAULTS[product] || { audience: SCRIPT_AUDIENCE_OPTIONS[0], gender: SCRIPT_GENDER_OPTIONS[0], age: SCRIPT_AGE_OPTIONS[1] };
  const isStandardAge = value => SCRIPT_AGE_OPTIONS.includes(value) || /^(\d+)-(\d+)$/.test(String(value || ""));
  const sanitizePersona = (raw, fallback) => {
    const f = fallback || productPersonaDefault("");
    return {
      audience: SCRIPT_AUDIENCE_OPTIONS.includes(raw?.audience) ? raw.audience : f.audience,
      gender: SCRIPT_GENDER_OPTIONS.includes(raw?.gender) ? raw.gender : (f.gender || SCRIPT_GENDER_OPTIONS[0]),
      age: isStandardAge(raw?.age) ? raw.age : (f.age || SCRIPT_AGE_OPTIONS[1]),
      sourcePersonaId: raw?.sourcePersonaId || null
    };
  };
  // 兼容老数据(单对象 audience/gender/age):把旧字段折叠成 1 个 group
  const normalizePersonas = script => {
    if (Array.isArray(script.personas) && script.personas.length) {
      return script.personas.map(p => sanitizePersona(p, sanitizePersona(script)));
    }
    const fallback = productPersonaDefault(script.product);
    return [sanitizePersona({ audience: script.audience, gender: script.gender, age: script.age, sourcePersonaId: script.sourcePersonaId }, fallback)];
  };
  const audiencePillHtml = value => value ? `<span class="sl-audience-pill" data-audience="${escapeHtml(value)}">${escapeHtml(value)}</span>` : `<span class="sl-audience-empty">未设置</span>`;
  // 表格用：多组以 "/" 隔开,只显示 8 大人群名(人群 N 序号仅在编辑/查看里给我看)
  const personasTableHtml = personas => {
    if (!personas.length) return '<span class="sl-audience-empty">未设置</span>';
    if (personas.length === 1) return audiencePillHtml(personas[0].audience);
    const parts = personas.map(p => audiencePillHtml(p.audience));
    return parts.join('<span class="sl-audience-sep">/</span>');
  };
  // 视图(只读)：每组带"人群 N"序号,显示 audience + 性别 + 年龄
  const personasViewHtml = personas => {
    if (!personas.length) return '<div class="sl-persona-empty">未设置人群</div>';
    return `<ul class="sl-persona-list">${personas.map((p, i) => `<li class="sl-persona-item"><span class="sl-persona-seq">人群 ${i + 1}</span><span class="sl-persona-audience">${audiencePillHtml(p.audience)}</span><span class="sl-persona-meta">${escapeHtml(p.gender || "—")} · ${escapeHtml(p.age || "—")}</span></li>`).join("")}</ul>`;
  };
  // 单个人群 chip 行
  const slPersonaPillRowHtml = (options, current, valueAttr = "data-value") => options.map(value => {
    const active = value === current;
    return `<button type="button" class="sl-pp-pill${active ? " active" : ""}" ${valueAttr}="${escapeHtml(value)}">${escapeHtml(value)}</button>`;
  }).join("");

  let scripts = [
    { id:"sl-001", sessionId:"session-mite-summer", name:"轻净 Pro 除螨仪_脚本_20260807", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"女性", age:"24-30", personas:[{audience:"精致妈妈",gender:"女性",age:"24-30",sourcePersonaId:"persona-mom"}], source:"刚换的床单，也能吸出一杯脏东西。看得见的是表面，看不见的都藏在床垫深处。", sourceFull:"刚换的床单，也能吸出一杯脏东西。看得见的是表面，看不见的都藏在床垫深处。轻净 Pro 边拍边吸，脏东西直接进尘杯，用完还能拆下水洗。", duration:60, ratio:"9:16", materialMode:"depend", materialStatus:"4/4 已匹配", createdBy:"嗡大发", createdAt:"08/04 14:20", updatedBy:"嗡大发", updated:"08/11 14:32", rows:baseRows("depend") },
    { id:"sl-002", sessionId:"session-mite-summer", name:"轻净 Pro 除螨仪_脚本_20260806", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"女性", age:"31-40", personas:[{audience:"精致妈妈",gender:"女性",age:"31-40",sourcePersonaId:"persona-pet"}], source:"床单刚换一周，第一遍照样能吸出碎屑和毛发。", sourceFull:"床单刚换一周，第一遍照样能吸出碎屑和毛发。床垫深处的脏东西，普通清理根本触达不到。轻净 Pro 拍打吸尘同步完成，尘杯可水洗。", duration:30, ratio:"9:16", materialMode:"free", materialStatus:"已生成提示词", createdBy:"李四", createdAt:"08/03 11:07", updatedBy:"李四", updated:"08/10 18:16", rows:baseRows("free") },
    { id:"sl-003", sessionId:"session-air-fryer-copy", name:"轻享空气炸锅 A8_快手晚餐脚本", product:"轻享空气炸锅 A8", audience:"新锐白领", gender:"不限", age:"24-30", personas:[{audience:"新锐白领",gender:"不限",age:"24-30",sourcePersonaId:"persona-whitecollar"}], source:"下班回家不想洗一堆锅，晚饭就用这一台解决。", sourceFull:"下班回家不想洗一堆锅，晚饭就用这一台解决。食材放进去，定好时间，外酥里嫩的一餐就能直接上桌。", duration:45, ratio:"9:16", materialMode:"depend", materialStatus:"4/4 已匹配", createdBy:"嗡大发", createdAt:"08/04 14:20", updatedBy:"嗡大发", updated:"08/05 10:20", rows:baseRows("depend") },
    { id:"sl-004", sessionId:"session-washer-script", name:"净界洗地机 S5_夏季清爽脚本", product:"净界洗地机 S5", audience:"资深中产", gender:"不限", age:"31-40", personas:[{audience:"资深中产",gender:"不限",age:"31-40",sourcePersonaId:"persona-family"},{audience:"精致妈妈",gender:"女性",age:"31-40",sourcePersonaId:null}], source:"地上看着干净，拖一遍才知道脏东西有多少。", sourceFull:"地上看着干净，拖一遍才知道脏东西，净界洗地机 S5 洗拖同步，把日常地面清洁变成一件更省心的事。", duration:30, ratio:"16:9", materialMode:"free", materialStatus:"已生成提示词", createdBy:"李四", createdAt:"08/03 11:07", updatedBy:"李四", updated:"08/03 16:08", rows:baseRows("free") }
  ];

  const modal = (title, subtitle, body, footer = "", small = false) => {
    const host = document.createElement("div");
    host.className = "sl-modal show";
    host.innerHTML = `<div class="sl-modal-backdrop" data-close></div><section class="sl-modal-card${small ? " small" : ""}" role="dialog" aria-modal="true"><header class="sl-modal-head"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}</div><button class="sl-modal-close" type="button" aria-label="关闭" data-close>×</button></header><div class="sl-modal-body">${body}</div>${footer ? `<footer class="sl-modal-foot">${footer}</footer>` : ""}</section>`;
    document.body.appendChild(host);
    host.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => host.remove()));
    return host;
  };
  const toast = text => {
    const el = document.createElement("div");
    el.className = "sl-toast";
    el.textContent = text;
    Object.assign(el.style, { position:"fixed", zIndex:"100300", left:"50%", bottom:"32px", transform:"translateX(-50%)", padding:"10px 14px", borderRadius:"8px", color:"#fff", fontSize:"13px", background:"#342c42", boxShadow:"0 8px 22px rgba(30,22,43,.25)" });
    document.body.appendChild(el); setTimeout(() => el.remove(), 1800);
  };
  const modeText = mode => mode === "depend" ? "依赖素材库" : "不依赖素材库";
  const materialStatus = script => script.materialMode === "depend" ? script.materialStatus || `${script.rows.length}/${script.rows.length} 已匹配` : "已生成提示词";
  const specs = script => `${script.ratio} · ${script.duration}s · ${script.rows.length} 镜头`;
  const notifyChange = () => window.dispatchEvent(new CustomEvent("content-compass:scripts-updated"));
  // 产品下拉选项(与产品库 / 文案库 / PDA 共享, 后续可改为从全局数据源拉取)
  const productOptions = ["轻净 Pro 除螨仪", "轻享空气炸锅 A8", "净界洗地机 S5"];
  const productOptionsHtml = (current = "") => {
    const list = current && !productOptions.includes(current) ? [current, ...productOptions] : productOptions;
    return list.map(name => `<option value="${escapeHtml(name)}" ${name === current ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
  };
  // 解析 "00—03s" / "06—10s" 为秒数(用于素材方案匹配)
  const parseShotSeconds = timeText => {
    const match = String(timeText || "").match(/(\d+)\s*[-—]\s*(\d+)/);
    if (!match) return 0;
    return Math.max(1, Number(match[2]) - Number(match[1]));
  };
  // 取一个脚本的素材池(优先 materialIds;没有则全量)
  const scriptMaterialPoolIds = script => {
    const ids = script.materialIds?.length ? script.materialIds : null;
    if (ids) return ids;
    return window.ScriptMaterialLib?.allScriptMaterials().map(item => item.id) || [];
  };
  // 走共享 buildMaterialPlan 拿推荐(与智能脚本最后结果页完全同源)
  const buildScriptMaterialPlan = (script, rowIndex) => {
    const lib = window.ScriptMaterialLib;
    if (!lib) return [];
    const row = script.rows[rowIndex];
    if (!row) return [];
    const shotDuration = parseShotSeconds(row.time);
    const groupIds = scriptMaterialPoolIds(script);
    const plans = lib.buildMaterialPlan(shotDuration, groupIds);
    const override = row.materialOverride;
    if (!override) return plans;
    const overridden = lib.findScriptMaterial(override);
    if (!overridden) return plans;
    const head = [{ ...overridden, useDuration: shotDuration }];
    return [{ planId: "当前匹配", items: head, duration: shotDuration }, ...plans.filter(p => p.items[0].id !== override)];
  };
  // 镜头 → 素材卡片 HTML(对齐智能脚本结果页:紫色封面 + ID + 名字 + 时长 + 标签)
  const renderShotMaterialCard = (item, itemIdx, total) => {
    const useDur = (item.useDuration || item.duration || 0);
    const meta = `${useDur.toFixed(1)}s${item.clipped ? " · 截取" : ""}`;
    const tags = (item.tags || []).slice(0, 2).map(tag => escapeHtml(tag)).join(" · ");
    const cover = escapeHtml(item.id);
    return `<div class="sl-shot-material-item">
      <div class="sl-shot-material-cover">${cover}</div>
      <div class="sl-shot-material-info">
        <strong>${escapeHtml(item.name || item.id)}</strong>
        <small>${meta}${tags ? ` · ${tags}` : ""}</small>
        <span class="sl-shot-material-replace-hint">点击替换</span>
      </div>
      ${itemIdx < total - 1 ? '<i class="sl-shot-material-plus">＋</i>' : ""}
    </div>`;
  };
  // 把素材写回 script.rows[rowIndex] + 同步景别/运镜/画面描述
  const applyScriptMaterial = (script, rowIndex, material) => {
    const row = script.rows[rowIndex];
    if (!row || !material) return;
    const group = material.group || "";
    const shotFields = (() => {
      if (group === "产品特写") return { shotType: "特写", cameraMove: "固定", visual: `${material.name}，突出产品细节与可验证的使用结果。` };
      if (group === "产品全景") return { shotType: "全景", cameraMove: "平移跟拍", visual: `${material.name}，展示真实家庭使用场景与产品整体动作。` };
      if (group === "使用场景") return { shotType: "中景", cameraMove: "推进", visual: `${material.name}，从环境推进至用户实际操作过程。` };
      if (group === "痛点对比") return { shotType: "近景", cameraMove: "固定", visual: `${material.name}，清楚呈现问题或清洁前后差异。` };
      return { shotType: "全景", cameraMove: "拉远", visual: `${material.name || "品牌收口素材"}，完成品牌露出与行动引导。` };
    })();
    Object.assign(row, shotFields, {
      materialOverride: material.id,
      materialIds: [material.id],
      material: `${material.id} · ${(material.useDuration || material.duration || 0).toFixed(1)}s`,
      materialCropStart: null,
      materialCropEnd: null,
      materialUseDuration: material.useDuration || null
    });
    notifyChange();
  };
  // 给查看弹窗绑定"AI 换一组" + 点击素材卡片替换
  function bindScriptMaterialReplace(host, script) {
    if (script.materialMode !== "depend") return;
    const lib = window.ScriptMaterialLib;
    if (!lib) return;
    host.querySelectorAll("[data-shot-material-cell]").forEach(cell => {
      const tr = cell.closest("tr");
      const rowIndex = Number(tr?.dataset.shotIdx);
      const row = script.rows[rowIndex];
      if (!row) return;
      let planIdx = 0;
      const rerender = () => {
        const plans = buildScriptMaterialPlan(script, rowIndex);
        if (!plans.length) {
          cell.innerHTML = `<div class="sl-shot-material-empty">该分组下无匹配素材</div>`;
          return;
        }
        planIdx = ((planIdx % plans.length) + plans.length) % plans.length;
        const plan = plans[planIdx];
        cell.innerHTML = `<button class="sl-shot-ai-switch" type="button" data-sl-shot-ai-switch>✦ AI 换一组</button><div class="sl-shot-material-list">${plan.items.map((it, idx) => renderShotMaterialCard(it, idx, plan.items.length)).join("")}</div>`;
        bindCell();
      };
      const bindCell = () => {
        cell.querySelector("[data-sl-shot-ai-switch]")?.addEventListener("click", () => { planIdx += 1; rerender(); });
        cell.querySelectorAll(".sl-shot-material-item").forEach((node, itemIdx) => {
          node.addEventListener("click", () => {
            const plans = buildScriptMaterialPlan(script, rowIndex);
            const plan = plans[planIdx] || plans[0];
            const picked = plan?.items?.[itemIdx];
            if (!picked) return;
            applyScriptMaterial(script, rowIndex, picked);
            rerender();
            toast(`已替换 #${row.id} 镜头素材`);
          });
        });
      };
      rerender();
    });
  }

  function render() {
    const keyword = $("#slSearch").value.trim().toLowerCase();
    const mode = $("#slMaterialFilter").value;
    const list = scripts.filter(script => {
      const haystack = `${script.name} ${script.product} ${script.source}`.toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (mode === "all" || script.materialMode === mode);
    });
    const tbody = $("#slTbody");
    tbody.innerHTML = list.map((script, index) => {
      const personas = normalizePersonas(script);
      return `<tr data-script-id="${escapeHtml(script.id)}">
      <td><span class="sl-name">${escapeHtml(script.name)}</span></td>
      <td><span class="sl-product"><span>${escapeHtml(script.product)}</span></span></td>
      <td>${personasTableHtml(personas)}</td>
      <td><span class="sl-source" data-full="${escapeHtml(script.sourceFull)}">${escapeHtml(script.source)}</span></td>
      <td><span class="sl-spec">${escapeHtml(specs(script))}</span></td>
      <td><span class="sl-chip ${script.materialMode}">${modeText(script.materialMode)}</span></td>
      <td class="asset-audit-cell"><b>${escapeHtml(script.createdBy || "—")}</b><small>${escapeHtml(script.createdAt || "—")}</small></td>
      <td class="asset-audit-cell"><b>${escapeHtml(script.updatedBy || script.createdBy || "—")}</b><small>${escapeHtml(script.updated)}</small></td>
      <td><div class="sl-actions">
        <button class="sl-action-btn view" data-sl-action="view">查看</button>
        <div class="sl-ai-drop" data-sl-ai-drop>
          <button class="sl-ai-btn" type="button" data-sl-ai-toggle aria-haspopup="menu">AI <span class="sl-ai-caret">▾</span></button>
          <div class="sl-ai-menu" role="menu">
            <button type="button" role="menuitem" data-sl-ai-action="script">智能脚本</button>
            <button type="button" role="menuitem" data-sl-ai-action="remix">智能混剪</button>
          </div>
        </div>
        <button class="sl-action-btn locate" data-sl-action="locate">定位会话</button>
        <div class="sl-action-more">
          <button class="sl-action-more-trigger" type="button" data-sl-menu-toggle aria-label="更多操作" aria-expanded="false">•••</button>
          <div class="sl-action-menu" role="menu">
            <button data-sl-action="history" role="menuitem">查看变更</button>
            <button data-sl-action="download" role="menuitem">下载脚本</button>
            <button class="danger" data-sl-action="delete" role="menuitem">删除脚本</button>
          </div>
        </div>
      </div></td>
    </tr>`;
    }).join("");
    $("#slEmpty").hidden = Boolean(list.length);
    $("#slResultCount").textContent = `共 ${list.length} 条脚本`;
    tbody.querySelectorAll("[data-sl-menu-toggle]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const more = button.closest(".sl-action-more");
      const willOpen = !more.classList.contains("open");
      tbody.querySelectorAll(".sl-action-more.open").forEach(item => item.classList.remove("open"));
      tbody.querySelectorAll(".sl-ai-drop.open").forEach(item => item.classList.remove("open"));
      more.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    }));
    tbody.querySelectorAll("[data-sl-ai-toggle]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const drop = button.closest(".sl-ai-drop");
      const willOpen = !drop.classList.contains("open");
      tbody.querySelectorAll(".sl-ai-drop.open").forEach(item => { if (item !== drop) item.classList.remove("open"); });
      tbody.querySelectorAll(".sl-action-more.open").forEach(item => item.classList.remove("open"));
      drop.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    }));
    tbody.querySelectorAll("[data-sl-ai-action]").forEach(button => button.addEventListener("click", () => {
      const drop = button.closest(".sl-ai-drop");
      drop?.classList.remove("open");
      const script = scripts.find(item => item.id === button.closest("tr").dataset.scriptId);
      if (!script) return;
      const action = button.dataset.slAiAction;
      if (action === 'script') toast(`已基于「${script.name}」启动智能脚本生成`);
      else if (action === 'remix') toast(`已基于「${script.name}」启动智能混剪`);
    }));
    tbody.querySelectorAll("[data-sl-action]").forEach(button => button.addEventListener("click", () => {
      const script = scripts.find(item => item.id === button.closest("tr").dataset.scriptId);
      button.closest(".sl-action-more")?.classList.remove("open");
      if (button.dataset.slAction === 'history') return window.AssetAudit?.showHistory('脚本', script.name);
      ({ view:openView, locate:locateSession, download:downloadScript, delete:confirmDelete })[button.dataset.slAction](script);
    }));
  }

  function storyTable(script, editable = false) {
    const dynamicHeader = script.materialMode === "depend" ? "推荐素材" : "生视频提示词";
    if (!editable) {
      // 查看模式:depend 走"AI 换一组 + 可点素材卡"列(对齐智能脚本最后结果页);free 走提示词
      const materialRows = script.materialMode === "depend" ? script.rows.map((row, index) => {
        const plan = buildScriptMaterialPlan(script, index);
        const items = plan[0]?.items || [];
        return `<tr data-shot-idx="${index}">
          <td><span class="sl-shot">#${row.id}</span></td>
          <td>${escapeHtml(row.time)}</td>
          <td><span class="sl-cell-clamp">${escapeHtml(row.voice)}</span></td>
          <td>${escapeHtml(row.shotType)}</td>
          <td>${escapeHtml(row.cameraMove)}</td>
          <td><span class="sl-cell-clamp">${escapeHtml(row.visual)}</span></td>
          <td>${items.length ? `<div class="sl-shot-material-cell" data-shot-material-cell>
            <button class="sl-shot-ai-switch" type="button" data-sl-shot-ai-switch>✦ AI 换一组</button>
            <div class="sl-shot-material-list">${items.map((it, itemIdx) => renderShotMaterialCard(it, itemIdx, items.length)).join("")}</div>
          </div>` : `<div class="sl-shot-material-empty">该分组下无匹配素材</div>`}</td>
        </tr>`;
      }).join("") : script.rows.map((row, index) => `<tr data-shot-idx="${index}">
        <td><span class="sl-shot">#${row.id}</span></td>
        <td>${escapeHtml(row.time)}</td>
        <td><span class="sl-cell-clamp">${escapeHtml(row.voice)}</span></td>
        <td>${escapeHtml(row.shotType)}</td>
        <td>${escapeHtml(row.cameraMove)}</td>
        <td><span class="sl-cell-clamp">${escapeHtml(row.visual)}</span></td>
        <td><span class="sl-video-prompt">${escapeHtml(row.videoPrompt || "")}</span></td>
      </tr>`).join("");
      return `<div class="sl-story-wrap"><table class="sl-story-table"><thead><tr><th>镜头</th><th>时间段</th><th>对应口播片段</th><th>景别</th><th>运镜方式</th><th>画面内容描述</th><th>${dynamicHeader}</th></tr></thead><tbody>${materialRows}</tbody></table></div>`;
    }
    return `<div class="sl-story-wrap"><table class="sl-edit-table"><thead><tr><th>顺序</th><th>时间段</th><th>对应口播片段</th><th>景别</th><th>运镜方式</th><th>画面内容描述</th><th>${dynamicHeader}</th><th>操作</th></tr></thead><tbody data-edit-rows>${script.rows.map((row, index) => editRowHtml(row, index, script.materialMode)).join("")}</tbody></table></div><button class="sl-btn sl-add-row" type="button" data-add-row>＋ 新增分镜</button>`;
  }
  const editRowHtml = (row, index, mode) => `<tr data-row-index="${index}"><td><span class="sl-shot">#${index + 1}</span></td><td><input data-field="time" value="${escapeHtml(row.time)}"></td><td><textarea data-field="voice">${escapeHtml(row.voice)}</textarea></td><td><input data-field="shotType" value="${escapeHtml(row.shotType)}"></td><td><input data-field="cameraMove" value="${escapeHtml(row.cameraMove)}"></td><td><textarea data-field="visual">${escapeHtml(row.visual)}</textarea></td><td>${mode === "depend" ? `<input data-field="material" value="${escapeHtml(row.material || "智能匹配")}" aria-label="匹配素材">` : `<textarea data-field="videoPrompt" aria-label="生视频提示词">${escapeHtml(row.videoPrompt || "")}</textarea>`}</td><td class="sl-row-actions"><button class="sl-icon-btn" data-row-action="up" title="上移">↑</button><button class="sl-icon-btn" data-row-action="down" title="下移">↓</button><button class="sl-icon-btn delete" data-row-action="delete" title="删除">×</button></td></tr>`;

  function openView(script, callbacks = {}) {
    const personas = normalizePersonas(script);
    const body = `<div class="sl-meta-grid"><div class="sl-meta"><small>对应产品</small><strong>${escapeHtml(script.product)}</strong></div><div class="sl-meta"><small>画面比例</small><strong>${escapeHtml(script.ratio || "9:16")}</strong></div><div class="sl-meta"><small>规格</small><strong>${escapeHtml(specs(script))}</strong></div><div class="sl-meta"><small>素材策略</small><strong>${modeText(script.materialMode)}</strong></div></div><section class="sl-meta-block"><div class="sl-meta-block-head">目标人群 <small>${personas.length} 组</small></div>${personasViewHtml(personas)}</section><div class="sl-meta-grid"><div class="sl-meta"><small>素材状态</small><strong>${escapeHtml(materialStatus(script))}</strong></div><div class="sl-meta"><small>最近更新</small><strong>${escapeHtml(script.updated || "—")} · ${escapeHtml(script.updatedBy || script.createdBy || "—")}</strong></div><div class="sl-meta"><small>创建</small><strong>${escapeHtml(script.createdBy || "—")} · ${escapeHtml(script.createdAt || "—")}</strong></div><div class="sl-meta"><small>来源会话</small><strong>${escapeHtml(script.sessionId || "—")}</strong></div></div><section class="sl-source-block"><div><span>生成文案</span><button class="sl-link-btn" type="button" data-expand-source>展开全文</button></div><p>${escapeHtml(script.sourceFull)}</p></section>${storyTable(script)}`;
    const host = modal(script.name, `最近更新：${script.updated}`, body, `<button class="sl-btn" data-view-locate>定位至会话</button><button class="sl-btn" data-view-download>下载脚本</button><button class="sl-btn primary" data-close>关闭</button>`);
    host.querySelector("[data-expand-source]").addEventListener("click", event => { const box = event.currentTarget.closest(".sl-source-block"); box.classList.toggle("expanded"); event.currentTarget.textContent = box.classList.contains("expanded") ? "收起全文" : "展开全文"; });
    host.querySelector("[data-view-locate]").addEventListener("click", () => { host.remove(); locateSession(script); });
    host.querySelector("[data-view-download]").addEventListener("click", () => downloadScript(script));
    // 推荐素材列支持点击替换(对齐智能脚本最后结果页)
    bindScriptMaterialReplace(host, script);
  }

  function collectRows(host, draft) {
    draft.rows = [...host.querySelectorAll("[data-edit-rows] tr")].map((tr, index) => {
      const read = field => tr.querySelector(`[data-field="${field}"]`)?.value.trim() || "";
      return { id:index + 1, time:read("time"), voice:read("voice"), shotType:read("shotType"), cameraMove:read("cameraMove"), visual:read("visual"), material:draft.materialMode === "depend" ? read("material") : "", videoPrompt:draft.materialMode === "free" ? read("videoPrompt") : "" };
    });
  }
  function bindEditRows(host, draft, rerender) {
    host.querySelector("[data-add-row]")?.addEventListener("click", () => { collectRows(host, draft); draft.rows.push({ id:draft.rows.length + 1, time:"", voice:"", shotType:"中景", cameraMove:"固定", visual:"", material:"智能匹配", videoPrompt:"" }); rerender(); });
    host.querySelectorAll("[data-row-action]").forEach(button => button.addEventListener("click", () => {
      collectRows(host, draft); const index = Number(button.closest("tr").dataset.rowIndex); const action = button.dataset.rowAction;
      if (action === "delete") draft.rows.splice(index, 1);
      if (action === "up" && index > 0) [draft.rows[index - 1], draft.rows[index]] = [draft.rows[index], draft.rows[index - 1]];
      if (action === "down" && index < draft.rows.length - 1) [draft.rows[index + 1], draft.rows[index]] = [draft.rows[index], draft.rows[index + 1]];
      draft.rows.forEach((row, i) => row.id = i + 1); rerender();
    }));
  }
  // 模板库数据(与 app.js personaCatalog 一致,后续可改为从全局数据源拉取)
  const SCRIPT_PERSONA_CATALOG = [
    { id:"persona-mom", name:"精致妈妈—母婴清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"女性", age:"24-30" },
    { id:"persona-pet", name:"精致妈妈—养宠清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"不限", age:"31-40" },
    { id:"persona-whitecollar", name:"新锐白领—一人食效率人群", brand:"轻享", category:"厨房小电", product:"轻享空气炸锅 A8", audience:"新锐白领", gender:"不限", age:"24-30" },
    { id:"persona-family", name:"资深中产—品质清洁人群", brand:"净界", category:"清洁电器", product:"净界洗地机 S5", audience:"资深中产", gender:"不限", age:"31-40" },
    { id:"persona-general", name:"家庭日常清洁—通用人群", brand:"", category:"", product:"", audience:"精致妈妈", gender:"不限", age:"24-40" }
  ];
  // 把 age 字符串转成 {min,max,isCustom,label}
  const parseAge = value => {
    if (SCRIPT_AGE_OPTIONS.includes(value)) return { isCustom:false, min:null, max:null, label:value };
    const m = String(value || "").match(/^(\d+)-(\d+)$/);
    if (m) return { isCustom:true, min:m[1], max:m[2], label:`${m[1]}-${m[2]}` };
    return { isCustom:false, min:null, max:null, label:"" };
  };

  // 单个手动人群组(供编辑/查看使用;查看态加 is-readonly 屏蔽交互)
  const slEditPersonaGroupHtml = (index, persona, readonly) => {
    const parsed = parseAge(persona.age);
    const ageChips = SCRIPT_AGE_OPTIONS.map(value => `<button type="button" class="sl-pp-pill${value === parsed.label ? " active" : ""}" data-sl-age-pill="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("") + `<button type="button" class="sl-pp-pill${parsed.isCustom ? " active" : ""}" data-sl-age-pill="__custom__">自定义…</button>`;
    const audChips = SCRIPT_AUDIENCE_OPTIONS.map(value => `<button type="button" class="sl-pp-pill${value === persona.audience ? " active" : ""}" data-sl-audience-pill="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("");
    const genChips = SCRIPT_GENDER_OPTIONS.map(value => `<button type="button" class="sl-pp-pill${value === persona.gender ? " active" : ""}" data-sl-gender-pill="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("");
    return `<div class="sl-pp-group${readonly ? " is-readonly" : ""}" data-sl-persona-group data-sl-persona-index="${index}">
      <div class="sl-pp-group-head">
        <span>人群 ${index + 1}</span>
        ${!readonly && index > 0 ? '<button type="button" class="sl-pp-group-remove" data-sl-persona-group-remove aria-label="删除该人群组">删除</button>' : ""}
      </div>
      <div class="sl-pp-fields">
        <div class="sl-pp-field">
          <label>核心目标人群 <em>*</em></label>
          <div class="sl-pp-chips-row" data-sl-audience-chips>${audChips}</div>
        </div>
        <div class="sl-pp-field">
          <label>性别 <em>*</em></label>
          <div class="sl-pp-chips-row" data-sl-gender-chips>${genChips}</div>
        </div>
        <div class="sl-pp-field">
          <label>年龄 <em>*</em></label>
          <div class="sl-pp-chips-row" data-sl-age-chips>${ageChips}</div>
          <div class="sl-pp-custom-age" data-sl-custom-age ${parsed.isCustom ? "" : "hidden"}>
            <input type="number" data-sl-age-min min="1" max="99" placeholder="最小" value="${escapeHtml(parsed.min || "")}">
            <i>至</i>
            <input type="number" data-sl-age-max min="1" max="99" placeholder="最大" value="${escapeHtml(parsed.max || "")}">
          </div>
        </div>
      </div>
    </div>`;
  };

  // 模板库选择面板 — personaCatalog 卡片
  const slPersonaTemplateItemHtml = (persona, added) => `<div class="sl-pp-tpl-card${added ? " is-added" : ""}" data-sl-tpl-id="${escapeHtml(persona.id)}">
    <div class="sl-pp-tpl-head"><strong>${escapeHtml(persona.name)}</strong><span class="sl-pp-tpl-tag">${escapeHtml(persona.audience)}</span></div>
    <div class="sl-pp-tpl-meta">
      <span>${escapeHtml(persona.gender)}</span>
      <span>${escapeHtml(persona.age)}</span>
      ${persona.product ? `<span class="sl-pp-tpl-product">${escapeHtml(persona.product)}</span>` : ""}
    </div>
    <button type="button" class="sl-pp-tpl-add" data-sl-tpl-add aria-pressed="${added ? "true" : "false"}">${added ? "已添加 ✓" : "＋ 添加到人群"}</button>
  </div>`;

  // 编辑态的整个"目标人群"区域(tab + panels)
  const slEditPersonaBlockHtml = (personas, currentProduct) => {
    const personaGroups = personas.map((p, i) => slEditPersonaGroupHtml(i, p, false)).join("");
    const productRelated = SCRIPT_PERSONA_CATALOG.filter(p => !p.product || p.product === currentProduct || !currentProduct);
    const tplCards = productRelated.map(p => slPersonaTemplateItemHtml(p, false)).join("");
    return `<section class="sl-pp-block" data-sl-persona-block>
      <div class="sl-pp-tabs" role="tablist">
        <button type="button" class="sl-pp-tab active" data-sl-persona-tab="manual" role="tab" aria-selected="true">自行输入</button>
        <button type="button" class="sl-pp-tab" data-sl-persona-tab="template" role="tab" aria-selected="false">从模板库选择</button>
      </div>
      <div class="sl-pp-panel" data-sl-persona-panel="manual">
        <div class="sl-pp-groups" data-sl-persona-groups>${personaGroups || slEditPersonaGroupHtml(0, productPersonaDefault(currentProduct), false)}</div>
        <button type="button" class="sl-pp-add-group" data-sl-persona-add>＋ 添加人群</button>
        <div class="sl-pp-summary" data-sl-persona-summary>${personas.map(p => `${p.audience} · ${p.gender} · ${p.age}`).join(" / ") || "请添加至少一个人群组"}</div>
      </div>
      <div class="sl-pp-panel" data-sl-persona-panel="template" hidden>
        <div class="sl-pp-tpl-hint">从下方选择人群画像模板,会同时填充 8 大人群 / 性别 / 年龄。同一模板可重复添加。</div>
        <div class="sl-pp-tpl-list" data-sl-persona-templates>${tplCards}</div>
      </div>
    </section>`;
  };

  // 只读版:用于查看场景(每个 group 只展示 chip 不让点)
  const slViewPersonaBlockHtml = personas => `<section class="sl-pp-block is-readonly" data-sl-persona-block>
    <div class="sl-pp-readonly-head">目标人群 <small>${personas.length} 组</small></div>
    <div class="sl-pp-groups">${personas.map((p, i) => slEditPersonaGroupHtml(i, p, true)).join("")}</div>
  </section>`;

  // 收集编辑态的 personas 数组
  const collectEditPersonas = host => {
    const groups = [...host.querySelectorAll("[data-sl-persona-group]")];
    return groups.map((group, index) => {
      const audience = group.querySelector("[data-sl-audience-chips] .sl-pp-pill.active")?.dataset.slAudiencePill || "";
      const gender = group.querySelector("[data-sl-gender-chips] .sl-pp-pill.active")?.dataset.slGenderPill || SCRIPT_GENDER_OPTIONS[0];
      const agePill = group.querySelector("[data-sl-age-chips] .sl-pp-pill.active")?.dataset.slAgePill || "";
      let age = "";
      if (agePill === "__custom__") {
        const min = group.querySelector("[data-sl-age-min]")?.value.trim();
        const max = group.querySelector("[data-sl-age-max]")?.value.trim();
        if (min && max) age = `${min}-${max}`;
      } else {
        age = agePill;
      }
      return { audience, gender, age, sourcePersonaId: group.dataset.slSourcePersonaId || null };
    }).filter(p => p.audience);
  };

  // 重排 group 序号与首个不可删除标记
  const renumberPersonaGroups = host => {
    const groups = [...host.querySelectorAll("[data-sl-persona-group]")];
    groups.forEach((group, index) => {
      group.dataset.slPersonaIndex = String(index);
      const label = group.querySelector(".sl-pp-group-head > span");
      if (label) label.textContent = `人群 ${index + 1}`;
      let removeBtn = group.querySelector("[data-sl-persona-group-remove]");
      if (index === 0 && removeBtn) removeBtn.remove();
      if (index > 0 && !removeBtn) {
        const head = group.querySelector(".sl-pp-group-head");
        if (head) head.insertAdjacentHTML("beforeend", '<button type="button" class="sl-pp-group-remove" data-sl-persona-group-remove aria-label="删除该人群组">删除</button>');
      }
    });
  };
  // 更新模板卡片"已添加"状态(根据当前已应用人群的 sourcePersonaId)
  const refreshTemplateAddedState = host => {
    const block = host.querySelector("[data-sl-persona-block]");
    if (!block) return;
    const applied = new Set(collectEditPersonas(host).map(p => p.sourcePersonaId).filter(Boolean));
    block.querySelectorAll("[data-sl-tpl-id]").forEach(card => {
      const added = applied.has(card.dataset.slTplId);
      card.classList.toggle("is-added", added);
      const btn = card.querySelector("[data-sl-tpl-add]");
      if (btn) { btn.textContent = added ? "已添加 ✓" : "＋ 添加到人群"; btn.setAttribute("aria-pressed", added ? "true" : "false"); }
    });
    // 同步摘要
    const summary = block.querySelector("[data-sl-persona-summary]");
    if (summary) {
      const ps = collectEditPersonas(host);
      summary.textContent = ps.length ? ps.map(p => `${p.audience} · ${p.gender} · ${p.age}`).join(" / ") : "请添加至少一个人群组";
    }
  };
  // 添加一个新人群组
  const appendPersonaGroup = (host, persona) => {
    const groups = host.querySelector("[data-persona-groups], [data-sl-persona-groups]");
    if (!groups) return;
    const index = groups.querySelectorAll("[data-sl-persona-group]").length;
    const seed = persona || productPersonaDefault(host.querySelector("#slEditProduct")?.value || "");
    groups.insertAdjacentHTML("beforeend", slEditPersonaGroupHtml(index, seed, false));
    if (seed.sourcePersonaId) {
      const added = groups.lastElementChild;
      if (added) added.dataset.slSourcePersonaId = seed.sourcePersonaId;
    }
    renumberPersonaGroups(host);
  };

  function openEdit(script, callbacks = {}) {
    const draft = clone(script);
    // 规范化 personas:统一用数组存储
    if (!Array.isArray(draft.personas) || !draft.personas.length) {
      draft.personas = [{ audience: draft.audience, gender: draft.gender, age: draft.age, sourcePersonaId: draft.sourcePersonaId || null }];
    }
    draft.personas = draft.personas.map(p => sanitizePersona(p, sanitizePersona(p, productPersonaDefault(draft.product))));
    // 记录编辑前的产品默认,用于在 product 变更时决定是否覆盖第一个组
    draft._originalProduct = script.product;
    draft._originalDefault = productPersonaDefault(script.product);
    const body = `<div class="sl-edit-form"><label class="sl-edit-field"><span>脚本名称 *</span><input id="slEditName" value="${escapeHtml(draft.name)}"></label><label class="sl-edit-field"><span>目标时长（秒） *</span><input id="slEditDuration" type="number" min="1" step="1" value="${draft.duration}"></label><label class="sl-edit-field"><span>画面比例 *</span><select id="slEditRatio"><option ${draft.ratio === "9:16" ? "selected" : ""}>9:16</option><option ${draft.ratio === "16:9" ? "selected" : ""}>16:9</option></select></label><label class="sl-edit-field sl-mode-field"><span>素材策略 *</span><select id="slEditMode"><option value="depend" ${draft.materialMode === "depend" ? "selected" : ""}>依赖素材库</option><option value="free" ${draft.materialMode === "free" ? "selected" : ""}>不依赖素材库</option></select></label></div><label class="sl-edit-field sl-edit-product"><span>对应产品 *</span><select id="slEditProduct">${productOptionsHtml(draft.product)}</select></label><div data-edit-personas></div><div data-edit-dynamic></div><div data-edit-story></div>`;
    const host = modal(`编辑脚本 · ${script.name}`, "修改仅作用于当前脚本，不影响生成文案或其他脚本。", body, `<button class="sl-btn sl-danger" data-edit-delete>删除脚本</button><button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-save-edit>保存修改</button>`);
    // 渲染 personas 区
    const renderPersonas = () => {
      const host2 = $("[data-edit-personas]", host);
      host2.innerHTML = slEditPersonaBlockHtml(draft.personas, draft.product);
      bindPersonaBlockEvents(host);
      refreshTemplateAddedState(host);
    };
    const renderEditor = () => {
      const dynamicText = draft.materialMode === "depend" ? "系统会依据镜头时长和画面内容自动匹配素材；可直接修改每行的匹配素材。" : "每条分镜需填写生视频提示词，可直接用于后续视频生成工具。";
      const dynamicActions = draft.materialMode === "depend" ? '<button type="button" data-rematch>重新匹配素材</button>' : '<button type="button" data-recalc-voice>重新计算口播时长</button>';
      $("[data-edit-dynamic]", host).innerHTML = `<div class="sl-edit-dynamic"><span class="sl-edit-dynamic-text">${dynamicText}</span><span class="sl-edit-dynamic-actions">${dynamicActions}</span></div>`;
      $("[data-edit-story]", host).innerHTML = storyTable(draft, true);
      bindEditRows(host, draft, renderEditor);
      host.querySelector("[data-rematch]")?.addEventListener("click", () => {
        collectRows(host, draft);
        draft.rows.forEach((row, index) => row.material = `M-CL-${String(101 + index).padStart(3, "0")} · ${index % 2 ? "3" : "2"}s`);
        renderEditor();
        toast("已重新匹配当前分镜素材");
      });
      host.querySelector("[data-recalc-voice]")?.addEventListener("click", () => {
        collectRows(host, draft);
        const CHARS_PER_SECOND = 4;
        const countChars = text => (text || "").replace(/\s/g, "").length;
        const totalChars = draft.rows.reduce((sum, row) => sum + countChars(row.voice), 0);
        if (totalChars === 0) return toast("暂无口播内容,无法计算");
        const totalSeconds = Math.max(1, Math.ceil(totalChars / CHARS_PER_SECOND));
        const pad2 = n => String(n).padStart(2, "0");
        let cursor = 0;
        const eachSec = draft.rows.map(row => Math.max(1, Math.round((countChars(row.voice) / totalChars) * totalSeconds)));
        const sumEach = eachSec.reduce((a, b) => a + b, 0);
        if (sumEach !== totalSeconds && eachSec.length) eachSec[eachSec.length - 1] += totalSeconds - sumEach;
        draft.rows.forEach((row, i) => {
          const start = cursor;
          const end = Math.min(totalSeconds, cursor + eachSec[i]);
          cursor = end;
          row.time = `${pad2(start)}—${pad2(end)}s`;
          const tr = host.querySelector(`[data-edit-rows] tr[data-row-index="${i}"]`);
          tr?.querySelector('[data-field="time"]') && (tr.querySelector('[data-field="time"]').value = row.time);
        });
        draft.duration = totalSeconds;
        const durInput = host.querySelector("#slEditDuration");
        if (durInput) durInput.value = totalSeconds;
        toast(`已重算口播:共 ${totalChars} 字 ≈ ${totalSeconds} 秒`);
      });
    };
    // personas 区交互绑定(tab 切换、chip 选中、删除、添加、模板)
    const bindPersonaBlockEvents = host => {
      const block = host.querySelector("[data-sl-persona-block]");
      if (!block) return;
      // tab 切换
      block.querySelectorAll("[data-sl-persona-tab]").forEach(btn => {
        if (btn.dataset.bound === "true") return;
        btn.dataset.bound = "true";
        btn.addEventListener("click", event => {
          event.preventDefault();
          const mode = btn.dataset.slPersonaTab;
          block.querySelectorAll("[data-sl-persona-tab]").forEach(b => {
            const active = b === btn;
            b.classList.toggle("active", active);
            b.setAttribute("aria-selected", active ? "true" : "false");
          });
          block.querySelectorAll("[data-sl-persona-panel]").forEach(p => p.hidden = p.dataset.slPersonaPanel !== mode);
        });
      });
      // 委托:chip 选中、删除、添加
      block.addEventListener("click", event => {
        const removeBtn = event.target.closest("[data-sl-persona-group-remove]");
        if (removeBtn) {
          event.preventDefault();
          const group = removeBtn.closest("[data-sl-persona-group]");
          if (!group) return;
          const groups = host.querySelectorAll("[data-sl-persona-group]").length;
          if (groups <= 1) {
            // 至少留一个:仅清空当前组的值
            group.querySelectorAll(".sl-pp-pill.active").forEach(p => p.classList.remove("active"));
            const seed = productPersonaDefault(host.querySelector("#slEditProduct")?.value || "");
            group.querySelector(`[data-sl-audience-chips] [data-sl-audience-pill="${CSS.escape(seed.audience)}"]`)?.classList.add("active");
            group.querySelector(`[data-sl-gender-chips] [data-sl-gender-pill="${CSS.escape(seed.gender)}"]`)?.classList.add("active");
            group.querySelector(`[data-sl-age-chips] [data-sl-age-pill="${CSS.escape(seed.age)}"]`)?.classList.add("active");
            group.removeAttribute("data-sl-source-persona-id");
            refreshTemplateAddedState(host);
            return;
          }
          group.remove();
          renumberPersonaGroups(host);
          refreshTemplateAddedState(host);
          return;
        }
        const pill = event.target.closest(".sl-pp-pill");
        if (pill && block.contains(pill)) {
          const row = pill.parentElement;
          row.querySelectorAll(".sl-pp-pill").forEach(p => p.classList.toggle("active", p === pill));
          // 年龄切到自定义时显示输入框
          const group = pill.closest("[data-sl-persona-group]");
          if (group && pill.closest("[data-sl-age-chips]")) {
            const customBox = group.querySelector("[data-sl-custom-age]");
            if (customBox) customBox.hidden = pill.dataset.slAgePill !== "__custom__";
          }
          // 手动模式选了非模板,清掉 sourcePersonaId
          if (group) group.removeAttribute("data-sl-source-persona-id");
          refreshTemplateAddedState(host);
          return;
        }
        const addGroupBtn = event.target.closest("[data-sl-persona-add]");
        if (addGroupBtn) {
          event.preventDefault();
          appendPersonaGroup(host);
          refreshTemplateAddedState(host);
          return;
        }
        const tplAdd = event.target.closest("[data-sl-tpl-add]");
        if (tplAdd) {
          event.preventDefault();
          const card = tplAdd.closest("[data-sl-tpl-id]");
          const tpl = SCRIPT_PERSONA_CATALOG.find(p => p.id === card?.dataset.slTplId);
          if (!tpl) return;
          // 已存在则跳过(同 sourcePersonaId 不重复加)
          const existing = collectEditPersonas(host);
          if (existing.some(p => p.sourcePersonaId === tpl.id)) return toast("已添加该模板");
          appendPersonaGroup(host, { audience: tpl.audience, gender: tpl.gender, age: tpl.age, sourcePersonaId: tpl.id });
          // 新增 group 写入 sourcePersonaId
          const groups = host.querySelectorAll("[data-sl-persona-group]");
          const last = groups[groups.length - 1];
          if (last) last.dataset.slSourcePersonaId = tpl.id;
          refreshTemplateAddedState(host);
          return;
        }
      });
      // 自定义年龄 min/max 同步摘要
      block.addEventListener("input", event => {
        if (event.target.matches("[data-sl-age-min], [data-sl-age-max]")) {
          refreshTemplateAddedState(host);
        }
      });
    };
    renderPersonas();
    renderEditor();
    host.querySelector("#slEditMode").addEventListener("change", event => { collectRows(host, draft); draft.materialMode = event.target.value; renderEditor(); });
    host.querySelector("#slEditProduct").addEventListener("change", event => {
      const oldProduct = draft.product;
      draft.product = event.target.value;
      const oldDefault = draft._originalDefault || productPersonaDefault(oldProduct);
      // 改产品时:仅当第 1 组完全等于原产品默认,才替换为新默认
      if (draft.personas.length === 1) {
        const only = draft.personas[0];
        if (only.audience === oldDefault.audience && only.gender === oldDefault.gender && only.age === oldDefault.age && !only.sourcePersonaId) {
          const next = productPersonaDefault(draft.product);
          draft.personas[0] = { audience: next.audience, gender: next.gender, age: next.age, sourcePersonaId: null };
        }
      }
      draft._originalProduct = draft.product;
      draft._originalDefault = productPersonaDefault(draft.product);
      // 模板库过滤:刷新模板面板以匹配新产品
      renderPersonas();
    });
    host.querySelector("[data-save-edit]").addEventListener("click", () => {
      collectRows(host, draft);
      draft.name = host.querySelector("#slEditName").value.trim();
      draft.duration = Number(host.querySelector("#slEditDuration").value);
      draft.ratio = host.querySelector("#slEditRatio").value;
      draft.product = host.querySelector("#slEditProduct").value.trim();
      // 收集 personas
      const collected = collectEditPersonas(host);
      if (!collected.length) return toast("请至少配置一个人群组");
      if (collected.some(p => !p.audience || !p.gender || !p.age)) return toast("请补全每个目标人群的 8 大人群 / 性别 / 年龄");
      draft.personas = collected;
      // 兼容老字段:把第 1 组同步给 audience/gender/age,其它模块若仍读老字段不会爆
      draft.audience = collected[0].audience;
      draft.gender = collected[0].gender;
      draft.age = collected[0].age;
      draft.sourcePersonaId = collected[0].sourcePersonaId || null;
      if (!draft.name || !Number.isInteger(draft.duration) || draft.duration <= 0 || !draft.rows.length) return toast("请完整填写脚本名称、时长和至少一条分镜");
      if (draft.rows.some(row => !row.time || !row.voice || !row.visual || (draft.materialMode === "free" && !row.videoPrompt))) return toast(draft.materialMode === "free" ? "请补充每条分镜的生视频提示词" : "请补充分镜必填信息");
      // 清理内部临时字段
      delete draft._originalProduct;
      delete draft._originalDefault;
      draft.updated = now(); draft.updatedBy = "嗡大发"; draft.materialStatus = draft.materialMode === "depend" ? `${draft.rows.length}/${draft.rows.length} 已匹配` : "已生成提示词";
      scripts = scripts.map(item => item.id === script.id ? draft : item); callbacks.onSaved?.(draft); host.remove(); render(); notifyChange(); toast("脚本已保存");
    });
    host.querySelector("[data-edit-delete]").addEventListener("click", () => { host.remove(); confirmDelete(script, callbacks); });
  }

  function locateSession(script) {
    if (!script.sessionId) return toast("该脚本未关联来源会话");
    const creationNav = document.querySelector('.nav-item[data-page="creation"]');
    if (!creationNav) return toast("无法打开 AI 创作页");
    creationNav.click();
    requestAnimationFrame(() => {
      const row = [...document.querySelectorAll("#page-creation .chat-row")].find(item => item.dataset.sessionId === script.sessionId);
      if (!row) return toast("来源会话已删除或不可用");
      row.click();
      row.scrollIntoView({ behavior:"smooth", block:"center" });
      row.animate?.([
        { boxShadow:"0 0 0 0 rgba(109, 76, 255, 0)", backgroundColor:"#eeeeF0" },
        { boxShadow:"0 0 0 3px rgba(109, 76, 255, .22)", backgroundColor:"#f2efff", offset:.25 },
        { boxShadow:"0 0 0 0 rgba(109, 76, 255, 0)", backgroundColor:"#eeeeF0" }
      ], { duration:1400, easing:"ease-out" });
    });
  }
  function downloadScript(script) {
    const blob = new Blob([JSON.stringify(script, null, 2)], { type:"application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${script.name}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast("脚本已下载");
  }
  function confirmDelete(script, callbacks = {}) {
    const host = modal("删除脚本", "删除后无法恢复。", `<div class="sl-confirm-copy">确认删除 <b>${escapeHtml(script.name)}</b> 吗？</div>`, `<button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-confirm-delete>确认删除</button>`, true);
    host.querySelector("[data-confirm-delete]").addEventListener("click", () => { scripts = scripts.filter(item => item.id !== script.id); callbacks.onDeleted?.(script); host.remove(); render(); notifyChange(); toast("脚本已删除"); });
  }
  function normalizeAsset(asset) {
    const mode = asset.materialMode || "depend";
    const rows = (asset.scriptRows || baseRows(mode)).map((row, index) => ({ ...row, id:index + 1 }));
    const activeSession = document.querySelector("#page-creation .chat-row.active");
    const createdAt = now();
    const productName = asset.productName || "轻净 Pro 除螨仪";
    // 接收来自 agent 的多人群;如果只有单组则包成数组
    const personas = Array.isArray(asset.personas) && asset.personas.length
      ? asset.personas.map(p => sanitizePersona(p, productPersonaDefault(productName)))
      : sanitizePersona({ audience: asset.audience, gender: asset.gender, age: asset.age, sourcePersonaId: asset.sourcePersonaId }, productPersonaDefault(productName));
    const personasArray = Array.isArray(personas) ? personas : [personas];
    return { id:`asset-${asset.id}`, sessionId:asset.sessionId || activeSession?.dataset.sessionId || "", name:asset.title || "未命名脚本", product:productName, personas:personasArray, audience:personasArray[0].audience, gender:personasArray[0].gender, age:personasArray[0].age, sourcePersonaId:personasArray[0].sourcePersonaId || null, source:asset.sourceTitle || "当前生成文案", sourceFull:asset.sourceContent || asset.sourceTitle || "当前生成文案", duration:Math.max(1, rows.length * 4), ratio:["9:16","16:9"].includes(asset.ratio) ? asset.ratio : "9:16", materialMode:mode, materialStatus:mode === "depend" ? `${rows.length}/${rows.length} 已匹配` : "已生成提示词", createdBy:"嗡大发", createdAt, updatedBy:"嗡大发", updated:createdAt, rows };
  }
  function rematch(script, callbacks = {}) {
    const target = scripts.find(item => item.id === script?.id);
    if (!target) return;
    target.materialMode = "depend";
    target.rows = target.rows.map((row, index) => ({ ...row, material:`M-CL-${String(101 + index).padStart(3, "0")} · ${index % 2 ? "3" : "2"}s` }));
    target.materialStatus = `${target.rows.length}/${target.rows.length} 已匹配`;
    target.updated = now(); target.updatedBy = "嗡大发";
    callbacks.onSaved?.(target);
    render();
    notifyChange();
    toast("已重新匹配当前产品素材");
  }
  function pick(options = {}) {
    let selectedId = options.selectedId || "";
    let keyword = "";
    const host = modal(
      "选择脚本",
      "仅可选择依赖素材库的脚本；选择后带入口播、分镜和已匹配素材副本。",
      `<div class="lib-picker-toolbar"><input class="lib-pick-search" type="search" placeholder="搜索脚本名称或产品"><span class="sl-pick-result-count" data-script-pick-count></span></div><div class="lib-pick-list sl-pick-script-list" data-script-pick-list></div>`,
      `<button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-script-pick-confirm disabled>确认选择</button>`
    );
    const list = host.querySelector("[data-script-pick-list]");
    const confirm = host.querySelector("[data-script-pick-confirm]");
    const count = host.querySelector("[data-script-pick-count]");
    const closeDetail = () => document.querySelector("[data-script-pick-detail]")?.remove();
    host.addEventListener("click", event => { if (event.target.closest("[data-close]")) closeDetail(); });
    const openDetail = script => {
      closeDetail();
      const personas = normalizePersonas(script);
      const detail = document.createElement("div");
      detail.className = "sl-script-pick-detail";
      detail.dataset.scriptPickDetail = "";
      detail.innerHTML = `<div class="sl-script-pick-detail-mask" data-close-script-detail></div><aside class="sl-script-pick-drawer" role="dialog" aria-modal="true" aria-label="脚本详情"><header><div><small>脚本详情</small><h2>${escapeHtml(script.name)}</h2><p>最近更新：${escapeHtml(script.updated || "—")}</p></div><button type="button" data-close-script-detail aria-label="关闭">×</button></header><div class="sl-script-pick-drawer-body"><div class="sl-meta-grid"><div class="sl-meta"><small>对应产品</small><strong>${escapeHtml(script.product)}</strong></div><div class="sl-meta"><small>画面比例</small><strong>${escapeHtml(script.ratio || "9:16")}</strong></div><div class="sl-meta"><small>规格</small><strong>${escapeHtml(specs(script))}</strong></div><div class="sl-meta"><small>素材策略</small><strong>${escapeHtml(modeText(script.materialMode))}</strong></div></div><section class="sl-meta-block"><div class="sl-meta-block-head">目标人群 <small>${personas.length} 组</small></div>${personasViewHtml(personas)}</section><div class="sl-meta-grid"><div class="sl-meta"><small>素材状态</small><strong>${escapeHtml(materialStatus(script))}</strong></div><div class="sl-meta"><small>最近更新</small><strong>${escapeHtml(script.updated || "—")} · ${escapeHtml(script.updatedBy || script.createdBy || "—")}</strong></div><div class="sl-meta"><small>创建</small><strong>${escapeHtml(script.createdBy || "—")} · ${escapeHtml(script.createdAt || "—")}</strong></div><div class="sl-meta"><small>来源会话</small><strong>${escapeHtml(script.sessionId || "—")}</strong></div></div><section class="sl-source-block expanded"><div><span>生成文案</span></div><p>${escapeHtml(script.sourceFull)}</p></section><section class="sl-script-pick-story"><h3>脚本分镜</h3>${storyTable(script)}</section></div></aside>`;
      detail.addEventListener("click", event => { if (event.target.closest("[data-close-script-detail]")) detail.remove(); });
      document.body.appendChild(detail);
      requestAnimationFrame(() => detail.classList.add("show"));
    };
    const renderPicker = () => {
      const visible = scripts.filter(script => script.materialMode === "depend" && `${script.name} ${script.product} ${script.sourceFull}`.toLowerCase().includes(keyword.toLowerCase()));
      count.textContent = `可选 ${visible.length} 条`;
      list.innerHTML = visible.length ? visible.map(script => {
        const selected = script.id === selectedId;
        const audiences = normalizePersonas(script).map(p => p.audience).filter(Boolean);
        const audienceHtml = audiences.length
          ? audiences.map(name => `<span class="sl-audience-pill" data-audience="${escapeHtml(name)}">${escapeHtml(name)}</span>`).join("")
          : '<span class="sl-pick-script-audience-empty">未设置目标人群</span>';
        return `<article class="sl-pick-script-card${selected ? " selected" : ""}"><button class="sl-pick-script-select" type="button" data-script-pick-id="${escapeHtml(script.id)}"><i class="sl-pick-script-check">${selected ? "✓" : ""}</i><div class="sl-pick-script-main"><div class="sl-pick-script-head"><strong>${escapeHtml(script.name)}</strong><small>${escapeHtml(script.updatedBy || script.createdBy || "—")} · ${escapeHtml(script.updated || script.createdAt || "—")}</small></div><p>${escapeHtml(script.source)}</p><div class="sl-pick-script-meta"><span>${escapeHtml(script.product)}</span><span>${escapeHtml(specs(script))}</span><span class="is-material">依赖素材库 · ${escapeHtml(materialStatus(script))}</span>${audienceHtml}</div></div></button><button class="sl-pick-script-view" type="button" data-script-pick-view="${escapeHtml(script.id)}">查看详情</button></article>`;
      }).join("") : '<div class="lib-pick-empty">未找到匹配的脚本</div>';
      list.querySelectorAll("[data-script-pick-id]").forEach(card => card.addEventListener("click", () => { selectedId = card.dataset.scriptPickId; renderPicker(); }));
      list.querySelectorAll("[data-script-pick-view]").forEach(button => button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openDetail(scripts.find(script => script.id === button.dataset.scriptPickView));
      }));
      confirm.disabled = !selectedId;
      confirm.textContent = selectedId ? "确认选择" : "请选择脚本";
    };
    host.querySelector(".lib-pick-search").addEventListener("input", event => { keyword = event.target.value.trim(); renderPicker(); });
    confirm.addEventListener("click", () => {
      const selected = scripts.find(script => script.id === selectedId);
      if (!selected) return;
      const snapshot = clone(selected);
      closeDetail();
      host.remove();
      try { options.onConfirm?.(snapshot); } catch (err) { console.error("[script-pick] onConfirm 处理失败:", err); (window.showToast || console.error)("已选择脚本，但回填信息失败，请刷新页面后重试。"); }
    });
    renderPicker();
  }
  window.addEventListener("script-library:sync", event => { const { action, asset } = event.detail || {}; if (!asset) return; const id = `asset-${asset.id}`; if (action === "remove") scripts = scripts.filter(script => script.id !== id); else { const normalized = normalizeAsset(asset); scripts = [normalized, ...scripts.filter(script => script.id !== id)]; } render(); notifyChange(); });
  window.ContentCompassScriptLibrary = {
    list() { return scripts; },
    pick,
    open(script, action, callbacks = {}) {
      if (!script) return;
      const actions = { "查看":openView, "编辑":openEdit, "定位至会话":locateSession, "下载":downloadScript, "删除":confirmDelete, "重新匹配素材":rematch };
      actions[action]?.(clone(script), callbacks);
    },
    // 共享给产品详情页(脚本库 tab)使用,实现"AI 换一组 + 点击素材卡替换"列
    renderShotMaterialCard,
    buildScriptMaterialPlan,
    applyScriptMaterial,
    bindScriptMaterialReplace,
    parseShotSeconds
  };
  document.addEventListener("click", event => {
    if (!event.target.closest(".sl-action-more")) {
      root.querySelectorAll(".sl-action-more.open").forEach(item => item.classList.remove("open"));
    }
    if (!event.target.closest(".sl-ai-drop")) {
      root.querySelectorAll(".sl-ai-drop.open").forEach(item => item.classList.remove("open"));
    }
  });
  $("#slSearch").addEventListener("input", render); $("#slMaterialFilter").addEventListener("change", render);
  render();
})();

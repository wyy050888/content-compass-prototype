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

  let scripts = [
    { id:"sl-001", sessionId:"session-mite-summer", name:"轻净 Pro 除螨仪_脚本_20260807", product:"轻净 Pro 除螨仪", source:"刚换的床单，也能吸出一杯脏东西。看得见的是表面，看不见的都藏在床垫深处。", sourceFull:"刚换的床单，也能吸出一杯脏东西。看得见的是表面，看不见的都藏在床垫深处。轻净 Pro 边拍边吸，脏东西直接进尘杯，用完还能拆下水洗。", duration:60, ratio:"9:16", materialMode:"depend", materialStatus:"4/4 已匹配", createdBy:"嗡大发", createdAt:"08/04 14:20", updatedBy:"嗡大发", updated:"08/11 14:32", rows:baseRows("depend") },
    { id:"sl-002", sessionId:"session-mite-summer", name:"轻净 Pro 除螨仪_脚本_20260806", product:"轻净 Pro 除螨仪", source:"床单刚换一周，第一遍照样能吸出碎屑和毛发。", sourceFull:"床单刚换一周，第一遍照样能吸出碎屑和毛发。床垫深处的脏东西，普通清理根本触达不到。轻净 Pro 拍打吸尘同步完成，尘杯可水洗。", duration:30, ratio:"9:16", materialMode:"free", materialStatus:"已生成提示词", createdBy:"李四", createdAt:"08/03 11:07", updatedBy:"李四", updated:"08/10 18:16", rows:baseRows("free") },
    { id:"sl-003", sessionId:"session-air-fryer-copy", name:"轻享空气炸锅 A8_快手晚餐脚本", product:"轻享空气炸锅 A8", source:"下班回家不想洗一堆锅，晚饭就用这一台解决。", sourceFull:"下班回家不想洗一堆锅，晚饭就用这一台解决。食材放进去，定好时间，外酥里嫩的一餐就能直接上桌。", duration:45, ratio:"9:16", materialMode:"depend", materialStatus:"4/4 已匹配", createdBy:"嗡大发", createdAt:"08/04 14:20", updatedBy:"嗡大发", updated:"08/05 10:20", rows:baseRows("depend") },
    { id:"sl-004", sessionId:"session-washer-script", name:"净界洗地机 S5_夏季清爽脚本", product:"净界洗地机 S5", source:"地上看着干净，拖一遍才知道脏东西有多少。", sourceFull:"地上看着干净，拖一遍才知道脏东西，净界洗地机 S5 洗拖同步，把日常地面清洁变成一件更省心的事。", duration:30, ratio:"16:9", materialMode:"free", materialStatus:"已生成提示词", createdBy:"李四", createdAt:"08/03 11:07", updatedBy:"李四", updated:"08/03 16:08", rows:baseRows("free") }
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

  function render() {
    const keyword = $("#slSearch").value.trim().toLowerCase();
    const mode = $("#slMaterialFilter").value;
    const list = scripts.filter(script => {
      const haystack = `${script.name} ${script.product} ${script.source}`.toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (mode === "all" || script.materialMode === mode);
    });
    const tbody = $("#slTbody");
    tbody.innerHTML = list.map((script, index) => `<tr data-script-id="${escapeHtml(script.id)}">
      <td><span class="sl-name">${escapeHtml(script.name)}</span></td>
      <td><span class="sl-product"><span>${escapeHtml(script.product)}</span></span></td>
      <td><span class="sl-source" data-full="${escapeHtml(script.sourceFull)}">${escapeHtml(script.source)}</span></td>
      <td><span class="sl-spec">${escapeHtml(specs(script))}</span></td>
      <td><span class="sl-chip ${script.materialMode}">${modeText(script.materialMode)}</span></td>
      <td class="asset-audit-cell"><b>${escapeHtml(script.createdBy || "—")}</b><small>${escapeHtml(script.createdAt || "—")}</small></td>
      <td class="asset-audit-cell"><b>${escapeHtml(script.updatedBy || script.createdBy || "—")}</b><small>${escapeHtml(script.updated)}</small></td>
      <td><div class="sl-actions">
        <button class="sl-action-btn view" data-sl-action="view">查看</button>
        <button class="sl-action-btn" data-sl-action="edit">编辑</button>
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
    </tr>`).join("");
    $("#slEmpty").hidden = Boolean(list.length);
    $("#slResultCount").textContent = `共 ${list.length} 条脚本`;
    tbody.querySelectorAll("[data-sl-menu-toggle]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const more = button.closest(".sl-action-more");
      const willOpen = !more.classList.contains("open");
      tbody.querySelectorAll(".sl-action-more.open").forEach(item => item.classList.remove("open"));
      more.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    }));
    tbody.querySelectorAll("[data-sl-action]").forEach(button => button.addEventListener("click", () => {
      const script = scripts.find(item => item.id === button.closest("tr").dataset.scriptId);
      button.closest(".sl-action-more")?.classList.remove("open");
      if (button.dataset.slAction === 'history') return window.AssetAudit?.showHistory('脚本', script.name);
      ({ view:openView, edit:openEdit, locate:locateSession, download:downloadScript, delete:confirmDelete })[button.dataset.slAction](script);
    }));
  }

  function storyTable(script, editable = false) {
    const dynamicHeader = script.materialMode === "depend" ? "推荐素材" : "生视频提示词";
    if (!editable) return `<div class="sl-story-wrap"><table class="sl-story-table"><thead><tr><th>镜头</th><th>时间段</th><th>对应口播片段</th><th>景别</th><th>运镜方式</th><th>画面内容描述</th><th>${dynamicHeader}</th></tr></thead><tbody>${script.rows.map(row => `<tr><td><span class="sl-shot">#${row.id}</span></td><td>${escapeHtml(row.time)}</td><td><span class="sl-cell-clamp">${escapeHtml(row.voice)}</span></td><td>${escapeHtml(row.shotType)}</td><td>${escapeHtml(row.cameraMove)}</td><td><span class="sl-cell-clamp">${escapeHtml(row.visual)}</span></td><td>${script.materialMode === "depend" ? `<div class="sl-material-mini"><span class="sl-material-cover">${escapeHtml((row.material || "M-CL-101").split(" · ")[0])}</span><div><strong>${escapeHtml(row.material || "智能匹配素材")}</strong><small>9:16 · 与镜头时长匹配</small></div></div>` : `<span class="sl-video-prompt">${escapeHtml(row.videoPrompt)}</span>`}</td></tr>`).join("")}</tbody></table></div>`;
    return `<div class="sl-story-wrap"><table class="sl-edit-table"><thead><tr><th>顺序</th><th>时间段</th><th>对应口播片段</th><th>景别</th><th>运镜方式</th><th>画面内容描述</th><th>${dynamicHeader}</th><th>操作</th></tr></thead><tbody data-edit-rows>${script.rows.map((row, index) => editRowHtml(row, index, script.materialMode)).join("")}</tbody></table></div><button class="sl-btn sl-add-row" type="button" data-add-row>＋ 新增分镜</button>`;
  }
  const editRowHtml = (row, index, mode) => `<tr data-row-index="${index}"><td><span class="sl-shot">#${index + 1}</span></td><td><input data-field="time" value="${escapeHtml(row.time)}"></td><td><textarea data-field="voice">${escapeHtml(row.voice)}</textarea></td><td><input data-field="shotType" value="${escapeHtml(row.shotType)}"></td><td><input data-field="cameraMove" value="${escapeHtml(row.cameraMove)}"></td><td><textarea data-field="visual">${escapeHtml(row.visual)}</textarea></td><td>${mode === "depend" ? `<input data-field="material" value="${escapeHtml(row.material || "智能匹配")}" aria-label="匹配素材">` : `<textarea data-field="videoPrompt" aria-label="生视频提示词">${escapeHtml(row.videoPrompt || "")}</textarea>`}</td><td class="sl-row-actions"><button class="sl-icon-btn" data-row-action="up" title="上移">↑</button><button class="sl-icon-btn" data-row-action="down" title="下移">↓</button><button class="sl-icon-btn delete" data-row-action="delete" title="删除">×</button></td></tr>`;

  function openView(script, callbacks = {}) {
    const body = `<div class="sl-meta-grid"><div class="sl-meta"><small>对应产品</small><strong>${escapeHtml(script.product)}</strong></div><div class="sl-meta"><small>规格</small><strong>${escapeHtml(specs(script))}</strong></div><div class="sl-meta"><small>素材策略</small><strong>${modeText(script.materialMode)}</strong></div></div><section class="sl-source-block"><div><span>生成文案</span><button class="sl-link-btn" type="button" data-expand-source>展开全文</button></div><p>${escapeHtml(script.sourceFull)}</p></section>${storyTable(script)}`;
    const host = modal(script.name, `最近更新：${script.updated}`, body, `<button class="sl-btn" data-view-edit>编辑脚本</button><button class="sl-btn" data-view-locate>定位至会话</button><button class="sl-btn" data-view-download>下载脚本</button><button class="sl-btn primary" data-close>关闭</button>`);
    host.querySelector("[data-expand-source]").addEventListener("click", event => { const box = event.currentTarget.closest(".sl-source-block"); box.classList.toggle("expanded"); event.currentTarget.textContent = box.classList.contains("expanded") ? "收起全文" : "展开全文"; });
    host.querySelector("[data-view-edit]").addEventListener("click", () => { host.remove(); openEdit(script, callbacks); });
    host.querySelector("[data-view-locate]").addEventListener("click", () => { host.remove(); locateSession(script); });
    host.querySelector("[data-view-download]").addEventListener("click", () => downloadScript(script));
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
  function openEdit(script, callbacks = {}) {
    const draft = clone(script);
    const body = `<div class="sl-edit-form"><label class="sl-edit-field"><span>脚本名称 *</span><input id="slEditName" value="${escapeHtml(draft.name)}"></label><label class="sl-edit-field"><span>目标时长（秒） *</span><input id="slEditDuration" type="number" min="1" step="1" value="${draft.duration}"></label><label class="sl-edit-field"><span>画面比例 *</span><select id="slEditRatio"><option ${draft.ratio === "9:16" ? "selected" : ""}>9:16</option><option ${draft.ratio === "16:9" ? "selected" : ""}>16:9</option></select></label><label class="sl-edit-field sl-mode-field"><span>素材策略 *</span><select id="slEditMode"><option value="depend" ${draft.materialMode === "depend" ? "selected" : ""}>依赖素材库</option><option value="free" ${draft.materialMode === "free" ? "selected" : ""}>不依赖素材库</option></select></label></div><label class="sl-edit-field sl-edit-product"><span>对应产品 *</span><select id="slEditProduct">${productOptionsHtml(draft.product)}</select></label><div data-edit-dynamic></div><div data-edit-story></div>`;
    const host = modal(`编辑脚本 · ${script.name}`, "修改仅作用于当前脚本，不影响生成文案或其他脚本。", body, `<button class="sl-btn sl-danger" data-edit-delete>删除脚本</button><button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-save-edit>保存修改</button>`);
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
        // 中文播报语速:约 4 字/秒(240 字/分钟,带货/口播脚本常用基线)
        const CHARS_PER_SECOND = 4;
        const countChars = text => (text || "").replace(/\s/g, "").length;
        const totalChars = draft.rows.reduce((sum, row) => sum + countChars(row.voice), 0);
        if (totalChars === 0) return toast("暂无口播内容,无法计算");
        const totalSeconds = Math.max(1, Math.ceil(totalChars / CHARS_PER_SECOND));
        // 按每行口播字数比例重新分配时间段(每条最少 1 秒,余量补到最后一行)
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
    renderEditor();
    host.querySelector("#slEditMode").addEventListener("change", event => { collectRows(host, draft); draft.materialMode = event.target.value; renderEditor(); });
    host.querySelector("[data-save-edit]").addEventListener("click", () => {
      collectRows(host, draft); draft.name = host.querySelector("#slEditName").value.trim(); draft.duration = Number(host.querySelector("#slEditDuration").value); draft.ratio = host.querySelector("#slEditRatio").value; draft.product = host.querySelector("#slEditProduct").value.trim();
      if (!draft.name || !Number.isInteger(draft.duration) || draft.duration <= 0 || !draft.rows.length) return toast("请完整填写脚本名称、时长和至少一条分镜");
      if (draft.rows.some(row => !row.time || !row.voice || !row.visual || (draft.materialMode === "free" && !row.videoPrompt))) return toast(draft.materialMode === "free" ? "请补充每条分镜的生视频提示词" : "请补充分镜必填信息");
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
    return { id:`asset-${asset.id}`, sessionId:asset.sessionId || activeSession?.dataset.sessionId || "", name:asset.title || "未命名脚本", product:asset.productName || "轻净 Pro 除螨仪", source:asset.sourceTitle || "当前生成文案", sourceFull:asset.sourceContent || asset.sourceTitle || "当前生成文案", duration:Math.max(1, rows.length * 4), ratio:"9:16", materialMode:mode, materialStatus:mode === "depend" ? `${rows.length}/${rows.length} 已匹配` : "已生成提示词", createdBy:"嗡大发", createdAt, updatedBy:"嗡大发", updated:createdAt, rows };
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
  window.addEventListener("script-library:sync", event => { const { action, asset } = event.detail || {}; if (!asset) return; const id = `asset-${asset.id}`; if (action === "remove") scripts = scripts.filter(script => script.id !== id); else { const normalized = normalizeAsset(asset); scripts = [normalized, ...scripts.filter(script => script.id !== id)]; } render(); notifyChange(); });
  window.ContentCompassScriptLibrary = {
    list() { return scripts; },
    open(script, action, callbacks = {}) {
      if (!script) return;
      const actions = { "查看":openView, "编辑":openEdit, "定位至会话":locateSession, "下载":downloadScript, "删除":confirmDelete, "重新匹配素材":rematch };
      actions[action]?.(clone(script), callbacks);
    }
  };
  document.addEventListener("click", event => {
    if (!event.target.closest(".sl-action-more")) {
      root.querySelectorAll(".sl-action-more.open").forEach(item => item.classList.remove("open"));
    }
  });
  $("#slSearch").addEventListener("input", render); $("#slMaterialFilter").addEventListener("change", render);
  render();
})();

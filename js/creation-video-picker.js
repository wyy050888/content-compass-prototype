(function () {
  let pickerRoot;
  let pickerState = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
  const statusOrder = ["待分析", "分析中", "已分析", "分析失败"];
  const sourceOrder = ["无限画板", "本地上传", "智能混剪"];

  function sourceItems() { return pickerState.items.filter(item => item.source === pickerState.source); }
  function tagsFor(items = sourceItems()) { return [...new Set(items.flatMap(item => item.tags || []))]; }
  function isFinishedLinked(item) { return String(item.auxiliary || "").includes("已关联千川"); }
  function resetFilters() {
    pickerState.filters = { query:"", sourceScope:"all", channel:"all", status:"all", relation:"all", tags:[] };
  }
  function filteredItems() {
    const filters = pickerState.filters;
    return sourceItems().filter(item => {
      const queryText = [item.title, item.id, item.product, item.channel, item.origin, item.file, ...(item.tags || [])].join(" ").toLowerCase();
      const matchingScope = pickerState.source === "finished"
        ? filters.sourceScope === "all" || item.origin === filters.sourceScope
        : filters.channel === "all" || item.channel === filters.channel;
      const matchingRelation = pickerState.source !== "finished" || filters.relation === "all" || (filters.relation === "linked" ? isFinishedLinked(item) : !isFinishedLinked(item));
      return (!filters.query || queryText.includes(filters.query.toLowerCase()))
        && matchingScope && matchingRelation
        && (filters.status === "all" || item.status === filters.status)
        && filters.tags.every(tag => (item.tags || []).includes(tag));
    });
  }
  function closePicker() {
    if (!pickerRoot) return;
    pickerRoot.hidden = true;
    pickerState = null;
    document.body.classList.remove("creation-video-picker-open");
  }
  function toggleMenu(name) {
    pickerState.menu = pickerState.menu === name ? "" : name;
    renderPicker();
  }
  function filterMenu(name, label, options) {
    const current = pickerState.filters[name];
    return `<div class="creation-video-filter-menu"><button type="button" data-cvp-menu="${name}"><span>◉</span>${escapeHtml(label)}</button><div class="creation-video-filter-options" ${pickerState.menu === name ? "" : "hidden"}>${options.map(([value, text]) => `<button type="button" class="${current === value ? "active" : ""}" data-cvp-filter="${name}" data-cvp-value="${escapeHtml(value)}">${escapeHtml(text)}</button>`).join("")}</div></div>`;
  }
  function renderToolbar() {
    const filters = pickerState.filters;
    if (pickerState.source === "finished") {
      const items = sourceItems();
      const scopes = ["all", ...sourceOrder.filter(source => items.some(item => item.origin === source))];
      const statuses = ["all", ...statusOrder.filter(status => items.some(item => item.status === status))];
      return `<div class="creation-video-picker-toolbar cvp-finished-toolbar">
        <div class="creation-video-source-scope-tabs">${scopes.map(scope => `<button type="button" class="${filters.sourceScope === scope ? "active" : ""}" data-cvp-source-scope="${escapeHtml(scope)}">${scope === "all" ? "全部" : escapeHtml(scope)}<b>${scope === "all" ? items.length : items.filter(item => item.origin === scope).length}</b></button>`).join("")}</div>
        <button class="creation-video-tag-trigger" type="button" data-cvp-tag-filter>◇<span>${filters.tags.length ? `已选 ${filters.tags.length} 标签` : "视频标签"}</span></button>
        ${filterMenu("status", filters.status === "all" ? "全部状态" : filters.status, [["all", "全部状态"], ...statuses.filter(status => status !== "all").map(status => [status, status])])}
        ${filterMenu("relation", filters.relation === "all" ? "全部关联" : filters.relation === "linked" ? "已关联千川" : "未关联千川", [["all", "全部关联"], ["linked", "已关联千川"], ["unlinked", "未关联千川"]])}
        <label class="creation-video-search">⌕<input type="search" data-cvp-query placeholder="搜索视频名称、产品名称、视频标签或千川素材 ID" value="${escapeHtml(filters.query)}"></label>
      </div>`;
    }
    const items = sourceItems();
    const platforms = ["all", ...[...new Set(items.map(item => item.channel).filter(Boolean))]];
    const statuses = ["all", ...statusOrder.filter(status => items.some(item => item.status === status))];
    return `<div class="creation-video-picker-toolbar cvp-external-toolbar">
      ${filterMenu("channel", filters.channel === "all" ? "全部平台" : filters.channel, platforms.map(platform => [platform, platform === "all" ? "全部平台" : platform]))}
      <button class="creation-video-tag-trigger" type="button" data-cvp-tag-filter>◇<span>${filters.tags.length ? `已选 ${filters.tags.length} 标签` : "视频标签"}</span></button>
      ${filterMenu("status", filters.status === "all" ? "全部状态" : filters.status, [["all", "全部状态"], ...statuses.filter(status => status !== "all").map(status => [status, status])])}
      <label class="creation-video-search">⌕<input type="search" data-cvp-query placeholder="搜索视频名称、关联产品或视频标签" value="${escapeHtml(filters.query)}"></label>
    </div>`;
  }
  function renderCard(item, index) {
    const selected = pickerState.pendingId === item.id;
    const statusClass = ({ "已分析":"done", "分析中":"running", "分析失败":"failed" })[item.status] || "pending";
    const origin = item.origin || (pickerState.source === "finished" ? "本地上传" : "采集");
    const sourceClass = pickerState.source === "finished"
      ? ({ "智能混剪":"remix", "无限画板":"infinite", "本地上传":"local" })[origin] || "local"
      : origin === "本地" ? "local" : "collect";
    const product = item.product || "未关联产品";
    const meta = String(item.updated || "--").replace(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}).*$/, "$2/$3 $4");
    const relation = pickerState.source === "finished" && isFinishedLinked(item);
    return `<button type="button" class="creation-video-card ${selected ? "selected" : ""}" data-cvp-item="${escapeHtml(item.id)}" aria-pressed="${selected}">
      <span class="creation-video-visual tone-${index % 5}">
        <span class="creation-video-status ${statusClass}"><i></i>${escapeHtml(item.status || "待分析")}</span>
        <span class="creation-video-check">✓</span>
        <span class="creation-video-source ${sourceClass}">${escapeHtml(origin)}</span>
        <span class="creation-video-play">▶</span><em>${escapeHtml(item.duration || "--:--")}</em>
      </span>
      <span class="creation-video-body"><strong title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</strong><span class="creation-video-tags"><b class="product ${item.product ? "" : "empty"}">${escapeHtml(product)}</b>${relation ? '<b class="qianchuan">已关联千川</b>' : pickerState.source === "external" ? `<b class="platform">${escapeHtml(item.channel || "其他")}</b>` : ""}</span><small>${escapeHtml(meta)}</small></span>
    </button>`;
  }
  function renderPicker() {
    if (!pickerState) return;
    const visible = filteredItems();
    const selected = pickerState.items.find(item => item.id === pickerState.pendingId);
    pickerRoot.querySelector("[data-cvp-toolbar]").innerHTML = renderToolbar();
    pickerRoot.querySelector("[data-cvp-count]").textContent = `共 ${sourceItems().length} 条视频 · 已分析 ${sourceItems().filter(item => item.status === "已分析").length} 条`;
    pickerRoot.querySelector("[data-cvp-grid]").innerHTML = visible.length ? visible.map(renderCard).join("") : `<div class="creation-video-picker-empty"><b>没有匹配的视频</b><span>请调整筛选条件，或前往视频库导入视频。</span></div>`;
    pickerRoot.querySelector("[data-cvp-selection]").innerHTML = selected ? `已选择：<b>${escapeHtml(selected.title)}</b>` : "请选择一条视频";
    pickerRoot.querySelector("[data-cvp-confirm]").disabled = !selected;
    pickerRoot.querySelectorAll("[data-cvp-source]").forEach(tab => {
      const active = tab.dataset.cvpSource === pickerState.source;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.querySelector("b").textContent = pickerState.items.filter(item => item.source === tab.dataset.cvpSource).length;
    });
  }
  function openTagFilter() {
    const currentItems = sourceItems();
    const allTags = tagsFor(currentItems);
    const draft = new Set(pickerState.filters.tags);
    const groups = [
      { id:"all", name:"全部标签", match:() => true },
      { id:"content", name:"内容主题", match:tag => /钩子|证明|种草|人群|结果/.test(tag) },
      { id:"scene", name:"使用场景", match:tag => !/钩子|证明|种草|人群|结果/.test(tag) }
    ];
    const overlay = document.createElement("div");
    overlay.className = "creation-video-tag-overlay";
    overlay.innerHTML = `<section class="creation-video-tag-modal" role="dialog" aria-modal="true"><header><div><small>视频标签</small><h3>按标签筛选</h3><p>可多选标签，筛选同时满足全部标签的视频。</p></div><button type="button" data-cvp-tag-close>×</button></header><div class="creation-video-tag-body"><aside data-cvp-tag-groups></aside><main><label class="creation-video-tag-search">⌕<input type="search" placeholder="搜索标签" data-cvp-tag-search></label><div class="creation-video-tag-choices" data-cvp-tag-choices></div><div class="creation-video-tag-create"><button type="button" data-cvp-tag-new>＋ 新建标签</button><div hidden data-cvp-tag-new-row><input maxlength="20" placeholder="输入标签名称" data-cvp-tag-new-input><button type="button" data-cvp-tag-add>添加</button></div></div><small data-cvp-tag-error></small></main></div><footer><span data-cvp-tag-selected></span><div><button type="button" data-cvp-tag-clear>清空</button><button type="button" class="primary" data-cvp-tag-apply>确认筛选</button></div></footer></section>`;
    document.body.appendChild(overlay);
    const state = { group:"all", query:"" };
    const render = () => {
      const shown = allTags.filter(tag => groups.find(group => group.id === state.group).match(tag) && (!state.query || tag.includes(state.query)));
      overlay.querySelector("[data-cvp-tag-groups]").innerHTML = groups.map(group => `<button type="button" class="${state.group === group.id ? "active" : ""}" data-cvp-tag-group="${group.id}"><span>${group.name}</span><b>${allTags.filter(group.match).length}</b></button>`).join("");
      overlay.querySelector("[data-cvp-tag-choices]").innerHTML = shown.length ? shown.map(tag => `<button type="button" class="${draft.has(tag) ? "selected" : ""}" data-cvp-tag-choice="${escapeHtml(tag)}">${escapeHtml(tag)}${draft.has(tag) ? "<span>✓</span>" : ""}</button>`).join("") : '<span class="creation-video-tag-empty">该分组下还没有标签</span>';
      overlay.querySelector("[data-cvp-tag-selected]").textContent = `已选 ${draft.size} 个标签`;
    };
    const close = () => overlay.remove();
    overlay.addEventListener("click", event => {
      if (event.target === overlay || event.target.closest("[data-cvp-tag-close]")) return close();
      const group = event.target.closest("[data-cvp-tag-group]");
      if (group) { state.group = group.dataset.cvpTagGroup; return render(); }
      const choice = event.target.closest("[data-cvp-tag-choice]");
      if (choice) { const tag = choice.dataset.cvpTagChoice; draft.has(tag) ? draft.delete(tag) : draft.add(tag); return render(); }
      if (event.target.closest("[data-cvp-tag-clear]")) { draft.clear(); return render(); }
      if (event.target.closest("[data-cvp-tag-new]")) { const row = overlay.querySelector("[data-cvp-tag-new-row]"); row.hidden = !row.hidden; row.querySelector("input").focus(); return; }
      if (event.target.closest("[data-cvp-tag-add]")) {
        const input = overlay.querySelector("[data-cvp-tag-new-input]"); const tag = input.value.trim(); const error = overlay.querySelector("[data-cvp-tag-error]");
        if (!tag) { error.textContent = "请输入标签名称"; return; }
        if (allTags.includes(tag)) { error.textContent = "已存在同名标签"; return; }
        allTags.push(tag); currentItems[0]?.tags?.push(tag); draft.add(tag); input.value = ""; error.textContent = ""; return render();
      }
      if (event.target.closest("[data-cvp-tag-apply]")) { pickerState.filters.tags = [...draft]; close(); renderPicker(); }
    });
    overlay.querySelector("[data-cvp-tag-search]").addEventListener("input", event => { state.query = event.target.value.trim(); render(); });
    render();
  }
  function ensurePicker() {
    if (pickerRoot) return pickerRoot;
    pickerRoot = document.createElement("div");
    pickerRoot.className = "creation-video-picker-backdrop";
    pickerRoot.hidden = true;
    pickerRoot.innerHTML = `<section class="creation-video-picker-modal" role="dialog" aria-modal="true" aria-labelledby="creationVideoPickerTitle"><header class="creation-video-picker-head"><div><h2 id="creationVideoPickerTitle">选择参考视频</h2><p>从视频库中选择一条视频，按当前任务读取可用的分析信息。</p></div><button type="button" class="creation-video-picker-close" data-cvp-close aria-label="关闭">×</button></header><div class="creation-video-source-tabs" role="tablist"><button type="button" data-cvp-source="finished" role="tab">成品视频 <b></b></button><button type="button" data-cvp-source="external" role="tab">外部参考视频 <b></b></button></div><div data-cvp-toolbar></div><div class="creation-video-picker-summary"><span data-cvp-count></span></div><div class="creation-video-picker-grid" data-cvp-grid></div><footer class="creation-video-picker-foot"><span data-cvp-selection>请选择一条视频</span><div><button type="button" class="video-picker-secondary" data-cvp-close>取消</button><button type="button" class="video-picker-primary" data-cvp-confirm disabled>确认选择</button></div></footer></section>`;
    document.body.appendChild(pickerRoot);
    pickerRoot.addEventListener("click", event => {
      if (event.target === pickerRoot || event.target.closest("[data-cvp-close]")) return closePicker();
      const tab = event.target.closest("[data-cvp-source]");
      if (tab) { pickerState.source = tab.dataset.cvpSource; pickerState.pendingId = ""; pickerState.menu = ""; resetFilters(); return renderPicker(); }
      const scope = event.target.closest("[data-cvp-source-scope]");
      if (scope) { pickerState.filters.sourceScope = scope.dataset.cvpSourceScope; return renderPicker(); }
      if (event.target.closest("[data-cvp-tag-filter]")) return openTagFilter();
      const menu = event.target.closest("[data-cvp-menu]");
      if (menu) return toggleMenu(menu.dataset.cvpMenu);
      const filter = event.target.closest("[data-cvp-filter]");
      if (filter) { pickerState.filters[filter.dataset.cvpFilter] = filter.dataset.cvpValue; pickerState.menu = ""; return renderPicker(); }
      const card = event.target.closest("[data-cvp-item]");
      if (card) { pickerState.pendingId = card.dataset.cvpItem; return renderPicker(); }
      if (event.target.closest("[data-cvp-confirm]") && pickerState.pendingId) { const selected = pickerState.items.find(item => item.id === pickerState.pendingId); pickerState.onConfirm?.(selected); closePicker(); }
    });
    pickerRoot.addEventListener("input", event => { if (event.target.matches("[data-cvp-query]")) { pickerState.filters.query = event.target.value; renderPicker(); } });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !pickerRoot.hidden) closePicker(); });
    return pickerRoot;
  }
  function openPicker(options) {
    ensurePicker();
    const items = Array.isArray(options.items) ? options.items : [];
    const selected = items.find(item => item.id === options.selectedId);
    pickerState = { items, pendingId:options.selectedId || "", source:selected?.source || options.source || "finished", loading:Boolean(options.loading), onConfirm:options.onConfirm, menu:"" };
    if (!items.some(item => item.source === pickerState.source)) pickerState.source = items.some(item => item.source === "finished") ? "finished" : "external";
    resetFilters();
    pickerRoot.hidden = false;
    document.body.classList.add("creation-video-picker-open");
    renderPicker();
  }
  function setItems(items) {
    if (!pickerState) return;
    pickerState.items = Array.isArray(items) ? items : [];
    pickerState.loading = false;
    if (!pickerState.items.some(item => item.source === pickerState.source)) pickerState.source = pickerState.items.some(item => item.source === "finished") ? "finished" : "external";
    renderPicker();
  }
  window.CreationVideoPicker = { open:openPicker, close:closePicker, setItems };
})();

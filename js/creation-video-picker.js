(function () {
  let pickerRoot;
  let pickerState = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  })[char]);

  function ensurePicker() {
    if (pickerRoot) return pickerRoot;
    pickerRoot = document.createElement("div");
    pickerRoot.className = "creation-video-picker-backdrop";
    pickerRoot.hidden = true;
    pickerRoot.innerHTML = `
      <section class="creation-video-picker-modal" role="dialog" aria-modal="true" aria-labelledby="creationVideoPickerTitle">
        <header class="creation-video-picker-head">
          <div><h2 id="creationVideoPickerTitle">选择参考视频</h2><p>选择已分析视频后读取口播与拉片结果；只学习内容方法，不复制原文。</p></div>
          <button type="button" class="creation-video-picker-close" data-video-modal-close aria-label="关闭">×</button>
        </header>
        <div class="creation-video-source-tabs" role="tablist" aria-label="视频来源">
          <button type="button" data-video-source="finished" role="tab">成片视频 <b data-video-source-count="finished"></b></button>
          <button type="button" data-video-source="external" role="tab">外部参考视频 <b data-video-source-count="external"></b></button>
        </div>
        <div class="creation-video-picker-toolbar">
          <label class="creation-video-search"><span>⌕</span><input type="search" data-video-modal-search placeholder="搜索视频名称、素材 ID、关联产品或标签"></label>
          <select data-video-modal-channel aria-label="筛选来源或平台"></select>
          <select data-video-modal-status aria-label="筛选分析状态"></select>
        </div>
        <div class="creation-video-picker-summary"><span data-video-modal-count></span><button type="button" data-video-modal-reset>重置筛选</button></div>
        <div class="creation-video-picker-grid" data-video-modal-grid></div>
        <footer class="creation-video-picker-foot">
          <span data-video-modal-selection>暂未选择参考视频</span>
          <div><button type="button" class="video-picker-secondary" data-video-modal-close>取消</button><button type="button" class="video-picker-primary" data-video-modal-confirm disabled>确认选择</button></div>
        </footer>
      </section>`;
    document.body.appendChild(pickerRoot);

    pickerRoot.addEventListener("click", event => {
      if (event.target === pickerRoot || event.target.closest("[data-video-modal-close]")) return closePicker();
      const sourceTab = event.target.closest("[data-video-source]");
      if (sourceTab) {
        pickerState.source = sourceTab.dataset.videoSource;
        configureSourceFilters();
        resetFilters();
        renderVideos();
        return;
      }
      if (event.target.closest("[data-video-modal-reset]")) {
        resetFilters();
        renderVideos();
        return;
      }
      const card = event.target.closest("[data-video-modal-item]");
      if (card) {
        pickerState.pendingId = card.dataset.videoModalItem;
        renderVideos();
        return;
      }
      if (event.target.closest("[data-video-modal-confirm]") && pickerState?.pendingId) {
        const selected = pickerState.items.find(item => item.id === pickerState.pendingId);
        pickerState.onConfirm?.(selected);
        closePicker();
      }
    });
    pickerRoot.addEventListener("input", event => {
      if (event.target.matches("[data-video-modal-search]")) renderVideos();
    });
    pickerRoot.addEventListener("change", event => {
      if (event.target.matches("[data-video-modal-channel], [data-video-modal-status]")) renderVideos();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !pickerRoot.hidden) closePicker();
    });
    return pickerRoot;
  }

  function setOptions(select, prefix, values) {
    select.innerHTML = `<option value="">全部${prefix}</option>${values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  }

  function resetFilters() {
    pickerRoot.querySelector("[data-video-modal-search]").value = "";
    pickerRoot.querySelector("[data-video-modal-channel]").value = "";
    pickerRoot.querySelector("[data-video-modal-status]").value = "";
  }

  function configureSourceFilters() {
    const items = pickerState.items.filter(item => item.source === pickerState.source);
    setOptions(
      pickerRoot.querySelector("[data-video-modal-channel]"),
      pickerState.source === "finished" ? "来源" : "平台",
      [...new Set(items.map(item => item.channel).filter(Boolean))]
    );
    setOptions(pickerRoot.querySelector("[data-video-modal-status]"), "状态", [...new Set(items.map(item => item.status).filter(Boolean))]);
  }

  function renderVideos() {
    if (!pickerState) return;
    const keyword = pickerRoot.querySelector("[data-video-modal-search]").value.trim().toLowerCase();
    const channel = pickerRoot.querySelector("[data-video-modal-channel]").value;
    const status = pickerRoot.querySelector("[data-video-modal-status]").value;
    const visible = pickerState.items.filter(item => {
      const haystack = [item.title, item.id, item.channel, item.product, item.origin, item.file, ...(item.tags || [])].join(" ").toLowerCase();
      return item.source === pickerState.source && (!keyword || haystack.includes(keyword)) && (!channel || item.channel === channel) && (!status || item.status === status);
    });
    pickerRoot.querySelectorAll("[data-video-source]").forEach(tab => {
      const active = tab.dataset.videoSource === pickerState.source;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    pickerRoot.querySelectorAll("[data-video-source-count]").forEach(count => {
      count.textContent = pickerState.items.filter(item => item.source === count.dataset.videoSourceCount).length;
    });
    pickerRoot.querySelector("[data-video-modal-count]").textContent = pickerState.loading ? "正在加载视频库…" : `共 ${visible.length} 个视频`;
    pickerRoot.querySelector("[data-video-modal-grid]").innerHTML = visible.length ? visible.map((item, index) => {
      const selected = pickerState.pendingId === item.id;
      const analyzed = item.status === "已分析";
      return `<button type="button" class="creation-video-card${selected ? " selected" : ""}" data-video-modal-item="${escapeHtml(item.id)}" aria-pressed="${selected}">
        <span class="creation-video-cover tone-${index % 4}"><i>▶</i><b>${escapeHtml(item.duration)}</b><em>${escapeHtml(item.origin)}</em></span>
        <span class="creation-video-card-info">
          <span class="creation-video-card-check">${selected ? "✓" : ""}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.id)} · 更新于 ${escapeHtml(item.updated)}</small>
          <span class="creation-video-card-tags"><i>${escapeHtml(item.channel)}</i><i>${escapeHtml(item.product || "未关联产品")}</i><i class="status ${analyzed ? "ready" : ""}">${escapeHtml(item.status)}</i></span>
          ${item.detailLabel || item.detail ? `<span class="creation-video-card-insight"><em>${escapeHtml(item.detailLabel || "视频信息")}</em>${escapeHtml(item.detail || "—")}</span>` : ""}
          <span class="creation-video-card-bottom"><span>${(item.tags || []).slice(0, 3).map(tag => `<i>${escapeHtml(tag)}</i>`).join("")}</span><small>${escapeHtml(item.auxiliary || "")}</small></span>
        </span>
      </button>`;
    }).join("") : pickerState.loading
      ? `<div class="creation-video-picker-empty"><b>正在加载视频库</b><span>请稍候，视频目录加载完成后会自动显示。</span></div>`
      : `<div class="creation-video-picker-empty"><b>没有找到匹配视频</b><span>试试更换关键词，或重置平台、产品和分析状态筛选。</span></div>`;
    const selected = pickerState.items.find(item => item.id === pickerState.pendingId);
    pickerRoot.querySelector("[data-video-modal-selection]").innerHTML = selected ? `已选择：<b>${escapeHtml(selected.title)}</b>` : "暂未选择参考视频";
    pickerRoot.querySelector("[data-video-modal-confirm]").disabled = !selected;
  }

  function openPicker(options) {
    ensurePicker();
    const items = Array.isArray(options.items) ? options.items : [];
    const selected = items.find(item => item.id === options.selectedId);
    pickerState = { items, pendingId:options.selectedId || "", source:selected?.source || options.source || "finished", loading:Boolean(options.loading), onConfirm:options.onConfirm };
    configureSourceFilters();
    resetFilters();
    pickerRoot.hidden = false;
    document.body.classList.add("creation-video-picker-open");
    renderVideos();
    requestAnimationFrame(() => pickerRoot.querySelector("[data-video-modal-search]").focus());
  }

  function closePicker() {
    if (!pickerRoot) return;
    pickerRoot.hidden = true;
    pickerState = null;
    document.body.classList.remove("creation-video-picker-open");
  }

  function setItems(items) {
    if (!pickerState) return;
    pickerState.items = Array.isArray(items) ? items : [];
    pickerState.loading = false;
    if (!pickerState.items.some(item => item.source === pickerState.source)) {
      pickerState.source = pickerState.items.some(item => item.source === "finished") ? "finished" : "external";
    }
    configureSourceFilters();
    resetFilters();
    renderVideos();
  }

  window.CreationVideoPicker = { open: openPicker, close: closePicker, setItems };
})();

(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const state = { taskId: "", filter: "all", checked: new Set(), viewerIds: [], viewerIndex: 0 };
  const viewer = document.createElement("div");
  viewer.className = "pc-screen-viewer-layer";
  viewer.setAttribute("aria-hidden", "true");
  viewer.innerHTML = `<button class="pc-screen-viewer-mask" type="button" aria-label="关闭大图" data-screen-viewer-close></button><section class="pc-screen-viewer" role="dialog" aria-modal="true" aria-labelledby="pcScreenViewerTitle"><header><div><small id="pcScreenViewerIndex"></small><h3 id="pcScreenViewerTitle">逐张筛选</h3></div><button class="pc-icon-btn" type="button" aria-label="关闭" data-screen-viewer-close>×</button></header><div class="pc-screen-viewer-body" id="pcScreenViewerBody"></div></section>`;
  app.root.appendChild(viewer);

  const task = () => app.data.generationTasks.find(item => item.id === state.taskId);
  const allImages = () => app.data.images.filter(image => image.taskId === state.taskId);
  const visibleImages = () => state.filter === "all" ? allImages() : allImages().filter(image => image.screenStatus === state.filter);
  const statusText = status => ({ pending: "待筛选", selected: "已选用", rejected: "不选用" })[status] || status;
  const imageVisual = image => `<div class="pc-generated-placeholder tone-${image.order % 6 + 1}"><b>${image.order}</b><span>规则 ${image.ruleIndex}</span></div>`;

  function filterButton(status, label, count) {
    return `<button data-screen-filter="${status}" class="${state.filter === status ? "active" : ""}">${label} ${count}</button>`;
  }

  function renderScreen(options = {}) {
    const box = app.els.drawerBody.querySelector("#pcScreenDrawer");
    if (!box) return;
    const scrollTop = app.els.drawerBody.scrollTop;
    const images = allImages();
    const visible = visibleImages();
    const count = status => images.filter(image => image.screenStatus === status).length;
    const checkedCount = [...state.checked].filter(id => visible.some(image => image.id === id)).length;
    const allChecked = visible.length > 0 && visible.every(image => state.checked.has(image.id));
    box.innerHTML = `<div class="pc-image-toolbar pc-screen-toolbar"><div class="pc-segmented">${filterButton("all", "全部", images.length)}${filterButton("pending", "待筛选", count("pending"))}${filterButton("selected", "选用", count("selected"))}${filterButton("rejected", "不选用", count("rejected"))}</div><div class="pc-screen-batch"><label><input type="checkbox" data-screen-check-all ${allChecked ? "checked" : ""} ${visible.length ? "" : "disabled"}> 全选当前</label><span>已选 ${checkedCount} 张</span><button class="pc-btn" data-screen-batch="selected" ${checkedCount ? "" : "disabled"}>批量选用</button><button class="pc-btn" data-screen-batch="rejected" ${checkedCount ? "" : "disabled"}>批量不选用</button><button class="pc-btn pc-btn-quiet" data-screen-batch="clear" ${checkedCount ? "" : "disabled"}>取消选择</button></div></div><div class="pc-image-grid pc-screen-grid">${visible.length ? visible.map(image => `<article class="pc-image-card pc-screen-card ${image.screenStatus}"><label class="pc-screen-check" title="加入批量操作"><input type="checkbox" data-screen-check="${image.id}" ${state.checked.has(image.id) ? "checked" : ""}></label><span class="pc-screen-status ${image.screenStatus}">${statusText(image.screenStatus)}</span><button class="pc-screen-open" type="button" data-screen-open="${image.id}" aria-label="查看并筛选 ${app.escape(image.fileName)}">${imageVisual(image)}</button>${image.distributionCount ? `<span class="pc-uploaded-mark">已分发 ${image.distributionCount} 次</span>` : ""}<div class="pc-image-meta"><strong title="${app.escape(image.fileName)}">${app.escape(image.fileName)}</strong><span>规则 ${image.ruleIndex}</span></div></article>`).join("") : `<div class="pc-empty pc-screen-empty">当前状态下没有图片</div>`}</div>`;
    if (options.preserveScroll) requestAnimationFrame(() => { app.els.drawerBody.scrollTop = scrollTop; });
  }

  function saveDecision(image, status) {
    image.screenStatus = status;
    app.renderGeneration?.();
  }

  function setBatchStatus(status) {
    const ids = [...state.checked];
    if (status === "clear") { state.checked.clear(); renderScreen({ preserveScroll: true }); return; }
    ids.forEach(id => { const image = app.data.images.find(item => item.id === id); if (image) saveDecision(image, status); });
    state.checked.clear();
    renderScreen({ preserveScroll: true });
    app.toast(`已将 ${ids.length} 张图片设为${status === "selected" ? "选用" : "不选用"}`);
  }

  function currentViewerImage() {
    return app.data.images.find(image => image.id === state.viewerIds[state.viewerIndex]);
  }

  function renderViewer() {
    const image = currentViewerImage();
    if (!image) { closeViewer(); return; }
    const generationTask = task();
    const prompt = generationTask?.rules?.[Math.max(0, image.ruleIndex - 1)]?.prompt || "—";
    viewer.querySelector("#pcScreenViewerIndex").textContent = `${state.viewerIndex + 1} / ${state.viewerIds.length} · 规则 ${image.ruleIndex}`;
    viewer.querySelector("#pcScreenViewerTitle").textContent = image.fileName;
    viewer.querySelector("#pcScreenViewerBody").innerHTML = `<div class="pc-screen-large-image">${imageVisual(image)}</div><div class="pc-screen-viewer-info"><div><span>当前状态</span><b class="pc-screen-status ${image.screenStatus}">${statusText(image.screenStatus)}</b></div><div><span>所属任务</span><b>${app.escape(generationTask?.name || "—")}</b></div><div><span>提示词</span><b class="pc-screen-viewer-prompt" title="${app.escape(prompt)}">${app.escape(prompt)}</b></div></div><div class="pc-screen-viewer-actions"><button class="pc-btn" data-screen-viewer-nav="prev" ${state.viewerIndex === 0 ? "disabled" : ""}>上一张</button><div><button class="pc-screen-decision selected" data-screen-viewer-status="selected">✓ 选用</button><button class="pc-screen-decision rejected" data-screen-viewer-status="rejected">× 不选用</button></div><button class="pc-btn" data-screen-viewer-nav="next" ${state.viewerIndex === state.viewerIds.length - 1 ? "disabled" : ""}>下一张</button></div><p class="pc-screen-shortcuts">方向键切换 · Enter 选用 · Delete 不选用</p>`;
  }

  function openViewer(imageId) {
    state.viewerIds = visibleImages().map(image => image.id);
    state.viewerIndex = Math.max(0, state.viewerIds.indexOf(imageId));
    renderViewer();
    viewer.classList.add("show");
    viewer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => viewer.querySelector("[data-screen-viewer-close]")?.focus());
  }

  function closeViewer() {
    viewer.classList.remove("show");
    viewer.setAttribute("aria-hidden", "true");
  }

  function moveViewer(step) {
    state.viewerIndex = Math.max(0, Math.min(state.viewerIds.length - 1, state.viewerIndex + step));
    renderViewer();
  }

  function decideInViewer(status) {
    const image = currentViewerImage();
    if (!image) return;
    saveDecision(image, status);
    renderScreen({ preserveScroll: true });
    if (state.viewerIndex < state.viewerIds.length - 1) moveViewer(1);
    else { renderViewer(); app.toast("本轮筛选完成，可继续回看修改"); }
  }

  app.openGenerationScreening = generationTask => {
    state.taskId = generationTask.id;
    state.filter = "all";
    state.checked.clear();
    app.openDrawer({ mode: "view", eyebrow: generationTask.id, title: "筛选生成图片", subtitle: `${app.product(generationTask.productId)?.name} · 筛选结果实时保存`, body: `<div id="pcScreenDrawer"></div>`, footer: `<button class="pc-btn" data-pc-close-drawer>关闭</button>` });
    renderScreen();
  };
  app.isScreenViewerOpen = () => viewer.classList.contains("show");
  app.closeGenerationScreenViewer = closeViewer;

  app.els.drawerBody.addEventListener("click", event => {
    const filter = event.target.closest("[data-screen-filter]");
    if (filter) { state.filter = filter.dataset.screenFilter; state.checked.clear(); renderScreen(); app.els.drawerBody.scrollTop = 0; return; }
    const batch = event.target.closest("[data-screen-batch]");
    if (batch) { setBatchStatus(batch.dataset.screenBatch); return; }
    const open = event.target.closest("[data-screen-open]");
    if (open) openViewer(open.dataset.screenOpen);
  });
  app.els.drawerBody.addEventListener("change", event => {
    if (event.target.matches("[data-screen-check-all]")) {
      visibleImages().forEach(image => event.target.checked ? state.checked.add(image.id) : state.checked.delete(image.id));
      renderScreen({ preserveScroll: true });
      return;
    }
    const checkbox = event.target.closest("[data-screen-check]");
    if (!checkbox) return;
    if (checkbox.checked) state.checked.add(checkbox.dataset.screenCheck); else state.checked.delete(checkbox.dataset.screenCheck);
    renderScreen({ preserveScroll: true });
  });
  viewer.addEventListener("click", event => {
    if (event.target.closest("[data-screen-viewer-close]")) { closeViewer(); return; }
    const nav = event.target.closest("[data-screen-viewer-nav]");
    if (nav) { moveViewer(nav.dataset.screenViewerNav === "next" ? 1 : -1); return; }
    const status = event.target.closest("[data-screen-viewer-status]");
    if (status) decideInViewer(status.dataset.screenViewerStatus);
  });
  document.addEventListener("keydown", event => {
    if (!app.isScreenViewerOpen()) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); moveViewer(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); moveViewer(1); }
    if (event.key === "Enter") { event.preventDefault(); decideInViewer("selected"); }
    if (event.key === "Delete") { event.preventDefault(); decideInViewer("rejected"); }
  });
})();

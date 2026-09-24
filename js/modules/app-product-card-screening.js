(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const state = { taskId: "", filter: "all", checked: new Set(), viewerIds: [], viewerIndex: 0, readOnly: false };
  const viewer = document.createElement("div");
  viewer.className = "pc-screen-viewer-layer";
  viewer.setAttribute("aria-hidden", "true");
  viewer.innerHTML = `<button class="pc-screen-viewer-mask" type="button" aria-label="关闭大图" data-screen-viewer-close></button><section class="pc-screen-viewer" role="dialog" aria-modal="true" aria-labelledby="pcScreenViewerTitle"><header><div><small id="pcScreenViewerIndex"></small><div class="pc-screen-title-row"><h3 id="pcScreenViewerTitle">逐张筛选</h3><span id="pcScreenViewerStatus" class="pc-screen-status"></span></div></div><button class="pc-icon-btn" type="button" aria-label="关闭" data-screen-viewer-close>×</button></header><div class="pc-screen-viewer-body" id="pcScreenViewerBody"></div></section>`;
  app.root.appendChild(viewer);
  // Keep the preview outside the scrolling dialog so it can extend to either side.
  const referencePreview = document.createElement("div");
  referencePreview.className = "pc-screen-reference-preview";
  referencePreview.setAttribute("aria-hidden", "true");
  viewer.appendChild(referencePreview);
  let viewerReferences = [];

  const allImages = () => app.data.images.filter(image => image.taskId === state.taskId);
  const visibleImages = () => state.filter === "all" ? allImages() : allImages().filter(image => image.screenStatus === state.filter);
  const statusText = status => ({ pending: "待筛选", selected: "已选用", rejected: "不选用" })[status] || status;
  const imageVisual = image => app.imageVisual(image);

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
    box.innerHTML = `<div class="pc-image-toolbar pc-screen-toolbar"><div class="pc-segmented">${filterButton("all", "全部", images.length)}${filterButton("pending", "待筛选", count("pending"))}${filterButton("selected", "选用", count("selected"))}${filterButton("rejected", "不选用", count("rejected"))}</div><div class="pc-screen-batch"><label><input type="checkbox" data-screen-check-all ${allChecked ? "checked" : ""} ${visible.length ? "" : "disabled"}> 全选当前</label><span>已选 ${checkedCount} 张</span><button class="pc-btn" data-screen-batch="selected" ${checkedCount ? "" : "disabled"}>批量选用</button><button class="pc-btn" data-screen-batch="rejected" ${checkedCount ? "" : "disabled"}>批量不选用</button><button class="pc-btn pc-btn-quiet" data-screen-batch="clear" ${checkedCount ? "" : "disabled"}>取消选择</button></div></div><div class="pc-image-grid pc-screen-grid">${visible.length ? visible.map(image => `<article class="pc-image-card pc-screen-card ${image.screenStatus}"><label class="pc-screen-check" title="加入批量操作"><input type="checkbox" data-screen-check="${image.id}" ${state.checked.has(image.id) ? "checked" : ""}></label><span class="pc-screen-status ${image.screenStatus}">${statusText(image.screenStatus)}</span><button class="pc-screen-open" type="button" data-screen-open="${image.id}" aria-label="查看并筛选 ${app.escape(image.fileName)}">${imageVisual(image)}</button>${image.distributionCount ? `<span class="pc-uploaded-mark">已分发 ${image.distributionCount} 次</span>` : ""}<div class="pc-image-meta"><strong title="${app.escape(image.fileName)}">${app.escape(image.fileName)}</strong>${app.imageTime(image)}</div></article>`).join("") : `<div class="pc-empty pc-screen-empty">当前状态下没有图片</div>`}</div>`;
    if (options.preserveScroll) requestAnimationFrame(() => { app.els.drawerBody.scrollTop = scrollTop; });
  }

  function saveDecision(image, status) {
    app.recordScreenDecision(image, status);
    app.renderGeneration?.();
  }

  async function confirmRejectDistributed(images) {
    const distributed = images.filter(image => image.screenStatus !== "rejected" && Number(image.distributionCount || 0) > 0);
    if (!distributed.length) return true;
    return app.confirm("确认设为不选用？", `其中 ${distributed.length} 张图片已有分发记录。本次修改仅影响后续新建分发任务，不撤回历史分发。`, "继续不选用");
  }

  async function setBatchStatus(status) {
    const ids = [...state.checked];
    if (status === "clear") { state.checked.clear(); renderScreen({ preserveScroll: true }); return; }
    const images = ids.map(id => app.data.images.find(item => item.id === id)).filter(Boolean);
    if (status === "rejected" && !(await confirmRejectDistributed(images))) return;
    images.forEach(image => saveDecision(image, status));
    state.checked.clear();
    renderScreen({ preserveScroll: true });
    app.toast(`已将 ${ids.length} 张图片设为${status === "selected" ? "选用" : "不选用"}`);
  }

  function currentViewerImage() {
    return app.data.images.find(image => image.id === state.viewerIds[state.viewerIndex]);
  }

  function referenceImagesMarkup(images) {
    if (!images.length) return `<p class="pc-screen-reference-empty">未记录垫图</p>`;
    return `<div class="pc-screen-reference-list">${images.map((image, index) => `<figure>
      <button type="button" class="pc-screen-reference-image" data-screen-reference="${index}" aria-label="查看垫图 ${index + 1} 大图">${imageVisual({ ...image, fileName: `垫图 ${index + 1}`, order: index })}</button>
    </figure>`).join("")}</div>`;
  }

  function hideReferencePreview() {
    referencePreview.classList.remove("show");
    referencePreview.setAttribute("aria-hidden", "true");
    referencePreview.replaceChildren();
  }

  function showReferencePreview(thumb) {
    const index = Number(thumb.dataset.screenReference);
    const reference = viewerReferences[index];
    if (!reference || !viewer.classList.contains("show")) return;
    const size = Math.max(0, Math.min(360, window.innerWidth - 24, window.innerHeight - 24));
    referencePreview.style.width = `${size}px`;
    referencePreview.innerHTML = `<div class="pc-screen-reference-preview-image">${imageVisual({ ...reference, fileName: `垫图 ${index + 1}`, order: index })}</div>`;
    referencePreview.classList.add("show");
    referencePreview.setAttribute("aria-hidden", "false");
    const rect = thumb.getBoundingClientRect();
    const preview = referencePreview.getBoundingClientRect();
    let left = rect.right + 12;
    if (left + preview.width > window.innerWidth - 12) left = rect.left - preview.width - 12;
    referencePreview.style.left = `${Math.max(12, Math.min(left, window.innerWidth - preview.width - 12))}px`;
    referencePreview.style.top = `${Math.max(12, Math.min(rect.top, window.innerHeight - preview.height - 12))}px`;
  }

  function renderViewer() {
    hideReferencePreview();
    const image = currentViewerImage();
    if (!image) { closeViewer(); return; }
    const generationTask = app.data.generationTasks.find(item => item.id === image.taskId);
    const rule = image.ruleId
      ? generationTask?.rules?.find(item => item.id === image.ruleId)
      : generationTask?.rules?.[Math.max(0, image.ruleIndex - 1)];
    const prompt = image.promptSnapshot || rule?.prompt || "未记录提示词";
    const references = image.referenceImagesSnapshot ?? rule?.images ?? [];
    viewerReferences = references;
    viewer.querySelector("#pcScreenViewerIndex").textContent = `${state.viewerIndex + 1} / ${state.viewerIds.length}`;
    viewer.querySelector("#pcScreenViewerTitle").textContent = image.fileName;
    const status = viewer.querySelector("#pcScreenViewerStatus");
    status.className = `pc-screen-status ${image.screenStatus}`;
    status.textContent = statusText(image.screenStatus);
    viewer.querySelector("#pcScreenViewerBody").innerHTML = `<div class="pc-screen-viewer-content">
      <div class="pc-screen-image-stage"><div class="pc-screen-large-image">${imageVisual(image)}</div></div>
      <aside class="pc-screen-viewer-info" aria-label="任务信息">
        <div class="pc-screen-info-field"><span class="pc-screen-field-label">任务名</span><strong class="pc-screen-task-name">${app.escape(generationTask?.name || "未记录任务名")}</strong><time class="pc-screen-generated-time">生成于 ${app.escape(image.generatedAt || "未记录")}</time></div>
        <div class="pc-screen-info-field"><span class="pc-screen-field-label">${image.referenceImagesSnapshot == null ? "垫图（当前规则）" : "垫图"}</span>${referenceImagesMarkup(references)}</div>
        <section class="pc-screen-prompt-field"><div class="pc-screen-prompt-heading"><span class="pc-screen-field-label">提示词</span></div><div class="pc-screen-prompt-scroll" tabindex="0" role="region" aria-label="完整提示词"><p class="pc-screen-viewer-prompt">${app.escape(prompt)}</p></div></section>
      </aside>
    </div><footer class="pc-screen-viewer-footer"><div class="pc-screen-viewer-actions ${state.readOnly ? "is-readonly" : ""}"><button class="pc-btn" data-screen-viewer-nav="prev" ${state.viewerIndex === 0 ? "disabled" : ""}>上一张</button>${state.readOnly ? "" : `<div><button class="pc-screen-decision selected" data-screen-viewer-status="selected">✓ 选用</button><button class="pc-screen-decision rejected" data-screen-viewer-status="rejected">× 不选用</button></div>`}<button class="pc-btn" data-screen-viewer-nav="next" ${state.viewerIndex === state.viewerIds.length - 1 ? "disabled" : ""}>下一张</button></div><p class="pc-screen-shortcuts">${state.readOnly ? "方向键切换" : "方向键切换 · Enter 选用 · Delete 不选用"}</p></footer>`;
  }

  function openViewer(imageId, images = visibleImages(), readOnly = false) {
    const index = images.findIndex(image => image.id === imageId);
    if (index < 0) return;
    state.readOnly = readOnly;
    state.viewerIds = images.map(image => image.id);
    state.viewerIndex = index;
    renderViewer();
    viewer.classList.add("show");
    viewer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => viewer.querySelector("[data-screen-viewer-close]")?.focus());
  }

  function closeViewer() {
    hideReferencePreview();
    viewer.classList.remove("show");
    viewer.setAttribute("aria-hidden", "true");
  }

  function moveViewer(step) {
    state.viewerIndex = Math.max(0, Math.min(state.viewerIds.length - 1, state.viewerIndex + step));
    renderViewer();
  }

  async function decideInViewer(status) {
    if (state.readOnly) return;
    const image = currentViewerImage();
    if (!image) return;
    if (status === "rejected" && !(await confirmRejectDistributed([image]))) return;
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
  // Product galleries share the layout but never expose screening mutations.
  app.openProductImageViewer = (imageId, images) => openViewer(imageId, images, true);

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
  viewer.addEventListener("pointerover", event => {
    if (event.pointerType === "touch") return;
    const thumb = event.target.closest("[data-screen-reference]");
    if (thumb && !thumb.contains(event.relatedTarget)) showReferencePreview(thumb);
  });
  viewer.addEventListener("pointerout", event => {
    const thumb = event.target.closest("[data-screen-reference]");
    if (thumb && !thumb.contains(event.relatedTarget)) hideReferencePreview();
  });
  viewer.addEventListener("focusin", event => {
    const thumb = event.target.closest("[data-screen-reference]");
    if (thumb) showReferencePreview(thumb);
  });
  viewer.addEventListener("focusout", event => {
    if (event.target.closest("[data-screen-reference]")) hideReferencePreview();
  });
  viewer.addEventListener("scroll", hideReferencePreview, true);
  window.addEventListener("resize", hideReferencePreview);
  viewer.addEventListener("click", event => {
    const reference = event.target.closest("[data-screen-reference]");
    if (reference) { showReferencePreview(reference); return; }
    hideReferencePreview();
    if (event.target.closest("[data-screen-viewer-close]")) { closeViewer(); return; }
    const nav = event.target.closest("[data-screen-viewer-nav]");
    if (nav) { moveViewer(nav.dataset.screenViewerNav === "next" ? 1 : -1); return; }
    const status = event.target.closest("[data-screen-viewer-status]");
    if (status) decideInViewer(status.dataset.screenViewerStatus);
  });
  document.addEventListener("keydown", event => {
    if (!app.isScreenViewerOpen()) return;
    const reference = event.target.closest("[data-screen-reference]");
    if (reference && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault(); showReferencePreview(reference); return;
    }
    if (event.key === "ArrowLeft") { event.preventDefault(); moveViewer(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); moveViewer(1); }
    if (!state.readOnly && event.key === "Enter") { event.preventDefault(); decideInViewer("selected"); }
    if (!state.readOnly && event.key === "Delete") { event.preventDefault(); decideInViewer("rejected"); }
  });
})();

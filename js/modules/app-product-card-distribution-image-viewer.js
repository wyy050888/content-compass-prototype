(function () {
  "use strict";
  const app = window.ProductCardApp;
  const dist = app?.distribution;
  if (!app || !dist) return;

  const state = { ids: [], index: 0, countContext: { type: "all", id: "", label: "累计" } };
  const layer = document.createElement("div");
  layer.className = "pc-distribution-viewer-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `<button type="button" class="pc-distribution-viewer-mask" data-distribution-viewer-close aria-label="关闭大图"></button><section class="pc-distribution-viewer" role="dialog" aria-modal="true" aria-labelledby="pcDistributionViewerTitle"><header><div><small id="pcDistributionViewerIndex"></small><h3 id="pcDistributionViewerTitle"></h3></div><button type="button" class="pc-icon-btn" data-distribution-viewer-close aria-label="关闭">×</button></header><div id="pcDistributionViewerBody" class="pc-distribution-viewer-body"></div></section>`;
  app.root.appendChild(layer);

  const current = () => dist.recordById?.(state.ids[state.index]);
  const statusText = record => record.status === "success" ? "成功" : record.status === "failed" ? "失败" : record.reason?.includes("取消") ? "未处理" : "待处理";

  function visual(record, source) {
    return source?.url
      ? `<img src="${app.escape(source.url)}" alt="${app.escape(record.fileName)}">`
      : `<span class="pc-distribution-viewer-placeholder tone-${(record.order || 0) % 6 + 1}" aria-hidden="true"></span>`;
  }

  function render() {
    const record = current();
    if (!record) { close(); return; }
    const source = app.data.images.find(image => image.id === record.imageId);
    const sourceTask = app.data.generationTasks.find(task => task.id === source?.taskId);
    const distributionTask = record.distributionTask;
    const plan = app.plan(record.planId);
    const totalDistributionCount = dist.distributionCount?.(source) ?? Number(source?.distributionCount || 0);
    const contextualDistributionCount = dist.distributionCount?.(source, state.countContext) ?? totalDistributionCount;
    const contextualLabel = state.countContext.label === "累计" ? "累计成功分发" : `${state.countContext.label}成功分发`;
    layer.querySelector("#pcDistributionViewerIndex").textContent = `${state.index + 1} / ${state.ids.length} · 规则 ${record.ruleIndex}`;
    layer.querySelector("#pcDistributionViewerTitle").textContent = record.fileName;
    layer.querySelector("#pcDistributionViewerBody").innerHTML = `<div class="pc-distribution-viewer-content">
      <div class="pc-distribution-viewer-image">${visual(record, source)}</div>
      <aside class="pc-distribution-viewer-info">
        <div class="pc-distribution-viewer-status"><span>本次结果</span><b class="pc-dist-result-tag ${record.status}">${statusText(record)}</b></div>
        <dl>
          <div><dt>图片命名</dt><dd>${app.escape(record.fileName)}</dd></div>
          <div><dt>来源生成任务</dt><dd>${app.escape(sourceTask?.name || source?.taskId || "生成任务")}</dd></div>
          <div><dt>分发任务</dt><dd>${app.escape(distributionTask?.name || distributionTask?.id || "—")}</dd></div>
          <div><dt>分发时间</dt><dd>${distributionTask?.createdAt || "—"}</dd></div>
          <div><dt>目标计划</dt><dd>${app.escape(plan?.name || "—")}<small>${plan?.id || "—"}</small></dd></div>
          <div><dt>${app.escape(contextualLabel)}</dt><dd>${contextualDistributionCount} 次</dd></div>
          ${state.countContext.type === "all" ? "" : `<div><dt>全部计划累计</dt><dd>${totalDistributionCount} 次</dd></div>`}
          ${record.reason ? `<div class="${record.status === "failed" ? "failed" : ""}"><dt>${record.status === "failed" ? "失败原因" : "处理说明"}</dt><dd>${app.escape(record.reason)}</dd></div>` : ""}
        </dl>
        ${record.status === "failed" ? `<button class="pc-viewer-retry" data-distribution-viewer-retry>重试分发</button>` : ""}
      </aside>
    </div><footer><button class="pc-btn" data-distribution-viewer-nav="prev" ${state.index === 0 ? "disabled" : ""}>上一张</button><span>使用方向键快速切换图片</span><button class="pc-btn" data-distribution-viewer-nav="next" ${state.index === state.ids.length - 1 ? "disabled" : ""}>下一张</button></footer>`;
  }

  function open(id, ids, countContext) {
    state.ids = ids.length ? ids : [id];
    state.index = Math.max(0, state.ids.indexOf(id));
    state.countContext = countContext || { type: "all", id: "", label: "累计" };
    if (!current()) { app.toast("未找到图片记录，请刷新后重试"); return; }
    render();
    layer.classList.add("show");
    layer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => layer.querySelector("[data-distribution-viewer-close]")?.focus());
  }

  function close() {
    layer.classList.remove("show");
    layer.setAttribute("aria-hidden", "true");
  }

  function move(step) {
    state.index = Math.max(0, Math.min(state.ids.length - 1, state.index + step));
    render();
  }

  app.isDistributionImageViewerOpen = () => layer.classList.contains("show");
  app.closeDistributionImageViewer = close;

  app.root.addEventListener("click", event => {
    const trigger = event.target.closest("[data-open-distribution-image]");
    if (!trigger) return;
    const grid = trigger.closest(".pc-distribution-image-grid");
    const ids = grid ? [...grid.querySelectorAll("[data-open-distribution-image]")].map(item => item.dataset.openDistributionImage) : [];
    open(trigger.dataset.openDistributionImage, ids, {
      type: trigger.dataset.countContextType || "all",
      id: trigger.dataset.countContextId || "",
      label: trigger.dataset.countContextLabel || "累计"
    });
  });

  layer.addEventListener("click", event => {
    if (event.target.closest("[data-distribution-viewer-close]")) { close(); return; }
    const nav = event.target.closest("[data-distribution-viewer-nav]");
    if (nav && !nav.disabled) { move(nav.dataset.distributionViewerNav === "next" ? 1 : -1); return; }
    if (!event.target.closest("[data-distribution-viewer-retry]")) return;
    const record = current();
    const success = record ? dist.retryRecord(record) : false;
    if (record?.distributionTask) dist.recalcTask(record.distributionTask);
    app.renderDistribution();
    dist.refreshTaskDetail?.();
    dist.refreshImageGallery?.();
    render();
    app.toast(success ? "该图片重试成功" : record?.reason || "未找到失败记录");
  });

  document.addEventListener("keydown", event => {
    if (!app.isDistributionImageViewerOpen()) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  });
})();

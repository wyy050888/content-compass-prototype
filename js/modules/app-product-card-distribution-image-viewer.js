(function () {
  "use strict";
  const app = window.ProductCardApp;
  const dist = app?.distribution;
  if (!app || !dist) return;

  // 分发入口复用生成图片的只读预览，仅补充累计成功分发次数。
  app.openDistributionImageViewer = (id, ids = []) => {
    const record = dist.recordById(id);
    const source = app.data.images.find(image => image.id === record?.imageId);
    if (!source) { app.toast("未找到图片记录，请刷新后重试"); return; }
    const imageIds = new Set((ids.length ? ids : [id]).map(item => dist.recordById(item)?.imageId).filter(Boolean));
    imageIds.add(source.id);
    const imagesById = new Map(app.data.images.map(image => [image.id, image]));
    const images = [...imageIds].map(imageId => imagesById.get(imageId)).filter(Boolean);
    app.openProductImageViewer(source.id, images, { showDistributionCount: true });
  };

  app.root.addEventListener("click", event => {
    const trigger = event.target.closest("[data-open-distribution-image]");
    if (!trigger) return;
    const grid = trigger.closest(".pc-distribution-image-grid");
    const ids = grid ? [...grid.querySelectorAll("[data-open-distribution-image]")].map(item => item.dataset.openDistributionImage) : [];
    app.openDistributionImageViewer(trigger.dataset.openDistributionImage, ids);
  });
})();

(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const root = app.root;
  const els = {
    mode: root.querySelector("#pcGenerationViewMode"),
    taskView: root.querySelector("#pcGenerationTaskView"),
    productView: root.querySelector("#pcGenerationProductView"),
    metrics: root.querySelector("#pcProductMetrics"),
    search: root.querySelector("#pcProductSearch"),
    statuses: root.querySelector("#pcProductStatus"),
    body: root.querySelector("#pcProductBody"),
    footer: root.querySelector("#pcProductFooter")
  };
  if (Object.values(els).some(node => !node)) return;

  let statusFilter = "all";
  let expandedProductId = "";
  let productPage = 1;
  const productPageSize = 20;
  let galleryProductId = "";
  let galleryFilter = "all";

  const terminalStatuses = new Set(["success", "partial", "failed", "cancelled"]);
  const imageStatusTag = status => `<span class="pc-status ${status}">${status === "selected" ? "选用" : status === "rejected" ? "不选用" : "待筛选"}</span>`;
  const taskImages = task => app.data.images.filter(image => image.taskId === task.id);
  const screeningCounts = tasks => {
    const taskIds = new Set(tasks.map(task => task.id));
    const images = app.data.images.filter(image => taskIds.has(image.taskId));
    return {
      all: images.length,
      selected: images.filter(image => image.screenStatus === "selected").length,
      rejected: images.filter(image => image.screenStatus === "rejected").length,
      pending: images.filter(image => image.screenStatus === "pending").length
    };
  };
  const productSummary = product => {
    const tasks = app.data.generationTasks.filter(task => task.productId === product.id && (!app.canViewTask || app.canViewTask(task, "generate")));
    const success = tasks.reduce((sum, task) => sum + task.success, 0);
    const failed = tasks.reduce((sum, task) => sum + task.failed, 0);
    const target = tasks.reduce((sum, task) => sum + task.target, 0);
    const screening = screeningCounts(tasks);
    const active = tasks.some(task => ["pending", "running", "paused"].includes(task.status));
    const completed = Boolean(tasks.length) && tasks.every(task => terminalStatuses.has(task.status)) && screening.pending === 0;
    const recent = tasks.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
    const displayStatus = tasks.some(task => task.status === "running") ? "running" : tasks.some(task => task.status === "pending") ? "pending" : tasks.some(task => task.status === "paused") ? "paused" : tasks.some(task => task.status === "partial") ? "partial" : tasks.some(task => task.status === "failed") ? "failed" : "success";
    return { product, tasks, success, failed, target, screening, active, completed, recent, displayStatus };
  };

  function filteredProducts() {
    const keyword = els.search.value.trim().toLowerCase();
    return app.data.products.map(productSummary).filter(item => {
      const matchesKeyword = !keyword || [item.product.id, item.product.name].some(value => String(value).toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === "all" || statusFilter === "active" && item.active || statusFilter === "screening" && item.screening.pending > 0 || statusFilter === "completed" && item.completed;
      return matchesKeyword && matchesStatus;
    });
  }

  function productTaskRows(item) {
    return `<tr class="pc-product-detail-row"><td colspan="7"><div class="pc-product-task-list">${item.tasks.length ? item.tasks.map(task => {
      const images = taskImages(task);
      const pending = images.filter(image => image.screenStatus === "pending").length;
      const canScreen = ["success", "partial", "cancelled"].includes(task.status) && task.success > 0;
      return `<div class="pc-product-task-item">
        <div><span class="pc-cell-main">${app.escape(task.name)}</span><span class="pc-cell-sub">${task.id} · ${app.shortTime(task.createdAt)}</span></div>
        <div>${task.status === "failed" ? `<span class="pc-status failed" tabindex="0" data-pc-tip="${app.escape(task.failureReason || "生成失败")}">生成失败</span>` : app.statusTag(task.status)}</div>
        <div class="pc-product-count"><b>${task.success + task.failed}/${task.target} 张</b><small>成功 ${task.success} · 失败 ${task.failed} · 待筛 ${pending}</small></div>
        <div class="pc-actions"><button data-product-task-action="strategy" data-task-id="${task.id}">查看策略</button>${canScreen ? `<button data-product-task-action="screen" data-task-id="${task.id}">筛选图片</button>` : ""}</div>
      </div>`;
    }).join("") : `<div class="pc-empty">该产品暂无生成任务</div>`}</div></td></tr>`;
  }

  function renderRows(items) {
    els.body.innerHTML = items.length ? items.map((item, index) => {
      const completed = item.success + item.failed;
      const percent = item.target ? Math.min(100, Math.round(completed / item.target * 100)) : 0;
      const expanded = expandedProductId === item.product.id;
      return `<tr class="pc-product-main-row ${expanded ? "expanded" : ""}">
        <td><div class="pc-product-name"><span class="pc-product-avatar tone-${index % 4 + 1}">${app.escape(item.product.name.slice(0, 1))}</span><span><b class="pc-cell-main">${app.escape(item.product.name)}</b><small class="pc-cell-sub">${item.product.id}</small></span></div></td>
        <td>${app.statusTag(item.displayStatus)}</td>
        <td><div class="pc-product-count"><b>${item.tasks.length} 个</b><small>进行中 ${item.tasks.filter(task => ["pending", "running", "paused"].includes(task.status)).length}</small></div></td>
        <td><div class="pc-product-progress"><div><i style="width:${percent}%"></i></div><span><b>成功 ${item.success}</b> · 失败 ${item.failed} · 目标 ${item.target}</span></div></td>
        <td><div class="pc-product-screening"><strong>已筛 ${item.screening.selected + item.screening.rejected}/${item.screening.all}</strong><span>选用 ${item.screening.selected} · 不选用 ${item.screening.rejected}${item.screening.pending ? ` · <i class="pending">待筛 ${item.screening.pending}</i>` : ""}</span></div></td>
        <td><span class="pc-cell-main">${app.escape(item.recent?.name || "暂无任务")}</span><span class="pc-cell-sub">${app.shortTime(item.recent?.createdAt)}</span></td>
        <td><div class="pc-actions"><button data-product-toggle="${item.product.id}" aria-expanded="${expanded}">${expanded ? "收起任务" : "查看任务"}</button><button data-product-gallery="${item.product.id}">查看图片</button><button data-product-create="${item.product.id}">新建任务</button></div></td>
      </tr>${expanded ? productTaskRows(item) : ""}`;
    }).join("") : `<tr><td class="pc-empty" colspan="7">没有符合条件的产品</td></tr>`;
  }

  app.renderGenerationProducts = () => {
    const all = app.data.products.map(productSummary);
    const totalImages = all.reduce((sum, item) => sum + item.success + item.failed, 0);
    const selected = all.reduce((sum, item) => sum + item.screening.selected, 0);
    const pending = all.reduce((sum, item) => sum + item.screening.pending, 0);
    els.metrics.innerHTML = [
      app.metric("产品数", all.length, `${all.filter(item => item.tasks.length).length} 个已有任务`),
      app.metric("进行中产品", all.filter(item => item.active).length, `${all.reduce((sum, item) => sum + item.tasks.filter(task => ["pending", "running", "paused"].includes(task.status)).length, 0)} 个进行中任务`),
      app.metric("累计生图处理数", totalImages, `已选用 ${selected} 张`),
      app.metric("待筛选图片", pending, pending ? "需要继续处理" : "已全部处理")
    ].join("");
    const items = filteredProducts();
    const pageCount = Math.max(1, Math.ceil(items.length / productPageSize));
    productPage = Math.min(productPage, pageCount);
    const pageItems = items.slice((productPage - 1) * productPageSize, productPage * productPageSize);
    renderRows(pageItems);
    els.footer.innerHTML = `<span>每页 ${productPageSize} 条，共 ${items.length} 个产品</span><div><button data-product-page="prev" ${productPage === 1 ? "disabled" : ""}>上一页</button><b>${productPage} / ${pageCount}</b><button data-product-page="next" ${productPage === pageCount ? "disabled" : ""}>下一页</button></div>`;
  };

  app.setGenerationView = view => {
    const next = view === "product" ? "product" : "task";
    app.state.generationView = next;
    els.mode.querySelectorAll("[data-generation-view]").forEach(button => button.classList.toggle("active", button.dataset.generationView === next));
    els.taskView.classList.toggle("active", next === "task");
    els.productView.classList.toggle("active", next === "product");
    if (next === "product") { productPage = 1; expandedProductId = ""; app.renderGenerationProducts(); }
    else app.renderGeneration();
  };

  function renderProductGallery() {
    const product = app.product(galleryProductId);
    if (!product) return;
    const tasks = app.data.generationTasks.filter(task => task.productId === product.id && (!app.canViewTask || app.canViewTask(task, "generate")));
    const taskIds = new Set(tasks.map(task => task.id));
    const images = app.data.images.filter(image => taskIds.has(image.taskId));
    const visible = galleryFilter === "all" ? images : images.filter(image => image.screenStatus === galleryFilter);
    const count = status => images.filter(image => image.screenStatus === status).length;
    app.els.drawerBody.innerHTML = `<div class="pc-product-gallery-summary">
      <div><span>全部图片</span><b>${images.length} 张</b></div><div><span>待筛选</span><b>${count("pending")} 张</b></div><div><span>选用</span><b>${count("selected")} 张</b></div><div><span>不选用</span><b>${count("rejected")} 张</b></div>
    </div><div class="pc-product-gallery-toolbar"><div class="pc-status-filters">${[["all","全部"],["pending","待筛选"],["selected","选用"],["rejected","不选用"]].map(([value,label]) => `<button class="${galleryFilter === value ? "active" : ""}" data-product-image-filter="${value}">${label} ${value === "all" ? images.length : count(value)}</button>`).join("")}</div><span class="pc-note-inline">按生成任务汇总</span></div>
    <div class="pc-product-gallery-grid">${visible.length ? visible.map(image => {
      const task = app.data.generationTasks.find(item => item.id === image.taskId);
      const visual = image.url ? `<img src="${app.escape(image.url)}" alt="${app.escape(image.fileName)}">` : `<span class="pc-product-gallery-placeholder tone-${(image.order || 0) % 6 + 1}" aria-hidden="true"></span>`;
      return `<article class="pc-product-gallery-card"><div class="pc-product-gallery-stage">${visual}${imageStatusTag(image.screenStatus)}</div><div class="pc-product-gallery-meta"><strong title="${app.escape(image.fileName)}">${app.escape(image.fileName)}</strong>${app.imageTime(image)}<span title="${app.escape(task?.name || image.taskId)}">${app.escape(task?.name || image.taskId)}</span></div></article>`;
    }).join("") : `<div class="pc-empty">当前筛选下没有图片</div>`}</div>`;
  }

  function openProductGallery(productId) {
    const product = app.product(productId);
    if (!product) return;
    galleryProductId = productId;
    galleryFilter = "all";
    app.openDrawer({ mode: "view", eyebrow: product.id, title: "查看产品图片", subtitle: `${product.name} · 汇总全部生成任务`, body: "", footer: `<button class="pc-btn" data-pc-close-drawer>关闭</button>` });
    renderProductGallery();
  }

  els.mode.addEventListener("click", event => {
    const button = event.target.closest("[data-generation-view]");
    if (button) app.setGenerationView(button.dataset.generationView);
  });
  els.search.addEventListener("input", () => { productPage = 1; expandedProductId = ""; app.renderGenerationProducts(); });
  els.statuses.addEventListener("click", event => {
    const button = event.target.closest("[data-product-status]");
    if (!button) return;
    statusFilter = button.dataset.productStatus;
    productPage = 1;
    expandedProductId = "";
    els.statuses.querySelectorAll("[data-product-status]").forEach(item => item.classList.toggle("active", item === button));
    app.renderGenerationProducts();
  });
  els.body.addEventListener("click", event => {
    const toggle = event.target.closest("[data-product-toggle]");
    if (toggle) { expandedProductId = expandedProductId === toggle.dataset.productToggle ? "" : toggle.dataset.productToggle; app.renderGenerationProducts(); return; }
    const gallery = event.target.closest("[data-product-gallery]");
    if (gallery) { openProductGallery(gallery.dataset.productGallery); return; }
    const create = event.target.closest("[data-product-create]");
    if (create) { app.openNewGeneration?.(create.dataset.productCreate); return; }
    const taskAction = event.target.closest("[data-product-task-action]");
    if (!taskAction) return;
    const task = app.data.generationTasks.find(item => item.id === taskAction.dataset.taskId);
    if (!task) return;
    if (taskAction.dataset.productTaskAction === "screen") app.openGenerationScreening?.(task);
    else app.openGenerationStrategy?.(task);
  });
  els.footer.addEventListener("click", event => {
    const button = event.target.closest("[data-product-page]");
    if (!button || button.disabled) return;
    productPage += button.dataset.productPage === "next" ? 1 : -1;
    expandedProductId = "";
    app.renderGenerationProducts();
  });
  root.addEventListener("click", event => {
    const filter = event.target.closest("[data-product-image-filter]");
    if (!filter || !galleryProductId || !app.els.drawerBody.contains(filter)) return;
    galleryFilter = filter.dataset.productImageFilter;
    renderProductGallery();
  });
})();

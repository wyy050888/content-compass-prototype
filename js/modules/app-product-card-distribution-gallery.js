(function () {
  "use strict";
  const app = window.ProductCardApp;
  const dist = app?.distribution;
  if (!app || !dist) return;

  const pageSize = 30;
  let gallery = null;

  function recordsFor(predicate) {
    return app.data.distributionTasks
      .filter(task => task.status !== "draft")
      .flatMap(task => dist.ensureImageResults(task).map(record => Object.assign(record, { distributionTask: task })))
      .filter(record => predicate(app.plan(record.planId), record.distributionTask));
  }

  function latestPlanId(records) {
    return [...records]
      .sort((left, right) => String(right.completedAt || right.submittedAt || right.distributionTask?.createdAt || "").localeCompare(String(left.completedAt || left.submittedAt || left.distributionTask?.createdAt || "")))[0]?.planId || "";
  }

  function refreshRecords() {
    gallery.records = gallery.type === "account"
      ? recordsFor(plan => plan?.accountId === gallery.entity.id)
      : recordsFor(plan => plan?.id === gallery.entity.id);
    const available = new Set(gallery.records.map(record => record.planId));
    if (!available.has(gallery.selectedPlanId)) gallery.selectedPlanId = latestPlanId(gallery.records);
  }

  function activeRange() {
    return gallery.tab === "today" ? app.dateRange.preset(1) : gallery.range;
  }

  function planRecords(planId, applyRange = true) {
    return gallery.records.filter(record => record.planId === planId && (!applyRange || app.dateRange.contains(record.completedAt || record.submittedAt || record.distributionTask?.createdAt, activeRange())));
  }

  function counts(records) {
    return {
      all: records.length,
      success: records.filter(record => record.status === "success").length,
      failed: records.filter(record => record.status === "failed").length,
      pending: records.filter(record => !["success", "failed"].includes(record.status)).length
    };
  }

  function availablePlans() {
    const ids = [...new Set(gallery.records.map(record => record.planId))];
    const lastTime = planId => gallery.records.filter(record => record.planId === planId).map(record => record.completedAt || record.submittedAt || record.distributionTask?.createdAt || "").sort().at(-1) || "";
    return ids.map(id => app.plan(id)).filter(Boolean).sort((left, right) => {
      const leftTime = lastTime(left.id);
      const rightTime = lastTime(right.id);
      return String(rightTime).localeCompare(String(leftTime));
    });
  }

  function filteredPlans() {
    const keyword = gallery.planSearch.trim().toLowerCase();
    return availablePlans().filter(plan => !keyword || [plan.name, plan.id].some(value => String(value || "").toLowerCase().includes(keyword)));
  }

  function planSidebar() {
    const plans = filteredPlans();
    return `<aside class="pc-gallery-plan-sidebar">
      <header><div><b>目标计划</b><span>${availablePlans().length} 个</span></div><label class="pc-gallery-plan-search"><span>⌕</span><input id="pcGalleryPlanSearch" value="${app.escape(gallery.planSearch)}" placeholder="搜索计划名称/ID"></label></header>
      <div class="pc-gallery-plan-list">${plans.length ? plans.map(plan => {
        const stat = counts(planRecords(plan.id));
        return `<button type="button" class="pc-gallery-plan-item ${gallery.selectedPlanId === plan.id ? "active" : ""}" data-gallery-plan="${plan.id}">
          <span class="pc-gallery-plan-title"><b>${app.escape(plan.name)}</b>${dist.planStatusTag(plan.status)}</span>
          <small>${plan.id}</small>
          <span class="pc-gallery-plan-count"><i>${stat.all} 张</i><em>${stat.success} 成功</em><em class="failed">${stat.failed} 失败</em></span>
        </button>`;
      }).join("") : `<div class="pc-gallery-plan-empty">没有匹配的计划</div>`}</div>
    </aside>`;
  }

  function planHeader(plan) {
    if (!plan) return `<div class="pc-gallery-selected-plan empty">请选择左侧计划查看图片</div>`;
    const shop = app.shop(plan.shopId);
    const account = app.account(plan.accountId);
    return `<div class="pc-gallery-selected-plan">
      <div><span>当前目标计划</span><strong>${app.escape(plan.name)}</strong><small>${plan.id}</small></div>
      <div class="pc-gallery-plan-meta"><span>计划状态 ${dist.planStatusTag(plan.status)}</span><span>店铺 <b>${app.escape(shop?.name || "—")}</b></span><span>广告账户 <b>${app.escape(account?.name || "—")}</b></span><span>素材容量 <b>${plan.current || 0}/500</b></span></div>
    </div>`;
  }

  function pagination(total, pageCount) {
    if (!total) return "";
    return `<div class="pc-gallery-pagination"><span>共 ${total} 张，每页 ${pageSize} 张</span><div><button data-gallery-page="prev" ${gallery.page === 1 ? "disabled" : ""}>上一页</button><b>${gallery.page} / ${pageCount}</b><button data-gallery-page="next" ${gallery.page === pageCount ? "disabled" : ""}>下一页</button></div></div>`;
  }

  function imagePanel() {
    const plan = app.plan(gallery.selectedPlanId);
    const base = plan ? planRecords(plan.id) : [];
    const stat = counts(base);
    const filtered = gallery.status === "all" ? base : base.filter(record => gallery.status === "pending" ? !["success", "failed"].includes(record.status) : record.status === gallery.status);
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    gallery.page = Math.min(gallery.page, pageCount);
    const visible = filtered.slice((gallery.page - 1) * pageSize, gallery.page * pageSize);
    const periodLabel = gallery.tab === "today" ? "今日分发" : "累计分发";
    const countContext = gallery.type === "account"
      ? { type: "account", id: gallery.entity.id, label: "本账户" }
      : { type: "plan", id: plan?.id || gallery.entity.id, label: "本计划" };
    return `<main class="pc-gallery-plan-main">
      ${planHeader(plan)}
      <div class="pc-detail-grid pc-system-image-summary">
        <div class="pc-detail-item"><span>${periodLabel}</span><b>${stat.all} 张</b></div>
        <div class="pc-detail-item"><span>成功</span><b>${stat.success} 张</b></div>
        <div class="pc-detail-item"><span>失败</span><b>${stat.failed} 张</b></div>
        <div class="pc-detail-item"><span>未处理</span><b>${stat.pending} 张</b></div>
      </div>
      <div class="pc-system-image-toolbar"><div class="pc-result-tabs">
        ${[["all", "全部", stat.all], ["success", "成功", stat.success], ["failed", "失败", stat.failed], ["pending", "未处理", stat.pending]].map(([value, label, total]) => `<button class="${gallery.status === value ? "active" : ""}" data-gallery-status="${value}">${label} <b>${total}</b></button>`).join("")}
      </div><div class="pc-gallery-filters">${gallery.tab === "cumulative" ? app.dateRange.render("gallery-distribution", gallery.range, { label: "分发时间", compact: true }) : ""}<span>当前 ${filtered.length} 张</span></div></div>
      <div class="pc-distribution-image-grid pc-system-image-grid pc-plan-focused-grid">${visible.length ? visible.map(record => dist.detailImageCard(record, true, countContext)).join("") : `<div class="pc-empty">当前计划没有符合条件的分发图片</div>`}</div>
      ${pagination(filtered.length, pageCount)}
    </main>`;
  }

  function render() {
    if (!gallery) return;
    app.els.drawerBody.innerHTML = `<div class="pc-gallery-primary-tabs"><button class="${gallery.tab === "today" ? "active" : ""}" data-gallery-tab="today">今日分发</button><button class="${gallery.tab === "cumulative" ? "active" : ""}" data-gallery-tab="cumulative">累计分发</button></div>
      ${gallery.type === "account" ? `<div class="pc-plan-gallery-layout">${planSidebar()}${imagePanel()}</div>` : imagePanel()}`;
  }

  function open(type, entity) {
    const records = type === "account" ? recordsFor(plan => plan?.accountId === entity.id) : recordsFor(plan => plan?.id === entity.id);
    gallery = { type, entity, records, selectedPlanId: type === "plan" ? entity.id : latestPlanId(records), planSearch: "", tab: "today", status: "all", range: app.dateRange.preset(30), page: 1 };
    app.openDrawer({
      mode: "view", className: "pc-distribution-drawer", bodyClass: "pc-gallery-drawer-body", eyebrow: entity.id,
      title: type === "account" ? "按计划查看系统分发图片" : "查看系统分发图片",
      subtitle: type === "account" ? `${entity.name} · 选择计划后查看图片` : `${entity.name} · 当前计划`,
      body: "", footer: `<button class="pc-btn" data-pc-close-drawer>关闭</button>`
    });
    render();
  }

  dist.openAccountImages = account => account && open("account", account);
  dist.openPlanDetail = plan => plan && open("plan", plan);
  dist.refreshImageGallery = () => {
    if (!gallery || !app.els.drawerBody.querySelector(".pc-gallery-primary-tabs")) return;
    refreshRecords(); render();
  };

  app.root.addEventListener("click", event => {
    if (!gallery || !app.els.drawerBody.querySelector(".pc-gallery-primary-tabs")) return;
    const rangeControl = event.target.closest('[data-pc-range-owner="gallery-distribution"]');
    if (rangeControl) {
      if (app.dateRange.handle(event, "gallery-distribution", gallery.range)) { gallery.page = 1; render(); }
      return;
    }
    const tab = event.target.closest("[data-gallery-tab]");
    if (tab) { gallery.tab = tab.dataset.galleryTab; gallery.page = 1; render(); return; }
    const plan = event.target.closest("[data-gallery-plan]");
    if (plan) { gallery.selectedPlanId = plan.dataset.galleryPlan; gallery.page = 1; render(); return; }
    const status = event.target.closest("[data-gallery-status]");
    if (status) { gallery.status = status.dataset.galleryStatus; gallery.page = 1; render(); return; }
    const page = event.target.closest("[data-gallery-page]");
    if (page && !page.disabled) { gallery.page += page.dataset.galleryPage === "prev" ? -1 : 1; render(); return; }
    const retry = event.target.closest("[data-result-retry]");
    if (retry) {
      const record = gallery.records.find(item => item.id === retry.dataset.resultRetry);
      const success = record ? dist.retryRecord(record) : false;
      if (record?.distributionTask) dist.recalcTask(record.distributionTask);
      refreshRecords(); app.renderDistribution(); render();
      app.toast(success ? "该图片重试成功" : record?.reason || "未找到失败记录");
    }
  });

  app.root.addEventListener("input", event => {
    if (!gallery || event.target.id !== "pcGalleryPlanSearch") return;
    gallery.planSearch = event.target.value;
    const matches = filteredPlans();
    if (matches.length && !matches.some(plan => plan.id === gallery.selectedPlanId)) gallery.selectedPlanId = matches[0].id;
    gallery.page = 1; render();
    requestAnimationFrame(() => { const input = app.els.drawerBody.querySelector("#pcGalleryPlanSearch"); input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); });
  });
})();

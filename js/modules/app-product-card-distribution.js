(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const root = app.root;
  const els = {
    view: root.querySelector("#pcDistributionView"), metrics: root.querySelector("#pcDistributionMetrics"),
    scopeRow: root.querySelector("#pcDistributionTaskScopeRow"), scope: root.querySelector("#pcDistributionTaskScope"),
    toolbar: root.querySelector("#pcDistributionToolbar"), cols: root.querySelector("#pcDistributionCols"),
    head: root.querySelector("#pcDistributionHead"), body: root.querySelector("#pcDistributionBody"),
    pagination: root.querySelector("#pcDistributionPagination")
  };
  const dist = app.distribution = {
    els, currentUser: "周宁", currentTeam: "抖音三区", page: 1, pageSize: 20,
    filters: {
      taskScope: "all", taskSearch: "", creator: "", taskStatus: "all", taskRange: app.dateRange.preset(30),
      accountSearch: "", accountRange: app.dateRange.preset(30), accountOnlyActive: false,
      planSearch: "", planStatus: "active", planSort: "updatedAt-desc", planRange: app.dateRange.preset(30), planDataRange: app.dateRange.preset(30), planOnlyActive: false
    }
  };
  const taskStatuses = [
    ["all", "全部"], ["draft", "草稿"], ["pending", "待分发"], ["uploading", "分发中"],
    ["success", "分发成功"], ["partial", "部分成功"],
    ["failed", "分发失败"], ["cancelled", "已取消"]
  ];
  const planStatuses = [
    ["active", "投放中"], ["new_review", "新建审核中"], ["edit_review", "修改审核中"],
    ["rejected", "审核不通过"], ["paused", "已暂停"], ["deleted", "已删除"],
    ["completed", "已完成"], ["terminated", "已终止"], ["all", "全部（含已删除）"]
  ];
  dist.taskStatusText = status => ({ ...Object.fromEntries(taskStatuses), cancelling: "取消处理中" })[status] || status;
  dist.planStatusText = status => Object.fromEntries(planStatuses)[status] || status;
  dist.taskStatusTag = status => `<span class="pc-status pc-dist-status-${status}">${dist.taskStatusText(status)}</span>`;
  dist.planStatusTag = status => `<span class="pc-status pc-plan-status-${status}">${dist.planStatusText(status)}</span>`;
  dist.formatNumber = value => Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  dist.distributedImages = predicate => app.data.images.filter(image => (image.distributionHistory || []).some(predicate));

  function statusFilters(items, current, attribute) {
    return `<div class="pc-status-filters pc-dist-status-filters">${items.map(([value, label]) => `<button class="${current === value ? "active" : ""}" ${attribute}="${value}">${label}</button>`).join("")}</div>`;
  }
  function taskAction(task, action, label, tone) {
    return `<button class="pc-action-${tone}" data-dist-action="${action}" data-id="${task.id}">${label}</button>`;
  }
  function todayDistribution(success, failed) {
    return `<span class="pc-today-distribution"><b>${success} 成功</b><em class="${failed ? "has-failed" : ""}">${failed} 失败</em></span>`;
  }
  function sortHead(field, label) {
    const [current, direction] = dist.filters.planSort.split("-");
    return `<button class="pc-sort-head ${current === field ? "active" : ""}" data-dist-sort="${field}">${label}<span>${current === field ? (direction === "asc" ? "↑" : "↓") : "↕"}</span></button>`;
  }
  function taskAllocations(task) {
    if (task.imageResults?.length) return task.imageResults.map(record => ({ planId: record.planId, status: record.status }));
    const records = [];
    (task.results || []).forEach(result => {
      for (let index = 0; index < result.success; index += 1) records.push({ planId: result.planId, status: "success" });
      for (let index = 0; index < result.failed; index += 1) records.push({ planId: result.planId, status: "failed" });
    });
    const remaining = Math.max(0, task.requested - records.length);
    for (let index = 0; index < remaining; index += 1) records.push({ planId: task.plans[index % Math.max(task.plans.length, 1)] || "", status: "pending" });
    return records;
  }
  function distributionStats(planPredicate, range) {
    const records = app.data.distributionTasks.filter(task => task.status !== "draft" && (!range || app.dateRange.contains(task.createdAt, range))).flatMap(task => taskAllocations(task).filter(record => planPredicate(app.plan(record.planId), task)));
    const success = records.filter(record => record.status === "success").length;
    const failed = records.filter(record => record.status === "failed").length;
    return {
      success,
      failed,
      pending: records.filter(record => !["success", "failed"].includes(record.status)).length,
      total: success + failed,
      requested: records.length
    };
  }
  function latestProcessedDistributionTime(planPredicate) {
    return app.data.distributionTasks.filter(task => task.status !== "draft" && taskAllocations(task).some(record => ["success", "failed"].includes(record.status) && planPredicate(app.plan(record.planId), task))).map(task => task.createdAt).sort().at(-1) || "--";
  }
  dist.distributionStats = distributionStats;
  dist.performanceForRange = (plan, range) => {
    const days = Math.min(30, app.dateRange.days(range) || 1);
    return { spend: plan.spend * days, orders: plan.orders * days, gmv: plan.gmv * days, roi: Number(plan.roi || 0) };
  };
  function setMetricCards(cards) {
    els.metrics.classList.toggle("pc-metrics-four", cards.length === 4);
    els.metrics.innerHTML = cards.join("");
  }
  const metricDetail = items => `<span class="pc-metric-breakdown">${items.map(([label, value, tone]) => `<i class="${tone || ""}">${label} <b>${value}</b></i>`).join("")}</span>`;
  function setPageTitle(title) { if (app.els.title) app.els.title.textContent = title; }
  function periodLabel(range) { return app.dateRange.isToday(range) ? "今日" : "期间"; }
  function visibleTasks(includeStatus = true, range = dist.filters.taskRange) {
    const { taskScope, taskSearch, creator, taskStatus } = dist.filters;
    const keyword = taskSearch.trim().toLowerCase();
    const creatorKeyword = creator.trim().toLowerCase();
    return app.data.distributionTasks.filter(task => {
      const inScope = taskScope === "all" || (taskScope === "team" ? task.team === dist.currentTeam : task.creator === dist.currentUser);
      const product = app.product(task.productId);
      const matchesKeyword = !keyword || [task.id, task.name, product?.name].some(value => String(value || "").toLowerCase().includes(keyword));
      const matchesCreator = taskScope === "personal" || !creatorKeyword || String(task.creator || "").toLowerCase().includes(creatorKeyword);
      return inScope && matchesKeyword && matchesCreator && (!range || app.dateRange.contains(task.createdAt, range)) && (!includeStatus || taskStatus === "all" || task.status === taskStatus);
    });
  }
  function renderTaskView() {
    setPageTitle("任务视图");
    const tasks = visibleTasks();
    const metricTasks = visibleTasks(false);
    const showCreator = dist.filters.taskScope !== "personal";
    const pageCount = Math.max(1, Math.ceil(tasks.length / dist.pageSize));
    dist.page = Math.min(dist.page, pageCount);
    const rows = tasks.slice((dist.page - 1) * dist.pageSize, dist.page * dist.pageSize);
    const todayTasks = visibleTasks(false, app.dateRange.preset(1)).filter(task => task.status !== "draft");
    const cumulativeTasks = visibleTasks(false, null).filter(task => task.status !== "draft");
    const imageStats = list => ({ success: list.reduce((sum, task) => sum + task.success, 0), failed: list.reduce((sum, task) => sum + task.failed, 0) });
    const today = imageStats(todayTasks), cumulative = imageStats(cumulativeTasks);
    setMetricCards([
      app.metric("任务数", metricTasks.length, metricDetail([["分发成功", metricTasks.filter(task => task.status === "success").length, "success"], ["部分成功", metricTasks.filter(task => task.status === "partial").length, "warning"], ["分发失败", metricTasks.filter(task => task.status === "failed").length, "danger"]])),
      app.metric("今日分发图片数", today.success + today.failed, metricDetail([["成功", today.success, "success"], ["失败", today.failed, "danger"]])),
      app.metric("累计分发图片数", cumulative.success + cumulative.failed, metricDetail([["成功", cumulative.success, "success"], ["失败", cumulative.failed, "danger"]]))
    ]);
    els.head.closest("table").className = "pc-table pc-distribution-task-table";
    els.toolbar.className = "pc-toolbar pc-dist-task-toolbar";
    els.scope.querySelectorAll("[data-dist-scope]").forEach(button => button.classList.toggle("active", button.dataset.distScope === dist.filters.taskScope));
    els.toolbar.innerHTML = `<div class="pc-query-row"><label class="pc-search"><span>⌕</span><input data-dist-filter="taskSearch" value="${app.escape(dist.filters.taskSearch)}" placeholder="搜索任务名称、产品名称或任务ID"></label>${showCreator ? `<label class="pc-search pc-creator-search"><span>⌕</span><input data-dist-filter="creator" value="${app.escape(dist.filters.creator)}" placeholder="搜索创建人"></label>` : ""}${app.dateRange.render("distribution-task", dist.filters.taskRange, { label: "创建时间" })}</div>${statusFilters(taskStatuses, dist.filters.taskStatus, "data-dist-task-status")}`;
    els.cols.innerHTML = (showCreator ? [16, 12, 8, 9, 15, 9, 12, 19] : [18, 14, 10, 17, 10, 12, 19]).map(width => `<col style="width:${width}%">`).join("");
    els.head.innerHTML = `<tr><th>分发任务</th><th>产品名称</th>${showCreator ? "<th>创建人</th>" : ""}<th>任务状态</th><th>分发进度${app.tip("已处理数量包含分发成功与分发失败。")}</th><th>目标计划</th><th>创建时间</th><th>操作</th></tr>`;
    els.body.innerHTML = rows.length ? rows.map(task => {
      const done = task.success + task.failed;
      const percent = task.requested ? Math.min(100, Math.round(done / task.requested * 100)) : 0;
      const actions = task.status === "draft" ? [taskAction(task, "continue-draft", "编辑", "edit"), taskAction(task, "delete-draft", "删除", "danger")] : [taskAction(task, "task-detail", "查看分发", "info")];
      if (task.status === "pending") actions.push(taskAction(task, "cancel-task", "取消", "danger"));
      if (task.status === "uploading") actions.push(taskAction(task, "cancel-task", "取消", "danger"));
      if (["partial", "failed"].includes(task.status) && task.failed) actions.push(taskAction(task, "retry-failed", "重试失败", "warning"));
      return `<tr><td><span class="pc-cell-main">${app.escape(task.name || task.id)}</span><span class="pc-cell-sub">${task.id}</span></td><td><span class="pc-cell-main">${app.escape(app.product(task.productId)?.name)}</span></td>${showCreator ? `<td>${app.escape(task.creator)}</td>` : ""}<td>${dist.taskStatusTag(task.status)}</td><td><div class="pc-progress"><div><i style="width:${percent}%"></i></div><span>${done}/${task.requested}（成功 ${task.success}，失败 ${task.failed}）</span></div></td><td>${task.plans.length} 个</td><td>${task.createdAt}</td><td><div class="pc-actions">${actions.join("")}</div></td></tr>`;
    }).join("") : `<tr><td class="pc-empty" colspan="${showCreator ? 8 : 7}">没有符合条件的分发任务</td></tr>`;
    els.pagination.hidden = false;
    els.pagination.innerHTML = `<span>每页 ${dist.pageSize} 条，共 ${tasks.length} 条</span><div><button data-dist-page="prev" ${dist.page === 1 ? "disabled" : ""}>上一页</button>${Array.from({ length: pageCount }, (_, index) => `<button data-dist-page="${index + 1}" class="${dist.page === index + 1 ? "active" : ""}">${index + 1}</button>`).join("")}<button data-dist-page="next" ${dist.page === pageCount ? "disabled" : ""}>下一页</button></div>`;
  }
  function renderAccountView() {
    setPageTitle("广告账户视图");
    const keyword = dist.filters.accountSearch.trim().toLowerCase();
    const accounts = app.data.accounts.filter(account => {
      const shop = app.shop(account.shopId);
      const matches = !keyword || [account.id, account.name, shop?.id, shop?.name].some(value => String(value || "").toLowerCase().includes(keyword));
      const hasPeriodRecords = distributionStats(plan => plan?.accountId === account.id, dist.filters.accountRange).total > 0;
      return matches && (!dist.filters.accountOnlyActive || hasPeriodRecords);
    });
    const accountIds = new Set(accounts.map(account => account.id));
    const todayRange = app.dateRange.preset(1);
    const todayStats = distributionStats(plan => plan && accountIds.has(plan.accountId), todayRange);
    const abnormalAccounts = accounts.filter(account => distributionStats(plan => plan?.accountId === account.id, todayRange).failed > 0).length;
    const capacityRisk = app.data.plans.filter(plan => accountIds.has(plan.accountId) && plan.current >= 450).length;
    const label = periodLabel(dist.filters.accountRange);
    setMetricCards([
      app.metric("今日分发图片数", todayStats.success + todayStats.failed, metricDetail([["成功", todayStats.success, "success"], ["失败", todayStats.failed, "danger"]])),
      app.metric("容量预警计划", capacityRisk, metricDetail([["素材数≥450张", capacityRisk, "warning"], ["已满500张", app.data.plans.filter(plan => accountIds.has(plan.accountId) && plan.current >= 500).length, "danger"]])),
      app.metric("今日异常广告账户", abnormalAccounts, metricDetail([["失败图片", todayStats.failed, "danger"]]))
    ]);
    els.head.closest("table").className = "pc-table pc-distribution-account-table";
    els.toolbar.className = "pc-toolbar";
    els.toolbar.innerHTML = `<div class="pc-query-row"><label class="pc-search"><span>⌕</span><input data-dist-filter="accountSearch" value="${app.escape(dist.filters.accountSearch)}" placeholder="搜索店铺或广告账户名称/ID"></label>${app.dateRange.render("distribution-account", dist.filters.accountRange, { label: "分发时间" })}<label class="pc-period-only" title="隐藏所选分发时间内分发数量为0的广告账户"><input type="checkbox" data-dist-toggle="accountOnlyActive" ${dist.filters.accountOnlyActive ? "checked" : ""}>仅看期间分发数 &gt; 0</label></div><span class="pc-result-count">共 ${accounts.length} 个广告账户</span>`;
    els.cols.innerHTML = "";
    els.head.innerHTML = `<tr><th>广告账户</th><th>店铺</th><th>计划概况${app.tip("点击计划数量可跳转计划视图，并自动筛选账户及投放状态。")}</th><th>容量预警${app.tip("单计划当前素材数达到450张时预警，500张为分发上限。")}</th><th>${label}分发</th><th>累计系统分发</th><th>最近分发时间</th><th>操作</th></tr>`;
    els.body.innerHTML = accounts.map(account => {
      const plans = app.data.plans.filter(plan => plan.accountId === account.id);
      const activeCount = plans.filter(plan => plan.status === "active").length;
      const riskPlans = plans.filter(plan => plan.current >= 450);
      const fullCount = riskPlans.filter(plan => plan.current >= 500).length;
      const latestTime = latestProcessedDistributionTime(plan => plan?.accountId === account.id);
      const stats = distributionStats(plan => plan?.accountId === account.id, dist.filters.accountRange);
      const cumulative = distributionStats(plan => plan?.accountId === account.id);
      const riskCell = riskPlans.length ? `<span class="pc-capacity-warning ${fullCount ? "danger" : ""}">${fullCount ? `${fullCount} 个已满` : `${riskPlans.length} 个预警`}</span><small>${riskPlans.length} 个计划 ≥450张</small>` : `<span class="pc-capacity-safe">无预警</span>`;
      return `<tr><td><span class="pc-cell-main">${app.escape(account.name)}</span><span class="pc-cell-sub">${account.id}</span></td><td><span class="pc-cell-main">${app.escape(app.shop(account.shopId)?.name)}</span><span class="pc-cell-sub">${account.shopId}</span></td><td><span class="pc-plan-overview"><button data-account-plans="${account.id}" data-plan-status="active"><b>${activeCount}</b> 投放中</button><i>/</i><button data-account-plans="${account.id}" data-plan-status="all">${plans.length} 全部</button></span></td><td><span class="pc-capacity-cell">${riskCell}</span></td><td>${todayDistribution(stats.success, stats.failed)}</td><td><b>${cumulative.total}</b> 张</td><td>${latestTime}</td><td><div class="pc-actions"><button class="pc-action-info" data-dist-action="account-images" data-id="${account.id}">查看系统分发图片</button></div></td></tr>`;
    }).join("");
    els.pagination.hidden = true;
  }
  function renderPlanView() {
    setPageTitle("计划视图");
    const keyword = dist.filters.planSearch.trim().toLowerCase();
    const plans = app.data.plans.filter(plan => {
      const account = app.account(plan.accountId), shop = app.shop(plan.shopId);
      const matches = !keyword || [plan.id, plan.name, account?.id, account?.name, shop?.id, shop?.name].some(value => String(value || "").toLowerCase().includes(keyword));
      const hasPeriodRecords = distributionStats(item => item?.id === plan.id, dist.filters.planRange).total > 0;
      return matches && (dist.filters.planStatus === "all" || plan.status === dist.filters.planStatus) && (!dist.filters.planOnlyActive || hasPeriodRecords);
    }).sort((left, right) => {
      const [field, direction] = dist.filters.planSort.split("-");
      const leftValue = field === "today" ? distributionStats(item => item?.id === left.id, dist.filters.planRange).total : field === "updatedAt" ? latestProcessedDistributionTime(item => item?.id === left.id) : left[field];
      const rightValue = field === "today" ? distributionStats(item => item?.id === right.id, dist.filters.planRange).total : field === "updatedAt" ? latestProcessedDistributionTime(item => item?.id === right.id) : right[field];
      const comparison = typeof leftValue === "number" ? leftValue - rightValue : String(leftValue || "").localeCompare(String(rightValue || ""));
      return direction === "asc" ? comparison : -comparison;
    });
    const visibleIds = new Set(plans.map(plan => plan.id));
    const todayStats = distributionStats(plan => plan && visibleIds.has(plan.id), app.dateRange.preset(1));
    const activePlans = plans.filter(plan => plan.status === "active");
    const riskPlans = plans.filter(plan => plan.current >= 450);
    const label = periodLabel(dist.filters.planRange);
    setMetricCards([
      app.metric("今日分发图片数", todayStats.success + todayStats.failed, metricDetail([["成功", todayStats.success, "success"], ["失败", todayStats.failed, "danger"]])),
      app.metric("投放中计划数", activePlans.length),
      app.metric("容量预警计划", riskPlans.length, metricDetail([["素材数≥450张", riskPlans.length, "warning"], ["已满500张", riskPlans.filter(plan => plan.current >= 500).length, "danger"]]))
    ]);
    els.head.closest("table").className = "pc-table pc-distribution-plan-table";
    els.toolbar.className = "pc-toolbar pc-dist-plan-toolbar";
    els.toolbar.innerHTML = `<div class="pc-dist-plan-toolbar-main"><div class="pc-plan-query-primary"><label class="pc-search"><span>⌕</span><input data-dist-filter="planSearch" value="${app.escape(dist.filters.planSearch)}" placeholder="搜索计划、店铺或广告账户名称/ID"></label>${app.dateRange.render("distribution-plan-data", dist.filters.planDataRange, { label: "千川数据时间" })}${app.dateRange.render("distribution-plan", dist.filters.planRange, { label: "分发时间" })}</div><div class="pc-plan-query-secondary">${dist.filters.planSearch ? `<button class="pc-clear-filter" data-clear-plan-search>清除账户筛选</button>` : ""}<label class="pc-period-only" title="隐藏所选分发时间内分发数量为0的计划"><input type="checkbox" data-dist-toggle="planOnlyActive" ${dist.filters.planOnlyActive ? "checked" : ""}>仅看期间分发数 &gt; 0</label><span class="pc-sync-time">千川同步：09-02 11:20:06</span></div></div>${statusFilters(planStatuses, dist.filters.planStatus, "data-dist-plan-status")}`;
    els.cols.innerHTML = "";
    els.head.innerHTML = `<tr><th>计划</th><th>计划状态</th><th>店铺</th><th>默认广告账户</th><th>${sortHead("spend", "整体消耗(元)")}</th><th>${sortHead("orders", "成交订单数")}</th><th>${sortHead("gmv", "成交金额(元)")}</th><th>${sortHead("roi", "支付ROI")}</th><th>${sortHead("current", "素材容量")}${app.tip("千川单计划最多500张图片素材。")}</th><th>${sortHead("today", `${label}分发`)}</th><th>${sortHead("distributed", "累计系统分发")}</th><th>${sortHead("updatedAt", "最近分发时间")}</th><th>操作</th></tr>`;
    els.body.innerHTML = plans.length ? plans.map(plan => {
      const capacityPercent = Math.min(100, Math.round(plan.current / 500 * 100));
      const capacityTone = plan.current >= 500 ? "danger" : plan.current >= 450 ? "warning" : "";
      const metric = dist.performanceForRange(plan, dist.filters.planDataRange);
      const stats = distributionStats(item => item?.id === plan.id, dist.filters.planRange);
      const cumulative = distributionStats(item => item?.id === plan.id);
      return `<tr><td><span class="pc-cell-main">${app.escape(plan.name)}</span><span class="pc-cell-sub">${plan.id}</span></td><td>${dist.planStatusTag(plan.status)}</td><td><span class="pc-cell-main">${app.escape(app.shop(plan.shopId)?.name)}</span><span class="pc-cell-sub">${plan.shopId}</span></td><td><span class="pc-cell-main">${app.escape(app.account(plan.accountId)?.name)}</span><span class="pc-cell-sub">${plan.accountId}</span></td><td>${dist.formatNumber(metric.spend)}</td><td>${dist.formatNumber(metric.orders)}</td><td>${dist.formatNumber(metric.gmv)}</td><td><b>${metric.roi.toFixed(2)}</b></td><td><div class="pc-capacity-progress ${capacityTone}"><span><b>${plan.current}</b>/500</span><i><em style="width:${capacityPercent}%"></em></i></div></td><td>${todayDistribution(stats.success, stats.failed)}</td><td>${dist.formatNumber(cumulative.total)} 张</td><td>${latestProcessedDistributionTime(item => item?.id === plan.id)}</td><td><div class="pc-actions"><button class="pc-action-info" data-dist-action="plan-detail" data-id="${plan.id}">查看系统分发图片</button></div></td></tr>`;
    }).join("") : `<tr><td class="pc-empty" colspan="13">没有符合条件的计划</td></tr>`;
    els.pagination.hidden = true;
  }
  app.renderDistribution = () => {
    els.scopeRow.hidden = app.state.distributionView !== "task";
    if (app.state.distributionView === "task") renderTaskView();
    if (app.state.distributionView === "account") renderAccountView();
    if (app.state.distributionView === "plan") renderPlanView();
  };

  els.view.addEventListener("click", event => {
    const button = event.target.closest("[data-view]"); if (!button) return;
    app.state.distributionView = button.dataset.view;
    els.view.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
    app.renderDistribution();
  });
  els.scope.addEventListener("click", event => {
    const button = event.target.closest("[data-dist-scope]");
    if (!button) return;
    dist.filters.taskScope = button.dataset.distScope;
    dist.page = 1;
    app.renderDistribution();
  });
  els.toolbar.addEventListener("input", event => {
    if (!event.target.dataset.distFilter) return;
    const field = event.target.dataset.distFilter;
    dist.filters[field] = event.target.value; dist.page = 1; app.renderDistribution();
    requestAnimationFrame(() => { const input = els.toolbar.querySelector(`[data-dist-filter="${field}"]`); input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); });
  });
  els.toolbar.addEventListener("click", event => {
    if (app.dateRange.handle(event, "distribution-task", dist.filters.taskRange) || app.dateRange.handle(event, "distribution-account", dist.filters.accountRange) || app.dateRange.handle(event, "distribution-plan-data", dist.filters.planDataRange) || app.dateRange.handle(event, "distribution-plan", dist.filters.planRange)) { dist.page = 1; app.renderDistribution(); return; }
    const taskStatus = event.target.closest("[data-dist-task-status]");
    const planStatus = event.target.closest("[data-dist-plan-status]");
    if (taskStatus) { dist.filters.taskStatus = taskStatus.dataset.distTaskStatus; dist.page = 1; app.renderDistribution(); }
    if (planStatus) { dist.filters.planStatus = planStatus.dataset.distPlanStatus; app.renderDistribution(); }
    const clearPlan = event.target.closest("[data-clear-plan-search]");
    if (clearPlan) { dist.filters.planSearch = ""; app.renderDistribution(); return; }
    const sort = event.target.closest("[data-dist-sort]");
    if (sort) {
      const [current, direction] = dist.filters.planSort.split("-");
      dist.filters.planSort = `${sort.dataset.distSort}-${current === sort.dataset.distSort && direction === "desc" ? "asc" : "desc"}`;
      app.renderDistribution();
    }
  });
  els.toolbar.addEventListener("change", event => {
    if (app.dateRange.handle(event, "distribution-task", dist.filters.taskRange) || app.dateRange.handle(event, "distribution-account", dist.filters.accountRange) || app.dateRange.handle(event, "distribution-plan-data", dist.filters.planDataRange) || app.dateRange.handle(event, "distribution-plan", dist.filters.planRange)) { dist.page = 1; app.renderDistribution(); return; }
    const toggle = event.target.closest("[data-dist-toggle]");
    if (toggle) { dist.filters[toggle.dataset.distToggle] = toggle.checked; app.renderDistribution(); }
  });
  els.head.addEventListener("click", event => {
    const sort = event.target.closest("[data-dist-sort]");
    if (!sort) return;
    const [current, direction] = dist.filters.planSort.split("-");
    dist.filters.planSort = `${sort.dataset.distSort}-${current === sort.dataset.distSort && direction === "desc" ? "asc" : "desc"}`;
    app.renderDistribution();
  });
  els.pagination.addEventListener("click", event => {
    const button = event.target.closest("[data-dist-page]"); if (!button || button.disabled) return;
    if (button.dataset.distPage === "prev") dist.page -= 1;
    else if (button.dataset.distPage === "next") dist.page += 1;
    else dist.page = Number(button.dataset.distPage);
    app.renderDistribution();
  });
  root.addEventListener("click", event => {
    const planLink = event.target.closest("[data-account-plans]");
    if (planLink) {
      const account = app.account(planLink.dataset.accountPlans);
      app.state.distributionView = "plan";
      dist.filters.planSearch = account?.name || planLink.dataset.accountPlans;
      dist.filters.planStatus = planLink.dataset.planStatus;
      els.view.querySelectorAll("button").forEach(item => item.classList.toggle("active", item.dataset.view === "plan"));
      app.renderDistribution(); return;
    }
    const button = event.target.closest("[data-dist-action]"); if (!button) return;
    const task = app.data.distributionTasks.find(item => item.id === button.dataset.id);
    if (button.dataset.distAction === "task-detail" && task) dist.openTaskDetail?.(task);
    if (button.dataset.distAction === "retry-failed" && task) dist.retryTaskFailures?.(task);
    if (button.dataset.distAction === "continue-draft" && task) app.openDistributionWizard?.(task.productId, task.id);
    if (button.dataset.distAction === "cancel-task" && task) dist.cancelTask?.(task);
    if (button.dataset.distAction === "delete-draft" && task) dist.deleteDraft?.(task);
    if (button.dataset.distAction === "account-images") dist.openAccountImages?.(app.account(button.dataset.id));
    if (button.dataset.distAction === "plan-detail") dist.openPlanDetail?.(app.plan(button.dataset.id));
  });
  app.renderDistribution();
})();

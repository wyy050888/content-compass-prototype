(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const root = app.root;
  const els = {
    scope: root.querySelector("#pcGenerationScope"), metrics: root.querySelector("#pcGenerationMetrics"),
    search: root.querySelector("#pcGenerationSearch"), creator: root.querySelector("#pcGenerationCreator"),
    creatorWrap: root.querySelector("#pcGenerationCreatorWrap"), statuses: root.querySelector("#pcGenerationStatus"),
    dateRange: root.querySelector("#pcGenerationDateRange"),
    cols: root.querySelector("#pcGenerationCols"), head: root.querySelector("#pcGenerationHead"), body: root.querySelector("#pcGenerationBody"),
    pagination: root.querySelector("#pcGenerationPagination")
  };
  let statusFilter = "all";
  let currentPage = 1;
  let highlightedTaskId = "";
  let highlightTimer = 0;
  const createdRange = app.dateRange.preset(30);
  const pageSize = 20;
  const metricDetail = items => `<span class="pc-metric-breakdown">${items.map(([label, value, tone]) => `<i class="${tone || ""}">${label} <b>${value}</b></i>`).join("")}</span>`;

  function actionButton(task, action, label, tone) {
    return `<button class="pc-action-${tone}" data-generation-action="${action}" data-id="${task.id}">${label}</button>`;
  }

  function taskStatus(task) {
    if (task.status !== "failed") return app.statusTag(task.status);
    const reason = task.failureReason || "生图服务执行失败，请再次生成后重试。";
    return `<span class="pc-status failed" tabindex="0" data-pc-tip="${app.escape(reason)}" aria-label="生成失败，悬浮查看失败原因">生成失败</span>`;
  }

  function taskActions(task) {
    const isDraft = task.status === "draft";
    const actions = [actionButton(task, "strategy", isDraft ? "编辑策略" : "查看策略", isDraft ? "edit" : "info")];
    if (isDraft) actions.push(actionButton(task, "submit", "提交生成", "primary"), actionButton(task, "delete", "删除", "danger"));
    if (["pending", "running"].includes(task.status)) actions.push(actionButton(task, "pause", "暂停", "warning"), actionButton(task, "cancel", "取消", "danger"));
    if (task.status === "paused") actions.push(actionButton(task, "resume", "继续生成", "primary"), actionButton(task, "cancel", "取消", "danger"));
    if (["success", "partial", "cancelled"].includes(task.status) && task.success > 0) actions.push(actionButton(task, "screen", "筛选图片", "success"));
    if (["success", "partial", "failed", "cancelled"].includes(task.status)) actions.push(actionButton(task, "repeat", "再次生成", "primary"));
    return actions.join("");
  }

  function validDraft(task) {
    if (!task.rules?.length || task.rules.length > 50 || task.target < 1 || task.target > 200) return false;
    return task.name?.trim() && app.product(task.productId) && task.rules.every(rule => rule.images?.length && rule.images.length <= app.generationLimits.maxRuleImages && rule.promptState === "ready" && rule.prompt?.trim() && Number.isInteger(rule.quantity) && rule.quantity >= 1 && rule.quantity <= 20);
  }

  function screeningProgress(task) {
    if (task.success < 1) return `<span class="pc-screen-state muted" title="当前没有生成成功的图片">无可筛图片</span>`;
    if (!["success", "partial", "cancelled"].includes(task.status)) return `<span class="pc-screen-state muted" title="任务结束后才能统一筛选图片">未开始</span>`;
    const images = app.data.images.filter(image => image.taskId === task.id);
    const selected = images.filter(image => image.screenStatus === "selected").length;
    const rejected = images.filter(image => image.screenStatus === "rejected").length;
    const decided = Math.min(task.success, selected + rejected);
    const pending = Math.max(0, task.success - decided);
    const state = pending ? (decided ? "筛选中" : "未开始") : "已完成";
    const stateClass = pending ? (decided ? "processing" : "muted") : "complete";
    return `<div class="pc-screen-progress">
      <div class="pc-screen-progress-head"><span class="pc-screen-state ${stateClass}">${state}</span><b>${decided}/${task.success}</b></div>
      <div class="pc-screen-progress-counts"><span class="selected">选用 <b>${selected}</b></span><i>·</i><span>不选用 <b>${rejected}</b></span>${pending ? `<i>·</i><span class="pending">待筛 <b>${pending}</b></span>` : ""}</div>
    </div>`;
  }

  app.renderGeneration = () => {
    if (app.state.generationView === "product") {
      app.renderGenerationProducts?.();
      return;
    }
    const keyword = els.search.value.trim().toLowerCase();
    const creatorKeyword = els.creator.value.trim().toLowerCase();
    const scope = app.state.generationScope;
    const showCreator = scope !== "personal";
    const scoped = app.data.generationTasks.filter(task => app.canViewTask ? app.canViewTask(task, "generate", scope) : scope === "all" || (scope === "team" ? task.team === "抖音三区" : task.creator === "周宁"));
    const all = scoped.filter(task => app.dateRange.contains(task.createdAt, createdRange));
    const tasks = all.filter(task => {
      const product = app.product(task.productId);
      const matchesMain = !keyword || [task.id, task.name, product?.name].some(value => String(value || "").toLowerCase().includes(keyword));
      const matchesCreator = !showCreator || !creatorKeyword || String(task.creator || "").toLowerCase().includes(creatorKeyword);
      return matchesMain && matchesCreator && (statusFilter === "all" || task.status === statusFilter);
    });
    const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const pageTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    els.creatorWrap.hidden = !showCreator;
    els.dateRange.innerHTML = app.dateRange.render("generation-created", createdRange, { label: "创建时间", compact: true });
    const todayRange = app.dateRange.preset(1);
    const todayResults = scoped.flatMap(task => task.processingResults || []).filter(result => app.dateRange.contains(result.completedAt, todayRange));
    const todaySuccess = todayResults.filter(item => item.status === "success").length, todayFailed = todayResults.filter(item => item.status === "failed").length;
    const cumulativeSuccess = scoped.reduce((sum, task) => sum + task.success, 0), cumulativeFailed = scoped.reduce((sum, task) => sum + task.failed, 0);
    const scopedIds = new Set(scoped.map(task => task.id));
    const todaySelected = app.data.images.filter(image => scopedIds.has(image.taskId) && image.screenStatus === "selected" && image.selectedAt && app.dateRange.contains(image.selectedAt, todayRange)).length;
    const cumulativeSelected = app.data.images.filter(image => scopedIds.has(image.taskId) && image.screenStatus === "selected").length;
    els.metrics.innerHTML = [
      app.metric("任务数", all.length, metricDetail([["生成成功", all.filter(task => task.status === "success").length, "success"], ["部分成功", all.filter(task => task.status === "partial").length, "warning"], ["生成失败", all.filter(task => task.status === "failed").length, "danger"]])),
      app.metric("今日生图处理数", todaySuccess + todayFailed, metricDetail([["成功", todaySuccess, "success"], ["失败", todayFailed, "danger"]])),
      app.metric("累计生图处理数", cumulativeSuccess + cumulativeFailed, metricDetail([["成功", cumulativeSuccess, "success"], ["失败", cumulativeFailed, "danger"]])),
      app.metric("今日选用图片数", todaySelected, metricDetail([["累计选用", cumulativeSelected, "primary"]]))
    ].join("");
    els.cols.innerHTML = (showCreator ? [14, 10, 7, 8, 14, 13, 10, 10, 14] : [15, 11, 9, 14, 14, 11, 11, 15]).map(width => `<col style="width:${width}%">`).join("");
    els.head.innerHTML = `<tr><th>任务名称</th><th>产品名称</th>${showCreator ? "<th>创建人</th>" : ""}<th>任务状态</th><th>生成进度${app.tip("已完成数量 ÷ 目标数量；已完成数量包含生成成功与生成失败。")}</th><th>筛选进度${app.tip("已筛选数量为选用与不选用之和；仅生成成功的图片需要筛选。")}</th><th>规则/目标图片</th><th>创建时间</th><th>操作</th></tr>`;
    els.body.innerHTML = pageTasks.length ? pageTasks.map(task => {
      const product = app.product(task.productId);
      return `<tr data-generation-task-id="${app.escape(task.id)}" class="${task.id === highlightedTaskId ? "pc-saved-task-highlight" : ""}"><td><span class="pc-cell-main">${app.escape(task.name)}</span><span class="pc-cell-sub">${task.id}</span></td><td><span class="pc-cell-main">${app.escape(product?.name)}</span></td>${showCreator ? `<td>${app.escape(task.creator)}</td>` : ""}<td>${taskStatus(task)}</td><td>${app.formatProgress(task)}</td><td>${screeningProgress(task)}</td><td>${task.rules.length} 条 / ${task.target} 张</td><td>${app.shortTime(task.createdAt)}</td><td><div class="pc-actions">${taskActions(task)}</div></td></tr>`;
    }).join("") : `<tr><td class="pc-empty" colspan="${showCreator ? 9 : 8}">没有符合条件的任务</td></tr>`;
    els.pagination.innerHTML = `<span>每页 ${pageSize} 条</span><div><button data-page="prev" ${currentPage === 1 ? "disabled" : ""}>上一页</button>${Array.from({ length: totalPages }, (_, index) => `<button data-page="${index + 1}" class="${currentPage === index + 1 ? "active" : ""}>${index + 1}</button>`).join("")}<button data-page="next" ${currentPage === totalPages ? "disabled" : ""}>下一页</button></div>`;
  };

  app.focusGenerationDraft = taskId => {
    const task = app.data.generationTasks.find(item => item.id === taskId);
    if (!task) return;
    highlightedTaskId = taskId;
    statusFilter = "draft";
    currentPage = 1;
    els.search.value = "";
    els.creator.value = "";
    Object.assign(createdRange, app.dateRange.preset(30));
    const availableScope = [...els.scope.querySelectorAll("[data-scope]")].find(button => button.getAttribute("data-permission-hidden") !== "true" && (!app.canViewTask || app.canViewTask(task, "generate", button.dataset.scope)));
    if (availableScope) {
      app.state.generationScope = availableScope.dataset.scope;
      els.scope.querySelectorAll("[data-scope]").forEach(button => button.classList.toggle("active", button === availableScope));
    }
    els.statuses.querySelectorAll("[data-status]").forEach(button => button.classList.toggle("active", button.dataset.status === "draft"));
    app.setGenerationView?.("task");
    app.renderGeneration();
    if (!els.body.querySelector(`[data-generation-task-id="${taskId}"]`)) {
      Object.assign(createdRange, { start: "", end: "" });
      app.renderGeneration();
    }
    window.clearTimeout(highlightTimer);
    window.requestAnimationFrame(() => els.body.querySelector(`[data-generation-task-id="${taskId}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
    highlightTimer = window.setTimeout(() => {
      if (highlightedTaskId !== taskId) return;
      highlightedTaskId = "";
      els.body.querySelector(`[data-generation-task-id="${taskId}"]`)?.classList.remove("pc-saved-task-highlight");
    }, 2600);
  };

  async function handleTaskAction(task, action) {
    if (action === "strategy") app.openGenerationStrategy?.(task);
    if (action === "screen") app.openGenerationScreening?.(task);
    if (action === "repeat") app.openRepeatedGeneration?.(task);
    if (action === "submit") {
      if (!validDraft(task)) { app.toast("草稿规则尚未完整，请先编辑策略"); app.openGenerationStrategy?.(task); return; }
      const ok = await app.confirm("提交生图任务？", `将按当前 ${task.rules.length} 条规则生成 ${task.target} 张图片。`, "提交生成");
      if (ok) { task.status = "pending"; app.renderGeneration(); app.toast("任务已进入待生成队列"); }
    }
    if (action === "pause") {
      const ok = await app.confirm("暂停生图任务？", "已生成图片和进度会保留；正在处理的单张完成后将不再下发新请求。", "确认暂停");
      if (ok) { task.pausedFrom = task.status; task.status = "paused"; app.renderGeneration(); app.toast("任务已暂停"); }
    }
    if (action === "resume") {
      delete task.demoSeed;
      task.status = task.success + task.failed >= task.target ? (task.failed ? "partial" : "success") : "running";
      app.renderGeneration(); app.toast("任务已继续生成");
    }
    if (action === "cancel") {
      const ok = await app.confirm("取消生图任务？", "已生成的图片会保留，尚未执行的规则不再生成。", "确认取消");
      if (ok) { task.status = "cancelled"; app.renderGeneration(); app.toast("任务已取消"); }
    }
    if (action === "delete") {
      const ok = await app.confirm("删除草稿？", "草稿及其中未提交的规则将被删除。", "删除草稿");
      if (ok) { app.data.generationTasks.splice(app.data.generationTasks.indexOf(task), 1); app.renderGeneration(); app.toast("草稿已删除"); }
    }
  }

  els.scope.addEventListener("click", event => {
    const button = event.target.closest("[data-scope]"); if (!button) return;
    app.state.generationScope = button.dataset.scope;
    currentPage = 1;
    els.scope.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
    app.renderGeneration();
  });
  els.search.addEventListener("input", () => { currentPage = 1; app.renderGeneration(); });
  els.creator.addEventListener("input", () => { currentPage = 1; app.renderGeneration(); });
  els.statuses.addEventListener("click", event => {
    const button = event.target.closest("[data-status]"); if (!button) return;
    statusFilter = button.dataset.status;
    currentPage = 1;
    els.statuses.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
    app.renderGeneration();
  });
  els.dateRange.addEventListener("click", event => {
    if (!app.dateRange.handle(event, "generation-created", createdRange)) return;
    currentPage = 1; app.renderGeneration();
  });
  els.dateRange.addEventListener("change", event => {
    if (!app.dateRange.handle(event, "generation-created", createdRange)) return;
    currentPage = 1; app.renderGeneration();
  });
  els.body.addEventListener("click", event => {
    const button = event.target.closest("[data-generation-action]"); if (!button) return;
    const task = app.data.generationTasks.find(item => item.id === button.dataset.id);
    if (task) handleTaskAction(task, button.dataset.generationAction);
  });
  els.pagination.addEventListener("click", event => {
    const button = event.target.closest("[data-page]"); if (!button || button.disabled) return;
    if (button.dataset.page === "prev") currentPage -= 1;
    else if (button.dataset.page === "next") currentPage += 1;
    else currentPage = Number(button.dataset.page);
    app.renderGeneration();
    root.querySelector(".pc-generation-table")?.scrollIntoView({ block: "nearest" });
  });

  window.setInterval(() => {
    let task = app.data.generationTasks.find(item => item.status === "running" && !item.demoSeed);
    if (!task) { task = app.data.generationTasks.find(item => item.status === "pending" && !item.demoSeed); if (task) task.status = "running"; }
    if (!task) return;
    for (let index = 0; index < 2; index += 1) app.completeGenerationSample(task);
    if (task.success + task.failed >= task.target) { task.status = task.failed ? (task.success ? "partial" : "failed") : "success"; task.completedAt = app.now(); }
    if (app.state.section === "generation") app.renderGeneration();
  }, 3000);

  app.renderGeneration();
})();

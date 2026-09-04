(function () {
  "use strict";
  const app = window.ProductCardApp;
  const dist = app?.distribution;
  if (!app || !dist) return;

  let activeTask = null;
  let resultFilter = "all";
  const seededSuccessfulImagePlans = new Set();

  function registerSuccessfulDistribution(record, task) {
    if (record?.status !== "success" || !record.imageId) return false;
    const image = app.data.images.find(item => item.id === record.imageId);
    const plan = app.plan(record.planId);
    if (!image || !plan) return false;
    image.distributionHistory ||= [];
    const existing = image.distributionHistory.find(item => item.resultId === record.id);
    if (existing) {
      existing.taskId ||= task?.id || "";
      existing.planId ||= plan.id;
      existing.accountId ||= plan.accountId;
      image.distributionCount = image.distributionHistory.length;
      return false;
    }
    image.distributionHistory.push({
      resultId: record.id,
      taskId: task?.id || "",
      planId: plan.id,
      accountId: plan.accountId,
      account: `${plan.accountId} ${app.account(plan.accountId)?.name || ""}`.trim(),
      plan: `${plan.id} ${plan.name}`,
      time: task?.createdAt || "09-04 现在"
    });
    image.distributionCount = image.distributionHistory.length;
    return true;
  }
  dist.registerSuccessfulDistribution = registerSuccessfulDistribution;

  function distributionCount(source, context) {
    const history = source?.distributionHistory || [];
    if (!context?.type || context.type === "all") return history.length;
    return history.filter(item => {
      if (context.type === "task") return item.taskId === context.id;
      if (context.type === "plan") return (item.planId || String(item.plan || "").split(" ")[0]) === context.id;
      if (context.type === "account") return (item.accountId || String(item.account || "").split(" ")[0]) === context.id;
      return false;
    }).length;
  }
  dist.distributionCount = distributionCount;

  function syncSuccessfulDistributionHistory(task) {
    task.imageResults?.forEach(record => registerSuccessfulDistribution(record, task));
  }

  function ensureImageResults(task) {
    if (task.imageResults) {
      syncSuccessfulDistributionHistory(task);
      return task.imageResults;
    }
    let pool = app.data.images.filter(image => image.productId === task.productId);
    if (task.sourceTaskIds?.length) pool = pool.filter(image => task.sourceTaskIds.includes(image.taskId));
    const planSlots = [];
    (task.results || []).forEach(result => {
      for (let index = 0; index < result.success + result.failed; index += 1) planSlots.push(result.planId);
    });
    task.imageResults = Array.from({ length: task.requested }, (_, index) => {
      const status = index < task.success ? "success" : index < task.success + task.failed ? "failed" : "pending";
      const planId = planSlots[index] || task.plans[index % Math.max(task.plans.length, 1)] || "";
      let image = pool[index % Math.max(pool.length, 1)];
      if (status === "success" && planId && pool.length) {
        image = Array.from({ length: pool.length }, (_, offset) => pool[(index + offset) % pool.length])
          .find(candidate => !seededSuccessfulImagePlans.has(`${candidate.id}|${planId}`)) || image;
        if (image) seededSuccessfulImagePlans.add(`${image.id}|${planId}`);
      }
      const planResult = task.results?.find(item => item.planId === planId);
      return {
        id: `${task.id}-RESULT-${String(index + 1).padStart(3, "0")}`,
        imageId: image?.id || "",
        fileName: image?.fileName || `${app.product(task.productId)?.name || "商品"}-待分发-${index + 1}.png`,
        order: image?.order || index + 1,
        ruleIndex: image?.ruleIndex || Math.floor(index / 2) + 1,
        planId, status, retries: 0,
        reason: status === "failed" ? (planResult?.reason || task.failureReason || "分发失败") : status === "pending" ? (task.status === "cancelled" ? "任务已取消，未执行分发" : "等待处理") : "分发成功"
      };
    });
    syncSuccessfulDistributionHistory(task);
    return task.imageResults;
  }
  dist.ensureImageResults = ensureImageResults;

  function recalcTask(task) {
    const results = ensureImageResults(task);
    task.success = results.filter(item => item.status === "success").length;
    task.failed = results.filter(item => item.status === "failed").length;
    const pending = results.filter(item => item.status === "pending").length;
    task.status = pending ? (task.status === "draft" ? "draft" : task.status === "pending" ? "pending" : "uploading") : task.failed ? (task.success ? "partial" : "failed") : "success";
  }
  dist.recalcTask = recalcTask;

  function detailImageCard(record, showStatus, countContext = null) {
    dist.transientImageRecords ||= new Map();
    dist.transientImageRecords.set(record.id, record);
    const source = app.data.images.find(image => image.id === record.imageId);
    const sourceTask = app.data.generationTasks.find(task => task.id === source?.taskId);
    const sourceRule = sourceTask?.rules?.[Math.max(0, Number(record.ruleIndex || 1) - 1)];
    const distributionTask = record.distributionTask;
    const totalDistributionCount = distributionCount(source);
    const contextualDistributionCount = countContext ? distributionCount(source, countContext) : totalDistributionCount;
    const countLabel = countContext?.label || "累计";
    const statusLabel = record.status === "success" ? "成功" : record.status === "failed" ? "失败" : record.reason?.includes("取消") ? "未处理" : "待处理";
    const visual = source?.url
      ? `<img src="${app.escape(source.url)}" alt="${app.escape(record.fileName)}">`
      : `<span class="pc-distribution-placeholder tone-${(record.order || 0) % 6 + 1}" aria-hidden="true"></span>`;
    const failureReason = app.escape(record.reason || "分发失败");
    return `<article class="pc-distribution-image-card ${record.status || "pending"}">
      <div class="pc-distribution-image-stage">
        <button type="button" class="pc-distribution-image-preview" data-open-distribution-image="${record.id}" data-count-context-type="${app.escape(countContext?.type || "all")}" data-count-context-id="${app.escape(countContext?.id || "")}" data-count-context-label="${app.escape(countLabel)}" aria-label="查看大图：${app.escape(record.fileName)}">${visual}<span class="pc-image-zoom-hint">查看大图</span></button>
        ${showStatus ? `<span class="pc-dist-result-tag pc-distribution-status-badge ${record.status}">${statusLabel}</span>` : ""}
        <span class="pc-distribution-count-badge ${contextualDistributionCount ? "distributed" : ""}">${app.escape(countLabel)} ${contextualDistributionCount} 次</span>
      </div>
      <div class="pc-distribution-image-meta">
        <strong title="${app.escape(record.fileName)}">${app.escape(record.fileName)}</strong>
        ${showStatus && record.status === "failed" ? `<div class="pc-image-result-line failed"><span title="${failureReason}">${failureReason}</span><button class="pc-card-retry" data-result-retry="${record.id}" ${distributionTask ? `data-result-task="${distributionTask.id}"` : ""}>重试</button></div>` : ""}
        <div class="pc-distribution-source-row"><span title="${app.escape(sourceTask?.name || source?.taskId || "生成任务")}">${app.escape(sourceTask?.name || source?.taskId || "生成任务")}</span><span class="pc-source-detail-trigger" tabindex="0" data-pc-tip="来源详情" data-pc-tip-kind="source-detail" data-source-task="${app.escape(`${sourceTask?.name || "生成任务"} · ${sourceTask?.id || source?.taskId || "—"}`)}" data-source-prompt="${app.escape(sourceRule?.prompt || "未记录提示词")}" data-source-distribution-count="${totalDistributionCount}" aria-label="悬浮查看来源任务、提示词和历史分发次数">来源详情</span></div>
      </div>
    </article>`;
  }
  dist.detailImageCard = detailImageCard;
  dist.recordById = id => {
    for (const task of app.data.distributionTasks) {
      const record = ensureImageResults(task).find(item => item.id === id);
      if (record) return Object.assign(record, { distributionTask: task });
    }
    return dist.transientImageRecords?.get(id) || null;
  };
  dist.renderDistributionTable = (allocations, options = {}) => {
    if (!allocations.length) return `<div class="pc-empty">当前没有符合条件的分发图片</div>`;
    const context = options.context || "detail";
    return `<div class="pc-distribution-table-wrap"><table class="pc-distribution-table"><thead><tr><th>序号</th><th>店铺</th><th>默认广告账户</th><th>计划</th><th>计划状态</th><th>分发图片</th><th>分发数量</th><th>${options.preview ? "当前/预计素材数" : "当前素材数"}</th></tr></thead><tbody>${allocations.map((item, index) => {
      const plan = item.plan;
      const shop = app.shop(plan?.shopId);
      const account = app.account(plan?.accountId);
      const key = `${context}-${index}`;
      const imageNames = item.images.slice(0, 2).map(record => `<span title="${app.escape(record.fileName)}">${app.escape(record.fileName)}</span>`).join("");
      return `<tr><td>${index + 1}</td><td><span class="pc-two-line"><b>${app.escape(shop?.name || "—")}</b><small>${shop?.id || "—"}</small></span></td><td><span class="pc-two-line"><b>${app.escape(account?.name || "—")}</b><small>${account?.id || "—"}</small></span></td><td><span class="pc-two-line"><b>${app.escape(plan?.name || "—")}</b><small>${plan?.id || "—"}</small></span></td><td>${plan ? dist.planStatusTag(plan.status) : "—"}</td><td><div class="pc-distribution-image-summary"><div>${imageNames || "—"}</div><button type="button" data-toggle-plan-images="${key}">查看全部 ${item.images.length} 张</button></div></td><td><b>${item.images.length} 张</b></td><td>${options.preview ? `${plan?.current || 0} / ${(plan?.current || 0) + item.images.length}` : `${plan?.current || 0} 张`}</td></tr><tr class="pc-distribution-image-row" data-plan-images-row="${key}" hidden><td colspan="8"><div class="pc-distribution-image-grid">${item.images.map(record => detailImageCard(record, options.showStatus, options.countContext)).join("")}</div></td></tr>`;
    }).join("")}</tbody></table></div>`;
  };

  function renderTaskDetail() {
    if (!activeTask) return;
    const results = ensureImageResults(activeTask);
    const counts = {
      all: results.length,
      success: results.filter(item => item.status === "success").length,
      failed: results.filter(item => item.status === "failed").length,
      unprocessed: results.filter(item => !["success", "failed"].includes(item.status)).length
    };
    const visible = resultFilter === "all" ? results : results.filter(item => item.status === resultFilter);
    const allocations = [...new Set(visible.map(item => item.planId))].filter(Boolean).map(planId => ({ plan: app.plan(planId), images: visible.filter(item => item.planId === planId).map(item => ({ ...item, distributionTask: activeTask })) }));
    app.els.drawerBody.innerHTML = `<div class="pc-task-detail-content"><div class="pc-detail-grid pc-dist-detail-summary">
      <div class="pc-detail-item"><span>当前状态</span><b>${dist.taskStatusText(activeTask.status)}</b></div>
      <div class="pc-detail-item"><span>请求分发</span><b>${activeTask.requested} 张</b></div>
      <div class="pc-detail-item"><span>成功</span><b>${counts.success} 张</b></div>
      <div class="pc-detail-item"><span>失败</span><b>${counts.failed} 张</b></div>
      <div class="pc-detail-item"><span>未处理</span><b>${counts.unprocessed} 张</b></div>
    </div><div class="pc-result-tabs" role="tablist">
      <button class="${resultFilter === "all" ? "active" : ""}" data-result-filter="all">全部图片 <b>${counts.all}</b></button>
      <button class="${resultFilter === "success" ? "active" : ""}" data-result-filter="success">成功 <b>${counts.success}</b></button>
      <button class="${resultFilter === "failed" ? "active" : ""}" data-result-filter="failed">失败 <b>${counts.failed}</b></button>
    </div>${dist.renderDistributionTable(allocations, { context: `${activeTask.id}-${resultFilter}`, showStatus: true, countContext: { type: "task", id: activeTask.id, label: "本任务" } })}</div>`;
    const runningActions = ["pending", "uploading"].includes(activeTask.status) ? `<button class="pc-btn pc-btn-danger" data-dist-action="cancel-task" data-id="${activeTask.id}">取消任务</button>` : "";
    app.els.drawerFoot.innerHTML = `${counts.failed && ["partial", "failed"].includes(activeTask.status) ? `<button class="pc-btn pc-btn-warning" data-result-retry-all>重试全部失败项</button>` : ""}${runningActions}<button class="pc-btn" data-pc-close-drawer>关闭</button>`;
  }
  dist.refreshTaskDetail = () => {
    if (activeTask && app.els.drawerBody.querySelector(".pc-task-detail-content")) renderTaskDetail();
  };

  dist.openTaskDetail = task => {
    activeTask = task;
    resultFilter = "all";
    app.openDrawer({ mode: "view", className: "pc-distribution-drawer", eyebrow: task.id, title: "查看分发", subtitle: `${task.name || app.product(task.productId)?.name} · ${task.createdAt}`, body: "", footer: "" });
    renderTaskDetail();
  };

  function retryRecord(record) {
    const plan = app.plan(record.planId);
    if (!plan?.canUpload) { record.reason = `计划${dist.planStatusText(plan?.status)}，暂不可分发`; return false; }
    if (plan.current + 1 > 500) { record.reason = `计划当前素材数 ${plan.current}，已达到500张上限`; return false; }
    record.status = "success"; record.reason = "重试分发成功"; record.retries += 1;
    registerSuccessfulDistribution(record, record.distributionTask);
    plan.current += 1; plan.distributed += 1; plan.today += 1;
    const account = app.account(plan.accountId); account.today += 1; account.total += 1;
    return true;
  }
  dist.retryRecord = retryRecord;

  dist.retryTaskFailures = task => {
    activeTask = task;
    const failed = ensureImageResults(task).filter(item => item.status === "failed");
    if (!failed.length) { app.toast("当前任务没有可重试的失败图片"); return; }
    const success = failed.filter(retryRecord).length;
    recalcTask(task); app.renderDistribution();
    app.toast(`重试完成：成功 ${success} 张，失败 ${failed.length - success} 张`);
    dist.openTaskDetail(task); resultFilter = task.failed ? "failed" : "success"; renderTaskDetail();
  };

  dist.cancelTask = async task => {
    const ok = await app.confirm("取消分发任务？", "已分发图片会保留，剩余未处理图片不会继续分发。", "确认取消");
    if (!ok) return;
    const finishCancel = () => {
      task.status = "cancelled";
      ensureImageResults(task).forEach(record => { if (record.status === "pending") record.reason = "任务已取消，未执行分发"; });
      app.renderDistribution(); app.toast("任务已取消");
      if (activeTask?.id === task.id) renderTaskDetail();
    };
    if (task.status === "uploading") {
      task.status = "cancelling"; app.renderDistribution(); app.toast("正在结束当前分发批次");
      if (activeTask?.id === task.id) renderTaskDetail();
      window.setTimeout(() => { if (task.status === "cancelling") finishCancel(); }, 900);
    } else finishCancel();
  };
  dist.deleteDraft = async task => {
    const ok = await app.confirm("删除分发草稿？", "草稿中的图片、店铺和计划配置将无法恢复。", "删除草稿");
    if (!ok) return;
    const index = app.data.distributionTasks.indexOf(task);
    if (index >= 0) app.data.distributionTasks.splice(index, 1);
    app.renderDistribution(); app.toast("分发草稿已删除");
  };

  app.root.addEventListener("click", event => {
    const toggle = event.target.closest("[data-toggle-plan-images]");
    if (toggle) {
      const row = app.els.drawerBody.querySelector(`[data-plan-images-row="${toggle.dataset.togglePlanImages}"]`);
      if (row) { row.hidden = !row.hidden; toggle.textContent = row.hidden ? toggle.textContent.replace("收起", "查看全部") : toggle.textContent.replace("查看全部", "收起"); }
      return;
    }
    const filter = event.target.closest("[data-result-filter]");
    if (filter && activeTask && app.els.drawerBody.querySelector(".pc-task-detail-content")) { resultFilter = filter.dataset.resultFilter; renderTaskDetail(); return; }
    const retry = event.target.closest("[data-result-retry]");
    if (retry && activeTask && app.els.drawerBody.querySelector(".pc-task-detail-content")) {
      const task = activeTask;
      const record = task ? ensureImageResults(task).find(item => item.id === retry.dataset.resultRetry) : null;
      const success = record ? retryRecord(record) : false;
      if (task) recalcTask(task);
      app.renderDistribution();
      renderTaskDetail();
      app.toast(success ? "该图片重试成功" : record?.reason || "未找到失败记录");
      return;
    }
    if (event.target.closest("[data-result-retry-all]") && activeTask && app.els.drawerBody.querySelector(".pc-task-detail-content")) dist.retryTaskFailures(activeTask);
  });

  app.data.images.forEach(image => {
    image.distributionHistory ||= [];
    image.distributionCount = image.distributionHistory.length;
    image.distributionHistory.forEach(item => {
      const planId = item.planId || String(item.plan || "").split(" ")[0];
      if (planId) seededSuccessfulImagePlans.add(`${image.id}|${planId}`);
    });
  });
  app.data.distributionTasks.forEach(ensureImageResults);
})();

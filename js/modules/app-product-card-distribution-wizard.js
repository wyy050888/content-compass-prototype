(function () {
  "use strict";
  const app = window.ProductCardApp;
  const dist = app?.distribution;
  if (!app || !dist) return;

  const planStatuses = [
    ["active", "投放中"], ["new_review", "新建审核中"], ["edit_review", "修改审核中"],
    ["rejected", "审核不通过"], ["paused", "已暂停"], ["deleted", "已删除"],
    ["completed", "已完成"], ["terminated", "已终止"], ["all", "全部（含已删除）"]
  ];
  const wizard = {
    step: 1, productId: "", selectedTaskIds: [], selectedImageIds: [], taskOrder: [], taskSearch: "", taskPage: 1,
    hideUploaded: true, taskRange: app.dateRange.preset(30), planRange: app.dateRange.preset(30),
    shopIds: [], shopSearch: "", planIds: [], planOrder: [], quantities: {}, planSearch: "", planStatus: "active",
    sourceTaskId: "", editingTaskId: ""
  };
  const taskPageSize = 8;

  function selectedImages() {
    return app.data.images.filter(image => wizard.selectedImageIds.includes(image.id)).sort((left, right) => {
      const taskGap = wizard.taskOrder.indexOf(left.taskId) - wizard.taskOrder.indexOf(right.taskId);
      return taskGap || left.ruleIndex - right.ruleIndex || left.order - right.order;
    });
  }
  function taskImages(taskId) {
    return app.data.images.filter(image => image.taskId === taskId && image.screenStatus === "selected");
  }
  function visibleTaskImages(taskId) {
    return taskImages(taskId).filter(image => !wizard.hideUploaded || Number(image.distributionCount || 0) === 0);
  }
  function eligibleTasks() {
    const keyword = wizard.taskSearch.trim().toLowerCase();
    return app.data.generationTasks.filter(task => {
      const images = taskImages(task.id);
      const product = app.product(task.productId);
      return images.length && app.dateRange.contains(task.createdAt, wizard.taskRange) && (!keyword || [task.id, task.name, product?.name].some(value => String(value || "").toLowerCase().includes(keyword)));
    });
  }
  function selectedPlans() {
    return wizard.planOrder.map(id => app.plan(id)).filter(Boolean);
  }
  function allocatedTotal() {
    return wizard.planIds.reduce((sum, id) => sum + Number(wizard.quantities[id] || 0), 0);
  }
  function rebalance() {
    const count = wizard.planOrder.length;
    if (!count) return;
    const total = wizard.selectedImageIds.length;
    const base = Math.floor(total / count);
    const remainder = total % count;
    wizard.planOrder.forEach((id, index) => { wizard.quantities[id] = base + (index < remainder ? 1 : 0); });
  }
  function resetWizard(productId, sourceTaskId) {
    const source = app.data.distributionTasks.find(item => item.id === sourceTaskId);
    Object.assign(wizard, {
      step: 1, productId: productId || source?.productId || "", selectedTaskIds: [], selectedImageIds: [], taskOrder: [],
      taskSearch: "", taskPage: 1, hideUploaded: true, taskRange: app.dateRange.preset(30), shopIds: [], shopSearch: "", planIds: [], planOrder: [], quantities: {},
      planSearch: "", planStatus: "active", planRange: app.dateRange.preset(30), sourceTaskId: sourceTaskId || "", editingTaskId: source?.status === "draft" ? source.id : ""
    });
    if (!source) return;
    if (source.draftState) {
      Object.assign(wizard, JSON.parse(JSON.stringify(source.draftState)), { sourceTaskId: source.id, editingTaskId: source.id });
      wizard.step = Math.min(3, Math.max(1, Number(wizard.step || 1)));
      wizard.hideUploaded = wizard.hideUploaded !== false;
      if (wizard.hideUploaded) wizard.selectedImageIds = wizard.selectedImageIds.filter(id => Number(app.data.images.find(image => image.id === id)?.distributionCount || 0) === 0);
      return;
    }
    const records = dist.ensureImageResults?.(source) || [];
    const sourceTasks = source.sourceTaskIds?.length ? source.sourceTaskIds : [...new Set(records.map(item => app.data.images.find(image => image.id === item.imageId)?.taskId).filter(Boolean))];
    wizard.selectedTaskIds = sourceTasks.slice();
    wizard.taskOrder = sourceTasks.slice();
    wizard.selectedImageIds = [...new Set(records.map(item => item.imageId).filter(id => id && app.data.images.some(image => image.id === id && image.screenStatus === "selected")))];
    if (!wizard.selectedImageIds.length) wizard.selectedImageIds = sourceTasks.flatMap(taskImages).slice(0, source.requested).map(image => image.id);
    if (wizard.hideUploaded) wizard.selectedImageIds = wizard.selectedImageIds.filter(id => Number(app.data.images.find(image => image.id === id)?.distributionCount || 0) === 0);
  }

  function steps() {
    return `<div class="pc-wizard-steps">${["选择任务与图片", "选择店铺与计划", "分发明细"].map((label, index) => `<div class="pc-wizard-step ${wizard.step > index + 1 ? "done" : ""} ${wizard.step === index + 1 ? "active" : ""}" data-step="${index + 1}">${label}</div>`).join("")}</div>`;
  }
  function footer() {
    return `${wizard.step > 1 ? `<button class="pc-btn" data-wizard-action="prev">上一步</button>` : ""}<button class="pc-btn pc-btn-quiet" data-wizard-action="save-draft">保存草稿</button><button class="pc-btn" data-pc-close-drawer>取消</button>${wizard.step < 3 ? `<button class="pc-btn pc-btn-primary" data-wizard-action="next">下一步</button>` : `<button class="pc-btn pc-btn-primary" data-wizard-action="submit">提交分发</button>`}`;
  }
  function imageCard(image) {
    const checked = wizard.selectedImageIds.includes(image.id);
    const sourceTask = app.data.generationTasks.find(task => task.id === image.taskId);
    const sourceRule = sourceTask?.rules?.[Math.max(0, Number(image.ruleIndex || 1) - 1)];
    const distributionCount = Number(image.distributionCount || 0);
    const visual = image.url ? `<img src="${app.escape(image.url)}" alt="${app.escape(image.fileName)}">` : `<span class="pc-distribution-placeholder tone-${(image.order || 0) % 6 + 1}" aria-hidden="true"></span>`;
    return `<label class="pc-wizard-image ${checked ? "selected" : ""}">
      <input type="checkbox" data-wizard-image="${image.id}" ${checked ? "checked" : ""}>
      <div class="pc-wizard-image-stage"><div class="pc-image-preview">${visual}</div><span class="pc-distribution-count-badge ${distributionCount ? "distributed" : ""}">累计 ${distributionCount} 次</span></div>
      <div class="pc-wizard-image-meta">
        <strong title="${app.escape(image.fileName)}">${app.escape(image.fileName)}</strong>
        <span class="pc-wizard-image-source"><i title="${app.escape(sourceTask?.name || image.taskId || "生成任务")}">${app.escape(sourceTask?.name || image.taskId || "生成任务")}</i><span class="pc-source-detail-trigger" tabindex="0" data-pc-tip="来源详情" data-pc-tip-kind="source-detail" data-source-task="${app.escape(`${sourceTask?.name || "生成任务"} · ${sourceTask?.id || image.taskId || "—"}`)}" data-source-prompt="${app.escape(sourceRule?.prompt || "未记录提示词")}" data-source-distribution-count="${distributionCount}">来源详情</span></span>
      </div>
    </label>`;
  }
  function stepOne() {
    const tasks = eligibleTasks();
    const pageCount = Math.max(1, Math.ceil(tasks.length / taskPageSize));
    wizard.taskPage = Math.min(wizard.taskPage, pageCount);
    const pageTasks = tasks.slice((wizard.taskPage - 1) * taskPageSize, wizard.taskPage * taskPageSize);
    const images = wizard.taskOrder.flatMap(visibleTaskImages);
    const productName = wizard.productId ? app.product(wizard.productId)?.name : "尚未锁定产品";
    return `<div class="pc-pick-layout">
      <section class="pc-task-picker"><header><div><h3>选择生成任务</h3><p>首个任务会锁定产品，避免图片与计划商品不一致</p></div><span>已选 ${wizard.selectedTaskIds.length}</span></header>
        <div class="pc-wizard-filter-row"><label class="pc-search pc-search-full"><span>⌕</span><input id="pcWizardTaskSearch" value="${app.escape(wizard.taskSearch)}" placeholder="搜索任务名称、任务ID或产品名称"></label>${app.dateRange.render("wizard-generation-task", wizard.taskRange, { label: "创建时间", compact: true })}</div>
        <div class="pc-task-picker-list">${pageTasks.length ? pageTasks.map(task => {
          const allCount = taskImages(task.id).length;
          const selectedCount = taskImages(task.id).filter(image => wizard.selectedImageIds.includes(image.id)).length;
          const disabled = Boolean(wizard.productId && task.productId !== wizard.productId);
          const checked = wizard.selectedTaskIds.includes(task.id);
          return `<label class="pc-task-pick ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}" title="${disabled ? "已选择其他产品的任务" : ""}"><input type="checkbox" data-wizard-task="${task.id}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}><span><b>${app.escape(task.name)}</b><small>${task.id} · ${app.escape(app.product(task.productId)?.name)}</small></span><em>已选 ${selectedCount} / 可选 ${allCount}</em></label>`;
        }).join("") : `<div class="pc-empty pc-empty-compact">没有符合条件的任务</div>`}</div>
        <div class="pc-mini-pagination"><button data-task-page="prev" ${wizard.taskPage === 1 ? "disabled" : ""}>上一页</button><span>${wizard.taskPage}/${pageCount}</span><button data-task-page="next" ${wizard.taskPage === pageCount ? "disabled" : ""}>下一页</button></div>
      </section>
      <section class="pc-selected-images"><header><div><h3>图片集合</h3><p>仅显示生成任务中标记为“选用”的图片</p></div><div><span class="pc-product-lock">${app.escape(productName)}</span><b>已选 ${wizard.selectedImageIds.length}/${images.length}</b></div></header>
        <div class="pc-image-bulk"><label class="pc-history-filter" title="勾选后仅显示从未分发过的图片"><input id="pcHideUploaded" type="checkbox" ${wizard.hideUploaded ? "checked" : ""}><span>隐藏已分发图片</span><small>仅保留分发次数为0</small></label><div><button data-image-bulk="all" ${images.length ? "" : "disabled"}>全选当前图片</button><button data-image-bulk="clear" ${wizard.selectedImageIds.length ? "" : "disabled"}>取消选择</button></div></div>
        <div class="pc-wizard-image-grid">${images.length ? images.map(imageCard).join("") : `<div class="pc-empty">请先在左侧勾选生成任务</div>`}</div>
      </section>
    </div>`;
  }

  function shopCell(shop) {
    return `<div class="pc-shop-cell"><span class="pc-shop-avatar">${app.escape(shop.name.slice(0, 1))}</span><span><b>${app.escape(shop.name)}</b><small>${shop.id}</small></span></div>`;
  }
  function accountCell(account) {
    return `<span class="pc-two-line"><b>${app.escape(account?.name || "—")}</b><small>${account?.id || "—"}</small></span>`;
  }
  function stepTwo() {
    const keyword = wizard.shopSearch.trim().toLowerCase();
    const shops = app.data.shops.filter(shop => {
      const account = app.account(shop.accountId);
      const available = account && account.authorizationStatus !== "disabled";
      return available && (!keyword || [shop.name, shop.id, account?.name, account?.id].some(value => String(value || "").toLowerCase().includes(keyword)));
    });
    const plans = candidatePlans();
    const assigned = allocatedTotal();
    return `<div class="pc-target-layout">
      <section class="pc-target-shops"><header><div><h3>店铺与默认广告账户</h3><p>选择后，右侧联动展示该商品的计划</p></div><b>已选 ${wizard.shopIds.length}</b></header>
        <label class="pc-search pc-search-full"><span>⌕</span><input id="pcWizardShopSearch" value="${app.escape(wizard.shopSearch)}" placeholder="搜索店铺或账户名称/ID"></label>
        <div class="pc-target-shop-list">${shops.length ? shops.map(shop => {
        const account = app.account(shop.accountId), selected = wizard.shopIds.includes(shop.id);
        return `<label class="pc-target-shop ${selected ? "selected" : ""}"><input type="checkbox" data-wizard-shop="${shop.id}" ${selected ? "checked" : ""}><div>${shopCell(shop)}<span class="pc-target-account"><small>默认广告账户</small>${accountCell(account)}</span></div></label>`;
      }).join("") : `<div class="pc-empty pc-empty-compact">没有符合条件的店铺</div>`}</div>
      </section>
      <section class="pc-target-plans"><header><div><h3>计划集合</h3><p>勾选计划后自动平分图片，也可直接填写分发素材数</p></div><strong class="${assigned === wizard.selectedImageIds.length ? "is-valid" : "is-invalid"}">已选 ${wizard.planIds.length} 个 · 图片 ${wizard.selectedImageIds.length} 张 · 已分配 ${assigned} 张</strong></header>
        <div class="pc-step-toolbar pc-plan-step-toolbar"><div><label class="pc-search"><span>⌕</span><input id="pcWizardPlanSearch" value="${app.escape(wizard.planSearch)}" placeholder="搜索计划名称或计划ID"></label>${app.dateRange.render("wizard-plan-data", wizard.planRange, { label: "千川数据时间", compact: true })}<span class="pc-sync-time">千川同步：09-02 11:20:06</span></div></div>
        ${planStatusFilters()}
        <div class="pc-plan-table-wrap"><table class="pc-wizard-table pc-plan-table"><thead><tr><th></th><th>计划</th><th>计划状态</th><th>整体消耗(元)</th><th>整体成交订单数</th><th>整体成交金额(元)</th><th>整体支付ROI</th><th>店铺</th><th>默认广告账户</th><th>当前素材数</th><th>分发素材数</th></tr></thead><tbody>${plans.length ? plans.map(plan => {
          const selected = wizard.planIds.includes(plan.id);
          const quantity = Number(wizard.quantities[plan.id] || 0);
          const capacityError = selected && plan.current + quantity > 500;
          const metric = dist.performanceForRange(plan, wizard.planRange);
          return `<tr class="${selected ? "selected" : ""} ${!plan.canUpload ? "disabled" : ""} ${capacityError ? "capacity-error" : ""}" title="${!plan.canUpload ? `该计划${dist.planStatusText(plan.status)}，当前不可分发` : ""}"><td><input type="checkbox" data-wizard-plan="${plan.id}" ${selected ? "checked" : ""} ${plan.canUpload ? "" : "disabled"}></td><td><span class="pc-two-line"><b>${app.escape(plan.name)}</b><small>${plan.id}</small></span></td><td>${dist.planStatusTag(plan.status)}</td><td>${dist.formatNumber(metric.spend)}</td><td>${dist.formatNumber(metric.orders)}</td><td>${dist.formatNumber(metric.gmv)}</td><td>${metric.roi.toFixed(2)}</td><td>${shopCell(app.shop(plan.shopId))}</td><td>${accountCell(app.account(plan.accountId))}</td><td>${plan.current}</td><td><input class="pc-allocation-input ${capacityError ? "error" : ""}" type="number" min="0" max="200" data-wizard-qty="${plan.id}" value="${selected ? quantity : 0}" title="填写大于0的数量会自动选中计划" ${plan.canUpload ? "" : "disabled"}>${capacityError ? `<small class="pc-field-error">分发后 ${plan.current + quantity}，超过500</small>` : ""}</td></tr>`;
        }).join("") : `<tr><td colspan="11" class="pc-empty">${wizard.shopIds.length ? "没有符合条件的计划" : "请先在左侧选择店铺"}</td></tr>`}</tbody></table></div>
      </section>
    </div>`;
  }

  function planStatusFilters() {
    const visiblePlanIds = candidatePlans().filter(plan => plan.canUpload && plan.current < 500).map(plan => plan.id);
    const selectedVisibleCount = visiblePlanIds.filter(id => wizard.planIds.includes(id)).length;
    return `<div class="pc-plan-filter-bar">
      <div class="pc-status-filters pc-plan-filter-list">${planStatuses.map(([value, label]) => `<button class="${wizard.planStatus === value ? "active" : ""}" data-wizard-plan-status="${value}">${label}</button>`).join("")}</div>
      <div class="pc-plan-bulk"><button data-plan-bulk="all" ${visiblePlanIds.length && wizard.selectedImageIds.length ? "" : "disabled"}>全选当前计划</button><button data-plan-bulk="clear" ${selectedVisibleCount ? "" : "disabled"}>取消选择</button></div>
    </div>`;
  }
  function candidatePlans() {
    const accountIds = wizard.shopIds.map(id => app.shop(id)?.accountId).filter(id => app.account(id)?.authorizationStatus !== "disabled");
    const keyword = wizard.planSearch.trim().toLowerCase();
    return app.data.plans.filter(plan => accountIds.includes(plan.accountId) && plan.productId === wizard.productId && (wizard.planStatus === "all" || plan.status === wizard.planStatus) && (!keyword || [plan.id, plan.name].some(value => value.toLowerCase().includes(keyword))));
  }
  function allocationPreview() {
    const images = selectedImages();
    let cursor = 0;
    return selectedPlans().map(plan => {
      const quantity = Number(wizard.quantities[plan.id] || 0);
      const allocated = images.slice(cursor, cursor + quantity); cursor += quantity;
      return { plan, quantity, images: allocated };
    });
  }
  function stepThree() {
    const allocations = allocationPreview();
    const details = allocations.map(item => ({
      plan: item.plan,
      images: item.images.map(image => ({ id: image.id, imageId: image.id, fileName: image.fileName, order: image.order, ruleIndex: image.ruleIndex, planId: item.plan.id, status: "pending", reason: "待分发" }))
    }));
    return `<div class="pc-review-summary"><div><span>生成任务</span><b>${wizard.selectedTaskIds.length} 个</b></div><div><span>分发图片</span><b>${wizard.selectedImageIds.length} 张</b></div><div><span>店铺/账户</span><b>${wizard.shopIds.length} 个</b></div><div><span>目标计划</span><b>${wizard.planIds.length} 个</b></div></div>
      <section class="pc-review-section"><header><div class="pc-review-title"><h3>分发明细</h3><span>提交时校验500张上限，单计划失败不影响其他计划</span></div><span>按计划勾选顺序依次分配；点击“查看全部”核对图片</span></header>${dist.renderDistributionTable(details, { context: "wizard-preview", preview: true, showStatus: false })}</section>`;
  }
  function renderWizard() {
    app.els.drawerBody.innerHTML = `${steps()}${wizard.step === 1 ? stepOne() : wizard.step === 2 ? stepTwo() : stepThree()}`;
    app.els.drawerFoot.innerHTML = footer();
  }
  app.openDistributionWizard = (productId, sourceTaskId) => {
    resetWizard(productId, sourceTaskId);
    const source = app.data.distributionTasks.find(item => item.id === sourceTaskId);
    const title = source?.status === "draft" ? "继续编辑分发任务" : "新建分发任务";
    app.openDrawer({ mode: "edit", className: "pc-distribution-drawer", eyebrow: "图片分发", title, subtitle: "按任务选择、规则和生成顺序分配图片", body: "", footer: "" });
    renderWizard();
  };

  function validateTargets() {
    if (!wizard.shopIds.length) return "请至少选择1个店铺";
    const disabledShop = wizard.shopIds.map(id => app.shop(id)).find(shop => !app.account(shop?.accountId) || app.account(shop.accountId)?.authorizationStatus === "disabled");
    if (disabledShop) return `${disabledShop.name}的默认广告账户已停用，请重新选择店铺`;
    if (!wizard.planIds.length) return "请至少选择1个可分发计划";
    if (wizard.planIds.length > wizard.selectedImageIds.length) return `计划数不能超过已选图片数 ${wizard.selectedImageIds.length}`;
    if (wizard.planIds.some(id => Number(wizard.quantities[id] || 0) < 1)) return "每个已选计划至少分配1张图片";
    const assigned = allocatedTotal();
    if (assigned !== wizard.selectedImageIds.length) return `分配素材数共 ${assigned} 张，必须与已选图片 ${wizard.selectedImageIds.length} 张相等`;
    const unavailable = selectedPlans().find(plan => !plan.canUpload);
    if (unavailable) return `${unavailable.name}当前${dist.planStatusText(unavailable.status)}，不可分发`;
    const over = selectedPlans().find(plan => plan.current + Number(wizard.quantities[plan.id] || 0) > 500);
    if (over) return `${over.name}分发后将超过500张，请调整分配数量`;
    return "";
  }
  function validateStep() {
    if (wizard.step === 1) {
      if (!wizard.selectedTaskIds.length) return "请至少选择1个生成任务";
      if (!wizard.selectedImageIds.length) return "请至少选择1张选用图片";
    }
    if (wizard.step === 2) return validateTargets();
    return "";
  }
  function formatNow() {
    const date = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  function saveDraft() {
    if (!wizard.selectedTaskIds.length || !wizard.productId) { app.toast("至少选择1个生成任务后才能保存草稿"); return; }
    const existing = app.data.distributionTasks.find(item => item.id === wizard.editingTaskId);
    const task = existing || { id: `DT-0902-${String(app.data.distributionTasks.length + 19).padStart(3, "0")}`, createdAt: formatNow() };
    const draftState = JSON.parse(JSON.stringify({
      step: wizard.step, productId: wizard.productId, selectedTaskIds: wizard.selectedTaskIds, selectedImageIds: wizard.selectedImageIds,
      taskOrder: wizard.taskOrder, taskSearch: wizard.taskSearch, taskPage: wizard.taskPage, hideUploaded: wizard.hideUploaded, shopIds: wizard.shopIds,
      shopSearch: wizard.shopSearch, planIds: wizard.planIds, planOrder: wizard.planOrder, quantities: wizard.quantities,
      planSearch: wizard.planSearch, planStatus: wizard.planStatus, taskRange: wizard.taskRange, planRange: wizard.planRange
    }));
    Object.assign(task, { name: `${app.product(wizard.productId)?.name}分发草稿`, productId: wizard.productId, creator: dist.currentUser, team: dist.currentTeam, sourceTaskIds: wizard.taskOrder.slice(), plans: wizard.planOrder.slice(), requested: wizard.selectedImageIds.length, success: 0, failed: 0, status: "draft", results: [], draftState });
    delete task.imageResults;
    if (!existing) app.data.distributionTasks.unshift(task);
    app.state.drawerDirty = false; app.forceCloseDrawer(); app.renderDistribution(); app.toast("分发草稿已保存");
  }
  async function submit() {
    const error = validateTargets(); if (error) { app.toast(error); return; }
    const ok = await app.confirm("确认提交分发？", `将向 ${wizard.planIds.length} 个计划分发 ${wizard.selectedImageIds.length} 张图片。`, "开始分发");
    if (!ok) return;
    const imageResults = [], results = [];
    allocationPreview().forEach(({ plan, quantity, images }) => {
      const canUpload = plan.canUpload && plan.current + quantity <= 500;
      images.forEach(image => {
        const status = canUpload ? "success" : "failed";
        const reason = canUpload ? "分发成功" : !plan.canUpload ? `计划${dist.planStatusText(plan.status)}，不可分发` : `当前 ${plan.current} 张，新增 ${quantity} 张后超过500`;
        const record = { id: `RESULT-${Date.now()}-${imageResults.length}`, imageId: image.id, fileName: image.fileName, order: image.order, ruleIndex: image.ruleIndex, planId: plan.id, status, retries: 0, reason };
        imageResults.push(record);
        if (canUpload) dist.registerSuccessfulDistribution?.(record);
      });
      const success = canUpload ? images.length : 0;
      const failed = images.length - success;
      if (success) {
        plan.current += success; plan.distributed += success; plan.today += success; plan.updatedAt = formatNow();
        const account = app.account(plan.accountId); account.today += success; account.total += success; account.updatedAt = formatNow();
      } else {
        plan.failed += failed;
        const account = app.account(plan.accountId); account.failed += failed;
      }
      results.push({ planId: plan.id, success, failed, reason: canUpload ? "分发完成" : imageResults.at(-1)?.reason });
    });
    const success = imageResults.filter(item => item.status === "success").length;
    const failed = imageResults.length - success;
    const existing = app.data.distributionTasks.find(item => item.id === wizard.editingTaskId);
    const task = existing || { id: `DT-0902-${String(app.data.distributionTasks.length + 19).padStart(3, "0")}` };
    Object.assign(task, { name: `${app.product(wizard.productId)?.name}图片分发`, productId: wizard.productId, creator: dist.currentUser, team: dist.currentTeam, sourceTaskIds: wizard.taskOrder.slice(), plans: wizard.planOrder.slice(), requested: imageResults.length, success, failed, status: failed ? (success ? "partial" : "failed") : "success", createdAt: formatNow(), results, imageResults });
    delete task.draftState;
    if (!existing) app.data.distributionTasks.unshift(task);
    app.state.drawerDirty = false;
    app.renderDistribution();
    dist.openTaskDetail?.(task);
    app.toast(`分发完成：成功 ${success} 张，失败 ${failed} 张`);
  }

  app.els.drawerBody.addEventListener("click", event => {
    if (app.dateRange.handle(event, "wizard-generation-task", wizard.taskRange) || app.dateRange.handle(event, "wizard-plan-data", wizard.planRange)) { wizard.taskPage = 1; renderWizard(); return; }
    const page = event.target.closest("[data-task-page]");
    if (page && !page.disabled) { wizard.taskPage += page.dataset.taskPage === "next" ? 1 : -1; renderWizard(); return; }
    const bulk = event.target.closest("[data-image-bulk]");
    if (bulk) {
      const ids = wizard.taskOrder.flatMap(visibleTaskImages).map(image => image.id);
      wizard.selectedImageIds = bulk.dataset.imageBulk === "all" ? [...new Set(ids)] : [];
      app.markDrawerDirty(); renderWizard(); return;
    }
    const planBulk = event.target.closest("[data-plan-bulk]");
    if (planBulk) {
      const visibleIds = candidatePlans().filter(plan => plan.canUpload && plan.current < 500).map(plan => plan.id);
      const visibleSet = new Set(visibleIds);
      const outsideOrder = wizard.planOrder.filter(id => !visibleSet.has(id));
      visibleIds.forEach(id => { delete wizard.quantities[id]; });
      if (planBulk.dataset.planBulk === "all") {
        const availableSlots = Math.max(0, wizard.selectedImageIds.length - outsideOrder.length);
        const selectedVisibleIds = visibleIds.slice(0, availableSlots);
        wizard.planOrder = [...outsideOrder, ...selectedVisibleIds];
        wizard.planIds = wizard.planOrder.slice();
        if (selectedVisibleIds.length < visibleIds.length) app.toast(`已按当前列表顺序选择前 ${selectedVisibleIds.length} 个计划；每个计划至少需要1张图片`);
      } else {
        wizard.planOrder = outsideOrder;
        wizard.planIds = outsideOrder.slice();
      }
      rebalance(); app.markDrawerDirty(); renderWizard(); return;
    }
    const planStatus = event.target.closest("[data-wizard-plan-status]");
    if (planStatus) { wizard.planStatus = planStatus.dataset.wizardPlanStatus; renderWizard(); }
  });
  app.els.drawerFoot.addEventListener("click", event => {
    const action = event.target.closest("[data-wizard-action]")?.dataset.wizardAction;
    if (!action) return;
    if (action === "prev") { wizard.step -= 1; renderWizard(); return; }
    if (action === "save-draft") { saveDraft(); return; }
    if (action === "next") {
      const error = validateStep(); if (error) { app.toast(error); return; }
      wizard.step += 1; renderWizard(); return;
    }
    if (action === "submit") submit();
  });
  app.els.drawerBody.addEventListener("change", event => {
    if (app.dateRange.handle(event, "wizard-generation-task", wizard.taskRange) || app.dateRange.handle(event, "wizard-plan-data", wizard.planRange)) { wizard.taskPage = 1; renderWizard(); return; }
    if (event.target.matches("[data-wizard-task]")) {
      const task = app.data.generationTasks.find(item => item.id === event.target.dataset.wizardTask);
      if (!task) return;
      if (event.target.checked) {
        if (!wizard.productId) { wizard.productId = task.productId; wizard.planIds = []; wizard.planOrder = []; wizard.quantities = {}; }
        wizard.selectedTaskIds = [...new Set([...wizard.selectedTaskIds, task.id])]; wizard.taskOrder = [...new Set([...wizard.taskOrder, task.id])];
      } else {
        wizard.selectedTaskIds = wizard.selectedTaskIds.filter(id => id !== task.id);
        wizard.taskOrder = wizard.taskOrder.filter(id => id !== task.id);
        const ids = taskImages(task.id).map(image => image.id);
        wizard.selectedImageIds = wizard.selectedImageIds.filter(id => !ids.includes(id));
        if (!wizard.selectedTaskIds.length) wizard.productId = "";
      }
      app.markDrawerDirty(); renderWizard(); return;
    }
    if (event.target.matches("[data-wizard-image]")) {
      const id = event.target.dataset.wizardImage;
      wizard.selectedImageIds = event.target.checked ? [...new Set([...wizard.selectedImageIds, id])] : wizard.selectedImageIds.filter(item => item !== id);
      app.markDrawerDirty(); renderWizard(); return;
    }
    if (event.target.matches("#pcHideUploaded")) {
      wizard.hideUploaded = event.target.checked;
      if (wizard.hideUploaded) {
        const previous = wizard.selectedImageIds.length;
        wizard.selectedImageIds = wizard.selectedImageIds.filter(id => Number(app.data.images.find(image => image.id === id)?.distributionCount || 0) === 0);
        const removed = previous - wizard.selectedImageIds.length;
        if (removed) app.toast(`已取消选择 ${removed} 张有分发记录的图片`);
      }
      app.markDrawerDirty(); renderWizard(); return;
    }
    if (event.target.matches("[data-wizard-shop]")) {
      const id = event.target.dataset.wizardShop;
      wizard.shopIds = event.target.checked ? [...new Set([...wizard.shopIds, id])] : wizard.shopIds.filter(item => item !== id);
      wizard.planIds = wizard.planIds.filter(planId => wizard.shopIds.includes(app.plan(planId)?.shopId));
      wizard.planOrder = wizard.planOrder.filter(planId => wizard.planIds.includes(planId));
      rebalance();
      app.markDrawerDirty(); renderWizard(); return;
    }
    if (event.target.matches("[data-wizard-plan]")) {
      const id = event.target.dataset.wizardPlan;
      if (event.target.checked && wizard.planIds.length >= wizard.selectedImageIds.length) { event.target.checked = false; app.toast(`最多选择 ${wizard.selectedImageIds.length} 个计划，确保每个计划至少分配1张`); return; }
      if (event.target.checked) { wizard.planIds = [...new Set([...wizard.planIds, id])]; wizard.planOrder = [...new Set([...wizard.planOrder, id])]; }
      else { wizard.planIds = wizard.planIds.filter(item => item !== id); wizard.planOrder = wizard.planOrder.filter(item => item !== id); delete wizard.quantities[id]; }
      rebalance(); app.markDrawerDirty(); renderWizard(); return;
    }
    if (event.target.matches("[data-wizard-qty]")) {
      const id = event.target.dataset.wizardQty;
      const quantity = Math.max(0, Math.min(200, Number(event.target.value || 0)));
      if (quantity > 0) {
        if (!wizard.planIds.includes(id)) {
          wizard.planIds.push(id);
          wizard.planOrder.push(id);
        }
        wizard.quantities[id] = quantity;
      } else {
        wizard.planIds = wizard.planIds.filter(item => item !== id);
        wizard.planOrder = wizard.planOrder.filter(item => item !== id);
        delete wizard.quantities[id];
      }
      app.markDrawerDirty(); renderWizard();
    }
  });
  app.els.drawerBody.addEventListener("input", event => {
    const fields = { pcWizardTaskSearch: "taskSearch", pcWizardShopSearch: "shopSearch", pcWizardPlanSearch: "planSearch" };
    const field = fields[event.target.id]; if (!field) return;
    wizard[field] = event.target.value; if (field === "taskSearch") wizard.taskPage = 1;
    renderWizard();
    requestAnimationFrame(() => { const input = app.els.drawerBody.querySelector(`#${event.target.id}`); input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); });
  });
})();

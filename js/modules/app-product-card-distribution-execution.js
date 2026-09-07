(function () {
  "use strict";
  const app = window.ProductCardApp, dist = app?.distribution;
  if (!dist) return;
  // Pure local simulator. Production must replace this worker with a provider adapter.
  dist.validateExecution = (record, task) => {
    const plan = app.plan(record.planId), account = app.account(record.accountId || plan?.accountId);
    const authShop = window.AccountConfigSeed?.shops.find(shop => shop.id === (record.shopId || plan?.shopId));
    if (!plan || !account || account.authorizationStatus === "disabled") return "目标计划或广告账户已失效";
    if (authShop && (authShop.authorization.qianchuan !== "authorized" || authShop.expiresIn <= 0)) return "店铺千川授权已失效，请在授权配置恢复后重试";
    if (!plan.canUpload) return "当前计划状态不允许分发";
    if (plan.current >= 500) return "计划素材数达到500张上限";
    const image = app.data.images.find(item => item.id === record.imageId);
    if (!image || image.unavailable) return "图片文件已失效";
    if (image.productId !== task?.productId || plan.productId !== task?.productId) return "图片与目标计划的产品不一致";
    return "";
  };
  dist.startExecution = task => {
    task.simulatedExecution = true;
    task.status = "pending";
    task.submittedAt ||= app.now();
  };
  dist.resumeExecution = task => {
    if (task.status !== "interrupted") return;
    const record = task.imageResults.find(item => item.status === "pending");
    const error = record && dist.validateExecution(record, task);
    if (error) return app.toast(error);
    dist.startExecution(task); app.renderDistribution(); dist.refreshTaskDetail();
  };
  dist.confirmUnknown = task => {
    // Query only: no new attempt, count or cost. Demo receipt can resolve the original request.
    task.imageResults.filter(record => record.status === "confirming").forEach(record => {
      if (!record.providerReceipt) return;
      record.status = record.providerReceipt.status;
      record.completedAt = record.providerReceipt.completedAt;
      record.reason = "原请求查询结果（原型模拟）";
      if (record.status === "success" && dist.registerSuccessfulDistribution(record, task)) {
        const plan = app.plan(record.planId), account = app.account(plan.accountId);
        plan.current += 1; plan.distributed += 1; plan.today += 1; account.today += 1; account.total += 1;
      }
    });
    dist.recalcTask(task);
    app.renderDistribution(); dist.refreshTaskDetail();
    app.toast(task.status === "confirming" ? "原请求结果仍未知，未再次分发" : "已确认原请求结果");
  };
  window.setInterval(() => {
    const task = app.data.distributionTasks.find(item => item.simulatedExecution && ["pending", "uploading"].includes(item.status));
    if (!task) return;
    task.status = "uploading";
    const record = task.imageResults.find(item => item.status === "pending");
    if (record) {
      const error = dist.validateExecution(record, task);
      if (error && /授权|账户已失效/.test(error)) {
        task.status = "interrupted"; record.reason = error;
        app.renderDistribution(); dist.refreshTaskDetail(); app.toast(error + "，任务已中断");
        return;
      }
      record.status = error ? "failed" : "success"; record.reason = error || "分发成功（原型模拟）"; record.completedAt = app.now();
      if (!error && dist.registerSuccessfulDistribution(record, task)) {
        const plan = app.plan(record.planId), account = app.account(plan.accountId);
        plan.current += 1; plan.distributed += 1; plan.today += 1;
        account.today += 1; account.total += 1;
      }
    }
    dist.recalcTask(task);
    app.renderDistribution(); dist.refreshTaskDetail(); dist.refreshImageGallery?.();
  }, 800);
})();

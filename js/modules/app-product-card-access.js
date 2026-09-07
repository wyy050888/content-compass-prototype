(function () {
  "use strict";
  const app = window.ProductCardApp;
  const permissions = window.ContentCompassPermissions;
  if (!app || !permissions) return;
  const base = "promotion.productCard.";
  const scopes = ["all", "personal", "team"];
  app.currentIdentity = { name: "周宁", team: "抖音三区" }; // Existing prototype task identity.
  app.hasPromotionPermission = id => permissions.ids().has(id);
  const has = app.hasPromotionPermission;
  const availableScopes = kind => scopes.filter(scope => has(base + kind + ".task." + scope));
  app.canViewTask = (task, kind = "generate", scope) => {
    const allowed = availableScopes(kind);
    const selected = scope ? allowed.filter(value => value === scope) : allowed;
    return selected.some(value => value === "all" || (value === "personal" ? task.creator === app.currentIdentity.name : task.team === app.currentIdentity.team));
  };
  function visibility(selector, allowed) {
    document.querySelectorAll(selector).forEach(node => { node.dataset.permissionHidden = String(!allowed(node)); });
  }
  function sync() {
    const gs = availableScopes("generate"), ds = availableScopes("distribute");
    visibility("[data-pc-nav]", node => has(base + (node.dataset.pcNav === "generation" ? "generate" : "distribute")));
    visibility('.nav-item[data-page="account-config"]', () => has("promotion.authorization"));
    visibility("[data-generation-view]", node => node.dataset.generationView === "task" ? gs.length : has(base + "generate.product"));
    visibility("#pcGenerationScope [data-scope]", node => gs.includes(node.dataset.scope));
    visibility("#pcDistributionView [data-view]", node => node.dataset.view === "task" ? ds.length : has(base + "distribute." + node.dataset.view));
    visibility("[data-dist-scope]", node => ds.includes(node.dataset.distScope));
    visibility("[data-ac-view]", node => has("promotion.authorization." + node.dataset.acView));
    if (!gs.includes(app.state.generationScope)) app.state.generationScope = gs[0] || "";
    if (!ds.includes(app.distribution.filters.taskScope)) app.distribution.filters.taskScope = ds[0] || "";
    document.querySelectorAll("#pcGenerationScope [data-scope]").forEach(node => node.classList.toggle("active", node.dataset.scope === app.state.generationScope));
    if (app.state.generationView === "task" && !gs.length && has(base + "generate.product")) app.setGenerationView("product");
    if (app.state.generationView === "product" && !has(base + "generate.product")) app.setGenerationView("task");
    const dv = ["task", "account", "plan"].filter(view => view === "task" ? ds.length : has(base + "distribute." + view));
    if (!dv.includes(app.state.distributionView)) app.state.distributionView = dv[0] || "task";
    document.querySelectorAll("#pcDistributionView [data-view]").forEach(node => node.classList.toggle("active", node.dataset.view === app.state.distributionView));
    app.els.primary.disabled = app.state.section === "generation" ? !gs.length : !ds.length || !gs.length;
    if (app.state.section === "generation") app.renderGeneration();
    else app.renderDistribution();
  }
  const originalSection = app.setSection;
  app.setSection = section => {
    if (!has(base + (section === "generation" ? "generate" : "distribute"))) return app.toast("没有该菜单权限");
    originalSection(section); sync();
  };
  ["openGenerationStrategy", "openGenerationScreening", "openRepeatedGeneration"].forEach(name => {
    const original = app[name];
    app[name] = task => app.canViewTask(task, "generate") ? original(task) : app.toast("没有该任务的数据访问权限");
  });
  const newGeneration = app.openNewGeneration, newDistribution = app.openDistributionWizard;
  app.openNewGeneration = productId => availableScopes("generate").length ? newGeneration(productId) : app.toast("请先配置任务范围Tab权限");
  app.openDistributionWizard = (...args) => availableScopes("distribute").length && availableScopes("generate").length ? newDistribution(...args) : app.toast("请先配置生图和分发任务范围Tab权限");
  document.addEventListener("click", event => {
    const hidden = event.target.closest('[data-permission-hidden="true"]');
    if (hidden) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  window.addEventListener("promotion-permissions-change", event => {
    app.forceCloseDrawer();
    document.querySelector(".pc-access-preview")?.remove();
    if (event.detail.name) {
      const bar = document.createElement("div"); bar.className = "pc-access-preview";
      bar.innerHTML = "推广权限预览：" + app.escape(event.detail.name) + " · 示例用户：周宁／抖音三区 <button type='button'>退出预览</button>";
      (document.querySelector(".main") || document.body).prepend(bar);
      bar.querySelector("button").onclick = () => permissions.preview();
    }
    sync();
    document.querySelector('[data-page="creation"]')?.click();
  });
  sync();
})();

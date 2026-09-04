(function () {
  "use strict";
  const root = document.getElementById("page-product-card");
  const seed = window.ProductCardSeed;
  if (!root || !seed) return;

  const clone = value => JSON.parse(JSON.stringify(value));
  const app = {
    root,
    data: clone(seed),
    state: {
      section: "generation",
      generationView: "task",
      generationScope: "all",
      distributionView: "task",
      drawerDirty: false,
      drawerMode: "",
      confirmResolve: null
    },
    els: {
      title: root.querySelector("#pcPageTitle"),
      subtitle: root.querySelector("#pcPageSubtitle"),
      primary: root.querySelector("#pcPrimaryAction"),
      drawerLayer: root.querySelector("#pcDrawerLayer"),
      drawer: root.querySelector(".pc-drawer"),
      drawerEyebrow: root.querySelector("#pcDrawerEyebrow"),
      drawerTitle: root.querySelector("#pcDrawerTitle"),
      drawerSubtitle: root.querySelector("#pcDrawerSubtitle"),
      drawerBody: root.querySelector("#pcDrawerBody"),
      drawerFoot: root.querySelector("#pcDrawerFoot"),
      confirmLayer: root.querySelector("#pcConfirmLayer"),
      confirmTitle: root.querySelector("#pcConfirmTitle"),
      confirmMessage: root.querySelector("#pcConfirmMessage")
    },
    status: {
      draft: "草稿", pending: "待生成", running: "生成中", success: "生成成功",
      partial: "部分成功", failed: "生成失败", cancelled: "已取消",
      active: "投放中", paused: "已暂停", review: "审核中",
      selected: "选用", rejected: "不选用"
    }
  };
  const tipPopover = document.createElement("div");
  tipPopover.className = "pc-tip-popover";
  tipPopover.setAttribute("role", "tooltip");
  root.appendChild(tipPopover);
  let tipHideTimer = 0;
  const productToast = document.createElement("div");
  productToast.className = "pc-toast";
  productToast.setAttribute("role", "status");
  productToast.setAttribute("aria-live", "polite");
  root.appendChild(productToast);
  let productToastTimer = 0;

  app.escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  app.product = id => app.data.products.find(item => item.id === id);
  app.shop = id => app.data.shops.find(item => item.id === id);
  app.account = id => app.data.accounts.find(item => item.id === id);
  app.plan = id => app.data.plans.find(item => item.id === id);
  app.tip = (text, label = "字段释义") => `<button class="pc-tip" type="button" aria-label="${app.escape(label)}" data-pc-tip="${app.escape(text)}">?</button>`;
  app.statusTag = status => `<span class="pc-status ${status}">${app.status[status] || status}</span>`;
  app.metric = (label, value, note = "") => `<div class="pc-metric"><div><span>${label}</span><strong>${value}</strong></div>${note ? `<em>${note}</em>` : ""}</div>`;
  app.toast = message => {
    window.clearTimeout(productToastTimer);
    productToast.textContent = message;
    productToast.classList.add("show");
    productToastTimer = window.setTimeout(() => productToast.classList.remove("show"), 2400);
  };
  app.formatProgress = task => {
    const completed = Math.min(task.target, task.success + task.failed);
    const percent = task.target ? Math.round(completed / task.target * 100) : 0;
    return `<div class="pc-progress"><div><i style="width:${percent}%"></i></div><span>${completed}/${task.target}（成功 ${task.success}，失败 ${task.failed}）</span></div>`;
  };

  function showTip(button) {
    window.clearTimeout(tipHideTimer);
    const sourceDetail = button.dataset.pcTipKind === "source-detail";
    tipPopover.classList.toggle("source-detail", sourceDetail);
    if (sourceDetail) {
      tipPopover.innerHTML = `<dl><div><dt>来源任务</dt><dd>${app.escape(button.dataset.sourceTask || "—")}</dd></div><div><dt>提示词</dt><dd>${app.escape(button.dataset.sourcePrompt || "未记录提示词")}</dd></div><div><dt>历史分发次数</dt><dd>${app.escape(button.dataset.sourceDistributionCount || "0")} 次</dd></div></dl>`;
    } else {
      tipPopover.textContent = button.dataset.pcTip || "";
    }
    tipPopover.classList.add("show");
    const anchor = button.getBoundingClientRect();
    const box = tipPopover.getBoundingClientRect();
    const left = Math.max(10, Math.min(anchor.left + anchor.width / 2 - box.width / 2, window.innerWidth - box.width - 10));
    const below = anchor.bottom + 8;
    const top = below + box.height <= window.innerHeight - 10 ? below : Math.max(10, anchor.top - box.height - 8);
    tipPopover.style.left = `${left}px`;
    tipPopover.style.top = `${top}px`;
  }
  function hideTip() {
    window.clearTimeout(tipHideTimer);
    tipPopover.classList.remove("show", "source-detail");
  }
  function scheduleHideTip() {
    window.clearTimeout(tipHideTimer);
    tipHideTimer = window.setTimeout(hideTip, 140);
  }

  app.openDrawer = options => {
    app.closeGenerationScreenViewer?.();
    app.closeDistributionImageViewer?.();
    app.state.drawerDirty = false;
    app.state.drawerMode = options.mode || "view";
    app.els.drawer.classList.toggle("pc-distribution-drawer", options.className === "pc-distribution-drawer");
    app.els.drawerBody.className = `pc-drawer-body ${options.bodyClass || ""}`.trim();
    app.els.drawerEyebrow.textContent = options.eyebrow || "";
    app.els.drawerTitle.textContent = options.title || "";
    app.els.drawerSubtitle.textContent = options.subtitle || "";
    app.els.drawerBody.innerHTML = options.body || "";
    app.els.drawerFoot.innerHTML = options.footer || "";
    app.els.drawerLayer.classList.add("show");
    app.els.drawerLayer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => app.els.drawer.querySelector("button,input,select,textarea")?.focus());
  };

  app.markDrawerDirty = () => { if (app.state.drawerMode === "edit") app.state.drawerDirty = true; };
  app.forceCloseDrawer = () => {
    hideTip();
    app.closeGenerationScreenViewer?.();
    app.closeDistributionImageViewer?.();
    app.hideStrategyImagePreview?.();
    app.els.drawerLayer.classList.remove("show");
    app.els.drawerLayer.setAttribute("aria-hidden", "true");
    app.els.drawer.classList.remove("pc-distribution-drawer");
    app.state.drawerDirty = false;
    app.state.drawerMode = "";
    document.body.style.overflow = "";
  };
  app.requestCloseDrawer = async () => {
    if (app.state.drawerDirty) {
      const discard = await app.confirm("放弃未保存修改？", "当前抽屉中的修改尚未保存，关闭后将丢失。", "放弃修改");
      if (!discard) return;
    }
    app.forceCloseDrawer();
  };

  app.confirm = (title, message, okText = "确认") => new Promise(resolve => {
    if (app.state.confirmResolve) app.state.confirmResolve(false);
    app.state.confirmResolve = resolve;
    app.els.confirmTitle.textContent = title;
    app.els.confirmMessage.textContent = message;
    app.els.confirmLayer.querySelector('[data-pc-confirm="ok"]').textContent = okText;
    app.els.confirmLayer.classList.add("show");
    app.els.confirmLayer.setAttribute("aria-hidden", "false");
  });
  app.resolveConfirm = value => {
    if (!app.state.confirmResolve) return;
    const resolve = app.state.confirmResolve;
    app.state.confirmResolve = null;
    app.els.confirmLayer.classList.remove("show");
    app.els.confirmLayer.setAttribute("aria-hidden", "true");
    resolve(value);
  };

  app.setSection = section => {
    if (!['generation', 'distribution'].includes(section)) return;
    app.state.section = section;
    root.querySelectorAll("[data-pc-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.pcPanel === section));
    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
      button.classList.toggle("active", button.dataset.page === "product-card" && button.dataset.pcNav === section);
    });
    if (section === "generation") {
      app.state.generationView = "task";
      app.state.generationScope = "all";
      root.querySelectorAll("#pcGenerationScope [data-scope]").forEach(button => button.classList.toggle("active", button.dataset.scope === "all"));
      app.els.title.textContent = "图片生成";
      app.els.subtitle.textContent = "生成并管理商品卡图片";
      app.els.primary.textContent = "新建生图任务";
      app.setGenerationView?.("task");
      app.renderGeneration?.();
    } else {
      app.state.distributionView = "task";
      if (app.distribution) {
        app.distribution.filters.taskScope = "all";
        app.distribution.page = 1;
      }
      root.querySelectorAll("#pcDistributionView [data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === "task"));
      app.els.title.textContent = "任务视图";
      app.els.subtitle.textContent = "将已选用图片分发至商品卡计划";
      app.els.primary.textContent = "新建分发任务";
      app.renderDistribution?.();
    }
  };

  document.querySelectorAll('[data-page="product-card"][data-pc-nav]').forEach(button => button.addEventListener("click", () => app.setSection(button.dataset.pcNav)));
  app.els.primary.addEventListener("click", () => app.state.section === "generation" ? app.openNewGeneration?.() : app.openDistributionWizard?.());
  root.addEventListener("click", event => {
    if (event.target.closest("[data-pc-close-drawer]")) app.requestCloseDrawer();
  });
  root.addEventListener("pointerover", event => { const button = event.target.closest("[data-pc-tip]"); if (button && !button.contains(event.relatedTarget)) showTip(button); });
  root.addEventListener("pointerout", event => { const button = event.target.closest("[data-pc-tip]"); if (button && !button.contains(event.relatedTarget)) scheduleHideTip(); });
  root.addEventListener("focusin", event => { const button = event.target.closest("[data-pc-tip]"); if (button) showTip(button); });
  root.addEventListener("focusout", event => { if (event.target.closest("[data-pc-tip]")) scheduleHideTip(); });
  tipPopover.addEventListener("pointerenter", () => window.clearTimeout(tipHideTimer));
  tipPopover.addEventListener("pointerleave", scheduleHideTip);
  root.querySelectorAll("[data-pc-confirm]").forEach(button => button.addEventListener("click", () => app.resolveConfirm(button.dataset.pcConfirm === "ok")));
  root.addEventListener("input", event => {
    if (event.target.closest("#pcDrawerBody")) app.markDrawerDirty();
  });
  root.addEventListener("change", event => {
    if (event.target.closest("#pcDrawerBody")) app.markDrawerDirty();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (app.isImagePickerOpen?.()) app.closeImagePicker();
    else if (app.isScreenViewerOpen?.()) app.closeGenerationScreenViewer();
    else if (app.isDistributionImageViewerOpen?.()) app.closeDistributionImageViewer();
    else if (app.els.confirmLayer.classList.contains("show")) app.resolveConfirm(false);
    else if (app.els.drawerLayer.classList.contains("show")) app.requestCloseDrawer();
  });

  window.ProductCardApp = app;
})();

(function () {
  "use strict";
  const page = document.getElementById("page-account-config");
  const data = window.AccountConfigSeed;
  if (!page || !data) return;

  const { shops, accounts, douyinAccounts } = data;
  const productData = window.ProductCardApp?.data;
  if (productData) {
    accounts.forEach(account => {
      if (!productData.accounts.some(item => item.id === account.id)) {
        productData.accounts.push({ ...account, accountId: account.id, today: 0, failed: 0, total: 0, updatedAt: "09-02 11:20:06" });
      }
    });
  }
  const state = {
    view: "shop",
    shopSearch: "", qianchuan: "all", suixintui: "all", juliang: "all",
    accountSearch: "", accountShopSearch: "", defaultOnly: false,
    douyinSearch: ""
  };
  const platformNames = { qianchuan: "千川", suixintui: "随心推", juliang: "巨量广告" };
  const el = id => page.querySelector(`#${id}`);
  const escape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const shopById = id => shops.find(item => item.id === id);
  const accountById = id => accounts.find(item => item.id === id);
  const matches = (keyword, values) => !keyword || values.some(value => String(value || "").toLowerCase().includes(keyword));

  function entity(item, type = "shop", clickable = false) {
    const content = `<span class="ac-avatar tone-${item.avatarTone || 1}">${escape(item.name.slice(0, 1))}</span><span><b>${escape(item.name)}</b><small>${escape(item.id)}</small></span>`;
    if (!clickable) return `<div class="ac-entity">${content}</div>`;
    const attribute = type === "shop" ? `data-jump-shop="${item.id}"` : `data-jump-account="${item.id}"`;
    return `<button class="ac-entity ac-entity-link" ${attribute}>${content}</button>`;
  }
  function authorizationTag(status) {
    return `<span class="ac-state ${status}">${status === "authorized" ? "已授权" : "未授权"}</span>`;
  }
  function emptyRow(columns, text) { return `<tr><td colspan="${columns}" class="ac-empty">${text}</td></tr>`; }

  let toastTimer = 0;
  function toast(message) {
    const node = el("acToast");
    node.textContent = message; node.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { node.hidden = true; }, 2200);
  }
  let confirmResolve = null;
  function confirmAction(title, text, okText) {
    el("acConfirmTitle").textContent = title;
    el("acConfirmText").textContent = text;
    el("acConfirmOk").textContent = okText;
    el("acConfirmMask").hidden = false;
    return new Promise(resolve => { confirmResolve = resolve; });
  }
  function closeConfirm(result) {
    el("acConfirmMask").hidden = true;
    if (confirmResolve) confirmResolve(result);
    confirmResolve = null;
  }

  let guideTrigger = null;
  function openAuthorizationGuide() {
    guideTrigger = document.activeElement;
    el("acGuideMask").hidden = false;
    document.body.classList.add("ac-modal-open");
    window.requestAnimationFrame(() => el("acGuideClose").focus());
  }
  function closeAuthorizationGuide() {
    el("acGuideMask").hidden = true;
    document.body.classList.remove("ac-modal-open");
    guideTrigger?.focus?.();
    guideTrigger = null;
  }
  function startAuthorization() {
    closeAuthorizationGuide();
    toast("授权申请已发起，请在千川授权页面完成账户选择");
  }

  function shopRows() {
    const keyword = state.shopSearch.trim().toLowerCase();
    return shops.filter(shop => matches(keyword, [shop.name, shop.id]) && [
      ["qianchuan", state.qianchuan], ["suixintui", state.suixintui], ["juliang", state.juliang]
    ].every(([platform, filter]) => filter === "all" || shop.authorization[platform] === filter));
  }
  function renderShops() {
    const rows = shopRows();
    el("acShopCount").textContent = `共 ${rows.length} 个店铺`;
    el("acShopBody").innerHTML = rows.length ? rows.map(shop => {
      const accountCount = accounts.filter(account => account.shopId === shop.id).length;
      const authorizedPlatforms = Object.values(shop.authorization).filter(status => status === "authorized").length;
      const expiry = authorizedPlatforms ? `<span class="ac-expiry ${shop.expiresIn <= 7 ? "warning" : ""}">${shop.expiresIn}</span>` : `<span class="ac-empty-value">--</span>`;
      const actions = Object.entries(shop.authorization).filter(([, status]) => status === "authorized").map(([platform]) => `<button class="ac-action-cancel" data-cancel-auth="${platform}" data-shop-id="${shop.id}">取消${platformNames[platform]}授权</button>`).join("");
      return `<tr><td>${entity(shop)}</td><td><button class="ac-count-link" data-jump-accounts="${shop.id}">${accountCount} 个</button></td><td>${expiry}</td><td>${authorizationTag(shop.authorization.qianchuan)}</td><td>${authorizationTag(shop.authorization.suixintui)}</td><td>${authorizationTag(shop.authorization.juliang)}</td><td><div class="ac-actions">${actions || '<span class="ac-empty-value">--</span>'}</div></td></tr>`;
    }).join("") : emptyRow(7, "没有符合条件的店铺");
  }

  function accountRows() {
    const keyword = state.accountSearch.trim().toLowerCase();
    const shopKeyword = state.accountShopSearch.trim().toLowerCase();
    return accounts.filter(account => {
      const shop = shopById(account.shopId);
      return matches(keyword, [account.name, account.id]) && matches(shopKeyword, [shop?.name, shop?.id]) && (!state.defaultOnly || shop?.defaultAccountId === account.id);
    });
  }
  function renderAccounts() {
    const rows = accountRows();
    el("acAccountCount").textContent = `共 ${rows.length} 个广告账户`;
    el("acAccountBody").innerHTML = rows.length ? rows.map(account => {
      const shop = shopById(account.shopId);
      const isDefault = shop?.defaultAccountId === account.id;
      const operation = isDefault ? `<button class="ac-action-cancel-default" data-cancel-default="${account.id}">取消店铺默认账户</button>` : `<button class="ac-action-primary" data-set-default="${account.id}">设为店铺默认账户</button>`;
      return `<tr><td>${entity(account, "account")}</td><td>${shop ? entity(shop, "shop", true) : '<span class="ac-empty-value">--</span>'}</td><td><button class="ac-count-link" data-jump-douyin="${account.id}">${account.douyinCount} 个</button></td><td>${operation}</td></tr>`;
    }).join("") : emptyRow(4, "没有符合条件的广告账户");
  }

  function douyinRows() {
    const keyword = state.douyinSearch.trim().toLowerCase();
    return douyinAccounts.filter(item => {
      const account = accountById(item.accountId), shop = shopById(item.shopId);
      return matches(keyword, [item.name, item.id, account?.name, account?.id, shop?.name, shop?.id, shop?.subject]);
    });
  }
  function renderDouyin() {
    const rows = douyinRows();
    el("acDouyinCount").textContent = `共 ${rows.length} 个抖音号`;
    el("acDouyinBody").innerHTML = rows.length ? rows.map(item => {
      const account = accountById(item.accountId), shop = shopById(item.shopId);
      const shopCell = shop ? `<div class="ac-subject-cell">${entity(shop, "shop", true)}<span>主体：${escape(shop.subject)}</span></div>` : '<span class="ac-empty-value">--</span>';
      return `<tr><td>${entity(item, "douyin")}</td><td>${account ? entity(account, "account", true) : '<span class="ac-empty-value">--</span>'}</td><td>${shopCell}</td><td>${authorizationTag(item.status)}</td><td>${escape(item.updatedAt)}</td></tr>`;
    }).join("") : emptyRow(5, "没有符合条件的授权抖音号");
  }

  function render() { renderShops(); renderAccounts(); renderDouyin(); }
  function switchView(view) {
    state.view = view;
    el("acViewTabs").querySelectorAll("button").forEach(button => button.classList.toggle("active", button.dataset.acView === view));
    page.querySelectorAll("[data-ac-panel]").forEach(panel => { panel.hidden = panel.dataset.acPanel !== view; });
  }
  function setInput(id, value) { const input = el(id); if (input) input.value = value; }
  function jumpToShop(shopId) {
    const shop = shopById(shopId); if (!shop) return;
    state.shopSearch = shop.name; state.qianchuan = "all"; state.suixintui = "all"; state.juliang = "all";
    setInput("acShopSearch", shop.name);
    ["acQianchuanFilter", "acSuixintuiFilter", "acJuliangFilter"].forEach(id => { el(id).value = "all"; });
    switchView("shop"); renderShops();
  }
  function jumpToAccounts(shopId) {
    const shop = shopById(shopId); if (!shop) return;
    state.accountSearch = ""; state.accountShopSearch = shop.name; state.defaultOnly = false;
    setInput("acAccountSearch", ""); setInput("acAccountShopSearch", shop.name); el("acDefaultOnly").checked = false;
    switchView("account"); renderAccounts();
  }
  function jumpToAccount(accountId) {
    const account = accountById(accountId); if (!account) return;
    state.accountSearch = account.name; state.accountShopSearch = ""; state.defaultOnly = false;
    setInput("acAccountSearch", account.name); setInput("acAccountShopSearch", ""); el("acDefaultOnly").checked = false;
    switchView("account"); renderAccounts();
  }
  function jumpToDouyin(accountId) {
    const account = accountById(accountId); if (!account) return;
    state.douyinSearch = account.name; setInput("acDouyinSearch", account.name); switchView("douyin"); renderDouyin();
  }

  async function cancelAuthorization(shopId, platform) {
    const shop = shopById(shopId), platformName = platformNames[platform];
    if (!shop || !platformName || shop.authorization[platform] !== "authorized") return;
    const ok = await confirmAction(`确认取消${platformName}授权？`, `取消后，店铺“${shop.name}”将不能通过本系统使用${platformName}相关能力，已有数据不会删除。`, "确认取消");
    if (!ok) return;
    shop.authorization[platform] = "unauthorized";
    renderShops(); toast(`${platformName}授权已取消`);
  }
  async function setDefaultAccount(accountId) {
    const account = accountById(accountId), shop = account && shopById(account.shopId);
    if (!account || !shop || shop.defaultAccountId === account.id) return;
    const previous = accountById(shop.defaultAccountId);
    const ok = await confirmAction("确认修改店铺默认账户？", `店铺“${shop.name}”的默认广告账户将由“${previous?.name || "未设置"}”切换为“${account.name}”。已创建的分发任务不受影响。`, "确认修改");
    if (!ok) return;
    shop.defaultAccountId = account.id;
    const sharedShop = productData?.shops.find(item => item.id === shop.id);
    if (sharedShop) sharedShop.accountId = account.id;
    renderAccounts(); renderShops(); toast("店铺默认广告账户已更新");
  }
  async function cancelDefaultAccount(accountId) {
    const account = accountById(accountId), shop = account && shopById(account.shopId);
    if (!account || !shop || shop.defaultAccountId !== account.id) return;
    const ok = await confirmAction("确认取消店铺默认账户？", `取消后，店铺“${shop.name}”将暂时没有默认广告账户，后续新建分发任务前需要重新设置。历史任务不受影响。`, "确认取消");
    if (!ok) return;
    shop.defaultAccountId = "";
    const sharedShop = productData?.shops.find(item => item.id === shop.id);
    if (sharedShop) sharedShop.accountId = "";
    renderAccounts(); renderShops(); toast("已取消店铺默认广告账户");
  }

  el("acViewTabs").addEventListener("click", event => {
    const button = event.target.closest("[data-ac-view]");
    if (button) switchView(button.dataset.acView);
  });
  [["acShopSearch", "shopSearch", renderShops], ["acAccountSearch", "accountSearch", renderAccounts], ["acAccountShopSearch", "accountShopSearch", renderAccounts], ["acDouyinSearch", "douyinSearch", renderDouyin]].forEach(([id, field, renderer]) => {
    el(id).addEventListener("input", event => { state[field] = event.target.value; renderer(); });
  });
  [["acQianchuanFilter", "qianchuan"], ["acSuixintuiFilter", "suixintui"], ["acJuliangFilter", "juliang"]].forEach(([id, field]) => {
    el(id).addEventListener("change", event => { state[field] = event.target.value; renderShops(); });
  });
  el("acDefaultOnly").addEventListener("change", event => { state.defaultOnly = event.target.checked; renderAccounts(); });
  page.addEventListener("click", event => {
    const accountsJump = event.target.closest("[data-jump-accounts]"); if (accountsJump) return jumpToAccounts(accountsJump.dataset.jumpAccounts);
    const shopJump = event.target.closest("[data-jump-shop]"); if (shopJump) return jumpToShop(shopJump.dataset.jumpShop);
    const accountJump = event.target.closest("[data-jump-account]"); if (accountJump) return jumpToAccount(accountJump.dataset.jumpAccount);
    const douyinJump = event.target.closest("[data-jump-douyin]"); if (douyinJump) return jumpToDouyin(douyinJump.dataset.jumpDouyin);
    const cancel = event.target.closest("[data-cancel-auth]"); if (cancel) return cancelAuthorization(cancel.dataset.shopId, cancel.dataset.cancelAuth);
    const cancelDefault = event.target.closest("[data-cancel-default]"); if (cancelDefault) return cancelDefaultAccount(cancelDefault.dataset.cancelDefault);
    const setDefault = event.target.closest("[data-set-default]"); if (setDefault) return setDefaultAccount(setDefault.dataset.setDefault);
  });
  el("acConfirmCancel").addEventListener("click", () => closeConfirm(false));
  el("acConfirmOk").addEventListener("click", () => closeConfirm(true));
  el("acConfirmMask").addEventListener("click", event => { if (event.target === el("acConfirmMask")) closeConfirm(false); });
  el("acAddShopAuth").addEventListener("click", openAuthorizationGuide);
  el("acGuideClose").addEventListener("click", closeAuthorizationGuide);
  el("acGuideAuthorize").addEventListener("click", startAuthorization);
  el("acGuideMask").addEventListener("click", event => { if (event.target === el("acGuideMask")) closeAuthorizationGuide(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !el("acGuideMask").hidden) closeAuthorizationGuide();
  });
  render();
})();

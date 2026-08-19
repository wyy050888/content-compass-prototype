
    const pageNames = {
      creation: "AI创作",
      "pull-entry": "爆款拆解",
      pull: "拆解结果",
      products: "产品库",
      "competitor-library": "竞品库",
      "product-detail": "产品详情",
      "copy-library": "文案库",
      "script-library": "脚本库",
      "creation-videos": "创作素材",
      "finished-videos": "成片视频",
      "reference-videos": "外部参考视频",
      "image-library": "图片库",
      "template-library": "模板库",
      "infinite-canvas": "无限画板",
      "image-main-agent": "商品主图 Agent",
      "image-detail-agent": "商品详情图 Agent",
      "material-monitor": "素材监控",
      "review-distribute": "视频过审与分发",
      "product-card": "商品卡推广",
      "content-promo": "图文推广",
      "account-config": "推广配置",
      promotion: "推广自动化",
      "promotion-batch": "推广自动化",
      "promotion-rules": "推广配置",
      "promotion-accounts": "推广配置",
      "promotion-sync": "推广配置",
      store: "抖店运营",
      creator: "达人建联",
      "role-management": "角色管理",
      "member-management": "人员管理",
      admin: "AI管理后台"
    };

    const navItems = [...document.querySelectorAll(".nav-item[data-page]")];
    const pages = [...document.querySelectorAll(".page")];
    const pageTitle = document.getElementById("pageTitle");
    const sidebar = document.getElementById("sidebar");
    const appShell = document.querySelector(".app");
    const sidebarCollapse = document.getElementById("sidebarCollapse");
    const mainArea = document.querySelector(".main");
    const assetPanel = document.getElementById("assetPanel");
    const assetBackdrop = document.getElementById("assetBackdrop");
    const sidebarMenuScroll = document.getElementById("sidebarMenuScroll");
    let sidebarScrollTimer;

    function closeSidebarFlyouts(except = null) {
      document.querySelectorAll(".sidebar .nav-group.is-flyout-open").forEach(group => {
        if (group === except) return;
        clearTimeout(group._flyoutCloseTimer);
        group.classList.remove("is-flyout-open");
        group.style.removeProperty("--flyout-top");
      });
    }

    function openSidebarFlyout(group) {
      if (!sidebar.classList.contains("is-collapsed")) return;
      const summary = group.querySelector(":scope > summary");
      if (!summary) return;
      clearTimeout(group._flyoutCloseTimer);
      closeSidebarFlyouts(group);
      const bounds = summary.getBoundingClientRect();
      const top = Math.max(12, Math.min(bounds.top, window.innerHeight - 360));
      group.style.setProperty("--flyout-top", `${Math.round(top)}px`);
      group.open = true;
      group.classList.add("is-flyout-open");
    }

    function setSidebarCollapsed(collapsed, persist = true) {
      if (window.innerWidth <= 860) return;
      sidebar.classList.toggle("is-collapsed", collapsed);
      appShell.classList.toggle("sidebar-collapsed", collapsed);
      sidebarCollapse.textContent = collapsed ? "›" : "‹";
      sidebarCollapse.setAttribute("aria-label", collapsed ? "展开菜单" : "收起菜单");
      sidebarCollapse.setAttribute("title", collapsed ? "展开菜单" : "收起菜单");
      if (!collapsed) closeSidebarFlyouts();
      if (persist) localStorage.setItem("contentCompassSidebarCollapsed", String(collapsed));
    }

    const sidebarCollapsed = localStorage.getItem("contentCompassSidebarCollapsed") === "true";
    setSidebarCollapsed(sidebarCollapsed);
    sidebarCollapse.addEventListener("click", () => {
      setSidebarCollapsed(!sidebar.classList.contains("is-collapsed"));
    });

    document.querySelectorAll(".nav-group").forEach(group => {
      const summary = group.querySelector(":scope > summary");
      if (!summary) return;
      group.addEventListener("pointerenter", () => openSidebarFlyout(group));
      group.addEventListener("pointerleave", () => {
        if (!sidebar.classList.contains("is-collapsed")) return;
        group._flyoutCloseTimer = setTimeout(() => closeSidebarFlyouts(), 140);
      });
      summary.addEventListener("click", event => {
        if (!sidebar.classList.contains("is-collapsed")) return;
        event.preventDefault();
        openSidebarFlyout(group);
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth <= 860) {
        sidebar.classList.remove("is-collapsed");
        appShell.classList.remove("sidebar-collapsed");
      } else if (localStorage.getItem("contentCompassSidebarCollapsed") === "true") {
        setSidebarCollapsed(true);
      }
    });

    sidebarMenuScroll.addEventListener("scroll", () => {
      sidebarMenuScroll.classList.add("is-scrolling");
      clearTimeout(sidebarScrollTimer);
      sidebarScrollTimer = setTimeout(() => sidebarMenuScroll.classList.remove("is-scrolling"), 520);
    }, { passive: true });

    function setAssetPanel(open) {
      assetPanel.classList.toggle("open", open);
      assetBackdrop.classList.toggle("show", open);
      document.getElementById("assetToggle").setAttribute("aria-expanded", String(open));
    }

    function switchPage(name, sourceItem) {
      const navPage = name === "pull" ? "pull-entry" : name === "product-detail" ? "products" : name;
      const activeItem = sourceItem || navItems.find(item => item.dataset.page === navPage) || navItems.find(item => item.dataset.page === "creation");
      navItems.forEach(item => item.classList.toggle("active", item === activeItem));
      pages.forEach(page => page.classList.toggle("active", page.id === `page-${name}`));
      pageTitle.textContent = pageNames[name] || "内容罗盘";
      mainArea.classList.toggle("pull-mode", name === "pull");
      if (name !== "infinite-canvas") appShell.classList.remove("canvas-fullscreen");
      activeItem?.closest(".nav-group")?.setAttribute("open", "");
      activeItem?.closest(".nav-child-group")?.setAttribute("open", "");
      sidebar.classList.remove("open");
      setAssetPanel(false);
      const accountScopedPages = ["material-monitor", "review-distribute", "product-card", "content-promo"];
      const showAccountSidebar = accountScopedPages.includes(name);
      document.getElementById("subSidebar")?.classList.toggle("show", showAccountSidebar);
      appShell.classList.toggle("has-subsidebar", showAccountSidebar);
      if (showAccountSidebar && typeof window.syncPromotionAccountSidebar === "function") {
        window.syncPromotionAccountSidebar(name);
      }
      // 关闭可能的弹层
      document.querySelectorAll(".modal-backdrop").forEach(el => {
        if (el.id !== "agentModal") el.classList.remove("show");
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("message", event => {
      const canvasFrame = document.querySelector("#page-infinite-canvas iframe");
      if (event.source !== canvasFrame?.contentWindow || event.data?.type !== "infinite-canvas-workspace") return;
      appShell.classList.toggle("canvas-fullscreen", Boolean(event.data.open));
    });

    navItems.forEach(item => item.addEventListener("click", () => {
      if (item.dataset.page === "creation") resetCreationWorkspace();
      switchPage(item.dataset.page, item);
      closeSidebarFlyouts();
      const libraryTab = item.dataset.libraryTab;
      const videoView = item.dataset.videoView;
      const promoTab = item.dataset.promoTab;
      const storeView = item.dataset.storeView;
      const creatorView = item.dataset.creatorView;

      if (libraryTab) {
        const tab = [...document.querySelectorAll("#libraryTabs .tab")].find(button => button.textContent.trim() === libraryTab);
        tab?.click();
        if (videoView) showToast(`已进入视频库 · ${videoView}`);
      }
      if (promoTab) {
        document.querySelector(`.promo-tab[data-promo-tab="${promoTab}"]`)?.click();
      }
      if (item.dataset.deliveryMode) showToast(`已进入${item.textContent.trim()}配置流程`);
      if (storeView) showToast(`已进入抖店运营 · ${item.textContent.trim()}`);
      if (creatorView) showToast(`已进入达人建联 · ${item.textContent.trim()}`);
    }));
    (function initPromotionAccountSidebar() {
      const searchInput = document.getElementById("accSearchInput");
      const filterSelect = document.getElementById("accFilterSelect");
      const accList = document.getElementById("accListContainer");
      if (!searchInput || !filterSelect || !accList) return;

      function filterAccountList() {
        const keyword = searchInput.value.trim().toLowerCase();
        const category = filterSelect.value;
        let visibleCount = 0;
        accList.querySelectorAll(".sub-acc-item").forEach(item => {
          const name = (item.dataset.name || "").toLowerCase();
          const id = (item.dataset.id || "").toLowerCase();
          const type = item.dataset.type || "";
          const keywordMatched = !keyword || name.includes(keyword) || id.includes(keyword);
          const categoryMatched = type === "all" || category === "all" || type === category;
          const visible = keywordMatched && categoryMatched;
          item.style.display = visible ? "" : "none";
          if (visible) visibleCount += 1;
        });
        let empty = accList.querySelector(".sub-acc-empty");
        if (!visibleCount) {
          if (!empty) {
            empty = document.createElement("div");
            empty.className = "sub-acc-empty";
            empty.textContent = "无匹配账户";
            accList.appendChild(empty);
          }
          empty.style.display = "";
        } else if (empty) {
          empty.style.display = "none";
        }
      }

      function filterActivePromotionPage(account) {
        const activePage = document.querySelector(".page.active")?.id;
        if (activePage === "page-material-monitor") mmFilterByAcc(account);
        if (activePage === "page-review-distribute") rdFilterByAcc(account);
        if (activePage === "page-product-card") pcFilterByAcc(account);
        if (activePage === "page-content-promo") cpFilterByAcc(account);
      }

      searchInput.addEventListener("input", filterAccountList);
      filterSelect.addEventListener("change", filterAccountList);
      accList.addEventListener("click", event => {
        const item = event.target.closest(".sub-acc-item");
        if (!item) return;
        accList.querySelectorAll(".sub-acc-item").forEach(node => node.classList.toggle("active", node === item));
        filterActivePromotionPage(item.dataset.acc);
        showToast(item.dataset.acc === "all" ? "已切换至全部账户汇总视图" : `已切换至账户 ${item.dataset.name}（${item.dataset.acc}）`);
      });

      window.syncPromotionAccountSidebar = page => {
        const categoryMap = {
          "material-monitor": "all",
          "review-distribute": "review",
          "product-card": "live",
          "content-promo": "image"
        };
        searchInput.value = "";
        filterSelect.value = categoryMap[page] || "all";
        const allItem = accList.querySelector('[data-acc="all"]');
        accList.querySelectorAll(".sub-acc-item").forEach(node => node.classList.toggle("active", node === allItem));
        filterAccountList();
        filterActivePromotionPage("all");
      };
    })();
    document.querySelectorAll(".promotion-config-tab").forEach(tab => tab.addEventListener("click", () => {
      const configNav = navItems.find(item => item.dataset.page === "promotion-rules");
      switchPage(tab.dataset.page, configNav);
    }));
    document.querySelectorAll("[data-planned]").forEach(item => item.addEventListener("click", () => {
      showToast(`${item.dataset.planned}页面已预留，当前原型暂未接入具体内容`);
    }));
    document.getElementById("openPullTool").addEventListener("click", () => switchPage("pull-entry"));
    document.getElementById("mobileToggle").addEventListener("click", () => sidebar.classList.toggle("open"));
    document.getElementById("assetToggle").addEventListener("click", () => setAssetPanel(true));
    document.getElementById("assetClose").addEventListener("click", () => setAssetPanel(false));
    assetBackdrop.addEventListener("click", () => setAssetPanel(false));


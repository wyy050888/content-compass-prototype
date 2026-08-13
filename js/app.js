
    const pageNames = {
      creation: "AI创作",
      "pull-entry": "智能拉片",
      pull: "智能拉片",
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

    function setSidebarCollapsed(collapsed) {
      if (window.innerWidth <= 860) return;
      sidebar.classList.toggle("is-collapsed", collapsed);
      appShell.classList.toggle("sidebar-collapsed", collapsed);
      sidebarCollapse.textContent = collapsed ? "›" : "‹";
      sidebarCollapse.setAttribute("aria-label", collapsed ? "展开菜单" : "收起菜单");
      sidebarCollapse.setAttribute("title", collapsed ? "展开菜单" : "收起菜单");
      localStorage.setItem("contentCompassSidebarCollapsed", String(collapsed));
    }

    const sidebarCollapsed = localStorage.getItem("contentCompassSidebarCollapsed") === "true";
    setSidebarCollapsed(sidebarCollapsed);
    sidebarCollapse.addEventListener("click", () => {
      setSidebarCollapsed(!sidebar.classList.contains("is-collapsed"));
    });

    document.querySelectorAll(".nav-group > summary").forEach(summary => {
      summary.addEventListener("click", event => {
        if (!sidebar.classList.contains("is-collapsed")) return;
        event.preventDefault();
        const group = summary.closest(".nav-group");
        setSidebarCollapsed(false);
        group.open = true;
        requestAnimationFrame(() => summary.focus());
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
      switchPage(item.dataset.page, item);
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

    /* ===================== 智能拉片·入口页（单视频模式） ===================== */
    const sourceTabs = document.querySelectorAll("#sourceTabs .source-tab");
    const sourcePanels = document.querySelectorAll(".source-panel");
    let activePullSource = "link";
    function panelForPullVideo(video) {
      if (!video) return null;
      return ["library", "finished", "external"].includes(video.source) ? "library" : video.source;
    }
    function syncPullResultVisibility() {
      const result = document.getElementById("pullSourceResult");
      const selectedSource = panelForPullVideo(videos[0]);
      const isCurrentSource = !selectedSource || selectedSource === activePullSource;
      if (result) result.hidden = !isCurrentSource;
      startParseBtn.disabled = videos.length === 0 || !!currentRecord || !isCurrentSource || isUploading;
    }
    function setPullSourceTab(target) {
      activePullSource = target;
      sourceTabs.forEach(t => t.classList.toggle("active", t.dataset.source === target));
      sourcePanels.forEach(p => p.hidden = p.dataset.panel !== target);
      const result = document.getElementById("pullSourceResult");
      const activePanel = document.querySelector(`#page-pull-entry .source-panel[data-panel="${target}"]`);
      if (result && activePanel) activePanel.appendChild(result);
      syncPullResultVisibility();
    }
    sourceTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.source;
        setPullSourceTab(target);
      });
    });

    // 数据
    const MAX_VIDEOS = 1;
    const videoList = document.getElementById("videoList");
    const videoCount = document.getElementById("videoCount");
    const startParseBtn = document.getElementById("startParse");
    let videos = [];            // 单视频：始终 0 或 1
    let nextId = 1;
    let parseTimer = null;      // 当前解析的 setTimeout id
    let currentRecord = null;   // 当前正在解析的历史记录
    let uploadTimer = null;
    let isUploading = false;

    function fmtName(input) {
      if (!input) return "未命名视频";
      const t = String(input).trim();
      return t.length <= 38 ? t : t.slice(0, 35) + "…";
    }
    function isValidLink(s) {
      return /^(https?:\/\/)?(www\.)?(douyin|iesdouyin|ixigua|kuaishou|weishi)\.com\//i.test(s)
        || /v\.douyin\.com\//i.test(s)
        || /^[a-zA-Z0-9_\-]{8,}$/.test(s);
    }
    function randomDuration() {
      const m = Math.floor(Math.random() * 3) + 1;
      const s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      return `0${m}:${s}`;
    }
    function nowText() {
      const d = new Date();
      const p = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    }
    function sourceChar(s) { return ({ link: "抖", library: "库", finished: "成", external: "外", upload: "本" })[s] || "视"; }
    function sourceLabel(s) { return ({ link: "抖音链接", library: "视频库", finished: "成片视频", external: "外部参考视频", upload: "本地上传" })[s] || "—"; }

    function setVideo(newV) {
      videos = [newV];   // 单视频：直接替换
      renderVideoList();
    }

    function renderVideoList() {
      videoList.innerHTML = "";
      videoList.classList.toggle("empty", videos.length === 0);
      if (videos.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = `
          <svg width="62" height="48" viewBox="0 0 62 48" fill="none">
            <path d="M6 14L31 2l25 12v22L31 48 6 36V14z" stroke="#9c9fef" stroke-width="1.5" fill="#f5f6ff"/>
            <path d="M31 16v14M24 23h14" stroke="#9c9fef" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <div>先在上面选择 1 个视频～</div>`;
        videoList.appendChild(empty);
      } else {
        const v = videos[0];
        const row = document.createElement("div");
        row.className = "video-row";
        row.dataset.id = v.id;
        row.innerHTML = `
          <div class="thumb">${sourceChar(v.source)}</div>
          <div class="meta">
            <strong>${fmtName(v.name)}</strong>
            <small>${v.duration || "—"} · ${sourceLabel(v.source)}</small>
            <span class="status">待解析</span>
          </div>
          <div class="row-actions">
            <button class="delete" data-act="delete" aria-label="移除">✕</button>
          </div>`;
        videoList.appendChild(row);
      }
      videoCount.textContent = videos.length;
      syncPullResultVisibility();
    }

    videoList.addEventListener("click", e => {
      const btn = e.target.closest("button[data-act='delete']");
      if (!btn) return;
      videos = [];
      renderVideoList();
      showToast("已移除视频");
    });

    /* === 链接添加 === */
    const linkInput = document.getElementById("linkInput");
    const linkInputArea = document.getElementById("linkInputArea");
    const linkError = document.getElementById("linkError");
    document.getElementById("clearLinks").addEventListener("click", () => {
      linkInput.value = "";
      linkInputArea.classList.remove("has-error");
      linkError.style.display = "none";
    });
    document.getElementById("addLinks").addEventListener("click", () => {
      const raw = linkInput.value.trim();
      if (!raw) {
        linkInputArea.classList.add("has-error");
        linkError.textContent = "请粘贴至少一条视频链接";
        linkError.style.display = "block";
        return;
      }
      const first = raw.split(/\n+/).map(s => s.trim()).filter(Boolean)[0];
      if (!isValidLink(first)) {
        linkInputArea.classList.add("has-error");
        linkError.textContent = "链接格式无效";
        linkError.style.display = "block";
        return;
      }
      linkInput.value = "";
      linkInputArea.classList.remove("has-error");
      linkError.style.display = "none";
      setVideo({ id: "v" + (nextId++), name: first, link: first, source: "link", duration: randomDuration(), status: "pending" });
      showToast("已添加视频");
    });
    linkInput.addEventListener("input", () => {
      if (linkInput.value.trim()) {
        linkInputArea.classList.remove("has-error");
        linkError.style.display = "none";
      }
    });

    async function openPullVideoPicker() {
      if (!window.CreationVideoPicker) {
        showToast("视频选择器加载失败，请刷新页面后重试");
        return;
      }
      let items = readReferenceVideoCatalog();
      if (!items.length) requestReferenceVideoCatalog();
      window.CreationVideoPicker.open({
        items,
        loading: !items.length,
        onConfirm(video) {
          if (!video) return;
          setVideo({
            id: `v${nextId++}`,
            name: video.title,
            source: video.source,
            duration: video.duration,
            status: "pending",
            videoId: video.id
          });
          // 选中后仍停留在视频库入口，避免与本地上传来源混淆。
          setPullSourceTab("library");
          showToast(`已选择${video.source === "finished" ? "成片视频" : "外部参考视频"}`);
        }
      });
      if (!items.length) {
        items = await waitForReferenceVideoCatalog();
        window.CreationVideoPicker.setItems?.(items);
      }
      if (!items.length) showToast("暂无可选视频，请先导入成片视频或外部参考视频");
    }

    document.getElementById("openPullVideoPicker")?.addEventListener("click", openPullVideoPicker);

    /* === 素材库选择（文件夹树 + 标签 + 搜索 + 单选） === */
    const libFolderTree = document.getElementById("libFolderTree");
    const libGrid = document.getElementById("libGrid");
    const libEmpty = document.getElementById("libEmpty");
    const libSelectedCount = document.getElementById("libSelectedCount");
    const confirmLibraryBtn = document.getElementById("confirmLibrary");
    const libSearch = document.getElementById("libSearch");
    let currentFolder = "all";
    let currentKeyword = "";
    let libPickedId = null;

    function applyLibFilter() {
      let visible = 0;
      libGrid.querySelectorAll(".lib-card").forEach(card => {
        const inFolder = currentFolder === "all" || card.dataset.folder === currentFolder;
        const inSearch = !currentKeyword || (card.dataset.name || "").toLowerCase().includes(currentKeyword);
        const show = inFolder && inSearch;
        card.hidden = !show;
        if (show) visible++;
      });
      libEmpty.hidden = visible > 0;
    }

    libFolderTree.addEventListener("click", e => {
      const item = e.target.closest(".lib-folder-item");
      if (!item) return;
      libFolderTree.querySelectorAll(".lib-folder-item").forEach(x => x.classList.toggle("active", x === item));
      currentFolder = item.dataset.folder;
      applyLibFilter();
    });
    libSearch.addEventListener("input", () => {
      currentKeyword = libSearch.value.trim().toLowerCase();
      applyLibFilter();
    });

    libGrid.addEventListener("click", e => {
      const card = e.target.closest(".lib-card");
      if (!card || card.hidden) return;
      const id = card.dataset.id;
      if (libPickedId === id) {
        card.classList.remove("selected");
        libPickedId = null;
      } else {
        libGrid.querySelectorAll(".lib-card.selected").forEach(x => x.classList.remove("selected"));
        card.classList.add("selected");
        libPickedId = id;
      }
      libSelectedCount.textContent = libPickedId ? "1" : "0";
      confirmLibraryBtn.disabled = !libPickedId;
    });

    confirmLibraryBtn.addEventListener("click", () => {
      if (!libPickedId) { showToast("请先选择视频"); return; }
      const card = libGrid.querySelector(`.lib-card[data-id="${libPickedId}"]`);
      setVideo({ id: "v" + (nextId++), name: card.dataset.name, source: "library", duration: card.dataset.duration, status: "pending" });
      showToast("已从素材库选择 1 个视频");
    });

    /* === 本地上传（单文件） === */
    const uploadDrop = document.getElementById("uploadDrop");
    const fileInput = document.getElementById("fileInput");
    const pullUploadProgress = document.getElementById("pullUploadProgress");
    const pullUploadName = document.getElementById("pullUploadName");
    const pullUploadPercent = document.getElementById("pullUploadPercent");
    const pullUploadBar = document.getElementById("pullUploadBar");
    function uploadLocalVideo(file) {
      if (!file) return;
      if (file.size > 500 * 1024 * 1024) {
        showToast("视频文件不能超过 500MB");
        return;
      }
      if (uploadTimer) clearInterval(uploadTimer);
      isUploading = true;
      uploadDrop.classList.add("uploading");
      pullUploadProgress.hidden = false;
      pullUploadName.textContent = `正在上传：${fmtName(file.name)}`;
      let progress = 0;
      const renderProgress = () => {
        pullUploadPercent.textContent = `${progress}%`;
        pullUploadBar.style.width = `${progress}%`;
      };
      renderProgress();
      uploadTimer = setInterval(() => {
        progress = Math.min(100, progress + (progress < 72 ? 12 : 4));
        renderProgress();
        if (progress < 100) return;
        clearInterval(uploadTimer);
        uploadTimer = null;
        isUploading = false;
        uploadDrop.classList.remove("uploading");
        pullUploadName.textContent = `上传完成：${fmtName(file.name)}`;
        setVideo({ id: "v" + (nextId++), name: file.name, source: "upload", duration: "—", status: "pending" });
        setTimeout(() => { pullUploadProgress.hidden = true; }, 700);
      }, 120);
      syncPullResultVisibility();
    }
    ["dragenter", "dragover"].forEach(ev => uploadDrop.addEventListener(ev, e => {
      e.preventDefault(); uploadDrop.classList.add("dragover");
    }));
    ["dragleave", "drop"].forEach(ev => uploadDrop.addEventListener(ev, e => {
      e.preventDefault(); uploadDrop.classList.remove("dragover");
    }));
    uploadDrop.addEventListener("drop", e => {
      const f = [...e.dataTransfer.files].filter(f => /^video\//.test(f.type) || /\.(mp4|mov|m4v)$/i.test(f.name))[0];
      uploadLocalVideo(f);
    });
    fileInput.addEventListener("change", () => {
      const f = fileInput.files[0];
      uploadLocalVideo(f);
      fileInput.value = "";
    });

    document.getElementById("clearAll").addEventListener("click", () => {
      if (!videos.length) return;
      videos = [];
      renderVideoList();
      showToast("已移除");
    });

    /* === 解析进度（on-page，单视频） === */
    const parseProgress = document.getElementById("parseProgress");
    const ppStage = document.getElementById("ppStage");
    const ppPercent = document.getElementById("ppPercent");
    const ppBar = document.getElementById("ppBar");
    const ppName = document.getElementById("ppName");
    const ppCancel = document.getElementById("ppCancel");
    const STAGES = [
      { until: 25,  text: "上传视频到 AI 引擎" },
      { until: 55,  text: "提取口播文案" },
      { until: 80,  text: "识别分镜结构" },
      { until: 100, text: "画面逐帧分析 + 生成总结" }
    ];

    function startParse() {
      if (!videos.length || currentRecord) return;
      const v = videos[0];
      const rec = {
        id: "h" + Date.now(),
        videoName: v.name,
        videoSource: v.source,
        duration: v.duration || "—",
        startedAt: nowText(),
        finishedAt: null,
        status: "parsing",
        progress: 0,
        stage: STAGES[0].text,
        shots: 0
      };
      currentRecord = rec;
      history.unshift(rec);
      renderHistory();
      // 视觉：隐藏 video-list + 标题，显示进度区
      videoList.style.display = "none";
      const vlHead = document.querySelector(".video-list-head");
      if (vlHead) vlHead.style.display = "none";
      parseProgress.hidden = false;
      ppName.textContent = `${v.name} · ${v.duration || "—"}`;
      ppStage.textContent = STAGES[0].text;
      ppPercent.textContent = "0%";
      ppBar.style.width = "0%";
      renderVideoList();  // 刷新按钮 disabled
      // 推进
      if (parseTimer) clearTimeout(parseTimer);
      let p = 0;
      const tick = () => {
        p = Math.min(100, p + 3 + Math.random() * 8);
        const st = STAGES.find(s => p < s.until) || STAGES[STAGES.length - 1];
        rec.progress = p;
        rec.stage = st.text;
        ppBar.style.width = p + "%";
        ppPercent.textContent = Math.round(p) + "%";
        ppStage.textContent = st.text;
        renderHistory();
        if (p < 100) parseTimer = setTimeout(tick, 280 + Math.random() * 200);
        else completeParse(rec);
      };
      parseTimer = setTimeout(tick, 200);
    }

    function completeParse(rec) {
      rec.status = "done";
      rec.finishedAt = nowText();
      rec.shots = 5 + Math.floor(Math.random() * 5);
      renderHistory();
      fillResultMeta(rec);
      showToast(`解析完成：${rec.videoName}`);
      videos = [];
      renderVideoList();
      videoList.style.display = "";
      const vlHead = document.querySelector(".video-list-head");
      if (vlHead) vlHead.style.display = "";
      parseProgress.hidden = true;
      currentRecord = null;
      parseTimer = null;
      switchPage("pull");
    }

    function cancelParse() {
      if (parseTimer) { clearTimeout(parseTimer); parseTimer = null; }
      if (currentRecord) {
        currentRecord.status = "failed";
        currentRecord.finishedAt = nowText();
        currentRecord.stage = "已取消";
        renderHistory();
      }
      currentRecord = null;
      parseProgress.hidden = true;
      videoList.style.display = "";
      const vlHead = document.querySelector(".video-list-head");
      if (vlHead) vlHead.style.display = "";
      renderVideoList();
      showToast("已取消解析");
    }

    document.getElementById("ppCancel").addEventListener("click", cancelParse);
    document.getElementById("startParse").addEventListener("click", startParse);

    function fillResultMeta(rec) {
      const dur = rec.duration || "00:31";
      const parts = dur.split(":");
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1] || "0", 10);
      const totalText = (m && s) ? `${m} 分 ${s} 秒` : "0 分 31 秒";
      (document.getElementById("resultDuration") || {}).textContent = totalText;
      (document.getElementById("resultTime") || {}).textContent = rec.finishedAt || rec.startedAt || nowText();
      (document.getElementById("resultSpec") || {}).textContent = `${dur} · 9:16`;
      (document.getElementById("resultTotal") || {}).textContent = dur;
    }

    /* === 历史记录（动态数组） === */
    const historyDrawer = document.getElementById("historyDrawer");
    const historyBackdrop = document.getElementById("historyBackdrop");
    const historyBody = document.getElementById("historyBody");
    const history = [];

    function statusBadge(s) {
      if (s === "parsing") return '<span class="badge" style="color:#4d6bd6;background:#eaf0ff;">解析中</span>';
      if (s === "done") return '<span class="badge" style="color:#19855d;background:#e7f6ef;">已完成</span>';
      if (s === "failed") return '<span class="badge" style="color:#c14545;background:#fde7e7;">失败</span>';
      return '<span class="badge">—</span>';
    }

    function renderHistory() {
      if (!history.length) {
        historyBody.innerHTML = '<div class="history-empty">还没有解析记录，先去添加视频试试～</div>';
        return;
      }
      historyBody.innerHTML = history.map(h => {
        const char = sourceChar(h.videoSource);
        const body = h.status === "parsing"
          ? `<div class="progress-bar"><span style="width:${Math.round(h.progress || 0)}%"></span></div>
             <span class="progress-text">${Math.round(h.progress || 0)}% · ${h.stage || "准备中"}</span>`
          : `<div class="status-line">${statusBadge(h.status)}${h.status === "done" ? '<span class="meta-pill">' + h.shots + ' 个分镜</span>' : ''}</div>`;
        const action = h.status === "done"
          ? `<button class="ghost-mini" data-act="view" data-id="${h.id}">查看</button>`
          : h.status === "failed"
          ? `<button class="ghost-mini" data-act="retry" data-id="${h.id}">重试</button>`
          : `<button class="ghost-mini" data-act="cancel" data-id="${h.id}">取消</button>`;
        return `
          <div class="history-item" data-id="${h.id}">
            <div class="thumb">${char}</div>
            <div class="meta">
              <strong>${fmtName(h.videoName)}</strong>
              <small>${h.duration} · ${h.startedAt}${h.finishedAt ? ' · 完成于 ' + h.finishedAt : ''}</small>
              ${body}
            </div>
            <div class="actions">${action}</div>
          </div>`;
      }).join("");
    }

    function openHistory() {
      renderHistory();
      historyDrawer.classList.add("show");
      historyBackdrop.style.display = "block";
    }
    function closeHistory() {
      historyDrawer.classList.remove("show");
      historyBackdrop.style.display = "none";
    }
    document.getElementById("openHistory").addEventListener("click", openHistory);
    document.getElementById("closeHistory").addEventListener("click", closeHistory);
    historyBackdrop.addEventListener("click", closeHistory);
    historyBody.addEventListener("click", e => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const id = btn.dataset.id;
      const rec = history.find(x => x.id === id);
      if (!rec) return;
      if (btn.dataset.act === "view") {
        closeHistory();
        fillResultMeta(rec);
        switchPage("pull");
        showToast(`已加载历史：${rec.videoName}`);
      } else if (btn.dataset.act === "retry") {
        rec.status = "parsing";
        rec.progress = 0;
        rec.stage = STAGES[0].text;
        rec.startedAt = nowText();
        rec.finishedAt = null;
        renderHistory();
        let p = 0;
        const tick = () => {
          p = Math.min(100, p + 3 + Math.random() * 8);
          const st = STAGES.find(s => p < s.until) || STAGES[STAGES.length - 1];
          rec.progress = p;
          rec.stage = st.text;
          renderHistory();
          if (p < 100) setTimeout(tick, 280 + Math.random() * 200);
          else {
            rec.status = "done";
            rec.finishedAt = nowText();
            rec.shots = 5 + Math.floor(Math.random() * 5);
            renderHistory();
            showToast("重试解析完成");
          }
        };
        setTimeout(tick, 200);
      } else if (btn.dataset.act === "cancel") {
        rec.status = "failed";
        rec.finishedAt = nowText();
        rec.stage = "已取消";
        renderHistory();
        showToast("已取消");
      }
    });

    /* === 查看示例（直接跳结果页，不再弹中间层） === */
    function goToSampleResult() {
      const rec = {
        id: "h" + Date.now(),
        videoName: "示例：除螨仪主视频.mp4",
        videoSource: "link",
        duration: "02:13",
        startedAt: "2026/07/28 09:12",
        finishedAt: "2026/07/28 09:13",
        status: "done",
        progress: 100,
        stage: "完成",
        shots: 8
      };
      history.unshift(rec);
      renderHistory();
      fillResultMeta({ ...rec, duration: "02:13" });
      (document.getElementById("resultTime") || {}).textContent = "2026/07/28 09:12";
      switchPage("pull");
      showToast("已加载示例：除螨仪主视频");
    }
    document.getElementById("openSample").addEventListener("click", goToSampleResult);

    // 拉片结果页·历史解析记录入口(若该页存在按钮)
    const _lpHistBtn = document.getElementById("lpHistoryBtn");
    if (_lpHistBtn) _lpHistBtn.addEventListener("click", openHistory);

    /* ===================== 结果详情页·交互 ===================== */
    if (document.getElementById("backToEntry")) { // 新拉片页无旧元素时跳过旧交互绑定
    document.getElementById("backToEntry").addEventListener("click", () => switchPage("pull-entry"));

    // 复制
    function copyText(text, label) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast(`${label}已复制`));
      } else {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); showToast(`${label}已复制`); }
        catch (e) { showToast("复制失败，请手动选择"); }
        document.body.removeChild(ta);
      }
    }
    document.getElementById("copyTranscript").addEventListener("click", () => {
      const text = [...document.querySelectorAll("#transcriptList .transcript-row")]
        .map(r => r.querySelector("span").textContent + " " + r.querySelector("div").textContent)
        .join("\n");
      copyText(text, "口播文案");
    });
    document.getElementById("copyScript").addEventListener("click", () => {
      const lines = [...document.querySelectorAll("#scriptFields .script-field")].map(f => {
        const label = f.querySelector(".label").firstChild.textContent.trim();
        const chips = [...f.querySelectorAll(".chip")].map(c => c.textContent).join("、");
        const plain = f.querySelector(".plain");
        return `- **${label}**：${chips || (plain ? plain.textContent : "—")}`;
      }).join("\n");
      copyText(lines, "脚本总结");
    });
    document.getElementById("copyScene").addEventListener("click", () => {
      const lines = [...document.querySelectorAll(".scene-group")].map(g => {
        const label = g.querySelector(".scene-label").firstChild.textContent.trim();
        return `- ${label}：${g.querySelectorAll(".scene-img").length} 张缩略图`;
      }).join("\n");
      copyText(lines, "画面总结");
    });

    // 字段 chip 联动：hover 高亮 + 点击切换 active
    document.querySelectorAll("#scriptFields .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const text = chip.textContent;
        const matched = [...document.querySelectorAll("#shotGrid .shot-card")].filter(card =>
          card.textContent.includes(text)
        );
        matched.forEach(card => {
          card.style.outline = "2px solid #797cf4";
          card.style.outlineOffset = "2px";
        });
        setTimeout(() => matched.forEach(card => {
          card.style.outline = "";
          card.style.outlineOffset = "";
        }), 1500);
        showToast(`已在分镜中定位「${text}」`);
      });
    });

    // 画面缩略图 → 跳到对应时间
    document.querySelectorAll(".scene-strip .scene-img").forEach(img => {
      img.addEventListener("click", () => {
        const t = img.querySelector("span").textContent;
        const row = [...document.querySelectorAll("#transcriptList .transcript-row")]
          .find(r => r.dataset.time === t);
        if (row) {
          [...document.querySelectorAll("#transcriptList .transcript-row")].forEach(r => r.classList.remove("active"));
          row.classList.add("active");
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          showToast(`已定位到 ${t}`);
        } else {
          showToast(`画面时间 ${t}，无对应口播`);
        }
      });
    });

    // 口播行点击 → 联动画面 + 高亮分镜
    document.querySelectorAll("#transcriptList .transcript-row").forEach(row => {
      row.addEventListener("click", () => {
        [...document.querySelectorAll("#transcriptList .transcript-row")].forEach(r => r.classList.remove("active"));
        row.classList.add("active");
        const time = row.dataset.time;
        // 找该时间段所在分镜
        const tSec = parseInt(time.split(":")[1], 10);
        const card = [...document.querySelectorAll("#shotGrid .shot-card")].find(c => {
          const range = c.querySelector(".time-range").textContent;
          const m = range.match(/(\d+):(\d+)–(\d+):(\d+)/);
          if (!m) return false;
          const s1 = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
          const s2 = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
          return tSec >= s1 && tSec <= s2;
        });
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.style.outline = "2px solid #ff9d6c";
          card.style.outlineOffset = "2px";
          setTimeout(() => { card.style.outline = ""; card.style.outlineOffset = ""; }, 1500);
        }
      });
    });

    // 分镜 Tab 切换
    document.querySelectorAll(".storyboard-tabs .tab-mini").forEach(t => {
      t.addEventListener("click", () => {
        document.querySelectorAll(".storyboard-tabs .tab-mini").forEach(x => x.classList.toggle("active", x === t));
        const target = t.dataset.tab;
        document.querySelectorAll(".storyboard-panel").forEach(p => p.hidden = p.dataset.tabPanel !== target);
      });
    });

    // 一键下载
    document.getElementById("oneClickDownload").addEventListener("click", () => {
      const data = {
        video: "下载.mp4",
        duration: (document.getElementById("resultDuration") || {}).textContent,
        time: (document.getElementById("resultTime") || {}).textContent,
        transcript: [...document.querySelectorAll("#transcriptList .transcript-row")].map(r => ({
          time: r.querySelector("span").textContent, text: r.querySelector("div").textContent
        })),
        shots: [...document.querySelectorAll("#shotGrid .shot-card")].map(c => ({
          time: c.querySelector(".time-range").textContent,
          duration: c.querySelector(".duration").textContent,
          desc: c.querySelector(".desc").textContent,
          script: c.querySelector(".script-text").textContent
        }))
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "拉片结果.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("已下载 拉片结果.json");
    });

    // 下载视频
    document.getElementById("downloadVideo").addEventListener("click", e => {
      e.preventDefault();
      showToast("原视频下载已开始（演示）");
    });
    } // end if(backToEntry) — 新拉片页跳过旧交互

    // 初始化入口页列表
    renderVideoList();

    // 演示模式：URL 加 ?demo=<key> 自动触发，方便截图/演示
    (function () {
      const params = new URLSearchParams(location.search);
      const demo = params.get("demo");
      if (!demo) return;
      function tryAction(key, fn) { if (key === demo) setTimeout(fn, 50); }
      tryAction("library", () => document.querySelector('.source-tab[data-source="library"]').click());
      tryAction("upload", () => document.querySelector('.source-tab[data-source="upload"]').click());
      tryAction("history", () => document.getElementById("openHistory").click());
      tryAction("sample", () => goToSampleResult());
      tryAction("library-picked", () => {
        document.querySelector('.source-tab[data-source="library"]').click();
        setTimeout(() => {
          document.querySelectorAll('.library-pick-card')[0].click();
          document.querySelectorAll('.library-pick-card')[2].click();
          document.getElementById('confirmLibrary').click();
        }, 80);
      });
      tryAction("progress", () => {
        const ta = document.getElementById('linkInput');
        ta.value = 'https://v.douyin.com/abcd1234/\nhttps://www.douyin.com/video/1234567890\nhttps://www.iesdouyin.com/share/video/abcdef/';
        document.getElementById('addLinks').click();
        setTimeout(() => document.getElementById('startParse').click(), 120);
      });
      tryAction("result", () => {
        const ta = document.getElementById('linkInput');
        ta.value = 'https://v.douyin.com/abcd1234/\nhttps://www.douyin.com/video/1234567890';
        document.getElementById('addLinks').click();
        setTimeout(() => {
          document.getElementById('startParse').click();
        }, 120);
      });
      tryAction("frame", () => {
        switchPage("pull");
        setTimeout(() => document.querySelector('.tab-mini[data-tab="frame"]').click(), 80);
      });
    })();

    const agentCards = [...document.querySelectorAll(".agent-card[data-agent]")];
    const agentBrowser = document.getElementById("agentBrowser");
    const agentFilters = [...document.querySelectorAll(".agent-filter")];
    const agentGrid = document.getElementById("agentGrid");
    const newCreateButton = document.querySelector(".new-chat");
    const newCreatePopover = document.getElementById("newCreatePopover");
    const newCreateOptions = [...document.querySelectorAll("[data-create-agent-type], [data-create-page]")];

    function filterAgents(category) {
      let visibleCount = 0;
      document.querySelectorAll("#agentGrid .agent-card").forEach(card => {
        const visible = category === "all" || card.dataset.category === category;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      agentFilters.forEach(filter => {
        const active = filter.dataset.agentFilter === category;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-selected", String(active));
      });
      agentGrid.classList.toggle("is-filtered", category !== "all");
      agentGrid.style.setProperty("--filtered-count", String(Math.max(1, Math.min(3, visibleCount))));
      agentGrid.scrollTo({ left: 0, behavior: "smooth" });
    }

    agentFilters.forEach(filter => filter.addEventListener("click", () => filterAgents(filter.dataset.agentFilter)));

    function positionNewCreatePopover() {
      if (newCreatePopover.hidden) return;
      const rect = newCreateButton.getBoundingClientRect();
      const width = Math.min(368, window.innerWidth - 24);
      const preferredLeft = rect.right + 12;
      const left = Math.min(preferredLeft, window.innerWidth - width - 12);
      const top = Math.max(12, Math.min(rect.top, window.innerHeight - Math.min(640, window.innerHeight - 24)));
      newCreatePopover.style.width = `${width}px`;
      newCreatePopover.style.left = `${Math.max(12, left)}px`;
      newCreatePopover.style.top = `${top}px`;
    }

    function setNewCreateMenu(open) {
      newCreatePopover.hidden = !open;
      newCreateButton.setAttribute("aria-expanded", String(open));
      if (open) requestAnimationFrame(positionNewCreatePopover);
    }

    const agentPill = document.querySelector("#agentPill .agent-pill-label");
    const agentPillButton = document.getElementById("agentPill");
    const agentPicker = document.getElementById("agentPicker");
    const agentPopover = document.getElementById("agentPopover");
    const agentOptions = [...document.querySelectorAll(".agent-option")];
    const modelSelect = document.getElementById("modelSelect");
    const modelPicker = document.getElementById("modelPicker");
    const modelTrigger = document.getElementById("modelTrigger");
    const modelTriggerText = document.getElementById("modelTriggerText");
    const modelOptionList = document.getElementById("modelOptionList");
    const modelModeLabel = document.getElementById("modelModeLabel");
    const sendPromptButton = document.getElementById("sendPrompt");
    const modal = document.getElementById("agentModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalIntro = document.getElementById("modalIntro");
    const agentProcess = document.getElementById("agentProcess");
    const dynamicForm = document.getElementById("dynamicForm");
    const formFeedback = document.getElementById("formFeedback");
    const saveProductButton = document.getElementById("saveProductButton");
    const contextStatus = document.getElementById("contextStatus");
    let activeAgent = "";
    let activeType = "";
    let agentSelectionPending = false;
    const productCatalog = {
      "mite-pro": {
        name: "轻净 Pro 除螨仪",
        brand: "轻净",
        category: "清洁电器",
        code: "SPU-QJ-MITE-PRO",
        status: "在售",
        assetCount: "关联资产 18",
        core: "大吸力深层清洁，拍打吸尘同步完成",
        secondary: "透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用",
        difference: "清洁效果可视化，操作完成后尘杯清理方便",
        audiences: ["宝妈家庭", "养宠家庭"],
        psychology: ["风险规避", "理性求证"],
        facts: "已读取产品卖点、关联资产和 18 个禁用表达"
      },
      "air-a8": {
        name: "轻享空气炸锅 A8",
        brand: "轻享",
        category: "厨房电器",
        code: "SPU-QX-AIR-A8",
        status: "在售",
        assetCount: "关联资产 15",
        core: "可视化烹饪窗口，少翻面也能掌握食物状态",
        secondary: "大容量满足家庭用餐，炸篮可拆洗",
        difference: "烹饪过程看得见，降低反复开盖造成的热量流失",
        audiences: ["宝妈家庭", "精致生活人群"],
        psychology: ["省时省力", "家庭关怀"],
        facts: "已读取产品卖点、关联资产和 15 个禁用表达"
      },
      "washer-s5": {
        name: "净界洗地机 S5",
        brand: "净界",
        category: "清洁电器",
        code: "SPU-JJ-WASHER-S5",
        status: "在售",
        assetCount: "关联资产 21",
        core: "吸拖洗一体，一次完成地面干湿垃圾清洁",
        secondary: "滚刷自清洁，减少清洁工具二次处理",
        difference: "复杂地面污渍一次推进处理，缩短家庭清洁链路",
        audiences: ["宝妈家庭", "养宠家庭", "精致生活人群"],
        psychology: ["省时省力", "理性求证"],
        facts: "已读取产品卖点、关联资产和 21 个禁用表达"
      },
      "blend-mini": {
        name: "随行榨汁杯 Mini",
        brand: "随行",
        category: "厨房电器",
        code: "SPU-SX-BLEND-MINI",
        status: "在售",
        assetCount: "关联资产 9",
        core: "便携随行，一键启动即可完成日常果蔬搅拌",
        secondary: "杯体轻巧，支持充电使用和拆洗",
        difference: "适合通勤、健身和办公室等临时饮用场景",
        audiences: ["通勤人群", "健身人群", "精致生活人群"],
        psychology: ["省时省力", "尝鲜心理"],
        facts: "已读取产品卖点、关联资产和 9 个禁用表达"
      }
    };
    const creationContext = {
      productId: "",
      productName: "",
      productSource: "library",
      productConfirmed: false,
      productSaved: true,
      originalFields: { marketingScene: "直播间引流" },
      customPresets: []
    };
    const copywritingModelCatalog = [
      { value:"gpt-5-6-terra", label:"GPT-5.6 Terra", group:"推荐模型", recommended:true },
      { value:"claude-sonnet-5", label:"Claude Sonnet 5", group:"国外模型" },
      { value:"gemini-3-6-flash", label:"Gemini 3.6 Flash", group:"国外模型" },
      { value:"doubao-seed-2-pro", label:"豆包 Seed 2.0 Pro", group:"国内模型" },
      { value:"deepseek-v4-pro", label:"DeepSeek V4 Pro", group:"国内模型" },
      { value:"qwen-3-7-max", label:"通义千问 Qwen3.7-Max", group:"国内模型" }
    ];
    const fixedCopywritingModel = copywritingModelCatalog[0];
    const copyStructureCatalog = [
      {
        id:"cs-qc-result", name:"结果前置·痛点解决·行动引导型", formula:"结果前置 → 痛点放大 → 能力证明 → 行动引导", source:"qianchuan", level:"product", products:["轻净 Pro 除螨仪"], updated:"08-05 10:32",
        related:[
          { id:"7553983811703193643", video:"轻净 Pro 除螨仪｜结果冲击型", product:"轻净 Pro 除螨仪", spend:328460, copy:"你以为床垫看着干净就够了吗？实际走一遍才知道，藏在纤维深处的细小灰尘根本不是换床单能解决的。轻净 Pro 除螨仪拍打和吸尘同步进行，透明尘杯里吸出了什么，清洁结果当场就能看见。床垫、沙发和布艺都能用，尘杯还能拆下来清洗。想看完整清洁过程，点进商品看实测。" },
          { id:"7553983811703195012", video:"床褥清洁前后对比｜主视频", product:"轻净 Pro 除螨仪", spend:271930, copy:"刚换完床单，不代表床垫深处真的干净。先别听我讲参数，直接看轻净 Pro 除螨仪走完一遍后的尘杯。它通过高频拍打把深处碎屑带出来，再同步吸走，清洁前后差别不用猜。家里有孩子或者宠物，床垫和沙发都可以定期这样处理。" }
        ]
      },
      {
        id:"cs-qc-scene", name:"场景代入·功能证明·优惠收口型", formula:"场景代入 → 问题呈现 → 功能证明 → 优惠收口", source:"qianchuan", level:"product", products:["轻享空气炸锅 A8"], updated:"08-05 09:48",
        related:[
          { id:"7553983811703197228", video:"空气炸锅晚餐场景｜可视窗口", product:"轻享空气炸锅 A8", spend:198760, copy:"下班回家不想守在厨房，就把食材放进轻享空气炸锅 A8。可视窗口能直接看到上色情况，不用反复开盖，家庭容量一次就能做够。炸篮用完可以拆洗，今晚直播间还有配套赠品，具体优惠以页面展示为准。" }
        ]
      },
      {
        id:"cs-qc-audience", name:"人群点名·卖点展开·产品推荐型", formula:"人群点名 → 需求唤醒 → 卖点展开 → 产品推荐", source:"qianchuan", level:"general", products:[], updated:"08-04 18:20",
        related:[
          { id:"7553983811703198416", video:"家庭清洁人群点名｜通用结构", product:"净界洗地机 S5", spend:156420, copy:"家里有孩子又有宠物的，日常地面清洁最怕干湿垃圾分开处理。净界洗地机 S5把吸、拖、洗放在一次推进里完成，滚刷还能自清洁，减少清洁工具的二次处理。想缩短每天的清洁链路，可以先看它的完整演示。" }
        ]
      },
      {
        id:"cs-custom-contrast", name:"反差开场·实测证明·行动引导型", formula:"反差开场 → 过程实测 → 结果证明 → 行动引导", source:"custom", level:"general", products:[], updated:"08-03 15:16", related:[]
      }
    ];

    // 文案结构 → 适用风格(用于脚本类型 chip 联动过滤)
    copyStructureCatalog.forEach(item => {
      if (item.scriptTypes) return;
      if (item.id === "cs-qc-result") item.scriptTypes = ["痛点类型","活动类型","对比类型","点名人群类型","网络爆款音频类型","正话反说类型"];
      else if (item.id === "cs-qc-scene") item.scriptTypes = ["打感情类型","种草类型","活动类型","网络爆款音频类型"];
      else if (item.id === "cs-qc-audience") item.scriptTypes = ["点名人群类型","痛点类型","打感情类型"];
      else if (item.id === "cs-custom-contrast") item.scriptTypes = ["对比类型","制造焦虑类型","正话反说类型","种草类型","引发好奇类型"];
      else item.scriptTypes = [];
    });

    // 文案风格 → 默认匹配的文案结构 ID(空 = 让 AI 智能匹配)
    const SCRIPT_TYPE_DEFAULT_STRUCTURE = {
      "痛点类型":         "cs-qc-result",
      "活动类型":         "cs-qc-result",
      "悬疑类型":         "",
      "打感情类型":       "cs-qc-scene",
      "对比类型":         "cs-custom-contrast",
      "种草类型":         "cs-qc-scene",
      "制造焦虑类型":     "cs-custom-contrast",
      "明星文案类型":     "",
      "点名人群类型":     "cs-qc-audience",
      "正话反说类型":     "cs-custom-contrast",
      "品牌类型":         "",
      "网络爆款音频类型": "cs-qc-result",
      "引发好奇类型":     "cs-custom-contrast"
    };

    const modelOptions = {
      text: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内模型">
          <option value="doubao-seed-2-pro">豆包 Seed 2.0 Pro</option>
          <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
          <option value="qwen-3-7-max">通义千问 Qwen3.7-Max</option>
        </optgroup>
        <optgroup label="国外模型">
          <option value="gpt-5-6-terra">GPT-5.6 Terra</option>
          <option value="claude-sonnet-5">Claude Sonnet 5</option>
          <option value="gemini-3-6-flash">Gemini 3.6 Flash</option>
        </optgroup>
      `,
      multimodal: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内多模态模型">
          <option value="doubao-seed-2-pro">豆包 Seed 2.0 Pro</option>
          <option value="qwen-3-5-omni-plus">通义千问 Qwen3.5-Omni-Plus</option>
        </optgroup>
        <optgroup label="国际多模态模型">
          <option value="gpt-5-6-terra">GPT-5.6 Terra</option>
          <option value="claude-sonnet-5">Claude Sonnet 5</option>
          <option value="gemini-3-6-flash">Gemini 3.6 Flash</option>
        </optgroup>
      `,
      image: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内图片模型">
          <option value="seedream-4">豆包 Seedream 4.0</option>
          <option value="jimeng-image-3">即梦图片 3.0</option>
          <option value="qwen-image">通义万相 Qwen-Image</option>
        </optgroup>
        <optgroup label="国际图片模型">
          <option value="gpt-image-1">GPT Image 1</option>
          <option value="gemini-image">Gemini Image</option>
        </optgroup>
      `,
      video: `
        <option value="mix-v16">内容罗盘混剪引擎 V16（推荐）</option>
        <optgroup label="国内 AI 补镜模型">
          <option value="seedance-2">Seedance 2.0</option>
          <option value="kling">可灵视频模型</option>
          <option value="vidu">Vidu 视频模型</option>
        </optgroup>
        <optgroup label="国际 AI 补镜模型">
          <option value="veo-3-1">Google Veo 3.1</option>
          <option value="openai-video">OpenAI 视频模型</option>
        </optgroup>
      `,
      videoGeneration: `
        <option value="seedance-2">Seedance 2.0（推荐）</option>
        <optgroup label="国内视频生成模型">
          <option value="kling">可灵视频模型</option>
          <option value="vidu">Vidu 视频模型</option>
        </optgroup>
        <optgroup label="国际视频生成模型">
          <option value="veo-3-1">Google Veo 3.1</option>
          <option value="openai-video">OpenAI 视频模型</option>
        </optgroup>
      `
    };

    const modelDescriptions = {
      auto: "根据任务质量、速度和成本自动选择最合适的模型",
      "doubao-seed-2-pro": "中文理解与营销表达能力均衡，适合口播和脚本生成",
      "deepseek-v4-pro": "逻辑推理与长文本改写能力突出",
      "qwen-3-7-max": "中文内容生成稳定，适合批量创作文案",
      "qwen-3-5-omni-plus": "支持图文与视频理解，适合脚本拆解和镜头分析",
      "gpt-5-6-terra": "综合创作与指令遵循能力强，适合复杂内容任务",
      "claude-sonnet-5": "长文本结构和自然表达表现稳定",
      "gemini-3-6-flash": "多模态理解速度快，适合参考素材分析",
      "mix-v16": "从素材库匹配镜头并完成字幕、配音、包装和混剪",
      "seedance-2": "适合生成补充镜头，兼顾画面质量与运动表现",
      kling: "适合产品演示和写实场景补镜",
      vidu: "适合快速生成短镜头和创意转场",
      "veo-3-1": "适合高质量复杂场景和电影感镜头",
      "openai-video": "适合创意画面与多镜头视频生成"
      ,"seedream-4": "商品图细节和中文电商视觉表现稳定",
      "jimeng-image-3": "适合批量生成写实商品场景和活动视觉",
      "qwen-image": "适合中文海报、卖点排版和图文模块",
      "gpt-image-1": "适合复杂画面重构和高质量商品视觉",
      "gemini-image": "适合结合参考图进行创作与编辑"
    };

    const modelModeLabels = {
      text: "文案生成模型",
      multimodal: "多模态理解模型",
      image: "图片生成模型",
      video: "混剪与视频模型",
      videoGeneration: "视频生成模型"
    };

    function getModelMode(type) {
      if (type === "image-main" || type === "image-detail") return "image";
      if (type === "mix") return "video";
      if (type === "script" || type === "script-copy") return "multimodal";
      return "text";
    }

    function renderModelOptions(type) {
      const mode = getModelMode(type);
      modelSelect.innerHTML = modelOptions[mode] || modelOptions.text;
      modelSelect.disabled = false;
      modelTrigger.disabled = false;
      modelModeLabel.textContent = modelModeLabels[mode];
      renderModelPickerOptions();
    }

    function selectedModelLabel() {
      return modelSelect.options[modelSelect.selectedIndex]?.text || "自动优选";
    }

    function renderModelPickerOptions() {
      const selectedValue = modelSelect.value;
      const blocks = [];
      [...modelSelect.children].forEach(node => {
        if (node.tagName === "OPTGROUP") {
          blocks.push(`<div class="model-group-title">${node.label}</div>`);
          [...node.children].forEach(option => blocks.push(renderModelOption(option, selectedValue)));
        } else if (node.tagName === "OPTION") {
          blocks.push(renderModelOption(node, selectedValue));
        }
      });
      modelOptionList.innerHTML = blocks.join("");
      modelTriggerText.textContent = selectedModelLabel();
    }

    function renderModelOption(option, selectedValue) {
      const selected = option.value === selectedValue;
      const recommended = option.value === "auto" || option.value === "mix-v16" || option.value === "seedance-2";
      return `
        <button class="model-option${selected ? " selected" : ""}" type="button" data-model-value="${option.value}" role="option" aria-selected="${selected}">
          <span class="model-option-icon">${option.value === "mix-v16" ? "剪" : option.value === "auto" ? "智" : "✦"}</span>
          <span class="model-option-copy">
            <span class="model-option-name">${option.text}${recommended ? "<em>推荐</em>" : ""}</span>
            <span class="model-option-desc">${modelDescriptions[option.value] || "适用于当前创作任务"}</span>
          </span>
          <span class="model-option-check">${selected ? "✓" : ""}</span>
        </button>
      `;
    }

    function setModelPicker(open) {
      modelPicker.classList.toggle("open", open);
      modelTrigger.setAttribute("aria-expanded", String(open));
    }

    const productOptions = `
      <option value="mite-pro">轻净 Pro 除螨仪</option>
      <option value="air-a8">轻享空气炸锅 A8</option>
      <option value="washer-s5">净界洗地机 S5</option>
    `;

    const SCRIPT_VOICE_OPTIONS = [
      ["陈子建·公版", "陈", "沉稳男声"], ["许念·公版", "许", "温柔女声"],
      ["阿乐·公版", "乐", "自然男声"], ["周雨桐·公版", "周", "明快女声"],
      ["方圆·公版", "方", "亲和女声"], ["高远·公版", "高", "专业男声"],
      ["夏语薇·公版", "夏", "轻快女声"], ["陈海峰·公版", "海", "磁性男声"]
    ];
    function scriptVoiceOptionsHtml() {
      return SCRIPT_VOICE_OPTIONS.map(([name, avatar, tone], index) => `<div class="script-voice-choice"><button class="script-voice-select${index === 0 ? " active" : ""}" type="button" data-script-voice-option="${name}" aria-pressed="${index === 0}"><span class="script-voice-avatar" aria-hidden="true">${avatar}</span><span class="script-voice-meta"><b>${name}</b><small>${tone}</small></span><i>✓</i></button><button class="script-voice-preview" type="button" data-script-voice-preview="${name}" aria-label="试听 ${name}"><span>▶</span><em>试听</em></button></div>`).join("");
    }

    const agentConfigs = {
      "image-main": {
        intro: "将产品图、核心卖点和投放目标转成一组可用于商品卡或图文推广的商品主图。",
        process: "读取产品信息与图片 → 选择主图表达策略 → 调用图片模型生成多版 → 检查商品主体和文字信息 → 输出可继续编辑的图片资产。",
        placeholder: "还可以补充：保留白色产品主体，画面更干净；突出可水洗尘杯，但不要写价格……",
        request: "为轻净 Pro 除螨仪生成 3 张商品主图，突出深层清洁和可水洗尘杯，用于商品卡推广。",
        version: "商品主图 V1", summary: "已生成 3 张商品主图方案，产品主体、核心卖点和版式策略可继续调整。",
        form: `<section class="form-section"><div class="form-section-head"><div><strong>产品与主图目标</strong><small>产品库中的产品图和卖点会自动带入，也可以在本次任务中补充</small></div></div><div class="section-grid"><div class="field full"><label>创作产品 *</label><select data-product-select>${productOptions}</select></div><div class="field"><label>主图用途 *</label><select><option>商品卡推广</option><option>图文推广</option><option>商品链接首图</option></select></div><div class="field"><label>输出数量 *</label><select><option>3 张</option><option>5 张</option></select></div><div class="field full"><label>优先表达的核心卖点 *</label><textarea data-field="core">大吸力深层清洁，拍打吸尘同步完成</textarea></div><div class="field full"><label>产品图</label><div class="upload-box"><strong>从产品库读取产品图 · 可补充上传</strong><span>商品主体会作为生成约束，避免生成错误外观</span></div></div></div></section><section class="form-section"><div class="form-section-head"><div><strong>画面要求</strong><small>定义本组图片的创作方向，后续可在结果中继续修改</small></div></div><div class="section-grid"><div class="field"><label>画面风格 *</label><select><option>干净电商白底</option><option>真实家庭场景</option><option>功能演示场景</option><option>活动氛围图</option></select></div><div class="field"><label>画面比例 *</label><select><option>1:1 方图</option><option>3:4 竖图</option><option>9:16 竖图</option></select></div><div class="field full"><label>画面补充要求</label><textarea>产品主体清晰，卖点只表达产品档案中已有的信息；不生成价格、夸大功效或无法确认的对比。</textarea></div></div></section>`,
        result: `<div class="result-section-title">本次生成图片</div><div class="result-grid"><div class="result-card"><div class="result-meta"><span class="badge">主图 A</span><span class="badge green">结果冲击</span></div><p><strong>尘杯脏污可视化</strong><br>以产品主体 + 尘杯近景呈现“清洁结果”，适合商品卡首图。</p></div><div class="result-card"><div class="result-meta"><span class="badge">主图 B</span><span class="badge green">功能表达</span></div><p><strong>拍打吸尘同步完成</strong><br>用床垫使用场景呈现核心能力，产品主体保持清晰。</p></div><div class="result-card"><div class="result-meta"><span class="badge">主图 C</span><span class="badge green">使用便利</span></div><p><strong>尘杯可拆卸水洗</strong><br>突出可水洗尘杯，补强下单前的便利性理由。</p></div></div><div class="result-actions"><button class="soft-btn action-save">保存到图片库</button><button class="ghost-btn action-variant">继续生成同类图片</button></div>`
      },
      "image-detail": {
        intro: "将产品卖点拆成有清晰阅读顺序的详情页图片模块，输出后可继续编辑和复用。",
        process: "读取产品事实 → 选择详情页模块 → 组织卖点与画面 → 调用图片模型生成 → 输出可编辑的详情页图文资产。",
        placeholder: "还可以补充：第一张先讲床褥深层清洁，后面再解释拍打吸尘；所有图保持同一配色……",
        request: "为轻净 Pro 除螨仪生成 4 张详情页图片，依次展示深层清洁、拍打吸尘、可水洗尘杯和适用场景。",
        version: "商品详情页 V1", summary: "已按卖点顺序生成 4 个详情页模块，可直接保存或继续改图。",
        form: `<section class="form-section"><div class="form-section-head"><div><strong>产品与详情页模块</strong><small>从产品库读取卖点与关联图片；选择本次需要生产的详情页内容</small></div></div><div class="section-grid"><div class="field full"><label>创作产品 *</label><select data-product-select>${productOptions}</select></div><div class="field full"><label>生成模块 *（可多选）</label><div class="choice-row"><span class="choice-chip active">核心卖点</span><span class="choice-chip active">功能演示</span><span class="choice-chip">使用场景</span><span class="choice-chip">参数说明</span><span class="choice-chip">购买理由</span></div></div><div class="field"><label>输出数量 *</label><select><option>4 张</option><option>6 张</option><option>8 张</option></select></div><div class="field"><label>图片比例 *</label><select><option>750 × 1000</option><option>750 × 750</option><option>1080 × 1440</option></select></div><div class="field full"><label>本次优先卖点</label><textarea data-field="core">大吸力深层清洁；拍打吸尘同步完成；透明尘杯可拆卸水洗</textarea></div></div></section><section class="form-section"><div class="form-section-head"><div><strong>画面与文案约束</strong><small>统一本次详情页的视觉和表达，已有图片可作为参考，不覆盖产品事实</small></div></div><div class="section-grid"><div class="field"><label>页面风格</label><select><option>简洁功能说明</option><option>场景化卖点展示</option><option>专业参数说明</option></select></div><div class="field"><label>关联图片来源</label><select><option>产品库图片优先</option><option>指定图片库素材</option><option>本次补充上传</option></select></div><div class="field full"><label>补充要求</label><textarea>按“一个模块只讲一个重点”组织；保留产品品牌和外观一致；不写入产品库没有的参数、优惠或功效。</textarea></div></div></section>`,
        result: `<div class="result-section-title">详情页模块</div><div class="result-grid"><div class="result-card"><div class="result-meta"><span class="badge">模块 1</span><span class="badge green">核心卖点</span></div><p><strong>深层清洁</strong><br>场景问题 → 产品使用 → 清洁结果，适合首屏建立购买理由。</p></div><div class="result-card"><div class="result-meta"><span class="badge">模块 2</span><span class="badge green">功能演示</span></div><p><strong>拍打吸尘同步</strong><br>将产品动作与尘杯结果分层呈现，强化能力理解。</p></div><div class="result-card"><div class="result-meta"><span class="badge">模块 3</span><span class="badge green">使用便利</span></div><p><strong>尘杯可拆卸水洗</strong><br>通过步骤型画面说明日常清理方式。</p></div></div><div class="result-actions"><button class="soft-btn action-save">保存到图片库</button><button class="ghost-btn action-variant">补充更多模块</button></div>`
      },
      original: {
        intro: "从产品事实出发，生成适合千川短视频的多版本口播文案。系统会控制单一测试变量，便于连续生产同一产品的不同内容。",
        process: "读取产品档案 → 调用产品级爆款结构与正负样本策略 → 生成单变量 A/B 文案 → 校验卖点、禁用词和时长。",
        placeholder: "还可以补充：口语更直接、卖点前置、第一句不要提问……",
        request: "为轻净 Pro 除螨仪生成 3 条暑期投放文案，只改变前 3 秒钩子，突出深层清洁和可水洗尘杯。",
        version: "产品策略 V18",
        summary: "已生成 3 条可独立测试的口播文案。本轮仅改变前 3 秒钩子，正文卖点顺序、优惠表达与 CTA 保持一致。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>产品与核心卖点</strong><small>默认从产品库读取；也可通过商品链接识别或手动输入</small></div><div class="source-tabs" aria-label="产品来源"><button class="source-tab active" type="button" data-product-source="library">产品库</button><button class="source-tab" type="button" data-product-source="link">商品链接</button><button class="source-tab" type="button" data-product-source="manual">手动输入</button></div></div>
            <div class="section-grid">
              <div class="product-source-panel" data-product-source-panel="library">
                <div class="field full"><label>创作产品 *</label><select data-product-select data-required>${productOptions}</select><span class="field-hint" data-product-fact-hint>已读取产品卖点、关联资产和禁用表达</span></div>
              </div>
              <div class="product-source-panel" data-product-source-panel="link" hidden>
                <div class="field full"><label>商品链接 *</label><div class="inline-control"><input data-product-link placeholder="粘贴抖店商品链接"><button class="soft-btn" type="button" data-action="recognize-product">AI 识别产品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div>
              </div>
              <div class="product-source-panel" data-product-source-panel="manual" hidden>
                <div class="field full"><label>产品名称 *</label><input data-manual-product-name placeholder="输入产品名称"></div>
              </div>
              <div class="field full"><div class="field-label-row"><label>核心卖点 *</label><button class="text-action" type="button" data-action="refine-selling-points">AI 卖点提炼</button></div><textarea data-field="core" data-required>大吸力深层清洁，拍打吸尘同步完成</textarea><div class="inline-feedback success" data-selling-feedback hidden></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>本次创作</strong><small>只保留最常用参数，其他信息放在高级设置</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>文案风格 *</label><div class="choice-row" data-single="style" data-role="style"><span class="choice-chip active">不限</span><span class="choice-chip">引发好奇</span><span class="choice-chip">痛点类型</span><span class="choice-chip">活动类型</span><span class="choice-chip">悬疑类型</span><span class="choice-chip">打感情类型</span><span class="choice-chip">对比类型</span><span class="choice-chip">种草类型</span><span class="choice-chip">网络爆款音频类型</span><span class="choice-chip">制造焦虑类型</span><span class="choice-chip">明星文案类型</span><span class="choice-chip">点名人群类型</span><span class="choice-chip">正话反说类型</span><span class="choice-chip">品牌类型</span></div></div>
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="300" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 1 分 15 秒</b></div></div>
              <div class="field"><label>生成数量 *</label><select><option>3 条</option><option>5 条</option></select></div>
              <div class="field full"><label>本轮主测变量 *</label><div class="choice-row" data-single="variable"><span class="choice-chip active">前 3 秒钩子</span><span class="choice-chip">卖点顺序</span><span class="choice-chip">人群切口</span><span class="choice-chip">CTA</span></div></div>
              <details class="advanced-block">
                <summary>高级设置：卖点、人群、CTA与禁用表达</summary>
                <div class="section-grid advanced-content">
                  <div class="field"><label>核心次要卖点</label><textarea data-field="secondary">透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用</textarea></div>
                  <div class="field"><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
                  <div class="field full"><label>营销利益点</label><textarea data-field="marketing">暑期活动，到手赠送 3 个替换滤网</textarea><div class="quick-tags" data-marketing-tags><button class="quick-tag" type="button" data-marketing-value="限时折扣">限时折扣</button><button class="quick-tag" type="button" data-marketing-value="直播专享">直播专享</button><button class="quick-tag" type="button" data-marketing-value="今日特惠">今日特惠</button><button class="quick-tag active" type="button" data-marketing-value="赠送3个替换滤网">赠品</button><button class="quick-tag" type="button" data-marketing-value="拍一发三">拍一发三</button></div><span class="field-hint">营销信息只用于本次创作，不写入长期产品事实</span></div>
                  <div class="field full"><div class="field-label-row"><label>目标人群</label><button class="text-action" type="button" data-action="recommend-audience">AI 推荐人群</button></div><div class="audience-box" data-audience-box><button class="audience-chip active" type="button">宝妈家庭</button><button class="audience-chip active" type="button">养宠家庭</button><button class="audience-chip" type="button">易敏人群</button><button class="audience-chip" type="button">租房人群</button><button class="audience-chip" type="button">精致生活人群</button></div><div class="inline-control" style="margin-top:8px;"><input data-custom-audience placeholder="输入自定义人群"><button class="soft-btn" type="button" data-action="add-audience">添加人群</button></div></div>
                  <div class="field"><label>CTA 要求</label><input data-field="cta" value="引导进入直播间了解，不制造虚假紧迫感"></div>
                  <div class="field"><label>不希望出现的表达</label><input data-field="forbidden" value="绝对化功效、最低价、未经确认的除菌率"></div>
                  <div class="field full"><label>补充要求</label><textarea data-field="extra">短句、断句、口语化；不要使用提问式开场，不虚构功效和优惠。</textarea></div>
                  <div class="field full"><label>创作预设</label><div class="preset-row"><select data-creation-preset><option value="">选择已有预设</option><option value="summer-conversion">暑期成交｜宝妈家庭｜痛点直给</option><option value="pet-hard-ad">养宠家庭｜硬广直给｜证据先行</option></select><button class="soft-btn" type="button" data-action="save-preset">保存当前为预设</button></div><div class="inline-feedback success" data-preset-feedback hidden></div></div>
                </div>
              </details>
            </div>
          </section>
        `,
        result: `
          <div class="result-grid">
            <div class="result-card">
              <div class="result-meta"><span class="badge orange">A｜结果冲击</span><span class="badge gray">31 秒</span><span class="badge green">事实已校验</span></div>
              <p><strong>床单看着干净，不代表真的干净。</strong>这个除螨仪在床上走一遍，藏在织物里的毛发、碎屑都能吸进尘杯。大吸力配合拍打，把清洁从表面做到深处；用完尘杯还能直接水洗，日常清理不费劲。</p>
            </div>
            <div class="result-card">
              <div class="result-meta"><span class="badge orange">B｜人群点名</span><span class="badge gray">32 秒</span><span class="badge green">事实已校验</span></div>
              <p><strong>家里有孩子、宠物的，床铺别只用粘毛器。</strong>轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑，尘杯可拆可水洗。每天睡前推一遍，床垫、沙发和布艺都能清洁。</p>
            </div>
            <div class="result-card">
              <div class="result-meta"><span class="badge orange">C｜场景冲突</span><span class="badge gray">30 秒</span><span class="badge green">事实已校验</span></div>
              <p><strong>刚换的床单，第一遍照样能吸出一杯脏东西。</strong>不是床单没洗净，是毛发和碎屑会藏进织物深处。用它边拍边吸，再把尘杯拆下水洗，卧室清洁一步完成。</p>
            </div>
          </div>
          <div class="result-note"><strong>变量控制：</strong>三版仅更换开场钩子；“问题证据 → 产品能力 → 使用便利 → 行动引导”的正文结构一致，可直接进入同产品素材测试。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存 3 条到文案库</button><button class="ghost-btn action-script">选择文案转脚本</button><button class="ghost-btn action-variant">继续生成同类版本</button></div>
        `
      },
      copy: {
        intro: "先拆解参考爆款的钩子、结构和节奏，再用当前产品事实重新表达。保留的是创作方法，不复制原文或未经证实的卖点。",
        process: "解析参考素材 → 提取钩子、节奏和内容结构 → 与目标产品事实映射 → 生成原创版本并标明保留项与替换项。",
        placeholder: "还可以补充：保留冲突式开场，但不要沿用原素材的价格表达……",
        request: "从视频库选择参考视频，为轻净 Pro 除螨仪生成 3 条原创仿写文案。",
        version: "仿写方法 V12",
        summary: "已完成参考素材结构拆解，并将可复用方法映射到当前产品。未复制原句，未迁移参考商品的功效、参数或优惠。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>参考爆款</strong><small>内部千川素材可读取文案；外部内容仅作为创意参考</small></div></div>
            <div class="section-grid">
              <div class="field"><label>参考来源 *</label><select><option>从视频库选择</option><option>上传视频</option><option>粘贴文案</option></select></div>
              <div class="field"><label>参考视频 *</label><input value="轻净 Pro 除螨仪｜结果冲击型"></div>
              <div class="field full"><label>希望借鉴的元素 *（最多 2 项）</label><div class="choice-row" data-limit="2"><span class="choice-chip active">3 秒钩子</span><span class="choice-chip active">内容结构</span><span class="choice-chip">语言节奏</span><span class="choice-chip">卖点表达</span><span class="choice-chip">CTA 方式</span></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>目标内容</strong><small>参考方法将重新映射到当前产品事实</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>目标产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>目标人群</label><input value="有孩子或养宠物的家庭"></div>
              <div class="field"><label>输出数量 *</label><select><option>3 条</option><option>5 条</option></select></div>
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="300" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 1 分 15 秒</b></div></div>
              <div class="field"><label>目标风格</label><select><option>沿用参考节奏</option><option>硬广直给</option><option>痛点口播</option><option>专业测评</option></select></div>
              <div class="field full"><label>仿写边界</label><textarea>不沿用参考商品的品牌名、功效参数、价格和优惠；不逐句同义替换；所有产品表达必须来自目标产品档案。</textarea></div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">参考爆款方法拆解</div>
          <div class="copy-result">
            <div class="structure-line"><strong>钩子机制</strong><span>反常识结果 + 立即展示脏污证据，前 3 秒完成“停留理由”</span></div>
            <div class="structure-line"><strong>内容结构</strong><span>结果冲击 → 场景痛点 → 产品能力 → 操作便利 → 行动引导</span></div>
            <div class="structure-line"><strong>语言节奏</strong><span>短句为主；每 2–4 秒一个新信息点；先给结果，再解释原因</span></div>
          </div>
          <div class="result-section-title">产品映射与原创重构</div>
          <div class="copy-result">
            <div class="compare-row"><strong>保留</strong><span>“看似干净却吸出脏污”的视觉冲突、快节奏递进</span></div>
            <div class="compare-row"><strong>替换</strong><span>参考商品功能 → 轻净 Pro 的拍打吸尘、可水洗尘杯；参考优惠 → 当前已审核权益</span></div>
            <div class="compare-row"><strong>规避</strong><span>删除无法由产品档案证明的除菌率、权威背书和最低价表达</span></div>
          </div>
          <div class="result-grid">
            <div class="result-card"><div class="result-meta"><span class="badge orange">版本 A｜视觉冲突</span><span class="badge green">原创度通过</span></div><p><strong>床垫刚晒完，照样能吸出一杯毛发碎屑。</strong>真正藏在织物深处的脏东西，靠拍打和表面清扫很难带走……</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">版本 B｜场景冲突</span><span class="badge green">原创度通过</span></div><p><strong>每天睡的床，可能比你看到的更需要清洁。</strong>轻净 Pro 边拍边吸，床垫和布艺里的碎屑直接进入尘杯……</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">版本 C｜人群点名</span><span class="badge green">原创度通过</span></div><p><strong>家里养宠物，床铺清洁别只处理表面的毛。</strong>它把拍打和吸力一起用，深入布艺缝隙带走毛发碎屑……</p></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存仿写结果</button><button class="ghost-btn action-script">转为脚本</button><button class="ghost-btn action-variant">更换参考元素</button></div>
        `
      },
      rewrite: {
        intro: "对已有可用文案做可控改写。用户可以锁定正文或卖点，只替换钩子、压缩时长、切换人群或调整表达风格。",
        process: "识别原文结构 → 锁定必须保留内容 → 只执行选定改写任务 → 展示前后差异并生成多个延伸版本。",
        placeholder: "还可以补充：第一句更硬、更短，正文不要改，控制在 3 秒内……",
        request: "保留正文和 CTA，只把前 3 秒换成更有冲击力的结果型钩子，生成 3 个延伸视频版本。",
        version: "改写规则 V9",
        summary: "已锁定正文、卖点顺序与 CTA，仅替换前 3 秒钩子。三个版本可沿用同一主体视频，只需替换开场镜头和对应字幕。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>原始内容</strong><small>读取文案及对应产品信息，改写不会覆盖原资产</small></div></div>
            <div class="section-grid">
              <div class="field"><label>原文来源 *</label><select><option>从文案库选择</option><option>直接粘贴文案</option><option>从当前会话资产选择</option></select></div>
              <div class="field"><label>选择文案 *</label><select><option>除螨仪暑期口播 V1</option><option>除螨仪家庭场景 V3</option></select></div>
              <div class="field full"><label>原文预览</label><textarea>你家床垫真的洗干净了吗？轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑……</textarea></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>改写范围</strong><small>选择快捷任务，也可以用自然语言说明修改目标</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>改写任务 *</label><div class="choice-row"><span class="choice-chip active">只换 3 秒钩子</span><span class="choice-chip">缩短篇幅</span><span class="choice-chip">更换目标人群</span><span class="choice-chip">卖点前置</span><span class="choice-chip">调整为硬广</span><span class="choice-chip">调整为测评</span><span class="choice-chip">减少废话</span></div></div>
              <div class="field full"><label>自定义改写要求 *</label><textarea>保留正文结构和结尾 CTA，只把第一句改成更有冲击力的结果型钩子。</textarea></div>
              <div class="field full"><label>必须锁定、不允许修改</label><input value="正文卖点顺序、可水洗尘杯、结尾 CTA"></div>
              <div class="field"><label>目标字数</label><div class="input-with-unit"><input type="number" min="20" max="2000" value="300" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 1 分 15 秒</b></div></div>
              <div class="field"><label>输出版本 *</label><select><option>3 个版本</option><option>5 个版本</option><option>1 个版本</option></select></div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">本轮改写范围</div>
          <div class="copy-result">
            <div class="compare-row"><strong>原钩子</strong><span class="diff-old">你家床垫真的洗干净了吗？</span></div>
            <div class="compare-row"><strong>锁定不改</strong><span>正文卖点顺序、可水洗尘杯、结尾 CTA</span></div>
            <div class="compare-row"><strong>制作影响</strong><span>主体视频可复用，仅替换 0–3 秒口播、字幕和开场镜头</span></div>
          </div>
          <div class="result-grid">
            <div class="result-card"><div class="result-meta"><span class="badge orange">延伸 A｜脏污证据</span><span class="badge gray">2.6 秒</span></div><p class="diff-new">刚换的床单，第一遍照样能吸出脏东西。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">延伸 B｜损失规避</span><span class="badge gray">2.8 秒</span></div><p class="diff-new">别再只晒床垫了，深处的毛发碎屑晒不走。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">延伸 C｜人群点名</span><span class="badge gray">2.9 秒</span></div><p class="diff-new">家里养宠物，床铺最该清理的是藏起来的毛。</p></div>
          </div>
          <div class="result-note"><strong>延伸视频建议：</strong>保留 3–30 秒主体成片；分别匹配“尘杯特写 / 床垫拍打 / 宠物上床”三个开场镜头，提高日产能而不牺牲变量可控性。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存为 3 个新版本</button><button class="ghost-btn action-script">同步更新脚本</button><button class="ghost-btn action-variant">继续调整语气</button></div>
        `
      },
      script: {
        intro: "系统将理解文案与素材内容，并将素材智能匹配至合适的时间点。",
        process: "解析口播信息点 → 规划时间轴与镜头任务 → 生成用户确认分镜 → 自动生成隐藏的机器执行指令供智能混剪调用。",
        placeholder: "还可以补充：卖点镜头必须用实拍，结尾保留品牌包装页……",
        request: "把除螨仪暑期口播 V1 转为 30 秒主视频脚本，使用实拍与历史素材，输出可确认分镜。",
        version: "编导模板 V14",
        summary: "已生成 30 秒主视频脚本。现有素材可直接覆盖 4/5 个镜头任务，覆盖率 80%；缺失镜头已标记为补拍建议。",
        form: `
          <section class="form-section" data-task-step="1">
            <div class="form-section-head"><div><strong>文案信息</strong><small>确认来源文案与对应产品；文案库内容仅在本次脚本任务内可编辑。</small></div></div>
            <div class="section-grid">
              <div class="field full">
                <label>来源文案 <span class="required-star">*</span></label>
                <div class="source-mode-switch" role="tablist" aria-label="来源文案切换">
                  <button type="button" class="active" data-script-source-mode="library" role="tab" aria-selected="true">从文案库选择</button>
                  <button type="button" data-script-source-mode="manual" role="tab" aria-selected="false">手动输入</button>
                </div>
                <div class="script-source-panel" data-script-source-panel="library">
                  <button class="script-library-trigger" type="button" data-action="open-script-library-picker" data-required>
                    <span class="script-library-trigger-placeholder" data-script-library-placeholder>选择文案</span>
                    <i>⌄</i>
                  </button>
                  <input type="hidden" data-script-source-library>
                  <div class="script-source-preview" data-script-source-preview hidden>
                    <textarea data-script-source-content rows="4" aria-label="当前任务文案">选择文案后,这里会显示完整口播文案，可在本次脚本任务内修改。</textarea>
                  </div>
                </div>
                <div class="script-source-panel" data-script-source-panel="manual" hidden>
                  <textarea data-script-source-text placeholder="粘贴或输入完整口播文案" rows="6"></textarea>
                </div>
              </div>

              <div class="field full" data-script-product-panel="library">
                <label>对应产品 <span class="required-star">*</span></label>
                <div class="script-product-display" data-script-library-product-display>
                  <span class="script-product-display-icon">◈</span>
                  <div><strong>等待带入对应产品</strong></div>
                </div>
                <input type="hidden" data-script-product>
              </div>

              <div class="field full" data-script-product-panel="manual" hidden>
                <label>对应产品 <span class="required-star">*</span></label>
                <div class="source-mode-switch script-product-source-switch" role="tablist" aria-label="产品来源切换">
                  <button type="button" class="active" data-script-product-source="library" role="tab" aria-selected="true">产品库</button>
                  <button type="button" data-script-product-source="link" role="tab" aria-selected="false">商品链接</button>
                  <button type="button" data-script-product-source="manual" role="tab" aria-selected="false">手工输入</button>
                </div>
                <div data-script-manual-product-panel="library">
                  <div class="script-product-row">
                    <input type="hidden" data-script-product data-required>
                    <button class="script-library-trigger" type="button" data-action="open-script-product-picker"><span data-script-selected-product>选择产品</span><i>⌄</i></button>
                  </div>
                </div>
                <div data-script-manual-product-panel="link" hidden>
                  <div class="script-product-row">
                    <input type="url" data-script-product-link placeholder="粘贴商品链接">
                    <input type="hidden" data-script-product data-required>
                    <button class="ghost-btn script-product-pick" type="button" data-action="recognize-script-product">解析商品</button>
                  </div>
                </div>
                <div data-script-manual-product-panel="manual" hidden>
                  <input type="text" data-script-product data-required placeholder="输入产品名称">
                </div>
              </div>

            </div>
          </section>

          <section class="form-section script-voice-section" data-task-step="1">
            <div class="form-section-head"><div><strong>配音设置</strong><small>选择配音角色，并设定本次口播目标时长。</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>配音角色 <span class="required-star">*</span></label><div class="script-voice-inline" data-script-voice-options><button class="active" type="button" data-script-voice-option="陈子建·公版">陈子建·公版</button><button type="button" data-script-voice-option="许念·公版">许念·公版</button><button type="button" data-script-voice-option="阿乐·公版">阿乐·公版</button><button type="button" data-script-voice-option="周雨桐·公版">周雨桐·公版</button><button type="button" data-script-voice-option="方圆·公版">方圆·公版</button><button type="button" data-script-voice-option="高远·公版">高远·公版</button><button type="button" data-script-voice-option="夏语薇·公版">夏语薇·公版</button><button type="button" data-script-voice-option="陈海峰·公版">陈海峰·公版</button></div><input type="hidden" data-script-voice value="陈子建·公版"></div>
              <div class="field"><label>目标时长 <span class="required-star">*</span></label><label class="number-control script-duration-input"><input type="number" min="1" max="600" step="1" value="60" inputmode="numeric" data-script-duration aria-label="目标时长（秒）"><span>s</span></label></div>
            </div>
          </section>

          <section class="form-section" data-task-step="2">
            <div class="form-section-head"><div><strong>脚本策略</strong><small>选择素材库依赖模式、素材范围与生成模型。</small></div></div>
            <div class="section-grid">
              <div class="field full">
                <label>是否依赖素材库 <span class="required-star">*</span></label>
                <div class="choice-row" data-single="script-material-mode" data-role="script-material-mode">
                  <span class="choice-chip active" data-material-mode="depend">依赖素材库</span>
                  <span class="choice-chip" data-material-mode="free">不依赖素材库</span>
                </div>
                <div class="form-hint" data-material-mode-hint>依赖素材库：在已选素材中匹配镜头；不依赖：生成分镜与生视频提示词。</div>
              </div>

              <div class="field full" data-material-mode-panel="depend" data-depend-only>
                <label>素材选择 <span class="required-star">*</span></label>
                <button class="script-material-library-button" type="button" data-action="open-script-material-picker">＋ 从素材库选择</button>
                <div class="script-material-selection-strip" data-script-material-summary>
                  <span class="script-material-summary-empty">暂未选择素材</span>
                </div>
                <div class="material-group-error" data-material-group-error>请至少选择 1 条素材</div>
              </div>

              <div class="field">
                <label>模型 <span class="required-star">*</span></label>
                <div class="single-model-picker" data-script-model-picker>
                  <button class="single-model-trigger" type="button" data-script-model-trigger><span><small>当前最优模型</small><b data-script-model-trigger-text>GPT-5.6 Terra</b></span><i>⌃</i></button>
                  <div class="single-model-menu" data-script-model-menu></div>
                </div>
                <input type="hidden" data-script-model value="gpt-5-6-terra">
              </div>

            </div>
          </section>

          <section class="form-section" data-task-step="3" hidden>
            <div class="form-section-head"><div><strong>AI 生成脚本</strong><small>分镜结果将在此处展示,生成后可使用右侧对话继续修改</small></div></div>
            <div class="script-result-card" data-script-result-card>
              <div class="script-result-loading">
                <span class="spinner"></span>
                <strong>正在生成分镜脚本……</strong>
                <small>系统将根据本次配置匹配素材、生成口播与画面</small>
              </div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">用户确认层｜结构化脚本与分镜</div>
          <div class="copy-result" style="overflow:auto;">
            <table class="story-table">
              <thead><tr><th>时间</th><th>内容任务</th><th>口播 / 字幕</th><th>分镜画面描述</th><th>确认状态</th></tr></thead>
              <tbody>
                <tr><td>00–03s</td><td>停留钩子</td><td>刚换的床单，第一遍照样能吸出脏东西。</td><td>尘杯脏污结果先露出，快速切到床垫推进；大字突出“刚换也能吸出”</td><td><span class="badge green">已匹配 3 段</span></td></tr>
                <tr><td>03–08s</td><td>解释痛点</td><td>毛发和碎屑，会藏进织物深处。</td><td>床垫纤维近景 + 毛发碎屑示意；镜头保持紧凑</td><td><span class="badge green">已匹配</span></td></tr>
                <tr><td>08–16s</td><td>产品能力</td><td>轻净 Pro 边拍边吸，把深处脏东西带进尘杯。</td><td>产品工作实拍，拍打头特写、推进过程、尘杯变化三镜头</td><td><span class="badge green">已匹配 6 段</span></td></tr>
                <tr><td>16–23s</td><td>使用便利</td><td>床垫、沙发和布艺都能用，用完尘杯直接水洗。</td><td>三场景快切 + 尘杯拆卸冲洗，重点词“可水洗”高亮</td><td><span class="badge green">已匹配</span></td></tr>
                <tr><td>23–30s</td><td>收束 CTA</td><td>家里有孩子或宠物，床铺清洁把它安排上。</td><td>家庭卧室场景、产品定帧、品牌角标与行动按钮</td><td><span class="badge orange">建议补拍</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="result-note"><strong>素材可执行性：</strong>现有素材覆盖 4/5 个镜头任务（80%），满足不低于 50%的编导目标。缺失的家庭收束镜头已标记为线下补拍任务。</div>
          <div class="result-actions"><button class="soft-btn action-save">确认并保存脚本</button><button class="ghost-btn action-mix">调用智能混剪</button><button class="ghost-btn action-variant">修改指定分镜</button></div>
        `
      },
      "script-copy": {
        intro: "拆解参考视频的节奏、场景组织和镜头逻辑，再用当前产品、文案和可用素材重构新脚本，避免照搬参考画面。",
        process: "智能拉片参考视频 → 提取镜头任务与节奏模板 → 替换为目标产品信息 → 检查素材可执行性 → 输出新分镜。",
        placeholder: "还可以补充：保留前 3 秒节奏，产品演示必须使用我们的实拍素材……",
        request: "参考已拉片视频的镜头节奏，为轻净 Pro 除螨仪生成一条 30 秒主视频脚本。",
        version: "脚本仿写 V11",
        summary: "已保留参考视频的“证据先行 + 快速演示 + 场景扩展”镜头逻辑，并按轻净 Pro 的产品事实和现有素材重新设计分镜。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>参考脚本方法</strong><small>优先选择已完成的智能拉片结果，直接读取镜头和节奏结构</small></div></div>
            <div class="section-grid">
              <div class="field"><label>参考来源 *</label><select><option>智能拉片记录</option><option>千川素材 ID</option><option>内部视频库</option><option>上传视频</option></select></div>
              <div class="field"><label>参考视频 *</label><select><option>除螨仪爆款拉片 #A023</option><option>输入素材 ID</option></select></div>
              <div class="field full"><label>希望借鉴的元素 *（最多 2 项）</label><div class="choice-row" data-limit="2"><span class="choice-chip active">开场镜头</span><span class="choice-chip active">分镜顺序</span><span class="choice-chip">节奏变化</span><span class="choice-chip">产品展示方式</span><span class="choice-chip">转化收口</span></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>目标产品与素材</strong><small>新脚本优先使用当前产品已有素材，不复用参考视频画面</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>目标产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>目标时长 *</label><select><option>30 秒</option><option>20 秒</option><option>45 秒</option></select></div>
              <div class="field"><label>脚本数量 *</label><select><option>1 条主视频</option><option>1 主 + 3 延伸</option></select></div>
              <div class="field full"><label>素材来源 *</label><div class="choice-row" data-single="script-copy-material"><span class="choice-chip active">产品绑定素材</span><span class="choice-chip">指定产品素材</span><span class="choice-chip">临时上传素材</span></div></div>
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 已绑定素材</strong><small>已有素材优先覆盖脚本镜头；缺失镜头自动标记补拍</small></div><b>1,286</b></div>
              <div class="field full"><label>仿写边界</label><textarea>不复用原画面；不迁移参考商品参数；保留镜头方法和节奏逻辑，所有内容按目标产品及已有素材重新设计。</textarea></div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">参考镜头方法 → 新产品脚本映射</div>
          <div class="copy-result">
            <div class="compare-row"><strong>00–03s</strong><span>参考：先展示使用结果 → 新脚本：先展示尘杯脏污证据，匹配实拍素材 3 条</span></div>
            <div class="compare-row"><strong>03–10s</strong><span>参考：快速解释痛点 → 新脚本：床垫纤维近景 + 毛发碎屑，2–3 秒一切</span></div>
            <div class="compare-row"><strong>10–22s</strong><span>参考：连续功能演示 → 新脚本：拍打、推进、吸入、尘杯变化四段实拍</span></div>
            <div class="compare-row"><strong>22–30s</strong><span>参考：多场景收束 → 新脚本：床垫 / 沙发 / 布艺快切 + 可水洗尘杯 + CTA</span></div>
          </div>
          <div class="result-section-title">新脚本可执行性</div>
          <div class="result-grid">
            <div class="result-card"><div class="result-meta"><span class="badge green">口播覆盖</span></div><p><strong>100%</strong><br>5 个信息段均已生成对应口播与字幕重点。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge green">镜头可匹配</span></div><p><strong>9 / 10</strong><br>1 个纤维微距镜头建议补拍或由 AI 素材补充。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">原创重构</span></div><p><strong>已通过</strong><br>未复用参考画面、原句、商品参数和优惠。</p></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存新脚本</button><button class="ghost-btn action-mix">调用智能混剪</button><button class="ghost-btn action-variant">生成延伸脚本</button></div>
        `
      },
      mix: {
        intro: "基于产品信息、已确认文案与已有创作素材，完成 AI 配音、镜头匹配、裁切拼接和成片质检。",
        process: "确认创作方案 → 确认文案与配音 → 确认脚本与素材 → 裁切拼接并生成成片。",
        placeholder: "还可以补充：第 3 段换成沙发清洁画面，结尾产品定帧延长 0.5 秒……",
        request: "为轻净 Pro 除螨仪使用已有创作素材生成 1 条竖版混剪视频。",
        version: "混剪引擎 V16",
        summary: "已完成 1 条 48.6 秒竖版混剪视频。文案、配音和 5 个内容段均已确认，全部画面来自已有创作素材。",
        form: `
          <div class="mix-flow-form">
            <section class="mix-step-panel" data-task-step="1">
              <article class="mix-block">
                <div class="mix-block-head"><div><strong>创作方案</strong><small>选择起点，后续步骤只确认本次结果，不会再次选择文案或脚本。</small></div></div>
                <div class="mix-plan-tabs" role="tablist">
                  <button class="active" type="button" data-mix-plan="ai"><b>AI 生成</b><small>智能匹配或指定爆款结构</small></button>
                  <button type="button" data-mix-plan="copy"><b>从已有文案开始</b><small>带入文案及关联产品</small></button>
                  <button type="button" data-mix-plan="script"><b>从已有脚本开始</b><small>带入口播、分镜及产品</small></button>
                </div>
                <div class="mix-plan-context" data-mix-plan-context></div>
              </article>
              <article class="mix-block">
                <div class="mix-block-head"><div><strong>目标产品与视频要求</strong><small data-mix-product-origin>自主创作需选择目标产品；产品事实用于约束文案和素材范围。</small></div></div>
                <div class="mix-three-col">
                  <label class="mix-field"><span>目标产品</span><select data-mix-product><option value="mite-pro">轻净 Pro 除螨仪</option><option value="washer-s5">净界洗地机 S5</option><option value="air-a8">轻享空气炸锅 A8</option><option value="">不选择产品</option></select></label>
                  <label class="mix-field"><span>目标人群</span><input type="hidden" value="精致妈妈 · 母婴清洁" data-mix-audience><button class="mix-picker-trigger" type="button" data-mix-pick-audience><span data-mix-audience-label>精致妈妈 · 母婴清洁</span><i>›</i></button></label>
                  <label class="mix-field"><span>视频生成时长</span><span class="mix-duration-input"><input type="number" min="10" max="180" step="1" value="60" data-mix-target-duration><i>秒</i></span></label>
                </div>
                <div class="mix-duration-presets"><span>快捷选择</span><button type="button" data-mix-duration-preset="15">15秒</button><button type="button" data-mix-duration-preset="30">30秒</button><button type="button" data-mix-duration-preset="45">45秒</button><button class="active" type="button" data-mix-duration-preset="60">60秒</button><small>支持输入 10–180 秒</small></div>
                <div class="mix-fact-strip" data-mix-product-facts><b>已带入产品事实</b><span>深层清洁 · 拍打吸尘同步 · 透明尘杯可水洗 · 禁用“100%除螨”</span><button type="button" data-mix-show-facts>查看</button></div>
              </article>
              <article class="mix-block" data-mix-material-block>
                <div class="mix-block-head"><div><strong>创作素材</strong><small>默认展示并选中该产品的关联资产；未选中的素材本次不会使用。</small></div><div class="mix-material-head-actions"><span>已选 <b data-mix-selected-count>6</b> / <i data-mix-total-count>6</i></span><button type="button" data-mix-select-all>取消全选</button><button type="button" data-mix-add-material>＋ 关联创作素材</button></div></div>
                <div class="mix-material-grid" data-mix-material-grid>
                  <article class="mix-material-card selected must" data-mix-material="M-CL-101"><button class="mix-material-select" type="button" aria-label="选择透明尘杯脏污特写">✓</button><button class="mix-material-must" type="button" title="设为必用">必用</button><div class="mix-material-cover tone-1"><span>尘杯<br>脏污特写</span><em>00:02</em></div><strong>透明尘杯脏污特写</strong><small>结果证明 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-SC-301"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button" title="设为必用">设为必用</button><div class="mix-material-cover tone-2"><span>床垫<br>推进清洁</span><em>00:06</em></div><strong>床垫表面推进清洁</strong><small>使用过程 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-CL-102"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button" title="设为必用">设为必用</button><div class="mix-material-cover tone-3"><span>拍打头<br>动作特写</span><em>00:05</em></div><strong>拍打吸尘动作特写</strong><small>功能演示 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-PF-201"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button" title="设为必用">设为必用</button><div class="mix-material-cover tone-4"><span>卧室<br>清洁全景</span><em>00:08</em></div><strong>卧室床垫清洁全景</strong><small>使用场景 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-PF-202"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button" title="设为必用">设为必用</button><div class="mix-material-cover tone-5"><span>沙发<br>布艺清洁</span><em>00:07</em></div><strong>沙发布艺清洁全景</strong><small>多场景 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-AT-503"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button" title="设为必用">设为必用</button><div class="mix-material-cover tone-6"><span>产品<br>定帧收口</span><em>00:04</em></div><strong>产品定帧与购买引导</strong><small>行动引导 · 已分析</small></article>
                </div>
                <div class="mix-empty-material" data-mix-empty-material hidden><b>尚未关联创作素材</b><span>请先选择或创建产品，再关联可用于本次混剪的创作素材。</span></div>
              </article>
              <label class="mix-block mix-requirement"><span>本次补充要求（选填）</span><textarea data-mix-requirement placeholder="例如：必须提及七天无理由；结尾引导点击商品；不要出现价格信息。">结尾引导点击商品；不要出现未经验证的功效数据。</textarea></label>
            </section>

            <section class="mix-step-panel" data-task-step="2" hidden>
              <div class="mix-step-title"><div><span>STEP 2</span><h3>确认文案与配音</h3><p>这里展示第一步输入形成的本次最终文案，不会修改资产库原文案或脚本。</p></div><span class="mix-source-badge" data-mix-source-badge>AI 生成</span></div>
              <article class="mix-structure-result" data-mix-structure-result>
                <span class="mix-structure-result-icon">构</span><div><small>本次采用的爆款内容结构</small><strong data-mix-result-structure-name>结果前置·痛点解决·行动引导型</strong><p data-mix-result-structure-formula>结果钩子 → 痛点解释 → 产品演示 → 效果证明 → 行动引导</p><em data-mix-result-structure-reason>匹配原因：已有素材包含强结果画面；60秒可完整覆盖痛点、演示和证明。</em></div><button type="button" data-mix-change-structure>更换结构</button>
              </article>
              <article class="mix-block mix-copy-editor">
                <div class="mix-block-head"><div><strong>口播文案</strong><small>可直接修改；产品库禁用话术会在保存前校验。</small></div><button type="button" data-mix-regenerate-copy>重新生成</button></div>
                <textarea data-mix-copy>刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先别听我讲参数，直接看轻净 Pro 除螨仪走完一遍后的透明尘杯。它在床垫表面推进时，拍打和吸尘同步进行，把织物深处的细小脏污带出来，清洁结果当场就能看见。卧室床垫、客厅沙发和其他布艺都能使用，用完后尘杯还可以拆下来水洗，日常整理更省事。家里有孩子或宠物，别只停留在换床单和粘表面毛发，定期把床褥深处也清理一遍。想看完整实测过程，点击商品了解更多。</textarea>
                <div class="mix-copy-meta"><span><b data-mix-copy-count>196</b> 字</span><span class="ok">✓ 产品事实校验通过</span><span>已避开禁用话术</span></div>
              </article>
              <article class="mix-block">
                <div class="mix-block-head"><div><strong>配音设置</strong><small>选择音色、试听并微调语速；修改文案后实际时长会自动重算。</small></div></div>
                <div class="mix-voice-layout">
                  <label class="mix-field"><span>配音角色</span><select data-mix-voice><option>许念 · 自然亲和</option><option>陈子建 · 清晰有力</option><option>周雨桐 · 轻快种草</option></select></label>
                  <div class="mix-speed-control"><span>语速</span><button type="button" data-mix-speed-minus>−</button><input type="range" min="0.8" max="1.3" step="0.05" value="1" data-mix-speed><button type="button" data-mix-speed-plus>＋</button><b data-mix-speed-label>1.00×</b></div>
                  <button class="mix-voice-preview" type="button" data-mix-voice-preview><span>▶</span><div><strong>试听当前配音</strong><small data-mix-voice-status>许念 · 1.00×</small></div></button>
                </div>
                <div class="mix-duration-card"><div><span>目标视频时长</span><b data-mix-target-duration-display>60.0 秒</b></div><i>↔</i><div><span>当前配音时长</span><b class="primary" data-mix-duration>59.4 秒</b></div><div class="mix-duration-diff"><span>时长偏差</span><b data-mix-duration-diff>−0.6 秒 · 可生成</b></div><button type="button" data-mix-fit-duration>适配目标时长</button></div>
              </article>
            </section>

            <section class="mix-step-panel" data-task-step="3" hidden>
              <div class="mix-step-title"><div><span>STEP 3</span><h3>确认脚本与素材</h3><p>系统已把口播拆到时间轴，并从已选素材中完成镜头匹配与时长处理。</p></div><button class="mix-rematch-all" type="button" data-mix-rematch-all>重新匹配全部</button></div>
              <div class="mix-summary-grid"><div><span>配音时长</span><b data-mix-script-duration>48.6s</b></div><div><span>内容覆盖</span><b>5 / 5</b></div><div><span>素材覆盖</span><b class="success">100%</b></div><div><span>使用素材</span><b data-mix-used-count>6 个</b></div><div><span>待处理问题</span><b class="success">0 项</b></div></div>
              <div class="mix-script-list">
                <article class="mix-script-card" data-mix-script-row="0"><header><div><b>00:00–00:04</b><strong>结果钩子</strong><span>4.0s</span></div><button type="button" data-mix-toggle-row>收起</button></header><div class="mix-script-body"><div class="mix-script-copy"><span>配音</span><p>刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。</p></div><div class="mix-shot-task"><span>画面任务</span><p>先展示尘杯脏污结果，再硬切床垫表面推进。</p></div><div class="mix-assigned-material"><div class="mini-cover tone-1">尘杯特写</div><div><strong data-mix-material-name>透明尘杯脏污特写</strong><small>素材 00:00.4–00:02.4 · 使用 2.0s</small></div><em>必用</em></div><div class="mix-edit-result"><span>裁切 2.0s</span><span>＋ 床垫推进 2.0s</span><span>硬切</span><span>正常速度</span></div><footer><button type="button" data-mix-preview-row>▶ 预览本段</button><button type="button" data-mix-replace-row>替换素材</button><button type="button" data-mix-rematch-row>重新匹配</button><button type="button" data-mix-lock-row>锁定</button></footer></div></article>
                <article class="mix-script-card" data-mix-script-row="1"><header><div><b>00:04–00:12</b><strong>痛点解释</strong><span>8.0s</span></div><button type="button" data-mix-toggle-row>展开</button></header><div class="mix-script-body" hidden><div class="mix-script-copy"><span>配音</span><p>先别听我讲参数，直接看轻净 Pro 走完一遍后的透明尘杯。</p></div><div class="mix-shot-task"><span>画面任务</span><p>床垫纤维近景衔接尘杯结果，强化“看得见”的证据。</p></div><div class="mix-assigned-material"><div class="mini-cover tone-2">床垫推进</div><div><strong data-mix-material-name>床垫表面推进清洁</strong><small>素材 00:01.0–00:07.6 · 使用 6.6s</small></div><em>已匹配</em></div><div class="mix-edit-result"><span>轻微减速 0.95×</span><span>短定帧 0.4s</span></div><footer><button type="button" data-mix-preview-row>▶ 预览本段</button><button type="button" data-mix-replace-row>替换素材</button><button type="button" data-mix-rematch-row>重新匹配</button><button type="button" data-mix-lock-row>锁定</button></footer></div></article>
                <article class="mix-script-card" data-mix-script-row="2"><header><div><b>00:12–00:28</b><strong>产品演示</strong><span>16.0s</span></div><button type="button" data-mix-toggle-row>展开</button></header><div class="mix-script-body" hidden><div class="mix-script-copy"><span>配音</span><p>拍打和吸尘同步进行，把织物深处的细小脏污带出来，清洁结果当场就能看见。</p></div><div class="mix-shot-task"><span>画面任务</span><p>拍打头、产品推进、脏污吸入和尘杯变化连续硬切。</p></div><div class="mix-assigned-material"><div class="mini-cover tone-3">动作特写</div><div><strong data-mix-material-name>拍打吸尘动作特写</strong><small>2 段素材 · 合计使用 16.0s</small></div><em>已匹配</em></div><div class="mix-edit-result"><span>3 段硬切</span><span>其中 1 段加速 1.12×</span></div><footer><button type="button" data-mix-preview-row>▶ 预览本段</button><button type="button" data-mix-replace-row>替换素材</button><button type="button" data-mix-rematch-row>重新匹配</button><button type="button" data-mix-lock-row>锁定</button></footer></div></article>
                <article class="mix-script-card" data-mix-script-row="3"><header><div><b>00:28–00:42</b><strong>多场景证明</strong><span>14.0s</span></div><button type="button" data-mix-toggle-row>展开</button></header><div class="mix-script-body" hidden><div class="mix-script-copy"><span>配音</span><p>卧室床垫、客厅沙发和其他布艺都能使用，用完后尘杯还可以拆下来水洗。</p></div><div class="mix-shot-task"><span>画面任务</span><p>卧室与沙发场景交替，结尾接尘杯拆洗过程。</p></div><div class="mix-assigned-material"><div class="mini-cover tone-4">多场景</div><div><strong data-mix-material-name>卧室床垫清洁全景</strong><small>3 段素材 · 合计使用 14.0s</small></div><em>已匹配</em></div><div class="mix-edit-result"><span>卧室 / 沙发硬切</span><span>正常速度</span></div><footer><button type="button" data-mix-preview-row>▶ 预览本段</button><button type="button" data-mix-replace-row>替换素材</button><button type="button" data-mix-rematch-row>重新匹配</button><button type="button" data-mix-lock-row>锁定</button></footer></div></article>
                <article class="mix-script-card" data-mix-script-row="4"><header><div><b>00:42–00:49</b><strong>行动引导</strong><span>6.6s</span></div><button type="button" data-mix-toggle-row>展开</button></header><div class="mix-script-body" hidden><div class="mix-script-copy"><span>配音</span><p>想看完整实测过程，点击商品了解更多。</p></div><div class="mix-shot-task"><span>画面任务</span><p>产品定帧与手持展示，稳定镜头收尾。</p></div><div class="mix-assigned-material"><div class="mini-cover tone-6">产品收口</div><div><strong data-mix-material-name>产品定帧与购买引导</strong><small>素材 00:00–00:04 · 使用 4.0s</small></div><em>已匹配</em></div><div class="mix-edit-result"><span>定帧 0.6s</span><span>正常速度</span></div><footer><button type="button" data-mix-preview-row>▶ 预览本段</button><button type="button" data-mix-replace-row>替换素材</button><button type="button" data-mix-rematch-row>重新匹配</button><button type="button" data-mix-lock-row>锁定</button></footer></div></article>
              </div>
            </section>

            <section class="mix-step-panel" data-task-step="4" hidden>
              <div class="mix-step-title"><div><span>STEP 4</span><h3>生成视频</h3><p>最后检查本次输入，确认后将使用已有素材完成裁切拼接。</p></div><span class="mix-ready-badge">已就绪</span></div>
              <article class="mix-block mix-generation-summary"><div><span>产品</span><b data-mix-final-product>轻净 Pro 除螨仪</b></div><div><span>成片时长</span><b data-mix-final-duration>48.6 秒</b></div><div><span>配音</span><b data-mix-final-voice>许念 · 1.00×</b></div><div><span>使用素材</span><b data-mix-final-materials>6 个</b></div><div><span>输出规格</span><b>9:16 · 1080×1920 · 30fps</b></div></article>
              <article class="mix-block mix-checklist"><strong>生成前检查</strong><p><span>✓</span> 文案与配音已确认</p><p><span>✓</span> 5 个脚本段落已确认</p><p><span>✓</span> 所有时间段均已匹配已有素材</p><p><span>✓</span> 未使用原声、字幕、特效或转场</p></article>
              <div class="mix-generation-host" data-mix-generation-host><div class="mix-generation-placeholder"><span>▶</span><strong>等待生成视频</strong><small>预计约 40 秒完成演示生成</small></div></div>
            </section>
          </div>
        `,
        result: `
          <div class="mix-preview">
            <div class="mix-cover">▶<br>30 秒主视频<br><small style="opacity:.8;">待人工终审</small></div>
            <div>
              <div class="mix-stats">
                <div class="mix-stat"><strong>8 / 8</strong><small>镜头任务已匹配</small></div>
                <div class="mix-stat"><strong>100%</strong><small>脚本信息点覆盖</small></div>
                <div class="mix-stat"><strong>28.6s</strong><small>成片实际时长</small></div>
                <div class="mix-stat"><strong>0 项</strong><small>高风险质检问题</small></div>
              </div>
              <div class="result-section-title">素材构成</div>
              <div class="result-meta"><span class="badge">产品实拍 62%</span><span class="badge green">历史素材 38%</span><span class="badge gray">AI 素材 0%</span></div>
              <div class="timeline-mini">
                <span class="timeline-segment" style="flex:3">钩子</span>
                <span class="timeline-segment alt" style="flex:5">痛点</span>
                <span class="timeline-segment" style="flex:9">功能演示</span>
                <span class="timeline-segment alt" style="flex:6">多场景</span>
                <span class="timeline-segment" style="flex:5">CTA</span>
              </div>
            </div>
          </div>
          <div class="result-section-title">终审重点</div>
          <div class="copy-result">
            <div class="compare-row"><strong>需要确认</strong><span>00–03s 尘杯画面冲击力；08–17s 产品演示顺序；23–28s 品牌与 CTA 表达</span></div>
            <div class="compare-row"><strong>已自动完成</strong><span>字幕逐字对齐、重点词高亮、配音降噪、BGM 闪避、品牌角标、画幅安全区和黑帧检测</span></div>
            <div class="compare-row"><strong>后续流转</strong><span>人工确认或替换指定镜头 → 输出定稿 → 自动提交千川提审 → 通过后进入推广自动化</span></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存到视频库</button><button class="ghost-btn">打开终审</button><button class="ghost-btn">替换指定镜头</button><button class="primary-btn">确认并提交提审</button></div>
        `
      }
    };

    agentConfigs.chat = {
      placeholder: "描述你的想法，或选择下方专业能力开始创作",
      intro: "用于讨论创意、梳理需求和获取下一步建议。需要生成文案、脚本或视频时，可随时切换专业 Agent。",
      process: "理解当前会话 → 结合已知产品与资产上下文 → 给出清晰的创作建议或下一步操作。",
      form: ""
    };

    const revisionResults = {
      original: {
        summary: "已结合上一版和本轮补充要求完成定向修正。未被点名的产品事实、卖点顺序和 CTA 均保持不变。",
        result: `
          <div class="copy-result">
            <div class="result-meta"><span class="badge">第 2 版</span><span class="badge orange">仅修改前 3 秒</span><span class="badge green">其他内容已锁定</span></div>
            <div class="compare-row"><strong>修改前</strong><span class="diff-old">床单看着干净，不代表真的干净。</span></div>
            <div class="compare-row"><strong>修改后</strong><span class="diff-new">刚换的床单，也能吸出一杯脏东西。</span></div>
            <div class="compare-row"><strong>保持不变</strong><span>深层清洁、拍打吸尘、可水洗尘杯、结尾行动引导</span></div>
          </div>
          <div class="result-note"><strong>修订说明：</strong>钩子由观点表达改为结果直给，口播约 2.7 秒；正文仍沿用上一版，可直接作为延伸视频替换开头。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存为新版本</button><button class="ghost-btn action-script">用修订版转脚本</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      copy: {
        summary: "已在上一轮仿写结果上继续调整，只修改用户指定的参考元素，产品事实映射与原创边界保持不变。",
        result: `
          <div class="copy-result">
            <div class="result-meta"><span class="badge">仿写 V2</span><span class="badge orange">节奏加快</span><span class="badge green">原创边界通过</span></div>
            <div class="compare-row"><strong>本轮调整</strong><span>删除解释性铺垫，前 8 秒从 3 个信息点增加为 4 个信息点</span></div>
            <div class="compare-row"><strong>继续保留</strong><span>参考素材的结果先行结构；不复用原句、品牌、参数与优惠</span></div>
            <p style="margin-top:9px;"><strong>刚换的床单，也能吸出一杯毛发碎屑。</strong>看得见的是表面，看不见的都藏在织物深处。轻净 Pro 边拍边吸，脏东西直接进尘杯，用完还能拆下水洗……</p>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存仿写 V2</button><button class="ghost-btn action-script">转为脚本</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      rewrite: {
        summary: "已继续基于原文和上一轮改写结果修正，并保留所有已锁定段落。",
        result: `
          <div class="copy-result">
            <div class="result-meta"><span class="badge">改写 V3</span><span class="badge orange">语气更硬</span><span class="badge green">正文已锁定</span></div>
            <div class="compare-row"><strong>上一版</strong><span class="diff-old">刚换的床单，第一遍照样能吸出脏东西。</span></div>
            <div class="compare-row"><strong>本轮修正</strong><span class="diff-new">别只换床单，床垫深处的毛发碎屑还在。</span></div>
            <div class="compare-row"><strong>制作影响</strong><span>仍只需替换 0–3 秒口播、字幕和开场镜头，主体成片可复用</span></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存改写 V3</button><button class="ghost-btn action-script">同步更新脚本</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      script: {
        summary: "已基于上一版结构化脚本修改指定分镜，其余时间轴、口播和机器混剪指令保持不变。",
        result: `
          <div class="copy-result" style="overflow:auto;">
            <table class="story-table">
              <thead><tr><th>时间</th><th>修改状态</th><th>修订后口播</th><th>修订后画面</th><th>影响范围</th></tr></thead>
              <tbody>
                <tr><td>00–03s</td><td><span class="badge orange">已修改</span></td><td>别只换床单，床垫深处的毛发碎屑还在。</td><td>先展示尘杯脏污，再切床垫纤维近景；大字字幕同步出现</td><td>替换开场镜头、字幕与配音</td></tr>
                <tr><td>03–30s</td><td><span class="badge green">已锁定</span></td><td>沿用上一版</td><td>产品演示、多场景、尘杯水洗与 CTA 均不变</td><td>无需重新匹配</td></tr>
              </tbody>
            </table>
          </div>
          <div class="result-note"><strong>执行层同步：</strong>已重算 0–3 秒镜头检索词、字幕时间轴和配音片段；其余素材候选不会重新计算。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存脚本新版本</button><button class="ghost-btn action-mix">用修订版混剪</button><button class="ghost-btn action-variant">继续修改分镜</button></div>
        `
      },
      "script-copy": {
        summary: "已在上一版仿写脚本上继续调整镜头节奏，参考方法与目标产品映射关系仍然保留。",
        result: `
          <div class="copy-result">
            <div class="compare-row"><strong>本轮要求</strong><span>前 3 秒冲击更强，产品演示镜头保持不变</span></div>
            <div class="compare-row"><strong>修订结果</strong><span>开场由“床垫推进”改为“尘杯结果特写 → 床垫推进”，首屏结果提前 1.4 秒</span></div>
            <div class="compare-row"><strong>未改范围</strong><span>03–30 秒镜头顺序、口播、素材范围、品牌包装与 CTA</span></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存脚本 V2</button><button class="ghost-btn action-mix">调用智能混剪</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      mix: {
        summary: "已基于上一版成片执行局部修改，只重新渲染受影响的镜头、字幕与配音片段。",
        result: `
          <div class="mix-preview">
            <div class="mix-cover">▶<br>成片 V2<br><small style="opacity:.8;">局部重渲染完成</small></div>
            <div>
              <div class="mix-stats">
                <div class="mix-stat"><strong>1 / 8</strong><small>本轮替换镜头</small></div>
                <div class="mix-stat"><strong>7 / 8</strong><small>沿用上一版镜头</small></div>
                <div class="mix-stat"><strong>28.4s</strong><small>修订后时长</small></div>
                <div class="mix-stat"><strong>通过</strong><small>自动质检</small></div>
              </div>
              <div class="result-note"><strong>本轮变化：</strong>00–03 秒换为尘杯结果特写，字幕字号提升一级；产品演示、配音音色、BGM 和品牌包装不变。</div>
            </div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存成片 V2</button><button class="ghost-btn">对比 V1 / V2</button><button class="ghost-btn action-variant">继续修改</button><button class="primary-btn">确认并提交提审</button></div>
        `
      }
    };

    function setFormFeedback(message, type = "success") {
      formFeedback.hidden = !message;
      formFeedback.className = `inline-feedback ${type}`;
      formFeedback.innerHTML = message ? `<strong>${type === "error" ? "请检查" : "已完成"}</strong><span>${message}</span>` : "";
    }

    function currentProduct() {
      return productCatalog[creationContext.productId] || {
        name: creationContext.productName || "未选择产品",
        core: creationContext.originalFields.core || "",
        secondary: creationContext.originalFields.secondary || "",
        difference: creationContext.originalFields.difference || "",
        audiences: [],
        psychology: ["风险规避", "理性求证"],
        facts: "产品信息待确认"
      };
    }

    function isStructuredCopyFlow(type = activeType) {
      return type === "original" || type === "copy" || type === "rewrite";
    }

    function updateModalContext() {
      saveProductButton.hidden = !isStructuredCopyFlow() || creationContext.productSaved;
      if (isStructuredCopyFlow()) {
        saveProductButton.textContent = "保存产品";
        saveProductButton.disabled = false;
      }
      contextStatus.hidden = !activeType || activeType === "script";
      contextStatus.textContent = creationContext.productConfirmed ? `已带入：${currentProduct().name}` : "未选择产品";
    }

    function syncCreationProductControl(productId = "", productName = "") {
      dynamicForm.querySelectorAll("[data-product-select]").forEach(control => { control.value = productId; });
      dynamicForm.querySelectorAll("[data-product-picker-label]").forEach(label => {
        label.textContent = productName || "选择产品";
        label.classList.toggle("placeholder", !productName);
      });
    }

    function clearLibraryProductFields() {
      creationContext.productId = "";
      creationContext.productName = "";
      creationContext.productConfirmed = false;
      creationContext.productSaved = true;
      const clear = selector => {
        const field = dynamicForm.querySelector(selector);
        if (field) field.value = "";
      };
      clear("[data-original-product-name]");
      clear("[data-original-brand]");
      clear("[data-original-category]");
      ["core", "secondary", "trust"].forEach(key => setPointEditorValues(key, [""]));
      ["difference", "marketing", "pain", "scenes"].forEach(key => clear(`[data-field="${key}"]`));
      dynamicForm.querySelectorAll(".audience-chip").forEach(chip => chip.classList.remove("active"));
      const factHint = dynamicForm.querySelector("[data-product-fact-hint]");
      if (factHint) factHint.textContent = "选择产品后读取产品事实、关联资产和禁用表达";
      syncCreationProductControl();
    }

    function clearOriginalProductFields(source) {
      creationContext.productId = source === "link" ? "pending-link" : "manual-product";
      creationContext.productName = "";
      const clear = selector => {
        const field = dynamicForm.querySelector(selector);
        if (field) field.value = "";
      };
      clear("[data-original-product-name]");
      clear("[data-original-brand]");
      clear("[data-original-category]");
      ["core", "secondary", "trust"].forEach(key => setPointEditorValues(key, [""]));
      ["difference", "marketing", "pain", "scenes"].forEach(key => clear(`[data-field="${key}"]`));
      dynamicForm.querySelectorAll(".audience-chip").forEach(chip => chip.classList.remove("active"));
    }

    function setProductSource(source) {
      creationContext.productSource = source;
      dynamicForm.querySelectorAll("[data-product-source]").forEach(button => {
        button.classList.toggle("active", button.dataset.productSource === source);
      });
      dynamicForm.querySelectorAll("[data-product-source-panel]").forEach(panel => {
        panel.hidden = panel.dataset.productSourcePanel !== source;
      });
      const sourceInline = dynamicForm.querySelector(".product-source-inline");
      if (sourceInline) sourceInline.hidden = source !== "link";
      if (source === "library") {
        const selectedId = creationContext.productId;
        if (selectedId && productCatalog[selectedId]) applyProductToForm(selectedId);
        else clearLibraryProductFields();
      } else {
        clearOriginalProductFields(source);
        creationContext.productConfirmed = false;
        creationContext.productSaved = false;
      }
      updateModalContext();
      setFormFeedback("");
    }

    function setActiveAudience(audiences = []) {
      const audienceMap = { "宝妈家庭": "精致妈妈", "养宠家庭": "新锐白领", "精致生活人群": "资深中产", "租房人群": "小镇青年" };
      const normalized = audiences.map(item => audienceMap[item] || item);
      dynamicForm.querySelectorAll(".audience-chip").forEach(chip => {
        chip.classList.toggle("active", normalized.includes(chip.textContent.trim()));
      });
    }

    function applyProductToForm(productId, announce = false) {
      if (!productCatalog[productId]) return;
      creationContext.productId = productId;
      creationContext.productName = productCatalog[productId].name;
      creationContext.productConfirmed = true;
      creationContext.productSaved = true;
      const product = productCatalog[productId];
      const nameInput = dynamicForm.querySelector("[data-original-product-name]");
      if (nameInput) nameInput.value = product.name;
      const brand = dynamicForm.querySelector("[data-original-brand]");
      const category = dynamicForm.querySelector("[data-original-category]");
      const productMeta = product.brand && product.category ? [product.brand, product.category] : ({
        "mite-pro": ["轻净", "清洁电器"],
        "air-a8": ["轻净", "厨房电器"],
        "washer-s5": ["净界", "清洁电器"]
      }[productId] || ["轻净", "清洁电器"]);
      if (brand) brand.value = productMeta[0];
      if (category) category.value = productMeta[1];
      syncCreationProductControl(productId, product.name);
      const fieldMap = { core: product.core, secondary: product.secondary, difference: product.difference };
      Object.entries(fieldMap).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = value;
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(value || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      const factHint = dynamicForm.querySelector("[data-product-fact-hint]");
      if (factHint) factHint.textContent = product.facts;
      const primary = dynamicForm.querySelector('[data-field="primaryPsychology"]');
      const secondary = dynamicForm.querySelector('[data-field="secondaryPsychology"]');
      if (primary) primary.value = product.psychology[0];
      if (secondary) secondary.value = product.psychology[1] || "不选择";
      const reason = dynamicForm.querySelector("[data-psychology-reason] span");
      if (reason) reason.textContent = `${product.name}的购买决策更受“${product.psychology[0]}”驱动，并需要“${product.psychology[1] || "产品价值"}”降低决策成本。`;
      dynamicForm.querySelectorAll(".material-summary strong").forEach(label => {
        label.textContent = `${product.name} · 已绑定素材`;
      });
      if (activeType === "rewrite") refreshRewriteSetting();
      updateModalContext();
      if (announce) setFormFeedback(`已切换至“${product.name}”，并重新带入卖点、人群建议和禁用词。`);
    }

    function copyStructureSourceLabel(source) { return source === "qianchuan" ? "千川" : "自建"; }
    // 当前选中的脚本类型(用于联动文案结构下拉)
    let activeScriptType = "不限";
    function renderCopyStructurePicker(keyword = "") {
      const host = dynamicForm.querySelector("[data-copy-structure-options]");
      if (!host) return;
      const normalized = keyword.trim().toLowerCase();
      const productName = currentProduct().name;
      const currentId = dynamicForm.querySelector("[data-copy-structure-value]")?.value || "";
      const filteredCatalog = activeScriptType === "不限"
        ? copyStructureCatalog
        : copyStructureCatalog.filter(item => (item.scriptTypes || []).includes(activeScriptType));
      const structures = filteredCatalog
        .filter(item => !normalized || `${item.name} ${item.formula}`.toLowerCase().includes(normalized))
        .sort((a, b) => Number(b.source === "qianchuan" && b.products.includes(productName)) - Number(a.source === "qianchuan" && a.products.includes(productName)));
      const emptyHint = structures.length === 0
        ? `<div class="copy-structure-empty">「${activeScriptType}」暂未匹配到结构，可切换为「不限」由 AI 智能匹配</div>`
        : "";
      host.innerHTML = `<button class="copy-structure-option${currentId ? "" : " selected"}" type="button" data-copy-structure-id=""><span><b>不限</b><small>优先匹配当前产品的千川结构</small></span><em>不限</em></button>${structures.map(item => `<button class="copy-structure-option${currentId === item.id ? " selected" : ""}" type="button" data-copy-structure-id="${item.id}"><span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.formula)}</small></span><em>${copyStructureSourceLabel(item.source)}</em></button>`).join("")}${emptyHint}`;
    }

    // 脚本类型变更 → 联动文案结构:重新过滤下拉,自动锁定默认结构
    function syncCopyStructureByScriptType(scriptType) {
      activeScriptType = scriptType || "不限";
      const hint = document.getElementById("copyStructureHint");
      if (hint) {
        hint.textContent = scriptType === "不限"
          ? "优先匹配当前产品的千川结构，也可选择自建结构"
          : `已按「${scriptType}」筛选可用的文案结构`;
      }
      if (scriptType !== "不限") {
        const defaultId = SCRIPT_TYPE_DEFAULT_STRUCTURE[scriptType] || "";
        if (defaultId && copyStructureCatalog.find(s => s.id === defaultId && (s.scriptTypes || []).includes(scriptType))) {
          setCopyStructureSelection(defaultId);
        } else {
          setCopyStructureSelection("");
        }
      } else {
        setCopyStructureSelection("");
      }
    }

    function setCopyStructureSelection(id = "") {
      const item = copyStructureCatalog.find(structure => structure.id === id);
      const value = dynamicForm.querySelector("[data-copy-structure-value]");
      const label = dynamicForm.querySelector("[data-copy-structure-label]");
      const formula = dynamicForm.querySelector("[data-copy-structure-formula]");
      const source = dynamicForm.querySelector("[data-copy-structure-source]");
      if (value) value.value = item?.id || "";
      if (label) label.textContent = item?.name || "不限";
      if (formula) formula.textContent = item?.formula || "优先匹配当前产品的千川结构，也可选择自建结构";
      if (source) source.textContent = item ? copyStructureSourceLabel(item.source) : "不限";
      dynamicForm.querySelector("[data-copy-structure-combobox]")?.classList.remove("open");
      creationContext.originalFields.copyStructureId = item?.id || "";
      creationContext.originalFields.copyStructure = item?.name || "不限";
      renderCopyStructurePicker();
    }

    function captureOriginalContext() {
      if (!isStructuredCopyFlow()) return;
      dynamicForm.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      dynamicForm.querySelectorAll("[data-field]").forEach(field => {
        creationContext.originalFields[field.dataset.field] = field.value;
      });
      creationContext.productName = dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || creationContext.productName;
      creationContext.originalFields.brand = dynamicForm.querySelector("[data-original-brand]")?.value || "";
      creationContext.originalFields.category = dynamicForm.querySelector("[data-original-category]")?.value || "";
      creationContext.originalFields.wordCount = dynamicForm.querySelector("[data-word-count]")?.value || "300";
      creationContext.originalFields.generationCount = dynamicForm.querySelector("[data-generation-count]")?.value || "3";
      creationContext.originalFields.marketingScene = dynamicForm.querySelector('[data-role="marketing-scene"] .choice-chip.active')?.textContent.trim() || "直播间引流";
      const selectedStructureId = dynamicForm.querySelector("[data-copy-structure-value]")?.value || "";
      const selectedStructure = copyStructureCatalog.find(item => item.id === selectedStructureId);
      creationContext.originalFields.copyStructureId = selectedStructureId;
      creationContext.originalFields.copyStructure = selectedStructure?.name || "不限";
      creationContext.originalFields.scriptType = dynamicForm.querySelector('[data-role="script-type"] .choice-chip.active')?.textContent.trim() || "不限";
      creationContext.originalFields.gender = dynamicForm.querySelector('[data-role="gender"] .choice-chip.active')?.textContent.trim() || "";
      const selectedAge = dynamicForm.querySelector('[data-role="age"] .choice-chip.active')?.textContent.trim() || "";
      creationContext.originalFields.age = selectedAge === "自定义"
        ? `${dynamicForm.querySelector("[data-age-min]")?.value || 18}–${dynamicForm.querySelector("[data-age-max]")?.value || 35}`
        : selectedAge;
      creationContext.originalFields.audiences = [...dynamicForm.querySelectorAll(".audience-chip.active")].map(item => item.textContent.trim());
      if (activeType === "rewrite") {
        creationContext.originalFields.rewriteMethod = dynamicForm.querySelector('[data-single="rewrite-method"] .choice-chip.active')?.dataset.rewriteMethod || "hook";
        creationContext.originalFields.rewriteSource = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
      }
      creationContext.originalFields.advancedOpen = dynamicForm.querySelector("[data-action='toggle-original-advanced']")?.classList.contains("active") || false;
    }

    function hydrateOriginalContext() {
      if (!isStructuredCopyFlow()) return;
      const contextProductId = creationContext.productId;
      setProductSource(creationContext.productSource || "library");
      if (productCatalog[contextProductId]) applyProductToForm(contextProductId);
      const fields = creationContext.originalFields;
      const manualName = dynamicForm.querySelector("[data-manual-product-name]");
      if (manualName) manualName.value = creationContext.productName || "";
      Object.entries(fields).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field && typeof value === "string") field.value = value;
        if ((key === "core" || key === "secondary" || key === "trust") && typeof value === "string") setPointEditorValues(key, value.split("\n").filter(Boolean));
      });
      const wordCount = dynamicForm.querySelector("[data-word-count]");
      if (wordCount && fields.wordCount) wordCount.value = fields.wordCount;
      const generationCount = dynamicForm.querySelector("[data-generation-count]");
      if (generationCount && fields.generationCount) generationCount.value = fields.generationCount;
      ["marketingScene", "scriptType", "gender", "age"].forEach(key => {
        const role = { marketingScene:"marketing-scene", scriptType:"script-type", gender:"gender", age:"age" }[key];
        if (!fields[key]) return;
        dynamicForm.querySelectorAll(`[data-role="${role}"] .choice-chip`).forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === fields[key]));
      });
      if (fields.age && /^\d+[–-]\d+$/.test(fields.age)) {
        const [min, max] = fields.age.split(/[–-]/);
        dynamicForm.querySelectorAll('[data-role="age"] .choice-chip').forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === "自定义"));
        const customAge = dynamicForm.querySelector("[data-custom-age]");
        if (customAge) customAge.hidden = false;
        const minInput = dynamicForm.querySelector("[data-age-min]");
        const maxInput = dynamicForm.querySelector("[data-age-max]");
        if (minInput) minInput.value = min;
        if (maxInput) maxInput.value = max;
      }
      if (Array.isArray(fields.audiences)) setActiveAudience(fields.audiences);
      if (activeType === "rewrite" && fields.rewriteMethod) {
        dynamicForm.querySelectorAll('[data-single="rewrite-method"] .choice-chip').forEach(chip => chip.classList.toggle("active", chip.dataset.rewriteMethod === fields.rewriteMethod));
        refreshRewriteSetting();
        const target = dynamicForm.querySelector('[data-field="rewriteTarget"]');
        if (target && fields.rewriteTarget) target.value = fields.rewriteTarget;
      }
      if (activeType === "rewrite" && fields.rewriteSource) {
        const source = dynamicForm.querySelector("[data-rewrite-source]");
        if (source) source.value = fields.rewriteSource;
        rewriteSourceState[fields.rewriteSource] = fields.sourceCopy || rewriteSourceState[fields.rewriteSource] || "";
        refreshRewriteSource(true);
      }
      if (fields.brand) dynamicForm.querySelector("[data-original-brand]").value = fields.brand;
      if (fields.category) dynamicForm.querySelector("[data-original-category]").value = fields.category;
      if (dynamicForm.querySelector("[data-copy-structure-combobox]")) {
        activeScriptType = fields.scriptType || "不限";
        syncCopyStructureByScriptType(activeScriptType);
        if (fields.copyStructureId) setCopyStructureSelection(fields.copyStructureId);
      }
      setOriginalAdvanced(Boolean(fields.advancedOpen));
      refreshWordDuration();
    }

    function recognizeLinkedProduct() {
      const linkInput = dynamicForm.querySelector("[data-product-link]");
      const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
      const link = linkInput?.value.trim() || "";
      if (!link) {
        feedback.hidden = false;
        feedback.className = "parse-state failed";
        feedback.innerHTML = "<strong>解析失败</strong><span>请先粘贴有效的商品链接。</span>";
        linkInput.focus();
        return;
      }
      feedback.hidden = false;
      feedback.className = "parse-state parsing";
      feedback.innerHTML = "<strong>正在解析</strong><span>正在识别商品名称、品牌、类目和卖点…</span>";
      const parseButton = dynamicForm.querySelector('[data-action="recognize-product"]');
      if (parseButton) { parseButton.disabled = true; parseButton.textContent = "解析中"; }
      creationContext.productConfirmed = false;
      setTimeout(() => {
        if (parseButton) { parseButton.disabled = false; parseButton.textContent = "解析商品"; }
        if (link.toLowerCase().includes("fail")) {
          feedback.className = "parse-state failed";
          feedback.innerHTML = '<strong>解析失败</strong><span>链接暂时无法访问，请检查后重试。</span><button type="button" data-action="recognize-product">重试</button>';
          return;
        }
        const existing = Object.values(productDetailData || {}).find(item => item.link && item.link === link);
        if (existing) {
          feedback.className = "parse-state failed";
          feedback.innerHTML = `<strong>产品已存在</strong><span>该链接已关联“${escapeHtml(existing.name)}”，请直接从产品库选择。</span><button type="button" data-use-existing-product="${escapeHtml(existing.id || "mite-pro")}">使用已有产品</button>`;
          return;
        }
      const recognizedId = "linked-mite-x1";
      productCatalog[recognizedId] = {
        name: "轻净 X1 无线除螨仪",
        brand: "轻净",
        category: "清洁电器",
        core: "无线轻量机身，拍打与吸尘同步完成",
        secondary: "双尘杯分离设计，支持拆卸清理",
        difference: "摆脱电源线限制，床垫和沙发切换更方便",
        audiences: ["宝妈家庭", "养宠家庭", "租房人群"],
        psychology: ["省时省力", "理性求证"],
        facts: "AI识别 16 项产品信息，其中 3 项需人工确认"
      };
      creationContext.productId = recognizedId;
      creationContext.productName = productCatalog[recognizedId].name;
      creationContext.productConfirmed = false;
      creationContext.productSaved = false;
      const product = productCatalog[recognizedId];
      const nameInput = dynamicForm.querySelector("[data-original-product-name]");
      if (nameInput) nameInput.value = product.name;
      const brandInput = dynamicForm.querySelector("[data-original-brand]");
      const categoryInput = dynamicForm.querySelector("[data-original-category]");
      if (brandInput) brandInput.value = product.brand;
      if (categoryInput) categoryInput.value = product.category;
      ["core", "secondary", "difference"].forEach(key => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = product[key];
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(product[key] || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      ["marketing", "trust", "pain", "scenes"].forEach(key => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = "";
        if (key === "trust") setPointEditorValues("trust", [""]);
      });
      feedback.hidden = false;
      const partial = link.toLowerCase().includes("partial");
      if (partial) {
        if (brandInput) brandInput.value = "";
        if (categoryInput) categoryInput.value = "";
        feedback.className = "parse-state partial";
        feedback.innerHTML = `<strong>部分完成</strong><span>品牌、类目未识别，请手工补充后继续。</span>`;
      } else {
        feedback.className = "parse-state success";
        feedback.innerHTML = `<strong>解析完成</strong><span>产品信息已回填，可检查并继续编辑。</span>`;
      }
      updateModalContext();
      setFormFeedback("");
      }, 850);
    }

    function refineSellingPoints() {
      const product = currentProduct();
      const refined = {
        core: `${product.core}，先展示可见清洁结果，再说明产品能力`,
        secondary: `${product.secondary}；突出日常使用和清理便利`,
        difference: `${product.difference}，与普通表面清扫形成清晰差异`
      };
      Object.entries(refined).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = value;
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(value).split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      const feedback = dynamicForm.querySelector("[data-selling-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = "<strong>已提炼 · 待确认</strong><span>卖点已按“核心能力—使用价值—差异证明”重新组织，仍可人工修改。</span>";
      }
      creationContext.productSaved = false;
      creationContext.productConfirmed = false;
      updateModalContext();
      setFormFeedback("AI卖点提炼完成，请确认内容后保存产品档案。");
    }

    function saveProductToArchive() {
      const core = dynamicForm.querySelector('[data-field="core"]');
      const manualName = dynamicForm.querySelector("[data-manual-product-name]");
      if (!core?.value.trim()) {
        core.closest(".original-field, .field")?.classList.add("invalid");
        setFormFeedback("核心卖点不能为空。", "error");
        core.closest("[data-point-editor]")?.querySelector("[data-point-value]")?.focus();
        return;
      }
      if (creationContext.productSource === "manual" && !manualName?.value.trim()) {
        manualName.closest(".original-field, .field")?.classList.add("invalid");
        setFormFeedback("请填写产品名称。", "error");
        manualName.focus();
        return;
      }
      if (creationContext.productSource === "manual") {
        creationContext.productName = manualName.value.trim();
        creationContext.productId = "manual-product";
      }
      captureOriginalContext();
      productCatalog[creationContext.productId] = {
        ...(productCatalog[creationContext.productId] || {}),
        name: creationContext.productName || currentProduct().name,
        core: dynamicForm.querySelector('[data-field="core"]')?.value.trim() || "",
        secondary: dynamicForm.querySelector('[data-field="secondary"]')?.value.trim() || "",
        difference: dynamicForm.querySelector('[data-field="difference"]')?.value.trim() || "",
        trust: dynamicForm.querySelector('[data-field="trust"]')?.value.trim() || "",
        brand: dynamicForm.querySelector('[data-original-brand]')?.value || "",
        category: dynamicForm.querySelector('[data-original-category]')?.value || "",
        audiences: [...dynamicForm.querySelectorAll(".audience-chip.active")].map(item => item.textContent.trim()),
        psychology: [
          dynamicForm.querySelector('[data-field="primaryPsychology"]')?.value || "风险规避",
          dynamicForm.querySelector('[data-field="secondaryPsychology"]')?.value || "理性求证"
        ],
        facts: "产品事实已由用户确认，可用于内容生成"
      };
      creationContext.productConfirmed = true;
      creationContext.productSaved = true;
      updateModalContext();
      setFormFeedback(`“${currentProduct().name}”已保存至产品档案，AI识别字段已确认为可用事实。`);
      showToast("产品档案已保存");
    }

    function saveCreationPreset() {
      captureOriginalContext();
      const product = currentProduct();
      const style = creationContext.originalFields.style || "不限";
      const name = `${product.name}｜${style}｜${creationContext.originalFields.wordCount || 120}字`;
      if (!creationContext.customPresets.includes(name)) creationContext.customPresets.push(name);
      const select = dynamicForm.querySelector("[data-creation-preset]");
      const option = document.createElement("option");
      option.value = `custom-${creationContext.customPresets.length}`;
      option.textContent = name;
      option.selected = true;
      select.append(option);
      const feedback = dynamicForm.querySelector("[data-preset-feedback]");
      feedback.hidden = false;
      feedback.innerHTML = `<strong>预设已保存</strong><span>${name}。下次选择后可直接复用风格、人群、心理和CTA。</span>`;
      showToast("创作预设已保存");
    }

    function applyCreationPreset(value) {
      if (!value) return;
      const styleText = value === "pet-hard-ad" ? "制造焦虑类型" : "痛点类型";
      dynamicForm.querySelectorAll('[data-role="style"] .choice-chip').forEach(chip => {
        chip.classList.toggle("active", chip.textContent.trim() === styleText);
      });
      const audiences = value === "pet-hard-ad" ? ["养宠家庭"] : ["宝妈家庭"];
      setActiveAudience(audiences);
      const primary = dynamicForm.querySelector('[data-field="primaryPsychology"]');
      if (primary) primary.value = value === "pet-hard-ad" ? "风险规避" : "损失厌恶";
      const feedback = dynamicForm.querySelector("[data-preset-feedback]");
      feedback.hidden = false;
      feedback.innerHTML = "<strong>预设已应用</strong><span>已更新文案风格、目标人群和CTA，产品事实保持不变。</span>";
      setFormFeedback("创作预设已应用，可继续调整后生成。");
    }

    function renderMaterialScopeDetail(row, label) {
      if (activeType === "script") return;
      if (!row?.dataset.single?.includes("material")) return;
      const field = row.closest(".field");
      let detail = field.parentElement.querySelector("[data-material-scope-detail]");
      if (!detail) {
        detail = document.createElement("div");
        detail.className = "material-scope-detail";
        detail.dataset.materialScopeDetail = "";
        field.insertAdjacentElement("afterend", detail);
      }
      if (label.includes("指定")) {
        detail.innerHTML = `
          <div class="smart-tip"><strong>选择素材分组</strong><span>已从当前产品素材池中筛出可用分组，可多选。</span></div>
          <div class="choice-row" style="margin-top:8px;"><span class="choice-chip active">产品功能实拍 · 186段</span><span class="choice-chip active">家庭场景 · 94段</span><span class="choice-chip">达人口播 · 63段</span><span class="choice-chip">历史高频镜头 · 128段</span></div>`;
      } else if (label.includes("临时")) {
        detail.innerHTML = `<div class="upload-box" role="button" tabindex="0"><strong>上传本次任务素材</strong><span>仅用于当前任务；生成后可选择绑定至${currentProduct().name}</span></div>`;
      } else {
        detail.innerHTML = `<div class="inline-feedback success"><strong>自动带入</strong><span>将使用“${currentProduct().name}”下全部可用素材，并按镜头匹配度、画质和重复使用率自动排序。</span></div>`;
      }
    }

    function pointRowHtml(value = "") {
      return `<div class="point-row"><span class="point-index">●</span><input data-point-value value="${escapeHtml(value)}"><span class="point-actions"><button type="button" data-point-action="up" title="上移">↑</button><button type="button" data-point-action="down" title="下移">↓</button><button type="button" data-point-action="remove" title="删除">×</button></span></div>`;
    }

    function syncPointEditor(editor) {
      if (!editor) return;
      const values = [...editor.querySelectorAll("[data-point-value]")].map(input => input.value.trim()).filter(Boolean);
      const storage = editor.querySelector("textarea[data-field]");
      if (storage) storage.value = values.join("\n");
      editor.querySelectorAll(".point-row").forEach((row, index) => {
        const dot = row.querySelector(".point-index");
        if (dot) dot.title = `第 ${index + 1} 条`;
      });
    }

    function setPointEditorValues(type, values = []) {
      const editor = dynamicForm.querySelector(`[data-point-editor="${type}"]`);
      if (!editor) return;
      const add = editor.querySelector(".point-add");
      const storage = editor.querySelector("textarea[data-field]");
      editor.querySelectorAll(".point-row").forEach(row => row.remove());
      const cleanValues = values.map(item => String(item).trim()).filter(Boolean);
      (cleanValues.length ? cleanValues : [""]).forEach(value => add.insertAdjacentHTML("beforebegin", pointRowHtml(value)));
      if (storage) storage.value = cleanValues.join("\n");
      syncPointEditor(editor);
    }

    function setOriginalAdvanced(open) {
      dynamicForm.querySelectorAll(".advanced-field").forEach(field => { field.hidden = !open; });
      const toggle = dynamicForm.querySelector("[data-action='toggle-original-advanced']");
      if (toggle) {
        toggle.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "收起高级设置" : "展开高级设置";
      }
      updateAdvancedFooterToggle();
    }

    function advancedFieldProgress() {
      const fields = [...dynamicForm.querySelectorAll(".advanced-field")];
      const complete = fields.filter(field => {
        const controls = [...field.querySelectorAll("input:not([type='hidden']), textarea, select")];
        const hasValue = controls.some(control => String(control.value || "").trim() && control.value !== "不限");
        const hasChoice = Boolean(field.querySelector(".choice-chip.active:not([data-value='不限']), .original-audience-chip.active, [aria-pressed='true']"));
        return hasValue || hasChoice;
      }).length;
      return { complete, total:fields.length };
    }

    function updateAdvancedFooterToggle() {
      const button = taskActionButtons?.querySelector("[data-footer-advanced-toggle]");
      if (!button) return;
      const open = Boolean(dynamicForm.querySelector(".advanced-field:not([hidden])"));
      button.classList.toggle("active", open);
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "收起高级设置" : "高级设置（可选）";
    }

    const originalAiSuggestions = {
      core: [
        ["大吸力深入床褥缝隙，拍打吸尘同步完成", "边拍边吸带走织物深处毛发与碎屑", "透明尘杯让清洁结果看得见"],
        ["高频拍打松动织物深处碎屑", "吸尘与拍打同步完成深层清洁", "床垫、沙发和布艺均可使用"],
        ["针对床褥缝隙完成深层吸尘", "清洁过程与结果都能直观看见", "一次操作覆盖多种家庭软装场景"]
      ],
      secondary: [
        ["透明尘杯可拆卸水洗", "床垫、沙发和布艺均可使用", "机身轻巧，日常取用方便"],
        ["清洁后尘杯可直接拆洗", "电源线满足卧室日常清洁范围", "收纳体积小，不占家庭空间"],
        ["操作步骤简单，拿起即可使用", "多种软装场景无需更换工具", "使用结束后清理维护方便"]
      ],
      trust: [
        ["整机质保 1 年，产品参数与包装清单可核验", "官方渠道销售，支持正品验证", "核心功能均有真实产品资料支持"],
        ["产品型号、参数与售后信息均可查询", "公司自有产品实拍可验证使用过程", "透明尘杯可直接展示清洁结果"],
        ["包装清单和售后政策信息完整", "历史真实素材可追溯产品表现", "所有对外功能表达均来源于产品事实"]
      ],
      pain: [
        ["孩子后背红疹反复，半夜痒醒哭闹", "床单刚换，尘杯仍吸出毛发碎屑", "宠物上床后，床褥清洁总停在表面"],
        ["肉眼看着干净，织物深处仍藏着毛发碎屑", "普通粘毛器只能处理表面", "床垫沙发体积大，清洁频率低"],
        ["清洁结果看不见，不知道有没有吸干净", "机器难清理，使用一次就闲置", "多种布艺需要反复更换工具"]
      ],
      scene: [
        ["宝宝家庭的床垫日常清洁", "养宠家庭的沙发布艺清洁", "换季时卧室床褥深层清洁"],
        ["换洗床单前后的床褥深层清洁", "宠物上床后的毛发碎屑清理", "客厅沙发与布艺座椅连续清洁"],
        ["卧室床垫的周期性清洁", "毛绒玩具与靠枕的日常清洁", "全屋软装集中清洁整理"]
      ]
    };
    const originalSuggestionIndex = {};
    const originalSuggestionPrevious = {};
    const originalSuggestionDirty = new Set();

    function originalSuggestionKey(type, agentType = activeType) {
      return `${agentType}:${type}`;
    }

    function readOriginalSuggestion(type) {
      if (type === "core" || type === "secondary" || type === "trust") {
        return [...dynamicForm.querySelectorAll(`[data-point-editor="${type}"] [data-point-value]`)].map(input => input.value.trim()).filter(Boolean);
      }
      const fieldName = type === "scene" ? "scenes" : type;
      return (dynamicForm.querySelector(`[data-field="${fieldName}"]`)?.value || "").split(/\n+/).map(value => value.trim()).filter(Boolean);
    }

    function applyOriginalSuggestion(type, values) {
      if (type === "core" || type === "secondary" || type === "trust") setPointEditorValues(type, values);
      const fieldName = type === "scene" ? "scenes" : type;
      if (type === "pain" || type === "scene") {
        const field = dynamicForm.querySelector(`[data-field="${fieldName}"]`);
        if (field) field.value = values.join("\n");
      }
      creationContext.productConfirmed = false;
      creationContext.productSaved = false;
      updateModalContext();
    }

    function restoreOriginalSuggestion(type, key) {
      const values = originalSuggestionPrevious[key];
      if (!values) return;
      applyOriginalSuggestion(type, values);
      originalSuggestionDirty.delete(key);
      showToast("已恢复上一组内容");
    }

    function requireProductInfoForAiSuggestion() {
      const fields = [
        dynamicForm.querySelector("[data-original-product-name]"),
        dynamicForm.querySelector("[data-original-brand]"),
        dynamicForm.querySelector("[data-original-category]")
      ];
      const missing = fields.filter(field => !String(field?.value || "").trim());
      fields.forEach(field => field?.closest(".original-field")?.classList.toggle("invalid", missing.includes(field)));
      if (!missing.length) return true;
      setFormFeedback("请先选择、解析或填写完整产品信息，再使用 AI 换一组。", "error");
      missing[0]?.focus();
      return false;
    }

    async function regenerateOriginalSuggestion(type, button) {
      if (!requireProductInfoForAiSuggestion()) return;
      const groups = originalAiSuggestions[type] || [];
      if (!groups.length || button?.disabled) return;
      const requestAgentType = activeType;
      const key = originalSuggestionKey(type, requestAgentType);
      const label = { core:"核心卖点", secondary:"次要卖点", trust:"信任背书", pain:"人群核心痛点", scene:"使用场景" }[type] || "当前内容";
      if (originalSuggestionDirty.has(key) && !confirm(`${label}已被手动修改。继续换一组将覆盖当前内容，是否继续？`)) return;
      const defaultLabel = button?.textContent || "AI 换一组";
      if (button) { button.disabled = true; button.textContent = "生成中…"; }
      await new Promise(resolve => setTimeout(resolve, 520));
      if (activeType !== requestAgentType) return;
      originalSuggestionPrevious[key] = readOriginalSuggestion(type);
      originalSuggestionIndex[key] = ((originalSuggestionIndex[key] || 0) + 1) % groups.length;
      applyOriginalSuggestion(type, groups[originalSuggestionIndex[key]]);
      originalSuggestionDirty.delete(key);
      if (button?.isConnected) { button.disabled = false; button.textContent = defaultLabel; }
      showToast("已生成 3 条新建议", "撤销", () => restoreOriginalSuggestion(type, key));
    }

    function validateOriginalStep(step) {
      const panel = dynamicForm.querySelector(`[data-original-step="${step}"]`);
      if (!panel) return true;
      dynamicForm.querySelectorAll(".original-field.invalid").forEach(field => field.classList.remove("invalid"));
      panel.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      const requiredFields = [...panel.querySelectorAll("[data-required]")].filter(field => !field.parentElement?.closest("[hidden]"));
      const empty = requiredFields.find(field => !String(field.value || "").trim());
      if (empty) {
        empty.closest(".original-field")?.classList.add("invalid");
        if (!empty.hidden) empty.focus();
        setFormFeedback("请补充必填信息后再继续。", "error");
        return false;
      }
      if (step === 1) {
        if (activeType === "copy") {
          const referenceSource = panel.querySelector("[data-reference-source]")?.value || "library";
          const activeReferencePanel = panel.querySelector(`[data-reference-panel="${referenceSource}"]`);
          const referenceValue = activeReferencePanel?.querySelector("[data-reference-value]");
          const uploaded = activeReferencePanel?.querySelector("[data-reference-upload].selected");
          if (referenceSource === "upload" ? !uploaded : !String(referenceValue?.value || "").trim()) {
            activeReferencePanel?.querySelector(".original-field")?.classList.add("invalid");
            referenceValue?.focus();
            setFormFeedback("请先提供需要仿写的参考内容。", "error");
            return false;
          }
          if (panel.dataset.referenceReady !== "true") {
            setFormFeedback(
              referenceSource === "library"
                ? "请先从视频库选择参考视频。"
                : referenceSource === "copy-library"
                  ? "请先从文案库选择参考文案。"
                : referenceSource === "upload"
                  ? "请先上传参考视频。"
                  : "请先分析参考文案。",
              "error"
            );
            return false;
          }
        }
        if (creationContext.productSource === "link" && !creationContext.productId.startsWith("linked-")) {
          setFormFeedback("请先完成商品链接解析。", "error");
          return false;
        }
        if (!creationContext.productConfirmed) {
          setFormFeedback("请先确认并保存当前产品信息。", "error");
          return false;
        }
        const audienceCount = panel.querySelectorAll(".audience-chip.active").length;
        if (activeType !== "rewrite" && !audienceCount) {
          setFormFeedback("请至少选择一个抖音目标人群。", "error");
          return false;
        }
        if (!panel.querySelector("[data-custom-age]")?.hidden) {
          const min = Number(panel.querySelector("[data-age-min]")?.value || 0);
          const max = Number(panel.querySelector("[data-age-max]")?.value || 0);
          if (min > max) {
            setFormFeedback("自定义年龄的起始值不能大于结束值。", "error");
            return false;
          }
        }
      }
      if (step === 2 && activeType === "rewrite" && !panel.querySelector("[data-rewrite-custom-age]")?.hidden) {
        const min = Number(panel.querySelector("[data-rewrite-age-min]")?.value || 0);
        const max = Number(panel.querySelector("[data-rewrite-age-max]")?.value || 0);
        if (min > max) {
          setFormFeedback("改写后目标人群的年龄起始值不能大于结束值。", "error");
          return false;
        }
      }
      setFormFeedback("");
      captureOriginalContext();
      return true;
    }

    function validateAgentForm() {
      dynamicForm.querySelectorAll(".field.invalid").forEach(field => field.classList.remove("invalid"));
      if (activeType === "script") {
        if (!validateScriptStep(1) || !validateScriptStep(2)) return false;
        captureScriptContext();
        return true;
      }
      if (!isStructuredCopyFlow()) return true;
      if (!validateOriginalStep(1) || !validateOriginalStep(2)) return false;
      captureOriginalContext();
      return true;
    }

    function getScriptProductInput(sourceMode) {
      if (sourceMode === "library") {
        return dynamicForm.querySelector('[data-script-product-panel="library"] [data-script-product]');
      }
      return dynamicForm.querySelector('[data-script-product-panel="manual"] [data-script-manual-product-panel]:not([hidden]) [data-script-product]');
    }

    // 智能脚本 Agent 校验:步骤①(来源文案/产品/配音/时长) + 步骤②(素材与模型)
    function validateScriptStep(step) {
      const panel = dynamicForm.querySelector(`.form-section[data-task-step="${step}"]`);
      if (!panel) return true;
      const materialMode = dynamicForm.querySelector('[data-role="script-material-mode"] .choice-chip.active')?.dataset.materialMode || "depend";
      // 步骤①校验
      if (step === 1) {
        const sourceMode = panel.querySelector("[data-script-source-mode].active")?.dataset.scriptSourceMode || "library";
        const sourceValue = sourceMode === "library"
          ? panel.querySelector("[data-script-source-library]")?.value
          : panel.querySelector("[data-script-source-text]")?.value.trim();
        if (!sourceValue) {
          const field = sourceMode === "library"
            ? panel.querySelector("[data-script-source-library]")
            : panel.querySelector("[data-script-source-text]");
          field?.closest(".field")?.classList.add("invalid");
          field?.focus();
          setFormFeedback(sourceMode === "library" ? "请从文案库选择一条口播文案。" : "请输入需要转为分镜的口播文案。", "error");
          return false;
        }
        const productInput = getScriptProductInput(sourceMode);
        if (!productInput?.value.trim()) {
          productInput?.closest(".field")?.classList.add("invalid");
          productInput?.focus();
          setFormFeedback(sourceMode === "library" ? "请先选择一条关联产品的文案。" : "请输入或选择对应产品。", "error");
          return false;
        }
        const duration = getScriptDuration();
        if (!Number.isInteger(duration) || duration <= 0 || duration > 600) {
          panel.querySelector("[data-script-duration]")?.closest(".field")?.classList.add("invalid");
          setFormFeedback("目标时长请输入 1–600 的正整数。", "error");
          return false;
        }
        if (!dynamicForm.querySelector("[data-script-voice]")?.value) {
          dynamicForm.querySelector("[data-script-voice]")?.closest(".field")?.classList.add("invalid");
          setFormFeedback("请选择配音角色。", "error");
          return false;
        }
      }
      // 步骤②校验
      if (step === 2) {
        if (materialMode === "depend") {
          const groupCount = (window.__scriptMaterialSelected || []).length;
          if (groupCount === 0) {
            const errBox = dynamicForm.querySelector("[data-material-group-error]");
            if (errBox) errBox.hidden = false;
            setFormFeedback("请至少选择 1 条素材。", "error");
            return false;
          }
        }
        const model = dynamicForm.querySelector("[data-script-model]")?.value;
        if (!model) {
          setFormFeedback("请选择脚本生成大模型。", "error");
          return false;
        }
      }
      // 清除该步所有 .invalid
      panel.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
      const errBox = dynamicForm.querySelector("[data-material-group-error]");
      if (errBox) errBox.hidden = true;
      setFormFeedback("");
      return true;
    }

    // 读取目标时长(正整数秒)
    function getScriptDuration() {
      return Number(dynamicForm.querySelector("[data-script-duration]")?.value || 0);
    }

    // 采集智能脚本 Agent 的当前参数,用于生成请求和汇总面板
    function captureScriptContext() {
      if (activeType !== "script") return;
      const sourceMode = dynamicForm.querySelector("[data-script-source-mode].active")?.dataset.scriptSourceMode || "library";
      const productInput = getScriptProductInput(sourceMode);
      const product = productInput?.dataset.productId || "";
      const materialMode = dynamicForm.querySelector('[data-role="script-material-mode"] .choice-chip.active')?.dataset.materialMode || "depend";
      const sourceValue = sourceMode === "library"
        ? dynamicForm.querySelector("[data-script-source-library]")?.value
        : dynamicForm.querySelector("[data-script-source-text]")?.value || "";
      // 素材分组从 window.__scriptMaterialSelected 读取(由弹窗写入)
      const materialIds = window.__scriptMaterialSelected || [];
      const materialGroups = [...new Set(materialIds.map(id => findScriptMaterial(id)?.group).filter(Boolean))].map(id => ({
        id,
        name: id,
        tagCount: materialIds.filter(materialId => findScriptMaterial(materialId)?.group === id).length
      }));
      creationContext.script = {
        sourceMode,
        sourceValue,
        sourceLabel: sourceMode === "library"
          ? (() => { const item = SCRIPT_LIBRARY_ITEMS.find(i => i.id === sourceValue); return item ? `${productCatalog[item.productId]?.name || ""} · ${item.text.slice(0, 24)}…` : ""; })()
          : (dynamicForm.querySelector("[data-script-source-text]")?.value || "").slice(0, 60) + (dynamicForm.querySelector("[data-script-source-text]")?.value.length > 60 ? "…" : ""),
        product,
        productName: productInput?.value.trim() || "",
        duration: getScriptDuration(),
        sourceText: sourceMode === "library" ? (dynamicForm.querySelector("[data-script-source-content]")?.value || "") : sourceValue,
        voice: dynamicForm.querySelector("[data-script-voice]")?.value || "",
        materialMode,
        materialProduct: product,
        materialIds,
        materialGroups,
        model: dynamicForm.querySelector("[data-script-model]")?.value || "gpt-5-6-terra",
        version: 1
      };
    }

    // 渲染确认生成步骤的只读汇总面板
    function renderScriptSummary() {
      const host = dynamicForm.querySelector("[data-script-summary]");
      if (!host) return;
      const ctx = creationContext.script || {};
      const productName = productCatalog[ctx.product]?.name || "未选择";
      const materialProductName = productCatalog[ctx.materialProduct]?.name || productName;
      const modelLabels = { auto:"系统默认 gemini", "gpt-4o":"GPT-4o", "claude-sonnet":"Claude Sonnet 4.5", "qwen-max":"Qwen Max", "deepseek-v3":"DeepSeek V3" };
      const modeLabel = ctx.materialMode === "depend" ? "依赖素材库" : "不依赖素材库";
      const groupChips = (ctx.materialGroups || []).map(g => `<span class="script-summary-chip">${escapeHtml(g.name)} <small>${g.tagCount} 个标签</small></span>`).join("") || '<span class="script-summary-empty">不适用(不依赖素材库模式)</span>';
      const sourceSummary = ctx.sourceMode === "library"
        ? `<b>文案库选择</b> · ${escapeHtml(ctx.sourceLabel || "—")}`
        : `<b>手动输入</b> · ${escapeHtml((ctx.sourceValue || "").slice(0, 80))}${(ctx.sourceValue || "").length > 80 ? "…" : ""}`;
      host.innerHTML = `
        <div class="script-summary-grid">
          <div class="script-summary-item">
            <span class="script-summary-label">来源文案</span>
            <div class="script-summary-value">${sourceSummary}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">口播摘要</span>
            <div class="script-summary-value">${ctx.sourceMode === "library"
              ? `<i>${escapeHtml(SCRIPT_LIBRARY_PREVIEWS[ctx.sourceValue] || "已选文案内容将作为本次分镜输入")}</i>`
              : `<i>${escapeHtml((ctx.sourceValue || "").slice(0, 80) + ((ctx.sourceValue || "").length > 80 ? "…" : ""))}</i>`}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">对应产品</span>
            <div class="script-summary-value"><b>${escapeHtml(productName)}</b></div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">目标时长</span>
            <div class="script-summary-value"><b>${ctx.duration || 30} 秒</b></div>
          </div>
          <div class="script-summary-item"><span class="script-summary-label">配音角色</span><div class="script-summary-value"><b>${escapeHtml(ctx.voice || "—")}</b></div></div>
          <div class="script-summary-item">
            <span class="script-summary-label">是否依赖素材库</span>
            <div class="script-summary-value"><b>${modeLabel}</b></div>
          </div>
          <div class="script-summary-item${ctx.materialMode === "depend" ? "" : " is-muted"}">
            <span class="script-summary-label">${ctx.materialMode === "depend" ? "素材来源产品" : "素材来源产品(隐藏)"}</span>
            <div class="script-summary-value">${ctx.materialMode === "depend" ? `<b>${escapeHtml(materialProductName)}</b>` : `<i>不适用</i>`}</div>
          </div>
          <div class="script-summary-item full${ctx.materialMode === "depend" ? "" : " is-muted"}">
            <span class="script-summary-label">已勾选素材分组${ctx.materialMode === "depend" ? "" : "(隐藏)"}</span>
            <div class="script-summary-value script-summary-groups">${groupChips}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">选用大模型</span>
            <div class="script-summary-value"><b>${escapeHtml(modelLabels[ctx.model] || ctx.model || "—")}</b></div>
          </div>
        </div>
        <div class="script-summary-tip">
          <i>ℹ</i>
          <span>${ctx.materialMode === "depend"
            ? "本次分镜将按已勾选分组匹配素材;若某镜头在当前分组下无合适素材,系统会标记提示。"
            : "本次分镜将输出生视频提示词列,可一键复制到即梦等第三方生视频工具使用。"}</span>
        </div>
      `;
    }

    // 文案库数据：一条文案只对应一个目标人群，避免混用不同人群的表达策略。
    const SCRIPT_LIBRARY_ITEMS = [
      {
        id: "mite-summer", productId: "mite-pro",
        text: "刚换的床单,也能吸出一杯脏东西。看得见的是表面,看不见的都藏在床垫深处。轻净 Pro 边拍边吸,脏东西直接进尘杯,用完还能拆下水洗。",
        audience: "家庭主妇", structure: "结果直给型",
        source: "AI 生成", createdBy: "嗡大发", createdAt: "2026-08-05 14:20", updatedBy: "嗡大发", scope: "mine", updated: "2026-08-05 14:20"
      },
      {
        id: "mite-family", productId: "mite-pro",
        text: "床单刚换一周,第一遍照样能吸出碎屑和毛发。床垫深处的脏东西,普通清理根本触达不到。轻净 Pro 拍打吸尘同步完成,尘杯可水洗。",
        audience: "年轻父母", structure: "痛点钩子型",
        source: "AI 生成", createdBy: "嗡大发", createdAt: "2026-08-05 14:20", updatedBy: "嗡大发", scope: "mine", updated: "2026-08-05 14:25"
      },
      {
        id: "mite-pet", productId: "mite-pro",
        text: "家里养宠物,床铺最该清理的是藏起来的毛。刚洗完的床单,宠物上去转一圈就又有碎屑。轻净 Pro 大吸力,一拍一吸全带走。",
        audience: "养宠人群", structure: "场景痛点型",
        source: "AI 生成", createdBy: "嗡大发", createdAt: "2026-08-05 14:20", updatedBy: "嗡大发", scope: "mine", updated: "2026-08-05 14:30"
      },
      {
        id: "mite-rationale", productId: "mite-pro",
        text: "先不讲参数,直接看一次真实使用。轻净 Pro 工作时可以做到深层清洁,处理后的变化通过尘杯直接呈现。",
        audience: "理性消费者", structure: "实测证明型",
        source: "AI 生成", createdBy: "李四", createdAt: "2026-08-04 10:12", updatedBy: "李四", scope: "team", updated: "2026-08-04 10:12"
      },
      {
        id: "mite-curiosity", productId: "mite-pro",
        text: "明明刚整理过,为什么再次处理还能看到变化?答案不靠猜,直接看完整演示。",
        audience: "好奇心驱动", structure: "悬念钩子型",
        source: "AI 生成", createdBy: "李四", createdAt: "2026-08-04 10:12", updatedBy: "李四", scope: "team", updated: "2026-08-04 10:18"
      }
    ];
    const copyTimestamp = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    const notifyCopyChange = () => window.dispatchEvent(new CustomEvent("content-compass:copies-updated"));
    window.ContentCompassCopyLibrary = {
      list: () => SCRIPT_LIBRARY_ITEMS,
      update(id, patch = {}) {
        const item = SCRIPT_LIBRARY_ITEMS.find(entry => entry.id === id);
        if (!item) return null;
        Object.assign(item, patch, { updated: copyTimestamp(), updatedBy: "嗡大发" });
        SCRIPT_LIBRARY_PREVIEWS[id] = item.text;
        notifyCopyChange();
        return item;
      },
      remove(id) {
        const index = SCRIPT_LIBRARY_ITEMS.findIndex(entry => entry.id === id);
        if (index < 0) return false;
        const [removed] = SCRIPT_LIBRARY_ITEMS.splice(index, 1);
        delete SCRIPT_LIBRARY_PREVIEWS[removed.id];
        notifyCopyChange();
        return true;
      }
    };
    const SCRIPT_LIBRARY_PREVIEWS = Object.fromEntries(SCRIPT_LIBRARY_ITEMS.map(i => [i.id, i.text]));

    // 智能脚本 Agent 事件绑定:在 prepareTaskForm 后调用一次
    function bindScriptAgentEvents() {
      const root = dynamicForm;
      if (!root) return;
      renderScriptModelCards();
      refreshScriptLibraryTrigger();
      syncScriptLibraryProductDisplay();
      refreshScriptMaterialSummary();

      // 1) 来源文案:模式切换
      root.querySelectorAll(".source-mode-switch [data-script-source-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          const mode = btn.dataset.scriptSourceMode;
          root.querySelectorAll(".source-mode-switch [data-script-source-mode]").forEach(b => {
            const active = b === btn;
            b.classList.toggle("active", active);
            b.setAttribute("aria-selected", active ? "true" : "false");
          });
          root.querySelectorAll("[data-script-source-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptSourcePanel !== mode;
          });
          root.querySelectorAll("[data-script-product-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptProductPanel !== mode;
          });
          root.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
          const productInput = getScriptProductInput(mode);
          if (mode === "manual" && productInput) {
            productInput.value = "";
            delete productInput.dataset.productId;
            productInput.removeAttribute("data-product-id");
          } else if (mode === "library") {
            const libId = root.querySelector("[data-script-source-library]")?.value;
            const item = libId && SCRIPT_LIBRARY_ITEMS.find(i => i.id === libId);
            if (item && productInput) {
              productInput.value = productCatalog[item.productId]?.name || item.productId;
              productInput.dataset.productId = item.productId;
              productInput.setAttribute("data-product-id", item.productId);
            }
            syncScriptLibraryProductDisplay();
          }
        });
      });

      // 2) 文案库弹窗触发
      root.querySelector("[data-action='open-script-library-picker']")?.addEventListener("click", () => {
        openScriptLibraryPicker();
      });

      // 3) 目标时长只允许输入正整数秒
      root.querySelector("[data-script-duration]")?.addEventListener("input", event => {
        const value = event.target.value;
        if (!value) return;
        const normalized = String(Math.floor(Number(value)));
        if (normalized !== value) event.target.value = normalized;
      });
      root.querySelector("[data-script-duration]")?.addEventListener("blur", event => {
        const value = Number(event.target.value || 0);
        if (!Number.isInteger(value) || value < 1) event.target.value = "60";
        if (value > 600) event.target.value = "600";
      });

      // 4) 是否依赖素材库切换
      root.querySelectorAll('[data-role="script-material-mode"] .choice-chip').forEach(chip => {
        chip.addEventListener("click", () => {
          root.querySelectorAll('[data-role="script-material-mode"] .choice-chip').forEach(c => c.classList.toggle("active", c === chip));
          const mode = chip.dataset.materialMode || "depend";
          // 显隐素材选择面板(只在依赖模式下显示)
          root.querySelectorAll("[data-depend-only]").forEach(el => {
            el.hidden = mode !== "depend";
          });
          // 显隐不依赖模式专属提示(已选择不依赖素材库)
          root.querySelectorAll("[data-free-only]").forEach(el => {
            el.hidden = mode !== "free";
          });
          // 依赖模式专属提示(如"自动带入")始终隐藏,避免噪音
          root.querySelectorAll("[data-tip-material-depend]").forEach(el => {
            el.hidden = true;
          });
          setFormFeedback("");
        });
      });
      // 初始化:隐藏所有 free-only 元素
      root.querySelectorAll("[data-free-only]").forEach(el => { el.hidden = true; });
      // 初始化:始终隐藏"自动带入"等噪音提示
      root.querySelectorAll("[data-tip-material-depend]").forEach(el => { el.hidden = true; });

      // 5) 手动输入文案时，支持通过产品库、商品链接或手工输入确定产品
      root.querySelectorAll("[data-script-product-source]").forEach(button => {
        button.addEventListener("click", () => {
          const source = button.dataset.scriptProductSource;
          root.querySelectorAll("[data-script-product-source]").forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
          });
          root.querySelectorAll("[data-script-manual-product-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptManualProductPanel !== source;
          });
          setFormFeedback("");
        });
      });
      root.querySelector("[data-action='open-script-product-picker']")?.addEventListener("click", () => {
        openScriptProductPicker('[data-script-manual-product-panel="library"] [data-script-product]');
      });
      root.querySelector('[data-script-manual-product-panel="library"] [data-script-product]')?.addEventListener("change", event => {
        const label = root.querySelector("[data-script-selected-product]");
        if (label) label.textContent = event.target.value || "选择产品";
      });
      root.querySelector('[data-script-manual-product-panel="manual"] [data-script-product]')?.addEventListener("input", event => {
        const matched = Object.entries(productCatalog).find(([, product]) => product.name === event.target.value.trim());
        if (matched) event.target.dataset.productId = matched[0];
        else delete event.target.dataset.productId;
      });
      root.querySelector("[data-action='recognize-script-product']")?.addEventListener("click", () => {
        const link = root.querySelector("[data-script-product-link]")?.value.trim();
        if (!link) return setFormFeedback("请先粘贴商品链接。", "error");
        const input = root.querySelector('[data-script-manual-product-panel="link"] [data-script-product]');
        if (input) {
          input.value = productCatalog["mite-pro"].name;
          input.dataset.productId = "mite-pro";
        }
        setFormFeedback(`已解析产品“${productCatalog["mite-pro"].name}”。`);
      });

      // 6) 素材库弹窗触发
      root.querySelector("[data-action='open-script-material-picker']")?.addEventListener("click", () => {
        openScriptMaterialPicker();
      });
      const voiceOptionsHost = root.querySelector("[data-script-voice-options]");
      if (voiceOptionsHost) voiceOptionsHost.innerHTML = scriptVoiceOptionsHtml();
      root.querySelectorAll("[data-script-voice-option]").forEach(button => {
        button.addEventListener("click", () => {
          root.querySelectorAll("[data-script-voice-option]").forEach(item => item.classList.toggle("active", item === button));
          root.querySelectorAll("[data-script-voice-option]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
          const voice = button.dataset.scriptVoiceOption;
          const input = root.querySelector("[data-script-voice]");
          if (input) input.value = voice;
        });
      });
      let voicePreviewTimer = null;
      root.querySelectorAll("[data-script-voice-preview]").forEach(button => {
        button.addEventListener("click", () => {
          const card = button.closest(".script-voice-choice");
          const isPlaying = card?.classList.contains("is-playing");
          clearTimeout(voicePreviewTimer);
          root.querySelectorAll(".script-voice-choice").forEach(item => {
            item.classList.remove("is-playing");
            const label = item.querySelector("[data-script-voice-preview] em");
            if (label) label.textContent = "试听";
          });
          if (isPlaying) return;
          card?.classList.add("is-playing");
          const label = button.querySelector("em");
          if (label) label.textContent = "试听中";
          showToast(`正在试听 ${button.dataset.scriptVoicePreview}`);
          voicePreviewTimer = setTimeout(() => {
            card?.classList.remove("is-playing");
            if (label) label.textContent = "试听";
          }, 4500);
        });
      });
    }

    function openScriptVoicePicker() {
      const voices = ["许念·公版", "阿乐·公版", "陈海峰·公版", "赵明远·公版", "徐子轩·公版", "周雨桐·公版", "陈子建·公版", "范青·公版", "方圆·公版", "高远·公版", "郭美琳·公版", "夏语薇·公版"];
      let selected = dynamicForm.querySelector("[data-script-voice]")?.value || voices[0];
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.innerHTML = `<div class="modal-card script-voice-modal" role="dialog" aria-label="选择配音角色"><header class="modal-head"><div><strong>选择角色</strong><small>单选，角色仅用于本次脚本配音设置</small></div><button class="modal-close" type="button" data-close>×</button></header><div class="script-voice-toolbar"><input type="search" placeholder="搜索角色" data-search></div><div class="script-voice-grid" data-grid></div><footer class="modal-foot"><div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-confirm>确认选择</button></div></footer></div>`;
      document.body.appendChild(overlay);
      const grid = overlay.querySelector("[data-grid]");
      const render = () => {
        const keyword = overlay.querySelector("[data-search]").value.trim();
        grid.innerHTML = voices.filter(name => name.includes(keyword)).map(name => `<button class="script-voice-card${name === selected ? " selected" : ""}" type="button" data-voice="${name}"><span>${name.slice(0, 1)}</span><b>${name}</b>${name === selected ? "<i>✓</i>" : ""}</button>`).join("") || '<div class="script-voice-empty">未找到匹配角色</div>';
        grid.querySelectorAll("[data-voice]").forEach(card => card.addEventListener("click", () => { selected = card.dataset.voice; render(); }));
      };
      overlay.querySelector("[data-search]").addEventListener("input", render);
      overlay.addEventListener("click", event => { if (event.target === overlay || event.target.closest("[data-close]")) overlay.remove(); });
      overlay.querySelector("[data-confirm]").addEventListener("click", () => {
        const input = dynamicForm.querySelector("[data-script-voice]");
        const label = dynamicForm.querySelector("[data-script-voice-label]");
        if (input) input.value = selected;
        if (label) label.textContent = selected;
        overlay.remove();
        showToast("已选择配音角色");
      });
      render();
    }

    function renderScriptModelCards() {
      const picker = dynamicForm.querySelector("[data-script-model-picker]");
      const triggerText = dynamicForm.querySelector("[data-script-model-trigger-text]");
      const menu = dynamicForm.querySelector("[data-script-model-menu]");
      const hidden = dynamicForm.querySelector("[data-script-model]");
      if (!picker || !menu) return;
      const candidates = [
        { value: "gpt-5-6-terra", label: "GPT-5.6 Terra", group: "推荐模型", recommended: true },
        { value: "claude-sonnet-5", label: "Claude Sonnet 5", group: "国外模型" },
        { value: "gemini-3-6-flash", label: "Gemini 3.6 Flash", group: "国外模型" },
        { value: "doubao-seed-2-pro", label: "豆包 Seed 2.0 Pro", group: "国内模型" },
        { value: "deepseek-v4-pro", label: "DeepSeek V4 Pro", group: "国内模型" },
        { value: "qwen-3-7-max", label: "通义千问 Qwen3.7-Max", group: "国内模型" }
      ];
      const groups = ["推荐模型", "国外模型", "国内模型"];
      const current = hidden?.value || "gpt-5-6-terra";
      const currentItem = candidates.find(c => c.value === current) || candidates[0];
      if (triggerText) triggerText.textContent = `${currentItem.label}${currentItem.recommended ? "（推荐）" : ""}`;
      menu.innerHTML = groups.map(group => `
        <div class="single-model-group">${group}</div>
        ${candidates.filter(model => model.group === group).map(model => `
          <button type="button" class="single-model-option${model.value === current ? " selected" : ""}" data-script-model-option="${model.value}">
            <span><b>${escapeHtml(model.label)}${model.recommended ? "（推荐）" : ""}</b></span>
            <strong>${model.value === current ? "✓" : ""}</strong>
          </button>
        `).join("")}
      `).join("");
      const trigger = picker.querySelector("[data-script-model-trigger]");
      if (trigger) {
        trigger.addEventListener("click", e => {
          e.stopPropagation();
          picker.classList.toggle("open");
        });
      }
      menu.querySelectorAll("[data-script-model-option]").forEach(opt => {
        opt.addEventListener("click", e => {
          e.stopPropagation();
          const v = opt.dataset.scriptModelOption;
          if (hidden) hidden.value = v;
          const item = candidates.find(c => c.value === v);
          if (triggerText && item) triggerText.textContent = `${item.label}${item.recommended ? "（推荐）" : ""}`;
          menu.querySelectorAll("[data-script-model-option]").forEach(o => {
            const selected = o.dataset.scriptModelOption === v;
            o.classList.toggle("selected", selected);
            o.querySelector("strong").textContent = selected ? "✓" : "";
          });
          picker.classList.remove("open");
        });
      });
      // 点击外部关闭
      const closeOnOutside = ev => {
        if (!picker.contains(ev.target)) picker.classList.remove("open");
      };
      document.removeEventListener("click", closeOnOutside, true);
      document.addEventListener("click", closeOnOutside, true);
    }

    function refreshScriptLibraryTrigger() {
      const root = dynamicForm;
      if (!root) return;
      const hidden = root.querySelector("[data-script-source-library]");
      const trigger = root.querySelector("[data-action='open-script-library-picker']");
      const placeholder = root.querySelector("[data-script-library-placeholder]");
      if (!trigger || !placeholder) return;
      const id = hidden?.value;
      const item = id && SCRIPT_LIBRARY_ITEMS.find(i => i.id === id);
      if (item) {
        const product = productCatalog[item.productId];
        const productName = product?.name || "通用产品";
        placeholder.textContent = `${productName} · ${item.text.slice(0, 24)}…`;
        trigger.classList.add("is-filled");
      } else {
        placeholder.textContent = "选择文案";
        trigger.classList.remove("is-filled");
      }
    }

    function syncScriptSourcePreviewFromLibrary() {
      const root = dynamicForm;
      if (!root) return;
      const id = root.querySelector("[data-script-source-library]")?.value;
      const item = id && SCRIPT_LIBRARY_ITEMS.find(i => i.id === id);
      const content = root.querySelector("[data-script-source-content]");
      const meta = root.querySelector("[data-script-source-meta]");
      const previewPanel = root.querySelector("[data-script-source-preview]");
      if (!item) {
        if (previewPanel) previewPanel.hidden = true;
        if (content) content.value = "选择文案后,这里会显示完整口播文案，可在本次脚本任务内修改。";
        if (meta) meta.textContent = "—";
        return;
      }
      if (previewPanel) previewPanel.hidden = false;
      if (content) content.value = item.text;
      const wordCount = item.text.replace(/\s/g, "").length;
      const duration = Math.max(1, Math.round(wordCount / 4));
      if (meta) meta.textContent = `${item.audience || "—"} · ${wordCount} 字 · 预计口播 ${duration} 秒`;
    }

    function syncScriptLibraryProductDisplay() {
      const root = dynamicForm;
      const display = root?.querySelector("[data-script-library-product-display]");
      const productInput = root?.querySelector('[data-script-product-panel="library"] [data-script-product]');
      if (!display || !productInput) return;
      const product = productCatalog[productInput.dataset.productId || ""];
      display.innerHTML = product
        ? `<span class="script-product-display-icon">◈</span><div><strong>${escapeHtml(product.name)}</strong></div>`
        : `<span class="script-product-display-icon">◈</span><div><strong>等待带入对应产品</strong></div>`;
    }

    function refreshScriptMaterialSummary() {
      const root = dynamicForm;
      if (!root) return;
      const host = root.querySelector("[data-script-material-summary]");
      if (!host) return;
      const ids = window.__scriptMaterialSelected || [];
      const errorBox = root.querySelector("[data-material-group-error]");
      if (errorBox) errorBox.hidden = ids.length > 0;
      if (!ids.length) {
        host.innerHTML = `<span class="script-material-summary-empty">暂未选择素材</span>`;
        return;
      }
      host.innerHTML = ids.map(id => {
        const item = findScriptMaterial(id);
        if (!item) return "";
        return `<article class="script-selected-material" data-selected-material="${escapeHtml(id)}"><div class="script-selected-material-cover">${escapeHtml(item.id)}</div><div><strong>${escapeHtml(item.name || item.id)}</strong><small>${escapeHtml(item.scene || item.group)} · 9:16 · ${item.duration}s</small></div><button type="button" aria-label="移除 ${escapeHtml(item.name || item.id)}" data-script-remove-material="${escapeHtml(id)}">×</button></article>`;
      }).join("");
      host.querySelectorAll("[data-script-remove-material]").forEach(btn => {
        btn.addEventListener("click", () => {
          const materialId = btn.dataset.scriptRemoveMaterial;
          window.__scriptMaterialSelected = (window.__scriptMaterialSelected || []).filter(x => x !== materialId);
          refreshScriptMaterialSummary();
        });
      });
    }

    function openScriptLibraryPicker(options = {}) {
      let activeScope = "all";
      let searchText = "";
      let selectedId = "";  // 单选 ID
      const current = options.selectedId || dynamicForm.querySelector("[data-script-source-library]")?.value;
      if (current) selectedId = current;

      const filterItems = () => SCRIPT_LIBRARY_ITEMS.filter(i => {
        if (activeScope !== "all" && i.scope !== activeScope) return false;
        if (!searchText) return true;
        const s = searchText.toLowerCase();
        return i.text.toLowerCase().includes(s) ||
               (productCatalog[i.productId]?.name || "").toLowerCase().includes(s) ||
               i.audience.toLowerCase().includes(s);
      });

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.innerHTML = `
        <div class="modal-card script-picker-modal" role="dialog" aria-label="从文案库选择">
          <header class="modal-head">
            <div><strong>${escapeHtml(options.title || "从文案库选择文案")}</strong><small>${escapeHtml(options.subtitle || '支持按"全部 / 我创建的 / 我的团队"切换，输入关键词快速定位（单选）')}</small></div>
            <button class="modal-close" type="button" data-modal-close>×</button>
          </header>
          <div class="lib-picker-toolbar">
            <div class="lib-pick-tabs" role="tablist">
              <button type="button" class="active" data-scope="all">全部</button>
              <button type="button" data-scope="mine">我创建的</button>
              <button type="button" data-scope="team">我的团队</button>
            </div>
            <input type="text" class="lib-pick-search" placeholder="搜索文案内容或产品">
          </div>
          <div class="lib-pick-list" data-lib-pick-list></div>
          <footer class="modal-foot">
            <div class="modal-foot-actions">
              <button class="ghost-btn" type="button" data-modal-close>取消</button>
              <button class="primary-btn" type="button" data-lib-pick-confirm disabled>确认</button>
            </div>
          </footer>
        </div>
      `;
      document.body.appendChild(overlay);
      const list = overlay.querySelector("[data-lib-pick-list]");
      const confirmBtn = overlay.querySelector("[data-lib-pick-confirm]");

      const render = () => {
        const items = filterItems();
        list.innerHTML = items.length ? items.map(i => {
          const product = productCatalog[i.productId];
          const productName = product?.name || "通用产品";
          const preview = i.text.length > 80 ? i.text.slice(0, 80) + "…" : i.text;
          const wordCount = i.text.replace(/\s/g, "").length;
          const estimatedDuration = Math.max(1, Math.round(wordCount / 4));
          const tagGroups = [
            ["产品", [productName]],
            ["适用人群", i.audience ? [i.audience] : []],
            ["字数", [`${wordCount} 字`]],
            ["来源", [i.source]],
            ["预计时长", [`${estimatedDuration} 秒`]]
          ].filter(([, values]) => values.length);
          const isSel = i.id === selectedId;
          return `<article class="lib-pick-card${isSel ? " selected" : ""}" data-pick-id="${i.id}">
            <i class="lib-pick-check">${isSel ? "✓" : ""}</i>
            <p class="lib-pick-content">${escapeHtml(preview)}</p>
            <div class="lib-pick-tags">${tagGroups.map(([label, values]) => `<div class="lib-pick-tag-group"><b>${label}</b><div>${values.map(value => `<span class="lib-pick-tag ${label === "来源" ? "is-source" : ""}">${escapeHtml(value)}</span>`).join("")}</div></div>`).join("")}</div>
          </article>`;
        }).join("") : `<div class="lib-pick-empty">未找到匹配的文案,试试切换 tab 或换个关键词</div>`;
        list.querySelectorAll(".lib-pick-card").forEach(card => {
          card.addEventListener("click", () => {
            // 单选:点击同一项取消,点击其它项替换
            const id = card.dataset.pickId;
            selectedId = (selectedId === id) ? "" : id;
            render();
          });
        });
        confirmBtn.textContent = `确认${selectedId ? "" : "选择"}`;
        confirmBtn.disabled = !selectedId;
      };
      overlay.addEventListener("click", e => { if (e.target === overlay || e.target.matches("[data-modal-close]")) overlay.remove(); });
      overlay.querySelectorAll("[data-scope]").forEach(tab => {
        tab.addEventListener("click", () => {
          activeScope = tab.dataset.scope;
          overlay.querySelectorAll("[data-scope]").forEach(t => t.classList.toggle("active", t === tab));
          render();
        });
      });
      overlay.querySelector(".lib-pick-search").addEventListener("input", e => {
        searchText = e.target.value.trim();
        render();
      });
      confirmBtn.addEventListener("click", () => {
        if (!selectedId) return;
        const item = SCRIPT_LIBRARY_ITEMS.find(i => i.id === selectedId);
        if (typeof options.onConfirm === "function") {
          options.onConfirm(item);
          overlay.remove();
          return;
        }
        const hidden = dynamicForm.querySelector("[data-script-source-library]");
        if (hidden) hidden.value = selectedId;
        const productInput = dynamicForm.querySelector('[data-script-product-panel="library"] [data-script-product]');
        if (item && productInput) {
          productInput.value = productCatalog[item.productId]?.name || item.productId;
          productInput.dataset.productId = item.productId;
          productInput.setAttribute("data-product-id", item.productId);
        }
        refreshScriptLibraryTrigger();
        syncScriptSourcePreviewFromLibrary();
        syncScriptLibraryProductDisplay();
        overlay.remove();
        showToast(`已选择文案: ${productCatalog[item.productId]?.name || "—"}`);
      });
      render();
    }

    function openScriptProductPicker(targetSelector) {
      const inputEl = dynamicForm.querySelector(targetSelector);
      if (!window.CreationProductPicker) {
        setFormFeedback("产品选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      window.CreationProductPicker.open({
        items: Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId: inputEl?.dataset.productId || "",
        onConfirm(productId, product) {
          if (inputEl) {
            inputEl.value = product?.name || productId;
            inputEl.dataset.productId = productId;
            inputEl.setAttribute("data-product-id", productId);
            inputEl.dispatchEvent(new Event("change", { bubbles:true }));
          }
          showToast(`已选择产品: ${product?.name || ""}`);
        }
      });
    }

    function openScriptMaterialPicker(options = {}) {
      if (!Array.isArray(window.__scriptMaterialSelected)) window.__scriptMaterialSelected = [];
      const selectedIds = new Set(options.selectedIds || window.__scriptMaterialSelected || []);
      let activeGroup = "all";
      let searchText = "";
      let typeFilter = "all";
      let statusFilter = "all";
      const materialItems = allScriptMaterials().filter(item => !options.productName || !item.product || item.product === options.productName);
      const statusLabels = { ok:"已分析", pending:"待分析", analyzing:"分析中", fail:"分析失败" };
      const typeLabels = { video:"视频", image:"图片" };

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100020";
      overlay.innerHTML = `
        <div class="modal-card material-picker-modal" role="dialog" aria-label="从素材库选择素材">
          <header class="modal-head">
            <div><strong>${options.title || "从素材库选择素材"}</strong><small>${options.productName ? `已按“${escapeHtml(options.productName)}”筛选关联素材；` : "可多选；"}支持按文件夹、类型和分析状态筛选</small></div>
            <button class="modal-close" type="button" data-modal-close>×</button>
          </header>
          <div class="lib-picker">
            <aside class="lib-folder-tree" data-lib-folder-tree>
              <button type="button" class="lib-folder-item material-folder-all active" data-group="all"><span class="folder-icon">▣</span><span class="label">全部素材</span><span class="count">${materialItems.length}</span></button>
              ${SCRIPT_MATERIAL_FOLDERS.map(folder => `<div class="material-folder-root"><button type="button" class="lib-folder-item material-folder-parent" data-group="${escapeHtml(folder.children.join("|"))}"><span class="folder-icon">▰</span><span class="label">${escapeHtml(folder.name)}</span><span class="count">${materialItems.filter(item => folder.children.includes(item.group)).length}</span></button><div class="material-folder-children">${folder.children.map(name => `<button type="button" class="lib-folder-item sub" data-group="${escapeHtml(name)}"><span class="folder-icon">⌞</span><span class="label">${escapeHtml(name)}</span><span class="count">${materialItems.filter(item => item.group === name).length}</span></button>`).join("")}</div></div>`).join("")}
            </aside>
            <section class="lib-content">
              <div class="lib-toolbar">
                <input type="text" class="lib-pick-search" placeholder="搜索素材名称、产品或素材 ID">
                <select class="script-material-filter" data-material-filter="type" aria-label="素材类型"><option value="all">全部类型</option><option value="video">视频</option><option value="image">图片</option></select>
                <select class="script-material-filter" data-material-filter="status" aria-label="分析状态"><option value="all">全部状态</option><option value="ok">已分析</option><option value="pending">待分析</option><option value="analyzing">分析中</option><option value="fail">分析失败</option></select>
                <button class="material-picker-select-all" type="button" data-lib-material-select-all>全选当前结果</button>
              </div>
              <div class="lib-grid" data-lib-grid></div>
              <div class="lib-foot">
                <span>已选 <b id="libSelectedCount">${selectedIds.size}</b> 项</span>
                <div class="modal-foot-actions">
                  <button class="ghost-btn" type="button" data-modal-close>取消</button>
                  <button class="primary-btn" type="button" data-lib-material-confirm>确认(${selectedIds.size} 项)</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const folderTree = overlay.querySelector("[data-lib-folder-tree]");
      const grid = overlay.querySelector("[data-lib-grid]");
      const selectedCountEl = overlay.querySelector("#libSelectedCount");
      const confirmBtn = overlay.querySelector("[data-lib-material-confirm]");
      const selectAllBtn = overlay.querySelector("[data-lib-material-select-all]");
      let visibleSelectableIds = [];

      const updateSelectionUi = () => {
        selectedCountEl.textContent = selectedIds.size;
        confirmBtn.textContent = `确认(${selectedIds.size} 项)`;
        const selectedVisibleCount = visibleSelectableIds.filter(id => selectedIds.has(id)).length;
        const allVisibleSelected = visibleSelectableIds.length > 0 && selectedVisibleCount === visibleSelectableIds.length;
        selectAllBtn.disabled = !visibleSelectableIds.length;
        selectAllBtn.classList.toggle("is-selected", allVisibleSelected);
        selectAllBtn.setAttribute("aria-pressed", String(allVisibleSelected));
        selectAllBtn.textContent = allVisibleSelected ? "取消全选" : "全选当前结果";
      };

      const render = () => {
        const groups = activeGroup === "all" ? Object.keys(SCRIPT_MATERIAL_CATALOG) : activeGroup.split("|");
        const items = materialItems.filter(item => groups.includes(item.group));
        const filtered = items.filter(i => {
          if (typeFilter !== "all" && i.type !== typeFilter) return false;
          if (statusFilter !== "all" && i.status !== statusFilter) return false;
          if (searchText) {
            const s = searchText.toLowerCase();
            return [i.id,i.name,i.scene,i.product || "未关联产品",...i.tags].some(value=>String(value).toLowerCase().includes(s));
          }
          return true;
        });
        visibleSelectableIds = filtered.map(item => item.id);
        grid.innerHTML = filtered.length ? filtered.map((i,index) => {
          const isSel = selectedIds.has(i.id);
          const statusIcon = i.status === "ok" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : i.status === "fail" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>' : i.status === "pending" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>' : "";
          const duration = i.type === "video" ? `0:${String(Math.round(i.duration)).padStart(2,"0")}` : "";
          return `<article class="script-mat-card tone-${index%6}${isSel ? " selected" : ""}" data-pick-material="${i.id}">
            <div class="script-mat-cover">
              <span class="script-mat-status status-${i.status}"><span class="ico">${statusIcon}</span><span>${statusLabels[i.status] || i.status}</span></span>
              ${duration ? `<span class="script-mat-duration">${duration}</span>` : ""}
              <div class="script-mat-play"><span>▶</span></div>
              <span class="script-mat-select">${isSel ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ""}</span>
            </div>
            <div class="script-mat-info">
              <div class="script-mat-name" title="${escapeHtml(i.name)}">${escapeHtml(i.name)}</div>
              <div class="script-mat-meta"><span class="script-mat-product${i.product ? "" : " is-empty"}">${escapeHtml(i.product || "未关联产品")}</span><span class="script-mat-type">${typeLabels[i.type] || i.type}</span></div>
              <div class="script-mat-created">${escapeHtml(i.created)}</div>
            </div>
          </article>`;
        }).join("") : `<div class="lib-empty">当前文件夹没有匹配素材，换个关键词试试。</div>`;
        grid.querySelectorAll(".script-mat-card").forEach(card => {
          card.addEventListener("click", () => {
            const id = card.dataset.pickMaterial;
            if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
            render();
          });
        });
        updateSelectionUi();
      };

      folderTree.querySelectorAll(".lib-folder-item").forEach(item => {
        item.addEventListener("click", () => {
          activeGroup = item.dataset.group;
          folderTree.querySelectorAll(".lib-folder-item").forEach(i => i.classList.toggle("active", i === item));
          render();
        });
      });
      overlay.querySelector(".lib-pick-search").addEventListener("input", e => {
        searchText = e.target.value.trim();
        render();
      });
      overlay.querySelectorAll("[data-material-filter]").forEach(select=>select.addEventListener("change",event=>{
        const value = event.target.value;
        if (event.target.dataset.materialFilter === "type") typeFilter = value;
        if (event.target.dataset.materialFilter === "status") statusFilter = value;
        render();
      }));
      selectAllBtn.addEventListener("click", () => {
        const allVisibleSelected = visibleSelectableIds.length > 0 && visibleSelectableIds.every(id => selectedIds.has(id));
        visibleSelectableIds.forEach(id => allVisibleSelected ? selectedIds.delete(id) : selectedIds.add(id));
        render();
      });
      overlay.addEventListener("click", e => { if (e.target === overlay || e.target.matches("[data-modal-close]")) overlay.remove(); });
      confirmBtn.addEventListener("click", () => {
        const ids = [...selectedIds];
        if (typeof options.onConfirm === "function") options.onConfirm(ids);
        else {
          window.__scriptMaterialSelected = ids;
          refreshScriptMaterialSummary();
        }
        overlay.remove();
        showToast(`已选择 ${ids.length} 个素材`);
      });
      render();
    }

    function renderAgentForm(type) {
      const config = agentConfigs[type];
      if (!config) return;
      modalIntro.textContent = config.intro;
      agentProcess.textContent = config.process;
      dynamicForm.innerHTML = config.form;
      if (type === "copy") {
        referenceTranscriptState.library = { defaultValue: "", value: "" };
        referenceTranscriptState["copy-library"] = { defaultValue: "", value: "" };
        referenceTranscriptState.upload = { defaultValue: "", value: "" };
      }
      if (type === "rewrite") {
        creationContext.productSource = "library";
        rewriteSourceState.library = "";
        rewriteSourceState.paste = "";
      }
      if (isStructuredCopyFlow(type)) {
        [...dynamicForm.querySelectorAll("[data-point-editor]")].forEach(editor => {
          const values = [...editor.querySelectorAll("[data-point-value]")].map(input => input.value.trim()).filter(Boolean);
          setPointEditorValues(editor.dataset.pointEditor, values);
        });
      }
      promptInput.placeholder = config.placeholder;
      dynamicForm.querySelectorAll(".upload-box").forEach(box => {
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
      });
      refreshConditionalSlots();
      if (type === "copy") refreshReferenceSource();
      if (type === "rewrite") {
        refreshRewriteSource(true);
        refreshRewriteSetting();
      }
      refreshWordDuration();
      setFormFeedback("");
      if (isStructuredCopyFlow(type)) hydrateOriginalContext();
      else applyProductToForm(creationContext.productId);
      updateModalContext();
    }

    function refreshConditionalSlots() {
      const modeControl = dynamicForm.querySelector("[data-mode-control]");
      if (!modeControl) return;
      const activeMode = modeControl.value;
      dynamicForm.querySelectorAll("[data-mode]").forEach(slot => {
        slot.classList.toggle("show", slot.dataset.mode.split(",").includes(activeMode));
      });
    }

    const referenceVideoLabels = {
      status:{ done:"已分析", pending:"待分析", running:"分析中", failed:"分析失败" },
      source:{ infinite:"无限画板", local:"本地上传", remix:"智能混剪" },
      platform:{ douyin:"抖音", kuaishou:"快手", channels:"视频号", xiaohongshu:"小红书", other:"其他" }
    };
    function referenceProductId(productName = "") {
      const normalized = productName.trim();
      return Object.entries(productCatalog).find(([, product]) => product.name === normalized)?.[0]
        || ({ "轻享空气炸锅":"air-a8" }[normalized] || "");
    }
    function formatReferenceDuration(seconds = 0) {
      return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
    }
    const referenceVideoCatalogBridge = { finished: [], external: null };
    window.addEventListener("message", event => {
      if (event.data?.type !== "content-compass-video-catalog") return;
      const finishedFrame = document.querySelector('#page-finished-videos iframe');
      const externalFrame = document.querySelector('#page-reference-videos iframe');
      if (event.source === finishedFrame?.contentWindow && event.data.source === "finished") {
        referenceVideoCatalogBridge.finished = Array.isArray(event.data.items) ? event.data.items : [];
      }
      if (event.source === externalFrame?.contentWindow && event.data.source === "external") {
        referenceVideoCatalogBridge.external = event.data.items || null;
      }
    });
    function requestReferenceVideoCatalog() {
      const message = { type:"content-compass-video-catalog-request" };
      document.querySelector('#page-finished-videos iframe')?.contentWindow?.postMessage(message, '*');
      document.querySelector('#page-reference-videos iframe')?.contentWindow?.postMessage(message, '*');
    }
    function readReferenceVideoCatalog() {
      let finished = [];
      let externalStore = null;
      try {
        const finishedFrame = document.querySelector('#page-finished-videos iframe')?.contentWindow;
        const externalFrame = document.querySelector('#page-reference-videos iframe')?.contentWindow;
        finished = Array.isArray(finishedFrame?.ContentCompassFinishedVideoCatalog) ? finishedFrame.ContentCompassFinishedVideoCatalog : [];
        externalStore = externalFrame?.ContentCompassExternalVideoCatalog || null;
      } catch (error) {
        // 本地 file:// 打开时，浏览器可能禁止父页面直接读取 iframe；保持选择器可打开。
        finished = [];
        externalStore = null;
      }
      if (!finished.length) finished = referenceVideoCatalogBridge.finished;
      if (!externalStore) externalStore = referenceVideoCatalogBridge.external;
      const external = Array.isArray(externalStore?.videos) ? externalStore.videos : [];
      const externalProducts = Array.isArray(externalStore?.products) ? externalStore.products : [];
      return [
        ...finished.map(video => ({
          id:video.id, source:"finished", productId:referenceProductId(video.product), title:video.file,
          channel:referenceVideoLabels.source[video.source] || video.source, product:video.product,
          duration:formatReferenceDuration(video.duration), origin:referenceVideoLabels.source[video.source] || video.source,
          status:referenceVideoLabels.status[video.status] || video.status, updated:video.created, tags:[...(video.tags || [])],
          file:video.file, detailLabel:"", detail:"",
          auxiliary:`${video.size} MB${video.ads?.length ? " · 已关联千川" : ""}`,
          transcript:Array.isArray(video.shots) ? video.shots.map(shot => shot.voice).filter(Boolean).join("") : ""
        })),
        ...external.map(video => {
          const product = externalProducts.find(item => item.id === video.productId);
          return {
            id:video.id, source:"external", productId:video.productId || "", title:video.title,
            channel:referenceVideoLabels.platform[video.platform] || video.platform, product:product?.name || "未关联产品",
            duration:formatReferenceDuration(video.duration), origin:video.source,
            status:referenceVideoLabels.status[video.state] || video.state, updated:video.uploadedAt, tags:[...(video.tags || [])],
            file:"", detailLabel:"文件信息", detail:`${video.size}${video.version ? ` · 拉片版本 V${video.version}` : ""}`,
            auxiliary:video.source, transcript:""
          };
        })
      ];
    }
    const referenceTranscriptState = {
      library: { defaultValue: "", value: "" },
      "copy-library": { defaultValue: "", value: "" },
      upload: { defaultValue: "", value: "" }
    };

    function showReferenceTranscript(source, transcript) {
      if (!referenceTranscriptState[source]) return;
      referenceTranscriptState[source] = { defaultValue: transcript, value: transcript };
      refreshReferenceTranscriptEditor(source);
    }

    function refreshReferenceTranscriptEditor(source = dynamicForm.querySelector("[data-reference-source]")?.value) {
      const editor = dynamicForm.querySelector("[data-reference-transcript-editor]");
      const textarea = editor?.querySelector("[data-reference-transcript]");
      const resetButton = editor?.querySelector('[data-action="reset-reference-transcript"]');
      const state = referenceTranscriptState[source];
      const sourcePanel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const sourceReady = source === "library" || source === "copy-library"
        ? Boolean(sourcePanel?.querySelector("[data-reference-value]")?.value)
        : source === "upload" && Boolean(sourcePanel?.querySelector("[data-reference-upload].selected"));
      const visible = Boolean(state?.defaultValue) && sourceReady && (source === "library" || source === "copy-library" || source === "upload");
      if (!editor || !textarea) return;
      editor.hidden = !visible;
      if (resetButton) resetButton.hidden = source === "copy-library";
      if (visible) {
        textarea.value = state.value;
        editor.dataset.transcriptSource = source;
      }
    }

    function resetReferenceTranscript() {
      const source = dynamicForm.querySelector("[data-reference-source]")?.value;
      const state = referenceTranscriptState[source];
      const textarea = dynamicForm.querySelector("[data-reference-transcript]");
      if (!state || !textarea) return;
      state.value = state.defaultValue;
      textarea.value = state.defaultValue;
      showToast("已恢复识别原文");
    }

    const rewriteSourceState = { library: "", paste: "" };
    const rewriteBaseStyles = ["硬广直给", "生活化口播", "专业测评", "情绪冲击", "理性对比"];
    const rewriteCustomStyles = [];
    function rewriteStyleOptionsMarkup() {
      return [...rewriteBaseStyles, ...rewriteCustomStyles].map(style => `<option>${escapeHtml(style)}</option>`).join("");
    }

    function refreshRewriteSource(initial = false) {
      const source = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      const libraryField = dynamicForm.querySelector("[data-rewrite-library-field]");
      const previous = dynamicForm.dataset.rewriteSource;
      if (!initial && previous && textarea) rewriteSourceState[previous] = textarea.value;
      dynamicForm.dataset.rewriteSource = source;
      dynamicForm.querySelectorAll("[data-rewrite-source-mode]").forEach(button => {
        const active = button.dataset.rewriteSourceMode === source;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      if (libraryField) libraryField.hidden = source !== "library";
      if (textarea) textarea.value = rewriteSourceState[source] || "";
    }

    function openRewriteLibraryPicker() {
      const value = dynamicForm.querySelector("[data-rewrite-library]");
      openScriptLibraryPicker({
        title:"从文案库选择待改写文案",
        subtitle:"选择后读取文案内容；若已关联产品，将自动带入基础信息（单选）",
        selectedId:value?.value || "",
        onConfirm(item) {
          if (!item) return;
          if (value) value.value = item.id;
          rewriteSourceState.library = item.text;
          const textarea = dynamicForm.querySelector("[data-rewrite-original]");
          if (textarea) textarea.value = item.text;
          const triggerText = dynamicForm.querySelector("[data-rewrite-library-trigger-text]");
          if (triggerText) triggerText.textContent = "重新选择文案";
          applyReferenceProduct(item.productId, "所选文案");
          setFormFeedback("");
        }
      });
    }

    function refreshRewriteSetting() {
      const host = dynamicForm.querySelector("[data-rewrite-setting-host]");
      const active = dynamicForm.querySelector('[data-single="rewrite-method"] .choice-chip.active');
      const method = active?.dataset.rewriteMethod || "hook";
      if (!host) return;
      const settings = {
        hook: `<label>开场钩子偏好<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>结果前置</option><option>痛点冲突</option><option>利益直给</option><option>反常识</option><option>场景代入</option><option>身份点名</option><option>风险提醒</option><option>数字清单</option></select>`,
        audience: `<div class="rewrite-strategy-title"><strong>人群与表达策略</strong><span>重新定义改写文案面向的人群及使用语境</span></div>
          ${personaPickerMarkup("rewrite")}
          <div class="original-field-head"><label>改写后目标人群<span class="required-star">*</span></label></div>
          <div class="audience-selector rewrite-audience-selector">
            <div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-rewrite-audience-box>
              <button class="rewrite-audience-chip" type="button">精致妈妈</button><button class="rewrite-audience-chip" type="button">新锐白领</button><button class="rewrite-audience-chip" type="button">资深中产</button><button class="rewrite-audience-chip" type="button">Z世代</button><button class="rewrite-audience-chip" type="button">小镇青年</button><button class="rewrite-audience-chip" type="button">小镇中老年</button><button class="rewrite-audience-chip" type="button">都市蓝领</button><button class="rewrite-audience-chip" type="button">都市银发</button>
            </div></div>
            <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="rewrite-gender" data-role="rewrite-gender"><span class="choice-chip">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
            <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="rewrite-age" data-role="rewrite-age"><span class="choice-chip">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-rewrite-custom-age-trigger>自定义</span><span class="custom-age-range" data-rewrite-custom-age hidden><input type="number" min="1" max="99" value="25" data-rewrite-age-min><i>至</i><input type="number" min="1" max="99" value="35" data-rewrite-age-max></span></div></div>
          </div>
          <input type="hidden" data-field="rewriteTarget" data-required value="">
          <div class="rewrite-audience-details">
            <div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div>
            <textarea data-field="pain" placeholder="一行一个人群核心痛点">床单刚换，尘杯仍吸出毛发碎屑\n宠物上床后，床褥清洁总停在表面</textarea>
            <div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div>
            <textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea>
          </div>`,
        selling: `<label>需要前置的卖点<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>${escapeHtml(currentProduct().core || "核心卖点")}</option><option>${escapeHtml(currentProduct().secondary || "次要卖点")}</option><option>${escapeHtml(currentProduct().difference || "差异化卖点")}</option></select>`,
        style: `<label>目标表达风格<span class="required-star">*</span></label>
          <div class="rewrite-style-control"><select data-field="rewriteTarget" data-required data-rewrite-style-select>${rewriteStyleOptionsMarkup()}</select><button class="soft-btn" type="button" data-add-rewrite-style>＋ 新增风格</button></div>
          <div class="rewrite-style-editor" data-rewrite-style-editor hidden><input data-rewrite-style-input maxlength="20" placeholder="输入新的表达风格"><button class="primary-btn" type="button" data-save-rewrite-style>添加</button><button class="ghost-btn" type="button" data-cancel-rewrite-style>取消</button></div>`
      };
      host.hidden = !settings[method];
      host.innerHTML = settings[method] || "";
      creationContext.originalFields.rewriteMethod = method;
      if (method === "audience") syncRewriteAudienceTarget();
    }

    function syncRewriteAudienceTarget() {
      const target = dynamicForm.querySelector('[data-field="rewriteTarget"]');
      const box = dynamicForm.querySelector("[data-rewrite-audience-box]");
      if (!target || !box) return;
      const audiences = [...box.querySelectorAll(".rewrite-audience-chip.active")].map(item => item.textContent.trim());
      const gender = dynamicForm.querySelector('[data-role="rewrite-gender"] .choice-chip.active')?.textContent.trim() || "不限";
      const ageChoice = dynamicForm.querySelector('[data-role="rewrite-age"] .choice-chip.active')?.textContent.trim() || "不限";
      const age = ageChoice === "自定义"
        ? `${dynamicForm.querySelector("[data-rewrite-age-min]")?.value || 18}–${dynamicForm.querySelector("[data-rewrite-age-max]")?.value || 35}岁`
        : ageChoice;
      target.value = audiences.length ? `${audiences.join("、")}；${gender}；${age}` : "";
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function refreshReferenceSource() {
      const source = dynamicForm.querySelector("[data-reference-source]")?.value;
      if (!source) return;
      dynamicForm.querySelectorAll("[data-reference-panel]").forEach(panel => {
        panel.hidden = panel.dataset.referencePanel !== source;
      });
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      const activePanel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const hasLibrarySelection = (source === "library" || source === "copy-library") && Boolean(activePanel?.querySelector("[data-reference-value]")?.value);
      const hasUpload = source === "upload" && Boolean(activePanel?.querySelector("[data-reference-upload].selected"));
      if (stepPanel) stepPanel.dataset.referenceReady = hasLibrarySelection || hasUpload ? "true" : "false";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = source === "copy-library" || !(hasLibrarySelection || hasUpload);
      }
      refreshReferenceTranscriptEditor(source);
    }

    function waitForReferenceVideoCatalog(timeoutMs = 2000) {
      return new Promise(resolve => {
        const startedAt = Date.now();
        const checkCatalog = () => {
          requestReferenceVideoCatalog();
          const items = readReferenceVideoCatalog();
          if (items.length || Date.now() - startedAt >= timeoutMs) {
            resolve(items);
            return;
          }
          window.setTimeout(checkCatalog, 100);
        };
        checkCatalog();
      });
    }

    async function openReferenceVideoPicker() {
      if (!window.CreationVideoPicker) {
        setFormFeedback("视频选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const selectedId = dynamicForm.querySelector('[data-reference-panel="library"] [data-reference-value]')?.value || "";
      let items = readReferenceVideoCatalog();
      if (!items.length) requestReferenceVideoCatalog();
      window.CreationVideoPicker.open({
        items,
        selectedId,
        loading:!items.length,
        onConfirm(video) { if (video) selectReferenceVideo(video); }
      });
      if (!items.length) {
        setFormFeedback("正在加载视频库，请稍候……");
        items = await waitForReferenceVideoCatalog();
        window.CreationVideoPicker.setItems?.(items);
      }
      if (!items.length) setFormFeedback("当前视频库暂无可选视频，可先前往成片视频或外部参考视频导入内容。", "error");
      else setFormFeedback("");
    }

    function applyReferenceProduct(productId, sourceLabel) {
      if (!productId || !productCatalog[productId]) {
        showToast(`${sourceLabel}未关联产品，已保留当前基础信息`);
        return false;
      }
      creationContext.productId = productId;
      creationContext.productName = productCatalog[productId].name;
      setProductSource("library");
      applyProductToForm(productId);
      showToast(`已自动带入关联产品：${productCatalog[productId].name}`);
      return true;
    }

    function selectReferenceVideo(video) {
      const panel = dynamicForm.querySelector('[data-reference-panel="library"]');
      const value = panel?.querySelector("[data-reference-value]");
      const title = video.title || "已选参考视频";
      const sourceLabel = video.source === "finished" ? "成片视频" : "外部参考视频";
      const meta = `${sourceLabel} · ${video.channel} · ${video.product} · ${video.duration}`;
      if (value) value.value = video.id || title;
      if (video.transcript) showReferenceTranscript("library", video.transcript);
      else {
        referenceTranscriptState.library = { defaultValue:"", value:"" };
        refreshReferenceTranscriptEditor("library");
      }
      const selected = dynamicForm.querySelector("[data-selected-reference]");
      if (selected) {
        selected.hidden = false;
        selected.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span>`;
      }
      const triggerText = dynamicForm.querySelector("[data-reference-trigger-text]");
      if (triggerText) triggerText.textContent = "重新选择视频";
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      if (stepPanel) stepPanel.dataset.referenceReady = "true";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = video.transcript
          ? "<strong>已带入</strong><span>已读取视频库现有口播内容，可在本次任务中继续修改。</span>"
          : "<strong>已带入</strong><span>已读取视频库现有基础信息；当前资产未提供可编辑口播原文。</span>";
      }
      applyReferenceProduct(video.productId, "所选视频");
      setFormFeedback("");
    }

    function openReferenceCopyPicker() {
      const panel = dynamicForm.querySelector('[data-reference-panel="copy-library"]');
      openScriptLibraryPicker({
        title:"从文案库选择参考文案",
        subtitle:"选择后读取文案内容与结构；若已关联产品，将自动带入基础信息（单选）",
        selectedId:panel?.querySelector("[data-reference-value]")?.value || "",
        onConfirm(item) { if (item) selectReferenceCopy(item); }
      });
    }

    function selectReferenceCopy(item) {
      const panel = dynamicForm.querySelector('[data-reference-panel="copy-library"]');
      const value = panel?.querySelector("[data-reference-value]");
      if (value) value.value = item.id;
      showReferenceTranscript("copy-library", item.text);
      const triggerText = panel?.querySelector("[data-reference-copy-trigger-text]");
      if (triggerText) triggerText.textContent = "重新选择文案";
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      if (stepPanel) stepPanel.dataset.referenceReady = "true";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = true;
        feedback.innerHTML = "";
      }
      applyReferenceProduct(item.productId, "所选文案");
      setFormFeedback("");
    }

    function analyzeReference() {
      const source = dynamicForm.querySelector("[data-reference-source]")?.value || "text";
      const panel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const value = panel?.querySelector("[data-reference-value]")?.value.trim();
      if (!value) {
        setFormFeedback("请先填写需要解析的参考内容。", "error");
        panel?.querySelector("[data-reference-value]")?.focus();
        return;
      }
      const button = panel.querySelector('[data-action="analyze-reference"]');
      if (button) {
        button.disabled = true;
        button.textContent = "解析中…";
      }
      setTimeout(() => {
        const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
        if (stepPanel) stepPanel.dataset.referenceReady = "true";
        const feedback = dynamicForm.querySelector("[data-reference-feedback]");
        if (feedback) {
          feedback.hidden = false;
          feedback.innerHTML = "<strong>解析完成</strong><span>已识别钩子机制、内容结构和表达节奏；参考商品事实不会进入目标文案。</span>";
        }
        if (button) {
          button.disabled = false;
          button.textContent = source === "text" ? "重新分析" : "重新解析";
        }
        setFormFeedback("");
        showToast("参考内容解析完成");
      }, 420);
    }

    function refreshWordDuration(input) {
      const inputs = input ? [input] : [...dynamicForm.querySelectorAll("[data-word-count]")];
      inputs.forEach(wordInput => {
        const durationOutput = wordInput.closest(".field, .original-field")?.querySelector("[data-duration]");
        if (!durationOutput) return;
        const seconds = Math.max(1, Math.round((Number(wordInput.value) || 0) / 4));
        durationOutput.textContent = seconds < 60
          ? `约 ${seconds} 秒`
          : `约 ${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
      });
    }

    function setAgentPicker(open) {
      agentPicker.classList.toggle("open", open);
      agentPillButton.setAttribute("aria-expanded", String(open));
      if (open) setModelPicker(false);
    }

    function selectAgent(card, open = false) {
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      agentCards.forEach(item => item.classList.remove("selected"));
      card.classList.add("selected");
      activeAgent = card.dataset.agent;
      activeType = card.dataset.type;
      agentPill.textContent = activeAgent;
      agentPillButton.classList.remove("required");
      agentOptions.forEach(option => {
        const selected = option.dataset.agentType === activeType;
        option.classList.toggle("selected", selected);
        option.querySelector(".agent-option-check").textContent = selected ? "✓" : "";
        option.setAttribute("aria-selected", String(selected));
      });
      promptInput.disabled = false;
      sendPromptButton.disabled = false;
      modalTitle.textContent = activeAgent;
      renderAgentForm(activeType);
      renderModelOptions(activeType);
      modelPicker.hidden = false;
      setAgentPicker(false);
      agentSelectionPending = false;
      if (open) openAgentTask();
    }

    function selectChat() {
      exitAgentTask();
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      agentCards.forEach(item => item.classList.remove("selected"));
      activeAgent = "聊天";
      activeType = "chat";
      agentSelectionPending = false;
      agentPill.textContent = "聊天";
      agentPillButton.classList.remove("required");
      agentOptions.forEach(option => {
        const selected = option.dataset.agentType === "chat";
        option.classList.toggle("selected", selected);
        option.querySelector(".agent-option-check").textContent = selected ? "✓" : "";
        option.setAttribute("aria-selected", String(selected));
      });
      promptInput.disabled = false;
      sendPromptButton.disabled = false;
      promptInput.placeholder = agentConfigs.chat.placeholder;
      renderModelOptions("chat");
      setModelPicker(false);
      modelPicker.hidden = true;
      setAgentPicker(false);
      modal.classList.remove("show");
    }

    function selectCreationHome() {
      activeAgent = "";
      activeType = "";
      agentSelectionPending = false;
      agentCards.forEach(item => item.classList.remove("selected"));
      agentPill.textContent = "选择 Agent";
      agentPillButton.classList.add("required");
      agentOptions.forEach(option => {
        option.classList.remove("selected");
        option.querySelector(".agent-option-check").textContent = "";
        option.setAttribute("aria-selected", "false");
      });
      promptInput.disabled = true;
      sendPromptButton.disabled = true;
      modelPicker.hidden = true;
      setAgentPicker(false);
      setModelPicker(false);
    }

    function resetCreationWorkspace() {
      exitAgentTask();
      chatOutput.classList.remove("show");
      chatOutput.innerHTML = "";
      renderConversationLocator();
      conversationTurnCount = 0;
      agentTurnCounts = {};
      document.getElementById("followupHint").classList.remove("show");
      document.querySelector("#page-creation .creation-stage").classList.add("home-mode");
      agentBrowser.style.display = "block";
      emptyHero.style.display = "block";
      promptInput.value = "";
      selectCreationHome();
      sessionAssets = [];
      pendingSourceAssetId = "";
      Object.assign(creationContext, {
        productId: "",
        productName: "",
        productSource: "library",
        productConfirmed: false,
        productSaved: true,
        originalFields: { marketingScene: "直播间引流" },
        customPresets: []
      });
      Object.keys(originalSuggestionIndex).forEach(key => delete originalSuggestionIndex[key]);
      Object.keys(originalSuggestionPrevious).forEach(key => delete originalSuggestionPrevious[key]);
      originalSuggestionDirty.clear();
      renderSessionAssets();
      activateAssetType("copy");
      setAssetPanel(false);
    }

    function beginAgentCreation(card) {
      if (!card) return;
      if (card.dataset.type === "image-main") return switchPage("image-main-agent");
      if (card.dataset.type === "image-detail") return switchPage("image-detail-agent");
      const title = card.querySelector("strong")?.textContent?.trim() || "新建创作";
      resetCreationWorkspace();
      createSessionSummaryRow(`${title}创作`);
      selectAgent(card, true);
      setNewCreateMenu(false);
      showToast(`已进入${title}流程`);
    }

    function openMixWithProductScript(script) {
      const card = agentCards.find(item => item.dataset.type === "mix");
      if (!card || !script) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能混剪创作");
      selectAgent(card, true);
      const root = dynamicForm.querySelector(".mix-flow-form");
      const productId = Object.entries(mixProductNames).find(([, name]) => name === script.product)?.[0];
      const product = dynamicForm.querySelector("[data-mix-product]");
      if (productId && product) {
        product.value = productId;
        syncMixProductMaterials(productId);
      }
      if (root) root._mixExternalScript = script;
      root?.querySelector('[data-mix-plan="script"]')?.click();
      const source = dynamicForm.querySelector("[data-mix-existing-script]");
      if (source) {
        const option = document.createElement("option");
        option.value = script.id;
        option.dataset.product = productId || "";
        option.textContent = `${script.name}｜${script.rows?.length || 0} 段`;
        source.prepend(option);
        source.value = script.id;
        source.dispatchEvent(new Event("change", { bubbles:true }));
      }
      showToast(`已带入脚本“${script.name}”`);
    }

    function openScriptWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "script");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能脚本创作");
      selectAgent(card, true);
      const source = dynamicForm.querySelector("[data-script-source-library]");
      if (!source) return;
      source.value = copy.id;
      refreshScriptLibraryTrigger();
      syncScriptSourcePreviewFromLibrary();
      const productInput = dynamicForm.querySelector('[data-script-product-panel="library"] [data-script-product]');
      if (productInput) {
        productInput.value = productCatalog[copy.productId]?.name || copy.productId || "";
        productInput.dataset.productId = copy.productId || "";
        productInput.setAttribute("data-product-id", copy.productId || "");
      }
      syncScriptLibraryProductDisplay();
      showToast("已带入文案，可继续选择素材并生成脚本");
    }

    function openMixWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "mix");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能混剪创作");
      selectAgent(card, true);
      const root = dynamicForm.querySelector(".mix-flow-form");
      const product = dynamicForm.querySelector("[data-mix-product]");
      if (copy.productId && product) {
        product.value = copy.productId;
        syncMixProductMaterials(copy.productId);
      }
      if (root) root._mixExternalCopy = copy;
      root?.querySelector('[data-mix-plan="copy"]')?.click();
      const source = dynamicForm.querySelector("[data-mix-existing-copy]");
      if (source) {
        const option = document.createElement("option");
        const count = copy.text.replace(/\s/g, "").length;
        option.value = copy.id;
        option.dataset.product = copy.productId || "";
        option.textContent = `${copy.audience || "已有文案"}口播｜${mixProductNames[copy.productId] || "未关联产品"}｜约${Math.max(1, Math.round(count / 3.35))}秒`;
        source.prepend(option);
        source.value = copy.id;
        source.dispatchEvent(new Event("change", { bubbles:true }));
      }
      showToast("已带入文案，可继续确认配音与素材");
    }

    function openRewriteWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "rewrite");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能改写创作");
      selectAgent(card, true);
      dynamicForm.querySelector('[data-rewrite-source-mode="paste"]')?.click();
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      if (textarea) {
        textarea.value = copy.text;
        textarea.dispatchEvent(new Event("input", { bubbles:true }));
      }
      const product = dynamicForm.querySelector("[data-manual-product-name]");
      if (product) product.value = productCatalog[copy.productId]?.name || "";
      showToast("已带入待改写文案，原资产不会被覆盖");
    }

    function openImitationWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "copy");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("爆款仿写创作");
      selectAgent(card, true);
      const source = dynamicForm.querySelector("[data-reference-source]");
      if (source) {
        source.value = "text";
        source.dispatchEvent(new Event("change", { bubbles:true }));
      }
      const reference = dynamicForm.querySelector('[data-reference-panel="text"] [data-reference-value]');
      if (reference) reference.value = copy.text;
      const product = dynamicForm.querySelector("[data-manual-product-name]");
      if (product) product.value = productCatalog[copy.productId]?.name || "";
      showToast("已将该文案作为参考内容带入，系统只学习结构与节奏");
    }

    window.addEventListener("content-compass:mix-script", event => openMixWithProductScript(event.detail?.script));
    window.addEventListener("content-compass:script-copy", event => openScriptWithProductCopy(event.detail?.copy));
    window.addEventListener("content-compass:mix-copy", event => openMixWithProductCopy(event.detail?.copy));
    window.addEventListener("content-compass:rewrite-copy", event => openRewriteWithProductCopy(event.detail?.copy));
    window.addEventListener("content-compass:imitate-copy", event => openImitationWithProductCopy(event.detail?.copy));

    agentCards.forEach(card => {
      card.addEventListener("click", () => beginAgentCreation(card));
    });

    agentOptions.forEach(option => {
      option.addEventListener("click", () => {
        const card = agentCards.find(item => item.dataset.type === option.dataset.agentType);
        if (card) selectAgent(card, true);
      });
    });

    function closeModal(commit = false) {
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      modal.classList.remove("show");
      if (agentSelectionPending && !commit) {
        agentSelectionPending = false;
        selectCreationHome();
        return;
      }
      agentSelectionPending = false;
    }
    document.getElementById("closeModal").addEventListener("click", () => closeModal(false));
    document.getElementById("cancelModal").addEventListener("click", () => closeModal(false));
    modal.addEventListener("click", event => { if (event.target === modal) closeModal(false); });

    agentPillButton.addEventListener("click", event => {
      event.stopPropagation();
      setAgentPicker(!agentPicker.classList.contains("open"));
    });

    const chatOutput = document.getElementById("chatOutput");
    const conversationLocator = document.querySelector("#page-creation .conversation-locator");
    const emptyHero = document.getElementById("emptyHero");
    const promptInput = document.getElementById("promptInput");
    const composerWrap = document.querySelector("#page-creation .composer-wrap");
    const taskShell = document.getElementById("agentTaskShell");
    const taskFormHost = document.getElementById("taskFormHost");
    const taskFormScroll = document.getElementById("taskFormScroll");
    const taskResultHost = document.getElementById("taskResultHost");
    const taskFormActions = document.getElementById("taskFormActions");
    const taskActionButtons = document.getElementById("taskActionButtons");
    const taskActionNote = document.getElementById("taskActionNote");
    const taskStepper = document.getElementById("taskStepper");
    const taskChatLog = document.getElementById("taskChatLog");
    const taskComposerHost = document.getElementById("taskComposerHost");
    const taskRestartModal = document.getElementById("taskRestartModal");
    const taskChatToggle = document.getElementById("taskChatToggle");
    function setTaskChatCollapsed(collapsed) {
      taskShell.classList.toggle("chat-collapsed", collapsed);
      if (!taskChatToggle) return;
      taskChatToggle.setAttribute("aria-expanded", String(!collapsed));
      taskChatToggle.textContent = collapsed ? "‹" : "›";
      taskChatToggle.title = collapsed ? "展开对话" : "收起对话";
    }
    taskChatToggle?.addEventListener("click", () => setTaskChatCollapsed(!taskShell.classList.contains("chat-collapsed")));
    function personaPickerMarkup(context) {
      return `<div class="original-field full persona-select-field">
        <label>人群画像</label>
        <div class="persona-picker" data-persona-picker data-persona-context="${context}" data-persona-mode="manual">
          <div class="persona-source-switch" role="group" aria-label="人群画像来源">
            <button class="active" type="button" data-persona-source-mode="manual">自行输入</button>
            <button type="button" data-persona-source-mode="template">从模板库选择</button>
          </div>
          <div class="persona-template-select" data-persona-template-select hidden>
            <button class="persona-picker-trigger" type="button" data-persona-trigger aria-haspopup="dialog"><span data-persona-selected>选择人群画像模板</span><small>⌄</small></button>
            <div class="persona-applied" data-persona-applied hidden><span></span><button type="button" data-persona-clear>改为自行输入</button></div>
          </div>
        </div>
      </div>`;
    }
    function creationProductPickerMarkup(hasSourcePanel = false) {
      return `<div class="header-product-picker"${hasSourcePanel ? ' data-product-source-panel="library"' : ""}>
        <button class="header-product-picker-trigger" type="button" data-open-creation-product-picker aria-haspopup="dialog">
          <span class="placeholder" data-product-picker-label>选择产品</span><small>⌄</small>
        </button>
        <input type="hidden" data-product-select data-required value="">
      </div>`;
    }

    function openCreationProductPicker() {
      if (!window.CreationProductPicker) {
        setFormFeedback("产品选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const items = Object.entries(productCatalog).map(([id, product]) => ({ id, ...product }));
      window.CreationProductPicker.open({
        items,
        selectedId: creationContext.productId,
        onConfirm(productId) {
          applyProductToForm(productId, true);
          setFormFeedback(`已选择“${productCatalog[productId].name}”，产品信息已自动带入。`);
        }
      });
    }
    agentConfigs.original.intro = "基于产品事实、目标人群与内容设定，生成可直接用于千川短视频创作的多版本口播文案。";
    agentConfigs.original.process = "确认产品信息 → 设置开场、文案结构、脚本类型、长度与模型 → 生成文案 → 保存、转脚本或继续对话修改。";
    agentConfigs.original.form = `
      <div class="original-flow-form">
        <section class="original-step-panel" data-original-step="1" data-task-step="1">
          <div class="original-step-title">
            <div><h2>产品信息</h2><p>选择产品来源，并确认本次创作使用的产品事实、卖点和目标人群。</p></div>
            <div class="original-header-controls">
              <div class="source-switch" aria-label="产品信息来源">
                <button class="active" type="button" data-product-source="library">产品库</button>
                <button type="button" data-product-source="link">商品链接</button>
                <button type="button" data-product-source="manual">手工输入</button>
              </div>
              ${creationProductPickerMarkup(true)}
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="product-source-inline">
            <div data-product-source-panel="link" hidden>
              <div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div>
            </div>
            <div data-product-source-panel="manual" hidden></div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>基础信息</strong><span>确定本次创作对象</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div>
              <div class="original-field"><label>品牌<span class="required-star">*</span></label><input list="originalBrandOptions" data-original-brand data-required value="轻净" placeholder="输入或搜索品牌"><datalist id="originalBrandOptions"><option value="轻净"><option value="净界"><option value="随行"><option value="其他品牌"></datalist></div>
              <div class="original-field"><label>类目<span class="required-star">*</span></label><input list="originalCategoryOptions" data-original-category data-required value="清洁电器" placeholder="输入或搜索类目"><datalist id="originalCategoryOptions"><option value="清洁电器"><option value="厨房电器"><option value="个护电器"><option value="生活电器"></datalist></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>卖点与信任体系</strong><span>规定文案能说什么、凭什么可信</span></div>
            <div class="original-group-fields">
              <div class="original-field full">
                <div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="core" data-limit="3">
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up" title="上移">↑</button><button type="button" data-point-action="down" title="下移">↓</button><button type="button" data-point-action="remove" title="删除">×</button></span></div>
                  <button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button>
                  <textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea>
                </div>
              </div>
              <div class="original-field full advanced-field" hidden>
                <div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="secondary" data-limit="3">
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div>
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div>
                  <button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button>
                  <textarea data-field="secondary" hidden>透明尘杯可拆卸水洗\n床垫、沙发和布艺均可使用</textarea>
                </div>
              </div>
              <div class="original-field full advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field full"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip">短视频带货</span><span class="choice-chip active">直播间引流</span></div></div>
              <div class="original-field full"><label>营销策略</label><textarea data-field="marketing" placeholder="填写价格、优惠、赠品或活动信息；没有可留空">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden>
                <div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="trust" data-limit="5">
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div>
                  <button class="point-add" type="button" data-point-action="add">＋ 添加背书</button>
                  <textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>人群与表达策略</strong><span>确定文案对谁说、从什么问题切入</span></div>
            <div class="original-group-fields">
              ${personaPickerMarkup("original")}
              <div class="original-field full">
                <label>核心目标人群<span class="required-star">*</span></label>
                <div class="audience-selector">
                  <div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div>
                  <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender" data-audience-locked-gender=""><span class="choice-chip">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
                  <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">50+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="age-custom" data-custom-age hidden><input type="number" min="1" max="99" value="25" data-age-min><span>至</span><input type="number" min="1" max="99" value="40" data-age-max></span></div></div>
                </div>
              </div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain" placeholder="一行一个人群核心痛点">孩子后背红疹反复，半夜痒醒哭闹
床单刚换，尘杯仍吸出毛发碎屑
宠物上床后，床褥清洁总停在表面</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div>
            </div>
          </div>
        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定口播的开场方式、文案结构、脚本类型、长度和生成模型。</p></div></div>
          <div class="original-group">
            <div class="original-group-title"><strong>内容脚本设定</strong><span>控制本次文案的结构与产出规格</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>脚本类型<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="script-type" data-role="script-type"><span class="choice-chip active">不限</span><span class="choice-chip">引发好奇类型</span><span class="choice-chip">痛点类型</span><span class="choice-chip">活动类型</span><span class="choice-chip">悬疑类型</span><span class="choice-chip">打感情类型</span><span class="choice-chip">对比类型</span><span class="choice-chip">种草类型</span><span class="choice-chip">网络爆款音频类型</span><span class="choice-chip">制造焦虑类型</span><span class="choice-chip">明星文案类型</span><span class="choice-chip">点名人群类型</span><span class="choice-chip">正话反说类型</span><span class="choice-chip">品牌类型</span></div></div>
              <div class="original-field full">
                <label>文案结构</label>
                <div class="copy-structure-combobox" data-copy-structure-combobox>
                  <input type="hidden" value="" data-copy-structure-value>
                  <button class="copy-structure-combobox-trigger" type="button" data-action="toggle-copy-structure-picker"><span><b data-copy-structure-label>不限</b><small data-copy-structure-formula id="copyStructureHint">先在上方选择文案风格，下方会自动筛出可用的结构</small></span><em data-copy-structure-source>不限</em><i>⌃</i></button>
                  <div class="copy-structure-combobox-menu">
                    <input type="search" data-copy-structure-search placeholder="搜索结构名称或结构公式">
                    <div class="copy-structure-option-list" data-copy-structure-options></div>
                  </div>
                </div>
              </div>
              <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="300" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 1 分 15 秒</b></div></div>
              <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
              <div class="original-field full"><label>模型</label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
            </div>
          </div>
        </section>
      </div>
    `;

    agentConfigs.copy.intro = "拆解参考爆款的有效创作方法，再结合当前产品事实重新生成原创千川口播文案。";
    agentConfigs.copy.process = "确认爆款参考与产品信息 → 设置字数、数量与模型 → 生成原创仿写文案 → 保存、转脚本或继续对话修改。";
    agentConfigs.copy.placeholder = "还可以补充：节奏再快一点，但不要沿用参考商品的价格和优惠表达……";
    agentConfigs.copy.form = `
      <div class="original-flow-form copy-flow-form">
        <section class="original-step-panel" data-original-step="1" data-task-step="1">
          <div class="original-step-title">
            <div><h2>爆款参考与产品信息</h2><p>先提供参考内容，再确认目标产品事实。系统只学习创作方法，不复制原文。</p></div>
            <div class="original-header-controls">
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="original-group copy-reference-group">
            <div class="original-group-title"><strong>爆款参考</strong><span>从视频库选择、上传视频或粘贴文案；仅学习结构，不复制原文</span></div>
            <div class="original-group-fields">
              <div class="original-field"><label>参考来源<span class="required-star">*</span></label><select data-reference-source data-required><option value="library">从视频库选择</option><option value="copy-library">从文案库选择</option><option value="upload">上传视频</option><option value="text">粘贴文案</option></select></div>
              <div class="original-field" data-reference-panel="library">
                <label>参考视频<span class="required-star">*</span></label>
                <input type="hidden" data-reference-value data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-reference-library"><span data-reference-trigger-text>从视频库选择</span><b>›</b></button>
                <div class="selected-reference-video" data-selected-reference hidden></div>
              </div>
              <div class="original-field" data-reference-panel="copy-library" hidden>
                <label>参考文案<span class="required-star">*</span></label>
                <input type="hidden" data-reference-value data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-reference-copy-library"><span data-reference-copy-trigger-text>从文案库选择</span><b>›</b></button>
              </div>
              <div class="original-field full" data-reference-panel="upload" hidden><label>上传参考视频<span class="required-star">*</span></label><div class="upload-box reference-upload" data-reference-upload><strong>点击选择或拖拽上传视频</strong><span>上传后自动识别口播文案、结构和表达节奏</span></div></div>
              <div class="original-field full" data-reference-panel="text" hidden><label>参考文案<span class="required-star">*</span></label><textarea data-reference-value data-required placeholder="粘贴需要参考的完整口播文案"></textarea></div>
              <div class="original-field full reference-transcript-editor" data-reference-transcript-editor hidden>
                <div class="reference-transcript-head"><label>识别文案<span class="required-star">*</span></label><button type="button" data-action="reset-reference-transcript">恢复识别原文</button></div>
                <textarea data-reference-transcript data-required placeholder="视频中的口播文案将在识别后显示，可直接修改"></textarea>
              </div>
              <div class="inline-feedback full" data-reference-feedback hidden></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title copy-basic-title">
              <div><strong>基础信息</strong><span>确定本次仿写对应的产品</span></div>
              <div class="copy-basic-controls">
                <div class="source-switch" aria-label="产品信息来源">
                  <button class="active" type="button" data-product-source="library">产品库</button>
                  <button type="button" data-product-source="link">商品链接</button>
                  <button type="button" data-product-source="manual">手工输入</button>
                </div>
                ${creationProductPickerMarkup(true)}
              </div>
            </div>
            <div class="original-group-fields">
              <div class="product-source-inline full">
                <div data-product-source-panel="link" hidden><div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div></div>
                <div data-product-source-panel="manual" hidden></div>
              </div>
              <div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div>
              <div class="original-field"><label>品牌<span class="required-star">*</span></label><input list="copyBrandOptions" data-original-brand data-required value="轻净" placeholder="输入或搜索品牌"><datalist id="copyBrandOptions"><option value="轻净"><option value="净界"><option value="随行"><option value="其他品牌"></datalist></div>
              <div class="original-field"><label>类目<span class="required-star">*</span></label><input list="copyCategoryOptions" data-original-category data-required value="清洁电器" placeholder="输入或搜索类目"><datalist id="copyCategoryOptions"><option value="清洁电器"><option value="厨房电器"><option value="个护电器"><option value="生活电器"></datalist></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>卖点与信任体系</strong><span>所有对外表达均以当前产品信息为准</span></div>
            <div class="original-group-fields">
              <div class="original-field full">
                <div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="core" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up" title="上移">↑</button><button type="button" data-point-action="down" title="下移">↓</button><button type="button" data-point-action="remove" title="删除">×</button></span></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea></div>
              </div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div><div class="point-editor" data-point-editor="secondary" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div><div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="secondary" hidden>透明尘杯可拆卸水洗\n床垫、沙发和布艺均可使用</textarea></div></div>
              <div class="original-field full advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field advanced-field" hidden><label>营销场景</label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip">短视频带货</span><span class="choice-chip active">直播间引流</span></div></div>
              <div class="original-field advanced-field" hidden><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前产品真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>人群与表达策略</strong><span>确定仿写内容最终对谁表达</span></div>
            <div class="original-group-fields">
              ${personaPickerMarkup("copy")}
              <div class="original-field full"><label>核心目标人群<span class="required-star">*</span></label><div class="audience-selector"><div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div><div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender" data-audience-locked-gender=""><span class="choice-chip">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div><div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="custom-age-range" data-custom-age hidden><input type="number" min="1" max="99" value="25" data-age-min><i>至</i><input type="number" min="1" max="99" value="40" data-age-max></span></div></div></div></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain" placeholder="一行一个人群核心痛点">孩子后背红疹反复，半夜痒醒哭闹\n床单刚换，尘杯仍吸出毛发碎屑</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div>
            </div>
          </div>
        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定仿写文案的长度、生成数量和使用模型。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="300" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 1 分 15 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型</label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
          </div></div>
        </section>
      </div>`;

    agentConfigs.rewrite.intro = "对已有文案做可控改写，只修改选定范围，未指定内容默认保持不变。";
    agentConfigs.rewrite.process = "确认原文与产品信息 → 选择改写方式、长度、数量和模型 → 生成多个改写版本 → 保存或继续对话修改。";
    agentConfigs.rewrite.placeholder = "还可以补充：第一句更硬、更短，正文卖点顺序不要改……";
    agentConfigs.rewrite.form = `
      <div class="original-flow-form rewrite-flow-form">
        <section class="original-step-panel" data-original-step="1" data-task-step="1">
          <div class="original-step-title">
            <div><h2>文案与产品信息</h2><p>选择待改写文案，并确认改写时允许使用的产品事实。</p></div>
            <div class="original-header-controls">
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="original-group rewrite-source-group">
            <div class="original-group-title"><strong>文案信息</strong><span>从文案库选择或手动输入，原资产不会被覆盖</span></div>
            <div class="original-group-fields">
              <div class="original-field"><label>文案来源<span class="required-star">*</span></label><input type="hidden" data-rewrite-source data-required value="library"><div class="source-mode-switch" role="tablist" aria-label="文案来源切换"><button type="button" class="active" data-rewrite-source-mode="library" role="tab" aria-selected="true">从文案库选择</button><button type="button" data-rewrite-source-mode="paste" role="tab" aria-selected="false">手动输入</button></div></div>
              <div class="original-field" data-rewrite-library-field>
                <label>选择文案<span class="required-star">*</span></label>
                <input type="hidden" data-rewrite-library data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-rewrite-copy-library"><span data-rewrite-library-trigger-text>从文案库选择</span><b>›</b></button>
              </div>
              <div class="original-field full"><label>待改写文案<span class="required-star">*</span></label><textarea data-rewrite-original data-field="sourceCopy" data-required placeholder="选择文案后自动带入，仍可在本次任务中修改"></textarea></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title copy-basic-title">
              <div><strong>基础信息</strong><span>默认带入所选文案的关联产品，也可重新指定</span></div>
              <div class="copy-basic-controls">
                <div class="source-switch" aria-label="产品信息来源">
                  <button class="active" type="button" data-product-source="library">产品库</button>
                  <button type="button" data-product-source="link">商品链接</button>
                  <button type="button" data-product-source="manual">手工输入</button>
                </div>
                ${creationProductPickerMarkup(true)}
              </div>
            </div>
            <div class="original-group-fields">
              <div class="product-source-inline full">
                <div data-product-source-panel="link" hidden><div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div></div>
                <div data-product-source-panel="manual" hidden></div>
              </div>
              <div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div>
              <div class="original-field"><label>品牌<span class="required-star">*</span></label><input data-original-brand data-required value="轻净"></div>
              <div class="original-field"><label>类目<span class="required-star">*</span></label><input data-original-category data-required value="清洁电器"></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>卖点与信任体系</strong><span>限定改写时可使用的产品信息</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div><div class="point-editor" data-point-editor="core" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up">↑</button><button type="button" data-point-action="down">↓</button><button type="button" data-point-action="remove">×</button></span></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea></div></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div><div class="point-editor" data-point-editor="secondary" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div><div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="secondary" hidden>透明尘杯可拆卸水洗\n床垫、沙发和布艺均可使用</textarea></div></div>
              <div class="original-field full advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁结果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip">短视频带货</span><span class="choice-chip active">直播间引流</span></div></div>
              <div class="original-field"><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>改写设置</h2><p>只修改选定范围，未指定的原文结构、事实、卖点顺序和 CTA 默认保持不变。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field full"><label>改写方式<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="rewrite-method" data-role="rewrite-method"><span class="choice-chip active" data-rewrite-method="hook">只换前 3 秒钩子</span><span class="choice-chip" data-rewrite-method="shorten">缩短文案</span><span class="choice-chip" data-rewrite-method="audience">更换目标人群</span><span class="choice-chip" data-rewrite-method="selling">卖点前置</span><span class="choice-chip" data-rewrite-method="style">调整表达风格</span><span class="choice-chip" data-rewrite-method="rephrase">保留结构重新表达</span></div></div>
            <div class="original-field full" data-rewrite-setting-host></div>
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="300" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 1 分 15 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型</label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
          </div></div>
        </section>
      </div>`;

    const agentStepPlans = {
      original: ["产品信息", "生成设置", "AI生成文案"],
      copy: ["爆款参考与产品信息", "生成设置", "AI生成文案"],
      rewrite: ["文案与产品信息", "改写设置", "AI生成文案"],
      "image-main": ["产品与主图目标", "画面要求", "选择模型", "确认生成"],
      "image-detail": ["产品与详情页模块", "画面约束", "选择模型", "确认生成"],
      script: ["文案信息", "脚本策略", "AI 生成脚本"],
      "script-copy": ["参考脚本", "重构策略", "确认生成"],
      mix: ["创作方案", "文案与配音", "脚本与素材", "生成视频"],
    };
    const agentGreetings = {
      original: "我是智能文案 Agent。我会基于产品事实、目标人群和内容设定生成千川口播文案。请先确认左侧产品信息。",
      copy: "我是爆款文案仿写 Agent。我会保留参考内容的有效方法，再为你的产品重新创作。",
      rewrite: "我是智能改写 Agent。我会保留你指定的内容，按目标完成可控改写。",
      "image-main": "我是商品主图 Agent。我会根据产品图、卖点和投放用途生成可继续调整的商品主图。",
      "image-detail": "我是商品详情页 Agent。我会把产品卖点拆成有阅读顺序、可继续编辑的详情页图片模块。",
      script: "我是智能脚本 Agent。我会基于已确认口播文案、产品事实和素材库,输出可人工审核的结构化分镜脚本与推荐素材方案。",
      "script-copy": "我是爆款脚本仿写 Agent。我会借鉴参考脚本的节奏与镜头逻辑，为当前产品重新设计。",
      mix: "我是智能混剪 Agent。我会使用你已有的创作素材，先协助确认文案与 AI 配音，再完成镜头匹配、裁切拼接和成片质检。"
    };
    let taskStep = 1;
    let taskCompleted = false;
    let taskEditing = false;
    let originalTaskAssetIds = [];
    let originalCopyTargetId = "";
    let scriptTargetId = "";
    const mixReplacementNames = ["床垫纤维与碎屑特写", "沙发表面拍打吸尘", "儿童房床垫深度清洁", "尘杯拆卸水洗过程"];

    function mixSelectedMaterialIds() {
      return [...dynamicForm.querySelectorAll("[data-mix-material].selected")].map(card => card.dataset.mixMaterial);
    }

    function updateMixMaterialSummary() {
      const count = mixSelectedMaterialIds().length;
      dynamicForm.querySelector("[data-mix-selected-count]")?.replaceChildren(String(count));
      dynamicForm.querySelector("[data-mix-used-count]")?.replaceChildren(`${count} 个`);
      dynamicForm.querySelector("[data-mix-final-materials]")?.replaceChildren(`${count} 个`);
      const cards = [...dynamicForm.querySelectorAll("[data-mix-material]")];
      const selectAllBtn = dynamicForm.querySelector("[data-mix-select-all]");
      if (selectAllBtn) {
        const allSelected = cards.length > 0 && cards.every(card => card.classList.contains("selected"));
        selectAllBtn.disabled = !cards.length;
        selectAllBtn.setAttribute("aria-pressed", String(allSelected));
        selectAllBtn.textContent = allSelected ? "取消全选" : "全选";
      }
    }

    function mixTimeLabel(seconds) {
      const value = Math.max(0, Math.round(seconds));
      return `${String(Math.floor(value / 60)).padStart(2,"0")}:${String(value % 60).padStart(2,"0")}`;
    }

    function syncMixScriptTimeline(target) {
      const weights = [5, 10, 19, 18, 8];
      let start = 0;
      dynamicForm.querySelectorAll("[data-mix-script-row]").forEach((row, index) => {
        const duration = index === weights.length - 1 ? target - start : target * weights[index] / 60;
        const end = start + duration;
        const time = row.querySelector("header b");
        const length = row.querySelector("header span");
        if (time) time.textContent = `${mixTimeLabel(start)}–${mixTimeLabel(end)}`;
        if (length) length.textContent = `${duration.toFixed(1)}s`;
        start = end;
      });
    }

    function syncMixDuration() {
      const copy = dynamicForm.querySelector("[data-mix-copy]");
      const speed = Number(dynamicForm.querySelector("[data-mix-speed]")?.value || 1);
      const target = Number(dynamicForm.querySelector("[data-mix-target-duration]")?.value || 60);
      const count = String(copy?.value || "").replace(/\s/g, "").length;
      const duration = Math.max(4, count / 3.35 / speed);
      const durationText = `${duration.toFixed(1)} 秒`;
      const difference = duration - target;
      const differenceText = `${difference > 0 ? "+" : difference < 0 ? "−" : ""}${Math.abs(difference).toFixed(1)} 秒 · ${Math.abs(difference) <= 2 ? "可生成" : "建议适配"}`;
      dynamicForm.querySelector("[data-mix-copy-count]")?.replaceChildren(String(count));
      dynamicForm.querySelector("[data-mix-speed-label]")?.replaceChildren(`${speed.toFixed(2)}×`);
      dynamicForm.querySelector("[data-mix-duration]")?.replaceChildren(durationText);
      dynamicForm.querySelector("[data-mix-target-duration-display]")?.replaceChildren(`${target.toFixed(1)} 秒`);
      const diffNode = dynamicForm.querySelector("[data-mix-duration-diff]");
      if (diffNode) {
        diffNode.textContent = differenceText;
        diffNode.classList.toggle("warning", Math.abs(difference) > 2);
      }
      dynamicForm.querySelector("[data-mix-script-duration]")?.replaceChildren(`${target.toFixed(1)}s`);
      dynamicForm.querySelector("[data-mix-final-duration]")?.replaceChildren(`${target.toFixed(1)} 秒`);
      syncMixScriptTimeline(target);
      const voice = dynamicForm.querySelector("[data-mix-voice]")?.value.split(" · ")[0] || "许念";
      dynamicForm.querySelector("[data-mix-final-voice]")?.replaceChildren(`${voice} · ${speed.toFixed(2)}×`);
      const status = dynamicForm.querySelector("[data-mix-voice-status]");
      if (status) status.textContent = `${voice} · ${speed.toFixed(2)}×`;
    }

    function renderMixPlanContext(mode) {
      const host = dynamicForm.querySelector("[data-mix-plan-context]");
      const badge = dynamicForm.querySelector("[data-mix-source-badge]");
      if (!host) return;
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (root) root.dataset.mixPlanMode = mode;
      const contexts = {
        ai: `<span class="mix-plan-icon">✦</span><div class="mix-context-main"><strong>内容结构</strong><small>默认由系统从千川训练验证的爆款结构库中自动匹配。</small><div class="mix-structure-mode"><button class="active" type="button" data-mix-structure-mode="auto"><b>AI 智能匹配</b><small>推荐 · 根据产品、素材与投放数据选择</small></button><button type="button" data-mix-structure-mode="manual"><b>手工指定</b><small>从模板库选择一个结构</small></button></div><div data-mix-auto-structure-panel class="mix-auto-structure"><span>系统将综合</span><b>品类与卖点</b><b>目标人群</b><b>视频时长</b><b>素材表达能力</b><b>千川历史表现</b></div><div data-mix-manual-structure-panel hidden><select data-mix-content-structure><option value="result">结果前置·痛点解决·行动引导型</option><option value="contrast">问题冲突·产品演示·对比证明型</option><option value="scene">人群点名·场景扩展·信任收口型</option></select><div class="mix-structure-preview" data-mix-structure-preview><b>结构公式</b><span>结果钩子 → 痛点解释 → 产品演示 → 效果证明 → 行动引导</span><em>通用结构 · 5 个阶段 · 2 条参考成品</em></div></div><label class="mix-content-supplement"><span>补充内容素材（选填）</span><textarea data-mix-content-supplement placeholder="可粘贴内容要点或参考文案。AI只提取有效信息，不保留原句和顺序。"></textarea><small>补充内容服从产品事实和最终采用的爆款结构。</small></label></div>`,
        copy: `<span class="mix-plan-icon">文</span><div class="mix-context-main"><strong>选择已有文案</strong><small>文案将完整带入第二步，仅修改本次任务副本。</small><select data-mix-existing-copy hidden><option value="">请选择文案</option></select><button class="mix-picker-trigger mix-source-picker" type="button" data-mix-pick-copy><span data-mix-source-picker-label>选择文案</span><i>›</i></button><div class="mix-source-asset-info" data-mix-source-asset-info><b>尚未选择文案</b><span>选择后将带入关联产品与内容摘要。</span><em>请选择一条文案继续</em></div><div class="mix-source-conflict" data-mix-source-conflict hidden></div></div>`,
        script: `<span class="mix-plan-icon">稿</span><div class="mix-context-main"><strong>选择已有脚本</strong><small>脚本口播在第二步确认；原分镜在第三步按当前素材和配音重新校准。</small><select data-mix-existing-script hidden><option value="">请选择脚本</option></select><button class="mix-picker-trigger mix-source-picker" type="button" data-mix-pick-script><span data-mix-source-picker-label>选择脚本</span><i>›</i></button><div class="mix-source-asset-info" data-mix-source-asset-info><b>尚未选择脚本</b><span>选择后将带入关联产品、口播与分镜信息。</span><em>请选择一个脚本继续</em></div><div class="mix-source-conflict" data-mix-source-conflict hidden></div></div>`
      };
      host.innerHTML = contexts[mode] || contexts.ai;
      if (root && mode === "ai") root.dataset.mixStructureMode = "auto";
      if (badge) badge.textContent = { ai:"AI 生成", copy:"已有文案", script:"已有脚本" }[mode] || "AI 生成";
      const product = dynamicForm.querySelector("[data-mix-product]");
      const origin = dynamicForm.querySelector("[data-mix-product-origin]");
      const sourceSelect = host.querySelector("[data-mix-existing-copy], [data-mix-existing-script]");
      const followsAsset = (mode === "copy" || mode === "script") && Boolean(sourceSelect?.value);
      if (product) product.disabled = followsAsset;
      if (origin) origin.textContent = followsAsset
        ? `目标产品已从所选${mode === "copy" ? "文案" : "脚本"}自动带入；如需更换产品，应改为参考内容重新创作。`
        : mode === "ai" ? "AI生成需选择目标产品；系统将据此匹配爆款结构、校验文案并限定素材范围。" : `请先选择${mode === "copy" ? "文案" : "脚本"}，系统将自动带入关联产品。`;
      if (sourceSelect?.value) updateMixSourceAsset(sourceSelect);
    }

    const mixProductNames = { "mite-pro":"轻净 Pro 除螨仪", "washer-s5":"净界洗地机 S5", "air-a8":"轻享空气炸锅 A8" };
    const mixProductMaterialSamples = {
      "mite-pro":[["M-CL-101","透明尘杯脏污特写","结果证明",2],["M-SC-301","床垫表面推进清洁","使用过程",6],["M-CL-102","拍打吸尘动作特写","功能演示",5],["M-PF-201","卧室床垫清洁全景","使用场景",8],["M-PF-202","沙发布艺清洁全景","多场景",7],["M-AT-503","产品定帧与购买引导","行动引导",4]],
      "washer-s5":[["W-101","污水箱清洁结果","结果证明",2],["W-102","贴边清洁推进","功能演示",7],["W-103","毛发吸入特写","痛点解决",5],["W-104","客厅地面全景","使用场景",8],["W-105","滚刷自清洁过程","使用便利",6]],
      "air-a8":[["A-101","薯条出锅结果","结果证明",3],["A-102","食材放入炸篮","使用过程",5],["A-103","热风工作特写","功能演示",6],["A-104","家庭餐桌场景","使用场景",8],["A-105","炸篮拆洗过程","使用便利",5]]
    };
    const mixStructureData = {
      result: { name:"结果前置·痛点解决·行动引导型", formula:"结果钩子 → 痛点解释 → 产品演示 → 效果证明 → 行动引导", meta:"通用结构 · 5 个阶段 · 2 条参考成品" },
      contrast: { name:"问题冲突·产品演示·对比证明型", formula:"问题冲突 → 错误方式 → 产品演示 → 前后对比 → 行动引导", meta:"清洁电器 · 5 个阶段 · 3 条参考成品" },
      scene: { name:"人群点名·场景扩展·信任收口型", formula:"人群点名 → 场景痛点 → 使用过程 → 多场景扩展 → 信任收口", meta:"家庭清洁 · 5 个阶段 · 2 条参考成品" }
    };

    function syncMixProductMaterials(productId) {
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const empty = dynamicForm.querySelector("[data-mix-empty-material]");
      const facts = dynamicForm.querySelector("[data-mix-product-facts] span");
      if (!grid || !empty) return;
      if (!productId) {
        grid.hidden = true;
        empty.hidden = false;
        syncMixMaterialSelection([]);
        if (contextStatus) {
          contextStatus.hidden = false;
          contextStatus.textContent = "未选择产品";
        }
        return;
      }
      grid.hidden = false;
      empty.hidden = true;
      const samples = mixProductMaterialSamples[productId] || [];
      grid.innerHTML = samples.map((item, index) => `<article class="mix-material-card selected${index === 0 ? " must" : ""}" data-mix-material="${item[0]}"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button">${index === 0 ? "必用" : "设为必用"}</button><div class="mix-material-cover tone-${index % 6 + 1}"><span>${item[1]}</span><em>00:${String(item[3]).padStart(2,"0")}</em></div><strong>${item[1]}</strong><small>${item[2]} · 已分析</small></article>`).join("");
      if (facts) facts.textContent = productId === "mite-pro" ? "深层清洁 · 拍打吸尘同步 · 透明尘杯可水洗 · 禁用“100%除螨”" : productId === "washer-s5" ? "吸拖洗一体 · 贴边清洁 · 滚刷自清洁 · 禁用“完全无水渍”" : "热风循环 · 多档温控 · 炸篮可拆洗 · 禁用“零油脂”";
      dynamicForm.querySelector("[data-mix-final-product]")?.replaceChildren(mixProductNames[productId]);
      dynamicForm.querySelector("[data-mix-total-count]")?.replaceChildren(String(samples.length));
      if (contextStatus) {
        contextStatus.hidden = false;
        contextStatus.textContent = `已选择：${mixProductNames[productId]}`;
      }
      updateMixMaterialSummary();
    }

    function updateMixSourceAsset(select) {
      const option = select?.selectedOptions?.[0];
      if (!option) return;
      const assetProduct = option.dataset.product || "";
      const productSelect = dynamicForm.querySelector("[data-mix-product]");
      const currentProductId = productSelect?.value || "";
      const info = dynamicForm.querySelector("[data-mix-source-asset-info]");
      const conflict = dynamicForm.querySelector(".mix-source-conflict");
      const isScript = select.matches("[data-mix-existing-script]");
      const externalCopy = !isScript && dynamicForm.querySelector(".mix-flow-form")?._mixExternalCopy;
      const isExternalCopy = externalCopy?.id === option.value;
      if (info) {
        info.querySelector("b").textContent = `关联产品：${mixProductNames[assetProduct] || "未关联产品"}`;
        info.querySelector("span").textContent = isScript
          ? `来源文案：${option.textContent.split("｜")[0]}口播 · 分镜可重新校准`
          : isExternalCopy
            ? `内容结构：${externalCopy.structure || "未标注"} · 可在第二步编辑`
            : `内容摘要：${option.textContent.split("｜")[0]} · 可在第二步编辑`;
      }
      if (assetProduct && assetProduct !== currentProductId) {
        if (info) info.querySelector("em").textContent = "! 与当前目标产品不一致，需先处理";
        if (conflict) {
          conflict.hidden = false;
          conflict.innerHTML = `<strong>产品冲突</strong><span>该${isScript ? "脚本" : "文案"}关联“${mixProductNames[assetProduct]}”，当前目标产品为“${mixProductNames[currentProductId] || "未选择"}”。</span><div><button type="button" data-mix-use-asset-product="${assetProduct}">切换为关联产品</button><button type="button" data-mix-reference-asset>仅参考内容重新创作</button></div>`;
        }
        dynamicForm.querySelector(".mix-flow-form").dataset.mixSourceConflict = "true";
      } else {
        if (info) info.querySelector("em").textContent = "✓ 与当前目标产品一致，可直接使用";
        if (conflict) conflict.hidden = true;
        dynamicForm.querySelector(".mix-flow-form").dataset.mixSourceConflict = "false";
      }
    }

    function setMixSourceSelection(kind, item) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const source = root?.querySelector(kind === "script" ? "[data-mix-existing-script]" : "[data-mix-existing-copy]");
      if (!source || !item) return;
      const productId = item.productId || Object.entries(mixProductNames).find(([, name]) => name === item.product)?.[0] || "";
      const label = kind === "script"
        ? `${item.name}｜${item.product}｜${item.rows?.length || 0} 段`
        : `${mixProductNames[productId] || "通用文案"}｜约${Math.max(1, Math.round((item.text || "").replace(/\s/g, "").length / 4))}秒`;
      source.innerHTML = `<option value="${escapeHtml(item.id)}" data-product="${escapeHtml(productId)}">${escapeHtml(label)}</option>`;
      source.value = item.id;
      root[kind === "script" ? "_mixExternalScript" : "_mixExternalCopy"] = item;
      const trigger = root.querySelector(kind === "script" ? "[data-mix-pick-script]" : "[data-mix-pick-copy]");
      trigger?.querySelector("[data-mix-source-picker-label]")?.replaceChildren(label);
      const productSelect = root.querySelector("[data-mix-product]");
      if (productId && productSelect) {
        productSelect.value = productId;
        productSelect.disabled = true;
        syncMixProductMaterials(productId);
        root.querySelector("[data-mix-product-origin]")?.replaceChildren(`目标产品已从所选${kind === "script" ? "脚本" : "文案"}自动带入；如需更换产品，应改为参考内容重新创作。`);
      }
      updateMixSourceAsset(source);
    }

    function openMixAudiencePicker(root) {
      if (!window.CreationPersonaPicker) return showToast("人群画像选择器加载失败，请刷新页面后重试。");
      const productId = root.querySelector("[data-mix-product]")?.value || "";
      const productName = mixProductNames[productId] || "";
      const current = root.querySelector("[data-mix-audience]")?.dataset.personaId || "";
      window.CreationPersonaPicker.open({
        items: personaCatalog.map(item => ({ ...item, recommended:item.product === productName })),
        selectedId:current,
        onConfirm(persona) {
          const input = root.querySelector("[data-mix-audience]");
          const label = root.querySelector("[data-mix-audience-label]");
          if (input) { input.value = persona.audience; input.dataset.personaId = persona.id; }
          if (label) label.textContent = `${persona.audience} · ${persona.name.split("—").pop()}`;
          showToast(`已应用人群画像：${persona.name}`);
        }
      });
    }

    function syncMixStructureDecision() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const plan = root?.dataset.mixPlanMode || "ai";
      const mode = root?.dataset.mixStructureMode || "auto";
      const selectedId = dynamicForm.querySelector("[data-mix-content-structure]")?.value || "result";
      const productId = dynamicForm.querySelector("[data-mix-product]")?.value || "mite-pro";
      const autoId = productId === "washer-s5" ? "contrast" : productId === "air-a8" ? "scene" : "result";
      const chosenId = plan === "ai" && mode === "manual" ? selectedId : plan === "ai" ? autoId : "result";
      const structure = mixStructureData[chosenId];
      const target = Number(dynamicForm.querySelector("[data-mix-target-duration]")?.value || 60);
      const name = dynamicForm.querySelector("[data-mix-result-structure-name]");
      const formula = dynamicForm.querySelector("[data-mix-result-structure-formula]");
      const reason = dynamicForm.querySelector("[data-mix-result-structure-reason]");
      if (name) name.textContent = structure.name;
      if (formula) formula.textContent = structure.formula;
      const materialReason = productId === "washer-s5" ? "现有素材包含污水箱结果、贴边清洁和前后对比画面" : productId === "air-a8" ? "现有素材覆盖出锅结果、使用过程和家庭餐桌场景" : "现有素材包含尘杯结果特写和完整产品演示";
      if (reason) reason.textContent = plan === "ai" && mode === "auto"
        ? `匹配原因：${materialReason}；${target}秒可覆盖痛点、演示与证明；该结构近30天同品类消耗排名第1。`
        : plan === "ai" ? `指定原因：你在第一步手工选择了该结构，AI将严格按阶段顺序生成文案与分镜。`
        : plan === "copy" ? "结构来源：系统从已选文案中自动识别，仅用于镜头匹配，不会重写原文顺序。"
        : "结构来源：沿用已选脚本的原有阶段，并按当前配音时长重新校准。";
      const result = dynamicForm.querySelector("[data-mix-structure-result]");
      if (result) result.classList.toggle("is-inherited", plan !== "ai");
      const changeButton = dynamicForm.querySelector("[data-mix-change-structure]");
      if (changeButton) changeButton.hidden = plan !== "ai";
    }

    function syncMixPlanToConfirmation() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const plan = root?.dataset.mixPlanMode || "ai";
      const copy = dynamicForm.querySelector("[data-mix-copy]");
      const sourceBadge = dynamicForm.querySelector("[data-mix-source-badge]");
      const regenerate = dynamicForm.querySelector("[data-mix-regenerate-copy]");
      const copySamples = {
        "copy-mite":"刚换的床单，看起来干净，不代表床垫深处没有毛发和碎屑。轻净 Pro 在床垫表面推进时，拍打与吸尘同步进行，清洁后的结果直接呈现在透明尘杯里。床垫、沙发和日常布艺都能使用，用完尘杯还能拆下水洗。想看完整实测过程，点击商品了解更多。",
        "copy-pet":"家里有宠物，床铺和沙发表面看不到的毛发碎屑更容易被忽略。轻净 Pro 边拍边吸，清洁结果通过透明尘杯直接呈现，用完还能拆洗。",
        "copy-washer":"地面刚拖完又留下水渍和毛发？净界 S5 洗地机把吸、拖、洗结合起来，清洁过程更省力。"
      };
      const scriptSamples = {
        "script-mite":"刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先看轻净 Pro 走完一遍后的透明尘杯。拍打和吸尘同步进行，把织物深处的细小脏污带出来。床垫、沙发和布艺都能使用，用完尘杯还可以拆下来水洗。点击商品，查看完整实测。",
        "script-test":"先不讲参数，直接看一次真实床褥清洁。轻净 Pro 从床垫表面推进，拍打和吸尘同步完成，脏污直接进入透明尘杯。再切换到沙发与布艺场景，最后展示尘杯拆卸水洗。",
        "script-air":"炸薯条总是外焦里软？轻享 A8 空气炸锅通过热风循环完成加热，操作简单，清洁也更方便。"
      };
      if (plan === "copy") {
        const id = dynamicForm.querySelector("[data-mix-existing-copy]")?.value || "copy-mite";
        const externalCopy = root?._mixExternalCopy;
        if (copy) copy.value = externalCopy?.id === id
          ? externalCopy.text
          : (copySamples[id] || copySamples["copy-mite"]);
        if (sourceBadge) sourceBadge.textContent = "已有文案 · 本次副本";
        if (regenerate) regenerate.textContent = "恢复来源文案";
      } else if (plan === "script") {
        const id = dynamicForm.querySelector("[data-mix-existing-script]")?.value || "script-mite";
        const externalScript = root?._mixExternalScript;
        if (copy) copy.value = externalScript?.id === id
          ? (externalScript.sourceFull || externalScript.source || scriptSamples["script-mite"])
          : (scriptSamples[id] || scriptSamples["script-mite"]);
        if (sourceBadge) sourceBadge.textContent = "已有脚本口播 · 本次副本";
        if (regenerate) regenerate.textContent = "恢复脚本口播";
      } else {
        if (sourceBadge) sourceBadge.textContent = root?.dataset.mixStructureMode === "manual" ? "AI生成 · 指定结构" : "AI生成 · 智能匹配";
        if (regenerate) regenerate.textContent = "按当前结构重新生成";
        const productId = dynamicForm.querySelector("[data-mix-product]")?.value || "mite-pro";
        const manualId = dynamicForm.querySelector("[data-mix-content-structure]")?.value || "result";
        const structureId = root?.dataset.mixStructureMode === "manual" ? manualId : productId === "washer-s5" ? "contrast" : productId === "air-a8" ? "scene" : "result";
        const generated = {
          result:"刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先看轻净 Pro 走完一遍后的透明尘杯，结果不用猜。拍打和吸尘同步进行，把织物深处的细小脏污带出来。床垫、沙发和其他布艺都能使用，用完尘杯还可以拆下来水洗。家里有孩子或宠物，日常清洁别只停留在表面。点击商品，查看完整实测过程。",
          contrast:"地面刚拖完，为什么还是留下水渍和毛发？普通拖把容易把脏污来回带，净界 S5 从贴边清洁开始，把吸、拖、洗结合在一次推进里。清洁前后的差别直接看污水箱，滚刷使用后还能启动自清洁。客厅、餐区和墙边都能连续处理，减少反复换工具。点击商品，查看完整清洁演示。",
          scene:"工作日想快速做一顿热食，又不想守在锅边？轻享 A8 从食材放入炸篮开始，通过热风循环完成加热。薯条、小食和家庭加餐可以按不同档位处理，出锅状态直接展示。使用后炸篮可以拆下清洗，日常收拾更方便。点击商品，查看更多家庭场景做法。"
        }[structureId];
        if (copy) copy.value = generated;
        fitMixCopyToTarget(false);
      }
      syncMixStructureDecision();
      syncMixDuration();
    }

    function fitMixCopyToTarget(notifyUser = true) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const copy = root?.querySelector("[data-mix-copy]");
      if (!copy) return;
      const target = Number(root.querySelector("[data-mix-target-duration]")?.value || 60);
      const speed = Number(root.querySelector("[data-mix-speed]")?.value || 1);
      const targetChars = Math.max(20, Math.round(target * 3.35 * speed));
      let text = copy.value.trim();
      if (text.replace(/\s/g, "").length > targetChars + 5) {
        const compact = text.replace(/\s/g, "");
        const candidate = compact.slice(0, targetChars);
        const lastStop = Math.max(candidate.lastIndexOf("。"), candidate.lastIndexOf("！"), candidate.lastIndexOf("？"));
        text = lastStop >= targetChars - 12 ? candidate.slice(0, lastStop + 1) : compact.slice(0, targetChars - 4) + "更省心。";
      } else {
        const supplements = "实际使用时，清洁结果可以直接看见。完整过程使用已有实拍素材呈现，方便判断是否适合自己的家庭场景。操作完成后，日常清理也更省心。";
        while (text.replace(/\s/g, "").length < targetChars - 5) text += supplements;
        const compact = text.replace(/\s/g, "");
        const candidate = compact.slice(0, targetChars);
        const lastStop = Math.max(candidate.lastIndexOf("。"), candidate.lastIndexOf("！"), candidate.lastIndexOf("？"));
        text = lastStop >= targetChars - 12 ? candidate.slice(0, lastStop + 1) : compact.slice(0, targetChars - 4) + "更省心。";
      }
      copy.value = text;
      syncMixDuration();
      if (notifyUser) showToast(`文案已适配 ${target} 秒目标时长，可继续试听确认`);
    }

    function syncMixMaterialSelection(ids) {
      const selectedIds = new Set(ids);
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      dynamicForm.querySelectorAll("[data-mix-material]").forEach(card => {
        const selected = selectedIds.has(card.dataset.mixMaterial);
        card.classList.toggle("selected", selected);
        const select = card.querySelector(".mix-material-select");
        if (select) select.textContent = selected ? "✓" : "";
      });
      ids.forEach((id, index) => {
        if (dynamicForm.querySelector(`[data-mix-material="${id}"]`)) return;
        const item = findScriptMaterial(id);
        if (!item || !grid) return;
        const statusLabel = { ok:"已分析", pending:"待分析", analyzing:"分析中", fail:"分析失败" }[item.status] || item.status;
        grid.insertAdjacentHTML("beforeend", `<article class="mix-material-card selected" data-mix-material="${escapeHtml(id)}"><button class="mix-material-select" type="button">✓</button><button class="mix-material-must" type="button" title="设为必用">设为必用</button><div class="mix-material-cover tone-${index % 6 + 1}"><span>${escapeHtml(item.name)}</span><em>00:${String(Math.round(item.duration || 3)).padStart(2,"0")}</em></div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · ${escapeHtml(statusLabel)}</small></article>`);
      });
      updateMixMaterialSummary();
    }

    function validateMixStep(step) {
      setFormFeedback("");
      if (step === 1) {
        const mixPlan = dynamicForm.querySelector(".mix-flow-form")?.dataset.mixPlanMode || "ai";
        if (mixPlan === "copy" && !dynamicForm.querySelector("[data-mix-existing-copy]")?.value) {
          setFormFeedback("请先从文案库选择一条文案。", "error");
          dynamicForm.querySelector("[data-mix-pick-copy]")?.focus();
          return false;
        }
        if (mixPlan === "script" && !dynamicForm.querySelector("[data-mix-existing-script]")?.value) {
          setFormFeedback("请先从脚本库选择一个脚本。", "error");
          dynamicForm.querySelector("[data-mix-pick-script]")?.focus();
          return false;
        }
        const targetDuration = Number(dynamicForm.querySelector("[data-mix-target-duration]")?.value || 0);
        if (targetDuration < 10 || targetDuration > 180) {
          setFormFeedback("视频生成时长需设置在 10–180 秒之间。", "error");
          dynamicForm.querySelector("[data-mix-target-duration]")?.focus();
          return false;
        }
        if (!dynamicForm.querySelector("[data-mix-product]")?.value) {
          setFormFeedback("请先选择产品，系统才能带入对应的创作素材。", "error");
          dynamicForm.querySelector("[data-mix-product]")?.focus();
          return false;
        }
        if (!mixSelectedMaterialIds().length) {
          setFormFeedback("请至少选择 1 个已分析的创作素材。", "error");
          return false;
        }
        if (dynamicForm.querySelector(".mix-flow-form")?.dataset.mixSourceConflict === "true") {
          setFormFeedback("所选内容资产与目标产品不一致，请先处理产品冲突。", "error");
          return false;
        }
        syncMixPlanToConfirmation();
      }
      if (step === 2) {
        const copy = dynamicForm.querySelector("[data-mix-copy]");
        if (!copy?.value.trim()) {
          setFormFeedback("口播文案不能为空。", "error");
          copy?.focus();
          return false;
        }
        if (copy.value.includes("100%除螨")) {
          setFormFeedback("文案包含产品禁用话术“100%除螨”，请修改后继续。", "error");
          copy.focus();
          return false;
        }
        const target = Number(dynamicForm.querySelector("[data-mix-target-duration]")?.value || 60);
        const speed = Number(dynamicForm.querySelector("[data-mix-speed]")?.value || 1);
        const actual = copy.value.replace(/\s/g, "").length / 3.35 / speed;
        if (Math.abs(actual - target) > 2) {
          setFormFeedback(`当前配音约 ${actual.toFixed(1)} 秒，与目标 ${target} 秒偏差较大，请先点击“适配目标时长”。`, "error");
          return false;
        }
      }
      return true;
    }

    function bindMixAgentEvents() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root || root.dataset.bound === "true") return;
      root.dataset.bound = "true";
      root.addEventListener("click", event => {
        const plan = event.target.closest("[data-mix-plan]");
        if (plan) {
          root.querySelectorAll("[data-mix-plan]").forEach(button => button.classList.toggle("active", button === plan));
          renderMixPlanContext(plan.dataset.mixPlan);
          return;
        }
        if (event.target.closest("[data-mix-pick-copy]")) {
          const selectedId = root.querySelector("[data-mix-existing-copy]")?.value || "";
          openScriptLibraryPicker({
            title:"选择文案",
            subtitle:"从文案库选择一条文案，本次只创建副本，不修改原文案。",
            selectedId,
            onConfirm:item => setMixSourceSelection("copy", item)
          });
          return;
        }
        if (event.target.closest("[data-mix-pick-script]")) {
          const selectedId = root.querySelector("[data-mix-existing-script]")?.value || "";
          if (!window.ContentCompassScriptLibrary?.pick) return showToast("脚本库选择器加载失败，请刷新页面后重试。");
          window.ContentCompassScriptLibrary.pick({ selectedId, onConfirm:item => setMixSourceSelection("script", item) });
          return;
        }
        if (event.target.closest("[data-mix-pick-audience]")) {
          openMixAudiencePicker(root);
          return;
        }
        const structureMode = event.target.closest("button[data-mix-structure-mode]");
        if (structureMode) {
          root.dataset.mixStructureMode = structureMode.dataset.mixStructureMode;
          root.querySelectorAll("[data-mix-structure-mode]").forEach(button => button.classList.toggle("active", button === structureMode));
          const manual = structureMode.dataset.mixStructureMode === "manual";
          root.querySelector("[data-mix-auto-structure-panel]").hidden = manual;
          root.querySelector("[data-mix-manual-structure-panel]").hidden = !manual;
          showToast(manual ? "请选择一个爆款内容结构" : "已启用AI智能匹配");
          return;
        }
        const useAssetProduct = event.target.closest("[data-mix-use-asset-product]");
        if (useAssetProduct) {
          const product = root.querySelector("[data-mix-product]");
          product.value = useAssetProduct.dataset.mixUseAssetProduct;
          syncMixProductMaterials(product.value);
          const source = root.querySelector("[data-mix-existing-copy], [data-mix-existing-script]");
          updateMixSourceAsset(source);
          showToast(`目标产品已切换为“${mixProductNames[product.value]}”，素材范围已同步更新`);
          return;
        }
        if (event.target.closest("[data-mix-reference-asset]")) {
          const source = root.querySelector("[data-mix-existing-copy], [data-mix-existing-script]");
          const selected = source?.selectedOptions?.[0]?.textContent?.split("｜")[0] || "所选内容";
          const context = source?.closest(".mix-context-main");
          root.dataset.mixPlanMode = "ai";
          root.dataset.mixStructureMode = "auto";
          root.dataset.mixSourceConflict = "false";
          root.dataset.mixReferenceTitle = selected;
          root.querySelectorAll("[data-mix-plan]").forEach(button => button.classList.toggle("active", button.dataset.mixPlan === "ai"));
          if (source) source.disabled = true;
          if (context) {
            context.querySelector(":scope > strong").textContent = "补充内容素材";
            context.querySelector(":scope > small").textContent = "仅提取有效信息，文案将按当前产品事实和AI匹配结构重新生成。";
            const state = context.querySelector("[data-mix-source-asset-info]");
            if (state) state.innerHTML = `<b>已选择参考：${escapeHtml(selected)}</b><span>不会沿用原产品参数、原句和原顺序</span><em>✓ 将作为AI生成的补充输入</em>`;
          }
          const conflict = root.querySelector(".mix-source-conflict");
          if (conflict) conflict.hidden = true;
          const product = root.querySelector("[data-mix-product]");
          if (product) product.disabled = false;
          const origin = root.querySelector("[data-mix-product-origin]");
          if (origin) origin.textContent = "AI将使用当前目标产品，所选文案或脚本只作为补充内容，不带入原产品事实。";
          showToast("已改为AI生成，原资产仅作为补充内容素材");
          return;
        }
        if (event.target.closest("[data-mix-change-structure]")) {
          setTaskStep(1);
          root.querySelectorAll("[data-mix-plan]").forEach(button => button.classList.toggle("active", button.dataset.mixPlan === "ai"));
          renderMixPlanContext("ai");
          root.dataset.mixStructureMode = "manual";
          root.querySelectorAll("button[data-mix-structure-mode]").forEach(button => button.classList.toggle("active", button.dataset.mixStructureMode === "manual"));
          root.querySelector("[data-mix-auto-structure-panel]").hidden = true;
          root.querySelector("[data-mix-manual-structure-panel]").hidden = false;
          root.querySelector("[data-mix-content-structure]")?.focus();
          showToast("已返回结构设置，选择后需重新确认文案");
          return;
        }
        if (event.target.closest("[data-mix-select-all]")) {
          const cards = [...root.querySelectorAll("[data-mix-material]")];
          const allSelected = cards.length > 0 && cards.every(card => card.classList.contains("selected"));
          cards.forEach(card => {
            card.classList.toggle("selected", !allSelected);
            const select = card.querySelector(".mix-material-select");
            if (select) select.textContent = allSelected ? "" : "✓";
          });
          updateMixMaterialSummary();
          return;
        }
        const materialSelect = event.target.closest(".mix-material-select");
        if (materialSelect) {
          const card = materialSelect.closest("[data-mix-material]");
          card.classList.toggle("selected");
          materialSelect.textContent = card.classList.contains("selected") ? "✓" : "";
          updateMixMaterialSummary();
          return;
        }
        const must = event.target.closest(".mix-material-must");
        if (must) {
          const card = must.closest("[data-mix-material]");
          card.classList.toggle("must");
          must.textContent = card.classList.contains("must") ? "必用" : "设为必用";
          showToast(card.classList.contains("must") ? "已设为必用素材" : "已取消必用标记");
          return;
        }
        if (event.target.closest("[data-mix-show-facts]")) {
          showToast("核心卖点：深层清洁、拍打吸尘同步；信任依据：真实使用过程与透明尘杯；禁用：100%除螨");
          return;
        }
        if (event.target.closest("[data-mix-add-material]")) {
          openScriptMaterialPicker({
            title:"关联创作素材到本次混剪",
            selectedIds:mixSelectedMaterialIds(),
            productName:mixProductNames[root.querySelector("[data-mix-product]")?.value] || "",
            onConfirm:syncMixMaterialSelection
          });
          return;
        }
        if (event.target.closest("[data-mix-regenerate-copy]")) {
          syncMixPlanToConfirmation();
          showToast(root.dataset.mixPlanMode === "ai" ? "已按当前爆款结构重新生成文案" : "已恢复第一步选择的来源内容");
          return;
        }
        const durationPreset = event.target.closest("[data-mix-duration-preset]");
        if (durationPreset) {
          const input = root.querySelector("[data-mix-target-duration]");
          input.value = durationPreset.dataset.mixDurationPreset;
          root.querySelectorAll("[data-mix-duration-preset]").forEach(button => button.classList.toggle("active", button === durationPreset));
          syncMixDuration();
          return;
        }
        if (event.target.closest("[data-mix-fit-duration]")) {
          fitMixCopyToTarget(true);
          return;
        }
        const speedDelta = event.target.closest("[data-mix-speed-minus]") ? -0.05 : event.target.closest("[data-mix-speed-plus]") ? 0.05 : 0;
        if (speedDelta) {
          const input = root.querySelector("[data-mix-speed]");
          input.value = Math.max(.8, Math.min(1.3, Number(input.value) + speedDelta)).toFixed(2);
          syncMixDuration();
          return;
        }
        const previewVoice = event.target.closest("[data-mix-voice-preview]");
        if (previewVoice) {
          const playing = previewVoice.classList.toggle("playing");
          previewVoice.querySelector("span").textContent = playing ? "■" : "▶";
          previewVoice.querySelector("strong").textContent = playing ? "正在试听…" : "试听当前配音";
          if (playing) setTimeout(() => {
            previewVoice.classList.remove("playing");
            previewVoice.querySelector("span").textContent = "▶";
            previewVoice.querySelector("strong").textContent = "试听当前配音";
          }, 2400);
          return;
        }
        const toggleRow = event.target.closest("[data-mix-toggle-row]");
        if (toggleRow) {
          const body = toggleRow.closest(".mix-script-card").querySelector(".mix-script-body");
          body.hidden = !body.hidden;
          toggleRow.textContent = body.hidden ? "展开" : "收起";
          return;
        }
        const previewRow = event.target.closest("[data-mix-preview-row]");
        if (previewRow) {
          const playing = previewRow.classList.toggle("active");
          previewRow.textContent = playing ? "■ 停止预览" : "▶ 预览本段";
          showToast(playing ? "正在预览当前口播与镜头拼接" : "已停止预览");
          return;
        }
        const replace = event.target.closest("[data-mix-replace-row]");
        if (replace) {
          const row = replace.closest("[data-mix-script-row]");
          const name = row.querySelector("[data-mix-material-name]");
          const current = Number(row.dataset.replaceIndex || 0);
          row.dataset.replaceIndex = String(current + 1);
          name.textContent = mixReplacementNames[current % mixReplacementNames.length];
          showToast("素材已替换，裁切区间和时长已自动校准");
          return;
        }
        const rematch = event.target.closest("[data-mix-rematch-row]");
        if (rematch) {
          const row = rematch.closest("[data-mix-script-row]");
          row.classList.add("is-rematching");
          rematch.textContent = "匹配中…";
          setTimeout(() => { row.classList.remove("is-rematching"); rematch.textContent = "重新匹配"; showToast("已按语义与时长重新匹配本段素材"); }, 700);
          return;
        }
        const lock = event.target.closest("[data-mix-lock-row]");
        if (lock) {
          const locked = lock.classList.toggle("active");
          lock.textContent = locked ? "✓ 已锁定" : "锁定";
          showToast(locked ? "本段已锁定，重新匹配时将保持不变" : "已解除本段锁定");
          return;
        }
        if (event.target.closest("[data-mix-rematch-all]")) {
          root.querySelectorAll("[data-mix-script-row]").forEach(row => row.classList.add("is-rematching"));
          setTimeout(() => { root.querySelectorAll("[data-mix-script-row]").forEach(row => row.classList.remove("is-rematching")); showToast("未锁定段落已重新匹配完成"); }, 800);
        }
      });
      root.addEventListener("input", event => {
        if (event.target.matches("[data-mix-copy], [data-mix-speed], [data-mix-target-duration]")) {
          if (event.target.matches("[data-mix-target-duration]")) {
            root.querySelectorAll("[data-mix-duration-preset]").forEach(button => button.classList.toggle("active", Number(button.dataset.mixDurationPreset) === Number(event.target.value)));
          }
          syncMixDuration();
        }
      });
      root.addEventListener("change", event => {
        if (event.target.matches("[data-mix-product]")) {
          const hasProduct = Boolean(event.target.value);
          root.querySelector("[data-mix-product-facts]").hidden = !hasProduct;
          syncMixProductMaterials(event.target.value);
        }
        if (event.target.matches("[data-mix-voice]")) syncMixDuration();
        if (event.target.matches("[data-mix-existing-copy], [data-mix-existing-script]")) updateMixSourceAsset(event.target);
        if (event.target.matches("[data-mix-content-structure]")) {
          const preview = root.querySelector("[data-mix-structure-preview]");
          const selected = mixStructureData[event.target.value] || mixStructureData.result;
          if (preview) preview.innerHTML = `<b>结构公式</b><span>${selected.formula}</span><em>${selected.meta}</em>`;
        }
      });
      renderMixPlanContext("ai");
      updateMixMaterialSummary();
      syncMixDuration();
    }

    function taskSteps() { return agentStepPlans[activeType] || ["基础信息", "创作设置", "确认生成"]; }

    function appendTaskGreeting() {
      if (chatOutput.querySelector(`[data-task-greeting="${activeType}"]`)) return;
      const greeting = document.createElement("div");
      greeting.className = "message assistant";
      greeting.dataset.taskGreeting = activeType;
      greeting.innerHTML = `<div class="message-head"><strong>✦ ${escapeHtml(activeAgent)}</strong></div><p class="assistant-summary">${escapeHtml(agentGreetings[activeType] || "请先完成左侧信息填写，我会据此完成创作。")}</p>`;
      chatOutput.append(greeting);
    }

    function renderTaskStepper() {
      const steps = taskSteps();
      taskStepper.innerHTML = steps.map((label, index) => {
        const number = index + 1;
        const done = taskCompleted ? number < steps.length : number < taskStep;
        return `<button class="task-step ${number === taskStep ? "active" : ""} ${done ? "done" : ""}" type="button" data-task-step="${number}"><b>${done ? "✓" : number}</b><span>${escapeHtml(label)}</span></button>`;
      }).join("");
    }

    function prepareTaskForm() {
      const steps = taskSteps();
      dynamicForm.querySelectorAll(".task-confirm-card").forEach(node => node.remove());
      if (isStructuredCopyFlow()) {
        dynamicForm.querySelectorAll("[data-original-step]").forEach(section => {
          section.dataset.taskStep = section.dataset.originalStep;
        });
        const modelHost = dynamicForm.querySelector("[data-original-model-host]");
        if (modelHost) modelHost.dataset.taskStep = "2";
        renderTaskModelStep();
        return;
      }
      // 智能脚本与智能混剪使用各自的定制流程，不追加通用模型与确认步骤。
      if (activeType === "script" || activeType === "mix") {
        dynamicForm.querySelectorAll(".task-model-card").forEach(node => node.remove());
        return;
      }
      dynamicForm.querySelectorAll(".task-model-card").forEach(node => node.remove());
      const sections = [...dynamicForm.querySelectorAll(":scope > .form-section")];
      sections.forEach((section, index) => { section.dataset.taskStep = String(Math.min(index + 1, steps.length - 2)); });
      const model = document.createElement("section");
      model.className = "task-model-card";
      model.dataset.taskStep = String(steps.length - 1);
      dynamicForm.append(model);
      renderTaskModelStep();
      const confirm = document.createElement("section");
      confirm.className = "task-confirm-card";
      confirm.dataset.taskStep = String(steps.length);
      confirm.innerHTML = `<strong>信息已就绪</strong><span>确认后将基于当前填写信息生成结果。生成完成后，你可以在右侧继续用自然语言修改。</span>`;
      dynamicForm.append(confirm);
    }

    function renderTaskModelStep() {
      const host = isStructuredCopyFlow()
        ? dynamicForm.querySelector("[data-original-model-host]")
        : dynamicForm.querySelector(".task-model-card");
      if (!host) return;
      const mode = getModelMode(activeType);
      const options = [...modelSelect.options];
      if (isStructuredCopyFlow()) {
        let currentModel = copywritingModelCatalog.find(model => model.value === modelSelect.value);
        if (!currentModel) {
          currentModel = fixedCopywritingModel;
          modelSelect.value = currentModel.value;
          renderModelPickerOptions();
        }
        const groups = ["推荐模型", "国外模型", "国内模型"];
        host.innerHTML = `
          <div class="single-model-picker" data-single-model-picker>
            <button class="single-model-trigger" type="button" data-single-model-trigger><span><b>${escapeHtml(currentModel.label)}${currentModel.recommended ? "（推荐）" : ""}</b></span><i>⌃</i></button>
            <div class="single-model-menu">${groups.map(group => `
              <div class="single-model-group">${group}</div>
              ${copywritingModelCatalog.filter(model => model.group === group).map(model => `
                <button class="single-model-option${model.value === currentModel.value ? " selected" : ""}" type="button" data-single-model-option="${escapeHtml(model.value)}">
                  <span><b>${escapeHtml(model.label)}${model.recommended ? "（推荐）" : ""}</b></span><strong>${model.value === currentModel.value ? "✓" : ""}</strong>
                </button>`).join("")}
            `).join("")}</div>
          </div>`;
        return;
      }
      host.innerHTML = `
        <strong>选择生成模型</strong>
        <span>${escapeHtml(modelModeLabels[mode] || "生成模型")}会影响本次结果，默认推荐已适配当前 Agent。</span>
        <div class="task-model-list">${options.map(option => {
          const selected = option.value === modelSelect.value;
          const recommended = option.value === "auto" || option.value === "mix-v16" || option.value === "seedance-2";
          return `<button class="task-model-option${selected ? " selected" : ""}" type="button" data-task-model="${escapeHtml(option.value)}"><b>${option.value === "auto" ? "智" : option.value === "mix-v16" ? "剪" : "✦"}</b><span><strong>${escapeHtml(option.text)}</strong><small>${escapeHtml(modelDescriptions[option.value] || "适用于当前创作任务")}</small></span>${recommended ? "<em>推荐</em>" : ""}</button>`;
        }).join("")}</div>
      `;
    }

    function renderTaskActions() {
      const steps = taskSteps();
      taskActionButtons.innerHTML = "";
      if (taskStep > 1) {
        const back = document.createElement("button");
        back.className = "ghost-btn task-back-button";
        back.type = "button";
        back.textContent = "上一步";
        back.addEventListener("click", () => setTaskStep(taskStep - 1));
        taskActionButtons.append(back);
      }
      if (isStructuredCopyFlow() && taskStep === 1) {
        const advanced = document.createElement("button");
        advanced.className = "ghost-btn footer-advanced-toggle";
        advanced.type = "button";
        advanced.dataset.footerAdvancedToggle = "";
        advanced.addEventListener("click", () => {
          const willOpen = !dynamicForm.querySelector(".advanced-field:not([hidden])");
          setOriginalAdvanced(willOpen);
          if (willOpen) requestAnimationFrame(() => dynamicForm.querySelector(".advanced-field")?.scrollIntoView({ behavior:"smooth", block:"center" }));
        });
        taskActionButtons.append(advanced);
      }
      if (!isStructuredCopyFlow() && !contextStatus.hidden) taskActionButtons.append(contextStatus);
      const next = document.createElement("button");
      next.className = "primary-btn";
      next.type = "button";
      // 智能脚本与智能混剪使用定制按钮文案和校验。
      if (activeType === "script") {
        next.textContent = taskStep === 2 ? "生成脚本" : "下一步";
      } else if (activeType === "mix") {
        next.textContent = ["确认方案", "确认文案与配音", "确认脚本", taskCompleted ? "重新生成视频" : "生成视频"][taskStep - 1];
      } else if (isStructuredCopyFlow()) {
        next.textContent = taskStep === 1 ? "下一步" : "生成文案";
      } else {
        next.textContent = taskStep === steps.length
          ? (taskEditing ? "以新任务继续创作" : "生成结果")
          : "下一步";
      }
      next.addEventListener("click", () => {
        if (activeType === "mix") {
          if (taskStep < 4) {
            if (!validateMixStep(taskStep)) return;
            return setTaskStep(taskStep + 1);
          }
          if (!validateMixStep(2)) return;
          return submitMixGeneration();
        }
        if (activeType === "script") {
          if (taskStep === 1) {
            if (!validateScriptStep(1)) return;
            return setTaskStep(2);
          }
          if (taskStep === 2) {
            if (!validateScriptStep(2)) return;
            return submitScriptGeneration();
          }
          return;
        }
        if (isStructuredCopyFlow()) {
          if (taskStep === 1) {
            if (!validateOriginalStep(1)) return;
            return setTaskStep(2);
          }
          if (!validateAgentForm()) return;
          if (taskEditing) {
            taskRestartModal.classList.add("show");
            return;
          }
          showGeneratedResult(true);
          return;
        }
        if (taskStep < steps.length) {
          return setTaskStep(taskStep + 1);
        }
        if (!validateAgentForm()) return;
        if (taskEditing) {
          taskRestartModal.classList.add("show");
          return;
        }
        showGeneratedResult(true);
      });
      taskActionButtons.append(next);
      updateAdvancedFooterToggle();
      taskActionNote.textContent = activeType === "mix"
        ? taskStep === 4 ? "仅使用已确认素材，生成后可局部重剪" : ""
        : activeType === "script"
        ? ""
        : isStructuredCopyFlow() ? "" : taskStep === steps.length
          ? "生成后可在右侧继续对话修改"
          : `完成"${steps[taskStep - 1]}"后继续`;
    }

    function setTaskStep(nextStep) {
      const steps = taskSteps();
      taskStep = Math.max(1, Math.min(nextStep, steps.length));
      if (taskCompleted && taskStep < steps.length) taskEditing = true;
      dynamicForm.querySelectorAll("[data-task-step]").forEach(section => { section.hidden = Number(section.dataset.taskStep) !== taskStep; });
      taskFormScroll.hidden = false;
      taskResultHost.hidden = true;
      taskFormActions.hidden = false;
      renderTaskStepper();
      renderTaskActions();
      taskFormScroll.scrollTo({ top: 0, behavior: "smooth" });
      // 智能脚本 Agent 步骤 3 = 结果页(由 renderScriptTaskResult 接管)
      if (activeType === "script" && taskStep === 3) {
        captureScriptContext();
      }
    }

    // 智能脚本 Agent:提交生成,先切到步骤 3 显示 spinner,2 秒后调 showTaskResult
    function submitScriptGeneration() {
      captureScriptContext();
      setTaskStep(3);
      // 在结果容器里显示生成中
      const resultCard = dynamicForm.querySelector("[data-script-result-card]");
      if (resultCard) {
        resultCard.innerHTML = `
          <div class="script-result-loading">
            <span class="spinner"></span>
            <strong>正在生成分镜脚本……</strong>
            <small>系统将根据本次配置匹配素材、生成口播与画面</small>
          </div>
        `;
      }
      setTimeout(() => {
        const response = { summary: "本次分镜脚本已生成，可在右侧继续对话修改" };
        const assets = generateScriptAssets();
        sessionAssets.push(...assets);
        renderSessionAssets();
        appendScriptGenerationTurn(response.summary, assets);
        showTaskResult(response, assets);
      }, 1600);
    }

    function appendScriptGenerationTurn(summary, assets) {
      const turnNumber = conversationTurnCount + 1;
      const request = `生成 ${assets.length} 个${creationContext.script?.duration || 60}s 分镜脚本`;
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = request;
      const assistantTurn = document.createElement("div");
      assistantTurn.className = "message assistant";
      assistantTurn.id = `assistant-turn-${turnNumber}`;
      assistantTurn.dataset.agentType = "script";
      assistantTurn.dataset.assetIds = assets.map(asset => asset.id).join(",");
      assistantTurn.innerHTML = `<div class="message-head"><strong>✦ 智能脚本</strong></div><p class="assistant-summary">${escapeHtml(summary)}</p>`;
      chatOutput.append(userTurn, assistantTurn);
      chatOutput.classList.add("show");
      conversationTurnCount += 1;
      agentTurnCounts.script = (agentTurnCounts.script || 0) + 1;
      requestAnimationFrame(() => chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" }));
    }

    // 模拟生成多版本脚本(命名规范:产品名_脚本_yyyyMMddHHmmss_N)
    function generateScriptAssets() {
      const ctx = creationContext.script || {};
      const product = productCatalog[ctx.product] || { ...currentProduct(), name: ctx.productName || currentProduct().name };
      const versionCount = ctx.version || 1;
      const ts = formatScriptTimestamp();
      const anglePool = ["钩子强化+结果直给", "痛点加深+场景前置", "对比放大+卖点集中", "实测演示+信任背书", "悬念揭秘+情绪升级"];
      const rhythmPool = ["紧凑冲击", "舒缓代入", "对比反转", "渐进揭秘"];
      const sourceSentences = String(ctx.sourceText || "").split(/[。！？!?]/).map(item => item.trim()).filter(Boolean);
      const baseRows = completeScriptRows.map((row, index) => ({ ...row, voice: sourceSentences[index] || row.voice }));
      return Array.from({ length: versionCount }, (_, idx) => {
        const id = `${product.name}_脚本_${ts}_${idx + 1}`;
        return {
          id,
          title: id,
          versionLabel: `V${idx + 1}`,
          versionAngle: anglePool[idx % anglePool.length],
          versionRhythm: rhythmPool[idx % rhythmPool.length],
          meta: `${ctx.duration || 30}s · ${ctx.voice || "未选择配音"} · ${(ctx.materialGroups || []).length} 个素材分组`,
          materialMode: ctx.materialMode,
          materialIds: ctx.materialIds || [],
          materialGroups: ctx.materialGroups || [],
          scriptRows: baseRows.map((row, rIdx) => ({
            ...row,
            rowId: `${id}-r${rIdx + 1}`
          })),
          saved: false
        };
      });
    }

    function formatScriptTimestamp() {
      const d = new Date();
      const pad = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    function activeCreationSessionTitle() {
      return document.querySelector("#page-creation .chat-row.active strong")?.textContent.trim() || "未命名创作";
    }

    function syncTaskChatTitle() {
      const title = document.getElementById("taskChatTitle");
      if (title) title.textContent = activeCreationSessionTitle();
    }

    function syncTaskChatTarget() {
      const host = document.getElementById("taskChatTarget");
      const label = document.getElementById("taskChatTargetLabel");
      const clear = document.getElementById("taskChatTargetClear");
      if (!host || !label || !clear) return;
      const visible = taskShell?.classList.contains("show") && taskCompleted && isStructuredCopyFlow() && originalTaskAssetIds.length > 0;
      host.hidden = !visible;
      if (!visible) return;
      const selected = originalCopyTargetId ? getSessionAsset(originalCopyTargetId) : null;
      label.textContent = selected?.title || `全部${originalTaskAssetIds.length}个文案`;
      clear.hidden = !selected;
    }

    function exitAgentTask() {
      if (!taskShell?.classList.contains("show")) return;
      const stage = document.querySelector("#page-creation .creation-stage");
      taskShell.classList.remove("show", "is-complete");
      taskShell.classList.remove("chat-collapsed");
      stage.insertBefore(conversationLocator, taskShell);
      stage.insertBefore(chatOutput, taskShell);
      stage.insertBefore(composerWrap, taskShell);
      stage.insertBefore(document.getElementById("assetToggle"), conversationLocator);
      stage.classList.add("home-mode");
      taskFormScroll.hidden = false;
      taskResultHost.hidden = true;
      taskFormActions.hidden = false;
      agentPillButton.disabled = false;
      modelTrigger.disabled = false;
      modelTrigger.hidden = false;
      syncTaskChatTarget();
    }

    function openAgentTask() {
      if (!agentConfigs[activeType]) return;
      taskCompleted = false;
      taskEditing = false;
      taskStep = 1;
      originalTaskAssetIds = [];
      scriptTaskAssetIds = [];
      originalCopySequence = 0;
      originalCopyTargetId = "";
      syncTaskChatTarget();
      if (activeType === "script") window.__scriptMaterialSelected = [];
      taskShell.dataset.agentType = isStructuredCopyFlow() ? "original" : activeType;
      document.getElementById("taskAgentTitle").textContent = activeAgent;
      document.getElementById("taskAgentIntro").textContent = agentConfigs[activeType].intro;
      syncTaskChatTitle();
      document.getElementById("taskChatSubtitle").textContent = "完成左侧步骤后开启自然语言修改";
      document.getElementById("taskChatHead").append(document.getElementById("assetToggle"));
      taskFormHost.append(dynamicForm, formFeedback);
      taskChatLog.append(chatOutput, conversationLocator);
      taskComposerHost.append(composerWrap);
      appendTaskGreeting();
      prepareTaskForm();
      if (activeType === "script") bindScriptAgentEvents();
      if (activeType === "mix") bindMixAgentEvents();
      taskShell.classList.add("show");
      taskShell.classList.remove("is-complete");
      setTaskChatCollapsed(true);
      document.querySelector("#page-creation .creation-stage").classList.remove("home-mode");
      agentBrowser.style.display = "none";
      emptyHero.style.display = "none";
      chatOutput.classList.add("show");
      promptInput.disabled = true;
      promptInput.placeholder = "请先完成左侧步骤并生成结果，生成后可在这里继续修改";
      sendPromptButton.disabled = true;
      agentPillButton.disabled = true;
      modelTrigger.disabled = true;
      modelTrigger.hidden = true;
      setTaskStep(1);
      requestAnimationFrame(renderConversationLocator);
    }

    function originalCopyCardHtml(asset, index) {
      const wordCount = String(asset.preview || "").replace(/\s/g, "").length;
      const duration = Math.max(1, Math.round(wordCount / 4));
      const tags = asset.structureTags?.length ? asset.structureTags : copyStructureTags(asset.title);
      const savedText = asset.saved ? "✓ 已保存" : "保存至文案库";
      return `
        <article class="original-copy-card${originalCopyTargetId === asset.id ? " is-chat-target" : ""}" data-asset-id="${asset.id}">
          <div class="original-copy-head">
            <div class="original-copy-heading"><span class="original-copy-index">No.${index + 1}</span><strong class="original-copy-title">${escapeHtml(asset.title)}</strong><button class="original-title-edit" type="button" data-asset-action="rename-copy" title="重命名">✎</button></div>
            ${originalCopyTargetId === asset.id ? '<span class="badge">当前修改对象</span>' : ""}
          </div>
          <div class="original-copy-structure">${tags.map((tag, tagIndex) => `${tagIndex ? '<span class="copy-structure-arrow">→</span>' : ""}<span class="copy-structure-tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="original-copy-content">${escapeHtml(asset.preview)}</div>
          <div class="original-copy-editor"><textarea>${escapeHtml(asset.preview)}</textarea><div class="original-edit-actions"><button class="ghost-btn" type="button" data-asset-action="cancel-copy-edit">取消</button><button class="primary-btn" type="button" data-asset-action="save-copy-edit">保存修改</button></div></div>
          <div class="original-copy-meta"><span>${wordCount} 字 · 预计口播约 ${duration} 秒</span></div>
          <div class="original-copy-actions">
            <div class="original-copy-actions-left">
              <button class="copy-result-action action-library${asset.saved ? " saved" : ""}" type="button" data-asset-action="library">${savedText}</button>
              <button class="copy-result-action" type="button" data-asset-action="edit-copy">编辑</button>
              <button class="copy-result-action" type="button" data-asset-action="copy">复制</button>
              <button class="copy-result-action" type="button" data-asset-action="chat-edit">用对话修改</button>
            </div>
            <div class="original-create-menu"><button class="original-create-trigger" type="button" data-original-create-trigger>继续创作⌄</button><div class="original-create-popover"><button type="button" data-asset-action="to-script">智能脚本</button><button type="button" data-asset-action="to-mix">智能混剪</button></div></div>
          </div>
        </article>`;
    }

    function renderOriginalTaskResult() {
      const assets = originalTaskAssetIds.map(getSessionAsset).filter(Boolean);
      const isCopy = activeType === "copy";
      const isRewrite = activeType === "rewrite";
      taskResultHost.innerHTML = `
        <div class="task-result-top"><div><strong>${isCopy ? "AI生成原创仿写文案" : isRewrite ? "AI生成改写文案" : "AI生成文案"}</strong><small>已生成 ${assets.length} 条 · ${escapeHtml(currentProduct().name)} · ${escapeHtml(selectedModelLabel())}</small></div></div>
        <div class="original-result-list">${assets.map(originalCopyCardHtml).join("")}</div>
        <div class="original-continue-box"><span>需要更多方向？继续生成会在下方追加3条，已有结果不会被覆盖。</span><button type="button" data-original-continue>继续生成3条</button></div>`;
      syncTaskChatTarget();
    }

    function showTaskResult(response, generatedAssets) {
      taskCompleted = true;
      taskEditing = false;
      taskStep = taskSteps().length;
      taskFormScroll.hidden = true;
      taskFormActions.hidden = true;
      taskResultHost.hidden = false;
      if (isStructuredCopyFlow()) {
        originalTaskAssetIds = generatedAssets.map(asset => asset.id);
        originalCopyTargetId = "";
        renderOriginalTaskResult();
      } else if (activeType === "script" && generatedAssets.length > 0) {
        generatedAssets.forEach(asset => {
          if (!scriptTaskAssetIds.includes(asset.id)) scriptTaskAssetIds.push(asset.id);
        });
        renderScriptTaskResult(response, scriptTaskAssetIds.map(id => sessionAssets.find(asset => asset.id === id)).filter(Boolean));
        requestAnimationFrame(() => {
          const latestTab = taskResultHost.querySelector("[data-script-result-tab]:last-child");
          latestTab?.click();
          latestTab?.scrollIntoView({ block:"nearest", inline:"nearest" });
        });
      } else {
        taskResultHost.innerHTML = `
          <div class="task-result-top"><div><strong>本次生成结果</strong><small>${escapeHtml(response.summary)}</small></div></div>
          <div class="generated-assets">${generatedAssets.map(generatedAssetHtml).join("")}</div>`;
      }
      taskShell.classList.add("is-complete");
      setTaskChatCollapsed(false);
      document.getElementById("taskChatSubtitle").textContent = "可继续用自然语言修改本次结果";
      promptInput.disabled = false;
      promptInput.placeholder = isStructuredCopyFlow()
        ? "告诉我你想怎么调整全部文案"
        : activeType === "script"
        ? "继续修改本次分镜，例如:把第 2 个镜头改成全景,时长调整为 4s"
        : "继续修改本次结果,例如:把首 3 秒钩子更直接一些";
      sendPromptButton.disabled = false;
      agentPillButton.disabled = false;
      modelTrigger.disabled = false;
      renderTaskStepper();
      requestAnimationFrame(renderConversationLocator);
    }

    function showMixTaskResult() {
      taskCompleted = true;
      taskEditing = false;
      taskStep = 4;
      taskFormScroll.hidden = true;
      taskFormActions.hidden = true;
      taskResultHost.hidden = false;
      const targetDuration = Number(dynamicForm.querySelector("[data-mix-target-duration]")?.value || 60);
      const duration = `${targetDuration.toFixed(1)} 秒`;
      const voice = dynamicForm.querySelector("[data-mix-final-voice]")?.textContent || "许念 · 1.00×";
      const materialCount = mixSelectedMaterialIds().length || 6;
      const timelineNames = ["结果钩子", "痛点解释", "产品演示", "多场景证明", "行动引导"];
      const timelineWeights = [5, 10, 19, 18, 8];
      let timelineStart = 0;
      const timelineHtml = timelineWeights.map((weight, index) => {
        const segmentDuration = index === timelineWeights.length - 1 ? targetDuration - timelineStart : targetDuration * weight / 60;
        const start = timelineStart;
        timelineStart += segmentDuration;
        return `<button style="flex:${weight}" data-mix-seek="${mixTimeLabel(start)}">${timelineNames[index]}<small>${segmentDuration.toFixed(1)}s</small></button>`;
      }).join("");
      taskResultHost.innerHTML = `
        <div class="mix-result-page">
          <div class="task-result-top"><div><strong>混剪视频已生成</strong><small>全部画面来自已确认的创作素材，可继续检查或局部重剪。</small></div><span class="mix-result-status">✓ 自动质检通过</span></div>
          <div class="mix-result-hero">
            <div class="mix-video-player" data-mix-video-player><div class="mix-video-stage"><span class="mix-video-product">轻净 Pro</span><button type="button" data-mix-result-play>▶</button><div><strong>床垫深层清洁实测</strong><small>9:16 · ${escapeHtml(duration)}</small></div></div><div class="mix-player-bar"><span data-mix-player-time>00:00</span><div><i></i></div><span>${escapeHtml(duration.replace(" 秒", ""))}</span></div></div>
            <div class="mix-result-insight"><div class="mix-result-metrics"><div><span>实际时长</span><b>${escapeHtml(duration)}</b></div><div><span>配音</span><b>${escapeHtml(voice)}</b></div><div><span>素材使用</span><b>${materialCount} 个</b></div><div><span>阻断问题</span><b class="success">0 项</b></div></div><div class="mix-result-quality"><strong>自动质检</strong><p><span>✓</span> 画面已覆盖全部配音时间段</p><p><span>✓</span> 无黑帧、静音或异常变速</p><p><span>✓</span> 产品事实与禁用话术校验通过</p></div></div>
          </div>
          <article class="mix-result-timeline"><header><strong>成片时间轴</strong><small>点击任一段定位预览</small></header><div class="mix-timeline-track">${timelineHtml}</div><div class="mix-result-operations"><span>裁切 8 处</span><span>硬切 7 处</span><span>轻微变速 2 处</span><span>短定帧 2 处</span><span>无转场 / 字幕 / 特效</span></div></article>
          <div class="mix-result-actions"><button class="ghost-btn" type="button" data-mix-result-action="back-script">返回修改脚本</button><button class="ghost-btn" type="button" data-mix-result-action="remix">局部重新混剪</button><button class="soft-btn" type="button" data-mix-result-action="save">保存到成片视频库</button><button class="primary-btn" type="button" data-mix-result-action="download">下载视频</button></div>
        </div>`;
      taskShell.classList.add("is-complete");
      setTaskChatCollapsed(false);
      document.getElementById("taskChatSubtitle").textContent = "可继续用自然语言修改本次成片";
      promptInput.disabled = false;
      promptInput.placeholder = "例如：把第 3 段换成沙发清洁素材，结尾定帧延长 0.5 秒";
      sendPromptButton.disabled = false;
      agentPillButton.disabled = false;
      renderTaskStepper();
      showToast("智能混剪已完成，可播放预览或局部调整");
    }

    function submitMixGeneration() {
      const host = dynamicForm.querySelector("[data-mix-generation-host]");
      if (host) host.innerHTML = `<div class="mix-generating"><span class="spinner"></span><strong>正在生成混剪视频…</strong><small>正在裁切素材、校准配音时间轴并完成质量检查</small><div><i></i></div></div>`;
      taskActionButtons.querySelector(".primary-btn")?.setAttribute("disabled", "disabled");
      setTimeout(showMixTaskResult, 1200);
    }

    // 智能脚本 Agent 多版本 Tab 渲染
    // 智能脚本 Agent 多版本结果页:纵向卡片栈(每个脚本独立卡片,清晰分割)
    function renderScriptTaskResult(response, generatedAssets) {
      const scriptCtx = creationContext.script || {};
      const product = productCatalog[scriptCtx.product] || { ...currentProduct(), name: scriptCtx.productName || currentProduct().name };
      const versionCount = generatedAssets.length;
      const modelLabels = { "gpt-5-6-terra":"GPT-5.6 Terra", "claude-sonnet-5":"Claude Sonnet 5", "gemini-3-6-flash":"Gemini 3.6 Flash", "doubao-seed-2-pro":"豆包 Seed 2.0 Pro", "deepseek-v4-pro":"DeepSeek V4 Pro", "qwen-3-7-max":"通义千问 Qwen3.7-Max" };
      const modelLabel = modelLabels[scriptCtx.model] || scriptCtx.model || "—";

      // 计算每个脚本的状态
      const cards = generatedAssets.map((asset, idx) => {
        const rows = asset.scriptRows || completeScriptRows;
        const showMaterial = (asset.materialMode || "depend") === "depend";
        const statusBadge = "";
        const saved = sessionAssets.find(a => a.id === asset.id)?.saved;
        const versionNo = `V${idx + 1}`;
        const isTarget = scriptTargetId === asset.id;
        return `
        <article class="script-result-card${isTarget ? " is-chat-target" : ""}" data-asset-id="${escapeHtml(asset.id)}" data-script-version-panel="${idx}" ${idx ? "hidden" : ""}>
          <header class="script-result-head">
            <div class="script-result-title">
              <span class="script-result-version">${versionNo}</span>
              <strong>${escapeHtml(asset.title || `${product.name}_脚本_${idx + 1}`)}</strong>
              ${statusBadge}
              ${isTarget ? '<span class="script-target-badge">当前修改对象</span>' : ''}
            </div>
          </header>
          <div class="script-result-table">
            ${scriptTableHtml(rows, asset.materialMode || "depend", asset.materialIds?.length ? asset.materialIds : (asset.materialGroups || []).map(g => g.id || g.name), asset.id)}
          </div>
          <footer class="script-result-actions">
            <button class="asset-action" type="button" data-action="save-script-to-library" data-asset-id="${escapeHtml(asset.id)}">${saved ? "✓ 已保存" : "保存至脚本库"}</button>
            <button class="asset-action" type="button" data-action="download-script" data-asset-id="${escapeHtml(asset.id)}">下载脚本</button>
            <button class="asset-action primary" type="button" data-action="chat-edit-script" data-asset-id="${escapeHtml(asset.id)}">用对话修改</button>
          </footer>
        </article>
      `}).join("");

      taskResultHost.innerHTML = `
        <div class="task-result-top">
          <div>
            <strong>${escapeHtml(product.name)}｜分镜脚本 ${versionCount > 1 ? "· " + versionCount + " 个脚本" : ""}</strong>
            <small>${escapeHtml(response.summary)}</small>
          </div>
        </div>
        ${versionCount > 1 ? `<div class="script-version-tabs" role="tablist">${generatedAssets.map((asset, idx) => `<button type="button" role="tab" aria-selected="${idx === 0}" class="${idx === 0 ? "active" : ""}" data-script-result-tab="${idx}">版本 ${idx + 1}</button>`).join("")}</div>` : ""}
        <div class="script-result-stack">${cards}</div>
      `;

      taskResultHost.querySelectorAll("[data-script-result-tab]").forEach(tab => {
        tab.addEventListener("click", () => {
          const target = tab.dataset.scriptResultTab;
          taskResultHost.querySelectorAll("[data-script-result-tab]").forEach(item => {
            const active = item === tab;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
          });
          taskResultHost.querySelectorAll("[data-script-version-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptVersionPanel !== target;
          });
        });
      });

      taskResultHost.querySelectorAll("[data-edit-script-row]").forEach(cell => {
        cell.addEventListener("click", event => {
          if (event.target.closest("button, textarea")) return;
          const tr = cell.closest("tr");
          const asset = tr && sessionAssets.find(item => item.id === tr.dataset.assetId);
          if (tr && asset?.materialMode === "free") openScriptRowEditor(tr);
        });
      });
      taskResultHost.querySelectorAll("[data-action='switch-script-shot']").forEach(button => button.addEventListener("click", () => switchScriptShotGroup(button.dataset.assetId, Number(button.dataset.rowIdx))));
      taskResultHost.querySelectorAll("[data-action='replace-script-material']").forEach(button => {
        button.addEventListener("click", () => openScriptMaterialReplacement(button.dataset.assetId, Number(button.dataset.rowIdx)));
      });
      // 复制视频提示词
      taskResultHost.querySelectorAll("[data-action='copy-video-prompt']").forEach(btn => {
        btn.addEventListener("click", () => {
          const prompt = btn.dataset.prompt || "";
          navigator.clipboard?.writeText(prompt).then(
            () => showToast("提示词已复制到剪贴板"),
            () => showToast("复制失败,请手动选择文本复制")
          );
        });
      });
      // 下载(原导出 JSON)
      taskResultHost.querySelectorAll("[data-action='download-script']").forEach(btn => {
        btn.addEventListener("click", () => downloadScript(btn.dataset.assetId));
      });
      // 保存至脚本库
      taskResultHost.querySelectorAll("[data-action='save-script-to-library']").forEach(btn => {
        btn.addEventListener("click", () => toggleScriptSaved(btn.dataset.assetId, btn));
      });
      // 用对话修改
      taskResultHost.querySelectorAll("[data-action='chat-edit-script']").forEach(btn => {
        btn.addEventListener("click", () => setScriptChatTarget(btn.dataset.assetId));
      });
    }

    function downloadScript(assetId) {
      const asset = sessionAssets.find(a => a.id === assetId);
      if (!asset) return;
      const blob = new Blob([JSON.stringify(asset, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${asset.title || "脚本"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("脚本 JSON 已下载");
    }

    function exportScriptAsJson(assetId) {
      // 兼容旧调用
      downloadScript(assetId);
    }

    function copyScriptAsText(assetId) {
      const asset = sessionAssets.find(a => a.id === assetId) || originalTaskAssetIds.map(getSessionAsset).find(Boolean);
      if (!asset?.scriptRows) return showToast("未找到可复制的脚本");
      const lines = (asset.scriptRows || []).map(row => `[${row.time}] ${row.shotType || ""}·${row.cameraMove || ""}\n口播:${row.voice}\n画面:${row.visual}\n字幕:${row.subtitle || ""}`).join("\n\n");
      const text = `${asset.title}\n\n${lines}`;
      navigator.clipboard?.writeText(text).then(
        () => showToast("整套脚本已复制"),
        () => showToast("复制失败")
      );
    }

    function toggleScriptSaved(assetId, btn) {
      const asset = sessionAssets.find(a => a.id === assetId);
      if (!asset) return;
      asset.saved = !asset.saved;
      btn.textContent = asset.saved ? "✓ 已保存至脚本库" : "保存至脚本库";
      window.dispatchEvent(new CustomEvent("script-library:sync", { detail:{ action:asset.saved ? "upsert" : "remove", asset } }));
      showToast(asset.saved ? "已存入脚本库" : "已从脚本库移除");
    }

    // 设置当前对话修改的脚本对象(类似 originalCopyTargetId 的模式)
    function setScriptChatTarget(assetId) {
      scriptTargetId = assetId || "";
      // 刷新高亮
      taskResultHost.querySelectorAll(".script-result-card").forEach(card => {
        const isTarget = card.dataset.assetId === assetId;
        card.classList.toggle("is-chat-target", isTarget);
        const head = card.querySelector(".script-result-title");
        let badge = card.querySelector(".script-target-badge");
        if (isTarget && !badge) {
          badge = document.createElement("span");
          badge.className = "script-target-badge";
          badge.textContent = "当前修改对象";
          head.appendChild(badge);
        } else if (!isTarget && badge) {
          badge.remove();
        }
      });
      const asset = sessionAssets.find(a => a.id === assetId);
      if (asset) {
        const subtitle = document.getElementById("taskChatSubtitle");
        if (subtitle) subtitle.textContent = `正在修改:${asset.title}`;
        promptInput.value = "";
        promptInput.placeholder = `描述对"${asset.title}"的修改要求,例如:把第 2 个镜头改成全景,时长调整为 4s`;
        promptInput.focus();
        showToast("已将该脚本设为当前对话修改对象");
      } else {
        const subtitle = document.getElementById("taskChatSubtitle");
        if (subtitle) subtitle.textContent = "可继续用自然语言修改本次结果";
        promptInput.placeholder = "继续修改本次分镜,例如:把第 2 个镜头改成全景,时长调整为 4s";
      }
    }

    function refreshScriptResult(summary, focusAssetId, editLast = false) {
      const assets = scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean);
      renderScriptTaskResult({ summary }, assets);
      const index = scriptTaskAssetIds.indexOf(focusAssetId);
      if (index > 0) taskResultHost.querySelector(`[data-script-result-tab="${index}"]`)?.click();
      if (editLast) requestAnimationFrame(() => {
        const panel = taskResultHost.querySelector(`[data-asset-id="${focusAssetId}"]`);
        const lastRow = panel?.querySelector("tbody tr:last-child");
        if (lastRow) openScriptRowEditor(lastRow, { isNew:true });
      });
    }

    function appendScriptRow(assetId) {
      const asset = sessionAssets.find(item => item.id === assetId);
      if (!asset?.scriptRows) return;
      asset.scriptRows.push({ id:asset.scriptRows.length + 1, time:"", shotType:"中景", cameraMove:"固定", voice:"", visual:"", materialIds:[], videoPrompt:"" });
      refreshScriptResult("已在当前版本末尾新增分镜。", assetId, true);
    }

    function reorderScriptRows(sourceRow, targetRow) {
      if (sourceRow.dataset.assetId !== targetRow.dataset.assetId) return;
      const asset = sessionAssets.find(item => item.id === sourceRow.dataset.assetId);
      if (!asset?.scriptRows) return;
      const from = Number(sourceRow.dataset.rowIdx), to = Number(targetRow.dataset.rowIdx);
      const [moved] = asset.scriptRows.splice(from, 1);
      asset.scriptRows.splice(to, 0, moved);
      asset.scriptRows.forEach((item, index) => { item.id = index + 1; });
      refreshScriptResult("已调整镜头顺序。", asset.id);
    }

    function openScriptRowEditor(row, options = {}) {
      const cells = row.cells;
      if (cells.length < 6) return;
      const time = cells[1].textContent.trim();
      const voice = cells[2].textContent.trim();
      const shotType = cells[3].textContent.trim();
      const cameraMove = cells[4].textContent.trim();
      const visual = cells[5].textContent.trim();
      const modal = document.getElementById("scriptRowEditModal");
      if (!modal) return;
      if (modal.parentElement !== document.body) document.body.appendChild(modal);
      const asset = sessionAssets.find(item => item.id === row.dataset.assetId);
      const rowIndex = Number(row.dataset.rowIdx);
      const dependsOnMaterials = (asset?.materialMode || "depend") === "depend";
      const rowData = asset?.scriptRows?.[rowIndex] || {};
      let materialIds = [...(asset?.scriptRows?.[rowIndex]?.materialIds || (asset?.scriptRows?.[rowIndex]?.materialOverride ? [asset.scriptRows[rowIndex].materialOverride] : []))];
      const renderMaterials = () => {
        const host = modal.querySelector("[data-row-material-summary]");
        host.innerHTML = materialIds.length ? materialIds.map(id => {
          const item = findScriptMaterial(id);
          return item ? `<div class="script-row-material"><span>${escapeHtml(item.id)}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · 9:16 · ${item.duration}s</small></div><button type="button" data-remove-row-material="${escapeHtml(item.id)}">×</button></div>` : "";
        }).join("") : `<span class="script-row-material-empty">暂未指定素材，将使用本次已选素材自动匹配。</span>`;
      };
      modal.querySelector("[data-row-time]").value = time;
      modal.querySelector("[data-row-shot-type]").value = shotType;
      modal.querySelector("[data-row-camera-move]").value = cameraMove;
      modal.querySelector("[data-row-voice]").value = voice;
      modal.querySelector("[data-row-visual]").value = visual;
      modal.querySelector("[data-row-video-prompt]").value = rowData.videoPrompt || "";
      modal.querySelector("#scriptRowEditTitle").textContent = options.isNew ? "新增分镜" : "编辑分镜";
      modal.querySelector("[data-row-material-field]").hidden = !dependsOnMaterials;
      modal.querySelector("[data-row-video-prompt-field]").hidden = dependsOnMaterials;
      ["[data-row-time]", "[data-row-voice]"].forEach(selector => {
        const input = modal.querySelector(selector);
        if (input) input.disabled = true;
        input?.closest(".cl-edit-field")?.classList.add("is-locked-field");
      });
      modal.querySelector("[data-delete-script-row]").hidden = true;
      modal.dataset.rowIndex = row.rowIndex;
      modal.dataset.assetId = row.dataset.assetId || "";
      modal.classList.add("show");
      renderMaterials();
      modal.querySelector("[data-row-material-summary]").onclick = event => {
        const remove = event.target.closest("[data-remove-row-material]");
        if (!remove) return;
        materialIds = materialIds.filter(id => id !== remove.dataset.removeRowMaterial);
        renderMaterials();
      };
      modal.querySelector("[data-row-select-material]").onclick = () => openScriptMaterialPicker({
        title:"选择分镜素材", selectedIds:materialIds, onConfirm:ids => { materialIds = ids; renderMaterials(); }
      });

      // 关闭按钮(重复绑定安全:先移除旧 handler 标记)
      modal.querySelectorAll("[data-close-script-row]").forEach(btn => {
        btn.onclick = () => modal.classList.remove("show");
      });
      // 背景点击关闭
      modal.onclick = (e) => { if (e.target === modal || e.target.classList.contains("modal-backdrop")) modal.classList.remove("show"); };
      // 保存
      const saveBtn = modal.querySelector("#scriptRowEditSave");
      if (saveBtn) {
        saveBtn.onclick = () => {
          const newTime = time;
          const newShotType = modal.querySelector("[data-row-shot-type]").value;
          const newCameraMove = modal.querySelector("[data-row-camera-move]").value;
          const newVoice = voice;
          const newVisual = modal.querySelector("[data-row-visual]").value;
          const newVideoPrompt = modal.querySelector("[data-row-video-prompt]").value.trim();
          const requiredFields = ["[data-row-shot-type]", "[data-row-camera-move]", "[data-row-visual]"];
          if (!dependsOnMaterials) requiredFields.push("[data-row-video-prompt]");
          const missing = requiredFields.filter(selector => !modal.querySelector(selector)?.value.trim());
          requiredFields.forEach(selector => modal.querySelector(selector)?.closest(".cl-edit-field")?.classList.toggle("invalid", missing.includes(selector)));
          if (missing.length) return showToast("请填写分镜必填信息");
          cells[1].textContent = newTime;
          cells[2].textContent = newVoice;
          cells[3].innerHTML = `<span class="shot-tag">${newShotType}</span>`;
          cells[4].innerHTML = `<span class="shot-tag">${newCameraMove}</span>`;
          cells[5].textContent = newVisual;
          if (asset?.scriptRows?.[rowIndex]) {
            Object.assign(asset.scriptRows[rowIndex], { time:newTime, shotType:newShotType, cameraMove:newCameraMove, voice:newVoice, visual:newVisual, videoPrompt:newVideoPrompt, materialIds:dependsOnMaterials ? materialIds : [] });
            delete asset.scriptRows[rowIndex].materialOverride;
          }
          modal.classList.remove("show");
          if (asset) {
            const activeIndex = scriptTaskAssetIds.indexOf(asset.id);
            renderScriptTaskResult(
              { summary: "已更新当前分镜，其他版本内容保持不变。" },
              scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean)
            );
            if (activeIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${activeIndex}"]`)?.click();
          }
          showToast("分镜已更新");
        };
      }
      modal.querySelector("[data-delete-script-row]").onclick = () => showToast("当前脚本不支持删除分镜");
      // Esc 关闭
      const escHandler = (e) => { if (e.key === "Escape") { modal.classList.remove("show"); document.removeEventListener("keydown", escHandler); } };
      document.addEventListener("keydown", escHandler);
    }

    taskStepper.addEventListener("click", event => {
      const stepButton = event.target.closest("[data-task-step]");
      if (!stepButton) return;
      const target = Number(stepButton.dataset.taskStep);
      if (taskCompleted && !taskEditing && target === taskSteps().length) {
        taskStep = target;
        taskFormScroll.hidden = true;
        taskResultHost.hidden = false;
        taskFormActions.hidden = true;
        renderTaskStepper();
        return;
      }
      if (taskCompleted || target <= taskStep) setTaskStep(target);
    });
    document.getElementById("closeTaskRestart").addEventListener("click", () => taskRestartModal.classList.remove("show"));
    document.getElementById("cancelTaskRestart").addEventListener("click", () => taskRestartModal.classList.remove("show"));
    document.getElementById("confirmTaskRestart").addEventListener("click", () => {
      taskRestartModal.classList.remove("show");
      taskEditing = false;
      if (isStructuredCopyFlow()) {
        originalCopySequence = 0;
        originalTaskAssetIds = [];
      }
      showGeneratedResult(true);
    });

    selectCreationHome();
    let conversationTurnCount = 0;
    let agentTurnCounts = {};
    let sessionAssets = [];
    let assetSequence = 0;
    let originalCopySequence = 0;
    let scriptTaskAssetIds = [];
    let pendingSourceAssetId = "";

    document.getElementById("taskChatTargetClear")?.addEventListener("click", () => {
      originalCopyTargetId = "";
      pendingSourceAssetId = "";
      renderOriginalTaskResult();
      document.getElementById("taskChatSubtitle").textContent = "可继续用自然语言批量修改本次文案";
      promptInput.placeholder = "告诉我你想怎么调整全部文案";
      promptInput.focus();
    });

    function generationTimestamp(date = new Date()) {
      const pad = value => String(value).padStart(2, "0");
      return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    }
    function generatedCopyName(timestamp = generationTimestamp()) {
      originalCopySequence += 1;
      return `${currentProduct().name}_${timestamp}_${originalCopySequence}`;
    }

    function appendOriginalCopyBatch(trigger) {
      if (trigger?.disabled) return;
      if (trigger) {
        trigger.disabled = true;
        trigger.textContent = "正在生成…";
      }
      const startIndex = originalTaskAssetIds.length;
      setTimeout(() => {
        const turnNumber = conversationTurnCount + 1;
        const messageId = `assistant-turn-${turnNumber}`;
        const batchTimestamp = generationTimestamp();
        const sourceItems = contextualCopy(activeType === "copy" ? "copy" : activeType === "rewrite" ? "rewrite" : "original", startIndex, 3);
        const newAssets = sourceItems.map(([direction, preview], index) => ({
          type:"copy",
          title:generatedCopyName(batchTimestamp),
          direction,
          preview,
          structureTags:activeCopyStructureTags(direction),
          wordCount:preview.replace(/\s/g, "").length,
          meta:activeType === "copy" ? `${direction} · 爆款方法重构 · 原创边界通过` : `${direction} · ${creationContext.originalFields.copyStructure || "不限"} · ${creationContext.originalFields.scriptType || "不限"}`,
          id:`session-asset-${++assetSequence}`,
          messageId,
          turnNumber,
          sourceType:activeType,
          sourceAssetId:"",
          model:selectedModelLabel(),
          saved:false
        }));
        const userTurn = document.createElement("div");
        userTurn.className = "message user";
        userTurn.textContent = "继续生成3条不同方向的文案";
        const assistantTurn = document.createElement("div");
        assistantTurn.className = "message assistant";
        assistantTurn.id = messageId;
        assistantTurn.dataset.agentType = activeType;
        assistantTurn.dataset.modelLabel = selectedModelLabel();
        assistantTurn.dataset.assetIds = newAssets.map(asset => asset.id).join(",");
        assistantTurn.innerHTML = `<div class="message-head"><strong>✦ ${escapeHtml(activeAgent)}</strong></div><p class="assistant-summary">已追加3条不同方向的${activeType === "copy" ? "原创仿写" : activeType === "rewrite" ? "定向改写" : "口播"}文案，已有结果未被覆盖。</p>`;
        chatOutput.append(userTurn, assistantTurn);
        sessionAssets.push(...newAssets);
        originalTaskAssetIds.push(...newAssets.map(asset => asset.id));
        conversationTurnCount += 1;
        agentTurnCounts[activeType] = (agentTurnCounts[activeType] || 0) + 1;
        renderOriginalTaskResult();
        renderSessionAssets();
        document.getElementById("taskChatSubtitle").textContent = "已同步追加一轮对话，可继续修改新生成的文案";
        requestAnimationFrame(() => {
          renderConversationLocator();
          chatOutput.scrollTo({ top:chatOutput.scrollHeight, behavior:"smooth" });
          taskResultHost.querySelector(`[data-asset-id="${newAssets[0].id}"]`)?.scrollIntoView({ behavior:"smooth", block:"start" });
        });
        showToast("已在下方追加3条文案");
      }, 520);
    }

    const guidedPromptMap = {
      chat: [
        ["帮我梳理一个产品的创作方向", "chat"],
        ["切换为智能文案生成口播", "original"],
        ["把已有文案转成分镜脚本", "script"]
      ],
      original: [
        ["只替换前3秒钩子，再生成3条", "rewrite"],
        ["把第2条转成30秒结构化脚本", "script"],
        ["保持卖点不变，改成宝妈人群表达", "original"]
      ],
      copy: [
        ["保留参考节奏，再换3种钩子", "copy"],
        ["把第1条转成可混剪脚本", "script"],
        ["不要沿用参考优惠，重新生成", "copy"]
      ],
      rewrite: [
        ["正文不变，再换3个强钩子", "rewrite"],
        ["把当前改写稿同步转成脚本", "script"],
        ["语气更硬，但不要增加新卖点", "rewrite"]
      ],
      script: [
        ["强化0—3秒的画面冲击", "script"],
        ["使用这份脚本直接智能混剪", "mix"],
        ["保留口播，只更换镜头设计", "script"]
      ],
      "script-copy": [
        ["保留镜头节奏，再换一个开场", "script-copy"],
        ["使用这份脚本直接智能混剪", "mix"],
        ["生成一条只换3秒钩子的延伸脚本", "script-copy"]
      ],
      mix: [
        ["只替换前3秒镜头重新混剪", "mix"],
        ["保留画面，换一版字幕包装", "mix"],
        ["基于当前主视频生成3条延伸视频", "mix"]
      ]
    };

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    const SCRIPT_MATERIAL_CATALOG = {
      "产品特写": [
        { id:"M-CL-101", duration:2.0, tags:["尘杯特写","透明可视","脏污证据"] },
        { id:"M-CL-102", duration:1.5, tags:["主机特写","按钮细节"] },
        { id:"M-CL-103", duration:1.0, tags:["握把近景","手持姿势"] }
      ],
      "产品全景": [
        { id:"M-PF-201", duration:2.0, tags:["白色家电","卧室全景"] },
        { id:"M-PF-202", duration:1.5, tags:["沙发场景","客厅全景"] },
        { id:"M-PF-203", duration:1.0, tags:["布艺椅","俯视全景"] }
      ],
      "使用场景": [
        { id:"M-SC-301", duration:1.5, tags:["床垫推进","清洁中"] },
        { id:"M-SC-302", duration:1.5, tags:["沙发表面","灰尘扬起"] },
        { id:"M-SC-303", duration:1.0, tags:["儿童房间","温馨感"] }
      ],
      "痛点对比": [
        { id:"M-PC-401", duration:1.2, tags:["脏污特写","毛发碎屑"] },
        { id:"M-PC-402", duration:1.5, tags:["使用前","床面脏污"] },
        { id:"M-PC-403", duration:1.3, tags:["使用后","干净对比"] }
      ],
      "活动物料": [
        { id:"M-AT-501", duration:1.5, tags:["品牌角标","行动按钮"] },
        { id:"M-AT-502", duration:2.0, tags:["暑期活动","优惠信息"] },
        { id:"M-AT-503", duration:1.0, tags:["产品定帧","CTA收口"] }
      ]
    };

    const SCRIPT_MATERIAL_SAMPLE_META = {
      "M-CL-101": { name:"透明尘杯脏污特写", scene:"床垫清洁", duration:2, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/08 09:14", tags:["脏污证据", "结果直给"] },
      "M-CL-102": { name:"拍打吸尘动作特写", scene:"床垫使用", duration:3, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/08 08:42", tags:["真实操作", "拍打吸尘"] },
      "M-CL-103": { name:"机身按键与吸口细节", scene:"产品卖点", duration:5, type:"video", status:"pending", product:"轻净 Pro 除螨仪", created:"08/07 17:35", tags:["功能展示", "产品特写"] },
      "M-PF-201": { name:"卧室床垫清洁全景", scene:"家庭卧室", duration:2, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/07 15:20", tags:["使用场景", "床垫清洁"] },
      "M-PF-202": { name:"沙发布艺清洁全景", scene:"客厅沙发", duration:3, type:"video", status:"ok", product:"", created:"08/07 11:36", tags:["养宠家庭", "毛发清理"] },
      "M-PF-203": { name:"多场景使用切换", scene:"床垫与沙发", duration:5, type:"video", status:"analyzing", product:"轻净 Pro 除螨仪", created:"08/06 18:24", tags:["一机多用", "家庭清洁"] },
      "M-SC-301": { name:"床垫表面推进清洁", scene:"卧室日常", duration:3, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/06 16:11", tags:["使用过程", "镜头推进"] },
      "M-SC-302": { name:"沙发表面拍打吸尘", scene:"养宠家庭", duration:5, type:"video", status:"fail", product:"", created:"08/06 10:08", tags:["毛发清理", "真实使用"] },
      "M-SC-303": { name:"儿童房床垫深度清洁", scene:"亲子家庭", duration:10, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/05 19:42", tags:["完整过程", "家庭场景"] },
      "M-PC-401": { name:"毛发皮屑脏污特写", scene:"清洁痛点", duration:0, type:"image", status:"ok", product:"轻净 Pro 除螨仪", created:"08/05 15:50", tags:["视觉冲击", "脏污特写"] },
      "M-PC-402": { name:"床面使用前对比", scene:"床垫卫生", duration:0, type:"image", status:"ok", product:"轻净 Pro 除螨仪", created:"08/05 13:27", tags:["前后对比", "痛点呈现"] },
      "M-PC-403": { name:"床面使用后对比", scene:"清洁结果", duration:5, type:"video", status:"pending", product:"轻净 Pro 除螨仪", created:"08/05 11:08", tags:["前后对比", "结果直给"] },
      "M-AT-501": { name:"品牌角标与行动按钮", scene:"品牌收口", duration:0, type:"image", status:"ok", product:"轻净 Pro 除螨仪", created:"08/04 18:30", tags:["CTA", "品牌露出"] },
      "M-AT-502": { name:"夏季深度清洁活动", scene:"营销活动", duration:0, type:"image", status:"analyzing", product:"轻净 Pro 除螨仪", created:"08/04 14:12", tags:["促销信息", "活动氛围"] },
      "M-AT-503": { name:"产品定帧与购买引导", scene:"品牌收口", duration:0, type:"image", status:"ok", product:"", created:"08/03 19:02", tags:["完整尾帧", "购买引导"] }
    };

    const SCRIPT_MATERIAL_FOLDERS = [
      { name:"产品素材", children:["产品特写", "产品全景"] },
      { name:"场景表达", children:["使用场景", "痛点对比"] },
      { name:"包装物料", children:["活动物料"] }
    ];
    function allScriptMaterials() {
      return Object.entries(SCRIPT_MATERIAL_CATALOG).flatMap(([group, items]) => items.map(item => ({
        ...item, ...SCRIPT_MATERIAL_SAMPLE_META[item.id],
        group,
        name: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.name || item.tags[0] || item.id,
        scene: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.scene || item.tags[1] || group,
        type: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.type || "video",
        status: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.status || "ok",
        product: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.product || "",
        created: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.created || ""
      })));
    }

    function openScriptMaterialReplacement(assetId, rowIndex) {
      const asset = sessionAssets.find(item => item.id === assetId);
      if (!asset?.scriptRows?.[rowIndex]) return;
      let selectedId = asset.scriptRows[rowIndex].materialOverride || "";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.innerHTML = `<div class="modal-card script-material-replace-modal" role="dialog" aria-label="替换匹配镜头"><header class="modal-head"><div><strong>替换匹配镜头</strong><small>选择一条 9:16 素材替换当前镜头</small></div><button class="modal-close" type="button" data-modal-close>×</button></header><div class="script-replace-grid" data-replace-grid></div><footer class="modal-foot"><div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-modal-close>取消</button><button class="primary-btn" type="button" data-replace-confirm disabled>确认替换</button></div></footer></div>`;
      document.body.appendChild(overlay);
      const grid = overlay.querySelector("[data-replace-grid]");
      const confirm = overlay.querySelector("[data-replace-confirm]");
      const render = () => {
        grid.innerHTML = allScriptMaterials().map(item => `<button class="script-replace-card${item.id === selectedId ? " selected" : ""}" type="button" data-replace-material="${escapeHtml(item.id)}"><span>${escapeHtml(item.id)}</span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · 9:16 · ${item.duration}s</small></button>`).join("");
        grid.querySelectorAll("[data-replace-material]").forEach(card => card.addEventListener("click", () => { selectedId = card.dataset.replaceMaterial; render(); }));
        confirm.disabled = !selectedId;
      };
      overlay.addEventListener("click", event => { if (event.target === overlay || event.target.matches("[data-modal-close]")) overlay.remove(); });
      confirm.addEventListener("click", () => {
        const selected = findScriptMaterial(selectedId);
        if (!selected) return;
        overlay.remove();
        const shotDuration = parseShotSeconds(asset.scriptRows[rowIndex].time);
        if (selected.duration > shotDuration) {
          openScriptMaterialCropper(assetId, rowIndex, selected, shotDuration);
          return;
        }
        applyMaterialToScriptRow(asset.scriptRows[rowIndex], selected);
        renderScriptTaskResult({ summary:"已替换镜头素材，并同步更新景别、运镜与画面描述。" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
        const tabIndex = scriptTaskAssetIds.indexOf(asset.id);
        if (tabIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${tabIndex}"]`)?.click();
        showToast("已替换素材并同步更新镜头方案");
      });
      render();
    }
    function findScriptMaterial(id) {
      return allScriptMaterials().find(item => item.id === id);
    }

    function materialShotFields(material) {
      const group = material?.group || "";
      if (group === "产品特写") return { shotType:"特写", cameraMove:"固定", visual:`${material.name}，突出产品细节与可验证的使用结果。` };
      if (group === "产品全景") return { shotType:"全景", cameraMove:"平移跟拍", visual:`${material.name}，展示真实家庭使用场景与产品整体动作。` };
      if (group === "使用场景") return { shotType:"中景", cameraMove:"推进", visual:`${material.name}，从环境推进至用户实际操作过程。` };
      if (group === "痛点对比") return { shotType:"近景", cameraMove:"固定", visual:`${material.name}，清楚呈现问题或清洁前后差异。` };
      return { shotType:"全景", cameraMove:"拉远", visual:`${material?.name || "品牌收口素材"}，完成品牌露出与行动引导。` };
    }

    function applyMaterialToScriptRow(row, material, crop = null) {
      if (!row || !material) return;
      Object.assign(row, materialShotFields(material), {
        materialOverride:material.id,
        materialIds:[material.id],
        materialCropStart: crop ? crop.start : null,
        materialCropEnd: crop ? crop.end : null,
        materialUseDuration: crop ? crop.duration : null
      });
    }

    function openScriptMaterialCropper(assetId, rowIndex, material, shotDuration) {
      const asset = sessionAssets.find(item => item.id === assetId);
      const row = asset?.scriptRows?.[rowIndex];
      if (!row || !material || material.duration <= shotDuration) return;
      const maxStart = Math.max(0, material.duration - shotDuration);
      let start = 0;
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.innerHTML = `<div class="modal-card script-crop-modal" role="dialog" aria-label="裁剪镜头素材"><header class="modal-head"><div><strong>裁剪镜头素材</strong><small>素材时长超过当前口播，请确定截取区间</small></div><button class="modal-close" type="button" data-crop-close>×</button></header><div class="script-crop-body"><div class="script-crop-preview"><span>${escapeHtml(material.id)}</span><div><strong>${escapeHtml(material.name)}</strong><small>${escapeHtml(material.scene)} · 9:16 · 原时长 ${material.duration.toFixed(1)}s</small></div></div><label>裁剪起点<input type="range" min="0" max="${maxStart}" step="0.1" value="0" data-crop-range></label><div class="script-crop-range"><span data-crop-start>00.0s</span><b data-crop-duration>固定截取 ${shotDuration.toFixed(1)}s</b><span data-crop-end>${shotDuration.toFixed(1)}s</span></div></div><footer class="modal-foot"><div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-crop-close>取消</button><button class="primary-btn" type="button" data-crop-confirm>确认裁剪并替换</button></div></footer></div>`;
      document.body.appendChild(overlay);
      const range = overlay.querySelector("[data-crop-range]");
      const startLabel = overlay.querySelector("[data-crop-start]");
      const endLabel = overlay.querySelector("[data-crop-end]");
      const render = () => {
        start = Number(range.value);
        startLabel.textContent = `${start.toFixed(1)}s`;
        endLabel.textContent = `${(start + shotDuration).toFixed(1)}s`;
      };
      range.addEventListener("input", render);
      overlay.addEventListener("click", event => { if (event.target === overlay || event.target.matches("[data-crop-close]")) overlay.remove(); });
      overlay.querySelector("[data-crop-confirm]").addEventListener("click", () => {
        applyMaterialToScriptRow(row, material, { start, end:start + shotDuration, duration:shotDuration });
        overlay.remove();
        renderScriptTaskResult({ summary:"已裁剪并替换镜头素材，同步更新景别、运镜与画面描述。" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
        const tabIndex = scriptTaskAssetIds.indexOf(asset.id);
        if (tabIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${tabIndex}"]`)?.click();
        showToast("已裁剪素材并同步更新镜头方案");
      });
      render();
    }

    function switchScriptShotGroup(assetId, rowIndex) {
      const asset = sessionAssets.find(item => item.id === assetId);
      const row = asset?.scriptRows?.[rowIndex];
      if (!row || asset.materialMode !== "depend") return;
      const allowed = asset.materialIds?.length ? asset.materialIds.map(findScriptMaterial).filter(Boolean) : allScriptMaterials();
      const current = row.materialOverride || row.materialIds?.[0] || "";
      const index = allowed.findIndex(item => item.id === current);
      const next = allowed[(index + 1 + allowed.length) % allowed.length];
      if (!next) return showToast("当前素材分组暂无可替换镜头");
      applyMaterialToScriptRow(row, next);
      renderScriptTaskResult({ summary:"已为当前镜头匹配一组新的素材与画面方案。" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
      const tabIndex = scriptTaskAssetIds.indexOf(asset.id);
      if (tabIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${tabIndex}"]`)?.click();
      showToast("已更新素材、景别、运镜与画面描述");
    }

    // 构造一个镜头时长 = 镜头总时长 的推荐素材方案
    function buildMaterialPlan(shotDuration, groupIds) {
      shotDuration = Number(shotDuration) || 3;
      const sourceIds = groupIds?.length ? groupIds : allScriptMaterials().map(item => item.id);
      const pool = [...new Map(sourceIds.flatMap(id => {
        const material = findScriptMaterial(id);
        return material ? [material] : allScriptMaterials().filter(item => item.group === id);
      }).map(item => [item.id, item])).values()];
      if (!pool.length) return [];
      const plans = [], seen = new Set();
      const add = (items, label) => {
        const key = items.map(item => item.id).join("+");
        if (seen.has(key) || plans.length >= 8) return;
        seen.add(key);
        plans.push({ planId:label, items, duration:items.reduce((sum, item) => sum + (item.useDuration || item.duration), 0) });
      };
      pool.filter(item => Math.abs(item.duration - shotDuration) < .05).forEach(item => add([{ ...item, useDuration:shotDuration }], "完整素材"));
      for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
        const total = pool[i].duration + pool[j].duration;
        if (Math.abs(total - shotDuration) < .1) add([pool[i], pool[j]], "拼接素材");
        if (total > shotDuration && pool[i].duration < shotDuration) {
          add([pool[i], { ...pool[j], useDuration:shotDuration - pool[i].duration, clipped:true }], "拼接截取");
        }
      }
      pool.filter(item => item.duration > shotDuration).forEach(item => add([{ ...item, useDuration:shotDuration, clipped:true }], "截取素材"));
      if (!plans.length) add([{ ...pool[0], useDuration:shotDuration || pool[0].duration, clipped:true }], "智能匹配");
      return plans;
      /* legacy matcher retained below for reference
      // 简化算法:先尽量用单段最长素材;不行就用拼接(2 段)
      const sorted = [...pool].sort((a, b) => b.duration - a.duration);
      // 试单段
      for (const item of sorted) {
        if (Math.abs(item.duration - shotDuration) < 0.05) {
          return [{ planId: `P-${item.id}`, items: [item] }];
        }
      }
      // 试拼接 2 段
      for (let i = 0; i < sorted.length; i++) {
        for (let j = 0; j < sorted.length; j++) {
          if (i === j) continue;
          if (Math.abs(sorted[i].duration + sorted[j].duration - shotDuration) < 0.1) {
            return [{ planId: `P-${sorted[i].id}+${sorted[j].id}`, items: [sorted[i], sorted[j]] }];
          }
        }
      }
      // 试拼接 3 段
      for (let i = 0; i < sorted.length; i++) {
        for (let j = 0; j < sorted.length; j++) {
          for (let k = 0; k < sorted.length; k++) {
            if (i === j || i === k || j === k) continue;
            if (Math.abs(sorted[i].duration + sorted[j].duration + sorted[k].duration - shotDuration) < 0.15) {
              return [{ planId: `P-${sorted[i].id}+${sorted[j].id}+${sorted[k].id}`, items: [sorted[i], sorted[j], sorted[k]] }];
            }
          }
        }
      }
      return []; */
    }

    const completeScriptRows = [
      {
        id: 1,
        time: "00—03s",
        shotType: "特写",
        cameraMove: "固定",
        voice: "刚换的床单，也能吸出一杯脏东西。",
        visual: "先给结果：透明尘杯脏污特写；0.8秒后切到整洁床面，形成干净与脏污的视觉反差。",
        subtitle: "刚换床单 ≠ 床垫干净",
        execution: "竖屏近景；尘杯居中；前1秒必须出现脏污证据；无合适素材时进入补拍清单。",
        videoPrompt: "透明尘杯特写,内部可见毛发与碎屑,自然光,竖屏9:16,产品居中,镜头固定,3秒。"
      },
      {
        id: 2,
        time: "03—06s",
        shotType: "特写",
        cameraMove: "推进",
        voice: "看得见的是表面，看不见的都藏在床垫深处。",
        visual: "手掌按压床垫，接床垫纤维微距和毛发碎屑特写，画面由整洁逐步推进到细节。",
        subtitle: "毛发、碎屑藏在织物深处",
        execution: "中景转微距；2个镜头；每镜1.5秒；素材检索词：床垫按压、纤维、毛发碎屑。",
        videoPrompt: "床垫纤维微距,毛发碎屑清晰可见,镜头从中景缓慢推进到特写,自然卧室光,3秒。"
      },
      {
        id: 3,
        time: "06—10s",
        shotType: "中景",
        cameraMove: "平移跟拍",
        voice: "轻净 Pro 一边拍打一边吸，把深处的脏东西直接带出来。",
        visual: "真人手持产品在床垫上匀速推进，补充机器底部与床面接触的近景，展示真实使用过程。",
        subtitle: "边拍边吸｜深层清洁",
        execution: "真人实拍优先；产品型号必须清晰；禁止使用其他型号或无法确认型号的镜头。",
        videoPrompt: "真人手持轻净 Pro 在床垫表面匀速推进,镜头从侧面平移跟拍,4秒,真实使用感。"
      },
      {
        id: 4,
        time: "10—14s",
        shotType: "近景",
        cameraMove: "推进",
        voice: "推过的地方，毛发和细小碎屑都会进到透明尘杯里。",
        visual: "床面推进镜头与尘杯内部变化交叉剪辑，最后停留在吸入后的尘杯结果。",
        subtitle: "脏东西看得见",
        execution: "使用前后结果必须来自同一产品；推进、吸入、尘杯三镜头按因果顺序排列。",
        videoPrompt: "透明尘杯内部变化过程,毛发碎屑逐渐累积,镜头固定在尘杯近景,4秒,竖屏。"
      },
      {
        id: 5,
        time: "14—18s",
        shotType: "全景",
        cameraMove: "平移跟拍",
        voice: "床垫、沙发和布艺座椅，都能顺手清理。",
        visual: "床垫、沙发、布艺椅三个真实家庭场景快切，每个场景展示一次完整接触与推进动作。",
        subtitle: "一机清洁多种布艺场景",
        execution: "3个场景各1.2—1.4秒；场景光线与产品颜色保持一致；避免重复使用同一动作镜头。",
        videoPrompt: "床垫、沙发、布艺椅三个真实家庭场景快切,每个1.3秒,镜头平移跟拍,4秒。"
      },
      {
        id: 6,
        time: "18—22s",
        shotType: "中景",
        cameraMove: "固定",
        voice: "机身握持轻松，日常拿出来用，不需要复杂准备。",
        visual: "单手拿取产品、放到床面、启动使用，连续呈现从拿取到清洁的完整动作。",
        subtitle: "拿起就能用",
        execution: "连续动作优先；不做无法由产品档案证明的重量或省力对比；保留真实环境声作转场。",
        videoPrompt: "单手拿起轻净 Pro,放至床面,启动使用,连续动作,镜头中景固定,4秒。"
      },
      {
        id: 7,
        time: "22—26s",
        shotType: "特写",
        cameraMove: "固定",
        voice: "清理完拆下尘杯，直接冲洗，下一次用也更省心。",
        visual: "关闭机器、拆下尘杯、倒出脏污、清水冲洗四个动作依次展示。",
        subtitle: "可拆尘杯｜清洗方便",
        execution: "动作顺序不可打乱；涉及水洗的部件必须与产品说明一致；画面增加操作步骤小字。",
        videoPrompt: "关闭机器、拆下尘杯、倒出脏污、清水冲洗,四个动作依次展示,特写固定,4秒。"
      },
      {
        id: 8,
        time: "26—30s",
        shotType: "全景",
        cameraMove: "拉远",
        voice: "别只换床单，床垫也该认真清理一次。点击了解轻净 Pro。",
        visual: "干净床面全景，产品摆放在画面右侧；随后出现产品名、核心卖点和点击引导。",
        subtitle: "轻净 Pro｜给床垫做一次深层清洁",
        execution: "品牌收口4秒；产品不得被字幕遮挡；CTA使用平台允许表达；最后0.5秒保留安全尾帧。",
        videoPrompt: "干净床面全景,产品摆放在画面右侧,镜头缓慢拉远,4秒,品牌角标+CTA。"
      }
    ];

    function scriptTableHtml(rows, mode = "depend", groupIds = [], assetId = "") {
      const showMaterial = mode === "depend";
      const dynamicColTitle = showMaterial ? "推荐素材" : "生视频提示词";
      const head = `
        <tr>
          <th class="col-shot">镜头</th>
          <th class="col-time">时间段</th>
          <th class="col-voice">对应口播片段</th>
          <th class="col-tag">景别</th>
          <th class="col-tag">运镜方式</th>
          <th class="col-visual">画面内容描述</th>
          <th class="col-dynamic">${dynamicColTitle}</th>
        </tr>
      `;
      const body = rows.map((row, rowIdx) => {
        const shotSeconds = parseShotSeconds(row.time);
        const rowMaterialIds = row.materialIds?.length ? row.materialIds : (row.materialOverride ? [row.materialOverride] : groupIds);
        const cropMaterial = row.materialOverride && Number.isFinite(row.materialCropStart) ? findScriptMaterial(row.materialOverride) : null;
        const plans = showMaterial
          ? (cropMaterial ? [{ items:[{ ...cropMaterial, useDuration:row.materialUseDuration || shotSeconds, clipped:true, cropStart:row.materialCropStart, cropEnd:row.materialCropEnd }] }] : buildMaterialPlan(shotSeconds, rowMaterialIds))
          : [];
        const dynamicCell = showMaterial
          ? (plans.length
            ? `<div class="material-match-cell"><button class="script-ai-switch" type="button" data-action="switch-script-shot" data-asset-id="${escapeHtml(assetId)}" data-row-idx="${rowIdx}">✦ AI 换一组</button><div class="material-match-list">${plans[0].items.map((it, itemIdx) => `
                <div class="material-plan-item">
                  <button class="material-video-preview" type="button" data-action="replace-script-material" data-asset-id="${escapeHtml(assetId)}" data-row-idx="${rowIdx}" data-material-id="${escapeHtml(it.id)}"><span>${escapeHtml(it.id)}</span><em>替换</em></button>
                  <div><strong>${escapeHtml(it.name || it.id)}</strong><small>${(it.useDuration || it.duration).toFixed(1)}s${Number.isFinite(it.cropStart) ? ` · 裁剪 ${it.cropStart.toFixed(1)}–${it.cropEnd.toFixed(1)}s` : it.clipped ? " · 截取" : ""}</small><span>${(it.tags || []).slice(0, 2).map(tag => escapeHtml(tag)).join(" · ")}</span></div>
                </div>${itemIdx < plans[0].items.length - 1 ? '<i class="material-plan-plus">＋</i>' : ''}`).join("")}</div></div>`
            : `<div class="material-plan-empty">当前素材分组下无匹配素材，请返回脚本策略重新勾选素材分组。</div>`)
          : `<div class="video-prompt-cell"><textarea readonly rows="3" data-video-prompt>${escapeHtml(row.videoPrompt || "")}</textarea><button class="ghost-btn ghost-btn-sm" type="button" data-action="copy-video-prompt" data-prompt="${escapeHtml(row.videoPrompt || "")}">一键复制</button></div>`;
        return `
          <tr data-script-row data-row-idx="${rowIdx}" data-asset-id="${escapeHtml(assetId)}">
            <td class="col-shot"><b class="shot-index">#${row.id}</b></td>
            <td class="col-time" data-edit-script-row>${escapeHtml(row.time)}</td>
            <td class="col-voice" data-edit-script-row><div class="cell-clamp">${escapeHtml(row.voice)}</div></td>
            <td class="col-tag" data-edit-script-row><span class="shot-tag">${escapeHtml(row.shotType || "中景")}</span></td>
            <td class="col-tag" data-edit-script-row><span class="shot-tag">${escapeHtml(row.cameraMove || "固定")}</span></td>
            <td class="col-visual" data-edit-script-row><div class="cell-clamp">${escapeHtml(row.visual)}</div></td>
            <td class="col-dynamic">${dynamicCell}</td>
          </tr>
        `;
      }).join("");
      return `
        <div class="script-table-wrap">
          <table class="script-result-table-grid${showMaterial ? " with-materials" : " with-prompts"}">
            <thead>${head}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    }

    // 解析 "00—03s" / "06—10s" 为 3 / 4 等秒数(用于素材方案匹配)
    function parseShotSeconds(timeText) {
      const match = String(timeText || "").match(/(\d+)\s*[-—]\s*(\d+)/);
      if (!match) return 0;
      return Math.max(1, Number(match[2]) - Number(match[1]));
    }

    function videoScriptDetailHtml(asset) {
      const mode = asset.materialMode || "depend";
      const groupIds = asset.materialIds?.length ? asset.materialIds : (asset.materialGroups || []).map(g => g.id || g.name);
      return `
        <strong>本视频使用脚本</strong>
        <p style="margin:4px 0 8px;">${escapeHtml(asset.sourceTitle || "除螨仪30秒结构化脚本")} · 同时保留素材匹配、字幕、配音和包装信息</p>
        ${scriptTableHtml(asset.scriptRows || completeScriptRows, mode, groupIds)}
      `;
    }

    function generatedShotDetailHtml(asset) {
      return `
        <strong>镜头生成信息</strong>
        <p style="margin:4px 0 0;">${escapeHtml(asset.detail || "图生视频 · 5秒 · 9:16 · 1080P")}</p>
      `;
    }

    function contextualCopy(type, offset = 0, countOverride = null) {
      const product = currentProduct();
      const audience = creationContext.originalFields.audiences?.[0] || product.audiences?.[0] || "家庭用户";
      const core = product.core || "解决核心使用问题";
      const secondary = product.secondary || "日常使用更方便";
      const difference = product.difference || "效果清晰可感知";
      const marketing = creationContext.originalFields.marketing || "具体优惠以当前页面展示为准";
      const action = creationContext.originalFields.marketingScene === "直播间引流" ? "点进直播间，看完整实测演示。" : "点击商品，先看实际使用效果。";
      if (type === "rewrite") {
        const fields = creationContext.originalFields;
        const method = fields.rewriteMethod || "hook";
        const target = fields.rewriteTarget || "结果前置";
        const source = String(fields.sourceCopy || `${product.name}可以做到${core}，日常使用还能${secondary}。${action}`).trim();
        const rest = source.replace(/^[^。！？!?]+[。！？!?]?/, "").trim() || source;
        const hooks = [
          `刚整理完，也不代表深处真的干净。`,
          `别只看表面，先看${product.name}实际处理出的结果。`,
          `${audience}先别急着选，第一步要看效果能不能直接验证。`,
          `同样是日常清洁，真正拉开差距的是看不见的细节。`,
          `先不讲参数，用一次真实结果告诉你值不值得。`,
          `看着干净和真正处理到位，完全是两回事。`
        ];
        const styles = {
          "硬广直给": `别绕弯子，${product.name}核心就是${core}。`,
          "生活化口播": `我本来没觉得家里有多难清理，直到实际用了一遍${product.name}。`,
          "专业测评": `先看核心能力和实测结果：${product.name}${core}。`,
          "情绪冲击": `每天都在用的地方，最怕看着干净、实际问题还藏在里面。`,
          "理性对比": `选这类产品，不比功能数量，只比核心问题能不能真正处理。`
        };
        const methodTitles = { hook:"只换前3秒钩子", shorten:"缩短文案", audience:"更换目标人群", selling:"卖点前置", style:"调整表达风格", rephrase:"保留结构重新表达" };
        const count = Math.max(1, Math.min(10, Number(countOverride ?? fields.generationCount ?? 3)));
        return Array.from({ length: count }, (_, index) => {
          const absoluteIndex = offset + index;
          let preview = source;
          if (method === "hook") preview = `${hooks[absoluteIndex % hooks.length]}${rest}`;
          if (method === "shorten") preview = source.replace(/这类产品|实际使用过程中|日常使用时/g, "").slice(0, Math.max(30, Number(fields.wordCount || 120)));
          if (method === "audience") preview = `${target}选这类产品，先看能不能解决每天都遇到的问题。${product.name}${core}，日常使用还能${secondary}。${action}`;
          if (method === "selling") preview = `${target}。${source}`;
          if (method === "style") preview = `${styles[target] || styles["硬广直给"]}${rest}`;
          if (method === "rephrase") preview = `先看真实使用结果。${product.name}通过${core}处理核心问题，同时做到${secondary}；${difference}。${action}`;
          return [`${methodTitles[method] || "定向改写"}·版本${absoluteIndex + 1}`, preview];
        });
      }
      const baseCopies = [
        ["结果冲击型", `刚整理完的地方，不代表深处真的干净。先用${product.name}走一遍，${difference}，清洁结果直接看得见。它可以做到${core}，日常使用还能${secondary}，不用再靠感觉判断有没有清理到位。${marketing}，${action}`],
        ["痛点直给型", `别再只看表面参数，真正影响体验的是每天遇到的问题能不能解决。${product.name}主打${core}，使用过程中还能${secondary}，把原本反复处理的步骤变得更直接。再通过${difference}让效果有据可看。${marketing}，${action}`],
        ["场景代入型", `${audience}日常使用时，最怕步骤多、做完还看不到结果。${product.name}通过${core}完成核心处理，再用${difference}反馈实际效果；使用结束后还能${secondary}。从操作到后续清理都更顺手。${marketing}，${action}`],
        ["实测验证型", `先不讲参数，直接看一次真实使用。${product.name}工作时可以做到${core}，处理后的变化通过${difference}清楚呈现。用完还能${secondary}，操作和后续整理都不用增加复杂步骤。${marketing}，${action}`],
        ["身份点名型", `${audience}选这类产品，别只看功能多不多，要看它能不能解决高频问题。${product.name}做到${core}，并通过${difference}降低判断成本，日常还能${secondary}。需要经常使用的产品，省心比堆参数更重要。${action}`],
        ["反差对比型", `看着干净和真正处理到位不是一回事，区别就在使用结果。${product.name}通过${core}处理核心问题，再用${difference}把前后差别展示出来；同时还能${secondary}。不需要复杂操作，也能把日常容易忽略的地方认真处理。${action}`],
        ["风险提醒型", `日常看不见的问题，不会因为简单整理就自动消失。${product.name}可以做到${core}，并通过${difference}帮助你确认实际效果；用完还能${secondary}。与其反复猜测，不如把处理过程和结果都看清楚。${marketing}，${action}`],
        ["利益直给型", `一次完成核心处理，还能直接看到结果。${product.name}${core}，使用过程中通过${difference}反馈效果，用完还能${secondary}。少一点重复步骤，多一点明确结果，日常使用更容易坚持。${marketing}，${action}`],
        ["悬念揭秘型", `明明刚整理过，为什么再次处理还能看到变化？用${product.name}实际走一遍，${difference}。它能够做到${core}，后续还能${secondary}，从过程到结果都更清楚。答案不靠猜，直接看完整演示。${action}`],
        ["数字清单型", `选这类产品先看三点：核心问题能不能处理、结果能不能看见、用完是否方便。${product.name}分别通过${core}、${difference}和${secondary}回应这三个问题。功能不在多，而在每一步都能解决真实使用需求。${marketing}，${action}`]
      ];
      const count = Math.max(1, Math.min(10, Number(countOverride ?? creationContext.originalFields.generationCount ?? 3)));
      return Array.from({ length: count }, (_, index) => {
        const absoluteIndex = offset + index;
        const base = baseCopies[absoluteIndex % baseCopies.length];
        const round = Math.floor(absoluteIndex / baseCopies.length);
        return round ? [`${base[0]}·延展${round + 1}`, `换一种表达方式：${base[1]}`] : base;
      });
    }

    function copyStructureTags(title = "") {
      if (title.includes("痛点")) return ["痛点钩子", "问题放大", "产品卖点", "使用价值", "行动号召"];
      if (title.includes("场景")) return ["场景代入", "用户痛点", "产品卖点", "使用感受", "行动号召"];
      if (title.includes("实测")) return ["实测钩子", "使用过程", "结果证据", "便利卖点", "行动号召"];
      if (title.includes("身份")) return ["人群点名", "选择标准", "产品卖点", "用户价值", "行动号召"];
      if (title.includes("反差")) return ["反差钩子", "问题对比", "产品卖点", "结果证明", "行动号召"];
      if (title.includes("风险")) return ["风险提醒", "用户痛点", "产品方案", "结果证明", "行动号召"];
      if (title.includes("利益")) return ["利益直给", "产品功能", "使用价值", "价格优惠", "行动号召"];
      if (title.includes("悬念")) return ["悬念钩子", "原因揭示", "产品功能", "结果证明", "行动号召"];
      if (title.includes("数字")) return ["数字钩子", "选择标准", "产品卖点", "信任说明", "行动号召"];
      return ["结果钩子", "用户痛点", "产品卖点", "使用价值", "行动号召"];
    }

    function activeCopyStructureTags(direction = "") {
      if (activeType === "original") {
        const selected = copyStructureCatalog.find(item => item.id === creationContext.originalFields.copyStructureId);
        if (selected?.formula) return selected.formula.split("→").map(item => item.trim()).filter(Boolean);
      }
      return copyStructureTags(direction);
    }

    function contextualScriptRows() {
      const product = currentProduct();
      return [
        { id:1, time:"00—03s", shotType:"特写", cameraMove:"固定", voice:`先看结果,${product.name}把核心效果直接做给你看。`, visual:"产品使用结果特写先出现,再快速切换至使用前场景,形成视觉反差。", subtitle:"结果先看｜3秒抓停留", execution:"优先匹配产品结果实拍;无素材时标记为需补拍。", videoPrompt:`${product.name}使用结果特写,自然光,竖屏9:16,镜头固定,3秒。` },
        { id:2, time:"03—06s", shotType:"近景", cameraMove:"推进", voice:"真正影响体验的,往往不是表面参数,而是每天都要处理的麻烦。", visual:"用户真实场景与问题细节近景,镜头从环境推进到具体痛点。", subtitle:"真实场景｜具体问题", execution:"匹配产品目标人群场景;避免空泛氛围镜头。", videoPrompt:"用户真实场景,问题细节近景,镜头从中景缓慢推进,3秒。" },
        { id:3, time:"06—10s", shotType:"中景", cameraMove:"平移跟拍", voice:`${product.name},${product.core}。`, visual:"真人或手部完成一次完整产品操作,补充关键结构近景。", subtitle:product.core, execution:"产品型号、外观和操作步骤必须一致;优先使用产品绑定实拍。", videoPrompt:`${product.name} 核心卖点实拍,镜头平移跟拍,4秒。` },
        { id:4, time:"10—14s", shotType:"近景", cameraMove:"固定", voice:`使用过程中,${product.difference}。`, visual:"展示产品工作过程及结果变化,按照原因—过程—结果顺序剪辑。", subtitle:product.difference, execution:"结果镜头必须来自当前产品;禁止用其他型号代替。", videoPrompt:`${product.name} 工作过程近景,镜头固定,4秒,展示差异化卖点。` },
        { id:5, time:"14—18s", shotType:"全景", cameraMove:"平移跟拍", voice:`日常使用还能做到${product.secondary}。`, visual:"连续展示两个高频使用场景,每个场景保留完整动作。", subtitle:product.secondary, execution:"每个场景1.5—2秒;镜头内容不重复。", videoPrompt:"两个高频使用场景,镜头平移跟拍,4秒,真实生活感。" },
        { id:6, time:"18—22s", shotType:"中景", cameraMove:"固定", voice:"不用额外增加复杂步骤,使用和后续处理都更顺手。", visual:"操作完成后的收纳、清理或切换动作,突出便利性。", subtitle:"少步骤｜更省心", execution:"动作必须连贯;不做无法由产品事实证明的效率对比。", videoPrompt:"操作完成后收纳/清理动作,中景固定,4秒,突出便利。" },
        { id:7, time:"22—26s", shotType:"中景", cameraMove:"固定", voice:"选这类产品,核心是看它能不能真正解决你的使用问题。", visual:"产品与真实家庭环境同框,补充一组用户使用反馈字幕。", subtitle:"解决问题,比堆参数更重要", execution:"用户反馈使用已授权内容;无授权时仅展示产品场景。", videoPrompt:"产品与真实家庭环境同景,中景固定,4秒,自然感。" },
        { id:8, time:"26—30s", shotType:"全景", cameraMove:"拉远", voice:`想进一步了解${product.name},进入直播间看完整演示。`, visual:"产品定帧、品牌角标和行动引导;背景保持简洁。", subtitle:"进入直播间｜查看完整演示", execution:"套用品牌包装模板;活动与价格仅使用本次已审核营销信息。", videoPrompt:`${product.name} 定帧,全景拉远,4秒,品牌角标+行动引导,背景简洁。` }
      ];
    }

    function defaultAgentRequest(type) {
      const product = currentProduct();
      const rewriteMethodLabel = ({ hook:"只换前3秒钩子", shorten:"缩短文案", audience:"更换目标人群", selling:"卖点前置", style:"调整表达风格", rephrase:"保留结构重新表达" })[creationContext.originalFields.rewriteMethod] || "只换前3秒钩子";
      const requests = {
        original: `为“${product.name}”生成${creationContext.originalFields.generationCount || 3}条千川口播文案；营销场景：${creationContext.originalFields.marketingScene || "直播间引流"}；目标人群：${creationContext.originalFields.audiences?.join("、") || "产品默认人群"}；开场钩子：${creationContext.originalFields.hook || "不限"}；文案结构：${creationContext.originalFields.copyStructure || "不限"}；脚本类型：${creationContext.originalFields.scriptType || "不限"}；每条约${creationContext.originalFields.wordCount || 180}字。仅使用已确认的产品卖点与信任背书。`,
        copy: `参考当前已解析爆款内容的钩子、结构与节奏，为“${product.name}”生成${creationContext.originalFields.generationCount || 3}条原创仿写文案，每条约${creationContext.originalFields.wordCount || 120}字；仅使用当前产品事实，不复制原文，不迁移参考商品的品牌、参数、价格或优惠。`,
        rewrite: `对“${product.name}”现有文案执行“${rewriteMethodLabel}”改写，生成${creationContext.originalFields.generationCount || 3}条，每条约${creationContext.originalFields.wordCount || 120}字；未指定修改的原文结构、产品事实、卖点顺序和CTA保持不变。`,
        "image-main": `为“${product.name}”生成3张商品主图，突出“${product.core}”。`,
        "image-detail": `为“${product.name}”生成一组详情页图片，按卖点顺序组织内容。`,
        script: `把当前文案转为“${product.name}”的30秒结构化脚本，优先使用产品绑定素材。`,
        "script-copy": `参考已拉片视频，为“${product.name}”重构一条30秒原创脚本。`,
        mix: `使用当前结构化脚本和“${product.name}”绑定素材生成待终审成片。`
      };
      return requests[type] || agentConfigs[type]?.request || "开始创作";
    }

    function buildCompactResponse(type, isRevision) {
      if (type === "chat") {
        return {
          summary: "我已理解你的需求。你可以继续补充产品、目标人群或希望产出的资产；需要直接执行时，可切换为智能文案、智能脚本或智能混剪等专业能力。",
          assets: []
        };
      }
      if (type === "image-main" || type === "image-detail") {
        const isMain = type === "image-main";
        const product = currentProduct();
        const imageTitles = isMain ? ["结果可视化主图", "功能演示主图", "使用便利主图"] : ["核心卖点模块", "功能演示模块", "使用便利模块", "适用场景模块"];
        return {
          summary: isMain ? `已为“${product.name}”生成 ${imageTitles.length} 张商品主图，均可继续改图或保存到图片库。` : `已为“${product.name}”生成 ${imageTitles.length} 个详情页图片模块，可调整卖点顺序和画面风格。`,
          assets: imageTitles.map((title, index) => ({ type: "image", title, preview: isMain ? `${product.core} · ${index === 0 ? "商品主体 + 结果证据" : "产品卖点场景化呈现"}` : `${product.core} · 详情页模块 ${index + 1}`, meta: isMain ? "商品主图 · AI创作" : "商品详情页 · AI创作" }))
        };
      }
      if (type === "original" || type === "copy" || type === "rewrite") {
        const batchTimestamp = generationTimestamp();
        const sourceItems = type === "copy" ? contextualCopy("original") : contextualCopy(type);
        const items = sourceItems.map(([direction, preview], index) => ({
          type: "copy",
          title: generatedCopyName(batchTimestamp),
          direction,
          preview,
          structureTags: activeCopyStructureTags(direction),
          wordCount: preview.replace(/\s/g, "").length,
          meta: type === "original" ? `${direction} · ${creationContext.originalFields.copyStructure || "不限"} · ${creationContext.originalFields.scriptType || "不限"}` : type === "copy" ? `${direction} · 爆款方法重构` : `${direction} · 定向改写`
        }));
        const product = currentProduct();
        const rewriteMethod = dynamicForm.querySelector('[data-single="rewrite-method"] .choice-chip.active')?.textContent.trim() || "所选方式";
        const freshSummary = type === "original"
          ? `已根据 ${product.name} 的产品信息和生成设置，为你生成${items.length}条千川口播文案。`
          : type === "copy"
            ? `已参考所选素材的内容结构，为 ${product.name} 生成${items.length}条原创仿写文案。`
            : `已按“${rewriteMethod}”完成${items.length}版改写，可继续自然语言调整。`;
        return {
          summary: isRevision ? `已按本轮要求更新${items.length}条结果。` : freshSummary,
          assets: items
        };
      }

      if (type === "script" || type === "script-copy") {
        const product = currentProduct();
        const scriptCtx = creationContext.script || {};
        const versionCount = Math.max(1, Math.min(3, Number(scriptCtx.version || 1)));
        const baseRows = contextualScriptRows();
        const versionFlavors = [
          { suffix:"V1", angle:"钩子强化+结果直给", rhythm:"稳" },
          { suffix:"V2", angle:"痛点加深+场景前置", rhythm:"快" },
          { suffix:"V3", angle:"对比放大+卖点集中", rhythm:"紧" }
        ];
        const versionAssets = Array.from({ length: versionCount }, (_, idx) => {
          const flavor = versionFlavors[idx] || versionFlavors[0];
          const rows = baseRows.map(row => ({ ...row }));
          return {
            type: "script",
            versionLabel: flavor.suffix,
            versionAngle: flavor.angle,
            versionRhythm: flavor.rhythm,
            title: type === "script"
              ? `${product.name}｜30秒结构化脚本 ${flavor.suffix}`
              : `${product.name}｜爆款节奏重构脚本 ${flavor.suffix}`,
            preview: `30秒完整脚本 ${flavor.suffix}｜8个连续分镜｜${flavor.angle}｜节奏:${flavor.rhythm}`,
            meta: `${flavor.angle} · 节奏${flavor.rhythm} · 8段分镜 · 含完整口播、画面、字幕、素材匹配及混剪执行要求`,
            scriptRows: rows,
            materialMode: scriptCtx.materialMode || "depend",
            materialIds: scriptCtx.materialIds || [],
            materialGroups: scriptCtx.materialGroups || []
          };
        });
        return {
          summary: isRevision
            ? `已完成整条30秒脚本更新,${versionCount > 1 ? `已生成 ${versionCount} 个独立版本供选择` : "所有分镜均保留完整口播、画面、字幕和混剪执行要求"}。`
            : `已生成 ${versionCount} 套可直接交给剪辑或驱动智能混剪的30秒结构化脚本${versionCount > 1 ? "。" : "。"}`,
          assets: versionAssets
        };
      }

      const product = currentProduct();
      return {
        summary: isRevision ? "已按要求局部重新混剪，未涉及的镜头、配音和包装保持不变。" : "成片已生成，可预览、查看来源脚本或进入人工终审。",
        assets: [{
          type: "video",
          title: `${product.name}｜30秒主视频`,
          preview: "28.6秒 · 9:16 · 8个镜头任务已匹配 · 自动质检通过",
          meta: "智能混剪 · 待人工终审",
          detail: "制作信息：产品实拍62% · 历史素材38% · AI素材0%\n已完成：字幕对齐、配音、BGM闪避、品牌包装与黑帧检测",
          scriptRows: contextualScriptRows()
        }]
      };
    }

    function actionsForAsset(asset) {
      const libraryText = asset.saved ? "已存素材库" : asset.type === "video" ? "保存到视频库" : asset.type === "image" ? "保存到图片库" : "保存到文案库";
      const libraryClass = asset.saved ? " saved" : "";
      if (asset.type === "copy") {
        return `
          <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
          <button class="asset-action" data-asset-action="to-script">转为脚本</button>
          <button class="asset-action" data-asset-action="similar">生成同类</button>
          <button class="asset-action" data-asset-action="copy">复制</button>
          <button class="asset-action" data-asset-action="delete">删除</button>
        `;
      }
      if (asset.type === "script") {
        return `
          <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
          <button class="asset-action primary" data-asset-action="to-mix">智能混剪</button>
          <button class="asset-action" data-asset-action="edit-script">修改分镜</button>
          <button class="asset-action" data-asset-action="similar">生成同类</button>
        `;
      }
      if (asset.type === "video") {
        return `
          <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
          <button class="asset-action" data-asset-action="view-script">查看脚本</button>
          <button class="asset-action" data-asset-action="remix">重新混剪</button>
          <button class="asset-action primary" data-asset-action="submit">提交提审</button>
        `;
      }
      return `
        <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
        <button class="asset-action" data-asset-action="edit-image">继续修改</button>
      `;
    }

    function generatedAssetHtml(asset) {
      let body = `<div class="generated-asset-body">${escapeHtml(asset.preview)}</div>`;
      if (asset.type === "script") {
        const mode = asset.materialMode || "depend";
        const groupIds = asset.materialIds?.length ? asset.materialIds : (asset.materialGroups || []).map(g => g.id || g.name);
        body = scriptTableHtml(asset.scriptRows || completeScriptRows, mode, groupIds);
      }
      if (asset.type === "video") {
        const detail = asset.videoKind === "generated-shot" ? generatedShotDetailHtml(asset) : videoScriptDetailHtml(asset);
        body = `
          <div class="generated-video">
            <div class="generated-video-cover">▶</div>
            <div>
              <div class="generated-asset-body">${escapeHtml(asset.preview)}</div>
              <div class="video-source-detail">${detail}</div>
            </div>
          </div>
        `;
      }
      return `
        <article class="generated-asset" data-asset-id="${asset.id}">
          <div class="generated-asset-head"><strong>${escapeHtml(asset.title)}</strong><small>${asset.type === "copy" ? "文案" : asset.type === "script" ? "脚本" : asset.type === "video" ? "视频" : "图片"}</small></div>
          ${body}
          <div class="asset-inline-actions">${actionsForAsset(asset)}</div>
        </article>
      `;
    }

    function guidedPromptsHtml(type, assetId) {
      const prompts = guidedPromptMap[type] || guidedPromptMap.original;
      return `
        <div class="guided-prompts" data-source-asset-id="${assetId || ""}">
          <span>接下来可以：</span>
          ${prompts.map(([text, nextType]) => `<button class="guided-prompt" data-guided-prompt="${escapeHtml(text)}" data-next-type="${nextType}">${escapeHtml(text)}</button>`).join("")}
        </div>
      `;
    }

    function previewText(text, maxLength = 42) {
      const normalized = (text || "").replace(/\s+/g, " ").trim();
      return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
    }

    function updateConversationLocator() {
      if (!conversationLocator) return;
      const userTurns = [...chatOutput.querySelectorAll(".message.user")];
      const dots = [...conversationLocator.querySelectorAll(".locator-dot")];
      let activeIndex = 0;
      userTurns.forEach((turn, index) => {
        if (turn.offsetTop - chatOutput.offsetTop <= chatOutput.scrollTop + 56) activeIndex = index;
      });
      dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
    }

    function renderConversationLocator() {
      if (!conversationLocator) return;
      const userTurns = [...chatOutput.querySelectorAll(".message.user")];
      conversationLocator.innerHTML = "";
      if (!userTurns.length) return;

      const usableHeight = Math.max(0, conversationLocator.clientHeight - 4);
      const pointGap = userTurns.length > 1
        ? Math.min(22, Math.max(14, (usableHeight - 3) / (userTurns.length - 1)))
        : 0;
      const pointGroupHeight = (userTurns.length - 1) * pointGap + 3;
      const pointStart = Math.max(0, (usableHeight - pointGroupHeight) / 2);
      userTurns.forEach((userTurn, index) => {
        const assistantTurn = userTurn.nextElementSibling?.classList.contains("assistant") ? userTurn.nextElementSibling : null;
        const question = previewText(userTurn.textContent);
        const answer = previewText(assistantTurn?.querySelector(".assistant-summary")?.textContent || assistantTurn?.textContent || "");
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "locator-dot";
        dot.style.top = `${pointStart + index * pointGap}px`;
        dot.setAttribute("aria-label", `第 ${index + 1} 轮：${question}`);
        dot.title = `定位到第 ${index + 1} 轮`;

        const preview = document.createElement("span");
        preview.className = "locator-preview";
        const heading = document.createElement("strong");
        heading.textContent = `第 ${index + 1} 轮`;
        const questionLine = document.createElement("span");
        questionLine.textContent = `你：${question}`;
        const answerLine = document.createElement("span");
        answerLine.textContent = `AI：${answer}`;
        preview.append(heading, questionLine, answerLine);
        dot.append(preview);
        dot.addEventListener("click", () => userTurn.scrollIntoView({ behavior: "smooth", block: "start" }));
        conversationLocator.append(dot);
      });
      updateConversationLocator();
    }

    function clearAgentConflict() {
      dynamicForm.querySelector("[data-agent-conflict]")?.remove();
    }

    function showAgentConflict(title, message, kind, field) {
      clearAgentConflict();
      const panel = document.createElement("div");
      panel.className = "field-conflict";
      panel.dataset.agentConflict = kind;
      panel.innerHTML = `<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div><div class="field-conflict-actions"><button type="button" data-conflict-action="use-product">使用产品库信息</button><button type="button" data-conflict-action="modify">返回修改</button>${kind === "fact" ? '<button type="button" data-conflict-action="update-product">更新产品信息</button>' : ""}</div>`;
      (dynamicForm.querySelector(".task-form-footer") || dynamicForm).prepend(panel);
      panel.dataset.fieldName = field?.dataset.field || "";
      panel.scrollIntoView({ behavior:"smooth", block:"center" });
    }

    function validateAgentFacts() {
      if (!["original", "copy", "rewrite"].includes(activeType)) return true;
      clearAgentConflict();
      const fields = [...dynamicForm.querySelectorAll("input:not([type=hidden]), textarea")];
      const combined = fields.map(field => field.value || "").join("\n");
      const product = currentProduct();
      const factConflict = combined.match(/(?:¥|￥)?\s*(199|299)\s*元?/);
      if (product.name.includes("轻净 Pro") && factConflict) {
        const field = fields.find(item => (item.value || "").includes(factConflict[0]));
        showAgentConflict("价格与产品库不一致", `输入中出现“${factConflict[0]}”，产品库价格为 ¥399。`, "fact", field);
        return false;
      }
      const blocked = ["全网最低", "永久有效", "100%除螨", "百分百除螨", "绝对安全"].find(word => combined.includes(word));
      if (blocked) {
        const field = fields.find(item => (item.value || "").includes(blocked));
        showAgentConflict("命中禁用表达", `“${blocked}”不能用于生成，请删除或改为可证明的表达。`, "forbidden", field);
        return false;
      }
      const unsupported = ["国家级认证", "销量第一", "除菌率99.9%"].find(word => combined.includes(word));
      if (unsupported) {
        const field = fields.find(item => (item.value || "").includes(unsupported));
        showAgentConflict("缺少信任证明", `“${unsupported}”尚未绑定证明材料，暂不能用于创作。`, "unsupported", field);
        return false;
      }
      return true;
    }

    function showGeneratedResult(allowDefault = false) {
      const config = agentConfigs[activeType];
      if (!config) return;
      const inAgentTask = taskShell.classList.contains("show");
      const typedRequest = promptInput.value.trim();
      if (!typedRequest && !allowDefault) {
        showToast("请输入需要继续修改的内容");
        return;
      }
      if (!validateAgentFacts()) return;
      closeModal(true);
      const requestText = typedRequest || defaultAgentRequest(activeType);
      const isRevision = (agentTurnCounts[activeType] || 0) > 0 && Boolean(typedRequest);
      const response = buildCompactResponse(activeType, isRevision);
      const turnNumber = conversationTurnCount + 1;
      const messageId = `assistant-turn-${turnNumber}`;
      const sourceAssetId = pendingSourceAssetId;
      const sourceAsset = sessionAssets.find(asset => asset.id === sourceAssetId);
      const chatTargetIds = inAgentTask && taskCompleted && isStructuredCopyFlow()
        ? (originalCopyTargetId ? [originalCopyTargetId] : [...originalTaskAssetIds])
        : (sourceAssetId ? [sourceAssetId] : []);
      const generatedAssets = response.assets.map(asset => ({
        ...asset,
        id: `session-asset-${++assetSequence}`,
        messageId,
        turnNumber,
        sourceType: activeType,
        sourceAssetId,
        sourceAssetIds: [...chatTargetIds],
        sourceTitle: sourceAsset?.title || asset.sourceTitle,
        scriptRows: asset.type === "video" && activeType === "mix" ? (sourceAsset?.scriptRows || asset.scriptRows || completeScriptRows) : asset.scriptRows,
        model: selectedModelLabel(),
        saved: false
      }));
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.dataset.targetAssetIds = chatTargetIds.join(",");
      userTurn.textContent = requestText;

      const assistantTurn = document.createElement("div");
      assistantTurn.className = "message assistant";
      assistantTurn.id = messageId;
      assistantTurn.dataset.agentType = activeType;
      assistantTurn.dataset.modelLabel = selectedModelLabel();
      assistantTurn.dataset.assetIds = generatedAssets.map(asset => asset.id).join(",");
      assistantTurn.dataset.sourceAssetIds = chatTargetIds.join(",");
      assistantTurn.innerHTML = `
        <div class="message-head">
          <strong title="${escapeHtml(selectedModelLabel())}">✦ ${activeAgent}</strong>
        </div>
        <p class="assistant-summary">${response.summary}</p>
        ${inAgentTask ? "" : `<div class="generated-assets">${generatedAssets.map(generatedAssetHtml).join("")}</div>`}
        ${inAgentTask ? "" : guidedPromptsHtml(activeType, generatedAssets[0]?.id)}
      `;

      chatOutput.append(userTurn, assistantTurn);
      sessionAssets.push(...generatedAssets);
      renderSessionAssets();
      pendingSourceAssetId = "";
      conversationTurnCount += 1;
      agentTurnCounts[activeType] = (agentTurnCounts[activeType] || 0) + 1;
      chatOutput.classList.add("show");
      document.getElementById("followupHint").classList.toggle("show", Boolean(sourceAssetId));
      agentBrowser.style.display = "none";
      emptyHero.style.display = "none";
      promptInput.value = "";
      if (inAgentTask) showTaskResult(response, generatedAssets);
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
      requestAnimationFrame(renderConversationLocator);
      showToast(`${activeAgent} 已完成第 ${conversationTurnCount} 轮结果`);
    }

    const audienceProfileDefaults = {
      "Z世代": { gender:"不限", min:15, max:25 },
      "新锐白领": { gender:"不限", min:25, max:35 },
      "精致妈妈": { gender:"女性", min:25, max:40 },
      "资深中产": { gender:"不限", min:36, max:50 },
      "都市蓝领": { gender:"不限", min:20, max:40 },
      "都市银发": { gender:"不限", min:50, max:80 },
      "小镇青年": { gender:"不限", min:18, max:30 },
      "小镇中老年": { gender:"不限", min:45, max:80 }
    };
    function activateAudienceDefault(name, rewrite = false) {
      const profile = audienceProfileDefaults[name];
      if (!profile) return;
      const genderRow = dynamicForm.querySelector(`[data-role="${rewrite ? "rewrite-gender" : "gender"}"]`);
      const ageRow = dynamicForm.querySelector(`[data-role="${rewrite ? "rewrite-age" : "age"}"]`);
      genderRow?.querySelectorAll(".choice-chip").forEach(item => item.classList.toggle("active", item.textContent.trim() === profile.gender));
      if (genderRow) genderRow.dataset.audienceLockedGender = profile.gender === "女性" ? "女性" : "";
      const customTrigger = ageRow?.querySelector(rewrite ? "[data-rewrite-custom-age-trigger]" : "[data-custom-age-trigger]");
      ageRow?.querySelectorAll(".choice-chip").forEach(item => item.classList.toggle("active", item === customTrigger));
      const customRange = ageRow?.querySelector(rewrite ? "[data-rewrite-custom-age]" : "[data-custom-age]");
      if (customRange) customRange.hidden = false;
      const minInput = ageRow?.querySelector(rewrite ? "[data-rewrite-age-min]" : "[data-age-min]");
      const maxInput = ageRow?.querySelector(rewrite ? "[data-rewrite-age-max]" : "[data-age-max]");
      if (minInput) minInput.value = profile.min;
      if (maxInput) maxInput.value = profile.max;
      if (rewrite) syncRewriteAudienceTarget();
    }

    dynamicForm.addEventListener("click", event => {
      if (event.target.closest("[data-open-creation-product-picker]")) {
        openCreationProductPicker();
        return;
      }
      const rewriteSourceMode = event.target.closest("[data-rewrite-source-mode]");
      if (rewriteSourceMode) {
        const source = dynamicForm.querySelector("[data-rewrite-source]");
        if (source) source.value = rewriteSourceMode.dataset.rewriteSourceMode;
        refreshRewriteSource();
        return;
      }
      const conflictAction = event.target.closest("[data-conflict-action]");
      if (conflictAction) {
        const panel = conflictAction.closest("[data-agent-conflict]");
        const action = conflictAction.dataset.conflictAction;
        if (action === "use-product") {
          dynamicForm.querySelectorAll("input:not([type=hidden]), textarea").forEach(field => {
            field.value = String(field.value || "")
              .replace(/(?:¥|￥)?\s*(199|299)\s*元?/g, "¥399")
              .replace(/全网最低|永久有效|100%除螨|百分百除螨|绝对安全|国家级认证|销量第一|除菌率99\.9%/g, "");
          });
          panel?.remove();
          showToast("已按产品库事实修正冲突内容");
        } else if (action === "modify") {
          const fieldName = panel?.dataset.fieldName;
          (dynamicForm.querySelector(`[data-field="${fieldName}"]`) || dynamicForm.querySelector("textarea, input"))?.focus();
        } else if (action === "update-product") {
          closeModal(true);
          openProductDetail(creationContext.productId || "mite-pro");
          showToast("请先更新产品信息，保存后再返回本次创作");
        }
        return;
      }
      const existingProduct = event.target.closest("[data-use-existing-product]");
      if (existingProduct) {
        applyProductToForm(existingProduct.dataset.useExistingProduct || "mite-pro");
        const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
        if (feedback) {
          feedback.hidden = false;
          feedback.className = "parse-state success";
          feedback.innerHTML = "<strong>已切换</strong><span>已带入产品库中的完整产品信息。</span>";
        }
        return;
      }
      const structureToggle = event.target.closest('[data-action="toggle-copy-structure-picker"]');
      if (structureToggle) {
        const picker = structureToggle.closest("[data-copy-structure-combobox]");
        const willOpen = !picker.classList.contains("open");
        dynamicForm.querySelectorAll("[data-copy-structure-combobox]").forEach(item => item.classList.remove("open"));
        picker.classList.toggle("open", willOpen);
        if (willOpen) {
          const search = picker.querySelector("[data-copy-structure-search]");
          if (search) search.value = "";
          renderCopyStructurePicker();
          search?.focus();
        }
        return;
      }
      const structureOption = event.target.closest("[data-copy-structure-id]");
      if (structureOption) {
        setCopyStructureSelection(structureOption.dataset.copyStructureId || "");
        setFormFeedback(structureOption.dataset.copyStructureId ? `已选择文案结构“${creationContext.originalFields.copyStructure}”。` : "AI将优先匹配当前产品的千川结构。");
        return;
      }
      const singleModelToggle = event.target.closest("[data-single-model-trigger]");
      if (singleModelToggle) {
        singleModelToggle.closest("[data-single-model-picker]")?.classList.toggle("open");
        return;
      }
      const singleModelOption = event.target.closest("[data-single-model-option]");
      if (singleModelOption) {
        const selectedModel = copywritingModelCatalog.find(model => model.value === singleModelOption.dataset.singleModelOption);
        if (!selectedModel) return;
        modelSelect.value = selectedModel.value;
        renderModelPickerOptions();
        renderTaskModelStep();
        singleModelOption.closest("[data-single-model-picker]")?.classList.remove("open");
        showToast(`已切换为 ${selectedModel.label}`);
        return;
      }
      const openStyleEditor = event.target.closest("[data-add-rewrite-style]");
      if (openStyleEditor) {
        const editor = dynamicForm.querySelector("[data-rewrite-style-editor]");
        if (editor) {
          editor.hidden = false;
          editor.querySelector("[data-rewrite-style-input]")?.focus();
        }
        return;
      }
      const cancelStyleEditor = event.target.closest("[data-cancel-rewrite-style]");
      if (cancelStyleEditor) {
        const editor = cancelStyleEditor.closest("[data-rewrite-style-editor]");
        if (editor) {
          editor.hidden = true;
          const input = editor.querySelector("[data-rewrite-style-input]");
          if (input) input.value = "";
        }
        return;
      }
      const saveStyle = event.target.closest("[data-save-rewrite-style]");
      if (saveStyle) {
        const editor = saveStyle.closest("[data-rewrite-style-editor]");
        const input = editor?.querySelector("[data-rewrite-style-input]");
        const value = input?.value.trim() || "";
        if (!value) return showToast("请输入新的表达风格");
        const select = dynamicForm.querySelector("[data-rewrite-style-select]");
        if (![...rewriteBaseStyles, ...rewriteCustomStyles].includes(value)) {
          rewriteCustomStyles.push(value);
          select?.insertAdjacentHTML("beforeend", `<option>${escapeHtml(value)}</option>`);
        }
        if (select) select.value = value;
        editor.hidden = true;
        input.value = "";
        setFormFeedback(`已新增并选择表达风格“${value}”。`);
        showToast("表达风格已添加");
        return;
      }
      const taskModel = event.target.closest("[data-task-model]");
      if (taskModel) {
        modelSelect.value = taskModel.dataset.taskModel;
        renderModelPickerOptions();
        renderTaskModelStep();
        setFormFeedback(`已选择${selectedModelLabel()}。`);
        return;
      }
      const pointAction = event.target.closest("[data-point-action]");
      if (pointAction) {
        const editor = pointAction.closest("[data-point-editor]");
        const action = pointAction.dataset.pointAction;
        const row = pointAction.closest(".point-row");
        const limit = Number(editor?.dataset.limit || 0);
        if (action === "add") {
          const count = editor.querySelectorAll(".point-row").length;
          if (limit && count >= limit) return showToast(`最多添加 ${limit} 条`);
          pointAction.insertAdjacentHTML("beforebegin", pointRowHtml(""));
          pointAction.previousElementSibling?.querySelector("input")?.focus();
        }
        if (action === "remove") {
          if (editor.querySelectorAll(".point-row").length <= 1) row.querySelector("input").value = "";
          else row.remove();
        }
        if (action === "up" && row.previousElementSibling?.classList.contains("point-row")) row.parentElement.insertBefore(row, row.previousElementSibling);
        if (action === "down" && row.nextElementSibling?.classList.contains("point-row")) row.parentElement.insertBefore(row.nextElementSibling, row);
        syncPointEditor(editor);
        creationContext.productConfirmed = false;
        creationContext.productSaved = false;
        updateModalContext();
        return;
      }
      const aiSuggestion = event.target.closest("[data-ai-suggest]");
      if (aiSuggestion) {
        regenerateOriginalSuggestion(aiSuggestion.dataset.aiSuggest, aiSuggestion);
        return;
      }
      const sourceTab = event.target.closest("[data-product-source]");
      if (sourceTab) {
        setProductSource(sourceTab.dataset.productSource);
        return;
      }
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        const action = actionButton.dataset.action;
        if (action === "toggle-reference-library") {
          openReferenceVideoPicker();
        }
        if (action === "toggle-reference-copy-library") openReferenceCopyPicker();
        if (action === "toggle-rewrite-copy-library") openRewriteLibraryPicker();
        if (action === "reset-reference-transcript") resetReferenceTranscript();
        if (action === "toggle-original-advanced") {
          setOriginalAdvanced(!actionButton.classList.contains("active"));
          captureOriginalContext();
        }
        if (action === "analyze-reference") analyzeReference();
        if (action === "recognize-product") recognizeLinkedProduct();
        if (action === "refine-selling-points") refineSellingPoints();
        if (action === "recommend-audience") {
          setActiveAudience(currentProduct().audiences);
          setFormFeedback(`已根据“${currentProduct().name}”推荐目标人群，可继续增删。`);
          showToast("AI推荐人群已更新");
        }
        if (action === "add-audience") {
          const input = dynamicForm.querySelector("[data-custom-audience]");
          const value = input?.value.trim();
          if (!value) {
            setFormFeedback("请输入需要添加的自定义人群。", "error");
          } else {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "audience-chip active";
            button.textContent = value;
            dynamicForm.querySelector("[data-audience-box]")?.append(button);
            input.value = "";
            setFormFeedback(`已添加自定义人群“${value}”。`);
          }
        }
        if (action === "save-preset") saveCreationPreset();
        return;
      }
      const marketingTag = event.target.closest("[data-marketing-value]");
      if (marketingTag) {
        marketingTag.classList.toggle("active");
        const textarea = dynamicForm.querySelector('[data-field="marketing"]');
        const selected = [...dynamicForm.querySelectorAll("[data-marketing-value].active")].map(item => item.dataset.marketingValue);
        if (textarea) textarea.value = selected.join("，");
        setFormFeedback(selected.length ? `已选择营销信息：${selected.join("、")}。` : "已清空营销快捷标签。");
        return;
      }
      const rewriteAudienceChip = event.target.closest(".rewrite-audience-chip");
      if (rewriteAudienceChip) {
        rewriteAudienceChip.closest("[data-rewrite-audience-box]")?.querySelectorAll(".rewrite-audience-chip").forEach(item => item.classList.remove("active"));
        rewriteAudienceChip.classList.add("active");
        activateAudienceDefault(rewriteAudienceChip.textContent.trim(), true);
        syncRewriteAudienceTarget();
        setFormFeedback(`改写后目标人群已切换为“${rewriteAudienceChip.textContent.trim()}”。`);
        return;
      }
      const audienceChip = event.target.closest(".audience-chip");
      if (audienceChip) {
        audienceChip.closest("[data-audience-box]")?.querySelectorAll(".audience-chip").forEach(item => item.classList.remove("active"));
        audienceChip.classList.add("active");
        activateAudienceDefault(audienceChip.textContent.trim(), false);
        setFormFeedback(`目标人群已更新为“${audienceChip.textContent.trim()}”，已初始化对应年龄与性别，可继续自定义年龄区间。`);
        return;
      }
      const uploadBox = event.target.closest(".upload-box");
      if (uploadBox) {
        uploadBox.classList.add("selected");
        uploadBox.innerHTML = uploadBox.matches("[data-reference-upload]")
          ? "<strong>参考视频已上传</strong><span>除螨仪爆款参考_01.mp4 · 已自动识别口播与内容结构</span>"
          : "<strong>已选择素材</strong><span>除螨仪产品参考素材_01 · 可点击重新选择</span>";
        if (uploadBox.matches("[data-reference-upload]")) {
          const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
          if (stepPanel) stepPanel.dataset.referenceReady = "true";
          const feedback = dynamicForm.querySelector("[data-reference-feedback]");
          if (feedback) {
            feedback.hidden = false;
            feedback.innerHTML = "<strong>识别完成</strong><span>已提取参考视频口播、钩子机制、内容结构和表达节奏。</span>";
          }
          showReferenceTranscript("upload", "这不吸真是不知道，家里床垫和沙发看起来很干净，实际还能吸出不少毛发、皮屑和灰尘。轻净 Pro 除螨仪拍打与吸尘同步完成，尘杯可拆下水洗，床垫、沙发和布艺都能使用，日常清洁更省事。");
        }
        setFormFeedback("素材已带入当前任务，生成时将用于锁定主体、场景或镜头逻辑。");
        showToast("素材选择成功");
        return;
      }
      const chip = event.target.closest(".choice-chip");
      if (!chip) return;
      const row = chip.closest(".choice-row");
      if (row?.dataset.single) {
        if ((row.dataset.role === "gender" || row.dataset.role === "rewrite-gender") && row.dataset.audienceLockedGender === "女性" && chip.textContent.trim() !== "女性") {
          showToast("“精致妈妈”的核心性别为女性，不支持改为男性或不限");
          return;
        }
        row.querySelectorAll(".choice-chip").forEach(item => item.classList.remove("active"));
        chip.classList.add("active");
        if (row.dataset.single === "rewrite-method") refreshRewriteSetting();
        if (row.dataset.single === "rewrite-gender" || row.dataset.single === "rewrite-age") syncRewriteAudienceTarget();
        if (row.dataset.role === "script-type") syncCopyStructureByScriptType(chip.textContent.trim());
        if (chip.matches("[data-custom-age-trigger]")) {
          const customAge = row.querySelector("[data-custom-age]");
          if (customAge) customAge.hidden = false;
        } else if (row?.dataset.role === "age") {
          const customAge = row.querySelector("[data-custom-age]");
          if (customAge) customAge.hidden = true;
        }
        if (chip.matches("[data-rewrite-custom-age-trigger]")) {
          const customAge = row.querySelector("[data-rewrite-custom-age]");
          if (customAge) customAge.hidden = false;
        } else if (row?.dataset.role === "rewrite-age") {
          const customAge = row.querySelector("[data-rewrite-custom-age]");
          if (customAge) customAge.hidden = true;
        }
        if (row?.dataset.role === "script-material-mode") return;
        renderMaterialScopeDetail(row, chip.textContent.trim());
        setFormFeedback(`已选择“${chip.textContent.trim()}”。`);
        return;
      }
      const limit = Number(row?.dataset.limit || 0);
      if (!chip.classList.contains("active") && limit && row.querySelectorAll(".choice-chip.active").length >= limit) {
        showToast(`最多选择 ${limit} 项`);
        return;
      }
      chip.classList.toggle("active");
      setFormFeedback(`${chip.textContent.trim()}已${chip.classList.contains("active") ? "选择" : "取消"}。`);
    });

    dynamicForm.addEventListener("input", event => {
      updateAdvancedFooterToggle();
      if (!event.target.matches("[data-product-link]")) return;
      creationContext.productConfirmed = false;
      const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
      if (feedback) {
        feedback.hidden = true;
        feedback.className = "parse-state";
        feedback.innerHTML = "";
      }
    });
    dynamicForm.addEventListener("change", updateAdvancedFooterToggle);
    dynamicForm.addEventListener("click", () => requestAnimationFrame(updateAdvancedFooterToggle));

    dynamicForm.addEventListener("change", event => {
      if (event.target.matches("[data-mode-control]")) refreshConditionalSlots();
      if (event.target.matches("[data-mode-control]")) setFormFeedback(`已切换为“${event.target.options[event.target.selectedIndex].text}”，输入槽位已更新。`);
      if (event.target.matches("[data-reference-source]")) refreshReferenceSource();
      if (event.target.matches("[data-rewrite-source]")) refreshRewriteSource();
      if (event.target.matches("[data-product-select]")) applyProductToForm(event.target.value, true);
      if (event.target.matches("[data-creation-preset]")) applyCreationPreset(event.target.value);
    });

    dynamicForm.addEventListener("input", event => {
      if (event.target.matches("[data-copy-structure-search]")) renderCopyStructurePicker(event.target.value);
      if (event.target.matches("[data-reference-transcript]")) {
        const source = dynamicForm.querySelector("[data-reference-source]")?.value;
        if (referenceTranscriptState[source]) referenceTranscriptState[source].value = event.target.value;
      }
      if (event.target.matches("[data-rewrite-original]")) {
        const source = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
        rewriteSourceState[source] = event.target.value;
      }
      if (event.target.matches("[data-word-count]")) refreshWordDuration(event.target);
      if (event.target.matches("[data-rewrite-age-min], [data-rewrite-age-max]")) syncRewriteAudienceTarget();
      if (event.target.matches("[data-point-value]")) syncPointEditor(event.target.closest("[data-point-editor]"));
      const aiSuggestionType = event.target.closest("[data-point-editor]")?.dataset.pointEditor
        || ({ pain:"pain", scenes:"scene" }[event.target.dataset.field]);
      if (aiSuggestionType) originalSuggestionDirty.add(originalSuggestionKey(aiSuggestionType));
      event.target.closest(".field")?.classList.remove("invalid");
      event.target.closest(".original-field")?.classList.remove("invalid");
      if (isStructuredCopyFlow() && event.target.matches('[data-field="core"], [data-field="secondary"], [data-field="difference"], [data-field="marketing"], [data-field="pain"], [data-field="scenes"], [data-manual-product-name], [data-point-value], [data-original-brand], [data-original-category]')) {
        creationContext.productSaved = false;
        creationContext.productConfirmed = false;
        updateModalContext();
      }
      if (activeType === "copy" && event.target.matches("[data-reference-value]")) {
        const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
        const source = dynamicForm.querySelector("[data-reference-source]")?.value;
        if (stepPanel) stepPanel.dataset.referenceReady = source === "text" && event.target.value.trim() ? "true" : "false";
        const feedback = dynamicForm.querySelector("[data-reference-feedback]");
        if (feedback) feedback.hidden = true;
      }
    });

    dynamicForm.addEventListener("keydown", event => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches(".upload-box")) event.target.click();
    });
    document.addEventListener("click", event => {
      if (!event.target.closest("[data-copy-structure-combobox]")) dynamicForm.querySelectorAll("[data-copy-structure-combobox]").forEach(item => item.classList.remove("open"));
      if (!event.target.closest("[data-single-model-picker]")) dynamicForm.querySelectorAll("[data-single-model-picker]").forEach(item => item.classList.remove("open"));
    });

    saveProductButton.addEventListener("click", saveProductToArchive);
    document.getElementById("confirmCreate").addEventListener("click", () => {
      if (!validateAgentForm()) return;
      showGeneratedResult(true);
    });
    sendPromptButton.addEventListener("click", () => {
      if (!activeAgent) return;
      if (activeType !== "chat" && !taskShell.classList.contains("show")) {
        openAgentTask();
        return;
      }
      if (activeType !== "chat" && !taskCompleted) {
        showToast("请先完成左侧步骤，生成结果后即可继续对话修改。");
        return;
      }
      showGeneratedResult(false);
    });

    newCreateButton.addEventListener("click", event => {
      event.stopPropagation();
      setNewCreateMenu(newCreatePopover.hidden);
    });
    newCreatePopover.querySelector(".new-create-close")?.addEventListener("click", () => setNewCreateMenu(false));
    newCreateOptions.forEach(option => option.addEventListener("click", () => {
      const targetPage = option.dataset.createPage;
      if (targetPage) {
        setNewCreateMenu(false);
        resetCreationWorkspace();
        createSessionSummaryRow(option.querySelector("strong")?.textContent?.trim() || "视频分析");
        switchPage(targetPage);
        return;
      }
      const card = agentCards.find(item => item.dataset.type === option.dataset.createAgentType);
      beginAgentCreation(card);
    }));
    window.addEventListener("resize", positionNewCreatePopover);
    document.querySelector("#page-creation .conversation-panel")?.addEventListener("scroll", positionNewCreatePopover, { passive:true });

    const toast = document.getElementById("toast");
    let toastTimer;
    function showToast(text, actionLabel = "", action = null) {
      toast.textContent = text;
      toast.classList.toggle("has-action", Boolean(actionLabel && action));
      if (actionLabel && action) {
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.textContent = actionLabel;
        actionButton.addEventListener("click", () => {
          clearTimeout(toastTimer);
          toast.classList.remove("show", "has-action");
          action();
        }, { once:true });
        toast.append(actionButton);
      }
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show", "has-action"), actionLabel ? 4200 : 2100);
    }

    function updateAssetCounts() {
      const counts = { copy: 0, script: 0, video: 0, image: 0 };
      sessionAssets.forEach(asset => { counts[asset.type] += 1; });
      document.getElementById("copyAssetCount").textContent = counts.copy;
      document.getElementById("scriptAssetCount").textContent = counts.script;
      document.getElementById("videoAssetCount").textContent = counts.video;
      document.getElementById("imageAssetCount").textContent = counts.image;
      const total = sessionAssets.length;
      document.getElementById("assetPanelCount").textContent = total;
      document.getElementById("assetToggleCount").textContent = total;
    }

    function drawerAssetHtml(asset) {
      const icon = asset.type === "copy" ? "文" : asset.type === "script" ? "脚" : asset.type === "video" ? "视" : "图";
      return `
        <article class="asset-drawer-card" data-asset-id="${asset.id}">
          <button class="asset-drawer-main" data-asset-action="locate" type="button" title="定位到生成该资产的对话">
            <span class="asset-drawer-icon">${icon}</span>
            <span class="asset-drawer-copy">
              <strong>${escapeHtml(asset.title)}</strong>
              <small>第${asset.turnNumber}轮 · ${escapeHtml(asset.meta)}${asset.saved ? " · 已存素材库" : ""}</small>
              <p>${escapeHtml(asset.preview)}</p>
            </span>
          </button>
          <div class="asset-inline-actions">${actionsForAsset(asset)}</div>
          ${asset.type === "video" ? `<div class="video-source-detail">${asset.videoKind === "generated-shot" ? generatedShotDetailHtml(asset) : `${videoScriptDetailHtml(asset)}<p style="margin:8px 0 0;">${escapeHtml(asset.detail || "").replaceAll("\n", "<br>")}</p>`}</div>` : ""}
        </article>
      `;
    }

    function renderSessionAssets() {
      ["copy", "script", "video", "image"].forEach(type => {
        const assets = sessionAssets.filter(asset => asset.type === type);
        const list = document.getElementById(`${type}AssetList`);
        const empty = document.getElementById(`${type}AssetEmpty`);
        list.innerHTML = assets.map(drawerAssetHtml).join("");
        empty.style.display = assets.length ? "none" : "";
      });
      updateAssetCounts();
    }

    function activateAssetType(type) {
      document.querySelectorAll(".asset-type-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.assetType === type);
      });
      document.querySelectorAll(".asset-type-panel").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.assetPanel === type);
      });
    }

    document.querySelectorAll(".asset-type-tab").forEach(tab => {
      tab.addEventListener("click", () => activateAssetType(tab.dataset.assetType));
    });

    modelTrigger.addEventListener("click", event => {
      event.stopPropagation();
      if (modelTrigger.disabled) return;
      setAgentPicker(false);
      setModelPicker(!modelPicker.classList.contains("open"));
    });

    modelOptionList.addEventListener("click", event => {
      const option = event.target.closest(".model-option");
      if (!option) return;
      modelSelect.value = option.dataset.modelValue;
      renderModelPickerOptions();
      renderTaskModelStep();
      setModelPicker(false);
      showToast(`已切换为 ${selectedModelLabel()}`);
    });

    document.addEventListener("click", event => {
      if (!modelPicker.contains(event.target)) setModelPicker(false);
      if (!agentPicker.contains(event.target)) setAgentPicker(false);
      if (!newCreatePopover.contains(event.target) && event.target !== newCreateButton) setNewCreateMenu(false);
    });

    modelSelect.addEventListener("change", () => {
      renderModelPickerOptions();
      showToast(`已切换为 ${selectedModelLabel()}`);
    });

    function getSessionAsset(id) {
      return sessionAssets.find(asset => asset.id === id);
    }

    function locateAssetMessage(asset) {
      setAssetPanel(false);
      const message = document.getElementById(asset.messageId);
      if (!message) return;
      message.scrollIntoView({ behavior: "smooth", block: "center" });
      message.classList.remove("located");
      requestAnimationFrame(() => message.classList.add("located"));
      setTimeout(() => message.classList.remove("located"), 1700);
    }

    function runAgentWithAsset(type, prompt, asset) {
      if (type === "chat") {
        switchPage("creation");
        selectChat();
        pendingSourceAssetId = asset?.id || "";
        promptInput.value = prompt;
        showGeneratedResult(false);
        return;
      }
      const card = agentCards.find(item => item.dataset.type === type);
      if (!card) return;
      switchPage("creation");
      selectAgent(card, false);
      pendingSourceAssetId = asset?.id || "";
      promptInput.value = prompt;
      showGeneratedResult(false);
    }

    function syncSavedState(asset) {
      document.querySelectorAll(`[data-asset-id="${asset.id}"] .action-library`).forEach(button => {
        button.textContent = button.classList.contains("copy-result-action") ? "✓ 已保存" : "已存素材库";
        button.classList.add("saved");
      });
    }

    function handleAssetAction(action, asset, trigger) {
      if (!asset) return;
      if (action === "locate") {
        locateAssetMessage(asset);
        return;
      }
      if (action === "library") {
        asset.saved = true;
        syncSavedState(asset);
        renderSessionAssets();
        showToast(`已保存到${asset.type === "video" ? "视频库" : asset.type === "image" ? "图片库" : "文案库"}`);
        return;
      }
      if (action === "rename-copy") {
        const title = trigger.closest(".original-copy-heading")?.querySelector(".original-copy-title");
        if (!title || title.isContentEditable) return;
        const original = asset.title;
        title.contentEditable = "true";
        title.classList.add("is-editing");
        title.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(title);
        selection.removeAllRanges();
        selection.addRange(range);
        let finished = false;
        const finish = save => {
          if (finished) return;
          finished = true;
          const value = title.textContent.trim();
          asset.title = save && value ? value : original;
          title.textContent = asset.title;
          title.contentEditable = "false";
          title.classList.remove("is-editing");
          renderSessionAssets();
          if (save && value) showToast("文案标题已更新");
        };
        title.addEventListener("keydown", event => {
          if (event.key === "Enter") { event.preventDefault(); finish(true); }
          if (event.key === "Escape") { event.preventDefault(); finish(false); }
        });
        title.addEventListener("blur", () => finish(true), { once:true });
        return;
      }
      if (action === "edit-copy") {
        const card = trigger.closest(".original-copy-card");
        if (!card) return;
        card.classList.add("is-editing");
        const editor = card.querySelector(".original-copy-editor textarea");
        editor.value = asset.preview;
        editor.focus();
        return;
      }
      if (action === "cancel-copy-edit") {
        trigger.closest(".original-copy-card")?.classList.remove("is-editing");
        return;
      }
      if (action === "save-copy-edit") {
        const card = trigger.closest(".original-copy-card");
        const editor = card?.querySelector(".original-copy-editor textarea");
        const value = editor?.value.trim();
        if (!value) return showToast("文案内容不能为空");
        asset.preview = value;
        asset.wordCount = value.replace(/\s/g, "").length;
        renderOriginalTaskResult();
        renderSessionAssets();
        showToast(asset.saved ? "修改已同步至文案库" : "文案修改已保存到当前会话");
        return;
      }
      if (action === "chat-edit") {
        originalCopyTargetId = asset.id;
        pendingSourceAssetId = asset.id;
        renderOriginalTaskResult();
        syncTaskChatTarget();
        document.getElementById("taskChatSubtitle").textContent = `正在修改：${asset.title}`;
        promptInput.value = "";
        promptInput.placeholder = `描述对“${asset.title}”的修改要求`;
        promptInput.focus();
        showToast("已将该文案设为当前对话修改对象");
        return;
      }
      if (action === "to-script") {
        if (trigger.closest(".original-copy-card")) {
          const card = agentCards.find(item => item.dataset.type === "script");
          pendingSourceAssetId = asset.id;
          promptInput.value = `把“${asset.title}”转成结构化脚本，包含完整口播、分镜描述和混剪指令。`;
          selectAgent(card, true);
          showToast("已带入当前文案，进入智能脚本");
          return;
        }
        runAgentWithAsset("script", `把“${asset.title}”转成30秒结构化脚本，包含口播、分镜描述和混剪指令。`, asset);
        return;
      }
      if (action === "to-mix") {
        if (trigger.closest(".original-copy-card")) {
          const card = agentCards.find(item => item.dataset.type === "mix");
          pendingSourceAssetId = asset.id;
          promptInput.value = `使用“${asset.title}”智能补齐结构化脚本并完成混剪。`;
          selectAgent(card, true);
          showToast("已带入当前文案，进入智能混剪");
          return;
        }
        runAgentWithAsset("mix", `使用“${asset.title}”匹配素材并生成可终审成片。`, asset);
        return;
      }
      if (action === "similar") {
        const nextType = asset.type === "script" ? asset.sourceType : asset.sourceType || "original";
        runAgentWithAsset(nextType, `沿用“${asset.title}”的创作策略，再生成一组不同表达。`, asset);
        return;
      }
      if (action === "edit-script") {
        const type = asset.sourceType === "script-copy" ? "script-copy" : "script";
        const card = agentCards.find(item => item.dataset.type === type);
        selectAgent(card, false);
        pendingSourceAssetId = asset.id;
        promptInput.value = "请修改这份脚本的指定分镜，其他口播和镜头任务保持不变：";
        promptInput.focus();
        showToast("已带入脚本，可继续描述需要修改的分镜");
        return;
      }
      if (action === "use-in-mix") {
        asset.saved = true;
        syncSavedState(asset);
        renderSessionAssets();
        showToast("已保存到视频库，并加入智能混剪素材候选");
        return;
      }
      if (action === "view-script") {
        const card = trigger.closest(".generated-asset, .asset-drawer-card");
        card?.classList.toggle("show-detail");
        return;
      }
      if (action === "remix") {
        runAgentWithAsset("mix", `保留“${asset.title}”的脚本，只替换前3秒镜头并重新混剪。`, asset);
        return;
      }
      if (action === "submit") {
        showToast("已进入人工终审，确认后将提交千川提审");
        return;
      }
      if (action === "copy") {
        navigator.clipboard?.writeText(asset.preview);
        showToast("文案已复制");
        return;
      }
      if (action === "delete") {
        sessionAssets = sessionAssets.filter(item => item.id !== asset.id);
        document.querySelectorAll(`[data-asset-id="${asset.id}"]`).forEach(card => card.remove());
        renderSessionAssets();
        showToast("已从当前会话移除该文案");
        return;
      }
      showToast("已带入当前资产，可继续创作");
    }

    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-asset-action]");
      if (!trigger) return;
      const card = trigger.closest("[data-asset-id]");
      handleAssetAction(trigger.dataset.assetAction, getSessionAsset(card?.dataset.assetId), trigger);
    });

    taskResultHost.addEventListener("click", event => {
      const playButton = event.target.closest("[data-mix-result-play]");
      if (playButton) {
        const playing = playButton.classList.toggle("playing");
        playButton.textContent = playing ? "■" : "▶";
        taskResultHost.querySelector(".mix-video-stage")?.classList.toggle("playing", playing);
        showToast(playing ? "正在播放成片预览" : "已暂停预览");
        return;
      }
      const seek = event.target.closest("[data-mix-seek]");
      if (seek) {
        taskResultHost.querySelectorAll("[data-mix-seek]").forEach(button => button.classList.toggle("active", button === seek));
        const time = taskResultHost.querySelector("[data-mix-player-time]");
        if (time) time.textContent = seek.dataset.mixSeek;
        showToast(`已定位到 ${seek.dataset.mixSeek} · ${seek.firstChild?.textContent?.trim() || "当前片段"}`);
        return;
      }
      const mixAction = event.target.closest("[data-mix-result-action]");
      if (mixAction) {
        const action = mixAction.dataset.mixResultAction;
        if (action === "back-script" || action === "remix") {
          setTaskStep(3);
          if (action === "remix") {
            const row = dynamicForm.querySelector('[data-mix-script-row="2"]');
            const body = row?.querySelector(".mix-script-body");
            if (body) body.hidden = false;
            const toggle = row?.querySelector("[data-mix-toggle-row]");
            if (toggle) toggle.textContent = "收起";
            showToast("已返回产品演示段，可替换素材后重新生成");
          }
          return;
        }
        if (action === "save") {
          mixAction.textContent = "✓ 已保存到成片视频库";
          mixAction.disabled = true;
          showToast("已保存到资产库 · 视频库 · 成片视频");
          return;
        }
        if (action === "download") {
          mixAction.textContent = "正在准备…";
          mixAction.disabled = true;
          setTimeout(() => {
            mixAction.textContent = "下载视频";
            mixAction.disabled = false;
            showToast("成片导出任务已创建，可在下载中心查看");
          }, 700);
          return;
        }
      }
      const continueButton = event.target.closest("[data-original-continue]");
      if (continueButton) {
        appendOriginalCopyBatch(continueButton);
        return;
      }
      const menuTrigger = event.target.closest("[data-original-create-trigger]");
      if (menuTrigger) {
        event.stopPropagation();
        const menu = menuTrigger.closest(".original-create-menu");
        taskResultHost.querySelectorAll(".original-create-menu.open").forEach(item => {
          if (item !== menu) item.classList.remove("open");
        });
        menu.classList.toggle("open");
        return;
      }
      if (!event.target.closest(".original-create-menu")) {
        taskResultHost.querySelectorAll(".original-create-menu.open").forEach(item => item.classList.remove("open"));
      }
    });

    taskResultHost.addEventListener("input", event => {
      if (!event.target.matches(".original-copy-editor textarea")) return;
      const card = event.target.closest(".original-copy-card");
      const wordCount = event.target.value.replace(/\s/g, "").length;
      const duration = Math.max(1, Math.round(wordCount / 4));
      const meta = card?.querySelector(".original-copy-meta span");
      if (meta) meta.textContent = `${wordCount} 字 · 预计口播约 ${duration} 秒`;
    });

    document.addEventListener("click", event => {
      if (event.target.closest(".original-create-menu")) return;
      taskResultHost.querySelectorAll(".original-create-menu.open").forEach(item => item.classList.remove("open"));
    });

    chatOutput.addEventListener("scroll", updateConversationLocator, { passive: true });

    chatOutput.addEventListener("click", event => {
      const promptButton = event.target.closest(".guided-prompt");
      if (!promptButton) return;
      const sourceAssetId = promptButton.closest(".guided-prompts")?.dataset.sourceAssetId;
      runAgentWithAsset(promptButton.dataset.nextType, promptButton.dataset.guidedPrompt, getSessionAsset(sourceAssetId));
    });

    document.querySelectorAll(".goto-creation").forEach(button => {
      button.addEventListener("click", () => {
        switchPage("creation");
        const copyCard = agentCards.find(card => card.dataset.type === "copy");
        selectAgent(copyCard, false);
        promptInput.value = "参考刚才的拉片结果，为轻净 Pro 除螨仪生成三条原创仿写文案。";
        showToast("已带入拉片结果和参考视频");
      });
    });

    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const parent = tab.parentElement;
        parent.querySelectorAll(".tab").forEach(item => item.classList.remove("active"));
        tab.classList.add("active");
        if (parent.id === "libraryTabs") showToast(`已切换至${tab.textContent}`);
      });
    });

    document.getElementById("assetSearch").addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      document.querySelectorAll("#assetGrid .library-card").forEach(card => {
        card.style.display = card.dataset.search.toLowerCase().includes(keyword) ? "block" : "none";
      });
    });

    document.querySelectorAll(".creator-assign").forEach(button => {
      button.addEventListener("click", () => {
        button.textContent = "已分配";
        button.disabled = true;
        showToast("已按品类和当前负载分配给商务 BD");
      });
    });

    /* 品牌库：列表、详情与增删改查 */
    const brandCatalog = {
      qingjing: { name:"轻净", foundedYear:"2020", intro:"面向精致家庭的专业清洁电器品牌，用可验证的清洁效果降低家庭清洁焦虑。", position:"家庭深层清洁专家", tone:"专业、直接、可信；少用文学化表达，强调真实使用结果。", forbidden:"行业第一\n绝对除螨\n永久有效\n全网最低价", logo:"轻", logoClass:"", products:12 },
      jingjie: { name:"净界", foundedYear:"2018", intro:"通过智能清洁科技缩短家务链路，让复杂地面清洁变得简单高效。", position:"智能地面清洁解决方案品牌", tone:"科技、高效、克制；优先解释功能与使用收益。", forbidden:"彻底无菌\n零噪音\n全网第一", logo:"净", logoClass:"green", products:8 },
      qingxiang: { name:"轻享", foundedYear:"2021", intro:"服务年轻家庭的轻量厨房电器品牌，让日常烹饪更直观、更轻松。", position:"年轻家庭轻量厨房电器品牌", tone:"轻松、亲切、生活化；避免制造过度焦虑。", forbidden:"绝对健康\n零油脂\n永久不粘", logo:"享", logoClass:"orange", products:10 }
    };
    let currentBrandId = "qingjing";
    let brandLogoReady = false;
    let newBrandLogoData = "";
    const brandCreateModal = document.getElementById("brandCreateModal");
    const brandGrid = document.getElementById("brandMarketGrid");
    const deleteEntityModal = document.getElementById("deleteEntityModal");
    let pendingEntityDelete = null;
    function closeCardMenus(except = null) {
      document.querySelectorAll(".card-menu-wrap.open").forEach(menu => { if (menu !== except) menu.classList.remove("open"); });
    }
    function renderBrandLogo(element, brand) {
      if (!element || !brand) return;
      element.innerHTML = brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo || brand.name.slice(0,1));
    }
    function closeEntityDelete() { deleteEntityModal?.classList.remove("show"); pendingEntityDelete = null; }
    function requestEntityDelete(type, id, element) {
      const item = type === "brand" ? brandCatalog[id] : productDetailData[id];
      if (!item) return;
      pendingEntityDelete = { type, id, element };
      document.getElementById("deleteEntityTitle").textContent = `删除${type === "brand" ? "品牌" : "产品"}“${item.name}”？`;
      document.getElementById("deleteEntityCopy").textContent = type === "brand"
        ? "删除后无法恢复，品牌关联产品及已生成内容资产不会被删除；关联产品将暂时失去品牌策略约束。"
        : "删除后无法恢复，产品关联的文案、图片、脚本和视频资产不会被删除。";
      deleteEntityModal?.classList.add("show");
    }
    document.querySelectorAll("[data-close-entity-delete]").forEach(button => button.addEventListener("click", closeEntityDelete));
    deleteEntityModal?.addEventListener("click", event => { if (event.target === deleteEntityModal) closeEntityDelete(); });
    document.getElementById("confirmEntityDelete")?.addEventListener("click", () => {
      if (!pendingEntityDelete) return closeEntityDelete();
      const { type, id, element } = pendingEntityDelete;
      if (type === "brand") {
        const deletedBrandName = brandCatalog[id]?.name || "";
        Object.values(productDetailData || {}).forEach(product => {
          if (product.brand === deletedBrandName) product.brand = "";
        });
        element?.remove();
        delete brandCatalog[id];
        if (document.getElementById("page-brand-detail")?.classList.contains("active")) switchPage("brands");
        showToast("品牌已删除，原关联产品已转为无品牌产品");
      } else {
        const deletedProduct = productDetailData[id];
        window.deletedProductSnapshots = window.deletedProductSnapshots || [];
        if (deletedProduct) window.deletedProductSnapshots.push({ id, name:deletedProduct.name, deletedAt:new Date().toISOString() });
        element?.remove();
        delete productDetailData[id];
        if (typeof productCatalog !== "undefined") delete productCatalog[id];
        document.querySelectorAll(`select[data-product-select] option[value="${id}"], select[data-product-library] option[value="${id}"]`).forEach(option => option.remove());
        if (document.getElementById("page-product-detail")?.classList.contains("active")) switchPage("products");
        showToast("产品已删除；关联资产已保留，产品关联已解除");
      }
      window.syncBrandCardCounts?.();
      closeEntityDelete();
    });
    function setBrandDetail(id) {
      const brand = brandCatalog[id];
      if (!brand) return;
      currentBrandId = id;
      document.getElementById("brandDetailLogo").className = `brand-detail-logo ${brand.logoClass || ""}`;
      renderBrandLogo(document.getElementById("brandDetailLogo"), brand);
      renderBrandLogo(document.getElementById("brandLogoThumb"), brand);
      document.getElementById("brandDetailName").textContent = brand.name;
      document.getElementById("brandDetailIntro").textContent = brand.intro;
      document.querySelectorAll("#page-brand-detail [data-brand-field]").forEach(field => {
        const key = field.dataset.brandField;
        if (key === "logo") return;
        const value = brand[key] || "";
        const view = field.querySelector(".brand-value");
        const input = field.querySelector("input, textarea");
        if (view) view.textContent = value;
        if (input) input.value = value;
        field.classList.remove("is-editing");
        const edit = field.querySelector(".brand-field-edit");
        if (edit) edit.textContent = "编辑";
      });
      switchPage("brand-detail");
    }
    brandGrid?.addEventListener("click", event => {
      const card = event.target.closest("[data-brand-id]");
      if (!card) return;
      const menuTrigger = event.target.closest("[data-toggle-card-menu]");
      if (menuTrigger) {
        event.stopPropagation();
        const menu = menuTrigger.closest(".card-menu-wrap");
        const opening = !menu.classList.contains("open");
        closeCardMenus(menu);
        menu.classList.toggle("open", opening);
        return;
      }
      if (event.target.closest("[data-delete-brand]")) {
        event.stopPropagation();
        closeCardMenus();
        requestEntityDelete("brand", card.dataset.brandId, card);
        return;
      }
      setBrandDetail(card.dataset.brandId);
    });
    brandGrid?.addEventListener("keydown", event => { if (event.key === "Enter" && event.target.matches("[data-brand-id]")) setBrandDetail(event.target.dataset.brandId); });
    document.querySelectorAll("[data-back-brands]").forEach(button => button.addEventListener("click", () => switchPage("brands")));
    document.querySelector("[data-delete-current-brand]")?.addEventListener("click", () => requestEntityDelete("brand", currentBrandId, brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"]`)));
    document.querySelectorAll("[data-open-brand-create]").forEach(button => button.addEventListener("click", () => { brandLogoReady = false; newBrandLogoData = ""; document.getElementById("brandLogoCreateFile").value = ""; document.getElementById("brandLogoUpload").classList.remove("has-image"); document.getElementById("brandLogoUpload").textContent = "点击上传品牌 Logo"; brandCreateModal?.classList.add("show"); }));
    document.getElementById("quickCreateBrand")?.addEventListener("click", () => {
      window.pendingProductBrandInput = document.querySelector('[data-product-create-panel="manual"] input[list="productBrandOptions"]');
      document.querySelector("[data-close-product-modal]")?.click();
      brandLogoReady = false; newBrandLogoData = "";
      document.getElementById("brandLogoUpload").classList.remove("has-image");
      document.getElementById("brandLogoUpload").textContent = "点击上传品牌 Logo";
      brandCreateModal?.classList.add("show");
    });
    document.querySelectorAll("[data-close-brand-create]").forEach(button => button.addEventListener("click", () => {
      brandCreateModal?.classList.remove("show");
      if (window.pendingProductBrandInput) {
        window.pendingProductBrandInput = null;
        productCreateModal?.classList.add("show");
      }
    }));
    document.getElementById("brandLogoUpload")?.addEventListener("click", () => document.getElementById("brandLogoCreateFile")?.click());
    document.getElementById("brandLogoCreateFile")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { newBrandLogoData = reader.result; brandLogoReady = true; document.getElementById("brandLogoUpload").classList.add("has-image"); document.getElementById("brandLogoUpload").textContent = `已选择：${file.name} · 点击可重新选择`; };
      reader.readAsDataURL(file);
    });
    const brandDetailLogoFile = document.getElementById("brandDetailLogoFile");
    document.querySelector("#page-brand-detail [data-brand-logo-upload]")?.addEventListener("click", () => brandDetailLogoFile?.click());
    brandDetailLogoFile?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file || !brandCatalog[currentBrandId]) return;
      const reader = new FileReader();
      reader.onload = () => {
        brandCatalog[currentBrandId].logoData = reader.result;
        renderBrandLogo(document.getElementById("brandDetailLogo"), brandCatalog[currentBrandId]);
        renderBrandLogo(document.getElementById("brandLogoThumb"), brandCatalog[currentBrandId]);
        const cardLogo = brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"] .brand-card-logo`);
        renderBrandLogo(cardLogo, brandCatalog[currentBrandId]);
        showToast("品牌 Logo 已替换");
      };
      reader.readAsDataURL(file);
    });
    document.querySelectorAll("#page-brand-detail .brand-field-edit").forEach(button => button.addEventListener("click", () => {
      const field = button.closest(".brand-field");
      if (field.dataset.brandField === "logo") { brandDetailLogoFile?.click(); return; }
      const editing = field.classList.toggle("is-editing");
      button.textContent = editing ? "完成" : "编辑";
      if (editing) { field.querySelector("input, textarea")?.focus(); return; }
      const key = field.dataset.brandField;
      if (key !== "logo") {
        const input = field.querySelector("input, textarea");
        const value = input?.value.trim() || "";
        if (key === "name") {
          const normalizedName = value.replace(/\s+/g, "").toLowerCase();
          const conflict = Object.entries(brandCatalog).find(([id, item]) => id !== currentBrandId && String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedName);
          if (conflict) {
            field.classList.add("is-editing");
            button.textContent = "完成";
            input?.focus();
            showToast(`品牌“${conflict[1].name}”已存在，名称未保存`);
            return;
          }
        }
        if (key === "foundedYear" && value && (Number(value) < 1800 || Number(value) > 2026)) {
          field.classList.add("is-editing");
          button.textContent = "完成";
          input?.focus();
          showToast("品牌成立年份需填写 1800—2026 之间的年份");
          return;
        }
        field.querySelector(".brand-value").textContent = value;
        if (brandCatalog[currentBrandId]) brandCatalog[currentBrandId][key] = value;
        if (key === "name") document.getElementById("brandDetailName").textContent = value;
        if (key === "intro") document.getElementById("brandDetailIntro").textContent = value;
      }
      const card = brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"]`);
      if (card && brandCatalog[currentBrandId]) {
        card.querySelector("h3").textContent = brandCatalog[currentBrandId].name;
        card.querySelector(".brand-card-desc").textContent = brandCatalog[currentBrandId].intro;
      }
      showToast("品牌信息已保存，并同步至创作上下文");
    }));
    function createBrandCard(id, brand) {
      const card = document.createElement("article");
      card.className = "brand-market-card";
      card.tabIndex = 0;
      card.dataset.brandId = id;
      const tags = brand.tone.split(/[、，；;]/).map(item => item.trim()).filter(Boolean).slice(0,3);
      card.innerHTML = `<span class="card-menu-wrap"><button class="card-menu-trigger" type="button" data-toggle-card-menu aria-label="品牌操作">···</button><span class="card-action-menu" role="menu"><button type="button" data-delete-brand>删除</button></span></span><div class="brand-card-top"><div class="brand-card-logo">${brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo)}</div><div><h3>${escapeHtml(brand.name)}</h3><small>新建品牌</small></div></div><p class="brand-card-desc">${escapeHtml(brand.intro)}</p><div class="brand-card-foot"><span>关联产品 0</span><span>刚刚创建</span></div>`;
      return card;
    }
    document.getElementById("saveBrandEntry")?.addEventListener("click", () => {
      const name = document.getElementById("brandFormName")?.value.trim();
      const foundedYear = document.getElementById("brandFormFoundedYear")?.value.trim() || "";
      const intro = document.getElementById("brandFormIntro")?.value.trim();
      const position = document.getElementById("brandFormPosition")?.value.trim();
      const tone = document.getElementById("brandFormTone")?.value.trim();
      const forbidden = document.getElementById("brandFormForbidden")?.value.trim() || "";
      if (!brandLogoReady || !name || !intro || !position || !tone) return showToast("请补全标记 * 的品牌信息");
      if (foundedYear && (Number(foundedYear) < 1800 || Number(foundedYear) > 2026)) return showToast("品牌成立年份需填写 1800—2026 之间的年份");
      const normalizedName = name.replace(/\s+/g, "").toLowerCase();
      const duplicateBrand = Object.values(brandCatalog).find(item => String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedName);
      if (duplicateBrand) {
        document.getElementById("brandFormName")?.focus();
        return showToast(`品牌“${duplicateBrand.name}”已存在，不能重复创建`);
      }
      const id = `brand-${Date.now()}`;
      const brand = { name, foundedYear, intro, position, tone, forbidden, logo:name.slice(0,1), logoData:newBrandLogoData, logoClass:"", products:0 };
      brandCatalog[id] = brand;
      brandGrid?.append(createBrandCard(id, brand));
      window.syncBrandCardCounts?.();
      const brandOptions = document.getElementById("productBrandOptions");
      if (brandOptions && ![...brandOptions.options].some(option => option.value === name)) brandOptions.append(new Option("", name));
      if (window.pendingProductBrandInput) {
        window.pendingProductBrandInput.value = name;
        window.pendingProductBrandInput = null;
        productCreateModal?.classList.add("show");
      }
      brandCreateModal?.classList.remove("show");
      showToast("品牌已新增，可进入详情继续维护品牌策略");
    });
    document.getElementById("brandSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => card.hidden = !card.textContent.toLowerCase().includes(keyword));
    });

    const productCreateModal = document.getElementById("productCreateModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const productPlatforms = ["抖音", "快手", "视频号", "小红书", "百度", "天猫", "京东", "拼多多"];
    const productDetailData = {
      "mite-pro": { id:"mite-pro", name:"轻净 Pro 除螨仪", brand:"轻净", category:"清洁电器", price:"¥399", currencyCode:"CNY", links:[{ platform:"抖音", url:"https://shop.example.com/mite-pro" },{ platform:"天猫", url:"https://tmall.example.com/mite-pro" }], description:"产品型号：QJ-CM01\n额定功率：400W\n尘杯容量：0.5L\n产品净重：1.42kg\n产品尺寸：268×198×142mm\n电源方式：有线 220V\n包装清单：主机、滤芯×2、说明书\n售后说明：整机质保 1 年", core:"12kPa 大吸力深入床褥纤维\n高频拍打与吸尘同步完成\n透明尘杯让清洁效果可视化\n双层过滤，减少二次扬尘", secondary:"床褥、抱枕和毛绒玩具均可使用\n电源线满足卧室日常清洁范围\n收纳体积小，不占家庭空间", difference:"清洁结果可直接在透明尘杯中看到\n拍、吸、滤一体完成深层清洁\n围绕家庭高频软装场景设计", trust:"整机质保 1 年，售后信息可追溯\n产品参数及包装清单均可核验\n官方渠道销售，支持正品验证\n透明尘杯可直接展示清洁结果\n核心功能均有实拍素材证明", forbidden:"百分百除螨、彻底杀灭\n全网最低价、史上最低\n未经资质支持的除菌率\n永久有效、一次使用终身无螨\n无法证明的竞品对比结论" },
      "air-a8": { id:"air-a8", name:"轻享空气炸锅 A8", brand:"轻享", category:"厨房电器", price:"¥299", currencyCode:"CNY", links:[{ platform:"抖音", url:"https://shop.example.com/air-a8" }], description:"产品型号：A8\n容量：5L\n控制方式：触控\n可视窗口：支持", core:"可视化烹饪窗口\n大容量满足家庭用餐", secondary:"炸篮可拆卸清洗", difference:"烹饪过程看得见，减少反复开盖", trust:"产品参数及包装清单可核验", forbidden:"零油脂\n绝对健康" },
      "washer-s5": { id:"washer-s5", name:"净界洗地机 S5", brand:"净界", category:"清洁电器", price:"¥1,599", currencyCode:"CNY", links:[{ platform:"天猫", url:"https://shop.example.com/washer-s5" }], description:"产品型号：S5\n清洁方式：吸拖洗一体\n滚刷：支持自清洁", core:"吸拖洗一体\n干湿垃圾同步处理", secondary:"滚刷自清洁", difference:"一次推进完成复杂地面清洁", trust:"官方渠道销售，售后信息可追溯", forbidden:"彻底无菌\n零噪音" },
      "blend-mini": { id:"blend-mini", name:"随行榨汁杯 Mini", brand:"轻享", category:"厨房电器", price:"¥169", currencyCode:"CNY", links:[{ platform:"拼多多", url:"https://shop.example.com/blend-mini" }], description:"容量：350ml\n充电方式：USB-C\n杯体材质：食品接触级材质", core:"便携榨汁\n一键清洗", secondary:"轻巧杯身便于携带", difference:"杯体与主机一体化设计", trust:"材质及产品参数可核验", forbidden:"绝对无菌\n永久锋利" }
    };
    let currentProductDetailId = "mite-pro";
    function toggleProductModal(modal, show) { modal?.classList.toggle("show", show); }
    function detectProductPlatform(url = "") {
      const value = String(url).toLowerCase();
      if (/douyin|jinritemai|抖音/.test(value)) return "抖音";
      if (/kuaishou|快手/.test(value)) return "快手";
      if (/weixin|wechat|channels|视频号/.test(value)) return "视频号";
      if (/xiaohongshu|xhslink|小红书/.test(value)) return "小红书";
      if (/baidu|百度/.test(value)) return "百度";
      if (/tmall|taobao|天猫/.test(value)) return "天猫";
      if (/jd\.com|jingdong|京东/.test(value)) return "京东";
      if (/pinduoduo|yangkeduo|拼多多/.test(value)) return "拼多多";
      return productPlatforms[0];
    }
    function productLinksOf(product) {
      if (Array.isArray(product?.links)) return product.links;
      return product?.link ? [{ platform:detectProductPlatform(product.link), url:product.link }] : [];
    }
    function syncProductToCreationSelectors(id, name) {
      document.querySelectorAll("select[data-product-select], select[data-product-library]").forEach(select => {
        if (![...select.options].some(option => option.value === id)) select.append(new Option(name, id));
      });
    }
    function platformOptionsMarkup(selected = "") {
      return productPlatforms.map(name => `<option${name === selected ? " selected" : ""}>${escapeHtml(name)}</option>`).join("");
    }
    function createProductLinkRow(container, link = {}) {
      if (!container) return null;
      const row = document.createElement("div");
      row.className = "product-link-row";
      row.innerHTML = `<select aria-label="商品平台">${platformOptionsMarkup(link.platform || productPlatforms[0])}</select><input type="url" aria-label="商品链接" placeholder="粘贴商品链接" value="${escapeHtml(link.url || "")}"><button class="product-link-remove" type="button" aria-label="删除链接">×</button>`;
      row.querySelector(".product-link-remove").addEventListener("click", () => row.remove());
      container.append(row);
      return row;
    }
    function readProductLinkRows(container) {
      const rows = [...(container?.querySelectorAll(".product-link-row") || [])].map(row => ({ platform:row.querySelector("select")?.value.trim() || "", url:row.querySelector("input")?.value.trim() || "" }));
      const incomplete = rows.some(item => (item.platform || item.url) && !(item.platform && item.url));
      const links = rows.filter(item => item.platform && item.url);
      const invalid = links.some(item => !/^https?:\/\/\S+$/i.test(item.url));
      const duplicate = links.some((item, index) => links.findIndex(other => other.url.toLowerCase() === item.url.toLowerCase()) !== index);
      return { links, incomplete, invalid, duplicate };
    }
    function addProductPlatform(name, targetSelect = null) {
      const value = String(name || "").trim();
      if (!value) { showToast("请输入平台名称"); return false; }
      const existing = productPlatforms.find(item => item.toLowerCase() === value.toLowerCase());
      if (existing) { showToast(`平台“${existing}”已存在`); return false; }
      productPlatforms.push(value);
      document.querySelectorAll(".product-link-row select").forEach(select => select.append(new Option(value, value)));
      if (targetSelect) targetSelect.value = value;
      showToast(`已新增平台“${value}”`);
      return true;
    }
    function renderProductDetailContent(detail) {
      document.querySelectorAll("#page-product-detail [data-product-content]").forEach(surface => {
        const value = detail[surface.dataset.productContent] || "";
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        const list = surface.querySelector(".editable-view");
        const textarea = surface.querySelector("textarea");
        const count = surface.querySelector(".multi-info-head small");
        if (list) list.innerHTML = lines.length ? lines.map(line => `<li>${escapeHtml(line)}</li>`).join("") : '<li class="product-link-empty">暂未填写</li>';
        if (textarea) textarea.value = value;
        if (count) count.textContent = lines.length;
        surface.classList.remove("is-editing");
        const edit = surface.querySelector("[data-inline-edit]");
        if (edit) edit.textContent = "编辑";
      });
      if (productDescriptionSource) productDescriptionSource.value = detail.description || "";
      originalDescription = detail.description || "";
      if (typeof parseDescriptionText === "function") parseDescriptionText();
    }
    function renderProductDetailLinks(detail) {
      const list = document.getElementById("productDetailLinkList");
      const editor = document.getElementById("productDetailLinkRows");
      const links = productLinksOf(detail);
      if (list) list.innerHTML = links.length ? links.map(link => `<span class="product-detail-link-item"><b>${escapeHtml(link.platform)}</b><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url)}</a></span>`).join("") : '<span class="product-link-empty">暂未添加商品链接</span>';
      if (editor) { editor.innerHTML = ""; links.forEach(link => createProductLinkRow(editor, link)); }
      document.getElementById("productDetailLinkSurface")?.classList.remove("is-editing");
      document.getElementById("detailPlatformCreateLine")?.classList.remove("show");
      const action = document.getElementById("editDetailLinks");
      if (action) action.textContent = "编辑";
    }
    const productCreateLinkRows = document.getElementById("productCreateLinkRows");
    createProductLinkRow(productCreateLinkRows);
    function resetProductCreateForm() {
      ["productFormName","productFormBrand","productFormPrice","productFormDescription","productFormCore","productFormSecondary","productFormDifference","productFormTrust","productFormForbidden"].forEach(id => { const field = document.getElementById(id); if (field) field.value = ""; });
      const category = document.getElementById("productCategorySelect");
      if (category) category.selectedIndex = 0;
      const currency = document.getElementById("productCurrencySelect");
      if (currency) currency.value = "CNY";
      const upload = document.querySelector("[data-product-upload]");
      if (upload) { delete upload.dataset.ready; upload.textContent = "点击上传产品图片，或拖拽图片至此"; }
      if (productCreateLinkRows) { productCreateLinkRows.innerHTML = ""; createProductLinkRow(productCreateLinkRows); }
      document.getElementById("platformCreateLine")?.classList.remove("show");
    }
    document.querySelectorAll("[data-open-product-create]").forEach(button => button.addEventListener("click", () => { resetProductCreateForm(); toggleProductModal(productCreateModal, true); }));
    document.querySelectorAll("[data-close-product-modal]").forEach(button => button.addEventListener("click", () => toggleProductModal(productCreateModal, false)));
    function openProductDetail(productId) {
      const detail = productDetailData[productId] || productDetailData["mite-pro"];
      currentProductDetailId = productDetailData[productId] ? productId : "mite-pro";
      document.getElementById("pageDetailName").textContent = detail.name;
      document.getElementById("pageDetailBrand").textContent = detail.brand;
      document.getElementById("pageDetailCategory").textContent = detail.category;
      document.getElementById("pageDetailPrice").textContent = detail.price;
      const compactFields = [...document.querySelectorAll("#page-product-detail .compact-kv")];
      const detailCurrency = detail.currencyCode || "CNY";
      [detail.name, detail.brand, detail.category, `${detail.price} ${detailCurrency}`].forEach((value, index) => {
        const field = compactFields[index];
        if (!field) return;
        const view = field.querySelector(".compact-value");
        const input = field.querySelector(".editable-editor input");
        if (view) view.textContent = value;
        if (input) input.value = index === 3 ? detail.price.replace(/[^\d.]/g, "") : value;
        if (index === 3) {
          const select = field.querySelector(".editable-editor select");
          if (select) select.value = detailCurrency;
        }
      });
      renderProductDetailLinks(detail);
      renderProductDetailContent(detail);
      switchPage("product-detail");
    }
    document.getElementById("productMarketGrid")?.addEventListener("click", event => {
      const menuTrigger = event.target.closest("[data-toggle-card-menu]");
      if (menuTrigger) {
        event.preventDefault();
        event.stopPropagation();
        const menu = menuTrigger.closest(".card-menu-wrap");
        const opening = !menu.classList.contains("open");
        closeCardMenus(menu);
        menu.classList.toggle("open", opening);
        return;
      }
      const trigger = event.target.closest("[data-delete-product]");
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      closeCardMenus();
      const card = trigger.closest("[data-product-id]");
      if (card) requestEntityDelete("product", card.dataset.productId, card);
    }, true);
    document.querySelector("[data-delete-current-product]")?.addEventListener("click", () => requestEntityDelete("product", currentProductDetailId, document.querySelector(`#productMarketGrid [data-product-id="${currentProductDetailId}"]`)));
    document.querySelectorAll("[data-open-product-detail]").forEach(button => button.addEventListener("click", () => openProductDetail(button.dataset.productId)));
    document.querySelectorAll("[data-close-product-detail]").forEach(button => button.addEventListener("click", () => toggleProductModal(productDetailModal, false)));
    document.querySelectorAll("[data-product-create-mode]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-create-mode]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-create-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productCreatePanel === button.dataset.productCreateMode));
    }));
    document.querySelector("[data-product-upload]")?.addEventListener("click", event => { event.currentTarget.dataset.ready = "true"; event.currentTarget.textContent = "已选择：产品主图_01.png · 点击可重新选择"; showToast("产品图片已添加"); });
    document.getElementById("addProductLinkRow")?.addEventListener("click", () => createProductLinkRow(productCreateLinkRows));
    document.getElementById("showPlatformCreate")?.addEventListener("click", () => { document.getElementById("platformCreateLine")?.classList.add("show"); document.getElementById("newPlatformName")?.focus(); });
    document.getElementById("cancelPlatformCreate")?.addEventListener("click", () => { document.getElementById("platformCreateLine")?.classList.remove("show"); document.getElementById("newPlatformName").value = ""; });
    document.getElementById("confirmPlatformCreate")?.addEventListener("click", () => {
      const input = document.getElementById("newPlatformName");
      const lastSelect = productCreateLinkRows?.querySelector(".product-link-row:last-child select");
      if (!addProductPlatform(input?.value, lastSelect)) return;
      input.value = "";
      document.getElementById("platformCreateLine")?.classList.remove("show");
      if (!lastSelect) createProductLinkRow(productCreateLinkRows, { platform:productPlatforms.at(-1) });
    });
    document.getElementById("editDetailLinks")?.addEventListener("click", () => {
      const surface = document.getElementById("productDetailLinkSurface");
      if (!surface) return;
      if (!surface.classList.contains("is-editing")) {
        renderProductDetailLinks(productDetailData[currentProductDetailId]);
        surface.classList.add("is-editing");
        document.getElementById("editDetailLinks").textContent = "完成";
        return;
      }
      const result = readProductLinkRows(document.getElementById("productDetailLinkRows"));
      if (result.incomplete) return showToast("每条商品链接都需要选择平台并填写链接");
      if (result.invalid) return showToast("请填写以 http:// 或 https:// 开头的有效链接");
      if (result.duplicate) return showToast("相同商品链接不能重复添加");
      const conflict = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && productLinksOf(product).some(old => result.links.some(link => old.url.toLowerCase() === link.url.toLowerCase())));
      if (conflict) return showToast(`链接已关联产品“${conflict[1].name}”，不能重复绑定`);
      productDetailData[currentProductDetailId].links = result.links;
      delete productDetailData[currentProductDetailId].link;
      renderProductDetailLinks(productDetailData[currentProductDetailId]);
      showToast("商品链接已保存");
    });
    document.getElementById("cancelDetailLinks")?.addEventListener("click", () => renderProductDetailLinks(productDetailData[currentProductDetailId]));
    document.getElementById("addDetailProductLink")?.addEventListener("click", () => createProductLinkRow(document.getElementById("productDetailLinkRows")));
    document.getElementById("showDetailPlatformCreate")?.addEventListener("click", () => { document.getElementById("detailPlatformCreateLine")?.classList.add("show"); document.getElementById("detailPlatformName")?.focus(); });
    document.getElementById("cancelDetailPlatform")?.addEventListener("click", () => { document.getElementById("detailPlatformCreateLine")?.classList.remove("show"); document.getElementById("detailPlatformName").value = ""; });
    document.getElementById("confirmDetailPlatform")?.addEventListener("click", () => {
      const input = document.getElementById("detailPlatformName");
      const rows = document.getElementById("productDetailLinkRows");
      let lastSelect = rows?.querySelector(".product-link-row:last-child select");
      if (!lastSelect) lastSelect = createProductLinkRow(rows)?.querySelector("select");
      if (!addProductPlatform(input?.value, lastSelect)) return;
      input.value = "";
      document.getElementById("detailPlatformCreateLine")?.classList.remove("show");
    });
    document.getElementById("addCategoryButton")?.addEventListener("click", () => document.getElementById("addCategoryInput").classList.toggle("show"));
    document.getElementById("confirmCategoryButton")?.addEventListener("click", () => {
      const input = document.querySelector("#addCategoryInput input");
      const name = input?.value.trim();
      if (!name) return showToast("请输入类目名称");
      const option = new Option(name, name, true, true);
      document.getElementById("productCategorySelect").add(option);
      input.value = "";
      document.getElementById("addCategoryInput").classList.remove("show");
      showToast(`已新增类目“${name}”`);
    });
    function makeParsingProductCard(name, productId, link = "", category = "商品解析中") {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "product-market-card is-parsing";
      card.dataset.productId = productId;
      card.dataset.productLink = link;
      card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="parse-state parsing"><strong>正在解析</strong><span>识别产品信息中…</span></div><div class="product-market-assets"><span>文案 —</span><span>脚本 —</span><span>素材 —</span><span>视频 —</span></div></div>`;
      card.addEventListener("click", () => showToast("产品信息正在解析中，完成后可查看详情"));
      const finishParsing = () => setTimeout(() => {
        const lowerLink = link.toLowerCase();
        if (lowerLink.includes("fail")) {
          card.classList.remove("is-parsing");
          card.innerHTML = `<div class="product-market-image blend"><span class="image-label">解析失败</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="parse-state failed"><strong>解析失败</strong><span>链接无法访问</span><button type="button" data-retry-product-parse>重试</button></div></div>`;
          card.onclick = event => { event.preventDefault(); if (!event.target.closest("[data-retry-product-parse]")) return; card.classList.add("is-parsing"); card.querySelector(".parse-state").className = "parse-state parsing"; card.querySelector(".parse-state").innerHTML = "<strong>正在重试</strong><span>再次读取商品信息…</span>"; link = link.replace(/fail/ig, "retry"); finishParsing(); };
          return;
        }
        card.classList.remove("is-parsing");
        const partial = lowerLink.includes("partial");
        card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${partial ? "待补充" : "厨房电器"}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div>${partial ? '<div class="parse-state partial"><strong>部分完成</strong><span>品牌、类目待补充</span></div>' : '<div class="parse-state success"><strong>解析完成</strong><span>产品信息已识别</span></div>'}<div class="product-market-price-row"><div class="product-market-price"><small>¥</small>199</div><small class="asset-card-audit" title="最近修改：嗡大发 · 08/11 10:26">嗡大发 · 08/11 10:26</small></div><div class="product-market-assets"><span>文案 0</span><span>脚本 0</span><span>素材 0</span><span>视频 0</span></div></div>`;
        productDetailData[productId] = { id:productId, name, brand:partial ? "" : "已识别品牌", category:partial ? "" : "厨房电器", price:"¥199", currencyCode:"CNY", links:[{ platform:detectProductPlatform(link), url:link }], description:"商品链接解析生成，产品参数待确认", core:"核心卖点待确认", secondary:"", difference:"", trust:"", forbidden:"" };
        productCatalog[productId] = { name, core:"核心卖点待确认", secondary:"", difference:"", audiences:[], psychology:[], facts:"已通过商品链接解析，缺失字段需人工确认" };
        syncProductToCreationSelectors(productId, name);
        card.replaceWith(card.cloneNode(true));
        const readyCard = document.querySelector(`[data-product-id="${productId}"]`);
        readyCard?.addEventListener("click", () => openProductDetail(productId));
        showToast(partial ? `“${name}”部分解析完成，请补充缺失信息` : `“${name}”解析完成`);
      }, 1800);
      finishParsing();
      return card;
    }
    function confirmSuspectedProduct(existingName, newName) {
      return new Promise(resolve => {
        let modal = document.getElementById("suspectedProductModal");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "suspectedProductModal";
          modal.className = "modal-backdrop";
          modal.innerHTML = `<div class="modal" style="max-width:500px"><div class="modal-head"><div><span class="badge orange">疑似重复</span><h3>确认是否继续新增</h3></div></div><div class="modal-body"><div class="session-delete-copy" data-suspected-product-copy></div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-suspected-cancel>取消</button><button class="primary-btn" type="button" data-suspected-confirm>仍然新增</button></div></div>`;
          document.body.append(modal);
        }
        modal.querySelector("[data-suspected-product-copy]").textContent = `新产品“${newName}”与已有产品“${existingName}”名称相近。请确认它们是否为不同产品。`;
        modal.classList.add("show");
        const finish = value => { modal.classList.remove("show"); modal.onclick = null; resolve(value); };
        modal.onclick = event => {
          if (event.target === modal || event.target.closest("[data-suspected-cancel]")) finish(false);
          if (event.target.closest("[data-suspected-confirm]")) finish(true);
        };
      });
    }
    document.getElementById("saveProductEntry")?.addEventListener("click", async () => {
      const mode = document.querySelector("[data-product-create-mode].active")?.dataset.productCreateMode;
      const productGrid = document.getElementById("productMarketGrid");
      if (mode === "batch") {
        const links = document.querySelector("[data-product-create-panel='batch'] textarea")?.value.trim().split(/\n+/).filter(Boolean) || [];
        if (!links.length) return showToast("请至少输入一条商品链接");
        const uniqueLinks = [...new Set(links)];
        const invalidLinks = uniqueLinks.filter(link => !/^https?:\/\/\S+$/i.test(link));
        const validLinks = uniqueLinks.filter(link => /^https?:\/\/\S+$/i.test(link));
        const existingLinks = new Set(Object.values(productDetailData).flatMap(item => productLinksOf(item).map(link => link.url.toLowerCase())));
        const conflicts = validLinks.filter(link => existingLinks.has(link.toLowerCase()));
        const creatable = validLinks.filter(link => !existingLinks.has(link.toLowerCase()));
        if (!creatable.length) return showToast(invalidLinks.length ? "没有可解析的有效商品链接" : "链接对应的产品已存在，未重复创建");
        creatable.forEach((link, index) => productGrid.append(makeParsingProductCard(`新链接产品 ${index + 1}`, `parsing-product-${Date.now()}-${index}`, link)));
        toggleProductModal(productCreateModal, false);
        showToast(`已新增 ${creatable.length} 个产品并开始解析${conflicts.length ? `；跳过 ${conflicts.length} 条重复链接` : ""}${invalidLinks.length ? `；忽略 ${invalidLinks.length} 条无效链接` : ""}`);
        return;
      }
      const manualPanel = document.querySelector("[data-product-create-panel='manual']");
      const name = document.getElementById("productFormName")?.value.trim();
      const brand = document.getElementById("productFormBrand")?.value.trim();
      const priceValue = document.getElementById("productFormPrice")?.value.trim();
      const description = document.getElementById("productFormDescription")?.value.trim() || "";
      const core = document.getElementById("productFormCore")?.value.trim();
      const secondary = document.getElementById("productFormSecondary")?.value.trim() || "";
      const difference = document.getElementById("productFormDifference")?.value.trim() || "";
      const trust = document.getElementById("productFormTrust")?.value.trim() || "";
      const forbidden = document.getElementById("productFormForbidden")?.value.trim() || "";
      const hasImage = manualPanel.querySelector("[data-product-upload]")?.dataset.ready === "true";
      if (!name || !brand || !priceValue || !core || !hasImage || !document.getElementById("productCategorySelect")?.value || document.getElementById("productCategorySelect")?.value === "请选择类目") return showToast("请补全标记 * 的产品信息");
      const linkResult = readProductLinkRows(productCreateLinkRows);
      if (linkResult.incomplete) return showToast("每条商品链接都需要选择平台并填写链接");
      if (linkResult.invalid) return showToast("请填写以 http:// 或 https:// 开头的有效链接");
      if (linkResult.duplicate) return showToast("相同商品链接不能重复添加");
      const normalizedProductName = name.replace(/\s+/g, "").toLowerCase();
      const exactProduct = Object.values(productDetailData).find(item => productLinksOf(item).some(old => linkResult.links.some(link => old.url.toLowerCase() === link.url.toLowerCase())) || (String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedProductName && item.brand === brand));
      if (exactProduct) return showToast(`产品“${exactProduct.name}”已存在，不能重复创建`);
      const suspected = Object.values(productDetailData).find(item => String(item.name || "").replace(/\s+/g, "").toLowerCase().includes(normalizedProductName.slice(0, Math.max(3, normalizedProductName.length - 2))));
      if (suspected && !(await confirmSuspectedProduct(suspected.name, name))) return;
      const id = `manual-product-${Date.now()}`;
      const price = priceValue;
      const currencySelect = document.getElementById("productCurrencySelect");
      const currencyCode = currencySelect?.value || "CNY";
      const currencySymbol = currencySelect?.selectedOptions[0]?.dataset.symbol || "¥";
      const category = document.getElementById("productCategorySelect")?.value || "未填写类目";
      const manualCard = document.createElement("button");
      manualCard.type = "button";
      manualCard.className = "product-market-card";
      manualCard.dataset.productId = id;
      manualCard.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image"><span class="image-label">${escapeHtml(category)}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="product-market-price-row"><div class="product-market-price"><small>${currencySymbol}</small>${escapeHtml(price)}</div><small class="asset-card-audit" title="最近修改：嗡大发 · 08/11 10:26">嗡大发 · 08/11 10:26</small></div><div class="product-market-assets"><span>文案 0</span><span>脚本 0</span><span>素材 0</span><span>视频 0</span></div></div>`;
      productDetailData[id] = { id, name, brand, category, price:`${currencySymbol}${price}`, currencyCode, links:linkResult.links, description, core, secondary, difference, trust, forbidden };
      productCatalog[id] = { name, core:core.split(/\n+/)[0] || core, secondary:secondary.split(/\n+/)[0] || "", difference:difference.split(/\n+/)[0] || "", audiences:[], psychology:[], facts:`已读取产品档案、${linkResult.links.length} 条商品链接和禁用表达` };
      syncProductToCreationSelectors(id, name);
      manualCard.addEventListener("click", () => openProductDetail(id));
      productGrid.append(manualCard);
      toggleProductModal(productCreateModal, false);
      showToast("产品已新增，可进入详情继续补充信息");
    });
    const productSearch = document.querySelector("#page-products .product-page-actions .search");
    const productCategoryFilter = document.querySelector("#page-products .product-page-actions .filter-select");
    function filterProductCards() {
      const keyword = productSearch?.value.trim().toLowerCase() || "";
      const category = productCategoryFilter?.value || "全部类目";
      document.querySelectorAll("#productMarketGrid .product-market-card").forEach(card => {
        const text = card.textContent.toLowerCase();
        const visible = (!keyword || text.includes(keyword)) && (category === "全部类目" || text.includes(category));
        card.hidden = !visible;
      });
    }
    productSearch?.addEventListener("input", filterProductCards);
    productCategoryFilter?.addEventListener("change", filterProductCards);
    document.querySelectorAll("[data-relation-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-relation-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-relation-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.relationPanel === button.dataset.relationTab));
    }));
    document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.toast)));
    document.querySelectorAll("[data-open-product-creation]").forEach(button => button.addEventListener("click", () => { toggleProductModal(productDetailModal, false); switchPage("creation"); showToast("已带入当前产品，可选择 Agent 开始创作"); }));
    document.querySelectorAll("[data-back-products]").forEach(button => button.addEventListener("click", () => switchPage("products")));
    document.querySelectorAll("[data-save-product-detail]").forEach(button => button.addEventListener("click", () => showToast("产品信息已保存")));
    function createScenarioGroup(audience = "新增目标人群", scenes = []) {
      const group = document.createElement("article");
      group.className = "scenario-group";
      group.dataset.scenarioGroup = "";
      const tags = scenes.map(scene => `<span class="scenario-tag">${scene}</span>`).join("");
      group.innerHTML = `<div class="scenario-display"><div class="scenario-audience">${audience}</div><div class="scenario-tag-list">${tags || '<span class="scenario-tag">待补充场景</span>'}</div></div><div class="scenario-edit-form"><label>目标人群</label><input value="${audience}"><label>使用场景</label><textarea placeholder="一行一个使用场景">${scenes.join("\n")}</textarea></div><button class="scenario-edit-action" type="button" data-edit-scenario>编辑</button>`;
      bindScenarioGroup(group);
      return group;
    }
    function bindScenarioGroup(group) {
      const action = group.querySelector("[data-edit-scenario]");
      const audienceInput = group.querySelector(".scenario-edit-form input");
      const scenesInput = group.querySelector(".scenario-edit-form textarea");
      const renderDisplay = () => {
        group.querySelector(".scenario-audience").textContent = audienceInput.value.trim() || "未命名人群";
        const sceneNames = scenesInput.value.split(/\n+/).map(scene => scene.trim()).filter(Boolean);
        group.querySelector(".scenario-tag-list").innerHTML = sceneNames.length ? sceneNames.map(scene => `<span class="scenario-tag">${scene}</span>`).join("") : '<span class="scenario-tag">待补充场景</span>';
      };
      action.addEventListener("click", () => {
        const editing = group.classList.toggle("is-editing");
        action.textContent = editing ? "保存" : "编辑";
        if (editing) audienceInput.focus();
        else { renderDisplay(); showToast("人群与使用场景已保存"); }
      });
    }
    document.querySelectorAll("[data-scenario-group]").forEach(bindScenarioGroup);
    document.querySelectorAll("[data-add-scenario]").forEach(button => button.addEventListener("click", () => {
      const group = createScenarioGroup();
      button.previousElementSibling.append(group);
      group.classList.add("is-editing");
      group.querySelector("[data-edit-scenario]").textContent = "保存";
      group.querySelector(".scenario-edit-form input").focus();
      showToast("已新增一组人群与使用场景，请补充后保存");
    }));

    function prepareDetailEditable(container) {
      if (!container || container.dataset.editReady) return;
      const fields = container.matches(".field, .scenario-row") ? [container] : [...container.querySelectorAll(".field, .scenario-row")];
      fields.forEach(field => {
        if (field.dataset.editReady) return;
        field.dataset.editReady = "true";
        field.classList.add("detail-editable");
        const controls = [...field.querySelectorAll("input, textarea, select")];
        controls.forEach(control => {
          if (control.tagName === "SELECT") control.disabled = true;
          else control.readOnly = true;
        });
        const action = document.createElement("button");
        action.type = "button";
        action.className = "detail-edit-action";
        action.textContent = "编辑";
        action.addEventListener("click", () => {
          const editing = field.classList.toggle("is-editing");
          controls.forEach(control => {
            if (control.tagName === "SELECT") control.disabled = !editing;
            else control.readOnly = !editing;
          });
          action.textContent = editing ? "保存" : "编辑";
          if (!editing) showToast("修改已保存");
        });
        field.append(action);
      });
    }
    prepareDetailEditable(document.getElementById("page-product-detail"));

    document.querySelectorAll("[data-product-asset-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-asset-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-asset-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productAssetPanel === button.dataset.productAssetTab));
    }));
    document.querySelectorAll("[data-template-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-template-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-template-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.templatePanel === button.dataset.templateTab));
    }));

    function surfaceEditorValue(surface) {
      const priceField = surface.querySelector(".editable-editor .price-field");
      if (priceField) {
        const amount = priceField.querySelector("input")?.value.trim() || "0";
        const select = priceField.querySelector("select");
        const symbol = select?.selectedOptions[0]?.dataset.symbol || "¥";
        return `${symbol}${amount} ${select?.value || "CNY"}`;
      }
      const editor = surface.querySelector(".editable-editor input, .editable-editor textarea");
      return editor ? editor.value : "";
    }
    function syncEditableSurface(surface) {
      const value = surfaceEditorValue(surface);
      const view = surface.querySelector(".editable-view");
      if (!view) return;
      if (view.classList.contains("bullet-list")) {
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        view.innerHTML = lines.map(line => `<li>${escapeHtml(line)}</li>`).join("");
        const count = surface.querySelector(".multi-info-head small");
        if (count) count.textContent = lines.length;
      } else if (view.classList.contains("description-lines")) {
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        view.innerHTML = lines.map(line => {
          const splitAt = line.search(/[：:]/);
          const label = splitAt > -1 ? line.slice(0, splitAt) : "补充信息";
          const content = splitAt > -1 ? line.slice(splitAt + 1).trim() : line;
          return `<span><b>${escapeHtml(label)}</b>${escapeHtml(content)}</span>`;
        }).join("");
      } else {
        view.textContent = value;
      }
      if (surface.classList.contains("compact-kv")) {
        const label = surface.querySelector(":scope > label")?.textContent.trim();
        const targetId = label === "产品名称" ? "pageDetailName" : label === "品牌" ? "pageDetailBrand" : label === "类目" ? "pageDetailCategory" : label === "价格" ? "pageDetailPrice" : "";
        if (targetId) document.getElementById(targetId).textContent = label === "价格" ? value.replace(/\s+[A-Z]{3}$/i, "") : value;
      }
    }
    document.querySelectorAll("#page-product-detail [data-inline-edit]").forEach(button => button.addEventListener("click", async () => {
      const surface = button.closest(".editable-surface");
      if (!surface) return;
      const editing = surface.classList.toggle("is-editing");
      button.textContent = editing ? "完成" : "编辑";
      if (editing) {
        surface.dataset.originalValue = surfaceEditorValue(surface);
        const select = surface.querySelector(".editable-editor select");
        if (select) surface.dataset.originalSelect = select.value;
        surface.querySelector(".editable-editor input, .editable-editor textarea")?.focus();
      } else {
        const label = surface.querySelector(":scope > label")?.textContent.trim();
        const nextValue = surfaceEditorValue(surface).trim();
        if (label === "商品链接") {
          const exact = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && product.link === nextValue);
          if (exact) {
            surface.classList.add("is-editing");
            button.textContent = "完成";
            surface.querySelector("input")?.focus();
            showToast(`该链接已关联产品“${exact[1].name}”，不能重复绑定`);
            return;
          }
          const nextPath = nextValue.split(/[?#]/)[0].replace(/\/$/, "").split("/").pop();
          const suspected = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && nextPath && product.link?.includes(nextPath));
          if (suspected && !(await confirmSuspectedProduct(suspected[1].name, productDetailData[currentProductDetailId]?.name || "当前产品"))) {
            surface.classList.add("is-editing");
            button.textContent = "完成";
            return;
          }
        }
        syncEditableSurface(surface);
        const product = productDetailData[currentProductDetailId];
        if (product) {
          if (label === "产品名称") product.name = nextValue;
          if (label === "品牌") product.brand = nextValue;
          if (label === "类目") product.category = nextValue;
          if (label === "价格") {
            product.price = nextValue.replace(/\s+[A-Z]{3}$/i, "");
            product.currencyCode = surface.querySelector("select")?.value || product.currencyCode || "CNY";
          }
          if (surface.dataset.productContent) product[surface.dataset.productContent] = nextValue;
          if (productCatalog[currentProductDetailId]) {
            productCatalog[currentProductDetailId].name = product.name;
            productCatalog[currentProductDetailId].core = String(product.core || "").split(/\n+/)[0] || "";
            productCatalog[currentProductDetailId].secondary = String(product.secondary || "").split(/\n+/)[0] || "";
            productCatalog[currentProductDetailId].difference = String(product.difference || "").split(/\n+/)[0] || "";
          }
          const card = document.querySelector(`#productMarketGrid [data-product-id="${currentProductDetailId}"]`);
          if (label === "产品名称") {
            const cardTitle = card?.querySelector(".product-market-title strong");
            if (cardTitle) cardTitle.textContent = product.name;
            document.querySelectorAll(`select[data-product-select] option[value="${currentProductDetailId}"], select[data-product-library] option[value="${currentProductDetailId}"]`).forEach(option => option.textContent = product.name);
          }
          if (label === "类目") { const categoryLabel = card?.querySelector(".image-label"); if (categoryLabel) categoryLabel.textContent = product.category; }
          if (label === "价格") { const cardPrice = card?.querySelector(".product-market-price"); if (cardPrice) cardPrice.textContent = product.price; }
        }
        showToast("修改已保存，并同步至对应资产库");
      }
    }));
    document.querySelectorAll("#page-product-detail [data-cancel-inline]").forEach(button => button.addEventListener("click", () => {
      const surface = button.closest(".editable-surface");
      if (!surface) return;
      const editor = surface.querySelector(".editable-editor input, .editable-editor textarea");
      const priceField = surface.querySelector(".editable-editor .price-field");
      if (editor && surface.dataset.originalValue !== undefined) {
        editor.value = priceField ? surface.dataset.originalValue.replace(/^\D*|\s+[A-Z]{3}$/g, "") : surface.dataset.originalValue;
      }
      const select = surface.querySelector(".editable-editor select");
      if (select && surface.dataset.originalSelect) select.value = surface.dataset.originalSelect;
      surface.classList.remove("is-editing");
      const edit = surface.querySelector("[data-inline-edit]");
      if (edit) edit.textContent = "编辑";
    }));
    document.querySelectorAll("#page-product-detail [data-toggle-asset-edit]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-inline-asset]");
      if (!card) return;
      if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
      const editing = card.classList.toggle("is-editing");
      button.textContent = editing ? "收起编辑" : button.dataset.defaultText;
    }));
    function inlineAssetValue(line) {
      const splitAt = line.search(/[：:]/);
      return (splitAt > -1 ? line.slice(splitAt + 1) : line).trim();
    }
    function syncInlineAsset(card) {
      const editor = card.querySelector(".asset-inline-editor textarea");
      if (!editor) return;
      const lines = editor.value.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const imageCopy = card.querySelector(".asset-image-preview .preview-copy");
      if (imageCopy) {
        const title = inlineAssetValue(lines[0] || "未命名图片");
        const subtitle = inlineAssetValue(lines[1] || "");
        imageCopy.innerHTML = `${escapeHtml(title)}${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}`;
      }
      const materialCaption = card.classList.contains("material-card") ? card.querySelector(".video-caption") : null;
      if (materialCaption && lines[0]) materialCaption.textContent = inlineAssetValue(lines[0]);
      const scriptRows = [...card.querySelectorAll(".script-row:not(.header)")];
      if (scriptRows.length) {
        lines.slice(0, scriptRows.length).forEach((line, index) => {
          const parts = line.split("｜");
          const cells = scriptRows[index].children;
          if (cells[0] && parts[0]) cells[0].textContent = parts[0].trim();
          if (cells[1] && parts[1]) cells[1].textContent = inlineAssetValue(parts[1]);
          if (cells[2] && parts[2]) cells[2].textContent = inlineAssetValue(parts[2]);
        });
      }
      const videoTitle = card.querySelector(".asset-content-head strong");
      const videoCaption = card.querySelector(".video-stage .video-caption");
      if (videoTitle && videoCaption && !card.classList.contains("material-card") && !scriptRows.length) {
        if (lines[0]) videoTitle.textContent = inlineAssetValue(lines[0]);
        if (lines[1]) videoCaption.textContent = inlineAssetValue(lines[1]);
      }
    }
    document.querySelectorAll("#page-product-detail [data-save-asset]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-inline-asset]");
      if (card) syncInlineAsset(card);
      card?.classList.remove("is-editing");
      const edit = card?.querySelector("[data-toggle-asset-edit]");
      if (edit) edit.textContent = edit.dataset.defaultText || "编辑";
      showToast("资产修改已保存，并同步至对应资产库");
    }));

    const productDescription = document.getElementById("productDescription");
    const productDescriptionSource = document.getElementById("productDescriptionSource");
    const descriptionParamList = document.getElementById("descriptionParamList");
    let originalDescription = productDescriptionSource?.value || "";
    function addDescriptionParamRow(name = "", value = "") {
      const row = document.createElement("div");
      row.className = "description-param-row";
      row.innerHTML = `<input aria-label="参数名称" placeholder="参数名称" value="${escapeHtml(name)}"><input aria-label="参数值" placeholder="参数值" value="${escapeHtml(value)}"><button type="button" data-remove-description-param aria-label="删除参数">×</button>`;
      descriptionParamList.append(row);
    }
    function parseDescriptionText() {
      descriptionParamList.innerHTML = "";
      const lines = productDescriptionSource.value.split(/\n+/).map(line => line.trim()).filter(Boolean);
      lines.forEach(line => {
        const splitAt = line.search(/[：:]/);
        addDescriptionParamRow(splitAt > -1 ? line.slice(0, splitAt).trim() : "补充信息", splitAt > -1 ? line.slice(splitAt + 1).trim() : line);
      });
      if (!lines.length) addDescriptionParamRow();
    }
    document.getElementById("editDescription")?.addEventListener("click", event => {
      const editing = productDescription.classList.toggle("is-editing");
      event.currentTarget.textContent = editing ? "完成" : "编辑";
      productDescriptionSource.readOnly = !editing;
      if (editing) {
        originalDescription = productDescriptionSource.value;
        parseDescriptionText();
        productDescriptionSource.focus();
      } else {
        const rows = [...descriptionParamList.querySelectorAll(".description-param-row")];
        productDescriptionSource.value = rows.map(row => {
          const inputs = row.querySelectorAll("input");
          return inputs[0].value.trim() && inputs[1].value.trim() ? `${inputs[0].value.trim()}：${inputs[1].value.trim()}` : "";
        }).filter(Boolean).join("\n");
        if (productDetailData[currentProductDetailId]) productDetailData[currentProductDetailId].description = productDescriptionSource.value;
        showToast("商品描述已保存，并同步至创作上下文");
      }
    });
    document.getElementById("cancelDescriptionEdit")?.addEventListener("click", () => {
      productDescriptionSource.value = originalDescription;
      productDescriptionSource.readOnly = true;
      productDescription.classList.remove("is-editing");
      document.getElementById("editDescription").textContent = "编辑";
    });
    document.getElementById("parseDescription")?.addEventListener("click", () => { parseDescriptionText(); showToast("已重新解析商品参数"); });
    document.getElementById("addDescriptionParam")?.addEventListener("click", () => {
      addDescriptionParamRow();
      descriptionParamList.lastElementChild?.querySelector("input")?.focus();
    });
    descriptionParamList?.addEventListener("click", event => {
      const remove = event.target.closest("[data-remove-description-param]");
      if (remove) remove.closest(".description-param-row")?.remove();
    });

    document.querySelectorAll("[data-prompt-agent]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-prompt-agent]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-prompt-agent-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.promptAgentPanel === button.dataset.promptAgent));
    }));

    const imageZoomModal = document.getElementById("imageZoomModal");
    const imageZoomHost = document.getElementById("imageZoomHost");
    document.querySelectorAll("[data-image-zoom]").forEach(preview => preview.addEventListener("click", () => {
      imageZoomHost.innerHTML = "";
      const copy = preview.cloneNode(true);
      copy.removeAttribute("data-image-zoom");
      imageZoomHost.append(copy);
      document.getElementById("imageZoomTitle").textContent = preview.closest(".asset-content-card")?.querySelector(".asset-content-head strong")?.textContent || "图片预览";
      imageZoomModal.classList.add("show");
    }));
    document.getElementById("closeImageZoom")?.addEventListener("click", () => imageZoomModal.classList.remove("show"));
    imageZoomModal?.addEventListener("click", event => { if (event.target === imageZoomModal) imageZoomModal.classList.remove("show"); });

    document.querySelectorAll(".video-more-button").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const wrap = button.closest(".video-more-wrap");
      document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.toggle("open", item === wrap && !item.classList.contains("open")));
    }));
    document.querySelectorAll("[data-open-video-analysis]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.remove("open"));
      switchPage("pull");
      showToast("已进入该素材的视频分析详情");
    }));

    const sessionList = document.querySelector("#page-creation .chat-list");
    const sessionDeleteModal = document.getElementById("sessionDeleteModal");
    let pendingDeleteSession = null;
    function sessionMenuMarkup() {
      return '<button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>';
    }
    function createSessionSummaryRow(title) {
      sessionList.querySelectorAll(".chat-row").forEach(row => row.classList.remove("active", "menu-open"));
      const row = document.createElement("div");
      row.className = "chat-row active";
      row.dataset.sessionId = `session-${Date.now()}-${sessionList.children.length + 1}`;
      row.innerHTML = `<strong>${escapeHtml(title)}</strong>${sessionMenuMarkup()}`;
      sessionList.prepend(row);
      return row;
    }
    function closeSessionMenus(except = null) {
      sessionList.querySelectorAll(".chat-row.menu-open").forEach(row => {
        if (row !== except) row.classList.remove("menu-open");
      });
    }
    function startSessionRename(row) {
      const title = row.querySelector("strong");
      if (!title || title.isContentEditable) return;
      row.classList.remove("menu-open");
      const original = title.textContent;
      title.contentEditable = "true";
      title.classList.add("session-title-editing");
      let finished = false;
      const finish = save => {
        if (finished) return;
        finished = true;
        const nextTitle = title.textContent.trim();
        if (save && nextTitle) {
          title.textContent = nextTitle;
          if (row.classList.contains("active")) syncTaskChatTitle();
          showToast("会话已重命名");
        } else {
          title.textContent = original;
        }
        title.contentEditable = "false";
        title.classList.remove("session-title-editing");
      };
      title.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); finish(true); }
        if (event.key === "Escape") { event.preventDefault(); finish(false); }
      });
      title.addEventListener("blur", () => finish(true), { once:true });
      title.focus();
      const range = document.createRange();
      range.selectNodeContents(title);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    sessionList?.addEventListener("click", event => {
      const row = event.target.closest(".chat-row");
      if (!row) return;
      if (event.target.closest(".session-more")) {
        event.stopPropagation();
        const opening = !row.classList.contains("menu-open");
        closeSessionMenus(row);
        row.classList.toggle("menu-open", opening);
        return;
      }
      if (event.target.closest("[data-session-rename]")) {
        event.stopPropagation();
        startSessionRename(row);
        return;
      }
      if (event.target.closest("[data-session-delete]")) {
        event.stopPropagation();
        pendingDeleteSession = row;
        row.classList.remove("menu-open");
        document.getElementById("sessionDeleteName").textContent = row.querySelector("strong")?.textContent || "当前会话";
        sessionDeleteModal.classList.add("show");
        return;
      }
      if (!event.target.closest("input") && !event.target.closest('[contenteditable="true"]')) {
        sessionList.querySelectorAll(".chat-row").forEach(item => item.classList.toggle("active", item === row));
        syncTaskChatTitle();
        showToast(`已切换到“${row.querySelector("strong")?.textContent || "创作会话"}”`);
      }
    });
    function closeSessionDeleteModal() {
      sessionDeleteModal.classList.remove("show");
      pendingDeleteSession = null;
    }
    document.getElementById("closeSessionDelete")?.addEventListener("click", closeSessionDeleteModal);
    document.getElementById("cancelSessionDelete")?.addEventListener("click", closeSessionDeleteModal);
    sessionDeleteModal?.addEventListener("click", event => { if (event.target === sessionDeleteModal) closeSessionDeleteModal(); });
    document.getElementById("confirmSessionDelete")?.addEventListener("click", () => {
      if (!pendingDeleteSession) return closeSessionDeleteModal();
      const wasActive = pendingDeleteSession.classList.contains("active");
      pendingDeleteSession.remove();
      if (wasActive) sessionList.querySelector(".chat-row")?.classList.add("active");
      if (wasActive) syncTaskChatTitle();
      closeSessionDeleteModal();
      showToast("会话已删除");
    });

    const productCreationPicker = document.getElementById("productCreationPicker");
    document.getElementById("productCreationTrigger")?.addEventListener("click", () => productCreationPicker.classList.toggle("open"));
    document.querySelectorAll("[data-product-agent]").forEach(button => button.addEventListener("click", () => {
      const card = agentCards.find(item => item.dataset.type === button.dataset.productAgent);
      productCreationPicker.classList.remove("open");
      if (!card) return;
      switchPage("creation");
      selectAgent(card, true);
      showToast(`已带入当前产品，使用${card.dataset.agent}开始创作`);
    }));
    document.addEventListener("click", event => {
      if (productCreationPicker && !productCreationPicker.contains(event.target)) productCreationPicker.classList.remove("open");
      if (!event.target.closest(".card-menu-wrap")) closeCardMenus();
      if (!event.target.closest(".chat-row")) closeSessionMenus();
      if (!event.target.closest(".video-more-wrap")) document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.remove("open"));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeModal();
        toggleProductModal(productCreateModal, false);
        toggleProductModal(productDetailModal, false);
        imageZoomModal?.classList.remove("show");
        sessionDeleteModal?.classList.remove("show");
        setAssetPanel(false);
        setAgentPicker(false);
        setModelPicker(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (document.activeElement === promptInput) document.getElementById("sendPrompt").click();
      }
    });
    /* ===================== 经营自动化·新模块 ===================== */

    /* --- 素材监控 --- */
    let mmDays = 7; /* 可配置天数，默认7天 */
    let mmCurrentAcc = "all";
    const mmPlacementData = [
      {id:1,name:"床单除螨除菌演示A版",type:"视频",shop:"苏泊尔生活电器专卖店",plan:"除螨仪-短视频-0712",upload:"07-12",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_3344",st:"low"},
      {id:2,name:"蒸汽拖把清洁对比图",type:"图片",shop:"苏泊尔生活电器专卖店",plan:"蒸汽拖把-图片-0708",upload:"07-08",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"TW_8821",st:"low"},
      {id:3,name:"吸尘器吸力测试B版",type:"视频",shop:"苏泊尔厨具旗舰店",plan:"吸尘器-短视频-0710",upload:"07-10",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_3344",st:"low"},
      {id:4,name:"果蔬清洗机使用教程",type:"视频",shop:"苏泊尔厨具旗舰店",plan:"果蔬清洗机-短视频-0705",upload:"07-05",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_7788",st:"low"},
      {id:5,name:"挂烫机便携展示图",type:"图片",shop:"苏泊尔生活电器专卖店",plan:"挂烫机-图片-0709",upload:"07-09",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"TW_8821",st:"low"},
      {id:6,name:"破壁机食谱合集C版",type:"视频",shop:"苏泊尔厨具旗舰店",plan:"破壁机-短视频-0706",upload:"07-06",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_7788",st:"low"},
      {id:7,name:"料理机开箱体验",type:"视频",shop:"苏泊尔环境电器专营店",plan:"料理机-短视频-0703",upload:"07-03",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"ZB_5512",st:"low"},
      {id:8,name:"空气炸锅食谱图卡",type:"图片",shop:"苏泊尔厨具旗舰店",plan:"空气炸锅-图片-0701",upload:"07-01",imp:0,click:0,cost:0,ctr:0,cpa:"—",acc:"TW_5567",st:"low"}
    ];
    const mmReviewData = [
      {id:1,name:"床单B版除螨演示",shop:"苏泊尔生活电器专卖店",acc:"SF_8821",submit:"07-20 10:32",dur:"2h15m",audit:"passed",reason:"已分发完毕"},
      {id:2,name:"蒸汽C版拖把对比",shop:"苏泊尔厨具旗舰店",acc:"SF_5567",submit:"07-18 14:20",dur:"4h30m",audit:"rejected",reason:"终态-释放容量"},
      {id:3,name:"拖把E版便携展示",shop:"苏泊尔生活电器专卖店",acc:"SF_8821",submit:"07-22 09:15",dur:"1h45m",audit:"passed",reason:"已分发完毕"},
      {id:4,name:"除螨F版深度清洁",shop:"苏泊尔厨具旗舰店",acc:"SF_5567",submit:"07-16 16:08",dur:"6h20m",audit:"rejected",reason:"终态-释放容量"},
      {id:5,name:"吸尘器G版强劲模式",shop:"苏泊尔环境电器专营店",acc:"SF_3399",submit:"07-19 11:00",dur:"3h05m",audit:"passed",reason:"已分发完毕"},
      {id:6,name:"破壁机H版静音测试",shop:"苏泊尔厨具旗舰店",acc:"SF_5567",submit:"07-14 08:40",dur:"2h50m",audit:"passed",reason:"已分发完毕"}
    ];
    function mmRenderPlacement(){
      const tb=document.getElementById("mmPlacementTbody");
      if(!tb)return;
      const filtered = mmCurrentAcc==="all" ? mmPlacementData : mmPlacementData.filter(r=>r.acc===mmCurrentAcc);
      tb.innerHTML=filtered.map(r=>`<tr>
        <td><input type="checkbox" class="mm-check" data-id="${r.id}"></td>
        <td class="name-link">${r.name}</td>
        <td>${r.type}</td><td>${r.shop}</td><td>${r.plan}</td><td>${r.upload}</td>
        <td>0</td><td>0</td><td>0</td><td>0.00%</td><td>—</td>
        <td class="acc-link">${r.acc}</td>
        <td><span class="badge orange">⚠ 低效</span></td>
        <td><button class="soft-btn mm-del" data-id="${r.id}">删除</button></td>
      </tr>`).join("");
    }
    function mmFilterByAcc(acc){ mmCurrentAcc=acc; mmRenderPlacement(); }
    function mmRenderReview(){
      const tb=document.getElementById("mmReviewTbody");
      if(!tb)return;
      const filtered = mmCurrentAcc==="all" ? mmReviewData : mmReviewData.filter(r=>r.acc===mmCurrentAcc);
      tb.innerHTML=filtered.map(r=>{
        const tag=r.audit==="passed"?'<span class="badge green">✅ 已通过</span>':'<span class="badge red">❌ 复审不通过</span>';
        return `<tr>
        <td><input type="checkbox" class="mm-rcheck" data-id="${r.id}"></td>
        <td class="name-link">${r.name}</td><td>${r.shop}</td><td class="acc-link">${r.acc}</td>
        <td>${r.submit}</td><td>${r.dur}</td><td>${tag}</td><td>${r.reason}</td>
        <td><button class="soft-btn mm-rclean" data-id="${r.id}">清理</button></td>
      </tr>`;
      }).join("");
    }
    (function(){
      document.querySelectorAll("[data-mm-tab]").forEach(tab=>{
        tab.addEventListener("click",()=>{
          document.querySelectorAll("[data-mm-tab]").forEach(t=>t.classList.remove("active"));
          tab.classList.add("active");
          const target=tab.dataset.mmTab;
          document.querySelectorAll("[data-mm-panel]").forEach(p=>p.hidden=p.dataset.mmPanel!==target);
        });
      });
      const ca=document.getElementById("mmCheckAll");
      if(ca)ca.addEventListener("change",e=>{
        document.querySelectorAll(".mm-check").forEach(c=>c.checked=e.target.checked);
      });
      const rca=document.getElementById("mmReviewCheckAll");
      if(rca)rca.addEventListener("change",e=>{
        document.querySelectorAll(".mm-rcheck").forEach(c=>c.checked=e.target.checked);
      });
      const scanBtn=document.getElementById("mmScanBtn");
      if(scanBtn)scanBtn.addEventListener("click",()=>{
        scanBtn.textContent="扫描中…";scanBtn.disabled=true;
        showToast("正在扫描全账户素材…");
        setTimeout(()=>{scanBtn.textContent="手动扫描";scanBtn.disabled=false;showToast("扫描完成，发现186条低效素材");},1800);
      });
      function showCleanProgress(count){
        const ov=document.createElement("div");
        ov.className="clean-overlay show";
        ov.innerHTML=`<div class="clean-box"><h3>正在清理低效素材</h3><div class="clean-bar"><span style="width:0%"></span></div><div class="pt">0 / ${count}</div></div>`;
        document.body.appendChild(ov);
        let done=0;
        const timer=setInterval(()=>{
          done+=Math.ceil(count/10);
          if(done>=count){done=count;clearInterval(timer);
            setTimeout(()=>{ov.remove();showToast(`清理完成！已释放${count}条容量`);},500);
          }
          ov.querySelector(".clean-bar span").style.width=(done/count*100)+"%";
          ov.querySelector(".pt").textContent=`${done} / ${count}`;
        },200);
      }
      const cleanAll=document.getElementById("mmCleanAll");
      if(cleanAll)cleanAll.addEventListener("click",()=>{
        showCleanProgress(128);
        setTimeout(()=>{mmPlacementData.length=0;mmRenderPlacement();},2200);
      });
      const bulkDel=document.getElementById("mmBulkDelete");
      if(bulkDel)bulkDel.addEventListener("click",()=>{
        const checked=[...document.querySelectorAll(".mm-check:checked")].map(c=>+c.dataset.id);
        if(!checked.length){showToast("请先勾选要删除的素材");return;}
        showCleanProgress(checked.length);
        setTimeout(()=>{
          checked.forEach(id=>{const i=mmPlacementData.findIndex(r=>r.id===id);if(i>=0)mmPlacementData.splice(i,1);});
          mmRenderPlacement();showToast(`已删除${checked.length}条素材`);
        },checked.length*200+500);
      });
      document.addEventListener("click",e=>{
        const del=e.target.closest(".mm-del");
        if(del){const id=+del.dataset.id;const i=mmPlacementData.findIndex(r=>r.id===id);if(i>=0)mmPlacementData.splice(i,1);mmRenderPlacement();showToast("已删除素材");}
        const rc=e.target.closest(".mm-rclean");
        if(rc){const id=+rc.dataset.id;const i=mmReviewData.findIndex(r=>r.id===id);if(i>=0)mmReviewData.splice(i,1);mmRenderReview();showToast("已清理过审素材");}
      });
      /* 规则设置弹窗 */
      const mmRuleModal=document.getElementById("mmRuleModal");
      const mmRuleBtn=document.getElementById("mmRuleBtn");
      if(mmRuleBtn)mmRuleBtn.addEventListener("click",()=>{
        document.getElementById("mmDayInput").value=mmDays;
        mmRuleModal.classList.add("show");
      });
      document.getElementById("mmRuleClose").addEventListener("click",()=>mmRuleModal.classList.remove("show"));
      document.getElementById("mmRuleCancel").addEventListener("click",()=>mmRuleModal.classList.remove("show"));
      document.getElementById("mmRuleSave").addEventListener("click",()=>{
        const v=parseInt(document.getElementById("mmDayInput").value);
        if(v<3||v>30||isNaN(v)){showToast("天数范围为3-30天");return;}
        mmDays=v;
        document.getElementById("mmDayLabel").textContent=v;
        document.getElementById("mmThImp").textContent=v+"天展现";
        document.getElementById("mmThCost").textContent=v+"天消耗(元)";
        mmRuleModal.classList.remove("show");
        showToast("规则已更新：投放账户按"+v+"天零消耗规则扫描");
      });
      mmRenderPlacement();
      mmRenderReview();
    })();

    /* --- 过审分发 --- */
    let rdCurrentAcc = "all";
    const rdData=[
      {id:1,name:"床单除螨除菌版A",prod:"生活电器",shop:"苏泊尔生活电器专卖店",dur:"32s",uploader:"张三",acc:"SF_8821",plan:"过审_生活电器",audit:"reviewing",dist:"—",distTo:"—"},
      {id:2,name:"蒸汽拖把便携版B",prod:"厨具",shop:"苏泊尔厨具旗舰店",dur:"28s",uploader:"李四",acc:"SF_5567",plan:"过审_厨具",audit:"passed",dist:"distributing",distTo:"ZB_7788✓ TW_5567…"},
      {id:3,name:"吸尘器强劲模式C",prod:"生活电器",shop:"苏泊尔环境电器专营店",dur:"45s",uploader:"张三",acc:"SF_8821",plan:"过审_生活电器",audit:"rejected",dist:"appealing",distTo:"—"},
      {id:4,name:"果蔬清洗机教程D",prod:"厨具",shop:"苏泊尔厨具旗舰店",dur:"38s",uploader:"王五",acc:"SF_5567",plan:"过审_厨具",audit:"passed",dist:"done",distTo:"ZB_7788✓ TW_5567✓"},
      {id:5,name:"破壁机静音测试E",prod:"生活电器",shop:"苏泊尔生活电器专卖店",dur:"25s",uploader:"赵六",acc:"SF_8821",plan:"过审_生活电器",audit:"reviewing",dist:"—",distTo:"—"},
      {id:6,name:"挂烫机展示F版",prod:"厨具",shop:"苏泊尔厨具旗舰店",dur:"30s",uploader:"李四",acc:"SF_5567",plan:"过审_厨具",audit:"passed",dist:"done",distTo:"ZB_7788✓ TW_5567✓"}
    ];
    function rdRender(){
      const tb=document.getElementById("rdTbody");
      if(!tb)return;
      const filtered = rdCurrentAcc==="all" ? rdData : rdData.filter(r=>r.acc===rdCurrentAcc);
      const auditMap={reviewing:'<span class="badge orange">⏳ 审核中</span>',passed:'<span class="badge green">✅ 已通过</span>',rejected:'<span class="badge red">❌ 不通过</span>'};
      const distMap={"—":"—",distributing:'<span class="badge" style="color:#4647c8;background:#eeefff;">🔄 分发中</span>',done:'<span class="badge green">✅ 已分发</span>',appealing:'<span class="badge orange">📍 待申诉</span>'};
      tb.innerHTML=filtered.map(r=>`<tr>
        <td class="name-link">${r.name}</td><td>${r.prod}</td><td>${r.shop}</td><td>${r.dur}</td><td>${r.uploader}</td>
        <td class="acc-link">${r.acc}</td>
        <td><span class="badge" style="color:#4647c8;background:#eeefff;font-size:11px;">${r.plan}</span></td>
        <td>${auditMap[r.audit]}</td><td>${distMap[r.dist]}</td>
        <td style="font-size:11px;color:var(--muted);">${r.distTo}</td>
        <td>${r.audit==="rejected"?'<button class="soft-btn rd-conclusion" data-id="'+r.id+'">查看审核结论</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
      </tr>`).join("");
    }
    function rdFilterByAcc(acc){ rdCurrentAcc=acc; rdRender(); }
    (function(){
      const upBtn=document.getElementById("rdUploadBtn");
      if(upBtn)upBtn.addEventListener("click",()=>showToast("上传功能：请从NAS选择视频或拖拽上传"));
      /* 智投星审核结论弹窗 */
      const rdConcModal=document.getElementById("rdConclusionModal");
      document.addEventListener("click",e=>{
        const c=e.target.closest(".rd-conclusion");
        if(c){rdConcModal.classList.add("show");}
      });
      document.getElementById("rdConcClose").addEventListener("click",()=>rdConcModal.classList.remove("show"));
      document.getElementById("rdConcAck").addEventListener("click",()=>{rdConcModal.classList.remove("show");showToast("已标记已知晓，视频将加入待清理列表");});
      document.getElementById("rdConcExport").addEventListener("click",()=>showToast("审核结论PDF已生成"));
      document.getElementById("rdConcReupload").addEventListener("click",()=>{rdConcModal.classList.remove("show");showToast("已关联原视频记录，请上传修改版");});
      /* 新建过审计划弹窗 */
      const rdPlanModal=document.getElementById("rdCreatePlanModal");
      const rdCreateBtn=document.getElementById("rdCreatePlanBtn");
      if(rdCreateBtn)rdCreateBtn.addEventListener("click",()=>rdPlanModal.classList.add("show"));
      document.getElementById("rdPlanClose").addEventListener("click",()=>rdPlanModal.classList.remove("show"));
      document.getElementById("rdPlanCancel").addEventListener("click",()=>rdPlanModal.classList.remove("show"));
      document.querySelectorAll("#rdPlanType button").forEach(b=>b.addEventListener("click",()=>{
        document.querySelectorAll("#rdPlanType button").forEach(x=>x.classList.remove("active"));
        b.classList.add("active");
      }));
      document.getElementById("rdPlanConfirm").addEventListener("click",()=>{
        const name=document.getElementById("rdPlanName").value;
        if(!name.includes("过审")){showToast("计划名称必须包含'过审'字样");return;}
        rdPlanModal.classList.remove("show");
        showToast("过审计划创建成功！正在自动上传3条待过审视频…");
        setTimeout(()=>{
          const alert=document.getElementById("rdPlanAlert");
          if(alert)alert.style.display="none";
          showToast("3条视频已上传至新过审计划，审核监听已启动");
        },2000);
      });
      const capList=document.getElementById("rdCapacityList");
      if(capList){
        const caps=[{n:"SF_8821（生活电器）",used:420,total:500},{n:"SF_5567（厨具）",used:387,total:500}];
        capList.innerHTML=caps.map(c=>{
          const pct=Math.round(c.used/c.total*100);
          const cls=pct>=90?"#c14545":pct>=75?"#f5b73a":"#797cf4";
          return `<div class="cap-item"><span class="name">${c.n}</span><div class="bar"><span style="width:${pct}%;background:${cls};"></span></div><span class="num">${c.used}/${c.total}</span></div>`;
        }).join("");
      }
      const qList=document.getElementById("rdQuotaList");
      if(qList){
        const qs=[{n:"张三",used:50,total:50},{n:"李四",used:48,total:50},{n:"王五",used:42,total:50},{n:"赵六",used:45,total:50}];
        qList.innerHTML=qs.map(q=>{
          const pct=Math.round(q.used/q.total*100);
          const cls=q.used>=q.total?"#c14545":pct>=90?"#f5b73a":"#16a778";
          const tag=q.used>=q.total?' <span class="badge red">已达上限</span>':pct>=90?' <span class="badge orange">接近上限</span>':' <span class="badge green">正常</span>';
          return `<div class="quota-person"><span class="pname">${q.n}${tag}</span><div class="pbar"><span style="width:${pct}%;background:${cls};"></span></div><span class="pnum">${q.used}/${q.total}</span></div>`;
        }).join("")+`<div style="margin-top:8px;color:var(--muted);font-size:11px;">💡 当前剩余容量: 113条。张三已达上限，新上传将自动轮替至王五。</div>`;
      }
      rdRender();
    })();

    /* --- 商品卡推广 --- */
    let pcCurrentAcc = "all";
    /* acc 字段对应投放账户，用于二级侧边栏筛选 */
    const pcData=[
      {id:1,name:"苏泊尔轻净Pro除螨仪",link:"P_8821",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"除螨仪-商品卡-0715",st:"active",imp:12500,click:380,cost:3280,gmv:8920,roi:2.72,ctr:3.04,cpa:8.6,acc:"ZB_3344",reason:"—"},
      {id:2,name:"苏泊尔手持挂烫机",link:"P_8822",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"挂烫机-商品卡-0715",st:"active",imp:8200,click:245,cost:2150,gmv:5680,roi:2.64,ctr:2.99,cpa:8.8,acc:"ZB_3344",reason:"—"},
      {id:3,name:"苏泊尔智能料理机",link:"P_8823",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"料理机-商品卡-0712",st:"paused",imp:0,click:0,cost:0,gmv:0,roi:0,ctr:0,cpa:"—",acc:"ZB_3344",reason:"⚠ 评分低于4.0"},
      {id:4,name:"苏泊尔电烤箱32L",link:"P_8824",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"电烤箱-商品卡-0710",st:"paused",imp:0,click:0,cost:0,gmv:0,roi:0,ctr:0,cpa:"—",acc:"ZB_3344",reason:"商品已售罄"},
      {id:5,name:"苏泊尔破壁机静音版",link:"P_8825",shop:"锦云生活电器专卖店",shopId:"SHOP_8821",plan:"破壁机-商品卡-0731",st:"new",imp:320,click:12,cost:120,gmv:320,roi:2.67,ctr:3.75,cpa:10.0,acc:"ZB_3344",reason:"—"},
      {id:6,name:"苏泊尔蒸汽拖把",link:"P_8826",shop:"苏泊尔官方旗舰店",shopId:"SHOP_5567",plan:"蒸汽拖把-商品卡-0714",st:"active",imp:15600,click:470,cost:4120,gmv:11200,roi:2.72,ctr:3.01,cpa:8.8,acc:"ZB_7788",reason:"—"},
      {id:7,name:"苏泊尔空气炸锅A8",link:"P_8827",shop:"苏泊尔官方旗舰店",shopId:"SHOP_5567",plan:"空气炸锅-商品卡-0714",st:"active",imp:13800,click:410,cost:3680,gmv:9800,roi:2.66,ctr:2.97,cpa:9.0,acc:"ZB_7788",reason:"—"},
      {id:8,name:"苏泊尔果蔬清洗机",link:"P_8828",shop:"苏泊尔官方旗舰店",shopId:"SHOP_5567",plan:"果蔬清洗机-商品卡-0708",st:"paused",imp:0,click:0,cost:0,gmv:0,roi:0,ctr:0,cpa:"—",acc:"ZB_7788",reason:"⚠ 商品被处罚"}
    ];
    const pcLogs=[
      {t:"08:02",text:"新建商品卡计划: <strong>苏泊尔破壁机静音版(P_8825)</strong> → 锦云生活电器专卖店"},
      {t:"08:03",text:"尝试重启暂停计划: <strong>苏泊尔智能料理机(P_8823)</strong> → 评分低，已反馈店铺负责人"},
      {t:"08:05",text:"跳过: <strong>苏泊尔电烤箱(P_8824)</strong> → 商品售罄，待补货后自动重试"},
      {t:"08:06",text:"异常上报: <strong>苏泊尔果蔬清洗机(P_8828)</strong> → 商品被处罚，已通知店铺负责人优化"}
    ];
    function pcRender(){
      const tb=document.getElementById("pcTbody");
      if(!tb)return;
      const stMap={active:'<span class="badge green">✅ 正常投放</span>',paused:'<span class="badge orange">⏸ 已暂停</span>',new:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 今日新建</span>'};
      const filtered = pcCurrentAcc==="all" ? pcData : pcData.filter(r=>r.acc===pcCurrentAcc);
      tb.innerHTML=filtered.map(r=>`<tr>
        <td class="name-link">${r.name}</td><td>${r.link}</td><td>${r.shop}</td><td>${r.shopId}</td>
        <td>${r.plan}</td><td>${stMap[r.st]}</td>
        <td>${r.imp||"—"}</td><td>${r.click||"—"}</td><td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td>
        <td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.ctr?r.ctr.toFixed(2)+"%":"—"}</td><td>${r.cpa}</td>
        <td style="color:${r.reason!=='—'?'#b56b1a':'var(--muted)'};">${r.reason}</td>
        <td><button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button></td>
      </tr>`).join("");
      const ll=document.getElementById("pcLogList");
      if(ll)ll.innerHTML=pcLogs.map(l=>`<div class="log-entry"><span class="ltime">${l.t}</span><span class="ltext">${l.text}</span></div>`).join("");
    }
    function pcFilterByAcc(acc){ pcCurrentAcc=acc; pcRender(); }
    (function(){
      const scan=document.getElementById("pcScanBtn");
      if(scan)scan.addEventListener("click",()=>{
        scan.textContent="扫描中…";scan.disabled=true;showToast("正在扫描所有有效商品链接…");
        setTimeout(()=>{scan.textContent="立即扫描";scan.disabled=false;showToast("扫描完成：新建1个计划，3个暂停待处理");},1800);
      });
      pcRender();
    })();

    /* --- 图文推广 --- */
    let cpCurrentAcc = "all";
    const cpData=[
      {id:1,prod:"苏泊尔除螨仪",acct:"@苏泊尔生活电器",adAcc:"TW_8821",plan:"除螨仪-图文-0728",st:"active",videos:45,imp:8200,click:210,cost:1860,gmv:5200,roi:2.80,interact:4.2,person:"张三",update:"07-31"},
      {id:2,prod:"苏泊尔除螨仪",acct:"@生活好物精选",adAcc:"TW_8821",plan:"除螨仪-图文-0728",st:"active",videos:38,imp:6500,click:168,cost:1420,gmv:3800,roi:2.68,interact:3.8,person:"李四",update:"07-31"},
      {id:3,prod:"苏泊尔挂烫机",acct:"@苏泊尔生活电器",adAcc:"TW_8821",plan:"挂烫机-图文-0720",st:"paused",videos:12,imp:2100,click:52,cost:380,gmv:920,roi:2.42,interact:2.5,person:"王五",update:"07-28"},
      {id:4,prod:"苏泊尔破壁机",acct:"@厨房日记",adAcc:"TW_5567",plan:"破壁机-图文-0810",st:"pending",videos:0,imp:0,click:0,cost:0,gmv:0,roi:0,interact:0,person:"—",update:"—"},
      {id:5,prod:"苏泊尔蒸汽拖把",acct:"@苏泊尔生活电器",adAcc:"TW_5567",plan:"蒸汽拖把-图文-0725",st:"active",videos:42,imp:7800,click:195,cost:1680,gmv:4600,roi:2.74,interact:3.5,person:"赵六",update:"07-30"},
      {id:6,prod:"苏泊尔空气炸锅",acct:"@美食探店达人",adAcc:"TW_5567",plan:"空气炸锅-图文-0726",st:"active",videos:35,imp:5600,click:145,cost:1250,gmv:3400,roi:2.72,interact:4.0,person:"张三",update:"07-31"}
    ];
    function cpRender(){
      const tb=document.getElementById("cpTbody");
      if(!tb)return;
      const stMap={active:'<span class="badge green">✅ 正常</span>',paused:'<span class="badge orange">⏸ 暂停</span>',pending:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 待填充</span>'};
      const filtered = cpCurrentAcc==="all" ? cpData : cpData.filter(r=>r.adAcc===cpCurrentAcc);
      tb.innerHTML=filtered.map(r=>`<tr>
        <td class="name-link">${r.prod}</td><td>${r.acct}</td><td class="acc-link">${r.adAcc}</td><td>${r.plan}</td>
        <td>${stMap[r.st]}</td><td>${r.videos}</td>
        <td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td><td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.interact?r.interact.toFixed(1)+"%":"—"}</td>
        <td>${r.person}</td><td>${r.update}</td>
        <td>${r.st==="pending"?'<button class="soft-btn cp-fill" data-id="'+r.id+'">填充视频</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
      </tr>`).join("");
    }
    function cpFilterByAcc(acc){ cpCurrentAcc=acc; cpRender(); }
    (function(){
      document.querySelectorAll("[data-cp-tab]").forEach(tab=>{
        tab.addEventListener("click",()=>{
          document.querySelectorAll("[data-cp-tab]").forEach(t=>t.classList.remove("active"));
          tab.classList.add("active");
          document.querySelectorAll("[data-cp-panel]").forEach(p=>p.hidden=p.dataset.cpPanel!==tab.dataset.cpTab);
        });
      });
      const scan=document.getElementById("cpScanBtn");
      if(scan)scan.addEventListener("click",()=>{showToast("正在扫描链接×抖音号组合…");setTimeout(()=>showToast("扫描完成：今日更新42条素材，4个计划待填充"),1500);});
      const fillAll=document.getElementById("cpFillAll");
      if(fillAll)fillAll.addEventListener("click",()=>{
        const pending=cpData.filter(r=>r.st==="pending");
        if(!pending.length){showToast("没有待填充的计划");return;}
        showToast(`正在为${pending.length}个计划匹配过审视频…`);
        setTimeout(()=>{
          pending.forEach(r=>{r.st="active";r.videos=8;r.person="赵六";r.update="07-31";});
          cpRender();showToast("填充完成！已为4个计划各填充8条视频");
        },1800);
      });
      document.addEventListener("click",e=>{
        const f=e.target.closest(".cp-fill");
        if(f){const id=+f.dataset.id;const r=cpData.find(x=>x.id===id);if(r){r.st="active";r.videos=8;r.person="赵六";r.update="07-31";cpRender();showToast("填充完成！已上线8条新素材");}}
      });
      const qb=document.getElementById("cpQuotaBoard");
      /* 配额数据（可动态更新） */
      const cpQuotaPlans=[
        {n:"SF_8821（图文投放）",used:387,total:500,members:[{n:"张三",u:50,t:50},{n:"李四",u:48,t:50},{n:"王五",u:42,t:50},{n:"赵六",u:45,t:50}]}
      ];
      function cpRenderQuota(){
        if(!qb)return;
        qb.innerHTML=cpQuotaPlans.map(p=>{
          const pct=Math.round(p.used/p.total*100);
          return `<div class="card" style="margin-bottom:12px;">
            <div class="card-title"><div><h3>${p.n}</h3><small>容量: ${p.total}条 · 已用: ${p.used}条 · 剩余: ${p.total-p.used}条 · 协作人数: ${p.members.length}人</small></div></div>
            <div style="padding:0 16px 16px;">
              <div class="cap-item" style="margin-bottom:8px;"><span class="name">总体使用率</span><div class="bar"><span style="width:${pct}%;background:${pct>=80?'#f5b73a':'#797cf4'};"></span></div><span class="num">${pct}%</span></div>
              ${p.members.map(m=>{
                const mp=Math.round(m.u/m.t*100);
                const mc=m.u>=m.t?"#c14545":mp>=90?"#f5b73a":"#16a778";
                const overTag=m.u>m.t?' <span class="badge orange">🟡超额(历史)</span>':m.u>=m.t?' <span class="badge red">已达上限</span>':mp>=90?' <span class="badge orange">接近上限</span>':' <span class="badge green">正常</span>';
                return `<div class="quota-person"><span class="pname">${m.n}${overTag}</span><div class="pbar"><span style="width:${Math.min(mp,100)}%;background:${mc};"></span></div><span class="pnum">${m.u}/${m.t}</span></div>`;
              }).join("")}
              <div style="margin-top:8px;color:var(--muted);font-size:11px;">💡 每人配额 = 容量上限${p.total} ÷ 协作人数${p.members.length} = ${Math.floor(p.total/p.members.length)}条/人</div>
            </div></div>`;
        }).join("");
      }
      cpRenderQuota();
      /* 新增协作人员弹窗 */
      const cpMemberModal=document.getElementById("cpAddMemberModal");
      const cpAddMemberBtn=document.getElementById("cpAddMemberBtn");
      if(cpAddMemberBtn)cpAddMemberBtn.addEventListener("click",()=>{
        /* 预览配额变化 */
        const plan=cpQuotaPlans[0];
        const newCount=plan.members.length+1;
        const newQuota=Math.floor(plan.total/newCount);
        const oldQuota=Math.floor(plan.total/plan.members.length);
        document.getElementById("cpQuotaPreview").innerHTML=
          '<span>ℹ</span><span>新增人员后，配额将自动重算：当前 <strong>'+plan.members.length+'人</strong> × 每人'+oldQuota+'条 → <strong>'+newCount+'人</strong> × 每人<strong>'+newQuota+'条</strong>（每人配额减少'+(oldQuota-newQuota)+'条）</span>';
        cpMemberModal.classList.add("show");
      });
      document.getElementById("cpMemberClose").addEventListener("click",()=>cpMemberModal.classList.remove("show"));
      document.getElementById("cpMemberCancel").addEventListener("click",()=>cpMemberModal.classList.remove("show"));
      document.getElementById("cpMemberConfirm").addEventListener("click",()=>{
        const name=document.getElementById("cpMemberName").value.trim();
        const acc=document.getElementById("cpMemberAcc").value.trim();
        if(!name||!acc){showToast("请填写人员姓名和千川账户ID");return;}
        const plan=cpQuotaPlans[0];
        const newCount=plan.members.length+1;
        const newQuota=Math.floor(plan.total/newCount);
        /* 重算所有人员配额上限 */
        plan.members.forEach(m=>{m.t=newQuota;});
        /* 新增人员（本次上传0条，配额为新的每人上限） */
        plan.members.push({n:name,u:0,t:newQuota});
        cpMemberModal.classList.remove("show");
        document.getElementById("cpMemberName").value="";
        document.getElementById("cpMemberAcc").value="";
        cpRenderQuota();
        showToast("已新增协作人员【"+name+"】，配额已重算："+newCount+"人×"+newQuota+"条/人");
      });
      cpRender();
    })();

    /* --- 账户配置 --- */
    const acData=[
      {id:1,prod:"苏泊尔生活电器",review:"SF_8821（过审）",live:"ZB_3344",tuwen:"TW_8821（同过审）",port:"MK_001 锦云生活电器专卖店",st:"active"},
      {id:2,prod:"苏泊尔厨具",review:"SF_5567（过审）",live:"ZB_7788",tuwen:"TW_5567（同过审）",port:"MK_002 苏泊尔官方旗舰店",st:"active"},
      {id:3,prod:"苏泊尔环境电器",review:"SF_3399（过审）",live:"ZB_5512",tuwen:"TW_3399（同过审）",port:"MK_003 环境电器专营店",st:"active"},
      {id:4,prod:"苏泊尔小家电",review:"SF_7766（过审）",live:"ZB_9988",tuwen:"TW_7766（同过审）",port:"MK_004 小家电旗舰店",st:"paused"}
    ];
    function acRender(){
      const tb=document.getElementById("acTbody");
      if(!tb)return;
      tb.innerHTML=acData.map(r=>`<tr>
        <td><strong>${r.prod}</strong></td>
        <td class="acc-link">${r.review}</td><td class="acc-link">${r.live}</td><td class="acc-link">${r.tuwen}</td><td>${r.port}</td>
        <td>${r.st==="active"?'<span class="badge green">运行中</span>':'<span class="badge gray">已暂停</span>'}</td>
        <td><button class="ghost-btn ac-edit" data-id="${r.id}" style="font-size:11px;padding:4px 8px;">编辑</button></td>
      </tr>`).join("");
    }
    (function(){
      const add=document.getElementById("acAddBtn");
      if(add)add.addEventListener("click",()=>showToast("新增产品：填写产品名称和4类账户ID"));
      document.addEventListener("click",e=>{
        const ed=e.target.closest(".ac-edit");
        if(ed){showToast("编辑配置：修改账户ID将影响进行中的任务");}
      });
      acRender();
    })();

    /* ===================== 推广配置子Tab（账户映射/任务调度）===================== */
    (function(){
      document.querySelectorAll("#page-account-config [data-ac-tab]").forEach(btn=>{
        btn.addEventListener("click",()=>{
          document.querySelectorAll("#page-account-config [data-ac-tab]").forEach(b=>b.classList.toggle("active",b===btn));
          document.querySelectorAll("#page-account-config [data-ac-panel]").forEach(p=>p.hidden=p.dataset.acPanel!==btn.dataset.acTab);
        });
      });
      // 账户映射扩展表
      const acExtraData=[
        {product:"除螨仪XM-8",port:"深圳南区 3 口",owner:"翁宇英",type:"独家",time:"07-30 14:20"},
        {product:"空气炸锅AF-60",port:"广州一区 8 口",owner:"林晓婷",type:"非独家",time:"07-29 11:08"},
        {product:"洗地机F-15",port:"杭州二区 5 口",owner:"张文豪",type:"独家",time:"07-30 09:15"},
        {product:"电饭煲IH-40",port:"成都三区 4 口",owner:"李婉清",type:"非独家",time:"07-28 16:42"},
        {product:"挂烫机GT-23",port:"武汉一区 6 口",owner:"赵明轩",type:"独家",time:"07-30 20:18"}
      ];
      const acExtraTbody=document.getElementById("acExtraTbody");
      if(acExtraTbody){
        acExtraTbody.innerHTML=acExtraData.map(r=>`<tr>
          <td><strong>${r.product}</strong></td><td>${r.port}</td><td>${r.owner}</td>
          <td>${r.type}</td>
          <td style="font-size:12px;color:#999cb0;">${r.time}</td>
          <td><button class="ghost-btn" style="font-size:11px;padding:4px 8px;">编辑</button></td>
        </tr>`).join("");
      }
      // 任务调度数据（2个 tbody 都填充）
      const tsTaskData=[
        {task:"素材清理（双轨）",time:"02:00",status:"成功",last:"今日 02:00",result:"清理 247 条低效素材"},
        {task:"商品卡巡检",time:"08:00",status:"成功",last:"今日 08:00",result:"补建 12 个计划"},
        {task:"图文推广巡检",time:"09:00",status:"成功",last:"今日 09:00",result:"更新 8 条素材"},
        {task:"过审分发",time:"全天",status:"运行中",last:"14:25",result:"已分发 32 条"},
        {task:"审核监听",time:"实时",status:"运行中",last:"14:30",result:"监听 18 个计划"},
        {task:"素材库同步",time:"全天",status:"成功",last:"14:00",result:"同步 86 条过审状态"}
      ];
      const tsStrategyData=[
        {scene:"千川 API 限流",strategy:"自动退避重试 3 次（指数退避），失败后切换备用账户"},
        {scene:"抖店接口超时",strategy:"重试 2 次 + 切换备用 IP，仍失败则跳过本轮"},
        {scene:"素材合规审核不通过",strategy:"获取审核结论 → 反馈创作 + 申诉（如可申诉）"},
        {scene:"账户被封禁",strategy:"立即停用该账户所有任务，通知管理员处理"},
        {scene:"NAS 路径不可达",strategy:"切换备用 NAS + 通知 IT，限速降级处理"},
        {scene:"配额超限",strategy:"按优先级重排任务，暂停低优先级任务"},
        {scene:"AI 模型调用失败",strategy:"降级到规则引擎 + 通知 AI 团队"}
      ];
      function renderTs2(){
        const task=document.getElementById("tsTaskTbody2");
        const strat=document.getElementById("tsStrategyTbody2");
        const stMap={"成功":'<span class="badge green">成功</span>',"运行中":'<span class="badge orange">运行中</span>',"失败":'<span class="badge" style="background:#e54d42;color:#fff;">失败</span>'};
        if(task)task.innerHTML=tsTaskData.map(t=>`<tr>
          <td>${t.task}</td><td>${t.time}</td>
          <td>${stMap[t.status]}</td>
          <td style="font-size:12px;color:#999cb0;">${t.last}</td>
          <td style="font-size:12px;">${t.result}</td>
        </tr>`).join("");
        if(strat)strat.innerHTML=tsStrategyData.map(s=>`<tr>
          <td><strong>${s.scene}</strong></td>
          <td style="font-size:13px;">${s.strategy}</td>
        </tr>`).join("");
      }
      renderTs2();
      // 立即执行
      const tsTriggerBtn2=document.getElementById("tsTriggerBtn2");
      if(tsTriggerBtn2)tsTriggerBtn2.addEventListener("click",()=>showToast("已触发全部任务，依次执行中…"));
    })();

    /* ===================== 推广自动化·筛选增强 ===================== */
    (function(){
      /* --- 素材监控·投放账户 --- */
      const mmPF = { product: "all", account: "all", type: "all", search: "" };
      window.mmRenderPlacement = function() {
        const tb = document.getElementById("mmPlacementTbody");
        if (!tb) return;
        let d = mmPlacementData;
        if (mmCurrentAcc !== "all") d = d.filter(r => r.acc === mmCurrentAcc);
        if (mmPF.account !== "all") d = d.filter(r => r.acc === mmPF.account);
        if (mmPF.type !== "all") d = d.filter(r => r.type === mmPF.type);
        if (mmPF.product !== "all") d = d.filter(r => r.shop.includes(mmPF.product));
        if (mmPF.search) d = d.filter(r => r.name.toLowerCase().includes(mmPF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="14" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        tb.innerHTML = d.map(r => `<tr>
          <td><input type="checkbox" class="mm-check" data-id="${r.id}"></td>
          <td class="name-link">${r.name}</td>
          <td>${r.type}</td><td>${r.shop}</td><td>${r.plan}</td><td>${r.upload}</td>
          <td>0</td><td>0</td><td>0</td><td>0.00%</td><td>—</td>
          <td class="acc-link">${r.acc}</td>
          <td><span class="badge orange">⚠ 低效</span></td>
          <td><button class="soft-btn mm-del" data-id="${r.id}">删除</button></td>
        </tr>`).join("");
      };
      const el = id => document.getElementById(id);
      const mmPF_el = el("mmProductFilter");
      if (mmPF_el) mmPF_el.addEventListener("change", e => { mmPF.product = e.target.value === "全部产品" ? "all" : e.target.value; mmRenderPlacement(); });
      const mmAF_el = el("mmAccountFilter");
      if (mmAF_el) mmAF_el.addEventListener("change", e => { mmPF.account = e.target.value === "全部账户" ? "all" : e.target.value; mmRenderPlacement(); });
      const mmTF_el = el("mmTypeFilter");
      if (mmTF_el) mmTF_el.addEventListener("change", e => { mmPF.type = e.target.value === "全部类型" ? "all" : e.target.value; mmRenderPlacement(); });
      const mmS_el = el("mmSearch");
      if (mmS_el) mmS_el.addEventListener("input", e => { mmPF.search = e.target.value.toLowerCase().trim(); mmRenderPlacement(); });

      /* --- 素材监控·过审账户 --- */
      const mmRF = { product: "all", account: "all", status: "all" };
      window.mmRenderReview = function() {
        const tb = document.getElementById("mmReviewTbody");
        if (!tb) return;
        let d = mmReviewData;
        if (mmCurrentAcc !== "all") d = d.filter(r => r.acc === mmCurrentAcc);
        if (mmRF.account !== "all") d = d.filter(r => r.acc === mmRF.account);
        if (mmRF.product !== "all") d = d.filter(r => r.shop.includes(mmRF.product));
        if (mmRF.status !== "all") d = d.filter(r => (r.audit === "passed" ? "已通过" : "复审不通过") === mmRF.status);
        if (!d.length) { tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        tb.innerHTML = d.map(r => {
          const tag = r.audit === "passed" ? '<span class="badge green">✅ 已通过</span>' : '<span class="badge red">❌ 复审不通过</span>';
          return `<tr>
          <td><input type="checkbox" class="mm-rcheck" data-id="${r.id}"></td>
          <td class="name-link">${r.name}</td><td>${r.shop}</td><td class="acc-link">${r.acc}</td>
          <td>${r.submit}</td><td>${r.dur}</td><td>${tag}</td><td>${r.reason}</td>
          <td><button class="soft-btn mm-rclean" data-id="${r.id}">清理</button></td>
        </tr>`;
        }).join("");
      };
      const mmRPF_el = el("mmReviewProductFilter");
      if (mmRPF_el) mmRPF_el.addEventListener("change", e => { mmRF.product = e.target.value === "全部产品" ? "all" : e.target.value; mmRenderReview(); });
      const mmRAF_el = el("mmReviewAccountFilter");
      if (mmRAF_el) mmRAF_el.addEventListener("change", e => { mmRF.account = e.target.value === "全部过审账户" ? "all" : e.target.value; mmRenderReview(); });
      const mmRSF_el = el("mmReviewStatusFilter");
      if (mmRSF_el) mmRSF_el.addEventListener("change", e => { mmRF.status = e.target.value === "全部状态" ? "all" : e.target.value; mmRenderReview(); });

      /* --- 过审分发 --- */
      const rdF = { product: "all", status: "all", search: "" };
      function rdGetStatus(r) {
        if (r.audit === "rejected" || r.dist === "appealing") return "申诉中";
        if (r.dist === "done") return "已分发";
        if (r.dist === "distributing") return "已通过";
        if (r.audit === "passed") return "已通过";
        if (r.audit === "reviewing") return "审核中";
        return "待上传";
      }
      window.rdRender = function() {
        const tb = document.getElementById("rdTbody");
        if (!tb) return;
        let d = rdData;
        if (rdCurrentAcc !== "all") d = d.filter(r => r.acc === rdCurrentAcc);
        if (rdF.product !== "all") d = d.filter(r => r.prod === rdF.product);
        if (rdF.status !== "all") d = d.filter(r => rdGetStatus(r) === rdF.status);
        if (rdF.search) d = d.filter(r => r.name.toLowerCase().includes(rdF.search) || r.uploader.toLowerCase().includes(rdF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        const auditMap = {reviewing:'<span class="badge orange">⏳ 审核中</span>',passed:'<span class="badge green">✅ 已通过</span>',rejected:'<span class="badge red">❌ 不通过</span>'};
        const distMap = {"—":"—",distributing:'<span class="badge" style="color:#4647c8;background:#eeefff;">🔄 分发中</span>',done:'<span class="badge green">✅ 已分发</span>',appealing:'<span class="badge orange">📍 待申诉</span>'};
        tb.innerHTML = d.map(r => `<tr>
          <td class="name-link">${r.name}</td><td>${r.prod}</td><td>${r.shop}</td><td>${r.dur}</td><td>${r.uploader}</td>
          <td class="acc-link">${r.acc}</td>
          <td><span class="badge" style="color:#4647c8;background:#eeefff;font-size:11px;">${r.plan}</span></td>
          <td>${auditMap[r.audit]}</td><td>${distMap[r.dist]}</td>
          <td style="font-size:11px;color:var(--muted);">${r.distTo}</td>
          <td>${r.audit==="rejected"?'<button class="soft-btn rd-conclusion" data-id="'+r.id+'">查看审核结论</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
        </tr>`).join("");
      };
      const rdPF_el = el("rdProductFilter");
      if (rdPF_el) rdPF_el.addEventListener("change", e => { rdF.product = e.target.value === "全部产品" ? "all" : e.target.value; rdRender(); });
      const rdSF_el = el("rdStatusFilter");
      if (rdSF_el) rdSF_el.addEventListener("change", e => { rdF.status = e.target.value === "全部状态" ? "all" : e.target.value; rdRender(); });
      const rdS_el = el("rdSearch");
      if (rdS_el) rdS_el.addEventListener("input", e => { rdF.search = e.target.value.toLowerCase().trim(); rdRender(); });

      /* --- 商品卡推广 --- */
      const pcF = { status: "all", shop: "all", search: "" };
      const pcStMap = { active: "正常投放", paused: "已暂停", new: "今日新建" };
      window.pcRender = function() {
        const tb = document.getElementById("pcTbody");
        if (!tb) return;
        let d = pcData;
        if (pcCurrentAcc !== "all") d = d.filter(r => r.acc === pcCurrentAcc);
        if (pcF.status !== "all") d = d.filter(r => pcStMap[r.st] === pcF.status);
        if (pcF.shop !== "all") d = d.filter(r => r.shop === pcF.shop);
        if (pcF.search) d = d.filter(r => r.name.toLowerCase().includes(pcF.search) || r.link.toLowerCase().includes(pcF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="15" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        const stMap = {active:'<span class="badge green">✅ 正常投放</span>',paused:'<span class="badge orange">⏸ 已暂停</span>',new:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 今日新建</span>'};
        tb.innerHTML = d.map(r => `<tr>
          <td class="name-link">${r.name}</td><td>${r.link}</td><td>${r.shop}</td><td>${r.shopId}</td>
          <td>${r.plan}</td><td>${stMap[r.st]}</td>
          <td>${r.imp||"—"}</td><td>${r.click||"—"}</td><td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td>
          <td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.ctr?r.ctr.toFixed(2)+"%":"—"}</td><td>${r.cpa}</td>
          <td style="color:${r.reason!=='—'?'#b56b1a':'var(--muted)'};">${r.reason}</td>
          <td><button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button></td>
        </tr>`).join("");
        const ll = document.getElementById("pcLogList");
        if (ll) ll.innerHTML = pcLogs.map(l => `<div class="log-entry"><span class="ltime">${l.t}</span><span class="ltext">${l.text}</span></div>`).join("");
      };
      const pcSF_el = el("pcStatusFilter");
      if (pcSF_el) pcSF_el.addEventListener("change", e => { pcF.status = e.target.value === "全部状态" ? "all" : e.target.value; pcRender(); });
      const pcSF2_el = el("pcShopFilter");
      if (pcSF2_el) pcSF2_el.addEventListener("change", e => { pcF.shop = e.target.value === "全部店铺" ? "all" : e.target.value; pcRender(); });
      const pcS_el = el("pcSearch");
      if (pcS_el) pcS_el.addEventListener("input", e => { pcF.search = e.target.value.toLowerCase().trim(); pcRender(); });

      /* --- 图文推广 --- */
      const cpF = { product: "all", status: "all", search: "" };
      const cpStMap = { active: "正常", paused: "暂停", pending: "待填充" };
      window.cpRender = function() {
        const tb = document.getElementById("cpTbody");
        if (!tb) return;
        let d = cpData;
        if (cpCurrentAcc !== "all") d = d.filter(r => r.adAcc === cpCurrentAcc);
        if (cpF.product !== "all") d = d.filter(r => r.prod.includes(cpF.product));
        if (cpF.status !== "all") d = d.filter(r => cpStMap[r.st] === cpF.status);
        if (cpF.search) d = d.filter(r => r.prod.toLowerCase().includes(cpF.search) || r.acct.toLowerCase().includes(cpF.search));
        if (!d.length) { tb.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:30px;color:var(--muted);">暂无匹配数据</td></tr>'; return; }
        const stMap = {active:'<span class="badge green">✅ 正常</span>',paused:'<span class="badge orange">⏸ 暂停</span>',pending:'<span class="badge" style="color:#4647c8;background:#eeefff;">🆕 待填充</span>'};
        tb.innerHTML = d.map(r => `<tr>
          <td class="name-link">${r.prod}</td><td>${r.acct}</td><td class="acc-link">${r.adAcc}</td><td>${r.plan}</td>
          <td>${stMap[r.st]}</td><td>${r.videos}</td>
          <td>${r.cost||"—"}</td><td>${r.gmv||"—"}</td><td>${r.roi?r.roi.toFixed(2):"—"}</td><td>${r.interact?r.interact.toFixed(1)+"%":"—"}</td>
          <td>${r.person}</td><td>${r.update}</td>
          <td>${r.st==="pending"?'<button class="soft-btn cp-fill" data-id="'+r.id+'">填充视频</button>':'<button class="ghost-btn" style="font-size:11px;padding:4px 8px;">详情</button>'}</td>
        </tr>`).join("");
      };
      const cpPF_el = el("cpProductFilter");
      if (cpPF_el) cpPF_el.addEventListener("change", e => { cpF.product = e.target.value === "全部产品" ? "all" : e.target.value; cpRender(); });
      const cpSF_el = el("cpStatusFilter");
      if (cpSF_el) cpSF_el.addEventListener("change", e => { cpF.status = e.target.value === "全部状态" ? "all" : e.target.value; cpRender(); });
      const cpS_el = el("cpSearch");
      if (cpS_el) cpS_el.addEventListener("input", e => { cpF.search = e.target.value.toLowerCase().trim(); cpRender(); });

      /* 重新渲染所有表格（应用覆盖后的函数） */
      mmRenderPlacement();
      mmRenderReview();
      rdRender();
      pcRender();
      cpRender();
    })();


    // merged: 模板库页签切换
    document.querySelectorAll("[data-lib-tab]").forEach(button => button.addEventListener("click", () => {
      const scope = button.closest("#page-template-library");
      if (!scope) return;
      scope.querySelectorAll("[data-lib-tab]").forEach(item => item.classList.toggle("active", item === button));
      scope.querySelectorAll("[data-lib-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.libPanel === button.dataset.libTab));
    }));

    /* ── 爆款内容结构：千川学习 / 自建结构、详情与 Agent 调用 ── */
    const copyStructureTbody = document.getElementById("copyStructureTbody");
    const copyStructureEmpty = document.getElementById("copyStructureEmpty");
    const copyStructureDetailModal = document.getElementById("copyStructureDetailModal");
    const copyStructureEditorModal = document.getElementById("copyStructureEditorModal");
    let activeCopyStructureId = "";
    let editingCopyStructureId = "";

    function copyStructureLevelLabel(level) { return level === "product" ? "产品级结构" : "通用结构"; }
    function copyStructureNow() { return new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-"); }
    function renderCopyStructureTagFilter() {
      const select = document.getElementById("copyStructureTagFilter");
      if (!select) return;
      const current = select.value || "all";
      select.value = ["general","product"].includes(current) ? current : "all";
    }
    function renderCopyStructureLibrary() {
      if (!copyStructureTbody) return;
      const keyword = document.getElementById("copyStructureSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("copyStructureSourceFilter")?.value || "all";
      const tag = document.getElementById("copyStructureTagFilter")?.value || "all";
      const rows = copyStructureCatalog.filter(item => {
        const haystack = `${item.name} ${item.formula} ${item.products.join(" ")}`.toLowerCase();
        return (!keyword || haystack.includes(keyword)) && (source === "all" || item.source === source) && (tag === "all" || item.level === tag);
      });
      copyStructureTbody.innerHTML = rows.map(item => `<tr data-copy-structure-row="${item.id}">
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td class="copy-structure-formula">${escapeHtml(item.formula)}</td>
        <td><span class="copy-source-tag ${item.source}">${copyStructureSourceLabel(item.source)}</span></td>
        <td><span class="copy-structure-tag-pill">${copyStructureLevelLabel(item.level)}</span></td>
        <td>${escapeHtml(item.products.join("、") || "通用")}</td>
        <td>${escapeHtml(item.updated)}</td>
        <td><div class="copy-structure-row-actions"><button class="copy-row-action" type="button" data-copy-structure-view="${item.id}">查看详情</button>${item.source === "custom" ? `<button class="copy-row-action primary" type="button" data-copy-structure-edit="${item.id}">编辑</button><button class="copy-row-action" type="button" data-copy-structure-copy="${item.id}">复制</button><button class="copy-row-action danger" type="button" data-copy-structure-delete="${item.id}">删除</button>` : `<button class="copy-row-action primary" type="button" data-copy-structure-copy="${item.id}">复制为自建</button>`}</div></td>
      </tr>`).join("");
      copyStructureEmpty.hidden = rows.length > 0;
    }

    function renderCopyStructureRelated(item, keyword = "") {
      const list = document.getElementById("copyStructureRelatedList");
      if (!list) return;
      const normalized = keyword.trim().toLowerCase();
      const ranked = [...(item.related || [])].sort((a,b) => (b.spend || 0) - (a.spend || 0)).slice(0,20);
      const related = ranked.filter(record => !normalized || `${record.video} ${record.product} ${record.id} ${record.copy}`.toLowerCase().includes(normalized));
      document.getElementById("copyStructureRelatedCount").textContent = `展示 ${related.length} 条`;
      list.innerHTML = related.length ? related.map(record => `<article class="copy-related-item" data-related-copy="${record.id}">
        <button class="copy-related-video" type="button" data-play-related-video="${record.id}" aria-label="播放${escapeHtml(record.video)}"><span>${escapeHtml(record.video)}</span></button>
        <div class="copy-related-copy"><div class="copy-related-copy-head"><div><strong>${escapeHtml(record.video)}</strong><small style="display:block;margin-top:3px;">${escapeHtml(record.product)} · 素材 ID ${escapeHtml(record.id)}</small></div><span class="copy-related-spend">消耗 ¥${Number(record.spend || 0).toLocaleString("zh-CN")}</span></div><p>${escapeHtml(record.copy)}</p><div class="copy-related-actions"><button class="ghost-btn" type="button" data-expand-related-copy>展开全文</button><button class="ghost-btn" type="button" data-copy-related-text>复制文案</button><button class="ghost-btn" type="button" data-play-related-video="${record.id}">播放视频</button></div></div>
      </article>`).join("") : `<div class="copy-structure-empty">${item.source === "custom" ? "自建结构暂未关联千川文案" : "没有符合搜索条件的关联文案"}</div>`;
    }

    const copyStructureInsightCatalog = {
      "cs-qc-result": {
        why:"用强结果画面先建立注意力，再解释隐性痛点，通过完整操作和可视化结果证明产品价值，适合效果能够直接展示的清洁产品。",
        evidence:"近30天同结构素材消耗靠前；2条高消耗成品均在前3秒展示清洁结果。",
        scope:"适合：效果可视化、已有结果特写和完整操作素材；不适合：结果无法被画面直接证明的产品。",
        stages:[
          {name:"结果型视觉钩子",time:"0–3s",purpose:"先给结果，快速建立好奇与观看理由",original:"透明尘杯脏污特写，随后硬切床垫表面。",talk:"先别听我讲参数，直接看{product}走完一遍后的{visible_result}。",slots:["product · 产品名","visible_result · 可视化结果"],material:"结果特写、前后对比或反常画面；至少1个近景镜头。",edit:"1–2个短镜头；优先硬切；单镜头1–2秒。"},
          {name:"隐性痛点放大",time:"3–12s",purpose:"解释为什么表面正常仍需要解决",original:"床单看似干净，但纤维深处仍可能藏有毛发碎屑。",talk:"你以为{surface_state}就够了，其实{hidden_problem}并没有解决。",slots:["surface_state · 表面状态","hidden_problem · 隐性问题"],material:"问题部位特写、目标人群生活场景。",edit:"画面跟随信息点切换；无需完整动作。"},
          {name:"产品能力演示",time:"12–34s",purpose:"用实际操作承接解决方案，而不是只讲参数",original:"展示拍打头推进、拍打与吸尘同步工作的连续过程。",talk:"{product}通过{core_action}，把{problem_object}直接带出来。",slots:["core_action · 核心动作","problem_object · 问题对象"],material:"产品露出、关键动作和使用过程；动作镜头需连续清晰。",edit:"保留完整动作；素材偏短时可轻微减速或补充同义镜头。"},
          {name:"结果与场景证明",time:"34–52s",purpose:"通过结果及多场景证明产品不是单点有效",original:"尘杯结果、床垫和沙发布艺场景连续展示。",talk:"{scene_1}、{scene_2}都能用，清洁结果可以直接看见。",slots:["scene_1 · 核心场景","scene_2 · 扩展场景"],material:"结果回看、两个以上使用场景。",edit:"结果镜头优先；多场景之间直接硬切。"},
          {name:"行动引导",time:"52–60s",purpose:"收束价值并给出明确下一步",original:"产品定帧收口，引导查看完整实测。",talk:"想看{proof_content}，点击商品了解更多。",slots:["proof_content · 可验证内容"],material:"产品稳定展示或操作完成画面。",edit:"结尾保持稳定；素材不足可短时定帧。"}
        ]
      },
      "cs-qc-scene": {
        why:"先用高频生活场景建立代入，再用产品操作和结果证明降低理解成本，最后承接优惠或行动信息。",
        evidence:"参考成品在前5秒完成人群场景和问题交代，核心功能均有实拍画面承接。",
        scope:"适合：使用场景明确、操作流程可展示的产品；不适合：缺少真实使用过程素材。",
        stages:[
          {name:"场景代入",time:"0–5s",purpose:"让目标人群快速确认与自己有关",original:"下班回家，不想长时间守在厨房。",talk:"{audience_scene}，又不想{pain_action}？",slots:["audience_scene · 人群场景","pain_action · 麻烦行为"],material:"人物或环境全景、问题状态。",edit:"先场景后痛点，2个镜头内完成。"},
          {name:"问题呈现",time:"5–12s",purpose:"把时间、操作或清洁成本具体化",original:"反复开盖、等待和清洁油污。",talk:"每次都要{old_process}，真正麻烦的是{cost}。",slots:["old_process · 原处理流程","cost · 时间或操作成本"],material:"旧方式、等待或问题细节。",edit:"按问题信息点硬切。"},
          {name:"功能证明",time:"12–43s",purpose:"用完整使用过程说明产品如何解决问题",original:"放入食材、观察上色、出锅并展示结果。",talk:"把{object}放进去，通过{feature}完成{result}。",slots:["feature · 核心功能","result · 结果"],material:"产品登场、完整操作、结果特写。",edit:"关键操作不可截断；允许轻微加速。"},
          {name:"使用便利",time:"43–52s",purpose:"补充降低使用门槛的次要卖点",original:"炸篮拆下清洗。",talk:"用完后{easy_action}，日常处理更方便。",slots:["easy_action · 便利动作"],material:"拆卸、清洗或收纳过程。",edit:"1–2个连续动作镜头。"},
          {name:"行动收口",time:"52–60s",purpose:"给出优惠或查看商品的明确动作",original:"成品展示并引导进入商品。",talk:"想看更多{scene_result}，点击商品查看。",slots:["scene_result · 场景结果"],material:"成品、产品或稳定场景。",edit:"稳定画面收尾，可短时定帧。"}
        ]
      },
      "cs-qc-audience": {
        why:"先点名人群缩短理解路径，再逐层展开需求与产品能力，适合人群差异明显的产品。", evidence:"参考成品的人群信息前置，核心卖点与清洁操作一一对应。", scope:"适合：人群痛点明确且素材有人群场景；不适合：需要广泛覆盖但无法区分人群的产品。",
        stages:[
          {name:"人群点名",time:"0–4s",purpose:"明确视频在对谁说",original:"家里有孩子又有宠物的家庭。",talk:"{target_audience}，日常最怕{core_pain}。",slots:["target_audience · 目标人群","core_pain · 核心痛点"],material:"人群生活场景或典型问题。",edit:"前4秒完成人群和痛点交代。"},
          {name:"需求唤醒",time:"4–13s",purpose:"把抽象需求变成具体麻烦",original:"干湿垃圾需要分开处理。",talk:"每次{old_process}，不仅{cost_1}，还要{cost_2}。",slots:["old_process · 旧流程","cost_1 · 成本一","cost_2 · 成本二"],material:"问题过程和细节特写。",edit:"按成本点切换镜头。"},
          {name:"卖点展开",time:"13–48s",purpose:"逐项展示能力如何对应需求",original:"吸、拖、洗一次推进完成，并展示滚刷自清洁。",talk:"{product}把{ability_list}放进一次操作里。",slots:["ability_list · 能力组合"],material:"每个卖点至少匹配一个动作镜头。",edit:"卖点与画面一一对齐；关键动作保留完整。"},
          {name:"产品推荐",time:"48–60s",purpose:"总结适用理由并引导下一步",original:"缩短清洁链路，查看完整演示。",talk:"如果你想{desired_result}，可以先看它的完整演示。",slots:["desired_result · 目标结果"],material:"结果、产品和稳定收口画面。",edit:"先结果再产品，结尾可定帧。"}
        ]
      },
      "cs-custom-contrast": {
        why:"用反差制造认知落差，再通过完整实测消除怀疑，适合具备明显前后变化的产品。", evidence:"自建结构，当前暂无千川表现数据；有效性需要通过后续投放验证。", scope:"适合：前后差异明显、具有实测素材；不适合：只能依赖口头宣称的产品。",
        stages:[
          {name:"反差开场",time:"0–4s",purpose:"用预期与真实结果的差异抓住注意力",original:"先展示看似正常的状态，再切到异常结果。",talk:"你以为{expected_state}，实际{unexpected_result}。",slots:["expected_state · 原有认知","unexpected_result · 反差结果"],material:"同一对象的前后状态或反常结果。",edit:"2个镜头直接硬切。"},
          {name:"过程实测",time:"4–34s",purpose:"证明结果来自真实操作",original:"完整展示产品从开始到完成的操作过程。",talk:"不讲参数，直接看{product}怎么完成{task}。",slots:["task · 核心任务"],material:"连续、清晰、可验证的完整动作。",edit:"动作不可截断；冗余部分可加速。"},
          {name:"结果证明",time:"34–50s",purpose:"回看结果并给出判断依据",original:"结果特写与前画面对照。",talk:"前后差别就在{proof_point}。",slots:["proof_point · 证明点"],material:"结果特写、前后对比。",edit:"结果镜头至少保留2秒。"},
          {name:"行动引导",time:"50–60s",purpose:"引导查看详情或完成购买动作",original:"产品稳定露出并引导查看。",talk:"想看完整实测，点击商品了解更多。",slots:[],material:"产品定帧或完成画面。",edit:"稳定收口，可短时定帧。"}
        ]
      }
    };

    function renderCopyStructureStages(item) {
      const insight = copyStructureInsightCatalog[item.id] || copyStructureInsightCatalog["cs-custom-contrast"];
      const formula = document.getElementById("copyStructureFormulaCard");
      formula.innerHTML = `<div class="copy-formula-overview"><small>公式一览</small><div>${item.formula.split("→").map((part,index) => `${index ? "<i>→</i>" : ""}<b>${escapeHtml(part.trim())}</b>`).join("")}</div></div><div class="copy-effective-reason"><span>效</span><div><strong>为什么这个结构有效</strong><p>${escapeHtml(insight.why)}</p><small>${escapeHtml(insight.evidence)}</small></div></div><div class="copy-structure-scope"><b>复用边界</b><span>${escapeHtml(insight.scope)}</span></div>`;
      document.getElementById("copyStructureStageList").innerHTML = insight.stages.map((stage,index) => `<article class="copy-stage-card${index === 0 ? " expanded" : ""}" data-copy-stage-card><button class="copy-stage-head" type="button" data-copy-stage-toggle><i>${index + 1}</i><span><b>${escapeHtml(stage.name)}</b><small>${escapeHtml(stage.purpose)}</small></span><em>${escapeHtml(stage.time)}</em><u>⌄</u></button><div class="copy-stage-body"><div class="copy-stage-source"><b>原片表达</b><p>${escapeHtml(stage.original)}</p><button type="button" data-copy-jump-source="${index}">▶ 跳到原视频 ${escapeHtml(stage.time)}</button></div><div class="copy-stage-talk"><div><b>可复用话术</b><button type="button" data-copy-stage-copy>复制话术</button></div><p>${escapeHtml(stage.talk)}</p>${stage.slots.length ? `<div>${stage.slots.map(slot => `<span>${escapeHtml(slot)}</span>`).join("")}</div>` : ""}</div><div class="copy-stage-execution"><section><b>素材匹配要求</b><p>${escapeHtml(stage.material)}</p></section><section><b>剪辑建议</b><p>${escapeHtml(stage.edit)}</p></section></div></div></article>`).join("");
    }

    function openCopyStructureDetail(id) {
      const item = copyStructureCatalog.find(structure => structure.id === id);
      if (!item) return;
      activeCopyStructureId = id;
      document.getElementById("copyStructureDetailTitle").textContent = item.name;
      const badge = document.getElementById("copyStructureDetailSource");
      badge.textContent = copyStructureSourceLabel(item.source);
      badge.className = `badge copy-source-tag ${item.source}`;
      document.getElementById("copyStructureDetailSummary").innerHTML = `<div><small>结构名称</small><strong>${escapeHtml(item.name)}</strong></div><div><small>结构公式</small><strong>${escapeHtml(item.formula)}</strong></div><div><small>结构标签</small><span class="copy-structure-tag-pill">${copyStructureLevelLabel(item.level)}</span></div><div><small>关联产品</small><strong>${escapeHtml(item.products.join("、") || "通用")}</strong></div>`;
      renderCopyStructureStages(item);
      document.getElementById("copyStructureReferenceTabCount").textContent = String(item.related?.length || 0);
      copyStructureDetailModal.querySelectorAll("[data-copy-detail-tab]").forEach(tab => tab.classList.toggle("active", tab.dataset.copyDetailTab === "stages"));
      copyStructureDetailModal.querySelectorAll("[data-copy-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.copyDetailPanel === "stages"));
      const search = document.getElementById("copyStructureRelatedSearch");
      search.value = "";
      renderCopyStructureRelated(item);
      const clone = document.getElementById("copyStructureCloneFromDetail");
      clone.textContent = item.source === "qianchuan" ? "复制为自建" : "复制结构";
      copyStructureDetailModal.classList.add("show");
    }

    function setCopyStructureLevel(level) {
      const normalized = level === "product" ? "product" : "general";
      document.getElementById("copyStructureLevelInput").value = normalized;
      copyStructureEditorModal.querySelectorAll("[data-copy-level]").forEach(button => button.classList.toggle("active", button.dataset.copyLevel === normalized));
      const productInput = document.getElementById("copyStructureProductInput");
      productInput.disabled = normalized === "general";
      if (normalized === "general") productInput.value = "";
    }

    function openCopyStructureEditor(id = "", clone = false) {
      const source = copyStructureCatalog.find(item => item.id === id);
      editingCopyStructureId = clone ? "" : (source?.source === "custom" ? id : "");
      document.getElementById("copyStructureEditorTitle").textContent = editingCopyStructureId ? "编辑爆款内容结构" : (source ? "复制为自建结构" : "新建爆款内容结构");
      document.getElementById("copyStructureNameInput").value = source ? `${source.name}${clone ? "（副本）" : ""}` : "";
      document.getElementById("copyStructureFormulaInput").value = source?.formula || "";
      const productInput = document.getElementById("copyStructureProductInput");
      productInput.value = source?.products?.[0] || "";
      setCopyStructureLevel(source?.level || "general");
      if ((source?.level || "general") === "product") productInput.value = source?.products?.[0] || "";
      copyStructureEditorModal.classList.add("show");
    }

    document.getElementById("copyStructureSearch")?.addEventListener("input", renderCopyStructureLibrary);
    document.getElementById("copyStructureSourceFilter")?.addEventListener("change", renderCopyStructureLibrary);
    document.getElementById("copyStructureTagFilter")?.addEventListener("change", renderCopyStructureLibrary);
    document.getElementById("createCopyStructure")?.addEventListener("click", () => openCopyStructureEditor());
    document.getElementById("copyStructureRelatedSearch")?.addEventListener("input", event => {
      const item = copyStructureCatalog.find(structure => structure.id === activeCopyStructureId);
      if (item) renderCopyStructureRelated(item, event.target.value);
    });
    copyStructureEditorModal?.addEventListener("click", event => {
      const levelButton = event.target.closest("[data-copy-level]");
      if (levelButton) setCopyStructureLevel(levelButton.dataset.copyLevel);
    });
    document.getElementById("saveCopyStructure")?.addEventListener("click", () => {
      const name = document.getElementById("copyStructureNameInput").value.trim();
      const formula = document.getElementById("copyStructureFormulaInput").value.trim();
      const level = document.getElementById("copyStructureLevelInput").value;
      const product = document.getElementById("copyStructureProductInput").value;
      if (!name || !formula) return showToast("请填写结构名称和结构公式");
      if (level === "product" && !product) return showToast("产品级结构需要选择关联产品");
      const existing = copyStructureCatalog.find(item => item.id === editingCopyStructureId);
      const value = { id:existing?.id || `cs-custom-${Date.now()}`, name, formula, source:"custom", level, products:level === "product" ? [product] : [], updated:copyStructureNow(), related:existing?.related || [] };
      if (existing) Object.assign(existing, value); else copyStructureCatalog.push(value);
      copyStructureEditorModal.classList.remove("show");
      renderCopyStructureTagFilter();
      renderCopyStructureLibrary();
      renderCopyStructurePicker();
      showToast(existing ? "结构已更新" : "自建结构已创建");
    });
    document.getElementById("copyStructureCloneFromDetail")?.addEventListener("click", () => {
      copyStructureDetailModal.classList.remove("show");
      openCopyStructureEditor(activeCopyStructureId, true);
    });
    document.querySelectorAll("[data-close-copy-structure-detail]").forEach(button => button.addEventListener("click", () => copyStructureDetailModal.classList.remove("show")));
    document.querySelectorAll("[data-close-copy-structure-editor]").forEach(button => button.addEventListener("click", () => copyStructureEditorModal.classList.remove("show")));
    [copyStructureDetailModal, copyStructureEditorModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) modal.classList.remove("show"); }));
    copyStructureTbody?.addEventListener("click", event => {
      const view = event.target.closest("[data-copy-structure-view]");
      const edit = event.target.closest("[data-copy-structure-edit]");
      const copy = event.target.closest("[data-copy-structure-copy]");
      const remove = event.target.closest("[data-copy-structure-delete]");
      if (view) return openCopyStructureDetail(view.dataset.copyStructureView);
      if (edit) return openCopyStructureEditor(edit.dataset.copyStructureEdit);
      if (copy) return openCopyStructureEditor(copy.dataset.copyStructureCopy, true);
      if (remove) {
        const item = copyStructureCatalog.find(structure => structure.id === remove.dataset.copyStructureDelete);
        if (item && confirm(`确认删除自建结构“${item.name}”吗？`)) {
          copyStructureCatalog.splice(copyStructureCatalog.indexOf(item), 1);
          renderCopyStructureTagFilter();
          renderCopyStructureLibrary();
          renderCopyStructurePicker();
          showToast("自建结构已删除");
        }
      }
    });
    document.getElementById("copyStructureRelatedList")?.addEventListener("click", event => {
      const card = event.target.closest("[data-related-copy]");
      if (!card) return;
      if (event.target.closest("[data-play-related-video]")) return showToast(`正在播放素材 ${card.dataset.relatedCopy}`);
      if (event.target.closest("[data-expand-related-copy]")) {
        card.classList.toggle("expanded");
        event.target.textContent = card.classList.contains("expanded") ? "收起全文" : "展开全文";
      }
      if (event.target.closest("[data-copy-related-text]")) {
        navigator.clipboard?.writeText(card.querySelector("p")?.textContent || "");
        showToast("文案已复制");
      }
    });
    renderCopyStructureTagFilter();
    renderCopyStructureLibrary();

    /* ── 人群画像模板：增删改查、编辑记录与 Agent 调用 ── */
    const personaCatalog = [
      { id:"persona-mom", name:"精致妈妈—母婴清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"女性", age:"24–30", pain:["孩子接触床褥后容易敏感不适","床单刚换仍担心深层毛发碎屑"], scenes:["宝宝家庭的床垫日常清洁","毛绒玩具和布艺沙发清洁"], usage:36, updated:"08-04 15:30" },
      { id:"persona-pet", name:"精致妈妈—养宠清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"不限", age:"31–40", pain:["宠物掉毛进入沙发和床褥缝隙","表面清理后仍有毛发碎屑"], scenes:["宠物活动区日常清洁","换季掉毛期的床褥与沙发清洁"], usage:24, updated:"08-04 11:18" },
      { id:"persona-whitecollar", name:"新锐白领—一人食效率人群", brand:"轻享", category:"厨房电器", product:"轻享空气炸锅 A8", audience:"新锐白领", gender:"不限", age:"24–30", pain:["下班晚，没有时间准备复杂晚餐","做饭后不想处理大量油污"], scenes:["工作日晚间一人食","朋友到家时快速准备小食"], usage:19, updated:"08-03 16:42" },
      { id:"persona-family", name:"资深中产—品质清洁人群", brand:"净界", category:"清洁电器", product:"净界洗地机 S5", audience:"资深中产", gender:"不限", age:"31–40", pain:["全屋清洁步骤多、耗时长","厨房和卫生间的干湿垃圾难一次处理"], scenes:["周末全屋深度清洁","餐后厨房地面即时清洁"], usage:17, updated:"08-02 10:15" }
    ];
    const personaHistories = {
      "persona-mom":[
        { time:"08-04 15:30", user:"嗡大发", field:"年龄", before:"25–35", after:"24–30" },
        { time:"08-03 17:12", user:"林运营", field:"人群核心痛点", before:"1 条", after:"2 条" }
      ],
      "persona-pet":[{ time:"08-04 11:18", user:"嗡大发", field:"使用场景", before:"1 条", after:"2 条" }],
      "persona-whitecollar":[{ time:"08-03 16:42", user:"林运营", field:"创建画像", before:"—", after:"新锐白领—一人食效率人群" }],
      "persona-family":[{ time:"08-02 10:15", user:"嗡大发", field:"创建画像", before:"—", after:"资深中产—品质清洁人群" }]
    };
    const personaFieldLabels = { name:"画像名称", brand:"适用品牌", category:"适用类目", product:"适用产品", audience:"抖音八大人群", gender:"性别", age:"年龄", pain:"人群核心痛点", scenes:"使用场景" };
    const personaTbody = document.getElementById("personaLibraryTbody");
    const personaEmpty = document.getElementById("personaLibraryEmpty");
    const personaModal = document.getElementById("personaTemplateModal");
    const personaHistoryModal = document.getElementById("personaHistoryModal");
    const personaDeleteModal = document.getElementById("personaDeleteModal");
    let editingPersonaId = "";
    let deletingPersonaId = "";

    function personaNow() {
      return new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
    }
    function personaScope(persona) { return persona.product || persona.category || persona.brand || "全团队"; }
    function personaLines(value) { return Array.isArray(value) ? value : String(value || "").split("\n").map(item => item.trim()).filter(Boolean); }
    function personaText(value) { return personaLines(value).join(" / ") || "—"; }
    function renderPersonaLibrary() {
      if (!personaTbody) return;
      const keyword = document.getElementById("personaLibrarySearch")?.value.trim().toLowerCase() || "";
      const product = document.getElementById("personaLibraryProductFilter")?.value || "all";
      const rows = personaCatalog.filter(persona => {
        const haystack = [persona.name, persona.audience, persona.gender, persona.age, persona.brand, persona.category, persona.product, ...persona.pain, ...persona.scenes].join(" ").toLowerCase();
        return (!keyword || haystack.includes(keyword)) && (product === "all" || persona.product === product);
      });
      personaTbody.innerHTML = rows.map(persona => `<tr data-persona-row="${persona.id}">
        <td class="persona-name-cell"><strong>${escapeHtml(persona.name)}</strong><small>更新于 ${escapeHtml(persona.updated)}</small></td>
        <td><span class="persona-attribute-summary">${escapeHtml(persona.audience)}<br>${escapeHtml(persona.gender)} · ${escapeHtml(persona.age)}岁</span></td>
        <td class="lib-cell-text">${escapeHtml(personaText(persona.pain))}</td>
        <td class="lib-cell-text">${escapeHtml(personaText(persona.scenes))}</td>
        <td><span class="persona-scope-tag">${escapeHtml(personaScope(persona))}</span></td>
        <td>${persona.usage} 次</td>
        <td><div class="persona-row-actions"><button class="lib-link" type="button" data-persona-edit="${persona.id}">编辑</button><button class="lib-link" type="button" data-persona-history="${persona.id}">编辑记录</button><button class="lib-link" type="button" data-persona-copy="${persona.id}">复制</button><button class="lib-link danger" type="button" data-persona-delete="${persona.id}">删除</button></div></td>
      </tr>`).join("");
      if (personaEmpty) personaEmpty.hidden = rows.length > 0;
    }
    function setPersonaChoice(group, value) {
      const row = personaModal?.querySelector(`[data-persona-form-single="${group}"]`);
      if (!row) return;
      row.querySelectorAll(":scope > button").forEach(button => button.classList.toggle("active", button.textContent.trim() === value));
    }
    function resetPersonaForm(persona = null) {
      document.getElementById("personaFormName").value = persona?.name || "";
      document.getElementById("personaFormBrand").value = persona?.brand || "";
      document.getElementById("personaFormCategory").value = persona?.category || "";
      document.getElementById("personaFormProduct").value = persona?.product || "";
      document.getElementById("personaFormPain").value = persona?.pain?.join("\n") || "";
      document.getElementById("personaFormScenes").value = persona?.scenes?.join("\n") || "";
      setPersonaChoice("audience", persona?.audience || "精致妈妈");
      setPersonaChoice("gender", persona?.gender || "不限");
      const standardAges = ["18–23", "24–30", "31–40", "41–50", "51+"];
      const age = persona?.age || "24–30";
      const custom = !standardAges.includes(age);
      setPersonaChoice("age", custom ? "自定义" : age);
      const customFields = personaModal?.querySelector("[data-persona-custom-age]");
      if (customFields) customFields.hidden = !custom;
      if (custom) {
        const parts = age.split(/[–-]/);
        document.getElementById("personaFormAgeMin").value = parts[0] || "25";
        document.getElementById("personaFormAgeMax").value = parts[1] || "35";
      }
    }
    function openPersonaModal(id = "") {
      editingPersonaId = id;
      const persona = personaCatalog.find(item => item.id === id) || null;
      document.getElementById("personaTemplateTitle").textContent = persona ? "编辑人群画像" : "新建人群画像";
      resetPersonaForm(persona);
      personaModal?.classList.add("show");
      setTimeout(() => document.getElementById("personaFormName")?.focus(), 50);
    }
    function closePersonaModal() { personaModal?.classList.remove("show"); editingPersonaId = ""; }
    function readPersonaForm() {
      const activeText = group => personaModal?.querySelector(`[data-persona-form-single="${group}"] > button.active`)?.textContent.trim() || "";
      let age = activeText("age");
      if (age === "自定义") age = `${document.getElementById("personaFormAgeMin").value || 18}–${document.getElementById("personaFormAgeMax").value || 35}`;
      return {
        name:document.getElementById("personaFormName").value.trim(), brand:document.getElementById("personaFormBrand").value,
        category:document.getElementById("personaFormCategory").value, product:document.getElementById("personaFormProduct").value,
        audience:activeText("audience"), gender:activeText("gender"), age,
        pain:personaLines(document.getElementById("personaFormPain").value), scenes:personaLines(document.getElementById("personaFormScenes").value)
      };
    }
    function personaComparable(value) { return Array.isArray(value) ? value.join("；") : String(value || ""); }
    function savePersonaTemplate() {
      const form = readPersonaForm();
      if (!form.name || !form.audience || !form.gender || !form.age) return showToast("请补全标记 * 的人群画像信息");
      const ageParts = form.age.split(/[–-]/).map(Number);
      if (ageParts.length === 2 && ageParts[0] > ageParts[1]) return showToast("年龄起始值不能大于结束值");
      const duplicate = personaCatalog.find(item => item.id !== editingPersonaId && item.name === form.name && personaScope(item) === personaScope(form));
      if (duplicate) return showToast("相同适用范围内已存在同名人群画像");
      const time = personaNow();
      if (editingPersonaId) {
        const index = personaCatalog.findIndex(item => item.id === editingPersonaId);
        const previous = personaCatalog[index];
        Object.keys(personaFieldLabels).forEach(key => {
          const before = personaComparable(previous[key]);
          const after = personaComparable(form[key]);
          if (before !== after) (personaHistories[editingPersonaId] ||= []).unshift({ time, user:"嗡大发", field:personaFieldLabels[key], before:before || "—", after:after || "—" });
        });
        personaCatalog[index] = { ...previous, ...form, updated:time };
        showToast("人群画像已更新；已在使用的任务仍保留原画像快照");
      } else {
        const id = `persona-${Date.now()}`;
        personaCatalog.unshift({ id, ...form, usage:0, updated:time });
        personaHistories[id] = [{ time, user:"嗡大发", field:"创建画像", before:"—", after:form.name }];
        showToast("人群画像已新增，可在三个文案 Agent 中调用");
      }
      closePersonaModal();
      renderPersonaLibrary();
    }
    function openPersonaHistory(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      document.getElementById("personaHistoryTitle").textContent = `“${persona.name}”编辑记录`;
      const history = personaHistories[id] || [];
      document.getElementById("personaHistoryList").innerHTML = history.length ? history.map(item => `<article class="persona-history-item"><div class="persona-history-meta"><span>${escapeHtml(item.time)} · ${escapeHtml(item.user)}</span><span>${escapeHtml(item.field)}</span></div><div class="persona-history-change"><strong>${escapeHtml(item.field)}</strong><span>${escapeHtml(item.before)}</span><i>→</i><span>${escapeHtml(item.after)}</span></div></article>`).join("") : `<div class="persona-library-empty">暂无编辑记录</div>`;
      personaHistoryModal?.classList.add("show");
    }
    function copyPersona(id) {
      const source = personaCatalog.find(item => item.id === id);
      if (!source) return;
      const newId = `persona-${Date.now()}`;
      const time = personaNow();
      const copy = { ...source, id:newId, name:`${source.name}（副本）`, pain:[...source.pain], scenes:[...source.scenes], usage:0, updated:time };
      personaCatalog.unshift(copy);
      personaHistories[newId] = [{ time, user:"嗡大发", field:"复制画像", before:source.name, after:copy.name }];
      renderPersonaLibrary();
      showToast("人群画像已复制，可继续编辑");
    }
    function openPersonaDelete(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      deletingPersonaId = id;
      document.getElementById("personaDeleteTitle").textContent = `删除“${persona.name}”？`;
      personaDeleteModal?.classList.add("show");
    }
    function closePersonaDelete() { personaDeleteModal?.classList.remove("show"); deletingPersonaId = ""; }

    document.getElementById("createPersonaTemplate")?.addEventListener("click", () => openPersonaModal());
    document.getElementById("personaLibrarySearch")?.addEventListener("input", renderPersonaLibrary);
    document.getElementById("personaLibraryProductFilter")?.addEventListener("change", renderPersonaLibrary);
    personaTbody?.addEventListener("click", event => {
      const edit = event.target.closest("[data-persona-edit]");
      const history = event.target.closest("[data-persona-history]");
      const copy = event.target.closest("[data-persona-copy]");
      const remove = event.target.closest("[data-persona-delete]");
      if (edit) openPersonaModal(edit.dataset.personaEdit);
      else if (history) openPersonaHistory(history.dataset.personaHistory);
      else if (copy) copyPersona(copy.dataset.personaCopy);
      else if (remove) openPersonaDelete(remove.dataset.personaDelete);
    });
    personaModal?.addEventListener("click", event => {
      if (event.target === personaModal || event.target.closest("[data-close-persona-modal]")) return closePersonaModal();
      const choice = event.target.closest("[data-persona-form-single] > button");
      if (!choice) return;
      const row = choice.parentElement;
      row.querySelectorAll(":scope > button").forEach(button => button.classList.toggle("active", button === choice));
      if (row.dataset.personaFormSingle === "age") {
        const custom = row.querySelector("[data-persona-custom-age]");
        if (custom) custom.hidden = !choice.matches("[data-persona-custom-age-trigger]");
      }
    });
    document.getElementById("savePersonaTemplate")?.addEventListener("click", savePersonaTemplate);
    document.querySelectorAll("[data-close-persona-history]").forEach(button => button.addEventListener("click", () => personaHistoryModal?.classList.remove("show")));
    personaHistoryModal?.addEventListener("click", event => { if (event.target === personaHistoryModal) personaHistoryModal.classList.remove("show"); });
    document.querySelectorAll("[data-close-persona-delete]").forEach(button => button.addEventListener("click", closePersonaDelete));
    personaDeleteModal?.addEventListener("click", event => { if (event.target === personaDeleteModal) closePersonaDelete(); });
    document.getElementById("confirmPersonaDelete")?.addEventListener("click", () => {
      const index = personaCatalog.findIndex(item => item.id === deletingPersonaId);
      if (index < 0) return closePersonaDelete();
      personaCatalog.splice(index, 1);
      delete personaHistories[deletingPersonaId];
      closePersonaDelete();
      renderPersonaLibrary();
      showToast("人群画像已删除，历史会话和生成资产未受影响");
    });

    function personaPickerProductContext() {
      return {
        name:dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || "",
        brand:dynamicForm.querySelector("[data-original-brand]")?.value.trim() || "",
        category:dynamicForm.querySelector("[data-original-category]")?.value.trim() || ""
      };
    }
    function isPersonaRecommended(persona, context) { return Boolean((context.name && persona.product === context.name) || (context.category && persona.category === context.category) || (context.brand && persona.brand === context.brand)); }
    function openPersonaTemplatePicker(picker) {
      if (!window.CreationPersonaPicker) {
        setFormFeedback("人群画像选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const context = personaPickerProductContext();
      const items = personaCatalog.map(persona => ({ ...persona, recommended:isPersonaRecommended(persona, context) }));
      window.CreationPersonaPicker.open({
        items,
        selectedId:picker.dataset.personaId || "",
        onConfirm(persona) {
          const source = personaCatalog.find(item => item.id === persona?.id);
          if (source) applyPersonaToCurrentForm(picker, source);
        }
      });
    }
    function activatePersonaChoice(row, text) {
      if (!row) return;
      row.querySelectorAll(".choice-chip, .audience-chip, .rewrite-audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === text));
    }
    function applyPersonaAge(persona, rewrite = false) {
      const role = rewrite ? "rewrite-age" : "age";
      const row = dynamicForm.querySelector(`[data-role="${role}"]`);
      if (!row) return;
      const standard = [...row.querySelectorAll(".choice-chip")].find(button => button.textContent.trim() === persona.age);
      const customTrigger = row.querySelector(rewrite ? "[data-rewrite-custom-age-trigger]" : "[data-custom-age-trigger]");
      const choice = standard || customTrigger;
      row.querySelectorAll(".choice-chip").forEach(button => button.classList.toggle("active", button === choice));
      const custom = row.querySelector(rewrite ? "[data-rewrite-custom-age]" : "[data-custom-age]");
      if (custom) custom.hidden = Boolean(standard);
      if (!standard) {
        const parts = persona.age.split(/[–-]/);
        const min = row.querySelector(rewrite ? "[data-rewrite-age-min]" : "[data-age-min]");
        const max = row.querySelector(rewrite ? "[data-rewrite-age-max]" : "[data-age-max]");
        if (min) min.value = parts[0] || "25";
        if (max) max.value = parts[1] || "35";
      }
    }
    function applyPersonaToCurrentForm(picker, persona) {
      const rewrite = picker.dataset.personaContext === "rewrite";
      if (rewrite) {
        const box = dynamicForm.querySelector("[data-rewrite-audience-box]");
        box?.querySelectorAll(".rewrite-audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === persona.audience));
        activatePersonaChoice(dynamicForm.querySelector('[data-role="rewrite-gender"]'), persona.gender);
      } else {
        const box = dynamicForm.querySelector("[data-audience-box]");
        box?.querySelectorAll(".audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === persona.audience));
        activatePersonaChoice(dynamicForm.querySelector('[data-role="gender"]'), persona.gender);
      }
      applyPersonaAge(persona, rewrite);
      const pain = dynamicForm.querySelector('[data-field="pain"]');
      const scenes = dynamicForm.querySelector('[data-field="scenes"]');
      if (pain) pain.value = persona.pain.join("\n");
      if (scenes) scenes.value = persona.scenes.join("\n");
      if (rewrite) syncRewriteAudienceTarget();
      picker.dataset.personaId = persona.id;
      picker.querySelector("[data-persona-selected]").textContent = persona.name;
      const applied = picker.querySelector("[data-persona-applied]");
      applied.hidden = false;
      applied.querySelector("span").textContent = `已应用：${persona.name} · ${persona.audience} · ${persona.gender} · ${persona.age}岁`;
      creationContext.originalFields.personaTemplateId = persona.id;
      creationContext.originalFields.personaSnapshot = JSON.parse(JSON.stringify(persona));
      persona.usage += 1;
      renderPersonaLibrary();
      showToast("人群画像已回填，可继续修改本次任务字段");
    }
    function clearPersonaPicker(picker, notify = true) {
      delete picker.dataset.personaId;
      picker.querySelector("[data-persona-selected]").textContent = "选择人群画像模板";
      picker.querySelector("[data-persona-applied]").hidden = true;
      creationContext.originalFields.personaTemplateId = "";
      delete creationContext.originalFields.personaSnapshot;
      if (notify) showToast("已切换为自行输入，当前人群字段内容已保留");
    }
    function setPersonaPickerMode(picker, mode, notify = true) {
      const templateMode = mode === "template";
      picker.dataset.personaMode = mode;
      picker.querySelectorAll("[data-persona-source-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaSourceMode === mode));
      const templateSelect = picker.querySelector("[data-persona-template-select]");
      if (templateSelect) templateSelect.hidden = !templateMode;
      if (!templateMode) {
        window.CreationPersonaPicker?.close();
        clearPersonaPicker(picker, notify);
      } else if (notify) {
        showToast("请从模板库选择人群画像，选择后将回填本次任务字段");
      }
    }
    dynamicForm.addEventListener("click", event => {
      const sourceMode = event.target.closest("[data-persona-source-mode]");
      if (sourceMode) {
        const picker = sourceMode.closest("[data-persona-picker]");
        if (picker.dataset.personaMode !== sourceMode.dataset.personaSourceMode) setPersonaPickerMode(picker, sourceMode.dataset.personaSourceMode);
        return;
      }
      const trigger = event.target.closest("[data-persona-trigger]");
      if (trigger) {
        const picker = trigger.closest("[data-persona-picker]");
        openPersonaTemplatePicker(picker);
        return;
      }
      const clear = event.target.closest("[data-persona-clear]");
      if (clear) {
        const picker = clear.closest("[data-persona-picker]");
        setPersonaPickerMode(picker, "manual");
      }
    });
    renderPersonaLibrary();

    // ── 文案库 ──
    const clData = [
      { id:"cl1", text:"99块钱！苏泊尔这个除螨仪，能把床垫里的螨虫全吸出来！以前 Cleaning 靠晒，现在三分钟吸完，孩子过敏少了。", product:"除螨仪", crowd:"宝妈/家庭", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 14:23:05", source:"AI" },
      { id:"cl2", text:"别再用烤箱预热了！苏泊尔空气炸锅，200度15分钟，鸡翅外酥里嫩，不用一滴油，少吃油不长胖。", product:"空气炸锅", crowd:"年轻白领", structure:[{t:"compare",l:"对比"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:154, duration:28, updated:"08-04 11:07:42", source:"AI" },
      { id:"cl3", text:"苏泊尔洗地机，吸拖洗一体，干湿垃圾一次搞定，清洁力提升3倍，省时省力更省心。", product:"洗地机", crowd:"家庭主妇", structure:[{t:"proof",l:"证据"},{t:"sell",l:"卖点"}], chars:168, duration:30, updated:"08-03 16:55:18", source:"手工新增" },
      { id:"cl4", text:"姐妹们！这个面霜我真的要用喇叭喊！干皮亲妈不是吹的，用完第二天脸嫩到想摸自己一百遍。核心成分玻色因+神经酰胺，修护屏障同时锁水保湿，质地像冰淇淋一样一抹就化。现在拍一发三，错过等半年！", product:"焕颜修护面霜", crowd:"干皮/敏感肌", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 09:45:11", source:"AI" },
      { id:"cl5", text:"你是不是买了一堆护肤品，结果该起皮还是起皮？因为你根本没修屏障！XXX专研屏障修护13年，这个精华水含5重神经酰胺，3秒吸收不粘腻。现在买正装送同款旅行装。", product:"屏障修护精华水", crowd:"屏障受损/混油皮", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:142, duration:24, updated:"08-03 20:30:18", source:"AI" },
      { id:"cl6", text:"夏天出门三件套：防晒+散粉+定妆喷雾。这款防晒SPF50+PA++++，关键是跟妆不搓泥，成膜之后哑光雾面感。今天直播间拍防晒送散粉小样。", product:"哑光防晒霜", crowd:"通勤/混油皮", structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:128, duration:22, updated:"08-03 15:22:45", source:"手工新增" },
      { id:"cl7", text:"给孩子挑枕头一定要看这三点：第一材质要透气，第二高度要可调，第三枕套要能拆洗。这款儿童乳胶枕，分段护颈设计，0-12岁都能用。", product:"儿童乳胶枕", crowd:"宝妈/3-12岁", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"scene",l:"场景"}], chars:144, duration:25, updated:"08-02 22:10:33", source:"AI" },
      { id:"cl8", text:"出差党看过来！这个折叠烧水壶只有一部手机大小，5分钟烧开，316不锈钢内胆。折叠后塞包里就走，再也不用酒店的水壶了。", product:"折叠烧水壶", crowd:"出差党/旅游", structure:[{t:"scene",l:"场景"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:120, duration:20, updated:"08-02 12:08:19", source:"AI" }
    ];

    const clChipInfo = {
      hook:   {cls:"cl-chip-hook",    txt:"钩子"},
      pain:   {cls:"cl-chip-pain",    txt:"痛点"},
      sell:   {cls:"cl-chip-sell",    txt:"卖点"},
      cta:    {cls:"cl-chip-cta",     txt:"逼单"},
      proof:  {cls:"cl-chip-proof",   txt:"信任"},
      scene:  {cls:"cl-chip-scene",   txt:"场景"},
      compare:{cls:"cl-chip-compare", txt:"对比"}
    };

    function clRenderChips(struct) {
      if (!struct || !struct.length) return '<span style="color:#888;font-size:11px;">-</span>';
      const parts = struct.map(s => {
        const info = clChipInfo[s.t] || {cls:"cl-chip-other", txt:s.l||s.t};
        return '<span class="cl-chip ' + info.cls + '">' + info.txt + '</span>';
      });
      // join with +
      let html = '';
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) html += '<span style="color:#888;margin:0 2px;">+</span>';
        html += parts[i];
      }
      return '<span class="cl-chips-text">' + html + '</span>';
    }

    function clRender(data) {
      const tbody = document.getElementById("clTbody");
      const empty = document.getElementById("clEmpty");
      if (!data.length) { tbody.innerHTML = ""; empty.hidden = false; return; }
      empty.hidden = true;
      tbody.innerHTML = data.map(r => {
        const chips = clRenderChips(r.structure);
        const isAI = r.source === "AI";
        const sourceLabel = r.source === "AI" ? "AI生成" : r.source;
        const sourceTag = '<span class="cl-source-tag ' + (isAI ? 'ai' : 'import') + '">' + sourceLabel + '</span>';
        const editBtn = '<button class="cl-act-btn" onclick="clEditText(\'' + r.id + '\')">编辑</button>';
        const aiDropBtn = '<div class="cl-ai-drop"><button class="cl-ai-btn" onclick="clToggleAIMenu(event)">AI <span class="cl-ai-caret">▼</span></button><div class="cl-ai-menu"><button onclick="clAIAction(&quot;rewrite&quot;,&quot;' + r.id + '&quot;)">智能改写</button><button onclick="clAIAction(&quot;clone&quot;,&quot;' + r.id + '&quot;)">爆款仿写</button><button onclick="clAIAction(&quot;script&quot;,&quot;' + r.id + '&quot;)">智能脚本</button><button onclick="clAIAction(&quot;remix&quot;,&quot;' + r.id + '&quot;)">智能混剪</button></div></div>';
        const delBtn = '<button class="cl-act-btn cl-act-danger" onclick="clDelete(&quot;' + r.id + '&quot;)">删除</button>';
        const moreItems = [];
        if (isAI) moreItems.push('<button onclick="clLocate(\'' + r.id + '\')">定位至会话</button>');
        moreItems.push('<button onclick="AssetAudit.showHistory(\'文案\',\'' + r.product.replace(/'/g, "") + '文案\')">查看变更</button>');
        const moreBtn = '<div class="cl-more-drop"><button class="cl-act-btn cl-more-btn" onclick="clToggleMoreMenu(event)" title="更多操作">⋯</button><div class="cl-more-menu">' + moreItems.join('') + '</div></div>';
        const actBtns = editBtn + aiDropBtn + delBtn + moreBtn;
        return '<tr>'
          + '<td class="cl-col-text"><span class="cl-copy-text" data-id="' + r.id + '" title="' + escapeHtml(r.text) + '">' + r.text + '</span></td>'
          + '<td>' + sourceTag + '</td>'
          + '<td>' + r.product + '</td>'
          + '<td>' + r.crowd + '</td>'
          + '<td class="cl-col-struct">' + chips + '</td>'
          + '<td class="cl-col-chars">' + r.chars + '字/' + r.duration + 's</td>'
          + '<td class="asset-audit-cell"><b>' + (r.createdBy || '嗡大发') + '</b><small>' + (r.createdAt || '08/01 10:20') + '</small></td>'
          + '<td class="asset-audit-cell"><b>' + (r.updatedBy || '嗡大发') + '</b><small>' + r.updated.replace(/-/g, '/') .replace(/:([0-9]{2})$/, '') + '</small></td>'
          + '<td class="cl-col-act"><div class="cl-act-group">' + actBtns + '</div></td>'
          + '</tr>';
      }).join("");
    }

    // ===== 文案编辑弹窗 =====
    const clEditModal = document.getElementById("clEditModal");
    let clEditingId = null;

    function clEditText(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!item) return;
      clEditingId = id;
      // 填充字段
      document.getElementById("clEditProduct").value = item.product || "";
      document.getElementById("clEditText").value = item.text || "";
      // 元信息(只读)
      document.getElementById("clEditMetaSource").textContent = item.source || "—";
      document.getElementById("clEditMetaChars").textContent = (item.chars || item.text.length) + "字 / " + (item.duration || "—") + "s";
      document.getElementById("clEditMetaUpdated").textContent = item.updated || "—";
      clHydrateEditPersona(item);
      // 清除校验态
      clClearEditValidation();
      clUpdateEditCounter();
      // 打开弹窗
      clEditModal.classList.add("show");
      setTimeout(function() { document.getElementById("clEditProduct").focus(); }, 0);
    }

    function clClearEditValidation() {
      clEditModal.querySelectorAll(".cl-edit-field").forEach(function(f) { f.classList.remove("invalid"); });
      const err = document.getElementById("clEditModalError");
      err.hidden = true;
      err.textContent = "";
    }

    function clUpdateEditCounter() {
      const ta = document.getElementById("clEditText");
      const counter = document.getElementById("clEditCounter");
      const len = ta.value.length;
      counter.textContent = len + " / 500 字";
      counter.classList.toggle("over", len > 500);
    }

    function clCloseEditModal() {
      clEditModal.classList.remove("show");
      clEditingId = null;
    }

    function clHydrateEditPersona(item) {
      const snapshot = item.personaSnapshot || {};
      const mode = snapshot.source || (item.personaTemplateId ? "template" : "manual");
      clSetEditAudienceMode(mode);
      clSetEditAudienceValues(snapshot.audiences?.length ? snapshot.audiences : (item.crowd ? [item.crowd] : []));
      clSetEditSingleChoice("gender", snapshot.gender || "不限");
      clSetEditAge(snapshot.age || "");
      document.getElementById("clEditPersonaPain").value = Array.isArray(snapshot.pain) ? snapshot.pain.join("\n") : "";
      document.getElementById("clEditPersonaScenes").value = Array.isArray(snapshot.scenes) ? snapshot.scenes.join("\n") : "";
      if (mode === "template") clSetEditPersonaTemplate(snapshot.templateId || item.personaTemplateId || "", !item.personaSnapshot);
    }

    function clSetEditAudienceMode(mode, openTemplatePicker = false) {
      const templateMode = mode === "template";
      clEditModal.dataset.audienceMode = mode;
      clEditModal.querySelectorAll("[data-cl-audience-mode]").forEach(button => button.classList.toggle("active", button.dataset.clAudienceMode === mode));
      clEditModal.querySelector("[data-cl-audience-template]").hidden = !templateMode;
      if (!templateMode) {
        delete clEditModal.dataset.personaTemplateId;
        clEditModal.querySelector("[data-cl-persona-selected]").textContent = "选择人群画像模板";
        window.CreationPersonaPicker?.close();
      } else if (openTemplatePicker) {
        clOpenEditPersonaTemplatePicker();
      }
    }

    function clSetEditAudienceValues(values) {
      const selected = new Set(values || []);
      clEditModal.querySelectorAll("[data-cl-audience]").forEach(button => button.classList.toggle("active", selected.has(button.dataset.clAudience)));
    }

    function clSetEditSingleChoice(type, value) {
      const selector = type === "gender" ? "[data-cl-gender]" : "[data-cl-age]";
      clEditModal.querySelectorAll(selector).forEach(button => button.classList.toggle("active", button.dataset[type === "gender" ? "clGender" : "clAge"] === value));
    }

    function clSetEditAge(value) {
      const age = value === "51+" ? "50+" : value;
      const standard = [...clEditModal.querySelectorAll("[data-cl-age]")].some(button => button.dataset.clAge === age);
      clSetEditSingleChoice("age", standard ? age : (age ? "custom" : ""));
      const custom = clEditModal.querySelector("[data-cl-custom-age]");
      custom.hidden = standard || !age;
      if (!standard && age) {
        const [min, max] = age.split(/[–-]/);
        document.getElementById("clEditAgeMin").value = min || "";
        document.getElementById("clEditAgeMax").value = max || "";
      } else {
        document.getElementById("clEditAgeMin").value = "";
        document.getElementById("clEditAgeMax").value = "";
      }
    }

    function clSetEditPersonaTemplate(id, applyFields = true) {
      const persona = personaCatalog.find(item => item.id === id);
      const label = clEditModal.querySelector("[data-cl-persona-selected]");
      if (!persona) {
        delete clEditModal.dataset.personaTemplateId;
        label.textContent = "选择人群画像模板";
        return;
      }
      clEditModal.dataset.personaTemplateId = persona.id;
      label.textContent = persona.name;
      if (!applyFields) return;
      clSetEditAudienceValues([persona.audience]);
      clSetEditSingleChoice("gender", persona.gender || "不限");
      clSetEditAge(persona.age || "");
      document.getElementById("clEditPersonaPain").value = (persona.pain || []).join("\n");
      document.getElementById("clEditPersonaScenes").value = (persona.scenes || []).join("\n");
    }

    function clOpenEditPersonaTemplatePicker() {
      if (!window.CreationPersonaPicker) return showToast("人群模板选择器加载失败，请刷新页面后重试。");
      const product = document.getElementById("clEditProduct").value.trim();
      window.CreationPersonaPicker.open({
        items: personaCatalog.map(persona => ({ ...persona, recommended:persona.product === product })),
        selectedId:clEditModal.dataset.personaTemplateId || "",
        onConfirm(persona) { clSetEditPersonaTemplate(persona?.id || ""); }
      });
    }

    function clReadEditPersona() {
      const audiences = [...clEditModal.querySelectorAll("[data-cl-audience].active")].map(button => button.dataset.clAudience);
      const gender = clEditModal.querySelector("[data-cl-gender].active")?.dataset.clGender || "不限";
      const ageChoice = clEditModal.querySelector("[data-cl-age].active")?.dataset.clAge || "";
      const age = ageChoice === "custom"
        ? [document.getElementById("clEditAgeMin").value.trim(), document.getElementById("clEditAgeMax").value.trim()].filter(Boolean).join("–")
        : ageChoice;
      const splitLines = id => document.getElementById(id).value.split("\n").map(value => value.trim()).filter(Boolean);
      return {
        source:clEditModal.dataset.audienceMode || "manual",
        templateId:clEditModal.dataset.personaTemplateId || "",
        audiences,
        gender,
        age,
        pain:splitLines("clEditPersonaPain"),
        scenes:splitLines("clEditPersonaScenes")
      };
    }

    function clApplyEditAiSuggestion(type) {
      const product = document.getElementById("clEditProduct").value.trim() || "产品";
      const samples = type === "pain"
        ? [[`担心${product}使用效果不稳定`, "不想花太多时间处理日常麻烦"], ["希望一次解决核心问题", "更在意使用过程是否省心"]]
        : [[`${product}的日常使用场景`, "需要快速处理问题的即时场景"], ["周末集中使用场景", "家人共同使用的生活场景"]];
      const key = type === "pain" ? "painSuggestionIndex" : "sceneSuggestionIndex";
      const index = Number(clEditModal.dataset[key] || 0) % samples.length;
      document.getElementById(type === "pain" ? "clEditPersonaPain" : "clEditPersonaScenes").value = samples[index].join("\n");
      clEditModal.dataset[key] = String(index + 1);
    }

    function clSaveEditModal() {
      if (!clEditingId) return;
      const product = document.getElementById("clEditProduct").value.trim();
      const persona = clReadEditPersona();
      const text = document.getElementById("clEditText").value.trim();
      // 校验
      clClearEditValidation();
      let firstInvalid = null;
      const mark = function(el) {
        const field = el.closest(".cl-edit-field");
        if (field) field.classList.add("invalid");
        if (!firstInvalid) firstInvalid = el;
      };
      if (!product) mark(document.getElementById("clEditProduct"));
      if (!persona.audiences.length || (persona.source === "template" && !persona.templateId)) mark(document.getElementById("clEditPersonaField"));
      if (text.length < 5 || text.length > 500) mark(document.getElementById("clEditText"));
      if (firstInvalid) {
        const err = document.getElementById("clEditModalError");
        err.hidden = false;
        const msgs = [];
        if (!product) msgs.push("关联产品");
        if (!persona.audiences.length) msgs.push("核心目标人群");
        else if (persona.source === "template" && !persona.templateId) msgs.push("人群画像模板");
        if (text.length < 5) msgs.push("文案不能少于 5 字");
        else if (text.length > 500) msgs.push("文案不能超过 500 字");
        err.textContent = "请检查：" + msgs.join("、");
        firstInvalid.focus();
        return;
      }
      const item = clData.find(function(r) { return r.id === clEditingId; });
      if (!item) { clCloseEditModal(); return; }
      item.text = text;
      item.product = product;
      item.crowd = persona.audiences.join("、");
      const previousPersonaId = item.personaTemplateId || "";
      item.personaTemplateId = persona.templateId;
      item.personaSnapshot = persona;
      if (item.personaTemplateId && item.personaTemplateId !== previousPersonaId) {
        const persona = personaCatalog.find(entry => entry.id === item.personaTemplateId);
        if (persona) persona.usage += 1;
      }
      item.chars = text.length;
      item.updated = new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
      clCloseEditModal();
      clFilterAndRender();
      showToast("文案已更新");
    }

    // 弹窗事件绑定
    if (clEditModal) {
      clEditModal.addEventListener("click", function(e) {
        if (e.target === clEditModal) clCloseEditModal();
        const modeButton = e.target.closest("[data-cl-audience-mode]");
        if (modeButton) {
          clSetEditAudienceMode(modeButton.dataset.clAudienceMode, modeButton.dataset.clAudienceMode === "template");
          return;
        }
        if (e.target.closest("[data-cl-persona-trigger]")) clOpenEditPersonaTemplatePicker();
        const audienceButton = e.target.closest("[data-cl-audience]");
        if (audienceButton) audienceButton.classList.toggle("active");
        const genderButton = e.target.closest("[data-cl-gender]");
        if (genderButton) clSetEditSingleChoice("gender", genderButton.dataset.clGender);
        const ageButton = e.target.closest("[data-cl-age]");
        if (ageButton) {
          clSetEditSingleChoice("age", ageButton.dataset.clAge);
          clEditModal.querySelector("[data-cl-custom-age]").hidden = ageButton.dataset.clAge !== "custom";
        }
        const aiSuggest = e.target.closest("[data-cl-ai-suggest]");
        if (aiSuggest) clApplyEditAiSuggestion(aiSuggest.dataset.clAiSuggest);
      });
      document.querySelectorAll("[data-close-cl-edit]").forEach(function(b) { b.addEventListener("click", clCloseEditModal); });
      document.getElementById("clEditSave")?.addEventListener("click", clSaveEditModal);
      // 字数实时计数
      document.getElementById("clEditText")?.addEventListener("input", clUpdateEditCounter);
      // Esc 关闭 / Cmd+Enter 保存
      clEditModal.addEventListener("keydown", function(e) {
        if (e.key === "Escape") { e.preventDefault(); clCloseEditModal(); }
        else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); clSaveEditModal(); }
      });
    }

    function clCloseActionMenus() {
      document.querySelectorAll(".cl-ai-menu.show, .cl-more-menu.show").forEach(m => m.classList.remove("show"));
      document.querySelectorAll(".cl-col-act.cl-menu-open").forEach(cell => cell.classList.remove("cl-menu-open"));
    }

    function clToggleAIMenu(e) {
      e.stopPropagation();
      const menu = e.target.closest(".cl-ai-drop").querySelector(".cl-ai-menu");
      const shouldOpen = !menu.classList.contains("show");
      clCloseActionMenus();
      if (shouldOpen) {
        menu.classList.add("show");
        menu.closest(".cl-col-act")?.classList.add("cl-menu-open");
      }
    }

    function clToggleMoreMenu(e) {
      e.stopPropagation();
      const menu = e.target.closest(".cl-more-drop").querySelector(".cl-more-menu");
      const shouldOpen = !menu.classList.contains("show");
      clCloseActionMenus();
      if (shouldOpen) {
        menu.classList.add("show");
        menu.closest(".cl-col-act")?.classList.add("cl-menu-open");
      }
    }

    function clAIAction(action, id) {
      const labels = {rewrite:"智能改写", clone:"爆款仿写", script:"智能脚本", remix:"智能混剪"};
      showToast('「' + (labels[action]||action) + '」已创建任务，跳转至 AI 创作...');
      clCloseActionMenus();
      setTimeout(function() { document.querySelector('.nav-item[data-page="creation"]').click(); }, 600);
    }

    function clLocate(id) {
      const item = clData.find(function(r) { return r.id === id; });
      showToast("已定位至「" + item.product + "」的生成会话");
    }

    function clDelete(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!confirm('确定删除文案「' + item.product + '」？\n\n此操作不可撤销。')) return;
      const idx = clData.findIndex(function(r) { return r.id === id; });
      if (idx > -1) { clData.splice(idx, 1); }
      clFilterAndRender();
      showToast("文案已删除");
    }

    function clUpdateHeadStats() {
      const ai = clData.filter(function(r) { return r.source === "AI"; }).length;
      const manual = clData.filter(function(r) { return r.source === "手工新增"; }).length;
      const video = clData.filter(function(r) { return r.source === "视频识别"; }).length;
      const el = document.getElementById("clHeadStats");
      if (el) el.textContent = '共 ' + clData.length + ' 条 · AI生成 ' + ai + ' · 手工新增 ' + manual + ' · 视频识别 ' + video;
    }

    function clFilterAndRender() {
      const src = document.getElementById("clSourceFilter")?.value || "all";
      const kw = (document.getElementById("clSearchInput")?.value || "").trim().toLowerCase();
      let filtered = clData;
      if (src !== "all") filtered = filtered.filter(function(r) { return r.source === src; });
      if (kw) filtered = filtered.filter(function(r) { return r.text.toLowerCase().includes(kw) || r.product.toLowerCase().includes(kw) || r.crowd.toLowerCase().includes(kw); });
      clRender(filtered);
    }

    // 绑定 & 初始化
    (function() {
      const srcF = document.getElementById("clSourceFilter");
      const kwF = document.getElementById("clSearchInput");
      if (srcF) srcF.addEventListener("change", clFilterAndRender);
      if (kwF) kwF.addEventListener("input", clFilterAndRender);
      clRender(clData);
    })();

    document.addEventListener("click", clCloseActionMenus);
    const clCreateModal = document.getElementById("clCreateModal");
    const clParseStatus = document.getElementById("clParseStatus");
    let clCreateSource = "manual";
    const clCreateTextState = {
      manual:{ text:"", parse:null },
      library:{ text:"", parse:null },
      upload:{ text:"", parse:null }
    };
    const clVideoCopyMap = {
      "7553983811703193643":"你以为床垫看着干净就够了吗？实际走一遍才知道，藏在纤维深处的细小灰尘根本不是换床单能解决的。轻净 Pro 除螨仪拍打和吸尘同步进行，透明尘杯里吸出了什么，清洁结果当场就能看见。床垫、沙发和布艺都能用，尘杯还能拆下来清洗。想看完整清洁过程，点进商品看实测。",
      "7553983811703197228":"下班回家不想守在厨房，就把食材放进轻享空气炸锅 A8。可视窗口能直接看到上色情况，不用反复开盖，家庭容量一次就能做够。炸篮用完可以拆洗，今晚直播间还有配套赠品，具体优惠以页面展示为准。"
    };
    const clVideoAudienceMap = {
      "7553983811703193643":{ audience:"精致妈妈", gender:"女性", age:"24–30", pain:"床垫深处灰尘难以日常清理\n孩子接触织物后容易敏感", scenes:"宝宝家庭的床垫日常清洁\n布艺沙发与毛绒玩具清洁" },
      "7553983811703197228":{ audience:"新锐白领", gender:"不限", age:"24–30", pain:"下班后做饭时间不足\n传统烹饪需要反复看守", scenes:"工作日晚餐快速制作\n周末家庭小食制作" }
    };
    const clCreateVideoFallback = [
      { id:"7553983811703193643", source:"finished", title:"除螨仪结果冲击型主视频", channel:"历史投放", product:"轻净 Pro 除螨仪", duration:"00:32", origin:"千川素材", status:"已分析", updated:"08-04 14:20", tags:["结果前置","清洁演示"], auxiliary:"素材 ID 7553983811703193643", transcript:clVideoCopyMap["7553983811703193643"] },
      { id:"7553983811703197228", source:"finished", title:"空气炸锅晚餐场景视频", channel:"历史投放", product:"轻享空气炸锅 A8", duration:"00:28", origin:"千川素材", status:"已分析", updated:"08-04 11:07", tags:["晚餐场景","效率卖点"], auxiliary:"素材 ID 7553983811703197228", transcript:clVideoCopyMap["7553983811703197228"] },
      { id:"ref-clean-001", source:"external", title:"床褥清洁结果型参考视频", channel:"抖音", product:"未关联产品", duration:"00:36", origin:"外部参考", status:"已分析", updated:"08-03 18:30", tags:["痛点冲突","结果证明"], auxiliary:"拉片版本 V3", transcript:"床褥表面看着干净，深层问题却常常被忽略。先解决核心问题，再展示实际清洁结果，整个过程更有说服力。" },
      { id:"ref-kitchen-002", source:"external", title:"一人食效率场景参考视频", channel:"抖音", product:"未关联产品", duration:"00:24", origin:"外部参考", status:"已分析", updated:"08-02 12:08", tags:["场景开场","节奏紧凑"], auxiliary:"拉片版本 V2", transcript:"下班回家时间有限，做饭最怕步骤复杂。用更简单的方式把晚餐安排好，日常才更轻松。" }
    ];

    function setClAudienceChoice(group, value) {
      const host = clCreateModal.querySelector(`[data-cl-choice-group="${group}"]`);
      if (!host) return;
      const matched = [...host.querySelectorAll(".cl-audience-chip")].find(button => button.dataset.value === value);
      host.querySelectorAll(".cl-audience-chip").forEach(button => button.classList.toggle("active", button === matched));
      if (group === "age") document.getElementById("clCustomAge")?.classList.toggle("show", value === "custom");
    }
    function getClAudienceChoice(group) {
      return clCreateModal.querySelector(`[data-cl-choice-group="${group}"] .cl-audience-chip.active`)?.dataset.value || "";
    }
    function resetClAudienceFields() {
      setClAudienceChoice("audience", "精致妈妈");
      setClAudienceChoice("gender", "不限");
      setClAudienceChoice("age", "24–30");
      document.getElementById("clAgeMin").value = "";
      document.getElementById("clAgeMax").value = "";
      document.getElementById("clCreatePain").value = "";
      document.getElementById("clCreateScenes").value = "";
    }

    function setClCreatePersonaMode(mode, openTemplatePicker = false) {
      const templateMode = mode === "template";
      clCreateModal.dataset.personaMode = mode;
      clCreateModal.querySelectorAll("[data-cl-create-persona-mode]").forEach(button => button.classList.toggle("active", button.dataset.clCreatePersonaMode === mode));
      clCreateModal.querySelector("[data-cl-create-template-select]").hidden = !templateMode;
      if (!templateMode) {
        delete clCreateModal.dataset.personaTemplateId;
        clCreateModal.querySelector("[data-cl-create-persona-selected]").textContent = "选择人群画像模板";
        window.CreationPersonaPicker?.close();
      } else if (openTemplatePicker) {
        openClCreatePersonaTemplatePicker();
      }
    }

    function setClCreatePersonaTemplate(id) {
      const persona = personaCatalog.find(item => item.id === id);
      const label = clCreateModal.querySelector("[data-cl-create-persona-selected]");
      if (!persona) {
        delete clCreateModal.dataset.personaTemplateId;
        label.textContent = "选择人群画像模板";
        return;
      }
      clCreateModal.dataset.personaTemplateId = persona.id;
      label.textContent = persona.name;
      setClAudienceChoice("audience", persona.audience || "");
      setClAudienceChoice("gender", persona.gender || "不限");
      const age = persona.age === "50+" ? "51+" : persona.age;
      const standard = [...clCreateModal.querySelectorAll('[data-cl-choice-group="age"] .cl-audience-chip')].some(button => button.dataset.value === age);
      setClAudienceChoice("age", standard ? age : "custom");
      if (!standard) {
        const [min, max] = String(persona.age || "").split(/[–-]/);
        document.getElementById("clAgeMin").value = min || "";
        document.getElementById("clAgeMax").value = max || "";
      }
      document.getElementById("clCreatePain").value = (persona.pain || []).join("\n");
      document.getElementById("clCreateScenes").value = (persona.scenes || []).join("\n");
    }

    function openClCreatePersonaTemplatePicker() {
      if (!window.CreationPersonaPicker) return showToast("人群模板选择器加载失败，请刷新页面后重试。");
      const product = productCatalog[document.getElementById("clCreateProduct").value]?.name || "";
      window.CreationPersonaPicker.open({
        items:personaCatalog.map(persona => ({ ...persona, recommended:persona.product === product })),
        selectedId:clCreateModal.dataset.personaTemplateId || "",
        onConfirm(persona) { setClCreatePersonaTemplate(persona?.id || ""); }
      });
    }

    function applyClCreateAiSuggestion(type) {
      const product = productCatalog[document.getElementById("clCreateProduct").value]?.name || "产品";
      const samples = type === "pain"
        ? [[`担心${product}实际效果不稳定`, "不想为日常问题反复花时间"], ["希望一次解决核心问题", "更在意使用过程是否省心"]]
        : [[`${product}的日常使用场景`, "需要快速处理问题的即时场景"], ["周末集中使用场景", "家人共同使用的生活场景"]];
      const key = type === "pain" ? "painSuggestionIndex" : "sceneSuggestionIndex";
      const index = Number(clCreateModal.dataset[key] || 0) % samples.length;
      document.getElementById(type === "pain" ? "clCreatePain" : "clCreateScenes").value = samples[index].join("\n");
      clCreateModal.dataset[key] = String(index + 1);
    }

    function getClCreateVideoItems() {
      const catalog = typeof readReferenceVideoCatalog === "function" ? readReferenceVideoCatalog() : [];
      const ids = new Set(catalog.map(item => item.id));
      return [...catalog, ...clCreateVideoFallback.filter(item => !ids.has(item.id))];
    }

    function setClCreateProduct(productId, product = productCatalog[productId]) {
      const input = document.getElementById("clCreateProduct");
      const label = clCreateModal.querySelector("[data-cl-create-product-label]");
      if (!input || !label) return;
      input.value = productId || "";
      label.textContent = product?.name || "选择产品";
      label.classList.toggle("placeholder", !product?.name);
    }

    function openClCreateProductPicker() {
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        items:Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId:document.getElementById("clCreateProduct").value,
        onConfirm(productId, product) {
          setClCreateProduct(productId, product);
        }
      });
    }

    function getClCreateTextState(source = clCreateSource) {
      return clCreateTextState[source] || (clCreateTextState[source] = { text:"", parse:null });
    }

    function storeClCreateText(source = clCreateSource) {
      const field = document.getElementById("clCreateText");
      if (field) getClCreateTextState(source).text = field.value;
    }

    function renderClCreateParseState(source = clCreateSource) {
      const state = getClCreateTextState(source);
      const parse = state.parse;
      if (!parse) {
        clParseStatus.hidden = true;
        clParseStatus.classList.remove("is-parsing");
        return;
      }
      clParseStatus.hidden = false;
      clParseStatus.classList.toggle("is-parsing", parse.status === "parsing");
      clParseStatus.querySelector("b").textContent = parse.status === "parsing" ? "" : "✓";
      clParseStatus.querySelector("span").textContent = parse.message;
    }

    function startClCreateParse(source, label, text) {
      const state = getClCreateTextState(source);
      const parseToken = `${Date.now()}-${Math.random()}`;
      state.text = "";
      state.parseToken = parseToken;
      state.parse = { status:"parsing", message:`正在解析“${label}”的口播文案…` };
      if (clCreateSource === source) {
        document.getElementById("clCreateText").value = "";
        renderClCreateParseState(source);
      }
      window.setTimeout(() => {
        if (state.parseToken !== parseToken) return;
        state.text = text;
        state.parse = { status:"done", message:`“${label}”口播识别完成，可继续修改后保存。` };
        if (clCreateSource === source) {
          document.getElementById("clCreateText").value = text;
          renderClCreateParseState(source);
        }
        showToast("视频口播识别完成");
      }, 700);
    }

    function applyClCreateVideo(video) {
      if (!video) return;
      const matchedProduct = Object.entries(productCatalog).find(([, product]) => product.name === video.product);
      if (matchedProduct) setClCreateProduct(matchedProduct[0], matchedProduct[1]);
      const audience = clVideoAudienceMap[video.id];
      if (audience) {
        setClAudienceChoice("audience", audience.audience);
        setClAudienceChoice("gender", audience.gender);
        setClAudienceChoice("age", audience.age);
        document.getElementById("clCreatePain").value = audience.pain;
        document.getElementById("clCreateScenes").value = audience.scenes;
      }
      setClCreatePersonaMode("manual");
      const trigger = clCreateModal.querySelector("[data-cl-create-video-trigger-text]");
      trigger.textContent = "重新选择视频";
      const selected = clCreateModal.querySelector("[data-cl-create-selected-video]");
      selected.hidden = false;
      selected.innerHTML = `<strong>${escapeHtml(video.title || "已选视频")}</strong><span>${escapeHtml(video.source === "external" ? "外部参考视频" : "成片视频")} · ${escapeHtml(video.channel || "—")} · ${escapeHtml(video.duration || "—")}</span>`;
      clCreateModal.dataset.selectedVideoId = video.id || "";
      const state = getClCreateTextState("library");
      state.videoId = video.id || "";
      startClCreateParse("library", video.title || "已选视频", video.transcript || clVideoCopyMap[video.id] || "该视频已完成口播解析，请根据识别结果补充或调整文案内容。");
    }

    function openClCreateVideoPicker() {
      if (!window.CreationVideoPicker) return showToast("视频选择器加载失败，请刷新页面后重试。");
      window.CreationVideoPicker.open({
        items:getClCreateVideoItems(),
        selectedId:clCreateModal.dataset.selectedVideoId || "",
        onConfirm(video) { applyClCreateVideo(video); }
      });
    }

    function setClCreateSource(source, openVideoPicker = false) {
      storeClCreateText(clCreateSource);
      clCreateSource = source;
      clCreateModal.querySelectorAll("[data-cl-create-source]").forEach(button => button.classList.toggle("active", button.dataset.clCreateSource === source));
      clCreateModal.querySelectorAll("[data-cl-create-panel]").forEach(panel => { panel.hidden = panel.dataset.clCreatePanel !== source; });
      document.getElementById("clCreateText").value = getClCreateTextState(source).text;
      renderClCreateParseState(source);
      if (source === "library" && openVideoPicker) openClCreateVideoPicker();
    }

    function openClCreateModal() {
      clCreateModal.querySelectorAll("input:not([type=file]), textarea").forEach(field => { field.value = ""; });
      Object.keys(clCreateTextState).forEach(source => { clCreateTextState[source] = { text:"", parse:null }; });
      document.getElementById("clVideoUploadInput").value = "";
      setClCreateProduct("");
      delete clCreateModal.dataset.selectedVideoId;
      const videoTrigger = clCreateModal.querySelector("[data-cl-create-video-trigger-text]");
      if (videoTrigger) videoTrigger.textContent = "从视频库选择";
      const selectedVideo = clCreateModal.querySelector("[data-cl-create-selected-video]");
      if (selectedVideo) { selectedVideo.hidden = true; selectedVideo.innerHTML = ""; }
      renderClCreateParseState("manual");
      resetClAudienceFields();
      setClCreatePersonaMode("manual");
      setClCreateSource("manual");
      clCreateModal.classList.add("show");
      setTimeout(() => {
        const body = clCreateModal.querySelector(".modal-body");
        if (body) body.scrollTop = 0;
        clCreateModal.querySelector("[data-cl-create-product-picker]")?.focus();
      }, 0);
    }

    document.getElementById("clCreateBtn")?.addEventListener("click", openClCreateModal);
    document.querySelectorAll("[data-close-cl-create]").forEach(button => button.addEventListener("click", () => clCreateModal.classList.remove("show")));
    clCreateModal?.addEventListener("click", event => {
      if (event.target === clCreateModal) return clCreateModal.classList.remove("show");
      const source = event.target.closest("[data-cl-create-source]");
      if (source) return setClCreateSource(source.dataset.clCreateSource, source.dataset.clCreateSource === "library" && !clCreateModal.dataset.selectedVideoId);
      if (event.target.closest("[data-cl-create-video-picker]")) return openClCreateVideoPicker();
      if (event.target.closest("[data-cl-create-product-picker]")) return openClCreateProductPicker();
      const personaMode = event.target.closest("[data-cl-create-persona-mode]");
      if (personaMode) return setClCreatePersonaMode(personaMode.dataset.clCreatePersonaMode, personaMode.dataset.clCreatePersonaMode === "template");
      if (event.target.closest("[data-cl-create-persona-trigger]")) return openClCreatePersonaTemplatePicker();
      const aiSuggest = event.target.closest("[data-cl-create-ai-suggest]");
      if (aiSuggest) return applyClCreateAiSuggestion(aiSuggest.dataset.clCreateAiSuggest);
      const choice = event.target.closest(".cl-audience-chip");
      if (choice) {
        const group = choice.closest("[data-cl-choice-group]")?.dataset.clChoiceGroup;
        if (group) setClAudienceChoice(group, choice.dataset.value);
        return;
      }
    });
    document.getElementById("clVideoUploadTrigger")?.addEventListener("click", () => document.getElementById("clVideoUploadInput").click());
    document.getElementById("clVideoUploadInput")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      startClCreateParse("upload", file.name, "先别只看表面，真正影响使用体验的是核心问题有没有被解决。这个产品通过实际操作完成主要处理，并把结果直接展示出来；日常使用步骤更少，后续整理也更方便。想看完整使用过程，可以继续查看产品演示。");
    });
    copyStructureDetailModal?.addEventListener("click", event => {
      const tab = event.target.closest("[data-copy-detail-tab]");
      if (tab) {
        copyStructureDetailModal.querySelectorAll("[data-copy-detail-tab]").forEach(button => button.classList.toggle("active", button === tab));
        copyStructureDetailModal.querySelectorAll("[data-copy-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.copyDetailPanel === tab.dataset.copyDetailTab));
        return;
      }
      const toggle = event.target.closest("[data-copy-stage-toggle]");
      if (toggle) return toggle.closest("[data-copy-stage-card]").classList.toggle("expanded");
      if (event.target.closest("[data-copy-stage-copy]")) {
        const text = event.target.closest("[data-copy-stage-card]").querySelector(".copy-stage-talk p")?.textContent || "";
        navigator.clipboard?.writeText(text);
        return showToast("可复用话术已复制");
      }
      const jump = event.target.closest("[data-copy-jump-source]");
      if (jump) showToast(`已定位参考成品的第 ${Number(jump.dataset.copyJumpSource) + 1} 个结构阶段`);
    });
    document.getElementById("clCreateText")?.addEventListener("input", event => {
      getClCreateTextState().text = event.target.value;
    });
    document.getElementById("clCreateSave")?.addEventListener("click", () => {
      const productId = document.getElementById("clCreateProduct").value;
      const product = productCatalog[productId]?.name || "";
      const audience = getClAudienceChoice("audience");
      const gender = getClAudienceChoice("gender");
      let age = getClAudienceChoice("age");
      if (age === "custom") {
        const min = Number(document.getElementById("clAgeMin").value);
        const max = Number(document.getElementById("clAgeMax").value);
        if (!min || !max || min > max) return showToast("请填写正确的自定义年龄区间");
        age = `${min}–${max}`;
      }
      const crowd = `${audience} / ${gender} / ${age}`;
      const pain = document.getElementById("clCreatePain").value.trim();
      const scenes = document.getElementById("clCreateScenes").value.trim();
      const text = document.getElementById("clCreateText").value.trim();
      if (getClCreateTextState().parse?.status === "parsing") return showToast("视频口播正在解析，请完成后再保存");
      if (!productId) return showToast("请选择关联产品");
      if (!audience || !gender || !age) return showToast("请完整选择目标人群、性别和年龄");
      if (clCreateModal.dataset.personaMode === "template" && !clCreateModal.dataset.personaTemplateId) return showToast("请从模板库选择人群画像");
      if (!text) return showToast("请填写或识别文案内容");
      const chars = text.replace(/\s/g, "").length;
      const now = new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
      const personaSnapshot = { source:clCreateModal.dataset.personaMode || "manual", templateId:clCreateModal.dataset.personaTemplateId || "", audiences:[audience], gender, age, pain:pain.split("\n").map(value => value.trim()).filter(Boolean), scenes:scenes.split("\n").map(value => value.trim()).filter(Boolean) };
      if (personaSnapshot.templateId) {
        const persona = personaCatalog.find(item => item.id === personaSnapshot.templateId);
        if (persona) persona.usage += 1;
      }
      clData.unshift({ id:`cl-${Date.now()}`, text, product, crowd, pain, scenes, personaTemplateId:personaSnapshot.templateId, personaSnapshot, structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"行动引导"}], chars, duration:Math.max(1,Math.round(chars/4)), updated:now, source:clCreateSource === "manual" ? "手工新增" : "视频识别" });
      clCreateModal.classList.remove("show");
      document.getElementById("clSourceFilter").value = "all";
      document.getElementById("clSearchInput").value = "";
      clFilterAndRender();
      clUpdateHeadStats();
      showToast("文案已新增并保存到文案库");
    });

    /* ===== 组织权限与公共事实库增强（原型交互） ===== */
    (() => {
      const permissionModules = [
        { name:"AI创作", actions:["查看", "发起创作", "保存资产", "删除会话"] },
        { name:"品牌库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"产品库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"文案库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"模板库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"系统管理", actions:["查看成员权限", "配置角色", "同步钉钉人员"] }
      ];
      const roles = {
        admin:{ name:"管理员", desc:"拥有当前团队全部菜单和按钮权限", permissions:{} },
        creator:{ name:"运营／创作成员", desc:"可创作并维护业务资产，不可管理系统权限", permissions:{} },
        viewer:{ name:"只读成员", desc:"仅可查看授权范围内的菜单与资产", permissions:{} }
      };
      permissionModules.forEach(module => module.actions.forEach(action => {
        const key = `${module.name}:${action}`;
        roles.admin.permissions[key] = true;
        roles.creator.permissions[key] = module.name !== "系统管理" && !["删除"].includes(action);
        roles.viewer.permissions[key] = action === "查看";
      }));
      const members = [
        { name:"嗡大发", dept:"抖音三区", role:"admin", scope:"all", status:"在职" },
        { name:"林运营", dept:"内容运营·小家电组", role:"creator", scope:"team", status:"在职" },
        { name:"王剪辑", dept:"视频中心·混剪组", role:"creator", scope:"personal", status:"在职" },
        { name:"陈观察", dept:"经营分析组", role:"viewer", scope:"team", status:"在职" }
      ];
      let activeRole = "admin";
      const roleList = document.getElementById("permissionRoleList");
      const tree = document.getElementById("permissionTree");
      const memberRows = document.getElementById("permissionMemberRows");
      const roleTitle = document.getElementById("permissionRoleTitle");
      const roleDesc = document.getElementById("permissionRoleDesc");

      function renderPermissionTree() {
        if (!tree || !roles[activeRole]) return;
        tree.innerHTML = permissionModules.map(module => `<section class="permission-tree-group"><div class="permission-tree-head"><strong>${module.name}</strong><label><input type="checkbox" data-module-all="${module.name}"> 全选</label></div><div class="permission-actions">${module.actions.map(action => { const key = `${module.name}:${action}`; return `<label><input type="checkbox" data-permission-key="${key}" ${roles[activeRole].permissions[key] ? "checked" : ""}> ${action}</label>`; }).join("")}</div></section>`).join("");
        tree.querySelectorAll("[data-module-all]").forEach(box => {
          const children = [...tree.querySelectorAll(`[data-permission-key^="${box.dataset.moduleAll}:"]`)];
          box.checked = children.every(child => child.checked);
          box.indeterminate = !box.checked && children.some(child => child.checked);
        });
      }
      function renderMembers() {
        if (!memberRows) return;
        memberRows.innerHTML = members.map((member, index) => `<tr><td><strong>${member.name}</strong></td><td>${member.dept}</td><td><select data-member-role="${index}">${Object.entries(roles).map(([key, role]) => `<option value="${key}" ${member.role === key ? "selected" : ""}>${role.name}</option>`).join("")}</select></td><td><select data-member-scope="${index}"><option value="personal" ${member.scope === "personal" ? "selected" : ""}>仅个人</option><option value="team" ${member.scope === "team" ? "selected" : ""}>个人及团队</option><option value="all" ${member.scope === "all" ? "selected" : ""}>当前公司全部</option></select></td><td><span class="badge green">${member.status}</span></td></tr>`).join("");
      }
      function selectRole(key) {
        if (!roles[key]) return;
        activeRole = key;
        roleList?.querySelectorAll("[data-permission-role]").forEach(button => button.classList.toggle("active", button.dataset.permissionRole === key));
        roleTitle.textContent = roles[key].name;
        roleDesc.textContent = roles[key].desc;
        renderPermissionTree();
      }
      roleList?.addEventListener("click", event => {
        const role = event.target.closest("[data-permission-role]");
        if (role) selectRole(role.dataset.permissionRole);
      });
      tree?.addEventListener("change", event => {
        const box = event.target;
        if (box.matches("[data-permission-key]")) roles[activeRole].permissions[box.dataset.permissionKey] = box.checked;
        if (box.matches("[data-module-all]")) {
          tree.querySelectorAll(`[data-permission-key^="${box.dataset.moduleAll}:"]`).forEach(child => { child.checked = box.checked; roles[activeRole].permissions[child.dataset.permissionKey] = box.checked; });
        }
        renderPermissionTree();
        showToast("角色权限已保存");
      });
      memberRows?.addEventListener("change", event => {
        const roleSelect = event.target.closest("[data-member-role]");
        const scopeSelect = event.target.closest("[data-member-scope]");
        if (roleSelect) members[Number(roleSelect.dataset.memberRole)].role = roleSelect.value;
        if (scopeSelect) members[Number(scopeSelect.dataset.memberScope)].scope = scopeSelect.value;
        showToast("成员权限已更新");
      });
      document.getElementById("syncDingMembers")?.addEventListener("click", event => {
        const button = event.currentTarget;
        button.disabled = true; button.textContent = "同步中…";
        setTimeout(() => { button.disabled = false; button.textContent = "同步钉钉人员"; renderMembers(); showToast("已同步 4 名在职成员，未发现组织变更"); }, 900);
      });

      const roleModal = document.createElement("div");
      roleModal.className = "modal-backdrop";
      roleModal.innerHTML = `<div class="modal" style="max-width:520px"><div class="modal-head"><div><span class="badge">成员权限</span><h3>新建角色</h3></div><button class="close-btn" type="button" data-close-new-role>×</button></div><div class="modal-body"><div class="field"><label>角色名称<span class="required-mark">*</span></label><input data-new-role-name placeholder="例如：高级运营"></div><div class="field"><label>角色说明</label><textarea data-new-role-desc placeholder="说明该角色负责的业务范围"></textarea></div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-close-new-role>取消</button><button class="primary-btn" type="button" data-save-new-role>创建角色</button></div></div>`;
      document.body.append(roleModal);
      document.getElementById("newPermissionRole")?.addEventListener("click", () => { roleModal.classList.add("show"); roleModal.querySelector("[data-new-role-name]").focus(); });
      roleModal.addEventListener("click", event => {
        if (event.target === roleModal || event.target.closest("[data-close-new-role]")) return roleModal.classList.remove("show");
        if (!event.target.closest("[data-save-new-role]")) return;
        const name = roleModal.querySelector("[data-new-role-name]").value.trim();
        if (!name) return showToast("请输入角色名称");
        if (Object.values(roles).some(role => role.name === name)) return showToast("角色名称已存在");
        const key = `role-${Date.now()}`;
        roles[key] = { name, desc:roleModal.querySelector("[data-new-role-desc]").value.trim() || "自定义业务角色", permissions:{} };
        permissionModules.forEach(module => module.actions.forEach(action => roles[key].permissions[`${module.name}:${action}`] = false));
        const button = document.createElement("button"); button.type="button"; button.className="permission-role"; button.dataset.permissionRole=key; button.textContent=name; roleList.append(button);
        roleModal.classList.remove("show"); selectRole(key); renderMembers(); showToast(`角色“${name}”已创建`);
      });
      selectRole(activeRole); renderMembers();

      function renderBrandRelations() {
        const container = document.getElementById("brandRelatedProducts");
        const count = document.getElementById("brandRelatedCount");
        if (!container || !brandCatalog[currentBrandId]) return;
        const brandName = brandCatalog[currentBrandId].name;
        const products = Object.entries(productDetailData).filter(([, product]) => product.brand === brandName);
        if (count) count.textContent = `${products.length} 个产品`;
        container.innerHTML = products.length ? products.map(([id, product]) => `<button type="button" class="brand-related-product" data-brand-related-product="${id}"><span class="brand-related-thumb"></span><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category || "未分类")} · ${escapeHtml(product.price || "价格待补充")}</small></span><b>查看详情 ›</b></button>`).join("") : `<div class="empty-state"><strong>暂无关联产品</strong><span>在产品库为产品选择该品牌后，将自动显示在这里。</span></div>`;
      }
      function syncBrandCardCounts() {
        brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => {
          const brand = brandCatalog[card.dataset.brandId];
          if (!brand) return;
          const total = Object.values(productDetailData).filter(product => product.brand === brand.name).length;
          const countNode = card.querySelector(".brand-card-foot span:first-child");
          if (countNode) countNode.textContent = `关联产品 ${total}`;
        });
      }
      window.syncBrandCardCounts = syncBrandCardCounts;
      brandGrid?.addEventListener("click", event => { if (event.target.closest("[data-brand-id]") && !event.target.closest("[data-toggle-card-menu],[data-delete-brand]")) setTimeout(renderBrandRelations, 0); }, true);
      document.getElementById("brandRelatedProducts")?.addEventListener("click", event => { const target = event.target.closest("[data-brand-related-product]"); if (target) openProductDetail(target.dataset.brandRelatedProduct); });
      syncBrandCardCounts();
    })();
  

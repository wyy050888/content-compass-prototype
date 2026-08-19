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


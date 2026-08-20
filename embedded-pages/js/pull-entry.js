    /* ===================== 智能拉片·入口页 ===================== */
    const sourceTabs = document.querySelectorAll("#sourceTabs .source-tab");
    const sourcePanels = document.querySelectorAll(".source-panel");
    sourceTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        sourceTabs.forEach(t => t.classList.toggle("active", t === tab));
        const target = tab.dataset.source;
        sourcePanels.forEach(p => p.hidden = p.dataset.panel !== target);
      });
    });

    // 视频列表（核心数据）
    const videoList = document.getElementById("videoList");
    const videoCount = document.getElementById("videoCount");
    const estimateNum = document.getElementById("estimateNum");
    const startParseBtn = document.getElementById("startParse");
    const MAX_VIDEOS = 10;
    let videos = []; // {id, name, source, duration, status:'pending'|'parsing'|'done'|'fail', failReason}
    let nextId = 1;

    function fmtName(input) {
      if (!input) return "未命名视频";
      const trimmed = input.trim();
      if (trimmed.length <= 38) return trimmed;
      return trimmed.slice(0, 35) + "…";
    }

    function isValidLink(s) {
      return /^(https?:\/\/)?(www\.)?(douyin|iesdouyin|ixigua|kuaishou|weishi)\.com\//i.test(s)
        || /v\.douyin\.com\//i.test(s)
        || /^[a-zA-Z0-9_\-]{8,}$/.test(s); // 简化：允许纯 id
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
          <div>先在上面添加链接或文件～</div>
        `;
        videoList.appendChild(empty);
      } else {
        videos.forEach(v => {
          const row = document.createElement("div");
          row.className = "video-row";
          row.dataset.id = v.id;
          const statusText = {
            pending: "待解析",
            parsing: "解析中…",
            done: "已完成",
            fail: v.failReason || "解析失败"
          }[v.status];
          const statusCls = {
            pending: "status",
            parsing: "status parsing",
            done: "status done",
            fail: "status fail"
          }[v.status];
          const sourceLabel = { link: "抖音链接", library: "素材库", upload: "本地上传" }[v.source] || "—";
          row.innerHTML = `
            <div class="thumb">${v.source === "link" ? "抖" : v.source === "library" ? "库" : "本"}</div>
            <div class="meta">
              <strong>${fmtName(v.name)}</strong>
              <small>${v.duration || "—"} · ${sourceLabel}</small>
              <span class="${statusCls}">${statusText}</span>
            </div>
            <div class="row-actions">
              ${v.status === "fail" ? '<button class="retry" data-act="retry">重试</button>' : ""}
              <button class="delete" data-act="delete" aria-label="删除">✕</button>
            </div>
          `;
          videoList.appendChild(row);
        });
      }
      const pending = videos.filter(v => v.status === "pending").length;
      videoCount.textContent = videos.length;
      estimateNum.textContent = pending;
      startParseBtn.disabled = pending === 0;
    }

    videoList.addEventListener("click", e => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const row = btn.closest(".video-row");
      const id = row && row.dataset.id;
      const act = btn.dataset.act;
      if (act === "delete") {
        videos = videos.filter(v => v.id !== id);
        renderVideoList();
        showToast("已移除视频");
      } else if (act === "retry") {
        const v = videos.find(x => x.id === id);
        if (v) { v.status = "pending"; v.failReason = ""; renderVideoList(); }
      }
    });

    // 链接添加
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
      const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
      const remain = MAX_VIDEOS - videos.length;
      if (remain <= 0) {
        showToast(`最多添加 ${MAX_VIDEOS} 个视频`);
        return;
      }
      const willAdd = lines.slice(0, remain);
      const rejected = lines.slice(remain);
      const valid = [];
      const invalid = [];
      willAdd.forEach(line => {
        if (!isValidLink(line)) { invalid.push(line); return; }
        if (videos.some(v => v.link && v.link === line)) { return; } // 静默去重
        valid.push(line);
      });
      valid.forEach(link => {
        videos.push({
          id: "v" + (nextId++),
          name: link,
          link,
          source: "link",
          duration: randomDuration(),
          status: "pending"
        });
      });
      linkInput.value = "";
      linkInputArea.classList.remove("has-error");
      linkError.style.display = "none";
      renderVideoList();
      if (valid.length) showToast(`已添加 ${valid.length} 个视频`);
      if (invalid.length) {
        linkInputArea.classList.add("has-error");
        linkError.textContent = `有 ${invalid.length} 条链接格式无效，已忽略`;
        linkError.style.display = "block";
      }
      if (rejected.length) showToast(`已超过上限，忽略 ${rejected.length} 条`);
    });
    linkInput.addEventListener("input", () => {
      if (linkInput.value.trim()) {
        linkInputArea.classList.remove("has-error");
        linkError.style.display = "none";
      }
    });

    // 素材库多选
    const libraryCards = document.querySelectorAll(".library-pick-card");
    libraryCards.forEach(card => {
      card.addEventListener("click", () => card.classList.toggle("selected"));
    });
    document.getElementById("confirmLibrary").addEventListener("click", () => {
      const picked = [...libraryCards].filter(c => c.classList.contains("selected"));
      if (!picked.length) { showToast("请先选择视频"); return; }
      const remain = MAX_VIDEOS - videos.length;
      if (remain <= 0) { showToast(`最多添加 ${MAX_VIDEOS} 个视频`); return; }
      const willAdd = picked.slice(0, remain);
      willAdd.forEach(card => {
        videos.push({
          id: "v" + (nextId++),
          name: card.dataset.name,
          source: "library",
          duration: card.dataset.duration,
          status: "pending"
        });
        card.classList.remove("selected");
      });
      renderVideoList();
      showToast(`已添加 ${willAdd.length} 个素材库视频`);
    });

    // 本地上传（拖拽+点击）
    const uploadDrop = document.getElementById("uploadDrop");
    const fileInput = document.getElementById("fileInput");
    uploadDrop.addEventListener("click", () => fileInput.click());
    ["dragenter", "dragover"].forEach(ev => uploadDrop.addEventListener(ev, e => {
      e.preventDefault(); uploadDrop.classList.add("dragover");
    }));
    ["dragleave", "drop"].forEach(ev => uploadDrop.addEventListener(ev, e => {
      e.preventDefault(); uploadDrop.classList.remove("dragover");
    }));
    uploadDrop.addEventListener("drop", e => {
      const files = [...e.dataTransfer.files].filter(f => /^video\//.test(f.type) || /\.(mp4|mov|m4v)$/i.test(f.name));
      handleFiles(files);
    });
    fileInput.addEventListener("change", () => {
      handleFiles([...fileInput.files]);
      fileInput.value = "";
    });
    function handleFiles(files) {
      if (!files.length) { showToast("请选择视频文件"); return; }
      const remain = MAX_VIDEOS - videos.length;
      if (remain <= 0) { showToast(`最多添加 ${MAX_VIDEOS} 个视频`); return; }
      const willAdd = files.slice(0, remain);
      willAdd.forEach(f => {
        videos.push({
          id: "v" + (nextId++),
          name: f.name,
          source: "upload",
          duration: "—",
          status: "pending"
        });
      });
      renderVideoList();
      showToast(`已上传 ${willAdd.length} 个视频`);
    }

    // 清空列表
    document.getElementById("clearAll").addEventListener("click", () => {
      if (!videos.length) return;
      videos = [];
      renderVideoList();
      showToast("已清空列表");
    });

    function randomDuration() {
      const m = Math.floor(Math.random() * 3) + 1;
      const s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
      return `0${m}:${s}`;
    }

    /* ===================== 解析进度态 ===================== */
    const progressModal = document.getElementById("progressModal");
    const progressList = document.getElementById("progressList");
    const progressTitle = document.getElementById("progressTitle");
    const progressTotal = document.getElementById("progressTotal");
    const progressDone = document.getElementById("progressDone");
    const progressCount = document.getElementById("progressCount");
    const enterResultBtn = document.getElementById("enterResult");
    let progressTimers = [];

    function openProgress() {
      const pending = videos.filter(v => v.status === "pending");
      if (!pending.length) return;
      pending.forEach(v => v.status = "parsing");
      renderVideoList();
      progressTitle.textContent = `正在解析 ${pending.length} 个视频`;
      progressCount.textContent = pending.length;
      progressDone.textContent = 0;
      progressTotal.textContent = "0%";
      progressList.innerHTML = "";
      pending.forEach(v => {
        const row = document.createElement("div");
        row.className = "progress-row";
        row.dataset.id = v.id;
        row.innerHTML = `
          <div class="progress-thumb">${v.source === "link" ? "抖" : v.source === "library" ? "库" : "本"}</div>
          <div class="progress-body">
            <strong>${fmtName(v.name)}</strong>
            <div class="bar"><span style="width:0%"></span></div>
            <small>正在识别口播文案与画面分镜…</small>
          </div>
          <div class="progress-percent">0%</div>
        `;
        progressList.appendChild(row);
      });
      enterResultBtn.disabled = true;
      enterResultBtn.textContent = "解析中…";
      progressModal.classList.add("show");

      // 清掉旧 timer
      progressTimers.forEach(t => clearTimeout(t));
      progressTimers = [];
      const startedAt = Date.now();
      pending.forEach((v, idx) => {
        let p = 0;
        const stepMs = 220 + Math.random() * 260;
        const tick = () => {
          p = Math.min(100, p + 4 + Math.random() * 12);
          const row = progressList.querySelector(`.progress-row[data-id="${v.id}"]`);
          if (!row) return;
          const bar = row.querySelector(".bar span");
          const pct = row.querySelector(".progress-percent");
          bar.style.width = p + "%";
          pct.textContent = Math.round(p) + "%";
          const totalPct = Math.round(pending.reduce((sum, vv) => {
            const r = progressList.querySelector(`.progress-row[data-id="${vv.id}"] .bar span`);
            return sum + (r ? parseFloat(r.style.width) : 0);
          }, 0) / pending.length);
          progressTotal.textContent = totalPct + "%";
          if (p < 100) {
            progressTimers.push(setTimeout(tick, stepMs));
          } else {
            const willFail = Math.random() < 0.08; // 8% 概率失败
            if (willFail) {
              v.status = "fail";
              v.failReason = "视频无法访问，请重新上传";
              pct.textContent = "失败";
              pct.classList.add("fail");
              row.querySelector("small").textContent = "视频无法访问，请重新上传";
            } else {
              v.status = "done";
              pct.textContent = "完成";
              pct.classList.add("done");
              row.querySelector("small").textContent = "解析完成 · " + (Math.random() * 2 + 1).toFixed(1) + "s";
            }
            const doneCount = pending.filter(x => x.status === "done" || x.status === "fail").length;
            progressDone.textContent = doneCount;
            if (doneCount === pending.length) {
              enterResultBtn.disabled = false;
              enterResultBtn.textContent = "查看结果 →";
              renderVideoList();
            }
          }
        };
        progressTimers.push(setTimeout(tick, 200 + idx * 120));
      });
    }

    document.getElementById("startParse").addEventListener("click", openProgress);
    document.getElementById("closeProgress").addEventListener("click", () => {
      progressModal.classList.remove("show");
    });
    document.getElementById("cancelProgress").addEventListener("click", () => {
      progressModal.classList.remove("show");
      showToast("已取消，可继续添加");
    });
    enterResultBtn.addEventListener("click", () => {
      progressModal.classList.remove("show");
      const firstDone = videos.find(v => v.status === "done");
      if (!firstDone) { showToast("暂无可查看的结果"); return; }
      // 填充结果页元数据
      const dur = (firstDone.duration || "00:31").replace(/^0/, "");
      const m = parseInt(dur.split(":")[0], 10);
      const s = parseInt(dur.split(":")[1] || "0", 10);
      const totalText = (m && s) ? `${m} 分 ${s} 秒` : "0 分 31 秒";
      const totalSpec = `00:${s || 31} · 9:16`;
      document.getElementById("resultDuration").textContent = totalText;
      const d = new Date();
      const pad = n => String(n).padStart(2, "0");
      document.getElementById("resultTime").textContent =
        `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      document.getElementById("resultSpec").textContent = totalSpec;
      document.getElementById("resultTotal").textContent = `00:${s || 31}`;
      switchPage("pull");
    });

    /* ===================== 历史记录抽屉 ===================== */
    const historyDrawer = document.getElementById("historyDrawer");
    const historyBackdrop = document.getElementById("historyBackdrop");
    const historyBody = document.getElementById("historyBody");
    const sampleHistory = [
      { name: "除螨仪主视频｜02:13", time: "今天 09:12", status: "已完成", shots: 8 },
      { name: "空气炸锅使用演示｜01:48", time: "昨天 18:40", status: "已完成", shots: 6 },
      { name: "洗地机 S5 测评｜03:02", time: "07-26 11:08", status: "已完成", shots: 7 },
      { name: "夏季除螨场景｜00:58", time: "07-24 16:21", status: "已完成", shots: 5 }
    ];
    function renderHistory() {
      historyBody.innerHTML = sampleHistory.map(h => `
        <div class="history-item">
          <div class="thumb">视</div>
          <div class="meta">
            <strong>${h.name}</strong>
            <small>${h.time} · ${h.shots} 个分镜</small>
            <span class="badge">${h.status}</span>
          </div>
          <button class="ghost-mini" data-view="${h.name}">查看</button>
        </div>
      `).join("");
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
      const btn = e.target.closest("button[data-view]");
      if (!btn) return;
      closeHistory();
      showToast(`已加载历史记录：${btn.dataset.view}`);
      switchPage("pull");
    });

    /* ===================== 查看示例 ===================== */
    const sampleModal = document.getElementById("sampleModal");
    function openSample() { sampleModal.classList.add("show"); }
    function closeSample() { sampleModal.classList.remove("show"); }
    document.getElementById("closeSample").addEventListener("click", closeSample);
    document.getElementById("closeSampleFoot").addEventListener("click", closeSample);
    document.getElementById("useSampleBtn").addEventListener("click", () => {
      videos = [];
      videos.push({
        id: "v" + (nextId++),
        name: "示例：除螨仪主视频.mp4",
        source: "link",
        duration: "02:13",
        status: "done"
      });
      renderVideoList();
      closeSample();
      showToast("已回填示例视频，可直接查看结果");
      // 直接跳到结果页
      setTimeout(() => {
        document.getElementById("resultDuration").textContent = "2 分 13 秒";
        document.getElementById("resultTime").textContent = "2026/07/28 09:12";
        document.getElementById("resultSpec").textContent = "02:13 · 9:16";
        document.getElementById("resultTotal").textContent = "02:13";
        switchPage("pull");
      }, 350);
    });

    // 「查看示例」按钮：直接跳到示例结果页
    function goToSampleResult() {
      videos = [{
        id: "v" + (nextId++),
        name: "示例：除螨仪主视频.mp4",
        source: "link",
        duration: "02:13",
        status: "done"
      }];
      renderVideoList();
      document.getElementById("resultDuration").textContent = "2 分 13 秒";
      document.getElementById("resultTime").textContent = "2026/07/28 09:12";
      document.getElementById("resultSpec").textContent = "02:13 · 9:16";
      document.getElementById("resultTotal").textContent = "02:13";
      switchPage("pull");
      showToast("已加载示例：除螨仪主视频");
    }
    document.getElementById("openSample").addEventListener("click", goToSampleResult);

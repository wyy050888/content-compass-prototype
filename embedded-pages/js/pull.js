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

    /* ===================== 结果详情页·交互 ===================== */
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
        duration: document.getElementById("resultDuration").textContent,
        time: document.getElementById("resultTime").textContent,
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

    function filterAgents(category) {
      document.querySelectorAll("#agentGrid .agent-card").forEach(card => {
        card.hidden = category !== "all" && card.dataset.category !== category;
      });
      agentFilters.forEach(filter => {
        const active = filter.dataset.agentFilter === category;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-selected", String(active));
      });
      agentGrid.classList.toggle("is-filtered", category !== "all");
      agentGrid.scrollTo({ left: 0, behavior: "smooth" });
    }

    agentFilters.forEach(filter => filter.addEventListener("click", () => filterAgents(filter.dataset.agentFilter)));
    agentBrowser.addEventListener("wheel", event => {
      if (!event.deltaY || agentGrid.scrollWidth <= agentGrid.clientWidth) return;
      event.preventDefault();
      agentGrid.scrollBy({ left: event.deltaY, behavior: "auto" });
    }, { passive: false });

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
        core: "大吸力深层清洁，拍打吸尘同步完成",
        secondary: "透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用",
        difference: "清洁效果可视化，操作完成后尘杯清理方便",
        audiences: ["宝妈家庭", "养宠家庭"],
        psychology: ["风险规避", "理性求证"],
        facts: "已读取产品卖点、关联资产和 18 个禁用表达"
      },
      "air-a8": {
        name: "轻享空气炸锅 A8",
        core: "可视化烹饪窗口，少翻面也能掌握食物状态",
        secondary: "大容量满足家庭用餐，炸篮可拆洗",
        difference: "烹饪过程看得见，降低反复开盖造成的热量流失",
        audiences: ["宝妈家庭", "精致生活人群"],
        psychology: ["省时省力", "家庭关怀"],
        facts: "已读取产品卖点、关联资产和 15 个禁用表达"
      },
      "washer-s5": {
        name: "净界洗地机 S5",
        core: "吸拖洗一体，一次完成地面干湿垃圾清洁",
        secondary: "滚刷自清洁，减少清洁工具二次处理",
        difference: "复杂地面污渍一次推进处理，缩短家庭清洁链路",
        audiences: ["宝妈家庭", "养宠家庭", "精致生活人群"],
        psychology: ["省时省力", "理性求证"],
        facts: "已读取产品卖点、关联资产和 21 个禁用表达"
      },
      "blend-mini": {
        name: "随行榨汁杯 Mini",
        core: "便携随行，一键启动即可完成日常果蔬搅拌",
        secondary: "杯体轻巧，支持充电使用和拆洗",
        difference: "适合通勤、健身和办公室等临时饮用场景",
        audiences: ["通勤人群", "健身人群", "精致生活人群"],
        psychology: ["省时省力", "尝鲜心理"],
        facts: "已读取产品卖点、关联资产和 9 个禁用表达"
      }
    };
    const creationContext = {
      productId: "mite-pro",
      productSource: "library",
      productConfirmed: true,
      productSaved: true,
      originalFields: {},
      customPresets: []
    };

    const modelOptions = {
      text: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内模型">
          <option value="doubao-seed-2-pro">豆包 Seed 2.0 Pro</option>
          <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
          <option value="qwen-3-7-max">通义千问 Qwen3.7-Max</option>
        </optgroup>
        <optgroup label="国际模型">
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
      if (type === "video-create") return "videoGeneration";
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

    function imageCreativeStepMarkup(detail = false) {
      const typeName = detail ? "商品详情图" : "商品主图";
      const sizeOptions = detail
        ? '<option>750 × 1000</option><option>750 × 750</option><option>1080 × 1440</option>'
        : '<option>1:1 · 1080×1080</option><option>3:4 · 1080×1440</option><option>9:16 · 1080×1920</option>';
      const imageTypeOptions = detail
        ? '<option>卖点详情模块</option><option>功能拆解模块</option><option>参数说明模块</option><option>场景种草模块</option>'
        : '<option>商品卡首图</option><option>卖点主图</option><option>场景主图</option><option>活动主图</option>';
      const outputTypeMarkup = detail
        ? '<div class="field full"><div class="field-label-row"><label>详情页模块</label><span class="field-hint" style="margin:0;">按上传图片用途选择，可新增自定义模块</span></div><div class="detail-module-list" data-detail-module-list><label class="detail-module-option"><input type="checkbox" checked><span>首屏海报图</span></label><label class="detail-module-option"><input type="checkbox" checked><span>核心卖点图</span></label><label class="detail-module-option"><input type="checkbox" checked><span>细节特写图</span></label><label class="detail-module-option"><input type="checkbox"><span>多角度图</span></label><label class="detail-module-option"><input type="checkbox"><span>效果对比图</span></label><label class="detail-module-option"><input type="checkbox"><span>场景使用图</span></label><label class="detail-module-option"><input type="checkbox"><span>品牌故事图</span></label><label class="detail-module-option"><input type="checkbox"><span>参数表</span></label><label class="detail-module-option"><input type="checkbox"><span>商品成分图</span></label><label class="detail-module-option"><input type="checkbox"><span>售后保障图</span></label><label class="detail-module-option"><input type="checkbox"><span>证书</span></label></div><div class="config-dual-editor detail-module-editor"><div class="config-editor-field"><label>模块名称</label><input data-detail-module-name placeholder="如：安装步骤图"></div><div class="config-editor-field"><label>模块描述</label><textarea data-detail-module-description placeholder="说明该模块需要展示的内容、信息重点和图片用途"></textarea></div><button class="soft-btn" type="button" data-add-detail-module>＋ 新增详情页模块</button></div></div>'
        : '<div class="field"><label>'+typeName+'类型</label><select>'+imageTypeOptions+'</select></div>';
      return [
        '<section class="form-section image-flow-step" data-task-step="1">',
          '<div class="form-section-head"><div><strong>创意确认</strong><small>一次确认参考图、模型、设计师、输出规格、权益和约束规则</small></div><span class="badge">步骤 1 / 5</span></div>',
          '<div class="section-grid">',
            '<div class="field full"><label>'+typeName+'参考图 *</label><input type="file" accept="image/*" multiple hidden data-image-upload-input><div class="upload-box image-upload-box" data-image-upload-trigger><div class="image-upload-empty"><span class="image-upload-icon">＋</span><strong>点击上传商品图片</strong><span>支持 JPG、PNG、WEBP，可多选；上传后可单张删除或继续添加</span></div><div class="image-upload-preview-list" data-image-upload-preview-list hidden></div></div></div>',
            '<div class="field full"><label>创意提示描述 *</label><textarea data-required data-field="imagePrompt" placeholder="描述画面构图、视觉重点、光线、色彩与希望传达的卖点">'+(detail ? '统一品牌视觉与信息层级，按阅读顺序拆解产品卖点，每张图片只表达一个核心重点。' : '淘宝高质感商品背景图，商品主体突出，预调灰玻璃一体，大吸力和活水自清洁，适合商品主图。')+'</textarea></div>',
            '<div class="field full image-generation-settings"><div class="image-module-head"><div><strong>生成设置</strong><small>配置模型参数与图片输出规格</small></div></div><div class="section-grid"><div class="field full"><label>模型参数</label><div class="model-parameter-grid"><div><label>图片模型</label><select data-image-model><option value="auto">自动优选（推荐）</option><option value="seedream-4">Seedream 4.0</option><option value="jimeng-image-3">即梦图片 3.0</option><option value="gpt-image-1">GPT Image 1</option></select></div><div><label>创意强度</label><select><option>均衡 · 0.6</option><option>保守 · 0.3</option><option>大胆 · 0.85</option></select></div><div><label>细节质量</label><select><option>高清</option><option>标准</option><option>超清</option></select></div></div></div><div class="field"><label>输出尺寸</label><select>'+sizeOptions+'</select></div><div class="field"><label>生成张数</label><select><option>4 张</option><option>6 张</option><option>8 张</option></select></div><div class="field"><label>投放平台</label><select><option>抖音</option><option>淘宝 / 天猫</option><option>京东</option><option>拼多多</option><option>小红书</option></select></div>'+(detail ? '' : '<div class="field"><label>主图类型</label><select>'+imageTypeOptions+'</select></div>')+'</div></div>',
            '<div class="field full image-advanced-toggle-row"><button class="advanced-toggle image-advanced-toggle" type="button" data-toggle-image-advanced aria-expanded="false"><span>高级设置</span><b>⌄</b></button><span>展开配置设计师、权益信息和规则约束</span></div><div class="field full image-advanced-panel" data-image-advanced-panel hidden><div class="field full"><label>设计师配置 *</label><div class="config-selector"><div class="config-choice-list" data-config-list="designer" data-single-config><button class="config-chip active" type="button">电商视觉设计师</button><button class="config-chip" type="button">生活方式摄影师</button><button class="config-chip" type="button">3D 创意设计师</button><button class="config-chip" type="button">高端品牌设计师</button></div><div class="config-dual-editor"><div class="config-editor-field"><label>标题描述</label><input data-config-input="designer" placeholder="如：日系极简设计师"></div><div class="config-editor-field"><label>内容描述</label><textarea data-config-content="designer" placeholder="描述设计风格、构图偏好、色彩及视觉表达要求"></textarea></div><button class="soft-btn" type="button" data-add-config="designer">＋ 新增设计师</button></div></div></div>',
            '<div class="field full"><div class="form-section-head" style="margin:3px 0 0;"><div><strong>权益配置与规则约束</strong><small>确定允许展示的权益与内容边界</small></div></div><div class="section-grid"><div class="field"><label>权益配置</label><div class="rules-list" data-rule-list="benefit"><div class="rule-item" data-rule-id="benefit-1" data-rule-title="7天无理由退换"><span class="rule-copy"><strong>7天无理由退换</strong></span><span class="rule-actions"></span></div><div class="rule-item" data-rule-id="benefit-2" data-rule-title="运费险"><span class="rule-copy"><strong>运费险</strong></span><span class="rule-actions"></span></div></div><div class="config-add-row" style="margin-top:8px;"><input data-rule-input="benefit" placeholder="新增权益，如：赠送替换滤网"><button class="soft-btn" type="button" data-add-rule="benefit">＋ 新增权益</button></div></div><div class="field"><label>规则约束</label><div class="rules-list" data-rule-list="constraint"><div class="rule-item" data-rule-id="constraint-1" data-rule-type="constraint" data-rule-title="品牌规范" data-rule-content="LOGO 清晰、品牌色准确，不生成竞品标识"><span class="rule-copy"><strong>品牌规范</strong><small>LOGO 清晰、品牌色准确，不生成竞品标识</small></span><span class="rule-actions"></span></div></div><div class="config-dual-editor" style="grid-template-columns:.8fr 1.2fr auto;margin-top:8px;"><div class="config-editor-field"><label>规则标题</label><input data-rule-input="constraint" placeholder="如：敏感词规则"></div><div class="config-editor-field"><label>规则描述</label><textarea data-rule-content="constraint" placeholder="说明必须遵守的内容边界"></textarea></div><button class="soft-btn" type="button" data-add-rule="constraint">＋ 新增规则</button></div></div></div></div></div>',
            (detail ? '<div class="field full detail-module-section"><div class="image-module-head"><div><strong>详情页模块</strong><small>选择需要生成的图片模块，并调整输出顺序</small></div></div>'+outputTypeMarkup+'<div class="detail-module-order-card"><div class="field-label-row"><label>已选模块顺序</label><span class="field-hint" style="margin:0;">使用上下按钮调整生成与提示词顺序</span></div><div class="detail-module-order" data-detail-module-order></div></div></div>' : ''),
          '</div>',
        '</section>'
      ].join("");
    }

    function imageProductInfoStepMarkup(detail = false) {
      return [
        '<section class="form-section original-step-panel image-flow-step" data-task-step="1">',
          '<div class="original-step-title"><div><h2>产品信息</h2><p>选择产品来源，并确认本次'+(detail ? '详情图' : '主图')+'使用的产品事实、卖点和目标人群。</p></div><div class="original-header-controls"><div class="source-switch" aria-label="产品信息来源"><button class="active" type="button" data-product-source="library">产品库</button><button type="button" data-product-source="link">商品链接</button><button type="button" data-product-source="manual">手工输入</button></div><div class="header-product-picker" data-product-source-panel="library"><select aria-label="选择产品" data-product-select data-required>'+productOptions+'</select></div><button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button><span class="badge">步骤 1 / 5</span></div></div>',
          '<div class="product-source-inline"><div data-product-source-panel="link" hidden><div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div></div><div data-product-source-panel="manual" hidden></div></div>',
          '<div class="original-group"><div class="original-group-title"><strong>基础信息</strong><span>确定本次生图对象</span></div><div class="original-group-fields"><div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div><div class="original-field"><label>品牌<span class="required-star">*</span></label><input list="imageBrandOptions" data-original-brand data-required value="轻净" placeholder="输入或搜索品牌"><datalist id="imageBrandOptions"><option value="轻净"><option value="净界"><option value="随行"><option value="其他品牌"></datalist></div><div class="original-field"><label>类目<span class="required-star">*</span></label><input list="imageCategoryOptions" data-original-category data-required value="清洁电器" placeholder="输入或搜索类目"><datalist id="imageCategoryOptions"><option value="清洁电器"><option value="厨房电器"><option value="个护电器"><option value="生活电器"></datalist></div></div></div>',
          '<div class="original-group"><div class="original-group-title"><strong>卖点与信任体系</strong><span>规定图片能展示什么、凭什么可信</span></div><div class="original-group-fields">',
            '<div class="original-field full"><div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div><div class="point-editor" data-point-editor="core" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up">↑</button><button type="button" data-point-action="down">↓</button><button type="button" data-point-action="remove">×</button></span></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea></div></div>',
            '<div class="original-field full advanced-field" hidden><div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div><div class="point-editor" data-point-editor="secondary" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div><div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="secondary" hidden>透明尘杯可拆卸水洗；床垫、沙发和布艺均可使用</textarea></div></div>',
            '<div class="original-field advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div><div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">商品卡投放</span><span class="choice-chip">图文推广</span><span class="choice-chip">商城搜索</span><span class="choice-chip">活动会场</span></div></div><div class="original-field full"><label>营销策略</label><textarea data-field="marketing" placeholder="填写已审核的价格、优惠、赠品或活动信息；没有可留空">暑期活动，到手赠送 3 个替换滤网</textarea></div>',
            '<div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>',
            '<div class="original-field full"><label>产品图片与关联素材</label><div class="upload-box"><strong>从产品库读取产品图 · 可补充上传</strong><span>商品主体、品牌外观与详情素材会作为生成约束</span></div><span class="field-hint" data-product-fact-hint>已读取产品卖点、关联资产和禁用表达</span></div>',
          '</div></div>',
          '<div class="original-group"><div class="original-group-title"><strong>人群与表达策略</strong><span>确定图片对谁表达、从什么问题切入</span></div><div class="original-group-fields"><div class="original-field full"><label>核心目标人群<span class="required-star">*</span></label><div class="audience-selector"><div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip active" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip active" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div><div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div><div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">18–23</span><span class="choice-chip active">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">50+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="age-custom" data-custom-age hidden><input type="number" min="18" max="80" value="25" data-age-min><span>至</span><input type="number" min="18" max="80" value="35" data-age-max></span></div></div></div></div><div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain">孩子后背红疹反复，床褥表面看起来干净但深层仍藏有灰尘和毛发</textarea></div><div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div></div></div>',
        '</section>'
      ].join("");
    }

    function imageGenerationSettingsStepMarkup(detail = false) {
      const sizeOptions = detail
        ? '<option>750 × 1000</option><option>750 × 750</option><option>1080 × 1440</option>'
        : '<option>1:1 · 1080×1080</option><option>3:4 · 1080×1440</option><option>9:16 · 1080×1920</option>';
      const typeOptions = '<option>商品首图</option><option>卖点主图</option><option>场景主图</option><option>竞品对比图</option><option>售后保障图</option>';
      const detailModules = '';
      return '<section class="form-section image-flow-step" data-task-step="4"><div class="form-section-head"><div><strong>生图设置</strong><small>提示词确认后，配置模型与图片输出规格</small></div><span class="badge">步骤 4 / 5</span></div><div class="section-grid"><div class="field full"><label>模型参数</label><div class="model-parameter-grid"><div><label>图片模型</label><select data-image-model><option value="auto">自动优选（推荐）</option><option value="seedream-4">Seedream 4.0</option><option value="jimeng-image-3">即梦图片 3.0</option><option value="gpt-image-1">GPT Image 1</option></select></div><div><label>创意强度</label><select><option>均衡 · 0.6</option><option>保守 · 0.3</option><option>大胆 · 0.85</option></select></div><div><label>细节质量</label><select><option>高清</option><option>标准</option><option>超清</option></select></div></div></div><div class="field"><label>输出尺寸</label><select>'+sizeOptions+'</select></div><div class="field"><label>生成张数</label><select><option>1 张</option><option>2 张</option><option>4 张</option><option>6 张</option><option>8 张</option></select></div><div class="field"><label>投放平台</label><select><option>抖音</option><option>淘宝 / 天猫</option><option>京东</option><option>拼多多</option><option>小红书</option></select></div>'+(detail ? '' : '<div class="field"><label>主图类型</label><select>'+typeOptions+'</select></div>')+detailModules+'</div></section>';
    }

    function imageCompetitorStepMarkup(detail = false) {
      const modeOptions = function(name, checked) {
        return '<div class="competitor-mode-options"><label><input type="radio" name="'+name+'" value="reference" '+(checked === "reference" ? "checked" : "")+'>参考</label><label><input type="radio" name="'+name+'" value="replicate" '+(checked === "replicate" ? "checked" : "")+'>复刻</label></div>';
      };
      return [
        '<section class="form-section image-flow-step" data-task-step="2">',
          '<div class="form-section-head"><div><strong>竞品分析</strong><small>可多选竞品；人群、卖点、场景和反推提示词支持二次编辑</small></div><span class="badge">步骤 2 / 5</span></div>',
          '<div class="competitor-toolbar"><input data-competitor-link placeholder="粘贴竞品商品链接"><button class="soft-btn" type="button" data-add-competitor>＋ 分析并加入</button></div>',
          '<div class="competitor-table-shell image-competitor-table-shell"><table class="competitor-library-table image-competitor-table"><thead><tr><th>选择</th><th>产品名称</th><th>产品素材</th><th>商品链接</th><th>平台</th><th>销量</th><th>人群</th><th>核心卖点</th><th>场景</th><th>一级类目</th><th>使用类型</th><th>操作</th></tr></thead><tbody data-competitor-body><tr><td><input class="competitor-select" type="checkbox" checked aria-label="选择追觅除螨仪 S20"></td><td class="competitor-product-cell"><strong>追觅除螨仪 S20</strong><small>竞品库 · 10分钟前更新</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-flow-competitor>主图</button><button class="competitor-thumb detail" type="button" data-preview-flow-competitor>详情</button></div></td><td><a class="competitor-source-link" href="https://www.douyin.com/" target="_blank" rel="noopener">douyin.com/product/s20</a></td><td><span class="competitor-platform">抖音</span></td><td><strong>3.6万+</strong></td><td class="competitor-cell-copy">精致妈妈、养宠家庭</td><td class="competitor-cell-copy">高频拍打；紫外线辅助；尘杯可视</td><td class="competitor-cell-copy">床褥、沙发、宠物区</td><td class="competitor-category-path">清洁电器</td><td>'+modeOptions('competitor-mode-1','reference')+'</td><td><div class="competitor-actions image-competitor-actions"><button type="button" data-preview-flow-competitor>预览</button><button type="button" data-download-flow-competitor>下载</button></div></td></tr><tr><td><input class="competitor-select" type="checkbox" checked aria-label="选择莱克吉米除螨仪 B703"></td><td class="competitor-product-cell"><strong>莱克吉米除螨仪 B703</strong><small>链接解析 · 昨天更新</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-flow-competitor>主图</button><button class="competitor-thumb detail" type="button" data-preview-flow-competitor>详情</button></div></td><td><a class="competitor-source-link" href="https://www.jd.com/" target="_blank" rel="noopener">jd.com/item/b703</a></td><td><span class="competitor-platform jd">京东</span></td><td><strong>2.1万+</strong></td><td class="competitor-cell-copy">都市中产、精致妈妈</td><td class="competitor-cell-copy">强拍打；热风除湿；低噪设计</td><td class="competitor-cell-copy">卧室、儿童房、沙发</td><td class="competitor-category-path">清洁电器</td><td>'+modeOptions('competitor-mode-2','replicate')+'</td><td><div class="competitor-actions image-competitor-actions"><button type="button" data-preview-flow-competitor>预览</button><button type="button" data-download-flow-competitor>下载</button></div></td></tr></tbody></table></div>',
        '</section>'
      ].join("");
    }

    function imagePromptStepMarkup(detail = false) {
      const values = detail
        ? ['轻净 Pro 除螨仪，白色机身，透明预调灰尘杯，品牌与产品外观保持一致。','仅展示已审核权益：运费险、7天无理由退换、赠送替换滤网。','精致妈妈，关注床褥深层清洁、使用便利和清洁结果。','统一柔和自然光与品牌配色，模块之间视觉连续。','按深层清洁、拍打吸尘、透明尘杯、适用场景依次拆解。','一个模块只讲一个重点，先给结果证据，再解释功能原理。','禁止商品变形、品牌错字、乱码、虚构参数、夸大功效、未审核价格。']
        : ['轻净 Pro 除螨仪，白色机身与透明尘杯，商品外观、结构和品牌信息准确。','产品占比：主体占画面 45%–60%\n构图风格：电商主图居中构图，保留平台安全留白','主色调：品牌蓝白\n辅助色：暖米色\n色彩对比：清爽高对比\n色彩情绪：洁净、可信','大标题：强劲清洁，一遍搞定\n小标题：大吸力深层清洁，结果清晰可见','仅使用已审核活动信息，不虚构价格、折扣或赠品。','突出深层清洁、拍吸同步和透明尘杯结果可视化。','文字位置：左上安全区\n文字占比：不超过画面 25%','场景类型：真实卧室床褥清洁\n场景颜色：柔和自然光\n场景特点：整洁、生活化\n使用场景：床垫、沙发、毛绒玩具','LOGO清晰完整，使用标准品牌色，不变形、不遮挡。','仅展示已审核权益，禁止未经证实的功效与承诺。','禁止产品变形、多余部件、品牌错字、乱码、错误透视、主体遮挡和竞品标识。','遵循平台安全区、图片尺寸与合规要求；不得使用未经确认的参数、价格、功效和承诺。'];
      const labels = detail ? ['产品基本信息','权益信息','目标人群','场景','核心卖点','差异化卖点','反向提示词'] : ['基础描述','构图方式','色调描述','标题文字','促销文案','卖点文案','文字设置','场景描述','LOGO规则','权益规则','反向提示词','其他限制'];
      const templateToolbar = '<div class="prompt-confirm-toolbar"><div><strong>提示词内容</strong><small>可选择模板后继续新增、修改参数</small></div><button class="soft-btn" type="button" data-get-prompt-library>选择模板</button></div>';
      const detailCreator = detail ? '<div class="detail-prompt-create"><div><strong>新增详情页模块</strong><small>填写模块名称、模板文案和模块提示词</small></div><div class="detail-prompt-create-fields"><input data-new-detail-prompt-name placeholder="模块名称"><textarea data-new-detail-prompt-copy placeholder="模板文案"></textarea><textarea data-new-detail-prompt-visual placeholder="模块提示词"></textarea><button class="soft-btn" type="button" data-add-detail-prompt-module>＋ 新增模块</button></div></div>' : '';
      const mainItems = labels.map(function(label,index){ const lines=String(values[index] || '').split(/\n+/).filter(Boolean); const params=lines.length ? lines.map(function(line){ const parts=line.split(/[：:]/); return {name:parts.length > 1 ? parts.shift().trim() : '提示词参数',value:parts.length ? parts.join('：').trim() : line}; }) : [{name:'提示词参数',value:''}]; return '<div class="prompt-confirm-item prompt-structured-field" data-prompt-step-module="'+label+'"><label><span>'+(index+1)+'</span>'+label+' <button type="button" data-prompt-optimize>AI优化</button></label><div class="prompt-param-list">'+params.map(function(param,paramIndex){ return '<div class="prompt-param-row" data-prompt-step-param-row><input data-prompt-step-param-name value="'+escapeHtml(param.name)+'" placeholder="参数名称"><textarea '+(paramIndex===0?'data-required ':'')+'data-prompt-step-param-value placeholder="提示词描述">'+escapeHtml(param.value)+'</textarea><button class="prompt-param-remove" type="button" data-remove-prompt-step-param>×</button></div>'; }).join('')+'</div><button class="prompt-param-add" type="button" data-add-prompt-step-param>＋ 新增提示词参数</button></div>'; }).join('');
      const totalPrompt = detail ? '' : '<div class="prompt-confirm-item prompt-total-item"><label>总版提示词 <small>自动整合以上所有结构化模块，不允许删除</small><button type="button" data-total-prompt-optimize>AI优化</button></label><textarea data-total-prompt readonly></textarea></div>';
      return '<section class="form-section image-flow-step" data-task-step="3"><div class="form-section-head"><div><strong>提示词确认</strong><small>确认图片生成提示词；每项均可编辑或单独 AI 优化</small></div><span class="badge">步骤 3 / 5</span></div>'+templateToolbar+'<div class="prompt-confirm-list">'+mainItems+'</div>'+detailCreator+totalPrompt+'</section>';
    }

    const agentConfigs = {
      "image-main": {
        intro: "上传商品参考图，确认创意描述，并由设计师按场景、人群、平台和约束生成可投放主图。",
        process: "创意确认（含模型、权益和约束） → 产品信息 → 竞品分析 → 提示词确认 → 图片生成。",
        placeholder: "还可以补充：保留白色产品主体，面向都市 GenZ，画面更有夏日感；权益只展示已审核内容……",
        request: "为轻净 Pro 除螨仪生成 4 张商品主图，突出深层清洁和可水洗尘杯，适配抖音商品卡。",
        version: "商品生图 V1", summary: "已由商品生图设计师生成 4 张主图方案，产品主体、场景、人群和权益规则均已应用。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>创意确认</strong><small>上传参考图片，并一次确认模型、设计师、场景、人群、权益和约束</small></div><span class="badge">步骤 1 / 5</span></div>
            <div class="section-grid">
              <div class="field full"><label>商品参考图 *</label><input type="file" accept="image/*" multiple hidden data-image-upload-input><div class="upload-box image-upload-box" data-image-upload-trigger><span class="image-upload-icon">＋</span><strong>点击上传商品图片</strong><span>支持 JPG、PNG、WEBP，可多选；用于锁定商品主体与外观</span></div></div>
              <div class="field full"><label>创意提示描述 *</label><textarea data-required data-field="imagePrompt" placeholder="描述画面构图、视觉重点、光线、色彩与希望传达的卖点">淘宝高质感商品背景图，商品主体突出，预调灰玻璃一体，大吸力和活水自清洁，适合商品主图。</textarea><span class="field-hint">可直接修改设计师建议，生成时将同时遵循下方权益与约束规则。</span></div>
              <div class="field full"><label>模型参数</label><div class="model-parameter-grid"><div><label>图片模型</label><select data-image-model><option value="auto">自动优选（推荐）</option><option value="seedream-4">Seedream 4.0</option><option value="jimeng-image-3">即梦图片 3.0</option><option value="gpt-image-1">GPT Image 1</option></select></div><div><label>创意强度</label><select><option>均衡 · 0.6</option><option>保守 · 0.3</option><option>大胆 · 0.85</option></select></div><div><label>细节质量</label><select><option>高清</option><option>标准</option><option>超清</option></select></div></div></div>
              <div class="field full"><label>设计师配置 *</label><div class="config-selector"><div class="config-choice-list" data-config-list="designer" data-single-config><button class="config-chip active" type="button">电商视觉设计师</button><button class="config-chip" type="button">生活方式摄影师</button><button class="config-chip" type="button">3D 创意设计师</button><button class="config-chip" type="button">高端品牌设计师</button></div><div class="config-dual-editor"><div class="config-editor-field"><label>标题描述</label><input data-config-input="designer" placeholder="如：日系极简设计师"></div><div class="config-editor-field"><label>内容描述</label><textarea data-config-content="designer" placeholder="描述设计风格、构图偏好、色彩及视觉表达要求"></textarea></div><button class="soft-btn" type="button" data-add-config="designer">＋ 新增设计师</button></div></div></div>
              <div class="field full"><label>场景配置 *</label><div class="config-selector"><div class="config-choice-list" data-config-list="scene" data-single-config><button class="config-chip active" type="button">电商棚拍</button><button class="config-chip" type="button">家庭客厅</button><button class="config-chip" type="button">卧室清洁</button><button class="config-chip" type="button">极简台面</button><button class="config-chip" type="button">功能特写</button></div><div class="config-dual-editor"><div class="config-editor-field"><label>标题描述</label><input data-config-input="scene" placeholder="如：夏日阳光房"></div><div class="config-editor-field"><label>内容描述</label><textarea data-config-content="scene" placeholder="描述空间、光线、道具、氛围及商品呈现方式"></textarea></div><button class="soft-btn" type="button" data-add-config="scene">＋ 新增场景</button></div></div></div>
              <div class="field full"><div class="field-label-row"><label>目标人群 *</label><span class="field-hint" style="margin:0;">八大人群单选，可新增自定义人群</span></div><div class="audience-reference" data-config-list="audience" data-single-audience><button class="audience-option active" type="button"><span><strong>小镇青年</strong><small>低线城市青年消费人群</small></span></button><button class="audience-option" type="button"><span><strong>都市 GenZ</strong><small>18–24 岁都市年轻人</small></span></button><button class="audience-option" type="button"><span><strong>精致妈妈</strong><small>一二线育儿家庭</small></span></button><button class="audience-option" type="button"><span><strong>都市白领 / 新锐白领</strong><small>职场效率与品质人群</small></span></button><button class="audience-option" type="button"><span><strong>资深中产 / 都市中产</strong><small>品质升级与理性决策人群</small></span></button><button class="audience-option" type="button"><span><strong>都市蓝领</strong><small>餐饮、运输与服务业人群</small></span></button><button class="audience-option" type="button"><span><strong>都市银发</strong><small>50 岁以上都市熟龄人群</small></span></button><button class="audience-option" type="button"><span><strong>小镇中老年</strong><small>低线城市熟龄人群</small></span></button></div><div class="config-add-row" style="margin-top:9px;"><input data-config-input="audience" placeholder="新增自定义人群，如：新婚小家庭"><button class="soft-btn" type="button" data-add-config="audience">＋ 新增人群</button></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>权益与约束规则</strong><small>确定可展示的信息边界与本次输出规格</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>权益配置</label><div class="rules-list" data-rule-list="benefit"><div class="rule-item"><span class="rule-copy"><strong>暑期活动</strong><small>到手赠送 3 个替换滤网</small></span></div><div class="rule-item"><span class="rule-copy"><strong>无忧退换</strong><small>支持 7 天无理由退换（以平台审核为准）</small></span></div></div><div class="config-add-row" style="margin-top:8px;"><input data-rule-input="benefit" placeholder="新增自定义权益，如：会员下单赠收纳袋"><button class="soft-btn" type="button" data-add-rule="benefit">＋ 新增权益</button></div><span class="field-hint">系统权益为只读；自定义新增权益可随时删除。</span></div>
              <div class="field full"><label>规则约束</label><div class="rules-list" data-rule-list="constraint"><div class="rule-item"><span class="rule-copy"><strong>商品一致性规则</strong><small>保持商品结构、颜色、按钮和品牌标识一致</small></span></div><div class="rule-item"><span class="rule-copy"><strong>合规表达规则</strong><small>不生成未审核价格、夸大功效、虚假对比或乱码文字</small></span></div></div><div class="config-dual-editor" style="margin-top:8px;"><div class="config-editor-field"><label>规则名称</label><input data-rule-input="constraint" placeholder="如：竞品规避规则"></div><div class="config-editor-field"><label>规则描述</label><textarea data-rule-content="constraint" placeholder="描述需要遵循或禁止出现的具体内容"></textarea></div><button class="soft-btn" type="button" data-add-rule="constraint">＋ 新增规则</button></div><span class="field-hint">自定义新增规则可再次编辑和删除。</span></div>
              <div class="field"><label>图片尺寸 *</label><select><option>1:1 · 1080 × 1080</option><option>3:4 · 1080 × 1440</option><option>4:5 · 1080 × 1350</option><option>9:16 · 1080 × 1920</option></select></div>
              <div class="field"><label>生成张数 *</label><select data-image-count><option>4 张</option><option>1 张</option><option>2 张</option><option>6 张</option><option>8 张</option></select></div>
              <div class="field full"><label>投放平台 *</label><div class="config-choice-list" data-config-list="platform"><button class="config-chip active" type="button">抖音</button><button class="config-chip" type="button">淘宝 / 天猫</button><button class="config-chip" type="button">京东</button><button class="config-chip" type="button">小红书</button><button class="config-chip" type="button">拼多多</button><button class="config-chip" type="button">微信视频号</button></div></div>
              <div class="field"><label>主图类型 *</label><select><option>白底商品主图</option><option>场景化主图</option><option>卖点功能主图</option><option>活动权益主图</option><option>人群定向主图</option></select></div>
              <div class="field"><label>文字策略</label><select><option>自动排版核心卖点</option><option>仅生成无字底图</option><option>品牌标题 + 单卖点</option></select></div>
              <div class="section-callout full"><strong>生成校验：</strong>设计师将逐张检查商品一致性、权益有效性、平台规范和文字可读性；不合规图片不会进入结果。</div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>产品信息</strong><small>确认本次生图使用的产品事实、规格和核心卖点</small></div><span class="badge">步骤 2 / 5</span></div>
            <div class="image-flow-tabs" data-image-product-source><button class="image-flow-tab active" type="button" data-flow-tab="library">产品库</button><button class="image-flow-tab" type="button" data-flow-tab="link">商品链接</button><button class="image-flow-tab" type="button" data-flow-tab="manual">手动输入</button></div>
            <div class="section-grid">
              <div class="field"><label>产品名称 *</label><input data-required data-image-product-name value="轻净 Pro 除螨仪"></div>
              <div class="field"><label>类目 *</label><div class="flow-inline-control"><select><option>清洁电器 / 除螨仪</option><option>生活电器 / 吸尘器</option></select><button class="soft-btn" type="button">＋</button></div></div>
              <div class="field"><label>品牌</label><div class="flow-inline-control"><select><option>轻净</option><option>自有品牌</option></select><button class="soft-btn" type="button">＋</button></div></div>
              <div class="field"><label>价格</label><input value="399 - 499 元"></div>
              <div class="field"><label>产品材质 / 成分</label><input value="ABS 工程塑料 + 不锈钢滤网"></div>
              <div class="field"><label>产品规格</label><input value="12kPa；450W；白色"></div>
              <div class="field full"><div class="field-label-row"><label>核心产品卖点 *</label><button class="text-action" type="button" data-image-product-polish>AI 完善</button></div><textarea data-required data-image-product-selling>大吸力深层清洁；拍打吸尘同步完成；透明尘杯可拆卸水洗；适用于床垫、沙发和布艺。</textarea></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>竞品分析</strong><small>添加竞品链接，提取可参考方法与需要规避的同质化表达</small></div><span class="badge">步骤 3 / 5</span></div>
            <div class="section-callout" style="margin-bottom:10px;"><strong>分析规则：</strong>只参考竞品的构图、场景和信息组织方式，不复制品牌、商品外观、参数或未经证实的权益。</div>
            <div class="competitor-toolbar"><input data-competitor-link placeholder="粘贴抖音、淘宝、京东或小红书竞品链接"><button class="soft-btn" type="button" data-add-competitor>分析竞品</button></div>
            <div class="competitor-table-wrap"><table class="competitor-table"><thead><tr><th>参考</th><th>竞品名称</th><th>主图策略</th><th>销量</th><th>竞品人群</th><th>竞品场景</th><th>差异化卖点</th><th>操作</th></tr></thead><tbody data-competitor-body><tr><td><input type="radio" name="competitor-reference" checked></td><td><span class="competitor-name">深层清洁主图方案</span><span class="competitor-link">douyin.example/product/2186</span></td><td><span class="competitor-tag">结果前置</span></td><td>3.6万+</td><td>精致妈妈</td><td>卧室床褥</td><td>清洁结果可视化</td><td><button class="text-action" type="button" data-remove-competitor>删除</button></td></tr><tr><td><input type="radio" name="competitor-reference"></td><td><span class="competitor-name">功能拆解主图方案</span><span class="competitor-link">tmall.example/item/9031</span></td><td><span class="competitor-tag">功能分层</span></td><td>1.8万+</td><td>都市中产</td><td>极简棚拍</td><td>拍吸一体说明</td><td><button class="text-action" type="button" data-remove-competitor>删除</button></td></tr></tbody></table></div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>提示词确认</strong><small>确认图片生成提示词；每项均可修改或单独 AI 优化</small></div><span class="badge">步骤 4 / 5</span></div>
            <div class="prompt-confirm-list">
              <div class="prompt-confirm-item"><label>产品基本信息 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>轻净 Pro 除螨仪，白色机身，透明尘杯，保持品牌标识、按钮、结构和比例准确。</textarea></div>
              <div class="prompt-confirm-item"><label>权益信息 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>展示已审核权益：暑期活动赠送替换滤网；退换说明以平台规则为准，不展示未经确认的价格。</textarea></div>
              <div class="prompt-confirm-item"><label>目标人群 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>面向小镇青年，强调看得懂的清洁结果、日常实用性和易操作体验。</textarea></div>
              <div class="prompt-confirm-item"><label>场景 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>真实卧室床褥清洁场景，柔和自然光，环境整洁，商品主体清晰居中。</textarea></div>
              <div class="prompt-confirm-item"><label>核心卖点 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>大吸力深层清洁，拍打吸尘同步完成，透明尘杯让清洁结果可视化。</textarea></div>
              <div class="prompt-confirm-item"><label>差异化卖点 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>用尘杯结果证据突出深层清洁；与普通表面清扫形成使用价值差异，不做虚假功效对比。</textarea></div>
              <div class="prompt-confirm-item"><label><span><input type="checkbox" checked> 反向提示词</span><button type="button" data-prompt-optimize>AI优化</button></label><textarea>禁止商品变形、多余按钮、品牌错字、乱码、夸大功效、未审核价格、竞品标识、低清晰度和主体遮挡。</textarea></div>
            </div>
            <div class="prompt-template-row"><span class="field-hint">提示词将按产品事实、权益和竞品差异自动合并。</span><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><button class="soft-btn" type="button" data-get-prompt-library>选择提示词模板</button><button class="text-action" type="button" data-save-prompt-template>保存为提示词模板</button></div></div>
          </section>`,
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
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="120" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 30 秒</b></div></div>
              <div class="field"><label>生成数量 *</label><select><option>3 条</option><option>5 条</option></select></div>
              <div class="field full"><label>本轮主测变量 *</label><div class="choice-row" data-single="variable"><span class="choice-chip active">前 3 秒钩子</span><span class="choice-chip">卖点顺序</span><span class="choice-chip">人群切口</span><span class="choice-chip">CTA</span></div></div>
              <details class="advanced-block">
                <summary>高级设置：卖点、人群、用户心理、CTA与禁用表达</summary>
                <div class="section-grid advanced-content">
                  <div class="field"><label>核心次要卖点</label><textarea data-field="secondary">透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用</textarea></div>
                  <div class="field"><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
                  <div class="field full"><label>营销利益点</label><textarea data-field="marketing">暑期活动，到手赠送 3 个替换滤网</textarea><div class="quick-tags" data-marketing-tags><button class="quick-tag" type="button" data-marketing-value="限时折扣">限时折扣</button><button class="quick-tag" type="button" data-marketing-value="直播专享">直播专享</button><button class="quick-tag" type="button" data-marketing-value="今日特惠">今日特惠</button><button class="quick-tag active" type="button" data-marketing-value="赠送3个替换滤网">赠品</button><button class="quick-tag" type="button" data-marketing-value="拍一发三">拍一发三</button></div><span class="field-hint">营销信息只用于本次创作，不写入长期产品事实</span></div>
                  <div class="field full"><div class="field-label-row"><label>目标人群</label><button class="text-action" type="button" data-action="recommend-audience">AI 推荐人群</button></div><div class="audience-box" data-audience-box><button class="audience-chip active" type="button">宝妈家庭</button><button class="audience-chip active" type="button">养宠家庭</button><button class="audience-chip" type="button">易敏人群</button><button class="audience-chip" type="button">租房人群</button><button class="audience-chip" type="button">精致生活人群</button></div><div class="inline-control" style="margin-top:8px;"><input data-custom-audience placeholder="输入自定义人群"><button class="soft-btn" type="button" data-action="add-audience">添加人群</button></div></div>
                  <div class="field"><label>主要用户心理</label><select data-field="primaryPsychology"><option value="风险规避">AI 推荐：风险规避</option><option>损失厌恶</option><option>省时省力</option><option>理性求证</option><option>性价比心理</option><option>从众认同</option><option>错失恐惧</option><option>好奇缺口</option><option>身份向往</option><option>尝鲜心理</option><option>家庭关怀</option><option>礼赠社交</option></select></div>
                  <div class="field"><label>辅助用户心理</label><select data-field="secondaryPsychology"><option>不选择</option><option selected>理性求证</option><option>省时省力</option><option>性价比心理</option><option>从众认同</option><option>好奇缺口</option><option>家庭关怀</option></select></div>
                  <div class="smart-tip full" data-psychology-reason><strong>AI 推荐理由</strong><span>除螨仪决策同时受“怕清洁不到位”和“需要效果证据”驱动，建议采用风险规避为主、理性求证为辅。</span></div>
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
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="120" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 30 秒</b></div></div>
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
              <div class="field"><label>目标字数</label><div class="input-with-unit"><input type="number" min="20" max="2000" value="120" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 30 秒</b></div></div>
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
        intro: "把已确认文案转为可供用户审核的结构化分镜，同时在后台生成镜头检索、时间轴、字幕、配音和包装所需的混剪执行指令。",
        process: "解析口播信息点 → 规划时间轴与镜头任务 → 生成用户确认分镜 → 自动生成隐藏的机器执行指令供智能混剪调用。",
        placeholder: "还可以补充：卖点镜头必须用实拍，结尾保留品牌包装页……",
        request: "把除螨仪暑期口播 V1 转为 30 秒主视频脚本，使用实拍与历史素材，输出可确认分镜。",
        version: "编导模板 V14",
        summary: "已生成 30 秒主视频脚本。现有素材可直接覆盖 4/5 个镜头任务，覆盖率 80%；缺失镜头已给出补拍或视频创作建议。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>内容与产品</strong><small>文案转脚本后将自动继承对应产品事实</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>来源文案 *</label><select><option>除螨仪暑期口播 V1</option><option>从文案库选择其他文案</option><option>从当前会话资产选择</option></select></div>
              <div class="field full"><label>对应产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>视频类型 *</label><select><option>主视频</option><option>延伸视频</option></select></div>
              <div class="field"><label>目标时长 *</label><select><option>30 秒</option><option>20 秒</option><option>45 秒</option><option>按文案自动计算</option></select></div>
              <div class="field"><label>画面比例 *</label><select><option>9:16 竖屏</option><option>1:1 方屏</option><option>16:9 横屏</option></select></div>
              <div class="field"><label>视频风格 *</label><select><option>硬广直给</option><option>生活实拍</option><option>测评讲解</option><option>直播切片感</option></select></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>现有素材优先</strong><small>脚本会优先围绕产品已绑定素材设计，已有素材覆盖目标不低于 50%</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>素材来源 *</label><div class="choice-row" data-single="script-material"><span class="choice-chip active">产品绑定素材</span><span class="choice-chip">指定产品素材</span><span class="choice-chip">临时上传素材</span></div></div>
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 已绑定素材</strong><small>实拍 426 段 · 历史成片拆分 782 段 · AI 素材 78 段</small></div><b>1,286</b></div>
              <div class="smart-tip full"><strong>编导规则</strong><span>优先使用已有素材；无法匹配的镜头标记“需拍摄”或“建议视频创作”。覆盖率低于 50% 时，提供“围绕现有素材重排脚本”方案。</span></div>
              <div class="field full"><label>必须保留的画面要求</label><textarea>开场必须出现尘杯脏污证据；产品能力段展示床垫实拍；结尾出现产品与行动引导。</textarea></div>
              <details class="advanced-block"><summary>配音、字幕与包装设置</summary><div class="section-grid advanced-content"><div class="field"><label>配音与语速</label><select><option>女声｜有力｜1.1×</option><option>男声｜专业｜1.0×</option><option>沿用原声</option></select></div><div class="field"><label>字幕样式</label><select><option>重点词高亮</option><option>大字硬字幕</option><option>品牌标准字幕</option></select></div></div></details>
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
                <tr><td>23–30s</td><td>收束 CTA</td><td>家里有孩子或宠物，床铺清洁把它安排上。</td><td>家庭卧室场景、产品定帧、品牌角标与行动按钮</td><td><span class="badge orange">建议视频创作</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="result-note"><strong>素材可执行性：</strong>现有素材覆盖 4/5 个镜头任务（80%），满足不低于 50%的编导目标。缺失的家庭收束镜头可一键调用视频创作，也可转为线下补拍任务。</div>
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
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 已绑定素材</strong><small>已有素材优先覆盖脚本镜头；缺失镜头自动标记补拍或视频创作</small></div><b>1,286</b></div>
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
      "video-create": {
        intro: "像即梦一样，通过文字描述、首帧图或参考图生成单个可复用视频镜头。它负责创造新镜头，不负责把整条广告脚本混剪成片。",
        process: "读取产品事实与参考图 → 解析主体、场景、动作和运镜 → 调用视频生成模型 → 检查产品一致性、画面稳定性和可用时长 → 输出镜头资产。",
        placeholder: "还可以补充：镜头从尘杯特写缓慢拉远，真人手持产品进入画面……",
        request: "基于轻净 Pro 除螨仪产品图，生成一条5秒竖屏镜头：透明尘杯脏污特写，镜头缓慢拉远并展示整机。",
        version: "视频创作",
        summary: "已生成一条可复用的5秒产品镜头。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>生成模式</strong><small>切换模式后，只展示当前任务需要的输入槽位</small></div></div>
            <div class="section-grid">
              <div class="field"><label>生成方式 *</label><select data-mode-control><option value="image">图生视频</option><option value="text">文生视频</option><option value="start-end">首尾帧生成</option><option value="reference">参考视频生成</option><option value="storyboard">脚本分镜生成</option></select></div>
              <div class="field"><label>目标产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field full conditional-slot show" data-mode="image"><label>起始图片 *</label><div class="upload-box"><strong>上传图片或从图片库选择</strong><span>支持产品图、场景图和脚本分镜图；用于锁定主体外观</span></div></div>
              <div class="field full conditional-slot" data-mode="text"><label>文字画面设定 *</label><textarea>卧室自然光环境，轻净 Pro 除螨仪放置在整洁床面，真实电商产品质感，主体结构清晰。</textarea></div>
              <div class="field conditional-slot" data-mode="start-end"><label>首帧 *</label><div class="upload-box"><strong>选择首帧图片</strong><span>定义镜头开始状态</span></div></div>
              <div class="field conditional-slot" data-mode="start-end"><label>尾帧 *</label><div class="upload-box"><strong>选择尾帧图片</strong><span>定义镜头结束状态</span></div></div>
              <div class="field full conditional-slot" data-mode="reference"><label>参考视频 *</label><div class="upload-box"><strong>上传视频或从视频库选择</strong><span>用于借鉴动作、运镜、节奏或画面风格，不复制原主体</span></div></div>
              <div class="field full conditional-slot" data-mode="reference"><label>需要参考的内容 *</label><div class="choice-row"><span class="choice-chip active">主体动作</span><span class="choice-chip">镜头运动</span><span class="choice-chip">画面节奏</span><span class="choice-chip">视觉风格</span></div></div>
              <div class="field full conditional-slot" data-mode="storyboard"><label>脚本分镜 *</label><select><option>除螨仪主视频脚本｜23–30 秒家庭收束镜头</option><option>从脚本库选择缺失镜头</option></select><span class="field-hint">自动读取分镜描述、产品、时长、画幅和素材缺口</span></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>镜头要求</strong><small>描述主体如何运动、镜头如何拍摄以及最终画面效果</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>动作与镜头描述 *</label><textarea>透明尘杯内可见毛发与碎屑，镜头从尘杯微距缓慢拉远，逐步展示轻净 Pro 除螨仪整机。卧室自然光，画面稳定。</textarea></div>
              <div class="field"><label>镜头时长 *</label><select><option>5 秒</option><option>3 秒</option><option>8 秒</option><option>10 秒</option></select></div>
              <div class="field"><label>画面比例 *</label><select><option>9:16 竖屏</option><option>16:9 横屏</option><option>1:1 方形</option></select></div>
              <div class="field"><label>运镜方式</label><select><option>微距缓慢拉远</option><option>固定镜头</option><option>平移跟拍</option><option>环绕产品</option><option>手持跟随</option></select></div>
              <div class="field"><label>清晰度</label><select><option>1080P</option><option>720P 快速预览</option></select></div>
              <details class="advanced-block"><summary>生成约束与负面提示</summary><div class="section-grid advanced-content"><div class="field full"><label>生成约束</label><textarea>保持产品外观、颜色、按钮和品牌标识一致；不新增产品结构；不出现多余手指、文字乱码、形变和闪烁。</textarea></div></div></details>
            </div>
          </section>
        `
      },
      mix: {
        intro: "基于已确认的结构化脚本，从指定素材范围自动找镜头，完成时间轴编排、字幕、配音、包装和多版本混剪，输出可人工终审的成片。",
        process: "读取脚本执行层 → 检索并排序候选镜头 → 自动编排时间轴 → 生成字幕、配音和包装 → 质检后输出待终审成片。",
        placeholder: "还可以补充：第二个卖点镜头换成真人实拍，字幕字号再大一级……",
        request: "使用除螨仪暑期主视频脚本，从实拍和历史素材中自动混剪 1 条主视频与 3 条延伸视频。",
        version: "混剪引擎 V16",
        summary: "已完成 1 条 30 秒主视频初剪。脚本信息点全部覆盖，8 个镜头任务已匹配；成片进入人工终审后，可提交千川提审。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>成片任务</strong><small>脚本和产品决定素材检索范围及成片结构</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>结构化脚本 *</label><select><option>除螨仪暑期主视频脚本 V1</option><option>从脚本库选择</option><option>从当前会话资产选择</option></select></div>
              <div class="field full"><label>对应产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>生产类型 *</label><select><option>1 条主视频</option><option>1 主 + 3 延伸</option><option>仅生成延伸视频</option></select></div>
              <div class="field"><label>成片规格 *</label><select><option>9:16｜1080×1920</option><option>9:16｜720×1280</option></select></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>素材范围</strong><small>默认直接使用当前产品已绑定素材，也可缩小范围或临时补充</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>选择方式 *</label><div class="choice-row" data-single="mix-material"><span class="choice-chip active">产品全部素材</span><span class="choice-chip">指定产品素材</span><span class="choice-chip">临时上传素材</span></div></div>
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 产品素材池</strong><small>实拍 426 段 · 历史成片拆分 782 段 · AI 素材 78 段</small></div><b>1,286</b></div>
              <div class="smart-tip full"><strong>自动匹配</strong><span>按照脚本镜头任务检索产品素材；缺失镜头优先调用视频创作或进入补拍清单，不使用无关素材凑镜头。</span></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>声音与包装</strong><small>选择品牌标准模板后，可在终审阶段逐项修改</small></div></div>
            <div class="section-grid">
              <div class="field"><label>配音</label><select><option>女声｜有力｜1.1×</option><option>男声｜专业｜1.0×</option><option>上传真人音色</option></select></div>
              <div class="field"><label>字幕与包装</label><select><option>品牌模板｜重点词高亮</option><option>大字硬广模板</option><option>轻量无边框模板</option></select></div>
              <div class="field"><label>背景音乐</label><select><option>自动匹配｜节奏感</option><option>使用品牌指定 BGM</option><option>不使用 BGM</option></select></div>
              <div class="field"><label>延伸版本变化规则</label><select><option>换 3 秒钩子 + 对应镜头</option><option>只换开场镜头</option><option>换部分镜头</option></select></div>
              <div class="field full"><label>制作要求</label><textarea>产品演示优先真人实拍；品牌角标全程保留；任何自动补充素材必须在终审页标识来源。</textarea></div>
            </div>
          </section>
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

    agentConfigs["image-main"].intro = "按产品信息、竞品分析、提示词确认、生图设置和图片生成五步完成商品主图创作。";
    agentConfigs["image-main"].process = "产品信息 → 竞品分析 → 提示词确认 → 生图设置 → 图片生成。";
    agentConfigs["image-main"].form =
      imageProductInfoStepMarkup(false) +
      imageCompetitorStepMarkup(false) +
      imagePromptStepMarkup(false) +
      imageGenerationSettingsStepMarkup(false);
    agentConfigs["image-detail"].intro = "按产品信息、竞品分析、提示词确认、生图设置和图片生成五步完成商品详情图创作。";
    agentConfigs["image-detail"].process = "产品信息 → 竞品分析 → 提示词确认 → 生图设置 → 图片生成。";
    agentConfigs["image-detail"].form =
      imageProductInfoStepMarkup(true) +
      imageCompetitorStepMarkup(true) +
      imagePromptStepMarkup(true) +
      imageGenerationSettingsStepMarkup(true);

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
        name: creationContext.productName || "当前产品",
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

    function isImageCreationFlow(type = activeType) {
      return type === "image-main" || type === "image-detail";
    }

    function usesProductInformationFlow(type = activeType) {
      return isStructuredCopyFlow(type) || isImageCreationFlow(type);
    }

    function updateModalContext() {
      saveProductButton.hidden = !usesProductInformationFlow() || creationContext.productSaved;
      if (usesProductInformationFlow()) {
        saveProductButton.textContent = "保存产品";
        saveProductButton.disabled = false;
      }
      contextStatus.hidden = !activeType;
      contextStatus.textContent = `已带入：${currentProduct().name}`;
      if (isImageCreationFlow() && taskShell?.classList.contains("show") && taskStep === 1) renderTaskActions();
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
        creationContext.productConfirmed = true;
        creationContext.productSaved = true;
        const librarySelect = dynamicForm.querySelector("[data-product-source-panel=\"library\"] [data-product-select]");
        if (librarySelect?.value && productCatalog[librarySelect.value]) applyProductToForm(librarySelect.value);
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
      dynamicForm.querySelectorAll("[data-product-select]").forEach(select => {
        if (![...select.options].some(option => option.value === productId)) {
          select.add(new Option(product.name, productId));
        }
        select.value = productId;
      });
      const fieldMap = { core: product.core, secondary: product.secondary, difference: product.difference };
      Object.entries(fieldMap).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = value;
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(value || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      const factHint = dynamicForm.querySelector("[data-product-fact-hint]");
      if (factHint) factHint.textContent = product.facts;
      setActiveAudience(product.audiences);
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
      if (announce) setFormFeedback(`已切换至“${product.name}”，并重新带入卖点、人群、心理建议和禁用词。`);
    }

    function captureOriginalContext() {
      if (!usesProductInformationFlow()) return;
      dynamicForm.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      dynamicForm.querySelectorAll("[data-field]").forEach(field => {
        creationContext.originalFields[field.dataset.field] = field.value;
      });
      creationContext.productName = dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || creationContext.productName;
      creationContext.originalFields.brand = dynamicForm.querySelector("[data-original-brand]")?.value || "";
      creationContext.originalFields.category = dynamicForm.querySelector("[data-original-category]")?.value || "";
      creationContext.originalFields.wordCount = dynamicForm.querySelector("[data-word-count]")?.value || "180";
      creationContext.originalFields.generationCount = dynamicForm.querySelector("[data-generation-count]")?.value || "3";
      creationContext.originalFields.marketingScene = dynamicForm.querySelector('[data-role="marketing-scene"] .choice-chip.active')?.textContent.trim() || "短视频带货";
      creationContext.originalFields.hook = dynamicForm.querySelector('[data-role="hook"] .choice-chip.active')?.textContent.trim() || "不限";
      creationContext.originalFields.scriptType = dynamicForm.querySelector('[data-role="script-type"] .choice-chip.active')?.textContent.trim() || "不限";
      creationContext.originalFields.gender = dynamicForm.querySelector('[data-role="gender"] .choice-chip.active')?.textContent.trim() || "不限";
      const selectedAge = dynamicForm.querySelector('[data-role="age"] .choice-chip.active')?.textContent.trim() || "不限";
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
      if (manualName) manualName.value = creationContext.productName || currentProduct().name || "";
      Object.entries(fields).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field && typeof value === "string") field.value = value;
        if ((key === "core" || key === "secondary" || key === "trust") && typeof value === "string") setPointEditorValues(key, value.split("\n").filter(Boolean));
      });
      const wordCount = dynamicForm.querySelector("[data-word-count]");
      if (wordCount && fields.wordCount) wordCount.value = fields.wordCount;
      const generationCount = dynamicForm.querySelector("[data-generation-count]");
      if (generationCount && fields.generationCount) generationCount.value = fields.generationCount;
      ["marketingScene", "hook", "scriptType", "gender", "age"].forEach(key => {
        const role = { marketingScene:"marketing-scene", hook:"hook", scriptType:"script-type", gender:"gender", age:"age" }[key];
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
      setOriginalAdvanced(Boolean(fields.advancedOpen));
      refreshWordDuration();
    }

    function recognizeLinkedProduct() {
      const linkInput = dynamicForm.querySelector("[data-product-link]");
      const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
      if (!linkInput?.value.trim()) {
        feedback.hidden = false;
        feedback.className = "inline-feedback error";
        feedback.innerHTML = "<strong>无法识别</strong><span>请先粘贴有效的抖店商品链接。</span>";
        linkInput.focus();
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
      setActiveAudience(product.audiences);
      ["marketing", "trust", "pain", "scenes"].forEach(key => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = "";
        if (key === "trust") setPointEditorValues("trust", [""]);
      });
      feedback.hidden = false;
      feedback.className = "inline-feedback success";
      feedback.innerHTML = `<strong>解析完成</strong><span>已回填可识别的产品信息；空白字段请手工补充。</span>`;
      updateModalContext();
      setFormFeedback("");
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
      feedback.innerHTML = "<strong>预设已应用</strong><span>已更新文案风格、目标人群、用户心理和CTA，产品事实保持不变。</span>";
      setFormFeedback("创作预设已应用，可继续调整后生成。");
    }

    function renderMaterialScopeDetail(row, label) {
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
    }

    const originalAiSuggestions = {
      core: [
        ["大吸力深入床褥缝隙，拍打吸尘同步完成"],
        ["边拍边吸带走织物深处毛发与碎屑", "透明尘杯让清洁结果看得见"],
        ["床垫、沙发、布艺多场景深层清洁"]
      ],
      secondary: [
        ["透明尘杯可拆卸水洗", "床垫、沙发和布艺均可使用"],
        ["机身轻巧，日常取用方便", "清洁后尘杯可直接拆洗"],
        ["拍打与吸尘同步进行", "操作结束后清理步骤简单"]
      ],
      trust: [
        ["整机质保 1 年，产品参数与包装清单可核验"],
        ["产品型号、参数与售后信息均可查询", "核心功能有真实产品资料支持"],
        ["公司自有产品实拍与历史素材可验证使用效果"]
      ],
      pain: [
        ["孩子后背红疹反复，半夜痒醒哭闹", "床单刚换，尘杯仍吸出毛发碎屑", "宠物上床后，床褥清洁总停在表面"],
        ["肉眼看着干净，织物深处仍藏着毛发碎屑", "普通粘毛器只能处理表面", "床垫沙发体积大，清洁频率低"],
        ["清洁结果看不见，不知道有没有吸干净", "机器难清理，使用一次就闲置", "多种布艺需要反复更换工具"]
      ],
      scene: [
        ["宝宝家庭的床垫日常清洁", "养宠家庭的沙发布艺清洁"],
        ["换洗床单前后的床褥深层清洁", "宠物上床后的毛发碎屑清理"],
        ["卧室床垫、客厅沙发和布艺座椅连续清洁"]
      ]
    };
    const originalSuggestionIndex = {};

    function regenerateOriginalSuggestion(type) {
      const groups = originalAiSuggestions[type] || [];
      if (!groups.length) return;
      originalSuggestionIndex[type] = ((originalSuggestionIndex[type] || 0) + 1) % groups.length;
      const values = groups[originalSuggestionIndex[type]];
      if (type === "core" || type === "secondary" || type === "trust") setPointEditorValues(type, values);
      if (type === "pain") {
        const field = dynamicForm.querySelector('[data-field="pain"]');
        if (field) field.value = values.join("\n");
      }
      if (type === "scene") {
        const field = dynamicForm.querySelector('[data-field="scenes"]');
        if (field) field.value = values.join("\n");
      }
      creationContext.productConfirmed = false;
      creationContext.productSaved = false;
      updateModalContext();
      showToast("AI 推荐已更新，可继续换一组或人工修改");
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
      if (!isStructuredCopyFlow()) return true;
      if (!validateOriginalStep(1) || !validateOriginalStep(2)) return false;
      captureOriginalContext();
      return true;
    }

    function renderAgentForm(type) {
      const config = agentConfigs[type];
      if (!config) return;
      modalIntro.textContent = config.intro;
      agentProcess.textContent = config.process;
      dynamicForm.innerHTML = config.form;
      if (type === "copy") {
        referenceTranscriptState.library = { defaultValue: "", value: "" };
        referenceTranscriptState.upload = { defaultValue: "", value: "" };
      }
      if (type === "rewrite") {
        creationContext.productSource = "library";
        rewriteSourceState.library = rewriteCopySamples["mite-summer"];
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
      if (type === "image-detail") renderDetailModuleOrder();
      setFormFeedback("");
      if (isStructuredCopyFlow(type)) hydrateOriginalContext();
      else if (isImageCreationFlow(type)) {
        setProductSource(creationContext.productSource || "library");
        if (creationContext.productSource === "library") applyProductToForm(creationContext.productId);
      } else applyProductToForm(creationContext.productId);
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

    const referenceTranscriptSamples = {
      "7553983811703193643": "这不吸真是不知道，真没想到我每天竟然跟这些东西睡在一起。这秋天可是螨虫的高发期，家里床上的螨虫数量非常大。咱们家里记得晒，更要用除螨仪把藏在床垫和沙发里的毛发、灰尘吸出来。轻净 Pro 拍打和吸尘同步完成，尘杯还能拆下水洗，日常清理更方便。",
      "7553983811703195018": "洗地机最怕什么？不是洗不干净，而是滚刷缠毛、边角留污。净界洗地机吸拖洗同步完成，贴边清洁不留缝，滚刷还能自动清洗。厨房油污、客厅脚印和宠物毛发，一遍就能处理干净。",
      "external-mite-hook-01": "别只看床单表面干不干净，真正影响睡眠体验的是藏在织物深处的毛发、皮屑和灰尘。先把清洁结果展示出来，再说明产品如何拍打、吸尘和清理尘杯，让用户直接看到使用前后的差别。"
    };
    const referenceTranscriptState = {
      library: { defaultValue: "", value: "" },
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
      const state = referenceTranscriptState[source];
      const sourcePanel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const sourceReady = source === "library"
        ? Boolean(sourcePanel?.querySelector("[data-reference-value]")?.value)
        : source === "upload" && Boolean(sourcePanel?.querySelector("[data-reference-upload].selected"));
      const visible = Boolean(state?.defaultValue) && sourceReady && (source === "library" || source === "upload");
      if (!editor || !textarea) return;
      editor.hidden = !visible;
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

    const rewriteCopySamples = {
      "mite-summer": "你家床垫真的洗干净了吗？轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑，清洁结果直接进入透明尘杯。床垫、沙发和布艺都能使用，用完尘杯还能拆下水洗。点击商品，先看实际使用效果。",
      "mite-family": "每天睡的床，看起来干净不代表织物深处没有毛发和碎屑。轻净 Pro 拍打和吸尘同步完成，清洁结果直接看得见。床垫、沙发都能用，用完尘杯拆下水洗，家庭日常清洁更方便。",
      "mite-pet": "家里养宠物，床铺清洁别只处理表面的毛。轻净 Pro 边拍边吸，把藏进床垫和沙发里的毛发碎屑带进透明尘杯。用完可拆卸水洗，养宠家庭日常使用更省事。"
    };
    const rewriteSourceState = { library: rewriteCopySamples["mite-summer"], paste: "" };

    function refreshRewriteSource(initial = false) {
      const source = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      const libraryField = dynamicForm.querySelector("[data-rewrite-library-field]");
      const previous = dynamicForm.dataset.rewriteSource;
      if (!initial && previous && textarea) rewriteSourceState[previous] = textarea.value;
      dynamicForm.dataset.rewriteSource = source;
      if (libraryField) libraryField.hidden = source !== "library";
      if (textarea) textarea.value = rewriteSourceState[source] || "";
    }

    function refreshRewriteLibraryCopy() {
      const id = dynamicForm.querySelector("[data-rewrite-library]")?.value;
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      rewriteSourceState.library = rewriteCopySamples[id] || "";
      if (textarea) textarea.value = rewriteSourceState.library;
      setFormFeedback("");
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
              <button class="rewrite-audience-chip active" type="button">精致妈妈</button><button class="rewrite-audience-chip" type="button">新锐白领</button><button class="rewrite-audience-chip" type="button">资深中产</button><button class="rewrite-audience-chip" type="button">Z世代</button><button class="rewrite-audience-chip" type="button">小镇青年</button><button class="rewrite-audience-chip" type="button">小镇中老年</button><button class="rewrite-audience-chip" type="button">都市蓝领</button><button class="rewrite-audience-chip" type="button">都市银发</button>
            </div></div>
            <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="rewrite-gender" data-role="rewrite-gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
            <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="rewrite-age" data-role="rewrite-age"><span class="choice-chip active">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-rewrite-custom-age-trigger>自定义</span><span class="custom-age-range" data-rewrite-custom-age hidden><input type="number" min="1" max="99" value="25" data-rewrite-age-min><i>至</i><input type="number" min="1" max="99" value="35" data-rewrite-age-max></span></div></div>
          </div>
          <input type="hidden" data-field="rewriteTarget" data-required value="精致妈妈、不限、不限">
          <div class="rewrite-audience-details">
            <div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div>
            <textarea data-field="pain" placeholder="一行一个人群核心痛点">床单刚换，尘杯仍吸出毛发碎屑\n宠物上床后，床褥清洁总停在表面</textarea>
            <div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div>
            <textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea>
          </div>`,
        selling: `<label>需要前置的卖点<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>${escapeHtml(currentProduct().core || "核心卖点")}</option><option>${escapeHtml(currentProduct().secondary || "次要卖点")}</option><option>${escapeHtml(currentProduct().difference || "差异化卖点")}</option></select>`,
        style: `<label>目标表达风格<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>硬广直给</option><option>生活化口播</option><option>专业测评</option><option>情绪冲击</option><option>理性对比</option></select>`
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
      const hasLibrarySelection = source === "library" && Boolean(activePanel?.querySelector("[data-reference-value]")?.value);
      const hasUpload = source === "upload" && Boolean(activePanel?.querySelector("[data-reference-upload].selected"));
      if (stepPanel) stepPanel.dataset.referenceReady = hasLibrarySelection || hasUpload ? "true" : "false";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = !(hasLibrarySelection || hasUpload);
      }
      refreshReferenceTranscriptEditor(source);
    }

    function filterReferenceVideos() {
      const keyword = dynamicForm.querySelector("[data-reference-search]")?.value.trim().toLowerCase() || "";
      const filter = dynamicForm.querySelector('[data-single="reference-filter"] .choice-chip.active')?.dataset.referenceFilter || "all";
      dynamicForm.querySelectorAll("[data-reference-video]").forEach(item => {
        const matchesSource = filter === "all" || item.dataset.referenceSourceType === filter;
        const matchesKeyword = !keyword || (item.dataset.referenceSearchText || "").toLowerCase().includes(keyword);
        item.hidden = !(matchesSource && matchesKeyword);
      });
    }

    function selectReferenceVideo(option) {
      const panel = dynamicForm.querySelector('[data-reference-panel="library"]');
      const value = panel?.querySelector("[data-reference-value]");
      const title = option.querySelector("strong")?.textContent.trim() || "已选参考视频";
      const meta = option.querySelector("small")?.textContent.trim() || "";
      if (value) value.value = option.dataset.referenceVideo || title;
      showReferenceTranscript("library", referenceTranscriptSamples[option.dataset.referenceVideo] || "已识别该参考视频中的口播文案，可在此修改后用于爆款仿写。 ");
      dynamicForm.querySelectorAll("[data-reference-video]").forEach(item => item.classList.toggle("selected", item === option));
      const selected = dynamicForm.querySelector("[data-selected-reference]");
      if (selected) {
        selected.hidden = false;
        selected.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span>`;
      }
      const triggerText = dynamicForm.querySelector("[data-reference-trigger-text]");
      if (triggerText) triggerText.textContent = "重新选择视频";
      const picker = dynamicForm.querySelector("[data-reference-library]");
      if (picker) picker.hidden = true;
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      if (stepPanel) stepPanel.dataset.referenceReady = "true";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = option.dataset.referenceSourceType === "history"
          ? "<strong>已带入</strong><span>已读取该历史投放视频的口播和拉片结果，并用于仿写结构学习。</span>"
          : "<strong>已带入</strong><span>已读取外部参考视频的拉片结果，仅学习创作方法，不作为效果样本。</span>";
      }
      setFormFeedback("");
      showToast("参考视频已带入");
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
        const durationOutput = wordInput.closest(".field")?.querySelector("[data-duration]");
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

    agentCards.forEach(card => {
      card.addEventListener("click", () => selectAgent(card, true));
    });

    agentOptions.forEach(option => {
      option.addEventListener("click", () => {
        if (option.dataset.agentType === "chat") {
          selectChat();
          return;
        }
        const card = agentCards.find(item => item.dataset.type === option.dataset.agentType);
        if (card) selectAgent(card, true);
      });
    });

    function closeModal(commit = false) {
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      modal.classList.remove("show");
      if (agentSelectionPending && !commit) {
        agentSelectionPending = false;
        selectChat();
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
    function personaPickerMarkup(context) {
      return `<div class="original-field full persona-select-field">
        <label>人群画像</label>
        <div class="persona-picker" data-persona-picker data-persona-context="${context}" data-persona-mode="manual">
          <div class="persona-source-switch" role="group" aria-label="人群画像来源">
            <button class="active" type="button" data-persona-source-mode="manual">自行输入</button>
            <button type="button" data-persona-source-mode="template">从模板库选择</button>
          </div>
          <div class="persona-template-select" data-persona-template-select hidden>
            <button class="persona-picker-trigger" type="button" data-persona-trigger><span data-persona-selected>搜索或选择人群画像</span><small>⌄</small></button>
            <div class="persona-picker-dropdown" data-persona-dropdown hidden>
              <input class="persona-picker-search" data-persona-search placeholder="搜索产品名称、画像名称或人群">
              <div class="persona-picker-options" data-persona-options></div>
            </div>
            <div class="persona-applied" data-persona-applied hidden><span></span><button type="button" data-persona-clear>改为自行输入</button></div>
          </div>
        </div>
      </div>`;
    }
    agentConfigs.original.intro = "基于产品事实、目标人群与内容设定，生成可直接用于千川短视频创作的多版本口播文案。";
    agentConfigs.original.process = "确认产品信息 → 设置开场、脚本类型、用户心理、长度与模型 → 生成文案 → 保存、转脚本或继续对话修改。";
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
              <div class="header-product-picker" data-product-source-panel="library"><select aria-label="选择产品" data-product-select data-required>${productOptions}</select></div>
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
              <div class="original-field advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">短视频带货</span><span class="choice-chip">直播间引流</span></div></div>
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
                  <div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip active" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip active" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div>
                  <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
                  <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">18–23</span><span class="choice-chip active">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">50+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="age-custom" data-custom-age hidden><input type="number" min="18" max="80" value="25" data-age-min><span>至</span><input type="number" min="18" max="80" value="35" data-age-max></span></div></div>
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
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定口播的开场方式、内容结构、心理切口、长度和生成模型。</p></div></div>
          <div class="original-group">
            <div class="original-group-title"><strong>内容脚本设定</strong><span>控制本次文案的结构与产出规格</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>开场钩子偏好</label><div class="choice-row original-choices" data-single="hook" data-role="hook"><span class="choice-chip active">不限</span><span class="choice-chip">利益直给</span><span class="choice-chip">痛点冲突</span><span class="choice-chip">结果前置</span><span class="choice-chip">反常识</span><span class="choice-chip">价格冲击</span><span class="choice-chip">场景代入</span><span class="choice-chip">身份点名</span><span class="choice-chip">风险提醒</span><span class="choice-chip">数字清单</span><span class="choice-chip">悬念揭秘</span><span class="choice-chip">对比反差</span><span class="choice-chip">实测验证</span></div></div>
              <div class="original-field full"><label>脚本类型<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="script-type" data-role="script-type"><span class="choice-chip active">不限</span><span class="choice-chip">引发好奇类型</span><span class="choice-chip">痛点类型</span><span class="choice-chip">活动类型</span><span class="choice-chip">悬疑类型</span><span class="choice-chip">打感情类型</span><span class="choice-chip">对比类型</span><span class="choice-chip">种草类型</span><span class="choice-chip">网络爆款音频类型</span><span class="choice-chip">制造焦虑类型</span><span class="choice-chip">明星文案类型</span><span class="choice-chip">点名人群类型</span><span class="choice-chip">正话反说类型</span><span class="choice-chip">品牌类型</span></div></div>
              <div class="original-field full"><label>用户心理</label><select data-field="psychology"><option>不限</option><option>避坑心理—曝光常见误区</option><option>落后心理—制造同辈压力与紧迫感</option><option>择优心理—科学测评与对比榜单强化“最优解”</option><option>理想身份心理—绑定“精致精英”人设</option><option>制造悬念—揭秘式剧情激发好奇心理</option><option>反差心理—她经济影响他经济</option><option>礼赠心理—提供情绪价值打造社交货币属性</option></select></div>
              <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="180" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 45 秒</b></div></div>
              <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
              <div class="original-field full"><label>模型<span class="required-star">*</span></label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
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
              <div class="original-field"><label>参考来源<span class="required-star">*</span></label><select data-reference-source data-required><option value="library">从视频库选择</option><option value="upload">上传视频</option><option value="text">粘贴文案</option></select></div>
              <div class="original-field" data-reference-panel="library">
                <label>参考视频<span class="required-star">*</span></label>
                <input type="hidden" data-reference-value data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-reference-library"><span data-reference-trigger-text>从视频库选择</span><b>›</b></button>
                <div class="selected-reference-video" data-selected-reference hidden></div>
              </div>
              <div class="original-field full" data-reference-panel="upload" hidden><label>上传参考视频<span class="required-star">*</span></label><div class="upload-box reference-upload" data-reference-upload><strong>点击选择或拖拽上传视频</strong><span>上传后自动识别口播文案、结构和表达节奏</span></div></div>
              <div class="original-field full" data-reference-panel="text" hidden><label>参考文案<span class="required-star">*</span></label><textarea data-reference-value data-required placeholder="粘贴需要参考的完整口播文案"></textarea></div>
              <div class="original-field full reference-transcript-editor" data-reference-transcript-editor hidden>
                <div class="reference-transcript-head"><label>识别文案<span class="required-star">*</span></label><button type="button" data-action="reset-reference-transcript">恢复识别原文</button></div>
                <textarea data-reference-transcript data-required placeholder="视频中的口播文案将在识别后显示，可直接修改"></textarea>
              </div>
              <div class="reference-video-picker full" data-reference-library hidden>
                <div class="reference-picker-head"><div><strong>选择参考视频</strong><span>历史投放素材和外部参考视频统一在视频库管理</span></div><button type="button" data-action="toggle-reference-library">×</button></div>
                <div class="reference-picker-tools"><input data-reference-search placeholder="搜索视频名称或素材 ID"><div class="choice-row" data-single="reference-filter"><span class="choice-chip active" data-reference-filter="all">全部</span><span class="choice-chip" data-reference-filter="history">历史投放</span><span class="choice-chip" data-reference-filter="external">外部参考</span></div></div>
                <div class="reference-video-list">
                  <button class="reference-video-option" type="button" data-reference-video="7553983811703193643" data-reference-source-type="history" data-reference-search-text="轻净pro除螨仪 结果冲击 高转化 7553983811703193643"><i>▶</i><span><strong>轻净 Pro 除螨仪｜结果冲击型</strong><small>历史投放 · 素材 ID 7553983811703193643 · 已有口播与拉片结果</small></span><em>选择</em></button>
                  <button class="reference-video-option" type="button" data-reference-video="7553983811703195018" data-reference-source-type="history" data-reference-search-text="净界洗地机 痛点直给 7553983811703195018"><i>▶</i><span><strong>净界洗地机｜痛点直给型</strong><small>历史投放 · 素材 ID 7553983811703195018 · 已有口播与拉片结果</small></span><em>选择</em></button>
                  <button class="reference-video-option" type="button" data-reference-video="external-mite-hook-01" data-reference-source-type="external" data-reference-search-text="清洁家电 结果钩子 外部参考 除螨"><i>▶</i><span><strong>清洁家电｜结果钩子参考</strong><small>外部参考 · 已完成智能拉片 · 仅用于创作方法学习</small></span><em>选择</em></button>
                </div>
              </div>
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
                <div class="header-product-picker" data-product-source-panel="library"><select aria-label="选择产品" data-product-select data-required>${productOptions}</select></div>
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
              <div class="original-field advanced-field" hidden><label>营销场景</label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">短视频带货</span><span class="choice-chip">直播间引流</span></div></div>
              <div class="original-field advanced-field" hidden><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前产品真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>人群与表达策略</strong><span>确定仿写内容最终对谁表达</span></div>
            <div class="original-group-fields">
              ${personaPickerMarkup("copy")}
              <div class="original-field full"><label>核心目标人群<span class="required-star">*</span></label><div class="audience-selector"><div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip active" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip active" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div><div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div><div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip active">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="custom-age-range" data-custom-age hidden><input type="number" min="1" max="99" value="25" data-age-min><i>至</i><input type="number" min="1" max="99" value="35" data-age-max></span></div></div></div></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain" placeholder="一行一个人群核心痛点">孩子后背红疹反复，半夜痒醒哭闹\n床单刚换，尘杯仍吸出毛发碎屑</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div>
            </div>
          </div>
        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定仿写文案的长度、生成数量和使用模型。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="120" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 30 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型<span class="required-star">*</span></label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
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
            <div><h2>原文与产品信息</h2><p>选择待改写文案，并确认改写时允许使用的产品事实。</p></div>
            <div class="original-header-controls">
              <div class="header-product-picker"><select aria-label="选择产品" data-product-select data-required>${productOptions}</select></div>
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="original-group rewrite-source-group">
            <div class="original-group-title"><strong>原文信息</strong><span>从文案库选择或直接粘贴，原资产不会被覆盖</span></div>
            <div class="original-group-fields">
              <div class="original-field"><label>原文来源<span class="required-star">*</span></label><select data-rewrite-source data-required><option value="library">从文案库选择</option><option value="paste">粘贴文案</option></select></div>
              <div class="original-field" data-rewrite-library-field><label>选择文案<span class="required-star">*</span></label><select data-rewrite-library data-required><option value="mite-summer">除螨仪暑期投放文案</option><option value="mite-family">除螨仪家庭场景文案</option><option value="mite-pet">除螨仪养宠人群文案</option></select></div>
              <div class="original-field full"><label>待改写文案<span class="required-star">*</span></label><textarea data-rewrite-original data-field="sourceCopy" data-required>你家床垫真的洗干净了吗？轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑，清洁结果直接进入透明尘杯。床垫、沙发和布艺都能使用，用完尘杯还能拆下水洗。点击商品，先看实际使用效果。</textarea></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>基础信息</strong><span>确定本次改写对应的产品</span></div>
            <div class="original-group-fields">
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
              <div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">短视频带货</span><span class="choice-chip">直播间引流</span></div></div>
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
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="120" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 30 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型<span class="required-star">*</span></label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
          </div></div>
        </section>
      </div>`;

    const agentStepPlans = {
      original: ["产品信息", "生成设置", "AI生成文案"],
      copy: ["爆款参考与产品信息", "生成设置", "AI生成文案"],
      rewrite: ["原文与产品信息", "改写设置", "AI生成文案"],
      "image-main": ["产品信息", "竞品分析", "提示词确认", "生图设置", "图片生成"],
      "image-detail": ["产品信息", "竞品分析", "提示词确认", "生图设置", "图片生成"],
      script: ["文案信息", "脚本策略", "选择模型", "确认生成"],
      "script-copy": ["参考脚本", "重构策略", "选择模型", "确认生成"],
      mix: ["脚本与素材", "成片策略", "选择模型", "确认生成"],
      "video-create": ["创作方式", "镜头要求", "选择模型", "确认生成"]
    };
    const agentGreetings = {
      original: "我是智能文案 Agent。我会基于产品事实、目标人群和内容设定生成千川口播文案。请先确认左侧产品信息。",
      copy: "我是爆款文案仿写 Agent。我会保留参考内容的有效方法，再为你的产品重新创作。",
      rewrite: "我是智能改写 Agent。我会保留你指定的内容，按目标完成可控改写。",
      "image-main": "我是商品主图 Agent。我会根据产品图、卖点和投放用途生成可继续调整的商品主图。",
      "image-detail": "我是商品详情页 Agent。我会把产品卖点拆成有阅读顺序、可继续编辑的详情页图片模块。",
      script: "我是智能脚本 Agent。我会把已确认文案拆成可执行的结构化脚本与分镜。",
      "script-copy": "我是爆款脚本仿写 Agent。我会借鉴参考脚本的节奏与镜头逻辑，为当前产品重新设计。",
      mix: "我是智能混剪 Agent。我会依据脚本匹配素材，并标出需拍摄或建议视频创作的镜头。",
      "video-create": "我是视频创作 Agent。我会按你的创意描述生成所需产品镜头。"
    };
    let taskStep = 1;
    let taskCompleted = false;
    let taskEditing = false;
    let originalTaskAssetIds = [];
    let originalCopyTargetId = "";

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

    function imageGenerationConfirmMarkup(detail = false) {
      const productName = escapeHtml(currentProduct().name || "当前商品");
      const title = detail ? "详情页图片生成结果" : "商品主图生成结果";
      const description = detail
        ? "按详情页模块顺序预览生成结果，并可按竞品方案切换查看。"
        : "在中间结果区查看上架参考与生成图片，并可按竞品方案切换。";
      const selectedCompetitors = creationContext.skipCompetitorAnalysis ? [] : [...dynamicForm.querySelectorAll(".image-competitor-table tbody tr")].filter(row => row.querySelector(".competitor-select")?.checked).map(row => ({
        name:row.querySelector(".competitor-product-cell strong")?.textContent.trim() || "竞品方案",
        mode:row.querySelector(".competitor-mode-options input:checked")?.value === "replicate" ? "复刻" : "参考"
      }));
      const resultSets = selectedCompetitors.length ? selectedCompetitors : [{name:"原创生成方案",mode:"原创"}];
      const uploadedUrl = window.imageUploadPreviewRecords?.[0]?.url || "";
      const referenceMedia = uploadedUrl ? '<img src="'+escapeHtml(uploadedUrl)+'" alt="已上传商品参考图">' : '<img src="assets/main-listing-preview.png" alt="商品主图上架预览">';
      const options = resultSets.map((item,index) => '<option value="'+index+'">'+escapeHtml(item.name)+' · '+escapeHtml(item.mode)+'</option>').join('');
      const resultPanels = resultSets.map((item,index) => '<div class="generation-result-panel" data-generation-result="'+index+'" '+(index ? 'hidden' : '')+'><div class="generation-result-card"><h4>'+escapeHtml(item.name)+' · '+escapeHtml(item.mode)+'方案</h4><div class="generation-result-stage"><div class="generation-canvas"><div class="generation-copy"><span>'+escapeHtml(index ? '差异化竞品方案' : '轻净 PRO')+'</span><h3>'+(detail ? '深层除螨<br>净享安心睡眠' : '强劲清洁<br>一遍搞定')+'</h3><p>'+(detail ? '按模块连续输出，信息层级清晰' : '大吸力深层清洁 · 透明尘杯结果可见')+'</p></div><div class="generation-product"></div><div class="generation-meta"><span>'+(detail ? '详情模块' : '商品主图')+'</span><span>'+escapeHtml(item.mode)+'</span><span>方案 '+(index+1)+'</span></div></div></div><div class="generation-result-footer"><div class="generation-thumbs"><button class="active" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">4</button></div><div class="generation-actions"><button type="button">送入画板</button><button type="button">下载</button><button class="primary" type="button" data-save-generated-image>保存至图片库</button></div></div></div></div>').join('');
      return '<div class="form-section-head"><div><strong>'+title+'</strong><small>'+description+'</small></div><span class="badge">步骤 5 / 5</span></div>'+ 
        '<div class="image-generation-intro">已汇总产品“'+productName+'”、'+escapeHtml(selectedModelLabel())+'、'+resultSets.length+' 个生成方案和已确认提示词。多选竞品时，每个竞品独立生成一组结果。</div>'+ 
        '<div class="generation-result-toolbar"><div><strong>生成方案</strong><small> · 选择竞品切换对应生成图片</small></div><select data-generation-competitor-select>'+options+'</select></div>'+ 
        '<div class="image-generation-preview"><div class="generation-reference-card"><h4>上传参考图 / 上架预览</h4><div class="generation-reference-media">'+referenceMedia+'</div></div><div>'+resultPanels+'</div></div>';
    }

    function decorateImageCompetitorAnalysisTable() {
      const table = dynamicForm.querySelector(".image-competitor-table");
      if (!table || table.dataset.editableReady) return;
      table.dataset.editableReady = "true";
      const headerRow = table.querySelector("thead tr");
      const categoryHeader = [...headerRow.children].find(cell => cell.textContent.trim() === "类目" || cell.textContent.trim() === "一级类目");
      if (categoryHeader) categoryHeader.textContent = "一级类目";
      const typeHeader = [...headerRow.children].find(cell => cell.textContent.trim() === "使用类型");
      typeHeader?.insertAdjacentHTML("beforebegin", "<th>反推提示词</th>");
      table.querySelectorAll("tbody tr").forEach((row,index) => {
        [6,7,8].forEach(cellIndex => row.children[cellIndex]?.setAttribute("contenteditable", "true"));
        const categoryCell = row.children[9];
        if (categoryCell && categoryCell.textContent.includes("/")) categoryCell.textContent = categoryCell.textContent.split("/").slice(-2,-1)[0]?.trim() || categoryCell.textContent.trim();
        categoryCell?.insertAdjacentHTML("afterend", `<td class="competitor-reverse-prompt" contenteditable="true">${index ? "极简功能拆解构图，强化产品原理与结果证据" : "真实床褥场景，主体居中，尘杯结果可视化，突出深层清洁"}</td>`);
      });
    }

    function prepareTaskForm() {
      const steps = taskSteps();
      dynamicForm.querySelectorAll(".task-confirm-card").forEach(node => node.remove());
      if (isImageCreationFlow()) {
        dynamicForm.querySelectorAll("select").forEach(select => {
          const label = select.closest(".field")?.querySelector(":scope > label")?.textContent || "";
          if (!label.includes("生成张数")) return;
          let one = [...select.options].find(option => option.textContent.trim() === "1 张");
          if (!one) { one = new Option("1 张","1 张",true,true); select.prepend(one); }
          select.value = one.value;
          if (activeType === "image-detail") {
            select.disabled = true;
            select.title = "详情页每个模块固定生成 1 张图片";
            select.closest(".field")?.classList.add("generation-count-locked");
          }
        });
      }
      if (isStructuredCopyFlow()) {
        dynamicForm.querySelectorAll("[data-original-step]").forEach(section => {
          section.dataset.taskStep = section.dataset.originalStep;
        });
        const modelHost = dynamicForm.querySelector("[data-original-model-host]");
        if (modelHost) modelHost.dataset.taskStep = "2";
        renderTaskModelStep();
        return;
      }
      if (isImageCreationFlow()) {
        dynamicForm.querySelectorAll(".task-model-card").forEach(node => node.remove());
        dynamicForm.querySelector('[data-role="marketing-scene"]')?.closest(".original-field")?.remove();
        dynamicForm.querySelector('[data-field="marketing"]')?.closest(".original-field")?.remove();
        decorateImageCompetitorAnalysisTable();
        const confirm = document.createElement("section");
        confirm.className = "task-confirm-card task-image-generation-card";
        confirm.dataset.taskStep = "5";
        confirm.innerHTML = imageGenerationConfirmMarkup(activeType === "image-detail");
        dynamicForm.append(confirm);
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
        host.innerHTML = `
          <div class="original-model-picker">
            <button class="original-model-trigger" type="button" data-original-model-trigger aria-expanded="false"><span>${escapeHtml(selectedModelLabel())}</span><b>⌃</b></button>
            <div class="original-model-popover" role="listbox">
              ${options.map(option => `<button class="original-model-option${option.value === modelSelect.value ? " selected" : ""}" type="button" data-task-model="${escapeHtml(option.value)}"><span><strong>${escapeHtml(option.text)}</strong><small>${escapeHtml(modelDescriptions[option.value] || "适用于千川口播文案生成")}</small></span><b>${option.value === modelSelect.value ? "✓" : ""}</b></button>`).join("")}
            </div>
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

    function validateImageTaskStep(step) {
      const panel = dynamicForm.querySelector(`[data-task-step="${step}"]`);
      if (!panel) return true;
      panel.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      panel.querySelectorAll(".field.invalid, .original-field.invalid").forEach(field => field.classList.remove("invalid"));
      const requiredFields = [...panel.querySelectorAll("[data-required]")].filter(field => {
        if (field.closest("[hidden]") && !field.hidden) return false;
        return !field.disabled;
      });
      const empty = requiredFields.find(field => !String(field.value || "").trim());
      if (empty) {
        empty.closest(".field, .original-field, .prompt-confirm-item")?.classList.add("invalid");
        if (!empty.hidden) empty.focus();
        setFormFeedback("请补充当前步骤的必填信息后再继续。", "error");
        return false;
      }
      if (step === 1) {
        if (creationContext.productSource === "link" && !creationContext.productConfirmed) {
          setFormFeedback("请先解析商品链接并确认产品信息。", "error");
          return false;
        }
        if (!creationContext.productSaved) {
          setFormFeedback("产品信息已修改，请先点击“保存产品”再继续。", "error");
          return false;
        }
      }
      if (step === 2 && !panel.querySelector(".competitor-select:checked")) {
        setFormFeedback("请至少选择一个竞品作为本次生成参考。", "error");
        return false;
      }
      setFormFeedback("");
      return true;
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
      if ((isStructuredCopyFlow() && taskStep === 1) || (isImageCreationFlow() && taskStep === 1)) {
        saveProductButton.hidden = creationContext.productSaved;
        if (!saveProductButton.hidden) taskActionButtons.append(saveProductButton);
      }
      if (!isStructuredCopyFlow() && !isImageCreationFlow() && !contextStatus.hidden) taskActionButtons.append(contextStatus);
      if (isImageCreationFlow() && taskStep === 1) {
        const competitorButton = document.createElement("button");
        competitorButton.className = "ghost-btn";
        competitorButton.type = "button";
        competitorButton.textContent = "竞品分析";
        competitorButton.addEventListener("click", () => {
          if (!validateImageTaskStep(1)) return;
          creationContext.skipCompetitorAnalysis = false;
          setTaskStep(2);
        });
        const directButton = document.createElement("button");
        directButton.className = "primary-btn";
        directButton.type = "button";
        directButton.textContent = "立即生图";
        directButton.addEventListener("click", () => {
          if (!validateImageTaskStep(1)) return;
          creationContext.skipCompetitorAnalysis = true;
          setTaskStep(3);
          setFormFeedback("已跳过竞品分析，进入提示词确认。可返回竞品分析步骤补充参考方案。 ");
        });
        taskActionButtons.append(competitorButton, directButton);
        taskActionNote.textContent = "选择竞品分析，或跳过竞品配置立即进入提示词确认";
        return;
      }
      const next = document.createElement("button");
      next.className = "primary-btn";
      next.type = "button";
      next.textContent = isStructuredCopyFlow()
        ? (taskStep === 1 ? "下一步" : "生成文案")
        : isImageCreationFlow()
          ? (taskStep === 4 ? "确认生图" : taskStep === steps.length ? "" : "下一步")
        : taskStep === steps.length
          ? (taskEditing ? "以新任务继续创作" : "生成结果")
          : "下一步";
      next.addEventListener("click", () => {
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
        if (isImageCreationFlow()) {
          if (!validateImageTaskStep(taskStep)) return;
          if (taskStep === 4) {
            setTaskStep(5);
            showGeneratedResult(true);
            return;
          }
          if (taskStep < steps.length) return setTaskStep(taskStep + 1);
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
      if (isImageCreationFlow() && taskStep === 3) {
        const saveTemplate = document.createElement("button");
        saveTemplate.className = "ghost-btn";
        saveTemplate.type = "button";
        saveTemplate.textContent = "保存为模板";
        saveTemplate.addEventListener("click", openSavePromptTemplateModal);
        taskActionButtons.append(saveTemplate);
      }
      taskActionButtons.append(next);
      taskActionNote.textContent = isStructuredCopyFlow() ? "" : taskStep === steps.length
        ? "图片已生成，可在右侧查看 AI 审查并继续修改"
        : isImageCreationFlow() && taskStep === 4
          ? "确认后立即生成图片并进入结果页"
        : `完成“${steps[taskStep - 1]}”后继续`;
    }

    function setTaskStep(nextStep) {
      const steps = taskSteps();
      taskStep = Math.max(1, Math.min(nextStep, steps.length));
      if (taskCompleted && taskStep < steps.length) taskEditing = true;
      if (isImageCreationFlow() && taskStep === 2) creationContext.skipCompetitorAnalysis = false;
      if (activeType === "image-detail" && taskStep === 3) syncDetailPromptModules();
      if (activeType === "image-detail" && taskStep === 4) renderDetailModuleOrder();
      dynamicForm.querySelectorAll("[data-task-step]").forEach(section => { section.hidden = Number(section.dataset.taskStep) !== taskStep; });
      taskFormScroll.hidden = false;
      taskResultHost.hidden = true;
      taskFormActions.hidden = false;
      taskShell.classList.toggle("image-chat-hidden", isImageCreationFlow() && taskStep < 5);
      if (isImageCreationFlow() && taskStep === 3) {
        const promptSection = dynamicForm.querySelector('[data-task-step="3"]');
        if (promptSection && !promptSection.dataset.defaultTemplateApplied) {
          const category = activeType === "image-detail" ? "商品详情图" : "商品主图";
          const defaultTemplate = promptLibraryRecords.find(record => record.category === category && record.isDefault);
          if (defaultTemplate) applyPromptLibraryRecord(defaultTemplate);
          if (activeType === "image-main") syncMainTotalPrompt();
          promptSection.dataset.defaultTemplateApplied = "true";
        }
      }
      renderTaskStepper();
      renderTaskActions();
      taskFormScroll.scrollTo({ top: 0, behavior: "smooth" });
    }

    function activeCreationSessionTitle() {
      return document.querySelector("#page-creation .chat-row.active strong")?.textContent.trim() || "未命名创作";
    }

    function syncTaskChatTitle() {
      const title = document.getElementById("taskChatTitle");
      if (title) title.textContent = activeCreationSessionTitle();
    }

    function exitAgentTask() {
      if (!taskShell?.classList.contains("show")) return;
      const stage = document.querySelector("#page-creation .creation-stage");
      taskShell.classList.remove("show", "is-complete");
      stage.insertBefore(conversationLocator, taskShell);
      stage.insertBefore(chatOutput, taskShell);
      stage.insertBefore(composerWrap, taskShell);
      stage.insertBefore(document.getElementById("assetToggle"), conversationLocator);
      taskFormScroll.hidden = false;
      taskResultHost.hidden = true;
      taskFormActions.hidden = false;
      agentPillButton.disabled = false;
      modelTrigger.disabled = false;
      modelTrigger.hidden = false;
    }

    function openAgentTask() {
      if (!agentConfigs[activeType]) return;
      taskCompleted = false;
      taskEditing = false;
      taskStep = 1;
      originalTaskAssetIds = [];
      originalCopyTargetId = "";
      taskShell.dataset.agentType = (isStructuredCopyFlow() || isImageCreationFlow()) ? "original" : activeType;
      taskShell.dataset.workflowType = activeType;
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
      taskShell.classList.add("show");
      taskShell.classList.remove("is-complete");
      const composerImageUpload = document.getElementById("composerImageUpload");
      if (composerImageUpload) composerImageUpload.hidden = true;
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
        <div class="task-result-top"><div><strong>${isCopy ? "AI生成原创仿写文案" : isRewrite ? "AI生成改写文案" : "AI生成文案"}</strong><small>已生成 ${assets.length} 条 · ${escapeHtml(currentProduct().name)} · ${escapeHtml(selectedModelLabel())}</small></div><button class="ghost-btn" type="button" id="taskEditInfo">编辑前置信息</button></div>
        <div class="original-result-list">${assets.map(originalCopyCardHtml).join("")}</div>
        <div class="original-continue-box"><span>需要更多方向？继续生成会在下方追加3条，已有结果不会被覆盖。</span><button type="button" data-original-continue>继续生成3条</button></div>`;
      taskResultHost.querySelector("#taskEditInfo")?.addEventListener("click", () => setTaskStep(1));
    }

    function showTaskResult(response, generatedAssets) {
      taskCompleted = true;
      taskEditing = false;
      taskStep = taskSteps().length;
      const imageFlow = isImageCreationFlow();
      taskFormScroll.hidden = !imageFlow;
      taskFormActions.hidden = true;
      taskResultHost.hidden = imageFlow;
      if (isStructuredCopyFlow()) {
        originalTaskAssetIds = generatedAssets.map(asset => asset.id);
        originalCopyTargetId = "";
        renderOriginalTaskResult();
      } else if (!imageFlow) {
        taskResultHost.innerHTML = `
          <div class="task-result-top"><div><strong>本次生成结果</strong><small>${escapeHtml(response.summary)}</small></div><button class="ghost-btn" type="button" id="taskEditInfo">编辑前置信息</button></div>
          <div class="generated-assets">${generatedAssets.map(generatedAssetHtml).join("")}</div>`;
        taskResultHost.querySelector("#taskEditInfo")?.addEventListener("click", () => setTaskStep(1));
      }
      taskShell.classList.add("is-complete");
      const composerImageUpload = document.getElementById("composerImageUpload");
      if (composerImageUpload) composerImageUpload.hidden = !imageFlow;
      document.getElementById("taskChatSubtitle").textContent = imageFlow ? "图片已生成，可查看 AI 审查并继续优化" : "可继续用自然语言修改本次结果";
      promptInput.disabled = false;
      promptInput.placeholder = "继续修改本次结果，例如：把首 3 秒钩子更直接一些";
      sendPromptButton.disabled = false;
      agentPillButton.disabled = false;
      modelTrigger.disabled = false;
      renderTaskStepper();
      requestAnimationFrame(renderConversationLocator);
    }

    taskStepper.addEventListener("click", event => {
      const stepButton = event.target.closest("[data-task-step]");
      if (!stepButton) return;
      const target = Number(stepButton.dataset.taskStep);
      if (taskCompleted && !taskEditing && target === taskSteps().length) {
        taskStep = target;
        taskFormScroll.hidden = !isImageCreationFlow();
        taskResultHost.hidden = isImageCreationFlow();
        taskFormActions.hidden = true;
        renderTaskStepper();
        return;
      }
      if (isImageCreationFlow() && target === taskStep + 1) {
        if (validateImageTaskStep(taskStep)) setTaskStep(target);
        return;
      }
      if (taskCompleted || target <= taskStep) setTaskStep(target);
    });
    document.getElementById("closeTaskRestart").addEventListener("click", () => taskRestartModal.classList.remove("show"));
    document.getElementById("cancelTaskRestart").addEventListener("click", () => taskRestartModal.classList.remove("show"));
    document.getElementById("confirmTaskRestart").addEventListener("click", () => {
      taskRestartModal.classList.remove("show");
      taskEditing = false;
      showGeneratedResult(true);
    });

    selectChat();
    let conversationTurnCount = 0;
    let agentTurnCounts = {};
    let sessionAssets = [];
    let assetSequence = 0;
    let pendingSourceAssetId = "";

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
        const sourceItems = contextualCopy(activeType === "copy" ? "copy" : activeType === "rewrite" ? "rewrite" : "original", startIndex, 3);
        const newAssets = sourceItems.map(([title, preview]) => ({
          type:"copy",
          title,
          preview,
          structureTags:copyStructureTags(title),
          wordCount:preview.replace(/\s/g, "").length,
          meta:activeType === "copy" ? "爆款方法重构 · 原创边界通过" : `${creationContext.originalFields.scriptType || "不限"} · ${creationContext.originalFields.hook || "不限"}`,
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
      "video-create": [
        ["保持主体不变，换成缓慢环绕运镜", "video-create"],
        ["基于当前镜头生成3个不同运镜版本", "video-create"],
        ["把当前镜头加入除螨仪主视频素材", "mix"]
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

    const completeScriptRows = [
      {
        time: "00—03s",
        voice: "刚换的床单，也能吸出一杯脏东西。",
        visual: "先给结果：透明尘杯脏污特写；0.8秒后切到整洁床面，形成干净与脏污的视觉反差。",
        subtitle: "刚换床单 ≠ 床垫干净",
        execution: "竖屏近景；尘杯居中；前1秒必须出现脏污证据；无合适素材时进入补拍清单。"
      },
      {
        time: "03—06s",
        voice: "看得见的是表面，看不见的都藏在床垫深处。",
        visual: "手掌按压床垫，接床垫纤维微距和毛发碎屑特写，画面由整洁逐步推进到细节。",
        subtitle: "毛发、碎屑藏在织物深处",
        execution: "中景转微距；2个镜头；每镜1.5秒；素材检索词：床垫按压、纤维、毛发碎屑。"
      },
      {
        time: "06—10s",
        voice: "轻净 Pro 一边拍打一边吸，把深处的脏东西直接带出来。",
        visual: "真人手持产品在床垫上匀速推进，补充机器底部与床面接触的近景，展示真实使用过程。",
        subtitle: "边拍边吸｜深层清洁",
        execution: "真人实拍优先；产品型号必须清晰；禁止使用其他型号或无法确认型号的镜头。"
      },
      {
        time: "10—14s",
        voice: "推过的地方，毛发和细小碎屑都会进到透明尘杯里。",
        visual: "床面推进镜头与尘杯内部变化交叉剪辑，最后停留在吸入后的尘杯结果。",
        subtitle: "脏东西看得见",
        execution: "使用前后结果必须来自同一产品；推进、吸入、尘杯三镜头按因果顺序排列。"
      },
      {
        time: "14—18s",
        voice: "床垫、沙发和布艺座椅，都能顺手清理。",
        visual: "床垫、沙发、布艺椅三个真实家庭场景快切，每个场景展示一次完整接触与推进动作。",
        subtitle: "一机清洁多种布艺场景",
        execution: "3个场景各1.2—1.4秒；场景光线与产品颜色保持一致；避免重复使用同一动作镜头。"
      },
      {
        time: "18—22s",
        voice: "机身握持轻松，日常拿出来用，不需要复杂准备。",
        visual: "单手拿取产品、放到床面、启动使用，连续呈现从拿取到清洁的完整动作。",
        subtitle: "拿起就能用",
        execution: "连续动作优先；不做无法由产品档案证明的重量或省力对比；保留真实环境声作转场。"
      },
      {
        time: "22—26s",
        voice: "清理完拆下尘杯，直接冲洗，下一次用也更省心。",
        visual: "关闭机器、拆下尘杯、倒出脏污、清水冲洗四个动作依次展示。",
        subtitle: "可拆尘杯｜清洗方便",
        execution: "动作顺序不可打乱；涉及水洗的部件必须与产品说明一致；画面增加操作步骤小字。"
      },
      {
        time: "26—30s",
        voice: "别只换床单，床垫也该认真清理一次。点击了解轻净 Pro。",
        visual: "干净床面全景，产品摆放在画面右侧；随后出现产品名、核心卖点和点击引导。",
        subtitle: "轻净 Pro｜给床垫做一次深层清洁",
        execution: "品牌收口4秒；产品不得被字幕遮挡；CTA使用平台允许表达；最后0.5秒保留安全尾帧。"
      }
    ];

    function scriptTableHtml(rows) {
      return `
        <div class="script-table-wrap">
          <table class="compact-script-table">
            <thead><tr><th>时间</th><th>口播</th><th>画面与动作</th><th>字幕/包装</th><th>混剪执行要求</th></tr></thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  <td>${escapeHtml(row.time)}</td>
                  <td>${escapeHtml(row.voice)}</td>
                  <td>${escapeHtml(row.visual)}</td>
                  <td>${escapeHtml(row.subtitle)}</td>
                  <td>${escapeHtml(row.execution)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    function videoScriptDetailHtml(asset) {
      return `
        <strong>本视频使用脚本</strong>
        <p style="margin:4px 0 8px;">${escapeHtml(asset.sourceTitle || "除螨仪30秒结构化脚本")} · 同时保留素材匹配、字幕、配音和包装信息</p>
        ${scriptTableHtml(asset.scriptRows || completeScriptRows)}
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

    function contextualScriptRows() {
      const product = currentProduct();
      return [
        { time:"00—03s", voice:`先看结果，${product.name}把核心效果直接做给你看。`, visual:"产品使用结果特写先出现，再快速切换至使用前场景，形成视觉反差。", subtitle:"结果先看｜3秒抓停留", execution:"优先匹配产品结果实拍；无素材时标记需拍摄或建议视频创作。" },
        { time:"03—06s", voice:"真正影响体验的，往往不是表面参数，而是每天都要处理的麻烦。", visual:"用户真实场景与问题细节近景，镜头从环境推进到具体痛点。", subtitle:"真实场景｜具体问题", execution:"匹配产品目标人群场景；避免空泛氛围镜头。" },
        { time:"06—10s", voice:`${product.name}，${product.core}。`, visual:"真人或手部完成一次完整产品操作，补充关键结构近景。", subtitle:product.core, execution:"产品型号、外观和操作步骤必须一致；优先使用产品绑定实拍。" },
        { time:"10—14s", voice:`使用过程中，${product.difference}。`, visual:"展示产品工作过程及结果变化，按照原因—过程—结果顺序剪辑。", subtitle:product.difference, execution:"结果镜头必须来自当前产品；禁止用其他型号代替。" },
        { time:"14—18s", voice:`日常使用还能做到${product.secondary}。`, visual:"连续展示两个高频使用场景，每个场景保留完整动作。", subtitle:product.secondary, execution:"每个场景1.5—2秒；镜头内容不重复。" },
        { time:"18—22s", voice:"不用额外增加复杂步骤，使用和后续处理都更顺手。", visual:"操作完成后的收纳、清理或切换动作，突出便利性。", subtitle:"少步骤｜更省心", execution:"动作必须连贯；不做无法由产品事实证明的效率对比。" },
        { time:"22—26s", voice:"选这类产品，核心是看它能不能真正解决你的使用问题。", visual:"产品与真实家庭环境同框，补充一组用户使用反馈字幕。", subtitle:"解决问题，比堆参数更重要", execution:"用户反馈使用已授权内容；无授权时仅展示产品场景。" },
        { time:"26—30s", voice:`想进一步了解${product.name}，进入直播间看完整演示。`, visual:"产品定帧、品牌角标和行动引导；背景保持简洁。", subtitle:"进入直播间｜查看完整演示", execution:"套用品牌包装模板；活动与价格仅使用本次已审核营销信息。" }
      ];
    }

    function defaultAgentRequest(type) {
      const product = currentProduct();
      const rewriteMethodLabel = ({ hook:"只换前3秒钩子", shorten:"缩短文案", audience:"更换目标人群", selling:"卖点前置", style:"调整表达风格", rephrase:"保留结构重新表达" })[creationContext.originalFields.rewriteMethod] || "只换前3秒钩子";
      const requests = {
        original: `为“${product.name}”生成${creationContext.originalFields.generationCount || 3}条千川口播文案；营销场景：${creationContext.originalFields.marketingScene || "短视频带货"}；目标人群：${creationContext.originalFields.audiences?.join("、") || "产品默认人群"}；开场钩子：${creationContext.originalFields.hook || "不限"}；脚本类型：${creationContext.originalFields.scriptType || "不限"}；用户心理：${creationContext.originalFields.psychology || "不限"}；每条约${creationContext.originalFields.wordCount || 180}字。仅使用已确认的产品卖点与信任背书。`,
        copy: `参考当前已解析爆款内容的钩子、结构与节奏，为“${product.name}”生成${creationContext.originalFields.generationCount || 3}条原创仿写文案，每条约${creationContext.originalFields.wordCount || 120}字；仅使用当前产品事实，不复制原文，不迁移参考商品的品牌、参数、价格或优惠。`,
        rewrite: `对“${product.name}”现有文案执行“${rewriteMethodLabel}”改写，生成${creationContext.originalFields.generationCount || 3}条，每条约${creationContext.originalFields.wordCount || 120}字；未指定修改的原文结构、产品事实、卖点顺序和CTA保持不变。`,
        "image-main": `为“${product.name}”生成3张商品主图，突出“${product.core}”。`,
        "image-detail": `为“${product.name}”生成一组详情页图片，按卖点顺序组织内容。`,
        script: `把当前文案转为“${product.name}”的30秒结构化脚本，优先使用产品绑定素材。`,
        "script-copy": `参考已拉片视频，为“${product.name}”重构一条30秒原创脚本。`,
        "video-create": `为“${product.name}”生成一条可复用的产品镜头。`,
        mix: `使用当前结构化脚本和“${product.name}”绑定素材生成待终审成片。`
      };
      return requests[type] || agentConfigs[type]?.request || "开始创作";
    }

    function buildCompactResponse(type, isRevision) {
      if (type === "chat") {
        return {
          summary: "我已理解你的需求。你可以继续补充产品、目标人群或希望产出的资产；需要直接执行时，可切换为智能文案、脚本或视频创作等专业能力。",
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
        const sourceItems = type === "copy" ? contextualCopy("original") : contextualCopy(type);
        const items = sourceItems.map(([title, preview]) => ({
          type: "copy",
          title,
          preview,
          structureTags: copyStructureTags(title),
          wordCount: preview.replace(/\s/g, "").length,
          meta: type === "original" ? `${creationContext.originalFields.scriptType || "不限"} · ${creationContext.originalFields.hook || "不限"}` : type === "copy" ? "爆款方法重构" : "定向改写"
        }));
        return {
          summary: isRevision ? "已按本轮要求完成调整，未指定的产品事实和卖点保持不变。" : `已生成${items.length}条可独立使用的口播文案，每条都可以继续转脚本或生成同类内容。`,
          assets: items
        };
      }

      if (type === "video-create") {
        const product = currentProduct();
        return {
          summary: isRevision ? "已根据本轮要求重新生成镜头，产品主体和外观约束保持不变。" : "已生成一条可直接保存到视频库、继续修改或加入智能混剪的产品镜头。",
          assets: [{
            type: "video",
            videoKind: "generated-shot",
            title: `${product.name}产品生成镜头`,
            preview: "5秒 · 9:16 · 1080P · 微距缓慢拉远 · 产品一致性检查通过",
            meta: "AI视频创作 · 图生视频",
            detail: `生成方式：当前选择模式\n主体：${product.name}\n动作：按用户填写的镜头描述执行\n约束：保持产品外观、颜色、按钮及品牌标识一致`
          }]
        };
      }

      if (type === "script" || type === "script-copy") {
        const product = currentProduct();
        const scriptRows = contextualScriptRows();
        return {
          summary: isRevision ? "已完成整条30秒脚本更新，所有分镜均保留完整口播、画面、字幕和混剪执行要求。" : "已生成可直接交给剪辑或驱动智能混剪的完整30秒结构化脚本。",
          assets: [{
            type: "script",
            title: type === "script" ? `${product.name}｜30秒结构化脚本` : `${product.name}｜爆款节奏重构脚本`,
            preview: "30秒完整脚本｜8个连续分镜｜覆盖钩子、痛点、产品演示、多场景、清洗与CTA",
            meta: "8段分镜 · 含完整口播、画面、字幕及混剪执行要求",
            scriptRows
          }]
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
        if (asset.videoKind === "generated-shot") {
          return `
            <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
            <button class="asset-action" data-asset-action="edit-video">继续修改</button>
            <button class="asset-action" data-asset-action="regenerate-video">重新生成</button>
            <button class="asset-action primary" data-asset-action="use-in-mix">加入混剪素材</button>
          `;
        }
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
        <button class="asset-action" data-asset-action="image-to-video">生成视频</button>
      `;
    }

    function generatedAssetHtml(asset) {
      let body = `<div class="generated-asset-body">${escapeHtml(asset.preview)}</div>`;
      if (asset.type === "script") body = scriptTableHtml(asset.scriptRows || completeScriptRows);
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

    function imageAiReviewHtml() {
      if (!isImageCreationFlow()) return "";
      const integratedPrompt = dynamicForm.querySelector("[data-total-prompt]")?.value.trim() || [...dynamicForm.querySelectorAll(".prompt-confirm-item textarea")].map(item => item.value.trim()).filter(Boolean).join("\n");
      return `<section class="image-ai-review" data-chat-generated-review><div class="chat-generated-result"><div class="image-ai-review-head"><strong>本次生成图片</strong><span style="color:#989ba6;font-size:8px">点击图片即可优化</span></div><div class="chat-integrated-prompt"><strong>本图使用的整合提示词</strong><p title="${escapeHtml(integratedPrompt)}">${escapeHtml(integratedPrompt || "已根据当前产品信息与模板生成整合提示词")}</p></div><div class="chat-generated-stage" data-chat-generated-main data-chat-image-index="0"><div class="chat-generated-canvas"><div class="chat-generated-copy"><small>轻净 PRO</small><strong>强劲清洁<br>一遍搞定</strong><small>大吸力深层清洁 · 结果清晰可见</small></div></div><span class="chat-generated-index">当前选择 · 第 1 张</span><div class="chat-generated-stage-actions"><button type="button" data-chat-image-zoom title="放大预览">⌕</button><button type="button" data-chat-image-download title="下载">⇩</button></div></div><div class="chat-generated-thumbs">${[0,1,2,3].map(index => `<button class="chat-generated-thumb${index ? "" : " active"}" type="button" data-chat-image-index="${index}" aria-label="选择第 ${index+1} 张"><span>${index+1}</span></button>`).join("")}</div></div><div class="chat-generated-note">已生成商品图。当前正在调整第 1 张；可切换缩略图后输入修改要求，或直接选择下方推荐策略。</div><div class="chat-quick-adjust"><button type="button" data-ai-audit-optimize="selling">强化卖点</button><button type="button" data-ai-audit-optimize="scene">优化场景氛围</button><button type="button" data-ai-audit-optimize="brand">提升品牌感</button><button type="button" data-ai-audit-optimize="copy">精简文案</button></div><div class="image-ai-review-head"><strong>AI 审查结果</strong><span class="image-ai-review-score">综合得分 82 · 建议优化</span></div><div class="image-ai-review-list"><article class="image-ai-review-item"><div><b>主图产品占比规则</b><em>需优化</em></div><p>产品主体约占画面 56%，略高于当前平台推荐区间，右侧安全留白不足。</p><button type="button" data-ai-audit-optimize="product-ratio">按红线规则优化</button></article><article class="image-ai-review-item"><div><b>页面占比与信息层级</b><em>可提升</em></div><p>核心卖点清晰，但底部权益信息与主体距离偏近，建议增加 8% 留白。</p><button type="button" data-ai-audit-optimize="layout">优化页面占比</button></article><article class="image-ai-review-item"><div><b>品牌与合规检查</b><em style="color:#3b986b;">通过</em></div><p>品牌名称、产品外观与已确认权益一致，未发现敏感词和竞品标识。</p></article></div><div class="image-ai-review-recommend"><b>自动推荐优化策略</b><div class="image-ai-review-actions"><button type="button" data-ai-audit-optimize="focus">强化主体聚焦</button><button type="button" data-ai-audit-optimize="selling">突出核心卖点</button><button class="primary" type="button" data-ai-audit-optimize="all">优化当前图片全部问题</button></div></div></section>`;
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
      closeModal(true);
      const requestText = typedRequest || defaultAgentRequest(activeType);
      const isRevision = (agentTurnCounts[activeType] || 0) > 0 && Boolean(typedRequest);
      const response = buildCompactResponse(activeType, isRevision);
      const turnNumber = conversationTurnCount + 1;
      const messageId = `assistant-turn-${turnNumber}`;
      const sourceAssetId = pendingSourceAssetId;
      const sourceAsset = sessionAssets.find(asset => asset.id === sourceAssetId);
      const generatedAssets = response.assets.map(asset => ({
        ...asset,
        id: `session-asset-${++assetSequence}`,
        messageId,
        turnNumber,
        sourceType: activeType,
        sourceAssetId,
        sourceTitle: sourceAsset?.title || asset.sourceTitle,
        scriptRows: asset.type === "video" && activeType === "mix" ? (sourceAsset?.scriptRows || asset.scriptRows || completeScriptRows) : asset.scriptRows,
        model: selectedModelLabel(),
        saved: false
      }));
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = requestText;

      const assistantTurn = document.createElement("div");
      assistantTurn.className = `message assistant${isImageCreationFlow() ? " image-result-message" : ""}`;
      assistantTurn.id = messageId;
      assistantTurn.dataset.agentType = activeType;
      assistantTurn.dataset.modelLabel = selectedModelLabel();
      assistantTurn.dataset.assetIds = generatedAssets.map(asset => asset.id).join(",");
      assistantTurn.innerHTML = `
        <div class="message-head">
          <strong title="${escapeHtml(selectedModelLabel())}">✦ ${activeAgent}</strong>
        </div>
        <p class="assistant-summary">${response.summary}</p>
        ${inAgentTask ? imageAiReviewHtml() : ""}
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

    dynamicForm.addEventListener("click", event => {
      const generationThumb = event.target.closest(".generation-thumbs button");
      if (generationThumb) {
        const buttons = [...generationThumb.parentElement.querySelectorAll("button")];
        buttons.forEach(button => button.classList.toggle("active", button === generationThumb));
        selectChatGeneratedImage(buttons.indexOf(generationThumb), "中间生成结果");
        setFormFeedback(`已选中第 ${buttons.indexOf(generationThumb) + 1} 张图片，可在右侧继续优化。`);
        return;
      }
      const generationCanvas = event.target.closest(".generation-canvas");
      if (generationCanvas) {
        const buttons = [...generationCanvas.closest(".generation-result-card")?.querySelectorAll(".generation-thumbs button") || []];
        const activeIndex = Math.max(0, buttons.findIndex(button => button.classList.contains("active")));
        selectChatGeneratedImage(activeIndex, "中间生成结果");
        promptInput.focus();
        setFormFeedback(`已选中第 ${activeIndex + 1} 张图片，请在右侧输入优化要求。`);
        return;
      }
      const referenceVideo = event.target.closest("[data-reference-video]");
      if (referenceVideo) {
        selectReferenceVideo(referenceVideo);
        return;
      }
      const originalModelTrigger = event.target.closest("[data-original-model-trigger]");
      if (originalModelTrigger) {
        const picker = originalModelTrigger.closest(".original-model-picker");
        const open = !picker.classList.contains("open");
        picker.classList.toggle("open", open);
        originalModelTrigger.setAttribute("aria-expanded", String(open));
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
        regenerateOriginalSuggestion(aiSuggestion.dataset.aiSuggest);
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
          const picker = dynamicForm.querySelector("[data-reference-library]");
          if (picker) {
            picker.hidden = !picker.hidden;
            if (!picker.hidden) {
              filterReferenceVideos();
              picker.querySelector("[data-reference-search]")?.focus();
            }
          }
        }
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
        syncRewriteAudienceTarget();
        setFormFeedback(`改写后目标人群已切换为“${rewriteAudienceChip.textContent.trim()}”。`);
        return;
      }
      const audienceChip = event.target.closest(".audience-chip");
      if (audienceChip) {
        audienceChip.classList.toggle("active");
        const selected = [...dynamicForm.querySelectorAll(".audience-chip.active")].map(item => item.textContent.trim());
        setFormFeedback(selected.length ? `目标人群已更新：${selected.join("、")}。` : "当前未选择目标人群，AI将按产品默认人群生成。");
        return;
      }
      const uploadBox = event.target.closest(".upload-box");
      if (uploadBox) {
        if (uploadBox.hasAttribute("data-image-upload-trigger")) {
          const removePreview = event.target.closest("[data-remove-image-upload]");
          if (removePreview) {
            const index = Number(removePreview.dataset.removeImageUpload);
            const records = window.imageUploadPreviewRecords || [];
            const removed = records.splice(index, 1)[0];
            if (removed?.url) URL.revokeObjectURL(removed.url);
            const list = uploadBox.querySelector("[data-image-upload-preview-list]");
            const empty = uploadBox.querySelector(".image-upload-empty");
            if (list) {
              list.innerHTML = records.map((item,itemIndex) => `<div class="image-upload-preview"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}"><button type="button" data-remove-image-upload="${itemIndex}" aria-label="删除${escapeHtml(item.name)}">×</button></div>`).join("") + (records.length ? '<button class="image-upload-add" type="button" data-add-image-upload aria-label="继续添加图片">＋</button>' : "");
              list.hidden = !records.length;
            }
            if (empty) empty.hidden = records.length > 0;
            if (!records.length) {
              const input = dynamicForm.querySelector("[data-image-upload-input]");
              if (input) input.value = "";
              uploadBox.classList.remove("selected", "has-files");
            }
            setFormFeedback(records.length ? `已保留 ${records.length} 张参考图。` : "参考图已全部删除，请重新上传。");
            return;
          }
          dynamicForm.querySelector("[data-image-upload-input]")?.click();
          return;
        }
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
        row.querySelectorAll(".choice-chip").forEach(item => item.classList.remove("active"));
        chip.classList.add("active");
        if (row.dataset.single === "reference-filter") filterReferenceVideos();
        if (row.dataset.single === "rewrite-method") refreshRewriteSetting();
        if (row.dataset.single === "rewrite-gender" || row.dataset.single === "rewrite-age") syncRewriteAudienceTarget();
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
      if (event.target.closest("[data-prompt-step-module]")) syncMainTotalPrompt();
    });
    dynamicForm.addEventListener("change", event => {
      if (event.target.matches("[data-mode-control]")) refreshConditionalSlots();
      if (event.target.matches("[data-mode-control]")) setFormFeedback(`已切换为“${event.target.options[event.target.selectedIndex].text}”，输入槽位已更新。`);
      if (event.target.matches("[data-reference-source]")) refreshReferenceSource();
      if (event.target.matches("[data-rewrite-source]")) refreshRewriteSource();
      if (event.target.matches("[data-rewrite-library]")) refreshRewriteLibraryCopy();
      if (event.target.matches("[data-product-select]")) applyProductToForm(event.target.value, true);
      if (event.target.matches("[data-creation-preset]")) applyCreationPreset(event.target.value);
    });

    dynamicForm.addEventListener("input", event => {
      if (event.target.matches("[data-reference-search]")) filterReferenceVideos();
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
      event.target.closest(".field")?.classList.remove("invalid");
      event.target.closest(".original-field")?.classList.remove("invalid");
      if (usesProductInformationFlow() && event.target.matches('[data-field="core"], [data-field="secondary"], [data-field="difference"], [data-field="marketing"], [data-field="trust"], [data-field="pain"], [data-field="scenes"], [data-manual-product-name], [data-original-product-name], [data-point-value], [data-original-brand], [data-original-category]')) {
        creationContext.productSaved = false;
        creationContext.productConfirmed = false;
        updateModalContext();
        if (isImageCreationFlow() && taskStep === 1) renderTaskActions();
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

    document.querySelector(".new-chat").addEventListener("click", () => {
      createSessionSummaryRow("未命名创作");
      exitAgentTask();
      chatOutput.classList.remove("show");
      chatOutput.innerHTML = "";
      renderConversationLocator();
      conversationTurnCount = 0;
      agentTurnCounts = {};
      document.getElementById("followupHint").classList.remove("show");
      agentBrowser.style.display = "block";
      emptyHero.style.display = "block";
      agentCards.forEach(item => item.classList.remove("selected"));
      promptInput.value = "";
      selectChat();
      sessionAssets = [];
      pendingSourceAssetId = "";
      Object.assign(creationContext, {
        productId: "mite-pro",
        productName: productCatalog["mite-pro"].name,
        productSource: "library",
        productConfirmed: true,
        productSaved: true,
        originalFields: {},
        customPresets: []
      });
      renderSessionAssets();
      activateAssetType("copy");
      setAssetPanel(false);
      showToast("已新建创作会话");
    });

    const toast = document.getElementById("toast");
    let toastTimer;
    function showToast(text) {
      toast.textContent = text;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2100);
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
      if (action === "edit-video") {
        const card = agentCards.find(item => item.dataset.type === "video-create");
        selectAgent(card, false);
        pendingSourceAssetId = asset.id;
        promptInput.value = "保持产品主体和场景不变，请这样修改镜头：";
        promptInput.focus();
        showToast("已带入当前镜头，可继续描述动作、运镜或画面变化");
        return;
      }
      if (action === "regenerate-video") {
        runAgentWithAsset("video-create", `保持“${asset.title}”的产品主体与场景，再生成一个不同运镜版本。`, asset);
        return;
      }
      if (action === "use-in-mix") {
        asset.saved = true;
        syncSavedState(asset);
        renderSessionAssets();
        showToast("已保存到视频库，并加入智能混剪素材候选");
        return;
      }
      if (action === "image-to-video") {
        runAgentWithAsset("video-create", `使用“${asset.title}”作为首帧图生成5秒产品镜头。`, asset);
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

    let composerImageRecords = [];
    function renderComposerImagePreviews() {
      const host = document.getElementById("composerImagePreviewList");
      if (!host) return;
      host.innerHTML = composerImageRecords.map((item,index) => `<div class="composer-image-preview"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}"><button type="button" data-remove-composer-image="${index}" aria-label="删除${escapeHtml(item.name)}">×</button></div>`).join("");
    }
    document.getElementById("composerImageButton")?.addEventListener("click", () => document.getElementById("composerImageInput")?.click());
    document.getElementById("composerImageInput")?.addEventListener("change", event => {
      const additions = [...event.target.files].map(file => ({name:file.name,url:URL.createObjectURL(file)}));
      composerImageRecords.push(...additions);
      renderComposerImagePreviews();
      showToast(`已添加 ${additions.length} 张图片，可结合文字要求继续优化`);
      event.target.value = "";
    });
    document.getElementById("composerImagePreviewList")?.addEventListener("click", event => {
      const remove = event.target.closest("[data-remove-composer-image]");
      if (!remove) return;
      const item = composerImageRecords.splice(Number(remove.dataset.removeComposerImage),1)[0];
      if (item?.url) URL.revokeObjectURL(item.url);
      renderComposerImagePreviews();
    });

    function selectChatGeneratedImage(index, sourceLabel = "右侧结果") {
      const review = [...chatOutput.querySelectorAll("[data-chat-generated-review]")].pop();
      if (!review) return;
      const selectedIndex = Math.max(0, Math.min(Number(index) || 0, 3));
      review.querySelectorAll("[data-chat-image-index]").forEach(item => item.classList.toggle("active", Number(item.dataset.chatImageIndex) === selectedIndex));
      const stage = review.querySelector("[data-chat-generated-main]");
      if (stage) {
        stage.dataset.chatImageIndex = String(selectedIndex);
        stage.dataset.activeIndex = String(selectedIndex);
        stage.querySelector(".chat-generated-index").textContent = `当前选择 · 第 ${selectedIndex + 1} 张`;
      }
      const note = review.querySelector(".chat-generated-note");
      if (note) note.textContent = `已选择第 ${selectedIndex + 1} 张图片（来自${sourceLabel}）。后续对话和快捷策略将仅优化这张图片，不影响其他生成结果。`;
      promptInput.placeholder = `描述第 ${selectedIndex + 1} 张图片的调整要求，例如：放大商品主体并减少背景元素`;
    }

    chatOutput.addEventListener("click", event => {
      if (event.target.closest("[data-chat-image-download]")) return showToast("当前图片已开始下载");
      if (event.target.closest("[data-chat-image-zoom]")) return showToast("已打开当前图片大图预览");
      const generatedImage = event.target.closest("[data-chat-image-index]");
      if (generatedImage) {
        selectChatGeneratedImage(generatedImage.dataset.chatImageIndex, "右侧结果栏");
        if (!event.target.closest("[data-chat-image-download],[data-chat-image-zoom]")) promptInput.focus();
        return;
      }
      const auditButton = event.target.closest("[data-ai-audit-optimize]");
      if (auditButton) {
        const labels = {"product-ratio":"已按平台红线规则调整产品占比与安全留白","layout":"已重新平衡主体、卖点与权益区域占比","focus":"已强化主体聚焦并降低背景干扰","selling":"已突出核心卖点并压缩次要信息","scene":"已优化场景光线、空间层次与使用氛围","brand":"已强化品牌色、标识和视觉一致性","copy":"已精简画面文案并重新梳理信息层级","all":"已应用全部推荐策略，正在生成优化版本"};
        if (auditButton.dataset.aiAuditOptimize === "all") auditButton.closest(".image-ai-review")?.querySelectorAll("[data-ai-audit-optimize]").forEach(button => { button.disabled = true; });
        else auditButton.disabled = true;
        showToast(labels[auditButton.dataset.aiAuditOptimize] || "已应用优化策略");
        auditButton.textContent = auditButton.dataset.aiAuditOptimize === "all" ? "优化版本生成中…" : "已应用";
        promptInput.value = labels[auditButton.dataset.aiAuditOptimize] || "优化当前选中图片";
        return;
      }
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
        element?.remove();
        delete brandCatalog[id];
        if (document.getElementById("page-brand-detail")?.classList.contains("active")) switchPage("brands");
        showToast("品牌已删除，关联产品和内容资产已保留");
      } else {
        element?.remove();
        delete productDetailData[id];
        if (typeof productCatalog !== "undefined") delete productCatalog[id];
        if (document.getElementById("page-product-detail")?.classList.contains("active")) switchPage("products");
        showToast("产品已删除，关联内容资产已保留");
      }
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
    document.querySelectorAll("[data-close-brand-create]").forEach(button => button.addEventListener("click", () => brandCreateModal?.classList.remove("show")));
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
      card.innerHTML = `<span class="card-menu-wrap"><button class="card-menu-trigger" type="button" data-toggle-card-menu aria-label="品牌操作">···</button><span class="card-action-menu" role="menu"><button type="button" data-delete-brand>删除</button></span></span><div class="brand-card-top"><div class="brand-card-logo">${brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo)}</div><div><h3>${escapeHtml(brand.name)}</h3><small>新建品牌</small></div></div><p class="brand-card-desc">${escapeHtml(brand.intro)}</p><div class="brand-card-tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div><div class="brand-card-foot"><span>关联产品 0</span><span>刚刚创建</span></div>`;
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
      const id = `brand-${Date.now()}`;
      const brand = { name, foundedYear, intro, position, tone, forbidden, logo:name.slice(0,1), logoData:newBrandLogoData, logoClass:"", products:0 };
      brandCatalog[id] = brand;
      brandGrid?.append(createBrandCard(id, brand));
      brandCreateModal?.classList.remove("show");
      showToast("品牌已新增，可进入详情继续维护品牌策略");
    });
    document.getElementById("brandSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => card.hidden = !card.textContent.toLowerCase().includes(keyword));
    });

    const productCreateModal = document.getElementById("productCreateModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const productDetailData = {
      "mite-pro": { name: "轻净 Pro 除螨仪", brand: "轻净", category: "清洁电器", price: "¥399" },
      "air-a8": { name: "轻享空气炸锅 A8", brand: "轻享", category: "厨房电器", price: "¥299" },
      "washer-s5": { name: "净界洗地机 S5", brand: "净界", category: "清洁电器", price: "¥1,599" },
      "blend-mini": { name: "随行榨汁杯 Mini", brand: "轻享", category: "厨房电器", price: "¥169" }
    };
    let currentProductDetailId = "mite-pro";
    function toggleProductModal(modal, show) { modal?.classList.toggle("show", show); }
    document.querySelectorAll("[data-open-product-create]").forEach(button => button.addEventListener("click", () => toggleProductModal(productCreateModal, true)));
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
    document.querySelector("[data-product-upload]")?.addEventListener("click", event => { event.currentTarget.textContent = "已选择：产品主图_01.png · 点击可重新选择"; showToast("产品图片已添加"); });
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
    function makeParsingProductCard(name, productId, category = "商品解析中") {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "product-market-card is-parsing";
      card.dataset.productId = productId;
      card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${name}</strong></div><div class="product-parsing">正在解析产品信息</div><div class="product-market-assets"><span>品牌 · 价格 · 卖点</span><span>请稍候</span></div></div>`;
      card.addEventListener("click", () => showToast("产品信息正在解析中，完成后可查看详情"));
      setTimeout(() => {
        card.classList.remove("is-parsing");
        card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">厨房电器</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${name}</strong></div><div class="product-market-price"><small>¥</small>199</div><div class="product-market-assets"><span>文案 0 · 脚本 0</span><span>视频 0</span></div></div>`;
        productDetailData[productId] = { name, brand: "已识别品牌", category: "厨房电器", price: "¥199" };
        card.replaceWith(card.cloneNode(true));
        const readyCard = document.querySelector(`[data-product-id="${productId}"]`);
        readyCard?.addEventListener("click", () => openProductDetail(productId));
        showToast(`“${name}”解析完成，可进入详情补充信息`);
      }, 3600);
      return card;
    }
    document.getElementById("saveProductEntry")?.addEventListener("click", () => {
      const mode = document.querySelector("[data-product-create-mode].active")?.dataset.productCreateMode;
      const productGrid = document.getElementById("productMarketGrid");
      if (mode === "batch") {
        const links = document.querySelector("[data-product-create-panel='batch'] textarea")?.value.trim().split(/\n+/).filter(Boolean) || [];
        if (!links.length) return showToast("请至少输入一条商品链接");
        const count = Math.max(1, links.length);
        for (let index = 0; index < count; index += 1) productGrid.append(makeParsingProductCard(`新链接产品 ${index + 1}`, `parsing-product-${Date.now()}-${index}`));
        toggleProductModal(productCreateModal, false);
        showToast(`已新增 ${count} 个产品，正在解析产品信息`);
        return;
      }
      const manualPanel = document.querySelector("[data-product-create-panel='manual']");
      const manualInputs = [...manualPanel.querySelectorAll("input")];
      const name = manualInputs[0]?.value.trim();
      const brand = manualInputs[1]?.value.trim();
      const priceValue = manualPanel.querySelector(".price-field input")?.value.trim();
      const core = manualPanel.querySelector("textarea")?.value.trim();
      const hasImage = !manualPanel.querySelector("[data-product-upload]")?.textContent.includes("点击上传");
      if (!name || !brand || !priceValue || !core || !hasImage || !document.getElementById("productCategorySelect")?.value || document.getElementById("productCategorySelect")?.value === "请选择类目") return showToast("请补全标记 * 的产品信息");
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
      manualCard.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${name}</strong></div><div class="product-market-price"><small>${currencySymbol}</small>${price}</div><div class="product-market-assets"><span>文案 0 · 脚本 0</span><span>视频 0</span></div></div>`;
      productDetailData[id] = { name, brand, category, price: `${currencySymbol}${price}`, currencyCode };
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

    const productCompetitorSamples = {
      "mite-pro": [
        { name:"追觅除螨仪 S20", source:"竞品库 · 自动同步", url:"https://www.douyin.com/", platform:"抖音", sales:"3.6万+", audience:"精致妈妈、养宠家庭", selling:"高频拍打；紫外线辅助；尘杯可视", scene:"床褥、沙发、宠物区", category:"清洁电器", updater:"自动获取", updatedAt:"10分钟前" },
        { name:"莱克吉米除螨仪 B703", source:"竞品库 · 链接解析", url:"https://www.jd.com/", platform:"京东", sales:"2.1万+", audience:"都市中产、精致妈妈", selling:"强拍打；热风除湿；低噪设计", scene:"卧室、儿童房、沙发", category:"清洁电器", updater:"嗡大发", updatedAt:"昨天 18:20" },
        { name:"苏泊尔除螨仪 VC6", source:"竞品库 · 自动同步", url:"https://www.tmall.com/", platform:"淘宝 / 天猫", sales:"1.8万+", audience:"新婚家庭、租房青年", selling:"轻量机身；双杯过滤；便捷拆洗", scene:"床垫、布艺沙发、毛绒玩具", category:"清洁电器", updater:"自动获取", updatedAt:"今天 09:12" }
      ],
      "air-a8": [
        { name:"美的空气炸锅 KZ45", source:"竞品库 · 自动同步", url:"https://www.jd.com/", platform:"京东", sales:"5.2万+", audience:"年轻家庭、精致妈妈", selling:"可视窗口；免翻面；低脂烹饪", scene:"家庭正餐、夜宵", category:"厨房电器", updater:"自动获取", updatedAt:"20分钟前" },
        { name:"九阳空气炸锅 KL55", source:"竞品库 · 链接解析", url:"https://www.douyin.com/", platform:"抖音", sales:"4.7万+", audience:"都市 GenZ、租房青年", selling:"大容量；智能菜单；易清洗", scene:"一人食、朋友聚会", category:"厨房电器", updater:"嗡大发", updatedAt:"昨天 16:40" }
      ],
      "washer-s5": [
        { name:"添可芙万 Stretch S", source:"竞品库 · 自动同步", url:"https://www.tmall.com/", platform:"淘宝 / 天猫", sales:"3.9万+", audience:"品质家庭、养宠家庭", selling:"躺平清洁；双向助力；热水洗", scene:"全屋硬地面、床底", category:"清洁电器", updater:"自动获取", updatedAt:"8分钟前" },
        { name:"追觅洗地机 H30", source:"竞品库 · 链接解析", url:"https://www.jd.com/", platform:"京东", sales:"2.8万+", audience:"都市中产、新婚家庭", selling:"高温洗烘；贴边清洁；大吸力", scene:"客厅、厨房、餐厅", category:"清洁电器", updater:"嗡大发", updatedAt:"今天 08:35" }
      ],
      "blend-mini": [
        { name:"摩飞便携榨汁杯 MR9800", source:"竞品库 · 自动同步", url:"https://www.douyin.com/", platform:"抖音", sales:"6.3万+", audience:"都市 GenZ、健身人群", selling:"无线便携；快速榨汁；杯盖直饮", scene:"通勤、健身、旅行", category:"个护小家电", updater:"自动获取", updatedAt:"15分钟前" },
        { name:"九阳随行榨汁杯 L3", source:"竞品库 · 链接解析", url:"https://www.tmall.com/", platform:"淘宝 / 天猫", sales:"3.1万+", audience:"学生、白领", selling:"轻量杯身；长续航；易拆洗", scene:"宿舍、办公室、户外", category:"个护小家电", updater:"嗡大发", updatedAt:"昨天 21:10" }
      ]
    };
    const productAssetTabs = document.querySelector("#page-product-detail .product-asset-tabs");
    if (productAssetTabs && !productAssetTabs.querySelector('[data-product-asset-tab="competitor"]')) {
      const competitorTab = document.createElement("button");
      competitorTab.type = "button";
      competitorTab.dataset.productAssetTab = "competitor";
      competitorTab.textContent = "竞品库";
      productAssetTabs.querySelector('[data-product-asset-tab="template"]')?.before(competitorTab);
      const competitorPanel = document.createElement("div");
      competitorPanel.className = "product-asset-panel";
      competitorPanel.dataset.productAssetPanel = "competitor";
      competitorPanel.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><div><strong style="font-size:15px">当前产品跨平台竞品</strong><div class="sync-hint" style="margin-top:4px">数据与资产库 · 竞品库同步，报告结构和操作保持一致</div></div><span class="badge" id="productRelatedCompetitorCount">0 个竞品</span></div><div class="competitor-table-shell" style="max-height:none;overflow:auto"><table class="competitor-library-table" style="min-width:1420px"><thead><tr><th>产品名称</th><th>产品素材</th><th>商品链接</th><th>平台</th><th>销量</th><th>人群</th><th>核心卖点</th><th>场景</th><th>一级类目</th><th>更新人</th><th>更新时间</th><th>操作</th></tr></thead><tbody id="productRelatedCompetitorBody"></tbody></table></div>';
      productAssetTabs.parentElement.append(competitorPanel);
    }
    function renderProductRelatedCompetitors(productId) {
      const body = document.getElementById("productRelatedCompetitorBody");
      if (!body) return;
      const product = productDetailData[productId] || productDetailData["mite-pro"];
      const rows = productCompetitorSamples[productId] || productCompetitorSamples["mite-pro"];
      body.innerHTML = rows.map(item => `<tr data-product-related-competitor data-name="${escapeHtml(item.name)}"><td class="competitor-product-cell"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.source)}</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-related-competitor-image>主图</button><button class="competitor-thumb detail" type="button" data-preview-related-competitor-image>详情</button></div></td><td><a class="competitor-source-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">查看原平台</a></td><td><span class="competitor-platform${competitorPlatformClass(item.platform)}">${escapeHtml(item.platform)}</span></td><td><strong>${escapeHtml(item.sales)}</strong></td><td class="competitor-cell-copy">${escapeHtml(item.audience)}</td><td class="competitor-cell-copy">${escapeHtml(item.selling)}</td><td class="competitor-cell-copy">${escapeHtml(item.scene)}</td><td class="competitor-category-path">${escapeHtml(item.category)}</td><td class="competitor-updater">${escapeHtml(item.updater)}</td><td class="competitor-updated-at">${escapeHtml(item.updatedAt)}</td><td><div class="competitor-actions"><button type="button" data-view-related-competitor-report>查看报告</button><button type="button" data-download-related-competitor-report>下载报告</button></div></td></tr>`).join("");
      document.getElementById("productRelatedCompetitorCount").textContent = `${rows.length} 个竞品 · ${product.category}`;
    }

    document.querySelectorAll("[data-product-asset-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-asset-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-asset-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productAssetPanel === button.dataset.productAssetTab));
      if (button.dataset.productAssetTab === "competitor") renderProductRelatedCompetitors(currentProductDetailId);
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
    document.querySelectorAll("#page-product-detail [data-inline-edit]").forEach(button => button.addEventListener("click", () => {
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
        syncEditableSurface(surface);
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

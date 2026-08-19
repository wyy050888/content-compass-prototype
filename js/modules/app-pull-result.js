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
      a.href = url; a.download = "拆解结果.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("已下载 拆解结果.json");
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

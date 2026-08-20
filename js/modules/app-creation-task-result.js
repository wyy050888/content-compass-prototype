
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
      if (taskShell) taskShell.dataset.step = String(taskStep);
      taskFormScroll.hidden = true;
      taskFormActions.hidden = true;
      taskResultHost.hidden = false;
      const actualDuration = mixActualDuration();
      const duration = `${actualDuration.toFixed(1)} 秒`;
      const voice = dynamicForm.querySelector("[data-mix-final-voice]")?.textContent || "许念 · 1.00×";
      const materialCount = mixSelectedMaterialIds().length || 6;
      const productName = mixProductNames[dynamicForm.querySelector("[data-mix-product]")?.value] || "当前产品";
      const ratio = dynamicForm.querySelector("[data-mix-ratio]")?.value || "9:16";
      const playerStageClass = ratio === "16:9" ? "mix-video-stage is-horizontal" : "mix-video-stage";
      const segments = mixScriptSegments();
      const timelineHtml = segments.map(item => {
        const weight = Math.max(1, Math.round(item.duration * 10));
        return `<button style="flex:${weight}" data-mix-seek="${mixTimeLabel(item.start)}">${escapeHtml(item.stage)}<small>${item.duration.toFixed(1)}s</small></button>`;
      }).join("");
      const spec = ratio === "16:9" ? "16:9 · 1920×1080 · 30fps" : "9:16 · 1080×1920 · 30fps";
      taskResultHost.innerHTML = `
        <div class="mix-result-page">
          <div class="task-result-top">
            <div><strong>混剪视频已生成</strong></div>
            <div class="mix-result-top-right">
              <div class="mix-result-actions"><button class="ghost-btn" type="button" data-mix-result-action="back-script">返回修改脚本</button><button class="soft-btn" type="button" data-mix-result-action="save">保存到成片视频库</button><button class="primary-btn" type="button" data-mix-result-action="download">下载视频</button><button class="ghost-btn" type="button" data-mix-result-action="download-jianying">下载剪映工程文件</button></div>
              <div class="mix-result-quality-wrap">
              <button class="mix-result-quality-chip" type="button" data-mix-quality-toggle aria-expanded="false" aria-controls="mixQualityPanel">
                <span class="mix-result-status">✓ 自动质检通过</span>
                <i class="mix-result-quality-caret" aria-hidden="true">›</i>
              </button>
              <div class="mix-result-quality-panel" id="mixQualityPanel" data-mix-quality-panel hidden>
                <strong>自动质检通过</strong>
                <p class="mix-result-quality-intro">成片已完成以下检查,未发现异常。</p>
                <ul class="mix-result-quality-list">
                  <li><span>✓</span> 画面完整,无黑帧或空白片段</li>
                  <li><span>✓</span> 所有确认分镜均已进入成片</li>
                  <li><span>✓</span> 配音完整,无缺失或异常静音</li>
                  <li><span>✓</span> 字幕完整,无越界或截断</li>
                  <li><span>✓</span> 音画时长一致</li>
                  <li><span>✓</span> 无异常短镜头或长时间定帧</li>
                  <li><span>✓</span> 素材读取正常,无丢失片段</li>
                </ul>
              </div>
            </div>
            </div>
          </div>
          <div class="mix-result-hero">
            <div class="mix-video-player" data-mix-video-player><div class="${playerStageClass}"><span class="mix-video-product">${escapeHtml(productName)}</span><button type="button" data-mix-result-play>▶</button><div><strong>已有素材混剪成片</strong><small>${escapeHtml(ratio)} · ${escapeHtml(duration)}</small></div></div><div class="mix-player-bar"><span data-mix-player-time>00:00</span><div><i></i></div><span>${escapeHtml(duration.replace(" 秒", ""))}</span></div></div>
          </div>
          <article class="mix-result-timeline"><header><strong>成片时间轴</strong><small>点击任一段定位预览</small></header><div class="mix-timeline-track">${timelineHtml}</div></article>
        </div>`;
      taskShell.classList.add("is-complete");
      syncMixStepChat();
      agentPillButton.disabled = false;
      renderTaskStepper();
      showToast("智能混剪已完成，可播放预览或局部调整");
    }

    function submitMixGeneration() {
      // 像第 2 步 → 第 3 步的 renderMixScriptLoading 一样,展示"生成视频"多步骤 loading
      // 4 步:裁切素材 → 对齐配音时间轴 → 质量检查 → 生成完成
      // 之后调用 showMixTaskResult 跳到结果页
      const list = dynamicForm.querySelector("[data-mix-script-list]");
      const alert = dynamicForm.querySelector("[data-mix-script-alert]");
      if (alert) { alert.hidden = true; alert.innerHTML = ""; }
      taskActionButtons.querySelector(".primary-btn")?.setAttribute("disabled", "disabled");
      setMixLoadingActions(true);
      if (taskActionNote) taskActionNote.textContent = "正在生成视频,稍候…";
      const steps = [
        { title: "正在裁切素材", sub: "按每段时长精确截取镜头…" },
        { title: "正在对齐配音时间轴", sub: "把分镜时长与口播节奏对齐…" },
        { title: "正在完成质量检查", sub: "校验画面完整性、产品事实与禁用话术…" },
        { title: "生成完成", sub: "即将展示成片,可播放或局部调整" }
      ];
      // 把多步骤 loading 渲染到分镜列表位置(保留 Step 3 的步骤标题,只替换列表区)
      if (list) {
        list.innerHTML = `<div class="mix-script-loading">
          <div class="mix-spinner"></div>
          <ol class="mix-loading-steps" data-mix-loading-steps>${steps.map((s, i) => `<li data-mix-step="${i}"><span class="mix-loading-step-dot"></span><div class="mix-loading-step-text"><b>${s.title}</b><small>${s.sub}</small></div></li>`).join("")}</ol>
        </div>`;
        const stepNodes = list.querySelectorAll("[data-mix-step]");
        if (stepNodes[0]) stepNodes[0].classList.add("is-active");
        steps.forEach((_, i) => {
          setTimeout(() => {
            if (i > 0) stepNodes[i - 1]?.classList.replace("is-active", "is-done");
            if (i < steps.length - 1) stepNodes[i]?.classList.add("is-active");
          }, i * 380);
        });
      }
      // 总动画 ~1.9s 后跳到结果页
      setTimeout(showMixTaskResult, steps.length * 380 + 300);
    }


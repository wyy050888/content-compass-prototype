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
      // 智能混剪结果页 · 顶部"自动质检通过"chip 展开/收起面板
      const qualityToggle = event.target.closest("[data-mix-quality-toggle]");
      if (qualityToggle) {
        const panel = taskResultHost.querySelector("[data-mix-quality-panel]");
        if (!panel) return;
        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        qualityToggle.setAttribute("aria-expanded", String(willOpen));
        qualityToggle.classList.toggle("is-open", willOpen);
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
        if (action === "download-jianying") {
          mixAction.textContent = "正在打包…";
          mixAction.disabled = true;
          setTimeout(() => {
            mixAction.textContent = "下载剪映工程文件";
            mixAction.disabled = false;
            showToast("剪映工程文件已开始打包，可在下载中心查看 .jianying 工程");
          }, 800);
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
        promptInput.value = "参考刚才的拆解结果，为轻净 Pro 除螨仪生成三条原创仿写文案。";
        showToast("已带入拆解结果和参考视频");
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

    document.getElementById("assetSearch")?.addEventListener("input", event => {
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


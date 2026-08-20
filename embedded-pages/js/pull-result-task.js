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
        "script-copy": `参考已拆解视频，为“${product.name}”重构一条30秒原创脚本。`,
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

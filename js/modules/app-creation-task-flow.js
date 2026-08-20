
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
        if (activeType === "mix" && taskStep === 3) {
          back.addEventListener("click", () => openMixBackToStep2Confirm(() => setTaskStep(taskStep - 1)));
        } else {
          back.addEventListener("click", () => setTaskStep(taskStep - 1));
        }
        taskActionButtons.append(back);
      }
      // Phase 3.5: 智能混剪 Step 3 在底部放"重新匹配全部"按钮
      if (activeType === "mix" && taskStep === 3) {
        const rematchAll = document.createElement("button");
        rematchAll.className = "ghost-btn task-rematch-all-button";
        rematchAll.type = "button";
        rematchAll.textContent = "重新匹配全部";
        rematchAll.addEventListener("click", () => openMixRematchAllDialog());
        taskActionButtons.append(rematchAll);
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
      if (activeType !== "mix" && !isStructuredCopyFlow() && !contextStatus.hidden) taskActionButtons.append(contextStatus);
      const next = document.createElement("button");
      next.className = "primary-btn";
      next.type = "button";
      // 智能脚本与智能混剪使用定制按钮文案和校验。
      if (activeType === "script") {
        next.textContent = taskStep === 2 ? "生成脚本" : "下一步";
      } else if (activeType === "mix") {
        next.textContent = ["确认方案", "确认文案与配音", "生成视频", taskCompleted ? "重新生成视频" : "生成视频"][taskStep - 1];
      } else if (isStructuredCopyFlow()) {
        next.textContent = taskStep === 1 ? "下一步" : "生成文案";
      } else {
        next.textContent = taskStep === steps.length
          ? (taskEditing ? "以新任务继续创作" : "生成结果")
          : "下一步";
      }
      next.addEventListener("click", () => {
        if (activeType === "mix") {
          if (taskStep < 3) {
            if (!validateMixStep(taskStep)) return;
            return setTaskStep(taskStep + 1);
          }
          if (taskStep === 3) {
            if (!validateMixStep(3)) return;
            return submitMixGeneration();
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
      const previousStep = taskStep;
      taskStep = Math.max(1, Math.min(nextStep, steps.length));
      if (taskShell) taskShell.dataset.step = String(taskStep);
      if (taskCompleted && taskStep < steps.length) taskEditing = true;
      dynamicForm.querySelectorAll("[data-task-step]").forEach(section => { section.hidden = Number(section.dataset.taskStep) !== taskStep; });
      taskFormScroll.hidden = false;
      taskResultHost.hidden = true;
      taskFormActions.hidden = false;
      renderTaskStepper();
      renderTaskActions();
      if (activeType === "mix" && taskStep === 3 && previousStep < 3) {
        renderMixScriptLoading();
      } else if (activeType === "mix" && taskStep === 3) {
        updateMixScriptCompletion();
      }
      if (activeType === "mix") syncMixStepChat();
      taskFormScroll.scrollTo({ top: 0, behavior: "smooth" });
      // 智能脚本 Agent 步骤 3 = 结果页(由 renderScriptTaskResult 接管)
      if (activeType === "script" && taskStep === 3) {
        captureScriptContext();
      }
    }

    function bindMixAgentEvents() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root || root.dataset.bound === "true") return;
      root.dataset.bound = "true";
      const mixVoiceOptions = root.querySelector("[data-mix-voice-options]");
      if (mixVoiceOptions) {
        const currentVoice = root.querySelector("[data-mix-voice]")?.value || SCRIPT_VOICE_OPTIONS[0][0];
        mixVoiceOptions.innerHTML = voiceOptionsHtml("mix-voice-option", "mix-voice-preview-option", currentVoice);
        bindVoiceChoiceEvents(root, "[data-mix-voice]");
      }
      if (!root._mixActionBridgeBound) {
        root._mixActionBridgeBound = true;
        document.addEventListener("click", event => {
          if (!root.isConnected) return;
          const toggleTarget = event.target.closest?.("[data-mix-toggle-row]");
          if (toggleTarget && root.contains(toggleTarget)) {
            event.preventDefault();
            const card = toggleTarget.closest(".mix-script-card");
            const body = card?.querySelector(".mix-script-body");
            if (body) {
              body.hidden = !body.hidden;
              toggleTarget.textContent = body.hidden ? "展开" : "收起";
              toggleTarget.setAttribute("aria-expanded", String(!body.hidden));
            }
            return;
          }
          const target = event.target.closest?.("[data-mix-preview-row],[data-mix-replace-row],[data-mix-rematch-row],[data-mix-rematch-all],[data-mix-delete-row]");
          if (!target || !root.contains(target)) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (target.matches("[data-mix-preview-row]")) {
            const card = target.closest("[data-mix-script-row]");
            // 未匹配镜头:点击预览区直接弹重新匹配弹窗,而不是打开无意义的预览
            if (card?.classList.contains("is-needs-shot")) {
              openMixRowRematchDialog(card);
            } else {
              openMixRowPreview(card);
            }
            return;
          }
          if (target.matches("[data-mix-replace-row]")) {
            openMixRowMaterialPicker(target.closest("[data-mix-script-row]"));
            return;
          }
          if (target.matches("[data-mix-rematch-row]")) {
            const card = target.closest("[data-mix-script-row]");
            if (card) runMixRowRematch(card);
            return;
          }
          if (target.matches("[data-mix-visual-reset]")) {
            const card = target.closest("[data-mix-script-row]");
            if (card) applyMixRowVisualReset(card);
            return;
          }
          if (target.matches("[data-mix-rematch-all]")) openMixRematchAllDialog();
          // 行级删除
          if (target.matches("[data-mix-delete-row]")) {
            openMixDeleteRowConfirm(target.closest("[data-mix-script-row]"));
            return;
          }
        }, true);
      }
      // 画面要求(高级设置)字段双向绑定 → 写入 root._mixRowMetaOverrides
      if (!root._mixMetaEditBound) {
        root._mixMetaEditBound = true;
        root.addEventListener("input", event => {
          const metaField = event.target.closest?.("[data-mix-row-shot-type],[data-mix-row-camera-move],[data-mix-row-scene],[data-mix-row-subject]");
          if (!metaField || !root.contains(metaField)) return;
          const card = metaField.closest("[data-mix-script-row]");
          const origIdx = Number(card?.dataset.mixOrigRow || -1);
          if (origIdx < 0) return;
          const key = metaField.dataset.mixRowShotType !== undefined ? "shotType"
            : metaField.dataset.mixRowCameraMove !== undefined ? "cameraMove"
            : metaField.dataset.mixRowScene !== undefined ? "scene"
            : "subject";
          root._mixRowMetaOverrides = { ...(root._mixRowMetaOverrides || {}), [origIdx]: { ...(root._mixRowMetaOverrides?.[origIdx] || {}), [key]: metaField.value } };
        });
        root.addEventListener("change", event => {
          const metaField = event.target.closest?.("[data-mix-row-shot-type],[data-mix-row-camera-move]");
          if (!metaField || !root.contains(metaField)) return;
          // change 用于 select 兼容(虽然 input 也会触发,这里留个冗余防漏)
        });
      }
      const materialGrid = root.querySelector("[data-mix-material-grid]");
      if (materialGrid && materialGrid.dataset.selectionBound !== "true") {
        materialGrid.dataset.selectionBound = "true";
        materialGrid.addEventListener("click", event => {
          const card = event.target.closest("[data-mix-material]");
          if (!card || !materialGrid.contains(card) || event.target.closest("[data-mix-preview-material]")) return;
          event.preventDefault();
          event.stopPropagation();
          toggleMixMaterialSelection(card);
          renderMixMaterialPage(Number(root.dataset.mixMaterialPage || 1));
        });
      }
      const addMaterialButton = root.querySelector("[data-mix-add-material]");
      if (addMaterialButton && addMaterialButton.dataset.bound !== "true") {
        addMaterialButton.dataset.bound = "true";
        addMaterialButton.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          openMixMaterialPicker(root);
        });
      }
      const factsButton = root.querySelector("[data-mix-show-facts]");
      if (factsButton && factsButton.dataset.bound !== "true") {
        factsButton.dataset.bound = "true";
        factsButton.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          openMixProductFacts();
        });
      }
      root.addEventListener("click", event => {
        // Phase 3.6: alert chip 点击 — 跳转 / 定位
        const alertChip = event.target.closest("[data-mix-alert-goto]");
        if (alertChip) {
          event.preventDefault();
          event.stopPropagation();
          const goto = alertChip.dataset.mixAlertGoto;
          if (goto === "copy") {
            setTaskStep(2);
            showToast("已切到步骤 2,请补全口播文案");
            return;
          }
          if (goto === "shot") {
            const idx = Number(alertChip.dataset.mixAlertShotIdx || 0);
            const card = root.querySelector(`.mix-script-card[data-mix-script-row="${idx}"]`);
            if (card) {
              card.scrollIntoView({ behavior: "smooth", block: "center" });
              card.classList.add("is-flash");
              setTimeout(() => card.classList.remove("is-flash"), 1600);
              // 自动展开 body
              const body = card.querySelector(".mix-script-body");
              if (body && body.hidden) {
                body.hidden = false;
                const toggle = card.querySelector("[data-mix-toggle-row]");
                if (toggle) toggle.textContent = "收起";
              }
              // 统计同 batch 数量提示
              const more = root.querySelectorAll(".mix-script-card.is-needs-shot").length;
              if (more > 1) showToast(`已定位到第 ${idx + 1} 段,还有 ${more - 1} 段镜头未匹配`);
            } else {
              showToast("未找到对应分镜卡片");
            }
            return;
          }
          return;
        }
        const sourceExpand = event.target.closest("[data-mix-source-expand]");
        if (sourceExpand) {
          const info = sourceExpand.closest("[data-mix-source-asset-info]");
          const preview = info?.querySelector("span");
          if (!preview) return;
          const expanded = preview.dataset.expanded === "true";
          const fullText = preview.dataset.fullText || "";
          preview.dataset.expanded = String(!expanded);
          preview.textContent = expanded ? `${fullText.slice(0, 72)}${fullText.length > 72 ? "…" : ""}` : fullText;
          sourceExpand.textContent = expanded ? "展开全文" : "收起";
          return;
        }
        const tagToggle = event.target.closest("[data-mix-tag-filter-toggle]");
        if (tagToggle) {
          openMixMaterialTagFilter();
          return;
        }
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
        if (event.target.closest("[data-mix-pick-structure]")) {
          openMixStructurePicker();
          return;
        }
        if (event.target.closest("[data-mix-pick-product]")) {
          openMixProductPicker();
          return;
        }
        if (event.target.closest("[data-mix-clear-structure]")) {
          applyMixStructureSelection("");
          showToast("已改为由 AI 自动匹配爆款内容结构");
          return;
        }
        const audienceChip = event.target.closest("[data-mix-audience-box] .audience-chip");
        if (audienceChip) {
          root.querySelectorAll("[data-mix-audience-box] .audience-chip").forEach(chip => chip.classList.toggle("active", chip === audienceChip));
          const names = [audienceChip.textContent.trim()];
          const input = root.querySelector("[data-mix-audience]");
          if (input) { input.value = names.join("、"); input.dataset.personaIds = names.map(name => personaCatalog.find(persona => persona.name === name || persona.audience === name)?.id || "").filter(Boolean).join("|"); }
          return;
        }
        if (event.target.closest("[data-persona-clear]")) {
          return;
        }
        if (event.target.closest("[data-mix-pick-audience]")) {
          openMixAudiencePicker(root);
          return;
        }
        const personaMode = event.target.closest("[data-mix-persona-mode]");
        if (personaMode) {
          setMixPersonaMode(root, personaMode.dataset.mixPersonaMode);
          return;
        }
        const addGroup = event.target?.closest?.("[data-mix-add-persona-group]");
        if (addGroup) {
          appendMixPersonaGroup(root);
          return;
        }
        const removeGroup = event.target.closest("[data-mix-persona-group-remove]");
        if (removeGroup) {
          const group = removeGroup.closest("[data-mix-persona-group]");
          if (group) {
            const groups = root.querySelector("[data-mix-persona-groups]");
            const wasOnly = groups.querySelectorAll("[data-mix-persona-group]").length <= 1;
            group.remove();
            if (wasOnly) {
              groups.insertAdjacentHTML("beforeend", mixPersonaGroupTemplate(0));
              const fresh = groups.lastElementChild;
              if (fresh) bindMixPersonaGroupPills(fresh, root);
            } else {
              [...groups.querySelectorAll("[data-mix-persona-group]")].forEach((node, index) => {
                node.dataset.mixPersonaIndex = String(index);
                const label = node.querySelector(".mix-persona-group-head > span");
                if (label) label.textContent = `人群 ${index + 1}`;
                if (index === 0) {
                  const remove = node.querySelector("[data-mix-persona-group-remove]");
                  if (remove) remove.remove();
                }
              });
            }
            syncMixManualPersonaSummary(root);
          }
          return;
        }
        const pill = event.target.closest(".mix-persona-pill");
        if (pill) {
          const row = pill.closest(".mix-persona-chips-row");
          if (row) {
            row.querySelectorAll(".mix-persona-pill").forEach(button => button.classList.toggle("active", button === pill));
            const group = pill.closest("[data-mix-persona-group]");
            const customAge = group?.querySelector("[data-mix-custom-age]");
            if (customAge) customAge.hidden = pill.dataset.value !== "自定义" || row !== group.querySelector("[data-mix-age-chips]");
            syncMixManualPersonaSummary(root);
          }
          return;
        }
        const aiSuggest = event.target.closest("[data-mix-ai-suggest]");
        if (aiSuggest) {
          const group = aiSuggest.closest("[data-mix-persona-group]");
          if (group) applyMixManualAiSuggestion(group, aiSuggest.dataset.mixAiSuggest);
          return;
        }
        if (event.target.closest("[data-mix-select-all]")) {
          const cards = [...root.querySelectorAll("[data-mix-material]")];
          const allSelected = cards.length > 0 && cards.every(card => card.classList.contains("selected"));
          cards.forEach(card => {
            card.classList.toggle("selected", !allSelected);
            card.setAttribute("aria-checked", String(!allSelected));
            const select = card.querySelector(".mix-material-select");
            if (select) {
              select.textContent = allSelected ? "" : "✓";
              select.setAttribute("aria-label", `${allSelected ? "选择" : "取消选择"}${card.querySelector("strong")?.textContent || "素材"}`);
            }
          });
          updateMixMaterialSummary();
          renderMixMaterialPage(Number(root.dataset.mixMaterialPage || 1));
          return;
        }
        const materialPage = event.target.closest("[data-mix-material-page]");
        if (materialPage) {
          const current = Number(root.dataset.mixMaterialPage || 1);
          renderMixMaterialPage(materialPage.dataset.mixMaterialPage === "next" ? current + 1 : current - 1);
          return;
        }
        const materialSelect = event.target.closest(".mix-material-select");
        if (materialSelect) {
          toggleMixMaterialSelection(materialSelect.closest("[data-mix-material]"));
          renderMixMaterialPage(Number(root.dataset.mixMaterialPage || 1));
          return;
        }
        const materialPreview = event.target.closest("[data-mix-preview-material]");
        if (materialPreview) {
          openMixMaterialPreview(materialPreview.closest("[data-mix-material]"));
          return;
        }
        const materialCard = event.target.closest("[data-mix-material]");
        if (materialCard) {
          toggleMixMaterialSelection(materialCard);
          renderMixMaterialPage(Number(root.dataset.mixMaterialPage || 1));
          return;
        }
        if (event.target.closest("[data-mix-show-facts]")) {
          openMixProductFacts();
          return;
        }
        if (event.target.closest("[data-mix-add-material]")) {
          openMixMaterialPicker(root);
          return;
        }
        if (event.target.closest("[data-mix-regenerate-copy]")) {
          if (root.dataset.mixPlanMode === "copy") root._mixCopyRewriteVersion = Number(root._mixCopyRewriteVersion || 0) + 1;
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
        const speedDelta = event.target.closest("[data-mix-speed-minus]") ? -0.05 : event.target.closest("[data-mix-speed-plus]") ? 0.05 : 0;
        if (speedDelta) {
          const input = root.querySelector("[data-mix-speed]");
          input.value = Math.max(.8, Math.min(1.3, Number(input.value) + speedDelta)).toFixed(2);
          syncMixDuration();
          return;
        }
        const toggleRow = event.target.closest("[data-mix-toggle-row]");
        if (toggleRow) {
          event.preventDefault();
          const card = toggleRow.closest(".mix-script-card");
          const body = card?.querySelector(".mix-script-body");
          if (body) {
            body.hidden = !body.hidden;
            toggleRow.textContent = body.hidden ? "展开" : "收起";
            toggleRow.setAttribute("aria-expanded", String(!body.hidden));
          }
          return;
        }
        const previewRow = event.target.closest("[data-mix-preview-row]");
        if (previewRow) {
          openMixRowPreview(previewRow.closest("[data-mix-script-row]"));
          return;
        }
    const replace = event.target.closest("[data-mix-replace-row]");
        if (replace) {
          const row = replace.closest("[data-mix-script-row]");
          openMixRowMaterialPicker(row);
          return;
        }
        const rematch = event.target.closest("[data-mix-rematch-row]");
        if (rematch) {
          const card = rematch.closest("[data-mix-script-row]");
          if (card) runMixRowRematch(card);
          return;
        }
        const visualReset = event.target.closest("[data-mix-visual-reset]");
        if (visualReset) {
          const card = visualReset.closest("[data-mix-script-row]");
          if (card) applyMixRowVisualReset(card);
          return;
        }
        if (event.target.closest("[data-mix-rematch-all]")) {
          openMixRematchAllDialog();
        }
      });
      root.addEventListener("input", event => {
        if (event.target.matches("[data-mix-age-min], [data-mix-age-max]")) {
          syncMixManualPersonaSummary(root);
          return;
        }
        if (event.target.matches("[data-mix-material-search]")) {
          root.dataset.mixMaterialQuery = event.target.value;
          renderMixMaterialPage(1);
        }
        if (event.target.matches("[data-mix-copy], [data-mix-speed], [data-mix-target-duration]")) {
          if (event.target.matches("[data-mix-copy]")) root._mixChatCopy = "";
          if (event.target.matches("[data-mix-target-duration]")) {
            root.querySelectorAll("[data-mix-duration-preset]").forEach(button => button.classList.toggle("active", Number(button.dataset.mixDurationPreset) === Number(event.target.value)));
          }
          syncMixDuration();
        }
        if (event.target.matches("[data-mix-row-visual], [data-mix-row-copy]")) {
          // 走公共行内编辑函数,混剪端额外需要"同步回大文本框"和"刷新完成度"
          handleRowEditInput(event, {
            stateAdapter: {
              writeVisualOverride(idx, val) {
                root._mixRowVisualOverrides = { ...(root._mixRowVisualOverrides || {}), [idx]:val };
              },
              writeCopyOverride(idx, val) {
                root._mixRowCopyOverrides = { ...(root._mixRowCopyOverrides || {}), [idx]:val };
              },
              markNeedsRematch(idx) {
                if (!root._mixRowNeedsRematch) root._mixRowNeedsRematch = new Set();
                root._mixRowNeedsRematch.add(idx);
              }
            },
            onVisualEdit: () => updateMixScriptCompletion(),
            onCopyEdit: (index, val) => {
              // 同步回 dynamicForm [data-mix-copy] 大文本框(让时长重算参考同一份)
              const bigCopy = dynamicForm.querySelector("[data-mix-copy]");
              if (bigCopy) {
                const segs = mixScriptSegments();
                segs[index] = { ...segs[index], copy: val };
                const parts = segs.map(s => (s.copy || "").trim()).filter(Boolean);
                bigCopy.value = parts.join("\n");
                bigCopy.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }
          });
        }
      });
      root.addEventListener("change", event => {
        if (event.target.matches("[data-mix-material-filter]")) {
          root.dataset.mixMaterialFilter = event.target.value;
          renderMixMaterialPage(1);
        }
        if (event.target.matches("[data-mix-product]")) {
          const hasProduct = Boolean(event.target.value);
          root.querySelector("[data-mix-product-facts]").hidden = !hasProduct;
          syncMixProductMaterials(event.target.value);
          syncMixModeFields(root.dataset.mixPlanMode || "ai");
          syncMixProductPicker();
        }
        if (event.target.matches("[data-mix-voice]")) syncMixDuration();
        if (event.target.matches("[data-mix-existing-copy], [data-mix-existing-script]")) updateMixSourceAsset(event.target);
      });
      root.addEventListener("keydown", event => {
        if (!event.target.matches("[data-mix-material]")) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleMixMaterialSelection(event.target);
        renderMixMaterialPage(Number(root.dataset.mixMaterialPage || 1));
      });
      renderMixPlanContext("ai");
      syncMixProductMaterials(root.querySelector("[data-mix-product]")?.value || "");
      // 视频生成时长默认 60 秒(AI / 复制文案模式)
      const target = root.querySelector("[data-mix-target-duration]");
      if (target && !target.value) target.value = "60";
      updateMixMaterialSummary();
      syncMixDuration();
    }

    function taskSteps() { return agentStepPlans[activeType] || ["基础信息", "创作设置", "确认生成"]; }

    function appendTaskGreeting() {
      if (activeType === "mix") return;
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

    // 混剪 loading 阶段:右下角操作区只保留"上一步",隐藏主按钮与"重新匹配全部"
    function setMixLoadingActions(loading) {
      if (!taskActionButtons) return;
      taskActionButtons.querySelectorAll(".primary-btn, .task-rematch-all-button").forEach(btn => { btn.hidden = loading; });
    }

    // 阶段1 G: 智能混剪进入第三步时的 loading + 逐条出现
    function renderMixScriptLoading() {
      const host = dynamicForm.querySelector("[data-mix-script-list]");
      if (!host) return;
      setMixLoadingActions(true);
      // 进入 loading 阶段先把"段落待完善"提示隐藏,等真实分镜完成后再重算
      const alert = dynamicForm.querySelector("[data-mix-script-alert]");
      if (alert) { alert.hidden = true; alert.innerHTML = ""; }
      // loading 阶段也不应禁用"确认脚本"按钮
      const next = taskActionButtons?.querySelector(".primary-btn");
      if (next) next.disabled = true;
      if (taskActionNote) taskActionNote.textContent = "正在分镜,稍候…";
      const steps = [
        { title: "AI 正在分镜", sub: "根据口播与素材分析结果,切分镜头分段…" },
        { title: "正在匹配镜头", sub: "按景别 / 运镜 / 场景匹配最佳素材…" },
        { title: "正在校准时长", sub: "按配音语速重新分配每段时长…" },
        { title: "分镜完成", sub: "即将展示结果,可继续用对话调整" }
      ];
      host.innerHTML = `<div class="mix-script-loading">
        <div class="mix-spinner"></div>
        <ol class="mix-loading-steps" data-mix-loading-steps>${steps.map((s, i) => `<li data-mix-step="${i}"><span class="mix-loading-step-dot"></span><div class="mix-loading-step-text"><b>${s.title}</b><small>${s.sub}</small></div></li>`).join("")}</ol>
      </div>`;
      const stepNodes = host.querySelectorAll("[data-mix-step]");
      stepNodes.forEach((n, i) => { if (i === 0) n.classList.add("is-active"); });
      steps.forEach((_, i) => {
        setTimeout(() => {
          if (i > 0) stepNodes[i - 1]?.classList.replace("is-active", "is-done");
          if (i < steps.length - 1) stepNodes[i]?.classList.add("is-active");
        }, i * 350);
      });
      const total = mixScriptSegments().length || 5;
      setTimeout(() => {
        renderMixScript();
        setMixLoadingActions(false);
        const cards = host.querySelectorAll(".mix-script-card");
        cards.forEach((card, i) => {
          card.classList.add("is-entering");
          card.style.animationDelay = `${i * 90}ms`;
        });
        updateMixScriptCompletion();
        // 自动展开"有问题"的分镜卡(口播缺失 / 镜头未匹配 / needs-rematch),
        // 让用户进 Step 3 一眼能看到是哪几段,不用挨个点"展开"
        const segments = mixScriptSegments();
        host.querySelectorAll(".mix-script-card").forEach((card, i) => {
          const seg = segments[i];
          const isProblem = !seg || !seg.complete;
          if (isProblem) {
            const body = card.querySelector(".mix-script-body");
            if (body && body.hidden) {
              body.hidden = false;
              const toggle = card.querySelector("[data-mix-toggle-row]");
              if (toggle) toggle.textContent = "收起";
            }
          }
        });
        const counter = dynamicForm.querySelector("[data-mix-script-count]");
        if (counter) counter.textContent = String(total);
      }, 1200);
    }

    // 智能脚本 Agent:提交生成,先切到步骤 3 显示 spinner,2 秒后调 showTaskResult
    function submitScriptGeneration() {
      captureScriptContext();
      setTaskStep(3);
      // 在结果容器里显示 4 步生成中(对齐智能混剪第三步 loading)
      const resultCard = dynamicForm.querySelector("[data-script-result-card]");
      if (resultCard) {
        const steps = [
          { title: "AI 正在拆解产品卖点", sub: "把口播与产品事实拆为可拍摄单元…" },
          { title: "正在切分镜头分段", sub: "按总时长、运镜与景别切分每个分镜…" },
          { title: "正在匹配推荐素材", sub: "按场景 / 景别 / 运镜匹配最佳素材…" },
          { title: "正在校准口播时长", sub: "按语速重新分配每段口播与画面时长…" }
        ];
        resultCard.innerHTML = `<div class="mix-script-loading">
          <div class="mix-spinner"></div>
          <ol class="mix-loading-steps" data-mix-loading-steps>${steps.map((s, i) => `<li data-mix-step="${i}"><span class="mix-loading-step-dot"></span><div class="mix-loading-step-text"><b>${s.title}</b><small>${s.sub}</small></div></li>`).join("")}</ol>
        </div>`;
        const stepNodes = resultCard.querySelectorAll("[data-mix-step]");
        stepNodes.forEach((n, i) => { if (i === 0) n.classList.add("is-active"); });
        steps.forEach((_, i) => {
          setTimeout(() => {
            if (i > 0) stepNodes[i - 1]?.classList.replace("is-active", "is-done");
            if (i < steps.length - 1) stepNodes[i]?.classList.add("is-active");
          }, i * 350);
        });
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
          ratio: ctx.ratio || "9:16",
          meta: `${ctx.ratio || "9:16"} · ${ctx.duration || 30}s · ${ctx.voice || "未选择配音"} · ${(ctx.materialGroups || []).length} 个素材分组`,
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

    function adjustMixCopyByChat(request) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const source = mixEffectiveCopy(root);
      const sentences = source.match(/[^。！？!?]+[。！？!?]?/g)?.map(item => item.trim()).filter(Boolean) || [];
      const normalized = request.replace(/\s/g, "");
      let next = source;
      if (/短|精简|缩短|控制时长/.test(normalized)) {
        next = sentences.slice(0, 4).join("");
        if (next.length > 120) next = `${next.slice(0, 116)}。`;
      } else if (/开头|钩子|前3秒|前三秒/.test(normalized)) {
        next = `先看真实清洁结果，再看产品怎么做到。${sentences.slice(1).join("") || source}`;
      } else if (/口语|自然|更像人说/.test(normalized)) {
        next = source.replace(/不代表/g, "不一定").replace(/能够/g, "能").replace(/进行/g, "做").replace(/可以/g, "能");
      } else if (/结尾|行动引导|CTA|点击/.test(normalized)) {
        next = `${source.replace(/点击商品[^。！？!?]*[。！？!?]?$/, "").trim()} 点击商品，查看完整实测。`;
      } else {
        next = generateMixCopyRewrite(source);
      }
      return next.trim();
    }

    // ── 阶段2 H: 第三步对话 4 能力 ────────────────────────────────────────
    function injectMixQuickChips(isScriptStep) {
      const composer = document.getElementById("taskComposerHost") || promptInput?.closest?.(".composer")?.parentElement;
      const anchor = promptInput?.closest?.(".composer") || document.getElementById("taskComposerHost");
      if (!anchor) return;
      const existing = anchor.querySelector(":scope > .mix-composer-quick");
      if (existing) existing.remove();
      if (!isScriptStep) return;
      const wrap = document.createElement("div");
      wrap.className = "mix-composer-quick";
      wrap.innerHTML = `
        <button type="button" class="mix-quick-chip" data-mix-quick="split" title="把当前选中行拆成两段">拆成两段</button>
        <button type="button" class="mix-quick-chip" data-mix-quick="merge" title="把当前行和下一行合并">合并上下段</button>
        <button type="button" class="mix-quick-chip" data-mix-quick="optimize" title="让 AI 改写当前行的画面描述">优化画面</button>
        <button type="button" class="mix-quick-chip" data-mix-quick="diagnose" title="解释为什么是这个镜头">为什么选这个</button>
      `;
      anchor.insertBefore(wrap, promptInput.closest(".composer") || anchor.firstChild);
      wrap.addEventListener("click", event => {
        const btn = event.target.closest("[data-mix-quick]");
        if (!btn) return;
        const sampleMap = {
          split: "把第 1 段拆成两段",
          merge: "把第 1 段和第 2 段合并",
          optimize: "优化第 1 段画面",
          diagnose: "为什么第 1 段选这个镜头"
        };
        const sample = sampleMap[btn.dataset.mixQuick] || "";
        if (!promptInput) return;
        promptInput.value = sample;
        promptInput.focus();
      });
    }

    function appendMixUserTurn(text) {
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = text;
      chatOutput.append(userTurn);
    }

    function appendMixAssistantTurn(html) {
      const turn = document.createElement("div");
      turn.className = "message assistant";
      turn.dataset.agentType = "mix";
      turn.innerHTML = `<div class="message-head"><strong>✦ 智能混剪</strong></div>${html}`;
      chatOutput.append(turn);
      conversationTurnCount += 1;
      agentTurnCounts.mix = (agentTurnCounts.mix || 0) + 1;
      renderConversationLocator();
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
    }

    function detectMixScriptIntent(text) {
      const t = (text || "").replace(/\s/g, "");
      // 提取显式 index: "第 3 段" / "第3段" / "3 段"
      const explicit = t.match(/第?\s*(\d{1,2})\s*段/);
      let explicitIdx = explicit ? Math.max(0, parseInt(explicit[1], 10) - 1) : null;
      if (/拆/.test(t)) return { kind: "split", explicitIdx };
      if (/合/.test(t) || /并入|并到|合并到|合并到第/.test(t)) return { kind: "merge", explicitIdx };
      if (/优化|改写|重写|画面.*改|改.*画面/.test(t)) return { kind: "optimize", explicitIdx };
      if (/重新匹配|换个?镜头|再匹配|换.*镜头/.test(t)) return { kind: "rematch", explicitIdx };
      if (/为什么|解释|说明|匹配.*原因|怎么选/.test(t)) return { kind: "diagnose", explicitIdx };
      return { kind: "fallback", explicitIdx };
    }

    function pickMixTargetRow(segs, explicitIdx) {
      if (explicitIdx != null && explicitIdx >= 0 && explicitIdx < segs.length) return explicitIdx;
      // 缺省:优先 needs-rematch,否则最后段,再退到 0
      const flagged = segs.findIndex(s => s.needsRematch);
      if (flagged >= 0) return flagged;
      return Math.max(0, segs.length - 1);
    }

    function handleMixSplit(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      root._mixRowSplit = root._mixRowSplit || new Map();
      root._mixInsertedSegments = root._mixInsertedSegments || [];
      root._mixRowFlag = root._mixRowFlag || new Set();
      // 拆 _origIndex(0-based),在前段之后插入新行
      root._mixRowSplit.set(seg._origIndex, { mode: "half" });
      root._mixInsertedSegments.push({
        afterIndex: seg._origIndex,
        stage: "新分镜",
        copy: "",
        visual: "请补充该分镜的画面内容描述",
        _dropOnDelete: true
      });
      root._mixRowInserted?.add?.(seg._origIndex);
      root._mixRowFlag.add(seg._origIndex);
      renderMixScript();
      appendMixAssistantTurn(`<p class="assistant-summary">已把第 ${idx + 1} 段按句号切分为两段,新分镜默认口播为空,可在卡片底部补全。</p>`);
    }

    function handleMixMerge(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const next = segs[idx + 1];
      if (!next) return appendMixAssistantTurn(`<p class="assistant-summary">第 ${idx + 1} 段已是末段,无法向下合并。请选前面的段,或合并到上一段。</p>`);
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      root._mixRowMergedCopy = root._mixRowMergedCopy || {};
      root._mixRowDeleted = root._mixRowDeleted || new Set();
      root._mixRowFlag = root._mixRowFlag || new Set();
      const mergedCopy = (seg.copy || "") + (next.copy || "");
      root._mixRowMergedCopy[seg._origIndex] = mergedCopy;
      root._mixRowDeleted.add(next._origIndex);
      root._mixRowFlag.add(seg._origIndex);
      // 同步清掉被合行的 overrides
      if (root._mixRowOverrides) delete root._mixRowOverrides[next._origIndex];
      if (root._mixRowVisualOverrides) delete root._mixRowVisualOverrides[next._origIndex];
      if (root._mixRowMaterialDurations) delete root._mixRowMaterialDurations[next._origIndex];
      renderMixScript();
      appendMixAssistantTurn(`<p class="assistant-summary">已把第 ${idx + 1} 段和第 ${idx + 2} 段合并,合并后继承前段口播/画面/镜头,总时长已重算。</p>`);
    }

    function handleMixOptimize(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      appendMixAssistantTurn(`<p class="assistant-summary">正在改写第 ${idx + 1} 段画面描述,镜头匹配状态会同步刷新…</p>`);
      setTimeout(() => {
        const origVisual = (seg.visual || "暂无").trim();
        const enhanced = `${origVisual} · 镜头推进自然,主体居中,光影柔和,关键细节特写`;
        root._mixRowVisualOverrides = root._mixRowVisualOverrides || {};
        // visual 存的是渲染位置 index,不是 origIndex
        root._mixRowVisualOverrides[idx] = enhanced;
        if (seg._origIndex >= 0) root._mixRowNeedsRematch?.delete?.(seg._origIndex);
        renderMixScript();
        appendMixAssistantTurn(`<p class="assistant-summary">已用 AI 改写第 ${idx + 1} 段画面描述,镜头匹配状态已重置。</p>`);
      }, 800);
    }

    function handleMixDiagnose(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const m = seg.assigned?.[0];
      const visualShort = (seg.visual || "").slice(0, 30);
      if (m) {
        appendMixAssistantTurn(`<div class="message-head"><strong>✦ 智能混剪</strong></div>
          <p class="assistant-summary">第 ${idx + 1} 段匹配依据:</p>
          <ul class="assistant-facts">
            <li>画面描述关键词:<b>"${escapeHtml(visualShort)}…"</b> → 命中分镜阶段 <b>${escapeHtml(seg.stage || "")}</b></li>
            <li>已选素材中场景最接近:<b>${escapeHtml(m.name)}</b>(场景:${escapeHtml(m.scene || "")})</li>
            <li>景别 <b>${escapeHtml(seg.shotType || "—")}</b> · 运镜 <b>${escapeHtml(seg.cameraMove || "—")}</b> 与素材最契合</li>
          </ul>
          <p class="assistant-summary assistant-hint">如需替换:可点击卡片底部「重新匹配镜头」或说"换第 ${idx + 1} 段的镜头"。</p>`);
      } else {
        appendMixAssistantTurn(`<div class="message-head"><strong>✦ 智能混剪</strong></div>
          <p class="assistant-summary">第 ${idx + 1} 段暂未匹配到镜头。</p>
          <p class="assistant-summary assistant-hint">建议操作:① 补全画面描述让 AI 重新匹配 ② 切换为 <b>口播驱动</b> 模式 ③ 点击卡片底部「替换镜头」手动选素材。</p>`);
      }
    }

    function openMixRowRematchDialogFromIndex(idx) {
      const card = document.querySelector(`.mix-script-card[data-mix-script-row="${idx}"]`);
      if (card) openMixRowRematchDialog(card);
      else showToast("未找到对应分镜卡片");
    }

    function submitMixScriptChat(request) {
      appendMixUserTurn(request);
      promptInput.value = "";
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
      const segs = mixScriptSegments();
      const intent = detectMixScriptIntent(request);
      const idx = pickMixTargetRow(segs, intent.explicitIdx);
      switch (intent.kind) {
        case "split": handleMixSplit(idx, segs); return;
        case "merge": handleMixMerge(idx, segs); return;
        case "optimize": handleMixOptimize(idx, segs); return;
        case "diagnose": handleMixDiagnose(idx, segs); return;
        case "rematch": openMixRowRematchDialogFromIndex(idx); return;
        default: appendMixAssistantTurn(`<p class="assistant-summary">我已收到。可以试试:<br>· "把第 ${idx + 1} 段拆成两段"<br>· "把第 ${idx + 1} 段和第 ${idx + 2} 段合并"<br>· "优化第 ${idx + 1} 段画面"<br>· "为什么第 ${idx + 1} 段选这个镜头"</p>`);
      }
    }

    function submitMixCopyChat(request) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const nextCopy = adjustMixCopyByChat(request);
      if (!root || !nextCopy) return;
      root._mixChatCopy = nextCopy;
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = request;
      const assistantTurn = document.createElement("div");
      assistantTurn.className = "message assistant";
      assistantTurn.dataset.agentType = "mix";
      assistantTurn.innerHTML = `<div class="message-head"><strong>✦ 智能混剪</strong></div><p class="assistant-summary">已按你的要求生成一版新的口播文案，复制下方内容到左侧口播文本即可生效。</p><div class="mix-chat-copy-result"><strong>调整后的口播文案</strong><button class="mix-chat-copy-btn" type="button" data-mix-chat-copy aria-label="复制" title="复制"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg></button><p>${escapeHtml(nextCopy)}</p></div>`;
      chatOutput.append(userTurn, assistantTurn);
      conversationTurnCount += 1;
      agentTurnCounts.mix = (agentTurnCounts.mix || 0) + 1;
      promptInput.value = "";
      syncMixDuration();
      renderConversationLocator();
      chatOutput.scrollTo({ top:chatOutput.scrollHeight, behavior:"smooth" });
      showToast("已生成调整后的口播文案，复制下方内容到左侧口播文本即可生效");
    }

    function syncMixStepChat() {
      if (activeType !== "mix") return;
      // 混剪只有 step 2(文案与配音)显示口播调整对话,step 1(创作方案)/ step 3(分镜确认)/ step 4(生成视频)都不显示
      const enabled = taskStep === 2;
      taskShell.classList.toggle("mix-chat-unavailable", !enabled);
      if (!enabled) {
        taskShell.classList.remove("mix-chat-can-edit", "mix-chat-script-mode");
        setTaskChatCollapsed(false);
        injectMixQuickChips(false);
        return;
      }
      setTaskChatCollapsed(false);
      const guideText = "我可以协助你改写或精简口播文案，调整后复制到左侧口播文本即可生效。";
      const subtitle = "可协助调整口播";
      const placeholder = "口播助手模式：精简文案 / 改写语气 / 补充卖点";
      document.getElementById("taskChatSubtitle").textContent = subtitle;
      let guide = chatOutput.querySelector("[data-mix-step-chat-guide]");
      if (!guide) {
        guide = document.createElement("div");
        guide.className = "message assistant";
        guide.dataset.mixStepChatGuide = "";
        chatOutput.append(guide);
      }
      guide.innerHTML = `<div class="message-head"><strong>✦ 智能混剪</strong></div><p class="assistant-summary">${guideText}</p>`;
      taskShell.classList.add("mix-chat-can-edit");
      taskShell.classList.toggle("mix-chat-script-mode", false);
      promptInput.disabled = false;
      sendPromptButton.disabled = false;
      promptInput.placeholder = placeholder;
      // step 2 不注入分镜调整 chip(那是分镜助手的事,这里只管口播)
      injectMixQuickChips(false);
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
      // 清掉混剪 step 3+ 残留的 class,避免切到其他 agent 后聊天面板仍被 display:none 隐藏
      taskShell.classList.remove("mix-chat-unavailable", "mix-chat-can-edit", "mix-chat-script-mode");
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
      // 阶段2 J: 重置分镜增删 override
      const prevRoot = dynamicForm?.querySelector?.(".mix-flow-form");
      if (prevRoot) {
        prevRoot._mixRowInserted = new Set();
        prevRoot._mixRowDeleted = new Set();
        prevRoot._mixInsertedSegments = [];
        prevRoot._mixRowMergedCopy = {};
        prevRoot._mixRowSplit = new Map();
        prevRoot._mixRowFlag = new Set();
      }
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


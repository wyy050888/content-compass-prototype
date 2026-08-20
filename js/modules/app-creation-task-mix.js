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

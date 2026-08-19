    // 智能脚本 Agent 事件绑定:在 prepareTaskForm 后调用一次
    function bindScriptAgentEvents() {
      const root = dynamicForm;
      if (!root) return;
      renderScriptModelCards();
      refreshScriptLibraryTrigger();
      syncScriptLibraryProductDisplay();
      refreshScriptMaterialSummary();

      // 1) 来源文案:模式切换
      root.querySelectorAll(".source-mode-switch [data-script-source-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          const mode = btn.dataset.scriptSourceMode;
          root.querySelectorAll(".source-mode-switch [data-script-source-mode]").forEach(b => {
            const active = b === btn;
            b.classList.toggle("active", active);
            b.setAttribute("aria-selected", active ? "true" : "false");
          });
          root.querySelectorAll("[data-script-source-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptSourcePanel !== mode;
          });
          root.querySelectorAll("[data-script-product-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptProductPanel !== mode;
          });
          root.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
          const productInput = getScriptProductInput(mode);
          if (mode === "manual" && productInput) {
            productInput.value = "";
            delete productInput.dataset.productId;
            productInput.removeAttribute("data-product-id");
          } else if (mode === "library") {
            const libId = root.querySelector("[data-script-source-library]")?.value;
            const item = libId && SCRIPT_LIBRARY_ITEMS.find(i => i.id === libId);
            if (item && productInput) {
              productInput.value = productCatalog[item.productId]?.name || item.productId;
              productInput.dataset.productId = item.productId;
              productInput.setAttribute("data-product-id", item.productId);
            }
            syncScriptLibraryProductDisplay();
          }
          clearScriptPersonaIfIncompatible();
        });
      });

      // 2) 文案库弹窗触发
      root.querySelector("[data-action='open-script-library-picker']")?.addEventListener("click", () => {
        openScriptLibraryPicker();
      });

      // 3) 目标时长只允许输入正整数秒
      root.querySelector("[data-script-duration]")?.addEventListener("input", event => {
        const value = event.target.value;
        if (!value) return;
        const normalized = String(Math.floor(Number(value)));
        if (normalized !== value) event.target.value = normalized;
      });
      root.querySelector("[data-script-duration]")?.addEventListener("blur", event => {
        const value = Number(event.target.value || 0);
        if (!Number.isInteger(value) || value < 1) event.target.value = "60";
        if (value > 600) event.target.value = "600";
      });

      // 4) 是否依赖素材库切换
      root.querySelectorAll('[data-role="script-material-mode"] .choice-chip').forEach(chip => {
        chip.addEventListener("click", () => {
          root.querySelectorAll('[data-role="script-material-mode"] .choice-chip').forEach(c => c.classList.toggle("active", c === chip));
          const mode = chip.dataset.materialMode || "depend";
          // 显隐素材选择面板(只在依赖模式下显示)
          root.querySelectorAll("[data-depend-only]").forEach(el => {
            el.hidden = mode !== "depend";
          });
          // 显隐不依赖模式专属提示(已选择不依赖素材库)
          root.querySelectorAll("[data-free-only]").forEach(el => {
            el.hidden = mode !== "free";
          });
          // 依赖模式专属提示(如"自动带入")始终隐藏,避免噪音
          root.querySelectorAll("[data-tip-material-depend]").forEach(el => {
            el.hidden = true;
          });
          setFormFeedback("");
        });
      });
      // 初始化:隐藏所有 free-only 元素
      root.querySelectorAll("[data-free-only]").forEach(el => { el.hidden = true; });
      // 初始化:始终隐藏"自动带入"等噪音提示
      root.querySelectorAll("[data-tip-material-depend]").forEach(el => { el.hidden = true; });

      // 5) 手动输入文案时，支持通过产品库、商品链接或手工输入确定产品
      root.querySelectorAll("[data-script-product-source]").forEach(button => {
        button.addEventListener("click", () => {
          const source = button.dataset.scriptProductSource;
          root.querySelectorAll("[data-script-product-source]").forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-selected", String(active));
          });
          root.querySelectorAll("[data-script-manual-product-panel]").forEach(panel => {
            panel.hidden = panel.dataset.scriptManualProductPanel !== source;
          });
          clearScriptPersonaIfIncompatible();
          setFormFeedback("");
        });
      });
      root.querySelector("[data-action='open-script-product-picker']")?.addEventListener("click", () => {
        openScriptProductPicker('[data-script-manual-product-panel="library"] [data-script-product]');
      });
      root.querySelector('[data-script-manual-product-panel="library"] [data-script-product]')?.addEventListener("change", event => {
        const label = root.querySelector("[data-script-selected-product]");
        if (label) label.textContent = event.target.value || "选择产品";
        clearScriptPersonaIfIncompatible();
      });
      root.querySelector('[data-script-product-panel="library"] [data-script-product]')?.addEventListener("change", () => clearScriptPersonaIfIncompatible());
      root.querySelector('[data-script-manual-product-panel="manual"] [data-script-product]')?.addEventListener("input", event => {
        const matched = Object.entries(productCatalog).find(([, product]) => product.name === event.target.value.trim());
        if (matched) event.target.dataset.productId = matched[0];
        else delete event.target.dataset.productId;
        clearScriptPersonaIfIncompatible();
      });
      root.querySelector("[data-action='recognize-script-product']")?.addEventListener("click", () => {
        const link = root.querySelector("[data-script-product-link]")?.value.trim();
        if (!link) return setFormFeedback("请先粘贴商品链接。", "error");
        const input = root.querySelector('[data-script-manual-product-panel="link"] [data-script-product]');
        if (input) {
          input.value = productCatalog["mite-pro"].name;
          input.dataset.productId = "mite-pro";
          clearScriptPersonaIfIncompatible();
        }
        setFormFeedback(`已解析产品“${productCatalog["mite-pro"].name}”。`);
      });

      // 6) 目标人群：与智能混剪一致，支持从模板库多选（无上限）和自行输入两种模式。
      const audienceField = root.querySelector("[data-script-audience-field]");
      const setScriptAudience = (personas = []) => {
        const input = root.querySelector("[data-script-audience]");
        if (!input) return;
        const field = audienceField;
        const selected = (Array.isArray(personas) ? personas : [personas]).filter(Boolean)
          .filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
        const names = selected.map(item => item.name || item.audience);
        input.value = names.join("、");
        input.dataset.personaId = selected[0]?.id || "";
        input.dataset.personaIds = selected.map(item => item.id).join("|");
        const placeholder = field?.querySelector("[data-script-audience-placeholder]");
        const chips = field?.querySelector("[data-script-audience-chips]");
        const clearBtn = field?.querySelector("[data-action='clear-script-audience']");
        const trigger = field?.querySelector(".script-persona-trigger");
        if (selected.length) {
          if (placeholder) placeholder.hidden = true;
          if (chips) {
            chips.hidden = false;
            chips.innerHTML = names.map(name => `<em class="script-persona-chip">${escapeHtml(name)}</em>`).join("");
          }
          if (clearBtn) clearBtn.hidden = false;
          trigger?.classList.add("is-filled");
        } else {
          if (placeholder) placeholder.hidden = false;
          if (chips) { chips.hidden = true; chips.innerHTML = ""; }
          if (clearBtn) clearBtn.hidden = true;
          trigger?.classList.remove("is-filled");
        }
        input.closest(".field")?.classList.remove("invalid");
      };
      const currentScriptProductName = () => getScriptProductInput(root.querySelector("[data-script-source-mode].active")?.dataset.scriptSourceMode || "library")?.value.trim() || "";
      const clearScriptPersonaIfIncompatible = () => {
        const input = root.querySelector("[data-script-audience]");
        const ids = String(input?.dataset.personaIds || "").split("|").filter(Boolean);
        const productName = currentScriptProductName();
        const selected = ids.map(id => personaCatalog.find(item => item.id === id)).filter(Boolean);
        if (selected.some(persona => personaProducts(persona).length && !personaProducts(persona).includes(productName))) setScriptAudience([]);
      };
      const openScriptAudiencePicker = () => {
        const productName = currentScriptProductName();
        if (!productName) return showToast("请先确认对应产品，再选择人群画像。");
        if (!window.CreationPersonaPicker) return showToast("人群画像选择器加载失败，请刷新页面后重试。");
        const audienceInput = root.querySelector("[data-script-audience]");
        const manualValues = String(audienceInput?.value || "").split("、").map(value => value.trim()).filter(Boolean)
          .filter(name => !personaCatalog.some(persona => persona.name === name || persona.audience === name));
        window.CreationPersonaPicker.open({
          items: personaCatalog,
          productName,
          multiple:true,
          maxSelected:99,
          selectedIds:String(root.querySelector("[data-script-audience]")?.dataset.personaIds || "").split("|").filter(Boolean),
          allowManual:true,
          mode:"template",
          hideModeSwitch:true,
          manualValues,
          description:"从模板库多选人群画像,本次创作共同生效。",
          onConfirm(personas) {
            const selected = Array.isArray(personas) ? personas : [personas];
            setScriptAudience(selected);
            showToast(`已应用 ${selected.length} 个人群画像`);
          }
        });
      };
      if (audienceField) {
        // 模式切换按钮
        audienceField.querySelectorAll("[data-script-persona-mode]").forEach(btn => {
          btn.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            setScriptPersonaMode(root, btn.dataset.scriptPersonaMode);
          });
        });
        // 添加人群按钮（兜底）
        ensureScriptAddPersonaBinding(root);
        // 移除人群按钮
        audienceField.addEventListener("click", event => {
          const removeGroup = event.target.closest("[data-script-persona-group-remove]");
          if (removeGroup) {
            event.preventDefault();
            const group = removeGroup.closest("[data-script-persona-group]");
            if (group) {
              const groups = audienceField.querySelector("[data-script-persona-groups]");
              const wasOnly = groups.querySelectorAll("[data-script-persona-group]").length <= 1;
              group.remove();
              if (wasOnly) {
                groups.insertAdjacentHTML("beforeend", scriptPersonaGroupTemplate(0));
              } else {
                [...groups.querySelectorAll("[data-script-persona-group]")].forEach((node, index) => {
                  node.dataset.scriptPersonaIndex = String(index);
                  const label = node.querySelector(".script-persona-group-head > span");
                  if (label) label.textContent = `人群 ${index + 1}`;
                  if (index === 0) {
                    const remove = node.querySelector("[data-script-persona-group-remove]");
                    if (remove) remove.remove();
                  }
                });
              }
              syncScriptManualPersonaSummary(root);
            }
            return;
          }
          const pill = event.target.closest(".script-persona-pill");
          if (pill) {
            const row = pill.closest(".script-persona-chips-row");
            if (row) {
              row.querySelectorAll(".script-persona-pill").forEach(button => button.classList.toggle("active", button === pill));
              const group = pill.closest("[data-script-persona-group]");
              const customAge = group?.querySelector("[data-script-custom-age]");
              if (customAge) customAge.hidden = pill.dataset.value !== "自定义" || row !== group.querySelector("[data-script-age-chips]");
              syncScriptManualPersonaSummary(root);
            }
            return;
          }
        });
        audienceField.addEventListener("input", event => {
          if (event.target.matches("[data-script-age-min],[data-script-age-max]")) {
            syncScriptManualPersonaSummary(root);
          }
        });
        // 打开人群画像选择器（直接绑定在 trigger 上,避免委托失效）
        audienceField.querySelector("[data-action='open-script-audience-picker']")?.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          openScriptAudiencePicker();
        });
        audienceField.querySelector("[data-action='clear-script-audience']")?.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          setScriptAudience([]);
        });
        // 初始化为模板库模式
        setScriptPersonaMode(root, "template");
      }

      // 7) 素材库弹窗触发
      root.querySelector("[data-action='open-script-material-picker']")?.addEventListener("click", () => {
        openScriptMaterialPicker();
      });
      const voiceOptionsHost = root.querySelector("[data-script-voice-options]");
      if (voiceOptionsHost) voiceOptionsHost.innerHTML = scriptVoiceOptionsHtml();
      bindVoiceChoiceEvents(root, "[data-script-voice]");
    }

    function renderScriptModelCards() {
      const picker = dynamicForm.querySelector("[data-script-model-picker]");
      const triggerText = dynamicForm.querySelector("[data-script-model-trigger-text]");
      const menu = dynamicForm.querySelector("[data-script-model-menu]");
      const hidden = dynamicForm.querySelector("[data-script-model]");
      if (!picker || !menu) return;
      const candidates = [
        { value: "gpt-5-6-terra", label: "GPT-5.6 Terra", group: "推荐模型", recommended: true },
        { value: "claude-sonnet-5", label: "Claude Sonnet 5", group: "国外模型" },
        { value: "gemini-3-6-flash", label: "Gemini 3.6 Flash", group: "国外模型" },
        { value: "doubao-seed-2-pro", label: "豆包 Seed 2.0 Pro", group: "国内模型" },
        { value: "deepseek-v4-pro", label: "DeepSeek V4 Pro", group: "国内模型" },
        { value: "qwen-3-7-max", label: "通义千问 Qwen3.7-Max", group: "国内模型" }
      ];
      const groups = ["推荐模型", "国外模型", "国内模型"];
      const current = hidden?.value || "gpt-5-6-terra";
      const currentItem = candidates.find(c => c.value === current) || candidates[0];
      if (triggerText) triggerText.textContent = `${currentItem.label}${currentItem.recommended ? "（推荐）" : ""}`;
      menu.innerHTML = groups.map(group => `
        <div class="single-model-group">${group}</div>
        ${candidates.filter(model => model.group === group).map(model => `
          <button type="button" class="single-model-option${model.value === current ? " selected" : ""}" data-script-model-option="${model.value}">
            <span><b>${escapeHtml(model.label)}${model.recommended ? "（推荐）" : ""}</b></span>
            <strong>${model.value === current ? "✓" : ""}</strong>
          </button>
        `).join("")}
      `).join("");
      const trigger = picker.querySelector("[data-script-model-trigger]");
      if (trigger) {
        trigger.addEventListener("click", e => {
          e.stopPropagation();
          picker.classList.toggle("open");
        });
      }
      menu.querySelectorAll("[data-script-model-option]").forEach(opt => {
        opt.addEventListener("click", e => {
          e.stopPropagation();
          const v = opt.dataset.scriptModelOption;
          if (hidden) hidden.value = v;
          const item = candidates.find(c => c.value === v);
          if (triggerText && item) triggerText.textContent = `${item.label}${item.recommended ? "（推荐）" : ""}`;
          menu.querySelectorAll("[data-script-model-option]").forEach(o => {
            const selected = o.dataset.scriptModelOption === v;
            o.classList.toggle("selected", selected);
            o.querySelector("strong").textContent = selected ? "✓" : "";
          });
          picker.classList.remove("open");
        });
      });
      // 点击外部关闭
      const closeOnOutside = ev => {
        if (!picker.contains(ev.target)) picker.classList.remove("open");
      };
      document.removeEventListener("click", closeOnOutside, true);
      document.addEventListener("click", closeOnOutside, true);
    }

    function refreshScriptLibraryTrigger() {
      const root = dynamicForm;
      if (!root) return;
      const hidden = root.querySelector("[data-script-source-library]");
      const trigger = root.querySelector("[data-action='open-script-library-picker']");
      const placeholder = root.querySelector("[data-script-library-placeholder]");
      if (!trigger || !placeholder) return;
      const id = hidden?.value;
      const item = id && SCRIPT_LIBRARY_ITEMS.find(i => i.id === id);
      if (item) {
        const product = productCatalog[item.productId];
        const productName = product?.name || "通用产品";
        placeholder.textContent = `${productName} · ${item.text.slice(0, 24)}…`;
        trigger.classList.add("is-filled");
      } else {
        placeholder.textContent = "选择文案";
        trigger.classList.remove("is-filled");
      }
    }

    function syncScriptSourcePreviewFromLibrary() {
      const root = dynamicForm;
      if (!root) return;
      const id = root.querySelector("[data-script-source-library]")?.value;
      const item = id && SCRIPT_LIBRARY_ITEMS.find(i => i.id === id);
      const content = root.querySelector("[data-script-source-content]");
      const meta = root.querySelector("[data-script-source-meta]");
      const previewPanel = root.querySelector("[data-script-source-preview]");
      if (!item) {
        if (previewPanel) previewPanel.hidden = true;
        if (content) content.value = "选择文案后,这里会显示完整口播文案，可在本次脚本任务内修改。";
        if (meta) meta.textContent = "—";
        return;
      }
      if (previewPanel) previewPanel.hidden = false;
      if (content) content.value = item.text;
      const wordCount = item.text.replace(/\s/g, "").length;
      const duration = Math.max(1, Math.round(wordCount / 4));
      if (meta) meta.textContent = `${item.audience || "—"} · ${wordCount} 字 · 预计口播 ${duration} 秒`;
    }

    function syncScriptLibraryProductDisplay() {
      const root = dynamicForm;
      const display = root?.querySelector("[data-script-library-product-display]");
      const productInput = root?.querySelector('[data-script-product-panel="library"] [data-script-product]');
      if (!display || !productInput) return;
      const product = productCatalog[productInput.dataset.productId || ""];
      display.innerHTML = product
        ? `<span class="script-product-display-icon">◈</span><div class="script-product-info"><strong>${escapeHtml(product.name)}</strong></div><span class="script-product-fact">已带入产品事实 <button type="button" data-script-show-facts="${escapeHtml(productInput.dataset.productId)}">查看</button></span>`
        : `<span class="script-product-display-icon">◈</span><div><strong>等待带入对应产品</strong></div>`;
      display.querySelector("[data-script-show-facts]")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openMixProductFacts(event.currentTarget.dataset.scriptShowFacts);
      });
    }

    function refreshScriptMaterialSummary() {
      const root = dynamicForm;
      if (!root) return;
      const host = root.querySelector("[data-script-material-summary]");
      if (!host) return;
      const ids = window.__scriptMaterialSelected || [];
      const errorBox = root.querySelector("[data-material-group-error]");
      if (errorBox) errorBox.hidden = ids.length > 0;
      if (!ids.length) {
        host.innerHTML = `<span class="script-material-summary-empty">暂未选择素材</span>`;
        return;
      }
      host.innerHTML = ids.map(id => {
        const item = findScriptMaterial(id);
        if (!item) return "";
        return `<article class="script-selected-material" data-selected-material="${escapeHtml(id)}"><div class="script-selected-material-cover">${escapeHtml(item.id)}</div><div><strong>${escapeHtml(item.name || item.id)}</strong><small>${escapeHtml(item.scene || item.group)} · 9:16 · ${item.duration}s</small></div><button type="button" aria-label="移除 ${escapeHtml(item.name || item.id)}" data-script-remove-material="${escapeHtml(id)}">×</button></article>`;
      }).join("");
      host.querySelectorAll("[data-script-remove-material]").forEach(btn => {
        btn.addEventListener("click", () => {
          const materialId = btn.dataset.scriptRemoveMaterial;
          window.__scriptMaterialSelected = (window.__scriptMaterialSelected || []).filter(x => x !== materialId);
          refreshScriptMaterialSummary();
        });
      });
    }

    function openScriptLibraryPicker(options = {}) {
      let activeScope = "all";
      let searchText = "";
      let selectedId = "";  // 单选 ID
      const current = options.selectedId || dynamicForm.querySelector("[data-script-source-library]")?.value;
      if (current) selectedId = current;

      const filterItems = () => SCRIPT_LIBRARY_ITEMS.filter(i => {
        if (activeScope !== "all" && i.scope !== activeScope) return false;
        if (!searchText) return true;
        const s = searchText.toLowerCase();
        return i.text.toLowerCase().includes(s) ||
               (productCatalog[i.productId]?.name || "").toLowerCase().includes(s) ||
               i.audience.toLowerCase().includes(s);
      });

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.innerHTML = `
        <div class="modal-card script-picker-modal" role="dialog" aria-label="从文案库选择">
          <header class="modal-head">
            <div><strong>${escapeHtml(options.title || "从文案库选择文案")}</strong><small>${escapeHtml(options.subtitle || '支持按"全部 / 我创建的 / 我的团队"切换，输入关键词快速定位（单选）')}</small></div>
            <button class="modal-close" type="button" data-modal-close>×</button>
          </header>
          <div class="lib-picker-toolbar">
            <div class="lib-pick-tabs" role="tablist">
              <button type="button" class="active" data-scope="all">全部</button>
              <button type="button" data-scope="mine">我创建的</button>
              <button type="button" data-scope="team">我的团队</button>
            </div>
            <input type="text" class="lib-pick-search" placeholder="搜索文案内容或产品">
          </div>
          <div class="lib-pick-list" data-lib-pick-list></div>
          <footer class="modal-foot">
            <div class="modal-foot-actions">
              <button class="ghost-btn" type="button" data-modal-close>取消</button>
              <button class="primary-btn" type="button" data-lib-pick-confirm disabled>确认</button>
            </div>
          </footer>
        </div>
      `;
      document.body.appendChild(overlay);
      const list = overlay.querySelector("[data-lib-pick-list]");
      const confirmBtn = overlay.querySelector("[data-lib-pick-confirm]");

      const render = () => {
        const items = filterItems();
        list.innerHTML = items.length ? items.map(i => {
          const product = productCatalog[i.productId];
          const productName = product?.name || "通用产品";
          const preview = i.text.length > 80 ? i.text.slice(0, 80) + "…" : i.text;
          const wordCount = i.text.replace(/\s/g, "").length;
          const estimatedDuration = Math.max(1, Math.round(wordCount / 4));
          const tagGroups = [
            ["产品", [productName]],
            ["适用人群", i.audience ? [i.audience] : []],
            ["字数", [`${wordCount} 字`]],
            ["来源", [i.source]],
            ["预计时长", [`${estimatedDuration} 秒`]]
          ].filter(([, values]) => values.length);
          const isSel = i.id === selectedId;
          return `<article class="lib-pick-card${isSel ? " selected" : ""}" data-pick-id="${i.id}">
            <i class="lib-pick-check">${isSel ? "✓" : ""}</i>
            <p class="lib-pick-content">${escapeHtml(preview)}</p>
            <div class="lib-pick-tags">${tagGroups.map(([label, values]) => `<div class="lib-pick-tag-group"><b>${label}</b><div>${values.map(value => `<span class="lib-pick-tag ${label === "来源" ? "is-source" : ""}">${escapeHtml(value)}</span>`).join("")}</div></div>`).join("")}</div>
          </article>`;
        }).join("") : `<div class="lib-pick-empty">未找到匹配的文案,试试切换 tab 或换个关键词</div>`;
        list.querySelectorAll(".lib-pick-card").forEach(card => {
          card.addEventListener("click", () => {
            // 单选:点击同一项取消,点击其它项替换
            const id = card.dataset.pickId;
            selectedId = (selectedId === id) ? "" : id;
            render();
          });
        });
        confirmBtn.textContent = `确认${selectedId ? "" : "选择"}`;
        confirmBtn.disabled = !selectedId;
      };
      overlay.addEventListener("click", e => { if (e.target === overlay || e.target.matches("[data-modal-close]")) overlay.remove(); });
      overlay.querySelectorAll("[data-scope]").forEach(tab => {
        tab.addEventListener("click", () => {
          activeScope = tab.dataset.scope;
          overlay.querySelectorAll("[data-scope]").forEach(t => t.classList.toggle("active", t === tab));
          render();
        });
      });
      overlay.querySelector(".lib-pick-search").addEventListener("input", e => {
        searchText = e.target.value.trim();
        render();
      });
      confirmBtn.addEventListener("click", () => {
        if (!selectedId) return;
        const item = SCRIPT_LIBRARY_ITEMS.find(i => i.id === selectedId);
        if (typeof options.onConfirm === "function") {
          overlay.remove();
          try { options.onConfirm(item); } catch (err) { console.error("[mix-source] onConfirm 处理失败:", err); showToast("已选择来源，但回填信息失败，请刷新页面后重试。"); }
          return;
        }
        const hidden = dynamicForm.querySelector("[data-script-source-library]");
        if (hidden) hidden.value = selectedId;
        const productInput = dynamicForm.querySelector('[data-script-product-panel="library"] [data-script-product]');
        if (item && productInput) {
          productInput.value = productCatalog[item.productId]?.name || item.productId;
          productInput.dataset.productId = item.productId;
          productInput.setAttribute("data-product-id", item.productId);
          productInput.dispatchEvent(new Event("change", { bubbles:true }));
        }
        refreshScriptLibraryTrigger();
        syncScriptSourcePreviewFromLibrary();
        syncScriptLibraryProductDisplay();
        overlay.remove();
        showToast(`已选择文案: ${productCatalog[item.productId]?.name || "—"}`);
      });
      render();
    }

    function openScriptProductPicker(targetSelector) {
      const inputEl = dynamicForm.querySelector(targetSelector);
      if (!window.CreationProductPicker) {
        setFormFeedback("产品选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      window.CreationProductPicker.open({
        items: Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId: inputEl?.dataset.productId || "",
        onConfirm(productId, product) {
          if (inputEl) {
            inputEl.value = product?.name || productId;
            inputEl.dataset.productId = productId;
            inputEl.setAttribute("data-product-id", productId);
            inputEl.dispatchEvent(new Event("change", { bubbles:true }));
          }
          showToast(`已选择产品: ${product?.name || ""}`);
        }
      });
    }

    function openScriptMaterialPicker(options = {}) {
      if (!Array.isArray(window.__scriptMaterialSelected)) window.__scriptMaterialSelected = [];
      const selectedIds = new Set(options.selectedIds || window.__scriptMaterialSelected || []);
      let activeGroup = "all";
      let searchText = "";
      let typeFilter = "all";
      let statusFilter = "all";
      const materialItems = allScriptMaterials().filter(item => !options.productName || !item.product || item.product === options.productName);
      const statusLabels = { ok:"已分析", pending:"待分析", analyzing:"分析中", fail:"分析失败" };
      const typeLabels = { video:"视频", image:"图片" };

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100020";
      overlay.innerHTML = `
        <div class="modal-card material-picker-modal" role="dialog" aria-label="从素材库选择素材">
          <header class="modal-head">
            <div><strong>${options.title || "从素材库选择素材"}</strong><small>${options.productName ? `已按“${escapeHtml(options.productName)}”筛选关联素材；` : (options.defaultSelectionHint || "可多选；")}支持按文件夹、类型和分析状态筛选</small></div>
            <button class="modal-close" type="button" data-modal-close>×</button>
          </header>
          <div class="lib-picker">
            <aside class="lib-folder-tree" data-lib-folder-tree>
              <button type="button" class="lib-folder-item material-folder-all active" data-group="all"><span class="folder-icon">▣</span><span class="label">全部素材</span><span class="count">${materialItems.length}</span></button>
              ${SCRIPT_MATERIAL_FOLDERS.map(folder => `<div class="material-folder-root"><button type="button" class="lib-folder-item material-folder-parent" data-group="${escapeHtml(folder.children.join("|"))}"><span class="folder-icon">▰</span><span class="label">${escapeHtml(folder.name)}</span><span class="count">${materialItems.filter(item => folder.children.includes(item.group)).length}</span></button><div class="material-folder-children">${folder.children.map(name => `<button type="button" class="lib-folder-item sub" data-group="${escapeHtml(name)}"><span class="folder-icon">⌞</span><span class="label">${escapeHtml(name)}</span><span class="count">${materialItems.filter(item => item.group === name).length}</span></button>`).join("")}</div></div>`).join("")}
            </aside>
            <section class="lib-content">
              <div class="lib-toolbar">
                <input type="text" class="lib-pick-search" placeholder="搜索素材名称、产品或素材 ID">
                <select class="script-material-filter" data-material-filter="type" aria-label="素材类型"><option value="all">全部类型</option><option value="video">视频</option><option value="image">图片</option></select>
                <select class="script-material-filter" data-material-filter="status" aria-label="分析状态"><option value="all">全部状态</option><option value="ok">已分析</option><option value="pending">待分析</option><option value="analyzing">分析中</option><option value="fail">分析失败</option></select>
                <button class="material-picker-select-all" type="button" data-lib-material-select-all>全选当前结果</button>
              </div>
              <div class="lib-grid" data-lib-grid></div>
              <div class="lib-foot">
                <span>已选 <b id="libSelectedCount">${selectedIds.size}</b> 项</span>
                <div class="modal-foot-actions">
                  <button class="ghost-btn" type="button" data-modal-close>取消</button>
                  <button class="primary-btn" type="button" data-lib-material-confirm>确认(${selectedIds.size} 项)</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const folderTree = overlay.querySelector("[data-lib-folder-tree]");
      const grid = overlay.querySelector("[data-lib-grid]");
      const selectedCountEl = overlay.querySelector("#libSelectedCount");
      const confirmBtn = overlay.querySelector("[data-lib-material-confirm]");
      const selectAllBtn = overlay.querySelector("[data-lib-material-select-all]");
      let visibleSelectableIds = [];

      const updateSelectionUi = () => {
        selectedCountEl.textContent = selectedIds.size;
        confirmBtn.textContent = `确认(${selectedIds.size} 项)`;
        const selectedVisibleCount = visibleSelectableIds.filter(id => selectedIds.has(id)).length;
        const allVisibleSelected = visibleSelectableIds.length > 0 && selectedVisibleCount === visibleSelectableIds.length;
        selectAllBtn.disabled = !visibleSelectableIds.length;
        selectAllBtn.classList.toggle("is-selected", allVisibleSelected);
        selectAllBtn.setAttribute("aria-pressed", String(allVisibleSelected));
        selectAllBtn.textContent = allVisibleSelected ? "取消全选" : "全选当前结果";
      };

      const render = () => {
        const groups = activeGroup === "all" ? Object.keys(SCRIPT_MATERIAL_CATALOG) : activeGroup.split("|");
        const items = materialItems.filter(item => groups.includes(item.group));
        const filtered = items.filter(i => {
          if (typeFilter !== "all" && i.type !== typeFilter) return false;
          if (statusFilter !== "all" && i.status !== statusFilter) return false;
          if (searchText) {
            const s = searchText.toLowerCase();
            return [i.id,i.name,i.scene,i.product || "未关联产品",...i.tags].some(value=>String(value).toLowerCase().includes(s));
          }
          return true;
        });
        visibleSelectableIds = filtered.map(item => item.id);
        grid.innerHTML = filtered.length ? filtered.map((i,index) => {
          const isSel = selectedIds.has(i.id);
          const statusIcon = i.status === "ok" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : i.status === "fail" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>' : i.status === "pending" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>' : "";
          const duration = i.type === "video" ? `0:${String(Math.round(i.duration)).padStart(2,"0")}` : "";
          return `<article class="script-mat-card tone-${index%6}${isSel ? " selected" : ""}" data-pick-material="${i.id}">
            <div class="script-mat-cover">
              <span class="script-mat-status status-${i.status}"><span class="ico">${statusIcon}</span><span>${statusLabels[i.status] || i.status}</span></span>
              ${duration ? `<span class="script-mat-duration">${duration}</span>` : ""}
              <div class="script-mat-play"><span>▶</span></div>
              <span class="script-mat-select">${isSel ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ""}</span>
            </div>
            <div class="script-mat-info">
              <div class="script-mat-name" title="${escapeHtml(i.name)}">${escapeHtml(i.name)}</div>
              <div class="script-mat-meta"><span class="script-mat-product${i.product ? "" : " is-empty"}">${escapeHtml(i.product || "未关联产品")}</span><span class="script-mat-type">${typeLabels[i.type] || i.type}</span></div>
              <div class="script-mat-created">${escapeHtml(i.created)}</div>
            </div>
          </article>`;
        }).join("") : `<div class="lib-empty">当前文件夹没有匹配素材，换个关键词试试。</div>`;
        grid.querySelectorAll(".script-mat-card").forEach(card => {
          card.addEventListener("click", () => {
            const id = card.dataset.pickMaterial;
            if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
            render();
          });
        });
        updateSelectionUi();
      };

      folderTree.querySelectorAll(".lib-folder-item").forEach(item => {
        item.addEventListener("click", () => {
          activeGroup = item.dataset.group;
          folderTree.querySelectorAll(".lib-folder-item").forEach(i => i.classList.toggle("active", i === item));
          render();
        });
      });
      overlay.querySelector(".lib-pick-search").addEventListener("input", e => {
        searchText = e.target.value.trim();
        render();
      });
      overlay.querySelectorAll("[data-material-filter]").forEach(select=>select.addEventListener("change",event=>{
        const value = event.target.value;
        if (event.target.dataset.materialFilter === "type") typeFilter = value;
        if (event.target.dataset.materialFilter === "status") statusFilter = value;
        render();
      }));
      selectAllBtn.addEventListener("click", () => {
        const allVisibleSelected = visibleSelectableIds.length > 0 && visibleSelectableIds.every(id => selectedIds.has(id));
        visibleSelectableIds.forEach(id => allVisibleSelected ? selectedIds.delete(id) : selectedIds.add(id));
        render();
      });
      overlay.addEventListener("click", e => { if (e.target === overlay || e.target.matches("[data-modal-close]")) overlay.remove(); });
      confirmBtn.addEventListener("click", () => {
        const ids = [...selectedIds];
        if (typeof options.onConfirm === "function") options.onConfirm(ids);
        else {
          window.__scriptMaterialSelected = ids;
          refreshScriptMaterialSummary();
        }
        overlay.remove();
        showToast(`已选择 ${ids.length} 个素材`);
      });
      render();
    }


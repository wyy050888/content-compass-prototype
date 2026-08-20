
    function renderMixAudienceEditor(root, names = []) {
      const box = root.querySelector("[data-mix-audience-box]");
      if (!box) return;
      const standardAudiences = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
      box.querySelectorAll(".mix-source-audience-chip").forEach(item => item.remove());
      names.filter(name => !standardAudiences.includes(name)).forEach(name => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "original-audience-chip audience-chip mix-source-audience-chip";
        chip.textContent = name;
        box.prepend(chip);
      });
      box.querySelectorAll(".audience-chip").forEach(chip => chip.classList.toggle("active", names.includes(chip.textContent.trim())));
      const first = names[0] ? personaCatalog.find(persona => persona.name === names[0] || persona.audience === names[0]) : null;
      const gender = root.querySelector("[data-role='mix-gender']");
      const age = root.querySelector("[data-role='mix-age']");
      gender?.querySelectorAll(".choice-chip").forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === (first?.gender || "不限")));
      age?.querySelectorAll(".choice-chip").forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === (first?.age || "")));
      root.querySelector("[data-mix-audience-pain]").value = first?.pain?.join("\n") || "";
      root.querySelector("[data-mix-audience-scenes]").value = first?.scenes?.join("\n") || "";
    }

    function setMixSourceSelection(kind, item) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const source = root?.querySelector(kind === "script" ? "[data-mix-existing-script]" : "[data-mix-existing-copy]");
      if (!source || !item) return;
      const productId = item.productId || Object.entries(mixProductNames).find(([, name]) => name === item.product)?.[0] || "";
      const label = kind === "script"
        ? `${item.name}｜${item.product}｜${item.rows?.length || 0} 段`
        : `${mixProductNames[productId] || "通用文案"}｜约${Math.max(1, Math.round((item.text || "").replace(/\s/g, "").length / 4))}秒`;
      source.innerHTML = `<option value="${escapeHtml(item.id)}" data-product="${escapeHtml(productId)}">${escapeHtml(label)}</option>`;
      source.value = item.id;
      root[kind === "script" ? "_mixExternalScript" : "_mixExternalCopy"] = item;
      if (kind === "copy") root._mixCopyRewriteVersion = 0;
      const trigger = root.querySelector(kind === "script" ? "[data-mix-pick-script]" : "[data-mix-pick-copy]");
      trigger?.querySelector("[data-mix-source-picker-label]")?.replaceChildren(label);
      const productSelect = root.querySelector("[data-mix-product]");
      if (productId && productSelect) {
        productSelect.value = productId;
        productSelect.disabled = true;
        root._mixDefaultMaterialIds = kind === "script"
          ? new Set([
            ...(item.usedMaterialIds || []),
            ...((item.rows || item.scriptRows || []).flatMap(row => row.materialIds || row.materialRefs || (row.materialOverride ? [row.materialOverride] : (row.material ? [String(row.material).split(" · ")[0]] : []))))
          ])
          : null;
        syncMixProductMaterials(productId);
        root.querySelector("[data-mix-product-origin]")?.replaceChildren(kind === "copy" ? "已带入已有文案相关产品，修改目标人群、视频时长或创作要求后，下一步将按最新配置重新生成一版文案" : "已带入已有脚本相关产品，修改目标人群、视频时长或创作要求后，后续将按最新配置重新生成一版文案及脚本");
      } else if (productSelect) {
        productSelect.value = "";
        productSelect.disabled = false;
        root._mixDefaultMaterialIds = null;
        syncMixProductMaterials("");
        root.querySelector("[data-mix-product-origin]")?.replaceChildren(`${kind === "copy" ? "该文案" : "该脚本"}未关联产品，请更换一篇有关联产品的${kind === "copy" ? "文案" : "脚本"}。`);
      }
      const sourceText = String(item.sourceFull || item.source || item.text || "");
      const normalizeSource = value => String(value || "").replace(/[，。！？、,.!?\s]/g, "");
      const matchedCopy = kind === "script"
        ? SCRIPT_LIBRARY_ITEMS.find(copy => copy.productId === productId && copy.text && normalizeSource(sourceText).includes(normalizeSource(copy.text).slice(0, 16)))
        : null;
      const sourceAudiences = (Array.isArray(item.audiences) ? item.audiences : String(item.audience || item.targetAudience || matchedCopy?.audience || "").split(/[、,，]/))
        .map(value => String(value || "").trim()).filter(Boolean);
      const knownPersonaIds = sourceAudiences.map(name => personaCatalog.find(persona => persona.name === name || persona.audience === name)?.id).filter(Boolean);
      root._mixSourceAudienceNames = sourceAudiences;
      const audienceInput = root.querySelector("[data-mix-audience]");
      if (audienceInput) {
        audienceInput.value = sourceAudiences.join("、");
        audienceInput.dataset.personaId = knownPersonaIds[0] || "";
        audienceInput.dataset.personaIds = knownPersonaIds.join("|");
      }
      if (kind === "script") {
        const text = item.sourceFull || item.source || item.text || "";
        const inherited = Number(item.duration) || Math.max(10, Math.round(text.replace(/\s/g, "").length / 3.35));
        const duration = root.querySelector("[data-mix-target-duration]");
        if (duration) duration.value = String(inherited);
      }
      updateMixSourceAsset(source);
      syncMixModeFields(kind);
      syncMixDuration();
      try {
        prefillMixManualFromSource(root, sourceAudiences, mixProductNames[productId] || "");
      } catch (err) {
        console.error("[mix-source] 自动填充 自行输入 人群失败:", err);
        showToast("已带入来源信息，但目标人群自动填充失败，可手动选择或自行输入。");
      }
    }

    function prefillMixManualFromSource(root, sourceAudiences, productName) {
      if (!root) return;
      const audiences = (Array.isArray(sourceAudiences) ? sourceAudiences : []).map(value => String(value || "").trim()).filter(Boolean);
      if (!audiences.length) return;
      const matchedPersonaByName = name => personaCatalog.find(persona => persona?.audience === name || persona?.name === name) || null;
      const standards = new Set(MIX_PERSONA_AUDIENCES);
      setMixPersonaMode(root, "manual");
      const groups = root.querySelector("[data-mix-persona-groups]");
      if (!groups) return;
      groups.innerHTML = "";
      ensureMixAddPersonaBinding(root);
      audiences.forEach((audienceName, index) => {
        const persona = matchedPersonaByName(audienceName);
        const matchedStandardAudience = standards.has(persona?.audience) ? persona.audience
          : standards.has(audienceName) ? audienceName
          : "";
        const matchedStandardAge = (() => {
          const candidate = String(persona?.age || "").replace(/[–—]/g, "-");
          return MIX_PERSONA_AGES.find(value => value === candidate) || "";
        })();
        const matchedStandardGender = MIX_PERSONA_GENDERS.find(value => value === (persona?.gender || "不限")) || "不限";
        const group = mixPersonaGroupTemplate(index);
        groups.insertAdjacentHTML("beforeend", group);
        const groupNode = groups.lastElementChild;
        if (!groupNode) return;
        const audienceChips = groupNode.querySelector("[data-mix-audience-chips]");
        if (audienceChips) {
          audienceChips.querySelectorAll(".mix-persona-pill").forEach(pill => pill.classList.remove("active"));
          if (matchedStandardAudience) {
            const pill = audienceChips.querySelector(`.mix-persona-pill[data-value="${cssEscapeValue(matchedStandardAudience)}"]`);
            if (pill) pill.classList.add("active");
          } else {
            const customPill = document.createElement("button");
            customPill.type = "button";
            customPill.className = "mix-persona-pill active is-custom";
            customPill.dataset.value = audienceName;
            customPill.textContent = audienceName;
            audienceChips.appendChild(customPill);
          }
        }
        const genderChips = groupNode.querySelector("[data-mix-gender-chips]");
        if (genderChips) {
          genderChips.querySelectorAll(".mix-persona-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.value === matchedStandardGender));
        }
        const ageChips = groupNode.querySelector("[data-mix-age-chips]");
        if (ageChips) {
          ageChips.querySelectorAll(".mix-persona-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.value === (matchedStandardAge || "24-30")));
        }
        const painArea = groupNode.querySelector("[data-mix-audience-pain]");
        if (painArea) painArea.value = (Array.isArray(persona?.pain) ? persona.pain : []).join("\n");
        const scenesArea = groupNode.querySelector("[data-mix-audience-scenes]");
        if (scenesArea) scenesArea.value = (Array.isArray(persona?.scenes) ? persona.scenes : []).join("\n");
        if (persona && typeof productName === "string" && productName) {
          groupNode.dataset.mixSourcePersonaId = persona.id || "";
        }
        bindMixPersonaGroupPills(groupNode, root);
      });
      ensureMixAddPersonaBinding(root);
      ensureMixPersonaPanelInteractive(root);
      syncMixManualPersonaSummary(root);
      showToast(`已带入 ${audiences.length} 个人群，可继续编辑`);
    }

    function ensureMixPersonaPanelInteractive(root) {
      const field = root.querySelector("[data-mix-audience-field]");
      if (!field) return;
      field.removeAttribute("inert");
      field.classList.remove("is-disabled");
      field.querySelectorAll("[data-mix-persona-panel]").forEach(panel => {
        panel.removeAttribute("inert");
        panel.classList.remove("is-disabled");
      });
    }

    function bindMixPersonaGroupPills(groupNode, root) {
      if (!groupNode || groupNode.dataset.pillsBound === "true") return;
      groupNode.dataset.pillsBound = "true";
      const handler = event => {
        const pill = event.target.closest(".mix-persona-pill");
        if (!pill || !groupNode.contains(pill)) return;
        const row = pill.closest(".mix-persona-chips-row");
        if (!row) return;
        row.querySelectorAll(".mix-persona-pill").forEach(button => button.classList.toggle("active", button === pill));
        const customAge = groupNode.querySelector("[data-mix-custom-age]");
        if (customAge) customAge.hidden = pill.dataset.value !== "自定义" || row !== groupNode.querySelector("[data-mix-age-chips]");
        syncMixManualPersonaSummary(root);
        event.stopPropagation();
      };
      groupNode.addEventListener("click", handler);
      const remove = groupNode.querySelector("[data-mix-persona-group-remove]");
      if (remove) remove.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const groups = root.querySelector("[data-mix-persona-groups]");
        const group = remove.closest("[data-mix-persona-group]");
        if (!groups || !group) return;
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
              const removeBtn = node.querySelector("[data-mix-persona-group-remove]");
              if (removeBtn) removeBtn.remove();
            }
          });
        }
        syncMixManualPersonaSummary(root);
      });
    }

    function cssEscapeValue(value) {
      return String(value || "").replace(/(["\\])/g, "\\$1");
    }

    function openMixAudiencePicker(root) {
      const mode = root.dataset.mixPlanMode || "ai";
      const sourceSelected = Boolean(root.querySelector("[data-mix-existing-copy], [data-mix-existing-script]")?.value);
      if (mode === "copy" && !sourceSelected) return showToast("请先选择已有文案，系统将自动带入关联产品。");
      if (!window.CreationPersonaPicker) return showToast("人群画像选择器加载失败，请刷新页面后重试。");
      const productId = root.querySelector("[data-mix-product]")?.value || "";
      const productName = mixProductNames[productId] || "";
      if (!productName) return showToast(mode === "copy" ? "该文案未关联产品，请更换一篇有关联产品的文案。" : "请先选择产品，再选择人群画像");
      const current = String(root.querySelector("[data-mix-audience]")?.dataset.personaIds || "").split("|").filter(Boolean);
      const manualValues = String(root.querySelector("[data-mix-audience]")?.value || "").split("、").map(value => value.trim()).filter(Boolean)
        .filter(name => !personaCatalog.some(persona => persona.name === name || persona.audience === name));
      const activeModeBtn = root.querySelector("[data-mix-persona-mode].active");
      const pickerMode = activeModeBtn?.dataset.mixPersonaMode || "template";
      window.CreationPersonaPicker.open({
        items: personaCatalog,
        productName,
        multiple: pickerMode === "template",
        maxSelected: 99,
        selectedIds: current,
        allowManual: true,
        mode: pickerMode,
        hideModeSwitch: true,
        description: pickerMode === "manual"
          ? "输入自定义人群并选择;可多选人群画像,可临时补充未入库人群。"
          : "从模板库多选人群画像,本次创作共同生效。",
        manualValues,
        onConfirm(personas) {
          const input = root.querySelector("[data-mix-audience]");
          const placeholder = root.querySelector("[data-mix-audience-placeholder]");
          const chips = root.querySelector("[data-mix-audience-chips]");
          const clearBtn = root.querySelector("[data-mix-audience-field] [data-persona-clear]");
          const trigger = root.querySelector("[data-mix-pick-audience]");
          const selected = (Array.isArray(personas) ? personas : [personas])
            .filter(Boolean)
            .filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
          const personaNames = selected.map(item => item.name || item.audience);
          if (input) {
            input.value = personaNames.join("、");
            input.dataset.personaId = selected[0]?.id || "";
            input.dataset.personaIds = selected.map(item => item.id).join("|");
          }
          if (selected.length) {
            if (placeholder) placeholder.hidden = true;
            if (chips) {
              chips.hidden = false;
              chips.innerHTML = personaNames.map(name => `<em class="mix-persona-chip">${escapeHtml(name)}</em>`).join("");
            }
            if (clearBtn) clearBtn.hidden = false;
            trigger?.classList.add("is-filled");
          } else {
            if (placeholder) placeholder.hidden = false;
            if (chips) { chips.hidden = true; chips.innerHTML = ""; }
            if (clearBtn) clearBtn.hidden = true;
            trigger?.classList.remove("is-filled");
          }
          showToast(`已应用 ${selected.length} 个人群画像`);
        }
      });
    }

    const MIX_PERSONA_AUDIENCES = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
    const MIX_PERSONA_GENDERS = ["不限", "女性", "男性"];
    const MIX_PERSONA_AGES = ["18-23", "24-30", "31-40", "41-50", "50+", "自定义"];

    function mixPersonaGroupTemplate(index) {
      return `<div class="mix-persona-group" data-mix-persona-group data-mix-persona-index="${index}">
        <div class="mix-persona-group-head"><span>人群 ${index + 1}</span>${index > 0 ? '<button type="button" class="mix-persona-group-remove" data-mix-persona-group-remove aria-label="删除该人群组">删除</button>' : ""}</div>
        <div class="mix-persona-fields">
          <div class="mix-persona-field">
            <label>核心目标人群 <em class="mix-persona-required">*</em></label>
            <div class="mix-persona-chips-row" data-mix-audience-chips>${MIX_PERSONA_AUDIENCES.map(value => `<button type="button" class="mix-persona-pill${value === "精致妈妈" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="mix-persona-field">
            <label>性别 <em class="mix-persona-required">*</em></label>
            <div class="mix-persona-chips-row" data-mix-gender-chips>${MIX_PERSONA_GENDERS.map(value => `<button type="button" class="mix-persona-pill${value === "不限" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="mix-persona-field">
            <label>年龄 <em class="mix-persona-required">*</em></label>
            <div class="mix-persona-chips-row" data-mix-age-chips>${MIX_PERSONA_AGES.map(value => `<button type="button" class="mix-persona-pill${value === "24-30" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}<div class="mix-persona-custom-age" data-mix-custom-age hidden><input type="number" data-mix-age-min min="1" max="99" placeholder="最小"><i>至</i><input type="number" data-mix-age-max min="1" max="99" placeholder="最大"></div></div>
          </div>
          <div class="mix-persona-field mix-persona-field-text">
            <label>人群核心痛点 <button type="button" class="mix-persona-ai-action" data-mix-ai-suggest="pain">AI 换一组</button></label>
            <textarea data-mix-audience-pain placeholder="一行一个人群核心痛点"></textarea>
          </div>
          <div class="mix-persona-field mix-persona-field-text">
            <label>使用场景 <button type="button" class="mix-persona-ai-action" data-mix-ai-suggest="scene">AI 换一组</button></label>
            <textarea data-mix-audience-scenes placeholder="一行一个使用场景"></textarea>
          </div>
        </div>
      </div>`;
    }

    function setMixPersonaMode(root, mode) {
      const panels = root.querySelectorAll("[data-mix-persona-panel]");
      panels.forEach(panel => { panel.hidden = panel.dataset.mixPersonaPanel !== mode; });
      root.querySelectorAll("[data-mix-persona-mode]").forEach(button => button.classList.toggle("active", button.dataset.mixPersonaMode === mode));
      const field = root.querySelector("[data-mix-audience-field]");
      if (field) field.dataset.mixPersonaMode = mode;
      if (mode === "manual") {
        const groups = root.querySelector("[data-mix-persona-groups]");
        if (groups && !groups.children.length) {
          groups.insertAdjacentHTML("beforeend", mixPersonaGroupTemplate(0));
          const fresh = groups.lastElementChild;
          if (fresh) bindMixPersonaGroupPills(fresh, root);
        }
        ensureMixAddPersonaBinding(root);
        ensureMixPersonaPanelInteractive(root);
      }
      syncMixManualPersonaSummary(root);
    }

    function appendMixPersonaGroup(root) {
      const groups = root.querySelector("[data-mix-persona-groups]");
      if (!groups) return;
      const index = groups.querySelectorAll("[data-mix-persona-group]").length;
      groups.insertAdjacentHTML("beforeend", mixPersonaGroupTemplate(index));
      const newGroup = groups.lastElementChild;
      if (newGroup) bindMixPersonaGroupPills(newGroup, root);
      newGroup?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      syncMixManualPersonaSummary(root);
    }

    function ensureMixAddPersonaBinding(root) {
      const button = root.querySelector("[data-mix-add-persona-group]");
      if (!button || button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        appendMixPersonaGroup(root);
      });
    }

    function syncMixManualPersonaSummary(root) {
      const field = root.querySelector("[data-mix-audience-field]");
      if (!field) return;
      const groups = field.querySelectorAll("[data-mix-persona-group]");
      const summaries = [];
      const personaIds = [];
      groups.forEach(group => {
        const audience = group.querySelector("[data-mix-audience-chips] .mix-persona-pill.active")?.dataset.value;
        const gender = group.querySelector("[data-mix-gender-chips] .mix-persona-pill.active")?.dataset.value || "不限";
        let age = group.querySelector("[data-mix-age-chips] .mix-persona-pill.active")?.dataset.value || "";
        if (age === "自定义") {
          const min = group.querySelector("[data-mix-age-min]")?.value;
          const max = group.querySelector("[data-mix-age-max]")?.value;
          if (min && max) age = `${min}–${max}`;
          else age = "";
        }
        if (audience) {
          const summary = age ? `${audience} / ${gender} / ${age}` : `${audience} / ${gender}`;
          summaries.push(summary);
          personaIds.push(`manual:${audience}:${age}`);
        }
      });
      const input = field.querySelector("[data-mix-audience]");
      if (input) {
        input.value = summaries.join(" | ");
        input.dataset.personaIds = personaIds.join("|");
      }
    }

    function applyMixManualAiSuggestion(group, type) {
      const samples = type === "pain"
        ? ["担心实际效果不稳定\n不想为日常问题反复花时间", "希望一次解决核心问题\n更在意使用过程是否省心"]
        : ["日常使用场景\n需要快速处理问题的即时场景", "周末集中使用场景\n家人共同使用的生活场景"];
      const key = `${type}Index`;
      const stored = Number(group.dataset[key] || 0);
      const index = stored % samples.length;
      const textarea = group.querySelector(type === "pain" ? "[data-mix-audience-pain]" : "[data-mix-audience-scenes]");
      if (textarea) textarea.value = samples[index];
      group.dataset[key] = String(stored + 1);
      const root = dynamicForm.querySelector(".mix-flow-form");
      syncMixManualPersonaSummary(root);
    }

    // 智能脚本：目标人群双模式（模板库 / 自行输入），结构与混剪一致
    const SCRIPT_PERSONA_AUDIENCES = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
    const SCRIPT_PERSONA_GENDERS = ["不限", "女性", "男性"];
    const SCRIPT_PERSONA_AGES = ["18-23", "24-30", "31-40", "41-50", "50+", "自定义"];

    function scriptPersonaGroupTemplate(index) {
      return `<div class="script-persona-group" data-script-persona-group data-script-persona-index="${index}">
        <div class="script-persona-group-head"><span>人群 ${index + 1}</span>${index > 0 ? '<button type="button" class="script-persona-group-remove" data-script-persona-group-remove aria-label="删除该人群组">删除</button>' : ""}</div>
        <div class="script-persona-fields">
          <div class="script-persona-field">
            <label>核心目标人群 <em class="script-persona-required">*</em></label>
            <div class="script-persona-chips-row" data-script-audience-chips>${SCRIPT_PERSONA_AUDIENCES.map(value => `<button type="button" class="script-persona-pill${value === "精致妈妈" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="script-persona-field">
            <label>性别 <em class="script-persona-required">*</em></label>
            <div class="script-persona-chips-row" data-script-gender-chips>${SCRIPT_PERSONA_GENDERS.map(value => `<button type="button" class="script-persona-pill${value === "不限" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="script-persona-field">
            <label>年龄 <em class="script-persona-required">*</em></label>
            <div class="script-persona-chips-row" data-script-age-chips>${SCRIPT_PERSONA_AGES.map(value => `<button type="button" class="script-persona-pill${value === "24-30" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}<div class="script-persona-custom-age" data-script-custom-age hidden><input type="number" data-script-age-min min="1" max="99" placeholder="最小"><i>至</i><input type="number" data-script-age-max min="1" max="99" placeholder="最大"></div></div>
          </div>
        </div>
      </div>`;
    }

    function setScriptPersonaMode(root, mode) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      if (!field) return;
      const panels = field.querySelectorAll("[data-script-persona-panel]");
      panels.forEach(panel => { panel.hidden = panel.dataset.scriptPersonaPanel !== mode; });
      field.querySelectorAll("[data-script-persona-mode]").forEach(button => {
        const active = button.dataset.scriptPersonaMode === mode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      field.dataset.scriptPersonaMode = mode;
      if (mode === "manual") {
        const groups = field.querySelector("[data-script-persona-groups]");
        if (groups && !groups.children.length) {
          groups.insertAdjacentHTML("beforeend", scriptPersonaGroupTemplate(0));
        }
        ensureScriptAddPersonaBinding(root);
      }
      syncScriptManualPersonaSummary(root);
    }

    function appendScriptPersonaGroup(root) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      if (!field) return;
      const groups = field.querySelector("[data-script-persona-groups]");
      if (!groups) return;
      const index = groups.querySelectorAll("[data-script-persona-group]").length;
      groups.insertAdjacentHTML("beforeend", scriptPersonaGroupTemplate(index));
      const newGroup = groups.lastElementChild;
      newGroup?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      syncScriptManualPersonaSummary(root);
    }

    function ensureScriptAddPersonaBinding(root) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      const button = field?.querySelector?.("[data-script-add-persona-group]");
      if (!button || button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        appendScriptPersonaGroup(root);
      });
    }

    function syncScriptManualPersonaSummary(root) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      if (!field) return;
      const groups = field.querySelectorAll("[data-script-persona-group]");
      const summaries = [];
      const personaIds = [];
      groups.forEach(group => {
        const audience = group.querySelector("[data-script-audience-chips] .script-persona-pill.active")?.dataset.value;
        const gender = group.querySelector("[data-script-gender-chips] .script-persona-pill.active")?.dataset.value || "不限";
        let age = group.querySelector("[data-script-age-chips] .script-persona-pill.active")?.dataset.value || "";
        if (age === "自定义") {
          const min = group.querySelector("[data-script-age-min]")?.value;
          const max = group.querySelector("[data-script-age-max]")?.value;
          if (min && max) age = `${min}–${max}`;
          else age = "";
        }
        if (audience) {
          const summary = age ? `${audience} / ${gender} / ${age}` : `${audience} / ${gender}`;
          summaries.push(summary);
          personaIds.push(`manual:${audience}:${age}`);
        }
      });
      const input = field.querySelector("[data-script-audience]");
      if (input) {
        input.value = summaries.join(" | ");
        input.dataset.personaIds = personaIds.join("|");
      }
    }


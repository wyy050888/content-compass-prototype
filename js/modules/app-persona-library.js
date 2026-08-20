    /* ── 人群画像模板：增删改查、编辑记录与 Agent 调用 ── */
    const personaCatalog = [
      { id:"persona-mom", name:"精致妈妈—母婴清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"女性", age:"24–30", pain:["孩子接触床褥后容易敏感不适","床单刚换仍担心深层毛发碎屑"], scenes:["宝宝家庭的床垫日常清洁","毛绒玩具和布艺沙发清洁"], usage:36, updated:"08-04 15:30" },
      { id:"persona-pet", name:"精致妈妈—养宠清洁人群", brand:"轻净", category:"清洁电器", product:"轻净 Pro 除螨仪", audience:"精致妈妈", gender:"不限", age:"31–40", pain:["宠物掉毛进入沙发和床褥缝隙","表面清理后仍有毛发碎屑"], scenes:["宠物活动区日常清洁","换季掉毛期的床褥与沙发清洁"], usage:24, updated:"08-04 11:18" },
      { id:"persona-whitecollar", name:"新锐白领—一人食效率人群", brand:"轻享", category:"厨房电器", product:"轻享空气炸锅 A8", audience:"新锐白领", gender:"不限", age:"24–30", pain:["下班晚，没有时间准备复杂晚餐","做饭后不想处理大量油污"], scenes:["工作日晚间一人食","朋友到家时快速准备小食"], usage:19, updated:"08-03 16:42" },
      { id:"persona-family", name:"资深中产—品质清洁人群", brand:"净界", category:"清洁电器", product:"净界洗地机 S5", audience:"资深中产", gender:"不限", age:"31–40", pain:["全屋清洁步骤多、耗时长","厨房和卫生间的干湿垃圾难一次处理"], scenes:["周末全屋深度清洁","餐后厨房地面即时清洁"], usage:17, updated:"08-02 10:15" },
      { id:"persona-general", name:"家庭日常清洁—通用人群", brand:"", category:"", product:"", audience:"精致妈妈", gender:"不限", age:"24–40", pain:["高频清洁后仍担心遗漏深层脏污","希望减少重复清洁和工具切换"], scenes:["工作日居家快速整理","卧室与客厅等家庭高频区域日常维护"], usage:12, updated:"08-05 10:20" }
    ];
    const personaHistories = {
      "persona-mom":[
        { time:"08-04 15:30", user:"嗡大发", field:"年龄", before:"25–35", after:"24–30" },
        { time:"08-03 17:12", user:"林运营", field:"人群核心痛点", before:"1 条", after:"2 条" }
      ],
      "persona-pet":[{ time:"08-04 11:18", user:"嗡大发", field:"使用场景", before:"1 条", after:"2 条" }],
      "persona-whitecollar":[{ time:"08-03 16:42", user:"林运营", field:"创建画像", before:"—", after:"新锐白领—一人食效率人群" }],
      "persona-family":[{ time:"08-02 10:15", user:"嗡大发", field:"创建画像", before:"—", after:"资深中产—品质清洁人群" }]
    };
    const personaFieldLabels = { name:"画像名称", product:"关联产品", audience:"抖音八大人群", gender:"性别", age:"年龄", pain:"人群核心痛点", scenes:"使用场景" };
    const personaTbody = document.getElementById("personaLibraryTbody");
    const personaEmpty = document.getElementById("personaLibraryEmpty");
    const personaModal = document.getElementById("personaTemplateModal");
    const personaHistoryModal = document.getElementById("personaHistoryModal");
    const personaDeleteModal = document.getElementById("personaDeleteModal");
    let editingPersonaId = "";
    let deletingPersonaId = "";

    function personaNow() {
      return new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
    }
    function personaProducts(persona) {
      if (!persona) return [];
      const product = Array.isArray(persona.linkedProducts) && persona.linkedProducts.length ? persona.linkedProducts[0] : persona.product;
      return product ? [product] : [];
    }
    function personaScope(persona) { return personaProducts(persona).join("、") || "通用"; }
    function personaLines(value) { return Array.isArray(value) ? value : String(value || "").split("\n").map(item => item.trim()).filter(Boolean); }
    function personaText(value) { return personaLines(value).join(" / ") || "—"; }
    function renderPersonaLibrary() {
      if (!personaTbody) return;
      const keyword = document.getElementById("personaLibrarySearch")?.value.trim().toLowerCase() || "";
      const product = document.getElementById("personaLibraryProductFilter")?.value || "all";
      const rows = personaCatalog.filter(persona => {
        const products = personaProducts(persona);
        const haystack = [persona.name, persona.audience, persona.gender, persona.age, ...products, ...persona.pain, ...persona.scenes].join(" ").toLowerCase();
        const inScope = product === "all" || (product === "universal" ? !products.length : (!products.length || products.includes(product)));
        return (!keyword || haystack.includes(keyword)) && inScope;
      });
      personaTbody.innerHTML = rows.map(persona => `<tr data-persona-row="${persona.id}">
        <td class="persona-name-cell"><strong>${escapeHtml(persona.name)}</strong><small>更新于 ${escapeHtml(persona.updated)}</small></td>
        <td><span class="persona-attribute-summary">${escapeHtml(persona.audience)}<br>${escapeHtml(persona.gender)} · ${escapeHtml(persona.age)}岁</span></td>
        <td class="lib-cell-text">${escapeHtml(personaText(persona.pain))}</td>
        <td class="lib-cell-text">${escapeHtml(personaText(persona.scenes))}</td>
        <td><span class="persona-scope-tag">${escapeHtml(personaScope(persona))}</span></td>
        <td>${persona.usage} 次</td>
        <td><div class="persona-row-actions"><button class="lib-link" type="button" data-persona-edit="${persona.id}">编辑</button><button class="lib-link" type="button" data-persona-history="${persona.id}">编辑记录</button><button class="lib-link" type="button" data-persona-copy="${persona.id}">复制</button><button class="lib-link danger" type="button" data-persona-delete="${persona.id}">删除</button></div></td>
      </tr>`).join("");
      if (personaEmpty) personaEmpty.hidden = rows.length > 0;
    }
    function setPersonaChoice(group, value) {
      const row = personaModal?.querySelector(`[data-persona-form-single="${group}"]`);
      if (!row) return;
      row.querySelectorAll(":scope > button").forEach(button => button.classList.toggle("active", button.textContent.trim() === value));
    }
    const personaAiSuggestions = {
      pain: [
        ["日常清洁频率高，但总担心遗漏深层脏污", "看似处理完成后，仍担心反复清洁带来额外负担"],
        ["家庭成员需求不同，清洁方式难以兼顾", "不希望花太多时间，却希望结果足够直观可靠"],
        ["高频使用物品容易积累脏污，表面处理不够安心", "工具切换和后续收纳增加日常家务负担"]
      ],
      scene: [
        ["工作日回家后的快速整理", "周末集中处理家庭高频使用区域"],
        ["家有孩子或宠物的日常清洁", "客厅、卧室等多人共用空间的定期维护"],
        ["换季整理和深度清洁前", "访客到家前的快速处理"]
      ]
    };
    const personaAiSuggestionIndex = { pain:0, scene:0 };
    async function refreshPersonaSuggestion(type, button) {
      const field = document.getElementById(type === "pain" ? "personaFormPain" : "personaFormScenes");
      const groups = personaAiSuggestions[type] || [];
      if (!field || !groups.length || button?.disabled) return;
      if (field.value.trim() && !confirm(`将替换当前${type === "pain" ? "人群核心痛点" : "使用场景"}，是否继续？`)) return;
      const originalLabel = button.textContent;
      button.disabled = true;
      button.textContent = "生成中…";
      await new Promise(resolve => setTimeout(resolve, 420));
      personaAiSuggestionIndex[type] = (personaAiSuggestionIndex[type] + 1) % groups.length;
      field.value = groups[personaAiSuggestionIndex[type]].join("\n");
      button.disabled = false;
      button.textContent = originalLabel;
      showToast("已换一组建议，可继续手动编辑");
    }
    function resetPersonaForm(persona = null) {
      document.getElementById("personaFormName").value = persona?.name || "";
      document.getElementById("personaFormProduct").value = personaProducts(persona)[0] || "";
      document.getElementById("personaFormPain").value = persona?.pain?.join("\n") || "";
      document.getElementById("personaFormScenes").value = persona?.scenes?.join("\n") || "";
      setPersonaChoice("audience", persona?.audience || "精致妈妈");
      setPersonaChoice("gender", persona?.gender || "不限");
      const standardAges = ["18–23", "24–30", "31–40", "41–50", "51+"];
      const age = persona?.age || "24–30";
      const custom = !standardAges.includes(age);
      setPersonaChoice("age", custom ? "自定义" : age);
      const customFields = personaModal?.querySelector("[data-persona-custom-age]");
      if (customFields) customFields.hidden = !custom;
      if (custom) {
        const parts = age.split(/[–-]/);
        document.getElementById("personaFormAgeMin").value = parts[0] || "25";
        document.getElementById("personaFormAgeMax").value = parts[1] || "35";
      }
    }
    function openPersonaModal(id = "") {
      editingPersonaId = id;
      const persona = personaCatalog.find(item => item.id === id) || null;
      document.getElementById("personaTemplateTitle").textContent = persona ? "编辑人群画像" : "新建人群画像";
      resetPersonaForm(persona);
      personaModal?.classList.add("show");
      setTimeout(() => document.getElementById("personaFormName")?.focus(), 50);
    }
    function closePersonaModal() { personaModal?.classList.remove("show"); editingPersonaId = ""; }
    function readPersonaForm() {
      const activeText = group => personaModal?.querySelector(`[data-persona-form-single="${group}"] > button.active`)?.textContent.trim() || "";
      let age = activeText("age");
      if (age === "自定义") age = `${document.getElementById("personaFormAgeMin").value || 18}–${document.getElementById("personaFormAgeMax").value || 35}`;
      const product = document.getElementById("personaFormProduct").value;
      return {
        name:document.getElementById("personaFormName").value.trim(), product, linkedProducts:product ? [product] : [],
        audience:activeText("audience"), gender:activeText("gender"), age,
        pain:personaLines(document.getElementById("personaFormPain").value), scenes:personaLines(document.getElementById("personaFormScenes").value)
      };
    }
    function personaComparable(value) { return Array.isArray(value) ? value.join("；") : String(value || ""); }
    function savePersonaTemplate() {
      const form = readPersonaForm();
      if (!form.name || !form.audience || !form.gender || !form.age) return showToast("请补全标记 * 的人群画像信息");
      if (!form.pain.length && !form.scenes.length) return showToast("请至少填写一条核心痛点或使用场景");
      const ageParts = form.age.split(/[–-]/).map(Number);
      if (ageParts.length === 2 && ageParts[0] > ageParts[1]) return showToast("年龄起始值不能大于结束值");
      const duplicate = personaCatalog.find(item => item.id !== editingPersonaId && item.name === form.name && personaScope(item) === personaScope(form));
      if (duplicate) return showToast("相同适用范围内已存在同名人群画像");
      const time = personaNow();
      if (editingPersonaId) {
        const index = personaCatalog.findIndex(item => item.id === editingPersonaId);
        const previous = personaCatalog[index];
        Object.keys(personaFieldLabels).forEach(key => {
          const before = personaComparable(previous[key]);
          const after = personaComparable(form[key]);
          if (before !== after) (personaHistories[editingPersonaId] ||= []).unshift({ time, user:"嗡大发", field:personaFieldLabels[key], before:before || "—", after:after || "—" });
        });
        const linkedProducts = form.product ? [form.product] : [];
        personaCatalog[index] = { ...previous, ...form, linkedProducts, product:linkedProducts[0] || "", updated:time };
        showToast("人群画像已更新；已在使用的任务仍保留原画像快照");
      } else {
        const id = `persona-${Date.now()}`;
        personaCatalog.unshift({ id, ...form, usage:0, updated:time });
        personaHistories[id] = [{ time, user:"嗡大发", field:"创建画像", before:"—", after:form.name }];
        showToast("人群画像已新增，可在创作中选择");
      }
      closePersonaModal();
      renderPersonaLibrary();
    }
    function openPersonaHistory(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      document.getElementById("personaHistoryTitle").textContent = `“${persona.name}”编辑记录`;
      const history = personaHistories[id] || [];
      document.getElementById("personaHistoryList").innerHTML = history.length ? history.map(item => `<article class="persona-history-item"><div class="persona-history-meta"><span>${escapeHtml(item.time)} · ${escapeHtml(item.user)}</span><span>${escapeHtml(item.field)}</span></div><div class="persona-history-change"><strong>${escapeHtml(item.field)}</strong><span>${escapeHtml(item.before)}</span><i>→</i><span>${escapeHtml(item.after)}</span></div></article>`).join("") : `<div class="persona-library-empty">暂无编辑记录</div>`;
      personaHistoryModal?.classList.add("show");
    }
    function copyPersona(id) {
      const source = personaCatalog.find(item => item.id === id);
      if (!source) return;
      const newId = `persona-${Date.now()}`;
      const time = personaNow();
      const copy = { ...source, id:newId, name:`${source.name}（副本）`, pain:[...source.pain], scenes:[...source.scenes], usage:0, updated:time };
      personaCatalog.unshift(copy);
      personaHistories[newId] = [{ time, user:"嗡大发", field:"复制画像", before:source.name, after:copy.name }];
      renderPersonaLibrary();
      showToast("人群画像已复制，可继续编辑");
    }
    function openPersonaDelete(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      deletingPersonaId = id;
      document.getElementById("personaDeleteTitle").textContent = `删除“${persona.name}”？`;
      const note = personaDeleteModal?.querySelector(".persona-delete-copy");
      if (note) note.textContent = persona.usage ? `该画像已被调用 ${persona.usage} 次。删除后无法继续用于新任务，历史会话和已生成资产仍保留当时使用的人群信息。` : "删除后无法继续用于新任务，历史会话和已生成资产仍保留当时使用的人群信息。";
      personaDeleteModal?.classList.add("show");
    }
    function closePersonaDelete() { personaDeleteModal?.classList.remove("show"); deletingPersonaId = ""; }

    document.getElementById("createPersonaTemplate")?.addEventListener("click", () => openPersonaModal());
    document.getElementById("personaLibrarySearch")?.addEventListener("input", renderPersonaLibrary);
    document.getElementById("personaLibraryProductFilter")?.addEventListener("change", renderPersonaLibrary);
    personaTbody?.addEventListener("click", event => {
      const edit = event.target.closest("[data-persona-edit]");
      const history = event.target.closest("[data-persona-history]");
      const copy = event.target.closest("[data-persona-copy]");
      const remove = event.target.closest("[data-persona-delete]");
      if (edit) openPersonaModal(edit.dataset.personaEdit);
      else if (history) openPersonaHistory(history.dataset.personaHistory);
      else if (copy) copyPersona(copy.dataset.personaCopy);
      else if (remove) openPersonaDelete(remove.dataset.personaDelete);
    });
    personaModal?.addEventListener("click", event => {
      if (event.target === personaModal || event.target.closest("[data-close-persona-modal]")) return closePersonaModal();
      const aiSuggest = event.target.closest("[data-persona-ai-suggest]");
      if (aiSuggest) { refreshPersonaSuggestion(aiSuggest.dataset.personaAiSuggest, aiSuggest); return; }
      const choice = event.target.closest("[data-persona-form-single] > button");
      if (!choice) return;
      const row = choice.parentElement;
      row.querySelectorAll(":scope > button").forEach(button => button.classList.toggle("active", button === choice));
      if (row.dataset.personaFormSingle === "age") {
        const custom = row.querySelector("[data-persona-custom-age]");
        if (custom) custom.hidden = !choice.matches("[data-persona-custom-age-trigger]");
      }
    });
    document.getElementById("savePersonaTemplate")?.addEventListener("click", savePersonaTemplate);
    document.querySelectorAll("[data-close-persona-history]").forEach(button => button.addEventListener("click", () => personaHistoryModal?.classList.remove("show")));
    personaHistoryModal?.addEventListener("click", event => { if (event.target === personaHistoryModal) personaHistoryModal.classList.remove("show"); });
    document.querySelectorAll("[data-close-persona-delete]").forEach(button => button.addEventListener("click", closePersonaDelete));
    personaDeleteModal?.addEventListener("click", event => { if (event.target === personaDeleteModal) closePersonaDelete(); });
    document.getElementById("confirmPersonaDelete")?.addEventListener("click", () => {
      const index = personaCatalog.findIndex(item => item.id === deletingPersonaId);
      if (index < 0) return closePersonaDelete();
      personaCatalog.splice(index, 1);
      delete personaHistories[deletingPersonaId];
      closePersonaDelete();
      renderPersonaLibrary();
      showToast("人群画像已删除，历史会话和生成资产未受影响");
    });

    function personaPickerProductContext() {
      return {
        name:dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || "",
        brand:dynamicForm.querySelector("[data-original-brand]")?.value.trim() || "",
        category:dynamicForm.querySelector("[data-original-category]")?.value.trim() || ""
      };
    }
    function isPersonaRecommended(persona, context) { return Boolean(!personaProducts(persona).length || (context.name && personaProducts(persona).includes(context.name))); }
    window.addEventListener("message", event => {
      const message = event.data || {};
      if (message.type !== "content-compass:persona-product-picker-open") return;
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      const items = Object.entries(productCatalog).map(([id, product]) => ({ id, ...product }));
      const selected = items.find(item => item.name === message.selectedProduct);
      window.CreationProductPicker.open({
        title:"关联产品",
        description:"选择后，该画像仅在这个产品的 AI 创作中展示。",
        items,
        selectedId:selected?.id || "",
        onConfirm(productId, product) {
          event.source?.postMessage({ type:"content-compass:persona-product-picker-selected", productName:product?.name || "" }, "*");
        }
      });
    });
    window.addEventListener("content-compass:persona-catalog-updated", event => {
      const records = Array.isArray(event.detail) ? event.detail : [];
      records.forEach(record => {
        if (!record?.id || !record.name) return;
        const [audience = "", gender = "不限"] = String(record.audience || "").split(" · ");
        const next = {
          id:record.id, name:record.name, audience, gender,
          age:String(record.age || "").replace(/岁$/, ""),
          pain:String(record.pain || "").split("；").filter(Boolean), scenes:String(record.scene || "").split("；").filter(Boolean),
          linkedProducts:Array.isArray(record.linkedProducts) && record.linkedProducts.length ? [record.linkedProducts[0]] : (record.product ? [record.product] : []), usage:Number(record.usage || 0),
          updated:String(record.updated || "").replace(/^嗡大发 · /, "")
        };
        const index = personaCatalog.findIndex(item => item.id === next.id);
        if (index > -1) personaCatalog[index] = { ...personaCatalog[index], ...next };
        else personaCatalog.unshift({ ...next, brand:"", category:"", product:next.linkedProducts[0] || "" });
      });
      renderPersonaLibrary();
    });
    function openPersonaTemplatePicker(picker) {
      if (!window.CreationPersonaPicker) {
        setFormFeedback("人群画像选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const mixRoot = dynamicForm.querySelector(".mix-flow-form");
      const mixProductId = mixRoot?.querySelector("[data-mix-product]")?.value || "";
      const isMix = picker.dataset.personaContext === "mix";
      const context = isMix
        ? { name:mixProductNames[mixProductId] || "", brand:"", category:"" }
        : personaPickerProductContext();
      const items = personaCatalog.map(persona => ({ ...persona, recommended:isPersonaRecommended(persona, context) }));
      if (isMix) {
        const current = String(mixRoot?.querySelector("[data-mix-audience]")?.dataset.personaIds || "").split("|").filter(Boolean);
        const manualValues = String(mixRoot?.querySelector("[data-mix-audience]")?.value || "").split("、").map(value => value.trim()).filter(Boolean)
          .filter(name => !personaCatalog.some(persona => persona.name === name || persona.audience === name));
        window.CreationPersonaPicker.open({
          items,
          productName: context.name,
          multiple: true,
          maxSelected: 3,
          selectedIds: current,
          allowManual: true,
          manualValues,
          onConfirm(personas) {
            const selected = (Array.isArray(personas) ? personas : [personas]).filter(Boolean)
              .filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
            const input = mixRoot?.querySelector("[data-mix-audience]");
            const label = mixRoot?.querySelector("[data-mix-audience-label]");
            const applied = picker.querySelector("[data-persona-applied]");
            const personaNames = selected.map(p => p.name || p.audience);
            if (input) {
              input.value = personaNames.join("、");
              input.dataset.personaId = selected[0]?.id || "";
              input.dataset.personaIds = selected.map(p => p.id).join("|");
            }
            if (label) {
              label.innerHTML = personaNames.length
                ? `<span class="mix-audience-summary"><span class="mix-audience-secondary-list">${personaNames.map(name => `<em>${escapeHtml(name)}</em>`).join("")}</span>${personaNames.length > 1 ? `<em class="mix-audience-more">+${personaNames.length - 1}</em>` : ""}</span>`
                : "请选择人群";
            }
            const selectedLabel = picker.querySelector("[data-persona-selected]");
            if (selectedLabel) selectedLabel.textContent = personaNames.length ? `已选 ${personaNames.length} 个人群画像` : "选择人群画像模板";
            if (applied) {
              applied.hidden = !personaNames.length;
              const span = applied.querySelector("span");
              if (span) span.textContent = personaNames.length ? `已应用：${personaNames.join("、")}` : "";
            }
            picker.dataset.personaId = selected[0]?.id || "";
            picker.dataset.personaIds = selected.map(p => p.id).join("|");
            showToast(`已应用 ${selected.length} 个人群画像`);
          }
        });
        return;
      }
      window.CreationPersonaPicker.open({
        items,
        productName: context.name,
        selectedId: picker.dataset.personaId || "",
        onConfirm(persona) {
          const source = personaCatalog.find(item => item.id === persona?.id);
          if (source) applyPersonaToCurrentForm(picker, source);
        }
      });
    }
    function activatePersonaChoice(row, text) {
      if (!row) return;
      row.querySelectorAll(".choice-chip, .audience-chip, .rewrite-audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === text));
    }
    function applyPersonaAge(persona, rewrite = false) {
      const role = rewrite ? "rewrite-age" : "age";
      const row = dynamicForm.querySelector(`[data-role="${role}"]`);
      if (!row) return;
      const standard = [...row.querySelectorAll(".choice-chip")].find(button => button.textContent.trim() === persona.age);
      const customTrigger = row.querySelector(rewrite ? "[data-rewrite-custom-age-trigger]" : "[data-custom-age-trigger]");
      const choice = standard || customTrigger;
      row.querySelectorAll(".choice-chip").forEach(button => button.classList.toggle("active", button === choice));
      const custom = row.querySelector(rewrite ? "[data-rewrite-custom-age]" : "[data-custom-age]");
      if (custom) custom.hidden = Boolean(standard);
      if (!standard) {
        const parts = persona.age.split(/[–-]/);
        const min = row.querySelector(rewrite ? "[data-rewrite-age-min]" : "[data-age-min]");
        const max = row.querySelector(rewrite ? "[data-rewrite-age-max]" : "[data-age-max]");
        if (min) min.value = parts[0] || "25";
        if (max) max.value = parts[1] || "35";
      }
    }
    function applyPersonaToCurrentForm(picker, persona) {
      if (picker.dataset.personaContext === "mix") {
        const root = dynamicForm.querySelector(".mix-flow-form");
        if (!root) return;
        const input = root.querySelector("[data-mix-audience]");
        if (input) { input.value = persona.name || persona.audience; input.dataset.personaId = persona.id; input.dataset.personaIds = persona.id; }
        renderMixAudienceEditor(root, [persona.name || persona.audience]);
        picker.dataset.personaId = persona.id;
        picker.querySelector("[data-persona-selected]").textContent = persona.name;
        const applied = picker.querySelector("[data-persona-applied]");
        applied.hidden = false;
        applied.querySelector("span").textContent = `已应用：${persona.name} · ${persona.audience} · ${persona.gender} · ${persona.age}岁`;
        return;
      }
      const rewrite = picker.dataset.personaContext === "rewrite";
      if (rewrite) {
        const box = dynamicForm.querySelector("[data-rewrite-audience-box]");
        box?.querySelectorAll(".rewrite-audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === persona.audience));
        activatePersonaChoice(dynamicForm.querySelector('[data-role="rewrite-gender"]'), persona.gender);
      } else {
        const box = dynamicForm.querySelector("[data-audience-box]");
        box?.querySelectorAll(".audience-chip").forEach(button => button.classList.toggle("active", button.textContent.trim() === persona.audience));
        activatePersonaChoice(dynamicForm.querySelector('[data-role="gender"]'), persona.gender);
      }
      applyPersonaAge(persona, rewrite);
      const pain = dynamicForm.querySelector('[data-field="pain"]');
      const scenes = dynamicForm.querySelector('[data-field="scenes"]');
      if (pain) pain.value = persona.pain.join("\n");
      if (scenes) scenes.value = persona.scenes.join("\n");
      if (rewrite) syncRewriteAudienceTarget();
      picker.dataset.personaId = persona.id;
      picker.querySelector("[data-persona-selected]").textContent = persona.name;
      const applied = picker.querySelector("[data-persona-applied]");
      applied.hidden = false;
      applied.querySelector("span").textContent = `已应用：${persona.name} · ${persona.audience} · ${persona.gender} · ${persona.age}岁`;
      creationContext.originalFields.personaTemplateId = persona.id;
      creationContext.originalFields.personaSnapshot = JSON.parse(JSON.stringify(persona));
      persona.usage += 1;
      renderPersonaLibrary();
      showToast("人群画像已回填，可继续修改本次任务字段");
    }
    function clearPersonaPicker(picker, notify = true) {
      delete picker.dataset.personaId;
      picker.querySelector("[data-persona-selected]").textContent = "选择人群画像模板";
      picker.querySelector("[data-persona-applied]").hidden = true;
      creationContext.originalFields.personaTemplateId = "";
      delete creationContext.originalFields.personaSnapshot;
      if (notify) showToast("已切换为自行输入，当前人群字段内容已保留");
    }
    function setPersonaPickerMode(picker, mode, notify = true) {
      const templateMode = mode === "template";
      picker.dataset.personaMode = mode;
      picker.querySelectorAll("[data-persona-source-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaSourceMode === mode));
      const templateSelect = picker.querySelector("[data-persona-template-select]");
      if (templateSelect) templateSelect.hidden = !templateMode;
      if (!templateMode) {
        window.CreationPersonaPicker?.close();
        clearPersonaPicker(picker, notify);
      } else if (notify) {
        showToast("请从模板库选择人群画像，选择后将回填本次任务字段");
      }
    }
    dynamicForm.addEventListener("click", event => {
      const sourceMode = event.target.closest("[data-persona-source-mode]");
      if (sourceMode) {
        const picker = sourceMode.closest("[data-persona-picker]");
        if (picker.dataset.personaMode !== sourceMode.dataset.personaSourceMode) setPersonaPickerMode(picker, sourceMode.dataset.personaSourceMode);
        return;
      }
      const trigger = event.target.closest("[data-persona-trigger]");
      if (trigger) {
        const picker = trigger.closest("[data-persona-picker]");
        openPersonaTemplatePicker(picker);
        return;
      }
      const clear = event.target.closest("[data-persona-clear]");
      if (clear) {
        const picker = clear.closest("[data-persona-picker]");
        if (picker) {
          setPersonaPickerMode(picker, "manual");
        } else {
          const field = clear.closest("[data-mix-audience-field]");
          const root = field ? dynamicForm.querySelector(".mix-flow-form") : null;
          if (field && root) {
            const input = field.querySelector("[data-mix-audience]");
            const placeholder = field.querySelector("[data-mix-audience-placeholder]");
            const chips = field.querySelector("[data-mix-audience-chips]");
            const trigger = field.querySelector("[data-mix-pick-audience]");
            if (input) { input.value = ""; delete input.dataset.personaId; delete input.dataset.personaIds; }
            if (placeholder) placeholder.hidden = false;
            if (chips) { chips.hidden = true; chips.innerHTML = ""; }
            if (clear) clear.hidden = true;
            trigger?.classList.remove("is-filled");
          }
        }
      }
    });
    renderPersonaLibrary();


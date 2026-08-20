

    // merged: 模板库页签切换
    document.querySelectorAll("[data-lib-tab]").forEach(button => button.addEventListener("click", () => {
      const scope = button.closest("#page-template-library");
      if (!scope) return;
      scope.querySelectorAll("[data-lib-tab]").forEach(item => item.classList.toggle("active", item === button));
      scope.querySelectorAll("[data-lib-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.libPanel === button.dataset.libTab));
    }));

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
    const personaTime = (value, detailed = false) => { const match=String(value||"").match(/(?:(\d{4})[-/])?(\d{2})[-/](\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/); if(!match)return value||"—"; const [,year,month,day,hour,minute,second="00"]=match; return `${year&&Number(year)!==2026?`${year}/`:""}${month}/${day} ${hour}:${minute}${detailed?`:${second}`:""}`; };
    const personaEmpty = document.getElementById("personaLibraryEmpty");
    const personaModal = document.getElementById("personaTemplateModal");
    const personaHistoryModal = document.getElementById("personaHistoryModal");
    const personaDeleteModal = document.getElementById("personaDeleteModal");
    let editingPersonaId = "";
    let copyingPersonaId = "";
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
    function personaScopeHtml(persona) { const products = personaProducts(persona); if (!products.length) return '<span class="persona-scope-tag universal">通用</span>'; return `<span class="persona-scope-tag" title="${escapeHtml(products[0])}">${escapeHtml(products[0])}</span>`; }
    function setPersonaProduct(productName = "") {
      const input = document.getElementById("personaFormProduct");
      const label = document.querySelector("[data-persona-product-label]");
      if (input) input.value = productName;
      if (label) label.textContent = productName || "选择关联产品";
      setPersonaProductMode(productName ? "linked" : "universal");
    }
    function setPersonaProductMode(mode) {
      const normalized = mode === "linked" ? "linked" : "universal";
      personaModal?.querySelectorAll("[data-persona-product-mode]").forEach(button => {
        const active = button.dataset.personaProductMode === normalized;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      personaModal?.querySelectorAll("[data-persona-product-panel]").forEach(panel => {
        panel.hidden = panel.dataset.personaProductPanel !== normalized;
      });
      if (normalized === "universal") {
        const input = document.getElementById("personaFormProduct");
        const label = document.querySelector("[data-persona-product-label]");
        if (input) input.value = "";
        if (label) label.textContent = "选择关联产品";
      }
    }
    function personaLines(value) { return Array.isArray(value) ? value : String(value || "").split("\n").map(item => item.trim()).filter(Boolean); }
    function personaText(value) { return personaLines(value).join(" / ") || "—"; }
    function personaCellHtml(value) { const lines = personaLines(value); return lines.length ? lines.map(line => `<span class="persona-cell-line">${escapeHtml(line)}</span>`).join("") : "—"; }
    function renderPersonaLibrary() {
      if (!personaTbody) return;
      const keyword = document.getElementById("personaLibrarySearch")?.value.trim().toLowerCase() || "";
      const scope = document.getElementById("personaLibraryScopeFilter")?.value || "all";
      const rows = personaCatalog.filter(persona => {
        const products = personaProducts(persona);
        const haystack = [persona.name, persona.audience, persona.gender, persona.age, ...products, ...persona.pain, ...persona.scenes].join(" ").toLowerCase();
        const inScope = scope === "all" || (scope === "universal" ? !products.length : products.length > 0);
        return (!keyword || haystack.includes(keyword)) && inScope;
      });
      personaTbody.innerHTML = rows.map(persona => `<tr data-persona-row="${persona.id}">
        <td class="persona-name-cell"><strong>${escapeHtml(persona.name)}</strong></td>
        <td><span class="persona-attribute-summary">${escapeHtml(persona.audience)}<br>${escapeHtml(persona.gender)} · ${escapeHtml(persona.age)}岁</span></td>
        <td class="lib-cell-text">${personaCellHtml(persona.pain)}</td>
        <td class="lib-cell-text">${personaCellHtml(persona.scenes)}</td>
        <td>${personaScopeHtml(persona)}</td>
        <td><span class="persona-attribute-summary">嗡大发<br>${escapeHtml(personaTime(persona.created || '08/01 10:20'))}</span></td>
        <td><span class="persona-attribute-summary">嗡大发<br>${escapeHtml(personaTime(persona.updated))}</span></td>
        <td>${persona.usage} 次</td>
        <td><div class="persona-row-actions"><button class="lib-link" type="button" data-persona-edit="${persona.id}">编辑</button><button class="lib-link" type="button" data-persona-history="${persona.id}">查看变更</button><button class="lib-link" type="button" data-persona-copy="${persona.id}">复制</button><button class="lib-link danger" type="button" data-persona-delete="${persona.id}">删除</button></div></td>
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
        ["日常清洁频率高，但总担心遗漏深层脏污", "看似处理完成后，仍担心反复清洁带来额外负担", "希望清洁结果能被直接看见，而不是凭感觉判断"],
        ["家庭成员需求不同，清洁方式难以兼顾", "不希望花太多时间，却希望结果足够直观可靠", "工具切换和后续收纳会增加日常家务负担"],
        ["高频使用物品容易积累脏污，表面处理不够安心", "担心清洁过程复杂，难以长期坚持", "希望一次处理多个高频区域，减少重复劳动"]
      ],
      scene: [
        ["工作日回家后的快速整理", "周末集中处理家庭高频使用区域", "换季整理和深度清洁前"],
        ["家有孩子或宠物的日常清洁", "客厅、卧室等多人共用空间的定期维护", "访客到家前的快速处理"],
        ["床褥、沙发等布艺的定期维护", "做饭或用餐后的快速收拾", "多人共用区域的集中清洁"]
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
      showToast("已生成 3 条新建议，可继续手动编辑");
    }
    function resetPersonaForm(persona = null) {
      document.getElementById("personaFormName").value = persona?.name || "";
      setPersonaProduct(personaProducts(persona)[0] || "");
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
    function personaCopyName(sourceName) {
      const base = String(sourceName || "未命名画像").replace(/（副本(?: \d+)?）$/, "");
      let index = 1;
      let name = `${base}（副本）`;
      const names = new Set(personaCatalog.map(item => item.name));
      while (names.has(name)) name = `${base}（副本 ${++index}）`;
      return name;
    }
    function openPersonaModal(id = "", mode = "edit") {
      const isCopy = mode === "copy";
      const persona = personaCatalog.find(item => item.id === id) || null;
      editingPersonaId = isCopy ? "" : id;
      copyingPersonaId = isCopy ? id : "";
      document.getElementById("personaTemplateTitle").textContent = isCopy ? "复制人群画像" : persona ? "编辑人群画像" : "新建人群画像";
      const saveButton = document.getElementById("savePersonaTemplate");
      if (saveButton) saveButton.textContent = isCopy ? "确认复制" : "保存画像";
      resetPersonaForm(persona);
      if (isCopy && persona) document.getElementById("personaFormName").value = personaCopyName(persona.name);
      personaModal?.classList.add("show");
      setTimeout(() => document.getElementById("personaFormName")?.focus(), 50);
    }
    function closePersonaModal() { personaModal?.classList.remove("show"); editingPersonaId = ""; copyingPersonaId = ""; }
    function readPersonaForm() {
      const activeText = group => personaModal?.querySelector(`[data-persona-form-single="${group}"] > button.active`)?.textContent.trim() || "";
      let age = activeText("age");
      if (age === "自定义") age = `${document.getElementById("personaFormAgeMin").value || 18}–${document.getElementById("personaFormAgeMax").value || 35}`;
      const product = document.getElementById("personaFormProduct").value;
      return {
        name:document.getElementById("personaFormName").value.trim(), product,
        linkedProducts:product ? [product] : [],
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
        const source = personaCatalog.find(item => item.id === copyingPersonaId);
        personaCatalog.unshift({ id, ...form, usage:0, created:time, updated:time });
        personaHistories[id] = [{ time, user:"嗡大发", field:source ? "复制画像" : "创建画像", before:source?.name || "—", after:form.name }];
        showToast(source ? "人群画像已复制" : "人群画像已新增，可在创作中选择");
      }
      closePersonaModal();
      renderPersonaLibrary();
    }
    function openPersonaHistory(id) {
      const persona = personaCatalog.find(item => item.id === id);
      if (!persona) return;
      document.getElementById("personaHistoryTitle").textContent = `“${persona.name}”修改记录`;
      const history = personaHistories[id] || [];
      document.getElementById("personaHistoryList").innerHTML = `<p class="persona-history-owner">创建：嗡大发 · ${escapeHtml(personaTime(persona.created || '08/01 10:20', true))}　｜　最近修改：嗡大发 · ${escapeHtml(personaTime(persona.updated, true))}</p>` + (history.length ? history.map(item => `<article class="persona-history-item"><div class="persona-history-meta"><span>${escapeHtml(personaTime(item.time, true))} · ${escapeHtml(item.user)}</span><span>${escapeHtml(item.field)}</span></div><div class="persona-history-change"><strong>${escapeHtml(item.field)}</strong><span>${escapeHtml(item.before)}</span><i>→</i><span>${escapeHtml(item.after)}</span></div></article>`).join("") : `<div class="persona-library-empty">暂无修改记录</div>`);
      personaHistoryModal?.classList.add("show");
    }
    function copyPersona(id) {
      const source = personaCatalog.find(item => item.id === id);
      if (!source) return;
      openPersonaModal(id, "copy");
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

    const canvasTemplateModal = document.getElementById("canvasTemplateModal");
    const canvasTemplateDeleteModal = document.getElementById("canvasTemplateDeleteModal");
    const canvasTemplateGrid = document.querySelector('[data-lib-panel="canvas"] .canvas-grid');
    let editingCanvasTemplateCard = null;
    let deletingCanvasTemplateCard = null;
    function canvasTemplateActions(card, locked = false) {
      card.querySelector(".canvas-template-actions")?.remove();
      card.insertAdjacentHTML("beforeend", `<div class="canvas-template-actions"><button type="button" data-edit-canvas-template>编辑</button>${locked ? '<button class="locked" type="button" data-locked-canvas-template title="内置教程模板不可删除">内置模板 · 不可删除</button>' : '<button class="danger" type="button" data-delete-canvas-template>删除</button>'}</div>`);
    }
    function decorateCanvasTemplates() {
      canvasTemplateGrid?.querySelectorAll(":scope > .canvas-card").forEach((card,index) => {
        card.dataset.canvasTemplate = card.dataset.canvasTemplate || `builtin-${index + 1}`;
        const tutorial = card.querySelector(".canvas-badge")?.textContent.trim() === "教程";
        card.dataset.builtinTutorial = String(tutorial);
        if (tutorial && !card.querySelector(".canvas-built-in-badge")) card.querySelector(".canvas-header")?.insertAdjacentHTML("beforeend", '<span class="canvas-built-in-badge">内置教程</span>');
        canvasTemplateActions(card, tutorial);
      });
    }
    function openCanvasTemplateEditor(card = null) {
      editingCanvasTemplateCard = card;
      document.getElementById("canvasTemplateModalTitle").textContent = card ? "编辑画板模板" : "保存为画板模板";
      document.getElementById("canvasTemplateName").value = card?.querySelector(".canvas-header strong")?.textContent.trim() || "";
      document.getElementById("canvasTemplateType").value = card?.querySelector(".canvas-badge")?.textContent.trim() || "TVC";
      document.getElementById("canvasTemplateDescription").value = card?.querySelector(".canvas-desc")?.textContent.trim() || "";
      canvasTemplateModal?.classList.add("show");
      setTimeout(() => document.getElementById("canvasTemplateName")?.focus(), 30);
    }
    function closeCanvasTemplateEditor() { editingCanvasTemplateCard = null; canvasTemplateModal?.classList.remove("show"); }
    function closeCanvasTemplateDelete() { deletingCanvasTemplateCard = null; canvasTemplateDeleteModal?.classList.remove("show"); }

    document.getElementById("createPersonaTemplate")?.addEventListener("click", () => openPersonaModal());
    document.getElementById("personaFormProductTrigger")?.addEventListener("click", () => {
      window.parent?.postMessage({ type:"content-compass:persona-product-picker-open", selectedProduct:document.getElementById("personaFormProduct")?.value || "" }, "*");
    });
    document.getElementById("saveTemplateButton")?.addEventListener("click", () => {
      const activeTab = document.querySelector("#templateLibTabs [data-lib-tab].active")?.dataset.libTab;
      if (activeTab === "prompt") openPromptLibraryEditor();
      else if (activeTab === "persona") openPersonaModal();
      else if (activeTab === "canvas") openCanvasTemplateEditor();
      else showToast("请在当前模板类型中完成保存");
    });
    canvasTemplateGrid?.addEventListener("click", event => {
      const card = event.target.closest("[data-canvas-template]");
      if (!card) return;
      if (event.target.closest("[data-edit-canvas-template]")) return openCanvasTemplateEditor(card);
      if (event.target.closest("[data-locked-canvas-template]")) return showToast("内置教程模板不可删除");
      if (event.target.closest("[data-delete-canvas-template]")) {
        deletingCanvasTemplateCard = card;
        document.getElementById("deleteCanvasTemplateName").textContent = card.querySelector(".canvas-header strong")?.textContent.trim() || "该模板";
        canvasTemplateDeleteModal?.classList.add("show");
      }
    });
    document.getElementById("saveCanvasTemplate")?.addEventListener("click", () => {
      const name = document.getElementById("canvasTemplateName")?.value.trim() || "";
      if (!name) return showToast("请输入画板模板名称");
      const type = document.getElementById("canvasTemplateType")?.value || "自定义";
      const description = document.getElementById("canvasTemplateDescription")?.value.trim() || "基于当前无限画布保存的可复用节点结构。";
      if (editingCanvasTemplateCard) {
        editingCanvasTemplateCard.querySelector(".canvas-header strong").textContent = name;
        editingCanvasTemplateCard.querySelector(".canvas-badge").textContent = type;
        editingCanvasTemplateCard.querySelector(".canvas-desc").textContent = description;
        showToast("画板模板已更新");
      } else {
        const card = document.createElement("article");
        card.className = "canvas-card";
        card.dataset.canvasTemplate = `custom-${Date.now()}`;
        card.dataset.builtinTutorial = "false";
        card.innerHTML = `<div class="canvas-cover"><div class="canvas-cover-inner" style="background:linear-gradient(135deg,#625bd5,#a8a3ee);"><span>${escapeHtml(type)}</span></div></div><div class="canvas-meta"><div class="canvas-header"><strong>${escapeHtml(name)}</strong><span class="canvas-badge">${escapeHtml(type)}</span></div><p class="canvas-desc">${escapeHtml(description)}</p><div class="canvas-footer"><span class="canvas-stat">当前画布节点</span><span class="canvas-stat">使用 0</span></div></div>`;
        canvasTemplateActions(card, false);
        canvasTemplateGrid?.prepend(card);
        showToast("当前画布已保存为模板");
      }
      closeCanvasTemplateEditor();
    });
    document.getElementById("confirmDeleteCanvasTemplate")?.addEventListener("click", () => {
      if (!deletingCanvasTemplateCard) return;
      if (deletingCanvasTemplateCard.dataset.builtinTutorial === "true") { closeCanvasTemplateDelete(); return showToast("内置教程模板不可删除"); }
      deletingCanvasTemplateCard.remove();
      closeCanvasTemplateDelete();
      showToast("画板模板已删除");
    });
    document.querySelectorAll("[data-close-canvas-template]").forEach(button => button.addEventListener("click", closeCanvasTemplateEditor));
    document.querySelectorAll("[data-close-canvas-template-delete]").forEach(button => button.addEventListener("click", closeCanvasTemplateDelete));
    canvasTemplateModal?.addEventListener("click", event => { if (event.target === canvasTemplateModal) closeCanvasTemplateEditor(); });
    canvasTemplateDeleteModal?.addEventListener("click", event => { if (event.target === canvasTemplateDeleteModal) closeCanvasTemplateDelete(); });
    decorateCanvasTemplates();
    document.getElementById("personaLibrarySearch")?.addEventListener("input", renderPersonaLibrary);
    document.getElementById("personaLibraryScopeFilter")?.addEventListener("change", renderPersonaLibrary);
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
      const productMode = event.target.closest("[data-persona-product-mode]");
      if (productMode) { setPersonaProductMode(productMode.dataset.personaProductMode); return; }
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
    function isPersonaRecommended(persona, context) { return Boolean((context.name && personaProducts(persona).includes(context.name)) || (context.category && persona.category === context.category) || (context.brand && persona.brand === context.brand)); }
    function renderPersonaPickerOptions(picker, keyword = "") {
      const host = picker.querySelector("[data-persona-options]");
      if (!host) return;
      const context = personaPickerProductContext();
      const term = keyword.trim().toLowerCase();
      const rows = personaCatalog.filter(persona => !term || [persona.name, persona.audience, persona.gender, persona.age, ...persona.pain, ...persona.scenes].join(" ").toLowerCase().includes(term)).sort((a,b) => Number(isPersonaRecommended(b,context)) - Number(isPersonaRecommended(a,context)));
      host.innerHTML = rows.length ? rows.map(persona => `<button class="persona-picker-option" type="button" data-persona-option="${persona.id}"><span><strong>${escapeHtml(persona.name)}</strong><small>${escapeHtml(persona.audience)} · ${escapeHtml(persona.gender)} · ${escapeHtml(persona.age)}岁</small></span>${isPersonaRecommended(persona,context) ? `<em class="persona-recommended">推荐</em>` : ""}</button>`).join("") : `<div class="persona-picker-empty">没有匹配的人群画像</div>`;
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
      picker.querySelector("[data-persona-selected]").textContent = "搜索或选择人群画像";
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
        picker.classList.remove("open");
        picker.querySelector("[data-persona-dropdown]").hidden = true;
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
        const opening = !picker.classList.contains("open");
        dynamicForm.querySelectorAll("[data-persona-picker].open").forEach(item => { item.classList.remove("open"); item.querySelector("[data-persona-dropdown]").hidden = true; });
        picker.classList.toggle("open", opening);
        picker.querySelector("[data-persona-dropdown]").hidden = !opening;
        if (opening) { renderPersonaPickerOptions(picker); setTimeout(() => picker.querySelector("[data-persona-search]")?.focus(), 0); }
        return;
      }
      const option = event.target.closest("[data-persona-option]");
      if (option) {
        const picker = option.closest("[data-persona-picker]");
        const persona = personaCatalog.find(item => item.id === option.dataset.personaOption);
        if (persona) applyPersonaToCurrentForm(picker, persona);
        picker.classList.remove("open"); picker.querySelector("[data-persona-dropdown]").hidden = true;
        return;
      }
      const clear = event.target.closest("[data-persona-clear]");
      if (clear) {
        const picker = clear.closest("[data-persona-picker]");
        setPersonaPickerMode(picker, "manual");
      }
    });
    dynamicForm.addEventListener("input", event => {
      if (event.target.matches("[data-persona-search]")) renderPersonaPickerOptions(event.target.closest("[data-persona-picker]"), event.target.value);
    });
    document.addEventListener("click", event => {
      if (event.target.closest("[data-persona-picker]")) return;
      dynamicForm.querySelectorAll("[data-persona-picker].open").forEach(picker => { picker.classList.remove("open"); picker.querySelector("[data-persona-dropdown]").hidden = true; });
    });
    renderPersonaLibrary();

    // ── 文案库 ──
    const clData = [
      { id:"cl1", text:"99块钱！苏泊尔这个除螨仪，能把床垫里的螨虫全吸出来！以前 Cleaning 靠晒，现在三分钟吸完，孩子过敏少了。", product:"除螨仪", crowd:"宝妈/家庭", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 14:23:05", source:"AI" },
      { id:"cl2", text:"别再用烤箱预热了！苏泊尔空气炸锅，200度15分钟，鸡翅外酥里嫩，不用一滴油，少吃油不长胖。", product:"空气炸锅", crowd:"年轻白领", structure:[{t:"compare",l:"对比"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:154, duration:28, updated:"08-04 11:07:42", source:"AI" },
      { id:"cl3", text:"苏泊尔洗地机，吸拖洗一体，干湿垃圾一次搞定，清洁力提升3倍，省时省力更省心。", product:"洗地机", crowd:"家庭主妇", structure:[{t:"proof",l:"证据"},{t:"sell",l:"卖点"}], chars:168, duration:30, updated:"08-03 16:55:18", source:"导入" },
      { id:"cl4", text:"姐妹们！这个面霜我真的要用喇叭喊！干皮亲妈不是吹的，用完第二天脸嫩到想摸自己一百遍。核心成分玻色因+神经酰胺，修护屏障同时锁水保湿，质地像冰淇淋一样一抹就化。现在拍一发三，错过等半年！", product:"焕颜修护面霜", crowd:"干皮/敏感肌", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 09:45:11", source:"AI" },
      { id:"cl5", text:"你是不是买了一堆护肤品，结果该起皮还是起皮？因为你根本没修屏障！XXX专研屏障修护13年，这个精华水含5重神经酰胺，3秒吸收不粘腻。现在买正装送同款旅行装。", product:"屏障修护精华水", crowd:"屏障受损/混油皮", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:142, duration:24, updated:"08-03 20:30:18", source:"AI" },
      { id:"cl6", text:"夏天出门三件套：防晒+散粉+定妆喷雾。这款防晒SPF50+PA++++，关键是跟妆不搓泥，成膜之后哑光雾面感。今天直播间拍防晒送散粉小样。", product:"哑光防晒霜", crowd:"通勤/混油皮", structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:128, duration:22, updated:"08-03 15:22:45", source:"导入" },
      { id:"cl7", text:"给孩子挑枕头一定要看这三点：第一材质要透气，第二高度要可调，第三枕套要能拆洗。这款儿童乳胶枕，分段护颈设计，0-12岁都能用。", product:"儿童乳胶枕", crowd:"宝妈/3-12岁", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"scene",l:"场景"}], chars:144, duration:25, updated:"08-02 22:10:33", source:"AI" },
      { id:"cl8", text:"出差党看过来！这个折叠烧水壶只有一部手机大小，5分钟烧开，316不锈钢内胆。折叠后塞包里就走，再也不用酒店的水壶了。", product:"折叠烧水壶", crowd:"出差党/旅游", structure:[{t:"scene",l:"场景"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:120, duration:20, updated:"08-02 12:08:19", source:"AI" }
    ];

    const clChipInfo = {
      hook:   {cls:"cl-chip-hook",    txt:"钩子"},
      pain:   {cls:"cl-chip-pain",    txt:"痛点"},
      sell:   {cls:"cl-chip-sell",    txt:"卖点"},
      cta:    {cls:"cl-chip-cta",     txt:"逼单"},
      proof:  {cls:"cl-chip-proof",   txt:"信任"},
      scene:  {cls:"cl-chip-scene",   txt:"场景"},
      compare:{cls:"cl-chip-compare", txt:"对比"}
    };

    function clRenderChips(struct) {
      if (!struct || !struct.length) return '<span style="color:#888;font-size:11px;">-</span>';
      const parts = struct.map(s => {
        const info = clChipInfo[s.t] || {cls:"cl-chip-other", txt:s.l||s.t};
        return '<span class="cl-chip ' + info.cls + '">' + info.txt + '</span>';
      });
      // join with +
      let html = '';
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) html += '<span style="color:#888;margin:0 2px;">+</span>';
        html += parts[i];
      }
      return '<span class="cl-chips-text">' + html + '</span>';
    }

    function clRender(data) {
      const tbody = document.getElementById("clTbody");
      const empty = document.getElementById("clEmpty");
      if (!data.length) { tbody.innerHTML = ""; empty.hidden = false; return; }
      empty.hidden = true;
      tbody.innerHTML = data.map(r => {
        const chips = clRenderChips(r.structure);
        const isAI = r.source === "AI";
        const sourceTag = isAI ? '<span class="cl-source-tag ai">AI</span>' : '<span class="cl-source-tag import">人工导入</span>';
        const locateBtn = isAI ? '<button class="cl-act-btn" onclick="clLocate(\'' + r.id + '\')">定位至会话</button>' : '';
        const aiDropBtn = '<div class="cl-ai-drop"><button class="cl-ai-btn" onclick="clToggleAIMenu(event)">AI <span style="font-size:8px;">▼</span></button><div class="cl-ai-menu"><button onclick="clAIAction(&quot;rewrite&quot;,&quot;' + r.id + '&quot;)">智能改写</button><button onclick="clAIAction(&quot;clone&quot;,&quot;' + r.id + '&quot;)">爆款仿写</button><button onclick="clAIAction(&quot;script&quot;,&quot;' + r.id + '&quot;)">智能脚本</button><button onclick="clAIAction(&quot;remix&quot;,&quot;' + r.id + '&quot;)">智能混剪</button></div></div>';
        const delBtn = '<button class="cl-act-btn danger" onclick="clDelete(&quot;' + r.id + '&quot;)">删除</button>';
        const actBtns = [aiDropBtn, delBtn, locateBtn].filter(Boolean).join('');
        const escapedText = r.text.replace(/"/g, '&quot;');
        return '<tr>'
          + '<td class="cl-col-text"><span class="cl-copy-text" style="color:var(--ink)" title="' + escapedText + '">' + r.text + '</span></td>'
          + '<td>' + sourceTag + '</td>'
          + '<td>' + r.product + '</td>'
          + '<td>' + r.crowd + '</td>'
          + '<td class="cl-col-struct">' + chips + '</td>'
          + '<td class="cl-col-chars">' + r.chars + '字/' + r.duration + 's</td>'
          + '<td style="font-size:12px;">' + r.updated + '</td>'
          + '<td class="cl-col-act"><div class="cl-act-group">' + actBtns + '</div></td>'
          + '</tr>';
      }).join("");
    }

    function clCloseActionMenus() {
      document.querySelectorAll(".cl-ai-menu.show").forEach(m => m.classList.remove("show"));
      document.querySelectorAll(".cl-col-act.cl-menu-open").forEach(cell => cell.classList.remove("cl-menu-open"));
    }

    function clToggleAIMenu(e) {
      e.stopPropagation();
      const menu = e.target.closest(".cl-ai-drop").querySelector(".cl-ai-menu");
      const shouldOpen = !menu.classList.contains("show");
      clCloseActionMenus();
      if (shouldOpen) {
        menu.classList.add("show");
        menu.closest(".cl-col-act")?.classList.add("cl-menu-open");
      }
    }

    function clAIAction(action, id) {
      const labels = {rewrite:"智能改写", clone:"爆款仿写", script:"智能脚本", remix:"智能混剪"};
      showToast('「' + (labels[action]||action) + '」已创建任务，跳转至 AI 创作...');
      clCloseActionMenus();
      setTimeout(function() { document.querySelector('.nav-item[data-page="creation"]').click(); }, 600);
    }

    function clLocate(id) {
      const item = clData.find(function(r) { return r.id === id; });
      showToast("已定位至「" + item.product + "」的生成会话");
    }

    function clDelete(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!confirm('确定删除文案「' + item.product + '」？\n\n此操作不可撤销。')) return;
      const idx = clData.findIndex(function(r) { return r.id === id; });
      if (idx > -1) { clData.splice(idx, 1); }
      clFilterAndRender();
      showToast("文案已删除");
    }

    function clUpdateHeadStats() {
      const ai = clData.filter(function(r) { return r.source === "AI"; }).length;
      const imp = clData.filter(function(r) { return r.source === "导入"; }).length;
      const el = document.getElementById("clHeadStats");
      if (el) el.textContent = '共 ' + clData.length + ' 条 · AI生成 ' + ai + ' · 人工导入 ' + imp;
    }

    function clFilterAndRender() {
      const src = document.getElementById("clSourceFilter")?.value || "all";
      const kw = (document.getElementById("clSearchInput")?.value || "").trim().toLowerCase();
      let filtered = clData;
      if (src !== "all") filtered = filtered.filter(function(r) { return r.source === src; });
      if (kw) filtered = filtered.filter(function(r) { return r.text.toLowerCase().includes(kw) || r.product.toLowerCase().includes(kw) || r.crowd.toLowerCase().includes(kw); });
      clRender(filtered);
    }

    // 绑定 & 初始化
    (function() {
      const srcF = document.getElementById("clSourceFilter");
      const kwF = document.getElementById("clSearchInput");
      if (srcF) srcF.addEventListener("change", clFilterAndRender);
      if (kwF) kwF.addEventListener("input", clFilterAndRender);
      clRender(clData);
    })();

    document.addEventListener("click", clCloseActionMenus);
    const clImportBtn = document.getElementById("clImportBtn");
    if (clImportBtn) clImportBtn.addEventListener("click", () => showToast("导入文案功能开发中..."));

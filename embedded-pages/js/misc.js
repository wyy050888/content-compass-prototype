

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

    /* AI 生图：创意配置、竞品、提示词模板联动 */
    const promptLibraryFieldLabels = ["基础描述","构图方式","色调描述","标题文字","促销文案","卖点文案","文字设置","场景描述","LOGO规则","权益规则","反向提示词","其他限制"];
    const promptLibraryStorageKey = "content-compass-prompt-library-v1";
    const promptLibraryDefaults = [
      { id:"prompt-main-clean", title:"清洁电器结果型商品主图", category:"商品主图", description:"适用于除螨仪、吸尘器等清洁电器的结果可视化主图", createdAt:"2026-08-05", segments:[
        {label:"产品基本信息",value:"白色清洁电器主体，外观结构、按钮、品牌和产品比例保持准确。"},
        {label:"权益信息",value:"仅展示已审核的平台权益，不生成未经确认的价格与赠品。"},
        {label:"目标人群",value:"面向精致妈妈、养宠家庭和关注床褥卫生的人群。"},
        {label:"场景",value:"明亮整洁的卧室床褥清洁场景，柔和自然光，真实家庭环境。"},
        {label:"核心卖点",value:"突出深层清洁、拍吸同步和透明尘杯结果可视化。"},
        {label:"差异化卖点",value:"以真实尘杯结果建立清洁证据，与普通表面清扫形成差异。"},
        {label:"反向提示词",value:"禁止产品变形、品牌错字、乱码、虚假参数、夸大功效和主体遮挡。"}
      ]},
      { id:"prompt-detail-function", title:"功能拆解型详情页提示词", category:"商品详情图", description:"适合按功能模块生成电商详情页图片", createdAt:"2026-08-04", segments:[
        {label:"产品基本信息",value:"产品主体外观准确，保持统一机身颜色、结构和品牌识别。"},
        {label:"权益信息",value:"权益信息放在页面底部独立区域，避免干扰功能理解。"},
        {label:"目标人群",value:"面向关注参数、原理和使用效果的理性消费者。"},
        {label:"场景",value:"纯净浅色电商详情背景，功能原理与真实使用场景结合。"},
        {label:"核心卖点",value:"一张图片只解释一个功能，使用剖面、箭头或局部特写表现工作原理。"},
        {label:"差异化卖点",value:"用结构化对比呈现产品方案与传统方案的使用差异。"},
        {label:"反向提示词",value:"禁止信息拥挤、文字过小、错误参数、结构失真和无关装饰。"}
      ], modules:[
        {name:"首屏海报图",coreCopy:"深层清洁，一遍搞定",modulePrompt:"商品主体居中，浅色电商背景，大标题建立核心利益点，保持品牌与产品结构准确。"},
        {name:"核心卖点图",coreCopy:"高频拍打与强劲吸力同步完成",modulePrompt:"床褥剖面与气流可视化，局部特写展示拍打和吸尘路径，信息层级清晰。"},
        {name:"细节特写图",coreCopy:"透明尘杯，清洁结果看得见",modulePrompt:"透明尘杯近景特写，真实灰尘结果，柔和高光突出材质与可拆洗结构。"}
      ]},
      { id:"prompt-scene-home", title:"温馨家居场景生图", category:"场景图", description:"用于生成低饱和、自然光的家居使用场景", createdAt:"2026-08-03", segments:[
        {label:"产品基本信息",value:"产品作为画面主体，外观准确，材质细节清晰。"},
        {label:"权益信息",value:"场景图不展示价格与促销信息。"},
        {label:"目标人群",value:"面向追求品质生活的都市家庭与年轻妈妈。"},
        {label:"场景",value:"低饱和温馨家居空间，柔和自然窗光，真实生活状态，空间整洁但不过度棚拍。"},
        {label:"核心卖点",value:"通过产品与人物动作自然展示使用便利性。"},
        {label:"差异化卖点",value:"强调真实生活代入感与产品融入空间后的整体质感。"},
        {label:"反向提示词",value:"禁止过度磨皮、畸形手指、产品漂浮、透视错误、杂乱背景和品牌错字。"}
      ]}
    ];
    function loadPromptLibraryRecords() {
      try {
        const saved = JSON.parse(localStorage.getItem(promptLibraryStorageKey) || "null");
        if (Array.isArray(saved) && saved.length) return saved.map(record => {
          const fallback = promptLibraryDefaults.find(item => item.id === record.id);
          return record.category === "商品详情图" && !record.modules?.length && fallback?.modules ? { ...record, modules:fallback.modules } : record;
        });
        return promptLibraryDefaults;
      } catch (error) { return promptLibraryDefaults; }
    }
    let promptLibraryRecords = loadPromptLibraryRecords().filter(record => ["商品主图","商品详情图"].includes(record.category));
    promptLibraryRecords.filter(record => record.category === "商品主图" && !record.segments?.some(segment => promptLibraryFieldLabels.includes(segment.label))).forEach(record => { record.segments = [
      {label:"基础描述",value:"轻净 Pro 除螨仪，白色机身与透明尘杯，商品外观、结构和品牌信息准确。"},
      {label:"构图方式",value:"产品占比：主体占画面 45%–60%\n构图风格：电商主图居中构图，保留安全留白"},
      {label:"色调描述",value:"主色调：品牌蓝白\n辅助色：暖米色\n色彩对比：清爽高对比\n色彩情绪：洁净、可信"},
      {label:"标题文字",value:"大标题：强劲清洁，一遍搞定\n小标题：大吸力深层清洁，结果清晰可见"},
      {label:"促销文案",value:"仅使用已审核活动信息，不虚构价格、折扣或赠品。"},
      {label:"卖点文案",value:"突出深层清洁、拍吸同步和透明尘杯结果可视化。"},
      {label:"文字设置",value:"文字位置：左上安全区\n文字占比：不超过画面 25%"},
      {label:"场景描述",value:"场景类型：真实卧室床褥清洁\n场景颜色：柔和自然光\n场景特点：整洁、生活化\n使用场景：床垫、沙发、毛绒玩具"},
      {label:"LOGO规则",value:"LOGO清晰完整，使用标准品牌色，不变形、不遮挡。"},
      {label:"权益规则",value:"仅展示已审核权益，禁止未经证实的功效与承诺。"}
      ,{label:"反向提示词",value:"禁止产品变形、品牌错字、乱码、错误透视、主体遮挡和竞品标识。"}
      ,{label:"其他限制",value:"遵循平台安全区和合规要求，不使用未经确认的参数、价格、功效和承诺。"}
    ]; });
    promptLibraryRecords.filter(record => record.category === "商品主图").forEach(record => {
      if (!record.segments.some(segment => segment.label === "反向提示词")) record.segments.push({label:"反向提示词",value:"禁止产品变形、品牌错字、乱码、错误透视、主体遮挡和竞品标识。"});
      if (!record.segments.some(segment => segment.label === "其他限制")) record.segments.push({label:"其他限制",value:"遵循平台安全区和合规要求，不使用未经确认的参数、价格、功效和承诺。"});
    });
    ["商品主图","商品详情图"].forEach(category => {
      const records = promptLibraryRecords.filter(record => record.category === category);
      if (records.length && !records.some(record => record.isDefault)) records[0].isDefault = true;
      let kept = false;
      records.forEach(record => { if (record.isDefault && !kept) kept = true; else if (record.isDefault) record.isDefault = false; });
    });
    document.querySelectorAll('#promptLibraryCategoryFilter option, #promptLibraryCategoryInput option').forEach(option => { if (!["全部类型","商品主图","商品详情图"].includes(option.textContent.trim())) option.remove(); });
    try { localStorage.setItem(promptLibraryStorageKey, JSON.stringify(promptLibraryRecords)); } catch (error) {}
    let editingPromptLibraryId = "";
    let deletingPromptLibraryId = "";
    const promptLibraryEditModal = document.getElementById("promptLibraryEditModal");
    const promptLibraryDeleteModal = document.getElementById("promptLibraryDeleteModal");
    const promptLibraryPickerModal = document.getElementById("promptLibraryPickerModal");
    const savePromptTemplateModal = document.getElementById("savePromptTemplateModal");
    const promptLibraryPanel = document.querySelector("#promptLibraryGrid")?.closest(".prompt-library-panel");
    if (promptLibraryPanel && !document.getElementById("promptLibraryTypeTabs")) {
      promptLibraryPanel.insertAdjacentHTML("beforebegin", '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div class="prompt-library-type-tabs" id="promptLibraryTypeTabs"><button class="active" type="button" data-prompt-library-type="商品主图">主图模板</button><button type="button" data-prompt-library-type="商品详情图">详情图模板</button></div><button class="primary-btn" type="button" id="createPromptLibraryItem">＋ 新增提示词模板</button></div>');
      const categoryFilter = document.getElementById("promptLibraryCategoryFilter");
      if (categoryFilter) { categoryFilter.value = "商品主图"; categoryFilter.hidden = true; }
    }
    function persistPromptLibraryRecords() {
      try { localStorage.setItem(promptLibraryStorageKey, JSON.stringify(promptLibraryRecords)); } catch (error) {}
    }
    function promptSegmentsToText(segments) {
      return promptLibraryFieldLabels.map(label => {
        const segment = (segments || []).find(item => item.label === label);
        return label + "：" + (segment?.value || "");
      }).join("\n");
    }
    function parsePromptLibraryContent(content) {
      const result = new Map(promptLibraryFieldLabels.map(label => [label,""]));
      let activeLabel = "";
      String(content || "").split(/\n+/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const matched = promptLibraryFieldLabels.find(label => trimmed.startsWith(label + "：") || trimmed.startsWith(label + ":"));
        if (matched) {
          activeLabel = matched;
          result.set(matched, trimmed.slice(matched.length + 1).trim());
        } else if (activeLabel) result.set(activeLabel, (result.get(activeLabel) + " " + trimmed).trim());
      });
      return promptLibraryFieldLabels.map(label => ({ label, value:result.get(label) || "" }));
    }
    function promptLibraryPreview(record) {
      if (record.category === "商品详情图" && record.modules?.length) return record.modules.map(item => item.name + "：" + item.coreCopy).join("；");
      return (record.segments || []).filter(item => item.value).slice(0,3).map(item => item.label + "：" + item.value).join("；");
    }
    function detailPromptTemplateHtml(record) {
      return `<div class="prompt-detail-template-preview">${record.modules.slice(0,2).map((item,index) => `<div class="prompt-detail-template-module"><div><span>${index + 1}</span><strong>${escapeHtml(item.name)}</strong></div><p><b>模板文案</b>${escapeHtml(item.coreCopy || "待补充")}</p><p><b>提示词模块</b>场景描述 · 构图方式 · 反向提示词 · 其他限制</p></div>`).join("")}${record.modules.length > 2 ? `<div class="field-hint">另有 ${record.modules.length - 2} 个模块</div>` : ""}</div>`;
    }
    function structuredPromptTemplateHtml(record) {
      return `<div class="prompt-library-structured-preview">${promptLibraryFieldLabels.slice(0,4).map(label => {
        const value = record.segments?.find(item => item.label === label)?.value || "待补充";
        return `<div class="prompt-library-structured-item"><b>${escapeHtml(label)}</b><p title="${escapeHtml(value)}">${escapeHtml(value)}</p></div>`;
      }).join("")}<div class="field-hint" style="grid-column:1/-1">共 ${promptLibraryFieldLabels.length} 个结构化模块</div></div>`;
    }
    function renderPromptLibrary() {
      const grid = document.getElementById("promptLibraryGrid");
      if (!grid) return;
      const keyword = document.getElementById("promptLibrarySearch")?.value.trim().toLowerCase() || "";
      const category = document.getElementById("promptLibraryCategoryFilter")?.value || "all";
      const visible = promptLibraryRecords.filter(record => {
        const text = (record.title + " " + record.description + " " + promptLibraryPreview(record)).toLowerCase();
        return (!keyword || text.includes(keyword)) && (category === "all" || record.category === category);
      });
      grid.querySelectorAll("[data-prompt-library-card]").forEach(card => card.remove());
      visible.forEach(record => {
        const card = document.createElement("article");
        card.className = "prompt-library-card";
        card.dataset.promptLibraryCard = record.id;
        const body = record.category === "商品详情图" && record.modules?.length ? detailPromptTemplateHtml(record) : record.category === "商品主图" ? structuredPromptTemplateHtml(record) : `<div class="prompt-library-preview">${escapeHtml(promptLibraryPreview(record))}</div>`;
        card.innerHTML = `<div class="prompt-library-card-head"><div><strong>${escapeHtml(record.title)}</strong><small>${escapeHtml(record.description || "暂无描述")} · ${escapeHtml(record.createdAt || "刚刚")}</small></div><span class="prompt-library-category">${escapeHtml(record.category)}</span></div>${body}<div class="prompt-library-tags">${record.category === "商品详情图" && record.modules?.length ? record.modules.map(item => `<span>${escapeHtml(item.name)}</span>`).join("") : (record.segments || []).filter(item => item.value).map(item => `<span>${escapeHtml(item.label)}</span>`).join("")}</div><div class="prompt-library-actions"><label class="prompt-default-switch"><input type="radio" name="prompt-default-${escapeHtml(record.category)}" data-set-prompt-default ${record.isDefault ? "checked" : ""}><span></span>默认模板</label><button type="button" data-use-prompt-library>用于生图</button><button type="button" data-edit-prompt-library>编辑</button><button class="danger" type="button" data-delete-prompt-library>删除</button></div>`;
        grid.insertBefore(card, document.getElementById("promptLibraryEmpty"));
      });
      document.getElementById("promptLibraryEmpty")?.classList.toggle("show", visible.length === 0);
      const total = document.getElementById("promptLibraryTotal");
      const monthly = document.getElementById("promptLibraryMonthly");
      if (total) total.textContent = promptLibraryRecords.length;
      if (monthly) monthly.textContent = promptLibraryRecords.filter(record => String(record.createdAt || "").startsWith("2026-08")).length;
    }
    function togglePromptLibraryModal(modal, open) { modal?.classList.toggle("show", open); }
    function promptDetailEditorItem(module = {}, index = 0) {
      return `<div class="prompt-detail-editor-item" data-prompt-detail-editor-item><div class="prompt-detail-editor-item-head"><span>${index + 1}</span><input data-prompt-detail-name maxlength="40" value="${escapeHtml(module.name || `详情页模块 ${index + 1}`)}" placeholder="模块名称"><div><button class="prompt-detail-toggle" type="button" data-toggle-prompt-detail-editor>编辑</button><button type="button" data-move-prompt-detail-editor="up" title="上移">↑</button><button type="button" data-move-prompt-detail-editor="down" title="下移">↓</button><button class="danger" type="button" data-remove-prompt-detail-editor title="删除">×</button></div></div><div class="prompt-detail-editor-fields"><section class="detail-template-copy-block"><strong>文案模块</strong><label>模板文案<textarea data-prompt-detail-core placeholder="填写画面需要展示的标题、卖点和说明文案">${escapeHtml(module.coreCopy || "")}</textarea></label></section><section class="detail-template-prompt-block"><strong>提示词模块</strong><label>场景描述<textarea data-prompt-detail-scene placeholder="填写场景空间、色彩、光线与氛围">${escapeHtml(module.promptParts?.scene || "")}</textarea></label><label>构图方式<textarea data-prompt-detail-composition placeholder="填写主体位置、景别、信息层级与留白">${escapeHtml(module.promptParts?.composition || module.modulePrompt || "")}</textarea></label><label>反向提示词<textarea data-prompt-detail-negative placeholder="填写禁止出现的元素与错误">${escapeHtml(module.promptParts?.negative || "禁止产品变形、错字、乱码和错误参数")}</textarea></label><label>其他限制<textarea data-prompt-detail-other placeholder="填写平台、尺寸、品牌和合规限制">${escapeHtml(module.promptParts?.other || "遵循平台安全区，仅使用已确认商品事实")}</textarea></label></section></div></div>`;
    }
    function refreshPromptDetailEditorOrder() {
      document.querySelectorAll("#promptLibraryDetailModuleList [data-prompt-detail-editor-item]").forEach((item,index) => { item.querySelector(".prompt-detail-editor-item-head > span").textContent = index + 1; });
    }
    function renderPromptDetailEditor(modules = []) {
      const list = document.getElementById("promptLibraryDetailModuleList");
      if (!list) return;
      const records = modules.length ? modules : [{ name:"首屏海报图", coreCopy:"", modulePrompt:"" }];
      list.innerHTML = records.map(promptDetailEditorItem).join("");
      refreshPromptDetailEditorOrder();
    }
    function setPromptLibraryEditorMode(category, modules = null) {
      const detail = category === "商品详情图";
      document.getElementById("promptLibraryGenericEditor").hidden = detail;
      document.getElementById("promptLibraryDetailEditor").hidden = !detail;
      if (detail && modules) renderPromptDetailEditor(modules);
    }
    function collectPromptDetailEditorModules() {
      return [...document.querySelectorAll("#promptLibraryDetailModuleList [data-prompt-detail-editor-item]")].map(item => ({
        name:item.querySelector("[data-prompt-detail-name]")?.value.trim() || "未命名模块",
        coreCopy:item.querySelector("[data-prompt-detail-core]")?.value.trim() || "",
        promptParts:{ scene:item.querySelector("[data-prompt-detail-scene]")?.value.trim() || "", composition:item.querySelector("[data-prompt-detail-composition]")?.value.trim() || "", negative:item.querySelector("[data-prompt-detail-negative]")?.value.trim() || "", other:item.querySelector("[data-prompt-detail-other]")?.value.trim() || "" },
        modulePrompt:[item.querySelector("[data-prompt-detail-scene]")?.value.trim(),item.querySelector("[data-prompt-detail-composition]")?.value.trim(),item.querySelector("[data-prompt-detail-negative]")?.value.trim(),item.querySelector("[data-prompt-detail-other]")?.value.trim()].filter(Boolean).join("\n")
      }));
    }
    function ensurePromptStructuredEditor() {
      const host = document.getElementById("promptLibraryGenericEditor");
      let fields = document.getElementById("promptLibraryStructuredFields");
      if (!fields && host) {
        host.querySelector("label")?.remove();
        host.querySelector(".field-hint")?.remove();
        host.querySelector("#promptLibraryContentInput")?.setAttribute("hidden", "");
        host.insertAdjacentHTML("afterbegin", '<div class="prompt-structured-editor-head"><strong>分类提示词内容</strong><span>按类别分别编辑，保存后自动回填对应区域</span></div><div class="prompt-structured-editor" id="promptLibraryStructuredFields"></div>');
        fields = document.getElementById("promptLibraryStructuredFields");
      }
      return fields;
    }
    function renderPromptStructuredEditor(segments = []) {
      const fields = ensurePromptStructuredEditor();
      if (!fields) return;
      fields.innerHTML = promptLibraryFieldLabels.map((label,index) => { const value = segments.find(item => item.label === label)?.value || ""; const lines = value.split(/\n+/).filter(Boolean); const params = lines.length ? lines.map(line => { const parts=line.split(/[：:]/); return {name:parts.length > 1 ? parts.shift().trim() : "提示词参数",value:parts.length ? parts.join("：").trim() : line}; }) : [{name:"提示词参数",value:""}]; return `<div class="prompt-structured-field" data-prompt-parameter-module="${escapeHtml(label)}"><label><span>${index + 1}</span>${escapeHtml(label)}</label><div class="prompt-param-list">${params.map(param => `<div class="prompt-param-row"><input data-prompt-param-name value="${escapeHtml(param.name)}" placeholder="参数名称"><textarea data-prompt-param-value placeholder="参数内容">${escapeHtml(param.value)}</textarea><button class="prompt-param-remove" type="button" data-remove-prompt-param>×</button></div>`).join("")}</div><button class="prompt-param-add" type="button" data-add-prompt-param>＋ 新增提示词参数</button></div>`; }).join("");
    }
    function collectPromptStructuredSegments() {
      return promptLibraryFieldLabels.map(label => { const module = document.querySelector(`[data-prompt-parameter-module="${CSS.escape(label)}"]`); const value = [...(module?.querySelectorAll(".prompt-param-row") || [])].map(row => { const name=row.querySelector("[data-prompt-param-name]")?.value.trim(); const content=row.querySelector("[data-prompt-param-value]")?.value.trim(); return content ? `${name || "提示词参数"}：${content}` : ""; }).filter(Boolean).join("\n"); return {label,value}; });
    }
    function openPromptLibraryEditor(record = null) {
      editingPromptLibraryId = record?.id || "";
      const targetCategory = record?.category || document.getElementById("promptLibraryCategoryFilter")?.value || "商品主图";
      document.getElementById("promptLibraryEditTitle").textContent = record ? "编辑提示词模板" : "新建提示词模板";
      document.getElementById("promptLibraryTitleInput").value = record?.title || "";
      document.getElementById("promptLibraryCategoryInput").value = targetCategory;
      document.getElementById("promptLibraryDescriptionInput").value = record?.description || "";
      document.getElementById("promptLibraryContentInput").value = record ? promptSegmentsToText(record.segments) : promptSegmentsToText([]);
      renderPromptStructuredEditor(record?.segments || []);
      setPromptLibraryEditorMode(targetCategory, targetCategory === "商品详情图" ? (record?.modules || []) : null);
      togglePromptLibraryModal(promptLibraryEditModal, true);
      requestAnimationFrame(() => document.getElementById("promptLibraryTitleInput").focus());
    }
    document.getElementById("promptLibraryCategoryInput")?.addEventListener("change", event => setPromptLibraryEditorMode(event.target.value, event.target.value === "商品详情图" ? collectPromptDetailEditorModules() : null));
    document.getElementById("addPromptDetailTemplateModule")?.addEventListener("click", () => {
      const list = document.getElementById("promptLibraryDetailModuleList");
      list?.insertAdjacentHTML("beforeend", promptDetailEditorItem({}, list.children.length));
      refreshPromptDetailEditorOrder();
    });
    document.getElementById("promptLibraryDetailModuleList")?.addEventListener("click", event => {
      const item = event.target.closest("[data-prompt-detail-editor-item]");
      if (!item) return;
      if (event.target.closest("[data-toggle-prompt-detail-editor]")) {
        item.classList.toggle("expanded");
        event.target.textContent = item.classList.contains("expanded") ? "收起" : "编辑";
        return;
      }
      if (event.target.closest("[data-remove-prompt-detail-editor]")) {
        if (item.parentElement.children.length <= 1) return showToast("详情图模板至少保留一个模块");
        item.remove(); refreshPromptDetailEditorOrder(); return;
      }
      const move = event.target.closest("[data-move-prompt-detail-editor]")?.dataset.movePromptDetailEditor;
      if (move === "up" && item.previousElementSibling) item.parentElement.insertBefore(item, item.previousElementSibling);
      if (move === "down" && item.nextElementSibling) item.parentElement.insertBefore(item.nextElementSibling, item);
      if (move) refreshPromptDetailEditorOrder();
    });
    promptLibraryEditModal?.addEventListener("click", event => {
      const module = event.target.closest("[data-prompt-parameter-module]");
      if (!module) return;
      if (event.target.closest("[data-add-prompt-param]")) {
        module.querySelector(".prompt-param-list")?.insertAdjacentHTML("beforeend", '<div class="prompt-param-row"><input data-prompt-param-name placeholder="参数名称"><textarea data-prompt-param-value placeholder="参数内容"></textarea><button class="prompt-param-remove" type="button" data-remove-prompt-param>×</button></div>');
        module.querySelector(".prompt-param-row:last-child input")?.focus();
      }
      if (event.target.closest("[data-remove-prompt-param]")) {
        const row = event.target.closest(".prompt-param-row");
        if (row.parentElement.children.length <= 1) { row.querySelectorAll("input,textarea").forEach(control => control.value = ""); return; }
        row.remove();
      }
    });
    function openSavePromptTemplateModal() {
      const input = document.getElementById("savePromptTemplateName");
      if (input) input.value = (creationContext.productName || "当前产品") + (activeType === "image-detail" ? "详情页提示词" : "商品主图提示词");
      togglePromptLibraryModal(savePromptTemplateModal, true);
      requestAnimationFrame(() => input?.select());
    }
    function saveCurrentPromptToLibrary(templateName = "") {
      const textareas = [...dynamicForm.querySelectorAll(".prompt-confirm-item textarea")];
      if (!textareas.length) return showToast("当前步骤没有可保存的提示词");
      const date = new Date();
      const category = activeType === "image-detail" ? "商品详情图" : "商品主图";
      const record = {
        id:"prompt-" + Date.now(),
        title:templateName.trim(),
        category,
        description:"由 AI 生图提示词确认步骤保存的可复用模板",
        createdAt:date.toISOString().slice(0,10),
        segments:category === "商品主图" ? [...dynamicForm.querySelectorAll("[data-prompt-step-module]")].map(module => { const label=module.dataset.promptStepModule; const value=[...module.querySelectorAll("[data-prompt-step-param-row]")].map(row => { const name=row.querySelector("[data-prompt-step-param-name]")?.value.trim(); const description=row.querySelector("[data-prompt-step-param-value]")?.value.trim(); return description ? `${name || "提示词参数"}：${description}` : ""; }).filter(Boolean).join("\n"); return {label,value}; }) : [],
        modules:category === "商品详情图" ? [...dynamicForm.querySelectorAll(".detail-prompt-item")].map(item => { const promptParts={scene:item.querySelector("[data-detail-scene]")?.value.trim() || "",composition:item.querySelector("[data-detail-composition]")?.value.trim() || "",negative:item.querySelector("[data-detail-negative]")?.value.trim() || "",other:item.querySelector("[data-detail-other]")?.value.trim() || ""}; return { name:item.dataset.detailPromptName || "详情页模块", coreCopy:item.querySelector("[data-detail-core-copy]")?.value.trim() || "", promptParts, modulePrompt:Object.values(promptParts).filter(Boolean).join("\n") }; }) : undefined,
        isDefault:!promptLibraryRecords.some(item => item.category === category && item.isDefault)
      };
      promptLibraryRecords.unshift(record);
      persistPromptLibraryRecords();
      renderPromptLibrary();
      setFormFeedback(`当前提示词已保存为模板：“${record.title}”。`);
      showToast("提示词模板已保存到模板库");
    }
    function renderPromptLibraryPicker(keyword = "") {
      const list = document.getElementById("promptLibraryPickerList");
      const search = keyword.trim().toLowerCase();
      const visible = promptLibraryRecords.filter(record => !search || (record.title + " " + record.description + " " + promptLibraryPreview(record)).toLowerCase().includes(search));
      list.innerHTML = visible.length ? visible.map((record,index) => `<label class="prompt-picker-option"><input type="radio" name="promptLibraryPick" value="${escapeHtml(record.id)}" ${index === 0 ? "checked" : ""}><div><strong>${escapeHtml(record.title)}</strong><p>${escapeHtml(promptLibraryPreview(record))}</p></div><span>${escapeHtml(record.category)}</span></label>`).join("") : '<div class="prompt-library-empty show">暂无可选择的提示词</div>';
    }
    function openPromptLibraryPicker() {
      document.getElementById("promptLibraryPickerSearch").value = "";
      renderPromptLibraryPicker();
      togglePromptLibraryModal(promptLibraryPickerModal, true);
    }
    function detailPromptConfirmItemHtml(module, index, custom = false) {
      const parts = module.promptParts || { scene:"真实使用场景，光线自然，环境整洁", composition:module.modulePrompt || "商品主体清晰，信息层级明确，保留安全留白", negative:"禁止产品变形、品牌错字、乱码和错误参数", other:"遵循平台安全区，仅使用已确认的商品事实与权益" };
      return `<div class="prompt-confirm-item detail-prompt-item" data-detail-prompt-name="${escapeHtml(module.name)}" ${custom ? "data-custom-detail-prompt" : ""}><div class="detail-prompt-head"><span>${index + 1}</span><strong>${escapeHtml(module.name)}</strong><div class="detail-prompt-order-actions"><button type="button" data-move-detail-prompt="up">↑</button><button type="button" data-move-detail-prompt="down">↓</button>${custom ? '<button class="detail-custom-delete" type="button" data-remove-detail-prompt-module>删除</button>' : ""}</div></div><div class="detail-confirm-block"><strong>文案模块</strong><div class="detail-prompt-field"><label>模板文案 <button type="button" data-prompt-optimize>AI优化</button></label><textarea data-required data-detail-core-copy>${escapeHtml(module.coreCopy || "")}</textarea></div></div><div class="detail-confirm-block"><strong>提示词模块</strong><div class="detail-prompt-submodules"><div class="detail-prompt-field"><label>场景描述</label><textarea data-required data-detail-scene>${escapeHtml(parts.scene || "")}</textarea></div><div class="detail-prompt-field"><label>构图方式</label><textarea data-required data-detail-composition>${escapeHtml(parts.composition || "")}</textarea></div><div class="detail-prompt-field"><label>反向提示词</label><textarea data-required data-detail-negative>${escapeHtml(parts.negative || "")}</textarea></div><div class="detail-prompt-field"><label>其他限制</label><textarea data-required data-detail-other>${escapeHtml(parts.other || "")}</textarea></div></div><textarea data-detail-module-prompt hidden>${escapeHtml([parts.scene,parts.composition,parts.negative,parts.other].filter(Boolean).join("\n"))}</textarea></div></div>`;
    }
    function applyPromptLibraryRecord(record) {
      const textareas = [...dynamicForm.querySelectorAll(".prompt-confirm-item textarea")];
      if (!textareas.length) return showToast("请先进入提示词确认步骤");
      if (activeType === "image-detail" && record.modules?.length) {
        const container = dynamicForm.querySelector("[data-detail-prompt-list]");
        if (container) {
          container.innerHTML = record.modules.map((module,index) => detailPromptConfirmItemHtml(module,index)).join("");
          refreshDetailPromptOrder();
        }
      }
      promptLibraryFieldLabels.forEach((label,index) => {
        const segment = record.segments?.find(item => item.label === label);
        const module = dynamicForm.querySelector(`[data-prompt-step-module="${CSS.escape(label)}"]`);
        if (module && segment) {
          const lines = String(segment.value || "").split(/\n+/).filter(Boolean);
          const params = lines.length ? lines.map(line => { const parts=line.split(/[：:]/); return {name:parts.length > 1 ? parts.shift().trim() : "提示词参数",value:parts.length ? parts.join("：").trim() : line}; }) : [{name:"提示词参数",value:""}];
          module.querySelector(".prompt-param-list").innerHTML = params.map((param,paramIndex) => `<div class="prompt-param-row" data-prompt-step-param-row><input data-prompt-step-param-name value="${escapeHtml(param.name)}" placeholder="参数名称"><textarea ${paramIndex === 0 ? "data-required " : ""}data-prompt-step-param-value placeholder="提示词描述">${escapeHtml(param.value)}</textarea><button class="prompt-param-remove" type="button" data-remove-prompt-step-param>×</button></div>`).join("");
        } else if (textareas[index] && segment) textareas[index].value = segment.value;
      });
      syncMainTotalPrompt();
      const usage = document.getElementById("promptLibraryUsage");
      if (usage) usage.textContent = Number(usage.textContent || 0) + 1;
      setFormFeedback(`已选择提示词模板“${record.title}”，可继续修改或 AI 优化。`);
      showToast("提示词模板已回填");
    }

    const detailModuleDescriptions = {
      "首屏海报图":"首屏建立产品定位、核心利益点与品牌视觉",
      "核心卖点图":"集中表达一个核心功能与用户收益",
      "细节特写图":"展示产品结构、材质、工艺或关键细节",
      "多角度图":"从不同角度完整展示商品外观",
      "效果对比图":"通过使用前后或方案对比呈现结果差异",
      "场景使用图":"展示商品在真实使用环境中的应用方式",
      "品牌故事图":"传达品牌背景、理念与品质承诺",
      "参数表":"结构化展示规格、性能和产品参数",
      "商品成分图":"说明产品材质、配方或组成信息",
      "售后保障图":"展示服务权益、质保与售后保障",
      "证书":"展示认证、检测报告或资质证书"
    };

    function selectedDetailModuleRecords() {
      return [...dynamicForm.querySelectorAll("[data-detail-module-list] .detail-module-option")]
        .filter(option => option.querySelector("input")?.checked)
        .map(option => {
          const name = option.querySelector("b")?.textContent.trim() || option.querySelector(":scope > span")?.childNodes[0]?.textContent.trim() || option.querySelector(":scope > span")?.textContent.trim() || "详情页模块";
          const description = option.querySelector("small")?.textContent.trim() || detailModuleDescriptions[name] || "围绕该模块生成独立图片与提示词";
          return { name, description, option };
        });
    }

    function renderDetailModuleOrder() {
      const host = dynamicForm.querySelector("[data-detail-module-order]");
      if (!host) return;
      const records = selectedDetailModuleRecords();
      host.innerHTML = records.length ? records.map((record,index) => `<div class="detail-module-order-item" data-detail-order-name="${escapeHtml(record.name)}"><span class="detail-module-order-index">${index + 1}</span><span class="detail-module-order-copy"><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml(record.description)}</small></span><span class="detail-module-order-actions"><button type="button" data-move-detail-module="up" title="上移">↑</button><button type="button" data-move-detail-module="down" title="下移">↓</button></span></div>`).join("") : '<div class="field-hint">请至少选择一个详情页模块</div>';
    }

    function moveSelectedDetailModule(name, direction) {
      const records = selectedDetailModuleRecords();
      const index = records.findIndex(record => record.name === name);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= records.length) return false;
      const current = records[index].option;
      const target = records[targetIndex].option;
      if (direction === "up") target.parentElement.insertBefore(current, target);
      else target.parentElement.insertBefore(target, current);
      return true;
    }

    function syncDetailPromptModules() {
      if (activeType !== "image-detail") return;
      const host = dynamicForm.querySelector('[data-task-step="3"] .prompt-confirm-list');
      if (!host) return;
      let records = selectedDetailModuleRecords();
      if (!records.length) records = ["首屏海报图","核心卖点图","细节特写图"].map(name => ({ name, description:detailModuleDescriptions[name] }));
      host.innerHTML = records.map((record,index) => {
        const product = creationContext.productName || "当前商品";
        const coreCopy = record.name === "首屏海报图" ? `${product}｜深层清洁，一遍看得见` : record.name === "核心卖点图" ? "大吸力深层清洁，拍打吸尘同步完成" : record.name === "细节特写图" ? "关键结构清晰呈现，材质与工艺真实可见" : `${record.name}｜${record.description}`;
        const modulePrompt = `${product}，${record.description}。围绕“${record.name}”组织画面构图、产品角度、光线、色彩和信息层级；保持商品外观、品牌与参数事实准确，一张图片只表达一个重点。`;
        return detailPromptConfirmItemHtml({ name:record.name, coreCopy, modulePrompt, promptParts:{ scene:`${product}真实使用场景，围绕${record.name}设置空间、光线与色彩。`, composition:modulePrompt, negative:"禁止商品变形、品牌错字、乱码、错误参数和无关装饰。", other:"遵循详情页尺寸与平台安全区，仅使用已确认商品事实。" } },index);
      }).join("");
      const hint = dynamicForm.querySelector('[data-task-step="3"] .form-section-head small');
      if (hint) hint.textContent = `已按 ${records.length} 个已选详情页模块拆分核心文案与模块专属提示词，可排序并逐项编辑`;
    }

    function syncMainTotalPrompt() {
      if (activeType !== "image-main") return;
      const total = dynamicForm.querySelector("[data-total-prompt]");
      if (!total) return;
      total.value = [...dynamicForm.querySelectorAll("[data-prompt-step-module]")].map(module => {
        const title = module.dataset.promptStepModule;
        const params = [...module.querySelectorAll("[data-prompt-step-param-row]")].map(row => {
          const name = row.querySelector("[data-prompt-step-param-name]")?.value.trim();
          const description = row.querySelector("[data-prompt-step-param-value]")?.value.trim();
          return description ? `${name || "自定义参数"}：${description}` : "";
        }).filter(Boolean);
        return `【${title}】\n${params.join("\n")}`;
      }).join("\n\n");
    }

    dynamicForm.addEventListener("click", event => {
      const addPromptParameter = event.target.closest("[data-add-prompt-step-param]");
      if (addPromptParameter) {
        const module = addPromptParameter.closest("[data-prompt-step-module]");
        module.querySelector(".prompt-param-list")?.insertAdjacentHTML("beforeend", '<div class="prompt-param-row" data-prompt-step-param-row><input data-prompt-step-param-name placeholder="参数名称"><textarea data-prompt-step-param-value placeholder="提示词描述"></textarea><button class="prompt-param-remove" type="button" data-remove-prompt-step-param>×</button></div>');
        module.querySelector(".prompt-param-row:last-child input")?.focus();
        syncMainTotalPrompt();
        return;
      }
      const removePromptParameter = event.target.closest("[data-remove-prompt-step-param]");
      if (removePromptParameter) {
        const row = removePromptParameter.closest("[data-prompt-step-param-row]");
        if (row.parentElement.children.length <= 1) row.querySelectorAll("input,textarea").forEach(control => control.value = "");
        else row.remove();
        syncMainTotalPrompt(); return;
      }
      const addDetailPromptModule = event.target.closest("[data-add-detail-prompt-module]");
      if (addDetailPromptModule) {
        const creator = addDetailPromptModule.closest(".detail-prompt-create");
        const name = creator.querySelector("[data-new-detail-prompt-name]")?.value.trim();
        const coreCopy = creator.querySelector("[data-new-detail-prompt-copy]")?.value.trim();
        const modulePrompt = creator.querySelector("[data-new-detail-prompt-visual]")?.value.trim();
        if (!name || !coreCopy || !modulePrompt) return showToast("请完整填写模块名称、模板文案和模块提示词");
        const host = dynamicForm.querySelector("[data-detail-prompt-list]") || dynamicForm.querySelector('[data-task-step="3"] .prompt-confirm-list');
        const index = host.querySelectorAll(".detail-prompt-item").length;
        host.insertAdjacentHTML("beforeend", detailPromptConfirmItemHtml({ name, coreCopy, modulePrompt, promptParts:{ scene:"填写该模块使用场景、空间、光线与色彩", composition:modulePrompt, negative:"禁止产品变形、品牌错字、乱码和错误参数", other:"遵循平台安全区，仅使用已确认商品事实" } },index,true));
        creator.querySelectorAll("input,textarea").forEach(control => control.value = "");
        refreshDetailPromptOrder(); showToast("详情页模块已新增"); return;
      }
      const removeDetailPromptModule = event.target.closest("[data-remove-detail-prompt-module]");
      if (removeDetailPromptModule) { removeDetailPromptModule.closest("[data-custom-detail-prompt]")?.remove(); refreshDetailPromptOrder(); showToast("自定义详情页模块已删除"); return; }
      const imageAdvancedToggle = event.target.closest("[data-toggle-image-advanced]");
      if (imageAdvancedToggle) {
        const panel = dynamicForm.querySelector("[data-image-advanced-panel]");
        const opening = panel?.hidden !== false;
        if (panel) panel.hidden = !opening;
        imageAdvancedToggle.classList.toggle("active", opening);
        imageAdvancedToggle.setAttribute("aria-expanded", String(opening));
        imageAdvancedToggle.querySelector("span").textContent = opening ? "收起高级设置" : "高级设置";
        return;
      }
      const moveDetailModuleButton = event.target.closest("[data-move-detail-module]");
      if (moveDetailModuleButton) {
        const item = moveDetailModuleButton.closest("[data-detail-order-name]");
        if (moveSelectedDetailModule(item?.dataset.detailOrderName || "", moveDetailModuleButton.dataset.moveDetailModule)) {
          renderDetailModuleOrder();
          setFormFeedback("详情页模块生成顺序已更新。");
        }
        return;
      }
      const moveDetailPromptButton = event.target.closest("[data-move-detail-prompt]");
      if (moveDetailPromptButton) {
        const item = moveDetailPromptButton.closest("[data-detail-prompt-name]");
        if (moveSelectedDetailModule(item?.dataset.detailPromptName || "", moveDetailPromptButton.dataset.moveDetailPrompt)) {
          renderDetailModuleOrder();
          syncDetailPromptModules();
          setFormFeedback("详情页提示词模块顺序已更新。");
        }
        return;
      }
      const addDetailModuleButton = event.target.closest("[data-add-detail-module]");
      if (addDetailModuleButton) {
        const nameInput = dynamicForm.querySelector("[data-detail-module-name]");
        const descriptionInput = dynamicForm.querySelector("[data-detail-module-description]");
        const name = nameInput?.value.trim();
        const description = descriptionInput?.value.trim();
        if (!name) {
          setFormFeedback("请输入详情页模块名称。", "error");
          nameInput?.focus();
          return;
        }
        if (!description) {
          setFormFeedback("请输入详情页模块描述。", "error");
          descriptionInput?.focus();
          return;
        }
        const module = document.createElement("label");
        module.className = "detail-module-option custom";
        module.dataset.detailModuleCustom = "";
        module.innerHTML = `<input type="checkbox" checked><span><b>${escapeHtml(name)}</b><small>${escapeHtml(description)}</small></span><button class="detail-module-remove" type="button" data-remove-detail-module title="删除">×</button>`;
        dynamicForm.querySelector("[data-detail-module-list]")?.append(module);
        nameInput.value = "";
        descriptionInput.value = "";
        renderDetailModuleOrder();
        setFormFeedback(`已新增详情页模块“${name}”。`);
        showToast("详情页模块已新增");
        return;
      }
      const removeDetailModuleButton = event.target.closest("[data-remove-detail-module]");
      if (removeDetailModuleButton) {
        const name = removeDetailModuleButton.closest("[data-detail-module-custom]")?.querySelector("b")?.textContent || "自定义模块";
        removeDetailModuleButton.closest("[data-detail-module-custom]")?.remove();
        renderDetailModuleOrder();
        setFormFeedback(`已删除详情页模块“${name}”。`);
        return;
      }
      const previewFlowCompetitorButton = event.target.closest("[data-preview-flow-competitor]");
      if (previewFlowCompetitorButton) {
        const row = previewFlowCompetitorButton.closest("tr");
        const name = row?.querySelector(".competitor-product-cell strong")?.textContent || "竞品";
        if (row) openCompetitorReport(row);
        setFormFeedback(`已打开“${name}”的三 TAB 可视化竞品分析报告。`);
        return;
      }
      const downloadFlowCompetitorButton = event.target.closest("[data-download-flow-competitor]");
      if (downloadFlowCompetitorButton) {
        const name = downloadFlowCompetitorButton.closest("tr")?.querySelector(".competitor-product-cell strong")?.textContent || "竞品";
        setFormFeedback(`“${name}”竞品分析报告已开始下载。`);
        showToast("竞品报告下载中");
        return;
      }
      const addConfigButton = event.target.closest("[data-add-config]");
      if (addConfigButton) {
        const type = addConfigButton.dataset.addConfig;
        const input = dynamicForm.querySelector(`[data-config-input="${type}"]`);
        const contentInput = dynamicForm.querySelector(`[data-config-content="${type}"]`);
        const list = dynamicForm.querySelector(`[data-config-list="${type}"]`);
        const value = input?.value.trim();
        if (!value) {
          setFormFeedback(`请输入需要新增的${type === "designer" ? "设计师" : type === "scene" ? "场景" : "人群"}。`, "error");
          input?.focus();
          return;
        }
        const contentValue = contentInput?.value.trim() || "";
        if (type !== "audience" && !contentValue) {
          setFormFeedback(`请填写${type === "designer" ? "设计师" : "场景"}的内容描述。`, "error");
          contentInput?.focus();
          return;
        }
        let configWasUpdated = false;
        const button = document.createElement("button");
        button.type = "button";
        if (type === "audience") {
          list?.querySelectorAll(".audience-option").forEach(item => item.classList.remove("active"));
          button.className = "audience-option active";
          button.innerHTML = `<span><strong>${escapeHtml(value)}</strong><small>自定义人群</small></span>`;
          list?.append(button);
        } else {
          if (list?.hasAttribute("data-single-config")) list.querySelectorAll(".config-chip").forEach(item => item.classList.remove("active"));
          const editingId = addConfigButton.dataset.editingId;
          const existingEntry = editingId ? list?.querySelector(`[data-config-id="${editingId}"]`) : null;
          if (existingEntry) {
            configWasUpdated = true;
            existingEntry.dataset.configTitle = value;
            existingEntry.dataset.configContent = contentValue;
            const existingChip = existingEntry.querySelector(".config-chip");
            existingChip.classList.add("active");
            existingChip.innerHTML = `<span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(contentValue)}</small></span>`;
            delete addConfigButton.dataset.editingId;
            addConfigButton.textContent = type === "designer" ? "＋ 新增设计师" : "＋ 新增场景";
          } else {
            const entry = document.createElement("div");
            entry.className = "config-entry custom";
            entry.dataset.configId = `custom-${type}-${Date.now()}`;
            entry.dataset.configType = type;
            entry.dataset.configTitle = value;
            entry.dataset.configContent = contentValue;
            entry.innerHTML = `<button class="config-chip active" type="button"><span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(contentValue)}</small></span></button><span class="config-entry-actions"><button class="config-entry-action" type="button" data-edit-config>编辑</button><button class="config-entry-action danger" type="button" data-delete-config>删除</button></span>`;
            list?.append(entry);
          }
        }
        input.value = "";
        if (contentInput) contentInput.value = "";
        setFormFeedback(`已${configWasUpdated ? "更新" : "新增并选择"}“${value}”。`);
        showToast("自定义配置已保存");
        return;
      }
      const editConfigButton = event.target.closest("[data-edit-config]");
      if (editConfigButton) {
        const entry = editConfigButton.closest("[data-config-id]");
        const type = entry?.dataset.configType;
        const input = dynamicForm.querySelector(`[data-config-input="${type}"]`);
        const contentInput = dynamicForm.querySelector(`[data-config-content="${type}"]`);
        const saveButton = dynamicForm.querySelector(`[data-add-config="${type}"]`);
        if (!entry || !input || !contentInput || !saveButton) return;
        input.value = entry.dataset.configTitle || "";
        contentInput.value = entry.dataset.configContent || "";
        saveButton.dataset.editingId = entry.dataset.configId;
        saveButton.textContent = "保存修改";
        input.focus();
        setFormFeedback(`正在编辑“${entry.dataset.configTitle}”，修改后点击“保存修改”。`);
        return;
      }
      const deleteConfigButton = event.target.closest("[data-delete-config]");
      if (deleteConfigButton) {
        const entry = deleteConfigButton.closest("[data-config-id]");
        const type = entry?.dataset.configType;
        const saveButton = dynamicForm.querySelector(`[data-add-config="${type}"]`);
        if (saveButton?.dataset.editingId === entry?.dataset.configId) {
          const input = dynamicForm.querySelector(`[data-config-input="${type}"]`);
          const contentInput = dynamicForm.querySelector(`[data-config-content="${type}"]`);
          if (input) input.value = "";
          if (contentInput) contentInput.value = "";
          delete saveButton.dataset.editingId;
          saveButton.textContent = type === "designer" ? "＋ 新增设计师" : "＋ 新增场景";
        }
        const title = entry?.dataset.configTitle || "该配置";
        entry?.remove();
        setFormFeedback(`已删除“${title}”。`);
        showToast("自定义配置已删除");
        return;
      }
      const addRuleButton = event.target.closest("[data-add-rule]");
      if (addRuleButton) {
        const type = addRuleButton.dataset.addRule;
        const input = dynamicForm.querySelector(`[data-rule-input="${type}"]`);
        const value = input?.value.trim();
        if (!value) {
          setFormFeedback(`请输入需要新增的${type === "benefit" ? "权益" : "约束规则"}。`, "error");
          input?.focus();
          return;
        }
        const contentInput = dynamicForm.querySelector(`[data-rule-content="${type}"]`);
        const contentValue = contentInput?.value.trim() || "";
        if (type === "constraint" && !contentValue) {
          setFormFeedback("请填写规则描述。", "error");
          contentInput?.focus();
          return;
        }
        const list = dynamicForm.querySelector(`[data-rule-list="${type}"]`);
        const editingId = addRuleButton.dataset.editingId;
        const existingItem = editingId ? list?.querySelector(`[data-rule-id="${editingId}"]`) : null;
        if (existingItem) {
          existingItem.dataset.ruleTitle = value;
          existingItem.dataset.ruleContent = contentValue;
          existingItem.querySelector(".rule-copy").innerHTML = `<strong>${escapeHtml(value)}</strong>${contentValue ? `<small>${escapeHtml(contentValue)}</small>` : ""}`;
          delete addRuleButton.dataset.editingId;
          addRuleButton.textContent = "＋ 新增规则";
        } else {
          const item = document.createElement("div");
          item.className = "rule-item custom";
          item.dataset.ruleId = `custom-${type}-${Date.now()}`;
          item.dataset.ruleType = type;
          item.dataset.ruleTitle = value;
          item.dataset.ruleContent = contentValue;
          const editAction = type === "constraint" ? `<button class="rule-action" type="button" data-edit-rule>编辑</button>` : "";
          item.innerHTML = `<span class="rule-copy"><strong>${escapeHtml(value)}</strong>${contentValue ? `<small>${escapeHtml(contentValue)}</small>` : ""}</span><span class="rule-actions">${editAction}<button class="rule-action danger" type="button" data-delete-rule>删除</button></span>`;
          list?.append(item);
        }
        input.value = "";
        if (contentInput) contentInput.value = "";
        setFormFeedback(`已${existingItem ? "更新" : "新增"}${type === "benefit" ? "权益" : "规则"}“${value}”。`);
        return;
      }
      const editRuleButton = event.target.closest("[data-edit-rule]");
      if (editRuleButton) {
        const item = editRuleButton.closest("[data-rule-id]");
        const type = item?.dataset.ruleType;
        const input = dynamicForm.querySelector(`[data-rule-input="${type}"]`);
        const contentInput = dynamicForm.querySelector(`[data-rule-content="${type}"]`);
        const saveButton = dynamicForm.querySelector(`[data-add-rule="${type}"]`);
        if (!item || !input || !contentInput || !saveButton) return;
        input.value = item.dataset.ruleTitle || "";
        contentInput.value = item.dataset.ruleContent || "";
        saveButton.dataset.editingId = item.dataset.ruleId;
        saveButton.textContent = "保存修改";
        input.focus();
        setFormFeedback(`正在编辑规则“${item.dataset.ruleTitle}”。`);
        return;
      }
      const deleteRuleButton = event.target.closest("[data-delete-rule]");
      if (deleteRuleButton) {
        const item = deleteRuleButton.closest("[data-rule-id]");
        const type = item?.dataset.ruleType;
        const saveButton = dynamicForm.querySelector(`[data-add-rule="${type}"]`);
        if (saveButton?.dataset.editingId === item?.dataset.ruleId) {
          const input = dynamicForm.querySelector(`[data-rule-input="${type}"]`);
          const contentInput = dynamicForm.querySelector(`[data-rule-content="${type}"]`);
          if (input) input.value = "";
          if (contentInput) contentInput.value = "";
          delete saveButton.dataset.editingId;
          saveButton.textContent = type === "benefit" ? "＋ 新增权益" : "＋ 新增规则";
        }
        const title = item?.dataset.ruleTitle || "该配置";
        item?.remove();
        setFormFeedback(`已删除“${title}”。`);
        return;
      }
      const configChip = event.target.closest(".config-chip");
      if (configChip) {
        const list = configChip.closest("[data-config-list]");
        if (list?.hasAttribute("data-single-config")) {
          list.querySelectorAll(".config-chip").forEach(item => item.classList.remove("active"));
          configChip.classList.add("active");
        } else {
          configChip.classList.toggle("active");
        }
        setFormFeedback(`已更新${list?.dataset.configList === "platform" ? "投放平台" : "创意配置"}。`);
        return;
      }
      const audienceOption = event.target.closest(".audience-option");
      if (audienceOption) {
        const list = audienceOption.closest('[data-config-list="audience"]');
        list?.querySelectorAll(".audience-option").forEach(item => item.classList.remove("active"));
        audienceOption.classList.add("active");
        const selectedName = audienceOption.querySelector("strong")?.textContent.trim() || "目标人群";
        setFormFeedback(`已选择“${selectedName}”，商品图将按该人群适配表达。`);
        return;
      }
      const flowTab = event.target.closest("[data-flow-tab]");
      if (flowTab) {
        flowTab.closest("[data-image-product-source]")?.querySelectorAll("[data-flow-tab]").forEach(item => item.classList.toggle("active", item === flowTab));
        setFormFeedback(`产品信息来源已切换为“${flowTab.textContent.trim()}”。`);
        return;
      }
      const productPolishButton = event.target.closest("[data-image-product-polish]");
      if (productPolishButton) {
        const selling = dynamicForm.querySelector("[data-image-product-selling]");
        if (selling) selling.value = "大吸力深层清洁，拍打吸尘同步完成；透明尘杯让清洁结果可视化；尘杯可拆卸水洗；床垫、沙发与布艺多场景适用。";
        setFormFeedback("AI 已按“核心能力—结果证据—使用便利—适用场景”完善产品卖点。 ");
        showToast("产品卖点已完善");
        return;
      }
      const addCompetitorButton = event.target.closest("[data-add-competitor]");
      if (addCompetitorButton) {
        const input = dynamicForm.querySelector("[data-competitor-link]");
        const value = input?.value.trim();
        if (!value) {
          setFormFeedback("请先粘贴有效的竞品链接。", "error");
          input?.focus();
          return;
        }
        const row = document.createElement("tr");
        const modeName = `competitor-mode-${Date.now()}`;
        row.innerHTML = `<td><input class="competitor-select" type="checkbox" checked aria-label="选择新分析竞品方案"></td><td class="competitor-product-cell"><strong>新分析竞品方案</strong><small>链接解析 · 刚刚更新</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-flow-competitor>主图</button><button class="competitor-thumb detail" type="button" data-preview-flow-competitor>详情</button></div></td><td><a class="competitor-source-link" href="${escapeHtml(safeCompetitorUrl(value))}" target="_blank" rel="noopener">${escapeHtml(value)}</a></td><td><span class="competitor-platform">待识别</span></td><td><strong>待识别</strong></td><td class="competitor-cell-copy">待识别</td><td class="competitor-cell-copy">已提取核心卖点</td><td class="competitor-cell-copy">待识别</td><td class="competitor-category-path">待识别一级类目</td><td><div class="competitor-mode-options"><label><input type="radio" name="${modeName}" value="reference" checked>参考</label><label><input type="radio" name="${modeName}" value="replicate">复刻</label></div></td><td><div class="competitor-actions image-competitor-actions"><button type="button" data-preview-flow-competitor>预览</button><button type="button" data-download-flow-competitor>下载</button></div></td>`;
        [6,7,8].forEach(cellIndex => row.children[cellIndex]?.setAttribute("contenteditable", "true"));
        row.children[9]?.insertAdjacentHTML("afterend", '<td class="competitor-reverse-prompt" contenteditable="true">根据解析结果生成商品主体、场景、卖点与视觉层级提示词</td>');
        dynamicForm.querySelector("[data-competitor-body]")?.append(row);
        input.value = "";
        setFormFeedback("竞品链接已分析并加入参考列表，可选择为本次主要参考。 ");
        showToast("竞品分析完成");
        return;
      }
      const removeCompetitorButton = event.target.closest("[data-remove-competitor]");
      if (removeCompetitorButton) {
        removeCompetitorButton.closest("tr")?.remove();
        setFormFeedback("竞品参考已删除。 ");
        return;
      }
      const promptOptimizeButton = event.target.closest("[data-prompt-optimize]");
      if (promptOptimizeButton) {
        const mainModule = promptOptimizeButton.closest("[data-prompt-step-module]");
        if (mainModule) {
          mainModule.querySelectorAll("[data-prompt-step-param-value]").forEach(textarea => {
            const value = textarea.value.trim();
            if (value && !value.includes("表达更清晰")) textarea.value = `${value}；表达更清晰，画面指令更具体，严格保持商品事实与品牌信息一致。`;
          });
          syncMainTotalPrompt();
          setFormFeedback(`“${mainModule.dataset.promptStepModule}”模块内的全部提示词描述已完成 AI 优化。`);
          return;
        }
        const textarea = promptOptimizeButton.closest(".detail-prompt-field")?.querySelector("textarea") || promptOptimizeButton.closest(".prompt-confirm-item")?.querySelector("textarea");
        if (textarea?.matches("[data-detail-core-copy]") && !textarea.value.includes("更聚焦")) textarea.value = `${textarea.value.trim()}，表达更聚焦、更适合电商阅读。`;
        else if (textarea && !textarea.value.includes("画面重点清晰")) textarea.value = `${textarea.value.trim()} 画面重点清晰，信息层级明确，并严格保持商品事实一致。`;
        setFormFeedback("当前输入区已完成 AI 优化，可继续手动修改。 ");
        return;
      }
      const totalPromptOptimize = event.target.closest("[data-total-prompt-optimize]");
      if (totalPromptOptimize) {
        syncMainTotalPrompt();
        const total = dynamicForm.querySelector("[data-total-prompt]");
        if (total && !total.value.startsWith("【AI整合优化版】")) total.value = `【AI整合优化版】\n统一商品事实、视觉风格与信息层级，消除重复指令并增强模块协同性。\n\n${total.value}`;
        setFormFeedback("总版提示词已完成 AI 整合优化，可直接用于图片生成。 ");
        showToast("整合提示词已优化");
        return;
      }
      const savePromptTemplateButton = event.target.closest("[data-save-prompt-template]");
      if (savePromptTemplateButton) {
        openSavePromptTemplateModal();
        return;
      }
      const getPromptLibraryButton = event.target.closest("[data-get-prompt-library]");
      if (getPromptLibraryButton) {
        openPromptLibraryPicker();
        return;
      }
    });
    dynamicForm.addEventListener("change", event => {
      if (event.target.matches("[data-generation-competitor-select]")) {
        const value = event.target.value;
        dynamicForm.querySelectorAll("[data-generation-result]").forEach(panel => { panel.hidden = panel.dataset.generationResult !== value; });
        setFormFeedback(`已切换查看“${event.target.options[event.target.selectedIndex].text}”生成结果。`);
      }
      if (event.target.matches("[data-detail-module-list] input[type='checkbox']")) {
        renderDetailModuleOrder();
        setFormFeedback("已更新详情页模块选择与生成顺序。");
      }
      if (event.target.matches("[data-image-upload-input]")) {
        const files = [...event.target.files];
        const box = dynamicForm.querySelector("[data-image-upload-trigger]");
        if (box && files.length) {
          (window.imageUploadPreviewRecords || []).forEach(item => { if (item.url) URL.revokeObjectURL(item.url); });
          window.imageUploadPreviewRecords = files.map(file => ({ name:file.name, url:URL.createObjectURL(file) }));
          const list = box.querySelector("[data-image-upload-preview-list]");
          const empty = box.querySelector(".image-upload-empty");
          box.classList.add("selected", "has-files");
          if (empty) empty.hidden = true;
          if (list) {
            list.hidden = false;
            list.innerHTML = window.imageUploadPreviewRecords.map((item,index) => `<div class="image-upload-preview"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}"><button type="button" data-remove-image-upload="${index}" aria-label="删除${escapeHtml(item.name)}">×</button></div>`).join("") + '<button class="image-upload-add" type="button" data-add-image-upload aria-label="继续添加图片">＋</button>';
          }
          setFormFeedback(`已上传 ${files.length} 张参考图，生成时将用于锁定商品主体与外观。`);
          showToast("商品参考图已上传");
        }
      }
      if (event.target.matches("[data-image-model]")) {
        const targetValue = event.target.value;
        if ([...modelSelect.options].some(option => option.value === targetValue)) {
          modelSelect.value = targetValue;
          renderModelPickerOptions();
          renderTaskModelStep();
        }
        setFormFeedback(`图片模型已切换为“${event.target.options[event.target.selectedIndex].text}”。`);
      }
    });
    document.getElementById("createPromptLibraryItem")?.addEventListener("click", () => openPromptLibraryEditor());
    document.getElementById("promptLibraryTypeTabs")?.addEventListener("click", event => {
      const button = event.target.closest("[data-prompt-library-type]");
      if (!button) return;
      document.querySelectorAll("[data-prompt-library-type]").forEach(item => item.classList.toggle("active", item === button));
      const filter = document.getElementById("promptLibraryCategoryFilter");
      if (filter) filter.value = button.dataset.promptLibraryType;
      renderPromptLibrary();
    });
    document.getElementById("promptLibrarySearch")?.addEventListener("input", renderPromptLibrary);
    document.getElementById("promptLibraryCategoryFilter")?.addEventListener("change", renderPromptLibrary);
    document.getElementById("promptLibraryGrid")?.addEventListener("click", event => {
      const card = event.target.closest("[data-prompt-library-card]");
      if (!card) return;
      const record = promptLibraryRecords.find(item => item.id === card.dataset.promptLibraryCard);
      if (!record) return;
      if (event.target.closest("[data-set-prompt-default]")) {
        promptLibraryRecords.forEach(item => { if (item.category === record.category) item.isDefault = item.id === record.id; });
        persistPromptLibraryRecords();
        renderPromptLibrary();
        showToast(`“${record.title}”已设为${record.category}默认模板`);
        return;
      }
      if (event.target.closest("[data-edit-prompt-library]")) return openPromptLibraryEditor(record);
      if (event.target.closest("[data-delete-prompt-library]")) {
        deletingPromptLibraryId = record.id;
        document.getElementById("deletePromptLibraryName").textContent = record.title;
        return togglePromptLibraryModal(promptLibraryDeleteModal, true);
      }
      if (event.target.closest("[data-use-prompt-library]")) {
        switchPage("creation");
        if (dynamicForm.querySelector(".prompt-confirm-list")) applyPromptLibraryRecord(record);
        else showToast("已选择提示词，请进入 AI 生图的提示词确认步骤后获取");
      }
    });
    document.getElementById("savePromptLibraryItem")?.addEventListener("click", () => {
      const title = document.getElementById("promptLibraryTitleInput").value.trim();
      const content = document.getElementById("promptLibraryContentInput").value.trim();
      const category = document.getElementById("promptLibraryCategoryInput").value;
      const detailModules = category === "商品详情图" ? collectPromptDetailEditorModules() : [];
      const structuredSegments = category === "商品详情图" ? [] : collectPromptStructuredSegments();
      if (!title) return showToast("请输入提示词名称");
      if (category !== "商品详情图" && !structuredSegments.some(segment => segment.value)) return showToast("请至少填写一个分类提示词");
      if (category === "商品详情图" && (!detailModules.length || detailModules.some(module => !module.name || !module.coreCopy || !module.modulePrompt))) return showToast("请完整填写每个详情页模块的名称、核心文案和模块专属提示词");
      const data = {
        title,
        category,
        description:document.getElementById("promptLibraryDescriptionInput").value.trim(),
        segments:category === "商品详情图" ? [] : structuredSegments,
        modules:category === "商品详情图" ? detailModules : undefined,
        isDefault: editingPromptLibraryId ? Boolean(promptLibraryRecords.find(item => item.id === editingPromptLibraryId)?.isDefault) : !promptLibraryRecords.some(item => item.category === category && item.isDefault)
      };
      if (editingPromptLibraryId) {
        const record = promptLibraryRecords.find(item => item.id === editingPromptLibraryId);
        if (record) Object.assign(record, data);
        showToast("提示词已更新");
      } else {
        promptLibraryRecords.unshift({ id:"prompt-" + Date.now(), createdAt:new Date().toISOString().slice(0,10), ...data });
        showToast("提示词已新增");
      }
      ["商品主图","商品详情图"].forEach(type => {
        const records = promptLibraryRecords.filter(item => item.category === type);
        const defaults = records.filter(item => item.isDefault);
        if (!defaults.length && records[0]) records[0].isDefault = true;
        defaults.slice(1).forEach(item => { item.isDefault = false; });
      });
      editingPromptLibraryId = "";
      persistPromptLibraryRecords();
      renderPromptLibrary();
      togglePromptLibraryModal(promptLibraryEditModal, false);
    });
    document.getElementById("confirmDeletePromptLibraryItem")?.addEventListener("click", () => {
      const record = promptLibraryRecords.find(item => item.id === deletingPromptLibraryId);
      promptLibraryRecords = promptLibraryRecords.filter(item => item.id !== deletingPromptLibraryId);
      if (record?.isDefault) {
        const next = promptLibraryRecords.find(item => item.category === record.category);
        if (next) next.isDefault = true;
      }
      deletingPromptLibraryId = "";
      persistPromptLibraryRecords();
      renderPromptLibrary();
      renderPromptLibraryPicker(document.getElementById("promptLibraryPickerSearch")?.value || "");
      togglePromptLibraryModal(promptLibraryDeleteModal, false);
      showToast(`“${record?.title || "提示词"}”已删除`);
    });
    document.getElementById("promptLibraryPickerSearch")?.addEventListener("input", event => renderPromptLibraryPicker(event.target.value));
    document.getElementById("confirmPromptLibraryPick")?.addEventListener("click", () => {
      const selectedId = document.querySelector("[name='promptLibraryPick']:checked")?.value;
      if (!selectedId) return showToast("请选择一条提示词");
      const record = promptLibraryRecords.find(item => item.id === selectedId);
      if (!record) return;
      applyPromptLibraryRecord(record);
      togglePromptLibraryModal(promptLibraryPickerModal, false);
    });
    document.getElementById("confirmSavePromptTemplate")?.addEventListener("click", () => {
      const name = document.getElementById("savePromptTemplateName")?.value.trim() || "";
      if (!name) return showToast("请输入模板名称");
      saveCurrentPromptToLibrary(name);
      togglePromptLibraryModal(savePromptTemplateModal, false);
    });
    document.querySelectorAll("[data-close-save-prompt-template]").forEach(button => button.addEventListener("click", () => togglePromptLibraryModal(savePromptTemplateModal, false)));
    document.querySelectorAll("[data-close-prompt-library-edit]").forEach(button => button.addEventListener("click", () => { editingPromptLibraryId = ""; togglePromptLibraryModal(promptLibraryEditModal, false); }));
    document.querySelectorAll("[data-close-prompt-library-delete]").forEach(button => button.addEventListener("click", () => { deletingPromptLibraryId = ""; togglePromptLibraryModal(promptLibraryDeleteModal, false); }));
    document.querySelectorAll("[data-close-prompt-library-picker]").forEach(button => button.addEventListener("click", () => togglePromptLibraryModal(promptLibraryPickerModal, false)));
    [promptLibraryEditModal,promptLibraryDeleteModal,promptLibraryPickerModal,savePromptTemplateModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) togglePromptLibraryModal(modal, false); }));
    renderPromptLibrary();

    /* 无限画布：项目列表、协作项目、新建项目与画布工作区 */
    const infiniteProjectModal = document.getElementById("infiniteProjectModal");
    const infiniteWorkspace = document.getElementById("infiniteCanvasWorkspace");
    const notifyCanvasHost = open => {
      if (window.parent !== window) window.parent.postMessage({ type:"infinite-canvas-workspace", open }, "*");
    };
    function toggleInfiniteProjectModal(open) {
      infiniteProjectModal?.classList.toggle("show", open);
      if (open) setTimeout(() => document.getElementById("infiniteProjectName")?.focus(), 30);
    }
    function enterInfiniteWorkspace(title) {
      const workspaceTitle = document.getElementById("infiniteCanvasWorkspaceTitle");
      if (workspaceTitle) workspaceTitle.textContent = title || "AI创作项目";
      if (infiniteWorkspace) infiniteWorkspace.hidden = false;
      document.body.style.overflow = "hidden";
      notifyCanvasHost(true);
    }
    function closeInfiniteWorkspace() {
      if (infiniteWorkspace) infiniteWorkspace.hidden = true;
      document.getElementById("canvasAgentDrawer")?.classList.remove("open");
      document.body.style.overflow = "";
      notifyCanvasHost(false);
    }
    document.querySelectorAll("[data-infinite-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-infinite-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-infinite-panel]").forEach(panel => panel.hidden = panel.dataset.infinitePanel !== button.dataset.infiniteTab);
    }));
    [document.getElementById("createInfiniteCanvasProject"), document.querySelector("[data-create-infinite-project]")].forEach(button => button?.addEventListener("click", () => toggleInfiniteProjectModal(true)));
    document.querySelectorAll("[data-open-infinite-project]").forEach(card => card.addEventListener("click", () => enterInfiniteWorkspace(card.dataset.projectName || card.querySelector("strong")?.textContent.trim())));
    document.querySelectorAll("[data-close-infinite-project]").forEach(button => button.addEventListener("click", () => toggleInfiniteProjectModal(false)));
    infiniteProjectModal?.addEventListener("click", event => { if (event.target === infiniteProjectModal) toggleInfiniteProjectModal(false); });
    document.getElementById("closeInfiniteCanvasWorkspace")?.addEventListener("click", closeInfiniteWorkspace);
    const canvasCollaboratorModal = document.getElementById("canvasCollaboratorModal");
    let savedCanvasCollaborators = [];
    let pendingCanvasCollaborators = [];
    function renderCanvasCollaborators() {
      const list = document.getElementById("canvasCollaboratorList");
      const count = document.getElementById("canvasCollaboratorCount");
      if (count) count.textContent = `- ${pendingCanvasCollaborators.length}`;
      if (!list) return;
      list.innerHTML = pendingCanvasCollaborators.length ? pendingCanvasCollaborators.map((member,index) => `<div class="canvas-collaborator-item"><span class="canvas-collaborator-avatar">${escapeHtml(member.name.slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.account)} · 待保存</small></div><button type="button" data-remove-canvas-collaborator="${index}">移除</button></div>`).join("") : '<div class="canvas-collaborator-empty"><div>♙</div><strong>暂无协同成员</strong><span>输入成员信息并点击查询</span></div>';
    }
    function toggleCanvasCollaboratorModal(open) {
      if (open) pendingCanvasCollaborators = savedCanvasCollaborators.map(item => ({...item}));
      canvasCollaboratorModal?.classList.toggle("show", open);
      if (open) { renderCanvasCollaborators(); setTimeout(() => document.getElementById("canvasCollaboratorSearch")?.focus(), 30); }
    }
    document.getElementById("openCanvasCollaboratorModal")?.addEventListener("click", () => toggleCanvasCollaboratorModal(true));
    document.getElementById("queryCanvasCollaborator")?.addEventListener("click", () => {
      const input = document.getElementById("canvasCollaboratorSearch");
      const account = input?.value.trim() || "";
      if (!account) return showToast("请输入用户名、手机号或邮箱");
      if (pendingCanvasCollaborators.some(member => member.account === account)) return showToast("该成员已在协同列表中");
      const name = /@/.test(account) ? account.split("@")[0] : /^1\d{10}$/.test(account) ? `成员 ${account.slice(-4)}` : account;
      pendingCanvasCollaborators.push({ name, account });
      if (input) input.value = "";
      renderCanvasCollaborators();
      showToast("已查询到成员，保存后生效");
    });
    document.getElementById("canvasCollaboratorList")?.addEventListener("click", event => {
      const button = event.target.closest("[data-remove-canvas-collaborator]");
      if (!button) return;
      pendingCanvasCollaborators.splice(Number(button.dataset.removeCanvasCollaborator), 1);
      renderCanvasCollaborators();
    });
    document.getElementById("saveCanvasCollaborators")?.addEventListener("click", () => {
      savedCanvasCollaborators = pendingCanvasCollaborators.map(item => ({...item}));
      toggleCanvasCollaboratorModal(false);
      showToast(`已保存 ${savedCanvasCollaborators.length} 位协作者`);
    });
    document.querySelectorAll("[data-close-canvas-collaborator]").forEach(button => button.addEventListener("click", () => toggleCanvasCollaboratorModal(false)));
    canvasCollaboratorModal?.addEventListener("click", event => { if (event.target === canvasCollaboratorModal) toggleCanvasCollaboratorModal(false); });
    const canvasAgentDrawer = document.getElementById("canvasAgentDrawer");
    function toggleCanvasAgent(open) {
      canvasAgentDrawer?.classList.toggle("open", open);
      canvasAgentDrawer?.setAttribute("aria-hidden", String(!open));
      document.getElementById("toggleCanvasAgent")?.classList.toggle("active", open);
      if (open) setTimeout(() => document.getElementById("canvasAgentInput")?.focus(), 220);
    }
    function submitCanvasAgent(text) {
      const value = (text || document.getElementById("canvasAgentInput")?.value || "").trim();
      if (!value) return showToast("请描述需要 Agent 完成的创作任务");
      const content = document.getElementById("canvasAgentContent");
      content?.insertAdjacentHTML("beforeend", `<div class="canvas-agent-message user">${escapeHtml(value)}</div><div class="canvas-agent-message ai">已读取当前画布中的文字、图片和视频节点。我会保留产品主体与现有视觉方向，生成一个可继续编辑的方案。</div>`);
      const input = document.getElementById("canvasAgentInput"); if (input) input.value = "";
      if (content) content.scrollTop = content.scrollHeight;
      showToast(document.getElementById("canvasAgentAuto")?.checked ? "Agent 已开始自动生成" : "Agent 已记录任务，等待确认生成");
    }
    document.getElementById("toggleCanvasAgent")?.addEventListener("click", () => toggleCanvasAgent(!canvasAgentDrawer?.classList.contains("open")));
    document.getElementById("closeCanvasAgent")?.addEventListener("click", () => toggleCanvasAgent(false));
    document.getElementById("sendCanvasAgent")?.addEventListener("click", () => submitCanvasAgent());
    document.getElementById("canvasAgentInput")?.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitCanvasAgent(); } });
    document.querySelectorAll("[data-canvas-agent-suggestion]").forEach(button => button.addEventListener("click", () => submitCanvasAgent(button.dataset.canvasAgentSuggestion)));
    document.getElementById("canvasAgentAdd")?.addEventListener("click", () => showToast("可添加图片、视频或引用画布节点"));
    [
      ["infiniteProjectName", "infiniteProjectNameCount", 50],
      ["infiniteProjectDescription", "infiniteProjectDescriptionCount", 200]
    ].forEach(([inputId, countId, max]) => document.getElementById(inputId)?.addEventListener("input", event => {
      const count = document.getElementById(countId);
      if (count) count.textContent = `${event.target.value.length}/${max}`;
    }));
    document.getElementById("searchInfiniteCollaborator")?.addEventListener("click", () => {
      const value = document.getElementById("infiniteProjectCollaborator")?.value.trim();
      showToast(value ? `已找到与“${value}”匹配的协作成员` : "请输入用户名、手机号或邮箱");
    });
    document.getElementById("confirmCreateInfiniteProject")?.addEventListener("click", () => {
      const nameInput = document.getElementById("infiniteProjectName");
      const name = nameInput?.value.trim() || "";
      if (!name) return showToast("请输入项目名称");
      const panel = document.querySelector("[data-infinite-panel='mine']");
      const card = document.createElement("article");
      card.className = "infinite-project-card";
      card.dataset.openInfiniteProject = "";
      card.dataset.projectName = name;
      card.innerHTML = `<div class="infinite-project-cover"><span>AI</span><b>${name.slice(0, 10)}</b></div><div class="infinite-project-body"><strong>${name.replace(/[<>]/g, "")}</strong><p>▣ 创建于今天　◷ 刚刚更新</p></div>`;
      card.addEventListener("click", () => enterInfiniteWorkspace(name));
      panel?.append(card);
      toggleInfiniteProjectModal(false);
      ["infiniteProjectName", "infiniteProjectDescription", "infiniteProjectCollaborator"].forEach(id => { const input = document.getElementById(id); if (input) input.value = ""; });
      ["infiniteProjectNameCount", "infiniteProjectDescriptionCount"].forEach((id, index) => { const count = document.getElementById(id); if (count) count.textContent = `0/${index ? 200 : 50}`; });
      enterInfiniteWorkspace(name);
      showToast("项目已创建，已进入画布工作区");
    });
    document.getElementById("infiniteProjectSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      document.querySelectorAll("[data-open-infinite-project]").forEach(card => card.hidden = Boolean(keyword && !card.innerText.toLowerCase().includes(keyword)));
    });

    /* 成片视频库：分组、筛选、导入与来源追踪 */
    let activeVideoFolder = "all";
    let editingVideoFolderNode = null;
    let deletingVideoFolderNode = null;
    const videoFolderModal = document.getElementById("videoFolderModal");
    const videoFolderDeleteModal = document.getElementById("videoFolderDeleteModal");
    function videoFolderId(node) { return node?.querySelector(":scope > .image-folder-row")?.dataset.videoFolder || ""; }
    function videoFolderLabel(node) { return node?.querySelector(":scope > .image-folder-row .folder-select span")?.textContent.trim() || ""; }
    function videoFolderDescendantIds(node) { return [...(node?.querySelectorAll("[data-video-folder]") || [])].map(row => row.dataset.videoFolder); }
    function videoFolderActions() { return '<span class="folder-actions"><button class="folder-action" type="button" data-add-video-subfolder title="新增子素材组">＋</button><button class="folder-action" type="button" data-edit-video-folder title="重命名或调整层级">改</button><button class="folder-action danger" type="button" data-delete-video-folder title="删除素材组">删</button></span>'; }
    function decorateVideoFolders() {
      document.querySelectorAll("#videoFolderTree .image-folder-node").forEach(node => {
        const row = node.querySelector(":scope > .image-folder-row");
        if (!row || row.dataset.videoFolder === "all") return;
        node.dataset.videoFolderName = videoFolderLabel(node);
        const caret = row.querySelector(":scope > .folder-caret");
        if (caret) {
          if (caret.tagName !== "BUTTON") { const button=document.createElement("button"); button.className="folder-caret"; button.type="button"; button.dataset.toggleVideoFolder=""; button.textContent="▼"; caret.replaceWith(button); }
          else caret.dataset.toggleVideoFolder = "";
        } else row.insertAdjacentHTML("afterbegin", '<button class="folder-caret" type="button" data-toggle-video-folder>▼</button>');
        if (!row.querySelector(".folder-actions")) row.insertAdjacentHTML("beforeend", videoFolderActions());
        if (!node.querySelector(":scope > .image-folder-children")) node.insertAdjacentHTML("beforeend", '<div class="image-folder-children"></div>');
      });
      const sectionHead = document.querySelector("#videoFolderTree > .image-folder-section-head");
      if (sectionHead && !sectionHead.querySelector("button")) sectionHead.insertAdjacentHTML("beforeend", '<div><button class="text-action" type="button" id="collapseAllVideoFolders">折叠</button><button class="image-group-add" type="button" id="createVideoGroupFromSidebar" title="新建顶级素材组">＋</button></div>');
    }
    function updateVideoFolderCounts() {
      const cards = [...document.querySelectorAll("#finishedVideoGrid [data-video-asset]")];
      document.querySelectorAll("#videoFolderTree [data-video-folder]").forEach(row => {
        const id = row.dataset.videoFolder;
        const node = row.closest(".image-folder-node");
        const ids = id === "all" ? null : videoFolderDescendantIds(node);
        const count = id === "all" ? cards.length : cards.filter(card => ids.includes(card.dataset.folderId)).length;
        const badge = row.querySelector(":scope > .folder-count");
        if (badge) badge.textContent = count;
      });
    }
    function fillVideoParentOptions(excludedNode) {
      const select = document.getElementById("videoFolderParentSelect");
      if (!select) return;
      const excluded = new Set(videoFolderDescendantIds(excludedNode));
      select.innerHTML = '<option value="all">无（顶级视频组）</option>' + [...document.querySelectorAll("#videoFolderTree [data-video-folder]")]
        .filter(row => row.dataset.videoFolder !== "all" && !excluded.has(row.dataset.videoFolder))
        .map(row => `<option value="${row.dataset.videoFolder}">${row.querySelector(".folder-select span")?.textContent.trim()}</option>`).join("");
    }
    function openVideoFolderEditor(node = null, parentId = "") {
      editingVideoFolderNode = node;
      fillVideoParentOptions(node);
      document.getElementById("videoFolderModalTitle").textContent = node ? "编辑视频组" : "新建视频组";
      document.getElementById("videoFolderNameInput").value = node ? videoFolderLabel(node) : "";
      document.getElementById("videoFolderDescriptionInput").value = node?.dataset.videoFolderDescription || "";
      const parentNode = node?.parentElement?.closest(".image-folder-node");
      document.getElementById("videoFolderParentSelect").value = parentId || videoFolderId(parentNode) || "all";
      videoFolderModal?.classList.add("show");
    }
    function videoFolderIncludes(cardFolder, selected) {
      if (selected === "all") return true;
      const selectedNode = document.querySelector(`#videoFolderTree [data-video-folder="${CSS.escape(selected)}"]`)?.closest(".image-folder-node");
      return selectedNode ? videoFolderDescendantIds(selectedNode).includes(cardFolder) : cardFolder === selected;
    }
    function renderFinishedVideos() {
      const keyword = document.getElementById("finishedVideoSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("finishedVideoSource")?.value || "all";
      let visible = 0;
      document.querySelectorAll("#finishedVideoGrid [data-video-asset]").forEach(card => {
        const matchFolder = videoFolderIncludes(card.dataset.folderId, activeVideoFolder);
        const matchSource = source === "all" || card.dataset.videoSource === source;
        const matchKeyword = !keyword || card.innerText.toLowerCase().includes(keyword);
        card.hidden = !(matchFolder && matchSource && matchKeyword);
        if (!card.hidden) visible += 1;
      });
      document.getElementById("finishedVideoEmpty")?.classList.toggle("show", visible === 0);
    }
    document.getElementById("videoFolderTree")?.addEventListener("click", event => {
      if (event.target.closest("#createVideoGroupFromSidebar")) return openVideoFolderEditor();
      if (event.target.closest("#collapseAllVideoFolders")) {
        const nodes = [...document.querySelectorAll("#videoFolderTree .image-folder-node")].filter(node => videoFolderId(node) && videoFolderId(node) !== "all");
        const shouldCollapse = nodes.some(node => !node.classList.contains("collapsed"));
        nodes.forEach(node => node.classList.toggle("collapsed", shouldCollapse));
        event.target.textContent = shouldCollapse ? "展开" : "折叠";
        return;
      }
      const node = event.target.closest(".image-folder-node");
      if (event.target.closest("[data-toggle-video-folder]")) { event.stopPropagation(); node?.classList.toggle("collapsed"); return; }
      if (event.target.closest("[data-add-video-subfolder]")) { event.stopPropagation(); return openVideoFolderEditor(null, videoFolderId(node)); }
      if (event.target.closest("[data-edit-video-folder]")) { event.stopPropagation(); return openVideoFolderEditor(node); }
      if (event.target.closest("[data-delete-video-folder]")) {
        event.stopPropagation(); deletingVideoFolderNode = node;
        const name = document.getElementById("deleteVideoFolderName"); if (name) name.textContent = videoFolderLabel(node);
        return videoFolderDeleteModal?.classList.add("show");
      }
      const row = event.target.closest("[data-video-folder]");
      if (!row) return;
      activeVideoFolder = row.dataset.videoFolder;
      document.querySelectorAll("#videoFolderTree .image-folder-row").forEach(item => item.classList.toggle("selected", item === row));
      const name = row.querySelector(".folder-select span")?.textContent.trim() || "全部成片";
      const current = document.getElementById("currentVideoFolderName");
      const crumb = document.getElementById("videoFolderBreadcrumb");
      if (current) current.textContent = name;
      if (crumb) crumb.textContent = name;
      const summary = document.querySelector("#currentVideoFolderName + small");
      if (summary) summary.textContent = row.dataset.videoFolder === "all" ? "展示全部视频素材" : "展示当前素材组及全部子组视频";
      renderFinishedVideos();
    });
    document.getElementById("finishedVideoSearch")?.addEventListener("input", renderFinishedVideos);
    document.getElementById("finishedVideoSource")?.addEventListener("change", renderFinishedVideos);
    document.getElementById("createVideoFolder")?.addEventListener("click", () => openVideoFolderEditor());
    document.getElementById("saveVideoFolder")?.addEventListener("click", () => {
      const name = document.getElementById("videoFolderNameInput")?.value.trim() || "";
      if (!name) return showToast("请输入视频组名称");
      if (/[\\/:*?\"<>|]/.test(name)) return showToast("视频组名称不能包含特殊符号");
      const parentValue = document.getElementById("videoFolderParentSelect")?.value || "all";
      const parentId = parentValue === "all" ? "" : parentValue;
      const parentNode = parentId ? document.querySelector(`#videoFolderTree [data-video-folder="${parentId}"]`)?.closest(".image-folder-node") : null;
      const target = parentNode?.querySelector(":scope > .image-folder-children") || document.getElementById("videoFolderTree");
      const duplicate = [...(target?.children || [])].some(child => child.matches(".image-folder-node") && child !== editingVideoFolderNode && videoFolderLabel(child) === name);
      if (duplicate) return showToast("同级下已存在同名视频素材组");
      if (editingVideoFolderNode) {
        editingVideoFolderNode.querySelector(":scope > .image-folder-row .folder-select span").textContent = name;
        editingVideoFolderNode.dataset.videoFolderName = name;
        editingVideoFolderNode.dataset.videoFolderDescription = document.getElementById("videoFolderDescriptionInput")?.value.trim() || "";
        if (editingVideoFolderNode.parentElement !== target) target?.append(editingVideoFolderNode);
        showToast("视频组已更新");
      } else {
        const id = "video-group-" + Date.now();
        const node = document.createElement("div");
        node.className = "image-folder-node";
        node.dataset.videoFolderName = name;
        node.dataset.videoFolderDescription = document.getElementById("videoFolderDescriptionInput")?.value.trim() || "";
        node.innerHTML = `<div class="image-folder-row" data-video-folder="${id}"><button class="folder-caret" type="button" data-toggle-video-folder>▼</button><button class="folder-select" type="button"><span>${name.replace(/[<>]/g, "")}</span></button><b class="folder-count">0</b>${videoFolderActions()}</div><div class="image-folder-children"></div>`;
        target?.append(node);
        parentNode?.classList.remove("collapsed");
        showToast("视频组已创建");
      }
      editingVideoFolderNode = null;
      videoFolderModal?.classList.remove("show");
      updateVideoFolderCounts();
    });
    document.getElementById("confirmDeleteVideoFolder")?.addEventListener("click", () => {
      if (!deletingVideoFolderNode) return;
      const ids = videoFolderDescendantIds(deletingVideoFolderNode);
      const parentNode = deletingVideoFolderNode.parentElement?.closest(".image-folder-node");
      const destination = videoFolderId(parentNode) || "internal";
      const clearAssets = document.querySelector("[name='videoFolderDeleteMode']:checked")?.value === "clear";
      document.querySelectorAll("#finishedVideoGrid [data-video-asset]").forEach(card => {
        if (!ids.includes(card.dataset.folderId)) return;
        if (clearAssets) card.remove(); else card.dataset.folderId = destination;
      });
      deletingVideoFolderNode.remove();
      deletingVideoFolderNode = null;
      activeVideoFolder = "all";
      videoFolderDeleteModal?.classList.remove("show");
      document.querySelectorAll("#videoFolderTree .image-folder-row").forEach(row => row.classList.toggle("selected", row.dataset.videoFolder === "all"));
      const current = document.getElementById("currentVideoFolderName"); if (current) current.textContent = "全部成片";
      const crumb = document.getElementById("videoFolderBreadcrumb"); if (crumb) crumb.textContent = "全部成片";
      updateVideoFolderCounts(); renderFinishedVideos();
      showToast(clearAssets ? "视频组及其中素材已删除" : "视频素材已迁移，视频组已删除");
    });
    document.querySelectorAll("[data-close-video-folder]").forEach(button => button.addEventListener("click", () => { editingVideoFolderNode = null; videoFolderModal?.classList.remove("show"); }));
    document.querySelectorAll("[data-close-video-folder-delete]").forEach(button => button.addEventListener("click", () => { deletingVideoFolderNode = null; videoFolderDeleteModal?.classList.remove("show"); }));
    [videoFolderModal, videoFolderDeleteModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) modal.classList.remove("show"); }));
    document.getElementById("importFinishedVideo")?.addEventListener("click", () => {
      const grid = document.getElementById("finishedVideoGrid");
      const card = document.createElement("article");
      card.className = "image-managed-card";
      card.dataset.videoAsset = "";
      card.dataset.folderId = activeVideoFolder === "all" ? "internal" : activeVideoFolder;
      card.dataset.videoSource = "内部制作";
      card.innerHTML = '<div class="video-managed-visual"><span class="video-source-badge">本地导入</span><span class="video-managed-play">▶</span><span class="video-duration">00:20</span></div><div class="image-managed-body"><strong>新导入成片</strong><p>本地文件 · 刚刚导入</p><div class="image-managed-meta"><span>待审核</span><span>1080P</span></div></div>';
      grid?.insertBefore(card, document.getElementById("finishedVideoEmpty"));
      updateVideoFolderCounts();
      renderFinishedVideos();
      showToast("成片已导入，并记录来源与当前视频组");
    });
    decorateVideoFolders();
    updateVideoFolderCounts();


    /* 资产库 · 竞品库 */
    /* 产品库：按产品开启竞品定时分析 */
    const productCompetitorMonitorModal = document.getElementById("productCompetitorMonitorModal");
    let pendingMonitorSwitch = null;
    document.querySelectorAll("#productMarketGrid [data-product-id]").forEach(card => {
      const body = card.querySelector(".product-market-body");
      if (!body || body.querySelector(".product-competitor-monitor")) return;
      body.insertAdjacentHTML("beforeend", '<span class="product-competitor-monitor"><span>开启竞品分析</span><label><input type="checkbox" data-product-competitor-monitor><i></i></label></span>');
    });
    document.getElementById("productMarketGrid")?.addEventListener("click", event => {
      const input = event.target.closest("[data-product-competitor-monitor]");
      if (!input) return;
      event.preventDefault(); event.stopPropagation();
      if (!input.checked) { input.checked = false; showToast("已关闭该产品的竞品定时分析"); return; }
      input.checked = false;
      pendingMonitorSwitch = input;
      document.getElementById("monitorProductName").value = input.closest("[data-product-id]")?.querySelector(".product-market-title strong")?.textContent.trim() || "当前产品";
      productCompetitorMonitorModal?.classList.add("show");
    });
    document.getElementById("saveProductMonitor")?.addEventListener("click", () => {
      if (pendingMonitorSwitch) pendingMonitorSwitch.checked = true;
      productCompetitorMonitorModal?.classList.remove("show");
      showToast(`已开启竞品分析，将按“${document.getElementById("monitorFrequency")?.value}”自动抓取`);
      pendingMonitorSwitch = null;
    });
    document.querySelectorAll("[data-close-product-monitor]").forEach(button => button.addEventListener("click", () => { pendingMonitorSwitch = null; productCompetitorMonitorModal?.classList.remove("show"); }));
    productCompetitorMonitorModal?.addEventListener("click", event => { if (event.target === productCompetitorMonitorModal) { pendingMonitorSwitch = null; productCompetitorMonitorModal.classList.remove("show"); } });

    const competitorEntryModal = document.getElementById("competitorEntryModal");
    const competitorReportModal = document.getElementById("competitorReportModal");
    const competitorDeleteModal = document.getElementById("competitorDeleteModal");
    const competitorImageModal = document.getElementById("competitorImageModal");
    const competitorTableBody = document.getElementById("competitorTableBody");
    document.querySelector('[data-competitor-entry-mode="manual"]')?.remove();
    let competitorEntryMode = "link";
    let editingCompetitorRow = null;
    let pendingDeleteCompetitorRow = null;
    let currentReportCompetitorRow = null;
    let competitorTotal = 28;
    let activeCompetitorReportTab = "product";
    const competitorReportDrafts = new WeakMap();
    const competitorReportDefaults = new Map([...document.querySelectorAll("[data-report-edit-key]")].map(element => [element.dataset.reportEditKey, element.tagName === "TEXTAREA" ? element.value : element.innerText]));

    function toggleCompetitorModal(modal, open) { modal?.classList.toggle("show", open); }
    function safeCompetitorUrl(value) { return /^https?:\/\//i.test(value || "") ? value : "#"; }
    function competitorPlatformClass(platform) { return platform.includes("京东") ? " jd" : platform.includes("淘宝") ? " tb" : platform.includes("小红书") ? " xhs" : ""; }
    function competitorRowData(row) {
      const cells = row?.children || [];
      const flowRow = Boolean(row?.querySelector(".competitor-select"));
      const offset = flowRow ? 1 : 0;
      return {
        name: row?.querySelector(".competitor-product-cell strong")?.textContent.trim() || "未命名竞品",
        source: row?.querySelector(".competitor-product-cell small")?.textContent.trim() || "手动录入",
        url: row?.querySelector(".competitor-source-link")?.getAttribute("href") || "#",
        platform: row?.querySelector(".competitor-platform")?.textContent.trim() || "未识别平台",
        sales: cells[4 + offset]?.textContent.trim() || "待补充",
        audience: cells[5 + offset]?.textContent.trim() || "待补充",
        selling: cells[6 + offset]?.textContent.trim() || "待补充",
        scene: cells[7 + offset]?.textContent.trim() || "待补充",
        category: cells[8 + offset]?.textContent.trim() || "待补充",
        updater: row?.querySelector(".competitor-updater")?.textContent.trim() || "嗡大发",
        updatedAt: row?.querySelector(".competitor-updated-at")?.textContent.trim() || "刚刚"
      };
    }
    function competitorRowHtml(data) {
      const url = safeCompetitorUrl(data.url);
      const linkLabel = url === "#" ? "暂无来源链接" : url.replace(/^https?:\/\//i, "");
      return `<td class="competitor-product-cell"><strong>${escapeHtml(data.name)}</strong><small>${escapeHtml(data.source || "手动录入")}</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-competitor-image>主图</button><button class="competitor-thumb detail" type="button" data-preview-competitor-image>详情</button></div></td><td><a class="competitor-source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(linkLabel)}</a></td><td><span class="competitor-platform${competitorPlatformClass(data.platform)}">${escapeHtml(data.platform)}</span></td><td><strong>${escapeHtml(data.sales || "待补充")}</strong></td><td class="competitor-cell-copy">${escapeHtml(data.audience || "待补充")}</td><td class="competitor-cell-copy">${escapeHtml(data.selling || "待补充")}</td><td class="competitor-cell-copy">${escapeHtml(data.scene || "待补充")}</td><td class="competitor-category-path">${escapeHtml(data.category || "待补充")}</td><td class="competitor-updater">${escapeHtml(data.updater || "嗡大发")}</td><td class="competitor-updated-at">${escapeHtml(data.updatedAt || "刚刚")}</td><td><div class="competitor-actions"><button type="button" data-view-competitor-report>查看报告</button><button type="button" data-download-competitor-report>下载报告</button><button type="button" data-edit-competitor>编辑</button><button class="danger" type="button" data-delete-competitor>删除</button></div></td>`;
    }
    function applyCompetitorRow(row, data) {
      row.dataset.competitorRow = "";
      row.dataset.name = data.name;
      row.dataset.platform = data.platform;
      row.dataset.category = data.category;
      row.innerHTML = competitorRowHtml(data);
    }
    function updateCompetitorCounts() {
      const rows = [...document.querySelectorAll("#competitorTableBody [data-competitor-row]")];
      const visible = rows.filter(row => !row.hidden).length;
      const visibleLabel = document.getElementById("competitorVisibleCount");
      if (visibleLabel) visibleLabel.textContent = `当前展示 ${visible} 条竞品数据`;
      const metric = document.getElementById("competitorTotalMetric");
      if (metric) metric.textContent = competitorTotal;
    }
    function setCompetitorEntryMode(mode) {
      competitorEntryMode = mode;
      document.querySelectorAll("[data-competitor-entry-mode]").forEach(button => button.classList.toggle("active", button.dataset.competitorEntryMode === mode));
      document.querySelectorAll("[data-competitor-entry-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.competitorEntryPanel === mode));
      const save = document.getElementById("saveCompetitorEntry");
      const hint = document.getElementById("competitorEntryHint");
      if (save) save.textContent = editingCompetitorRow ? "保存修改" : mode === "link" ? "解析并入库" : "新增竞品";
      if (hint) hint.textContent = mode === "link" ? "系统将解析公开商品信息，入库后仍可继续编辑。" : "手动录入字段保存后将进入竞品库并记录操作者。";
    }
    function resetCompetitorManualForm() {
      ["competitorNameInput","competitorUrlInput","competitorSalesInput","competitorCategoryInput","competitorAudienceInput","competitorSellingInput","competitorSceneInput"].forEach(id => { const input = document.getElementById(id); if (input) input.value = ""; });
      document.getElementById("competitorMaterialUpload").textContent = "点击上传产品主图或详情图";
    }
    function openCompetitorEntry(row = null) {
      editingCompetitorRow = row;
      document.getElementById("competitorEntryTitle").textContent = row ? "编辑竞品" : "录入竞品";
      document.querySelectorAll("[data-competitor-entry-mode]").forEach(button => { button.disabled = Boolean(row) && button.dataset.competitorEntryMode !== "manual"; });
      if (row) {
        const data = competitorRowData(row);
        document.getElementById("competitorNameInput").value = data.name;
        document.getElementById("competitorPlatformInput").value = [...document.getElementById("competitorPlatformInput").options].some(option => option.text === data.platform) ? data.platform : "抖音";
        document.getElementById("competitorUrlInput").value = data.url === "#" ? "" : data.url;
        document.getElementById("competitorSalesInput").value = data.sales;
        document.getElementById("competitorCategoryInput").value = data.category;
        document.getElementById("competitorAudienceInput").value = data.audience;
        document.getElementById("competitorSellingInput").value = data.selling;
        document.getElementById("competitorSceneInput").value = data.scene;
        setCompetitorEntryMode("manual");
      } else {
        resetCompetitorManualForm();
        document.getElementById("competitorLinkInput").value = "";
        document.getElementById("competitorParseFeedback").classList.remove("show");
        setCompetitorEntryMode("link");
      }
      toggleCompetitorModal(competitorEntryModal, true);
    }
    function setCompetitorReportTab(tab) {
      activeCompetitorReportTab = tab;
      document.querySelectorAll("[data-competitor-report-tab]").forEach(button => button.classList.toggle("active", button.dataset.competitorReportTab === tab));
      document.querySelectorAll("[data-competitor-report-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.competitorReportPanel === tab));
      competitorReportModal?.querySelector(".modal-body")?.scrollTo({ top:0, behavior:"smooth" });
    }
    function resetCompetitorReportEdits() {
      document.querySelectorAll("[data-report-edit-key]").forEach(element => {
        const value = competitorReportDefaults.get(element.dataset.reportEditKey) || "";
        if (element.tagName === "TEXTAREA") element.value = value;
        else element.innerText = value;
      });
    }
    function applyCompetitorReportDraft(row) {
      resetCompetitorReportEdits();
      const draft = competitorReportDrafts.get(row);
      if (!draft) return;
      Object.entries(draft).forEach(([key,value]) => {
        const element = document.querySelector(`[data-report-edit-key="${CSS.escape(key)}"]`);
        if (!element) return;
        if (element.tagName === "TEXTAREA") element.value = value;
        else element.innerText = value;
      });
    }
    const competitorParameterProfiles = {
      "个护类": {
        benchmark:"头部个护旗舰款",
        logic:"围绕功效表现、人体接触体验、护理技术、安全和便携性进行对比",
        rows:[
          ["核心功能","高速吹护 / 造型护理","高速吹护 + 智能温控","功能覆盖接近，需比较实际效果"],
          ["电机 / 动力","11万转高速电机","11.5万转无刷电机","对标款动力参数略高"],
          ["温度与档位","4档温度、2档风速","5档温度、3档风速","对标款调节颗粒度更细"],
          ["护理技术","负离子护发","高浓度负离子 + 水润离子","对标款护理概念更完整"],
          ["智能温控","每秒50次温度监测","每秒100次温度监测","当前竞品温控频率偏低"],
          ["附件配置","集风嘴、柔风嘴","集风嘴、扩散风嘴、顺发风嘴","对标款附件更丰富"],
          ["噪音","约59dB","约56dB","对标款静音表现更优"],
          ["续航 / 供电","有线供电","有线供电","一致"],
          ["重量","约407g","约390g","当前竞品略重"],
          ["防水与清洁","滤网可拆洗","磁吸滤网可拆洗","对标款维护更便捷"],
          ["安全保护","过热保护、儿童锁","过热保护、NTC温控、儿童锁","对标款安全配置更细"],
          ["适用人群 / 场景","家庭日常、长发人群","家庭、沙龙、差旅","对标款场景覆盖更广"]
        ]
      },
      "环境类": {
        benchmark:"头部环境电器旗舰款",
        logic:"围绕环境改善效率、覆盖面积、传感监测、耗材成本与持续运行体验进行对比",
        rows:[
          ["核心环境指标","颗粒物 CADR 400m³/h","颗粒物 CADR 500m³/h","对标款净化效率更高"],
          ["适用面积","28–48㎡","35–60㎡","对标款覆盖范围更大"],
          ["污染物处理","PM2.5、花粉、异味","PM2.5、甲醛、花粉、异味","当前竞品甲醛能力不足"],
          ["滤网结构","初效 + HEPA + 活性炭","复合HEPA + 高碘值活性炭","对标款滤材规格更强"],
          ["滤芯寿命","约8–12个月","约12–18个月","对标款维护周期更长"],
          ["风量 / 档位","4档风量","自动 + 睡眠 + 5档风量","对标款模式更丰富"],
          ["噪音","睡眠档 32dB","睡眠档 28dB","对标款夜间体验更优"],
          ["传感器","PM2.5、温湿度","PM1.0、PM2.5、VOC、温湿度","当前监测维度较少"],
          ["智能联动","APP远程、定时","APP、语音、场景联动","对标款生态能力更强"],
          ["额定功耗","45W","52W","当前竞品能耗更低"],
          ["耗材成本","滤芯约299元","滤芯约359元","当前竞品维护成本更低"],
          ["适用场景","卧室、客厅","全屋、母婴、养宠、新装修","对标款场景表达更充分"]
        ]
      },
      "清洁类": {
        benchmark:"喵卫 X1 robot",
        logic:"围绕清洁力、清洁结构、路径与边缘能力、续航、维护成本和场景适配进行对比",
        rows:[
          ["核心清洁方式","高频拍打 + 飓风吸尘","扫震一体 + 深紫外除螨","两者技术路径不同"],
          ["拍打频率","20000 次/分钟","15000 次/分钟","当前竞品拍打参数领先"],
          ["吸力","15000Pa","14AW","参数口径不同，需统一实测"],
          ["杀菌配置","UV灯，除螨/杀菌99.9%","270nm UV-C，官方认证","对标款认证背书更强"],
          ["滚刷结构","防缠绕螺旋拍打滚刷","3叶螺旋胶条滚刷","均强调防缠绕"],
          ["路径 / 操控","一键智能巡航","弓字型全域巡航","对标款路径描述更明确"],
          ["边缘与防跌落","基础防跌落传感器","9颗高精度近距传感器","当前竞品传感配置偏弱"],
          ["续航","30分钟","60分钟","对标款续航领先"],
          ["尘杯 / 水箱","可视尘杯、双重过滤","可视尘仓、热风除湿","功能方向不同"],
          ["机身重量","1.7kg","1kg","当前竞品偏重"],
          ["清洁档位","4档","4档","持平"],
          ["维护与自清洁","滚刷滤网可拆洗","热风除湿 + 易拆洗","对标款维护体验更完整"],
          ["适配场景","床垫、床品日常除螨","多软装、多场景","当前场景较集中"]
        ]
      },
      "厨电类": {
        benchmark:"同容量头部厨电款",
        logic:"围绕容量、加热效率、控温、菜单、材质、清洁便利性和厨房安全进行对比",
        rows:[
          ["容量","4.5L","5L","对标款容量略大"],
          ["额定功率","1500W","1700W","对标款升温速度更有优势"],
          ["加热方式","顶部热风循环","360°立体热风循环","对标款热均匀性表达更强"],
          ["温度范围","80–200℃","40–220℃","对标款温域更广"],
          ["时间范围","1–60分钟","1–120分钟","对标款覆盖慢烹场景"],
          ["操控方式","触控面板","彩屏触控 + 旋钮","对标款盲操体验更好"],
          ["预设菜单","8种","12种","对标款菜单更丰富"],
          ["可视化","大尺寸可视窗","可视窗 + 炉灯","对标款观察更清晰"],
          ["内胆 / 涂层","食品级不粘涂层","陶瓷不粘涂层","需比较耐磨与安全认证"],
          ["清洁方式","炸篮可拆洗","炸篮、接油盘可拆洗","对标款清洁结构更完整"],
          ["安全配置","断电记忆、过热保护","过热保护、开盖断电、童锁","当前竞品安全配置较少"],
          ["适用场景","家庭快手餐、聚餐","家庭、烘焙、低温解冻","对标款场景覆盖更广"]
        ]
      },
      "健康类": {
        benchmark:"头部健康监测旗舰款",
        logic:"围绕核心健康功能、测量准确性、传感器、数据维度、医疗认证和长期使用体验进行对比",
        rows:[
          ["核心健康功能","体征监测与趋势记录","多体征监测 + 风险提醒","对标款健康管理更主动"],
          ["测量精度","家用标准精度","医疗级算法校准","对标款精度背书更强"],
          ["传感器配置","单组高精度传感器","双组传感器 + 环境补偿","对标款抗干扰能力更强"],
          ["测量范围","覆盖家庭常用范围","覆盖儿童、成人、老年模式","对标款人群适配更广"],
          ["数据指标","8项核心指标","15项健康指标","对标款数据维度更丰富"],
          ["结果呈现","屏显 + APP趋势","彩屏 + APP + 异常提醒","对标款反馈更直观"],
          ["适用人群","家庭成人用户","儿童、孕妇、成人、老年人","当前竞品人群覆盖偏窄"],
          ["连接方式","蓝牙","蓝牙 + Wi-Fi","对标款同步更稳定"],
          ["续航","约30天","约60天","对标款续航领先"],
          ["材质与舒适性","亲肤接触材质","医用级接触材质","对标款材质背书更强"],
          ["认证资质","CE / RoHS","二类医疗器械认证","当前竞品医疗认证不足"],
          ["适用场景","家庭日常健康管理","家庭、慢病、远程照护","对标款健康服务场景更完整"]
        ]
      }
    };
    function inferCompetitorParameterCategory(data) {
      const text = ((data.category || "") + " " + (data.name || "")).toLowerCase();
      if (/个护|美容|美发|吹风|剃须|脱毛|电动牙刷|冲牙|按摩/.test(text)) return "个护类";
      if (/环境|空气净化|净化器|加湿|除湿|新风|取暖|风扇|循环扇/.test(text)) return "环境类";
      if (/清洁|除螨|洗地|吸尘|扫地|擦窗|蒸汽拖把/.test(text)) return "清洁类";
      if (/厨|空气炸锅|烤箱|蒸箱|电饭|破壁|料理|咖啡|饮水|制冰/.test(text)) return "厨电类";
      if (/健康|血压|血糖|体脂|体温|制氧|理疗|雾化|助眠|健康监测/.test(text)) return "健康类";
      return "清洁类";
    }
    function renderCompetitorParameterComparison(category, currentName, automatic = false) {
      const profile = competitorParameterProfiles[category] || competitorParameterProfiles["清洁类"];
      const selector = document.getElementById("reportComparisonCategory");
      if (selector) selector.value = category;
      document.getElementById("reportParameterCategoryBadge").textContent = category;
      document.getElementById("reportParameterCategoryHint").textContent = (automatic ? "已根据当前商品类目自动匹配：" : "已手动切换对比模板：") + profile.logic;
      document.getElementById("reportParameterCurrentName").textContent = currentName || "当前竞品";
      document.getElementById("reportParameterBenchmarkName").textContent = profile.benchmark;
      document.getElementById("reportParameterTableBody").innerHTML = profile.rows.map(row => "<tr>" + row.map((cell,index) => "<td" + (index === 1 ? " contenteditable=\"true\" class=\"cr-editable\"" : "") + ">" + escapeHtml(cell) + "</td>").join("") + "</tr>").join("");
    }
    function hydrateCompetitorReport(row) {
      const data = competitorRowData(row);
      document.getElementById("competitorReportTitle").textContent = data.name;
      document.getElementById("reportPlatform").textContent = data.platform;
      document.getElementById("reportSales").textContent = data.sales;
      document.getElementById("reportCategory").textContent = data.category;
      document.getElementById("reportAudience").textContent = data.audience;
      document.getElementById("reportSelling").textContent = data.selling;
      document.getElementById("reportScene").textContent = data.scene;
      document.querySelectorAll("[data-report-product-name]").forEach(element => { element.textContent = data.name; });
      renderCompetitorParameterComparison(inferCompetitorParameterCategory(data), data.name, true);
      applyCompetitorReportDraft(row);
      return data;
    }
    function saveCompetitorReportDraft() {
      if (!currentReportCompetitorRow) return;
      const draft = {};
      document.querySelectorAll("[data-report-edit-key]").forEach(element => { draft[element.dataset.reportEditKey] = element.tagName === "TEXTAREA" ? element.value : element.innerText; });
      competitorReportDrafts.set(currentReportCompetitorRow, draft);
      showToast("三 TAB 编辑内容与备注已保存至竞品档案");
    }
    function openCompetitorReport(row) {
      currentReportCompetitorRow = row;
      hydrateCompetitorReport(row);
      setCompetitorReportTab("product");
      toggleCompetitorModal(competitorReportModal, true);
    }
    function copyCompetitorReportText(text) {
      const value = (text || "").trim();
      if (!value) return showToast("暂无可复制内容");
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(() => showToast("内容已复制")).catch(() => showToast("复制失败，请手动选择文本"));
      else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.append(input);
        input.select();
        document.execCommand("copy");
        input.remove();
        showToast("内容已复制");
      }
    }
    function reportSectionText(sectionName) {
      if (sectionName === "active") return document.querySelector(`[data-competitor-report-panel="${activeCompetitorReportTab}"]`)?.innerText || "";
      return document.querySelector(`[data-report-section="${sectionName}"]`)?.innerText || "";
    }
    function downloadCompetitorReport(row) {
      if (!row) return;
      const data = hydrateCompetitorReport(row);
      const source = document.getElementById("competitorReportContent");
      const clone = source.cloneNode(true);
      clone.querySelectorAll(".cr-panel").forEach((panel,index) => { panel.style.display = "block"; panel.insertAdjacentHTML("afterbegin", `<h2>${index === 0 ? "TAB1 产品分析" : index === 1 ? "TAB2 主图分析" : "TAB3 详情图分析"}</h2>`); });
      clone.querySelectorAll("button").forEach(button => button.remove());
      clone.querySelectorAll("textarea").forEach(area => { const paragraph = document.createElement("p"); paragraph.textContent = area.value || "暂无补充备注"; area.replaceWith(paragraph); });
      clone.querySelectorAll("[contenteditable]").forEach(element => element.removeAttribute("contenteditable"));
      const report = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(data.name)}竞品分析报告</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:0;padding:30px;color:#343742;line-height:1.65;background:#fff}h1{font-size:24px;margin:0}h2{margin:30px 0 12px;padding-bottom:8px;border-bottom:2px solid #625bd5;color:#3e4250}h4,h5{margin:8px 0}p{white-space:pre-line}section,article,.cr-section,.cr-analysis-card,.cr-summary-card,.cr-insight-card,.cr-qa-card,.cr-analysis-block{margin:10px 0;padding:12px;border:1px solid #ddd;border-radius:8px;break-inside:avoid}.cr-grid-2,.cr-summary-grid,.cr-analysis-columns,.cr-global-review,.cr-demographic,.cr-qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.competitor-report-facts,.cr-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.competitor-report-fact,.cr-kpi{padding:8px;border:1px solid #ddd}.cr-data-table{width:100%;border-collapse:collapse;font-size:11px}.cr-data-table th,.cr-data-table td{padding:7px;border:1px solid #ddd;text-align:left}.cr-media-thumb,.cr-product-cover,.cr-long-segment{padding:18px;border-radius:8px;color:#fff;background:#6963d7}.cr-bar-track{height:8px;background:#eee}.cr-bar-track i{display:block;height:100%;background:#6963d7}.cr-gallery,.cr-detail-preview{margin-bottom:12px}.cr-prompt{padding:8px;background:#f5f2ff}.badge,.cr-module-badge{font-size:10px;color:#625bd5}@media print{body{padding:0}.cr-section,article{break-inside:avoid}}</style></head><body><h1>${escapeHtml(data.name)} · 三 TAB 竞品分析报告</h1><p>平台：${escapeHtml(data.platform)}　公开销量：${escapeHtml(data.sales)}　导出时间：${new Date().toLocaleString()}</p>${clone.innerHTML}<p style="margin-top:28px;color:#888;font-size:11px;">数据来自平台公开信息、链接解析和用户补充；部分分析内容由 AI 生成。</p></body></html>`;
      const blob = new Blob([report], { type: "text/html;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${data.name.replace(/[\\/:*?"<>|]/g, "-")}-三TAB竞品分析报告.html`;
      document.body.append(link);
      link.click();
      const href = link.href;
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 800);
      showToast("完整报告已导出，包含三 TAB 全部内容");
    }
    function filterCompetitorRows() {
      const keyword = document.getElementById("competitorSearch")?.value.trim().toLowerCase() || "";
      const platform = document.getElementById("competitorPlatformFilter")?.value || "all";
      const category = document.getElementById("competitorCategoryFilter")?.value || "all";
      document.querySelectorAll("#competitorTableBody [data-competitor-row]").forEach(row => {
        const matchesKeyword = !keyword || row.textContent.toLowerCase().includes(keyword);
        const matchesPlatform = platform === "all" || row.dataset.platform === platform;
        const matchesCategory = category === "all" || row.dataset.category.includes(category);
        row.hidden = !(matchesKeyword && matchesPlatform && matchesCategory);
      });
      updateCompetitorCounts();
    }
    document.querySelectorAll("[data-open-competitor-entry]").forEach(button => button.addEventListener("click", () => openCompetitorEntry()));
    document.querySelectorAll("[data-close-competitor-entry]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorEntryModal, false)));
    document.querySelectorAll("[data-close-competitor-report]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorReportModal, false)));
    document.querySelectorAll("[data-close-competitor-delete]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorDeleteModal, false)));
    document.querySelectorAll("[data-close-competitor-image]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorImageModal, false)));
    document.querySelectorAll("[data-competitor-entry-mode]").forEach(button => button.addEventListener("click", () => setCompetitorEntryMode(button.dataset.competitorEntryMode)));
    document.getElementById("parseCompetitorLinks")?.addEventListener("click", () => {
      const value = document.getElementById("competitorLinkInput").value.trim();
      if (!value) return showToast("请先粘贴竞品商品链接");
      document.getElementById("competitorParseFeedback").classList.add("show");
      showToast("链接解析完成，可确认入库");
    });
    document.getElementById("competitorMaterialUpload")?.addEventListener("click", event => { event.currentTarget.textContent = "已选择：竞品主图 2 张、详情图 4 张"; event.currentTarget.classList.add("selected"); });
    document.getElementById("saveCompetitorEntry")?.addEventListener("click", () => {
      let data;
      if (competitorEntryMode === "manual") {
        const name = document.getElementById("competitorNameInput").value.trim();
        if (!name) return showToast("请填写竞品产品名称");
        data = { name, source: editingCompetitorRow ? "手动编辑" : "手动录入", updater:"嗡大发", updatedAt:"刚刚", platform: document.getElementById("competitorPlatformInput").value, url: document.getElementById("competitorUrlInput").value.trim() || "#", sales: document.getElementById("competitorSalesInput").value.trim() || "待补充", category: document.getElementById("competitorCategoryInput").value.trim() || "待补充", audience: document.getElementById("competitorAudienceInput").value.trim() || "待补充", selling: document.getElementById("competitorSellingInput").value.trim() || "待补充", scene: document.getElementById("competitorSceneInput").value.trim() || "待补充" };
      } else if (competitorEntryMode === "link") {
        const url = document.getElementById("competitorLinkInput").value.trim().split(/\n+/)[0];
        if (!url) return showToast("请至少粘贴一个竞品链接");
        const platform = /jd/i.test(url) ? "京东" : /taobao|tmall/i.test(url) ? "淘宝 / 天猫" : /xiaohongshu/i.test(url) ? "小红书" : /pinduoduo/i.test(url) ? "拼多多" : "抖音";
        data = { name:"智能解析竞品商品", source:"链接解析", updater:"嗡大发", updatedAt:"刚刚", platform, url, sales:"待同步", category:"家用电器 / 待确认类目", audience:"待完善", selling:"已提取公开商品卖点", scene:"待完善" };
      }
      if (editingCompetitorRow) {
        applyCompetitorRow(editingCompetitorRow, data);
        showToast("竞品信息已更新");
      } else {
        const row = document.createElement("tr");
        applyCompetitorRow(row, data);
        competitorTableBody.prepend(row);
        competitorTotal += 1;
        showToast("竞品数据已入库");
      }
      editingCompetitorRow = null;
      toggleCompetitorModal(competitorEntryModal, false);
      filterCompetitorRows();
    });
    competitorTableBody?.addEventListener("click", event => {
      const row = event.target.closest("[data-competitor-row]");
      if (!row) return;
      if (event.target.closest("[data-view-competitor-report]")) return openCompetitorReport(row);
      if (event.target.closest("[data-download-competitor-report]")) return downloadCompetitorReport(row);
      if (event.target.closest("[data-edit-competitor]")) return openCompetitorEntry(row);
      if (event.target.closest("[data-delete-competitor]")) {
        pendingDeleteCompetitorRow = row;
        document.getElementById("deleteCompetitorName").textContent = competitorRowData(row).name;
        toggleCompetitorModal(competitorDeleteModal, true);
        return;
      }
      if (event.target.closest("[data-preview-competitor-image]")) {
        const data = competitorRowData(row);
        document.getElementById("competitorImageTitle").textContent = `${data.name} · ${event.target.textContent.trim()}`;
        document.getElementById("competitorImagePreview").textContent = `${data.name}\n商品视觉预览`;
        toggleCompetitorModal(competitorImageModal, true);
      }
    });
    document.getElementById("productRelatedCompetitorBody")?.addEventListener("click", event => {
      const row = event.target.closest("[data-product-related-competitor]");
      if (!row) return;
      if (event.target.closest("[data-view-related-competitor-report]")) return openCompetitorReport(row);
      if (event.target.closest("[data-download-related-competitor-report]")) return downloadCompetitorReport(row);
      if (event.target.closest("[data-preview-related-competitor-image]")) {
        const data = competitorRowData(row);
        document.getElementById("competitorImageTitle").textContent = `${data.name} · ${event.target.textContent.trim()}`;
        document.getElementById("competitorImagePreview").textContent = `${data.name}\n商品视觉预览`;
        toggleCompetitorModal(competitorImageModal, true);
      }
    });
    document.getElementById("confirmDeleteCompetitor")?.addEventListener("click", () => {
      if (!pendingDeleteCompetitorRow) return;
      const name = competitorRowData(pendingDeleteCompetitorRow).name;
      pendingDeleteCompetitorRow.remove();
      pendingDeleteCompetitorRow = null;
      competitorTotal = Math.max(0, competitorTotal - 1);
      toggleCompetitorModal(competitorDeleteModal, false);
      updateCompetitorCounts();
      showToast(`“${name}”已删除，操作记录已留痕`);
    });
    document.querySelectorAll("[data-competitor-report-tab]").forEach(button => button.addEventListener("click", () => setCompetitorReportTab(button.dataset.competitorReportTab)));
    document.getElementById("reportComparisonCategory")?.addEventListener("change", event => {
      const currentName = currentReportCompetitorRow ? competitorRowData(currentReportCompetitorRow).name : "当前竞品";
      renderCompetitorParameterComparison(event.target.value, currentName, false);
      showToast(`已切换为${event.target.value}参数对比模板`);
    });
    competitorReportModal?.addEventListener("click", event => {
      const promptButton = event.target.closest("[data-copy-report-prompt]");
      if (promptButton) return copyCompetitorReportText(promptButton.closest(".cr-prompt")?.querySelector("span")?.innerText || "");
      const copyButton = event.target.closest("[data-report-copy-section]");
      if (copyButton) return copyCompetitorReportText(reportSectionText(copyButton.dataset.reportCopySection));
      const screenshotButton = event.target.closest("[data-report-screenshot]");
      if (screenshotButton) return showToast("当前分析内容已生成高清截图");
      const exportButton = event.target.closest("[data-report-export]");
      if (exportButton) return showToast(`${exportButton.dataset.reportExport}图片与拆解内容已导出`);
      const assetButton = event.target.closest("[data-report-save-asset]");
      if (assetButton) return showToast(`${assetButton.dataset.reportSaveAsset}已存入资产库 · 图片库 / 竞品分析`);
      const preview = event.target.closest("[data-report-image-preview]");
      if (preview) {
        const data = currentReportCompetitorRow ? competitorRowData(currentReportCompetitorRow) : { name:"竞品" };
        document.getElementById("competitorImageTitle").textContent = `${data.name} · ${preview.dataset.reportImagePreview}`;
        document.getElementById("competitorImagePreview").textContent = `${preview.dataset.reportImagePreview}\n局部高清视觉预览`;
        toggleCompetitorModal(competitorImageModal, true);
      }
    });
    document.getElementById("saveCompetitorReportEdits")?.addEventListener("click", saveCompetitorReportDraft);
    document.getElementById("saveCompetitorReportFooter")?.addEventListener("click", saveCompetitorReportDraft);
    document.getElementById("printCompetitorReport")?.addEventListener("click", () => { showToast("已打开当前 TAB 打印视图"); window.print(); });
    document.getElementById("downloadCurrentCompetitorReport")?.addEventListener("click", () => downloadCompetitorReport(currentReportCompetitorRow));
    document.getElementById("downloadCompetitorReportFooter")?.addEventListener("click", () => downloadCompetitorReport(currentReportCompetitorRow));
    document.getElementById("competitorSearch")?.addEventListener("input", filterCompetitorRows);
    document.getElementById("competitorPlatformFilter")?.addEventListener("change", filterCompetitorRows);
    document.getElementById("competitorCategoryFilter")?.addEventListener("change", filterCompetitorRows);
    document.getElementById("refreshCompetitors")?.addEventListener("click", () => { showToast("竞品公开数据已刷新"); updateCompetitorCounts(); });
    [competitorEntryModal, competitorReportModal, competitorDeleteModal, competitorImageModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) toggleCompetitorModal(modal, false); }));
    updateCompetitorCounts();

    /* ── 爆款内容结构：统一管理说什么、拍什么、怎么剪 ── */
    const clNewModal = document.getElementById("clNewModal");
    const clDeleteModal = document.getElementById("clDeleteModal");
    const clDetailDrawer = document.getElementById("clDetailDrawer");
    const clDrawerOverlay = document.getElementById("clDrawerOverlay");
    const clLearningSampleDetail = document.getElementById("clLearningSampleDetail");
    const clLearningSampleDetailBody = document.getElementById("clLearningSampleDetailBody");
    const clEscape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
    const clVariableDescriptions = {
      "产品名":"本次创作所选产品的名称", "可视化结果":"可被画面直接证明的结果，如前后差异、吸出物或使用后状态", "表面状态":"用户以为正常、但实际仍存在问题的状态", "隐性问题":"需要通过产品解决的深层问题或风险",
      "核心动作":"产品完成关键能力的可拍摄动作", "问题对象":"被处理、解决或改善的具体对象", "核心场景":"产品最主要的使用场景", "扩展场景":"可补充证明效果的其他使用场景", "可验证内容":"可在画面或产品事实中验证的结果",
      "预期反差":"结果与用户原有认知之间的差异", "关键动作":"能完整说明产品能力的核心操作", "使用场景":"用户实际发生问题或使用产品的场景", "目标人群":"最容易对该问题产生共鸣的用户",
      "生活场景":"目标用户高频发生、易代入的日常情境", "触发问题":"在该情境下被感知到的具体不便或需求", "现实限制":"时间、精力、空间或操作条件带来的阻碍", "原有方式":"用户当前采用但效果有限的做法",
      "具体问题":"需要被产品改善的明确问题", "实际损失":"问题持续带来的时间、体验或成本损失", "关键环节":"产品发挥能力时最值得呈现的步骤", "解决结果":"该动作直接带来的可感知改善",
      "核心卖点":"产品能解决问题的关键能力或优势", "核心价值":"用户最终获得的主要价值", "行动入口":"用户下一步可执行的了解或购买入口", "用户认知":"用户原先的习惯、判断或误区",
      "证明结果":"可通过画面、事实或使用反馈验证的结论", "核心需求":"目标人群最在意的待解决需求", "关键信息":"需要在本阶段被用户理解的利益点", "权益信息":"当前可用、且可核验的价格或福利信息",
      "优惠门槛":"获得权益需要满足的条件", "权益价值":"用户因优惠而获得的明确价值", "购买顾虑":"阻碍用户进一步行动的主要顾虑"
    };

    let contentStructures = [
      {
        id: 1, name: "结果前置·实拍证明型", formula: "结果钩子 → 痛点解释 → 产品演示 → 效果证明 → 行动引导",
        source: "千川学习", method: "平台数据学习", learningStatus:"生效中", learningSampleCount:3842, learnedAt:"2026-08-10", updated: "08-10 16:42", parseStatus:"completed", mixProfile:"result", autoProductIds:["mite-pro"], productNames:["轻净 Pro 除螨仪"], scriptTypes:["痛点类型","活动类型","对比类型","点名人群类型","网络爆款音频类型","正话反说类型"], defaultForScriptTypes:["痛点类型","活动类型","网络爆款音频类型"],
        stages: [
          { name:"结果型视觉钩子", purpose:"先给结果，快速建立好奇与观看理由", say:"先抛出清洁后的反差结果，让用户立刻知道视频能解决什么问题。", talk:"先别听我讲参数，直接看{产品名}走完一遍后的{可视化结果}。", slots:["产品名","可视化结果"], visual:"可被直接验证的结果、前后差异或反常状态；至少 1 个近景镜头。", edit:"1–2 个近景；单镜 1–2 秒；结果画面直接硬切进入。" },
          { name:"隐性痛点放大", purpose:"解释为什么表面正常仍需要解决", say:"说明肉眼看着干净，不代表纤维深处没有毛发、碎屑和灰尘。", talk:"你以为{表面状态}就够了，其实{隐性问题}并没有解决。", slots:["表面状态","隐性问题"], visual:"问题对象的细节、隐性问题的可见证据，或用户常见错误做法。", edit:"2–3 个细节镜头；正常速度；随信息点硬切。" },
          { name:"产品能力演示", purpose:"用真实操作承接解决方案，而不是只讲参数", say:"表达高频拍打与同步吸尘如何把深层脏污带出来。", talk:"{产品名}通过{核心动作}，把{问题对象}直接带出来。", slots:["核心动作","问题对象"], visual:"产品露出、关键动作与完整使用过程；动作镜头需连续清晰。", edit:"3–4 个动作镜头；保留完整关键动作；可轻微加速。" },
          { name:"结果与场景证明", purpose:"证明产品有效，并覆盖更多使用场景", say:"用可见结果强化清洁能力和真实可信感。", talk:"{核心场景}、{扩展场景}都能用，清洁结果可以直接看见。", slots:["核心场景","扩展场景"], visual:"使用后结果、前后对比，以及一个以上可复用场景。", edit:"2 个结果镜头；结果特写短暂停留；多场景硬切。" },
          { name:"行动引导", purpose:"收束价值并给出明确下一步", say:"引导进入商品页查看完整实测与产品信息。", talk:"想看{可验证内容}，点击商品了解更多。", slots:["可验证内容"], visual:"产品主体、使用完成状态或可承接口播的稳定画面。", edit:"1–2 个稳定镜头；素材不足可短时定帧。" }
        ],
        reuse:"需要有可视化结果、完整操作过程或前后对比等可证明画面；仅有静态产品展示时不建议使用。",
        example:{ title:"轻净 Pro 除螨仪｜床褥结果冲击型", meta:"代表性高消耗成品 · 素材 ID 7553983811703193643", badge:"消耗 ¥328,460", copy:"你以为床垫看着干净就够了吗？实际走一遍才知道，藏在纤维深处的细小灰尘根本不是换床单能解决的。轻净 Pro 边拍边吸，尘杯里的结果当场就能看见。" }
      },
      {
        id: 2, name: "场景代入·功能证明型", formula: "生活场景 → 问题出现 → 功能演示 → 成品证明 → 优惠收口",
        source: "千川学习", method: "平台数据学习", learningStatus:"生效中", learningSampleCount:1276, learnedAt:"2026-07-26", updated: "07-26 10:18", parseStatus:"completed", mixProfile:"scene", autoProductIds:["air-a8"], productNames:["轻享空气炸锅 A8"], scriptTypes:["打感情类型","种草类型","活动类型","网络爆款音频类型"], defaultForScriptTypes:["打感情类型","种草类型"],
        stages: [
          { name:"生活场景", say:"从下班晚、做饭麻烦的真实场景切入。", visual:"目标用户的日常环境、人物行为，以及问题出现前的触发画面。", edit:"2–3 个环境与人物镜头；正常速度；硬切。" },
          { name:"问题出现", say:"点出传统烹饪耗时、油烟和看火的问题。", visual:"问题发生过程、原有方式的局限，或用户等待与处理的细节。", edit:"2–3 个问题镜头；单镜 1–2 秒。" },
          { name:"功能演示", say:"说明快速升温、少油烹饪和可视窗口。", visual:"关键操作起止、功能发生过程，以及用户可观察到的操作反馈。", edit:"4–6 个完整操作镜头；等待过程可加速。" },
          { name:"成品证明", say:"描述外酥里嫩和省时结果。", visual:"使用后结果的近景、关键细节，或真实用户的结果反馈。", edit:"2–3 个近景；结果特写短暂停留。" },
          { name:"优惠收口", say:"说明当前权益并引导查看商品。", visual:"产品主体、核心结果或权益信息可同框的稳定画面。", edit:"稳定镜头承接口播；末尾硬切结束。" }
        ],
        example:{ title:"空气炸锅 A8｜下班晚餐场景", meta:"代表性高消耗成品 · 素材 ID 7553983811703195882", badge:"消耗 ¥216,780", copy:"下班晚又不想点外卖，把腌好的鸡翅放进去，选好时间就不用守着。可视窗口能直接看熟度，少油也能烤出焦脆表面。" }
      },
      {
        id: 3, name: "人群点名·卖点展开型", formula: "人群点名 → 需求唤醒 → 核心卖点 → 证明补充 → 产品推荐",
        source: "千川学习", method: "平台数据学习", learningStatus:"生效中", learningSampleCount:864, learnedAt:"2026-07-10", updated: "07-10 18:20", parseStatus:"completed", mixProfile:"audience", autoProductIds:[], productNames:[], scriptTypes:["点名人群类型","痛点类型","打感情类型"], defaultForScriptTypes:["点名人群类型"],
        stages: [
          { name:"人群点名", say:"直接点名最容易产生共鸣的一类目标用户。", visual:"目标人群在典型生活场景中的状态。", edit:"1–2 个人物或场景镜头；快速进入主题。" },
          { name:"需求唤醒", say:"说明这类人经常遇到的具体问题与损失。", visual:"问题发生过程和细节证据。", edit:"2–3 个问题镜头；跟随信息点硬切。" },
          { name:"核心卖点", say:"围绕一个核心卖点解释产品如何解决问题。", visual:"产品完整操作和关键功能特写。", edit:"3–5 个动作镜头；动作连续；必要时轻微加速。" },
          { name:"证明补充", say:"用结果、参数事实或使用反馈补足可信度。", visual:"结果对比、细节特写或真实使用反应。", edit:"2–3 个证据镜头；结果画面短暂停留。" },
          { name:"产品推荐", say:"总结适合谁，并引导查看产品。", visual:"产品全貌、使用完成或收纳画面。", edit:"1–2 个稳定收尾镜头。" }
        ],
        example:{ title:"通用结构示例｜家庭清洁人群", meta:"平台学习样例 · 已脱敏", badge:"高转化", copy:"家里有孩子或者宠物的，日常清洁最怕看不见的残留。与其反复打扫，不如直接看一遍完整实测，再决定这类产品适不适合你。" }
      },
      {
        id: 4, name: "反差开场·实测证明型", formula: "反差开场 → 过程实测 → 结果证明 → 行动引导",
        source: "自建", method: "从参考视频提炼", reference:"洗地机紫色污渍实测_成品01.mp4", creator:"嗡大发", createdAt:"2026-08-11 09:16", updated: "08-11 09:16", parseStatus:"completed", validationStatus:"提炼完成", parseSummary:"已识别口播、12 个镜头与 4 个内容段落", mixProfile:"contrast", autoProductIds:["washer-s5"], productNames:[], scriptTypes:["对比类型","制造焦虑类型","正话反说类型","种草类型","引发好奇类型"], defaultForScriptTypes:["对比类型","制造焦虑类型","正话反说类型","引发好奇类型"],
        stages: [
          { name:"反差开场", say:"先给出结果，制造预期反差。", strategy:"先让结果占据注意力，再用预期反差解释为什么值得继续看。", talk:"先给出{可视化结果}，再用{预期反差}建立观看理由。", slots:["可视化结果","预期反差"], visual:"大面积紫色污渍与洗净地面的前后同场对比。", edit:"前后画面直接硬切；开场 2 秒内给结果。" },
          { name:"过程实测", say:"展示关键动作，让用户看到问题被解决。", strategy:"保留动作的起止过程，让解决发生本身成为可信证明。", talk:"用{关键动作}展示{问题对象}如何被解决。", slots:["关键动作","问题对象"], visual:"洗地机经过污渍、污水被吸走的完整动作。", edit:"保留动作起止；等待段可 1.1–1.3 倍加速。" },
          { name:"结果证明", say:"强调可见结果，并补充使用场景。", strategy:"将结果放回真实使用场景，补足效果稳定、可被观察的证据。", talk:"强调{可视化结果}，再补充{使用场景}中的可见效果。", slots:["可视化结果","使用场景"], visual:"地面反光特写、人物走过或躺下展示。", edit:"结果镜头 2–3 个；稳定画面可短暂停留。" },
          { name:"行动引导", say:"收束结果并引导进一步了解。", strategy:"回扣用户所处场景与已验证结果，自然引导其进入下一步。", talk:"如果你也在{使用场景}遇到{问题对象}，可以进一步了解{产品名}。", slots:["使用场景","问题对象","产品名"], visual:"产品与清洁后地面同框。", edit:"1 个稳定收尾镜头。" }
        ],
        example:{ title:"洗地机紫色污渍实测_成品01.mp4", meta:"自建结构提炼来源 · 成品视频库", badge:"参考视频", copy:"这么大一片污渍，推过去没有反复拖，一遍就被吸走了。清洁后的地面没有明显水痕，结果直接看得到。" }
      },
      {
        id: 5, name: "家居清洁对比参考", formula: "尚未生成内容结构",
        source: "自建", method: "从参考视频提炼", reference:"家居清洁前后对比_参考01.mp4", creator:"嗡大发", createdAt:"2026-08-13 10:26", updated:"08-13 10:28",
        parseStatus:"failed", validationStatus:"提炼失败", parseError:"视频画面轨道无法解码，请更换文件或重新解析。", referenceMeta:"外部参考视频 · 00:37", parseProfileId:1, parseStep:1, stages:[],
        example:{ title:"家居清洁前后对比_参考01.mp4", meta:"提炼来源 · 外部参考视频", badge:"提炼失败", copy:"视频尚未完成解析，暂未生成识别口播。" }
      }
    ];

    const clLearningSampleProfiles = {
      1: {
        titles:["床褥深层灰尘实测", "除螨仪尘杯结果展示", "宠物家庭床垫清洁", "沙发布艺深度清洁"],
        scripts:[
          "别只看床垫表面干不干净，走一遍才知道深层藏了多少灰尘。边拍边吸，尘杯里的结果当场就能看见。",
          "床单刚换不代表真的干净，纤维里的毛发碎屑才是容易被忽略的地方。",
          "有孩子和宠物的家庭，清洁不能只靠晒，完整走一遍结果更直观。"
        ], tone:"tone-1"
      },
      2: {
        titles:["下班 15 分钟晚餐", "空气炸锅鸡翅实测", "少油烹饪场景展示", "可视窗口烹饪记录"],
        scripts:[
          "下班晚又不想点外卖，腌好的鸡翅放进去，选好时间就不用守着。",
          "不用一滴油也能烤出焦脆表面，可视窗口直接看熟度。",
          "传统做饭最麻烦的是看火和油烟，这次把整个过程给你看。"
        ], tone:"tone-2"
      },
      3: {
        titles:["养宠家庭清洁建议", "有娃家庭深层清洁", "日常清洁高频痛点", "看不见残留的家庭场景"],
        scripts:[
          "家里有孩子或者宠物的，日常清洁最怕看不见的残留。",
          "反复打扫还是不放心，关键要看清洁后的结果能不能被验证。",
          "别只盯着参数，先看这类产品能不能解决你每天遇到的问题。"
        ], tone:"tone-3"
      }
    };
    const clLearningPrototypeDates = Array.from({length:30}, (_, index) => index < 17
      ? `2026-07-${String(index + 15).padStart(2,"0")}`
      : `2026-08-${String(index - 16).padStart(2,"0")}`);
    function clCreateLearningDailyRecords(structureId) {
      const profile = clLearningSampleProfiles[structureId] || clLearningSampleProfiles[1];
      if (structureId === 3) return [];
      const materialTotal = structureId === 2 ? 6 : 128;
      return Array.from({length:materialTotal}, (_, materialIndex) => {
        const id = `QC-${240618 + structureId * 1000 + materialIndex}`;
        const accountId = `${178023456 + ((materialIndex + structureId) % 6) * 10391}`;
        const firstDay = (materialIndex * 3 + structureId * 5) % 23;
        const activeDays = structureId === 2 ? 1 + (materialIndex % 2) : 5 + (materialIndex % 9);
        return clLearningPrototypeDates.slice(firstDay, Math.min(firstDay + activeDays, clLearningPrototypeDates.length)).map((date, dayIndex) => {
          const spend = 1120 + ((materialIndex * 487 + dayIndex * 769 + structureId * 917) % 18600);
          const roi = 1.86 + ((materialIndex * 17 + dayIndex * 9 + structureId * 11) % 166) / 100;
          const gmv = Math.round(spend * roi);
          const cpm = 41 + ((materialIndex * 7 + dayIndex * 3 + structureId) % 38);
          const impressions = Math.round(spend / cpm * 1000);
          const ctr = 2.7 + ((materialIndex * 13 + dayIndex * 4 + structureId * 3) % 45) / 10;
          const clicks = Math.max(1, Math.round(impressions * ctr / 100));
          const cvr = 3.8 + ((materialIndex * 9 + dayIndex * 5 + structureId * 5) % 58) / 10;
          const orders = Math.max(1, Math.round(clicks * cvr / 100));
          return { id, accountId, title:profile.titles[materialIndex % profile.titles.length], script:profile.scripts[materialIndex % profile.scripts.length], date,
            spend, gmv, roi, orders, impressions, clicks, ctr, cvr, cpm, cpc:spend / clicks, tone:profile.tone };
        });
      }).flat();
    }
    const clLearningDailyRecords = Object.fromEntries([1,2,3].map(id => [id, clCreateLearningDailyRecords(id)]));
    const clLearningFilters = { period:"30", start:"2026-07-15", end:"2026-08-13", query:"", sort:"spend", page:1 };
    let clActiveDetailStructure = null;

    function clOpenModal(modal) { if (modal) modal.classList.add("show"); }
    function clCloseModal(modal) { if (modal) modal.classList.remove("show"); }
    function clOpenDrawer() { if (clDetailDrawer) { clDetailDrawer.classList.add("show"); if (clDrawerOverlay) clDrawerOverlay.classList.add("show"); } }
    function clCloseDrawer() { clCloseLearningSampleDetail(); if (clDetailDrawer) { clDetailDrawer.classList.remove("show"); if (clDrawerOverlay) clDrawerOverlay.classList.remove("show"); } }

    let clEditingId = null;
    let clDeletingId = null;
    let clDeleteTargetName = "";
    let clActiveParseTaskId = null;
    const clParseTimers = new Map();
    const clParseStages = [
      ["提取音视频与关键帧", "正在读取时长、音轨与关键画面"],
      ["识别口播与画面文字", "正在转写口播并识别画面文字"],
      ["拆分镜头与内容段落", "正在识别镜头边界与内容阶段"],
      ["提取内容结构与剪辑方法", "正在生成内容公式、画面任务与剪辑方法"],
      ["生成内容结构", "正在整理内容公式与结构阶段"]
    ];

    function clNow() {
      const date = new Date();
      return `${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
    }
    function clParseStatusHtml(item) {
      if (item.parseStatus === "parsing") return `<span class="cl-parse-status parsing">◌ 解析中 <small>${clEscape(clParseStages[item.parseStep || 0]?.[0] || "处理中")}</small></span>`;
      if (item.parseStatus === "completed") return `<span class="cl-parse-status ready">✓ 已解析 <small>${clEscape(item.parseSummary || `${item.stages.length} 个阶段`)}</small></span>`;
      return `<span class="cl-parse-status manual">— 等待解析</span>`;
    }
    function clStructureStatusHtml(item) {
      if (item.source === "千川学习") {
        return `<span class="cl-structure-lifecycle active">生效中</span>`;
      }
      const status = item.parseStatus === "parsing" ? "提炼中" : item.parseStatus === "failed" ? "提炼失败" : "提炼完成";
      const className = item.parseStatus === "parsing" ? "processing" : item.parseStatus === "failed" ? "failed" : "completed";
      return `<span class="cl-structure-lifecycle ${className}">${status}</span>`;
    }
    function clListPeriodLabel() {
      return clLearningFilters.period === "7" ? "近 7 日" : clLearningFilters.period === "30" ? "近 30 日" : `${clLearningFilters.start} 至 ${clLearningFilters.end}`;
    }
    function clSyncListLearningPeriodControls() {
      document.querySelectorAll("[data-cl-list-period]").forEach(button => button.classList.toggle("active", button.dataset.clListPeriod === clLearningFilters.period));
      const range = document.getElementById("clListCustomRange");
      if (range) {
        range.hidden = clLearningFilters.period !== "custom";
        const start = range.querySelector('[data-cl-list-date="start"]');
        const end = range.querySelector('[data-cl-list-date="end"]');
        if (start) start.value = clLearningFilters.start;
        if (end) end.value = clLearningFilters.end;
      }
    }
    function clLearningLifecycle(item) {
      return item?.source === "千川学习" ? "生效中" : "";
    }
    // 千川学习沉淀的是跨样本的表达机制，不应回填任一单条素材的具体口播。
    const clLearningStagePatterns = {
      "结果型视觉钩子": { task:"先给出可验证结果，快速建立观看理由。", strategy:"用强结果或反差跳过铺垫，让用户先看到产品解决问题后的状态。", template:"先看{可视化结果}，{表面状态}不代表{隐性问题}已经解决。", slots:["可视化结果","表面状态","隐性问题"] },
      "隐性痛点放大": { task:"解释表面正常之下，问题为何仍值得解决。", strategy:"从用户默认认知切入，补足肉眼不易察觉、但会持续影响体验的隐性问题。", template:"你以为{表面状态}就够了，其实{隐性问题}仍在影响{问题对象}。", slots:["表面状态","隐性问题","问题对象"] },
      "产品能力演示": { task:"用可连续拍摄的动作承接解决方案。", strategy:"少讲抽象参数，多展示产品在关键动作中如何处理问题对象。", template:"{产品名}通过{核心动作}，在{关键环节}完成{解决结果}。", slots:["产品名","核心动作","关键环节","解决结果"] },
      "结果与场景证明": { task:"用可观察的结果兑现前文承诺。", strategy:"将结果放回核心场景，并用扩展场景证明能力不是偶发。", template:"在{核心场景}看到{可视化结果}，换到{扩展场景}也能验证{核心卖点}。", slots:["核心场景","可视化结果","扩展场景","核心卖点"] },
      "行动引导": { task:"收束价值，并给出明确的下一步。", strategy:"回扣用户最在意的可验证信息，降低继续了解或行动的犹豫。", template:"想进一步确认{可验证内容}的{目标人群}，可以通过{行动入口}了解。", slots:["可验证内容","目标人群","行动入口"] },
      "生活场景": { task:"建立目标用户的日常处境，让问题自然出现。", strategy:"选择高频、低决策成本的日常情境，通过时间压力、操作负担或现实限制引出不便。", template:"当{目标人群}在{生活场景}遇到{触发问题}时，{现实限制}让原有方式很难继续。", slots:["目标人群","生活场景","触发问题","现实限制"] },
      "问题出现": { task:"把场景中的不便转成需要解决的问题。", strategy:"以原有方式的局限和持续损失，放大用户对问题的感知。", template:"原来以为{原有方式}可以解决，但{具体问题}带来的{实际损失}越来越明显。", slots:["原有方式","具体问题","实际损失"] },
      "功能演示": { task:"用连续关键动作解释产品如何工作。", strategy:"围绕解决问题的必要步骤，呈现功能发生而非罗列功能名称。", template:"{产品名}通过{核心动作}，在{关键环节}完成{解决结果}。", slots:["产品名","核心动作","关键环节","解决结果"] },
      "成品证明": { task:"用可观察结果兑现前文承诺。", strategy:"让成品状态或使用后变化直接回应前面的触发问题。", template:"{可视化结果}直接回应了{触发问题}，也证明{核心卖点}确实发挥作用。", slots:["可视化结果","触发问题","核心卖点"] },
      "优惠收口": { task:"归纳核心价值，并引导用户进入下一步。", strategy:"只补充当前可核验的权益或行动入口，不替代产品价值证明。", template:"如果{目标人群}也在意{核心价值}，现在可通过{行动入口}进一步了解。", slots:["目标人群","核心价值","行动入口"] },
      "人群点名": { task:"让目标用户快速确认内容与自己相关。", strategy:"优先点出人群的共同身份、处境或高频需求，而非泛泛称呼所有人。", template:"如果你是{目标人群}，并且常在{使用场景}遇到{核心需求}，这段内容值得继续看。", slots:["目标人群","使用场景","核心需求"] },
      "需求唤醒": { task:"明确目标人群正在承担的具体问题。", strategy:"把隐性困扰转成可以感知的损失，建立产品出现的必要性。", template:"看似只是{具体问题}，长期会带来{实际损失}，所以需要解决{核心需求}。", slots:["具体问题","实际损失","核心需求"] },
      "核心卖点": { task:"聚焦一个关键能力，解释它如何解决需求。", strategy:"避免堆砌卖点；只保留与当前问题存在直接因果关系的能力。", template:"针对{核心需求}，{产品名}的{核心卖点}能够完成{解决结果}。", slots:["核心需求","产品名","核心卖点","解决结果"] },
      "证明补充": { task:"补充可验证依据，降低用户判断成本。", strategy:"优先使用结果、事实或真实使用反馈，而非重复主张。", template:"通过{证明结果}可以确认，{核心卖点}确实改善了{具体问题}。", slots:["证明结果","核心卖点","具体问题"] },
      "产品推荐": { task:"总结适用人群与核心价值，完成推荐。", strategy:"把推荐建立在已说明的需求与证据上，而不是空泛催促购买。", template:"对在意{核心需求}的{目标人群}来说，{产品名}的价值在于{核心价值}。", slots:["核心需求","目标人群","产品名","核心价值"] },
      "低价反差": { task:"以可核验的权益信息快速建立注意力。", strategy:"强调价值与原有认知之间的落差，避免脱离产品价值单独喊价。", template:"{权益信息}对应的{权益价值}，让原本顾虑{购买顾虑}的用户有了新的选择。", slots:["权益信息","权益价值","购买顾虑"] },
      "福利说明": { task:"说清权益边界，帮助用户判断是否适用。", strategy:"说明优惠门槛和具体获得内容，确保信息真实、可核验。", template:"满足{优惠门槛}后，可获得{权益价值}；重点关注{权益信息}即可。", slots:["优惠门槛","权益价值","权益信息"] },
      "产品展示": { task:"用最少信息承接权益，并建立产品认知。", strategy:"选择一个核心场景和关键动作，让用户理解权益对应的真实产品价值。", template:"{产品名}在{核心场景}通过{核心动作}，提供{核心价值}。", slots:["产品名","核心场景","核心动作","核心价值"] },
      "立即行动": { task:"收束权益信息，给出立即可执行的下一步。", strategy:"明确行动入口和需要确认的信息，避免制造无依据的紧迫感。", template:"想确认{权益信息}是否适合自己的{目标人群}，可通过{行动入口}进一步了解。", slots:["权益信息","目标人群","行动入口"] }
    };

    function clStageExpression(stage) {
      const pattern = clLearningStagePatterns[stage.name];
      return pattern || {
        task:stage.purpose || stage.say,
        strategy:"该阶段的跨样本表达策略待补充。",
        template:stage.talk || "请结合本阶段任务补充可调用句式。",
        slots:stage.slots || []
      };
    }
    function clStructureStatusDetailHtml(item) {
      const updatedLabel = item.source === "千川学习" ? `更新于 ${item.learnedAt || item.updated || "—"}` : `创建于 ${item.createdAt || item.updated || "—"}`;
      return `<div class="cl-origin-status">${clStructureStatusHtml(item)}<small>${clEscape(updatedLabel)}</small></div>`;
    }
    function clStructureEvidenceHtml(item) {
      if (item.source !== "千川学习") {
        if (item.parseStatus === "failed") {
          return `<div class="cl-evidence cl-evidence-failed"><span><b>失败原因</b><i title="${clEscape(item.reference || "参考视频")}">${clEscape(item.reference || "参考视频")}</i></span><strong title="${clEscape(item.parseError || "视频解析失败")}">${clEscape(item.parseError || "视频解析失败")}</strong></div>`;
        }
        return item.reference
          ? `<div class="cl-evidence cl-evidence-reference"><b>参考成品</b><strong title="${clEscape(item.reference)}">${clEscape(item.reference)}</strong></div>`
          : `<div class="cl-evidence cl-evidence-unverified"><b>—</b><span>不关联投放数据</span></div>`;
      }
      const dailyRows = clLearningDailyRows(item.id);
      const aggregate = clLearningAggregate(dailyRows);
      const materialCount = clLearningMaterialRows(dailyRows, clLearningFilters.sort).length;
      const materialLabel = `结构学习样本 ${Number(item.learningSampleCount || 0).toLocaleString("zh-CN")} 条`;
      const materialHint = materialCount > 100 ? "展示前 100 条" : "查看学习素材";
      const metrics = materialCount ? `${clListPeriodLabel()}命中 ${materialCount} 条｜消耗 ${clFormatMoney(aggregate.spend)} · ROI ${clFormatDecimal(aggregate.roi)}` : `${clListPeriodLabel()}无新增命中素材`;
      return `<button type="button" class="cl-evidence cl-evidence-learning" data-cl-open-learning="${item.id}"><span><b>${materialLabel}</b><i>${materialHint}</i></span><strong>${metrics}</strong></button>`;
    }
    function clStructureOrigin(item) {
      if (item.source === "千川学习") return "千川学习";
      return item.method === "从参考视频提炼" ? "参考视频提炼" : "手动创建";
    }
    function clStructureOriginClass(item) {
      if (item.source === "千川学习") return "cl-source-qc";
      return item.method === "从参考视频提炼" ? "cl-source-custom" : "cl-source-manual";
    }
    const clCanEditStructure = item => item?.source === "自建" && item.method === "手动创建";
    function clRenderTable() {
      const tbody = document.getElementById("contentStructureTbody");
      if (!tbody) return;
      const query = document.getElementById("clStructureSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("clStructureSourceFilter")?.value || "全部来源";
      const filtered = contentStructures.filter(item => {
        const origin = clStructureOrigin(item);
        const haystack = [item.name, item.formula, item.reference, origin].join(" ").toLowerCase();
        return (!query || haystack.includes(query)) && (source === "全部来源" || origin === source);
      });
      tbody.innerHTML = filtered.map(item => {
        const customActions = item.source === "自建" ? `${clCanEditStructure(item) ? '<button class="cl-table-action" type="button" data-cl-action="edit">编辑</button>' : ""}<button class="cl-table-action danger" type="button" data-cl-action="delete">删除</button>` : "";
        const structureMeta = item.parseStatus === "parsing" ? "解析任务草稿" : item.parseStatus === "failed" ? "尚未生成结构" : `${item.stages.length} 个阶段`;
        const actionHtml = item.parseStatus === "parsing"
          ? '<button class="cl-table-action primary" type="button" data-cl-action="progress">查看进度</button>'
          : item.parseStatus === "failed"
            ? `<button class="cl-table-action primary" type="button" data-cl-action="retry">重新解析</button>${customActions}`
            : `<button class="cl-table-action primary" type="button" data-cl-action="view">查看</button>${customActions}`;
        return `
        <tr data-cl-id="${item.id}">
          <td><div class="cl-structure-name-line"><strong>${clEscape(item.name)}</strong><small>${structureMeta}</small></div><span class="cl-formula-text">${clEscape(item.formula)}</span></td>
          <td><span class="${clStructureOriginClass(item)}">${clEscape(clStructureOrigin(item))}</span></td>
          <td>${clStructureStatusDetailHtml(item)}</td>
          <td>${clStructureEvidenceHtml(item)}</td>
          <td><span class="cl-table-actions">${actionHtml}</span></td>
        </tr>`;
      }).join("");
      document.getElementById("contentStructureEmpty").hidden = filtered.length > 0;
    }

    function clStageRow(stage = {}) {
      const talk = stage.talk || stage.say || "";
      return `<div class="cl-stage-editor-row"><input data-stage-field="name" value="${clEscape(stage.name || "新阶段")}" aria-label="阶段名称"><textarea data-stage-field="strategy" rows="2" aria-label="表达要点" placeholder="可选；不填写时由 AI 根据阶段任务和表达模板生成建议">${clEscape(stage.strategy || "")}</textarea><textarea data-stage-field="talk" rows="2" aria-label="表达模板">${clEscape(talk)}</textarea><textarea data-stage-field="visual" rows="2" aria-label="拍什么">${clEscape(stage.visual || "")}</textarea><textarea data-stage-field="edit" rows="2" aria-label="怎么剪">${clEscape(stage.edit || "")}</textarea><button class="cl-stage-remove" type="button" data-remove-stage title="删除阶段">×</button></div>`;
    }
    function clRenderStageEditor(stages) {
      const editor = document.getElementById("clStageEditor");
      if (editor) editor.innerHTML = stages.map(clStageRow).join("");
    }
    function clExtractVariables(template) {
      return [...new Set([...String(template || "").matchAll(/\{([^{}]+)\}/g)].map(match => match[1].trim()).filter(Boolean))];
    }
    function clBuildExpressionPoint(stage = {}) {
      const variables = clExtractVariables(stage.talk || stage.say || "");
      if (variables.length) return `围绕${variables.map(value => `「${value}」`).join("、")}组织本段信息，让表达与后续画面任务一致。`;
      return `聚焦「${stage.name || "本阶段"}」的核心信息，先说明用户应理解的价值，再承接后续画面。`;
    }
    function clReadStages() {
      return Array.from(document.querySelectorAll("#clStageEditor .cl-stage-editor-row")).map(row => {
        const talk = row.querySelector('[data-stage-field="talk"]')?.value.trim() || "";
        const name = row.querySelector('[data-stage-field="name"]')?.value.trim() || "";
        return {
          name, say: talk, talk, strategy:row.querySelector('[data-stage-field="strategy"]')?.value.trim() || clBuildExpressionPoint({name, talk}), slots: clExtractVariables(talk),
          visual: row.querySelector('[data-stage-field="visual"]')?.value.trim() || "",
          edit: row.querySelector('[data-stage-field="edit"]')?.value.trim() || ""
        };
      }).filter(stage => stage.name);
    }
    function clToggleReference() {
      const isReference = document.getElementById("clNewMethod")?.value === "reference";
      const wrap = document.getElementById("clNewReferenceWrap");
      if (wrap) wrap.hidden = !isReference;
    }
    const clVideoSourceCatalog = {
      finished: [
        { id:"finished-1", name:"轻净 Pro 除螨仪｜床褥结果冲击型.mp4", product:"轻净 Pro 除螨仪", duration:"00:36", status:"done", source:"remix", meta:"08/12 10:24", profileId:1, tone:"tone-1", qianchuan:true, tags:["痛点钩子","卧室"] },
        { id:"finished-2", name:"空气炸锅 A8｜下班晚餐场景.mp4", product:"轻享空气炸锅 A8", duration:"00:52", status:"done", source:"local", meta:"08/11 16:18", profileId:2, tone:"tone-2", tags:["场景演示","厨房"] },
        { id:"finished-3", name:"净界洗地机 S5｜顽渍清洁实测.mp4", product:"净界洗地机 S5", duration:"00:28", status:"done", source:"infinite", meta:"08/10 09:42", profileId:4, tone:"tone-3", qianchuan:true, tags:["效果证明","家庭清洁"] },
        { id:"finished-4", name:"随行榨汁杯 Mini｜晨间饮品.mov", product:"随行榨汁杯 Mini", duration:"00:22", status:"pending", source:"local", meta:"08/09 14:06", profileId:3, tone:"tone-4", tags:["场景演示","新品种草"] },
        { id:"finished-5", name:"轻净 Pro 除螨仪｜养宠家庭版.mp4", product:"轻净 Pro 除螨仪", duration:"00:24", status:"done", source:"remix", meta:"08/08 10:16", profileId:1, tone:"tone-1", tags:["人群点名","效果证明"] },
        { id:"finished-6", name:"净界洗地机 S5｜厨房清洁日常.mp4", product:"净界洗地机 S5", duration:"00:18", status:"running", source:"local", meta:"08/07 15:32", profileId:4, tone:"tone-3", tags:["家庭清洁","场景演示"] }
      ],
      external: [
        { id:"external-1", name:"洗地机紫色污渍实测_成品01.mp4", product:"净界洗地机 S5", duration:"00:28", status:"done", source:"采集", platform:"douyin", meta:"08/11 13:08", profileId:4, tone:"tone-3", tags:["结果直给","效果证明"] },
        { id:"external-2", name:"清洁电器人群痛点参考.mp4", product:"轻净 Pro 除螨仪", duration:"00:41", status:"done", source:"采集", platform:"douyin", meta:"08/10 11:34", profileId:3, tone:"tone-1", tags:["痛点钩子","人群点名"] },
        { id:"external-3", name:"空气炸锅下班做饭高完播参考.mp4", product:"轻享空气炸锅 A8", duration:"00:35", status:"pending", source:"本地", platform:"douyin", meta:"08/08 19:18", profileId:2, tone:"tone-2", tags:["场景演示"] },
        { id:"external-4", name:"床褥深层灰尘对比参考.mp4", product:"", duration:"00:18", status:"running", source:"采集", platform:"xiaohongshu", meta:"08/07 15:20", profileId:1, tone:"tone-4", tags:["结果直给"] },
        { id:"external-5", name:"家居收纳短视频结构参考.mp4", product:"", duration:"00:24", status:"failed", source:"采集", platform:"other", meta:"08/06 17:26", profileId:3, tone:"tone-2", tags:["新品种草"] }
      ]
    };
    let clActiveVideoSource = "external";
    let clSelectedVideoRef = null;
    const clVideoPickerFilters = {
      finished: { query:"", analysis:"all", scope:"all", tag:"all", relation:"all", menu:"" },
      external: { query:"", analysis:"all", scope:"all", tag:"all", menu:"" }
    };
    const clVideoTagFilters = { finished: [], external: [] };
    const clVideoTagGroups = {
      finished: [{id:"all",name:"全部标签"},{id:"content",name:"内容主题"},{id:"scene",name:"使用场景"}],
      external: [{id:"all",name:"全部标签"},{id:"content",name:"内容主题"},{id:"scene",name:"使用场景"}]
    };
    let clVideoTagModalState = null;
    const clVideoStatusText = { done:"已分析", pending:"待分析", running:"分析中", failed:"分析失败" };
    const clFinishedSourceText = { infinite:"无限画板", remix:"智能混剪", local:"本地上传" };
    const clPlatformText = { douyin:"抖音", kuaishou:"快手", channels:"视频号", xiaohongshu:"小红书" };
    let clParseRunId = 0;

    function clUpdateParseState() {
      const button = document.getElementById("clParseVideo");
      const hint = document.getElementById("clParseHint");
      if (!button || !hint) return;
      button.textContent = "解析并生成结构";
      button.disabled = !clSelectedVideoRef || clSelectedVideoRef.uploadStatus === "uploading";
      hint.textContent = !clSelectedVideoRef ? "请选择一条视频" : clSelectedVideoRef.uploadStatus === "uploading" ? "视频上传中，完成后可开始解析" : `已选择：${clSelectedVideoRef.name}`;
    }
    function clFinishedFilterMenu(key, label, options) {
      const active = clVideoPickerFilters.finished.menu === key;
      return `<div class="cl-finished-filter-menu"><button type="button" data-cl-finished-menu="${key}">${key === "tag" ? "◇" : key === "analysis" ? "◉" : "⌁"}<span>${clEscape(label)}</span></button><div class="cl-finished-filter-options" ${active ? "" : "hidden"}>${options.map(([value,text]) => `<button class="${clVideoPickerFilters.finished[key] === value ? "active" : ""}" type="button" data-cl-finished-filter="${key}" data-cl-finished-value="${clEscape(value)}">${clEscape(text)}</button>`).join("")}</div></div>`;
    }
    function clExternalFilterMenu(key, label, options) {
      const active = clVideoPickerFilters.external.menu === key;
      const icon = key === "scope" ? "☷" : key === "tag" ? "◇" : "◉";
      return `<div class="cl-finished-filter-menu"><button type="button" data-cl-external-menu="${key}">${icon}<span>${clEscape(label)}</span></button><div class="cl-finished-filter-options" ${active ? "" : "hidden"}>${options.map(([value,text]) => `<button class="${clVideoPickerFilters.external[key] === value ? "active" : ""}" type="button" data-cl-external-filter="${key}" data-cl-external-value="${clEscape(value)}">${clEscape(text)}</button>`).join("")}</div></div>`;
    }
    const clVideoTagGroupMap = {
      finished:{ "痛点钩子":"content", "效果证明":"content", "人群点名":"content", "新品种草":"content", "卧室":"scene", "厨房":"scene", "家庭清洁":"scene", "场景演示":"scene" },
      external:{ "结果直给":"content", "痛点钩子":"content", "人群点名":"content", "新品种草":"content", "效果证明":"content", "场景演示":"scene" }
    };
    function clOpenVideoTagFilter(kind) {
      const catalog = clVideoSourceCatalog[kind];
      const draft = new Set(clVideoTagFilters[kind]);
      const modal = document.createElement("div");
      modal.className = "cl-tag-filter-overlay";
      modal.innerHTML = `<section class="cl-tag-filter-modal" role="dialog" aria-modal="true"><header><div><small>视频标签</small><h3>按标签筛选</h3><p>可多选标签，筛选同时满足全部标签的视频。</p></div><button type="button" data-cl-tag-close>×</button></header><div class="cl-tag-filter-body"><aside data-cl-tag-groups></aside><main><label class="cl-tag-filter-search">⌕<input type="search" placeholder="搜索标签" data-cl-tag-search></label><div class="cl-tag-filter-choices" data-cl-tag-choices></div><div class="cl-tag-filter-create"><button type="button" data-cl-tag-create-toggle>＋ 新建标签</button><div hidden data-cl-tag-create-row><input type="text" maxlength="20" placeholder="输入标签名称" data-cl-tag-new-input><button type="button" data-cl-tag-create>添加</button></div></div><small data-cl-tag-error></small></main></div><footer><span data-cl-tag-selected>已选 0 个标签</span><div><button type="button" data-cl-tag-clear>清空</button><button class="primary" type="button" data-cl-tag-apply>确认筛选</button></div></footer></section>`;
      document.body.appendChild(modal);
      const state = { group:"all", query:"" };
      const tags = () => [...new Set(catalog.flatMap(video => video.tags || []))];
      const render = () => {
        const groupMap = clVideoTagGroupMap[kind];
        modal.querySelector("[data-cl-tag-groups]").innerHTML = clVideoTagGroups[kind].map(group => `<button class="${state.group === group.id ? "active" : ""}" type="button" data-cl-tag-group="${group.id}"><span>${group.name}</span><b>${group.id === "all" ? tags().length : tags().filter(tag => groupMap[tag] === group.id).length}</b></button>`).join("");
        const choices = tags().filter(tag => (state.group === "all" || groupMap[tag] === state.group) && (!state.query || tag.toLowerCase().includes(state.query.toLowerCase())));
        modal.querySelector("[data-cl-tag-choices]").innerHTML = choices.length ? choices.map(tag => `<button class="${draft.has(tag) ? "selected" : ""}" type="button" data-cl-tag-choice="${clEscape(tag)}">${clEscape(tag)}${draft.has(tag) ? "<span>✓</span>" : ""}</button>`).join("") : '<span class="cl-tag-filter-empty">该分组下还没有标签</span>';
        modal.querySelector("[data-cl-tag-selected]").textContent = `已选 ${draft.size} 个标签`;
      };
      const close = () => modal.remove();
      modal.addEventListener("click", event => {
        if (event.target === modal || event.target.closest("[data-cl-tag-close]")) return close();
        const group = event.target.closest("[data-cl-tag-group]");
        if (group) { state.group = group.dataset.clTagGroup; return render(); }
        const choice = event.target.closest("[data-cl-tag-choice]");
        if (choice) { const tag = choice.dataset.clTagChoice; draft.has(tag) ? draft.delete(tag) : draft.add(tag); return render(); }
        if (event.target.closest("[data-cl-tag-clear]")) { draft.clear(); return render(); }
        if (event.target.closest("[data-cl-tag-create-toggle]")) { const row = modal.querySelector("[data-cl-tag-create-row]"); row.hidden = !row.hidden; if (!row.hidden) row.querySelector("input").focus(); return; }
        if (event.target.closest("[data-cl-tag-create]")) {
          const input = modal.querySelector("[data-cl-tag-new-input]"); const tag = input.value.trim(); const error = modal.querySelector("[data-cl-tag-error]");
          if (!tag) { error.textContent = "请输入标签名称"; return; }
          if (tags().includes(tag)) { error.textContent = "已存在同名标签"; return; }
          catalog[0]?.tags?.push(tag); clVideoTagGroupMap[kind][tag] = state.group === "all" ? "content" : state.group; draft.add(tag); input.value = ""; error.textContent = ""; return render();
        }
        if (event.target.closest("[data-cl-tag-apply]")) { clVideoTagFilters[kind] = [...draft]; clRenderVideoSource(); close(); }
      });
      modal.querySelector("[data-cl-tag-search]").addEventListener("input", event => { state.query = event.target.value.trim(); render(); });
      render();
    }
    function clRenderVideoSource() {
      const content = document.getElementById("clVideoSourceContent");
      if (!content) return;
      if (clActiveVideoSource === "finished" || clActiveVideoSource === "external") {
        const catalog = clVideoSourceCatalog[clActiveVideoSource];
        const filters = clVideoPickerFilters[clActiveVideoSource];
        const scopeOptions = clActiveVideoSource === "finished"
          ? [["all","全部来源"],["infinite","无限画板"],["local","本地上传"],["remix","智能混剪"]]
          : [["all","全部平台"],["douyin","抖音"],["kuaishou","快手"],["channels","视频号"],["xiaohongshu","小红书"],["other","其他"]];
        const tags = [...new Set(catalog.flatMap(video => video.tags || []))];
        const visible = catalog.filter(video => {
          const matchesQuery = !filters.query || `${video.name} ${video.product}`.toLowerCase().includes(filters.query.toLowerCase());
          const matchesStatus = filters.analysis === "all" || video.status === filters.analysis;
          const scope = clActiveVideoSource === "finished" ? video.source : video.platform;
          const matchesRelation = clActiveVideoSource !== "finished" || filters.relation === "all" || (filters.relation === "linked" ? !!video.qianchuan : !video.qianchuan);
          const selectedTags = clVideoTagFilters[clActiveVideoSource];
          return matchesQuery && matchesStatus && matchesRelation && (filters.scope === "all" || scope === filters.scope) && selectedTags.every(tag => (video.tags || []).includes(tag));
        });
        const analyzedCount = catalog.filter(video => video.status === "done").length;
        const pickerToolbar = clActiveVideoSource === "finished" ? `<div class="cl-finished-picker-toolbar">
          <div class="cl-finished-source-tabs">${[["all","全部"],["infinite","无限画板"],["local","本地上传"],["remix","智能混剪"]].map(([value,label]) => `<button class="${filters.scope === value ? "active" : ""}" type="button" data-cl-finished-source="${value}">${label}<b>${value === "all" ? catalog.length : catalog.filter(video => video.source === value).length}</b></button>`).join("")}</div>
          <button class="cl-finished-filter-trigger" type="button" data-cl-open-tag-filter="finished">◇<span>${clVideoTagFilters.finished.length ? `已选 ${clVideoTagFilters.finished.length} 标签` : "视频标签"}</span></button>
          ${clFinishedFilterMenu("analysis", filters.analysis === "all" ? "全部状态" : clVideoStatusText[filters.analysis], [["all","全部状态"],["pending","待分析"],["running","分析中"],["done","已分析"],["failed","分析失败"]])}
          ${clFinishedFilterMenu("relation", filters.relation === "all" ? "全部关联" : filters.relation === "linked" ? "已关联千川" : "未关联千川", [["all","全部关联"],["linked","已关联千川"],["unlinked","未关联千川"]])}
          <label class="cl-finished-search"><span>⌕</span><input type="search" data-cl-video-filter="query" placeholder="搜索视频名称、产品或素材 ID" value="${clEscape(filters.query)}"></label>
        </div>` : `<div class="cl-external-picker-toolbar">
          ${clExternalFilterMenu("scope", filters.scope === "all" ? "全部平台" : clPlatformText[filters.scope] || "其他", scopeOptions)}
          <button class="cl-finished-filter-trigger" type="button" data-cl-open-tag-filter="external">◇<span>${clVideoTagFilters.external.length ? `已选 ${clVideoTagFilters.external.length} 标签` : "视频标签"}</span></button>
          ${clExternalFilterMenu("analysis", filters.analysis === "all" ? "全部状态" : clVideoStatusText[filters.analysis], [["all","全部状态"],["pending","待分析"],["running","分析中"],["done","已分析"],["failed","分析失败"]])}
          <label class="cl-external-search"><span>⌕</span><input type="search" data-cl-video-filter="query" placeholder="搜索视频名称或关联产品" value="${clEscape(filters.query)}"></label>
        </div>`;
        content.innerHTML = `<div class="cl-asset-picker">
          ${pickerToolbar}
          <div class="cl-asset-picker-summary">共 ${catalog.length} 条视频 · 已分析 ${analyzedCount} 条${visible.length !== catalog.length ? ` · 显示 ${visible.length} 条` : ""}</div>
          <div class="cl-asset-video-grid">${visible.length ? visible.map(video => {
            const isFinished = clActiveVideoSource === "finished";
            const sourceText = isFinished ? clFinishedSourceText[video.source] : video.source;
            const sourceClass = isFinished ? video.source : video.source === "本地" ? "local" : "collect";
            const platform = clPlatformText[video.platform] || "其他";
            return `<button class="cl-asset-video-card ${clSelectedVideoRef?.id === video.id ? "selected" : ""}" type="button" data-cl-video-id="${video.id}">
              <span class="cl-asset-video-visual ${video.tone}"><span class="cl-asset-video-status ${video.status}"><i></i>${clVideoStatusText[video.status] || "待分析"}</span><span class="cl-asset-video-check">✓</span><span class="cl-asset-video-source ${sourceClass}">${clEscape(sourceText)}</span><span class="cl-asset-video-play">▶</span><em>${clEscape(video.duration)}</em></span>
              <span class="cl-asset-video-body"><strong title="${clEscape(video.name)}">${clEscape(video.name)}</strong><span class="cl-asset-video-tags"><b class="product ${video.product ? "" : "empty"}">${clEscape(video.product || "未关联产品")}</b>${isFinished ? video.qianchuan ? '<b class="qianchuan">已关联千川</b>' : "" : `<b class="platform">${clEscape(platform)}</b>`}</span><small>${clEscape(video.meta)}</small></span>
            </button>`;
          }).join("") : `<div class="cl-asset-picker-empty"><strong>没有符合条件的视频</strong><span>请调整搜索词或筛选条件</span></div>`}</div>
        </div>`;
      } else if (clActiveVideoSource === "upload") {
        content.innerHTML = `<div class="cl-source-input-panel"><input type="file" id="clVideoUploadInput" accept="video/*" hidden><button class="cl-action-btn primary" type="button" id="clChooseVideoFile">选择本地视频</button><p id="clUploadFileName">支持 MP4、MOV，单文件不超过 500MB</p><div class="cl-upload-progress" id="clUploadProgress" hidden><span id="clUploadState">正在上传</span><b id="clUploadPercent">0%</b><div><i id="clUploadBar" style="width:0%"></i></div></div></div>`;
      } else {
        content.innerHTML = `<div class="cl-source-input-panel"><p>粘贴抖音、快手或其他可访问的视频链接</p><div class="cl-source-link-row"><input type="url" id="clVideoLinkInput" placeholder="https://..."><button class="cl-action-btn" type="button" id="clClearVideoLink">清空</button></div><p>解析成功后将在内容结构中记录该提炼来源</p></div>`;
      }
      clUpdateParseState();
    }
    function clShowSourceStep() {
      document.getElementById("clNewModalTitle").textContent = "拆解爆款结构";
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      document.getElementById("clCreateSourceStep").hidden = false;
      document.getElementById("clStructureFormStep").hidden = true;
      document.getElementById("clParseProgressStep").hidden = true;
      document.getElementById("clNewSave").hidden = true;
      document.getElementById("clBackSource").hidden = true;
      document.getElementById("clBackgroundParse").hidden = true;
      document.querySelectorAll("[data-cl-close='new']").forEach(button => { if (button.textContent !== "✕") button.textContent = "取消"; });
      document.getElementById("clAiDraftNote").hidden = true;
      document.getElementById("clVideoSourcePicker").hidden = false;
      clActiveVideoSource = "external";
      document.querySelectorAll("[data-cl-video-source]").forEach(button => button.classList.toggle("active", button.dataset.clVideoSource === clActiveVideoSource));
      clRenderVideoSource();
    }
    function clShowVideoPicker() {
      document.getElementById("clNewModalTitle").textContent = "拆解爆款结构";
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      document.getElementById("clVideoSourcePicker").hidden = false;
      clActiveVideoSource = "external";
      clSelectedVideoRef = null;
      document.querySelectorAll("[data-cl-video-source]").forEach(button => button.classList.toggle("active", button.dataset.clVideoSource === clActiveVideoSource));
      clRenderVideoSource();
    }
    function clShowStructureForm(isAiDraft, allowBack = true) {
      document.getElementById("clCreateSourceStep").hidden = true;
      document.getElementById("clStructureFormStep").hidden = false;
      document.getElementById("clParseProgressStep").hidden = true;
      document.getElementById("clNewSave").hidden = false;
      document.getElementById("clBackSource").hidden = !allowBack;
      document.getElementById("clBackgroundParse").hidden = true;
      document.querySelectorAll("[data-cl-close='new']").forEach(button => { if (button.textContent !== "✕") button.textContent = "取消"; });
      document.getElementById("clAiDraftNote").hidden = !isAiDraft;
      document.getElementById("clNewModalSubtitle").textContent = isAiDraft ? "AI 已完成结构提炼，请确认后保存为自建内容结构" : "同时定义每个阶段说什么、拍什么、怎么剪，供智能文案、脚本和混剪调用";
      clNewModal?.querySelector(".modal-body")?.scrollTo?.({ top:0, behavior:"auto" });
    }
    function clShowParseProgress(item) {
      if (!item) return;
      clActiveParseTaskId = item.id;
      document.getElementById("clCreateSourceStep").hidden = true;
      document.getElementById("clStructureFormStep").hidden = true;
      document.getElementById("clParseProgressStep").hidden = false;
      document.getElementById("clNewSave").hidden = true;
      document.getElementById("clBackSource").hidden = true;
      document.getElementById("clBackgroundParse").hidden = false;
      document.querySelectorAll("[data-cl-close='new']").forEach(button => { if (button.textContent !== "✕") button.textContent = "关闭"; });
      document.getElementById("clNewModalTitle").textContent = "正在解析参考视频";
      document.getElementById("clNewModalSubtitle").textContent = "解析不会阻塞当前操作，可随时转入后台继续处理";
      const isComplete = item.parseStatus === "completed";
      document.getElementById("clParseProgressTitle").textContent = isComplete ? "解析完成" : "正在解析参考视频";
      document.getElementById("clParseProgressSubtitle").textContent = isComplete ? "内容结构已生成，可直接在列表查看或编辑。" : "任务已创建，可留在此处查看进度，也可转入后台继续处理。";
      document.getElementById("clParseVideoSummary").textContent = `${item.reference || "参考视频"} · ${item.referenceMeta || "正在读取视频信息"}`;
      const step = item.parseStep || 0;
      document.getElementById("clParseSteps").innerHTML = clParseStages.map(([title, description], index) => {
        const state = isComplete || index < step ? "done" : index === step ? "active" : "";
        const marker = state === "done" ? "✓" : index + 1;
        const status = state === "done" ? "已完成" : state === "active" ? "处理中" : "等待中";
        return `<div class="cl-parse-step ${state}"><i>${marker}</i><span><b>${title}</b><small>${description}</small></span><em>${status}</em></div>`;
      }).join("");
      const background = document.getElementById("clBackgroundParse");
      background.textContent = isComplete ? "查看结构" : "后台解析，稍后处理";
      clNewModal?.querySelector(".modal-body")?.scrollTo?.({ top:0, behavior:"auto" });
    }
    function clApplyVideoDraft(reference) {
      const source = contentStructures.find(item => item.id === (reference.profileId || 1)) || contentStructures[0];
      document.getElementById("clNewName").value = source.name.replace(/（自建）$/, "") + "（自建）";
      document.getElementById("clNewFormula").value = source.formula;
      document.getElementById("clNewMethod").value = "reference";
      document.getElementById("clNewReference").value = reference.name;
      clRenderStageEditor(source.stages.map(stage => ({...stage})));
      clToggleReference();
      clShowStructureForm(true, true);
    }
    function clHydrateStructureForm(item, confirming = false) {
      document.getElementById("clNewName").value = item.name;
      document.getElementById("clNewFormula").value = item.formula;
      document.getElementById("clNewMethod").value = "reference";
      const referenceInput = document.getElementById("clNewReference");
      referenceInput.value = item.reference || "";
      referenceInput.disabled = Boolean(item.reference);
      clRenderStageEditor(item.stages);
      clToggleReference();
      clEditingId = item.id;
      document.getElementById("clNewModalTitle").textContent = "编辑爆款内容结构";
      document.getElementById("clNewSaveText").textContent = "保存修改";
      clShowStructureForm(confirming, false);
      document.getElementById("clNewModalSubtitle").textContent = item.reference ? "可编辑结构内容；提炼来源仅用于溯源，如需更换请重新提炼" : "可编辑结构内容；保存后调用方将使用最新结构";
    }
    function clBuildParseDraft(reference) {
      const source = contentStructures.find(item => item.id === (reference.profileId || 1)) || contentStructures[0];
      return {
        id: Date.now(), name: `${source.name}（解析中）`, formula:"正在提取内容公式…", source:"自建", method:"从参考视频提炼", reference:reference.name, creator:"嗡大发", createdAt:clNow(),
        referenceMeta:reference.meta || "本地上传视频", updated:clNow(), parseStatus:"parsing", parseStep:0, stages:[], parseProfileId:source.id,
        example:{ title:reference.name, meta:`提炼来源 · ${reference.meta || "参考视频"}`, badge:"解析中", copy:"正在识别口播、镜头与内容结构…" }
      };
    }
    function clCompleteParseTask(taskId) {
      const item = contentStructures.find(entry => entry.id === taskId);
      if (!item || item.parseStatus !== "parsing") return;
      const source = contentStructures.find(entry => entry.id === item.parseProfileId) || contentStructures[0];
      Object.assign(item, {
        name:source.name.replace(/（自建）$/, ""), formula:source.formula, stages:source.stages.map(stage => ({...stage})), parseStatus:"completed", validationStatus:"提炼完成", parseStep:clParseStages.length,
        parseSummary:`已识别口播、${source.stages.length * 4 - 2} 个镜头与 ${source.stages.length} 个内容段落`, updated:clNow(),
        example:{ ...source.example, title:item.reference, meta:`提炼来源 · ${item.referenceMeta}`, badge:"已解析", copy:source.example.copy }
      });
      clParseTimers.delete(taskId);
      clRenderTable();
      if (clNewModal?.classList.contains("show") && clActiveParseTaskId === taskId) clShowParseProgress(item);
      showToast(`“${item.reference}”已解析完成，已展示在列表`);
    }
    function clScheduleParseTask(taskId) {
      const advance = step => {
        const item = contentStructures.find(entry => entry.id === taskId);
        if (!item || item.parseStatus !== "parsing") return;
        item.parseStep = step;
        item.updated = clNow();
        clRenderTable();
        if (clNewModal?.classList.contains("show") && clActiveParseTaskId === taskId) clShowParseProgress(item);
        if (step >= clParseStages.length) return clCompleteParseTask(taskId);
        clParseTimers.set(taskId, setTimeout(() => advance(step + 1), 720));
      };
      clParseTimers.set(taskId, setTimeout(() => advance(1), 620));
    }
    function clRetryParseTask(item) {
      if (!item || item.parseStatus !== "failed") return;
      const existingTimer = clParseTimers.get(item.id);
      if (existingTimer) clearTimeout(existingTimer);
      Object.assign(item, {
        parseStatus:"parsing", validationStatus:"", parseError:"", parseStep:0, updated:clNow()
      });
      clRenderTable();
      clActiveParseTaskId = item.id;
      clShowParseProgress(item);
      clOpenModal(clNewModal);
      clScheduleParseTask(item.id);
      showToast(`已重新解析“${item.reference}”`);
    }
    function clStartParseTask(reference) {
      const draft = clBuildParseDraft(reference);
      contentStructures.unshift(draft);
      clRenderTable();
      clShowParseProgress(draft);
      clScheduleParseTask(draft.id);
      showToast("已创建解析任务，可转入后台继续处理");
    }
    function clResetNewModalMode() {
      clParseRunId += 1;
      document.getElementById("clNewModalTitle").textContent = "拆解爆款结构";
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      document.getElementById("clNewSaveText").textContent = "保存结构";
      clEditingId = null;
      clShowSourceStep();
    }

    function clOpenEditModal(item) {
      if (!clCanEditStructure(item)) return showToast("从参考视频提炼的结构暂不支持编辑");
      clResetNewModalMode();
      clHydrateStructureForm(item, false);
      clOpenModal(clNewModal);
    }

    function clOpenDeleteModal(item) {
      document.getElementById("clDeleteName").textContent = item.name;
      clDeletingId = item.id; clDeleteTargetName = item.name;
      clOpenModal(clDeleteModal);
    }

    const clFormatMoney = value => `¥${Math.round(value).toLocaleString("zh-CN")}`;
    const clFormatDecimal = value => Number(value).toFixed(2);
    function clLearningDailyRows(structureId) {
      const { period, start, end } = clLearningFilters;
      const startDate = period === "7" ? "2026-08-07" : period === "30" ? "2026-07-15" : start;
      const endDate = period === "custom" ? end : "2026-08-13";
      return (clLearningDailyRecords[structureId] || [])
        .filter(record => record.spend > 1000)
        .filter(record => record.date >= startDate && record.date <= endDate);
    }
    // 结构选择器固定展示近 30 日口径，不受详情侧栏筛选条件影响。
    function clLearningRecent30Summary(structureId) {
      const rows = (clLearningDailyRecords[structureId] || [])
        .filter(record => record.spend > 1000)
        .filter(record => record.date >= "2026-07-15" && record.date <= "2026-08-13");
      const aggregate = clLearningAggregate(rows);
      const hitCount = clLearningMaterialRows(rows, "spend").length;
      return hitCount ? { hitCount, spend:aggregate.spend, roi:aggregate.roi } : null;
    }
    function clLearningAggregate(rows) {
      const total = rows.reduce((result, sample) => ({
        spend:result.spend + sample.spend, gmv:result.gmv + sample.gmv, orders:result.orders + sample.orders,
        impressions:result.impressions + sample.impressions, clicks:result.clicks + sample.clicks
      }), {spend:0,gmv:0,orders:0,impressions:0,clicks:0});
      return {
        ...total,
        roi:total.spend ? total.gmv / total.spend : 0,
        ctr:total.impressions ? total.clicks / total.impressions * 100 : 0,
        cvr:total.clicks ? total.orders / total.clicks * 100 : 0,
        cpm:total.impressions ? total.spend / total.impressions * 1000 : 0,
        cpc:total.clicks ? total.spend / total.clicks : 0
      };
    }
    function clLearningMetric(label, value) {
      return `<div class="cl-learning-metric"><span>${label}</span><strong>${value}</strong></div>`;
    }
    function clLearningMaterialRows(records, sort) {
      const grouped = new Map();
      records.forEach(record => {
        const key = `${record.id}|${record.accountId}`;
        const group = grouped.get(key) || { ...record, records:[] };
        group.records.push(record);
        grouped.set(key, group);
      });
      return [...grouped.values()].map(group => {
        const metrics = clLearningAggregate(group.records);
        const latestEntry = group.records.reduce((latest, record) => record.date > latest ? record.date : latest, group.records[0].date);
        return { ...group, metrics, entryDays:group.records.length, latestEntry, records:[...group.records].sort((a,b) => b.date.localeCompare(a.date)) };
      }).sort((a,b) => b.metrics[sort] - a.metrics[sort]);
    }
    function clRenderLearningSamples(item) {
      const container = document.getElementById("clDrawerExamples");
      if (!container || !item) return;
      const dailyRows = clLearningDailyRows(item.id);
      const aggregate = clLearningAggregate(dailyRows);
      const allRows = clLearningMaterialRows(dailyRows, clLearningFilters.sort);
      const normalizedQuery = clLearningFilters.query.trim().toLowerCase();
      const rows = allRows.filter(row => !normalizedQuery || `${row.id} ${row.accountId}`.toLowerCase().includes(normalizedQuery));
      const cappedRows = rows.slice(0,100);
      const pageSize = 20;
      const totalPages = Math.max(1, Math.ceil(cappedRows.length / pageSize));
      clLearningFilters.page = Math.min(Math.max(clLearningFilters.page, 1), totalPages);
      const pageStart = (clLearningFilters.page - 1) * pageSize;
      const visibleRows = cappedRows.slice(pageStart, pageStart + pageSize);
      const pagination = totalPages > 1 ? `<nav class="cl-learning-pagination" aria-label="学习素材分页"><span>第 ${clLearningFilters.page} / ${totalPages} 页</span><button type="button" data-cl-learning-page="${clLearningFilters.page - 1}"${clLearningFilters.page === 1 ? " disabled" : ""}>上一页</button>${Array.from({length:totalPages}, (_, index) => { const page = index + 1; return `<button type="button" class="${page === clLearningFilters.page ? "active" : ""}" data-cl-learning-page="${page}" aria-label="第 ${page} 页">${page}</button>`; }).join("")}<button type="button" data-cl-learning-page="${clLearningFilters.page + 1}"${clLearningFilters.page === totalPages ? " disabled" : ""}>下一页</button></nav>` : "";
      const periodLabel = clLearningFilters.period === "7" ? "近 7 天" : clLearningFilters.period === "30" ? "近 30 天" : `${clLearningFilters.start} 至 ${clLearningFilters.end}`;
      const sortOptions = [["spend","消耗最高"],["gmv","成交金额最高"],["roi","ROI 最高"],["orders","成交订单最多"],["cvr","转化率最高"]];
      container.innerHTML = `<section class="cl-learning-materials">
        <div class="cl-learning-rule"><span>结构学习样本</span><b>${Number(item.learningSampleCount || 0).toLocaleString("zh-CN")} 条</b><i>最近结构更新：${clEscape(item.learnedAt || item.updated || "—")}</i></div>
        <div class="cl-learning-filters">
          <div class="cl-learning-period" role="group" aria-label="统计周期">
            <span>统计周期</span>${[["7","近 7 天"],["30","近 30 天"],["custom","自定义"]].map(([value,label]) => `<button type="button" class="${clLearningFilters.period === value ? "active" : ""}" data-cl-learning-period="${value}">${label}</button>`).join("")}
          </div>
          <div class="cl-learning-custom-range" ${clLearningFilters.period === "custom" ? "" : "hidden"}><input type="date" data-cl-learning-date="start" value="${clEscape(clLearningFilters.start)}"><i>至</i><input type="date" data-cl-learning-date="end" value="${clEscape(clLearningFilters.end)}"></div>
          <label class="cl-learning-search"><span>⌕</span><input type="search" data-cl-learning-query placeholder="搜索素材 ID、千川账户 ID" value="${clEscape(clLearningFilters.query)}"></label>
          <label class="cl-learning-sort"><span>排序</span><select data-cl-learning-sort>${sortOptions.map(([value,label]) => `<option value="${value}"${clLearningFilters.sort === value ? " selected" : ""}>${label}</option>`).join("")}</select></label>
        </div>
        <section class="cl-learning-summary">
          <div class="cl-learning-section-head"><div class="cl-learning-summary-title"><strong>投放数据汇总</strong><span>统计周期：${periodLabel}</span></div><p>统计口径：当前筛选周期内，单日消耗 &gt; ¥1,000 的投放记录汇总</p></div>
          <div class="cl-learning-metrics">
            ${clLearningMetric("消耗", clFormatMoney(aggregate.spend))}
            ${clLearningMetric("整体成交金额", clFormatMoney(aggregate.gmv))}
            ${clLearningMetric("广告 ROI", clFormatDecimal(aggregate.roi))}
            ${clLearningMetric("整体成交订单", Math.round(aggregate.orders).toLocaleString("zh-CN"))}
            ${clLearningMetric("点击率", `${clFormatDecimal(aggregate.ctr)}%`)}
            ${clLearningMetric("转化率", `${clFormatDecimal(aggregate.cvr)}%`)}
            ${clLearningMetric("千展成本", clFormatMoney(aggregate.cpm))}
            ${clLearningMetric("点击单价", clFormatMoney(aggregate.cpc))}
          </div>
        </section>
        <div class="cl-learning-list-head"><strong>当前周期命中素材</strong><span>按素材 ID × 千川账户 ID 聚合；命中 ${allRows.length} 条${normalizedQuery ? `，当前筛选 ${rows.length} 条` : ""}；最多展示前 100 条，每页 20 条</span></div>
        <div class="cl-learning-list">${visibleRows.length ? visibleRows.map(sample => `<article class="cl-learning-sample" data-cl-learning-sample>
          <button class="cl-learning-video ${clEscape(sample.tone)}" type="button" data-cl-sample-play aria-label="预览 ${clEscape(sample.id)}"><i>▶</i><span>9:16</span><em>预览播放</em></button>
          <div class="cl-learning-sample-main">
            <header><div><strong>${clEscape(sample.title)}</strong><span>素材 ID：${clEscape(sample.id)} ｜ 千川账户 ID：${clEscape(sample.accountId)}</span></div><div class="cl-learning-entry"><b>满足入池规则 ${sample.entryDays} 天</b><span>最近入池：${clEscape(sample.latestEntry)}</span></div></header>
            <div class="cl-learning-sample-metrics">
              <span>消耗 <b>${clFormatMoney(sample.metrics.spend)}</b></span><span>成交金额 <b>${clFormatMoney(sample.metrics.gmv)}</b></span><span>ROI <b>${clFormatDecimal(sample.metrics.roi)}</b></span><span>成交订单 <b>${sample.metrics.orders}</b></span>
              <span class="more">点击率 ${clFormatDecimal(sample.metrics.ctr)}% · 转化率 ${clFormatDecimal(sample.metrics.cvr)}% · 千展成本 ${clFormatMoney(sample.metrics.cpm)} · 点击单价 ${clFormatMoney(sample.metrics.cpc)}</span>
            </div>
            <div class="cl-learning-actions">
              <button type="button" data-cl-sample-detail="copy" data-cl-sample-id="${clEscape(sample.id)}" data-cl-sample-account="${clEscape(sample.accountId)}">文案解析 <span>查看完整解析</span></button>
              <button type="button" data-cl-sample-detail="records" data-cl-sample-id="${clEscape(sample.id)}" data-cl-sample-account="${clEscape(sample.accountId)}">入池记录 <span>${sample.entryDays} 天满足规则</span></button>
            </div>
          </div>
        </article>`).join("") : `<div class="cl-learning-empty">没有符合当前筛选条件的学习素材</div>`}</div>
        ${pagination}
      </section>`;
    }
    function clSetLearningSampleDetailTab(tab) {
      if (!clLearningSampleDetail) return;
      clLearningSampleDetail.querySelectorAll("[data-cl-learning-detail-tab]").forEach(button => button.classList.toggle("active", button.dataset.clLearningDetailTab === tab));
      clLearningSampleDetail.querySelectorAll("[data-cl-learning-detail-panel]").forEach(panel => panel.hidden = panel.dataset.clLearningDetailPanel !== tab);
    }
    function clCloseLearningSampleDetail() {
      if (!clLearningSampleDetail) return;
      clLearningSampleDetail.classList.remove("show");
      clLearningSampleDetail.hidden = true;
    }
    function clOpenLearningSampleDetail(sample, tab) {
      if (!sample || !clLearningSampleDetail || !clLearningSampleDetailBody) return;
      clLearningSampleDetailBody.innerHTML = `<section class="cl-learning-detail-summary">
        <button class="cl-learning-detail-video ${clEscape(sample.tone)}" type="button" data-cl-sample-detail-play aria-label="预览 ${clEscape(sample.id)}"><i>▶</i><span>9:16</span></button>
        <div class="cl-learning-detail-main"><div class="cl-learning-detail-title"><div><h3>${clEscape(sample.title)}</h3><p>素材 ID：${clEscape(sample.id)} ｜ 千川账户 ID：${clEscape(sample.accountId)}</p></div><b>满足入池规则 ${sample.entryDays} 天</b></div>
          <div class="cl-learning-sample-metrics"><span>消耗 <b>${clFormatMoney(sample.metrics.spend)}</b></span><span>成交金额 <b>${clFormatMoney(sample.metrics.gmv)}</b></span><span>ROI <b>${clFormatDecimal(sample.metrics.roi)}</b></span><span>成交订单 <b>${sample.metrics.orders}</b></span><span class="more">点击率 ${clFormatDecimal(sample.metrics.ctr)}% · 转化率 ${clFormatDecimal(sample.metrics.cvr)}% · 千展成本 ${clFormatMoney(sample.metrics.cpm)} · 点击单价 ${clFormatMoney(sample.metrics.cpc)}</span></div>
        </div>
      </section>
      <nav class="cl-learning-detail-tabs"><button type="button" data-cl-learning-detail-tab="copy">文案解析</button><button type="button" data-cl-learning-detail-tab="records">入池记录（${sample.entryDays} 天）</button></nav>
      <section class="cl-learning-detail-panel" data-cl-learning-detail-panel="copy"><div class="cl-learning-copy-full"><header><b>文案解析</b><button type="button" data-cl-sample-copy>复制文案</button></header><p>${clEscape(sample.script)}</p></div></section>
      <section class="cl-learning-detail-panel" data-cl-learning-detail-panel="records"><p class="cl-learning-records-note">以下展示该素材在当前筛选周期内，单日消耗满足入池规则的记录。</p><div class="cl-learning-records-table"><div class="cl-learning-records-row head"><span>入池日期</span><span>消耗</span><span>成交金额</span><span>ROI</span></div>${sample.records.map(record => `<div class="cl-learning-records-row"><span>${clEscape(record.date)}</span><span>${clFormatMoney(record.spend)}</span><span>${clFormatMoney(record.gmv)}</span><span>${clFormatDecimal(record.roi)}</span></div>`).join("")}</div></section>`;
      clLearningSampleDetail.hidden = false;
      clLearningSampleDetail.classList.add("show");
      clSetLearningSampleDetailTab(tab);
    }
    function clRenderActiveLearningSamples() {
      if (clActiveDetailStructure?.source === "千川学习") clRenderLearningSamples(clActiveDetailStructure);
    }

    function clSetDetailTab(tabName = "stages") {
      const target = document.querySelector(`#clDetailTabs [data-cl-detail-tab="${tabName}"]`);
      if (target?.hidden) tabName = "stages";
      document.querySelectorAll("#clDetailTabs [data-cl-detail-tab]").forEach(button => button.classList.toggle("active", button.dataset.clDetailTab === tabName));
      document.querySelectorAll("#clDetailDrawer [data-cl-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.clDetailPanel === tabName));
      const body = clDetailDrawer?.querySelector(".cl-drawer-body");
      if (body) body.scrollTop = 0;
    }
    function clOpenDetail(item) {
      clActiveDetailStructure = item;
      document.getElementById("clDrawerTitle").textContent = item.name;
      const isCustom = item.source === "自建";
      const isLearned = item.source === "千川学习";
      document.getElementById("clDrawerLearnedAtItem").hidden = !isLearned;
      if (isLearned) {
        const status = "生效中";
        const statusNode = document.getElementById("clDrawerLearningStatus");
        statusNode.textContent = status;
        statusNode.className = "cl-learning-state active";
        document.getElementById("clDrawerLearnedAt").textContent = item.learnedAt || item.updated || "—";
      }
      document.getElementById("clDrawerCustomMeta").hidden = !isCustom;
      document.getElementById("clDrawerEdit").hidden = !clCanEditStructure(item);
      if (isCustom) {
        document.getElementById("clDrawerCreator").textContent = item.creator || "嗡大发";
        document.getElementById("clDrawerCreatedAt").textContent = item.createdAt || item.updated || "—";
      }
      const source = document.getElementById("clDrawerSource");
      source.className = clStructureOriginClass(item); source.textContent = clStructureOrigin(item);
      const isManual = item.source === "自建" && !item.reference;
      const examplesTab = document.getElementById("clExamplesTab");
      const examplesPanel = document.getElementById("clExamplesPanel");
      const examplesHint = document.getElementById("clDrawerExamplesHint");
      const examplesTabLabel = document.getElementById("clExamplesTabLabel");
      const examplesTabCount = document.getElementById("clExampleTabCount");
      const sourceNote = document.getElementById("clDrawerSourceNote");
      const hasReferenceSource = isCustom && Boolean(item.reference);
      sourceNote.hidden = !hasReferenceSource;
      if (hasReferenceSource) {
        document.getElementById("clDrawerReference").textContent = item.reference;
        document.getElementById("clDrawerParseSummary").textContent = item.parseSummary || "已完成内容结构提炼";
      }

      examplesTab.hidden = isManual;
      examplesPanel.hidden = isManual;
      if (isLearned) {
        examplesTabLabel.textContent = "学习素材";
        examplesTabCount.hidden = true;
        examplesHint.hidden = true;
        clRenderLearningSamples(item);
      } else if (item.reference) {
        examplesTabLabel.textContent = "提炼来源";
        examplesTabCount.hidden = false;
        examplesHint.hidden = true;
      } else {
        examplesTabLabel.textContent = "提炼来源";
        examplesTabCount.hidden = false;
        examplesHint.hidden = false;
      }
      const overview = document.getElementById("clStructureOverview");
      overview.innerHTML = `<div class="cl-formula-overview"><small>爆款结构</small><div>${item.formula.split("→").map((part,index) => `${index ? "<i>→</i>" : ""}<b>${clEscape(part.trim())}</b>`).join("")}</div></div><div class="cl-reuse-scope"><b>使用前提</b><span>${clEscape(item.reuse || "每个阶段都应有对应的文案信息和可用画面；实际时长由配音与素材共同校准。")}</span></div>`;
      const example = item.example;
      document.getElementById("clDrawerStages").innerHTML = item.stages.map((stage, index) => {
        const expression = clStageExpression(stage);
        const contentExpression = isLearned ? expression : {
          task:stage.purpose || stage.say,
          strategy:stage.strategy || clBuildExpressionPoint(stage),
          template:stage.talk || stage.say,
          slots:stage.slots || []
        };
        const expressionSource = isLearned ? "学习素材归纳" : item.reference ? "参考视频提炼" : "可编辑";
        const strategyBlock = `<section class="cl-stage-expression"><div class="cl-stage-section-head"><b>表达要点</b></div><p>${clEscape(contentExpression.strategy)}</p></section>`;
        const contentBody = `<section class="cl-stage-group cl-stage-content-group"><div class="cl-stage-group-head"><b>内容表达</b><span>${expressionSource}</span></div><div class="cl-stage-abstract-grid"><section class="cl-stage-expression"><div class="cl-stage-section-head"><b>阶段任务</b></div><p>${clEscape(contentExpression.task)}</p></section>${strategyBlock}</div><section class="cl-stage-talk"><div><b>表达模板</b></div><p>${clEscape(contentExpression.template)}</p>${contentExpression.slots.length ? `<div class="cl-stage-slots"><b>表达变量</b>${contentExpression.slots.map(slot => `<span><code>{${clEscape(slot)}}</code><i>${clEscape(clVariableDescriptions[slot] || "需在创作时补充变量说明")}</i></span>`).join("")}</div>` : ""}</section></section>`;
        const executionContent = `<section class="cl-stage-group cl-stage-execution-group"><div class="cl-stage-group-head"><b>画面执行</b></div><div class="cl-stage-execution"><section><b>素材匹配要求</b><p>${clEscape(stage.visual)}</p></section><section><b>剪辑建议</b><p>${clEscape(stage.edit)}</p></section></div></section>${isLearned ? `<section class="cl-stage-group cl-stage-evidence-group"><div class="cl-stage-evidence-note">学习素材仅用于归纳和核对，不直接参与生成。<button type="button" data-cl-stage-evidence="${index}">查看学习素材</button></div></section>` : ""}`;
        const stageHeader = `<strong>${clEscape(stage.name)}</strong>`;
        return `<article class="cl-stage-card${isLearned ? " learned" : ""}${index === 0 ? " expanded" : ""}" data-cl-stage-card><button class="cl-stage-card-head" type="button" data-cl-stage-toggle><i>${String(index + 1).padStart(2,"0")}</i><span>${stageHeader}</span><u>⌄</u></button><div class="cl-stage-card-body">${contentBody}${executionContent}</div></article>`;
      }).join("");
      if (!isLearned) document.getElementById("clDrawerExamples").innerHTML = !isManual && example ? `<article class="cl-reference-card"><button class="cl-reference-preview" type="button" data-cl-reference-preview aria-label="播放提炼来源视频"><span aria-hidden="true">▶</span><small>9:16</small></button><div class="cl-reference-body"><h3>${clEscape(example.title)}</h3><section class="cl-reference-transcript"><b>识别口播</b><p>${clEscape(example.copy)}</p></section></div></article>` : "";
      document.getElementById("clStageTabCount").textContent = item.stages.length;
      if (!isLearned) examplesTabCount.textContent = !isManual && example ? 1 : 0;
      clSetDetailTab("stages");
      clOpenDrawer();
    }

    document.querySelector("[data-lib-panel='content-structure']")?.addEventListener("click", event => {
      const period = event.target.closest("[data-cl-list-period]");
      if (period) {
        clLearningFilters.period = period.dataset.clListPeriod;
        clLearningFilters.page = 1;
        clSyncListLearningPeriodControls();
        clRenderTable();
        clRenderActiveLearningSamples();
        return;
      }
      const openLearning = event.target.closest("[data-cl-open-learning]");
      if (openLearning && !openLearning.disabled) {
        const item = contentStructures.find(entry => entry.id === Number(openLearning.dataset.clOpenLearning));
        if (item) { clOpenDetail(item); clSetDetailTab("examples"); }
        return;
      }
      const button = event.target.closest("[data-cl-action]");
      if (!button) return;
      if (button.dataset.clAction === "new") { clResetNewModalMode(); return clOpenModal(clNewModal); }
      const item = contentStructures.find(entry => entry.id === Number(button.closest("tr")?.dataset.clId));
      if (!item) return;
      if (button.dataset.clAction === "view") clOpenDetail(item);
      if (button.dataset.clAction === "edit") clOpenEditModal(item);
      if (button.dataset.clAction === "delete") clOpenDeleteModal(item);
      if (button.dataset.clAction === "progress") { clActiveParseTaskId = item.id; clShowParseProgress(item); clOpenModal(clNewModal); }
      if (button.dataset.clAction === "retry") clRetryParseTask(item);
    });
    document.querySelector("[data-lib-panel='content-structure']")?.addEventListener("change", event => {
      const date = event.target.closest("[data-cl-list-date]");
      if (!date) return;
      clLearningFilters.period = "custom";
      clLearningFilters[date.dataset.clListDate] = date.value;
      if (clLearningFilters.start > clLearningFilters.end) clLearningFilters.end = clLearningFilters.start;
      clLearningFilters.page = 1;
      clSyncListLearningPeriodControls();
      clRenderTable();
      clRenderActiveLearningSamples();
    });
    document.getElementById("clCreateSourceStep")?.addEventListener("click", event => {
      const sourceTab = event.target.closest("[data-cl-video-source]");
      if (sourceTab) {
        clActiveVideoSource = sourceTab.dataset.clVideoSource;
        clSelectedVideoRef = null;
        document.querySelectorAll("[data-cl-video-source]").forEach(button => button.classList.toggle("active", button === sourceTab));
        clRenderVideoSource();
        return;
      }
      const finishedSource = event.target.closest("[data-cl-finished-source]");
      if (finishedSource) {
        clVideoPickerFilters.finished.scope = finishedSource.dataset.clFinishedSource;
        clVideoPickerFilters.finished.menu = "";
        clRenderVideoSource();
        return;
      }
      const tagFilter = event.target.closest("[data-cl-open-tag-filter]");
      if (tagFilter) return clOpenVideoTagFilter(tagFilter.dataset.clOpenTagFilter);
      const finishedMenu = event.target.closest("[data-cl-finished-menu]");
      if (finishedMenu) {
        const filters = clVideoPickerFilters.finished;
        filters.menu = filters.menu === finishedMenu.dataset.clFinishedMenu ? "" : finishedMenu.dataset.clFinishedMenu;
        clRenderVideoSource();
        return;
      }
      const finishedFilter = event.target.closest("[data-cl-finished-filter]");
      if (finishedFilter) {
        const filters = clVideoPickerFilters.finished;
        filters[finishedFilter.dataset.clFinishedFilter] = finishedFilter.dataset.clFinishedValue;
        filters.menu = "";
        clRenderVideoSource();
        return;
      }
      const externalMenu = event.target.closest("[data-cl-external-menu]");
      if (externalMenu) {
        const filters = clVideoPickerFilters.external;
        filters.menu = filters.menu === externalMenu.dataset.clExternalMenu ? "" : externalMenu.dataset.clExternalMenu;
        clRenderVideoSource();
        return;
      }
      const externalFilter = event.target.closest("[data-cl-external-filter]");
      if (externalFilter) {
        const filters = clVideoPickerFilters.external;
        filters[externalFilter.dataset.clExternalFilter] = externalFilter.dataset.clExternalValue;
        filters.menu = "";
        clRenderVideoSource();
        return;
      }
      const videoCard = event.target.closest("[data-cl-video-id]");
      if (videoCard) {
        document.querySelectorAll("[data-cl-video-id]").forEach(card => card.classList.toggle("selected", card === videoCard));
        const video = clVideoSourceCatalog[clActiveVideoSource].find(item => item.id === videoCard.dataset.clVideoId);
        clSelectedVideoRef = video ? { ...video, meta:`${video.meta} · ${video.duration} · ${clVideoStatusText[video.status] || "待分析"}` } : null;
        clUpdateParseState();
        return;
      }
      if (event.target.closest("#clChooseVideoFile")) return document.getElementById("clVideoUploadInput")?.click();
      if (event.target.closest("#clClearVideoLink")) {
        const input = document.getElementById("clVideoLinkInput");
        if (input) input.value = "";
        clSelectedVideoRef = null; clUpdateParseState();
      }
    });
    document.getElementById("clCreateSourceStep")?.addEventListener("change", event => {
      const filter = event.target.dataset.clVideoFilter;
      if (filter && clVideoPickerFilters[clActiveVideoSource]) {
        clVideoPickerFilters[clActiveVideoSource][filter] = event.target.value;
        clRenderVideoSource();
        return;
      }
      if (event.target.id !== "clVideoUploadInput") return;
      const file = event.target.files?.[0];
      clSelectedVideoRef = file ? { id:"upload", name:file.name, meta:`本地上传 · ${(file.size / 1024 / 1024).toFixed(1)}MB`, profileId:1, uploadStatus:"uploading" } : null;
      const label = document.getElementById("clUploadFileName");
      const progress = document.getElementById("clUploadProgress");
      const state = document.getElementById("clUploadState");
      const percent = document.getElementById("clUploadPercent");
      const bar = document.getElementById("clUploadBar");
      if (label && file) { label.textContent = `正在上传：${file.name}`; label.classList.add("cl-upload-selected"); }
      if (progress) progress.hidden = !file;
      if (!file) return clUpdateParseState();
      let uploadProgress = 12;
      const renderUpload = () => { if (percent) percent.textContent = `${uploadProgress}%`; if (bar) bar.style.width = `${uploadProgress}%`; };
      renderUpload();
      const uploadTimer = setInterval(() => {
        uploadProgress = Math.min(100, uploadProgress + 22);
        renderUpload();
        if (uploadProgress < 100) return;
        clearInterval(uploadTimer);
        if (!clSelectedVideoRef || clSelectedVideoRef.name !== file.name) return;
        clSelectedVideoRef.uploadStatus = "uploaded";
        if (label) label.textContent = `上传完成：${file.name} · 可开始解析`;
        if (state) state.textContent = "上传完成";
        clUpdateParseState();
      }, 220);
      clUpdateParseState();
    });
    document.getElementById("clCreateSourceStep")?.addEventListener("input", event => {
      const filter = event.target.dataset.clVideoFilter;
      if (filter && clVideoPickerFilters[clActiveVideoSource]) {
        clVideoPickerFilters[clActiveVideoSource][filter] = event.target.value;
        clRenderVideoSource();
        return;
      }
      if (event.target.id !== "clVideoLinkInput") return;
      const link = event.target.value.trim();
      clSelectedVideoRef = /^https?:\/\//i.test(link) ? { id:"link", name:link, meta:"视频链接", profileId:1 } : null;
      clUpdateParseState();
    });
    document.getElementById("clParseVideo")?.addEventListener("click", () => {
      if (!clSelectedVideoRef) return showToast("请先选择视频或输入有效链接");
      if (clSelectedVideoRef.uploadStatus === "uploading") return showToast("视频仍在上传中，请完成后再开始解析");
      clStartParseTask({...clSelectedVideoRef});
    });
    document.getElementById("clBackgroundParse")?.addEventListener("click", () => {
      const item = contentStructures.find(entry => entry.id === clActiveParseTaskId);
      if (item?.parseStatus === "completed") { clCloseModal(clNewModal); clOpenDetail(item); return; }
      clCloseModal(clNewModal);
      clResetNewModalMode();
      showToast("解析已转入后台，可在列表查看进度");
    });
    document.getElementById("clBackSource")?.addEventListener("click", () => {
      if (clEditingId) return;
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      clShowSourceStep();
    });
    ["clStructureSearch", "clStructureSourceFilter"].forEach(id => document.getElementById(id)?.addEventListener(id === "clStructureSearch" ? "input" : "change", clRenderTable));
    document.getElementById("clNewMethod")?.addEventListener("change", clToggleReference);
    document.getElementById("clAddStage")?.addEventListener("click", () => document.getElementById("clStageEditor")?.insertAdjacentHTML("beforeend", clStageRow()));
    document.getElementById("clStageEditor")?.addEventListener("click", event => {
      const remove = event.target.closest("[data-remove-stage]");
      if (!remove) return;
      if (document.querySelectorAll("#clStageEditor .cl-stage-editor-row").length <= 2) return showToast("内容结构至少保留 2 个阶段");
      remove.closest(".cl-stage-editor-row")?.remove();
    });

    document.querySelectorAll("[data-cl-close='new']").forEach(btn => btn.addEventListener("click", () => { clCloseModal(clNewModal); clResetNewModalMode(); }));
    document.querySelectorAll("[data-cl-close='delete']").forEach(btn => btn.addEventListener("click", () => { clDeletingId = null; clDeleteTargetName = ""; clCloseModal(clDeleteModal); }));
    document.querySelectorAll("[data-cl-close='drawer']").forEach(btn => btn.addEventListener("click", clCloseDrawer));
    document.getElementById("clDrawerEdit")?.addEventListener("click", () => {
      if (!clCanEditStructure(clActiveDetailStructure)) return;
      clCloseDrawer();
      clOpenEditModal(clActiveDetailStructure);
    });
    if (clDrawerOverlay) clDrawerOverlay.addEventListener("click", clCloseDrawer);
    if (clNewModal) clNewModal.addEventListener("click", e => { if (e.target === clNewModal) { clCloseModal(clNewModal); clResetNewModalMode(); } });
    if (clDeleteModal) clDeleteModal.addEventListener("click", e => { if (e.target === clDeleteModal) { clDeletingId = null; clDeleteTargetName = ""; clCloseModal(clDeleteModal); } });

    document.getElementById("clNewSave")?.addEventListener("click", () => {
      const newName = document.getElementById("clNewName").value.trim();
      const newFormula = document.getElementById("clNewFormula").value.trim();
      if (!newName) { showToast("请填写结构名称"); return; }
      if (!newFormula) { showToast("请填写结构公式"); return; }
      const stages = clReadStages();
      if (stages.length < 2 || stages.some(stage => !stage.say || !stage.visual || !stage.edit)) { showToast("请至少完整填写 2 个结构阶段"); return; }
      const reference = document.getElementById("clNewReference").value.trim();
      if (!reference) { showToast("请选择或填写参考视频"); return; }
      const existing = contentStructures.find(item => item.id === clEditingId);
      const next = {
        ...(existing || {}), id: existing?.id || Date.now(), name:newName, formula:newFormula, source:"自建",
        method:"从参考视频提炼", reference, stages, creator:existing?.creator || "嗡大发", createdAt:existing?.createdAt || clNow(), updated:clNow(),
        parseStatus: existing?.parseStatus || "completed",
        validationStatus: "提炼完成",
        parseStep: existing?.parseStep || 0,
        parseSummary: existing?.parseSummary || (reference ? "视频解析已完成" : ""),
        example:{ ...(existing?.example || {}), title:`${newName}｜创作示例`, meta:"自建内容结构 · 暂无投放数据", badge:"自建", copy:stages.map(stage => stage.say).join(" ") }
      };
      if (existing) Object.assign(existing, next); else contentStructures.unshift(next);
      showToast(existing ? "已保存修改" : "已保存自建内容结构");
      clCloseModal(clNewModal);
      clResetNewModalMode();
      clRenderTable();
    });
    document.getElementById("clDeleteConfirm")?.addEventListener("click", () => {
      contentStructures = contentStructures.filter(item => item.id !== clDeletingId);
      clDeletingId = null;
      clCloseModal(clDeleteModal);
      clRenderTable();
      showToast(`已删除「${clDeleteTargetName}」`);
    });
    document.getElementById("clDrawerExamples")?.addEventListener("click", event => {
      const preview = event.target.closest("[data-cl-reference-preview]");
      if (preview) {
        const playing = preview.classList.toggle("playing");
        preview.querySelector("span").textContent = playing ? "Ⅱ" : "▶";
        preview.setAttribute("aria-label", playing ? "暂停提炼来源视频" : "播放提炼来源视频");
        showToast(playing ? "正在播放提炼来源视频" : "已暂停提炼来源视频");
        return;
      }
      const period = event.target.closest("[data-cl-learning-period]");
      if (period) {
        clLearningFilters.period = period.dataset.clLearningPeriod;
        clLearningFilters.page = 1;
        clSyncListLearningPeriodControls();
        clRenderTable();
        clRenderActiveLearningSamples();
        return;
      }
      const page = event.target.closest("[data-cl-learning-page]");
      if (page && !page.disabled) {
        clLearningFilters.page = Number(page.dataset.clLearningPage);
        clRenderActiveLearningSamples();
        requestAnimationFrame(() => document.querySelector(".cl-learning-list")?.scrollIntoView({ block:"start", behavior:"smooth" }));
        return;
      }
      const play = event.target.closest("[data-cl-sample-play]");
      if (play) {
        const card = play.closest("[data-cl-learning-sample]");
        const isPlaying = card.classList.toggle("playing");
        play.querySelector("i").textContent = isPlaying ? "Ⅱ" : "▶";
        play.querySelector("em").textContent = isPlaying ? "预览播放中" : "预览播放";
        return showToast(isPlaying ? "正在预览素材" : "已暂停预览");
      }
      const detail = event.target.closest("[data-cl-sample-detail]");
      if (detail && clActiveDetailStructure) {
        const sample = clLearningMaterialRows(clLearningDailyRows(clActiveDetailStructure.id), clLearningFilters.sort)
          .find(row => row.id === detail.dataset.clSampleId && row.accountId === detail.dataset.clSampleAccount);
        if (sample) clOpenLearningSampleDetail(sample, detail.dataset.clSampleDetail);
      }
    });
    clLearningSampleDetail?.addEventListener("click", event => {
      if (event.target.closest("[data-cl-learning-detail-close]")) return clCloseLearningSampleDetail();
      const tab = event.target.closest("[data-cl-learning-detail-tab]");
      if (tab) return clSetLearningSampleDetailTab(tab.dataset.clLearningDetailTab);
      const copy = event.target.closest("[data-cl-sample-copy]");
      if (copy) {
        const text = clLearningSampleDetail.querySelector(".cl-learning-copy-full p")?.textContent || "";
        navigator.clipboard?.writeText(text);
        return showToast("文案解析已复制");
      }
      const play = event.target.closest("[data-cl-sample-detail-play]");
      if (play) {
        const active = play.classList.toggle("playing");
        play.querySelector("i").textContent = active ? "Ⅱ" : "▶";
        return showToast(active ? "正在预览素材" : "已暂停预览");
      }
    });
    document.getElementById("clDrawerExamples")?.addEventListener("change", event => {
      const sort = event.target.closest("[data-cl-learning-sort]");
      if (sort) { clLearningFilters.sort = sort.value; clLearningFilters.page = 1; clRenderActiveLearningSamples(); return; }
      const query = event.target.closest("[data-cl-learning-query]");
      if (query) { clLearningFilters.query = query.value; clLearningFilters.page = 1; clRenderActiveLearningSamples(); return; }
      const date = event.target.closest("[data-cl-learning-date]");
      if (date) {
        clLearningFilters[date.dataset.clLearningDate] = date.value;
        if (clLearningFilters.start > clLearningFilters.end) clLearningFilters.end = clLearningFilters.start;
        clLearningFilters.page = 1;
        clSyncListLearningPeriodControls();
        clRenderTable();
        clRenderActiveLearningSamples();
      }
    });
    document.getElementById("clDrawerExamples")?.addEventListener("keydown", event => {
      const query = event.target.closest("[data-cl-learning-query]");
      if (query && event.key === "Enter") {
        event.preventDefault();
        clLearningFilters.query = query.value;
        clLearningFilters.page = 1;
        clRenderActiveLearningSamples();
      }
    });
    document.getElementById("clDrawerStages")?.addEventListener("click", event => {
      const toggle = event.target.closest("[data-cl-stage-toggle]");
      if (toggle) return toggle.closest("[data-cl-stage-card]").classList.toggle("expanded");
      const evidence = event.target.closest("[data-cl-stage-evidence]");
      if (evidence && clActiveDetailStructure?.source === "千川学习") {
        clSetDetailTab("examples");
        showToast("已打开学习素材，可查看真实口播与文案解析");
      }
    });
    document.getElementById("clDetailTabs")?.addEventListener("click", event => {
      const button = event.target.closest("[data-cl-detail-tab]");
      if (button) clSetDetailTab(button.dataset.clDetailTab);
    });

    /* 模板库公共操作桥：产品关联资产复用本页数据、弹窗与操作，不维护第二套实现。 */
    let templateOperationBridgeActive = false;
    function templateBridgeCatalog() {
      return {
        prompt: promptLibraryRecords.map(record => ({ id:record.id, name:record.title, category:record.category, description:record.description, agent:record.category === "商品详情图" ? "商品详情图 Agent" : "商品主图 Agent", text:promptLibraryPreview(record), tags:record.category === "商品详情图" ? (record.modules || []).map(item => item.name) : (record.segments || []).filter(item => item.value).map(item => item.label), createdAt:record.createdAt, isDefault:Boolean(record.isDefault) })),
        persona: personaCatalog.map(persona => {
          const linkedProducts = personaProducts(persona);
          return { id:persona.id, name:persona.name, audience:`${persona.audience} · ${persona.gender}`, age:`${persona.age}岁`, scene:persona.scenes.join("；"), pain:persona.pain.join("；"), scope:linkedProducts.join("、") || persona.category || persona.brand || "通用", linkedProducts, created:`嗡大发 · ${persona.created || "08/01 10:20"}`, updated:`嗡大发 · ${persona.updated}`, usage:persona.usage };
        }),
        canvas: [...(canvasTemplateGrid?.querySelectorAll(":scope > .canvas-card") || [])].map(card => ({ id:card.dataset.canvasTemplate, name:card.querySelector(".canvas-header strong")?.textContent.trim() || "未命名画板", type:card.querySelector(".canvas-badge")?.textContent.trim() || "自定义", description:card.querySelector(".canvas-desc")?.textContent.trim() || "", node:card.querySelector(".canvas-stat")?.textContent.trim() || "—", usage:Number((card.querySelectorAll(".canvas-stat")[1]?.textContent.match(/\d+/) || [0])[0]), updated:"刚刚" })),
        "content-structure": contentStructures.map(item => ({
          id:String(item.id),
          name:item.name,
          source:clStructureOrigin(item),
          sourceKey:item.source === "千川学习" ? "qianchuan" : item.method === "从参考视频提炼" ? "reference" : "custom",
          formula:item.formula,
          reference:item.reference || item.example?.title || "",
          status:item.source === "千川学习" ? clLearningLifecycle(item) : (item.validationStatus || (item.source === "自建" ? "提炼完成" : "已启用")),
          sampleCount:Number(item.learningSampleCount || 0),
          recent30:item.source === "千川学习" ? clLearningRecent30Summary(item.id) : null,
          stageCount:item.stages.length,
          stageNames:item.stages.map(stage => stage.name),
          mixProfile:item.mixProfile || "",
          autoProductIds:item.autoProductIds || [],
          productNames:item.productNames || [],
          scriptTypes:item.scriptTypes || [],
          defaultForScriptTypes:item.defaultForScriptTypes || [],
          updated:item.updated
        }))
      };
    }
    function templateBridgePost(type) {
      if (window.parent !== window) window.parent.postMessage({ type, catalog:templateBridgeCatalog() }, "*");
    }
    function templateBridgeHasSurface() {
      return Boolean(document.querySelector(".modal-backdrop.show, .cl-drawer.show, .cl-drawer-overlay.show"));
    }
    function templateBridgeFinish() {
      if (!templateOperationBridgeActive || templateBridgeHasSurface()) return;
      templateOperationBridgeActive = false;
      document.documentElement.classList.remove("template-operation-bridge");
      templateBridgePost("content-compass-template-catalog");
      templateBridgePost("content-compass-template-operation-close");
    }
    function templateBridgeActivateTab(kind) {
      document.querySelector(`[data-lib-tab="${kind}"]`)?.click();
    }
    function templateBridgeOpen(message) {
      const kind = message.kind;
      const action = message.action;
      templateBridgeActivateTab(kind);
      templateOperationBridgeActive = true;
      document.documentElement.classList.add("template-operation-bridge");
      if (kind === "prompt") {
        const record = promptLibraryRecords.find(item => item.id === message.id || item.title === message.name);
        if (!record) return templateBridgeFinish();
        if (action === "template-edit") openPromptLibraryEditor(record);
        if (action === "template-delete") { deletingPromptLibraryId = record.id; document.getElementById("deletePromptLibraryName").textContent = record.title; togglePromptLibraryModal(promptLibraryDeleteModal, true); }
        if (action === "prompt-default") { promptLibraryRecords.forEach(item => { if (item.category === record.category) item.isDefault = item.id === record.id; }); persistPromptLibraryRecords(); renderPromptLibrary(); showToast(`“${record.title}”已设为默认模板`); }
      } else if (kind === "persona") {
        if (action === "template-create") {
          openPersonaModal();
          if (message.productName) setPersonaProduct(message.productName);
          return requestAnimationFrame(templateBridgeFinish);
        }
        if (action === "template-associate" || action === "template-disassociate") {
          const ids = new Set((message.personaIds || []).map(String));
          personaCatalog.forEach(persona => {
            if (!ids.has(String(persona.id))) return;
          const linkedProducts = action === "template-associate" && message.productName ? [message.productName] : [];
          persona.linkedProducts = linkedProducts;
          persona.product = linkedProducts[0] || "";
          });
          return requestAnimationFrame(templateBridgeFinish);
        }
        const persona = personaCatalog.find(item => item.id === message.id || item.name === message.name);
        if (!persona) return templateBridgeFinish();
        if (action === "template-edit") openPersonaModal(persona.id);
        if (action === "history") openPersonaHistory(persona.id);
        if (action === "template-copy") copyPersona(persona.id);
        if (action === "template-delete") openPersonaDelete(persona.id);
      } else if (kind === "canvas") {
        const card = [...(canvasTemplateGrid?.querySelectorAll(":scope > .canvas-card") || [])].find(item => item.dataset.canvasTemplate === String(message.id) || item.querySelector(".canvas-header strong")?.textContent.trim() === message.name);
        if (!card) return templateBridgeFinish();
        if (action === "template-edit") openCanvasTemplateEditor(card);
        if (action === "template-delete") {
          deletingCanvasTemplateCard = card;
          document.getElementById("deleteCanvasTemplateName").textContent = card.querySelector(".canvas-header strong")?.textContent.trim() || "该模板";
          canvasTemplateDeleteModal?.classList.add("show");
        }
      } else if (kind === "content-structure") {
        const item = contentStructures.find(entry => String(entry.id) === String(message.id) || entry.name === message.name);
        if (!item) return templateBridgeFinish();
        if (action === "template-view") clOpenDetail(item);
        if (action === "template-edit") clOpenEditModal(item);
        if (action === "template-delete") clOpenDeleteModal(item);
      }
      requestAnimationFrame(templateBridgeFinish);
    }
    window.addEventListener("message", event => {
      if (event.data?.type === "content-compass-template-catalog-request") return templateBridgePost("content-compass-template-catalog");
      if (event.data?.type === "content-compass:persona-product-picker-selected") return setPersonaProduct(event.data.productName || "");
      if (event.data?.type === "content-compass-template-operation") templateBridgeOpen(event.data);
    });
    document.addEventListener("click", () => setTimeout(templateBridgeFinish, 0));
    document.addEventListener("keydown", event => { if (event.key === "Escape") setTimeout(templateBridgeFinish, 0); });

    clRenderTable();

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { clCloseModal(clNewModal); clCloseModal(clDeleteModal); clDeletingId = null; clResetNewModalMode(); clCloseDrawer(); }
    });

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

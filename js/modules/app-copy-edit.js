    // ── 文案库 ──
    const clData = [
      { id:"cl1", text:"99块钱！苏泊尔这个除螨仪，能把床垫里的螨虫全吸出来！以前 Cleaning 靠晒，现在三分钟吸完，孩子过敏少了。", product:"除螨仪", crowd:"宝妈/家庭", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 14:23:05", source:"AI" },
      { id:"cl2", text:"别再用烤箱预热了！苏泊尔空气炸锅，200度15分钟，鸡翅外酥里嫩，不用一滴油，少吃油不长胖。", product:"空气炸锅", crowd:"年轻白领", structure:[{t:"compare",l:"对比"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:154, duration:28, updated:"08-04 11:07:42", source:"AI" },
      { id:"cl3", text:"苏泊尔洗地机，吸拖洗一体，干湿垃圾一次搞定，清洁力提升3倍，省时省力更省心。", product:"洗地机", crowd:"家庭主妇", structure:[{t:"proof",l:"证据"},{t:"sell",l:"卖点"}], chars:168, duration:30, updated:"08-03 16:55:18", source:"手工新增" },
      { id:"cl4", text:"姐妹们！这个面霜我真的要用喇叭喊！干皮亲妈不是吹的，用完第二天脸嫩到想摸自己一百遍。核心成分玻色因+神经酰胺，修护屏障同时锁水保湿，质地像冰淇淋一样一抹就化。现在拍一发三，错过等半年！", product:"焕颜修护面霜", crowd:"干皮/敏感肌", structure:[{t:"hook",l:"钩子"},{t:"pain",l:"痛点"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:186, duration:32, updated:"08-04 09:45:11", source:"AI" },
      { id:"cl5", text:"你是不是买了一堆护肤品，结果该起皮还是起皮？因为你根本没修屏障！XXX专研屏障修护13年，这个精华水含5重神经酰胺，3秒吸收不粘腻。现在买正装送同款旅行装。", product:"屏障修护精华水", crowd:"屏障受损/混油皮", structure:[{t:"pain",l:"痛点"},{t:"proof",l:"信任"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:142, duration:24, updated:"08-03 20:30:18", source:"AI" },
      { id:"cl6", text:"夏天出门三件套：防晒+散粉+定妆喷雾。这款防晒SPF50+PA++++，关键是跟妆不搓泥，成膜之后哑光雾面感。今天直播间拍防晒送散粉小样。", product:"哑光防晒霜", crowd:"通勤/混油皮", structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"逼单"}], chars:128, duration:22, updated:"08-03 15:22:45", source:"手工新增" },
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
        const sourceLabel = r.source === "AI" ? "AI生成" : r.source;
        const sourceTag = '<span class="cl-source-tag ' + (isAI ? 'ai' : 'import') + '">' + sourceLabel + '</span>';
        const editBtn = '<button class="cl-act-btn" onclick="clEditText(\'' + r.id + '\')">编辑</button>';
        const viewBtn = '<button class="cl-act-btn cl-act-view" onclick="clViewText(\'' + r.id + '\')">查看</button>';
        const aiDropBtn = '<div class="cl-ai-drop"><button class="cl-ai-btn" onclick="clToggleAIMenu(event)">AI <span class="cl-ai-caret">▼</span></button><div class="cl-ai-menu"><button onclick="clAIAction(&quot;rewrite&quot;,&quot;' + r.id + '&quot;)">智能改写</button><button onclick="clAIAction(&quot;clone&quot;,&quot;' + r.id + '&quot;)">爆款仿写</button><button onclick="clAIAction(&quot;script&quot;,&quot;' + r.id + '&quot;)">智能脚本</button><button onclick="clAIAction(&quot;remix&quot;,&quot;' + r.id + '&quot;)">智能混剪</button></div></div>';
        const delBtn = '<button class="cl-act-btn cl-act-danger" onclick="clDelete(&quot;' + r.id + '&quot;)">删除</button>';
        const moreItems = [];
        if (isAI) moreItems.push('<button onclick="clLocate(\'' + r.id + '\')">定位至会话</button>');
        moreItems.push('<button onclick="AssetAudit.showHistory(\'文案\',\'' + r.product.replace(/'/g, "") + '文案\')">查看变更</button>');
        const moreBtn = '<div class="cl-more-drop"><button class="cl-act-btn cl-more-btn" onclick="clToggleMoreMenu(event)" title="更多操作">⋯</button><div class="cl-more-menu">' + moreItems.join('') + '</div></div>';
        const actBtns = viewBtn + editBtn + aiDropBtn + delBtn + moreBtn;
        return '<tr>'
          + '<td class="cl-col-text"><span class="cl-copy-text" data-id="' + r.id + '" title="' + escapeHtml(r.text) + '">' + r.text + '</span></td>'
          + '<td>' + sourceTag + '</td>'
          + '<td>' + r.product + '</td>'
          + '<td>' + r.crowd + '</td>'
          + '<td class="cl-col-struct">' + chips + '</td>'
          + '<td class="cl-col-chars">' + r.chars + '字/' + r.duration + 's</td>'
          + '<td class="asset-audit-cell"><b>' + (r.createdBy || '嗡大发') + '</b><small>' + (r.createdAt || '08/01 10:20') + '</small></td>'
          + '<td class="asset-audit-cell"><b>' + (r.updatedBy || '嗡大发') + '</b><small>' + r.updated.replace(/-/g, '/') .replace(/:([0-9]{2})$/, '') + '</small></td>'
          + '<td class="cl-col-act"><div class="cl-act-group">' + actBtns + '</div></td>'
          + '</tr>';
      }).join("");
    }

    // ===== 文案编辑弹窗 =====
    const clEditModal = document.getElementById("clEditModal");
    let clEditingId = null;

    function clEditText(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!item) return;
      clEditingId = id;
      // 填充字段
      // 关联产品:从文本反查 productId(可能在档案库中)
      const matchedEntry = Object.entries(productCatalog).find(function(entry) { return entry[1].name === item.product; });
      const productId = matchedEntry ? matchedEntry[0] : "";
      setClEditProduct(productId, matchedEntry ? matchedEntry[1] : null, item.product);
      document.getElementById("clEditText").value = item.text || "";
      // 元信息(只读)
      document.getElementById("clEditMetaSource").textContent = item.source || "—";
      document.getElementById("clEditMetaChars").textContent = (item.chars || item.text.length) + "字 / " + (item.duration || "—") + "s";
      document.getElementById("clEditMetaUpdated").textContent = item.updated || "—";
      clHydrateEditPersona(item);
      // 清除校验态
      clClearEditValidation();
      clUpdateEditCounter();
      // 打开弹窗
      clEditModal.classList.add("show");
      setTimeout(function() { clEditModal.querySelector("[data-cl-edit-product-picker]")?.focus(); }, 0);
    }

    function setClEditProduct(productId, product, fallbackName) {
      const input = document.getElementById("clEditProduct");
      const label = clEditModal.querySelector("[data-cl-edit-product-label]");
      if (!input || !label) return;
      input.value = productId || "";
      const displayName = product?.name || fallbackName || "选择产品";
      label.textContent = displayName;
      label.classList.toggle("placeholder", !displayName || displayName === "选择产品");
    }

    function openClEditProductPicker() {
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        items: Object.entries(productCatalog).map(function(entry) { return { id: entry[0], ...entry[1] }; }),
        selectedId: document.getElementById("clEditProduct").value,
        onConfirm: function(productId, product) {
          setClEditProduct(productId, product, product?.name);
        }
      });
    }

    function clClearEditValidation() {
      clEditModal.querySelectorAll(".cl-edit-field").forEach(function(f) { f.classList.remove("invalid"); });
      const err = document.getElementById("clEditModalError");
      err.hidden = true;
      err.textContent = "";
    }

    function clUpdateEditCounter() {
      const ta = document.getElementById("clEditText");
      const counter = document.getElementById("clEditCounter");
      const len = ta.value.length;
      counter.textContent = len + " / 500 字";
      counter.classList.toggle("over", len > 500);
    }

    function clCloseEditModal() {
      clEditModal.classList.remove("show");
      clEditingId = null;
    }

    // ===== 文案查看弹窗(只读) =====
    const clViewModal = document.getElementById("clViewModal");
    let clViewingId = null;

    function clViewText(id) {
      const item = clData.find(function(r) { return r.id === id; });
      if (!item) return;
      clViewingId = id;
      // 元信息
      const sourceLabel = item.source === "AI" ? "AI生成" : (item.source || "—");
      document.getElementById("clViewMetaSource").textContent = sourceLabel;
      document.getElementById("clViewMetaChars").textContent = (item.chars || (item.text || "").length) + "字 / " + (item.duration || "—") + "s";
      document.getElementById("clViewMetaUpdated").textContent = item.updated || "—";
      // 基础信息
      document.getElementById("clViewProduct").textContent = item.product || "—";
      document.getElementById("clViewText").textContent = item.text || "—";
      // 人群快照(优先快照,无快照取顶层)
      const p = item.personaSnapshot || {
        audiences: item.crowd ? [item.crowd] : [],
        gender: "不限",
        age: "",
        pain: [],
        scenes: []
      };
      document.getElementById("clViewAudience").textContent = (p.audiences || []).join("、") || "—";
      document.getElementById("clViewGender").textContent = p.gender || "不限";
      document.getElementById("clViewAge").textContent = p.age || "—";
      document.getElementById("clViewPain").textContent = (p.pain || []).length ? (p.pain || []).map(function(line) { return "· " + line; }).join("\n") : "—";
      document.getElementById("clViewScenes").textContent = (p.scenes || []).length ? (p.scenes || []).map(function(line) { return "· " + line; }).join("\n") : "—";
      // 打开弹窗
      clViewModal.classList.add("show");
    }

    function clCloseViewModal() {
      clViewModal.classList.remove("show");
      clViewingId = null;
    }

    function clHydrateEditPersona(item) {
      const snapshot = item.personaSnapshot || {};
      const mode = snapshot.source || (item.personaTemplateId ? "template" : "manual");
      clSetEditAudienceMode(mode);
      clSetEditAudienceValues(snapshot.audiences?.length ? snapshot.audiences : (item.crowd ? [item.crowd] : []));
      clSetEditSingleChoice("gender", snapshot.gender || "不限");
      clSetEditAge(snapshot.age || "");
      document.getElementById("clEditPersonaPain").value = Array.isArray(snapshot.pain) ? snapshot.pain.join("\n") : "";
      document.getElementById("clEditPersonaScenes").value = Array.isArray(snapshot.scenes) ? snapshot.scenes.join("\n") : "";
      if (mode === "template") clSetEditPersonaTemplate(snapshot.templateId || item.personaTemplateId || "", !item.personaSnapshot);
    }

    function clSetEditAudienceMode(mode, openTemplatePicker = false) {
      const templateMode = mode === "template";
      clEditModal.dataset.audienceMode = mode;
      clEditModal.querySelectorAll("[data-cl-audience-mode]").forEach(button => button.classList.toggle("active", button.dataset.clAudienceMode === mode));
      clEditModal.querySelector("[data-cl-audience-template]").hidden = !templateMode;
      if (!templateMode) {
        delete clEditModal.dataset.personaTemplateId;
        clEditModal.querySelector("[data-cl-persona-selected]").textContent = "选择人群画像模板";
        window.CreationPersonaPicker?.close();
      } else if (openTemplatePicker) {
        clOpenEditPersonaTemplatePicker();
      }
    }

    function clSetEditAudienceValues(values) {
      const selected = new Set(values || []);
      clEditModal.querySelectorAll("[data-cl-audience]").forEach(button => button.classList.toggle("active", selected.has(button.dataset.clAudience)));
    }

    function clSetEditSingleChoice(type, value) {
      const selector = type === "gender" ? "[data-cl-gender]" : "[data-cl-age]";
      clEditModal.querySelectorAll(selector).forEach(button => button.classList.toggle("active", button.dataset[type === "gender" ? "clGender" : "clAge"] === value));
    }

    function clSetEditAge(value) {
      const age = value === "51+" ? "50+" : value;
      const standard = [...clEditModal.querySelectorAll("[data-cl-age]")].some(button => button.dataset.clAge === age);
      clSetEditSingleChoice("age", standard ? age : (age ? "custom" : ""));
      const custom = clEditModal.querySelector("[data-cl-custom-age]");
      custom.hidden = standard || !age;
      if (!standard && age) {
        const [min, max] = age.split(/[–-]/);
        document.getElementById("clEditAgeMin").value = min || "";
        document.getElementById("clEditAgeMax").value = max || "";
      } else {
        document.getElementById("clEditAgeMin").value = "";
        document.getElementById("clEditAgeMax").value = "";
      }
    }

    function clSetEditPersonaTemplate(id, applyFields = true) {
      const persona = personaCatalog.find(item => item.id === id);
      const label = clEditModal.querySelector("[data-cl-persona-selected]");
      if (!persona) {
        delete clEditModal.dataset.personaTemplateId;
        label.textContent = "选择人群画像模板";
        return;
      }
      clEditModal.dataset.personaTemplateId = persona.id;
      label.textContent = persona.name;
      if (!applyFields) return;
      clSetEditAudienceValues([persona.audience]);
      clSetEditSingleChoice("gender", persona.gender || "不限");
      clSetEditAge(persona.age || "");
      document.getElementById("clEditPersonaPain").value = (persona.pain || []).join("\n");
      document.getElementById("clEditPersonaScenes").value = (persona.scenes || []).join("\n");
    }

    function clOpenEditPersonaTemplatePicker() {
      if (!window.CreationPersonaPicker) return showToast("人群模板选择器加载失败，请刷新页面后重试。");
      const product = (clEditModal.querySelector("[data-cl-edit-product-label]")?.textContent || "").trim();
      window.CreationPersonaPicker.open({
        items: personaCatalog,
        productName:product,
        selectedId:clEditModal.dataset.personaTemplateId || "",
        onConfirm(persona) { clSetEditPersonaTemplate(persona?.id || ""); }
      });
    }

    function clReadEditPersona() {
      const audiences = [...clEditModal.querySelectorAll("[data-cl-audience].active")].map(button => button.dataset.clAudience);
      const gender = clEditModal.querySelector("[data-cl-gender].active")?.dataset.clGender || "不限";
      const ageChoice = clEditModal.querySelector("[data-cl-age].active")?.dataset.clAge || "";
      const age = ageChoice === "custom"
        ? [document.getElementById("clEditAgeMin").value.trim(), document.getElementById("clEditAgeMax").value.trim()].filter(Boolean).join("–")
        : ageChoice;
      const splitLines = id => document.getElementById(id).value.split("\n").map(value => value.trim()).filter(Boolean);
      return {
        source:clEditModal.dataset.audienceMode || "manual",
        templateId:clEditModal.dataset.personaTemplateId || "",
        audiences,
        gender,
        age,
        pain:splitLines("clEditPersonaPain"),
        scenes:splitLines("clEditPersonaScenes")
      };
    }

    function clApplyEditAiSuggestion(type) {
      const product = (clEditModal.querySelector("[data-cl-edit-product-label]")?.textContent || "").trim() || "产品";
      const samples = type === "pain"
        ? [[`担心${product}使用效果不稳定`, "不想花太多时间处理日常麻烦"], ["希望一次解决核心问题", "更在意使用过程是否省心"]]
        : [[`${product}的日常使用场景`, "需要快速处理问题的即时场景"], ["周末集中使用场景", "家人共同使用的生活场景"]];
      const key = type === "pain" ? "painSuggestionIndex" : "sceneSuggestionIndex";
      const index = Number(clEditModal.dataset[key] || 0) % samples.length;
      document.getElementById(type === "pain" ? "clEditPersonaPain" : "clEditPersonaScenes").value = samples[index].join("\n");
      clEditModal.dataset[key] = String(index + 1);
    }

    function clSaveEditModal() {
      if (!clEditingId) return;
      const product = (clEditModal.querySelector("[data-cl-edit-product-label]")?.textContent || "").trim();
      const persona = clReadEditPersona();
      const text = document.getElementById("clEditText").value.trim();
      // 校验
      clClearEditValidation();
      let firstInvalid = null;
      const mark = function(el) {
        const field = el.closest(".cl-edit-field");
        if (field) field.classList.add("invalid");
        if (!firstInvalid) firstInvalid = el;
      };
      if (!product) mark(document.getElementById("clEditProduct"));
      if (!persona.audiences.length || (persona.source === "template" && !persona.templateId)) mark(document.getElementById("clEditPersonaField"));
      if (text.length < 5 || text.length > 500) mark(document.getElementById("clEditText"));
      if (firstInvalid) {
        const err = document.getElementById("clEditModalError");
        err.hidden = false;
        const msgs = [];
        if (!product) msgs.push("关联产品");
        if (!persona.audiences.length) msgs.push("核心目标人群");
        else if (persona.source === "template" && !persona.templateId) msgs.push("人群画像模板");
        if (text.length < 5) msgs.push("文案不能少于 5 字");
        else if (text.length > 500) msgs.push("文案不能超过 500 字");
        err.textContent = "请检查：" + msgs.join("、");
        firstInvalid.focus();
        return;
      }
      const item = clData.find(function(r) { return r.id === clEditingId; });
      if (!item) { clCloseEditModal(); return; }
      item.text = text;
      item.product = product;
      item.crowd = persona.audiences.join("、");
      const previousPersonaId = item.personaTemplateId || "";
      item.personaTemplateId = persona.templateId;
      item.personaSnapshot = persona;
      if (item.personaTemplateId && item.personaTemplateId !== previousPersonaId) {
        const persona = personaCatalog.find(entry => entry.id === item.personaTemplateId);
        if (persona) persona.usage += 1;
      }
      item.chars = text.length;
      item.updated = new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
      clCloseEditModal();
      clFilterAndRender();
      showToast("文案已更新");
    }

    // 弹窗事件绑定
    if (clEditModal) {
      clEditModal.addEventListener("click", function(e) {
        if (e.target === clEditModal) clCloseEditModal();
        if (e.target.closest("[data-cl-edit-product-picker]")) return openClEditProductPicker();
        const modeButton = e.target.closest("[data-cl-audience-mode]");
        if (modeButton) {
          clSetEditAudienceMode(modeButton.dataset.clAudienceMode, modeButton.dataset.clAudienceMode === "template");
          return;
        }
        if (e.target.closest("[data-cl-persona-trigger]")) clOpenEditPersonaTemplatePicker();
        const audienceButton = e.target.closest("[data-cl-audience]");
        if (audienceButton) audienceButton.classList.toggle("active");
        const genderButton = e.target.closest("[data-cl-gender]");
        if (genderButton) clSetEditSingleChoice("gender", genderButton.dataset.clGender);
        const ageButton = e.target.closest("[data-cl-age]");
        if (ageButton) {
          clSetEditSingleChoice("age", ageButton.dataset.clAge);
          clEditModal.querySelector("[data-cl-custom-age]").hidden = ageButton.dataset.clAge !== "custom";
        }
        const aiSuggest = e.target.closest("[data-cl-ai-suggest]");
        if (aiSuggest) clApplyEditAiSuggestion(aiSuggest.dataset.clAiSuggest);
      });
      document.querySelectorAll("[data-close-cl-edit]").forEach(function(b) { b.addEventListener("click", clCloseEditModal); });
      document.getElementById("clEditSave")?.addEventListener("click", clSaveEditModal);
      // 字数实时计数
      document.getElementById("clEditText")?.addEventListener("input", clUpdateEditCounter);
      // Esc 关闭 / Cmd+Enter 保存
      clEditModal.addEventListener("keydown", function(e) {
        if (e.key === "Escape") { e.preventDefault(); clCloseEditModal(); }
        else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); clSaveEditModal(); }
      });
    }

    // 文案查看弹窗事件绑定
    if (clViewModal) {
      clViewModal.addEventListener("click", function(e) {
        if (e.target === clViewModal) clCloseViewModal();
      });
      document.querySelectorAll("[data-close-cl-view]").forEach(function(b) { b.addEventListener("click", clCloseViewModal); });
      document.getElementById("clViewEditBtn")?.addEventListener("click", function() {
        if (!clViewingId) return;
        const id = clViewingId;
        clCloseViewModal();
        clEditText(id);
      });
      clViewModal.addEventListener("keydown", function(e) {
        if (e.key === "Escape") { e.preventDefault(); clCloseViewModal(); }
      });
    }

    function clCloseActionMenus() {
      document.querySelectorAll(".cl-ai-menu.show, .cl-more-menu.show").forEach(m => m.classList.remove("show"));
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

    function clToggleMoreMenu(e) {
      e.stopPropagation();
      const menu = e.target.closest(".cl-more-drop").querySelector(".cl-more-menu");
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
      const manual = clData.filter(function(r) { return r.source === "手工新增"; }).length;
      const video = clData.filter(function(r) { return r.source === "视频识别"; }).length;
      const el = document.getElementById("clHeadStats");
      if (el) el.textContent = '共 ' + clData.length + ' 条 · AI生成 ' + ai + ' · 手工新增 ' + manual + ' · 视频识别 ' + video;
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
    const clCreateModal = document.getElementById("clCreateModal");
    const clParseStatus = document.getElementById("clParseStatus");
    let clCreateSource = "manual";
    const clCreateTextState = {
      manual:{ text:"", parse:null },
      library:{ text:"", parse:null },
      upload:{ text:"", parse:null }
    };
    const clVideoCopyMap = {
      "7553983811703193643":"你以为床垫看着干净就够了吗？实际走一遍才知道，藏在纤维深处的细小灰尘根本不是换床单能解决的。轻净 Pro 除螨仪拍打和吸尘同步进行，透明尘杯里吸出了什么，清洁结果当场就能看见。床垫、沙发和布艺都能用，尘杯还能拆下来清洗。想看完整清洁过程，点进商品看实测。",
      "7553983811703197228":"下班回家不想守在厨房，就把食材放进轻享空气炸锅 A8。可视窗口能直接看到上色情况，不用反复开盖，家庭容量一次就能做够。炸篮用完可以拆洗，今晚直播间还有配套赠品，具体优惠以页面展示为准。"
    };
    const clVideoAudienceMap = {
      "7553983811703193643":{ audience:"精致妈妈", gender:"女性", age:"24–30", pain:"床垫深处灰尘难以日常清理\n孩子接触织物后容易敏感", scenes:"宝宝家庭的床垫日常清洁\n布艺沙发与毛绒玩具清洁" },
      "7553983811703197228":{ audience:"新锐白领", gender:"不限", age:"24–30", pain:"下班后做饭时间不足\n传统烹饪需要反复看守", scenes:"工作日晚餐快速制作\n周末家庭小食制作" }
    };
    const clCreateVideoFallback = [
      { id:"7553983811703193643", source:"finished", title:"除螨仪结果冲击型主视频", channel:"历史投放", product:"轻净 Pro 除螨仪", duration:"00:32", origin:"千川素材", status:"已分析", updated:"08-04 14:20", tags:["结果前置","清洁演示"], auxiliary:"素材 ID 7553983811703193643", transcript:clVideoCopyMap["7553983811703193643"] },
      { id:"7553983811703197228", source:"finished", title:"空气炸锅晚餐场景视频", channel:"历史投放", product:"轻享空气炸锅 A8", duration:"00:28", origin:"千川素材", status:"已分析", updated:"08-04 11:07", tags:["晚餐场景","效率卖点"], auxiliary:"素材 ID 7553983811703197228", transcript:clVideoCopyMap["7553983811703197228"] },
      { id:"ref-clean-001", source:"external", title:"床褥清洁结果型参考视频", channel:"抖音", product:"未关联产品", duration:"00:36", origin:"外部参考", status:"已分析", updated:"08-03 18:30", tags:["痛点冲突","结果证明"], auxiliary:"拆解版本 V3", transcript:"床褥表面看着干净，深层问题却常常被忽略。先解决核心问题，再展示实际清洁结果，整个过程更有说服力。" },
      { id:"ref-kitchen-002", source:"external", title:"一人食效率场景参考视频", channel:"抖音", product:"未关联产品", duration:"00:24", origin:"外部参考", status:"已分析", updated:"08-02 12:08", tags:["场景开场","节奏紧凑"], auxiliary:"拆解版本 V2", transcript:"下班回家时间有限，做饭最怕步骤复杂。用更简单的方式把晚餐安排好，日常才更轻松。" }
    ];

    function setClAudienceChoice(group, value) {
      const host = clCreateModal.querySelector(`[data-cl-choice-group="${group}"]`);
      if (!host) return;
      const matched = [...host.querySelectorAll(".cl-audience-chip")].find(button => button.dataset.value === value);
      host.querySelectorAll(".cl-audience-chip").forEach(button => button.classList.toggle("active", button === matched));
      if (group === "age") document.getElementById("clCustomAge")?.classList.toggle("show", value === "custom");
    }
    function getClAudienceChoice(group) {
      return clCreateModal.querySelector(`[data-cl-choice-group="${group}"] .cl-audience-chip.active`)?.dataset.value || "";
    }
    function resetClAudienceFields() {
      setClAudienceChoice("audience", "精致妈妈");
      setClAudienceChoice("gender", "不限");
      setClAudienceChoice("age", "24–30");
      document.getElementById("clAgeMin").value = "";
      document.getElementById("clAgeMax").value = "";
      document.getElementById("clCreatePain").value = "";
      document.getElementById("clCreateScenes").value = "";
    }

    function setClCreatePersonaMode(mode, openTemplatePicker = false) {
      const templateMode = mode === "template";
      clCreateModal.dataset.personaMode = mode;
      clCreateModal.querySelectorAll("[data-cl-create-persona-mode]").forEach(button => button.classList.toggle("active", button.dataset.clCreatePersonaMode === mode));
      clCreateModal.querySelector("[data-cl-create-template-select]").hidden = !templateMode;
      if (!templateMode) {
        delete clCreateModal.dataset.personaTemplateId;
        clCreateModal.querySelector("[data-cl-create-persona-selected]").textContent = "选择人群画像模板";
        window.CreationPersonaPicker?.close();
      } else if (openTemplatePicker) {
        openClCreatePersonaTemplatePicker();
      }
    }

    function setClCreatePersonaTemplate(id) {
      const persona = personaCatalog.find(item => item.id === id);
      const label = clCreateModal.querySelector("[data-cl-create-persona-selected]");
      if (!persona) {
        delete clCreateModal.dataset.personaTemplateId;
        label.textContent = "选择人群画像模板";
        return;
      }
      clCreateModal.dataset.personaTemplateId = persona.id;
      label.textContent = persona.name;
      setClAudienceChoice("audience", persona.audience || "");
      setClAudienceChoice("gender", persona.gender || "不限");
      const age = persona.age === "50+" ? "51+" : persona.age;
      const standard = [...clCreateModal.querySelectorAll('[data-cl-choice-group="age"] .cl-audience-chip')].some(button => button.dataset.value === age);
      setClAudienceChoice("age", standard ? age : "custom");
      if (!standard) {
        const [min, max] = String(persona.age || "").split(/[–-]/);
        document.getElementById("clAgeMin").value = min || "";
        document.getElementById("clAgeMax").value = max || "";
      }
      document.getElementById("clCreatePain").value = (persona.pain || []).join("\n");
      document.getElementById("clCreateScenes").value = (persona.scenes || []).join("\n");
    }

    function openClCreatePersonaTemplatePicker() {
      if (!window.CreationPersonaPicker) return showToast("人群模板选择器加载失败，请刷新页面后重试。");
      const product = productCatalog[document.getElementById("clCreateProduct").value]?.name || "";
      window.CreationPersonaPicker.open({
        items:personaCatalog,
        productName:product,
        selectedId:clCreateModal.dataset.personaTemplateId || "",
        onConfirm(persona) { setClCreatePersonaTemplate(persona?.id || ""); }
      });
    }

    function applyClCreateAiSuggestion(type) {
      const product = productCatalog[document.getElementById("clCreateProduct").value]?.name || "产品";
      const samples = type === "pain"
        ? [[`担心${product}实际效果不稳定`, "不想为日常问题反复花时间"], ["希望一次解决核心问题", "更在意使用过程是否省心"]]
        : [[`${product}的日常使用场景`, "需要快速处理问题的即时场景"], ["周末集中使用场景", "家人共同使用的生活场景"]];
      const key = type === "pain" ? "painSuggestionIndex" : "sceneSuggestionIndex";
      const index = Number(clCreateModal.dataset[key] || 0) % samples.length;
      document.getElementById(type === "pain" ? "clCreatePain" : "clCreateScenes").value = samples[index].join("\n");
      clCreateModal.dataset[key] = String(index + 1);
    }

    function getClCreateVideoItems() {
      const catalog = typeof readReferenceVideoCatalog === "function" ? readReferenceVideoCatalog() : [];
      const ids = new Set(catalog.map(item => item.id));
      return [...catalog, ...clCreateVideoFallback.filter(item => !ids.has(item.id))];
    }

    function setClCreateProduct(productId, product = productCatalog[productId]) {
      const input = document.getElementById("clCreateProduct");
      const label = clCreateModal.querySelector("[data-cl-create-product-label]");
      if (!input || !label) return;
      const currentPersona = personaCatalog.find(item => item.id === clCreateModal.dataset.personaTemplateId);
      if (currentPersona && personaProducts(currentPersona).length && !personaProducts(currentPersona).includes(product?.name || "")) {
        if (!window.confirm("切换产品将清空当前不适用的人群画像及其自动回填内容，是否继续？")) return false;
        setClCreatePersonaTemplate("");
        resetClAudienceFields();
        showToast("已清空不适用的人群画像，请按新产品重新选择");
      }
      input.value = productId || "";
      label.textContent = product?.name || "选择产品";
      label.classList.toggle("placeholder", !product?.name);
      return true;
    }

    function openClCreateProductPicker() {
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        items:Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId:document.getElementById("clCreateProduct").value,
        onConfirm(productId, product) {
          setClCreateProduct(productId, product);
        }
      });
    }

    function getClCreateTextState(source = clCreateSource) {
      return clCreateTextState[source] || (clCreateTextState[source] = { text:"", parse:null });
    }

    function storeClCreateText(source = clCreateSource) {
      const field = document.getElementById("clCreateText");
      if (field) getClCreateTextState(source).text = field.value;
    }

    function renderClCreateParseState(source = clCreateSource) {
      const state = getClCreateTextState(source);
      const parse = state.parse;
      if (!parse) {
        clParseStatus.hidden = true;
        clParseStatus.classList.remove("is-parsing");
        return;
      }
      clParseStatus.hidden = false;
      clParseStatus.classList.toggle("is-parsing", parse.status === "parsing");
      clParseStatus.querySelector("b").textContent = parse.status === "parsing" ? "" : "✓";
      clParseStatus.querySelector("span").textContent = parse.message;
    }

    function startClCreateParse(source, label, text) {
      const state = getClCreateTextState(source);
      const parseToken = `${Date.now()}-${Math.random()}`;
      state.text = "";
      state.parseToken = parseToken;
      state.parse = { status:"parsing", message:`正在解析“${label}”的口播文案…` };
      if (clCreateSource === source) {
        document.getElementById("clCreateText").value = "";
        renderClCreateParseState(source);
      }
      window.setTimeout(() => {
        if (state.parseToken !== parseToken) return;
        state.text = text;
        state.parse = { status:"done", message:`“${label}”口播识别完成，可继续修改后保存。` };
        if (clCreateSource === source) {
          document.getElementById("clCreateText").value = text;
          renderClCreateParseState(source);
        }
        showToast("视频口播识别完成");
      }, 700);
    }

    function applyClCreateVideo(video) {
      if (!video) return;
      const matchedProduct = Object.entries(productCatalog).find(([, product]) => product.name === video.product);
      if (matchedProduct) setClCreateProduct(matchedProduct[0], matchedProduct[1]);
      const audience = clVideoAudienceMap[video.id];
      if (audience) {
        setClAudienceChoice("audience", audience.audience);
        setClAudienceChoice("gender", audience.gender);
        setClAudienceChoice("age", audience.age);
        document.getElementById("clCreatePain").value = audience.pain;
        document.getElementById("clCreateScenes").value = audience.scenes;
      }
      setClCreatePersonaMode("manual");
      const trigger = clCreateModal.querySelector("[data-cl-create-video-trigger-text]");
      trigger.textContent = "重新选择视频";
      const selected = clCreateModal.querySelector("[data-cl-create-selected-video]");
      selected.hidden = false;
      selected.innerHTML = `<strong>${escapeHtml(video.title || "已选视频")}</strong><span>${escapeHtml(video.source === "external" ? "外部参考视频" : "成片视频")} · ${escapeHtml(video.channel || "—")} · ${escapeHtml(video.duration || "—")}</span>`;
      clCreateModal.dataset.selectedVideoId = video.id || "";
      const state = getClCreateTextState("library");
      state.videoId = video.id || "";
      startClCreateParse("library", video.title || "已选视频", video.transcript || clVideoCopyMap[video.id] || "该视频已完成口播解析，请根据识别结果补充或调整文案内容。");
    }

    function openClCreateVideoPicker() {
      if (!window.CreationVideoPicker) return showToast("视频选择器加载失败，请刷新页面后重试。");
      window.CreationVideoPicker.open({
        items:getClCreateVideoItems(),
        selectedId:clCreateModal.dataset.selectedVideoId || "",
        onConfirm(video) { applyClCreateVideo(video); }
      });
    }

    function setClCreateSource(source, openVideoPicker = false) {
      storeClCreateText(clCreateSource);
      clCreateSource = source;
      clCreateModal.querySelectorAll("[data-cl-create-source]").forEach(button => button.classList.toggle("active", button.dataset.clCreateSource === source));
      clCreateModal.querySelectorAll("[data-cl-create-panel]").forEach(panel => { panel.hidden = panel.dataset.clCreatePanel !== source; });
      document.getElementById("clCreateText").value = getClCreateTextState(source).text;
      renderClCreateParseState(source);
      if (source === "library" && openVideoPicker) openClCreateVideoPicker();
    }

    function openClCreateModal() {
      clCreateModal.querySelectorAll("input:not([type=file]), textarea").forEach(field => { field.value = ""; });
      Object.keys(clCreateTextState).forEach(source => { clCreateTextState[source] = { text:"", parse:null }; });
      document.getElementById("clVideoUploadInput").value = "";
      setClCreateProduct("");
      delete clCreateModal.dataset.selectedVideoId;
      const videoTrigger = clCreateModal.querySelector("[data-cl-create-video-trigger-text]");
      if (videoTrigger) videoTrigger.textContent = "从视频库选择";
      const selectedVideo = clCreateModal.querySelector("[data-cl-create-selected-video]");
      if (selectedVideo) { selectedVideo.hidden = true; selectedVideo.innerHTML = ""; }
      renderClCreateParseState("manual");
      resetClAudienceFields();
      setClCreatePersonaMode("manual");
      setClCreateSource("manual");
      clCreateModal.classList.add("show");
      setTimeout(() => {
        const body = clCreateModal.querySelector(".modal-body");
        if (body) body.scrollTop = 0;
        clCreateModal.querySelector("[data-cl-create-product-picker]")?.focus();
      }, 0);
    }

    document.getElementById("clCreateBtn")?.addEventListener("click", openClCreateModal);
    document.querySelectorAll("[data-close-cl-create]").forEach(button => button.addEventListener("click", () => clCreateModal.classList.remove("show")));
    clCreateModal?.addEventListener("click", event => {
      if (event.target === clCreateModal) return clCreateModal.classList.remove("show");
      const source = event.target.closest("[data-cl-create-source]");
      if (source) return setClCreateSource(source.dataset.clCreateSource, source.dataset.clCreateSource === "library" && !clCreateModal.dataset.selectedVideoId);
      if (event.target.closest("[data-cl-create-video-picker]")) return openClCreateVideoPicker();
      if (event.target.closest("[data-cl-create-product-picker]")) return openClCreateProductPicker();
      const personaMode = event.target.closest("[data-cl-create-persona-mode]");
      if (personaMode) return setClCreatePersonaMode(personaMode.dataset.clCreatePersonaMode, personaMode.dataset.clCreatePersonaMode === "template");
      if (event.target.closest("[data-cl-create-persona-trigger]")) return openClCreatePersonaTemplatePicker();
      const aiSuggest = event.target.closest("[data-cl-create-ai-suggest]");
      if (aiSuggest) return applyClCreateAiSuggestion(aiSuggest.dataset.clCreateAiSuggest);
      const choice = event.target.closest(".cl-audience-chip");
      if (choice) {
        const group = choice.closest("[data-cl-choice-group]")?.dataset.clChoiceGroup;
        if (group) setClAudienceChoice(group, choice.dataset.value);
        return;
      }
    });
    document.getElementById("clVideoUploadTrigger")?.addEventListener("click", () => document.getElementById("clVideoUploadInput").click());
    document.getElementById("clVideoUploadInput")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      startClCreateParse("upload", file.name, "先别只看表面，真正影响使用体验的是核心问题有没有被解决。这个产品通过实际操作完成主要处理，并把结果直接展示出来；日常使用步骤更少，后续整理也更方便。想看完整使用过程，可以继续查看产品演示。");
    });
    copyStructureDetailModal?.addEventListener("click", event => {
      const tab = event.target.closest("[data-copy-detail-tab]");
      if (tab) {
        copyStructureDetailModal.querySelectorAll("[data-copy-detail-tab]").forEach(button => button.classList.toggle("active", button === tab));
        copyStructureDetailModal.querySelectorAll("[data-copy-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.copyDetailPanel === tab.dataset.copyDetailTab));
        return;
      }
      const toggle = event.target.closest("[data-copy-stage-toggle]");
      if (toggle) return toggle.closest("[data-copy-stage-card]").classList.toggle("expanded");
      if (event.target.closest("[data-copy-stage-copy]")) {
        const text = event.target.closest("[data-copy-stage-card]").querySelector(".copy-stage-talk p")?.textContent || "";
        navigator.clipboard?.writeText(text);
        return showToast("可复用话术已复制");
      }
      const jump = event.target.closest("[data-copy-jump-source]");
      if (jump) showToast(`已定位参考成品的第 ${Number(jump.dataset.copyJumpSource) + 1} 个结构阶段`);
    });
    document.getElementById("clCreateText")?.addEventListener("input", event => {
      getClCreateTextState().text = event.target.value;
    });
    document.getElementById("clCreateSave")?.addEventListener("click", () => {
      const productId = document.getElementById("clCreateProduct").value;
      const product = productCatalog[productId]?.name || "";
      const audience = getClAudienceChoice("audience");
      const gender = getClAudienceChoice("gender");
      let age = getClAudienceChoice("age");
      if (age === "custom") {
        const min = Number(document.getElementById("clAgeMin").value);
        const max = Number(document.getElementById("clAgeMax").value);
        if (!min || !max || min > max) return showToast("请填写正确的自定义年龄区间");
        age = `${min}–${max}`;
      }
      const crowd = `${audience} / ${gender} / ${age}`;
      const pain = document.getElementById("clCreatePain").value.trim();
      const scenes = document.getElementById("clCreateScenes").value.trim();
      const text = document.getElementById("clCreateText").value.trim();
      if (getClCreateTextState().parse?.status === "parsing") return showToast("视频口播正在解析，请完成后再保存");
      if (!productId) return showToast("请选择关联产品");
      if (!audience || !gender || !age) return showToast("请完整选择目标人群、性别和年龄");
      if (clCreateModal.dataset.personaMode === "template" && !clCreateModal.dataset.personaTemplateId) return showToast("请从模板库选择人群画像");
      if (!text) return showToast("请填写或识别文案内容");
      const chars = text.replace(/\s/g, "").length;
      const now = new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-");
      const personaSnapshot = { source:clCreateModal.dataset.personaMode || "manual", templateId:clCreateModal.dataset.personaTemplateId || "", audiences:[audience], gender, age, pain:pain.split("\n").map(value => value.trim()).filter(Boolean), scenes:scenes.split("\n").map(value => value.trim()).filter(Boolean) };
      if (personaSnapshot.templateId) {
        const persona = personaCatalog.find(item => item.id === personaSnapshot.templateId);
        if (persona) persona.usage += 1;
      }
      clData.unshift({ id:`cl-${Date.now()}`, text, product, crowd, pain, scenes, personaTemplateId:personaSnapshot.templateId, personaSnapshot, structure:[{t:"hook",l:"钩子"},{t:"sell",l:"卖点"},{t:"cta",l:"行动引导"}], chars, duration:Math.max(1,Math.round(chars/4)), updated:now, source:clCreateSource === "manual" ? "手工新增" : "视频识别" });
      clCreateModal.classList.remove("show");
      document.getElementById("clSourceFilter").value = "all";
      document.getElementById("clSearchInput").value = "";
      clFilterAndRender();
      clUpdateHeadStats();
      showToast("文案已新增并保存到文案库");
    });

    /* ===== 组织权限与公共事实库增强（原型交互） ===== */
    (() => {
      const permissionModules = [
        { name:"AI创作", actions:["查看", "发起创作", "保存资产", "删除会话"] },
        { name:"品牌库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"产品库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"文案库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"模板库", actions:["查看", "新增", "编辑", "删除"] },
        { name:"系统管理", actions:["查看成员权限", "配置角色", "同步钉钉人员"] }
      ];
      const roles = {
        admin:{ name:"管理员", desc:"拥有当前团队全部菜单和按钮权限", permissions:{} },
        creator:{ name:"运营／创作成员", desc:"可创作并维护业务资产，不可管理系统权限", permissions:{} },
        viewer:{ name:"只读成员", desc:"仅可查看授权范围内的菜单与资产", permissions:{} }
      };
      permissionModules.forEach(module => module.actions.forEach(action => {
        const key = `${module.name}:${action}`;
        roles.admin.permissions[key] = true;
        roles.creator.permissions[key] = module.name !== "系统管理" && !["删除"].includes(action);
        roles.viewer.permissions[key] = action === "查看";
      }));
      const members = [
        { name:"嗡大发", dept:"抖音三区", role:"admin", scope:"all", status:"在职" },
        { name:"林运营", dept:"内容运营·小家电组", role:"creator", scope:"team", status:"在职" },
        { name:"王剪辑", dept:"视频中心·混剪组", role:"creator", scope:"personal", status:"在职" },
        { name:"陈观察", dept:"经营分析组", role:"viewer", scope:"team", status:"在职" }
      ];
      let activeRole = "admin";
      const roleList = document.getElementById("permissionRoleList");
      const tree = document.getElementById("permissionTree");
      const memberRows = document.getElementById("permissionMemberRows");
      const roleTitle = document.getElementById("permissionRoleTitle");
      const roleDesc = document.getElementById("permissionRoleDesc");

      function renderPermissionTree() {
        if (!tree || !roles[activeRole]) return;
        tree.innerHTML = permissionModules.map(module => `<section class="permission-tree-group"><div class="permission-tree-head"><strong>${module.name}</strong><label><input type="checkbox" data-module-all="${module.name}"> 全选</label></div><div class="permission-actions">${module.actions.map(action => { const key = `${module.name}:${action}`; return `<label><input type="checkbox" data-permission-key="${key}" ${roles[activeRole].permissions[key] ? "checked" : ""}> ${action}</label>`; }).join("")}</div></section>`).join("");
        tree.querySelectorAll("[data-module-all]").forEach(box => {
          const children = [...tree.querySelectorAll(`[data-permission-key^="${box.dataset.moduleAll}:"]`)];
          box.checked = children.every(child => child.checked);
          box.indeterminate = !box.checked && children.some(child => child.checked);
        });
      }
      function renderMembers() {
        if (!memberRows) return;
        memberRows.innerHTML = members.map((member, index) => `<tr><td><strong>${member.name}</strong></td><td>${member.dept}</td><td><select data-member-role="${index}">${Object.entries(roles).map(([key, role]) => `<option value="${key}" ${member.role === key ? "selected" : ""}>${role.name}</option>`).join("")}</select></td><td><select data-member-scope="${index}"><option value="personal" ${member.scope === "personal" ? "selected" : ""}>仅个人</option><option value="team" ${member.scope === "team" ? "selected" : ""}>个人及团队</option><option value="all" ${member.scope === "all" ? "selected" : ""}>当前公司全部</option></select></td><td><span class="badge green">${member.status}</span></td></tr>`).join("");
      }
      function selectRole(key) {
        if (!roles[key]) return;
        activeRole = key;
        roleList?.querySelectorAll("[data-permission-role]").forEach(button => button.classList.toggle("active", button.dataset.permissionRole === key));
        roleTitle.textContent = roles[key].name;
        roleDesc.textContent = roles[key].desc;
        renderPermissionTree();
      }
      roleList?.addEventListener("click", event => {
        const role = event.target.closest("[data-permission-role]");
        if (role) selectRole(role.dataset.permissionRole);
      });
      tree?.addEventListener("change", event => {
        const box = event.target;
        if (box.matches("[data-permission-key]")) roles[activeRole].permissions[box.dataset.permissionKey] = box.checked;
        if (box.matches("[data-module-all]")) {
          tree.querySelectorAll(`[data-permission-key^="${box.dataset.moduleAll}:"]`).forEach(child => { child.checked = box.checked; roles[activeRole].permissions[child.dataset.permissionKey] = box.checked; });
        }
        renderPermissionTree();
        showToast("角色权限已保存");
      });
      memberRows?.addEventListener("change", event => {
        const roleSelect = event.target.closest("[data-member-role]");
        const scopeSelect = event.target.closest("[data-member-scope]");
        if (roleSelect) members[Number(roleSelect.dataset.memberRole)].role = roleSelect.value;
        if (scopeSelect) members[Number(scopeSelect.dataset.memberScope)].scope = scopeSelect.value;
        showToast("成员权限已更新");
      });
      document.getElementById("syncDingMembers")?.addEventListener("click", event => {
        const button = event.currentTarget;
        button.disabled = true; button.textContent = "同步中…";
        setTimeout(() => { button.disabled = false; button.textContent = "同步钉钉人员"; renderMembers(); showToast("已同步 4 名在职成员，未发现组织变更"); }, 900);
      });

      const roleModal = document.createElement("div");
      roleModal.className = "modal-backdrop";
      roleModal.innerHTML = `<div class="modal" style="max-width:520px"><div class="modal-head"><div><span class="badge">成员权限</span><h3>新建角色</h3></div><button class="close-btn" type="button" data-close-new-role>×</button></div><div class="modal-body"><div class="field"><label>角色名称<span class="required-mark">*</span></label><input data-new-role-name placeholder="例如：高级运营"></div><div class="field"><label>角色说明</label><textarea data-new-role-desc placeholder="说明该角色负责的业务范围"></textarea></div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-close-new-role>取消</button><button class="primary-btn" type="button" data-save-new-role>创建角色</button></div></div>`;
      document.body.append(roleModal);
      document.getElementById("newPermissionRole")?.addEventListener("click", () => { roleModal.classList.add("show"); roleModal.querySelector("[data-new-role-name]").focus(); });
      roleModal.addEventListener("click", event => {
        if (event.target === roleModal || event.target.closest("[data-close-new-role]")) return roleModal.classList.remove("show");
        if (!event.target.closest("[data-save-new-role]")) return;
        const name = roleModal.querySelector("[data-new-role-name]").value.trim();
        if (!name) return showToast("请输入角色名称");
        if (Object.values(roles).some(role => role.name === name)) return showToast("角色名称已存在");
        const key = `role-${Date.now()}`;
        roles[key] = { name, desc:roleModal.querySelector("[data-new-role-desc]").value.trim() || "自定义业务角色", permissions:{} };
        permissionModules.forEach(module => module.actions.forEach(action => roles[key].permissions[`${module.name}:${action}`] = false));
        const button = document.createElement("button"); button.type="button"; button.className="permission-role"; button.dataset.permissionRole=key; button.textContent=name; roleList.append(button);
        roleModal.classList.remove("show"); selectRole(key); renderMembers(); showToast(`角色“${name}”已创建`);
      });
      selectRole(activeRole); renderMembers();

      function renderBrandRelations() {
        const container = document.getElementById("brandRelatedProducts");
        const count = document.getElementById("brandRelatedCount");
        if (!container || !brandCatalog[currentBrandId]) return;
        const brandName = brandCatalog[currentBrandId].name;
        const products = Object.entries(productDetailData).filter(([, product]) => product.brand === brandName);
        if (count) count.textContent = `${products.length} 个产品`;
        container.innerHTML = products.length ? products.map(([id, product]) => `<button type="button" class="brand-related-product" data-brand-related-product="${id}"><span class="brand-related-thumb"></span><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category || "未分类")} · ${escapeHtml(product.price || "价格待补充")}</small></span><b>查看详情 ›</b></button>`).join("") : `<div class="empty-state"><strong>暂无关联产品</strong><span>在产品库为产品选择该品牌后，将自动显示在这里。</span></div>`;
      }
      function syncBrandCardCounts() {
        brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => {
          const brand = brandCatalog[card.dataset.brandId];
          if (!brand) return;
          const total = Object.values(productDetailData).filter(product => product.brand === brand.name).length;
          const countNode = card.querySelector(".brand-card-foot span:first-child");
          if (countNode) countNode.textContent = `关联产品 ${total}`;
        });
      }
      window.syncBrandCardCounts = syncBrandCardCounts;
      brandGrid?.addEventListener("click", event => { if (event.target.closest("[data-brand-id]") && !event.target.closest("[data-toggle-card-menu],[data-delete-brand]")) setTimeout(renderBrandRelations, 0); }, true);
      document.getElementById("brandRelatedProducts")?.addEventListener("click", event => { const target = event.target.closest("[data-brand-related-product]"); if (target) openProductDetail(target.dataset.brandRelatedProduct); });
      syncBrandCardCounts();
    })();
  

    function setFormFeedback(message, type = "success") {
      formFeedback.hidden = !message;
      formFeedback.className = `inline-feedback ${type}`;
      formFeedback.innerHTML = message ? `<strong>${type === "error" ? "请检查" : "已完成"}</strong><span>${message}</span>` : "";
    }

    function currentProduct() {
      return productCatalog[creationContext.productId] || {
        name: creationContext.productName || "未选择产品",
        core: creationContext.originalFields.core || "",
        secondary: creationContext.originalFields.secondary || "",
        difference: creationContext.originalFields.difference || "",
        audiences: [],
        psychology: ["风险规避", "理性求证"],
        facts: "产品信息待确认"
      };
    }

    function isStructuredCopyFlow(type = activeType) {
      return type === "original" || type === "copy" || type === "rewrite";
    }

    function updateModalContext() {
      saveProductButton.hidden = !isStructuredCopyFlow() || creationContext.productSaved;
      if (isStructuredCopyFlow()) {
        saveProductButton.textContent = "保存产品";
        saveProductButton.disabled = false;
      }
      contextStatus.hidden = !activeType || activeType === "script";
      contextStatus.textContent = creationContext.productConfirmed ? `已带入：${currentProduct().name}` : "未选择产品";
    }

    function syncCreationProductControl(productId = "", productName = "") {
      dynamicForm.querySelectorAll("[data-product-select]").forEach(control => { control.value = productId; });
      dynamicForm.querySelectorAll("[data-product-picker-label]").forEach(label => {
        label.textContent = productName || "选择产品";
        label.classList.toggle("placeholder", !productName);
      });
    }

    // 产品库选中时锁定"产品名称/品牌/类目"三件套,避免用户改写与产品库数据冲突;
    // 切换到商品链接 / 手工输入时解锁。
    function setLibraryProductFieldLock(locked) {
      const selectors = ["[data-original-product-name]", "[data-original-brand]", "[data-original-category]"];
      selectors.forEach(selector => {
        const field = dynamicForm?.querySelector(selector);
        if (!field) return;
        field.readOnly = locked;
        field.classList.toggle("is-locked", locked);
        field.title = locked ? "已绑定产品库,不可修改;如需调整请切到商品链接或手工输入" : "";
      });
    }

    function clearLibraryProductFields() {
      creationContext.productId = "";
      creationContext.productName = "";
      creationContext.productConfirmed = false;
      creationContext.productSaved = true;
      const clear = selector => {
        const field = dynamicForm.querySelector(selector);
        if (field) field.value = "";
      };
      setLibraryProductFieldLock(false);
      clear("[data-original-product-name]");
      clear("[data-original-brand]");
      clear("[data-original-category]");
      ["core", "secondary", "difference", "trust"].forEach(key => setPointEditorValues(key, [""]));
      ["marketing", "pain", "scenes"].forEach(key => clear(`[data-field="${key}"]`));
      dynamicForm.querySelectorAll(".audience-chip").forEach(chip => chip.classList.remove("active"));
      const factHint = dynamicForm.querySelector("[data-product-fact-hint]");
      if (factHint) factHint.textContent = "选择产品后读取产品事实、关联资产和禁用表达";
      syncCreationProductControl();
    }

    function clearOriginalProductFields(source) {
      creationContext.productId = source === "link" ? "pending-link" : "manual-product";
      creationContext.productName = "";
      const clear = selector => {
        const field = dynamicForm.querySelector(selector);
        if (field) field.value = "";
      };
      clear("[data-original-product-name]");
      clear("[data-original-brand]");
      clear("[data-original-category]");
      ["core", "secondary", "difference", "trust"].forEach(key => setPointEditorValues(key, [""]));
      ["marketing", "pain", "scenes"].forEach(key => clear(`[data-field="${key}"]`));
      dynamicForm.querySelectorAll(".audience-chip").forEach(chip => chip.classList.remove("active"));
    }

    function setProductSource(source) {
      creationContext.productSource = source;
      dynamicForm.querySelectorAll("[data-product-source]").forEach(button => {
        button.classList.toggle("active", button.dataset.productSource === source);
      });
      dynamicForm.querySelectorAll("[data-product-source-panel]").forEach(panel => {
        panel.hidden = panel.dataset.productSourcePanel !== source;
      });
      const sourceInline = dynamicForm.querySelector(".product-source-inline");
      if (sourceInline) sourceInline.hidden = source !== "link";
      if (source === "library") {
        const selectedId = creationContext.productId;
        if (selectedId && productCatalog[selectedId]) applyProductToForm(selectedId);
        else clearLibraryProductFields();
      } else {
        clearOriginalProductFields(source);
        creationContext.productConfirmed = false;
        creationContext.productSaved = false;
        // 切到商品链接 / 手工输入,解锁三件套让用户重新填写
        setLibraryProductFieldLock(false);
      }
      updateModalContext();
      setFormFeedback("");
    }

    function setActiveAudience(audiences = []) {
      const audienceMap = { "宝妈家庭": "精致妈妈", "养宠家庭": "新锐白领", "精致生活人群": "资深中产", "租房人群": "小镇青年" };
      const normalized = audiences.map(item => audienceMap[item] || item);
      dynamicForm.querySelectorAll(".audience-chip").forEach(chip => {
        chip.classList.toggle("active", normalized.includes(chip.textContent.trim()));
      });
    }

    function clearIncompatiblePersonaTemplates(nextProductName) {
      const pickers = [...dynamicForm.querySelectorAll('[data-persona-picker][data-persona-mode="template"]')];
      const incompatible = pickers.filter(picker => {
        const persona = personaCatalog.find(item => item.id === picker.dataset.personaId);
        return persona && personaProducts(persona).length && !personaProducts(persona).includes(nextProductName);
      });
      if (!incompatible.length) return true;
      if (!window.confirm("切换产品将清空当前不适用的人群画像及其自动回填内容，是否继续？")) return false;
      incompatible.forEach(picker => clearPersonaPicker(picker, false));
      showToast("已清空不适用的人群画像，请按新产品重新选择");
      return true;
    }

    function applyProductToForm(productId, announce = false, revealAdvanced = false) {
      if (!productCatalog[productId]) return false;
      const nextProduct = productCatalog[productId];
      if (!clearIncompatiblePersonaTemplates(nextProduct.name)) return false;
      creationContext.productId = productId;
      creationContext.productName = nextProduct.name;
      creationContext.productConfirmed = true;
      creationContext.productSaved = true;
      const product = nextProduct;
      const nameInput = dynamicForm.querySelector("[data-original-product-name]");
      if (nameInput) nameInput.value = product.name;
      const brand = dynamicForm.querySelector("[data-original-brand]");
      const category = dynamicForm.querySelector("[data-original-category]");
      const productMeta = product.brand && product.category ? [product.brand, product.category] : ({
        "mite-pro": ["轻净", "清洁电器"],
        "air-a8": ["轻净", "厨房电器"],
        "washer-s5": ["净界", "清洁电器"]
      }[productId] || ["轻净", "清洁电器"]);
      if (brand) brand.value = productMeta[0];
      if (category) category.value = productMeta[1];
      syncCreationProductControl(productId, product.name);
      const fieldMap = { core: product.core, secondary: product.secondary, difference: product.difference };
      Object.entries(fieldMap).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = value;
        if (key === "core" || key === "secondary" || key === "difference") setPointEditorValues(key, String(value || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      const factHint = dynamicForm.querySelector("[data-product-fact-hint]");
      if (factHint) factHint.textContent = product.facts;
      const primary = dynamicForm.querySelector('[data-field="primaryPsychology"]');
      const secondary = dynamicForm.querySelector('[data-field="secondaryPsychology"]');
      if (primary) primary.value = product.psychology[0];
      if (secondary) secondary.value = product.psychology[1] || "不选择";
      const reason = dynamicForm.querySelector("[data-psychology-reason] span");
      if (reason) reason.textContent = `${product.name}的购买决策更受“${product.psychology[0]}”驱动，并需要“${product.psychology[1] || "产品价值"}”降低决策成本。`;
      dynamicForm.querySelectorAll(".material-summary strong").forEach(label => {
        label.textContent = `${product.name} · 已绑定素材`;
      });
      if (revealAdvanced && isStructuredCopyFlow()) {
        setOriginalAdvanced(true);
        creationContext.originalFields.advancedOpen = true;
      }
      if (activeType === "rewrite") refreshRewriteSetting();
      updateModalContext();
      // 产品库场景下,产品名称 / 品牌 / 类目 锁死,避免与产品库数据冲突
      if (creationContext.productSource === "library") setLibraryProductFieldLock(true);
      if (announce) setFormFeedback(`已切换至“${product.name}”，并重新带入卖点、人群建议和禁用词。`);
    }

    function copyStructureSourceLabel(source) {
      if (source === "qianchuan" || source === "千川学习") return "千川学习";
      if (source === "reference" || source === "参考视频提炼") return "参考视频提炼";
      if (source === "custom" || source === "自建") return "自建";
      return "自建";
    }
    // 当前脚本类型仅作为 AI 自动匹配结构的上下文；手动选择始终优先。
    let activeScriptType = "不限";
    let pendingCopyStructureId = "";
    function copyStructureAutoHint() {
      return activeScriptType === "不限"
        ? "不指定结构时，AI 会结合产品信息自动匹配。"
        : `不指定结构时，AI 会结合产品信息与「${activeScriptType}」自动匹配。`;
    }

    // 脚本类型变更只更新 AI 匹配提示，不覆盖用户手动选择的结构。
    function syncCopyStructureByScriptType(scriptType) {
      activeScriptType = scriptType || "不限";
      if (dynamicForm.querySelector("[data-copy-structure-value]")?.value) return;
      const label = dynamicForm.querySelector("[data-copy-structure-label]");
      const formula = dynamicForm.querySelector("[data-copy-structure-formula]");
      const source = dynamicForm.querySelector("[data-copy-structure-source]");
      if (label) label.textContent = "不选择（AI 自动匹配）";
      if (formula) formula.textContent = copyStructureAutoHint();
      if (source) source.textContent = "AI 自动匹配";
    }

    function setCopyStructureSelection(id = "") {
      const item = findContentStructure(id);
      if (id && !item) {
        pendingCopyStructureId = id;
        requestMixTemplateStructureCatalog();
        return;
      }
      pendingCopyStructureId = "";
      const value = dynamicForm.querySelector("[data-copy-structure-value]");
      const label = dynamicForm.querySelector("[data-copy-structure-label]");
      const formula = dynamicForm.querySelector("[data-copy-structure-formula]");
      const source = dynamicForm.querySelector("[data-copy-structure-source]");
      if (value) value.value = item?.id || "";
      if (label) label.textContent = item?.name || "不选择（AI 自动匹配）";
      if (formula) formula.textContent = item?.formula || copyStructureAutoHint();
      if (source) source.textContent = item ? copyStructureSourceLabel(item.source) : "AI 自动匹配";
      creationContext.originalFields.copyStructureId = item?.id || "";
      creationContext.originalFields.copyStructure = item?.name || "AI 自动匹配";
    }

    function captureOriginalContext() {
      if (!isStructuredCopyFlow()) return;
      dynamicForm.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      dynamicForm.querySelectorAll("[data-field]").forEach(field => {
        creationContext.originalFields[field.dataset.field] = field.value;
      });
      creationContext.productName = dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || creationContext.productName;
      creationContext.originalFields.brand = dynamicForm.querySelector("[data-original-brand]")?.value || "";
      creationContext.originalFields.category = dynamicForm.querySelector("[data-original-category]")?.value || "";
      creationContext.originalFields.wordCount = dynamicForm.querySelector("[data-word-count]")?.value || "300";
      creationContext.originalFields.generationCount = dynamicForm.querySelector("[data-generation-count]")?.value || "3";
      creationContext.originalFields.marketingScene = dynamicForm.querySelector('[data-role="marketing-scene"] .choice-chip.active')?.textContent.trim() || "直播间引流";
      const selectedStructureId = dynamicForm.querySelector("[data-copy-structure-value]")?.value || "";
      const selectedStructure = findContentStructure(selectedStructureId);
      creationContext.originalFields.copyStructureId = selectedStructureId;
      creationContext.originalFields.copyStructure = selectedStructure?.name || "不限";
      creationContext.originalFields.scriptType = dynamicForm.querySelector('[data-role="script-type"] .choice-chip.active')?.textContent.trim() || "不限";
      creationContext.originalFields.gender = dynamicForm.querySelector('[data-role="gender"] .choice-chip.active')?.textContent.trim() || "";
      const selectedAge = dynamicForm.querySelector('[data-role="age"] .choice-chip.active')?.textContent.trim() || "";
      creationContext.originalFields.age = selectedAge === "自定义"
        ? `${dynamicForm.querySelector("[data-age-min]")?.value || 18}–${dynamicForm.querySelector("[data-age-max]")?.value || 35}`
        : selectedAge;
      creationContext.originalFields.audiences = [...dynamicForm.querySelectorAll(".audience-chip.active")].map(item => item.textContent.trim());
      if (activeType === "rewrite") {
        creationContext.originalFields.rewriteMethod = dynamicForm.querySelector('[data-single="rewrite-method"] .choice-chip.active')?.dataset.rewriteMethod || "hook";
        creationContext.originalFields.rewriteSource = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
      }
      creationContext.originalFields.advancedOpen = dynamicForm.querySelector("[data-action='toggle-original-advanced']")?.classList.contains("active") || false;
    }

    function hydrateOriginalContext() {
      if (!isStructuredCopyFlow()) return;
      const contextProductId = creationContext.productId;
      setProductSource(creationContext.productSource || "library");
      if (productCatalog[contextProductId]) applyProductToForm(contextProductId);
      const fields = creationContext.originalFields;
      const manualName = dynamicForm.querySelector("[data-manual-product-name]");
      if (manualName) manualName.value = creationContext.productName || "";
      Object.entries(fields).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field && typeof value === "string") field.value = value;
        if ((key === "core" || key === "secondary" || key === "difference" || key === "trust") && typeof value === "string") setPointEditorValues(key, value.split("\n").filter(Boolean));
      });
      const wordCount = dynamicForm.querySelector("[data-word-count]");
      if (wordCount && fields.wordCount) wordCount.value = fields.wordCount;
      const generationCount = dynamicForm.querySelector("[data-generation-count]");
      if (generationCount && fields.generationCount) generationCount.value = fields.generationCount;
      ["marketingScene", "scriptType", "gender", "age"].forEach(key => {
        const role = { marketingScene:"marketing-scene", scriptType:"script-type", gender:"gender", age:"age" }[key];
        if (!fields[key]) return;
        dynamicForm.querySelectorAll(`[data-role="${role}"] .choice-chip`).forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === fields[key]));
      });
      if (fields.age && /^\d+[–-]\d+$/.test(fields.age)) {
        const [min, max] = fields.age.split(/[–-]/);
        dynamicForm.querySelectorAll('[data-role="age"] .choice-chip').forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === "自定义"));
        const customAge = dynamicForm.querySelector("[data-custom-age]");
        if (customAge) customAge.hidden = false;
        const minInput = dynamicForm.querySelector("[data-age-min]");
        const maxInput = dynamicForm.querySelector("[data-age-max]");
        if (minInput) minInput.value = min;
        if (maxInput) maxInput.value = max;
      }
      if (Array.isArray(fields.audiences)) setActiveAudience(fields.audiences);
      if (activeType === "rewrite" && fields.rewriteMethod) {
        dynamicForm.querySelectorAll('[data-single="rewrite-method"] .choice-chip').forEach(chip => chip.classList.toggle("active", chip.dataset.rewriteMethod === fields.rewriteMethod));
        refreshRewriteSetting();
        const target = dynamicForm.querySelector('[data-field="rewriteTarget"]');
        if (target && fields.rewriteTarget) target.value = fields.rewriteTarget;
      }
      if (activeType === "rewrite" && fields.rewriteSource) {
        const source = dynamicForm.querySelector("[data-rewrite-source]");
        if (source) source.value = fields.rewriteSource;
        rewriteSourceState[fields.rewriteSource] = fields.sourceCopy || rewriteSourceState[fields.rewriteSource] || "";
        refreshRewriteSource(true);
      }
      if (fields.brand) dynamicForm.querySelector("[data-original-brand]").value = fields.brand;
      if (fields.category) dynamicForm.querySelector("[data-original-category]").value = fields.category;
      if (dynamicForm.querySelector("[data-copy-structure-combobox]")) {
        activeScriptType = fields.scriptType || "不限";
        syncCopyStructureByScriptType(activeScriptType);
        if (fields.copyStructureId) setCopyStructureSelection(fields.copyStructureId);
      }
      setOriginalAdvanced(Boolean(fields.advancedOpen));
      refreshWordDuration();
    }

    function recognizeLinkedProduct() {
      const linkInput = dynamicForm.querySelector("[data-product-link]");
      const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
      const link = linkInput?.value.trim() || "";
      if (!link) {
        feedback.hidden = false;
        feedback.className = "parse-state failed";
        feedback.innerHTML = "<strong>解析失败</strong><span>请先粘贴有效的商品链接。</span>";
        linkInput.focus();
        return;
      }
      feedback.hidden = false;
      feedback.className = "parse-state parsing";
      feedback.innerHTML = "<strong>正在解析</strong><span>正在识别商品名称、品牌、类目和卖点…</span>";
      const parseButton = dynamicForm.querySelector('[data-action="recognize-product"]');
      if (parseButton) { parseButton.disabled = true; parseButton.textContent = "解析中"; }
      creationContext.productConfirmed = false;
      setTimeout(() => {
        if (parseButton) { parseButton.disabled = false; parseButton.textContent = "解析商品"; }
        if (link.toLowerCase().includes("fail")) {
          feedback.className = "parse-state failed";
          feedback.innerHTML = '<strong>解析失败</strong><span>链接暂时无法访问，请检查后重试。</span><button type="button" data-action="recognize-product">重试</button>';
          return;
        }
        const existing = Object.values(productDetailData || {}).find(item => item.link && item.link === link);
        if (existing) {
          feedback.className = "parse-state failed";
          feedback.innerHTML = `<strong>产品已存在</strong><span>该链接已关联“${escapeHtml(existing.name)}”，请直接从产品库选择。</span><button type="button" data-use-existing-product="${escapeHtml(existing.id || "mite-pro")}">使用已有产品</button>`;
          return;
        }
      const recognizedId = "linked-mite-x1";
      productCatalog[recognizedId] = {
        name: "轻净 X1 无线除螨仪",
        brand: "轻净",
        category: "清洁电器",
        core: "无线轻量机身，拍打与吸尘同步完成",
        secondary: "双尘杯分离设计，支持拆卸清理",
        difference: "摆脱电源线限制，床垫和沙发切换更方便",
        audiences: ["宝妈家庭", "养宠家庭", "租房人群"],
        psychology: ["省时省力", "理性求证"],
        facts: "AI识别 16 项产品信息，其中 3 项需人工确认"
      };
      creationContext.productId = recognizedId;
      creationContext.productName = productCatalog[recognizedId].name;
      creationContext.productConfirmed = false;
      creationContext.productSaved = false;
      const product = productCatalog[recognizedId];
      const nameInput = dynamicForm.querySelector("[data-original-product-name]");
      if (nameInput) nameInput.value = product.name;
      const brandInput = dynamicForm.querySelector("[data-original-brand]");
      const categoryInput = dynamicForm.querySelector("[data-original-category]");
      if (brandInput) brandInput.value = product.brand;
      if (categoryInput) categoryInput.value = product.category;
      ["core", "secondary", "difference"].forEach(key => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = product[key];
        if (key === "core" || key === "secondary" || key === "difference") setPointEditorValues(key, String(product[key] || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      ["marketing", "trust", "pain", "scenes"].forEach(key => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = "";
        if (key === "trust") setPointEditorValues("trust", [""]);
      });
      feedback.hidden = false;
      const partial = link.toLowerCase().includes("partial");
      if (partial) {
        if (brandInput) brandInput.value = "";
        if (categoryInput) categoryInput.value = "";
        feedback.className = "parse-state partial";
        feedback.innerHTML = `<strong>部分完成</strong><span>品牌、类目未识别，请手工补充后继续。</span>`;
      } else {
        feedback.className = "parse-state success";
        feedback.innerHTML = `<strong>解析完成</strong><span>产品信息已回填，可检查并继续编辑。</span>`;
      }
      updateModalContext();
      setFormFeedback("");
      }, 850);
    }

    function refineSellingPoints() {
      const product = currentProduct();
      const refined = {
        core: `${product.core}，先展示可见清洁结果，再说明产品能力`,
        secondary: `${product.secondary}；突出日常使用和清理便利`,
        difference: `${product.difference}，与普通表面清扫形成清晰差异`
      };
      Object.entries(refined).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = value;
        if (key === "core" || key === "secondary" || key === "difference") setPointEditorValues(key, String(value).split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      const feedback = dynamicForm.querySelector("[data-selling-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = "<strong>已提炼 · 待确认</strong><span>卖点已按“核心能力—使用价值—差异证明”重新组织，仍可人工修改。</span>";
      }
      creationContext.productSaved = false;
      creationContext.productConfirmed = false;
      updateModalContext();
      setFormFeedback("AI卖点提炼完成，请确认内容后保存产品档案。");
    }

    function saveProductToArchive() {
      const core = dynamicForm.querySelector('[data-field="core"]');
      const manualName = dynamicForm.querySelector("[data-manual-product-name]");
      if (!core?.value.trim()) {
        core.closest(".original-field, .field")?.classList.add("invalid");
        setFormFeedback("核心卖点不能为空。", "error");
        core.closest("[data-point-editor]")?.querySelector("[data-point-value]")?.focus();
        return;
      }
      if (creationContext.productSource === "manual" && !manualName?.value.trim()) {
        manualName.closest(".original-field, .field")?.classList.add("invalid");
        setFormFeedback("请填写产品名称。", "error");
        manualName.focus();
        return;
      }
      if (creationContext.productSource === "manual") {
        creationContext.productName = manualName.value.trim();
        creationContext.productId = "manual-product";
      }
      captureOriginalContext();
      productCatalog[creationContext.productId] = {
        ...(productCatalog[creationContext.productId] || {}),
        name: creationContext.productName || currentProduct().name,
        core: dynamicForm.querySelector('[data-field="core"]')?.value.trim() || "",
        secondary: dynamicForm.querySelector('[data-field="secondary"]')?.value.trim() || "",
        difference: dynamicForm.querySelector('[data-field="difference"]')?.value.trim() || "",
        trust: dynamicForm.querySelector('[data-field="trust"]')?.value.trim() || "",
        brand: dynamicForm.querySelector('[data-original-brand]')?.value || "",
        category: dynamicForm.querySelector('[data-original-category]')?.value || "",
        audiences: [...dynamicForm.querySelectorAll(".audience-chip.active")].map(item => item.textContent.trim()),
        psychology: [
          dynamicForm.querySelector('[data-field="primaryPsychology"]')?.value || "风险规避",
          dynamicForm.querySelector('[data-field="secondaryPsychology"]')?.value || "理性求证"
        ],
        facts: "产品事实已由用户确认，可用于内容生成"
      };
      creationContext.productConfirmed = true;
      creationContext.productSaved = true;
      updateModalContext();
      setFormFeedback(`“${currentProduct().name}”已保存至产品档案，AI识别字段已确认为可用事实。`);
      showToast("产品档案已保存");
    }

    function saveCreationPreset() {
      captureOriginalContext();
      const product = currentProduct();
      const style = creationContext.originalFields.style || "不限";
      const name = `${product.name}｜${style}｜${creationContext.originalFields.wordCount || 120}字`;
      if (!creationContext.customPresets.includes(name)) creationContext.customPresets.push(name);
      const select = dynamicForm.querySelector("[data-creation-preset]");
      const option = document.createElement("option");
      option.value = `custom-${creationContext.customPresets.length}`;
      option.textContent = name;
      option.selected = true;
      select.append(option);
      const feedback = dynamicForm.querySelector("[data-preset-feedback]");
      feedback.hidden = false;
      feedback.innerHTML = `<strong>预设已保存</strong><span>${name}。下次选择后可直接复用风格、人群、心理和CTA。</span>`;
      showToast("创作预设已保存");
    }

    function applyCreationPreset(value) {
      if (!value) return;
      const styleText = value === "pet-hard-ad" ? "制造焦虑类型" : "痛点类型";
      dynamicForm.querySelectorAll('[data-role="style"] .choice-chip').forEach(chip => {
        chip.classList.toggle("active", chip.textContent.trim() === styleText);
      });
      const audiences = value === "pet-hard-ad" ? ["养宠家庭"] : ["宝妈家庭"];
      setActiveAudience(audiences);
      const primary = dynamicForm.querySelector('[data-field="primaryPsychology"]');
      if (primary) primary.value = value === "pet-hard-ad" ? "风险规避" : "损失厌恶";
      const feedback = dynamicForm.querySelector("[data-preset-feedback]");
      feedback.hidden = false;
      feedback.innerHTML = "<strong>预设已应用</strong><span>已更新文案风格、目标人群和CTA，产品事实保持不变。</span>";
      setFormFeedback("创作预设已应用，可继续调整后生成。");
    }

    function renderMaterialScopeDetail(row, label) {
      if (activeType === "script") return;
      if (!row?.dataset.single?.includes("material")) return;
      const field = row.closest(".field");
      let detail = field.parentElement.querySelector("[data-material-scope-detail]");
      if (!detail) {
        detail = document.createElement("div");
        detail.className = "material-scope-detail";
        detail.dataset.materialScopeDetail = "";
        field.insertAdjacentElement("afterend", detail);
      }
      if (label.includes("指定")) {
        detail.innerHTML = `
          <div class="smart-tip"><strong>选择素材分组</strong><span>已从当前产品素材池中筛出可用分组，可多选。</span></div>
          <div class="choice-row" style="margin-top:8px;"><span class="choice-chip active">产品功能实拍 · 186段</span><span class="choice-chip active">家庭场景 · 94段</span><span class="choice-chip">达人口播 · 63段</span><span class="choice-chip">历史高频镜头 · 128段</span></div>`;
      } else if (label.includes("临时")) {
        detail.innerHTML = `<div class="upload-box" role="button" tabindex="0"><strong>上传本次任务素材</strong><span>仅用于当前任务；生成后可选择绑定至${currentProduct().name}</span></div>`;
      } else {
        detail.innerHTML = `<div class="inline-feedback success"><strong>自动带入</strong><span>将使用“${currentProduct().name}”下全部可用素材，并按镜头匹配度、画质和重复使用率自动排序。</span></div>`;
      }
    }

    function pointRowHtml(value = "") {
      return `<div class="point-row"><span class="point-index">●</span><input data-point-value value="${escapeHtml(value)}"><span class="point-actions"><button type="button" data-point-action="up" title="上移">↑</button><button type="button" data-point-action="down" title="下移">↓</button><button type="button" data-point-action="remove" title="删除">×</button></span></div>`;
    }

    function syncPointEditor(editor) {
      if (!editor) return;
      const values = [...editor.querySelectorAll("[data-point-value]")].map(input => input.value.trim()).filter(Boolean);
      const storage = editor.querySelector("textarea[data-field]");
      if (storage) storage.value = values.join("\n");
      editor.querySelectorAll(".point-row").forEach((row, index) => {
        const dot = row.querySelector(".point-index");
        if (dot) dot.title = `第 ${index + 1} 条`;
      });
    }

    function setPointEditorValues(type, values = []) {
      const editor = dynamicForm.querySelector(`[data-point-editor="${type}"]`);
      if (!editor) return;
      const add = editor.querySelector(".point-add");
      const storage = editor.querySelector("textarea[data-field]");
      editor.querySelectorAll(".point-row").forEach(row => row.remove());
      const cleanValues = values.map(item => String(item).trim()).filter(Boolean);
      (cleanValues.length ? cleanValues : [""]).forEach(value => add.insertAdjacentHTML("beforebegin", pointRowHtml(value)));
      if (storage) storage.value = cleanValues.join("\n");
      syncPointEditor(editor);
    }

    function setOriginalAdvanced(open) {
      dynamicForm.querySelectorAll(".advanced-field").forEach(field => { field.hidden = !open; });
      const toggle = dynamicForm.querySelector("[data-action='toggle-original-advanced']");
      if (toggle) {
        toggle.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "收起高级设置" : "展开高级设置";
      }
      updateAdvancedFooterToggle();
    }

    function advancedFieldProgress() {
      const fields = [...dynamicForm.querySelectorAll(".advanced-field")];
      const complete = fields.filter(field => {
        const controls = [...field.querySelectorAll("input:not([type='hidden']), textarea, select")];
        const hasValue = controls.some(control => String(control.value || "").trim() && control.value !== "不限");
        const hasChoice = Boolean(field.querySelector(".choice-chip.active:not([data-value='不限']), .original-audience-chip.active, [aria-pressed='true']"));
        return hasValue || hasChoice;
      }).length;
      return { complete, total:fields.length };
    }

    function updateAdvancedFooterToggle() {
      const button = taskActionButtons?.querySelector("[data-footer-advanced-toggle]");
      if (!button) return;
      const open = Boolean(dynamicForm.querySelector(".advanced-field:not([hidden])"));
      button.classList.toggle("active", open);
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "收起高级设置" : "高级设置（可选）";
    }

    const originalAiSuggestions = {
      core: [
        ["大吸力深入床褥缝隙，拍打吸尘同步完成", "边拍边吸带走织物深处毛发与碎屑", "透明尘杯让清洁结果看得见"],
        ["高频拍打松动织物深处碎屑", "吸尘与拍打同步完成深层清洁", "床垫、沙发和布艺均可使用"],
        ["针对床褥缝隙完成深层吸尘", "清洁过程与结果都能直观看见", "一次操作覆盖多种家庭软装场景"]
      ],
      secondary: [
        ["透明尘杯可拆卸水洗", "床垫、沙发和布艺均可使用", "机身轻巧，日常取用方便"],
        ["清洁后尘杯可直接拆洗", "电源线满足卧室日常清洁范围", "收纳体积小，不占家庭空间"],
        ["操作步骤简单，拿起即可使用", "多种软装场景无需更换工具", "使用结束后清理维护方便"]
      ],
      difference: [
        ["清洁结果可视化，操作完成后尘杯清理方便"],
        ["拍打吸尘同步完成，比单纯吸尘更深入织物", "透明尘杯让清洁结果直接可见"],
        ["摆脱电源线限制，床垫与沙发切换清洁更方便", "多种软装场景无需更换工具"]
      ],
      trust: [
        ["整机质保 1 年，产品参数与包装清单可核验", "官方渠道销售，支持正品验证", "核心功能均有真实产品资料支持"],
        ["产品型号、参数与售后信息均可查询", "公司自有产品实拍可验证使用过程", "透明尘杯可直接展示清洁结果"],
        ["包装清单和售后政策信息完整", "历史真实素材可追溯产品表现", "所有对外功能表达均来源于产品事实"]
      ],
      pain: [
        ["孩子后背红疹反复，半夜痒醒哭闹", "床单刚换，尘杯仍吸出毛发碎屑", "宠物上床后，床褥清洁总停在表面"],
        ["肉眼看着干净，织物深处仍藏着毛发碎屑", "普通粘毛器只能处理表面", "床垫沙发体积大，清洁频率低"],
        ["清洁结果看不见，不知道有没有吸干净", "机器难清理，使用一次就闲置", "多种布艺需要反复更换工具"]
      ],
      scene: [
        ["宝宝家庭的床垫日常清洁", "养宠家庭的沙发布艺清洁", "换季时卧室床褥深层清洁"],
        ["换洗床单前后的床褥深层清洁", "宠物上床后的毛发碎屑清理", "客厅沙发与布艺座椅连续清洁"],
        ["卧室床垫的周期性清洁", "毛绒玩具与靠枕的日常清洁", "全屋软装集中清洁整理"]
      ]
    };
    const originalSuggestionIndex = {};
    const originalSuggestionPrevious = {};
    const originalSuggestionDirty = new Set();

    function originalSuggestionKey(type, agentType = activeType) {
      return `${agentType}:${type}`;
    }

    function readOriginalSuggestion(type) {
      if (type === "core" || type === "secondary" || type === "difference" || type === "trust") {
        return [...dynamicForm.querySelectorAll(`[data-point-editor="${type}"] [data-point-value]`)].map(input => input.value.trim()).filter(Boolean);
      }
      const fieldName = type === "scene" ? "scenes" : type;
      return (dynamicForm.querySelector(`[data-field="${fieldName}"]`)?.value || "").split(/\n+/).map(value => value.trim()).filter(Boolean);
    }

    function applyOriginalSuggestion(type, values) {
      if (type === "core" || type === "secondary" || type === "difference" || type === "trust") setPointEditorValues(type, values);
      const fieldName = type === "scene" ? "scenes" : type;
      if (type === "pain" || type === "scene") {
        const field = dynamicForm.querySelector(`[data-field="${fieldName}"]`);
        if (field) field.value = values.join("\n");
      }
      creationContext.productConfirmed = false;
      creationContext.productSaved = false;
      updateModalContext();
    }

    function restoreOriginalSuggestion(type, key) {
      const values = originalSuggestionPrevious[key];
      if (!values) return;
      applyOriginalSuggestion(type, values);
      originalSuggestionDirty.delete(key);
      showToast("已恢复上一组内容");
    }

    function requireProductInfoForAiSuggestion() {
      const fields = [
        dynamicForm.querySelector("[data-original-product-name]"),
        dynamicForm.querySelector("[data-original-brand]"),
        dynamicForm.querySelector("[data-original-category]")
      ];
      const missing = fields.filter(field => !String(field?.value || "").trim());
      fields.forEach(field => field?.closest(".original-field")?.classList.toggle("invalid", missing.includes(field)));
      if (!missing.length) return true;
      setFormFeedback("请先选择、解析或填写完整产品信息，再使用 AI 换一组。", "error");
      missing[0]?.focus();
      return false;
    }

    async function regenerateOriginalSuggestion(type, button) {
      if (!requireProductInfoForAiSuggestion()) return;
      const groups = originalAiSuggestions[type] || [];
      if (!groups.length || button?.disabled) return;
      const requestAgentType = activeType;
      const key = originalSuggestionKey(type, requestAgentType);
      const label = { core:"核心卖点", secondary:"次要卖点", difference:"差异化卖点", trust:"信任背书", pain:"人群核心痛点", scene:"使用场景" }[type] || "当前内容";
      if (originalSuggestionDirty.has(key) && !confirm(`${label}已被手动修改。继续换一组将覆盖当前内容，是否继续？`)) return;
      const defaultLabel = button?.textContent || "AI 换一组";
      if (button) { button.disabled = true; button.textContent = "生成中…"; }
      await new Promise(resolve => setTimeout(resolve, 520));
      if (activeType !== requestAgentType) return;
      originalSuggestionPrevious[key] = readOriginalSuggestion(type);
      originalSuggestionIndex[key] = ((originalSuggestionIndex[key] || 0) + 1) % groups.length;
      applyOriginalSuggestion(type, groups[originalSuggestionIndex[key]]);
      originalSuggestionDirty.delete(key);
      if (button?.isConnected) { button.disabled = false; button.textContent = defaultLabel; }
      showToast("已生成 3 条新建议", "撤销", () => restoreOriginalSuggestion(type, key));
    }

    function validateOriginalStep(step) {
      const panel = dynamicForm.querySelector(`[data-original-step="${step}"]`);
      if (!panel) return true;
      dynamicForm.querySelectorAll(".original-field.invalid").forEach(field => field.classList.remove("invalid"));
      panel.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      const requiredFields = [...panel.querySelectorAll("[data-required]")].filter(field => !field.parentElement?.closest("[hidden]"));
      const empty = requiredFields.find(field => !String(field.value || "").trim());
      if (empty) {
        empty.closest(".original-field")?.classList.add("invalid");
        if (!empty.hidden) empty.focus();
        setFormFeedback("请补充必填信息后再继续。", "error");
        return false;
      }
      if (step === 1) {
        if (activeType === "copy") {
          const referenceSource = panel.querySelector("[data-reference-source]")?.value || "library";
          const activeReferencePanel = panel.querySelector(`[data-reference-panel="${referenceSource}"]`);
          const referenceValue = activeReferencePanel?.querySelector("[data-reference-value]");
          const uploaded = activeReferencePanel?.querySelector("[data-reference-upload].selected");
          if (referenceSource === "upload" ? !uploaded : !String(referenceValue?.value || "").trim()) {
            activeReferencePanel?.querySelector(".original-field")?.classList.add("invalid");
            referenceValue?.focus();
            setFormFeedback("请先提供需要仿写的参考内容。", "error");
            return false;
          }
          if (panel.dataset.referenceReady !== "true") {
            setFormFeedback(
              referenceSource === "library"
                ? "请先从视频库选择参考视频。"
                : referenceSource === "copy-library"
                  ? "请先从文案库选择参考文案。"
                : referenceSource === "upload"
                  ? "请先上传参考视频。"
                  : "请先分析参考文案。",
              "error"
            );
            return false;
          }
        }
        if (creationContext.productSource === "link" && !creationContext.productId.startsWith("linked-")) {
          setFormFeedback("请先完成商品链接解析。", "error");
          return false;
        }
        if (!creationContext.productConfirmed) {
          setFormFeedback("请先确认并保存当前产品信息。", "error");
          return false;
        }
        const audienceCount = panel.querySelectorAll(".audience-chip.active").length;
        if (activeType !== "rewrite" && !audienceCount) {
          setFormFeedback("请至少选择一个抖音目标人群。", "error");
          return false;
        }
        if (!panel.querySelector("[data-custom-age]")?.hidden) {
          const min = Number(panel.querySelector("[data-age-min]")?.value || 0);
          const max = Number(panel.querySelector("[data-age-max]")?.value || 0);
          if (min > max) {
            setFormFeedback("自定义年龄的起始值不能大于结束值。", "error");
            return false;
          }
        }
      }
      if (step === 2 && activeType === "rewrite" && !panel.querySelector("[data-rewrite-custom-age]")?.hidden) {
        const min = Number(panel.querySelector("[data-rewrite-age-min]")?.value || 0);
        const max = Number(panel.querySelector("[data-rewrite-age-max]")?.value || 0);
        if (min > max) {
          setFormFeedback("改写后目标人群的年龄起始值不能大于结束值。", "error");
          return false;
        }
      }
      setFormFeedback("");
      captureOriginalContext();
      return true;
    }

    function validateAgentForm() {
      dynamicForm.querySelectorAll(".field.invalid").forEach(field => field.classList.remove("invalid"));
      if (activeType === "script") {
        if (!validateScriptStep(1) || !validateScriptStep(2)) return false;
        captureScriptContext();
        return true;
      }
      if (!isStructuredCopyFlow()) return true;
      if (!validateOriginalStep(1) || !validateOriginalStep(2)) return false;
      captureOriginalContext();
      return true;
    }

    function getScriptProductInput(sourceMode) {
      if (sourceMode === "library") {
        return dynamicForm.querySelector('[data-script-product-panel="library"] [data-script-product]');
      }
      return dynamicForm.querySelector('[data-script-product-panel="manual"] [data-script-manual-product-panel]:not([hidden]) [data-script-product]');
    }

    // 智能脚本 Agent 校验:步骤①(来源文案/产品/配音/时长) + 步骤②(素材与模型)
    function validateScriptStep(step) {
      const panel = dynamicForm.querySelector(`.form-section[data-task-step="${step}"]`);
      if (!panel) return true;
      const materialMode = dynamicForm.querySelector('[data-role="script-material-mode"] .choice-chip.active')?.dataset.materialMode || "depend";
      // 步骤①校验
      if (step === 1) {
        const sourceMode = panel.querySelector("[data-script-source-mode].active")?.dataset.scriptSourceMode || "library";
        const sourceValue = sourceMode === "library"
          ? panel.querySelector("[data-script-source-library]")?.value
          : panel.querySelector("[data-script-source-text]")?.value.trim();
        if (!sourceValue) {
          const field = sourceMode === "library"
            ? panel.querySelector("[data-script-source-library]")
            : panel.querySelector("[data-script-source-text]");
          field?.closest(".field")?.classList.add("invalid");
          field?.focus();
          setFormFeedback(sourceMode === "library" ? "请从文案库选择一条口播文案。" : "请输入需要转为分镜的口播文案。", "error");
          return false;
        }
        const productInput = getScriptProductInput(sourceMode);
        if (!productInput?.value.trim()) {
          productInput?.closest(".field")?.classList.add("invalid");
          productInput?.focus();
          setFormFeedback(sourceMode === "library" ? "请先选择一条关联产品的文案。" : "请输入或选择对应产品。", "error");
          return false;
        }
        const audience = panel.querySelector("[data-script-audience]")?.value.trim();
        if (!audience) {
          const field = panel.querySelector("[data-script-audience]");
          field?.closest(".field")?.classList.add("invalid");
          setFormFeedback("请选择本次脚本的目标人群。", "error");
          return false;
        }
        const duration = getScriptDuration();
        if (!Number.isInteger(duration) || duration <= 0 || duration > 600) {
          panel.querySelector("[data-script-duration]")?.closest(".field")?.classList.add("invalid");
          setFormFeedback("目标时长请输入 1–600 的正整数。", "error");
          return false;
        }
        if (!dynamicForm.querySelector("[data-script-voice]")?.value) {
          dynamicForm.querySelector("[data-script-voice]")?.closest(".field")?.classList.add("invalid");
          setFormFeedback("请选择配音角色。", "error");
          return false;
        }
      }
      // 步骤②校验
      if (step === 2) {
        const ratio = dynamicForm.querySelector("[data-script-ratio]")?.value;
        if (!["9:16", "16:9"].includes(ratio)) {
          dynamicForm.querySelector("[data-script-ratio]")?.closest(".field")?.classList.add("invalid");
          setFormFeedback("请选择画面比例。", "error");
          return false;
        }
        if (materialMode === "depend") {
          const groupCount = (window.__scriptMaterialSelected || []).length;
          if (groupCount === 0) {
            const errBox = dynamicForm.querySelector("[data-material-group-error]");
            if (errBox) errBox.hidden = false;
            setFormFeedback("请至少选择 1 条素材。", "error");
            return false;
          }
        }
        const model = dynamicForm.querySelector("[data-script-model]")?.value;
        if (!model) {
          setFormFeedback("请选择脚本生成大模型。", "error");
          return false;
        }
      }
      // 清除该步所有 .invalid
      panel.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
      const errBox = dynamicForm.querySelector("[data-material-group-error]");
      if (errBox) errBox.hidden = true;
      setFormFeedback("");
      return true;
    }

    // 读取目标时长(正整数秒)
    function getScriptDuration() {
      return Number(dynamicForm.querySelector("[data-script-duration]")?.value || 0);
    }

    // 采集智能脚本 Agent 的当前参数,用于生成请求和汇总面板
    function captureScriptContext() {
      if (activeType !== "script") return;
      const sourceMode = dynamicForm.querySelector("[data-script-source-mode].active")?.dataset.scriptSourceMode || "library";
      const productInput = getScriptProductInput(sourceMode);
      const product = productInput?.dataset.productId || "";
      const audienceInput = dynamicForm.querySelector("[data-script-audience]");
      const materialMode = dynamicForm.querySelector('[data-role="script-material-mode"] .choice-chip.active')?.dataset.materialMode || "depend";
      const sourceValue = sourceMode === "library"
        ? dynamicForm.querySelector("[data-script-source-library]")?.value
        : dynamicForm.querySelector("[data-script-source-text]")?.value || "";
      // 素材分组从 window.__scriptMaterialSelected 读取(由弹窗写入)
      const materialIds = window.__scriptMaterialSelected || [];
      const materialGroups = [...new Set(materialIds.map(id => findScriptMaterial(id)?.group).filter(Boolean))].map(id => ({
        id,
        name: id,
        tagCount: materialIds.filter(materialId => findScriptMaterial(materialId)?.group === id).length
      }));
      creationContext.script = {
        sourceMode,
        sourceValue,
        sourceLabel: sourceMode === "library"
          ? (() => { const item = SCRIPT_LIBRARY_ITEMS.find(i => i.id === sourceValue); return item ? `${productCatalog[item.productId]?.name || ""} · ${item.text.slice(0, 24)}…` : ""; })()
          : (dynamicForm.querySelector("[data-script-source-text]")?.value || "").slice(0, 60) + (dynamicForm.querySelector("[data-script-source-text]")?.value.length > 60 ? "…" : ""),
        product,
        productName: productInput?.value.trim() || "",
        audience: audienceInput?.value.trim() || "",
        audienceCount: String(audienceInput?.dataset.personaIds || "").split("|").filter(Boolean).length,
        personaId: audienceInput?.dataset.personaId || "",
        personaIds: audienceInput?.dataset.personaIds || "",
        duration: getScriptDuration(),
        ratio: dynamicForm.querySelector("[data-script-ratio]")?.value || "9:16",
        sourceText: sourceMode === "library" ? (dynamicForm.querySelector("[data-script-source-content]")?.value || "") : sourceValue,
        voice: dynamicForm.querySelector("[data-script-voice]")?.value || "",
        materialMode,
        materialProduct: product,
        materialIds,
        materialGroups,
        model: dynamicForm.querySelector("[data-script-model]")?.value || "gpt-5-6-terra",
        version: 1
      };
    }

    // 渲染确认生成步骤的只读汇总面板
    function renderScriptSummary() {
      const host = dynamicForm.querySelector("[data-script-summary]");
      if (!host) return;
      const ctx = creationContext.script || {};
      const productName = productCatalog[ctx.product]?.name || "未选择";
      const materialProductName = productCatalog[ctx.materialProduct]?.name || productName;
      const modelLabels = { auto:"系统默认 gemini", "gpt-4o":"GPT-4o", "claude-sonnet":"Claude Sonnet 4.5", "qwen-max":"Qwen Max", "deepseek-v3":"DeepSeek V3" };
      const modeLabel = ctx.materialMode === "depend" ? "依赖素材库" : "不依赖素材库";
      const groupChips = (ctx.materialGroups || []).map(g => `<span class="script-summary-chip">${escapeHtml(g.name)} <small>${g.tagCount} 个标签</small></span>`).join("") || '<span class="script-summary-empty">不适用(不依赖素材库模式)</span>';
      const sourceSummary = ctx.sourceMode === "library"
        ? `<b>文案库选择</b> · ${escapeHtml(ctx.sourceLabel || "—")}`
        : `<b>手动输入</b> · ${escapeHtml((ctx.sourceValue || "").slice(0, 80))}${(ctx.sourceValue || "").length > 80 ? "…" : ""}`;
      host.innerHTML = `
        <div class="script-summary-grid">
          <div class="script-summary-item">
            <span class="script-summary-label">来源文案</span>
            <div class="script-summary-value">${sourceSummary}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">口播摘要</span>
            <div class="script-summary-value">${ctx.sourceMode === "library"
              ? `<i>${escapeHtml(SCRIPT_LIBRARY_PREVIEWS[ctx.sourceValue] || "已选文案内容将作为本次分镜输入")}</i>`
              : `<i>${escapeHtml((ctx.sourceValue || "").slice(0, 80) + ((ctx.sourceValue || "").length > 80 ? "…" : ""))}</i>`}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">对应产品</span>
            <div class="script-summary-value"><b>${escapeHtml(productName)}</b></div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">目标人群</span>
            <div class="script-summary-value"><b>${escapeHtml(ctx.audience || "—")}</b>${ctx.audienceCount > 1 ? `<small>已选择 ${ctx.audienceCount} 个人群画像</small>` : ""}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">目标时长</span>
            <div class="script-summary-value"><b>${ctx.duration || 30} 秒</b></div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">画面比例</span>
            <div class="script-summary-value"><b>${escapeHtml(ctx.ratio || "9:16")}</b></div>
          </div>
          <div class="script-summary-item"><span class="script-summary-label">配音角色</span><div class="script-summary-value"><b>${escapeHtml(ctx.voice || "—")}</b></div></div>
          <div class="script-summary-item">
            <span class="script-summary-label">是否依赖素材库</span>
            <div class="script-summary-value"><b>${modeLabel}</b></div>
          </div>
          <div class="script-summary-item${ctx.materialMode === "depend" ? "" : " is-muted"}">
            <span class="script-summary-label">${ctx.materialMode === "depend" ? "素材来源产品" : "素材来源产品(隐藏)"}</span>
            <div class="script-summary-value">${ctx.materialMode === "depend" ? `<b>${escapeHtml(materialProductName)}</b>` : `<i>不适用</i>`}</div>
          </div>
          <div class="script-summary-item full${ctx.materialMode === "depend" ? "" : " is-muted"}">
            <span class="script-summary-label">已勾选素材分组${ctx.materialMode === "depend" ? "" : "(隐藏)"}</span>
            <div class="script-summary-value script-summary-groups">${groupChips}</div>
          </div>
          <div class="script-summary-item">
            <span class="script-summary-label">选用大模型</span>
            <div class="script-summary-value"><b>${escapeHtml(modelLabels[ctx.model] || ctx.model || "—")}</b></div>
          </div>
        </div>
        <div class="script-summary-tip">
          <i>ℹ</i>
          <span>${ctx.materialMode === "depend"
            ? "本次分镜将按已勾选分组匹配素材;若某镜头在当前分组下无合适素材,系统会标记提示。"
            : "本次分镜将输出生视频提示词列,可一键复制到即梦等第三方生视频工具使用。"}</span>
        </div>
      `;
    }

    // 文案库数据：一条文案只对应一个目标人群，避免混用不同人群的表达策略。
    // 适用人群字段统一使用「抖音八大人群」，便于智能混剪自动匹配到标准人群 chip。
    const SCRIPT_LIBRARY_ITEMS = [
      {
        id: "mite-summer", productId: "mite-pro",
        text: "刚换的床单,也能吸出一杯脏东西。看得见的是表面,看不见的都藏在床垫深处。轻净 Pro 边拍边吸,脏东西直接进尘杯,用完还能拆下水洗。",
        audience: "精致妈妈", structure: "结果直给型",
        source: "AI 生成", createdBy: "嗡大发", createdAt: "2026-08-05 14:20", updatedBy: "嗡大发", scope: "mine", updated: "2026-08-05 14:20"
      },
      {
        id: "mite-family", productId: "mite-pro",
        text: "床单刚换一周,第一遍照样能吸出碎屑和毛发。床垫深处的脏东西,普通清理根本触达不到。轻净 Pro 拍打吸尘同步完成,尘杯可水洗。",
        audience: "精致妈妈", structure: "痛点钩子型",
        source: "AI 生成", createdBy: "嗡大发", createdAt: "2026-08-05 14:20", updatedBy: "嗡大发", scope: "mine", updated: "2026-08-05 14:25"
      },
      {
        id: "mite-pet", productId: "mite-pro",
        text: "家里养宠物,床铺最该清理的是藏起来的毛。刚洗完的床单,宠物上去转一圈就又有碎屑。轻净 Pro 大吸力,一拍一吸全带走。",
        audience: "精致妈妈", structure: "场景痛点型",
        source: "AI 生成", createdBy: "嗡大发", createdAt: "2026-08-05 14:20", updatedBy: "嗡大发", scope: "mine", updated: "2026-08-05 14:30"
      },
      {
        id: "mite-rationale", productId: "mite-pro",
        text: "先不讲参数,直接看一次真实使用。轻净 Pro 工作时可以做到深层清洁,处理后的变化通过尘杯直接呈现。",
        audience: "资深中产", structure: "实测证明型",
        source: "AI 生成", createdBy: "李四", createdAt: "2026-08-04 10:12", updatedBy: "李四", scope: "team", updated: "2026-08-04 10:12"
      },
      {
        id: "mite-curiosity", productId: "mite-pro",
        text: "明明刚整理过,为什么再次处理还能看到变化?答案不靠猜,直接看完整演示。",
        audience: "Z世代", structure: "悬念钩子型",
        source: "AI 生成", createdBy: "李四", createdAt: "2026-08-04 10:12", updatedBy: "李四", scope: "team", updated: "2026-08-04 10:18"
      }
    ];
    const copyTimestamp = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    const notifyCopyChange = () => window.dispatchEvent(new CustomEvent("content-compass:copies-updated"));
    window.ContentCompassCopyLibrary = {
      list: () => SCRIPT_LIBRARY_ITEMS,
      update(id, patch = {}) {
        const item = SCRIPT_LIBRARY_ITEMS.find(entry => entry.id === id);
        if (!item) return null;
        Object.assign(item, patch, { updated: copyTimestamp(), updatedBy: "嗡大发" });
        SCRIPT_LIBRARY_PREVIEWS[id] = item.text;
        notifyCopyChange();
        return item;
      },
      remove(id) {
        const index = SCRIPT_LIBRARY_ITEMS.findIndex(entry => entry.id === id);
        if (index < 0) return false;
        const [removed] = SCRIPT_LIBRARY_ITEMS.splice(index, 1);
        delete SCRIPT_LIBRARY_PREVIEWS[removed.id];
        notifyCopyChange();
        return true;
      }
    };
    const SCRIPT_LIBRARY_PREVIEWS = Object.fromEntries(SCRIPT_LIBRARY_ITEMS.map(i => [i.id, i.text]));


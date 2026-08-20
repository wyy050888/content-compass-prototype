    function setFormFeedback(message, type = "success") {
      formFeedback.hidden = !message;
      formFeedback.className = `inline-feedback ${type}`;
      formFeedback.innerHTML = message ? `<strong>${type === "error" ? "请检查" : "已完成"}</strong><span>${message}</span>` : "";
    }

    function currentProduct() {
      return productCatalog[creationContext.productId] || {
        name: creationContext.productName || "当前产品",
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

    function isImageCreationFlow(type = activeType) {
      return type === "image-main" || type === "image-detail";
    }

    function usesProductInformationFlow(type = activeType) {
      return isStructuredCopyFlow(type) || isImageCreationFlow(type);
    }

    function updateModalContext() {
      saveProductButton.hidden = !usesProductInformationFlow() || creationContext.productSaved;
      if (usesProductInformationFlow()) {
        saveProductButton.textContent = "保存产品";
        saveProductButton.disabled = false;
      }
      contextStatus.hidden = !activeType;
      contextStatus.textContent = `已带入：${currentProduct().name}`;
      if (isImageCreationFlow() && taskShell?.classList.contains("show") && taskStep === 1) renderTaskActions();
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
      ["core", "secondary", "trust"].forEach(key => setPointEditorValues(key, [""]));
      ["difference", "marketing", "pain", "scenes"].forEach(key => clear(`[data-field="${key}"]`));
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
        creationContext.productConfirmed = true;
        creationContext.productSaved = true;
        const librarySelect = dynamicForm.querySelector("[data-product-source-panel=\"library\"] [data-product-select]");
        if (librarySelect?.value && productCatalog[librarySelect.value]) applyProductToForm(librarySelect.value);
      } else {
        clearOriginalProductFields(source);
        creationContext.productConfirmed = false;
        creationContext.productSaved = false;
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

    function applyProductToForm(productId, announce = false) {
      if (!productCatalog[productId]) return;
      creationContext.productId = productId;
      creationContext.productName = productCatalog[productId].name;
      creationContext.productConfirmed = true;
      creationContext.productSaved = true;
      const product = productCatalog[productId];
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
      dynamicForm.querySelectorAll("[data-product-select]").forEach(select => {
        if (![...select.options].some(option => option.value === productId)) {
          select.add(new Option(product.name, productId));
        }
        select.value = productId;
      });
      const fieldMap = { core: product.core, secondary: product.secondary, difference: product.difference };
      Object.entries(fieldMap).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = value;
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(value || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      const factHint = dynamicForm.querySelector("[data-product-fact-hint]");
      if (factHint) factHint.textContent = product.facts;
      setActiveAudience(product.audiences);
      const primary = dynamicForm.querySelector('[data-field="primaryPsychology"]');
      const secondary = dynamicForm.querySelector('[data-field="secondaryPsychology"]');
      if (primary) primary.value = product.psychology[0];
      if (secondary) secondary.value = product.psychology[1] || "不选择";
      const reason = dynamicForm.querySelector("[data-psychology-reason] span");
      if (reason) reason.textContent = `${product.name}的购买决策更受“${product.psychology[0]}”驱动，并需要“${product.psychology[1] || "产品价值"}”降低决策成本。`;
      dynamicForm.querySelectorAll(".material-summary strong").forEach(label => {
        label.textContent = `${product.name} · 已绑定素材`;
      });
      if (activeType === "rewrite") refreshRewriteSetting();
      updateModalContext();
      if (announce) setFormFeedback(`已切换至“${product.name}”，并重新带入卖点、人群、心理建议和禁用词。`);
    }

    function captureOriginalContext() {
      if (!usesProductInformationFlow()) return;
      dynamicForm.querySelectorAll("[data-point-editor]").forEach(syncPointEditor);
      dynamicForm.querySelectorAll("[data-field]").forEach(field => {
        creationContext.originalFields[field.dataset.field] = field.value;
      });
      creationContext.productName = dynamicForm.querySelector("[data-original-product-name]")?.value.trim() || creationContext.productName;
      creationContext.originalFields.brand = dynamicForm.querySelector("[data-original-brand]")?.value || "";
      creationContext.originalFields.category = dynamicForm.querySelector("[data-original-category]")?.value || "";
      creationContext.originalFields.wordCount = dynamicForm.querySelector("[data-word-count]")?.value || "180";
      creationContext.originalFields.generationCount = dynamicForm.querySelector("[data-generation-count]")?.value || "3";
      creationContext.originalFields.marketingScene = dynamicForm.querySelector('[data-role="marketing-scene"] .choice-chip.active')?.textContent.trim() || "短视频带货";
      creationContext.originalFields.hook = dynamicForm.querySelector('[data-role="hook"] .choice-chip.active')?.textContent.trim() || "不限";
      creationContext.originalFields.scriptType = dynamicForm.querySelector('[data-role="script-type"] .choice-chip.active')?.textContent.trim() || "不限";
      creationContext.originalFields.gender = dynamicForm.querySelector('[data-role="gender"] .choice-chip.active')?.textContent.trim() || "不限";
      const selectedAge = dynamicForm.querySelector('[data-role="age"] .choice-chip.active')?.textContent.trim() || "不限";
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
      if (manualName) manualName.value = creationContext.productName || currentProduct().name || "";
      Object.entries(fields).forEach(([key, value]) => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field && typeof value === "string") field.value = value;
        if ((key === "core" || key === "secondary" || key === "trust") && typeof value === "string") setPointEditorValues(key, value.split("\n").filter(Boolean));
      });
      const wordCount = dynamicForm.querySelector("[data-word-count]");
      if (wordCount && fields.wordCount) wordCount.value = fields.wordCount;
      const generationCount = dynamicForm.querySelector("[data-generation-count]");
      if (generationCount && fields.generationCount) generationCount.value = fields.generationCount;
      ["marketingScene", "hook", "scriptType", "gender", "age"].forEach(key => {
        const role = { marketingScene:"marketing-scene", hook:"hook", scriptType:"script-type", gender:"gender", age:"age" }[key];
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
      setOriginalAdvanced(Boolean(fields.advancedOpen));
      refreshWordDuration();
    }

    function recognizeLinkedProduct() {
      const linkInput = dynamicForm.querySelector("[data-product-link]");
      const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
      if (!linkInput?.value.trim()) {
        feedback.hidden = false;
        feedback.className = "inline-feedback error";
        feedback.innerHTML = "<strong>无法识别</strong><span>请先粘贴有效的抖店商品链接。</span>";
        linkInput.focus();
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
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(product[key] || "").split(/[；\n]/).map(item => item.trim()).filter(Boolean));
      });
      setActiveAudience(product.audiences);
      ["marketing", "trust", "pain", "scenes"].forEach(key => {
        const field = dynamicForm.querySelector(`[data-field="${key}"]`);
        if (field) field.value = "";
        if (key === "trust") setPointEditorValues("trust", [""]);
      });
      feedback.hidden = false;
      feedback.className = "inline-feedback success";
      feedback.innerHTML = `<strong>解析完成</strong><span>已回填可识别的产品信息；空白字段请手工补充。</span>`;
      updateModalContext();
      setFormFeedback("");
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
        if (key === "core" || key === "secondary") setPointEditorValues(key, String(value).split(/[；\n]/).map(item => item.trim()).filter(Boolean));
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
      feedback.innerHTML = "<strong>预设已应用</strong><span>已更新文案风格、目标人群、用户心理和CTA，产品事实保持不变。</span>";
      setFormFeedback("创作预设已应用，可继续调整后生成。");
    }

    function renderMaterialScopeDetail(row, label) {
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
    }

    const originalAiSuggestions = {
      core: [
        ["大吸力深入床褥缝隙，拍打吸尘同步完成"],
        ["边拍边吸带走织物深处毛发与碎屑", "透明尘杯让清洁结果看得见"],
        ["床垫、沙发、布艺多场景深层清洁"]
      ],
      secondary: [
        ["透明尘杯可拆卸水洗", "床垫、沙发和布艺均可使用"],
        ["机身轻巧，日常取用方便", "清洁后尘杯可直接拆洗"],
        ["拍打与吸尘同步进行", "操作结束后清理步骤简单"]
      ],
      trust: [
        ["整机质保 1 年，产品参数与包装清单可核验"],
        ["产品型号、参数与售后信息均可查询", "核心功能有真实产品资料支持"],
        ["公司自有产品实拍与历史素材可验证使用效果"]
      ],
      pain: [
        ["孩子后背红疹反复，半夜痒醒哭闹", "床单刚换，尘杯仍吸出毛发碎屑", "宠物上床后，床褥清洁总停在表面"],
        ["肉眼看着干净，织物深处仍藏着毛发碎屑", "普通粘毛器只能处理表面", "床垫沙发体积大，清洁频率低"],
        ["清洁结果看不见，不知道有没有吸干净", "机器难清理，使用一次就闲置", "多种布艺需要反复更换工具"]
      ],
      scene: [
        ["宝宝家庭的床垫日常清洁", "养宠家庭的沙发布艺清洁"],
        ["换洗床单前后的床褥深层清洁", "宠物上床后的毛发碎屑清理"],
        ["卧室床垫、客厅沙发和布艺座椅连续清洁"]
      ]
    };
    const originalSuggestionIndex = {};

    function regenerateOriginalSuggestion(type) {
      const groups = originalAiSuggestions[type] || [];
      if (!groups.length) return;
      originalSuggestionIndex[type] = ((originalSuggestionIndex[type] || 0) + 1) % groups.length;
      const values = groups[originalSuggestionIndex[type]];
      if (type === "core" || type === "secondary" || type === "trust") setPointEditorValues(type, values);
      if (type === "pain") {
        const field = dynamicForm.querySelector('[data-field="pain"]');
        if (field) field.value = values.join("\n");
      }
      if (type === "scene") {
        const field = dynamicForm.querySelector('[data-field="scenes"]');
        if (field) field.value = values.join("\n");
      }
      creationContext.productConfirmed = false;
      creationContext.productSaved = false;
      updateModalContext();
      showToast("AI 推荐已更新，可继续换一组或人工修改");
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
      if (!isStructuredCopyFlow()) return true;
      if (!validateOriginalStep(1) || !validateOriginalStep(2)) return false;
      captureOriginalContext();
      return true;
    }

    function renderAgentForm(type) {
      const config = agentConfigs[type];
      if (!config) return;
      modalIntro.textContent = config.intro;
      agentProcess.textContent = config.process;
      dynamicForm.innerHTML = config.form;
      if (type === "copy") {
        referenceTranscriptState.library = { defaultValue: "", value: "" };
        referenceTranscriptState.upload = { defaultValue: "", value: "" };
      }
      if (type === "rewrite") {
        creationContext.productSource = "library";
        rewriteSourceState.library = rewriteCopySamples["mite-summer"];
        rewriteSourceState.paste = "";
      }
      if (isStructuredCopyFlow(type)) {
        [...dynamicForm.querySelectorAll("[data-point-editor]")].forEach(editor => {
          const values = [...editor.querySelectorAll("[data-point-value]")].map(input => input.value.trim()).filter(Boolean);
          setPointEditorValues(editor.dataset.pointEditor, values);
        });
      }
      promptInput.placeholder = config.placeholder;
      dynamicForm.querySelectorAll(".upload-box").forEach(box => {
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
      });
      refreshConditionalSlots();
      if (type === "copy") refreshReferenceSource();
      if (type === "rewrite") {
        refreshRewriteSource(true);
        refreshRewriteSetting();
      }
      refreshWordDuration();
      if (type === "image-detail") renderDetailModuleOrder();
      setFormFeedback("");
      if (isStructuredCopyFlow(type)) hydrateOriginalContext();
      else if (isImageCreationFlow(type)) {
        setProductSource(creationContext.productSource || "library");
        if (creationContext.productSource === "library") applyProductToForm(creationContext.productId);
      } else applyProductToForm(creationContext.productId);
      updateModalContext();
    }

    function refreshConditionalSlots() {
      const modeControl = dynamicForm.querySelector("[data-mode-control]");
      if (!modeControl) return;
      const activeMode = modeControl.value;
      dynamicForm.querySelectorAll("[data-mode]").forEach(slot => {
        slot.classList.toggle("show", slot.dataset.mode.split(",").includes(activeMode));
      });
    }

    const referenceTranscriptSamples = {
      "7553983811703193643": "这不吸真是不知道，真没想到我每天竟然跟这些东西睡在一起。这秋天可是螨虫的高发期，家里床上的螨虫数量非常大。咱们家里记得晒，更要用除螨仪把藏在床垫和沙发里的毛发、灰尘吸出来。轻净 Pro 拍打和吸尘同步完成，尘杯还能拆下水洗，日常清理更方便。",
      "7553983811703195018": "洗地机最怕什么？不是洗不干净，而是滚刷缠毛、边角留污。净界洗地机吸拖洗同步完成，贴边清洁不留缝，滚刷还能自动清洗。厨房油污、客厅脚印和宠物毛发，一遍就能处理干净。",
      "external-mite-hook-01": "别只看床单表面干不干净，真正影响睡眠体验的是藏在织物深处的毛发、皮屑和灰尘。先把清洁结果展示出来，再说明产品如何拍打、吸尘和清理尘杯，让用户直接看到使用前后的差别。"
    };
    const referenceTranscriptState = {
      library: { defaultValue: "", value: "" },
      upload: { defaultValue: "", value: "" }
    };

    function showReferenceTranscript(source, transcript) {
      if (!referenceTranscriptState[source]) return;
      referenceTranscriptState[source] = { defaultValue: transcript, value: transcript };
      refreshReferenceTranscriptEditor(source);
    }

    function refreshReferenceTranscriptEditor(source = dynamicForm.querySelector("[data-reference-source]")?.value) {
      const editor = dynamicForm.querySelector("[data-reference-transcript-editor]");
      const textarea = editor?.querySelector("[data-reference-transcript]");
      const state = referenceTranscriptState[source];
      const sourcePanel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const sourceReady = source === "library"
        ? Boolean(sourcePanel?.querySelector("[data-reference-value]")?.value)
        : source === "upload" && Boolean(sourcePanel?.querySelector("[data-reference-upload].selected"));
      const visible = Boolean(state?.defaultValue) && sourceReady && (source === "library" || source === "upload");
      if (!editor || !textarea) return;
      editor.hidden = !visible;
      if (visible) {
        textarea.value = state.value;
        editor.dataset.transcriptSource = source;
      }
    }

    function resetReferenceTranscript() {
      const source = dynamicForm.querySelector("[data-reference-source]")?.value;
      const state = referenceTranscriptState[source];
      const textarea = dynamicForm.querySelector("[data-reference-transcript]");
      if (!state || !textarea) return;
      state.value = state.defaultValue;
      textarea.value = state.defaultValue;
      showToast("已恢复识别原文");
    }

    const rewriteCopySamples = {
      "mite-summer": "你家床垫真的洗干净了吗？轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑，清洁结果直接进入透明尘杯。床垫、沙发和布艺都能使用，用完尘杯还能拆下水洗。点击商品，先看实际使用效果。",
      "mite-family": "每天睡的床，看起来干净不代表织物深处没有毛发和碎屑。轻净 Pro 拍打和吸尘同步完成，清洁结果直接看得见。床垫、沙发都能用，用完尘杯拆下水洗，家庭日常清洁更方便。",
      "mite-pet": "家里养宠物，床铺清洁别只处理表面的毛。轻净 Pro 边拍边吸，把藏进床垫和沙发里的毛发碎屑带进透明尘杯。用完可拆卸水洗，养宠家庭日常使用更省事。"
    };
    const rewriteSourceState = { library: rewriteCopySamples["mite-summer"], paste: "" };

    function refreshRewriteSource(initial = false) {
      const source = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      const libraryField = dynamicForm.querySelector("[data-rewrite-library-field]");
      const previous = dynamicForm.dataset.rewriteSource;
      if (!initial && previous && textarea) rewriteSourceState[previous] = textarea.value;
      dynamicForm.dataset.rewriteSource = source;
      if (libraryField) libraryField.hidden = source !== "library";
      if (textarea) textarea.value = rewriteSourceState[source] || "";
    }

    function refreshRewriteLibraryCopy() {
      const id = dynamicForm.querySelector("[data-rewrite-library]")?.value;
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      rewriteSourceState.library = rewriteCopySamples[id] || "";
      if (textarea) textarea.value = rewriteSourceState.library;
      setFormFeedback("");
    }

    function refreshRewriteSetting() {
      const host = dynamicForm.querySelector("[data-rewrite-setting-host]");
      const active = dynamicForm.querySelector('[data-single="rewrite-method"] .choice-chip.active');
      const method = active?.dataset.rewriteMethod || "hook";
      if (!host) return;
      const settings = {
        hook: `<label>开场钩子偏好<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>结果前置</option><option>痛点冲突</option><option>利益直给</option><option>反常识</option><option>场景代入</option><option>身份点名</option><option>风险提醒</option><option>数字清单</option></select>`,
        audience: `<div class="rewrite-strategy-title"><strong>人群与表达策略</strong><span>重新定义改写文案面向的人群及使用语境</span></div>
          ${personaPickerMarkup("rewrite")}
          <div class="original-field-head"><label>改写后目标人群<span class="required-star">*</span></label></div>
          <div class="audience-selector rewrite-audience-selector">
            <div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-rewrite-audience-box>
              <button class="rewrite-audience-chip active" type="button">精致妈妈</button><button class="rewrite-audience-chip" type="button">新锐白领</button><button class="rewrite-audience-chip" type="button">资深中产</button><button class="rewrite-audience-chip" type="button">Z世代</button><button class="rewrite-audience-chip" type="button">小镇青年</button><button class="rewrite-audience-chip" type="button">小镇中老年</button><button class="rewrite-audience-chip" type="button">都市蓝领</button><button class="rewrite-audience-chip" type="button">都市银发</button>
            </div></div>
            <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="rewrite-gender" data-role="rewrite-gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
            <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="rewrite-age" data-role="rewrite-age"><span class="choice-chip active">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-rewrite-custom-age-trigger>自定义</span><span class="custom-age-range" data-rewrite-custom-age hidden><input type="number" min="1" max="99" value="25" data-rewrite-age-min><i>至</i><input type="number" min="1" max="99" value="35" data-rewrite-age-max></span></div></div>
          </div>
          <input type="hidden" data-field="rewriteTarget" data-required value="精致妈妈、不限、不限">
          <div class="rewrite-audience-details">
            <div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div>
            <textarea data-field="pain" placeholder="一行一个人群核心痛点">床单刚换，尘杯仍吸出毛发碎屑\n宠物上床后，床褥清洁总停在表面</textarea>
            <div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div>
            <textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea>
          </div>`,
        selling: `<label>需要前置的卖点<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>${escapeHtml(currentProduct().core || "核心卖点")}</option><option>${escapeHtml(currentProduct().secondary || "次要卖点")}</option><option>${escapeHtml(currentProduct().difference || "差异化卖点")}</option></select>`,
        style: `<label>目标表达风格<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>硬广直给</option><option>生活化口播</option><option>专业测评</option><option>情绪冲击</option><option>理性对比</option></select>`
      };
      host.hidden = !settings[method];
      host.innerHTML = settings[method] || "";
      creationContext.originalFields.rewriteMethod = method;
      if (method === "audience") syncRewriteAudienceTarget();
    }

    function syncRewriteAudienceTarget() {
      const target = dynamicForm.querySelector('[data-field="rewriteTarget"]');
      const box = dynamicForm.querySelector("[data-rewrite-audience-box]");
      if (!target || !box) return;
      const audiences = [...box.querySelectorAll(".rewrite-audience-chip.active")].map(item => item.textContent.trim());
      const gender = dynamicForm.querySelector('[data-role="rewrite-gender"] .choice-chip.active')?.textContent.trim() || "不限";
      const ageChoice = dynamicForm.querySelector('[data-role="rewrite-age"] .choice-chip.active')?.textContent.trim() || "不限";
      const age = ageChoice === "自定义"
        ? `${dynamicForm.querySelector("[data-rewrite-age-min]")?.value || 18}–${dynamicForm.querySelector("[data-rewrite-age-max]")?.value || 35}岁`
        : ageChoice;
      target.value = audiences.length ? `${audiences.join("、")}；${gender}；${age}` : "";
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function refreshReferenceSource() {
      const source = dynamicForm.querySelector("[data-reference-source]")?.value;
      if (!source) return;
      dynamicForm.querySelectorAll("[data-reference-panel]").forEach(panel => {
        panel.hidden = panel.dataset.referencePanel !== source;
      });
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      const activePanel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const hasLibrarySelection = source === "library" && Boolean(activePanel?.querySelector("[data-reference-value]")?.value);
      const hasUpload = source === "upload" && Boolean(activePanel?.querySelector("[data-reference-upload].selected"));
      if (stepPanel) stepPanel.dataset.referenceReady = hasLibrarySelection || hasUpload ? "true" : "false";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = !(hasLibrarySelection || hasUpload);
      }
      refreshReferenceTranscriptEditor(source);
    }

    function filterReferenceVideos() {
      const keyword = dynamicForm.querySelector("[data-reference-search]")?.value.trim().toLowerCase() || "";
      const filter = dynamicForm.querySelector('[data-single="reference-filter"] .choice-chip.active')?.dataset.referenceFilter || "all";
      dynamicForm.querySelectorAll("[data-reference-video]").forEach(item => {
        const matchesSource = filter === "all" || item.dataset.referenceSourceType === filter;
        const matchesKeyword = !keyword || (item.dataset.referenceSearchText || "").toLowerCase().includes(keyword);
        item.hidden = !(matchesSource && matchesKeyword);
      });
    }

    function selectReferenceVideo(option) {
      const panel = dynamicForm.querySelector('[data-reference-panel="library"]');
      const value = panel?.querySelector("[data-reference-value]");
      const title = option.querySelector("strong")?.textContent.trim() || "已选参考视频";
      const meta = option.querySelector("small")?.textContent.trim() || "";
      if (value) value.value = option.dataset.referenceVideo || title;
      showReferenceTranscript("library", referenceTranscriptSamples[option.dataset.referenceVideo] || "已识别该参考视频中的口播文案，可在此修改后用于爆款仿写。 ");
      dynamicForm.querySelectorAll("[data-reference-video]").forEach(item => item.classList.toggle("selected", item === option));
      const selected = dynamicForm.querySelector("[data-selected-reference]");
      if (selected) {
        selected.hidden = false;
        selected.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span>`;
      }
      const triggerText = dynamicForm.querySelector("[data-reference-trigger-text]");
      if (triggerText) triggerText.textContent = "重新选择视频";
      const picker = dynamicForm.querySelector("[data-reference-library]");
      if (picker) picker.hidden = true;
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      if (stepPanel) stepPanel.dataset.referenceReady = "true";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = option.dataset.referenceSourceType === "history"
          ? "<strong>已带入</strong><span>已读取该历史投放视频的口播和拆解结果，并用于仿写结构学习。</span>"
          : "<strong>已带入</strong><span>已读取外部参考视频的拆解结果，仅学习创作方法，不作为效果样本。</span>";
      }
      setFormFeedback("");
      showToast("参考视频已带入");
    }

    function analyzeReference() {
      const source = dynamicForm.querySelector("[data-reference-source]")?.value || "text";
      const panel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const value = panel?.querySelector("[data-reference-value]")?.value.trim();
      if (!value) {
        setFormFeedback("请先填写需要解析的参考内容。", "error");
        panel?.querySelector("[data-reference-value]")?.focus();
        return;
      }
      const button = panel.querySelector('[data-action="analyze-reference"]');
      if (button) {
        button.disabled = true;
        button.textContent = "解析中…";
      }
      setTimeout(() => {
        const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
        if (stepPanel) stepPanel.dataset.referenceReady = "true";
        const feedback = dynamicForm.querySelector("[data-reference-feedback]");
        if (feedback) {
          feedback.hidden = false;
          feedback.innerHTML = "<strong>解析完成</strong><span>已识别钩子机制、内容结构和表达节奏；参考商品事实不会进入目标文案。</span>";
        }
        if (button) {
          button.disabled = false;
          button.textContent = source === "text" ? "重新拆解" : "重新解析";
        }
        setFormFeedback("");
        showToast("参考内容解析完成");
      }, 420);
    }

    function refreshWordDuration(input) {
      const inputs = input ? [input] : [...dynamicForm.querySelectorAll("[data-word-count]")];
      inputs.forEach(wordInput => {
        const durationOutput = wordInput.closest(".field")?.querySelector("[data-duration]");
        if (!durationOutput) return;
        const seconds = Math.max(1, Math.round((Number(wordInput.value) || 0) / 4));
        durationOutput.textContent = seconds < 60
          ? `约 ${seconds} 秒`
          : `约 ${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
      });
    }

    function setAgentPicker(open) {
      agentPicker.classList.toggle("open", open);
      agentPillButton.setAttribute("aria-expanded", String(open));
      if (open) setModelPicker(false);
    }

    function selectAgent(card, open = false) {
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      agentCards.forEach(item => item.classList.remove("selected"));
      card.classList.add("selected");
      activeAgent = card.dataset.agent;
      activeType = card.dataset.type;
      agentPill.textContent = activeAgent;
      agentPillButton.classList.remove("required");
      agentOptions.forEach(option => {
        const selected = option.dataset.agentType === activeType;
        option.classList.toggle("selected", selected);
        option.querySelector(".agent-option-check").textContent = selected ? "✓" : "";
        option.setAttribute("aria-selected", String(selected));
      });
      promptInput.disabled = false;
      sendPromptButton.disabled = false;
      modalTitle.textContent = activeAgent;
      renderAgentForm(activeType);
      renderModelOptions(activeType);
      modelPicker.hidden = false;
      setAgentPicker(false);
      agentSelectionPending = false;
      if (open) openAgentTask();
    }

    function selectChat() {
      exitAgentTask();
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      agentCards.forEach(item => item.classList.remove("selected"));
      activeAgent = "聊天";
      activeType = "chat";
      agentSelectionPending = false;
      agentPill.textContent = "聊天";
      agentPillButton.classList.remove("required");
      agentOptions.forEach(option => {
        const selected = option.dataset.agentType === "chat";
        option.classList.toggle("selected", selected);
        option.querySelector(".agent-option-check").textContent = selected ? "✓" : "";
        option.setAttribute("aria-selected", String(selected));
      });
      promptInput.disabled = false;
      sendPromptButton.disabled = false;
      promptInput.placeholder = agentConfigs.chat.placeholder;
      renderModelOptions("chat");
      setModelPicker(false);
      modelPicker.hidden = true;
      setAgentPicker(false);
      modal.classList.remove("show");
    }

    agentCards.forEach(card => {
      card.addEventListener("click", () => selectAgent(card, true));
    });

    agentOptions.forEach(option => {
      option.addEventListener("click", () => {
        if (option.dataset.agentType === "chat") {
          selectChat();
          return;
        }
        const card = agentCards.find(item => item.dataset.type === option.dataset.agentType);
        if (card) selectAgent(card, true);
      });
    });

    function closeModal(commit = false) {
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      modal.classList.remove("show");
      if (agentSelectionPending && !commit) {
        agentSelectionPending = false;
        selectChat();
        return;
      }
      agentSelectionPending = false;
    }
    document.getElementById("closeModal").addEventListener("click", () => closeModal(false));
    document.getElementById("cancelModal").addEventListener("click", () => closeModal(false));
    modal.addEventListener("click", event => { if (event.target === modal) closeModal(false); });

    agentPillButton.addEventListener("click", event => {
      event.stopPropagation();
      setAgentPicker(!agentPicker.classList.contains("open"));
    });

    const chatOutput = document.getElementById("chatOutput");
    const conversationLocator = document.querySelector("#page-creation .conversation-locator");
    const emptyHero = document.getElementById("emptyHero");
    const promptInput = document.getElementById("promptInput");
    const composerWrap = document.querySelector("#page-creation .composer-wrap");
    const taskShell = document.getElementById("agentTaskShell");
    const taskFormHost = document.getElementById("taskFormHost");
    const taskFormScroll = document.getElementById("taskFormScroll");
    const taskResultHost = document.getElementById("taskResultHost");
    const taskFormActions = document.getElementById("taskFormActions");
    const taskActionButtons = document.getElementById("taskActionButtons");
    const taskActionNote = document.getElementById("taskActionNote");
    const taskStepper = document.getElementById("taskStepper");
    const taskChatLog = document.getElementById("taskChatLog");
    const taskComposerHost = document.getElementById("taskComposerHost");
    const taskRestartModal = document.getElementById("taskRestartModal");
    function personaPickerMarkup(context) {
      return `<div class="original-field full persona-select-field">
        <label>人群画像</label>
        <div class="persona-picker" data-persona-picker data-persona-context="${context}" data-persona-mode="manual">
          <div class="persona-source-switch" role="group" aria-label="人群画像来源">
            <button class="active" type="button" data-persona-source-mode="manual">自行输入</button>
            <button type="button" data-persona-source-mode="template">从模板库选择</button>
          </div>
          <div class="persona-template-select" data-persona-template-select hidden>
            <button class="persona-picker-trigger" type="button" data-persona-trigger><span data-persona-selected>搜索或选择人群画像</span><small>⌄</small></button>
            <div class="persona-picker-dropdown" data-persona-dropdown hidden>
              <input class="persona-picker-search" data-persona-search placeholder="搜索产品名称、画像名称或人群">
              <div class="persona-picker-options" data-persona-options></div>
            </div>
            <div class="persona-applied" data-persona-applied hidden><span></span><button type="button" data-persona-clear>改为自行输入</button></div>
          </div>
        </div>
      </div>`;
    }
    agentConfigs.original.intro = "基于产品事实、目标人群与内容设定，生成可直接用于千川短视频创作的多版本口播文案。";
    agentConfigs.original.process = "确认产品信息 → 设置开场、脚本类型、用户心理、长度与模型 → 生成文案 → 保存、转脚本或继续对话修改。";
    agentConfigs.original.form = `
      <div class="original-flow-form">
        <section class="original-step-panel" data-original-step="1" data-task-step="1">
          <div class="original-step-title">
            <div><h2>产品信息</h2><p>选择产品来源，并确认本次创作使用的产品事实、卖点和目标人群。</p></div>
            <div class="original-header-controls">
              <div class="source-switch" aria-label="产品信息来源">
                <button class="active" type="button" data-product-source="library">产品库</button>
                <button type="button" data-product-source="link">商品链接</button>
                <button type="button" data-product-source="manual">手工输入</button>
              </div>
              <div class="header-product-picker" data-product-source-panel="library"><select aria-label="选择产品" data-product-select data-required>${productOptions}</select></div>
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="product-source-inline">
            <div data-product-source-panel="link" hidden>
              <div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div>
            </div>
            <div data-product-source-panel="manual" hidden></div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>基础信息</strong><span>确定本次创作对象</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div>
              <div class="original-field"><label>品牌<span class="required-star">*</span></label><input list="originalBrandOptions" data-original-brand data-required value="轻净" placeholder="输入或搜索品牌"><datalist id="originalBrandOptions"><option value="轻净"><option value="净界"><option value="随行"><option value="其他品牌"></datalist></div>
              <div class="original-field"><label>类目<span class="required-star">*</span></label><input list="originalCategoryOptions" data-original-category data-required value="清洁电器" placeholder="输入或搜索类目"><datalist id="originalCategoryOptions"><option value="清洁电器"><option value="厨房电器"><option value="个护电器"><option value="生活电器"></datalist></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>卖点与信任体系</strong><span>规定文案能说什么、凭什么可信</span></div>
            <div class="original-group-fields">
              <div class="original-field full">
                <div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="core" data-limit="3">
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up" title="上移">↑</button><button type="button" data-point-action="down" title="下移">↓</button><button type="button" data-point-action="remove" title="删除">×</button></span></div>
                  <button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button>
                  <textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea>
                </div>
              </div>
              <div class="original-field full advanced-field" hidden>
                <div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="secondary" data-limit="3">
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div>
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div>
                  <button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button>
                  <textarea data-field="secondary" hidden>透明尘杯可拆卸水洗\n床垫、沙发和布艺均可使用</textarea>
                </div>
              </div>
              <div class="original-field advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">短视频带货</span><span class="choice-chip">直播间引流</span></div></div>
              <div class="original-field full"><label>营销策略</label><textarea data-field="marketing" placeholder="填写价格、优惠、赠品或活动信息；没有可留空">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden>
                <div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="trust" data-limit="5">
                  <div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div>
                  <button class="point-add" type="button" data-point-action="add">＋ 添加背书</button>
                  <textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>人群与表达策略</strong><span>确定文案对谁说、从什么问题切入</span></div>
            <div class="original-group-fields">
              ${personaPickerMarkup("original")}
              <div class="original-field full">
                <label>核心目标人群<span class="required-star">*</span></label>
                <div class="audience-selector">
                  <div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip active" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip active" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div>
                  <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
                  <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">18–23</span><span class="choice-chip active">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">50+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="age-custom" data-custom-age hidden><input type="number" min="18" max="80" value="25" data-age-min><span>至</span><input type="number" min="18" max="80" value="35" data-age-max></span></div></div>
                </div>
              </div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain" placeholder="一行一个人群核心痛点">孩子后背红疹反复，半夜痒醒哭闹
床单刚换，尘杯仍吸出毛发碎屑
宠物上床后，床褥清洁总停在表面</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div>
            </div>
          </div>
        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定口播的开场方式、内容结构、心理切口、长度和生成模型。</p></div></div>
          <div class="original-group">
            <div class="original-group-title"><strong>内容脚本设定</strong><span>控制本次文案的结构与产出规格</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>开场钩子偏好</label><div class="choice-row original-choices" data-single="hook" data-role="hook"><span class="choice-chip active">不限</span><span class="choice-chip">利益直给</span><span class="choice-chip">痛点冲突</span><span class="choice-chip">结果前置</span><span class="choice-chip">反常识</span><span class="choice-chip">价格冲击</span><span class="choice-chip">场景代入</span><span class="choice-chip">身份点名</span><span class="choice-chip">风险提醒</span><span class="choice-chip">数字清单</span><span class="choice-chip">悬念揭秘</span><span class="choice-chip">对比反差</span><span class="choice-chip">实测验证</span></div></div>
              <div class="original-field full"><label>脚本类型<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="script-type" data-role="script-type"><span class="choice-chip active">不限</span><span class="choice-chip">引发好奇类型</span><span class="choice-chip">痛点类型</span><span class="choice-chip">活动类型</span><span class="choice-chip">悬疑类型</span><span class="choice-chip">打感情类型</span><span class="choice-chip">对比类型</span><span class="choice-chip">种草类型</span><span class="choice-chip">网络爆款音频类型</span><span class="choice-chip">制造焦虑类型</span><span class="choice-chip">明星文案类型</span><span class="choice-chip">点名人群类型</span><span class="choice-chip">正话反说类型</span><span class="choice-chip">品牌类型</span></div></div>
              <div class="original-field full"><label>用户心理</label><select data-field="psychology"><option>不限</option><option>避坑心理—曝光常见误区</option><option>落后心理—制造同辈压力与紧迫感</option><option>择优心理—科学测评与对比榜单强化“最优解”</option><option>理想身份心理—绑定“精致精英”人设</option><option>制造悬念—揭秘式剧情激发好奇心理</option><option>反差心理—她经济影响他经济</option><option>礼赠心理—提供情绪价值打造社交货币属性</option></select></div>
              <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="180" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 45 秒</b></div></div>
              <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
              <div class="original-field full"><label>模型<span class="required-star">*</span></label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
            </div>
          </div>
        </section>
      </div>
    `;

    agentConfigs.copy.intro = "拆解参考爆款的有效创作方法，再结合当前产品事实重新生成原创千川口播文案。";
    agentConfigs.copy.process = "确认爆款参考与产品信息 → 设置字数、数量与模型 → 生成原创仿写文案 → 保存、转脚本或继续对话修改。";
    agentConfigs.copy.placeholder = "还可以补充：节奏再快一点，但不要沿用参考商品的价格和优惠表达……";
    agentConfigs.copy.form = `
      <div class="original-flow-form copy-flow-form">
        <section class="original-step-panel" data-original-step="1" data-task-step="1">
          <div class="original-step-title">
            <div><h2>爆款参考与产品信息</h2><p>先提供参考内容，再确认目标产品事实。系统只学习创作方法，不复制原文。</p></div>
            <div class="original-header-controls">
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="original-group copy-reference-group">
            <div class="original-group-title"><strong>爆款参考</strong><span>从视频库选择、上传视频或粘贴文案；仅学习结构，不复制原文</span></div>
            <div class="original-group-fields">
              <div class="original-field"><label>参考来源<span class="required-star">*</span></label><select data-reference-source data-required><option value="library">从视频库选择</option><option value="upload">上传视频</option><option value="text">粘贴文案</option></select></div>
              <div class="original-field" data-reference-panel="library">
                <label>参考视频<span class="required-star">*</span></label>
                <input type="hidden" data-reference-value data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-reference-library"><span data-reference-trigger-text>从视频库选择</span><b>›</b></button>
                <div class="selected-reference-video" data-selected-reference hidden></div>
              </div>
              <div class="original-field full" data-reference-panel="upload" hidden><label>上传参考视频<span class="required-star">*</span></label><div class="upload-box reference-upload" data-reference-upload><strong>点击选择或拖拽上传视频</strong><span>上传后自动识别口播文案、结构和表达节奏</span></div></div>
              <div class="original-field full" data-reference-panel="text" hidden><label>参考文案<span class="required-star">*</span></label><textarea data-reference-value data-required placeholder="粘贴需要参考的完整口播文案"></textarea></div>
              <div class="original-field full reference-transcript-editor" data-reference-transcript-editor hidden>
                <div class="reference-transcript-head"><label>识别文案<span class="required-star">*</span></label><button type="button" data-action="reset-reference-transcript">恢复识别原文</button></div>
                <textarea data-reference-transcript data-required placeholder="视频中的口播文案将在识别后显示，可直接修改"></textarea>
              </div>
              <div class="reference-video-picker full" data-reference-library hidden>
                <div class="reference-picker-head"><div><strong>选择参考视频</strong><span>历史投放素材和外部参考视频统一在视频库管理</span></div><button type="button" data-action="toggle-reference-library">×</button></div>
                <div class="reference-picker-tools"><input data-reference-search placeholder="搜索视频名称或素材 ID"><div class="choice-row" data-single="reference-filter"><span class="choice-chip active" data-reference-filter="all">全部</span><span class="choice-chip" data-reference-filter="history">历史投放</span><span class="choice-chip" data-reference-filter="external">外部参考</span></div></div>
                <div class="reference-video-list">
                  <button class="reference-video-option" type="button" data-reference-video="7553983811703193643" data-reference-source-type="history" data-reference-search-text="轻净pro除螨仪 结果冲击 高转化 7553983811703193643"><i>▶</i><span><strong>轻净 Pro 除螨仪｜结果冲击型</strong><small>历史投放 · 素材 ID 7553983811703193643 · 已有口播与拆解结果</small></span><em>选择</em></button>
                  <button class="reference-video-option" type="button" data-reference-video="7553983811703195018" data-reference-source-type="history" data-reference-search-text="净界洗地机 痛点直给 7553983811703195018"><i>▶</i><span><strong>净界洗地机｜痛点直给型</strong><small>历史投放 · 素材 ID 7553983811703195018 · 已有口播与拆解结果</small></span><em>选择</em></button>
                  <button class="reference-video-option" type="button" data-reference-video="external-mite-hook-01" data-reference-source-type="external" data-reference-search-text="清洁家电 结果钩子 外部参考 除螨"><i>▶</i><span><strong>清洁家电｜结果钩子参考</strong><small>外部参考 · 已完成拆解 · 仅用于创作方法学习</small></span><em>选择</em></button>
                </div>
              </div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title copy-basic-title">
              <div><strong>基础信息</strong><span>确定本次仿写对应的产品</span></div>
              <div class="copy-basic-controls">
                <div class="source-switch" aria-label="产品信息来源">
                  <button class="active" type="button" data-product-source="library">产品库</button>
                  <button type="button" data-product-source="link">商品链接</button>
                  <button type="button" data-product-source="manual">手工输入</button>
                </div>
                <div class="header-product-picker" data-product-source-panel="library"><select aria-label="选择产品" data-product-select data-required>${productOptions}</select></div>
              </div>
            </div>
            <div class="original-group-fields">
              <div class="product-source-inline full">
                <div data-product-source-panel="link" hidden><div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div></div>
                <div data-product-source-panel="manual" hidden></div>
              </div>
              <div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div>
              <div class="original-field"><label>品牌<span class="required-star">*</span></label><input list="copyBrandOptions" data-original-brand data-required value="轻净" placeholder="输入或搜索品牌"><datalist id="copyBrandOptions"><option value="轻净"><option value="净界"><option value="随行"><option value="其他品牌"></datalist></div>
              <div class="original-field"><label>类目<span class="required-star">*</span></label><input list="copyCategoryOptions" data-original-category data-required value="清洁电器" placeholder="输入或搜索类目"><datalist id="copyCategoryOptions"><option value="清洁电器"><option value="厨房电器"><option value="个护电器"><option value="生活电器"></datalist></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>卖点与信任体系</strong><span>所有对外表达均以当前产品信息为准</span></div>
            <div class="original-group-fields">
              <div class="original-field full">
                <div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div>
                <div class="point-editor" data-point-editor="core" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up" title="上移">↑</button><button type="button" data-point-action="down" title="下移">↓</button><button type="button" data-point-action="remove" title="删除">×</button></span></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea></div>
              </div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div><div class="point-editor" data-point-editor="secondary" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div><div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="secondary" hidden>透明尘杯可拆卸水洗\n床垫、沙发和布艺均可使用</textarea></div></div>
              <div class="original-field full advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field advanced-field" hidden><label>营销场景</label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">短视频带货</span><span class="choice-chip">直播间引流</span></div></div>
              <div class="original-field advanced-field" hidden><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前产品真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>人群与表达策略</strong><span>确定仿写内容最终对谁表达</span></div>
            <div class="original-group-fields">
              ${personaPickerMarkup("copy")}
              <div class="original-field full"><label>核心目标人群<span class="required-star">*</span></label><div class="audience-selector"><div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip active" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip active" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div><div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div><div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip active">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="custom-age-range" data-custom-age hidden><input type="number" min="1" max="99" value="25" data-age-min><i>至</i><input type="number" min="1" max="99" value="35" data-age-max></span></div></div></div></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain" placeholder="一行一个人群核心痛点">孩子后背红疹反复，半夜痒醒哭闹\n床单刚换，尘杯仍吸出毛发碎屑</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div>
            </div>
          </div>
        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定仿写文案的长度、生成数量和使用模型。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="120" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 30 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型<span class="required-star">*</span></label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
          </div></div>
        </section>
      </div>`;

    agentConfigs.rewrite.intro = "对已有文案做可控改写，只修改选定范围，未指定内容默认保持不变。";
    agentConfigs.rewrite.process = "确认原文与产品信息 → 选择改写方式、长度、数量和模型 → 生成多个改写版本 → 保存或继续对话修改。";
    agentConfigs.rewrite.placeholder = "还可以补充：第一句更硬、更短，正文卖点顺序不要改……";
    agentConfigs.rewrite.form = `
      <div class="original-flow-form rewrite-flow-form">
        <section class="original-step-panel" data-original-step="1" data-task-step="1">
          <div class="original-step-title">
            <div><h2>原文与产品信息</h2><p>选择待改写文案，并确认改写时允许使用的产品事实。</p></div>
            <div class="original-header-controls">
              <div class="header-product-picker"><select aria-label="选择产品" data-product-select data-required>${productOptions}</select></div>
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="original-group rewrite-source-group">
            <div class="original-group-title"><strong>原文信息</strong><span>从文案库选择或直接粘贴，原资产不会被覆盖</span></div>
            <div class="original-group-fields">
              <div class="original-field"><label>原文来源<span class="required-star">*</span></label><select data-rewrite-source data-required><option value="library">从文案库选择</option><option value="paste">粘贴文案</option></select></div>
              <div class="original-field" data-rewrite-library-field><label>选择文案<span class="required-star">*</span></label><select data-rewrite-library data-required><option value="mite-summer">除螨仪暑期投放文案</option><option value="mite-family">除螨仪家庭场景文案</option><option value="mite-pet">除螨仪养宠人群文案</option></select></div>
              <div class="original-field full"><label>待改写文案<span class="required-star">*</span></label><textarea data-rewrite-original data-field="sourceCopy" data-required>你家床垫真的洗干净了吗？轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑，清洁结果直接进入透明尘杯。床垫、沙发和布艺都能使用，用完尘杯还能拆下水洗。点击商品，先看实际使用效果。</textarea></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>基础信息</strong><span>确定本次改写对应的产品</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div>
              <div class="original-field"><label>品牌<span class="required-star">*</span></label><input data-original-brand data-required value="轻净"></div>
              <div class="original-field"><label>类目<span class="required-star">*</span></label><input data-original-category data-required value="清洁电器"></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>卖点与信任体系</strong><span>限定改写时可使用的产品信息</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div><div class="point-editor" data-point-editor="core" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up">↑</button><button type="button" data-point-action="down">↓</button><button type="button" data-point-action="remove">×</button></span></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea></div></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div><div class="point-editor" data-point-editor="secondary" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div><div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="secondary" hidden>透明尘杯可拆卸水洗\n床垫、沙发和布艺均可使用</textarea></div></div>
              <div class="original-field full advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁结果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">短视频带货</span><span class="choice-chip">直播间引流</span></div></div>
              <div class="original-field"><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>改写设置</h2><p>只修改选定范围，未指定的原文结构、事实、卖点顺序和 CTA 默认保持不变。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field full"><label>改写方式<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="rewrite-method" data-role="rewrite-method"><span class="choice-chip active" data-rewrite-method="hook">只换前 3 秒钩子</span><span class="choice-chip" data-rewrite-method="shorten">缩短文案</span><span class="choice-chip" data-rewrite-method="audience">更换目标人群</span><span class="choice-chip" data-rewrite-method="selling">卖点前置</span><span class="choice-chip" data-rewrite-method="style">调整表达风格</span><span class="choice-chip" data-rewrite-method="rephrase">保留结构重新表达</span></div></div>
            <div class="original-field full" data-rewrite-setting-host></div>
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="120" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 30 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型<span class="required-star">*</span></label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
          </div></div>
        </section>
      </div>`;

    const agentStepPlans = {
      original: ["产品信息", "生成设置", "AI生成文案"],
      copy: ["爆款参考与产品信息", "生成设置", "AI生成文案"],
      rewrite: ["原文与产品信息", "改写设置", "AI生成文案"],
      "image-main": ["产品信息", "竞品分析", "提示词确认", "生图设置", "图片生成"],
      "image-detail": ["产品信息", "竞品分析", "提示词确认", "生图设置", "图片生成"],
      script: ["文案信息", "脚本策略", "选择模型", "确认生成"],
      "script-copy": ["参考脚本", "重构策略", "选择模型", "确认生成"],
      mix: ["脚本与素材", "成片策略", "选择模型", "确认生成"],
      "video-create": ["创作方式", "镜头要求", "选择模型", "确认生成"]
    };
    const agentGreetings = {
      original: "我是智能文案 Agent。我会基于产品事实、目标人群和内容设定生成千川口播文案。请先确认左侧产品信息。",
      copy: "我是爆款文案仿写 Agent。我会保留参考内容的有效方法，再为你的产品重新创作。",
      rewrite: "我是智能改写 Agent。我会保留你指定的内容，按目标完成可控改写。",
      "image-main": "我是商品主图 Agent。我会根据产品图、卖点和投放用途生成可继续调整的商品主图。",
      "image-detail": "我是商品详情页 Agent。我会把产品卖点拆成有阅读顺序、可继续编辑的详情页图片模块。",
      script: "我是智能脚本 Agent。我会把已确认文案拆成可执行的结构化脚本与分镜。",
      "script-copy": "我是爆款脚本仿写 Agent。我会借鉴参考脚本的节奏与镜头逻辑，为当前产品重新设计。",
      mix: "我是智能混剪 Agent。我会依据脚本匹配素材，并标出需拍摄或建议视频创作的镜头。",
      "video-create": "我是视频创作 Agent。我会按你的创意描述生成所需产品镜头。"
    };
    let taskStep = 1;
    let taskCompleted = false;
    let taskEditing = false;
    let originalTaskAssetIds = [];
    let originalCopyTargetId = "";

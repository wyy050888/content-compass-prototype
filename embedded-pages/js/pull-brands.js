    /* 品牌库：列表、详情与增删改查 */
    const brandCatalog = {
      qingjing: { name:"轻净", foundedYear:"2020", intro:"面向精致家庭的专业清洁电器品牌，用可验证的清洁效果降低家庭清洁焦虑。", position:"家庭深层清洁专家", tone:"专业、直接、可信；少用文学化表达，强调真实使用结果。", forbidden:"行业第一\n绝对除螨\n永久有效\n全网最低价", logo:"轻", logoClass:"", products:12 },
      jingjie: { name:"净界", foundedYear:"2018", intro:"通过智能清洁科技缩短家务链路，让复杂地面清洁变得简单高效。", position:"智能地面清洁解决方案品牌", tone:"科技、高效、克制；优先解释功能与使用收益。", forbidden:"彻底无菌\n零噪音\n全网第一", logo:"净", logoClass:"green", products:8 },
      qingxiang: { name:"轻享", foundedYear:"2021", intro:"服务年轻家庭的轻量厨房电器品牌，让日常烹饪更直观、更轻松。", position:"年轻家庭轻量厨房电器品牌", tone:"轻松、亲切、生活化；避免制造过度焦虑。", forbidden:"绝对健康\n零油脂\n永久不粘", logo:"享", logoClass:"orange", products:10 }
    };
    let currentBrandId = "qingjing";
    let brandLogoReady = false;
    let newBrandLogoData = "";
    const brandCreateModal = document.getElementById("brandCreateModal");
    const brandGrid = document.getElementById("brandMarketGrid");
    const deleteEntityModal = document.getElementById("deleteEntityModal");
    let pendingEntityDelete = null;
    function closeCardMenus(except = null) {
      document.querySelectorAll(".card-menu-wrap.open").forEach(menu => { if (menu !== except) menu.classList.remove("open"); });
    }
    function renderBrandLogo(element, brand) {
      if (!element || !brand) return;
      element.innerHTML = brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo || brand.name.slice(0,1));
    }
    function closeEntityDelete() { deleteEntityModal?.classList.remove("show"); pendingEntityDelete = null; }
    function requestEntityDelete(type, id, element) {
      const item = type === "brand" ? brandCatalog[id] : productDetailData[id];
      if (!item) return;
      pendingEntityDelete = { type, id, element };
      document.getElementById("deleteEntityTitle").textContent = `删除${type === "brand" ? "品牌" : "产品"}“${item.name}”？`;
      document.getElementById("deleteEntityCopy").textContent = type === "brand"
        ? "删除后无法恢复，品牌关联产品及已生成内容资产不会被删除；关联产品将暂时失去品牌策略约束。"
        : "删除后无法恢复，产品关联的文案、图片、脚本和视频资产不会被删除。";
      deleteEntityModal?.classList.add("show");
    }
    document.querySelectorAll("[data-close-entity-delete]").forEach(button => button.addEventListener("click", closeEntityDelete));
    deleteEntityModal?.addEventListener("click", event => { if (event.target === deleteEntityModal) closeEntityDelete(); });
    document.getElementById("confirmEntityDelete")?.addEventListener("click", () => {
      if (!pendingEntityDelete) return closeEntityDelete();
      const { type, id, element } = pendingEntityDelete;
      if (type === "brand") {
        element?.remove();
        delete brandCatalog[id];
        if (document.getElementById("page-brand-detail")?.classList.contains("active")) switchPage("brands");
        showToast("品牌已删除，关联产品和内容资产已保留");
      } else {
        element?.remove();
        delete productDetailData[id];
        if (typeof productCatalog !== "undefined") delete productCatalog[id];
        if (document.getElementById("page-product-detail")?.classList.contains("active")) switchPage("products");
        showToast("产品已删除，关联内容资产已保留");
      }
      closeEntityDelete();
    });
    function setBrandDetail(id) {
      const brand = brandCatalog[id];
      if (!brand) return;
      currentBrandId = id;
      document.getElementById("brandDetailLogo").className = `brand-detail-logo ${brand.logoClass || ""}`;
      renderBrandLogo(document.getElementById("brandDetailLogo"), brand);
      renderBrandLogo(document.getElementById("brandLogoThumb"), brand);
      document.getElementById("brandDetailName").textContent = brand.name;
      document.getElementById("brandDetailIntro").textContent = brand.intro;
      document.querySelectorAll("#page-brand-detail [data-brand-field]").forEach(field => {
        const key = field.dataset.brandField;
        if (key === "logo") return;
        const value = brand[key] || "";
        const view = field.querySelector(".brand-value");
        const input = field.querySelector("input, textarea");
        if (view) view.textContent = value;
        if (input) input.value = value;
        field.classList.remove("is-editing");
        const edit = field.querySelector(".brand-field-edit");
        if (edit) edit.textContent = "编辑";
      });
      switchPage("brand-detail");
    }
    brandGrid?.addEventListener("click", event => {
      const card = event.target.closest("[data-brand-id]");
      if (!card) return;
      const menuTrigger = event.target.closest("[data-toggle-card-menu]");
      if (menuTrigger) {
        event.stopPropagation();
        const menu = menuTrigger.closest(".card-menu-wrap");
        const opening = !menu.classList.contains("open");
        closeCardMenus(menu);
        menu.classList.toggle("open", opening);
        return;
      }
      if (event.target.closest("[data-delete-brand]")) {
        event.stopPropagation();
        closeCardMenus();
        requestEntityDelete("brand", card.dataset.brandId, card);
        return;
      }
      setBrandDetail(card.dataset.brandId);
    });
    brandGrid?.addEventListener("keydown", event => { if (event.key === "Enter" && event.target.matches("[data-brand-id]")) setBrandDetail(event.target.dataset.brandId); });
    document.querySelectorAll("[data-back-brands]").forEach(button => button.addEventListener("click", () => switchPage("brands")));
    document.querySelector("[data-delete-current-brand]")?.addEventListener("click", () => requestEntityDelete("brand", currentBrandId, brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"]`)));
    document.querySelectorAll("[data-open-brand-create]").forEach(button => button.addEventListener("click", () => { brandLogoReady = false; newBrandLogoData = ""; document.getElementById("brandLogoCreateFile").value = ""; document.getElementById("brandLogoUpload").classList.remove("has-image"); document.getElementById("brandLogoUpload").textContent = "点击上传品牌 Logo"; brandCreateModal?.classList.add("show"); }));
    document.querySelectorAll("[data-close-brand-create]").forEach(button => button.addEventListener("click", () => brandCreateModal?.classList.remove("show")));
    document.getElementById("brandLogoUpload")?.addEventListener("click", () => document.getElementById("brandLogoCreateFile")?.click());
    document.getElementById("brandLogoCreateFile")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { newBrandLogoData = reader.result; brandLogoReady = true; document.getElementById("brandLogoUpload").classList.add("has-image"); document.getElementById("brandLogoUpload").textContent = `已选择：${file.name} · 点击可重新选择`; };
      reader.readAsDataURL(file);
    });
    const brandDetailLogoFile = document.getElementById("brandDetailLogoFile");
    document.querySelector("#page-brand-detail [data-brand-logo-upload]")?.addEventListener("click", () => brandDetailLogoFile?.click());
    brandDetailLogoFile?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file || !brandCatalog[currentBrandId]) return;
      const reader = new FileReader();
      reader.onload = () => {
        brandCatalog[currentBrandId].logoData = reader.result;
        renderBrandLogo(document.getElementById("brandDetailLogo"), brandCatalog[currentBrandId]);
        renderBrandLogo(document.getElementById("brandLogoThumb"), brandCatalog[currentBrandId]);
        const cardLogo = brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"] .brand-card-logo`);
        renderBrandLogo(cardLogo, brandCatalog[currentBrandId]);
        showToast("品牌 Logo 已替换");
      };
      reader.readAsDataURL(file);
    });
    document.querySelectorAll("#page-brand-detail .brand-field-edit").forEach(button => button.addEventListener("click", () => {
      const field = button.closest(".brand-field");
      if (field.dataset.brandField === "logo") { brandDetailLogoFile?.click(); return; }
      const editing = field.classList.toggle("is-editing");
      button.textContent = editing ? "完成" : "编辑";
      if (editing) { field.querySelector("input, textarea")?.focus(); return; }
      const key = field.dataset.brandField;
      if (key !== "logo") {
        const input = field.querySelector("input, textarea");
        const value = input?.value.trim() || "";
        if (key === "foundedYear" && value && (Number(value) < 1800 || Number(value) > 2026)) {
          field.classList.add("is-editing");
          button.textContent = "完成";
          input?.focus();
          showToast("品牌成立年份需填写 1800—2026 之间的年份");
          return;
        }
        field.querySelector(".brand-value").textContent = value;
        if (brandCatalog[currentBrandId]) brandCatalog[currentBrandId][key] = value;
        if (key === "name") document.getElementById("brandDetailName").textContent = value;
        if (key === "intro") document.getElementById("brandDetailIntro").textContent = value;
      }
      const card = brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"]`);
      if (card && brandCatalog[currentBrandId]) {
        card.querySelector("h3").textContent = brandCatalog[currentBrandId].name;
        card.querySelector(".brand-card-desc").textContent = brandCatalog[currentBrandId].intro;
      }
      showToast("品牌信息已保存，并同步至创作上下文");
    }));
    function createBrandCard(id, brand) {
      const card = document.createElement("article");
      card.className = "brand-market-card";
      card.tabIndex = 0;
      card.dataset.brandId = id;
      const tags = brand.tone.split(/[、，；;]/).map(item => item.trim()).filter(Boolean).slice(0,3);
      card.innerHTML = `<span class="card-menu-wrap"><button class="card-menu-trigger" type="button" data-toggle-card-menu aria-label="品牌操作">···</button><span class="card-action-menu" role="menu"><button type="button" data-delete-brand>删除</button></span></span><div class="brand-card-top"><div class="brand-card-logo">${brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo)}</div><div><h3>${escapeHtml(brand.name)}</h3><small>新建品牌</small></div></div><p class="brand-card-desc">${escapeHtml(brand.intro)}</p><div class="brand-card-tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div><div class="brand-card-foot"><span>关联产品 0</span><span>刚刚创建</span></div>`;
      return card;
    }
    document.getElementById("saveBrandEntry")?.addEventListener("click", () => {
      const name = document.getElementById("brandFormName")?.value.trim();
      const foundedYear = document.getElementById("brandFormFoundedYear")?.value.trim() || "";
      const intro = document.getElementById("brandFormIntro")?.value.trim();
      const position = document.getElementById("brandFormPosition")?.value.trim();
      const tone = document.getElementById("brandFormTone")?.value.trim();
      const forbidden = document.getElementById("brandFormForbidden")?.value.trim() || "";
      if (!brandLogoReady || !name || !intro || !position || !tone) return showToast("请补全标记 * 的品牌信息");
      if (foundedYear && (Number(foundedYear) < 1800 || Number(foundedYear) > 2026)) return showToast("品牌成立年份需填写 1800—2026 之间的年份");
      const id = `brand-${Date.now()}`;
      const brand = { name, foundedYear, intro, position, tone, forbidden, logo:name.slice(0,1), logoData:newBrandLogoData, logoClass:"", products:0 };
      brandCatalog[id] = brand;
      brandGrid?.append(createBrandCard(id, brand));
      brandCreateModal?.classList.remove("show");
      showToast("品牌已新增，可进入详情继续维护品牌策略");
    });
    document.getElementById("brandSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => card.hidden = !card.textContent.toLowerCase().includes(keyword));
    });

    const productCreateModal = document.getElementById("productCreateModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const productDetailData = {
      "mite-pro": { name: "轻净 Pro 除螨仪", brand: "轻净", category: "清洁电器", price: "¥399" },
      "air-a8": { name: "轻享空气炸锅 A8", brand: "轻享", category: "厨房电器", price: "¥299" },
      "washer-s5": { name: "净界洗地机 S5", brand: "净界", category: "清洁电器", price: "¥1,599" },
      "blend-mini": { name: "随行榨汁杯 Mini", brand: "轻享", category: "厨房电器", price: "¥169" }
    };
    let currentProductDetailId = "mite-pro";
    function toggleProductModal(modal, show) { modal?.classList.toggle("show", show); }
    document.querySelectorAll("[data-open-product-create]").forEach(button => button.addEventListener("click", () => toggleProductModal(productCreateModal, true)));
    document.querySelectorAll("[data-close-product-modal]").forEach(button => button.addEventListener("click", () => toggleProductModal(productCreateModal, false)));
    function openProductDetail(productId) {
      const detail = productDetailData[productId] || productDetailData["mite-pro"];
      currentProductDetailId = productDetailData[productId] ? productId : "mite-pro";
      document.getElementById("pageDetailName").textContent = detail.name;
      document.getElementById("pageDetailBrand").textContent = detail.brand;
      document.getElementById("pageDetailCategory").textContent = detail.category;
      document.getElementById("pageDetailPrice").textContent = detail.price;
      const compactFields = [...document.querySelectorAll("#page-product-detail .compact-kv")];
      const detailCurrency = detail.currencyCode || "CNY";
      [detail.name, detail.brand, detail.category, `${detail.price} ${detailCurrency}`].forEach((value, index) => {
        const field = compactFields[index];
        if (!field) return;
        const view = field.querySelector(".compact-value");
        const input = field.querySelector(".editable-editor input");
        if (view) view.textContent = value;
        if (input) input.value = index === 3 ? detail.price.replace(/[^\d.]/g, "") : value;
        if (index === 3) {
          const select = field.querySelector(".editable-editor select");
          if (select) select.value = detailCurrency;
        }
      });
      switchPage("product-detail");
    }
    document.getElementById("productMarketGrid")?.addEventListener("click", event => {
      const menuTrigger = event.target.closest("[data-toggle-card-menu]");
      if (menuTrigger) {
        event.preventDefault();
        event.stopPropagation();
        const menu = menuTrigger.closest(".card-menu-wrap");
        const opening = !menu.classList.contains("open");
        closeCardMenus(menu);
        menu.classList.toggle("open", opening);
        return;
      }
      const trigger = event.target.closest("[data-delete-product]");
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      closeCardMenus();
      const card = trigger.closest("[data-product-id]");
      if (card) requestEntityDelete("product", card.dataset.productId, card);
    }, true);
    document.querySelector("[data-delete-current-product]")?.addEventListener("click", () => requestEntityDelete("product", currentProductDetailId, document.querySelector(`#productMarketGrid [data-product-id="${currentProductDetailId}"]`)));
    document.querySelectorAll("[data-open-product-detail]").forEach(button => button.addEventListener("click", () => openProductDetail(button.dataset.productId)));
    document.querySelectorAll("[data-close-product-detail]").forEach(button => button.addEventListener("click", () => toggleProductModal(productDetailModal, false)));
    document.querySelectorAll("[data-product-create-mode]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-create-mode]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-create-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productCreatePanel === button.dataset.productCreateMode));
    }));
    document.querySelector("[data-product-upload]")?.addEventListener("click", event => { event.currentTarget.textContent = "已选择：产品主图_01.png · 点击可重新选择"; showToast("产品图片已添加"); });
    document.getElementById("addCategoryButton")?.addEventListener("click", () => document.getElementById("addCategoryInput").classList.toggle("show"));
    document.getElementById("confirmCategoryButton")?.addEventListener("click", () => {
      const input = document.querySelector("#addCategoryInput input");
      const name = input?.value.trim();
      if (!name) return showToast("请输入类目名称");
      const option = new Option(name, name, true, true);
      document.getElementById("productCategorySelect").add(option);
      input.value = "";
      document.getElementById("addCategoryInput").classList.remove("show");
      showToast(`已新增类目“${name}”`);
    });
    function makeParsingProductCard(name, productId, category = "商品解析中") {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "product-market-card is-parsing";
      card.dataset.productId = productId;
      card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${name}</strong></div><div class="product-parsing">正在解析产品信息</div><div class="product-market-assets"><span>品牌 · 价格 · 卖点</span><span>请稍候</span></div></div>`;
      card.addEventListener("click", () => showToast("产品信息正在解析中，完成后可查看详情"));
      setTimeout(() => {
        card.classList.remove("is-parsing");
        card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">厨房电器</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${name}</strong></div><div class="product-market-price"><small>¥</small>199</div><div class="product-market-assets"><span>文案 0 · 脚本 0</span><span>视频 0</span></div></div>`;
        productDetailData[productId] = { name, brand: "已识别品牌", category: "厨房电器", price: "¥199" };
        card.replaceWith(card.cloneNode(true));
        const readyCard = document.querySelector(`[data-product-id="${productId}"]`);
        readyCard?.addEventListener("click", () => openProductDetail(productId));
        showToast(`“${name}”解析完成，可进入详情补充信息`);
      }, 3600);
      return card;
    }
    document.getElementById("saveProductEntry")?.addEventListener("click", () => {
      const mode = document.querySelector("[data-product-create-mode].active")?.dataset.productCreateMode;
      const productGrid = document.getElementById("productMarketGrid");
      if (mode === "batch") {
        const links = document.querySelector("[data-product-create-panel='batch'] textarea")?.value.trim().split(/\n+/).filter(Boolean) || [];
        if (!links.length) return showToast("请至少输入一条商品链接");
        const count = Math.max(1, links.length);
        for (let index = 0; index < count; index += 1) productGrid.append(makeParsingProductCard(`新链接产品 ${index + 1}`, `parsing-product-${Date.now()}-${index}`));
        toggleProductModal(productCreateModal, false);
        showToast(`已新增 ${count} 个产品，正在解析产品信息`);
        return;
      }
      const manualPanel = document.querySelector("[data-product-create-panel='manual']");
      const manualInputs = [...manualPanel.querySelectorAll("input")];
      const name = manualInputs[0]?.value.trim();
      const brand = manualInputs[1]?.value.trim();
      const priceValue = manualPanel.querySelector(".price-field input")?.value.trim();
      const core = manualPanel.querySelector("textarea")?.value.trim();
      const hasImage = !manualPanel.querySelector("[data-product-upload]")?.textContent.includes("点击上传");
      if (!name || !brand || !priceValue || !core || !hasImage || !document.getElementById("productCategorySelect")?.value || document.getElementById("productCategorySelect")?.value === "请选择类目") return showToast("请补全标记 * 的产品信息");
      const id = `manual-product-${Date.now()}`;
      const price = priceValue;
      const currencySelect = document.getElementById("productCurrencySelect");
      const currencyCode = currencySelect?.value || "CNY";
      const currencySymbol = currencySelect?.selectedOptions[0]?.dataset.symbol || "¥";
      const category = document.getElementById("productCategorySelect")?.value || "未填写类目";
      const manualCard = document.createElement("button");
      manualCard.type = "button";
      manualCard.className = "product-market-card";
      manualCard.dataset.productId = id;
      manualCard.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${name}</strong></div><div class="product-market-price"><small>${currencySymbol}</small>${price}</div><div class="product-market-assets"><span>文案 0 · 脚本 0</span><span>视频 0</span></div></div>`;
      productDetailData[id] = { name, brand, category, price: `${currencySymbol}${price}`, currencyCode };
      manualCard.addEventListener("click", () => openProductDetail(id));
      productGrid.append(manualCard);
      toggleProductModal(productCreateModal, false);
      showToast("产品已新增，可进入详情继续补充信息");
    });
    const productSearch = document.querySelector("#page-products .product-page-actions .search");
    const productCategoryFilter = document.querySelector("#page-products .product-page-actions .filter-select");
    function filterProductCards() {
      const keyword = productSearch?.value.trim().toLowerCase() || "";
      const category = productCategoryFilter?.value || "全部类目";
      document.querySelectorAll("#productMarketGrid .product-market-card").forEach(card => {
        const text = card.textContent.toLowerCase();
        const visible = (!keyword || text.includes(keyword)) && (category === "全部类目" || text.includes(category));
        card.hidden = !visible;
      });
    }
    productSearch?.addEventListener("input", filterProductCards);
    productCategoryFilter?.addEventListener("change", filterProductCards);
    document.querySelectorAll("[data-relation-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-relation-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-relation-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.relationPanel === button.dataset.relationTab));
    }));
    document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.toast)));
    document.querySelectorAll("[data-open-product-creation]").forEach(button => button.addEventListener("click", () => { toggleProductModal(productDetailModal, false); switchPage("creation"); showToast("已带入当前产品，可选择 Agent 开始创作"); }));
    document.querySelectorAll("[data-back-products]").forEach(button => button.addEventListener("click", () => switchPage("products")));
    document.querySelectorAll("[data-save-product-detail]").forEach(button => button.addEventListener("click", () => showToast("产品信息已保存")));
    function createScenarioGroup(audience = "新增目标人群", scenes = []) {
      const group = document.createElement("article");
      group.className = "scenario-group";
      group.dataset.scenarioGroup = "";
      const tags = scenes.map(scene => `<span class="scenario-tag">${scene}</span>`).join("");
      group.innerHTML = `<div class="scenario-display"><div class="scenario-audience">${audience}</div><div class="scenario-tag-list">${tags || '<span class="scenario-tag">待补充场景</span>'}</div></div><div class="scenario-edit-form"><label>目标人群</label><input value="${audience}"><label>使用场景</label><textarea placeholder="一行一个使用场景">${scenes.join("\n")}</textarea></div><button class="scenario-edit-action" type="button" data-edit-scenario>编辑</button>`;
      bindScenarioGroup(group);
      return group;
    }
    function bindScenarioGroup(group) {
      const action = group.querySelector("[data-edit-scenario]");
      const audienceInput = group.querySelector(".scenario-edit-form input");
      const scenesInput = group.querySelector(".scenario-edit-form textarea");
      const renderDisplay = () => {
        group.querySelector(".scenario-audience").textContent = audienceInput.value.trim() || "未命名人群";
        const sceneNames = scenesInput.value.split(/\n+/).map(scene => scene.trim()).filter(Boolean);
        group.querySelector(".scenario-tag-list").innerHTML = sceneNames.length ? sceneNames.map(scene => `<span class="scenario-tag">${scene}</span>`).join("") : '<span class="scenario-tag">待补充场景</span>';
      };
      action.addEventListener("click", () => {
        const editing = group.classList.toggle("is-editing");
        action.textContent = editing ? "保存" : "编辑";
        if (editing) audienceInput.focus();
        else { renderDisplay(); showToast("人群与使用场景已保存"); }
      });
    }
    document.querySelectorAll("[data-scenario-group]").forEach(bindScenarioGroup);
    document.querySelectorAll("[data-add-scenario]").forEach(button => button.addEventListener("click", () => {
      const group = createScenarioGroup();
      button.previousElementSibling.append(group);
      group.classList.add("is-editing");
      group.querySelector("[data-edit-scenario]").textContent = "保存";
      group.querySelector(".scenario-edit-form input").focus();
      showToast("已新增一组人群与使用场景，请补充后保存");
    }));

    function prepareDetailEditable(container) {
      if (!container || container.dataset.editReady) return;
      const fields = container.matches(".field, .scenario-row") ? [container] : [...container.querySelectorAll(".field, .scenario-row")];
      fields.forEach(field => {
        if (field.dataset.editReady) return;
        field.dataset.editReady = "true";
        field.classList.add("detail-editable");
        const controls = [...field.querySelectorAll("input, textarea, select")];
        controls.forEach(control => {
          if (control.tagName === "SELECT") control.disabled = true;
          else control.readOnly = true;
        });
        const action = document.createElement("button");
        action.type = "button";
        action.className = "detail-edit-action";
        action.textContent = "编辑";
        action.addEventListener("click", () => {
          const editing = field.classList.toggle("is-editing");
          controls.forEach(control => {
            if (control.tagName === "SELECT") control.disabled = !editing;
            else control.readOnly = !editing;
          });
          action.textContent = editing ? "保存" : "编辑";
          if (!editing) showToast("修改已保存");
        });
        field.append(action);
      });
    }
    prepareDetailEditable(document.getElementById("page-product-detail"));

    const productCompetitorSamples = {
      "mite-pro": [
        { name:"追觅除螨仪 S20", source:"竞品库 · 自动同步", url:"https://www.douyin.com/", platform:"抖音", sales:"3.6万+", audience:"精致妈妈、养宠家庭", selling:"高频拍打；紫外线辅助；尘杯可视", scene:"床褥、沙发、宠物区", category:"清洁电器", updater:"自动获取", updatedAt:"10分钟前" },
        { name:"莱克吉米除螨仪 B703", source:"竞品库 · 链接解析", url:"https://www.jd.com/", platform:"京东", sales:"2.1万+", audience:"都市中产、精致妈妈", selling:"强拍打；热风除湿；低噪设计", scene:"卧室、儿童房、沙发", category:"清洁电器", updater:"嗡大发", updatedAt:"昨天 18:20" },
        { name:"苏泊尔除螨仪 VC6", source:"竞品库 · 自动同步", url:"https://www.tmall.com/", platform:"淘宝 / 天猫", sales:"1.8万+", audience:"新婚家庭、租房青年", selling:"轻量机身；双杯过滤；便捷拆洗", scene:"床垫、布艺沙发、毛绒玩具", category:"清洁电器", updater:"自动获取", updatedAt:"今天 09:12" }
      ],
      "air-a8": [
        { name:"美的空气炸锅 KZ45", source:"竞品库 · 自动同步", url:"https://www.jd.com/", platform:"京东", sales:"5.2万+", audience:"年轻家庭、精致妈妈", selling:"可视窗口；免翻面；低脂烹饪", scene:"家庭正餐、夜宵", category:"厨房电器", updater:"自动获取", updatedAt:"20分钟前" },
        { name:"九阳空气炸锅 KL55", source:"竞品库 · 链接解析", url:"https://www.douyin.com/", platform:"抖音", sales:"4.7万+", audience:"都市 GenZ、租房青年", selling:"大容量；智能菜单；易清洗", scene:"一人食、朋友聚会", category:"厨房电器", updater:"嗡大发", updatedAt:"昨天 16:40" }
      ],
      "washer-s5": [
        { name:"添可芙万 Stretch S", source:"竞品库 · 自动同步", url:"https://www.tmall.com/", platform:"淘宝 / 天猫", sales:"3.9万+", audience:"品质家庭、养宠家庭", selling:"躺平清洁；双向助力；热水洗", scene:"全屋硬地面、床底", category:"清洁电器", updater:"自动获取", updatedAt:"8分钟前" },
        { name:"追觅洗地机 H30", source:"竞品库 · 链接解析", url:"https://www.jd.com/", platform:"京东", sales:"2.8万+", audience:"都市中产、新婚家庭", selling:"高温洗烘；贴边清洁；大吸力", scene:"客厅、厨房、餐厅", category:"清洁电器", updater:"嗡大发", updatedAt:"今天 08:35" }
      ],
      "blend-mini": [
        { name:"摩飞便携榨汁杯 MR9800", source:"竞品库 · 自动同步", url:"https://www.douyin.com/", platform:"抖音", sales:"6.3万+", audience:"都市 GenZ、健身人群", selling:"无线便携；快速榨汁；杯盖直饮", scene:"通勤、健身、旅行", category:"个护小家电", updater:"自动获取", updatedAt:"15分钟前" },
        { name:"九阳随行榨汁杯 L3", source:"竞品库 · 链接解析", url:"https://www.tmall.com/", platform:"淘宝 / 天猫", sales:"3.1万+", audience:"学生、白领", selling:"轻量杯身；长续航；易拆洗", scene:"宿舍、办公室、户外", category:"个护小家电", updater:"嗡大发", updatedAt:"昨天 21:10" }
      ]
    };
    const productAssetTabs = document.querySelector("#page-product-detail .product-asset-tabs");
    if (productAssetTabs && !productAssetTabs.querySelector('[data-product-asset-tab="competitor"]')) {
      const competitorTab = document.createElement("button");
      competitorTab.type = "button";
      competitorTab.dataset.productAssetTab = "competitor";
      competitorTab.textContent = "竞品库";
      productAssetTabs.querySelector('[data-product-asset-tab="template"]')?.before(competitorTab);
      const competitorPanel = document.createElement("div");
      competitorPanel.className = "product-asset-panel";
      competitorPanel.dataset.productAssetPanel = "competitor";
      competitorPanel.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><div><strong style="font-size:15px">当前产品跨平台竞品</strong><div class="sync-hint" style="margin-top:4px">数据与资产库 · 竞品库同步，报告结构和操作保持一致</div></div><span class="badge" id="productRelatedCompetitorCount">0 个竞品</span></div><div class="competitor-table-shell" style="max-height:none;overflow:auto"><table class="competitor-library-table" style="min-width:1420px"><thead><tr><th>产品名称</th><th>产品素材</th><th>商品链接</th><th>平台</th><th>销量</th><th>人群</th><th>核心卖点</th><th>场景</th><th>一级类目</th><th>更新人</th><th>更新时间</th><th>操作</th></tr></thead><tbody id="productRelatedCompetitorBody"></tbody></table></div>';
      productAssetTabs.parentElement.append(competitorPanel);
    }
    function renderProductRelatedCompetitors(productId) {
      const body = document.getElementById("productRelatedCompetitorBody");
      if (!body) return;
      const product = productDetailData[productId] || productDetailData["mite-pro"];
      const rows = productCompetitorSamples[productId] || productCompetitorSamples["mite-pro"];
      body.innerHTML = rows.map(item => `<tr data-product-related-competitor data-name="${escapeHtml(item.name)}"><td class="competitor-product-cell"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.source)}</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-related-competitor-image>主图</button><button class="competitor-thumb detail" type="button" data-preview-related-competitor-image>详情</button></div></td><td><a class="competitor-source-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">查看原平台</a></td><td><span class="competitor-platform${competitorPlatformClass(item.platform)}">${escapeHtml(item.platform)}</span></td><td><strong>${escapeHtml(item.sales)}</strong></td><td class="competitor-cell-copy">${escapeHtml(item.audience)}</td><td class="competitor-cell-copy">${escapeHtml(item.selling)}</td><td class="competitor-cell-copy">${escapeHtml(item.scene)}</td><td class="competitor-category-path">${escapeHtml(item.category)}</td><td class="competitor-updater">${escapeHtml(item.updater)}</td><td class="competitor-updated-at">${escapeHtml(item.updatedAt)}</td><td><div class="competitor-actions"><button type="button" data-view-related-competitor-report>查看报告</button><button type="button" data-download-related-competitor-report>下载报告</button></div></td></tr>`).join("");
      document.getElementById("productRelatedCompetitorCount").textContent = `${rows.length} 个竞品 · ${product.category}`;
    }

    document.querySelectorAll("[data-product-asset-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-asset-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-asset-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productAssetPanel === button.dataset.productAssetTab));
      if (button.dataset.productAssetTab === "competitor") renderProductRelatedCompetitors(currentProductDetailId);
    }));
    document.querySelectorAll("[data-template-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-template-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-template-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.templatePanel === button.dataset.templateTab));
    }));

    function surfaceEditorValue(surface) {
      const priceField = surface.querySelector(".editable-editor .price-field");
      if (priceField) {
        const amount = priceField.querySelector("input")?.value.trim() || "0";
        const select = priceField.querySelector("select");
        const symbol = select?.selectedOptions[0]?.dataset.symbol || "¥";
        return `${symbol}${amount} ${select?.value || "CNY"}`;
      }
      const editor = surface.querySelector(".editable-editor input, .editable-editor textarea");
      return editor ? editor.value : "";
    }
    function syncEditableSurface(surface) {
      const value = surfaceEditorValue(surface);
      const view = surface.querySelector(".editable-view");
      if (!view) return;
      if (view.classList.contains("bullet-list")) {
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        view.innerHTML = lines.map(line => `<li>${escapeHtml(line)}</li>`).join("");
        const count = surface.querySelector(".multi-info-head small");
        if (count) count.textContent = lines.length;
      } else if (view.classList.contains("description-lines")) {
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        view.innerHTML = lines.map(line => {
          const splitAt = line.search(/[：:]/);
          const label = splitAt > -1 ? line.slice(0, splitAt) : "补充信息";
          const content = splitAt > -1 ? line.slice(splitAt + 1).trim() : line;
          return `<span><b>${escapeHtml(label)}</b>${escapeHtml(content)}</span>`;
        }).join("");
      } else {
        view.textContent = value;
      }
      if (surface.classList.contains("compact-kv")) {
        const label = surface.querySelector(":scope > label")?.textContent.trim();
        const targetId = label === "产品名称" ? "pageDetailName" : label === "品牌" ? "pageDetailBrand" : label === "类目" ? "pageDetailCategory" : label === "价格" ? "pageDetailPrice" : "";
        if (targetId) document.getElementById(targetId).textContent = label === "价格" ? value.replace(/\s+[A-Z]{3}$/i, "") : value;
      }
    }
    document.querySelectorAll("#page-product-detail [data-inline-edit]").forEach(button => button.addEventListener("click", () => {
      const surface = button.closest(".editable-surface");
      if (!surface) return;
      const editing = surface.classList.toggle("is-editing");
      button.textContent = editing ? "完成" : "编辑";
      if (editing) {
        surface.dataset.originalValue = surfaceEditorValue(surface);
        const select = surface.querySelector(".editable-editor select");
        if (select) surface.dataset.originalSelect = select.value;
        surface.querySelector(".editable-editor input, .editable-editor textarea")?.focus();
      } else {
        syncEditableSurface(surface);
        showToast("修改已保存，并同步至对应资产库");
      }
    }));
    document.querySelectorAll("#page-product-detail [data-cancel-inline]").forEach(button => button.addEventListener("click", () => {
      const surface = button.closest(".editable-surface");
      if (!surface) return;
      const editor = surface.querySelector(".editable-editor input, .editable-editor textarea");
      const priceField = surface.querySelector(".editable-editor .price-field");
      if (editor && surface.dataset.originalValue !== undefined) {
        editor.value = priceField ? surface.dataset.originalValue.replace(/^\D*|\s+[A-Z]{3}$/g, "") : surface.dataset.originalValue;
      }
      const select = surface.querySelector(".editable-editor select");
      if (select && surface.dataset.originalSelect) select.value = surface.dataset.originalSelect;
      surface.classList.remove("is-editing");
      const edit = surface.querySelector("[data-inline-edit]");
      if (edit) edit.textContent = "编辑";
    }));
    document.querySelectorAll("#page-product-detail [data-toggle-asset-edit]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-inline-asset]");
      if (!card) return;
      if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
      const editing = card.classList.toggle("is-editing");
      button.textContent = editing ? "收起编辑" : button.dataset.defaultText;
    }));
    function inlineAssetValue(line) {
      const splitAt = line.search(/[：:]/);
      return (splitAt > -1 ? line.slice(splitAt + 1) : line).trim();
    }
    function syncInlineAsset(card) {
      const editor = card.querySelector(".asset-inline-editor textarea");
      if (!editor) return;
      const lines = editor.value.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const imageCopy = card.querySelector(".asset-image-preview .preview-copy");
      if (imageCopy) {
        const title = inlineAssetValue(lines[0] || "未命名图片");
        const subtitle = inlineAssetValue(lines[1] || "");
        imageCopy.innerHTML = `${escapeHtml(title)}${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}`;
      }
      const materialCaption = card.classList.contains("material-card") ? card.querySelector(".video-caption") : null;
      if (materialCaption && lines[0]) materialCaption.textContent = inlineAssetValue(lines[0]);
      const scriptRows = [...card.querySelectorAll(".script-row:not(.header)")];
      if (scriptRows.length) {
        lines.slice(0, scriptRows.length).forEach((line, index) => {
          const parts = line.split("｜");
          const cells = scriptRows[index].children;
          if (cells[0] && parts[0]) cells[0].textContent = parts[0].trim();
          if (cells[1] && parts[1]) cells[1].textContent = inlineAssetValue(parts[1]);
          if (cells[2] && parts[2]) cells[2].textContent = inlineAssetValue(parts[2]);
        });
      }
      const videoTitle = card.querySelector(".asset-content-head strong");
      const videoCaption = card.querySelector(".video-stage .video-caption");
      if (videoTitle && videoCaption && !card.classList.contains("material-card") && !scriptRows.length) {
        if (lines[0]) videoTitle.textContent = inlineAssetValue(lines[0]);
        if (lines[1]) videoCaption.textContent = inlineAssetValue(lines[1]);
      }
    }
    document.querySelectorAll("#page-product-detail [data-save-asset]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-inline-asset]");
      if (card) syncInlineAsset(card);
      card?.classList.remove("is-editing");
      const edit = card?.querySelector("[data-toggle-asset-edit]");
      if (edit) edit.textContent = edit.dataset.defaultText || "编辑";
      showToast("资产修改已保存，并同步至对应资产库");
    }));

    const productDescription = document.getElementById("productDescription");
    const productDescriptionSource = document.getElementById("productDescriptionSource");
    const descriptionParamList = document.getElementById("descriptionParamList");
    let originalDescription = productDescriptionSource?.value || "";
    function addDescriptionParamRow(name = "", value = "") {
      const row = document.createElement("div");
      row.className = "description-param-row";
      row.innerHTML = `<input aria-label="参数名称" placeholder="参数名称" value="${escapeHtml(name)}"><input aria-label="参数值" placeholder="参数值" value="${escapeHtml(value)}"><button type="button" data-remove-description-param aria-label="删除参数">×</button>`;
      descriptionParamList.append(row);
    }
    function parseDescriptionText() {
      descriptionParamList.innerHTML = "";
      const lines = productDescriptionSource.value.split(/\n+/).map(line => line.trim()).filter(Boolean);
      lines.forEach(line => {
        const splitAt = line.search(/[：:]/);
        addDescriptionParamRow(splitAt > -1 ? line.slice(0, splitAt).trim() : "补充信息", splitAt > -1 ? line.slice(splitAt + 1).trim() : line);
      });
      if (!lines.length) addDescriptionParamRow();
    }
    document.getElementById("editDescription")?.addEventListener("click", event => {
      const editing = productDescription.classList.toggle("is-editing");
      event.currentTarget.textContent = editing ? "完成" : "编辑";
      productDescriptionSource.readOnly = !editing;
      if (editing) {
        originalDescription = productDescriptionSource.value;
        parseDescriptionText();
        productDescriptionSource.focus();
      } else {
        const rows = [...descriptionParamList.querySelectorAll(".description-param-row")];
        productDescriptionSource.value = rows.map(row => {
          const inputs = row.querySelectorAll("input");
          return inputs[0].value.trim() && inputs[1].value.trim() ? `${inputs[0].value.trim()}：${inputs[1].value.trim()}` : "";
        }).filter(Boolean).join("\n");
        showToast("商品描述已保存，并同步至创作上下文");
      }
    });
    document.getElementById("cancelDescriptionEdit")?.addEventListener("click", () => {
      productDescriptionSource.value = originalDescription;
      productDescriptionSource.readOnly = true;
      productDescription.classList.remove("is-editing");
      document.getElementById("editDescription").textContent = "编辑";
    });
    document.getElementById("parseDescription")?.addEventListener("click", () => { parseDescriptionText(); showToast("已重新解析商品参数"); });
    document.getElementById("addDescriptionParam")?.addEventListener("click", () => {
      addDescriptionParamRow();
      descriptionParamList.lastElementChild?.querySelector("input")?.focus();
    });
    descriptionParamList?.addEventListener("click", event => {
      const remove = event.target.closest("[data-remove-description-param]");
      if (remove) remove.closest(".description-param-row")?.remove();
    });

    document.querySelectorAll("[data-prompt-agent]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-prompt-agent]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-prompt-agent-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.promptAgentPanel === button.dataset.promptAgent));
    }));

    const imageZoomModal = document.getElementById("imageZoomModal");
    const imageZoomHost = document.getElementById("imageZoomHost");
    document.querySelectorAll("[data-image-zoom]").forEach(preview => preview.addEventListener("click", () => {
      imageZoomHost.innerHTML = "";
      const copy = preview.cloneNode(true);
      copy.removeAttribute("data-image-zoom");
      imageZoomHost.append(copy);
      document.getElementById("imageZoomTitle").textContent = preview.closest(".asset-content-card")?.querySelector(".asset-content-head strong")?.textContent || "图片预览";
      imageZoomModal.classList.add("show");
    }));
    document.getElementById("closeImageZoom")?.addEventListener("click", () => imageZoomModal.classList.remove("show"));
    imageZoomModal?.addEventListener("click", event => { if (event.target === imageZoomModal) imageZoomModal.classList.remove("show"); });

    document.querySelectorAll(".video-more-button").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const wrap = button.closest(".video-more-wrap");
      document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.toggle("open", item === wrap && !item.classList.contains("open")));
    }));
    document.querySelectorAll("[data-open-video-analysis]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.remove("open"));
      switchPage("pull");
      showToast("已进入该素材的视频分析详情");
    }));

    const sessionList = document.querySelector("#page-creation .chat-list");
    const sessionDeleteModal = document.getElementById("sessionDeleteModal");
    let pendingDeleteSession = null;
    function sessionMenuMarkup() {
      return '<button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>';
    }
    function createSessionSummaryRow(title) {
      sessionList.querySelectorAll(".chat-row").forEach(row => row.classList.remove("active", "menu-open"));
      const row = document.createElement("div");
      row.className = "chat-row active";
      row.innerHTML = `<strong>${escapeHtml(title)}</strong>${sessionMenuMarkup()}`;
      sessionList.prepend(row);
      return row;
    }
    function closeSessionMenus(except = null) {
      sessionList.querySelectorAll(".chat-row.menu-open").forEach(row => {
        if (row !== except) row.classList.remove("menu-open");
      });
    }
    function startSessionRename(row) {
      const title = row.querySelector("strong");
      if (!title || title.isContentEditable) return;
      row.classList.remove("menu-open");
      const original = title.textContent;
      title.contentEditable = "true";
      title.classList.add("session-title-editing");
      let finished = false;
      const finish = save => {
        if (finished) return;
        finished = true;
        const nextTitle = title.textContent.trim();
        if (save && nextTitle) {
          title.textContent = nextTitle;
          if (row.classList.contains("active")) syncTaskChatTitle();
          showToast("会话已重命名");
        } else {
          title.textContent = original;
        }
        title.contentEditable = "false";
        title.classList.remove("session-title-editing");
      };
      title.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); finish(true); }
        if (event.key === "Escape") { event.preventDefault(); finish(false); }
      });
      title.addEventListener("blur", () => finish(true), { once:true });
      title.focus();
      const range = document.createRange();
      range.selectNodeContents(title);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    sessionList?.addEventListener("click", event => {
      const row = event.target.closest(".chat-row");
      if (!row) return;
      if (event.target.closest(".session-more")) {
        event.stopPropagation();
        const opening = !row.classList.contains("menu-open");
        closeSessionMenus(row);
        row.classList.toggle("menu-open", opening);
        return;
      }
      if (event.target.closest("[data-session-rename]")) {
        event.stopPropagation();
        startSessionRename(row);
        return;
      }
      if (event.target.closest("[data-session-delete]")) {
        event.stopPropagation();
        pendingDeleteSession = row;
        row.classList.remove("menu-open");
        document.getElementById("sessionDeleteName").textContent = row.querySelector("strong")?.textContent || "当前会话";
        sessionDeleteModal.classList.add("show");
        return;
      }
      if (!event.target.closest("input") && !event.target.closest('[contenteditable="true"]')) {
        sessionList.querySelectorAll(".chat-row").forEach(item => item.classList.toggle("active", item === row));
        syncTaskChatTitle();
        showToast(`已切换到“${row.querySelector("strong")?.textContent || "创作会话"}”`);
      }
    });
    function closeSessionDeleteModal() {
      sessionDeleteModal.classList.remove("show");
      pendingDeleteSession = null;
    }
    document.getElementById("closeSessionDelete")?.addEventListener("click", closeSessionDeleteModal);
    document.getElementById("cancelSessionDelete")?.addEventListener("click", closeSessionDeleteModal);
    sessionDeleteModal?.addEventListener("click", event => { if (event.target === sessionDeleteModal) closeSessionDeleteModal(); });
    document.getElementById("confirmSessionDelete")?.addEventListener("click", () => {
      if (!pendingDeleteSession) return closeSessionDeleteModal();
      const wasActive = pendingDeleteSession.classList.contains("active");
      pendingDeleteSession.remove();
      if (wasActive) sessionList.querySelector(".chat-row")?.classList.add("active");
      if (wasActive) syncTaskChatTitle();
      closeSessionDeleteModal();
      showToast("会话已删除");
    });

    const productCreationPicker = document.getElementById("productCreationPicker");
    document.getElementById("productCreationTrigger")?.addEventListener("click", () => productCreationPicker.classList.toggle("open"));
    document.querySelectorAll("[data-product-agent]").forEach(button => button.addEventListener("click", () => {
      const card = agentCards.find(item => item.dataset.type === button.dataset.productAgent);
      productCreationPicker.classList.remove("open");
      if (!card) return;
      switchPage("creation");
      selectAgent(card, true);
      showToast(`已带入当前产品，使用${card.dataset.agent}开始创作`);
    }));
    document.addEventListener("click", event => {
      if (productCreationPicker && !productCreationPicker.contains(event.target)) productCreationPicker.classList.remove("open");
      if (!event.target.closest(".card-menu-wrap")) closeCardMenus();
      if (!event.target.closest(".chat-row")) closeSessionMenus();
      if (!event.target.closest(".video-more-wrap")) document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.remove("open"));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeModal();
        toggleProductModal(productCreateModal, false);
        toggleProductModal(productDetailModal, false);
        imageZoomModal?.classList.remove("show");
        sessionDeleteModal?.classList.remove("show");
        setAssetPanel(false);
        setAgentPicker(false);
        setModelPicker(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (document.activeElement === promptInput) document.getElementById("sendPrompt").click();
      }
    });

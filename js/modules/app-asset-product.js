    const productCreateModal = document.getElementById("productCreateModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const productPlatforms = ["抖音", "快手", "视频号", "小红书", "百度", "天猫", "京东", "拼多多"];
    const productDetailData = {
      "mite-pro": { id:"mite-pro", name:"轻净 Pro 除螨仪", brand:"轻净", category:"清洁电器", price:"¥399", currencyCode:"CNY", links:[{ platform:"抖音", url:"https://shop.example.com/mite-pro" },{ platform:"天猫", url:"https://tmall.example.com/mite-pro" }], description:"产品型号：QJ-CM01\n额定功率：400W\n尘杯容量：0.5L\n产品净重：1.42kg\n产品尺寸：268×198×142mm\n电源方式：有线 220V\n包装清单：主机、滤芯×2、说明书\n售后说明：整机质保 1 年", core:"12kPa 大吸力深入床褥纤维\n高频拍打与吸尘同步完成\n透明尘杯让清洁效果可视化\n双层过滤，减少二次扬尘", secondary:"床褥、抱枕和毛绒玩具均可使用\n电源线满足卧室日常清洁范围\n收纳体积小，不占家庭空间", difference:"清洁结果可直接在透明尘杯中看到\n拍、吸、滤一体完成深层清洁\n围绕家庭高频软装场景设计", trust:"整机质保 1 年，售后信息可追溯\n产品参数及包装清单均可核验\n官方渠道销售，支持正品验证\n透明尘杯可直接展示清洁结果\n核心功能均有实拍素材证明", trustAttachments:[{ id:"trust-warranty", name:"整机质保服务说明.pdf", size:1887437, mimeType:"application/pdf", uploadedAt:"08-12 15:20", status:"ready", sample:true },{ id:"trust-spec", name:"产品参数与包装清单.xlsx", size:401408, mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploadedAt:"08-11 10:30", status:"ready", sample:true }], forbidden:"百分百除螨、彻底杀灭\n全网最低价、史上最低\n未经资质支持的除菌率\n永久有效、一次使用终身无螨\n无法证明的竞品对比结论" },
      "air-a8": { id:"air-a8", name:"轻享空气炸锅 A8", brand:"轻享", category:"厨房电器", price:"¥299", currencyCode:"CNY", links:[{ platform:"抖音", url:"https://shop.example.com/air-a8" }], description:"产品型号：A8\n容量：5L\n控制方式：触控\n可视窗口：支持", core:"可视化烹饪窗口\n大容量满足家庭用餐", secondary:"炸篮可拆卸清洗", difference:"烹饪过程看得见，减少反复开盖", trust:"产品参数及包装清单可核验", forbidden:"零油脂\n绝对健康" },
      "washer-s5": { id:"washer-s5", name:"净界洗地机 S5", brand:"净界", category:"清洁电器", price:"¥1,599", currencyCode:"CNY", links:[{ platform:"天猫", url:"https://shop.example.com/washer-s5" }], description:"产品型号：S5\n清洁方式：吸拖洗一体\n滚刷：支持自清洁", core:"吸拖洗一体\n干湿垃圾同步处理", secondary:"滚刷自清洁", difference:"一次推进完成复杂地面清洁", trust:"官方渠道销售，售后信息可追溯", forbidden:"彻底无菌\n零噪音" },
      "blend-mini": { id:"blend-mini", name:"随行榨汁杯 Mini", brand:"轻享", category:"厨房电器", price:"¥169", currencyCode:"CNY", links:[{ platform:"拼多多", url:"https://shop.example.com/blend-mini" }], description:"容量：350ml\n充电方式：USB-C\n杯体材质：食品接触级材质", core:"便携榨汁\n一键清洗", secondary:"轻巧杯身便于携带", difference:"杯体与主机一体化设计", trust:"材质及产品参数可核验", forbidden:"绝对无菌\n永久锋利" }
    };
    const trustAttachmentMaxBytes = 50 * 1024 * 1024;
    let currentProductDetailId = "mite-pro";
    let productCreateTrustAttachments = [];
    function toggleProductModal(modal, show) { modal?.classList.toggle("show", show); }
    function detectProductPlatform(url = "") {
      const value = String(url).toLowerCase();
      if (/douyin|jinritemai|抖音/.test(value)) return "抖音";
      if (/kuaishou|快手/.test(value)) return "快手";
      if (/weixin|wechat|channels|视频号/.test(value)) return "视频号";
      if (/xiaohongshu|xhslink|小红书/.test(value)) return "小红书";
      if (/baidu|百度/.test(value)) return "百度";
      if (/tmall|taobao|天猫/.test(value)) return "天猫";
      if (/jd\.com|jingdong|京东/.test(value)) return "京东";
      if (/pinduoduo|yangkeduo|拼多多/.test(value)) return "拼多多";
      return productPlatforms[0];
    }
    function productLinksOf(product) {
      if (Array.isArray(product?.links)) return product.links;
      return product?.link ? [{ platform:detectProductPlatform(product.link), url:product.link }] : [];
    }
    function syncProductToCreationSelectors(id, name) {
      document.querySelectorAll("select[data-product-select], select[data-product-library]").forEach(select => {
        if (![...select.options].some(option => option.value === id)) select.append(new Option(name, id));
      });
    }
    function platformOptionsMarkup(selected = "") {
      return productPlatforms.map(name => `<option${name === selected ? " selected" : ""}>${escapeHtml(name)}</option>`).join("");
    }
    function createProductLinkRow(container, link = {}) {
      if (!container) return null;
      const row = document.createElement("div");
      row.className = "product-link-row";
      row.innerHTML = `<select aria-label="商品平台">${platformOptionsMarkup(link.platform || productPlatforms[0])}</select><input type="url" aria-label="商品链接" placeholder="粘贴商品链接" value="${escapeHtml(link.url || "")}"><button class="product-link-remove" type="button" aria-label="删除链接">×</button>`;
      row.querySelector(".product-link-remove").addEventListener("click", () => row.remove());
      container.append(row);
      return row;
    }
    function readProductLinkRows(container) {
      const rows = [...(container?.querySelectorAll(".product-link-row") || [])].map(row => ({ platform:row.querySelector("select")?.value.trim() || "", url:row.querySelector("input")?.value.trim() || "" }));
      const incomplete = rows.some(item => (item.platform || item.url) && !(item.platform && item.url));
      const links = rows.filter(item => item.platform && item.url);
      const invalid = links.some(item => !/^https?:\/\/\S+$/i.test(item.url));
      const duplicate = links.some((item, index) => links.findIndex(other => other.url.toLowerCase() === item.url.toLowerCase()) !== index);
      return { links, incomplete, invalid, duplicate };
    }
    function trustAttachmentsOf(product) {
      if (!product) return [];
      if (!Array.isArray(product.trustAttachments)) product.trustAttachments = [];
      return product.trustAttachments;
    }
    function trustAttachmentExtension(attachment = {}) {
      const extension = String(attachment.name || "").split(".").pop()?.trim().toUpperCase();
      return extension && extension.length <= 8 ? extension : "FILE";
    }
    function trustAttachmentSize(bytes = 0) {
      const value = Number(bytes) || 0;
      if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(value >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
      return `${Math.max(1, Math.round(value / 1024))} KB`;
    }
    function trustAttachmentIsPreviewable(attachment = {}) {
      const type = String(attachment.mimeType || "").toLowerCase();
      return /^(image|video|audio|text)\//.test(type) || type === "application/pdf" || trustAttachmentExtension(attachment) === "PDF";
    }
    function trustAttachmentCollection(scope) {
      return scope === "create" ? productCreateTrustAttachments : trustAttachmentsOf(productDetailData[currentProductDetailId]);
    }
    function trustAttachmentListMarkup(attachments, scope) {
      if (!attachments.length) return '<div class="trust-attachment-empty">暂无背书附件，上传后将作为产品事实的佐证材料。</div>';
      return attachments.map(attachment => {
        return `<article class="trust-attachment-row${attachment.status === "uploading" ? " is-uploading" : ""}"><span class="trust-attachment-icon">${escapeHtml(trustAttachmentExtension(attachment))}</span><div class="trust-attachment-file"><strong title="${escapeHtml(attachment.name)}">${escapeHtml(attachment.name)}</strong><span>${trustAttachmentSize(attachment.size)} · ${attachment.uploadedAt || "刚刚"}</span></div><div class="trust-attachment-actions"><button type="button" data-trust-attachment-action="open" data-trust-attachment-scope="${scope}" data-trust-attachment-id="${escapeHtml(attachment.id)}">预览</button><button class="trust-attachment-remove" type="button" data-trust-attachment-action="remove" data-trust-attachment-scope="${scope}" data-trust-attachment-id="${escapeHtml(attachment.id)}">删除</button></div></article>`;
      }).join("");
    }
    function renderProductTrustAttachments(detail = productDetailData[currentProductDetailId]) {
      const attachments = trustAttachmentsOf(detail);
      const list = document.getElementById("productTrustAttachmentList");
      const count = document.getElementById("productTrustAttachmentCount");
      if (list) list.innerHTML = trustAttachmentListMarkup(attachments, "detail");
      if (count) count.textContent = attachments.length;
    }
    function renderProductCreateTrustAttachments() {
      const list = document.getElementById("productCreateTrustAttachmentList");
      const count = document.getElementById("productCreateTrustAttachmentCount");
      if (list) list.innerHTML = trustAttachmentListMarkup(productCreateTrustAttachments, "create");
      if (count) count.textContent = productCreateTrustAttachments.length;
    }
    function releaseTrustAttachmentUrls(attachments = []) {
      attachments.forEach(attachment => { if (attachment.objectUrl) URL.revokeObjectURL(attachment.objectUrl); });
    }
    function addTrustAttachments(files, scope) {
      const collection = trustAttachmentCollection(scope);
      const rejected = [];
      const additions = Array.from(files || []).filter(file => {
        if (file.size > trustAttachmentMaxBytes) { rejected.push(file.name); return false; }
        if (collection.some(item => item.name === file.name && Number(item.size) === Number(file.size))) { rejected.push(`${file.name}（重复）`); return false; }
        return true;
      }).map(file => ({ id:`trust-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name:file.name, size:file.size, mimeType:file.type || "", uploadedAt:"刚刚", status:"uploading", file, objectUrl:URL.createObjectURL(file) }));
      if (rejected.length) showToast(`已跳过 ${rejected.length} 个文件：单个文件最大 50 MB，且不重复添加`);
      if (!additions.length) return;
      collection.push(...additions);
      scope === "create" ? renderProductCreateTrustAttachments() : renderProductTrustAttachments();
      window.setTimeout(() => {
        additions.forEach(item => { item.status = "ready"; });
        scope === "create" ? renderProductCreateTrustAttachments() : renderProductTrustAttachments();
        showToast(`已上传 ${additions.length} 份背书附件`);
      }, 480);
    }
    function openTrustAttachment(attachment) {
      const previewWindow = window.open("", "_blank");
      if (!previewWindow) { showToast("预览窗口被拦截，请允许浏览器打开新窗口"); return; }
      previewWindow.opener = null;
      if (trustAttachmentIsPreviewable(attachment)) {
        if (attachment?.objectUrl) previewWindow.location.href = attachment.objectUrl;
        else previewWindow.document.write(`<main style="font:14px/1.6 system-ui,sans-serif;padding:32px;color:#36313d"><h2>${escapeHtml(attachment.name || "背书附件")}</h2><p>这是原型示例附件。正式环境将加载实际文件内容。</p></main>`);
        return;
      }
      const download = attachment?.objectUrl ? `<a href="${attachment.objectUrl}" download="${escapeHtml(attachment.name || "背书附件")}" style="display:inline-flex;margin-top:18px;padding:9px 14px;border-radius:8px;color:#fff;background:#6550bd;text-decoration:none">下载文件后查看</a>` : "<p>这是原型示例附件。正式环境将提供文件下载与在线解析预览。</p>";
      previewWindow.document.write(`<main style="max-width:720px;font:14px/1.6 system-ui,sans-serif;padding:32px;color:#36313d"><p style="margin:0 0 8px;color:#806ac7;font-size:12px">文件预览</p><h2 style="margin:0 0 6px">${escapeHtml(attachment?.name || "背书附件")}</h2><p style="margin:0;color:#827b89">${escapeHtml(trustAttachmentExtension(attachment))} · ${trustAttachmentSize(attachment?.size)}</p><div style="margin-top:24px;padding:24px;border:1px solid #e9e4f3;border-radius:12px;background:#fbfaff"><strong>当前浏览器无法直接解析此文件格式</strong><p style="margin:8px 0 0;color:#746d7b">文件仍可预览其基本信息，并可下载后使用对应软件打开。</p>${download}</div></main>`);
    }
    function removeTrustAttachment(id, scope) {
      const collection = trustAttachmentCollection(scope);
      const attachment = collection.find(item => item.id === id);
      if (!attachment || !window.confirm(`确定删除附件“${attachment.name}”？`)) return;
      if (attachment.objectUrl) URL.revokeObjectURL(attachment.objectUrl);
      const next = collection.filter(item => item.id !== id);
      if (scope === "create") productCreateTrustAttachments = next;
      else productDetailData[currentProductDetailId].trustAttachments = next;
      scope === "create" ? renderProductCreateTrustAttachments() : renderProductTrustAttachments();
      showToast("背书附件已删除");
    }
    function addProductPlatform(name, targetSelect = null) {
      const value = String(name || "").trim();
      if (!value) { showToast("请输入平台名称"); return false; }
      const existing = productPlatforms.find(item => item.toLowerCase() === value.toLowerCase());
      if (existing) { showToast(`平台“${existing}”已存在`); return false; }
      productPlatforms.push(value);
      document.querySelectorAll(".product-link-row select").forEach(select => select.append(new Option(value, value)));
      if (targetSelect) targetSelect.value = value;
      showToast(`已新增平台“${value}”`);
      return true;
    }
    function renderProductDetailContent(detail) {
      document.querySelectorAll("#page-product-detail [data-product-content]").forEach(surface => {
        const value = detail[surface.dataset.productContent] || "";
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        const list = surface.querySelector(".editable-view");
        const textarea = surface.querySelector("textarea");
        const count = surface.querySelector(".multi-info-head small");
        if (list) list.innerHTML = lines.length ? lines.map(line => `<li>${escapeHtml(line)}</li>`).join("") : '<li class="product-link-empty">暂未填写</li>';
        if (textarea) textarea.value = value;
        if (count) count.textContent = lines.length;
        surface.classList.remove("is-editing");
        const edit = surface.querySelector("[data-inline-edit]");
        if (edit) edit.textContent = "编辑";
      });
      if (productDescriptionSource) productDescriptionSource.value = detail.description || "";
      originalDescription = detail.description || "";
      if (typeof parseDescriptionText === "function") parseDescriptionText();
      renderProductTrustAttachments(detail);
    }
    function renderProductDetailLinks(detail) {
      const list = document.getElementById("productDetailLinkList");
      const editor = document.getElementById("productDetailLinkRows");
      const links = productLinksOf(detail);
      if (list) list.innerHTML = links.length ? links.map(link => `<span class="product-detail-link-item"><b>${escapeHtml(link.platform)}</b><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url)}</a></span>`).join("") : '<span class="product-link-empty">暂未添加商品链接</span>';
      if (editor) { editor.innerHTML = ""; links.forEach(link => createProductLinkRow(editor, link)); }
      document.getElementById("productDetailLinkSurface")?.classList.remove("is-editing");
      document.getElementById("detailPlatformCreateLine")?.classList.remove("show");
      const action = document.getElementById("editDetailLinks");
      if (action) action.textContent = "编辑";
    }
    const productCreateLinkRows = document.getElementById("productCreateLinkRows");
    createProductLinkRow(productCreateLinkRows);
    function resetProductCreateForm() {
      ["productFormName","productFormBrand","productFormPrice","productFormDescription","productFormCore","productFormSecondary","productFormDifference","productFormTrust","productFormForbidden"].forEach(id => { const field = document.getElementById(id); if (field) field.value = ""; });
      const category = document.getElementById("productCategorySelect");
      if (category) category.selectedIndex = 0;
      const currency = document.getElementById("productCurrencySelect");
      if (currency) currency.value = "CNY";
      const upload = document.querySelector("[data-product-upload]");
      if (upload) { delete upload.dataset.ready; upload.textContent = "点击上传产品图片，或拖拽图片至此"; }
      releaseTrustAttachmentUrls(productCreateTrustAttachments);
      productCreateTrustAttachments = [];
      renderProductCreateTrustAttachments();
      if (productCreateLinkRows) { productCreateLinkRows.innerHTML = ""; createProductLinkRow(productCreateLinkRows); }
      document.getElementById("platformCreateLine")?.classList.remove("show");
    }
    document.querySelectorAll("[data-open-product-create]").forEach(button => button.addEventListener("click", () => { resetProductCreateForm(); toggleProductModal(productCreateModal, true); }));
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
      renderProductDetailLinks(detail);
      renderProductDetailContent(detail);
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
    document.getElementById("productTrustAttachmentUpload")?.addEventListener("click", () => document.getElementById("productTrustAttachmentInput")?.click());
    document.getElementById("productCreateTrustAttachmentUpload")?.addEventListener("click", () => document.getElementById("productCreateTrustAttachmentInput")?.click());
    document.getElementById("productTrustAttachmentInput")?.addEventListener("change", event => {
      addTrustAttachments(event.target.files, "detail");
      event.target.value = "";
    });
    document.getElementById("productCreateTrustAttachmentInput")?.addEventListener("change", event => {
      addTrustAttachments(event.target.files, "create");
      event.target.value = "";
    });
    document.addEventListener("click", event => {
      const action = event.target.closest("[data-trust-attachment-action]");
      if (!action) return;
      const scope = action.dataset.trustAttachmentScope;
      const attachment = trustAttachmentCollection(scope).find(item => item.id === action.dataset.trustAttachmentId);
      if (!attachment) return;
      if (action.dataset.trustAttachmentAction === "open") openTrustAttachment(attachment);
      if (action.dataset.trustAttachmentAction === "remove") removeTrustAttachment(attachment.id, scope);
    });
    document.querySelectorAll("[data-product-create-mode]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-create-mode]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-create-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productCreatePanel === button.dataset.productCreateMode));
    }));
    document.querySelector("[data-product-upload]")?.addEventListener("click", event => { event.currentTarget.dataset.ready = "true"; event.currentTarget.textContent = "已选择：产品主图_01.png · 点击可重新选择"; showToast("产品图片已添加"); });
    document.getElementById("addProductLinkRow")?.addEventListener("click", () => createProductLinkRow(productCreateLinkRows));
    document.getElementById("showPlatformCreate")?.addEventListener("click", () => { document.getElementById("platformCreateLine")?.classList.add("show"); document.getElementById("newPlatformName")?.focus(); });
    document.getElementById("cancelPlatformCreate")?.addEventListener("click", () => { document.getElementById("platformCreateLine")?.classList.remove("show"); document.getElementById("newPlatformName").value = ""; });
    document.getElementById("confirmPlatformCreate")?.addEventListener("click", () => {
      const input = document.getElementById("newPlatformName");
      const lastSelect = productCreateLinkRows?.querySelector(".product-link-row:last-child select");
      if (!addProductPlatform(input?.value, lastSelect)) return;
      input.value = "";
      document.getElementById("platformCreateLine")?.classList.remove("show");
      if (!lastSelect) createProductLinkRow(productCreateLinkRows, { platform:productPlatforms.at(-1) });
    });
    document.getElementById("editDetailLinks")?.addEventListener("click", () => {
      const surface = document.getElementById("productDetailLinkSurface");
      if (!surface) return;
      if (!surface.classList.contains("is-editing")) {
        renderProductDetailLinks(productDetailData[currentProductDetailId]);
        surface.classList.add("is-editing");
        document.getElementById("editDetailLinks").textContent = "完成";
        return;
      }
      const result = readProductLinkRows(document.getElementById("productDetailLinkRows"));
      if (result.incomplete) return showToast("每条商品链接都需要选择平台并填写链接");
      if (result.invalid) return showToast("请填写以 http:// 或 https:// 开头的有效链接");
      if (result.duplicate) return showToast("相同商品链接不能重复添加");
      const conflict = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && productLinksOf(product).some(old => result.links.some(link => old.url.toLowerCase() === link.url.toLowerCase())));
      if (conflict) return showToast(`链接已关联产品“${conflict[1].name}”，不能重复绑定`);
      productDetailData[currentProductDetailId].links = result.links;
      delete productDetailData[currentProductDetailId].link;
      renderProductDetailLinks(productDetailData[currentProductDetailId]);
      showToast("商品链接已保存");
    });
    document.getElementById("cancelDetailLinks")?.addEventListener("click", () => renderProductDetailLinks(productDetailData[currentProductDetailId]));
    document.getElementById("addDetailProductLink")?.addEventListener("click", () => createProductLinkRow(document.getElementById("productDetailLinkRows")));
    document.getElementById("showDetailPlatformCreate")?.addEventListener("click", () => { document.getElementById("detailPlatformCreateLine")?.classList.add("show"); document.getElementById("detailPlatformName")?.focus(); });
    document.getElementById("cancelDetailPlatform")?.addEventListener("click", () => { document.getElementById("detailPlatformCreateLine")?.classList.remove("show"); document.getElementById("detailPlatformName").value = ""; });
    document.getElementById("confirmDetailPlatform")?.addEventListener("click", () => {
      const input = document.getElementById("detailPlatformName");
      const rows = document.getElementById("productDetailLinkRows");
      let lastSelect = rows?.querySelector(".product-link-row:last-child select");
      if (!lastSelect) lastSelect = createProductLinkRow(rows)?.querySelector("select");
      if (!addProductPlatform(input?.value, lastSelect)) return;
      input.value = "";
      document.getElementById("detailPlatformCreateLine")?.classList.remove("show");
    });
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
    function makeParsingProductCard(name, productId, link = "", category = "商品解析中") {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "product-market-card is-parsing";
      card.dataset.productId = productId;
      card.dataset.productLink = link;
      card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="parse-state parsing"><strong>正在解析</strong><span>识别产品信息中…</span></div><div class="product-market-assets"><span>文案 —</span><span>脚本 —</span><span>素材 —</span><span>视频 —</span></div></div>`;
      card.addEventListener("click", () => showToast("产品信息正在解析中，完成后可查看详情"));
      const finishParsing = () => setTimeout(() => {
        const lowerLink = link.toLowerCase();
        if (lowerLink.includes("fail")) {
          card.classList.remove("is-parsing");
          card.innerHTML = `<div class="product-market-image blend"><span class="image-label">解析失败</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="parse-state failed"><strong>解析失败</strong><span>链接无法访问</span><button type="button" data-retry-product-parse>重试</button></div></div>`;
          card.onclick = event => { event.preventDefault(); if (!event.target.closest("[data-retry-product-parse]")) return; card.classList.add("is-parsing"); card.querySelector(".parse-state").className = "parse-state parsing"; card.querySelector(".parse-state").innerHTML = "<strong>正在重试</strong><span>再次读取商品信息…</span>"; link = link.replace(/fail/ig, "retry"); finishParsing(); };
          return;
        }
        card.classList.remove("is-parsing");
        const partial = lowerLink.includes("partial");
        card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${partial ? "待补充" : "厨房电器"}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div>${partial ? '<div class="parse-state partial"><strong>部分完成</strong><span>品牌、类目待补充</span></div>' : '<div class="parse-state success"><strong>解析完成</strong><span>产品信息已识别</span></div>'}<div class="product-market-price-row"><div class="product-market-price"><small>¥</small>199</div><small class="asset-card-audit" title="最近修改：嗡大发 · 08/11 10:26">嗡大发 · 08/11 10:26</small></div><div class="product-market-assets"><span>文案 0</span><span>脚本 0</span><span>素材 0</span><span>视频 0</span></div></div>`;
        productDetailData[productId] = { id:productId, name, brand:partial ? "" : "已识别品牌", category:partial ? "" : "厨房电器", price:"¥199", currencyCode:"CNY", links:[{ platform:detectProductPlatform(link), url:link }], description:"商品链接解析生成，产品参数待确认", core:"核心卖点待确认", secondary:"", difference:"", trust:"", trustAttachments:[], forbidden:"" };
        productCatalog[productId] = { name, core:"核心卖点待确认", secondary:"", difference:"", audiences:[], psychology:[], facts:"已通过商品链接解析，缺失字段需人工确认" };
        syncProductToCreationSelectors(productId, name);
        card.replaceWith(card.cloneNode(true));
        const readyCard = document.querySelector(`[data-product-id="${productId}"]`);
        readyCard?.addEventListener("click", () => openProductDetail(productId));
        showToast(partial ? `“${name}”部分解析完成，请补充缺失信息` : `“${name}”解析完成`);
      }, 1800);
      finishParsing();
      return card;
    }
    function confirmSuspectedProduct(existingName, newName) {
      return new Promise(resolve => {
        let modal = document.getElementById("suspectedProductModal");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "suspectedProductModal";
          modal.className = "modal-backdrop";
          modal.innerHTML = `<div class="modal" style="max-width:500px"><div class="modal-head"><div><span class="badge orange">疑似重复</span><h3>确认是否继续新增</h3></div></div><div class="modal-body"><div class="session-delete-copy" data-suspected-product-copy></div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-suspected-cancel>取消</button><button class="primary-btn" type="button" data-suspected-confirm>仍然新增</button></div></div>`;
          document.body.append(modal);
        }
        modal.querySelector("[data-suspected-product-copy]").textContent = `新产品“${newName}”与已有产品“${existingName}”名称相近。请确认它们是否为不同产品。`;
        modal.classList.add("show");
        const finish = value => { modal.classList.remove("show"); modal.onclick = null; resolve(value); };
        modal.onclick = event => {
          if (event.target === modal || event.target.closest("[data-suspected-cancel]")) finish(false);
          if (event.target.closest("[data-suspected-confirm]")) finish(true);
        };
      });
    }
    document.getElementById("saveProductEntry")?.addEventListener("click", async () => {
      const mode = document.querySelector("[data-product-create-mode].active")?.dataset.productCreateMode;
      const productGrid = document.getElementById("productMarketGrid");
      if (mode === "batch") {
        const links = document.querySelector("[data-product-create-panel='batch'] textarea")?.value.trim().split(/\n+/).filter(Boolean) || [];
        if (!links.length) return showToast("请至少输入一条商品链接");
        const uniqueLinks = [...new Set(links)];
        const invalidLinks = uniqueLinks.filter(link => !/^https?:\/\/\S+$/i.test(link));
        const validLinks = uniqueLinks.filter(link => /^https?:\/\/\S+$/i.test(link));
        const existingLinks = new Set(Object.values(productDetailData).flatMap(item => productLinksOf(item).map(link => link.url.toLowerCase())));
        const conflicts = validLinks.filter(link => existingLinks.has(link.toLowerCase()));
        const creatable = validLinks.filter(link => !existingLinks.has(link.toLowerCase()));
        if (!creatable.length) return showToast(invalidLinks.length ? "没有可解析的有效商品链接" : "链接对应的产品已存在，未重复创建");
        creatable.forEach((link, index) => productGrid.append(makeParsingProductCard(`新链接产品 ${index + 1}`, `parsing-product-${Date.now()}-${index}`, link)));
        toggleProductModal(productCreateModal, false);
        showToast(`已新增 ${creatable.length} 个产品并开始解析${conflicts.length ? `；跳过 ${conflicts.length} 条重复链接` : ""}${invalidLinks.length ? `；忽略 ${invalidLinks.length} 条无效链接` : ""}`);
        return;
      }
      const manualPanel = document.querySelector("[data-product-create-panel='manual']");
      const name = document.getElementById("productFormName")?.value.trim();
      const brand = document.getElementById("productFormBrand")?.value.trim();
      const priceValue = document.getElementById("productFormPrice")?.value.trim();
      const description = document.getElementById("productFormDescription")?.value.trim() || "";
      const core = document.getElementById("productFormCore")?.value.trim();
      const secondary = document.getElementById("productFormSecondary")?.value.trim() || "";
      const difference = document.getElementById("productFormDifference")?.value.trim() || "";
      const trust = document.getElementById("productFormTrust")?.value.trim() || "";
      const forbidden = document.getElementById("productFormForbidden")?.value.trim() || "";
      const hasImage = manualPanel.querySelector("[data-product-upload]")?.dataset.ready === "true";
      if (!name || !brand || !priceValue || !core || !hasImage || !document.getElementById("productCategorySelect")?.value || document.getElementById("productCategorySelect")?.value === "请选择类目") return showToast("请补全标记 * 的产品信息");
      const linkResult = readProductLinkRows(productCreateLinkRows);
      if (linkResult.incomplete) return showToast("每条商品链接都需要选择平台并填写链接");
      if (linkResult.invalid) return showToast("请填写以 http:// 或 https:// 开头的有效链接");
      if (linkResult.duplicate) return showToast("相同商品链接不能重复添加");
      const normalizedProductName = name.replace(/\s+/g, "").toLowerCase();
      const exactProduct = Object.values(productDetailData).find(item => productLinksOf(item).some(old => linkResult.links.some(link => old.url.toLowerCase() === link.url.toLowerCase())) || (String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedProductName && item.brand === brand));
      if (exactProduct) return showToast(`产品“${exactProduct.name}”已存在，不能重复创建`);
      const suspected = Object.values(productDetailData).find(item => String(item.name || "").replace(/\s+/g, "").toLowerCase().includes(normalizedProductName.slice(0, Math.max(3, normalizedProductName.length - 2))));
      if (suspected && !(await confirmSuspectedProduct(suspected.name, name))) return;
      const id = `manual-product-${Date.now()}`;
      const price = priceValue;
      const currencySelect = document.getElementById("productCurrencySelect");
      const currencyCode = currencySelect?.value || "CNY";
      const currencySymbol = currencySelect?.selectedOptions[0]?.dataset.symbol || "¥";
      const category = document.getElementById("productCategorySelect")?.value || "未填写类目";
      const trustAttachments = productCreateTrustAttachments.map(item => ({ ...item, status:"ready" }));
      productCreateTrustAttachments = [];
      const manualCard = document.createElement("button");
      manualCard.type = "button";
      manualCard.className = "product-market-card";
      manualCard.dataset.productId = id;
      manualCard.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image"><span class="image-label">${escapeHtml(category)}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="product-market-price-row"><div class="product-market-price"><small>${currencySymbol}</small>${escapeHtml(price)}</div><small class="asset-card-audit" title="最近修改：嗡大发 · 08/11 10:26">嗡大发 · 08/11 10:26</small></div><div class="product-market-assets"><span>文案 0</span><span>脚本 0</span><span>素材 0</span><span>视频 0</span></div></div>`;
      productDetailData[id] = { id, name, brand, category, price:`${currencySymbol}${price}`, currencyCode, links:linkResult.links, description, core, secondary, difference, trust, trustAttachments, forbidden };
      productCatalog[id] = { name, core:core.split(/\n+/)[0] || core, secondary:secondary.split(/\n+/)[0] || "", difference:difference.split(/\n+/)[0] || "", audiences:[], psychology:[], facts:`已读取产品档案、${linkResult.links.length} 条商品链接和禁用表达` };
      syncProductToCreationSelectors(id, name);
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

    document.querySelectorAll("[data-product-asset-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-asset-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-asset-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productAssetPanel === button.dataset.productAssetTab));
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
    document.querySelectorAll("#page-product-detail [data-inline-edit]").forEach(button => button.addEventListener("click", async () => {
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
        const label = surface.querySelector(":scope > label")?.textContent.trim();
        const nextValue = surfaceEditorValue(surface).trim();
        if (label === "商品链接") {
          const exact = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && product.link === nextValue);
          if (exact) {
            surface.classList.add("is-editing");
            button.textContent = "完成";
            surface.querySelector("input")?.focus();
            showToast(`该链接已关联产品“${exact[1].name}”，不能重复绑定`);
            return;
          }
          const nextPath = nextValue.split(/[?#]/)[0].replace(/\/$/, "").split("/").pop();
          const suspected = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && nextPath && product.link?.includes(nextPath));
          if (suspected && !(await confirmSuspectedProduct(suspected[1].name, productDetailData[currentProductDetailId]?.name || "当前产品"))) {
            surface.classList.add("is-editing");
            button.textContent = "完成";
            return;
          }
        }
        syncEditableSurface(surface);
        const product = productDetailData[currentProductDetailId];
        if (product) {
          if (label === "产品名称") product.name = nextValue;
          if (label === "品牌") product.brand = nextValue;
          if (label === "类目") product.category = nextValue;
          if (label === "价格") {
            product.price = nextValue.replace(/\s+[A-Z]{3}$/i, "");
            product.currencyCode = surface.querySelector("select")?.value || product.currencyCode || "CNY";
          }
          if (surface.dataset.productContent) product[surface.dataset.productContent] = nextValue;
          if (productCatalog[currentProductDetailId]) {
            productCatalog[currentProductDetailId].name = product.name;
            productCatalog[currentProductDetailId].core = String(product.core || "").split(/\n+/)[0] || "";
            productCatalog[currentProductDetailId].secondary = String(product.secondary || "").split(/\n+/)[0] || "";
            productCatalog[currentProductDetailId].difference = String(product.difference || "").split(/\n+/)[0] || "";
          }
          const card = document.querySelector(`#productMarketGrid [data-product-id="${currentProductDetailId}"]`);
          if (label === "产品名称") {
            const cardTitle = card?.querySelector(".product-market-title strong");
            if (cardTitle) cardTitle.textContent = product.name;
            document.querySelectorAll(`select[data-product-select] option[value="${currentProductDetailId}"], select[data-product-library] option[value="${currentProductDetailId}"]`).forEach(option => option.textContent = product.name);
          }
          if (label === "类目") { const categoryLabel = card?.querySelector(".image-label"); if (categoryLabel) categoryLabel.textContent = product.category; }
          if (label === "价格") { const cardPrice = card?.querySelector(".product-market-price"); if (cardPrice) cardPrice.textContent = product.price; }
        }
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
        if (productDetailData[currentProductDetailId]) productDetailData[currentProductDetailId].description = productDescriptionSource.value;
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
      row.dataset.sessionId = `session-${Date.now()}-${sessionList.children.length + 1}`;
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

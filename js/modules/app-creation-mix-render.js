
    function renderMixScript() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const flagSet = root?._mixRowFlag || new Set();
      const insertedSet = root?._mixRowInserted || new Set();
      const host = dynamicForm.querySelector("[data-mix-script-list]");
      if (!host) return;
      const segments = mixScriptSegments();
      // E1/E2: 边缘态 — 无分镜 / 无素材
      const totalChars = mixEffectiveCopy(root).replace(/\s/g, "").length;
      const hasCopy = totalChars > 0;
      const materialCount = mixSelectedMaterials().filter(item => item.status === "已分析").length;
      if (!hasCopy || !materialCount) {
        const reason = !hasCopy ? "口播文案为空" : "尚未选择已分析的素材";
        const step = !hasCopy ? "2" : "2";
        host.innerHTML = `<div class="mix-script-empty">
          <div class="mix-script-empty-icon">${!hasCopy ? "✎" : "▰"}</div>
          <div class="mix-script-empty-title">${!hasCopy ? "先去第二步补全口播文案" : "请先在第二步选择已分析素材"}</div>
          <div class="mix-script-empty-sub">${reason} · 系统无法分镜。当前在步骤 3 不会生成任何分镜。</div>
          <div class="mix-script-empty-tip">切回步骤 ${step} 完成 <b>${!hasCopy ? "口播文案" : "素材选择"}</b> 后再返回步骤 3。</div>
        </div>`;
        dynamicForm.querySelector("[data-mix-script-count]")?.replaceChildren("0");
        updateMixScriptCompletion([]);
        return;
      }
      // E3: 删除到最后一段 — 至少保留 1 段
      if (segments.length <= 1) {
        host.innerHTML = `<div class="mix-script-min-banner"><span>⚠</span> 至少需要保留 1 段分镜。如需重做该段,请用"重新匹配"或修改画面描述。</div>` + segments.map((item, index) => {
          return renderSingleMixCard(item, index, flagSet, insertedSet, { disableDelete: true, totalCards: segments.length });
        }).join("");
        dynamicForm.querySelector("[data-mix-script-count]")?.replaceChildren(String(segments.length));
        updateMixScriptCompletion(segments);
        return;
      }
      // E4: needs-rematch 状态由各卡片自身的高亮按钮 + 内联 flag 处理,不再使用顶部 banner
      host.innerHTML = segments.map((item, index) => renderSingleMixCard(item, index, flagSet, insertedSet, { totalCards: segments.length })).join("");
      dynamicForm.querySelector("[data-mix-script-count]")?.replaceChildren(String(segments.length));
      updateMixScriptCompletion(segments);
    }

    // 把单卡模板抽成函数,空态/末段/正常态共用
    function renderSingleMixCard(item, index, flagSet, insertedSet, opts = {}) {
      const totalCards = opts.totalCards ?? 0;
      const disableDelete = opts.disableDelete || totalCards <= 1;
      const hint = !item.copy.trim()
        ? `<div class="mix-row-rematch-hint"><b>请补全口播文案</b><span>补全后再确认该段镜头。</span></div>`
        : "";
      const isFlagged = item._isInserted || flagSet.has(item._origIndex) || (item._origIndex >= 0 && insertedSet.has(item._origIndex));
      const flagMark = isFlagged ? `<i class="mix-row-flag" title="本行已变更" aria-label="本行已变更"></i>` : "";
      const deleteDisabledAttr = disableDelete ? ` disabled aria-disabled="true" title="至少需保留 1 段分镜"` : ` title="删除第 ${index + 1} 段" aria-label="删除分镜"`;
      const advancedSummary = [
        `<em class="${item.shotType === "暂无" ? "is-empty" : ""}">景别·${escapeHtml(item.shotType)}</em>`,
        `<em class="${item.cameraMove === "暂无" ? "is-empty" : ""}">运镜·${escapeHtml(item.cameraMove)}</em>`,
        `<em class="${item.scene === "暂无" ? "is-empty" : ""}">场景·${escapeHtml(item.scene)}</em>`,
        `<em class="${item.subject === "暂无" ? "is-empty" : ""}">主体·${escapeHtml(item.subject)}</em>`
      ].join("");
      const shotTypeOptions = MIX_SHOT_TYPES.map(s => `<option value="${s}" ${s === item.shotType ? "selected" : ""}>${s}</option>`).join("");
      const cameraMoveOptions = MIX_CAMERA_MOVES.map(s => `<option value="${s}" ${s === item.cameraMove ? "selected" : ""}>${s}</option>`).join("");
      return `<article class="mix-script-card${item.needsRematch ? " needs-rematch" : ""}${isFlagged ? " is-flagged" : ""}${item._isInserted ? " is-inserted" : ""}${(item.assigned.length === 0) ? " is-needs-shot" : ""}${item._isRematching ? " is-rematching" : ""}" data-mix-script-row="${index}" data-mix-orig-row="${item._origIndex}" data-mix-material-ids="${escapeHtml(item.assigned.map(material => material.id).join(","))}">${flagMark}<header><div><span class="mix-row-index" title="第 ${index + 1} 段">${String(index + 1).padStart(2, "0")}</span><b>${mixTimeLabel(item.start)}–${mixTimeLabel(item.end)}</b><strong>${escapeHtml(item.stage)}</strong><span>${item.duration.toFixed(1)}s</span></div><div class="mix-row-header-actions">
        <button type="button" class="mix-row-icon-btn" data-mix-delete-row="${index}"${deleteDisabledAttr}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/></svg>
        </button>
        <button type="button" class="mix-row-action-btn${item.needsRematch ? " is-highlight" : ""}" data-mix-rematch-row>重新匹配</button>
        <button type="button" class="mix-row-action-btn mix-row-action-primary" data-mix-replace-row>替换镜头</button>
        <button type="button" class="mix-row-toggle-btn" data-mix-toggle-row aria-expanded="true">收起</button>
      </div></header><div class="mix-rematch-progress" data-mix-rematch-progress${item._isRematching ? "" : " hidden"}><span>AI 换镜中…</span><div class="mix-rematch-progress-track"><div class="mix-rematch-progress-bar"></div></div></div><div class="mix-script-body"><div class="mix-script-detail-layout">${item.assigned.length ? `<div class="mix-stage-preview" data-mix-preview-row tabindex="0" role="button" aria-label="预览第 ${index + 1} 个镜头"><b>▶</b></div>` : `<div class="mix-stage-preview mix-stage-preview-empty" data-mix-replace-row tabindex="0" role="button" aria-label="为第 ${index + 1} 段选择镜头"><div class="mix-stage-preview-empty-text">点击此处选择素材</div><div class="mix-stage-preview-empty-hint">第 ${index + 1} 段尚未匹配镜头</div></div>`}<div class="mix-stage-attributes"><label class="mix-stage-visual-edit mix-stage-visual-primary"><span>画面描述<button type="button" class="mix-visual-reset" data-mix-visual-reset="${index}" title="恢复到第二步进入第三步时的画面描述" aria-label="回到默认"${item.needsRematch ? "" : " disabled aria-disabled=\"true\""}>↶ 回到默认</button>${item.needsRematch && !item._isRematching ? `<em class="mix-visual-rematch-flag" title="已修改描述,需要重新匹配镜头">需重新匹配</em>` : ""}</span><textarea data-mix-row-visual="${index}" placeholder="用一句自然语言描述这个分镜的画面,例如:机器沿墙边清洁,特写展示贴边效果。">${escapeHtml(item.visual)}</textarea></label><i class="mix-field-divider" aria-hidden="true"></i><label class="mix-stage-copy-edit mix-stage-copy-primary"><span>口播文案<i class="mix-stage-copy-readonly-hint" aria-hidden="true">请回上一步修改</i></span><textarea data-mix-row-copy="${index}" readonly aria-readonly="true" title="口播文案不可直接编辑,请返回上一步调整" placeholder="本段口播文案,直接编辑即可触发分镜自动重算">${escapeHtml(item.copy)}</textarea></label></div></div>${hint}</div></article>`;
    }

    function syncMixDuration() {
      const copy = dynamicForm.querySelector("[data-mix-copy]");
      const speed = Number(dynamicForm.querySelector("[data-mix-speed]")?.value || 1);
      const count = String(copy?.value || "").replace(/\s/g, "").length;
      const duration = mixActualDuration();
      const durationText = `${duration.toFixed(1)}s`;
      dynamicForm.querySelector("[data-mix-copy-count]")?.replaceChildren(String(count));
      dynamicForm.querySelector("[data-mix-speed-label]")?.replaceChildren(`${speed.toFixed(2)}×`);
      dynamicForm.querySelector("[data-mix-duration]")?.replaceChildren(durationText);
      dynamicForm.querySelector("[data-mix-script-duration]")?.replaceChildren(`${duration.toFixed(1)}s`);
      dynamicForm.querySelector("[data-mix-final-duration]")?.replaceChildren(`${duration.toFixed(1)} 秒`);
      const voice = dynamicForm.querySelector("[data-mix-voice]")?.value.split(" · ")[0] || "陈子建·公版";
      dynamicForm.querySelector("[data-mix-final-voice]")?.replaceChildren(`${voice} · ${speed.toFixed(2)}×`);
      const status = dynamicForm.querySelector("[data-mix-voice-status]");
      if (status) status.textContent = `${voice} · ${speed.toFixed(2)}×`;
      renderMixScript();
    }

    function renderMixPlanContext(mode) {
      const host = dynamicForm.querySelector("[data-mix-plan-context]");
      if (!host) return;
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (root) {
        root.dataset.mixPlanMode = mode;
        root.dataset.mixSourceConflict = "false";
        if (mode === "ai") root._mixDefaultMaterialIds = null;
      }
      const contexts = {
        ai: `<span class="mix-plan-icon">✦</span><div class="mix-context-main"><div class="mix-context-title"><strong>爆款内容结构</strong><small>选填；不选择时由 AI 自动匹配</small></div><input type="hidden" data-mix-content-structure value="${escapeHtml(root?._mixSelectedStructureMode || "")}"><button class="mix-picker-trigger mix-structure-picker-trigger${root?._mixSelectedStructureName ? " is-selected" : ""}" type="button" data-mix-pick-structure><span><b data-mix-structure-picker-label>${escapeHtml(root?._mixSelectedStructureName || "不选择（AI 自动匹配）")}</b><small data-mix-structure-picker-formula>${root?._mixSelectedStructureName ? "· " : ""}${escapeHtml(root?._mixSelectedStructureName ? (root?._mixSelectedStructureFormula || "已选择爆款内容结构") : "根据产品、素材与时长匹配")}</small></span><i>›</i></button>${root?._mixSelectedStructureName ? '<button class="mix-clear-structure" type="button" data-mix-clear-structure>取消选择</button>' : ""}</div>`,
        copy: `<span class="mix-plan-icon">文</span><div class="mix-context-main"><strong>选择已有文案</strong><small>选择后将基于原文生成本次任务文案，不影响原文。</small><select data-mix-existing-copy hidden><option value="">请选择文案</option></select><button class="mix-picker-trigger mix-source-picker" type="button" data-mix-pick-copy><span data-mix-source-picker-label>选择文案</span><i>›</i></button><div class="mix-source-asset-info" data-mix-source-asset-info><b>原文案</b><span>请选择一条文案查看内容预览</span><button type="button" class="mix-source-expand" data-mix-source-expand hidden>展开全文</button><em>选择后将自动带入关联产品</em></div></div>`,
        script: `<span class="mix-plan-icon">稿</span><div class="mix-context-main"><strong>选择已有脚本</strong><small>脚本口播在第二步确认；原分镜在第三步按当前素材和配音重新校准。</small><select data-mix-existing-script hidden><option value="">请选择脚本</option></select><button class="mix-picker-trigger mix-source-picker" type="button" data-mix-pick-script><span data-mix-source-picker-label>选择脚本</span><i>›</i></button><div class="mix-source-asset-info" data-mix-source-asset-info><b>原脚本口播</b><span>请选择一个脚本查看口播预览</span><button type="button" class="mix-source-expand" data-mix-source-expand hidden>展开全文</button><em>选择后将带入关联产品与分镜</em></div></div>`
      };
      host.innerHTML = contexts[mode] || contexts.ai;
      renderMixAudienceEditor(dynamicForm.querySelector(".mix-flow-form"), []);
      const mixPersonaPicker = dynamicForm.querySelector("[data-persona-picker][data-persona-context='mix']");
      if (mixPersonaPicker) {
        mixPersonaPicker.dataset.personaMode = "template";
        mixPersonaPicker.querySelectorAll("[data-persona-source-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaSourceMode === "template"));
        const templateSelect = mixPersonaPicker.querySelector("[data-persona-template-select]");
        if (templateSelect) templateSelect.hidden = false;
      }
      const product = dynamicForm.querySelector("[data-mix-product]");
      const origin = dynamicForm.querySelector("[data-mix-product-origin]");
      const sourceSelect = host.querySelector("[data-mix-existing-copy], [data-mix-existing-script]");
      const usesSource = mode === "copy" || mode === "script";
      const sourceHasProduct = Boolean(sourceSelect?.selectedOptions?.[0]?.dataset.product);
      const script = mode === "script";
      const productLabel = dynamicForm.querySelector("[data-mix-product-label]");
      if (product) {
        product.disabled = usesSource;
        if (usesSource && !sourceSelect?.value) {
          product.value = "";
          syncMixProductMaterials("");
        } else if (!usesSource && !product.value) {
          // AI 创作进入首屏时不预选产品；由用户选择后再加载关联素材。
          syncMixProductMaterials("");
        }
      }
      if (productLabel) productLabel.textContent = "目标产品";
      if (origin) origin.textContent = usesSource
        ? (!sourceSelect?.value
          ? `请先选择${mode === "copy" ? "已有文案" : "已有脚本"}，系统将自动带入关联产品。`
          : sourceHasProduct
            ? mode === "copy" ? "已带入已有文案相关产品，修改目标人群、视频时长或创作要求后，下一步将按最新配置重新生成一版文案" : "已带入已有脚本相关产品，修改目标人群、视频时长或创作要求后，后续将按最新配置重新生成一版文案及脚本"
            : `${mode === "copy" ? "该文案" : "该脚本"}未关联产品，请更换一篇有关联产品的${mode === "copy" ? "文案" : "脚本"}。`)
        : "选择产品后，系统将匹配内容结构、校验文案并限定本次素材范围。";
      if (sourceSelect?.value) updateMixSourceAsset(sourceSelect);
      syncMixModeFields(mode);
    }

    function syncMixModeFields(mode) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const productField = root.querySelector("[data-mix-product-field]");
      if (productField && !productField.querySelector("[data-mix-product-title]")) {
        const productLabel = productField.querySelector("[data-mix-product-label]");
        const productFacts = productField.querySelector("[data-mix-product-facts]");
        if (productLabel && productFacts) {
          const title = document.createElement("span");
          title.className = "mix-product-title";
          title.dataset.mixProductTitle = "";
          productLabel.parentElement.insertBefore(title, productLabel);
          title.append(productLabel, productFacts);
        }
      }
      const ai = mode === "ai";
      const copyRewrite = mode === "copy";
      const script = mode === "script";
      const aiDriven = ai || copyRewrite || script;
      const hasLinkedProduct = Boolean(root.querySelector("[data-mix-product]")?.value);
      const sourceSelected = Boolean(root.querySelector("[data-mix-existing-copy], [data-mix-existing-script]")?.value);
      const audienceEditor = root.querySelector("[data-persona-picker][data-persona-context='mix']");
      const audienceField = root.querySelector("[data-mix-audience-field]");
      const audienceBlocked = copyRewrite && (!sourceSelected || !hasLinkedProduct);
      if (audienceEditor) {
        audienceField?.toggleAttribute("inert", audienceBlocked);
        audienceField?.classList.toggle("is-disabled", audienceBlocked);
        audienceEditor.setAttribute("aria-disabled", String(audienceBlocked));
      }
      root.querySelector("[data-mix-audience-block]")?.toggleAttribute("hidden", !aiDriven);
      root.querySelector("[data-mix-product-field]")?.toggleAttribute("hidden", false);
      root.querySelector("[data-mix-duration-field]")?.toggleAttribute("hidden", false);
      root.querySelector("[data-mix-duration-presets]")?.toggleAttribute("hidden", true);
      root.querySelector("[data-mix-product-facts]")?.toggleAttribute("hidden", !aiDriven || !hasLinkedProduct);
      root.querySelector("[data-mix-requirement-block]")?.toggleAttribute("hidden", !aiDriven);
      root.querySelector("[data-mix-regenerate-copy]")?.toggleAttribute("hidden", !aiDriven);
      const durationHint = root.querySelector("[data-mix-duration-hint]");
      if (durationHint) durationHint.hidden = !(script && sourceSelected);
      const durationLabel = root.querySelector("[data-mix-duration-label]");
      if (durationLabel) durationLabel.firstChild.nodeValue = "视频生成时长 ";
      const copyHint = root.querySelector("[data-mix-copy-editor-hint]");
      if (copyHint) copyHint.textContent = ai
        ? "可直接修改；产品库禁用话术会在保存前校验。"
        : copyRewrite
          ? "AI 将基于原文、目标人群、时长和本次要求生成新文案；不会修改资产库原文。"
        : script
          ? "AI 将基于已有脚本、目标人群、时长和本次要求重新生成文案及脚本。"
          : "直接使用来源内容；可手动编辑，或通过侧边栏 AI 对话主动改写。";
      const materialNote = root.querySelector(".mix-material-block-head small");
      if (materialNote) materialNote.textContent = script
        ? "展示脚本关联产品的全部素材；原脚本已使用的素材默认勾选，可自行调整。"
        : mode === "copy" ? "展示关联产品的全部素材；可自行选择本次用于混剪的素材。"
        : "默认展示该产品关联素材；取消选择的素材不会参与本次混剪。";
      syncMixRequiredIndicators(root, mode);
      syncMixProductPicker();
    }

    function syncMixRequiredIndicators(root, mode) {
      root.querySelectorAll(".mix-required-star").forEach(node => node.remove());
      const mark = node => {
        if (!node) return;
        const star = document.createElement("span");
        star.className = "required-star mix-required-star";
        star.setAttribute("aria-hidden", "true");
        star.textContent = "*";
        node.append(star);
      };
      mark(root.querySelector("[data-mix-product-label]"));
      mark(root.querySelector("[data-mix-audience-label]"));
      mark(root.querySelector("[data-mix-duration-label]"));
      mark(root.querySelector("[data-mix-material-block] .mix-material-title-line > strong"));
      if (mode === "copy" || mode === "script") mark(root.querySelector("[data-mix-plan-context] > .mix-context-main > strong"));
    }

    const mixProductNames = { "mite-pro":"轻净 Pro 除螨仪", "washer-s5":"净界洗地机 S5", "air-a8":"轻享空气炸锅 A8" };

    function syncMixProductPicker() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const select = root?.querySelector("[data-mix-product]");
      const trigger = root?.querySelector("[data-mix-pick-product]");
      const label = root?.querySelector("[data-mix-product-picker-label]");
      if (!select || !trigger || !label) return;
      label.textContent = mixProductNames[select.value] || "请选择产品";
      label.classList.toggle("placeholder", !select.value);
      trigger.disabled = select.disabled;
      trigger.setAttribute("aria-disabled", String(select.disabled));
    }

    function openMixProductPicker() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const select = root?.querySelector("[data-mix-product]");
      if (!select || select.disabled) return;
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        title:"选择目标产品",
        description:"选择后将带入产品事实，并限定本次创作可用素材。",
        items:Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId:select.value,
        onConfirm(productId) {
          select.value = productId;
          select.dispatchEvent(new Event("change", { bubbles:true }));
        }
      });
    }

    function openMixProductFacts(productIdOverride = "") {
      const productId = productIdOverride || dynamicForm.querySelector("[data-mix-product]")?.value;
      const product = productCatalog[productId];
      if (!product) return showToast("请先选择产品后查看产品事实。");
      const detail = productDetailData[productId] || product;
      const lines = value => Array.isArray(value) ? value : String(value || "").split(/[\n；]/).map(item => item.trim()).filter(Boolean);
      const section = (title, values, empty = "暂无已确认内容") => `<section class="mix-product-drawer-section"><strong>${title}</strong>${values.length ? `<ul>${values.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>${empty}</p>`}</section>`;
      const links = Array.isArray(detail.links) ? detail.links : [];
      const attachments = Array.isArray(detail.trustAttachments) ? detail.trustAttachments : [];
      const linkMarkup = links.length ? links.map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener"><b>${escapeHtml(link.platform || "商品")}</b><span>${escapeHtml(link.url)}</span></a>`).join("") : "<p>暂无商品链接</p>";
      const attachmentMarkup = attachments.length ? attachments.map(item => `<div class="mix-product-drawer-file"><div><b>${escapeHtml(item.name)}</b><span>${trustAttachmentSize(item.size)} · ${escapeHtml(item.uploadedAt || "已上传")}</span></div><button type="button" data-mix-preview-trust-attachment="${escapeHtml(item.id)}">预览</button></div>`).join("") : "<p>暂无背书附件</p>";
      document.querySelector("[data-mix-product-detail-layer]")?.remove();
      const layer = document.createElement("div");
      layer.className = "mix-product-detail-layer";
      layer.dataset.mixProductDetailLayer = "";
      layer.innerHTML = `<div class="mix-product-detail-mask" data-mix-product-detail-close></div><aside class="mix-product-detail-drawer" role="dialog" aria-modal="true" aria-label="产品详情"><header><div><small>产品详情</small><h2>${escapeHtml(detail.name || product.name)}</h2><p>${escapeHtml(detail.brand || product.brand || "未设置品牌")} · ${escapeHtml(detail.category || product.category || "未设置类目")} · ${escapeHtml(detail.price || "价格待补充")}</p></div><button type="button" data-mix-product-detail-close aria-label="关闭">×</button></header><div class="mix-product-drawer-body"><section class="mix-product-drawer-basic"><strong>基础信息</strong><div><span>产品名称<b>${escapeHtml(detail.name || product.name)}</b></span><span>品牌<b>${escapeHtml(detail.brand || product.brand || "—")}</b></span><span>类目<b>${escapeHtml(detail.category || product.category || "—")}</b></span><span>价格<b>${escapeHtml(detail.price || "—")}</b></span></div><em>商品链接</em><nav>${linkMarkup}</nav></section><section class="mix-product-drawer-description"><strong>商品描述</strong><pre>${escapeHtml(detail.description || "暂无商品描述")}</pre></section><div class="mix-product-drawer-content-grid">${section("核心卖点", lines(detail.core || product.core))}${section("次要卖点", lines(detail.secondary || product.secondary))}${section("差异化卖点", lines(detail.difference || product.difference))}${section("产品信任背书", lines(detail.trust), "暂无信任依据")}<section class="mix-product-drawer-section mix-product-drawer-attachments"><strong>背书附件</strong>${attachmentMarkup}</section>${section("禁用话术", lines(detail.forbidden), "暂无禁用表达")}</div></div></aside>`;
      document.body.appendChild(layer);
      requestAnimationFrame(() => layer.classList.add("show"));
      layer.addEventListener("click", event => {
        if (event.target.closest("[data-mix-product-detail-close]")) { layer.remove(); return; }
        const preview = event.target.closest("[data-mix-preview-trust-attachment]");
        if (preview) openTrustAttachment(attachments.find(item => item.id === preview.dataset.mixPreviewTrustAttachment));
      });
    }

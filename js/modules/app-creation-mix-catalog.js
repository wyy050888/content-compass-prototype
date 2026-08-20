    const mixMiteMaterialExtras = [
      ["M-EX-01","床褥纤维近景","痛点解释",4],["M-EX-02","床单拍打过程","使用过程",4],["M-EX-03","尘杯倒出碎屑","结果证明",3],
      ["M-EX-04","沙发缝隙清洁","使用过程",6],["M-EX-05","儿童床褥清洁","使用场景",7],["M-EX-06","宠物毛发吸入","结果证明",5],
      ["M-EX-07","滤网拆洗特写","使用便利",4],["M-EX-08","手持移动展示","产品展示",3],["M-EX-09","床垫边缘清洁","功能演示",5],
      ["M-EX-10","抱枕除尘过程","使用过程",4],["M-EX-11","尘杯装回过程","使用便利",3],["M-EX-12","开机操作特写","功能演示",3],
      ["M-EX-13","卧室整理全景","使用场景",6],["M-EX-14","产品配件展示","产品展示",4],["M-EX-15","低角度推进镜头","使用过程",5],
      ["M-EX-16","沙发坐垫清洁","多场景",6],["M-EX-17","收纳盒特写","使用便利",4],["M-EX-18","机身细节近景","产品展示",3]
    ];
    const mixProductMaterialSamples = {
      "mite-pro":[["M-CL-101","透明尘杯脏污特写","结果证明",2],["M-SC-301","床垫表面推进清洁","使用过程",6],["M-CL-102","拍打吸尘动作特写","功能演示",5],["M-PF-201","卧室床垫清洁全景","使用场景",8],["M-PF-202","沙发布艺清洁全景","多场景",7],["M-AT-503","产品定帧与购买引导","行动引导",4],...mixMiteMaterialExtras],
      "washer-s5":[["W-101","污水箱清洁结果","结果证明",2],["W-102","贴边清洁推进","功能演示",7],["W-103","毛发吸入特写","痛点解决",5],["W-104","客厅地面全景","使用场景",8],["W-105","滚刷自清洁过程","使用便利",6]],
      "air-a8":[["A-101","薯条出锅结果","结果证明",3],["A-102","食材放入炸篮","使用过程",5],["A-103","热风工作特写","功能演示",6],["A-104","家庭餐桌场景","使用场景",8],["A-105","炸篮拆洗过程","使用便利",5]]
    };
    // 仅保留生成样稿；名称、公式、阶段、来源和状态都由模板库提供。
    const mixGeneratedCopyByProfile = {
      result:"刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先看轻净 Pro 走完一遍后的透明尘杯，结果不用猜。拍打和吸尘同步进行，把织物深处的细小脏污带出来。床垫、沙发和其他布艺都能使用，用完尘杯还可以拆下来水洗。家里有孩子或宠物，日常清洁别只停留在表面。点击商品，查看完整实测过程。",
      contrast:"地面刚拖完，为什么还是留下水渍和毛发？普通拖把容易把脏污来回带，净界 S5 从贴边清洁开始，把吸、拖、洗结合在一次推进里。清洁前后的差别直接看污水箱，滚刷使用后还能启动自清洁。客厅、餐区和墙边都能连续处理，减少反复换工具。点击商品，查看完整清洁演示。",
      scene:"工作日想快速做一顿热食，又不想守在锅边？轻享 A8 从食材放入炸篮开始，通过热风循环完成加热。薯条、小食和家庭加餐可以按不同档位处理，出锅状态直接展示。使用后炸篮可以拆下清洗，日常收拾更方便。点击商品，查看更多家庭场景做法。",
      audience:"家里有孩子或宠物的，日常清洁最怕不同脏污反复换工具。产品把关键清洁动作放进一次使用里，针对常见场景逐项演示对应能力。先看完整使用过程，再根据自己的清洁需求选择。"
    };
    let mixTemplateStructureCatalog = null;
    let activeMixStructurePickerRender = null;
    let mixTemplateDetailLayer = null;
    let mixTemplateDetailFrame = null;

    function mixTemplateLibraryFrame() {
      return document.querySelector("#page-template-library iframe");
    }

    function requestMixTemplateStructureCatalog() {
      mixTemplateLibraryFrame()?.contentWindow?.postMessage({ type:"content-compass-template-catalog-request" }, "*");
    }

    function closeMixTemplateStructureDetail() {
      mixTemplateDetailLayer?.remove();
      mixTemplateDetailLayer = null;
      mixTemplateDetailFrame = null;
    }

    function openMixTemplateStructureDetail(item) {
      if (!item) return;
      closeMixTemplateStructureDetail();
      const layer = document.createElement("div");
      layer.className = "mix-template-detail-layer";
      layer.innerHTML = `<div class="mix-template-detail-mask" data-mix-detail-close></div><iframe class="mix-template-detail-frame" src="embedded-pages/图片库.html?entry=template-library&drawer=1&v=20260817c" title="爆款内容结构详情"></iframe>`;
      const frame = layer.querySelector("iframe");
      layer.addEventListener("click", event => {
        if (event.target.closest("[data-mix-detail-close]")) closeMixTemplateStructureDetail();
      });
      frame.addEventListener("load", () => {
        frame.contentWindow?.postMessage({ type:"content-compass-template-operation", kind:"content-structure", action:"template-view", id:item.id, name:item.name }, "*");
      }, { once:true });
      mixTemplateDetailLayer = layer;
      mixTemplateDetailFrame = frame;
      document.body.append(layer);
    }

    window.addEventListener("message", event => {
      const libraryFrame = mixTemplateLibraryFrame();
      if (event.source === libraryFrame?.contentWindow && event.data?.type === "content-compass-template-catalog" && event.data.catalog?.["content-structure"]) {
        mixTemplateStructureCatalog = event.data.catalog["content-structure"];
        activeMixStructurePickerRender?.();
        if (pendingCopyStructureId) setCopyStructureSelection(pendingCopyStructureId);
      }
      if (event.source === mixTemplateDetailFrame?.contentWindow && event.data?.type === "content-compass-template-operation-close") closeMixTemplateStructureDetail();
    });
    // 自动匹配与手动选择共用模板库目录；不要求用户先打开选择器。
    mixTemplateLibraryFrame()?.addEventListener("load", requestMixTemplateStructureCatalog, { once:true });
    requestMixTemplateStructureCatalog();

    function mixStructurePickerItems() {
      // 唯一数据源是模板库 iframe；提炼失败项仅留在模板库内供重新解析。
      return (mixTemplateStructureCatalog || []).filter(item => item.status !== "提炼失败");
    }

    function mixAutoStructure(productId) {
      const items = mixStructurePickerItems();
      return items.find(item => item.autoProductIds?.includes(productId))
        || items.find(item => !item.autoProductIds?.length)
        || items[0]
        || null;
    }

    function mixCurrentStructure() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const selectedId = dynamicForm.querySelector("[data-mix-content-structure]")?.value || root?._mixSelectedStructureId || "";
      const productId = dynamicForm.querySelector("[data-mix-product]")?.value || "mite-pro";
      return mixStructurePickerItems().find(item => item.id === selectedId) || mixAutoStructure(productId);
    }

    function mixStructureStatusLabel(item) {
      return item.status || "—";
    }

    function mixStructureEvidence(item) {
      if (item.sampleCount) {
        const recent30 = item.recent30;
        const recent30Label = recent30
          ? `近30日命中 <b>${Number(recent30.hitCount).toLocaleString("zh-CN")} 条</b>｜消耗 <b>¥${Math.round(Number(recent30.spend || 0)).toLocaleString("zh-CN")}</b> · ROI <b>${Number(recent30.roi || 0).toFixed(2)}</b>`
          : "近30日暂无投放数据";
        return `<div class="mix-structure-evidence"><span>学习样本 <b>${Number(item.sampleCount).toLocaleString("zh-CN")} 条</b></span><span>${recent30Label}</span></div>`;
      }
      if (item.reference) return `<div class="mix-structure-evidence"><span>提炼来源 <b title="${escapeHtml(item.reference)}">${escapeHtml(item.reference)}</b></span></div>`;
      return "";
    }

    function applyMixStructureSelection(id = "") {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const item = mixStructurePickerItems().find(structure => structure.id === id);
      root._mixSelectedStructureId = item?.id || "";
      root._mixSelectedStructureName = item?.name || "";
      root._mixSelectedStructureFormula = item?.formula || "";
      root._mixSelectedStructureMode = item?.id || "";
      renderMixPlanContext("ai");
      syncMixStructureDecision();
    }

    function openContentStructurePicker(options = {}) {
      let selectedId = options.selectedId || "";
      let source = "all";
      let query = "";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100060";
      const closePicker = () => {
        closeMixTemplateStructureDetail();
        if (activeMixStructurePickerRender === render) activeMixStructurePickerRender = null;
        overlay.remove();
      };
      const updateSelection = id => {
        selectedId = id;
        overlay.querySelectorAll("[data-mix-structure-option]").forEach(card => {
          const selected = card.dataset.mixStructureOption === selectedId;
          card.classList.toggle("selected", selected);
          card.setAttribute("aria-checked", String(selected));
          const marker = card.querySelector(":scope > i");
          if (marker) marker.textContent = selected ? "✓" : "";
        });
        const summary = overlay.querySelector("[data-mix-structure-selection-summary]");
        if (summary) summary.textContent = selectedId ? "已选择 1 个爆款内容结构" : "未选择时将由 AI 自动匹配";
      };
      const render = () => {
        const structures = mixStructurePickerItems().filter(item => item.sourceKey !== "custom" && (source === "all" || item.sourceKey === source) && (!query || `${item.name} ${item.formula}`.toLowerCase().includes(query.toLowerCase())));
        const list = mixTemplateStructureCatalog === null
          ? '<p class="mix-structure-picker-empty">正在加载模板库结构…</p>'
          : structures.length
            ? structures.map(item => `<article class="mix-structure-pick-card${selectedId === item.id ? " selected" : ""}" data-mix-structure-option="${item.id}" role="radio" tabindex="0" aria-checked="${selectedId === item.id}"><i>${selectedId === item.id ? "✓" : ""}</i><div><header><strong>${escapeHtml(item.name)}</strong><span class="mix-structure-card-tags"><em class="${item.sourceKey}">${escapeHtml(item.source)}</em><em class="status">${escapeHtml(mixStructureStatusLabel(item))}</em></span></header><p class="mix-structure-pick-formula">${escapeHtml(item.formula)}</p>${mixStructureEvidence(item)}<button type="button" data-mix-structure-detail="${item.id}">查看结构详情</button></div></article>`).join("")
            : '<p class="mix-structure-picker-empty">没有符合条件的爆款内容结构。</p>';
        const listMarkup = `<button type="button" class="mix-structure-pick-card auto${!selectedId ? " selected" : ""}" data-mix-structure-option="" role="radio" aria-checked="${!selectedId}"><i>${!selectedId ? "✓" : ""}</i><div><header><strong>不选择（AI 自动匹配）</strong></header><p>不指定结构时，由 AI 自动匹配。</p></div></button>${list}`;
        const listHost = overlay.querySelector("[data-mix-structure-list]");
        if (listHost) {
          listHost.innerHTML = listMarkup;
          overlay.querySelectorAll("[data-mix-structure-source]").forEach(button => button.classList.toggle("active", button.dataset.mixStructureSource === source));
          return;
        }
        overlay.innerHTML = `<div class="modal-card mix-structure-picker-modal" role="dialog" aria-label="选择爆款内容结构"><header class="modal-head"><div><strong>选择爆款内容结构</strong><small>选填；不选择时由 AI 根据本次创作信息自动匹配。</small></div><button class="modal-close" type="button" data-close>×</button></header><div class="mix-structure-picker-toolbar"><div class="mix-structure-source-tabs">${[["all","全部"],["qianchuan","千川学习"],["reference","参考视频提炼"]].map(([value,label]) => `<button type="button" class="${source === value ? "active" : ""}" data-mix-structure-source="${value}">${label}</button>`).join("")}</div><label>⌕<input type="search" data-mix-structure-query placeholder="搜索结构名称或内容公式" value="${escapeHtml(query)}"></label></div><div class="mix-structure-picker-list" data-mix-structure-list role="radiogroup" aria-label="内容结构列表">${listMarkup}</div><footer class="modal-foot"><span data-mix-structure-selection-summary>${selectedId ? "已选择 1 个爆款内容结构" : "未选择时将由 AI 自动匹配"}</span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-confirm>确认选择</button></div></footer></div>`;
      };
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-close]")) { closePicker(); return; }
        const sourceButton = event.target.closest("[data-mix-structure-source]");
        if (sourceButton) { source = sourceButton.dataset.mixStructureSource; render(); return; }
        const detail = event.target.closest("[data-mix-structure-detail]");
        if (detail) return openMixTemplateStructureDetail(mixStructurePickerItems().find(item => item.id === detail.dataset.mixStructureDetail));
        const option = event.target.closest("[data-mix-structure-option]");
        if (option) { updateSelection(option.dataset.mixStructureOption); return; }
        if (event.target.closest("[data-confirm]")) {
          options.onConfirm?.(selectedId, mixStructurePickerItems().find(item => item.id === selectedId) || null);
          closePicker();
        }
      });
      overlay.addEventListener("input", event => {
        if (event.target.matches("[data-mix-structure-query]")) {
          query = event.target.value;
          render();
          const input = overlay.querySelector("[data-mix-structure-query]");
          input?.focus();
          input?.setSelectionRange(query.length, query.length);
        }
      });
      overlay.addEventListener("keydown", event => {
        if (event.key === "Escape") { closePicker(); return; }
        if (event.target.closest("[data-mix-structure-detail]")) return;
        if (!((event.key === "Enter" || event.key === " ") && event.target.closest("[data-mix-structure-option]"))) return;
        event.preventDefault();
        updateSelection(event.target.closest("[data-mix-structure-option]").dataset.mixStructureOption);
      });
      document.body.append(overlay);
      activeMixStructurePickerRender = render;
      render();
      requestMixTemplateStructureCatalog();
    }

    function openMixStructurePicker() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      openContentStructurePicker({
        selectedId:root._mixSelectedStructureId || "",
        onConfirm(selectedId) {
          applyMixStructureSelection(selectedId);
          showToast(selectedId ? "已选择爆款内容结构，可在下一步确认文案与配音" : "将由 AI 自动匹配爆款内容结构");
        }
      });
    }

    function openCopyStructurePicker() {
      openContentStructurePicker({
        selectedId:dynamicForm.querySelector("[data-copy-structure-value]")?.value || "",
        onConfirm(selectedId) {
          setCopyStructureSelection(selectedId);
          setFormFeedback(selectedId
            ? `已选择文案结构“${creationContext.originalFields.copyStructure}”。`
            : "未指定文案结构，将由 AI 结合产品信息与脚本类型自动匹配。");
          showToast(selectedId ? "已选择爆款内容结构" : "将由 AI 自动匹配爆款内容结构");
        }
      });
    }

    function renderMixMaterialCard(item, index, selected = true) {
      const [id, name, scene, duration, suppliedTags] = item;
      const source = findScriptMaterial(id);
      const sourceTags = source?.tags || suppliedTags || [scene];
      const tags = [...new Set(sourceTags.filter(Boolean))];
      const type = source?.type === "image" ? "图片" : "视频";
      const size = source?.fileSize || (type === "图片" ? "1.8 MB" : `${Math.max(18.6, Number(duration || 3) * 31.48).toFixed(2)} MB`);
      const status = source?.status || "ok";
      const statusText = { ok:"已分析", pending:"待分析", analyzing:"分析中", fail:"分析失败" }[status] || status;
      return `<article class="mix-material-card${selected ? " selected" : ""}" data-mix-material="${escapeHtml(id)}" data-mix-material-tags="${escapeHtml(tags.join("|"))}" data-mix-material-scene="${escapeHtml(scene)}" data-mix-material-type="${type === "图片" ? "image" : "video"}" data-mix-material-status="${escapeHtml(status)}" tabindex="0" role="checkbox" aria-checked="${selected}" aria-label="选择素材：${escapeHtml(name)}"><button class="mix-material-select" type="button" aria-label="${selected ? "取消选择" : "选择"}${escapeHtml(name)}">${selected ? "✓" : ""}</button><div class="mix-material-cover tone-${index % 6 + 1}"><span class="mix-material-status pda-status-${escapeHtml(status)}">${statusText}</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览${escapeHtml(name)}">▶</button><em>00:${String(Math.round(duration || 3)).padStart(2,"0")}</em></div><strong>${escapeHtml(name)}</strong><small><span>${type}</span><i>·</i>${size}</small></article>`;
    }

    function syncMixMaterialTagFilter() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const count = dynamicForm.querySelector("[data-mix-tag-filter-count]");
      if (!root) return;
      const current = new Set(String(root.dataset.mixMaterialTagFilter || "").split("|").filter(Boolean));
      const tags = [...new Set([...dynamicForm.querySelectorAll("[data-mix-material]")]
        .flatMap(card => String(card.dataset.mixMaterialTags || "").split("|").filter(Boolean)))];
      const selected = [...current].filter(tag => tags.includes(tag));
      root.dataset.mixMaterialTagFilter = selected.join("|");
      if (count) count.textContent = selected.length ? ` ${selected.length}` : "";
    }

    function openMixMaterialTagFilter() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const cards = [...dynamicForm.querySelectorAll("[data-mix-material]")];
      const tags = [...new Set(cards.flatMap(card => String(card.dataset.mixMaterialTags || "").split("|").filter(Boolean)))];
      const selected = new Set(String(root.dataset.mixMaterialTagFilter || "").split("|").filter(Boolean));
      const groupByMaterial = { "产品特写":"产品标签", "产品全景":"产品标签", "使用场景":"场景标签", "痛点对比":"内容标签", "活动物料":"营销标签" };
      const fallbackGroup = tag => /床垫|沙发|卧室|客厅|家庭|场景/.test(tag) ? "场景标签" : /结果|痛点|功能|过程|行动|购买|品牌/.test(tag) ? "内容标签" : "产品标签";
      const tagGroup = tag => {
        const card = cards.find(item => String(item.dataset.mixMaterialTags || "").split("|").includes(tag));
        return groupByMaterial[findScriptMaterial(card?.dataset.mixMaterial)?.group] || fallbackGroup(tag);
      };
      const groups = ["全部标签", "产品标签", "场景标签", "内容标签", "营销标签"];
      let activeGroup = "全部标签";
      let query = "";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100030";
      const render = () => {
        const visibleTags = tags.filter(tag => (activeGroup === "全部标签" || tagGroup(tag) === activeGroup) && (!query || tag.toLowerCase().includes(query.toLowerCase())));
        overlay.innerHTML = `<div class="modal-card mix-tag-filter-modal" role="dialog" aria-label="素材标签筛选"><header class="modal-head"><div><span class="mix-filter-kicker">筛选</span><strong>按标签筛选素材</strong></div><button class="modal-close" type="button" data-close>×</button></header><div class="mix-tag-filter-layout"><aside>${groups.map(group => { const amount = group === "全部标签" ? tags.length : tags.filter(tag => tagGroup(tag) === group).length; return `<button type="button" class="${activeGroup === group ? "active" : ""}" data-tag-group="${group}"><span>${group}</span><b>${amount}</b></button>`; }).join("")}</aside><section><label class="mix-tag-search">⌕<input type="search" data-tag-query placeholder="搜索标签…" value="${escapeHtml(query)}"></label><div class="mix-tag-filter-content">${visibleTags.length ? visibleTags.map(tag => `<button type="button" class="${selected.has(tag) ? "selected" : ""}" data-tag="${escapeHtml(tag)}" aria-pressed="${selected.has(tag)}">${selected.has(tag) ? "✓ " : ""}${escapeHtml(tag)}</button>`).join("") : '<span>没有符合条件的标签</span>'}</div></section></div><footer class="modal-foot"><span>已选 ${selected.size} 个标签</span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-clear ${selected.size ? "" : "disabled"}>清空</button><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-apply>应用筛选</button></div></footer></div>`;
      };
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-close]")) { overlay.remove(); return; }
        const group = event.target.closest("[data-tag-group]")?.dataset.tagGroup;
        if (group) { activeGroup = group; render(); return; }
        const tag = event.target.closest("[data-tag]")?.dataset.tag;
        if (tag) { if (selected.has(tag)) selected.delete(tag); else selected.add(tag); render(); return; }
        if (event.target.closest("[data-clear]")) { selected.clear(); render(); return; }
        if (event.target.closest("[data-apply]")) {
          root.dataset.mixMaterialTagFilter = [...selected].join("|");
          syncMixMaterialTagFilter();
          renderMixMaterialPage(1);
          overlay.remove();
        }
      });
      overlay.addEventListener("input", event => {
        if (!event.target.matches("[data-tag-query]")) return;
        query = event.target.value;
        render();
        overlay.querySelector("[data-tag-query]")?.focus();
      });
      document.body.appendChild(overlay);
      render();
    }

    function mixFilteredMaterialCards() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const cards = [...dynamicForm.querySelectorAll("[data-mix-material]")];
      const query = String(root?.dataset.mixMaterialQuery || "").trim().toLowerCase();
      const filter = root?.dataset.mixMaterialFilter || "all";
      const tagFilters = String(root?.dataset.mixMaterialTagFilter || "").split("|").filter(Boolean);
      return cards.filter(card => {
        const materialType = card.dataset.mixMaterialType || (card.querySelector("small")?.textContent.includes("图片") ? "image" : "video");
        const tags = String(card.dataset.mixMaterialTags || "").split("|");
        if (filter !== "all" && filter !== materialType) return false;
        if (tagFilters.length && !tagFilters.every(tag => tags.includes(tag))) return false;
        if (!query) return true;
        return [card.dataset.mixMaterial, card.querySelector("strong")?.textContent, card.querySelector("small")?.textContent, ...tags]
          .some(value => String(value || "").toLowerCase().includes(query));
      });
    }

    function renderMixMaterialPage(page = 1) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const pager = dynamicForm.querySelector("[data-mix-material-pagination]");
      const empty = dynamicForm.querySelector("[data-mix-material-empty]");
      if (!grid || !pager) return;
      if (!root?.querySelector("[data-mix-product]")?.value) return;
      const cards = [...grid.querySelectorAll("[data-mix-material]")];
      const filteredCards = mixFilteredMaterialCards();
      const pageSize = 20;
      const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
      const current = Math.max(1, Math.min(Number(page) || 1, totalPages));
      if (root) root.dataset.mixMaterialPage = String(current);
      const visibleCards = new Set(filteredCards.slice((current - 1) * pageSize, current * pageSize));
      cards.forEach(card => { card.hidden = !visibleCards.has(card); });
      if (empty) {
        empty.hidden = filteredCards.length > 0;
        if (!empty.hidden) {
          empty.querySelector("[data-mix-material-empty-title]").textContent = "暂无符合条件的素材";
          empty.querySelector("[data-mix-material-empty-detail]").textContent = "请调整搜索或筛选条件，或点击「添加素材」上传新素材。";
        }
      }
      pager.hidden = filteredCards.length <= pageSize;
      if (!pager.hidden) {
        pager.innerHTML = `<span>显示 ${visibleCards.size} / ${filteredCards.length} 条</span><div><button type="button" data-mix-material-page="prev" ${current === 1 ? "disabled" : ""}>‹ 上一页</button><b>${current} / ${totalPages}</b><button type="button" data-mix-material-page="next" ${current === totalPages ? "disabled" : ""}>下一页 ›</button></div>`;
      }
    }

    function toggleMixMaterialSelection(card) {
      if (!card) return;
      card.classList.toggle("selected");
      const selected = card.classList.contains("selected");
      card.setAttribute("aria-checked", String(selected));
      const select = card.querySelector(".mix-material-select");
      if (select) {
        select.textContent = selected ? "✓" : "";
        select.setAttribute("aria-label", `${selected ? "取消选择" : "选择"}${card.querySelector("strong")?.textContent || "素材"}`);
      }
      updateMixMaterialSummary();
    }

    function focusMixMaterial(id) {
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const cards = [...grid?.querySelectorAll("[data-mix-material]") || []];
      const index = cards.findIndex(card => card.dataset.mixMaterial === id);
      if (index < 0) return;
      renderMixMaterialPage(Math.floor(index / 20) + 1);
      const card = cards[index];
      grid.scrollTop = Math.max(0, card.offsetTop - 12);
      card.classList.add("is-new");
      window.setTimeout(() => card.classList.remove("is-new"), 1300);
    }

    function openMixMaterialPreview(card) {
      if (!card) return;
      const name = card.querySelector("strong")?.textContent || "素材预览";
      const meta = card.querySelector("small")?.textContent || "";
      const duration = card.querySelector(".mix-material-cover em")?.textContent || "";
      const tone = [...card.querySelector(".mix-material-cover")?.classList || []].find(value => value.startsWith("tone-")) || "tone-1";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100030";
      overlay.innerHTML = `<div class="modal-card mix-material-preview-modal" role="dialog" aria-label="素材预览"><header class="modal-head"><div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(card.dataset.mixMaterial || "")} · ${escapeHtml(meta)}</small></div><button class="modal-close" type="button" data-modal-close>×</button></header><div class="mix-preview-stage ${tone}" data-mix-preview-stage><button type="button" data-mix-preview-toggle>▶</button><span>${escapeHtml(name)}</span><em>${escapeHtml(duration)}</em></div><footer class="mix-preview-foot"><span>预览画面仅用于确认素材内容与时长</span><button class="primary-btn" type="button" data-modal-close>完成</button></footer></div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-modal-close]")) overlay.remove();
        const toggle = event.target.closest("[data-mix-preview-toggle]");
        if (toggle) toggle.textContent = toggle.textContent === "▶" ? "Ⅱ" : "▶";
      });
    }

    function syncMixProductMaterials(productId) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const empty = dynamicForm.querySelector("[data-mix-material-empty]");
      const facts = dynamicForm.querySelector("[data-mix-product-facts] span");
      const pager = dynamicForm.querySelector("[data-mix-material-pagination]");
      const addMaterial = dynamicForm.querySelector("[data-mix-add-material]");
      if (!grid || !empty) return;
      if (addMaterial) {
        addMaterial.disabled = !productId;
        addMaterial.title = productId ? "关联创作素材" : "请先选择目标产品";
      }
      dynamicForm.querySelector("[data-mix-product-facts]")?.toggleAttribute("hidden", !productId);
      if (!productId) {
        grid.hidden = true;
        grid.innerHTML = "";
        empty.hidden = false;
        empty.querySelector("[data-mix-material-empty-title]").textContent = "请先选择目标产品";
        empty.querySelector("[data-mix-material-empty-detail]").textContent = "选择产品后，即可关联、筛选或添加本次混剪所需的创作素材。";
        if (pager) pager.hidden = true;
        dynamicForm.querySelector("[data-mix-total-count]")?.replaceChildren("0");
        syncMixMaterialSelection([]);
        dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialTagFilter = "";
        syncMixMaterialTagFilter();
        if (contextStatus) {
          contextStatus.hidden = false;
          contextStatus.textContent = "未选择产品";
        }
        return;
      }
      grid.hidden = false;
      empty.hidden = true;
      const productName = mixProductNames[productId] || "";
      const catalogMaterials = allScriptMaterials().filter(item => item.product === productName || !item.product);
      const samples = catalogMaterials.length
        ? catalogMaterials.map(item => [item.id, item.name, item.scene, item.duration, item.tags])
        : (mixProductMaterialSamples[productId] || []);
      const defaultSelected = root?._mixDefaultMaterialIds instanceof Set ? root._mixDefaultMaterialIds : null;
      grid.innerHTML = samples.map((item, index) => renderMixMaterialCard(item, index, defaultSelected ? defaultSelected.has(item[0]) : true)).join("");
      const search = dynamicForm.querySelector("[data-mix-material-search]");
      const filter = dynamicForm.querySelector("[data-mix-material-filter]");
      if (search) search.value = "";
      if (filter) filter.value = "all";
      dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialQuery = "";
      dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialFilter = "all";
      dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialTagFilter = "";
      if (facts) facts.textContent = productId === "mite-pro" ? "深层清洁 · 拍打吸尘同步 · 透明尘杯可水洗 · 禁用“100%除螨”" : productId === "washer-s5" ? "吸拖洗一体 · 贴边清洁 · 滚刷自清洁 · 禁用“完全无水渍”" : "热风循环 · 多档温控 · 炸篮可拆洗 · 禁用“零油脂”";
      dynamicForm.querySelector("[data-mix-final-product]")?.replaceChildren(mixProductNames[productId]);
      // 同步 step 4 输出规格(画面比例)
      const ratio = dynamicForm.querySelector("[data-mix-ratio]")?.value || "9:16";
      const spec = ratio === "16:9" ? "16:9 · 1920×1080 · 30fps" : "9:16 · 1080×1920 · 30fps";
      dynamicForm.querySelector("[data-mix-final-spec]")?.replaceChildren(spec);
      dynamicForm.querySelector("[data-mix-total-count]")?.replaceChildren(String(samples.length));
      if (contextStatus) {
        contextStatus.hidden = false;
        contextStatus.textContent = `已选择：${mixProductNames[productId]}`;
      }
      syncMixMaterialTagFilter();
      renderMixMaterialPage(1);
      updateMixMaterialSummary();
    }

    function updateMixSourceAsset(select) {
      const option = select?.selectedOptions?.[0];
      if (!option) return;
      const info = dynamicForm.querySelector("[data-mix-source-asset-info]");
      const isScript = select.matches("[data-mix-existing-script]");
      const externalCopy = !isScript && dynamicForm.querySelector(".mix-flow-form")?._mixExternalCopy;
      const externalScript = isScript && dynamicForm.querySelector(".mix-flow-form")?._mixExternalScript;
      if (info) {
        const sourceText = isScript
          ? (externalScript?.sourceFull || externalScript?.source || externalScript?.text || "")
          : (externalCopy?.text || SCRIPT_LIBRARY_ITEMS.find(item => item.id === option.value)?.text || "");
        const wordCount = sourceText.replace(/\s/g, "").length;
        const sourceDuration = Math.max(1, Math.round(isScript ? (Number(externalScript?.duration) || wordCount / 3.35) : wordCount / 3.35));
        info.querySelector("b").textContent = isScript ? "原脚本口播" : "原文案";
        const preview = sourceText
          ? `${sourceText.slice(0, 72)}${sourceText.length > 72 ? "…" : ""}`
          : isScript ? "请选择一个脚本查看口播预览" : "请选择一条文案查看内容预览";
        const previewNode = info.querySelector("span");
        if (previewNode) {
          previewNode.dataset.fullText = sourceText;
          previewNode.dataset.expanded = "false";
          previewNode.textContent = preview;
        }
        const expandButton = info.querySelector("[data-mix-source-expand]");
        if (expandButton) {
          expandButton.hidden = sourceText.length <= 72;
          expandButton.textContent = "展开全文";
        }
        info.querySelector("em").textContent = sourceText
          ? `${wordCount} 字 · ${isScript ? "原脚本" : "预计"} ${sourceDuration} 秒`
          : isScript ? "选择后将带入关联产品与分镜" : "选择后将自动带入关联产品";
      }
      dynamicForm.querySelector(".mix-flow-form").dataset.mixSourceConflict = "false";
    }

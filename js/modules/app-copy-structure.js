    /* ── 爆款内容结构：千川学习 / 自建结构、详情与 Agent 调用 ── */
    const copyStructureTbody = document.getElementById("copyStructureTbody");
    const copyStructureEmpty = document.getElementById("copyStructureEmpty");
    const copyStructureDetailModal = document.getElementById("copyStructureDetailModal");
    const copyStructureEditorModal = document.getElementById("copyStructureEditorModal");
    let activeCopyStructureId = "";
    let editingCopyStructureId = "";

    function copyStructureLevelLabel(level) { return level === "product" ? "产品级结构" : "通用结构"; }
    function copyStructureNow() { return new Intl.DateTimeFormat("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date()).replaceAll("/", "-"); }
    function renderCopyStructureTagFilter() {
      const select = document.getElementById("copyStructureTagFilter");
      if (!select) return;
      const current = select.value || "all";
      select.value = ["general","product"].includes(current) ? current : "all";
    }
    function renderCopyStructureLibrary() {
      if (!copyStructureTbody) return;
      const keyword = document.getElementById("copyStructureSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("copyStructureSourceFilter")?.value || "all";
      const tag = document.getElementById("copyStructureTagFilter")?.value || "all";
      const rows = copyStructureCatalog.filter(item => {
        const haystack = `${item.name} ${item.formula} ${item.products.join(" ")}`.toLowerCase();
        return (!keyword || haystack.includes(keyword)) && (source === "all" || item.source === source) && (tag === "all" || item.level === tag);
      });
      copyStructureTbody.innerHTML = rows.map(item => `<tr data-copy-structure-row="${item.id}">
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td class="copy-structure-formula">${escapeHtml(item.formula)}</td>
        <td><span class="copy-source-tag ${item.source}">${copyStructureSourceLabel(item.source)}</span></td>
        <td><span class="copy-structure-tag-pill">${copyStructureLevelLabel(item.level)}</span></td>
        <td>${escapeHtml(item.products.join("、") || "通用")}</td>
        <td>${escapeHtml(item.updated)}</td>
        <td><div class="copy-structure-row-actions"><button class="copy-row-action" type="button" data-copy-structure-view="${item.id}">查看详情</button>${item.source === "custom" ? `<button class="copy-row-action primary" type="button" data-copy-structure-edit="${item.id}">编辑</button><button class="copy-row-action" type="button" data-copy-structure-copy="${item.id}">复制</button><button class="copy-row-action danger" type="button" data-copy-structure-delete="${item.id}">删除</button>` : `<button class="copy-row-action primary" type="button" data-copy-structure-copy="${item.id}">复制为自建</button>`}</div></td>
      </tr>`).join("");
      copyStructureEmpty.hidden = rows.length > 0;
    }

    function renderCopyStructureRelated(item, keyword = "") {
      const list = document.getElementById("copyStructureRelatedList");
      if (!list) return;
      const normalized = keyword.trim().toLowerCase();
      const ranked = [...(item.related || [])].sort((a,b) => (b.spend || 0) - (a.spend || 0)).slice(0,20);
      const related = ranked.filter(record => !normalized || `${record.video} ${record.product} ${record.id} ${record.copy}`.toLowerCase().includes(normalized));
      document.getElementById("copyStructureRelatedCount").textContent = `展示 ${related.length} 条`;
      list.innerHTML = related.length ? related.map(record => `<article class="copy-related-item" data-related-copy="${record.id}">
        <button class="copy-related-video" type="button" data-play-related-video="${record.id}" aria-label="播放${escapeHtml(record.video)}"><span>${escapeHtml(record.video)}</span></button>
        <div class="copy-related-copy"><div class="copy-related-copy-head"><div><strong>${escapeHtml(record.video)}</strong><small style="display:block;margin-top:3px;">${escapeHtml(record.product)} · 素材 ID ${escapeHtml(record.id)}</small></div><span class="copy-related-spend">消耗 ¥${Number(record.spend || 0).toLocaleString("zh-CN")}</span></div><p>${escapeHtml(record.copy)}</p><div class="copy-related-actions"><button class="ghost-btn" type="button" data-expand-related-copy>展开全文</button><button class="ghost-btn" type="button" data-copy-related-text>复制文案</button><button class="ghost-btn" type="button" data-play-related-video="${record.id}">播放视频</button></div></div>
      </article>`).join("") : `<div class="copy-structure-empty">${item.source === "custom" ? "自建结构暂未关联千川文案" : "没有符合搜索条件的关联文案"}</div>`;
    }

    const copyStructureInsightCatalog = {
      "cs-qc-result": {
        why:"用强结果画面先建立注意力，再解释隐性痛点，通过完整操作和可视化结果证明产品价值，适合效果能够直接展示的清洁产品。",
        evidence:"近30天同结构素材消耗靠前；2条高消耗成品均在前3秒展示清洁结果。",
        scope:"适合：效果可视化、已有结果特写和完整操作素材；不适合：结果无法被画面直接证明的产品。",
        stages:[
          {name:"结果型视觉钩子",time:"0–3s",purpose:"先给结果，快速建立好奇与观看理由",original:"透明尘杯脏污特写，随后硬切床垫表面。",talk:"先别听我讲参数，直接看{product}走完一遍后的{visible_result}。",slots:["product · 产品名","visible_result · 可视化结果"],material:"结果特写、前后对比或反常画面；至少1个近景镜头。",edit:"1–2个短镜头；优先硬切；单镜头1–2秒。"},
          {name:"隐性痛点放大",time:"3–12s",purpose:"解释为什么表面正常仍需要解决",original:"床单看似干净，但纤维深处仍可能藏有毛发碎屑。",talk:"你以为{surface_state}就够了，其实{hidden_problem}并没有解决。",slots:["surface_state · 表面状态","hidden_problem · 隐性问题"],material:"问题部位特写、目标人群生活场景。",edit:"画面跟随信息点切换；无需完整动作。"},
          {name:"产品能力演示",time:"12–34s",purpose:"用实际操作承接解决方案，而不是只讲参数",original:"展示拍打头推进、拍打与吸尘同步工作的连续过程。",talk:"{product}通过{core_action}，把{problem_object}直接带出来。",slots:["core_action · 核心动作","problem_object · 问题对象"],material:"产品露出、关键动作和使用过程；动作镜头需连续清晰。",edit:"保留完整动作；素材偏短时可轻微减速或补充同义镜头。"},
          {name:"结果与场景证明",time:"34–52s",purpose:"通过结果及多场景证明产品不是单点有效",original:"尘杯结果、床垫和沙发布艺场景连续展示。",talk:"{scene_1}、{scene_2}都能用，清洁结果可以直接看见。",slots:["scene_1 · 核心场景","scene_2 · 扩展场景"],material:"结果回看、两个以上使用场景。",edit:"结果镜头优先；多场景之间直接硬切。"},
          {name:"行动引导",time:"52–60s",purpose:"收束价值并给出明确下一步",original:"产品定帧收口，引导查看完整实测。",talk:"想看{proof_content}，点击商品了解更多。",slots:["proof_content · 可验证内容"],material:"产品稳定展示或操作完成画面。",edit:"结尾保持稳定；素材不足可短时定帧。"}
        ]
      },
      "cs-qc-scene": {
        why:"先用高频生活场景建立代入，再用产品操作和结果证明降低理解成本，最后承接优惠或行动信息。",
        evidence:"参考成品在前5秒完成人群场景和问题交代，核心功能均有实拍画面承接。",
        scope:"适合：使用场景明确、操作流程可展示的产品；不适合：缺少真实使用过程素材。",
        stages:[
          {name:"场景代入",time:"0–5s",purpose:"让目标人群快速确认与自己有关",original:"下班回家，不想长时间守在厨房。",talk:"{audience_scene}，又不想{pain_action}？",slots:["audience_scene · 人群场景","pain_action · 麻烦行为"],material:"人物或环境全景、问题状态。",edit:"先场景后痛点，2个镜头内完成。"},
          {name:"问题呈现",time:"5–12s",purpose:"把时间、操作或清洁成本具体化",original:"反复开盖、等待和清洁油污。",talk:"每次都要{old_process}，真正麻烦的是{cost}。",slots:["old_process · 原处理流程","cost · 时间或操作成本"],material:"旧方式、等待或问题细节。",edit:"按问题信息点硬切。"},
          {name:"功能证明",time:"12–43s",purpose:"用完整使用过程说明产品如何解决问题",original:"放入食材、观察上色、出锅并展示结果。",talk:"把{object}放进去，通过{feature}完成{result}。",slots:["feature · 核心功能","result · 结果"],material:"产品登场、完整操作、结果特写。",edit:"关键操作不可截断；允许轻微加速。"},
          {name:"使用便利",time:"43–52s",purpose:"补充降低使用门槛的次要卖点",original:"炸篮拆下清洗。",talk:"用完后{easy_action}，日常处理更方便。",slots:["easy_action · 便利动作"],material:"拆卸、清洗或收纳过程。",edit:"1–2个连续动作镜头。"},
          {name:"行动收口",time:"52–60s",purpose:"给出优惠或查看商品的明确动作",original:"成品展示并引导进入商品。",talk:"想看更多{scene_result}，点击商品查看。",slots:["scene_result · 场景结果"],material:"成品、产品或稳定场景。",edit:"稳定画面收尾，可短时定帧。"}
        ]
      },
      "cs-qc-audience": {
        why:"先点名人群缩短理解路径，再逐层展开需求与产品能力，适合人群差异明显的产品。", evidence:"参考成品的人群信息前置，核心卖点与清洁操作一一对应。", scope:"适合：人群痛点明确且素材有人群场景；不适合：需要广泛覆盖但无法区分人群的产品。",
        stages:[
          {name:"人群点名",time:"0–4s",purpose:"明确视频在对谁说",original:"家里有孩子又有宠物的家庭。",talk:"{target_audience}，日常最怕{core_pain}。",slots:["target_audience · 目标人群","core_pain · 核心痛点"],material:"人群生活场景或典型问题。",edit:"前4秒完成人群和痛点交代。"},
          {name:"需求唤醒",time:"4–13s",purpose:"把抽象需求变成具体麻烦",original:"干湿垃圾需要分开处理。",talk:"每次{old_process}，不仅{cost_1}，还要{cost_2}。",slots:["old_process · 旧流程","cost_1 · 成本一","cost_2 · 成本二"],material:"问题过程和细节特写。",edit:"按成本点切换镜头。"},
          {name:"卖点展开",time:"13–48s",purpose:"逐项展示能力如何对应需求",original:"吸、拖、洗一次推进完成，并展示滚刷自清洁。",talk:"{product}把{ability_list}放进一次操作里。",slots:["ability_list · 能力组合"],material:"每个卖点至少匹配一个动作镜头。",edit:"卖点与画面一一对齐；关键动作保留完整。"},
          {name:"产品推荐",time:"48–60s",purpose:"总结适用理由并引导下一步",original:"缩短清洁链路，查看完整演示。",talk:"如果你想{desired_result}，可以先看它的完整演示。",slots:["desired_result · 目标结果"],material:"结果、产品和稳定收口画面。",edit:"先结果再产品，结尾可定帧。"}
        ]
      },
      "cs-custom-contrast": {
        why:"用反差制造认知落差，再通过完整实测消除怀疑，适合具备明显前后变化的产品。", evidence:"从参考视频提炼，用于复用内容路径、素材匹配要求和剪辑建议。", scope:"适合：前后差异明显、具有实测素材；不适合：只能依赖口头宣称的产品。",
        stages:[
          {name:"反差开场",time:"0–4s",purpose:"用预期与真实结果的差异抓住注意力",original:"先展示看似正常的状态，再切到异常结果。",talk:"你以为{expected_state}，实际{unexpected_result}。",slots:["expected_state · 原有认知","unexpected_result · 反差结果"],material:"同一对象的前后状态或反常结果。",edit:"2个镜头直接硬切。"},
          {name:"过程实测",time:"4–34s",purpose:"证明结果来自真实操作",original:"完整展示产品从开始到完成的操作过程。",talk:"不讲参数，直接看{product}怎么完成{task}。",slots:["task · 核心任务"],material:"连续、清晰、可验证的完整动作。",edit:"动作不可截断；冗余部分可加速。"},
          {name:"结果证明",time:"34–50s",purpose:"回看结果并给出判断依据",original:"结果特写与前画面对照。",talk:"前后差别就在{proof_point}。",slots:["proof_point · 证明点"],material:"结果特写、前后对比。",edit:"结果镜头至少保留2秒。"},
          {name:"行动引导",time:"50–60s",purpose:"引导查看详情或完成购买动作",original:"产品稳定露出并引导查看。",talk:"想看完整实测，点击商品了解更多。",slots:[],material:"产品定帧或完成画面。",edit:"稳定收口，可短时定帧。"}
        ]
      }
    };

    function renderCopyStructureStages(item) {
      const insight = copyStructureInsightCatalog[item.id] || copyStructureInsightCatalog["cs-custom-contrast"];
      const formula = document.getElementById("copyStructureFormulaCard");
      formula.innerHTML = `<div class="copy-formula-overview"><small>公式一览</small><div>${item.formula.split("→").map((part,index) => `${index ? "<i>→</i>" : ""}<b>${escapeHtml(part.trim())}</b>`).join("")}</div></div><div class="copy-effective-reason"><span>效</span><div><strong>为什么这个结构有效</strong><p>${escapeHtml(insight.why)}</p><small>${escapeHtml(insight.evidence)}</small></div></div><div class="copy-structure-scope"><b>复用边界</b><span>${escapeHtml(insight.scope)}</span></div>`;
      document.getElementById("copyStructureStageList").innerHTML = insight.stages.map((stage,index) => `<article class="copy-stage-card${index === 0 ? " expanded" : ""}" data-copy-stage-card><button class="copy-stage-head" type="button" data-copy-stage-toggle><i>${index + 1}</i><span><b>${escapeHtml(stage.name)}</b><small>${escapeHtml(stage.purpose)}</small></span><em>${escapeHtml(stage.time)}</em><u>⌄</u></button><div class="copy-stage-body"><div class="copy-stage-source"><b>原片表达</b><p>${escapeHtml(stage.original)}</p><button type="button" data-copy-jump-source="${index}">▶ 跳到原视频 ${escapeHtml(stage.time)}</button></div><div class="copy-stage-talk"><div><b>可复用话术</b><button type="button" data-copy-stage-copy>复制话术</button></div><p>${escapeHtml(stage.talk)}</p>${stage.slots.length ? `<div>${stage.slots.map(slot => `<span>${escapeHtml(slot)}</span>`).join("")}</div>` : ""}</div><div class="copy-stage-execution"><section><b>素材匹配要求</b><p>${escapeHtml(stage.material)}</p></section><section><b>剪辑建议</b><p>${escapeHtml(stage.edit)}</p></section></div></div></article>`).join("");
    }

    function openCopyStructureDetail(id) {
      const item = copyStructureCatalog.find(structure => structure.id === id);
      if (!item) return;
      activeCopyStructureId = id;
      document.getElementById("copyStructureDetailTitle").textContent = item.name;
      const badge = document.getElementById("copyStructureDetailSource");
      badge.textContent = copyStructureSourceLabel(item.source);
      badge.className = `badge copy-source-tag ${item.source}`;
      document.getElementById("copyStructureDetailSummary").innerHTML = `<div><small>结构名称</small><strong>${escapeHtml(item.name)}</strong></div><div><small>结构公式</small><strong>${escapeHtml(item.formula)}</strong></div><div><small>结构标签</small><span class="copy-structure-tag-pill">${copyStructureLevelLabel(item.level)}</span></div><div><small>关联产品</small><strong>${escapeHtml(item.products.join("、") || "通用")}</strong></div>`;
      renderCopyStructureStages(item);
      document.getElementById("copyStructureReferenceTabCount").textContent = String(item.related?.length || 0);
      copyStructureDetailModal.querySelectorAll("[data-copy-detail-tab]").forEach(tab => tab.classList.toggle("active", tab.dataset.copyDetailTab === "stages"));
      copyStructureDetailModal.querySelectorAll("[data-copy-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.copyDetailPanel === "stages"));
      const search = document.getElementById("copyStructureRelatedSearch");
      search.value = "";
      renderCopyStructureRelated(item);
      const clone = document.getElementById("copyStructureCloneFromDetail");
      clone.textContent = item.source === "qianchuan" ? "复制为自建" : "复制结构";
      copyStructureDetailModal.classList.add("show");
    }

    function setCopyStructureLevel(level) {
      const normalized = level === "product" ? "product" : "general";
      document.getElementById("copyStructureLevelInput").value = normalized;
      copyStructureEditorModal.querySelectorAll("[data-copy-level]").forEach(button => button.classList.toggle("active", button.dataset.copyLevel === normalized));
      const productInput = document.getElementById("copyStructureProductInput");
      productInput.disabled = normalized === "general";
      if (normalized === "general") productInput.value = "";
    }

    function openCopyStructureEditor(id = "", clone = false) {
      const source = copyStructureCatalog.find(item => item.id === id);
      editingCopyStructureId = clone ? "" : (source?.source === "custom" ? id : "");
      document.getElementById("copyStructureEditorTitle").textContent = editingCopyStructureId ? "编辑爆款内容结构" : (source ? "复制为自建结构" : "新建爆款内容结构");
      document.getElementById("copyStructureNameInput").value = source ? `${source.name}${clone ? "（副本）" : ""}` : "";
      document.getElementById("copyStructureFormulaInput").value = source?.formula || "";
      const productInput = document.getElementById("copyStructureProductInput");
      productInput.value = source?.products?.[0] || "";
      setCopyStructureLevel(source?.level || "general");
      if ((source?.level || "general") === "product") productInput.value = source?.products?.[0] || "";
      copyStructureEditorModal.classList.add("show");
    }

    document.getElementById("copyStructureSearch")?.addEventListener("input", renderCopyStructureLibrary);
    document.getElementById("copyStructureSourceFilter")?.addEventListener("change", renderCopyStructureLibrary);
    document.getElementById("copyStructureTagFilter")?.addEventListener("change", renderCopyStructureLibrary);
    document.getElementById("createCopyStructure")?.addEventListener("click", () => openCopyStructureEditor());
    document.getElementById("copyStructureRelatedSearch")?.addEventListener("input", event => {
      const item = copyStructureCatalog.find(structure => structure.id === activeCopyStructureId);
      if (item) renderCopyStructureRelated(item, event.target.value);
    });
    copyStructureEditorModal?.addEventListener("click", event => {
      const levelButton = event.target.closest("[data-copy-level]");
      if (levelButton) setCopyStructureLevel(levelButton.dataset.copyLevel);
    });
    document.getElementById("saveCopyStructure")?.addEventListener("click", () => {
      const name = document.getElementById("copyStructureNameInput").value.trim();
      const formula = document.getElementById("copyStructureFormulaInput").value.trim();
      const level = document.getElementById("copyStructureLevelInput").value;
      const product = document.getElementById("copyStructureProductInput").value;
      if (!name || !formula) return showToast("请填写结构名称和结构公式");
      if (level === "product" && !product) return showToast("产品级结构需要选择关联产品");
      const existing = copyStructureCatalog.find(item => item.id === editingCopyStructureId);
      const value = { id:existing?.id || `cs-custom-${Date.now()}`, name, formula, source:"custom", status:"生效中", level, products:level === "product" ? [product] : [], updated:copyStructureNow(), related:existing?.related || [] };
      if (existing) Object.assign(existing, value); else copyStructureCatalog.push(value);
      copyStructureEditorModal.classList.remove("show");
      renderCopyStructureTagFilter();
      renderCopyStructureLibrary();
      showToast(existing ? "结构已更新" : "自建结构已创建");
    });
    document.getElementById("copyStructureCloneFromDetail")?.addEventListener("click", () => {
      copyStructureDetailModal.classList.remove("show");
      openCopyStructureEditor(activeCopyStructureId, true);
    });
    document.querySelectorAll("[data-close-copy-structure-detail]").forEach(button => button.addEventListener("click", () => copyStructureDetailModal.classList.remove("show")));
    document.querySelectorAll("[data-close-copy-structure-editor]").forEach(button => button.addEventListener("click", () => copyStructureEditorModal.classList.remove("show")));
    copyStructureDetailModal?.addEventListener("click", event => { if (event.target === copyStructureDetailModal) copyStructureDetailModal.classList.remove("show"); });
    copyStructureEditorModal?.addEventListener("click", event => { if (event.target === copyStructureEditorModal) copyStructureEditorModal.classList.remove("show"); });
    copyStructureTbody?.addEventListener("click", event => {
      const view = event.target.closest("[data-copy-structure-view]");
      const edit = event.target.closest("[data-copy-structure-edit]");
      const copy = event.target.closest("[data-copy-structure-copy]");
      const remove = event.target.closest("[data-copy-structure-delete]");
      if (view) return openCopyStructureDetail(view.dataset.copyStructureView);
      if (edit) return openCopyStructureEditor(edit.dataset.copyStructureEdit);
      if (copy) return openCopyStructureEditor(copy.dataset.copyStructureCopy, true);
      if (remove) {
        const item = copyStructureCatalog.find(structure => structure.id === remove.dataset.copyStructureDelete);
        if (item && confirm(`确认删除自建结构“${item.name}”吗？`)) {
          copyStructureCatalog.splice(copyStructureCatalog.indexOf(item), 1);
          renderCopyStructureTagFilter();
          renderCopyStructureLibrary();
          showToast("自建结构已删除");
        }
      }
    });
    document.getElementById("copyStructureRelatedList")?.addEventListener("click", event => {
      const card = event.target.closest("[data-related-copy]");
      if (!card) return;
      if (event.target.closest("[data-play-related-video]")) return showToast(`正在播放素材 ${card.dataset.relatedCopy}`);
      if (event.target.closest("[data-expand-related-copy]")) {
        card.classList.toggle("expanded");
        event.target.textContent = card.classList.contains("expanded") ? "收起全文" : "展开全文";
      }
      if (event.target.closest("[data-copy-related-text]")) {
        navigator.clipboard?.writeText(card.querySelector("p")?.textContent || "");
        showToast("文案已复制");
      }
    });
    renderCopyStructureTagFilter();
    renderCopyStructureLibrary();


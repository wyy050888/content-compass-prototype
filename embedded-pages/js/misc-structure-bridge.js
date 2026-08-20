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

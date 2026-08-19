    function renderAgentForm(type) {
      const config = agentConfigs[type];
      if (!config) return;
      modalIntro.textContent = config.intro;
      agentProcess.textContent = config.process;
      dynamicForm.innerHTML = config.form;
      if (type === "copy") {
        referenceTranscriptState.library = { defaultValue: "", value: "" };
        referenceTranscriptState["copy-library"] = { defaultValue: "", value: "" };
        referenceTranscriptState.upload = { defaultValue: "", value: "" };
      }
      if (type === "rewrite") {
        creationContext.productSource = "library";
        rewriteSourceState.library = "";
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
      setFormFeedback("");
      if (isStructuredCopyFlow(type)) hydrateOriginalContext();
      else applyProductToForm(creationContext.productId);
      updateModalContext();
      // 产品库场景下,产品名称/品牌/类目三件套锁死(智能文案/爆款仿写/智能改写);
      // 首次进入没有 productId 时,applyProductToForm 不会触发锁定,
      // 这里补一次"表单已带默认产品"的锁定。
      if (creationContext.productSource === "library" && (isStructuredCopyFlow(type) || type === "clone" || type === "rewrite")) {
        const locked = dynamicForm.querySelector("[data-original-product-name]")?.readOnly;
        if (!locked) setLibraryProductFieldLock(true);
      }
    }

    function refreshConditionalSlots() {
      const modeControl = dynamicForm.querySelector("[data-mode-control]");
      if (!modeControl) return;
      const activeMode = modeControl.value;
      dynamicForm.querySelectorAll("[data-mode]").forEach(slot => {
        slot.classList.toggle("show", slot.dataset.mode.split(",").includes(activeMode));
      });
    }

    const referenceVideoLabels = {
      status:{ done:"已分析", pending:"待分析", running:"分析中", failed:"分析失败" },
      source:{ infinite:"无限画板", local:"本地上传", remix:"智能混剪" },
      platform:{ douyin:"抖音", kuaishou:"快手", channels:"视频号", xiaohongshu:"小红书", other:"其他" }
    };
    function referenceProductId(productName = "") {
      const normalized = productName.trim();
      return Object.entries(productCatalog).find(([, product]) => product.name === normalized)?.[0]
        || ({ "轻享空气炸锅":"air-a8" }[normalized] || "");
    }
    function formatReferenceDuration(seconds = 0) {
      return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
    }
    const referenceVideoCatalogBridge = { finished: [], external: null };
    window.addEventListener("message", event => {
      if (event.data?.type !== "content-compass-video-catalog") return;
      const finishedFrame = document.querySelector('#page-finished-videos iframe');
      const externalFrame = document.querySelector('#page-reference-videos iframe');
      if (event.source === finishedFrame?.contentWindow && event.data.source === "finished") {
        referenceVideoCatalogBridge.finished = Array.isArray(event.data.items) ? event.data.items : [];
      }
      if (event.source === externalFrame?.contentWindow && event.data.source === "external") {
        referenceVideoCatalogBridge.external = event.data.items || null;
      }
    });
    function requestReferenceVideoCatalog() {
      const message = { type:"content-compass-video-catalog-request" };
      document.querySelector('#page-finished-videos iframe')?.contentWindow?.postMessage(message, '*');
      document.querySelector('#page-reference-videos iframe')?.contentWindow?.postMessage(message, '*');
    }
    function readReferenceVideoCatalog() {
      let finished = [];
      let externalStore = null;
      try {
        const finishedFrame = document.querySelector('#page-finished-videos iframe')?.contentWindow;
        const externalFrame = document.querySelector('#page-reference-videos iframe')?.contentWindow;
        finished = Array.isArray(finishedFrame?.ContentCompassFinishedVideoCatalog) ? finishedFrame.ContentCompassFinishedVideoCatalog : [];
        externalStore = externalFrame?.ContentCompassExternalVideoCatalog || null;
      } catch (error) {
        // 本地 file:// 打开时，浏览器可能禁止父页面直接读取 iframe；保持选择器可打开。
        finished = [];
        externalStore = null;
      }
      if (!finished.length) finished = referenceVideoCatalogBridge.finished;
      if (!externalStore) externalStore = referenceVideoCatalogBridge.external;
      const external = Array.isArray(externalStore?.videos) ? externalStore.videos : [];
      const externalProducts = Array.isArray(externalStore?.products) ? externalStore.products : [];
      return [
        ...finished.map(video => ({
          id:video.id, source:"finished", productId:referenceProductId(video.product), title:video.file,
          channel:referenceVideoLabels.source[video.source] || video.source, product:video.product,
          duration:formatReferenceDuration(video.duration), origin:referenceVideoLabels.source[video.source] || video.source,
          status:referenceVideoLabels.status[video.status] || video.status, updated:video.created, tags:[...(video.tags || [])],
          file:video.file, detailLabel:"", detail:"",
          auxiliary:`${video.size} MB${video.ads?.length ? " · 已关联千川" : ""}`,
          transcript:Array.isArray(video.shots) ? video.shots.map(shot => shot.voice).filter(Boolean).join("") : ""
        })),
        ...external.map(video => {
          const product = externalProducts.find(item => item.id === video.productId);
          return {
            id:video.id, source:"external", productId:video.productId || "", title:video.title,
            channel:referenceVideoLabels.platform[video.platform] || video.platform, product:product?.name || "未关联产品",
            duration:formatReferenceDuration(video.duration), origin:video.source,
            status:referenceVideoLabels.status[video.state] || video.state, updated:video.uploadedAt, tags:[...(video.tags || [])],
            file:"", detailLabel:"文件信息", detail:`${video.size}${video.version ? ` · 拆解版本 V${video.version}` : ""}`,
            auxiliary:video.source, transcript:""
          };
        })
      ];
    }
    const referenceTranscriptState = {
      library: { defaultValue: "", value: "" },
      "copy-library": { defaultValue: "", value: "" },
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
      const resetButton = editor?.querySelector('[data-action="reset-reference-transcript"]');
      const state = referenceTranscriptState[source];
      const sourcePanel = dynamicForm.querySelector(`[data-reference-panel="${source}"]`);
      const sourceReady = source === "library" || source === "copy-library"
        ? Boolean(sourcePanel?.querySelector("[data-reference-value]")?.value)
        : source === "upload" && Boolean(sourcePanel?.querySelector("[data-reference-upload].selected"));
      const visible = Boolean(state?.defaultValue) && sourceReady && (source === "library" || source === "copy-library" || source === "upload");
      if (!editor || !textarea) return;
      editor.hidden = !visible;
      if (resetButton) resetButton.hidden = source === "copy-library";
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

    const rewriteSourceState = { library: "", paste: "" };
    const rewriteBaseStyles = ["硬广直给", "生活化口播", "专业测评", "情绪冲击", "理性对比"];
    const rewriteCustomStyles = [];
    function rewriteStyleOptionsMarkup() {
      return [...rewriteBaseStyles, ...rewriteCustomStyles].map(style => `<option>${escapeHtml(style)}</option>`).join("");
    }

    function refreshRewriteSource(initial = false) {
      const source = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      const libraryField = dynamicForm.querySelector("[data-rewrite-library-field]");
      const previous = dynamicForm.dataset.rewriteSource;
      if (!initial && previous && textarea) rewriteSourceState[previous] = textarea.value;
      dynamicForm.dataset.rewriteSource = source;
      dynamicForm.querySelectorAll("[data-rewrite-source-mode]").forEach(button => {
        const active = button.dataset.rewriteSourceMode === source;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      if (libraryField) libraryField.hidden = source !== "library";
      if (textarea) textarea.value = rewriteSourceState[source] || "";
    }

    function openRewriteLibraryPicker() {
      const value = dynamicForm.querySelector("[data-rewrite-library]");
      openScriptLibraryPicker({
        title:"从文案库选择待改写文案",
        subtitle:"选择后读取文案内容；若已关联产品，将自动带入基础信息（单选）",
        selectedId:value?.value || "",
        onConfirm(item) {
          if (!item) return;
          if (value) value.value = item.id;
          rewriteSourceState.library = item.text;
          const textarea = dynamicForm.querySelector("[data-rewrite-original]");
          if (textarea) textarea.value = item.text;
          const triggerText = dynamicForm.querySelector("[data-rewrite-library-trigger-text]");
          if (triggerText) triggerText.textContent = "重新选择文案";
          applyReferenceProduct(item.productId, "所选文案");
          setFormFeedback("");
        }
      });
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
              <button class="rewrite-audience-chip" type="button">精致妈妈</button><button class="rewrite-audience-chip" type="button">新锐白领</button><button class="rewrite-audience-chip" type="button">资深中产</button><button class="rewrite-audience-chip" type="button">Z世代</button><button class="rewrite-audience-chip" type="button">小镇青年</button><button class="rewrite-audience-chip" type="button">小镇中老年</button><button class="rewrite-audience-chip" type="button">都市蓝领</button><button class="rewrite-audience-chip" type="button">都市银发</button>
            </div></div>
            <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="rewrite-gender" data-role="rewrite-gender"><span class="choice-chip">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
            <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="rewrite-age" data-role="rewrite-age"><span class="choice-chip">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-rewrite-custom-age-trigger>自定义</span><span class="custom-age-range" data-rewrite-custom-age hidden><input type="number" min="1" max="99" value="25" data-rewrite-age-min><i>至</i><input type="number" min="1" max="99" value="35" data-rewrite-age-max></span></div></div>
          </div>
          <input type="hidden" data-field="rewriteTarget" data-required value="">
          <div class="rewrite-audience-details">
            <div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div>
            <textarea data-field="pain" placeholder="一行一个人群核心痛点">床单刚换，尘杯仍吸出毛发碎屑\n宠物上床后，床褥清洁总停在表面</textarea>
            <div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div>
            <textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea>
          </div>`,
        selling: `<label>需要前置的卖点<span class="required-star">*</span></label><select data-field="rewriteTarget" data-required><option>${escapeHtml(currentProduct().core || "核心卖点")}</option><option>${escapeHtml(currentProduct().secondary || "次要卖点")}</option><option>${escapeHtml(currentProduct().difference || "差异化卖点")}</option></select>`,
        style: `<label>目标表达风格<span class="required-star">*</span></label>
          <div class="rewrite-style-control"><select data-field="rewriteTarget" data-required data-rewrite-style-select>${rewriteStyleOptionsMarkup()}</select><button class="soft-btn" type="button" data-add-rewrite-style>＋ 新增风格</button></div>
          <div class="rewrite-style-editor" data-rewrite-style-editor hidden><input data-rewrite-style-input maxlength="20" placeholder="输入新的表达风格"><button class="primary-btn" type="button" data-save-rewrite-style>添加</button><button class="ghost-btn" type="button" data-cancel-rewrite-style>取消</button></div>`
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
      const hasLibrarySelection = (source === "library" || source === "copy-library") && Boolean(activePanel?.querySelector("[data-reference-value]")?.value);
      const hasUpload = source === "upload" && Boolean(activePanel?.querySelector("[data-reference-upload].selected"));
      if (stepPanel) stepPanel.dataset.referenceReady = hasLibrarySelection || hasUpload ? "true" : "false";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = source === "copy-library" || !(hasLibrarySelection || hasUpload);
      }
      refreshReferenceTranscriptEditor(source);
    }

    function waitForReferenceVideoCatalog(timeoutMs = 2000) {
      return new Promise(resolve => {
        const startedAt = Date.now();
        const checkCatalog = () => {
          requestReferenceVideoCatalog();
          const items = readReferenceVideoCatalog();
          if (items.length || Date.now() - startedAt >= timeoutMs) {
            resolve(items);
            return;
          }
          window.setTimeout(checkCatalog, 100);
        };
        checkCatalog();
      });
    }

    async function openReferenceVideoPicker() {
      if (!window.CreationVideoPicker) {
        setFormFeedback("视频选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const selectedId = dynamicForm.querySelector('[data-reference-panel="library"] [data-reference-value]')?.value || "";
      let items = readReferenceVideoCatalog();
      if (!items.length) requestReferenceVideoCatalog();
      window.CreationVideoPicker.open({
        items,
        selectedId,
        loading:!items.length,
        onConfirm(video) { if (video) selectReferenceVideo(video); }
      });
      if (!items.length) {
        setFormFeedback("正在加载视频库，请稍候……");
        items = await waitForReferenceVideoCatalog();
        window.CreationVideoPicker.setItems?.(items);
      }
      if (!items.length) setFormFeedback("当前视频库暂无可选视频，可先前往成片视频或外部参考视频导入内容。", "error");
      else setFormFeedback("");
    }

    function applyReferenceProduct(productId, sourceLabel) {
      if (!productId || !productCatalog[productId]) {
        showToast(`${sourceLabel}未关联产品，已保留当前基础信息`);
        return false;
      }
      creationContext.productId = productId;
      creationContext.productName = productCatalog[productId].name;
      setProductSource("library");
      applyProductToForm(productId);
      showToast(`已自动带入关联产品：${productCatalog[productId].name}`);
      return true;
    }

    function selectReferenceVideo(video) {
      const panel = dynamicForm.querySelector('[data-reference-panel="library"]');
      const value = panel?.querySelector("[data-reference-value]");
      const title = video.title || "已选参考视频";
      const sourceLabel = video.source === "finished" ? "成片视频" : "外部参考视频";
      const meta = `${sourceLabel} · ${video.channel} · ${video.product} · ${video.duration}`;
      if (value) value.value = video.id || title;
      if (video.transcript) showReferenceTranscript("library", video.transcript);
      else {
        referenceTranscriptState.library = { defaultValue:"", value:"" };
        refreshReferenceTranscriptEditor("library");
      }
      const selected = dynamicForm.querySelector("[data-selected-reference]");
      if (selected) {
        selected.hidden = false;
        selected.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(meta)}</span>`;
      }
      const triggerText = dynamicForm.querySelector("[data-reference-trigger-text]");
      if (triggerText) triggerText.textContent = "重新选择视频";
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      if (stepPanel) stepPanel.dataset.referenceReady = "true";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = video.transcript
          ? "<strong>已带入</strong><span>已读取视频库现有口播内容，可在本次任务中继续修改。</span>"
          : "<strong>已带入</strong><span>已读取视频库现有基础信息；当前资产未提供可编辑口播原文。</span>";
      }
      applyReferenceProduct(video.productId, "所选视频");
      setFormFeedback("");
    }

    function openReferenceCopyPicker() {
      const panel = dynamicForm.querySelector('[data-reference-panel="copy-library"]');
      openScriptLibraryPicker({
        title:"从文案库选择参考文案",
        subtitle:"选择后读取文案内容与结构；若已关联产品，将自动带入基础信息（单选）",
        selectedId:panel?.querySelector("[data-reference-value]")?.value || "",
        onConfirm(item) { if (item) selectReferenceCopy(item); }
      });
    }

    function selectReferenceCopy(item) {
      const panel = dynamicForm.querySelector('[data-reference-panel="copy-library"]');
      const value = panel?.querySelector("[data-reference-value]");
      if (value) value.value = item.id;
      showReferenceTranscript("copy-library", item.text);
      const triggerText = panel?.querySelector("[data-reference-copy-trigger-text]");
      if (triggerText) triggerText.textContent = "重新选择文案";
      const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
      if (stepPanel) stepPanel.dataset.referenceReady = "true";
      const feedback = dynamicForm.querySelector("[data-reference-feedback]");
      if (feedback) {
        feedback.hidden = true;
        feedback.innerHTML = "";
      }
      applyReferenceProduct(item.productId, "所选文案");
      setFormFeedback("");
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
          button.textContent = source === "text" ? "重新分析" : "重新解析";
        }
        setFormFeedback("");
        showToast("参考内容解析完成");
      }, 420);
    }

    function refreshWordDuration(input) {
      const inputs = input ? [input] : [...dynamicForm.querySelectorAll("[data-word-count]")];
      inputs.forEach(wordInput => {
        const durationOutput = wordInput.closest(".field, .original-field")?.querySelector("[data-duration]");
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
      if (open) {
        setSidebarCollapsed(true, false);
        openAgentTask();
      }
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

    function selectCreationHome() {
      activeAgent = "";
      activeType = "";
      agentSelectionPending = false;
      agentCards.forEach(item => item.classList.remove("selected"));
      agentPill.textContent = "选择 Agent";
      agentPillButton.classList.add("required");
      agentOptions.forEach(option => {
        option.classList.remove("selected");
        option.querySelector(".agent-option-check").textContent = "";
        option.setAttribute("aria-selected", "false");
      });
      promptInput.disabled = true;
      sendPromptButton.disabled = true;
      modelPicker.hidden = true;
      setAgentPicker(false);
      setModelPicker(false);
    }

    function resetCreationWorkspace() {
      exitAgentTask();
      chatOutput.classList.remove("show");
      chatOutput.innerHTML = "";
      renderConversationLocator();
      conversationTurnCount = 0;
      agentTurnCounts = {};
      document.getElementById("followupHint").classList.remove("show");
      document.querySelector("#page-creation .creation-stage").classList.add("home-mode");
      agentBrowser.style.display = "block";
      emptyHero.style.display = "block";
      promptInput.value = "";
      selectCreationHome();
      sessionAssets = [];
      pendingSourceAssetId = "";
      Object.assign(creationContext, {
        productId: "",
        productName: "",
        productSource: "library",
        productConfirmed: false,
        productSaved: true,
        originalFields: { marketingScene: "直播间引流" },
        customPresets: []
      });
      Object.keys(originalSuggestionIndex).forEach(key => delete originalSuggestionIndex[key]);
      Object.keys(originalSuggestionPrevious).forEach(key => delete originalSuggestionPrevious[key]);
      originalSuggestionDirty.clear();
      renderSessionAssets();
      activateAssetType("copy");
      setAssetPanel(false);
    }

    function beginAgentCreation(card) {
      if (!card) return;
      setSidebarCollapsed(true, false);
      if (card.dataset.type === "image-main") return switchPage("image-main-agent");
      if (card.dataset.type === "image-detail") return switchPage("image-detail-agent");
      const title = card.querySelector("strong")?.textContent?.trim() || "新建创作";
      resetCreationWorkspace();
      createSessionSummaryRow(`${title}创作`);
      selectAgent(card, true);
      setNewCreateMenu(false);
      showToast(`已进入${title}流程`);
    }

    function openMixWithProductScript(script) {
      const card = agentCards.find(item => item.dataset.type === "mix");
      if (!card || !script) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能混剪创作");
      selectAgent(card, true);
      const root = dynamicForm.querySelector(".mix-flow-form");
      const productId = Object.entries(mixProductNames).find(([, name]) => name === script.product)?.[0];
      const product = dynamicForm.querySelector("[data-mix-product]");
      if (productId && product) {
        product.value = productId;
        syncMixProductMaterials(productId);
      }
      if (root) root._mixExternalScript = script;
      root?.querySelector('[data-mix-plan="script"]')?.click();
      const source = dynamicForm.querySelector("[data-mix-existing-script]");
      if (source) {
        const option = document.createElement("option");
        option.value = script.id;
        option.dataset.product = productId || "";
        option.textContent = `${script.name}｜${script.rows?.length || 0} 段`;
        source.prepend(option);
        source.value = script.id;
        source.dispatchEvent(new Event("change", { bubbles:true }));
      }
      showToast(`已带入脚本“${script.name}”`);
    }

    function openScriptWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "script");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能脚本创作");
      selectAgent(card, true);
      const source = dynamicForm.querySelector("[data-script-source-library]");
      if (!source) return;
      source.value = copy.id;
      refreshScriptLibraryTrigger();
      syncScriptSourcePreviewFromLibrary();
      const productInput = dynamicForm.querySelector('[data-script-product-panel="library"] [data-script-product]');
      if (productInput) {
        productInput.value = productCatalog[copy.productId]?.name || copy.productId || "";
        productInput.dataset.productId = copy.productId || "";
        productInput.setAttribute("data-product-id", copy.productId || "");
      }
      syncScriptLibraryProductDisplay();
      showToast("已带入文案，可继续选择素材并生成脚本");
    }

    function openMixWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "mix");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能混剪创作");
      selectAgent(card, true);
      const root = dynamicForm.querySelector(".mix-flow-form");
      const product = dynamicForm.querySelector("[data-mix-product]");
      if (copy.productId && product) {
        product.value = copy.productId;
        syncMixProductMaterials(copy.productId);
      }
      if (root) root._mixExternalCopy = copy;
      root?.querySelector('[data-mix-plan="copy"]')?.click();
      const source = dynamicForm.querySelector("[data-mix-existing-copy]");
      if (source) {
        const option = document.createElement("option");
        const count = copy.text.replace(/\s/g, "").length;
        option.value = copy.id;
        option.dataset.product = copy.productId || "";
        option.textContent = `${copy.audience || "已有文案"}口播｜${mixProductNames[copy.productId] || "未关联产品"}｜约${Math.max(1, Math.round(count / 3.35))}秒`;
        source.prepend(option);
        source.value = copy.id;
        source.dispatchEvent(new Event("change", { bubbles:true }));
      }
      showToast("已带入文案，可继续确认配音与素材");
    }

    function openRewriteWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "rewrite");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("智能改写创作");
      selectAgent(card, true);
      dynamicForm.querySelector('[data-rewrite-source-mode="paste"]')?.click();
      const textarea = dynamicForm.querySelector("[data-rewrite-original]");
      if (textarea) {
        textarea.value = copy.text;
        textarea.dispatchEvent(new Event("input", { bubbles:true }));
      }
      const product = dynamicForm.querySelector("[data-manual-product-name]");
      if (product) product.value = productCatalog[copy.productId]?.name || "";
      showToast("已带入待改写文案，原资产不会被覆盖");
    }

    function openImitationWithProductCopy(copy) {
      const card = agentCards.find(item => item.dataset.type === "copy");
      if (!card || !copy) return;
      switchPage("creation");
      resetCreationWorkspace();
      createSessionSummaryRow("爆款仿写创作");
      selectAgent(card, true);
      const source = dynamicForm.querySelector("[data-reference-source]");
      if (source) {
        source.value = "text";
        source.dispatchEvent(new Event("change", { bubbles:true }));
      }
      const reference = dynamicForm.querySelector('[data-reference-panel="text"] [data-reference-value]');
      if (reference) reference.value = copy.text;
      const product = dynamicForm.querySelector("[data-manual-product-name]");
      if (product) product.value = productCatalog[copy.productId]?.name || "";
      showToast("已将该文案作为参考内容带入，系统只学习结构与节奏");
    }

    window.addEventListener("content-compass:mix-script", event => openMixWithProductScript(event.detail?.script));
    window.addEventListener("content-compass:script-copy", event => openScriptWithProductCopy(event.detail?.copy));
    window.addEventListener("content-compass:mix-copy", event => openMixWithProductCopy(event.detail?.copy));
    window.addEventListener("content-compass:rewrite-copy", event => openRewriteWithProductCopy(event.detail?.copy));
    window.addEventListener("content-compass:imitate-copy", event => openImitationWithProductCopy(event.detail?.copy));

    function handleAgentCardTrigger(event) {
      const card = event.target.closest?.("#agentGrid .agent-card[data-agent]");
      if (!card || event.__agentCardHandled) return;
      event.__agentCardHandled = true;
      event.preventDefault();
      beginAgentCreation(card);
    }

    // 使用捕获阶段的事件委托：卡片被重绘或其他模块阻止冒泡时，入口仍然可用。
    document.addEventListener("click", handleAgentCardTrigger, true);

    agentOptions.forEach(option => {
      option.addEventListener("click", () => {
        const card = agentCards.find(item => item.dataset.type === option.dataset.agentType);
        if (card) selectAgent(card, true);
      });
    });

    function closeModal(commit = false) {
      if (isStructuredCopyFlow() && dynamicForm.children.length) captureOriginalContext();
      modal.classList.remove("show");
      if (agentSelectionPending && !commit) {
        agentSelectionPending = false;
        selectCreationHome();
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
    const taskChatToggle = document.getElementById("taskChatToggle");
    function setTaskChatCollapsed(collapsed) {
      taskShell.classList.toggle("chat-collapsed", collapsed);
      if (!taskChatToggle) return;
      taskChatToggle.setAttribute("aria-expanded", String(!collapsed));
      taskChatToggle.textContent = collapsed ? "‹" : "›";
      taskChatToggle.title = collapsed ? "展开对话" : "收起对话";
    }
    taskChatToggle?.addEventListener("click", () => setTaskChatCollapsed(!taskShell.classList.contains("chat-collapsed")));
    function personaPickerMarkup(context) {
      return `<div class="original-field full persona-select-field">
        <label>人群画像</label>
        <div class="persona-picker" data-persona-picker data-persona-context="${context}" data-persona-mode="manual">
          <div class="persona-source-switch" role="group" aria-label="人群画像来源">
            <button class="active" type="button" data-persona-source-mode="manual">自行输入</button>
            <button type="button" data-persona-source-mode="template">从模板库选择</button>
          </div>
          <div class="persona-template-select" data-persona-template-select hidden>
            <button class="persona-picker-trigger" type="button" data-persona-trigger aria-haspopup="dialog"><span data-persona-selected>选择人群画像模板</span><small>⌄</small></button>
            <div class="persona-applied" data-persona-applied hidden><span></span><button type="button" data-persona-clear>改为自行输入</button></div>
          </div>
        </div>
      </div>`;
    }
    function creationProductPickerMarkup(hasSourcePanel = false) {
      return `<div class="header-product-picker"${hasSourcePanel ? ' data-product-source-panel="library"' : ""}>
        <button class="header-product-picker-trigger" type="button" data-open-creation-product-picker aria-haspopup="dialog">
          <span class="placeholder" data-product-picker-label>选择产品</span><small>⌄</small>
        </button>
        <input type="hidden" data-product-select data-required value="">
      </div>`;
    }

    function openCreationProductPicker() {
      if (!window.CreationProductPicker) {
        setFormFeedback("产品选择器加载失败，请刷新页面后重试。", "error");
        return;
      }
      const items = Object.entries(productCatalog).map(([id, product]) => ({ id, ...product }));
      window.CreationProductPicker.open({
        items,
        selectedId: creationContext.productId,
        onConfirm(productId) {
          applyProductToForm(productId, true, true);
          setFormFeedback(`已选择“${productCatalog[productId].name}”，产品信息已自动带入。`);
        }
      });
    }
    agentConfigs.original.intro = "基于产品事实、目标人群与内容设定，生成可直接用于千川短视频创作的多版本口播文案。";
    agentConfigs.original.process = "确认产品信息 → 设置开场、文案结构、脚本类型、长度与模型 → 生成文案 → 保存、转脚本或继续对话修改。";
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
              ${creationProductPickerMarkup(true)}
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
              <div class="original-field full advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
              <div class="original-field full"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip">短视频带货</span><span class="choice-chip active">直播间引流</span></div></div>
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
                  <div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div>
                  <div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender" data-audience-locked-gender=""><span class="choice-chip">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div>
                  <div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">50+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="age-custom" data-custom-age hidden><input type="number" min="1" max="99" value="25" data-age-min><span>至</span><input type="number" min="1" max="99" value="40" data-age-max></span></div></div>
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
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定口播的开场方式、文案结构、脚本类型、长度和生成模型。</p></div></div>
          <div class="original-group">
            <div class="original-group-title"><strong>内容脚本设定</strong><span>控制本次文案的结构与产出规格</span></div>
            <div class="original-group-fields">
              <div class="original-field full"><label>脚本类型<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="script-type" data-role="script-type"><span class="choice-chip active">不限</span><span class="choice-chip">引发好奇类型</span><span class="choice-chip">痛点类型</span><span class="choice-chip">活动类型</span><span class="choice-chip">悬疑类型</span><span class="choice-chip">打感情类型</span><span class="choice-chip">对比类型</span><span class="choice-chip">种草类型</span><span class="choice-chip">网络爆款音频类型</span><span class="choice-chip">制造焦虑类型</span><span class="choice-chip">明星文案类型</span><span class="choice-chip">点名人群类型</span><span class="choice-chip">正话反说类型</span><span class="choice-chip">品牌类型</span></div></div>
              <div class="original-field full">
                <label>文案结构</label>
                <div class="copy-structure-combobox" data-copy-structure-combobox>
                  <input type="hidden" value="" data-copy-structure-value>
                  <button class="copy-structure-combobox-trigger" type="button" data-action="toggle-copy-structure-picker" aria-haspopup="dialog"><span><b data-copy-structure-label>不选择（AI 自动匹配）</b><small data-copy-structure-formula id="copyStructureHint">不指定结构时，AI 会结合产品信息自动匹配。</small></span><em data-copy-structure-source>AI 自动匹配</em><i>›</i></button>
                </div>
              </div>
              <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="300" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 1 分 15 秒</b></div></div>
              <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
              <div class="original-field full"><label>模型</label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
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
              <div class="original-field"><label>参考来源<span class="required-star">*</span></label><select data-reference-source data-required><option value="library">从视频库选择</option><option value="copy-library">从文案库选择</option><option value="upload">上传视频</option><option value="text">粘贴文案</option></select></div>
              <div class="original-field" data-reference-panel="library">
                <label>参考视频<span class="required-star">*</span></label>
                <input type="hidden" data-reference-value data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-reference-library"><span data-reference-trigger-text>从视频库选择</span><b>›</b></button>
                <div class="selected-reference-video" data-selected-reference hidden></div>
              </div>
              <div class="original-field" data-reference-panel="copy-library" hidden>
                <label>参考文案<span class="required-star">*</span></label>
                <input type="hidden" data-reference-value data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-reference-copy-library"><span data-reference-copy-trigger-text>从文案库选择</span><b>›</b></button>
              </div>
              <div class="original-field full" data-reference-panel="upload" hidden><label>上传参考视频<span class="required-star">*</span></label><div class="upload-box reference-upload" data-reference-upload><strong>点击选择或拖拽上传视频</strong><span>上传后自动识别口播文案、结构和表达节奏</span></div></div>
              <div class="original-field full" data-reference-panel="text" hidden><label>参考文案<span class="required-star">*</span></label><textarea data-reference-value data-required placeholder="粘贴需要参考的完整口播文案"></textarea></div>
              <div class="original-field full reference-transcript-editor" data-reference-transcript-editor hidden>
                <div class="reference-transcript-head"><label>识别文案<span class="required-star">*</span></label><button type="button" data-action="reset-reference-transcript">恢复识别原文</button></div>
                <textarea data-reference-transcript data-required placeholder="视频中的口播文案将在识别后显示，可直接修改"></textarea>
              </div>
              <div class="inline-feedback full" data-reference-feedback hidden></div>
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
                ${creationProductPickerMarkup(true)}
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
              <div class="original-field advanced-field" hidden><label>营销场景</label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip">短视频带货</span><span class="choice-chip active">直播间引流</span></div></div>
              <div class="original-field full advanced-field" hidden><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前产品真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title"><strong>人群与表达策略</strong><span>确定仿写内容最终对谁表达</span></div>
            <div class="original-group-fields">
              ${personaPickerMarkup("copy")}
              <div class="original-field full"><label>核心目标人群<span class="required-star">*</span></label><div class="audience-selector"><div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div><div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender" data-audience-locked-gender=""><span class="choice-chip">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div><div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">不限</span><span class="choice-chip">18–23</span><span class="choice-chip">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">51+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="custom-age-range" data-custom-age hidden><input type="number" min="1" max="99" value="25" data-age-min><i>至</i><input type="number" min="1" max="99" value="40" data-age-max></span></div></div></div></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain" placeholder="一行一个人群核心痛点">孩子后背红疹反复，半夜痒醒哭闹\n床单刚换，尘杯仍吸出毛发碎屑</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes" placeholder="一行一个使用场景">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div>
            </div>
          </div>
        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>生成设置</h2><p>确定仿写文案的长度、生成数量和使用模型。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="300" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 1 分 15 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型</label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
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
            <div><h2>文案与产品信息</h2><p>选择待改写文案，并确认改写时允许使用的产品事实。</p></div>
            <div class="original-header-controls">
              <button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button>
            </div>
          </div>

          <div class="original-group rewrite-source-group">
            <div class="original-group-title"><strong>文案信息</strong><span>从文案库选择或手动输入，原资产不会被覆盖</span></div>
            <div class="original-group-fields">
              <div class="original-field"><label>文案来源<span class="required-star">*</span></label><input type="hidden" data-rewrite-source data-required value="library"><div class="source-mode-switch" role="tablist" aria-label="文案来源切换"><button type="button" class="active" data-rewrite-source-mode="library" role="tab" aria-selected="true">从文案库选择</button><button type="button" data-rewrite-source-mode="paste" role="tab" aria-selected="false">手动输入</button></div></div>
              <div class="original-field" data-rewrite-library-field>
                <label>选择文案<span class="required-star">*</span></label>
                <input type="hidden" data-rewrite-library data-required>
                <button class="reference-library-trigger" type="button" data-action="toggle-rewrite-copy-library"><span data-rewrite-library-trigger-text>从文案库选择</span><b>›</b></button>
              </div>
              <div class="original-field full"><label>待改写文案<span class="required-star">*</span></label><textarea data-rewrite-original data-field="sourceCopy" data-required placeholder="选择文案后自动带入，仍可在本次任务中修改"></textarea></div>
            </div>
          </div>

          <div class="original-group">
            <div class="original-group-title copy-basic-title">
              <div><strong>基础信息</strong><span>默认带入所选文案的关联产品，也可重新指定</span></div>
              <div class="copy-basic-controls">
                <div class="source-switch" aria-label="产品信息来源">
                  <button class="active" type="button" data-product-source="library">产品库</button>
                  <button type="button" data-product-source="link">商品链接</button>
                  <button type="button" data-product-source="manual">手工输入</button>
                </div>
                ${creationProductPickerMarkup(true)}
              </div>
            </div>
            <div class="original-group-fields">
              <div class="product-source-inline full">
                <div data-product-source-panel="link" hidden><div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div></div>
                <div data-product-source-panel="manual" hidden></div>
              </div>
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
              <div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip">短视频带货</span><span class="choice-chip active">直播间引流</span></div></div>
              <div class="original-field full"><label>营销策略</label><textarea data-field="marketing" placeholder="填写当前真实价格、优惠、赠品或活动信息">暑期活动，到手赠送 3 个替换滤网</textarea></div>
              <div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>
            </div>
          </div>

        </section>

        <section class="original-step-panel" data-original-step="2" data-task-step="2" hidden>
          <div class="original-step-title"><div><h2>改写设置</h2><p>只修改选定范围，未指定的原文结构、事实、卖点顺序和 CTA 默认保持不变。</p></div></div>
          <div class="original-group"><div class="original-group-fields">
            <div class="original-field full"><label>改写方式<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="rewrite-method" data-role="rewrite-method"><span class="choice-chip active" data-rewrite-method="hook">只换前 3 秒钩子</span><span class="choice-chip" data-rewrite-method="shorten">缩短文案</span><span class="choice-chip" data-rewrite-method="audience">更换目标人群</span><span class="choice-chip" data-rewrite-method="selling">卖点前置</span><span class="choice-chip" data-rewrite-method="style">调整表达风格</span><span class="choice-chip" data-rewrite-method="rephrase">保留结构重新表达</span></div></div>
            <div class="original-field full" data-rewrite-setting-host></div>
            <div class="original-field"><label>口播字数<span class="required-star">*</span></label><div class="number-control"><input type="number" min="30" max="2000" value="300" data-word-count data-required><span>字</span></div><div class="duration-estimate">预计口播时长 <b data-duration>约 1 分 15 秒</b></div></div>
            <div class="original-field"><label>生成数量<span class="required-star">*</span></label><div class="number-control"><input type="number" min="1" max="10" value="3" data-generation-count data-required><span>条</span></div></div>
            <div class="original-field full"><label>模型</label><section class="task-model-card original-model-card" data-original-model-host data-task-step="2"></section></div>
          </div></div>
        </section>
      </div>`;

    const agentStepPlans = {
      original: ["产品信息", "生成设置", "AI生成文案"],
      copy: ["爆款参考与产品信息", "生成设置", "AI生成文案"],
      rewrite: ["文案与产品信息", "改写设置", "AI生成文案"],
      "image-main": ["产品与主图目标", "画面要求", "选择模型", "确认生成"],
      "image-detail": ["产品与详情页模块", "画面约束", "选择模型", "确认生成"],
      script: ["文案信息", "脚本策略", "分镜脚本"],
      "script-copy": ["参考脚本", "重构策略", "确认生成"],
      mix: ["创作方案", "文案与配音", "分镜确认", "生成视频"],
    };
    const agentGreetings = {
      original: "我是智能文案 Agent。我会基于产品事实、目标人群和内容设定生成千川口播文案。请先确认左侧产品信息。",
      copy: "我是爆款文案仿写 Agent。我会保留参考内容的有效方法，再为你的产品重新创作。",
      rewrite: "我是智能改写 Agent。我会保留你指定的内容，按目标完成可控改写。",
      "image-main": "我是商品主图 Agent。我会根据产品图、卖点和投放用途生成可继续调整的商品主图。",
      "image-detail": "我是商品详情页 Agent。我会把产品卖点拆成有阅读顺序、可继续编辑的详情页图片模块。",
      script: "我是智能脚本 Agent。我会基于已确认口播文案、产品事实和素材库,输出可人工审核的结构化分镜脚本与推荐素材方案。",
      "script-copy": "我是爆款脚本仿写 Agent。我会借鉴参考脚本的节奏与镜头逻辑，为当前产品重新设计。",
      mix: "我是智能混剪 Agent。我会使用你已有的创作素材，先协助确认文案与 AI 配音，再完成镜头匹配、裁切拼接和成片质检。"
    };
    let taskStep = 1;
    let taskCompleted = false;
    let taskEditing = false;
    let originalTaskAssetIds = [];
    let originalCopyTargetId = "";
    let scriptTargetId = "";

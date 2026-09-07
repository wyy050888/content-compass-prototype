(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const editor = { taskId: null, sourceTaskId: "", rules: [], productId: "", sourceImage: null, isNew: false, editable: false, token: 0, fileTarget: null, submitting: false };
  let uid = 0;
  const nextId = prefix => `${prefix}-${Date.now()}-${uid += 1}`;
  const copyImage = image => ({ ...image });
  const hoverPreview = document.createElement("div");
  hoverPreview.className = "pc-rule-hover-preview";
  hoverPreview.setAttribute("aria-hidden", "true");
  app.root.appendChild(hoverPreview);

  function normalizeImage(image, index) {
    return { id: image.id || nextId("IMG"), name: image.name || image.imageName || `垫图${index + 1}.jpg`, url: image.url || image.imageUrl || "", width: image.width || 1080, height: image.height || 1080, tone: image.tone || index % 6 + 1, source: image.source || "task" };
  }
  function normalizeRule(rule, index) {
    const legacy = rule.imageName ? [{ id: nextId("LEGACY"), name: rule.imageName, url: rule.imageUrl || "" }] : [];
    const images = (rule.images || legacy).map(normalizeImage);
    return { id: rule.id || nextId("RULE"), images, prompt: rule.prompt || "", promptState: rule.promptState || (rule.prompt ? "ready" : "idle"), promptVersion: rule.promptVersion || 0, promptSource: rule.promptSource || "manual", quantity: Number(rule.quantity || 2), isNew: false };
  }
  function totalQuantity() { return editor.rules.reduce((sum, rule) => sum + Number(rule.quantity || 0), 0); }
  function remainingRuleCount() { return Math.max(0, 50 - editor.rules.length); }
  function remainingImageCount() { return Math.max(0, 200 - totalQuantity()); }
  function insertLimit() { return Math.min(remainingRuleCount(), Math.floor(remainingImageCount() / 2)); }
  function generatingCount() { return editor.rules.filter(rule => rule.promptState === "generating").length; }
  function currentTask() { return editor.taskId ? app.data.generationTasks.find(task => task.id === editor.taskId) : null; }

  function imageVisual(image) {
    return image.url ? `<img src="${image.url}" alt="${app.escape(image.name)}">` : `<span class="pc-tone-${image.tone || 1}"></span>`;
  }
  function sourcePicker() {
    const image = editor.sourceImage;
    return `<div class="pc-source-picker"><div class="pc-source-preview">${image ? imageVisual(image) : "1:1<br>商品主图"}</div><div class="pc-source-actions"><strong>${image ? app.escape(image.name) : "选择一张商品主图"}</strong><small>PNG、JPG、JPEG · 仅 1 张 · 不超过 10 MB · 1:1${app.tip("重新上传会替换当前商品主图；格式、大小或比例不符合要求时不会进入识别。")}</small><button type="button" data-source-local>${image ? "重新上传" : "本地上传"}</button><button type="button" data-source-library>从图片库选择</button></div></div>`;
  }
  function strategyBody(task) {
    return `<div class="pc-form"><div class="pc-form-grid"><label class="pc-field"><span>任务名称</span><input id="pcTaskName" maxlength="50" value="${app.escape(task?.name || "")}" ${editor.editable ? "" : "disabled"}><small class="pc-field-help">最多 50 个字符</small></label><label class="pc-field"><span>产品名称</span><select id="pcTaskProduct" ${editor.editable && editor.isNew ? "" : "disabled"}>${app.data.products.map(product => `<option value="${product.id}" ${product.id === editor.productId ? "selected" : ""}>${app.escape(product.name)}</option>`).join("")}</select></label>${editor.isNew ? `<div class="pc-field pc-field-wide"><span>商品主图</span>${sourcePicker()}</div>` : ""}</div>${task?.failureReason ? `<div class="pc-note-error">${app.escape(task.failureReason)}</div>` : ""}<div id="pcUploadFeedback" aria-live="polite"></div><input type="file" id="pcSourceLocalInput" accept=".png,.jpg,.jpeg,image/png,image/jpeg" hidden><input type="file" id="pcRuleLocalInput" accept=".png,.jpg,.jpeg,image/png,image/jpeg" hidden><div id="pcRuleEditor"></div></div>`;
  }
  function strategyFooter() {
    if (!editor.editable) return `<button class="pc-btn" data-pc-close-drawer>关闭</button>`;
    return `<button class="pc-btn" id="pcSaveDraft">保存草稿</button><button class="pc-btn pc-btn-primary" id="pcSubmitGeneration">提交生成</button>`;
  }

  function promptMarkup(rule) {
    if (rule.promptState === "generating") return `<div class="pc-prompt-skeleton" aria-label="提示词生成中"><i></i></div>`;
    if (rule.promptState === "failed") return `<div class="pc-prompt-error"><span>提示词生成失败</span><button type="button" data-rule-action="retry-prompt">重新生成</button></div>`;
    return `<textarea class="pc-rule-prompt" data-rule-prompt ${editor.editable ? "" : "disabled"}>${app.escape(rule.prompt)}</textarea>`;
  }
  function imageThumb(image, editable) {
    return `<span class="pc-rule-thumb" data-image-id="${image.id}" title="${app.escape(image.name)}">${imageVisual(image)}${editable ? `<span class="pc-rule-thumb-overlay"><button type="button" data-rule-image-action="replace" aria-label="替换图片" title="替换">↻</button><button type="button" data-rule-image-action="delete" aria-label="删除图片" title="删除">×</button></span>` : ""}</span>`;
  }
  function hideHoverPreview() {
    hoverPreview.classList.remove("show");
    hoverPreview.setAttribute("aria-hidden", "true");
    hoverPreview.innerHTML = "";
  }
  app.hideStrategyImagePreview = hideHoverPreview;
  function showHoverPreview(thumb) {
    const row = thumb.closest(".pc-rule-row");
    const rule = editor.rules.find(item => item.id === row?.dataset.ruleId);
    const image = rule?.images.find(item => item.id === thumb.dataset.imageId);
    if (!image) return;
    hoverPreview.innerHTML = `<div class="pc-rule-hover-image">${imageVisual(image)}</div><div class="pc-rule-hover-meta"><strong>${app.escape(image.name)}</strong><span>${image.width} × ${image.height}</span></div>`;
    hoverPreview.classList.add("show");
    hoverPreview.setAttribute("aria-hidden", "false");
    const rect = thumb.getBoundingClientRect();
    const previewWidth = 322;
    const previewHeight = 356;
    let left = rect.right + 12;
    if (left + previewWidth > window.innerWidth - 12) left = rect.left - previewWidth - 12;
    const top = Math.max(12, Math.min(rect.top - 18, window.innerHeight - previewHeight - 12));
    hoverPreview.style.left = `${Math.max(12, left)}px`;
    hoverPreview.style.top = `${top}px`;
  }
  function ruleImages(rule) {
    return `<div class="pc-rule-images">${rule.images.map(image => imageThumb(image, editor.editable)).join("")}${editor.editable ? `<button class="pc-rule-image-add" type="button" data-rule-image-action="add-local">＋ 添加</button><span class="pc-rule-image-menu"><button type="button" data-rule-image-action="add-local">本地上传</button><button type="button" data-rule-image-action="add-library">图片库选择</button></span>` : ""}</div>`;
  }
  function ruleRow(rule, index) {
    const insertRemaining = insertLimit();
    const copyDisabled = remainingRuleCount() < 1 || remainingImageCount() < rule.quantity;
    return `<div class="pc-rule-row ${rule.isNew ? "is-new" : ""}" data-rule-id="${rule.id}"><label class="pc-rule-check"><input type="checkbox" data-rule-check ${editor.editable ? "" : "disabled"}></label><span class="pc-rule-seq">${index + 1}</span>${ruleImages(rule)}<div class="pc-rule-prompt-wrap">${promptMarkup(rule)}</div><input class="pc-rule-qty" type="number" min="1" max="20" value="${rule.quantity}" data-rule-qty ${editor.editable ? "" : "disabled"}><div class="pc-rule-actions">${editor.editable ? `<span class="pc-inline-insert"><button type="button" data-rule-action="insert" ${insertRemaining ? "" : "disabled"}>向下插入</button><input class="pc-inline-input" type="number" min="1" max="${Math.max(1, insertRemaining)}" value="1" aria-label="插入行数" ${insertRemaining ? "" : "disabled"}><span>行</span></span><button type="button" data-rule-action="copy" ${copyDisabled ? "disabled" : ""}>复制</button><button type="button" data-rule-action="delete">删除</button>` : `<span class="pc-note-inline">—</span>`}</div></div>`;
  }
  function updateSummary() {
    const node = app.els.drawerBody.querySelector("#pcRuleSummary");
    if (!node) return;
    const total = totalQuantity();
    node.textContent = `${editor.rules.length}/50 条规则 · ${total}/200 张 · 剩余 ${remainingRuleCount()} 条 / ${remainingImageCount()} 张`;
    node.classList.toggle("pc-capacity-error", editor.rules.length > 50 || total > 200);
    const remaining = insertLimit();
    const add = app.els.drawerBody.querySelector("#pcAddRule");
    if (add) add.disabled = remaining < 1;
    app.els.drawerBody.querySelectorAll(".pc-rule-row").forEach(row => {
      const rule = editor.rules.find(item => item.id === row.dataset.ruleId);
      const insert = row.querySelector('[data-rule-action="insert"]');
      const insertCount = row.querySelector(".pc-inline-input");
      const copy = row.querySelector('[data-rule-action="copy"]');
      if (insert) insert.disabled = remaining < 1;
      if (insertCount) { insertCount.disabled = remaining < 1; insertCount.max = String(Math.max(1, remaining)); }
      if (copy && rule) copy.disabled = remainingRuleCount() < 1 || remainingImageCount() < rule.quantity;
    });
  }
  function renderRules() {
    const box = app.els.drawerBody.querySelector("#pcRuleEditor"); if (!box) return;
    const addDisabled = insertLimit() < 1;
    box.innerHTML = `<div class="pc-rule-toolbar"><div><label><input type="checkbox" id="pcRuleCheckAll" ${editor.editable ? "" : "disabled"}> 全选</label>${editor.editable ? `<button class="pc-btn" id="pcBatchReplace">批量换图</button><button class="pc-btn" id="pcAddRule" ${addDisabled ? "disabled" : ""}>新建规则</button>` : ""}</div><span id="pcRuleSummary"></span></div>${editor.rules.length ? `<div class="pc-rule-table"><div class="pc-rule-head"><span></span><span>序号</span><span>垫图</span><span>提示词</span><span>生图数量${app.tip("单条规则可生成 1–20 张；任务总数最多 200 张。")}</span><span>操作</span></div><div class="pc-rule-list">${editor.rules.map(ruleRow).join("")}</div></div>` : `<div class="pc-rule-table"><div class="pc-rule-empty">暂无规则，上传商品主图或新建规则</div></div>`}`;
    updateSummary();
    editor.rules.forEach(rule => { rule.isNew = false; });
  }
  function updatePromptCell(rule) {
    const row = app.els.drawerBody.querySelector(`[data-rule-id="${rule.id}"]`);
    const wrap = row?.querySelector(".pc-rule-prompt-wrap");
    if (wrap) wrap.innerHTML = promptMarkup(rule);
  }

  function generatedPrompt(rule) {
    // Local strategy simulation; no image recognition or external AI request here.
    const scenes = ["明亮浴室台面", "浅色卧室梳妆台", "酒店洗漱区", "极简摄影棚", "木质置物台", "旅行收纳场景", "自然窗边", "现代客厅"];
    const compositions = ["正面平视居中", "三分法偏左留白", "俯拍对角线布局", "近景主体偏右", "低机位斜侧视角", "宽景前后景分层", "局部细节特写"];
    const lights = ["柔和窗光", "侧面漫射光", "暖色晨光", "冷色轮廓光", "柔光棚均匀布光"];
    const used = new Set([...editor.rules.map(item => item.prompt), ...app.data.generationTasks.filter(task => task.productId === editor.productId).flatMap(task => task.rules.map(item => item.prompt))]);
    for (let n = 0; n < scenes.length * compositions.length * lights.length; n += 1) {
      const prompt = `以商品主图保持主体外观、结构和主色，辅助参考不得改变商品；场景：${scenes[n % scenes.length]}；构图：${compositions[Math.floor(n / scenes.length) % compositions.length]}；光线：${lights[Math.floor(n / (scenes.length * compositions.length)) % lights.length]}。商品清晰、比例正确，不添加无依据的功能、文字或配件。`;
      if (!used.has(prompt)) return prompt;
    }
    return null;
  }
  function schedulePromptGeneration(ruleIds) {
    const rules = ruleIds.map(id => editor.rules.find(rule => rule.id === id)).filter(Boolean);
    if (!rules.length) return;
    const token = editor.token;
    const jobs = rules.map(rule => { rule.promptState = "generating"; rule.promptVersion += 1; updatePromptCell(rule); return { id: rule.id, version: rule.promptVersion }; });
    for (let offset = 0; offset < jobs.length; offset += 5) {
      const batch = jobs.slice(offset, offset + 5);
      window.setTimeout(() => {
        if (token !== editor.token) return;
        batch.forEach(job => {
          const rule = editor.rules.find(item => item.id === job.id);
          if (!rule || rule.promptVersion !== job.version) return;
          const index = editor.rules.indexOf(rule);
          rule.prompt = generatedPrompt(rule) || "";
          rule.promptState = rule.prompt ? "ready" : "failed";
          rule.promptSource = "simulated";
          updatePromptCell(rule);
        });
      }, (Math.floor(offset / 5) + 1) * 2000);
    }
  }

  function openStrategy(task, isNew, preferredProductId = "") {
    editor.token += 1;
    editor.taskId = isNew ? null : task?.id || null;
    editor.sourceTaskId = isNew ? task?.repeatSourceId || "" : task?.sourceTaskId || "";
    editor.rules = (task?.rules || []).map(normalizeRule);
    editor.productId = preferredProductId || task?.productId || app.data.products[0]?.id || "";
    editor.sourceImage = editor.rules[0]?.images[0] ? copyImage(editor.rules[0].images[0]) : null;
    editor.isNew = Boolean(isNew);
    editor.editable = Boolean(isNew || task?.status === "draft");
    editor.fileTarget = null;
    editor.submitting = false;
    app.openDrawer({ mode: editor.editable ? "edit" : "view", eyebrow: isNew ? "图片生成" : task.id, title: isNew ? "新建生图任务" : editor.editable ? "编辑生成策略" : "查看生成策略", subtitle: editor.editable ? "商品主图锁定主体 · 辅助图仅供参考 · 提示词与生图为本地模拟" : `${editor.rules.length} 条规则，共 ${task.target} 张`, body: strategyBody(task), footer: strategyFooter(), saveDraft: editor.editable ? () => saveGenerationDraft(false) : null, canSaveDraft: () => Boolean(editor.productId) });
    renderRules();
    const pending = editor.rules.filter(rule => rule.promptState === "generating").map(rule => rule.id);
    if (pending.length) schedulePromptGeneration(pending);
  }
  app.openNewGeneration = productId => openStrategy(null, true, productId);
  app.openGenerationStrategy = task => openStrategy(task, false);
  app.openRepeatedGeneration = task => openStrategy({ ...task, id: "", name: `${task.name}-再次生成`, failureReason: "", repeatSourceId: task.id }, true);

  function readFile(file) {
    return new Promise(resolve => {
      const name = file?.name || "未知文件";
      const extension = name.split(".").pop()?.toLowerCase();
      if (!file || !["png", "jpg", "jpeg"].includes(extension)) { resolve({ valid: false, name, reason: "仅支持 PNG、JPG、JPEG 格式" }); return; }
      if (file.size > 10 * 1024 * 1024) { resolve({ valid: false, name, reason: "文件大小不能超过 10 MB" }); return; }
      const reader = new FileReader();
      reader.onerror = () => resolve({ valid: false, name, reason: "文件读取失败" });
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => resolve({ valid: false, name, reason: "图片无法解析" });
        image.onload = () => resolve(image.naturalWidth === image.naturalHeight ? { valid: true, image: { id: nextId("LOCAL"), name, url: String(reader.result), width: image.naturalWidth, height: image.naturalHeight, tone: uid % 6 + 1, source: "local" } } : { valid: false, name, reason: `图片必须为 1:1，当前为 ${image.naturalWidth}×${image.naturalHeight}` });
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
  async function validateFiles(files) {
    const selected = [...files];
    if (selected.length > 1) {
      const feedback = app.els.drawerBody.querySelector("#pcUploadFeedback");
      const message = "仅支持上传 1 张图片，请重新选择";
      if (feedback) feedback.innerHTML = `<div class="pc-upload-error"><span><b>图片数量不符合要求</b>${message}</span><button type="button" data-upload-error-close aria-label="关闭提示">×</button></div>`;
      app.toast(message);
      return [];
    }
    const results = await Promise.all(selected.map(readFile));
    const valid = results.filter(result => result.valid).map(result => result.image);
    const invalid = results.filter(result => !result.valid);
    const feedback = app.els.drawerBody.querySelector("#pcUploadFeedback");
    if (invalid.length) {
      const item = invalid[0];
      const message = `${item.name}：${item.reason}`;
      if (feedback) feedback.innerHTML = `<div class="pc-upload-error"><span><b>图片上传失败</b>${app.escape(message)}</span><button type="button" data-upload-error-close aria-label="关闭提示">×</button></div>`;
      app.toast(item.reason);
    } else if (feedback) feedback.innerHTML = "";
    return valid;
  }
  async function applySourceImage(image) {
    if (editor.rules.length) {
      const ok = await app.confirm("替换全部规则的垫图？", "更换商品主图后，将替换当前全部规则的垫图并重新生成提示词。", "确认替换");
      if (!ok) return;
    }
    editor.sourceImage = copyImage(image);
    if (!editor.rules.length) editor.rules = Array.from({ length: 50 }, () => ({ id: nextId("RULE"), images: [copyImage(image)], prompt: "", promptState: "generating", promptVersion: 0, quantity: 2, isNew: false }));
    else editor.rules.forEach(rule => { rule.images = [copyImage(image)]; rule.prompt = ""; });
    const sourceBox = app.els.drawerBody.querySelector(".pc-field-wide");
    if (sourceBox) sourceBox.innerHTML = `<span>商品主图</span>${sourcePicker()}`;
    renderRules(); schedulePromptGeneration(editor.rules.map(rule => rule.id)); app.markDrawerDirty();
  }
  function selectedRuleIds() { return [...app.els.drawerBody.querySelectorAll("[data-rule-check]:checked")].map(input => input.closest(".pc-rule-row")?.dataset.ruleId).filter(Boolean); }
  function openRuleLibrary(rule) {
    app.openImagePicker({ multiple: true, title: "选择规则垫图", selectedIds: rule.images.filter(image => image.source === "library").map(image => image.id), onConfirm: images => {
      rule.images = [...rule.images.filter(image => image.source !== "library"), ...images.map(copyImage)];
      renderRules(); schedulePromptGeneration([rule.id]); app.markDrawerDirty();
    } });
  }
  function setFileTarget(target) {
    editor.fileTarget = target;
    const input = app.els.drawerBody.querySelector("#pcRuleLocalInput");
    input.multiple = false;
    input.value = "";
    input.click();
  }

  function draftValues() {
    return { name: app.els.drawerBody.querySelector("#pcTaskName")?.value.trim() || "", productId: app.els.drawerBody.querySelector("#pcTaskProduct")?.value || editor.productId };
  }
  function invalid(message, selector) { return { message, selector }; }
  function validateSubmit() {
    const { name } = draftValues();
    if (!name) return invalid("请填写任务名称", "#pcTaskName");
    if (name.length > 50) return invalid("任务名称最多 50 个字符", "#pcTaskName");
    if (!editor.rules.length) return invalid("请至少创建 1 条规则", "#pcRuleEditor");
    if (editor.rules.length > 50) return invalid("一个任务最多 50 条规则", "#pcRuleEditor");
    const generating = generatingCount();
    if (generating) return invalid(`还有 ${generating} 条提示词正在生成`, ".pc-prompt-skeleton");
    const missingImage = editor.rules.find(rule => !rule.images.length);
    if (missingImage) return invalid("每条规则至少需要一张 1:1 垫图", `[data-rule-id="${missingImage.id}"] .pc-rule-image-add`);
    const failedPrompt = editor.rules.find(rule => rule.promptState === "failed");
    if (failedPrompt) return invalid("存在提示词生成失败的规则，请先重新生成", `[data-rule-id="${failedPrompt.id}"] [data-rule-action="retry-prompt"]`);
    const missingPrompt = editor.rules.find(rule => !rule.prompt.trim());
    if (missingPrompt) return invalid("每条规则都需要提示词", `[data-rule-id="${missingPrompt.id}"] [data-rule-prompt]`);
    const invalidQuantity = editor.rules.find(rule => !Number.isInteger(rule.quantity) || rule.quantity < 1 || rule.quantity > 20);
    if (invalidQuantity) return invalid("单条规则生图数量需为 1–20 张", `[data-rule-id="${invalidQuantity.id}"] [data-rule-qty]`);
    const total = totalQuantity();
    if (total > 200) return invalid(`总生图数量超出 ${total - 200} 张`, "#pcRuleSummary");
    return null;
  }
  function showSubmitError(error) {
    app.toast(error.message);
    const target = app.els.drawerBody.querySelector(error.selector);
    target?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    target?.focus?.();
  }
  function persistDraft(status) {
    const values = draftValues();
    const existing = currentTask();
    const usedNumbers = app.data.generationTasks.filter(item => item.id.startsWith("GT-0902-")).map(item => Number(item.id.split("-").pop()) || 0);
    const nextNumber = Math.max(6, ...usedNumbers) + 1;
    const now = new Date();
    const createdAt = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const task = existing || { id: `GT-0902-${String(nextNumber).padStart(3, "0")}`, creator: app.currentIdentity?.name || "周宁", team: app.currentIdentity?.team || "抖音三区", success: 0, failed: 0, createdAt: app.now() };
    Object.assign(task, { name: values.name || "未命名生图任务", productId: values.productId, sourceTaskId: editor.sourceTaskId, rules: editor.rules.map(rule => ({ id: rule.id, images: rule.images.map(copyImage), prompt: rule.prompt, promptState: rule.promptState, promptVersion: rule.promptVersion, promptSource: rule.promptSource, quantity: rule.quantity })), target: totalQuantity(), status });
    if (!existing) app.data.generationTasks.unshift(task);
    editor.taskId = task.id; app.state.drawerDirty = false; app.renderGeneration();
    return task;
  }
  function saveGenerationDraft(closeAfterSave = true) {
    if (!editor.productId) { app.toast("请先选择产品后再保存草稿"); return false; }
    const task = persistDraft("draft");
    app.toast(`草稿 ${task.id} 已保存`);
    editor.token += 1;
    if (closeAfterSave) app.forceCloseDrawer();
    return true;
  }

  app.els.drawerBody.addEventListener("click", async event => {
    if (app.state.drawerMode !== "edit") return;
    if (event.target.closest("[data-upload-error-close]")) { const feedback = app.els.drawerBody.querySelector("#pcUploadFeedback"); if (feedback) feedback.innerHTML = ""; return; }
    if (event.target.closest("[data-source-local]")) { const input = app.els.drawerBody.querySelector("#pcSourceLocalInput"); input.value = ""; input.click(); return; }
    if (event.target.closest("[data-source-library]")) { app.openImagePicker({ multiple: false, title: "选择商品主图", onConfirm: images => images[0] && applySourceImage(images[0]) }); return; }
    const row = event.target.closest(".pc-rule-row");
    const rule = row ? editor.rules.find(item => item.id === row.dataset.ruleId) : null;
    const imageNode = event.target.closest("[data-image-id]");
    const imageAction = event.target.closest("[data-rule-image-action]")?.dataset.ruleImageAction;
    if (imageAction && rule) {
      hideHoverPreview();
      if (imageAction === "add-local") setFileTarget({ mode: "add", ruleId: rule.id });
      if (imageAction === "add-library") openRuleLibrary(rule);
      if (imageAction === "replace" && imageNode) setFileTarget({ mode: "replace", ruleId: rule.id, imageId: imageNode.dataset.imageId });
      if (imageAction === "delete" && imageNode) { rule.promptVersion += 1; rule.promptState = "idle"; rule.images = rule.images.filter(image => image.id !== imageNode.dataset.imageId); renderRules(); if (rule.images.length) schedulePromptGeneration([rule.id]); app.markDrawerDirty(); }
      return;
    }
    if (event.target.closest("#pcRuleCheckAll")) { const checked = event.target.checked; app.els.drawerBody.querySelectorAll("[data-rule-check]").forEach(input => { input.checked = checked; input.closest(".pc-rule-row")?.classList.toggle("selected", checked); }); return; }
    if (event.target.closest("[data-rule-check]")) { row?.classList.toggle("selected", event.target.checked); return; }
    if (event.target.closest("#pcBatchReplace")) { const ids = selectedRuleIds(); if (!ids.length) { app.toast("请先勾选需要换图的规则"); return; } setFileTarget({ mode: "batch", ruleIds: ids }); return; }
    if (event.target.closest("#pcAddRule")) {
      if (remainingRuleCount() < 1 || remainingImageCount() < 2) { app.toast("规则数或目标图片数已达到上限"); return; }
      editor.rules.unshift({ id: nextId("RULE"), images: [], prompt: "", promptState: "idle", promptVersion: 0, quantity: 2, isNew: true });
      renderRules(); app.markDrawerDirty();
      requestAnimationFrame(() => { const first = app.els.drawerBody.querySelector(".pc-rule-row"); first?.scrollIntoView({ block: "center", behavior: "smooth" }); first?.querySelector("[data-rule-image-action='add-local']")?.focus(); });
      return;
    }
    const action = event.target.closest("[data-rule-action]")?.dataset.ruleAction;
    if (action && rule) {
      const index = editor.rules.indexOf(rule);
      if (action === "insert") {
        const count = Number(row.querySelector(".pc-inline-input")?.value || 1);
        if (!Number.isInteger(count) || count < 1) { app.toast("插入行数必须为正整数"); return; }
        const remaining = insertLimit();
        if (count > remaining) { app.toast(remaining ? `最多还能插入 ${remaining} 条` : remainingRuleCount() < 1 ? "当前已有 50 条规则，不能继续插入" : "剩余图片额度不足，不能继续插入"); return; }
        const rows = Array.from({ length: count }, () => ({ id: nextId("RULE"), images: rule.images.map(copyImage), prompt: "", promptState: rule.images.length ? "generating" : "idle", promptVersion: 0, quantity: 2, isNew: true }));
        editor.rules.splice(index + 1, 0, ...rows); renderRules(); schedulePromptGeneration(rows.filter(item => item.images.length).map(item => item.id));
      }
      if (action === "copy") {
        if (remainingRuleCount() < 1 || remainingImageCount() < rule.quantity) { app.toast("复制后将超过规则数或目标图片数上限"); return; }
        if (rule.promptState === "generating") { app.toast("请等待当前提示词生成完成再复制"); return; }
        const copy = { id: nextId("RULE"), images: rule.images.map(copyImage), prompt: rule.prompt, promptState: rule.promptState, promptVersion: 0, quantity: rule.quantity, isNew: true };
        editor.rules.splice(index + 1, 0, copy); renderRules();
      }
      if (action === "delete") {
        const ok = await app.confirm("删除这条规则？", "删除后该规则的垫图、提示词和生图数量将一并移除。", "删除");
        if (!ok) return; editor.rules.splice(index, 1); renderRules();
      }
      if (action === "retry-prompt") schedulePromptGeneration([rule.id]);
      app.markDrawerDirty(); return;
    }
  });

  app.els.drawerBody.addEventListener("pointerover", event => {
    const thumb = event.target.closest(".pc-rule-thumb");
    if (!thumb || thumb.contains(event.relatedTarget)) return;
    showHoverPreview(thumb);
  });
  app.els.drawerBody.addEventListener("pointerout", event => {
    const thumb = event.target.closest(".pc-rule-thumb");
    if (!thumb || thumb.contains(event.relatedTarget)) return;
    hideHoverPreview();
  });
  app.els.drawerBody.addEventListener("scroll", hideHoverPreview, { passive: true });
  app.els.drawerBody.addEventListener("pointerleave", hideHoverPreview);

  app.els.drawerBody.addEventListener("input", event => {
    const row = event.target.closest(".pc-rule-row"); const rule = row ? editor.rules.find(item => item.id === row.dataset.ruleId) : null;
    if (event.target.matches("[data-rule-prompt]") && rule) { rule.prompt = event.target.value; rule.promptVersion += 1; rule.promptSource = "manual"; rule.promptState = "ready"; }
    if (event.target.matches("[data-rule-qty]") && rule) { rule.quantity = Number(event.target.value || 0); updateSummary(); }
  });
  app.els.drawerBody.addEventListener("change", async event => {
    if (event.target.matches("#pcTaskProduct")) editor.productId = event.target.value;
    if (event.target.matches("[data-rule-qty]")) { const row = event.target.closest(".pc-rule-row"), rule = editor.rules.find(item => item.id === row?.dataset.ruleId); if (rule) { rule.quantity = Math.max(1, Math.min(20, Math.trunc(Number(event.target.value) || 1))); event.target.value = rule.quantity; updateSummary(); } }
    if (event.target.matches("#pcSourceLocalInput")) { const token = editor.token; const images = await validateFiles(event.target.files); if (token === editor.token && images[0]) applySourceImage(images[0]); }
    if (event.target.matches("#pcRuleLocalInput")) {
      const token = editor.token;
      const images = await validateFiles(event.target.files); if (token !== editor.token || !images.length || !editor.fileTarget) return;
      const target = editor.fileTarget;
      if (target.mode === "add") { const rule = editor.rules.find(item => item.id === target.ruleId); if (rule) { rule.images.push(...images); renderRules(); schedulePromptGeneration([rule.id]); } }
      if (target.mode === "replace") { const rule = editor.rules.find(item => item.id === target.ruleId); if (rule) { const index = rule.images.findIndex(image => image.id === target.imageId); if (index >= 0) rule.images[index] = images[0]; renderRules(); schedulePromptGeneration([rule.id]); } }
      if (target.mode === "batch") { target.ruleIds.forEach(id => { const rule = editor.rules.find(item => item.id === id); if (rule) rule.images = [copyImage(images[0])]; }); renderRules(); schedulePromptGeneration(target.ruleIds); }
      editor.fileTarget = null; app.markDrawerDirty();
    }
  });

  app.els.drawerFoot.addEventListener("click", async event => {
    if (event.target.closest("#pcSaveDraft")) { saveGenerationDraft(true); return; }
    if (!event.target.closest("#pcSubmitGeneration") || editor.submitting) return;
    const error = validateSubmit(); if (error) { showSubmitError(error); return; }
    const ok = await app.confirm("提交生图任务？", "提交后策略将锁定，任务进入待生成状态。", "提交生成");
    if (!ok || editor.submitting) return;
    editor.submitting = true;
    const button = app.els.drawerFoot.querySelector("#pcSubmitGeneration"); if (button) { button.disabled = true; button.textContent = "提交中…"; }
    const task = persistDraft("pending");
    window.setTimeout(() => { editor.token += 1; app.forceCloseDrawer(); app.toast(`任务 ${task.id} 已提交`); editor.submitting = false; }, 450);
  });
})();

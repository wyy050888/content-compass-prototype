(function () {
  let pickerRoot;
  let pickerState = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  })[char]);
  const lines = value => Array.isArray(value) ? value : [];
  const linkedProducts = item => {
    const product = Array.isArray(item?.linkedProducts) && item.linkedProducts.length ? item.linkedProducts[0] : item?.product;
    return product ? [product] : [];
  };
  const isApplicable = (item, productName) => !linkedProducts(item).length || linkedProducts(item).includes(productName);

  function ensurePicker() {
    if (pickerRoot) return pickerRoot;
    pickerRoot = document.createElement("div");
    pickerRoot.className = "creation-persona-picker-backdrop";
    pickerRoot.hidden = true;
    pickerRoot.innerHTML = `
      <section class="creation-persona-picker-modal" role="dialog" aria-modal="true" aria-labelledby="creationPersonaPickerTitle">
        <header class="creation-persona-picker-head">
          <div><h2 id="creationPersonaPickerTitle">选择人群画像</h2><p data-persona-modal-description>选择后将回填目标人群、性别年龄、核心痛点和使用场景，本次任务仍可继续修改。</p></div>
          <button type="button" class="creation-persona-picker-close" data-persona-modal-close aria-label="关闭">×</button>
        </header>
        <div class="creation-persona-picker-toolbar">
          <label class="creation-persona-search"><span>⌕</span><input type="search" data-persona-modal-search placeholder="搜索产品名称、画像名称或人群"></label>
        </div>
        <div class="creation-persona-picker-mode" data-persona-modal-mode-switch hidden>
          <button type="button" class="active" data-persona-modal-mode="manual">自行输入</button>
          <button type="button" data-persona-modal-mode="template">从模板库选择</button>
        </div>
        <div class="creation-persona-picker-manual" data-persona-modal-manual hidden>
          <input type="text" data-persona-modal-manual-input placeholder="输入自定义人群，如：家庭清洁爱好者">
          <button type="button" data-persona-modal-manual-add>添加人群</button>
          <div class="creation-persona-picker-quick" data-persona-modal-quick><span>常用人群</span><button type="button" data-persona-modal-quick-value="精致妈妈">精致妈妈</button><button type="button" data-persona-modal-quick-value="新锐白领">新锐白领</button><button type="button" data-persona-modal-quick-value="养宠人群">养宠人群</button><button type="button" data-persona-modal-quick-value="家庭清洁爱好者">家庭清洁爱好者</button></div>
        </div>
        <div class="creation-persona-picker-summary"><span data-persona-modal-count></span><b data-persona-modal-context></b></div>
        <div class="creation-persona-picker-grid" data-persona-modal-grid></div>
        <footer class="creation-persona-picker-foot">
          <span data-persona-modal-selection>暂未选择人群画像</span>
          <div><button type="button" class="persona-picker-secondary" data-persona-modal-close>取消</button><button type="button" class="persona-picker-primary" data-persona-modal-confirm disabled>确认应用</button></div>
        </footer>
      </section>`;
    document.body.appendChild(pickerRoot);

    pickerRoot.addEventListener("click", event => {
      if (event.target === pickerRoot || event.target.closest("[data-persona-modal-close]")) return closePicker();
      const modeButton = event.target.closest("[data-persona-modal-mode]");
      if (modeButton) {
        pickerState.mode = modeButton.dataset.personaModalMode;
        renderPersonas();
        return;
      }
      if (event.target.closest("[data-persona-modal-manual-add]")) {
        const input = pickerRoot.querySelector("[data-persona-modal-manual-input]");
        const name = input?.value.trim();
        if (!name) return;
        const existing = pickerState.items.find(item => item.manual && item.name === name);
        const item = existing || { id:`manual:${Date.now()}`, name, audience:name, gender:"不限", age:"", pain:[], scenes:[], linkedProducts:pickerState.productName ? [pickerState.productName] : [], usage:0, updated:"本次输入", manual:true };
        if (!existing) pickerState.items.push(item);
        if (pickerState.pendingIds.size >= pickerState.maxSelected && !pickerState.pendingIds.has(item.id)) pickerState.pendingIds.delete([...pickerState.pendingIds][0]);
        pickerState.pendingIds.add(item.id);
        if (input) input.value = "";
        renderPersonas();
        return;
      }
      const quickValue = event.target.closest("[data-persona-modal-quick-value]");
      if (quickValue) {
        const input = pickerRoot.querySelector("[data-persona-modal-manual-input]");
        if (input) input.value = quickValue.dataset.personaModalQuickValue;
        pickerRoot.querySelector("[data-persona-modal-manual-add]")?.click();
        return;
      }
      const card = event.target.closest("[data-persona-modal-item]");
      if (card) {
        const id = card.dataset.personaModalItem;
        if (pickerState.multiple) {
          if (pickerState.pendingIds.has(id)) pickerState.pendingIds.delete(id);
          else if (pickerState.pendingIds.size < pickerState.maxSelected) pickerState.pendingIds.add(id);
        } else pickerState.pendingIds = new Set([id]);
        renderPersonas();
        return;
      }
      if (event.target.closest("[data-persona-modal-confirm]") && pickerState?.pendingIds.size) {
        const selected = [...pickerState.pendingIds].map(id => pickerState.items.find(item => item.id === id)).filter(Boolean);
        pickerState.onConfirm?.(pickerState.multiple ? selected : selected[0]);
        closePicker();
      }
    });
    pickerRoot.addEventListener("input", event => {
      if (event.target.matches("[data-persona-modal-search]")) renderPersonas();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !pickerRoot.hidden) closePicker();
    });
    return pickerRoot;
  }

  function renderPersonas() {
    if (!pickerState) return;
    pickerRoot.querySelectorAll("[data-persona-modal-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaModalMode === pickerState.mode));
    pickerRoot.querySelector("[data-persona-modal-manual]").hidden = !pickerState.allowManual || pickerState.mode !== "manual";
    const keyword = pickerRoot.querySelector("[data-persona-modal-search]").value.trim().toLowerCase();
    const visible = pickerState.items.filter(item => {
      const haystack = [item.name, item.brand, item.category, item.product, item.audience, item.gender, item.age, ...lines(item.pain), ...lines(item.scenes)].join(" ").toLowerCase();
      return !keyword || haystack.includes(keyword);
    }).sort((a, b) => Number(!linkedProducts(b).length) - Number(!linkedProducts(a).length) || Number(b.usage || 0) - Number(a.usage || 0));

    const universalCount = visible.filter(item => !linkedProducts(item).length).length;
    pickerRoot.querySelector("[data-persona-modal-count]").textContent = `可用画像 ${visible.length} 个`;
    pickerRoot.querySelector("[data-persona-modal-context]").textContent = pickerState.productName
      ? `当前产品：${pickerState.productName} · 通用 ${universalCount} 个`
      : `未选择产品 · 仅展示通用画像 ${universalCount} 个`;
    const grid = pickerRoot.querySelector("[data-persona-modal-grid]");
    grid.hidden = pickerState.allowManual && pickerState.mode === "manual";
    grid.innerHTML = visible.length ? visible.map(item => {
      const selected = pickerState.pendingIds.has(item.id);
      return `<button type="button" class="creation-persona-card${selected ? " selected" : ""}" data-persona-modal-item="${escapeHtml(item.id)}" aria-pressed="${selected}">
        <span class="creation-persona-card-check">${selected ? "✓" : ""}</span>
        <span class="creation-persona-card-title"><span><strong>${escapeHtml(item.name)}</strong><small>更新于 ${escapeHtml(item.updated || "—")}</small></span><em>${item.manual ? "本次输入" : linkedProducts(item).length ? "关联当前产品" : "通用"}</em></span>
        <span class="creation-persona-card-tags"><i>${escapeHtml(item.audience)}</i><i>${escapeHtml(item.gender)}</i><i>${escapeHtml(item.age)}岁</i></span>
        <span class="creation-persona-card-scope"><em>适用范围</em><b>${escapeHtml(linkedProducts(item).join("、") || "通用")}</b></span>
        <span class="creation-persona-card-detail"><em>核心痛点</em>${lines(item.pain).slice(0, 2).map(value => `<i>${escapeHtml(value)}</i>`).join("") || "未设置"}</span>
        <span class="creation-persona-card-detail"><em>使用场景</em>${lines(item.scenes).slice(0, 2).map(value => `<i>${escapeHtml(value)}</i>`).join("") || "未设置"}</span>
        <span class="creation-persona-card-meta"><small>已调用 ${Number(item.usage || 0)} 次</small></span>
      </button>`;
    }).join("") : `<div class="creation-persona-picker-empty"><b>没有找到匹配画像</b><span>试试更换搜索关键词。</span></div>`;

    const selected = [...pickerState.pendingIds].map(id => pickerState.items.find(item => item.id === id)).filter(Boolean);
    const selectedNames = selected.map(item => item.name || item.audience);
    pickerRoot.querySelector("[data-persona-modal-selection]").innerHTML = selected.length
      ? `已选择 ${selected.length} 个人群画像：<span class="creation-persona-selected-names">${selectedNames.map(name => `<b>${escapeHtml(name)}</b>`).join("")}</span>${selectedNames.length > 1 ? `<em class="creation-persona-selected-more">+${selectedNames.length - 1}</em>` : ""}`
      : "暂未选择人群画像";
    pickerRoot.querySelector("[data-persona-modal-confirm]").disabled = !selected.length;
  }

  function openPicker(options) {
    ensurePicker();
    const productName = options.productName || "";
    pickerState = {
      items: (Array.isArray(options.items) ? options.items : []).filter(item => productName ? isApplicable(item, productName) : !linkedProducts(item).length),
      allowManual: Boolean(options.allowManual),
      mode: options.allowManual ? (options.mode || "manual") : "template",
      multiple: Boolean(options.multiple),
      maxSelected: Math.max(1, Number(options.maxSelected) || 3),
      pendingIds: new Set(options.multiple ? (options.selectedIds || []) : (options.selectedId ? [options.selectedId] : [])),
      productName,
      onConfirm: options.onConfirm
    };
    const manualValues = (options.manualValues || []).map(value => String(value || "").trim()).filter(Boolean);
    manualValues.forEach((name, index) => {
      if (pickerState.items.some(item => item.name === name)) return;
      pickerState.items.push({ id:`manual:initial:${index}:${name}`, name, audience:name, gender:"不限", age:"", pain:[], scenes:[], linkedProducts:productName ? [productName] : [], usage:0, updated:"来源内容", manual:true });
    });
    const manualItems = pickerState.items.filter(item => item.manual && manualValues.includes(item.name));
    manualItems.forEach(item => pickerState.pendingIds.add(item.id));
    pickerRoot.querySelector("[data-persona-modal-search]").value = "";
    pickerRoot.querySelector("[data-persona-modal-mode-switch]").hidden = !pickerState.allowManual || Boolean(options.hideModeSwitch);
    pickerRoot.querySelectorAll("[data-persona-modal-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaModalMode === pickerState.mode));
    pickerRoot.querySelector("[data-persona-modal-manual]").hidden = !pickerState.allowManual || pickerState.mode !== "manual";
    pickerRoot.querySelector("[data-persona-modal-description]").textContent = options.description || (options.multiple
      ? `最多选择 ${Math.max(1, Number(options.maxSelected) || 3)} 个人群画像；可多选并在本次创作中共同生效。`
      : "选择后将回填目标人群、性别年龄、核心痛点和使用场景，本次任务仍可继续修改。");
    pickerRoot.hidden = false;
    document.body.classList.add("creation-persona-picker-open");
    renderPersonas();
    requestAnimationFrame(() => pickerRoot.querySelector("[data-persona-modal-search]").focus());
  }

  function closePicker() {
    if (!pickerRoot) return;
    pickerRoot.hidden = true;
    pickerState = null;
    document.body.classList.remove("creation-persona-picker-open");
  }

  window.CreationPersonaPicker = { open: openPicker, close: closePicker };
})();

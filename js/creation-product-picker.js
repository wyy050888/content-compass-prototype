(function () {
  let pickerRoot;
  let pickerState = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  })[char]);

  function ensurePicker() {
    if (pickerRoot) return pickerRoot;
    pickerRoot = document.createElement("div");
    pickerRoot.className = "creation-product-picker-backdrop";
    pickerRoot.hidden = true;
    pickerRoot.innerHTML = `
      <section class="creation-product-picker-modal" role="dialog" aria-modal="true" aria-labelledby="creationProductPickerTitle">
        <header class="creation-product-picker-head">
          <div><h2 id="creationProductPickerTitle">选择产品</h2><p>选择后将带入产品事实、卖点、人群建议和禁用表达。</p></div>
          <button type="button" class="creation-product-picker-close" data-picker-close aria-label="关闭">×</button>
        </header>
        <div class="creation-product-picker-toolbar">
          <label class="creation-product-search"><span>⌕</span><input type="search" data-picker-search placeholder="搜索产品名称、品牌、类目或卖点"></label>
          <select data-picker-brand aria-label="筛选品牌"></select>
          <select data-picker-category aria-label="筛选类目"></select>
        </div>
        <div class="creation-product-picker-summary"><span data-picker-result-count></span><button type="button" data-picker-reset>重置筛选</button></div>
        <div class="creation-product-picker-grid" data-picker-grid></div>
        <footer class="creation-product-picker-foot">
          <span data-picker-selection>暂未选择产品</span>
          <div><button type="button" class="picker-secondary" data-picker-close>取消</button><button type="button" class="picker-primary" data-picker-confirm disabled>确认选择</button></div>
        </footer>
      </section>`;
    document.body.appendChild(pickerRoot);

    pickerRoot.addEventListener("click", event => {
      if (event.target === pickerRoot || event.target.closest("[data-picker-close]")) return closePicker();
      if (event.target.closest("[data-picker-reset]")) {
        pickerRoot.querySelector("[data-picker-search]").value = "";
        pickerRoot.querySelector("[data-picker-brand]").value = "";
        pickerRoot.querySelector("[data-picker-category]").value = "";
        renderProducts();
        return;
      }
      const card = event.target.closest("[data-picker-product]");
      if (card) {
        pickerState.pendingId = card.dataset.pickerProduct;
        renderProducts();
        return;
      }
      if (event.target.closest("[data-picker-confirm]") && pickerState?.pendingId) {
        const selected = pickerState.items.find(item => item.id === pickerState.pendingId);
        pickerState.onConfirm?.(pickerState.pendingId, selected);
        closePicker();
      }
    });
    pickerRoot.addEventListener("input", event => {
      if (event.target.matches("[data-picker-search]")) renderProducts();
    });
    pickerRoot.addEventListener("change", event => {
      if (event.target.matches("[data-picker-brand], [data-picker-category]")) renderProducts();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !pickerRoot.hidden) closePicker();
    });
    return pickerRoot;
  }

  function setSelectOptions(select, label, values) {
    select.innerHTML = `<option value="">全部${label}</option>${values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  }

  function renderProducts() {
    if (!pickerState) return;
    const keyword = pickerRoot.querySelector("[data-picker-search]").value.trim().toLowerCase();
    const brand = pickerRoot.querySelector("[data-picker-brand]").value;
    const category = pickerRoot.querySelector("[data-picker-category]").value;
    const visible = pickerState.items.filter(item => {
      const haystack = [item.name, item.brand, item.category, item.core, item.secondary, ...(item.audiences || [])].join(" ").toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (!brand || item.brand === brand) && (!category || item.category === category);
    });
    pickerRoot.querySelector("[data-picker-result-count]").textContent = `共 ${visible.length} 个产品`;
    pickerRoot.querySelector("[data-picker-grid]").innerHTML = visible.length ? visible.map(item => {
      const selected = pickerState.pendingId === item.id;
      return `<button type="button" class="creation-product-card${selected ? " selected" : ""}" data-picker-product="${escapeHtml(item.id)}" aria-pressed="${selected}">
        <span class="creation-product-card-check">${selected ? "✓" : ""}</span>
        <span class="creation-product-card-top"><b>${escapeHtml((item.brand || item.name).slice(0, 1))}</b><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code || `产品 ID：${item.id}`)}</small></span></span>
        <span class="creation-product-card-tags"><i>${escapeHtml(item.brand || "未设置品牌")}</i><i>${escapeHtml(item.category || "未设置类目")}</i><i>${escapeHtml(item.status || "已上架")}</i></span>
        <span class="creation-product-card-fact"><em>核心卖点</em>${escapeHtml(item.core || "暂无核心卖点")}</span>
        <span class="creation-product-card-fact secondary"><em>补充卖点</em>${escapeHtml(item.secondary || "暂无补充卖点")}</span>
        <span class="creation-product-card-audience"><em>适用人群</em>${(item.audiences || []).slice(0, 3).map(value => `<i>${escapeHtml(value)}</i>`).join("") || "未设置"}</span>
        <span class="creation-product-card-meta"><small>${escapeHtml(item.facts || "产品信息待完善")}</small><small>${escapeHtml(item.assetCount || "")}</small></span>
      </button>`;
    }).join("") : `<div class="creation-product-picker-empty"><b>没有找到匹配产品</b><span>试试更换关键词，或重置品牌、类目筛选。</span></div>`;

    const selected = pickerState.items.find(item => item.id === pickerState.pendingId);
    pickerRoot.querySelector("[data-picker-selection]").innerHTML = selected ? `已选择：<b>${escapeHtml(selected.name)}</b>` : "暂未选择产品";
    pickerRoot.querySelector("[data-picker-confirm]").disabled = !selected;
  }

  function openPicker(options) {
    ensurePicker();
    pickerState = {
      items: Array.isArray(options.items) ? options.items : [],
      pendingId: options.selectedId || "",
      onConfirm: options.onConfirm
    };
    const brands = [...new Set(pickerState.items.map(item => item.brand).filter(Boolean))];
    const categories = [...new Set(pickerState.items.map(item => item.category).filter(Boolean))];
    setSelectOptions(pickerRoot.querySelector("[data-picker-brand]"), "品牌", brands);
    setSelectOptions(pickerRoot.querySelector("[data-picker-category]"), "类目", categories);
    pickerRoot.querySelector("[data-picker-search]").value = "";
    pickerRoot.hidden = false;
    document.body.classList.add("creation-product-picker-open");
    renderProducts();
    requestAnimationFrame(() => pickerRoot.querySelector("[data-picker-search]").focus());
  }

  function closePicker() {
    if (!pickerRoot) return;
    pickerRoot.hidden = true;
    pickerState = null;
    document.body.classList.remove("creation-product-picker-open");
  }

  window.CreationProductPicker = { open: openPicker, close: closePicker };
})();

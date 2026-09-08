(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;

  const state = { open: false, multiple: false, maxSelected: Infinity, folder: "all", query: "", selected: new Set(), onConfirm: null };
  const layer = document.createElement("div");
  layer.className = "pc-library-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <button class="pc-library-mask" type="button" aria-label="关闭图片库" data-pc-library-close></button>
    <section class="pc-library-modal" role="dialog" aria-modal="true" aria-labelledby="pcLibraryTitle">
      <header><div><small>图片库</small><h2 id="pcLibraryTitle">选择图片</h2></div><button class="pc-icon-btn" type="button" aria-label="关闭" data-pc-library-close>×</button></header>
      <div class="pc-library-main"><aside id="pcLibraryFolders"></aside><main><div class="pc-library-toolbar"><label class="pc-search"><span>⌕</span><input id="pcLibrarySearch" placeholder="搜索图片名称"></label><span>仅可选择 1:1 图片</span></div><div class="pc-library-grid" id="pcLibraryGrid"></div></main></div>
      <footer><span id="pcLibrarySelected">已选 0 张</span><div><button class="pc-btn" data-pc-library-close>取消</button><button class="pc-btn pc-btn-primary" id="pcLibraryConfirm">确认选择</button></div></footer>
    </section>`;
  app.root.appendChild(layer);

  const eligible = () => app.data.imageLibrary.filter(image => image.width === image.height);
  function renderFolders() {
    const folders = [...new Set(eligible().map(image => image.folder))];
    layer.querySelector("#pcLibraryFolders").innerHTML = `<button class="${state.folder === "all" ? "active" : ""}" data-library-folder="all"><span>全部图片</span><b>${eligible().length}</b></button>${folders.map(folder => `<button class="${state.folder === folder ? "active" : ""}" data-library-folder="${app.escape(folder)}"><span>${app.escape(folder)}</span><b>${eligible().filter(image => image.folder === folder).length}</b></button>`).join("")}`;
  }
  function renderGrid() {
    const query = state.query.trim().toLowerCase();
    const images = eligible().filter(image => (state.folder === "all" || image.folder === state.folder) && (!query || image.name.toLowerCase().includes(query)));
    layer.querySelector("#pcLibraryGrid").innerHTML = images.length ? images.map(image => `<button class="pc-library-card ${state.selected.has(image.id) ? "selected" : ""}" type="button" data-library-image="${image.id}"><span class="pc-library-cover pc-tone-${image.tone}"><i>${state.selected.has(image.id) ? "✓" : ""}</i></span><strong title="${app.escape(image.name)}">${app.escape(image.name)}</strong><small>${image.width} × ${image.height} · ${app.escape(image.folder)}</small></button>`).join("") : `<div class="pc-library-empty">没有符合条件的图片</div>`;
    layer.querySelector("#pcLibrarySelected").textContent = `已选 ${state.selected.size} 张`;
    layer.querySelector("#pcLibraryConfirm").disabled = !state.selected.size;
  }
  function render() { renderFolders(); renderGrid(); }

  app.openImagePicker = options => {
    state.open = true;
    state.multiple = Boolean(options?.multiple);
    state.maxSelected = Number.isInteger(options?.maxSelected) ? options.maxSelected : Infinity;
    state.folder = "all";
    state.query = "";
    state.selected = new Set((options?.selectedIds || []).filter(id => app.data.imageLibrary.some(image => image.id === id)));
    state.onConfirm = typeof options?.onConfirm === "function" ? options.onConfirm : null;
    layer.querySelector("#pcLibraryTitle").textContent = options?.title || (state.multiple ? "选择垫图" : "选择商品主图");
    layer.querySelector("#pcLibrarySearch").value = "";
    layer.classList.add("show");
    layer.setAttribute("aria-hidden", "false");
    render();
    requestAnimationFrame(() => layer.querySelector("#pcLibrarySearch")?.focus());
  };
  app.closeImagePicker = () => {
    state.open = false;
    state.onConfirm = null;
    layer.classList.remove("show");
    layer.setAttribute("aria-hidden", "true");
  };
  app.isImagePickerOpen = () => state.open;

  layer.addEventListener("click", event => {
    if (event.target.closest("[data-pc-library-close]")) { app.closeImagePicker(); return; }
    const folder = event.target.closest("[data-library-folder]");
    if (folder) { state.folder = folder.dataset.libraryFolder; render(); return; }
    const card = event.target.closest("[data-library-image]");
    if (card) {
      const id = card.dataset.libraryImage;
      if (state.multiple) {
        if (state.selected.has(id)) state.selected.delete(id);
        else if (state.selected.size >= state.maxSelected) { app.toast("每条规则最多上传3张图片"); return; }
        else state.selected.add(id);
      }
      else { state.selected.clear(); state.selected.add(id); }
      renderGrid();
      return;
    }
    if (event.target.closest("#pcLibraryConfirm")) {
      const images = [...state.selected].map(id => app.data.imageLibrary.find(image => image.id === id)).filter(Boolean).map(image => ({ ...image, source: "library", url: "" }));
      const callback = state.onConfirm;
      app.closeImagePicker();
      callback?.(images);
    }
  });
  layer.querySelector("#pcLibrarySearch").addEventListener("input", event => { state.query = event.target.value; renderGrid(); });
})();

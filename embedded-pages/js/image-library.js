  document.addEventListener("DOMContentLoaded", () => {
    const imageFolderTree = document.getElementById("imageFolderTree");
    const imageManagedGrid = document.getElementById("imageManagedGrid");
    const imageFolderModal = document.getElementById("imageFolderModal");
    const imageFolderDeleteModal = document.getElementById("imageFolderDeleteModal");
    const imageImportModal = document.getElementById("imageImportModal");
    const imageOverwriteModal = document.getElementById("imageOverwriteModal");
    const imageAssetMoveModal = document.getElementById("imageAssetMoveModal");
    const imageAssetDeleteModal = document.getElementById("imageAssetDeleteModal");
    let selectedImageFolderId = "root";
    let pendingImageFolderParentId = "root";
    let editingImageFolderNode = null;
    let deletingImageFolderNode = null;
    let draggedImageAsset = null;
    let imageImportMode = "files";
    let pendingImageImportFiles = [];
    let pendingImageImportValidation = null;
    let activeImageAssetCard = null;

    function toggleImageLibraryModal(modal, open) { modal?.classList.toggle("show", open); }
    function imageFolderNode(id) { return imageFolderTree?.querySelector(`[data-folder-id="${id}"]`); }
    function imageFolderParentNode(node) { return node?.parentElement?.closest(".image-folder-node") || imageFolderNode("root"); }
    function imageFolderDescendantIds(node) { return new Set([node?.dataset.folderId, ...[...(node?.querySelectorAll(".image-folder-node") || [])].map(child => child.dataset.folderId)].filter(Boolean)); }
    function imageFolderAssets() { return [...document.querySelectorAll("#imageManagedGrid [data-image-asset]")]; }
    function imageFolderPath(node) {
      const names = [];
      let current = node;
      while (current) { names.unshift(current.dataset.folderName || "全部图片"); current = current.dataset.folderId === "root" ? null : current.parentElement?.closest(".image-folder-node"); }
      return names.join(" / ");
    }
    function updateImageFolderCounts() {
      const assets = imageFolderAssets();
      document.querySelectorAll("#imageFolderTree .image-folder-node").forEach(node => {
        const ids = imageFolderDescendantIds(node);
        const count = assets.filter(asset => ids.has(asset.dataset.folderId)).length;
        const countNode = node.querySelector(":scope > .image-folder-row .folder-count");
        if (countNode) countNode.textContent = count;
      });
    }
    function filterManagedImages() {
      const node = imageFolderNode(selectedImageFolderId) || imageFolderNode("root");
      const ids = imageFolderDescendantIds(node);
      const keyword = document.getElementById("managedImageSearch")?.value.trim().toLowerCase() || "";
      const type = document.getElementById("managedImageType")?.value || "all";
      let visible = 0;
      imageFolderAssets().forEach(asset => {
        const matchesFolder = ids.has(asset.dataset.folderId);
        const matchesKeyword = !keyword || asset.textContent.toLowerCase().includes(keyword) || asset.dataset.fileName.toLowerCase().includes(keyword);
        const matchesType = type === "all" || asset.dataset.imageType === type;
        asset.hidden = !(matchesFolder && matchesKeyword && matchesType);
        if (!asset.hidden) visible += 1;
      });
      document.getElementById("imageFolderEmpty")?.classList.toggle("show", visible === 0);
      const name = node?.dataset.folderName || "全部素材";
      document.getElementById("currentImageFolderName").textContent = `${name} · ${visible} 张`;
      document.getElementById("currentImageFolderSummary").textContent = node?.dataset.folderDescription || "展示当前素材组及全部子组素材";
      document.getElementById("imageFolderBreadcrumb").textContent = imageFolderPath(node);
      updateImageFolderCounts();
    }
    function selectImageFolder(node) {
      if (!node) return;
      selectedImageFolderId = node.dataset.folderId;
      document.querySelectorAll("#imageFolderTree .image-folder-row").forEach(row => row.classList.toggle("selected", row === node.querySelector(":scope > .image-folder-row")));
      filterManagedImages();
    }
    function createImageFolderNode(name, parentId, description = "") {
      const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      const node = document.createElement("div");
      node.className = "image-folder-node";
      node.dataset.folderId = id;
      node.dataset.folderName = name;
      node.dataset.folderDescription = description;
      node.innerHTML = `<div class="image-folder-row" data-folder-drop="${id}"><button class="folder-caret" type="button" data-toggle-image-folder>▼</button><button class="folder-select" type="button" data-select-image-folder><span>${escapeHtml(name)}</span></button><b class="folder-count">0</b><span class="folder-actions"><button class="folder-action" type="button" data-add-image-subfolder>＋</button><button class="folder-action" type="button" data-rename-image-folder>改</button><button class="folder-action danger" type="button" data-delete-image-folder>删</button></span></div><div class="image-folder-children"></div>`;
      const parent = imageFolderNode(parentId) || imageFolderNode("root");
      parent.querySelector(":scope > .image-folder-children")?.append(node);
      parent.classList.remove("collapsed");
      updateImageFolderCounts();
      return node;
    }
    function imageFolderDepth(node) {
      let depth = 0;
      let current = imageFolderParentNode(node);
      while (current && current.dataset.folderId !== "root") { depth += 1; current = imageFolderParentNode(current); }
      return depth;
    }
    function populateImageFolderParentOptions(selectedId = "root", editingNode = null) {
      const select = document.getElementById("imageFolderParentSelect");
      if (!select) return;
      const blocked = editingNode ? imageFolderDescendantIds(editingNode) : new Set();
      const options = ['<option value="root">无（顶级素材组）</option>'];
      document.querySelectorAll("#imageFolderTree .image-folder-node").forEach(node => {
        const id = node.dataset.folderId;
        if (!id || id === "root" || id === "ungrouped" || blocked.has(id)) return;
        const prefix = "— ".repeat(imageFolderDepth(node) + 1);
        options.push(`<option value="${escapeHtml(id)}">${prefix}${escapeHtml(node.dataset.folderName)}</option>`);
      });
      select.innerHTML = options.join("");
      select.value = [...select.options].some(option => option.value === selectedId) ? selectedId : "root";
    }
    function updateImageFolderEditorCounters() {
      const name = document.getElementById("imageFolderNameInput")?.value || "";
      const description = document.getElementById("imageFolderDescriptionInput")?.value || "";
      document.getElementById("imageFolderNameCount").textContent = `${name.length}/50`;
      document.getElementById("imageFolderDescriptionCount").textContent = `${description.length}/200`;
    }
    function openImageFolderEditor(parentId, node = null) {
      editingImageFolderNode = node;
      pendingImageFolderParentId = parentId || "root";
      document.getElementById("imageFolderModalTitle").textContent = node ? "编辑素材组" : "新建素材组";
      document.getElementById("imageFolderModalSubtitle").textContent = node ? "修改素材组名称、层级或描述" : "创建一个新的素材组来组织您的素材";
      document.getElementById("imageFolderNameInput").value = node?.dataset.folderName || "";
      document.getElementById("imageFolderDescriptionInput").value = node?.dataset.folderDescription || "";
      populateImageFolderParentOptions(node ? imageFolderParentNode(node)?.dataset.folderId || "root" : pendingImageFolderParentId, node);
      document.getElementById("imageFolderValidation").textContent = "";
      updateImageFolderEditorCounters();
      toggleImageLibraryModal(imageFolderModal, true);
      requestAnimationFrame(() => document.getElementById("imageFolderNameInput").focus());
    }
    function validateImageFolderName(name, parent, editingNode) {
      if (!name) return "素材组名称不能为空。";
      if (/[\\/:*?"<>|]/.test(name)) return "名称包含不允许的特殊符号。";
      const siblings = [...(parent?.querySelector(":scope > .image-folder-children")?.children || [])].filter(node => node !== editingNode);
      if (siblings.some(node => node.dataset.folderName === name)) return "同级下已存在同名素材组。";
      return "";
    }
    function createManagedImageCard(name, folderId, type = "外部导入", file = null) {
      const card = document.createElement("article");
      card.className = "image-managed-card";
      card.draggable = true;
      card.dataset.imageAsset = "";
      card.dataset.folderId = folderId;
      card.dataset.imageType = type;
      card.dataset.fileName = name;
      const visualClass = type === "调研图" ? " research" : type === "场景图" ? " scene" : "";
      const downloadUrl = file && file.type?.startsWith("image/") ? URL.createObjectURL(file) : "";
      if (downloadUrl) card.dataset.downloadUrl = downloadUrl;
      const background = downloadUrl ? ` style="background-image:url('${downloadUrl}')"` : "";
      card.innerHTML = `<div class="image-managed-visual${visualClass}"${background}><span>${escapeHtml(type)}</span><span>外部</span></div><div class="image-managed-body"><strong>${escapeHtml(name.replace(/\.[^.]+$/, ""))}</strong><p>外部导入 · 已完成校验</p><div class="image-managed-meta"><span>自动识别</span><span>${file ? `${(file.size/1024/1024).toFixed(1)}MB` : "压缩包"}</span></div></div>`;
      imageManagedGrid.insertBefore(card, document.getElementById("imageFolderEmpty"));
      ensureImageAssetActions(card);
      return card;
    }
    function closeImageAssetMenus(except = null) {
      imageFolderAssets().forEach(card => { if (card !== except) card.classList.remove("menu-open"); });
    }
    function ensureImageAssetActions(card) {
      if (!card || card.querySelector("[data-image-card-menu]")) return;
      card.insertAdjacentHTML("beforeend", '<button class="image-card-more" type="button" data-image-card-menu aria-label="图片操作">···</button><div class="image-card-menu"><button type="button" data-download-image-asset><i>⇩</i>下载图片</button><button type="button" data-move-image-asset><i>⇥</i>转移素材组</button><button class="danger" type="button" data-delete-image-asset><i>⌫</i>删除图片</button></div>');
    }
    function renderImageAssetMoveTargets(card) {
      const list = document.getElementById("imageAssetMoveList");
      const currentId = card?.dataset.folderId || "ungrouped";
      const targets = [...document.querySelectorAll("#imageFolderTree .image-folder-node")].filter(node => node.dataset.folderId !== "root");
      list.innerHTML = targets.map(node => {
        const id = node.dataset.folderId;
        const count = node.querySelector(":scope > .image-folder-row .folder-count")?.textContent || "0";
        const depth = id === "ungrouped" ? 0 : imageFolderDepth(node);
        return `<label class="image-asset-move-option" style="padding-left:${10 + depth * 16}px"><input type="radio" name="imageAssetMoveTarget" value="${escapeHtml(id)}" ${id === currentId ? "checked" : ""}><i>▱</i><span>${escapeHtml(node.dataset.folderName)}</span><b>${escapeHtml(count)}</b></label>`;
      }).join("");
    }
    function openImageAssetMove(card) {
      activeImageAssetCard = card;
      closeImageAssetMenus();
      document.getElementById("imageAssetMoveCount").textContent = "1";
      renderImageAssetMoveTargets(card);
      toggleImageLibraryModal(imageAssetMoveModal, true);
    }
    function openImageAssetDelete(card) {
      activeImageAssetCard = card;
      closeImageAssetMenus();
      document.getElementById("deleteImageAssetName").textContent = card.dataset.fileName || card.querySelector(".image-managed-body strong")?.textContent || "该图片";
      toggleImageLibraryModal(imageAssetDeleteModal, true);
    }
    function downloadImageAsset(card) {
      if (!card) return;
      const originalName = card.dataset.fileName || "图片素材";
      let href = card.dataset.downloadUrl || "";
      let downloadName = originalName;
      let revoke = false;
      if (!href) {
        const title = escapeHtml(originalName.replace(/\.[^.]+$/, ""));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6568d8"/><stop offset="1" stop-color="#ddd4f4"/></linearGradient></defs><rect width="1200" height="1200" rx="48" fill="url(#g)"/><text x="600" y="565" text-anchor="middle" fill="white" font-family="Arial,Microsoft YaHei" font-size="54" font-weight="700">${title}</text><text x="600" y="640" text-anchor="middle" fill="white" opacity=".8" font-family="Arial,Microsoft YaHei" font-size="28">图片库素材预览</text></svg>`;
        href = URL.createObjectURL(new Blob([svg], { type:"image/svg+xml;charset=utf-8" }));
        downloadName = originalName.replace(/\.[^.]+$/, "") + "-预览.svg";
        revoke = true;
      }
      const link = document.createElement("a");
      link.href = href;
      link.download = downloadName;
      document.body.append(link);
      link.click();
      link.remove();
      if (revoke) setTimeout(() => URL.revokeObjectURL(href), 800);
      closeImageAssetMenus();
      showToast(`“${originalName}”已开始下载`);
    }
    function renderImageImportFiles(files) {
      const list = document.getElementById("imageImportFileList");
      list.innerHTML = files.length ? files.map(file => `<div class="image-import-file"><span>${escapeHtml(file.name)}</span><span>${file.size ? `${(file.size/1024/1024).toFixed(2)} MB` : "待解压"}</span></div>`).join("") : "";
    }
    function openImageImportModal() {
      pendingImageImportFiles = [];
      pendingImageImportValidation = null;
      document.getElementById("imageImportTargetName").textContent = imageFolderPath(imageFolderNode(selectedImageFolderId));
      document.getElementById("imageImportFileList").innerHTML = "";
      document.getElementById("imageImportResults").classList.remove("show");
      document.getElementById("externalImageFiles").value = "";
      document.getElementById("externalImageZip").value = "";
      toggleImageLibraryModal(imageImportModal, true);
    }
    function showImageImportResults(total, success, failures) {
      document.getElementById("imageImportTotal").textContent = total;
      document.getElementById("imageImportSuccess").textContent = success;
      document.getElementById("imageImportFailed").textContent = failures.length;
      document.getElementById("imageImportFailures").innerHTML = failures.length ? failures.map(item => `${escapeHtml(item.name)}：${escapeHtml(item.reason)}`).join("<br>") : "全部文件导入成功，无失败素材。";
      document.getElementById("imageImportResults").classList.add("show");
    }
    function executeImageFileImport(overwrite = false) {
      const allowed = /\.(jpe?g|png|webp|gif)$/i;
      const failures = [];
      const valid = [];
      pendingImageImportFiles.forEach(file => {
        if (!allowed.test(file.name) || (file.type && !file.type.startsWith("image/"))) failures.push({ name:file.name, reason:"格式不支持" });
        else if (file.size > 20 * 1024 * 1024) failures.push({ name:file.name, reason:"大小超限（超过20MB）" });
        else if (file.size === 0) failures.push({ name:file.name, reason:"文件损坏或为空" });
        else valid.push(file);
      });
      const duplicates = valid.filter(file => imageFolderAssets().some(asset => asset.dataset.folderId === selectedImageFolderId && asset.dataset.fileName === file.name));
      if (duplicates.length && !overwrite) {
        pendingImageImportValidation = { valid, failures };
        document.getElementById("imageDuplicateCount").textContent = duplicates.length;
        toggleImageLibraryModal(imageOverwriteModal, true);
        return;
      }
      valid.forEach(file => {
        if (overwrite) imageFolderAssets().filter(asset => asset.dataset.folderId === selectedImageFolderId && asset.dataset.fileName === file.name).forEach(asset => asset.remove());
        createManagedImageCard(file.name, selectedImageFolderId, "外部导入", file);
      });
      showImageImportResults(pendingImageImportFiles.length, valid.length, failures);
      updateImageFolderCounts();
      filterManagedImages();
      showToast(`图片导入完成：成功 ${valid.length} 张，失败 ${failures.length} 张`);
    }
    function executeZipImageImport() {
      const zip = pendingImageImportFiles[0];
      if (!zip) return showToast("请先选择 ZIP 压缩包");
      if (!/\.zip$/i.test(zip.name)) return showToast("仅支持 ZIP 格式压缩包");
      ["压缩包主图_01.jpg","压缩包场景图_02.png","压缩包详情图_03.webp"].forEach(name => createManagedImageCard(name, selectedImageFolderId, "外部导入"));
      const failures = [{ name:"系统缩略图.db", reason:"格式不支持" },{ name:"损坏图片_07.jpg", reason:"文件损坏" }];
      showImageImportResults(12, 10, failures);
      updateImageFolderCounts();
      filterManagedImages();
      showToast("压缩包解压完成：成功 10 张，失败 2 张");
    }
    document.getElementById("createRootImageFolder")?.addEventListener("click", () => openImageFolderEditor("root"));
    document.getElementById("createImageGroupFromSidebar")?.addEventListener("click", () => openImageFolderEditor("root"));
    document.getElementById("openImageImport")?.addEventListener("click", openImageImportModal);
    document.getElementById("imageFolderNameInput")?.addEventListener("input", updateImageFolderEditorCounters);
    document.getElementById("imageFolderDescriptionInput")?.addEventListener("input", updateImageFolderEditorCounters);
    document.getElementById("collapseAllImageFolders")?.addEventListener("click", event => {
      const nodes = [...document.querySelectorAll("#imageFolderTree .image-folder-node")].filter(node => node.dataset.folderId !== "root");
      const shouldCollapse = nodes.some(node => !node.classList.contains("collapsed"));
      nodes.forEach(node => node.classList.toggle("collapsed", shouldCollapse));
      event.currentTarget.textContent = shouldCollapse ? "展开" : "折叠";
    });
    imageFolderTree?.addEventListener("click", event => {
      const node = event.target.closest(".image-folder-node");
      if (!node) return;
      if (event.target.closest("[data-toggle-image-folder]")) { node.classList.toggle("collapsed"); return; }
      if (event.target.closest("[data-select-image-folder]")) { selectImageFolder(node); return; }
      if (event.target.closest("[data-add-image-subfolder]")) { openImageFolderEditor(node.dataset.folderId); return; }
      if (event.target.closest("[data-rename-image-folder]")) { openImageFolderEditor(imageFolderParentNode(node)?.dataset.folderId || "root", node); return; }
      if (event.target.closest("[data-delete-image-folder]")) {
        deletingImageFolderNode = node;
        document.getElementById("deleteImageFolderName").textContent = node.dataset.folderName;
        const assets = imageFolderAssets().filter(asset => imageFolderDescendantIds(node).has(asset.dataset.folderId));
        document.querySelectorAll("[name='folderDeleteMode']").forEach(input => { input.closest("label").style.display = assets.length ? "flex" : input.value === "migrate" ? "flex" : "none"; });
        toggleImageLibraryModal(imageFolderDeleteModal, true);
      }
    });
    imageManagedGrid?.addEventListener("dragstart", event => { if (event.target.closest(".image-card-more,.image-card-menu")) return event.preventDefault(); const card = event.target.closest("[data-image-asset]"); if (!card) return; draggedImageAsset = card; card.classList.add("dragging"); event.dataTransfer.effectAllowed = "move"; });
    imageManagedGrid?.addEventListener("dragend", () => { draggedImageAsset?.classList.remove("dragging"); draggedImageAsset = null; document.querySelectorAll(".image-folder-row.drop-target").forEach(row => row.classList.remove("drop-target")); });
    imageFolderTree?.addEventListener("dragover", event => { const row = event.target.closest("[data-folder-drop]"); if (!row || !draggedImageAsset) return; event.preventDefault(); document.querySelectorAll(".image-folder-row.drop-target").forEach(item => item.classList.toggle("drop-target", item === row)); });
    imageFolderTree?.addEventListener("dragleave", event => { const row = event.target.closest("[data-folder-drop]"); if (row && !row.contains(event.relatedTarget)) row.classList.remove("drop-target"); });
    imageFolderTree?.addEventListener("drop", event => { const row = event.target.closest("[data-folder-drop]"); if (!row || !draggedImageAsset) return; event.preventDefault(); draggedImageAsset.dataset.folderId = row.dataset.folderDrop; row.classList.remove("drop-target"); updateImageFolderCounts(); filterManagedImages(); showToast(`图片已移动至“${imageFolderNode(row.dataset.folderDrop)?.dataset.folderName}”`); });
    imageManagedGrid?.addEventListener("click", event => {
      const card = event.target.closest("[data-image-asset]");
      if (!card) return;
      if (event.target.closest("[data-image-card-menu]")) {
        const open = !card.classList.contains("menu-open");
        closeImageAssetMenus(card);
        card.classList.toggle("menu-open", open);
        return;
      }
      if (event.target.closest("[data-download-image-asset]")) return downloadImageAsset(card);
      if (event.target.closest("[data-move-image-asset]")) return openImageAssetMove(card);
      if (event.target.closest("[data-delete-image-asset]")) return openImageAssetDelete(card);
    });
    document.addEventListener("click", event => { if (!event.target.closest(".image-managed-card")) closeImageAssetMenus(); });
    document.getElementById("confirmImageAssetMove")?.addEventListener("click", () => {
      if (!activeImageAssetCard) return;
      const targetId = document.querySelector("[name='imageAssetMoveTarget']:checked")?.value;
      if (!targetId) return showToast("请选择目标素材组");
      const target = imageFolderNode(targetId);
      activeImageAssetCard.dataset.folderId = targetId;
      toggleImageLibraryModal(imageAssetMoveModal, false);
      updateImageFolderCounts();
      filterManagedImages();
      showToast(`图片已转移至“${target?.dataset.folderName || "目标素材组"}”`);
      activeImageAssetCard = null;
    });
    document.getElementById("confirmDeleteImageAsset")?.addEventListener("click", () => {
      if (!activeImageAssetCard) return;
      const name = activeImageAssetCard.dataset.fileName || "图片素材";
      if (activeImageAssetCard.dataset.downloadUrl) URL.revokeObjectURL(activeImageAssetCard.dataset.downloadUrl);
      activeImageAssetCard.remove();
      activeImageAssetCard = null;
      toggleImageLibraryModal(imageAssetDeleteModal, false);
      updateImageFolderCounts();
      filterManagedImages();
      showToast(`“${name}”已删除`);
    });
    document.getElementById("saveImageFolder")?.addEventListener("click", () => {
      const input = document.getElementById("imageFolderNameInput");
      const name = input.value.trim();
      const description = document.getElementById("imageFolderDescriptionInput").value.trim();
      const chosenParentId = document.getElementById("imageFolderParentSelect").value || "root";
      const parent = imageFolderNode(chosenParentId) || imageFolderNode("root");
      const error = validateImageFolderName(name, parent, editingImageFolderNode);
      document.getElementById("imageFolderValidation").textContent = error;
      if (error) return input.focus();
      if (editingImageFolderNode) {
        editingImageFolderNode.dataset.folderName = name;
        editingImageFolderNode.dataset.folderDescription = description;
        editingImageFolderNode.querySelector(":scope > .image-folder-row .folder-select span").textContent = name;
        const oldParent = imageFolderParentNode(editingImageFolderNode);
        if (oldParent !== parent) {
          parent.querySelector(":scope > .image-folder-children")?.append(editingImageFolderNode);
          parent.classList.remove("collapsed");
        }
        showToast("素材组信息已更新");
      } else {
        const node = createImageFolderNode(name, chosenParentId, description);
        selectImageFolder(node);
        showToast(chosenParentId === "root" ? "父级素材组已创建" : "子素材组已创建");
      }
      editingImageFolderNode = null;
      toggleImageLibraryModal(imageFolderModal, false);
      filterManagedImages();
    });
    document.getElementById("confirmDeleteImageFolder")?.addEventListener("click", () => {
      if (!deletingImageFolderNode) return;
      const name = deletingImageFolderNode.dataset.folderName;
      const ids = imageFolderDescendantIds(deletingImageFolderNode);
      const parent = imageFolderParentNode(deletingImageFolderNode) || imageFolderNode("root");
      const mode = document.querySelector("[name='folderDeleteMode']:checked")?.value || "migrate";
      imageFolderAssets().filter(asset => ids.has(asset.dataset.folderId)).forEach(asset => { if (mode === "migrate") asset.dataset.folderId = parent.dataset.folderId; else asset.remove(); });
      deletingImageFolderNode.remove();
      deletingImageFolderNode = null;
      selectImageFolder(parent);
      toggleImageLibraryModal(imageFolderDeleteModal, false);
      showToast(mode === "migrate" ? `“${name}”已删除，素材已迁移至上级目录` : `“${name}”及目录素材已删除`);
    });
    document.querySelectorAll("[data-image-import-mode]").forEach(button => button.addEventListener("click", () => { imageImportMode = button.dataset.imageImportMode; document.querySelectorAll("[data-image-import-mode]").forEach(item => item.classList.toggle("active", item === button)); document.querySelectorAll("[data-image-import-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.imageImportPanel === imageImportMode)); pendingImageImportFiles = []; renderImageImportFiles([]); document.getElementById("imageImportResults").classList.remove("show"); }));
    document.getElementById("externalImageDropzone")?.addEventListener("click", () => document.getElementById("externalImageFiles").click());
    document.getElementById("externalZipDropzone")?.addEventListener("click", () => document.getElementById("externalImageZip").click());
    document.getElementById("externalImageFiles")?.addEventListener("change", event => { pendingImageImportFiles = [...event.target.files]; renderImageImportFiles(pendingImageImportFiles); });
    document.getElementById("externalImageZip")?.addEventListener("change", event => { pendingImageImportFiles = [...event.target.files]; renderImageImportFiles(pendingImageImportFiles); });
    const imageDropzone = document.getElementById("externalImageDropzone");
    imageDropzone?.addEventListener("dragover", event => { event.preventDefault(); imageDropzone.style.borderColor = "#6d60d8"; });
    imageDropzone?.addEventListener("dragleave", () => { imageDropzone.style.borderColor = ""; });
    imageDropzone?.addEventListener("drop", event => { event.preventDefault(); imageDropzone.style.borderColor = ""; pendingImageImportFiles = [...event.dataTransfer.files]; renderImageImportFiles(pendingImageImportFiles); });
    document.getElementById("startImageImport")?.addEventListener("click", () => { if (!pendingImageImportFiles.length) return showToast(imageImportMode === "zip" ? "请先选择 ZIP 压缩包" : "请先选择图片文件"); imageImportMode === "zip" ? executeZipImageImport() : executeImageFileImport(false); });
    document.getElementById("confirmImageOverwrite")?.addEventListener("click", () => { toggleImageLibraryModal(imageOverwriteModal, false); executeImageFileImport(true); });
    document.getElementById("managedImageSearch")?.addEventListener("input", filterManagedImages);
    document.getElementById("managedImageType")?.addEventListener("change", filterManagedImages);
    document.querySelectorAll("[data-close-image-folder-modal]").forEach(button => button.addEventListener("click", () => toggleImageLibraryModal(imageFolderModal, false)));
    document.querySelectorAll("[data-close-image-folder-delete]").forEach(button => button.addEventListener("click", () => toggleImageLibraryModal(imageFolderDeleteModal, false)));
    document.querySelectorAll("[data-close-image-asset-move]").forEach(button => button.addEventListener("click", () => { activeImageAssetCard = null; toggleImageLibraryModal(imageAssetMoveModal, false); }));
    document.querySelectorAll("[data-close-image-asset-delete]").forEach(button => button.addEventListener("click", () => { activeImageAssetCard = null; toggleImageLibraryModal(imageAssetDeleteModal, false); }));
    document.querySelectorAll("[data-close-image-import]").forEach(button => button.addEventListener("click", () => toggleImageLibraryModal(imageImportModal, false)));
    document.querySelectorAll("[data-close-image-overwrite]").forEach(button => button.addEventListener("click", () => toggleImageLibraryModal(imageOverwriteModal, false)));
    [imageFolderModal,imageFolderDeleteModal,imageImportModal,imageOverwriteModal,imageAssetMoveModal,imageAssetDeleteModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) { if (modal === imageAssetMoveModal || modal === imageAssetDeleteModal) activeImageAssetCard = null; toggleImageLibraryModal(modal, false); } }));

    const saveGeneratedImageModal = document.getElementById("saveGeneratedImageModal");
    function generatedTaskImages() {
      const panels = [...document.querySelectorAll(".generation-result-panel")];
      const images = [];
      panels.forEach((panel, panelIndex) => {
        const plan = panel.querySelector("h4")?.textContent.trim() || `生成方案 ${panelIndex + 1}`;
        const total = Math.max(1, panel.querySelectorAll(".generation-thumbs button").length || 4);
        for (let index = 1; index <= total; index += 1) images.push({ id:`${panelIndex}-${index}`, name:`${plan} · 图片 ${index}` });
      });
      return images.length ? images : Array.from({length:4}, (_,index) => ({ id:`0-${index + 1}`, name:`本次生成图片 ${index + 1}` }));
    }
    function updateGeneratedImageSelection() {
      const checks = [...document.querySelectorAll('[name="generatedImageToSave"]')];
      const selected = checks.filter(input => input.checked).length;
      const label = document.getElementById("selectedGeneratedImageCount");
      if (label) label.textContent = `已选择 ${selected} / ${checks.length} 张`;
      const all = document.getElementById("selectAllGeneratedImages");
      if (all) { all.checked = selected === checks.length && checks.length > 0; all.indeterminate = selected > 0 && selected < checks.length; }
    }
    function renderGeneratedImagePicker() {
      const picker = document.getElementById("saveGeneratedImagePicker");
      if (!picker) return;
      picker.innerHTML = generatedTaskImages().map((image,index) => `<label class="generated-image-pick"><input type="checkbox" name="generatedImageToSave" value="${escapeHtml(image.id)}" data-generated-image-name="${escapeHtml(image.name)}" checked><div class="generated-image-pick-visual">${index + 1}</div><span title="${escapeHtml(image.name)}">${escapeHtml(image.name)}</span></label>`).join("");
      updateGeneratedImageSelection();
    }
    function renderGeneratedImageSaveFolders() {
      const list = document.getElementById("saveGeneratedImageFolderList");
      if (!list) return;
      const targets = [...document.querySelectorAll("#imageFolderTree .image-folder-node")].filter(node => node.dataset.folderId !== "root");
      list.innerHTML = targets.map((node,index) => {
        const id = node.dataset.folderId;
        const count = node.querySelector(":scope > .image-folder-row .folder-count")?.textContent || "0";
        const depth = id === "ungrouped" ? 0 : imageFolderDepth(node);
        const name = node.dataset.folderName || "未命名素材组";
        return `<label class="image-asset-move-option" style="padding-left:${10 + depth * 16}px"><input type="radio" name="generatedImageSaveFolder" value="${escapeHtml(id)}" ${index === 0 ? "checked" : ""}><i>▱</i><span>${escapeHtml(name)}</span><b>${escapeHtml(count)}</b></label>`;
      }).join("");
    }
    document.addEventListener("click", event => {
      if (!event.target.closest("[data-save-generated-image]")) return;
      renderGeneratedImagePicker();
      renderGeneratedImageSaveFolders();
      toggleImageLibraryModal(saveGeneratedImageModal, true);
    });
    document.getElementById("saveGeneratedImagePicker")?.addEventListener("change", updateGeneratedImageSelection);
    document.getElementById("selectAllGeneratedImages")?.addEventListener("change", event => {
      document.querySelectorAll('[name="generatedImageToSave"]').forEach(input => { input.checked = event.target.checked; });
      updateGeneratedImageSelection();
    });
    document.getElementById("confirmSaveGeneratedImage")?.addEventListener("click", () => {
      const targetId = document.querySelector('[name="generatedImageSaveFolder"]:checked')?.value;
      if (!targetId) return showToast("请选择需要保存的素材组");
      const selectedImages = [...document.querySelectorAll('[name="generatedImageToSave"]:checked')];
      if (!selectedImages.length) return showToast("请至少勾选一张需要保存的图片");
      const folderName = imageFolderNode(targetId)?.dataset.folderName || "所选素材组";
      const product = currentProduct?.().name || "当前商品";
      selectedImages.forEach((input,index) => {
        const card = createManagedImageCard(`${product} ${input.dataset.generatedImageName || `AI生成图 ${index + 1}`}`, targetId, activeType === "image-detail" ? "详情页" : "主图");
        imageManagedGrid?.insertBefore(card, imageFolderEmpty);
      });
      updateImageFolderCounts();
      filterManagedImages();
      toggleImageLibraryModal(saveGeneratedImageModal, false);
      showToast(`${selectedImages.length} 张生成图片已保存至“${folderName}”`);
    });
    document.querySelectorAll("[data-close-save-generated-image]").forEach(button => button.addEventListener("click", () => toggleImageLibraryModal(saveGeneratedImageModal, false)));
    saveGeneratedImageModal?.addEventListener("click", event => { if (event.target === saveGeneratedImageModal) toggleImageLibraryModal(saveGeneratedImageModal, false); });
    imageFolderAssets().forEach(ensureImageAssetActions);
    selectImageFolder(imageFolderNode("root"));
  });

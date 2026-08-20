    /* 无限画布：项目列表、协作项目、新建项目与画布工作区 */
    const infiniteProjectModal = document.getElementById("infiniteProjectModal");
    const infiniteWorkspace = document.getElementById("infiniteCanvasWorkspace");
    const notifyCanvasHost = open => {
      if (window.parent !== window) window.parent.postMessage({ type:"infinite-canvas-workspace", open }, "*");
    };
    function toggleInfiniteProjectModal(open) {
      infiniteProjectModal?.classList.toggle("show", open);
      if (open) setTimeout(() => document.getElementById("infiniteProjectName")?.focus(), 30);
    }
    function enterInfiniteWorkspace(title) {
      const workspaceTitle = document.getElementById("infiniteCanvasWorkspaceTitle");
      if (workspaceTitle) workspaceTitle.textContent = title || "AI创作项目";
      if (infiniteWorkspace) infiniteWorkspace.hidden = false;
      document.body.style.overflow = "hidden";
      notifyCanvasHost(true);
    }
    function closeInfiniteWorkspace() {
      if (infiniteWorkspace) infiniteWorkspace.hidden = true;
      document.getElementById("canvasAgentDrawer")?.classList.remove("open");
      document.body.style.overflow = "";
      notifyCanvasHost(false);
    }
    document.querySelectorAll("[data-infinite-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-infinite-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-infinite-panel]").forEach(panel => panel.hidden = panel.dataset.infinitePanel !== button.dataset.infiniteTab);
    }));
    [document.getElementById("createInfiniteCanvasProject"), document.querySelector("[data-create-infinite-project]")].forEach(button => button?.addEventListener("click", () => toggleInfiniteProjectModal(true)));
    document.querySelectorAll("[data-open-infinite-project]").forEach(card => card.addEventListener("click", () => enterInfiniteWorkspace(card.dataset.projectName || card.querySelector("strong")?.textContent.trim())));
    document.querySelectorAll("[data-close-infinite-project]").forEach(button => button.addEventListener("click", () => toggleInfiniteProjectModal(false)));
    infiniteProjectModal?.addEventListener("click", event => { if (event.target === infiniteProjectModal) toggleInfiniteProjectModal(false); });
    document.getElementById("closeInfiniteCanvasWorkspace")?.addEventListener("click", closeInfiniteWorkspace);
    const canvasCollaboratorModal = document.getElementById("canvasCollaboratorModal");
    let savedCanvasCollaborators = [];
    let pendingCanvasCollaborators = [];
    function renderCanvasCollaborators() {
      const list = document.getElementById("canvasCollaboratorList");
      const count = document.getElementById("canvasCollaboratorCount");
      if (count) count.textContent = `- ${pendingCanvasCollaborators.length}`;
      if (!list) return;
      list.innerHTML = pendingCanvasCollaborators.length ? pendingCanvasCollaborators.map((member,index) => `<div class="canvas-collaborator-item"><span class="canvas-collaborator-avatar">${escapeHtml(member.name.slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.account)} · 待保存</small></div><button type="button" data-remove-canvas-collaborator="${index}">移除</button></div>`).join("") : '<div class="canvas-collaborator-empty"><div>♙</div><strong>暂无协同成员</strong><span>输入成员信息并点击查询</span></div>';
    }
    function toggleCanvasCollaboratorModal(open) {
      if (open) pendingCanvasCollaborators = savedCanvasCollaborators.map(item => ({...item}));
      canvasCollaboratorModal?.classList.toggle("show", open);
      if (open) { renderCanvasCollaborators(); setTimeout(() => document.getElementById("canvasCollaboratorSearch")?.focus(), 30); }
    }
    document.getElementById("openCanvasCollaboratorModal")?.addEventListener("click", () => toggleCanvasCollaboratorModal(true));
    document.getElementById("queryCanvasCollaborator")?.addEventListener("click", () => {
      const input = document.getElementById("canvasCollaboratorSearch");
      const account = input?.value.trim() || "";
      if (!account) return showToast("请输入用户名、手机号或邮箱");
      if (pendingCanvasCollaborators.some(member => member.account === account)) return showToast("该成员已在协同列表中");
      const name = /@/.test(account) ? account.split("@")[0] : /^1\d{10}$/.test(account) ? `成员 ${account.slice(-4)}` : account;
      pendingCanvasCollaborators.push({ name, account });
      if (input) input.value = "";
      renderCanvasCollaborators();
      showToast("已查询到成员，保存后生效");
    });
    document.getElementById("canvasCollaboratorList")?.addEventListener("click", event => {
      const button = event.target.closest("[data-remove-canvas-collaborator]");
      if (!button) return;
      pendingCanvasCollaborators.splice(Number(button.dataset.removeCanvasCollaborator), 1);
      renderCanvasCollaborators();
    });
    document.getElementById("saveCanvasCollaborators")?.addEventListener("click", () => {
      savedCanvasCollaborators = pendingCanvasCollaborators.map(item => ({...item}));
      toggleCanvasCollaboratorModal(false);
      showToast(`已保存 ${savedCanvasCollaborators.length} 位协作者`);
    });
    document.querySelectorAll("[data-close-canvas-collaborator]").forEach(button => button.addEventListener("click", () => toggleCanvasCollaboratorModal(false)));
    canvasCollaboratorModal?.addEventListener("click", event => { if (event.target === canvasCollaboratorModal) toggleCanvasCollaboratorModal(false); });
    const canvasAgentDrawer = document.getElementById("canvasAgentDrawer");
    function toggleCanvasAgent(open) {
      canvasAgentDrawer?.classList.toggle("open", open);
      canvasAgentDrawer?.setAttribute("aria-hidden", String(!open));
      document.getElementById("toggleCanvasAgent")?.classList.toggle("active", open);
      if (open) setTimeout(() => document.getElementById("canvasAgentInput")?.focus(), 220);
    }
    function submitCanvasAgent(text) {
      const value = (text || document.getElementById("canvasAgentInput")?.value || "").trim();
      if (!value) return showToast("请描述需要 Agent 完成的创作任务");
      const content = document.getElementById("canvasAgentContent");
      content?.insertAdjacentHTML("beforeend", `<div class="canvas-agent-message user">${escapeHtml(value)}</div><div class="canvas-agent-message ai">已读取当前画布中的文字、图片和视频节点。我会保留产品主体与现有视觉方向，生成一个可继续编辑的方案。</div>`);
      const input = document.getElementById("canvasAgentInput"); if (input) input.value = "";
      if (content) content.scrollTop = content.scrollHeight;
      showToast(document.getElementById("canvasAgentAuto")?.checked ? "Agent 已开始自动生成" : "Agent 已记录任务，等待确认生成");
    }
    document.getElementById("toggleCanvasAgent")?.addEventListener("click", () => toggleCanvasAgent(!canvasAgentDrawer?.classList.contains("open")));
    document.getElementById("closeCanvasAgent")?.addEventListener("click", () => toggleCanvasAgent(false));
    document.getElementById("sendCanvasAgent")?.addEventListener("click", () => submitCanvasAgent());
    document.getElementById("canvasAgentInput")?.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitCanvasAgent(); } });
    document.querySelectorAll("[data-canvas-agent-suggestion]").forEach(button => button.addEventListener("click", () => submitCanvasAgent(button.dataset.canvasAgentSuggestion)));
    document.getElementById("canvasAgentAdd")?.addEventListener("click", () => showToast("可添加图片、视频或引用画布节点"));
    [
      ["infiniteProjectName", "infiniteProjectNameCount", 50],
      ["infiniteProjectDescription", "infiniteProjectDescriptionCount", 200]
    ].forEach(([inputId, countId, max]) => document.getElementById(inputId)?.addEventListener("input", event => {
      const count = document.getElementById(countId);
      if (count) count.textContent = `${event.target.value.length}/${max}`;
    }));
    document.getElementById("searchInfiniteCollaborator")?.addEventListener("click", () => {
      const value = document.getElementById("infiniteProjectCollaborator")?.value.trim();
      showToast(value ? `已找到与“${value}”匹配的协作成员` : "请输入用户名、手机号或邮箱");
    });
    document.getElementById("confirmCreateInfiniteProject")?.addEventListener("click", () => {
      const nameInput = document.getElementById("infiniteProjectName");
      const name = nameInput?.value.trim() || "";
      if (!name) return showToast("请输入项目名称");
      const panel = document.querySelector("[data-infinite-panel='mine']");
      const card = document.createElement("article");
      card.className = "infinite-project-card";
      card.dataset.openInfiniteProject = "";
      card.dataset.projectName = name;
      card.innerHTML = `<div class="infinite-project-cover"><span>AI</span><b>${name.slice(0, 10)}</b></div><div class="infinite-project-body"><strong>${name.replace(/[<>]/g, "")}</strong><p>▣ 创建于今天　◷ 刚刚更新</p></div>`;
      card.addEventListener("click", () => enterInfiniteWorkspace(name));
      panel?.append(card);
      toggleInfiniteProjectModal(false);
      ["infiniteProjectName", "infiniteProjectDescription", "infiniteProjectCollaborator"].forEach(id => { const input = document.getElementById(id); if (input) input.value = ""; });
      ["infiniteProjectNameCount", "infiniteProjectDescriptionCount"].forEach((id, index) => { const count = document.getElementById(id); if (count) count.textContent = `0/${index ? 200 : 50}`; });
      enterInfiniteWorkspace(name);
      showToast("项目已创建，已进入画布工作区");
    });
    document.getElementById("infiniteProjectSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      document.querySelectorAll("[data-open-infinite-project]").forEach(card => card.hidden = Boolean(keyword && !card.innerText.toLowerCase().includes(keyword)));
    });

    /* 成片视频库：分组、筛选、导入与来源追踪 */
    let activeVideoFolder = "all";
    let editingVideoFolderNode = null;
    let deletingVideoFolderNode = null;
    const videoFolderModal = document.getElementById("videoFolderModal");
    const videoFolderDeleteModal = document.getElementById("videoFolderDeleteModal");
    function videoFolderId(node) { return node?.querySelector(":scope > .image-folder-row")?.dataset.videoFolder || ""; }
    function videoFolderLabel(node) { return node?.querySelector(":scope > .image-folder-row .folder-select span")?.textContent.trim() || ""; }
    function videoFolderDescendantIds(node) { return [...(node?.querySelectorAll("[data-video-folder]") || [])].map(row => row.dataset.videoFolder); }
    function videoFolderActions() { return '<span class="folder-actions"><button class="folder-action" type="button" data-add-video-subfolder title="新增子素材组">＋</button><button class="folder-action" type="button" data-edit-video-folder title="重命名或调整层级">改</button><button class="folder-action danger" type="button" data-delete-video-folder title="删除素材组">删</button></span>'; }
    function decorateVideoFolders() {
      document.querySelectorAll("#videoFolderTree .image-folder-node").forEach(node => {
        const row = node.querySelector(":scope > .image-folder-row");
        if (!row || row.dataset.videoFolder === "all") return;
        node.dataset.videoFolderName = videoFolderLabel(node);
        const caret = row.querySelector(":scope > .folder-caret");
        if (caret) {
          if (caret.tagName !== "BUTTON") { const button=document.createElement("button"); button.className="folder-caret"; button.type="button"; button.dataset.toggleVideoFolder=""; button.textContent="▼"; caret.replaceWith(button); }
          else caret.dataset.toggleVideoFolder = "";
        } else row.insertAdjacentHTML("afterbegin", '<button class="folder-caret" type="button" data-toggle-video-folder>▼</button>');
        if (!row.querySelector(".folder-actions")) row.insertAdjacentHTML("beforeend", videoFolderActions());
        if (!node.querySelector(":scope > .image-folder-children")) node.insertAdjacentHTML("beforeend", '<div class="image-folder-children"></div>');
      });
      const sectionHead = document.querySelector("#videoFolderTree > .image-folder-section-head");
      if (sectionHead && !sectionHead.querySelector("button")) sectionHead.insertAdjacentHTML("beforeend", '<div><button class="text-action" type="button" id="collapseAllVideoFolders">折叠</button><button class="image-group-add" type="button" id="createVideoGroupFromSidebar" title="新建顶级素材组">＋</button></div>');
    }
    function updateVideoFolderCounts() {
      const cards = [...document.querySelectorAll("#finishedVideoGrid [data-video-asset]")];
      document.querySelectorAll("#videoFolderTree [data-video-folder]").forEach(row => {
        const id = row.dataset.videoFolder;
        const node = row.closest(".image-folder-node");
        const ids = id === "all" ? null : videoFolderDescendantIds(node);
        const count = id === "all" ? cards.length : cards.filter(card => ids.includes(card.dataset.folderId)).length;
        const badge = row.querySelector(":scope > .folder-count");
        if (badge) badge.textContent = count;
      });
    }
    function fillVideoParentOptions(excludedNode) {
      const select = document.getElementById("videoFolderParentSelect");
      if (!select) return;
      const excluded = new Set(videoFolderDescendantIds(excludedNode));
      select.innerHTML = '<option value="all">无（顶级视频组）</option>' + [...document.querySelectorAll("#videoFolderTree [data-video-folder]")]
        .filter(row => row.dataset.videoFolder !== "all" && !excluded.has(row.dataset.videoFolder))
        .map(row => `<option value="${row.dataset.videoFolder}">${row.querySelector(".folder-select span")?.textContent.trim()}</option>`).join("");
    }
    function openVideoFolderEditor(node = null, parentId = "") {
      editingVideoFolderNode = node;
      fillVideoParentOptions(node);
      document.getElementById("videoFolderModalTitle").textContent = node ? "编辑视频组" : "新建视频组";
      document.getElementById("videoFolderNameInput").value = node ? videoFolderLabel(node) : "";
      document.getElementById("videoFolderDescriptionInput").value = node?.dataset.videoFolderDescription || "";
      const parentNode = node?.parentElement?.closest(".image-folder-node");
      document.getElementById("videoFolderParentSelect").value = parentId || videoFolderId(parentNode) || "all";
      videoFolderModal?.classList.add("show");
    }
    function videoFolderIncludes(cardFolder, selected) {
      if (selected === "all") return true;
      const selectedNode = document.querySelector(`#videoFolderTree [data-video-folder="${CSS.escape(selected)}"]`)?.closest(".image-folder-node");
      return selectedNode ? videoFolderDescendantIds(selectedNode).includes(cardFolder) : cardFolder === selected;
    }
    function renderFinishedVideos() {
      const keyword = document.getElementById("finishedVideoSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("finishedVideoSource")?.value || "all";
      let visible = 0;
      document.querySelectorAll("#finishedVideoGrid [data-video-asset]").forEach(card => {
        const matchFolder = videoFolderIncludes(card.dataset.folderId, activeVideoFolder);
        const matchSource = source === "all" || card.dataset.videoSource === source;
        const matchKeyword = !keyword || card.innerText.toLowerCase().includes(keyword);
        card.hidden = !(matchFolder && matchSource && matchKeyword);
        if (!card.hidden) visible += 1;
      });
      document.getElementById("finishedVideoEmpty")?.classList.toggle("show", visible === 0);
    }
    document.getElementById("videoFolderTree")?.addEventListener("click", event => {
      if (event.target.closest("#createVideoGroupFromSidebar")) return openVideoFolderEditor();
      if (event.target.closest("#collapseAllVideoFolders")) {
        const nodes = [...document.querySelectorAll("#videoFolderTree .image-folder-node")].filter(node => videoFolderId(node) && videoFolderId(node) !== "all");
        const shouldCollapse = nodes.some(node => !node.classList.contains("collapsed"));
        nodes.forEach(node => node.classList.toggle("collapsed", shouldCollapse));
        event.target.textContent = shouldCollapse ? "展开" : "折叠";
        return;
      }
      const node = event.target.closest(".image-folder-node");
      if (event.target.closest("[data-toggle-video-folder]")) { event.stopPropagation(); node?.classList.toggle("collapsed"); return; }
      if (event.target.closest("[data-add-video-subfolder]")) { event.stopPropagation(); return openVideoFolderEditor(null, videoFolderId(node)); }
      if (event.target.closest("[data-edit-video-folder]")) { event.stopPropagation(); return openVideoFolderEditor(node); }
      if (event.target.closest("[data-delete-video-folder]")) {
        event.stopPropagation(); deletingVideoFolderNode = node;
        const name = document.getElementById("deleteVideoFolderName"); if (name) name.textContent = videoFolderLabel(node);
        return videoFolderDeleteModal?.classList.add("show");
      }
      const row = event.target.closest("[data-video-folder]");
      if (!row) return;
      activeVideoFolder = row.dataset.videoFolder;
      document.querySelectorAll("#videoFolderTree .image-folder-row").forEach(item => item.classList.toggle("selected", item === row));
      const name = row.querySelector(".folder-select span")?.textContent.trim() || "全部成片";
      const current = document.getElementById("currentVideoFolderName");
      const crumb = document.getElementById("videoFolderBreadcrumb");
      if (current) current.textContent = name;
      if (crumb) crumb.textContent = name;
      const summary = document.querySelector("#currentVideoFolderName + small");
      if (summary) summary.textContent = row.dataset.videoFolder === "all" ? "展示全部视频素材" : "展示当前素材组及全部子组视频";
      renderFinishedVideos();
    });
    document.getElementById("finishedVideoSearch")?.addEventListener("input", renderFinishedVideos);
    document.getElementById("finishedVideoSource")?.addEventListener("change", renderFinishedVideos);
    document.getElementById("createVideoFolder")?.addEventListener("click", () => openVideoFolderEditor());
    document.getElementById("saveVideoFolder")?.addEventListener("click", () => {
      const name = document.getElementById("videoFolderNameInput")?.value.trim() || "";
      if (!name) return showToast("请输入视频组名称");
      if (/[\\/:*?\"<>|]/.test(name)) return showToast("视频组名称不能包含特殊符号");
      const parentValue = document.getElementById("videoFolderParentSelect")?.value || "all";
      const parentId = parentValue === "all" ? "" : parentValue;
      const parentNode = parentId ? document.querySelector(`#videoFolderTree [data-video-folder="${parentId}"]`)?.closest(".image-folder-node") : null;
      const target = parentNode?.querySelector(":scope > .image-folder-children") || document.getElementById("videoFolderTree");
      const duplicate = [...(target?.children || [])].some(child => child.matches(".image-folder-node") && child !== editingVideoFolderNode && videoFolderLabel(child) === name);
      if (duplicate) return showToast("同级下已存在同名视频素材组");
      if (editingVideoFolderNode) {
        editingVideoFolderNode.querySelector(":scope > .image-folder-row .folder-select span").textContent = name;
        editingVideoFolderNode.dataset.videoFolderName = name;
        editingVideoFolderNode.dataset.videoFolderDescription = document.getElementById("videoFolderDescriptionInput")?.value.trim() || "";
        if (editingVideoFolderNode.parentElement !== target) target?.append(editingVideoFolderNode);
        showToast("视频组已更新");
      } else {
        const id = "video-group-" + Date.now();
        const node = document.createElement("div");
        node.className = "image-folder-node";
        node.dataset.videoFolderName = name;
        node.dataset.videoFolderDescription = document.getElementById("videoFolderDescriptionInput")?.value.trim() || "";
        node.innerHTML = `<div class="image-folder-row" data-video-folder="${id}"><button class="folder-caret" type="button" data-toggle-video-folder>▼</button><button class="folder-select" type="button"><span>${name.replace(/[<>]/g, "")}</span></button><b class="folder-count">0</b>${videoFolderActions()}</div><div class="image-folder-children"></div>`;
        target?.append(node);
        parentNode?.classList.remove("collapsed");
        showToast("视频组已创建");
      }
      editingVideoFolderNode = null;
      videoFolderModal?.classList.remove("show");
      updateVideoFolderCounts();
    });
    document.getElementById("confirmDeleteVideoFolder")?.addEventListener("click", () => {
      if (!deletingVideoFolderNode) return;
      const ids = videoFolderDescendantIds(deletingVideoFolderNode);
      const parentNode = deletingVideoFolderNode.parentElement?.closest(".image-folder-node");
      const destination = videoFolderId(parentNode) || "internal";
      const clearAssets = document.querySelector("[name='videoFolderDeleteMode']:checked")?.value === "clear";
      document.querySelectorAll("#finishedVideoGrid [data-video-asset]").forEach(card => {
        if (!ids.includes(card.dataset.folderId)) return;
        if (clearAssets) card.remove(); else card.dataset.folderId = destination;
      });
      deletingVideoFolderNode.remove();
      deletingVideoFolderNode = null;
      activeVideoFolder = "all";
      videoFolderDeleteModal?.classList.remove("show");
      document.querySelectorAll("#videoFolderTree .image-folder-row").forEach(row => row.classList.toggle("selected", row.dataset.videoFolder === "all"));
      const current = document.getElementById("currentVideoFolderName"); if (current) current.textContent = "全部成片";
      const crumb = document.getElementById("videoFolderBreadcrumb"); if (crumb) crumb.textContent = "全部成片";
      updateVideoFolderCounts(); renderFinishedVideos();
      showToast(clearAssets ? "视频组及其中素材已删除" : "视频素材已迁移，视频组已删除");
    });
    document.querySelectorAll("[data-close-video-folder]").forEach(button => button.addEventListener("click", () => { editingVideoFolderNode = null; videoFolderModal?.classList.remove("show"); }));
    document.querySelectorAll("[data-close-video-folder-delete]").forEach(button => button.addEventListener("click", () => { deletingVideoFolderNode = null; videoFolderDeleteModal?.classList.remove("show"); }));
    [videoFolderModal, videoFolderDeleteModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) modal.classList.remove("show"); }));
    document.getElementById("importFinishedVideo")?.addEventListener("click", () => {
      const grid = document.getElementById("finishedVideoGrid");
      const card = document.createElement("article");
      card.className = "image-managed-card";
      card.dataset.videoAsset = "";
      card.dataset.folderId = activeVideoFolder === "all" ? "internal" : activeVideoFolder;
      card.dataset.videoSource = "内部制作";
      card.innerHTML = '<div class="video-managed-visual"><span class="video-source-badge">本地导入</span><span class="video-managed-play">▶</span><span class="video-duration">00:20</span></div><div class="image-managed-body"><strong>新导入成片</strong><p>本地文件 · 刚刚导入</p><div class="image-managed-meta"><span>待审核</span><span>1080P</span></div></div>';
      grid?.insertBefore(card, document.getElementById("finishedVideoEmpty"));
      updateVideoFolderCounts();
      renderFinishedVideos();
      showToast("成片已导入，并记录来源与当前视频组");
    });
    decorateVideoFolders();
    updateVideoFolderCounts();


    /* 资产库 · 竞品库 */
    /* 产品库：按产品开启竞品定时分析 */
    const productCompetitorMonitorModal = document.getElementById("productCompetitorMonitorModal");
    let pendingMonitorSwitch = null;
    document.querySelectorAll("#productMarketGrid [data-product-id]").forEach(card => {
      const body = card.querySelector(".product-market-body");
      if (!body || body.querySelector(".product-competitor-monitor")) return;
      body.insertAdjacentHTML("beforeend", '<span class="product-competitor-monitor"><span>开启竞品分析</span><label><input type="checkbox" data-product-competitor-monitor><i></i></label></span>');
    });
    document.getElementById("productMarketGrid")?.addEventListener("click", event => {
      const input = event.target.closest("[data-product-competitor-monitor]");
      if (!input) return;
      event.preventDefault(); event.stopPropagation();
      if (!input.checked) { input.checked = false; showToast("已关闭该产品的竞品定时分析"); return; }
      input.checked = false;
      pendingMonitorSwitch = input;
      document.getElementById("monitorProductName").value = input.closest("[data-product-id]")?.querySelector(".product-market-title strong")?.textContent.trim() || "当前产品";
      productCompetitorMonitorModal?.classList.add("show");
    });
    document.getElementById("saveProductMonitor")?.addEventListener("click", () => {
      if (pendingMonitorSwitch) pendingMonitorSwitch.checked = true;
      productCompetitorMonitorModal?.classList.remove("show");
      showToast(`已开启竞品分析，将按“${document.getElementById("monitorFrequency")?.value}”自动抓取`);
      pendingMonitorSwitch = null;
    });
    document.querySelectorAll("[data-close-product-monitor]").forEach(button => button.addEventListener("click", () => { pendingMonitorSwitch = null; productCompetitorMonitorModal?.classList.remove("show"); }));
    productCompetitorMonitorModal?.addEventListener("click", event => { if (event.target === productCompetitorMonitorModal) { pendingMonitorSwitch = null; productCompetitorMonitorModal.classList.remove("show"); } });

    const competitorEntryModal = document.getElementById("competitorEntryModal");
    const competitorReportModal = document.getElementById("competitorReportModal");
    const competitorDeleteModal = document.getElementById("competitorDeleteModal");
    const competitorImageModal = document.getElementById("competitorImageModal");
    const competitorTableBody = document.getElementById("competitorTableBody");
    document.querySelector('[data-competitor-entry-mode="manual"]')?.remove();
    let competitorEntryMode = "link";
    let editingCompetitorRow = null;
    let pendingDeleteCompetitorRow = null;
    let currentReportCompetitorRow = null;
    let competitorTotal = 28;
    let activeCompetitorReportTab = "product";
    const competitorReportDrafts = new WeakMap();
    const competitorReportDefaults = new Map([...document.querySelectorAll("[data-report-edit-key]")].map(element => [element.dataset.reportEditKey, element.tagName === "TEXTAREA" ? element.value : element.innerText]));

    function toggleCompetitorModal(modal, open) { modal?.classList.toggle("show", open); }
    function safeCompetitorUrl(value) { return /^https?:\/\//i.test(value || "") ? value : "#"; }
    function competitorPlatformClass(platform) { return platform.includes("京东") ? " jd" : platform.includes("淘宝") ? " tb" : platform.includes("小红书") ? " xhs" : ""; }
    function competitorRowData(row) {
      const cells = row?.children || [];
      const flowRow = Boolean(row?.querySelector(".competitor-select"));
      const offset = flowRow ? 1 : 0;
      return {
        name: row?.querySelector(".competitor-product-cell strong")?.textContent.trim() || "未命名竞品",
        source: row?.querySelector(".competitor-product-cell small")?.textContent.trim() || "手动录入",
        url: row?.querySelector(".competitor-source-link")?.getAttribute("href") || "#",
        platform: row?.querySelector(".competitor-platform")?.textContent.trim() || "未识别平台",
        sales: cells[4 + offset]?.textContent.trim() || "待补充",
        audience: cells[5 + offset]?.textContent.trim() || "待补充",
        selling: cells[6 + offset]?.textContent.trim() || "待补充",
        scene: cells[7 + offset]?.textContent.trim() || "待补充",
        category: cells[8 + offset]?.textContent.trim() || "待补充",
        updater: row?.querySelector(".competitor-updater")?.textContent.trim() || "嗡大发",
        updatedAt: row?.querySelector(".competitor-updated-at")?.textContent.trim() || "刚刚"
      };
    }
    function competitorRowHtml(data) {
      const url = safeCompetitorUrl(data.url);
      const linkLabel = url === "#" ? "暂无来源链接" : url.replace(/^https?:\/\//i, "");
      return `<td class="competitor-product-cell"><strong>${escapeHtml(data.name)}</strong><small>${escapeHtml(data.source || "手动录入")}</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-competitor-image>主图</button><button class="competitor-thumb detail" type="button" data-preview-competitor-image>详情</button></div></td><td><a class="competitor-source-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(linkLabel)}</a></td><td><span class="competitor-platform${competitorPlatformClass(data.platform)}">${escapeHtml(data.platform)}</span></td><td><strong>${escapeHtml(data.sales || "待补充")}</strong></td><td class="competitor-cell-copy">${escapeHtml(data.audience || "待补充")}</td><td class="competitor-cell-copy">${escapeHtml(data.selling || "待补充")}</td><td class="competitor-cell-copy">${escapeHtml(data.scene || "待补充")}</td><td class="competitor-category-path">${escapeHtml(data.category || "待补充")}</td><td class="competitor-updater">${escapeHtml(data.updater || "嗡大发")}</td><td class="competitor-updated-at">${escapeHtml(data.updatedAt || "刚刚")}</td><td><div class="competitor-actions"><button type="button" data-view-competitor-report>查看报告</button><button type="button" data-download-competitor-report>下载报告</button><button type="button" data-edit-competitor>编辑</button><button class="danger" type="button" data-delete-competitor>删除</button></div></td>`;
    }
    function applyCompetitorRow(row, data) {
      row.dataset.competitorRow = "";
      row.dataset.name = data.name;
      row.dataset.platform = data.platform;
      row.dataset.category = data.category;
      row.innerHTML = competitorRowHtml(data);
    }
    function updateCompetitorCounts() {
      const rows = [...document.querySelectorAll("#competitorTableBody [data-competitor-row]")];
      const visible = rows.filter(row => !row.hidden).length;
      const visibleLabel = document.getElementById("competitorVisibleCount");
      if (visibleLabel) visibleLabel.textContent = `当前展示 ${visible} 条竞品数据`;
      const metric = document.getElementById("competitorTotalMetric");
      if (metric) metric.textContent = competitorTotal;
    }
    function setCompetitorEntryMode(mode) {
      competitorEntryMode = mode;
      document.querySelectorAll("[data-competitor-entry-mode]").forEach(button => button.classList.toggle("active", button.dataset.competitorEntryMode === mode));
      document.querySelectorAll("[data-competitor-entry-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.competitorEntryPanel === mode));
      const save = document.getElementById("saveCompetitorEntry");
      const hint = document.getElementById("competitorEntryHint");
      if (save) save.textContent = editingCompetitorRow ? "保存修改" : mode === "link" ? "解析并入库" : "新增竞品";
      if (hint) hint.textContent = mode === "link" ? "系统将解析公开商品信息，入库后仍可继续编辑。" : "手动录入字段保存后将进入竞品库并记录操作者。";
    }
    function resetCompetitorManualForm() {
      ["competitorNameInput","competitorUrlInput","competitorSalesInput","competitorCategoryInput","competitorAudienceInput","competitorSellingInput","competitorSceneInput"].forEach(id => { const input = document.getElementById(id); if (input) input.value = ""; });
      document.getElementById("competitorMaterialUpload").textContent = "点击上传产品主图或详情图";
    }
    function openCompetitorEntry(row = null) {
      editingCompetitorRow = row;
      document.getElementById("competitorEntryTitle").textContent = row ? "编辑竞品" : "录入竞品";
      document.querySelectorAll("[data-competitor-entry-mode]").forEach(button => { button.disabled = Boolean(row) && button.dataset.competitorEntryMode !== "manual"; });
      if (row) {
        const data = competitorRowData(row);
        document.getElementById("competitorNameInput").value = data.name;
        document.getElementById("competitorPlatformInput").value = [...document.getElementById("competitorPlatformInput").options].some(option => option.text === data.platform) ? data.platform : "抖音";
        document.getElementById("competitorUrlInput").value = data.url === "#" ? "" : data.url;
        document.getElementById("competitorSalesInput").value = data.sales;
        document.getElementById("competitorCategoryInput").value = data.category;
        document.getElementById("competitorAudienceInput").value = data.audience;
        document.getElementById("competitorSellingInput").value = data.selling;
        document.getElementById("competitorSceneInput").value = data.scene;
        setCompetitorEntryMode("manual");
      } else {
        resetCompetitorManualForm();
        document.getElementById("competitorLinkInput").value = "";
        document.getElementById("competitorParseFeedback").classList.remove("show");
        setCompetitorEntryMode("link");
      }
      toggleCompetitorModal(competitorEntryModal, true);
    }
    function setCompetitorReportTab(tab) {
      activeCompetitorReportTab = tab;
      document.querySelectorAll("[data-competitor-report-tab]").forEach(button => button.classList.toggle("active", button.dataset.competitorReportTab === tab));
      document.querySelectorAll("[data-competitor-report-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.competitorReportPanel === tab));
      competitorReportModal?.querySelector(".modal-body")?.scrollTo({ top:0, behavior:"smooth" });
    }
    function resetCompetitorReportEdits() {
      document.querySelectorAll("[data-report-edit-key]").forEach(element => {
        const value = competitorReportDefaults.get(element.dataset.reportEditKey) || "";
        if (element.tagName === "TEXTAREA") element.value = value;
        else element.innerText = value;
      });
    }
    function applyCompetitorReportDraft(row) {
      resetCompetitorReportEdits();
      const draft = competitorReportDrafts.get(row);
      if (!draft) return;
      Object.entries(draft).forEach(([key,value]) => {
        const element = document.querySelector(`[data-report-edit-key="${CSS.escape(key)}"]`);
        if (!element) return;
        if (element.tagName === "TEXTAREA") element.value = value;
        else element.innerText = value;
      });
    }
    const competitorParameterProfiles = {
      "个护类": {
        benchmark:"头部个护旗舰款",
        logic:"围绕功效表现、人体接触体验、护理技术、安全和便携性进行对比",
        rows:[
          ["核心功能","高速吹护 / 造型护理","高速吹护 + 智能温控","功能覆盖接近，需比较实际效果"],
          ["电机 / 动力","11万转高速电机","11.5万转无刷电机","对标款动力参数略高"],
          ["温度与档位","4档温度、2档风速","5档温度、3档风速","对标款调节颗粒度更细"],
          ["护理技术","负离子护发","高浓度负离子 + 水润离子","对标款护理概念更完整"],
          ["智能温控","每秒50次温度监测","每秒100次温度监测","当前竞品温控频率偏低"],
          ["附件配置","集风嘴、柔风嘴","集风嘴、扩散风嘴、顺发风嘴","对标款附件更丰富"],
          ["噪音","约59dB","约56dB","对标款静音表现更优"],
          ["续航 / 供电","有线供电","有线供电","一致"],
          ["重量","约407g","约390g","当前竞品略重"],
          ["防水与清洁","滤网可拆洗","磁吸滤网可拆洗","对标款维护更便捷"],
          ["安全保护","过热保护、儿童锁","过热保护、NTC温控、儿童锁","对标款安全配置更细"],
          ["适用人群 / 场景","家庭日常、长发人群","家庭、沙龙、差旅","对标款场景覆盖更广"]
        ]
      },
      "环境类": {
        benchmark:"头部环境电器旗舰款",
        logic:"围绕环境改善效率、覆盖面积、传感监测、耗材成本与持续运行体验进行对比",
        rows:[
          ["核心环境指标","颗粒物 CADR 400m³/h","颗粒物 CADR 500m³/h","对标款净化效率更高"],
          ["适用面积","28–48㎡","35–60㎡","对标款覆盖范围更大"],
          ["污染物处理","PM2.5、花粉、异味","PM2.5、甲醛、花粉、异味","当前竞品甲醛能力不足"],
          ["滤网结构","初效 + HEPA + 活性炭","复合HEPA + 高碘值活性炭","对标款滤材规格更强"],
          ["滤芯寿命","约8–12个月","约12–18个月","对标款维护周期更长"],
          ["风量 / 档位","4档风量","自动 + 睡眠 + 5档风量","对标款模式更丰富"],
          ["噪音","睡眠档 32dB","睡眠档 28dB","对标款夜间体验更优"],
          ["传感器","PM2.5、温湿度","PM1.0、PM2.5、VOC、温湿度","当前监测维度较少"],
          ["智能联动","APP远程、定时","APP、语音、场景联动","对标款生态能力更强"],
          ["额定功耗","45W","52W","当前竞品能耗更低"],
          ["耗材成本","滤芯约299元","滤芯约359元","当前竞品维护成本更低"],
          ["适用场景","卧室、客厅","全屋、母婴、养宠、新装修","对标款场景表达更充分"]
        ]
      },
      "清洁类": {
        benchmark:"喵卫 X1 robot",
        logic:"围绕清洁力、清洁结构、路径与边缘能力、续航、维护成本和场景适配进行对比",
        rows:[
          ["核心清洁方式","高频拍打 + 飓风吸尘","扫震一体 + 深紫外除螨","两者技术路径不同"],
          ["拍打频率","20000 次/分钟","15000 次/分钟","当前竞品拍打参数领先"],
          ["吸力","15000Pa","14AW","参数口径不同，需统一实测"],
          ["杀菌配置","UV灯，除螨/杀菌99.9%","270nm UV-C，官方认证","对标款认证背书更强"],
          ["滚刷结构","防缠绕螺旋拍打滚刷","3叶螺旋胶条滚刷","均强调防缠绕"],
          ["路径 / 操控","一键智能巡航","弓字型全域巡航","对标款路径描述更明确"],
          ["边缘与防跌落","基础防跌落传感器","9颗高精度近距传感器","当前竞品传感配置偏弱"],
          ["续航","30分钟","60分钟","对标款续航领先"],
          ["尘杯 / 水箱","可视尘杯、双重过滤","可视尘仓、热风除湿","功能方向不同"],
          ["机身重量","1.7kg","1kg","当前竞品偏重"],
          ["清洁档位","4档","4档","持平"],
          ["维护与自清洁","滚刷滤网可拆洗","热风除湿 + 易拆洗","对标款维护体验更完整"],
          ["适配场景","床垫、床品日常除螨","多软装、多场景","当前场景较集中"]
        ]
      },
      "厨电类": {
        benchmark:"同容量头部厨电款",
        logic:"围绕容量、加热效率、控温、菜单、材质、清洁便利性和厨房安全进行对比",
        rows:[
          ["容量","4.5L","5L","对标款容量略大"],
          ["额定功率","1500W","1700W","对标款升温速度更有优势"],
          ["加热方式","顶部热风循环","360°立体热风循环","对标款热均匀性表达更强"],
          ["温度范围","80–200℃","40–220℃","对标款温域更广"],
          ["时间范围","1–60分钟","1–120分钟","对标款覆盖慢烹场景"],
          ["操控方式","触控面板","彩屏触控 + 旋钮","对标款盲操体验更好"],
          ["预设菜单","8种","12种","对标款菜单更丰富"],
          ["可视化","大尺寸可视窗","可视窗 + 炉灯","对标款观察更清晰"],
          ["内胆 / 涂层","食品级不粘涂层","陶瓷不粘涂层","需比较耐磨与安全认证"],
          ["清洁方式","炸篮可拆洗","炸篮、接油盘可拆洗","对标款清洁结构更完整"],
          ["安全配置","断电记忆、过热保护","过热保护、开盖断电、童锁","当前竞品安全配置较少"],
          ["适用场景","家庭快手餐、聚餐","家庭、烘焙、低温解冻","对标款场景覆盖更广"]
        ]
      },
      "健康类": {
        benchmark:"头部健康监测旗舰款",
        logic:"围绕核心健康功能、测量准确性、传感器、数据维度、医疗认证和长期使用体验进行对比",
        rows:[
          ["核心健康功能","体征监测与趋势记录","多体征监测 + 风险提醒","对标款健康管理更主动"],
          ["测量精度","家用标准精度","医疗级算法校准","对标款精度背书更强"],
          ["传感器配置","单组高精度传感器","双组传感器 + 环境补偿","对标款抗干扰能力更强"],
          ["测量范围","覆盖家庭常用范围","覆盖儿童、成人、老年模式","对标款人群适配更广"],
          ["数据指标","8项核心指标","15项健康指标","对标款数据维度更丰富"],
          ["结果呈现","屏显 + APP趋势","彩屏 + APP + 异常提醒","对标款反馈更直观"],
          ["适用人群","家庭成人用户","儿童、孕妇、成人、老年人","当前竞品人群覆盖偏窄"],
          ["连接方式","蓝牙","蓝牙 + Wi-Fi","对标款同步更稳定"],
          ["续航","约30天","约60天","对标款续航领先"],
          ["材质与舒适性","亲肤接触材质","医用级接触材质","对标款材质背书更强"],
          ["认证资质","CE / RoHS","二类医疗器械认证","当前竞品医疗认证不足"],
          ["适用场景","家庭日常健康管理","家庭、慢病、远程照护","对标款健康服务场景更完整"]
        ]
      }
    };
    function inferCompetitorParameterCategory(data) {
      const text = ((data.category || "") + " " + (data.name || "")).toLowerCase();
      if (/个护|美容|美发|吹风|剃须|脱毛|电动牙刷|冲牙|按摩/.test(text)) return "个护类";
      if (/环境|空气净化|净化器|加湿|除湿|新风|取暖|风扇|循环扇/.test(text)) return "环境类";
      if (/清洁|除螨|洗地|吸尘|扫地|擦窗|蒸汽拖把/.test(text)) return "清洁类";
      if (/厨|空气炸锅|烤箱|蒸箱|电饭|破壁|料理|咖啡|饮水|制冰/.test(text)) return "厨电类";
      if (/健康|血压|血糖|体脂|体温|制氧|理疗|雾化|助眠|健康监测/.test(text)) return "健康类";
      return "清洁类";
    }
    function renderCompetitorParameterComparison(category, currentName, automatic = false) {
      const profile = competitorParameterProfiles[category] || competitorParameterProfiles["清洁类"];
      const selector = document.getElementById("reportComparisonCategory");
      if (selector) selector.value = category;
      document.getElementById("reportParameterCategoryBadge").textContent = category;
      document.getElementById("reportParameterCategoryHint").textContent = (automatic ? "已根据当前商品类目自动匹配：" : "已手动切换对比模板：") + profile.logic;
      document.getElementById("reportParameterCurrentName").textContent = currentName || "当前竞品";
      document.getElementById("reportParameterBenchmarkName").textContent = profile.benchmark;
      document.getElementById("reportParameterTableBody").innerHTML = profile.rows.map(row => "<tr>" + row.map((cell,index) => "<td" + (index === 1 ? " contenteditable=\"true\" class=\"cr-editable\"" : "") + ">" + escapeHtml(cell) + "</td>").join("") + "</tr>").join("");
    }
    function hydrateCompetitorReport(row) {
      const data = competitorRowData(row);
      document.getElementById("competitorReportTitle").textContent = data.name;
      document.getElementById("reportPlatform").textContent = data.platform;
      document.getElementById("reportSales").textContent = data.sales;
      document.getElementById("reportCategory").textContent = data.category;
      document.getElementById("reportAudience").textContent = data.audience;
      document.getElementById("reportSelling").textContent = data.selling;
      document.getElementById("reportScene").textContent = data.scene;
      document.querySelectorAll("[data-report-product-name]").forEach(element => { element.textContent = data.name; });
      renderCompetitorParameterComparison(inferCompetitorParameterCategory(data), data.name, true);
      applyCompetitorReportDraft(row);
      return data;
    }
    function saveCompetitorReportDraft() {
      if (!currentReportCompetitorRow) return;
      const draft = {};
      document.querySelectorAll("[data-report-edit-key]").forEach(element => { draft[element.dataset.reportEditKey] = element.tagName === "TEXTAREA" ? element.value : element.innerText; });
      competitorReportDrafts.set(currentReportCompetitorRow, draft);
      showToast("三 TAB 编辑内容与备注已保存至竞品档案");
    }
    function openCompetitorReport(row) {
      currentReportCompetitorRow = row;
      hydrateCompetitorReport(row);
      setCompetitorReportTab("product");
      toggleCompetitorModal(competitorReportModal, true);
    }
    function copyCompetitorReportText(text) {
      const value = (text || "").trim();
      if (!value) return showToast("暂无可复制内容");
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(() => showToast("内容已复制")).catch(() => showToast("复制失败，请手动选择文本"));
      else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.append(input);
        input.select();
        document.execCommand("copy");
        input.remove();
        showToast("内容已复制");
      }
    }
    function reportSectionText(sectionName) {
      if (sectionName === "active") return document.querySelector(`[data-competitor-report-panel="${activeCompetitorReportTab}"]`)?.innerText || "";
      return document.querySelector(`[data-report-section="${sectionName}"]`)?.innerText || "";
    }
    function downloadCompetitorReport(row) {
      if (!row) return;
      const data = hydrateCompetitorReport(row);
      const source = document.getElementById("competitorReportContent");
      const clone = source.cloneNode(true);
      clone.querySelectorAll(".cr-panel").forEach((panel,index) => { panel.style.display = "block"; panel.insertAdjacentHTML("afterbegin", `<h2>${index === 0 ? "TAB1 产品分析" : index === 1 ? "TAB2 主图分析" : "TAB3 详情图分析"}</h2>`); });
      clone.querySelectorAll("button").forEach(button => button.remove());
      clone.querySelectorAll("textarea").forEach(area => { const paragraph = document.createElement("p"); paragraph.textContent = area.value || "暂无补充备注"; area.replaceWith(paragraph); });
      clone.querySelectorAll("[contenteditable]").forEach(element => element.removeAttribute("contenteditable"));
      const report = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(data.name)}竞品分析报告</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;margin:0;padding:30px;color:#343742;line-height:1.65;background:#fff}h1{font-size:24px;margin:0}h2{margin:30px 0 12px;padding-bottom:8px;border-bottom:2px solid #625bd5;color:#3e4250}h4,h5{margin:8px 0}p{white-space:pre-line}section,article,.cr-section,.cr-analysis-card,.cr-summary-card,.cr-insight-card,.cr-qa-card,.cr-analysis-block{margin:10px 0;padding:12px;border:1px solid #ddd;border-radius:8px;break-inside:avoid}.cr-grid-2,.cr-summary-grid,.cr-analysis-columns,.cr-global-review,.cr-demographic,.cr-qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.competitor-report-facts,.cr-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.competitor-report-fact,.cr-kpi{padding:8px;border:1px solid #ddd}.cr-data-table{width:100%;border-collapse:collapse;font-size:11px}.cr-data-table th,.cr-data-table td{padding:7px;border:1px solid #ddd;text-align:left}.cr-media-thumb,.cr-product-cover,.cr-long-segment{padding:18px;border-radius:8px;color:#fff;background:#6963d7}.cr-bar-track{height:8px;background:#eee}.cr-bar-track i{display:block;height:100%;background:#6963d7}.cr-gallery,.cr-detail-preview{margin-bottom:12px}.cr-prompt{padding:8px;background:#f5f2ff}.badge,.cr-module-badge{font-size:10px;color:#625bd5}@media print{body{padding:0}.cr-section,article{break-inside:avoid}}</style></head><body><h1>${escapeHtml(data.name)} · 三 TAB 竞品分析报告</h1><p>平台：${escapeHtml(data.platform)}　公开销量：${escapeHtml(data.sales)}　导出时间：${new Date().toLocaleString()}</p>${clone.innerHTML}<p style="margin-top:28px;color:#888;font-size:11px;">数据来自平台公开信息、链接解析和用户补充；部分分析内容由 AI 生成。</p></body></html>`;
      const blob = new Blob([report], { type: "text/html;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${data.name.replace(/[\\/:*?"<>|]/g, "-")}-三TAB竞品分析报告.html`;
      document.body.append(link);
      link.click();
      const href = link.href;
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 800);
      showToast("完整报告已导出，包含三 TAB 全部内容");
    }
    function filterCompetitorRows() {
      const keyword = document.getElementById("competitorSearch")?.value.trim().toLowerCase() || "";
      const platform = document.getElementById("competitorPlatformFilter")?.value || "all";
      const category = document.getElementById("competitorCategoryFilter")?.value || "all";
      document.querySelectorAll("#competitorTableBody [data-competitor-row]").forEach(row => {
        const matchesKeyword = !keyword || row.textContent.toLowerCase().includes(keyword);
        const matchesPlatform = platform === "all" || row.dataset.platform === platform;
        const matchesCategory = category === "all" || row.dataset.category.includes(category);
        row.hidden = !(matchesKeyword && matchesPlatform && matchesCategory);
      });
      updateCompetitorCounts();
    }
    document.querySelectorAll("[data-open-competitor-entry]").forEach(button => button.addEventListener("click", () => openCompetitorEntry()));
    document.querySelectorAll("[data-close-competitor-entry]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorEntryModal, false)));
    document.querySelectorAll("[data-close-competitor-report]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorReportModal, false)));
    document.querySelectorAll("[data-close-competitor-delete]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorDeleteModal, false)));
    document.querySelectorAll("[data-close-competitor-image]").forEach(button => button.addEventListener("click", () => toggleCompetitorModal(competitorImageModal, false)));
    document.querySelectorAll("[data-competitor-entry-mode]").forEach(button => button.addEventListener("click", () => setCompetitorEntryMode(button.dataset.competitorEntryMode)));
    document.getElementById("parseCompetitorLinks")?.addEventListener("click", () => {
      const value = document.getElementById("competitorLinkInput").value.trim();
      if (!value) return showToast("请先粘贴竞品商品链接");
      document.getElementById("competitorParseFeedback").classList.add("show");
      showToast("链接解析完成，可确认入库");
    });
    document.getElementById("competitorMaterialUpload")?.addEventListener("click", event => { event.currentTarget.textContent = "已选择：竞品主图 2 张、详情图 4 张"; event.currentTarget.classList.add("selected"); });
    document.getElementById("saveCompetitorEntry")?.addEventListener("click", () => {
      let data;
      if (competitorEntryMode === "manual") {
        const name = document.getElementById("competitorNameInput").value.trim();
        if (!name) return showToast("请填写竞品产品名称");
        data = { name, source: editingCompetitorRow ? "手动编辑" : "手动录入", updater:"嗡大发", updatedAt:"刚刚", platform: document.getElementById("competitorPlatformInput").value, url: document.getElementById("competitorUrlInput").value.trim() || "#", sales: document.getElementById("competitorSalesInput").value.trim() || "待补充", category: document.getElementById("competitorCategoryInput").value.trim() || "待补充", audience: document.getElementById("competitorAudienceInput").value.trim() || "待补充", selling: document.getElementById("competitorSellingInput").value.trim() || "待补充", scene: document.getElementById("competitorSceneInput").value.trim() || "待补充" };
      } else if (competitorEntryMode === "link") {
        const url = document.getElementById("competitorLinkInput").value.trim().split(/\n+/)[0];
        if (!url) return showToast("请至少粘贴一个竞品链接");
        const platform = /jd/i.test(url) ? "京东" : /taobao|tmall/i.test(url) ? "淘宝 / 天猫" : /xiaohongshu/i.test(url) ? "小红书" : /pinduoduo/i.test(url) ? "拼多多" : "抖音";
        data = { name:"智能解析竞品商品", source:"链接解析", updater:"嗡大发", updatedAt:"刚刚", platform, url, sales:"待同步", category:"家用电器 / 待确认类目", audience:"待完善", selling:"已提取公开商品卖点", scene:"待完善" };
      }
      if (editingCompetitorRow) {
        applyCompetitorRow(editingCompetitorRow, data);
        showToast("竞品信息已更新");
      } else {
        const row = document.createElement("tr");
        applyCompetitorRow(row, data);
        competitorTableBody.prepend(row);
        competitorTotal += 1;
        showToast("竞品数据已入库");
      }
      editingCompetitorRow = null;
      toggleCompetitorModal(competitorEntryModal, false);
      filterCompetitorRows();
    });
    competitorTableBody?.addEventListener("click", event => {
      const row = event.target.closest("[data-competitor-row]");
      if (!row) return;
      if (event.target.closest("[data-view-competitor-report]")) return openCompetitorReport(row);
      if (event.target.closest("[data-download-competitor-report]")) return downloadCompetitorReport(row);
      if (event.target.closest("[data-edit-competitor]")) return openCompetitorEntry(row);
      if (event.target.closest("[data-delete-competitor]")) {
        pendingDeleteCompetitorRow = row;
        document.getElementById("deleteCompetitorName").textContent = competitorRowData(row).name;
        toggleCompetitorModal(competitorDeleteModal, true);
        return;
      }
      if (event.target.closest("[data-preview-competitor-image]")) {
        const data = competitorRowData(row);
        document.getElementById("competitorImageTitle").textContent = `${data.name} · ${event.target.textContent.trim()}`;
        document.getElementById("competitorImagePreview").textContent = `${data.name}\n商品视觉预览`;
        toggleCompetitorModal(competitorImageModal, true);
      }
    });
    document.getElementById("productRelatedCompetitorBody")?.addEventListener("click", event => {
      const row = event.target.closest("[data-product-related-competitor]");
      if (!row) return;
      if (event.target.closest("[data-view-related-competitor-report]")) return openCompetitorReport(row);
      if (event.target.closest("[data-download-related-competitor-report]")) return downloadCompetitorReport(row);
      if (event.target.closest("[data-preview-related-competitor-image]")) {
        const data = competitorRowData(row);
        document.getElementById("competitorImageTitle").textContent = `${data.name} · ${event.target.textContent.trim()}`;
        document.getElementById("competitorImagePreview").textContent = `${data.name}\n商品视觉预览`;
        toggleCompetitorModal(competitorImageModal, true);
      }
    });
    document.getElementById("confirmDeleteCompetitor")?.addEventListener("click", () => {
      if (!pendingDeleteCompetitorRow) return;
      const name = competitorRowData(pendingDeleteCompetitorRow).name;
      pendingDeleteCompetitorRow.remove();
      pendingDeleteCompetitorRow = null;
      competitorTotal = Math.max(0, competitorTotal - 1);
      toggleCompetitorModal(competitorDeleteModal, false);
      updateCompetitorCounts();
      showToast(`“${name}”已删除，操作记录已留痕`);
    });
    document.querySelectorAll("[data-competitor-report-tab]").forEach(button => button.addEventListener("click", () => setCompetitorReportTab(button.dataset.competitorReportTab)));
    document.getElementById("reportComparisonCategory")?.addEventListener("change", event => {
      const currentName = currentReportCompetitorRow ? competitorRowData(currentReportCompetitorRow).name : "当前竞品";
      renderCompetitorParameterComparison(event.target.value, currentName, false);
      showToast(`已切换为${event.target.value}参数对比模板`);
    });
    competitorReportModal?.addEventListener("click", event => {
      const promptButton = event.target.closest("[data-copy-report-prompt]");
      if (promptButton) return copyCompetitorReportText(promptButton.closest(".cr-prompt")?.querySelector("span")?.innerText || "");
      const copyButton = event.target.closest("[data-report-copy-section]");
      if (copyButton) return copyCompetitorReportText(reportSectionText(copyButton.dataset.reportCopySection));
      const screenshotButton = event.target.closest("[data-report-screenshot]");
      if (screenshotButton) return showToast("当前分析内容已生成高清截图");
      const exportButton = event.target.closest("[data-report-export]");
      if (exportButton) return showToast(`${exportButton.dataset.reportExport}图片与拆解内容已导出`);
      const assetButton = event.target.closest("[data-report-save-asset]");
      if (assetButton) return showToast(`${assetButton.dataset.reportSaveAsset}已存入资产库 · 图片库 / 竞品分析`);
      const preview = event.target.closest("[data-report-image-preview]");
      if (preview) {
        const data = currentReportCompetitorRow ? competitorRowData(currentReportCompetitorRow) : { name:"竞品" };
        document.getElementById("competitorImageTitle").textContent = `${data.name} · ${preview.dataset.reportImagePreview}`;
        document.getElementById("competitorImagePreview").textContent = `${preview.dataset.reportImagePreview}\n局部高清视觉预览`;
        toggleCompetitorModal(competitorImageModal, true);
      }
    });
    document.getElementById("saveCompetitorReportEdits")?.addEventListener("click", saveCompetitorReportDraft);
    document.getElementById("saveCompetitorReportFooter")?.addEventListener("click", saveCompetitorReportDraft);
    document.getElementById("printCompetitorReport")?.addEventListener("click", () => { showToast("已打开当前 TAB 打印视图"); window.print(); });
    document.getElementById("downloadCurrentCompetitorReport")?.addEventListener("click", () => downloadCompetitorReport(currentReportCompetitorRow));
    document.getElementById("downloadCompetitorReportFooter")?.addEventListener("click", () => downloadCompetitorReport(currentReportCompetitorRow));
    document.getElementById("competitorSearch")?.addEventListener("input", filterCompetitorRows);
    document.getElementById("competitorPlatformFilter")?.addEventListener("change", filterCompetitorRows);
    document.getElementById("competitorCategoryFilter")?.addEventListener("change", filterCompetitorRows);
    document.getElementById("refreshCompetitors")?.addEventListener("click", () => { showToast("竞品公开数据已刷新"); updateCompetitorCounts(); });
    [competitorEntryModal, competitorReportModal, competitorDeleteModal, competitorImageModal].forEach(modal => modal?.addEventListener("click", event => { if (event.target === modal) toggleCompetitorModal(modal, false); }));
    updateCompetitorCounts();

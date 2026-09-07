(function () {
  "use strict";

  const model = window.ContentCompassPermissionModel;
  if (!model) return;

  const nodeMap = new Map();
  const parentMap = new Map();
  const descendantsMap = new Map();

  function indexNodes(nodes, parentId = "") {
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      if (parentId) parentMap.set(node.id, parentId);
      indexNodes(node.children || [], node.id);
    });
  }

  function descendants(id) {
    if (descendantsMap.has(id)) return descendantsMap.get(id);
    const result = [];
    const visit = node => {
      (node.children || []).forEach(child => {
        result.push(child.id);
        visit(child);
      });
    };
    visit(nodeMap.get(id) || {});
    descendantsMap.set(id, result);
    return result;
  }

  indexNodes(model.functionTree);
  const allPermissionIds = [...nodeMap.keys()];
  const scopeLevel = Object.fromEntries(model.scopeOptions.map(item => [item.value, item.level]));
  const fixedAllViewObjects = new Set(["brand", "product"]);
  const defaultAllViewObjects = new Set(["material", "reference", "persona", "structure"]);
  const allByDefaultViewObjects = new Set([...fixedAllViewObjects, ...defaultAllViewObjects]);
  const emptyScopes = () => Object.fromEntries(model.dataObjects.map(item => [item.id, { view: allByDefaultViewObjects.has(item.id) ? "all" : "none", maintain: "none", delete: "none" }]));
  const supportsScope = (object, scopeKey) => !object.scopeKeys || object.scopeKeys.includes(scopeKey);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  function permissionsForPrefixes(prefixes) {
    const selected = new Set(allPermissionIds.filter(id => prefixes.some(prefix => id === prefix || id.startsWith(`${prefix}.`))));
    [...selected].forEach(id => {
      let parentId = parentMap.get(id);
      while (parentId) {
        selected.add(parentId);
        parentId = parentMap.get(parentId);
      }
    });
    return selected;
  }

  const roleGroups = {
    system: { name: "系统角色", type: "builtin", collapsed: false },
    operation: { name: "业务运营", type: "configured", collapsed: false },
    creation: { name: "视频创作", type: "configured", collapsed: false }
  };

  const roles = {
    admin: {
      name: "管理员",
      type: "builtin",
      groupId: "system",
      permissions: new Set(allPermissionIds),
      scopes: Object.fromEntries(model.dataObjects.map(item => [item.id, { view: "all", maintain: "all", delete: "all" }]))
    },
    content: {
      name: "内容运营",
      type: "configured",
      groupId: "operation",
      permissions: permissionsForPrefixes(["ai.copy", "ai.imitate", "ai.rewrite", "asset.brand", "asset.product", "asset.copy", "asset.persona", "asset.structure"]),
      scopes: emptyScopes()
    },
    video: {
      name: "视频制作",
      type: "configured",
      groupId: "creation",
      permissions: permissionsForPrefixes(["ai.script", "ai.mix", "ai.breakdown", "asset.product", "asset.script", "asset.material", "asset.finished", "asset.reference", "asset.structure"]),
      scopes: emptyScopes()
    }
  };

  const configuredScopeDefaults = {
    content: {
      brand: ["all", "department", "self"], product: ["all", "department", "self"], copy: ["all", "department", "self"],
      persona: ["all", "department", "self"], structure: ["all", "department", "self"]
    },
    video: {
      product: ["all", "department", "self"], script: ["all", "department", "self"], material: ["all", "all", "self"],
      finished: ["all", "all", "self"], reference: ["all", "all", "self"], structure: ["all", "department", "self"]
    }
  };

  Object.entries(configuredScopeDefaults).forEach(([roleId, defaults]) => {
    Object.entries(defaults).forEach(([objectId, values]) => {
      roles[roleId].scopes[objectId] = { view: values[0], maintain: values[1], delete: values[2] };
    });
  });

  const members = [
    { name: "嗡大发", phone: "13800000001", departments: ["抖音三区"], roleIds: ["admin"], enabled: true },
    { name: "林运营", phone: "13800000002", departments: ["内容运营部"], roleIds: ["content"], enabled: true },
    { name: "王剪辑", phone: "13800000003", departments: ["视频制作部", "内容运营部"], roleIds: ["video", "content"], enabled: true },
    { name: "陈新同学", phone: "13800000004", departments: ["内容运营部"], roleIds: [], enabled: true },
    { name: "周协作", phone: "13800000005", departments: ["视频制作部"], roleIds: ["video"], enabled: false }
  ];

  let activeRole = "admin";
  let activePanel = "function";
  let isEditingRole = false;
  let editSnapshot = null;
  const expanded = new Set([
    "ai", "asset", "asset.brand", "asset.product",
    "promotion", "promotion.productCard", "promotion.productCard.generate", "promotion.productCard.distribute", "promotion.authorization",
    "system"
  ]);

  const elements = {
    roleList: document.getElementById("permissionRoleList"),
    roleCount: document.getElementById("permissionRoleCount"),
    roleTitle: document.getElementById("permissionRoleTitle"),
    roleNameInput: document.getElementById("permissionRoleNameInput"),
    roleActions: document.getElementById("permissionRoleActions"),
    tree: document.getElementById("permissionTree"),
    dataRows: document.getElementById("permissionDataRows"),
    selectedCount: document.getElementById("permissionSelectedCount"),
    memberRows: document.getElementById("permissionMemberRows"),
    memberEmpty: document.getElementById("permissionMemberEmpty"),
    memberSearch: document.getElementById("permissionMemberSearch"),
    deptSearch: document.getElementById("permissionDeptSearch"),
    statusFilter: document.getElementById("permissionStatusFilter")
  };

  function notify(message) {
    if (typeof window.showToast === "function") return window.showToast(message);
    let toast = document.getElementById("permissionFallbackToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "permissionFallbackToast";
      toast.className = "permission-fallback-toast";
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function getAncestors(id) {
    const result = [];
    let current = parentMap.get(id);
    while (current) {
      result.push(current);
      current = parentMap.get(current);
    }
    return result;
  }

  function branchStats(role, node) {
    const ids = [node.id, ...descendants(node.id)];
    const selected = ids.filter(id => role.permissions.has(id)).length;
    return { selected, total: ids.length };
  }

  function renderNode(node, depth = 0) {
    const role = roles[activeRole];
    const hasChildren = Boolean(node.children?.length);
    const locked = activeRole === "admin" || !isEditingRole || (activeRole !== "admin" && (node.id === "system" || node.id.startsWith("system.")));
    const isExpanded = expanded.has(node.id);
    const typeLabel = node.type === "menu" ? "菜单" : node.type === "page" ? (node.id.startsWith("promotion.") ? "Tab" : "页面") : "按钮";
    const stats = branchStats(role, node);
    return `<div class="permission-node permission-node-${node.type}" data-node-id="${node.id}" style="--permission-depth:${depth}">
      <div class="permission-node-row">
        ${hasChildren ? `<button class="permission-node-toggle ${isExpanded ? "open" : ""}" type="button" data-toggle-permission-node="${node.id}" aria-label="${isExpanded ? "收起" : "展开"}${node.label}">›</button>` : `<span class="permission-node-spacer"></span>`}
        <label class="permission-node-check">
          <input type="checkbox" data-permission-id="${node.id}" ${role.permissions.has(node.id) ? "checked" : ""} ${locked ? "disabled" : ""}>
          <span class="permission-node-label">${node.label}</span>
          <span class="permission-node-type">${typeLabel}</span>
        </label>
        ${hasChildren ? `<span class="permission-node-count">${stats.selected}/${stats.total}</span>` : ""}
      </div>
      ${hasChildren ? `<div class="permission-node-children ${isExpanded ? "open" : ""}">${node.children.map(child => renderNode(child, depth + 1)).join("")}</div>` : ""}
    </div>`;
  }

  function updateIndeterminateStates() {
    if (!elements.tree) return;
    elements.tree.querySelectorAll("[data-permission-id]").forEach(input => {
      const node = nodeMap.get(input.dataset.permissionId);
      if (!node?.children?.length) return;
      const childIds = descendants(node.id);
      const selectedChildren = childIds.filter(id => roles[activeRole].permissions.has(id)).length;
      input.indeterminate = selectedChildren > 0 && selectedChildren < childIds.length;
    });
  }

  function renderRoleList() {
    if (!elements.roleList) return;
    elements.roleList.innerHTML = Object.entries(roleGroups).map(([groupId, group]) => {
      const groupRoles = Object.entries(roles).filter(([, role]) => role.groupId === groupId);
      const roleItems = groupRoles.map(([id, role]) => `<div class="permission-role-wrap">
        <button class="permission-role ${id === activeRole ? "active" : ""}" type="button" data-permission-role="${id}">
          <span class="permission-role-avatar">${escapeHtml(role.name.slice(0, 1))}</span>
          <span class="permission-role-copy"><strong>${escapeHtml(role.name)}</strong></span>
          <span class="permission-role-arrow">›</span>
        </button>
        ${role.type === "configured" && !isEditingRole ? `<button class="permission-item-more" type="button" data-role-menu="${id}" aria-label="${escapeHtml(role.name)}操作">···</button><div class="permission-context-menu" data-role-menu-panel="${id}"><button type="button" data-role-command="edit" data-role-id="${id}">编辑角色</button><button type="button" data-role-command="move" data-role-id="${id}">移动分组</button><button class="danger" type="button" data-role-command="delete" data-role-id="${id}">删除角色</button></div>` : ""}
      </div>`).join("");
      return `<section class="permission-role-group ${group.collapsed ? "collapsed" : ""}" data-role-group="${groupId}">
        <div class="permission-role-group-head">
          <button class="permission-role-group-toggle" type="button" data-toggle-role-group="${groupId}" aria-label="${group.collapsed ? "展开" : "收起"}${escapeHtml(group.name)}"><span>›</span><strong>${escapeHtml(group.name)}</strong><small>${groupRoles.length}</small></button>
          ${group.type === "configured" && !isEditingRole ? `<button class="permission-group-more" type="button" data-group-menu="${groupId}" aria-label="${escapeHtml(group.name)}操作">···</button><div class="permission-context-menu group-menu" data-group-menu-panel="${groupId}"><button type="button" data-group-command="edit" data-group-id="${groupId}">重命名角色组</button><button class="danger" type="button" data-group-command="delete" data-group-id="${groupId}">删除角色组</button></div>` : ""}
        </div>
        <div class="permission-role-group-body">${roleItems || `<div class="permission-role-group-empty">暂无角色</div>`}</div>
      </section>`;
    }).join("");
    if (elements.roleCount) elements.roleCount.textContent = String(Object.keys(roles).length);
  }

  function renderPermissionTree() {
    if (!elements.tree) return;
    elements.tree.innerHTML = model.functionTree.map(node => renderNode(node)).join("");
    updateIndeterminateStates();
    const selected = roles[activeRole].permissions.size;
    if (elements.selectedCount) elements.selectedCount.textContent = activeRole === "admin" ? `全部 ${allPermissionIds.length} 项` : `已选择 ${selected} / ${allPermissionIds.length} 项`;
  }

  function selectedKinds(rootId) {
    const role = roles[activeRole];
    const selectedNodes = [rootId, ...descendants(rootId)].map(id => nodeMap.get(id)).filter(Boolean).filter(node => role.permissions.has(node.id));
    return {
      view: role.permissions.has(rootId),
      maintain: selectedNodes.some(node => node.kind === "maintain"),
      delete: selectedNodes.some(node => node.kind === "delete")
    };
  }

  function normalizeScopes(roleId = activeRole) {
    const role = roles[roleId];
    if (!role) return;
    model.dataObjects.forEach(object => {
      const availability = roleId === "admin" ? { view: true, maintain: true, delete: true } : selectedKindsForRole(role, object.root);
      const scopes = role.scopes[object.id] || (role.scopes[object.id] = { view: "none", maintain: "none", delete: "none" });
      ["view", "maintain", "delete"].forEach(key => {
        if (!supportsScope(object, key)) scopes[key] = "none";
        else if (key === "view" && fixedAllViewObjects.has(object.id)) scopes[key] = "all";
        else if (!availability[key] && !(key === "view" && defaultAllViewObjects.has(object.id))) scopes[key] = "none";
        else if (roleId === "admin") scopes[key] = "all";
      });
      if (scopeLevel[scopes.maintain] > scopeLevel[scopes.view]) scopes.maintain = scopes.view;
      if (scopeLevel[scopes.delete] > scopeLevel[scopes.view]) scopes.delete = scopes.view;
    });
  }

  function selectedKindsForRole(role, rootId) {
    const selectedNodes = [rootId, ...descendants(rootId)].map(id => nodeMap.get(id)).filter(Boolean).filter(node => role.permissions.has(node.id));
    return {
      view: role.permissions.has(rootId),
      maintain: selectedNodes.some(node => node.kind === "maintain"),
      delete: selectedNodes.some(node => node.kind === "delete")
    };
  }

  function scopeSelect(objectId, scopeKey, enabled, value) {
    const fixedView = scopeKey === "view" && fixedAllViewObjects.has(objectId);
    const availableOptions = fixedView
      ? model.scopeOptions.filter(option => option.value === "all")
      : model.scopeOptions;
    const options = availableOptions.map(option => `<option value="${option.value}" ${option.value === value ? "selected" : ""}>${option.label}</option>`).join("");
    return `<select class="scope-select" data-scope-object="${objectId}" data-scope-key="${scopeKey}" ${activeRole === "admin" || !isEditingRole || !enabled ? "disabled" : ""}>${options}</select>`;
  }

  function renderDataPermissions() {
    if (!elements.dataRows) return;
    normalizeScopes();
    const role = roles[activeRole];
    elements.dataRows.innerHTML = model.dataObjects.map(object => {
      const availability = activeRole === "admin" ? { view: true, maintain: true, delete: true } : selectedKinds(object.root);
      if (fixedAllViewObjects.has(object.id)) availability.view = true;
      const scopes = role.scopes[object.id];
      return `<tr>
        <td><div class="permission-data-name"><span>${object.label.slice(0, 1)}</span><strong>${object.label}</strong></div></td>
        <td>${supportsScope(object, "view") ? scopeSelect(object.id, "view", availability.view, scopes.view) : '<span class="scope-not-applicable">--</span>'}</td>
        <td>${supportsScope(object, "maintain") ? scopeSelect(object.id, "maintain", availability.maintain, scopes.maintain) : '<span class="scope-not-applicable">--</span>'}</td>
        <td>${supportsScope(object, "delete") ? scopeSelect(object.id, "delete", availability.delete, scopes.delete) : '<span class="scope-not-applicable">--</span>'}</td>
      </tr>`;
    }).join("");
  }

  function renderRoleHeader() {
    const role = roles[activeRole];
    if (!role) return;
    if (elements.roleTitle) {
      elements.roleTitle.textContent = role.name;
      elements.roleTitle.hidden = isEditingRole;
    }
    if (elements.roleNameInput) {
      elements.roleNameInput.hidden = !isEditingRole;
      elements.roleNameInput.value = role.name;
    }
    if (elements.roleActions) {
      elements.roleActions.hidden = role.type !== "configured";
      elements.roleActions.innerHTML = isEditingRole
        ? `<button class="text-btn" type="button" data-role-command="cancel">取消</button><button class="primary-btn permission-save-role" type="button" data-role-command="save">保存</button>`
        : `<button class="text-btn" type="button" data-preview-promotion-role>预览推广权限</button><button class="text-btn" type="button" data-role-command="edit">编辑角色</button><button class="text-btn" type="button" data-role-command="move">移动分组</button><button class="text-btn danger" type="button" data-role-command="delete">删除角色</button>`;
    }
    [document.getElementById("newPermissionRoleGroup"), document.getElementById("newPermissionRole")].forEach(button => {
      if (button) button.disabled = isEditingRole;
    });
  }

  function selectRole(roleId) {
    if (!roles[roleId]) return;
    if (isEditingRole) {
      if (roleId !== activeRole) notify("请先保存或取消当前编辑");
      return;
    }
    activeRole = roleId;
    renderRoleList();
    renderRoleHeader();
    renderPermissionTree();
    renderDataPermissions();
  }

  function beginRoleEdit(roleId = activeRole) {
    const role = roles[roleId];
    if (!role || role.type !== "configured") return;
    if (isEditingRole) return;
    if (roleId !== activeRole) activeRole = roleId;
    isEditingRole = true;
    editSnapshot = {
      name: role.name,
      permissions: new Set(role.permissions),
      scopes: JSON.parse(JSON.stringify(role.scopes))
    };
    renderRoleList();
    renderRoleHeader();
    renderPermissionTree();
    renderDataPermissions();
    setTimeout(() => elements.roleNameInput?.focus(), 0);
  }

  function cancelRoleEdit() {
    const role = roles[activeRole];
    if (!isEditingRole || !role || !editSnapshot) return;
    role.name = editSnapshot.name;
    role.permissions = new Set(editSnapshot.permissions);
    role.scopes = JSON.parse(JSON.stringify(editSnapshot.scopes));
    isEditingRole = false;
    editSnapshot = null;
    selectRole(activeRole);
  }

  function saveRoleEdit() {
    const role = roles[activeRole];
    if (!isEditingRole || !role) return;
    const name = (elements.roleNameInput?.value || "").trim();
    if (!name) return notify("请输入角色名称");
    if (Object.entries(roles).some(([id, item]) => id !== activeRole && item.name.toLowerCase() === name.toLowerCase())) return notify("角色名称已存在");
    role.name = name;
    normalizeScopes();
    isEditingRole = false;
    editSnapshot = null;
    selectRole(activeRole);
    renderMembers();
    notify("角色配置已保存");
  }

  function togglePermission(permissionId, checked) {
    const role = roles[activeRole];
    if (!role || !isEditingRole || activeRole === "admin" || permissionId === "system" || permissionId.startsWith("system.")) return;
    const previousAvailability = Object.fromEntries(model.dataObjects.map(object => [object.id, selectedKindsForRole(role, object.root)]));
    const node = nodeMap.get(permissionId);
    const affected = checked && node?.type === "button" ? [permissionId] : [permissionId, ...descendants(permissionId)];
    if (checked) {
      affected.forEach(id => role.permissions.add(id));
      getAncestors(permissionId).forEach(id => role.permissions.add(id));
    } else {
      affected.forEach(id => role.permissions.delete(id));
    }
    model.dataObjects.forEach(object => {
      const currentAvailability = selectedKindsForRole(role, object.root);
      const scopes = role.scopes[object.id];
      ["view", "maintain", "delete"].forEach(key => {
        if (!previousAvailability[object.id][key] && currentAvailability[key] && scopes[key] === "none") scopes[key] = "self";
      });
    });
    normalizeScopes();
    renderPermissionTree();
    renderDataPermissions();
  }

  function setPanel(panel) {
    activePanel = panel;
    document.querySelectorAll("[data-permission-tab]").forEach(tab => {
      const active = tab.dataset.permissionTab === panel;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-permission-panel]").forEach(item => item.classList.toggle("active", item.dataset.permissionPanel === panel));
    if (panel === "data") renderDataPermissions();
  }

  function memberRoleNames(member) {
    return member.roleIds.map(roleId => roles[roleId]?.name).filter(Boolean);
  }

  function isEnabledAdmin(member) {
    return member.enabled && member.roleIds.includes("admin");
  }

  function renderMembers() {
    if (!elements.memberRows) return;
    const keyword = (elements.memberSearch?.value || "").trim().toLowerCase();
    const departmentKeyword = (elements.deptSearch?.value || "").trim().toLowerCase();
    const status = elements.statusFilter?.value || "all";
    const filtered = members.map((member, index) => ({ member, index })).filter(({ member }) => {
      const haystack = `${member.name} ${member.phone} ${memberRoleNames(member).join(" ") || "未分配"}`.toLowerCase();
      const departmentMatched = !departmentKeyword || member.departments.some(department => department.toLowerCase().includes(departmentKeyword));
      const stateMatched = status === "all" || (status === "enabled" && member.enabled) || (status === "disabled" && !member.enabled);
      return (!keyword || haystack.includes(keyword)) && departmentMatched && stateMatched;
    });
    elements.memberRows.innerHTML = filtered.map(({ member, index }) => `<tr class="member-row ${member.enabled ? "" : "is-disabled"}">
      <td><strong class="member-user-name">${escapeHtml(member.name)}</strong></td>
      <td><span class="member-account">${escapeHtml(member.phone)}</span></td>
      <td><div class="member-departments">${member.departments.map(dept => `<span>${escapeHtml(dept)}</span>`).join("")}</div></td>
      <td><div class="member-role-cell"><div class="member-role-tags">${memberRoleNames(member).map(name => `<span>${escapeHtml(name)}</span>`).join("") || `<span class="is-empty">未分配</span>`}</div><button class="member-role-config" type="button" data-configure-member-roles="${index}" aria-label="配置${escapeHtml(member.name)}的角色">配置</button></div></td>
      <td><label class="member-enable-switch"><input type="checkbox" data-member-enabled="${index}" ${member.enabled ? "checked" : ""} aria-label="${member.enabled ? "禁用" : "启用"}${escapeHtml(member.name)}账号"><span></span><b>${member.enabled ? "已启用" : "已禁用"}</b></label></td>
      <td><button class="member-action-btn" type="button" data-reset-password="${index}">重置密码</button></td>
    </tr>`).join("");
    if (elements.memberEmpty) elements.memberEmpty.hidden = filtered.length > 0;
  }

  function openFormDialog({ title, badge = "角色管理", body, submitText = "保存", submitClass = "primary-btn", onOpen, onSubmit }) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop permission-role-modal";
    backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="modal-head"><div><span class="badge">${escapeHtml(badge)}</span><h3>${escapeHtml(title)}</h3></div><button class="close-btn" type="button" data-dialog-close aria-label="关闭">×</button></div>
      <div class="modal-body">${body}<p class="permission-form-error" data-dialog-error hidden></p></div>
      <div class="modal-foot"><button class="ghost-btn" type="button" data-dialog-close>取消</button><button class="${submitClass}" type="button" data-dialog-submit>${escapeHtml(submitText)}</button></div>
    </div>`;
    document.body.append(backdrop);
    const error = backdrop.querySelector("[data-dialog-error]");
    const close = () => {
      backdrop.classList.remove("show");
      document.removeEventListener("keydown", onKeydown);
      setTimeout(() => backdrop.remove(), 180);
    };
    const onKeydown = event => { if (event.key === "Escape") close(); };
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop || event.target.closest("[data-dialog-close]")) return close();
      if (!event.target.closest("[data-dialog-submit]")) return;
      const message = onSubmit(backdrop);
      if (message) {
        error.textContent = message;
        error.hidden = false;
        return;
      }
      close();
    });
    backdrop.addEventListener("input", () => { error.hidden = true; });
    if (onOpen) onOpen(backdrop);
    document.addEventListener("keydown", onKeydown);
    requestAnimationFrame(() => backdrop.classList.add("show"));
    setTimeout(() => backdrop.querySelector("input,select")?.focus(), 0);
  }

  function openMemberRoleDialog(memberIndex) {
    const member = members[memberIndex];
    if (!member) return;
    const roleGroupsMarkup = Object.entries(roleGroups).map(([groupId, group]) => {
      const groupRoles = Object.entries(roles).filter(([, role]) => role.groupId === groupId);
      if (!groupRoles.length) return "";
      const roleItems = groupRoles.map(([roleId, role]) => `<label class="member-role-option" data-role-search-item>
        <input type="checkbox" value="${roleId}" ${member.roleIds.includes(roleId) ? "checked" : ""}>
        <span><strong>${escapeHtml(role.name)}</strong></span>
      </label>`).join("");
      return `<section class="member-role-group" data-role-search-group><div class="member-role-group-head"><strong><i aria-hidden="true"></i>${escapeHtml(group.name)}</strong><span>${groupRoles.length} 个角色</span></div><div class="member-role-group-items">${roleItems}</div></section>`;
    }).join("");
    openFormDialog({
      title: `配置${member.name}的角色`,
      badge: "用户管理",
      body: `<div class="member-role-picker"><label class="member-role-search"><span>⌕</span><input type="search" data-role-search placeholder="搜索角色名" aria-label="搜索角色名"></label><div class="member-role-options">${roleGroupsMarkup}</div><div class="member-role-search-empty" data-role-search-empty hidden>没有匹配的角色</div></div>`,
      onOpen(dialog) {
        const search = dialog.querySelector("[data-role-search]");
        const items = [...dialog.querySelectorAll("[data-role-search-item]")];
        const groups = [...dialog.querySelectorAll("[data-role-search-group]")];
        const empty = dialog.querySelector("[data-role-search-empty]");
        search.addEventListener("input", () => {
          const keyword = search.value.trim().toLowerCase();
          items.forEach(item => {
            const matched = !keyword || item.querySelector("strong").textContent.toLowerCase().includes(keyword);
            item.hidden = !matched;
          });
          const visibleCount = groups.reduce((count, group) => {
            const matched = group.querySelectorAll("[data-role-search-item]:not([hidden])").length > 0;
            group.hidden = !matched;
            return count + (matched ? 1 : 0);
          }, 0);
          empty.hidden = visibleCount > 0;
        });
      },
      onSubmit(dialog) {
        const nextRoleIds = [...dialog.querySelectorAll("[data-role-search-item] input:checked")].map(input => input.value);
        const removesLastAdmin = member.roleIds.includes("admin") && !nextRoleIds.includes("admin") && isEnabledAdmin(member) && members.filter(isEnabledAdmin).length <= 1;
        if (removesLastAdmin) return "系统至少需要保留一名已启用管理员";
        member.roleIds = nextRoleIds;
        renderMembers();
        notify(nextRoleIds.length ? `已更新${member.name}的角色` : `${member.name}已设为未分配角色`);
        return "";
      }
    });
  }

  function configuredGroupOptions(selectedId = "", excludeId = "") {
    return Object.entries(roleGroups).filter(([id, group]) => group.type === "configured" && id !== excludeId).map(([id, group]) => `<option value="${id}" ${id === selectedId ? "selected" : ""}>${escapeHtml(group.name)}</option>`).join("");
  }

  function openGroupDialog(groupId = "") {
    const editing = Boolean(groupId);
    const group = roleGroups[groupId];
    openFormDialog({
      title: editing ? "重命名角色组" : "新建角色组",
      submitText: editing ? "保存" : "创建角色组",
      body: `<div class="field"><label>角色组名称<span class="required-mark">*</span></label><input data-group-name maxlength="30" value="${editing ? escapeHtml(group.name) : ""}" placeholder="例如：电商运营"><small class="permission-field-help">同一公司内不可与已有角色组重名</small></div>`,
      onSubmit(dialog) {
        const name = dialog.querySelector("[data-group-name]").value.trim();
        if (!name) return "请输入角色组名称";
        if (Object.entries(roleGroups).some(([id, item]) => id !== groupId && item.name.toLowerCase() === name.toLowerCase())) return "角色组名称已存在";
        if (editing) {
          group.name = name;
          notify(`角色组已重命名为“${name}”`);
        } else {
          roleGroups[`group-${Date.now()}`] = { name, type: "configured", collapsed: false };
          notify(`角色组“${name}”已创建`);
        }
        selectRole(activeRole);
        return "";
      }
    });
  }

  function deleteGroup(groupId) {
    const group = roleGroups[groupId];
    if (!group || group.type === "builtin") return notify("系统角色组不可删除");
    if (Object.values(roles).some(role => role.groupId === groupId)) return notify("该角色组下仍有角色，请先移动或删除组内角色");
    openFormDialog({
      title: "删除角色组",
      submitText: "确认删除",
      submitClass: "primary-btn danger-solid",
      body: `<div class="permission-confirm-copy"><strong>确定删除“${escapeHtml(group.name)}”吗？</strong><span>删除后无法恢复。</span></div>`,
      onSubmit() { delete roleGroups[groupId]; renderRoleList(); notify("角色组已删除"); return ""; }
    });
  }

  function openRoleDialog() {
    const options = configuredGroupOptions();
    if (!options) return notify("请先创建一个可用角色组");
    openFormDialog({
      title: "新建角色",
      submitText: "创建角色",
      body: `<div class="field"><label>角色名称<span class="required-mark">*</span></label><input data-role-name maxlength="30" placeholder="例如：直播运营"></div><div class="field"><label>所属角色组<span class="required-mark">*</span></label><select data-role-group>${options}</select><small class="permission-field-help">创建后可通过“移动分组”调整</small></div>`,
      onSubmit(dialog) {
        const name = dialog.querySelector("[data-role-name]").value.trim();
        if (!name) return "请输入角色名称";
        if (Object.values(roles).some(item => item.name.toLowerCase() === name.toLowerCase())) return "角色名称已存在";
        const groupId = dialog.querySelector("[data-role-group]").value;
        if (!roleGroups[groupId] || roleGroups[groupId].type !== "configured") return "请选择有效角色组";
        const id = `role-${Date.now()}`;
        roles[id] = { name, type: "configured", groupId, permissions: new Set(), scopes: emptyScopes() };
        selectRole(id);
        renderMembers();
        notify(`角色“${name}”已创建`);
        return "";
      }
    });
  }

  function moveRole(roleId) {
    const role = roles[roleId];
    const options = configuredGroupOptions("", role.groupId);
    if (!options) return notify("没有其他可移动的角色组");
    openFormDialog({
      title: "移动角色分组",
      submitText: "确认移动",
      body: `<div class="field"><label>目标角色组<span class="required-mark">*</span></label><select data-target-group>${options}</select><small class="permission-field-help">角色权限和已分配用户不会改变</small></div>`,
      onSubmit(dialog) {
        const targetId = dialog.querySelector("[data-target-group]").value;
        if (!roleGroups[targetId] || roleGroups[targetId].type !== "configured") return "请选择有效角色组";
        role.groupId = targetId;
        selectRole(roleId);
        notify(`角色“${role.name}”已移动至“${roleGroups[targetId].name}”`);
        return "";
      }
    });
  }

  function deleteRole(roleId) {
    const role = roles[roleId];
    if (!role || role.type === "builtin") return notify("内置管理员角色不可删除");
    const assigned = members.filter(member => member.roleIds.includes(roleId)).length;
    if (assigned) return notify(`该角色仍分配给 ${assigned} 个用户，请先调整用户角色`);
    openFormDialog({
      title: "删除角色",
      submitText: "确认删除",
      submitClass: "primary-btn danger-solid",
      body: `<div class="permission-confirm-copy"><strong>确定删除角色“${escapeHtml(role.name)}”吗？</strong><span>角色权限配置将一并删除，且无法恢复。</span></div>`,
      onSubmit() { delete roles[roleId]; selectRole("admin"); renderMembers(); notify("角色已删除"); return ""; }
    });
  }

  function generateTemporaryPassword() {
    const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "@#$%"];
    const alphabet = sets.join("");
    const randomCharacter = characters => {
      const value = new Uint32Array(1);
      crypto.getRandomValues(value);
      return characters[value[0] % characters.length];
    };
    const characters = [...sets.map(randomCharacter), ...Array.from({ length: 8 }, () => randomCharacter(alphabet))];
    for (let index = characters.length - 1; index > 0; index -= 1) {
      const value = new Uint32Array(1);
      crypto.getRandomValues(value);
      const target = value[0] % (index + 1);
      [characters[index], characters[target]] = [characters[target], characters[index]];
    }
    return characters.join("");
  }

  function openPasswordReset(memberIndex) {
    const member = members[memberIndex];
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop permission-role-modal";
    backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="重置密码"><div class="modal-head"><div><span class="badge">用户管理</span><h3>重置密码</h3></div><button class="close-btn" type="button" data-password-close aria-label="关闭">×</button></div><div class="modal-body" data-password-body><div class="permission-confirm-copy"><strong>为${escapeHtml(member.name)}重置登录密码？</strong><span>原密码将立即失效，系统会生成一次性展示的临时密码。</span></div></div><div class="modal-foot" data-password-foot><button class="ghost-btn" type="button" data-password-close>取消</button><button class="primary-btn" type="button" data-password-confirm>确认重置</button></div></div>`;
    document.body.append(backdrop);
    const close = () => { backdrop.classList.remove("show"); setTimeout(() => backdrop.remove(), 180); };
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop || event.target.closest("[data-password-close]")) return close();
      if (event.target.closest("[data-password-confirm]")) {
        const password = generateTemporaryPassword();
        backdrop.querySelector("[data-password-body]").innerHTML = `<div class="temporary-password"><span>临时密码（仅本次可见）</span><div><input type="password" readonly value="${password}" data-temporary-password><button type="button" data-toggle-password aria-label="显示密码">◉</button><button type="button" data-copy-password>复制</button></div><small>关闭弹窗后无法再次查看，请立即安全地交付给用户。</small></div>`;
        backdrop.querySelector("[data-password-foot]").innerHTML = `<button class="primary-btn" type="button" data-password-close>完成</button>`;
        notify("密码已重置，原密码已失效");
        return;
      }
      if (event.target.closest("[data-toggle-password]")) {
        const input = backdrop.querySelector("[data-temporary-password]");
        input.type = input.type === "password" ? "text" : "password";
        event.target.closest("[data-toggle-password]").setAttribute("aria-label", input.type === "password" ? "显示密码" : "隐藏密码");
        return;
      }
      if (event.target.closest("[data-copy-password]")) {
        const password = backdrop.querySelector("[data-temporary-password]").value;
        navigator.clipboard?.writeText(password).then(() => notify("临时密码已复制")).catch(() => notify("复制失败，请手动复制"));
      }
    });
    requestAnimationFrame(() => backdrop.classList.add("show"));
  }

  function bindEvents() {
    elements.roleList?.addEventListener("click", event => {
      const groupToggle = event.target.closest("[data-toggle-role-group]");
      if (groupToggle) {
        const group = roleGroups[groupToggle.dataset.toggleRoleGroup];
        group.collapsed = !group.collapsed;
        return renderRoleList();
      }
      const groupMenu = event.target.closest("[data-group-menu]");
      if (groupMenu) {
        const panel = elements.roleList.querySelector(`[data-group-menu-panel="${groupMenu.dataset.groupMenu}"]`);
        const open = !panel.classList.contains("open");
        elements.roleList.querySelectorAll(".permission-context-menu").forEach(menu => menu.classList.remove("open"));
        panel.classList.toggle("open", open);
        return;
      }
      const roleMenu = event.target.closest("[data-role-menu]");
      if (roleMenu) {
        const panel = elements.roleList.querySelector(`[data-role-menu-panel="${roleMenu.dataset.roleMenu}"]`);
        const open = !panel.classList.contains("open");
        elements.roleList.querySelectorAll(".permission-context-menu").forEach(menu => menu.classList.remove("open"));
        panel.classList.toggle("open", open);
        return;
      }
      const groupCommand = event.target.closest("[data-group-command]");
      if (groupCommand) return groupCommand.dataset.groupCommand === "edit" ? openGroupDialog(groupCommand.dataset.groupId) : deleteGroup(groupCommand.dataset.groupId);
      const roleCommand = event.target.closest("[data-role-command]");
      if (roleCommand) {
        const roleId = roleCommand.dataset.roleId;
        if (roleCommand.dataset.roleCommand === "edit") return beginRoleEdit(roleId);
        if (roleCommand.dataset.roleCommand === "move") return moveRole(roleId);
        return deleteRole(roleId);
      }
      const roleButton = event.target.closest("[data-permission-role]");
      if (roleButton) selectRole(roleButton.dataset.permissionRole);
    });
    document.getElementById("newPermissionRoleGroup")?.addEventListener("click", () => isEditingRole ? notify("请先保存或取消当前编辑") : openGroupDialog());
    document.getElementById("newPermissionRole")?.addEventListener("click", () => isEditingRole ? notify("请先保存或取消当前编辑") : openRoleDialog());
    elements.roleActions?.addEventListener("click", event => {
      const command = event.target.closest("[data-role-command]")?.dataset.roleCommand;
      if (!command || roles[activeRole]?.type !== "configured") return;
      if (command === "edit") return beginRoleEdit(activeRole);
      if (command === "save") return saveRoleEdit();
      if (command === "cancel") return cancelRoleEdit();
      if (command === "move") return moveRole(activeRole);
      deleteRole(activeRole);
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".permission-role-group-head,.permission-role-wrap")) elements.roleList?.querySelectorAll(".permission-context-menu").forEach(menu => menu.classList.remove("open"));
    });
    elements.tree?.addEventListener("click", event => {
      const toggle = event.target.closest("[data-toggle-permission-node]");
      if (!toggle) return;
      const id = toggle.dataset.togglePermissionNode;
      expanded.has(id) ? expanded.delete(id) : expanded.add(id);
      renderPermissionTree();
    });
    elements.tree?.addEventListener("change", event => {
      const checkbox = event.target.closest("[data-permission-id]");
      if (checkbox) togglePermission(checkbox.dataset.permissionId, checkbox.checked);
    });
    document.querySelectorAll("[data-permission-tab]").forEach(tab => tab.addEventListener("click", () => setPanel(tab.dataset.permissionTab)));
    document.getElementById("expandPermissionTree")?.addEventListener("click", () => { allPermissionIds.filter(id => nodeMap.get(id)?.children?.length).forEach(id => expanded.add(id)); renderPermissionTree(); });
    document.getElementById("collapsePermissionTree")?.addEventListener("click", () => { expanded.clear(); renderPermissionTree(); });
    elements.dataRows?.addEventListener("change", event => {
      const select = event.target.closest("[data-scope-object]");
      if (!select || !isEditingRole || activeRole === "admin") return;
      const objectId = select.dataset.scopeObject;
      const key = select.dataset.scopeKey;
      if (key === "view" && fixedAllViewObjects.has(objectId)) return renderDataPermissions();
      const scopes = roles[activeRole].scopes[objectId];
      scopes[key] = select.value;
      if (key === "view") {
        if (scopeLevel[scopes.maintain] > scopeLevel[scopes.view]) scopes.maintain = scopes.view;
        if (scopeLevel[scopes.delete] > scopeLevel[scopes.view]) scopes.delete = scopes.view;
      } else if (scopeLevel[scopes[key]] > scopeLevel[scopes.view]) {
        scopes[key] = scopes.view;
        notify("维护和删除范围不能超过查看范围");
      }
      renderDataPermissions();
    });
    elements.memberRows?.addEventListener("change", event => {
      const enabledInput = event.target.closest("[data-member-enabled]");
      if (!enabledInput) return;
      const member = members[Number(enabledInput.dataset.memberEnabled)];
      if (member.enabled && !enabledInput.checked && member.roleIds.includes("admin") && members.filter(isEnabledAdmin).length <= 1) {
        enabledInput.checked = true;
        return notify("系统至少需要保留一名已启用管理员");
      }
      member.enabled = enabledInput.checked;
      renderMembers();
      notify(`${member.name}的账号已${member.enabled ? "启用" : "禁用"}`);
    });
    elements.memberRows?.addEventListener("click", event => {
      const roleConfig = event.target.closest("[data-configure-member-roles]");
      if (roleConfig) return openMemberRoleDialog(Number(roleConfig.dataset.configureMemberRoles));
      const reset = event.target.closest("[data-reset-password]");
      if (reset) openPasswordReset(Number(reset.dataset.resetPassword));
    });
    [elements.memberSearch, elements.deptSearch].forEach(control => control?.addEventListener("input", renderMembers));
    elements.statusFilter?.addEventListener("change", renderMembers);
    document.getElementById("syncDingMembers")?.addEventListener("click", event => {
      const button = event.currentTarget;
      const label = button.querySelector("[data-sync-label]");
      button.disabled = true;
      button.classList.add("syncing");
      label.textContent = "同步中…";
      setTimeout(() => {
        button.disabled = false;
        button.classList.remove("syncing");
        label.textContent = "同步钉钉用户";
        const now = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
        renderMembers();
        notify(`同步完成（${now}）：新增 0 人，更新 1 人，无变化 4 人`);
      }, 900);
    });
  }

  function initPermissionManagement() {
    normalizeScopes("content");
    normalizeScopes("video");
    bindEvents();
    selectRole(activeRole);
    renderMembers();
    setPanel(activePanel);
  }

  // Preview affects only promotion menus/tabs; role assignments are not changed.
  let previewRole = "";
  window.ContentCompassPermissions = {
    ids() {
      const ids = previewRole ? [previewRole] : (members[0].enabled ? members[0].roleIds : []);
      return new Set(ids.flatMap(id => [...(roles[id]?.permissions || [])]));
    },
    preview(roleId = "") {
      if (roleId && !roles[roleId]) return;
      previewRole = roleId;
      window.dispatchEvent(new CustomEvent("promotion-permissions-change", { detail: { name: roles[roleId]?.name || "" } }));
    }
  };
  document.addEventListener("click", event => {
    if (!event.target.closest("[data-preview-promotion-role]")) return;
    if (isEditingRole) return notify("请先保存角色");
    window.ContentCompassPermissions.preview(activeRole);
    notify("已切换商品卡推广权限预览，退出预览不影响角色配置");
  });
  window.initPermissionManagement = initPermissionManagement;
})();

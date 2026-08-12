(() => {
  const CURRENT_YEAR = 2026;
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]);

  // 外侧不显示秒；详情与变更记录显示秒。
  function formatAssetTime(value, detailed = false) {
    const text = String(value || "").replace(/-/g, "/").trim();
    const match = text.match(/(?:(\d{4})\/)?(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return text;
    const [, year, month, day, hour, minute, second = "00"] = match;
    const prefix = year && Number(year) !== CURRENT_YEAR ? `${year}/` : "";
    return `${prefix}${month}/${day} ${hour}:${minute}${detailed ? `:${second}` : ""}`;
  }

  const samples = {
    品牌: [{ field:"品牌调性", before:"专业、直接", after:"专业、直接、可信", user:"嗡大发", time:"2026/08/11 10:26:36" }],
    产品: [
      { field:"核心卖点", before:"12kPa 大吸力", after:"12kPa 大吸力深入床褥纤维", user:"嗡大发", time:"2026/08/11 10:26:36" },
      { field:"商品参数", before:"额定功率：350W", after:"额定功率：400W", user:"李四", time:"2026/08/10 16:08:12" },
      { field:"商品链接", before:"未填写", after:"抖店 · https://example.com/product/mit-pro", user:"嗡大发", time:"2026/08/09 11:24:05" },
      { field:"价格", before:"¥429 CNY", after:"¥399 CNY", user:"嗡大发", time:"2026/08/08 18:30:46" },
      { field:"产品信任背书", before:"整机质保 6 个月", after:"整机质保 1 年", user:"李四", time:"2026/08/07 09:12:18" },
      { field:"禁用话术", before:"全网最低价", after:"全网最低价；未经资质支持的除菌率", user:"嗡大发", time:"2026/08/06 14:05:30" },
      { field:"关联资产", before:"创作素材 324", after:"创作素材 326", user:"嗡大发", time:"2026/08/05 10:20:14" }
    ],
    文案: [{ field:"文案正文", before:"看得见的是表面", after:"看得见的是表面，深处才是关键", user:"李四", time:"2026/08/04 14:23:05" }],
    脚本: [{ field:"镜头 03 画面内容", before:"产品推进", after:"产品推进并补充尘杯特写", user:"嗡大发", time:"2026/08/11 14:32:18" }]
  };

  function showHistory(type = "资产", title = "") {
    const records = samples[type] || [{ field:"资产信息", before:"—", after:"已更新", user:"嗡大发", time:"2026/08/11 14:20:36" }];
    const node = document.createElement("div");
    node.className = "asset-history-layer";
    node.innerHTML = `<section class="asset-history-dialog" role="dialog" aria-modal="true"><header><div><small>修改记录</small><h3>${escapeHtml(title || type)}</h3><p>创建：嗡大发 · 08/01 10:00:00　｜　最近修改：${escapeHtml(records[0].user)} · ${formatAssetTime(records[0].time, true)}</p></div><button type="button" data-close>×</button></header><div class="asset-history-list">${records.map(item => `<article><div><b>${escapeHtml(item.field)}</b><span>${escapeHtml(item.user)} · ${formatAssetTime(item.time, true)}</span></div><p><em>${escapeHtml(item.before)}</em><i>→</i><strong>${escapeHtml(item.after)}</strong></p></article>`).join("")}</div><footer><button type="button" data-close>关闭</button></footer></section>`;
    const close = () => node.remove();
    node.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
    node.addEventListener("click", event => { if (event.target === node) close(); });
    document.body.append(node);
  }

  function enhanceTable(table, type) {
    if (!table) return;
    const head = table.querySelector("thead tr"), body = table.querySelector("tbody");
    if (!head || !body) return;
    const headers = [...head.children];
    const updatedIndex = headers.findIndex(cell => /更新时间|最近更新/.test(cell.textContent));
    const actionIndex = headers.findIndex(cell => /操作/.test(cell.textContent));
    if (updatedIndex < 0 || actionIndex < 0) return;
    if (!head.querySelector("[data-audit-created]")) { const created = document.createElement("th"); created.textContent = "创建"; created.dataset.auditCreated = "true"; head.insertBefore(created, headers[updatedIndex]); }
    [...body.rows].forEach((row, index) => {
      if (row.dataset.auditReady) return;
      const createdCell = document.createElement("td"); createdCell.className = "asset-audit-cell";
      createdCell.innerHTML = `<b>${index % 2 ? "李四" : "嗡大发"}</b><small>${index % 2 ? "08/03 11:07" : "08/04 14:20"}</small>`;
      row.insertBefore(createdCell, row.cells[updatedIndex]);
      const latestCell = row.cells[updatedIndex + 1];
      if (latestCell) { latestCell.classList.add("asset-audit-cell"); latestCell.innerHTML = `<b>${index % 2 ? "李四" : "嗡大发"}</b><small>${formatAssetTime(latestCell.textContent || "08/04 14:23")}</small>`; }
      const actionCell = row.cells[row.cells.length - 1];
      if (actionCell && !actionCell.querySelector("[data-asset-history]")) {
        const button = document.createElement("button"); button.type = "button"; button.className = "asset-history-link"; button.textContent = "查看变更";
        button.dataset.assetHistory = type; button.dataset.assetTitle = row.cells[0]?.innerText.trim() || type;
        actionCell.querySelector("div")?.append(button) || actionCell.append(button);
      }
      row.dataset.auditReady = "true";
    });
  }
  function enhanceTables() { /* 文案、脚本由各自渲染器定义列宽和字段，避免通用插列造成错位。 */ }
  document.addEventListener("click", event => { const trigger = event.target.closest("[data-asset-history]"); if (trigger) showHistory(trigger.dataset.assetHistory, trigger.dataset.assetTitle); });
  const auditObserver = new MutationObserver(enhanceTables);
  const startAuditObserver = () => {
    if (document.body?.nodeType === 1) auditObserver.observe(document.body, { childList:true, subtree:true });
  };
  if (document.body?.nodeType === 1) startAuditObserver();
  else document.addEventListener("DOMContentLoaded", startAuditObserver, { once:true });
  enhanceTables(); window.AssetAudit = { formatAssetTime, showHistory };
})();

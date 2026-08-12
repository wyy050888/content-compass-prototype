/* ============ 数据 ============ */
const materials = [
  { id: 1, name: 'cove...4256.png', type: 'image', sizeLabel: '4.48 MB', duration: '', status: 'fail', folderId: 'all', product: '', created: '2026-08-08 09:14:23' },
  { id: 2, name: '自牵引AI.mp4', type: 'video', sizeLabel: '10.07 MB', duration: '0:08', status: 'ok', folderId: 'f1-1', product: '净界洗地机 S5', resolution:'1080 × 1920', md5:'a1b2c3d4e5f6...', analysisDescription:'在这段 8 秒的视频中，一台黑色洗地机在明亮客厅中快速清理白色瓷砖上的紫色污渍。清洁完成后，女性从沙发起身并躺到地板中央，以夸张动作展示地面干净、光滑的结果。画面完整包含产品操作过程与人物结果反馈，可用于功能演示及清洁效果证明。', created: '2026-08-07 17:35:08' },
  { id: 3, name: '旋转变形3....mp4', type: 'video', sizeLabel: '1.32 MB', duration: '0:05', status: 'analyzing', folderId: 'f1-2', product: '净澈洗地机', created: '2026-08-08 10:22:41' },
  { id: 4, name: '生...景的图片.png', type: 'image', sizeLabel: '4.47 MB', duration: '', status: 'ok', folderId: 'f1', product: '', created: '2026-08-06 16:11:55' },
  { id: 5, name: '黑泥浆走-竹.mp4', type: 'video', sizeLabel: '1006.95 KB', duration: '0:05', status: 'ok', folderId: 'f2', product: '净界洗地机 S5', resolution:'1080 × 1920', md5:'01f932fa62d8...', analysisWarning:'片段后半段存在明显抖动；该问题已标记在分析结果中，使用时建议优先截取前 3.6 秒。', analysisDescription:'固定近景记录洗地机经过大面积深色污渍并将其清理干净的过程。产品推进动作、污渍消失和清洁后地面均清晰可见，可用于表达去污能力和一遍清洁的结果。', created: '2026-08-05 11:08:02' },
  { id: 6, name: '工具转-竹.mp4', type: 'video', sizeLabel: '1016.61 KB', duration: '0:05', status: 'pending', folderId: 'f2', product: '', created: '2026-08-08 08:42:19' },
  { id: 7, name: '大灰尘走-竹.mp4', type: 'video', sizeLabel: '885.96 KB', duration: '0:05', status: 'ok', folderId: 'f2', product: '净界洗地机 S5', resolution:'1080 × 1920', md5:'7dd20f11a8c9...', analysisDescription:'固定近景记录洗地机经过大颗粒灰尘并将其吸走的过程。产品、灰尘和清洁路径清晰可见，动作起止完整，可用于表达大颗粒垃圾吸除能力。', created: '2026-08-05 13:27:34' },
  { id: 8, name: 'm18洗地机.mp4', type: 'video', sizeLabel: '4.31 MB', duration: '0:02', status: 'ok', folderId: 'f3', product: '净澈洗地机', created: '2026-08-08 07:58:47' },
  { id: 9, name: 'jimen...视....mp4', type: 'video', sizeLabel: '3.49 MB', duration: '0:04', status: 'analyzing', folderId: 'f1', product: '', created: '2026-08-08 11:03:12' },
  { id: 10, name: 'jimen...小....mp4', type: 'video', sizeLabel: '4.18 MB', duration: '0:05', status: 'ok', folderId: 'f1', product: '', created: '2026-08-07 09:45:36' },
  { id: 11, name: 'ji...品不变形.mp4', type: 'video', sizeLabel: '3.41 MB', duration: '0:04', status: 'ok', folderId: 'f1', product: '轻净 Pro 除螨仪', created: '2026-08-04 18:30:50' },
  { id: 12, name: 'jimen...时....mp4', type: 'video', sizeLabel: '3.37 MB', duration: '0:04', status: 'fail', folderId: 'f2', product: '', created: '2026-08-06 20:14:07' },
  { id: 13, name: 'ji...白色地面.png', type: 'image', sizeLabel: '2.8 MB', duration: '', status: 'ok', folderId: 'f1-2', product: '', created: '2026-08-05 15:50:25' },
  { id: 14, name: 'E厂家...(8).mp4', type: 'video', sizeLabel: '56.19 MB', duration: '0:31', status: 'ok', folderId: 'f3', product: '轻享空气炸锅', created: '2026-08-03 19:02:11' },
  { id: 15, name: 'E厂家...(2).mp4', type: 'video', sizeLabel: '28.6 MB', duration: '0:16', status: 'pending', folderId: 'f3', product: '', created: '2026-08-08 06:31:48' },
  { id: 16, name: 'D小孩涂鸦.mp4', type: 'video', sizeLabel: '3.17 MB', duration: '0:06', status: 'ok', folderId: 'f1-1', product: '', created: '2026-08-07 14:18:53' },
  { id: 17, name: 'C自牵引(2).MP4', type: 'video', sizeLabel: '3.48 MB', duration: '0:07', status: 'ok', folderId: 'f2', product: '净澈洗地机', created: '2026-08-06 10:07:30' },
  { id: 18, name: 'C自牵引(1).MP4', type: 'video', sizeLabel: '2.4 MB', duration: '0:05', status: 'ok', folderId: 'f1', product: '轻净 Pro 除螨仪', created: '2026-08-04 11:54:17' },
  { id: 19, name: 'C阳台...(2).mp4', type: 'video', sizeLabel: '11.5 MB', duration: '0:05', status: 'analyzing', folderId: 'f2', product: '', created: '2026-08-08 09:50:04' },
  { id: 20, name: 'C阳台酱油....mp4', type: 'video', sizeLabel: '9.38 MB', duration: '0:04', status: 'ok', folderId: 'f3', product: '轻享空气炸锅', created: '2026-08-05 17:39:38' }
  ,{ id: 101, name: '床垫拍吸实拍', type: 'video', sizeLabel: '8.24 MB', duration: '0:05', status: 'ok', folderId: 'f1', product: '轻净 Pro 除螨仪', tags:['产品演示','卧室'], created: '2026-08-08 09:14:23' }
  ,{ id: 102, name: '尘杯结果特写', type: 'image', sizeLabel: '2.80 MB', duration: '', status: 'ok', folderId: 'f1', product: '轻净 Pro 除螨仪', tags:['产品特写','效果证明'], created: '2026-08-07 17:35:08' }
  ,{ id: 103, name: '拆卸尘杯演示', type: 'video', sizeLabel: '6.35 MB', duration: '0:06', status: 'pending', folderId: 'f1', product: '轻净 Pro 除螨仪', tags:['产品演示','使用教程'], created: '2026-08-07 11:28:40' }
  ,{ id: 104, name: '沙发清洁实拍', type: 'video', sizeLabel: '9.12 MB', duration: '0:08', status: 'ok', folderId: 'f2', product: '轻享空气炸锅', tags:['使用场景','沙发'], created: '2026-08-06 16:22:09' }
];

// 标签模型:用户可自由新建/重命名/删除分组,标签本身也按需增删
// 每个 tag 形如 { id, name, group: groupId|null(未分组) }
const tagGroups = [
  { id: 'g-product', name: '产品标签' },
  { id: 'g-scene', name: '场景标签' }
];
const tagLibrary = [
  // 产品组
  { id: 't-1', name: '洗地机', group: 'g-product' },
  { id: 't-2', name: '除螨仪', group: 'g-product' },
  { id: 't-3', name: '空气炸锅', group: 'g-product' },
  { id: 't-4', name: '智能家电', group: 'g-product' },
  { id: 't-5', name: '清洁工具', group: 'g-product' },
  // 场景组
  { id: 't-6', name: '客厅', group: 'g-scene' },
  { id: 't-7', name: '阳台', group: 'g-scene' },
  { id: 't-8', name: '厨房', group: 'g-scene' },
  { id: 't-9', name: '卧室', group: 'g-scene' },
  { id: 't-10', name: '卫生间', group: 'g-scene' },
  { id: 't-11', name: '餐厅', group: 'g-scene' },
  // 未分组
  { id: 't-12', name: '高转化', group: null },
  { id: 't-13', name: '30s 以内', group: null },
  { id: 't-14', name: 'A/B 测试中', group: null },
  { id: 't-15', name: '618 主推', group: null }
];
let activeTagGroupId = 'all';  // 'all' | 'uncategorized' | groupId

let activeType = 'all';
let activeTagFilter = new Set();
let selectedIds = new Set();
let contextTargetId = null;
let searchQuery = '';
let materialTagEditorId = null;
let materialTagDraft = new Set();

// 产品选项（与成片视频的 productOptions 同源）
const productOptions = ['轻净 Pro 除螨仪', '轻享空气炸锅 A8', '净界洗地机 S5'];

const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
const formatAuditTime = (value, detailed = false) => {
  const match = String(value || '').match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return value || '--';
  const [, year, month, day, hour, minute, second = '00'] = match;
  return `${year === '2026' ? '' : `${year}/`}${month}/${day} ${hour}:${minute}${detailed ? `:${second}` : ''}`;
};
const materialAudit = material => ({ uploader: material.uploader || '嗡大发', updatedBy: material.updatedBy || '嗡大发', updatedAt: material.updatedAt || material.created });
function toast(text, type) {
  const el = $('#toast');
  el.textContent = text;
  el.style.background = type === 'error' ? '#e55353' : type === 'success' ? '#16a778' : '#242735';
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1800);
}
let pdaOverlayMode = false;
let pdaOverlayAssetId = null;
let pdaOverlayRequestId = null;
function notifyPdaOverlayIfIdle() {
  if (!pdaOverlayMode) return;
  const active = $$('.modal-backdrop.show').length || $('#drawer').classList.contains('show') || $('#matPopover').classList.contains('open');
  if (active) return;
  pdaOverlayMode = false;
  document.documentElement.classList.remove('pda-overlay-mode');
  document.body.classList.remove('pda-overlay-mode');
  const asset = materials.find(item => String(item.id) === String(pdaOverlayAssetId));
  window.parent.postMessage({ type:'pda-library-overlay-close', requestId:pdaOverlayRequestId, kind:'material', assetId:pdaOverlayAssetId, deleted:!asset, asset:asset ? { id:asset.id, name:asset.name, product:asset.product, type:asset.type, duration:asset.duration, status:asset.status, created:asset.created, tags:[...(asset.tags||[])] } : null }, '*');
  pdaOverlayAssetId = null;
  pdaOverlayRequestId = null;
}
function openModal(id) { $('#' + id).classList.add('show'); }
function closeModal(id) { $('#' + id).classList.remove('show'); setTimeout(notifyPdaOverlayIfIdle, 0); }
function closeAllModals() { $$('.modal-backdrop').forEach(m => m.classList.remove('show')); }
let activeMaterialId = null;
function setDrawerTab(which = 'info') {
  const drawer = $('#drawer');
  if (!drawer) return;
  drawer.querySelectorAll('#drawerTabs .tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === which);
  });
  drawer.querySelectorAll('.drawer-body > .tab-pane').forEach(pane => {
    pane.style.display = pane.dataset.pane === which ? '' : 'none';
  });
}
function openDrawer(m) {
  if (!m) return;
  activeMaterialId = m.id;
  const drawer = $('#drawer');
  $('#drawerTitle').textContent = m.name;
  // 图片保留「图片分析」Tab，但不展示视频的片段拆分结构。
  const isImage = m.type === 'image' || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(m.name || '');
  drawer.classList.toggle('is-image', isImage);
  const label = $('#shotTabLabel');
  const count = $('#shotTabCount');
  const shotTab = drawer.querySelector('[data-tab="shot"]');
  if (label) label.textContent = isImage ? '图片分析' : '镜头拆分';
  if (count) count.style.display = isImage ? 'none' : '';
  if (shotTab) shotTab.style.display = '';
  setDrawerTab('info');
  const previewFrame = drawer.querySelector('.video-preview .vp-bg');
  if (previewFrame) {
    previewFrame.innerHTML = isImage
      ? `<div class="image-drawer-preview">${m.url ? `<img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.name)}">` : `<span>图片预览<br><small>${escapeHtml(m.name)}</small></span>`}</div>`
      : '<div class="big-play" data-tip="播放/暂停"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>';
  }
  // 关联产品行:按当前素材的产品动态填充
  const productValue = $('#drawerProductValue');
  const productBtnText = $('#drawerProductBtnText');
  if (productValue && productBtnText) {
    if (m.product) {
      productValue.classList.remove('empty');
      productValue.textContent = m.product;
      productBtnText.textContent = '更换产品';
    } else {
      productValue.classList.add('empty');
      productValue.textContent = '未关联产品';
      productBtnText.textContent = '关联产品';
    }
  }
  const materialTags = (m.tags || []).map(value => tagLibrary.find(tag => tag.id === value || tag.name === value)?.name || value).filter(Boolean);
  const tagsValue = $('#drawerTagsValue');
  if (tagsValue) {
    tagsValue.classList.toggle('empty', materialTags.length === 0);
    tagsValue.innerHTML = materialTags.length ? materialTags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join(' ') : '暂无标签';
  }
  const folderValue = $('#drawerFolderValue');
  if (folderValue) {
    const folder = previewFolderLabel(m.folderId);
    folderValue.textContent = folder;
    folderValue.classList.toggle('empty', folder === '未归入素材组');
  }
  const warning = $('#analysisAlert');
  if (warning) {
    warning.hidden = !m.analysisWarning;
    $('#analysisAlertText').textContent = m.analysisWarning || '';
  }
  const aiDescription = $('#drawerAiDescription');
  if (aiDescription) aiDescription.textContent = m.analysisDescription || `${m.name} 已完成离线画面理解。画面主体为${m.product || '当前内容对象'}，包含可识别的场景、人物或产品动作，可在镜头拆分中查看客观层、语义层和功能层分析。`;
  const extension = (m.name.split('.').pop() || (isImage ? 'png' : 'mp4')).toUpperCase();
  const mimeExtension = extension.toLowerCase() === 'jpg' ? 'jpeg' : extension.toLowerCase();
  const drawerFields = {
    drawerFileName:m.name,
    drawerFileFormat:extension,
    drawerFileSize:m.sizeLabel || '—',
    drawerFileDuration:isImage ? '—' : (m.duration || '—'),
    drawerFileResolution:m.resolution || (isImage ? '2048 × 2048' : '1080 × 1920'),
    drawerFileMime:`${isImage ? 'image' : 'video'}/${mimeExtension}`,
    drawerFileCreated:formatAuditTime(m.created, true),
    drawerFileOwner:materialAudit(m).uploader,
    drawerFileUpdatedBy:materialAudit(m).updatedBy,
    drawerFileUpdated:formatAuditTime(materialAudit(m).updatedAt, true),
    drawerFileMd5:m.md5 || `asset-${String(m.id).padStart(6,'0')}...`
  };
  Object.entries(drawerFields).forEach(([id, value]) => { const element = $('#' + id); if (element) element.textContent = value; });
  drawer.classList.add('show');
  $('#drawerMask').classList.add('show');
  const drawerBody = drawer.querySelector('.drawer-body');
  if (drawerBody) drawerBody.scrollTop = 0;
}
function closeDrawer() { $('#drawer').classList.remove('show'); $('#drawerMask').classList.remove('show'); setTimeout(notifyPdaOverlayIfIdle, 0); }

let previewMaterialId = null;
let previewChildReturn = null;
function returnToMaterialPreview(childModal) {
  if (previewChildReturn !== childModal) return;
  const child = $('#' + childModal + 'Modal');
  if (child) child.classList.remove('preview-child-layer');
  previewChildReturn = null;
  const material = materials.find(item => item.id === previewMaterialId);
  if (material) openMaterialPreview(material);
}
function previewFolderLabel(folderId) {
  if (!folderId || folderId === 'all') return '未归入素材组';
  const node = findFolder(folderTree, folderId);
  return node ? node.node.name : '未归入素材组';
}
function openMaterialPreview(m) {
  if (!m) return;
  previewMaterialId = m.id;
  const isImage = m.type === 'image' || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(m.name || '');
  const statusText = { ok: '已分析', analyzing: '分析中', pending: '待分析', fail: '分析失败' }[m.status] || m.status;
  $('#materialPreviewType').textContent = isImage ? '图片素材' : '视频素材';
  $('#materialPreviewTitle').textContent = m.name;
  $('#materialPreviewName').textContent = m.name;
  const previewStatus = $('#materialPreviewStatus');
  previewStatus.textContent = statusText;
  previewStatus.className = `preview-status ${m.status || 'pending'}`;
  const previewProduct = $('#materialPreviewProduct');
  previewProduct.textContent = m.product || '未关联产品';
  previewProduct.classList.toggle('is-empty', !m.product);
  $('#materialPreviewFolder').textContent = previewFolderLabel(m.folderId);
  $('#materialPreviewKind').textContent = isImage ? '图片' : '视频';
  $('#materialPreviewDurationSize').textContent = `${isImage ? '—' : (m.duration || '—')} / ${m.sizeLabel || '—'}`;
  const audit = materialAudit(m);
  $('#materialPreviewCreated').textContent = `${audit.uploader} · ${formatAuditTime(m.created, true)}`;
  $('#materialPreviewUpdated').textContent = `${audit.updatedBy} · ${formatAuditTime(audit.updatedAt, true)}`;
  const tags = (m.tags || []).map(value => tagLibrary.find(t => t.id === value || t.name === value)).filter(Boolean);
  $('#materialPreviewTags').innerHTML = tags.length ? tags.map(t => `<span class="preview-tag">${escapeHtml(t.name)}</span>`).join('') : '<span class="preview-no-tag">暂无标签</span>';
  const stage = $('#materialPreviewStage');
  stage.classList.toggle('is-image', isImage);
  if (m.url && isImage) {
    stage.innerHTML = `<img src="${escapeHtml(m.url)}" alt="${escapeHtml(m.name)}">`;
  } else if (m.url && !isImage) {
    stage.innerHTML = `<video src="${escapeHtml(m.url)}" controls preload="metadata"></video>`;
  } else {
    stage.innerHTML = `<div class="material-preview-placeholder${isImage ? ' image' : ''}">${isImage ? '图片素材预览' : '<span style="font-size:34px">▶</span><span>视频素材预览</span>'}</div>`;
  }
  const analyzeBtn = $('#materialPreviewAnalyze');
  const done = m.status === 'ok';
  analyzeBtn.disabled = m.status === 'analyzing';
  analyzeBtn.textContent = done ? '查看分析结果' : m.status === 'analyzing' ? '分析中…' : '开始分析';
  openModal('materialPreviewModal');
}
$('#materialPreviewDownload').addEventListener('click', () => {
  const m = materials.find(x => x.id === previewMaterialId);
  if (m) toast(`已开始下载：${m.name}`, 'success');
});
$('#materialPreviewAnalyze').addEventListener('click', () => {
  const m = materials.find(x => x.id === previewMaterialId);
  if (!m || m.status === 'analyzing') return;
  if (m.status === 'ok') { closeModal('materialPreviewModal'); openDrawer(m); return; }
  simulateAnalysis(m);
  closeModal('materialPreviewModal');
  toast(`已开始分析：${m.name}`, 'success');
});
$('#materialPreviewAddTag').addEventListener('click', () => {
  const m = materials.find(x => x.id === previewMaterialId); if (!m) return;
  previewChildReturn = 'tagFilter';
  $('#tagFilterModal').classList.add('preview-child-layer');
  openMaterialTagEditor(m);
});
$('#materialPreviewEdit').addEventListener('click', () => {
  const m = materials.find(x => x.id === previewMaterialId);
  if (!m) return;
  $('#materialInfoEditName').value = m.name;
  $('#materialInfoEditProduct').innerHTML = `<option value="">未关联产品</option>${productOptions.map(name => `<option value="${escapeHtml(name)}"${name === m.product ? ' selected' : ''}>${escapeHtml(name)}</option>`).join('')}`;
  $('#materialInfoEditFolder').innerHTML = renderFolderSelectOptions(m.folderId || 'all');
  $('#materialInfoEditError').textContent = '';
  previewChildReturn = 'materialInfoEdit';
  $('#materialInfoEditModal').classList.add('preview-child-layer');
  openModal('materialInfoEditModal');
});
$('#materialPreviewHistory').addEventListener('click', () => {
  const m = materials.find(x => x.id === previewMaterialId); if (!m) return;
  openMaterialHistory(m);
});
function openMaterialHistory(m) {
  const audit = materialAudit(m);
  $('#materialHistoryTitle').textContent = `“${m.name}”修改记录`;
  $('#materialHistoryMeta').textContent = `上传：${audit.uploader} · ${formatAuditTime(m.created, true)}　｜　最近修改：${audit.updatedBy} · ${formatAuditTime(audit.updatedAt, true)}`;
  $('#materialHistoryBody').innerHTML = `<div class="asset-history-list"><article><div><b>关联产品</b><span>${audit.updatedBy} · ${formatAuditTime(audit.updatedAt, true)}</span></div><p><em>未关联产品</em><i>→</i><strong>${escapeHtml(m.product || '未关联产品')}</strong></p></article><article><div><b>素材标签</b><span>嗡大发 · ${formatAuditTime(m.created, true)}</span></div><p><em>暂无标签</em><i>→</i><strong>${escapeHtml((m.tags || []).join('、') || '暂无标签')}</strong></p></article></div>`;
  openModal('materialHistoryModal');
}
$$('[data-close-material-history]').forEach(button => button.addEventListener('click', () => closeModal('materialHistoryModal')));
$('#saveMaterialInfoEdit').addEventListener('click', () => {
  const m = materials.find(x => x.id === previewMaterialId);
  if (!m) return;
  const name = $('#materialInfoEditName').value.trim();
  if (!name) { $('#materialInfoEditError').textContent = '请输入素材名称'; return; }
  m.name = name;
  m.product = $('#materialInfoEditProduct').value;
  m.folderId = $('#materialInfoEditFolder').value;
  m.updatedBy = '嗡大发';
  m.updatedAt = '2026-08-11 14:20:36';
  closeModal('materialInfoEditModal');
  $('#materialInfoEditModal').classList.remove('preview-child-layer');
  renderGrid();
  previewChildReturn = null;
  openMaterialPreview(m);
  toast('素材信息已更新', 'success');
});

/* ============ 渲染素材网格 ============ */
function renderGrid() {
  const grid = $('#matGrid');
  const query = searchQuery.trim().toLowerCase();
  const filtered = materials.filter(m => {
    if (activeType !== 'all' && m.type !== activeType) return false;
    const tagText = (m.tags || []).map(value => tagLibrary.find(tag => tag.id === value || tag.name === value)?.name || value).join(' ');
    const searchable = `${m.name || ''} ${m.product || ''} ${tagText}`.toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (activeTagFilter.size && ![...activeTagFilter].every(tag => tagText.split(' ').includes(tag))) return false;
    if (selectedFolderId === 'all') return true;
    if (!m.folderId || m.folderId === 'all') return true;
    if (m.folderId === selectedFolderId) return true;
    return ancestorIds(m.folderId).includes(selectedFolderId);
  });
  grid.innerHTML = filtered.map((m, i) => {
    const hasUrl = !!m.url;
    const bgStyle = hasUrl ? `style="background:url('${m.url}') center/cover no-repeat;"` : '';
    return `
    <div class="mat-card ${selectedIds.has(m.id) ? 'selected' : ''}" data-id="${m.id}" data-name="${m.name}">
      <div class="mat-cover" ${bgStyle}>
        <span class="status-${m.status}" data-tip="${{
          ok: '分析成功',
          fail: '分析失败：点击重试',
          pending: '等待分析 · 点击开始',
          analyzing: '正在分析…'
        }[m.status] || m.status}" data-act="start-analyze">
          <span class="ico">${{
            ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>',
            fail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>',
            pending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
            analyzing: ''
          }[m.status] || ''}</span>
          <span class="txt">${{ ok: '已分析', fail: '分析失败', pending: '待分析', analyzing: '分析中' }[m.status] || m.status}</span>
        </span>
        ${m.duration ? `<span class="duration">${m.duration}</span>` : ''}
        <div class="play-overlay">
          <div class="play-btn" data-tip="预览"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
        </div>
        <div class="select-mark">${selectedIds.has(m.id) ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ''}</div>
      </div>
      <div class="mat-info">
        <div class="name-line">
          <span class="name" title="${escapeHtml(m.name)}">${m.name}</span>
          <button class="mat-card-more" type="button" data-mat-more aria-label="素材操作">···</button>
        </div>
        <div class="meta-line">
          <div class="mat-product-line"><span class="mat-card-product${m.product ? '' : ' is-empty'}" data-tip="${m.product ? '已关联产品' : '未关联产品'}">${escapeHtml(m.product || '未关联产品')}</span></div>
          <span class="mat-type">${m.type === 'video' ? '视频' : '图片'}</span>
        </div>
        <div class="mat-card-created" title="最近修改：${escapeHtml(materialAudit(m).updatedBy)} · ${escapeHtml(formatAuditTime(materialAudit(m).updatedAt, true))}">${m.created ? `${escapeHtml(materialAudit(m).updatedBy)} · ${formatAuditTime(materialAudit(m).updatedAt)}` : ''}</div>
      </div>
    </div>
  `;}).join('');
  // 空态展示
  const empty = $('#matEmpty');
  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    $('#matEmptyText').textContent = query ? '未找到符合条件的内容' : (selectedFolderId === 'all' ? '暂无素材' : '该文件夹下还没有素材');
    $('#matEmptyHelp').textContent = query ? '请调整关键词或清空筛选条件' : '点击右上角「导入素材」添加文件，或在左侧创建新文件夹';
  } else {
    empty.classList.add('hidden');
  }
  updateTypeCounts(filtered);
  bindCardEvents();
}
function folderMatches(m, folderId) {
  if (folderId === 'all') return true;
  if (!m.folderId || m.folderId === 'all') return true;
  if (m.folderId === folderId) return true;
  return ancestorIds(m.folderId).includes(folderId);
}
function updateTypeCounts(filtered) {
  // 根据当前选中的文件夹重新计算类型分组的数量
  const all = materials.filter(m => folderMatches(m, selectedFolderId));
  const counts = {
    all: all.length,
    video: all.filter(m => m.type === 'video').length,
    image: all.filter(m => m.type === 'image').length
  };
  $$('#typeTabs .ft').forEach(btn => {
    const t = btn.dataset.type;
    const c = btn.querySelector('.ft-count');
    if (c) c.textContent = counts[t] || 0;
  });
}
function bindCardEvents() {
  $$('.mat-card').forEach(card => {
    const id = +card.dataset.id;
    const m = materials.find(x => x.id === id);
    if (!m) return;

    const toggleMaterialSelection = () => {
      if (selectedIds.has(id)) selectedIds.delete(id);
      else selectedIds.add(id);
      card.classList.toggle('selected', selectedIds.has(id));
      const mark = card.querySelector('.select-mark');
      if (mark) mark.innerHTML = selectedIds.has(id) ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : '';
      updateBatchBar();
    };

    // 右上角选择圆点必须直接切换选中状态，不能被封面预览拦截。
    const selectMark = card.querySelector('.select-mark');
    if (selectMark) selectMark.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMaterialSelection();
    });

    // 封面始终用于预览；状态徽章和勾选按钮保留各自的操作。
    const cover = card.querySelector('.mat-cover');
    if (cover) {
      cover.addEventListener('click', (e) => {
        // 让状态徽章、勾选按钮保留自己的处理
        if (e.target.closest('[data-act="start-analyze"]')) return;
        if (e.target.closest('.select-mark')) return;
        if (e.target.closest('.mat-card-more')) return; // ··· 自己处理
        e.stopPropagation();
        openMaterialPreview(m);
      });
    }

    // 信息区：已分析打开右侧分析结果；其他状态仍只允许预览。
    const info = card.querySelector('.mat-info');
    if (info) info.addEventListener('click', (e) => {
      if (e.target.closest('.mat-card-more')) return;
      e.stopPropagation();
      if (m.status === 'ok') openDrawer(m);
      else openMaterialPreview(m);
    });

    // 单素材 ··· 按钮 → 切换共享 popover
    const moreBtn = card.querySelector('.mat-card-more');
    if (moreBtn) {
      moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const popover = $('#matPopover');
        if (!popover) return;
        const wasOpen = popover.classList.contains('open') && popover.dataset.targetId == id;
        closeAllMatPopovers();
        if (!wasOpen) {
          popover.dataset.targetId = id;
          const analyzeItem = popover.querySelector('[data-mat-act="reanalyze"]');
          const analysisDone = m.status === 'ok';
          analyzeItem.setAttribute('aria-disabled', String(analysisDone));
          analyzeItem.title = analysisDone ? '素材已分析，无需重复分析' : '';
          popover.classList.add('open');
          // 定位到按钮下方(参照成片视频 positionMenu)
          const rect = moreBtn.getBoundingClientRect();
          const popWidth = 168;
          popover.style.left = `${Math.min(window.innerWidth - popWidth - 8, Math.max(8, rect.right - popWidth + 12))}px`;
          popover.style.top = `${Math.min(window.innerHeight - 290, rect.bottom + 4)}px`;
        }
      });
    }
    // 卡片其他区域点击 = 选中/取消，并关闭 popover
    card.addEventListener('click', (e) => {
      // popover 内部点击不传播到这里（已被 stopPropagation），但保险起见再判断
      if (e.target.closest('.mat-card-popover')) return;
      if (e.target.closest('[data-act="start-analyze"]')) {
        e.stopPropagation();
        if (m.status === 'pending' || m.status === 'fail') {
          simulateAnalysis(m);
          toast(`已开始分析:${m.name}`, 'success');
        }
        return;
      }
      if (e.target.closest('.play-btn')) return;
      if (e.target.closest('.mat-cover')) return; // cover 自己处理
      if (e.target.closest('.mat-card-more')) return; // ··· 自己处理
      closeAllMatPopovers();
      toggleMaterialSelection();
    });

    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      contextTargetId = id;
      showContextMenu(e.clientX, e.clientY);
    });
  });
}

// 文档级点击：点击 popover 外区域关闭所有 popover（仅注册一次）
document.addEventListener('click', (e) => {
  if (!e.target.closest('.mat-card-popover') && !e.target.closest('.mat-card-more')) {
    closeAllMatPopovers();
  }
});
// 共享 popover 内的菜单项点击(全局注册一次)
$('#matPopover').addEventListener('click', (e) => {
  e.stopPropagation();
  const item = e.target.closest('[data-mat-act]');
  if (!item) return;
  if (item.getAttribute('aria-disabled') === 'true') return;
  const id = +$('#matPopover').dataset.targetId;
  runMatAction(item.dataset.matAct, id);
  closeAllMatPopovers();
});

/* ============ 批量操作栏 ============ */
function updateBatchBar() {
  $('#batchBar').classList.toggle('hidden', selectedIds.size === 0);
  $('#batchCount').textContent = selectedIds.size;
  $('#checkAll').classList.toggle('checked', selectedIds.size === materials.length && materials.length > 0);
}
$('#checkAll').addEventListener('click', () => {
  if (selectedIds.size === materials.length) selectedIds.clear();
  else materials.forEach(m => selectedIds.add(m.id));
  renderGrid();
  updateBatchBar();
});
$('#closeBatch').addEventListener('click', () => { selectedIds.clear(); renderGrid(); updateBatchBar(); });
$$('.batch-btn').forEach(btn => btn.addEventListener('click', () => {
  const act = btn.dataset.batch;
  const map = {
    download: () => toast(`已下载 ${selectedIds.size} 个素材`, 'success'),
    tag: () => openModal('tagFilterModal'),
    product: () => openBatchEdit('product', [...selectedIds]),
    move: () => openBatchEdit('move', [...selectedIds]),
    reanalyze: () => {
      let n = 0;
      for (const id of selectedIds) {
        const m = materials.find(x => x.id === id);
        if (m && (m.status === 'pending' || m.status === 'fail')) {
          simulateAnalysis(m);
          n++;
        }
      }
      if (!n) toast('当前选择里没有可分析的素材', 'error');
      else toast(`已开始分析 ${n} 个素材`, 'success');
    },
    delete: () => openBatchEdit('delete', [...selectedIds])
  };
  (map[act] || (() => {}))();
}));
function populateMoveTargets() {
  const list = $('#moveTargetList');
  if (!list) return;
  const opts = [
    { id: 'ungrouped', label: '未归入素材组', count: 0 },
    { id: 'all', label: '全部成片（顶层汇总）', count: materials.length }
  ];
  function walk(arr, prefix) {
    for (const f of arr) {
      const c = folderTotalCount(f);
      opts.push({ id: f.id, label: prefix + f.name, count: c });
      if (f.children && f.children.length) walk(f.children, prefix + '— ');
    }
  }
  walk(folderTree, '');
  opts.push({ id: 'new', label: '+ 新建素材组…', count: 0 });
  list.innerHTML = opts.map((o, i) =>
    '<label class="rewrite-audience-chip" style="display:flex; align-items:center; gap:8px; padding:10px 12px;">' +
      '<input type="radio" name="targetGroup" value="' + o.id + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span style="flex:1;">' + o.label + '</span>' +
      '<span style="color:#aab0c2; font-size:12px;">' + (o.count || '') + '</span>' +
    '</label>'
  ).join('');
}

/* ============ 通用批量操作弹窗（关联产品 / 移动至文件夹 / 删除） ============ */
let batchEditState = null; // { mode, ids: [...] }

function renderFolderSelectOptions(selectedId) {
  // 复用 moveModal 的树形结构，渲染为 <select> 选项
  const opts = [];
  opts.push({ id: 'all', label: '未归入素材组' });
  function walk(arr, prefix) {
    for (const f of arr) {
      opts.push({ id: f.id, label: prefix + f.name });
      if (f.children && f.children.length) walk(f.children, prefix + '— ');
    }
  }
  walk(folderTree, '');
  return opts.map(o => `<option value="${o.id}"${o.id === selectedId ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
}

function openBatchEdit(mode, ids) {
  const targets = ids.map(id => materials.find(x => x.id === id)).filter(Boolean);
  if (!targets.length) { toast('请先选择素材', 'warning'); return; }
  batchEditState = { mode, ids: targets.map(m => m.id) };

  const config = {
    product:  { title: '关联产品',   sub: '每个素材仅可关联一个产品', kicker: '#5a3fc8' },
    move:     { title: '移动至文件夹', sub: '可移动到任意文件夹',     kicker: '#5b5ce2' },
    delete:   { title: '删除素材',   sub: '', kicker: '#c8424e' }
  }[mode];

  const n = targets.length;
  $('#batchEditKicker').textContent = '素材操作';
  $('#batchEditKicker').style.cssText = `color:${config.kicker};background:${config.kicker}1a;`;
  $('#batchEditTitle').textContent = config.title;
  $('#batchEditSubtitle').textContent = mode === 'delete' ? '' : n === 1
    ? `将作用于当前打开的素材。${config.sub}`
    : `将作用于已选的 ${n} 个素材。${config.sub}`;

  const isDanger = mode === 'delete';
  const confirmBtn = $('#confirmBatchEdit');
  confirmBtn.textContent = isDanger ? '确认删除' : '确认';
  confirmBtn.style.cssText = isDanger ? 'background:linear-gradient(135deg,#e55353,#c8424e);border:0;' : '';

  let bodyHtml = '';
  if (mode === 'product') {
    const current = targets[0].product || '';
    bodyHtml = `<div class="field full"><label>对应产品 <em class="required-mark">*</em></label>
      <select id="batchEditProduct">
        ${productOptions.map(n => `<option value="${escapeHtml(n)}"${n === current ? ' selected' : ''}>${escapeHtml(n)}</option>`).join('')}
        <option value=""${current === '' ? ' selected' : ''}>— 解除关联 —</option>
      </select>
      <small style="color:#6b7080; font-size:12px;">已选 ${n} 个素材，将覆盖当前产品关联。</small>
    </div>`;
  } else if (mode === 'move') {
    const current = targets[0].folderId || 'all';
    bodyHtml = `<div class="field full"><label>目标文件夹 <em class="required-mark">*</em></label>
      <select id="batchEditFolder">${renderFolderSelectOptions(current)}</select>
      <small id="batchEditError" style="color:#c8424e; font-size:12px;"></small>
    </div>`;
  } else if (mode === 'delete') {
    bodyHtml = `<div class="confirm-body"><b>删除后无法恢复，相关分析结果将同步删除。确认删除？</b></div>`;
  }
  $('#batchEditBody').innerHTML = bodyHtml;
  openModal('batchEditModal');
}

function confirmBatchEdit() {
  const edit = batchEditState; if (!edit) return;
  const targets = edit.ids.map(id => materials.find(x => x.id === id)).filter(Boolean);
  if (!targets.length) { closeModal('batchEditModal'); batchEditState = null; return; }

  if (edit.mode === 'product') {
    const product = $('#batchEditProduct').value;
    targets.forEach(m => { m.product = product; });
    closeModal('batchEditModal');
    batchEditState = null;
    renderGrid();
    // 若详情抽屉打开的就是被改的素材,同步刷新抽屉里的关联产品行
    if (activeMaterialId && targets.some(t => t.id === activeMaterialId)) {
      const current = targets.find(t => t.id === activeMaterialId) || materials.find(x => x.id === activeMaterialId);
      if (current) {
        const productValue = $('#drawerProductValue');
        const productBtnText = $('#drawerProductBtnText');
        if (productValue && productBtnText) {
          if (current.product) {
            productValue.classList.remove('empty');
            productValue.textContent = current.product;
            productBtnText.textContent = '更换产品';
          } else {
            productValue.classList.add('empty');
            productValue.textContent = '未关联产品';
            productBtnText.textContent = '关联产品';
          }
        }
      }
    }
    toast(product ? `已关联产品：${product}` : `已解除 ${targets.length} 个素材的产品关联`, 'success');
  } else if (edit.mode === 'move') {
    const folder = $('#batchEditFolder').value;
    targets.forEach(m => { m.folderId = folder; });
    closeModal('batchEditModal');
    batchEditState = null;
    // 来自批量栏：清空已选；来自单卡：不动 selectedIds
    if (selectedIds.size) { selectedIds.clear(); updateBatchBar(); }
    renderFolderTree();
    renderGrid();
    toast(`已移动 ${targets.length} 个素材`, 'success');
  } else if (edit.mode === 'delete') {
    const removedIds = new Set(targets.map(m => m.id));
    for (let i = materials.length - 1; i >= 0; i--) {
      if (removedIds.has(materials[i].id)) materials.splice(i, 1);
    }
    // 清掉已选里这些 id
    for (const id of removedIds) selectedIds.delete(id);
    closeModal('batchEditModal');
    batchEditState = null;
    updateBatchBar();
    renderGrid();
    toast(`已删除 ${targets.length} 个素材`, 'success');
  }
}

$('#confirmBatchEdit').addEventListener('click', confirmBatchEdit);

/* ============ 单素材 ··· 菜单的统一分发 ============ */
// 与批量操作共用 openBatchEdit，保证单卡点击与批量行为完全一致
function runMatAction(act, id) {
  const m = materials.find(x => x.id === id); if (!m) return;
  closeAllMatPopovers();
  if (act === 'download') {
    toast(`已下载：${m.name}`, 'success');
  } else if (act === 'rename') {
    openRenameMaterial(m);
  } else if (act === 'tag') {
    openMaterialTagEditor(m);
  } else if (act === 'product' || act === 'move' || act === 'delete') {
    openBatchEdit(act, [id]);
  } else if (act === 'reanalyze') {
    if (m.status === 'pending' || m.status === 'fail') {
      simulateAnalysis(m);
      toast(`已开始分析：${m.name}`, 'success');
    } else {
      toast(`「${m.name}」正在分析或已完成`, 'warning');
    }
  }
}

function closeAllMatPopovers() {
  $$('.mat-card-popover.open').forEach(p => p.classList.remove('open'));
  setTimeout(notifyPdaOverlayIfIdle, 0);
}

/* ============ 右键菜单 ============ */
function showContextMenu(x, y) {
  const m = $('#ctxMenu');
  m.classList.remove('hidden');
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = (x + w > window.innerWidth ? x - w : x) + 'px';
  m.style.top = (y + h > window.innerHeight ? y - h : y) + 'px';
}
function hideContextMenu() { $('#ctxMenu').classList.add('hidden'); }
document.addEventListener('click', hideContextMenu);
document.addEventListener('contextmenu', (e) => { if (!e.target.closest('.mat-card')) hideContextMenu(); });
$$('#ctxMenu .item').forEach(it => it.addEventListener('click', (e) => {
  e.stopPropagation();
  hideContextMenu();
  const m = materials.find(x => x.id === contextTargetId);
  const act = it.dataset.act;
  const map = {
    open: () => openDrawer(m),
    download: () => toast(`已下载：${m.name}`, 'success'),
    rename: () => openRenameMaterial(m),
    tag: () => openMaterialTagEditor(m),
    product: () => openBatchEdit('product', [contextTargetId]),
    move: () => openBatchEdit('move', [contextTargetId]),
    reanalyze: () => { simulateAnalysis(m); toast(`已重新分析：${m.name}`, 'success'); },
    delete: () => openBatchEdit('delete', [contextTargetId])
  };
  (map[act] || (() => {}))();
}));

/* ============ 弹窗通用 ============ */
$$('[data-close-modal]').forEach(b => b.addEventListener('click', () => {
  const modalName = b.dataset.closeModal;
  const modal = $('#' + modalName + 'Modal');
  closeModal(modalName + 'Modal');
  modal?.classList.remove('preview-grandchild-layer');
  if (modalName === 'tagFilter' || modalName === 'materialInfoEdit') returnToMaterialPreview(modalName);
}));
$$('[data-open-modal]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.openModal + 'Modal')));
// 详情抽屉里"关联产品"按钮 → 复用批量关联产品弹窗,作用于当前打开的素材
$('#drawerProductBtn')?.addEventListener('click', () => {
  if (!activeMaterialId) return;
  openBatchEdit('product', [activeMaterialId]);
});
document.querySelector('[data-copy-filename]')?.addEventListener('click', async () => {
  const name = $('#drawerFileName')?.textContent || '';
  try { await navigator.clipboard.writeText(name); } catch (_) { /* 本地文件环境下仍保留交互反馈 */ }
  toast(`已复制文件名：${name}`, 'success');
});
$$('.modal-backdrop').forEach(m => m.addEventListener('click', (e) => {
  if (e.target !== m) return;
  if (m.classList.contains('preview-grandchild-layer')) {
    m.classList.remove('show', 'preview-grandchild-layer');
    return;
  }
  const childName = m.id === 'tagFilterModal' ? 'tagFilter' : m.id === 'materialInfoEditModal' ? 'materialInfoEdit' : '';
  m.classList.remove('show');
  if (childName) returnToMaterialPreview(childName);
}));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const grandchild = $('.modal-backdrop.preview-grandchild-layer.show');
  if (grandchild) {
    grandchild.classList.remove('show', 'preview-grandchild-layer');
    return;
  }
  if (previewChildReturn) {
    const child = previewChildReturn;
    closeModal(child + 'Modal');
    returnToMaterialPreview(child);
    return;
  }
  closeAllModals(); closeDrawer(); hideContextMenu();
});

/* ============ 标签筛选弹窗 ============ */
function renderTagGroups() {
  const wrap = $('#tagGroupList');
  if (!wrap) return;
  $$('.tag-modal-side .side-item[data-tag-group]').forEach(s => {
    s.classList.toggle('active', s.dataset.tagGroup === activeTagGroupId);
  });
  wrap.innerHTML = tagGroups.map(g => {
    const count = tagLibrary.filter(t => t.group === g.id).length;
    return `<div class="side-item" data-tag-group="${g.id}">
      <span class="name">${escapeHtml(g.name)}</span>
      <span class="count">${count}</span>
      <span class="grp-actions">
        <button data-act="rename-grp" data-id="${g.id}" data-tip="重命名">✎</button>
        <button data-act="del-grp" data-id="${g.id}" data-tip="删除分组">×</button>
      </span>
    </div>`;
  }).join('');
  const total = tagLibrary.length;
  const none = tagLibrary.filter(t => t.group === null).length;
  const tgAll = $('#tgCountAll'); if (tgAll) tgAll.textContent = total;
  const tgNone = $('#tgCountNone'); if (tgNone) tgNone.textContent = none;
  $$('.tag-modal-side .side-list .side-item', wrap).forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.grp-actions')) return;
      activeTagGroupId = row.dataset.tagGroup;
      renderTagGroups();
      renderTagList();
    });
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showTagGroupMenu(row.dataset.tagGroup, e);
    });
  });
  $$('.tag-modal-side .grp-actions [data-act]', wrap).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (btn.dataset.act === 'rename-grp') renameTagGroup(id);
      else if (btn.dataset.act === 'del-grp') deleteTagGroup(id);
    });
  });
  $$('.tag-modal-side > .side-item[data-tag-group]').forEach(s => {
    s.onclick = () => {
      activeTagGroupId = s.dataset.tagGroup;
      renderTagGroups();
      renderTagList();
    };
  });
}
function showTagGroupMenu(id, e) {
  const m = $('#tagGroupCtxMenu');
  m.dataset.grpId = id;
  m.classList.remove('hidden');
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = (e.clientX + w > window.innerWidth ? e.clientX - w : e.clientX) + 'px';
  m.style.top = (e.clientY + h > window.innerHeight ? e.clientY - h : e.clientY) + 'px';
}
$$('#tagGroupCtxMenu .item').forEach(it => it.addEventListener('click', () => {
  $('#tagGroupCtxMenu').classList.add('hidden');
  const id = $('#tagGroupCtxMenu').dataset.grpId;
  if (it.dataset.tagGrpAct === 'rename') renameTagGroup(id);
  else if (it.dataset.tagGrpAct === 'delete') deleteTagGroup(id);
}));
function addTagGroup() {
  const name = prompt('新建分组名称（1-12 字）');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 12) { toast('名称必填，1-12 字', 'error'); return; }
  if (tagGroups.some(g => g.name === trimmed)) { toast('已存在同名分组', 'error'); return; }
  const id = 'g-' + Date.now();
  tagGroups.push({ id, name: trimmed });
  activeTagGroupId = id;
  renderTagGroups();
  renderTagList();
  toast(`已创建分组：${trimmed}`, 'success');
}
function renameTagGroup(id) {
  const g = tagGroups.find(x => x.id === id);
  if (!g) return;
  const name = prompt('重命名分组', g.name);
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 12) { toast('名称必填，1-12 字', 'error'); return; }
  if (tagGroups.some(x => x.id !== id && x.name === trimmed)) { toast('已存在同名分组', 'error'); return; }
  g.name = trimmed;
  renderTagGroups();
  toast(`已重命名为：${trimmed}`, 'success');
}
function deleteTagGroup(id) {
  const g = tagGroups.find(x => x.id === id);
  if (!g) return;
  const tagCount = tagLibrary.filter(t => t.group === id).length;
  const msg = tagCount
    ? `分组「${g.name}」下还有 ${tagCount} 个标签,删除后这些标签会归入「未分组」。确认?`
    : `确认删除空分组「${g.name}」?`;
  if (!confirm(msg)) return;
  tagLibrary.forEach(t => { if (t.group === id) t.group = null; });
  tagGroups = tagGroups.filter(x => x.id !== id);
  if (activeTagGroupId === id) activeTagGroupId = 'all';
  renderTagGroups();
  renderTagList();
  toast('已删除分组', 'success');
}
function renderTagList() {
  let list = tagLibrary;
  if (activeTagGroupId === 'all') list = tagLibrary;
  else if (activeTagGroupId === 'uncategorized') list = tagLibrary.filter(t => t.group === null);
  else list = tagLibrary.filter(t => t.group === activeTagGroupId);
  const selectedTags = materialTagEditorId === null ? activeTagFilter : materialTagDraft;
  $('#tagList').innerHTML = list.map(t => `<span class="tag-chip ${selectedTags.has(t.name) ? 'active' : ''}" data-tag="${escapeHtml(t.name)}" data-tag-id="${t.id}">${escapeHtml(t.name)}${selectedTags.has(t.name) ? '<span class="x">×</span>' : ''}</span>`).join('') || '<span style="color:#aab0c2; font-size:12px; padding:8px 4px;">该分组下还没有标签,点击下方「新建标签」添加</span>';
  $$('#tagList .tag-chip').forEach(c => c.addEventListener('click', () => {
    const t = c.dataset.tag;
    if (selectedTags.has(t)) selectedTags.delete(t); else selectedTags.add(t);
    renderTagList();
    $('#tagSelectedHint').textContent = `已选 ${selectedTags.size} 个标签`;
  }));
}
renderTagGroups();
renderTagList();
$('#addNewTagGroup').addEventListener('click', addTagGroup);
function openMaterialTagEditor(m) {
  materialTagEditorId = m.id;
  materialTagDraft = new Set(m.tags || []);
  $('#tagModalKicker').textContent = '素材操作';
  $('#tagModalTitle').textContent = '编辑素材标签';
  $('#applyTagFilter').textContent = '保存标签';
  $('#tagSelectedHint').textContent = `已选 ${materialTagDraft.size} 个标签`;
  renderTagGroups(); renderTagList(); openModal('tagFilterModal');
}
function openTagFilterModal() {
  materialTagEditorId = null;
  $('#tagModalKicker').textContent = '筛选';
  $('#tagModalTitle').textContent = '按标签筛选素材';
  $('#applyTagFilter').textContent = '应用筛选';
  $('#tagSelectedHint').textContent = `已选 ${activeTagFilter.size} 个标签`;
  renderTagGroups(); renderTagList(); openModal('tagFilterModal');
}
$('#applyTagFilter').addEventListener('click', () => {
  if (materialTagEditorId !== null) {
    const material = materials.find(m => m.id === materialTagEditorId);
    if (material) material.tags = [...materialTagDraft];
    closeModal('tagFilterModal'); materialTagEditorId = null; renderGrid(); returnToMaterialPreview('tagFilter'); toast('素材标签已保存', 'success'); return;
  }
  closeModal('tagFilterModal');
  $('#tagFilterBtn').classList.toggle('has-value', activeTagFilter.size > 0);
  renderGrid();
  toast(`已应用 ${activeTagFilter.size} 个标签筛选`, 'success');
});
$('#clearTagFilter').addEventListener('click', () => { const tags = materialTagEditorId === null ? activeTagFilter : materialTagDraft; tags.clear(); renderTagList(); $('#tagSelectedHint').textContent = '已选 0 个标签'; if (materialTagEditorId === null) $('#tagFilterBtn').classList.remove('has-value'); });
$('#addNewTagBtn').addEventListener('click', () => {
  if (previewChildReturn === 'tagFilter') $('#newTagModal').classList.add('preview-grandchild-layer');
  openModal('newTagModal');
});
$('#tagSearchInput').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  $$('#tagList .tag-chip').forEach(c => c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none');
});
$('#confirmNewTagModal').addEventListener('click', () => {
  const v = $('#newTagName').value.trim();
  if (!v) { toast('请输入标签名', 'error'); return; }
  if (tagLibrary.some(t => t.name === v)) { toast('已存在同名标签', 'error'); return; }
  const group = (activeTagGroupId === 'all' || activeTagGroupId === 'uncategorized') ? null : activeTagGroupId;
  tagLibrary.push({ id: 't-' + Date.now(), name: v, group });
  (materialTagEditorId === null ? activeTagFilter : materialTagDraft).add(v);
  $('#newTagName').value = '';
  closeModal('newTagModal');
  $('#newTagModal').classList.remove('preview-grandchild-layer');
  renderTagGroups();
  renderTagList();
  toast(`已创建标签：${v}`, 'success');
});

function openRenameMaterial(m) {
  contextTargetId = m.id;
  $('#renameMaterialInput').value = m.name;
  $('#renameMaterialError').textContent = '';
  openModal('renameMaterialModal');
  setTimeout(() => $('#renameMaterialInput').focus(), 30);
}
$('#confirmRenameMaterial').addEventListener('click', () => {
  const material = materials.find(m => m.id === contextTargetId);
  const name = $('#renameMaterialInput').value.trim();
  if (!name) { $('#renameMaterialError').textContent = '请输入素材名称'; return; }
  if (!material) return;
  material.name = name; contextTargetId = null;
  closeModal('renameMaterialModal'); renderGrid(); toast('素材已重命名', 'success');
});

/* ============ 转移弹窗 ============ */
$('#confirmMove').addEventListener('click', () => {
  const raw = document.querySelector('input[name="targetGroup"]:checked');
  if (!raw) { closeModal('moveModal'); return; }
  const target = raw.value;
  let moved = 0;
  const apply = (folderId) => {
    if (contextTargetId) {
      const m = materials.find(x => x.id === contextTargetId);
      if (m) { m.folderId = folderId; moved = 1; }
      contextTargetId = null;
    }
    for (const id of selectedIds) {
      const m = materials.find(x => x.id === id);
      if (m) { m.folderId = folderId; moved++; }
    }
  };
  if (target === 'new') {
    const n = prompt('新素材组名');
    if (!n) return;
    const id = 'f' + Date.now();
    folderTree.push({ id, name: n, count: 0, expanded: false, children: [] });
    apply(id);
    closeModal('moveModal');
    selectedIds.clear();
    renderFolderTree();
    renderGrid();
    updateBatchBar();
    toast(`已创建「${n}」并转移 ${moved} 项`, 'success');
    return;
  }
  apply(target === 'ungrouped' ? 'all' : target);
  closeModal('moveModal');
  selectedIds.clear();
  renderFolderTree();
  renderGrid();
  updateBatchBar();
  toast(`已转移 ${moved} 项`, 'success');
});

/* ============ 删除确认 ============ */
$('#confirmDelete').addEventListener('click', () => {
  closeModal('deleteModal');
  if (contextTargetId) { materials.splice(materials.findIndex(m => m.id === contextTargetId), 1); contextTargetId = null; }
  if (selectedIds.size) { for (let i = materials.length - 1; i >= 0; i--) if (selectedIds.has(materials[i].id)) materials.splice(i, 1); selectedIds.clear(); updateBatchBar(); }
  renderGrid();
  toast('已删除', 'success');
});

/* ============ 详情抽屉 ============ */
$('#closeDrawer').addEventListener('click', closeDrawer);
$('#drawerMask').addEventListener('click', closeDrawer);
// 单击素材预览区域(cover)即可换出侧边栏(在 bindCardEvents 中绑定)
$$('#drawerTabs .tab').forEach(tab => {
  tab.addEventListener('click', () => setDrawerTab(tab.dataset.tab));
});
$$('[data-toggle-section]').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('collapsed')));
$('#collapseAllBtn').addEventListener('click', () => {
  const all = $$('.shot-section');
  const any = all.some(s => !s.classList.contains('collapsed'));
  all.forEach(s => s.classList.toggle('collapsed', any));
});
$('#reAnalyzeBtn').addEventListener('click', () => toast('已加入分析队列', 'success'));

/* ============ 工具栏交互 ============ */
$$('#typeTabs .ft').forEach(b => b.addEventListener('click', () => {
  $$('#typeTabs .ft').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  activeType = b.dataset.type;
  renderGrid();
}));
$('#tagFilterBtn').addEventListener('click', openTagFilterModal);
let materialSearchTimer;
$('#searchInput').addEventListener('input', (e) => {
  clearTimeout(materialSearchTimer);
  searchQuery = e.target.value;
  $('#searchClear').hidden = !searchQuery;
  materialSearchTimer = setTimeout(renderGrid, 300);
});
$('#searchClear').addEventListener('click', () => {
  clearTimeout(materialSearchTimer);
  searchQuery = '';
  $('#searchInput').value = '';
  $('#searchClear').hidden = true;
  renderGrid();
  $('#searchInput').focus();
});
$('#refreshBtn').addEventListener('click', () => { toast('已刷新素材列表', 'success'); renderGrid(); });

/* 状态筛选下拉 */
$('#statusFilter').addEventListener('click', (e) => {
  e.stopPropagation();
  const dd = $('#statusDropdown .dropdown-menu');
  const r = $('#statusFilter').getBoundingClientRect();
  dd.style.top = r.bottom + 6 + 'px';
  dd.style.left = r.left + 'px';
  dd.style.position = 'fixed';
  dd.style.zIndex = '80';
  dd.style.background = '#fff';
  dd.style.border = '1px solid var(--line)';
  dd.style.borderRadius = '9px';
  dd.style.boxShadow = '0 14px 40px rgba(0,0,0,.12)';
  dd.style.padding = '6px';
  dd.style.minWidth = '140px';
  dd.style.display = 'block';
});
$$('#statusDropdown [data-status]').forEach(it => it.addEventListener('click', () => {
  $('#statusFilter .value').textContent = it.textContent;
  $('#statusDropdown .dropdown-menu').style.display = 'none';
  toast(`已筛选：${it.textContent}`);
}));

/* 通用下拉 */
$$('.dropdown > button').forEach(b => b.addEventListener('click', (e) => {
  e.stopPropagation();
  const dd = b.parentElement;
  if (dd.id === 'statusDropdown') return;
  const menu = dd.querySelector('.dropdown-menu');
  const wasOpen = menu.style.display === 'block';
  $$('.dropdown').forEach(d => { const m = d.querySelector('.dropdown-menu'); if (m) m.style.display = 'none'; });
  if (!wasOpen) {
    menu.style.display = 'block';
    menu.style.position = 'absolute';
    menu.style.top = 'calc(100% + 6px)';
    menu.style.left = b.dataset.align === 'right' ? 'auto' : '0';
    menu.style.right = b.dataset.align === 'right' ? '0' : 'auto';
    menu.style.background = '#fff';
    menu.style.border = '1px solid var(--line)';
    menu.style.borderRadius = '9px';
    menu.style.boxShadow = '0 14px 40px rgba(0,0,0,.12)';
    menu.style.padding = '6px';
    menu.style.minWidth = '140px';
    menu.style.zIndex = '80';
  }
}));
document.addEventListener('click', (e) => {
  $$('.dropdown').forEach(d => {
    if (!e.target.closest('#' + d.id)) {
      const m = d.querySelector('.dropdown-menu');
      if (m && d.id !== 'statusDropdown') m.style.display = 'none';
    }
  });
  const sm = $('#statusDropdown .dropdown-menu');
  if (sm && !e.target.closest('#statusFilter') && !e.target.closest('#statusDropdown')) sm.style.display = 'none';
});
$$('#statusDropdown .dropdown-menu .item, .dropdown .item').forEach(it => it.addEventListener('click', () => {
  it.parentElement.style.display = 'none';
}));
/* 导入素材 - 直接弹出文件选择器 + 上传队列进度 */
$('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  startUploadQueue(files);
  e.target.value = '';
});

const uploadState = { items: [], doneCount: 0, failCount: 0, timers: [] };
function startUploadQueue(files) {
  const unsupportedAudio = files.filter(f => f.type.startsWith('audio/'));
  const supportedFiles = files.filter(f => f.type.startsWith('video/') || f.type.startsWith('image/'));
  if (unsupportedAudio.length) toast('暂不支持导入音频素材', 'error');
  if (!supportedFiles.length) return;
  files = supportedFiles;
  const panel = $('#uploadQueue');
  const list = $('#uqList');
  panel.classList.remove('hidden');
  // 先把每个文件挂到 UI 队列里
  for (const f of files) {
    const isVideo = f.type.startsWith('video/');
    const isImage = f.type.startsWith('image/');
    const type = isVideo ? 'video' : 'image';
    const sizeMB = f.size > 1024 * 1024 ? (f.size / 1024 / 1024).toFixed(2) + ' MB' : (f.size / 1024).toFixed(0) + ' KB';
    const id = Date.now() + Math.random();
    const item = {
      id,
      file: f,
      type,
      sizeMB,
      status: 'uploading',  // uploading | pending | done | fail
      progress: 0,
      materialId: null
    };
    // 渲染行
    const row = document.createElement('div');
    row.className = 'uq-item';
    row.dataset.uqId = id;
    row.innerHTML = `
      <div class="ico">${typeIco(type)}</div>
      <div class="body">
        <div class="row1"><span class="nm">${escapeHtml(f.name)}</span><span class="st">等待中</span></div>
        <div class="bar"><div></div></div>
      </div>`;
    list.appendChild(row);
    item.row = row;
    uploadState.items.push(item);
  }
  updateUqSummary();
  // 真实项目这里会先发请求拿分片 URL,这里用 setInterval 模拟进度
  uploadState.items.slice(-files.length).forEach(item => {
    const t = setInterval(() => {
      if (item.status === 'done' || item.status === 'fail') {
        clearInterval(t);
        return;
      }
      // 1% 概率失败(模拟网络错误)
      if (item.progress > 30 && Math.random() < 0.01) {
        item.status = 'fail';
        item.row.classList.add('fail');
        item.row.querySelector('.st').textContent = '上传失败';
        uploadState.failCount++;
        updateUqSummary();
        clearInterval(t);
        return;
      }
      item.progress = Math.min(100, item.progress + 4 + Math.random() * 9);
      const bar = item.row.querySelector('.bar > div');
      bar.style.width = item.progress + '%';
      if (item.progress < 100) {
        item.row.querySelector('.st').textContent = `上传中 ${Math.floor(item.progress)}%`;
        if (item.status === 'uploading' && item.progress > 0) item.status = 'uploading';
      } else {
        // 完成：实际插入素材,状态置为 pending(待分析)
        if (item.materialId == null) {
          const m = {
            id: 'mat-' + item.id,
            name: item.file.name,
            type: item.type,
            sizeLabel: item.sizeMB,
            duration: item.type === 'video' ? '0:0' + Math.floor(Math.random() * 9) : '',
            status: 'pending',
            folderId: selectedFolderId === 'all' ? 'all' : selectedFolderId,
            url: URL.createObjectURL(item.file)
          };
          materials.unshift(m);
          item.materialId = m.id;
          renderGrid();
          // 上传完成,不自动分析 - 由用户手动触发
        }
        item.status = 'done';
        item.row.classList.add('done');
        item.row.querySelector('.st').textContent = '已上传 · 等待分析';
        uploadState.doneCount++;
        updateUqSummary();
        clearInterval(t);
      }
    }, 220);
    uploadState.timers.push(t);
  });
}
function updateUqSummary() {
  const total = uploadState.items.length;
  const ok = uploadState.items.filter(i => i.status === 'done').length;
  const fail = uploadState.items.filter(i => i.status === 'fail').length;
  const running = total - ok - fail;
  $('#uqSummary').textContent = running > 0
    ? `${ok + fail} / ${total} · ${running} 个上传中`
    : `${ok} 成功${fail ? ' · ' + fail + ' 失败' : ''}`;
  if (running === 0 && total > 0) {
    // 全部结束后 4s 自动收起
    setTimeout(() => {
      // 只在没有任何"未上传完"时关闭
      if (uploadState.items.every(i => i.status === 'done' || i.status === 'fail')) {
        $('#uploadQueue').classList.add('hidden');
        uploadState.items = []; uploadState.doneCount = 0; uploadState.failCount = 0;
        $('#uqList').innerHTML = '';
      }
    }, 4000);
  }
}
function typeIco(t) {
  if (t === 'video') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18v12H3zM10 9l5 3-5 3z" fill="currentColor"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>';
}
function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
$('#uqClose').addEventListener('click', () => $('#uploadQueue').classList.add('hidden'));

// 上传完成后的 AI 分析流程:pending(等待) → analyzing(分析中) → ok / fail
function simulateAnalysis(m) {
  m.status = 'analyzing';
  renderGrid();
  // 1.5 ~ 3.5s 后出结果,10% 概率失败
  setTimeout(() => {
    if (Math.random() < 0.1) {
      m.status = 'fail';
      toast(`「${m.name}」分析失败,点击重试`, 'error');
    } else {
      m.status = 'ok';
    }
    renderGrid();
  }, 1500 + Math.random() * 2000);
}
// 抽屉里的"重新分析"按钮
$('#reAnalyzeBtn').addEventListener('click', () => {
  const m = activeMaterialId != null ? materials.find(x => x.id === activeMaterialId) : null;
  if (!m) return;
  simulateAnalysis(m);
  toast(`已重新分析：${m.name}`, 'success');
});
$$('#sortDropdown [data-sort]').forEach(it => it.addEventListener('click', () => toast(`已按「${it.textContent}」排序`, 'success')));
// viewDropdown removed (网格/列表/卡片切换)

/* 视频播放交互 */
document.addEventListener('click', (e) => {
  if (e.target.closest('.big-play, .vp-controls button, .sp-play')) toast('视频播放中...', 'success');
});

/* ============ 文件夹树 ============ */
const FOLDER_ICONS = {
  all: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v2H3V6zM3 10h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v2H3V6zM3 10h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z"/></svg>'
};
const ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg>';
const PLUS_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>';
const MORE_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>';

const folderTree = [
  { id: 'f1', name: '无限画板成片', count: 2, expanded: true, children: [
    { id: 'f1-1', name: '除螨仪项目', count: 1, children: [] },
    { id: 'f1-2', name: '空气炸锅项目', count: 1, children: [] }
  ]},
  { id: 'f2', name: '内部制作', count: 1, expanded: false, children: [] },
  { id: 'f3', name: '历史投放', count: 1, expanded: false, children: [] }
];
let selectedFolderId = 'all';
let treeCtxTargetId = null;

function findFolder(list, id, parent) {
  for (const f of list) {
    if (f.id === id) return { node: f, parent, list };
    if (f.children) { const r = findFolder(f.children, id, f); if (r) return r; }
  }
  return null;
}
function folderTotalCount(f) {
  if (!f.children || !f.children.length) return f.count;
  return f.count + f.children.reduce((s, c) => s + folderTotalCount(c), 0);
}
function gatherAllIds(list) {
  const ids = [];
  for (const f of list) { ids.push(f.id); if (f.children) ids.push(...gatherAllIds(f.children)); }
  return ids;
}
function ancestorIds(id) {
  const chain = [];
  function dfs(list, parents) {
    for (const f of list) {
      if (f.id === id) { chain.push(...parents); return true; }
      if (f.children && dfs(f.children, [...parents, f.id])) return true;
    }
    return false;
  }
  dfs(folderTree, []);
  return chain;
}
function renderFolderTree() {
  const root = $('#folderTree');
  const allTotal = folderTree.reduce((s, f) => s + folderTotalCount(f), 0);
  let html = `
    <div class="tree-item all-folder ${selectedFolderId === 'all' ? 'selected' : ''}" data-id="all">
      <span class="tree-arrow empty"></span>
      <span class="tree-icon">${FOLDER_ICONS.all}</span>
      <span class="tree-name">全部素材</span>
      <span class="tree-count">${allTotal}</span>
    </div>
  `;
  html += folderTree.map(f => renderNode(f, 0)).join('');
  root.innerHTML = html;
  bindTreeEvents();
}
function renderNode(f, depth) {
  const hasChildren = f.children && f.children.length > 0;
  const expanded = !!f.expanded;
  const selected = selectedFolderId === f.id;
  const count = folderTotalCount(f);
  return `
    <div class="tree-item-wrap">
      <div class="tree-item ${hasChildren ? 'has-children' : ''} ${expanded ? 'expanded' : ''} ${selected ? 'selected' : ''}" data-id="${f.id}" style="padding-left:${depth * 14}px;">
        <span class="tree-arrow ${hasChildren ? '' : 'empty'}">${ARROW_SVG}</span>
        <span class="tree-icon">${FOLDER_ICONS.folder}</span>
        <span class="tree-name">${f.name}</span>
        <span class="tree-count">${count}</span>
        <span class="tree-actions">
          <span class="tree-icon-btn tree-add" data-act="add" data-tip="新建子文件夹">${PLUS_SVG}</span>
          <span class="tree-icon-btn tree-more" data-act="more" data-tip="更多">${MORE_SVG}</span>
        </span>
      </div>
      ${hasChildren ? `<div class="tree-children">${f.children.map(c => renderNode(c, depth + 1)).join('')}</div>` : ''}
    </div>
  `;
}
function bindTreeEvents() {
  $$('.tree-item').forEach(it => it.addEventListener('click', (e) => {
    if (e.target.closest('.tree-add')) { e.stopPropagation(); addSubFolder(it.dataset.id); return; }
    if (e.target.closest('.tree-more')) { e.stopPropagation(); showTreeMenu(it.dataset.id, e); return; }
    if (e.target.closest('.tree-arrow.has')) { e.stopPropagation(); return; }
    const id = it.dataset.id;
    if (id === 'all') { selectedFolderId = 'all'; }
    else {
      const r = findFolder(folderTree, id);
      if (r) r.node.expanded = !r.node.expanded;
      selectedFolderId = id;
    }
    renderFolderTree();
    renderGrid();
    toast(`已切换：${it.querySelector('.tree-name').textContent}`);
  }));
  $$('.tree-item').forEach(it => it.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showTreeMenu(it.dataset.id, e);
  }));
  $$('.tree-item.has-children .tree-arrow').forEach(ar => ar.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = ar.closest('.tree-item');
    const id = item.dataset.id;
    if (id === 'all') return;
    const r = findFolder(folderTree, id);
    if (r) { r.node.expanded = !r.node.expanded; renderFolderTree(); }
  }));
}

function showTreeMenu(id, e) {
  treeCtxTargetId = id;
  const m = $('#treeCtxMenu');
  m.classList.remove('hidden');
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = (e.clientX + w > window.innerWidth ? e.clientX - w : e.clientX) + 'px';
  m.style.top = (e.clientY + h > window.innerHeight ? e.clientY - h : e.clientY) + 'px';
}
function hideTreeMenu() { $('#treeCtxMenu').classList.add('hidden'); }
document.addEventListener('click', (e) => {
  if (!e.target.closest('#treeCtxMenu')) hideTreeMenu();
});
$$('#treeCtxMenu .item').forEach(it => it.addEventListener('click', () => {
  hideTreeMenu();
  const act = it.dataset.treeAct;
  const map = {
    'new-sub': () => addSubFolder(treeCtxTargetId),
    'rename': () => renameFolder(treeCtxTargetId),
    'move': () => moveFolderPrompt(treeCtxTargetId),
    'delete': () => deleteFolder(treeCtxTargetId)
  };
  (map[act] || (() => {}))();
}));

function uniqueName(parent, base) {
  if (parent === null) {
    if (!folderTree.some(f => f.name === base)) return base;
    let i = 2;
    while (folderTree.some(f => f.name === base + ' (' + i + ')')) i++;
    return base + ' (' + i + ')';
  }
  if (!parent.children.some(f => f.name === base)) return base;
  let i = 2;
  while (parent.children.some(f => f.name === base + ' (' + i + ')')) i++;
  return base + ' (' + i + ')';
}

function addRootFolder() {
  const name = prompt('新建一级文件夹名称（1-30字）');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) { toast('名称必填，1-30 字', 'error'); return; }
  if (folderTree.some(f => f.name === trimmed)) { toast('同级已存在同名文件夹', 'error'); return; }
  const id = 'f' + Date.now();
  folderTree.push({ id, name: uniqueName(null, trimmed), count: 0, expanded: false, children: [] });
  selectedFolderId = id;
  renderFolderTree();
  renderGrid();
  toast(`已创建：${trimmed}`, 'success');
}
function addSubFolder(parentId) {
  if (parentId === 'all') { addRootFolder(); return; }
  const r = findFolder(folderTree, parentId);
  if (!r) return;
  r.node.expanded = true;
  const name = prompt('新建子文件夹名称（建议最多 5 层）');
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) { toast('名称必填，1-30 字', 'error'); return; }
  if (depthOf(parentId) >= 4) { toast('建议最多 5 层', 'error'); return; }
  if (r.node.children && r.node.children.some(f => f.name === trimmed)) { toast('同级已存在同名文件夹', 'error'); return; }
  const id = 'f' + Date.now();
  if (!r.node.children) r.node.children = [];
  r.node.children.push({ id, name: uniqueName(r.node, trimmed), count: 0, children: [] });
  selectedFolderId = id;
  renderFolderTree();
  renderGrid();
  toast(`已在「${r.node.name}」下创建：${trimmed}`, 'success');
}
function depthOf(id) {
  function dfs(list, d) {
    for (const f of list) {
      if (f.id === id) return d;
      if (f.children) { const r = dfs(f.children, d + 1); if (r !== -1) return r; }
    }
    return -1;
  }
  return dfs(folderTree, 0);
}
function renameFolder(id) {
  if (id === 'all') { toast('"全部成片"不能重命名', 'error'); return; }
  const r = findFolder(folderTree, id);
  if (!r) return;
  const siblings = r.parent ? r.parent.children : folderTree;
  const name = prompt('重命名为', r.node.name);
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) { toast('名称必填，1-30 字', 'error'); return; }
  if (siblings.some(f => f.id !== id && f.name === trimmed)) { toast('同级已存在同名文件夹', 'error'); return; }
  r.node.name = trimmed;
  renderFolderTree();
  renderGrid();
  toast(`已重命名为：${trimmed}`, 'success');
}
function moveFolderPrompt(id) {
  if (id === 'all') { toast('"全部成片"不能移动', 'error'); return; }
  const r = findFolder(folderTree, id);
  if (!r) return;
  // 不能移动到自身或某子级
  const blockIds = new Set([id, ...gatherAllIds(r.node.children || [])]);
  const candidates = [];
  function collect(list, prefix) {
    for (const f of list) {
      if (!blockIds.has(f.id)) candidates.push({ id: f.id, label: prefix + f.name });
      if (f.children && f.children.length) collect(f.children, prefix + '— ');
    }
  }
  collect(folderTree, '');
  if (!candidates.length) { toast('无可选目标', 'error'); return; }
  const targetId = prompt('移动到（输入目标名称片段以选择）：\n' + candidates.map((c, i) => `${i + 1}. ${c.label}`).join('\n') + '\n\n输入编号：');
  const idx = parseInt(targetId, 10);
  if (!idx || idx < 1 || idx > candidates.length) { toast('已取消', 'error'); return; }
  const target = findFolder(folderTree, candidates[idx - 1].id);
  if (!target) return;
  // 从原位置移除
  if (r.parent) r.parent.children = r.parent.children.filter(f => f.id !== id);
  else folderTree.splice(folderTree.findIndex(f => f.id === id), 1);
  // 加到目标 children
  if (!target.node.children) target.node.children = [];
  target.node.children.push(r.node);
  target.node.expanded = true;
  renderFolderTree();
  renderGrid();
  toast(`已移动到：${candidates[idx - 1].label}`, 'success');
}
function deleteFolder(id) {
  if (id === 'all') { toast('"全部成片"不能删除', 'error'); return; }
  const r = findFolder(folderTree, id);
  if (!r) return;
  const hasContent = folderTotalCount(r.node) > 0 || (r.node.children && r.node.children.length > 0);
  if (!hasContent) {
    if (!confirm(`确认删除空文件夹「${r.node.name}」？`)) return;
    removeFolderNode(r);
    if (selectedFolderId === id) selectedFolderId = 'all';
    renderFolderTree();
    renderGrid();
    toast('已删除', 'success');
    return;
  }
  // 非空：弹迁移选择
  openMigrateModal(r);
}
function removeFolderNode(r) {
  if (r.parent) r.parent.children = r.parent.children.filter(f => f.id !== r.node.id);
  else folderTree.splice(folderTree.findIndex(f => f.id === r.node.id), 1);
}
function openMigrateModal(r) {
  $('#migrateTitle').textContent = `删除文件夹「${r.node.name}」`;
  // 收集候选目标（排除自身与子级）
  const blockIds = new Set([r.node.id, ...gatherAllIds(r.node.children || [])]);
  const sel = $('#migrateTarget');
  sel.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = '全部成片（顶层汇总）';
  sel.appendChild(optAll);
  function collect(list, prefix) {
    for (const f of list) {
      if (!blockIds.has(f.id)) {
        const op = document.createElement('option');
        op.value = f.id;
        op.textContent = prefix + f.name;
        sel.appendChild(op);
      }
      if (f.children && f.children.length) collect(f.children, prefix + '— ');
    }
  }
  collect(folderTree, '');
  $('#migrateFolderModal').dataset.targetId = r.node.id;
  openModal('migrateFolderModal');
}
$('#confirmMigrate').addEventListener('click', () => {
  const id = $('#migrateFolderModal').dataset.targetId;
  const target = $('#migrateTarget').value;
  const r = findFolder(folderTree, id);
  if (!r) { closeModal('migrateFolderModal'); return; }
  // 模拟迁移：减少目标 count 实际就是把"内容"迁过去
  // 这里只演示流程：移除节点（实际项目会先把素材数据迁过去再删）
  removeFolderNode(r);
  if (selectedFolderId === id) selectedFolderId = target || 'all';
  renderFolderTree();
  renderGrid();
  closeModal('migrateFolderModal');
  toast(`已迁移并删除「${r.node.name}」`, 'success');
});

$('#newRootFolder2').addEventListener('click', addRootFolder);
$('#collapseAllTree').addEventListener('click', () => {
  const anyExpanded = folderTree.some(f => f.expanded || (f.children || []).some(c => c.expanded));
  function collapseAll(list) { for (const f of list) { f.expanded = false; if (f.children) collapseAll(f.children); } }
  if (anyExpanded) collapseAll(folderTree);
  else folderTree.forEach(f => f.expanded = true);
  renderFolderTree();
});

// 产品详情页只传递资产与动作，预览、详情、菜单均复用本页现有实现。
window.addEventListener('message', event => {
  const request = event.data;
  if (event.source !== window.parent || request?.kind !== 'material') return;
  if (request.type === 'pda-library-overlay-cancel') {
    pdaOverlayMode = false;
    pdaOverlayAssetId = null;
    pdaOverlayRequestId = null;
    document.documentElement.classList.remove('pda-overlay-mode');
    document.body.classList.remove('pda-overlay-mode');
    closeAllModals();
    closeDrawer();
    closeAllMatPopovers();
    return;
  }
  if (request.type !== 'pda-open-library-asset') return;
  pdaOverlayMode = Boolean(request.overlay);
  pdaOverlayRequestId = request.requestId || null;
  document.documentElement.classList.toggle('pda-overlay-mode', pdaOverlayMode);
  document.body.classList.toggle('pda-overlay-mode', pdaOverlayMode);
  const material = materials.find(item => String(item.id) === String(request.id))
    || materials.find(item => item.name === request.file || item.name === request.name);
  if (!material) { toast('未找到对应创作素材', 'error'); notifyPdaOverlayIfIdle(); return; }
  pdaOverlayAssetId = material.id;
  selectedFolderId = 'all';
  activeType = 'all';
  activeTagFilter.clear();
  searchQuery = '';
  $('#searchInput').value = '';
  renderFolderTree();
  renderGrid();
  if (request.intent === 'preview') openMaterialPreview(material);
  else if (request.intent === 'detail') material.status === 'ok' ? openDrawer(material) : openMaterialPreview(material);
  else if (request.intent === 'menu') {
    const popover = $('#matPopover');
    popover.dataset.targetId = material.id;
    const analyzeItem = popover.querySelector('[data-mat-act="reanalyze"]');
    const analysisDone = material.status === 'ok';
    analyzeItem.setAttribute('aria-disabled', String(analysisDone));
    analyzeItem.title = analysisDone ? '素材已分析，无需重复分析' : '';
    popover.classList.add('open');
    const rect = request.anchor || { right:180, bottom:80 };
    const popWidth = 168;
    popover.style.left = `${Math.min(window.innerWidth-popWidth-8,Math.max(8,rect.right-popWidth+12))}px`;
    popover.style.top = `${Math.min(window.innerHeight-290,rect.bottom+4)}px`;
  }
  window.parent.postMessage({ type:'pda-library-overlay-ready', requestId:pdaOverlayRequestId, kind:'material' }, '*');
});

renderFolderTree();

/* 顶栏已移除,以下监听器随之上线即不再使用 */

/* 初始化 */
renderGrid();

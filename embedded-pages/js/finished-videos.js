(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const byId = (id) => document.getElementById(id);
  const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false });
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const formatTime = (seconds = 0) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const uniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

  const folders = [
    { id: 'brand', name: '品牌 TVC', parent: null },
    { id: 'campaign', name: '营销活动', parent: null },
    { id: 'launch', name: '新品上市', parent: 'campaign' },
    { id: 'mix', name: '混剪', parent: null },
    { id: 'mite', name: '轻净 Pro 除螨仪', parent: 'mix' },
    { id: 'hook', name: '钩子强化', parent: 'mite' },
    { id: 'proof', name: '效果证明', parent: 'mite' },
    { id: 'air', name: '空气炸锅', parent: 'mix' },
    { id: 'pending', name: '待整理', parent: null }
  ];

  const shotSeed = [
    ['00—03s', '刚换的床单，也能吸出一杯脏东西。', '特写', '固定', '透明尘杯近景，细尘在杯中快速聚集。'],
    ['03—06s', '看得见的是表面，看不见的都藏在床垫深处。', '特写', '推进', '镜头沿床垫纤维推进，展示隐藏灰尘。'],
    ['06—10s', '轻净 Pro 一边拍打一边吸，深层脏污直接带出来。', '中景', '平移跟拍', '人物持机清洁床垫，拍打与吸尘动作连贯。'],
    ['10—14s', '毛发和细小碎屑都会进到透明尘杯里。', '近景', '推进', '尘杯内部变化与床面推进镜头交叉呈现。'],
    ['14—18s', '床垫、沙发和布艺椅，都能顺手清理。', '全景', '平移跟拍', '三个家庭使用场景快速切换。'],
    ['18—23s', '机身握持轻松，日常拿出来不费劲。', '中景', '固定', '单手拿取、启动和收纳的连续动作。'],
    ['23—30s', '现在把看不见的脏东西，也一起清理干净。', '特写', '固定', '清洁前后对比，产品与洁净床面定格收尾。']
  ];

  const makeShots = () => shotSeed.map((row, index) => ({ id: index + 1, start: [0, 3, 6, 10, 14, 18, 23][index], end: [3, 6, 10, 14, 18, 23, 30][index], time: row[0], voice: row[1], scene: row[2], move: row[3], visual: row[4] }));
  const makeAds = (count = 2) => Array.from({ length: count }, (_, index) => ({
    id: `QC-${240618 + index}`,
    name: ['主投放素材 A', '高转化素材 B', '复投素材 C'][index],
    spend: [16820, 12460, 6380][index],
    roi: [3.42, 2.96, 2.51][index],
    orders: [1268, 904, 431][index],
    ctr: [6.8, 5.9, 4.7][index]
  }));

  const sourceMeta = {
    infinite: { label: '无限画板', className: 'fv-tag-infinite' },
    local: { label: '本地上传', className: 'fv-tag-local' },
    remix: { label: '智能混剪', className: 'fv-tag-remix' }
  };
  let tagGroups = [
    { id: 'product', name: '产品标签' },
    { id: 'scene', name: '场景标签' },
    { id: 'creative', name: '内容标签' }
  ];
  let tagLibrary = [
    { name: '新品种草', group: 'product' }, { name: '品牌心智', group: 'product' },
    { name: '家庭清洁', group: 'scene' }, { name: '场景演示', group: 'scene' },
    { name: '痛点钩子', group: 'creative' }, { name: '效果证明', group: 'creative' }, { name: '结果直给', group: null }
  ];
  const productOptions = ['轻净 Pro 除螨仪', '轻享空气炸锅', '净澈洗地机'];
  const videos = [
    { id: 'tvc-1', name: '轻净 Pro 品牌故事片', file: 'QJ_PRO_TVC_30S.mp4', type: 'tvc', folder: 'brand', duration: 30, size: 286, created: '2026-08-06 14:20', product: '轻净 Pro 除螨仪', status: 'done', source: 'infinite', code: 'TVC', theme: 'tvc', tags: ['品牌心智'], ads: makeAds(2), shots: makeShots(), history: [{ time: '2026-08-06 14:28', result: '成功', version: 'V1' }] },
    { id: 'tvc-2', name: '轻净 Pro 七夕场景短片', file: 'QJ_QIXI_15S.mov', type: 'tvc', folder: 'launch', duration: 15, size: 154, created: '2026-08-05 11:08', product: '轻净 Pro 除螨仪', status: 'pending', source: 'local', code: 'TVC', theme: 'tvc', tags: ['场景演示'], ads: [] },
    { id: 'mix-1', name: '床垫深层清洁｜痛点钩子版', file: 'MIX_MITE_HOOK_30S.mp4', type: 'mix', folder: 'hook', duration: 30, size: 318, created: '2026-08-07 20:14', product: '轻净 Pro 除螨仪', status: 'done', source: 'remix', code: 'MIX', theme: 'mix-a', tags: ['痛点钩子', '效果证明'], ads: makeAds(3), shots: makeShots(), history: [{ time: '2026-08-07 20:20', result: '成功', version: 'V2' }, { time: '2026-08-07 19:48', result: '成功', version: 'V1' }] },
    { id: 'mix-2', name: '透明尘杯效果证明｜结果直给版', file: 'MIX_MITE_PROOF_26S.mp4', type: 'mix', folder: 'proof', duration: 26, size: 269, created: '2026-08-07 18:32', product: '轻净 Pro 除螨仪', status: 'done', source: 'remix', code: 'MIX', theme: 'mix-b', tags: ['效果证明', '结果直给'], ads: [], shots: makeShots().slice(0, 6), history: [{ time: '2026-08-07 18:39', result: '成功', version: 'V1' }] },
    { id: 'mix-3', name: '空气炸锅新品种草混剪', file: 'MIX_AIR_NEW_30S.mp4', type: 'mix', folder: 'air', duration: 30, size: 302, created: '2026-08-06 16:11', product: '轻享空气炸锅', status: 'pending', source: 'local', code: 'MIX', theme: 'mix-c', tags: ['新品种草'], ads: makeAds(1) },
    { id: 'mix-fail', name: '家庭清洁场景混剪（待重试）', file: 'MIX_HOME_22S.mp4', type: 'mix', folder: 'pending', duration: 22, size: 226, created: '2026-08-05 09:26', product: '轻净 Pro 除螨仪', status: 'failed', source: 'local', code: 'MIX', theme: 'mix-a', tags: ['家庭清洁'], ads: [] }
  ];
  window.ContentCompassFinishedVideoCatalog = videos;

  function publishFinishedVideoCatalog() {
    window.parent?.postMessage({
      type: 'content-compass-video-catalog',
      source: 'finished',
      items: videos
    }, '*');
  }

  window.addEventListener('message', (event) => {
    if (event.data?.type === 'content-compass-video-catalog-request') publishFinishedVideoCatalog();
  });
  publishFinishedVideoCatalog();

  const state = {
    folder: 'all', source: 'all', status: 'all', qianchuan: 'all', tags: new Set(), sort: 'time-desc', search: '',
    selected: new Set(), expanded: new Set(['brand', 'campaign', 'mix', 'mite']),
    currentVideo: null, currentAd: null, range: '7', metric: 'clicks', playing: false, importFileValid: false, importFile: null, importMeta: null,
    timer: null, playTime: 0, folderAction: null, assetAction: null, batchAction: null, tagModal: null, tagGroup: 'all', analyzeTargets: [], menuVideo: null, importTags: []
  };
  let pdaOverlayMode = false;
  let pdaOverlayAssetId = null;
  let pdaOverlayRequestId = null;

  function notifyPdaOverlayIfIdle() {
    if (!pdaOverlayMode) return;
    const active = !byId('fvCardMenu').hidden || !byId('fvDetailView').hidden || $$('.fv-modal-backdrop').some(modal => !modal.hidden || modal.classList.contains('show'));
    if (active) return;
    pdaOverlayMode = false;
    document.documentElement.classList.remove('pda-overlay-mode');
    document.body.classList.remove('pda-overlay-mode','pda-detail-mode');
    const asset = videos.find(item => String(item.id) === String(pdaOverlayAssetId));
    window.parent.postMessage({ type:'pda-library-overlay-close', requestId:pdaOverlayRequestId, kind:'video', assetId:pdaOverlayAssetId, deleted:!asset, asset:asset ? { id:asset.id, name:asset.name, file:asset.file, product:asset.product, duration:asset.duration, status:asset.status, source:asset.source, created:asset.created, tags:[...(asset.tags||[])], ads:[...(asset.ads||[])] } : null }, '*');
    pdaOverlayAssetId = null;
    pdaOverlayRequestId = null;
  }

  const folderById = (id) => folders.find((item) => item.id === id);
  const childrenOf = (parent) => folders.filter((item) => item.parent === parent);
  const descendantsOf = (id) => childrenOf(id).flatMap((child) => [child.id, ...descendantsOf(child.id)]);
  const folderDepth = (id) => { let depth = 1; let item = folderById(id); while (item?.parent) { depth += 1; item = folderById(item.parent); } return depth; };
  const folderPath = (id) => { const names = []; let item = folderById(id); while (item) { names.unshift(item.name); item = folderById(item.parent); } return names; };
  const folderVideoCount = (id) => videos.filter((video) => video.folder === id || descendantsOf(id).includes(video.folder)).length;
  const currentFolderIds = () => state.folder === 'all' ? folders.map((item) => item.id) : [state.folder, ...descendantsOf(state.folder)];

  function toast(message, tone = 'default') {
    const item = document.createElement('div');
    item.className = `fv-toast ${tone}`;
    item.textContent = message;
    byId('fvToastRegion').append(item);
    setTimeout(() => item.remove(), 2600);
  }

  function openModal(id) {
    const modal = byId(id);
    modal.hidden = false;
    document.body.classList.add('fv-modal-open');
    requestAnimationFrame(() => modal.classList.add('show'));
  }

  function closeModal(id) {
    const modal = byId(id);
    if (!modal) return;
    if (id === 'fvPreviewModal') byId('fvPreviewNative')?.pause();
    modal.classList.remove('show');
    setTimeout(() => { modal.hidden = true; if (!$$('.fv-modal-backdrop.show').length) document.body.classList.remove('fv-modal-open'); notifyPdaOverlayIfIdle(); }, 120);
  }

  function hideMenu() { byId('fvCardMenu').hidden = true; state.menuVideo = null; setTimeout(notifyPdaOverlayIfIdle, 0); }

  function folderOptions(selected = '', excluded = []) {
    const lines = ['<option value="">根目录</option>'];
    const walk = (parent, depth) => childrenOf(parent).forEach((item) => {
      if (!excluded.includes(item.id)) lines.push(`<option value="${item.id}" ${item.id === selected ? 'selected' : ''}>${'　'.repeat(depth)}${escapeHtml(item.name)}</option>`);
      walk(item.id, depth + 1);
    });
    walk(null, 0);
    return lines.join('');
  }

  function renderFolderTree() {
    const node = (item) => {
      const children = childrenOf(item.id);
      const collapsed = !state.expanded.has(item.id);
      return `<div class="fv-folder-node ${collapsed ? 'collapsed' : ''}" data-folder-node="${item.id}">
        <div class="fv-folder-row ${state.folder === item.id ? 'active' : ''}">
          <button class="fv-folder-toggle" type="button" data-folder-toggle="${item.id}" ${children.length ? '' : 'style="visibility:hidden"'}>⌄</button>
          <button class="fv-folder-select" type="button" data-folder-select="${item.id}" title="${escapeHtml(item.name)}">📁 ${escapeHtml(item.name)}</button>
          <span class="fv-folder-count">${folderVideoCount(item.id)}</span>
          <button class="fv-folder-more" type="button" data-folder-more="${item.id}" aria-label="文件夹操作">•••</button>
        </div>${children.length ? `<div class="fv-folder-children">${children.map(node).join('')}</div>` : ''}
      </div>`;
    };
    byId('fvFolderTree').innerHTML = `<div class="fv-folder-node"><div class="fv-folder-row ${state.folder === 'all' ? 'active' : ''}">
      <span class="fv-folder-toggle" style="visibility:hidden"></span><button class="fv-folder-select" type="button" data-folder-select="all">▣ 全部成片</button><span class="fv-folder-count">${videos.length}</span><span></span>
    </div></div>${childrenOf(null).map(node).join('')}`;
  }

  function getVisibleVideos() {
    const query = state.search.trim().toLowerCase();
    return videos.filter((video) => {
      const inFolder = state.folder === 'all' || currentFolderIds().includes(video.folder);
      const inSource = state.source === 'all' || video.source === state.source;
      const inStatus = state.status === 'all' || video.status === state.status;
      const isLinked = (video.ads || []).length > 0;
      const inQc = state.qianchuan === 'all' || (state.qianchuan === 'linked' ? isLinked : !isLinked);
      const inTags = !state.tags.size || [...state.tags].every((tag) => (video.tags || []).includes(tag));
      const searchable = [video.name, video.file, video.product, ...(video.tags || []), ...(video.ads || []).map((ad) => ad.id)].join(' ').toLowerCase();
      return inFolder && inSource && inStatus && inQc && inTags && (!query || searchable.includes(query));
    }).sort((a, b) => {
      if (state.sort === 'time-asc') return a.created.localeCompare(b.created);
      if (state.sort === 'name') return a.file.localeCompare(b.file, 'zh-CN');
      if (state.sort === 'size-desc') return b.size - a.size;
      if (state.sort === 'size-asc') return a.size - b.size;
      return b.created.localeCompare(a.created);
    });
  }

  const statusLabel = (status) => ({ done: '已拆解', pending: '待拆解', running: '拆解中', failed: '拆解失败' }[status] || '待拆解');
  const auditTime = (value, detailed = false) => {
    const match = String(value || '').match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/); if (!match) return value || '—';
    const [, year, month, day, hour, minute, second = '00'] = match;
    return `${year === '2026' ? '' : `${year}/`}${month}/${day} ${hour}:${minute}${detailed ? `:${second}` : ''}`;
  };
  const auditMeta = video => ({ creator: video.creator || '嗡大发', updatedBy: video.updatedBy || '嗡大发', updatedAt: video.updatedAt || video.created });
  function openAssetHistory(video) {
    const meta = auditMeta(video);
    byId('fvAssetHistoryTitle').textContent = `“${video.name}”修改记录`;
    byId('fvAssetHistoryMeta').textContent = `创建：${meta.creator} · ${auditTime(video.created, true)}　｜　最近修改：${meta.updatedBy} · ${auditTime(meta.updatedAt, true)}`;
    byId('fvAssetHistoryList').innerHTML = `<article class="fv-history-item"><div><b>视频标签</b><small>${meta.updatedBy} · ${auditTime(meta.updatedAt, true)}</small></div><p>未设置 → ${(video.tags || []).join('、') || '暂无标签'}</p></article><article class="fv-history-item"><div><b>所属文件夹</b><small>${meta.creator} · ${auditTime(video.created, true)}</small></div><p>未归档 → ${folderPath(video.folder).join(' / ')}</p></article>`;
    openModal('fvAssetHistoryModal');
  }
  function videoCard(video) {
    const cardTime = `${auditMeta(video).updatedBy} · ${auditTime(auditMeta(video).updatedAt)}`;
    const selected = state.selected.has(video.id);
    const source = sourceMeta[video.source] || sourceMeta.local;
    const qianchuan = video.ads?.length ? '<span class="fv-product-tag fv-qianchuan-tag">已关联千川</span>' : '';
    return `<article class="fv-video-card ${selected ? 'selected' : ''}" data-video-id="${video.id}">
      <div class="fv-card-cover ${video.theme || 'mix-a'}" data-preview-area="${video.id}" role="button" tabindex="0" aria-label="预览 ${escapeHtml(video.name)}">
        <button class="fv-card-select ${selected ? 'checked' : ''}" type="button" data-select-video="${video.id}" aria-label="选择视频" aria-pressed="${selected}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></button>
        <div class="fv-cover-status ${video.status}"><span class="fv-status-dot ${video.status}"></span><span class="fv-status-text">${statusLabel(video.status)}</span></div>
        <div class="fv-cover-tags"><span class="fv-tag ${source.className}">${source.label}</span></div>
        <button class="fv-card-play" type="button" data-preview="${video.id}" aria-label="预览">▶</button>
        <span class="fv-duration">${formatTime(video.duration)}</span>
      </div>
      <div class="fv-card-body" data-detail-area="${video.id}" role="button" tabindex="0" aria-label="查看 ${escapeHtml(video.name)} 详情">
        <div class="fv-card-file-line"><span title="${escapeHtml(video.file)}">${escapeHtml(video.file)}</span><button type="button" class="fv-card-more" data-video-more="${video.id}" aria-label="更多操作">•••</button></div>
        <div class="fv-card-tag-line"><span class="fv-product-tag">${escapeHtml(video.product)}</span>${qianchuan}</div><div class="fv-card-created">${cardTime}</div>
      </div>
    </article>`;
  }

  function renderBreadcrumb() {
    // 头部信息展示已移除
  }

  function renderVideos() {
    const list = getVisibleVideos();
    byId('fvVideoGrid').innerHTML = list.map(videoCard).join('');
    byId('fvVideoGrid').hidden = !list.length;
    byId('fvEmpty').hidden = Boolean(list.length);
    byId('fvClearSearch').hidden = !state.search;
    const counts = { all: videos.length, infinite: videos.filter((video) => video.source === 'infinite').length, local: videos.filter((video) => video.source === 'local').length, remix: videos.filter((video) => video.source === 'remix').length };
    byId('fvSourceCountAll').textContent = counts.all;
    byId('fvSourceCountInfinite').textContent = counts.infinite;
    byId('fvSourceCountLocal').textContent = counts.local;
    byId('fvSourceCountRemix').textContent = counts.remix;
    byId('fvTagFilterBtn').classList.toggle('has-value', state.tags.size > 0);
    renderSelectionBar();
  }

  function renderAll() { renderFolderTree(); renderBreadcrumb(); renderVideos(); }

  function renderSelectionBar() {
    byId('fvSelectionBar').hidden = !state.selected.size;
    byId('fvSelectedCount').textContent = state.selected.size;
  }

  function selectFolder(id) {
    state.folder = id;
    renderAll();
  }

  function toggleSelection(videoId) {
    const video = videos.find((item) => item.id === videoId);
    if (!video) return;
    state.selected.has(videoId) ? state.selected.delete(videoId) : state.selected.add(videoId);
    renderVideos();
  }

  function cancelSelection() {
    state.selected.clear(); renderVideos(); renderSelectionBar();
  }

  function showFolderMenu(button, folderId) {
    const menu = byId('fvCardMenu');
    const folder = folderById(folderId);
    menu.innerHTML = `<button type="button" data-folder-action="child" data-id="${folderId}">新建子文件夹</button><button type="button" data-folder-action="rename" data-id="${folderId}">重命名</button><button type="button" data-folder-action="move" data-id="${folderId}">移动</button><button class="danger" type="button" data-folder-action="delete" data-id="${folderId}">删除</button>`;
    positionMenu(menu, button); menu.hidden = false; state.menuVideo = null;
    menu.setAttribute('aria-label', `${folder.name}操作`);
  }

  function positionMenu(menu, button) {
    const rect = button.getBoundingClientRect();
    menu.style.left = `${Math.min(window.innerWidth - 150, Math.max(8, rect.right - 140))}px`;
    menu.style.top = `${Math.min(window.innerHeight - 270, rect.bottom + 5)}px`;
  }

  function showVideoMenu(button, videoId) {
    const video = videos.find((item) => item.id === videoId); if (!video) return;
    const menu = byId('fvCardMenu');
    const qianchuanAction = video.ads?.length ? '更换千川素材 ID' : '关联千川素材 ID';
    const analysisDone = video.status === 'done';
    menu.innerHTML = `<button type="button" data-video-action="download" data-id="${videoId}">下载</button><button type="button" data-video-action="analyze" data-id="${videoId}" ${analysisDone ? 'disabled aria-disabled="true" title="视频已拆解，无需重复拆解"' : ''}>拆解</button><i class="fv-menu-divider"></i><button type="button" data-video-action="rename" data-id="${videoId}">重命名</button><button type="button" data-video-action="tag" data-id="${videoId}">编辑标签</button><button type="button" data-video-action="move" data-id="${videoId}">移动至文件夹</button><i class="fv-menu-divider"></i><button type="button" data-video-action="product" data-id="${videoId}">关联产品</button><button type="button" data-video-action="qianchuan" data-id="${videoId}">${qianchuanAction}</button><i class="fv-menu-divider"></i><button class="danger" type="button" data-video-action="delete" data-id="${videoId}">删除</button>`;
    positionMenu(menu, button); menu.hidden = false; state.menuVideo = videoId;
    menu.setAttribute('aria-label', `${video.file}操作`);
  }

  function renderTagModal() {
    const modal = state.tagModal; if (!modal) return;
    const query = byId('fvTagSearch').value.trim().toLowerCase();
    const currentGroup = state.tagGroup;
    const groupMatches = (tag) => currentGroup === 'all' || (currentGroup === 'uncategorized' ? !tag.group : tag.group === currentGroup);
    const list = tagLibrary.filter((tag) => groupMatches(tag) && tag.name.toLowerCase().includes(query));
    byId('fvTagCountAll').textContent = tagLibrary.length;
    byId('fvTagCountNone').textContent = tagLibrary.filter((tag) => !tag.group).length;
    byId('fvTagGroupList').innerHTML = tagGroups.map((group) => `<button class="fv-tag-group ${state.tagGroup === group.id ? 'active' : ''}" type="button" data-tag-group="${group.id}"><span>${escapeHtml(group.name)}</span><b>${tagLibrary.filter((tag) => tag.group === group.id).length}</b></button>`).join('');
    $$('[data-tag-group]', byId('fvTagModal')).forEach((button) => button.classList.toggle('active', button.dataset.tagGroup === state.tagGroup));
    byId('fvTagList').innerHTML = list.map((tag) => `<button class="fv-tag-choice ${modal.draft.has(tag.name) ? 'active' : ''}" type="button" data-tag-option="${escapeHtml(tag.name)}">${escapeHtml(tag.name)}${modal.draft.has(tag.name) ? '<span>✓</span>' : ''}</button>`).join('') || '<span class="fv-empty-inline">该分组下还没有标签</span>';
    byId('fvTagSelectedHint').textContent = `已选 ${modal.draft.size} 个标签`;
  }

  function openTagModal(mode, targetIds = []) {
    const target = mode === 'edit' ? videos.find((item) => item.id === targetIds[0]) : null;
    const draft = mode === 'filter' ? state.tags : mode === 'import' ? state.importTags : mode === 'edit' ? (target?.tags || []) : [];
    state.tagModal = { mode, targetIds, draft: new Set(draft) };
    state.tagGroup = 'all';
    byId('fvTagSearch').value = ''; byId('fvNewTagName').value = ''; byId('fvTagError').textContent = ''; byId('fvTagCreateRow').hidden = true;
    byId('fvTagModalTitle').textContent = mode === 'filter' ? '按标签筛选' : mode === 'import' ? '添加视频标签' : mode === 'edit' ? '编辑视频标签' : `为 ${targetIds.length} 个成片打标签`;
    byId('fvTagModalSubtitle').textContent = mode === 'filter' ? '可多选标签，筛选同时满足全部标签的成片。' : mode === 'import' ? '选择或新建标签，导入后将随视频保存。' : mode === 'edit' ? '选择需要保留的视频标签。' : '标签会追加到已选成片，不会覆盖原有标签。';
    byId('fvConfirmTag').textContent = mode === 'filter' ? '应用筛选' : mode === 'import' ? '确认标签' : mode === 'edit' ? '保存标签' : '确认添加';
    renderTagModal(); openModal('fvTagModal');
  }

  function createTag() {
    const tag = byId('fvNewTagName').value.trim();
    if (!tag) { byId('fvTagError').textContent = '请输入标签名称'; return; }
    if (tag.length > 20) { byId('fvTagError').textContent = '标签名称最多 20 个字符'; return; }
    if (!tagLibrary.some((item) => item.name === tag)) tagLibrary.push({ name: tag, group: ['all', 'uncategorized'].includes(state.tagGroup) ? null : state.tagGroup });
    state.tagModal.draft.add(tag); byId('fvNewTagName').value = ''; byId('fvTagError').textContent = '';
    renderTagModal();
  }

  function createTagGroup() {
    const name = prompt('请输入标签分组名称（1–20 个字符）');
    if (!name) return;
    const value = name.trim();
    if (!value || value.length > 20) { toast('分组名称需为 1–20 个字符', 'warning'); return; }
    if (tagGroups.some((group) => group.name === value)) { toast('已存在同名标签分组', 'warning'); return; }
    const id = uniqueId('tag-group'); tagGroups.push({ id, name: value }); state.tagGroup = id; renderTagModal(); toast('标签分组已创建', 'success');
  }

  function confirmTagModal() {
    const modal = state.tagModal; if (!modal) return;
    if (modal.mode === 'filter') {
      state.tags = new Set(modal.draft);
      toast(modal.draft.size ? `已应用 ${modal.draft.size} 个标签筛选` : '已清空标签筛选', 'success');
    } else if (modal.mode === 'import') {
      state.importTags = [...modal.draft];
      toast(modal.draft.size ? `已添加 ${modal.draft.size} 个视频标签` : '未添加视频标签', 'success');
    } else if (modal.mode === 'edit') {
      const video = videos.find((item) => item.id === modal.targetIds[0]);
      if (video) video.tags = [...modal.draft];
      toast('视频标签已保存', 'success');
    } else {
      modal.targetIds.forEach((id) => {
        const video = videos.find((item) => item.id === id); if (!video) return;
        video.tags = [...new Set([...(video.tags || []), ...modal.draft])];
      });
      toast(`已为 ${modal.targetIds.length} 个成片添加标签`, 'success');
    }
    closeModal('fvTagModal'); state.tagModal = null; renderVideos();
    renderImportTags();
    const current = currentVideo();
    if (current && !byId('fvPreviewModal').hidden) renderPreviewTags(current);
  }

  function openBatchEdit(mode) {
    const targets = [...state.selected].map((id) => videos.find((video) => video.id === id)).filter(Boolean);
    if (!targets.length) { toast('请先选择视频', 'warning'); return; }
    state.batchAction = { mode, ids: targets.map((video) => video.id) };
    const config = { product: ['关联产品', '每条成片仅可关联一个产品'], move: ['移动至文件夹', '可移动到任意文件夹或其子文件夹'], delete: ['删除成片', ''] }[mode];
    byId('fvBatchEditTitle').textContent = config[0]; byId('fvBatchEditSubtitle').textContent = mode === 'delete' ? '' : `将作用于已选的 ${targets.length} 个成片。${config[1]}`;
    byId('fvConfirmBatchEdit').className = `fv-btn ${mode === 'delete' ? 'fv-btn-danger' : 'fv-btn-primary'}`;
    byId('fvConfirmBatchEdit').textContent = mode === 'delete' ? '确认删除' : '确认';
    byId('fvBatchEditBody').innerHTML = mode === 'product'
      ? `<label class="fv-field"><span>对应产品 <b>*</b></span><select id="fvBatchProduct">${productOptions.map((name) => `<option>${escapeHtml(name)}</option>`).join('')}</select></label>`
      : mode === 'move'
        ? `<label class="fv-field"><span>目标文件夹 <b>*</b></span><select id="fvBatchFolder">${folderOptions()}</select><small id="fvBatchEditError"></small></label>`
        : '<div class="fv-confirm-body"><b>删除后无法恢复，相关分析结果将同步删除。确认删除？</b></div>';
    openModal('fvBatchEditModal');
  }

  function confirmBatchEdit() {
    const action = state.batchAction; if (!action) return;
    const targets = action.ids.map((id) => videos.find((video) => video.id === id)).filter(Boolean);
    if (action.mode === 'product') {
      const product = byId('fvBatchProduct').value; targets.forEach((video) => { video.product = product; }); toast(`已关联产品：${product}`, 'success');
    } else if (action.mode === 'move') {
      const folder = byId('fvBatchFolder').value;
      if (!folder) { byId('fvBatchEditError').textContent = '请选择目标文件夹'; return; }
      targets.forEach((video) => { video.folder = folder; }); toast(`已移动 ${targets.length} 个成片`, 'success');
    } else if (action.mode === 'delete') {
      targets.forEach((video) => videos.splice(videos.indexOf(video), 1)); toast(`已删除 ${targets.length} 个成片`, 'success');
    }
    closeModal('fvBatchEditModal'); cancelSelection(); renderAll();
  }

  function openFolderEditor(mode, folderId = null) {
    const folder = folderById(folderId);
    state.folderAction = { mode, folderId };
    const title = mode === 'create-root' ? '新建一级文件夹' : mode === 'create-child' ? '新建子文件夹' : mode === 'rename' ? '重命名文件夹' : '移动文件夹';
    byId('fvFolderModalTitle').textContent = title;
    byId('fvFolderModalSubtitle').textContent = mode === 'move' ? '选择新的父级文件夹，文件夹内视频将随之移动。' : '名称需在同一层级内保持唯一。';
    byId('fvFolderName').value = ['rename', 'move'].includes(mode) ? folder.name : '';
    byId('fvFolderName').disabled = mode === 'move';
    const parent = mode === 'create-child' ? folderId : ['rename', 'move'].includes(mode) ? folder.parent || '' : '';
    const excluded = folder ? [folder.id, ...descendantsOf(folder.id)] : [];
    byId('fvFolderParent').innerHTML = folderOptions(parent, excluded);
    byId('fvFolderParent').disabled = mode === 'create-root' || mode === 'create-child' || mode === 'rename';
    byId('fvFolderNameError').textContent = '';
    openModal('fvFolderModal');
    setTimeout(() => (mode === 'move' ? byId('fvFolderParent') : byId('fvFolderName')).focus(), 80);
  }

  function saveFolder() {
    const { mode, folderId } = state.folderAction || {};
    const name = byId('fvFolderName').value.trim();
    const parent = byId('fvFolderParent').value || null;
    const current = folderById(folderId);
    if (mode !== 'move') {
      if (!name) { byId('fvFolderNameError').textContent = '请输入文件夹名称'; return; }
      if (name.length > 30) { byId('fvFolderNameError').textContent = '文件夹名称最多 30 个字符'; return; }
      const duplicate = folders.some((item) => item.id !== folderId && item.parent === parent && item.name.toLowerCase() === name.toLowerCase());
      if (duplicate) { byId('fvFolderNameError').textContent = '同级已存在同名文件夹'; return; }
    }
    if (mode === 'create-root' || mode === 'create-child') {
      if (parent && folderDepth(parent) >= 5) { byId('fvFolderNameError').textContent = '文件夹最多支持 5 层'; return; }
      const id = uniqueId('folder'); folders.push({ id, name, parent }); state.folder = id;
      if (parent) state.expanded.add(parent);
      toast('文件夹已创建', 'success');
    } else if (mode === 'rename') {
      current.name = name; toast('文件夹已重命名', 'success');
    } else if (mode === 'move') {
      if ((parent && folderDepth(parent) + maxSubDepth(folderId) > 5)) { byId('fvFolderNameError').textContent = '移动后将超过 5 层限制'; return; }
      current.parent = parent; if (parent) state.expanded.add(parent); toast('文件夹已移动', 'success');
    }
    closeModal('fvFolderModal'); renderAll();
  }

  function maxSubDepth(id) {
    const children = childrenOf(id); return children.length ? 1 + Math.max(...children.map((item) => maxSubDepth(item.id))) : 1;
  }

  function requestDeleteFolder(folderId) {
    const folder = folderById(folderId); const nested = [folderId, ...descendantsOf(folderId)];
    const affected = videos.filter((video) => nested.includes(video.folder));
    state.folderAction = { mode: 'delete', folderId, affected: affected.map((item) => item.id) };
    byId('fvDeleteFolderTitle').textContent = `删除“${folder.name}”？`;
    byId('fvDeleteFolderSummary').textContent = affected.length ? `该文件夹及其子级包含 ${affected.length} 个视频，删除前必须迁移。` : '该文件夹为空，删除后无法恢复。';
    if (!affected.length) {
      byId('fvDeleteFolderBody').innerHTML = '<div class="fv-confirm-note">文件夹及其子文件夹将被删除，不会影响其他视频。</div>';
    } else {
      const excluded = nested;
      byId('fvDeleteFolderBody').innerHTML = `<label class="fv-radio-row"><input type="radio" name="folderMigration" value="pending" checked><span><b>迁移至“待整理”</b><small>推荐，便于稍后重新归档</small></span></label>
        <label class="fv-radio-row"><input type="radio" name="folderMigration" value="custom"><span><b>迁移至其他文件夹</b><small>选择一个现有文件夹</small></span></label>
        <label class="fv-field"><span>目标文件夹</span><select id="fvDeleteFolderTarget" disabled>${folderOptions('', excluded)}</select><small id="fvDeleteFolderError"></small></label>`;
    }
    openModal('fvDeleteFolderModal');
  }

  function confirmDeleteFolder() {
    const action = state.folderAction; if (!action || action.mode !== 'delete') return;
    const nested = [action.folderId, ...descendantsOf(action.folderId)];
    if (action.affected.length) {
      const mode = $('input[name="folderMigration"]:checked')?.value;
      const target = mode === 'pending' ? 'pending' : byId('fvDeleteFolderTarget')?.value;
      if (!target) { byId('fvDeleteFolderError').textContent = '请选择目标文件夹'; return; }
      videos.forEach((video) => { if (nested.includes(video.folder)) video.folder = target; });
    }
    for (let index = folders.length - 1; index >= 0; index -= 1) if (nested.includes(folders[index].id)) folders.splice(index, 1);
    if (nested.includes(state.folder)) state.folder = 'all';
    closeModal('fvDeleteFolderModal'); renderAll(); toast('文件夹已删除，视频已保留', 'success');
  }

  function resetImportForm() {
    byId('fvImportFile').value = ''; byId('fvImportFileName').value = ''; byId('fvImportIds').value = '';
    byId('fvImportProduct').innerHTML = `<option value="">请选择对应产品</option>${productOptions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}`;
    byId('fvImportFolder').innerHTML = folderOptions(state.folder === 'all' ? 'pending' : state.folder);
    byId('fvImportFileInfo').hidden = true;
    state.importFileValid = false; state.importFile = null; state.importMeta = null; state.importTags = [];
    byId('fvImportNameError').textContent = ''; byId('fvImportProductError').textContent = ''; byId('fvImportDrop').classList.remove('has-file', 'invalid', 'is-dragging');
    renderImportTags();
  }

  function renderImportTags() {
    const tags = state.importTags || [];
    byId('fvImportTagList').innerHTML = tags.length
      ? tags.map((tag) => `<span class="fv-preview-video-tag">${escapeHtml(tag)}</span>`).join('')
      : '<span class="fv-preview-empty-tag">暂无视频标签</span>';
  }

  function openImport() { resetImportForm(); openModal('fvImportModal'); }

  function receiveImportFile(file) {
    if (!file) return;
    const supported = /\.(mp4|mov|m4v|webm|ogv)$/i.test(file.name);
    if (!supported) { toast('支持 MP4、MOV、M4V、WebM、OGV 格式的视频', 'warning'); return; }
    if (file.size > 500 * 1024 * 1024) { toast('单个视频文件不能超过 500M', 'warning'); return; }
    state.importFile = file; state.importMeta = null; state.importFileValid = false;
    byId('fvImportFileName').value = file.name;
    byId('fvImportFileInfo').innerHTML = `<span>…</span><div><b>${escapeHtml(file.name)}</b><small>${(file.size / 1024 / 1024).toFixed(1)} MB · 正在读取视频时长</small></div>`;
    byId('fvImportFileInfo').hidden = false; byId('fvImportDrop').classList.add('has-file');
    const probe = document.createElement('video'); const probeUrl = URL.createObjectURL(file); probe.preload = 'metadata'; probe.src = probeUrl;
    probe.onloadedmetadata = () => {
      const duration = Math.max(1, Math.round(Number.isFinite(probe.duration) ? probe.duration : 0));
      state.importFileValid = true; state.importMeta = { duration };
      byId('fvImportDrop').classList.remove('invalid');
      byId('fvImportFileInfo').innerHTML = `<span>✓</span><div><b>${escapeHtml(file.name)}</b><small>${(file.size / 1024 / 1024).toFixed(1)} MB · 时长 ${formatTime(duration)}</small></div>`;
      URL.revokeObjectURL(probeUrl);
    };
    probe.onerror = () => { state.importFileValid = false; byId('fvImportDrop').classList.add('invalid'); byId('fvImportFileInfo').innerHTML = `<span>!</span><div><b>${escapeHtml(file.name)}</b><small>无法读取视频时长，请重新选择</small></div>`; URL.revokeObjectURL(probeUrl); };
  }

  function confirmImport() {
    const file = state.importFile || byId('fvImportFile').files[0]; const name = byId('fvImportFileName').value.trim(); const product = byId('fvImportProduct').value;
    if (!file) { toast('请先选择视频文件', 'warning'); return; }
    if (!state.importFileValid) { toast('请等待视频时长读取完成', 'warning'); return; }
    if (!name) { byId('fvImportNameError').textContent = '请输入文件名称'; byId('fvImportFileName').focus(); return; }
    if (!product) { byId('fvImportProductError').textContent = '请选择对应产品'; return; }
    const folder = byId('fvImportFolder').value || 'pending';
    const qianchuanId = byId('fvImportIds').value.trim(); const ids = qianchuanId ? [qianchuanId] : [];
    const url = URL.createObjectURL(file);
    const video = { id: uniqueId('video'), name, file: name, type: 'video', folder, duration: state.importMeta?.duration || 1, size: Math.max(1, Math.round(file.size / 1024 / 1024)), created: nowText(), product, status: 'pending', source: 'local', code: 'LOCAL', theme: 'mix-b', tags: [...state.importTags], url, ads: ids.map((id, index) => ({ ...makeAds(1)[0], id, name: `关联素材 ${index + 1}`, spend: 0 })) };
    videos.unshift(video); state.folder = folder; closeModal('fvImportModal'); renderAll(); toast('成片导入成功', 'success');
  }

  function downloadVideo(video) {
    if (video.url) { const anchor = document.createElement('a'); anchor.href = video.url; anchor.download = video.file; anchor.click(); }
    else toast(`已创建“${video.file}”下载任务（演示）`, 'success');
  }

  function openAssetAction(action, videoId) {
    const video = videos.find((item) => item.id === videoId); if (!video) return;
    state.assetAction = { action, videoId };
    const config = { rename: ['重命名视频', '名称最多 60 个字符'], product: ['关联产品', '每条成片仅可关联一个产品'], qianchuan: [video.ads?.length ? '更换千川素材 ID' : '关联千川素材 ID', '每条成片仅可关联一个千川素材 ID'], info: ['编辑视频信息', '可更换产品、文件夹及千川素材 ID'], move: ['移动视频', '可移动到任意文件夹或其子文件夹'], delete: ['删除视频', ''] }[action];
    byId('fvAssetModalTitle').textContent = config[0]; byId('fvAssetModalSubtitle').textContent = config[1];
    byId('fvAssetModalConfirm').className = `fv-btn ${action === 'delete' ? 'fv-btn-danger' : 'fv-btn-primary'}`;
    byId('fvAssetModalConfirm').textContent = action === 'delete' ? '确认删除' : '确认';
    byId('fvAssetModalBody').innerHTML = action === 'rename' ? `<label class="fv-field"><span>视频名称 <b>*</b></span><input id="fvAssetName" maxlength="60" value="${escapeHtml(video.name)}"><small id="fvAssetError"></small></label>` : action === 'product' ? `<label class="fv-field"><span>对应产品 <b>*</b></span><select id="fvAssetProduct">${productOptions.map((name) => `<option ${name === video.product ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select><small id="fvAssetError"></small></label>` : action === 'qianchuan' ? `<label class="fv-field"><span>千川素材 ID <b>*</b></span><input id="fvAssetQianchuanId" maxlength="60" value="${escapeHtml(video.ads?.[0]?.id || '')}" placeholder="请输入一个千川素材 ID"><small id="fvAssetError">关联后即可查看千川投流数据与互动时序分析。</small></label>${video.ads?.length ? '<button class="fv-btn fv-btn-danger small" type="button" data-unlink-qianchuan="true">解除关联</button>' : ''}` : action === 'info' ? `<div class="fv-form-grid"><label class="fv-field"><span>对应产品 <b>*</b></span><select id="fvAssetProduct">${productOptions.map((name) => `<option ${name === video.product ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('')}</select></label><label class="fv-field"><span>所属文件夹 <b>*</b></span><select id="fvAssetFolder">${folderOptions(video.folder)}</select></label><label class="fv-field full"><span>千川素材 ID <em>选填</em></span><input id="fvAssetQianchuanId" maxlength="60" value="${escapeHtml(video.ads?.[0]?.id || '')}" placeholder="输入一个千川素材 ID"><small id="fvAssetError">每条视频仅可关联一个 ID；清空并保存即可解除关联。</small></label></div>` : action === 'move' ? `<label class="fv-field"><span>目标文件夹 <b>*</b></span><select id="fvAssetFolder">${folderOptions(video.folder)}</select><small id="fvAssetError"></small></label>` : '<div class="fv-confirm-body"><b>删除后无法恢复，相关分析结果将同步删除。确认删除？</b></div>';
    openModal('fvAssetModal');
  }

  function confirmAssetAction() {
    const { action, videoId } = state.assetAction || {}; const video = videos.find((item) => item.id === videoId); if (!video) return;
    if (action === 'rename') {
      const name = byId('fvAssetName').value.trim(); if (!name) { byId('fvAssetError').textContent = '请输入视频名称'; return; } video.name = name; video.file = name; toast('视频已重命名', 'success');
    } else if (action === 'product') { video.product = byId('fvAssetProduct').value; toast('已关联产品', 'success'); }
    else if (action === 'qianchuan') {
      const id = byId('fvAssetQianchuanId').value.trim();
      if (!id) { byId('fvAssetError').textContent = '请输入千川素材 ID'; byId('fvAssetError').classList.add('error'); return; }
      const existing = video.ads?.[0];
      video.ads = [{ ...(existing || makeAds(1)[0]), id, name: existing?.name || `关联素材 ${id}` }];
      toast(existing ? '千川素材 ID 已更新' : '已关联千川素材 ID', 'success');
    }
    else if (action === 'info') {
      const product = byId('fvAssetProduct').value; const folder = byId('fvAssetFolder').value; const id = byId('fvAssetQianchuanId').value.trim();
      if (!product) { byId('fvAssetError').textContent = '请选择对应产品'; byId('fvAssetError').classList.add('error'); return; }
      if (!folder) { byId('fvAssetError').textContent = '请选择所属文件夹'; byId('fvAssetError').classList.add('error'); return; }
      const existing = video.ads?.[0];
      video.product = product; video.folder = folder;
      video.ads = id ? [{ ...(existing || makeAds(1)[0]), id, name: existing?.name || `关联素材 ${id}` }] : [];
      toast('视频信息已更新', 'success');
    }
    else if (action === 'move') { video.folder = byId('fvAssetFolder').value || 'pending'; toast('视频已移动', 'success'); }
    else if (action === 'delete') { videos.splice(videos.indexOf(video), 1); state.selected.delete(videoId); toast('视频已删除', 'success'); }
    const previewOpen = !byId('fvPreviewModal').hidden; const detailOpen = !byId('fvDetailView').hidden;
    closeModal('fvAssetModal'); renderAll();
    if (action === 'info' && detailOpen && state.currentVideo === videoId) {
      if (!video.ads?.length && video.status !== 'done') { byId('fvDetailView').hidden = true; byId('fvListView').hidden = false; openPreview(videoId); }
      else openDetail(videoId);
    } else if (action === 'info' && previewOpen && state.currentVideo === videoId) {
      if (video.ads?.length) { closeModal('fvPreviewModal'); openDetail(videoId); }
      else openPreview(videoId);
    }
  }

  function requestAnalyze(ids) {
    const targets = ids.map((id) => videos.find((item) => item.id === id)).filter(Boolean);
    if (!targets.length) { toast('请至少选择 1 个视频', 'warning'); return; }
    state.analyzeTargets = targets.map((item) => item.id);
    byId('fvAnalyzeTitle').textContent = targets.length > 1 ? '确认开始批量拆解？' : '确认开始拆解？';
    byId('fvAnalyzeQianchuan').hidden = !targets.some((video) => video.ads?.length);
    openModal('fvAnalyzeModal');
  }

  function startAnalyze() {
    const targets = state.analyzeTargets.map((id) => videos.find((item) => item.id === id)).filter(Boolean);
    if (!targets.length) return;
    closeModal('fvAnalyzeModal');
    targets.forEach((video) => { video.status = 'running'; });
    renderVideos(); toast('视频拆解已开始，可继续浏览页面');
    const detailTarget = targets.find((video) => video.id === state.currentVideo);
    if (detailTarget && !byId('fvDetailView').hidden) {
      byId('fvReanalyze').textContent = '拆解中';
      byId('fvReanalyze').disabled = true;
    }
    setTimeout(() => {
      const failed = []; const success = [];
      targets.forEach((video) => {
        if (video.id === 'mix-fail' && !video.retryReady) { video.status = 'failed'; video.retryReady = true; video.history = video.history || []; video.history.unshift({ time: nowText(), result: '失败', version: `V${video.history.length + 1}` }); failed.push(video); }
        else {
          video.status = 'done'; video.shots = video.shots || makeShots(); video.history = video.history || [];
          video.history.unshift({ time: nowText(), result: '成功', version: `V${video.history.length + 1}` }); success.push(video);
        }
      });
      renderAll(); cancelSelection();
      if (detailTarget && success.some((video) => video.id === detailTarget.id) && !byId('fvDetailView').hidden) openDetail(detailTarget.id);
      toast(`视频拆解完成：成功 ${success.length} 个${failed.length ? `，失败 ${failed.length} 个` : ''}`, failed.length ? 'warning' : 'success');
    }, 1100);
  }

  function openPreview(videoId) {
    const video = videos.find((item) => item.id === videoId); if (!video) return;
    state.currentVideo = videoId;
    const source = sourceMeta[video.source] || sourceMeta.local;
    byId('fvPreviewKicker').textContent = '成片预览';
    byId('fvPreviewTitle').textContent = video.name;
    byId('fvPreviewPosterName').textContent = video.name;
    byId('fvPreviewSourceTag').textContent = source.label; byId('fvPreviewSourceTag').className = `fv-tag ${source.className}`;
    byId('fvPreviewStatusTag').textContent = statusLabel(video.status); byId('fvPreviewStatusTag').className = `fv-preview-status-tag ${video.status}`;
    byId('fvPreviewQianchuanTag').textContent = video.ads?.length ? '已关联千川' : '未关联千川';
    byId('fvPreviewQianchuanId').textContent = video.ads?.[0]?.id || '未关联';
    byId('fvPreviewProduct').textContent = video.product || '未关联产品';
    byId('fvPreviewFolder').textContent = folderPath(video.folder).join(' / ');
    byId('fvPreviewFile').textContent = video.file;
    byId('fvPreviewDuration').textContent = `${formatTime(video.duration)} / ${video.size || 0} MB`;
    byId('fvPreviewCreated').textContent = `${auditMeta(video).creator} · ${auditTime(video.created, true)}`;
    byId('fvPreviewUpdated').textContent = `${auditMeta(video).updatedBy} · ${auditTime(auditMeta(video).updatedAt, true)}`;
    renderPreviewTags(video);
    const nativeVideo = byId('fvPreviewNative');
    if (video.url) { nativeVideo.src = video.url; nativeVideo.hidden = false; $('.fv-preview-poster', byId('fvPreviewVideo')).hidden = true; }
    else { nativeVideo.removeAttribute('src'); nativeVideo.hidden = true; $('.fv-preview-poster', byId('fvPreviewVideo')).hidden = false; }
    byId('fvPreviewDetail').hidden = video.status !== 'done';
    byId('fvPreviewAnalyze').hidden = video.status === 'done';
    byId('fvPreviewAnalyze').disabled = video.status === 'running';
    byId('fvPreviewAnalyze').textContent = video.status === 'running' ? '拆解中' : video.status === 'failed' ? '重新拆解' : '开始拆解';
    openModal('fvPreviewModal');
  }

  function renderPreviewTags(video) {
    const tags = video.tags || [];
    byId('fvPreviewTagList').innerHTML = tags.length
      ? tags.map((tag) => `<span class="fv-preview-video-tag">${escapeHtml(tag)}</span>`).join('')
      : '<span class="fv-preview-empty-tag">暂无视频标签</span>';
  }

  function openDetail(videoId) {
    const video = videos.find((item) => item.id === videoId); if (!video) return;
    const hasQianchuan = Boolean(video.ads?.length);
    const hasPullResult = video.status === 'done';
    if (!hasPullResult && !hasQianchuan) { openPreview(videoId); return; }
    if (pdaOverlayMode) document.body.classList.add('pda-detail-mode');
    state.currentVideo = videoId; state.currentAd = (video.ads || []).slice().sort((a, b) => b.spend - a.spend)[0]?.id || null;
    state.playTime = 0; state.playing = false; stopPlayback();
    byId('fvListView').hidden = true; byId('fvDetailView').hidden = false;
    byId('fvDetailTitle').textContent = video.name;
    byId('fvDetailFolderPath').textContent = `所属文件夹：${folderPath(video.folder).join(' / ')}`;
    byId('fvDetailCreated').textContent = `创建：${auditMeta(video).creator} · ${auditTime(video.created, true)}`;
    byId('fvDetailUpdated').textContent = `最近修改：${auditMeta(video).updatedBy} · ${auditTime(auditMeta(video).updatedAt, true)}`;
    const videoTags = video.tags || [];
    byId('fvDetailVideoTags').innerHTML = videoTags.length
      ? `<em>标签：</em>${videoTags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join('')}`
      : '<em>标签：暂无</em>';
    const source = sourceMeta[video.source] || sourceMeta.local;
    byId('fvDetailSourceTag').textContent = source.label;
    byId('fvDetailSourceTag').className = `fv-tag ${source.className}`;
    byId('fvDetailQianchuanTag').textContent = video.ads?.length ? '已关联千川' : '未关联千川';
    const activeAd = (video.ads || []).find((ad) => ad.id === state.currentAd) || video.ads?.[0];
    byId('fvAdMaterialId').textContent = activeAd ? `千川素材 ID：${activeAd.id}` : '';
    byId('fvDataAnalysisSection').hidden = !hasQianchuan;
    byId('fvAdSection').hidden = !hasQianchuan;
    byId('fvInteractionHead').hidden = !hasQianchuan;
    byId('fvChartPanel').hidden = !hasQianchuan;
    byId('fvPlayerAnalytics').classList.toggle('no-qianchuan', !hasQianchuan);
    byId('page-pull').hidden = !hasPullResult;
    byId('fvPullVideoBox').hidden = hasQianchuan || !hasPullResult;
    byId('fvPullSummaryHead').hidden = hasQianchuan || !hasPullResult;
    byId('page-pull').classList.toggle('fv-pull-no-qianchuan', !hasQianchuan);
    byId('fvReanalyze').textContent = video.status === 'running' ? '拆解中' : hasPullResult ? '重新拆解' : '开始拆解';
    byId('fvReanalyze').disabled = video.status === 'running';
    renderAds(video); renderPlayer(video); renderChart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeDetail() {
    stopPlayback(); byId('fvDetailView').hidden = true; byId('fvListView').hidden = false; state.currentVideo = null; document.body.classList.remove('pda-detail-mode'); renderAll(); setTimeout(notifyPdaOverlayIfIdle, 0);
  }

  function renderAds(video) {
    const stats = aggregateVideoData(video);
    const metrics = [
      ['消耗', `¥${stats.spend.toLocaleString()}`], ['整体成交金额', `¥${stats.gmv.toLocaleString()}`], ['广告 ROI', stats.roi], ['整体成交订单数', stats.orders.toLocaleString()],
      ['点击率', `${stats.ctr}%`], ['转化率', `${stats.cvr}%`], ['千展成本', `¥${stats.cpm}`], ['点击单价', `¥${stats.cpc}`]
    ];
    byId('fvAdGrid').innerHTML = metrics.map(([label, value]) => `<article class="fv-ad-stat-card"><span>${label}</span><strong>${value}</strong></article>`).join('');
  }

  function aggregateVideoData(video) {
    const records = video.ads || []; const periodFactor = selectedPeriodDays() / 7; const spendBase = records.reduce((sum, item) => sum + item.spend, 0); const spend = Math.round(spendBase * periodFactor); const orders = Math.round(records.reduce((sum, item) => sum + item.orders, 0) * periodFactor);
    const roi = spendBase ? records.reduce((sum, item) => sum + item.roi * item.spend, 0) / spendBase : 0;
    const ctr = records.length ? records.reduce((sum, item) => sum + item.ctr, 0) / records.length : 0;
    const cpc = Math.max(.1, 1.08 + records.length * .06); const clicks = Math.max(1, Math.round(spend / cpc));
    const cvr = orders / clicks * 100; const impressions = clicks / Math.max(ctr / 100, .001); const cpm = spend / impressions * 1000;
    return { spend, orders, gmv: Math.round(spend * roi), roi: roi.toFixed(2), ctr: ctr.toFixed(1), cvr: cvr.toFixed(1), cpm: cpm.toFixed(2), cpc: cpc.toFixed(2) };
  }

  function selectedPeriodDays() {
    const start = byId('fvRangeStart')?.value; const end = byId('fvRangeEnd')?.value;
    if (!start || !end) return 7;
    return Math.max(1, Math.min(90, Math.round((new Date(end) - new Date(start)) / 86400000) + 1));
  }

  function renderPlayer(video) {
    byId('fvPosterName').textContent = video.name; byId('fvPosterCode').textContent = video.code;
    byId('fvTotalTime').textContent = formatTime(video.duration); byId('fvCurrentTime').textContent = '00:00'; byId('fvVideoProgress').style.width = '0%';
    const native = byId('fvNativeVideo');
    if (video.url) { native.src = video.url; native.hidden = false; byId('fvVideoPoster').hidden = true; }
    else { native.removeAttribute('src'); native.hidden = true; byId('fvVideoPoster').hidden = false; }
    byId('fvPlayBtn').textContent = '▶';
    byId('fvPullVideoName').textContent = video.name;
    byId('fvPullSummaryTitle').textContent = video.file;
    byId('fvPullSummaryMeta').textContent = `视频时长 ${formatTime(video.duration)} · 拆解时间 ${video.history?.[0]?.time || video.created}`;
  }

  function currentVideo() { return videos.find((item) => item.id === state.currentVideo); }
  function currentAd() { return currentVideo()?.ads?.[0]; }

  function togglePlayback() {
    const video = currentVideo(); if (!video) return;
    if (!byId('fvNativeVideo').hidden) {
      const native = byId('fvNativeVideo'); native.paused ? native.play() : native.pause(); return;
    }
    state.playing = !state.playing; byId('fvPlayBtn').textContent = state.playing ? 'Ⅱ' : '▶';
    if (state.playing) state.timer = setInterval(() => { seekTo(state.playTime + 0.1); if (state.playTime >= video.duration) { state.playTime = 0; stopPlayback(); } }, 100);
    else stopPlayback(false);
  }

  function stopPlayback(resetIcon = true) {
    clearInterval(state.timer); state.timer = null; state.playing = false;
    if (resetIcon && byId('fvPlayBtn')) byId('fvPlayBtn').textContent = '▶';
  }

  function seekTo(seconds) {
    const video = currentVideo(); if (!video) return;
    state.playTime = Math.max(0, Math.min(video.duration, seconds));
    if (!byId('fvNativeVideo').hidden && Math.abs(byId('fvNativeVideo').currentTime - state.playTime) > .4) byId('fvNativeVideo').currentTime = state.playTime;
    byId('fvCurrentTime').textContent = formatTime(state.playTime); byId('fvVideoProgress').style.width = `${state.playTime / video.duration * 100}%`;
    updateLinkedStates();
  }

  function updateLinkedStates() {
    const video = currentVideo(); if (!video) return;
    $$('[data-shot]').forEach((row) => row.classList.toggle('active', state.playTime >= Number(row.dataset.start) && state.playTime < Number(row.dataset.end)));
    $$('[data-frame-start]').forEach((frame) => frame.classList.toggle('active', Math.abs(state.playTime - Number(frame.dataset.frameStart)) < 2));
    const cursor = $('.fv-chart-cursor', byId('fvChart')); if (cursor) cursor.setAttribute('x1', String(58 + (state.playTime / video.duration) * 837)), cursor.setAttribute('x2', String(58 + (state.playTime / video.duration) * 837));
  }

  const metricNames = { clicks: '整体点击次数', dropoffs: '整体流失数', likes: '整体点赞次数', comments: '整体评论次数', shares: '整体转发次数', follows: '整体新增粉丝数' };
  const metricScale = { clicks: 1, dropoffs: .58, likes: .34, comments: .18, shares: .13, follows: .11 };
  function chartValues(video, ad) {
    const points = Math.max(16, video.duration + 1); const periodFactor = Math.sqrt(selectedPeriodDays() / 7); const seed = Math.max(90, Math.min(760, (ad?.spend || 3600) / 22)) * periodFactor;
    const shape = [1, .36, .48, .42, .53, .39, .52, .50, .61, .46, .28, .19, .16, .20, .16, .21, .18, .19, .17, .12, .10, .08, .06, .08, .05, .07];
    return Array.from({ length: points }, (_, index) => {
      const ratio = shape[index] ?? Math.max(.018, .07 * Math.exp(-(index - 25) / 16) + Math.sin(index * .85) * .012);
      return Math.max(1, Math.round(seed * ratio * metricScale[state.metric]));
    });
  }

  function renderChart() {
    const video = currentVideo(); if (!video || !video.ads?.length) return;
    byId('fvMetricTabs').innerHTML = Object.entries(metricNames).map(([key, label]) => `<button class="${state.metric === key ? 'active' : ''}" type="button" data-metric="${key}">${label}</button>`).join('');
    const ad = currentAd(); const values = chartValues(video, ad); const peak = Math.max(...values); const yMax = Math.max(20, Math.ceil(peak / 100) * 100); const plotTop = 28; const plotBottom = 280;
    const points = values.map((value, index) => ({ x: 58 + index / (values.length - 1) * 837, y: plotBottom - value / yMax * (plotBottom - plotTop), value, time: index / (values.length - 1) * video.duration }));
    const line = points.map((point) => `${point.x},${point.y}`).join(' ');
    const area = `58,${plotBottom} ${line} 895,${plotBottom}`; const peakIndex = values.indexOf(peak); const peakPoint = points[peakIndex];
    const yTicks = Array.from({ length: 5 }, (_, index) => Math.round(yMax - index * yMax / 4));
    const xStep = video.duration <= 30 ? 5 : Math.ceil(video.duration / 10);
    const xTicks = Array.from({ length: Math.floor(video.duration / xStep) + 1 }, (_, index) => Math.min(video.duration, index * xStep));
    byId('fvChart').innerHTML = `<defs><linearGradient id="fvArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e73ee" stop-opacity=".2"/><stop offset="1" stop-color="#3e73ee" stop-opacity=".02"/></linearGradient></defs>
      ${yTicks.map((value, index) => { const y = plotTop + index * (plotBottom - plotTop) / 4; return `<line x1="58" y1="${y}" x2="895" y2="${y}" class="fv-chart-grid"/><text class="fv-chart-label y" x="48" y="${y + 4}" text-anchor="end">${value}</text>`; }).join('')}
      <polygon points="${area}" fill="url(#fvArea)"/><polyline points="${line}" class="fv-chart-line"/>
      ${points.map((point) => `<circle class="fv-chart-point" cx="${point.x}" cy="${point.y}" r="4" data-chart-time="${point.time}" data-chart-value="${point.value}"/>`).join('')}
      ${xTicks.map((second) => { const x = 58 + second / video.duration * 837; return `<text class="fv-chart-label" x="${x}" y="307" text-anchor="middle">${formatTime(second)}</text>`; }).join('')}
      <circle class="fv-peak-ring" cx="${peakPoint.x}" cy="${peakPoint.y}" r="9"/><text class="fv-peak-label" x="${Math.min(peakPoint.x + 8, 840)}" y="${Math.max(peakPoint.y - 13, 18)}">峰值 ${peak}</text>
      <line class="fv-chart-cursor" x1="58" y1="${plotTop}" x2="58" y2="${plotBottom}"/>`;
    byId('fvPeakInsight').innerHTML = `<span>i</span><p>${metricNames[state.metric]}峰值出现在第 ${Math.round(points[peakIndex].time)} 秒，该峰值画面可用于视频混剪或指导后续创意制作。</p>`;
    byId('fvChartState').hidden = true;
  }

  function applyCustomRange() {
    const start = byId('fvRangeStart').value; const end = byId('fvRangeEnd').value; const error = byId('fvRangeError');
    if (!start || !end) { error.textContent = '请选择开始和结束日期'; return; }
    const days = (new Date(end) - new Date(start)) / 86400000 + 1;
    if (days <= 0) { error.textContent = '结束日期不能早于开始日期'; return; }
    if (days > 90) { error.textContent = '自定义范围最多 90 天'; return; }
    error.textContent = ''; state.range = `${start}~${end}`; renderAds(currentVideo()); renderChart();
  }

  async function copyText(text, success = '已复制') {
    try { await navigator.clipboard.writeText(text); toast(success, 'success'); }
    catch { const area = document.createElement('textarea'); area.value = text; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); toast(success, 'success'); }
  }

  async function copyFrame(frameId) {
    const video = currentVideo(); const shot = video?.shots?.find((item) => item.id === Number(frameId)); if (!shot) return;
    const canvas = document.createElement('canvas'); canvas.width = 540; canvas.height = 960; const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 540, 960); gradient.addColorStop(0, '#34294c'); gradient.addColorStop(1, '#8e70c1'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 540, 960);
    ctx.fillStyle = '#fff'; ctx.font = '700 34px sans-serif'; ctx.fillText(`画面 ${String(shot.id).padStart(2, '0')}`, 48, 90); ctx.font = '24px sans-serif';
    const lines = shot.visual.match(/.{1,15}/g) || []; lines.slice(0, 5).forEach((line, index) => ctx.fillText(line, 48, 690 + index * 38));
    canvas.toBlob(async (blob) => {
      try { if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); toast('这一帧已复制为图片', 'success'); }
        else { const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = `${video.name}-画面${shot.id}.png`; anchor.click(); toast('浏览器不支持图片剪贴板，已下载该帧'); } }
      catch { toast('复制失败，请重试', 'warning'); }
    }, 'image/png');
  }

  function showHistory() {
    const video = currentVideo(); if (!video) return;
    byId('fvHistoryTitle').textContent = `${video.name} · 分析历史`;
    byId('fvHistoryList').innerHTML = (video.history || []).length ? video.history.map((item, index) => `<div class="fv-history-row"><span>${item.version}</span><div><b>${item.result}</b><small>${item.time}</small></div>${index === 0 ? '<em>当前版本</em>' : ''}</div>`).join('') : '<div class="fv-confirm-note">暂无历史分析记录</div>';
    openModal('fvHistoryModal');
  }

  function downloadAnalysis() {
    const video = currentVideo(); if (!video) return;
    const payload = { 视频名称: video.name, 文件名: video.file, 生成时间: nowText(), 千川素材: video.ads || [], 分镜分析: video.shots || [] };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }); const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob); anchor.download = `${video.name}-拆解结果.json`; anchor.click(); URL.revokeObjectURL(anchor.href); toast('拆解结果已下载', 'success');
  }

  function showTooltip(target, message) {
    const tip = byId('fvTooltip'); const rect = target.getBoundingClientRect(); tip.textContent = message; tip.style.left = `${rect.left}px`; tip.style.top = `${rect.bottom + 6}px`; tip.hidden = false;
  }

  function handleFolderAction(action, id) {
    hideMenu();
    if (action === 'child') openFolderEditor('create-child', id);
    if (action === 'rename') openFolderEditor('rename', id);
    if (action === 'move') openFolderEditor('move', id);
    if (action === 'delete') requestDeleteFolder(id);
  }

  function handleVideoAction(action, id) {
    hideMenu(); const video = videos.find((item) => item.id === id); if (!video) return;
    if (action === 'download') downloadVideo(video);
    else if (action === 'analyze') requestAnalyze([id]);
    else if (action === 'tag') openTagModal('edit', [id]);
    else openAssetAction(action, id);
  }

  let searchTimer;
  document.addEventListener('input', (event) => {
    if (event.target.id === 'fvImportFileName') byId('fvImportNameError').textContent = '';
    if (event.target.id === 'fvSearch') { clearTimeout(searchTimer); state.search = event.target.value; searchTimer = setTimeout(renderVideos, 300); }
    if (event.target.id === 'fvTagSearch') renderTagModal();
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'fvImportFile') receiveImportFile(event.target.files[0]);
    if (event.target.id === 'fvImportProduct') byId('fvImportProductError').textContent = '';
    if (event.target.name === 'folderMigration') byId('fvDeleteFolderTarget').disabled = event.target.value !== 'custom';
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, article[data-video-id], [data-preview-area], [data-detail-area], circle[data-chart-time], .fv-video-progress');
    if (!target) { hideMenu(); byId('fvStatusDropdown').hidden = true; byId('fvQcDropdown').hidden = true; byId('fvSortDropdown').hidden = true; return; }
    if (target.dataset.closeModal) { closeModal(target.dataset.closeModal); return; }
    if (target.dataset.folderSelect) { selectFolder(target.dataset.folderSelect); return; }
    if (target.dataset.folderToggle) { const id = target.dataset.folderToggle; state.expanded.has(id) ? state.expanded.delete(id) : state.expanded.add(id); renderFolderTree(); return; }
    if (target.dataset.folderMore) { event.stopPropagation(); showFolderMenu(target, target.dataset.folderMore); return; }
    if (target.dataset.folderAction) { handleFolderAction(target.dataset.folderAction, target.dataset.id); return; }
    if (target.dataset.videoAction) { handleVideoAction(target.dataset.videoAction, target.dataset.id); return; }
    if (target.dataset.unlinkQianchuan) {
      const video = videos.find((item) => item.id === state.assetAction?.videoId);
      if (!video) return;
      const previewOpen = !byId('fvPreviewModal').hidden; const detailOpen = !byId('fvDetailView').hidden;
      video.ads = []; closeModal('fvAssetModal'); state.assetAction = null; renderAll();
      if (detailOpen && state.currentVideo === video.id) {
        if (video.status !== 'done') { byId('fvDetailView').hidden = true; byId('fvListView').hidden = false; openPreview(video.id); }
        else openDetail(video.id);
      } else if (previewOpen && state.currentVideo === video.id) openPreview(video.id);
      toast('已解除千川素材 ID 关联', 'success'); return;
    }
    if (target.dataset.videoMore) { event.stopPropagation(); showVideoMenu(target, target.dataset.videoMore); return; }
    if (target.dataset.tagGroup) { state.tagGroup = target.dataset.tagGroup; renderTagModal(); return; }
    if (target.dataset.tagOption) { const tag = target.dataset.tagOption; state.tagModal.draft.has(tag) ? state.tagModal.draft.delete(tag) : state.tagModal.draft.add(tag); renderTagModal(); return; }
    if (target.dataset.status) { state.status = target.dataset.status; byId('fvStatusFilterText').textContent = target.textContent; $$('[data-status]', byId('fvStatusDropdown')).forEach((button) => button.classList.toggle('active', button.dataset.status === state.status)); byId('fvStatusDropdown').hidden = true; renderVideos(); return; }
    if (target.dataset.qc) { state.qianchuan = target.dataset.qc; byId('fvQcFilterText').textContent = target.textContent; $$('[data-qc]', byId('fvQcDropdown')).forEach((button) => button.classList.toggle('active', button.dataset.qc === state.qianchuan)); byId('fvQcDropdown').hidden = true; renderVideos(); return; }
    if (target.dataset.sort) { state.sort = target.dataset.sort; byId('fvSortDropdown').hidden = true; renderVideos(); toast(`已按「${target.textContent}」排序`, 'success'); return; }
    if (target.dataset.selectVideo) { event.stopPropagation(); toggleSelection(target.dataset.selectVideo); return; }
    if (target.dataset.previewArea) { openPreview(target.dataset.previewArea); return; }
    if (target.dataset.detailArea) { openDetail(target.dataset.detailArea); return; }
    if (target.dataset.preview) { event.stopPropagation(); openPreview(target.dataset.preview); return; }
    if (target.dataset.metric) { state.metric = target.dataset.metric; renderChart(); return; }
    if (target.dataset.seek) { seekTo(Number(target.dataset.seek)); return; }
    if (target.dataset.copyFrame) { event.stopPropagation(); copyFrame(target.dataset.copyFrame); return; }
    if (target.dataset.pullCopy) {
      const sourceId = { voice: 'fvPullVoiceText', script: 'fvPullScriptText', visual: 'fvPullVisualText' }[target.dataset.pullCopy];
      copyText(byId(sourceId)?.innerText || '', '内容已复制'); return;
    }
    if (target.dataset.chartTime) { seekTo(Number(target.dataset.chartTime)); return; }
    if (target.dataset.videoId) {
      const id = target.dataset.videoId;
      const video = videos.find((v) => v.id === id);
      hideMenu();
      openDetail(id);
      return;
    }
  });

  byId('fvNewRootFolder').addEventListener('click', () => openFolderEditor('create-root'));
  byId('fvSaveFolder').addEventListener('click', saveFolder);
  byId('fvConfirmDeleteFolder').addEventListener('click', confirmDeleteFolder);
  byId('fvImportBtn').addEventListener('click', openImport);
  byId('fvConfirmImport').addEventListener('click', confirmImport);
  byId('fvImportAddTag').addEventListener('click', () => openTagModal('import'));
  const importDrop = byId('fvImportDrop');
  ['dragenter', 'dragover'].forEach((eventName) => importDrop.addEventListener(eventName, (event) => {
    event.preventDefault(); event.stopPropagation(); importDrop.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach((eventName) => importDrop.addEventListener(eventName, (event) => {
    event.preventDefault(); event.stopPropagation(); importDrop.classList.remove('is-dragging');
  }));
  importDrop.addEventListener('drop', (event) => receiveImportFile(event.dataTransfer?.files?.[0]));
  byId('fvCancelSelection').addEventListener('click', cancelSelection);
  byId('fvTagFilterBtn').addEventListener('click', () => openTagModal('filter'));
  byId('fvShowNewTag').addEventListener('click', () => { byId('fvTagCreateRow').hidden = !byId('fvTagCreateRow').hidden; if (!byId('fvTagCreateRow').hidden) byId('fvNewTagName').focus(); });
  byId('fvNewTagGroup').addEventListener('click', createTagGroup);
  byId('fvCreateTag').addEventListener('click', createTag);
  byId('fvClearTag').addEventListener('click', () => { if (!state.tagModal) return; state.tagModal.draft.clear(); renderTagModal(); });
  byId('fvConfirmTag').addEventListener('click', confirmTagModal);
  byId('fvConfirmBatchEdit').addEventListener('click', confirmBatchEdit);
  byId('fvStatusFilter').addEventListener('click', () => { $$('[data-status]', byId('fvStatusDropdown')).forEach((button) => button.classList.toggle('active', button.dataset.status === state.status)); byId('fvStatusDropdown').hidden = !byId('fvStatusDropdown').hidden; byId('fvQcDropdown').hidden = true; byId('fvSortDropdown').hidden = true; });
  byId('fvQcFilter').addEventListener('click', () => { $$('[data-qc]', byId('fvQcDropdown')).forEach((button) => button.classList.toggle('active', button.dataset.qc === state.qianchuan)); byId('fvQcDropdown').hidden = !byId('fvQcDropdown').hidden; byId('fvStatusDropdown').hidden = true; byId('fvSortDropdown').hidden = true; });
  byId('fvSortBtn').addEventListener('click', () => { byId('fvSortDropdown').hidden = !byId('fvSortDropdown').hidden; byId('fvStatusDropdown').hidden = true; byId('fvQcDropdown').hidden = true; });
  byId('fvRefreshBtn').addEventListener('click', () => { renderAll(); toast('列表已刷新', 'success'); });

  // 批量操作栏(底栏) — 数据批量动作
  byId('fvSelectionBar').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-batch]');
    if (!btn) return;
    const action = btn.dataset.batch;
    const targets = [...state.selected].map((id) => videos.find((v) => v.id === id)).filter(Boolean);
    if (!targets.length) { toast('请先选择视频', 'warning'); return; }
    if (action === 'download') { targets.forEach(downloadVideo); }
    else if (action === 'tag') { openTagModal('assign', targets.map((video) => video.id)); }
    else if (action === 'product' || action === 'move' || action === 'delete') { openBatchEdit(action); }
    else if (action === 'analyze') { requestAnalyze([...state.selected]); }
  });
  byId('fvStartAnalyze').addEventListener('click', startAnalyze);
  byId('fvAssetModalConfirm').addEventListener('click', confirmAssetAction);
  byId('fvClearSearch').addEventListener('click', () => { state.search = ''; byId('fvSearch').value = ''; renderVideos(); });
  byId('fvResetFilters').addEventListener('click', () => { state.search = ''; state.source = 'all'; state.status = 'all'; state.qianchuan = 'all'; state.tags.clear(); byId('fvSearch').value = ''; byId('fvStatusFilterText').textContent = '全部状态'; byId('fvQcFilterText').textContent = '全部关联'; $$('.fv-source-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.value === 'all')); renderVideos(); });
  byId('fvBackToList').addEventListener('click', closeDetail);
  byId('fvEditDetailInfo').addEventListener('click', () => { if (state.currentVideo) openAssetAction('info', state.currentVideo); });
  [byId('fvPreviewHistory'), byId('fvDetailHistory')].forEach(button => button?.addEventListener('click', () => {
    const video = videos.find(item => item.id === state.currentVideo); if (video) openAssetHistory(video);
  }));
  byId('fvPlayBtn').addEventListener('click', togglePlayback);
  byId('fvReanalyze').addEventListener('click', () => requestAnalyze([state.currentVideo]));
  ['fvRangeStart', 'fvRangeEnd'].forEach((id) => byId(id).addEventListener('change', applyCustomRange));
  byId('fvPullDownload').addEventListener('click', downloadAnalysis);
  byId('fvPullPreview').addEventListener('click', () => { if (state.currentVideo) openPreview(state.currentVideo); });
  byId('fvPreviewDetail').addEventListener('click', () => { const id = state.currentVideo; closeModal('fvPreviewModal'); openDetail(id); });
  byId('fvPreviewAnalyze').addEventListener('click', () => { const id = state.currentVideo; if (!id) return; closeModal('fvPreviewModal'); requestAnalyze([id]); });
  byId('fvPreviewDownload').addEventListener('click', () => downloadVideo(videos.find((item) => item.id === state.currentVideo)));
  byId('fvPreviewAddTag').addEventListener('click', () => { if (state.currentVideo) openTagModal('assign', [state.currentVideo]); });
  byId('fvPreviewEditInfo').addEventListener('click', () => { if (state.currentVideo) openAssetAction('info', state.currentVideo); });

  byId('fvSourceFilter').addEventListener('click', (event) => { const button = event.target.closest('button[data-value]'); if (!button) return; state.source = button.dataset.value; $$('button', byId('fvSourceFilter')).forEach((item) => item.classList.toggle('active', item === button)); renderVideos(); });

  byId('fvNativeVideo').addEventListener('timeupdate', (event) => { state.playTime = event.target.currentTime; byId('fvPlayBtn').textContent = event.target.paused ? '▶' : 'Ⅱ'; seekTo(state.playTime); });
  byId('fvNativeVideo').addEventListener('ended', () => { byId('fvPlayBtn').textContent = '▶'; });
  byId('fvVideoShell').addEventListener('click', (event) => { if (event.target.closest('button') || event.target.closest('.fv-video-progress')) return; togglePlayback(); });
  $('.fv-video-progress').addEventListener('click', (event) => { const video = currentVideo(); const rect = event.currentTarget.getBoundingClientRect(); seekTo((event.clientX - rect.left) / rect.width * video.duration); });

  byId('fvChart').addEventListener('mousemove', (event) => {
    const point = event.target.closest('circle[data-chart-time]'); const tooltip = byId('fvChartTooltip');
    if (!point) { tooltip.hidden = true; return; }
    const rect = byId('fvChartWrap').getBoundingClientRect(); tooltip.innerHTML = `<b>${formatTime(Number(point.dataset.chartTime))}</b><span>${metricNames[state.metric]} ${point.dataset.chartValue}</span>`; tooltip.style.left = `${event.clientX - rect.left + 8}px`; tooltip.style.top = `${event.clientY - rect.top - 48}px`; tooltip.hidden = false;
  });
  byId('fvChart').addEventListener('mouseleave', () => { byId('fvChartTooltip').hidden = true; });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { hideMenu(); const modal = $$('.fv-modal-backdrop.show').pop(); if (modal) closeModal(modal.id); }
    if (event.key === 'Enter' && event.target.matches('#fvFolderName')) saveFolder();
    if ((event.key === 'Enter' || event.key === ' ') && event.target.dataset.previewArea) { event.preventDefault(); openPreview(event.target.dataset.previewArea); }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.dataset.detailArea) { event.preventDefault(); openDetail(event.target.dataset.detailArea); }
  });
  $$('.fv-modal-backdrop').forEach((modal) => modal.addEventListener('mousedown', (event) => { if (event.target === modal) closeModal(modal.id); }));

  // 产品详情页只传递资产与动作，预览、详情、菜单均复用本页现有实现。
  window.addEventListener('message', (event) => {
    const request = event.data;
    if (event.source !== window.parent || request?.kind !== 'video') return;
    if (request.type === 'pda-library-overlay-cancel') {
      pdaOverlayMode = false;
      pdaOverlayAssetId = null;
      pdaOverlayRequestId = null;
      document.documentElement.classList.remove('pda-overlay-mode');
      document.body.classList.remove('pda-overlay-mode','pda-detail-mode','fv-modal-open');
      byId('fvCardMenu').hidden = true;
      $$('.fv-modal-backdrop').forEach((modal) => { modal.classList.remove('show'); modal.hidden = true; });
      byId('fvDetailView').hidden = true;
      byId('fvListView').hidden = false;
      state.currentVideo = null;
      state.menuVideo = null;
      stopPlayback();
      return;
    }
    if (request.type !== 'pda-open-library-asset') return;
    pdaOverlayMode = Boolean(request.overlay);
    pdaOverlayRequestId = request.requestId || null;
    document.documentElement.classList.toggle('pda-overlay-mode', pdaOverlayMode);
    document.body.classList.toggle('pda-overlay-mode', pdaOverlayMode);
    document.body.classList.remove('pda-detail-mode');
    const video = videos.find((item) => String(item.id) === String(request.id))
      || videos.find((item) => item.file === request.file || item.name === request.name);
    if (!video) { toast('未找到对应成片视频', 'warning'); notifyPdaOverlayIfIdle(); return; }
    pdaOverlayAssetId = video.id;
    state.folder = 'all'; state.source = 'all'; state.status = 'all'; state.qianchuan = 'all'; state.tags.clear(); state.search = '';
    byId('fvSearch').value = '';
    byId('fvStatusFilterText').textContent = '全部状态';
    byId('fvQcFilterText').textContent = '全部关联';
    $$('.fv-source-tabs button').forEach((button) => button.classList.toggle('active', button.dataset.value === 'all'));
    byId('fvListView').hidden = false; byId('fvDetailView').hidden = true;
    renderAll();
    if (request.intent === 'preview') openPreview(video.id);
    else if (request.intent === 'detail') openDetail(video.id);
    else if (request.intent === 'menu') {
      const anchor = request.anchor || { left:40, right:180, top:40, bottom:80 };
      showVideoMenu({ getBoundingClientRect:() => anchor }, video.id);
    }
    window.parent.postMessage({ type:'pda-library-overlay-ready', requestId:pdaOverlayRequestId, kind:'video' }, '*');
  });

  renderAll();
})();


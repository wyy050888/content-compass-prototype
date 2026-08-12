(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const state = {
    platform: 'all', status: 'all', search: '', sort: 'new', selected: new Set(), tagFilter: new Set(), importTags: [], importPlatforms: ['douyin', 'kuaishou', 'channels', 'xiaohongshu', 'other'], importPlatformNames: {douyin:'抖音',kuaishou:'快手',channels:'视频号',xiaohongshu:'小红书',other:'其他'},
    products: [{id:'mite-pro',name:'轻净 Pro 除螨仪'},{id:'air-a8',name:'轻享空气炸锅 A8'},{id:'washer-s5',name:'净界洗地机 S5'},{id:'blend-mini',name:'随行榨汁杯 Mini'}],
    tags: ['新品种草', '品牌心智', '场景演示', '痛点钩子', '效果证明', '结果直给'],
    tagGroups: [{id:'all',name:'全部标签'},{id:'ungrouped',name:'未分组'},{id:'product',name:'产品标签'},{id:'scene',name:'场景标签'},{id:'content',name:'内容标签'}],
    tagGroupMap: {'新品种草':'ungrouped','品牌心智':'product','场景演示':'scene','痛点钩子':'content','效果证明':'content','结果直给':'content'},
    videos: [
      {id:'rv1', title:'除螨仪结果型钩子参考', productId:'mite-pro', platform:'douyin', source:'采集', state:'done', duration:30, created:8, uploadedAt:'08/10 13:24:06', tags:['结果直给','痛点钩子'], size:'42 MB', version:2},
      {id:'rv2', title:'空气炸锅省时场景参考', productId:'air-a8', platform:'kuaishou', source:'本地', state:'pending', duration:22, created:7, uploadedAt:'08/09 16:05:18', tags:['场景演示'], size:'118 MB', version:0},
      {id:'rv3', title:'床垫深层清洁过程参考', productId:'mite-pro', platform:'douyin', source:'采集', state:'running', duration:31, created:6, uploadedAt:'08/08 10:36:42', tags:['效果证明'], size:'—', version:1},
      {id:'rv4', title:'小家电痛点开场参考', productId:'', platform:'xiaohongshu', source:'采集', state:'failed', duration:18, created:5, uploadedAt:'08/07 09:18:55', tags:['痛点钩子'], size:'—', version:1},
      {id:'rv5', title:'厨房收纳三步演示', productId:'air-a8', platform:'channels', source:'本地', state:'done', duration:46, created:4, uploadedAt:'08/06 14:42:21', tags:['场景演示','新品种草'], size:'86 MB', version:1},
      {id:'rv6', title:'清洁工具效果对比参考', productId:'washer-s5', platform:'douyin', source:'采集', state:'pending', duration:15, created:3, uploadedAt:'08/05 11:03:09', tags:['结果直给','效果证明'], size:'—', version:0}
    ]
  };
  window.ContentCompassExternalVideoCatalog = { videos: state.videos, products: state.products };
  function publishExternalVideoCatalog() {
    window.parent?.postMessage({
      type: 'content-compass-video-catalog',
      source: 'external',
      items: { videos: state.videos, products: state.products }
    }, '*');
  }
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'content-compass-video-catalog-request') publishExternalVideoCatalog();
  });
  publishExternalVideoCatalog();
  const names = {douyin:'抖音',kuaishou:'快手',channels:'视频号',xiaohongshu:'小红书',other:'其他'};
  const states = {pending:'待分析',running:'分析中',done:'已分析',failed:'分析失败'};
  const icons = {download:'⇩',tag:'◇',analyze:'✦'};
  let pdaOverlayMode=false,pdaOverlayAssetId=null,pdaOverlayRequestId=null,pdaOverlayChain=false,pdaCloseNotified=false;
  const nowStamp = () => { const d=new Date();return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` };
  const auditTime = (value, detailed = false) => {
    const match = String(value || '').match(/(?:(\d{4})\/)?(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/); if (!match) return value || '—';
    const [, year, month, day, hour, minute, second = '00'] = match;
    return `${year && Number(year) !== 2026 ? `${year}/` : ''}${month}/${day} ${hour}:${minute}${detailed ? `:${second}` : ''}`;
  };
  const auditMeta = video => ({ uploader: video.uploader || '嗡大发', updatedBy: video.updatedBy || '嗡大发', updatedAt: video.updatedAt || video.uploadedAt });
  function openReferenceHistory(v) {
    const audit = auditMeta(v);
    const node = showOverlay(`<header class="rv-modal-head"><div><small>修改记录</small><h2>“${v.title}”修改记录</h2><p class="rv-field-hint">上传：${audit.uploader} · ${auditTime(v.uploadedAt,true)}　｜　最近修改：${audit.updatedBy} · ${auditTime(audit.updatedAt,true)}</p></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><div class="rv-history-list"><article><div><b>视频标签</b><span>${audit.updatedBy} · ${auditTime(audit.updatedAt,true)}</span></div><p><em>未设置</em><i>→</i><strong>${(v.tags||[]).join('、') || '暂无标签'}</strong></p></article><article><div><b>关联产品</b><span>${audit.uploader} · ${auditTime(v.uploadedAt,true)}</span></div><p><em>未关联产品</em><i>→</i><strong>${productName(v.productId)||'未关联产品'}</strong></p></article></div></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-primary" data-close>确定</button></footer>`);
    $$('[data-close]', node).forEach(button => button.onclick = () => closeOverlay(node));
  }
  let toastTimer;
  function toast(text){const e=$('#rvToast');e.textContent=text;e.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.hidden=true,2800)}
  function closeMenus(){ $$('.rv-pop-menu').forEach(e=>e.hidden=true) }
  function openMenu(button,menu){const next=menu.hidden;closeMenus();menu.hidden=!next}
  function productName(id){return state.products.find(item=>item.id===id)?.name||''}
  function productOptions(current='',includeEmpty=true){return `${includeEmpty?'<option value="">未关联产品</option>':''}${state.products.map(item=>`<option value="${item.id}"${item.id===current?' selected':''}>${item.name}</option>`).join('')}`}
  function filtered(){
    const lower=state.search.trim().toLowerCase();
    const out=state.videos.filter(v => (state.platform==='all'||v.platform===state.platform) && (state.status==='all'||v.state===state.status) && (!lower || `${v.title} ${productName(v.productId)} ${(v.tags||[]).join(' ')}`.toLowerCase().includes(lower)) && [...state.tagFilter].every(t=>v.tags.includes(t)));
    return out.sort((a,b)=> state.sort==='old'?a.created-b.created : state.sort==='name'?a.title.localeCompare(b.title,'zh-CN') : state.sort==='duration-desc'?b.duration-a.duration : state.sort==='duration-asc'?a.duration-b.duration : b.created-a.created);
  }
  function card(v){ const selected=state.selected.has(v.id),relation=productName(v.productId),sourceClass=v.source==='本地'?'local':'collect',audit=auditMeta(v);return `<article class="rv-card ${selected?'selected':''}" data-id="${v.id}"><div class="rv-cover" data-preview><span class="rv-state ${v.state}"><i></i>${states[v.state]}</span><button class="rv-select" data-select aria-label="选择视频" aria-pressed="${selected}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></button><span class="rv-play">▶</span><span class="rv-cover-source ${sourceClass}">${v.source}</span><span class="rv-duration">00:${String(v.duration).padStart(2,'0')}</span></div><div class="rv-info" data-detail><div class="rv-title" title="${v.title}">${v.title}</div><div class="rv-product-platform-row"><span class="rv-card-tag product ${relation?'':'empty'}" title="${relation||'未关联产品'}">${relation||'未关联产品'}</span><span class="rv-card-tag platform">${names[v.platform]}</span></div><div class="rv-meta" title="最近修改：${audit.updatedBy} · ${auditTime(audit.updatedAt,true)}">${audit.updatedBy} · ${auditTime(audit.updatedAt)}</div><button class="rv-card-more" data-more aria-label="更多操作">⋯</button></div><div class="rv-card-menu" hidden><button data-action="download">下载</button><button data-action="analyze" ${v.state==='done'?'disabled aria-disabled="true" title="视频已分析，无需重复分析"':''}>分析</button><i class="rv-menu-divider"></i><button data-action="rename">重命名</button><button data-action="tag">编辑标签</button><button data-action="product">${relation?'更换关联产品':'关联产品'}</button><i class="rv-menu-divider"></i><button data-action="delete" class="danger">删除</button></div></article>`}
  function render(){ const list=filtered();$('#rvGrid').innerHTML=list.map(card).join('');$('#rvEmpty').hidden=!!list.length;renderSelection();$('#rvPlatformText').textContent=state.platform==='all'?'全部平台':names[state.platform];$('#rvStatusText').textContent=state.status==='all'?'全部状态':states[state.status];$('#rvSearchClear').hidden=!state.search }
  function renderSelection(){const n=state.selected.size;$('#rvSelection').hidden=!n;$('#rvSelected').textContent=n}
  function video(id){return state.videos.find(v=>v.id===id)}
  function showOverlay(content){
    // 弹窗栈：每层单独一个 .rv-overlay，关闭时只移除最顶层，外层不受影响
    const stack = $('#rvOverlays');
    const node = document.createElement('div');
    node.className = 'rv-overlay';
    node.innerHTML = `<section class="rv-modal">${content}</section>`;
    node.addEventListener('click', e => { if (e.target === node) closeOverlay(); });
    stack.appendChild(node);
    if(pdaOverlayMode)pdaCloseNotified=false;
    return node;
  }
  function notifyPdaOverlayIfIdle(){
    if(!pdaOverlayMode)return;
    if(pdaOverlayChain)return;
    const active=$('#rvOverlays')?.children.length||!$('#rvDetailPage')?.hidden||$$('.rv-card-menu').some(menu=>!menu.hidden);
    if(active){pdaCloseNotified=false;return}
    if(pdaCloseNotified)return;
    const asset=video(pdaOverlayAssetId);
    pdaCloseNotified=true;
    window.parent.postMessage({type:'pda-library-overlay-close',requestId:pdaOverlayRequestId,kind:'reference',assetId:pdaOverlayAssetId,deleted:!asset,asset:asset?{id:asset.id,name:asset.title,productId:asset.productId||'',product:productName(asset.productId),platform:asset.platform,source:asset.source,status:asset.state,duration:asset.duration,created:asset.uploadedAt,tags:[...(asset.tags||[])]}:null},'*');
  }
  function closeOverlay(target){
    const stack = $('#rvOverlays');
    if (!stack) return;
    const last = target || stack.lastElementChild;
    if (last) last.remove();
    if (!stack.children.length) pdaOverlayChain=false;
    setTimeout(notifyPdaOverlayIfIdle,0);
  }
  function closeAllOverlays(silent=false){
    const stack = $('#rvOverlays');
    if (stack) stack.innerHTML = '';
    pdaOverlayChain=false;
    if(!silent)setTimeout(notifyPdaOverlayIfIdle,0);
  }
  function pill(v){return `<span class="rv-pill source">${v.source}</span><span class="rv-pill ${v.state}">${states[v.state]}</span>`}
  function tagPicker(selected=[], group='all', keyword=''){const list=state.tags.filter(t=>(group==='all'||state.tagGroupMap[t]===group)&&t.includes(keyword));return `<div class="rv-tag-picker">${list.map(t=>`<button type="button" class="${selected.includes(t)?'selected':''}" data-tag-pick="${t}">${t}</button>`).join('')||'<span class="rv-empty-inline">该分组下还没有标签</span>'}</div>`}
  function bindTagPicker(root, selected){$$('[data-tag-pick]',root).forEach(b=>b.onclick=()=>{const tag=b.dataset.tagPick;selected.includes(tag)?selected.splice(selected.indexOf(tag),1):selected.push(tag);b.classList.toggle('selected',selected.includes(tag))})}
  function platformLabel(id){return state.importPlatformNames[id]||names[id]||id}
  function previewTags(v){return (v.tags||[]).length?(v.tags||[]).map(t=>`<span class="rv-tag">${t}</span>`).join(''):'<span class="rv-pill">暂无标签</span>'}
  function previewFooter(v){return `${v.state==='done'?'<button class="rv-btn rv-btn-secondary" data-view-result>查看拉片结果</button>':`<button class="rv-btn rv-btn-secondary" data-analyze="${v.id}" ${v.state==='running'?'disabled':''}>${v.state==='running'?'分析中':v.state==='failed'?'重新分析':'开始分析'}</button>`}<button class="rv-btn rv-btn-primary" data-download="${v.id}">下载视频</button>`}
  function refreshPreview(root,v){
    $('[data-preview-title]',root).textContent=v.title;$('[data-preview-name]',root).textContent=v.title;$('[data-preview-source]',root).textContent=v.source;
    const status=$('[data-preview-status]',root);status.textContent=states[v.state];status.className=`rv-pill ${v.state}`;
    $$('[data-preview-platform]',root).forEach(el=>el.textContent=platformLabel(v.platform));$('[data-preview-product]',root).textContent=productName(v.productId)||'未关联产品';$('[data-preview-tags]',root).innerHTML=previewTags(v);
    $('.rv-modal-foot',root).innerHTML=previewFooter(v);bindModal(v,root);
  }
  function preview(v){
    const audit=auditMeta(v); const node=showOverlay(`<header class="rv-modal-head"><div><small>参考视频预览</small><h2 data-preview-title>${v.title}</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body rv-preview-body"><div class="rv-preview-video"><span class="rv-play">▶</span></div><div class="rv-info-panel"><div class="rv-info-panel-head"><div class="rv-pills"><span class="rv-pill source" data-preview-source>${v.source}</span><span class="rv-pill ${v.state}" data-preview-status>${states[v.state]}</span><span class="rv-pill" data-preview-platform>${platformLabel(v.platform)}</span></div><div><button class="rv-edit-pill" data-history type="button">查看变更</button><button class="rv-edit-pill" data-edit-info type="button">编辑</button></div></div><div class="rv-kv"><div><span>视频名称</span><b data-preview-name>${v.title}</b></div><div><span>关联产品</span><b class="rv-relation-value" data-preview-product>${productName(v.productId)||'未关联产品'}</b></div><div><span>时长 / 大小</span><b>00:${String(v.duration).padStart(2,'0')} / ${v.size}</b></div><div><span>上传</span><b>${audit.uploader} · ${auditTime(v.uploadedAt,true)}</b></div><div><span>最近修改</span><b>${audit.updatedBy} · ${auditTime(audit.updatedAt,true)}</b></div></div><section class="rv-tag-section"><div><span>视频标签</span><button class="rv-link-btn" data-edit-tags>＋ 添加标签</button></div><div class="rv-tags" data-preview-tags>${previewTags(v)}</div></section></div></div><footer class="rv-modal-foot">${previewFooter(v)}</footer>`);bindModal(v,node);
  }
  function editPreviewInfo(v,parent){
    const node=showOverlay(`<header class="rv-modal-head"><div><small>视频操作</small><h2>编辑参考视频</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><div class="rv-form-grid"><label class="rv-field full"><span>视频名称 <b>*</b></span><input id="rvPvEditName" maxlength="60" value="${(v.title||'').replace(/"/g,'&quot;')}"><small class="rv-error" id="rvPvEditError"></small></label><label class="rv-field"><span>来源平台</span><div class="rv-import-platform"><select id="rvPvEditPlatform" class="rv-platform-select">${state.importPlatforms.map(p=>`<option value="${p}"${p===v.platform?' selected':''}>${platformLabel(p)}</option>`).join('')}</select><button type="button" class="rv-platform-add-btn" data-add-platform>＋ 新增</button></div></label><label class="rv-field"><span>关联产品 <em>选填</em></span><select id="rvPvEditProduct">${productOptions(v.productId)}</select></label></div></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" data-save-info>保存</button></footer>`);
    $$('[data-close]',node).forEach(b=>b.onclick=()=>closeOverlay(node));$('[data-add-platform]',node).onclick=()=>showAddPlatformModal(node,(id,name)=>{state.importPlatforms.push(id);state.importPlatformNames[id]=name;$('#rvPvEditPlatform',node).insertAdjacentHTML('beforeend',`<option value="${id}" selected>${name}</option>`)});
    $('[data-save-info]',node).onclick=()=>{const name=$('#rvPvEditName',node).value.trim();if(!name){$('#rvPvEditError',node).textContent='请输入视频名称';return}v.title=name;v.platform=$('#rvPvEditPlatform',node).value;v.productId=$('#rvPvEditProduct',node).value;closeOverlay(node);render();refreshPreview(parent,v);toast('视频信息已保存')};
  }
  function bindModal(v,node){
    const root=node||$('#rvOverlays').lastElementChild;$('[data-close]',root).onclick=()=>closeOverlay(root);$('[data-download]',root)?.addEventListener('click',()=>download([v]));$('[data-view-result]',root)?.addEventListener('click',()=>{closeOverlay(root);detail(v)});$('[data-analyze]',root)?.addEventListener('click',()=>confirmAnalyze([v],()=>refreshPreview(root,v)));$('[data-edit-tags]',root)?.addEventListener('click',()=>tagModal([v],()=>refreshPreview(root,v),'edit'));$('[data-edit-info]',root)?.addEventListener('click',()=>editPreviewInfo(v,root));$('[data-history]',root)?.addEventListener('click',()=>openReferenceHistory(v));
  }
  function detail(v){
    const page = $('#rvDetailPage');
    if (!page) return;
    const tags = (v.tags || []).map(t => `<span class="rv-detail-meta-tag">${t}</span>`).join('');
    const copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>';
    const audit=auditMeta(v); page.innerHTML = `<header class="rv-detail-page-head">
      <button class="rv-back" data-back>← 返回列表</button>
      <div class="rv-detail-page-title"><div><b>${v.title}</b><span class="rv-pill done">已分析</span></div><p>关联产品：<strong class="rv-detail-product">${productName(v.productId)||'未关联产品'}</strong><i>·</i>来源平台：${names[v.platform] || v.platform}<i>·</i>上传方式：${v.source}<i>·</i>标签：${tags || '<span class="rv-detail-meta-empty">暂无标签</span>'}</p><p>上传：${audit.uploader} · ${auditTime(v.uploadedAt,true)}<i>·</i>最近修改：${audit.updatedBy} · ${auditTime(audit.updatedAt,true)}</p></div>
      <div class="rv-detail-page-actions"><button class="rv-btn rv-btn-secondary" data-history>查看变更</button><button class="rv-btn rv-btn-secondary" data-edit-detail>编辑信息</button><button class="rv-btn rv-btn-primary" data-analyze="${v.id}">重新分析</button></div>
    </header>
    <section class="rv-detail-result">
      <div class="rv-detail-result-head"><strong>${v.title}.mp4</strong><span>视频时长 00:${String(v.duration).padStart(2,'0')} · 分析时间 ${v.uploadedAt}</span></div>
      <div class="rv-detail-main">
        <div class="rv-detail-video" data-play-detail><span class="rv-play">▶</span><div><b>${v.title}</b><small>仅供学习参考，请勿直接商用</small></div></div>
        <article class="rv-detail-card"><button class="rv-copy" data-copy="口播文案" aria-label="复制口播文案">${copyIcon}</button><h3>✦ 口播文案</h3><div class="rv-detail-scroll"><p>00:00 看得见的污渍，还藏着看不见的深层问题。</p><p>00:04 用真实使用场景，把痛点说清楚。</p><p>00:10 最后给出直观结果和行动引导。</p><p>00:18 清洁前后效果一目了然，让用户快速理解核心价值。</p></div></article>
        <article class="rv-detail-card"><button class="rv-copy" data-copy="脚本总结" aria-label="复制脚本总结">${copyIcon}</button><h3>✦ 脚本总结</h3><div class="rv-detail-scroll rv-summary-rows"><p><b>结构公式</b><span>结果钩子—用户痛点—产品介绍—核心卖点—使用场景—行动引导</span></p><p><b>钩子形式</b><span>结果前置型 / 视觉冲击 <em>1</em></span></p><p><b>主打场景</b><span>床垫深层清洁 <em>3</em>、沙发布艺清洁 <em>5</em></span></p><p><b>用户痛点</b><span>床垫深处的灰尘和毛发肉眼难以发现，普通清洁难以触达。</span></p><p><b>产品卖点</b><span>拍打与吸尘同步、透明尘杯结果可见、机身轻巧、支持多场景使用。</span></p><p><b>圈定人群</b><span>养宠家庭、敏感人群家庭、重视床品清洁的用户。</span></p><p><b>行动引导</b><span>以清洁前后对比收尾，引导用户立即清理床品。</span></p></div></article>
        <article class="rv-detail-card rv-visual-card"><button class="rv-copy" data-copy="画面总结" aria-label="复制画面总结">${copyIcon}</button><h3>✦ 画面总结</h3><div class="rv-detail-scroll"><p><b>出镜人物</b> 家庭用户，完成拿取、启动、清洁和结果展示。</p><div class="rv-color-row"><i></i><i></i><i></i><i></i><i></i></div><p><b>产品展示方式</b> 使用场景演示、细节特写、效果对比。</p><div class="rv-scene-row"><i></i><i></i><i></i></div><p><b>主要场景</b> 卧室、客厅、厨房等家庭空间。</p><div class="rv-main-scene-row"><i></i><i></i><i></i><i></i></div></div></article>
      </div>
      <nav class="rv-detail-tabs"><button class="active" data-tab="shot">分镜分析</button><button data-tab="frame">画面逐帧</button><span></span><button class="rv-detail-download" data-json>⇩ 一键下载</button></nav>
      <div class="rv-shots" id="rvDetailContent">${shots('shot')}</div>
    </section>`;
    page.hidden = false;
    // 隐藏列表区域
    document.querySelector('.rv-head').hidden = true;
    document.querySelector('.rv-content').hidden = true;
    document.body.classList.add('rv-detail-mode');
    // 绑定交互
    $('[data-back]', page).onclick = () => {
      page.hidden = true;
      page.innerHTML = '';
      document.querySelector('.rv-head').hidden = false;
      document.querySelector('.rv-content').hidden = false;
      document.body.classList.remove('rv-detail-mode');
      setTimeout(notifyPdaOverlayIfIdle,0);
    };
    $('[data-analyze]', page).onclick = () => confirmAnalyze([v]);
    $('[data-edit-detail]', page).onclick = () => editDetailInfo(v);
    $('[data-history]', page).onclick = () => openReferenceHistory(v);
    $('[data-json]', page).onclick = () => toast(`已下载 ${v.title} V${v.version} 拉片结果 JSON`);
    $('[data-play-detail]', page).onclick = () => toast('视频播放状态已切换');
    $$('[data-copy]', page).forEach(b => b.onclick = async () => { try { await navigator.clipboard?.writeText(`${b.dataset.copy}：${v.title}`); } catch (_) {} toast(`已复制${b.dataset.copy}`); });
    $$('[data-tab]', page).forEach(b => b.onclick = () => { $$('[data-tab]', page).forEach(x => x.classList.remove('active')); b.classList.add('active'); $('#rvDetailContent', page).innerHTML = shots(b.dataset.tab) });
    $('#rvDetailContent', page).onclick = async e => { const button=e.target.closest('[data-frame-copy]');if(!button)return;try{const canvas=document.createElement('canvas');canvas.width=360;canvas.height=288;const ctx=canvas.getContext('2d');const g=ctx.createLinearGradient(0,0,360,288);g.addColorStop(0,button.dataset.colorA);g.addColorStop(1,button.dataset.colorB);ctx.fillStyle=g;ctx.fillRect(0,0,360,288);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob||!navigator.clipboard?.write||typeof ClipboardItem==='undefined')throw new Error();await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);toast('图片已复制到剪贴板')}catch(_){toast('当前浏览器不支持复制图片')}};
  }
  function editDetailInfo(v){
    const node=showOverlay(`<header class="rv-modal-head"><div><small>视频信息</small><h2>编辑参考视频</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><div class="rv-form-grid"><label class="rv-field full"><span>视频名称</span><input id="rvDetailEditName" maxlength="60" value="${v.title}"></label><label class="rv-field"><span>来源平台</span><div class="rv-import-platform"><select id="rvDetailEditPlatform" class="rv-platform-select">${state.importPlatforms.map(p=>`<option value="${p}"${p===v.platform?' selected':''}>${state.importPlatformNames[p]||p}</option>`).join('')}</select><button type="button" class="rv-platform-add-btn" data-add-detail-platform>＋ 新增</button></div></label><label class="rv-field"><span>关联产品 <em>选填</em></span><select id="rvDetailEditProduct">${productOptions(v.productId)}</select></label><div class="rv-field full"><span>视频标签</span><div class="rv-tags">${(v.tags||[]).map(t=>`<span class="rv-tag">${t}</span>`).join('')||'<span class="rv-empty-inline">暂无标签</span>'}</div><button class="rv-link-btn" type="button" data-edit-detail-tags>＋ 编辑标签</button></div></div></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" data-save-detail>保存</button></footer>`);
    $$('[data-close]',node).forEach(b=>b.onclick=()=>closeOverlay(node));
    $('[data-add-detail-platform]',node).onclick=()=>showAddPlatformModal(node,(id,name)=>{state.importPlatforms.push(id);state.importPlatformNames[id]=name;$('#rvDetailEditPlatform',node).insertAdjacentHTML('beforeend',`<option value="${id}" selected>${name}</option>`)});
    $('[data-edit-detail-tags]',node).onclick=()=>tagModal([v],()=>{closeOverlay(node);detail(v)},'edit');
    $('[data-save-detail]',node).onclick=()=>{const name=$('#rvDetailEditName',node).value.trim();if(!name)return toast('请输入视频名称');v.title=name;v.platform=$('#rvDetailEditPlatform',node).value;v.productId=$('#rvDetailEditProduct',node).value;closeOverlay(node);render();detail(v);toast('视频信息已保存')};
  }
  function shots(type){
    const colors=[['#d9b98e','#b98d59'],['#c9afe2','#9872c2'],['#9acdb8','#60a78a'],['#e2a69b','#c97568'],['#a9bee1','#708fca'],['#eccb7d','#d6a746'],['#d2a0c4','#a86f9b']];
    if(type==='frame') return `<div class="rv-frames-grid">${Array.from({length:27},(_,i)=>{const c=colors[i%colors.length];return `<article class="rv-frame-item"><div class="rv-frame-image" style="background:linear-gradient(135deg,${c[0]},${c[1]})"><span>${i+1}</span><button type="button" data-frame-copy data-color-a="${c[0]}" data-color-b="${c[1]}" aria-label="复制第${i+1}帧图片"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h4"/></svg></button></div><p>00:${String(i).padStart(2,'0')}</p></article>`}).join('')}</div>`;
    const cells=Array.from({length:7},(_,i)=>({no:i+1,time:`00:${String(i*4).padStart(2,'0')}–00:${String(i*4+4).padStart(2,'0')}`,dur:`${i%3+2}秒`,desc:i%2?'近景展示产品在真实场景中的操作过程。':'特写突出清洁前后变化与核心效果。',script:i%2?'沿着床面缓慢推进，深层灰尘也能清理。':'看得见的干净，来自每一次强力拍打与吸除。',tone:i%2?'亲切讲解':'结果强调',scene:i%2?'卧室、床垫清洁场景':'家庭真实使用环境',lens:i%2?'平视 · 近景 · 推进':'俯拍 · 特写 · 固定'}));
    const row=(label,render)=>`<div class="rv-shot-label">${label}</div>${cells.map(render).join('')}`;
    return `<div class="rv-shot-grid" style="grid-template-columns:56px repeat(7,232px)"><div class="rv-shot-label rv-shot-analysis">画<br>面<br>分<br>析</div>${cells.map(s=>`<div class="rv-shot-head">分镜${s.no}</div>`).join('')}${cells.map((s,i)=>`<div class="rv-shot-thumb" style="background:linear-gradient(135deg,${colors[i][0]},${colors[i][1]})"><span>仅供学习参考</span><b>${s.dur}</b></div>`).join('')}${cells.map(s=>`<div class="rv-shot-time">${s.time}</div>`).join('')}${cells.map((s,i)=>`<div class="rv-shot-tags"><em>${i%2?'产品功效':'营销卖点'}</em></div>`).join('')}${row('画面描述',s=>`<div class="rv-shot-text">${s.desc}</div>`)}${row('脚本',s=>`<div class="rv-shot-text">${s.script}</div>`)}${row('表达方式',s=>`<div class="rv-shot-text">${s.tone}</div>`)}${row('场景',s=>`<div class="rv-shot-text">${s.scene}</div>`)}${row('镜头',s=>`<div class="rv-shot-text rv-muted-text">${s.lens}</div>`)}</div>`;
  }
  function tagModal(videos=[],done,mode='assign',onImportSave=null){
    const selected=mode==='filter'?[...state.tagFilter]:mode==='edit'?[...(videos[0]?.tags||[])]:mode==='import'?[...(state.importTags||[])]:[], draft={group:'all',keyword:''};
    const title=mode==='filter'?'按标签筛选':mode==='edit'?'编辑视频标签':mode==='import'?'添加视频标签':videos.length===1?'添加视频标签':`为 ${videos.length} 个参考视频打标签`;
    const confirm=mode==='filter'?'应用筛选':mode==='edit'?'保存标签':mode==='import'?'确认标签':videos.length===1?'确认标签':'确认添加';
    const subtitle=mode==='filter'?'可多选标签，筛选同时满足全部标签的参考视频。':mode==='import'?'选择或新建标签，导入后将随视频保存。':'标签会追加到已选参考视频，不会覆盖原有标签。';
    const body=()=>`<div class="rv-tag-modal-body"><aside class="rv-tag-modal-side">${state.tagGroups.map(g=>`<button type="button" class="rv-tag-group ${g.id===draft.group?'active':''}" data-tag-group="${g.id}"><span>${g.name}</span><b>${g.id==='all'?state.tags.length:state.tags.filter(t=>state.tagGroupMap[t]===g.id).length}</b></button>`).join('')}<i></i><button type="button" class="rv-new-tag-group" data-new-group>＋ 新建分组</button></aside><div class="rv-tag-modal-main"><label class="rv-tag-search"><span>⌕</span><input id="rvTagSearch" placeholder="搜索标签..."></label><div id="rvTagChoices">${tagPicker(selected,draft.group,draft.keyword)}</div><div class="rv-tag-create"><button type="button" class="rv-new-tag" data-new-tag>＋ 新建标签</button></div><small id="rvTagError"></small></div></div>`;
    const tagNode = showOverlay(`<header class="rv-modal-head"><div><small>标签</small><h2>${title}</h2><p>${subtitle}</p></div><button class="rv-close" data-close>×</button></header>${body()}<footer class="rv-modal-foot"><span class="rv-tag-selected-hint" id="rvTagHint">已选 ${selected.length} 个标签</span><div><button class="rv-btn rv-btn-secondary" data-clear-tags>清空</button><button class="rv-btn rv-btn-primary" data-save-tags>${confirm}</button></div></footer>`);
    const root = tagNode; // 限定到当前标签弹窗层
    const refresh=()=>{$('#rvTagChoices',root).innerHTML=tagPicker(selected,draft.group,draft.keyword);$('#rvTagHint',root).textContent=`已选 ${selected.length} 个标签`;bindTagPicker(root,selected);$$('[data-tag-pick]',root).forEach(b=>b.onclick=()=>{const t=b.dataset.tagPick;selected.includes(t)?selected.splice(selected.indexOf(t),1):selected.push(t);refresh()})};
    $$('[data-close]',root).forEach(b=>b.onclick=()=>{closeOverlay(root)}); $$('[data-tag-group]',root).forEach(b=>b.onclick=()=>{draft.group=b.dataset.tagGroup;$$('[data-tag-group]',root).forEach(x=>x.classList.toggle('active',x===b));refresh()});$('#rvTagSearch',root).oninput=e=>{draft.keyword=e.target.value.trim();refresh()};$('[data-clear-tags]',root).onclick=()=>{selected.splice(0);refresh()};$('[data-new-group]',root).onclick=()=>{const name=prompt('请输入标签分组名称（1–20 个字符）')?.trim();if(!name)return;if(name.length>20)return toast('标签分组最多 20 个字符');if(state.tagGroups.some(g=>g.name===name))return toast('已存在同名标签分组');const id=`group-${Date.now()}`;state.tagGroups.push({id,name});draft.group=id;closeOverlay(root);tagModal(videos,done,mode,onImportSave)};$('[data-new-tag]',root).onclick=()=>{const t=prompt('请输入新标签名称（1–20 个字符）')?.trim();if(!t)return;if(t.length>20){$('#rvTagError',root).textContent='单个标签最多 20 个字符';return}if(!state.tags.includes(t)){state.tags.push(t);state.tagGroupMap[t]=draft.group==='all'?'content':draft.group}if(!selected.includes(t))selected.push(t);$('#rvTagError',root).textContent='';refresh()};$('[data-save-tags]',root).onclick=()=>{if(mode==='filter'){state.tagFilter=new Set(selected);closeOverlay(root);render();toast(selected.length?`已应用 ${selected.length} 个标签筛选`:'已清空标签筛选');return}if(mode==='import'){state.importTags=[...selected];closeOverlay(root);onImportSave && onImportSave();toast(selected.length?`已添加 ${selected.length} 个视频标签`:'未添加视频标签');return}const overflow=videos.find(v=>new Set([...v.tags,...selected]).size>10);if(overflow){$('#rvTagError',root).textContent='每个视频最多添加 10 个标签';return}if(mode==='edit'){videos[0].tags=[...selected];closeOverlay(root);render();toast('视频标签已保存');}else{videos.forEach(v=>v.tags=[...new Set([...v.tags,...selected])]);closeOverlay(root);render();toast(`已为 ${videos.length} 个参考视频添加标签`);}done?.()};refresh();
  }
  function download(videos){const local=videos.filter(v=>v.source==='本地').length;const task=videos.length-local;if(local) toast(task?`已开始下载 ${local} 个视频，${task} 个视频已创建下载任务。`:`已开始下载 ${local} 个视频`);else toast(`已创建 ${task} 个视频下载任务（演示）`)}
  function confirmAnalyze(videos,onDone){const valid=videos.filter(v=>v.state!=='running');if(!valid.length)return toast('没有可分析的视频');const node=showOverlay(`<header class="rv-modal-head"><div><small>智能拉片</small><h2>确认开始${valid.length>1?'批量':''}智能拉片？</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><ul class="rv-confirm-list"><li>生成口播文案、脚本结构、画面总结与分镜结果</li><li>已有分析结果将保留历史版本，本次生成新版本</li></ul><p class="rv-modal-note">生成期间可继续浏览，完成后可在视频详情查看结果。</p>${videos.some(v=>v.state==='running')?'<p class="rv-note">分析中的视频已跳过。</p>':''}</div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" data-confirm>开始拉片</button></footer>`);const root=node;$$('[data-close]',root).forEach(b=>b.onclick=()=>closeOverlay(root));$('[data-confirm]',root).onclick=e=>{e.currentTarget.disabled=true;e.currentTarget.textContent='分析中…';valid.forEach(v=>v.state='running');render();setTimeout(()=>{valid.forEach(v=>{v.state='done';v.version=(v.version||0)+1});closeOverlay(root);render();onDone?.();toast(`已完成 ${valid.length} 个视频的智能拉片`)},800)}}
  function renderImportTags(root){
    const tags = state.importTags || [];
    const list = $('#rvImportTagList', root);
    if (!list) return;
    list.innerHTML = tags.length
      ? tags.map(t => `<span class="rv-preview-video-tag" data-remove-import-tag="${t}">${t}<i>×</i></span>`).join('')
      : '<span class="rv-preview-empty-tag">暂无视频标签</span>';
  }
  function showAddPlatformModal(parentRoot, onConfirm){
    // 「新增平台」小型弹窗，叠在上传弹窗之上。点取消/X 只关自己，回到上传弹窗。
    const node = showOverlay(`<header class="rv-modal-head"><div><small>新增平台</small><h2>添加自定义平台</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><label class="rv-field full"><span>平台名称 <b>*</b></span><input id="rvNewPlatformName" maxlength="10" placeholder="如：B站、知乎、TikTok"></label><small class="rv-platform-error" id="rvNewPlatformError"></small></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" id="rvNewPlatformSave">保存</button></footer>`);
    const root = node;
    setTimeout(() => { $('#rvNewPlatformName', root)?.focus(); }, 30);
    $$('[data-close]', root).forEach(b => b.onclick = () => closeOverlay(root));
    const nameInput = $('#rvNewPlatformName', root);
    const errorEl = $('#rvNewPlatformError', root);
    const submit = () => {
      const name = (nameInput?.value || '').trim();
      if (!name) { errorEl.textContent = '请输入平台名称'; nameInput?.focus(); return; }
      if (name.length > 10) { errorEl.textContent = '平台名称最多 10 个字符'; nameInput?.focus(); return; }
      if (Object.values(state.importPlatformNames).includes(name) || state.importPlatforms.includes(name)) { errorEl.textContent = '已存在同名平台'; nameInput?.select(); return; }
      const id = `p-${Date.now()}`;
      onConfirm && onConfirm(id, name);
      closeOverlay(root);
    };
    nameInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    nameInput?.addEventListener('input', () => { errorEl.textContent = ''; });
    $('#rvNewPlatformSave', root)?.addEventListener('click', submit);
  }
  function importModal(initialType='local'){
    state.importTags = [];
    const draft = { mode: initialType === 'link' ? 'link' : 'local', platform: state.importPlatforms[0] || 'other', productId:'' };
    const builtInPlatforms = new Set(['douyin','kuaishou','channels','xiaohongshu','other']);
    const overlayNode = showOverlay(`<header class="rv-modal-head"><div><small>导入外部视频</small><h2>选择来源</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><div class="rv-import-tabs"><button type="button" class="rv-import-tab${draft.mode==='local'?' active':''}" data-import-tab="local">本地上传</button><button type="button" class="rv-import-tab${draft.mode==='link'?' active':''}" data-import-tab="link">链接解析</button></div><div class="rv-import-pane" data-pane="local"${draft.mode!=='local'?' hidden':''}><div class="rv-upload"><label><b>点击选择或拖拽视频至此</b><small>支持 MP4、MOV、M4V、WebM、OGV，单个文件不超过 500M</small><input id="rvFile" type="file" accept="video/mp4,video/quicktime,video/x-m4v,video/webm,video/ogg"></label></div></div><div class="rv-import-pane" data-pane="link"${draft.mode!=='link'?' hidden':''}><label class="rv-field full" style="margin-top:14px"><span>视频链接 <b>*</b></span><input id="rvLink" placeholder="请输入 HTTP/HTTPS 视频链接,输入完成后自动解析"></label><p class="rv-note rv-import-parse-state" id="rvParseState">尚未识别链接</p></div><div class="rv-form-grid" style="margin-top:6px"><label class="rv-field full"><span>视频名称 <b>*</b></span><input id="rvName" maxlength="60" placeholder="选择视频或解析链接后自动填入"></label><div class="rv-field"><span>平台 <b>*</b></span><div class="rv-import-platform"><select id="rvPlatform" class="rv-platform-select"></select><button type="button" id="rvAddPlatform" class="rv-platform-add-btn" title="新增平台" aria-label="新增平台">＋ 新增</button></div></div><label class="rv-field"><span>关联产品 <em>选填</em></span><select id="rvImportProduct">${productOptions()}</select></label><div class="rv-field full rv-import-tags"><span>视频标签 <em>选填</em></span><div class="rv-import-tag-control"><div id="rvImportTagList"></div><button type="button" class="rv-btn rv-btn-secondary small" id="rvImportAddTag">＋ 添加标签</button></div></div></div></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" id="rvSaveImport">${draft.mode==='link'?'导入参考视频':'导入外部视频'}</button></footer>`);
    const root = overlayNode;
    const renderPlatformSelect = () => {
      const sel = $('#rvPlatform', root);
      if (!sel) return;
      sel.innerHTML = state.importPlatforms.map(p => {
        const name = state.importPlatformNames[p] || p;
        const isCustom = !builtInPlatforms.has(p);
        return `<option value="${p}"${p === draft.platform ? ' selected' : ''}>${name}${isCustom ? '（自定义）' : ''}</option>`;
      }).join('');
    };
    const switchTab = mode => {
      draft.mode = mode;
      $$('.rv-import-tab', root).forEach(t => t.classList.toggle('active', t.dataset.importTab === mode));
      $$('.rv-import-pane', root).forEach(p => p.hidden = p.dataset.pane !== mode);
      const saveBtn = $('#rvSaveImport', root);
      if (saveBtn) saveBtn.textContent = mode === 'link' ? '导入参考视频' : '导入外部视频';
      setTimeout(() => { const first = mode === 'link' ? $('#rvLink', root) : $('#rvName', root); if (first) first.focus(); }, 30);
    };
    renderPlatformSelect();
    renderImportTags(root);
    $$('.rv-import-tab', root).forEach(t => t.onclick = () => switchTab(t.dataset.importTab));
    setTimeout(() => { const first = draft.mode === 'link' ? $('#rvLink', root) : $('#rvName', root); if (first) first.focus(); }, 30);
    $$('[data-close]', root).forEach(b => b.onclick = () => { state.importTags = []; closeOverlay(root); });
    const file = $('#rvFile', root);
    file?.addEventListener('change', () => { const f = file.files[0]; if (!f) return; if (f.size > 500 * 1024 * 1024) { toast('单个视频文件不能超过 500M'); file.value = ''; return; } $('#rvName', root).value = f.name.replace(/\.[^.]+$/, ''); });
    let parseTimer = null;
    const linkInput = $('#rvLink', root);
    const parseState = $('#rvParseState', root);
    const setParseState = (text, ok) => { if (!parseState) return; parseState.textContent = text; parseState.classList.toggle('ok', !!ok); parseState.classList.toggle('err', !ok); };
    const runParse = () => {
      const link = linkInput?.value.trim() || '';
      if (!link) { setParseState('尚未识别链接', false); $('#rvName', root).value = ''; return; }
      if (!/^https?:\/\//.test(link)) { setParseState('请输入有效的视频链接', false); $('#rvName', root).value = ''; return; }
      setParseState('正在识别链接…', false);
      setTimeout(() => {
        $('#rvName', root).value = '外部视频创意参考';
        draft.platform = 'douyin';
        renderPlatformSelect();
        setParseState('已识别视频信息,请补充平台与标签后保存', true);
      }, 600);
    };
    if (linkInput) {
      linkInput.addEventListener('input', () => {
        clearTimeout(parseTimer);
        setParseState('识别中…', false);
        parseTimer = setTimeout(runParse, 400);
      });
      linkInput.addEventListener('blur', () => {
        clearTimeout(parseTimer);
        runParse();
      });
    }
    $('#rvPlatform', root)?.addEventListener('change', e => { draft.platform = e.target.value; });
    $('#rvImportProduct', root)?.addEventListener('change', e => { draft.productId = e.target.value; });
    $('#rvAddPlatform', root)?.addEventListener('click', () => {
      showAddPlatformModal(root, (newId, newName) => {
        state.importPlatforms.push(newId);
        state.importPlatformNames[newId] = newName;
        draft.platform = newId;
        renderPlatformSelect();
        toast(`已添加平台「${newName}」`);
      });
    });
    $$('[data-remove-import-tag]', root).forEach(b => b.onclick = () => {
      const t = b.dataset.removeImportTag;
      state.importTags = state.importTags.filter(x => x !== t);
      renderImportTags(root);
    });
    $('#rvImportAddTag', root)?.addEventListener('click', () => {
      tagModal([], null, 'import', () => renderImportTags(root));
    });
    $('#rvSaveImport', root).onclick = () => {
      const name = $('#rvName', root).value.trim();
      if (!name) { toast('请输入文件名称'); $('#rvName', root).focus(); return; }
      if (draft.mode === 'link' && !parseState?.classList.contains('ok')) return toast('请输入有效的视频链接');
      if (!draft.platform) return toast('请选择平台');
      const isLinkMode = draft.mode === 'link';
      state.videos.unshift({ id: `rv${Date.now()}`, title: name, productId:draft.productId, platform: draft.platform, source: isLinkMode ? '采集' : '本地', state: 'pending', duration: 30, created: 9, uploadedAt: nowStamp(), tags: [...state.importTags], size: isLinkMode ? '—' : '68 MB', version: 0 });
      state.importTags = [];
      closeAllOverlays();
      render();
      toast(isLinkMode ? '参考视频已导入' : '外部视频已导入');
    };
  }
  function productModal(videos,done){
    const current=videos.every(v=>v.productId===videos[0]?.productId)?videos[0]?.productId||'':'';
    const node=showOverlay(`<header class="rv-modal-head"><div><small>关联产品</small><h2>${videos.length>1?`为 ${videos.length} 个参考视频关联产品`:'关联产品'}</h2><p>每条外部参考视频最多关联一个产品，可随时更换或解除。</p></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><label class="rv-field full"><span>选择产品 <em>选填</em></span><select id="rvRelationProduct">${productOptions(current)}</select><small class="rv-field-hint">选择“未关联产品”即可解除当前关系。</small></label></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" data-save-product>保存</button></footer>`);
    $$('[data-close]',node).forEach(b=>b.onclick=()=>closeOverlay(node));
    $('[data-save-product]',node).onclick=()=>{const id=$('#rvRelationProduct',node).value;videos.forEach(v=>v.productId=id);closeOverlay(node);render();done?.();toast(id?`已关联产品：${productName(id)}`:'已解除产品关联')};
  }
  function deleteVideos(videos){const node=showOverlay(`<header class="rv-modal-head"><div><small>视频操作</small><h2>删除参考视频</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><p class="rv-note">删除后无法恢复，相关分析结果将同步删除。确认删除？</p></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-danger" data-delete>确认删除</button></footer>`);const root=node;$$('[data-close]',root).forEach(b=>b.onclick=()=>closeOverlay(root));$('[data-delete]',root).onclick=()=>{const ids=new Set(videos.map(v=>v.id));state.videos=state.videos.filter(v=>!ids.has(v.id));state.selected.clear();closeOverlay(root);render();toast('参考视频已删除')}}
  let searchTimer;
  $('#rvImport').onclick=()=>importModal();$('#rvCollect').onclick=()=>toast('采集插件能力建设中，后续将在此跳转插件下载页。');$('#rvPlatformBtn').onclick=()=>openMenu($('#rvPlatformBtn'),$('#rvPlatformMenu'));$('#rvPlatformMenu').onclick=e=>{const b=e.target.closest('[data-platform]');if(b){state.platform=b.dataset.platform;closeMenus();render()}};$('#rvStatusBtn').onclick=()=>openMenu($('#rvStatusBtn'),$('#rvStatusMenu'));$('#rvStatusMenu').onclick=e=>{const b=e.target.closest('[data-status]');if(b){state.status=b.dataset.status;closeMenus();render()}};$('#rvSort').onclick=()=>openMenu($('#rvSort'),$('#rvSortMenu'));$('#rvSortMenu').onclick=e=>{const b=e.target.closest('[data-sort]');if(b){state.sort=b.dataset.sort;closeMenus();render()}};$('#rvSearch').oninput=e=>{clearTimeout(searchTimer);state.search=e.target.value;$('#rvSearchClear').hidden=!state.search;searchTimer=setTimeout(render,300)};$('#rvSearchClear').onclick=()=>{clearTimeout(searchTimer);state.search='';$('#rvSearch').value='';render();$('#rvSearch').focus()};$('#rvRefresh').onclick=()=>{render();toast('列表已刷新')};$('#rvReset').onclick=()=>{state.platform='all';state.status='all';state.search='';state.tagFilter.clear();$('#rvSearch').value='';render()};$('#rvTagBtn').onclick=()=>tagModal([],null,'filter');
  function renameModal(v){const node=showOverlay(`<header class="rv-modal-head"><div><small>重命名</small><h2>重命名参考视频</h2></div><button class="rv-close" data-close>×</button></header><div class="rv-modal-body"><label class="rv-field full"><span>视频名称</span><input id="rvRename" maxlength="60" value="${v.title}"></label></div><footer class="rv-modal-foot"><button class="rv-btn rv-btn-secondary" data-close>取消</button><button class="rv-btn rv-btn-primary" data-save>保存</button></footer>`);const root=node;$$('[data-close]',root).forEach(b=>b.onclick=()=>closeOverlay(root));$('[data-save]',root).onclick=()=>{const name=$('#rvRename',root).value.trim();if(!name)return toast('请输入文件名称');v.title=name;closeOverlay(root);render();toast('视频名称已更新')}}
  function runCardAction(action,v,menu){if(!action||action.hasAttribute('disabled'))return;menu.hidden=true;if(action.dataset.action!=='download')pdaOverlayChain=pdaOverlayMode;if(action.dataset.action==='download')download([v]);if(action.dataset.action==='analyze')confirmAnalyze([v]);if(action.dataset.action==='rename')renameModal(v);if(action.dataset.action==='tag')tagModal([v],null,'edit');if(action.dataset.action==='product')productModal([v]);if(action.dataset.action==='delete')deleteVideos([v]);if(action.dataset.action==='download')setTimeout(notifyPdaOverlayIfIdle,0)}
  function removeBridgeMenu(){document.body.querySelector('.rv-card-menu[data-pda-bridge]')?.remove()}
  $('#rvGrid').onclick=e=>{const card=e.target.closest('.rv-card');if(!card)return;const v=video(card.dataset.id);const more=e.target.closest('[data-more]');const action=e.target.closest('[data-action]');if(more){const menu=$('.rv-card-menu',card);$$('.rv-card-menu').forEach(x=>{if(x!==menu)x.hidden=true});menu.hidden=!menu.hidden;setTimeout(notifyPdaOverlayIfIdle,0);return}if(action){runCardAction(action,v,$('.rv-card-menu',card));return}if(e.target.closest('[data-select]')){state.selected.has(v.id)?state.selected.delete(v.id):state.selected.add(v.id);render()}else if(e.target.closest('[data-preview]'))preview(v);else if(e.target.closest('[data-detail]'))v.state==='done'?detail(v):preview(v)};
  $('#rvCancelSelect').onclick=()=>{state.selected.clear();render()};$('#rvSelection').onclick=e=>{const b=e.target.closest('[data-batch]');if(!b)return;const videos=state.videos.filter(v=>state.selected.has(v.id));if(b.dataset.batch==='download')download(videos);if(b.dataset.batch==='tag')tagModal(videos);if(b.dataset.batch==='product')productModal(videos);if(b.dataset.batch==='analyze')confirmAnalyze(videos);if(b.dataset.batch==='delete')deleteVideos(videos)};document.addEventListener('click',e=>{const menuAction=e.target.closest('.rv-card-menu [data-action]');if(!e.target.closest('.rv-menu-wrap'))closeMenus();if(!e.target.closest('.rv-card-menu')&&!e.target.closest('[data-more]'))$$('.rv-card-menu').forEach(menu=>menu.hidden=true);if(!menuAction)setTimeout(notifyPdaOverlayIfIdle,0)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.rv-card-menu').forEach(menu=>menu.hidden=true);setTimeout(notifyPdaOverlayIfIdle,0)}});
  window.addEventListener('message',event=>{if(event.source!==window.parent||event.data?.type!=='rv-products'||!Array.isArray(event.data.products))return;state.products=event.data.products.filter(item=>item?.id&&item?.name);render()});
  window.addEventListener('message',event=>{if(event.source!==window.parent||event.data?.type!=='rv-set-product-links')return;const ids=new Set(event.data.selectedIds||[]),productId=event.data.productId||'';state.videos.forEach(item=>{if(ids.has(item.id))item.productId=productId;else if(item.productId===productId)item.productId=''});render()});
  window.addEventListener('message',event=>{
    const request=event.data;
    if(event.source!==window.parent||request?.kind!=='reference')return;
    if(request.type==='pda-library-overlay-cancel'){
      pdaOverlayMode=false;pdaOverlayAssetId=null;pdaOverlayRequestId=null;pdaOverlayChain=false;pdaCloseNotified=false;
      document.documentElement.classList.remove('pda-overlay-mode');document.body.classList.remove('pda-overlay-mode','rv-detail-mode');
      closeAllOverlays(true);removeBridgeMenu();$$('.rv-card-menu').forEach(menu=>menu.hidden=true);
      $('#rvDetailPage').hidden=true;$('#rvDetailPage').innerHTML='';$('.rv-head').hidden=false;$('.rv-content').hidden=false;
      return;
    }
    if(request.type==='pda-library-overlay-probe'){
      const active=Boolean(pdaOverlayChain||$('#rvOverlays')?.children.length||!$('#rvDetailPage')?.hidden||$$('.rv-card-menu').some(menu=>!menu.hidden));
      if(active)pdaCloseNotified=false;
      window.parent.postMessage({type:'pda-library-overlay-status',requestId:request.requestId,kind:'reference',active},'*');
      return;
    }
    if(request.type!=='pda-open-library-asset')return;
    pdaOverlayMode=Boolean(request.overlay);pdaOverlayAssetId=request.id;pdaOverlayRequestId=request.requestId||null;pdaOverlayChain=false;pdaCloseNotified=false;
    removeBridgeMenu();
    document.documentElement.classList.toggle('pda-overlay-mode',pdaOverlayMode);document.body.classList.toggle('pda-overlay-mode',pdaOverlayMode);
    state.platform='all';state.status='all';state.search='';state.tagFilter.clear();$('#rvSearch').value='';
    const target=video(request.id)||state.videos.find(item=>item.title===request.name);
    if(!target){toast('未找到对应外部参考视频');notifyPdaOverlayIfIdle();return}
    pdaOverlayAssetId=target.id;render();
    if(request.intent==='preview')preview(target);
    else if(request.intent==='detail')target.state==='done'?detail(target):preview(target);
    else if(request.intent==='menu'){
      const menu=$(`.rv-card[data-id="${target.id}"] .rv-card-menu`),rect=request.anchor||{right:180,bottom:80};
      if(menu){menu.dataset.pdaBridge='true';document.body.appendChild(menu);menu.hidden=true;menu.style.position='fixed';menu.style.right='auto';menu.style.bottom='auto';menu.onclick=e=>{const action=e.target.closest('[data-action]');if(!action)return;e.stopPropagation();runCardAction(action,target,menu)};setTimeout(()=>{if(!menu.isConnected)return;menu.style.left=`${Math.min(window.innerWidth-142,Math.max(8,rect.right-132))}px`;menu.style.top=`${Math.min(window.innerHeight-270,rect.bottom+4)}px`;menu.hidden=false},40);}
    }
    window.parent.postMessage({type:'pda-library-overlay-ready',requestId:pdaOverlayRequestId,kind:'reference'},'*');
  });
  window.parent.postMessage({type:'rv-request-products'},'*');
  render();
})();

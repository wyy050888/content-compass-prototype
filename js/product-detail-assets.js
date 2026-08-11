(function () {
  'use strict';
  const root = document.getElementById('productAssetHub');
  if (!root) return;

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const productName = () => ($('#pageDetailName')?.textContent || '轻净 Pro 除螨仪').trim();
  const now = () => '刚刚';
  const clone = v => JSON.parse(JSON.stringify(v));

  // ============ 状态 / 来源 / 类型 辅助 - 对齐源页(创作素材 ok/fail/pending/analyzing; 成片视频 done/pending/running/failed) ============
  const matStatusLabel = { ok: '已分析', fail: '分析失败', pending: '待分析', analyzing: '分析中' };
  const matStatusTip  = { ok: '分析成功', fail: '分析失败：点击重试', pending: '等待分析 · 点击开始', analyzing: '正在分析…' };
  const matStatusIco  = {
    ok:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>',
    fail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>',
    pending:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
    analyzing:''
  };
  const fvStatusLabel = { done: '已分析', pending: '待分析', running: '分析中', failed: '分析失败' };
  const fvSourceMeta = {
    infinite: { label: '无限画板', cls: 'pda-fv-tag-infinite' },
    local:    { label: '本地上传', cls: 'pda-fv-tag-local' },
    remix:    { label: '智能混剪', cls: 'pda-fv-tag-remix' }
  };
  const fvSourceLabel = s => (fvSourceMeta[s] || fvSourceMeta.local).label;
  const fvSourceClass = s => (fvSourceMeta[s] || fvSourceMeta.local).cls;
  // 通用状态徽标文案(对外 toast / preview 用)
  const statusText = { ...matStatusLabel, ...fvStatusLabel, done: '已分析', running: '分析中', failed: '分析失败', analyzed: '已分析', ok: '已分析', fail: '分析失败', analyzing: '分析中', pending: '待分析' };
  // 时间格式 - 对齐源页成片视频: MM/DD HH:mm(不带秒); 创作素材 MM/DD HH:mm:ss
  const cardTime = (created, withSec=false) => {
    if (!created) return '';
    const slice = (a,b) => created.slice(a,b);
    return withSec ? `${slice(5,7)}/${slice(8,10)} ${slice(11,19)}` : `${slice(5,7)}/${slice(8,10)} ${slice(11,16)}`;
  };
  // 时长(秒数 → MM:SS),对齐成片视频 formatTime
  const fvTime = sec => { if (sec==null || sec==='') return ''; const s=Number(sec); if (!Number.isFinite(s)) return String(sec); const m=Math.floor(s/60), r=s%60; return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`; };

  // 与脚本库 baseRows 同构, 复刻脚本库 openView/openEdit 弹层需要的 rows 字段
  const baseRows = (mode='depend') => [
    { id:1, time:'00—03s', voice:'刚换的床单，也能吸出一杯脏东西。', shotType:'特写', cameraMove:'固定', visual:'透明尘杯脏污特写，0.8 秒后切换至整洁床面，形成结果反差。', material:'M-CL-101 · 2s', videoPrompt:'透明尘杯脏污特写，毛发碎屑清晰可见，自然光，竖屏 9:16，固定镜头，3 秒。' },
    { id:2, time:'03—06s', voice:'看得见的是表面，看不见的都藏在床垫深处。', shotType:'特写', cameraMove:'推进', visual:'手掌按压床垫，切入纤维与毛发碎屑微距，镜头缓慢推进。', material:'M-CL-102 · 3s', videoPrompt:'床垫纤维微距，毛发碎屑可见，从中景推进至特写，卧室自然光，竖屏 9:16，3 秒。' },
    { id:3, time:'06—10s', voice:'轻净 Pro 一边拍打一边吸，把深处的脏东西直接带出来。', shotType:'中景', cameraMove:'平移跟拍', visual:'真人手持产品在床垫上匀速推进，补充底部与床面接触的近景。', material:'M-PE-202 · 4s', videoPrompt:'真人手持轻净 Pro 在床垫表面匀速推进，侧面平移跟拍，真实使用感，竖屏 9:16，4 秒。' },
    { id:4, time:'10—14s', voice:'推过的地方，毛发和细小碎屑都会进到透明尘杯里。', shotType:'近景', cameraMove:'推进', visual:'床面推进与尘杯内部变化交叉剪辑，最后停留在吸入后的尘杯结果。', material:'M-CL-103 · 4s', videoPrompt:'透明尘杯内部变化过程，毛发碎屑逐渐累积，固定近景，竖屏 9:16，4 秒。' }
  ].map(r => ({ ...r, material: mode==='depend' ? r.material : '' }));

  // 计算脚本规格, 复用脚本库 specs 公式: 9:16 · 30s · 7镜头
  const specsOf = s => `${s.ratio} · ${s.duration}s · ${s.rows.length} 镜头`;
  const modeText = m => m==='depend' ? '依赖素材库' : '不依赖素材库';
  // 关联产品下拉选项 - 与脚本库 productOptions 保持一致
  const pdaProductOptions = ['轻净 Pro 除螨仪', '净味空气炸锅', '清洁洗地机'];
  const pdaProductIds = {'轻净 Pro 除螨仪':'mite-pro','轻享空气炸锅 A8':'air-a8','净界洗地机 S5':'washer-s5','随行榨汁杯 Mini':'blend-mini'};
  const pdaProductOptionsHtml = (current='') => {
    const list = current && !pdaProductOptions.includes(current) ? [current, ...pdaProductOptions] : pdaProductOptions;
    return list.map(n => `<option value="${esc(n)}" ${n===current?'selected':''}>${esc(n)}</option>`).join('');
  };

  const state = { tab:'copy', template:'prompt', search:'', preview:null, edit:null, confirm:null, overlayRequest:null, associate:null };
  // 状态枚举与源页对齐:
  //   创作素材 status: ok / fail / pending / analyzing
  //   成片视频 status: done / pending / running / failed
  // 时长单位:成片视频用秒数(经 fvTime 转换);创作素材用 "0:05" 字符串,源页已如此
  const data = {
    copy: [
      {id:'c1', text:'床单刚换一周，第一遍照样能吸出碎屑和毛发。床垫深处的脏东西，普通清理根本触达不到。轻净 Pro 拍打吸尘同步完成，尘杯可水洗。', source:'智能文案', product:'轻净 Pro 除螨仪', crowd:'年轻父母', structure:'痛点钩子型', chars:61, updated:'08/08 14:32:16'},
      {id:'c2', text:'看得见的是表面，看不见的都藏在床垫深处。高频拍打先松尘，再用大吸力带走灰尘与毛发，清洁结果在透明尘杯里一目了然。', source:'爆款仿写', product:'轻净 Pro 除螨仪', crowd:'养宠家庭', structure:'结果直给型', chars:58, updated:'08/07 18:20:05'}
    ],
    image: [
      {id:'i1', name:'卧室深层清洁主图.png', type:'主图', desc:'床褥深处的脏东西，一吸就看得见', tags:['产品特写','结果直给'], resolution:'1080×1080', size:'2.8 MB', linked:true},
      {id:'i2', name:'拍打吸尘场景图.png', type:'场景图', desc:'拍打松尘，再强力吸走', tags:['卧室','使用场景'], resolution:'1242×1660', size:'3.4 MB', linked:true},
      {id:'i3', name:'尘杯清洁前后对比.png', type:'详情页', desc:'透明尘杯结果对比展示', tags:['效果证明'], resolution:'1242×1660', size:'3.1 MB', linked:true}
    ],
    script: [
      {id:'s1', name:'轻净 Pro 除螨仪_脚本_202608081430', product:'轻净 Pro 除螨仪', copy:'床单刚换一周，第一遍照样能吸出碎屑和毛发。', spec:'9:16 · 30s · 7镜头', strategy:'依赖素材库', material:'7/7 已匹配', updated:'08/08 14:30:22',
        source:'床单刚换一周，第一遍照样能吸出碎屑和毛发。',
        sourceFull:'床单刚换一周，第一遍照样能吸出碎屑和毛发。床垫深处的脏东西，普通清理根本触达不到。轻净 Pro 拍打吸尘同步完成，尘杯可水洗。',
        duration:30, ratio:'9:16', materialMode:'depend', materialStatus:'7/7 已匹配', rows:baseRows('depend')},
      {id:'s2', name:'轻净 Pro 场景演示_脚本_202608071820', product:'轻净 Pro 除螨仪', copy:'看得见的是表面，看不见的都藏在床垫深处。', spec:'9:16 · 60s · 12镜头', strategy:'不依赖素材库', material:'生视频提示词', updated:'08/07 18:20:11',
        source:'看得见的是表面，看不见的都藏在床垫深处。',
        sourceFull:'看得见的是表面，看不见的都藏在床垫深处。高频拍打先松尘，再用大吸力带走灰尘与毛发，清洁结果在透明尘杯里一目了然。',
        duration:60, ratio:'9:16', materialMode:'free', materialStatus:'已生成提示词', rows:baseRows('free')}
    ],
    // 创作素材: status 枚举对齐源页 mat-card (ok / fail / pending / analyzing); type 'video'/'image'
    material: [
      {id:'m1', libraryId:101, name:'床垫拍吸实拍', product:'轻净 Pro 除螨仪', type:'video', duration:'0:05', time:'08/08 09:14:23', created:'2026-08-08 09:14:23', status:'ok', tags:['产品演示','卧室'], folder:'除螨仪项目', linked:true},
      {id:'m2', libraryId:102, name:'尘杯结果特写', product:'轻净 Pro 除螨仪', type:'image', duration:'', time:'08/07 17:35:08', created:'2026-07-08 17:35:08', status:'ok', tags:['产品特写','效果证明'], folder:'除螨仪项目', linked:true},
      {id:'m3', libraryId:103, name:'拆卸尘杯演示', product:'轻净 Pro 除螨仪', type:'video', duration:'0:06', time:'08/07 11:28:40', created:'2026-08-07 11:28:40', status:'pending', tags:['产品演示','使用教程'], folder:'待整理', linked:true},
      {id:'m4', libraryId:104, name:'沙发清洁实拍', product:'空气炸锅', type:'video', duration:'0:08', time:'08/06 16:22:09', created:'2026-08-06 16:22:09', status:'ok', tags:['使用场景','沙发'], folder:'内部制作', linked:false}
    ],
    // 成片视频: status 枚举对齐源页 fv-video-card (done / pending / running / failed); duration 秒数; ads 数组决定是否显示千川
    video: [
      {id:'v1', libraryId:'mix-1', name:'MIX_MITE_HOOK_30S', file:'MIX_MITE_HOOK_30S.mp4', product:'轻净 Pro 除螨仪', duration:30, time:'08/07 20:14:02', created:'2026-08-07 20:14:02', status:'done', source:'remix', tags:['痛点钩子','卧室'], folder:'混剪/钩子强化', ads:[{id:'QC-240618'}], theme:'mix-a', linked:true},
      {id:'v2', libraryId:'tvc-1', name:'QJ_PRO_TVC_30S', file:'QJ_PRO_TVC_30S.mp4', product:'轻净 Pro 除螨仪', duration:30, time:'08/06 14:20:18', created:'2026-08-06 14:20:18', status:'done', source:'infinite', tags:['品牌片','产品演示'], folder:'品牌TVC', ads:[], theme:'tvc', linked:true},
      {id:'v3', libraryId:'tvc-2', name:'QJ_QIXI_15S', file:'QJ_QIXI_15S.mov', product:'轻净 Pro 除螨仪', duration:15, time:'08/05 11:08:31', created:'2026-08-05 11:08:31', status:'pending', source:'local', tags:['营销活动','新品上市'], folder:'营销活动/新品上市', ads:[], theme:'tvc', linked:true},
      {id:'v4', libraryId:'mix-fail', name:'MIX_HOME_22S', file:'MIX_HOME_22S.mp4', product:'净澈洗地机', duration:22, time:'08/04 10:02:45', created:'2026-08-04 10:02:45', status:'failed', source:'remix', tags:['家庭清洁','使用场景'], folder:'混剪', ads:[{id:'QC-881202'}], theme:'mix-b', linked:false}
    ],
    reference: [
      {id:'r1', libraryId:'rv1', name:'除螨仪结果型钩子参考', productId:'mite-pro', product:'轻净 Pro 除螨仪', platform:'douyin', source:'采集', status:'done', duration:30, created:'08/10 13:24:06', tags:['结果直给','痛点钩子'], linked:true},
      {id:'r2', libraryId:'rv2', name:'空气炸锅省时场景参考', productId:'air-a8', product:'轻享空气炸锅 A8', platform:'kuaishou', source:'本地', status:'pending', duration:22, created:'08/09 16:05:18', tags:['场景演示'], linked:false},
      {id:'r3', libraryId:'rv3', name:'床垫深层清洁过程参考', productId:'mite-pro', product:'轻净 Pro 除螨仪', platform:'douyin', source:'采集', status:'running', duration:31, created:'08/08 10:36:42', tags:['效果证明'], linked:true},
      {id:'r4', libraryId:'rv4', name:'小家电痛点开场参考', productId:'', product:'', platform:'xiaohongshu', source:'采集', status:'failed', duration:18, created:'08/07 09:18:55', tags:['痛点钩子'], linked:false},
      {id:'r5', libraryId:'rv5', name:'厨房收纳三步演示', productId:'air-a8', product:'轻享空气炸锅 A8', platform:'channels', source:'本地', status:'done', duration:46, created:'08/06 14:42:21', tags:['场景演示','新品种草'], linked:false},
      {id:'r6', libraryId:'rv6', name:'清洁工具效果对比参考', productId:'washer-s5', product:'净界洗地机 S5', platform:'douyin', source:'采集', status:'pending', duration:15, created:'08/05 11:03:09', tags:['结果直给','效果证明'], linked:false}
    ],
    template: {
      prompt:[
        {id:'tp1', name:'清洁电器高转化口播提示词', agent:'智能文案', text:'读取产品事实与禁用话术，按痛点、产品能力、使用证明、多场景和行动引导生成文案。', isDefault:true},
        {id:'tp2', name:'除螨结果直给提示词', agent:'爆款文案仿写', text:'复用参考文案的节奏与钩子，不复用事实，将卖点替换为当前产品事实。', isDefault:false}
      ],
      persona:[
        {id:'ta1', name:'养宠清洁家庭', age:'25–40岁', scene:'床垫、沙发、宠物活动区', pain:'毛发碎屑与深层灰尘', updated:'08/08 12:15'},
        {id:'ta2', name:'年轻父母', age:'25–38岁', scene:'卧室、儿童房', pain:'看不见的床褥脏污', updated:'08/07 09:40'}
      ],
      canvas:[
        {id:'tc1', name:'清洁电器 TVC 画板模板', node:'18 个节点', updated:'08/08 10:20'},
        {id:'tc2', name:'结果证明短视频画板', node:'12 个节点', updated:'08/06 16:08'}
      ],
      'copy-structure':[
        {id:'ts1', name:'结果冲击型 30 秒口播结构', source:'千川学习', scene:'清洁电器', updated:'08/08 11:30'},
        {id:'ts2', name:'痛点钩子＋演示证明', source:'自建', scene:'家居清洁', updated:'08/07 18:40'}
      ],
      'video-structure':[
        {id:'tv1', name:'实拍演示型爆款视频结构', duration:'30s', shots:'7个分镜', updated:'08/08 15:10'},
        {id:'tv2', name:'多场景快切结构', duration:'20s', shots:'6个分镜', updated:'08/06 17:22'}
      ]
    }
  };

  const { mediaCard } = window.createProductDetailMediaCards({
    esc, cardTime, fvTime, matStatusLabel, matStatusTip, matStatusIco,
    fvStatusLabel, fvSourceLabel, fvSourceClass
  });

  function toast(message) {
    if (typeof window.showToast === 'function') return window.showToast(message);
    let el = $('#pdaToast');
    if (!el) { el=document.createElement('div'); el.id='pdaToast'; Object.assign(el.style,{position:'fixed',zIndex:5000,left:'50%',bottom:'30px',transform:'translateX(-50%)',padding:'10px 16px',borderRadius:'8px',background:'#242735',color:'#fff',fontSize:'13px'}); document.body.appendChild(el); }
    el.textContent=message; el.hidden=false; clearTimeout(el._timer); el._timer=setTimeout(()=>el.hidden=true,1800);
  }
  function filtered(items, fields) { const q=state.search.trim().toLowerCase(); return q ? items.filter(x=>fields.some(f=>String(x[f]||'').toLowerCase().includes(q))) : items; }
  function empty(label) { return `<div class="pda-empty"><div><i>◇</i><strong>暂无${esc(label)}</strong><p>可清空搜索条件后重试</p></div></div>`; }
  function setCounts() {
    ['copy','image','script'].forEach(k=>$(`[data-pda-count="${k}"]`).textContent=data[k].length);
    ['material','video','reference'].forEach(k=>$(`[data-pda-count="${k}"]`).textContent=data[k].filter(x=>x.linked).length);
    $('[data-pda-count="template"]').textContent=Object.values(data.template).reduce((n,a)=>n+a.length,0);
  }

  function renderCopy() {
    const rows=filtered(data.copy,['text','source','crowd','structure']);
    $('#pdaCopyContent').innerHTML=rows.length?`<div class="pda-table-wrap"><table class="pda-table"><colgroup><col style="width:31%"><col style="width:9%"><col style="width:12%"><col style="width:9%"><col style="width:10%"><col style="width:6%"><col style="width:10%"><col style="width:13%"></colgroup><thead><tr><th>文案详情</th><th>来源</th><th>产品</th><th>人群</th><th>结构</th><th>字数</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows.map(x=>`<tr><td><div class="pda-clamp" title="${esc(x.text)}">${esc(x.text)}</div></td><td>${esc(x.source)}</td><td><strong>${esc(x.product)}</strong></td><td>${esc(x.crowd)}</td><td>${esc(x.structure)}</td><td>${x.chars}</td><td>${x.updated}</td><td><div class="pda-actions"><button class="pda-link" data-pda-action="edit-copy" data-id="${x.id}">编辑</button><span class="pda-ai-wrap"><button class="pda-link" data-pda-menu-toggle>AI ▾</button><span class="pda-menu" hidden>${['智能改写','爆款仿写','智能脚本','智能混剪'].map(a=>`<button data-pda-action="ai" data-value="${a}" data-id="${x.id}">${a}</button>`).join('')}</span></span><button class="pda-link" data-pda-action="delete" data-kind="copy" data-id="${x.id}">删除</button></div></td></tr>`).join('')}</tbody></table></div>`:empty('关联文案');
  }
  function renderImages() {
    const items=filtered(data.image.filter(x=>x.linked),['name','type','desc']);
    $('#pdaImageContent').innerHTML=items.length?`<div class="pda-panel-tools"><div><strong>关联图片</strong><span>${items.length} 项</span></div></div><div class="pda-image-grid">${items.map((x,i)=>`<article class="pda-image-card" data-pda-image="${x.id}"><div class="pda-image-cover ${i%2?'detail':''}"><div><strong>${esc(x.desc)}</strong><small style="display:block;margin-top:8px">点击预览</small></div></div><div class="pda-image-info"><strong>${esc(x.name)}</strong><div class="pda-meta"><span>${x.type} · ${x.resolution}</span><span>${x.size}</span></div></div></article>`).join('')}</div>`:empty('关联图片');
  }
  function renderScripts() {
    const rows=filtered(data.script,['name','copy','strategy','material']);
    $('#pdaScriptContent').innerHTML=rows.length?`<div class="pda-table-wrap"><table class="pda-table"><colgroup><col style="width:21%"><col style="width:14%"><col style="width:25%"><col style="width:14%"><col style="width:12%"><col style="width:12%"><col style="width:16%"></colgroup><thead><tr><th>脚本名称</th><th>对应产品</th><th>生成文案</th><th>规格</th><th>素材策略</th><th>最近更新</th><th>操作</th></tr></thead><tbody>${rows.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.product)}</td><td><div class="pda-clamp" title="${esc(x.copy)}">${esc(x.copy)}</div></td><td>${esc(x.spec)}</td><td>${esc(x.strategy)}</td><td>${x.updated}</td><td><div class="pda-actions">${['查看','编辑','复制','下载','删除'].map(a=>`<button class="pda-link" data-pda-action="script-${a}" data-id="${x.id}">${a}</button>`).join('')}</div></td></tr>`).join('')}</tbody></table></div>`:empty('关联脚本');
  }

  function mediaPage(kind) { return kind === 'material' ? 'creation-videos' : kind === 'video' ? 'finished-videos' : 'reference-videos'; }
  function mediaLabel(kind) { return kind === 'material' ? '创作素材' : kind === 'video' ? '成片视频' : '外部参考视频'; }
  const { cancelMediaOverlay, openMediaLibrary } = window.createProductDetailMediaBridge({
    state, data, clone, productName, render, toast, openAssociation, mediaPage, mediaLabel
  });
  function renderMedia(kind) {
    const items=filtered(data[kind].filter(x=>x.linked), kind==='material' ? ['name','product','type','time'] : kind==='reference' ? ['name','product','platform','source'] : ['name','product','file']);
    const label=mediaLabel(kind);
    const target=$(`#pda${kind==='material'?'Material':kind==='video'?'Video':'Reference'}Content`);
    target.innerHTML=`<div class="pda-panel-tools"><div><strong>已关联${label}</strong><span>${items.length} 项</span></div><button class="pda-btn primary" data-pda-open-library="${kind}" type="button">＋ 关联${label}</button></div>${items.length?`<div class="pda-media-grid">${items.map(item=>mediaCard(kind,item)).join('')}</div>`:empty(label)}`;
  }

  function associateOptions(kind) {
    if (kind === 'material') return { scope:[['all','全部类型'],['video','视频'],['image','图片']], status:[['all','全部状态'],['ok','已分析'],['pending','待分析'],['analyzing','分析中'],['fail','分析失败']] };
    if (kind === 'reference') return { scope:[['all','全部平台'],['douyin','抖音'],['kuaishou','快手'],['channels','视频号'],['xiaohongshu','小红书']], status:[['all','全部状态'],['done','已分析'],['pending','待分析'],['running','分析中'],['failed','分析失败']] };
    return { scope:[['all','全部来源'],['infinite','无限画板'],['remix','智能混剪'],['local','本地上传']], status:[['all','全部状态'],['done','已分析'],['pending','待分析'],['running','分析中'],['failed','分析失败']] };
  }
  function selectOptions(options) { return options.map(([value,label])=>`<option value="${value}">${label}</option>`).join(''); }
  function openAssociation(kind) {
    cancelMediaOverlay();
    const label = mediaLabel(kind);
    state.associate = { kind, search:'', scope:'all', status:'all', selected:new Set(data[kind].filter(item=>item.linked).map(item=>item.id)) };
    const options = associateOptions(kind);
    $('#pdaAssociateTitle').textContent = `关联${label}`;
    $('#pdaAssociateSearch').value = '';
    $('#pdaAssociateType').innerHTML = selectOptions(options.scope);
    $('#pdaAssociateStatus').innerHTML = selectOptions(options.status);
    renderAssociation();
    open('pdaAssociateModal');
  }
  function renderAssociation() {
    const associate = state.associate;
    if (!associate) return;
    const query = associate.search.trim().toLowerCase();
    const items = data[associate.kind].filter(item => {
      const scope = associate.kind === 'material' ? item.type : associate.kind === 'reference' ? item.platform : item.source;
      const text = [item.name,item.file,item.product,...(item.tags||[])].join(' ').toLowerCase();
      return (!query || text.includes(query)) && (associate.scope === 'all' || scope === associate.scope) && (associate.status === 'all' || item.status === associate.status);
    });
    $('#pdaAssociateGrid').innerHTML = items.length ? items.map(item => {
      const card = mediaCard(associate.kind,item);
      return card.replace('class="pda-media-card ', `class="pda-media-card ${associate.selected.has(item.id)?'pda-selected ':''}`);
    }).join('') : '<div class="pda-associate-empty">没有符合搜索和筛选条件的资产</div>';
    $('#pdaAssociateCount').textContent = `已选择 ${associate.selected.size} 项`;
  }
  function confirmAssociation() {
    const associate = state.associate;
    if (!associate) return;
    data[associate.kind].forEach(item => {
      item.linked = associate.selected.has(item.id);
      if (item.linked) { item.product = productName(); if (associate.kind === 'reference') item.productId = pdaProductIds[productName()] || item.productId || ''; }
    });
    if (associate.kind === 'reference') {
      const frame=document.querySelector('#page-reference-videos iframe');
      frame?.contentWindow?.postMessage({type:'rv-set-product-links',productId:pdaProductIds[productName()]||'',productName:productName(),selectedIds:data.reference.filter(item=>item.linked).map(item=>item.libraryId)},'*');
    }
    close('pdaAssociateModal');
    state.associate = null;
    render();
    toast('关联资产已更新');
  }

  function renderTemplates() {
    const type=state.template, items=filtered(data.template[type],['name','agent','text','scene','source']);
    let html='';
    if(type==='prompt') html=`<div class="pda-template-grid">${items.map(x=>`<article class="pda-template-card"><div class="pda-tags"><span class="pda-tag">${esc(x.agent)}</span>${x.isDefault?'<span class="pda-tag">默认</span>':''}</div><h4>${esc(x.name)}</h4><p>${esc(x.text)}</p><div class="pda-template-actions"><button class="pda-link" data-pda-action="prompt-default" data-id="${x.id}">设为默认</button><button class="pda-link" data-pda-action="use-image" data-id="${x.id}">用于生图</button><button class="pda-link" data-pda-action="template-edit" data-kind="prompt" data-id="${x.id}">编辑</button><button class="pda-link" data-pda-action="template-delete" data-kind="prompt" data-id="${x.id}">删除</button></div></article>`).join('')}</div>`;
    if(type==='persona') html=tableTemplate(['画像名称','年龄','核心场景','核心痛点','更新时间','操作'],items,x=>`<td><strong>${esc(x.name)}</strong></td><td>${x.age}</td><td>${esc(x.scene)}</td><td>${esc(x.pain)}</td><td>${x.updated}</td><td><div class="pda-actions"><button class="pda-link" data-pda-action="template-edit" data-kind="persona" data-id="${x.id}">编辑</button><button class="pda-link" data-pda-action="history" data-kind="persona" data-id="${x.id}">编辑历史</button><button class="pda-link" data-pda-action="template-copy" data-kind="persona" data-id="${x.id}">复制</button><button class="pda-link" data-pda-action="template-delete" data-kind="persona" data-id="${x.id}">删除</button></div></td>`);
    if(type==='canvas') html=`<div class="pda-template-grid">${items.map(x=>`<article class="pda-template-card" data-pda-canvas="${x.id}"><div class="pda-canvas-thumb">点击预览画板</div><h4>${esc(x.name)}</h4><div class="pda-meta"><span>${x.node}</span><span>${x.updated}</span></div></article>`).join('')}</div>`;
    if(type==='copy-structure') html=tableTemplate(['结构名称','来源','适用场景','更新时间','操作'],items,x=>`<td><strong>${esc(x.name)}</strong></td><td>${x.source}</td><td>${esc(x.scene)}</td><td>${x.updated}</td><td><div class="pda-actions"><button class="pda-link" data-pda-action="history" data-kind="copy-structure" data-id="${x.id}">查看详情</button>${x.source==='千川学习'?`<button class="pda-link" data-pda-action="template-copy" data-kind="copy-structure" data-id="${x.id}">复制为自建</button>`:`<button class="pda-link" data-pda-action="template-edit" data-kind="copy-structure" data-id="${x.id}">编辑</button><button class="pda-link" data-pda-action="template-copy" data-kind="copy-structure" data-id="${x.id}">复制</button><button class="pda-link" data-pda-action="template-delete" data-kind="copy-structure" data-id="${x.id}">删除</button>`}</div></td>`);
    if(type==='video-structure') html=tableTemplate(['结构名称','时长','分镜数','更新时间','操作'],items,x=>`<td><strong>${esc(x.name)}</strong></td><td>${x.duration}</td><td>${x.shots}</td><td>${x.updated}</td><td><div class="pda-actions"><button class="pda-link" data-pda-action="template-edit" data-kind="video-structure" data-id="${x.id}">编辑</button><button class="pda-link" data-pda-action="template-delete" data-kind="video-structure" data-id="${x.id}">删除</button></div></td>`);
    $('#pdaTemplateContent').innerHTML=items.length?html:empty('模板');
  }
  function tableTemplate(head,items,row){return `<div class="pda-table-wrap"><table class="pda-table"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${items.map(x=>`<tr>${row(x)}</tr>`).join('')}</tbody></table></div>`}
  function render() { setCounts(); ({copy:renderCopy,image:renderImages,script:renderScripts,material:()=>renderMedia('material'),video:()=>renderMedia('video'),reference:()=>renderMedia('reference'),template:renderTemplates}[state.tab])(); }

  function find(kind,id) { return kind==='template'?null:(data[kind]||[]).find(x=>x.id===id); }
  function open(id){const el=$(`#${id}`);if(el)el.hidden=false}
  function close(id){const el=$(`#${id}`);if(el)el.hidden=true}
  function closeMenus(){ closeAllPopovers(); }
  function download(item){
    const fname = item.file || item.name || 'asset.txt';
    const body = `原型文件:${fname}\n产品:${item.product||productName()}\n类型:${item.type||''}\n时长:${item.duration||''}\n创建:${item.created||item.time||''}`;
    const blob=new Blob([body],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fname;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('已开始下载');
  }
  function analyze(kind,item){
    if (kind === 'video') { if (item.status === 'done') return; item.status = 'running'; }
    else { if (item.status === 'ok') return; item.status = 'analyzing'; }
    render(); toast('分析任务已创建');
    setTimeout(()=>{ item.status = kind === 'video' ? 'done' : 'ok'; render(); toast('分析完成'); }, 900);
  }
  function openConfirm(title,text,action){state.confirm=action;$('#pdaConfirmTitle').textContent=title;$('#pdaConfirmText').textContent=text;open('pdaConfirmModal')}
  function openPreview(kind,item){
    state.preview={kind,item};
    const isImage=kind==='image' || item.type==='image';
    const isMat = kind==='material';
    $('#pdaPreviewType').textContent = isImage ? '图片预览' : (isMat ? '创作素材预览' : '成片预览');
    $('#pdaPreviewTitle').textContent = item.name;
    $('#pdaPreviewStage').innerHTML = `<div class="pda-preview-visual ${isImage?'image':''}"><div><b>${isImage?'▧':'▶'}</b><p>${esc(item.name)}</p></div></div>`;
    const tagStatus = item.status ? statusText[item.status] || item.status : '';
    const tagType = isMat ? (item.type==='image'?'图片':'视频') : (item.duration ? `${item.duration}s 视频` : '成片视频');
    $('#pdaPreviewInfo').innerHTML =
      `<div class="pda-tags">${tagStatus?`<span class="pda-tag">${esc(tagStatus)}</span>`:''}<span class="pda-tag">${esc(tagType)}</span>${item.product?`<span class="pda-tag">${esc(item.product)}</span>`:''}</div>`+
      `<div class="pda-info-grid" style="margin-top:14px">`+
        `<div><label>对应产品</label><strong>${esc(item.product||productName())}</strong></div>`+
        `<div><label>${isImage?'图片类型':(isMat?'所属文件夹':'所属文件夹')}</label><strong>${esc(item.folder||item.type||'-')}</strong></div>`+
        `<div><label>文件名称</label><strong>${esc(item.file||item.name)}</strong></div>`+
        `<div><label>${isImage?'分辨率 / 大小':(isMat?'时长 / 创建时间':'时长 / 创建时间')}</label><strong>${esc(isImage?(item.resolution||'-')+' / '+(item.size||'-'):(fvTime(item.duration)||item.duration||'-')+' / '+(item.created||item.time||'-'))}</strong></div>`+
      `</div>`+
      (!isImage && item.ads && item.ads.length ? `<div class="pda-tags" style="margin-top:14px">${item.ads.map(a=>`<span class="pda-tag">千川 ${esc(a.id)}</span>`).join('')}</div>` : '');
    $('#pdaPreviewAnalyze').hidden = isImage;
    const isDone = isMat ? (item.status === 'ok') : (item.status === 'done');
    $('#pdaPreviewAnalyze').disabled = isDone;
    $('#pdaPreviewAnalyze').textContent = isDone ? '已完成分析' : '分析';
    open('pdaPreviewModal');
  }
  // ============ 脚本库 1:1 复刻: 查看 / 编辑 / 复制 / 下载 / 删除 ============
  // 复用 script-library.css 已有的 .sl-modal / .sl-story-table / .sl-edit-* 样式
  function slModal(title, subtitle, body, footer='', small=false) {
    const host = document.createElement('div');
    host.className = 'sl-modal show pda-sl-modal';
    host.innerHTML = `<div class="sl-modal-backdrop" data-close></div><section class="sl-modal-card${small?' small':''}" role="dialog" aria-modal="true"><header class="sl-modal-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><button class="sl-modal-close" type="button" aria-label="关闭" data-close>×</button></header><div class="sl-modal-body">${body}</div>${footer?`<footer class="sl-modal-foot">${footer}</footer>`:''}</section>`;
    document.body.appendChild(host);
    host.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => host.remove()));
    return host;
  }
  function storyTable(script, editable=false) {
    const dynamicHeader = script.materialMode==='depend' ? '推荐素材' : '生视频提示词';
    if(!editable) return `<div class="sl-story-wrap"><table class="sl-story-table"><thead><tr><th>镜头</th><th>时间段</th><th>对应口播片段</th><th>景别</th><th>运镜方式</th><th>画面内容描述</th><th>${dynamicHeader}</th></tr></thead><tbody>${script.rows.map(row=>`<tr><td><span class="sl-shot">#${row.id}</span></td><td>${esc(row.time)}</td><td><span class="sl-cell-clamp">${esc(row.voice)}</span></td><td>${esc(row.shotType)}</td><td>${esc(row.cameraMove)}</td><td><span class="sl-cell-clamp">${esc(row.visual)}</span></td><td>${script.materialMode==='depend'?`<div class="sl-material-mini"><span class="sl-material-cover">${esc((row.material||'M-CL-101').split(' · ')[0])}</span><div><strong>${esc(row.material||'智能匹配素材')}</strong><small>9:16 · 与镜头时长匹配</small></div></div>`:`<span class="sl-video-prompt">${esc(row.videoPrompt)}</span>`}</td></tr>`).join('')}</tbody></table></div>`;
    return `<div class="sl-story-wrap"><table class="sl-edit-table"><thead><tr><th>顺序</th><th>时间段</th><th>对应口播片段</th><th>景别</th><th>运镜方式</th><th>画面内容描述</th><th>${dynamicHeader}</th><th>操作</th></tr></thead><tbody data-edit-rows>${script.rows.map((row,i)=>editRowHtml(row,i,script.materialMode)).join('')}</tbody></table></div><button class="sl-btn sl-add-row" type="button" data-add-row>＋ 新增分镜</button>`;
  }
  const editRowHtml = (row,i,mode) => `<tr data-row-index="${i}"><td><span class="sl-shot">#${i+1}</span></td><td><input data-field="time" value="${esc(row.time)}"></td><td><textarea data-field="voice">${esc(row.voice)}</textarea></td><td><input data-field="shotType" value="${esc(row.shotType)}"></td><td><input data-field="cameraMove" value="${esc(row.cameraMove)}"></td><td><textarea data-field="visual">${esc(row.visual)}</textarea></td><td>${mode==='depend'?`<input data-field="material" value="${esc(row.material||'智能匹配')}" aria-label="匹配素材">`:`<textarea data-field="videoPrompt" aria-label="生视频提示词">${esc(row.videoPrompt||'')}</textarea>`}</td><td class="sl-row-actions"><button class="sl-icon-btn" data-row-action="up" title="上移">↑</button><button class="sl-icon-btn" data-row-action="down" title="下移">↓</button><button class="sl-icon-btn delete" data-row-action="delete" title="删除">×</button></td></tr>`;

  function openScriptView(script) {
    const s = clone(script);
    const body = `<div class="sl-meta-grid"><div class="sl-meta"><small>对应产品</small><strong>${esc(s.product)}</strong></div><div class="sl-meta"><small>规格</small><strong>${esc(specsOf(s))}</strong></div><div class="sl-meta"><small>素材策略</small><strong>${modeText(s.materialMode)}</strong></div></div><section class="sl-source-block"><div><span>生成文案</span><button class="sl-link-btn" type="button" data-expand-source>展开全文</button></div><p>${esc(s.sourceFull)}</p></section>${storyTable(s)}`;
    const host = slModal(s.name, `最近更新：${s.updated}`, body, `<button class="sl-btn" data-view-edit>编辑脚本</button><button class="sl-btn" data-view-copy>复制脚本</button><button class="sl-btn" data-view-download>下载脚本</button><button class="sl-btn primary" data-close>关闭</button>`);
    host.querySelector('[data-expand-source]').addEventListener('click', e => { const box = e.currentTarget.closest('.sl-source-block'); box.classList.toggle('expanded'); e.currentTarget.textContent = box.classList.contains('expanded') ? '收起全文' : '展开全文'; });
    host.querySelector('[data-view-edit]').addEventListener('click', () => { host.remove(); openScriptEdit(script); });
    host.querySelector('[data-view-copy]').addEventListener('click', () => { host.remove(); openScriptCopy(script); });
    host.querySelector('[data-view-download]').addEventListener('click', () => downloadScript(script));
  }
  function collectRows(host, draft) {
    draft.rows = [...host.querySelectorAll('[data-edit-rows] tr')].map((tr,i) => {
      const read = f => tr.querySelector(`[data-field="${f}"]`)?.value.trim() || '';
      return { id:i+1, time:read('time'), voice:read('voice'), shotType:read('shotType'), cameraMove:read('cameraMove'), visual:read('visual'), material:draft.materialMode==='depend'?read('material'):'', videoPrompt:draft.materialMode==='free'?read('videoPrompt'):'' };
    });
  }
  function bindEditRows(host, draft, rerender) {
    host.querySelector('[data-add-row]')?.addEventListener('click', () => { collectRows(host, draft); draft.rows.push({ id:draft.rows.length+1, time:'', voice:'', shotType:'中景', cameraMove:'固定', visual:'', material:'智能匹配', videoPrompt:'' }); rerender(); });
    host.querySelectorAll('[data-row-action]').forEach(btn => btn.addEventListener('click', () => {
      collectRows(host, draft); const i = Number(btn.closest('tr').dataset.rowIndex); const act = btn.dataset.rowAction;
      if(act==='delete') draft.rows.splice(i,1);
      if(act==='up' && i>0) [draft.rows[i-1], draft.rows[i]] = [draft.rows[i], draft.rows[i-1]];
      if(act==='down' && i<draft.rows.length-1) [draft.rows[i+1], draft.rows[i]] = [draft.rows[i], draft.rows[i+1]];
      draft.rows.forEach((r,idx)=>r.id=idx+1); rerender();
    }));
  }
  function openScriptEdit(script) {
    const draft = clone(script);
    const body = `<div class="sl-edit-form"><label class="sl-edit-field"><span>脚本名称 *</span><input id="slEditName" value="${esc(draft.name)}"></label><label class="sl-edit-field"><span>目标时长(秒)*</span><input id="slEditDuration" type="number" min="1" step="1" value="${draft.duration}"></label><label class="sl-edit-field"><span>画面比例 *</span><select id="slEditRatio"><option ${draft.ratio==='9:16'?'selected':''}>9:16</option><option ${draft.ratio==='16:9'?'selected':''}>16:9</option></select></label><label class="sl-edit-field sl-mode-field"><span>素材策略 *</span><select id="slEditMode"><option value="depend" ${draft.materialMode==='depend'?'selected':''}>依赖素材库</option><option value="free" ${draft.materialMode==='free'?'selected':''}>不依赖素材库</option></select></label></div><label class="sl-edit-product"><span>对应产品 *</span><select id="slEditProduct">${pdaProductOptionsHtml(draft.product)}</select></label><div data-edit-dynamic></div><div data-edit-story></div>`;
    const host = slModal(`编辑脚本 · ${script.name}`, '修改仅作用于当前脚本,不影响生成文案或其他脚本。', body, `<button class="sl-btn sl-danger" data-edit-delete>删除脚本</button><button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-save-edit>保存修改</button>`);
    const renderEditor = () => {
      const dynamicText = draft.materialMode==='depend' ? '系统会依据镜头时长和画面内容自动匹配素材;可直接修改每行的匹配素材。' : '每条分镜需填写生视频提示词,可直接用于后续视频生成工具。';
      const dynamicActions = draft.materialMode==='depend' ? '<button type="button" data-rematch>重新匹配素材</button>' : '<button type="button" data-recalc-voice>重新计算口播时长</button>';
      $('[data-edit-dynamic]', host).innerHTML = `<div class="sl-edit-dynamic"><span class="sl-edit-dynamic-text">${dynamicText}</span><span class="sl-edit-dynamic-actions">${dynamicActions}</span></div>`;
      $('[data-edit-story]', host).innerHTML = storyTable(draft, true);
      bindEditRows(host, draft, renderEditor);
      host.querySelector('[data-rematch]')?.addEventListener('click', () => {
        collectRows(host, draft);
        draft.rows.forEach((r,i) => r.material = `M-CL-${String(101+i).padStart(3,'0')} · ${i%2?'3':'2'}s`);
        renderEditor();
        toast('已重新匹配当前分镜素材');
      });
      host.querySelector('[data-recalc-voice]')?.addEventListener('click', () => {
        collectRows(host, draft);
        const CHARS_PER_SECOND = 4;
        const countChars = t => (t||'').replace(/\s/g,'').length;
        const total = draft.rows.reduce((s,r) => s+countChars(r.voice), 0);
        if(total===0) return toast('暂无口播内容,无法计算');
        const totalSec = Math.max(1, Math.ceil(total/CHARS_PER_SECOND));
        const pad2 = n => String(n).padStart(2,'0');
        let cursor = 0;
        const each = draft.rows.map(r => Math.max(1, Math.round((countChars(r.voice)/total)*totalSec)));
        const sumEach = each.reduce((a,b)=>a+b,0);
        if(sumEach!==totalSec && each.length) each[each.length-1] += totalSec - sumEach;
        draft.rows.forEach((r,i)=>{ const start=cursor; const end=Math.min(totalSec, cursor+each[i]); cursor=end; r.time=`${pad2(start)}—${pad2(end)}s`; const tr = host.querySelector(`[data-edit-rows] tr[data-row-index="${i}"]`); tr?.querySelector('[data-field="time"]') && (tr.querySelector('[data-field="time"]').value = r.time); });
        draft.duration = totalSec;
        const dur = host.querySelector('#slEditDuration'); if(dur) dur.value = totalSec;
        toast(`已重算口播:共 ${total} 字 ≈ ${totalSec} 秒`);
      });
    };
    renderEditor();
    host.querySelector('#slEditMode').addEventListener('change', e => { collectRows(host, draft); draft.materialMode = e.target.value; renderEditor(); });
    host.querySelector('[data-save-edit]').addEventListener('click', () => {
      collectRows(host, draft);
      draft.name = host.querySelector('#slEditName').value.trim();
      draft.duration = Number(host.querySelector('#slEditDuration').value);
      draft.ratio = host.querySelector('#slEditRatio').value;
      draft.product = host.querySelector('#slEditProduct').value.trim();
      if(!draft.name || !Number.isInteger(draft.duration) || draft.duration<=0 || !draft.rows.length) return toast('请完整填写脚本名称、时长和至少一条分镜');
      if(draft.rows.some(r => !r.time || !r.voice || !r.visual || (draft.materialMode==='free' && !r.videoPrompt))) return toast(draft.materialMode==='free' ? '请补充每条分镜的生视频提示词' : '请补充分镜必填信息');
      draft.updated = now();
      draft.materialStatus = draft.materialMode==='depend' ? `${draft.rows.length}/${draft.rows.length} 已匹配` : '已生成提示词';
      draft.copy = draft.rows.map(r => r.voice).join(' ');
      draft.spec = specsOf(draft);
      draft.strategy = modeText(draft.materialMode);
      draft.material = draft.materialStatus;
      const idx = data.script.findIndex(s => s.id===script.id);
      if(idx>-1) data.script[idx] = draft;
      host.remove(); render(); toast('脚本已保存');
    });
    host.querySelector('[data-edit-delete]').addEventListener('click', () => { host.remove(); openScriptDelete(script); });
  }
  function openScriptCopy(script) {
    const defaultName = `${script.name}_副本`;
    const host = slModal('复制脚本', '复制后将生成独立脚本,不影响原脚本。', `<div class="sl-confirm-copy">将复制 <b>${esc(script.name)}</b> 的分镜、素材策略和素材关联。</div><input class="sl-copy-name" value="${esc(defaultName)}" aria-label="新脚本名称">`, `<button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-confirm-copy>确认复制</button>`, true);
    host.querySelector('[data-confirm-copy]').addEventListener('click', () => {
      const name = host.querySelector('.sl-copy-name').value.trim();
      if(!name) return toast('请输入新脚本名称');
      const copied = clone(script);
      copied.id = `s${Date.now()}`;
      copied.name = name;
      copied.updated = now();
      data.script.unshift(copied);
      host.remove(); render(); toast('脚本已复制'); openScriptView(copied);
    });
  }
  function downloadScript(script) {
    const blob = new Blob([JSON.stringify(script, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${script.name}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast('脚本已下载');
  }
  function openScriptDelete(script) {
    const host = slModal('删除脚本', '删除后无法恢复。', `<div class="sl-confirm-copy">确认删除 <b>${esc(script.name)}</b> 吗?</div>`, `<button class="sl-btn" data-close>取消</button><button class="sl-btn primary" data-confirm-delete>确认删除</button>`, true);
    host.querySelector('[data-confirm-delete]').addEventListener('click', () => {
      data.script = data.script.filter(s => s.id !== script.id);
      host.remove(); render(); toast('脚本已删除');
    });
  }

  // ============ 旧 openEdit 简版 - 重命名为复用版, 仅服务非脚本/非媒体字段 ============
  function openEdit(kind,item,mode){state.edit={kind,item,mode};const titles={rename:'重命名',tag:'编辑标签',product:'关联产品',move:'移动至文件夹',qianchuan:'更换千川素材 ID','edit-copy':'编辑文案','template-edit':'编辑模板',history:'详情'};$('#pdaEditTitle').textContent=titles[mode]||'编辑信息';let fields='';
    if(mode==='rename') fields=field('文件名称',item.file||item.name,'name');
    if(mode==='tag') fields=field('标签(多个标签用逗号分隔)',(item.tags||[]).join(','),'tags');
    if(mode==='product') fields=`<div class="pda-field"><label>关联产品</label><select name="product"><option>${esc(productName())}</option><option>净澈洗地机</option><option>空气炸锅</option></select><small>更换为其他产品后,该资产将从当前产品的关联资产中移除。</small></div>`;
    if(mode==='move') fields=`<div class="pda-field"><label>所属文件夹</label><select name="folder"><option>除螨仪项目</option><option>营销活动</option><option>内部制作</option><option>待整理</option></select></div>`;
    if(mode==='qianchuan') {
      const current = (item.ads && item.ads[0] && item.ads[0].id) || '';
      fields=field('千川素材 ID', current, 'qianchuan', '请输入一个千川素材 ID');
    }
    if(mode==='edit-copy') fields=area('文案内容',item.text,'text');
    if(mode==='template-edit') fields=field('名称',item.name,'name')+area('内容',item.text||item.pain||item.scene||'', 'text');
    if(mode==='history') fields=`<div class="pda-history"><b>${esc(item.name)}</b><p>当前版本:V3 最近更新:${esc(item.updated||'08/08 12:00')}</p><p>V2 优化结构字段与适用场景</p><p>V1 创建资产</p></div>`;
    $('#pdaEditFields').innerHTML=fields;$('#pdaEditForm').querySelector('button[type="submit"]').hidden=mode==='history';open('pdaEditModal')}
  function field(label,value,name,placeholder=''){return `<div class="pda-field"><label>${label}</label><input name="${name}" value="${esc(value)}" placeholder="${placeholder}" required></div>`}
  function area(label,value,name){return `<div class="pda-field"><label>${label}</label><textarea name="${name}" required>${esc(value)}</textarea></div>`}

  function renderActive(){render();}

  root.addEventListener('click',e=>{
    const tab=e.target.closest('[data-pda-tab]');if(tab){state.tab=tab.dataset.pdaTab;state.search='';$('#pdaSearch').value='';$$('[data-pda-tab]',root).forEach(x=>x.classList.toggle('active',x===tab));$$('[data-pda-panel]',root).forEach(x=>x.classList.toggle('active',x.dataset.pdaPanel===state.tab));render();return}
    const tt=e.target.closest('[data-pda-template]');if(tt){state.template=tt.dataset.pdaTemplate;$$('[data-pda-template]',root).forEach(x=>x.classList.toggle('active',x===tt));renderTemplates();return}
    const openLibrary=e.target.closest('[data-pda-open-library]');if(openLibrary){openMediaLibrary(openLibrary.dataset.pdaOpenLibrary);return}
    const img=e.target.closest('[data-pda-image]');if(img){openPreview('image',find('image',img.dataset.pdaImage));return}
    const canvas=e.target.closest('[data-pda-canvas]');if(canvas){const item=data.template.canvas.find(x=>x.id===canvas.dataset.pdaCanvas);openEdit('template',item,'history');return}
    // 卡片样式保留在产品详情；交互统一委托给视频库原页面。
    const toggle=e.target.closest('[data-pda-menu-toggle]');if(toggle){
      const kind=toggle.dataset.kind, id=toggle.dataset.id;
      e.stopPropagation();
      if (kind && id) openMediaLibrary(kind,find(kind,id),'menu',toggle.getBoundingClientRect());
      return;
    }
    // 媒体卡片 选择圆 - 切换选中态(对齐源页 select-mark 点击)
    const selMark = e.target.closest('[data-pda-select]');
    if (selMark) {
      e.stopPropagation();
      const card = selMark.closest('.pda-media-card');
      card?.classList.toggle('pda-selected');
      return;
    }
    // 媒体卡片 点击
    const card=e.target.closest('.pda-media-card');if(card&&!e.target.closest('.pda-mat-more,.pda-fv-more')){
      const kind=card.dataset.kind,item=find(kind,card.dataset.id);
      if (!item) return;
      if(e.target.closest('[data-pda-cover]')) openMediaLibrary(kind,item,'preview');
      else if(e.target.closest('[data-pda-info]')) openMediaLibrary(kind,item,'detail');
      return;
    }
    const action=e.target.closest('[data-pda-action]');if(action)handleAction(action);
  });
  $('#pdaSearch').addEventListener('input',e=>{state.search=e.target.value;render()});
  $('#pdaAssociateSearch').addEventListener('input',e=>{if(!state.associate)return;state.associate.search=e.target.value;renderAssociation()});
  $('#pdaAssociateType').addEventListener('change',e=>{if(!state.associate)return;state.associate.scope=e.target.value;renderAssociation()});
  $('#pdaAssociateStatus').addEventListener('change',e=>{if(!state.associate)return;state.associate.status=e.target.value;renderAssociation()});
  $('#pdaAssociateGrid').addEventListener('click',e=>{
    const card=e.target.closest('.pda-media-card');
    if(!card||!state.associate)return;
    const id=card.dataset.id;
    if(state.associate.selected.has(id))state.associate.selected.delete(id);else state.associate.selected.add(id);
    renderAssociation();
  });
  $('#pdaAssociateConfirm').addEventListener('click',confirmAssociation);
  $$('[data-pda-close]').forEach(btn=>btn.addEventListener('click',()=>close(btn.dataset.pdaClose)));
  $$('.pda-layer').forEach(layer=>layer.addEventListener('click',e=>{if(e.target===layer)close(layer.id)}));
  $('#pdaConfirmAction').addEventListener('click',()=>{const fn=state.confirm;close('pdaConfirmModal');state.confirm=null;if(fn)fn()});
  $('#pdaPreviewDownload').addEventListener('click',()=>state.preview&&download(state.preview.item));
  $('#pdaPreviewAnalyze').addEventListener('click',()=>{if(!state.preview)return;analyze(state.preview.kind,state.preview.item);close('pdaPreviewModal')});
  $('#pdaEditForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget),{item,mode}=state.edit||{};if(!item)return;for(const [k,v] of fd){
      if(k==='tags')item.tags=String(v).split(/[,,]/).map(s=>s.trim()).filter(Boolean);
      else if(k==='qianchuan'){ item.ads = v ? [{id:String(v)}] : []; }
      else item[k]=v;
    }
    if(mode==='product'&&item.product!==productName())item.linked=false;
    close('pdaEditModal');render();toast('已保存')});

  function handleAction(btn){
    const a=btn.dataset.pdaAction,kind=btn.dataset.kind,id=btn.dataset.id,item=kind?find(kind,id):null;
    closeMenus();
    if(a==='download')return download(item);
    if(a==='analyze')return analyze(kind,item);
    // 媒体菜单项 - 创作素材 + 成片视频共用
    if(a==='rename')return openEdit(kind,item,'rename');
    if(a==='tag' || a==='tags')return openEdit(kind,item,'tag');
    if(a==='product')return openEdit(kind,item,'product');
    if(a==='move' || a==='folder')return openEdit(kind,item,'move');
    if(a==='qianchuan')return openEdit(kind,item,'qianchuan');
    if(a==='delete') {
      const target = item || (kind ? (data[kind]||[]).find(x=>x.id===id) : null);
      if (!target) return;
      return openConfirm('删除资产','删除后无法恢复,相关分析结果将同步删除。确认删除?',()=>{ const arr=data[kind]; if (!arr) return; const idx=arr.findIndex(x=>x.id===id); if(idx>-1)arr.splice(idx,1); render(); toast('已删除'); });
    }
    if(a==='edit-copy')return openEdit('copy',data.copy.find(x=>x.id===id),'edit-copy');
    if(a==='ai'){
      const agentType={'智能改写':'rewrite','爆款仿写':'copy','智能脚本':'script','智能混剪':'mix'}[btn.dataset.value];
      const source=data.copy.find(x=>x.id===id);
      sessionStorage.setItem('productAssetAiDraft',JSON.stringify({agentType,text:source?.text||'',product:productName()}));
      document.querySelector('[data-page="creation"]')?.click();
      setTimeout(()=>document.querySelector(`.agent-card[data-type="${agentType}"]`)?.click(),60);
      return toast(`已定位至${btn.dataset.value}会话`);
    }
    // 脚本库 1:1 操作
    if(a.startsWith('script-')){
      const x=data.script.find(v=>v.id===id);
      if(!x)return;
      const op=a.slice(7);
      if(op==='查看')return openScriptView(x);
      if(op==='编辑')return openScriptEdit(x);
      if(op==='复制')return openScriptCopy(x);
      if(op==='下载')return downloadScript(x);
      if(op==='删除')return openScriptDelete(x);
    }
    const list=data.template[kind]||[],x=list.find(v=>v.id===id);
    if(a==='prompt-default'){data.template.prompt.forEach(v=>v.isDefault=v.id===id);render();return toast('已设为默认模板')}
    if(a==='use-image')return toast('已带入商品主图 Agent');
    if(a==='template-edit')return openEdit('template',x,'template-edit');
    if(a==='history')return openEdit('template',x,'history');
    if(a==='template-copy'){list.push({...x,id:`t${Date.now()}`,name:`${x.name}_副本`,source:x.source==='千川学习'?'自建':x.source,updated:'刚刚'});render();return toast('已复制')};
    if(a==='template-delete')return openConfirm('删除模板','删除后无法恢复,确认删除该模板?',()=>{const i=list.findIndex(v=>v.id===id);if(i>-1)list.splice(i,1);render();toast('已删除')});
  }

  setCounts(); render();
})();

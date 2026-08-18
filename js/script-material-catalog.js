/* 内容罗盘 · 脚本素材共享池
 * 智能脚本最后结果页 / 脚本库 / 混剪素材 复用同一份数据
 * 暴露在 window.ScriptMaterialLib 供各模块使用
 */
(() => {
  const SCRIPT_MATERIAL_CATALOG = {
    "产品特写": [
      { id:"M-CL-101", duration:2.0, tags:["尘杯特写","透明可视","脏污证据"] },
      { id:"M-CL-102", duration:1.5, tags:["主机特写","按钮细节"] },
      { id:"M-CL-103", duration:1.0, tags:["握把近景","手持姿势"] }
    ],
    "产品全景": [
      { id:"M-PF-201", duration:2.0, tags:["白色家电","卧室全景"] },
      { id:"M-PF-202", duration:1.5, tags:["沙发场景","客厅全景"] },
      { id:"M-PF-203", duration:1.0, tags:["布艺椅","俯视全景"] }
    ],
    "使用场景": [
      { id:"M-SC-301", duration:1.5, tags:["床垫推进","清洁中"] },
      { id:"M-SC-302", duration:1.5, tags:["沙发表面","灰尘扬起"] },
      { id:"M-SC-303", duration:1.0, tags:["儿童房间","温馨感"] }
    ],
    "痛点对比": [
      { id:"M-PC-401", duration:1.2, tags:["脏污特写","毛发碎屑"] },
      { id:"M-PC-402", duration:1.5, tags:["使用前","床面脏污"] },
      { id:"M-PC-403", duration:1.3, tags:["使用后","干净对比"] }
    ],
    "活动物料": [
      { id:"M-AT-501", duration:1.5, tags:["品牌角标","行动按钮"] },
      { id:"M-AT-502", duration:2.0, tags:["暑期活动","优惠信息"] },
      { id:"M-AT-503", duration:1.0, tags:["产品定帧","CTA收口"] }
    ]
  };

  const SCRIPT_MATERIAL_SAMPLE_META = {
    "M-CL-101": { name:"透明尘杯脏污特写", scene:"床垫清洁", duration:2, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/08 09:14", tags:["脏污证据", "结果直给"] },
    "M-CL-102": { name:"拍打吸尘动作特写", scene:"床垫使用", duration:3, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/08 08:42", tags:["真实操作", "拍打吸尘"] },
    "M-CL-103": { name:"机身按键与吸口细节", scene:"产品卖点", duration:5, type:"video", status:"pending", product:"轻净 Pro 除螨仪", created:"08/07 17:35", tags:["功能展示", "产品特写"] },
    "M-PF-201": { name:"卧室床垫清洁全景", scene:"家庭卧室", duration:2, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/07 15:20", tags:["使用场景", "床垫清洁"] },
    "M-PF-202": { name:"沙发布艺清洁全景", scene:"客厅沙发", duration:3, type:"video", status:"ok", product:"", created:"08/07 11:36", tags:["养宠家庭", "毛发清理"] },
    "M-PF-203": { name:"多场景使用切换", scene:"床垫与沙发", duration:5, type:"video", status:"analyzing", product:"轻净 Pro 除螨仪", created:"08/06 18:24", tags:["一机多用", "家庭清洁"] },
    "M-SC-301": { name:"床垫表面推进清洁", scene:"卧室日常", duration:3, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/06 16:11", tags:["使用过程", "镜头推进"] },
    "M-SC-302": { name:"沙发表面拍打吸尘", scene:"养宠家庭", duration:5, type:"video", status:"fail", product:"", created:"08/06 10:08", tags:["毛发清理", "真实使用"] },
    "M-SC-303": { name:"儿童房床垫深度清洁", scene:"亲子家庭", duration:10, type:"video", status:"ok", product:"轻净 Pro 除螨仪", created:"08/05 19:42", tags:["完整过程", "家庭场景"] },
    "M-PC-401": { name:"毛发皮屑脏污特写", scene:"清洁痛点", duration:0, type:"image", status:"ok", product:"轻净 Pro 除螨仪", created:"08/05 15:50", tags:["视觉冲击", "脏污特写"] },
    "M-PC-402": { name:"床面使用前对比", scene:"床垫卫生", duration:0, type:"image", status:"ok", product:"轻净 Pro 除螨仪", created:"08/05 13:27", tags:["前后对比", "痛点呈现"] },
    "M-PC-403": { name:"床面使用后对比", scene:"清洁结果", duration:5, type:"video", status:"pending", product:"轻净 Pro 除螨仪", created:"08/05 11:08", tags:["前后对比", "结果直给"] },
    "M-AT-501": { name:"品牌角标与行动按钮", scene:"品牌收口", duration:0, type:"image", status:"ok", product:"轻净 Pro 除螨仪", created:"08/04 18:30", tags:["CTA", "品牌露出"] },
    "M-AT-502": { name:"夏季深度清洁活动", scene:"营销活动", duration:0, type:"image", status:"analyzing", product:"轻净 Pro 除螨仪", created:"08/04 14:12", tags:["促销信息", "活动氛围"] },
    "M-AT-503": { name:"产品定帧与购买引导", scene:"品牌收口", duration:0, type:"image", status:"ok", product:"", created:"08/03 19:02", tags:["完整尾帧", "购买引导"] }
  };

  const SCRIPT_MATERIAL_FOLDERS = [
    { name:"产品素材", children:["产品特写", "产品全景"] },
    { name:"场景表达", children:["使用场景", "痛点对比"] },
    { name:"包装物料", children:["活动物料"] }
  ];

  function allScriptMaterials() {
    return Object.entries(SCRIPT_MATERIAL_CATALOG).flatMap(([group, items]) => items.map(item => ({
      ...item,
      ...SCRIPT_MATERIAL_SAMPLE_META[item.id],
      group,
      name: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.name || item.tags[0] || item.id,
      scene: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.scene || item.tags[1] || group,
      type: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.type || "video",
      status: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.status || "ok",
      product: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.product || "",
      created: SCRIPT_MATERIAL_SAMPLE_META[item.id]?.created || ""
    })));
  }

  function findScriptMaterial(id) {
    return allScriptMaterials().find(item => item.id === id);
  }

  // 与智能脚本最后结果页 buildMaterialPlan 同源:按 group 拉候选、组合完整/拼接/截取方案
  function buildMaterialPlan(shotDuration, groupIds) {
    shotDuration = Number(shotDuration) || 3;
    const sourceIds = groupIds?.length ? groupIds : allScriptMaterials().map(item => item.id);
    const pool = [...new Map(sourceIds.flatMap(id => {
      const material = findScriptMaterial(id);
      return material ? [material] : allScriptMaterials().filter(item => item.group === id);
    }).map(item => [item.id, item])).values()];
    if (!pool.length) return [];
    const plans = [], seen = new Set();
    const add = (items, label) => {
      const key = items.map(item => item.id).join("+");
      if (seen.has(key) || plans.length >= 8) return;
      seen.add(key);
      plans.push({ planId:label, items, duration:items.reduce((sum, item) => sum + (item.useDuration || item.duration), 0) });
    };
    pool.filter(item => Math.abs(item.duration - shotDuration) < .05).forEach(item => add([{ ...item, useDuration:shotDuration }], "完整素材"));
    for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
      const total = pool[i].duration + pool[j].duration;
      if (Math.abs(total - shotDuration) < .1) add([pool[i], pool[j]], "拼接素材");
      if (total > shotDuration && pool[i].duration < shotDuration) {
        add([pool[i], { ...pool[j], useDuration:shotDuration - pool[i].duration, clipped:true }], "拼接截取");
      }
    }
    pool.filter(item => item.duration > shotDuration).forEach(item => add([{ ...item, useDuration:shotDuration, clipped:true }], "截取素材"));
    if (!plans.length) add([{ ...pool[0], useDuration:shotDuration || pool[0].duration, clipped:true }], "智能匹配");
    return plans;
  }

  window.ScriptMaterialLib = {
    SCRIPT_MATERIAL_CATALOG,
    SCRIPT_MATERIAL_SAMPLE_META,
    SCRIPT_MATERIAL_FOLDERS,
    allScriptMaterials,
    findScriptMaterial,
    buildMaterialPlan
  };
})();

    /* ── 爆款内容结构：统一管理说什么、拍什么、怎么剪 ── */
    const clNewModal = document.getElementById("clNewModal");
    const clDeleteModal = document.getElementById("clDeleteModal");
    const clDetailDrawer = document.getElementById("clDetailDrawer");
    const clDrawerOverlay = document.getElementById("clDrawerOverlay");
    const clLearningSampleDetail = document.getElementById("clLearningSampleDetail");
    const clLearningSampleDetailBody = document.getElementById("clLearningSampleDetailBody");
    const clEscape = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
    const clVariableDescriptions = {
      "产品名":"本次创作所选产品的名称", "可视化结果":"可被画面直接证明的结果，如前后差异、吸出物或使用后状态", "表面状态":"用户以为正常、但实际仍存在问题的状态", "隐性问题":"需要通过产品解决的深层问题或风险",
      "核心动作":"产品完成关键能力的可拍摄动作", "问题对象":"被处理、解决或改善的具体对象", "核心场景":"产品最主要的使用场景", "扩展场景":"可补充证明效果的其他使用场景", "可验证内容":"可在画面或产品事实中验证的结果",
      "预期反差":"结果与用户原有认知之间的差异", "关键动作":"能完整说明产品能力的核心操作", "使用场景":"用户实际发生问题或使用产品的场景", "目标人群":"最容易对该问题产生共鸣的用户",
      "生活场景":"目标用户高频发生、易代入的日常情境", "触发问题":"在该情境下被感知到的具体不便或需求", "现实限制":"时间、精力、空间或操作条件带来的阻碍", "原有方式":"用户当前采用但效果有限的做法",
      "具体问题":"需要被产品改善的明确问题", "实际损失":"问题持续带来的时间、体验或成本损失", "关键环节":"产品发挥能力时最值得呈现的步骤", "解决结果":"该动作直接带来的可感知改善",
      "核心卖点":"产品能解决问题的关键能力或优势", "核心价值":"用户最终获得的主要价值", "行动入口":"用户下一步可执行的了解或购买入口", "用户认知":"用户原先的习惯、判断或误区",
      "证明结果":"可通过画面、事实或使用反馈验证的结论", "核心需求":"目标人群最在意的待解决需求", "关键信息":"需要在本阶段被用户理解的利益点", "权益信息":"当前可用、且可核验的价格或福利信息",
      "优惠门槛":"获得权益需要满足的条件", "权益价值":"用户因优惠而获得的明确价值", "购买顾虑":"阻碍用户进一步行动的主要顾虑"
    };

    let contentStructures = [
      {
        id: 1, name: "结果前置·实拍证明型", formula: "结果钩子 → 痛点解释 → 产品演示 → 效果证明 → 行动引导",
        source: "千川学习", method: "平台数据学习", learningStatus:"生效中", learningSampleCount:3842, learnedAt:"2026-08-10", updated: "08-10 16:42", parseStatus:"completed", mixProfile:"result", autoProductIds:["mite-pro"], productNames:["轻净 Pro 除螨仪"], scriptTypes:["痛点类型","活动类型","对比类型","点名人群类型","网络爆款音频类型","正话反说类型"], defaultForScriptTypes:["痛点类型","活动类型","网络爆款音频类型"],
        stages: [
          { name:"结果型视觉钩子", purpose:"先给结果，快速建立好奇与观看理由", say:"先抛出清洁后的反差结果，让用户立刻知道视频能解决什么问题。", talk:"先别听我讲参数，直接看{产品名}走完一遍后的{可视化结果}。", slots:["产品名","可视化结果"], visual:"可被直接验证的结果、前后差异或反常状态；至少 1 个近景镜头。", edit:"1–2 个近景；单镜 1–2 秒；结果画面直接硬切进入。" },
          { name:"隐性痛点放大", purpose:"解释为什么表面正常仍需要解决", say:"说明肉眼看着干净，不代表纤维深处没有毛发、碎屑和灰尘。", talk:"你以为{表面状态}就够了，其实{隐性问题}并没有解决。", slots:["表面状态","隐性问题"], visual:"问题对象的细节、隐性问题的可见证据，或用户常见错误做法。", edit:"2–3 个细节镜头；正常速度；随信息点硬切。" },
          { name:"产品能力演示", purpose:"用真实操作承接解决方案，而不是只讲参数", say:"表达高频拍打与同步吸尘如何把深层脏污带出来。", talk:"{产品名}通过{核心动作}，把{问题对象}直接带出来。", slots:["核心动作","问题对象"], visual:"产品露出、关键动作与完整使用过程；动作镜头需连续清晰。", edit:"3–4 个动作镜头；保留完整关键动作；可轻微加速。" },
          { name:"结果与场景证明", purpose:"证明产品有效，并覆盖更多使用场景", say:"用可见结果强化清洁能力和真实可信感。", talk:"{核心场景}、{扩展场景}都能用，清洁结果可以直接看见。", slots:["核心场景","扩展场景"], visual:"使用后结果、前后对比，以及一个以上可复用场景。", edit:"2 个结果镜头；结果特写短暂停留；多场景硬切。" },
          { name:"行动引导", purpose:"收束价值并给出明确下一步", say:"引导进入商品页查看完整实测与产品信息。", talk:"想看{可验证内容}，点击商品了解更多。", slots:["可验证内容"], visual:"产品主体、使用完成状态或可承接口播的稳定画面。", edit:"1–2 个稳定镜头；素材不足可短时定帧。" }
        ],
        reuse:"需要有可视化结果、完整操作过程或前后对比等可证明画面；仅有静态产品展示时不建议使用。",
        example:{ title:"轻净 Pro 除螨仪｜床褥结果冲击型", meta:"代表性高消耗成品 · 素材 ID 7553983811703193643", badge:"消耗 ¥328,460", copy:"你以为床垫看着干净就够了吗？实际走一遍才知道，藏在纤维深处的细小灰尘根本不是换床单能解决的。轻净 Pro 边拍边吸，尘杯里的结果当场就能看见。" }
      },
      {
        id: 2, name: "场景代入·功能证明型", formula: "生活场景 → 问题出现 → 功能演示 → 成品证明 → 优惠收口",
        source: "千川学习", method: "平台数据学习", learningStatus:"生效中", learningSampleCount:1276, learnedAt:"2026-07-26", updated: "07-26 10:18", parseStatus:"completed", mixProfile:"scene", autoProductIds:["air-a8"], productNames:["轻享空气炸锅 A8"], scriptTypes:["打感情类型","种草类型","活动类型","网络爆款音频类型"], defaultForScriptTypes:["打感情类型","种草类型"],
        stages: [
          { name:"生活场景", say:"从下班晚、做饭麻烦的真实场景切入。", visual:"目标用户的日常环境、人物行为，以及问题出现前的触发画面。", edit:"2–3 个环境与人物镜头；正常速度；硬切。" },
          { name:"问题出现", say:"点出传统烹饪耗时、油烟和看火的问题。", visual:"问题发生过程、原有方式的局限，或用户等待与处理的细节。", edit:"2–3 个问题镜头；单镜 1–2 秒。" },
          { name:"功能演示", say:"说明快速升温、少油烹饪和可视窗口。", visual:"关键操作起止、功能发生过程，以及用户可观察到的操作反馈。", edit:"4–6 个完整操作镜头；等待过程可加速。" },
          { name:"成品证明", say:"描述外酥里嫩和省时结果。", visual:"使用后结果的近景、关键细节，或真实用户的结果反馈。", edit:"2–3 个近景；结果特写短暂停留。" },
          { name:"优惠收口", say:"说明当前权益并引导查看商品。", visual:"产品主体、核心结果或权益信息可同框的稳定画面。", edit:"稳定镜头承接口播；末尾硬切结束。" }
        ],
        example:{ title:"空气炸锅 A8｜下班晚餐场景", meta:"代表性高消耗成品 · 素材 ID 7553983811703195882", badge:"消耗 ¥216,780", copy:"下班晚又不想点外卖，把腌好的鸡翅放进去，选好时间就不用守着。可视窗口能直接看熟度，少油也能烤出焦脆表面。" }
      },
      {
        id: 3, name: "人群点名·卖点展开型", formula: "人群点名 → 需求唤醒 → 核心卖点 → 证明补充 → 产品推荐",
        source: "千川学习", method: "平台数据学习", learningStatus:"生效中", learningSampleCount:864, learnedAt:"2026-07-10", updated: "07-10 18:20", parseStatus:"completed", mixProfile:"audience", autoProductIds:[], productNames:[], scriptTypes:["点名人群类型","痛点类型","打感情类型"], defaultForScriptTypes:["点名人群类型"],
        stages: [
          { name:"人群点名", say:"直接点名最容易产生共鸣的一类目标用户。", visual:"目标人群在典型生活场景中的状态。", edit:"1–2 个人物或场景镜头；快速进入主题。" },
          { name:"需求唤醒", say:"说明这类人经常遇到的具体问题与损失。", visual:"问题发生过程和细节证据。", edit:"2–3 个问题镜头；跟随信息点硬切。" },
          { name:"核心卖点", say:"围绕一个核心卖点解释产品如何解决问题。", visual:"产品完整操作和关键功能特写。", edit:"3–5 个动作镜头；动作连续；必要时轻微加速。" },
          { name:"证明补充", say:"用结果、参数事实或使用反馈补足可信度。", visual:"结果对比、细节特写或真实使用反应。", edit:"2–3 个证据镜头；结果画面短暂停留。" },
          { name:"产品推荐", say:"总结适合谁，并引导查看产品。", visual:"产品全貌、使用完成或收纳画面。", edit:"1–2 个稳定收尾镜头。" }
        ],
        example:{ title:"通用结构示例｜家庭清洁人群", meta:"平台学习样例 · 已脱敏", badge:"高转化", copy:"家里有孩子或者宠物的，日常清洁最怕看不见的残留。与其反复打扫，不如直接看一遍完整实测，再决定这类产品适不适合你。" }
      },
      {
        id: 4, name: "反差开场·实测证明型", formula: "反差开场 → 过程实测 → 结果证明 → 行动引导",
        source: "自建", method: "从参考视频提炼", reference:"洗地机紫色污渍实测_成品01.mp4", creator:"嗡大发", createdAt:"2026-08-11 09:16", updated: "08-11 09:16", parseStatus:"completed", validationStatus:"提炼完成", parseSummary:"已识别口播、12 个镜头与 4 个内容段落", mixProfile:"contrast", autoProductIds:["washer-s5"], productNames:[], scriptTypes:["对比类型","制造焦虑类型","正话反说类型","种草类型","引发好奇类型"], defaultForScriptTypes:["对比类型","制造焦虑类型","正话反说类型","引发好奇类型"],
        stages: [
          { name:"反差开场", say:"先给出结果，制造预期反差。", strategy:"先让结果占据注意力，再用预期反差解释为什么值得继续看。", talk:"先给出{可视化结果}，再用{预期反差}建立观看理由。", slots:["可视化结果","预期反差"], visual:"大面积紫色污渍与洗净地面的前后同场对比。", edit:"前后画面直接硬切；开场 2 秒内给结果。" },
          { name:"过程实测", say:"展示关键动作，让用户看到问题被解决。", strategy:"保留动作的起止过程，让解决发生本身成为可信证明。", talk:"用{关键动作}展示{问题对象}如何被解决。", slots:["关键动作","问题对象"], visual:"洗地机经过污渍、污水被吸走的完整动作。", edit:"保留动作起止；等待段可 1.1–1.3 倍加速。" },
          { name:"结果证明", say:"强调可见结果，并补充使用场景。", strategy:"将结果放回真实使用场景，补足效果稳定、可被观察的证据。", talk:"强调{可视化结果}，再补充{使用场景}中的可见效果。", slots:["可视化结果","使用场景"], visual:"地面反光特写、人物走过或躺下展示。", edit:"结果镜头 2–3 个；稳定画面可短暂停留。" },
          { name:"行动引导", say:"收束结果并引导进一步了解。", strategy:"回扣用户所处场景与已验证结果，自然引导其进入下一步。", talk:"如果你也在{使用场景}遇到{问题对象}，可以进一步了解{产品名}。", slots:["使用场景","问题对象","产品名"], visual:"产品与清洁后地面同框。", edit:"1 个稳定收尾镜头。" }
        ],
        example:{ title:"洗地机紫色污渍实测_成品01.mp4", meta:"自建结构提炼来源 · 成品视频库", badge:"参考视频", copy:"这么大一片污渍，推过去没有反复拖，一遍就被吸走了。清洁后的地面没有明显水痕，结果直接看得到。" }
      },
      {
        id: 5, name: "家居清洁对比参考", formula: "尚未生成内容结构",
        source: "自建", method: "从参考视频提炼", reference:"家居清洁前后对比_参考01.mp4", creator:"嗡大发", createdAt:"2026-08-13 10:26", updated:"08-13 10:28",
        parseStatus:"failed", validationStatus:"提炼失败", parseError:"视频画面轨道无法解码，请更换文件或重新解析。", referenceMeta:"外部参考视频 · 00:37", parseProfileId:1, parseStep:1, stages:[],
        example:{ title:"家居清洁前后对比_参考01.mp4", meta:"提炼来源 · 外部参考视频", badge:"提炼失败", copy:"视频尚未完成解析，暂未生成识别口播。" }
      }
    ];

    const clLearningSampleProfiles = {
      1: {
        titles:["床褥深层灰尘实测", "除螨仪尘杯结果展示", "宠物家庭床垫清洁", "沙发布艺深度清洁"],
        scripts:[
          "别只看床垫表面干不干净，走一遍才知道深层藏了多少灰尘。边拍边吸，尘杯里的结果当场就能看见。",
          "床单刚换不代表真的干净，纤维里的毛发碎屑才是容易被忽略的地方。",
          "有孩子和宠物的家庭，清洁不能只靠晒，完整走一遍结果更直观。"
        ], tone:"tone-1"
      },
      2: {
        titles:["下班 15 分钟晚餐", "空气炸锅鸡翅实测", "少油烹饪场景展示", "可视窗口烹饪记录"],
        scripts:[
          "下班晚又不想点外卖，腌好的鸡翅放进去，选好时间就不用守着。",
          "不用一滴油也能烤出焦脆表面，可视窗口直接看熟度。",
          "传统做饭最麻烦的是看火和油烟，这次把整个过程给你看。"
        ], tone:"tone-2"
      },
      3: {
        titles:["养宠家庭清洁建议", "有娃家庭深层清洁", "日常清洁高频痛点", "看不见残留的家庭场景"],
        scripts:[
          "家里有孩子或者宠物的，日常清洁最怕看不见的残留。",
          "反复打扫还是不放心，关键要看清洁后的结果能不能被验证。",
          "别只盯着参数，先看这类产品能不能解决你每天遇到的问题。"
        ], tone:"tone-3"
      }
    };
    const clLearningPrototypeDates = Array.from({length:30}, (_, index) => index < 17
      ? `2026-07-${String(index + 15).padStart(2,"0")}`
      : `2026-08-${String(index - 16).padStart(2,"0")}`);
    function clCreateLearningDailyRecords(structureId) {
      const profile = clLearningSampleProfiles[structureId] || clLearningSampleProfiles[1];
      if (structureId === 3) return [];
      const materialTotal = structureId === 2 ? 6 : 128;
      return Array.from({length:materialTotal}, (_, materialIndex) => {
        const id = `QC-${240618 + structureId * 1000 + materialIndex}`;
        const accountId = `${178023456 + ((materialIndex + structureId) % 6) * 10391}`;
        const firstDay = (materialIndex * 3 + structureId * 5) % 23;
        const activeDays = structureId === 2 ? 1 + (materialIndex % 2) : 5 + (materialIndex % 9);
        return clLearningPrototypeDates.slice(firstDay, Math.min(firstDay + activeDays, clLearningPrototypeDates.length)).map((date, dayIndex) => {
          const spend = 1120 + ((materialIndex * 487 + dayIndex * 769 + structureId * 917) % 18600);
          const roi = 1.86 + ((materialIndex * 17 + dayIndex * 9 + structureId * 11) % 166) / 100;
          const gmv = Math.round(spend * roi);
          const cpm = 41 + ((materialIndex * 7 + dayIndex * 3 + structureId) % 38);
          const impressions = Math.round(spend / cpm * 1000);
          const ctr = 2.7 + ((materialIndex * 13 + dayIndex * 4 + structureId * 3) % 45) / 10;
          const clicks = Math.max(1, Math.round(impressions * ctr / 100));
          const cvr = 3.8 + ((materialIndex * 9 + dayIndex * 5 + structureId * 5) % 58) / 10;
          const orders = Math.max(1, Math.round(clicks * cvr / 100));
          return { id, accountId, title:profile.titles[materialIndex % profile.titles.length], script:profile.scripts[materialIndex % profile.scripts.length], date,
            spend, gmv, roi, orders, impressions, clicks, ctr, cvr, cpm, cpc:spend / clicks, tone:profile.tone };
        });
      }).flat();
    }
    const clLearningDailyRecords = Object.fromEntries([1,2,3].map(id => [id, clCreateLearningDailyRecords(id)]));
    const clLearningFilters = { period:"30", start:"2026-07-15", end:"2026-08-13", query:"", sort:"spend", page:1 };
    let clActiveDetailStructure = null;

    function clOpenModal(modal) { if (modal) modal.classList.add("show"); }
    function clCloseModal(modal) { if (modal) modal.classList.remove("show"); }
    function clOpenDrawer() { if (clDetailDrawer) { clDetailDrawer.classList.add("show"); if (clDrawerOverlay) clDrawerOverlay.classList.add("show"); } }
    function clCloseDrawer() { clCloseLearningSampleDetail(); if (clDetailDrawer) { clDetailDrawer.classList.remove("show"); if (clDrawerOverlay) clDrawerOverlay.classList.remove("show"); } }

    let clEditingId = null;
    let clDeletingId = null;
    let clDeleteTargetName = "";
    let clActiveParseTaskId = null;
    const clParseTimers = new Map();
    const clParseStages = [
      ["提取音视频与关键帧", "正在读取时长、音轨与关键画面"],
      ["识别口播与画面文字", "正在转写口播并识别画面文字"],
      ["拆分镜头与内容段落", "正在识别镜头边界与内容阶段"],
      ["提取内容结构与剪辑方法", "正在生成内容公式、画面任务与剪辑方法"],
      ["生成内容结构", "正在整理内容公式与结构阶段"]
    ];

    function clNow() {
      const date = new Date();
      return `${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
    }
    function clParseStatusHtml(item) {
      if (item.parseStatus === "parsing") return `<span class="cl-parse-status parsing">◌ 解析中 <small>${clEscape(clParseStages[item.parseStep || 0]?.[0] || "处理中")}</small></span>`;
      if (item.parseStatus === "completed") return `<span class="cl-parse-status ready">✓ 已解析 <small>${clEscape(item.parseSummary || `${item.stages.length} 个阶段`)}</small></span>`;
      return `<span class="cl-parse-status manual">— 等待解析</span>`;
    }
    function clStructureStatusHtml(item) {
      if (item.source === "千川学习") {
        return `<span class="cl-structure-lifecycle active">生效中</span>`;
      }
      const status = item.parseStatus === "parsing" ? "提炼中" : item.parseStatus === "failed" ? "提炼失败" : "提炼完成";
      const className = item.parseStatus === "parsing" ? "processing" : item.parseStatus === "failed" ? "failed" : "completed";
      return `<span class="cl-structure-lifecycle ${className}">${status}</span>`;
    }
    function clListPeriodLabel() {
      return clLearningFilters.period === "7" ? "近 7 日" : clLearningFilters.period === "30" ? "近 30 日" : `${clLearningFilters.start} 至 ${clLearningFilters.end}`;
    }
    function clSyncListLearningPeriodControls() {
      document.querySelectorAll("[data-cl-list-period]").forEach(button => button.classList.toggle("active", button.dataset.clListPeriod === clLearningFilters.period));
      const range = document.getElementById("clListCustomRange");
      if (range) {
        range.hidden = clLearningFilters.period !== "custom";
        const start = range.querySelector('[data-cl-list-date="start"]');
        const end = range.querySelector('[data-cl-list-date="end"]');
        if (start) start.value = clLearningFilters.start;
        if (end) end.value = clLearningFilters.end;
      }
    }
    function clLearningLifecycle(item) {
      return item?.source === "千川学习" ? "生效中" : "";
    }
    // 千川学习沉淀的是跨样本的表达机制，不应回填任一单条素材的具体口播。
    const clLearningStagePatterns = {
      "结果型视觉钩子": { task:"先给出可验证结果，快速建立观看理由。", strategy:"用强结果或反差跳过铺垫，让用户先看到产品解决问题后的状态。", template:"先看{可视化结果}，{表面状态}不代表{隐性问题}已经解决。", slots:["可视化结果","表面状态","隐性问题"] },
      "隐性痛点放大": { task:"解释表面正常之下，问题为何仍值得解决。", strategy:"从用户默认认知切入，补足肉眼不易察觉、但会持续影响体验的隐性问题。", template:"你以为{表面状态}就够了，其实{隐性问题}仍在影响{问题对象}。", slots:["表面状态","隐性问题","问题对象"] },
      "产品能力演示": { task:"用可连续拍摄的动作承接解决方案。", strategy:"少讲抽象参数，多展示产品在关键动作中如何处理问题对象。", template:"{产品名}通过{核心动作}，在{关键环节}完成{解决结果}。", slots:["产品名","核心动作","关键环节","解决结果"] },
      "结果与场景证明": { task:"用可观察的结果兑现前文承诺。", strategy:"将结果放回核心场景，并用扩展场景证明能力不是偶发。", template:"在{核心场景}看到{可视化结果}，换到{扩展场景}也能验证{核心卖点}。", slots:["核心场景","可视化结果","扩展场景","核心卖点"] },
      "行动引导": { task:"收束价值，并给出明确的下一步。", strategy:"回扣用户最在意的可验证信息，降低继续了解或行动的犹豫。", template:"想进一步确认{可验证内容}的{目标人群}，可以通过{行动入口}了解。", slots:["可验证内容","目标人群","行动入口"] },
      "生活场景": { task:"建立目标用户的日常处境，让问题自然出现。", strategy:"选择高频、低决策成本的日常情境，通过时间压力、操作负担或现实限制引出不便。", template:"当{目标人群}在{生活场景}遇到{触发问题}时，{现实限制}让原有方式很难继续。", slots:["目标人群","生活场景","触发问题","现实限制"] },
      "问题出现": { task:"把场景中的不便转成需要解决的问题。", strategy:"以原有方式的局限和持续损失，放大用户对问题的感知。", template:"原来以为{原有方式}可以解决，但{具体问题}带来的{实际损失}越来越明显。", slots:["原有方式","具体问题","实际损失"] },
      "功能演示": { task:"用连续关键动作解释产品如何工作。", strategy:"围绕解决问题的必要步骤，呈现功能发生而非罗列功能名称。", template:"{产品名}通过{核心动作}，在{关键环节}完成{解决结果}。", slots:["产品名","核心动作","关键环节","解决结果"] },
      "成品证明": { task:"用可观察结果兑现前文承诺。", strategy:"让成品状态或使用后变化直接回应前面的触发问题。", template:"{可视化结果}直接回应了{触发问题}，也证明{核心卖点}确实发挥作用。", slots:["可视化结果","触发问题","核心卖点"] },
      "优惠收口": { task:"归纳核心价值，并引导用户进入下一步。", strategy:"只补充当前可核验的权益或行动入口，不替代产品价值证明。", template:"如果{目标人群}也在意{核心价值}，现在可通过{行动入口}进一步了解。", slots:["目标人群","核心价值","行动入口"] },
      "人群点名": { task:"让目标用户快速确认内容与自己相关。", strategy:"优先点出人群的共同身份、处境或高频需求，而非泛泛称呼所有人。", template:"如果你是{目标人群}，并且常在{使用场景}遇到{核心需求}，这段内容值得继续看。", slots:["目标人群","使用场景","核心需求"] },
      "需求唤醒": { task:"明确目标人群正在承担的具体问题。", strategy:"把隐性困扰转成可以感知的损失，建立产品出现的必要性。", template:"看似只是{具体问题}，长期会带来{实际损失}，所以需要解决{核心需求}。", slots:["具体问题","实际损失","核心需求"] },
      "核心卖点": { task:"聚焦一个关键能力，解释它如何解决需求。", strategy:"避免堆砌卖点；只保留与当前问题存在直接因果关系的能力。", template:"针对{核心需求}，{产品名}的{核心卖点}能够完成{解决结果}。", slots:["核心需求","产品名","核心卖点","解决结果"] },
      "证明补充": { task:"补充可验证依据，降低用户判断成本。", strategy:"优先使用结果、事实或真实使用反馈，而非重复主张。", template:"通过{证明结果}可以确认，{核心卖点}确实改善了{具体问题}。", slots:["证明结果","核心卖点","具体问题"] },
      "产品推荐": { task:"总结适用人群与核心价值，完成推荐。", strategy:"把推荐建立在已说明的需求与证据上，而不是空泛催促购买。", template:"对在意{核心需求}的{目标人群}来说，{产品名}的价值在于{核心价值}。", slots:["核心需求","目标人群","产品名","核心价值"] },
      "低价反差": { task:"以可核验的权益信息快速建立注意力。", strategy:"强调价值与原有认知之间的落差，避免脱离产品价值单独喊价。", template:"{权益信息}对应的{权益价值}，让原本顾虑{购买顾虑}的用户有了新的选择。", slots:["权益信息","权益价值","购买顾虑"] },
      "福利说明": { task:"说清权益边界，帮助用户判断是否适用。", strategy:"说明优惠门槛和具体获得内容，确保信息真实、可核验。", template:"满足{优惠门槛}后，可获得{权益价值}；重点关注{权益信息}即可。", slots:["优惠门槛","权益价值","权益信息"] },
      "产品展示": { task:"用最少信息承接权益，并建立产品认知。", strategy:"选择一个核心场景和关键动作，让用户理解权益对应的真实产品价值。", template:"{产品名}在{核心场景}通过{核心动作}，提供{核心价值}。", slots:["产品名","核心场景","核心动作","核心价值"] },
      "立即行动": { task:"收束权益信息，给出立即可执行的下一步。", strategy:"明确行动入口和需要确认的信息，避免制造无依据的紧迫感。", template:"想确认{权益信息}是否适合自己的{目标人群}，可通过{行动入口}进一步了解。", slots:["权益信息","目标人群","行动入口"] }
    };

    function clStageExpression(stage) {
      const pattern = clLearningStagePatterns[stage.name];
      return pattern || {
        task:stage.purpose || stage.say,
        strategy:"该阶段的跨样本表达策略待补充。",
        template:stage.talk || "请结合本阶段任务补充可调用句式。",
        slots:stage.slots || []
      };
    }
    function clStructureStatusDetailHtml(item) {
      const updatedLabel = item.source === "千川学习" ? `更新于 ${item.learnedAt || item.updated || "—"}` : `创建于 ${item.createdAt || item.updated || "—"}`;
      return `<div class="cl-origin-status">${clStructureStatusHtml(item)}<small>${clEscape(updatedLabel)}</small></div>`;
    }
    function clStructureEvidenceHtml(item) {
      if (item.source !== "千川学习") {
        if (item.parseStatus === "failed") {
          return `<div class="cl-evidence cl-evidence-failed"><span><b>失败原因</b><i title="${clEscape(item.reference || "参考视频")}">${clEscape(item.reference || "参考视频")}</i></span><strong title="${clEscape(item.parseError || "视频解析失败")}">${clEscape(item.parseError || "视频解析失败")}</strong></div>`;
        }
        return item.reference
          ? `<div class="cl-evidence cl-evidence-reference"><b>参考成品</b><strong title="${clEscape(item.reference)}">${clEscape(item.reference)}</strong></div>`
          : `<div class="cl-evidence cl-evidence-unverified"><b>—</b><span>不关联投放数据</span></div>`;
      }
      const dailyRows = clLearningDailyRows(item.id);
      const aggregate = clLearningAggregate(dailyRows);
      const materialCount = clLearningMaterialRows(dailyRows, clLearningFilters.sort).length;
      const materialLabel = `结构学习样本 ${Number(item.learningSampleCount || 0).toLocaleString("zh-CN")} 条`;
      const materialHint = materialCount > 100 ? "展示前 100 条" : "查看学习素材";
      const metrics = materialCount ? `${clListPeriodLabel()}命中 ${materialCount} 条｜消耗 ${clFormatMoney(aggregate.spend)} · ROI ${clFormatDecimal(aggregate.roi)}` : `${clListPeriodLabel()}无新增命中素材`;
      return `<button type="button" class="cl-evidence cl-evidence-learning" data-cl-open-learning="${item.id}"><span><b>${materialLabel}</b><i>${materialHint}</i></span><strong>${metrics}</strong></button>`;
    }
    function clStructureOrigin(item) {
      if (item.source === "千川学习") return "千川学习";
      return item.method === "从参考视频提炼" ? "参考视频提炼" : "手动创建";
    }
    function clStructureOriginClass(item) {
      if (item.source === "千川学习") return "cl-source-qc";
      return item.method === "从参考视频提炼" ? "cl-source-custom" : "cl-source-manual";
    }
    const clCanEditStructure = item => item?.source === "自建" && item.method === "手动创建";
    function clRenderTable() {
      const tbody = document.getElementById("contentStructureTbody");
      if (!tbody) return;
      const query = document.getElementById("clStructureSearch")?.value.trim().toLowerCase() || "";
      const source = document.getElementById("clStructureSourceFilter")?.value || "全部来源";
      const filtered = contentStructures.filter(item => {
        const origin = clStructureOrigin(item);
        const haystack = [item.name, item.formula, item.reference, origin].join(" ").toLowerCase();
        return (!query || haystack.includes(query)) && (source === "全部来源" || origin === source);
      });
      tbody.innerHTML = filtered.map(item => {
        const customActions = item.source === "自建" ? `${clCanEditStructure(item) ? '<button class="cl-table-action" type="button" data-cl-action="edit">编辑</button>' : ""}<button class="cl-table-action danger" type="button" data-cl-action="delete">删除</button>` : "";
        const structureMeta = item.parseStatus === "parsing" ? "解析任务草稿" : item.parseStatus === "failed" ? "尚未生成结构" : `${item.stages.length} 个阶段`;
        const actionHtml = item.parseStatus === "parsing"
          ? '<button class="cl-table-action primary" type="button" data-cl-action="progress">查看进度</button>'
          : item.parseStatus === "failed"
            ? `<button class="cl-table-action primary" type="button" data-cl-action="retry">重新解析</button>${customActions}`
            : `<button class="cl-table-action primary" type="button" data-cl-action="view">查看</button>${customActions}`;
        return `
        <tr data-cl-id="${item.id}">
          <td><div class="cl-structure-name-line"><strong>${clEscape(item.name)}</strong><small>${structureMeta}</small></div><span class="cl-formula-text">${clEscape(item.formula)}</span></td>
          <td><span class="${clStructureOriginClass(item)}">${clEscape(clStructureOrigin(item))}</span></td>
          <td>${clStructureStatusDetailHtml(item)}</td>
          <td>${clStructureEvidenceHtml(item)}</td>
          <td><span class="cl-table-actions">${actionHtml}</span></td>
        </tr>`;
      }).join("");
      document.getElementById("contentStructureEmpty").hidden = filtered.length > 0;
    }

    function clStageRow(stage = {}) {
      const talk = stage.talk || stage.say || "";
      return `<div class="cl-stage-editor-row"><input data-stage-field="name" value="${clEscape(stage.name || "新阶段")}" aria-label="阶段名称"><textarea data-stage-field="strategy" rows="2" aria-label="表达要点" placeholder="可选；不填写时由 AI 根据阶段任务和表达模板生成建议">${clEscape(stage.strategy || "")}</textarea><textarea data-stage-field="talk" rows="2" aria-label="表达模板">${clEscape(talk)}</textarea><textarea data-stage-field="visual" rows="2" aria-label="拍什么">${clEscape(stage.visual || "")}</textarea><textarea data-stage-field="edit" rows="2" aria-label="怎么剪">${clEscape(stage.edit || "")}</textarea><button class="cl-stage-remove" type="button" data-remove-stage title="删除阶段">×</button></div>`;
    }
    function clRenderStageEditor(stages) {
      const editor = document.getElementById("clStageEditor");
      if (editor) editor.innerHTML = stages.map(clStageRow).join("");
    }
    function clExtractVariables(template) {
      return [...new Set([...String(template || "").matchAll(/\{([^{}]+)\}/g)].map(match => match[1].trim()).filter(Boolean))];
    }
    function clBuildExpressionPoint(stage = {}) {
      const variables = clExtractVariables(stage.talk || stage.say || "");
      if (variables.length) return `围绕${variables.map(value => `「${value}」`).join("、")}组织本段信息，让表达与后续画面任务一致。`;
      return `聚焦「${stage.name || "本阶段"}」的核心信息，先说明用户应理解的价值，再承接后续画面。`;
    }
    function clReadStages() {
      return Array.from(document.querySelectorAll("#clStageEditor .cl-stage-editor-row")).map(row => {
        const talk = row.querySelector('[data-stage-field="talk"]')?.value.trim() || "";
        const name = row.querySelector('[data-stage-field="name"]')?.value.trim() || "";
        return {
          name, say: talk, talk, strategy:row.querySelector('[data-stage-field="strategy"]')?.value.trim() || clBuildExpressionPoint({name, talk}), slots: clExtractVariables(talk),
          visual: row.querySelector('[data-stage-field="visual"]')?.value.trim() || "",
          edit: row.querySelector('[data-stage-field="edit"]')?.value.trim() || ""
        };
      }).filter(stage => stage.name);
    }
    function clToggleReference() {
      const isReference = document.getElementById("clNewMethod")?.value === "reference";
      const wrap = document.getElementById("clNewReferenceWrap");
      if (wrap) wrap.hidden = !isReference;
    }
    const clVideoSourceCatalog = {
      finished: [
        { id:"finished-1", name:"轻净 Pro 除螨仪｜床褥结果冲击型.mp4", product:"轻净 Pro 除螨仪", duration:"00:36", status:"done", source:"remix", meta:"08/12 10:24", profileId:1, tone:"tone-1", qianchuan:true, tags:["痛点钩子","卧室"] },
        { id:"finished-2", name:"空气炸锅 A8｜下班晚餐场景.mp4", product:"轻享空气炸锅 A8", duration:"00:52", status:"done", source:"local", meta:"08/11 16:18", profileId:2, tone:"tone-2", tags:["场景演示","厨房"] },
        { id:"finished-3", name:"净界洗地机 S5｜顽渍清洁实测.mp4", product:"净界洗地机 S5", duration:"00:28", status:"done", source:"infinite", meta:"08/10 09:42", profileId:4, tone:"tone-3", qianchuan:true, tags:["效果证明","家庭清洁"] },
        { id:"finished-4", name:"随行榨汁杯 Mini｜晨间饮品.mov", product:"随行榨汁杯 Mini", duration:"00:22", status:"pending", source:"local", meta:"08/09 14:06", profileId:3, tone:"tone-4", tags:["场景演示","新品种草"] },
        { id:"finished-5", name:"轻净 Pro 除螨仪｜养宠家庭版.mp4", product:"轻净 Pro 除螨仪", duration:"00:24", status:"done", source:"remix", meta:"08/08 10:16", profileId:1, tone:"tone-1", tags:["人群点名","效果证明"] },
        { id:"finished-6", name:"净界洗地机 S5｜厨房清洁日常.mp4", product:"净界洗地机 S5", duration:"00:18", status:"running", source:"local", meta:"08/07 15:32", profileId:4, tone:"tone-3", tags:["家庭清洁","场景演示"] }
      ],
      external: [
        { id:"external-1", name:"洗地机紫色污渍实测_成品01.mp4", product:"净界洗地机 S5", duration:"00:28", status:"done", source:"采集", platform:"douyin", meta:"08/11 13:08", profileId:4, tone:"tone-3", tags:["结果直给","效果证明"] },
        { id:"external-2", name:"清洁电器人群痛点参考.mp4", product:"轻净 Pro 除螨仪", duration:"00:41", status:"done", source:"采集", platform:"douyin", meta:"08/10 11:34", profileId:3, tone:"tone-1", tags:["痛点钩子","人群点名"] },
        { id:"external-3", name:"空气炸锅下班做饭高完播参考.mp4", product:"轻享空气炸锅 A8", duration:"00:35", status:"pending", source:"本地", platform:"douyin", meta:"08/08 19:18", profileId:2, tone:"tone-2", tags:["场景演示"] },
        { id:"external-4", name:"床褥深层灰尘对比参考.mp4", product:"", duration:"00:18", status:"running", source:"采集", platform:"xiaohongshu", meta:"08/07 15:20", profileId:1, tone:"tone-4", tags:["结果直给"] },
        { id:"external-5", name:"家居收纳短视频结构参考.mp4", product:"", duration:"00:24", status:"failed", source:"采集", platform:"other", meta:"08/06 17:26", profileId:3, tone:"tone-2", tags:["新品种草"] }
      ]
    };
    let clActiveVideoSource = "external";
    let clSelectedVideoRef = null;
    const clVideoPickerFilters = {
      finished: { query:"", analysis:"all", scope:"all", tag:"all", relation:"all", menu:"" },
      external: { query:"", analysis:"all", scope:"all", tag:"all", menu:"" }
    };
    const clVideoTagFilters = { finished: [], external: [] };
    const clVideoTagGroups = {
      finished: [{id:"all",name:"全部标签"},{id:"content",name:"内容主题"},{id:"scene",name:"使用场景"}],
      external: [{id:"all",name:"全部标签"},{id:"content",name:"内容主题"},{id:"scene",name:"使用场景"}]
    };
    let clVideoTagModalState = null;
    const clVideoStatusText = { done:"已分析", pending:"待分析", running:"分析中", failed:"分析失败" };
    const clFinishedSourceText = { infinite:"无限画板", remix:"智能混剪", local:"本地上传" };
    const clPlatformText = { douyin:"抖音", kuaishou:"快手", channels:"视频号", xiaohongshu:"小红书" };
    let clParseRunId = 0;

    function clUpdateParseState() {
      const button = document.getElementById("clParseVideo");
      const hint = document.getElementById("clParseHint");
      if (!button || !hint) return;
      button.textContent = "解析并生成结构";
      button.disabled = !clSelectedVideoRef || clSelectedVideoRef.uploadStatus === "uploading";
      hint.textContent = !clSelectedVideoRef ? "请选择一条视频" : clSelectedVideoRef.uploadStatus === "uploading" ? "视频上传中，完成后可开始解析" : `已选择：${clSelectedVideoRef.name}`;
    }
    function clFinishedFilterMenu(key, label, options) {
      const active = clVideoPickerFilters.finished.menu === key;
      return `<div class="cl-finished-filter-menu"><button type="button" data-cl-finished-menu="${key}">${key === "tag" ? "◇" : key === "analysis" ? "◉" : "⌁"}<span>${clEscape(label)}</span></button><div class="cl-finished-filter-options" ${active ? "" : "hidden"}>${options.map(([value,text]) => `<button class="${clVideoPickerFilters.finished[key] === value ? "active" : ""}" type="button" data-cl-finished-filter="${key}" data-cl-finished-value="${clEscape(value)}">${clEscape(text)}</button>`).join("")}</div></div>`;
    }
    function clExternalFilterMenu(key, label, options) {
      const active = clVideoPickerFilters.external.menu === key;
      const icon = key === "scope" ? "☷" : key === "tag" ? "◇" : "◉";
      return `<div class="cl-finished-filter-menu"><button type="button" data-cl-external-menu="${key}">${icon}<span>${clEscape(label)}</span></button><div class="cl-finished-filter-options" ${active ? "" : "hidden"}>${options.map(([value,text]) => `<button class="${clVideoPickerFilters.external[key] === value ? "active" : ""}" type="button" data-cl-external-filter="${key}" data-cl-external-value="${clEscape(value)}">${clEscape(text)}</button>`).join("")}</div></div>`;
    }
    const clVideoTagGroupMap = {
      finished:{ "痛点钩子":"content", "效果证明":"content", "人群点名":"content", "新品种草":"content", "卧室":"scene", "厨房":"scene", "家庭清洁":"scene", "场景演示":"scene" },
      external:{ "结果直给":"content", "痛点钩子":"content", "人群点名":"content", "新品种草":"content", "效果证明":"content", "场景演示":"scene" }
    };
    function clOpenVideoTagFilter(kind) {
      const catalog = clVideoSourceCatalog[kind];
      const draft = new Set(clVideoTagFilters[kind]);
      const modal = document.createElement("div");
      modal.className = "cl-tag-filter-overlay";
      modal.innerHTML = `<section class="cl-tag-filter-modal" role="dialog" aria-modal="true"><header><div><small>视频标签</small><h3>按标签筛选</h3><p>可多选标签，筛选同时满足全部标签的视频。</p></div><button type="button" data-cl-tag-close>×</button></header><div class="cl-tag-filter-body"><aside data-cl-tag-groups></aside><main><label class="cl-tag-filter-search">⌕<input type="search" placeholder="搜索标签" data-cl-tag-search></label><div class="cl-tag-filter-choices" data-cl-tag-choices></div><div class="cl-tag-filter-create"><button type="button" data-cl-tag-create-toggle>＋ 新建标签</button><div hidden data-cl-tag-create-row><input type="text" maxlength="20" placeholder="输入标签名称" data-cl-tag-new-input><button type="button" data-cl-tag-create>添加</button></div></div><small data-cl-tag-error></small></main></div><footer><span data-cl-tag-selected>已选 0 个标签</span><div><button type="button" data-cl-tag-clear>清空</button><button class="primary" type="button" data-cl-tag-apply>确认筛选</button></div></footer></section>`;
      document.body.appendChild(modal);
      const state = { group:"all", query:"" };
      const tags = () => [...new Set(catalog.flatMap(video => video.tags || []))];
      const render = () => {
        const groupMap = clVideoTagGroupMap[kind];
        modal.querySelector("[data-cl-tag-groups]").innerHTML = clVideoTagGroups[kind].map(group => `<button class="${state.group === group.id ? "active" : ""}" type="button" data-cl-tag-group="${group.id}"><span>${group.name}</span><b>${group.id === "all" ? tags().length : tags().filter(tag => groupMap[tag] === group.id).length}</b></button>`).join("");
        const choices = tags().filter(tag => (state.group === "all" || groupMap[tag] === state.group) && (!state.query || tag.toLowerCase().includes(state.query.toLowerCase())));
        modal.querySelector("[data-cl-tag-choices]").innerHTML = choices.length ? choices.map(tag => `<button class="${draft.has(tag) ? "selected" : ""}" type="button" data-cl-tag-choice="${clEscape(tag)}">${clEscape(tag)}${draft.has(tag) ? "<span>✓</span>" : ""}</button>`).join("") : '<span class="cl-tag-filter-empty">该分组下还没有标签</span>';
        modal.querySelector("[data-cl-tag-selected]").textContent = `已选 ${draft.size} 个标签`;
      };
      const close = () => modal.remove();
      modal.addEventListener("click", event => {
        if (event.target === modal || event.target.closest("[data-cl-tag-close]")) return close();
        const group = event.target.closest("[data-cl-tag-group]");
        if (group) { state.group = group.dataset.clTagGroup; return render(); }
        const choice = event.target.closest("[data-cl-tag-choice]");
        if (choice) { const tag = choice.dataset.clTagChoice; draft.has(tag) ? draft.delete(tag) : draft.add(tag); return render(); }
        if (event.target.closest("[data-cl-tag-clear]")) { draft.clear(); return render(); }
        if (event.target.closest("[data-cl-tag-create-toggle]")) { const row = modal.querySelector("[data-cl-tag-create-row]"); row.hidden = !row.hidden; if (!row.hidden) row.querySelector("input").focus(); return; }
        if (event.target.closest("[data-cl-tag-create]")) {
          const input = modal.querySelector("[data-cl-tag-new-input]"); const tag = input.value.trim(); const error = modal.querySelector("[data-cl-tag-error]");
          if (!tag) { error.textContent = "请输入标签名称"; return; }
          if (tags().includes(tag)) { error.textContent = "已存在同名标签"; return; }
          catalog[0]?.tags?.push(tag); clVideoTagGroupMap[kind][tag] = state.group === "all" ? "content" : state.group; draft.add(tag); input.value = ""; error.textContent = ""; return render();
        }
        if (event.target.closest("[data-cl-tag-apply]")) { clVideoTagFilters[kind] = [...draft]; clRenderVideoSource(); close(); }
      });
      modal.querySelector("[data-cl-tag-search]").addEventListener("input", event => { state.query = event.target.value.trim(); render(); });
      render();
    }
    function clRenderVideoSource() {
      const content = document.getElementById("clVideoSourceContent");
      if (!content) return;
      if (clActiveVideoSource === "finished" || clActiveVideoSource === "external") {
        const catalog = clVideoSourceCatalog[clActiveVideoSource];
        const filters = clVideoPickerFilters[clActiveVideoSource];
        const scopeOptions = clActiveVideoSource === "finished"
          ? [["all","全部来源"],["infinite","无限画板"],["local","本地上传"],["remix","智能混剪"]]
          : [["all","全部平台"],["douyin","抖音"],["kuaishou","快手"],["channels","视频号"],["xiaohongshu","小红书"],["other","其他"]];
        const tags = [...new Set(catalog.flatMap(video => video.tags || []))];
        const visible = catalog.filter(video => {
          const matchesQuery = !filters.query || `${video.name} ${video.product}`.toLowerCase().includes(filters.query.toLowerCase());
          const matchesStatus = filters.analysis === "all" || video.status === filters.analysis;
          const scope = clActiveVideoSource === "finished" ? video.source : video.platform;
          const matchesRelation = clActiveVideoSource !== "finished" || filters.relation === "all" || (filters.relation === "linked" ? !!video.qianchuan : !video.qianchuan);
          const selectedTags = clVideoTagFilters[clActiveVideoSource];
          return matchesQuery && matchesStatus && matchesRelation && (filters.scope === "all" || scope === filters.scope) && selectedTags.every(tag => (video.tags || []).includes(tag));
        });
        const analyzedCount = catalog.filter(video => video.status === "done").length;
        const pickerToolbar = clActiveVideoSource === "finished" ? `<div class="cl-finished-picker-toolbar">
          <div class="cl-finished-source-tabs">${[["all","全部"],["infinite","无限画板"],["local","本地上传"],["remix","智能混剪"]].map(([value,label]) => `<button class="${filters.scope === value ? "active" : ""}" type="button" data-cl-finished-source="${value}">${label}<b>${value === "all" ? catalog.length : catalog.filter(video => video.source === value).length}</b></button>`).join("")}</div>
          <button class="cl-finished-filter-trigger" type="button" data-cl-open-tag-filter="finished">◇<span>${clVideoTagFilters.finished.length ? `已选 ${clVideoTagFilters.finished.length} 标签` : "视频标签"}</span></button>
          ${clFinishedFilterMenu("analysis", filters.analysis === "all" ? "全部状态" : clVideoStatusText[filters.analysis], [["all","全部状态"],["pending","待分析"],["running","分析中"],["done","已分析"],["failed","分析失败"]])}
          ${clFinishedFilterMenu("relation", filters.relation === "all" ? "全部关联" : filters.relation === "linked" ? "已关联千川" : "未关联千川", [["all","全部关联"],["linked","已关联千川"],["unlinked","未关联千川"]])}
          <label class="cl-finished-search"><span>⌕</span><input type="search" data-cl-video-filter="query" placeholder="搜索视频名称、产品或素材 ID" value="${clEscape(filters.query)}"></label>
        </div>` : `<div class="cl-external-picker-toolbar">
          ${clExternalFilterMenu("scope", filters.scope === "all" ? "全部平台" : clPlatformText[filters.scope] || "其他", scopeOptions)}
          <button class="cl-finished-filter-trigger" type="button" data-cl-open-tag-filter="external">◇<span>${clVideoTagFilters.external.length ? `已选 ${clVideoTagFilters.external.length} 标签` : "视频标签"}</span></button>
          ${clExternalFilterMenu("analysis", filters.analysis === "all" ? "全部状态" : clVideoStatusText[filters.analysis], [["all","全部状态"],["pending","待分析"],["running","分析中"],["done","已分析"],["failed","分析失败"]])}
          <label class="cl-external-search"><span>⌕</span><input type="search" data-cl-video-filter="query" placeholder="搜索视频名称或关联产品" value="${clEscape(filters.query)}"></label>
        </div>`;
        content.innerHTML = `<div class="cl-asset-picker">
          ${pickerToolbar}
          <div class="cl-asset-picker-summary">共 ${catalog.length} 条视频 · 已分析 ${analyzedCount} 条${visible.length !== catalog.length ? ` · 显示 ${visible.length} 条` : ""}</div>
          <div class="cl-asset-video-grid">${visible.length ? visible.map(video => {
            const isFinished = clActiveVideoSource === "finished";
            const sourceText = isFinished ? clFinishedSourceText[video.source] : video.source;
            const sourceClass = isFinished ? video.source : video.source === "本地" ? "local" : "collect";
            const platform = clPlatformText[video.platform] || "其他";
            return `<button class="cl-asset-video-card ${clSelectedVideoRef?.id === video.id ? "selected" : ""}" type="button" data-cl-video-id="${video.id}">
              <span class="cl-asset-video-visual ${video.tone}"><span class="cl-asset-video-status ${video.status}"><i></i>${clVideoStatusText[video.status] || "待分析"}</span><span class="cl-asset-video-check">✓</span><span class="cl-asset-video-source ${sourceClass}">${clEscape(sourceText)}</span><span class="cl-asset-video-play">▶</span><em>${clEscape(video.duration)}</em></span>
              <span class="cl-asset-video-body"><strong title="${clEscape(video.name)}">${clEscape(video.name)}</strong><span class="cl-asset-video-tags"><b class="product ${video.product ? "" : "empty"}">${clEscape(video.product || "未关联产品")}</b>${isFinished ? video.qianchuan ? '<b class="qianchuan">已关联千川</b>' : "" : `<b class="platform">${clEscape(platform)}</b>`}</span><small>${clEscape(video.meta)}</small></span>
            </button>`;
          }).join("") : `<div class="cl-asset-picker-empty"><strong>没有符合条件的视频</strong><span>请调整搜索词或筛选条件</span></div>`}</div>
        </div>`;
      } else if (clActiveVideoSource === "upload") {
        content.innerHTML = `<div class="cl-source-input-panel"><input type="file" id="clVideoUploadInput" accept="video/*" hidden><button class="cl-action-btn primary" type="button" id="clChooseVideoFile">选择本地视频</button><p id="clUploadFileName">支持 MP4、MOV，单文件不超过 500MB</p><div class="cl-upload-progress" id="clUploadProgress" hidden><span id="clUploadState">正在上传</span><b id="clUploadPercent">0%</b><div><i id="clUploadBar" style="width:0%"></i></div></div></div>`;
      } else {
        content.innerHTML = `<div class="cl-source-input-panel"><p>粘贴抖音、快手或其他可访问的视频链接</p><div class="cl-source-link-row"><input type="url" id="clVideoLinkInput" placeholder="https://..."><button class="cl-action-btn" type="button" id="clClearVideoLink">清空</button></div><p>解析成功后将在内容结构中记录该提炼来源</p></div>`;
      }
      clUpdateParseState();
    }
    function clShowSourceStep() {
      document.getElementById("clNewModalTitle").textContent = "拆解爆款结构";
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      document.getElementById("clCreateSourceStep").hidden = false;
      document.getElementById("clStructureFormStep").hidden = true;
      document.getElementById("clParseProgressStep").hidden = true;
      document.getElementById("clNewSave").hidden = true;
      document.getElementById("clBackSource").hidden = true;
      document.getElementById("clBackgroundParse").hidden = true;
      document.querySelectorAll("[data-cl-close='new']").forEach(button => { if (button.textContent !== "✕") button.textContent = "取消"; });
      document.getElementById("clAiDraftNote").hidden = true;
      document.getElementById("clVideoSourcePicker").hidden = false;
      clActiveVideoSource = "external";
      document.querySelectorAll("[data-cl-video-source]").forEach(button => button.classList.toggle("active", button.dataset.clVideoSource === clActiveVideoSource));
      clRenderVideoSource();
    }
    function clShowVideoPicker() {
      document.getElementById("clNewModalTitle").textContent = "拆解爆款结构";
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      document.getElementById("clVideoSourcePicker").hidden = false;
      clActiveVideoSource = "external";
      clSelectedVideoRef = null;
      document.querySelectorAll("[data-cl-video-source]").forEach(button => button.classList.toggle("active", button.dataset.clVideoSource === clActiveVideoSource));
      clRenderVideoSource();
    }
    function clShowStructureForm(isAiDraft, allowBack = true) {
      document.getElementById("clCreateSourceStep").hidden = true;
      document.getElementById("clStructureFormStep").hidden = false;
      document.getElementById("clParseProgressStep").hidden = true;
      document.getElementById("clNewSave").hidden = false;
      document.getElementById("clBackSource").hidden = !allowBack;
      document.getElementById("clBackgroundParse").hidden = true;
      document.querySelectorAll("[data-cl-close='new']").forEach(button => { if (button.textContent !== "✕") button.textContent = "取消"; });
      document.getElementById("clAiDraftNote").hidden = !isAiDraft;
      document.getElementById("clNewModalSubtitle").textContent = isAiDraft ? "AI 已完成结构提炼，请确认后保存为自建内容结构" : "同时定义每个阶段说什么、拍什么、怎么剪，供智能文案、脚本和混剪调用";
      clNewModal?.querySelector(".modal-body")?.scrollTo?.({ top:0, behavior:"auto" });
    }
    function clShowParseProgress(item) {
      if (!item) return;
      clActiveParseTaskId = item.id;
      document.getElementById("clCreateSourceStep").hidden = true;
      document.getElementById("clStructureFormStep").hidden = true;
      document.getElementById("clParseProgressStep").hidden = false;
      document.getElementById("clNewSave").hidden = true;
      document.getElementById("clBackSource").hidden = true;
      document.getElementById("clBackgroundParse").hidden = false;
      document.querySelectorAll("[data-cl-close='new']").forEach(button => { if (button.textContent !== "✕") button.textContent = "关闭"; });
      document.getElementById("clNewModalTitle").textContent = "正在解析参考视频";
      document.getElementById("clNewModalSubtitle").textContent = "解析不会阻塞当前操作，可随时转入后台继续处理";
      const isComplete = item.parseStatus === "completed";
      document.getElementById("clParseProgressTitle").textContent = isComplete ? "解析完成" : "正在解析参考视频";
      document.getElementById("clParseProgressSubtitle").textContent = isComplete ? "内容结构已生成，可直接在列表查看或编辑。" : "任务已创建，可留在此处查看进度，也可转入后台继续处理。";
      document.getElementById("clParseVideoSummary").textContent = `${item.reference || "参考视频"} · ${item.referenceMeta || "正在读取视频信息"}`;
      const step = item.parseStep || 0;
      document.getElementById("clParseSteps").innerHTML = clParseStages.map(([title, description], index) => {
        const state = isComplete || index < step ? "done" : index === step ? "active" : "";
        const marker = state === "done" ? "✓" : index + 1;
        const status = state === "done" ? "已完成" : state === "active" ? "处理中" : "等待中";
        return `<div class="cl-parse-step ${state}"><i>${marker}</i><span><b>${title}</b><small>${description}</small></span><em>${status}</em></div>`;
      }).join("");
      const background = document.getElementById("clBackgroundParse");
      background.textContent = isComplete ? "查看结构" : "后台解析，稍后处理";
      clNewModal?.querySelector(".modal-body")?.scrollTo?.({ top:0, behavior:"auto" });
    }
    function clApplyVideoDraft(reference) {
      const source = contentStructures.find(item => item.id === (reference.profileId || 1)) || contentStructures[0];
      document.getElementById("clNewName").value = source.name.replace(/（自建）$/, "") + "（自建）";
      document.getElementById("clNewFormula").value = source.formula;
      document.getElementById("clNewMethod").value = "reference";
      document.getElementById("clNewReference").value = reference.name;
      clRenderStageEditor(source.stages.map(stage => ({...stage})));
      clToggleReference();
      clShowStructureForm(true, true);
    }
    function clHydrateStructureForm(item, confirming = false) {
      document.getElementById("clNewName").value = item.name;
      document.getElementById("clNewFormula").value = item.formula;
      document.getElementById("clNewMethod").value = "reference";
      const referenceInput = document.getElementById("clNewReference");
      referenceInput.value = item.reference || "";
      referenceInput.disabled = Boolean(item.reference);
      clRenderStageEditor(item.stages);
      clToggleReference();
      clEditingId = item.id;
      document.getElementById("clNewModalTitle").textContent = "编辑爆款内容结构";
      document.getElementById("clNewSaveText").textContent = "保存修改";
      clShowStructureForm(confirming, false);
      document.getElementById("clNewModalSubtitle").textContent = item.reference ? "可编辑结构内容；提炼来源仅用于溯源，如需更换请重新提炼" : "可编辑结构内容；保存后调用方将使用最新结构";
    }
    function clBuildParseDraft(reference) {
      const source = contentStructures.find(item => item.id === (reference.profileId || 1)) || contentStructures[0];
      return {
        id: Date.now(), name: `${source.name}（解析中）`, formula:"正在提取内容公式…", source:"自建", method:"从参考视频提炼", reference:reference.name, creator:"嗡大发", createdAt:clNow(),
        referenceMeta:reference.meta || "本地上传视频", updated:clNow(), parseStatus:"parsing", parseStep:0, stages:[], parseProfileId:source.id,
        example:{ title:reference.name, meta:`提炼来源 · ${reference.meta || "参考视频"}`, badge:"解析中", copy:"正在识别口播、镜头与内容结构…" }
      };
    }
    function clCompleteParseTask(taskId) {
      const item = contentStructures.find(entry => entry.id === taskId);
      if (!item || item.parseStatus !== "parsing") return;
      const source = contentStructures.find(entry => entry.id === item.parseProfileId) || contentStructures[0];
      Object.assign(item, {
        name:source.name.replace(/（自建）$/, ""), formula:source.formula, stages:source.stages.map(stage => ({...stage})), parseStatus:"completed", validationStatus:"提炼完成", parseStep:clParseStages.length,
        parseSummary:`已识别口播、${source.stages.length * 4 - 2} 个镜头与 ${source.stages.length} 个内容段落`, updated:clNow(),
        example:{ ...source.example, title:item.reference, meta:`提炼来源 · ${item.referenceMeta}`, badge:"已解析", copy:source.example.copy }
      });
      clParseTimers.delete(taskId);
      clRenderTable();
      if (clNewModal?.classList.contains("show") && clActiveParseTaskId === taskId) clShowParseProgress(item);
      showToast(`“${item.reference}”已解析完成，已展示在列表`);
    }
    function clScheduleParseTask(taskId) {
      const advance = step => {
        const item = contentStructures.find(entry => entry.id === taskId);
        if (!item || item.parseStatus !== "parsing") return;
        item.parseStep = step;
        item.updated = clNow();
        clRenderTable();
        if (clNewModal?.classList.contains("show") && clActiveParseTaskId === taskId) clShowParseProgress(item);
        if (step >= clParseStages.length) return clCompleteParseTask(taskId);
        clParseTimers.set(taskId, setTimeout(() => advance(step + 1), 720));
      };
      clParseTimers.set(taskId, setTimeout(() => advance(1), 620));
    }
    function clRetryParseTask(item) {
      if (!item || item.parseStatus !== "failed") return;
      const existingTimer = clParseTimers.get(item.id);
      if (existingTimer) clearTimeout(existingTimer);
      Object.assign(item, {
        parseStatus:"parsing", validationStatus:"", parseError:"", parseStep:0, updated:clNow()
      });
      clRenderTable();
      clActiveParseTaskId = item.id;
      clShowParseProgress(item);
      clOpenModal(clNewModal);
      clScheduleParseTask(item.id);
      showToast(`已重新解析“${item.reference}”`);
    }
    function clStartParseTask(reference) {
      const draft = clBuildParseDraft(reference);
      contentStructures.unshift(draft);
      clRenderTable();
      clShowParseProgress(draft);
      clScheduleParseTask(draft.id);
      showToast("已创建解析任务，可转入后台继续处理");
    }
    function clResetNewModalMode() {
      clParseRunId += 1;
      document.getElementById("clNewModalTitle").textContent = "拆解爆款结构";
      document.getElementById("clNewModalSubtitle").textContent = "选择爆款视频，AI 自动生成内容结构。";
      document.getElementById("clNewSaveText").textContent = "保存结构";
      clEditingId = null;
      clShowSourceStep();
    }

    function clOpenEditModal(item) {
      if (!clCanEditStructure(item)) return showToast("从参考视频提炼的结构暂不支持编辑");
      clResetNewModalMode();
      clHydrateStructureForm(item, false);
      clOpenModal(clNewModal);
    }

    function clOpenDeleteModal(item) {
      document.getElementById("clDeleteName").textContent = item.name;
      clDeletingId = item.id; clDeleteTargetName = item.name;
      clOpenModal(clDeleteModal);
    }

    const clFormatMoney = value => `¥${Math.round(value).toLocaleString("zh-CN")}`;
    const clFormatDecimal = value => Number(value).toFixed(2);
    function clLearningDailyRows(structureId) {
      const { period, start, end } = clLearningFilters;
      const startDate = period === "7" ? "2026-08-07" : period === "30" ? "2026-07-15" : start;
      const endDate = period === "custom" ? end : "2026-08-13";
      return (clLearningDailyRecords[structureId] || [])
        .filter(record => record.spend > 1000)
        .filter(record => record.date >= startDate && record.date <= endDate);
    }
    // 结构选择器固定展示近 30 日口径，不受详情侧栏筛选条件影响。
    function clLearningRecent30Summary(structureId) {
      const rows = (clLearningDailyRecords[structureId] || [])
        .filter(record => record.spend > 1000)
        .filter(record => record.date >= "2026-07-15" && record.date <= "2026-08-13");
      const aggregate = clLearningAggregate(rows);
      const hitCount = clLearningMaterialRows(rows, "spend").length;
      return hitCount ? { hitCount, spend:aggregate.spend, roi:aggregate.roi } : null;
    }
    function clLearningAggregate(rows) {
      const total = rows.reduce((result, sample) => ({
        spend:result.spend + sample.spend, gmv:result.gmv + sample.gmv, orders:result.orders + sample.orders,
        impressions:result.impressions + sample.impressions, clicks:result.clicks + sample.clicks
      }), {spend:0,gmv:0,orders:0,impressions:0,clicks:0});
      return {
        ...total,
        roi:total.spend ? total.gmv / total.spend : 0,
        ctr:total.impressions ? total.clicks / total.impressions * 100 : 0,
        cvr:total.clicks ? total.orders / total.clicks * 100 : 0,
        cpm:total.impressions ? total.spend / total.impressions * 1000 : 0,
        cpc:total.clicks ? total.spend / total.clicks : 0
      };
    }
    function clLearningMetric(label, value) {
      return `<div class="cl-learning-metric"><span>${label}</span><strong>${value}</strong></div>`;
    }
    function clLearningMaterialRows(records, sort) {
      const grouped = new Map();
      records.forEach(record => {
        const key = `${record.id}|${record.accountId}`;
        const group = grouped.get(key) || { ...record, records:[] };
        group.records.push(record);
        grouped.set(key, group);
      });
      return [...grouped.values()].map(group => {
        const metrics = clLearningAggregate(group.records);
        const latestEntry = group.records.reduce((latest, record) => record.date > latest ? record.date : latest, group.records[0].date);
        return { ...group, metrics, entryDays:group.records.length, latestEntry, records:[...group.records].sort((a,b) => b.date.localeCompare(a.date)) };
      }).sort((a,b) => b.metrics[sort] - a.metrics[sort]);
    }
    function clRenderLearningSamples(item) {
      const container = document.getElementById("clDrawerExamples");
      if (!container || !item) return;
      const dailyRows = clLearningDailyRows(item.id);
      const aggregate = clLearningAggregate(dailyRows);
      const allRows = clLearningMaterialRows(dailyRows, clLearningFilters.sort);
      const normalizedQuery = clLearningFilters.query.trim().toLowerCase();
      const rows = allRows.filter(row => !normalizedQuery || `${row.id} ${row.accountId}`.toLowerCase().includes(normalizedQuery));
      const cappedRows = rows.slice(0,100);
      const pageSize = 20;
      const totalPages = Math.max(1, Math.ceil(cappedRows.length / pageSize));
      clLearningFilters.page = Math.min(Math.max(clLearningFilters.page, 1), totalPages);
      const pageStart = (clLearningFilters.page - 1) * pageSize;
      const visibleRows = cappedRows.slice(pageStart, pageStart + pageSize);
      const pagination = totalPages > 1 ? `<nav class="cl-learning-pagination" aria-label="学习素材分页"><span>第 ${clLearningFilters.page} / ${totalPages} 页</span><button type="button" data-cl-learning-page="${clLearningFilters.page - 1}"${clLearningFilters.page === 1 ? " disabled" : ""}>上一页</button>${Array.from({length:totalPages}, (_, index) => { const page = index + 1; return `<button type="button" class="${page === clLearningFilters.page ? "active" : ""}" data-cl-learning-page="${page}" aria-label="第 ${page} 页">${page}</button>`; }).join("")}<button type="button" data-cl-learning-page="${clLearningFilters.page + 1}"${clLearningFilters.page === totalPages ? " disabled" : ""}>下一页</button></nav>` : "";
      const periodLabel = clLearningFilters.period === "7" ? "近 7 天" : clLearningFilters.period === "30" ? "近 30 天" : `${clLearningFilters.start} 至 ${clLearningFilters.end}`;
      const sortOptions = [["spend","消耗最高"],["gmv","成交金额最高"],["roi","ROI 最高"],["orders","成交订单最多"],["cvr","转化率最高"]];
      container.innerHTML = `<section class="cl-learning-materials">
        <div class="cl-learning-rule"><span>结构学习样本</span><b>${Number(item.learningSampleCount || 0).toLocaleString("zh-CN")} 条</b><i>最近结构更新：${clEscape(item.learnedAt || item.updated || "—")}</i></div>
        <div class="cl-learning-filters">
          <div class="cl-learning-period" role="group" aria-label="统计周期">
            <span>统计周期</span>${[["7","近 7 天"],["30","近 30 天"],["custom","自定义"]].map(([value,label]) => `<button type="button" class="${clLearningFilters.period === value ? "active" : ""}" data-cl-learning-period="${value}">${label}</button>`).join("")}
          </div>
          <div class="cl-learning-custom-range" ${clLearningFilters.period === "custom" ? "" : "hidden"}><input type="date" data-cl-learning-date="start" value="${clEscape(clLearningFilters.start)}"><i>至</i><input type="date" data-cl-learning-date="end" value="${clEscape(clLearningFilters.end)}"></div>
          <label class="cl-learning-search"><span>⌕</span><input type="search" data-cl-learning-query placeholder="搜索素材 ID、千川账户 ID" value="${clEscape(clLearningFilters.query)}"></label>
          <label class="cl-learning-sort"><span>排序</span><select data-cl-learning-sort>${sortOptions.map(([value,label]) => `<option value="${value}"${clLearningFilters.sort === value ? " selected" : ""}>${label}</option>`).join("")}</select></label>
        </div>
        <section class="cl-learning-summary">
          <div class="cl-learning-section-head"><div class="cl-learning-summary-title"><strong>投放数据汇总</strong><span>统计周期：${periodLabel}</span></div><p>统计口径：当前筛选周期内，单日消耗 &gt; ¥1,000 的投放记录汇总</p></div>
          <div class="cl-learning-metrics">
            ${clLearningMetric("消耗", clFormatMoney(aggregate.spend))}
            ${clLearningMetric("整体成交金额", clFormatMoney(aggregate.gmv))}
            ${clLearningMetric("广告 ROI", clFormatDecimal(aggregate.roi))}
            ${clLearningMetric("整体成交订单", Math.round(aggregate.orders).toLocaleString("zh-CN"))}
            ${clLearningMetric("点击率", `${clFormatDecimal(aggregate.ctr)}%`)}
            ${clLearningMetric("转化率", `${clFormatDecimal(aggregate.cvr)}%`)}
            ${clLearningMetric("千展成本", clFormatMoney(aggregate.cpm))}
            ${clLearningMetric("点击单价", clFormatMoney(aggregate.cpc))}
          </div>
        </section>
        <div class="cl-learning-list-head"><strong>当前周期命中素材</strong><span>按素材 ID × 千川账户 ID 聚合；命中 ${allRows.length} 条${normalizedQuery ? `，当前筛选 ${rows.length} 条` : ""}；最多展示前 100 条，每页 20 条</span></div>
        <div class="cl-learning-list">${visibleRows.length ? visibleRows.map(sample => `<article class="cl-learning-sample" data-cl-learning-sample>
          <button class="cl-learning-video ${clEscape(sample.tone)}" type="button" data-cl-sample-play aria-label="预览 ${clEscape(sample.id)}"><i>▶</i><span>9:16</span><em>预览播放</em></button>
          <div class="cl-learning-sample-main">
            <header><div><strong>${clEscape(sample.title)}</strong><span>素材 ID：${clEscape(sample.id)} ｜ 千川账户 ID：${clEscape(sample.accountId)}</span></div><div class="cl-learning-entry"><b>满足入池规则 ${sample.entryDays} 天</b><span>最近入池：${clEscape(sample.latestEntry)}</span></div></header>
            <div class="cl-learning-sample-metrics">
              <span>消耗 <b>${clFormatMoney(sample.metrics.spend)}</b></span><span>成交金额 <b>${clFormatMoney(sample.metrics.gmv)}</b></span><span>ROI <b>${clFormatDecimal(sample.metrics.roi)}</b></span><span>成交订单 <b>${sample.metrics.orders}</b></span>
              <span class="more">点击率 ${clFormatDecimal(sample.metrics.ctr)}% · 转化率 ${clFormatDecimal(sample.metrics.cvr)}% · 千展成本 ${clFormatMoney(sample.metrics.cpm)} · 点击单价 ${clFormatMoney(sample.metrics.cpc)}</span>
            </div>
            <div class="cl-learning-actions">
              <button type="button" data-cl-sample-detail="copy" data-cl-sample-id="${clEscape(sample.id)}" data-cl-sample-account="${clEscape(sample.accountId)}">文案解析 <span>查看完整解析</span></button>
              <button type="button" data-cl-sample-detail="records" data-cl-sample-id="${clEscape(sample.id)}" data-cl-sample-account="${clEscape(sample.accountId)}">入池记录 <span>${sample.entryDays} 天满足规则</span></button>
            </div>
          </div>
        </article>`).join("") : `<div class="cl-learning-empty">没有符合当前筛选条件的学习素材</div>`}</div>
        ${pagination}
      </section>`;
    }
    function clSetLearningSampleDetailTab(tab) {
      if (!clLearningSampleDetail) return;
      clLearningSampleDetail.querySelectorAll("[data-cl-learning-detail-tab]").forEach(button => button.classList.toggle("active", button.dataset.clLearningDetailTab === tab));
      clLearningSampleDetail.querySelectorAll("[data-cl-learning-detail-panel]").forEach(panel => panel.hidden = panel.dataset.clLearningDetailPanel !== tab);
    }
    function clCloseLearningSampleDetail() {
      if (!clLearningSampleDetail) return;
      clLearningSampleDetail.classList.remove("show");
      clLearningSampleDetail.hidden = true;
    }
    function clOpenLearningSampleDetail(sample, tab) {
      if (!sample || !clLearningSampleDetail || !clLearningSampleDetailBody) return;
      clLearningSampleDetailBody.innerHTML = `<section class="cl-learning-detail-summary">
        <button class="cl-learning-detail-video ${clEscape(sample.tone)}" type="button" data-cl-sample-detail-play aria-label="预览 ${clEscape(sample.id)}"><i>▶</i><span>9:16</span></button>
        <div class="cl-learning-detail-main"><div class="cl-learning-detail-title"><div><h3>${clEscape(sample.title)}</h3><p>素材 ID：${clEscape(sample.id)} ｜ 千川账户 ID：${clEscape(sample.accountId)}</p></div><b>满足入池规则 ${sample.entryDays} 天</b></div>
          <div class="cl-learning-sample-metrics"><span>消耗 <b>${clFormatMoney(sample.metrics.spend)}</b></span><span>成交金额 <b>${clFormatMoney(sample.metrics.gmv)}</b></span><span>ROI <b>${clFormatDecimal(sample.metrics.roi)}</b></span><span>成交订单 <b>${sample.metrics.orders}</b></span><span class="more">点击率 ${clFormatDecimal(sample.metrics.ctr)}% · 转化率 ${clFormatDecimal(sample.metrics.cvr)}% · 千展成本 ${clFormatMoney(sample.metrics.cpm)} · 点击单价 ${clFormatMoney(sample.metrics.cpc)}</span></div>
        </div>
      </section>
      <nav class="cl-learning-detail-tabs"><button type="button" data-cl-learning-detail-tab="copy">文案解析</button><button type="button" data-cl-learning-detail-tab="records">入池记录（${sample.entryDays} 天）</button></nav>
      <section class="cl-learning-detail-panel" data-cl-learning-detail-panel="copy"><div class="cl-learning-copy-full"><header><b>文案解析</b><button type="button" data-cl-sample-copy>复制文案</button></header><p>${clEscape(sample.script)}</p></div></section>
      <section class="cl-learning-detail-panel" data-cl-learning-detail-panel="records"><p class="cl-learning-records-note">以下展示该素材在当前筛选周期内，单日消耗满足入池规则的记录。</p><div class="cl-learning-records-table"><div class="cl-learning-records-row head"><span>入池日期</span><span>消耗</span><span>成交金额</span><span>ROI</span></div>${sample.records.map(record => `<div class="cl-learning-records-row"><span>${clEscape(record.date)}</span><span>${clFormatMoney(record.spend)}</span><span>${clFormatMoney(record.gmv)}</span><span>${clFormatDecimal(record.roi)}</span></div>`).join("")}</div></section>`;
      clLearningSampleDetail.hidden = false;
      clLearningSampleDetail.classList.add("show");
      clSetLearningSampleDetailTab(tab);
    }
    function clRenderActiveLearningSamples() {
      if (clActiveDetailStructure?.source === "千川学习") clRenderLearningSamples(clActiveDetailStructure);
    }

    function clSetDetailTab(tabName = "stages") {
      const target = document.querySelector(`#clDetailTabs [data-cl-detail-tab="${tabName}"]`);
      if (target?.hidden) tabName = "stages";
      document.querySelectorAll("#clDetailTabs [data-cl-detail-tab]").forEach(button => button.classList.toggle("active", button.dataset.clDetailTab === tabName));
      document.querySelectorAll("#clDetailDrawer [data-cl-detail-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.clDetailPanel === tabName));
      const body = clDetailDrawer?.querySelector(".cl-drawer-body");
      if (body) body.scrollTop = 0;
    }
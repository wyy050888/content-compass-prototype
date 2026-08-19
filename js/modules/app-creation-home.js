    (function () {
      const params = new URLSearchParams(location.search);
      const demo = params.get("demo");
      if (!demo) return;
      function tryAction(key, fn) { if (key === demo) setTimeout(fn, 50); }
      tryAction("library", () => document.querySelector('.source-tab[data-source="library"]').click());
      tryAction("upload", () => document.querySelector('.source-tab[data-source="upload"]').click());
      tryAction("history", () => document.getElementById("openHistory").click());
      tryAction("sample", () => goToSampleResult());
      tryAction("library-picked", () => {
        document.querySelector('.source-tab[data-source="library"]').click();
        setTimeout(() => {
          document.querySelectorAll('.library-pick-card')[0].click();
          document.querySelectorAll('.library-pick-card')[2].click();
          document.getElementById('confirmLibrary').click();
        }, 80);
      });
      tryAction("progress", () => {
        const ta = document.getElementById('linkInput');
        ta.value = 'https://v.douyin.com/abcd1234/\nhttps://www.douyin.com/video/1234567890\nhttps://www.iesdouyin.com/share/video/abcdef/';
        document.getElementById('addLinks').click();
        setTimeout(() => document.getElementById('startParse').click(), 120);
      });
      tryAction("result", () => {
        const ta = document.getElementById('linkInput');
        ta.value = 'https://v.douyin.com/abcd1234/\nhttps://www.douyin.com/video/1234567890';
        document.getElementById('addLinks').click();
        setTimeout(() => {
          document.getElementById('startParse').click();
        }, 120);
      });
      tryAction("frame", () => {
        switchPage("pull");
        setTimeout(() => document.querySelector('.tab-mini[data-tab="frame"]').click(), 80);
      });
    })();

    const agentCards = [...document.querySelectorAll(".agent-card[data-agent]")];
    const agentBrowser = document.getElementById("agentBrowser");
    const agentFilters = [...document.querySelectorAll(".agent-filter")];
    const agentGrid = document.getElementById("agentGrid");
    const newCreateButton = document.querySelector(".new-chat");
    const newCreatePopover = document.getElementById("newCreatePopover");
    const newCreateOptions = [...document.querySelectorAll("[data-create-agent-type], [data-create-page]")];
    const creationShell = document.querySelector("#page-creation .ai-shell");
    const conversationPanelToggle = document.getElementById("conversationPanelToggle");

    function setConversationPanelCollapsed(collapsed) {
      if (!creationShell || !conversationPanelToggle) return;
      creationShell.classList.toggle("conversation-collapsed", collapsed);
      conversationPanelToggle.textContent = collapsed ? "›" : "‹";
      conversationPanelToggle.setAttribute("aria-expanded", String(!collapsed));
      conversationPanelToggle.setAttribute("aria-label", collapsed ? "展开创作列表" : "收起创作列表");
      conversationPanelToggle.title = collapsed ? "展开创作列表" : "收起创作列表";
    }

    conversationPanelToggle?.addEventListener("click", () => {
      setConversationPanelCollapsed(!creationShell?.classList.contains("conversation-collapsed"));
    });

    function filterAgents(category) {
      let visibleCount = 0;
      document.querySelectorAll("#agentGrid .agent-card").forEach(card => {
        const visible = category === "all" || card.dataset.category === category;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      agentFilters.forEach(filter => {
        const active = filter.dataset.agentFilter === category;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-selected", String(active));
      });
      agentGrid.classList.toggle("is-filtered", category !== "all");
      agentGrid.style.setProperty("--filtered-count", String(Math.max(1, Math.min(3, visibleCount))));
      agentGrid.scrollTo({ left: 0, behavior: "smooth" });
    }

    agentFilters.forEach(filter => filter.addEventListener("click", () => filterAgents(filter.dataset.agentFilter)));

    function positionNewCreatePopover() {
      if (newCreatePopover.hidden) return;
      const rect = newCreateButton.getBoundingClientRect();
      const width = Math.min(368, window.innerWidth - 24);
      const preferredLeft = rect.right + 12;
      const left = Math.min(preferredLeft, window.innerWidth - width - 12);
      const top = Math.max(12, Math.min(rect.top, window.innerHeight - Math.min(640, window.innerHeight - 24)));
      newCreatePopover.style.width = `${width}px`;
      newCreatePopover.style.left = `${Math.max(12, left)}px`;
      newCreatePopover.style.top = `${top}px`;
    }

    function setNewCreateMenu(open) {
      newCreatePopover.hidden = !open;
      newCreateButton.setAttribute("aria-expanded", String(open));
      if (open) requestAnimationFrame(positionNewCreatePopover);
    }

    const agentPill = document.querySelector("#agentPill .agent-pill-label");
    const agentPillButton = document.getElementById("agentPill");
    const agentPicker = document.getElementById("agentPicker");
    const agentPopover = document.getElementById("agentPopover");
    const agentOptions = [...document.querySelectorAll(".agent-option")];
    const modelSelect = document.getElementById("modelSelect");
    const modelPicker = document.getElementById("modelPicker");
    const modelTrigger = document.getElementById("modelTrigger");
    const modelTriggerText = document.getElementById("modelTriggerText");
    const modelOptionList = document.getElementById("modelOptionList");
    const modelModeLabel = document.getElementById("modelModeLabel");
    const sendPromptButton = document.getElementById("sendPrompt");
    const modal = document.getElementById("agentModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalIntro = document.getElementById("modalIntro");
    const agentProcess = document.getElementById("agentProcess");
    const dynamicForm = document.getElementById("dynamicForm");
    const formFeedback = document.getElementById("formFeedback");
    const saveProductButton = document.getElementById("saveProductButton");
    const contextStatus = document.getElementById("contextStatus");
    let activeAgent = "";
    let activeType = "";
    let agentSelectionPending = false;
    const productCatalog = {
      "mite-pro": {
        name: "轻净 Pro 除螨仪",
        brand: "轻净",
        category: "清洁电器",
        code: "SPU-QJ-MITE-PRO",
        status: "在售",
        assetCount: "关联资产 18",
        core: "大吸力深层清洁，拍打吸尘同步完成",
        secondary: "透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用",
        difference: "清洁效果可视化，操作完成后尘杯清理方便",
        audiences: ["宝妈家庭", "养宠家庭"],
        psychology: ["风险规避", "理性求证"],
        facts: "已读取产品卖点、关联资产和 18 个禁用表达"
      },
      "air-a8": {
        name: "轻享空气炸锅 A8",
        brand: "轻享",
        category: "厨房电器",
        code: "SPU-QX-AIR-A8",
        status: "在售",
        assetCount: "关联资产 15",
        core: "可视化烹饪窗口，少翻面也能掌握食物状态",
        secondary: "大容量满足家庭用餐，炸篮可拆洗",
        difference: "烹饪过程看得见，降低反复开盖造成的热量流失",
        audiences: ["宝妈家庭", "精致生活人群"],
        psychology: ["省时省力", "家庭关怀"],
        facts: "已读取产品卖点、关联资产和 15 个禁用表达"
      },
      "washer-s5": {
        name: "净界洗地机 S5",
        brand: "净界",
        category: "清洁电器",
        code: "SPU-JJ-WASHER-S5",
        status: "在售",
        assetCount: "关联资产 21",
        core: "吸拖洗一体，一次完成地面干湿垃圾清洁",
        secondary: "滚刷自清洁，减少清洁工具二次处理",
        difference: "复杂地面污渍一次推进处理，缩短家庭清洁链路",
        audiences: ["宝妈家庭", "养宠家庭", "精致生活人群"],
        psychology: ["省时省力", "理性求证"],
        facts: "已读取产品卖点、关联资产和 21 个禁用表达"
      },
      "blend-mini": {
        name: "随行榨汁杯 Mini",
        brand: "随行",
        category: "厨房电器",
        code: "SPU-SX-BLEND-MINI",
        status: "在售",
        assetCount: "关联资产 9",
        core: "便携随行，一键启动即可完成日常果蔬搅拌",
        secondary: "杯体轻巧，支持充电使用和拆洗",
        difference: "适合通勤、健身和办公室等临时饮用场景",
        audiences: ["通勤人群", "健身人群", "精致生活人群"],
        psychology: ["省时省力", "尝鲜心理"],
        facts: "已读取产品卖点、关联资产和 9 个禁用表达"
      }
    };
    const creationContext = {
      productId: "",
      productName: "",
      productSource: "library",
      productConfirmed: false,
      productSaved: true,
      originalFields: { marketingScene: "直播间引流" },
      customPresets: []
    };
    const copywritingModelCatalog = [
      { value:"gpt-5-6-terra", label:"GPT-5.6 Terra", group:"推荐模型", recommended:true },
      { value:"claude-sonnet-5", label:"Claude Sonnet 5", group:"国外模型" },
      { value:"gemini-3-6-flash", label:"Gemini 3.6 Flash", group:"国外模型" },
      { value:"doubao-seed-2-pro", label:"豆包 Seed 2.0 Pro", group:"国内模型" },
      { value:"deepseek-v4-pro", label:"DeepSeek V4 Pro", group:"国内模型" },
      { value:"qwen-3-7-max", label:"通义千问 Qwen3.7-Max", group:"国内模型" }
    ];
    const fixedCopywritingModel = copywritingModelCatalog[0];
    // 内容结构一律由模板库 iframe 提供；本页不维护结构副本。
    function contentStructureCatalog() {
      return (mixTemplateStructureCatalog || []).filter(item => item.status !== "提炼失败");
    }
    function findContentStructure(id) {
      return contentStructureCatalog().find(item => item.id === String(id));
    }

    const modelOptions = {
      text: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内模型">
          <option value="doubao-seed-2-pro">豆包 Seed 2.0 Pro</option>
          <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
          <option value="qwen-3-7-max">通义千问 Qwen3.7-Max</option>
        </optgroup>
        <optgroup label="国外模型">
          <option value="gpt-5-6-terra">GPT-5.6 Terra</option>
          <option value="claude-sonnet-5">Claude Sonnet 5</option>
          <option value="gemini-3-6-flash">Gemini 3.6 Flash</option>
        </optgroup>
      `,
      multimodal: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内多模态模型">
          <option value="doubao-seed-2-pro">豆包 Seed 2.0 Pro</option>
          <option value="qwen-3-5-omni-plus">通义千问 Qwen3.5-Omni-Plus</option>
        </optgroup>
        <optgroup label="国际多模态模型">
          <option value="gpt-5-6-terra">GPT-5.6 Terra</option>
          <option value="claude-sonnet-5">Claude Sonnet 5</option>
          <option value="gemini-3-6-flash">Gemini 3.6 Flash</option>
        </optgroup>
      `,
      image: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内图片模型">
          <option value="seedream-4">豆包 Seedream 4.0</option>
          <option value="jimeng-image-3">即梦图片 3.0</option>
          <option value="qwen-image">通义万相 Qwen-Image</option>
        </optgroup>
        <optgroup label="国际图片模型">
          <option value="gpt-image-1">GPT Image 1</option>
          <option value="gemini-image">Gemini Image</option>
        </optgroup>
      `,
      video: `
        <option value="mix-v16">内容罗盘混剪引擎 V16（推荐）</option>
        <optgroup label="国内 AI 补镜模型">
          <option value="seedance-2">Seedance 2.0</option>
          <option value="kling">可灵视频模型</option>
          <option value="vidu">Vidu 视频模型</option>
        </optgroup>
        <optgroup label="国际 AI 补镜模型">
          <option value="veo-3-1">Google Veo 3.1</option>
          <option value="openai-video">OpenAI 视频模型</option>
        </optgroup>
      `,
      videoGeneration: `
        <option value="seedance-2">Seedance 2.0（推荐）</option>
        <optgroup label="国内视频生成模型">
          <option value="kling">可灵视频模型</option>
          <option value="vidu">Vidu 视频模型</option>
        </optgroup>
        <optgroup label="国际视频生成模型">
          <option value="veo-3-1">Google Veo 3.1</option>
          <option value="openai-video">OpenAI 视频模型</option>
        </optgroup>
      `
    };

    const modelDescriptions = {
      auto: "根据任务质量、速度和成本自动选择最合适的模型",
      "doubao-seed-2-pro": "中文理解与营销表达能力均衡，适合口播和脚本生成",
      "deepseek-v4-pro": "逻辑推理与长文本改写能力突出",
      "qwen-3-7-max": "中文内容生成稳定，适合批量创作文案",
      "qwen-3-5-omni-plus": "支持图文与视频理解，适合脚本拆解和镜头分析",
      "gpt-5-6-terra": "综合创作与指令遵循能力强，适合复杂内容任务",
      "claude-sonnet-5": "长文本结构和自然表达表现稳定",
      "gemini-3-6-flash": "多模态理解速度快，适合参考素材分析",
      "mix-v16": "从素材库匹配镜头并完成字幕、配音、包装和混剪",
      "seedance-2": "适合生成补充镜头，兼顾画面质量与运动表现",
      kling: "适合产品演示和写实场景补镜",
      vidu: "适合快速生成短镜头和创意转场",
      "veo-3-1": "适合高质量复杂场景和电影感镜头",
      "openai-video": "适合创意画面与多镜头视频生成"
      ,"seedream-4": "商品图细节和中文电商视觉表现稳定",
      "jimeng-image-3": "适合批量生成写实商品场景和活动视觉",
      "qwen-image": "适合中文海报、卖点排版和图文模块",
      "gpt-image-1": "适合复杂画面重构和高质量商品视觉",
      "gemini-image": "适合结合参考图进行创作与编辑"
    };

    const modelModeLabels = {
      text: "文案生成模型",
      multimodal: "多模态理解模型",
      image: "图片生成模型",
      video: "混剪与视频模型",
      videoGeneration: "视频生成模型"
    };

    function getModelMode(type) {
      if (type === "image-main" || type === "image-detail") return "image";
      if (type === "mix") return "video";
      if (type === "script" || type === "script-copy") return "multimodal";
      return "text";
    }

    function renderModelOptions(type) {
      const mode = getModelMode(type);
      modelSelect.innerHTML = modelOptions[mode] || modelOptions.text;
      modelSelect.disabled = false;
      modelTrigger.disabled = false;
      modelModeLabel.textContent = modelModeLabels[mode];
      renderModelPickerOptions();
    }

    function selectedModelLabel() {
      return modelSelect.options[modelSelect.selectedIndex]?.text || "自动优选";
    }

    function renderModelPickerOptions() {
      const selectedValue = modelSelect.value;
      const blocks = [];
      [...modelSelect.children].forEach(node => {
        if (node.tagName === "OPTGROUP") {
          blocks.push(`<div class="model-group-title">${node.label}</div>`);
          [...node.children].forEach(option => blocks.push(renderModelOption(option, selectedValue)));
        } else if (node.tagName === "OPTION") {
          blocks.push(renderModelOption(node, selectedValue));
        }
      });
      modelOptionList.innerHTML = blocks.join("");
      modelTriggerText.textContent = selectedModelLabel();
    }

    function renderModelOption(option, selectedValue) {
      const selected = option.value === selectedValue;
      const recommended = option.value === "auto" || option.value === "mix-v16" || option.value === "seedance-2";
      return `
        <button class="model-option${selected ? " selected" : ""}" type="button" data-model-value="${option.value}" role="option" aria-selected="${selected}">
          <span class="model-option-icon">${option.value === "mix-v16" ? "剪" : option.value === "auto" ? "智" : "✦"}</span>
          <span class="model-option-copy">
            <span class="model-option-name">${option.text}${recommended ? "<em>推荐</em>" : ""}</span>
            <span class="model-option-desc">${modelDescriptions[option.value] || "适用于当前创作任务"}</span>
          </span>
          <span class="model-option-check">${selected ? "✓" : ""}</span>
        </button>
      `;
    }

    function setModelPicker(open) {
      modelPicker.classList.toggle("open", open);
      modelTrigger.setAttribute("aria-expanded", String(open));
    }

    const productOptions = `
      <option value="mite-pro">轻净 Pro 除螨仪</option>
      <option value="air-a8">轻享空气炸锅 A8</option>
      <option value="washer-s5">净界洗地机 S5</option>
    `;

    const SCRIPT_VOICE_OPTIONS = [
      ["陈子建·公版", "陈", "沉稳男声"], ["许念·公版", "许", "温柔女声"],
      ["阿乐·公版", "乐", "自然男声"], ["周雨桐·公版", "周", "明快女声"],
      ["方圆·公版", "方", "亲和女声"], ["高远·公版", "高", "专业男声"],
      ["夏语薇·公版", "夏", "轻快女声"], ["陈海峰·公版", "海", "磁性男声"]
    ];
    function voiceOptionsHtml(optionAttribute, previewAttribute, selectedValue = SCRIPT_VOICE_OPTIONS[0][0]) {
      return SCRIPT_VOICE_OPTIONS.map(([name, avatar, tone]) => {
        const selected = name === selectedValue;
        return `<div class="script-voice-choice"><button class="script-voice-select${selected ? " active" : ""}" type="button" data-voice-option="${escapeHtml(name)}" data-${optionAttribute}="${escapeHtml(name)}" aria-pressed="${selected}"><span class="script-voice-avatar" aria-hidden="true">${avatar}</span><span class="script-voice-meta"><b>${name}</b><small>${tone}</small></span><i>✓</i></button><button class="script-voice-preview" type="button" data-voice-preview="${escapeHtml(name)}" data-${previewAttribute}="${escapeHtml(name)}" aria-label="试听 ${name}"><span>▶</span><em>试听</em></button></div>`;
      }).join("");
    }
    function scriptVoiceOptionsHtml() {
      return voiceOptionsHtml("script-voice-option", "script-voice-preview");
    }

    function bindVoiceChoiceEvents(root, inputSelector) {
      root.querySelectorAll("[data-voice-option]").forEach(button => {
        button.addEventListener("click", () => {
          root.querySelectorAll("[data-voice-option]").forEach(item => {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
          });
          const input = root.querySelector(inputSelector);
          if (input) input.value = button.dataset.voiceOption;
          if (input) input.dispatchEvent(new Event("change", { bubbles:true }));
        });
      });
      let voicePreviewTimer = null;
      root.querySelectorAll("[data-voice-preview]").forEach(button => {
        button.addEventListener("click", () => {
          const card = button.closest(".script-voice-choice");
          const isPlaying = card?.classList.contains("is-playing");
          clearTimeout(voicePreviewTimer);
          root.querySelectorAll(".script-voice-choice").forEach(item => {
            item.classList.remove("is-playing");
            item.querySelector("[data-voice-preview] em")?.replaceChildren("试听");
          });
          if (isPlaying) return;
          card?.classList.add("is-playing");
          button.querySelector("em")?.replaceChildren("试听中");
          showToast(`正在试听 ${button.dataset.voicePreview}`);
          voicePreviewTimer = setTimeout(() => {
            card?.classList.remove("is-playing");
            button.querySelector("em")?.replaceChildren("试听");
          }, 4500);
        });
      });
    }

    const agentConfigs = {
      "image-main": {
        intro: "将产品图、核心卖点和投放目标转成一组可用于商品卡或图文推广的商品主图。",
        process: "读取产品信息与图片 → 选择主图表达策略 → 调用图片模型生成多版 → 检查商品主体和文字信息 → 输出可继续编辑的图片资产。",
        placeholder: "还可以补充：保留白色产品主体，画面更干净；突出可水洗尘杯，但不要写价格……",
        request: "为轻净 Pro 除螨仪生成 3 张商品主图，突出深层清洁和可水洗尘杯，用于商品卡推广。",
        version: "商品主图 V1", summary: "已生成 3 张商品主图方案，产品主体、核心卖点和版式策略可继续调整。",
        form: `<section class="form-section"><div class="form-section-head"><div><strong>产品与主图目标</strong><small>产品库中的产品图和卖点会自动带入，也可以在本次任务中补充</small></div></div><div class="section-grid"><div class="field full"><label>创作产品 *</label><select data-product-select>${productOptions}</select></div><div class="field"><label>主图用途 *</label><select><option>商品卡推广</option><option>图文推广</option><option>商品链接首图</option></select></div><div class="field"><label>输出数量 *</label><select><option>3 张</option><option>5 张</option></select></div><div class="field full"><label>优先表达的核心卖点 *</label><textarea data-field="core">大吸力深层清洁，拍打吸尘同步完成</textarea></div><div class="field full"><label>产品图</label><div class="upload-box"><strong>从产品库读取产品图 · 可补充上传</strong><span>商品主体会作为生成约束，避免生成错误外观</span></div></div></div></section><section class="form-section"><div class="form-section-head"><div><strong>画面要求</strong><small>定义本组图片的创作方向，后续可在结果中继续修改</small></div></div><div class="section-grid"><div class="field"><label>画面风格 *</label><select><option>干净电商白底</option><option>真实家庭场景</option><option>功能演示场景</option><option>活动氛围图</option></select></div><div class="field"><label>画面比例 *</label><select><option>1:1 方图</option><option>3:4 竖图</option><option>9:16 竖图</option></select></div><div class="field full"><label>画面补充要求</label><textarea>产品主体清晰，卖点只表达产品档案中已有的信息；不生成价格、夸大功效或无法确认的对比。</textarea></div></div></section>`,
        result: `<div class="result-section-title">本次生成图片</div><div class="result-grid"><div class="result-card"><div class="result-meta"><span class="badge">主图 A</span><span class="badge green">结果冲击</span></div><p><strong>尘杯脏污可视化</strong><br>以产品主体 + 尘杯近景呈现“清洁结果”，适合商品卡首图。</p></div><div class="result-card"><div class="result-meta"><span class="badge">主图 B</span><span class="badge green">功能表达</span></div><p><strong>拍打吸尘同步完成</strong><br>用床垫使用场景呈现核心能力，产品主体保持清晰。</p></div><div class="result-card"><div class="result-meta"><span class="badge">主图 C</span><span class="badge green">使用便利</span></div><p><strong>尘杯可拆卸水洗</strong><br>突出可水洗尘杯，补强下单前的便利性理由。</p></div></div><div class="result-actions"><button class="soft-btn action-save">保存到图片库</button><button class="ghost-btn action-variant">继续生成同类图片</button></div>`
      },
      "image-detail": {
        intro: "将产品卖点拆成有清晰阅读顺序的详情页图片模块，输出后可继续编辑和复用。",
        process: "读取产品事实 → 选择详情页模块 → 组织卖点与画面 → 调用图片模型生成 → 输出可编辑的详情页图文资产。",
        placeholder: "还可以补充：第一张先讲床褥深层清洁，后面再解释拍打吸尘；所有图保持同一配色……",
        request: "为轻净 Pro 除螨仪生成 4 张详情页图片，依次展示深层清洁、拍打吸尘、可水洗尘杯和适用场景。",
        version: "商品详情页 V1", summary: "已按卖点顺序生成 4 个详情页模块，可直接保存或继续改图。",
        form: `<section class="form-section"><div class="form-section-head"><div><strong>产品与详情页模块</strong><small>从产品库读取卖点与关联图片；选择本次需要生产的详情页内容</small></div></div><div class="section-grid"><div class="field full"><label>创作产品 *</label><select data-product-select>${productOptions}</select></div><div class="field full"><label>生成模块 *（可多选）</label><div class="choice-row"><span class="choice-chip active">核心卖点</span><span class="choice-chip active">功能演示</span><span class="choice-chip">使用场景</span><span class="choice-chip">参数说明</span><span class="choice-chip">购买理由</span></div></div><div class="field"><label>输出数量 *</label><select><option>4 张</option><option>6 张</option><option>8 张</option></select></div><div class="field"><label>图片比例 *</label><select><option>750 × 1000</option><option>750 × 750</option><option>1080 × 1440</option></select></div><div class="field full"><label>本次优先卖点</label><textarea data-field="core">大吸力深层清洁；拍打吸尘同步完成；透明尘杯可拆卸水洗</textarea></div></div></section><section class="form-section"><div class="form-section-head"><div><strong>画面与文案约束</strong><small>统一本次详情页的视觉和表达，已有图片可作为参考，不覆盖产品事实</small></div></div><div class="section-grid"><div class="field"><label>页面风格</label><select><option>简洁功能说明</option><option>场景化卖点展示</option><option>专业参数说明</option></select></div><div class="field"><label>关联图片来源</label><select><option>产品库图片优先</option><option>指定图片库素材</option><option>本次补充上传</option></select></div><div class="field full"><label>补充要求</label><textarea>按“一个模块只讲一个重点”组织；保留产品品牌和外观一致；不写入产品库没有的参数、优惠或功效。</textarea></div></div></section>`,
        result: `<div class="result-section-title">详情页模块</div><div class="result-grid"><div class="result-card"><div class="result-meta"><span class="badge">模块 1</span><span class="badge green">核心卖点</span></div><p><strong>深层清洁</strong><br>场景问题 → 产品使用 → 清洁结果，适合首屏建立购买理由。</p></div><div class="result-card"><div class="result-meta"><span class="badge">模块 2</span><span class="badge green">功能演示</span></div><p><strong>拍打吸尘同步</strong><br>将产品动作与尘杯结果分层呈现，强化能力理解。</p></div><div class="result-card"><div class="result-meta"><span class="badge">模块 3</span><span class="badge green">使用便利</span></div><p><strong>尘杯可拆卸水洗</strong><br>通过步骤型画面说明日常清理方式。</p></div></div><div class="result-actions"><button class="soft-btn action-save">保存到图片库</button><button class="ghost-btn action-variant">补充更多模块</button></div>`
      },
      original: {
        intro: "从产品事实出发，生成适合千川短视频的多版本口播文案。系统会控制单一测试变量，便于连续生产同一产品的不同内容。",
        process: "读取产品档案 → 调用产品级爆款结构与正负样本策略 → 生成单变量 A/B 文案 → 校验卖点、禁用词和时长。",
        placeholder: "还可以补充：口语更直接、卖点前置、第一句不要提问……",
        request: "为轻净 Pro 除螨仪生成 3 条暑期投放文案，只改变前 3 秒钩子，突出深层清洁和可水洗尘杯。",
        version: "产品策略 V18",
        summary: "已生成 3 条可独立测试的口播文案。本轮仅改变前 3 秒钩子，正文卖点顺序、优惠表达与 CTA 保持一致。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>产品与核心卖点</strong><small>默认从产品库读取；也可通过商品链接识别或手动输入</small></div><div class="source-tabs" aria-label="产品来源"><button class="source-tab active" type="button" data-product-source="library">产品库</button><button class="source-tab" type="button" data-product-source="link">商品链接</button><button class="source-tab" type="button" data-product-source="manual">手动输入</button></div></div>
            <div class="section-grid">
              <div class="product-source-panel" data-product-source-panel="library">
                <div class="field full"><label>创作产品 *</label><select data-product-select data-required>${productOptions}</select><span class="field-hint" data-product-fact-hint>已读取产品卖点、关联资产和禁用表达</span></div>
              </div>
              <div class="product-source-panel" data-product-source-panel="link" hidden>
                <div class="field full"><label>商品链接 *</label><div class="inline-control"><input data-product-link placeholder="粘贴抖店商品链接"><button class="soft-btn" type="button" data-action="recognize-product">AI 识别产品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div>
              </div>
              <div class="product-source-panel" data-product-source-panel="manual" hidden>
                <div class="field full"><label>产品名称 *</label><input data-manual-product-name placeholder="输入产品名称"></div>
              </div>
              <div class="field full"><div class="field-label-row"><label>核心卖点 *</label><button class="text-action" type="button" data-action="refine-selling-points">AI 卖点提炼</button></div><textarea data-field="core" data-required>大吸力深层清洁，拍打吸尘同步完成</textarea><div class="inline-feedback success" data-selling-feedback hidden></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>本次创作</strong><small>只保留最常用参数，其他信息放在高级设置</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>文案风格 *</label><div class="choice-row" data-single="style" data-role="style"><span class="choice-chip active">不限</span><span class="choice-chip">引发好奇</span><span class="choice-chip">痛点类型</span><span class="choice-chip">活动类型</span><span class="choice-chip">悬疑类型</span><span class="choice-chip">打感情类型</span><span class="choice-chip">对比类型</span><span class="choice-chip">种草类型</span><span class="choice-chip">网络爆款音频类型</span><span class="choice-chip">制造焦虑类型</span><span class="choice-chip">明星文案类型</span><span class="choice-chip">点名人群类型</span><span class="choice-chip">正话反说类型</span><span class="choice-chip">品牌类型</span></div></div>
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="300" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 1 分 15 秒</b></div></div>
              <div class="field"><label>生成数量 *</label><select><option>3 条</option><option>5 条</option></select></div>
              <div class="field full"><label>本轮主测变量 *</label><div class="choice-row" data-single="variable"><span class="choice-chip active">前 3 秒钩子</span><span class="choice-chip">卖点顺序</span><span class="choice-chip">人群切口</span><span class="choice-chip">CTA</span></div></div>
              <details class="advanced-block">
                <summary>高级设置：卖点、人群、CTA与禁用表达</summary>
                <div class="section-grid advanced-content">
                  <div class="field"><label>核心次要卖点</label><textarea data-field="secondary">透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用</textarea></div>
                  <div class="field"><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
                  <div class="field full"><label>营销利益点</label><textarea data-field="marketing">暑期活动，到手赠送 3 个替换滤网</textarea><div class="quick-tags" data-marketing-tags><button class="quick-tag" type="button" data-marketing-value="限时折扣">限时折扣</button><button class="quick-tag" type="button" data-marketing-value="直播专享">直播专享</button><button class="quick-tag" type="button" data-marketing-value="今日特惠">今日特惠</button><button class="quick-tag active" type="button" data-marketing-value="赠送3个替换滤网">赠品</button><button class="quick-tag" type="button" data-marketing-value="拍一发三">拍一发三</button></div><span class="field-hint">营销信息只用于本次创作，不写入长期产品事实</span></div>
                  <div class="field full"><div class="field-label-row"><label>目标人群</label><button class="text-action" type="button" data-action="recommend-audience">AI 推荐人群</button></div><div class="audience-box" data-audience-box><button class="audience-chip active" type="button">宝妈家庭</button><button class="audience-chip active" type="button">养宠家庭</button><button class="audience-chip" type="button">易敏人群</button><button class="audience-chip" type="button">租房人群</button><button class="audience-chip" type="button">精致生活人群</button></div><div class="inline-control" style="margin-top:8px;"><input data-custom-audience placeholder="输入自定义人群"><button class="soft-btn" type="button" data-action="add-audience">添加人群</button></div></div>
                  <div class="field"><label>CTA 要求</label><input data-field="cta" value="引导进入直播间了解，不制造虚假紧迫感"></div>
                  <div class="field"><label>不希望出现的表达</label><input data-field="forbidden" value="绝对化功效、最低价、未经确认的除菌率"></div>
                  <div class="field full"><label>补充要求</label><textarea data-field="extra">短句、断句、口语化；不要使用提问式开场，不虚构功效和优惠。</textarea></div>
                  <div class="field full"><label>创作预设</label><div class="preset-row"><select data-creation-preset><option value="">选择已有预设</option><option value="summer-conversion">暑期成交｜宝妈家庭｜痛点直给</option><option value="pet-hard-ad">养宠家庭｜硬广直给｜证据先行</option></select><button class="soft-btn" type="button" data-action="save-preset">保存当前为预设</button></div><div class="inline-feedback success" data-preset-feedback hidden></div></div>
                </div>
              </details>
            </div>
          </section>
        `,
        result: `
          <div class="result-grid">
            <div class="result-card">
              <div class="result-meta"><span class="badge orange">A｜结果冲击</span><span class="badge gray">31 秒</span><span class="badge green">事实已校验</span></div>
              <p><strong>床单看着干净，不代表真的干净。</strong>这个除螨仪在床上走一遍，藏在织物里的毛发、碎屑都能吸进尘杯。大吸力配合拍打，把清洁从表面做到深处；用完尘杯还能直接水洗，日常清理不费劲。</p>
            </div>
            <div class="result-card">
              <div class="result-meta"><span class="badge orange">B｜人群点名</span><span class="badge gray">32 秒</span><span class="badge green">事实已校验</span></div>
              <p><strong>家里有孩子、宠物的，床铺别只用粘毛器。</strong>轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑，尘杯可拆可水洗。每天睡前推一遍，床垫、沙发和布艺都能清洁。</p>
            </div>
            <div class="result-card">
              <div class="result-meta"><span class="badge orange">C｜场景冲突</span><span class="badge gray">30 秒</span><span class="badge green">事实已校验</span></div>
              <p><strong>刚换的床单，第一遍照样能吸出一杯脏东西。</strong>不是床单没洗净，是毛发和碎屑会藏进织物深处。用它边拍边吸，再把尘杯拆下水洗，卧室清洁一步完成。</p>
            </div>
          </div>
          <div class="result-note"><strong>变量控制：</strong>三版仅更换开场钩子；“问题证据 → 产品能力 → 使用便利 → 行动引导”的正文结构一致，可直接进入同产品素材测试。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存 3 条到文案库</button><button class="ghost-btn action-script">选择文案转脚本</button><button class="ghost-btn action-variant">继续生成同类版本</button></div>
        `
      },
      copy: {
        intro: "先拆解参考爆款的钩子、结构和节奏，再用当前产品事实重新表达。保留的是创作方法，不复制原文或未经证实的卖点。",
        process: "解析参考素材 → 提取钩子、节奏和内容结构 → 与目标产品事实映射 → 生成原创版本并标明保留项与替换项。",
        placeholder: "还可以补充：保留冲突式开场，但不要沿用原素材的价格表达……",
        request: "从视频库选择参考视频，为轻净 Pro 除螨仪生成 3 条原创仿写文案。",
        version: "仿写方法 V12",
        summary: "已完成参考素材结构拆解，并将可复用方法映射到当前产品。未复制原句，未迁移参考商品的功效、参数或优惠。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>参考爆款</strong><small>内部千川素材可读取文案；外部内容仅作为创意参考</small></div></div>
            <div class="section-grid">
              <div class="field"><label>参考来源 *</label><select><option>从视频库选择</option><option>上传视频</option><option>粘贴文案</option></select></div>
              <div class="field"><label>参考视频 *</label><input value="轻净 Pro 除螨仪｜结果冲击型"></div>
              <div class="field full"><label>希望借鉴的元素 *（最多 2 项）</label><div class="choice-row" data-limit="2"><span class="choice-chip active">3 秒钩子</span><span class="choice-chip active">内容结构</span><span class="choice-chip">语言节奏</span><span class="choice-chip">卖点表达</span><span class="choice-chip">CTA 方式</span></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>目标内容</strong><small>参考方法将重新映射到当前产品事实</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>目标产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>目标人群</label><input value="有孩子或养宠物的家庭"></div>
              <div class="field"><label>输出数量 *</label><select><option>3 条</option><option>5 条</option></select></div>
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="300" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 1 分 15 秒</b></div></div>
              <div class="field"><label>目标风格</label><select><option>沿用参考节奏</option><option>硬广直给</option><option>痛点口播</option><option>专业测评</option></select></div>
              <div class="field full"><label>仿写边界</label><textarea>不沿用参考商品的品牌名、功效参数、价格和优惠；不逐句同义替换；所有产品表达必须来自目标产品档案。</textarea></div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">参考爆款方法拆解</div>
          <div class="copy-result">
            <div class="structure-line"><strong>钩子机制</strong><span>反常识结果 + 立即展示脏污证据，前 3 秒完成“停留理由”</span></div>
            <div class="structure-line"><strong>内容结构</strong><span>结果冲击 → 场景痛点 → 产品能力 → 操作便利 → 行动引导</span></div>
            <div class="structure-line"><strong>语言节奏</strong><span>短句为主；每 2–4 秒一个新信息点；先给结果，再解释原因</span></div>
          </div>
          <div class="result-section-title">产品映射与原创重构</div>
          <div class="copy-result">
            <div class="compare-row"><strong>保留</strong><span>“看似干净却吸出脏污”的视觉冲突、快节奏递进</span></div>
            <div class="compare-row"><strong>替换</strong><span>参考商品功能 → 轻净 Pro 的拍打吸尘、可水洗尘杯；参考优惠 → 当前已审核权益</span></div>
            <div class="compare-row"><strong>规避</strong><span>删除无法由产品档案证明的除菌率、权威背书和最低价表达</span></div>
          </div>
          <div class="result-grid">
            <div class="result-card"><div class="result-meta"><span class="badge orange">版本 A｜视觉冲突</span><span class="badge green">原创度通过</span></div><p><strong>床垫刚晒完，照样能吸出一杯毛发碎屑。</strong>真正藏在织物深处的脏东西，靠拍打和表面清扫很难带走……</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">版本 B｜场景冲突</span><span class="badge green">原创度通过</span></div><p><strong>每天睡的床，可能比你看到的更需要清洁。</strong>轻净 Pro 边拍边吸，床垫和布艺里的碎屑直接进入尘杯……</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">版本 C｜人群点名</span><span class="badge green">原创度通过</span></div><p><strong>家里养宠物，床铺清洁别只处理表面的毛。</strong>它把拍打和吸力一起用，深入布艺缝隙带走毛发碎屑……</p></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存仿写结果</button><button class="ghost-btn action-script">转为脚本</button><button class="ghost-btn action-variant">更换参考元素</button></div>
        `
      },
      rewrite: {
        intro: "对已有可用文案做可控改写。用户可以锁定正文或卖点，只替换钩子、压缩时长、切换人群或调整表达风格。",
        process: "识别原文结构 → 锁定必须保留内容 → 只执行选定改写任务 → 展示前后差异并生成多个延伸版本。",
        placeholder: "还可以补充：第一句更硬、更短，正文不要改，控制在 3 秒内……",
        request: "保留正文和 CTA，只把前 3 秒换成更有冲击力的结果型钩子，生成 3 个延伸视频版本。",
        version: "改写规则 V9",
        summary: "已锁定正文、卖点顺序与 CTA，仅替换前 3 秒钩子。三个版本可沿用同一主体视频，只需替换开场镜头和对应字幕。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>原始内容</strong><small>读取文案及对应产品信息，改写不会覆盖原资产</small></div></div>
            <div class="section-grid">
              <div class="field"><label>原文来源 *</label><select><option>从文案库选择</option><option>直接粘贴文案</option><option>从当前会话资产选择</option></select></div>
              <div class="field"><label>选择文案 *</label><select><option>除螨仪暑期口播 V1</option><option>除螨仪家庭场景 V3</option></select></div>
              <div class="field full"><label>原文预览</label><textarea>你家床垫真的洗干净了吗？轻净 Pro 一边拍打一边吸走织物深处的毛发和碎屑……</textarea></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>改写范围</strong><small>选择快捷任务，也可以用自然语言说明修改目标</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>改写任务 *</label><div class="choice-row"><span class="choice-chip active">只换 3 秒钩子</span><span class="choice-chip">缩短篇幅</span><span class="choice-chip">更换目标人群</span><span class="choice-chip">卖点前置</span><span class="choice-chip">调整为硬广</span><span class="choice-chip">调整为测评</span><span class="choice-chip">减少废话</span></div></div>
              <div class="field full"><label>自定义改写要求 *</label><textarea>保留正文结构和结尾 CTA，只把第一句改成更有冲击力的结果型钩子。</textarea></div>
              <div class="field full"><label>必须锁定、不允许修改</label><input value="正文卖点顺序、可水洗尘杯、结尾 CTA"></div>
              <div class="field"><label>目标字数</label><div class="input-with-unit"><input type="number" min="20" max="2000" value="300" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 1 分 15 秒</b></div></div>
              <div class="field"><label>输出版本 *</label><select><option>3 个版本</option><option>5 个版本</option><option>1 个版本</option></select></div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">本轮改写范围</div>
          <div class="copy-result">
            <div class="compare-row"><strong>原钩子</strong><span class="diff-old">你家床垫真的洗干净了吗？</span></div>
            <div class="compare-row"><strong>锁定不改</strong><span>正文卖点顺序、可水洗尘杯、结尾 CTA</span></div>
            <div class="compare-row"><strong>制作影响</strong><span>主体视频可复用，仅替换 0–3 秒口播、字幕和开场镜头</span></div>
          </div>
          <div class="result-grid">
            <div class="result-card"><div class="result-meta"><span class="badge orange">延伸 A｜脏污证据</span><span class="badge gray">2.6 秒</span></div><p class="diff-new">刚换的床单，第一遍照样能吸出脏东西。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">延伸 B｜损失规避</span><span class="badge gray">2.8 秒</span></div><p class="diff-new">别再只晒床垫了，深处的毛发碎屑晒不走。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">延伸 C｜人群点名</span><span class="badge gray">2.9 秒</span></div><p class="diff-new">家里养宠物，床铺最该清理的是藏起来的毛。</p></div>
          </div>
          <div class="result-note"><strong>延伸视频建议：</strong>保留 3–30 秒主体成片；分别匹配“尘杯特写 / 床垫拍打 / 宠物上床”三个开场镜头，提高日产能而不牺牲变量可控性。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存为 3 个新版本</button><button class="ghost-btn action-script">同步更新脚本</button><button class="ghost-btn action-variant">继续调整语气</button></div>
        `
      },
      script: {
        intro: "系统将理解文案与素材内容，并将素材智能匹配至合适的时间点。",
        process: "解析口播信息点 → 规划时间轴与镜头任务 → 生成用户确认分镜 → 自动生成隐藏的机器执行指令供智能混剪调用。",
        placeholder: "还可以补充：卖点镜头必须用实拍，结尾保留品牌包装页……",
        request: "把除螨仪暑期口播 V1 转为 30 秒主视频脚本，使用实拍与历史素材，输出可确认分镜。",
        version: "编导模板 V14",
        summary: "已生成 30 秒主视频脚本。现有素材可直接覆盖 4/5 个镜头任务，覆盖率 80%；缺失镜头已标记为补拍建议。",
        form: `
          <section class="form-section" data-task-step="1">
            <div class="form-section-head"><div><strong>文案信息</strong><small>确认来源文案与对应产品；文案库内容仅在本次脚本任务内可编辑。</small></div></div>
            <div class="section-grid">
              <div class="field full">
                <label>来源文案 <span class="required-star">*</span></label>
                <div class="source-mode-switch" role="tablist" aria-label="来源文案切换">
                  <button type="button" class="active" data-script-source-mode="library" role="tab" aria-selected="true">从文案库选择</button>
                  <button type="button" data-script-source-mode="manual" role="tab" aria-selected="false">手动输入</button>
                </div>
                <div class="script-source-panel" data-script-source-panel="library">
                  <button class="script-library-trigger" type="button" data-action="open-script-library-picker" data-required>
                    <span class="script-library-trigger-placeholder" data-script-library-placeholder>选择文案</span>
                    <i>⌄</i>
                  </button>
                  <input type="hidden" data-script-source-library>
                  <div class="script-source-preview" data-script-source-preview hidden>
                    <textarea data-script-source-content rows="4" aria-label="当前任务文案">选择文案后,这里会显示完整口播文案，可在本次脚本任务内修改。</textarea>
                  </div>
                </div>
                <div class="script-source-panel" data-script-source-panel="manual" hidden>
                  <textarea data-script-source-text placeholder="粘贴或输入完整口播文案" rows="6"></textarea>
                </div>
              </div>

              <div class="field full" data-script-product-panel="library">
                <label>对应产品 <span class="required-star">*</span></label>
                <div class="script-product-display" data-script-library-product-display>
                  <span class="script-product-display-icon">◈</span>
                  <div><strong>等待带入对应产品</strong></div>
                </div>
                <input type="hidden" data-script-product>
              </div>

              <div class="field full" data-script-product-panel="manual" hidden>
                <label>对应产品 <span class="required-star">*</span></label>
                <div class="source-mode-switch script-product-source-switch" role="tablist" aria-label="产品来源切换">
                  <button type="button" class="active" data-script-product-source="library" role="tab" aria-selected="true">产品库</button>
                  <button type="button" data-script-product-source="link" role="tab" aria-selected="false">商品链接</button>
                  <button type="button" data-script-product-source="manual" role="tab" aria-selected="false">手工输入</button>
                </div>
                <div data-script-manual-product-panel="library">
                  <div class="script-product-row">
                    <input type="hidden" data-script-product data-required>
                    <button class="script-library-trigger" type="button" data-action="open-script-product-picker"><span data-script-selected-product>选择产品</span><i>⌄</i></button>
                  </div>
                </div>
                <div data-script-manual-product-panel="link" hidden>
                  <div class="script-product-row">
                    <input type="url" data-script-product-link placeholder="粘贴商品链接">
                    <input type="hidden" data-script-product data-required>
                    <button class="ghost-btn script-product-pick" type="button" data-action="recognize-script-product">解析商品</button>
                  </div>
                </div>
                <div data-script-manual-product-panel="manual" hidden>
                  <input type="text" data-script-product data-required placeholder="输入产品名称">
                </div>
              </div>

              <div class="field full" data-script-audience-field data-script-audience-panel>
                <label>目标人群 <span class="required-star">*</span></label>
                <div class="source-mode-switch script-persona-source" role="tablist" aria-label="目标人群来源">
                  <button type="button" class="active" data-script-persona-mode="template" role="tab" aria-selected="true">从模板库选择</button>
                  <button type="button" data-script-persona-mode="manual" role="tab" aria-selected="false">自行输入</button>
                </div>
                <div class="script-persona-mode-panel" data-script-persona-panel="template">
                  <div class="script-persona-trigger" data-action="open-script-audience-picker" role="button" tabindex="0">
                    <span class="script-persona-placeholder" data-script-audience-placeholder>请选择人群</span>
                    <span class="script-persona-chips" data-script-audience-chips hidden></span>
                    <button type="button" class="script-persona-clear" data-action="clear-script-audience" aria-label="清空目标人群" title="清空" hidden>×</button>
                    <i class="script-persona-arrow">›</i>
                  </div>
                </div>
                <div class="script-persona-mode-panel script-persona-manual" data-script-persona-panel="manual" hidden>
                  <div class="script-persona-groups" data-script-persona-groups></div>
                  <button type="button" class="script-persona-add-group" data-script-add-persona-group><i>＋</i>添加人群</button>
                </div>
                <input type="hidden" data-script-audience data-required>
              </div>

            </div>
          </section>

          <section class="form-section script-voice-section" data-task-step="1">
            <div class="form-section-head"><div><strong>配音设置</strong><small>选择配音角色，并设定本次口播目标时长。</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>配音角色 <span class="required-star">*</span></label><div class="script-voice-inline" data-script-voice-options><button class="active" type="button" data-script-voice-option="陈子建·公版">陈子建·公版</button><button type="button" data-script-voice-option="许念·公版">许念·公版</button><button type="button" data-script-voice-option="阿乐·公版">阿乐·公版</button><button type="button" data-script-voice-option="周雨桐·公版">周雨桐·公版</button><button type="button" data-script-voice-option="方圆·公版">方圆·公版</button><button type="button" data-script-voice-option="高远·公版">高远·公版</button><button type="button" data-script-voice-option="夏语薇·公版">夏语薇·公版</button><button type="button" data-script-voice-option="陈海峰·公版">陈海峰·公版</button></div><input type="hidden" data-script-voice value="陈子建·公版"></div>
              <div class="field"><label>目标时长 <span class="required-star">*</span></label><label class="number-control script-duration-input"><input type="number" min="1" max="600" step="1" value="60" inputmode="numeric" data-script-duration aria-label="目标时长（秒）"><span>s</span></label></div>
            </div>
          </section>

          <section class="form-section" data-task-step="2">
            <div class="form-section-head"><div><strong>脚本策略</strong><small>选择素材库依赖模式、素材范围与生成模型。</small></div></div>
            <div class="section-grid">
              <div class="field">
                <label>画面比例 <span class="required-star">*</span></label>
                <select data-script-ratio>
                  <option value="9:16" selected>9:16</option>
                  <option value="16:9">16:9</option>
                </select>
                <div class="form-hint">9:16 适用于抖音/快手竖屏；16:9 适用于横屏场景。</div>
              </div>
              <div class="field full">
                <label>是否依赖素材库 <span class="required-star">*</span></label>
                <div class="choice-row" data-single="script-material-mode" data-role="script-material-mode">
                  <span class="choice-chip active" data-material-mode="depend">依赖素材库</span>
                  <span class="choice-chip" data-material-mode="free">不依赖素材库</span>
                </div>
                <div class="form-hint" data-material-mode-hint>依赖素材库：在已选素材中匹配镜头；不依赖：生成分镜与生视频提示词。</div>
              </div>

              <div class="field full" data-material-mode-panel="depend" data-depend-only>
                <label>素材选择 <span class="required-star">*</span></label>
                <button class="script-material-library-button" type="button" data-action="open-script-material-picker">＋ 从素材库选择</button>
                <div class="script-material-selection-strip" data-script-material-summary>
                  <span class="script-material-summary-empty">暂未选择素材</span>
                </div>
                <div class="material-group-error" data-material-group-error>请至少选择 1 条素材</div>
              </div>

              <div class="field">
                <label>模型 <span class="required-star">*</span></label>
                <div class="single-model-picker" data-script-model-picker>
                  <button class="single-model-trigger" type="button" data-script-model-trigger><span><small>当前最优模型</small><b data-script-model-trigger-text>GPT-5.6 Terra</b></span><i>⌃</i></button>
                  <div class="single-model-menu" data-script-model-menu></div>
                </div>
                <input type="hidden" data-script-model value="gpt-5-6-terra">
              </div>

            </div>
          </section>

          <section class="form-section" data-task-step="3" hidden>
            <div class="form-section-head"><div><strong>分镜脚本</strong><small>分镜结果将在此处展示,生成后可使用右侧对话继续修改</small></div></div>
            <div class="script-result-card" data-script-result-card>
              <div class="script-result-loading">
                <span class="spinner"></span>
                <strong>正在生成分镜脚本……</strong>
                <small>系统将根据本次配置匹配素材、生成口播与画面</small>
              </div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">用户确认层｜结构化脚本与分镜</div>
          <div class="copy-result" style="overflow:auto;">
            <table class="story-table">
              <thead><tr><th>时间</th><th>内容任务</th><th>口播 / 字幕</th><th>分镜画面描述</th><th>确认状态</th></tr></thead>
              <tbody>
                <tr><td>00–03s</td><td>停留钩子</td><td>刚换的床单，第一遍照样能吸出脏东西。</td><td>尘杯脏污结果先露出，快速切到床垫推进；大字突出“刚换也能吸出”</td><td><span class="badge green">已匹配 3 段</span></td></tr>
                <tr><td>03–08s</td><td>解释痛点</td><td>毛发和碎屑，会藏进织物深处。</td><td>床垫纤维近景 + 毛发碎屑示意；镜头保持紧凑</td><td><span class="badge green">已匹配</span></td></tr>
                <tr><td>08–16s</td><td>产品能力</td><td>轻净 Pro 边拍边吸，把深处脏东西带进尘杯。</td><td>产品工作实拍，拍打头特写、推进过程、尘杯变化三镜头</td><td><span class="badge green">已匹配 6 段</span></td></tr>
                <tr><td>16–23s</td><td>使用便利</td><td>床垫、沙发和布艺都能用，用完尘杯直接水洗。</td><td>三场景快切 + 尘杯拆卸冲洗，重点词“可水洗”高亮</td><td><span class="badge green">已匹配</span></td></tr>
                <tr><td>23–30s</td><td>收束 CTA</td><td>家里有孩子或宠物，床铺清洁把它安排上。</td><td>家庭卧室场景、产品定帧、品牌角标与行动按钮</td><td><span class="badge orange">建议补拍</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="result-note"><strong>素材可执行性：</strong>现有素材覆盖 4/5 个镜头任务（80%），满足不低于 50%的编导目标。缺失的家庭收束镜头已标记为线下补拍任务。</div>
          <div class="result-actions"><button class="soft-btn action-save">确认并保存脚本</button><button class="ghost-btn action-mix">调用智能混剪</button><button class="ghost-btn action-variant">修改指定分镜</button></div>
        `
      },
      "script-copy": {
        intro: "拆解参考视频的节奏、场景组织和镜头逻辑，再用当前产品、文案和可用素材重构新脚本，避免照搬参考画面。",
        process: "拆解参考视频 → 提取镜头任务与节奏模板 → 替换为目标产品信息 → 检查素材可执行性 → 输出新分镜。",
        placeholder: "还可以补充：保留前 3 秒节奏，产品演示必须使用我们的实拍素材……",
        request: "参考已拆解视频的镜头节奏，为轻净 Pro 除螨仪生成一条 30 秒主视频脚本。",
        version: "脚本仿写 V11",
        summary: "已保留参考视频的“证据先行 + 快速演示 + 场景扩展”镜头逻辑，并按轻净 Pro 的产品事实和现有素材重新设计分镜。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>参考脚本方法</strong><small>优先选择已完成的拆解结果，直接读取镜头和节奏结构</small></div></div>
            <div class="section-grid">
              <div class="field"><label>参考来源 *</label><select><option>拆解记录</option><option>千川素材 ID</option><option>内部视频库</option><option>上传视频</option></select></div>
              <div class="field"><label>参考视频 *</label><select><option>除螨仪爆款拆解 #A023</option><option>输入素材 ID</option></select></div>
              <div class="field full"><label>希望借鉴的元素 *（最多 2 项）</label><div class="choice-row" data-limit="2"><span class="choice-chip active">开场镜头</span><span class="choice-chip active">分镜顺序</span><span class="choice-chip">节奏变化</span><span class="choice-chip">产品展示方式</span><span class="choice-chip">转化收口</span></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>目标产品与素材</strong><small>新脚本优先使用当前产品已有素材，不复用参考视频画面</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>目标产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>目标时长 *</label><select><option>30 秒</option><option>20 秒</option><option>45 秒</option></select></div>
              <div class="field"><label>脚本数量 *</label><select><option>1 条主视频</option><option>1 主 + 3 延伸</option></select></div>
              <div class="field full"><label>素材来源 *</label><div class="choice-row" data-single="script-copy-material"><span class="choice-chip active">产品绑定素材</span><span class="choice-chip">指定产品素材</span><span class="choice-chip">临时上传素材</span></div></div>
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 已绑定素材</strong><small>已有素材优先覆盖脚本镜头；缺失镜头自动标记补拍</small></div><b>1,286</b></div>
              <div class="field full"><label>仿写边界</label><textarea>不复用原画面；不迁移参考商品参数；保留镜头方法和节奏逻辑，所有内容按目标产品及已有素材重新设计。</textarea></div>
            </div>
          </section>
        `,
        result: `
          <div class="result-section-title">参考镜头方法 → 新产品脚本映射</div>
          <div class="copy-result">
            <div class="compare-row"><strong>00–03s</strong><span>参考：先展示使用结果 → 新脚本：先展示尘杯脏污证据，匹配实拍素材 3 条</span></div>
            <div class="compare-row"><strong>03–10s</strong><span>参考：快速解释痛点 → 新脚本：床垫纤维近景 + 毛发碎屑，2–3 秒一切</span></div>
            <div class="compare-row"><strong>10–22s</strong><span>参考：连续功能演示 → 新脚本：拍打、推进、吸入、尘杯变化四段实拍</span></div>
            <div class="compare-row"><strong>22–30s</strong><span>参考：多场景收束 → 新脚本：床垫 / 沙发 / 布艺快切 + 可水洗尘杯 + CTA</span></div>
          </div>
          <div class="result-section-title">新脚本可执行性</div>
          <div class="result-grid">
            <div class="result-card"><div class="result-meta"><span class="badge green">口播覆盖</span></div><p><strong>100%</strong><br>5 个信息段均已生成对应口播与字幕重点。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge green">镜头可匹配</span></div><p><strong>9 / 10</strong><br>1 个纤维微距镜头建议补拍或由 AI 素材补充。</p></div>
            <div class="result-card"><div class="result-meta"><span class="badge orange">原创重构</span></div><p><strong>已通过</strong><br>未复用参考画面、原句、商品参数和优惠。</p></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存新脚本</button><button class="ghost-btn action-mix">调用智能混剪</button><button class="ghost-btn action-variant">生成延伸脚本</button></div>
        `
      },
      mix: {
        intro: "基于产品信息、已确认文案与已有创作素材，完成 AI 配音、镜头匹配、裁切拼接和成片质检。",
        process: "确认创作方案 → 确认文案与配音 → 确认分镜与素材 → 裁切拼接并生成成片。",
        placeholder: "还可以补充：第 3 段换成沙发清洁画面，结尾产品定帧延长 0.5 秒……",
        request: "为轻净 Pro 除螨仪使用已有创作素材生成 1 条竖版混剪视频。",
        version: "混剪引擎 V16",
        summary: "已完成 1 条 48.6 秒竖版混剪视频。文案、配音和 5 个内容段均已确认，全部画面来自已有创作素材。",
        form: `
          <div class="mix-flow-form">
            <section class="mix-step-panel" data-task-step="1">
              <article class="mix-block">
                <div class="mix-block-head"><div><strong>创作方案</strong><small>选择起点，后续步骤只确认本次结果，不会再次选择文案或脚本。</small></div></div>
                <div class="mix-plan-tabs" role="tablist">
                  <button class="active" type="button" data-mix-plan="ai"><b>AI 生成</b><small>智能匹配或指定爆款结构</small></button>
                  <button type="button" data-mix-plan="copy"><b>从已有文案开始</b><small>带入文案及关联产品</small></button>
                  <button type="button" data-mix-plan="script"><b>从已有脚本开始</b><small>带入口播、分镜及产品</small></button>
                </div>
                <div class="mix-plan-context" data-mix-plan-context></div>
              </article>
              <article class="mix-block">
                <div class="mix-block-head"><div><strong>目标产品与视频要求</strong><small data-mix-product-origin>选择产品后，系统将匹配本次设定，生成后续文案及脚本。</small></div></div>
                <div class="mix-three-col">
                  <label class="mix-field" data-mix-product-field><span data-mix-product-label>目标产品</span><select data-mix-product hidden><option value="" selected>请选择产品</option><option value="mite-pro">轻净 Pro 除螨仪</option><option value="washer-s5">净界洗地机 S5</option><option value="air-a8">轻享空气炸锅 A8</option></select><button class="mix-picker-trigger" type="button" data-mix-pick-product><span data-mix-product-picker-label>请选择产品</span><i>›</i></button><div class="mix-fact-strip" data-mix-product-facts><b>已带入产品事实</b><button type="button" data-mix-show-facts>查看</button></div></label>
                  <label class="mix-field mix-audience-block" data-mix-audience-block data-mix-audience-field>
                    <span data-mix-audience-label>目标人群</span>
                    <input type="hidden" value="" data-mix-audience>
                    <div class="mix-persona-source" role="group" aria-label="目标人群来源"><button class="active" type="button" data-mix-persona-mode="template">从模板库选择</button><button type="button" data-mix-persona-mode="manual">自行输入</button></div>
                    <div class="mix-persona-mode-panel" data-mix-persona-panel="template">
                      <div class="mix-persona-trigger" data-mix-pick-audience role="button" tabindex="0"><span class="mix-persona-placeholder" data-mix-audience-placeholder>请选择人群</span><span class="mix-persona-chips" data-mix-audience-chips hidden></span><button type="button" class="mix-persona-clear" data-persona-clear aria-label="清空选择" hidden>×</button><i class="mix-persona-arrow">›</i></div>
                    </div>
                    <div class="mix-persona-mode-panel mix-persona-manual" data-mix-persona-panel="manual" hidden>
                      <div class="mix-persona-groups" data-mix-persona-groups></div>
                      <button type="button" class="mix-persona-add-group" data-mix-add-persona-group><i>＋</i>添加人群</button>
                    </div>
                  </label>
                  <label class="mix-field mix-duration-field" data-mix-duration-field><span data-mix-duration-label>视频生成时长 <small data-mix-duration-hint hidden>已继承脚本时长，可修改</small></span><span class="mix-duration-input"><input type="number" step="1" placeholder="请输入" data-mix-target-duration><i>秒</i></span></label>
                  <label class="mix-field mix-ratio-field" data-mix-ratio-field><span>画面比例 <em class="required-star">*</em></span><select data-mix-ratio><option value="9:16" selected>9:16</option><option value="16:9">16:9</option></select></label>
                </div>
                <div class="mix-duration-presets" data-mix-duration-presets hidden></div>
                <label class="mix-requirement" data-mix-requirement-block><span>本次创作要求</span><textarea data-mix-requirement placeholder="例如：希望突出哪些卖点、使用哪些画面，或需要避免哪些表达。"></textarea></label>
              </article>
              <article class="mix-block" data-mix-material-block>
                <div class="mix-block-head mix-material-block-head"><div><div class="mix-material-title-line"><strong>创作素材</strong><span>已选 <b data-mix-selected-count>24</b> / <i data-mix-total-count>24</i></span></div><small>默认展示该产品关联素材；取消选择的素材不会参与本次混剪。</small></div><div class="mix-material-head-actions"><button type="button" data-mix-select-all>取消全选</button><button type="button" data-mix-add-material title="关联创作素材">＋ 添加素材</button></div></div>
                <div class="mix-material-toolbar" data-mix-material-toolbar>
                  <label class="mix-material-search"><span>⌕</span><input type="search" data-mix-material-search placeholder="搜索素材名称、ID 或画面标签"></label>
                  <button class="mix-material-tag-trigger" type="button" data-mix-tag-filter-toggle>标签筛选<span data-mix-tag-filter-count></span><i>⌄</i></button>
                  <select data-mix-material-filter aria-label="素材类型"><option value="all">全部类型</option><option value="video">视频</option><option value="image">图片</option></select>
                </div>
                <div class="mix-material-grid" data-mix-material-grid>
                  <article class="mix-material-card selected" data-mix-material="M-CL-101" data-mix-material-status="ok" data-mix-material-scene="结果证明"><button class="mix-material-select" type="button" aria-label="选择透明尘杯脏污特写">✓</button><div class="mix-material-cover tone-1"><span>尘杯<br>脏污特写</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览透明尘杯脏污特写">▶</button><em>00:02</em></div><strong>透明尘杯脏污特写</strong><small>结果证明 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-SC-301" data-mix-material-status="ok" data-mix-material-scene="使用过程"><button class="mix-material-select" type="button" aria-label="选择床垫表面推进清洁">✓</button><div class="mix-material-cover tone-2"><span>床垫<br>推进清洁</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览床垫表面推进清洁">▶</button><em>00:06</em></div><strong>床垫表面推进清洁</strong><small>使用过程 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-CL-102" data-mix-material-status="ok" data-mix-material-scene="功能演示"><button class="mix-material-select" type="button" aria-label="选择拍打吸尘动作特写">✓</button><div class="mix-material-cover tone-3"><span>拍打头<br>动作特写</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览拍打吸尘动作特写">▶</button><em>00:05</em></div><strong>拍打吸尘动作特写</strong><small>功能演示 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-PF-201" data-mix-material-status="ok" data-mix-material-scene="使用场景"><button class="mix-material-select" type="button" aria-label="选择卧室床垫清洁全景">✓</button><div class="mix-material-cover tone-4"><span>卧室<br>清洁全景</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览卧室床垫清洁全景">▶</button><em>00:08</em></div><strong>卧室床垫清洁全景</strong><small>使用场景 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-PF-202" data-mix-material-status="ok" data-mix-material-scene="多场景"><button class="mix-material-select" type="button" aria-label="选择沙发布艺清洁全景">✓</button><div class="mix-material-cover tone-5"><span>沙发<br>布艺清洁</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览沙发布艺清洁全景">▶</button><em>00:07</em></div><strong>沙发布艺清洁全景</strong><small>多场景 · 已分析</small></article>
                  <article class="mix-material-card selected" data-mix-material="M-AT-503" data-mix-material-status="ok" data-mix-material-scene="成片定帧"><button class="mix-material-select" type="button" aria-label="选择产品定帧与购买引导">✓</button><div class="mix-material-cover tone-6"><span>产品<br>定帧收口</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览产品定帧与购买引导">▶</button><em>00:04</em></div><strong>产品定帧与购买引导</strong><small>成片定帧 · 已分析</small></article>
                </div>
                <div class="mix-material-pagination" data-mix-material-pagination hidden></div>
                <div class="mix-empty-material" data-mix-material-empty hidden><b data-mix-material-empty-title></b><span data-mix-material-empty-detail></span></div>
              </article>
            </section>

            <section class="mix-step-panel" data-task-step="2" hidden>
              <article class="mix-block mix-copy-editor">
                <div class="mix-block-head"><div><strong>口播文案</strong></div><div class="mix-copy-head-actions"><span class="mix-structure-stages" data-mix-structure-stages hidden></span><button class="mix-regenerate-copy" type="button" data-mix-regenerate-copy>重新生成</button></div></div>
                <div class="mix-copy-textarea-wrap"><textarea data-mix-copy>刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先别听我讲参数，直接看轻净 Pro 除螨仪走完一遍后的透明尘杯。它在床垫表面推进时，拍打和吸尘同步进行，把织物深处的细小脏污带出来，清洁结果当场就能看见。卧室床垫、客厅沙发和其他布艺都能使用，用完后尘杯还可以拆下来水洗，日常整理更省事。家里有孩子或宠物，别只停留在换床单和粘表面毛发，定期把床褥深处也清理一遍。想看完整实测过程，点击商品了解更多。</textarea><span class="mix-copy-count" aria-live="polite"><b data-mix-copy-count>196</b> 字</span></div>
              </article>
              <article class="mix-block">
                <div class="mix-block-head"><div><strong>配音设置</strong><small>选择音色、试听并微调语速；修改文案后实际时长会自动重算。</small></div></div>
                <div class="mix-voice-role-field"><span>配音角色</span><div class="script-voice-inline mix-voice-inline" data-mix-voice-options></div><input type="hidden" data-mix-voice value="陈子建·公版"></div>
                <div class="mix-voice-layout">
                  <div class="mix-speed-control"><span>语速</span><button type="button" data-mix-speed-minus>−</button><input type="range" min="0.8" max="1.3" step="0.05" value="1" data-mix-speed><button type="button" data-mix-speed-plus>＋</button><b data-mix-speed-label>1.00×</b></div>
                </div>
                <div class="mix-duration-card"><span>当前配音时长</span><b data-mix-duration>59.4s</b></div>
              </article>
            </section>

            <section class="mix-step-panel" data-task-step="3" hidden>
              <div class="mix-step-actions" hidden><button class="mix-rematch-all" type="button" data-mix-rematch-all>重新匹配全部</button></div>
              <div class="mix-script-alert" data-mix-script-alert hidden></div>
              <div class="mix-script-list" data-mix-script-list></div>
            </section>

            <section class="mix-step-panel" data-task-step="4" hidden>
              <div class="mix-step-title"><div><span>STEP 4</span><h3>生成视频</h3><p>最后检查本次输入，确认后将使用已有素材完成裁切拼接。</p></div><span class="mix-ready-badge">已就绪</span></div>
              <article class="mix-block mix-generation-summary"><div><span>产品</span><b data-mix-final-product>轻净 Pro 除螨仪</b></div><div><span>成片时长</span><b data-mix-final-duration>48.6 秒</b></div><div><span>配音</span><b data-mix-final-voice>许念 · 1.00×</b></div><div><span>使用素材</span><b data-mix-final-materials>6 个</b></div><div><span>输出规格</span><b data-mix-final-spec>9:16 · 1080×1920 · 30fps</b></div></article>
              <article class="mix-block mix-checklist"><strong>生成前检查</strong><p><span>✓</span> 文案与配音已确认</p><p><span>✓</span> <i data-mix-script-count>5</i> 个脚本段落已确认</p><p><span>✓</span> 所有时间段均已匹配已有素材</p><p><span>✓</span> 未使用原声、字幕、特效或转场</p></article>
              <div class="mix-generation-host" data-mix-generation-host><div class="mix-generation-placeholder"><span>▶</span><strong>等待生成视频</strong><small>预计约 40 秒完成演示生成</small></div></div>
            </section>
          </div>
        `,
        result: `
          <div class="mix-preview">
            <div class="mix-cover">▶<br>30 秒主视频<br><small style="opacity:.8;">待人工终审</small></div>
            <div>
              <div class="mix-stats">
                <div class="mix-stat"><strong>8 / 8</strong><small>镜头任务已匹配</small></div>
                <div class="mix-stat"><strong>100%</strong><small>脚本信息点覆盖</small></div>
                <div class="mix-stat"><strong>28.6s</strong><small>成片实际时长</small></div>
                <div class="mix-stat"><strong>0 项</strong><small>高风险质检问题</small></div>
              </div>
              <div class="result-section-title">素材构成</div>
              <div class="result-meta"><span class="badge">产品实拍 62%</span><span class="badge green">历史素材 38%</span><span class="badge gray">AI 素材 0%</span></div>
              <div class="timeline-mini">
                <span class="timeline-segment" style="flex:3">钩子</span>
                <span class="timeline-segment alt" style="flex:5">痛点</span>
                <span class="timeline-segment" style="flex:9">功能演示</span>
                <span class="timeline-segment alt" style="flex:6">多场景</span>
                <span class="timeline-segment" style="flex:5">CTA</span>
              </div>
            </div>
          </div>
          <div class="result-section-title">终审重点</div>
          <div class="copy-result">
            <div class="compare-row"><strong>需要确认</strong><span>00–03s 尘杯画面冲击力；08–17s 产品演示顺序；23–28s 品牌与 CTA 表达</span></div>
            <div class="compare-row"><strong>已自动完成</strong><span>字幕逐字对齐、重点词高亮、配音降噪、BGM 闪避、品牌角标、画幅安全区和黑帧检测</span></div>
            <div class="compare-row"><strong>后续流转</strong><span>人工确认或替换指定镜头 → 输出定稿 → 自动提交千川提审 → 通过后进入推广自动化</span></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存到视频库</button><button class="ghost-btn">打开终审</button><button class="ghost-btn">替换指定镜头</button><button class="primary-btn">确认并提交提审</button></div>
        `
      }
    };

    agentConfigs.chat = {
      placeholder: "描述你的想法，或选择下方专业能力开始创作",
      intro: "用于讨论创意、梳理需求和获取下一步建议。需要生成文案、脚本或视频时，可随时切换专业 Agent。",
      process: "理解当前会话 → 结合已知产品与资产上下文 → 给出清晰的创作建议或下一步操作。",
      form: ""
    };

    const revisionResults = {
      original: {
        summary: "已结合上一版和本轮补充要求完成定向修正。未被点名的产品事实、卖点顺序和 CTA 均保持不变。",
        result: `
          <div class="copy-result">
            <div class="result-meta"><span class="badge">第 2 版</span><span class="badge orange">仅修改前 3 秒</span><span class="badge green">其他内容已锁定</span></div>
            <div class="compare-row"><strong>修改前</strong><span class="diff-old">床单看着干净，不代表真的干净。</span></div>
            <div class="compare-row"><strong>修改后</strong><span class="diff-new">刚换的床单，也能吸出一杯脏东西。</span></div>
            <div class="compare-row"><strong>保持不变</strong><span>深层清洁、拍打吸尘、可水洗尘杯、结尾行动引导</span></div>
          </div>
          <div class="result-note"><strong>修订说明：</strong>钩子由观点表达改为结果直给，口播约 2.7 秒；正文仍沿用上一版，可直接作为延伸视频替换开头。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存为新版本</button><button class="ghost-btn action-script">用修订版转脚本</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      copy: {
        summary: "已在上一轮仿写结果上继续调整，只修改用户指定的参考元素，产品事实映射与原创边界保持不变。",
        result: `
          <div class="copy-result">
            <div class="result-meta"><span class="badge">仿写 V2</span><span class="badge orange">节奏加快</span><span class="badge green">原创边界通过</span></div>
            <div class="compare-row"><strong>本轮调整</strong><span>删除解释性铺垫，前 8 秒从 3 个信息点增加为 4 个信息点</span></div>
            <div class="compare-row"><strong>继续保留</strong><span>参考素材的结果先行结构；不复用原句、品牌、参数与优惠</span></div>
            <p style="margin-top:9px;"><strong>刚换的床单，也能吸出一杯毛发碎屑。</strong>看得见的是表面，看不见的都藏在织物深处。轻净 Pro 边拍边吸，脏东西直接进尘杯，用完还能拆下水洗……</p>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存仿写 V2</button><button class="ghost-btn action-script">转为脚本</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      rewrite: {
        summary: "已继续基于原文和上一轮改写结果修正，并保留所有已锁定段落。",
        result: `
          <div class="copy-result">
            <div class="result-meta"><span class="badge">改写 V3</span><span class="badge orange">语气更硬</span><span class="badge green">正文已锁定</span></div>
            <div class="compare-row"><strong>上一版</strong><span class="diff-old">刚换的床单，第一遍照样能吸出脏东西。</span></div>
            <div class="compare-row"><strong>本轮修正</strong><span class="diff-new">别只换床单，床垫深处的毛发碎屑还在。</span></div>
            <div class="compare-row"><strong>制作影响</strong><span>仍只需替换 0–3 秒口播、字幕和开场镜头，主体成片可复用</span></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存改写 V3</button><button class="ghost-btn action-script">同步更新脚本</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      script: {
        summary: "已基于上一版结构化脚本修改指定分镜，其余时间轴、口播和机器混剪指令保持不变。",
        result: `
          <div class="copy-result" style="overflow:auto;">
            <table class="story-table">
              <thead><tr><th>时间</th><th>修改状态</th><th>修订后口播</th><th>修订后画面</th><th>影响范围</th></tr></thead>
              <tbody>
                <tr><td>00–03s</td><td><span class="badge orange">已修改</span></td><td>别只换床单，床垫深处的毛发碎屑还在。</td><td>先展示尘杯脏污，再切床垫纤维近景；大字字幕同步出现</td><td>替换开场镜头、字幕与配音</td></tr>
                <tr><td>03–30s</td><td><span class="badge green">已锁定</span></td><td>沿用上一版</td><td>产品演示、多场景、尘杯水洗与 CTA 均不变</td><td>无需重新匹配</td></tr>
              </tbody>
            </table>
          </div>
          <div class="result-note"><strong>执行层同步：</strong>已重算 0–3 秒镜头检索词、字幕时间轴和配音片段；其余素材候选不会重新计算。</div>
          <div class="result-actions"><button class="soft-btn action-save">保存脚本新版本</button><button class="ghost-btn action-mix">用修订版混剪</button><button class="ghost-btn action-variant">继续修改分镜</button></div>
        `
      },
      "script-copy": {
        summary: "已在上一版仿写脚本上继续调整镜头节奏，参考方法与目标产品映射关系仍然保留。",
        result: `
          <div class="copy-result">
            <div class="compare-row"><strong>本轮要求</strong><span>前 3 秒冲击更强，产品演示镜头保持不变</span></div>
            <div class="compare-row"><strong>修订结果</strong><span>开场由“床垫推进”改为“尘杯结果特写 → 床垫推进”，首屏结果提前 1.4 秒</span></div>
            <div class="compare-row"><strong>未改范围</strong><span>03–30 秒镜头顺序、口播、素材范围、品牌包装与 CTA</span></div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存脚本 V2</button><button class="ghost-btn action-mix">调用智能混剪</button><button class="ghost-btn action-variant">继续修正</button></div>
        `
      },
      mix: {
        summary: "已基于上一版成片执行局部修改，只重新渲染受影响的镜头、字幕与配音片段。",
        result: `
          <div class="mix-preview">
            <div class="mix-cover">▶<br>成片 V2<br><small style="opacity:.8;">局部重渲染完成</small></div>
            <div>
              <div class="mix-stats">
                <div class="mix-stat"><strong>1 / 8</strong><small>本轮替换镜头</small></div>
                <div class="mix-stat"><strong>7 / 8</strong><small>沿用上一版镜头</small></div>
                <div class="mix-stat"><strong>28.4s</strong><small>修订后时长</small></div>
                <div class="mix-stat"><strong>通过</strong><small>自动质检</small></div>
              </div>
              <div class="result-note"><strong>本轮变化：</strong>00–03 秒换为尘杯结果特写，字幕字号提升一级；产品演示、配音音色、BGM 和品牌包装不变。</div>
            </div>
          </div>
          <div class="result-actions"><button class="soft-btn action-save">保存成片 V2</button><button class="ghost-btn">对比 V1 / V2</button><button class="ghost-btn action-variant">继续修改</button><button class="primary-btn">确认并提交提审</button></div>
        `
      }
    };


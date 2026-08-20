    /* ===================== 结果详情页·交互 ===================== */
    document.getElementById("backToEntry").addEventListener("click", () => switchPage("pull-entry"));

    // 复制
    function copyText(text, label) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast(`${label}已复制`));
      } else {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); showToast(`${label}已复制`); }
        catch (e) { showToast("复制失败，请手动选择"); }
        document.body.removeChild(ta);
      }
    }
    document.getElementById("copyTranscript").addEventListener("click", () => {
      const text = [...document.querySelectorAll("#transcriptList .transcript-row")]
        .map(r => r.querySelector("span").textContent + " " + r.querySelector("div").textContent)
        .join("\n");
      copyText(text, "口播文案");
    });
    document.getElementById("copyScript").addEventListener("click", () => {
      const lines = [...document.querySelectorAll("#scriptFields .script-field")].map(f => {
        const label = f.querySelector(".label").firstChild.textContent.trim();
        const chips = [...f.querySelectorAll(".chip")].map(c => c.textContent).join("、");
        const plain = f.querySelector(".plain");
        return `- **${label}**：${chips || (plain ? plain.textContent : "—")}`;
      }).join("\n");
      copyText(lines, "脚本总结");
    });
    document.getElementById("copyScene").addEventListener("click", () => {
      const lines = [...document.querySelectorAll(".scene-group")].map(g => {
        const label = g.querySelector(".scene-label").firstChild.textContent.trim();
        return `- ${label}：${g.querySelectorAll(".scene-img").length} 张缩略图`;
      }).join("\n");
      copyText(lines, "画面总结");
    });

    // 字段 chip 联动：hover 高亮 + 点击切换 active
    document.querySelectorAll("#scriptFields .chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const text = chip.textContent;
        const matched = [...document.querySelectorAll("#shotGrid .shot-card")].filter(card =>
          card.textContent.includes(text)
        );
        matched.forEach(card => {
          card.style.outline = "2px solid #797cf4";
          card.style.outlineOffset = "2px";
        });
        setTimeout(() => matched.forEach(card => {
          card.style.outline = "";
          card.style.outlineOffset = "";
        }), 1500);
        showToast(`已在分镜中定位「${text}」`);
      });
    });

    // 画面缩略图 → 跳到对应时间
    document.querySelectorAll(".scene-strip .scene-img").forEach(img => {
      img.addEventListener("click", () => {
        const t = img.querySelector("span").textContent;
        const row = [...document.querySelectorAll("#transcriptList .transcript-row")]
          .find(r => r.dataset.time === t);
        if (row) {
          [...document.querySelectorAll("#transcriptList .transcript-row")].forEach(r => r.classList.remove("active"));
          row.classList.add("active");
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          showToast(`已定位到 ${t}`);
        } else {
          showToast(`画面时间 ${t}，无对应口播`);
        }
      });
    });

    // 口播行点击 → 联动画面 + 高亮分镜
    document.querySelectorAll("#transcriptList .transcript-row").forEach(row => {
      row.addEventListener("click", () => {
        [...document.querySelectorAll("#transcriptList .transcript-row")].forEach(r => r.classList.remove("active"));
        row.classList.add("active");
        const time = row.dataset.time;
        // 找该时间段所在分镜
        const tSec = parseInt(time.split(":")[1], 10);
        const card = [...document.querySelectorAll("#shotGrid .shot-card")].find(c => {
          const range = c.querySelector(".time-range").textContent;
          const m = range.match(/(\d+):(\d+)–(\d+):(\d+)/);
          if (!m) return false;
          const s1 = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
          const s2 = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
          return tSec >= s1 && tSec <= s2;
        });
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.style.outline = "2px solid #ff9d6c";
          card.style.outlineOffset = "2px";
          setTimeout(() => { card.style.outline = ""; card.style.outlineOffset = ""; }, 1500);
        }
      });
    });

    // 分镜 Tab 切换
    document.querySelectorAll(".storyboard-tabs .tab-mini").forEach(t => {
      t.addEventListener("click", () => {
        document.querySelectorAll(".storyboard-tabs .tab-mini").forEach(x => x.classList.toggle("active", x === t));
        const target = t.dataset.tab;
        document.querySelectorAll(".storyboard-panel").forEach(p => p.hidden = p.dataset.tabPanel !== target);
      });
    });

    // 一键下载
    document.getElementById("oneClickDownload").addEventListener("click", () => {
      const data = {
        video: "下载.mp4",
        duration: document.getElementById("resultDuration").textContent,
        time: document.getElementById("resultTime").textContent,
        transcript: [...document.querySelectorAll("#transcriptList .transcript-row")].map(r => ({
          time: r.querySelector("span").textContent, text: r.querySelector("div").textContent
        })),
        shots: [...document.querySelectorAll("#shotGrid .shot-card")].map(c => ({
          time: c.querySelector(".time-range").textContent,
          duration: c.querySelector(".duration").textContent,
          desc: c.querySelector(".desc").textContent,
          script: c.querySelector(".script-text").textContent
        }))
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "拆解结果.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("已下载 拆解结果.json");
    });

    // 下载视频
    document.getElementById("downloadVideo").addEventListener("click", e => {
      e.preventDefault();
      showToast("原视频下载已开始（演示）");
    });

    // 初始化入口页列表
    renderVideoList();

    // 演示模式：URL 加 ?demo=<key> 自动触发，方便截图/演示
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

    function filterAgents(category) {
      document.querySelectorAll("#agentGrid .agent-card").forEach(card => {
        card.hidden = category !== "all" && card.dataset.category !== category;
      });
      agentFilters.forEach(filter => {
        const active = filter.dataset.agentFilter === category;
        filter.classList.toggle("active", active);
        filter.setAttribute("aria-selected", String(active));
      });
      agentGrid.classList.toggle("is-filtered", category !== "all");
      agentGrid.scrollTo({ left: 0, behavior: "smooth" });
    }

    agentFilters.forEach(filter => filter.addEventListener("click", () => filterAgents(filter.dataset.agentFilter)));
    agentBrowser.addEventListener("wheel", event => {
      if (!event.deltaY || agentGrid.scrollWidth <= agentGrid.clientWidth) return;
      event.preventDefault();
      agentGrid.scrollBy({ left: event.deltaY, behavior: "auto" });
    }, { passive: false });

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
        core: "大吸力深层清洁，拍打吸尘同步完成",
        secondary: "透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用",
        difference: "清洁效果可视化，操作完成后尘杯清理方便",
        audiences: ["宝妈家庭", "养宠家庭"],
        psychology: ["风险规避", "理性求证"],
        facts: "已读取产品卖点、关联资产和 18 个禁用表达"
      },
      "air-a8": {
        name: "轻享空气炸锅 A8",
        core: "可视化烹饪窗口，少翻面也能掌握食物状态",
        secondary: "大容量满足家庭用餐，炸篮可拆洗",
        difference: "烹饪过程看得见，降低反复开盖造成的热量流失",
        audiences: ["宝妈家庭", "精致生活人群"],
        psychology: ["省时省力", "家庭关怀"],
        facts: "已读取产品卖点、关联资产和 15 个禁用表达"
      },
      "washer-s5": {
        name: "净界洗地机 S5",
        core: "吸拖洗一体，一次完成地面干湿垃圾清洁",
        secondary: "滚刷自清洁，减少清洁工具二次处理",
        difference: "复杂地面污渍一次推进处理，缩短家庭清洁链路",
        audiences: ["宝妈家庭", "养宠家庭", "精致生活人群"],
        psychology: ["省时省力", "理性求证"],
        facts: "已读取产品卖点、关联资产和 21 个禁用表达"
      },
      "blend-mini": {
        name: "随行榨汁杯 Mini",
        core: "便携随行，一键启动即可完成日常果蔬搅拌",
        secondary: "杯体轻巧，支持充电使用和拆洗",
        difference: "适合通勤、健身和办公室等临时饮用场景",
        audiences: ["通勤人群", "健身人群", "精致生活人群"],
        psychology: ["省时省力", "尝鲜心理"],
        facts: "已读取产品卖点、关联资产和 9 个禁用表达"
      }
    };
    const creationContext = {
      productId: "mite-pro",
      productSource: "library",
      productConfirmed: true,
      productSaved: true,
      originalFields: {},
      customPresets: []
    };

    const modelOptions = {
      text: `
        <option value="auto">自动优选（推荐）</option>
        <optgroup label="国内模型">
          <option value="doubao-seed-2-pro">豆包 Seed 2.0 Pro</option>
          <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
          <option value="qwen-3-7-max">通义千问 Qwen3.7-Max</option>
        </optgroup>
        <optgroup label="国际模型">
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
      if (type === "video-create") return "videoGeneration";
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

    function imageCreativeStepMarkup(detail = false) {
      const typeName = detail ? "商品详情图" : "商品主图";
      const sizeOptions = detail
        ? '<option>750 × 1000</option><option>750 × 750</option><option>1080 × 1440</option>'
        : '<option>1:1 · 1080×1080</option><option>3:4 · 1080×1440</option><option>9:16 · 1080×1920</option>';
      const imageTypeOptions = detail
        ? '<option>卖点详情模块</option><option>功能拆解模块</option><option>参数说明模块</option><option>场景种草模块</option>'
        : '<option>商品卡首图</option><option>卖点主图</option><option>场景主图</option><option>活动主图</option>';
      const outputTypeMarkup = detail
        ? '<div class="field full"><div class="field-label-row"><label>详情页模块</label><span class="field-hint" style="margin:0;">按上传图片用途选择，可新增自定义模块</span></div><div class="detail-module-list" data-detail-module-list><label class="detail-module-option"><input type="checkbox" checked><span>首屏海报图</span></label><label class="detail-module-option"><input type="checkbox" checked><span>核心卖点图</span></label><label class="detail-module-option"><input type="checkbox" checked><span>细节特写图</span></label><label class="detail-module-option"><input type="checkbox"><span>多角度图</span></label><label class="detail-module-option"><input type="checkbox"><span>效果对比图</span></label><label class="detail-module-option"><input type="checkbox"><span>场景使用图</span></label><label class="detail-module-option"><input type="checkbox"><span>品牌故事图</span></label><label class="detail-module-option"><input type="checkbox"><span>参数表</span></label><label class="detail-module-option"><input type="checkbox"><span>商品成分图</span></label><label class="detail-module-option"><input type="checkbox"><span>售后保障图</span></label><label class="detail-module-option"><input type="checkbox"><span>证书</span></label></div><div class="config-dual-editor detail-module-editor"><div class="config-editor-field"><label>模块名称</label><input data-detail-module-name placeholder="如：安装步骤图"></div><div class="config-editor-field"><label>模块描述</label><textarea data-detail-module-description placeholder="说明该模块需要展示的内容、信息重点和图片用途"></textarea></div><button class="soft-btn" type="button" data-add-detail-module>＋ 新增详情页模块</button></div></div>'
        : '<div class="field"><label>'+typeName+'类型</label><select>'+imageTypeOptions+'</select></div>';
      return [
        '<section class="form-section image-flow-step" data-task-step="1">',
          '<div class="form-section-head"><div><strong>创意确认</strong><small>一次确认参考图、模型、设计师、输出规格、权益和约束规则</small></div><span class="badge">步骤 1 / 5</span></div>',
          '<div class="section-grid">',
            '<div class="field full"><label>'+typeName+'参考图 *</label><input type="file" accept="image/*" multiple hidden data-image-upload-input><div class="upload-box image-upload-box" data-image-upload-trigger><div class="image-upload-empty"><span class="image-upload-icon">＋</span><strong>点击上传商品图片</strong><span>支持 JPG、PNG、WEBP，可多选；上传后可单张删除或继续添加</span></div><div class="image-upload-preview-list" data-image-upload-preview-list hidden></div></div></div>',
            '<div class="field full"><label>创意提示描述 *</label><textarea data-required data-field="imagePrompt" placeholder="描述画面构图、视觉重点、光线、色彩与希望传达的卖点">'+(detail ? '统一品牌视觉与信息层级，按阅读顺序拆解产品卖点，每张图片只表达一个核心重点。' : '淘宝高质感商品背景图，商品主体突出，预调灰玻璃一体，大吸力和活水自清洁，适合商品主图。')+'</textarea></div>',
            '<div class="field full image-generation-settings"><div class="image-module-head"><div><strong>生成设置</strong><small>配置模型参数与图片输出规格</small></div></div><div class="section-grid"><div class="field full"><label>模型参数</label><div class="model-parameter-grid"><div><label>图片模型</label><select data-image-model><option value="auto">自动优选（推荐）</option><option value="seedream-4">Seedream 4.0</option><option value="jimeng-image-3">即梦图片 3.0</option><option value="gpt-image-1">GPT Image 1</option></select></div><div><label>创意强度</label><select><option>均衡 · 0.6</option><option>保守 · 0.3</option><option>大胆 · 0.85</option></select></div><div><label>细节质量</label><select><option>高清</option><option>标准</option><option>超清</option></select></div></div></div><div class="field"><label>输出尺寸</label><select>'+sizeOptions+'</select></div><div class="field"><label>生成张数</label><select><option>4 张</option><option>6 张</option><option>8 张</option></select></div><div class="field"><label>投放平台</label><select><option>抖音</option><option>淘宝 / 天猫</option><option>京东</option><option>拼多多</option><option>小红书</option></select></div>'+(detail ? '' : '<div class="field"><label>主图类型</label><select>'+imageTypeOptions+'</select></div>')+'</div></div>',
            '<div class="field full image-advanced-toggle-row"><button class="advanced-toggle image-advanced-toggle" type="button" data-toggle-image-advanced aria-expanded="false"><span>高级设置</span><b>⌄</b></button><span>展开配置设计师、权益信息和规则约束</span></div><div class="field full image-advanced-panel" data-image-advanced-panel hidden><div class="field full"><label>设计师配置 *</label><div class="config-selector"><div class="config-choice-list" data-config-list="designer" data-single-config><button class="config-chip active" type="button">电商视觉设计师</button><button class="config-chip" type="button">生活方式摄影师</button><button class="config-chip" type="button">3D 创意设计师</button><button class="config-chip" type="button">高端品牌设计师</button></div><div class="config-dual-editor"><div class="config-editor-field"><label>标题描述</label><input data-config-input="designer" placeholder="如：日系极简设计师"></div><div class="config-editor-field"><label>内容描述</label><textarea data-config-content="designer" placeholder="描述设计风格、构图偏好、色彩及视觉表达要求"></textarea></div><button class="soft-btn" type="button" data-add-config="designer">＋ 新增设计师</button></div></div></div>',
            '<div class="field full"><div class="form-section-head" style="margin:3px 0 0;"><div><strong>权益配置与规则约束</strong><small>确定允许展示的权益与内容边界</small></div></div><div class="section-grid"><div class="field"><label>权益配置</label><div class="rules-list" data-rule-list="benefit"><div class="rule-item" data-rule-id="benefit-1" data-rule-title="7天无理由退换"><span class="rule-copy"><strong>7天无理由退换</strong></span><span class="rule-actions"></span></div><div class="rule-item" data-rule-id="benefit-2" data-rule-title="运费险"><span class="rule-copy"><strong>运费险</strong></span><span class="rule-actions"></span></div></div><div class="config-add-row" style="margin-top:8px;"><input data-rule-input="benefit" placeholder="新增权益，如：赠送替换滤网"><button class="soft-btn" type="button" data-add-rule="benefit">＋ 新增权益</button></div></div><div class="field"><label>规则约束</label><div class="rules-list" data-rule-list="constraint"><div class="rule-item" data-rule-id="constraint-1" data-rule-type="constraint" data-rule-title="品牌规范" data-rule-content="LOGO 清晰、品牌色准确，不生成竞品标识"><span class="rule-copy"><strong>品牌规范</strong><small>LOGO 清晰、品牌色准确，不生成竞品标识</small></span><span class="rule-actions"></span></div></div><div class="config-dual-editor" style="grid-template-columns:.8fr 1.2fr auto;margin-top:8px;"><div class="config-editor-field"><label>规则标题</label><input data-rule-input="constraint" placeholder="如：敏感词规则"></div><div class="config-editor-field"><label>规则描述</label><textarea data-rule-content="constraint" placeholder="说明必须遵守的内容边界"></textarea></div><button class="soft-btn" type="button" data-add-rule="constraint">＋ 新增规则</button></div></div></div></div></div>',
            (detail ? '<div class="field full detail-module-section"><div class="image-module-head"><div><strong>详情页模块</strong><small>选择需要生成的图片模块，并调整输出顺序</small></div></div>'+outputTypeMarkup+'<div class="detail-module-order-card"><div class="field-label-row"><label>已选模块顺序</label><span class="field-hint" style="margin:0;">使用上下按钮调整生成与提示词顺序</span></div><div class="detail-module-order" data-detail-module-order></div></div></div>' : ''),
          '</div>',
        '</section>'
      ].join("");
    }

    function imageProductInfoStepMarkup(detail = false) {
      return [
        '<section class="form-section original-step-panel image-flow-step" data-task-step="1">',
          '<div class="original-step-title"><div><h2>产品信息</h2><p>选择产品来源，并确认本次'+(detail ? '详情图' : '主图')+'使用的产品事实、卖点和目标人群。</p></div><div class="original-header-controls"><div class="source-switch" aria-label="产品信息来源"><button class="active" type="button" data-product-source="library">产品库</button><button type="button" data-product-source="link">商品链接</button><button type="button" data-product-source="manual">手工输入</button></div><div class="header-product-picker" data-product-source-panel="library"><select aria-label="选择产品" data-product-select data-required>'+productOptions+'</select></div><button class="advanced-toggle" type="button" data-action="toggle-original-advanced" aria-expanded="false">展开高级设置</button><span class="badge">步骤 1 / 5</span></div></div>',
          '<div class="product-source-inline"><div data-product-source-panel="link" hidden><div class="original-field full"><label>商品链接<span class="required-star">*</span></label><div class="link-recognizer"><input data-product-link placeholder="粘贴抖店商品链接"><button type="button" data-action="recognize-product">解析商品</button></div><div class="inline-feedback" data-recognition-feedback hidden></div></div></div><div data-product-source-panel="manual" hidden></div></div>',
          '<div class="original-group"><div class="original-group-title"><strong>基础信息</strong><span>确定本次生图对象</span></div><div class="original-group-fields"><div class="original-field full"><label>产品名称<span class="required-star">*</span></label><input data-manual-product-name data-original-product-name data-required value="轻净 Pro 除螨仪"></div><div class="original-field"><label>品牌<span class="required-star">*</span></label><input list="imageBrandOptions" data-original-brand data-required value="轻净" placeholder="输入或搜索品牌"><datalist id="imageBrandOptions"><option value="轻净"><option value="净界"><option value="随行"><option value="其他品牌"></datalist></div><div class="original-field"><label>类目<span class="required-star">*</span></label><input list="imageCategoryOptions" data-original-category data-required value="清洁电器" placeholder="输入或搜索类目"><datalist id="imageCategoryOptions"><option value="清洁电器"><option value="厨房电器"><option value="个护电器"><option value="生活电器"></datalist></div></div></div>',
          '<div class="original-group"><div class="original-group-title"><strong>卖点与信任体系</strong><span>规定图片能展示什么、凭什么可信</span></div><div class="original-group-fields">',
            '<div class="original-field full"><div class="original-field-head"><label>核心卖点<span class="required-star">*</span></label><button class="ai-refresh" type="button" data-ai-suggest="core">AI 换一组</button></div><div class="point-editor" data-point-editor="core" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="大吸力深层清洁，拍打吸尘同步完成"><span class="point-actions"><button type="button" data-point-action="up">↑</button><button type="button" data-point-action="down">↓</button><button type="button" data-point-action="remove">×</button></span></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="core" data-required hidden>大吸力深层清洁，拍打吸尘同步完成</textarea></div></div>',
            '<div class="original-field full advanced-field" hidden><div class="original-field-head"><label>次要卖点（最多 3 个）</label><button class="ai-refresh" type="button" data-ai-suggest="secondary">AI 换一组</button></div><div class="point-editor" data-point-editor="secondary" data-limit="3"><div class="point-row"><span class="point-index">●</span><input data-point-value value="透明尘杯可拆卸水洗"></div><div class="point-row"><span class="point-index">●</span><input data-point-value value="床垫、沙发和布艺均可使用"></div><button class="point-add" type="button" data-point-action="add">＋ 添加卖点</button><textarea data-field="secondary" hidden>透明尘杯可拆卸水洗；床垫、沙发和布艺均可使用</textarea></div></div>',
            '<div class="original-field advanced-field" hidden><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div><div class="original-field"><label>营销场景<span class="required-star">*</span></label><div class="choice-row original-choices" data-single="marketing-scene" data-role="marketing-scene"><span class="choice-chip active">商品卡投放</span><span class="choice-chip">图文推广</span><span class="choice-chip">商城搜索</span><span class="choice-chip">活动会场</span></div></div><div class="original-field full"><label>营销策略</label><textarea data-field="marketing" placeholder="填写已审核的价格、优惠、赠品或活动信息；没有可留空">暑期活动，到手赠送 3 个替换滤网</textarea></div>',
            '<div class="original-field full advanced-field" hidden><div class="original-field-head"><label>信任背书</label><button class="ai-refresh" type="button" data-ai-suggest="trust">AI 换一组</button></div><div class="point-editor" data-point-editor="trust" data-limit="5"><div class="point-row"><span class="point-index">●</span><input data-point-value value="整机质保 1 年，产品参数与包装清单可核验"></div><button class="point-add" type="button" data-point-action="add">＋ 添加背书</button><textarea data-field="trust" hidden>整机质保 1 年，产品参数与包装清单可核验</textarea></div></div>',
            '<div class="original-field full"><label>产品图片与关联素材</label><div class="upload-box"><strong>从产品库读取产品图 · 可补充上传</strong><span>商品主体、品牌外观与详情素材会作为生成约束</span></div><span class="field-hint" data-product-fact-hint>已读取产品卖点、关联资产和禁用表达</span></div>',
          '</div></div>',
          '<div class="original-group"><div class="original-group-title"><strong>人群与表达策略</strong><span>确定图片对谁表达、从什么问题切入</span></div><div class="original-group-fields"><div class="original-field full"><label>核心目标人群<span class="required-star">*</span></label><div class="audience-selector"><div class="audience-selector-row"><span>抖音八大人群</span><div class="choice-row original-choices" data-audience-box><button class="original-audience-chip audience-chip active" type="button">精致妈妈</button><button class="original-audience-chip audience-chip" type="button">新锐白领</button><button class="original-audience-chip audience-chip active" type="button">资深中产</button><button class="original-audience-chip audience-chip" type="button">Z世代</button><button class="original-audience-chip audience-chip" type="button">小镇青年</button><button class="original-audience-chip audience-chip" type="button">小镇中老年</button><button class="original-audience-chip audience-chip" type="button">都市蓝领</button><button class="original-audience-chip audience-chip" type="button">都市银发</button></div></div><div class="audience-selector-row"><span>性别</span><div class="choice-row original-choices" data-single="gender" data-role="gender"><span class="choice-chip active">不限</span><span class="choice-chip">女性</span><span class="choice-chip">男性</span></div></div><div class="audience-selector-row"><span>年龄</span><div class="choice-row original-choices" data-single="age" data-role="age"><span class="choice-chip">18–23</span><span class="choice-chip active">24–30</span><span class="choice-chip">31–40</span><span class="choice-chip">41–50</span><span class="choice-chip">50+</span><span class="choice-chip" data-custom-age-trigger>自定义</span><span class="age-custom" data-custom-age hidden><input type="number" min="18" max="80" value="25" data-age-min><span>至</span><input type="number" min="18" max="80" value="35" data-age-max></span></div></div></div></div><div class="original-field full advanced-field" hidden><div class="original-field-head"><label>人群核心痛点</label><button class="ai-refresh" type="button" data-ai-suggest="pain">AI 换一组</button></div><textarea data-field="pain">孩子后背红疹反复，床褥表面看起来干净但深层仍藏有灰尘和毛发</textarea></div><div class="original-field full advanced-field" hidden><div class="original-field-head"><label>使用场景</label><button class="ai-refresh" type="button" data-ai-suggest="scene">AI 换一组</button></div><textarea data-field="scenes">宝宝家庭的床垫日常清洁\n养宠家庭的沙发布艺清洁</textarea></div></div></div>',
        '</section>'
      ].join("");
    }

    function imageGenerationSettingsStepMarkup(detail = false) {
      const sizeOptions = detail
        ? '<option>750 × 1000</option><option>750 × 750</option><option>1080 × 1440</option>'
        : '<option>1:1 · 1080×1080</option><option>3:4 · 1080×1440</option><option>9:16 · 1080×1920</option>';
      const typeOptions = '<option>商品首图</option><option>卖点主图</option><option>场景主图</option><option>竞品对比图</option><option>售后保障图</option>';
      const detailModules = '';
      return '<section class="form-section image-flow-step" data-task-step="4"><div class="form-section-head"><div><strong>生图设置</strong><small>提示词确认后，配置模型与图片输出规格</small></div><span class="badge">步骤 4 / 5</span></div><div class="section-grid"><div class="field full"><label>模型参数</label><div class="model-parameter-grid"><div><label>图片模型</label><select data-image-model><option value="auto">自动优选（推荐）</option><option value="seedream-4">Seedream 4.0</option><option value="jimeng-image-3">即梦图片 3.0</option><option value="gpt-image-1">GPT Image 1</option></select></div><div><label>创意强度</label><select><option>均衡 · 0.6</option><option>保守 · 0.3</option><option>大胆 · 0.85</option></select></div><div><label>细节质量</label><select><option>高清</option><option>标准</option><option>超清</option></select></div></div></div><div class="field"><label>输出尺寸</label><select>'+sizeOptions+'</select></div><div class="field"><label>生成张数</label><select><option>1 张</option><option>2 张</option><option>4 张</option><option>6 张</option><option>8 张</option></select></div><div class="field"><label>投放平台</label><select><option>抖音</option><option>淘宝 / 天猫</option><option>京东</option><option>拼多多</option><option>小红书</option></select></div>'+(detail ? '' : '<div class="field"><label>主图类型</label><select>'+typeOptions+'</select></div>')+detailModules+'</div></section>';
    }

    function imageCompetitorStepMarkup(detail = false) {
      const modeOptions = function(name, checked) {
        return '<div class="competitor-mode-options"><label><input type="radio" name="'+name+'" value="reference" '+(checked === "reference" ? "checked" : "")+'>参考</label><label><input type="radio" name="'+name+'" value="replicate" '+(checked === "replicate" ? "checked" : "")+'>复刻</label></div>';
      };
      return [
        '<section class="form-section image-flow-step" data-task-step="2">',
          '<div class="form-section-head"><div><strong>竞品分析</strong><small>可多选竞品；人群、卖点、场景和反推提示词支持二次编辑</small></div><span class="badge">步骤 2 / 5</span></div>',
          '<div class="competitor-toolbar"><input data-competitor-link placeholder="粘贴竞品商品链接"><button class="soft-btn" type="button" data-add-competitor>＋ 分析并加入</button></div>',
          '<div class="competitor-table-shell image-competitor-table-shell"><table class="competitor-library-table image-competitor-table"><thead><tr><th>选择</th><th>产品名称</th><th>产品素材</th><th>商品链接</th><th>平台</th><th>销量</th><th>人群</th><th>核心卖点</th><th>场景</th><th>一级类目</th><th>使用类型</th><th>操作</th></tr></thead><tbody data-competitor-body><tr><td><input class="competitor-select" type="checkbox" checked aria-label="选择追觅除螨仪 S20"></td><td class="competitor-product-cell"><strong>追觅除螨仪 S20</strong><small>竞品库 · 10分钟前更新</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-flow-competitor>主图</button><button class="competitor-thumb detail" type="button" data-preview-flow-competitor>详情</button></div></td><td><a class="competitor-source-link" href="https://www.douyin.com/" target="_blank" rel="noopener">douyin.com/product/s20</a></td><td><span class="competitor-platform">抖音</span></td><td><strong>3.6万+</strong></td><td class="competitor-cell-copy">精致妈妈、养宠家庭</td><td class="competitor-cell-copy">高频拍打；紫外线辅助；尘杯可视</td><td class="competitor-cell-copy">床褥、沙发、宠物区</td><td class="competitor-category-path">清洁电器</td><td>'+modeOptions('competitor-mode-1','reference')+'</td><td><div class="competitor-actions image-competitor-actions"><button type="button" data-preview-flow-competitor>预览</button><button type="button" data-download-flow-competitor>下载</button></div></td></tr><tr><td><input class="competitor-select" type="checkbox" checked aria-label="选择莱克吉米除螨仪 B703"></td><td class="competitor-product-cell"><strong>莱克吉米除螨仪 B703</strong><small>链接解析 · 昨天更新</small></td><td><div class="competitor-materials"><button class="competitor-thumb" type="button" data-preview-flow-competitor>主图</button><button class="competitor-thumb detail" type="button" data-preview-flow-competitor>详情</button></div></td><td><a class="competitor-source-link" href="https://www.jd.com/" target="_blank" rel="noopener">jd.com/item/b703</a></td><td><span class="competitor-platform jd">京东</span></td><td><strong>2.1万+</strong></td><td class="competitor-cell-copy">都市中产、精致妈妈</td><td class="competitor-cell-copy">强拍打；热风除湿；低噪设计</td><td class="competitor-cell-copy">卧室、儿童房、沙发</td><td class="competitor-category-path">清洁电器</td><td>'+modeOptions('competitor-mode-2','replicate')+'</td><td><div class="competitor-actions image-competitor-actions"><button type="button" data-preview-flow-competitor>预览</button><button type="button" data-download-flow-competitor>下载</button></div></td></tr></tbody></table></div>',
        '</section>'
      ].join("");
    }

    function imagePromptStepMarkup(detail = false) {
      const values = detail
        ? ['轻净 Pro 除螨仪，白色机身，透明预调灰尘杯，品牌与产品外观保持一致。','仅展示已审核权益：运费险、7天无理由退换、赠送替换滤网。','精致妈妈，关注床褥深层清洁、使用便利和清洁结果。','统一柔和自然光与品牌配色，模块之间视觉连续。','按深层清洁、拍打吸尘、透明尘杯、适用场景依次拆解。','一个模块只讲一个重点，先给结果证据，再解释功能原理。','禁止商品变形、品牌错字、乱码、虚构参数、夸大功效、未审核价格。']
        : ['轻净 Pro 除螨仪，白色机身与透明尘杯，商品外观、结构和品牌信息准确。','产品占比：主体占画面 45%–60%\n构图风格：电商主图居中构图，保留平台安全留白','主色调：品牌蓝白\n辅助色：暖米色\n色彩对比：清爽高对比\n色彩情绪：洁净、可信','大标题：强劲清洁，一遍搞定\n小标题：大吸力深层清洁，结果清晰可见','仅使用已审核活动信息，不虚构价格、折扣或赠品。','突出深层清洁、拍吸同步和透明尘杯结果可视化。','文字位置：左上安全区\n文字占比：不超过画面 25%','场景类型：真实卧室床褥清洁\n场景颜色：柔和自然光\n场景特点：整洁、生活化\n使用场景：床垫、沙发、毛绒玩具','LOGO清晰完整，使用标准品牌色，不变形、不遮挡。','仅展示已审核权益，禁止未经证实的功效与承诺。','禁止产品变形、多余部件、品牌错字、乱码、错误透视、主体遮挡和竞品标识。','遵循平台安全区、图片尺寸与合规要求；不得使用未经确认的参数、价格、功效和承诺。'];
      const labels = detail ? ['产品基本信息','权益信息','目标人群','场景','核心卖点','差异化卖点','反向提示词'] : ['基础描述','构图方式','色调描述','标题文字','促销文案','卖点文案','文字设置','场景描述','LOGO规则','权益规则','反向提示词','其他限制'];
      const templateToolbar = '<div class="prompt-confirm-toolbar"><div><strong>提示词内容</strong><small>可选择模板后继续新增、修改参数</small></div><button class="soft-btn" type="button" data-get-prompt-library>选择模板</button></div>';
      const detailCreator = detail ? '<div class="detail-prompt-create"><div><strong>新增详情页模块</strong><small>填写模块名称、模板文案和模块提示词</small></div><div class="detail-prompt-create-fields"><input data-new-detail-prompt-name placeholder="模块名称"><textarea data-new-detail-prompt-copy placeholder="模板文案"></textarea><textarea data-new-detail-prompt-visual placeholder="模块提示词"></textarea><button class="soft-btn" type="button" data-add-detail-prompt-module>＋ 新增模块</button></div></div>' : '';
      const mainItems = labels.map(function(label,index){ const lines=String(values[index] || '').split(/\n+/).filter(Boolean); const params=lines.length ? lines.map(function(line){ const parts=line.split(/[：:]/); return {name:parts.length > 1 ? parts.shift().trim() : '提示词参数',value:parts.length ? parts.join('：').trim() : line}; }) : [{name:'提示词参数',value:''}]; return '<div class="prompt-confirm-item prompt-structured-field" data-prompt-step-module="'+label+'"><label><span>'+(index+1)+'</span>'+label+' <button type="button" data-prompt-optimize>AI优化</button></label><div class="prompt-param-list">'+params.map(function(param,paramIndex){ return '<div class="prompt-param-row" data-prompt-step-param-row><input data-prompt-step-param-name value="'+escapeHtml(param.name)+'" placeholder="参数名称"><textarea '+(paramIndex===0?'data-required ':'')+'data-prompt-step-param-value placeholder="提示词描述">'+escapeHtml(param.value)+'</textarea><button class="prompt-param-remove" type="button" data-remove-prompt-step-param>×</button></div>'; }).join('')+'</div><button class="prompt-param-add" type="button" data-add-prompt-step-param>＋ 新增提示词参数</button></div>'; }).join('');
      const totalPrompt = detail ? '' : '<div class="prompt-confirm-item prompt-total-item"><label>总版提示词 <small>自动整合以上所有结构化模块，不允许删除</small><button type="button" data-total-prompt-optimize>AI优化</button></label><textarea data-total-prompt readonly></textarea></div>';
      return '<section class="form-section image-flow-step" data-task-step="3"><div class="form-section-head"><div><strong>提示词确认</strong><small>确认图片生成提示词；每项均可编辑或单独 AI 优化</small></div><span class="badge">步骤 3 / 5</span></div>'+templateToolbar+'<div class="prompt-confirm-list">'+mainItems+'</div>'+detailCreator+totalPrompt+'</section>';
    }

    const agentConfigs = {
      "image-main": {
        intro: "上传商品参考图，确认创意描述，并由设计师按场景、人群、平台和约束生成可投放主图。",
        process: "创意确认（含模型、权益和约束） → 产品信息 → 竞品分析 → 提示词确认 → 图片生成。",
        placeholder: "还可以补充：保留白色产品主体，面向都市 GenZ，画面更有夏日感；权益只展示已审核内容……",
        request: "为轻净 Pro 除螨仪生成 4 张商品主图，突出深层清洁和可水洗尘杯，适配抖音商品卡。",
        version: "商品生图 V1", summary: "已由商品生图设计师生成 4 张主图方案，产品主体、场景、人群和权益规则均已应用。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>创意确认</strong><small>上传参考图片，并一次确认模型、设计师、场景、人群、权益和约束</small></div><span class="badge">步骤 1 / 5</span></div>
            <div class="section-grid">
              <div class="field full"><label>商品参考图 *</label><input type="file" accept="image/*" multiple hidden data-image-upload-input><div class="upload-box image-upload-box" data-image-upload-trigger><span class="image-upload-icon">＋</span><strong>点击上传商品图片</strong><span>支持 JPG、PNG、WEBP，可多选；用于锁定商品主体与外观</span></div></div>
              <div class="field full"><label>创意提示描述 *</label><textarea data-required data-field="imagePrompt" placeholder="描述画面构图、视觉重点、光线、色彩与希望传达的卖点">淘宝高质感商品背景图，商品主体突出，预调灰玻璃一体，大吸力和活水自清洁，适合商品主图。</textarea><span class="field-hint">可直接修改设计师建议，生成时将同时遵循下方权益与约束规则。</span></div>
              <div class="field full"><label>模型参数</label><div class="model-parameter-grid"><div><label>图片模型</label><select data-image-model><option value="auto">自动优选（推荐）</option><option value="seedream-4">Seedream 4.0</option><option value="jimeng-image-3">即梦图片 3.0</option><option value="gpt-image-1">GPT Image 1</option></select></div><div><label>创意强度</label><select><option>均衡 · 0.6</option><option>保守 · 0.3</option><option>大胆 · 0.85</option></select></div><div><label>细节质量</label><select><option>高清</option><option>标准</option><option>超清</option></select></div></div></div>
              <div class="field full"><label>设计师配置 *</label><div class="config-selector"><div class="config-choice-list" data-config-list="designer" data-single-config><button class="config-chip active" type="button">电商视觉设计师</button><button class="config-chip" type="button">生活方式摄影师</button><button class="config-chip" type="button">3D 创意设计师</button><button class="config-chip" type="button">高端品牌设计师</button></div><div class="config-dual-editor"><div class="config-editor-field"><label>标题描述</label><input data-config-input="designer" placeholder="如：日系极简设计师"></div><div class="config-editor-field"><label>内容描述</label><textarea data-config-content="designer" placeholder="描述设计风格、构图偏好、色彩及视觉表达要求"></textarea></div><button class="soft-btn" type="button" data-add-config="designer">＋ 新增设计师</button></div></div></div>
              <div class="field full"><label>场景配置 *</label><div class="config-selector"><div class="config-choice-list" data-config-list="scene" data-single-config><button class="config-chip active" type="button">电商棚拍</button><button class="config-chip" type="button">家庭客厅</button><button class="config-chip" type="button">卧室清洁</button><button class="config-chip" type="button">极简台面</button><button class="config-chip" type="button">功能特写</button></div><div class="config-dual-editor"><div class="config-editor-field"><label>标题描述</label><input data-config-input="scene" placeholder="如：夏日阳光房"></div><div class="config-editor-field"><label>内容描述</label><textarea data-config-content="scene" placeholder="描述空间、光线、道具、氛围及商品呈现方式"></textarea></div><button class="soft-btn" type="button" data-add-config="scene">＋ 新增场景</button></div></div></div>
              <div class="field full"><div class="field-label-row"><label>目标人群 *</label><span class="field-hint" style="margin:0;">八大人群单选，可新增自定义人群</span></div><div class="audience-reference" data-config-list="audience" data-single-audience><button class="audience-option active" type="button"><span><strong>小镇青年</strong><small>低线城市青年消费人群</small></span></button><button class="audience-option" type="button"><span><strong>都市 GenZ</strong><small>18–24 岁都市年轻人</small></span></button><button class="audience-option" type="button"><span><strong>精致妈妈</strong><small>一二线育儿家庭</small></span></button><button class="audience-option" type="button"><span><strong>都市白领 / 新锐白领</strong><small>职场效率与品质人群</small></span></button><button class="audience-option" type="button"><span><strong>资深中产 / 都市中产</strong><small>品质升级与理性决策人群</small></span></button><button class="audience-option" type="button"><span><strong>都市蓝领</strong><small>餐饮、运输与服务业人群</small></span></button><button class="audience-option" type="button"><span><strong>都市银发</strong><small>50 岁以上都市熟龄人群</small></span></button><button class="audience-option" type="button"><span><strong>小镇中老年</strong><small>低线城市熟龄人群</small></span></button></div><div class="config-add-row" style="margin-top:9px;"><input data-config-input="audience" placeholder="新增自定义人群，如：新婚小家庭"><button class="soft-btn" type="button" data-add-config="audience">＋ 新增人群</button></div></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>权益与约束规则</strong><small>确定可展示的信息边界与本次输出规格</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>权益配置</label><div class="rules-list" data-rule-list="benefit"><div class="rule-item"><span class="rule-copy"><strong>暑期活动</strong><small>到手赠送 3 个替换滤网</small></span></div><div class="rule-item"><span class="rule-copy"><strong>无忧退换</strong><small>支持 7 天无理由退换（以平台审核为准）</small></span></div></div><div class="config-add-row" style="margin-top:8px;"><input data-rule-input="benefit" placeholder="新增自定义权益，如：会员下单赠收纳袋"><button class="soft-btn" type="button" data-add-rule="benefit">＋ 新增权益</button></div><span class="field-hint">系统权益为只读；自定义新增权益可随时删除。</span></div>
              <div class="field full"><label>规则约束</label><div class="rules-list" data-rule-list="constraint"><div class="rule-item"><span class="rule-copy"><strong>商品一致性规则</strong><small>保持商品结构、颜色、按钮和品牌标识一致</small></span></div><div class="rule-item"><span class="rule-copy"><strong>合规表达规则</strong><small>不生成未审核价格、夸大功效、虚假对比或乱码文字</small></span></div></div><div class="config-dual-editor" style="margin-top:8px;"><div class="config-editor-field"><label>规则名称</label><input data-rule-input="constraint" placeholder="如：竞品规避规则"></div><div class="config-editor-field"><label>规则描述</label><textarea data-rule-content="constraint" placeholder="描述需要遵循或禁止出现的具体内容"></textarea></div><button class="soft-btn" type="button" data-add-rule="constraint">＋ 新增规则</button></div><span class="field-hint">自定义新增规则可再次编辑和删除。</span></div>
              <div class="field"><label>图片尺寸 *</label><select><option>1:1 · 1080 × 1080</option><option>3:4 · 1080 × 1440</option><option>4:5 · 1080 × 1350</option><option>9:16 · 1080 × 1920</option></select></div>
              <div class="field"><label>生成张数 *</label><select data-image-count><option>4 张</option><option>1 张</option><option>2 张</option><option>6 张</option><option>8 张</option></select></div>
              <div class="field full"><label>投放平台 *</label><div class="config-choice-list" data-config-list="platform"><button class="config-chip active" type="button">抖音</button><button class="config-chip" type="button">淘宝 / 天猫</button><button class="config-chip" type="button">京东</button><button class="config-chip" type="button">小红书</button><button class="config-chip" type="button">拼多多</button><button class="config-chip" type="button">微信视频号</button></div></div>
              <div class="field"><label>主图类型 *</label><select><option>白底商品主图</option><option>场景化主图</option><option>卖点功能主图</option><option>活动权益主图</option><option>人群定向主图</option></select></div>
              <div class="field"><label>文字策略</label><select><option>自动排版核心卖点</option><option>仅生成无字底图</option><option>品牌标题 + 单卖点</option></select></div>
              <div class="section-callout full"><strong>生成校验：</strong>设计师将逐张检查商品一致性、权益有效性、平台规范和文字可读性；不合规图片不会进入结果。</div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>产品信息</strong><small>确认本次生图使用的产品事实、规格和核心卖点</small></div><span class="badge">步骤 2 / 5</span></div>
            <div class="image-flow-tabs" data-image-product-source><button class="image-flow-tab active" type="button" data-flow-tab="library">产品库</button><button class="image-flow-tab" type="button" data-flow-tab="link">商品链接</button><button class="image-flow-tab" type="button" data-flow-tab="manual">手动输入</button></div>
            <div class="section-grid">
              <div class="field"><label>产品名称 *</label><input data-required data-image-product-name value="轻净 Pro 除螨仪"></div>
              <div class="field"><label>类目 *</label><div class="flow-inline-control"><select><option>清洁电器 / 除螨仪</option><option>生活电器 / 吸尘器</option></select><button class="soft-btn" type="button">＋</button></div></div>
              <div class="field"><label>品牌</label><div class="flow-inline-control"><select><option>轻净</option><option>自有品牌</option></select><button class="soft-btn" type="button">＋</button></div></div>
              <div class="field"><label>价格</label><input value="399 - 499 元"></div>
              <div class="field"><label>产品材质 / 成分</label><input value="ABS 工程塑料 + 不锈钢滤网"></div>
              <div class="field"><label>产品规格</label><input value="12kPa；450W；白色"></div>
              <div class="field full"><div class="field-label-row"><label>核心产品卖点 *</label><button class="text-action" type="button" data-image-product-polish>AI 完善</button></div><textarea data-required data-image-product-selling>大吸力深层清洁；拍打吸尘同步完成；透明尘杯可拆卸水洗；适用于床垫、沙发和布艺。</textarea></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>竞品分析</strong><small>添加竞品链接，提取可参考方法与需要规避的同质化表达</small></div><span class="badge">步骤 3 / 5</span></div>
            <div class="section-callout" style="margin-bottom:10px;"><strong>分析规则：</strong>只参考竞品的构图、场景和信息组织方式，不复制品牌、商品外观、参数或未经证实的权益。</div>
            <div class="competitor-toolbar"><input data-competitor-link placeholder="粘贴抖音、淘宝、京东或小红书竞品链接"><button class="soft-btn" type="button" data-add-competitor>分析竞品</button></div>
            <div class="competitor-table-wrap"><table class="competitor-table"><thead><tr><th>参考</th><th>竞品名称</th><th>主图策略</th><th>销量</th><th>竞品人群</th><th>竞品场景</th><th>差异化卖点</th><th>操作</th></tr></thead><tbody data-competitor-body><tr><td><input type="radio" name="competitor-reference" checked></td><td><span class="competitor-name">深层清洁主图方案</span><span class="competitor-link">douyin.example/product/2186</span></td><td><span class="competitor-tag">结果前置</span></td><td>3.6万+</td><td>精致妈妈</td><td>卧室床褥</td><td>清洁结果可视化</td><td><button class="text-action" type="button" data-remove-competitor>删除</button></td></tr><tr><td><input type="radio" name="competitor-reference"></td><td><span class="competitor-name">功能拆解主图方案</span><span class="competitor-link">tmall.example/item/9031</span></td><td><span class="competitor-tag">功能分层</span></td><td>1.8万+</td><td>都市中产</td><td>极简棚拍</td><td>拍吸一体说明</td><td><button class="text-action" type="button" data-remove-competitor>删除</button></td></tr></tbody></table></div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>提示词确认</strong><small>确认图片生成提示词；每项均可修改或单独 AI 优化</small></div><span class="badge">步骤 4 / 5</span></div>
            <div class="prompt-confirm-list">
              <div class="prompt-confirm-item"><label>产品基本信息 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>轻净 Pro 除螨仪，白色机身，透明尘杯，保持品牌标识、按钮、结构和比例准确。</textarea></div>
              <div class="prompt-confirm-item"><label>权益信息 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>展示已审核权益：暑期活动赠送替换滤网；退换说明以平台规则为准，不展示未经确认的价格。</textarea></div>
              <div class="prompt-confirm-item"><label>目标人群 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>面向小镇青年，强调看得懂的清洁结果、日常实用性和易操作体验。</textarea></div>
              <div class="prompt-confirm-item"><label>场景 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>真实卧室床褥清洁场景，柔和自然光，环境整洁，商品主体清晰居中。</textarea></div>
              <div class="prompt-confirm-item"><label>核心卖点 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>大吸力深层清洁，拍打吸尘同步完成，透明尘杯让清洁结果可视化。</textarea></div>
              <div class="prompt-confirm-item"><label>差异化卖点 <button type="button" data-prompt-optimize>AI优化</button></label><textarea>用尘杯结果证据突出深层清洁；与普通表面清扫形成使用价值差异，不做虚假功效对比。</textarea></div>
              <div class="prompt-confirm-item"><label><span><input type="checkbox" checked> 反向提示词</span><button type="button" data-prompt-optimize>AI优化</button></label><textarea>禁止商品变形、多余按钮、品牌错字、乱码、夸大功效、未审核价格、竞品标识、低清晰度和主体遮挡。</textarea></div>
            </div>
            <div class="prompt-template-row"><span class="field-hint">提示词将按产品事实、权益和竞品差异自动合并。</span><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><button class="soft-btn" type="button" data-get-prompt-library>选择提示词模板</button><button class="text-action" type="button" data-save-prompt-template>保存为提示词模板</button></div></div>
          </section>`,
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
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="120" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 30 秒</b></div></div>
              <div class="field"><label>生成数量 *</label><select><option>3 条</option><option>5 条</option></select></div>
              <div class="field full"><label>本轮主测变量 *</label><div class="choice-row" data-single="variable"><span class="choice-chip active">前 3 秒钩子</span><span class="choice-chip">卖点顺序</span><span class="choice-chip">人群切口</span><span class="choice-chip">CTA</span></div></div>
              <details class="advanced-block">
                <summary>高级设置：卖点、人群、用户心理、CTA与禁用表达</summary>
                <div class="section-grid advanced-content">
                  <div class="field"><label>核心次要卖点</label><textarea data-field="secondary">透明尘杯可拆卸水洗，床垫、沙发和布艺均可使用</textarea></div>
                  <div class="field"><label>差异化卖点</label><textarea data-field="difference">清洁效果可视化，操作完成后尘杯清理方便</textarea></div>
                  <div class="field full"><label>营销利益点</label><textarea data-field="marketing">暑期活动，到手赠送 3 个替换滤网</textarea><div class="quick-tags" data-marketing-tags><button class="quick-tag" type="button" data-marketing-value="限时折扣">限时折扣</button><button class="quick-tag" type="button" data-marketing-value="直播专享">直播专享</button><button class="quick-tag" type="button" data-marketing-value="今日特惠">今日特惠</button><button class="quick-tag active" type="button" data-marketing-value="赠送3个替换滤网">赠品</button><button class="quick-tag" type="button" data-marketing-value="拍一发三">拍一发三</button></div><span class="field-hint">营销信息只用于本次创作，不写入长期产品事实</span></div>
                  <div class="field full"><div class="field-label-row"><label>目标人群</label><button class="text-action" type="button" data-action="recommend-audience">AI 推荐人群</button></div><div class="audience-box" data-audience-box><button class="audience-chip active" type="button">宝妈家庭</button><button class="audience-chip active" type="button">养宠家庭</button><button class="audience-chip" type="button">易敏人群</button><button class="audience-chip" type="button">租房人群</button><button class="audience-chip" type="button">精致生活人群</button></div><div class="inline-control" style="margin-top:8px;"><input data-custom-audience placeholder="输入自定义人群"><button class="soft-btn" type="button" data-action="add-audience">添加人群</button></div></div>
                  <div class="field"><label>主要用户心理</label><select data-field="primaryPsychology"><option value="风险规避">AI 推荐：风险规避</option><option>损失厌恶</option><option>省时省力</option><option>理性求证</option><option>性价比心理</option><option>从众认同</option><option>错失恐惧</option><option>好奇缺口</option><option>身份向往</option><option>尝鲜心理</option><option>家庭关怀</option><option>礼赠社交</option></select></div>
                  <div class="field"><label>辅助用户心理</label><select data-field="secondaryPsychology"><option>不选择</option><option selected>理性求证</option><option>省时省力</option><option>性价比心理</option><option>从众认同</option><option>好奇缺口</option><option>家庭关怀</option></select></div>
                  <div class="smart-tip full" data-psychology-reason><strong>AI 推荐理由</strong><span>除螨仪决策同时受“怕清洁不到位”和“需要效果证据”驱动，建议采用风险规避为主、理性求证为辅。</span></div>
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
              <div class="field"><label>文案字数 *</label><div class="input-with-unit"><input type="number" min="30" max="2000" value="120" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 30 秒</b></div></div>
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
              <div class="field"><label>目标字数</label><div class="input-with-unit"><input type="number" min="20" max="2000" value="120" data-word-count><span>字</span></div><div class="estimate-line">预计口播时长：<b data-duration>约 30 秒</b></div></div>
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
        intro: "把已确认文案转为可供用户审核的结构化分镜，同时在后台生成镜头检索、时间轴、字幕、配音和包装所需的混剪执行指令。",
        process: "解析口播信息点 → 规划时间轴与镜头任务 → 生成用户确认分镜 → 自动生成隐藏的机器执行指令供智能混剪调用。",
        placeholder: "还可以补充：卖点镜头必须用实拍，结尾保留品牌包装页……",
        request: "把除螨仪暑期口播 V1 转为 30 秒主视频脚本，使用实拍与历史素材，输出可确认分镜。",
        version: "编导模板 V14",
        summary: "已生成 30 秒主视频脚本。现有素材可直接覆盖 4/5 个镜头任务，覆盖率 80%；缺失镜头已给出补拍或视频创作建议。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>内容与产品</strong><small>文案转脚本后将自动继承对应产品事实</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>来源文案 *</label><select><option>除螨仪暑期口播 V1</option><option>从文案库选择其他文案</option><option>从当前会话资产选择</option></select></div>
              <div class="field full"><label>对应产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>视频类型 *</label><select><option>主视频</option><option>延伸视频</option></select></div>
              <div class="field"><label>目标时长 *</label><select><option>30 秒</option><option>20 秒</option><option>45 秒</option><option>按文案自动计算</option></select></div>
              <div class="field"><label>画面比例 *</label><select><option>9:16 竖屏</option><option>1:1 方屏</option><option>16:9 横屏</option></select></div>
              <div class="field"><label>视频风格 *</label><select><option>硬广直给</option><option>生活实拍</option><option>测评讲解</option><option>直播切片感</option></select></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>现有素材优先</strong><small>脚本会优先围绕产品已绑定素材设计，已有素材覆盖目标不低于 50%</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>素材来源 *</label><div class="choice-row" data-single="script-material"><span class="choice-chip active">产品绑定素材</span><span class="choice-chip">指定产品素材</span><span class="choice-chip">临时上传素材</span></div></div>
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 已绑定素材</strong><small>实拍 426 段 · 历史成片拆分 782 段 · AI 素材 78 段</small></div><b>1,286</b></div>
              <div class="smart-tip full"><strong>编导规则</strong><span>优先使用已有素材；无法匹配的镜头标记“需拍摄”或“建议视频创作”。覆盖率低于 50% 时，提供“围绕现有素材重排脚本”方案。</span></div>
              <div class="field full"><label>必须保留的画面要求</label><textarea>开场必须出现尘杯脏污证据；产品能力段展示床垫实拍；结尾出现产品与行动引导。</textarea></div>
              <details class="advanced-block"><summary>配音、字幕与包装设置</summary><div class="section-grid advanced-content"><div class="field"><label>配音与语速</label><select><option>女声｜有力｜1.1×</option><option>男声｜专业｜1.0×</option><option>沿用原声</option></select></div><div class="field"><label>字幕样式</label><select><option>重点词高亮</option><option>大字硬字幕</option><option>品牌标准字幕</option></select></div></div></details>
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
                <tr><td>23–30s</td><td>收束 CTA</td><td>家里有孩子或宠物，床铺清洁把它安排上。</td><td>家庭卧室场景、产品定帧、品牌角标与行动按钮</td><td><span class="badge orange">建议视频创作</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="result-note"><strong>素材可执行性：</strong>现有素材覆盖 4/5 个镜头任务（80%），满足不低于 50%的编导目标。缺失的家庭收束镜头可一键调用视频创作，也可转为线下补拍任务。</div>
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
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 已绑定素材</strong><small>已有素材优先覆盖脚本镜头；缺失镜头自动标记补拍或视频创作</small></div><b>1,286</b></div>
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
      "video-create": {
        intro: "像即梦一样，通过文字描述、首帧图或参考图生成单个可复用视频镜头。它负责创造新镜头，不负责把整条广告脚本混剪成片。",
        process: "读取产品事实与参考图 → 解析主体、场景、动作和运镜 → 调用视频生成模型 → 检查产品一致性、画面稳定性和可用时长 → 输出镜头资产。",
        placeholder: "还可以补充：镜头从尘杯特写缓慢拉远，真人手持产品进入画面……",
        request: "基于轻净 Pro 除螨仪产品图，生成一条5秒竖屏镜头：透明尘杯脏污特写，镜头缓慢拉远并展示整机。",
        version: "视频创作",
        summary: "已生成一条可复用的5秒产品镜头。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>生成模式</strong><small>切换模式后，只展示当前任务需要的输入槽位</small></div></div>
            <div class="section-grid">
              <div class="field"><label>生成方式 *</label><select data-mode-control><option value="image">图生视频</option><option value="text">文生视频</option><option value="start-end">首尾帧生成</option><option value="reference">参考视频生成</option><option value="storyboard">脚本分镜生成</option></select></div>
              <div class="field"><label>目标产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field full conditional-slot show" data-mode="image"><label>起始图片 *</label><div class="upload-box"><strong>上传图片或从图片库选择</strong><span>支持产品图、场景图和脚本分镜图；用于锁定主体外观</span></div></div>
              <div class="field full conditional-slot" data-mode="text"><label>文字画面设定 *</label><textarea>卧室自然光环境，轻净 Pro 除螨仪放置在整洁床面，真实电商产品质感，主体结构清晰。</textarea></div>
              <div class="field conditional-slot" data-mode="start-end"><label>首帧 *</label><div class="upload-box"><strong>选择首帧图片</strong><span>定义镜头开始状态</span></div></div>
              <div class="field conditional-slot" data-mode="start-end"><label>尾帧 *</label><div class="upload-box"><strong>选择尾帧图片</strong><span>定义镜头结束状态</span></div></div>
              <div class="field full conditional-slot" data-mode="reference"><label>参考视频 *</label><div class="upload-box"><strong>上传视频或从视频库选择</strong><span>用于借鉴动作、运镜、节奏或画面风格，不复制原主体</span></div></div>
              <div class="field full conditional-slot" data-mode="reference"><label>需要参考的内容 *</label><div class="choice-row"><span class="choice-chip active">主体动作</span><span class="choice-chip">镜头运动</span><span class="choice-chip">画面节奏</span><span class="choice-chip">视觉风格</span></div></div>
              <div class="field full conditional-slot" data-mode="storyboard"><label>脚本分镜 *</label><select><option>除螨仪主视频脚本｜23–30 秒家庭收束镜头</option><option>从脚本库选择缺失镜头</option></select><span class="field-hint">自动读取分镜描述、产品、时长、画幅和素材缺口</span></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>镜头要求</strong><small>描述主体如何运动、镜头如何拍摄以及最终画面效果</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>动作与镜头描述 *</label><textarea>透明尘杯内可见毛发与碎屑，镜头从尘杯微距缓慢拉远，逐步展示轻净 Pro 除螨仪整机。卧室自然光，画面稳定。</textarea></div>
              <div class="field"><label>镜头时长 *</label><select><option>5 秒</option><option>3 秒</option><option>8 秒</option><option>10 秒</option></select></div>
              <div class="field"><label>画面比例 *</label><select><option>9:16 竖屏</option><option>16:9 横屏</option><option>1:1 方形</option></select></div>
              <div class="field"><label>运镜方式</label><select><option>微距缓慢拉远</option><option>固定镜头</option><option>平移跟拍</option><option>环绕产品</option><option>手持跟随</option></select></div>
              <div class="field"><label>清晰度</label><select><option>1080P</option><option>720P 快速预览</option></select></div>
              <details class="advanced-block"><summary>生成约束与负面提示</summary><div class="section-grid advanced-content"><div class="field full"><label>生成约束</label><textarea>保持产品外观、颜色、按钮和品牌标识一致；不新增产品结构；不出现多余手指、文字乱码、形变和闪烁。</textarea></div></div></details>
            </div>
          </section>
        `
      },
      mix: {
        intro: "基于已确认的结构化脚本，从指定素材范围自动找镜头，完成时间轴编排、字幕、配音、包装和多版本混剪，输出可人工终审的成片。",
        process: "读取脚本执行层 → 检索并排序候选镜头 → 自动编排时间轴 → 生成字幕、配音和包装 → 质检后输出待终审成片。",
        placeholder: "还可以补充：第二个卖点镜头换成真人实拍，字幕字号再大一级……",
        request: "使用除螨仪暑期主视频脚本，从实拍和历史素材中自动混剪 1 条主视频与 3 条延伸视频。",
        version: "混剪引擎 V16",
        summary: "已完成 1 条 30 秒主视频初剪。脚本信息点全部覆盖，8 个镜头任务已匹配；成片进入人工终审后，可提交千川提审。",
        form: `
          <section class="form-section">
            <div class="form-section-head"><div><strong>成片任务</strong><small>脚本和产品决定素材检索范围及成片结构</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>结构化脚本 *</label><select><option>除螨仪暑期主视频脚本 V1</option><option>从脚本库选择</option><option>从当前会话资产选择</option></select></div>
              <div class="field full"><label>对应产品 *</label><select data-product-select>${productOptions}</select></div>
              <div class="field"><label>生产类型 *</label><select><option>1 条主视频</option><option>1 主 + 3 延伸</option><option>仅生成延伸视频</option></select></div>
              <div class="field"><label>成片规格 *</label><select><option>9:16｜1080×1920</option><option>9:16｜720×1280</option></select></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>素材范围</strong><small>默认直接使用当前产品已绑定素材，也可缩小范围或临时补充</small></div></div>
            <div class="section-grid">
              <div class="field full"><label>选择方式 *</label><div class="choice-row" data-single="mix-material"><span class="choice-chip active">产品全部素材</span><span class="choice-chip">指定产品素材</span><span class="choice-chip">临时上传素材</span></div></div>
              <div class="material-summary full"><div><strong>轻净 Pro 除螨仪 · 产品素材池</strong><small>实拍 426 段 · 历史成片拆分 782 段 · AI 素材 78 段</small></div><b>1,286</b></div>
              <div class="smart-tip full"><strong>自动匹配</strong><span>按照脚本镜头任务检索产品素材；缺失镜头优先调用视频创作或进入补拍清单，不使用无关素材凑镜头。</span></div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-head"><div><strong>声音与包装</strong><small>选择品牌标准模板后，可在终审阶段逐项修改</small></div></div>
            <div class="section-grid">
              <div class="field"><label>配音</label><select><option>女声｜有力｜1.1×</option><option>男声｜专业｜1.0×</option><option>上传真人音色</option></select></div>
              <div class="field"><label>字幕与包装</label><select><option>品牌模板｜重点词高亮</option><option>大字硬广模板</option><option>轻量无边框模板</option></select></div>
              <div class="field"><label>背景音乐</label><select><option>自动匹配｜节奏感</option><option>使用品牌指定 BGM</option><option>不使用 BGM</option></select></div>
              <div class="field"><label>延伸版本变化规则</label><select><option>换 3 秒钩子 + 对应镜头</option><option>只换开场镜头</option><option>换部分镜头</option></select></div>
              <div class="field full"><label>制作要求</label><textarea>产品演示优先真人实拍；品牌角标全程保留；任何自动补充素材必须在终审页标识来源。</textarea></div>
            </div>
          </section>
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

    agentConfigs["image-main"].intro = "按产品信息、竞品分析、提示词确认、生图设置和图片生成五步完成商品主图创作。";
    agentConfigs["image-main"].process = "产品信息 → 竞品分析 → 提示词确认 → 生图设置 → 图片生成。";
    agentConfigs["image-main"].form =
      imageProductInfoStepMarkup(false) +
      imageCompetitorStepMarkup(false) +
      imagePromptStepMarkup(false) +
      imageGenerationSettingsStepMarkup(false);
    agentConfigs["image-detail"].intro = "按产品信息、竞品分析、提示词确认、生图设置和图片生成五步完成商品详情图创作。";
    agentConfigs["image-detail"].process = "产品信息 → 竞品分析 → 提示词确认 → 生图设置 → 图片生成。";
    agentConfigs["image-detail"].form =
      imageProductInfoStepMarkup(true) +
      imageCompetitorStepMarkup(true) +
      imagePromptStepMarkup(true) +
      imageGenerationSettingsStepMarkup(true);

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

    function scriptTableHtml(rows, mode = "depend", groupIds = [], assetId = "") {
      const showMaterial = mode === "depend";
      const dynamicColTitle = showMaterial ? "推荐素材" : "生视频提示词";
      const head = `
        <tr>
          <th class="col-shot">镜头</th>
          <th class="col-time">时间段</th>
          <th class="col-voice">对应口播片段</th>
          <th class="col-tag">景别</th>
          <th class="col-tag">运镜方式</th>
          <th class="col-visual">画面内容描述</th>
          <th class="col-dynamic">${dynamicColTitle}</th>
        </tr>
      `;
      const body = rows.map((row, rowIdx) => {
        const shotSeconds = parseShotSeconds(row.time);
        const rowMaterialIds = row.materialIds?.length ? row.materialIds : (row.materialOverride ? [row.materialOverride] : groupIds);
        const cropMaterial = row.materialOverride && Number.isFinite(row.materialCropStart) ? findScriptMaterial(row.materialOverride) : null;
        const plans = showMaterial
          ? (cropMaterial ? [{ items:[{ ...cropMaterial, useDuration:row.materialUseDuration || shotSeconds, clipped:true, cropStart:row.materialCropStart, cropEnd:row.materialCropEnd }] }] : buildMaterialPlan(shotSeconds, rowMaterialIds))
          : [];
        const dynamicCell = showMaterial
          ? (plans.length
            ? `<div class="material-match-cell"><button class="script-ai-switch" type="button" data-action="switch-script-shot" data-asset-id="${escapeHtml(assetId)}" data-row-idx="${rowIdx}">✦ AI 换一组</button><div class="material-match-list">${plans[0].items.map((it, itemIdx) => `
                <div class="material-plan-item">
                  <button class="material-video-preview" type="button" data-action="replace-script-material" data-asset-id="${escapeHtml(assetId)}" data-row-idx="${rowIdx}" data-material-id="${escapeHtml(it.id)}"><span>${escapeHtml(it.id)}</span><em>替换</em></button>
                  <div><strong>${escapeHtml(it.name || it.id)}</strong><small>${(it.useDuration || it.duration).toFixed(1)}s${Number.isFinite(it.cropStart) ? ` · 裁剪 ${it.cropStart.toFixed(1)}–${it.cropEnd.toFixed(1)}s` : it.clipped ? " · 截取" : ""}</small><span>${(it.tags || []).slice(0, 2).map(tag => escapeHtml(tag)).join(" · ")}</span></div>
                </div>${itemIdx < plans[0].items.length - 1 ? '<i class="material-plan-plus">＋</i>' : ''}`).join("")}</div></div>`
            : `<div class="material-plan-empty">当前素材分组下无匹配素材，请返回脚本策略重新勾选素材分组。</div>`)
          : `<div class="video-prompt-cell"><textarea readonly rows="3" data-video-prompt>${escapeHtml(row.videoPrompt || "")}</textarea><button class="ghost-btn ghost-btn-sm" type="button" data-action="copy-video-prompt" data-prompt="${escapeHtml(row.videoPrompt || "")}">一键复制</button></div>`;
        return `
          <tr data-script-row data-row-idx="${rowIdx}" data-asset-id="${escapeHtml(assetId)}">
            <td class="col-shot"><b class="shot-index">#${row.id}</b></td>
            <td class="col-time" data-edit-script-row>${escapeHtml(row.time)}</td>
            <td class="col-voice" data-edit-script-row><div class="cell-clamp">${escapeHtml(row.voice)}</div></td>
            <td class="col-tag" data-edit-script-row><span class="shot-tag">${escapeHtml(row.shotType || "中景")}</span></td>
            <td class="col-tag" data-edit-script-row><span class="shot-tag">${escapeHtml(row.cameraMove || "固定")}</span></td>
            <td class="col-visual" data-edit-script-row><div class="cell-clamp">${escapeHtml(row.visual)}</div></td>
            <td class="col-dynamic">${dynamicCell}</td>
          </tr>
        `;
      }).join("");
      return `
        <div class="script-table-wrap">
          <table class="script-result-table-grid${showMaterial ? " with-materials" : " with-prompts"}">
            <thead>${head}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    }

    // 解析 "00—03s" / "06—10s" 为 3 / 4 等秒数(用于素材方案匹配)
    function parseShotSeconds(timeText) {
      const match = String(timeText || "").match(/(\d+)\s*[-—]\s*(\d+)/);
      if (!match) return 0;
      return Math.max(1, Number(match[2]) - Number(match[1]));
    }

    function videoScriptDetailHtml(asset) {
      const mode = asset.materialMode || "depend";
      const groupIds = asset.materialIds?.length ? asset.materialIds : (asset.materialGroups || []).map(g => g.id || g.name);
      return `
        <strong>本视频使用脚本</strong>
        <p style="margin:4px 0 8px;">${escapeHtml(asset.sourceTitle || "除螨仪30秒结构化脚本")} · 同时保留素材匹配、字幕、配音和包装信息</p>
        ${scriptTableHtml(asset.scriptRows || completeScriptRows, mode, groupIds)}
      `;
    }

    function generatedShotDetailHtml(asset) {
      return `
        <strong>镜头生成信息</strong>
        <p style="margin:4px 0 0;">${escapeHtml(asset.detail || "图生视频 · 5秒 · 9:16 · 1080P")}</p>
      `;
    }

    function contextualCopy(type, offset = 0, countOverride = null) {
      const product = currentProduct();
      const audience = creationContext.originalFields.audiences?.[0] || product.audiences?.[0] || "家庭用户";
      const core = product.core || "解决核心使用问题";
      const secondary = product.secondary || "日常使用更方便";
      const difference = product.difference || "效果清晰可感知";
      const marketing = creationContext.originalFields.marketing || "具体优惠以当前页面展示为准";
      const action = creationContext.originalFields.marketingScene === "直播间引流" ? "点进直播间，看完整实测演示。" : "点击商品，先看实际使用效果。";
      if (type === "rewrite") {
        const fields = creationContext.originalFields;
        const method = fields.rewriteMethod || "hook";
        const target = fields.rewriteTarget || "结果前置";
        const source = String(fields.sourceCopy || `${product.name}可以做到${core}，日常使用还能${secondary}。${action}`).trim();
        const rest = source.replace(/^[^。！？!?]+[。！？!?]?/, "").trim() || source;
        const hooks = [
          `刚整理完，也不代表深处真的干净。`,
          `别只看表面，先看${product.name}实际处理出的结果。`,
          `${audience}先别急着选，第一步要看效果能不能直接验证。`,
          `同样是日常清洁，真正拉开差距的是看不见的细节。`,
          `先不讲参数，用一次真实结果告诉你值不值得。`,
          `看着干净和真正处理到位，完全是两回事。`
        ];
        const styles = {
          "硬广直给": `别绕弯子，${product.name}核心就是${core}。`,
          "生活化口播": `我本来没觉得家里有多难清理，直到实际用了一遍${product.name}。`,
          "专业测评": `先看核心能力和实测结果：${product.name}${core}。`,
          "情绪冲击": `每天都在用的地方，最怕看着干净、实际问题还藏在里面。`,
          "理性对比": `选这类产品，不比功能数量，只比核心问题能不能真正处理。`
        };
        const methodTitles = { hook:"只换前3秒钩子", shorten:"缩短文案", audience:"更换目标人群", selling:"卖点前置", style:"调整表达风格", rephrase:"保留结构重新表达" };
        const count = Math.max(1, Math.min(10, Number(countOverride ?? fields.generationCount ?? 3)));
        return Array.from({ length: count }, (_, index) => {
          const absoluteIndex = offset + index;
          let preview = source;
          if (method === "hook") preview = `${hooks[absoluteIndex % hooks.length]}${rest}`;
          if (method === "shorten") preview = source.replace(/这类产品|实际使用过程中|日常使用时/g, "").slice(0, Math.max(30, Number(fields.wordCount || 120)));
          if (method === "audience") preview = `${target}选这类产品，先看能不能解决每天都遇到的问题。${product.name}${core}，日常使用还能${secondary}。${action}`;
          if (method === "selling") preview = `${target}。${source}`;
          if (method === "style") preview = `${styles[target] || styles["硬广直给"]}${rest}`;
          if (method === "rephrase") preview = `先看真实使用结果。${product.name}通过${core}处理核心问题，同时做到${secondary}；${difference}。${action}`;
          return [`${methodTitles[method] || "定向改写"}·版本${absoluteIndex + 1}`, preview];
        });
      }
      const baseCopies = [
        ["结果冲击型", `刚整理完的地方，不代表深处真的干净。先用${product.name}走一遍，${difference}，清洁结果直接看得见。它可以做到${core}，日常使用还能${secondary}，不用再靠感觉判断有没有清理到位。${marketing}，${action}`],
        ["痛点直给型", `别再只看表面参数，真正影响体验的是每天遇到的问题能不能解决。${product.name}主打${core}，使用过程中还能${secondary}，把原本反复处理的步骤变得更直接。再通过${difference}让效果有据可看。${marketing}，${action}`],
        ["场景代入型", `${audience}日常使用时，最怕步骤多、做完还看不到结果。${product.name}通过${core}完成核心处理，再用${difference}反馈实际效果；使用结束后还能${secondary}。从操作到后续清理都更顺手。${marketing}，${action}`],
        ["实测验证型", `先不讲参数，直接看一次真实使用。${product.name}工作时可以做到${core}，处理后的变化通过${difference}清楚呈现。用完还能${secondary}，操作和后续整理都不用增加复杂步骤。${marketing}，${action}`],
        ["身份点名型", `${audience}选这类产品，别只看功能多不多，要看它能不能解决高频问题。${product.name}做到${core}，并通过${difference}降低判断成本，日常还能${secondary}。需要经常使用的产品，省心比堆参数更重要。${action}`],
        ["反差对比型", `看着干净和真正处理到位不是一回事，区别就在使用结果。${product.name}通过${core}处理核心问题，再用${difference}把前后差别展示出来；同时还能${secondary}。不需要复杂操作，也能把日常容易忽略的地方认真处理。${action}`],
        ["风险提醒型", `日常看不见的问题，不会因为简单整理就自动消失。${product.name}可以做到${core}，并通过${difference}帮助你确认实际效果；用完还能${secondary}。与其反复猜测，不如把处理过程和结果都看清楚。${marketing}，${action}`],
        ["利益直给型", `一次完成核心处理，还能直接看到结果。${product.name}${core}，使用过程中通过${difference}反馈效果，用完还能${secondary}。少一点重复步骤，多一点明确结果，日常使用更容易坚持。${marketing}，${action}`],
        ["悬念揭秘型", `明明刚整理过，为什么再次处理还能看到变化？用${product.name}实际走一遍，${difference}。它能够做到${core}，后续还能${secondary}，从过程到结果都更清楚。答案不靠猜，直接看完整演示。${action}`],
        ["数字清单型", `选这类产品先看三点：核心问题能不能处理、结果能不能看见、用完是否方便。${product.name}分别通过${core}、${difference}和${secondary}回应这三个问题。功能不在多，而在每一步都能解决真实使用需求。${marketing}，${action}`]
      ];
      const count = Math.max(1, Math.min(10, Number(countOverride ?? creationContext.originalFields.generationCount ?? 3)));
      return Array.from({ length: count }, (_, index) => {
        const absoluteIndex = offset + index;
        const base = baseCopies[absoluteIndex % baseCopies.length];
        const round = Math.floor(absoluteIndex / baseCopies.length);
        return round ? [`${base[0]}·延展${round + 1}`, `换一种表达方式：${base[1]}`] : base;
      });
    }

    function copyStructureTags(title = "") {
      if (title.includes("痛点")) return ["痛点钩子", "问题放大", "产品卖点", "使用价值", "行动号召"];
      if (title.includes("场景")) return ["场景代入", "用户痛点", "产品卖点", "使用感受", "行动号召"];
      if (title.includes("实测")) return ["实测钩子", "使用过程", "结果证据", "便利卖点", "行动号召"];
      if (title.includes("身份")) return ["人群点名", "选择标准", "产品卖点", "用户价值", "行动号召"];
      if (title.includes("反差")) return ["反差钩子", "问题对比", "产品卖点", "结果证明", "行动号召"];
      if (title.includes("风险")) return ["风险提醒", "用户痛点", "产品方案", "结果证明", "行动号召"];
      if (title.includes("利益")) return ["利益直给", "产品功能", "使用价值", "价格优惠", "行动号召"];
      if (title.includes("悬念")) return ["悬念钩子", "原因揭示", "产品功能", "结果证明", "行动号召"];
      if (title.includes("数字")) return ["数字钩子", "选择标准", "产品卖点", "信任说明", "行动号召"];
      return ["结果钩子", "用户痛点", "产品卖点", "使用价值", "行动号召"];
    }

    function activeCopyStructureTags(direction = "") {
      if (activeType === "original") {
        const selected = findContentStructure(creationContext.originalFields.copyStructureId);
        if (selected?.formula) return selected.formula.split("→").map(item => item.trim()).filter(Boolean);
      }
      return copyStructureTags(direction);
    }

    function contextualScriptRows() {
      const product = currentProduct();
      return [
        { id:1, time:"00—03s", shotType:"特写", cameraMove:"固定", voice:`先看结果,${product.name}把核心效果直接做给你看。`, visual:"产品使用结果特写先出现,再快速切换至使用前场景,形成视觉反差。", subtitle:"结果先看｜3秒抓停留", execution:"优先匹配产品结果实拍;无素材时标记为需补拍。", videoPrompt:`${product.name}使用结果特写,自然光,竖屏9:16,镜头固定,3秒。` },
        { id:2, time:"03—06s", shotType:"近景", cameraMove:"推进", voice:"真正影响体验的,往往不是表面参数,而是每天都要处理的麻烦。", visual:"用户真实场景与问题细节近景,镜头从环境推进到具体痛点。", subtitle:"真实场景｜具体问题", execution:"匹配产品目标人群场景;避免空泛氛围镜头。", videoPrompt:"用户真实场景,问题细节近景,镜头从中景缓慢推进,3秒。" },
        { id:3, time:"06—10s", shotType:"中景", cameraMove:"平移跟拍", voice:`${product.name},${product.core}。`, visual:"真人或手部完成一次完整产品操作,补充关键结构近景。", subtitle:product.core, execution:"产品型号、外观和操作步骤必须一致;优先使用产品绑定实拍。", videoPrompt:`${product.name} 核心卖点实拍,镜头平移跟拍,4秒。` },
        { id:4, time:"10—14s", shotType:"近景", cameraMove:"固定", voice:`使用过程中,${product.difference}。`, visual:"展示产品工作过程及结果变化,按照原因—过程—结果顺序剪辑。", subtitle:product.difference, execution:"结果镜头必须来自当前产品;禁止用其他型号代替。", videoPrompt:`${product.name} 工作过程近景,镜头固定,4秒,展示差异化卖点。` },
        { id:5, time:"14—18s", shotType:"全景", cameraMove:"平移跟拍", voice:`日常使用还能做到${product.secondary}。`, visual:"连续展示两个高频使用场景,每个场景保留完整动作。", subtitle:product.secondary, execution:"每个场景1.5—2秒;镜头内容不重复。", videoPrompt:"两个高频使用场景,镜头平移跟拍,4秒,真实生活感。" },
        { id:6, time:"18—22s", shotType:"中景", cameraMove:"固定", voice:"不用额外增加复杂步骤,使用和后续处理都更顺手。", visual:"操作完成后的收纳、清理或切换动作,突出便利性。", subtitle:"少步骤｜更省心", execution:"动作必须连贯;不做无法由产品事实证明的效率对比。", videoPrompt:"操作完成后收纳/清理动作,中景固定,4秒,突出便利。" },
        { id:7, time:"22—26s", shotType:"中景", cameraMove:"固定", voice:"选这类产品,核心是看它能不能真正解决你的使用问题。", visual:"产品与真实家庭环境同框,补充一组用户使用反馈字幕。", subtitle:"解决问题,比堆参数更重要", execution:"用户反馈使用已授权内容;无授权时仅展示产品场景。", videoPrompt:"产品与真实家庭环境同景,中景固定,4秒,自然感。" },
        { id:8, time:"26—30s", shotType:"全景", cameraMove:"拉远", voice:`想进一步了解${product.name},进入直播间看完整演示。`, visual:"产品定帧、品牌角标和行动引导;背景保持简洁。", subtitle:"进入直播间｜查看完整演示", execution:"套用品牌包装模板;活动与价格仅使用本次已审核营销信息。", videoPrompt:`${product.name} 定帧,全景拉远,4秒,品牌角标+行动引导,背景简洁。` }
      ];
    }

    function defaultAgentRequest(type) {
      const product = currentProduct();
      const rewriteMethodLabel = ({ hook:"只换前3秒钩子", shorten:"缩短文案", audience:"更换目标人群", selling:"卖点前置", style:"调整表达风格", rephrase:"保留结构重新表达" })[creationContext.originalFields.rewriteMethod] || "只换前3秒钩子";
      const requests = {
        original: `为“${product.name}”生成${creationContext.originalFields.generationCount || 3}条千川口播文案；营销场景：${creationContext.originalFields.marketingScene || "直播间引流"}；目标人群：${creationContext.originalFields.audiences?.join("、") || "产品默认人群"}；开场钩子：${creationContext.originalFields.hook || "不限"}；文案结构：${creationContext.originalFields.copyStructure || "不限"}；脚本类型：${creationContext.originalFields.scriptType || "不限"}；每条约${creationContext.originalFields.wordCount || 180}字。仅使用已确认的产品卖点与信任背书。`,
        copy: `参考当前已解析爆款内容的钩子、结构与节奏，为“${product.name}”生成${creationContext.originalFields.generationCount || 3}条原创仿写文案，每条约${creationContext.originalFields.wordCount || 120}字；仅使用当前产品事实，不复制原文，不迁移参考商品的品牌、参数、价格或优惠。`,
        rewrite: `对“${product.name}”现有文案执行“${rewriteMethodLabel}”改写，生成${creationContext.originalFields.generationCount || 3}条，每条约${creationContext.originalFields.wordCount || 120}字；未指定修改的原文结构、产品事实、卖点顺序和CTA保持不变。`,
        "image-main": `为“${product.name}”生成3张商品主图，突出“${product.core}”。`,
        "image-detail": `为“${product.name}”生成一组详情页图片，按卖点顺序组织内容。`,
        script: `把当前文案转为“${product.name}”的30秒结构化脚本，优先使用产品绑定素材。`,
        "script-copy": `参考已拆解视频，为“${product.name}”重构一条30秒原创脚本。`,
        mix: `使用当前结构化脚本和“${product.name}”绑定素材生成待终审成片。`
      };
      return requests[type] || agentConfigs[type]?.request || "开始创作";
    }

    function buildCompactResponse(type, isRevision) {
      if (type === "chat") {
        return {
          summary: "我已理解你的需求。你可以继续补充产品、目标人群或希望产出的资产；需要直接执行时，可切换为智能文案、智能脚本或智能混剪等专业能力。",
          assets: []
        };
      }
      if (type === "image-main" || type === "image-detail") {
        const isMain = type === "image-main";
        const product = currentProduct();
        const imageTitles = isMain ? ["结果可视化主图", "功能演示主图", "使用便利主图"] : ["核心卖点模块", "功能演示模块", "使用便利模块", "适用场景模块"];
        return {
          summary: isMain ? `已为“${product.name}”生成 ${imageTitles.length} 张商品主图，均可继续改图或保存到图片库。` : `已为“${product.name}”生成 ${imageTitles.length} 个详情页图片模块，可调整卖点顺序和画面风格。`,
          assets: imageTitles.map((title, index) => ({ type: "image", title, preview: isMain ? `${product.core} · ${index === 0 ? "商品主体 + 结果证据" : "产品卖点场景化呈现"}` : `${product.core} · 详情页模块 ${index + 1}`, meta: isMain ? "商品主图 · AI创作" : "商品详情页 · AI创作" }))
        };
      }
      if (type === "original" || type === "copy" || type === "rewrite") {
        const batchTimestamp = generationTimestamp();
        const sourceItems = type === "copy" ? contextualCopy("original") : contextualCopy(type);
        const items = sourceItems.map(([direction, preview], index) => ({
          type: "copy",
          title: generatedCopyName(batchTimestamp),
          direction,
          preview,
          structureTags: activeCopyStructureTags(direction),
          wordCount: preview.replace(/\s/g, "").length,
          meta: type === "original" ? `${direction} · ${creationContext.originalFields.copyStructure || "不限"} · ${creationContext.originalFields.scriptType || "不限"}` : type === "copy" ? `${direction} · 爆款方法重构` : `${direction} · 定向改写`
        }));
        const product = currentProduct();
        const rewriteMethod = dynamicForm.querySelector('[data-single="rewrite-method"] .choice-chip.active')?.textContent.trim() || "所选方式";
        const freshSummary = type === "original"
          ? `已根据 ${product.name} 的产品信息和生成设置，为你生成${items.length}条千川口播文案。`
          : type === "copy"
            ? `已参考所选素材的内容结构，为 ${product.name} 生成${items.length}条原创仿写文案。`
            : `已按“${rewriteMethod}”完成${items.length}版改写，可继续自然语言调整。`;
        return {
          summary: isRevision ? `已按本轮要求更新${items.length}条结果。` : freshSummary,
          assets: items
        };
      }

      if (type === "script" || type === "script-copy") {
        const product = currentProduct();
        const scriptCtx = creationContext.script || {};
        const versionCount = Math.max(1, Math.min(3, Number(scriptCtx.version || 1)));
        const baseRows = contextualScriptRows();
        const versionFlavors = [
          { suffix:"V1", angle:"钩子强化+结果直给", rhythm:"稳" },
          { suffix:"V2", angle:"痛点加深+场景前置", rhythm:"快" },
          { suffix:"V3", angle:"对比放大+卖点集中", rhythm:"紧" }
        ];
        const versionAssets = Array.from({ length: versionCount }, (_, idx) => {
          const flavor = versionFlavors[idx] || versionFlavors[0];
          const rows = baseRows.map(row => ({ ...row }));
          return {
            type: "script",
            versionLabel: flavor.suffix,
            versionAngle: flavor.angle,
            versionRhythm: flavor.rhythm,
            title: type === "script"
              ? `${product.name}｜30秒结构化脚本 ${flavor.suffix}`
              : `${product.name}｜爆款节奏重构脚本 ${flavor.suffix}`,
            preview: `30秒完整脚本 ${flavor.suffix}｜8个连续分镜｜${flavor.angle}｜节奏:${flavor.rhythm}`,
            meta: `${flavor.angle} · 节奏${flavor.rhythm} · 8段分镜 · 含完整口播、画面、字幕、素材匹配及混剪执行要求`,
            scriptRows: rows,
            materialMode: scriptCtx.materialMode || "depend",
            materialIds: scriptCtx.materialIds || [],
            materialGroups: scriptCtx.materialGroups || []
          };
        });
        return {
          summary: isRevision
            ? `已完成整条30秒脚本更新,${versionCount > 1 ? `已生成 ${versionCount} 个独立版本供选择` : "所有分镜均保留完整口播、画面、字幕和混剪执行要求"}。`
            : `已生成 ${versionCount} 套可直接交给剪辑或驱动智能混剪的30秒结构化脚本${versionCount > 1 ? "。" : "。"}`,
          assets: versionAssets
        };
      }

      const product = currentProduct();
      return {
        summary: isRevision ? "已按要求局部重新混剪，未涉及的镜头、配音和包装保持不变。" : "成片已生成，可预览、查看来源脚本或进入人工终审。",
        assets: [{
          type: "video",
          title: `${product.name}｜30秒主视频`,
          preview: "28.6秒 · 9:16 · 8个镜头任务已匹配 · 自动质检通过",
          meta: "智能混剪 · 待人工终审",
          detail: "制作信息：产品实拍62% · 历史素材38% · AI素材0%\n已完成：字幕对齐、配音、BGM闪避、品牌包装与黑帧检测",
          scriptRows: contextualScriptRows()
        }]
      };
    }

    function actionsForAsset(asset) {
      const libraryText = asset.saved ? "已存素材库" : asset.type === "video" ? "保存到视频库" : asset.type === "image" ? "保存到图片库" : "保存到文案库";
      const libraryClass = asset.saved ? " saved" : "";
      if (asset.type === "copy") {
        return `
          <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
          <button class="asset-action" data-asset-action="to-script">转为脚本</button>
          <button class="asset-action" data-asset-action="similar">生成同类</button>
          <button class="asset-action" data-asset-action="copy">复制</button>
          <button class="asset-action" data-asset-action="delete">删除</button>
        `;
      }
      if (asset.type === "script") {
        return `
          <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
          <button class="asset-action primary" data-asset-action="to-mix">智能混剪</button>
          <button class="asset-action" data-asset-action="edit-script">修改分镜</button>
          <button class="asset-action" data-asset-action="similar">生成同类</button>
        `;
      }
      if (asset.type === "video") {
        return `
          <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
          <button class="asset-action" data-asset-action="view-script">查看脚本</button>
          <button class="asset-action" data-asset-action="remix">重新混剪</button>
          <button class="asset-action primary" data-asset-action="submit">提交提审</button>
        `;
      }
      return `
        <button class="asset-action action-library${libraryClass}" data-asset-action="library">${libraryText}</button>
        <button class="asset-action" data-asset-action="edit-image">继续修改</button>
      `;
    }

    function generatedAssetHtml(asset) {
      let body = `<div class="generated-asset-body">${escapeHtml(asset.preview)}</div>`;
      if (asset.type === "script") {
        const mode = asset.materialMode || "depend";
        const groupIds = asset.materialIds?.length ? asset.materialIds : (asset.materialGroups || []).map(g => g.id || g.name);
        body = scriptTableHtml(asset.scriptRows || completeScriptRows, mode, groupIds);
      }
      if (asset.type === "video") {
        const detail = asset.videoKind === "generated-shot" ? generatedShotDetailHtml(asset) : videoScriptDetailHtml(asset);
        body = `
          <div class="generated-video">
            <div class="generated-video-cover">▶</div>
            <div>
              <div class="generated-asset-body">${escapeHtml(asset.preview)}</div>
              <div class="video-source-detail">${detail}</div>
            </div>
          </div>
        `;
      }
      return `
        <article class="generated-asset" data-asset-id="${asset.id}">
          <div class="generated-asset-head"><strong>${escapeHtml(asset.title)}</strong><small>${asset.type === "copy" ? "文案" : asset.type === "script" ? "脚本" : asset.type === "video" ? "视频" : "图片"}</small></div>
          ${body}
          <div class="asset-inline-actions">${actionsForAsset(asset)}</div>
        </article>
      `;
    }

    function guidedPromptsHtml(type, assetId) {
      const prompts = guidedPromptMap[type] || guidedPromptMap.original;
      return `
        <div class="guided-prompts" data-source-asset-id="${assetId || ""}">
          <span>接下来可以：</span>
          ${prompts.map(([text, nextType]) => `<button class="guided-prompt" data-guided-prompt="${escapeHtml(text)}" data-next-type="${nextType}">${escapeHtml(text)}</button>`).join("")}
        </div>
      `;
    }

    function previewText(text, maxLength = 42) {
      const normalized = (text || "").replace(/\s+/g, " ").trim();
      return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
    }

    function updateConversationLocator() {
      if (!conversationLocator) return;
      const userTurns = [...chatOutput.querySelectorAll(".message.user")];
      const dots = [...conversationLocator.querySelectorAll(".locator-dot")];
      let activeIndex = 0;
      userTurns.forEach((turn, index) => {
        if (turn.offsetTop - chatOutput.offsetTop <= chatOutput.scrollTop + 56) activeIndex = index;
      });
      dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
    }

    function renderConversationLocator() {
      if (!conversationLocator) return;
      const userTurns = [...chatOutput.querySelectorAll(".message.user")];
      conversationLocator.innerHTML = "";
      if (!userTurns.length) return;

      const usableHeight = Math.max(0, conversationLocator.clientHeight - 4);
      const pointGap = userTurns.length > 1
        ? Math.min(22, Math.max(14, (usableHeight - 3) / (userTurns.length - 1)))
        : 0;
      const pointGroupHeight = (userTurns.length - 1) * pointGap + 3;
      const pointStart = Math.max(0, (usableHeight - pointGroupHeight) / 2);
      userTurns.forEach((userTurn, index) => {
        const assistantTurn = userTurn.nextElementSibling?.classList.contains("assistant") ? userTurn.nextElementSibling : null;
        const question = previewText(userTurn.textContent);
        const answer = previewText(assistantTurn?.querySelector(".assistant-summary")?.textContent || assistantTurn?.textContent || "");
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "locator-dot";
        dot.style.top = `${pointStart + index * pointGap}px`;
        dot.setAttribute("aria-label", `第 ${index + 1} 轮：${question}`);
        dot.title = `定位到第 ${index + 1} 轮`;

        const preview = document.createElement("span");
        preview.className = "locator-preview";
        const heading = document.createElement("strong");
        heading.textContent = `第 ${index + 1} 轮`;
        const questionLine = document.createElement("span");
        questionLine.textContent = `你：${question}`;
        const answerLine = document.createElement("span");
        answerLine.textContent = `AI：${answer}`;
        preview.append(heading, questionLine, answerLine);
        dot.append(preview);
        dot.addEventListener("click", () => userTurn.scrollIntoView({ behavior: "smooth", block: "start" }));
        conversationLocator.append(dot);
      });
      updateConversationLocator();
    }

    function clearAgentConflict() {
      dynamicForm.querySelector("[data-agent-conflict]")?.remove();
    }

    function showAgentConflict(title, message, kind, field) {
      clearAgentConflict();
      const panel = document.createElement("div");
      panel.className = "field-conflict";
      panel.dataset.agentConflict = kind;
      panel.innerHTML = `<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div><div class="field-conflict-actions"><button type="button" data-conflict-action="use-product">使用产品库信息</button><button type="button" data-conflict-action="modify">返回修改</button>${kind === "fact" ? '<button type="button" data-conflict-action="update-product">更新产品信息</button>' : ""}</div>`;
      (dynamicForm.querySelector(".task-form-footer") || dynamicForm).prepend(panel);
      panel.dataset.fieldName = field?.dataset.field || "";
      panel.scrollIntoView({ behavior:"smooth", block:"center" });
    }

    function validateAgentFacts() {
      if (!["original", "copy", "rewrite"].includes(activeType)) return true;
      clearAgentConflict();
      const fields = [...dynamicForm.querySelectorAll("input:not([type=hidden]), textarea")];
      const combined = fields.map(field => field.value || "").join("\n");
      const product = currentProduct();
      const factConflict = combined.match(/(?:¥|￥)?\s*(199|299)\s*元?/);
      if (product.name.includes("轻净 Pro") && factConflict) {
        const field = fields.find(item => (item.value || "").includes(factConflict[0]));
        showAgentConflict("价格与产品库不一致", `输入中出现“${factConflict[0]}”，产品库价格为 ¥399。`, "fact", field);
        return false;
      }
      const blocked = ["全网最低", "永久有效", "100%除螨", "百分百除螨", "绝对安全"].find(word => combined.includes(word));
      if (blocked) {
        const field = fields.find(item => (item.value || "").includes(blocked));
        showAgentConflict("命中禁用表达", `“${blocked}”不能用于生成，请删除或改为可证明的表达。`, "forbidden", field);
        return false;
      }
      const unsupported = ["国家级认证", "销量第一", "除菌率99.9%"].find(word => combined.includes(word));
      if (unsupported) {
        const field = fields.find(item => (item.value || "").includes(unsupported));
        showAgentConflict("缺少信任证明", `“${unsupported}”尚未绑定证明材料，暂不能用于创作。`, "unsupported", field);
        return false;
      }
      return true;
    }

    function showGeneratedResult(allowDefault = false) {
      const config = agentConfigs[activeType];
      if (!config) return;
      const inAgentTask = taskShell.classList.contains("show");
      const typedRequest = promptInput.value.trim();
      if (!typedRequest && !allowDefault) {
        showToast("请输入需要继续修改的内容");
        return;
      }
      if (!validateAgentFacts()) return;
      closeModal(true);
      const requestText = typedRequest || defaultAgentRequest(activeType);
      const isRevision = (agentTurnCounts[activeType] || 0) > 0 && Boolean(typedRequest);
      const response = buildCompactResponse(activeType, isRevision);
      const turnNumber = conversationTurnCount + 1;
      const messageId = `assistant-turn-${turnNumber}`;
      const sourceAssetId = pendingSourceAssetId;
      const sourceAsset = sessionAssets.find(asset => asset.id === sourceAssetId);
      const chatTargetIds = inAgentTask && taskCompleted && isStructuredCopyFlow()
        ? (originalCopyTargetId ? [originalCopyTargetId] : [...originalTaskAssetIds])
        : (sourceAssetId ? [sourceAssetId] : []);
      const generatedAssets = response.assets.map(asset => ({
        ...asset,
        id: `session-asset-${++assetSequence}`,
        messageId,
        turnNumber,
        sourceType: activeType,
        sourceAssetId,
        sourceAssetIds: [...chatTargetIds],
        sourceTitle: sourceAsset?.title || asset.sourceTitle,
        scriptRows: asset.type === "video" && activeType === "mix" ? (sourceAsset?.scriptRows || asset.scriptRows || completeScriptRows) : asset.scriptRows,
        model: selectedModelLabel(),
        saved: false
      }));
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.dataset.targetAssetIds = chatTargetIds.join(",");
      userTurn.textContent = requestText;

      const assistantTurn = document.createElement("div");
      assistantTurn.className = "message assistant";
      assistantTurn.id = messageId;
      assistantTurn.dataset.agentType = activeType;
      assistantTurn.dataset.modelLabel = selectedModelLabel();
      assistantTurn.dataset.assetIds = generatedAssets.map(asset => asset.id).join(",");
      assistantTurn.dataset.sourceAssetIds = chatTargetIds.join(",");
      assistantTurn.innerHTML = `
        <div class="message-head">
          <strong title="${escapeHtml(selectedModelLabel())}">✦ ${activeAgent}</strong>
        </div>
        <p class="assistant-summary">${response.summary}</p>
        ${inAgentTask ? "" : `<div class="generated-assets">${generatedAssets.map(generatedAssetHtml).join("")}</div>`}
        ${inAgentTask ? "" : guidedPromptsHtml(activeType, generatedAssets[0]?.id)}
      `;

      chatOutput.append(userTurn, assistantTurn);
      sessionAssets.push(...generatedAssets);
      renderSessionAssets();
      pendingSourceAssetId = "";
      conversationTurnCount += 1;
      agentTurnCounts[activeType] = (agentTurnCounts[activeType] || 0) + 1;
      chatOutput.classList.add("show");
      document.getElementById("followupHint").classList.toggle("show", Boolean(sourceAssetId));
      agentBrowser.style.display = "none";
      emptyHero.style.display = "none";
      promptInput.value = "";
      if (inAgentTask) showTaskResult(response, generatedAssets);
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
      requestAnimationFrame(renderConversationLocator);
      showToast(`${activeAgent} 已完成第 ${conversationTurnCount} 轮结果`);
    }

    const audienceProfileDefaults = {
      "Z世代": { gender:"不限", min:15, max:25 },
      "新锐白领": { gender:"不限", min:25, max:35 },
      "精致妈妈": { gender:"女性", min:25, max:40 },
      "资深中产": { gender:"不限", min:36, max:50 },
      "都市蓝领": { gender:"不限", min:20, max:40 },
      "都市银发": { gender:"不限", min:50, max:80 },
      "小镇青年": { gender:"不限", min:18, max:30 },
      "小镇中老年": { gender:"不限", min:45, max:80 }
    };
    function activateAudienceDefault(name, rewrite = false) {
      const profile = audienceProfileDefaults[name];
      if (!profile) return;
      const genderRow = dynamicForm.querySelector(`[data-role="${rewrite ? "rewrite-gender" : "gender"}"]`);
      const ageRow = dynamicForm.querySelector(`[data-role="${rewrite ? "rewrite-age" : "age"}"]`);
      genderRow?.querySelectorAll(".choice-chip").forEach(item => item.classList.toggle("active", item.textContent.trim() === profile.gender));
      if (genderRow) genderRow.dataset.audienceLockedGender = profile.gender === "女性" ? "女性" : "";
      const customTrigger = ageRow?.querySelector(rewrite ? "[data-rewrite-custom-age-trigger]" : "[data-custom-age-trigger]");
      ageRow?.querySelectorAll(".choice-chip").forEach(item => item.classList.toggle("active", item === customTrigger));
      const customRange = ageRow?.querySelector(rewrite ? "[data-rewrite-custom-age]" : "[data-custom-age]");
      if (customRange) customRange.hidden = false;
      const minInput = ageRow?.querySelector(rewrite ? "[data-rewrite-age-min]" : "[data-age-min]");
      const maxInput = ageRow?.querySelector(rewrite ? "[data-rewrite-age-max]" : "[data-age-max]");
      if (minInput) minInput.value = profile.min;
      if (maxInput) maxInput.value = profile.max;
      if (rewrite) syncRewriteAudienceTarget();
    }

    dynamicForm.addEventListener("click", event => {
      if (event.target.closest("[data-open-creation-product-picker]")) {
        openCreationProductPicker();
        return;
      }
      const rewriteSourceMode = event.target.closest("[data-rewrite-source-mode]");
      if (rewriteSourceMode) {
        const source = dynamicForm.querySelector("[data-rewrite-source]");
        if (source) source.value = rewriteSourceMode.dataset.rewriteSourceMode;
        refreshRewriteSource();
        return;
      }
      const conflictAction = event.target.closest("[data-conflict-action]");
      if (conflictAction) {
        const panel = conflictAction.closest("[data-agent-conflict]");
        const action = conflictAction.dataset.conflictAction;
        if (action === "use-product") {
          dynamicForm.querySelectorAll("input:not([type=hidden]), textarea").forEach(field => {
            field.value = String(field.value || "")
              .replace(/(?:¥|￥)?\s*(199|299)\s*元?/g, "¥399")
              .replace(/全网最低|永久有效|100%除螨|百分百除螨|绝对安全|国家级认证|销量第一|除菌率99\.9%/g, "");
          });
          panel?.remove();
          showToast("已按产品库事实修正冲突内容");
        } else if (action === "modify") {
          const fieldName = panel?.dataset.fieldName;
          (dynamicForm.querySelector(`[data-field="${fieldName}"]`) || dynamicForm.querySelector("textarea, input"))?.focus();
        } else if (action === "update-product") {
          closeModal(true);
          openProductDetail(creationContext.productId || "mite-pro");
          showToast("请先更新产品信息，保存后再返回本次创作");
        }
        return;
      }
      const existingProduct = event.target.closest("[data-use-existing-product]");
      if (existingProduct) {
        applyProductToForm(existingProduct.dataset.useExistingProduct || "mite-pro", false, isStructuredCopyFlow());
        const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
        if (feedback) {
          feedback.hidden = false;
          feedback.className = "parse-state success";
          feedback.innerHTML = "<strong>已切换</strong><span>已带入产品库中的完整产品信息。</span>";
        }
        return;
      }
      const structureToggle = event.target.closest('[data-action="toggle-copy-structure-picker"]');
      if (structureToggle) {
        openCopyStructurePicker();
        return;
      }
      const singleModelToggle = event.target.closest("[data-single-model-trigger]");
      if (singleModelToggle) {
        singleModelToggle.closest("[data-single-model-picker]")?.classList.toggle("open");
        return;
      }
      const singleModelOption = event.target.closest("[data-single-model-option]");
      if (singleModelOption) {
        const selectedModel = copywritingModelCatalog.find(model => model.value === singleModelOption.dataset.singleModelOption);
        if (!selectedModel) return;
        modelSelect.value = selectedModel.value;
        renderModelPickerOptions();
        renderTaskModelStep();
        singleModelOption.closest("[data-single-model-picker]")?.classList.remove("open");
        showToast(`已切换为 ${selectedModel.label}`);
        return;
      }
      const openStyleEditor = event.target.closest("[data-add-rewrite-style]");
      if (openStyleEditor) {
        const editor = dynamicForm.querySelector("[data-rewrite-style-editor]");
        if (editor) {
          editor.hidden = false;
          editor.querySelector("[data-rewrite-style-input]")?.focus();
        }
        return;
      }
      const cancelStyleEditor = event.target.closest("[data-cancel-rewrite-style]");
      if (cancelStyleEditor) {
        const editor = cancelStyleEditor.closest("[data-rewrite-style-editor]");
        if (editor) {
          editor.hidden = true;
          const input = editor.querySelector("[data-rewrite-style-input]");
          if (input) input.value = "";
        }
        return;
      }
      const saveStyle = event.target.closest("[data-save-rewrite-style]");
      if (saveStyle) {
        const editor = saveStyle.closest("[data-rewrite-style-editor]");
        const input = editor?.querySelector("[data-rewrite-style-input]");
        const value = input?.value.trim() || "";
        if (!value) return showToast("请输入新的表达风格");
        const select = dynamicForm.querySelector("[data-rewrite-style-select]");
        if (![...rewriteBaseStyles, ...rewriteCustomStyles].includes(value)) {
          rewriteCustomStyles.push(value);
          select?.insertAdjacentHTML("beforeend", `<option>${escapeHtml(value)}</option>`);
        }
        if (select) select.value = value;
        editor.hidden = true;
        input.value = "";
        setFormFeedback(`已新增并选择表达风格“${value}”。`);
        showToast("表达风格已添加");
        return;
      }
      const taskModel = event.target.closest("[data-task-model]");
      if (taskModel) {
        modelSelect.value = taskModel.dataset.taskModel;
        renderModelPickerOptions();
        renderTaskModelStep();
        setFormFeedback(`已选择${selectedModelLabel()}。`);
        return;
      }
      const pointAction = event.target.closest("[data-point-action]");
      if (pointAction) {
        const editor = pointAction.closest("[data-point-editor]");
        const action = pointAction.dataset.pointAction;
        const row = pointAction.closest(".point-row");
        const limit = Number(editor?.dataset.limit || 0);
        if (action === "add") {
          const count = editor.querySelectorAll(".point-row").length;
          if (limit && count >= limit) return showToast(`最多添加 ${limit} 条`);
          pointAction.insertAdjacentHTML("beforebegin", pointRowHtml(""));
          pointAction.previousElementSibling?.querySelector("input")?.focus();
        }
        if (action === "remove") {
          if (editor.querySelectorAll(".point-row").length <= 1) row.querySelector("input").value = "";
          else row.remove();
        }
        if (action === "up" && row.previousElementSibling?.classList.contains("point-row")) row.parentElement.insertBefore(row, row.previousElementSibling);
        if (action === "down" && row.nextElementSibling?.classList.contains("point-row")) row.parentElement.insertBefore(row.nextElementSibling, row);
        syncPointEditor(editor);
        creationContext.productConfirmed = false;
        creationContext.productSaved = false;
        updateModalContext();
        return;
      }
      const aiSuggestion = event.target.closest("[data-ai-suggest]");
      if (aiSuggestion) {
        regenerateOriginalSuggestion(aiSuggestion.dataset.aiSuggest, aiSuggestion);
        return;
      }
      const sourceTab = event.target.closest("[data-product-source]");
      if (sourceTab) {
        setProductSource(sourceTab.dataset.productSource);
        return;
      }
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) {
        const action = actionButton.dataset.action;
        if (action === "toggle-reference-library") {
          openReferenceVideoPicker();
        }
        if (action === "toggle-reference-copy-library") openReferenceCopyPicker();
        if (action === "toggle-rewrite-copy-library") openRewriteLibraryPicker();
        if (action === "reset-reference-transcript") resetReferenceTranscript();
        if (action === "toggle-original-advanced") {
          setOriginalAdvanced(!actionButton.classList.contains("active"));
          captureOriginalContext();
        }
        if (action === "analyze-reference") analyzeReference();
        if (action === "recognize-product") recognizeLinkedProduct();
        if (action === "refine-selling-points") refineSellingPoints();
        if (action === "recommend-audience") {
          setActiveAudience(currentProduct().audiences);
          setFormFeedback(`已根据“${currentProduct().name}”推荐目标人群，可继续增删。`);
          showToast("AI推荐人群已更新");
        }
        if (action === "add-audience") {
          const input = dynamicForm.querySelector("[data-custom-audience]");
          const value = input?.value.trim();
          if (!value) {
            setFormFeedback("请输入需要添加的自定义人群。", "error");
          } else {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "audience-chip active";
            button.textContent = value;
            dynamicForm.querySelector("[data-audience-box]")?.append(button);
            input.value = "";
            setFormFeedback(`已添加自定义人群“${value}”。`);
          }
        }
        if (action === "save-preset") saveCreationPreset();
        return;
      }
      const marketingTag = event.target.closest("[data-marketing-value]");
      if (marketingTag) {
        marketingTag.classList.toggle("active");
        const textarea = dynamicForm.querySelector('[data-field="marketing"]');
        const selected = [...dynamicForm.querySelectorAll("[data-marketing-value].active")].map(item => item.dataset.marketingValue);
        if (textarea) textarea.value = selected.join("，");
        setFormFeedback(selected.length ? `已选择营销信息：${selected.join("、")}。` : "已清空营销快捷标签。");
        return;
      }
      const rewriteAudienceChip = event.target.closest(".rewrite-audience-chip");
      if (rewriteAudienceChip) {
        rewriteAudienceChip.closest("[data-rewrite-audience-box]")?.querySelectorAll(".rewrite-audience-chip").forEach(item => item.classList.remove("active"));
        rewriteAudienceChip.classList.add("active");
        activateAudienceDefault(rewriteAudienceChip.textContent.trim(), true);
        syncRewriteAudienceTarget();
        setFormFeedback(`改写后目标人群已切换为“${rewriteAudienceChip.textContent.trim()}”。`);
        return;
      }
      const audienceChip = event.target.closest(".audience-chip");
      if (audienceChip) {
        audienceChip.closest("[data-audience-box]")?.querySelectorAll(".audience-chip").forEach(item => item.classList.remove("active"));
        audienceChip.classList.add("active");
        activateAudienceDefault(audienceChip.textContent.trim(), false);
        setFormFeedback(`目标人群已更新为“${audienceChip.textContent.trim()}”，已初始化对应年龄与性别，可继续自定义年龄区间。`);
        return;
      }
      const uploadBox = event.target.closest(".upload-box");
      if (uploadBox) {
        uploadBox.classList.add("selected");
        uploadBox.innerHTML = uploadBox.matches("[data-reference-upload]")
          ? "<strong>参考视频已上传</strong><span>除螨仪爆款参考_01.mp4 · 已自动识别口播与内容结构</span>"
          : "<strong>已选择素材</strong><span>除螨仪产品参考素材_01 · 可点击重新选择</span>";
        if (uploadBox.matches("[data-reference-upload]")) {
          const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
          if (stepPanel) stepPanel.dataset.referenceReady = "true";
          const feedback = dynamicForm.querySelector("[data-reference-feedback]");
          if (feedback) {
            feedback.hidden = false;
            feedback.innerHTML = "<strong>识别完成</strong><span>已提取参考视频口播、钩子机制、内容结构和表达节奏。</span>";
          }
          showReferenceTranscript("upload", "这不吸真是不知道，家里床垫和沙发看起来很干净，实际还能吸出不少毛发、皮屑和灰尘。轻净 Pro 除螨仪拍打与吸尘同步完成，尘杯可拆下水洗，床垫、沙发和布艺都能使用，日常清洁更省事。");
        }
        setFormFeedback("素材已带入当前任务，生成时将用于锁定主体、场景或镜头逻辑。");
        showToast("素材选择成功");
        return;
      }
      const chip = event.target.closest(".choice-chip");
      if (!chip) return;
      const row = chip.closest(".choice-row");
      if (row?.dataset.single) {
        if ((row.dataset.role === "gender" || row.dataset.role === "rewrite-gender") && row.dataset.audienceLockedGender === "女性" && chip.textContent.trim() !== "女性") {
          showToast("“精致妈妈”的核心性别为女性，不支持改为男性或不限");
          return;
        }
        row.querySelectorAll(".choice-chip").forEach(item => item.classList.remove("active"));
        chip.classList.add("active");
        if (row.dataset.single === "rewrite-method") refreshRewriteSetting();
        if (row.dataset.single === "rewrite-gender" || row.dataset.single === "rewrite-age") syncRewriteAudienceTarget();
        if (row.dataset.role === "script-type") syncCopyStructureByScriptType(chip.textContent.trim());
        if (chip.matches("[data-custom-age-trigger]")) {
          const customAge = row.querySelector("[data-custom-age]");
          if (customAge) customAge.hidden = false;
        } else if (row?.dataset.role === "age") {
          const customAge = row.querySelector("[data-custom-age]");
          if (customAge) customAge.hidden = true;
        }
        if (chip.matches("[data-rewrite-custom-age-trigger]")) {
          const customAge = row.querySelector("[data-rewrite-custom-age]");
          if (customAge) customAge.hidden = false;
        } else if (row?.dataset.role === "rewrite-age") {
          const customAge = row.querySelector("[data-rewrite-custom-age]");
          if (customAge) customAge.hidden = true;
        }
        if (row?.dataset.role === "script-material-mode") return;
        renderMaterialScopeDetail(row, chip.textContent.trim());
        setFormFeedback(`已选择“${chip.textContent.trim()}”。`);
        return;
      }
      const limit = Number(row?.dataset.limit || 0);
      if (!chip.classList.contains("active") && limit && row.querySelectorAll(".choice-chip.active").length >= limit) {
        showToast(`最多选择 ${limit} 项`);
        return;
      }
      chip.classList.toggle("active");
      setFormFeedback(`${chip.textContent.trim()}已${chip.classList.contains("active") ? "选择" : "取消"}。`);
    });

    dynamicForm.addEventListener("input", event => {
      updateAdvancedFooterToggle();
      if (!event.target.matches("[data-product-link]")) return;
      creationContext.productConfirmed = false;
      const feedback = dynamicForm.querySelector("[data-recognition-feedback]");
      if (feedback) {
        feedback.hidden = true;
        feedback.className = "parse-state";
        feedback.innerHTML = "";
      }
    });
    dynamicForm.addEventListener("change", updateAdvancedFooterToggle);
    dynamicForm.addEventListener("click", () => requestAnimationFrame(updateAdvancedFooterToggle));

    dynamicForm.addEventListener("change", event => {
      if (event.target.matches("[data-mode-control]")) refreshConditionalSlots();
      if (event.target.matches("[data-mode-control]")) setFormFeedback(`已切换为“${event.target.options[event.target.selectedIndex].text}”，输入槽位已更新。`);
      if (event.target.matches("[data-reference-source]")) refreshReferenceSource();
      if (event.target.matches("[data-rewrite-source]")) refreshRewriteSource();
      if (event.target.matches("[data-product-select]")) applyProductToForm(event.target.value, true, isStructuredCopyFlow());
      if (event.target.matches("[data-creation-preset]")) applyCreationPreset(event.target.value);
    });

    dynamicForm.addEventListener("input", event => {
      if (event.target.matches("[data-reference-transcript]")) {
        const source = dynamicForm.querySelector("[data-reference-source]")?.value;
        if (referenceTranscriptState[source]) referenceTranscriptState[source].value = event.target.value;
      }
      if (event.target.matches("[data-rewrite-original]")) {
        const source = dynamicForm.querySelector("[data-rewrite-source]")?.value || "library";
        rewriteSourceState[source] = event.target.value;
      }
      if (event.target.matches("[data-word-count]")) refreshWordDuration(event.target);
      if (event.target.matches("[data-rewrite-age-min], [data-rewrite-age-max]")) syncRewriteAudienceTarget();
      if (event.target.matches("[data-point-value]")) syncPointEditor(event.target.closest("[data-point-editor]"));
      const aiSuggestionType = event.target.closest("[data-point-editor]")?.dataset.pointEditor
        || ({ pain:"pain", scenes:"scene" }[event.target.dataset.field]);
      if (aiSuggestionType) originalSuggestionDirty.add(originalSuggestionKey(aiSuggestionType));
      event.target.closest(".field")?.classList.remove("invalid");
      event.target.closest(".original-field")?.classList.remove("invalid");
      if (isStructuredCopyFlow() && event.target.matches('[data-field="core"], [data-field="secondary"], [data-field="difference"], [data-field="marketing"], [data-field="pain"], [data-field="scenes"], [data-manual-product-name], [data-point-value], [data-original-brand], [data-original-category]')) {
        creationContext.productSaved = false;
        creationContext.productConfirmed = false;
        updateModalContext();
      }
      if (activeType === "copy" && event.target.matches("[data-reference-value]")) {
        const stepPanel = dynamicForm.querySelector('[data-original-step="1"]');
        const source = dynamicForm.querySelector("[data-reference-source]")?.value;
        if (stepPanel) stepPanel.dataset.referenceReady = source === "text" && event.target.value.trim() ? "true" : "false";
        const feedback = dynamicForm.querySelector("[data-reference-feedback]");
        if (feedback) feedback.hidden = true;
      }
    });

    dynamicForm.addEventListener("keydown", event => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches(".upload-box")) event.target.click();
    });
    document.addEventListener("click", event => {
      if (!event.target.closest("[data-copy-structure-combobox]")) dynamicForm.querySelectorAll("[data-copy-structure-combobox]").forEach(item => item.classList.remove("open"));
      if (!event.target.closest("[data-single-model-picker]")) dynamicForm.querySelectorAll("[data-single-model-picker]").forEach(item => item.classList.remove("open"));
    });

    saveProductButton.addEventListener("click", saveProductToArchive);
    document.getElementById("confirmCreate").addEventListener("click", () => {
      if (!validateAgentForm()) return;
      showGeneratedResult(true);
    });
    sendPromptButton.addEventListener("click", () => {
      if (!activeAgent) return;
      if (activeType !== "chat" && !taskShell.classList.contains("show")) {
        openAgentTask();
        return;
      }
      if (activeType === "mix" && taskShell.classList.contains("show") && taskStep === 2) {
        const request = promptInput.value.trim();
        if (!request) return showToast("请输入需要调整的文案要求");
        submitMixCopyChat(request);
        return;
      }
      // 阶段2 H: 第三步 chat 4 能力
      if (activeType === "mix" && taskShell.classList.contains("show") && taskStep === 3) {
        const request = promptInput.value.trim();
        if (!request) return showToast("请输入需要让分镜助手执行的动作,例如:第 1 段拆成两段 / 优化第 2 段画面");
        submitMixScriptChat(request);
        return;
      }
      // 阶段2 H/J 镜像:智能脚本第三步 chat 4 能力
      if (activeType === "script" && taskShell.classList.contains("show") && taskStep === 3) {
        const request = promptInput.value.trim();
        if (!request) return showToast("请输入需要让脚本助手执行的动作,例如:把第 1 段拆成两段 / 优化第 2 段画面");
        submitScriptScriptChat(request);
        return;
      }
      if (activeType !== "chat" && !taskCompleted) {
        showToast("请先完成左侧步骤，生成结果后即可继续对话修改。");
        return;
      }
      showGeneratedResult(false);
    });

    newCreateButton.addEventListener("click", event => {
      event.stopPropagation();
      setNewCreateMenu(newCreatePopover.hidden);
    });
    newCreatePopover.querySelector(".new-create-close")?.addEventListener("click", () => setNewCreateMenu(false));
    newCreateOptions.forEach(option => option.addEventListener("click", () => {
      const targetPage = option.dataset.createPage;
      if (targetPage) {
        setNewCreateMenu(false);
        resetCreationWorkspace();
        createSessionSummaryRow(option.querySelector("strong")?.textContent?.trim() || "视频分析");
        switchPage(targetPage);
        return;
      }
      const card = agentCards.find(item => item.dataset.type === option.dataset.createAgentType);
      beginAgentCreation(card);
    }));
    window.addEventListener("resize", positionNewCreatePopover);
    document.querySelector("#page-creation .conversation-panel")?.addEventListener("scroll", positionNewCreatePopover, { passive:true });


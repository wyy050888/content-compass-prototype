    function generationTimestamp(date = new Date()) {
      const pad = value => String(value).padStart(2, "0");
      return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    }
    function generatedCopyName(timestamp = generationTimestamp()) {
      originalCopySequence += 1;
      return `${currentProduct().name}_${timestamp}_${originalCopySequence}`;
    }

    function appendOriginalCopyBatch(trigger) {
      if (trigger?.disabled) return;
      if (trigger) {
        trigger.disabled = true;
        trigger.textContent = "正在生成…";
      }
      const startIndex = originalTaskAssetIds.length;
      setTimeout(() => {
        const turnNumber = conversationTurnCount + 1;
        const messageId = `assistant-turn-${turnNumber}`;
        const batchTimestamp = generationTimestamp();
        const sourceItems = contextualCopy(activeType === "copy" ? "copy" : activeType === "rewrite" ? "rewrite" : "original", startIndex, 3);
        const newAssets = sourceItems.map(([direction, preview], index) => ({
          type:"copy",
          title:generatedCopyName(batchTimestamp),
          direction,
          preview,
          structureTags:activeCopyStructureTags(direction),
          wordCount:preview.replace(/\s/g, "").length,
          meta:activeType === "copy" ? `${direction} · 爆款方法重构 · 原创边界通过` : `${direction} · ${creationContext.originalFields.copyStructure || "不限"} · ${creationContext.originalFields.scriptType || "不限"}`,
          id:`session-asset-${++assetSequence}`,
          messageId,
          turnNumber,
          sourceType:activeType,
          sourceAssetId:"",
          model:selectedModelLabel(),
          saved:false
        }));
        const userTurn = document.createElement("div");
        userTurn.className = "message user";
        userTurn.textContent = "继续生成3条不同方向的文案";
        const assistantTurn = document.createElement("div");
        assistantTurn.className = "message assistant";
        assistantTurn.id = messageId;
        assistantTurn.dataset.agentType = activeType;
        assistantTurn.dataset.modelLabel = selectedModelLabel();
        assistantTurn.dataset.assetIds = newAssets.map(asset => asset.id).join(",");
        assistantTurn.innerHTML = `<div class="message-head"><strong>✦ ${escapeHtml(activeAgent)}</strong></div><p class="assistant-summary">已追加3条不同方向的${activeType === "copy" ? "原创仿写" : activeType === "rewrite" ? "定向改写" : "口播"}文案，已有结果未被覆盖。</p>`;
        chatOutput.append(userTurn, assistantTurn);
        sessionAssets.push(...newAssets);
        originalTaskAssetIds.push(...newAssets.map(asset => asset.id));
        conversationTurnCount += 1;
        agentTurnCounts[activeType] = (agentTurnCounts[activeType] || 0) + 1;
        renderOriginalTaskResult();
        renderSessionAssets();
        document.getElementById("taskChatSubtitle").textContent = "已同步追加一轮对话，可继续修改新生成的文案";
        requestAnimationFrame(() => {
          renderConversationLocator();
          chatOutput.scrollTo({ top:chatOutput.scrollHeight, behavior:"smooth" });
          taskResultHost.querySelector(`[data-asset-id="${newAssets[0].id}"]`)?.scrollIntoView({ behavior:"smooth", block:"start" });
        });
        showToast("已在下方追加3条文案");
      }, 520);
    }

    const guidedPromptMap = {
      chat: [
        ["帮我梳理一个产品的创作方向", "chat"],
        ["切换为智能文案生成口播", "original"],
        ["把已有文案转成分镜脚本", "script"]
      ],
      original: [
        ["只替换前3秒钩子，再生成3条", "rewrite"],
        ["把第2条转成30秒结构化脚本", "script"],
        ["保持卖点不变，改成宝妈人群表达", "original"]
      ],
      copy: [
        ["保留参考节奏，再换3种钩子", "copy"],
        ["把第1条转成可混剪脚本", "script"],
        ["不要沿用参考优惠，重新生成", "copy"]
      ],
      rewrite: [
        ["正文不变，再换3个强钩子", "rewrite"],
        ["把当前改写稿同步转成脚本", "script"],
        ["语气更硬，但不要增加新卖点", "rewrite"]
      ],
      script: [
        ["强化0—3秒的画面冲击", "script"],
        ["使用这份脚本直接智能混剪", "mix"],
        ["保留口播，只更换镜头设计", "script"]
      ],
      "script-copy": [
        ["保留镜头节奏，再换一个开场", "script-copy"],
        ["使用这份脚本直接智能混剪", "mix"],
        ["生成一条只换3秒钩子的延伸脚本", "script-copy"]
      ],
      mix: [
        ["只替换前3秒镜头重新混剪", "mix"],
        ["保留画面，换一版字幕包装", "mix"],
        ["基于当前主视频生成3条延伸视频", "mix"]
      ]
    };

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    const SCRIPT_MATERIAL_CATALOG = window.ScriptMaterialLib?.SCRIPT_MATERIAL_CATALOG;
    const SCRIPT_MATERIAL_SAMPLE_META = window.ScriptMaterialLib?.SCRIPT_MATERIAL_SAMPLE_META;
    const SCRIPT_MATERIAL_FOLDERS = window.ScriptMaterialLib?.SCRIPT_MATERIAL_FOLDERS;
    const allScriptMaterials = () => window.ScriptMaterialLib?.allScriptMaterials() || [];
    const findScriptMaterial = id => window.ScriptMaterialLib?.findScriptMaterial(id);

    function openScriptMaterialReplacement(assetId, rowIndex) {
      const asset = sessionAssets.find(item => item.id === assetId);
      if (!asset?.scriptRows?.[rowIndex]) return;
      const row = asset.scriptRows[rowIndex];
      const shotDuration = parseShotSeconds(row.time);
      const currentMaterialIds = (row.materialIds || []).filter(Boolean);
      // 1:1 复用混剪的素材多选选择器(支持多选,选完再决定 1 段直接套用 / 多段剪映式拼接)
      openScriptMaterialPicker({
        title: "替换镜头",
        selectedIds: currentMaterialIds,
        defaultSelectionHint: "可多选素材进行拼接,确认替换时仅使用已分析的素材;",
        onConfirm(ids) {
          const chosenIds = (Array.isArray(ids) ? ids : []).filter(Boolean);
          if (!chosenIds.length) return showToast("请至少选择 1 个镜头");
          const selectedMaterials = chosenIds.map(findScriptMaterial).filter(item => item?.status === "ok" || item?.status === "已分析");
          if (!selectedMaterials.length) return showToast("所选素材尚未分析");
          const totalDuration = selectedMaterials.reduce((sum, item) => sum + Math.max(1, Number(item.duration) || 0), 0);
          if (selectedMaterials.length > 1 && totalDuration > shotDuration) {
            // 多段拼接 + 走剪映式裁剪(用公共 openConcatTrimDialog)
            openScriptConcatTrimDialog(assetId, rowIndex, chosenIds, shotDuration, selectedMaterials);
            return;
          }
          // 单段或总时长没超 → 直接套用首个
          applyMaterialToScriptRow(row, selectedMaterials[0]);
          refreshScriptResultFromCurrent();
          showToast("已替换素材并同步更新镜头方案");
        }
      });
    }

    function materialShotFields(material) {
      const group = material?.group || "";
      if (group === "产品特写") return { shotType:"特写", cameraMove:"固定", scene:"产品台/桌面", subject:"产品细节", visual:`${material.name}，突出产品细节与可验证的使用结果。` };
      if (group === "产品全景") return { shotType:"全景", cameraMove:"平移跟拍", scene:"家庭真实场景", subject:"产品整体", visual:`${material.name}，展示真实家庭使用场景与产品整体动作。` };
      if (group === "使用场景") return { shotType:"中景", cameraMove:"推进", scene:"使用环境", subject:"用户操作过程", visual:`${material.name}，从环境推进至用户实际操作过程。` };
      if (group === "痛点对比") return { shotType:"近景", cameraMove:"固定", scene:"使用环境", subject:"问题/对比细节", visual:`${material.name}，清楚呈现问题或清洁前后差异。` };
      return { shotType:"全景", cameraMove:"拉远", scene:"品牌收口场景", subject:"品牌+产品", visual:`${material?.name || "品牌收口素材"}，完成品牌露出与行动引导。` };
    }

    function applyMaterialToScriptRow(row, material, crop = null) {
      if (!row || !material) return;
      Object.assign(row, materialShotFields(material), {
        materialOverride:material.id,
        materialIds:[material.id],
        materialCropStart: crop ? crop.start : null,
        materialCropEnd: crop ? crop.end : null,
        materialUseDuration: crop ? crop.duration : null
      });
    }

    function openScriptMaterialCropper(assetId, rowIndex, material, shotDuration) {
      const asset = sessionAssets.find(item => item.id === assetId);
      const row = asset?.scriptRows?.[rowIndex];
      if (!row || !material || material.duration <= shotDuration) return;
      const maxStart = Math.max(0, material.duration - shotDuration);
      let start = 0;
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.innerHTML = `<div class="modal-card script-crop-modal" role="dialog" aria-label="裁剪镜头素材"><header class="modal-head"><div><strong>裁剪镜头素材</strong><small>素材时长超过当前口播，请确定截取区间</small></div><button class="modal-close" type="button" data-crop-close>×</button></header><div class="script-crop-body"><div class="script-crop-preview"><span>${escapeHtml(material.id)}</span><div><strong>${escapeHtml(material.name)}</strong><small>${escapeHtml(material.scene)} · 9:16 · 原时长 ${material.duration.toFixed(1)}s</small></div></div><label>裁剪起点<input type="range" min="0" max="${maxStart}" step="0.1" value="0" data-crop-range></label><div class="script-crop-range"><span data-crop-start>00.0s</span><b data-crop-duration>固定截取 ${shotDuration.toFixed(1)}s</b><span data-crop-end>${shotDuration.toFixed(1)}s</span></div></div><footer class="modal-foot"><div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-crop-close>取消</button><button class="primary-btn" type="button" data-crop-confirm>确认裁剪并替换</button></div></footer></div>`;
      document.body.appendChild(overlay);
      const range = overlay.querySelector("[data-crop-range]");
      const startLabel = overlay.querySelector("[data-crop-start]");
      const endLabel = overlay.querySelector("[data-crop-end]");
      const render = () => {
        start = Number(range.value);
        startLabel.textContent = `${start.toFixed(1)}s`;
        endLabel.textContent = `${(start + shotDuration).toFixed(1)}s`;
      };
      range.addEventListener("input", render);
      overlay.addEventListener("click", event => { if (event.target === overlay || event.target.matches("[data-crop-close]")) overlay.remove(); });
      overlay.querySelector("[data-crop-confirm]").addEventListener("click", () => {
        applyMaterialToScriptRow(row, material, { start, end:start + shotDuration, duration:shotDuration });
        overlay.remove();
        renderScriptTaskResult({ summary:"已裁剪并替换镜头素材，同步更新景别、运镜与画面描述。" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
        const tabIndex = scriptTaskAssetIds.indexOf(asset.id);
        if (tabIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${tabIndex}"]`)?.click();
        showToast("已裁剪素材并同步更新镜头方案");
      });
      render();
    }

    // 1:1 镜像 runMixRowRematch:卡片上展示 3s 进度条 → 完成后自动应用新素材 + toast(不弹 dialog)
    function switchScriptShotGroup(assetId, rowIndex) {
      const asset = sessionAssets.find(item => item.id === assetId);
      const row = asset?.scriptRows?.[rowIndex];
      if (!row || asset.materialMode !== "depend") return;
      if (!taskResultHost._scriptRowRematching) taskResultHost._scriptRowRematching = {};
      if (taskResultHost._scriptRowRematching[rowIndex]) return; // 防重复点击
      // 取该 asset 已选素材(同混剪端 mixSelectedMaterials 的语义)。
      // 注意:script 端素材的 status 字段是 "ok|analyzing|pending|fail",不是混剪端的"已分析",所以不过滤
      const materials = asset.materialIds?.length ? asset.materialIds.map(findScriptMaterial).filter(Boolean) : allScriptMaterials();
      if (!materials.length) return showToast("当前素材分组暂无可匹配镜头");
      // 标记进入 rematch 状态 → 重渲染时模板自动给 bar 加 is-rematch-running class,CSS @keyframes 立即跑 3s 动画
      taskResultHost._scriptRowRematching[rowIndex] = true;
      renderScriptTaskResult({ summary:"正在为该段匹配新镜头…" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
      // 3s 后自动应用新素材 + toast(完全照搬混剪 runMixRowRematch 3s 后的行为,不弹 dialog)
      setTimeout(() => {
        let picked = null;
        try {
          const candidates = materials.filter(item => mixStageMatchesMaterial(row.stage, item));
          const pool = candidates.slice(0, 4);
          picked = pool[0] || materials[0];
          // 1:1 镜像混剪:只写 override(混剪端也只写 root._mixRowOverrides 一行,这里挂到 taskResultHost)
          if (picked) {
            taskResultHost._scriptRowMaterialOverrides = taskResultHost._scriptRowMaterialOverrides || {};
            taskResultHost._scriptRowMaterialOverrides[rowIndex] = [picked.id];
          }
        } catch (e) {
          console.error("[switchScriptShotGroup] 选素材失败:", e);
        }
        // 进度条收尾必须执行(放在 try/catch 外,防止前面 throw 把 delete 跳过、进度条卡在 AI 换镜中…)
        if (!taskResultHost._scriptRowNeedsRematch) taskResultHost._scriptRowNeedsRematch = new Set();
        taskResultHost._scriptRowNeedsRematch.delete(rowIndex);
        delete taskResultHost._scriptRowRematching?.[rowIndex];
        try {
          renderScriptTaskResult({ summary:"已重新匹配镜头。" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
        } catch (e) {
          console.error("[switchScriptShotGroup] 重渲染失败:", e);
        }
        showToast(picked ? `已重新匹配镜头:${picked.name || "AI 推荐"}` : "暂无可匹配的素材,镜头未变化");
      }, 3000);
    }

    // 1:1 镜像 openMixRowRematchDialog:候选素材弹窗 → 选一个 → 1s 模拟 loading → 替换
    function openScriptRowRematchDialog(assetId, rowIndex, card) {
      const asset = sessionAssets.find(item => item.id === assetId);
      const row = asset?.scriptRows?.[rowIndex];
      if (!asset || !row) return;
      const pool = (asset.materialIds?.length ? asset.materialIds.map(findScriptMaterial).filter(Boolean) : allScriptMaterials())
        .filter(material => mixStageMatchesMaterial(row.stage, material))
        .slice(0, 4);
      if (!pool.length) return showToast("当前素材分组暂无可匹配镜头");
      let selectedId = pool[0]?.id || "";
      const overlay = createMixDialog({
        title:"重新匹配镜头",
        subtitle:"",
        label:"重新匹配镜头",
        body:`<div class="mix-rematch-dialog-body">
          <p class="mix-rematch-prompt" style="margin:0;color:#4c505d;font-size:14px">请确认是否重新匹配镜头？</p>
          <div class="mix-rematch-candidates" data-mix-rematch-candidates hidden></div>
          <div class="mix-rematch-loading" data-mix-rematch-loading hidden>
            <span class="mix-rematch-spinner" aria-hidden="true"></span>
            <strong>正在匹配镜头…</strong>
            <small>系统正在根据画面描述匹配景别、运镜和素材</small>
          </div>
          <div class="mix-rematch-status" data-mix-rematch-status hidden></div>
        </div>`,
        footer:`<div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-mix-confirm-rematch>确认</button></div>`
      });
      const candidateHost = overlay.querySelector("[data-mix-rematch-candidates]");
      const loadingHost = overlay.querySelector("[data-mix-rematch-loading]");
      const statusHost = overlay.querySelector("[data-mix-rematch-status]");
      const promptEl = overlay.querySelector(".mix-rematch-prompt");
      const confirmBtn = overlay.querySelector("[data-mix-confirm-rematch]");
      const footActions = overlay.querySelector(".modal-foot-actions");
      const renderCandidates = () => {
        candidateHost.innerHTML = pool.map((item, i) => `<button type="button" class="mix-rematch-candidate${item.id === selectedId ? " selected" : ""}" data-mix-rematch-candidate="${escapeHtml(item.id)}"><span class="mix-rematch-cover tone-${(rowIndex + i) % 6 + 1}">${escapeHtml(item.scene)}</span><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · ${item.duration}s 可用</small></span><i>${item.id === selectedId ? "✓" : ""}</i></button>`).join("");
        candidateHost.querySelectorAll("[data-mix-rematch-candidate]").forEach(btn => btn.addEventListener("click", () => {
          selectedId = btn.dataset.mixRematchCandidate;
          renderCandidates();
        }));
      };
      const enterLoading = () => {
        promptEl.hidden = true;
        candidateHost.hidden = true;
        loadingHost.hidden = false;
        statusHost.hidden = true;
        footActions.querySelectorAll("button").forEach(button => { button.disabled = true; });
      };
      const enterFailed = msg => {
        promptEl.hidden = true;
        candidateHost.hidden = true;
        loadingHost.hidden = true;
        statusHost.hidden = false;
        statusHost.className = "mix-rematch-status is-failed";
        statusHost.innerHTML = `<span class="mix-rematch-status-icon" aria-hidden="true">✕</span><div><b>匹配失败</b><p>${escapeHtml(msg)}</p></div>`;
        footActions.innerHTML = `<button class="primary-btn" type="button" data-close>关闭</button>`;
      };
      const enterSuccess = () => {
        promptEl.hidden = true;
        candidateHost.hidden = true;
        loadingHost.hidden = true;
        statusHost.hidden = false;
        statusHost.className = "mix-rematch-status is-success";
        statusHost.innerHTML = `<span class="mix-rematch-status-icon" aria-hidden="true">✓</span><div><b>匹配成功</b><p>已为本段应用推荐镜头。</p></div>`;
        footActions.innerHTML = `<button class="primary-btn" type="button" data-close>完成</button>`;
      };
      confirmBtn.addEventListener("click", () => {
        if (!selectedId) {
          enterFailed("当前已选素材中没有符合画面描述的镜头，请手动替换镜头。");
          return;
        }
        enterLoading();
        setTimeout(() => {
          if (!overlay.isConnected) return;
          if (!pool.length) {
            enterFailed("当前已选素材中没有符合条件的镜头。");
            return;
          }
          const picked = pool.find(material => material.id === selectedId) || pool[0];
          applyMaterialToScriptRow(row, picked);
          enterSuccess();
          setTimeout(() => {
            if (!overlay.isConnected) return;
            overlay.remove();
            renderScriptTaskResult({ summary:"已为当前镜头匹配一组新的素材与画面方案。" }, scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean));
            showToast("已更新素材、景别、运镜与画面描述");
          }, 500);
        }, 1000);
      });
      renderCandidates();
    }

    // 构造一个镜头时长 = 镜头总时长 的推荐素材方案(委托至 window.ScriptMaterialLib 共享池)
    const buildMaterialPlan = (shotDuration, groupIds) => window.ScriptMaterialLib?.buildMaterialPlan(shotDuration, groupIds) || [];

    const completeScriptRows = [
      {
        id: 1,
        time: "00—03s",
        shotType: "特写",
        cameraMove: "固定",
        voice: "刚换的床单，也能吸出一杯脏东西。",
        visual: "先给结果：透明尘杯脏污特写；0.8秒后切到整洁床面，形成干净与脏污的视觉反差。",
        scene: "卧室床面",
        subject: "透明尘杯",
        subtitle: "刚换床单 ≠ 床垫干净",
        execution: "竖屏近景；尘杯居中；前1秒必须出现脏污证据；无合适素材时进入补拍清单。",
        videoPrompt: "透明尘杯特写,内部可见毛发与碎屑,自然光,竖屏9:16,产品居中,镜头固定,3秒。",
        materialIds: ["M-PC-401"],
        materialOverride: "M-PC-401"
      },
      {
        id: 2,
        time: "03—06s",
        shotType: "特写",
        cameraMove: "推进",
        voice: "看得见的是表面，看不见的都藏在床垫深处。",
        visual: "手掌按压床垫，接床垫纤维微距和毛发碎屑特写，画面由整洁逐步推进到细节。",
        scene: "卧室床垫表面",
        subject: "床垫纤维+毛发碎屑",
        subtitle: "毛发、碎屑藏在织物深处",
        execution: "中景转微距；2个镜头；每镜1.5秒；素材检索词：床垫按压、纤维、毛发碎屑。",
        videoPrompt: "床垫纤维微距,毛发碎屑清晰可见,镜头从中景缓慢推进到特写,自然卧室光,3秒。"
      },
      {
        id: 3,
        time: "06—10s",
        shotType: "中景",
        cameraMove: "平移跟拍",
        voice: "轻净 Pro 一边拍打一边吸，把深处的脏东西直接带出来。",
        visual: "真人手持产品在床垫上匀速推进，补充机器底部与床面接触的近景，展示真实使用过程。",
        scene: "卧室床垫",
        subject: "真人+产品",
        subtitle: "边拍边吸｜深层清洁",
        execution: "真人实拍优先；产品型号必须清晰；禁止使用其他型号或无法确认型号的镜头。",
        videoPrompt: "真人手持轻净 Pro 在床垫表面匀速推进,镜头从侧面平移跟拍,4秒,真实使用感。",
        materialIds: ["M-SC-301"],
        materialOverride: "M-SC-301"
      },
      {
        id: 4,
        time: "10—14s",
        shotType: "近景",
        cameraMove: "推进",
        voice: "推过的地方，毛发和细小碎屑都会进到透明尘杯里。",
        visual: "床面推进镜头与尘杯内部变化交叉剪辑，最后停留在吸入后的尘杯结果。",
        scene: "卧室床垫",
        subject: "尘杯内部+床面",
        subtitle: "脏东西看得见",
        execution: "使用前后结果必须来自同一产品；推进、吸入、尘杯三镜头按因果顺序排列。",
        videoPrompt: "透明尘杯内部变化过程,毛发碎屑逐渐累积,镜头固定在尘杯近景,4秒,竖屏。",
        materialIds: ["M-CL-101"],
        materialOverride: "M-CL-101"
      },
      {
        id: 5,
        time: "14—18s",
        shotType: "全景",
        cameraMove: "平移跟拍",
        voice: "床垫、沙发和布艺座椅，都能顺手清理。",
        visual: "床垫、沙发、布艺椅三个真实家庭场景快切，每个场景展示一次完整接触与推进动作。",
        scene: "卧室+客厅布艺",
        subject: "产品+布艺家具",
        subtitle: "一机清洁多种布艺场景",
        execution: "3个场景各1.2—1.4秒；场景光线与产品颜色保持一致；避免重复使用同一动作镜头。",
        videoPrompt: "床垫、沙发、布艺椅三个真实家庭场景快切,每个1.3秒,镜头平移跟拍,4秒。",
        materialIds: ["M-PF-202"],
        materialOverride: "M-PF-202"
      },
      {
        id: 6,
        time: "18—22s",
        shotType: "中景",
        cameraMove: "固定",
        voice: "机身握持轻松，日常拿出来用，不需要复杂准备。",
        visual: "单手拿取产品、放到床面、启动使用，连续呈现从拿取到清洁的完整动作。",
        scene: "卧室床边",
        subject: "真人+产品",
        subtitle: "拿起就能用",
        execution: "连续动作优先；不做无法由产品档案证明的重量或省力对比；保留真实环境声作转场。",
        videoPrompt: "单手拿起轻净 Pro,放至床面,启动使用,连续动作,镜头中景固定,4秒。",
        materialIds: ["M-CL-103"],
        materialOverride: "M-CL-103"
      },
      {
        id: 7,
        time: "22—26s",
        shotType: "特写",
        cameraMove: "固定",
        voice: "清理完拆下尘杯，直接冲洗，下一次用也更省心。",
        visual: "关闭机器、拆下尘杯、倒出脏污、清水冲洗四个动作依次展示。",
        scene: "厨房/洗手台",
        subject: "尘杯+水流",
        subtitle: "可拆尘杯｜清洗方便",
        execution: "动作顺序不可打乱；涉及水洗的部件必须与产品说明一致；画面增加操作步骤小字。",
        videoPrompt: "关闭机器、拆下尘杯、倒出脏污、清水冲洗,四个动作依次展示,特写固定,4秒。",
        materialIds: ["M-CL-102"],
        materialOverride: "M-CL-102"
      },
      {
        id: 8,
        time: "26—30s",
        shotType: "全景",
        cameraMove: "拉远",
        voice: "别只换床单，床垫也该认真清理一次。点击了解轻净 Pro。",
        visual: "干净床面全景，产品摆放在画面右侧；随后出现产品名、核心卖点和点击引导。",
        scene: "卧室床面全景",
        subject: "产品+干净床面",
        subtitle: "轻净 Pro｜给床垫做一次深层清洁",
        execution: "品牌收口4秒；产品不得被字幕遮挡；CTA使用平台允许表达；最后0.5秒保留安全尾帧。",
        videoPrompt: "干净床面全景,产品摆放在画面右侧,镜头缓慢拉远,4秒,品牌角标+CTA。",
        materialIds: ["M-AT-503"],
        materialOverride: "M-AT-503"
      }
    ];


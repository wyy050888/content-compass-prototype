
    // 混剪 loading 阶段:右下角操作区只保留"上一步",隐藏主按钮与"重新匹配全部"
    function setMixLoadingActions(loading) {
      if (!taskActionButtons) return;
      taskActionButtons.querySelectorAll(".primary-btn, .task-rematch-all-button").forEach(btn => { btn.hidden = loading; });
    }

    // 阶段1 G: 智能混剪进入第三步时的 loading + 逐条出现
    function renderMixScriptLoading() {
      const host = dynamicForm.querySelector("[data-mix-script-list]");
      if (!host) return;
      setMixLoadingActions(true);
      // 进入 loading 阶段先把"段落待完善"提示隐藏,等真实分镜完成后再重算
      const alert = dynamicForm.querySelector("[data-mix-script-alert]");
      if (alert) { alert.hidden = true; alert.innerHTML = ""; }
      // loading 阶段也不应禁用"确认脚本"按钮
      const next = taskActionButtons?.querySelector(".primary-btn");
      if (next) next.disabled = true;
      if (taskActionNote) taskActionNote.textContent = "正在分镜,稍候…";
      const steps = [
        { title: "AI 正在分镜", sub: "根据口播与素材分析结果,切分镜头分段…" },
        { title: "正在匹配镜头", sub: "按景别 / 运镜 / 场景匹配最佳素材…" },
        { title: "正在校准时长", sub: "按配音语速重新分配每段时长…" },
        { title: "分镜完成", sub: "即将展示结果,可继续用对话调整" }
      ];
      host.innerHTML = `<div class="mix-script-loading">
        <div class="mix-spinner"></div>
        <ol class="mix-loading-steps" data-mix-loading-steps>${steps.map((s, i) => `<li data-mix-step="${i}"><span class="mix-loading-step-dot"></span><div class="mix-loading-step-text"><b>${s.title}</b><small>${s.sub}</small></div></li>`).join("")}</ol>
      </div>`;
      const stepNodes = host.querySelectorAll("[data-mix-step]");
      stepNodes.forEach((n, i) => { if (i === 0) n.classList.add("is-active"); });
      steps.forEach((_, i) => {
        setTimeout(() => {
          if (i > 0) stepNodes[i - 1]?.classList.replace("is-active", "is-done");
          if (i < steps.length - 1) stepNodes[i]?.classList.add("is-active");
        }, i * 350);
      });
      const total = mixScriptSegments().length || 5;
      setTimeout(() => {
        renderMixScript();
        setMixLoadingActions(false);
        const cards = host.querySelectorAll(".mix-script-card");
        cards.forEach((card, i) => {
          card.classList.add("is-entering");
          card.style.animationDelay = `${i * 90}ms`;
        });
        updateMixScriptCompletion();
        // 自动展开"有问题"的分镜卡(口播缺失 / 镜头未匹配 / needs-rematch),
        // 让用户进 Step 3 一眼能看到是哪几段,不用挨个点"展开"
        const segments = mixScriptSegments();
        host.querySelectorAll(".mix-script-card").forEach((card, i) => {
          const seg = segments[i];
          const isProblem = !seg || !seg.complete;
          if (isProblem) {
            const body = card.querySelector(".mix-script-body");
            if (body && body.hidden) {
              body.hidden = false;
              const toggle = card.querySelector("[data-mix-toggle-row]");
              if (toggle) toggle.textContent = "收起";
            }
          }
        });
        const counter = dynamicForm.querySelector("[data-mix-script-count]");
        if (counter) counter.textContent = String(total);
      }, 1200);
    }

    // 智能脚本 Agent:提交生成,先切到步骤 3 显示 spinner,2 秒后调 showTaskResult
    function submitScriptGeneration() {
      captureScriptContext();
      setTaskStep(3);
      // 在结果容器里显示 4 步生成中(对齐智能混剪第三步 loading)
      const resultCard = dynamicForm.querySelector("[data-script-result-card]");
      if (resultCard) {
        const isFree = (creationContext.script?.materialMode || "depend") === "free";
        const steps = [
          { title: "AI 正在拆解产品卖点", sub: "把口播与产品事实拆为可拍摄单元…" },
          { title: "正在切分镜头分段", sub: "按总时长、运镜与景别切分每个分镜…" },
          isFree
            ? { title: "正在生成生视频提示词", sub: "按主体 / 场景 / 镜头 / 运镜生成结构化提示词…" }
            : { title: "正在匹配推荐素材", sub: "按场景 / 景别 / 运镜匹配最佳素材…" },
          { title: "正在校准口播时长", sub: "按语速重新分配每段口播与画面时长…" }
        ];
        resultCard.innerHTML = `<div class="mix-script-loading">
          <div class="mix-spinner"></div>
          <ol class="mix-loading-steps" data-mix-loading-steps>${steps.map((s, i) => `<li data-mix-step="${i}"><span class="mix-loading-step-dot"></span><div class="mix-loading-step-text"><b>${s.title}</b><small>${s.sub}</small></div></li>`).join("")}</ol>
        </div>`;
        const stepNodes = resultCard.querySelectorAll("[data-mix-step]");
        stepNodes.forEach((n, i) => { if (i === 0) n.classList.add("is-active"); });
        steps.forEach((_, i) => {
          setTimeout(() => {
            if (i > 0) stepNodes[i - 1]?.classList.replace("is-active", "is-done");
            if (i < steps.length - 1) stepNodes[i]?.classList.add("is-active");
          }, i * 350);
        });
      }
      setTimeout(() => {
        const response = { summary: "本次分镜脚本已生成，可在右侧继续对话修改" };
        const assets = generateScriptAssets();
        sessionAssets.push(...assets);
        renderSessionAssets();
        appendScriptGenerationTurn(response.summary, assets);
        showTaskResult(response, assets);
      }, 1600);
    }

    function appendScriptGenerationTurn(summary, assets) {
      const turnNumber = conversationTurnCount + 1;
      const request = `生成 ${assets.length} 个${creationContext.script?.duration || 60}s 分镜脚本`;
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = request;
      const assistantTurn = document.createElement("div");
      assistantTurn.className = "message assistant";
      assistantTurn.id = `assistant-turn-${turnNumber}`;
      assistantTurn.dataset.agentType = "script";
      assistantTurn.dataset.assetIds = assets.map(asset => asset.id).join(",");
      assistantTurn.innerHTML = `<div class="message-head"><strong>✦ 智能脚本</strong></div><p class="assistant-summary">${escapeHtml(summary)}</p>`;
      chatOutput.append(userTurn, assistantTurn);
      chatOutput.classList.add("show");
      conversationTurnCount += 1;
      agentTurnCounts.script = (agentTurnCounts.script || 0) + 1;
      requestAnimationFrame(() => chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" }));
    }

    // 模拟生成多版本脚本(命名规范:产品名_脚本_yyyyMMddHHmmss_N)
    function generateScriptAssets() {
      const ctx = creationContext.script || {};
      const product = productCatalog[ctx.product] || { ...currentProduct(), name: ctx.productName || currentProduct().name };
      const versionCount = ctx.version || 1;
      const ts = formatScriptTimestamp();
      const anglePool = ["钩子强化+结果直给", "痛点加深+场景前置", "对比放大+卖点集中", "实测演示+信任背书", "悬念揭秘+情绪升级"];
      const rhythmPool = ["紧凑冲击", "舒缓代入", "对比反转", "渐进揭秘"];
      const sourceSentences = String(ctx.sourceText || "").split(/[。！？!?]/).map(item => item.trim()).filter(Boolean);
      const baseRows = completeScriptRows.map((row, index) => ({ ...row, voice: sourceSentences[index] || row.voice }));
      return Array.from({ length: versionCount }, (_, idx) => {
        const id = `${product.name}_脚本_${ts}_${idx + 1}`;
        return {
          id,
          title: id,
          versionLabel: `V${idx + 1}`,
          versionAngle: anglePool[idx % anglePool.length],
          versionRhythm: rhythmPool[idx % rhythmPool.length],
          ratio: ctx.ratio || "9:16",
          meta: `${ctx.ratio || "9:16"} · ${ctx.duration || 30}s · ${ctx.voice || "未选择配音"} · ${(ctx.materialGroups || []).length} 个素材分组`,
          materialMode: ctx.materialMode,
          materialIds: ctx.materialIds || [],
          materialGroups: ctx.materialGroups || [],
          scriptRows: baseRows.map((row, rIdx) => ({
            ...row,
            rowId: `${id}-r${rIdx + 1}`
          })),
          saved: false
        };
      });
    }

    function formatScriptTimestamp() {
      const d = new Date();
      const pad = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    function activeCreationSessionTitle() {
      return document.querySelector("#page-creation .chat-row.active strong")?.textContent.trim() || "未命名创作";
    }

    function syncTaskChatTitle() {
      const title = document.getElementById("taskChatTitle");
      if (title) title.textContent = activeCreationSessionTitle();
    }

    function adjustMixCopyByChat(request) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const source = mixEffectiveCopy(root);
      const sentences = source.match(/[^。！？!?]+[。！？!?]?/g)?.map(item => item.trim()).filter(Boolean) || [];
      const normalized = request.replace(/\s/g, "");
      let next = source;
      if (/短|精简|缩短|控制时长/.test(normalized)) {
        next = sentences.slice(0, 4).join("");
        if (next.length > 120) next = `${next.slice(0, 116)}。`;
      } else if (/开头|钩子|前3秒|前三秒/.test(normalized)) {
        next = `先看真实清洁结果，再看产品怎么做到。${sentences.slice(1).join("") || source}`;
      } else if (/口语|自然|更像人说/.test(normalized)) {
        next = source.replace(/不代表/g, "不一定").replace(/能够/g, "能").replace(/进行/g, "做").replace(/可以/g, "能");
      } else if (/结尾|行动引导|CTA|点击/.test(normalized)) {
        next = `${source.replace(/点击商品[^。！？!?]*[。！？!?]?$/, "").trim()} 点击商品，查看完整实测。`;
      } else {
        next = generateMixCopyRewrite(source);
      }
      return next.trim();
    }

    // ── 阶段2 H: 第三步对话 4 能力 ────────────────────────────────────────
    function injectMixQuickChips(isScriptStep) {
      const composer = document.getElementById("taskComposerHost") || promptInput?.closest?.(".composer")?.parentElement;
      const anchor = promptInput?.closest?.(".composer") || document.getElementById("taskComposerHost");
      if (!anchor) return;
      const existing = anchor.querySelector(":scope > .mix-composer-quick");
      if (existing) existing.remove();
      if (!isScriptStep) return;
      const wrap = document.createElement("div");
      wrap.className = "mix-composer-quick";
      wrap.innerHTML = `
        <button type="button" class="mix-quick-chip" data-mix-quick="split" title="把当前选中行拆成两段">拆成两段</button>
        <button type="button" class="mix-quick-chip" data-mix-quick="merge" title="把当前行和下一行合并">合并上下段</button>
        <button type="button" class="mix-quick-chip" data-mix-quick="optimize" title="让 AI 改写当前行的画面描述">优化画面</button>
        <button type="button" class="mix-quick-chip" data-mix-quick="diagnose" title="解释为什么是这个镜头">为什么选这个</button>
      `;
      anchor.insertBefore(wrap, promptInput.closest(".composer") || anchor.firstChild);
      wrap.addEventListener("click", event => {
        const btn = event.target.closest("[data-mix-quick]");
        if (!btn) return;
        const sampleMap = {
          split: "把第 1 段拆成两段",
          merge: "把第 1 段和第 2 段合并",
          optimize: "优化第 1 段画面",
          diagnose: "为什么第 1 段选这个镜头"
        };
        const sample = sampleMap[btn.dataset.mixQuick] || "";
        if (!promptInput) return;
        promptInput.value = sample;
        promptInput.focus();
      });
    }

    function appendMixUserTurn(text) {
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = text;
      chatOutput.append(userTurn);
    }

    function appendMixAssistantTurn(html) {
      const turn = document.createElement("div");
      turn.className = "message assistant";
      turn.dataset.agentType = "mix";
      turn.innerHTML = `<div class="message-head"><strong>✦ 智能混剪</strong></div>${html}`;
      chatOutput.append(turn);
      conversationTurnCount += 1;
      agentTurnCounts.mix = (agentTurnCounts.mix || 0) + 1;
      renderConversationLocator();
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
    }

    function detectMixScriptIntent(text) {
      const t = (text || "").replace(/\s/g, "");
      // 提取显式 index: "第 3 段" / "第3段" / "3 段"
      const explicit = t.match(/第?\s*(\d{1,2})\s*段/);
      let explicitIdx = explicit ? Math.max(0, parseInt(explicit[1], 10) - 1) : null;
      if (/拆/.test(t)) return { kind: "split", explicitIdx };
      if (/合/.test(t) || /并入|并到|合并到|合并到第/.test(t)) return { kind: "merge", explicitIdx };
      if (/优化|改写|重写|画面.*改|改.*画面/.test(t)) return { kind: "optimize", explicitIdx };
      if (/重新匹配|换个?镜头|再匹配|换.*镜头/.test(t)) return { kind: "rematch", explicitIdx };
      if (/为什么|解释|说明|匹配.*原因|怎么选/.test(t)) return { kind: "diagnose", explicitIdx };
      return { kind: "fallback", explicitIdx };
    }

    function pickMixTargetRow(segs, explicitIdx) {
      if (explicitIdx != null && explicitIdx >= 0 && explicitIdx < segs.length) return explicitIdx;
      // 缺省:优先 needs-rematch,否则最后段,再退到 0
      const flagged = segs.findIndex(s => s.needsRematch);
      if (flagged >= 0) return flagged;
      return Math.max(0, segs.length - 1);
    }

    function handleMixSplit(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      root._mixRowSplit = root._mixRowSplit || new Map();
      root._mixInsertedSegments = root._mixInsertedSegments || [];
      root._mixRowFlag = root._mixRowFlag || new Set();
      // 拆 _origIndex(0-based),在前段之后插入新行
      root._mixRowSplit.set(seg._origIndex, { mode: "half" });
      root._mixInsertedSegments.push({
        afterIndex: seg._origIndex,
        stage: "新分镜",
        copy: "",
        visual: "请补充该分镜的画面内容描述",
        _dropOnDelete: true
      });
      root._mixRowInserted?.add?.(seg._origIndex);
      root._mixRowFlag.add(seg._origIndex);
      renderMixScript();
      appendMixAssistantTurn(`<p class="assistant-summary">已把第 ${idx + 1} 段按句号切分为两段,新分镜默认口播为空,可在卡片底部补全。</p>`);
    }

    function handleMixMerge(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const next = segs[idx + 1];
      if (!next) return appendMixAssistantTurn(`<p class="assistant-summary">第 ${idx + 1} 段已是末段,无法向下合并。请选前面的段,或合并到上一段。</p>`);
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      root._mixRowMergedCopy = root._mixRowMergedCopy || {};
      root._mixRowDeleted = root._mixRowDeleted || new Set();
      root._mixRowFlag = root._mixRowFlag || new Set();
      const mergedCopy = (seg.copy || "") + (next.copy || "");
      root._mixRowMergedCopy[seg._origIndex] = mergedCopy;
      root._mixRowDeleted.add(next._origIndex);
      root._mixRowFlag.add(seg._origIndex);
      // 同步清掉被合行的 overrides
      if (root._mixRowOverrides) delete root._mixRowOverrides[next._origIndex];
      if (root._mixRowVisualOverrides) delete root._mixRowVisualOverrides[next._origIndex];
      if (root._mixRowMaterialDurations) delete root._mixRowMaterialDurations[next._origIndex];
      renderMixScript();
      appendMixAssistantTurn(`<p class="assistant-summary">已把第 ${idx + 1} 段和第 ${idx + 2} 段合并,合并后继承前段口播/画面/镜头,总时长已重算。</p>`);
    }

    function handleMixOptimize(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      appendMixAssistantTurn(`<p class="assistant-summary">正在改写第 ${idx + 1} 段画面描述,镜头匹配状态会同步刷新…</p>`);
      setTimeout(() => {
        const origVisual = (seg.visual || "暂无").trim();
        const enhanced = `${origVisual} · 镜头推进自然,主体居中,光影柔和,关键细节特写`;
        root._mixRowVisualOverrides = root._mixRowVisualOverrides || {};
        // visual 存的是渲染位置 index,不是 origIndex
        root._mixRowVisualOverrides[idx] = enhanced;
        if (seg._origIndex >= 0) root._mixRowNeedsRematch?.delete?.(seg._origIndex);
        renderMixScript();
        appendMixAssistantTurn(`<p class="assistant-summary">已用 AI 改写第 ${idx + 1} 段画面描述,镜头匹配状态已重置。</p>`);
      }, 800);
    }

    function handleMixDiagnose(idx, segs) {
      const seg = segs[idx];
      if (!seg) return appendMixAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const m = seg.assigned?.[0];
      const visualShort = (seg.visual || "").slice(0, 30);
      if (m) {
        appendMixAssistantTurn(`<div class="message-head"><strong>✦ 智能混剪</strong></div>
          <p class="assistant-summary">第 ${idx + 1} 段匹配依据:</p>
          <ul class="assistant-facts">
            <li>画面描述关键词:<b>"${escapeHtml(visualShort)}…"</b> → 命中分镜阶段 <b>${escapeHtml(seg.stage || "")}</b></li>
            <li>已选素材中场景最接近:<b>${escapeHtml(m.name)}</b>(场景:${escapeHtml(m.scene || "")})</li>
            <li>景别 <b>${escapeHtml(seg.shotType || "—")}</b> · 运镜 <b>${escapeHtml(seg.cameraMove || "—")}</b> 与素材最契合</li>
          </ul>
          <p class="assistant-summary assistant-hint">如需替换:可点击卡片底部「重新匹配镜头」或说"换第 ${idx + 1} 段的镜头"。</p>`);
      } else {
        appendMixAssistantTurn(`<div class="message-head"><strong>✦ 智能混剪</strong></div>
          <p class="assistant-summary">第 ${idx + 1} 段暂未匹配到镜头。</p>
          <p class="assistant-summary assistant-hint">建议操作:① 补全画面描述让 AI 重新匹配 ② 切换为 <b>口播驱动</b> 模式 ③ 点击卡片底部「替换镜头」手动选素材。</p>`);
      }
    }

    function openMixRowRematchDialogFromIndex(idx) {
      const card = document.querySelector(`.mix-script-card[data-mix-script-row="${idx}"]`);
      if (card) openMixRowRematchDialog(card);
      else showToast("未找到对应分镜卡片");
    }

    function submitMixScriptChat(request) {
      appendMixUserTurn(request);
      promptInput.value = "";
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
      const segs = mixScriptSegments();
      const intent = detectMixScriptIntent(request);
      const idx = pickMixTargetRow(segs, intent.explicitIdx);
      switch (intent.kind) {
        case "split": handleMixSplit(idx, segs); return;
        case "merge": handleMixMerge(idx, segs); return;
        case "optimize": handleMixOptimize(idx, segs); return;
        case "diagnose": handleMixDiagnose(idx, segs); return;
        case "rematch": openMixRowRematchDialogFromIndex(idx); return;
        default: appendMixAssistantTurn(`<p class="assistant-summary">我已收到。可以试试:<br>· "把第 ${idx + 1} 段拆成两段"<br>· "把第 ${idx + 1} 段和第 ${idx + 2} 段合并"<br>· "优化第 ${idx + 1} 段画面"<br>· "为什么第 ${idx + 1} 段选这个镜头"</p>`);
      }
    }

    function submitMixCopyChat(request) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const nextCopy = adjustMixCopyByChat(request);
      if (!root || !nextCopy) return;
      root._mixChatCopy = nextCopy;
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = request;
      const assistantTurn = document.createElement("div");
      assistantTurn.className = "message assistant";
      assistantTurn.dataset.agentType = "mix";
      assistantTurn.innerHTML = `<div class="message-head"><strong>✦ 智能混剪</strong></div><p class="assistant-summary">已按你的要求生成一版新的口播文案，复制下方内容到左侧口播文本即可生效。</p><div class="mix-chat-copy-result"><strong>调整后的口播文案</strong><button class="mix-chat-copy-btn" type="button" data-mix-chat-copy aria-label="复制" title="复制"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg></button><p>${escapeHtml(nextCopy)}</p></div>`;
      chatOutput.append(userTurn, assistantTurn);
      conversationTurnCount += 1;
      agentTurnCounts.mix = (agentTurnCounts.mix || 0) + 1;
      promptInput.value = "";
      syncMixDuration();
      renderConversationLocator();
      chatOutput.scrollTo({ top:chatOutput.scrollHeight, behavior:"smooth" });
      showToast("已生成调整后的口播文案，复制下方内容到左侧口播文本即可生效");
    }

    function syncMixStepChat() {
      if (activeType !== "mix") return;
      // 混剪只有 step 2(文案与配音)显示口播调整对话,step 1(创作方案)/ step 3(分镜确认)/ step 4(生成视频)都不显示
      const enabled = taskStep === 2;
      taskShell.classList.toggle("mix-chat-unavailable", !enabled);
      if (!enabled) {
        taskShell.classList.remove("mix-chat-can-edit", "mix-chat-script-mode");
        setTaskChatCollapsed(false);
        injectMixQuickChips(false);
        return;
      }
      setTaskChatCollapsed(false);
      const guideText = "我可以协助你改写或精简口播文案，调整后复制到左侧口播文本即可生效。";
      const subtitle = "可协助调整口播";
      const placeholder = "口播助手模式：精简文案 / 改写语气 / 补充卖点";
      document.getElementById("taskChatSubtitle").textContent = subtitle;
      let guide = chatOutput.querySelector("[data-mix-step-chat-guide]");
      if (!guide) {
        guide = document.createElement("div");
        guide.className = "message assistant";
        guide.dataset.mixStepChatGuide = "";
        chatOutput.append(guide);
      }
      guide.innerHTML = `<div class="message-head"><strong>✦ 智能混剪</strong></div><p class="assistant-summary">${guideText}</p>`;
      taskShell.classList.add("mix-chat-can-edit");
      taskShell.classList.toggle("mix-chat-script-mode", false);
      promptInput.disabled = false;
      sendPromptButton.disabled = false;
      promptInput.placeholder = placeholder;
      // step 2 不注入分镜调整 chip(那是分镜助手的事,这里只管口播)
      injectMixQuickChips(false);
    }

    function syncTaskChatTarget() {
      const host = document.getElementById("taskChatTarget");
      const label = document.getElementById("taskChatTargetLabel");
      const clear = document.getElementById("taskChatTargetClear");
      if (!host || !label || !clear) return;
      const visible = taskShell?.classList.contains("show") && taskCompleted && isStructuredCopyFlow() && originalTaskAssetIds.length > 0;
      host.hidden = !visible;
      if (!visible) return;
      const selected = originalCopyTargetId ? getSessionAsset(originalCopyTargetId) : null;
      label.textContent = selected?.title || `全部${originalTaskAssetIds.length}个文案`;
      clear.hidden = !selected;
    }

    function exitAgentTask() {
      if (!taskShell?.classList.contains("show")) return;
      const stage = document.querySelector("#page-creation .creation-stage");
      taskShell.classList.remove("show", "is-complete");
      taskShell.classList.remove("chat-collapsed");
      // 清掉混剪 step 3+ 残留的 class,避免切到其他 agent 后聊天面板仍被 display:none 隐藏
      taskShell.classList.remove("mix-chat-unavailable", "mix-chat-can-edit", "mix-chat-script-mode");
      stage.insertBefore(conversationLocator, taskShell);
      stage.insertBefore(chatOutput, taskShell);
      stage.insertBefore(composerWrap, taskShell);
      stage.insertBefore(document.getElementById("assetToggle"), conversationLocator);
      stage.classList.add("home-mode");
      taskFormScroll.hidden = false;
      taskResultHost.hidden = true;
      taskFormActions.hidden = false;
      agentPillButton.disabled = false;
      modelTrigger.disabled = false;
      modelTrigger.hidden = false;
      syncTaskChatTarget();
    }

    function openAgentTask() {
      if (!agentConfigs[activeType]) return;
      taskCompleted = false;
      taskEditing = false;
      taskStep = 1;
      originalTaskAssetIds = [];
      scriptTaskAssetIds = [];
      originalCopySequence = 0;
      originalCopyTargetId = "";
      // 阶段2 J: 重置分镜增删 override
      const prevRoot = dynamicForm?.querySelector?.(".mix-flow-form");
      if (prevRoot) {
        prevRoot._mixRowInserted = new Set();
        prevRoot._mixRowDeleted = new Set();
        prevRoot._mixInsertedSegments = [];
        prevRoot._mixRowMergedCopy = {};
        prevRoot._mixRowSplit = new Map();
        prevRoot._mixRowFlag = new Set();
      }
      syncTaskChatTarget();
      if (activeType === "script") window.__scriptMaterialSelected = [];
      taskShell.dataset.agentType = isStructuredCopyFlow() ? "original" : activeType;
      document.getElementById("taskAgentTitle").textContent = activeAgent;
      document.getElementById("taskAgentIntro").textContent = agentConfigs[activeType].intro;
      syncTaskChatTitle();
      document.getElementById("taskChatSubtitle").textContent = "完成左侧步骤后开启自然语言修改";
      document.getElementById("taskChatHead").append(document.getElementById("assetToggle"));
      taskFormHost.append(dynamicForm, formFeedback);
      taskChatLog.append(chatOutput, conversationLocator);
      taskComposerHost.append(composerWrap);
      appendTaskGreeting();
      prepareTaskForm();
      if (activeType === "script") bindScriptAgentEvents();
      if (activeType === "mix") bindMixAgentEvents();
      taskShell.classList.add("show");
      taskShell.classList.remove("is-complete");
      setTaskChatCollapsed(true);
      document.querySelector("#page-creation .creation-stage").classList.remove("home-mode");
      agentBrowser.style.display = "none";
      emptyHero.style.display = "none";
      chatOutput.classList.add("show");
      promptInput.disabled = true;
      promptInput.placeholder = "请先完成左侧步骤并生成结果，生成后可在这里继续修改";
      sendPromptButton.disabled = true;
      agentPillButton.disabled = true;
      modelTrigger.disabled = true;
      modelTrigger.hidden = true;
      setTaskStep(1);
      requestAnimationFrame(renderConversationLocator);
    }

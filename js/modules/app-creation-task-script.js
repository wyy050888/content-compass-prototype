    // 智能脚本 Agent 多版本 Tab 渲染
    // 智能脚本 Agent 多版本结果页:纵向卡片栈(每个脚本独立卡片,清晰分割)
    function renderScriptTaskResult(response, generatedAssets) {
      const scriptCtx = creationContext.script || {};
      const product = productCatalog[scriptCtx.product] || { ...currentProduct(), name: scriptCtx.productName || currentProduct().name };
      const modelLabels = { "gpt-5-6-terra":"GPT-5.6 Terra", "claude-sonnet-5":"Claude Sonnet 5", "gemini-3-6-flash":"Gemini 3.6 Flash", "doubao-seed-2-pro":"豆包 Seed 2.0 Pro", "deepseek-v4-pro":"DeepSeek V4 Pro", "qwen-3-7-max":"通义千问 Qwen3.7-Max" };
      const modelLabel = modelLabels[scriptCtx.model] || scriptCtx.model || "—";

      // 用 override 合并后的统一 rows
      const mergedRows = scriptRowsWithOverrides(generatedAssets);

      // 智能脚本不生成多版本(无 V1/V2 tabs,无版本概念),只展示当前 target asset
      const asset = generatedAssets[0];
      const saved = sessionAssets.find(a => a.id === asset.id)?.saved;
      const isTarget = scriptTargetId === asset.id || !scriptTargetId;
      const cardHtml = mergedRows.map((item, index) => renderSingleScriptCard(item, index, asset, { isTarget, totalRows: mergedRows.length })).join("");

      taskResultHost.innerHTML = `
        <div class="script-scroll">
          <article class="script-result-card" data-asset-id="${escapeHtml(asset.id)}">
            <div class="mix-script-list" data-script-card-list>${cardHtml}</div>
          </article>
        </div>
        <footer class="script-result-bar" data-script-result-bar>
          <div class="script-result-bar-actions">
            <button class="asset-action" type="button" data-action="save-script-to-library" data-asset-id="${escapeHtml(asset.id)}">${saved ? "✓ 已保存" : "保存至脚本库"}</button>
            <button class="asset-action" type="button" data-action="download-script" data-asset-id="${escapeHtml(asset.id)}">下载脚本</button>
            <button class="asset-action primary" type="button" data-action="mix-from-script" data-asset-id="${escapeHtml(asset.id)}">智能混剪</button>
          </div>
        </footer>
      `;

      // 卡片行 ✕ 删除操作
      taskResultHost.querySelectorAll("[data-mix-delete-row]").forEach(btn => {
        btn.addEventListener("click", event => {
          event.stopPropagation();
          const card = btn.closest("[data-script-row]");
          if (card) openScriptDeleteRowConfirm(card);
        });
      });

      // 重新匹配 / 替换镜头 — 用原 _origIndex 定位 asset.scriptRows(因 mergedRows 已合并 inserted/deleted,rowIdx 不再对齐)
      taskResultHost.querySelectorAll("[data-mix-rematch-row]").forEach(btn => {
        btn.addEventListener("click", event => {
          event.stopPropagation();
          const card = btn.closest("[data-script-row]");
          if (!card) return;
          const origIndex = Number(card.dataset.scriptOrigRow);
          if (!Number.isFinite(origIndex) || origIndex < 0) {
            showToast("新插入的分镜需先在产品策略中勾选素材,再使用重新匹配");
            return;
          }
          switchScriptShotGroup(card.dataset.assetId, origIndex);
        });
      });
      taskResultHost.querySelectorAll("[data-mix-replace-row]").forEach(btn => {
        btn.addEventListener("click", event => {
          event.stopPropagation();
          const card = btn.closest("[data-script-row]");
          if (!card) return;
          const origIndex = Number(card.dataset.scriptOrigRow);
          if (!Number.isFinite(origIndex) || origIndex < 0) {
            showToast("新插入的分镜需先在产品策略中勾选素材,再使用替换");
            return;
          }
          openScriptMaterialReplacement(card.dataset.assetId, origIndex);
        });
      });

      // 收起 / 展开卡片 body
      taskResultHost.querySelectorAll("[data-mix-toggle-row]").forEach(btn => {
        btn.addEventListener("click", event => {
          event.stopPropagation();
          const card = btn.closest("[data-script-row]");
          const body = card?.querySelector(".mix-script-body");
          if (!body) return;
          const expanded = btn.getAttribute("aria-expanded") !== "false";
          const next = !expanded;
          btn.setAttribute("aria-expanded", String(next));
          btn.textContent = next ? "收起" : "展开";
          body.hidden = !next;
        });
      });

      // 复制视频提示词(在右侧 textarea 旁的小按钮)
      taskResultHost.querySelectorAll("[data-action='copy-video-prompt']").forEach(btn => {
        btn.addEventListener("click", () => {
          const prompt = btn.dataset.prompt || "";
          navigator.clipboard?.writeText(prompt).then(
            () => showToast("提示词已复制到剪贴板"),
            () => showToast("复制失败,请手动选择文本复制")
          );
        });
      });
      // 下载(原导出 JSON)
      taskResultHost.querySelectorAll("[data-action='download-script']").forEach(btn => {
        btn.addEventListener("click", () => downloadScript(btn.dataset.assetId));
      });
      // 保存至脚本库
      taskResultHost.querySelectorAll("[data-action='save-script-to-library']").forEach(btn => {
        btn.addEventListener("click", () => toggleScriptSaved(btn.dataset.assetId, btn));
      });

      // 智能混剪(占位,仅 toast)
      taskResultHost.querySelectorAll("[data-action='mix-from-script']").forEach(btn => {
        btn.addEventListener("click", () => {
          setScriptChatTarget(btn.dataset.assetId);
          showToast("已选择此脚本作为混剪输入");
        });
      });

      // 一次性绑定 taskResultHost 的行内 input/click:走 handleRowEditInput 公共函数(1:1 对齐混剪)
      if (!taskResultHost._scriptRowEditBound) {
        taskResultHost._scriptRowEditBound = true;
        taskResultHost.addEventListener("input", event => {
          if (event.target.matches("[data-mix-row-video-prompt]")) {
            const idx = Number(event.target.dataset.mixRowVideoPrompt);
            taskResultHost._scriptRowVideoPromptOverrides = taskResultHost._scriptRowVideoPromptOverrides || {};
            taskResultHost._scriptRowVideoPromptOverrides[idx] = event.target.value;
            return;
          }
          if (event.target.matches("[data-mix-row-visual], [data-mix-row-copy]")) {
            handleRowEditInput(event, {
              stateAdapter: {
                writeVisualOverride(idx, val) {
                  taskResultHost._scriptRowVisualOverrides = taskResultHost._scriptRowVisualOverrides || {};
                  taskResultHost._scriptRowVisualOverrides[idx] = val;
                },
                writeCopyOverride(idx, val) {
                  taskResultHost._scriptRowCopyOverrides = taskResultHost._scriptRowCopyOverrides || {};
                  taskResultHost._scriptRowCopyOverrides[idx] = val;
                },
                markNeedsRematch(idx) {
                  if (!taskResultHost._scriptRowNeedsRematch) taskResultHost._scriptRowNeedsRematch = new Set();
                  taskResultHost._scriptRowNeedsRematch.add(idx);
                }
              },
              // 脚本端 onVisualEdit / onCopyEdit 不需要混剪那种"同步大文本框"或"刷新完成度",留空即可
              onVisualEdit: () => {},
              onCopyEdit: () => {}
            });
          }
        });
        // 回到默认按钮(走公共 applyScriptRowVisualReset)
        taskResultHost.addEventListener("click", event => {
          const reset = event.target.closest("[data-mix-visual-reset]");
          if (!reset) return;
          const card = reset.closest("[data-script-row]");
          if (card) applyScriptRowVisualReset(card);
        });
      }

      // 进入 Step 3 时挂上紫色 composer 主题(只在首次结果渲染时)
      if (taskShell) taskShell.classList.add("mix-chat-script-mode");
      injectScriptQuickChips(true);
    }

    // 1:1 镜像 applyMixRowVisualReset:清除 _scriptRowVisualOverrides / _scriptRowNeedsRematch / 关闭 rematch
    function applyScriptRowVisualReset(card) {
      if (!card) return;
      const origIndex = Number(card.dataset.scriptOrigRow);
      if (!Number.isFinite(origIndex) || origIndex < 0) {
        showToast("该段无默认画面描述可恢复");
        return;
      }
      const needsSet = taskResultHost._scriptRowNeedsRematch;
      const overrideObj = taskResultHost._scriptRowVisualOverrides || {};
      const hasOverride = Object.prototype.hasOwnProperty.call(overrideObj, origIndex) || Object.prototype.hasOwnProperty.call(overrideObj, Number(card.dataset.rowIdx));
      const isNeeds = needsSet?.has(origIndex);
      if (!isNeeds && !hasOverride) {
        showToast("该段画面描述已是默认状态");
        return;
      }
      needsSet?.delete(origIndex);
      if (taskResultHost._scriptRowVisualOverrides) {
        delete taskResultHost._scriptRowVisualOverrides[origIndex];
        delete taskResultHost._scriptRowVisualOverrides[Number(card.dataset.rowIdx)];
      }
      delete taskResultHost._scriptRowRematching?.[origIndex];
      refreshScriptResultFromCurrent();
      showToast(`已恢复第 ${Number(card.dataset.rowIdx) + 1} 段画面描述为默认`);
    }

    // 单张脚本卡片(1:1 镜像混剪 renderSingleMixCard 模板,去掉 +/已匹配素材)
    function renderSingleScriptCard(item, index, asset, opts = {}) {
      const totalRows = opts.totalRows ?? 0;
      const isFirst = index === 0;
      const isFlagged = Boolean(item._isFlagged);
      const isInserted = Boolean(item._isInserted);
      const hasNoMaterial = !(item.materialIds?.length) && !item.materialOverride;
      const flagMark = isFlagged ? `<i class="mix-row-flag" title="本行已变更" aria-label="本行已变更"></i>` : "";
      const deleteAttr = isFirst
        ? ` disabled aria-disabled="true" title="首段不可删除"`
        : ` data-mix-delete-row="${index}" title="删除第 ${index + 1} 段" aria-label="删除分镜"`;
      const showMaterial = (asset.materialMode || "depend") === "depend";
      // 依赖素材库才渲染素材预览;不依赖素材库(free)不显示素材预览
      const previewHtml = showMaterial
        ? (hasNoMaterial
          ? `<div class="mix-stage-preview mix-stage-preview-empty" data-mix-replace-row tabindex="0" role="button" aria-label="为第 ${index + 1} 段选择镜头"><div class="mix-stage-preview-empty-text">点击此处选择素材</div><div class="mix-stage-preview-empty-hint">第 ${index + 1} 段尚未匹配镜头</div></div>`
          : `<div class="mix-stage-preview" data-mix-replace-row tabindex="0" role="button" aria-label="预览第 ${index + 1} 个镜头"><b>▶</b></div>`)
        : "";
      // 不依赖素材库(free)模式:新增可编辑的「生视频提示词」字段,替代素材预览
      const promptCell = !showMaterial
        ? `<i class="mix-field-divider" aria-hidden="true"></i><label class="mix-stage-video-prompt-edit"><span>生视频提示词</span><textarea rows="3" data-mix-row-video-prompt="${index}" placeholder="描述生成视频的画面、运镜、时长等,可直接编辑">${escapeHtml(item.videoPrompt || "")}</textarea></label>`
        : "";
      const stage = item.stage || "新分镜";
      const timeText = `${mixTimeLabel(item.start)}–${mixTimeLabel(item.end)}`;
      const isRematching = Boolean(item._isRematching);
      const needsRematch = Boolean(item.needsRematch);
      // 1:1 对齐混剪卡片的视觉字段(画面描述):带 ↶ 回到默认 按钮 + 需重新匹配 标记 + 进度条
      const resetDisabledAttr = needsRematch ? "" : " disabled aria-disabled=\"true\"";
      const visualFlag = needsRematch && !isRematching ? `<em class="mix-visual-rematch-flag" title="已修改描述,需要重新匹配镜头">需重新匹配</em>` : "";
      return `<article class="mix-script-card${isFlagged ? " is-flagged" : ""}${isInserted ? " is-inserted" : ""}${showMaterial ? "" : " is-no-material"}${hasNoMaterial ? " is-needs-shot" : ""}${needsRematch ? " is-needs-rematch" : ""}${isRematching ? " is-rematching" : ""}" data-script-row data-row-idx="${index}" data-asset-id="${escapeHtml(asset.id)}" data-script-orig-row="${item._origIndex}">${flagMark}<header><div><span class="mix-row-index" title="第 ${index + 1} 段">${String(index + 1).padStart(2, "0")}</span><b>${timeText}</b><strong>${escapeHtml(stage)}</strong><span>${item.duration.toFixed(1)}s</span></div><div class="mix-row-header-actions">
        <button type="button" class="mix-row-icon-btn"${deleteAttr}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/></svg>
        </button>
        <button type="button" class="mix-row-action-btn" data-mix-rematch-row>重新匹配</button>
        <button type="button" class="mix-row-action-btn mix-row-action-primary" data-mix-replace-row>替换镜头</button>
        <button type="button" class="mix-row-toggle-btn" data-mix-toggle-row aria-expanded="true">收起</button>
      </div></header><div class="mix-rematch-progress" data-mix-rematch-progress${isRematching ? "" : " hidden"}><span>AI 换镜中…</span><div class="mix-rematch-progress-track"><div class="mix-rematch-progress-bar${isRematching ? " is-rematch-running" : ""}"></div></div></div><div class="mix-script-body"><div class="mix-script-detail-layout">${previewHtml}<div class="mix-stage-attributes"><label class="mix-stage-visual-edit mix-stage-visual-primary"><span>画面描述<button type="button" class="mix-visual-reset" data-mix-visual-reset="${index}" title="恢复到默认画面描述" aria-label="回到默认"${resetDisabledAttr}>↶ 回到默认</button>${visualFlag}</span><textarea data-mix-row-visual="${index}" placeholder="用一句自然语言描述这个分镜的画面">${escapeHtml(item.visual || "")}</textarea></label><i class="mix-field-divider" aria-hidden="true"></i><label class="mix-stage-copy-edit mix-stage-copy-primary"><span>口播文案<i class="mix-stage-copy-readonly-hint" aria-hidden="true">可在行内继续修改</i></span><textarea data-mix-row-copy="${index}" placeholder="本段口播文案,直接编辑即可触发分镜自动重算">${escapeHtml(item.voice || "")}</textarea></label>${promptCell}</div></div></div></article>`;
    }

    function downloadScript(assetId) {
      const asset = sessionAssets.find(a => a.id === assetId);
      if (!asset) return;
      const blob = new Blob([JSON.stringify(asset, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${asset.title || "脚本"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("脚本 JSON 已下载");
    }

    function exportScriptAsJson(assetId) {
      // 兼容旧调用
      downloadScript(assetId);
    }

    function copyScriptAsText(assetId) {
      const asset = sessionAssets.find(a => a.id === assetId) || originalTaskAssetIds.map(getSessionAsset).find(Boolean);
      if (!asset?.scriptRows) return showToast("未找到可复制的脚本");
      const lines = (asset.scriptRows || []).map(row => `[${row.time}] ${row.shotType || ""}·${row.cameraMove || ""}\n口播:${row.voice}\n画面:${row.visual}\n字幕:${row.subtitle || ""}`).join("\n\n");
      const text = `${asset.title}\n\n${lines}`;
      navigator.clipboard?.writeText(text).then(
        () => showToast("整套脚本已复制"),
        () => showToast("复制失败")
      );
    }

    function toggleScriptSaved(assetId, btn) {
      const asset = sessionAssets.find(a => a.id === assetId);
      if (!asset) return;
      asset.saved = !asset.saved;
      btn.textContent = asset.saved ? "✓ 已保存至脚本库" : "保存至脚本库";
      window.dispatchEvent(new CustomEvent("script-library:sync", { detail:{ action:asset.saved ? "upsert" : "remove", asset } }));
      showToast(asset.saved ? "已存入脚本库" : "已从脚本库移除");
    }

    // 设置当前对话修改的脚本对象(类似 originalCopyTargetId 的模式)
    function setScriptChatTarget(assetId) {
      scriptTargetId = assetId || "";
      // 不再在卡片上添加紫色高亮 / "当前修改对象" badge
      const asset = sessionAssets.find(a => a.id === assetId);
      if (asset) {
        const subtitle = document.getElementById("taskChatSubtitle");
        if (subtitle) subtitle.textContent = `正在修改:${asset.title}`;
        promptInput.value = "";
        promptInput.placeholder = `描述对"${asset.title}"的修改要求,例如:把第 2 个镜头改成全景,时长调整为 4s`;
        promptInput.focus();
        showToast("已将该脚本设为当前对话修改对象");
      } else {
        const subtitle = document.getElementById("taskChatSubtitle");
        if (subtitle) subtitle.textContent = "可继续用自然语言修改本次结果";
        promptInput.placeholder = "继续修改本次分镜,例如:把第 2 个镜头改成全景,时长调整为 4s";
      }
    }

    // ── 阶段2 H/J 镜像:智能脚本 Step 3 — chat 4 能力 + 分镜增删 ────────────
    // 6 个 override 挂在 taskResultHost 上(脚本 Step 3 的渲染根),key 用 _scriptRow* 前缀与混剪端区分
    function ensureScriptOverrides() {
      taskResultHost._scriptRowInserted = taskResultHost._scriptRowInserted || new Set();
      taskResultHost._scriptRowDeleted = taskResultHost._scriptRowDeleted || new Set();
      taskResultHost._scriptInsertedSegments = taskResultHost._scriptInsertedSegments || [];
      taskResultHost._scriptRowMergedCopy = taskResultHost._scriptRowMergedCopy || {};
      taskResultHost._scriptRowSplit = taskResultHost._scriptRowSplit || new Map();
      taskResultHost._scriptRowFlag = taskResultHost._scriptRowFlag || new Set();
      taskResultHost._scriptRowVisualOverrides = taskResultHost._scriptRowVisualOverrides || {};
      taskResultHost._scriptRowMaterialOverrides = taskResultHost._scriptRowMaterialOverrides || {};
      taskResultHost._scriptRowVideoPromptOverrides = taskResultHost._scriptRowVideoPromptOverrides || {};
    }
    function resetScriptOverrides() {
      taskResultHost._scriptRowInserted = new Set();
      taskResultHost._scriptRowDeleted = new Set();
      taskResultHost._scriptInsertedSegments = [];
      taskResultHost._scriptRowMergedCopy = {};
      taskResultHost._scriptRowSplit = new Map();
      taskResultHost._scriptRowFlag = new Set();
      taskResultHost._scriptRowVisualOverrides = {};
      taskResultHost._scriptRowMaterialOverrides = {};
      taskResultHost._scriptRowVideoPromptOverrides = {};
    }

    // 把 completeScriptRows 按 6 个 override 合并成渲染数组,每行带 _origIndex
    function scriptRowsWithOverrides(generatedAssets) {
      ensureScriptOverrides();
      // 数据源优先级(与 refreshScriptResultFromCurrent 一致):generatedAssets[0] → scriptTargetId → scriptTaskAssetIds[0] → completeScriptRows(兜底 demo)
      // 这样 switchScriptShotGroup / applyMaterialToScriptRow 改的 sessionAssets.asset.scriptRows 才能在重渲染时被读到
      const fallbackAssetId = scriptTargetId || (scriptTaskAssetIds && scriptTaskAssetIds[0]);
      const resolvedAsset = generatedAssets?.[0] || (fallbackAssetId ? sessionAssets.find(a => a.id === fallbackAssetId) : null);
      const baseSource = (resolvedAsset?.scriptRows?.length ? resolvedAsset.scriptRows : completeScriptRows);
      const draftsRaw = baseSource.map((item, index) => ({
        ...item,
        copy: taskResultHost._scriptRowMergedCopy?.[index] ?? item.voice
      }));
      const deletedSet = taskResultHost._scriptRowDeleted;
      const splitMap = taskResultHost._scriptRowSplit;
      const baseDrafts = draftsRaw
        .map((item, i) => ({ ...item, _origIndex: i, voice: item.copy }))
        .filter(item => !deletedSet.has(item._origIndex));
      const splitBuckets = [];
      const baseRows = baseDrafts.map(item => {
        const origIdx = item._origIndex;
        if (splitMap.has(origIdx)) {
          const text = item.voice || "";
          const match = text.match(/[^。！？!?]+[。！？!?]/g);
          if (match && match.length >= 2) {
            const cut = Math.floor(match.length / 2);
            const first = match.slice(0, cut).join("");
            const second = match.slice(cut).join("");
            splitBuckets.push({ afterOrigIndex: origIdx, halfCopy: second });
            return { ...item, voice: first };
          }
        }
        return item;
      });
      const insertedFromSplit = splitBuckets.map(b => ({
        _origIndex: -1,
        _isInserted: true,
        stage: "新分镜",
        voice: b.halfCopy,
        visual: "请补充该分镜的画面内容描述"
      }));
      const userInserted = (taskResultHost._scriptInsertedSegments || []).map(payload => ({
        _origIndex: -1,
        _isInserted: true,
        ...payload,
        voice: payload.voice ?? payload.copy ?? ""
      }));
      const result = [...baseRows];
      const allInserted = [...insertedFromSplit, ...userInserted];
      allInserted.forEach(payload => {
        if (payload.afterIndex === undefined) {
          result.push(payload);
          return;
        }
        const targetIdx = result.findIndex(s => s._origIndex === payload.afterIndex);
        if (targetIdx === -1) result.push(payload);
        else result.splice(targetIdx + 1, 0, payload);
      });
      // 重新算 #id 连续编号,time 同步重算
      const total = result.length;
      const totalChars = result.reduce((s, r) => s + (r.voice || "").replace(/\s/g, "").length, 0) || 1;
      const speed = 1;
      const actual = Math.max(4, totalChars / 3.35 / speed);
      let acc = 0;
      return result.map((item, index) => {
        const chars = (item.voice || "").replace(/\s/g, "").length;
        const dur = index === total - 1 ? Math.max(0.1, actual - acc) : Math.max(1.2, actual * chars / totalChars);
        const start = acc;
        acc += dur;
        const startSec = Math.floor(start);
        const endSec = Math.max(startSec + 1, Math.floor(start + dur));
        const pad = n => String(n).padStart(2, "0");
        const isInserted = item._isInserted || taskResultHost._scriptRowInserted.has(item._origIndex);
        const isFlagged = taskResultHost._scriptRowFlag.has(item._origIndex) || isInserted;
        // 渲染时,每张卡片拿到的是合并后的 stage / voice / visual;若该行被"优化画面"改写过,visual 用 override
        const visualOverride = taskResultHost._scriptRowVisualOverrides?.[index];
        const videoPromptOverride = taskResultHost._scriptRowVideoPromptOverrides?.[index];
        // 1:1 对齐混剪:needsRematch / _isRematching 决定进度条 + 需重新匹配 flag + 回到默认按钮
        const origIdx = item._origIndex;
        const needsRematchFlag = Boolean(taskResultHost._scriptRowNeedsRematch?.has(origIdx));
        const isRematching = Boolean(taskResultHost._scriptRowRematching?.[origIdx]);
        // 1:1 镜像混剪 _mixRowOverrides:先读 taskResultHost._scriptRowMaterialOverrides[origIdx](由 switchScriptShotGroup 3s 后写入)
        // 这样无论 baseSource 来自 sessionAssets.asset 还是 fallback demo,override 一定能覆盖 materialIds
        const materialOverrideIds = taskResultHost._scriptRowMaterialOverrides?.[origIdx];
        const finalMaterialIds = materialOverrideIds !== undefined ? materialOverrideIds.slice() : item.materialIds;
        const finalMaterialOverride = materialOverrideIds !== undefined ? materialOverrideIds[0] : item.materialOverride;
        return {
          ...item,
          id: index + 1,
          time: `${pad(startSec)}—${pad(endSec)}s`,
          duration: dur,
          start, end: start + dur,
          materialIds: finalMaterialIds,
          materialOverride: finalMaterialOverride,
          visual: visualOverride || item.visual,
          videoPrompt: videoPromptOverride ?? item.videoPrompt,
          _isInserted: Boolean(isInserted),
          _isFlagged: Boolean(isFlagged),
          _isRematching: isRematching,
          needsRematch: needsRematchFlag,
          _origIndex: origIdx
        };
      });
    }

    // ── 删除分镜(插入由 chat 4 能力 接管) ──
    function openScriptDeleteRowConfirm(row) {
      if (!row) return;
      const assetId = row.dataset.assetId;
      const rowIdx = Number(row.dataset.rowIdx);
      const origIndex = Number(row.dataset.scriptOrigRow);
      const stage = row.querySelector("header strong")?.textContent?.trim() || "新分镜";
      const time = row.querySelector("header b")?.textContent?.trim() || "—";
      const durationText = row.querySelector("header span:last-of-type")?.textContent?.trim() || "—";
      const overlay = createMixDialog({
        title: "删除该分镜?",
        subtitle: "删除后总时长与口播分配会自动重算,后续可重新插入。",
        label: "删除分镜",
        body: `<div class="mix-delete-dialog-body">
          <p>将删除第 <b>${rowIdx + 1}</b> 段<b>${escapeHtml(stage)}</b>(${escapeHtml(time)},${escapeHtml(durationText)})。</p>
          <p style="color:#8d91a0;font-size:12px">该分镜关联的口播将一并从总时长中扣除。如需保留内容,建议先"合并到上一段"。</p>
        </div>`,
        footer: `<div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn danger" type="button" data-mix-confirm-delete>确认删除</button></div>`
      });
      overlay.querySelector("[data-mix-confirm-delete]").addEventListener("click", () => {
        overlay.remove();
        // 删除要按"行身份"删除:如果是新插入的(_origIndex < 0),按 rowIdx 找最近匹配;否则按 origIndex
        const isInserted = origIndex < 0 || isNaN(origIndex);
        applyScriptRowDelete(assetId, rowIdx, { isInserted, origIndex });
      });
    }

    function applyScriptRowDelete(assetId, rowIdx, opts = {}) {
      ensureScriptOverrides();
      const rows = scriptRowsWithOverrides();
      if (rows.length <= 1) {
        showToast("至少需要保留 1 段分镜");
        return;
      }
      const seg = rows[rowIdx];
      // 三种身份:① 原始行(origIndex >= 0)→ 写 _scriptRowDeleted;② 新插入的 split half(afterIndex 指向某 orig)→ 写 deleted orig(让 _dropOnDelete 把它过滤);③ 用户手动插入的(afterIndex undefined)→ 直接从 _scriptInsertedSegments 过滤
      if (seg?._isInserted) {
        // 从 _scriptInsertedSegments 删;按 _isInserted && 行号匹配
        const allInserted = taskResultHost._scriptInsertedSegments || [];
        // 取该行在 mergedRows 之前已经 inserted 的"身份":用 rowIdx 倒推到 user-inserted 数组
        const userInsertedCount = (taskResultHost._scriptInsertedSegments || []).filter(p => !p._fromSplit).length;
        // 简化:删 _scriptInsertedSegments 里 afterIndex 唯一匹配的那一条(若有)
        // 兜底:按 _assetId + 位置
        taskResultHost._scriptInsertedSegments = (taskResultHost._scriptInsertedSegments || []).filter(p => p._assetId !== assetId || p !== allInserted[rowIdx]);
      }
      const origIndex = seg ? seg._origIndex : rowIdx;
      const targetOrig = origIndex >= 0 ? origIndex : -rowIdx - 100;
      taskResultHost._scriptRowDeleted.add(targetOrig);
      if (taskResultHost._scriptRowVisualOverrides) delete taskResultHost._scriptRowVisualOverrides[targetOrig];
      taskResultHost._scriptRowFlag.add(targetOrig);
      // 清理 _scriptInsertedSegments 里 afterIndex 指向被删 orig 的"前向插入"行
      taskResultHost._scriptInsertedSegments = (taskResultHost._scriptInsertedSegments || []).filter(p => !(p.afterIndex === targetOrig && p._dropOnDelete));
      refreshScriptResultFromCurrent();
      showToast("已删除 1 个分镜,总时长已重算");
    }

    // 重新渲染脚本结果页(保留 override、current target、focused version)
    function refreshScriptResultFromCurrent() {
      const focusAssetId = scriptTargetId || (scriptTaskAssetIds[0]);
      const assets = scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean);
      if (!assets.length) return;
      const summary = taskResultHost.querySelector(".task-result-top small")?.textContent || "智能脚本结果";
      renderScriptTaskResult({ summary }, assets);
      // 恢复 focus 版本
      const idx = scriptTaskAssetIds.indexOf(focusAssetId);
      if (idx > 0) taskResultHost.querySelector(`[data-script-result-tab="${idx}"]`)?.click();
    }

    // ── chat 4 能力(分镜助手模式) ──
    function injectScriptQuickChips(isScriptStep) {
      const composer = document.getElementById("taskComposerHost") || promptInput?.closest?.(".composer")?.parentElement;
      const anchor = promptInput?.closest?.(".composer") || document.getElementById("taskComposerHost");
      if (!anchor) return;
      const existing = anchor.querySelector(":scope > .script-composer-quick");
      if (existing) existing.remove();
      if (!isScriptStep) return;
      const wrap = document.createElement("div");
      wrap.className = "mix-composer-quick script-composer-quick";
      wrap.innerHTML = `
        <button type="button" class="mix-quick-chip" data-script-quick="split" title="把当前选中行拆成两段">拆成两段</button>
        <button type="button" class="mix-quick-chip" data-script-quick="merge" title="把当前行和下一行合并">合并上下段</button>
        <button type="button" class="mix-quick-chip" data-script-quick="optimize" title="让 AI 改写当前行的画面描述">优化画面</button>
        <button type="button" class="mix-quick-chip" data-script-quick="diagnose" title="解释为什么选这个素材">为什么选这个</button>
      `;
      anchor.insertBefore(wrap, promptInput || anchor.firstChild);
      wrap.addEventListener("click", event => {
        const btn = event.target.closest("[data-script-quick]");
        if (!btn) return;
        const sampleMap = {
          split: "把第 1 段拆成两段",
          merge: "把第 1 段和第 2 段合并",
          optimize: "优化第 1 段画面",
          diagnose: "为什么第 1 段选这个素材"
        };
        const sample = sampleMap[btn.dataset.scriptQuick] || "";
        if (!promptInput) return;
        promptInput.value = sample;
        promptInput.focus();
      });
    }

    function appendScriptUserTurn(text) {
      const userTurn = document.createElement("div");
      userTurn.className = "message user";
      userTurn.textContent = text;
      chatOutput.append(userTurn);
    }

    function appendScriptAssistantTurn(html) {
      const turn = document.createElement("div");
      turn.className = "message assistant";
      turn.dataset.agentType = "script";
      turn.innerHTML = `<div class="message-head"><strong>✦ 智能脚本</strong></div>${html}`;
      chatOutput.append(turn);
      conversationTurnCount += 1;
      agentTurnCounts.script = (agentTurnCounts.script || 0) + 1;
      renderConversationLocator();
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
    }

    function detectScriptScriptIntent(text) {
      const t = (text || "").replace(/\s/g, "");
      const explicit = t.match(/第?\s*(\d{1,2})\s*段/);
      let explicitIdx = explicit ? Math.max(0, parseInt(explicit[1], 10) - 1) : null;
      if (/拆/.test(t)) return { kind: "split", explicitIdx };
      if (/合/.test(t) || /并入|并到|合并到/.test(t)) return { kind: "merge", explicitIdx };
      if (/优化|改写|重写|画面.*改|改.*画面/.test(t)) return { kind: "optimize", explicitIdx };
      if (/重新匹配|换个?素材|再匹配|换.*素材|换.*镜头/.test(t)) return { kind: "rematch", explicitIdx };
      if (/为什么|解释|说明|匹配.*原因|怎么选/.test(t)) return { kind: "diagnose", explicitIdx };
      return { kind: "fallback", explicitIdx };
    }

    function pickScriptTargetRow(rows, explicitIdx) {
      if (explicitIdx != null && explicitIdx >= 0 && explicitIdx < rows.length) return explicitIdx;
      // 缺省:优先 _isFlagged 行,否则最后段,再退到 0
      const flagged = rows.findIndex(r => r._isFlagged);
      if (flagged >= 0) return flagged;
      return Math.max(0, rows.length - 1);
    }

    function handleScriptSplit(idx, rows) {
      const seg = rows[idx];
      if (!seg) return appendScriptAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const focusAssetId = scriptTargetId || (scriptTaskAssetIds[0]);
      ensureScriptOverrides();
      const origIdx = seg._origIndex;
      taskResultHost._scriptRowSplit.set(origIdx, { mode: "half" });
      taskResultHost._scriptInsertedSegments.push({
        afterIndex: origIdx,
        stage: "新分镜",
        voice: "",
        copy: "",
        visual: "请补充该分镜的画面内容描述",
        _afterOrig: origIdx,
        _dropOnDelete: true,
        _assetId: focusAssetId
      });
      if (origIdx >= 0) taskResultHost._scriptRowInserted.add(origIdx);
      taskResultHost._scriptRowFlag.add(origIdx);
      refreshScriptResultFromCurrent();
      appendScriptAssistantTurn(`<p class="assistant-summary">已把第 ${idx + 1} 段按句号切分为两段,新分镜默认口播为空,可在行内补全。</p>`);
    }

    function handleScriptMerge(idx, rows) {
      const seg = rows[idx];
      if (!seg) return appendScriptAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const next = rows[idx + 1];
      if (!next) return appendScriptAssistantTurn(`<p class="assistant-summary">第 ${idx + 1} 段已是末段,无法向下合并。请选前面的段,或合并到上一段。</p>`);
      ensureScriptOverrides();
      const mergedVoice = (seg.voice || "") + (next.voice || "");
      const targetOrig = seg._origIndex;
      const nextOrig = next._origIndex;
      taskResultHost._scriptRowMergedCopy[targetOrig] = mergedVoice;
      if (nextOrig >= 0) {
        taskResultHost._scriptRowDeleted.add(nextOrig);
      } else {
        // next 是 inserted,直接删 _scriptInsertedSegments 里那条
        taskResultHost._scriptInsertedSegments = (taskResultHost._scriptInsertedSegments || []).filter(p => !(p.afterIndex === seg._origIndex && p._isInserted));
      }
      taskResultHost._scriptRowFlag.add(targetOrig);
      refreshScriptResultFromCurrent();
      appendScriptAssistantTurn(`<p class="assistant-summary">已把第 ${idx + 1} 段和第 ${idx + 2} 段合并,合并后继承前段口播,总时长已重算。</p>`);
    }

    function handleScriptOptimize(idx, rows) {
      const seg = rows[idx];
      if (!seg) return appendScriptAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      ensureScriptOverrides();
      appendScriptAssistantTurn(`<p class="assistant-summary">正在改写第 ${idx + 1} 段画面描述…</p>`);
      setTimeout(() => {
        const origVisual = (seg.visual || "暂无").trim();
        const enhanced = `${origVisual} · 镜头推进自然,主体居中,光影柔和,关键细节特写`;
        taskResultHost._scriptRowVisualOverrides[idx] = enhanced;
        refreshScriptResultFromCurrent();
        appendScriptAssistantTurn(`<p class="assistant-summary">已用 AI 改写第 ${idx + 1} 段画面描述。</p>`);
      }, 800);
    }

    function handleScriptDiagnose(idx, rows) {
      const seg = rows[idx];
      if (!seg) return appendScriptAssistantTurn(`<p class="assistant-summary">没找到第 ${idx + 1} 段,请刷新页面后重试。</p>`);
      const visualShort = (seg.visual || "").slice(0, 30);
      const stage = seg.stage || "新分镜";
      const hasMaterial = Boolean(seg.materialIds?.length || seg.materialGroups?.length);
      if (hasMaterial) {
        appendScriptAssistantTurn(`<div class="message-head"><strong>✦ 智能脚本</strong></div>
          <p class="assistant-summary">第 ${idx + 1} 段匹配依据:</p>
          <ul class="assistant-facts">
            <li>画面描述关键词:<b>"${escapeHtml(visualShort)}…"</b> → 命中分镜阶段 <b>${escapeHtml(stage)}</b></li>
            <li>本分镜在产品策略中已勾选素材分组:<b>${escapeHtml((seg.materialIds || seg.materialGroups || []).map(g => g.name || g.id || g).join("、") || "—")}</b></li>
            <li>景别 <b>${escapeHtml(seg.shotType || "—")}</b> · 运镜 <b>${escapeHtml(seg.cameraMove || "—")}</b> 已写入视频生成提示词</li>
          </ul>
          <p class="assistant-summary assistant-hint">如需替换:可点击行末「替换」按钮,或说"换第 ${idx + 1} 段的素材"。</p>`);
      } else {
        appendScriptAssistantTurn(`<div class="message-head"><strong>✦ 智能脚本</strong></div>
          <p class="assistant-summary">第 ${idx + 1} 段暂未指定素材分组。</p>
          <p class="assistant-summary assistant-hint">建议操作:① 在产品策略中勾选对应素材分组 ② 在行末点「AI 换一组」让 AI 推荐 ③ 点击「替换」手动选素材。</p>`);
      }
    }

    function openScriptRematchFromIndex(idx) {
      const focusAssetId = scriptTargetId || scriptTaskAssetIds[0];
      const row = taskResultHost.querySelector(`.script-result-card[data-asset-id="${focusAssetId}"] [data-script-row][data-row-idx="${idx}"]`);
      if (row) {
        if (focusAssetId && window.openScriptMaterialReplacement) {
          openScriptMaterialReplacement(focusAssetId, idx);
        } else {
          showToast("请打开对应脚本版本后再操作");
        }
      } else {
        showToast("未找到对应分镜行");
      }
    }

    function submitScriptScriptChat(request) {
      appendScriptUserTurn(request);
      promptInput.value = "";
      chatOutput.scrollTo({ top: chatOutput.scrollHeight, behavior: "smooth" });
      const rows = scriptRowsWithOverrides();
      const intent = detectScriptScriptIntent(request);
      const idx = pickScriptTargetRow(rows, intent.explicitIdx);
      switch (intent.kind) {
        case "split": handleScriptSplit(idx, rows); return;
        case "merge": handleScriptMerge(idx, rows); return;
        case "optimize": handleScriptOptimize(idx, rows); return;
        case "diagnose": handleScriptDiagnose(idx, rows); return;
        case "rematch": openScriptRematchFromIndex(idx); return;
        default: appendScriptAssistantTurn(`<p class="assistant-summary">我已收到。可以试试:<br>· "把第 ${idx + 1} 段拆成两段"<br>· "把第 ${idx + 1} 段和第 ${idx + 2} 段合并"<br>· "优化第 ${idx + 1} 段画面"<br>· "为什么第 ${idx + 1} 段选这个素材"</p>`);
      }
    }

    function refreshScriptResult(summary, focusAssetId, editLast = false) {
      const assets = scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean);
      renderScriptTaskResult({ summary }, assets);
      const index = scriptTaskAssetIds.indexOf(focusAssetId);
      if (index > 0) taskResultHost.querySelector(`[data-script-result-tab="${index}"]`)?.click();
      if (editLast) requestAnimationFrame(() => {
        const panel = taskResultHost.querySelector(`[data-asset-id="${focusAssetId}"]`);
        const lastRow = panel?.querySelector("tbody tr:last-child");
        if (lastRow) openScriptRowEditor(lastRow, { isNew:true });
      });
    }

    function appendScriptRow(assetId) {
      const asset = sessionAssets.find(item => item.id === assetId);
      if (!asset?.scriptRows) return;
      asset.scriptRows.push({ id:asset.scriptRows.length + 1, time:"", shotType:"中景", cameraMove:"固定", voice:"", visual:"", materialIds:[], videoPrompt:"" });
      refreshScriptResult("已在当前版本末尾新增分镜。", assetId, true);
    }

    function reorderScriptRows(sourceRow, targetRow) {
      if (sourceRow.dataset.assetId !== targetRow.dataset.assetId) return;
      const asset = sessionAssets.find(item => item.id === sourceRow.dataset.assetId);
      if (!asset?.scriptRows) return;
      const from = Number(sourceRow.dataset.rowIdx), to = Number(targetRow.dataset.rowIdx);
      const [moved] = asset.scriptRows.splice(from, 1);
      asset.scriptRows.splice(to, 0, moved);
      asset.scriptRows.forEach((item, index) => { item.id = index + 1; });
      refreshScriptResult("已调整镜头顺序。", asset.id);
    }

    function openScriptRowEditor(row, options = {}) {
      const cells = row.cells;
      if (cells.length < 6) return;
      const time = cells[1].textContent.trim();
      const voice = cells[2].textContent.trim();
      const shotType = cells[3].textContent.trim();
      const cameraMove = cells[4].textContent.trim();
      const visual = cells[5].textContent.trim();
      const modal = document.getElementById("scriptRowEditModal");
      if (!modal) return;
      if (modal.parentElement !== document.body) document.body.appendChild(modal);
      const asset = sessionAssets.find(item => item.id === row.dataset.assetId);
      const rowIndex = Number(row.dataset.rowIdx);
      const dependsOnMaterials = (asset?.materialMode || "depend") === "depend";
      const rowData = asset?.scriptRows?.[rowIndex] || {};
      let materialIds = [...(asset?.scriptRows?.[rowIndex]?.materialIds || (asset?.scriptRows?.[rowIndex]?.materialOverride ? [asset.scriptRows[rowIndex].materialOverride] : []))];
      const renderMaterials = () => {
        const host = modal.querySelector("[data-row-material-summary]");
        host.innerHTML = materialIds.length ? materialIds.map(id => {
          const item = findScriptMaterial(id);
          return item ? `<div class="script-row-material"><span>${escapeHtml(item.id)}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · 9:16 · ${item.duration}s</small></div><button type="button" data-remove-row-material="${escapeHtml(item.id)}">×</button></div>` : "";
        }).join("") : `<span class="script-row-material-empty">暂未指定素材，将使用本次已选素材自动匹配。</span>`;
      };
      modal.querySelector("[data-row-time]").value = time;
      modal.querySelector("[data-row-shot-type]").value = shotType;
      modal.querySelector("[data-row-camera-move]").value = cameraMove;
      modal.querySelector("[data-row-voice]").value = voice;
      modal.querySelector("[data-row-visual]").value = visual;
      modal.querySelector("[data-row-video-prompt]").value = rowData.videoPrompt || "";
      modal.querySelector("#scriptRowEditTitle").textContent = options.isNew ? "新增分镜" : "编辑分镜";
      modal.querySelector("[data-row-material-field]").hidden = !dependsOnMaterials;
      modal.querySelector("[data-row-video-prompt-field]").hidden = dependsOnMaterials;
      ["[data-row-time]", "[data-row-voice]"].forEach(selector => {
        const input = modal.querySelector(selector);
        if (input) input.disabled = true;
        input?.closest(".cl-edit-field")?.classList.add("is-locked-field");
      });
      modal.querySelector("[data-delete-script-row]").hidden = true;
      modal.dataset.rowIndex = row.rowIndex;
      modal.dataset.assetId = row.dataset.assetId || "";
      modal.classList.add("show");
      renderMaterials();
      modal.querySelector("[data-row-material-summary]").onclick = event => {
        const remove = event.target.closest("[data-remove-row-material]");
        if (!remove) return;
        materialIds = materialIds.filter(id => id !== remove.dataset.removeRowMaterial);
        renderMaterials();
      };
      modal.querySelector("[data-row-select-material]").onclick = () => openScriptMaterialPicker({
        title:"选择分镜素材", selectedIds:materialIds, onConfirm:ids => { materialIds = ids; renderMaterials(); }
      });

      // 关闭按钮(重复绑定安全:先移除旧 handler 标记)
      modal.querySelectorAll("[data-close-script-row]").forEach(btn => {
        btn.onclick = () => modal.classList.remove("show");
      });
      // 背景点击关闭
      modal.onclick = (e) => { if (e.target === modal || e.target.classList.contains("modal-backdrop")) modal.classList.remove("show"); };
      // 保存
      const saveBtn = modal.querySelector("#scriptRowEditSave");
      if (saveBtn) {
        saveBtn.onclick = () => {
          const newTime = time;
          const newShotType = modal.querySelector("[data-row-shot-type]").value;
          const newCameraMove = modal.querySelector("[data-row-camera-move]").value;
          const newVoice = voice;
          const newVisual = modal.querySelector("[data-row-visual]").value;
          const newVideoPrompt = modal.querySelector("[data-row-video-prompt]").value.trim();
          const requiredFields = ["[data-row-shot-type]", "[data-row-camera-move]", "[data-row-visual]"];
          if (!dependsOnMaterials) requiredFields.push("[data-row-video-prompt]");
          const missing = requiredFields.filter(selector => !modal.querySelector(selector)?.value.trim());
          requiredFields.forEach(selector => modal.querySelector(selector)?.closest(".cl-edit-field")?.classList.toggle("invalid", missing.includes(selector)));
          if (missing.length) return showToast("请填写分镜必填信息");
          cells[1].textContent = newTime;
          cells[2].textContent = newVoice;
          cells[3].innerHTML = `<span class="shot-tag">${newShotType}</span>`;
          cells[4].innerHTML = `<span class="shot-tag">${newCameraMove}</span>`;
          cells[5].textContent = newVisual;
          if (asset?.scriptRows?.[rowIndex]) {
            Object.assign(asset.scriptRows[rowIndex], { time:newTime, shotType:newShotType, cameraMove:newCameraMove, voice:newVoice, visual:newVisual, videoPrompt:newVideoPrompt, materialIds:dependsOnMaterials ? materialIds : [] });
            delete asset.scriptRows[rowIndex].materialOverride;
          }
          modal.classList.remove("show");
          if (asset) {
            const activeIndex = scriptTaskAssetIds.indexOf(asset.id);
            renderScriptTaskResult(
              { summary: "已更新当前分镜，其他版本内容保持不变。" },
              scriptTaskAssetIds.map(id => sessionAssets.find(item => item.id === id)).filter(Boolean)
            );
            if (activeIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${activeIndex}"]`)?.click();
          }
          showToast("分镜已更新");
        };
      }
      modal.querySelector("[data-delete-script-row]").onclick = () => showToast("当前脚本不支持删除分镜");
      // Esc 关闭
      const escHandler = (e) => { if (e.key === "Escape") { modal.classList.remove("show"); document.removeEventListener("keydown", escHandler); } };
      document.addEventListener("keydown", escHandler);
    }

    taskStepper.addEventListener("click", event => {
      const stepButton = event.target.closest("[data-task-step]");
      if (!stepButton) return;
      const target = Number(stepButton.dataset.taskStep);
      if (taskCompleted && !taskEditing && target === taskSteps().length) {
        taskStep = target;
        if (taskShell) taskShell.dataset.step = String(taskStep);
        taskFormScroll.hidden = true;
        taskResultHost.hidden = false;
        taskFormActions.hidden = true;
        renderTaskStepper();
        return;
      }
      if (taskCompleted || target <= taskStep) setTaskStep(target);
    });
    document.getElementById("closeTaskRestart").addEventListener("click", () => taskRestartModal.classList.remove("show"));
    document.getElementById("cancelTaskRestart").addEventListener("click", () => taskRestartModal.classList.remove("show"));
    document.getElementById("confirmTaskRestart").addEventListener("click", () => {
      taskRestartModal.classList.remove("show");
      taskEditing = false;
      if (isStructuredCopyFlow()) {
        originalCopySequence = 0;
        originalTaskAssetIds = [];
      }
      showGeneratedResult(true);
    });

    selectCreationHome();
    let conversationTurnCount = 0;
    let agentTurnCounts = {};
    let sessionAssets = [];
    let assetSequence = 0;
    let originalCopySequence = 0;
    let scriptTaskAssetIds = [];
    let pendingSourceAssetId = "";

    document.getElementById("taskChatTargetClear")?.addEventListener("click", () => {
      originalCopyTargetId = "";
      pendingSourceAssetId = "";
      renderOriginalTaskResult();
      document.getElementById("taskChatSubtitle").textContent = "可继续用自然语言批量修改本次文案";
      promptInput.placeholder = "告诉我你想怎么调整全部文案";
      promptInput.focus();
    });


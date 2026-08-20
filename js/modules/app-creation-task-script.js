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
      const previewHtml = hasNoMaterial
        ? `<div class="mix-stage-preview mix-stage-preview-empty" data-mix-replace-row tabindex="0" role="button" aria-label="为第 ${index + 1} 段选择镜头"><div class="mix-stage-preview-empty-text">点击此处选择素材</div><div class="mix-stage-preview-empty-hint">第 ${index + 1} 段尚未匹配镜头</div></div>`
        : `<div class="mix-stage-preview" data-mix-replace-row tabindex="0" role="button" aria-label="预览第 ${index + 1} 个镜头"><b>▶</b></div>`;
      // 视频提示词(scripts 默认就有 videoPrompt 字段);脚本不做混剪式的 material-plan-item 列表,改为只读提示词 textarea
      const promptCell = !showMaterial
        ? `<div class="video-prompt-cell"><textarea readonly rows="3" data-video-prompt>${escapeHtml(item.videoPrompt || "")}</textarea><button class="ghost-btn ghost-btn-sm" type="button" data-action="copy-video-prompt" data-prompt="${escapeHtml(item.videoPrompt || "")}">一键复制</button></div>`
        : "";
      const stage = item.stage || "新分镜";
      const timeText = `${mixTimeLabel(item.start)}–${mixTimeLabel(item.end)}`;
      const isRematching = Boolean(item._isRematching);
      const needsRematch = Boolean(item.needsRematch);
      // 1:1 对齐混剪卡片的视觉字段(画面描述):带 ↶ 回到默认 按钮 + 需重新匹配 标记 + 进度条
      const resetDisabledAttr = needsRematch ? "" : " disabled aria-disabled=\"true\"";
      const visualFlag = needsRematch && !isRematching ? `<em class="mix-visual-rematch-flag" title="已修改描述,需要重新匹配镜头">需重新匹配</em>` : "";
      return `<article class="mix-script-card${isFlagged ? " is-flagged" : ""}${isInserted ? " is-inserted" : ""}${hasNoMaterial ? " is-needs-shot" : ""}${needsRematch ? " is-needs-rematch" : ""}${isRematching ? " is-rematching" : ""}" data-script-row data-row-idx="${index}" data-asset-id="${escapeHtml(asset.id)}" data-script-orig-row="${item._origIndex}">${flagMark}<header><div><span class="mix-row-index" title="第 ${index + 1} 段">${String(index + 1).padStart(2, "0")}</span><b>${timeText}</b><strong>${escapeHtml(stage)}</strong><span>${item.duration.toFixed(1)}s</span></div><div class="mix-row-header-actions">
        <button type="button" class="mix-row-icon-btn"${deleteAttr}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/></svg>
        </button>
        <button type="button" class="mix-row-action-btn" data-mix-rematch-row>重新匹配</button>
        <button type="button" class="mix-row-action-btn mix-row-action-primary" data-mix-replace-row>替换镜头</button>
        <button type="button" class="mix-row-toggle-btn" data-mix-toggle-row aria-expanded="true">收起</button>
      </div></header><div class="mix-rematch-progress" data-mix-rematch-progress${isRematching ? "" : " hidden"}><span>AI 换镜中…</span><div class="mix-rematch-progress-track"><div class="mix-rematch-progress-bar${isRematching ? " is-rematch-running" : ""}"></div></div></div><div class="mix-script-body"><div class="mix-script-detail-layout">${previewHtml}<div class="mix-stage-attributes"><label class="mix-stage-visual-edit mix-stage-visual-primary"><span>画面描述<button type="button" class="mix-visual-reset" data-mix-visual-reset="${index}" title="恢复到默认画面描述" aria-label="回到默认"${resetDisabledAttr}>↶ 回到默认</button>${visualFlag}</span><textarea data-mix-row-visual="${index}" placeholder="用一句自然语言描述这个分镜的画面">${escapeHtml(item.visual || "")}</textarea></label><i class="mix-field-divider" aria-hidden="true"></i><label class="mix-stage-copy-edit mix-stage-copy-primary"><span>口播文案<i class="mix-stage-copy-readonly-hint" aria-hidden="true">可在行内继续修改</i></span><textarea data-mix-row-copy="${index}" placeholder="本段口播文案,直接编辑即可触发分镜自动重算">${escapeHtml(item.voice || "")}</textarea></label></div></div>${promptCell}</div></article>`;
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

    const toast = document.getElementById("toast");
    let toastTimer;
    function showToast(text, actionLabel = "", action = null) {
      toast.textContent = text;
      toast.classList.toggle("has-action", Boolean(actionLabel && action));
      if (actionLabel && action) {
        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.textContent = actionLabel;
        actionButton.addEventListener("click", () => {
          clearTimeout(toastTimer);
          toast.classList.remove("show", "has-action");
          action();
        }, { once:true });
        toast.append(actionButton);
      }
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show", "has-action"), actionLabel ? 4200 : 2100);
    }

    function updateAssetCounts() {
      const counts = { copy: 0, script: 0, video: 0, image: 0 };
      sessionAssets.forEach(asset => { counts[asset.type] += 1; });
      document.getElementById("copyAssetCount").textContent = counts.copy;
      document.getElementById("scriptAssetCount").textContent = counts.script;
      document.getElementById("videoAssetCount").textContent = counts.video;
      document.getElementById("imageAssetCount").textContent = counts.image;
      const total = sessionAssets.length;
      document.getElementById("assetPanelCount").textContent = total;
      document.getElementById("assetToggleCount").textContent = total;
    }

    function drawerAssetHtml(asset) {
      const icon = asset.type === "copy" ? "文" : asset.type === "script" ? "脚" : asset.type === "video" ? "视" : "图";
      return `
        <article class="asset-drawer-card" data-asset-id="${asset.id}">
          <button class="asset-drawer-main" data-asset-action="locate" type="button" title="定位到生成该资产的对话">
            <span class="asset-drawer-icon">${icon}</span>
            <span class="asset-drawer-copy">
              <strong>${escapeHtml(asset.title)}</strong>
              <small>第${asset.turnNumber}轮 · ${escapeHtml(asset.meta)}${asset.saved ? " · 已存素材库" : ""}</small>
              <p>${escapeHtml(asset.preview)}</p>
            </span>
          </button>
          <div class="asset-inline-actions">${actionsForAsset(asset)}</div>
          ${asset.type === "video" ? `<div class="video-source-detail">${asset.videoKind === "generated-shot" ? generatedShotDetailHtml(asset) : `${videoScriptDetailHtml(asset)}<p style="margin:8px 0 0;">${escapeHtml(asset.detail || "").replaceAll("\n", "<br>")}</p>`}</div>` : ""}
        </article>
      `;
    }

    function renderSessionAssets() {
      ["copy", "script", "video", "image"].forEach(type => {
        const assets = sessionAssets.filter(asset => asset.type === type);
        const list = document.getElementById(`${type}AssetList`);
        const empty = document.getElementById(`${type}AssetEmpty`);
        list.innerHTML = assets.map(drawerAssetHtml).join("");
        empty.style.display = assets.length ? "none" : "";
      });
      updateAssetCounts();
    }

    function activateAssetType(type) {
      document.querySelectorAll(".asset-type-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.assetType === type);
      });
      document.querySelectorAll(".asset-type-panel").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.assetPanel === type);
      });
    }

    document.querySelectorAll(".asset-type-tab").forEach(tab => {
      tab.addEventListener("click", () => activateAssetType(tab.dataset.assetType));
    });

    modelTrigger.addEventListener("click", event => {
      event.stopPropagation();
      if (modelTrigger.disabled) return;
      setAgentPicker(false);
      setModelPicker(!modelPicker.classList.contains("open"));
    });

    modelOptionList.addEventListener("click", event => {
      const option = event.target.closest(".model-option");
      if (!option) return;
      modelSelect.value = option.dataset.modelValue;
      renderModelPickerOptions();
      renderTaskModelStep();
      setModelPicker(false);
      showToast(`已切换为 ${selectedModelLabel()}`);
    });

    document.addEventListener("click", event => {
      if (!modelPicker.contains(event.target)) setModelPicker(false);
      if (!agentPicker.contains(event.target)) setAgentPicker(false);
      if (!newCreatePopover.contains(event.target) && event.target !== newCreateButton) setNewCreateMenu(false);
    });

    modelSelect.addEventListener("change", () => {
      renderModelPickerOptions();
      showToast(`已切换为 ${selectedModelLabel()}`);
    });

    function getSessionAsset(id) {
      return sessionAssets.find(asset => asset.id === id);
    }

    function locateAssetMessage(asset) {
      setAssetPanel(false);
      const message = document.getElementById(asset.messageId);
      if (!message) return;
      message.scrollIntoView({ behavior: "smooth", block: "center" });
      message.classList.remove("located");
      requestAnimationFrame(() => message.classList.add("located"));
      setTimeout(() => message.classList.remove("located"), 1700);
    }

    function runAgentWithAsset(type, prompt, asset) {
      if (type === "chat") {
        switchPage("creation");
        selectChat();
        pendingSourceAssetId = asset?.id || "";
        promptInput.value = prompt;
        showGeneratedResult(false);
        return;
      }
      const card = agentCards.find(item => item.dataset.type === type);
      if (!card) return;
      switchPage("creation");
      selectAgent(card, false);
      pendingSourceAssetId = asset?.id || "";
      promptInput.value = prompt;
      showGeneratedResult(false);
    }

    function syncSavedState(asset) {
      document.querySelectorAll(`[data-asset-id="${asset.id}"] .action-library`).forEach(button => {
        button.textContent = button.classList.contains("copy-result-action") ? "✓ 已保存" : "已存素材库";
        button.classList.add("saved");
      });
    }

    function handleAssetAction(action, asset, trigger) {
      if (!asset) return;
      if (action === "locate") {
        locateAssetMessage(asset);
        return;
      }
      if (action === "library") {
        asset.saved = true;
        syncSavedState(asset);
        renderSessionAssets();
        showToast(`已保存到${asset.type === "video" ? "视频库" : asset.type === "image" ? "图片库" : "文案库"}`);
        return;
      }
      if (action === "rename-copy") {
        const title = trigger.closest(".original-copy-heading")?.querySelector(".original-copy-title");
        if (!title || title.isContentEditable) return;
        const original = asset.title;
        title.contentEditable = "true";
        title.classList.add("is-editing");
        title.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(title);
        selection.removeAllRanges();
        selection.addRange(range);
        let finished = false;
        const finish = save => {
          if (finished) return;
          finished = true;
          const value = title.textContent.trim();
          asset.title = save && value ? value : original;
          title.textContent = asset.title;
          title.contentEditable = "false";
          title.classList.remove("is-editing");
          renderSessionAssets();
          if (save && value) showToast("文案标题已更新");
        };
        title.addEventListener("keydown", event => {
          if (event.key === "Enter") { event.preventDefault(); finish(true); }
          if (event.key === "Escape") { event.preventDefault(); finish(false); }
        });
        title.addEventListener("blur", () => finish(true), { once:true });
        return;
      }
      if (action === "edit-copy") {
        const card = trigger.closest(".original-copy-card");
        if (!card) return;
        card.classList.add("is-editing");
        const editor = card.querySelector(".original-copy-editor textarea");
        editor.value = asset.preview;
        editor.focus();
        return;
      }
      if (action === "cancel-copy-edit") {
        trigger.closest(".original-copy-card")?.classList.remove("is-editing");
        return;
      }
      if (action === "save-copy-edit") {
        const card = trigger.closest(".original-copy-card");
        const editor = card?.querySelector(".original-copy-editor textarea");
        const value = editor?.value.trim();
        if (!value) return showToast("文案内容不能为空");
        asset.preview = value;
        asset.wordCount = value.replace(/\s/g, "").length;
        renderOriginalTaskResult();
        renderSessionAssets();
        showToast(asset.saved ? "修改已同步至文案库" : "文案修改已保存到当前会话");
        return;
      }
      if (action === "chat-edit") {
        originalCopyTargetId = asset.id;
        pendingSourceAssetId = asset.id;
        renderOriginalTaskResult();
        syncTaskChatTarget();
        document.getElementById("taskChatSubtitle").textContent = `正在修改：${asset.title}`;
        promptInput.value = "";
        promptInput.placeholder = `描述对“${asset.title}”的修改要求`;
        promptInput.focus();
        showToast("已将该文案设为当前对话修改对象");
        return;
      }
      if (action === "to-script") {
        if (trigger.closest(".original-copy-card")) {
          const card = agentCards.find(item => item.dataset.type === "script");
          pendingSourceAssetId = asset.id;
          promptInput.value = `把“${asset.title}”转成结构化脚本，包含完整口播、分镜描述和混剪指令。`;
          selectAgent(card, true);
          showToast("已带入当前文案，进入智能脚本");
          return;
        }
        runAgentWithAsset("script", `把“${asset.title}”转成30秒结构化脚本，包含口播、分镜描述和混剪指令。`, asset);
        return;
      }
      if (action === "to-mix") {
        if (trigger.closest(".original-copy-card")) {
          const card = agentCards.find(item => item.dataset.type === "mix");
          pendingSourceAssetId = asset.id;
          promptInput.value = `使用“${asset.title}”智能补齐结构化脚本并完成混剪。`;
          selectAgent(card, true);
          showToast("已带入当前文案，进入智能混剪");
          return;
        }
        runAgentWithAsset("mix", `使用“${asset.title}”匹配素材并生成可终审成片。`, asset);
        return;
      }
      if (action === "similar") {
        const nextType = asset.type === "script" ? asset.sourceType : asset.sourceType || "original";
        runAgentWithAsset(nextType, `沿用“${asset.title}”的创作策略，再生成一组不同表达。`, asset);
        return;
      }
      if (action === "edit-script") {
        const type = asset.sourceType === "script-copy" ? "script-copy" : "script";
        const card = agentCards.find(item => item.dataset.type === type);
        selectAgent(card, false);
        pendingSourceAssetId = asset.id;
        promptInput.value = "请修改这份脚本的指定分镜，其他口播和镜头任务保持不变：";
        promptInput.focus();
        showToast("已带入脚本，可继续描述需要修改的分镜");
        return;
      }
      if (action === "use-in-mix") {
        asset.saved = true;
        syncSavedState(asset);
        renderSessionAssets();
        showToast("已保存到视频库，并加入智能混剪素材候选");
        return;
      }
      if (action === "view-script") {
        const card = trigger.closest(".generated-asset, .asset-drawer-card");
        card?.classList.toggle("show-detail");
        return;
      }
      if (action === "remix") {
        runAgentWithAsset("mix", `保留“${asset.title}”的脚本，只替换前3秒镜头并重新混剪。`, asset);
        return;
      }
      if (action === "submit") {
        showToast("已进入人工终审，确认后将提交千川提审");
        return;
      }
      if (action === "copy") {
        navigator.clipboard?.writeText(asset.preview);
        showToast("文案已复制");
        return;
      }
      if (action === "delete") {
        sessionAssets = sessionAssets.filter(item => item.id !== asset.id);
        document.querySelectorAll(`[data-asset-id="${asset.id}"]`).forEach(card => card.remove());
        renderSessionAssets();
        showToast("已从当前会话移除该文案");
        return;
      }
      showToast("已带入当前资产，可继续创作");
    }

    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-asset-action]");
      if (!trigger) return;
      const card = trigger.closest("[data-asset-id]");
      handleAssetAction(trigger.dataset.assetAction, getSessionAsset(card?.dataset.assetId), trigger);
    });

    taskResultHost.addEventListener("click", event => {
      const playButton = event.target.closest("[data-mix-result-play]");
      if (playButton) {
        const playing = playButton.classList.toggle("playing");
        playButton.textContent = playing ? "■" : "▶";
        taskResultHost.querySelector(".mix-video-stage")?.classList.toggle("playing", playing);
        showToast(playing ? "正在播放成片预览" : "已暂停预览");
        return;
      }
      // 智能混剪结果页 · 顶部"自动质检通过"chip 展开/收起面板
      const qualityToggle = event.target.closest("[data-mix-quality-toggle]");
      if (qualityToggle) {
        const panel = taskResultHost.querySelector("[data-mix-quality-panel]");
        if (!panel) return;
        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        qualityToggle.setAttribute("aria-expanded", String(willOpen));
        qualityToggle.classList.toggle("is-open", willOpen);
        return;
      }
      const seek = event.target.closest("[data-mix-seek]");
      if (seek) {
        taskResultHost.querySelectorAll("[data-mix-seek]").forEach(button => button.classList.toggle("active", button === seek));
        const time = taskResultHost.querySelector("[data-mix-player-time]");
        if (time) time.textContent = seek.dataset.mixSeek;
        showToast(`已定位到 ${seek.dataset.mixSeek} · ${seek.firstChild?.textContent?.trim() || "当前片段"}`);
        return;
      }
      const mixAction = event.target.closest("[data-mix-result-action]");
      if (mixAction) {
        const action = mixAction.dataset.mixResultAction;
        if (action === "back-script" || action === "remix") {
          setTaskStep(3);
          if (action === "remix") {
            const row = dynamicForm.querySelector('[data-mix-script-row="2"]');
            const body = row?.querySelector(".mix-script-body");
            if (body) body.hidden = false;
            const toggle = row?.querySelector("[data-mix-toggle-row]");
            if (toggle) toggle.textContent = "收起";
            showToast("已返回产品演示段，可替换素材后重新生成");
          }
          return;
        }
        if (action === "save") {
          mixAction.textContent = "✓ 已保存到成片视频库";
          mixAction.disabled = true;
          showToast("已保存到资产库 · 视频库 · 成片视频");
          return;
        }
        if (action === "download") {
          mixAction.textContent = "正在准备…";
          mixAction.disabled = true;
          setTimeout(() => {
            mixAction.textContent = "下载视频";
            mixAction.disabled = false;
            showToast("成片导出任务已创建，可在下载中心查看");
          }, 700);
          return;
        }
        if (action === "download-jianying") {
          mixAction.textContent = "正在打包…";
          mixAction.disabled = true;
          setTimeout(() => {
            mixAction.textContent = "下载剪映工程文件";
            mixAction.disabled = false;
            showToast("剪映工程文件已开始打包，可在下载中心查看 .jianying 工程");
          }, 800);
          return;
        }
      }
      const continueButton = event.target.closest("[data-original-continue]");
      if (continueButton) {
        appendOriginalCopyBatch(continueButton);
        return;
      }
      const menuTrigger = event.target.closest("[data-original-create-trigger]");
      if (menuTrigger) {
        event.stopPropagation();
        const menu = menuTrigger.closest(".original-create-menu");
        taskResultHost.querySelectorAll(".original-create-menu.open").forEach(item => {
          if (item !== menu) item.classList.remove("open");
        });
        menu.classList.toggle("open");
        return;
      }
      if (!event.target.closest(".original-create-menu")) {
        taskResultHost.querySelectorAll(".original-create-menu.open").forEach(item => item.classList.remove("open"));
      }
    });

    taskResultHost.addEventListener("input", event => {
      if (!event.target.matches(".original-copy-editor textarea")) return;
      const card = event.target.closest(".original-copy-card");
      const wordCount = event.target.value.replace(/\s/g, "").length;
      const duration = Math.max(1, Math.round(wordCount / 4));
      const meta = card?.querySelector(".original-copy-meta span");
      if (meta) meta.textContent = `${wordCount} 字 · 预计口播约 ${duration} 秒`;
    });

    document.addEventListener("click", event => {
      if (event.target.closest(".original-create-menu")) return;
      taskResultHost.querySelectorAll(".original-create-menu.open").forEach(item => item.classList.remove("open"));
    });

    chatOutput.addEventListener("scroll", updateConversationLocator, { passive: true });

    chatOutput.addEventListener("click", event => {
      const promptButton = event.target.closest(".guided-prompt");
      if (!promptButton) return;
      const sourceAssetId = promptButton.closest(".guided-prompts")?.dataset.sourceAssetId;
      runAgentWithAsset(promptButton.dataset.nextType, promptButton.dataset.guidedPrompt, getSessionAsset(sourceAssetId));
    });

    document.querySelectorAll(".goto-creation").forEach(button => {
      button.addEventListener("click", () => {
        switchPage("creation");
        const copyCard = agentCards.find(card => card.dataset.type === "copy");
        selectAgent(copyCard, false);
        promptInput.value = "参考刚才的拆解结果，为轻净 Pro 除螨仪生成三条原创仿写文案。";
        showToast("已带入拆解结果和参考视频");
      });
    });

    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const parent = tab.parentElement;
        parent.querySelectorAll(".tab").forEach(item => item.classList.remove("active"));
        tab.classList.add("active");
        if (parent.id === "libraryTabs") showToast(`已切换至${tab.textContent}`);
      });
    });

    document.getElementById("assetSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      document.querySelectorAll("#assetGrid .library-card").forEach(card => {
        card.style.display = card.dataset.search.toLowerCase().includes(keyword) ? "block" : "none";
      });
    });

    document.querySelectorAll(".creator-assign").forEach(button => {
      button.addEventListener("click", () => {
        button.textContent = "已分配";
        button.disabled = true;
        showToast("已按品类和当前负载分配给商务 BD");
      });
    });

    /* 品牌库：列表、详情与增删改查 */
    const brandCatalog = {
      qingjing: { name:"轻净", foundedYear:"2020", intro:"面向精致家庭的专业清洁电器品牌，用可验证的清洁效果降低家庭清洁焦虑。", position:"家庭深层清洁专家", tone:"专业、直接、可信；少用文学化表达，强调真实使用结果。", forbidden:"行业第一\n绝对除螨\n永久有效\n全网最低价", logo:"轻", logoClass:"", products:12 },
      jingjie: { name:"净界", foundedYear:"2018", intro:"通过智能清洁科技缩短家务链路，让复杂地面清洁变得简单高效。", position:"智能地面清洁解决方案品牌", tone:"科技、高效、克制；优先解释功能与使用收益。", forbidden:"彻底无菌\n零噪音\n全网第一", logo:"净", logoClass:"green", products:8 },
      qingxiang: { name:"轻享", foundedYear:"2021", intro:"服务年轻家庭的轻量厨房电器品牌，让日常烹饪更直观、更轻松。", position:"年轻家庭轻量厨房电器品牌", tone:"轻松、亲切、生活化；避免制造过度焦虑。", forbidden:"绝对健康\n零油脂\n永久不粘", logo:"享", logoClass:"orange", products:10 }
    };
    let currentBrandId = "qingjing";
    let brandLogoReady = false;
    let newBrandLogoData = "";
    const brandCreateModal = document.getElementById("brandCreateModal");
    const brandGrid = document.getElementById("brandMarketGrid");
    const deleteEntityModal = document.getElementById("deleteEntityModal");
    let pendingEntityDelete = null;
    function closeCardMenus(except = null) {
      document.querySelectorAll(".card-menu-wrap.open").forEach(menu => { if (menu !== except) menu.classList.remove("open"); });
    }
    function renderBrandLogo(element, brand) {
      if (!element || !brand) return;
      element.innerHTML = brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo || brand.name.slice(0,1));
    }
    function closeEntityDelete() { deleteEntityModal?.classList.remove("show"); pendingEntityDelete = null; }
    function requestEntityDelete(type, id, element) {
      const item = type === "brand" ? brandCatalog[id] : productDetailData[id];
      if (!item) return;
      pendingEntityDelete = { type, id, element };
      document.getElementById("deleteEntityTitle").textContent = `删除${type === "brand" ? "品牌" : "产品"}“${item.name}”？`;
      document.getElementById("deleteEntityCopy").textContent = type === "brand"
        ? "删除后无法恢复，品牌关联产品及已生成内容资产不会被删除；关联产品将暂时失去品牌策略约束。"
        : "删除后无法恢复，产品关联的文案、图片、脚本和视频资产不会被删除。";
      deleteEntityModal?.classList.add("show");
    }
    document.querySelectorAll("[data-close-entity-delete]").forEach(button => button.addEventListener("click", closeEntityDelete));
    deleteEntityModal?.addEventListener("click", event => { if (event.target === deleteEntityModal) closeEntityDelete(); });
    document.getElementById("confirmEntityDelete")?.addEventListener("click", () => {
      if (!pendingEntityDelete) return closeEntityDelete();
      const { type, id, element } = pendingEntityDelete;
      if (type === "brand") {
        const deletedBrandName = brandCatalog[id]?.name || "";
        Object.values(productDetailData || {}).forEach(product => {
          if (product.brand === deletedBrandName) product.brand = "";
        });
        element?.remove();
        delete brandCatalog[id];
        if (document.getElementById("page-brand-detail")?.classList.contains("active")) switchPage("brands");
        showToast("品牌已删除，原关联产品已转为无品牌产品");
      } else {
        const deletedProduct = productDetailData[id];
        window.deletedProductSnapshots = window.deletedProductSnapshots || [];
        if (deletedProduct) window.deletedProductSnapshots.push({ id, name:deletedProduct.name, deletedAt:new Date().toISOString() });
        element?.remove();
        delete productDetailData[id];
        if (typeof productCatalog !== "undefined") delete productCatalog[id];
        document.querySelectorAll(`select[data-product-select] option[value="${id}"], select[data-product-library] option[value="${id}"]`).forEach(option => option.remove());
        if (document.getElementById("page-product-detail")?.classList.contains("active")) switchPage("products");
        showToast("产品已删除；关联资产已保留，产品关联已解除");
      }
      window.syncBrandCardCounts?.();
      closeEntityDelete();
    });
    function setBrandDetail(id) {
      const brand = brandCatalog[id];
      if (!brand) return;
      currentBrandId = id;
      document.getElementById("brandDetailLogo").className = `brand-detail-logo ${brand.logoClass || ""}`;
      renderBrandLogo(document.getElementById("brandDetailLogo"), brand);
      renderBrandLogo(document.getElementById("brandLogoThumb"), brand);
      document.getElementById("brandDetailName").textContent = brand.name;
      document.getElementById("brandDetailIntro").textContent = brand.intro;
      document.querySelectorAll("#page-brand-detail [data-brand-field]").forEach(field => {
        const key = field.dataset.brandField;
        if (key === "logo") return;
        const value = brand[key] || "";
        const view = field.querySelector(".brand-value");
        const input = field.querySelector("input, textarea");
        if (view) view.textContent = value;
        if (input) input.value = value;
        field.classList.remove("is-editing");
        const edit = field.querySelector(".brand-field-edit");
        if (edit) edit.textContent = "编辑";
      });
      switchPage("brand-detail");
    }
    brandGrid?.addEventListener("click", event => {
      const card = event.target.closest("[data-brand-id]");
      if (!card) return;
      const menuTrigger = event.target.closest("[data-toggle-card-menu]");
      if (menuTrigger) {
        event.stopPropagation();
        const menu = menuTrigger.closest(".card-menu-wrap");
        const opening = !menu.classList.contains("open");
        closeCardMenus(menu);
        menu.classList.toggle("open", opening);
        return;
      }
      if (event.target.closest("[data-delete-brand]")) {
        event.stopPropagation();
        closeCardMenus();
        requestEntityDelete("brand", card.dataset.brandId, card);
        return;
      }
      setBrandDetail(card.dataset.brandId);
    });
    brandGrid?.addEventListener("keydown", event => { if (event.key === "Enter" && event.target.matches("[data-brand-id]")) setBrandDetail(event.target.dataset.brandId); });
    document.querySelectorAll("[data-back-brands]").forEach(button => button.addEventListener("click", () => switchPage("brands")));
    document.querySelector("[data-delete-current-brand]")?.addEventListener("click", () => requestEntityDelete("brand", currentBrandId, brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"]`)));
    document.querySelectorAll("[data-open-brand-create]").forEach(button => button.addEventListener("click", () => { brandLogoReady = false; newBrandLogoData = ""; document.getElementById("brandLogoCreateFile").value = ""; document.getElementById("brandLogoUpload").classList.remove("has-image"); document.getElementById("brandLogoUpload").textContent = "点击上传品牌 Logo"; brandCreateModal?.classList.add("show"); }));
    document.getElementById("quickCreateBrand")?.addEventListener("click", () => {
      window.pendingProductBrandInput = document.querySelector('[data-product-create-panel="manual"] input[list="productBrandOptions"]');
      document.querySelector("[data-close-product-modal]")?.click();
      brandLogoReady = false; newBrandLogoData = "";
      document.getElementById("brandLogoUpload").classList.remove("has-image");
      document.getElementById("brandLogoUpload").textContent = "点击上传品牌 Logo";
      brandCreateModal?.classList.add("show");
    });
    document.querySelectorAll("[data-close-brand-create]").forEach(button => button.addEventListener("click", () => {
      brandCreateModal?.classList.remove("show");
      if (window.pendingProductBrandInput) {
        window.pendingProductBrandInput = null;
        productCreateModal?.classList.add("show");
      }
    }));
    document.getElementById("brandLogoUpload")?.addEventListener("click", () => document.getElementById("brandLogoCreateFile")?.click());
    document.getElementById("brandLogoCreateFile")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { newBrandLogoData = reader.result; brandLogoReady = true; document.getElementById("brandLogoUpload").classList.add("has-image"); document.getElementById("brandLogoUpload").textContent = `已选择：${file.name} · 点击可重新选择`; };
      reader.readAsDataURL(file);
    });
    const brandDetailLogoFile = document.getElementById("brandDetailLogoFile");
    document.querySelector("#page-brand-detail [data-brand-logo-upload]")?.addEventListener("click", () => brandDetailLogoFile?.click());
    brandDetailLogoFile?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file || !brandCatalog[currentBrandId]) return;
      const reader = new FileReader();
      reader.onload = () => {
        brandCatalog[currentBrandId].logoData = reader.result;
        renderBrandLogo(document.getElementById("brandDetailLogo"), brandCatalog[currentBrandId]);
        renderBrandLogo(document.getElementById("brandLogoThumb"), brandCatalog[currentBrandId]);
        const cardLogo = brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"] .brand-card-logo`);
        renderBrandLogo(cardLogo, brandCatalog[currentBrandId]);
        showToast("品牌 Logo 已替换");
      };
      reader.readAsDataURL(file);
    });
    document.querySelectorAll("#page-brand-detail .brand-field-edit").forEach(button => button.addEventListener("click", () => {
      const field = button.closest(".brand-field");
      if (field.dataset.brandField === "logo") { brandDetailLogoFile?.click(); return; }
      const editing = field.classList.toggle("is-editing");
      button.textContent = editing ? "完成" : "编辑";
      if (editing) { field.querySelector("input, textarea")?.focus(); return; }
      const key = field.dataset.brandField;
      if (key !== "logo") {
        const input = field.querySelector("input, textarea");
        const value = input?.value.trim() || "";
        if (key === "name") {
          const normalizedName = value.replace(/\s+/g, "").toLowerCase();
          const conflict = Object.entries(brandCatalog).find(([id, item]) => id !== currentBrandId && String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedName);
          if (conflict) {
            field.classList.add("is-editing");
            button.textContent = "完成";
            input?.focus();
            showToast(`品牌“${conflict[1].name}”已存在，名称未保存`);
            return;
          }
        }
        if (key === "foundedYear" && value && (Number(value) < 1800 || Number(value) > 2026)) {
          field.classList.add("is-editing");
          button.textContent = "完成";
          input?.focus();
          showToast("品牌成立年份需填写 1800—2026 之间的年份");
          return;
        }
        field.querySelector(".brand-value").textContent = value;
        if (brandCatalog[currentBrandId]) brandCatalog[currentBrandId][key] = value;
        if (key === "name") document.getElementById("brandDetailName").textContent = value;
        if (key === "intro") document.getElementById("brandDetailIntro").textContent = value;
      }
      const card = brandGrid?.querySelector(`[data-brand-id="${currentBrandId}"]`);
      if (card && brandCatalog[currentBrandId]) {
        card.querySelector("h3").textContent = brandCatalog[currentBrandId].name;
        card.querySelector(".brand-card-desc").textContent = brandCatalog[currentBrandId].intro;
      }
      showToast("品牌信息已保存，并同步至创作上下文");
    }));
    function createBrandCard(id, brand) {
      const card = document.createElement("article");
      card.className = "brand-market-card";
      card.tabIndex = 0;
      card.dataset.brandId = id;
      const tags = brand.tone.split(/[、，；;]/).map(item => item.trim()).filter(Boolean).slice(0,3);
      card.innerHTML = `<span class="card-menu-wrap"><button class="card-menu-trigger" type="button" data-toggle-card-menu aria-label="品牌操作">···</button><span class="card-action-menu" role="menu"><button type="button" data-delete-brand>删除</button></span></span><div class="brand-card-top"><div class="brand-card-logo">${brand.logoData ? `<img src="${brand.logoData}" alt="${escapeHtml(brand.name)} Logo">` : escapeHtml(brand.logo)}</div><div><h3>${escapeHtml(brand.name)}</h3><small>新建品牌</small></div></div><p class="brand-card-desc">${escapeHtml(brand.intro)}</p><div class="brand-card-foot"><span>关联产品 0</span><span>刚刚创建</span></div>`;
      return card;
    }
    document.getElementById("saveBrandEntry")?.addEventListener("click", () => {
      const name = document.getElementById("brandFormName")?.value.trim();
      const foundedYear = document.getElementById("brandFormFoundedYear")?.value.trim() || "";
      const intro = document.getElementById("brandFormIntro")?.value.trim();
      const position = document.getElementById("brandFormPosition")?.value.trim();
      const tone = document.getElementById("brandFormTone")?.value.trim();
      const forbidden = document.getElementById("brandFormForbidden")?.value.trim() || "";
      if (!brandLogoReady || !name || !intro || !position || !tone) return showToast("请补全标记 * 的品牌信息");
      if (foundedYear && (Number(foundedYear) < 1800 || Number(foundedYear) > 2026)) return showToast("品牌成立年份需填写 1800—2026 之间的年份");
      const normalizedName = name.replace(/\s+/g, "").toLowerCase();
      const duplicateBrand = Object.values(brandCatalog).find(item => String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedName);
      if (duplicateBrand) {
        document.getElementById("brandFormName")?.focus();
        return showToast(`品牌“${duplicateBrand.name}”已存在，不能重复创建`);
      }
      const id = `brand-${Date.now()}`;
      const brand = { name, foundedYear, intro, position, tone, forbidden, logo:name.slice(0,1), logoData:newBrandLogoData, logoClass:"", products:0 };
      brandCatalog[id] = brand;
      brandGrid?.append(createBrandCard(id, brand));
      window.syncBrandCardCounts?.();
      const brandOptions = document.getElementById("productBrandOptions");
      if (brandOptions && ![...brandOptions.options].some(option => option.value === name)) brandOptions.append(new Option("", name));
      if (window.pendingProductBrandInput) {
        window.pendingProductBrandInput.value = name;
        window.pendingProductBrandInput = null;
        productCreateModal?.classList.add("show");
      }
      brandCreateModal?.classList.remove("show");
      showToast("品牌已新增，可进入详情继续维护品牌策略");
    });
    document.getElementById("brandSearch")?.addEventListener("input", event => {
      const keyword = event.target.value.trim().toLowerCase();
      brandGrid?.querySelectorAll("[data-brand-id]").forEach(card => card.hidden = !card.textContent.toLowerCase().includes(keyword));
    });

    const productCreateModal = document.getElementById("productCreateModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const productPlatforms = ["抖音", "快手", "视频号", "小红书", "百度", "天猫", "京东", "拼多多"];
    const productDetailData = {
      "mite-pro": { id:"mite-pro", name:"轻净 Pro 除螨仪", brand:"轻净", category:"清洁电器", price:"¥399", currencyCode:"CNY", links:[{ platform:"抖音", url:"https://shop.example.com/mite-pro" },{ platform:"天猫", url:"https://tmall.example.com/mite-pro" }], description:"产品型号：QJ-CM01\n额定功率：400W\n尘杯容量：0.5L\n产品净重：1.42kg\n产品尺寸：268×198×142mm\n电源方式：有线 220V\n包装清单：主机、滤芯×2、说明书\n售后说明：整机质保 1 年", core:"12kPa 大吸力深入床褥纤维\n高频拍打与吸尘同步完成\n透明尘杯让清洁效果可视化\n双层过滤，减少二次扬尘", secondary:"床褥、抱枕和毛绒玩具均可使用\n电源线满足卧室日常清洁范围\n收纳体积小，不占家庭空间", difference:"清洁结果可直接在透明尘杯中看到\n拍、吸、滤一体完成深层清洁\n围绕家庭高频软装场景设计", trust:"整机质保 1 年，售后信息可追溯\n产品参数及包装清单均可核验\n官方渠道销售，支持正品验证\n透明尘杯可直接展示清洁结果\n核心功能均有实拍素材证明", trustAttachments:[{ id:"trust-warranty", name:"整机质保服务说明.pdf", size:1887437, mimeType:"application/pdf", uploadedAt:"08-12 15:20", status:"ready", sample:true },{ id:"trust-spec", name:"产品参数与包装清单.xlsx", size:401408, mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploadedAt:"08-11 10:30", status:"ready", sample:true }], forbidden:"百分百除螨、彻底杀灭\n全网最低价、史上最低\n未经资质支持的除菌率\n永久有效、一次使用终身无螨\n无法证明的竞品对比结论" },
      "air-a8": { id:"air-a8", name:"轻享空气炸锅 A8", brand:"轻享", category:"厨房电器", price:"¥299", currencyCode:"CNY", links:[{ platform:"抖音", url:"https://shop.example.com/air-a8" }], description:"产品型号：A8\n容量：5L\n控制方式：触控\n可视窗口：支持", core:"可视化烹饪窗口\n大容量满足家庭用餐", secondary:"炸篮可拆卸清洗", difference:"烹饪过程看得见，减少反复开盖", trust:"产品参数及包装清单可核验", forbidden:"零油脂\n绝对健康" },
      "washer-s5": { id:"washer-s5", name:"净界洗地机 S5", brand:"净界", category:"清洁电器", price:"¥1,599", currencyCode:"CNY", links:[{ platform:"天猫", url:"https://shop.example.com/washer-s5" }], description:"产品型号：S5\n清洁方式：吸拖洗一体\n滚刷：支持自清洁", core:"吸拖洗一体\n干湿垃圾同步处理", secondary:"滚刷自清洁", difference:"一次推进完成复杂地面清洁", trust:"官方渠道销售，售后信息可追溯", forbidden:"彻底无菌\n零噪音" },
      "blend-mini": { id:"blend-mini", name:"随行榨汁杯 Mini", brand:"轻享", category:"厨房电器", price:"¥169", currencyCode:"CNY", links:[{ platform:"拼多多", url:"https://shop.example.com/blend-mini" }], description:"容量：350ml\n充电方式：USB-C\n杯体材质：食品接触级材质", core:"便携榨汁\n一键清洗", secondary:"轻巧杯身便于携带", difference:"杯体与主机一体化设计", trust:"材质及产品参数可核验", forbidden:"绝对无菌\n永久锋利" }
    };
    const trustAttachmentMaxBytes = 50 * 1024 * 1024;
    let currentProductDetailId = "mite-pro";
    let productCreateTrustAttachments = [];
    function toggleProductModal(modal, show) { modal?.classList.toggle("show", show); }
    function detectProductPlatform(url = "") {
      const value = String(url).toLowerCase();
      if (/douyin|jinritemai|抖音/.test(value)) return "抖音";
      if (/kuaishou|快手/.test(value)) return "快手";
      if (/weixin|wechat|channels|视频号/.test(value)) return "视频号";
      if (/xiaohongshu|xhslink|小红书/.test(value)) return "小红书";
      if (/baidu|百度/.test(value)) return "百度";
      if (/tmall|taobao|天猫/.test(value)) return "天猫";
      if (/jd\.com|jingdong|京东/.test(value)) return "京东";
      if (/pinduoduo|yangkeduo|拼多多/.test(value)) return "拼多多";
      return productPlatforms[0];
    }
    function productLinksOf(product) {
      if (Array.isArray(product?.links)) return product.links;
      return product?.link ? [{ platform:detectProductPlatform(product.link), url:product.link }] : [];
    }
    function syncProductToCreationSelectors(id, name) {
      document.querySelectorAll("select[data-product-select], select[data-product-library]").forEach(select => {
        if (![...select.options].some(option => option.value === id)) select.append(new Option(name, id));
      });
    }
    function platformOptionsMarkup(selected = "") {
      return productPlatforms.map(name => `<option${name === selected ? " selected" : ""}>${escapeHtml(name)}</option>`).join("");
    }
    function createProductLinkRow(container, link = {}) {
      if (!container) return null;
      const row = document.createElement("div");
      row.className = "product-link-row";
      row.innerHTML = `<select aria-label="商品平台">${platformOptionsMarkup(link.platform || productPlatforms[0])}</select><input type="url" aria-label="商品链接" placeholder="粘贴商品链接" value="${escapeHtml(link.url || "")}"><button class="product-link-remove" type="button" aria-label="删除链接">×</button>`;
      row.querySelector(".product-link-remove").addEventListener("click", () => row.remove());
      container.append(row);
      return row;
    }
    function readProductLinkRows(container) {
      const rows = [...(container?.querySelectorAll(".product-link-row") || [])].map(row => ({ platform:row.querySelector("select")?.value.trim() || "", url:row.querySelector("input")?.value.trim() || "" }));
      const incomplete = rows.some(item => (item.platform || item.url) && !(item.platform && item.url));
      const links = rows.filter(item => item.platform && item.url);
      const invalid = links.some(item => !/^https?:\/\/\S+$/i.test(item.url));
      const duplicate = links.some((item, index) => links.findIndex(other => other.url.toLowerCase() === item.url.toLowerCase()) !== index);
      return { links, incomplete, invalid, duplicate };
    }
    function trustAttachmentsOf(product) {
      if (!product) return [];
      if (!Array.isArray(product.trustAttachments)) product.trustAttachments = [];
      return product.trustAttachments;
    }
    function trustAttachmentExtension(attachment = {}) {
      const extension = String(attachment.name || "").split(".").pop()?.trim().toUpperCase();
      return extension && extension.length <= 8 ? extension : "FILE";
    }
    function trustAttachmentSize(bytes = 0) {
      const value = Number(bytes) || 0;
      if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(value >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
      return `${Math.max(1, Math.round(value / 1024))} KB`;
    }
    function trustAttachmentIsPreviewable(attachment = {}) {
      const type = String(attachment.mimeType || "").toLowerCase();
      return /^(image|video|audio|text)\//.test(type) || type === "application/pdf" || trustAttachmentExtension(attachment) === "PDF";
    }
    function trustAttachmentCollection(scope) {
      return scope === "create" ? productCreateTrustAttachments : trustAttachmentsOf(productDetailData[currentProductDetailId]);
    }
    function trustAttachmentListMarkup(attachments, scope) {
      if (!attachments.length) return '<div class="trust-attachment-empty">暂无背书附件，上传后将作为产品事实的佐证材料。</div>';
      return attachments.map(attachment => {
        return `<article class="trust-attachment-row${attachment.status === "uploading" ? " is-uploading" : ""}"><span class="trust-attachment-icon">${escapeHtml(trustAttachmentExtension(attachment))}</span><div class="trust-attachment-file"><strong title="${escapeHtml(attachment.name)}">${escapeHtml(attachment.name)}</strong><span>${trustAttachmentSize(attachment.size)} · ${attachment.uploadedAt || "刚刚"}</span></div><div class="trust-attachment-actions"><button type="button" data-trust-attachment-action="open" data-trust-attachment-scope="${scope}" data-trust-attachment-id="${escapeHtml(attachment.id)}">预览</button><button class="trust-attachment-remove" type="button" data-trust-attachment-action="remove" data-trust-attachment-scope="${scope}" data-trust-attachment-id="${escapeHtml(attachment.id)}">删除</button></div></article>`;
      }).join("");
    }
    function renderProductTrustAttachments(detail = productDetailData[currentProductDetailId]) {
      const attachments = trustAttachmentsOf(detail);
      const list = document.getElementById("productTrustAttachmentList");
      const count = document.getElementById("productTrustAttachmentCount");
      if (list) list.innerHTML = trustAttachmentListMarkup(attachments, "detail");
      if (count) count.textContent = attachments.length;
    }
    function renderProductCreateTrustAttachments() {
      const list = document.getElementById("productCreateTrustAttachmentList");
      const count = document.getElementById("productCreateTrustAttachmentCount");
      if (list) list.innerHTML = trustAttachmentListMarkup(productCreateTrustAttachments, "create");
      if (count) count.textContent = productCreateTrustAttachments.length;
    }
    function releaseTrustAttachmentUrls(attachments = []) {
      attachments.forEach(attachment => { if (attachment.objectUrl) URL.revokeObjectURL(attachment.objectUrl); });
    }
    function addTrustAttachments(files, scope) {
      const collection = trustAttachmentCollection(scope);
      const rejected = [];
      const additions = Array.from(files || []).filter(file => {
        if (file.size > trustAttachmentMaxBytes) { rejected.push(file.name); return false; }
        if (collection.some(item => item.name === file.name && Number(item.size) === Number(file.size))) { rejected.push(`${file.name}（重复）`); return false; }
        return true;
      }).map(file => ({ id:`trust-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name:file.name, size:file.size, mimeType:file.type || "", uploadedAt:"刚刚", status:"uploading", file, objectUrl:URL.createObjectURL(file) }));
      if (rejected.length) showToast(`已跳过 ${rejected.length} 个文件：单个文件最大 50 MB，且不重复添加`);
      if (!additions.length) return;
      collection.push(...additions);
      scope === "create" ? renderProductCreateTrustAttachments() : renderProductTrustAttachments();
      window.setTimeout(() => {
        additions.forEach(item => { item.status = "ready"; });
        scope === "create" ? renderProductCreateTrustAttachments() : renderProductTrustAttachments();
        showToast(`已上传 ${additions.length} 份背书附件`);
      }, 480);
    }
    function openTrustAttachment(attachment) {
      const previewWindow = window.open("", "_blank");
      if (!previewWindow) { showToast("预览窗口被拦截，请允许浏览器打开新窗口"); return; }
      previewWindow.opener = null;
      if (trustAttachmentIsPreviewable(attachment)) {
        if (attachment?.objectUrl) previewWindow.location.href = attachment.objectUrl;
        else previewWindow.document.write(`<main style="font:14px/1.6 system-ui,sans-serif;padding:32px;color:#36313d"><h2>${escapeHtml(attachment.name || "背书附件")}</h2><p>这是原型示例附件。正式环境将加载实际文件内容。</p></main>`);
        return;
      }
      const download = attachment?.objectUrl ? `<a href="${attachment.objectUrl}" download="${escapeHtml(attachment.name || "背书附件")}" style="display:inline-flex;margin-top:18px;padding:9px 14px;border-radius:8px;color:#fff;background:#6550bd;text-decoration:none">下载文件后查看</a>` : "<p>这是原型示例附件。正式环境将提供文件下载与在线解析预览。</p>";
      previewWindow.document.write(`<main style="max-width:720px;font:14px/1.6 system-ui,sans-serif;padding:32px;color:#36313d"><p style="margin:0 0 8px;color:#806ac7;font-size:12px">文件预览</p><h2 style="margin:0 0 6px">${escapeHtml(attachment?.name || "背书附件")}</h2><p style="margin:0;color:#827b89">${escapeHtml(trustAttachmentExtension(attachment))} · ${trustAttachmentSize(attachment?.size)}</p><div style="margin-top:24px;padding:24px;border:1px solid #e9e4f3;border-radius:12px;background:#fbfaff"><strong>当前浏览器无法直接解析此文件格式</strong><p style="margin:8px 0 0;color:#746d7b">文件仍可预览其基本信息，并可下载后使用对应软件打开。</p>${download}</div></main>`);
    }
    function removeTrustAttachment(id, scope) {
      const collection = trustAttachmentCollection(scope);
      const attachment = collection.find(item => item.id === id);
      if (!attachment || !window.confirm(`确定删除附件“${attachment.name}”？`)) return;
      if (attachment.objectUrl) URL.revokeObjectURL(attachment.objectUrl);
      const next = collection.filter(item => item.id !== id);
      if (scope === "create") productCreateTrustAttachments = next;
      else productDetailData[currentProductDetailId].trustAttachments = next;
      scope === "create" ? renderProductCreateTrustAttachments() : renderProductTrustAttachments();
      showToast("背书附件已删除");
    }
    function addProductPlatform(name, targetSelect = null) {
      const value = String(name || "").trim();
      if (!value) { showToast("请输入平台名称"); return false; }
      const existing = productPlatforms.find(item => item.toLowerCase() === value.toLowerCase());
      if (existing) { showToast(`平台“${existing}”已存在`); return false; }
      productPlatforms.push(value);
      document.querySelectorAll(".product-link-row select").forEach(select => select.append(new Option(value, value)));
      if (targetSelect) targetSelect.value = value;
      showToast(`已新增平台“${value}”`);
      return true;
    }
    function renderProductDetailContent(detail) {
      document.querySelectorAll("#page-product-detail [data-product-content]").forEach(surface => {
        const value = detail[surface.dataset.productContent] || "";
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        const list = surface.querySelector(".editable-view");
        const textarea = surface.querySelector("textarea");
        const count = surface.querySelector(".multi-info-head small");
        if (list) list.innerHTML = lines.length ? lines.map(line => `<li>${escapeHtml(line)}</li>`).join("") : '<li class="product-link-empty">暂未填写</li>';
        if (textarea) textarea.value = value;
        if (count) count.textContent = lines.length;
        surface.classList.remove("is-editing");
        const edit = surface.querySelector("[data-inline-edit]");
        if (edit) edit.textContent = "编辑";
      });
      if (productDescriptionSource) productDescriptionSource.value = detail.description || "";
      originalDescription = detail.description || "";
      if (typeof parseDescriptionText === "function") parseDescriptionText();
      renderProductTrustAttachments(detail);
    }
    function renderProductDetailLinks(detail) {
      const list = document.getElementById("productDetailLinkList");
      const editor = document.getElementById("productDetailLinkRows");
      const links = productLinksOf(detail);
      if (list) list.innerHTML = links.length ? links.map(link => `<span class="product-detail-link-item"><b>${escapeHtml(link.platform)}</b><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url)}</a></span>`).join("") : '<span class="product-link-empty">暂未添加商品链接</span>';
      if (editor) { editor.innerHTML = ""; links.forEach(link => createProductLinkRow(editor, link)); }
      document.getElementById("productDetailLinkSurface")?.classList.remove("is-editing");
      document.getElementById("detailPlatformCreateLine")?.classList.remove("show");
      const action = document.getElementById("editDetailLinks");
      if (action) action.textContent = "编辑";
    }
    const productCreateLinkRows = document.getElementById("productCreateLinkRows");
    createProductLinkRow(productCreateLinkRows);
    function resetProductCreateForm() {
      ["productFormName","productFormBrand","productFormPrice","productFormDescription","productFormCore","productFormSecondary","productFormDifference","productFormTrust","productFormForbidden"].forEach(id => { const field = document.getElementById(id); if (field) field.value = ""; });
      const category = document.getElementById("productCategorySelect");
      if (category) category.selectedIndex = 0;
      const currency = document.getElementById("productCurrencySelect");
      if (currency) currency.value = "CNY";
      const upload = document.querySelector("[data-product-upload]");
      if (upload) { delete upload.dataset.ready; upload.textContent = "点击上传产品图片，或拖拽图片至此"; }
      releaseTrustAttachmentUrls(productCreateTrustAttachments);
      productCreateTrustAttachments = [];
      renderProductCreateTrustAttachments();
      if (productCreateLinkRows) { productCreateLinkRows.innerHTML = ""; createProductLinkRow(productCreateLinkRows); }
      document.getElementById("platformCreateLine")?.classList.remove("show");
    }
    document.querySelectorAll("[data-open-product-create]").forEach(button => button.addEventListener("click", () => { resetProductCreateForm(); toggleProductModal(productCreateModal, true); }));
    document.querySelectorAll("[data-close-product-modal]").forEach(button => button.addEventListener("click", () => toggleProductModal(productCreateModal, false)));
    function openProductDetail(productId) {
      const detail = productDetailData[productId] || productDetailData["mite-pro"];
      currentProductDetailId = productDetailData[productId] ? productId : "mite-pro";
      document.getElementById("pageDetailName").textContent = detail.name;
      document.getElementById("pageDetailBrand").textContent = detail.brand;
      document.getElementById("pageDetailCategory").textContent = detail.category;
      document.getElementById("pageDetailPrice").textContent = detail.price;
      const compactFields = [...document.querySelectorAll("#page-product-detail .compact-kv")];
      const detailCurrency = detail.currencyCode || "CNY";
      [detail.name, detail.brand, detail.category, `${detail.price} ${detailCurrency}`].forEach((value, index) => {
        const field = compactFields[index];
        if (!field) return;
        const view = field.querySelector(".compact-value");
        const input = field.querySelector(".editable-editor input");
        if (view) view.textContent = value;
        if (input) input.value = index === 3 ? detail.price.replace(/[^\d.]/g, "") : value;
        if (index === 3) {
          const select = field.querySelector(".editable-editor select");
          if (select) select.value = detailCurrency;
        }
      });
      renderProductDetailLinks(detail);
      renderProductDetailContent(detail);
      switchPage("product-detail");
    }
    document.getElementById("productMarketGrid")?.addEventListener("click", event => {
      const menuTrigger = event.target.closest("[data-toggle-card-menu]");
      if (menuTrigger) {
        event.preventDefault();
        event.stopPropagation();
        const menu = menuTrigger.closest(".card-menu-wrap");
        const opening = !menu.classList.contains("open");
        closeCardMenus(menu);
        menu.classList.toggle("open", opening);
        return;
      }
      const trigger = event.target.closest("[data-delete-product]");
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      closeCardMenus();
      const card = trigger.closest("[data-product-id]");
      if (card) requestEntityDelete("product", card.dataset.productId, card);
    }, true);
    document.querySelector("[data-delete-current-product]")?.addEventListener("click", () => requestEntityDelete("product", currentProductDetailId, document.querySelector(`#productMarketGrid [data-product-id="${currentProductDetailId}"]`)));
    document.querySelectorAll("[data-open-product-detail]").forEach(button => button.addEventListener("click", () => openProductDetail(button.dataset.productId)));
    document.querySelectorAll("[data-close-product-detail]").forEach(button => button.addEventListener("click", () => toggleProductModal(productDetailModal, false)));
    document.getElementById("productTrustAttachmentUpload")?.addEventListener("click", () => document.getElementById("productTrustAttachmentInput")?.click());
    document.getElementById("productCreateTrustAttachmentUpload")?.addEventListener("click", () => document.getElementById("productCreateTrustAttachmentInput")?.click());
    document.getElementById("productTrustAttachmentInput")?.addEventListener("change", event => {
      addTrustAttachments(event.target.files, "detail");
      event.target.value = "";
    });
    document.getElementById("productCreateTrustAttachmentInput")?.addEventListener("change", event => {
      addTrustAttachments(event.target.files, "create");
      event.target.value = "";
    });
    document.addEventListener("click", event => {
      const action = event.target.closest("[data-trust-attachment-action]");
      if (!action) return;
      const scope = action.dataset.trustAttachmentScope;
      const attachment = trustAttachmentCollection(scope).find(item => item.id === action.dataset.trustAttachmentId);
      if (!attachment) return;
      if (action.dataset.trustAttachmentAction === "open") openTrustAttachment(attachment);
      if (action.dataset.trustAttachmentAction === "remove") removeTrustAttachment(attachment.id, scope);
    });
    document.querySelectorAll("[data-product-create-mode]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-create-mode]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-create-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productCreatePanel === button.dataset.productCreateMode));
    }));
    document.querySelector("[data-product-upload]")?.addEventListener("click", event => { event.currentTarget.dataset.ready = "true"; event.currentTarget.textContent = "已选择：产品主图_01.png · 点击可重新选择"; showToast("产品图片已添加"); });
    document.getElementById("addProductLinkRow")?.addEventListener("click", () => createProductLinkRow(productCreateLinkRows));
    document.getElementById("showPlatformCreate")?.addEventListener("click", () => { document.getElementById("platformCreateLine")?.classList.add("show"); document.getElementById("newPlatformName")?.focus(); });
    document.getElementById("cancelPlatformCreate")?.addEventListener("click", () => { document.getElementById("platformCreateLine")?.classList.remove("show"); document.getElementById("newPlatformName").value = ""; });
    document.getElementById("confirmPlatformCreate")?.addEventListener("click", () => {
      const input = document.getElementById("newPlatformName");
      const lastSelect = productCreateLinkRows?.querySelector(".product-link-row:last-child select");
      if (!addProductPlatform(input?.value, lastSelect)) return;
      input.value = "";
      document.getElementById("platformCreateLine")?.classList.remove("show");
      if (!lastSelect) createProductLinkRow(productCreateLinkRows, { platform:productPlatforms.at(-1) });
    });
    document.getElementById("editDetailLinks")?.addEventListener("click", () => {
      const surface = document.getElementById("productDetailLinkSurface");
      if (!surface) return;
      if (!surface.classList.contains("is-editing")) {
        renderProductDetailLinks(productDetailData[currentProductDetailId]);
        surface.classList.add("is-editing");
        document.getElementById("editDetailLinks").textContent = "完成";
        return;
      }
      const result = readProductLinkRows(document.getElementById("productDetailLinkRows"));
      if (result.incomplete) return showToast("每条商品链接都需要选择平台并填写链接");
      if (result.invalid) return showToast("请填写以 http:// 或 https:// 开头的有效链接");
      if (result.duplicate) return showToast("相同商品链接不能重复添加");
      const conflict = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && productLinksOf(product).some(old => result.links.some(link => old.url.toLowerCase() === link.url.toLowerCase())));
      if (conflict) return showToast(`链接已关联产品“${conflict[1].name}”，不能重复绑定`);
      productDetailData[currentProductDetailId].links = result.links;
      delete productDetailData[currentProductDetailId].link;
      renderProductDetailLinks(productDetailData[currentProductDetailId]);
      showToast("商品链接已保存");
    });
    document.getElementById("cancelDetailLinks")?.addEventListener("click", () => renderProductDetailLinks(productDetailData[currentProductDetailId]));
    document.getElementById("addDetailProductLink")?.addEventListener("click", () => createProductLinkRow(document.getElementById("productDetailLinkRows")));
    document.getElementById("showDetailPlatformCreate")?.addEventListener("click", () => { document.getElementById("detailPlatformCreateLine")?.classList.add("show"); document.getElementById("detailPlatformName")?.focus(); });
    document.getElementById("cancelDetailPlatform")?.addEventListener("click", () => { document.getElementById("detailPlatformCreateLine")?.classList.remove("show"); document.getElementById("detailPlatformName").value = ""; });
    document.getElementById("confirmDetailPlatform")?.addEventListener("click", () => {
      const input = document.getElementById("detailPlatformName");
      const rows = document.getElementById("productDetailLinkRows");
      let lastSelect = rows?.querySelector(".product-link-row:last-child select");
      if (!lastSelect) lastSelect = createProductLinkRow(rows)?.querySelector("select");
      if (!addProductPlatform(input?.value, lastSelect)) return;
      input.value = "";
      document.getElementById("detailPlatformCreateLine")?.classList.remove("show");
    });
    document.getElementById("addCategoryButton")?.addEventListener("click", () => document.getElementById("addCategoryInput").classList.toggle("show"));
    document.getElementById("confirmCategoryButton")?.addEventListener("click", () => {
      const input = document.querySelector("#addCategoryInput input");
      const name = input?.value.trim();
      if (!name) return showToast("请输入类目名称");
      const option = new Option(name, name, true, true);
      document.getElementById("productCategorySelect").add(option);
      input.value = "";
      document.getElementById("addCategoryInput").classList.remove("show");
      showToast(`已新增类目“${name}”`);
    });
    function makeParsingProductCard(name, productId, link = "", category = "商品解析中") {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "product-market-card is-parsing";
      card.dataset.productId = productId;
      card.dataset.productLink = link;
      card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${category}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="parse-state parsing"><strong>正在解析</strong><span>识别产品信息中…</span></div><div class="product-market-assets"><span>文案 —</span><span>脚本 —</span><span>素材 —</span><span>视频 —</span></div></div>`;
      card.addEventListener("click", () => showToast("产品信息正在解析中，完成后可查看详情"));
      const finishParsing = () => setTimeout(() => {
        const lowerLink = link.toLowerCase();
        if (lowerLink.includes("fail")) {
          card.classList.remove("is-parsing");
          card.innerHTML = `<div class="product-market-image blend"><span class="image-label">解析失败</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="parse-state failed"><strong>解析失败</strong><span>链接无法访问</span><button type="button" data-retry-product-parse>重试</button></div></div>`;
          card.onclick = event => { event.preventDefault(); if (!event.target.closest("[data-retry-product-parse]")) return; card.classList.add("is-parsing"); card.querySelector(".parse-state").className = "parse-state parsing"; card.querySelector(".parse-state").innerHTML = "<strong>正在重试</strong><span>再次读取商品信息…</span>"; link = link.replace(/fail/ig, "retry"); finishParsing(); };
          return;
        }
        card.classList.remove("is-parsing");
        const partial = lowerLink.includes("partial");
        card.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image blend"><span class="image-label">${partial ? "待补充" : "厨房电器"}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div>${partial ? '<div class="parse-state partial"><strong>部分完成</strong><span>品牌、类目待补充</span></div>' : '<div class="parse-state success"><strong>解析完成</strong><span>产品信息已识别</span></div>'}<div class="product-market-price-row"><div class="product-market-price"><small>¥</small>199</div><small class="asset-card-audit" title="最近修改：嗡大发 · 08/11 10:26">嗡大发 · 08/11 10:26</small></div><div class="product-market-assets"><span>文案 0</span><span>脚本 0</span><span>素材 0</span><span>视频 0</span></div></div>`;
        productDetailData[productId] = { id:productId, name, brand:partial ? "" : "已识别品牌", category:partial ? "" : "厨房电器", price:"¥199", currencyCode:"CNY", links:[{ platform:detectProductPlatform(link), url:link }], description:"商品链接解析生成，产品参数待确认", core:"核心卖点待确认", secondary:"", difference:"", trust:"", trustAttachments:[], forbidden:"" };
        productCatalog[productId] = { name, core:"核心卖点待确认", secondary:"", difference:"", audiences:[], psychology:[], facts:"已通过商品链接解析，缺失字段需人工确认" };
        syncProductToCreationSelectors(productId, name);
        card.replaceWith(card.cloneNode(true));
        const readyCard = document.querySelector(`[data-product-id="${productId}"]`);
        readyCard?.addEventListener("click", () => openProductDetail(productId));
        showToast(partial ? `“${name}”部分解析完成，请补充缺失信息` : `“${name}”解析完成`);
      }, 1800);
      finishParsing();
      return card;
    }
    function confirmSuspectedProduct(existingName, newName) {
      return new Promise(resolve => {
        let modal = document.getElementById("suspectedProductModal");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "suspectedProductModal";
          modal.className = "modal-backdrop";
          modal.innerHTML = `<div class="modal" style="max-width:500px"><div class="modal-head"><div><span class="badge orange">疑似重复</span><h3>确认是否继续新增</h3></div></div><div class="modal-body"><div class="session-delete-copy" data-suspected-product-copy></div></div><div class="modal-foot"><button class="ghost-btn" type="button" data-suspected-cancel>取消</button><button class="primary-btn" type="button" data-suspected-confirm>仍然新增</button></div></div>`;
          document.body.append(modal);
        }
        modal.querySelector("[data-suspected-product-copy]").textContent = `新产品“${newName}”与已有产品“${existingName}”名称相近。请确认它们是否为不同产品。`;
        modal.classList.add("show");
        const finish = value => { modal.classList.remove("show"); modal.onclick = null; resolve(value); };
        modal.onclick = event => {
          if (event.target === modal || event.target.closest("[data-suspected-cancel]")) finish(false);
          if (event.target.closest("[data-suspected-confirm]")) finish(true);
        };
      });
    }
    document.getElementById("saveProductEntry")?.addEventListener("click", async () => {
      const mode = document.querySelector("[data-product-create-mode].active")?.dataset.productCreateMode;
      const productGrid = document.getElementById("productMarketGrid");
      if (mode === "batch") {
        const links = document.querySelector("[data-product-create-panel='batch'] textarea")?.value.trim().split(/\n+/).filter(Boolean) || [];
        if (!links.length) return showToast("请至少输入一条商品链接");
        const uniqueLinks = [...new Set(links)];
        const invalidLinks = uniqueLinks.filter(link => !/^https?:\/\/\S+$/i.test(link));
        const validLinks = uniqueLinks.filter(link => /^https?:\/\/\S+$/i.test(link));
        const existingLinks = new Set(Object.values(productDetailData).flatMap(item => productLinksOf(item).map(link => link.url.toLowerCase())));
        const conflicts = validLinks.filter(link => existingLinks.has(link.toLowerCase()));
        const creatable = validLinks.filter(link => !existingLinks.has(link.toLowerCase()));
        if (!creatable.length) return showToast(invalidLinks.length ? "没有可解析的有效商品链接" : "链接对应的产品已存在，未重复创建");
        creatable.forEach((link, index) => productGrid.append(makeParsingProductCard(`新链接产品 ${index + 1}`, `parsing-product-${Date.now()}-${index}`, link)));
        toggleProductModal(productCreateModal, false);
        showToast(`已新增 ${creatable.length} 个产品并开始解析${conflicts.length ? `；跳过 ${conflicts.length} 条重复链接` : ""}${invalidLinks.length ? `；忽略 ${invalidLinks.length} 条无效链接` : ""}`);
        return;
      }
      const manualPanel = document.querySelector("[data-product-create-panel='manual']");
      const name = document.getElementById("productFormName")?.value.trim();
      const brand = document.getElementById("productFormBrand")?.value.trim();
      const priceValue = document.getElementById("productFormPrice")?.value.trim();
      const description = document.getElementById("productFormDescription")?.value.trim() || "";
      const core = document.getElementById("productFormCore")?.value.trim();
      const secondary = document.getElementById("productFormSecondary")?.value.trim() || "";
      const difference = document.getElementById("productFormDifference")?.value.trim() || "";
      const trust = document.getElementById("productFormTrust")?.value.trim() || "";
      const forbidden = document.getElementById("productFormForbidden")?.value.trim() || "";
      const hasImage = manualPanel.querySelector("[data-product-upload]")?.dataset.ready === "true";
      if (!name || !brand || !priceValue || !core || !hasImage || !document.getElementById("productCategorySelect")?.value || document.getElementById("productCategorySelect")?.value === "请选择类目") return showToast("请补全标记 * 的产品信息");
      const linkResult = readProductLinkRows(productCreateLinkRows);
      if (linkResult.incomplete) return showToast("每条商品链接都需要选择平台并填写链接");
      if (linkResult.invalid) return showToast("请填写以 http:// 或 https:// 开头的有效链接");
      if (linkResult.duplicate) return showToast("相同商品链接不能重复添加");
      const normalizedProductName = name.replace(/\s+/g, "").toLowerCase();
      const exactProduct = Object.values(productDetailData).find(item => productLinksOf(item).some(old => linkResult.links.some(link => old.url.toLowerCase() === link.url.toLowerCase())) || (String(item.name || "").replace(/\s+/g, "").toLowerCase() === normalizedProductName && item.brand === brand));
      if (exactProduct) return showToast(`产品“${exactProduct.name}”已存在，不能重复创建`);
      const suspected = Object.values(productDetailData).find(item => String(item.name || "").replace(/\s+/g, "").toLowerCase().includes(normalizedProductName.slice(0, Math.max(3, normalizedProductName.length - 2))));
      if (suspected && !(await confirmSuspectedProduct(suspected.name, name))) return;
      const id = `manual-product-${Date.now()}`;
      const price = priceValue;
      const currencySelect = document.getElementById("productCurrencySelect");
      const currencyCode = currencySelect?.value || "CNY";
      const currencySymbol = currencySelect?.selectedOptions[0]?.dataset.symbol || "¥";
      const category = document.getElementById("productCategorySelect")?.value || "未填写类目";
      const trustAttachments = productCreateTrustAttachments.map(item => ({ ...item, status:"ready" }));
      productCreateTrustAttachments = [];
      const manualCard = document.createElement("button");
      manualCard.type = "button";
      manualCard.className = "product-market-card";
      manualCard.dataset.productId = id;
      manualCard.innerHTML = `<span class="card-menu-wrap"><span class="card-menu-trigger" role="button" tabindex="0" data-toggle-card-menu aria-label="产品操作">···</span><span class="card-action-menu" role="menu"><span role="menuitem" data-delete-product>删除</span></span></span><div class="product-market-image"><span class="image-label">${escapeHtml(category)}</span><div class="product-visual"></div></div><div class="product-market-body"><div class="product-market-title"><strong>${escapeHtml(name)}</strong></div><div class="product-market-price-row"><div class="product-market-price"><small>${currencySymbol}</small>${escapeHtml(price)}</div><small class="asset-card-audit" title="最近修改：嗡大发 · 08/11 10:26">嗡大发 · 08/11 10:26</small></div><div class="product-market-assets"><span>文案 0</span><span>脚本 0</span><span>素材 0</span><span>视频 0</span></div></div>`;
      productDetailData[id] = { id, name, brand, category, price:`${currencySymbol}${price}`, currencyCode, links:linkResult.links, description, core, secondary, difference, trust, trustAttachments, forbidden };
      productCatalog[id] = { name, core:core.split(/\n+/)[0] || core, secondary:secondary.split(/\n+/)[0] || "", difference:difference.split(/\n+/)[0] || "", audiences:[], psychology:[], facts:`已读取产品档案、${linkResult.links.length} 条商品链接和禁用表达` };
      syncProductToCreationSelectors(id, name);
      manualCard.addEventListener("click", () => openProductDetail(id));
      productGrid.append(manualCard);
      toggleProductModal(productCreateModal, false);
      showToast("产品已新增，可进入详情继续补充信息");
    });
    const productSearch = document.querySelector("#page-products .product-page-actions .search");
    const productCategoryFilter = document.querySelector("#page-products .product-page-actions .filter-select");
    function filterProductCards() {
      const keyword = productSearch?.value.trim().toLowerCase() || "";
      const category = productCategoryFilter?.value || "全部类目";
      document.querySelectorAll("#productMarketGrid .product-market-card").forEach(card => {
        const text = card.textContent.toLowerCase();
        const visible = (!keyword || text.includes(keyword)) && (category === "全部类目" || text.includes(category));
        card.hidden = !visible;
      });
    }
    productSearch?.addEventListener("input", filterProductCards);
    productCategoryFilter?.addEventListener("change", filterProductCards);
    document.querySelectorAll("[data-relation-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-relation-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-relation-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.relationPanel === button.dataset.relationTab));
    }));
    document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.toast)));
    document.querySelectorAll("[data-open-product-creation]").forEach(button => button.addEventListener("click", () => { toggleProductModal(productDetailModal, false); switchPage("creation"); showToast("已带入当前产品，可选择 Agent 开始创作"); }));
    document.querySelectorAll("[data-back-products]").forEach(button => button.addEventListener("click", () => switchPage("products")));
    document.querySelectorAll("[data-save-product-detail]").forEach(button => button.addEventListener("click", () => showToast("产品信息已保存")));
    function createScenarioGroup(audience = "新增目标人群", scenes = []) {
      const group = document.createElement("article");
      group.className = "scenario-group";
      group.dataset.scenarioGroup = "";
      const tags = scenes.map(scene => `<span class="scenario-tag">${scene}</span>`).join("");
      group.innerHTML = `<div class="scenario-display"><div class="scenario-audience">${audience}</div><div class="scenario-tag-list">${tags || '<span class="scenario-tag">待补充场景</span>'}</div></div><div class="scenario-edit-form"><label>目标人群</label><input value="${audience}"><label>使用场景</label><textarea placeholder="一行一个使用场景">${scenes.join("\n")}</textarea></div><button class="scenario-edit-action" type="button" data-edit-scenario>编辑</button>`;
      bindScenarioGroup(group);
      return group;
    }
    function bindScenarioGroup(group) {
      const action = group.querySelector("[data-edit-scenario]");
      const audienceInput = group.querySelector(".scenario-edit-form input");
      const scenesInput = group.querySelector(".scenario-edit-form textarea");
      const renderDisplay = () => {
        group.querySelector(".scenario-audience").textContent = audienceInput.value.trim() || "未命名人群";
        const sceneNames = scenesInput.value.split(/\n+/).map(scene => scene.trim()).filter(Boolean);
        group.querySelector(".scenario-tag-list").innerHTML = sceneNames.length ? sceneNames.map(scene => `<span class="scenario-tag">${scene}</span>`).join("") : '<span class="scenario-tag">待补充场景</span>';
      };
      action.addEventListener("click", () => {
        const editing = group.classList.toggle("is-editing");
        action.textContent = editing ? "保存" : "编辑";
        if (editing) audienceInput.focus();
        else { renderDisplay(); showToast("人群与使用场景已保存"); }
      });
    }
    document.querySelectorAll("[data-scenario-group]").forEach(bindScenarioGroup);
    document.querySelectorAll("[data-add-scenario]").forEach(button => button.addEventListener("click", () => {
      const group = createScenarioGroup();
      button.previousElementSibling.append(group);
      group.classList.add("is-editing");
      group.querySelector("[data-edit-scenario]").textContent = "保存";
      group.querySelector(".scenario-edit-form input").focus();
      showToast("已新增一组人群与使用场景，请补充后保存");
    }));

    function prepareDetailEditable(container) {
      if (!container || container.dataset.editReady) return;
      const fields = container.matches(".field, .scenario-row") ? [container] : [...container.querySelectorAll(".field, .scenario-row")];
      fields.forEach(field => {
        if (field.dataset.editReady) return;
        field.dataset.editReady = "true";
        field.classList.add("detail-editable");
        const controls = [...field.querySelectorAll("input, textarea, select")];
        controls.forEach(control => {
          if (control.tagName === "SELECT") control.disabled = true;
          else control.readOnly = true;
        });
        const action = document.createElement("button");
        action.type = "button";
        action.className = "detail-edit-action";
        action.textContent = "编辑";
        action.addEventListener("click", () => {
          const editing = field.classList.toggle("is-editing");
          controls.forEach(control => {
            if (control.tagName === "SELECT") control.disabled = !editing;
            else control.readOnly = !editing;
          });
          action.textContent = editing ? "保存" : "编辑";
          if (!editing) showToast("修改已保存");
        });
        field.append(action);
      });
    }
    prepareDetailEditable(document.getElementById("page-product-detail"));

    document.querySelectorAll("[data-product-asset-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-product-asset-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-product-asset-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productAssetPanel === button.dataset.productAssetTab));
    }));
    document.querySelectorAll("[data-template-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-template-tab]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-template-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.templatePanel === button.dataset.templateTab));
    }));

    function surfaceEditorValue(surface) {
      const priceField = surface.querySelector(".editable-editor .price-field");
      if (priceField) {
        const amount = priceField.querySelector("input")?.value.trim() || "0";
        const select = priceField.querySelector("select");
        const symbol = select?.selectedOptions[0]?.dataset.symbol || "¥";
        return `${symbol}${amount} ${select?.value || "CNY"}`;
      }
      const editor = surface.querySelector(".editable-editor input, .editable-editor textarea");
      return editor ? editor.value : "";
    }
    function syncEditableSurface(surface) {
      const value = surfaceEditorValue(surface);
      const view = surface.querySelector(".editable-view");
      if (!view) return;
      if (view.classList.contains("bullet-list")) {
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        view.innerHTML = lines.map(line => `<li>${escapeHtml(line)}</li>`).join("");
        const count = surface.querySelector(".multi-info-head small");
        if (count) count.textContent = lines.length;
      } else if (view.classList.contains("description-lines")) {
        const lines = value.split(/\n+/).map(line => line.trim()).filter(Boolean);
        view.innerHTML = lines.map(line => {
          const splitAt = line.search(/[：:]/);
          const label = splitAt > -1 ? line.slice(0, splitAt) : "补充信息";
          const content = splitAt > -1 ? line.slice(splitAt + 1).trim() : line;
          return `<span><b>${escapeHtml(label)}</b>${escapeHtml(content)}</span>`;
        }).join("");
      } else {
        view.textContent = value;
      }
      if (surface.classList.contains("compact-kv")) {
        const label = surface.querySelector(":scope > label")?.textContent.trim();
        const targetId = label === "产品名称" ? "pageDetailName" : label === "品牌" ? "pageDetailBrand" : label === "类目" ? "pageDetailCategory" : label === "价格" ? "pageDetailPrice" : "";
        if (targetId) document.getElementById(targetId).textContent = label === "价格" ? value.replace(/\s+[A-Z]{3}$/i, "") : value;
      }
    }
    document.querySelectorAll("#page-product-detail [data-inline-edit]").forEach(button => button.addEventListener("click", async () => {
      const surface = button.closest(".editable-surface");
      if (!surface) return;
      const editing = surface.classList.toggle("is-editing");
      button.textContent = editing ? "完成" : "编辑";
      if (editing) {
        surface.dataset.originalValue = surfaceEditorValue(surface);
        const select = surface.querySelector(".editable-editor select");
        if (select) surface.dataset.originalSelect = select.value;
        surface.querySelector(".editable-editor input, .editable-editor textarea")?.focus();
      } else {
        const label = surface.querySelector(":scope > label")?.textContent.trim();
        const nextValue = surfaceEditorValue(surface).trim();
        if (label === "商品链接") {
          const exact = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && product.link === nextValue);
          if (exact) {
            surface.classList.add("is-editing");
            button.textContent = "完成";
            surface.querySelector("input")?.focus();
            showToast(`该链接已关联产品“${exact[1].name}”，不能重复绑定`);
            return;
          }
          const nextPath = nextValue.split(/[?#]/)[0].replace(/\/$/, "").split("/").pop();
          const suspected = Object.entries(productDetailData).find(([id, product]) => id !== currentProductDetailId && nextPath && product.link?.includes(nextPath));
          if (suspected && !(await confirmSuspectedProduct(suspected[1].name, productDetailData[currentProductDetailId]?.name || "当前产品"))) {
            surface.classList.add("is-editing");
            button.textContent = "完成";
            return;
          }
        }
        syncEditableSurface(surface);
        const product = productDetailData[currentProductDetailId];
        if (product) {
          if (label === "产品名称") product.name = nextValue;
          if (label === "品牌") product.brand = nextValue;
          if (label === "类目") product.category = nextValue;
          if (label === "价格") {
            product.price = nextValue.replace(/\s+[A-Z]{3}$/i, "");
            product.currencyCode = surface.querySelector("select")?.value || product.currencyCode || "CNY";
          }
          if (surface.dataset.productContent) product[surface.dataset.productContent] = nextValue;
          if (productCatalog[currentProductDetailId]) {
            productCatalog[currentProductDetailId].name = product.name;
            productCatalog[currentProductDetailId].core = String(product.core || "").split(/\n+/)[0] || "";
            productCatalog[currentProductDetailId].secondary = String(product.secondary || "").split(/\n+/)[0] || "";
            productCatalog[currentProductDetailId].difference = String(product.difference || "").split(/\n+/)[0] || "";
          }
          const card = document.querySelector(`#productMarketGrid [data-product-id="${currentProductDetailId}"]`);
          if (label === "产品名称") {
            const cardTitle = card?.querySelector(".product-market-title strong");
            if (cardTitle) cardTitle.textContent = product.name;
            document.querySelectorAll(`select[data-product-select] option[value="${currentProductDetailId}"], select[data-product-library] option[value="${currentProductDetailId}"]`).forEach(option => option.textContent = product.name);
          }
          if (label === "类目") { const categoryLabel = card?.querySelector(".image-label"); if (categoryLabel) categoryLabel.textContent = product.category; }
          if (label === "价格") { const cardPrice = card?.querySelector(".product-market-price"); if (cardPrice) cardPrice.textContent = product.price; }
        }
        showToast("修改已保存，并同步至对应资产库");
      }
    }));
    document.querySelectorAll("#page-product-detail [data-cancel-inline]").forEach(button => button.addEventListener("click", () => {
      const surface = button.closest(".editable-surface");
      if (!surface) return;
      const editor = surface.querySelector(".editable-editor input, .editable-editor textarea");
      const priceField = surface.querySelector(".editable-editor .price-field");
      if (editor && surface.dataset.originalValue !== undefined) {
        editor.value = priceField ? surface.dataset.originalValue.replace(/^\D*|\s+[A-Z]{3}$/g, "") : surface.dataset.originalValue;
      }
      const select = surface.querySelector(".editable-editor select");
      if (select && surface.dataset.originalSelect) select.value = surface.dataset.originalSelect;
      surface.classList.remove("is-editing");
      const edit = surface.querySelector("[data-inline-edit]");
      if (edit) edit.textContent = "编辑";
    }));
    document.querySelectorAll("#page-product-detail [data-toggle-asset-edit]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-inline-asset]");
      if (!card) return;
      if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
      const editing = card.classList.toggle("is-editing");
      button.textContent = editing ? "收起编辑" : button.dataset.defaultText;
    }));
    function inlineAssetValue(line) {
      const splitAt = line.search(/[：:]/);
      return (splitAt > -1 ? line.slice(splitAt + 1) : line).trim();
    }
    function syncInlineAsset(card) {
      const editor = card.querySelector(".asset-inline-editor textarea");
      if (!editor) return;
      const lines = editor.value.split(/\n+/).map(line => line.trim()).filter(Boolean);
      const imageCopy = card.querySelector(".asset-image-preview .preview-copy");
      if (imageCopy) {
        const title = inlineAssetValue(lines[0] || "未命名图片");
        const subtitle = inlineAssetValue(lines[1] || "");
        imageCopy.innerHTML = `${escapeHtml(title)}${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}`;
      }
      const materialCaption = card.classList.contains("material-card") ? card.querySelector(".video-caption") : null;
      if (materialCaption && lines[0]) materialCaption.textContent = inlineAssetValue(lines[0]);
      const scriptRows = [...card.querySelectorAll(".script-row:not(.header)")];
      if (scriptRows.length) {
        lines.slice(0, scriptRows.length).forEach((line, index) => {
          const parts = line.split("｜");
          const cells = scriptRows[index].children;
          if (cells[0] && parts[0]) cells[0].textContent = parts[0].trim();
          if (cells[1] && parts[1]) cells[1].textContent = inlineAssetValue(parts[1]);
          if (cells[2] && parts[2]) cells[2].textContent = inlineAssetValue(parts[2]);
        });
      }
      const videoTitle = card.querySelector(".asset-content-head strong");
      const videoCaption = card.querySelector(".video-stage .video-caption");
      if (videoTitle && videoCaption && !card.classList.contains("material-card") && !scriptRows.length) {
        if (lines[0]) videoTitle.textContent = inlineAssetValue(lines[0]);
        if (lines[1]) videoCaption.textContent = inlineAssetValue(lines[1]);
      }
    }
    document.querySelectorAll("#page-product-detail [data-save-asset]").forEach(button => button.addEventListener("click", () => {
      const card = button.closest("[data-inline-asset]");
      if (card) syncInlineAsset(card);
      card?.classList.remove("is-editing");
      const edit = card?.querySelector("[data-toggle-asset-edit]");
      if (edit) edit.textContent = edit.dataset.defaultText || "编辑";
      showToast("资产修改已保存，并同步至对应资产库");
    }));

    const productDescription = document.getElementById("productDescription");
    const productDescriptionSource = document.getElementById("productDescriptionSource");
    const descriptionParamList = document.getElementById("descriptionParamList");
    let originalDescription = productDescriptionSource?.value || "";
    function addDescriptionParamRow(name = "", value = "") {
      const row = document.createElement("div");
      row.className = "description-param-row";
      row.innerHTML = `<input aria-label="参数名称" placeholder="参数名称" value="${escapeHtml(name)}"><input aria-label="参数值" placeholder="参数值" value="${escapeHtml(value)}"><button type="button" data-remove-description-param aria-label="删除参数">×</button>`;
      descriptionParamList.append(row);
    }
    function parseDescriptionText() {
      descriptionParamList.innerHTML = "";
      const lines = productDescriptionSource.value.split(/\n+/).map(line => line.trim()).filter(Boolean);
      lines.forEach(line => {
        const splitAt = line.search(/[：:]/);
        addDescriptionParamRow(splitAt > -1 ? line.slice(0, splitAt).trim() : "补充信息", splitAt > -1 ? line.slice(splitAt + 1).trim() : line);
      });
      if (!lines.length) addDescriptionParamRow();
    }
    document.getElementById("editDescription")?.addEventListener("click", event => {
      const editing = productDescription.classList.toggle("is-editing");
      event.currentTarget.textContent = editing ? "完成" : "编辑";
      productDescriptionSource.readOnly = !editing;
      if (editing) {
        originalDescription = productDescriptionSource.value;
        parseDescriptionText();
        productDescriptionSource.focus();
      } else {
        const rows = [...descriptionParamList.querySelectorAll(".description-param-row")];
        productDescriptionSource.value = rows.map(row => {
          const inputs = row.querySelectorAll("input");
          return inputs[0].value.trim() && inputs[1].value.trim() ? `${inputs[0].value.trim()}：${inputs[1].value.trim()}` : "";
        }).filter(Boolean).join("\n");
        if (productDetailData[currentProductDetailId]) productDetailData[currentProductDetailId].description = productDescriptionSource.value;
        showToast("商品描述已保存，并同步至创作上下文");
      }
    });
    document.getElementById("cancelDescriptionEdit")?.addEventListener("click", () => {
      productDescriptionSource.value = originalDescription;
      productDescriptionSource.readOnly = true;
      productDescription.classList.remove("is-editing");
      document.getElementById("editDescription").textContent = "编辑";
    });
    document.getElementById("parseDescription")?.addEventListener("click", () => { parseDescriptionText(); showToast("已重新解析商品参数"); });
    document.getElementById("addDescriptionParam")?.addEventListener("click", () => {
      addDescriptionParamRow();
      descriptionParamList.lastElementChild?.querySelector("input")?.focus();
    });
    descriptionParamList?.addEventListener("click", event => {
      const remove = event.target.closest("[data-remove-description-param]");
      if (remove) remove.closest(".description-param-row")?.remove();
    });

    document.querySelectorAll("[data-prompt-agent]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-prompt-agent]").forEach(item => item.classList.toggle("active", item === button));
      document.querySelectorAll("[data-prompt-agent-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.promptAgentPanel === button.dataset.promptAgent));
    }));

    const imageZoomModal = document.getElementById("imageZoomModal");
    const imageZoomHost = document.getElementById("imageZoomHost");
    document.querySelectorAll("[data-image-zoom]").forEach(preview => preview.addEventListener("click", () => {
      imageZoomHost.innerHTML = "";
      const copy = preview.cloneNode(true);
      copy.removeAttribute("data-image-zoom");
      imageZoomHost.append(copy);
      document.getElementById("imageZoomTitle").textContent = preview.closest(".asset-content-card")?.querySelector(".asset-content-head strong")?.textContent || "图片预览";
      imageZoomModal.classList.add("show");
    }));
    document.getElementById("closeImageZoom")?.addEventListener("click", () => imageZoomModal.classList.remove("show"));
    imageZoomModal?.addEventListener("click", event => { if (event.target === imageZoomModal) imageZoomModal.classList.remove("show"); });

    document.querySelectorAll(".video-more-button").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const wrap = button.closest(".video-more-wrap");
      document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.toggle("open", item === wrap && !item.classList.contains("open")));
    }));
    document.querySelectorAll("[data-open-video-analysis]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.remove("open"));
      switchPage("pull");
      showToast("已进入该素材的视频分析详情");
    }));

    const sessionList = document.querySelector("#page-creation .chat-list");
    const sessionDeleteModal = document.getElementById("sessionDeleteModal");
    let pendingDeleteSession = null;
    function sessionMenuMarkup() {
      return '<button class="session-more" type="button" aria-label="会话操作">⋯</button><div class="session-menu"><button type="button" data-session-rename>重命名</button><button class="danger" type="button" data-session-delete>删除</button></div>';
    }
    function createSessionSummaryRow(title) {
      sessionList.querySelectorAll(".chat-row").forEach(row => row.classList.remove("active", "menu-open"));
      const row = document.createElement("div");
      row.className = "chat-row active";
      row.dataset.sessionId = `session-${Date.now()}-${sessionList.children.length + 1}`;
      row.innerHTML = `<strong>${escapeHtml(title)}</strong>${sessionMenuMarkup()}`;
      sessionList.prepend(row);
      return row;
    }
    function closeSessionMenus(except = null) {
      sessionList.querySelectorAll(".chat-row.menu-open").forEach(row => {
        if (row !== except) row.classList.remove("menu-open");
      });
    }
    function startSessionRename(row) {
      const title = row.querySelector("strong");
      if (!title || title.isContentEditable) return;
      row.classList.remove("menu-open");
      const original = title.textContent;
      title.contentEditable = "true";
      title.classList.add("session-title-editing");
      let finished = false;
      const finish = save => {
        if (finished) return;
        finished = true;
        const nextTitle = title.textContent.trim();
        if (save && nextTitle) {
          title.textContent = nextTitle;
          if (row.classList.contains("active")) syncTaskChatTitle();
          showToast("会话已重命名");
        } else {
          title.textContent = original;
        }
        title.contentEditable = "false";
        title.classList.remove("session-title-editing");
      };
      title.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); finish(true); }
        if (event.key === "Escape") { event.preventDefault(); finish(false); }
      });
      title.addEventListener("blur", () => finish(true), { once:true });
      title.focus();
      const range = document.createRange();
      range.selectNodeContents(title);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    sessionList?.addEventListener("click", event => {
      const row = event.target.closest(".chat-row");
      if (!row) return;
      if (event.target.closest(".session-more")) {
        event.stopPropagation();
        const opening = !row.classList.contains("menu-open");
        closeSessionMenus(row);
        row.classList.toggle("menu-open", opening);
        return;
      }
      if (event.target.closest("[data-session-rename]")) {
        event.stopPropagation();
        startSessionRename(row);
        return;
      }
      if (event.target.closest("[data-session-delete]")) {
        event.stopPropagation();
        pendingDeleteSession = row;
        row.classList.remove("menu-open");
        document.getElementById("sessionDeleteName").textContent = row.querySelector("strong")?.textContent || "当前会话";
        sessionDeleteModal.classList.add("show");
        return;
      }
      if (!event.target.closest("input") && !event.target.closest('[contenteditable="true"]')) {
        sessionList.querySelectorAll(".chat-row").forEach(item => item.classList.toggle("active", item === row));
        syncTaskChatTitle();
        showToast(`已切换到“${row.querySelector("strong")?.textContent || "创作会话"}”`);
      }
    });
    function closeSessionDeleteModal() {
      sessionDeleteModal.classList.remove("show");
      pendingDeleteSession = null;
    }
    document.getElementById("closeSessionDelete")?.addEventListener("click", closeSessionDeleteModal);
    document.getElementById("cancelSessionDelete")?.addEventListener("click", closeSessionDeleteModal);
    sessionDeleteModal?.addEventListener("click", event => { if (event.target === sessionDeleteModal) closeSessionDeleteModal(); });
    document.getElementById("confirmSessionDelete")?.addEventListener("click", () => {
      if (!pendingDeleteSession) return closeSessionDeleteModal();
      const wasActive = pendingDeleteSession.classList.contains("active");
      pendingDeleteSession.remove();
      if (wasActive) sessionList.querySelector(".chat-row")?.classList.add("active");
      if (wasActive) syncTaskChatTitle();
      closeSessionDeleteModal();
      showToast("会话已删除");
    });

    const productCreationPicker = document.getElementById("productCreationPicker");
    document.getElementById("productCreationTrigger")?.addEventListener("click", () => productCreationPicker.classList.toggle("open"));
    document.querySelectorAll("[data-product-agent]").forEach(button => button.addEventListener("click", () => {
      const card = agentCards.find(item => item.dataset.type === button.dataset.productAgent);
      productCreationPicker.classList.remove("open");
      if (!card) return;
      switchPage("creation");
      selectAgent(card, true);
      showToast(`已带入当前产品，使用${card.dataset.agent}开始创作`);
    }));
    document.addEventListener("click", event => {
      if (productCreationPicker && !productCreationPicker.contains(event.target)) productCreationPicker.classList.remove("open");
      if (!event.target.closest(".card-menu-wrap")) closeCardMenus();
      if (!event.target.closest(".chat-row")) closeSessionMenus();
      if (!event.target.closest(".video-more-wrap")) document.querySelectorAll(".video-more-wrap").forEach(item => item.classList.remove("open"));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeModal();
        toggleProductModal(productCreateModal, false);
        toggleProductModal(productDetailModal, false);
        imageZoomModal?.classList.remove("show");
        sessionDeleteModal?.classList.remove("show");
        setAssetPanel(false);
        setAgentPicker(false);
        setModelPicker(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (document.activeElement === promptInput) document.getElementById("sendPrompt").click();
      }
    });

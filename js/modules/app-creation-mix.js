    function mixSelectedMaterialIds() {
      return [...dynamicForm.querySelectorAll("[data-mix-material].selected")].map(card => card.dataset.mixMaterial);
    }

    function updateMixMaterialSummary() {
      const count = mixSelectedMaterialIds().length;
      const cards = [...dynamicForm.querySelectorAll("[data-mix-material]")];
      const root = dynamicForm.querySelector(".mix-flow-form");
      const selectedIds = new Set(mixSelectedMaterialIds());
      if (root?._mixRowOverrides) {
        Object.entries(root._mixRowOverrides).forEach(([index, ids]) => {
          const retained = (Array.isArray(ids) ? ids : [ids]).filter(id => selectedIds.has(id));
          if (retained.length === (Array.isArray(ids) ? ids.length : 1)) return;
          root._mixRowOverrides[index] = retained;
          if (!root._mixRowNeedsRematch) root._mixRowNeedsRematch = new Set();
          root._mixRowNeedsRematch.add(Number(index));
        });
      }
      dynamicForm.querySelector("[data-mix-selected-count]")?.replaceChildren(String(count));
      dynamicForm.querySelector("[data-mix-total-count]")?.replaceChildren(String(cards.length));
      dynamicForm.querySelector("[data-mix-used-count]")?.replaceChildren(`${count} 个`);
      dynamicForm.querySelector("[data-mix-final-materials]")?.replaceChildren(`${count} 个`);
      const selectAllBtn = dynamicForm.querySelector("[data-mix-select-all]");
      if (selectAllBtn) {
        const allSelected = cards.length > 0 && cards.every(card => card.classList.contains("selected"));
        selectAllBtn.disabled = !cards.length;
        selectAllBtn.setAttribute("aria-pressed", String(allSelected));
        selectAllBtn.textContent = allSelected ? "取消全选" : "全选";
      }
      renderMixScript();
    }

    function mixTimeLabel(seconds) {
      const value = Math.max(0, Math.round(seconds));
      return `${String(Math.floor(value / 60)).padStart(2,"0")}:${String(value % 60).padStart(2,"0")}`;
    }

    function mixEffectiveCopy(root = dynamicForm.querySelector(".mix-flow-form")) {
      return String(root?._mixChatCopy || root?.querySelector("[data-mix-copy]")?.value || "").trim();
    }

    function mixActualDuration() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const speed = Number(dynamicForm.querySelector("[data-mix-speed]")?.value || 1);
      const count = mixEffectiveCopy(root).replace(/\s/g, "").length;
      return Math.max(4, count / 3.35 / speed);
    }

    function mixStageNames() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const plan = root?.dataset.mixPlanMode || "ai";
      if (plan === "script" && root?._mixExternalScript?.rows?.length) return root._mixExternalScript.rows.map((row, index) => row.stage || row.title || `分镜 ${index + 1}`).slice(0, 5);
      return mixCurrentStructure()?.stageNames?.length
        ? mixCurrentStructure().stageNames
        : ["开场", "问题", "演示", "证明", "收口"];
    }
    const MIX_SHOT_TYPES = ["特写", "近景", "中景", "全景", "远景"];
    const MIX_CAMERA_MOVES = ["固定", "推进", "拉远", "平移跟拍", "环绕", "手持跟随"];

    function mixCopySegments() {
      const copy = mixEffectiveCopy();
      const sentences = copy.match(/[^。！？!?]+[。！？!?]?/g)?.map(item => item.trim()).filter(Boolean) || [];
      const stages = mixStageNames();
      const groups = Array.from({ length:stages.length }, () => []);
      sentences.forEach((sentence, index) => groups[Math.min(stages.length - 1, Math.floor(index * stages.length / Math.max(1, sentences.length)))].push(sentence));
      return stages.map((stage, index) => ({ stage, copy:groups[index].join("") || (index === 0 ? copy : "") })).filter(item => item.copy);
    }

    function mixSelectedMaterials() {
      return [...dynamicForm.querySelectorAll("[data-mix-material].selected")].map((card, index) => ({
        id:card.dataset.mixMaterial,
        name:card.querySelector("strong")?.textContent?.trim() || `素材 ${index + 1}`,
        scene:card.dataset.mixMaterialScene || "已分析镜头",
        status:{ ok:"已分析", pending:"待分析", analyzing:"分析中", fail:"分析失败" }[card.dataset.mixMaterialStatus] || "待分析",
        duration:Number(card.querySelector(".mix-material-cover em")?.textContent?.replace(/\D/g, "")) || 3
      }));
    }

    function mixStageMatchesMaterial(stage, material) {
      const scene = String(material?.scene || "");
      if (/结果|证明|对比/.test(stage)) return /结果|证明|对比/.test(scene);
      if (/痛点|问题|需求/.test(stage)) return /痛点|使用过程/.test(scene);
      if (/产品|功能|卖点/.test(stage)) return /功能|产品|使用过程/.test(scene);
      if (/场景|多场景|成品|优惠/.test(stage)) return /场景|多场景|使用过程|便利/.test(scene);
      if (/行动|收口/.test(stage)) return /行动|产品|便利/.test(scene);
      return true;
    }

    function mixRowMaterialIds(root, index) {
      const value = root?._mixRowOverrides?.[index];
      return Array.isArray(value) ? value : (value ? [value] : []);
    }

    function mixScriptSegments() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const plan = root?.dataset.mixPlanMode || "ai";
      const materials = mixSelectedMaterials().filter(item => item.status === "已分析");
      // 阶段2 J: 原始 draft 应用 _mixRowCopyOverrides + _mixRowMergedCopy (合) 之后,在过滤 _mixRowDeleted (删)
      const draftsRaw = mixCopySegments().map((item, index) => ({
        ...item,
        index,
        copy: root?._mixRowMergedCopy?.[index] ?? (root?._mixRowCopyOverrides?.[index] ?? item.copy)
      }));
      const deletedSet = root?._mixRowDeleted || new Set();
      const splitMap = root?._mixRowSplit || new Map();
      // 应用删除过滤
      const baseDrafts = draftsRaw
        .map((item, i) => ({ ...item, _origIndex: i }))
        .filter(item => !deletedSet.has(item._origIndex));
      // 应用拆分:对每个被 split 标记的 origIndex,把 copy 按 `。！？` 切两半,前段留原行(并把后段 copy 复制给新 inserted segment)
      const splitBuckets = []; // [{ afterOrigIndex, halfCopy }]
      const baseRows = baseDrafts.map(item => {
        const origIdx = item._origIndex;
        if (splitMap.has(origIdx)) {
          const text = item.copy || "";
          const match = text.match(/[^。！？!?]+[。！？!?]/g);
          if (match && match.length >= 2) {
            const cut = Math.floor(match.length / 2);
            const first = match.slice(0, cut).join("");
            const second = match.slice(cut).join("");
            splitBuckets.push({ afterOrigIndex: origIdx, halfCopy: second });
            return { ...item, copy: first };
          }
        }
        return item;
      });
      // 合并 baseRows + 拆分产生的右半段 + 用户插入的 _mixInsertedSegments
      const insertedFromSplit = splitBuckets.map((b, k) => ({
        _origIndex: -1,
        _isInserted: true,
        stage: "新分镜",
        copy: b.halfCopy,
        visual: "请补充该分镜的画面内容描述",
        sourceRow: { shotType: "暂无", cameraMove: "暂无", visual: "暂无" }
      }));
      const userInserted = (root?._mixInsertedSegments || []).map(payload => ({
        _origIndex: -1,
        _isInserted: true,
        ...payload,
        sourceRow: payload.sourceRow || { shotType: "暂无", cameraMove: "暂无", visual: "暂无" }
      }));
      // 把 inserted 段按 afterIndex 顺序插回 baseRows
      const result = [...baseRows];
      const allInserted = [...insertedFromSplit, ...userInserted];
      allInserted.forEach(payload => {
        if (payload.afterIndex === undefined) {
          result.push(payload);
          return;
        }
        // 找到 baseRows 中 _origIndex === afterIndex 的位置,插到它后面
        const targetIdx = result.findIndex(s => s._origIndex === payload.afterIndex);
        if (targetIdx === -1) {
          result.push(payload);
        } else {
          result.splice(targetIdx + 1, 0, payload);
        }
      });
      // 计算总字数和 actual,一次性 map 出 start/duration
      const speed = Number(dynamicForm.querySelector("[data-mix-speed]")?.value || 1);
      const totalChars = result.reduce((sum, item) => sum + (item.copy || "").replace(/\s/g, "").length, 0) || 1;
      const actual = Math.max(4, totalChars / 3.35 / speed);
      let start = 0;
      return result.map((item, index) => {
        const origIdx = item._origIndex ?? -1;
        const sourceRows = plan === "script" && root?._mixExternalScript?.rows?.length
          ? root._mixExternalScript.rows
          : completeScriptRows;
        const sourceRow = item._isInserted ? item.sourceRow : (sourceRows[origIdx] || {});
        const chars = (item.copy || "").replace(/\s/g, "").length;
        const duration = index === result.length - 1 ? Math.max(.1, actual - start) : Math.max(1.2, actual * chars / totalChars);
        const hasManualOverride = Boolean(root?._mixRowOverrides && Object.prototype.hasOwnProperty.call(root._mixRowOverrides, origIdx));
        const manual = mixRowMaterialIds(root, origIdx).map(id => materials.find(material => material.id === id)).filter(Boolean);
        const auto = materials.find(material => mixStageMatchesMaterial(item.stage, material));
        const assignedBase = hasManualOverride ? manual : (auto ? [auto] : []);
        const durationOverrides = root?._mixRowMaterialDurations?.[origIdx] || {};
        const assigned = assignedBase.map(material => ({ ...material, duration:durationOverrides[material.id] ?? material.duration }));
        const needsRematch = root?._mixRowNeedsRematch?.has(origIdx);
        const metaOverride = root?._mixRowMetaOverrides?.[origIdx] || {};
        const segment = {
          ...item,
          index,
          start, end: start + duration, duration,
          assigned, needsRematch,
          sourceRow,
          shotType: metaOverride.shotType ?? sourceRow.shotType ?? "暂无",
          cameraMove: metaOverride.cameraMove ?? sourceRow.cameraMove ?? "暂无",
          scene: metaOverride.scene ?? sourceRow.scene ?? "暂无",
          subject: metaOverride.subject ?? sourceRow.subject ?? "暂无",
          visual: (root?._mixRowVisualOverrides?.[origIdx] ?? sourceRow.visual ?? "暂无"),
          complete: Boolean((item.copy || "").trim() && assigned.length) && !needsRematch,
          _origIndex: origIdx,
          _isInserted: Boolean(item._isInserted),
          _isRematching: Boolean(root?._mixRowRematching?.[index])
        };
        start += duration;
        return segment;
      });
    }

    function updateMixScriptCompletion(segments = mixScriptSegments()) {
      const incomplete = segments.filter(item => !item.complete);
      const noCopySegs = segments.map((s, i) => ({ s, i })).filter(x => !(x.s.copy || "").trim());
      const noShotSegs = segments.map((s, i) => ({ s, i })).filter(x => !x.s.assigned.length);
      const alert = dynamicForm.querySelector("[data-mix-script-alert]");
      if (alert) {
        if (!incomplete.length) {
          alert.hidden = true;
          alert.innerHTML = "";
        } else {
          alert.hidden = false;
          // 阶段2: 分项 chip 化,每项可点击定位/跳转
          const chips = [];
          if (noCopySegs.length) {
            const indices = noCopySegs.map(x => x.i + 1).join(",");
            chips.push(`<button type="button" class="mix-alert-chip" data-mix-alert-goto="copy"><b>${noCopySegs.length}</b> 段口播未补全 <small>(${indices}段)→ 步骤 2</small></button>`);
          }
          if (noShotSegs.length) {
            const firstIdx = noShotSegs[0].i + 1;
            const more = noShotSegs.length - 1;
            chips.push(`<button type="button" class="mix-alert-chip" data-mix-alert-goto="shot" data-mix-alert-shot-idx="${noShotSegs[0].i}"><b>${noShotSegs.length}</b> 段镜头未匹配 <small>(第 ${firstIdx} 段${more > 0 ? ` 等 ${noShotSegs.length} 段` : ""})→ 定位</small></button>`);
          }
          alert.innerHTML = `<b class="mix-alert-title">还有 ${incomplete.length} 个段落待完善</b><div class="mix-alert-chips">${chips.join("")}</div><span class="mix-alert-hint">完成全部段落后才可确认脚本</span>`;
        }
      }
      if (activeType === "mix" && taskStep === 3) {
        const next = taskActionButtons.querySelector(".primary-btn");
        if (next) next.disabled = Boolean(incomplete.length);
        taskActionNote.textContent = incomplete.length ? `还有 ${incomplete.length} 个段落待完成` : "所有段落已完成口播与镜头确认";
      }
      return incomplete;
    }

    function renderMixScript() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const flagSet = root?._mixRowFlag || new Set();
      const insertedSet = root?._mixRowInserted || new Set();
      const host = dynamicForm.querySelector("[data-mix-script-list]");
      if (!host) return;
      const segments = mixScriptSegments();
      // E1/E2: 边缘态 — 无分镜 / 无素材
      const totalChars = mixEffectiveCopy(root).replace(/\s/g, "").length;
      const hasCopy = totalChars > 0;
      const materialCount = mixSelectedMaterials().filter(item => item.status === "已分析").length;
      if (!hasCopy || !materialCount) {
        const reason = !hasCopy ? "口播文案为空" : "尚未选择已分析的素材";
        const step = !hasCopy ? "2" : "2";
        host.innerHTML = `<div class="mix-script-empty">
          <div class="mix-script-empty-icon">${!hasCopy ? "✎" : "▰"}</div>
          <div class="mix-script-empty-title">${!hasCopy ? "先去第二步补全口播文案" : "请先在第二步选择已分析素材"}</div>
          <div class="mix-script-empty-sub">${reason} · 系统无法分镜。当前在步骤 3 不会生成任何分镜。</div>
          <div class="mix-script-empty-tip">切回步骤 ${step} 完成 <b>${!hasCopy ? "口播文案" : "素材选择"}</b> 后再返回步骤 3。</div>
        </div>`;
        dynamicForm.querySelector("[data-mix-script-count]")?.replaceChildren("0");
        updateMixScriptCompletion([]);
        return;
      }
      // E3: 删除到最后一段 — 至少保留 1 段
      if (segments.length <= 1) {
        host.innerHTML = `<div class="mix-script-min-banner"><span>⚠</span> 至少需要保留 1 段分镜。如需重做该段,请用"重新匹配"或修改画面描述。</div>` + segments.map((item, index) => {
          return renderSingleMixCard(item, index, flagSet, insertedSet, { disableDelete: true, totalCards: segments.length });
        }).join("");
        dynamicForm.querySelector("[data-mix-script-count]")?.replaceChildren(String(segments.length));
        updateMixScriptCompletion(segments);
        return;
      }
      // E4: needs-rematch 状态由各卡片自身的高亮按钮 + 内联 flag 处理,不再使用顶部 banner
      host.innerHTML = segments.map((item, index) => renderSingleMixCard(item, index, flagSet, insertedSet, { totalCards: segments.length })).join("");
      dynamicForm.querySelector("[data-mix-script-count]")?.replaceChildren(String(segments.length));
      updateMixScriptCompletion(segments);
    }

    // 把单卡模板抽成函数,空态/末段/正常态共用
    function renderSingleMixCard(item, index, flagSet, insertedSet, opts = {}) {
      const totalCards = opts.totalCards ?? 0;
      const disableDelete = opts.disableDelete || totalCards <= 1;
      const hint = !item.copy.trim()
        ? `<div class="mix-row-rematch-hint"><b>请补全口播文案</b><span>补全后再确认该段镜头。</span></div>`
        : "";
      const isFlagged = item._isInserted || flagSet.has(item._origIndex) || (item._origIndex >= 0 && insertedSet.has(item._origIndex));
      const flagMark = isFlagged ? `<i class="mix-row-flag" title="本行已变更" aria-label="本行已变更"></i>` : "";
      const deleteDisabledAttr = disableDelete ? ` disabled aria-disabled="true" title="至少需保留 1 段分镜"` : ` title="删除第 ${index + 1} 段" aria-label="删除分镜"`;
      const advancedSummary = [
        `<em class="${item.shotType === "暂无" ? "is-empty" : ""}">景别·${escapeHtml(item.shotType)}</em>`,
        `<em class="${item.cameraMove === "暂无" ? "is-empty" : ""}">运镜·${escapeHtml(item.cameraMove)}</em>`,
        `<em class="${item.scene === "暂无" ? "is-empty" : ""}">场景·${escapeHtml(item.scene)}</em>`,
        `<em class="${item.subject === "暂无" ? "is-empty" : ""}">主体·${escapeHtml(item.subject)}</em>`
      ].join("");
      const shotTypeOptions = MIX_SHOT_TYPES.map(s => `<option value="${s}" ${s === item.shotType ? "selected" : ""}>${s}</option>`).join("");
      const cameraMoveOptions = MIX_CAMERA_MOVES.map(s => `<option value="${s}" ${s === item.cameraMove ? "selected" : ""}>${s}</option>`).join("");
      return `<article class="mix-script-card${item.needsRematch ? " needs-rematch" : ""}${isFlagged ? " is-flagged" : ""}${item._isInserted ? " is-inserted" : ""}${(item.assigned.length === 0) ? " is-needs-shot" : ""}${item._isRematching ? " is-rematching" : ""}" data-mix-script-row="${index}" data-mix-orig-row="${item._origIndex}" data-mix-material-ids="${escapeHtml(item.assigned.map(material => material.id).join(","))}">${flagMark}<header><div><span class="mix-row-index" title="第 ${index + 1} 段">${String(index + 1).padStart(2, "0")}</span><b>${mixTimeLabel(item.start)}–${mixTimeLabel(item.end)}</b><strong>${escapeHtml(item.stage)}</strong><span>${item.duration.toFixed(1)}s</span></div><div class="mix-row-header-actions">
        <button type="button" class="mix-row-icon-btn" data-mix-delete-row="${index}"${deleteDisabledAttr}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/></svg>
        </button>
        <button type="button" class="mix-row-action-btn${item.needsRematch ? " is-highlight" : ""}" data-mix-rematch-row>重新匹配</button>
        <button type="button" class="mix-row-action-btn mix-row-action-primary" data-mix-replace-row>替换镜头</button>
        <button type="button" class="mix-row-toggle-btn" data-mix-toggle-row aria-expanded="true">收起</button>
      </div></header><div class="mix-rematch-progress" data-mix-rematch-progress${item._isRematching ? "" : " hidden"}><span>AI 换镜中…</span><div class="mix-rematch-progress-track"><div class="mix-rematch-progress-bar"></div></div></div><div class="mix-script-body"><div class="mix-script-detail-layout">${item.assigned.length ? `<div class="mix-stage-preview" data-mix-preview-row tabindex="0" role="button" aria-label="预览第 ${index + 1} 个镜头"><b>▶</b></div>` : `<div class="mix-stage-preview mix-stage-preview-empty" data-mix-replace-row tabindex="0" role="button" aria-label="为第 ${index + 1} 段选择镜头"><div class="mix-stage-preview-empty-text">点击此处选择素材</div><div class="mix-stage-preview-empty-hint">第 ${index + 1} 段尚未匹配镜头</div></div>`}<div class="mix-stage-attributes"><label class="mix-stage-visual-edit mix-stage-visual-primary"><span>画面描述<button type="button" class="mix-visual-reset" data-mix-visual-reset="${index}" title="恢复到第二步进入第三步时的画面描述" aria-label="回到默认"${item.needsRematch ? "" : " disabled aria-disabled=\"true\""}>↶ 回到默认</button>${item.needsRematch && !item._isRematching ? `<em class="mix-visual-rematch-flag" title="已修改描述,需要重新匹配镜头">需重新匹配</em>` : ""}</span><textarea data-mix-row-visual="${index}" placeholder="用一句自然语言描述这个分镜的画面,例如:机器沿墙边清洁,特写展示贴边效果。">${escapeHtml(item.visual)}</textarea></label><i class="mix-field-divider" aria-hidden="true"></i><label class="mix-stage-copy-edit mix-stage-copy-primary"><span>口播文案<i class="mix-stage-copy-readonly-hint" aria-hidden="true">请回上一步修改</i></span><textarea data-mix-row-copy="${index}" readonly aria-readonly="true" title="口播文案不可直接编辑,请返回上一步调整" placeholder="本段口播文案,直接编辑即可触发分镜自动重算">${escapeHtml(item.copy)}</textarea></label></div></div>${hint}</div></article>`;
    }

    function syncMixDuration() {
      const copy = dynamicForm.querySelector("[data-mix-copy]");
      const speed = Number(dynamicForm.querySelector("[data-mix-speed]")?.value || 1);
      const count = String(copy?.value || "").replace(/\s/g, "").length;
      const duration = mixActualDuration();
      const durationText = `${duration.toFixed(1)}s`;
      dynamicForm.querySelector("[data-mix-copy-count]")?.replaceChildren(String(count));
      dynamicForm.querySelector("[data-mix-speed-label]")?.replaceChildren(`${speed.toFixed(2)}×`);
      dynamicForm.querySelector("[data-mix-duration]")?.replaceChildren(durationText);
      dynamicForm.querySelector("[data-mix-script-duration]")?.replaceChildren(`${duration.toFixed(1)}s`);
      dynamicForm.querySelector("[data-mix-final-duration]")?.replaceChildren(`${duration.toFixed(1)} 秒`);
      const voice = dynamicForm.querySelector("[data-mix-voice]")?.value.split(" · ")[0] || "陈子建·公版";
      dynamicForm.querySelector("[data-mix-final-voice]")?.replaceChildren(`${voice} · ${speed.toFixed(2)}×`);
      const status = dynamicForm.querySelector("[data-mix-voice-status]");
      if (status) status.textContent = `${voice} · ${speed.toFixed(2)}×`;
      renderMixScript();
    }

    function renderMixPlanContext(mode) {
      const host = dynamicForm.querySelector("[data-mix-plan-context]");
      if (!host) return;
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (root) {
        root.dataset.mixPlanMode = mode;
        root.dataset.mixSourceConflict = "false";
        if (mode === "ai") root._mixDefaultMaterialIds = null;
      }
      const contexts = {
        ai: `<span class="mix-plan-icon">✦</span><div class="mix-context-main"><div class="mix-context-title"><strong>爆款内容结构</strong><small>选填；不选择时由 AI 自动匹配</small></div><input type="hidden" data-mix-content-structure value="${escapeHtml(root?._mixSelectedStructureMode || "")}"><button class="mix-picker-trigger mix-structure-picker-trigger${root?._mixSelectedStructureName ? " is-selected" : ""}" type="button" data-mix-pick-structure><span><b data-mix-structure-picker-label>${escapeHtml(root?._mixSelectedStructureName || "不选择（AI 自动匹配）")}</b><small data-mix-structure-picker-formula>${root?._mixSelectedStructureName ? "· " : ""}${escapeHtml(root?._mixSelectedStructureName ? (root?._mixSelectedStructureFormula || "已选择爆款内容结构") : "根据产品、素材与时长匹配")}</small></span><i>›</i></button>${root?._mixSelectedStructureName ? '<button class="mix-clear-structure" type="button" data-mix-clear-structure>取消选择</button>' : ""}</div>`,
        copy: `<span class="mix-plan-icon">文</span><div class="mix-context-main"><strong>选择已有文案</strong><small>选择后将基于原文生成本次任务文案，不影响原文。</small><select data-mix-existing-copy hidden><option value="">请选择文案</option></select><button class="mix-picker-trigger mix-source-picker" type="button" data-mix-pick-copy><span data-mix-source-picker-label>选择文案</span><i>›</i></button><div class="mix-source-asset-info" data-mix-source-asset-info><b>原文案</b><span>请选择一条文案查看内容预览</span><button type="button" class="mix-source-expand" data-mix-source-expand hidden>展开全文</button><em>选择后将自动带入关联产品</em></div></div>`,
        script: `<span class="mix-plan-icon">稿</span><div class="mix-context-main"><strong>选择已有脚本</strong><small>脚本口播在第二步确认；原分镜在第三步按当前素材和配音重新校准。</small><select data-mix-existing-script hidden><option value="">请选择脚本</option></select><button class="mix-picker-trigger mix-source-picker" type="button" data-mix-pick-script><span data-mix-source-picker-label>选择脚本</span><i>›</i></button><div class="mix-source-asset-info" data-mix-source-asset-info><b>原脚本口播</b><span>请选择一个脚本查看口播预览</span><button type="button" class="mix-source-expand" data-mix-source-expand hidden>展开全文</button><em>选择后将带入关联产品与分镜</em></div></div>`
      };
      host.innerHTML = contexts[mode] || contexts.ai;
      renderMixAudienceEditor(dynamicForm.querySelector(".mix-flow-form"), []);
      const mixPersonaPicker = dynamicForm.querySelector("[data-persona-picker][data-persona-context='mix']");
      if (mixPersonaPicker) {
        mixPersonaPicker.dataset.personaMode = "template";
        mixPersonaPicker.querySelectorAll("[data-persona-source-mode]").forEach(button => button.classList.toggle("active", button.dataset.personaSourceMode === "template"));
        const templateSelect = mixPersonaPicker.querySelector("[data-persona-template-select]");
        if (templateSelect) templateSelect.hidden = false;
      }
      const product = dynamicForm.querySelector("[data-mix-product]");
      const origin = dynamicForm.querySelector("[data-mix-product-origin]");
      const sourceSelect = host.querySelector("[data-mix-existing-copy], [data-mix-existing-script]");
      const usesSource = mode === "copy" || mode === "script";
      const sourceHasProduct = Boolean(sourceSelect?.selectedOptions?.[0]?.dataset.product);
      const script = mode === "script";
      const productLabel = dynamicForm.querySelector("[data-mix-product-label]");
      if (product) {
        product.disabled = usesSource;
        if (usesSource && !sourceSelect?.value) {
          product.value = "";
          syncMixProductMaterials("");
        } else if (!usesSource && !product.value) {
          // AI 创作进入首屏时不预选产品；由用户选择后再加载关联素材。
          syncMixProductMaterials("");
        }
      }
      if (productLabel) productLabel.textContent = "目标产品";
      if (origin) origin.textContent = usesSource
        ? (!sourceSelect?.value
          ? `请先选择${mode === "copy" ? "已有文案" : "已有脚本"}，系统将自动带入关联产品。`
          : sourceHasProduct
            ? mode === "copy" ? "已带入已有文案相关产品，修改目标人群、视频时长或创作要求后，下一步将按最新配置重新生成一版文案" : "已带入已有脚本相关产品，修改目标人群、视频时长或创作要求后，后续将按最新配置重新生成一版文案及脚本"
            : `${mode === "copy" ? "该文案" : "该脚本"}未关联产品，请更换一篇有关联产品的${mode === "copy" ? "文案" : "脚本"}。`)
        : "选择产品后，系统将匹配内容结构、校验文案并限定本次素材范围。";
      if (sourceSelect?.value) updateMixSourceAsset(sourceSelect);
      syncMixModeFields(mode);
    }

    function syncMixModeFields(mode) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const productField = root.querySelector("[data-mix-product-field]");
      if (productField && !productField.querySelector("[data-mix-product-title]")) {
        const productLabel = productField.querySelector("[data-mix-product-label]");
        const productFacts = productField.querySelector("[data-mix-product-facts]");
        if (productLabel && productFacts) {
          const title = document.createElement("span");
          title.className = "mix-product-title";
          title.dataset.mixProductTitle = "";
          productLabel.parentElement.insertBefore(title, productLabel);
          title.append(productLabel, productFacts);
        }
      }
      const ai = mode === "ai";
      const copyRewrite = mode === "copy";
      const script = mode === "script";
      const aiDriven = ai || copyRewrite || script;
      const hasLinkedProduct = Boolean(root.querySelector("[data-mix-product]")?.value);
      const sourceSelected = Boolean(root.querySelector("[data-mix-existing-copy], [data-mix-existing-script]")?.value);
      const audienceEditor = root.querySelector("[data-persona-picker][data-persona-context='mix']");
      const audienceField = root.querySelector("[data-mix-audience-field]");
      const audienceBlocked = copyRewrite && (!sourceSelected || !hasLinkedProduct);
      if (audienceEditor) {
        audienceField?.toggleAttribute("inert", audienceBlocked);
        audienceField?.classList.toggle("is-disabled", audienceBlocked);
        audienceEditor.setAttribute("aria-disabled", String(audienceBlocked));
      }
      root.querySelector("[data-mix-audience-block]")?.toggleAttribute("hidden", !aiDriven);
      root.querySelector("[data-mix-product-field]")?.toggleAttribute("hidden", false);
      root.querySelector("[data-mix-duration-field]")?.toggleAttribute("hidden", false);
      root.querySelector("[data-mix-duration-presets]")?.toggleAttribute("hidden", true);
      root.querySelector("[data-mix-product-facts]")?.toggleAttribute("hidden", !aiDriven || !hasLinkedProduct);
      root.querySelector("[data-mix-requirement-block]")?.toggleAttribute("hidden", !aiDriven);
      root.querySelector("[data-mix-regenerate-copy]")?.toggleAttribute("hidden", !aiDriven);
      const durationHint = root.querySelector("[data-mix-duration-hint]");
      if (durationHint) durationHint.hidden = !(script && sourceSelected);
      const durationLabel = root.querySelector("[data-mix-duration-label]");
      if (durationLabel) durationLabel.firstChild.nodeValue = "视频生成时长 ";
      const copyHint = root.querySelector("[data-mix-copy-editor-hint]");
      if (copyHint) copyHint.textContent = ai
        ? "可直接修改；产品库禁用话术会在保存前校验。"
        : copyRewrite
          ? "AI 将基于原文、目标人群、时长和本次要求生成新文案；不会修改资产库原文。"
        : script
          ? "AI 将基于已有脚本、目标人群、时长和本次要求重新生成文案及脚本。"
          : "直接使用来源内容；可手动编辑，或通过侧边栏 AI 对话主动改写。";
      const materialNote = root.querySelector(".mix-material-block-head small");
      if (materialNote) materialNote.textContent = script
        ? "展示脚本关联产品的全部素材；原脚本已使用的素材默认勾选，可自行调整。"
        : mode === "copy" ? "展示关联产品的全部素材；可自行选择本次用于混剪的素材。"
        : "默认展示该产品关联素材；取消选择的素材不会参与本次混剪。";
      syncMixRequiredIndicators(root, mode);
      syncMixProductPicker();
    }

    function syncMixRequiredIndicators(root, mode) {
      root.querySelectorAll(".mix-required-star").forEach(node => node.remove());
      const mark = node => {
        if (!node) return;
        const star = document.createElement("span");
        star.className = "required-star mix-required-star";
        star.setAttribute("aria-hidden", "true");
        star.textContent = "*";
        node.append(star);
      };
      mark(root.querySelector("[data-mix-product-label]"));
      mark(root.querySelector("[data-mix-audience-label]"));
      mark(root.querySelector("[data-mix-duration-label]"));
      mark(root.querySelector("[data-mix-material-block] .mix-material-title-line > strong"));
      if (mode === "copy" || mode === "script") mark(root.querySelector("[data-mix-plan-context] > .mix-context-main > strong"));
    }

    const mixProductNames = { "mite-pro":"轻净 Pro 除螨仪", "washer-s5":"净界洗地机 S5", "air-a8":"轻享空气炸锅 A8" };

    function syncMixProductPicker() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const select = root?.querySelector("[data-mix-product]");
      const trigger = root?.querySelector("[data-mix-pick-product]");
      const label = root?.querySelector("[data-mix-product-picker-label]");
      if (!select || !trigger || !label) return;
      label.textContent = mixProductNames[select.value] || "请选择产品";
      label.classList.toggle("placeholder", !select.value);
      trigger.disabled = select.disabled;
      trigger.setAttribute("aria-disabled", String(select.disabled));
    }

    function openMixProductPicker() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const select = root?.querySelector("[data-mix-product]");
      if (!select || select.disabled) return;
      if (!window.CreationProductPicker) return showToast("产品选择器加载失败，请刷新页面后重试。");
      window.CreationProductPicker.open({
        title:"选择目标产品",
        description:"选择后将带入产品事实，并限定本次创作可用素材。",
        items:Object.entries(productCatalog).map(([id, product]) => ({ id, ...product })),
        selectedId:select.value,
        onConfirm(productId) {
          select.value = productId;
          select.dispatchEvent(new Event("change", { bubbles:true }));
        }
      });
    }

    function openMixProductFacts(productIdOverride = "") {
      const productId = productIdOverride || dynamicForm.querySelector("[data-mix-product]")?.value;
      const product = productCatalog[productId];
      if (!product) return showToast("请先选择产品后查看产品事实。");
      const detail = productDetailData[productId] || product;
      const lines = value => Array.isArray(value) ? value : String(value || "").split(/[\n；]/).map(item => item.trim()).filter(Boolean);
      const section = (title, values, empty = "暂无已确认内容") => `<section class="mix-product-drawer-section"><strong>${title}</strong>${values.length ? `<ul>${values.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p>${empty}</p>`}</section>`;
      const links = Array.isArray(detail.links) ? detail.links : [];
      const attachments = Array.isArray(detail.trustAttachments) ? detail.trustAttachments : [];
      const linkMarkup = links.length ? links.map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener"><b>${escapeHtml(link.platform || "商品")}</b><span>${escapeHtml(link.url)}</span></a>`).join("") : "<p>暂无商品链接</p>";
      const attachmentMarkup = attachments.length ? attachments.map(item => `<div class="mix-product-drawer-file"><div><b>${escapeHtml(item.name)}</b><span>${trustAttachmentSize(item.size)} · ${escapeHtml(item.uploadedAt || "已上传")}</span></div><button type="button" data-mix-preview-trust-attachment="${escapeHtml(item.id)}">预览</button></div>`).join("") : "<p>暂无背书附件</p>";
      document.querySelector("[data-mix-product-detail-layer]")?.remove();
      const layer = document.createElement("div");
      layer.className = "mix-product-detail-layer";
      layer.dataset.mixProductDetailLayer = "";
      layer.innerHTML = `<div class="mix-product-detail-mask" data-mix-product-detail-close></div><aside class="mix-product-detail-drawer" role="dialog" aria-modal="true" aria-label="产品详情"><header><div><small>产品详情</small><h2>${escapeHtml(detail.name || product.name)}</h2><p>${escapeHtml(detail.brand || product.brand || "未设置品牌")} · ${escapeHtml(detail.category || product.category || "未设置类目")} · ${escapeHtml(detail.price || "价格待补充")}</p></div><button type="button" data-mix-product-detail-close aria-label="关闭">×</button></header><div class="mix-product-drawer-body"><section class="mix-product-drawer-basic"><strong>基础信息</strong><div><span>产品名称<b>${escapeHtml(detail.name || product.name)}</b></span><span>品牌<b>${escapeHtml(detail.brand || product.brand || "—")}</b></span><span>类目<b>${escapeHtml(detail.category || product.category || "—")}</b></span><span>价格<b>${escapeHtml(detail.price || "—")}</b></span></div><em>商品链接</em><nav>${linkMarkup}</nav></section><section class="mix-product-drawer-description"><strong>商品描述</strong><pre>${escapeHtml(detail.description || "暂无商品描述")}</pre></section><div class="mix-product-drawer-content-grid">${section("核心卖点", lines(detail.core || product.core))}${section("次要卖点", lines(detail.secondary || product.secondary))}${section("差异化卖点", lines(detail.difference || product.difference))}${section("产品信任背书", lines(detail.trust), "暂无信任依据")}<section class="mix-product-drawer-section mix-product-drawer-attachments"><strong>背书附件</strong>${attachmentMarkup}</section>${section("禁用话术", lines(detail.forbidden), "暂无禁用表达")}</div></div></aside>`;
      document.body.appendChild(layer);
      requestAnimationFrame(() => layer.classList.add("show"));
      layer.addEventListener("click", event => {
        if (event.target.closest("[data-mix-product-detail-close]")) { layer.remove(); return; }
        const preview = event.target.closest("[data-mix-preview-trust-attachment]");
        if (preview) openTrustAttachment(attachments.find(item => item.id === preview.dataset.mixPreviewTrustAttachment));
      });
    }
    const mixMiteMaterialExtras = [
      ["M-EX-01","床褥纤维近景","痛点解释",4],["M-EX-02","床单拍打过程","使用过程",4],["M-EX-03","尘杯倒出碎屑","结果证明",3],
      ["M-EX-04","沙发缝隙清洁","使用过程",6],["M-EX-05","儿童床褥清洁","使用场景",7],["M-EX-06","宠物毛发吸入","结果证明",5],
      ["M-EX-07","滤网拆洗特写","使用便利",4],["M-EX-08","手持移动展示","产品展示",3],["M-EX-09","床垫边缘清洁","功能演示",5],
      ["M-EX-10","抱枕除尘过程","使用过程",4],["M-EX-11","尘杯装回过程","使用便利",3],["M-EX-12","开机操作特写","功能演示",3],
      ["M-EX-13","卧室整理全景","使用场景",6],["M-EX-14","产品配件展示","产品展示",4],["M-EX-15","低角度推进镜头","使用过程",5],
      ["M-EX-16","沙发坐垫清洁","多场景",6],["M-EX-17","收纳盒特写","使用便利",4],["M-EX-18","机身细节近景","产品展示",3]
    ];
    const mixProductMaterialSamples = {
      "mite-pro":[["M-CL-101","透明尘杯脏污特写","结果证明",2],["M-SC-301","床垫表面推进清洁","使用过程",6],["M-CL-102","拍打吸尘动作特写","功能演示",5],["M-PF-201","卧室床垫清洁全景","使用场景",8],["M-PF-202","沙发布艺清洁全景","多场景",7],["M-AT-503","产品定帧与购买引导","行动引导",4],...mixMiteMaterialExtras],
      "washer-s5":[["W-101","污水箱清洁结果","结果证明",2],["W-102","贴边清洁推进","功能演示",7],["W-103","毛发吸入特写","痛点解决",5],["W-104","客厅地面全景","使用场景",8],["W-105","滚刷自清洁过程","使用便利",6]],
      "air-a8":[["A-101","薯条出锅结果","结果证明",3],["A-102","食材放入炸篮","使用过程",5],["A-103","热风工作特写","功能演示",6],["A-104","家庭餐桌场景","使用场景",8],["A-105","炸篮拆洗过程","使用便利",5]]
    };
    // 仅保留生成样稿；名称、公式、阶段、来源和状态都由模板库提供。
    const mixGeneratedCopyByProfile = {
      result:"刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先看轻净 Pro 走完一遍后的透明尘杯，结果不用猜。拍打和吸尘同步进行，把织物深处的细小脏污带出来。床垫、沙发和其他布艺都能使用，用完尘杯还可以拆下来水洗。家里有孩子或宠物，日常清洁别只停留在表面。点击商品，查看完整实测过程。",
      contrast:"地面刚拖完，为什么还是留下水渍和毛发？普通拖把容易把脏污来回带，净界 S5 从贴边清洁开始，把吸、拖、洗结合在一次推进里。清洁前后的差别直接看污水箱，滚刷使用后还能启动自清洁。客厅、餐区和墙边都能连续处理，减少反复换工具。点击商品，查看完整清洁演示。",
      scene:"工作日想快速做一顿热食，又不想守在锅边？轻享 A8 从食材放入炸篮开始，通过热风循环完成加热。薯条、小食和家庭加餐可以按不同档位处理，出锅状态直接展示。使用后炸篮可以拆下清洗，日常收拾更方便。点击商品，查看更多家庭场景做法。",
      audience:"家里有孩子或宠物的，日常清洁最怕不同脏污反复换工具。产品把关键清洁动作放进一次使用里，针对常见场景逐项演示对应能力。先看完整使用过程，再根据自己的清洁需求选择。"
    };
    let mixTemplateStructureCatalog = null;
    let activeMixStructurePickerRender = null;
    let mixTemplateDetailLayer = null;
    let mixTemplateDetailFrame = null;

    function mixTemplateLibraryFrame() {
      return document.querySelector("#page-template-library iframe");
    }

    function requestMixTemplateStructureCatalog() {
      mixTemplateLibraryFrame()?.contentWindow?.postMessage({ type:"content-compass-template-catalog-request" }, "*");
    }

    function closeMixTemplateStructureDetail() {
      mixTemplateDetailLayer?.remove();
      mixTemplateDetailLayer = null;
      mixTemplateDetailFrame = null;
    }

    function openMixTemplateStructureDetail(item) {
      if (!item) return;
      closeMixTemplateStructureDetail();
      const layer = document.createElement("div");
      layer.className = "mix-template-detail-layer";
      layer.innerHTML = `<div class="mix-template-detail-mask" data-mix-detail-close></div><iframe class="mix-template-detail-frame" src="embedded-pages/图片库.html?entry=template-library&drawer=1&v=20260817c" title="爆款内容结构详情"></iframe>`;
      const frame = layer.querySelector("iframe");
      layer.addEventListener("click", event => {
        if (event.target.closest("[data-mix-detail-close]")) closeMixTemplateStructureDetail();
      });
      frame.addEventListener("load", () => {
        frame.contentWindow?.postMessage({ type:"content-compass-template-operation", kind:"content-structure", action:"template-view", id:item.id, name:item.name }, "*");
      }, { once:true });
      mixTemplateDetailLayer = layer;
      mixTemplateDetailFrame = frame;
      document.body.append(layer);
    }

    window.addEventListener("message", event => {
      const libraryFrame = mixTemplateLibraryFrame();
      if (event.source === libraryFrame?.contentWindow && event.data?.type === "content-compass-template-catalog" && event.data.catalog?.["content-structure"]) {
        mixTemplateStructureCatalog = event.data.catalog["content-structure"];
        activeMixStructurePickerRender?.();
        if (pendingCopyStructureId) setCopyStructureSelection(pendingCopyStructureId);
      }
      if (event.source === mixTemplateDetailFrame?.contentWindow && event.data?.type === "content-compass-template-operation-close") closeMixTemplateStructureDetail();
    });
    // 自动匹配与手动选择共用模板库目录；不要求用户先打开选择器。
    mixTemplateLibraryFrame()?.addEventListener("load", requestMixTemplateStructureCatalog, { once:true });
    requestMixTemplateStructureCatalog();

    function mixStructurePickerItems() {
      // 唯一数据源是模板库 iframe；提炼失败项仅留在模板库内供重新解析。
      return (mixTemplateStructureCatalog || []).filter(item => item.status !== "提炼失败");
    }

    function mixAutoStructure(productId) {
      const items = mixStructurePickerItems();
      return items.find(item => item.autoProductIds?.includes(productId))
        || items.find(item => !item.autoProductIds?.length)
        || items[0]
        || null;
    }

    function mixCurrentStructure() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const selectedId = dynamicForm.querySelector("[data-mix-content-structure]")?.value || root?._mixSelectedStructureId || "";
      const productId = dynamicForm.querySelector("[data-mix-product]")?.value || "mite-pro";
      return mixStructurePickerItems().find(item => item.id === selectedId) || mixAutoStructure(productId);
    }

    function mixStructureStatusLabel(item) {
      return item.status || "—";
    }

    function mixStructureEvidence(item) {
      if (item.sampleCount) {
        const recent30 = item.recent30;
        const recent30Label = recent30
          ? `近30日命中 <b>${Number(recent30.hitCount).toLocaleString("zh-CN")} 条</b>｜消耗 <b>¥${Math.round(Number(recent30.spend || 0)).toLocaleString("zh-CN")}</b> · ROI <b>${Number(recent30.roi || 0).toFixed(2)}</b>`
          : "近30日暂无投放数据";
        return `<div class="mix-structure-evidence"><span>学习样本 <b>${Number(item.sampleCount).toLocaleString("zh-CN")} 条</b></span><span>${recent30Label}</span></div>`;
      }
      if (item.reference) return `<div class="mix-structure-evidence"><span>提炼来源 <b title="${escapeHtml(item.reference)}">${escapeHtml(item.reference)}</b></span></div>`;
      return "";
    }

    function applyMixStructureSelection(id = "") {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const item = mixStructurePickerItems().find(structure => structure.id === id);
      root._mixSelectedStructureId = item?.id || "";
      root._mixSelectedStructureName = item?.name || "";
      root._mixSelectedStructureFormula = item?.formula || "";
      root._mixSelectedStructureMode = item?.id || "";
      renderMixPlanContext("ai");
      syncMixStructureDecision();
    }

    function openContentStructurePicker(options = {}) {
      let selectedId = options.selectedId || "";
      let source = "all";
      let query = "";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100060";
      const closePicker = () => {
        closeMixTemplateStructureDetail();
        if (activeMixStructurePickerRender === render) activeMixStructurePickerRender = null;
        overlay.remove();
      };
      const updateSelection = id => {
        selectedId = id;
        overlay.querySelectorAll("[data-mix-structure-option]").forEach(card => {
          const selected = card.dataset.mixStructureOption === selectedId;
          card.classList.toggle("selected", selected);
          card.setAttribute("aria-checked", String(selected));
          const marker = card.querySelector(":scope > i");
          if (marker) marker.textContent = selected ? "✓" : "";
        });
        const summary = overlay.querySelector("[data-mix-structure-selection-summary]");
        if (summary) summary.textContent = selectedId ? "已选择 1 个爆款内容结构" : "未选择时将由 AI 自动匹配";
      };
      const render = () => {
        const structures = mixStructurePickerItems().filter(item => item.sourceKey !== "custom" && (source === "all" || item.sourceKey === source) && (!query || `${item.name} ${item.formula}`.toLowerCase().includes(query.toLowerCase())));
        const list = mixTemplateStructureCatalog === null
          ? '<p class="mix-structure-picker-empty">正在加载模板库结构…</p>'
          : structures.length
            ? structures.map(item => `<article class="mix-structure-pick-card${selectedId === item.id ? " selected" : ""}" data-mix-structure-option="${item.id}" role="radio" tabindex="0" aria-checked="${selectedId === item.id}"><i>${selectedId === item.id ? "✓" : ""}</i><div><header><strong>${escapeHtml(item.name)}</strong><span class="mix-structure-card-tags"><em class="${item.sourceKey}">${escapeHtml(item.source)}</em><em class="status">${escapeHtml(mixStructureStatusLabel(item))}</em></span></header><p class="mix-structure-pick-formula">${escapeHtml(item.formula)}</p>${mixStructureEvidence(item)}<button type="button" data-mix-structure-detail="${item.id}">查看结构详情</button></div></article>`).join("")
            : '<p class="mix-structure-picker-empty">没有符合条件的爆款内容结构。</p>';
        const listMarkup = `<button type="button" class="mix-structure-pick-card auto${!selectedId ? " selected" : ""}" data-mix-structure-option="" role="radio" aria-checked="${!selectedId}"><i>${!selectedId ? "✓" : ""}</i><div><header><strong>不选择（AI 自动匹配）</strong></header><p>不指定结构时，由 AI 自动匹配。</p></div></button>${list}`;
        const listHost = overlay.querySelector("[data-mix-structure-list]");
        if (listHost) {
          listHost.innerHTML = listMarkup;
          overlay.querySelectorAll("[data-mix-structure-source]").forEach(button => button.classList.toggle("active", button.dataset.mixStructureSource === source));
          return;
        }
        overlay.innerHTML = `<div class="modal-card mix-structure-picker-modal" role="dialog" aria-label="选择爆款内容结构"><header class="modal-head"><div><strong>选择爆款内容结构</strong><small>选填；不选择时由 AI 根据本次创作信息自动匹配。</small></div><button class="modal-close" type="button" data-close>×</button></header><div class="mix-structure-picker-toolbar"><div class="mix-structure-source-tabs">${[["all","全部"],["qianchuan","千川学习"],["reference","参考视频提炼"]].map(([value,label]) => `<button type="button" class="${source === value ? "active" : ""}" data-mix-structure-source="${value}">${label}</button>`).join("")}</div><label>⌕<input type="search" data-mix-structure-query placeholder="搜索结构名称或内容公式" value="${escapeHtml(query)}"></label></div><div class="mix-structure-picker-list" data-mix-structure-list role="radiogroup" aria-label="内容结构列表">${listMarkup}</div><footer class="modal-foot"><span data-mix-structure-selection-summary>${selectedId ? "已选择 1 个爆款内容结构" : "未选择时将由 AI 自动匹配"}</span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-confirm>确认选择</button></div></footer></div>`;
      };
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-close]")) { closePicker(); return; }
        const sourceButton = event.target.closest("[data-mix-structure-source]");
        if (sourceButton) { source = sourceButton.dataset.mixStructureSource; render(); return; }
        const detail = event.target.closest("[data-mix-structure-detail]");
        if (detail) return openMixTemplateStructureDetail(mixStructurePickerItems().find(item => item.id === detail.dataset.mixStructureDetail));
        const option = event.target.closest("[data-mix-structure-option]");
        if (option) { updateSelection(option.dataset.mixStructureOption); return; }
        if (event.target.closest("[data-confirm]")) {
          options.onConfirm?.(selectedId, mixStructurePickerItems().find(item => item.id === selectedId) || null);
          closePicker();
        }
      });
      overlay.addEventListener("input", event => {
        if (event.target.matches("[data-mix-structure-query]")) {
          query = event.target.value;
          render();
          const input = overlay.querySelector("[data-mix-structure-query]");
          input?.focus();
          input?.setSelectionRange(query.length, query.length);
        }
      });
      overlay.addEventListener("keydown", event => {
        if (event.key === "Escape") { closePicker(); return; }
        if (event.target.closest("[data-mix-structure-detail]")) return;
        if (!((event.key === "Enter" || event.key === " ") && event.target.closest("[data-mix-structure-option]"))) return;
        event.preventDefault();
        updateSelection(event.target.closest("[data-mix-structure-option]").dataset.mixStructureOption);
      });
      document.body.append(overlay);
      activeMixStructurePickerRender = render;
      render();
      requestMixTemplateStructureCatalog();
    }

    function openMixStructurePicker() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      openContentStructurePicker({
        selectedId:root._mixSelectedStructureId || "",
        onConfirm(selectedId) {
          applyMixStructureSelection(selectedId);
          showToast(selectedId ? "已选择爆款内容结构，可在下一步确认文案与配音" : "将由 AI 自动匹配爆款内容结构");
        }
      });
    }

    function openCopyStructurePicker() {
      openContentStructurePicker({
        selectedId:dynamicForm.querySelector("[data-copy-structure-value]")?.value || "",
        onConfirm(selectedId) {
          setCopyStructureSelection(selectedId);
          setFormFeedback(selectedId
            ? `已选择文案结构“${creationContext.originalFields.copyStructure}”。`
            : "未指定文案结构，将由 AI 结合产品信息与脚本类型自动匹配。");
          showToast(selectedId ? "已选择爆款内容结构" : "将由 AI 自动匹配爆款内容结构");
        }
      });
    }

    function renderMixMaterialCard(item, index, selected = true) {
      const [id, name, scene, duration, suppliedTags] = item;
      const source = findScriptMaterial(id);
      const sourceTags = source?.tags || suppliedTags || [scene];
      const tags = [...new Set(sourceTags.filter(Boolean))];
      const type = source?.type === "image" ? "图片" : "视频";
      const size = source?.fileSize || (type === "图片" ? "1.8 MB" : `${Math.max(18.6, Number(duration || 3) * 31.48).toFixed(2)} MB`);
      const status = source?.status || "ok";
      const statusText = { ok:"已分析", pending:"待分析", analyzing:"分析中", fail:"分析失败" }[status] || status;
      return `<article class="mix-material-card${selected ? " selected" : ""}" data-mix-material="${escapeHtml(id)}" data-mix-material-tags="${escapeHtml(tags.join("|"))}" data-mix-material-scene="${escapeHtml(scene)}" data-mix-material-type="${type === "图片" ? "image" : "video"}" data-mix-material-status="${escapeHtml(status)}" tabindex="0" role="checkbox" aria-checked="${selected}" aria-label="选择素材：${escapeHtml(name)}"><button class="mix-material-select" type="button" aria-label="${selected ? "取消选择" : "选择"}${escapeHtml(name)}">${selected ? "✓" : ""}</button><div class="mix-material-cover tone-${index % 6 + 1}"><span class="mix-material-status pda-status-${escapeHtml(status)}">${statusText}</span><button class="mix-material-preview" type="button" data-mix-preview-material aria-label="预览${escapeHtml(name)}">▶</button><em>00:${String(Math.round(duration || 3)).padStart(2,"0")}</em></div><strong>${escapeHtml(name)}</strong><small><span>${type}</span><i>·</i>${size}</small></article>`;
    }

    function syncMixMaterialTagFilter() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const count = dynamicForm.querySelector("[data-mix-tag-filter-count]");
      if (!root) return;
      const current = new Set(String(root.dataset.mixMaterialTagFilter || "").split("|").filter(Boolean));
      const tags = [...new Set([...dynamicForm.querySelectorAll("[data-mix-material]")]
        .flatMap(card => String(card.dataset.mixMaterialTags || "").split("|").filter(Boolean)))];
      const selected = [...current].filter(tag => tags.includes(tag));
      root.dataset.mixMaterialTagFilter = selected.join("|");
      if (count) count.textContent = selected.length ? ` ${selected.length}` : "";
    }

    function openMixMaterialTagFilter() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const cards = [...dynamicForm.querySelectorAll("[data-mix-material]")];
      const tags = [...new Set(cards.flatMap(card => String(card.dataset.mixMaterialTags || "").split("|").filter(Boolean)))];
      const selected = new Set(String(root.dataset.mixMaterialTagFilter || "").split("|").filter(Boolean));
      const groupByMaterial = { "产品特写":"产品标签", "产品全景":"产品标签", "使用场景":"场景标签", "痛点对比":"内容标签", "活动物料":"营销标签" };
      const fallbackGroup = tag => /床垫|沙发|卧室|客厅|家庭|场景/.test(tag) ? "场景标签" : /结果|痛点|功能|过程|行动|购买|品牌/.test(tag) ? "内容标签" : "产品标签";
      const tagGroup = tag => {
        const card = cards.find(item => String(item.dataset.mixMaterialTags || "").split("|").includes(tag));
        return groupByMaterial[findScriptMaterial(card?.dataset.mixMaterial)?.group] || fallbackGroup(tag);
      };
      const groups = ["全部标签", "产品标签", "场景标签", "内容标签", "营销标签"];
      let activeGroup = "全部标签";
      let query = "";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100030";
      const render = () => {
        const visibleTags = tags.filter(tag => (activeGroup === "全部标签" || tagGroup(tag) === activeGroup) && (!query || tag.toLowerCase().includes(query.toLowerCase())));
        overlay.innerHTML = `<div class="modal-card mix-tag-filter-modal" role="dialog" aria-label="素材标签筛选"><header class="modal-head"><div><span class="mix-filter-kicker">筛选</span><strong>按标签筛选素材</strong></div><button class="modal-close" type="button" data-close>×</button></header><div class="mix-tag-filter-layout"><aside>${groups.map(group => { const amount = group === "全部标签" ? tags.length : tags.filter(tag => tagGroup(tag) === group).length; return `<button type="button" class="${activeGroup === group ? "active" : ""}" data-tag-group="${group}"><span>${group}</span><b>${amount}</b></button>`; }).join("")}</aside><section><label class="mix-tag-search">⌕<input type="search" data-tag-query placeholder="搜索标签…" value="${escapeHtml(query)}"></label><div class="mix-tag-filter-content">${visibleTags.length ? visibleTags.map(tag => `<button type="button" class="${selected.has(tag) ? "selected" : ""}" data-tag="${escapeHtml(tag)}" aria-pressed="${selected.has(tag)}">${selected.has(tag) ? "✓ " : ""}${escapeHtml(tag)}</button>`).join("") : '<span>没有符合条件的标签</span>'}</div></section></div><footer class="modal-foot"><span>已选 ${selected.size} 个标签</span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-clear ${selected.size ? "" : "disabled"}>清空</button><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-apply>应用筛选</button></div></footer></div>`;
      };
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-close]")) { overlay.remove(); return; }
        const group = event.target.closest("[data-tag-group]")?.dataset.tagGroup;
        if (group) { activeGroup = group; render(); return; }
        const tag = event.target.closest("[data-tag]")?.dataset.tag;
        if (tag) { if (selected.has(tag)) selected.delete(tag); else selected.add(tag); render(); return; }
        if (event.target.closest("[data-clear]")) { selected.clear(); render(); return; }
        if (event.target.closest("[data-apply]")) {
          root.dataset.mixMaterialTagFilter = [...selected].join("|");
          syncMixMaterialTagFilter();
          renderMixMaterialPage(1);
          overlay.remove();
        }
      });
      overlay.addEventListener("input", event => {
        if (!event.target.matches("[data-tag-query]")) return;
        query = event.target.value;
        render();
        overlay.querySelector("[data-tag-query]")?.focus();
      });
      document.body.appendChild(overlay);
      render();
    }

    function mixFilteredMaterialCards() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const cards = [...dynamicForm.querySelectorAll("[data-mix-material]")];
      const query = String(root?.dataset.mixMaterialQuery || "").trim().toLowerCase();
      const filter = root?.dataset.mixMaterialFilter || "all";
      const tagFilters = String(root?.dataset.mixMaterialTagFilter || "").split("|").filter(Boolean);
      return cards.filter(card => {
        const materialType = card.dataset.mixMaterialType || (card.querySelector("small")?.textContent.includes("图片") ? "image" : "video");
        const tags = String(card.dataset.mixMaterialTags || "").split("|");
        if (filter !== "all" && filter !== materialType) return false;
        if (tagFilters.length && !tagFilters.every(tag => tags.includes(tag))) return false;
        if (!query) return true;
        return [card.dataset.mixMaterial, card.querySelector("strong")?.textContent, card.querySelector("small")?.textContent, ...tags]
          .some(value => String(value || "").toLowerCase().includes(query));
      });
    }

    function renderMixMaterialPage(page = 1) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const pager = dynamicForm.querySelector("[data-mix-material-pagination]");
      const empty = dynamicForm.querySelector("[data-mix-material-empty]");
      if (!grid || !pager) return;
      if (!root?.querySelector("[data-mix-product]")?.value) return;
      const cards = [...grid.querySelectorAll("[data-mix-material]")];
      const filteredCards = mixFilteredMaterialCards();
      const pageSize = 20;
      const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
      const current = Math.max(1, Math.min(Number(page) || 1, totalPages));
      if (root) root.dataset.mixMaterialPage = String(current);
      const visibleCards = new Set(filteredCards.slice((current - 1) * pageSize, current * pageSize));
      cards.forEach(card => { card.hidden = !visibleCards.has(card); });
      if (empty) {
        empty.hidden = filteredCards.length > 0;
        if (!empty.hidden) {
          empty.querySelector("[data-mix-material-empty-title]").textContent = "暂无符合条件的素材";
          empty.querySelector("[data-mix-material-empty-detail]").textContent = "请调整搜索或筛选条件，或点击「添加素材」上传新素材。";
        }
      }
      pager.hidden = filteredCards.length <= pageSize;
      if (!pager.hidden) {
        pager.innerHTML = `<span>显示 ${visibleCards.size} / ${filteredCards.length} 条</span><div><button type="button" data-mix-material-page="prev" ${current === 1 ? "disabled" : ""}>‹ 上一页</button><b>${current} / ${totalPages}</b><button type="button" data-mix-material-page="next" ${current === totalPages ? "disabled" : ""}>下一页 ›</button></div>`;
      }
    }

    function toggleMixMaterialSelection(card) {
      if (!card) return;
      card.classList.toggle("selected");
      const selected = card.classList.contains("selected");
      card.setAttribute("aria-checked", String(selected));
      const select = card.querySelector(".mix-material-select");
      if (select) {
        select.textContent = selected ? "✓" : "";
        select.setAttribute("aria-label", `${selected ? "取消选择" : "选择"}${card.querySelector("strong")?.textContent || "素材"}`);
      }
      updateMixMaterialSummary();
    }

    function focusMixMaterial(id) {
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const cards = [...grid?.querySelectorAll("[data-mix-material]") || []];
      const index = cards.findIndex(card => card.dataset.mixMaterial === id);
      if (index < 0) return;
      renderMixMaterialPage(Math.floor(index / 20) + 1);
      const card = cards[index];
      grid.scrollTop = Math.max(0, card.offsetTop - 12);
      card.classList.add("is-new");
      window.setTimeout(() => card.classList.remove("is-new"), 1300);
    }

    function openMixMaterialPreview(card) {
      if (!card) return;
      const name = card.querySelector("strong")?.textContent || "素材预览";
      const meta = card.querySelector("small")?.textContent || "";
      const duration = card.querySelector(".mix-material-cover em")?.textContent || "";
      const tone = [...card.querySelector(".mix-material-cover")?.classList || []].find(value => value.startsWith("tone-")) || "tone-1";
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      overlay.style.zIndex = "100030";
      overlay.innerHTML = `<div class="modal-card mix-material-preview-modal" role="dialog" aria-label="素材预览"><header class="modal-head"><div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(card.dataset.mixMaterial || "")} · ${escapeHtml(meta)}</small></div><button class="modal-close" type="button" data-modal-close>×</button></header><div class="mix-preview-stage ${tone}" data-mix-preview-stage><button type="button" data-mix-preview-toggle>▶</button><span>${escapeHtml(name)}</span><em>${escapeHtml(duration)}</em></div><footer class="mix-preview-foot"><span>预览画面仅用于确认素材内容与时长</span><button class="primary-btn" type="button" data-modal-close>完成</button></footer></div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-modal-close]")) overlay.remove();
        const toggle = event.target.closest("[data-mix-preview-toggle]");
        if (toggle) toggle.textContent = toggle.textContent === "▶" ? "Ⅱ" : "▶";
      });
    }

    function syncMixProductMaterials(productId) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      const empty = dynamicForm.querySelector("[data-mix-material-empty]");
      const facts = dynamicForm.querySelector("[data-mix-product-facts] span");
      const pager = dynamicForm.querySelector("[data-mix-material-pagination]");
      const addMaterial = dynamicForm.querySelector("[data-mix-add-material]");
      if (!grid || !empty) return;
      if (addMaterial) {
        addMaterial.disabled = !productId;
        addMaterial.title = productId ? "关联创作素材" : "请先选择目标产品";
      }
      dynamicForm.querySelector("[data-mix-product-facts]")?.toggleAttribute("hidden", !productId);
      if (!productId) {
        grid.hidden = true;
        grid.innerHTML = "";
        empty.hidden = false;
        empty.querySelector("[data-mix-material-empty-title]").textContent = "请先选择目标产品";
        empty.querySelector("[data-mix-material-empty-detail]").textContent = "选择产品后，即可关联、筛选或添加本次混剪所需的创作素材。";
        if (pager) pager.hidden = true;
        dynamicForm.querySelector("[data-mix-total-count]")?.replaceChildren("0");
        syncMixMaterialSelection([]);
        dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialTagFilter = "";
        syncMixMaterialTagFilter();
        if (contextStatus) {
          contextStatus.hidden = false;
          contextStatus.textContent = "未选择产品";
        }
        return;
      }
      grid.hidden = false;
      empty.hidden = true;
      const productName = mixProductNames[productId] || "";
      const catalogMaterials = allScriptMaterials().filter(item => item.product === productName || !item.product);
      const samples = catalogMaterials.length
        ? catalogMaterials.map(item => [item.id, item.name, item.scene, item.duration, item.tags])
        : (mixProductMaterialSamples[productId] || []);
      const defaultSelected = root?._mixDefaultMaterialIds instanceof Set ? root._mixDefaultMaterialIds : null;
      grid.innerHTML = samples.map((item, index) => renderMixMaterialCard(item, index, defaultSelected ? defaultSelected.has(item[0]) : true)).join("");
      const search = dynamicForm.querySelector("[data-mix-material-search]");
      const filter = dynamicForm.querySelector("[data-mix-material-filter]");
      if (search) search.value = "";
      if (filter) filter.value = "all";
      dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialQuery = "";
      dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialFilter = "all";
      dynamicForm.querySelector(".mix-flow-form").dataset.mixMaterialTagFilter = "";
      if (facts) facts.textContent = productId === "mite-pro" ? "深层清洁 · 拍打吸尘同步 · 透明尘杯可水洗 · 禁用“100%除螨”" : productId === "washer-s5" ? "吸拖洗一体 · 贴边清洁 · 滚刷自清洁 · 禁用“完全无水渍”" : "热风循环 · 多档温控 · 炸篮可拆洗 · 禁用“零油脂”";
      dynamicForm.querySelector("[data-mix-final-product]")?.replaceChildren(mixProductNames[productId]);
      // 同步 step 4 输出规格(画面比例)
      const ratio = dynamicForm.querySelector("[data-mix-ratio]")?.value || "9:16";
      const spec = ratio === "16:9" ? "16:9 · 1920×1080 · 30fps" : "9:16 · 1080×1920 · 30fps";
      dynamicForm.querySelector("[data-mix-final-spec]")?.replaceChildren(spec);
      dynamicForm.querySelector("[data-mix-total-count]")?.replaceChildren(String(samples.length));
      if (contextStatus) {
        contextStatus.hidden = false;
        contextStatus.textContent = `已选择：${mixProductNames[productId]}`;
      }
      syncMixMaterialTagFilter();
      renderMixMaterialPage(1);
      updateMixMaterialSummary();
    }

    function updateMixSourceAsset(select) {
      const option = select?.selectedOptions?.[0];
      if (!option) return;
      const info = dynamicForm.querySelector("[data-mix-source-asset-info]");
      const isScript = select.matches("[data-mix-existing-script]");
      const externalCopy = !isScript && dynamicForm.querySelector(".mix-flow-form")?._mixExternalCopy;
      const externalScript = isScript && dynamicForm.querySelector(".mix-flow-form")?._mixExternalScript;
      if (info) {
        const sourceText = isScript
          ? (externalScript?.sourceFull || externalScript?.source || externalScript?.text || "")
          : (externalCopy?.text || SCRIPT_LIBRARY_ITEMS.find(item => item.id === option.value)?.text || "");
        const wordCount = sourceText.replace(/\s/g, "").length;
        const sourceDuration = Math.max(1, Math.round(isScript ? (Number(externalScript?.duration) || wordCount / 3.35) : wordCount / 3.35));
        info.querySelector("b").textContent = isScript ? "原脚本口播" : "原文案";
        const preview = sourceText
          ? `${sourceText.slice(0, 72)}${sourceText.length > 72 ? "…" : ""}`
          : isScript ? "请选择一个脚本查看口播预览" : "请选择一条文案查看内容预览";
        const previewNode = info.querySelector("span");
        if (previewNode) {
          previewNode.dataset.fullText = sourceText;
          previewNode.dataset.expanded = "false";
          previewNode.textContent = preview;
        }
        const expandButton = info.querySelector("[data-mix-source-expand]");
        if (expandButton) {
          expandButton.hidden = sourceText.length <= 72;
          expandButton.textContent = "展开全文";
        }
        info.querySelector("em").textContent = sourceText
          ? `${wordCount} 字 · ${isScript ? "原脚本" : "预计"} ${sourceDuration} 秒`
          : isScript ? "选择后将带入关联产品与分镜" : "选择后将自动带入关联产品";
      }
      dynamicForm.querySelector(".mix-flow-form").dataset.mixSourceConflict = "false";
    }

    function renderMixAudienceEditor(root, names = []) {
      const box = root.querySelector("[data-mix-audience-box]");
      if (!box) return;
      const standardAudiences = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
      box.querySelectorAll(".mix-source-audience-chip").forEach(item => item.remove());
      names.filter(name => !standardAudiences.includes(name)).forEach(name => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "original-audience-chip audience-chip mix-source-audience-chip";
        chip.textContent = name;
        box.prepend(chip);
      });
      box.querySelectorAll(".audience-chip").forEach(chip => chip.classList.toggle("active", names.includes(chip.textContent.trim())));
      const first = names[0] ? personaCatalog.find(persona => persona.name === names[0] || persona.audience === names[0]) : null;
      const gender = root.querySelector("[data-role='mix-gender']");
      const age = root.querySelector("[data-role='mix-age']");
      gender?.querySelectorAll(".choice-chip").forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === (first?.gender || "不限")));
      age?.querySelectorAll(".choice-chip").forEach(chip => chip.classList.toggle("active", chip.textContent.trim() === (first?.age || "")));
      root.querySelector("[data-mix-audience-pain]").value = first?.pain?.join("\n") || "";
      root.querySelector("[data-mix-audience-scenes]").value = first?.scenes?.join("\n") || "";
    }

    function setMixSourceSelection(kind, item) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const source = root?.querySelector(kind === "script" ? "[data-mix-existing-script]" : "[data-mix-existing-copy]");
      if (!source || !item) return;
      const productId = item.productId || Object.entries(mixProductNames).find(([, name]) => name === item.product)?.[0] || "";
      const label = kind === "script"
        ? `${item.name}｜${item.product}｜${item.rows?.length || 0} 段`
        : `${mixProductNames[productId] || "通用文案"}｜约${Math.max(1, Math.round((item.text || "").replace(/\s/g, "").length / 4))}秒`;
      source.innerHTML = `<option value="${escapeHtml(item.id)}" data-product="${escapeHtml(productId)}">${escapeHtml(label)}</option>`;
      source.value = item.id;
      root[kind === "script" ? "_mixExternalScript" : "_mixExternalCopy"] = item;
      if (kind === "copy") root._mixCopyRewriteVersion = 0;
      const trigger = root.querySelector(kind === "script" ? "[data-mix-pick-script]" : "[data-mix-pick-copy]");
      trigger?.querySelector("[data-mix-source-picker-label]")?.replaceChildren(label);
      const productSelect = root.querySelector("[data-mix-product]");
      if (productId && productSelect) {
        productSelect.value = productId;
        productSelect.disabled = true;
        root._mixDefaultMaterialIds = kind === "script"
          ? new Set([
            ...(item.usedMaterialIds || []),
            ...((item.rows || item.scriptRows || []).flatMap(row => row.materialIds || row.materialRefs || (row.materialOverride ? [row.materialOverride] : (row.material ? [String(row.material).split(" · ")[0]] : []))))
          ])
          : null;
        syncMixProductMaterials(productId);
        root.querySelector("[data-mix-product-origin]")?.replaceChildren(kind === "copy" ? "已带入已有文案相关产品，修改目标人群、视频时长或创作要求后，下一步将按最新配置重新生成一版文案" : "已带入已有脚本相关产品，修改目标人群、视频时长或创作要求后，后续将按最新配置重新生成一版文案及脚本");
      } else if (productSelect) {
        productSelect.value = "";
        productSelect.disabled = false;
        root._mixDefaultMaterialIds = null;
        syncMixProductMaterials("");
        root.querySelector("[data-mix-product-origin]")?.replaceChildren(`${kind === "copy" ? "该文案" : "该脚本"}未关联产品，请更换一篇有关联产品的${kind === "copy" ? "文案" : "脚本"}。`);
      }
      const sourceText = String(item.sourceFull || item.source || item.text || "");
      const normalizeSource = value => String(value || "").replace(/[，。！？、,.!?\s]/g, "");
      const matchedCopy = kind === "script"
        ? SCRIPT_LIBRARY_ITEMS.find(copy => copy.productId === productId && copy.text && normalizeSource(sourceText).includes(normalizeSource(copy.text).slice(0, 16)))
        : null;
      const sourceAudiences = (Array.isArray(item.audiences) ? item.audiences : String(item.audience || item.targetAudience || matchedCopy?.audience || "").split(/[、,，]/))
        .map(value => String(value || "").trim()).filter(Boolean);
      const knownPersonaIds = sourceAudiences.map(name => personaCatalog.find(persona => persona.name === name || persona.audience === name)?.id).filter(Boolean);
      root._mixSourceAudienceNames = sourceAudiences;
      const audienceInput = root.querySelector("[data-mix-audience]");
      if (audienceInput) {
        audienceInput.value = sourceAudiences.join("、");
        audienceInput.dataset.personaId = knownPersonaIds[0] || "";
        audienceInput.dataset.personaIds = knownPersonaIds.join("|");
      }
      if (kind === "script") {
        const text = item.sourceFull || item.source || item.text || "";
        const inherited = Number(item.duration) || Math.max(10, Math.round(text.replace(/\s/g, "").length / 3.35));
        const duration = root.querySelector("[data-mix-target-duration]");
        if (duration) duration.value = String(inherited);
      }
      updateMixSourceAsset(source);
      syncMixModeFields(kind);
      syncMixDuration();
      try {
        prefillMixManualFromSource(root, sourceAudiences, mixProductNames[productId] || "");
      } catch (err) {
        console.error("[mix-source] 自动填充 自行输入 人群失败:", err);
        showToast("已带入来源信息，但目标人群自动填充失败，可手动选择或自行输入。");
      }
    }

    function prefillMixManualFromSource(root, sourceAudiences, productName) {
      if (!root) return;
      const audiences = (Array.isArray(sourceAudiences) ? sourceAudiences : []).map(value => String(value || "").trim()).filter(Boolean);
      if (!audiences.length) return;
      const matchedPersonaByName = name => personaCatalog.find(persona => persona?.audience === name || persona?.name === name) || null;
      const standards = new Set(MIX_PERSONA_AUDIENCES);
      setMixPersonaMode(root, "manual");
      const groups = root.querySelector("[data-mix-persona-groups]");
      if (!groups) return;
      groups.innerHTML = "";
      ensureMixAddPersonaBinding(root);
      audiences.forEach((audienceName, index) => {
        const persona = matchedPersonaByName(audienceName);
        const matchedStandardAudience = standards.has(persona?.audience) ? persona.audience
          : standards.has(audienceName) ? audienceName
          : "";
        const matchedStandardAge = (() => {
          const candidate = String(persona?.age || "").replace(/[–—]/g, "-");
          return MIX_PERSONA_AGES.find(value => value === candidate) || "";
        })();
        const matchedStandardGender = MIX_PERSONA_GENDERS.find(value => value === (persona?.gender || "不限")) || "不限";
        const group = mixPersonaGroupTemplate(index);
        groups.insertAdjacentHTML("beforeend", group);
        const groupNode = groups.lastElementChild;
        if (!groupNode) return;
        const audienceChips = groupNode.querySelector("[data-mix-audience-chips]");
        if (audienceChips) {
          audienceChips.querySelectorAll(".mix-persona-pill").forEach(pill => pill.classList.remove("active"));
          if (matchedStandardAudience) {
            const pill = audienceChips.querySelector(`.mix-persona-pill[data-value="${cssEscapeValue(matchedStandardAudience)}"]`);
            if (pill) pill.classList.add("active");
          } else {
            const customPill = document.createElement("button");
            customPill.type = "button";
            customPill.className = "mix-persona-pill active is-custom";
            customPill.dataset.value = audienceName;
            customPill.textContent = audienceName;
            audienceChips.appendChild(customPill);
          }
        }
        const genderChips = groupNode.querySelector("[data-mix-gender-chips]");
        if (genderChips) {
          genderChips.querySelectorAll(".mix-persona-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.value === matchedStandardGender));
        }
        const ageChips = groupNode.querySelector("[data-mix-age-chips]");
        if (ageChips) {
          ageChips.querySelectorAll(".mix-persona-pill").forEach(pill => pill.classList.toggle("active", pill.dataset.value === (matchedStandardAge || "24-30")));
        }
        const painArea = groupNode.querySelector("[data-mix-audience-pain]");
        if (painArea) painArea.value = (Array.isArray(persona?.pain) ? persona.pain : []).join("\n");
        const scenesArea = groupNode.querySelector("[data-mix-audience-scenes]");
        if (scenesArea) scenesArea.value = (Array.isArray(persona?.scenes) ? persona.scenes : []).join("\n");
        if (persona && typeof productName === "string" && productName) {
          groupNode.dataset.mixSourcePersonaId = persona.id || "";
        }
        bindMixPersonaGroupPills(groupNode, root);
      });
      ensureMixAddPersonaBinding(root);
      ensureMixPersonaPanelInteractive(root);
      syncMixManualPersonaSummary(root);
      showToast(`已带入 ${audiences.length} 个人群，可继续编辑`);
    }

    function ensureMixPersonaPanelInteractive(root) {
      const field = root.querySelector("[data-mix-audience-field]");
      if (!field) return;
      field.removeAttribute("inert");
      field.classList.remove("is-disabled");
      field.querySelectorAll("[data-mix-persona-panel]").forEach(panel => {
        panel.removeAttribute("inert");
        panel.classList.remove("is-disabled");
      });
    }

    function bindMixPersonaGroupPills(groupNode, root) {
      if (!groupNode || groupNode.dataset.pillsBound === "true") return;
      groupNode.dataset.pillsBound = "true";
      const handler = event => {
        const pill = event.target.closest(".mix-persona-pill");
        if (!pill || !groupNode.contains(pill)) return;
        const row = pill.closest(".mix-persona-chips-row");
        if (!row) return;
        row.querySelectorAll(".mix-persona-pill").forEach(button => button.classList.toggle("active", button === pill));
        const customAge = groupNode.querySelector("[data-mix-custom-age]");
        if (customAge) customAge.hidden = pill.dataset.value !== "自定义" || row !== groupNode.querySelector("[data-mix-age-chips]");
        syncMixManualPersonaSummary(root);
        event.stopPropagation();
      };
      groupNode.addEventListener("click", handler);
      const remove = groupNode.querySelector("[data-mix-persona-group-remove]");
      if (remove) remove.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const groups = root.querySelector("[data-mix-persona-groups]");
        const group = remove.closest("[data-mix-persona-group]");
        if (!groups || !group) return;
        const wasOnly = groups.querySelectorAll("[data-mix-persona-group]").length <= 1;
        group.remove();
        if (wasOnly) {
          groups.insertAdjacentHTML("beforeend", mixPersonaGroupTemplate(0));
          const fresh = groups.lastElementChild;
          if (fresh) bindMixPersonaGroupPills(fresh, root);
        } else {
          [...groups.querySelectorAll("[data-mix-persona-group]")].forEach((node, index) => {
            node.dataset.mixPersonaIndex = String(index);
            const label = node.querySelector(".mix-persona-group-head > span");
            if (label) label.textContent = `人群 ${index + 1}`;
            if (index === 0) {
              const removeBtn = node.querySelector("[data-mix-persona-group-remove]");
              if (removeBtn) removeBtn.remove();
            }
          });
        }
        syncMixManualPersonaSummary(root);
      });
    }

    function cssEscapeValue(value) {
      return String(value || "").replace(/(["\\])/g, "\\$1");
    }

    function openMixAudiencePicker(root) {
      const mode = root.dataset.mixPlanMode || "ai";
      const sourceSelected = Boolean(root.querySelector("[data-mix-existing-copy], [data-mix-existing-script]")?.value);
      if (mode === "copy" && !sourceSelected) return showToast("请先选择已有文案，系统将自动带入关联产品。");
      if (!window.CreationPersonaPicker) return showToast("人群画像选择器加载失败，请刷新页面后重试。");
      const productId = root.querySelector("[data-mix-product]")?.value || "";
      const productName = mixProductNames[productId] || "";
      if (!productName) return showToast(mode === "copy" ? "该文案未关联产品，请更换一篇有关联产品的文案。" : "请先选择产品，再选择人群画像");
      const current = String(root.querySelector("[data-mix-audience]")?.dataset.personaIds || "").split("|").filter(Boolean);
      const manualValues = String(root.querySelector("[data-mix-audience]")?.value || "").split("、").map(value => value.trim()).filter(Boolean)
        .filter(name => !personaCatalog.some(persona => persona.name === name || persona.audience === name));
      const activeModeBtn = root.querySelector("[data-mix-persona-mode].active");
      const pickerMode = activeModeBtn?.dataset.mixPersonaMode || "template";
      window.CreationPersonaPicker.open({
        items: personaCatalog,
        productName,
        multiple: pickerMode === "template",
        maxSelected: 99,
        selectedIds: current,
        allowManual: true,
        mode: pickerMode,
        hideModeSwitch: true,
        description: pickerMode === "manual"
          ? "输入自定义人群并选择;可多选人群画像,可临时补充未入库人群。"
          : "从模板库多选人群画像,本次创作共同生效。",
        manualValues,
        onConfirm(personas) {
          const input = root.querySelector("[data-mix-audience]");
          const placeholder = root.querySelector("[data-mix-audience-placeholder]");
          const chips = root.querySelector("[data-mix-audience-chips]");
          const clearBtn = root.querySelector("[data-mix-audience-field] [data-persona-clear]");
          const trigger = root.querySelector("[data-mix-pick-audience]");
          const selected = (Array.isArray(personas) ? personas : [personas])
            .filter(Boolean)
            .filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
          const personaNames = selected.map(item => item.name || item.audience);
          if (input) {
            input.value = personaNames.join("、");
            input.dataset.personaId = selected[0]?.id || "";
            input.dataset.personaIds = selected.map(item => item.id).join("|");
          }
          if (selected.length) {
            if (placeholder) placeholder.hidden = true;
            if (chips) {
              chips.hidden = false;
              chips.innerHTML = personaNames.map(name => `<em class="mix-persona-chip">${escapeHtml(name)}</em>`).join("");
            }
            if (clearBtn) clearBtn.hidden = false;
            trigger?.classList.add("is-filled");
          } else {
            if (placeholder) placeholder.hidden = false;
            if (chips) { chips.hidden = true; chips.innerHTML = ""; }
            if (clearBtn) clearBtn.hidden = true;
            trigger?.classList.remove("is-filled");
          }
          showToast(`已应用 ${selected.length} 个人群画像`);
        }
      });
    }

    const MIX_PERSONA_AUDIENCES = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
    const MIX_PERSONA_GENDERS = ["不限", "女性", "男性"];
    const MIX_PERSONA_AGES = ["18-23", "24-30", "31-40", "41-50", "50+", "自定义"];

    function mixPersonaGroupTemplate(index) {
      return `<div class="mix-persona-group" data-mix-persona-group data-mix-persona-index="${index}">
        <div class="mix-persona-group-head"><span>人群 ${index + 1}</span>${index > 0 ? '<button type="button" class="mix-persona-group-remove" data-mix-persona-group-remove aria-label="删除该人群组">删除</button>' : ""}</div>
        <div class="mix-persona-fields">
          <div class="mix-persona-field">
            <label>核心目标人群 <em class="mix-persona-required">*</em></label>
            <div class="mix-persona-chips-row" data-mix-audience-chips>${MIX_PERSONA_AUDIENCES.map(value => `<button type="button" class="mix-persona-pill${value === "精致妈妈" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="mix-persona-field">
            <label>性别 <em class="mix-persona-required">*</em></label>
            <div class="mix-persona-chips-row" data-mix-gender-chips>${MIX_PERSONA_GENDERS.map(value => `<button type="button" class="mix-persona-pill${value === "不限" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="mix-persona-field">
            <label>年龄 <em class="mix-persona-required">*</em></label>
            <div class="mix-persona-chips-row" data-mix-age-chips>${MIX_PERSONA_AGES.map(value => `<button type="button" class="mix-persona-pill${value === "24-30" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}<div class="mix-persona-custom-age" data-mix-custom-age hidden><input type="number" data-mix-age-min min="1" max="99" placeholder="最小"><i>至</i><input type="number" data-mix-age-max min="1" max="99" placeholder="最大"></div></div>
          </div>
          <div class="mix-persona-field mix-persona-field-text">
            <label>人群核心痛点 <button type="button" class="mix-persona-ai-action" data-mix-ai-suggest="pain">AI 换一组</button></label>
            <textarea data-mix-audience-pain placeholder="一行一个人群核心痛点"></textarea>
          </div>
          <div class="mix-persona-field mix-persona-field-text">
            <label>使用场景 <button type="button" class="mix-persona-ai-action" data-mix-ai-suggest="scene">AI 换一组</button></label>
            <textarea data-mix-audience-scenes placeholder="一行一个使用场景"></textarea>
          </div>
        </div>
      </div>`;
    }

    function setMixPersonaMode(root, mode) {
      const panels = root.querySelectorAll("[data-mix-persona-panel]");
      panels.forEach(panel => { panel.hidden = panel.dataset.mixPersonaPanel !== mode; });
      root.querySelectorAll("[data-mix-persona-mode]").forEach(button => button.classList.toggle("active", button.dataset.mixPersonaMode === mode));
      const field = root.querySelector("[data-mix-audience-field]");
      if (field) field.dataset.mixPersonaMode = mode;
      if (mode === "manual") {
        const groups = root.querySelector("[data-mix-persona-groups]");
        if (groups && !groups.children.length) {
          groups.insertAdjacentHTML("beforeend", mixPersonaGroupTemplate(0));
          const fresh = groups.lastElementChild;
          if (fresh) bindMixPersonaGroupPills(fresh, root);
        }
        ensureMixAddPersonaBinding(root);
        ensureMixPersonaPanelInteractive(root);
      }
      syncMixManualPersonaSummary(root);
    }

    function appendMixPersonaGroup(root) {
      const groups = root.querySelector("[data-mix-persona-groups]");
      if (!groups) return;
      const index = groups.querySelectorAll("[data-mix-persona-group]").length;
      groups.insertAdjacentHTML("beforeend", mixPersonaGroupTemplate(index));
      const newGroup = groups.lastElementChild;
      if (newGroup) bindMixPersonaGroupPills(newGroup, root);
      newGroup?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      syncMixManualPersonaSummary(root);
    }

    function ensureMixAddPersonaBinding(root) {
      const button = root.querySelector("[data-mix-add-persona-group]");
      if (!button || button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        appendMixPersonaGroup(root);
      });
    }

    function syncMixManualPersonaSummary(root) {
      const field = root.querySelector("[data-mix-audience-field]");
      if (!field) return;
      const groups = field.querySelectorAll("[data-mix-persona-group]");
      const summaries = [];
      const personaIds = [];
      groups.forEach(group => {
        const audience = group.querySelector("[data-mix-audience-chips] .mix-persona-pill.active")?.dataset.value;
        const gender = group.querySelector("[data-mix-gender-chips] .mix-persona-pill.active")?.dataset.value || "不限";
        let age = group.querySelector("[data-mix-age-chips] .mix-persona-pill.active")?.dataset.value || "";
        if (age === "自定义") {
          const min = group.querySelector("[data-mix-age-min]")?.value;
          const max = group.querySelector("[data-mix-age-max]")?.value;
          if (min && max) age = `${min}–${max}`;
          else age = "";
        }
        if (audience) {
          const summary = age ? `${audience} / ${gender} / ${age}` : `${audience} / ${gender}`;
          summaries.push(summary);
          personaIds.push(`manual:${audience}:${age}`);
        }
      });
      const input = field.querySelector("[data-mix-audience]");
      if (input) {
        input.value = summaries.join(" | ");
        input.dataset.personaIds = personaIds.join("|");
      }
    }

    function applyMixManualAiSuggestion(group, type) {
      const samples = type === "pain"
        ? ["担心实际效果不稳定\n不想为日常问题反复花时间", "希望一次解决核心问题\n更在意使用过程是否省心"]
        : ["日常使用场景\n需要快速处理问题的即时场景", "周末集中使用场景\n家人共同使用的生活场景"];
      const key = `${type}Index`;
      const stored = Number(group.dataset[key] || 0);
      const index = stored % samples.length;
      const textarea = group.querySelector(type === "pain" ? "[data-mix-audience-pain]" : "[data-mix-audience-scenes]");
      if (textarea) textarea.value = samples[index];
      group.dataset[key] = String(stored + 1);
      const root = dynamicForm.querySelector(".mix-flow-form");
      syncMixManualPersonaSummary(root);
    }

    // 智能脚本：目标人群双模式（模板库 / 自行输入），结构与混剪一致
    const SCRIPT_PERSONA_AUDIENCES = ["精致妈妈", "新锐白领", "资深中产", "Z世代", "小镇青年", "小镇中老年", "都市蓝领", "都市银发"];
    const SCRIPT_PERSONA_GENDERS = ["不限", "女性", "男性"];
    const SCRIPT_PERSONA_AGES = ["18-23", "24-30", "31-40", "41-50", "50+", "自定义"];

    function scriptPersonaGroupTemplate(index) {
      return `<div class="script-persona-group" data-script-persona-group data-script-persona-index="${index}">
        <div class="script-persona-group-head"><span>人群 ${index + 1}</span>${index > 0 ? '<button type="button" class="script-persona-group-remove" data-script-persona-group-remove aria-label="删除该人群组">删除</button>' : ""}</div>
        <div class="script-persona-fields">
          <div class="script-persona-field">
            <label>核心目标人群 <em class="script-persona-required">*</em></label>
            <div class="script-persona-chips-row" data-script-audience-chips>${SCRIPT_PERSONA_AUDIENCES.map(value => `<button type="button" class="script-persona-pill${value === "精致妈妈" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="script-persona-field">
            <label>性别 <em class="script-persona-required">*</em></label>
            <div class="script-persona-chips-row" data-script-gender-chips>${SCRIPT_PERSONA_GENDERS.map(value => `<button type="button" class="script-persona-pill${value === "不限" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}</div>
          </div>
          <div class="script-persona-field">
            <label>年龄 <em class="script-persona-required">*</em></label>
            <div class="script-persona-chips-row" data-script-age-chips>${SCRIPT_PERSONA_AGES.map(value => `<button type="button" class="script-persona-pill${value === "24-30" ? " active" : ""}" data-value="${value}">${value}</button>`).join("")}<div class="script-persona-custom-age" data-script-custom-age hidden><input type="number" data-script-age-min min="1" max="99" placeholder="最小"><i>至</i><input type="number" data-script-age-max min="1" max="99" placeholder="最大"></div></div>
          </div>
        </div>
      </div>`;
    }

    function setScriptPersonaMode(root, mode) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      if (!field) return;
      const panels = field.querySelectorAll("[data-script-persona-panel]");
      panels.forEach(panel => { panel.hidden = panel.dataset.scriptPersonaPanel !== mode; });
      field.querySelectorAll("[data-script-persona-mode]").forEach(button => {
        const active = button.dataset.scriptPersonaMode === mode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      field.dataset.scriptPersonaMode = mode;
      if (mode === "manual") {
        const groups = field.querySelector("[data-script-persona-groups]");
        if (groups && !groups.children.length) {
          groups.insertAdjacentHTML("beforeend", scriptPersonaGroupTemplate(0));
        }
        ensureScriptAddPersonaBinding(root);
      }
      syncScriptManualPersonaSummary(root);
    }

    function appendScriptPersonaGroup(root) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      if (!field) return;
      const groups = field.querySelector("[data-script-persona-groups]");
      if (!groups) return;
      const index = groups.querySelectorAll("[data-script-persona-group]").length;
      groups.insertAdjacentHTML("beforeend", scriptPersonaGroupTemplate(index));
      const newGroup = groups.lastElementChild;
      newGroup?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      syncScriptManualPersonaSummary(root);
    }

    function ensureScriptAddPersonaBinding(root) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      const button = field?.querySelector?.("[data-script-add-persona-group]");
      if (!button || button.dataset.bound === "true") return;
      button.dataset.bound = "true";
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        appendScriptPersonaGroup(root);
      });
    }

    function syncScriptManualPersonaSummary(root) {
      const field = root?.querySelector?.("[data-script-audience-field]");
      if (!field) return;
      const groups = field.querySelectorAll("[data-script-persona-group]");
      const summaries = [];
      const personaIds = [];
      groups.forEach(group => {
        const audience = group.querySelector("[data-script-audience-chips] .script-persona-pill.active")?.dataset.value;
        const gender = group.querySelector("[data-script-gender-chips] .script-persona-pill.active")?.dataset.value || "不限";
        let age = group.querySelector("[data-script-age-chips] .script-persona-pill.active")?.dataset.value || "";
        if (age === "自定义") {
          const min = group.querySelector("[data-script-age-min]")?.value;
          const max = group.querySelector("[data-script-age-max]")?.value;
          if (min && max) age = `${min}–${max}`;
          else age = "";
        }
        if (audience) {
          const summary = age ? `${audience} / ${gender} / ${age}` : `${audience} / ${gender}`;
          summaries.push(summary);
          personaIds.push(`manual:${audience}:${age}`);
        }
      });
      const input = field.querySelector("[data-script-audience]");
      if (input) {
        input.value = summaries.join(" | ");
        input.dataset.personaIds = personaIds.join("|");
      }
    }

    function syncMixStructureDecision() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const plan = root?.dataset.mixPlanMode || "ai";
      const selectedId = dynamicForm.querySelector("[data-mix-content-structure]")?.value || "";
      const structure = mixCurrentStructure();
      const stageHint = dynamicForm.querySelector("[data-mix-structure-stages]");
      const shouldShowStages = plan === "ai" && Boolean(selectedId) && Boolean(structure?.stageNames?.length);
      if (stageHint) {
        stageHint.hidden = !shouldShowStages;
        stageHint.textContent = shouldShowStages ? structure.stageNames.join(" → ") : "";
      }
    }

    function generateMixCopyRewrite(sourceText) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const product = productCatalog[root?.querySelector("[data-mix-product]")?.value || ""];
      const audiences = String(root?.querySelector("[data-mix-audience]")?.value || "").trim();
      const requirement = String(root?.querySelector("[data-mix-requirement]")?.value || "").trim();
      const source = String(sourceText || "").trim();
      const facts = [product?.core, product?.secondary, product?.difference].filter(Boolean).join("；");
      const openings = audiences
        ? [`如果你也是${audiences}，日常使用时更在意的是效果是否看得见、操作是否省心。`, `对${audiences}来说，先把使用中的真实问题讲清楚，再看产品能做什么。`]
        : ["先别急着看参数，先看真实使用中最容易被忽略的问题。", "真正影响日常体验的，往往不是参数，而是使用时能不能解决具体问题。"];
      const opening = openings[Number(root?._mixCopyRewriteVersion || 0) % openings.length];
      const body = source || `${product?.name || "产品"}围绕真实使用场景，把关键能力和使用结果讲清楚。`;
      const productName = product?.name || "产品";
      return `${opening}${body}${facts ? ` ${productName}可重点呈现：${facts}。` : ""}${requirement ? ` 本次要求：${requirement}。` : ""} 最后用清晰行动引导收口。`;
    }

    function syncMixPlanToConfirmation() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const plan = root?.dataset.mixPlanMode || "ai";
      if (root) {
        root._mixRowOverrides = {};
        root._mixRowCopyOverrides = {};
        root._mixRowNeedsRematch = new Set();
        root._mixChatCopy = "";
        // 阶段2 J: 分镜增删 override
        root._mixRowInserted = new Set();
        root._mixRowDeleted = new Set();
        root._mixInsertedSegments = [];
        root._mixRowMergedCopy = {};
        root._mixRowSplit = new Map();
        root._mixRowFlag = new Set();
      }
      // AI / 复制文案模式:视频生成时长默认 60 秒(script 模式走 item.duration 继承)
      if (plan !== "script") {
        const target = root?.querySelector("[data-mix-target-duration]");
        if (target && !target.value) target.value = "60";
      }
      const copy = dynamicForm.querySelector("[data-mix-copy]");
      const regenerate = dynamicForm.querySelector("[data-mix-regenerate-copy]");
      const copySamples = {
        "copy-mite":"刚换的床单，看起来干净，不代表床垫深处没有毛发和碎屑。轻净 Pro 在床垫表面推进时，拍打与吸尘同步进行，清洁后的结果直接呈现在透明尘杯里。床垫、沙发和日常布艺都能使用，用完尘杯还能拆下水洗。想看完整实测过程，点击商品了解更多。",
        "copy-pet":"家里有宠物，床铺和沙发表面看不到的毛发碎屑更容易被忽略。轻净 Pro 边拍边吸，清洁结果通过透明尘杯直接呈现，用完还能拆洗。",
        "copy-washer":"地面刚拖完又留下水渍和毛发？净界 S5 洗地机把吸、拖、洗结合起来，清洁过程更省力。"
      };
      const scriptSamples = {
        "script-mite":"刚换的床单，看起来干净，床垫深处却可能还藏着毛发和碎屑。先看轻净 Pro 走完一遍后的透明尘杯。拍打和吸尘同步进行，把织物深处的细小脏污带出来。床垫、沙发和布艺都能使用，用完尘杯还可以拆下来水洗。点击商品，查看完整实测。",
        "script-test":"先不讲参数，直接看一次真实床褥清洁。轻净 Pro 从床垫表面推进，拍打和吸尘同步完成，脏污直接进入透明尘杯。再切换到沙发与布艺场景，最后展示尘杯拆卸水洗。",
        "script-air":"炸薯条总是外焦里软？轻享 A8 空气炸锅通过热风循环完成加热，操作简单，清洁也更方便。"
      };
      if (plan === "copy") {
        const id = dynamicForm.querySelector("[data-mix-existing-copy]")?.value || "copy-mite";
        const externalCopy = root?._mixExternalCopy;
        const sourceCopy = externalCopy?.id === id
          ? externalCopy.text
          : (copySamples[id] || copySamples["copy-mite"]);
        if (copy) copy.value = generateMixCopyRewrite(sourceCopy);
        if (regenerate) regenerate.textContent = "重新生成";
        fitMixCopyToTarget(false);
      } else if (plan === "script") {
        const id = dynamicForm.querySelector("[data-mix-existing-script]")?.value || "script-mite";
        const externalScript = root?._mixExternalScript;
        const sourceScript = externalScript?.id === id
          ? (externalScript.sourceFull || externalScript.source || scriptSamples["script-mite"])
          : (scriptSamples[id] || scriptSamples["script-mite"]);
        if (copy) copy.value = generateMixCopyRewrite(sourceScript);
        if (regenerate) regenerate.textContent = "重新生成";
        fitMixCopyToTarget(false);
      } else {
        if (regenerate) regenerate.textContent = "重新生成";
        const profile = mixCurrentStructure()?.mixProfile || "result";
        if (copy) copy.value = mixGeneratedCopyByProfile[profile] || mixGeneratedCopyByProfile.result;
        fitMixCopyToTarget(false);
      }
      syncMixStructureDecision();
      syncMixDuration();
    }

    function fitMixCopyToTarget(notifyUser = true) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const copy = root?.querySelector("[data-mix-copy]");
      if (!copy || !["ai", "copy"].includes(root?.dataset.mixPlanMode)) return;
      const target = Number(root.querySelector("[data-mix-target-duration]")?.value || 60);
      const speed = Number(root.querySelector("[data-mix-speed]")?.value || 1);
      const targetChars = Math.max(20, Math.round(target * 3.35 * speed));
      let text = mixEffectiveCopy(root);
      if (text.replace(/\s/g, "").length > targetChars + 5) {
        const compact = text.replace(/\s/g, "");
        const candidate = compact.slice(0, targetChars);
        const lastStop = Math.max(candidate.lastIndexOf("。"), candidate.lastIndexOf("！"), candidate.lastIndexOf("？"));
        text = lastStop >= targetChars - 12 ? candidate.slice(0, lastStop + 1) : compact.slice(0, targetChars - 4) + "更省心。";
      } else {
        const supplements = "实际使用时，清洁结果可以直接看见。完整过程使用已有实拍素材呈现，方便判断是否适合自己的家庭场景。操作完成后，日常清理也更省心。";
        while (text.replace(/\s/g, "").length < targetChars - 5) text += supplements;
        const compact = text.replace(/\s/g, "");
        const candidate = compact.slice(0, targetChars);
        const lastStop = Math.max(candidate.lastIndexOf("。"), candidate.lastIndexOf("！"), candidate.lastIndexOf("？"));
        text = lastStop >= targetChars - 12 ? candidate.slice(0, lastStop + 1) : compact.slice(0, targetChars - 4) + "更省心。";
      }
      if (root._mixChatCopy) root._mixChatCopy = text;
      else copy.value = text;
      syncMixDuration();
      if (notifyUser) showToast(`文案已适配 ${target} 秒目标时长，可继续试听确认`);
    }

    function syncMixMaterialSelection(ids) {
      const selectedIds = new Set(ids);
      const grid = dynamicForm.querySelector("[data-mix-material-grid]");
      dynamicForm.querySelectorAll("[data-mix-material]").forEach(card => {
        const selected = selectedIds.has(card.dataset.mixMaterial);
        card.classList.toggle("selected", selected);
        card.setAttribute("aria-checked", String(selected));
        const select = card.querySelector(".mix-material-select");
        if (select) {
          select.textContent = selected ? "✓" : "";
          select.setAttribute("aria-label", `${selected ? "取消选择" : "选择"}${card.querySelector("strong")?.textContent || "素材"}`);
        }
      });
      ids.forEach((id, index) => {
        if (dynamicForm.querySelector(`[data-mix-material="${id}"]`)) return;
        const item = findScriptMaterial(id);
        if (!item || !grid) return;
        grid.insertAdjacentHTML("beforeend", renderMixMaterialCard([id, item.name, item.scene, item.duration], index));
      });
      syncMixMaterialTagFilter();
      renderMixMaterialPage(dynamicForm.querySelector(".mix-flow-form")?.dataset.mixMaterialPage || 1);
      updateMixMaterialSummary();
    }

    function validateMixStep(step) {
      setFormFeedback("");
      if (step === 1) {
        const mixPlan = dynamicForm.querySelector(".mix-flow-form")?.dataset.mixPlanMode || "ai";
        if (mixPlan === "copy" && !dynamicForm.querySelector("[data-mix-existing-copy]")?.value) {
          setFormFeedback("请先从文案库选择一条文案。", "error");
          dynamicForm.querySelector("[data-mix-pick-copy]")?.focus();
          return false;
        }
        if (mixPlan === "script" && !dynamicForm.querySelector("[data-mix-existing-script]")?.value) {
          setFormFeedback("请先从脚本库选择一个脚本。", "error");
          dynamicForm.querySelector("[data-mix-pick-script]")?.focus();
          return false;
        }
        const targetDuration = Number(dynamicForm.querySelector("[data-mix-target-duration]")?.value || 0);
        if (!Number.isFinite(targetDuration) || targetDuration <= 0) {
          setFormFeedback("请设置视频生成时长。", "error");
          dynamicForm.querySelector("[data-mix-target-duration]")?.focus();
          return false;
        }
        const mixRatio = dynamicForm.querySelector("[data-mix-ratio]")?.value;
        if (!["9:16", "16:9"].includes(mixRatio)) {
          setFormFeedback("请选择画面比例（9:16 或 16:9）。", "error");
          dynamicForm.querySelector("[data-mix-ratio]")?.focus();
          return false;
        }
        if (!dynamicForm.querySelector("[data-mix-product]")?.value) {
          setFormFeedback("请先选择产品，系统才能带入对应的创作素材。", "error");
          dynamicForm.querySelector("[data-mix-product]")?.focus();
          return false;
        }
        if (!String(dynamicForm.querySelector("[data-mix-audience]")?.value || "").trim()) {
          setFormFeedback("请至少选择一个目标人群。", "error");
          dynamicForm.querySelector("[data-mix-pick-audience]")?.focus();
          return false;
        }
        if (!mixSelectedMaterialIds().length) {
          setFormFeedback("请至少选择 1 个已分析的创作素材。", "error");
          return false;
        }
        if (!mixSelectedMaterials().some(item => item.status === "已分析")) {
          setFormFeedback("当前选择的素材尚未完成分析，请选择至少 1 个已分析素材。", "error");
          return false;
        }
        syncMixPlanToConfirmation();
      }
      if (step === 2) {
        const copy = dynamicForm.querySelector("[data-mix-copy]");
        const effectiveCopy = mixEffectiveCopy();
        if (!effectiveCopy) {
          setFormFeedback("口播文案不能为空。", "error");
          copy?.focus();
          return false;
        }
        if (effectiveCopy.includes("100%除螨")) {
          setFormFeedback("文案包含产品禁用话术“100%除螨”，请修改后继续。", "error");
          copy.focus();
          return false;
        }
      }
      if (step === 3) {
        const segments = mixScriptSegments();
        const incomplete = updateMixScriptCompletion(segments);
        if (incomplete.length) {
          setFormFeedback(`还有 ${incomplete.length} 个段落未完成口播或镜头匹配。`, "error");
          dynamicForm.querySelector(".mix-script-card.needs-rematch")?.scrollIntoView({ behavior:"smooth", block:"center" });
          return false;
        }
        const copy = dynamicForm.querySelector("[data-mix-copy]");
        if (copy) {
          const nextCopy = segments.map(item => item.copy).join("");
          if (dynamicForm.querySelector(".mix-flow-form")?._mixChatCopy) dynamicForm.querySelector(".mix-flow-form")._mixChatCopy = nextCopy;
          else copy.value = nextCopy;
          syncMixDuration();
        }
      }
      return true;
    }

    function createMixDialog({ title, subtitle, label, body, footer = "", wide = false }) {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay show";
      const cardClass = wide ? "modal-card mix-dialog is-trim" : "modal-card mix-dialog";
      overlay.innerHTML = `<div class="${cardClass}" role="dialog" aria-label="${escapeHtml(label || title)}"><header class="modal-head"><div><strong>${escapeHtml(title)}</strong>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}</div><button class="modal-close" type="button" data-close>×</button></header>${body}${footer ? `<footer class="modal-foot">${footer}</footer>` : ""}</div>`;
      document.body.append(overlay);
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-close]")) overlay.remove();
      });
      return overlay;
    }

    function getMixRowSegment(row) {
      const index = Number(row?.dataset.mixScriptRow || 0);
      return { index, segment:mixScriptSegments()[index] };
    }

    function openMixRowPreview(row) {
      const { segment } = getMixRowSegment(row);
      if (!segment) return;
      const materials = segment.assigned;
      const primary = materials[0];
      const overlay = createMixDialog({
        title:`预览：${segment.stage}`,
        subtitle:`${mixTimeLabel(segment.start)}–${mixTimeLabel(segment.end)} · ${segment.duration.toFixed(1)} 秒`,
        label:"预览本段",
        body:`<div class="mix-preview-dialog-body"><section class="mix-preview-player"><div class="mix-preview-frame tone-3"><span class="mix-preview-play" data-mix-preview-play>▶</span></div><div class="mix-preview-timeline"><div class="mix-preview-track"><i></i></div><span>0:00 / ${segment.duration.toFixed(1)}s</span></div></section><section class="mix-preview-detail"><div class="mix-preview-section"><span>口播文案</span><p>${escapeHtml(segment.copy)}</p></div><div class="mix-preview-section"><span>镜头拼接</span>${materials.length ? `<ol>${materials.map((item, index) => `<li><b>${index + 1}</b><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · ${Math.min(segment.duration, Math.max(item.duration, 1)).toFixed(1)} 秒</small></li>`).join("")}</ol>` : `<div class="mix-preview-empty">当前没有已匹配镜头，请先手动调整画面。</div>`}</div></section></div>`
      });
      const togglePreview = button => {
        if (!primary) return showToast("请先调整镜头后再预览");
        const playing = !overlay.dataset.playing;
        overlay.dataset.playing = playing ? "true" : "";
        button.textContent = playing ? "■" : "▶";
      };
      overlay.querySelectorAll("[data-mix-preview-play]").forEach(button => button.addEventListener("click", () => togglePreview(button)));
    }

    function openMixRowRematchDialog(row) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const { index, segment } = getMixRowSegment(row);
      const materials = mixSelectedMaterials().filter(item => item.status === "已分析");
      if (!segment || !materials.length) return openMixRowMaterialPicker(row);
      const candidates = materials.filter(item => mixStageMatchesMaterial(segment.stage, item));
      const pool = candidates.slice(0, 4);
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
        candidateHost.innerHTML = pool.map(item => `<button type="button" class="mix-rematch-candidate${item.id === selectedId ? " selected" : ""}" data-mix-rematch-candidate="${escapeHtml(item.id)}"><span class="mix-rematch-cover tone-${(index + pool.indexOf(item)) % 6 + 1}">${escapeHtml(item.scene)}</span><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.scene)} · ${item.duration}s 可用</small></span><i>${item.id === selectedId ? "✓" : ""}</i></button>`).join("");
        candidateHost.querySelectorAll("[data-mix-rematch-candidate]").forEach(button => button.addEventListener("click", () => {
          selectedId = button.dataset.mixRematchCandidate;
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
          root._mixRowOverrides = { ...(root._mixRowOverrides || {}), [index]:[selectedId] };
          root._mixRowNeedsRematch?.delete(index);
          enterSuccess();
          setTimeout(() => {
            if (!overlay.isConnected) return;
            overlay.remove();
            renderMixScript();
            showToast("已应用推荐镜头，本段已完成匹配");
          }, 500);
        }, 1000);
      });
      renderCandidates();
    }

    // 死代码(主动工作流接管),保留为空占位以防旧引用;不再被调用。
    function applyMixRowAutoRematch(row) {
      return;
    }

    // 主动工作流:用户点击"重新匹配"按钮 → 进度条 0%→100%(3s) → 应用新镜头
    function runMixRowRematch(card) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root || !card) return;
      const rowIndex = Number(card.dataset.mixScriptRow || 0);
      if (!root._mixRowRematching) root._mixRowRematching = {};
      if (root._mixRowRematching[rowIndex]) return; // 防重复点击
      const materials = mixSelectedMaterials().filter(item => item.status === "已分析");
      const { segment: seg } = getMixRowSegment(card);
      if (!seg) return;
      // 标记进入 rematch 状态 → 渲染时显示进度条、隐藏 3 个动作按钮
      root._mixRowRematching[rowIndex] = true;
      renderMixScript();
      const liveCard = dynamicForm.querySelector(`[data-mix-script-row="${rowIndex}"]`);
      const progressWrap = liveCard?.querySelector(".mix-rematch-progress");
      const progressBar = liveCard?.querySelector(".mix-rematch-progress-bar");
      // 进度条 0% → 100%(CSS 已定义 3s cubic-bezier 过渡)
      if (progressWrap) progressWrap.removeAttribute("hidden");
      if (progressBar) {
        progressBar.style.transform = "scaleX(0)";
        void progressBar.offsetWidth; // 强制重排,使过渡生效
        progressBar.style.transform = "scaleX(1)";
      }
      setTimeout(() => {
        const candidates = materials.filter(item => mixStageMatchesMaterial(seg.stage, item));
        const pool = candidates.slice(0, 4);
        const picked = pool[0] || materials[0];
        if (picked) {
          root._mixRowOverrides = { ...(root._mixRowOverrides || {}), [rowIndex]:[picked.id] };
        }
        if (!root._mixRowNeedsRematch) root._mixRowNeedsRematch = new Set();
        root._mixRowNeedsRematch.delete(rowIndex);
        delete root._mixRowRematching[rowIndex];
        renderMixScript();
        showToast(picked ? `已重新匹配镜头:${picked.name || "AI 推荐"}` : "暂无可匹配的素材,镜头未变化");
      }, 3000);
    }

    // 把画面描述还原到 sourceRow.visual(进入 Step 3 时的初值)
    function applyMixRowVisualReset(card) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root || !card) return;
      const rowIndex = Number(card.dataset.mixScriptRow || 0);
      const { segment: seg } = getMixRowSegment(card);
      if (!seg) return;
      // 允许两种情况触发:(1) 当前段被标记为需要重新匹配;(2) 当前段存在 override
      const isNeedsRematch = root?._mixRowNeedsRematch?.has(rowIndex);
      const hasOverride = Object.prototype.hasOwnProperty.call(root._mixRowVisualOverrides || {}, rowIndex);
      if (!isNeedsRematch && !hasOverride) {
        showToast("该段画面描述已是默认状态");
        return;
      }
      // 清除 override + needsRematch + 关闭任何进行中的 rematch
      if (root._mixRowVisualOverrides) {
        root._mixRowVisualOverrides = { ...root._mixRowVisualOverrides };
        delete root._mixRowVisualOverrides[rowIndex];
      }
      root._mixRowNeedsRematch?.delete(rowIndex);
      delete root._mixRowRematching?.[rowIndex];
      renderMixScript();
      showToast("已恢复第 " + (rowIndex + 1) + " 段画面描述为默认");
    }

    function openMixRematchAllDialog() {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const count = mixScriptSegments().length;
      const overlay = createMixDialog({
        title:"重新匹配全部镜头",
        subtitle:"将按各段口播语义与素材分析结果重新匹配画面。",
        label:"重新匹配全部镜头",
        body:`<div class="mix-rematch-all-body"><b>将重新匹配 ${count} 个脚本段落</b><p>手动调整过的镜头会被新的 AI 推荐结果覆盖；口播文案不会变化。</p></div>`,
        footer:`<span class="mix-dialog-foot-note">确认后仍可逐段手动调整。</span><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-mix-confirm-rematch-all>确认重新匹配</button></div>`
      });
      overlay.querySelector("[data-mix-confirm-rematch-all]").addEventListener("click", () => {
        overlay.querySelector("[data-mix-confirm-rematch-all]").textContent = "匹配中…";
        overlay.querySelector("[data-mix-confirm-rematch-all]").disabled = true;
        setTimeout(() => {
          root._mixRowOverrides = {};
          root._mixRowNeedsRematch = new Set();
          // 演示用:重新匹配全部后,把所有 stage 都没匹配到的段落强制指派到第一个素材,保证 0 段未匹配。
          // 实际情况由开发决定,这里只保证 demo 演示时用户能看到"全部已匹配"的最终态。
          const allMaterials = mixSelectedMaterials().filter(item => item.status === "已分析");
          if (allMaterials.length) {
            const segments = mixScriptSegments();
            segments.forEach(seg => {
              if (!seg.assigned.length) {
                root._mixRowOverrides[seg._origIndex] = [allMaterials[0].id];
              }
            });
          }
          overlay.remove();
          renderMixScript();
          // 演示用:重新匹配后默认所有分镜都展开,方便用户一眼看到全部分镜
          dynamicForm.querySelectorAll(".mix-script-card").forEach(card => {
            const body = card.querySelector(".mix-script-body");
            const toggle = card.querySelector("[data-mix-toggle-row]");
            if (body) body.hidden = false;
            if (toggle) {
              toggle.textContent = "收起";
              toggle.setAttribute("aria-expanded", "true");
            }
          });
          showToast("所有段落已重新匹配完成");
        }, 650);
      });
    }

    // ── 阶段3 上一步确认弹窗(Step 3 → Step 2) ─────────────────────
    function openMixBackToStep2Confirm(onConfirm) {
      const overlay = createMixDialog({
        title: "返回修改文案与配音?",
        subtitle: "",
        label: "返回上一步确认",
        body: `<div class="mix-back-confirm-body"><p>返回后若修改文案或配音,当前分镜、镜头匹配结果及本页调整将不会保留。</p></div>`,
        footer: `<div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-mix-confirm-back>上一步</button></div>`
      });
      overlay.querySelector("[data-mix-confirm-back]").addEventListener("click", () => {
        overlay.remove();
        if (typeof onConfirm === "function") onConfirm();
      });
    }

    // ── 阶段2 J: 插入/删除分镜 ────────────────────────────────────────
    function openMixInsertRowDialog(row) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      const { index } = getMixRowSegment(row);
      const stages = mixStageNames();
      const overlay = createMixDialog({
        title: "插入新分镜",
        subtitle: "将在当前段之后插入一行；插入后总时长与口播分配会自动重算。",
        label: "插入新分镜",
        body: `<div class="mix-insert-dialog-body">
          <label><span>分镜阶段</span><input type="text" list="mixInsertStageList" data-mix-insert-stage value="${escapeHtml(stages[0] || "新分镜")}" placeholder="可直接输入自定义阶段,或从下拉建议中选择"><datalist id="mixInsertStageList">${stages.map(s => `<option value="${escapeHtml(s)}"></option>`).join("")}</datalist></label>
          <label><span>口播文案</span><textarea data-mix-insert-copy placeholder="可先留空,后续在卡片内补全,或让 AI 优化。"></textarea></label>
        </div>`,
        footer: `<div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-mix-confirm-insert>插入</button></div>`
      });
      overlay.querySelector("[data-mix-confirm-insert]").addEventListener("click", () => {
        const stage = (overlay.querySelector("[data-mix-insert-stage]")?.value || "").trim() || stages[0] || "新分镜";
        const copy = (overlay.querySelector("[data-mix-insert-copy]")?.value || "").trim();
        overlay.remove();
        applyMixRowInsert(index, { stage, copy });
      });
    }

    function applyMixRowInsert(afterIndex, payload) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      root._mixInsertedSegments = root._mixInsertedSegments || [];
      root._mixRowInserted = root._mixRowInserted || new Set();
      root._mixRowFlag = root._mixRowFlag || new Set();
      const origIndex = afterIndex; // 渲染位置(在 afterIndex 行之后)
      root._mixInsertedSegments.push({
        afterIndex,
        stage: payload.stage || "新分镜",
        copy: payload.copy || "",
        visual: payload.visual || "请补充该分镜的画面内容描述",
        _afterOrig: origIndex
      });
      root._mixRowInserted.add(afterIndex);
      root._mixRowFlag.add(afterIndex);
      renderMixScript();
      showToast("已插入 1 个新分镜,总时长已重算");
    }

    function openMixDeleteRowConfirm(row) {
      const { index, segment } = getMixRowSegment(row);
      if (!segment) return;
      const overlay = createMixDialog({
        title: "删除该分镜?",
        subtitle: "删除后总时长与口播分配会自动重算,后续可重新插入。",
        label: "删除分镜",
        body: `<div class="mix-delete-dialog-body">
          <p>将删除第 <b>${index + 1}</b> 段<b>"${escapeHtml(segment.stage)}"</b>(${mixTimeLabel(segment.start)}–${mixTimeLabel(segment.end)},${segment.duration.toFixed(1)}s)。</p>
          <p style="color:#8d91a0;font-size:12px">该分镜关联的口播将一并从总时长中扣除。如需保留内容,建议先"合并到上一段"。</p>
        </div>`,
        footer: `<div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn danger" type="button" data-mix-confirm-delete>确认删除</button></div>`
      });
      overlay.querySelector("[data-mix-confirm-delete]").addEventListener("click", () => {
        overlay.remove();
        applyMixRowDelete(index);
      });
    }

    function applyMixRowDelete(rowIndex) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      if (!root) return;
      // 兼容 render index(可能是基于原始 draft 的行号)→ 反查 origIndex
      const segments = mixScriptSegments();
      if (segments.length <= 1) {
        showToast("至少需要保留 1 段分镜");
        return;
      }
      const seg = segments[rowIndex];
      const origIndex = seg ? seg._origIndex : rowIndex;
      root._mixRowDeleted = root._mixRowDeleted || new Set();
      root._mixRowNeedsRematch = root._mixRowNeedsRematch || new Set();
      root._mixRowFlag = root._mixRowFlag || new Set();
      // 注意:对 inserted 行(-1)或对已合并行不能反查原始 index,直接用 rowIndex 作为"占位"
      const targetOrig = origIndex >= 0 ? origIndex : -rowIndex;
      root._mixRowDeleted.add(targetOrig);
      // 清相关 overrides
      if (root._mixRowOverrides) delete root._mixRowOverrides[targetOrig];
      if (root._mixRowVisualOverrides) delete root._mixRowVisualOverrides[targetOrig];
      if (root._mixRowCopyOverrides) delete root._mixRowCopyOverrides[targetOrig];
      if (root._mixRowMaterialDurations) delete root._mixRowMaterialDurations[targetOrig];
      if (origIndex >= 0) root._mixRowNeedsRematch.delete(origIndex);
      root._mixRowFlag.add(targetOrig);
      // 同步移除 _mixInsertedSegments 里这个 orig 对应的"前向插入"行(如果该 inserted 行的 afterIndex 等于 targetOrig)
      if (root._mixInsertedSegments) {
        root._mixInsertedSegments = root._mixInsertedSegments.filter(p => !(p.afterIndex === targetOrig && p._dropOnDelete));
      }
      renderMixScript();
      showToast("已删除 1 个分镜,总时长已重算");
    }

    function openMixRowMaterialPicker(row) {
      const root = dynamicForm.querySelector(".mix-flow-form");
      const currentMaterials = mixSelectedMaterials().filter(item => item.status === "已分析");
      const rowIndex = Number(row?.dataset.mixScriptRow || 0);
      const selectedIds = (row?.dataset.mixMaterialIds || "").split(",").filter(Boolean);
      const segment = getMixRowSegment(row).segment;
      openScriptMaterialPicker({
        title:"替换镜头",
        selectedIds,
        defaultSelectionHint:"可多选素材进行拼接，确认替换时仅使用已分析的素材；",
        onConfirm(ids) {
          const chosenIds = Array.isArray(ids) ? ids : [];
          // 素材选择器返回的是素材库 ID；不能只从当前创作素材卡片中查找，
          // 否则新增选择的镜头无法参与时长校验与裁剪。
          const selectedMaterials = chosenIds
            .map(id => findScriptMaterial(id))
            .filter(item => item?.status === "ok");
          if (!selectedMaterials.length) return showToast("请至少选择 1 个镜头");
          // 拼接裁剪窗口只取前 3 个作为示意,避免每次都让用户匹配 5 段
          const trimPool = selectedMaterials.slice(0, 3);
          const availableMaterials = [...new Map([...currentMaterials, ...trimPool].map(item => [item.id, item])).values()];
          // 替换镜头也进入本次创作素材，步骤三回显与后续成片始终使用同一份素材。
          syncMixMaterialSelection([...new Set([...mixSelectedMaterialIds(), ...trimPool.map(item => item.id)])]);
          // 时长判定用"全选素材的总和"才算合理:用户全选时哪怕前 3 个短、总和也可能超
          const totalDuration = selectedMaterials.reduce((sum, item) => sum + Math.max(1, Number(item.duration) || 0), 0);
          if (totalDuration > (segment?.duration || 0)) return openMixConcatTrimDialog(root, rowIndex, trimPool.map(item => item.id), segment?.duration || 0, availableMaterials);
          root._mixRowOverrides = { ...(root._mixRowOverrides || {}), [rowIndex]:trimPool.map(item => item.id) };
          root._mixRowNeedsRematch?.delete(rowIndex);
          renderMixScript();
          showToast(`已替换 ${trimPool.length} 个镜头`);
        }
      });
    }

    // mix 端薄壳(已迁移到 openConcatTrimDialog 公共函数,保留旧名让混剪已有调用方继续工作)
    function openMixConcatTrimDialog(root, rowIndex, ids, limit, materials) {
      const selected = materials.filter(item => ids.includes(item.id));
      openConcatTrimDialog({
        rowIndex, limit,
        materials: selected,
        stateAdapter: {
          writeToState: (idx, idsArr, durMap) => {
            root._mixRowOverrides = { ...(root._mixRowOverrides || {}), [idx]:idsArr };
            root._mixRowMaterialDurations = { ...(root._mixRowMaterialDurations || {}), [idx]:durMap };
          },
          clearNeedsRematch: (idx) => root._mixRowNeedsRematch?.delete(idx)
        },
        onApply: () => renderMixScript()
      });
    }

    // script 端薄壳:把素材替换写到 asset.scriptRows[row] + taskResultHost override
    function openScriptConcatTrimDialog(assetId, rowIndex, ids, limit, materials) {
      const asset = sessionAssets.find(item => item.id === assetId);
      const row = asset?.scriptRows?.[rowIndex];
      if (!row) return;
      const selected = materials.filter(item => ids.includes(item.id));
      openConcatTrimDialog({
        rowIndex, limit,
        materials: selected,
        stateAdapter: {
          writeToState: (idx, idsArr, durMap) => {
            // 写主数据源(asset.scriptRows[row])
            row.materialIds = idsArr.slice();
            row.materialDurations = { ...durMap };
            row.materialOverride = idsArr[0];
            // 同步到 taskResultHost override,让 scriptRowsWithOverrides 合并层感知
            taskResultHost._scriptRowMaterialOverrides = taskResultHost._scriptRowMaterialOverrides || {};
            taskResultHost._scriptRowMaterialOverrides[idx] = { ids: idsArr.slice(), dur: { ...durMap } };
            taskResultHost._scriptRowFlag = taskResultHost._scriptRowFlag || new Set();
            taskResultHost._scriptRowFlag.add(idx);
          },
          clearNeedsRematch: (idx) => {
            taskResultHost._scriptRowNeedsRematch?.delete(idx);
          }
        },
        onApply: () => {
          refreshScriptResultFromCurrent();
          const tabIndex = scriptTaskAssetIds.indexOf(asset.id);
          if (tabIndex > 0) taskResultHost.querySelector(`[data-script-result-tab="${tabIndex}"]`)?.click();
        }
      });
    }

    // 公共:拼接与裁剪剪映式对话框(mix + script 共用,纯 DOM + 状态回调)
    // opts: { rowIndex, limit, materials, onApply(values), stateAdapter }
    //   values = [{ id, duration }]  最终确认时回调
    //   stateAdapter: { writeToState, clearNeedsRematch } 两个回调
    function openConcatTrimDialog({ rowIndex, limit, materials, onApply, stateAdapter = {} }) {
      const selected = Array.isArray(materials) ? materials : [];
      const totalSelected = selected.length;
      // 单镜头:不进入剪映式,直接套用
      if (totalSelected <= 1) {
        const overlay = createMixDialog({
          title: "替换镜头",
          subtitle: `第 ${rowIndex + 1} 段 · 限 ${limit.toFixed(1)}s`,
          label: "替换镜头",
          body: `<div class="mix-rematch-dialog-body"><div class="mix-trim-singletake">本镜头已直接采用,无需裁剪。系统将根据本阶段时长 ${limit.toFixed(1)}s 适配。</div></div>`,
          footer: `<div></div><div class="modal-foot-actions"><button class="ghost-btn" type="button" data-close>取消</button><button class="primary-btn" type="button" data-mix-confirm-trim>确认替换</button></div>`
        });
        overlay.querySelector("[data-mix-confirm-trim]").addEventListener("click", () => {
          const dur = Math.min(limit, Number(selected[0]?.duration) || limit);
          stateAdapter.writeToState?.(rowIndex, [selected[0].id], { [selected[0].id]: dur });
          stateAdapter.clearNeedsRematch?.(rowIndex);
          overlay.remove();
          onApply?.([{ id: selected[0].id, duration: dur }]);
          showToast("镜头已替换,本阶段时长已适配");
        });
        return;
      }
      // 多镜头:剪映式裁剪窗口(左侧素材库 + 右侧轨道 + 块内左右手柄)
      const pool = selected.map((item, i) => ({ id:item.id, name:item.name || item.id, scene:item.scene || "", duration:Math.max(.3, Number(item.duration) || 1), tone:(i % 6) + 1 }));
      let track = pool.map(item => ({ id:item.id, name:item.name, scene:item.scene, duration:item.duration, cropStart:0, cropEnd:Math.min(item.duration, limit / Math.max(1, pool.length)), tone:item.tone }));
      let previewIndex = 0;
      let previewMode = "full"; // "full" 完整拼接 | "single" 单素材
      let dragState = null; // { kind:"block-edge", trackIndex, edge, startX, startVal, endVal }
      const overlay = createMixDialog({
        title: "拼接与剪辑镜头",
        subtitle: `第 ${rowIndex + 1} 段 · 限 ${limit.toFixed(1)}s · 素材 ${pool.length} 段`,
        label: "拼接与剪辑镜头",
        wide: true,
        body: `<div class="mix-trim-jianying">
          <div class="mix-trim-jianying-body">
            <aside class="mix-jy-pool" aria-label="素材库">
              <div class="mix-jy-pool-head">
                <span>素材库</span>
                <small>共 <b data-mix-jy-pool-count>0</b> 段</small>
              </div>
              <div class="mix-jy-pool-list" data-mix-jy-pool-list></div>
              <div class="mix-jy-pool-hint">拖动素材到右侧轨道 · 已在轨道上的可二次拖动调序</div>
            </aside>
            <section class="mix-jy-editor">
              <div class="mix-jy-mode-bar">
                <div class="mix-jy-mode-tabs" role="tablist">
                  <button type="button" data-mix-jy-mode="full" class="is-active" role="tab" aria-selected="true">🎬 完整拼接</button>
                  <button type="button" data-mix-jy-mode="single" role="tab" aria-selected="false">▶ 单素材预览</button>
                </div>
                <div class="mix-jy-mode-progress" data-mix-jy-mode-progress>预览:完整拼接 · 0.0s</div>
              </div>
              <div class="mix-jy-preview-frame" data-mix-jy-frame>
                <span class="mix-jy-preview-9-16">9:16</span>
                <div class="mix-jy-preview-cover">
                  <b data-mix-jy-name>完整拼接预览</b>
                  <small data-mix-jy-scene>— 从左侧拖动素材到右侧轨道</small>
                </div>
                <span class="mix-jy-preview-play" data-mix-jy-play aria-hidden="true">▶</span>
              </div>
              <div class="mix-jy-toolbar">
                <button type="button" data-mix-jy-auto>✨ AI 自动裁剪</button>
                <button type="button" data-mix-jy-average>平均分配</button>
                <button type="button" data-mix-jy-reset>↺ 重置</button>
                <span class="mix-jy-toolbar-note">点击轨道块切换预览 · 拖动块内左右手柄裁剪</span>
              </div>
              <div class="mix-jy-track" data-mix-jy-track>
                <div class="mix-jy-track-ruler" data-mix-jy-ruler></div>
                <div class="mix-jy-track-track" data-mix-jy-track-track></div>
                <div class="mix-jy-track-empty" data-mix-jy-track-empty>＋ 从左侧拖动素材到此轨道</div>
              </div>
            </section>
          </div>
          <footer class="mix-jy-foot">
            <div class="mix-jy-progress">
              <span><b>1/${pool.length}</b> 进度 · 已用 <b data-mix-jy-used>0.0</b>s / 限 <b>${limit.toFixed(1)}</b>s</span>
              <small data-mix-jy-progress-text>从左侧拖动素材到右侧轨道开始裁剪</small>
            </div>
            <div class="mix-jy-progress-bar"><i data-mix-jy-bar style="width:0%"></i></div>
            <div class="modal-foot-actions">
              <button class="ghost-btn" type="button" data-close>取消</button>
              <button class="primary-btn" type="button" data-mix-jy-confirm>确认替换</button>
            </div>
          </footer>
        </div>`,
        footer: ""
      });
      const poolList = overlay.querySelector("[data-mix-jy-pool-list]");
      const poolCountEl = overlay.querySelector("[data-mix-jy-pool-count]");
      const trackEl = overlay.querySelector("[data-mix-jy-track-track]");
      const rulerEl = overlay.querySelector("[data-mix-jy-ruler]");
      const trackEmpty = overlay.querySelector("[data-mix-jy-track-empty]");
      const nameEl = overlay.querySelector("[data-mix-jy-name]");
      const sceneEl = overlay.querySelector("[data-mix-jy-scene]");
      const modeProgress = overlay.querySelector("[data-mix-jy-mode-progress]");
      const usedEl = overlay.querySelector("[data-mix-jy-used]");
      const barEl = overlay.querySelector("[data-mix-jy-bar]");
      const confirmBtn = overlay.querySelector("[data-mix-jy-confirm]");
      const progressText = overlay.querySelector("[data-mix-jy-progress-text]");
      // ── 渲染:左侧素材库 ──
      const renderPool = () => {
        poolList.innerHTML = pool.map(item => {
          const inTrack = track.some(t => t.id === item.id);
          return `<div class="mix-jy-pool-item${inTrack ? " is-in-track" : ""}" draggable="${inTrack ? "false" : "true"}" data-mix-jy-pool-id="${escapeHtml(item.id)}">
            <div class="mix-jy-pool-cover tone-${item.tone}">${escapeHtml((item.scene || item.name).slice(0, 4))}</div>
            <div class="mix-jy-pool-info">
              <b>${escapeHtml(item.name)}</b>
              <small>${item.duration.toFixed(1)}s${inTrack ? " · 已在轨道" : " · 拖到右侧"}</small>
            </div>
            <span class="mix-jy-pool-drag" aria-hidden="true">≡</span>
          </div>`;
        }).join("");
        poolCountEl.textContent = pool.length;
      };
      // ── 渲染:右侧轨道(标尺 + 块) ──
      const renderTrack = () => {
        trackEmpty.hidden = track.length > 0;
        if (!track.length) {
          trackEl.innerHTML = "";
          rulerEl.innerHTML = "";
          return;
        }
        const totalUsed = track.reduce((s, t) => s + (t.cropEnd - t.cropStart), 0);
        const scale = Math.max(limit, totalUsed, 2);
        const ticks = [];
        const tickCount = 10;
        for (let i = 0; i <= tickCount; i++) {
          const pos = (i / tickCount) * 100;
          const isMajor = i % 2 === 0;
          ticks.push(`<i class="${isMajor ? "major" : ""}" style="left:${pos}%"></i>`);
          if (isMajor) ticks.push(`<small style="left:${pos}%">${((i * scale) / tickCount).toFixed(1)}s</small>`);
        }
        rulerEl.innerHTML = ticks.join("");
        trackEl.innerHTML = track.map((t, i) => {
          const len = Math.max(.1, t.cropEnd - t.cropStart);
          const flex = Math.max(.5, len);
          const isActive = previewMode === "single" && i === previewIndex;
          return `<div class="mix-jy-block${isActive ? " is-active" : ""}" data-mix-jy-block="${i}" style="flex:${flex} 1 0;">
            <div class="mix-jy-block-handle mix-jy-block-handle-start" data-mix-jy-block-edge="start" data-mix-jy-block-idx="${i}" title="拖动调整裁剪起点"></div>
            <div class="mix-jy-block-body" draggable="true" data-mix-jy-block-idx="${i}">
              <span class="mix-jy-block-num">${i + 1}</span>
              <div class="mix-jy-block-cover tone-${t.tone}">${escapeHtml((t.scene || t.name).slice(0, 4))}</div>
              <div class="mix-jy-block-info">
                <b>${escapeHtml(t.name)}</b>
                <small><span class="mix-jy-crop-len">${len.toFixed(1)}s</span> · <span class="mix-jy-crop-range">${t.cropStart.toFixed(1)}→${t.cropEnd.toFixed(1)}s</span> / 原 ${t.duration.toFixed(1)}s</small>
              </div>
              <button type="button" class="mix-jy-block-remove" data-mix-jy-block-remove="${i}" title="从轨道移除" aria-label="移除">×</button>
            </div>
            <div class="mix-jy-block-handle mix-jy-block-handle-end" data-mix-jy-block-edge="end" data-mix-jy-block-idx="${i}" title="拖动调整裁剪终点"></div>
            <span class="mix-jy-block-crop-tip" data-mix-jy-crop-tip>${t.cropStart.toFixed(1)}s → ${t.cropEnd.toFixed(1)}s · 长度 ${len.toFixed(1)}s</span>
          </div>`;
        }).join("");
      };
      // ── 渲染:主预览(根据 mode 切) ──
      const renderPreview = () => {
        if (previewMode === "full") {
          const totalUsed = track.reduce((s, t) => s + (t.cropEnd - t.cropStart), 0);
          nameEl.textContent = track.length ? "完整拼接预览" : "暂无素材";
          sceneEl.innerHTML = track.length
            ? `— 共 ${track.length} 段,总时长 <b>${totalUsed.toFixed(1)}s</b>`
            : "— 从左侧拖动素材到右侧轨道";
          modeProgress.textContent = `预览:完整拼接 · ${totalUsed.toFixed(1)}s`;
        } else {
          const cur = track[previewIndex];
          if (cur) {
            nameEl.textContent = cur.name;
            sceneEl.innerHTML = `— 第 <b>${previewIndex + 1}</b> 段 · 裁剪 <b>${cur.cropStart.toFixed(1)}s → ${cur.cropEnd.toFixed(1)}s</b> (${(cur.cropEnd - cur.cropStart).toFixed(1)}s / 原 ${cur.duration.toFixed(1)}s)`;
            modeProgress.textContent = `预览:第 ${previewIndex + 1}/${track.length} 段 · ${(cur.cropEnd - cur.cropStart).toFixed(1)}s`;
          } else {
            nameEl.textContent = "暂无素材";
            sceneEl.textContent = "— 单素材预览";
            modeProgress.textContent = "预览:单素材 · 0.0s";
          }
        }
        overlay.querySelectorAll("[data-mix-jy-block]").forEach(el => {
          const isActive = previewMode === "single" && Number(el.dataset.mixJyBlock) === previewIndex;
          el.classList.toggle("is-active", isActive);
        });
        overlay.querySelectorAll("[data-mix-jy-mode]").forEach(btn => {
          const isActive = btn.dataset.mixJyMode === previewMode;
          btn.classList.toggle("is-active", isActive);
          btn.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      };
      // ── 进度条 + 1/N 提示 ──
      const updateProgress = () => {
        const total = track.reduce((s, t) => s + (t.cropEnd - t.cropStart), 0);
        usedEl.textContent = total.toFixed(1);
        const ratio = limit > 0 ? Math.min(100, (total / limit) * 100) : 0;
        barEl.style.width = `${ratio}%`;
        const over = total > limit + .05;
        barEl.classList.toggle("is-over", over);
        barEl.classList.toggle("is-full", !over && ratio > 90);
        confirmBtn.disabled = over;
        confirmBtn.classList.toggle("disabled", over);
        if (over) progressText.textContent = `超出阶段时长 ${(total - limit).toFixed(1)}s,请继续调整裁剪范围`;
        else if (Math.abs(total - limit) < .05) progressText.textContent = `总时长匹配,可应用裁剪`;
        else if (!track.length) progressText.textContent = `从左侧拖动素材到右侧轨道开始裁剪`;
        else progressText.textContent = `已用 ${total.toFixed(1)}s / 限 ${limit.toFixed(1)}s`;
      };
      // ── 工具:统一裁剪/重置 ──
      const applyUniform = per => {
        track.forEach(t => {
          t.cropStart = 0;
          t.cropEnd = Math.min(t.duration, Math.max(.1, per));
        });
        previewIndex = Math.min(previewIndex, Math.max(0, track.length - 1));
        renderTrack();
        renderPreview();
        updateProgress();
      };
      const applyReset = () => {
        track.forEach(t => { t.cropStart = 0; t.cropEnd = t.duration; });
        previewIndex = Math.min(previewIndex, Math.max(0, track.length - 1));
        renderTrack();
        renderPreview();
        updateProgress();
      };
      // ── DnD:左侧 → 轨道 ──
      poolList.addEventListener("dragstart", event => {
        const itemEl = event.target.closest("[data-mix-jy-pool-id]");
        if (!itemEl) return;
        const id = itemEl.dataset.mixJyPoolId;
        if (track.some(t => t.id === id)) { event.preventDefault(); return; }
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/x-pool-id", id);
        itemEl.classList.add("is-dragging");
      });
      poolList.addEventListener("dragend", event => {
        const itemEl = event.target.closest("[data-mix-jy-pool-id]");
        if (itemEl) itemEl.classList.remove("is-dragging");
      });
      // ── DnD:轨道内调顺序(块 body dragstart) ──
      trackEl.addEventListener("dragstart", event => {
        if (event.target.closest("[data-mix-jy-block-edge]")) { event.preventDefault(); return; }
        const blockEl = event.target.closest("[data-mix-jy-block-idx]");
        if (!blockEl) return;
        const idx = Number(blockEl.dataset.mixJyBlockIdx);
        if (Number.isNaN(idx)) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/x-track-idx", String(idx));
        blockEl.closest("[data-mix-jy-block]")?.classList.add("is-dragging");
      });
      trackEl.addEventListener("dragend", () => {
        trackEl.querySelectorAll(".is-dragging").forEach(el => el.classList.remove("is-dragging"));
        trackEl.classList.remove("is-drag-over");
      });
      // ── 轨道 drop ──
      trackEl.addEventListener("dragover", event => {
        event.preventDefault();
        const types = event.dataTransfer.types;
        event.dataTransfer.dropEffect = Array.from(types).includes("text/x-pool-id") ? "copy" : "move";
        trackEl.classList.add("is-drag-over");
      });
      trackEl.addEventListener("dragleave", event => {
        if (event.target === trackEl) trackEl.classList.remove("is-drag-over");
      });
      trackEl.addEventListener("drop", event => {
        event.preventDefault();
        trackEl.classList.remove("is-drag-over");
        const poolId = event.dataTransfer.getData("text/x-pool-id");
        const trackIdxStr = event.dataTransfer.getData("text/x-track-idx");
        if (poolId) {
          const src = pool.find(p => p.id === poolId);
          if (!src) return;
          if (track.some(t => t.id === poolId)) { showToast("该素材已在轨道上"); return; }
          track.push({ id:src.id, name:src.name, scene:src.scene, duration:src.duration, cropStart:0, cropEnd:Math.min(src.duration, limit / Math.max(1, track.length + 1)), tone:src.tone });
          previewIndex = track.length - 1;
        } else if (trackIdxStr) {
          const from = Number(trackIdxStr);
          if (Number.isNaN(from)) return;
          // 根据落点 X 决定插入位置
          const trackRect = trackEl.getBoundingClientRect();
          const dropX = event.clientX - trackRect.left;
          let to = track.length;
          let acc = 0;
          const blockEls = [...trackEl.querySelectorAll("[data-mix-jy-block]")];
          for (let i = 0; i < blockEls.length; i++) {
            const w = blockEls[i].getBoundingClientRect().width;
            if (dropX < acc + w / 2) { to = i; break; }
            acc += w;
          }
          if (from === to || from + 1 === to) return;
          const [moved] = track.splice(from, 1);
          const insertAt = to > from ? to - 1 : to;
          track.splice(insertAt, 0, moved);
          if (previewIndex === from) previewIndex = insertAt;
          else if (from < previewIndex && insertAt >= previewIndex) previewIndex -= 1;
          else if (from > previewIndex && insertAt <= previewIndex) previewIndex += 1;
        }
        renderPool();
        renderTrack();
        renderPreview();
        updateProgress();
      });
      // ── 块内左右手柄拖动裁剪 ──
      const onBlockEdgeMove = event => {
        if (!dragState || dragState.kind !== "block-edge") return;
        const t = track[dragState.trackIndex];
        if (!t) return;
        const totalUsed = track.reduce((s, x) => s + (x.cropEnd - x.cropStart), 0);
        const trackRect = trackEl.getBoundingClientRect();
        const dx = event.clientX - dragState.startX;
        const secPerPx = totalUsed > 0 ? totalUsed / Math.max(1, trackRect.width) : 0;
        const deltaSec = dx * secPerPx;
        const MIN_LEN = .1;
        if (dragState.edge === "start") {
          const newStart = Math.max(0, Math.min(t.cropEnd - MIN_LEN, dragState.startVal + deltaSec));
          t.cropStart = Math.round(newStart * 10) / 10;
        } else {
          const newEnd = Math.min(t.duration, Math.max(t.cropStart + MIN_LEN, dragState.endVal + deltaSec));
          t.cropEnd = Math.round(newEnd * 10) / 10;
        }
        // 实时更新当前块的 tooltip + 小字(不重渲整个 track,避免抢走 mousedown)
        const blockEl = trackEl.querySelector(`[data-mix-jy-block="${dragState.trackIndex}"]`);
        const tipEl = blockEl?.querySelector("[data-mix-jy-crop-tip]");
        if (tipEl) tipEl.textContent = `${t.cropStart.toFixed(1)}s → ${t.cropEnd.toFixed(1)}s · 长度 ${(t.cropEnd - t.cropStart).toFixed(1)}s`;
        const len = Math.max(.1, t.cropEnd - t.cropStart);
        const lenEl = blockEl?.querySelector(".mix-jy-crop-len");
        const rangeEl = blockEl?.querySelector(".mix-jy-crop-range");
        if (lenEl) lenEl.textContent = `${len.toFixed(1)}s`;
        if (rangeEl) rangeEl.textContent = `${t.cropStart.toFixed(1)}→${t.cropEnd.toFixed(1)}s`;
        // 进度条 + 单素材预览文案
        const used = track.reduce((s, x) => s + (x.cropEnd - x.cropStart), 0);
        usedEl.textContent = used.toFixed(1);
        const ratio = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
        barEl.style.width = `${ratio}%`;
        const over = used > limit + .05;
        barEl.classList.toggle("is-over", over);
        barEl.classList.toggle("is-full", !over && ratio > 90);
        confirmBtn.disabled = over;
        confirmBtn.classList.toggle("disabled", over);
        if (previewMode === "single" && previewIndex === dragState.trackIndex) {
          const cur = track[previewIndex];
          sceneEl.innerHTML = `— 第 <b>${previewIndex + 1}</b> 段 · 裁剪 <b>${cur.cropStart.toFixed(1)}s → ${cur.cropEnd.toFixed(1)}s</b> (${(cur.cropEnd - cur.cropStart).toFixed(1)}s / 原 ${cur.duration.toFixed(1)}s)`;
          modeProgress.textContent = `预览:第 ${previewIndex + 1}/${track.length} 段 · ${(cur.cropEnd - cur.cropStart).toFixed(1)}s`;
        }
      };
      const onBlockEdgeUp = () => {
        if (dragState?.kind === "block-edge") {
          const blockEl = trackEl.querySelector(`[data-mix-jy-block="${dragState.trackIndex}"]`);
          blockEl?.classList.remove("is-dragging");
          dragState = null;
          document.body.style.cursor = "";
        }
      };
      // 块手柄 mousedown(代理)
      trackEl.addEventListener("mousedown", event => {
        const edge = event.target.closest("[data-mix-jy-block-edge]");
        if (edge) {
          const idx = Number(edge.dataset.mixJyBlockIdx);
          const t = track[idx];
          if (!t) return;
          dragState = { kind:"block-edge", trackIndex:idx, edge:edge.dataset.mixJyBlockEdge, startX:event.clientX, startVal:t.cropStart, endVal:t.cropEnd };
          // 块加 is-dragging 触发上方 tooltip + 手柄高亮
          const blockEl = trackEl.querySelector(`[data-mix-jy-block="${idx}"]`);
          blockEl?.classList.add("is-dragging");
          document.body.style.cursor = "ew-resize";
          event.preventDefault();
          event.stopPropagation();
        }
      });
      // 块 body 点击切换为单素材预览
      trackEl.addEventListener("click", event => {
        if (event.target.closest("[data-mix-jy-block-edge], [data-mix-jy-block-remove]")) return;
        const body = event.target.closest("[data-mix-jy-block-idx]");
        if (!body) return;
        const idx = Number(body.dataset.mixJyBlockIdx);
        if (Number.isNaN(idx)) return;
        previewIndex = idx;
        previewMode = "single";
        renderPreview();
      });
      // 块移除按钮
      trackEl.addEventListener("click", event => {
        const rm = event.target.closest("[data-mix-jy-block-remove]");
        if (!rm) return;
        const idx = Number(rm.dataset.mixJyBlockRemove);
        if (Number.isNaN(idx)) return;
        track.splice(idx, 1);
        if (previewIndex >= track.length) previewIndex = Math.max(0, track.length - 1);
        renderPool();
        renderTrack();
        renderPreview();
        updateProgress();
      });
      // ── 模式切换 tab ──
      overlay.querySelectorAll("[data-mix-jy-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          previewMode = btn.dataset.mixJyMode;
          renderPreview();
        });
      });
      // ── 工具栏 ──
      overlay.querySelector("[data-mix-jy-average]").addEventListener("click", () => {
        if (!track.length) { showToast("请先把素材拖到轨道"); return; }
        const per = limit / track.length;
        applyUniform(per);
        showToast(`已按 1/${track.length} 平均分配,每段 ${per.toFixed(1)}s`);
      });
      overlay.querySelector("[data-mix-jy-reset]").addEventListener("click", () => {
        if (!track.length) { showToast("轨道为空"); return; }
        applyReset();
        showToast("已重置为镜头原始时长");
      });
      overlay.querySelector("[data-mix-jy-auto]").addEventListener("click", () => {
        if (!track.length) { showToast("请先把素材拖到轨道"); return; }
        const btn = overlay.querySelector("[data-mix-jy-auto]");
        btn.disabled = true;
        btn.textContent = "AI 裁剪中…";
        setTimeout(() => {
          const per = limit / track.length;
          applyUniform(per);
          btn.disabled = false;
          btn.textContent = "✨ AI 自动裁剪";
          showToast(`AI 已按 1/${track.length} 自动裁剪,总时长 ${limit.toFixed(1)}s`);
        }, 600);
      });
      // ── 确认替换 ──
      confirmBtn.addEventListener("click", () => {
        if (!track.length) { showToast("请先把素材拖到轨道"); return; }
        const values = track.map(t => ({ id:t.id, duration:Math.max(.1, t.cropEnd - t.cropStart) }));
        const total = values.reduce((s, v) => s + v.duration, 0);
        if (total > limit + .05) {
          progressText.textContent = `裁剪后总时长 ${total.toFixed(1)}s,仍超 ${(total - limit).toFixed(1)}s,请继续调整。`;
          return;
        }
        const durMap = Object.fromEntries(values.map(v => [v.id, v.duration]));
        const ids = values.map(v => v.id);
        stateAdapter.writeToState?.(rowIndex, ids, durMap);
        stateAdapter.clearNeedsRematch?.(rowIndex);
        overlay.remove();
        onApply?.(values);
        showToast(`已按 1/${values.length} 拼接裁剪并替换`);
      });
      // ── 全局 mousemove/mouseup + 关闭清理 ──
      document.addEventListener("mousemove", onBlockEdgeMove);
      document.addEventListener("mouseup", onBlockEdgeUp);
      const observer = new MutationObserver(() => {
        if (!overlay.isConnected) {
          document.removeEventListener("mousemove", onBlockEdgeMove);
          document.removeEventListener("mouseup", onBlockEdgeUp);
          observer.disconnect();
        }
      });
      observer.observe(overlay.parentNode || document.body, { childList:true, subtree:false });
      // ── 初始化 ──
      renderPool();
      renderTrack();
      renderPreview();
      updateProgress();
    }

    function openMixMaterialPicker(root) {
      const currentIds = mixSelectedMaterialIds();
      openScriptMaterialPicker({
        title:"关联创作素材到本次混剪",
        selectedIds:currentIds.filter(id => findScriptMaterial(id)),
        defaultSelectionHint:"默认勾选已带入创作素材的产品关联素材；",
        onConfirm:ids => {
          const beforeIds = new Set(currentIds);
          const candidateIds = [...new Set([...currentIds, ...ids])];
          const readyIds = candidateIds.filter(id => findScriptMaterial(id)?.status === "ok" || root.querySelector(`[data-mix-material="${id}"]`)?.dataset.mixMaterialStatus === "ok");
          syncMixMaterialSelection(readyIds);
          const addedIds = readyIds.filter(id => !beforeIds.has(id));
          if (addedIds.length) {
            root.dataset.mixMaterialQuery = "";
            root.dataset.mixMaterialFilter = "all";
            root.dataset.mixMaterialTagFilter = "";
            const search = root.querySelector("[data-mix-material-search]");
            const filter = root.querySelector("[data-mix-material-filter]");
            if (search) search.value = "";
            if (filter) filter.value = "all";
            syncMixMaterialTagFilter();
            focusMixMaterial(addedIds[0]);
            showToast(`已添加 ${addedIds.length} 条已分析素材，并定位到新增素材`);
          } else if (readyIds.length !== ids.length) {
            showToast("所选素材尚未完成分析，暂不能加入本次混剪");
          } else {
            showToast("素材选择已更新");
          }
        }
      });
    }

    // 公共:行内画面描述 / 口播文案 input 事件(混剪和脚本 Step 3 共用,不再复制)
    // ctx = { stateAdapter:{writeVisualOverride,writeCopyOverride,markNeedsRematch}, onVisualEdit, onCopyEdit }
    function handleRowEditInput(event, ctx) {
      if (event.target.matches("[data-mix-row-visual]")) {
        const index = Number(event.target.dataset.mixRowVisual || 0);
        ctx.stateAdapter.writeVisualOverride(index, event.target.value);
        if (ctx.stateAdapter.markNeedsRematch) ctx.stateAdapter.markNeedsRematch(index);
        // 局部刷新:高亮"重新匹配" + 启用"↶ 回到默认" + label 末加"需重新匹配"
        const card = event.target.closest("[data-mix-script-row], [data-script-row]");
        const rematchBtn = card?.querySelector("[data-mix-rematch-row]");
        if (rematchBtn) rematchBtn.classList.add("is-highlight");
        const resetBtn = card?.querySelector("[data-mix-visual-reset]");
        if (resetBtn) {
          resetBtn.removeAttribute("disabled");
          resetBtn.removeAttribute("aria-disabled");
        }
        const label = event.target.closest("label");
        let flag = label?.querySelector(".mix-visual-rematch-flag");
        if (!flag && label) {
          flag = document.createElement("em");
          flag.className = "mix-visual-rematch-flag";
          flag.title = "已修改描述,需要重新匹配镜头";
          flag.textContent = "需重新匹配";
          label.querySelector("span").appendChild(flag);
        }
        ctx.onVisualEdit?.(index);
      }
      if (event.target.matches("[data-mix-row-copy]")) {
        const index = Number(event.target.dataset.mixRowCopy || 0);
        ctx.stateAdapter.writeCopyOverride(index, event.target.value);
        const copyCounter = event.target.closest("label")?.querySelector("[data-mix-row-copy-count]");
        if (copyCounter) copyCounter.textContent = `${event.target.value.length} 字`;
        ctx.onCopyEdit?.(index, event.target.value);
      }
    }


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

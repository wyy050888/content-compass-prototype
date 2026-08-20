
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


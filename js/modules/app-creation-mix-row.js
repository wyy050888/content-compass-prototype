
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
        title: "删除该分镜？",
        label: "删除分镜",
        body: `<div class="mix-delete-dialog-body">
          <p>是否确认删除该段分镜，操作不可恢复？</p>
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

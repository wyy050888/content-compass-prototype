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


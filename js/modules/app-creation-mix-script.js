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

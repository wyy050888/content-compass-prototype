(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;
  const pad = value => String(value).padStart(2, "0");
  app.now = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  app.fullTime = value => /^\d{2}-\d{2}/.test(value || "") ? `2026-${value}` : value || "";
  app.shortTime = value => String(value || "—").replace(/^\d{4}-/, "");
  app.imageTime = image => `<small class="pc-image-time" title="生成时间：${app.escape(image?.generatedAt || "未记录")}">生成于 ${app.escape(image?.generatedAt?.slice(5) || "未记录")}</small>`;
  app.imageVisual = image => image?.url
    ? `<img src="${app.escape(image.url)}" alt="${app.escape(image.fileName || image.name)}">`
    : `<span class="pc-distribution-placeholder tone-${(image?.order || 0) % 6 + 1}" role="img" aria-label="原型示例图片"></span>`;
  app.recordScreenDecision = (image, status) => {
    if (image.screenStatus === status) return;
    image.screenStatus = status;
    image.screenUpdatedAt = app.now();
    image.selectedAt = status === "selected" ? image.screenUpdatedAt : null;
  };
  // Demo seed migration: fixed historical times, never substitute today's time.
  app.data.generationTasks.forEach(task => {
    task.createdAt = app.fullTime(task.createdAt);
    task.processingResults ||= Array.from({ length: task.success + task.failed }, (_, index) => ({
      id: `${task.id}-SAMPLE-${index + 1}`, status: index < task.success ? "success" : "failed",
      completedAt: app.now(new Date(new Date(task.createdAt.replace(" ", "T")).getTime() + (index + 1) * 1000)), demo: true
    }));
  });
  app.data.images.forEach(image => {
    const task = app.data.generationTasks.find(item => item.id === image.taskId);
    image.generatedAt ||= task?.processingResults?.[image.order - 1]?.completedAt || task?.createdAt || "";
    image.promptSnapshot ||= task?.rules?.[image.ruleIndex - 1]?.prompt || "";
    if (image.screenStatus === "selected") image.selectedAt ||= image.generatedAt;
  });
  // A sample has a stable slot, irrespective of completion order or rule quantity.
  app.completeGenerationSample = task => {
    task.processingResults ||= [];
    const slot = task.success + task.failed;
    let offset = 0, ruleIndex = -1;
    for (let index = 0; index < task.rules.length; index += 1) {
      offset += task.rules[index].quantity;
      if (slot < offset) { ruleIndex = index; break; }
    }
    if (ruleIndex < 0 || slot >= task.target) return false;
    const rule = task.rules[ruleIndex], completedAt = app.now();
    const sampleIndex = slot - (offset - rule.quantity);
    const samplePrompt = rule.prompt + (rule.quantity > 1 ? `；本规则子变体：主体占画面${[55,65,75,60,70][sampleIndex % 5]}%，背景层次${["简洁", "前景虚化", "后景虚化", "浅景深"][Math.floor(sampleIndex / 5) % 4]}。不改变商品结构与原规则场景。` : "");
    const result = { id: `${task.id}-SAMPLE-${slot + 1}`, ruleId: rule.id, status: "success", completedAt };
    task.processingResults.push(result);
    task.success += 1;
    app.data.images.push({ id: `${task.id}-IMG-${slot + 1}`, taskId: task.id, productId: task.productId,
      fileName: `${app.product(task.productId)?.name}-${task.id}-${String(slot + 1).padStart(3, "0")}.png`,
      ruleIndex: ruleIndex + 1, order: slot + 1, generatedAt: completedAt, promptSnapshot: samplePrompt,
      screenStatus: "pending", distributionCount: 0, distributionHistory: [] });
    return true;
  };
  app.root.addEventListener("error", event => {
    const img = event.target;
    if (img.tagName !== "IMG" || img.dataset.loadFailed) return;
    img.dataset.loadFailed = "true";
    const feedback = document.createElement("span"); feedback.className = "pc-image-load-error";
    feedback.innerHTML = '图片加载失败 <button type="button">重新加载</button>';
    img.hidden = true; img.after(feedback);
    feedback.querySelector("button").onclick = click => {
      click.preventDefault(); click.stopPropagation();
      delete img.dataset.loadFailed; img.hidden = false; feedback.remove(); img.src = img.src;
    };
  }, true);
})();

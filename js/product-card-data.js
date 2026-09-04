(function () {
  "use strict";

  const prompts = [
    "保留商品主体，替换为明亮厨房场景，暖色自然光，画面简洁",
    "保留商品主体，生成电商白底主视觉，增加柔和投影与空间层次",
    "保留商品主体，放置在现代客厅场景，突出精致生活氛围",
    "保留商品主体，生成高对比促销视觉，背景使用品牌蓝色渐变",
    "保留商品主体，构建近景细节展示，强化材质与工艺质感",
    "保留商品主体，生成清爽夏日场景，使用浅蓝色与自然光",
    "保留商品主体，构建送礼场景，画面高级且留出文案安全区",
    "保留商品主体，生成居家使用场景，人物仅作背景且不遮挡商品",
    "保留商品主体，使用极简几何背景，突出轮廓与核心部件",
    "保留商品主体，生成俯拍构图，搭配相关生活物件但不喧宾夺主"
  ];

  function makeRules(count, quantity, sourceName) {
    return Array.from({ length: count }, (_, index) => ({
      id: `R${String(index + 1).padStart(3, "0")}`,
      images: [{ id: `BASE-${index + 1}`, name: sourceName || "商品主图.jpg", url: "", width: 1080, height: 1080, tone: index % 6 + 1 }],
      prompt: `${prompts[index % prompts.length]}，构图方案 ${index + 1}`,
      promptState: "ready",
      quantity
    }));
  }

  function makeImages(taskId, product, user, count, usedEvery) {
    return Array.from({ length: count }, (_, index) => {
      const suffix = String(101501 + index).padStart(6, "0");
      const distributed = usedEvery && index % usedEvery === 0;
      const distributionCount = distributed ? index % 3 + 1 : 0;
      const distributionHistory = [
        { accountId: "AD-8821", planId: "PL-240901", account: "AD-8821 生活电器图文投放", plan: "PL-240901 清凉季主推", time: "09-01 10:42" },
        { accountId: "AD-8821", planId: "PL-240887", account: "AD-8821 生活电器图文投放", plan: "PL-240887 吹风机白底图测试", time: "09-02 09:18" },
        { accountId: "AD-5567", planId: "PL-240896", account: "AD-5567 居家图文投放", plan: "PL-240896 榨汁杯日常投放", time: "09-03 14:06" }
      ].slice(0, distributionCount);
      return {
        id: `${taskId}-IMG-${String(index + 1).padStart(3, "0")}`,
        taskId,
        productId: product.id,
        productName: product.name,
        fileName: `09.01-${product.name}-${user}-商品卡-${suffix}.png`,
        ruleIndex: Math.floor(index / 2) + 1,
        order: index + 1,
        screenStatus: index % 5 === 0 ? "rejected" : index % 3 === 0 ? "selected" : "pending",
        distributionCount,
        distributionHistory
      };
    });
  }

  const products = [
    { id: "PRD-10086", name: "轻音高速吹风机", link: "https://haohuo.jinritemai.com/views/product/item2?id=10086" },
    { id: "PRD-10215", name: "便携榨汁杯", link: "https://haohuo.jinritemai.com/views/product/item2?id=10215" },
    { id: "PRD-10307", name: "多功能养生壶", link: "https://haohuo.jinritemai.com/views/product/item2?id=10307" }
  ];

  const generationTasks = [
    { id: "GT-0902-010", name: "吹风机晨间场景补图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "pending", target: 30, success: 0, failed: 0, createdAt: "09-02 10:35:18", demoSeed: true, rules: makeRules(15, 2) },
    { id: "GT-0902-009", name: "吹风机细节展示图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "paused", target: 50, success: 22, failed: 0, createdAt: "09-02 10:12:44", rules: makeRules(25, 2) },
    { id: "GT-0902-008", name: "吹风机精选主图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "success", target: 20, success: 20, failed: 0, createdAt: "09-02 09:46:25", rules: makeRules(10, 2) },
    { id: "GT-0901-006", name: "吹风机秋季场景扩图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "running", target: 100, success: 46, failed: 2, createdAt: "09-01 14:20:36", demoSeed: true, rules: makeRules(50, 2) },
    { id: "GT-0901-005", name: "吹风机白底图补充", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "draft", target: 20, success: 0, failed: 0, createdAt: "09-01 13:06:12", rules: makeRules(10, 2) },
    { id: "GT-0901-004", name: "榨汁杯夏日场景图", productId: "PRD-10215", creator: "林晓", team: "抖音三区", status: "partial", target: 100, success: 94, failed: 6, createdAt: "09-01 11:32:08", rules: makeRules(50, 2) },
    { id: "GT-0901-003", name: "吹风机商品卡主图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "success", target: 100, success: 100, failed: 0, createdAt: "09-01 09:18:27", rules: makeRules(50, 2) },
    { id: "GT-0901-002", name: "吹风机生活方式图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "partial", target: 40, success: 34, failed: 6, createdAt: "09-01 08:50:41", rules: makeRules(20, 2) },
    { id: "GT-0831-019", name: "吹风机夜间场景图", productId: "PRD-10086", creator: "周宁", team: "抖音三区", status: "failed", target: 20, success: 0, failed: 20, createdAt: "08-31 18:06:53", rules: makeRules(10, 2), failureReason: "生图服务响应超时，任务未产生可用图片" },
    { id: "GT-0831-018", name: "养生壶场景图", productId: "PRD-10307", creator: "陈筱", team: "品牌一组", status: "failed", target: 40, success: 0, failed: 40, createdAt: "08-31 17:44:19", rules: makeRules(20, 2), failureReason: "生图服务响应超时，任务未产生可用图片" },
    { id: "GT-0831-016", name: "榨汁杯第二批主图", productId: "PRD-10215", creator: "周宁", team: "抖音三区", status: "cancelled", target: 60, success: 18, failed: 0, createdAt: "08-31 15:03:06", rules: makeRules(30, 2) }
  ];

  const images = [
    ...makeImages("GT-0902-008", products[0], "周宁", 20, 5).map((image, index) => ({ ...image, screenStatus: index % 4 === 0 ? "rejected" : "selected" })),
    ...makeImages("GT-0901-003", products[0], "周宁", 100, 11),
    ...makeImages("GT-0901-002", products[0], "周宁", 34, 0),
    ...makeImages("GT-0901-004", products[1], "林晓", 94, 0),
    ...makeImages("GT-0831-016", products[1], "周宁", 18, 0)
  ];

  const shops = [
    { id: "SHOP-31021", name: "生活电器旗舰店", accountId: "AD-8821" },
    { id: "SHOP-31045", name: "居家好物专营店", accountId: "AD-5567" },
    { id: "SHOP-31108", name: "轻享生活旗舰店", accountId: "AD-9016" }
  ];

  const accounts = [
    { id: "AD-8821", name: "生活电器图文投放", shopId: "SHOP-31021", today: 38, failed: 2, total: 1280, updatedAt: "09-01 15:18" },
    { id: "AD-5567", name: "居家图文投放", shopId: "SHOP-31045", today: 20, failed: 0, total: 846, updatedAt: "09-01 14:52" },
    { id: "AD-9016", name: "轻享商品卡投放", shopId: "SHOP-31108", today: 0, failed: 10, total: 532, updatedAt: "09-01 11:30" }
  ];

  const plans = [
    { id: "PL-240901", name: "清凉季主推", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "active", canUpload: true, spend: 791.39, orders: 19, gmv: 11332, roi: 14.32, current: 462, distributed: 188, today: 30, failed: 0, updatedAt: "09-02 11:18:20" },
    { id: "PL-240887", name: "吹风机白底图测试", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "active", canUpload: true, spend: 328.6, orders: 8, gmv: 4580, roi: 13.93, current: 478, distributed: 76, today: 8, failed: 2, updatedAt: "09-02 11:12:06" },
    { id: "PL-240886", name: "吹风机新品审核计划", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "new_review", canUpload: false, spend: 0, orders: 0, gmv: 0, roi: 0, current: 32, distributed: 18, today: 0, failed: 0, updatedAt: "09-02 10:52:11" },
    { id: "PL-240885", name: "吹风机素材修改审核", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "edit_review", canUpload: false, spend: 96.8, orders: 2, gmv: 1196, roi: 12.36, current: 185, distributed: 44, today: 0, failed: 0, updatedAt: "09-02 10:41:38" },
    { id: "PL-240884", name: "吹风机未通过计划", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "rejected", canUpload: false, spend: 0, orders: 0, gmv: 0, roi: 0, current: 14, distributed: 0, today: 0, failed: 0, updatedAt: "09-02 09:35:22" },
    { id: "PL-240803", name: "历史吹风机素材", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "paused", canUpload: false, spend: 1688.2, orders: 41, gmv: 24860, roi: 14.73, current: 385, distributed: 106, today: 0, failed: 0, updatedAt: "08-29 18:22:04" },
    { id: "PL-240802", name: "吹风机已完成计划", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "completed", canUpload: false, spend: 2216.4, orders: 53, gmv: 32160, roi: 14.51, current: 410, distributed: 90, today: 0, failed: 0, updatedAt: "08-28 16:13:42" },
    { id: "PL-240801", name: "吹风机已终止计划", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "terminated", canUpload: false, spend: 560.1, orders: 11, gmv: 6790, roi: 12.12, current: 206, distributed: 31, today: 0, failed: 0, updatedAt: "08-27 14:08:16" },
    { id: "PL-240800", name: "吹风机已删除计划", shopId: "SHOP-31021", accountId: "AD-8821", productId: "PRD-10086", status: "deleted", canUpload: false, spend: 145.3, orders: 3, gmv: 1797, roi: 12.37, current: 88, distributed: 12, today: 0, failed: 0, updatedAt: "08-26 13:20:09" },
    { id: "PL-240896", name: "榨汁杯日常投放", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 546.2, orders: 22, gmv: 7216, roi: 13.21, current: 274, distributed: 142, today: 20, failed: 0, updatedAt: "09-02 10:52:18" },
    { id: "PL-240895", name: "榨汁杯夏日冰饮主推", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 1286.5, orders: 48, gmv: 16944, roi: 13.17, current: 118, distributed: 96, today: 18, failed: 1, updatedAt: "09-02 10:46:35" },
    { id: "PL-240894", name: "榨汁杯通勤早餐场景", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 864.3, orders: 31, gmv: 10819, roi: 12.52, current: 286, distributed: 164, today: 12, failed: 0, updatedAt: "09-02 10:38:12" },
    { id: "PL-240893", name: "榨汁杯办公室轻饮", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 438.7, orders: 17, gmv: 5848, roi: 13.33, current: 438, distributed: 72, today: 8, failed: 0, updatedAt: "09-02 10:21:46" },
    { id: "PL-240892", name: "榨汁杯宝妈辅食场景", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 706.8, orders: 26, gmv: 8944, roi: 12.65, current: 452, distributed: 109, today: 10, failed: 2, updatedAt: "09-02 10:06:29" },
    { id: "PL-240891", name: "榨汁杯旅行便携扩量", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 319.6, orders: 12, gmv: 4068, roi: 12.73, current: 490, distributed: 58, today: 5, failed: 1, updatedAt: "09-02 09:54:03" },
    { id: "PL-240890", name: "榨汁杯礼赠套装测试", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "active", canUpload: true, spend: 226.4, orders: 7, gmv: 2394, roi: 10.57, current: 500, distributed: 35, today: 0, failed: 4, updatedAt: "09-02 09:40:17" },
    { id: "PL-240889", name: "榨汁杯新品首发计划", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "new_review", canUpload: false, spend: 0, orders: 0, gmv: 0, roi: 0, current: 36, distributed: 0, today: 0, failed: 0, updatedAt: "09-02 09:26:41" },
    { id: "PL-240888", name: "榨汁杯卖点调整审核", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "edit_review", canUpload: false, spend: 184.2, orders: 6, gmv: 1980, roi: 10.75, current: 126, distributed: 24, today: 0, failed: 0, updatedAt: "09-02 09:18:22" },
    { id: "PL-240879", name: "榨汁杯促销文案未通过", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "rejected", canUpload: false, spend: 0, orders: 0, gmv: 0, roi: 0, current: 18, distributed: 0, today: 0, failed: 0, updatedAt: "09-01 18:42:13" },
    { id: "PL-240878", name: "榨汁杯春季场景计划", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "paused", canUpload: false, spend: 1428.9, orders: 39, gmv: 14001, roi: 9.80, current: 347, distributed: 121, today: 0, failed: 0, updatedAt: "08-31 17:12:08" },
    { id: "PL-240877", name: "榨汁杯旧版素材计划", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "deleted", canUpload: false, spend: 376.5, orders: 9, gmv: 3213, roi: 8.53, current: 92, distributed: 31, today: 0, failed: 0, updatedAt: "08-30 14:35:26" },
    { id: "PL-240876", name: "榨汁杯七夕礼赠计划", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "completed", canUpload: false, spend: 2384.6, orders: 68, gmv: 25364, roi: 10.64, current: 416, distributed: 186, today: 0, failed: 0, updatedAt: "08-29 20:16:54" },
    { id: "PL-240875", name: "榨汁杯历史低效计划", shopId: "SHOP-31045", accountId: "AD-5567", productId: "PRD-10215", status: "terminated", canUpload: false, spend: 628.1, orders: 8, gmv: 2992, roi: 4.76, current: 205, distributed: 47, today: 0, failed: 0, updatedAt: "08-28 11:09:37" },
    { id: "PL-240811", name: "养生壶秋季预热", shopId: "SHOP-31108", accountId: "AD-9016", productId: "PRD-10307", status: "new_review", canUpload: false, spend: 0, orders: 0, gmv: 0, roi: 0, current: 118, distributed: 48, today: 0, failed: 10, updatedAt: "09-02 09:30:54" }
  ];

  const distributionTasks = [
    { id: "DT-0902-018", name: "吹风机今日素材分发", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-003", "GT-0901-002"], plans: ["PL-240901", "PL-240887"], requested: 40, success: 38, failed: 2, status: "partial", createdAt: "09-02 11:10:32", results: [{ planId: "PL-240901", success: 30, failed: 0, reason: "分发完成" }, { planId: "PL-240887", success: 8, failed: 2, reason: "素材容量并发变化，2张分发失败" }] },
    { id: "DT-0902-017", name: "榨汁杯主图分发", productId: "PRD-10215", creator: "林晓", team: "抖音三区", sourceTaskIds: ["GT-0901-004"], plans: ["PL-240896"], requested: 20, success: 20, failed: 0, status: "success", createdAt: "09-02 10:44:18", results: [{ planId: "PL-240896", success: 20, failed: 0, reason: "分发完成" }] },
    { id: "DT-0902-016", name: "吹风机计划补充分发", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-003"], plans: ["PL-240901"], requested: 16, success: 0, failed: 0, status: "uploading", createdAt: "09-02 10:22:47", results: [{ planId: "PL-240901", success: 0, failed: 0, reason: "正在分发" }] },
    { id: "DT-0902-015", name: "吹风机白底图待分发", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-003"], plans: ["PL-240887"], requested: 12, success: 0, failed: 0, status: "pending", createdAt: "09-02 09:58:36", results: [{ planId: "PL-240887", success: 0, failed: 0, reason: "等待分发" }] },
    { id: "DT-0902-014", name: "吹风机分发草稿", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-003"], plans: [], requested: 10, success: 0, failed: 0, status: "draft", createdAt: "09-02 09:31:20", results: [] },
    { id: "DT-0902-013", name: "吹风机历史任务已取消", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-002"], plans: ["PL-240901"], requested: 18, success: 6, failed: 1, status: "cancelled", createdAt: "09-02 09:08:42", results: [{ planId: "PL-240901", success: 6, failed: 1, reason: "已分发7张，剩余11张因任务取消未处理" }] },
    { id: "DT-0902-012", name: "吹风机日常计划分发完成", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-003"], plans: ["PL-240901"], requested: 15, success: 15, failed: 0, status: "success", createdAt: "09-02 08:52:16", results: [{ planId: "PL-240901", success: 15, failed: 0, reason: "分发完成" }] },
    { id: "DT-0902-010", name: "吹风机素材接口分发失败", productId: "PRD-10086", creator: "周宁", team: "抖音三区", sourceTaskIds: ["GT-0901-002"], plans: ["PL-240901"], requested: 6, success: 0, failed: 6, status: "failed", createdAt: "09-02 08:15:43", failureReason: "千川素材接口响应超时", results: [{ planId: "PL-240901", success: 0, failed: 6, reason: "千川素材接口响应超时" }] },
    { id: "DT-0901-009", name: "养生壶秋季计划分发", productId: "PRD-10307", creator: "陈筱", team: "品牌一组", sourceTaskIds: [], plans: ["PL-240811"], requested: 10, success: 0, failed: 10, status: "failed", createdAt: "09-01 11:22:47", failureReason: "计划当前处于审核中，未执行分发", results: [{ planId: "PL-240811", success: 0, failed: 10, reason: "计划当前处于审核中，未执行分发" }] }
  ];

  const imageLibrary = [
    { id: "LIB-IMG-001", name: "吹风机白底主图", folder: "产品主图", width: 1080, height: 1080, tone: 1 },
    { id: "LIB-IMG-002", name: "吹风机浴室场景", folder: "场景图片", width: 1200, height: 1200, tone: 2 },
    { id: "LIB-IMG-003", name: "吹风机礼赠场景", folder: "场景图片", width: 1080, height: 1080, tone: 3 },
    { id: "LIB-IMG-004", name: "吹风机材质特写", folder: "产品细节", width: 1000, height: 1000, tone: 4 },
    { id: "LIB-IMG-005", name: "榨汁杯白底主图", folder: "产品主图", width: 1080, height: 1080, tone: 5 },
    { id: "LIB-IMG-006", name: "榨汁杯夏日桌面", folder: "场景图片", width: 1200, height: 1200, tone: 6 },
    { id: "LIB-IMG-007", name: "养生壶白底图", folder: "产品主图", width: 800, height: 800, tone: 1 },
    { id: "LIB-IMG-008", name: "养生壶居家场景", folder: "场景图片", width: 1080, height: 1080, tone: 2 },
    { id: "LIB-IMG-009", name: "吹风机详情页长图", folder: "产品细节", width: 750, height: 1000, tone: 3 },
    { id: "LIB-IMG-010", name: "吹风机横版氛围图", folder: "场景图片", width: 1600, height: 900, tone: 4 },
    { id: "LIB-IMG-011", name: "轻奢蓝色背景", folder: "背景素材", width: 1080, height: 1080, tone: 5 },
    { id: "LIB-IMG-012", name: "清爽渐变背景", folder: "背景素材", width: 1200, height: 1200, tone: 6 }
  ];

  window.ProductCardSeed = { products, generationTasks, images, shops, accounts, plans, distributionTasks, imageLibrary, makeRules, prompts };
})();

(function () {
  "use strict";
  const seed = window.ProductCardSeed || { shops: [], accounts: [] };

  const authorizationSamples = [
    { qianchuan: "authorized", suixintui: "authorized", juliang: "unauthorized" },
    { qianchuan: "authorized", suixintui: "unauthorized", juliang: "expired" },
    { qianchuan: "unauthorized", suixintui: "authorized", juliang: "failed" },
    { qianchuan: "authorized", suixintui: "cancelled", juliang: "authorized" }
  ];
  const expirySamples = [
    { qianchuan: 24, suixintui: 16, juliang: null },
    { qianchuan: 8, suixintui: null, juliang: null },
    { qianchuan: null, suixintui: 36, juliang: null },
    { qianchuan: 5, suixintui: null, juliang: 18 }
  ];
  const shops = seed.shops.map((item, index) => ({
    id: item.id,
    name: item.name,
    avatarTone: index + 1,
    defaultAccountId: item.accountId || "",
    subject: ["杭州轻风生活电器有限公司", "杭州居家好物科技有限公司", "上海轻享电器有限公司", "宁波风尚个人护理有限公司"][index] || "杭州内容罗盘科技有限公司",
    expiresIn: expirySamples[index]?.qianchuan ?? 0,
    authorization: authorizationSamples[index] || { qianchuan: "unauthorized", suixintui: "unauthorized", juliang: "unauthorized" },
    authorizationExpiry: expirySamples[index] || { qianchuan: null, suixintui: null, juliang: null }
  }));
  const baseAccounts = seed.accounts.map((item, index) => ({
    id: item.id, name: item.name, shopId: item.shopId || shops[index]?.id || "", platform: "qianchuan", douyinCount: [3, 1, 2][index] || 0
  }));
  const accounts = baseAccounts.concat([
    { id: "AD-7740", name: "生活电器新品投放", shopId: "SHOP-31021", platform: "qianchuan", douyinCount: 2 },
    { id: "AD-7741", name: "生活电器随心推", shopId: "SHOP-31021", platform: "suixintui", douyinCount: 1 },
    { id: "AD-7742", name: "生活电器巨量广告", shopId: "SHOP-31021", platform: "juliang", douyinCount: 1 },
    { id: "AD-6632", name: "居家商品卡测试", shopId: "SHOP-31045", platform: "juliang", douyinCount: 1 },
    { id: "AD-9017", name: "轻享随心推账户", shopId: "SHOP-31108", platform: "suixintui", douyinCount: 1 },
    { id: "AD-9218", name: "吹风机商品卡投放", shopId: "SHOP-31132", platform: "juliang", douyinCount: 2 }
  ]);

  const douyinTemplates = [
    ["轻风生活电器", "DY-69382104", "authorized", "2026-09-02 10:18:32"],
    ["轻风好物严选", "DY-73512086", "authorized", "2026-09-01 16:42:09"],
    ["吹风机研究所", "DY-81056327", "unauthorized", "2026-08-30 09:26:41"],
    ["居家好物官号", "DY-62018435", "authorized", "2026-09-02 09:35:18"],
    ["轻享生活馆", "DY-52913780", "authorized", "2026-09-01 18:03:27"],
    ["轻享好物推荐", "DY-48102963", "authorized", "2026-08-29 14:11:06"],
    ["风尚个护旗舰号", "DY-90631572", "authorized", "2026-09-02 11:06:55"],
    ["吹风机测评官", "DY-85720419", "authorized", "2026-09-01 13:48:20"]
  ];
  let templateIndex = 0;
  const douyinAccounts = accounts.flatMap(account => {
    return Array.from({ length: account.douyinCount }, () => {
      const source = douyinTemplates[templateIndex++] || [`授权抖音号${templateIndex}`, `DY-${90000000 + templateIndex}`, "authorized", "2026-09-02 10:00:00"];
      return { name: source[0], id: source[1], status: source[2], updatedAt: source[3], accountId: account.id, shopId: account.shopId, avatarTone: templateIndex };
    });
  });

  window.AccountConfigSeed = { shops, accounts, douyinAccounts };
})();

(function () {
  "use strict";
  const seed = window.ProductCardSeed || { shops: [], accounts: [] };

  const shops = seed.shops.map((item, index) => ({
    id: item.id,
    name: item.name,
    avatarTone: index + 1,
    defaultAccountId: item.accountId || "",
    subject: ["杭州轻风生活电器有限公司", "杭州居家好物科技有限公司", "上海轻享电器有限公司"][index] || "杭州内容罗盘科技有限公司",
    expiresIn: [24, 8, 36][index] || 30,
    authorization: {
      qianchuan: index !== 2 ? "authorized" : "unauthorized",
      suixintui: index !== 1 ? "authorized" : "unauthorized",
      juliang: index === 0 ? "authorized" : "unauthorized"
    }
  }));
  shops.push({
    id: "SHOP-31132", name: "吹风机专营店", avatarTone: 4, defaultAccountId: "",
    subject: "宁波风尚个人护理有限公司", expiresIn: 5,
    authorization: { qianchuan: "authorized", suixintui: "unauthorized", juliang: "authorized" }
  });

  const baseAccounts = seed.accounts.map((item, index) => ({
    id: item.id, name: item.name, shopId: item.shopId || shops[index]?.id || "", douyinCount: [3, 1, 2][index] || 0
  }));
  const accounts = baseAccounts.concat([
    { id: "AD-7740", name: "生活电器新品投放", shopId: "SHOP-31021", douyinCount: 2 },
    { id: "AD-6632", name: "居家商品卡测试", shopId: "SHOP-31045", douyinCount: 1 },
    { id: "AD-9218", name: "吹风机商品卡投放", shopId: "SHOP-31132", douyinCount: 2 }
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

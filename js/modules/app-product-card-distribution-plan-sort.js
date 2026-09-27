(function () {
  "use strict";
  const app = window.ProductCardApp;
  const dist = app?.distribution;
  if (!dist) return;

  const fields = {
    spend: ["整体消耗(元)", "desc"], orders: ["整体成交订单数", "desc"],
    gmv: ["整体成交金额(元)", "desc"], roi: ["整体支付ROI", "desc"],
    current: ["当前素材数", "asc"]
  };
  dist.wizardPlanSorting = {
    header(field, sort) {
      const [active, direction] = sort.split("-");
      const selected = active === field;
      const ariaSort = selected ? (direction === "asc" ? "ascending" : "descending") : "none";
      return `<th aria-sort="${ariaSort}"><button type="button" class="pc-sort-head ${selected ? "active" : ""}" data-wizard-plan-sort="${field}">${fields[field][0]}<span aria-hidden="true">${selected ? (direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>`;
    },
    next(field, sort) {
      if (!fields[field]) return sort;
      const first = fields[field][1];
      const [active, direction] = sort.split("-");
      if (active !== field) return `${field}-${first}`;
      return direction === first ? `${field}-${first === "asc" ? "desc" : "asc"}` : "";
    },
    apply(plans, sort, range) {
      const [field, direction] = sort.split("-");
      if (!fields[field]) return plans;
      // Sort a display copy; selection order controls allocation independently.
      return plans.map(plan => ({ plan, value: field === "current" ? plan.current : dist.performanceForRange(plan, range)[field] }))
        .sort((left, right) => {
          const leftMissing = !Number.isFinite(left.value), rightMissing = !Number.isFinite(right.value);
          if (leftMissing || rightMissing) return Number(leftMissing) - Number(rightMissing);
          return (left.value - right.value) * (direction === "asc" ? 1 : -1);
        }).map(item => item.plan);
    }
  };
})();

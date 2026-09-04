(function () {
  "use strict";
  const app = window.ProductCardApp;
  if (!app) return;
  const pad = value => String(value).padStart(2, "0");
  const toISO = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const parse = value => new Date(`${value}T00:00:00`);
  const today = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); };
  const moveDays = (date, amount) => { const result = new Date(date); result.setDate(result.getDate() + amount); return result; };
  const preset = days => ({ start: toISO(moveDays(today(), -Math.max(0, days - 1))), end: toISO(today()) });
  const normalizeTime = value => { const text = String(value || "").trim(); return /^\d{2}-\d{2}/.test(text) ? `${today().getFullYear()}-${text}` : text; };
  const format = value => value ? value.replaceAll("-", "/") : "请选择日期";
  const monthStart = value => { const date = value ? parse(value) : today(); return new Date(date.getFullYear(), date.getMonth(), 1); };
  const monthKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  function namedRange(name) {
    const now = today(), day = now.getDay() || 7;
    if (name === "today") return preset(1);
    if (name === "yesterday") { const date = moveDays(now, -1); return { start: toISO(date), end: toISO(date) }; }
    if (["7", "15", "30"].includes(name)) return preset(Number(name));
    if (name === "this-week") return { start: toISO(moveDays(now, 1 - day)), end: toISO(now) };
    if (name === "last-week") return { start: toISO(moveDays(now, -day - 6)), end: toISO(moveDays(now, -day)) };
    if (name === "this-month") return { start: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), end: toISO(now) };
    return { start: toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1)), end: toISO(new Date(now.getFullYear(), now.getMonth(), 0)) };
  }
  function calendar(date, control) {
    const year = date.getFullYear(), month = date.getMonth(), firstDay = new Date(year, month, 1).getDay();
    const gridStart = moveDays(new Date(year, month, 1), -firstDay);
    const start = control.dataset.draftStart || "", end = control.dataset.draftEnd || "";
    const days = Array.from({ length: 42 }, (_, index) => {
      const value = moveDays(gridStart, index), iso = toISO(value);
      const classes = [value.getMonth() !== month ? "muted" : "", iso === start || iso === end ? "selected" : "", start && end && iso > start && iso < end ? "in-range" : ""].filter(Boolean).join(" ");
      return `<button type="button" data-pc-calendar-day="${iso}" class="${classes}">${value.getDate()}</button>`;
    }).join("");
    return `<section class="pc-calendar"><header><b>${year}年 ${month + 1}月</b></header><div class="pc-calendar-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="pc-calendar-days">${days}</div></section>`;
  }
  function refresh(control) {
    const view = monthStart(`${control.dataset.viewMonth}-01`);
    control.querySelector(".pc-date-calendars").innerHTML = calendar(view, control) + calendar(new Date(view.getFullYear(), view.getMonth() + 1, 1), control);
    control.querySelector(".pc-date-draft").textContent = `${format(control.dataset.draftStart)} — ${format(control.dataset.draftEnd)}`;
  }
  function positionPopover(control) {
    const popover = control.querySelector(".pc-date-popover");
    const triggerRect = control.getBoundingClientRect();
    const container = control.classList.contains("compact") ? control.closest(".pc-drawer-body") : control.closest(".pc-table-card");
    const boundary = container?.getBoundingClientRect() || { left: 12, right: window.innerWidth - 12 };
    const leftEdge = Math.max(12, boundary.left + 10), rightEdge = Math.min(window.innerWidth - 12, boundary.right - 10);
    const width = Math.min(690, Math.max(320, rightEdge - leftEdge));
    let pageLeft = triggerRect.left;
    if (pageLeft + width > rightEdge) pageLeft = rightEdge - width;
    if (pageLeft < leftEdge) pageLeft = leftEdge;
    popover.style.width = `${width}px`;
    popover.style.left = `${pageLeft - triggerRect.left}px`;
    popover.style.right = "auto";
  }
  function closeAll(except) { document.querySelectorAll(".pc-date-range.open").forEach(node => { if (node !== except) node.classList.remove("open"); }); }
  app.dateRange = {
    preset,
    toDate(value) { const date = parse(normalizeTime(value).slice(0, 10)); return Number.isNaN(date.getTime()) ? null : date; },
    contains(value, range) { const normalized = normalizeTime(value).slice(0, 10); return (!range.start || normalized >= range.start) && (!range.end || normalized <= range.end); },
    days(range) { if (!range.start || !range.end) return 0; return Math.max(1, Math.round((parse(range.end) - parse(range.start)) / 86400000) + 1); },
    isToday(range) { const value = toISO(today()); return range.start === value && range.end === value; },
    render(owner, range, options = {}) {
      const label = options.label || "时间", viewMonth = monthKey(monthStart(range.start));
      return `<div class="pc-date-range ${options.compact ? "compact" : ""}" data-pc-range-owner="${owner}" data-view-month="${viewMonth}" data-draft-start="${range.start}" data-draft-end="${range.end}"><button type="button" class="pc-date-trigger" data-pc-range-trigger aria-label="${label}"><span class="pc-date-icon">▣</span><em>${label}</em><b>${format(range.start)} — ${format(range.end)}</b><i>⌄</i></button><div class="pc-date-popover"><aside>${[["today","今日"],["yesterday","昨日"],["7","近7日"],["15","近15日"],["30","近30日"],["this-week","本周"],["last-week","上周"],["this-month","本月"],["last-month","上月"]].map(([value,text]) => `<button type="button" data-pc-range-preset="${value}">${text}</button>`).join("")}</aside><main><div class="pc-date-nav"><button type="button" data-pc-month="-1">‹</button><span>选择开始和结束日期</span><button type="button" data-pc-month="1">›</button></div><div class="pc-date-calendars"></div><footer><span class="pc-date-draft"></span><div><button type="button" data-pc-range-cancel>取消</button><button type="button" class="primary" data-pc-range-apply>确定</button></div></footer></main></div></div>`;
    },
    handle(event, owner, range) {
      const control = event.target.closest(`[data-pc-range-owner="${owner}"]`); if (!control) return false;
      if (event.target.closest("[data-pc-range-trigger]")) { const opening = !control.classList.contains("open"); closeAll(opening ? control : null); control.classList.toggle("open", opening); if (opening) { control.dataset.draftStart = range.start; control.dataset.draftEnd = range.end; control.dataset.selecting = "start"; control.dataset.viewMonth = monthKey(monthStart(range.start)); refresh(control); positionPopover(control); } return false; }
      const shortcut = event.target.closest("[data-pc-range-preset]"); if (shortcut) { Object.assign(range, namedRange(shortcut.dataset.pcRangePreset)); control.classList.remove("open"); return true; }
      const navigation = event.target.closest("[data-pc-month]"); if (navigation) { const view = monthStart(`${control.dataset.viewMonth}-01`); view.setMonth(view.getMonth() + Number(navigation.dataset.pcMonth)); control.dataset.viewMonth = monthKey(view); refresh(control); return false; }
      const day = event.target.closest("[data-pc-calendar-day]"); if (day) { const value = day.dataset.pcCalendarDay; if (control.dataset.selecting === "start" || (control.dataset.draftStart && control.dataset.draftEnd)) { control.dataset.draftStart = value; control.dataset.draftEnd = ""; control.dataset.selecting = "end"; } else { if (value < control.dataset.draftStart) { control.dataset.draftEnd = control.dataset.draftStart; control.dataset.draftStart = value; } else control.dataset.draftEnd = value; control.dataset.selecting = "start"; } refresh(control); return false; }
      if (event.target.closest("[data-pc-range-cancel]")) { control.classList.remove("open"); return false; }
      if (event.target.closest("[data-pc-range-apply]")) { const start = control.dataset.draftStart, end = control.dataset.draftEnd || start; if (!start) return false; Object.assign(range, { start, end }); control.classList.remove("open"); return true; }
      return false;
    }
  };
  document.addEventListener("click", event => { if (!event.target.closest(".pc-date-range")) closeAll(); });
})();

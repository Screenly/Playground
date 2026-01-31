import { getLocale as g } from "../../utils/locale.js";
const D = async (t = /* @__PURE__ */ new Date(), e = null, s) => {
  const a = e || await g(), r = new Intl.Locale(a);
  let o = "numeric";
  return r.hourCycle && (r.hourCycle === "h12" ? o = "numeric" : o = "2-digit"), t.toLocaleTimeString(a, {
    hour: o,
    minute: "2-digit",
    timeZone: s || "UTC"
  });
}, l = (t, e) => new Date(t, e + 1, 0).getDate(), u = (t, e) => new Date(t, e, 1).getDay(), d = (t, e) => {
  const s = l(t, e), a = u(t, e), r = l(t, e - 1), o = [];
  for (let n = a - 1; n >= 0; n--)
    o.push({
      day: r - n,
      isCurrentMonth: !1
    });
  for (let n = 1; n <= s; n++)
    o.push({
      day: n,
      isCurrentMonth: !0
    });
  const c = 7 - o.length % 7, i = c < 7;
  for (let n = 1; n <= (i ? c : 0); n++)
    o.push({
      day: n,
      isCurrentMonth: !1
    });
  return o;
}, m = (t, e = "en-US") => t.toLocaleDateString(e, { month: "long" }), f = (t) => t.getFullYear(), M = (t) => t.getMonth(), w = (t) => t.getDate(), C = (t, e = "en-US") => t.toLocaleDateString(e, { weekday: "long" }).toUpperCase();
export {
  d as generateCalendarDays,
  w as getDate,
  l as getDaysInMonth,
  u as getFirstDayOfMonth,
  C as getFormattedDayOfWeek,
  m as getFormattedMonthName,
  D as getFormattedTime,
  M as getMonth,
  f as getYear
};
//# sourceMappingURL=calendar.js.map

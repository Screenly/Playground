import { defineComponent as g, computed as l, createElementBlock as d, openBlock as u, createElementVNode as a, toDisplayString as i, Fragment as v, renderList as y, normalizeClass as C } from "vue";
const w = { class: "CalendarOverview secondary-card calendar-overview-card" }, k = { class: "calendar" }, N = { class: "calendar-header" }, O = { class: "calendar-weekdays" }, S = { class: "calendar-grid" }, B = /* @__PURE__ */ g({
  __name: "CalendarOverview",
  props: {
    currentDate: {},
    currentMonthName: {},
    currentYear: {},
    currentMonth: {}
  },
  setup(D) {
    const s = D, M = l(() => s.currentDate), _ = l(() => s.currentMonthName), o = l(() => s.currentYear), m = ["S", "M", "T", "W", "T", "F", "S"], p = l(() => {
      const c = new Date(o.value, s.currentMonth, 1), h = c.getDay(), t = new Date(
        o.value,
        c.getMonth() + 1,
        0
      ).getDate(), n = new Date(
        o.value,
        c.getMonth(),
        0
      ).getDate(), r = [];
      for (let e = h - 1; e >= 0; e--)
        r.push({
          day: n - e,
          isCurrentMonth: !1
        });
      for (let e = 1; e <= t; e++)
        r.push({
          day: e,
          isCurrentMonth: !0
        });
      const f = (7 - r.length % 7) % 7;
      for (let e = 1; e <= f; e++)
        r.push({
          day: e,
          isCurrentMonth: !1
        });
      return r;
    });
    return (c, h) => (u(), d("div", w, [
      a("div", k, [
        a("div", N, i(_.value) + " " + i(o.value), 1),
        a("div", O, [
          (u(), d(v, null, y(m, (t, n) => a("div", { key: n }, i(t), 1)), 64))
        ]),
        a("div", S, [
          (u(!0), d(v, null, y(p.value, (t, n) => (u(), d("div", {
            key: n,
            class: C([
              "calendar-cell",
              { "other-month": !t.isCurrentMonth },
              { "current-day": t.day === M.value && t.isCurrentMonth }
            ])
          }, i(t.day), 3))), 128))
        ])
      ])
    ]));
  }
});
export {
  B as default
};
//# sourceMappingURL=CalendarOverview.vue2.js.map

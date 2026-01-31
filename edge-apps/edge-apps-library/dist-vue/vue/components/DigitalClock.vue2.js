import { defineComponent as D, ref as o, watch as h, onMounted as S, onUnmounted as w, createElementBlock as u, openBlock as p, createElementVNode as I, createCommentVNode as k, toDisplayString as f } from "vue";
const U = { class: "secondary-card-number-container" }, z = { class: "secondary-card-number" }, F = {
  key: 0,
  class: "secondary-card-time-am-pm"
}, O = /* @__PURE__ */ D({
  __name: "DigitalClock",
  props: {
    timezone: { default: "UTC" },
    locale: { default: "en" }
  },
  setup(_) {
    const e = _, m = o("00:00"), a = o("AM"), v = o("00"), T = o("MON");
    let r = null;
    const i = () => {
      if (!e.timezone)
        return;
      const t = /* @__PURE__ */ new Date(), n = new Date(
        t.toLocaleString("en-US", { timeZone: e.timezone })
      ), l = e.locale.replace("_", "-"), s = {
        hour: "2-digit",
        minute: "2-digit"
      };
      let c;
      try {
        c = new Intl.DateTimeFormat(
          l,
          s
        );
      } catch (y) {
        console.warn(
          `Invalid locale "${l}" provided, falling back to "en"`,
          y
        ), c = new Intl.DateTimeFormat("en", s);
      }
      const d = c.format(n).split(" ");
      m.value = d[0] || "", a.value = d[1] || "", v.value = n.getDate().toString();
      const g = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      T.value = g[n.getDay()];
    };
    return h(
      () => e.timezone,
      (t) => {
        t && i();
      },
      { immediate: !0 }
    ), S(() => {
      i(), r = setInterval(i, 1e3);
    }), w(() => {
      r && clearInterval(r);
    }), (t, n) => (p(), u("div", U, [
      I("span", z, f(m.value), 1),
      a.value ? (p(), u("span", F, f(a.value), 1)) : k("", !0)
    ]));
  }
});
export {
  O as default
};
//# sourceMappingURL=DigitalClock.vue2.js.map

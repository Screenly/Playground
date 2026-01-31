import { defineComponent as u, ref as s, onMounted as f, onUnmounted as _, watch as y, createElementBlock as v, openBlock as h, createElementVNode as i, toDisplayString as d } from "vue";
const S = { class: "date-card" }, g = { class: "date-text" }, k = { class: "date-number" }, w = /* @__PURE__ */ u({
  __name: "DateDisplay",
  props: {
    timezone: { default: "UTC" },
    locale: { default: "en" }
  },
  setup(m) {
    const e = m, o = s("00"), n = s("MON");
    let l = null;
    const c = () => {
      if (!e.timezone)
        return;
      const t = /* @__PURE__ */ new Date(), a = typeof e.locale == "string" ? e.locale.replace("_", "-") : "en";
      try {
        n.value = t.toLocaleString(a, {
          timeZone: e.timezone,
          weekday: "short"
        }).toUpperCase().slice(0, 3);
        const r = t.toLocaleString(a, {
          timeZone: e.timezone,
          day: "numeric"
        });
        o.value = r.padStart(2, "0");
      } catch (r) {
        console.warn(
          `Invalid timezone or locale: ${e.timezone}, ${a}, using fallback`,
          r
        ), n.value = t.toLocaleString("en", {
          timeZone: "UTC",
          weekday: "short"
        }).toUpperCase().slice(0, 3);
        const p = t.toLocaleString("en", {
          timeZone: "UTC",
          day: "numeric"
        });
        o.value = p.padStart(2, "0");
      }
    };
    return f(() => {
      c(), l = setInterval(c, 1e3);
    }), _(() => {
      l && clearInterval(l);
    }), y(
      () => [e.timezone, e.locale],
      () => {
        c();
      }
    ), (t, a) => (h(), v("div", S, [
      i("span", g, d(n.value), 1),
      i("span", k, d(o.value), 1)
    ]));
  }
});
export {
  w as default
};
//# sourceMappingURL=DateDisplay.vue2.js.map

import { defineComponent as u, ref as b, onMounted as h, onUnmounted as p, computed as _, createElementBlock as a, openBlock as n, createElementVNode as t, createCommentVNode as c, toDisplayString as i } from "vue";
const f = { class: "top-bar" }, g = { class: "top-bar-left" }, v = {
  key: 0,
  class: "top-bar-logo-container"
}, L = ["src"], k = {
  key: 1,
  class: "top-bar-label"
}, y = { class: "top-bar-right" }, D = { class: "top-bar-datetime" }, B = /* @__PURE__ */ u({
  __name: "TopBar",
  props: {
    brandLogoUrl: {},
    brandLabel: {},
    locale: {},
    timezone: {}
  },
  setup(e) {
    const r = e, s = b(/* @__PURE__ */ new Date());
    let o = null;
    h(() => {
      o = setInterval(() => {
        s.value = /* @__PURE__ */ new Date();
      }, 1e3);
    }), p(() => {
      o && clearInterval(o);
    });
    const d = _(() => {
      const l = s.value;
      return new Intl.DateTimeFormat(r.locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        timeZone: r.timezone
      }).format(l);
    });
    return (l, m) => (n(), a("div", f, [
      t("div", g, [
        e.brandLogoUrl ? (n(), a("div", v, [
          t("img", {
            src: e.brandLogoUrl,
            class: "top-bar-logo",
            alt: "Brand Logo"
          }, null, 8, L)
        ])) : c("", !0),
        e.brandLabel ? (n(), a("span", k, i(e.brandLabel), 1)) : c("", !0)
      ]),
      t("div", y, [
        t("span", D, i(d.value), 1)
      ])
    ]));
  }
});
export {
  B as default
};
//# sourceMappingURL=TopBar.vue2.js.map

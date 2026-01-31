import * as t from "@sentry/vue";
import { getSetting as e } from "../../utils/settings.js";
const r = () => {
  const n = e("sentry_dsn");
  n ? t.init({
    dsn: n
  }) : console.warn("Sentry DSN is not defined. Sentry will not be initialized.");
};
export {
  r as initializeSentrySettings
};
//# sourceMappingURL=sentry.js.map

import { createApp } from "vue";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import router from "./router/index.js";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth/Auth.js";

// Page layouts
import Default from "./layouts/DefaultLayout.vue";
import Empty from "./layouts/EmptyLayout.vue";
import NoSidebar from "./layouts/NoSidebarLayout.vue";

// External dependencies
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import FloatingVue from "floating-vue";

// Css assets
import "./icons";
import "vue3-select-component/styles";
import "./composables/useTheme.js";

// Base components
import BaseDropdown from "/src/components/base/BaseDropdown.vue";
import BaseSelect from "/src/components/base/BaseSelect.vue";
import BaseCheckbox from "/src/components/base/BaseCheckbox.vue";
import BaseRadio from "/src/components/base/BaseRadio.vue";
import BaseMultiSelect from "/src/components/base/BaseMultiSelect.vue";
import StatefulFilter from "/src/components/base/StatefulFilter.vue";
import BaseTable from "/src/components/table/BaseTable.vue";
import BaseNavigationTab from "/src/components/base/BaseNavigationTab.vue";
import BaseCard from "/src/components/base/BaseCard.vue";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia).use(router);

// Les URLs capturées par Sentry (page courante, navigation, fetch/XHR) peuvent porter
// des jetons : reset/confirmation de mot de passe (?token=), inscription d'une recrue
// (#/inscription/{sisKey}/{token}) et formulaire public API (/recrutement/{sisKey}/{token}).
// Aucun ne doit fuiter vers Bugsink.
const redactUrl = (url) =>
  typeof url === "string"
    ? url
        .replace(/\/recrutement\/[^/]+\/[^/?#]+/, "/recrutement/[redacted]")
        .replace(/\/inscription\/[^/]+\/[^/?#]+/, "/inscription/[redacted]")
        .replace(/([?&#]token=)[^&#]*/gi, "$1[redacted]")
    : url;

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    // Relaie les erreurs via l'API plutôt que d'appeler Bugsink directement depuis le navigateur :
    // les bloqueurs de pub/tracker bloquent souvent le motif /api/<id>/envelope/, quel que soit le domaine.
    tunnel: `${import.meta.env.VITE_API_ENDPOINT}/monitoring-tunnel`,
    // Pas de Release Health côté Bugsink : évite le trafic inutile des sessions.
    integrations: (integrations) =>
      integrations.filter((integration) => integration.name !== "BrowserSession"),
    beforeSend(event) {
      if (event.request?.url) {
        event.request.url = redactUrl(event.request.url);
      }
      return event;
    },
    // Breadcrumbs fetch/XHR (data.url) et navigation (data.from / data.to).
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        for (const key of ["url", "from", "to"]) {
          if (breadcrumb.data[key]) {
            breadcrumb.data[key] = redactUrl(breadcrumb.data[key]);
          }
        }
      }
      return breadcrumb;
    },
  });
}

// Initialize auth store after pinia is set up
const authStore = useAuthStore();

router.beforeEach(async (to, from) => {
  if (authStore.sis.liste.length <= 0) {
    try {
      await authStore.verifySession(to.fullPath);
    } catch (e) {
      // authStore.verifySession() a déjà fait logout() + router.push({ name: "login" })
      // via refreshToken() (avec la même destination) ; on renvoie explicitement la
      // redirection pour annuler la navigation en cours.
      return { name: "login", query: { redirect: to.fullPath } };
    }
  }
});

app
  .use(FloatingVue)
  .component("BaseDropdown", BaseDropdown)
  .component("BaseSelect", BaseSelect)
  .component("BaseCheckbox", BaseCheckbox)
  .component("BaseRadio", BaseRadio)
  .component("BaseMultiSelect", BaseMultiSelect)
  .component("StatefulFilter", StatefulFilter)
  .component("BaseTable", BaseTable)
  .component("BaseCard", BaseCard)
  .component("BaseNavigationTab", BaseNavigationTab)
  .component("DefaultLayout", Default)
  .component("EmptyLayout", Empty)
  .component("NoSidebarLayout", NoSidebar)
  .component("FontAwesomeIcon", FontAwesomeIcon)
  .mount("#app");

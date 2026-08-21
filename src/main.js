import { createApp } from "vue";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import router from "./router/index.js";
import { TokenService } from "./services/StorageService.js";
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

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: import.meta.env.VITE_SENTRY_RELEASE,
  });
}

// Initialize auth store after pinia is set up
const authStore = useAuthStore();

router.beforeEach(async (to, from) => {
  if (authStore.sis.liste.length <= 0) {
    // Un échec ici (service auth indisponible, erreur réseau) ne doit pas bloquer
    // toutes les navigations : sans le catch, l'app reste blanche, /login compris
    try {
      await authStore.loadSisListe();
      const user = TokenService.getUser();
      const accessToken = TokenService.getAccessToken();
      const refreshToken = TokenService.getRefreshToken();
      if (accessToken !== null && refreshToken !== null) {
        await authStore.setAuthSuccessful({
          user,
          accessToken,
          refreshToken,
        });
      }
    } catch (e) {
      console.error("Échec de l'initialisation de l'authentification, navigation sans session", e);
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

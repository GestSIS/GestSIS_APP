import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import { TokenService } from './services/StorageService.js';
import { createPinia } from 'pinia';
import { useAuthStore } from './stores/auth/Auth.js';

// Page layouts
import Default from './layouts/DefaultLayout.vue';
import Empty from './layouts/EmptyLayout.vue';
import NoSidebar from './layouts/NoSidebarLayout.vue';

// External dependencies
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import FloatingVue from 'floating-vue';
import VueAWN from './plugins/vue-awesome-notifications';

// Css assets
import './icons';

// Base components
import BaseDropdown from '/src/components/base/BaseDropdown.vue';
import BaseSelect from '/src/components/base/BaseSelect.vue';
import BaseCheckbox from '/src/components/base/BaseCheckbox.vue';
import BaseRadio from '/src/components/base/BaseRadio.vue';
import BaseMultiSelect from '/src/components/base/BaseMultiSelect.vue';
import StatefulFilter from '/src/components/base/StatefulFilter.vue';
import BaseTable from '/src/components/table/BaseTable.vue';
import BaseNavigationTab from '/src/components/base/BaseNavigationTab.vue';
import BaseCard from '/src/components/base/BaseCard.vue';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia).use(router);

// Initialize auth store after pinia is set up
const authStore = useAuthStore();

router.beforeEach((to, from, next) => {
  if (authStore.sis.liste.length <= 0) {
    authStore.loadSisListe().then(() => {
      const user = TokenService.getUser();
      const accessToken = TokenService.getAccessToken();
      const refreshToken = TokenService.getRefreshToken();
      if (accessToken !== null && refreshToken !== null) {
        authStore.setAuthSuccessful({
          user,
          accessToken,
          refreshToken,
        });
      }
      next();
    });
  } else {
    next();
  }
});

app
  .use(VueAWN, {
    labels: {
      success: 'Succès',
      warning: 'Attention',
      alert: 'Erreur',
    },
  })
  .use(FloatingVue);

app
  .component('BaseDropdown', BaseDropdown)
  .component('BaseSelect', BaseSelect)
  .component('BaseCheckbox', BaseCheckbox)
  .component('BaseRadio', BaseRadio)
  .component('BaseMultiSelect', BaseMultiSelect)
  .component('StatefulFilter', StatefulFilter)
  .component('BaseTable', BaseTable)
  .component('BaseCard', BaseCard)
  .component('BaseNavigationTab', BaseNavigationTab)
  .component('DefaultLayout', Default)
  .component('EmptyLayout', Empty)
  .component('NoSidebarLayout', NoSidebar)
  .component('FontAwesomeIcon', FontAwesomeIcon)
  .mount('#app');

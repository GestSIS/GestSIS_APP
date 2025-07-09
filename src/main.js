import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import types from './store/mutationTypes';
import store from './store/index';
import { TokenService } from './services/StorageService.js';
import { createPinia } from 'pinia';

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
import BaseMultiUnselect from '/src/components/base/BaseMultiUnselect.vue';
import StatefulFilter from '/src/components/base/StatefulFilter.vue';
import BaseTable from '/src/components/table/BaseTable.vue';
import BaseNavigationTab from '/src/components/base/BaseNavigationTab.vue';
import BaseCard from './components/table/BaseCard.vue';

router.beforeEach((to, from, next) => {
  if (store.state.auth.sis.liste.length <= 0) {
    store.dispatch('loadSisListe').then(() => {
      const user = TokenService.getUser();
      const accessToken = TokenService.getAccessToken();
      const refreshToken = TokenService.getRefreshToken();
      if (accessToken !== null && refreshToken !== null) {
        store.commit(types.AUTH_SUCCESSFULL, {
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

const pinia = createPinia();
const app = createApp(App);
app
  .use(router)
  .use(store)
  .use(pinia)
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
  .component('BaseMultiUnselect', BaseMultiUnselect)
  .component('StatefulFilter', StatefulFilter)
  .component('BaseTable', BaseTable)
  .component('BaseCard', BaseCard)
  .component('BaseNavigationTab', BaseNavigationTab)
  .component('DefaultLayout', Default)
  .component('EmptyLayout', Empty)
  .component('NoSidebarLayout', NoSidebar)
  .component('FontAwesomeIcon', FontAwesomeIcon)
  .mount('#app');

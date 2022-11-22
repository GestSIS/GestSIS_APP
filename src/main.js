import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import types from './store/mutationTypes';
import store from './store/index';
import { TokenService } from './services/StorageService.js';

// Page layouts
import Default from './layouts/DefaultLayout.vue';
import Empty from './layouts/EmptyLayout.vue';
import NoSidebar from './layouts/NoSidebarLayout.vue';

// External dependencies
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import FloatingVue from 'floating-vue';
// import VueAWN from 'vue-awesome-notifications';
import VueAWN from './plugins/vue-awesome-notifications';

// External css dependencies

// Css assets
// import './assets/sass/main.scss';
import './icons';

// import bootstrap from 'bootstrap';

// Base components
import BaseDropdown from '@/components/base/BaseDropdown.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import BaseRadio from '@/components/base/BaseRadio.vue';
import BaseMultiUnselect from '@/components/base/BaseMultiUnselect.vue';
import BaseTable from '@/components/table/BaseTable.vue';

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

// {
//   created() {
//     // console.log('Created !')
//     // TODO might be improved by checking that token is still valid when launching app
//     // const user = TokenService.getUser();
//     // const accessToken = TokenService.getAccessToken();
//     // const refreshToken = TokenService.getRefreshToken();
//     // await this.$store.dispatch('loadSisListe').then(() => {
//     //   if (accessToken !== null && refreshToken !== null) {
//     //     return this.$store.commit(types.AUTH_SUCCESSFULL, {
//     //       user,
//     //       accessToken,
//     //       refreshToken,
//     //     });
//     //   }
//     // })
//   },

//   render: () => h(App),
// }
const app = createApp(App);
app.use(router);
app.use(store);
app.use(VueAWN, {
  labels: {
    success: 'Succès',
    warning: 'Attention',
    alert: 'Erreur',
  },
});
app.use(FloatingVue);

// Object.entries(import.meta.globEager('./modal/*.vue')).forEach(
//   ([key, value]) => {
//     const name = key.match(/\w+/)[0];
//     app.component(letterToUpperCase(key), defineAsyncComponent(value));
//   }
// );

app.component('BaseDropdown', BaseDropdown);
app.component('BaseSelect', BaseSelect);
app.component('BaseCheckbox', BaseCheckbox);
app.component('BaseRadio', BaseRadio);
app.component('BaseMultiUnselect', BaseMultiUnselect);
app.component('BaseTable', BaseTable);
app.component('DefaultLayout', Default);
app.component('EmptyLayout', Empty);
app.component('NoSidebarLayout', NoSidebar);
app.component('FontAwesomeIcon', FontAwesomeIcon);

app.mount('#app');

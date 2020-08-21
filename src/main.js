import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import { TokenService } from './services/StorageService';

import Default from './layouts/Default';
import NoSidebar from './layouts/NoSidebar';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Tooltip from 'vue-directive-tooltip';
import VueTimepicker from 'vue2-timepicker';
import Datetime from 'vue-datetime';
import VueAWN from 'vue-awesome-notifications';
import types from './store/mutationTypes';

import 'vue-directive-tooltip/src/css/index.scss';
import 'nprogress/nprogress.css';
require('./assets/sass/main.scss');
require('./icons');

// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css';

Vue.component('datetime', Datetime);
Vue.component('default-layout', Default);
Vue.component('no-sidebar-layout', NoSidebar);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('vue-timepicker', VueTimepicker);

Vue.config.productionTip = false;

Vue.use(VueAWN, {});
Vue.use(Tooltip);
Vue.use(Datetime);
//Vue.use(VueTimepicker)

Vue.filter('sapeur', function(sapeur) {
  if (!sapeur) return '';
  return sapeur.nom + ' ' + sapeur.prenom;
});

Vue.filter('compte', function(compte) {
  if (!compte) return '';
  return compte.numero + ' - ' + compte.designation;
});

new Vue({
  router,
  store,
  created() {
    // TODO might be improved by checking that token is still valid when launching app
    const user = TokenService.getUser();
    const accessToken = TokenService.getAccessToken();
    const refreshToken = TokenService.getRefreshToken();
    this.$store.commit(types.AUTH_SUCCESSFULL, {
      user,
      accessToken,
      refreshToken
    });
  },
  render: h => h(App)
}).$mount('#app');

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'

import Default from './layouts/Default'
import NoSidebar from './layouts/NoSidebar'

require('./assets/sass/main.scss')

Vue.component('default-layout', Default)
Vue.component('no-sidebar-layout', NoSidebar)

Vue.config.productionTip = false

require('./icons')

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.component('font-awesome-icon', FontAwesomeIcon)

import Tooltip from 'vue-directive-tooltip';
import 'vue-directive-tooltip/css/index.css';
Vue.use(Tooltip);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'

import Default from './layouts/Default'
import NoSidebar from './layouts/NoSidebar'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Tooltip from 'vue-directive-tooltip'
import { GridPlugin } from '@syncfusion/ej2-vue-grids'

import 'vue-directive-tooltip/css/index.css'
require('./assets/sass/main.scss')
require('./icons')

Vue.component('default-layout', Default)
Vue.component('no-sidebar-layout', NoSidebar)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.use(Tooltip)
Vue.use(GridPlugin)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

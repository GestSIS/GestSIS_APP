import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index'

import Default from './layouts/Default'
import NoSidebar from './layouts/NoSidebar'

require('./assets/sass/main.scss')

import 'bootstrap/dist/css/bootstrap.min.css'

Vue.component('default-layout', Default)
Vue.component('no-sidebar-layout', NoSidebar)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

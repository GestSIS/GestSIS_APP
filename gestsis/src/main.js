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

import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser, faFireExtinguisher, faCalendarAlt, faSitemap, faCalculator, faHandHoldingUsd, faEnvelope, faToolbox, faFileMedicalAlt, faSlidersH, faGlobeEurope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faUser, faFireExtinguisher, faCalendarAlt, faSitemap, faCalculator, faHandHoldingUsd, faEnvelope, faToolbox, faFileMedicalAlt, faSlidersH, faGlobeEurope)

Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

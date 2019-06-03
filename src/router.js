import Vue from 'vue'
import Router from 'vue-router'
import Home from './pages/Home'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { layout: 'no-sidebar' },
      component: () =>
        import(/* webpackChunkName: "about" */ '@/pages/Login.vue')
    },
    {
      path: '/',
      name: 'home',
      meta: { layout: 'no-sidebar' },
      component: Home
    },
    {
      path: '/sapeurs',
      name: 'sapeurs',
      component: () => import('@/pages/Sapeurs.vue')
    },
    {
      path: '/sapeurs/:id',
      name: 'sapeurs-details',
      props: true,
      component: () => import('@/pages/Sapeurs.vue')
    },
    {
      path: '/exercices/:id',
      name: 'exercice',
      props: true,
      component: () => import('@/pages/Exercice.vue')
    },
    {
      path: '/exercices',
      name: 'exercices',
      component: () => import('@/pages/Exercices.vue')
    }
  ]
})

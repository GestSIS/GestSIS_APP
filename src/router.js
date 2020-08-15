import Vue from 'vue';
import Router from 'vue-router';
import Home from './pages/Home';

import { TokenService } from './services/StorageService';

import NProgress from 'nprogress';

Vue.use(Router);

const router = new Router({
  //mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { layout: 'no-sidebar', public: true, onlyWhenLoggedOut: true },
      component: () =>
        import(/* webpackChunkName: "about" */ '@/pages/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      meta: { layout: 'no-sidebar', public: true, onlyWhenLoggedOut: true },
      component: () =>
        import(/* webpackChunkName: "about" */ '@/pages/Register.vue')
    },
    {
      path: '/',
      name: 'home',
      meta: { layout: 'no-sidebar', public: true },
      component: Home
    },
    {
      path: '/sapeurs',
      name: 'sapeurs',
      component: () => import('@/pages/Sapeurs.vue'),
      children: [
        {
          path: ':id',
          component: () => import('@/components/sapeur/SapeurDetails.vue'),
          props: true
        }
      ]
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
    },
    {
      path: '/organisation',
      name: 'organisation',
      component: () => import('@/pages/Organisation.vue')
    },
    {
      path: '/interventions/:id',
      name: 'intervention',
      props: true,
      component: () => import('@/pages/Intervention.vue')
    },
    {
      path: '/interventions',
      name: 'interventions',
      component: () => import('@/pages/Interventions.vue')
    },
    {
      path: '/frais',
      name: 'frais',
      component: () => import('@/pages/Frais.vue')
    },
    {
      path: '/controles-medicaux',
      name: 'controles-medicaux',
      component: () => import('@/pages/ControlesMedicaux.vue')
    },
    {
      path: '/controles-medicaux/:id',
      name: 'controle-medical',
      props: true,
      component: () => import('@/pages/ControleMedical.vue')
    },
    {
      path: '/configuration',
      name: 'configuration',
      component: () => import('@/pages/Configuration.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/About.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public);
  const onlyWhenLoggedOut = to.matched.some(
    record => record.meta.onlyWhenLoggedOut
  );
  const loggedIn = !!TokenService.getAccessToken();

  if (!isPublic && !loggedIn) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath } // Store the full path to redirect the user to after login
    });
  }

  // Do not allow user to visit login page or register page if they are logged in
  if (loggedIn && onlyWhenLoggedOut) {
    return next('/');
  }

  next();
});

router.beforeEach((routeTo, routeFrom, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;

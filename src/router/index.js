import Vue from 'vue';
import Router from 'vue-router';
import Public from '@/pages/Public';
import Home from '@/pages/Home';

import { TokenService } from '@/services/StorageService';

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
        import(/* webpackChunkName: "about" */ '@/pages/Login.vue'),
    },
    {
      path: '/confirmation',
      name: 'confirmation',
      meta: { layout: 'no-sidebar', public: true },
      component: () =>
        import(/* webpackChunkName: "about" */ '@/pages/Confirmation.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { layout: 'no-sidebar', public: true, onlyWhenLoggedOut: true },
      component: () =>
        import(/* webpackChunkName: "about" */ '@/pages/Register.vue'),
    },
    {
      path: '/',
      name: 'public',
      meta: { layout: 'empty', public: true },
      component: Public,
    },
    {
      path: '/home',
      name: 'public',
      meta: { layout: 'empty', public: true },
      component: Public,
    },
    {
      path: '/accueil',
      name: 'accueil',
      meta: { layout: 'no-sidebar'},
      component: Home,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
    },
    {
      path: '/sapeurs',
      name: 'sapeurs',
      component: () => import('@/pages/Sapeurs.vue'),
      children: [
        {
          path: ':id',
          name: 'sapeurs-details',
          component: () => import('@/components/sapeur/SapeurDetails.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/exercices/:id',
      name: 'exercice',
      props: true,
      component: () => import('@/pages/Exercice.vue'),
    },
    {
      path: '/exercices',
      name: 'exercices',
      component: () => import('@/pages/Exercices.vue'),
    },
    {
      path: '/organisation',
      name: 'organisation',
      component: () => import('@/pages/Organisation.vue'),
    },
    {
      path: '/interventions/:id',
      name: 'intervention',
      props: true,
      component: () => import('@/pages/Intervention.vue'),
    },
    {
      path: '/interventions',
      name: 'interventions',
      component: () => import('@/pages/Interventions.vue'),
    },
    {
      path: '/comptabilite',
      name: 'comptabilite',
      component: () => import('@/pages/Comptabilite.vue'),
      children: [
        {
          path: '',
          name: 'comptabilite-decompte',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabDecomptes.vue'),
        },
        {
          path: 'comptes',
          name: 'comptabilite-compte',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabComptes.vue'),
        },
        {
          path: 'exercices',
          name: 'comptabilite-exercice',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabExercice.vue'),
        },
        {
          path: 'interventions',
          name: 'comptabilite-intervention',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabIntervention.vue'),
        },
        {
          path: 'annuel',
          name: 'comptabilite-annuel',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabAnnuel.vue'),
        },
        {
          path: 'sapeurs',
          name: 'comptabilite-sapeurs',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabSapeur.vue'),
        },
        {
          path: 'amendes',
          name: 'comptabilite-amendes',
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabAmendes.vue'),
        },
      ],
    },
    {
      path: '/Publipostage',
      name: 'publipostage',
      component: () => import('@/pages/Publipostage.vue'),
    },
    {
      path: '/statistique',
      name: 'statistique',
      component: () => import('@/pages/Statistique.vue'),
    },
    {
      path: '/controles-medicaux',
      name: 'controles-medicaux',
      component: () => import('@/pages/ControlesMedicaux.vue'),
    },
    {
      path: '/controles-medicaux/:id',
      name: 'controle-medical',
      props: true,
      component: () => import('@/pages/ControleMedical.vue'),
    },
    {
      path: '/utilisateurs',
      name: 'users',
      props: true,
      component: () => import('@/pages/Utilisateurs.vue'),
    },
    {
      path: '/configuration',
      name: 'configuration',
      component: () => import('@/pages/Configuration.vue'),
      children: [
        {
          path: '',
          name: 'param-general',
          meta: { },
          component: () =>
            import('@/components/parametres/ParametreTabGeneral.vue'),
        },
        {
          path: 'exercice-comptable',
          name: 'param-exercice-comptable',
          component: () =>
            import('@/components/parametres/ParametreTabExerciceComptable.vue'),
        },
        {
          path: 'sapeur',
          name: 'param-sapeur',
          component: () =>
            import('@/components/parametres/ParametreTabSapeur.vue'),
        },
        {
          path: 'exercice',
          name: 'param-exercice',
          component: () =>
            import('@/components/parametres/ParametreTabExercice.vue'),
        },
        {
          path: 'intervention',
          name: 'param-intervention',
          component: () =>
            import('@/components/parametres/ParametreTabIntervention.vue'),
        },
        {
          path: 'frais',
          name: 'param-frais',
          component: () =>
            import('@/components/parametres/ParametreTabComptabilite.vue'),
        },
        {
          path: 'controle-medical',
          name: 'param-controle-medical',
          component: () =>
            import('@/components/parametres/ParametreTabControleMedical.vue'),
        },
        {
          path: 'roles',
          name: 'param-roles',
          component: () =>
            import('@/components/parametres/ParametreTabRole.vue'),
        },
      ],
    },
    {
      path: '/rta',
      name: 'rta',
      component: () => import('@/pages/Rta.vue'),
      redirect: { name: 'rta-mutations' },
      children: [
        {
          path: 'mutations',
          name: 'rta-mutations',
          component: () =>
            import('@/components/rta/Mutations.vue'),
        },
        {
          path: 'reference',
          name: 'rta-reference',
          component: () =>
            import('@/components/rta/Reference.vue'),
        },
        {
          path: 'gestsis',
          name: 'rta-gestsis',
          component: () =>
            import('@/components/rta/GestSis.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/About.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  NProgress.start();

  const isPublic = to.matched.some((record) => record.meta.public);
  const onlyWhenLoggedOut = to.matched.some(
    (record) => record.meta.onlyWhenLoggedOut
  );
  const loggedIn = !!TokenService.getAccessToken();

  if (!isPublic && !loggedIn) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath }, // Store the full path to redirect the user to after login
    });
  }

  // Do not allow user to visit login page or register page if they are logged in
  if (loggedIn && onlyWhenLoggedOut) {
    return next({
      name: 'accueil',
      query: { redirect: to.fullPath }, // Store the full path to redirect the user to after login
    });
  }

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;

import { createRouter, createWebHashHistory } from 'vue-router';
import Public from '@/pages/PagePublic.vue';
import Home from '@/pages/PageHome.vue';
import store from '@/store/index';
import permissions from '@/store/permissions.js';

import { TokenService } from '@/services/StorageService.js';

import NProgress from 'nprogress';

const permissionGuard = (permission) => {
  return function (to, from, next) {
    try {
      const isAdmin = store.state.auth.admin;
      const permissions = store.state.auth.sis.permissions;
      if (permissions.includes(permission) || isAdmin) {
        next();
      }
    } catch (e) {
      //TODO: Check if logged in, if NOT so redirect to login

      // Otherwise, redirect to dashboard
      next({
        name: 'dashboard', // back to safety route //
        query: { redirectFrom: to.fullPath },
      });
    }
  };
};

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { layout: 'empty', public: true, onlyWhenLoggedOut: true },
      component: () => import('@/pages/PageLogin.vue'),
    },
    {
      path: '/confirmation',
      name: 'confirmation',
      meta: { layout: 'no-sidebar', public: true },
      component: () => import('@/pages/PageConfirmation.vue'),
    },
    {
      path: '/reset-mdp',
      name: 'reset-password',
      meta: { layout: 'no-sidebar', public: true },
      component: () => import('@/pages/PageResetPassword.vue'),
    },
    {
      path: '/mdp-oublie',
      name: 'forgotten-password',
      meta: { layout: 'no-sidebar', public: true },
      component: () => import('@/pages/PageForgottenPassword.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { layout: 'empty', public: true, onlyWhenLoggedOut: true },
      component: () => import('@/pages/PageRegister.vue'),
    },
    {
      path: '/',
      name: 'public',
      meta: { layout: 'empty', public: true },
      component: Public,
    },
    {
      path: '/accueil',
      name: 'accueil',
      meta: { layout: 'no-sidebar' },
      component: Home,
    },
    {
      path: '/utilisateur',
      name: 'utilisateur',
      meta: { layout: 'no-sidebar' },
      component: () => import('@/pages/PageUser.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/PageDashboard.vue'),
    },
    {
      path: '/sapeurs',
      name: 'sapeurs',
      beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
      component: () => import('@/pages/PageSapeurs.vue'),
      children: [
        {
          path: ':id',
          name: 'sapeurs-details',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('@/components/sapeur/SapeurDetails.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/effectif',
      name: 'effectif',
      beforeEnter: permissionGuard(permissions.EFFECTIF.TOUT),
      component: () => import('@/pages/PageEffectif.vue'),
    },
    {
      path: '/exercices/:id',
      name: 'exercice',
      beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
      props: true,
      component: () => import('@/pages/PageExercice.vue'),
    },
    {
      path: '/exercices',
      name: 'exercices',
      beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
      component: () => import('@/pages/PageExercices.vue'),
    },
    {
      path: '/organisation',
      name: 'organisation',
      beforeEnter: permissionGuard(permissions.ORGANISATION.MODIFICATION),
      component: () => import('@/pages/PageOrganisation.vue'),
    },
    {
      path: '/interventions/:id',
      name: 'intervention',
      beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
      props: true,
      component: () => import('@/pages/PageIntervention.vue'),
    },
    {
      path: '/interventions',
      name: 'interventions',
      beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
      component: () => import('@/pages/PageInterventions.vue'),
    },
    {
      path: '/comptabilite',
      name: 'comptabilite',
      beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
      component: () => import('@/pages/PageComptabilite.vue'),
      children: [
        {
          path: '',
          name: 'comptabilite-decompte',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabDecomptes.vue'),
        },
        {
          path: 'comptes',
          name: 'comptabilite-compte',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabComptes.vue'),
        },
        {
          path: 'exercices',
          name: 'comptabilite-exercice',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabExercice.vue'),
        },
        {
          path: 'interventions',
          name: 'comptabilite-intervention',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabIntervention.vue'),
        },
        {
          path: 'annuel',
          name: 'comptabilite-annuel',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabAnnuel.vue'),
        },
        {
          path: 'sapeurs',
          name: 'comptabilite-sapeurs',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabSapeur.vue'),
        },
        {
          path: 'divers',
          name: 'comptabilite-divers',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabDivers.vue'),
        },
        {
          path: 'amendes',
          name: 'comptabilite-amendes',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.TOUT),
          component: () =>
            import('@/components/comptabilite/ComptabiliteTabAmendes.vue'),
        },
      ],
    },
    {
      path: '/publipostage',
      name: 'publipostage',
      component: () => import('@/pages/PagePublipostage.vue'),
      beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
    },
    {
      path: '/statistique',
      name: 'statistique',
      component: () => import('@/pages/PageStatistique.vue'),
      children: [
        {
          path: '',
          name: 'stat-dashboard',
          meta: {},
          component: () => import('@/components/statistique/StatDashboard.vue'),
        },
        {
          path: 'exercice',
          name: 'stat-exercice-simple',
          meta: {},
          component: () => import('@/components/statistique/StatExercice.vue'),
        },
        {
          path: 'exercice-presence',
          name: 'stat-exercice-presence',
          meta: {},
          component: () =>
            import('@/components/statistique/StatExercicePresence.vue'),
        },
        {
          path: 'intervention',
          name: 'stat-intervention',
          meta: {},
          component: () =>
            import('@/components/statistique/StatIntervention.vue'),
        },
      ],
    },
    {
      path: '/controles-medicaux',
      name: 'controles-medicaux',
      beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.TOUT),
      component: () => import('@/pages/PageControlesMedicaux.vue'),
    },
    {
      path: '/controles-medicaux/:id',
      name: 'controle-medical',
      beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.TOUT),
      props: true,
      component: () => import('@/pages/PageControleMedical.vue'),
    },
    {
      path: '/materiel-personnel',
      name: 'materiel-personnel',
      beforeEnter: permissionGuard(permissions.MATERIEL_PERSONNEL.LECTURE),
      component: () => import('@/pages/PageMaterielPersonnel.vue'),
      children: [
        {
          path: '',
          name: 'mat-perso-dashboard',
          beforeEnter: permissionGuard(permissions.MATERIEL_PERSONNEL.LECTURE),
          meta: {},
          component: () =>
            import('@/components/materiel_personnel/MaterielTabDashboard.vue'),
        },
        {
          path: 'attribution',
          name: 'mat-perso-materiel',
          beforeEnter: permissionGuard(permissions.MATERIEL_PERSONNEL.LECTURE),
          meta: {},
          component: () =>
            import(
              '@/components/materiel_personnel/MaterielTabAttribution.vue'
            ),
        },
        {
          path: 'inventaire',
          name: 'mat-perso-inventaire',
          beforeEnter: permissionGuard(permissions.MATERIEL_PERSONNEL.LECTURE),
          meta: {},
          component: () =>
            import('@/components/materiel_personnel/MaterielTabInventaire.vue'),
        },
      ],
    },
    {
      path: '/utilisateurs',
      name: 'users',
      beforeEnter: permissionGuard(permissions.ADMIN.TOUT),
      props: true,
      component: () => import('@/pages/PageUtilisateurs.vue'),
    },
    {
      path: '/configuration',
      name: 'configuration',
      beforeEnter: permissionGuard(permissions.SIS.CONFIG),
      component: () => import('@/pages/PageConfiguration.vue'),
      children: [
        {
          path: '',
          name: 'param-general',
          beforeEnter: permissionGuard(permissions.SIS.CONFIG),
          meta: {},
          component: () =>
            import('@/components/parametres/ParametreTabGeneral.vue'),
        },
        {
          path: 'exercice-comptable',
          name: 'param-exercice-comptable',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabExerciceComptable.vue'),
        },
        {
          path: 'sapeur',
          name: 'param-sapeur',
          beforeEnter: permissionGuard(permissions.SAPEUR.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabSapeur.vue'),
        },
        {
          path: 'exercice',
          name: 'param-exercice',
          beforeEnter: permissionGuard(permissions.EXERCICE.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabExercice.vue'),
        },
        {
          path: 'intervention',
          name: 'param-intervention',
          beforeEnter: permissionGuard(permissions.INTERVENTION.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabIntervention.vue'),
        },
        {
          path: 'comptabilite',
          name: 'param-comptabilite',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabComptabilite.vue'),
        },
        {
          path: 'controle-medical',
          name: 'param-controle-medical',
          beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabControleMedical.vue'),
        },
        {
          path: 'materiel-personnel',
          name: 'param-materiel-personnel',
          beforeEnter: permissionGuard(permissions.MATERIEL_PERSONNEL.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabMaterielPersonnel.vue'),
        },
        {
          path: 'roles',
          name: 'param-roles',
          beforeEnter: permissionGuard(permissions.UTILISATEUR.CONFIG),
          component: () =>
            import('@/components/parametres/ParametreTabRole.vue'),
        },
      ],
    },
    {
      path: '/rta',
      name: 'rta',
      beforeEnter: permissionGuard(permissions.ORGANISATION.MODIFICATION),
      component: () =>
        import(/* webpackChunkName: "rta" */ '@/pages/PageRta.vue'),
      redirect: { name: 'rta-mutations' },
      children: [
        {
          path: 'mutations',
          name: 'rta-mutations',
          beforeEnter: permissionGuard(permissions.ORGANISATION.MODIFICATION),
          component: () =>
            import(
              /* webpackChunkName: "rta" */ '@/components/rta/MutationsRta.vue'
            ),
        },
        {
          path: 'reference',
          name: 'rta-reference',
          beforeEnter: permissionGuard(permissions.ORGANISATION.MODIFICATION),
          component: () =>
            import(
              /* webpackChunkName: "rta" */ '@/components/rta/ReferenceRta.vue'
            ),
        },
        {
          path: 'gestsis',
          name: 'rta-gestsis',
          beforeEnter: permissionGuard(permissions.ORGANISATION.MODIFICATION),
          component: () =>
            import(
              /* webpackChunkName: "rta" */ '@/components/rta/GestSisRta.vue'
            ),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/PageAbout.vue'),
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

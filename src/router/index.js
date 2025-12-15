import { createRouter, createWebHashHistory } from 'vue-router';
import Public from '../pages/PagePublic.vue';
import Home from '../pages/PageHome.vue';
import permissions from '../composables/permissions.js';
import { useAuthStore } from '../stores/auth/Auth.js';

import { TokenService } from '../services/StorageService.js';

import NProgress from 'nprogress';
import useHasPermission from '../composables/usePermission.js';
import PageTravaux from '../pages/PageTravaux.vue';


const redirect = (to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = !!authStore.user;
  if (isLoggedIn) {
    next({
      name: 'dashboard', // back to safety route //
      query: { redirectFrom: to.fullPath },
    });
  } else {
    next({
      name: 'login', // back to safety route //
      query: { redirectFrom: to.fullPath },
    });
  }
};

const adminGuard = () => {
  return function (to, from, next) {
    const authStore = useAuthStore();
    const isAdmin = authStore.admin;
    if (isAdmin) {
      next();
    } else {
      next({ name: 'accueil' });
    }
  };
};


const travauxGuard = () => {
  return function (to, from, next) {
    const authStore = useAuthStore();
    const isAdmin = authStore.admin;
    if (isAdmin) {
      next();
    } else {
      next({ name: 'en-travaux' });
    }
  };
};


const permissionGuard = (...perms) => {
  return function (to, from, next) {
    if (useHasPermission(perms).value) {
      next();
    } else {
      redirect(to, from, next);
    }
  };
};

const sapeurGuard = () => {
  return function (to, from, next) {
    const authStore = useAuthStore();
    const isSapeur = authStore.sapeurId != null;
    if (isSapeur) {
      next();
    } else {
      redirect(to, from, next);
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
      component: () => import('/src/pages/PageLogin.vue'),
    },
    {
      path: '/confirmation',
      name: 'confirmation',
      meta: { layout: 'no-sidebar', public: true },
      component: () => import('/src/pages/PageConfirmation.vue'),
    },
    {
      path: '/reset-mdp',
      name: 'reset-password',
      meta: { layout: 'no-sidebar', public: true },
      component: () => import('/src/pages/PageResetPassword.vue'),
    },
    {
      path: '/mdp-oublie',
      name: 'forgotten-password',
      meta: { layout: 'no-sidebar', public: true },
      component: () => import('/src/pages/PageForgottenPassword.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { layout: 'empty', public: true, onlyWhenLoggedOut: true },
      component: () => import('/src/pages/PageRegister.vue'),
    },
    {
      path: '/',
      name: 'public',
      meta: { layout: 'empty', public: true },
      component: Public,
    },
    {
      path: '/en-travaux',
      name: 'en-travaux',
      component: () => import('/src/pages/PageEnTravaux.vue'),
    },
    {
      path: '/accueil',
      name: 'accueil',
      meta: { layout: 'no-sidebar' },
      component: Home,
    },
    {
      path: '/mes-infos',
      name: 'mon-dashboard',
      component: () => import('/src/pages/PageMesInfos.vue'),
      beforeEnter: sapeurGuard(),
      children: [
        {
          path: '',
          name: 'mes-infos',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesInfos.vue'),
        },
        {
          path: 'exercices',
          name: 'mes-exercices',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesExercices.vue'),
        },
        {
          path: 'interventions',
          name: 'mes-interventions',
          beforeEnter: sapeurGuard(),
          component: () =>
            import('/src/components/mes_infos/MesInterventions.vue'),
        },
        {
          path: 'absences',
          name: 'mes-absences',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesAbsences.vue'),
        },
        {
          path: 'materiel',
          name: 'mon-materiel',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MonMateriel.vue'),
        },
        {
          path: 'travaux',
          name: 'mes-travaux',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesTravaux.vue'),
        },
        {
          path: 'decomptes',
          name: 'mes-decomptes',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesDecomptes.vue'),
        },
        {
          path: 'controles-medicaux',
          name: 'mes-controles-medicaux',
          beforeEnter: sapeurGuard(),
          component: () =>
            import('/src/components/mes_infos/MesControlesMedicaux.vue'),
        },
        {
          path: 'cours',
          name: 'mes-cours',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesCours.vue'),
        },
        {
          path: 'fonctions',
          name: 'mes-fonctions',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesFonctions.vue'),
        },
        {
          path: 'grades',
          name: 'mes-grades',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesGrades.vue'),
        },
        {
          path: 'groupes',
          name: 'mes-groupes',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesGroupes.vue'),
        },
        {
          path: 'mutations',
          name: 'mes-mutations',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesMutations.vue'),
        },
        {
          path: 'permis',
          name: 'mes-permis',
          beforeEnter: sapeurGuard(),
          component: () => import('/src/components/mes_infos/MesPermis.vue'),
        },
      ],
    },
    {
      path: '/utilisateur',
      name: 'utilisateur',
      meta: { layout: 'no-sidebar' },
      component: () => import('/src/pages/PageUser.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('/src/pages/PageDashboard.vue'),
    },
    {
      path: '/sapeurs/:id',
      name: 'sapeur-index',
      beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
      component: () => import('/src/pages/PageSapeurs.vue'),
      props: true,
      children: [
        {
          path: 'details',
          name: 'sapeur-details',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurTabGeneral.vue'),
        },
        {
          path: 'mutations',
          name: 'sapeur-mutations',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurMutations.vue'),
        },
        {
          path: 'controles-medicaux',
          name: 'sapeur-controles-medicaux',
          beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.TOUT),
          component: () =>
            import('../components/sapeur/SapeurControlesMedicaux.vue'),
        },
        {
          path: 'fonctions',
          name: 'sapeur-fonctions',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurFonction.vue'),
        },
        {
          path: 'cours',
          name: 'sapeur-cours',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurCours.vue'),
        },
        {
          path: 'promotions',
          name: 'sapeur-promotions',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurPromotion.vue'),
        },
        {
          path: 'materiels',
          name: 'sapeur-materiels',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurMateriel.vue'),
        },
        {
          path: 'organisation',
          name: 'sapeur-organisation',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () =>
            import('../components/sapeur/SapeurOrganisation.vue'),
        },
        {
          path: 'permis',
          name: 'sapeur-permis',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurPermis.vue'),
        },
        {
          path: 'banque',
          name: 'sapeur-banque',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurBanque.vue'),
        },
        {
          path: 'exercices',
          name: 'sapeur-exercices',
          beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
          component: () => import('../components/sapeur/SapeurExercice.vue'),
        },
      ],
    },
    {
      path: '/effectif',
      name: 'effectif',
      beforeEnter: permissionGuard(permissions.EFFECTIF.TOUT),
      component: () => import('/src/pages/PageEffectif.vue'),
    },
    {
      path: '/exercices/:id',
      beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
      props: true,
      component: () => import('/src/pages/PageExercice.vue'),
      children: [
        {
          path: '',
          name: 'exercice-details',
          props: true,
          beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
          component: () =>
            import('../components/exercice/ExerciceTabGeneral.vue'),
        },
        {
          path: 'presence',
          name: 'exercice-presence',
          props: true,
          beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
          component: () =>
            import('../components/exercice/ExerciceTabSapeurs.vue'),
        },
        {
          path: 'sms',
          name: 'exercice-sms',
          props: true,
          beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
          component: () => import('../components/exercice/ExerciceTabSms.vue'),
        },
      ],
    },
    {
      path: '/exercices',
      beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
      component: () => import('/src/pages/PageExercices.vue'),
      children: [
        {
          path: '',
          name: 'exercices',
          beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
          component: () => import('/src/components/exercice/ExerciceListe.vue'),
        },
        {
          path: 'absences',
          name: 'exercices-absences',
          beforeEnter: permissionGuard(permissions.EXERCICE.LECTURE),
          component: () =>
            import('/src/components/exercice/ExerciceAbsences.vue'),
        },
      ],
    },
    {
      path: '/absences',
      beforeEnter: permissionGuard(permissions.ABSENCE.LECTURE),
      component: () => import('/src/pages/PageAbsences.vue'),
      children: [
        {
          path: '',
          name: 'absences',
          beforeEnter: permissionGuard(permissions.ABSENCE.LECTURE),
          component: () =>
            import('/src/components/absence/AbsenceDashboard.vue'),
        },
        {
          path: 'liste',
          name: 'absences-liste',
          beforeEnter: permissionGuard(permissions.ABSENCE.LECTURE),
          component: () => import('/src/components/absence/AbsenceListe.vue'),
        },
      ],
    },
    {
      path: '/cours',
      name: 'cours',
      beforeEnter: permissionGuard(permissions.COURS.LECTURE),
      component: () => import('/src/pages/PageCours.vue'),
    },
    {
      path: '/fiche-travail',
      name: 'fiche-travail',
      beforeEnter: permissionGuard(
        permissions.FICHE_TRAVAIL.LECTURE,
        permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
        permissions.FICHE_TRAVAIL.SAISIE_PERSO
      ),
      component: () => import('/src/pages/PageTravaux.vue'),
    },
    {
      path: '/organisation',
      name: 'organisation',
      beforeEnter: permissionGuard(permissions.ORGANISATION.MODIFICATION),
      component: () => import('/src/pages/PageOrganisation.vue'),
    },
    {
      path: '/interventions/:id',
      beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
      props: true,
      component: () => import('/src/pages/PageIntervention.vue'),
      children: [
        {
          path: '',
          name: 'intervention-details',
          props: true,
          beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
          component: () =>
            import('/src/components/intervention/InterventionTabGeneral.vue'),
        },
        {
          path: 'resume',
          name: 'intervention-resume',
          props: true,
          beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
          component: () =>
            import('/src/components/intervention/InterventionTabResume.vue'),
        },
        {
          path: 'presence',
          name: 'intervention-presence',
          props: true,
          beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
          component: () =>
            import('/src/components/intervention/InterventionTabSapeurs.vue'),
        },
        {
          path: 'journal',
          name: 'intervention-journal',
          props: true,
          beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
          component: () =>
            import('/src/components/intervention/InterventionTabJournal.vue'),
        },
        {
          path: 'materiel-vehicule',
          name: 'intervention-materiel-vehicule',
          props: true,
          beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
          component: () =>
            import(
              '/src/components/intervention/InterventionTabMaterielVehicule.vue'
            ),
        },
      ],
    },
    {
      path: '/interventions',
      name: 'interventions',
      beforeEnter: permissionGuard(permissions.INTERVENTION.LECTURE),
      component: () => import('/src/pages/PageInterventions.vue'),
    },
    {
      path: '/comptabilite',
      name: 'comptabilite',
      beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
      component: () => import('/src/pages/PageComptabilite.vue'),
      children: [
        {
          path: '',
          name: 'comptabilite-decompte',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabDecomptes.vue'),
        },
        {
          path: 'comptes',
          name: 'comptabilite-compte',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabComptes.vue'),
        },
        {
          path: 'exercices',
          name: 'comptabilite-exercice',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabExercice.vue'),
        },
        {
          path: 'interventions',
          name: 'comptabilite-intervention',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import(
              '/src/components/comptabilite/ComptabiliteTabIntervention.vue'
            ),
        },
        {
          path: 'cours',
          name: 'comptabilite-cours',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabCours.vue'),
        },
        {
          path: 'travaux',
          name: 'comptabilite-travaux',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabTravaux.vue'),
        },
        {
          path: 'annuel',
          name: 'comptabilite-annuel',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabAnnuel.vue'),
        },
        {
          path: 'sapeurs',
          name: 'comptabilite-sapeurs',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabSapeur.vue'),
        },
        {
          path: 'divers',
          name: 'comptabilite-divers',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabDivers.vue'),
        },
        {
          path: 'amendes',
          name: 'comptabilite-amendes',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.LECTURE),
          component: () =>
            import('/src/components/comptabilite/ComptabiliteTabAmendes.vue'),
        },
      ],
    },
    {
      path: '/publipostage',
      name: 'publipostage',
      component: () => import('/src/pages/PagePublipostage.vue'),
      beforeEnter: permissionGuard(permissions.SAPEUR.LECTURE),
    },
    {
      path: '/statistique',
      name: 'statistique',
      component: () => import('/src/pages/PageStatistique.vue'),
      children: [
        {
          path: '',
          name: 'stat-dashboard',
          component: () =>
            import('/src/components/statistique/StatDashboard.vue'),
        },
        {
          path: 'sapeur',
          name: 'stat-sapeur',
          component: () => import('/src/components/statistique/StatSapeur.vue'),
        },
        {
          path: 'exercice',
          name: 'stat-exercice-simple',
          component: () =>
            import('/src/components/statistique/StatExercice.vue'),
        },
        {
          path: 'exercice-presence',
          name: 'stat-exercice-presence',
          component: () =>
            import('/src/components/statistique/StatExercicePresence.vue'),
        },
        {
          path: 'intervention',
          name: 'stat-intervention',
          component: () =>
            import('/src/components/statistique/StatIntervention.vue'),
        },
        {
          path: 'intervention-presence',
          name: 'stat-intervention-presence',
          component: () =>
            import('/src/components/statistique/StatInterventionPresence.vue'),
        },
        {
          path: 'comptabilite',
          name: 'stat-comptabilite',
          component: () =>
            import('/src/components/statistique/StatComptabilite.vue'),
        },
      ],
    },
    {
      path: '/controles-medicaux',
      name: 'controles-medicaux',
      beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.TOUT),
      component: () => import('/src/pages/PageControlesMedicaux.vue'),
    },
    {
      path: '/controles-medicaux/:id',
      name: 'controle-medical',
      beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.TOUT),
      props: true,
      component: () => import('/src/pages/PageControleMedical.vue'),
    },
    {
      path: '/materiel',
      beforeEnter: permissionGuard(permissions.MATERIEL.LECTURE),
      component: () => import('/src/pages/PageMateriel.vue'),
      children: [
        {
          path: 'par-type',
          beforeEnter: permissionGuard(permissions.MATERIEL.LECTURE),
          children: [
            {
              path: '',
              name: 'materiel-par-type',
              component: () =>
                import('/src/components/materiel/TabParType.vue'),
            },
            {
              path: ':id',
              name: 'materiel-par-type-details',
              props: true,
              component: () =>
                import('/src/components/materiel/TabParType.vue'),
            },
          ],
        },
        {
          path: 'par-emplacement',
          beforeEnter: permissionGuard(permissions.MATERIEL.LECTURE),
          children: [
            {
              path: '',
              name: 'materiel-par-emplacement',
              component: () =>
                import('/src/components/materiel/TabParEmplacement.vue'),
            },
            {
              path: ':id',
              name: 'materiel-par-emplacement-details',
              props: true,
              component: () =>
                import('/src/components/materiel/TabParEmplacement.vue'),
            },
          ],
        },
        {
          path: 'par-sapeur',
          beforeEnter: permissionGuard(permissions.MATERIEL.LECTURE),
          children: [
            {
              path: '',
              name: 'materiel-par-sapeur',
              component: () =>
                import('/src/components/materiel/TabParSapeur.vue'),
            },
            {
              path: ':id',
              name: 'materiel-par-sapeur-details',
              props: true,
              component: () =>
                import('/src/components/materiel/TabParSapeur.vue'),
            },
          ],
        },
        {
          path: 'lavages',
          name: 'materiel-lavages',
          beforeEnter: permissionGuard(permissions.MATERIEL.LECTURE),
          component: () =>
            import('/src/components/materiel/TabLavages.vue'),
        },
        //   {
        //     path: 'inventaire',
        //     name: 'mat-perso-inventaire',
        //     beforeEnter: permissionGuard(permissions.MATERIEL.LECTURE),
        //     component: () =>
        //       import('/src/components/materiel/MaterielTabInventaire.vue'),
        //   },
      ],
    },
    {
      path: '/utilisateurs',
      beforeEnter: permissionGuard(permissions.ADMIN.TOUT),
      props: true,
      component: () => import('/src/pages/PageUtilisateurs.vue'),
      children: [
        {
          path: '',
          name: 'utilisateurs',
          component: () =>
            import('/src/components/utilisateur/ListeUtilisateur.vue'),
        },
        {
          path: 'manquants',
          name: 'utilisateurs-manquants',
          component: () =>
            import('/src/components/utilisateur/SapeurSansCompte.vue'),
        },
      ],
    },
    {
      path: '/configuration',
      name: 'parametres',
      beforeEnter: permissionGuard(
        permissions.COMPTABILITE.CONFIG,
        permissions.CONTROLE_MEDICAL.CONFIG,
        permissions.COURS.CONFIG,
        permissions.EXERCICE.CONFIG,
        permissions.FICHE_TRAVAIL.CONFIG,
        permissions.INTERVENTION.CONFIG,
        permissions.MATERIEL.CONFIG,
        permissions.SAPEUR.CONFIG,
        permissions.SIS.CONFIG,
        permissions.SMS.CONFIG,
        permissions.UTILISATEUR.CONFIG
      ),
      component: () => import('/src/pages/PageConfiguration.vue'),
      children: [
        {
          path: '',
          name: 'param-general',
          beforeEnter: permissionGuard(
            permissions.COMPTABILITE.CONFIG,
            permissions.CONTROLE_MEDICAL.CONFIG,
            permissions.COURS.CONFIG,
            permissions.EXERCICE.CONFIG,
            permissions.FICHE_TRAVAIL.CONFIG,
            permissions.INTERVENTION.CONFIG,
            permissions.MATERIEL.CONFIG,
            permissions.SAPEUR.CONFIG,
            permissions.SIS.CONFIG,
            permissions.SMS.CONFIG,
            permissions.UTILISATEUR.CONFIG
          ),
          component: () =>
            import('/src/components/parametres/ParametreTabGeneral.vue'),
        },
        {
          path: 'exercice-comptable',
          name: 'param-exercice-comptable',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.CONFIG),
          component: () =>
            import(
              '/src/components/parametres/ParametreTabExerciceComptable.vue'
            ),
        },
        {
          path: 'sapeur',
          name: 'param-sapeur',
          beforeEnter: permissionGuard(permissions.SAPEUR.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabSapeur.vue'),
        },
        {
          path: 'exercice',
          name: 'param-exercice',
          beforeEnter: permissionGuard(permissions.EXERCICE.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabExercice.vue'),
        },
        {
          path: 'intervention',
          name: 'param-intervention',
          beforeEnter: permissionGuard(permissions.INTERVENTION.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabIntervention.vue'),
        },
        {
          path: 'fiche-travail',
          name: 'param-fiche-travail',
          beforeEnter: permissionGuard(permissions.FICHE_TRAVAIL.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabFicheTravail.vue'),
        },
        {
          path: 'sms',
          name: 'param-sms',
          beforeEnter: permissionGuard(permissions.SMS.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabSms.vue'),
        },
        {
          path: 'absence',
          name: 'param-absence',
          beforeEnter: permissionGuard(permissions.ABSENCE.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabAbsence.vue'),
        },
        {
          path: 'comptabilite',
          name: 'param-comptabilite',
          beforeEnter: permissionGuard(permissions.COMPTABILITE.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabComptabilite.vue'),
        },
        {
          path: 'controle-medical',
          name: 'param-controle-medical',
          beforeEnter: permissionGuard(permissions.CONTROLE_MEDICAL.CONFIG),
          component: () =>
            import(
              '/src/components/parametres/ParametreTabControleMedical.vue'
            ),
        },
        {
          path: 'materiel',
          name: 'param-materiel',
          beforeEnter: permissionGuard(permissions.MATERIEL.CONFIG),
          component: () =>
            import(
              '/src/components/parametres/ParametreTabMateriel.vue'
            ),
        },
        {
          path: 'roles',
          name: 'param-roles',
          beforeEnter: permissionGuard(permissions.UTILISATEUR.CONFIG),
          component: () =>
            import('/src/components/parametres/ParametreTabRole.vue'),
        },
      ],
    },
    {
      path: '/rta',
      name: 'rta',
      beforeEnter: permissionGuard(permissions.RTA.LECTURE),
      component: () => import('/src/pages/PageRta.vue'),
      redirect: { name: 'rta-mutations' },
      children: [
        {
          path: 'mutations',
          name: 'rta-mutations',
          beforeEnter: permissionGuard(permissions.RTA.LECTURE),
          component: () =>
            import('/src/components/rta/MutationsRta.vue'),
        },
        {
          path: 'reference',
          name: 'rta-reference',
          beforeEnter: permissionGuard(permissions.RTA.LECTURE),
          component: () => import('/src/components/rta/ReferenceRta.vue'),
        },
        {
          path: 'gestsis',
          name: 'rta-gestsis',
          beforeEnter: permissionGuard(permissions.RTA.LECTURE),
          component: () => import('/src/components/rta/GestSisRta.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('/src/pages/PageAbout.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      beforeEnter: adminGuard(),
      component: () => import('/src/pages/PageAdmin.vue'),
      children: [
        {
          path: 'sis',
          name: 'admin-sis',
          beforeEnter: adminGuard(),
          component: () => import('/src/components/admin/AdminSis.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          beforeEnter: adminGuard(),
          component: () => import('/src/components/admin/AdminUsers.vue'),
        },
        {
          path: 'users/:id',
          name: 'admin-user',
          props: true,
          beforeEnter: adminGuard(),
          component: () => import('/src/components/admin/AdminUser.vue'),
        },
      ],
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

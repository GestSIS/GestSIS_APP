<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Statistique
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
          <router-link
            v-for="action in filteredActions"
            :key="action.name"
            :to="action.to"
            class="nav-item nav-link"
            exact-active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>{{ action.name }}</span>
          </router-link>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel"></div>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import permissions from '@/store/permissions.js';
import { mapState } from 'vuex';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

export default {
  name: 'statistiques',
  components: {
    ExerciceComptable,
  },
  data() {
    return {
      actions: [
        {
          to: { name: 'stat-dashboard' },
          name: 'Résumé',
        },
        // {
        //   to: { name: 'param-sapeur' },
        //   name: 'Sapeur',
        //   permission: permissions.SAPEUR.LECTURE,
        // },
        {
          to: { name: 'stat-exercice-simple' },
          name: 'Exercice',
          permission: permissions.EXERCICE.PRESENCE,
        },
        {
          to: { name: 'stat-exercice-presence' },
          name: 'Présences exercices',
          permission: permissions.EXERCICE.PRESENCE,
        },
        {
          to: { name: 'stat-intervention' },
          name: 'Intervention',
          permission: permissions.INTERVENTION.MODIFICATION,
        },
        // {
        //   to: { name: 'param-intervention' },
        //   name: 'Intervention',
        //   permission: permissions.INTERVENTION.CONFIG,
        // },
        // {
        //   to: { name: 'param-comptabilite' },
        //   name: 'Comptabilité',
        //   permission: permissions.COMPTABILITE.CONFIG,
        // },
        // {
        //   to: { name: 'param-controle-medical' },
        //   name: 'Contrôles médicaux',
        //   permission: permissions.CONTROLE_MEDICAL.CONFIG,
        // },
        // {
        //   to: { name: 'param-roles' },
        //   name: 'Droits et rôles',
        //   permission: permissions.UTILISATEUR.CONFIG,
        // },
      ],
    };
  },
  computed: {
    ...mapState({
      permissions: (state) => state.auth.sis.permissions,
    }),
    filteredActions() {
      return this.actions.filter(
        (s) => !s.permission || this.permissions.includes(s.permission)
      );
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>

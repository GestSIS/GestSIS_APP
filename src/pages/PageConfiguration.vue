<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Configuration
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <!--        <exercice-comptable />-->
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <router-link
            v-for="setting in filteredSettings"
            :key="setting.name"
            :to="setting.to"
            class="nav-item nav-link"
            exact-active-class="active"
            role="tab"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>{{ setting.name }}</span>
          </router-link>
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import permissions from '../store/permissions.js';
import { mapState } from 'vuex';

export default {
  name: 'PageConfiguration',
  data() {
    return {
      settings: [
        {
          to: { name: 'param-general' },
          name: 'Général',
        },
        {
          to: { name: 'param-exercice-comptable' },
          name: 'Exercice Comptables',
          permission: permissions.COMPTABILITE.CONFIG,
        },
        {
          to: { name: 'param-sapeur' },
          name: 'Sapeur',
          permission: permissions.SAPEUR.CONFIG,
        },
        {
          to: { name: 'param-exercice' },
          name: 'Exercice',
          permission: permissions.EXERCICE.CONFIG,
        },
        {
          to: { name: 'param-intervention' },
          name: 'Intervention',
          permission: permissions.INTERVENTION.CONFIG,
        },
        {
          to: { name: 'param-fiche-travail' },
          name: 'Fiche de travail',
          permission: permissions.FICHE_TRAVAIL.CONFIG,
        },
        {
          to: { name: 'param-sms' },
          name: 'Sms',
          permission: permissions.SMS.CONFIG,
        },
        {
          to: { name: 'param-comptabilite' },
          name: 'Comptabilité',
          permission: permissions.COMPTABILITE.CONFIG,
        },
        {
          to: { name: 'param-controle-medical' },
          name: 'Contrôles médicaux',
          permission: permissions.CONTROLE_MEDICAL.CONFIG,
        },
        {
          to: { name: 'param-materiel-personnel' },
          name: 'Matériel personnel',
          permission: permissions.MATERIEL_PERSONNEL.CONFIG,
        },
        {
          to: { name: 'param-roles' },
          name: 'Droits et rôles',
          permission: permissions.UTILISATEUR.CONFIG,
        },
      ],
    };
  },
  computed: {
    ...mapState({
      isAdmin: (state) => state.auth.admin,
      permissions: (state) => state.auth.sis.permissions,
    }),
    filteredSettings() {
      return this.settings.filter(
        (s) => this.permissions.includes(s.permission) || this.isAdmin
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>

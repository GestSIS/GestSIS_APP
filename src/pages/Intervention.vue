<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/interventions">Interventions</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ breadcrumbFinal }}
          </li>
        </ol>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav
          v-if="!newMode"
          class="nav nav-tabs mb-3"
          id="nav-tab"
          role="tablist"
        >
          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === 'general' }"
            role="tab"
            href="#"
            @click.prevent="activeTab = 'general'"
            >Informations</a
          >
          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === 'resume' }"
            role="tab"
            href="#"
            @click.prevent="activeTab = 'resume'"
            >Résumé</a
          >
          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === 'sapeurs' }"
            role="tab"
            href="#"
            @click.prevent="activeTab = 'sapeurs'"
            >Sapeurs</a
          >
          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === 'journal' }"
            role="tab"
            href="#"
            @click.prevent="activeTab = 'journal'"
            >Journal</a
          >
          <a
            class="nav-item nav-link"
            :class="{ active: activeTab === 'mat-veh' }"
            role="tab"
            href="#"
            @click.prevent="activeTab = 'mat-veh'"
            >Matériels &amp; Véhicules</a
          >
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div
            class="tab-pane fade show active"
            role="tabpanel"
            v-if="!loading"
          >
            <InterventionTabGeneral
              :newMode="newMode"
              v-if="activeTab === 'general'"
              >General</InterventionTabGeneral
            >
            <InterventionTabResume v-else-if="activeTab === 'resume'"
              >Résumé</InterventionTabResume
            >
            <InterventionTabSapeurs v-else-if="activeTab === 'sapeurs'"
              >Sapeurs</InterventionTabSapeurs
            >
            <InterventionTabJournal v-else-if="activeTab === 'journal'"
              >Journal</InterventionTabJournal
            >
            <div class="row" v-else-if="activeTab === 'mat-veh'">
              <InterventionTabMateriel>Materiels</InterventionTabMateriel>
              <InterventionTabVehicule>Véhicules</InterventionTabVehicule>
            </div>
          </div>
          <div v-else class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

import InterventionTabGeneral from '@/components/intervention/InterventionTabGeneral.vue';
import InterventionTabResume from '@/components/intervention/InterventionTabResume.vue';
import InterventionTabSapeurs from '@/components/intervention/InterventionTabSapeurs.vue';
import InterventionTabMateriel from '@/components/intervention/InterventionTabMateriel.vue';
import InterventionTabVehicule from '@/components/intervention/InterventionTabVehicule.vue';
import InterventionTabJournal from '@/components/intervention/InterventionTabJournal.vue';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadStatFederal = store.dispatch('fetchStatFederals');
  let loadTypeInterventions = store.dispatch('fetchTypeInterventions');
  let loadInterventionTraitement = store.dispatch(
    'fetchInterventionTraitements'
  );

  await store.dispatch('fetchExercicesComptables');

  let loadInterventions = store.dispatch('fetchListeIntervention');
  Promise.all([
    loadSapeurs,
    loadLocalities,
    loadStatFederal,
    loadInterventions,
    loadTypeInterventions,
    loadInterventionTraitement,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'intervention',
  components: {
    InterventionTabGeneral,
    InterventionTabResume,
    InterventionTabSapeurs,
    InterventionTabMateriel,
    InterventionTabVehicule,
    InterventionTabJournal,
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      activeTab: 'general',
      loading: true,
    };
  },
  props: {
    id: {
      type: String,
    },
  },
  computed: {
    ...mapState({
      activeInterventionId: (state) => state.intervention.active.id,
      activeInterventionData: (state) => state.intervention.active.data,
    }),
    newMode() {
      return this.id === 'new';
    },
    breadcrumbFinal() {
      return this.newMode ? 'Nouveau' : this.activeInterventionData.objet;
    },
  },
  mounted() {
    this.$store.dispatch('fetchListeSapeur');
    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchInterventionTraitements');
    this.$store.dispatch('fetchExercicesComptables');
    this.$store.dispatch('fetchTypeInterventions');
    this.$store.dispatch('fetchStatFederals');

    let id = parseInt(this.id);
    let svm = this;
    if (this.newMode) {
      this.$store
        .dispatch('resetActiveIntervention')
        .then(() => (svm.loading = false));
    } else {
      this.$store.dispatch('selectIntervention', id);
      this.$store
        .dispatch('fetchIntervention', id)
        .then(() => (svm.loading = false));
    }
  },
  watch: {
    id() {
      let svm = this;
      if (!this.newMode) {
        let id = parseInt(this.id);

        this.$store.dispatch('selectIntervention', id);
        this.$store
          .dispatch('fetchIntervention', id)
          .then(() => (svm.loading = false));
      } else {
        this.$store
          .dispatch('resetActiveIntervention')
          .then(() => (svm.loading = false));
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

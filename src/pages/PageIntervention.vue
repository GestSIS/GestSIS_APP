<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'interventions' }"
              >Interventions</router-link
            >
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
          id="nav-tab"
          class="nav nav-tabs mb-3"
          role="tablist"
        >
          <router-link
            :to="{ name: 'intervention-details' }"
            class="nav-link"
            exact-active-class="active"
          >
            Informations
          </router-link>
          <router-link
            :to="{ name: 'intervention-resume' }"
            class="nav-link"
            exact-active-class="active"
          >
            Résume
          </router-link>
          <router-link
            :to="{ name: 'intervention-presence' }"
            class="nav-link"
            exact-active-class="active"
          >
            Présences
          </router-link>
          <router-link
            :to="{ name: 'intervention-journal' }"
            class="nav-link"
            exact-active-class="active"
          >
            Journal
          </router-link>
          <router-link
            :to="{ name: 'intervention-materiel-vehicule' }"
            class="nav-link"
            exact-active-class="active"
          >
            Matériels &amp; Véhicules
          </router-link>
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div
            v-if="!loading"
            class="tab-pane fade show active"
            role="tabpanel"
          >
            <router-view />
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
import store from '/src/store/index';

import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalities = store.dispatch('fetchLocalites');
  const loadStatFederal = store.dispatch('fetchStatFederals');
  const loadTypeInterventions = store.dispatch('fetchTypeInterventions');
  const loadInterventionTraitement = store.dispatch(
    'fetchInterventionTraitements'
  );

  await store.dispatch('fetchExercicesComptables');

  const loadInterventions = store.dispatch('fetchListeIntervention');
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
  name: 'PageIntervention',
  components: {
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  props: {
    id: {
      type: String,
      default: 'new',
    },
  },
  data() {
    return {
      loading: true,
    };
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
      return this.newMode
        ? 'Nouveau'
        : new Date(this.activeInterventionData.date_debut).toLocaleDateString(
            'fr-CH'
          ) +
            ' - ' +
            this.activeInterventionData.objet;
    },
  },
  watch: {
    id() {
      const svm = this;
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
  mounted() {
    this.$store.dispatch('fetchListeSapeur');
    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchInterventionTraitements');
    this.$store.dispatch('fetchExercicesComptables');
    this.$store.dispatch('fetchTypeInterventions');
    this.$store.dispatch('fetchStatFederals');

    let id = parseInt(this.id);
    const svm = this;
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
};
</script>

<style lang="scss" scoped></style>

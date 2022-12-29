<template>
  <stateful-filter
    id="cours"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-3">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'accueil' }">Accueil</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Cours</li>
            </ol>
          </nav>
        </div>
        <div class="col-sm-6 d-flex justify-content-end">
          <exercice-comptable />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="col-md-4"
                  base-option="<Cours>"
                  :options="filteredCoursTypes"
                  :model-value="filters.cours_id"
                  @update:model-value="(value) => setFilter('cours_id', value)"
                />
                <base-select
                  class="col-md-4"
                  display-key="nom_prenom"
                  base-option="<Sapeur>"
                  :options="filteredSapeurs"
                  :model-value="filters.sapeur_id"
                  @update:model-value="(value) => setFilter('sapeur_id', value)"
                />
                <base-select
                  class="col-md-4"
                  base-option="<Localité>"
                  :options="filteredLocalites"
                  :model-value="filters.localite_id"
                  @update:model-value="
                    (value) => setFilter('localite_id', value)
                  "
                />
                <div v-if="canReset" class="col-md-4">
                  <button class="btn btn-sm btn-warning w-100" @click="reset">
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline table-responsive">
            <div v-if="loading" class="card-body d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <base-table
              v-show="!loading"
              :selectable="true"
              :fields="fields"
              no-data="Aucun cours à afficher"
              :data="filteredData"
            />
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import { mapState } from 'vuex';
import { markRaw } from 'vue';
import store from '/src/store/index';

import ExerciceDetails from '/src/components/exercice/ExerciceDetails.vue';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  const loadLocalities = store.dispatch('fetchLocalites');
  const loadCours = store.dispatch('fetchCours');
  const loadSapeurs = store.dispatch('fetchListeSapeur');

  await store.dispatch('fetchExercicesComptables');

  const loadCoursSapeurs = store.dispatch('fetchCoursSapeurs');

  Promise.all([loadLocalities, loadCours, loadSapeurs, loadCoursSapeurs]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'PageCours',
  components: {
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
      loading: true,
      selectedId: null,
      detailRowComponent: markRaw(ExerciceDetails),
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Cours', key: 'designation' },
        { title: 'Sapeur', key: 'nom_prenom' },
        { title: 'Durée [jour]', key: 'duree' },
        { title: 'Localité', key: 'localite' },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) =>
        state.sapeur.liste.sort((a, b) =>
          a.nom_prenom.localeCompare(b.nom_prenom)
        ),
      coursTypes: (state) =>
        state.cours.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      coursSapeurs: (state) =>
        state.coursSapeur.liste.sort((a, b) => a.date.localeCompare(b.date)),
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      return this.coursSapeurs.map((s) => ({
        ...s,
        localite: this.localites.find((l) => l.id == s.localite_id)
          ?.designation,
        designation: this.coursTypes.find((l) => l.id == s.cours_id)
          ?.designation,
        nom_prenom: this.sapeurs.find((l) => l.id == s.sapeur_id)?.nom_prenom,
      }));
    },
    filteredSapeurs() {
      const ids = new Set(this.coursSapeurs.map((i) => parseInt(i.sapeur_id)));
      return this.sapeurs.filter((t) => ids.has(t.id));
    },
    filteredCoursTypes() {
      const ids = new Set(this.coursSapeurs.map((i) => parseInt(i.cours_id)));
      return this.coursTypes.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(
        this.coursSapeurs.map((i) => parseInt(i.localite_id))
      );
      return this.localites.filter((t) => ids.has(t.id));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchCoursSapeurs').then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.loading = false;
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>

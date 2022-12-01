<template>
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
                :options="filteredCoursTypes"
                display-key="designation"
                value-key="id"
                base-option="<Cours>"
                @update:model-value="(value) => onFilter('cours_id', value)"
              />
              <base-select
                class="col-md-4"
                :options="filteredSapeurs"
                display-key="nom_prenom"
                value-key="id"
                base-option="<Sapeur>"
                @update:model-value="(value) => onFilter('sapeur_id', value)"
              />
              <base-select
                class="col-md-4"
                :options="filteredLocalites"
                display-key="designation"
                value-key="id"
                base-option="<Localité>"
                @update:model-value="(value) => onFilter('localite_id', value)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-5 table-responsive">
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
            :data="filteredCoursSapeurs"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { markRaw } from 'vue';
import store from '@/store/index';

import ExerciceDetails from '@/components/exercice/ExerciceDetails.vue';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

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
      filters: {},
      detailRowComponent: markRaw(ExerciceDetails),
      fields: [
        {
          title: 'Date',
          key: 'date',
          type: Date,
        },
        {
          title: 'Cours',
          key: 'designation',
        },
        {
          title: 'Sapeur',
          key: 'nom_prenom',
        },
        {
          title: 'Durée [jour]',
          key: 'duree',
        },
        {
          title: 'Localité',
          key: 'localite',
        },
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
    filteredCoursSapeurs() {
      return this.computedData.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val >= 0)
          .map(
            ([key, value]) =>
              (x) =>
                x[key] == value
          )
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
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
  methods: {
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
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

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Exercices
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des exercices</h3>
            <router-link
              tag="button"
              to="/exercices/new"
              class="btn btn-outline-primary"
            >
              Ajouter un exercice
            </router-link>
          </div>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
          <vuetable
            v-show="!loading"
            ref="vuetable_exercices"
            :api-mode="false"
            :fields="fields"
            :detail-row-component="detailRow"
            detail-row-class="m-td-0"
            :css="css.table"
            :data-manager="dataManager"
            :row-class="onRowClass"
          >
            <div slot="details" slot-scope="props">
              <button
                class="btn btn-link border-0"
                @click="toggleDetails(props.rowData.id)"
              >
                <font-awesome-icon
                  v-if="toggles[props.rowData.id] || false"
                  :icon="['fas', 'angle-down']"
                />
                <font-awesome-icon
                  v-if="!(toggles[props.rowData.id] || false)"
                  :icon="['fas', 'angle-right']"
                />
              </button>
            </div>
            <div slot="actions" slot-scope="props">
              <router-link
                tag="button"
                :to="'/exercices/' + props.rowData.id"
                class="btn btn-outline-primary border-0"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </router-link>
              <button
                class="btn btn-outline-primary border-0"
                @click="validerExercice(props.rowData.id)"
                v-if="props.rowData.statut === 2"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
            </div>
          </vuetable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import store from '@/store/index';

import ExerciceDetails from '@/components/exercice/ExerciceDetails';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

import Vuetable from 'vuetable-2';
// import VuetableRowHeader from 'vuetable-2/src/components/VuetableRowHeader.vue'
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

async function loadData(routeTo, next) {
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');

  await store.dispatch('fetchExercicesComptables');

  let loadExercices = store.dispatch('fetchListExercice');
  Promise.all([loadExercices, loadLocalities, loadExerciceCategories]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'exercices',
  components: {
    Vuetable,
    ExerciceComptable
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListExercice').then(() => {
        this.loading = false;
        this.$refs.vuetable_exercices.setData(this.computedData);
      });
    },
    listExercices() {
      this.$refs.vuetable_exercices.setData(this.computedData);
    }
  },
  mounted() {
    this.$refs.vuetable_exercices.setData(this.computedData);
    this.loading = false;
  },
  data() {
    return {
      css: CssForBootstrap4,
      toggles: {},
      loading: true,
      detailRow: ExerciceDetails,
      fields: [
        {
          title: '',
          name: 'details',
          dataClass: 'align-middle details-width'
        },
        {
          title: 'Date',
          name: 'date',
          sortField: 'date',
          dataClass: 'align-middle'
        },
        {
          title: 'Categorie',
          name: 'categorie',
          sortField: 'categorie',
          dataClass: 'align-middle'
        },
        {
          title: 'Heure',
          name: 'heure',
          dataClass: 'align-middle',
          formatter(value) {
            return value.slice(0, 5);
          }
        },
        {
          title: 'Duree',
          name: 'duree',
          dataClass: 'align-middle'
        },
        {
          title: 'Localité',
          name: 'localite',
          sortField: 'localite',
          dataClass: 'align-middle'
        },
        {
          title: 'Lieu',
          name: 'lieu',
          dataClass: 'align-middle'
        },
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation',
          dataClass: 'align-middle'
        },
        {
          title: 'Statut',
          name: 'statut',
          dataClass: 'align-middle',
          sortField: 'statut',
          formatter(value) {
            const statuts = {
              0: 'Annulé',
              1: 'A saisir',
              2: 'En attente de validation',
              3: 'A imputer',
              4: 'Imputée'
            };
            return statuts[value];
          }
        },
        {
          title: 'Actions',
          name: 'actions',
          dataClass: 'align-middle'
        }
      ]
    };
  },
  props: {
    propName: {
      type: Number,
      default: 0
    },
    id: {
      type: String
    }
  },
  computed: {
    ...mapState({
      listExercices: state => state.exercice.liste,
      listExerciceComptable: state => state.exerciceComptable.liste,
      currentExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    ...mapGetters(['activeExerciceId', 'getExerciceCategorie', 'getLocalite']),
    computedData() {
      return this.listExercices.map(s => ({
        ...s,
        categorie: this.getExerciceCategorie(s.exercice_categorie_id)
          .designation,
        localite: this.getLocalite(s.localite_id).designation
      }));
    }
  },
  methods: {
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id]
      };
      this.$refs.vuetable_exercices.toggleDetailRow(id);
    },
    validerExercice(id) {
      this.$store.dispatch('validerExercice', id);
    },
    dataManager(sortOrder) {
      if (this.computedData.length < 1) return;

      let local = this.computedData;

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        local = _.orderBy(
          local,
          sortOrder[0].sortField,
          sortOrder[0].direction
        );
      }

      return {
        data: local
      };
    },
    onRowClass(dataItem) {
      const statutsClass = {
        0: 'text-danger', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: '', //'A imputer',
        4: 'table-success' //'Imputée'
      };
      return statutsClass[dataItem.statut];
    }
  }
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

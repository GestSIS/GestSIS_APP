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
              Interventions
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
            <h3>Liste des interventions</h3>
            <router-link
              tag="button"
              to="/interventions/new"
              class="btn btn-outline-primary"
            >
              Ajouter une intervention
            </router-link>
          </div>
          <form class="card-body">
            <div class="form-row">
              <div class="form-group col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterLocalite"
                  @change="event => onFilter('localite_id', event.target.value)"
                >
                  <option>&lt;Localité&gt;</option>
                  <option
                    v-for="loc in filteredLocalites"
                    :key="loc.id"
                    :value="loc.id"
                    >{{ loc.designation }}</option
                  >
                </select>
              </div>
              <div class="form-group col-md-4">
                <select class="custom-select custom-select-sm" id="filterType"
                  @change="event => onFilter('type_intervention_id', event.target.value)">
                  <option>&lt;Type&gt;</option>
                  <option
                    v-for="type in filteredInterventionsTypes"
                    :key="type.id"
                    :value="type.id"
                    >{{ type.designation }}</option
                  >
                </select>
              </div>
              <div class="form-group col-md-4">
                <select class="custom-select custom-select-sm" id="filterStatistique"
                  @change="event => onFilter('stat_federal_id', event.target.value)">
                  <option>&lt;Statistiques Fédérales&gt;</option>
                  <option>Lutte contre le feu</option>
                  <option>Secours routiers</option>
                  <option>Interventions diverses</option>
                  <option>Défense chimique</option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <select class="custom-select custom-select-sm" id="filterTraitement"
                  @change="event => onFilter('intervention_traitement_id', event.target.value)">
                  <option>&lt;Traitement&gt;</option>
                  <option>-</option>
                  <option>A Facturer</option>
                  <option>Payé</option>
                  <option>Facturée</option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <select class="custom-select custom-select-sm" id="filterEtendue"
                  @change="event => onFilter('degree', event.target.value)">
                  <option>&lt;Etendue&gt;</option>
                  <option>Fausse alarame</option>
                  <option>Petite</option>
                  <option>Moyenne</option>
                  <option>Grande</option>
                </select>
              </div>
            </div>
          </form>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <vuetable
            ref="vuetable"
            :class="{ 'd-none': loading }"
            :api-mode="false"
            :fields="fields"
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
                :to="'/interventions/' + props.rowData.id"
                class="btn btn-outline-primary border-0"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </router-link>
              <button
                class="btn btn-outline-primary border-0"
                @click="validerIntervention(props.rowData.id)"
                v-if="props.rowData.statut === 1"
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

import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

async function loadData(routeTo, next) {
  let loadLocalities = store.dispatch('fetchLocalites');
  let loadStatFederal = store.dispatch('fetchStatFederals');
  let loadTypeInterventions = store.dispatch('fetchTypeInterventions');
  let loadInterventionTraitement = store.dispatch(
    'fetchInterventionTraitements'
  );

  await store.dispatch('fetchExercicesComptables');

  let loadExercices = store.dispatch('fetchListIntervention');
  Promise.all([
    loadExercices,
    loadLocalities,
    loadStatFederal,
    loadTypeInterventions,
    loadInterventionTraitement
  ]).then(() => {
    next();
  });
}

export default {
  name: 'interventions',
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
      this.$store.dispatch('fetchListIntervention').then(() => {
        this.loading = false;
        this.$refs.vuetable.setData(this.filteredInterventions);
      });
    },
    filteredInterventions(data) {
      this.loading = false;
      this.$refs.vuetable.setData(data);
    },
    filters() {
      this.filteredInterventions = this.listeInterventions.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val)
          .map(([key, value]) => x => x[key] === value)
          .reduce((f, g) => x => f(x) && g(x), () => true)
      );
    },
  },
  mounted() {
    this.loading = false;
    this.$refs.vuetable.setData(data);
  },
  data() {
    const self = this;
    return {
      css: CssForBootstrap4,
      toggles: [],
      fields: [
        // {
        //   title: '',
        //   name: 'details',
        //   dataClass: 'align-middle'
        // },
        {
          title: 'Date',
          name: 'date_debut',
          dataClass: 'align-middle',
          sortField: 'date_debut'
        },
        {
          title: 'Heure',
          name: 'heure_debut',
          dataClass: 'align-middle',
          formatter(value) {
            return value.slice(0, 5);
          },
          sortField: 'heure_debut'
        },
        {
          title: "Type d'intervention",
          name: 'type_intervention_id',
          formatter(value) {
            return self.getTypeIntervention(value).designation;
          },
          sortField: 'type_intervention_id'
        },
        {
          title: 'Localité',
          name: 'localite_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getLocalite(value).designation;
          },
          sortField: 'localite_id'
        },
        {
          title: 'Lieu',
          name: 'lieu',
          dataClass: 'align-middle'
        },
        {
          title: 'Stat fédéral',
          name: 'stat_federal_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getStatFederal(value).designation;
          },
          sortField: 'stat_federal_id'
        },
        {
          title: 'Traitement',
          name: 'intervention_traitement_id',
          dataClass: 'align-middle',
          formatter(value) {
            return self.getInterventionTraitement(value).designation;
          },
          sortField: 'intervention_traitement_id'
        },
        {
          title: 'Étendue',
          name: 'degre',
          dataClass: 'align-middle',
          formatter(value) {
            const degre = {
              1: 'Fausse-alarme',
              2: 'Petite',
              3: 'Moyenne',
              4: 'Grande'
            };
            return degre[value];
          },
          sortField: 'degre'
        },
        {
          title: 'Statut',
          name: 'statut',
          dataClass: 'align-middle',
          formatter(value) {
            const statuts = {
              0: 'A saisir',
              1: 'A valider',
              2: 'Validée',
              3: 'Imputée'
            };
            return statuts[value];
          },
          sortField: 'statut'
        },
        {
          title: 'Actions',
          name: 'actions',
          dataClass: 'align-middle'
        }
      ],
      loading: true,
      filters: {},
    };
  },
  computed: {
    ...mapState({
      listeInterventions: state => state.intervention.liste,
      listeInterventionsTypes: state => state.typeIntervention.liste,
      listeLocalites: state =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        )
    }),
    ...mapGetters([
      'currentExerciceComptableId',
      'getTypeIntervention',
      'getLocalite',
      'getStatFederal',
      'getInterventionTraitement'
    ]),
    filteredInterventionsTypes() {
      const ids = new Set(this.listeInterventions.map(i => i.type_intervention_id));
      return this.listeInterventionsTypes.filter(t => ids.has(t.id))
    },
    filteredLocalites() {
      const ids = new Set(this.listeInterventions.map(i => i.localite_id));
      return this.listeLocalites.filter(t => ids.has(t.id))
    },
    filteredInterventions() {
      return this.listeInterventions.filter(
        Object.entries(this.filters)
          .filter(([, val]) => val)
          .map(([key, value]) => x => x[key] === value)
          .reduce((f, g) => x => f(x) && g(x), () => true)
      );
    }
  },
  methods: {
    toggleDetails(id) {
      this.toggles[id] = !this.toggles[id];
      this.$refs.vuetable.toggleDetailRow(id);
    },
    validerIntervention(id) {
      this.$store.dispatch('validerIntervention', id);
    },
    dataManager(sortOrder) {
      if (this.filteredInterventions.length < 1) return;

      let local = this.filteredInterventions;

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
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
    onRowClass(dataItem) {
      const statutsClass = {
        0: '', //'A saisir',
        1: '', //'En attente de validation',
        2: '', // 'Validée',
        3: 'table-success' //'Imputée'
      };
      return statutsClass[dataItem.statut];
    }
  }
};
</script>

<style lang="scss" scoped></style>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Interventions
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Actions</h5>
          </div>
          <form class="card-body">
            <router-link
              tag="button"
              to="/interventions/new"
              class="btn btn-outline-primary btn-block"
            >
              Ajouter une intervention
            </router-link>
            <router-link
              tag="button"
              :disabled="!selectedId"
              :to="'/interventions/' + selectedId"
              class="btn btn-outline-primary btn-block"
            >
              Modifier
            </router-link>
            <button
              :disabled="!canDelete"
              @click="supprimerIntervention(selectedId)"
              class="btn btn-outline-primary btn-block"
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Impressions</h5>
          </div>
          <form class="card-body">
            <button
              :disabled="!selectedId"
              @click="rapportIntervention"
              class="btn btn-outline-primary btn-block"
            >
              Rapport d'intervention
            </button>
          </form>
        </div>
      </div>
      <div class="col-md-6">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h5>Filtres</h5>
          </div>
          <form class="card-body">
            <div class="form-row">
              <div class="form-group col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterLocalite"
                  @change="
                    (event) => onFilter('localite_id', event.target.value)
                  "
                >
                  <option>&lt;Localité&gt;</option>
                  <option
                    v-for="loc in filteredLocalites"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterType"
                  @change="
                    (event) =>
                      onFilter('type_intervention_id', event.target.value)
                  "
                >
                  <option>&lt;Type&gt;</option>
                  <option
                    v-for="type in filteredInterventionsTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterStatistique"
                  @change="
                    (event) => onFilter('stat_federal_id', event.target.value)
                  "
                >
                  <option>&lt;Statistique fédérale&gt;</option>
                  <option
                    v-for="stat in filteredStatFederal"
                    :key="stat.id"
                    :value="stat.id"
                  >
                    {{ stat.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterTraitement"
                  @change="
                    (event) =>
                      onFilter('intervention_traitement_id', event.target.value)
                  "
                >
                  <option>&lt;Traitement&gt;</option>
                  <option
                    v-for="traitement in listeTraitement"
                    :key="traitement.id"
                    :value="traitement.id"
                  >
                    {{ traitement.designation }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select
                  class="custom-select custom-select-sm"
                  id="filterEtendue"
                  @change="
                    (event) => onFilter('degre', parseInt(event.target.value))
                  "
                >
                  <option>&lt;Etendue&gt;</option>
                  <option value="1">Fausse alarme</option>
                  <option value="2">Petite</option>
                  <option value="3">Moyenne</option>
                  <option value="4">Grande</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
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
            no-data-template="Aucune intervention à afficher"
            @vuetable:row-clicked="select"
          >
            <div slot="details" slot-scope="props" class="d-flex">
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
            <div slot="actions" slot-scope="props" class="d-flex">
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
import { mapGetters, mapState, mapMutations } from 'vuex';
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

  let loadExercices = store.dispatch('fetchListeIntervention');
  Promise.all([
    loadExercices,
    loadLocalities,
    loadStatFederal,
    loadTypeInterventions,
    loadInterventionTraitement,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'interventions',
  components: {
    Vuetable,
    ExerciceComptable,
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
      this.$store.dispatch('fetchListeIntervention').then(() => {
        this.loading = false;
        this.$refs.vuetable.setData(this.filteredInterventions);
      });
    },
    filteredInterventions(data) {
      this.loading = false;
      this.$refs.vuetable.setData(data);
    },
  },
  mounted() {
    this.loading = false;
    this.$refs.vuetable.setData(this.filteredInterventions);
  },
  data() {
    const self = this;

    return {
      css: CssForBootstrap4,
      toggles: [],
      selectedId: null,
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
          sortField: 'date_debut',
        },
        {
          title: 'Heure',
          name: 'heure_debut',
          formatter(value) {
            return value.slice(0, 5);
          },
          sortField: 'heure_debut',
        },
        {
          title: "Type d'intervention",
          name: 'type_intervention_id',
          formatter(value) {
            return self.getTypeIntervention(value).designation;
          },
          sortField: 'type_intervention_id',
        },
        {
          title: 'Localité',
          name: 'localite_id',
          formatter(value) {
            return self.getLocalite(value).designation;
          },
          sortField: 'localite_id',
        },
        {
          title: 'Lieu',
          name: 'lieu',
          dataClass: 'align-middle',
        },
        {
          title: 'Stat fédéral',
          name: 'stat_federal_id',
          formatter(value) {
            return self.getStatFederal(value).designation;
          },
          sortField: 'stat_federal_id',
        },
        {
          title: 'Traitement',
          name: 'intervention_traitement_id',
          formatter(value) {
            return self.getInterventionTraitement(value).designation;
          },
          sortField: 'intervention_traitement_id',
        },
        {
          title: 'Étendue',
          name: 'degre',
          formatter(value) {
            const degre = {
              1: 'Fausse-alarme',
              2: 'Petite',
              3: 'Moyenne',
              4: 'Grande',
            };
            return degre[value];
          },
          sortField: 'degre',
        },
        {
          title: 'Statut',
          name: 'statut',
          formatter(value) {
            const statuts = {
              0: 'A saisir',
              1: 'A valider',
              2: 'Validée',
              3: 'Imputée',
            };
            return statuts[value];
          },
          sortField: 'statut',
        },
        {
          title: 'Actions',
          name: 'actions',
        },
      ],
      loading: true,
      filters: {},
    };
  },
  computed: {
    ...mapState({
      listeInterventions: (state) => state.intervention.liste,
      listeInterventionsTypes: (state) => state.typeIntervention.liste,
      listeStatFederal: (state) => state.statFederal.liste,
      listeTraitement: (state) => state.interventionTraitement.liste,
      listeLocalites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
    }),
    ...mapGetters([
      'currentExerciceComptableId',
      'getTypeIntervention',
      'getLocalite',
      'getStatFederal',
      'getInterventionTraitement',
    ]),
    filteredInterventionsTypes() {
      const ids = new Set(
        this.listeInterventions.map((i) => i.type_intervention_id)
      );
      return this.listeInterventionsTypes.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(this.listeInterventions.map((i) => i.localite_id));
      return this.listeLocalites.filter((t) => ids.has(t.id));
    },
    filteredStatFederal() {
      const ids = new Set(
        this.listeInterventions.map((i) => i.stat_federal_id)
      );
      return this.listeStatFederal.filter((t) => ids.has(t.id));
    },
    filteredInterventions() {
      const self = this;
      return this.listeInterventions
        .filter(
          Object.entries(this.filters)
            .filter(([, val]) => val)
            .map(([key, value]) => (x) => x[key] === value)
            .reduce(
              (f, g) => (x) => f(x) && g(x),
              () => true
            )
        )
        .map((i) => {
          if (i.id == self.selectedId) {
            return { ...i, 'row-class': 'bg-primary' };
          } else {
            return i;
          }
        });
    },
    canDelete() {
      return (
        this.selectedId &&
        this.listeInterventions.filter(
          (i) => i.id == this.selectedId && i.statut < 3
        ).length > 0
      );
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    toggleDetails(id) {
      this.toggles[id] = !this.toggles[id];
      this.$refs.vuetable.toggleDetailRow(id);
    },
    select(row) {
      this.selectedId = row.data.id;
    },
    supprimerIntervention(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: "Voulez-vous vraiment supprimer l'intervention ?",
          question:
            "Attention, la suppression d'une intervention est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
        },
        callback: () => {
          this.$store.dispatch('removeIntervention', this.selectedId);
        },
      });
    },
    validerIntervention(id) {
      this.$store.dispatch('validerIntervention', id);
    },
    rapportIntervention() {
      this.SHOW_MODAL({
        component: 'ModalRapportIntervention',
        size: 1,
        data: { interventionId: this.selectedId },
      });
      //TODO: imprimer le rapport d'intervention -> modal
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
        data: local,
      };
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
    onRowClass(dataItem) {
      if (dataItem.id === this.selectedId) {
        return 'table-primary';
      }
      const statutsClass = {
        0: '', // 'A saisir',
        1: '', // 'En attente de validation',
        2: '', // 'Validée',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style lang="scss" scoped></style>

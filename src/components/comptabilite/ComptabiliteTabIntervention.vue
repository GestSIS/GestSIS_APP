<template>
  <div class="row">
    <div class="col-12 col-md-4 col-xl-3">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Actions</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-outline-primary btn-block" disabled>
            Imputer
          </button>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-8 col-xl-9">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Filtres</h3>
        </div>
        <form class="card-body">
          <div class="form-row">
            <div class="form-group col-md-4">
              <select
                class="custom-select custom-select-sm"
                id="filterLocalite"
                @change="(event) => onFilter('localite_id', event.target.value)"
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
                  v-for="type in filteredTypesIntervention"
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
                  v-for="traitement in traitements"
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
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Interventions</h3>
          <!--          <button @click.prevent="save" class="btn btn-primary">-->
          <!--            Enregistrer-->
          <!--          </button>-->
        </div>
        <div class="card-body d-flex justify-content-center" v-if="loading">
          <div class="spinner-border" role="status">
            <span class="sr-only">Chargement...</span>
          </div>
        </div>
        <base-table
          v-show="!loading"
          :fields="fields"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          no-data="Aucune écriture à afficher"
          :detail-row-component="detailRow"
          :data="filteredInterventions"
          @selected="selected"
          :selectable="true"
          selectKey="id"
          row-selected-class="table-primary"
        >
          <template v-slot:details="props">
            <div class="d-flex">
              <button
                class="btn btn-link border-0"
                @click="props.actions.toggleDetailRow(props.rowData.id)"
                v-if="props.rowData.statut === 3"
              >
                <font-awesome-icon
                  v-if="props.status.detailRowVisible || false"
                  :icon="['fas', 'angle-down']"
                />
                <font-awesome-icon
                  v-if="!props.status.detailRowVisible || false"
                  :icon="['fas', 'angle-right']"
                />
              </button>
            </div> </template
          ><template v-slot:actions="props">
            <div class="d-flex">
              <button
                class="btn btn-outline-primary border-0"
                v-if="props.rowData.statut === 2"
                @click="imputerIntervention(props.rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </button>
            </div>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import { mapState, mapGetters, mapMutations } from 'vuex';

import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails';
import ImputationService from '@/services/ImputationService';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(_, next) {
  const loadInterventions = store.dispatch('fetchListeIntervention');
  const loadTypes = store.dispatch('fetchTypeInterventions');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadStatFederal = store.dispatch('fetchStatFederals');
  const loadTraitement = store.dispatch('fetchInterventionTraitements');

  Promise.all([
    loadInterventions,
    loadSapeurs,
    loadTypes,
    loadLocalites,
    loadStatFederal,
    loadTraitement,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabIntervention',
  components: { BaseTable },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {
    //TODO Fetch only if neccessary
    if (this.exercicesComptable.length === 0) {
      //console.log('Warning')
    } else {
      this.loading = false;
    }
  },
  data() {
    let svm = this;
    return {
      detailRow: FraisEcritureDetails,
      loading: true,
      filters: {},
      selectedId: null,
      ecritureColumns: [
        {
          title: 'Sapeur',
          field: 'sapeur_id',
          formatter: (field) =>
            [svm.getSapeur(field)].map((s) => `${s.nom} ${s.prenom}`)[0],
        },
        {
          title: 'Tarif',
          field: 'tarif',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Taux',
          field: 'taux',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Quantité',
          field: 'quantite',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Solde',
          field: 'solde',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Indemnité',
          field: 'indemnite',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Total',
          field: 'total',
          headerClassName: 'text-center',
          className: 'text-right',
        },
      ],
      fields: [
        {
          title: '',
          key: 'details',
          slot: 'details',
        },
        {
          title: 'Date',
          key: 'date_debut',
          sortKey: 'date_debut',
        },
        {
          title: 'Heure',
          key: 'heure_debut',
          formatter(value) {
            return value.slice(0, 5);
          },
          sortKey: 'heure_debut',
        },
        {
          title: "Type d'intervention",
          key: 'type_intervention',
          sortKey: 'type_intervention',
        },
        {
          title: 'Localité',
          key: 'localite_id',
          formatter(value) {
            return svm.getLocalite(value).designation;
          },
          sortKey: 'localite_id',
        },
        {
          title: 'Lieu',
          key: 'lieu',
          sortKey: 'lieu',
        },
        {
          title: 'Stat fédéral',
          key: 'stat_federal_id',
          formatter(value) {
            return svm.getStatFederal(value).designation;
          },
          sortKey: 'stat_federal_id',
        },
        {
          title: 'Traitement',
          key: 'intervention_traitement_id',
          formatter(value) {
            return svm.getInterventionTraitement(value).designation;
          },
          sortKey: 'intervention_traitement_id',
        },
        {
          title: 'Étendue',
          key: 'degre',
          formatter(value) {
            const degre = {
              1: 'Fausse-alarme',
              2: 'Petite',
              3: 'Moyenne',
              4: 'Grande',
            };
            return degre[value];
          },
          sortKey: 'degre',
        },
        {
          title: 'Statut',
          key: 'statut',
          formatter(value) {
            const statuts = {
              0: 'A saisir',
              1: 'A valider',
              2: 'A imputer',
              3: 'Imputée',
            };
            return statuts[value];
          },
          sortKey: 'statut',
        },
        {
          title: 'Actions',
          key: 'actions',
          slot: 'actions',
        },
      ],
    };
  },
  props: {
    id: {
      type: String,
    },
  },
  watch: {
    currentExerciceComptableId() {
      this.$store.dispatch('fetchListeIntervention');
    },
  },
  computed: {
    ...mapState({
      interventions: (state) =>
        state.intervention.liste.filter((e) => e.statut > 1),
      exercicesComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      typesIntervention: (state) => state.typeIntervention.liste,
      statsFederal: (state) => state.statFederal.liste,
      traitements: (state) => state.interventionTraitement.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
    }),
    ...mapGetters([
      'activeInterventionId',
      'getTypeIntervention',
      'getLocalite',
      'getStatFederal',
      'getInterventionTraitement',
      'getSapeur',
    ]),
    computedData() {
      return this.interventions.map((i) => ({
        ...i,
        type_intervention: this.getTypeIntervention(i.type_intervention_id)
          .designation,
        localite: this.getLocalite(i.localite_id).designation,
        getEcritures: () =>
          ImputationService.getEcrituresForInterventions(i.id),
        columns: this.ecritureColumns,
      }));
    },
    filteredTypesIntervention() {
      const ids = new Set(
        this.interventions.map((i) => i.type_intervention_id)
      );
      return this.typesIntervention.filter((t) => ids.has(t.id));
    },
    filteredLocalites() {
      const ids = new Set(this.interventions.map((i) => i.localite_id));
      return this.localites.filter((t) => ids.has(t.id));
    },
    filteredStatFederal() {
      const ids = new Set(this.interventions.map((i) => i.stat_federal_id));
      return this.statsFederal.filter((t) => ids.has(t.id));
    },
    filteredInterventions() {
      const self = this;
      return this.computedData
        .filter(
          Object.entries(this.filters)
            .filter(([, val]) => val)
            .map(
              ([key, value]) =>
                (x) =>
                  x[key] === value
            )
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
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(id) {
      this.selectedId = id;
    },
    imputerIntervention(interventionId) {
      this.SHOW_MODAL({
        component: 'ModalImputerIntervention',
        data: { id: interventionId },
        size: 2,
      });
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }

      const statutsClass = {
        0: '', //'A saisir',
        1: '', //'A valider',
        2: 'table-warning', //'A imputer',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
    onFilter(key, value) {
      this.filters = { ...this.filters, [key]: parseInt(value) };
    },
  },
};
</script>

<style scoped></style>

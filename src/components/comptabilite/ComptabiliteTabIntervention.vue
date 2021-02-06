<template>
  <div class="row">
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
        <vuetable
          v-show="!loading"
          ref="vuetable_frais_interventions"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          :data-manager="dataManager"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          no-data-template="Aucun écriture à afficher"
          :detail-row-component="detailRow"
        >
          <div slot="details" slot-scope="props" class="d-flex">
            <button
              class="btn btn-link border-0"
              @click="toggleDetails(props.rowData.id)"
              v-if="props.rowData.statut === 3"
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
            <button
              class="btn btn-outline-primary border-0"
              v-if="props.rowData.statut === 2"
              @click="imputerIntervention(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div>
        </vuetable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails';
import ComptabiliteService from '@/services/ComptabiliteService';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

export default {
  name: 'FraisTabIntervention',
  components: {
    Vuetable,
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListeIntervention').then(() => {
        this.loading = false;
        this.$refs.vuetable_frais_interventions.setData(this.computedData);
      });
    },
    listInterventions() {
      this.loading = true;
      this.$refs.vuetable_frais_interventions.setData(this.computedData);
      this.loading = false;
    },
  },
  mounted() {
    //TODO Fetch only if neccessary
    this.$store.dispatch('fetchListeSapeur');

    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchStatFederals');
    this.$store.dispatch('fetchTypeInterventions');
    this.$store.dispatch('fetchInterventionTraitements');
    if (this.listeExerciceComptable.length === 0) {
      //console.log('Warning')
    }
    if (this.currentExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchListeIntervention').then(() => {
        this.loading = false;
        this.$refs.vuetable_frais_interventions.setData(this.computedData);
      });
    }
  },
  data() {
    let svm = this;
    return {
      css: CssForBootstrap4,
      toggles: {},
      detailRow: FraisEcritureDetails,
      loading: true,
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
          name: 'details',
        },
        {
          title: 'Date',
          name: 'date_debut',
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
          name: 'type_intervention',
          sortField: 'type_intervention',
        },
        {
          title: 'Localité',
          name: 'localite_id',
          formatter(value) {
            return svm.getLocalite(value).designation;
          },
          sortField: 'localite_id',
        },
        {
          title: 'Lieu',
          name: 'lieu',
          sortField: 'lieu',
        },
        {
          title: 'Stat fédéral',
          name: 'stat_federal_id',
          formatter(value) {
            return svm.getStatFederal(value).designation;
          },
          sortField: 'stat_federal_id',
        },
        {
          title: 'Traitement',
          name: 'intervention_traitement_id',
          formatter(value) {
            return svm.getInterventionTraitement(value).designation;
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
              2: 'A imputer',
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
    };
  },
  props: {
    id: {
      type: String,
    },
  },
  computed: {
    ...mapState({
      listInterventions: (state) =>
        state.intervention.liste.filter((e) => e.statut > 1),
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
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
      return this.listInterventions.map((i) => ({
        ...i,
        type_intervention: this.getTypeIntervention(i.type_intervention_id)
          .designation,
        localite: this.getLocalite(i.localite_id).designation,
        getEcritures: () =>
          ComptabiliteService.getEcrituresForInterventions(i.id),
        columns: this.ecritureColumns,
      }));
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id],
      };
      this.$refs.vuetable_frais_interventions.toggleDetailRow(id);
    },
    imputerIntervention(interventionId) {
      //TODO

      this.SHOW_MODAL({
        component: 'ModalImputerIntervention',
        data: { id: interventionId },
        size: 2,
      });
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
        data: local,
      };
    },
    onRowClass(dataItem) {
      const statutsClass = {
        0: '', //'A saisir',
        1: '', //'A valider',
        2: 'table-warning', //'A imputer',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style scoped></style>

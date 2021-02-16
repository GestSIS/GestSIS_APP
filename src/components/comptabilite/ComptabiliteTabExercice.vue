<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Exercices</h3>
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
          ref="vuetable_frais_exercices"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          :data-manager="dataManager"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          no-data-template="Aucune écriture à afficher"
          :detail-row-component="detailRow"
        >
          <div slot="details" slot-scope="props" class="d-flex">
            <button
              class="btn btn-link border-0"
              @click="toggleDetails(props.rowData.id)"
              v-if="props.rowData.statut === 4"
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
              v-if="props.rowData.statut === 3"
              @click="imputerExercice(props.rowData.id)"
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
import ImputationService from '@/services/ImputationService';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

export default {
  name: 'FraisTabExercice',
  components: {
    Vuetable,
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListeExercice').then(() => {
        this.loading = false;
        this.$refs.vuetable_frais_exercices.setData(this.computedData);
      });
    },
    listExercices() {
      this.loading = true;
      this.$refs.vuetable_frais_exercices.setData(this.computedData);
      this.loading = false;
    },
  },
  mounted() {
    if (this.listSapeurs.length === 0) {
      this.$store.dispatch('fetchListeSapeur');
    }

    if (this.localites.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }
    if (this.exerciceCategories.length === 0) {
      this.$store.dispatch('fetchExerciceCategories');
    }

    if (this.listeExerciceComptable.length === 0) {
      //console.log('Warning')
    }
    if (this.currentExerciceComptableId || 0 !== 0) {
      this.$store.dispatch('fetchListeExercice').then(() => {
        this.loading = false;
        this.$refs.vuetable_frais_exercices.setData(this.computedData);
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
          dataClass: 'align-middle details-width',
        },
        {
          title: 'Date',
          name: 'date',
          sortField: 'date',
        },
        {
          title: 'Categorie',
          name: 'categorie',
          sortField: 'categorie',
        },
        {
          title: 'Heure',
          name: 'heure',
          formatter(value) {
            return value.slice(0, 5);
          },
          sortField: 'heure',
        },
        {
          title: 'Duree',
          name: 'duree',
          sortField: 'duree',
        },
        {
          title: 'Localité',
          name: 'localite',
          sortField: 'localite',
        },
        {
          title: 'Lieu',
          name: 'lieu',
          sortField: 'lieu',
        },
        {
          title: 'Designation',
          name: 'designation',
          sortField: 'designation',
        },
        {
          title: 'statut',
          name: 'statut',
          sortField: 'statut',
          formatter(value) {
            const statuts = {
              0: 'Annulé',
              1: 'A saisir',
              2: 'En attente de validation',
              3: 'A imputer',
              4: 'Imputée',
            };
            return statuts[value];
          },
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
      listExercices: (state) =>
        state.exercice.liste.filter((e) => e.statut > 2),
      listSapeurs: (state) => state.sapeur.liste,
      localites: (state) => state.localite.liste,
      exerciceCategories: (state) => state.exerciceCategorie.liste,
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    ...mapGetters(['getExerciceCategorie', 'getLocalite', 'getSapeur']),
    computedData() {
      return this.listExercices.map((s) => ({
        ...s,
        categorie: this.getExerciceCategorie(s.exercice_categorie_id)
          .designation,
        localite: this.getLocalite(s.localite_id).designation,
        getEcritures: () => ImputationService.getEcrituresForExercice(s.id),
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
      this.$refs.vuetable_frais_exercices.toggleDetailRow(id);
    },
    imputerExercice(exerciceId) {
      //TODO

      this.SHOW_MODAL({
        component: 'ModalImputerExercice',
        data: { id: exerciceId },
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
        0: '', //'Annulé',
        1: '', //'A saisir',
        2: '', //'En attente de validation',
        3: 'table-warning', //'A imputer',
        4: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>

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
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <vuetable
          v-show="!loading"
          ref="vuetable_frais_sapeurs"
          :api-mode="false"
          :fields="fields"
          :css="css.table"
          :data-manager="dataManager"
          :row-class="onRowClass"
          detail-row-class="m-td-0"
          :detail-row-component="detailRow"
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
          <!-- <div slot="actions" slot-scope="props">
            <button
              class="btn btn-outline-primary border-0"
              v-if="props.rowData.statut === 2"
              @click="imputerIntervention(props.rowData.id)"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div> -->
        </vuetable>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import FraisEcritureDetails from '@/components/FraisEcritureDetails';
import ComptabiliteService from '@/services/ComptabiliteService';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

export default {
  name: 'FraisTabSapeur',
  components: {
    Vuetable
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      this.$store.dispatch('fetchListIntervention').then(() => {
        this.loading = false;
        this.$refs.vuetable_frais_sapeurs.setData(this.computedData);
      });
    },
    listInterventions() {
      this.loading = true;
      this.$refs.vuetable_frais_sapeurs.setData(this.computedData);
      this.loading = false;
    }
  },
  mounted() {
    //TODO Fetch only if neccessary
    this.$store.dispatch('fetchListSapeur');

    // this.$store.dispatch('fetchLocalites');
    // this.$store.dispatch('fetchStatFederals');
    // this.$store.dispatch('fetchTypeInterventions');
    // this.$store.dispatch('fetchInterventionTraitements');

    if (this.currentExerciceComptableId || 0 !== 0) {
      ComptabiliteService.getEcrituresForExerciceComptable(
        this.currentExerciceComptableId
      ).then(data => {
        this.ecritures = data;
        this.loading = false;
        this.$refs.vuetable_frais_sapeurs.setData(this.computedData);
      });
    }
  },
  data() {
    return {
      css: CssForBootstrap4,
      toggles: {},
      detailRow: FraisEcritureDetails,
      loading: true,
      ecritures: [],
      ecritureColumns: [
        {
          title: 'Ecriture',
          field: 'designation'
        },
        {
          title: 'Solde',
          field: 'solde',
          headerClassName: 'text-center',
          className: 'text-right'
        },
        {
          title: 'Indemnité',
          field: 'indemnite',
          headerClassName: 'text-center',
          className: 'text-right'
        },
        {
          title: 'Frais',
          field: 'frais',
          headerClassName: 'text-center',
          className: 'text-right'
        },
        {
          title: 'Quantité',
          field: 'quantite',
          headerClassName: 'text-center',
          className: 'text-right'
        },
        {
          title: 'Taux',
          field: 'taux',
          headerClassName: 'text-center',
          className: 'text-right'
        },
        {
          title: 'Total',
          field: 'total',
          headerClassName: 'text-center',
          className: 'text-right'
        }
      ],
      fields: [
        {
          title: '',
          name: 'details',
          dataClass: 'align-middle details-width'
        },
        {
          title: 'Sapeur',
          name: 'nomPrenom',
          sortField: 'nomPrenom',
          dataClass: 'align-middle'
        },
        {
          title: 'Fonction',
          name: 'fonction',
          sortField: 'fonction',
          dataClass: 'align-middle'
        },
        {
          title: 'Total',
          name: 'total',
          sortField: 'montant',
          dataClass: 'align-middle'
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
      listInterventions: state =>
        state.intervention.liste.filter(e => e.statut > 1),
      listeSapeurs: state => state.sapeur.liste,
      listExerciceComptable: state => state.exerciceComptable.liste,
      currentExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    ...mapGetters([
      'activeInterventionId',
      'getTypeIntervention',
      'getLocalite',
      'getStatFederal',
      'getFonction',
      'getInterventionTraitement',
      'getSapeur'
    ]),
    computedData() {
      // Details of ecritures for an intervention will be loaded on the flight
      let ecrituresBySapeur = this.ecritures.reduce((acc, e) => {
        acc.set(e.sapeur_id, [...(acc.get(e.sapeur_id) || []), e]);
        return acc;
      }, new Map());

      return this.listeSapeurs
        .filter(s => ecrituresBySapeur.has(s.id))
        .map(s => ({
          id: s.id,
          nomPrenom: `${s.nom} ${s.prenom}`,
          fonction: s.fonction_id ? this.getFonction(s.fonction_id).nom : '',
          total: ecrituresBySapeur.get(s.id).reduce((a, b) => a + +b.total, 0),
          getEcritures: () => Promise.resolve(ecrituresBySapeur.get(s.id)),
          columns: this.ecritureColumns
        }));
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id]
      };
      this.$refs.vuetable_frais_sapeurs.toggleDetailRow(id);
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
        0: '', //'A saisir',
        1: '', //'A valider',
        2: 'table-warning', //'A imputer',
        3: 'table-success' //'Imputée'
      };
      return statutsClass[dataItem.statut];
    }
  }
};
</script>

<style scoped></style>

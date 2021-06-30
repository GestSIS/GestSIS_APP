<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Sapeurs</h3>
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
          ref="vuetable_frais_sapeurs"
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
              @click="
                genererDecompteSapeur(props.rowData.id, props.rowData.nomPrenom)
              "
              title="Décompte sapeur"
              :disabled="!props.rowData.aPayer"
            >
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
            </button>
          </div>
          <!-- <div slot="actions" slot-scope="props" class="d-flex">
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
import store from '@/store/index';
import { mapState, mapGetters, mapMutations } from 'vuex';

import FraisEcritureDetails from '@/components/comptabilite/FraisEcritureDetails';
import ImputationService from '@/services/ImputationService';

import Vuetable from 'vuetable-2';
import CssForBootstrap4 from '@/assets/vuetableCssConfig.js';
import _ from 'lodash';

async function loadData(_, next) {
  const loadExercicesComptable = store.dispatch('fetchExercicesComptables');
  const loadSapeur = store.dispatch('fetchListeSapeur');
  const loadFonction = store.dispatch('fetchFonctions');

  Promise.all([loadExercicesComptable, loadSapeur, loadFonction]).then(() => {
    next();
  });
}

export default {
  name: 'FraisTabSapeur',
  components: { Vuetable },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  watch: {
    currentExerciceComptableId() {
      this.loading = true;
      ImputationService.getEcrituresForExerciceComptable(
        this.currentExerciceComptableId
      ).then((data) => {
        this.ecritures = data;
        this.loading = false;
        this.$refs.vuetable_frais_sapeurs.setData(this.computedData);
      });
    },
  },
  mounted() {
<<<<<<< HEAD:src/components/comptabilite/ComptabiliteTabSapeur.vue
    this.loading = true;
    ImputationService.getEcrituresForExerciceComptable(
      this.currentExerciceComptableId
    ).then((data) => {
      this.ecritures = data;
      this.loading = false;
      this.$refs.vuetable_frais_sapeurs.setData(this.computedData);
    });
=======
    //TODO Fetch only if neccessary
    this.$store.dispatch('fetchListeSapeur');
    this.$store.dispatch('fetchFonctions');

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
>>>>>>> af58aaa4d3fc18217069e0685c7c9fd04aff1b10:src/components/frais/FraisTabSapeur.vue
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
          field: 'designation',
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
          title: 'Frais',
          field: 'frais',
          headerClassName: 'text-center',
          className: 'text-right',
        },
        {
          title: 'Amende',
          field: 'amende',
          formatter: (amende, ecriture) => (amende ? ecriture.total : '0.00'),
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
          title: 'Taux',
          field: 'taux',
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
          dataClass: 'details-width',
        },
        {
          title: 'Sapeur',
          name: 'nomPrenom',
          sortField: 'nomPrenom',
        },
        {
          title: 'Fonction',
          name: 'fonction',
          sortField: 'fonction',
        },
        {
          title: 'Total',
          name: 'total',
          sortField: 'total',
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
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      listeSapeurs: (state) => state.sapeur.liste,
    }),
    ...mapGetters([
      'activeInterventionId',
      'getTypeIntervention',
      'getLocalite',
      'getStatFederal',
      'getFonction',
      'getInterventionTraitement',
      'getSapeur',
    ]),
    computedData() {
      // Details of ecritures for an intervention will be loaded on the flight
      let ecrituresBySapeur = this.ecritures
        .filter((s) => s.sapeur_id)
        .reduce((acc, e) => {
          acc.set(e.sapeur_id, [...(acc.get(e.sapeur_id) || []), e]);
          return acc;
        }, new Map());

      return this.listeSapeurs
        .filter((s) => ecrituresBySapeur.has(s.id))
        .map((s) => {
          return {
            id: s.id,
            nomPrenom: `${s.nom} ${s.prenom}`,
            fonction: s.fonction_id ? this.getFonction(s.fonction_id).nom : '',
            aPayer:
              ecrituresBySapeur
                .get(s.id)
                .findIndex((e) => e.decompte_id == null && !e.amende) >= 0,
            total: ecrituresBySapeur
              .get(s.id)
              .reduce((a, b) => a + (b.amende ? -b.total : +b.total), 0),
            getEcritures: () => Promise.resolve(ecrituresBySapeur.get(s.id)),
            columns: this.ecritureColumns,
          };
        });
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    genererDecompteSapeur(sapeurId, sapeur) {
      this.SHOW_MODAL({
        component: 'modalDecompte',
        data: {
          type: 'sapeur',
          sapeurId,
          designation: sapeur,
        },
      });
    },
    toggleDetails(id) {
      this.toggles = {
        ...this.toggles,
        [id]: !this.toggles[id],
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

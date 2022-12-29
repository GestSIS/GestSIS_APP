<template>
  <stateful-filter
    id="interventions"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div class="col-12 col-md-4 col-xl-3">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Actions</h3>
          </div>
          <div class="card-body d-grid gap-1">
            <button
              v-if="!selectedItem || selectedItem?.statut == 2"
              class="btn btn-outline-primary"
              :disabled="!selectedItem"
              @click="imputer(selectedItem.id)"
            >
              Imputer
            </button>
            <button
              v-if="selectedItem?.statut == 3"
              class="btn btn-outline-danger"
              @click="annulerImputer(selectedItem.id)"
            >
              Annuler l'imputation
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
            <div class="row">
              <base-select
                class="col-md-4"
                base-option="&lt;Localité&gt;"
                :options="filteredLocalites"
                :model-value="filters.localite_id"
                @update:model-value="(value) => setFilter('localite_id', value)"
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Type&gt;"
                :options="filteredTypesIntervention"
                :model-value="filters.type_intervention_id"
                @update:model-value="
                  (value) => setFilter('type_intervention_id', value)
                "
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Statistique fédérale&gt;"
                :options="filteredStatFederal"
                :model-value="filters.stat_federal_id"
                @update:model-value="
                  (value) => setFilter('stat_federal_id', value)
                "
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Traitement&gt;"
                :options="traitements"
                :model-value="filters.intervention_traitement_id"
                @update:model-value="
                  (value) => setFilter('intervention_traitement_id', value)
                "
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Etendue&gt;"
                :options="degres"
                :model-value="filters.degre"
                @update:model-value="(value) => setFilter('degre', value)"
              />
              <div v-if="canReset" class="col-md-4">
                <button class="btn btn-sm btn-warning w-100" @click="reset">
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-12 col-xl-12">
        <div class="card card-primary card-outline mb-3 table-responsive">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Interventions</h3>
            <!--          <button @click.prevent="save" class="btn btn-primary">-->
            <!--            Enregistrer-->
            <!--          </button>-->
          </div>
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :fields="fields"
            :row-class="onRowClass"
            no-data="Aucune écriture à afficher"
            :detail-row-column="true"
            :detail-row-column-hide-button="(r) => r.statut !== 3"
            :detail-row-component="detailRowComponent"
            :detail-row-options="detailRowOptions"
            detail-row-class="m-td-0"
            :data="filteredData"
            :selectable="true"
            @selected="selected"
          >
            <template #actions="{ rowData }">
              <button
                v-if="rowData.statut === 2"
                class="btn btn-outline-primary border-0"
                @click="imputer(rowData.id)"
              >
                <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<script>
import store from '/src/store/index';
import { mapState, mapMutations } from 'vuex';
import { markRaw } from 'vue';

import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import ImputationService from '/src/services/ImputationService.js';

async function loadData(_, next) {
  const loadExercicesComptables = store.dispatch('fetchExercicesComptables');
  const loadInterventions = store.dispatch('fetchListeIntervention');
  const loadTypes = store.dispatch('fetchTypeInterventions');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadStatFederal = store.dispatch('fetchStatFederals');
  const loadTraitement = store.dispatch('fetchInterventionTraitements');
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');

  Promise.all([
    loadExercicesComptables,
    loadInterventions,
    loadSapeurs,
    loadTypes,
    loadLocalites,
    loadStatFederal,
    loadTraitement,
    loadIndemnites,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ComptabiliteTabIntervention',

  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    let svm = this;
    return {
      degres: [
        { id: 1, designation: 'Fausse alarme' },
        { id: 2, designation: 'Petite' },
        { id: 3, designation: 'Moyenne' },
        { id: 4, designation: 'Grande' },
      ],
      detailRowComponent: markRaw(GenericDetailsRow),
      loading: false,
      selectedItemId: null,
      detailRowOptions: {
        fields: [
          {
            title: 'Sapeur',
            key: 'sapeur_id',
            formatter: (field) =>
              svm.sapeurs.find((s) => s.id == field)?.nom_prenom,
          },
          {
            title: 'Tarif',
            key: 'tarif',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Tarif min',
            key: 'tarif_min',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Pour',
            key: 'tarif_min_pour',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Pro-rata',
            key: 'tarif_min_pro_rata',
            type: Boolean,
            titleClass: 'text-center',
            columnClass: 'text-center',
          },
          {
            title: 'Unité',
            key: 'type_unite_id',
            titleClass: 'text-center',
            columnClass: 'text-end',
            formatter: (id) => svm.unites.find((u) => u.id == id)?.abreviation,
          },
          {
            title: 'Taux',
            key: 'taux',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Taux description',
            key: 'taux_description',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Quantité',
            key: 'quantite',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
          {
            title: 'Total',
            key: 'total',
            titleClass: 'text-center',
            columnClass: 'text-end',
          },
        ],
      },
      fields: [
        {
          title: 'Date',
          key: 'date_debut',
          type: Date,
        },
        {
          title: 'Heure',
          key: 'heure_debut',
          formatter(value) {
            return value.slice(0, 5);
          },
        },
        {
          title: "Type d'intervention",
          key: 'type_intervention',
        },
        {
          title: 'Localité',
          key: 'localite_id',
          formatter(value) {
            return svm.localites.find((l) => l.id == value)?.designation;
          },
        },
        {
          title: 'Lieu',
          key: 'lieu',
        },
        {
          title: 'Stat fédérale',
          key: 'stat_federal_id',
          formatter(value) {
            return svm.statsFederal.find((s) => s.id == value)?.designation;
          },
        },
        {
          title: 'Traitement',
          key: 'intervention_traitement_id',
          formatter(value) {
            return svm.traitements.find((t) => t.id == value)?.designation;
          },
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
        },
        {
          title: 'Statut',
          key: 'statut',
          formatter(value) {
            const statuts = {
              0: 'A saisir',
              1: 'A valider',
              2: 'Validée',
              3: 'Imputée',
            };
            return statuts[value];
          },
        },
        {
          title: 'Actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      interventions: (state) =>
        state.intervention.liste
          .filter((e) => e.statut > 1)
          .sort((a, b) => a.date_debut.localeCompare(b.date_debut)),
      exercicesComptable: (state) => state.exerciceComptable.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      typesIntervention: (state) => state.typeIntervention.liste,
      statsFederal: (state) => state.statFederal.liste,
      traitements: (state) => state.interventionTraitement.liste,
      localites: (state) => state.localite.liste,
      activeInterventionId: (state) => state.intervention.active.id,
      unites: (state) => state.unite.liste,
    }),
    selectedItem() {
      return this.interventions.find((i) => i.id == this.selectedItemId);
    },
    computedData() {
      return this.interventions.map((i) => ({
        ...i,
        type_intervention: this.typesIntervention.find(
          (t) => t.id == i.type_intervention_id
        )?.designation,
        localite: this.localites.find((l) => l.id == i.localite_id)
          ?.designation,
        getData: () => ImputationService.getEcrituresForInterventions(i.id),
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
  },
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchListeIntervention');
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(item) {
      this.selectedItemId = item?.id;
    },
    imputer(interventionId) {
      this.SHOW_MODAL({
        component: 'ModalImputerIntervention',
        data: { id: interventionId },
        size: 2,
      });
    },
    annulerImputer(interventionId) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette imputation ?',
          question:
            "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau cette intervention.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('annulerImputationIntervention', interventionId)
              .catch((err) => {
                this.$awn.alert(
                  err?.message ?? "Erreur impossible d'annuler l'imputation"
                );
              });
          }
        },
      });
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }

      const statutsClass = {
        0: '', //'A saisir',
        1: '', //'A valider',
        2: 'table-warning', //'Validée',
        3: 'table-success', //'Imputée'
      };
      return statutsClass[dataItem.statut];
    },
  },
};
</script>

<style scoped></style>

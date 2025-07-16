<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';
import ImputationService from '/src/services/ImputationService.js';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
await store.dispatch('fetchExercicesComptables');

store.dispatch('fetchTypeInterventions');
store.dispatch('fetchListeSapeur');
store.dispatch('fetchLocalites');
store.dispatch('fetchStatFederals');
store.dispatch('fetchInterventionTraitements');
store.dispatch('fetchFraisIndemnitesTypes');

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchListeIntervention',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const sapeurs = computed(() => store.state.sapeur.liste);
const interventions = computed(() =>
  store.state.intervention.liste
    .filter((e) => e.statut > 1)
    .sort((a, b) => a.date_debut.localeCompare(b.date_debut)),
);
const typesIntervention = computed(() => store.state.typeIntervention.liste);
const statsFederal = computed(() => store.state.statFederal.liste);
const traitements = computed(() => store.state.interventionTraitement.liste);
const localites = computed(() => store.state.localite.liste);
const unites = computed(() => store.state.unite.liste);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);
const computedData = computed(() => {
  return interventions.value.map((i) => ({
    ...i,
    type_intervention: typesIntervention.value.find(
      (t) => t.id == i.type_intervention_id,
    )?.designation,
    localite: localites.value.find((l) => l.id == i.localite_id)?.designation,
    getData: () => ImputationService.getEcrituresForInterventions(i.id),
  }));
});
const filteredTypesIntervention = computed(() => {
  const ids = new Set(interventions.value.map((i) => i.type_intervention_id));
  return typesIntervention.value.filter((t) => ids.has(t.id));
});
const filteredLocalites = computed(() => {
  const ids = new Set(interventions.value.map((i) => i.localite_id));
  return localites.value.filter((t) => ids.has(t.id));
});
const filteredStatFederal = computed(() => {
  const ids = new Set(interventions.value.map((i) => i.stat_federal_id));
  return statsFederal.value.filter((t) => ids.has(t.id));
});

const selectedId = ref(null);
const selected = (row) => (selectedId.value = row?.id ?? null);
const selectedItem = computed(() =>
  interventions.value.find((i) => i.id == selectedId.value),
);

const awn = inject('awn');
const { confirm, showModal } = useModalStore();

const imputer = (interventionId) =>
  showModal({
    component: 'ModalImputerIntervention',
    data: { id: interventionId },
    size: 2,
  });

const annulerImputer = (interventionId) =>
  confirm(
    'Voulez-vous vraiment supprimer cette imputation ?',
    "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau cette intervention.",
  ).then(() =>
    store
      .dispatch('annulerImputationIntervention', interventionId)
      .catch((err) => {
        awn.alert(err?.message ?? "Erreur impossible d'annuler l'imputation");
      }),
  );
const onRowClass = (dataItem, isSelected) => {
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
};

const degres = [
  { id: 1, designation: 'Fausse alarme' },
  { id: 2, designation: 'Petite' },
  { id: 3, designation: 'Moyenne' },
  { id: 4, designation: 'Grande' },
];
const detailRowOptions = {
  fields: [
    {
      title: 'Sapeur',
      key: 'sapeur_id',
      formatter: (field) =>
        sapeurs.value.find((s) => s.id == field)?.nom_prenom,
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
      formatter: (id) => unites.value.find((u) => u.id == id)?.abreviation,
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
};
const fields = [
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
      return localites.value.find((l) => l.id == value)?.designation;
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
      return statsFederal.value.find((s) => s.id == value)?.designation;
    },
  },
  {
    title: 'Traitement',
    key: 'intervention_traitement_id',
    formatter(value) {
      return traitements.value.find((t) => t.id == value)?.designation;
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
];
</script>

<template>
  <stateful-filter
    id="interventions"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="row">
      <div v-if="hasEditPermission" class="col-12 col-md-4 col-xl-3">
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
                class="col-md-4 mb-1"
                base-option="&lt;Localité&gt;"
                :options="filteredLocalites"
                :model-value="filters.localite_id"
                @update:model-value="(value) => setFilter('localite_id', value)"
              />
              <base-select
                class="col-md-4 mb-1"
                base-option="&lt;Type&gt;"
                :options="filteredTypesIntervention"
                :model-value="filters.type_intervention_id"
                @update:model-value="
                  (value) => setFilter('type_intervention_id', value)
                "
              />
              <base-select
                class="col-md-4 mb-1"
                base-option="&lt;Statistique fédérale&gt;"
                :options="filteredStatFederal"
                :model-value="filters.stat_federal_id"
                @update:model-value="
                  (value) => setFilter('stat_federal_id', value)
                "
              />
              <base-select
                class="col-md-4 mb-1"
                base-option="&lt;Traitement&gt;"
                :options="traitements"
                :model-value="filters.intervention_traitement_id"
                @update:model-value="
                  (value) => setFilter('intervention_traitement_id', value)
                "
              />
              <base-select
                class="col-md-4 mb-1"
                base-option="&lt;Etendue&gt;"
                :options="degres"
                :model-value="filters.degre"
                @update:model-value="(value) => setFilter('degre', value)"
              />
              <div v-if="canReset" class="col-md-4 mb-1">
                <button class="btn btn-sm btn-warning w-100" @click="reset">
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-12 col-xl-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Interventions</h3>
            <!--<button @click.prevent="save" class="btn btn-primary">-->
            <!--  Enregistrer-->
            <!--</button>-->
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune écriture à afficher"
              :detail-row-column="true"
              :detail-row-column-hide-button="(r) => r.statut !== 3"
              :data="filteredData"
              :selectable="true"
              @selected="selected"
            >
              <template #detail-row="{ rowData }">
                <generic-details-row
                  :options="detailRowOptions"
                  :row-data="rowData"
                />
              </template>
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission && rowData.statut === 2"
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
    </div>
  </stateful-filter>
</template>

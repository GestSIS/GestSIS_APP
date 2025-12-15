<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useCoursStore } from '../../stores/sapeur/Cours.js';
import { useCoursSapeurStore } from '../../stores/sapeur/CoursSapeur.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useExerciceCategorieStore } from '../../stores/exercice/ExerciceCategorie.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { useModalStore } from '../../stores/common/Modal.js';
import useHasPermission from '../../composables/usePermission.js';
import permissions from '../../composables/permissions.js';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';

const sapeurStore = useSapeurStore();
const coursStore = useCoursStore();
const coursSapeurStore = useCoursSapeurStore();
const localiteStore = useLocaliteStore();
const uniteStore = useUniteStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const exerciceComptableStore = useExerciceComptableStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();

await exerciceComptableStore.fetchExercicesComptables();

ecritureCategorieStore.fetchEcritureCategories();
uniteStore.fetchUnites();
coursStore.fetchCours();
sapeurStore.fetchListeSapeur();
localiteStore.fetchLocalites();
imputationStore.fetchFraisIndemnitesTypes();
compteStore.fetchComptes();

const activeExerciceComptableId = computed(
  () => exerciceComptableStore.activeId,
);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await coursSapeurStore.fetchCoursSapeurs(activeExerciceComptableId.value);
  loading.value = false;
});

const selectedItemId = ref(null);
const selected = (item) => (selectedItemId.value = item?.id ?? null);
const selectedItem = computed(() =>
  coursSapeurs.value.find((c) => c.id === selectedItemId.value),
);

const cours = computed(() => coursStore.liste);
const unites = computed(() => uniteStore.liste);
const coursSapeurs = computed(() =>
  coursSapeurStore.liste.map((e) => ({ ...e.cours, ...e })),
);
const sapeurs = computed(() => sapeurStore.liste);
const localites = computed(() => localiteStore.liste);
const categories = computed(() => exerciceCategorieStore.liste);
const hasEditPermission = useHasPermission(
  permissions.COMPTABILITE.MODIFICATION,
);

const computedData = computed(() => {
  return coursSapeurs.value.map((e) => ({
    ...e,
    categorie: categories.value.find((c) => c.id == e.exercice_categorie_id)
      ?.designation,
    localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
    nom_prenom: sapeurs.value.find((s) => s.id == e.sapeur_id)?.nom_prenom,
    getData: () => Promise.resolve(e.ecritures),
  }));
});
const filteredLocalites = computed(() => {
  const ids = new Set(coursSapeurs.value.map((i) => i.localite_id));
  return localites.value.filter((t) => ids.has(t.id));
});
const filteredSapeurs = computed(() => {
  const ids = new Set(coursSapeurs.value.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});
const filteredDataTypes = computed(() => {
  const ids = new Set(coursSapeurs.value.map((i) => i.cours_id));
  return cours.value.filter((t) => ids.has(t.id));
});

const awn = useNotification();
const { confirm, showModal } = useModalStore();

const imputer = (courSapeur) => {
  showModal({
    component: 'ModalImputerCours',
    data: { id: courSapeur?.id },
    size: 2,
  });
};
const annulerImputer = (courSapeur) =>
  confirm(
    'Voulez-vous vraiment supprimer cette imputation ?',
    "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau cet exercice.",
  ).then(() =>
    imputationStore
      .annulerImputationCours(courSapeur?.id)
      .then(({ statut }) => {
        coursSapeurs.value = [
          ...coursSapeurs.value.filter((e) => e.id != courSapeur?.id),
          {
            ...coursSapeurs.value.find((e) => e.id == courSapeur?.id),
            statut: statut,
          },
        ].sort((a, b) => a.date.localeCompare(b.date));
      })
      .catch((err) => {
        awn.alert(err?.message ?? "Erreur impossible d'annuler l'imputation");
      }),
  );

const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }

  return dataItem?.ecritures?.length > 0 ? 'table-success' : 'table-warning';
};

const detailRowOptions = {
  fields: [
    {
      title: 'Sapeur',
      key: 'sapeur_id',
      formatter: (sapeurId) =>
        sapeurs.value.find((e) => e.id === sapeurId)?.nom_prenom,
    },
    {
      title: 'Type',
      key: 'type',
      formatter: (type) => {
        const mapping = {
          0: 'Autre',
          1: 'Solde',
          2: 'Indemnité',
          3: 'Frais forfaitaire',
          4: 'Frais effectif',
          5: 'Charges AVS/AC',
        };
        return mapping[type] || '';
      },
    },
    {
      title: 'Tarif',
      key: 'tarif',
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
    {
      title: 'Quantite',
      key: 'quantite',
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
    {
      title: 'Unite',
      key: 'type_unite_id',
      formatter: (type_unite_id) =>
        unites.value.find((u) => u.id == type_unite_id)?.unite,
    },
    {
      title: 'Total',
      key: 'total',
      formatter: (total, ecriture) => (ecriture.module == 5 ? -total : total),
      type: Number,
      titleClass: 'text-center',
      columnClass: 'text-end',
    },
  ],
};
const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Cours', key: 'designation' },
  { title: 'Sapeur', key: 'nom_prenom' },
  { title: 'Durée [jour]', key: 'duree' },
  { title: 'Localité', key: 'localite' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <stateful-filter
    id="cours"
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
              v-if="!selectedItem || !selectedItem?.ecritures?.length"
              class="btn btn-outline-primary"
              :disabled="!selectedItem"
              @click="imputer(selectedItem)"
            >
              Imputer
            </button>
            <button
              v-if="selectedItem?.ecritures?.length"
              class="btn btn-outline-danger"
              @click="annulerImputer(selectedItem)"
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
                base-option="&lt;Cours&gt;"
                :options="filteredDataTypes"
                :model-value="filters.cours_id"
                @update:model-value="(value) => setFilter('cours_id', value)"
              />
              <base-select
                class="col-md-4"
                display-key="nom_prenom"
                base-option="&lt;Sapeur&gt;"
                :options="filteredSapeurs"
                :model-value="filters.sapeur_id"
                @update:model-value="(value) => setFilter('sapeur_id', value)"
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Localité&gt;"
                :options="filteredLocalites"
                :model-value="filters.localite_id"
                @update:model-value="(value) => setFilter('localite_id', value)"
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
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Cours</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune écriture à afficher"
              :detail-row-column="true"
              :detail-row-column-hide-button="(r) => !r?.ecritures?.length"
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
                  v-if="hasEditPermission && rowData.ecritures?.length"
                  class="btn btn-outline-primary border-0"
                  title="Annuler imputation"
                  @click="annulerImputer(rowData)"
                >
                  <font-awesome-icon :icon="['fas', 'ban']" />
                </button>
                <button
                  v-if="hasEditPermission && !rowData.ecritures?.length"
                  class="btn btn-outline-primary border-0"
                  title="Imputer cours"
                  @click="imputer(rowData)"
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

<script setup>
import { computed, ref, watchEffect } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useModalStore } from "../../stores/common/Modal.js";
import GenericDetailsRow from "../table/GenericDetailsRow.vue";
import ImputationService from "/src/services/ImputationService.js";
import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";

const localiteStore = useLocaliteStore();
const sapeurStore = useSapeurStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const exerciceComptableStore = useExerciceComptableStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();

await exerciceComptableStore.fetchExercicesComptables();

exerciceCategorieStore.fetchExerciceCategories();
sapeurStore.fetchListeSapeur();
localiteStore.fetchLocalites();
imputationStore.fetchFraisIndemnitesTypes();
compteStore.fetchComptes();

const loading = ref(false);
const exercices = ref([]);
const init = async () => {
  loading.value = true;
  const ecritures = await ImputationService.getExerciceEcriturePourExerciceComptable(
    exerciceComptableStore.activeId,
  );
  exercices.value = [...ecritures].sort((a, b) => a.date.localeCompare(b.date));
  loading.value = false;
};
watchEffect(init);

const selectedItemId = ref(null);
const selected = (item) => (selectedItemId.value = item?.id ?? null);
const selectedItem = computed(() => exercices.value.find((e) => e.id === selectedItemId.value));

const sapeurs = computed(() => sapeurStore.liste);
const localites = computed(() => localiteStore.liste);
const categories = computed(() => exerciceCategorieStore.liste);
const hasEditPermission = useHasPermission(permissions.COMPTABILITE.MODIFICATION);

const computedData = computed(() => {
  return exercices.value.map((e) => {
    let aPayer = e.statut == 4;
    if (e.statut == 4) {
      aPayer = e.ecritures.findIndex((i) => i.decompte_id == null) >= 0;
    }
    return {
      ...e,
      categorie: categories.value.find((c) => c.id == e.exercice_categorie_id)?.designation,
      localite: localites.value.find((l) => l.id == e.localite_id)?.designation,
      aPayer,
      getData: () => Promise.resolve(e.ecritures),
    };
  });
});
const filteredLocalites = computed(() => {
  const ids = new Set(exercices.value.map((i) => i.localite_id));
  return localites.value.filter((t) => ids.has(t.id));
});
const filteredCategories = computed(() => {
  const ids = new Set(exercices.value.map((i) => i.exercice_categorie_id));
  return categories.value.filter((t) => ids.has(t.id));
});

const awn = useNotification();
const { confirm, showModal } = useModalStore();

const genererDecompteExercice = (exerciceId, designation) =>
  showModal({
    component: "ModalDecompte",
    data: {
      exerciceId,
      designation,
    },
    callback: init,
  });
const imputer = (exerciceId) =>
  showModal({
    component: "ModalImputerExercice",
    data: { id: exerciceId },
    size: 2,
    callback: init,
  });
const annulerImputer = (exerciceId) =>
  confirm(
    "Voulez-vous vraiment supprimer cette imputation ?",
    "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau cet exercice.",
  ).then(() =>
    imputationStore
      .annulerImputationExercice(exerciceId)
      .then(({ statut }) => {
        exercices.value = [
          ...exercices.value.filter((e) => e.id != exerciceId),
          {
            ...exercices.value.find((e) => e.id == exerciceId),
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

  const statutsClass = {
    0: "", //'Annulé',
    1: "", //'A saisir',
    2: "", //'En attente de validation',
    3: "table-warning", //'Validé',
    4: "table-success", //'Imputé'
  };
  return statutsClass[dataItem.statut];
};

const detailRowOptions = {
  fields: [
    {
      title: "Sapeur",
      key: "sapeur_id",
      formatter: (sapeurId) => sapeurs.value.find((e) => e.id === sapeurId)?.nom_prenom,
    },
    {
      title: "Type",
      key: "type",
      formatter: (type) => {
        const mapping = {
          0: "Autre",
          1: "Solde",
          2: "Indemnité",
          3: "Frais forfaitaire",
          4: "Frais effectif",
          5: "Charges AVS/AC",
        };
        return mapping[type] || "";
      },
    },
    {
      title: "Tarif",
      key: "tarif",
      titleClass: "text-center",
      columnClass: "text-end",
    },
    {
      title: "Quantite",
      key: "quantite",
      titleClass: "text-center",
      columnClass: "text-end",
    },
    {
      title: "Amende",
      key: "total",
      formatter: (total, ecriture) => (ecriture.module == 5 ? ecriture.total : "0.00"),
      titleClass: "text-center",
      columnClass: "text-end",
    },
    {
      title: "Total",
      key: "total",
      formatter: (total, ecriture) => (ecriture.module == 5 ? -total : total),
      type: Number,
      titleClass: "text-center",
      columnClass: "text-end",
    },
  ],
};
const fields = [
  {
    title: "Date",
    key: "date",
    type: Date,
  },
  {
    title: "Categorie",
    key: "categorie",
  },
  {
    title: "Heure",
    key: "heure",
    formatter(value) {
      return value.slice(0, 5);
    },
  },
  {
    title: "Duree",
    key: "duree",
  },
  {
    title: "Localité",
    key: "localite",
  },
  {
    title: "Lieu",
    key: "lieu",
  },
  {
    title: "Designation",
    key: "designation",
  },
  {
    title: "statut",
    key: "statut",
    formatter(value) {
      const statuts = {
        0: "Annulé",
        1: "A saisir",
        2: "En attente de validation",
        3: "Validé",
        4: "Imputé",
      };
      return statuts[value];
    },
  },
  {
    title: "Actions",
    slot: "actions",
    titleClass: "align-middle text-center",
    columnClass: "align-middle text-center",
  },
];
</script>

<template>
  <stateful-filter
    id="exercices"
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
              v-if="!selectedItem || selectedItem?.statut == 3"
              class="btn btn-outline-primary"
              :disabled="!selectedItem"
              @click="imputer(selectedItem.id)"
            >
              Imputer
            </button>
            <button
              v-if="selectedItem?.statut == 4"
              class="btn btn-outline-danger"
              @click="annulerImputer(selectedItem.id)"
            >
              Annuler l'imputation
            </button>
            <button
              class="btn btn-outline-primary"
              :disabled="selectedItem?.statut != 4"
              @click="genererDecompteExercice(selectedItem.id, selectedItem.designation)"
            >
              Créer un décompte
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
                base-option="&lt;Catégorie&gt;"
                :options="filteredCategories"
                :model-value="filters.exercice_categorie_id"
                @update:model-value="(value) => setFilter('exercice_categorie_id', value)"
              />
              <base-select
                class="col-md-4"
                base-option="&lt;Statut&gt;"
                :options="[
                  { id: '3', designation: 'Validé' },
                  { id: '4', designation: 'Imputé' },
                ]"
                :model-value="filters.statut"
                @update:model-value="(value) => setFilter('statut', value)"
              />
              <div v-if="canReset" class="col-md-4">
                <button class="btn btn-sm btn-warning w-100" @click="reset">Réinitialiser</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-12 col-xl-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Exercices</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucune écriture à afficher"
              :detail-row-column="true"
              :detail-row-column-hide-button="(r) => r.statut !== 4"
              :data="filteredData"
              :selectable="true"
              @selected="selected"
            >
              <template #detail-row="{ rowData }">
                <generic-details-row :options="detailRowOptions" :row-data="rowData" />
              </template>
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission && rowData.statut === 3"
                  class="btn btn-outline-primary border-0"
                  @click="imputer(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" />
                </button>
                <button
                  v-if="hasEditPermission && rowData.statut === 4"
                  class="btn btn-outline-primary border-0"
                  title="Décompte sapeur"
                  :disabled="!rowData.aPayer"
                  @click="genererDecompteExercice(rowData.id, rowData.designation)"
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

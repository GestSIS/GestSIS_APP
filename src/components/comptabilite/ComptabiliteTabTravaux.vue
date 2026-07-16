<script setup>
import { computed, ref, watchEffect } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useTravailStore } from "../../stores/travail/Travail.js";
import { useTravailTypeStore } from "../../stores/travail/TravailType.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";

import GenericDetailsRow from "../table/GenericDetailsRow.vue";
import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";

const uniteStore = useUniteStore();
const travailStore = useTravailStore();
const travailTypeStore = useTravailTypeStore();
const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const imputationStore = useImputationStore();

await exerciceComptableStore.fetchExercicesComptables();

ecritureCategorieStore.fetchEcritureCategories();
uniteStore.fetchUnites();
sapeurStore.fetchListeSapeur();
travailTypeStore.fetchTravailTypes();
compteStore.fetchComptes();

const activeExerciceComptableId = computed(() => exerciceComptableStore.activeId);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await travailStore.fetchTravaux(activeExerciceComptableId.value);
  loading.value = false;
});

const selectedId = ref(null);
const selected = (row) => (selectedId.value = row?.id ?? null);
const selectedItem = computed(() => {
  return travaux.value.find((c) => c.id == selectedId.value);
});

const travaux = computed(() => travailStore.liste.filter((t) => t.statut >= 1));
const sapeurs = computed(() => sapeurStore.liste);
const travailTypes = computed(() => travailTypeStore.liste);
const unites = computed(() => uniteStore.liste);
const hasEditPermission = useHasPermission(permissions.COMPTABILITE.MODIFICATION);

const computedData = computed(() => {
  return travaux.value.map((e) => ({
    ...e,
    travail_type: travailTypes.value.find((t) => t.id == e.travail_type_id)?.designation,
    sapeur: sapeurs.value.find((s) => s.id == e.sapeur_id)?.nom_prenom,
    auteur: sapeurs.value.find((s) => s.id == e.auteur_id)?.nom_prenom,
    unite: unites.value.find(
      (u) => u.id == travailTypes.value.find((t) => t.id == e.travail_type_id)?.type_unite_id,
    )?.unite,
    getData: () => Promise.resolve(e.ecritures),
  }));
});
const filteredSapeurs = computed(() => {
  const ids = new Set(travaux.value.map((i) => i.sapeur_id));
  return sapeurs.value.filter((t) => ids.has(t.id));
});
const filteredTravailTypes = computed(() => {
  const ids = new Set(travaux.value.map((i) => i.travail_type_id));
  return travailTypes.value.filter((t) => ids.has(t.id));
});

const awn = useNotification();
const { confirm, showModal } = useModalStore();

const imputer = (travailId) => {
  const ids = travailId ? [travailId] : travaux.value.filter((t) => t.statut == 1).map((t) => t.id);

  if (!ids.length) {
    awn.warning("Aucun travail à impossible");
    return;
  }

  imputationStore
    .imputerTravail(ids)
    .then((res) => {
      travailStore.fetchTravaux(activeExerciceComptableId.value);
      awn.success(res?.message ?? "Travaux imputé avec succès");
    })
    .catch((err) => {
      awn.alert(err?.message ?? "Erreur impossible d'annuler l'imputation");
    });
};
const annulerImputer = (travailId) =>
  confirm(
    "Voulez-vous vraiment supprimer cette imputation ?",
    "Attention, la suppression d'une imputation est irréversible ! Il vous sera cependant possible de réimputer à nouveau ce travail.",
  ).then(() =>
    imputationStore
      .annulerImputationTravail(travailId)
      .then((res) => {
        awn.success(res?.message ?? "Travaux imputé avec succès");
      })
      .catch((err) => {
        awn.alert(err?.message ?? "Erreur impossible d'annuler l'imputation");
      }),
  );

const onRowClass = (dataItem, isSelected) => {
  if (isSelected) {
    return;
  }

  return dataItem?.statut == 2 ? "table-success" : "table-warning";
};

const detailRowOptions = {
  fields: [
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
  { title: "Date", key: "date", type: Date },
  { title: "Sapeur", key: "sapeur" },
  { title: "Travail", key: "travail_type" },
  { title: "Désignation", key: "designation" },
  { title: "Quantité", key: "quantite" },
  { title: "Unité", key: "unite" },
  { title: "Auteur", key: "auteur" },
  { title: "Date demande", key: "date_demande", type: Date },
  {
    title: "Statut",
    key: "statut",
    formatter(statut) {
      return {
        [-1]: "Refusé",
        0: "En attente",
        1: "Accepté",
        2: "Imputé",
      }[statut];
    },
  },
  { title: "Justification", key: "justification" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <stateful-filter
    id="travaux"
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
              v-if="!selectedItem || selectedItem?.statut == 1"
              class="btn btn-outline-primary"
              :disabled="selectedItem?.statut != 1"
              @click="imputer(selectedId)"
            >
              Imputer le travail
            </button>
            <button
              v-if="selectedItem?.statut == 2"
              class="btn btn-outline-danger"
              @click="annulerImputer(selectedId)"
            >
              Annuler l'imputation du travail
            </button>
            <button class="btn btn-outline-primary" @click="imputer()">Tout imputer</button>
            <!-- <button
            v-if="selectedItem?.ecritures?.length"
            class="btn btn-outline-danger"
            @click="annulerImputer()"
          >
            Annuler toutes les imputations
          </button> -->
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
                display-key="nom_prenom"
                base-option="&lt;Sapeur&gt;"
                :options="filteredSapeurs"
                :model-value="filters.sapeur_id"
                @update:model-value="(value) => setFilter('sapeur_id', value)"
              />
              <base-select
                class="mb-1 col-md-4"
                :options="filteredTravailTypes"
                base-option="<Type>"
                :model-value="filters.travail_type_id"
                @update:model-value="(value) => setFilter('travail_type_id', value)"
              />
              <base-select
                class="col-md-4"
                base-option="<Statut>"
                :options="[
                  { id: [-1], designation: 'Refusé' },
                  { id: 0, designation: 'En attente' },
                  { id: 1, designation: 'Accepté' },
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
            <h3 class="card-title">Fiches de travails</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              :row-class="onRowClass"
              no-data="Aucun travail à afficher"
              :detail-row-column="true"
              :detail-row-column-hide-button="(r) => r.statut !== 2"
              :data="filteredData"
              :selectable="true"
              @selected="selected"
            >
              <template #detail-row="{ rowData }">
                <generic-details-row :options="detailRowOptions" :row-data="rowData" />
              </template>
              <template #actions="{ rowData }">
                <button
                  v-if="hasEditPermission && rowData.statut == 2"
                  class="btn btn-outline-primary border-0"
                  title="Annuler imputation"
                  @click="annulerImputer(rowData.id)"
                >
                  <font-awesome-icon :icon="['fas', 'ban']" />
                </button>
                <button
                  v-if="hasEditPermission && rowData.statut == 1"
                  class="btn btn-outline-primary border-0"
                  title="Imputer travail"
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

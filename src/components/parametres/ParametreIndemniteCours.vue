<script setup>
import { useUniteStore } from "../../stores/common/Unite.js";
import { useHeureExerciceStore } from "../../stores/exercice/HeureExercice.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";
import { useModalStore } from "../../stores/common/Modal.js";
import GenericDetailsRow from "../table/GenericDetailsRow.vue";
import { computed } from "vue";
import useNotification from "../../composables/useNotification.js";

const uniteStore = useUniteStore();
const heureExerciceStore = useHeureExerciceStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();

const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();
await heureExerciceStore.fetchHeuresExercice();

const fields = [
  {
    title: "Désignation",
    key: "designation",
  },
  { title: "Catégorie comptable", key: "categorie" },
  { title: "Actions", slot: "actions" },
];
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
    { title: "Tarif", key: "tarif" },
    { title: "Unité", key: "unite" },
    { title: "Compte", key: "compte" },
  ],
  noData: "Aucune indemnité",
};

const computedData = computed(() => {
  return imputationStore.fraisIndemnites.cours.map((c) => ({
    ...c,
    getData: () =>
      Promise.resolve(
        c.fonctions.map((e) => ({
          ...e,
          unite: uniteStore.liste.find((u) => u.id == e.type_unite_id)?.unite,
          compte: compteStore.liste.find((c) => c.id == e.compte_id)?.designation,
        })),
      ),
    categorie: ecritureCategorieStore.liste.find((e) => e.id == c.ecriture_categorie_id)
      ?.designation,
  }));
});

const { showModal } = useModalStore();
const awn = useNotification();

const ajoutIndemnite = () =>
  showModal({
    component: "ModalIndemniteCours",
    size: 1,
    data: {},
  });
const updateIndemnite = (indemnite) =>
  showModal({
    component: "ModalIndemniteCours",
    size: 1,
    data: { ...indemnite },
  });
const deleteIndemnite = (indemnite) =>
  imputationStore
    .removeIndemniteCours(indemnite.id)
    .catch((res) => awn.alert(res.message || "Erreur lors de la suppression"));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Imputation des cours</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnité
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="computedData"
        :fields="fields"
        no-data="Aucune indemnité de cours"
        :detail-row-column="true"
      >
        <template #detail-row="{ rowData }">
          <generic-details-row :options="detailRowOptions" :row-data="rowData" />
        </template>
        <template #actions="{ rowData }">
          <td class="align-middle text-center">
            <button
              type="button"
              class="btn btn-outline-primary border-0"
              @click="updateIndemnite(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              type="button"
              class="btn btn-outline-danger border-0"
              @click="deleteIndemnite(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </td>
        </template>
      </base-table>
    </div>
  </div>
</template>

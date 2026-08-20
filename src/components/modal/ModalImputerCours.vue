<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import MultiStep from "/src/components/base/MultiStep.vue";
import GenericDetailsRow from "../table/GenericDetailsRow.vue";

const { callback, data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const phase = ref(1);
const activeIndemnite = ref(null);
const ecritures = ref([]);
const successMessageVisibility = ref(true);

const sapeurStore = useSapeurStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const uniteStore = useUniteStore();
const exerciceComptableStore = useExerciceComptableStore();

const indemnitesTypes = computed(() => imputationStore.fraisIndemnites.cours);
const categories = computed(() => ecritureCategorieStore.liste);
const sapeurs = computed(() => sapeurStore.liste);
const comptes = computed(() => compteStore.liste);
const unites = computed(() => uniteStore.liste);
const anneeComptableId = computed(() => exerciceComptableStore.activeId);

const computedIndemnites = computed(() => {
  return indemnitesTypes.value.map((c) => ({
    ...c,
    getData: () =>
      Promise.resolve(
        c.fonctions.map((e) => ({
          ...e,
          unite: unites.value.find((u) => u.id == e.type_unite_id)?.unite,
          compte: comptes.value.find((c) => c.id == e.compte_id)?.designation,
        })),
      ),
    categorie: categories.value.find((e) => e.id == c.ecriture_categorie_id)?.designation,
  }));
});

const { closeModal } = useModalStore();
const awn = useNotification();

const selectIndemnite = (indemnite) => {
  activeIndemnite.value = indemnite;
};
const cancel = () => {
  // TODO Cancel depending on state
  (callback() ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};
const imputer = () => {
  if (activeIndemnite.value === null) {
    awn.warning("Veuillez sélectioner une indemnité type");
    return;
  }

  imputationStore
    .imputerCours({
      id: data.id,
      indemnite_cours_type_id: activeIndemnite.value.id,
      exercice_comptable_id: anneeComptableId.value,
    })
    .then((res) => {
      phase.value = 2;
      ecritures.value = res;
    });
};
const formatType = (type) => {
  const mapping = {
    0: "Autre",
    1: "Solde",
    2: "Indemnité",
    3: "Frais forfaitaire",
    4: "Frais effectif",
    5: "Côtisations AVS/AC",
  };
  return mapping[type] || "";
};

const fields = [
  { title: "Désignation", key: "designation" },
  { title: "Catégorie comptable", key: "categorie" },
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
          5: "Côtisations AVS/AC",
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
const ecritureFields = [
  { title: "Designation", key: "designation" },
  {
    title: "Sapeur",
    key: "sapeur_id",
    formatter: (id) => sapeurs.value.find((f) => f.id == id)?.nom_prenom,
  },
  { title: "Quantité", key: "quantite" },
  { title: "Tarif", key: "tarif" },
  { title: "Total", key: "total" },
  { title: "Type", key: "type", formatter: (type) => formatType(type) },
];
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Imputer le cours</h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <multi-step :steps="['Type de frais', 'Résultat']" :active-index="phase - 1" />
      <div v-if="phase === 1" class="row">
        <div class="col-12">
          <base-table
            ref="table"
            :data="computedIndemnites"
            :fields="fields"
            no-data="Aucune indemnité de cours"
            detail-row-class="m-td-0"
            :detail-row-column="true"
            :selectable="true"
            @selected="(indemnite) => selectIndemnite(indemnite)"
          >
            <template #detail-row="{ rowData }">
              <generic-details-row :options="detailRowOptions" :row-data="rowData" />
            </template>
          </base-table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div v-if="successMessageVisibility" class="alert alert-dismissible alert-success">
          <button
            type="button"
            class="btn-close"
            @click="successMessageVisibility = false"
          ></button>
          Imputations effectuées avec <strong>succès</strong>!
        </div>
        <base-table :data="ecritures" :fields="ecritureFields" :hide-download="true" />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="cancel">
        {{ phase === 1 ? "Annuler" : "Fermer" }}
      </button>
      <button
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        :disabled="activeIndemnite === null"
        @click="imputer()"
      >
        Imputer
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import MultiStep from "../base/MultiStep.vue";
import useNotification from "../../composables/useNotification.js";

const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const compteStore = useCompteStore();
const imputationStore = useImputationStore();
const uniteStore = useUniteStore();
fonctionStore.fetchFonctions();

const { data, callback } = defineProps({
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
const submitting = ref(false);

const sapeurs = computed(() => sapeurStore.liste);
const indemnitesTypes = computed(() => imputationStore.fraisIndemnites.interventions);
const fonctions = computed(() => fonctionStore.liste);
const comptes = computed(() => compteStore.liste);
const unites = computed(() => uniteStore.liste);
const activeIndemniteHasFonction = computed(() => {
  return activeIndemnite.value !== null && activeIndemnite.value.par_fonction;
});

const awn = useNotification();
const { closeModal: close } = useModalStore();
const closeModal = () => {
  callback().then(() => close());
};
const selectIndemnite = (indemnite) => {
  activeIndemnite.value = indemnite;
};
const imputer = () => {
  if (activeIndemnite.value === null || submitting.value) {
    return;
  }

  submitting.value = true;
  imputationStore
    .imputerIntervention({
      intervention_id: data.id,
      indemnite_intervention_type_id: activeIndemnite.value.id,
    })
    .then((data) => {
      phase.value = 2;
      ecritures.value = data.ecritures;
    })
    .catch((err) => awn.alert(err?.message ?? "Impossible d'effectuer cette action"))
    .finally(() => {
      submitting.value = false;
    });
};
const formatCompte = (compte) => {
  if (!compte) return "";
  return compte?.numero + " - " + compte?.designation;
};

const indemniteFields = [
  { title: "Designation", key: "designation" },
  { title: "Tarif", key: "tarif" },
  {
    title: "Pro-rata",
    key: "tarif_pro_rata",
    type: Boolean,
    titleClass: "text-center",
    columnClass: "text-center",
  },
  { title: "Tarif min", key: "tarif_min" },
  { title: "Pour", key: "tarif_min_pour" },
  {
    title: "Pro-rata tarif min",
    key: "tarif_min_pro_rata",
    type: Boolean,
    titleClass: "text-center",
    columnClass: "text-center",
  },
  { title: "Taux nuit", key: "taux_nuit" },
  { title: "Taux weekend", key: "taux_weekend" },
  {
    title: "Unité",
    key: "type_unite_id",
    formatter: (id) => unites.value.find((u) => u.id == id)?.abreviation,
  },
  {
    title: "Compte",
    key: "compte_id",
    formatter: (id) => formatCompte(comptes.value.find((c) => c.id == id)),
  },
  {
    title: "Par fonction",
    key: "par_fonction",
    type: Boolean,
    titleClass: "text-center",
    columnClass: "text-center",
  },
];
const fonctionFields = [
  {
    title: "Fonction",
    key: "id",
    formatter: (id) => fonctions.value.find((f) => f.id == id)?.nom,
  },
  { title: "Tarif", key: "tarif" },
];
const ecritureFields = [
  {
    title: "Sapeur",
    key: "sapeur_id",
    formatter: (id) => sapeurs.value.find((s) => s.id == id)?.nom_prenom,
  },
  { title: "Quantité", key: "quantite" },
  {
    title: "Unité",
    key: "type_unite_id",
    formatter: (id) => unites.value.find((u) => u.id == id)?.abreviation,
  },
  { title: "Tarif", key: "tarif" },
  { title: "Tarif min", key: "tarif_min" },
  { title: "Pour", key: "tarif_min_pour" },
  {
    title: "Pro-rata",
    key: "tarif_min_pro_rata",
    slot: "tarifMinProRata",
    titleClass: "text-center",
    columnClass: "text-center",
  },
  { title: "Taux", key: "taux" },
  { title: "Taux description", key: "taux_description" },
  { title: "Total", key: "total" },
];
</script>
<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Imputer l'intervention</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <multi-step :steps="['Type de frais', 'Résultat']" :active-index="phase - 1" />
      <div v-if="phase === 1" class="row">
        <div
          :class="{
            'col-12': !activeIndemniteHasFonction,
            'col-8': activeIndemniteHasFonction,
          }"
        >
          <base-table
            :data="indemnitesTypes"
            :fields="indemniteFields"
            no-data="Aucune indemnité type pour intervention de configuré"
            :selectable="true"
            :hide-download="true"
            @selected="selectIndemnite"
          />
        </div>
        <div v-if="activeIndemniteHasFonction" class="col-4">
          <base-table
            :data="activeIndemnite.fonctions"
            :fields="fonctionFields"
            :hide-download="true"
          />
        </div>
      </div>
      <div v-if="phase === 2">
        <div v-if="successMessageVisibility" class="alert alert-dismissible alert-success">
          <button
            type="button"
            class="btn-close"
            @click="successMessageVisibility = false"
          ></button>
          Imputations effectuées avec
          <strong>succès</strong>!
        </div>
        <base-table :data="ecritures" :fields="ecritureFields" :hide-download="true">
          <template #tarifMinProRata="{ rowData }">
            <input v-model="rowData.tarif_min_pro_rata" type="checkbox" class="form-check-input" />
          </template>
        </base-table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        {{ phase === 1 ? "Annuler" : "Fermer" }}
      </button>
      <button
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        :disabled="activeIndemnite === null || submitting"
        @click="imputer()"
      >
        <span
          v-if="submitting"
          class="spinner-border spinner-border-sm me-1"
          role="status"
          aria-hidden="true"
        ></span>
        Imputer
      </button>
    </div>
  </div>
</template>

<script setup>
import { usePhaseTypeStore } from "../../stores/intervention/PhaseType.js";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { computed } from "vue";

const phaseTypeStore = usePhaseTypeStore();
const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const fonctionStore = useFonctionStore();
const uniteStore = useUniteStore();

const loadIndemnites = imputationStore.fetchFraisIndemnitesTypes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();
const loadPhases = phaseTypeStore.fetchPhaseTypes();

await Promise.all([loadIndemnites, loadFonctions, loadComptes, loadUnites, loadPhases]);

const fields = [
  { title: "Désignation", key: "designation" },
  { title: "Type", key: "type_display" },
  { title: "Tarif", key: "tarif" },
  { title: "Pro-rata tarif", key: "tarif_pro_rata", type: Boolean },
  { title: "Tarif min", key: "tarif_min" },
  { title: "Pour", key: "tarif_min_pour" },
  { title: "Unité", key: "unite" },
  {
    title: "Pro-rata tarif min",
    key: "tarif_min_pro_rata",
    type: Boolean,
  },
  { title: "Phase", key: "phase" },
  { title: "Taux week-end", key: "taux_weekend" },
  { title: "Taux nuit", key: "taux_nuit" },
  { title: "Compte", key: "compte" },
  { title: "Catégorie comptable", key: "categorie" },
  { title: "Actions", slot: "actions" },
];

const indemnitesIntervention = computed(() =>
  imputationStore.fraisIndemnites.interventions
    .map((e) => ({
      ...e,
      unite: uniteStore.liste.find((u) => u.id == e.type_unite_id)?.unite,
      compte: compteStore.liste.find((c) => c.id == e.compte_id)?.label,
      categorie: ecritureCategorieStore.liste.find((c) => c.id == e.ecriture_categorie_id)
        ?.designation,
      phase: phaseTypeStore.liste.find((p) => p.id == e.phase_id)?.designation,
      type_display: {
        0: "Autre",
        1: "Solde",
        2: "Indemnité",
        3: "Frais forfaitaire",
        4: "Frais effectif",
        5: "Côtisations AVS/AC",
      }[e.type ?? 0],
    }))
    .sort((a, b) => a.tri - b.tri),
);

const { confirm, showModal } = useModalStore();
const ajoutIndemnite = () =>
  showModal({
    component: "ModalIndemniteIntervention",
    data: {},
  });
const updateIndemnite = (indemnite) =>
  showModal({
    component: "ModalIndemniteIntervention",
    data: { ...indemnite },
  });
const removeIndemnite = (indemnite) =>
  confirm(
    "Voulez-vous vraiment supprimer cette indemnité ?",
    "Attention, la suppression d'une indemnité est irréversible ! Toutes les données de cette indemnité seront perdues !",
  ).then(() => imputationStore.removeIndemniteIntervention(indemnite.id));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Imputation intervention</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnité
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :data="indemnitesIntervention" :fields="fields" no-data="Aucune indemnité">
        <template #actions="{ rowData }">
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
            @click="removeIndemnite(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

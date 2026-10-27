<script setup>
import { computed, ref, watchEffect } from "vue";
import permissions from "/src/composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import useNotification from "../../composables/useNotification.js";
import { travailStatut } from "../../composables/travailStatuts.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useTravailStore } from "../../stores/travail/Travail.js";
import { useTravailTypeStore } from "../../stores/travail/TravailType.js";

// Fiches de travail liées à une intervention ou à un exercice (onglet Présences)
const { genre, id, evenement } = defineProps({
  genre: {
    type: String,
    required: true,
    validator: (value) => ["intervention", "exercice"].includes(value),
  },
  id: {
    type: String,
    required: true,
  },
  // Données de l'événement affiché (statut, date, exercice comptable…)
  evenement: {
    type: Object,
    required: true,
  },
});

// Statuts de l'événement (InterventionBusiness / ExerciceBusiness) et droits associés
const configurations = {
  intervention: {
    valide: 2,
    ferme: (statut) => statut >= 3,
    validation: permissions.INTERVENTION.VALIDATION,
    titre: "Travaux liés à l'intervention",
    aucun: "Aucune fiche de travail liée à cette intervention",
  },
  exercice: {
    valide: 3,
    // Imputé ou annulé
    ferme: (statut) => statut >= 4 || statut === 0,
    validation: permissions.EXERCICE.VALIDATION,
    titre: "Travaux liés à l'exercice",
    aucun: "Aucune fiche de travail liée à cet exercice",
  },
};
const config = configurations[genre];

const authStore = useAuthStore();
const sapeurStore = useSapeurStore();
const travailStore = useTravailStore();
const travailTypeStore = useTravailTypeStore();
const uniteStore = useUniteStore();

travailTypeStore.fetchTravailTypes();
uniteStore.fetchUnites();

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await travailStore.fetchTravauxEvenement(genre, id);
  loading.value = false;
});

const hasSaisiePermission = useHasPermission([
  permissions.FICHE_TRAVAIL.SAISIE_PERSO,
  permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
]);
const hasValidationPermission = useHasPermission(config.validation);
// Une fiche liée s'examine avec le droit des fiches de travail ou celui de l'événement
const hasExamenPermission = useHasPermission([
  permissions.FICHE_TRAVAIL.VALIDATION,
  config.validation,
]);

const statut = computed(() => evenement.statut);
const estFerme = computed(() => config.ferme(statut.value));
const estValide = computed(() => statut.value === config.valide);
const activeSapeurId = computed(() => authStore.sapeurId);

const travaux = computed(() =>
  travailStore.lies.map((t) => {
    const type = travailTypeStore.liste.find((e) => e.id == t.travail_type_id);
    return {
      ...t,
      travail: type?.designation,
      sapeur: sapeurStore.liste.find((s) => s.id == t.sapeur_id)?.nom_prenom,
      unite: uniteStore.liste.find((u) => u.id == type?.type_unite_id)?.unite,
    };
  }),
);

// Mêmes règles que l'API (TravauxBusiness) : fermé → verrouillé, validé → réservé au validateur
const peutAjouter = computed(
  () =>
    hasSaisiePermission.value &&
    !estFerme.value &&
    (!estValide.value || hasValidationPermission.value),
);
const peutModifier = (travail) => {
  if (!hasSaisiePermission.value || estFerme.value) {
    return false;
  }
  if (hasValidationPermission.value) {
    return travail.statut !== 2;
  }
  return !estValide.value && travail.statut === 0 && travail.auteur_id == activeSapeurId.value;
};
const peutTraiter = (travail) =>
  hasExamenPermission.value &&
  !estFerme.value &&
  (travail.statut === 0 || (travail.statut === -1 && estValide.value));
const peutAnnulerExamen = (travail) =>
  hasExamenPermission.value &&
  !estFerme.value &&
  !estValide.value &&
  (travail.statut === -1 || travail.statut === 1);

const { confirm, showModal } = useModalStore();
const awn = useNotification();

const ajouterTravail = () =>
  showModal({
    component: "ModalTravail",
    data: { [genre]: evenement, lienVerrouille: true },
  });
const modifierTravail = (travail) =>
  showModal({
    component: "ModalTravail",
    data: { ...travail, [genre]: evenement, lienVerrouille: true },
  });
const traiterTravail = (travail) => showModal({ component: "ModalReviewTravail", data: travail });
const annulerExamen = async (travail) => {
  if (
    await confirm(
      "Voulez-vous vraiment annuler l'examen de ce travail ?",
      "Attention, la justification fournie lors de l'examen sera perdue.",
    )
  ) {
    travailStore
      .cancelReviewTravail(travail.id)
      .catch((err) => awn.alert(err?.message ?? "Erreur lors de l'annulation de l'examen"));
  }
};
const supprimerTravail = async (travail) => {
  if (
    await confirm(
      "Voulez-vous vraiment supprimer ce travail ?",
      "Attention, la suppression d'un travail est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
    )
  ) {
    travailStore
      .removeTravail(travail.id)
      .catch((err) => awn.alert(err?.message ?? "Erreur lors de la suppression"));
  }
};

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Travail", key: "travail" },
  { title: "Sapeur", key: "sapeur" },
  { title: "Désignation", key: "designation" },
  { title: "Quantité", key: "quantite", slot: "quantite" },
  { title: "Statut", key: "statut", slot: "statut" },
  { title: "Actions", slot: "actions", columnClass: "text-nowrap" },
];
</script>

<template>
  <div class="col-sm-12 col-md-12 col-xl-12">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">{{ config.titre }}</h3>
        <button v-if="peutAjouter" type="button" class="btn btn-primary" @click="ajouterTravail">
          Ajouter une fiche de travail
        </button>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table :loading="loading" :fields="fields" :data="travaux" :no-data="config.aucun">
          <template #quantite="{ rowData }">{{ rowData.quantite }} {{ rowData.unite }}</template>
          <template #statut="{ value }">
            <status-badge :status="travailStatut(value)" />
          </template>
          <template #actions="{ rowData }">
            <button
              v-if="peutModifier(rowData)"
              type="button"
              title="Modifier"
              class="btn btn-outline-primary border-0"
              @click="modifierTravail(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              v-if="peutTraiter(rowData)"
              type="button"
              title="Examen"
              class="btn btn-outline-success border-0"
              @click="traiterTravail(rowData)"
            >
              <font-awesome-icon :icon="['far', 'eye']" />
            </button>
            <button
              v-if="peutAnnulerExamen(rowData)"
              type="button"
              title="Annuler l'examen"
              class="btn btn-outline-warning border-0"
              @click="annulerExamen(rowData)"
            >
              <font-awesome-icon :icon="['fas', 'cancel']" />
            </button>
            <button
              v-if="peutModifier(rowData)"
              type="button"
              title="Supprimer"
              class="btn btn-outline-danger border-0"
              @click="supprimerTravail(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

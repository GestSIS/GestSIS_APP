// Validation et annulation de validation d'une intervention (utilisé dans PageIntervention.vue
// et intervention/InterventionPresences.vue), sur le modèle de l'exercice.
import { computed } from "vue";
import permissions from "./permissions.js";
import useHasPermission from "./usePermission.js";
import useNotification from "./useNotification.js";
import { interventionStatut } from "./interventionStatuts.js";
import { useInterventionStore } from "../stores/intervention/Intervention.js";
import { useModalStore } from "../stores/common/Modal.js";

// Statuts d'intervention (InterventionBusiness)
const INTERVENTION_SAISIE = 1;
const INTERVENTION_VALIDEE = 2;

// `id` : intervention ouverte ; sans id (liste), utiliser devaliderInterventionId(id)
export default function useValidationIntervention(id = null) {
  const interventionStore = useInterventionStore();
  const modalStore = useModalStore();
  const awn = useNotification();
  const hasValidationPermission = useHasPermission(permissions.INTERVENTION.VALIDATION);

  const statut = computed(() => interventionStore.active.data?.statut);
  const showValiderButton = computed(
    () => hasValidationPermission.value && statut.value === INTERVENTION_SAISIE,
  );
  // Symétrique de "Valider" : une intervention validée (pas encore imputée) repasse en saisie
  const showDevaliderButton = computed(
    () => hasValidationPermission.value && statut.value === INTERVENTION_VALIDEE,
  );

  const validerIntervention = async () => {
    if (
      await modalStore.confirm(
        "Valider l'intervention ?",
        "Une fois validée, seule une personne avec la permission de validation pourra encore la modifier. Voulez-vous continuer ?",
      )
    ) {
      interventionStore
        .validerIntervention(id)
        .then(() => awn.success("Intervention validée."))
        .catch((err) =>
          awn.alert(err?.message ?? "Erreur lors de la validation de l'intervention."),
        );
    }
  };

  const devaliderInterventionId = async (interventionId) => {
    if (
      await modalStore.confirm(
        "Annuler la validation ?",
        `L'intervention repassera au statut « ${interventionStatut(INTERVENTION_SAISIE).label} » et redeviendra modifiable. Voulez-vous continuer ?`,
      )
    ) {
      interventionStore
        .devaliderIntervention(interventionId)
        .then(() => awn.success("Validation annulée."))
        .catch((err) => awn.alert(err?.message ?? "Erreur lors de l'annulation de la validation."));
    }
  };

  const devaliderIntervention = () => devaliderInterventionId(id);

  return {
    showValiderButton,
    showDevaliderButton,
    validerIntervention,
    devaliderIntervention,
    devaliderInterventionId,
  };
}

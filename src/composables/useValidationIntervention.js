// Validation et annulation de validation d'une intervention (utilisé dans PageIntervention.vue
// et intervention/InterventionPresences.vue), sur le modèle de l'exercice.
import { computed } from "vue";
import permissions from "./permissions.js";
import { useHasPermission } from "./useHasPermission.js";
import { useSubmit } from "./useSubmit.js";
import { interventionStatut } from "../tools/intervention.js";
import { useInterventionStore } from "../stores/intervention/Intervention.js";
import { useModalStore } from "../stores/common/Modal.js";

// Statuts d'intervention (InterventionBusiness)
const INTERVENTION_SAISIE = 1;
const INTERVENTION_VALIDEE = 2;

// `id` : intervention ouverte ; sans id (liste), utiliser devaliderInterventionId(id)
export function useValidationIntervention(id = null) {
  const interventionStore = useInterventionStore();
  const modalStore = useModalStore();
  const { isSubmitting, submit } = useSubmit();
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
      await submit(
        () => interventionStore.validerIntervention(id),
        "Erreur lors de la validation de l'intervention.",
        "Intervention validée.",
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
      await submit(
        () => interventionStore.devaliderIntervention(interventionId),
        "Erreur lors de l'annulation de la validation.",
        "Validation annulée.",
      );
    }
  };

  const devaliderIntervention = () => devaliderInterventionId(id);

  return {
    isSubmitting,
    showValiderButton,
    showDevaliderButton,
    validerIntervention,
    devaliderIntervention,
    devaliderInterventionId,
  };
}

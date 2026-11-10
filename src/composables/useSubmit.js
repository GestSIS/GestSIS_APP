import { ref } from "vue";
import { useNotification } from "./useNotification.js";

/**
 * Soumission d'un formulaire vers l'API : envoi en cours, blocage du double envoi
 * et affichage des erreurs. Ne gère ni l'état du formulaire, ni l'après-succès
 * (fermer une modale, naviguer…) : c'est à l'appelant.
 *
 * Usage :
 *   const { errors, isSubmitting, submit } = useSubmit();
 *   const { ok, data } = await submit(() => store.save(form));
 *   if (ok) closeModal();
 */
export function useSubmit() {
  const errors = ref({});
  const isSubmitting = ref(false);

  /**
   * @param {() => Promise<any>} action appel à l'API
   * @param {string} defaultMessage message si l'API n'en fournit pas
   * @returns {Promise<{ ok: boolean, data?: any }>}
   */
  const submit = async (action, defaultMessage = "Erreur lors de l'enregistrement") => {
    if (isSubmitting.value) {
      return { ok: false };
    }
    isSubmitting.value = true;
    errors.value = {};
    try {
      return { ok: true, data: await action() };
    } catch (err) {
      // Erreurs de validation par champ : affichées dans le formulaire.
      // Une ArrayException peut renvoyer une liste (ex. [statut]) : pas des erreurs de champs.
      const fieldErrors = err?.errors && !Array.isArray(err.errors) ? err.errors : {};
      errors.value = fieldErrors;
      // Sinon (erreur métier, serveur) : le message de l'API en notification
      if (Object.keys(fieldErrors).length === 0) {
        useNotification().alert(err?.message || defaultMessage);
      }
      return { ok: false };
    } finally {
      isSubmitting.value = false;
    }
  };

  return { errors, isSubmitting, submit };
}

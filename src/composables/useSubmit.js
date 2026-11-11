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
 *
 *   // Avec message de succès (affiché seulement si l'appel réussit)
 *   await submit(() => store.remove(id), "Erreur lors de la suppression", "Grade supprimé.");
 */
export function useSubmit() {
  const errors = ref({});
  const isSubmitting = ref(false);

  /**
   * @param {() => Promise<any>} action appel à l'API
   * @param {string} defaultMessage message d'erreur si l'API n'en fournit pas
   * @param {string} [successMessage] notification affichée en cas de succès (aucune si omis)
   * @returns {Promise<{ ok: boolean, data?: any, ignored?: boolean }>}
   *   ignored : appel ignoré car une soumission est déjà en cours (rien n'a été envoyé)
   */
  const submit = async (
    action,
    defaultMessage = "Erreur lors de l'enregistrement",
    successMessage = null,
  ) => {
    if (isSubmitting.value) {
      return { ok: false, ignored: true };
    }
    isSubmitting.value = true;
    errors.value = {};
    try {
      const data = await action();
      if (successMessage) {
        useNotification().success(successMessage);
      }
      return { ok: true, data };
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

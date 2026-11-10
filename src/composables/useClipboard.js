import { useNotification } from "./useNotification.js";

/**
 * Copie dans le presse-papiers : le succès n'est annoncé qu'une fois la copie
 * effectuée, et un échec est signalé (presse-papiers indisponible hors contexte
 * sécurisé, refus du navigateur…).
 *
 * Usage :
 *   const { copy } = useClipboard();
 *   copy(token, "Jeton copié dans le presse-papiers");
 */
export function useClipboard() {
  /**
   * @param {string} text texte à copier
   * @param {string} successMessage message affiché une fois la copie effectuée
   * @returns {Promise<boolean>} true si la copie a réussi
   */
  const copy = async (text, successMessage = "Copié dans le presse-papiers") => {
    const awn = useNotification();
    try {
      // Absent hors contexte sécurisé (http) ou sur d'anciens navigateurs
      if (!navigator.clipboard) {
        throw new Error("Presse-papiers indisponible");
      }
      await navigator.clipboard.writeText(text);
      awn.success(successMessage);
      return true;
    } catch {
      awn.alert(
        "Impossible de copier dans le presse-papiers, veuillez copier le texte manuellement.",
      );
      return false;
    }
  };

  return { copy };
}

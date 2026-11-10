import { useModalStore } from "../stores/common/Modal.js";
import { useNotification } from "./useNotification.js";

/**
 * Téléchargement d'un fichier généré par l'API (PDF, Excel, XML…) : affiche la
 * fenêtre de chargement pendant la génération, la referme dans tous les cas et
 * affiche le message de l'API en cas d'erreur.
 *
 * La fenêtre de chargement remplace la modale éventuellement ouverte : appelé
 * depuis une modale, celle-ci est donc fermée à la fin du téléchargement.
 *
 * Usage :
 *   const { download } = useDownload();
 *   download(() => DecompteService.downloadDecompte(id, nomFichier), "Erreur lors de…");
 */
export function useDownload() {
  const modalStore = useModalStore();

  /**
   * @param {() => Promise<any>} action appel au service qui génère et enregistre le fichier
   * @param {string} defaultMessage message si l'API n'en fournit pas
   * @returns {Promise<{ ok: boolean, data?: any }>}
   */
  const download = async (action, defaultMessage = "Erreur lors de la génération du fichier") => {
    modalStore.showModal({ component: "ModalChargement" });
    try {
      const data = await action();
      modalStore.closeModal();
      return { ok: true, data };
    } catch (err) {
      modalStore.closeModal();
      useNotification().alert(err?.message || defaultMessage);
      return { ok: false };
    }
  };

  return { download };
}

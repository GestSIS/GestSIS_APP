import { toLocalIsoDate } from "./index.js";
import { formatDate } from "./formatters.js";

// Un article qui est lui-même un emplacement (ex: véhicule) n'a pas son propre
// emplacement_id : sa position est portée par le parent_id de l'emplacement qu'il
// représente.
export const emplacementIdPourArticle = (article) =>
  article?.emplacement_representee?.parent_id ?? article?.emplacement_id ?? null;

/** Étape de chemin pour CheminEmplacement : désignation, couleur, hangar ou véhicule. */
export const etapeEmplacement = (emplacement, designation = emplacement?.designation) => ({
  designation,
  couleur_id: emplacement?.couleur_id ?? null,
  hangar: !!emplacement?.hangar,
  vehicule: !!emplacement?.article_id,
});

/** Icône d'une étape : hangar, véhicule ou aucune. */
export const iconeEtape = (etape) => {
  if (etape.hangar) return ["far", "house"];
  return etape.vehicule ? ["fas", "car"] : null;
};

/** Étapes de la racine jusqu'à l'emplacement donné (ids indexés, protégé contre les cycles). */
export const etapesEmplacement = (emplacementId, indexedEmplacements) => {
  const etapes = [];
  const vus = new Set();
  for (let id = emplacementId; id && !vus.has(id); id = indexedEmplacements[id]?.parent_id) {
    vus.add(id);
    if (indexedEmplacements[id]) {
      etapes.unshift(etapeEmplacement(indexedEmplacements[id]));
    }
  }
  return etapes;
};

// Un article périmable porte sa propre date de péremption. Il est considéré
// périmé dès que cette date est atteinte, même règle que le serveur, qui
// compare à la date du jour et non à l'instant présent.
export const estPerime = (article) => {
  const peremption = article?.date_peremption;
  if (!peremption) {
    return false;
  }
  return String(peremption).slice(0, 10) <= toLocalIsoDate();
};

// Mention d'un article supprimé : « Supprimé le 01.11.2026 — Clé perdue »
// (sans la remarque de suppression si elle est vide).
export const libelleSuppression = (article) => {
  const libelle = `Supprimé le ${formatDate(article.supprime_le)}`;
  return article.remarque_suppression ? `${libelle} — ${article.remarque_suppression}` : libelle;
};

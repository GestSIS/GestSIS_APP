import { toLocalIsoDate } from "./index.js";
import { formatDate } from "./formatters.js";

// Un article qui est lui-même un emplacement (ex: véhicule) n'a pas son propre
// emplacement_id : sa position est portée par le parent_id de l'emplacement qu'il
// représente.
export const emplacementIdPourArticle = (article) =>
  article?.emplacement_representee?.parent_id ?? article?.emplacement_id ?? null;

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

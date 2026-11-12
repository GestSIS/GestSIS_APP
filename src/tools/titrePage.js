/**
 * Titre d'une route, construit à partir des `meta.title` de ses routes parentes et
 * enfants, du plus précis au plus général (ex. « Par type – Matériel »). Un même
 * titre répété entre parent et enfant n'apparaît qu'une fois.
 * Renvoie "" si aucune route ne déclare de titre.
 */
export function titrePage(route) {
  const titres = route.matched
    .map((record) => record.meta?.title)
    .filter(Boolean)
    .filter((titre, index, liste) => liste.indexOf(titre) === index);
  return titres.reverse().join(" – ");
}

/** Titre de l'onglet du navigateur pour une route : « <titre> – GestSIS », ou « GestSIS ». */
export function titreDocument(route) {
  const titre = titrePage(route);
  return titre ? `${titre} – GestSIS` : "GestSIS";
}

/**
 * Place le focus sur le titre de la page (`AppTitrePage`) : cible du lien
 * « Aller au contenu » et du changement de page. Renvoie false s'il est absent.
 */
export function allerAuContenu() {
  const titre = document.getElementById("titre-page");
  if (!titre) {
    return false;
  }
  titre.focus();
  return true;
}

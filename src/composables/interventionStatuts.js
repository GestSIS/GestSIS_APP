// Statuts d'une intervention (GestSIS_API/app/Domaine/Business/InterventionBusiness.php
// INTERVENTION_STATUT_*), centralisés ici pour un affichage cohérent (libellé +
// couleur de badge) partout dans l'app plutôt que dupliqués par écran.
export const interventionStatuts = {
  0: { label: "A saisir", badgeClass: "text-bg-secondary" },
  1: { label: "A valider", badgeClass: "text-bg-warning" },
  2: { label: "Validée", badgeClass: "text-bg-primary" },
  3: { label: "Imputée", badgeClass: "text-bg-success" },
};

export function interventionStatut(statut) {
  return interventionStatuts[statut] ?? { label: "Inconnu", badgeClass: "text-bg-secondary" };
}

// Statuts d'une intervention (GestSIS_API/app/Domaine/Business/InterventionBusiness.php
// INTERVENTION_STATUT_*), centralisés ici pour un affichage cohérent (libellé +
// couleur de badge) partout dans l'app plutôt que dupliqués par écran.
// Valeurs des statuts, pour les comparaisons dans le code
export const INTERVENTION_STATUT = {
  A_SAISIR: 0,
  A_VALIDER: 1,
  VALIDEE: 2,
  IMPUTEE: 3,
};

export const interventionStatuts = {
  [INTERVENTION_STATUT.A_SAISIR]: { label: "A saisir", badgeClass: "text-bg-secondary" },
  [INTERVENTION_STATUT.A_VALIDER]: { label: "A valider", badgeClass: "text-bg-warning" },
  [INTERVENTION_STATUT.VALIDEE]: { label: "Validée", badgeClass: "text-bg-primary" },
  [INTERVENTION_STATUT.IMPUTEE]: { label: "Imputée", badgeClass: "text-bg-success" },
};

export function interventionStatut(statut) {
  return interventionStatuts[statut] ?? { label: "Inconnu", badgeClass: "text-bg-secondary" };
}

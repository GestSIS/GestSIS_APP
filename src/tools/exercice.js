// Statuts d'un exercice (GestSIS_API/app/Domaine/Business/ExerciceBusiness.php
// EXERCICE_STATUT_*), centralisés pour un affichage cohérent (libellé + couleur
// de badge) dans tous les écrans qui en montrent un (exercice/, comptabilite/).
// Valeurs des statuts, pour les comparaisons dans le code
export const EXERCICE_STATUT = {
  ANNULE: 0,
  A_SAISIR: 1,
  A_VALIDER: 2,
  VALIDE: 3,
  IMPUTE: 4,
};

export const exerciceStatuts = {
  [EXERCICE_STATUT.ANNULE]: { label: "Annulé", badgeClass: "text-bg-danger" },
  [EXERCICE_STATUT.A_SAISIR]: { label: "A saisir", badgeClass: "text-bg-secondary" },
  [EXERCICE_STATUT.A_VALIDER]: { label: "A valider", badgeClass: "text-bg-warning" },
  [EXERCICE_STATUT.VALIDE]: { label: "Validé", badgeClass: "text-bg-primary" },
  [EXERCICE_STATUT.IMPUTE]: { label: "Imputé", badgeClass: "text-bg-success" },
};

export function exerciceStatut(statut) {
  return exerciceStatuts[statut] ?? { label: "Inconnu", badgeClass: "text-bg-secondary" };
}

// Pour alimenter un <base-select :options="exerciceStatutOptions">.
export const exerciceStatutOptions = Object.entries(exerciceStatuts).map(([id, s]) => ({
  id: Number(id),
  designation: s.label,
}));

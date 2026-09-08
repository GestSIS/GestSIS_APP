// Statuts d'un exercice (GestSIS_API/app/Domaine/Business/ExerciceBusiness.php
// EXERCICE_STATUT_*), centralisés pour un affichage cohérent (libellé + couleur
// de badge) dans tous les écrans qui en montrent un (exercice/, comptabilite/).
export const exerciceStatuts = {
  0: { label: "Annulé", badgeClass: "text-bg-danger" },
  1: { label: "A saisir", badgeClass: "text-bg-secondary" },
  2: { label: "A valider", badgeClass: "text-bg-warning" },
  3: { label: "Validé", badgeClass: "text-bg-primary" },
  4: { label: "Imputé", badgeClass: "text-bg-success" },
};

export function exerciceStatut(statut) {
  return exerciceStatuts[statut] ?? { label: "Inconnu", badgeClass: "text-bg-secondary" };
}

// Pour alimenter un <base-select :options="exerciceStatutOptions">.
export const exerciceStatutOptions = Object.entries(exerciceStatuts).map(([id, s]) => ({
  id: Number(id),
  designation: s.label,
}));

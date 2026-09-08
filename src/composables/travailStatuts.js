// Statut d'une fiche de travail personnel/commun, centralisé (utilisé dans
// comptabilite/ComptabiliteTabTravaux.vue et mes_infos/MesTravaux.vue).
export const travailStatuts = {
  [-1]: { label: "Refusé", badgeClass: "text-bg-danger" },
  0: { label: "En attente", badgeClass: "text-bg-warning" },
  1: { label: "Accepté", badgeClass: "text-bg-primary" },
  2: { label: "Imputé", badgeClass: "text-bg-success" },
};

export function travailStatut(statut) {
  return travailStatuts[statut] ?? { label: "Inconnu", badgeClass: "text-bg-secondary" };
}

export const travailStatutOptions = Object.entries(travailStatuts).map(([id, s]) => ({
  id: Number(id),
  designation: s.label,
}));

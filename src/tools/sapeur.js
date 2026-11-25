// Statuts d'une personne (GestSIS_API/app/Domaine/Business/SapeurBusiness.php
// STATUT_*), recalculés par l'API depuis ses mutations : statut_sapeur et
// statut_civil sont indépendants, une personne peut être sapeur et civil.
export const STATUT = {
  JAMAIS: 0,
  ACTIF: 1,
  INACTIF: 2,
};

// Nature d'une mutation (SapeurBusiness NATURE_*)
export const NATURE_MUTATION = {
  SAPEUR: 0,
  CIVIL: 1,
};

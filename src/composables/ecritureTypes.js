// Type d'une écriture comptable (exercice, cours, intervention, travail,
// frais annuel, divers...), centralisé ici pour un affichage cohérent au
// lieu d'être recopié dans chaque écran (comptabilite/, parametres/, modal/).
export const ecritureTypes = {
  0: "Autre",
  1: "Solde",
  2: "Indemnité",
  3: "Frais forfaitaire",
  4: "Frais effectif",
  5: "Cotisations AVS/AC",
};

export function ecritureTypeLabel(type) {
  return ecritureTypes[type] ?? "Autre";
}

// Pour alimenter un <base-select :options="ecritureTypeOptions">.
export const ecritureTypeOptions = Object.entries(ecritureTypes).map(([id, designation]) => ({
  id: Number(id),
  designation,
}));

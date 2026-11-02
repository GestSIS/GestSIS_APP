// Return an index of objects
export const indexedData = (data, key = "id") =>
  data.reduce((acc, elem) => {
    acc[elem[key]] = elem;
    return acc;
  }, {});

// Group object by the provided key value
export const groupedByData = (data, key = "id") =>
  data.reduce((acc, elem) => {
    (acc[elem[key]] ??= []).push(elem);
    return acc;
  }, {});

// Date in YYYY-MM-DD format, in the user's timezone (toISOString alone is UTC:
// between midnight and ~02:00 Swiss time it would return yesterday's date)
export const toLocalIsoDate = (date = new Date()) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// Valeur d'un <input type="date"> à partir d'une date renvoyée par l'API
// (chaîne ISO complète ou déjà "YYYY-MM-DD"). On tronque la chaîne plutôt que
// de passer par un objet Date : ces colonnes sont des dates pures, les
// convertir en heure locale pourrait les décaler d'un jour.
export const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : null);

// Ajoute un nombre de mois à une date (chaîne "YYYY-MM-DD" ou ISO complet),
// sans déborder sur le mois suivant si le jour d'origine n'existe pas dans le
// mois cible (31 janvier + 1 mois -> 28 février, + 2 mois -> 31 mars). Sert de
// valeur par défaut pré-remplie, modifiable ensuite par l'utilisateur.
export const addMonthsIso = (dateStr, months) => {
  const [year, month, day] = String(dateStr).slice(0, 10).split("-").map(Number);
  const dernierJourDuMoisCible = new Date(year, month + months, 0).getDate();
  return toLocalIsoDate(new Date(year, month - 1 + months, Math.min(day, dernierJourDuMoisCible)));
};

// Borne d'une plage de mesure pour l'affichage : l'API renvoie des décimales à 4
// chiffres ("6.0000"), réduites ici à 2 décimales au plus (6, 4.2, 3.46).
export const formatBorne = (value) =>
  value === null || value === undefined || value === "" ? "—" : Number(Number(value).toFixed(2));

// Plage admissible d'une mesure : "6 à 9 bar", "max 10 bar/min", "min 5 bar", ou
// null sans aucune borne.
export const formatPlage = (min, max, unit) => {
  const unite = unit ? ` ${unit}` : "";
  if (min !== null && max !== null) {
    return `${formatBorne(min)} à ${formatBorne(max)}${unite}`;
  }
  if (max !== null) {
    return `max ${formatBorne(max)}${unite}`;
  }
  return min !== null ? `min ${formatBorne(min)}${unite}` : null;
};

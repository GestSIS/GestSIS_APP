// Return an index of objects
export const indexedData = (data, key = "id") =>
  data.reduce((acc, elem) => {
    acc[elem[key]] = elem;
    return acc;
  }, {});

// Group object by the provided key value
export const groupedByData = (data, key = "id") =>
  data.reduce((acc, elem) => {
    acc[elem[key]] = [...(acc[elem[key]] ?? []), elem];
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

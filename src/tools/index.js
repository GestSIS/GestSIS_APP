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

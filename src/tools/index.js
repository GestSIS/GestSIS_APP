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

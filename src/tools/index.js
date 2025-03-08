export const indexedData = (data, key = 'id') =>
  data.reduce((acc, elem) => {
    acc[elem[key]] = elem;
    return acc;
  }, {});

export const groupedByData = (data, key = 'id') =>
  data.reduce((acc, elem) => {
    acc[elem[key]] = [...(acc[elem[key]] ?? []), elem];
    return acc;
  }, {});

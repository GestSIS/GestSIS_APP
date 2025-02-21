import Api from '/src/http/Request';

export default {
  getParMaterielType(materieltypeId) {
    return Api.api().get(`materiel-types/${materieltypeId}/articles`);
  },
};

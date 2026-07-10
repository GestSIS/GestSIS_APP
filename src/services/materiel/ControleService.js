import Api from '/src/http/Request';

export default {
  getControles() {
    return Api.api().get('/controles');
  },
  addControle(controle) {
    return Api.api().post('/controles', controle);
  },
  updateControle(controle) {
    return Api.api().put(`/controles/${controle.id}`, controle);
  },
  removeControle(controleId) {
    return Api.api().delete(`/controles/${controleId}`);
  },
  addTache(controleId, tache) {
    return Api.api().post(`/controles/${controleId}/taches`, tache);
  },
  updateTache(controleId, tache) {
    return Api.api().put(`/controles/${controleId}/taches/${tache.id}`, tache);
  },
  removeTache(controleId, tacheId) {
    return Api.api().delete(`/controles/${controleId}/taches/${tacheId}`);
  },
  addMaterielType(controleId, materielTypeId) {
    return Api.api().post(`/controles/${controleId}/materiel-types`, { materiel_type_id: materielTypeId });
  },
  removeMaterielType(controleId, pivotId) {
    return Api.api().delete(`/controles/${controleId}/materiel-types/${pivotId}`);
  },
};

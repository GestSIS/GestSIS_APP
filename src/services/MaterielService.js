import Api from '@/http/Request';

export default {
  getMateriels() {
    return Api.api().get('/materiels');
  },
  addMateriel(materiel) {
    return Api.api().post('/materiels', materiel);
  },
  updateMateriel(materiel) {
    return Api.api().put(`/materiels/${materiel.id}`, materiel);
  },
  removeMateriel(materiel_id) {
    return Api.api().delete(`/materiels/${materiel_id}`);
  },
};

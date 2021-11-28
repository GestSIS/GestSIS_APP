import Api from '@/http/Request';

export default {
  getMedecins() {
    return Api.api().get('/medecins');
  },
  addMedecin(medecin) {
    return Api.api().post('/medecins', medecin);
  },
  updateMedecin(medecin) {
    return Api.api().put(`/medecins/${medecin.id}`, medecin);
  },
  removeMedecin(medecin_id) {
    return Api.api().delete(`/medecins/${medecin_id}`);
  },
};

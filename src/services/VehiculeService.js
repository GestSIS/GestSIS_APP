import Api from '@/http/Request';

export default {
  getVehicules() {
    return Api.api().get('/vehicules');
  },
  addVehicule(vehicule) {
    return Api.api().post('/vehicules', vehicule);
  },
  updateVehicule(vehicule) {
    return Api.api().put(`/vehicules/${vehicule.id}`, vehicule);
  },
  removeVehicule(vehicule_id) {
    return Api.api().delete(`/vehicules/${vehicule_id}`);
  },
};

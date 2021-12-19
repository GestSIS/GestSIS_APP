import Api from '@/http/Request';

export default {
  getHeuresTypes() {
    return Api.api().get('/heure-exercice-types');
  },
  addHeureType(heureType) {
    return Api.api().post('/heure-exercice-types', heureType);
  },
  updateHeureType(heureType) {
    return Api.api().put(`/heure-exercice-types/${heureType.id}`, heureType);
  },
  removeHeureType(id) {
    return Api.api().delete(`/heure-exercice-types/${id}`);
  },
};

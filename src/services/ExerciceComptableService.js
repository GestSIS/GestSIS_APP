import Api from '@/http/Request';

export default {
  getExercices() {
    return Api.api().get('/exercice-comptables/');
  },
  addExercice(exercice) {
    return Api.api().post('/exercice-comptables/', exercice);
  },
  updateExercice(exercice) {
    return Api.api().put(`/exercice-comptables/${exercice.id}`, exercice);
  },
  removeExercice(exercice_id) {
    return Api.api().delete(`/exercice-comptables/${exercice_id}`);
  },
};

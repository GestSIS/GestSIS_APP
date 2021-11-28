import Api from '@/http/Request';

export default {
  getExercices() {
    return Api.api().get('/exercices-comptable');
  },
  addExercice(exercice) {
    return Api.api().post('/exercices-comptable', exercice);
  },
  updateExercice(exercice) {
    return Api.api().put(`/exercices-comptable/${exercice.id}`, exercice);
  },
  removeExercice(exercice_id) {
    return Api.api().delete(`/exercices-comptable/${exercice_id}`);
  },
};

import Api from '@/http/Request';

export default {
  getCours() {
    return Api.api().get('/cours');
  },
  addCours(cours) {
    return Api.api().post('/cours', cours);
  },
  updateCours(cours) {
    return Api.api().put(`/cours/${cours.id}`, cours);
  },
  removeCours(cours_id) {
    return Api.api().delete(`/cours/${cours_id}`);
  },
};

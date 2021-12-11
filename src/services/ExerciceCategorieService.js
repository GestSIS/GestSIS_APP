import Api from '@/http/Request';

export default {
  getCategories() {
    return Api.api().get('/exercice-categories');
  },
  addCategorie(categorie) {
    return Api.api().post('/exercice-categories', categorie);
  },
  updateCategorie(categorie) {
    return Api.api().put(`/exercice-categories/${categorie.id}`, categorie);
  },
  removeCategorie(categorie_id) {
    return Api.api().delete(`/exercice-categories/${categorie_id}`);
  },
};

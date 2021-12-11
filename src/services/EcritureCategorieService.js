import Api from '@/http/Request';

export default {
  getCategories() {
    return Api.api().get('/ecriture-categories');
  },
  addCategorie(categorie) {
    return Api.api().post('/ecriture-categories', categorie);
  },
  updateCategorie(categorie) {
    return Api.api().put(`/ecriture-categories/${categorie.id}`, categorie);
  },
  removeCategorie(categorie_id) {
    return Api.api().delete(`/ecriture-categories/${categorie_id}`);
  },
};

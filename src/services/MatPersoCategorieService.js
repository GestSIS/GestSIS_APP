import Api from '@/http/Request';

export default {
  getCategories() {
    return Api.api().get('/mat-perso-categories');
  },
  addCategorie(categorie) {
    return Api.api().post('/mat-perso-categories', categorie);
  },
  updateCategorie(categorie) {
    return Api.api().put(`/mat-perso-categories/${categorie.id}`, categorie);
  },
  removeCategorie(categorieId) {
    return Api.api().delete(`/mat-perso-categories/${categorieId}`);
  },
};

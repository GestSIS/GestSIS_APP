import Api from "/src/http/Request";

export default {
  getCategories() {
    return Api.api().get("/materiel-categories");
  },
  addCategorie(categorie) {
    return Api.api().post("/materiel-categories", categorie);
  },
  updateCategorie(categorie) {
    return Api.api().put(`/materiel-categories/${categorie.id}`, categorie);
  },
  removeCategorie(categorieId) {
    return Api.api().delete(`/materiel-categories/${categorieId}`);
  },
};

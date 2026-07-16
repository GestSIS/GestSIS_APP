import Api from "/src/http/Request";

export default {
  getCategories() {
    return Api.api().get("/exercice-categories");
  },
};

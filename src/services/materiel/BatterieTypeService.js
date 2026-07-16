import Api from "/src/http/Request";

export default {
  getBatterieTypes() {
    return Api.api().get("/batterie-types");
  },
  addBatterieType(type) {
    return Api.api().post("/batterie-types", type);
  },
  updateBatterieType(type) {
    return Api.api().put(`/batterie-types/${type.id}`, type);
  },
  removeBatterieType(id) {
    return Api.api().delete(`/batterie-types/${id}`);
  },
};

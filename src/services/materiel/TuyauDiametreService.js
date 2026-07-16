import Api from "/src/http/Request";

export default {
  getTuyauDiametres() {
    return Api.api().get("/tuyau-diametres");
  },
  addTuyauDiametre(type) {
    return Api.api().post("/tuyau-diametres", type);
  },
  updateTuyauDiametre(type) {
    return Api.api().put(`/tuyau-diametres/${type.id}`, type);
  },
  removeTuyauDiametre(id) {
    return Api.api().delete(`/tuyau-diametres/${id}`);
  },
};

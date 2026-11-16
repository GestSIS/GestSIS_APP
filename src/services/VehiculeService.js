import Api from "/src/http/Request";

export default {
  getVehicules() {
    return Api.api().get("/vehicules");
  },
};

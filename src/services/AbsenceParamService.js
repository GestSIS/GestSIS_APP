import Api from "/src/http/Request";

export default {
  getParams() {
    return Api.api().get("/absence-param");
  },
  updateParams(params) {
    return Api.api().post("/absence-param", params);
  },
};

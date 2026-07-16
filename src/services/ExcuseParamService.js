import Api from "/src/http/Request";

export default {
  getParams() {
    return Api.api().get("/excuse-param");
  },
  updateParams(params) {
    return Api.api().post("/excuse-param", params);
  },
};

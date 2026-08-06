import Api from "/src/http/Request";

export default {
  getParams(sisKey = null) {
    return Api.api().get("/excuse-param", {
      headers: sisKey === null ? {} : { "Sis-Key": sisKey },
    });
  },
  updateParams(params) {
    return Api.api().post("/excuse-param", params);
  },
};

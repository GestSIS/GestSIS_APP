import Api from "/src/http/Request";

export default {
  getMyIcsLinks() {
    return Api.api().get("/ics-tokens");
  },
  regenerate(sisKey) {
    return Api.api().post(`/ics-tokens/${sisKey}/regenerate`);
  },
};

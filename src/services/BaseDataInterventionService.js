import Api from "/src/http/Request";

export default {
  getStatFederal() {
    return Api.api().get("/stat-federal");
  },
};

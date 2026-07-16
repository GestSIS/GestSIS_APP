import Api from "/src/http/Request";

export default {
  getAlarmes() {
    return Api.api().get("/alarmes");
  },
};

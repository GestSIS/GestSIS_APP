import Api from "/src/http/Request";

export default {
  getSms(exerciceComptableId) {
    return Api.api().get("/sms/" + exerciceComptableId);
  },
};

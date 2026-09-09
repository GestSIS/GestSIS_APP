import Api from "/src/http/Request";

export default {
  getCoursSapeurs(exerciceComptableId) {
    return Api.api().get("/cours-sapeurs/" + exerciceComptableId);
  },
  addCoursMultiple(coursData) {
    return Api.api().post("/cours-sapeurs", coursData);
  },
};

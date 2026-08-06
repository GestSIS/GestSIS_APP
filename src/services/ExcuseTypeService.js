import Api from "/src/http/Request";

export default {
  getExcuses(sisKey = null) {
    return Api.api().get("/excuses-types", {
      headers: sisKey === null ? {} : { "Sis-Key": sisKey },
    });
  },
  addExcuse(excuse) {
    return Api.api().post("/excuses-types", excuse);
  },
  updateExcuse(excuse) {
    return Api.api().put(`/excuses-types/${excuse.id}`, excuse);
  },
  removeExcuse(excuse_id) {
    return Api.api().delete(`/excuses-types/${excuse_id}`);
  },
};

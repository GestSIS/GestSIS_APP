import Api from "/src/http/Request";

export default {
  getParams() {
    return Api.api().get("/sis-param");
  },
  updateParams(params) {
    return Api.api().post("/sis-param", params);
  },
  getContacts() {
    return Api.api().get("/sis-contacts");
  },
  addContact(contact) {
    return Api.api().post("/sis-contacts", contact);
  },
  removeContact(id) {
    return Api.api().delete("/sis-contacts/" + id);
  },
  getLogo() {
    return Api.apiFileDownload().get("/sis-logo/" + Api.getSisKey());
  },
  updateLogo(logo) {
    const form = new FormData();
    form.append("logo", logo);
    return Api.api().post("/sis-logo", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

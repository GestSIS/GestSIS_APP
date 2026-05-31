import Api from '/src/http/Request';

export default {
  getFichiers() {
    return Api.api().get('/rta/fichiers');
  },
  downloadFichier(fileId, filename) {
    return Api.apiFileDownload(filename).get(
      `/rta/fichiers/${fileId}`
    );
  },
  getDemandes() {
    return Api.api().get('/rta/demandes');
  },
  getReferenceRta() {
    return Api.api().get('/rta/reference');
  },
  getReferenceGestSis() {
    return Api.api().get('/rta/gestsis');
  },
  updateReference(data) {
    return Api.api().post('/rta/reference', data);
  },
};

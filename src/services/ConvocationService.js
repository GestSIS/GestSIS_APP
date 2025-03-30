import Api from '/src/http/Request';

export default {
  downloadConvocations(exerciceComptableId, params) {
    return Api.apiFileDownload('convocations.pdf', { 'no-footer': true }).get(
      '/convocation/' + exerciceComptableId,
      { params }
    );
  },
};

import Api from '@/http/Request';

export default {
  downloadConvocations(exerciceComptableId, params) {
    return Api.apiFileDownload('convocations.pdf').post('/convocation/' + exerciceComptableId, params);
  },
};

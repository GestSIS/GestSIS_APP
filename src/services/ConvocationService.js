import Api from '@/http/Request';

export default {
  downloadConvocations(exerciceComptableId, params) {
    return Api.print('convocations.pdf', { "no-footer": true }).get(
      '/convocation/' + exerciceComptableId,
      { params }
    );
  },
};

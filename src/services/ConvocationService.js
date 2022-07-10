import Api from '@/http/Request';

export default {
  downloadConvocations(exerciceComptableId, params) {
    return Api.print('convocations.pdf').get(
      '/convocation/' + exerciceComptableId,
      { params }
    );
  },
};

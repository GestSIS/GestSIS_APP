import Api from '@/http/Request';

export default {
  getControlesMedicaux() {
    return Api.api().get('/controles-medicaux');
  },
  getControleMedical(id) {
    return Api.api().get(`/controles-medicaux/${id}`);
  },
  createControleMedical(controleMedicalData) {
    return Api.api().post(`/controles-medicaux`, {
      ...controleMedicalData,
    });
  },
  updateControleMedical(id, controleData) {
    return Api.api().put('/controles-medicaux/' + id, {
      ...controleData,
    });
  },
  addJustificatif(id, file) {
    const form = new FormData();
    form.append('justificatif', file);
    return Api.api().post(
      '/controles-medicaux/' + id + '/justificatif',
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  downloadJustificatif(controleMedicalId, filename) {
    return Api.apiFileDownload(filename).get(
      `/controles-medicaux/${controleMedicalId}/justificatif`
    );
  },
  removeJustificatif(controleMedicalId) {
    return Api.api().delete(
      '/controles-medicaux/' + controleMedicalId + '/justificatif'
    );
  },
};

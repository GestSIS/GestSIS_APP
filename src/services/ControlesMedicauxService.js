import Api from '@/http/Request';

export default {
  getControlesMedicaux() {
    return Api.api().get('/controles-medicaux/');
  },
  getControleMedical(id) {
    return Api.api().get(`/controles-medicaux/${id}`);
  },
  createControleMedical(controleMedicalData) {
    return Api.api().post(`/controles-medicaux/`, {
      ...controleMedicalData
    });
  },
  updateControleMedical(id, controleData) {
    return Api.api().put('/controles-medicaux/' + id, {
      ...controleData
    });
  },
  addJustificatif(id, file) {
    const form = new FormData();
    form.append('justificatif', file)
    return Api.api().post('/controles-medicaux/' + id + '/justificatif/', form,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getJustificatif(controleMedicalId) {
    return Api.apiFileDownload().get(`/controles-medicaux/${controleMedicalId}/justificatif/`)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // link.target = '_blank' // If we want to open it in another tab
        console.log(response);
        link.setAttribute('download', 'file.pdf')
        // link.setAttribute('download', response.headers["content-disposition"].split("filename=")[1])
        link.click();
        window.URL.revokeObjectURL(url);
      });
  },
  removeJustificatif(controleMedicalId) {
    return Api.api().delete(
      '/controles-medicaux/' + controleMedicalId + '/justificatif/'
    );
  }
};

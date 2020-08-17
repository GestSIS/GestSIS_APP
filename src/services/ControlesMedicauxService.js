import Api from '@/http/Request';

export default {
  getControlesMedicaux() {
    return Api.api().get('/controles-medicaux/');
  },
  getControleMedical(id) {
    return Api.api().get(`/controles-medicaux/${id}`);
  }
};

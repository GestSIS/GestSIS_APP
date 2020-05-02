import Api from '@/http/Request';

export default {
  getControlesMedicaux() {
    return Api.api().get('/controles-medicaux/');
  }
};

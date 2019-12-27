import Api from '@/http/Request';

export default {
  getStats() {
    return Api.api().get('/intervention-traitement/');
  }
};

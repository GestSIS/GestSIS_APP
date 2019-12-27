import Api from '@/http/Request';

export default {
  getFonctions() {
    return Api.api().get('/fonctions/');
  }
};

import Api from '@/http/Request';

export default {
  getTelephones() {
    return Api.api().get('/telephones/');
  }
};

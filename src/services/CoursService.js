import Api from '@/http/Request';

export default {
  getCours() {
    return Api.api().get('/cours/');
  }
};

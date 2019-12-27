import Api from '@/http/Request';

export default {
  getTypes() {
    return Api.api().get('/type-intervention/');
  }
};

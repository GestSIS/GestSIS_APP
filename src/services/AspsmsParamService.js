import Api from '@/http/Request';

export default {
  getParams() {
    return Api.api().get('/aspsms-param');
  },
  updateParams(params) {
    return Api.api().post('/aspsms-param', params);
  },
};

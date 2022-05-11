import Api from '@/http/Request';

export default {
  getParams() {
    return Api.api().get('/aspsms-param');
  },
  getCredit() {
    return Api.api().get('/aspsms-credit');
  },
  updateParams(params) {
    return Api.api().post('/aspsms-param', params);
  },
};

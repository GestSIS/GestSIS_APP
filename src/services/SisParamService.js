import Api from '@/http/Request';

export default {
  getParams() {
    return Api.api().get('/sis-param');
  },
  updateParams(params) {
    return Api.api().post('/sis-param', params);
  },
};

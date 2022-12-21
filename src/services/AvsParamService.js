import Api from '/src/http/Request';

export default {
  getParams() {
    return Api.api().get('/avs-param');
  },
  updateParams(params) {
    return Api.api().post('/avs-param', params);
  },
};

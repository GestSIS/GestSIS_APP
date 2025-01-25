import Api from '/src/http/Request';

export default {
  getParams() {
    return Api.api().get('/convocation-param');
  },
  updateParams(params) {
    return Api.api().post('/convocation-param', params);
  },
};

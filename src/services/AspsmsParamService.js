import Api from '/src/http/Request';

export default {
  getParams() {
    return Api.api().get('/aspsms/param');
  },
  updateParams(params) {
    return Api.api().post('/aspsms/param', params);
  },
  getCredit() {
    return Api.api().get('/aspsms/credit');
  },
  sendSms(data) {
    return Api.api().post('/aspsms/send', data);
  },
};

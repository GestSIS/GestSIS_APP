import Api from '@/http/Request';

export default {
  getReferenceRta() {
    return Api.api().get('/rta/');
  },
  getReferenceGestSis() {
    return Api.api().get('/rta-gestsis/');
  },
  updatereference(data) {
    return Api.api().post('/rta/', data);
  },
};

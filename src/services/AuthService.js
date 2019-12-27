import Api from '@/http/Request';

export default {
  login(payload) {
    return Api.auth().post('/login', payload);
  },
  register(payload) {
    return Api.auth().post('/register', payload);
  },
  refreshToken(payload) {
    return Api.auth().post('refresh-token', { token: payload });
  }
};

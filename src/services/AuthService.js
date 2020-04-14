import Api from '@/http/Request';

export default {
  login(payload) {
    return Api.auth().post('/login', payload);
  },
  register(credentials) {
    return Api.auth().post('/register', credentials);
  },
  refreshToken(payload) {
    return Api.auth().post('refresh-token', { token: payload });
  }
};

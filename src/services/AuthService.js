import Api from '@/http/Request';

export default {
  login(payload) {
    return Api.auth().post('/login', payload);
  },
  register(credentials) {
    return Api.auth().post('/register', credentials);
  },
  newRegisterToken(tokenInfo) {
    return Api.auth().post('/register-token', tokenInfo);
  },
  refreshToken(payload) {
    return Api.auth().post('refresh-token', { token: payload });
  },
  updateUserRoles(user) {
    return Api.auth().post('users/' + user.id + "/roles", { roles: user.roles });
  },
  sisListe() {
    return Api.auth().get('sis');
  },
  getPermissions() {
    return Api.auth().get('permissions');
  },
  getRoles() {
    return Api.auth().get('roles');
  },
  getUsers() {
    return Api.auth().get('users');
  },
};

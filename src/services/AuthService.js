import Api from '@/http/Request';

export default {
  login(payload) {
    return Api.auth().post('/login', payload);
  },
  register(credentials) {
    return Api.auth().post('/register', credentials);
  },
  forgottenPassword(email) {
    return Api.auth().post('/forgotten-password', { email });
  },
  resetPassword(token, password) {
    return Api.auth().post('/reset-password', { token, password });
  },
  changePassword(data) {
    return Api.auth().post('/change-password', data);
  },
  useToken(token) {
    return Api.auth().post('/use-token', { token });
  },
  resendValidationEmail() {
    return Api.auth().post('/resend-confirmation');
  },
  confirmation(token) {
    return Api.auth().post('/confirmer-email', { token });
  },
  newRegisterToken(tokenInfo) {
    return Api.auth().post('/register-token', tokenInfo);
  },
  refreshToken(payload) {
    return Api.auth().post('refresh-token', { token: payload });
  },
  updateUserRoles(user) {
    return Api.auth().post('users/' + user.id + '/roles', {
      roles: user.roles,
    });
  },
  createRole(role) {
    return Api.auth().post('roles', role);
  },
  updateRole(role) {
    return Api.auth().put('roles/' + role.id, role);
  },
  deleteRole(roleId) {
    return Api.auth().delete('roles/' + roleId);
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

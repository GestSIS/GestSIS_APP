import Api from '@/http/Request';

export default {
  login(payload) {
    return Api.auth().post('/login', payload);
  },
  register(credentials) {
    return Api.auth().post('/register', credentials);
  },
  useToken(token) {
    return Api.auth().post('/use-token', { token });
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

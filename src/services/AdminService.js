import Api from '/src/http/Request';

export default {
  addSis(sis) {
    return Api.auth().post('/admin/sis', sis);
  },
  editSis(sis) {
    return Api.auth().patch('/admin/sis/' + sis.id, sis);
  },
  getUserToken(userId) {
    return Api.auth().get('/admin/token', {
      params: { user_id: userId },
    });
  },
  addUserRole(userRole) {
    return Api.auth().post('/admin/user-roles', userRole);
  },
  removeUserRole(userRoleId) {
    return Api.auth().delete(`/admin/user-roles/${userRoleId}`);
  },
  getAllUsers() {
    return Api.auth().get('/admin/users');
  },
  getAllSisContacts() {
    return Api.api().get('/sis-contacts-tous');
  },
  getAllSisParams() {
    return Api.api().get('/sis-params-tous');
  },
  getAllRoles() {
    return Api.auth().get('/admin/roles');
  },
  getUser(user) {
    return Api.auth().get('/admin/users/' + user.id);
  },
  editUser(user) {
    return Api.auth().patch('/admin/users/' + user.id, user);
  },
  deleteUser(userId) {
    return Api.auth().delete('/admin/users/' + userId);
  },
};

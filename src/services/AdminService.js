import Api from '/src/http/Request';

export default {
  addSis(sis) {
    return Api.auth().post('/sis/', sis);
  },
  editSis(sis) {
    return Api.auth().patch('/sis/' + sis.id, sis);
  },
  getAllUsers() {
    return Api.auth().get('/utilisateurs');
  },
  getAllSisContacts() {
    return Api.api().get('/sis-contacts-tous');
  },
  editUser(user) {
    return Api.auth().patch('/utilisateurs/' + user.id, user);
  },
  deleteUser(userId) {
    return Api.auth().delete('/utilisateurs/' + userId);
  },
};

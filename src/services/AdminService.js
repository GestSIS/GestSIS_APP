import Api from '/src/http/Request';

export default {
  addSis(sis) {
    return Api.auth().post('/sis/', sis);
  },
  editSis(sis) {
    return Api.auth().patch('/sis/' + sis.id, sis);
  },
};

import Api from '/src/http/Request';

export default {
  editSis(sis) {
    return Api.auth().patch('/sis/' + sis.id, sis);
  },
};

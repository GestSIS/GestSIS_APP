import Api from '@/http/Request';

export default {
  editSis(sis) {
    return Api.auth().patch('/sis/' + sis.id, sis);
  },
};

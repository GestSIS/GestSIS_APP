import Api from '@/http/Request';

export default {
  getCoursSapeurs(exerciceComptableId) {
    return Api.api().get('/cours-sapeurs/' + exerciceComptableId);
  },
};

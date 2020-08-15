import Api from '@/http/Request';

export default {
  getMedecins() {
    return Api.api().get('/medecins/');
  },
};

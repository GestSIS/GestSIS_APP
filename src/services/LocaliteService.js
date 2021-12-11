import Api from '@/http/Request';

export default {
  getLocalites() {
    return Api.api().get('/localites');
  },
};

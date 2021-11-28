import Api from '@/http/Request';

export default {
  getStats() {
    return Api.api().get('/stat-federal');
  },
};

import Api from '/src/http/Request';

export default {
  getStats() {
    return Api.api().get('/stat-federal');
  },
};

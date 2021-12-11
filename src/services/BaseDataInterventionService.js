import Api from '@/http/Request';

export default {
  getStatFederal() {
    return Api.api().get('/stat-federal');
  },
};

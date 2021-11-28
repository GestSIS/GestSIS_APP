import Api from '@/http/Request';

export default {
  getPhases() {
    return Api.api().get('/phase-types');
  },
};

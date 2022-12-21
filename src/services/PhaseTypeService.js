import Api from '/src/http/Request';

export default {
  getPhases() {
    return Api.api().get('/phase-types');
  },
};

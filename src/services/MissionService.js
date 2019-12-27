import Api from '@/http/Request';

export default {
  getMissions() {
    return Api.api().get('/mission-types/');
  }
};

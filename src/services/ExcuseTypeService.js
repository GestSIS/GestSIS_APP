import Api from '@/http/Request';

export default {
  getExcuses() {
    return Api.api().get('/excuses-types/');
  }
};

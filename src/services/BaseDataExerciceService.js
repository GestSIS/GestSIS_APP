import Api from '@/http/Request';

export default {
  getCategories() {
    return Api.api().get('/exercice-categories');
  },
};

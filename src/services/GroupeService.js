import Api from '@/http/Request';

export default {
  getGroupes() {
    return Api.api().get('/groupes/');
  },
  getGroupesSapeurs() {
    return Api.api().get('/groupes-sapeurs');
  }
};

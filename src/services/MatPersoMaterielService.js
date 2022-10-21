import Api from '@/http/Request';

export default {
  getARecuperer() {
    return Api.api().get('/mat-perso/a-recuperer');
  },
};

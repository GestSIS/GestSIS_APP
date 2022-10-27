import Api from '@/http/Request';

export default {
  getMateriel() {
    return Api.api().get('/mat-perso');
  },
  getARecuperer() {
    return Api.api().get('/mat-perso/a-recuperer');
  },
};

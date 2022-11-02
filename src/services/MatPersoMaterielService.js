import Api from '@/http/Request';

export default {
  getMateriel() {
    return Api.api().get('/mat-perso');
  },
  getARecuperer() {
    return Api.api().get('/mat-perso/a-recuperer');
  },
  attribuer(materiels) {
    return Api.api().post('/mat-perso/attribuer', { attributions: materiels });
  },
  retour(materiels) {
    return Api.api().post('/mat-perso/retour', { data: materiels });
  },
};

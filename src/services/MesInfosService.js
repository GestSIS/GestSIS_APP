import Api from '@/http/Request';

export default {
  getMesInfos() {
    return Api.api().get('/mes-infos');
  },
  getMesExercices(exerciceComptableId) {
    return Api.api().get('/mes-exercices/' + exerciceComptableId);
  },
  getMesInterventions(exerciceComptableId) {
    return Api.api().get('/mes-interventions/' + exerciceComptableId);
  },
  getMesDecomptes(exerciceComptableId) {
    return Api.api().get('/mes-decomptes/' + exerciceComptableId);
  },
  printMonDecompte(decompteId, filename) {
    return Api.print(filename).get(`/mes-decomptes/${decompteId}/print`);
  },
  getMonMateriel() {
    return Api.api().get('/mon-materiel');
  },
};

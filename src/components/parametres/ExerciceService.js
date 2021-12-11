import Api from '@/http/Request';

export default {
  getExercices(exerciceComptableId) {
    return Api.api().get('/exercices', {
      params: { exercice_comptable_id: exerciceComptableId },
    });
  },
  getExercice(exerciceId) {
    return Api.api().get('/exercices/' + exerciceId);
  },
  getSapeurs(exerciceId) {
    return Api.api().get('/exercices/' + exerciceId + '/sapeurs');
  },
  createExercice(exerciceData) {
    return Api.api().post('/exercices', exerciceData);
  },
  validerExercice(exerciceId) {
    return Api.api().post('/exercices/' + exerciceId + '/valider');
  },
  saveExercice(exerciceId, exerciceData) {
    return Api.api().put('/exercices/' + exerciceId, exerciceData);
  },
  addSapeurs(exercieId, sapeursData) {
    return Api.api().post('/exercices/' + exercieId + '/sapeurs', sapeursData);
  },
  editSapeurs(exercieId, sapeursData) {
    return Api.api().put('/exercices/' + exercieId + '/sapeurs', sapeursData);
  },
  removeSapeurs(exercieId, sapeursIds) {
    return Api.api().delete('/exercices/' + exercieId + '/sapeurs', {
      data: sapeursIds,
    });
  },
  downloadListPresence(exerciceId, filename) {
    return Api.apiFileDownload(filename).get(
      `/exercices/${exerciceId}/liste-presence`
    );
  },
  downloadListAppel(exerciceId, filename) {
    return Api.apiFileDownload(filename).get(
      `/exercices/${exerciceId}/liste-appel`
    );
  },
};

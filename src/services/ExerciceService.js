import Api from '/src/http/Request';

export default {
  getExercices(exerciceComptableId) {
    return Api.api().get('/exercices', {
      params: { exercice_comptable_id: exerciceComptableId },
    });
  },
  getAbsences(exerciceComptableId) {
    return Api.api().get('/exercices-absences/' + exerciceComptableId);
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
  deleteExercice(exerciceId) {
    return Api.api().delete('/exercices/' + exerciceId);
  },
  cancelExercice(exerciceId) {
    return Api.api().post('/exercices/' + exerciceId + '/annuler');
  },
  reactivateExercice(exerciceId) {
    return Api.api().post('/exercices/' + exerciceId + '/reactiver');
  },
  validerExercice(exerciceId) {
    return Api.api().post('/exercices/' + exerciceId + '/valider');
  },
  saveExercice(exerciceId, exerciceData) {
    return Api.api().put('/exercices/' + exerciceId, exerciceData);
  },
  updatePresences(presences) {
    return Api.api().put('/exercices/sapeurs', { presences });
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
  // Nouvelle API
  editPresence(presenceId, presence) {
    return Api.api().put('/exercices/presence/' + presenceId, presence);
  },
  createExcuse(exerciceId, excuse) {
    return Api.api().put('/mes-excuses/' + exerciceId, excuse);
  },
  downloadListPresence(exerciceId, filename) {
    return Api.print(filename).get(`/exercices/${exerciceId}/liste-presence`);
  },
  downloadListAppel(exerciceId, filename) {
    return Api.print(filename).get(`/exercices/${exerciceId}/liste-appel`);
  },
};

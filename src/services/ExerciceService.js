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
  removeSapeurs(exercieId, sapeursIds) {
    return Api.api().delete('/exercices/' + exercieId + '/sapeurs', {
      data: sapeursIds,
    });
  },
  // Nouvelle API
  editPresence(presenceId, presence) {
    const form = new FormData();
    Object.entries(presence).forEach(([k, v]) => form.append(k, v));
    return Api.api().post('/exercices/presence/' + presenceId, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createExcuse(exerciceId, excuse) {
    const form = new FormData();
    Object.entries(excuse).forEach(([k, v]) => form.append(k, v));
    return Api.api().post('/mes-excuses/' + exerciceId, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadMonExcuseJustificatif(exerciceId, filename) {
    return Api.apiFileDownload(filename).get(
      `/mes-excuses/${exerciceId}/justificatif`
    );
  },
  downloadExcuseJustificatif(exerciceId, sapeurId, filename) {
    return Api.apiFileDownload(filename).get(
      `exercices/${exerciceId}/excuse/${sapeurId}/justificatif`
    );
  },
  downloadListPresence(exerciceId, filename) {
    return Api.print(filename).get(`/exercices/${exerciceId}/liste-presence`);
  },
  downloadListAppel(exerciceId, filename) {
    return Api.print(filename).get(`/exercices/${exerciceId}/liste-appel`);
  },
};

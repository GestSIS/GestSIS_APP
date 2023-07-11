import Api from '/src/http/Request';

export default {
  getAbsences(exerciceComptableId) {
    return Api.api().get('/absences/' + exerciceComptableId);
  },
  addAbsence(absence) {
    return Api.api().post('/absences', absence);
  },
  updateAbsence(absence) {
    return Api.api().put(`/absences/${absence.id}`, absence);
  },
  removeAbsence(absence_id) {
    return Api.api().delete(`/absences/${absence_id}`);
  },
};

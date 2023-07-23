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
  addMonAbsence(absence) {
    return Api.api().post('/mes-absences', absence);
  },
  updateMonAbsence(absence) {
    return Api.api().put(`/mes-absences/${absence.id}`, absence);
  },
  removeMonAbsence(absence_id) {
    return Api.api().delete(`/mes-absences/${absence_id}`);
  },
};

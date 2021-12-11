import Api from '@/http/Request';

export default {
  getGrades() {
    return Api.api().get('/grades');
  },
  addGrade(grade) {
    return Api.api().post('/grades', grade);
  },
  updateGrade(grade) {
    return Api.api().put(`/grades/${grade.id}`, grade);
  },
  removeGrade(grade_id) {
    return Api.api().delete(`/grades/${grade_id}`);
  },
};

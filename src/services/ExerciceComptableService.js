import Api from '@/http/Request';

export default {
  getExercices() {
    return Api.api().get('/exercice-comptables/');
  }
};

import Api from '@/services/Api'

export default {
  getExercices() {
    return Api.api().get('/exercice-comptables/')
  }
}

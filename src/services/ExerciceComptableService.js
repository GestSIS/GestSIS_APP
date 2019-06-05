import Api from '@/services/Api'

export default {
  getExercices() {
    return Api().get('/exercice-comptables/')
  }
}

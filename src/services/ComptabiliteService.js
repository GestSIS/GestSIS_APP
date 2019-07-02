import Api from '@/services/Api'

export default {
  getIndemniteTypes() {
    return Api().get('/indemnites-types/')
  },
  getFraisTypes() {
    return Api().get('/frais-types/')
  },
  imputerExercice(exerciceId, payload) {
    return Api().post('/imputation/exercice/' + exerciceId, payload)
  }
}

import Api from '@/services/Api'

export default {
  getPermisType() {
    return Api().get('/permis/')
  },
  getCivilites() {
    return Api().get('/civilites/')
  },
  getTelephones() {
    return Api().get('/telephone-types/')
  }
}

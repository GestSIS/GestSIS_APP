import Api from '@/services/Api'

export default {
  getPermisType() {
    return Api().get('/permis/')
  },
  getCivilites() {
    return Api().get('/civilites/')
  },
}

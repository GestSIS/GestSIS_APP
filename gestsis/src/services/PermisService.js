import Api from '@/services/Api'

export default {
  getPermis() {
    return Api().get('/permis/')
  },
}

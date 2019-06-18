import Api from '@/services/Api'

export default {
  getPhases() {
    return Api().get('/phase-types/')
  }
}

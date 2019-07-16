import Api from '@/services/Api'

export default {
  getPhases() {
    return Api.api().get('/phase-types/')
  }
}

import Api from '@/services/Api'

export default {
  getStats() {
    return Api.api().get('/stat-federal/')
  }
}

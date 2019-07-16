import Api from '@/services/Api'

export default {
  getStatFederal() {
    return Api.api().get('/stat-federal/')
  },
}

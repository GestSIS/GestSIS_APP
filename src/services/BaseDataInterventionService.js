import Api from '@/services/Api'

export default {
  getStatFederal() {
    return Api().get('/stat-federal/')
  },
}

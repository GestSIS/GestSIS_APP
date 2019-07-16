import Api from '@/services/Api'

export default {
  getGroupes() {
    return Api.api().get('/groupes/')
  },
  getGroupesSapeurs() {
    return Api.api().get('/groupes-sapeurs')
  }
}

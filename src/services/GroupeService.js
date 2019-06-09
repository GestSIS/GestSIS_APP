import Api from '@/services/Api'

export default {
  getGroupes() {
    return Api().get('/groupes/')
  },
  getGroupesSapeurs() {
    return Api().get('/groupes-sapeurs')
  }
}

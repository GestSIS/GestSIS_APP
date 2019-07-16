import Api from '@/services/Api'

export default {
  getCategories() {
    return Api.api().get('/exercice-categories/')
  }
}

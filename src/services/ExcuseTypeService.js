import Api from '@/services/Api'

export default {
  getExcuses() {
    return Api().get('/excuses-types/')
  }
}

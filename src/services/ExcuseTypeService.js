import Api from '@/services/Api'

export default {
  getExcuses() {
    return Api.api().get('/excuses-types/')
  }
}

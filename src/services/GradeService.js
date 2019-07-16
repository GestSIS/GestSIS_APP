import Api from '@/services/Api'

export default {
  getGrades() {
    return Api.api().get('/grades/')
  }
}

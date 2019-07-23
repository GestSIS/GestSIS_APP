import Api from '@/http/Request'

export default {
  getGrades() {
    return Api.api().get('/grades/')
  }
}

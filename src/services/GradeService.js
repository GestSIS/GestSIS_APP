import Api from '@/services/Api'

export default {
  getGrades() {
    return Api().get('/grades/')
  }
}

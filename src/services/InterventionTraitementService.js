import Api from '@/services/Api'

export default {
  getStats() {
    return Api().get('/intervention-traitement/')
  }
}

import Api from '@/services/Api'

export default {
  getVehicules() {
    return Api().get('/vehicules/')
  }
}

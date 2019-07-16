import Api from '@/services/Api'

export default {
  getVehicules() {
    return Api.api().get('/vehicules/')
  }
}

import Api from '@/http/Request';

export default {
  getVehicules() {
    return Api.api().get('/vehicules/');
  }
};

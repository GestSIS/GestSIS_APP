import Api from '@/http/Request';

export default {
  getAmendes() {
    return Api.api().get('/amendes');
  },
  updateAmendes(amendes) {
    return Api.api().post(`/amendes`, amendes);
  },
};

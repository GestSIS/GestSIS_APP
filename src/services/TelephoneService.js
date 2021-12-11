import Api from '@/http/Request';

export default {
  getTelephones() {
    return Api.api().get('/telephones');
  },
  addTelephone(telephone) {
    return Api.api().post('/telephones', telephone);
  },
  updateTelephone(telephone) {
    return Api.api().put(`/telephones/${telephone.id}`, telephone);
  },
  removeTelephone(telephone_id) {
    return Api.api().delete(`/telephones/${telephone_id}`);
  },
};

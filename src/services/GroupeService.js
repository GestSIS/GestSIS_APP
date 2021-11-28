import Api from '@/http/Request';

export default {
  getGroupes() {
    return Api.api().get('/groupes');
  },
  createGroupe(data) {
    return Api.api().post('/groupes', data);
  },
  updateGroupe(groupeId, data) {
    return Api.api().put(`/groupes/${groupeId}`, data);
  },
  deleteGroupe(groupeId) {
    return Api.api().delete(`/groupes/${groupeId}`);
  },
  updateGroupeSapeurs(groupeId, data) {
    return Api.api().post(`/groupes/${groupeId}/sapeurs`, data);
  },
};

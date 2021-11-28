import Api from '@/http/Request';

export default {
  getMissions() {
    return Api.api().get('/mission-types');
  },
  addMission(mission) {
    return Api.api().post('/mission-types', mission);
  },
  updateMission(mission) {
    return Api.api().put(`/mission-types/${mission.id}`, mission);
  },
  removeMission(mission_id) {
    return Api.api().delete(`/mission-types/${mission_id}`);
  },
};

import Api from '@/http/Request';

export default {
  getStats() {
    return Api.api().get('/stat-intervention');
  },
  addStat(stat) {
    return Api.api().post('/stat-intervention', stat);
  },
  updateStat(stat) {
    return Api.api().put(`/stat-intervention/${stat.id}`, stat);
  },
  removeStat(stat_id) {
    return Api.api().delete(`/stat-intervention/${stat_id}`);
  },
};

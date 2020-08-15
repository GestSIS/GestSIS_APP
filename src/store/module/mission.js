import types from '../mutationTypes';
import MissionService from '../../services/MissionService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_MISSION_LISTE](state, payload) {
      state.liste = payload;
    }
  },
  actions: {
    fetchMissions({ commit }) {
      return MissionService.getMissions().then(data =>
        commit(types.UPDATE_MISSION_LISTE, data)
      );
    }
  }
};

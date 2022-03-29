import types from '../mutationTypes';
import MissionService from '../../services/MissionService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_MISSION_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_MISSION](state, mission) {
      state.liste = [...state.liste, mission];
    },
    [types.UPDATE_MISSION](state, mission) {
      state.liste = [
        ...state.liste.map((m) => (m.id === mission.id ? mission : m)),
      ];
    },
    [types.REMOVE_MISSION](state, missionId) {
      state.liste = state.liste.filter((m) => m.id != missionId);
    },
  },
  actions: {
    fetchMissions({ commit }) {
      return MissionService.getMissions().then((data) =>
        commit(types.UPDATE_MISSION_LISTE, data)
      );
    },
    addMission({ commit }, mission) {
      return MissionService.addMission(mission).then((data) => {
        commit(types.ADD_MISSION, data);
        return data;
      });
    },
    updateMission({ commit }, mission) {
      return MissionService.updateMission(mission).then((data) => {
        commit(types.UPDATE_MISSION, data);
        return data;
      });
    },
    removeMission({ commit }, missionId) {
      return MissionService.removeMission(missionId).then((data) => {
        commit(types.REMOVE_MISSION, missionId);
        return data;
      });
    },
  },
};

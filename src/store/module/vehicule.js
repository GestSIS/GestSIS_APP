import types from '../mutationTypes';
import VehiculeService from '../../services/VehiculeService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_VEHICULE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_VEHICULE](state, vehicule) {
      state.liste = [...state.liste, vehicule];
    },
    [types.UPDATE_VEHICULE](state, vehicule) {
      state.liste = [
        ...state.liste.map((m) => (m.id === vehicule.id ? vehicule : m)),
      ];
    },
    [types.REMOVE_VEHICULE](state, vehiculeId) {
      state.liste = state.liste.filter((m) => m.id != vehiculeId);
    },
  },
  actions: {
    fetchVehicules({ commit }) {
      return VehiculeService.getVehicules().then((data) =>
        commit(types.UPDATE_VEHICULE_LISTE, data)
      );
    },
    addVehicule({ commit }, vehicule) {
      return VehiculeService.addVehicule(vehicule).then((data) => {
        commit(types.ADD_VEHICULE, data);
        return data;
      });
    },
    updateVehicule({ commit }, vehicule) {
      return VehiculeService.updateVehicule(vehicule).then((data) => {
        commit(types.UPDATE_VEHICULE, data);
        return data;
      });
    },
    removeVehicule({ commit }, vehicule) {
      return VehiculeService.removeVehicule(vehicule).then((data) => {
        commit(types.REMOVE_VEHICULE, data);
        return data;
      });
    },
  },
};

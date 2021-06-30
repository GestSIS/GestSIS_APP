import types from '../mutationTypes';
import AmendeService from '../../services/AmendeService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_AMENDE_LISTE](state, payload) {
      state.liste = payload;
    },
  },
  getters: {
    getAmende: (state) => (id) => state.liste.find((c) => c.id === id),
  },
  actions: {
    fetchAmendes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return AmendeService.getAmendes().then((data) =>
          commit(types.UPDATE_AMENDE_LISTE, data)
        );
      }
    },
    updateAmendes({ commit }, amendes) {
      return AmendeService.updateAmendes(amendes).then((data) => {
        commit(types.UPDATE_AMENDE_LISTE, data);
        return data;
      });
    },
  },
};

import types from '../mutationTypes';
import RtaService from '../../services/RtaService';

export default {
  state: {
    reference: [],
    actuel: [],
  },
  mutations: {
    [types.UPDATE_RTA_REFERENCE_RTA](state, payload) {
      state.reference = payload;
    },
    [types.UPDATE_RTA_REFERENCE_GESTSIS](state, payload) {
      state.actuel = payload;
    },
  },
  actions: {
    fetchReferenceRta({ commit }) {
      return RtaService.getReferenceRta().then((data) =>
        commit(types.UPDATE_RTA_REFERENCE_RTA, data)
      );
    },
    fetchReferenceGestSis({ commit }) {
      return RtaService.getReferenceGestSis().then((data) =>
        commit(types.UPDATE_RTA_REFERENCE_GESTSIS, data)
      );
    },
    updateReferenceRta({ commit }, payload) {
      return RtaService.updateReference(payload).then((data) =>
        commit(types.UPDATE_RTA_REFERENCE_RTA, data)
      );
    },
  },
};

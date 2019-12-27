import types from '../mutationTypes';
import LocaliteService from '../../services/LocaliteService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_LOCALITE_LIST](state, payload) {
      state.liste = payload;
    }
  },
  getters: {
    listLocalites: state => state.liste,
    listLocalitesSis: state => state.liste,
    getLocalite: state => localite_id =>
      state.liste.filter(l => l.id === localite_id)[0]
  },
  actions: {
    fetchLocalites({ commit }) {
      return LocaliteService.getLocalites().then(data =>
        commit(types.UPDATE_LOCALITE_LIST, data)
      );
    }
  }
};

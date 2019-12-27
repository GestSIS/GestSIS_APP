import types from '../mutationTypes';
import ExcuseTypeService from '../../services/ExcuseTypeService';

export default {
  state: {
    liste: [],
    activeExcuseTypeId: null
  },
  mutations: {
    [types.UPDATE_EXCUSE_TYPE_LIST](state, payload) {
      state.liste = payload;
    },
    [types.SELECT_EXCUSE_TYPE](state, payload) {
      state.activeExcuseTypeId = payload;
    }
  },
  getters: {
    listExcuseTypes: state => state.liste,
    getExcuseType: state => exercice_id =>
      state.liste.filter(e => e.id === exercice_id)[0]
  },
  actions: {
    fetchExcuseTypes({ commit }) {
      return ExcuseTypeService.getExcuses().then(data =>
        commit(types.UPDATE_EXCUSE_TYPE_LIST, data)
      );
    },
    selectExcuseType({ commit }, excuse_type_id) {
      return commit(types.SELECT_EXCUSE_TYPE, excuse_type_id);
    }
  }
};

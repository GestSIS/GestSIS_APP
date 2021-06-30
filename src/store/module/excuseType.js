import excuses from '../mutationTypes';
import ExcuseTypeService from '../../services/ExcuseTypeService';

export default {
  state: {
    liste: [],
    activeExcuseTypeId: null,
  },
  mutations: {
    [excuses.UPDATE_EXCUSE_TYPE_LISTE](state, payload) {
      state.liste = payload;
    },
    [excuses.SELECT_EXCUSE_TYPE](state, payload) {
      state.activeExcuseTypeId = payload;
    },
    [excuses.ADD_EXCUSE_TYPE](state, excuse) {
      state.liste = [...state.liste, excuse];
    },
    [excuses.UPDATE_EXCUSE_TYPE](state, excuse) {
      state.liste = [
        ...state.liste.map((m) => (m.id === excuse.id ? excuse : m)),
      ];
    },
    [excuses.REMOVE_EXCUSE_TYPE](state, excuseId) {
      state.liste = state.liste.filter((m) => m.id != excuseId);
    },
  },
  getters: {
    getExcuseType: (state) => (exercice_id) =>
      state.liste.filter((e) => e.id === exercice_id)[0],
  },
  actions: {
    fetchExcuseTypes({ commit }) {
      return ExcuseTypeService.getExcuses().then((data) =>
        commit(excuses.UPDATE_EXCUSE_TYPE_LISTE, data)
      );
    },
    selectExcuseType({ commit }, excuse_excuse_id) {
      return commit(excuses.SELECT_EXCUSE_TYPE, excuse_excuse_id);
    },
    addExcuseType({ commit }, excuse) {
      return ExcuseTypeService.addExcuse(excuse).then((data) => {
        commit(excuses.ADD_EXCUSE_TYPE, data);
        return data;
      });
    },
    updateExcuseType({ commit }, excuse) {
      return ExcuseTypeService.updateExcuse(excuse).then((data) => {
        commit(excuses.UPDATE_EXCUSE_TYPE, data);
        return data;
      });
    },
    removeExcuseType({ commit }, excuse) {
      return ExcuseTypeService.removeExcuse(excuse).then((data) => {
        commit(excuses.REMOVE_EXCUSE_TYPE, data);
        return data;
      });
    },
  },
};

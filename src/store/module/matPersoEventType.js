import types from '../mutationTypes';
import MatPersoEventTypeService from '../../services/MatPersoEventTypeService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_EVENT_TYPE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_MAT_PERSO_EVENT_TYPE](state, event) {
      state.liste = [...state.liste, event];
    },
    [types.UPDATE_MAT_PERSO_EVENT_TYPE](state, event) {
      state.liste = [
        ...state.liste.map((m) => (m.id === event.id ? event : m)),
      ];
    },
    [types.REMOVE_MAT_PERSO_EVENT_TYPE](state, eventId) {
      state.liste = state.liste.filter((m) => m.id != eventId);
    },
  },
  actions: {
    fetchMatPersoEventTypes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return MatPersoEventTypeService.getEvents().then((data) =>
          commit(types.UPDATE_MAT_PERSO_EVENT_TYPE_LISTE, data)
        );
      }
    },
    addMatPersoEventType({ commit }, event) {
      return MatPersoEventTypeService.addEvent(event).then((data) => {
        commit(types.ADD_MAT_PERSO_EVENT_TYPE, data);
        return data;
      });
    },
    updateMatPersoEventType({ commit }, event) {
      return MatPersoEventTypeService.updateEvent(event).then((data) => {
        commit(types.UPDATE_MAT_PERSO_EVENT_TYPE, data);
        return data;
      });
    },
    removeMatPersoEventType({ commit }, eventId) {
      return MatPersoEventTypeService.removeEvent(eventId).then((data) => {
        commit(types.REMOVE_MAT_PERSO_EVENT_TYPE, eventId);
        return data;
      });
    },
  },
};

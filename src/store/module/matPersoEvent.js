import types from '../mutationTypes';
import MatPersoEventService from '../../services/MatPersoEventService.js';

export default {
  state: {
    // events: [],
  },
  mutations: {
    // [types.CLEAR_CACHE](state) {
    //   state.liste = [];
    // },
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
    addMatPersoEvents({ commit }, events) {
      return MatPersoEventService.addEvents(events).then((data) => {
        commit(types.UPDATE_MAT_PERSO_LISTE, data);
        return data;
      });
    },
    // updateMatPersoEventType({ commit }, event) {
    //   return MatPersoEventTypeService.updateEvent(event).then((data) => {
    //     commit(types.UPDATE_MAT_PERSO_EVENT_TYPE, data);
    //     return data;
    //   });
    // },
    // removeMatPersoEventType({ commit }, eventId) {
    //   return MatPersoEventTypeService.removeEvent(eventId).then((data) => {
    //     commit(types.REMOVE_MAT_PERSO_EVENT_TYPE, eventId);
    //     return data;
    //   });
    // },
  },
};

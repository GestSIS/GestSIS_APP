import types from '../mutationTypes';

export default {
  state: {
    modalVisible: false,
    modalComponent: null,
    modalCallback: null,
    modalSize: 0,
    modalData: null,
  },
  mutations: {
    [types.SHOW_MODAL](state, payload) {
      state.modalVisible = true;
      if (typeof payload === 'string') {
        state.modalCallback = () => Promise.resolve();
        state.modalSize = 0;
        state.modalData = {};
        state.modalComponent = payload;
      } else {
        state.modalCallback = payload.callback || (() => Promise.resolve());
        state.modalSize = payload?.size ?? 0;
        state.modalData = payload?.data ?? {};
        state.modalComponent = payload.component;
      }
    },
    [types.HIDE_MODAL](state) {
      state.modalVisible = false;
    },
    [types.UPDATE_MODAL_SIZE](state, payload) {
      state.modalSize = payload;
    },
  },
};

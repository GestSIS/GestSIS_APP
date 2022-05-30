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
        state.modalComponent = payload;
        state.modalCallback = () => Promise.resolve();
        state.modalSize = 0;
        state.modalData = {};
      } else {
        state.modalComponent = payload.component;
        state.modalCallback = payload.callback || (() => Promise.resolve());
        state.modalSize = payload?.size ?? 0;
        state.modalData = payload?.data ?? {};
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

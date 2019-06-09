import types from '../mutationTypes'

export default {
  state: {
    modalVisible: false,
    modalComponent: null,
    modalCallback: null,
    modalSize: 0
  },
  mutations: {
    [types.SHOW_MODAL](state, payload) {
      state.modalVisible = true
      if (typeof payload === 'string') {
        state.modalComponent = payload
        state.modalCallback = () => {}
        state.modalSize = 0
      } else {
        state.modalComponent = payload.component
        state.modalCallback = payload.callback || function() {}
        state.modalCallback = payload.size || 0
      }
    },
    [types.HIDE_MODAL](state) {
      state.modalVisible = false
    }
  }
}

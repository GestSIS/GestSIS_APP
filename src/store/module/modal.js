import types from '../mutationTypes'

export default {
  state: {
    modalVisible: false,
    modalComponent: null,
    modalCallback: null
  },
  mutations: {
    [types.SHOW_MODAL](state, payload) {
      state.modalVisible = true
      if (typeof payload === 'string') {
        state.modalComponent = payload
        state.modalCallback = () => {}
      } else {
        state.modalComponent = payload.component
        state.modalCallback = payload.callback
      }
    },
    [types.HIDE_MODAL](state) {
      state.modalVisible = false
    }
  }
}

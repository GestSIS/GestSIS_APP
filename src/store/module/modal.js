import types from '../mutationTypes'

export default {
  state: {
    modalVisible: false,
    modalComponent: null
  },
  mutations: {
    [types.SHOW_MODAL](state, componentName) {
      state.modalVisible = true,
      state.modalComponent = componentName
    },
    [types.HIDE_MODAL](state) {
      state.modalVisible = false
    }
  },
}

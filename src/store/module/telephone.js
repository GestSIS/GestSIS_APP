import types from '../mutationTypes'
import TelephoneService from '../../services/TelephoneService'

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_TELEPHONE_LIST](state, payload) {
      state.liste = payload
    }
  },
  actions: {
    fetchTelephones({ commit }) {
      return TelephoneService.getTelephones().then(data => {
        return commit(types.UPDATE_TELEPHONE_LIST, data)
      })
    }
  }
}

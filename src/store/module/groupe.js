import types from '../mutationTypes'
import GroupeService from '../../services/GroupeService'

export default {
  state: {
    groupes: []
  },
  mutations: {
    [types.UPDATE_GROUPE_LIST](state, payload) {
      state.groupes = payload
    }
  },
  getters: {
    listGroupes: state => {
      return state.groupes
    },
    getGroupe: state => groupe_id => {
      return state.groupes.filter(g => g.id === groupe_id)[0]
    }
  },
  actions: {
    fetchGroupes({ commit }) {
      return GroupeService.getGroupes().then(data => {
        return commit(types.UPDATE_GROUPE_LIST, data)
      })
    }
  }
}

import types from '../mutationTypes'
import GroupeService from '../../services/GroupeService'

export default {
  state: {
    groupes: [],
    groupesSapeurs: []
  },
  mutations: {
    [types.UPDATE_GROUPE_LIST](state, payload) {
      state.groupes = payload
    },
    [types.UPDATE_GROUPE_SAPEUR_LIST](state, payload) {
      state.groupesSapeurs = payload
    }
  },
  getters: {
    listGroupes: state => {
      return state.groupes
    },
    listGroupesSapeurs: state => {
      return state.groupesSapeurs
    },
    treeGroupesSapeurs: state => {
      let insideGroupes = function(groupeId) {
        return state.groupesSapeurs
          .filter(i => i.pere_id === groupeId)
          .map(s => Object.assign({}, s))
          .map(s => {
            return {
              ...s,
              sapeurs:s.sapeurs.map(s => s.sapeur_id),
              groupes: insideGroupes(s.id)
            }
          })
      }
      return insideGroupes(null)
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
    },
    fetchGroupesSapeurs({ commit }) {
      return GroupeService.getGroupesSapeurs().then(data => {
        return commit(types.UPDATE_GROUPE_SAPEUR_LIST, data)
      })
    }
  }
}

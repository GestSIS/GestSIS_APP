import types from '../mutationTypes'
import GroupeService from '../../services/GroupeService'

export default {
  state: {
    liste: [],
    listeWithSapeurs: []
  },
  mutations: {
    [types.UPDATE_GROUPE_LIST](state, payload) {
      state.liste = payload
    },
    [types.UPDATE_GROUPE_SAPEUR_LIST](state, payload) {
      state.listeWithSapeurs = payload
    }
  },
  getters: {
    listGroupesSapeurs: state => {
      return state.listeWithSapeurs
    },
    treeGroupesSapeurs: state => {
      let insideGroupes = function(groupeId) {
        return state.listeWithSapeurs
          .filter(i => i.pere_id === groupeId)
          .map(s => Object.assign({}, s))
          .map(s => {
            return {
              ...s,
              sapeurs: s.sapeurs.map(s => s.sapeur_id),
              groupes: insideGroupes(s.id)
            }
          })
      }
      return insideGroupes(null)
    },
    getGroupe: state => groupe_id => {
      return state.liste.filter(g => g.id === groupe_id)[0]
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

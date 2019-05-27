import types from '../mutationTypes'
import SapeurService from '../../services/SapeurService'

export default {
  state: {
    sapeurs: [],
    currentSapeur: {
      id: 0,
      permis: [],
      data: {},
      telephones: [],
      groupes: [],
      grades: [],
      fonctions: [],
      cours: []
    }
  },
  getters: {
    listSapeur: state => {
      return state.sapeurs.sort((s1, s2) =>
        (s1.nom + s1.prenom).localeCompare(s2.nom + s2.prenom)
      )
    },
    activeSapeur: state => {
      return state.currentSapeur.data
    },
    activeSapeurPermis: state => {
      return state.currentSapeur.permis
    },
    activeSapeurTelephones: state => {
      return state.currentSapeur.telephones
    },
    activeSapeurGrades: state => {
      return state.currentSapeur.grades
    },
    activeSapeurCours: state => {
      return state.currentSapeur.cours
    },
    activeSapeurFonctions: state => {
      return state.currentSapeur.fonctions
    },
    activeSapeurGroupes: state => {
      return state.currentSapeur.groupes
    },
    activeSapeurId: state => {
      return state.currentSapeur.id || 0
    }
  },
  mutations: {
    [types.UPDATE_SAPEURS_LIST](state, payload) {
      state.sapeurs = payload
    },
    [types.SELECT_CURRENT_SAPEUR](state, payload) {
      state.currentSapeur.id = payload
    },
    [types.UPDATE_CURRENT_SAPEUR_DATA](state, payload) {
      state.currentSapeur.data = payload
      state.sapeurs = [
        ...state.sapeurs.filter(s => s.id !== payload.id),
        payload
      ]
    },
    [types.UPDATE_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.currentSapeur.permis = payload
    },
    [types.UPDATE_CURRENT_SAPEUR_GRADES](state, payload) {
      state.currentSapeur.grades = payload
    },
    [types.UPDATE_CURRENT_SAPEUR_GROUPES](state, payload) {
      state.currentSapeur.groupes = payload
    },
    [types.UPDATE_CURRENT_SAPEUR_COURS](state, payload) {
      state.currentSapeur.cours = payload
    },
    [types.UPDATE_CURRENT_SAPEUR_FONCTIONS](state, payload) {
      state.currentSapeur.fonctions = payload
    },
    [types.ADD_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.currentSapeur.permis = [...state.currentSapeur.permis, payload]
    },
    [types.REMOVE_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.currentSapeur.permis = state.currentSapeur.permis.filter(
        p => p.id !== payload
      )
    },
    [types.EDIT_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.currentSapeur.permis = [
        ...state.currentSapeur.permis.filter(p => p.id !== payload.id),
        payload
      ]
    }
  },
  actions: {
    selectSapeur({ commit }, payload) {
      return commit(types.SELECT_CURRENT_SAPEUR, payload)
    },
    fetchListSapeur({ commit }) {
      return SapeurService.getSapeurs().then(data => {
        return commit(types.UPDATE_SAPEURS_LIST, data)
      })
    },
    fetchSapeur({ commit }, payload) {
      SapeurService.getData(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_DATA, data)
      })
    },
    fetchSapeurPermis({ commit }, payload) {
      SapeurService.getPermis(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
      })
    },
    fetchSapeurTelephones({ commit }, payload) {
      SapeurService.getTelephones(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_TELEPHONES, data)
      })
    },
    fetchSapeurGrades({ commit }, payload) {
      SapeurService.getGrades(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_GRADES, data)
      })
    },
    fetchSapeurFonctions({ commit }, payload) {
      SapeurService.getFonctions(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_FONCTIONS, data)
      })
    },
    fetchSapeurCours({ commit }, payload) {
      SapeurService.getCours(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_COURS, data)
      })
    },
    fetchSapeurGroupes({ commit }, payload) {
      SapeurService.getGroupes(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_GROUPES, data)
      })
    },
    saveActiveSapeur({ state }) {
      return SapeurService.saveSapeur(
        state.currentSapeur.data.id,
        state.currentSapeur.data
      ).then(res => {
        if (res.data.error !== undefined) {
          throw new Error(res.data.error)
        }
        return res.data.data
      })
    },
    addPermis({ state, commit }, payload) {
      return SapeurService.addPermis(state.currentSapeur.data.id, payload).then(
        async data => {
          await commit(types.ADD_CURRENT_SAPEUR_PERMIS, data)
          return data
        }
      )
    },
    editPermis({ state, commit }, payload) {
      return SapeurService.editPermis(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.EDIT_CURRENT_SAPEUR_PERMIS, data)
        return data
      })
    },
    removePermis({ state, commit }, payload) {
      return SapeurService.removePermis(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.REMOVE_CURRENT_SAPEUR_PERMIS, payload)
        return data
      })
    }
  }
}

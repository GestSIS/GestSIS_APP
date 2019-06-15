import types from '../mutationTypes'
import SapeurService from '../../services/SapeurService'

export default {
  state: {
    liste: [],
    currentSapeur: {
      id: 0,
      permis: [],
      data: {},
      telephones: [],
      groupes: [],
      grades: [],
      fonctions: [],
      mutations: [],
      cours: []
    }
  },
  getters: {
    listSapeur: state => {
      return state.liste.sort((s1, s2) =>
        (s1.nom + s1.prenom).localeCompare(s2.nom + s2.prenom)
      )
    },
    getSapeur: state => id => {
      return state.liste.filter(s => s.id === id)[0]
    },
    activeSapeur: state => {
      return state.currentSapeur.data
    },
    activeSapeurPermis: state => {
      return state.currentSapeur.permis
    },
    activeSapeurTelephones: state => {
      return state.currentSapeur.telephones
        .slice(0)
        .sort((t1, t2) => t1.priorite - t2.priorite)
    },
    activeSapeurGrades: state => {
      return state.currentSapeur.grades
        .slice(0)
        .sort((g1, g2) => new Date(g1.date) - new Date(g2.date))
    },
    activeSapeurCours: state => {
      return state.currentSapeur.cours
        .slice(0)
        .sort((c1, c2) => new Date(c1.date) - new Date(c2.date))
    },
    activeSapeurFonctions: state => {
      return state.currentSapeur.fonctions
        .slice(0)
        .sort((f1, f2) => new Date(f1.debut) - new Date(f2.debut))
    },
    activeSapeurMutations: state => {
      return state.currentSapeur.mutations
        .slice(0)
        .sort(
          (m1, m2) => new Date(m1.incorporation) - new Date(m2.incorporation)
        )
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
      state.liste = payload
    },
    [types.SELECT_CURRENT_SAPEUR](state, payload) {
      state.currentSapeur.id = payload
    },
    [types.UPDATE_CURRENT_SAPEUR_DATA](state, payload) {
      state.currentSapeur.data = payload
      state.liste = [...state.liste.filter(s => s.id !== payload.id), payload]
    },
    [types.UPDATE_CURRENT_SAPEUR_TELEPHONES](state, payload) {
      state.currentSapeur.telephones = payload
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
    [types.UPDATE_CURRENT_SAPEUR_MUTATIONS](state, payload) {
      state.currentSapeur.mutations = payload
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
    },
    [types.ADD_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.currentSapeur.telephones = [
        ...state.currentSapeur.telephones,
        payload
      ]
    },
    [types.REMOVE_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.currentSapeur.telephones = state.currentSapeur.telephones.filter(
        p => p.id !== payload
      )
    },
    [types.EDIT_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.currentSapeur.telephones = [
        ...state.currentSapeur.telephones.filter(p => p.id !== payload.id),
        payload
      ]
    },

    [types.ADD_CURRENT_SAPEUR_FONCTION](state, payload) {
      state.currentSapeur.fonctions = [
        ...state.currentSapeur.fonctions,
        payload
      ]
    },
    [types.REMOVE_CURRENT_SAPEUR_FONCTION](state, payload) {
      state.currentSapeur.fonctions = state.currentSapeur.fonctions.filter(
        p => p.id !== payload
      )
    },
    [types.EDIT_CURRENT_SAPEUR_FONCTION](state, payload) {
      state.currentSapeur.fonctions = [
        ...state.currentSapeur.fonctions.filter(p => p.id !== payload.id),
        payload
      ]
    },

    [types.ADD_CURRENT_SAPEUR_GRADE](state, payload) {
      state.currentSapeur.grades = [...state.currentSapeur.grades, payload]
    },
    [types.REMOVE_CURRENT_SAPEUR_GRADE](state, payload) {
      state.currentSapeur.grades = state.currentSapeur.grades.filter(
        p => p.id !== payload
      )
    },
    [types.EDIT_CURRENT_SAPEUR_GRADE](state, payload) {
      state.currentSapeur.grades = [
        ...state.currentSapeur.grades.filter(p => p.id !== payload.id),
        payload
      ]
    },

    [types.ADD_CURRENT_SAPEUR_COURS](state, payload) {
      state.currentSapeur.cours = [...state.currentSapeur.cours, payload]
    },
    [types.REMOVE_CURRENT_SAPEUR_COURS](state, payload) {
      state.currentSapeur.cours = state.currentSapeur.cours.filter(
        c => c.id !== payload
      )
    },
    [types.EDIT_CURRENT_SAPEUR_COURS](state, payload) {
      state.currentSapeur.cours = [
        ...state.currentSapeur.cours.filter(c => c.id !== payload.id),
        payload
      ]
    },

    [types.ADD_CURRENT_SAPEUR_MUTATION](state, payload) {
      state.currentSapeur.mutations = [
        ...state.currentSapeur.mutations,
        payload
      ]
    },
    [types.REMOVE_CURRENT_SAPEUR_MUTATION](state, payload) {
      state.currentSapeur.mutations = state.currentSapeur.mutations.filter(
        c => c.id !== payload
      )
    },
    [types.EDIT_CURRENT_SAPEUR_MUTATION](state, payload) {
      state.currentSapeur.mutations = [
        ...state.currentSapeur.mutations.filter(c => c.id !== payload.id),
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
      return SapeurService.getData(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_DATA, data)
      })
    },
    fetchSapeurPermis({ commit }, payload) {
      return SapeurService.getPermis(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
      })
    },
    fetchSapeurTelephones({ commit }, payload) {
      return SapeurService.getTelephones(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_TELEPHONES, data)
      })
    },
    fetchSapeurGrades({ commit }, payload) {
      return SapeurService.getGrades(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_GRADES, data)
      })
    },
    fetchSapeurFonctions({ commit }, payload) {
      return SapeurService.getFonctions(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_FONCTIONS, data)
      })
    },
    fetchSapeurCours({ commit }, payload) {
      return SapeurService.getCours(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_COURS, data)
      })
    },
    fetchSapeurMutations({ commit }, payload) {
      return SapeurService.getMutations(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_MUTATIONS, data)
      })
    },
    fetchSapeurGroupes({ commit }, payload) {
      return SapeurService.getGroupes(payload).then(data => {
        return commit(types.UPDATE_CURRENT_SAPEUR_GROUPES, data)
      })
    },
    saveActiveSapeur({ state }, payload) {
      return SapeurService.saveSapeur(
        state.currentSapeur.data.id,
        payload || state.currentSapeur.data
      )
    },
    addTelephone({ state, commit }, payload) {
      return SapeurService.addTelephone(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.ADD_CURRENT_SAPEUR_TELEPHONE, data)
        return data
      })
    },

    editTelephone({ state, commit }, payload) {
      return SapeurService.editTelephone(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.EDIT_CURRENT_SAPEUR_TELEPHONE, data)
        return data
      })
    },
    removeTelephone({ state, commit }, payload) {
      return SapeurService.removeTelephone(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.REMOVE_CURRENT_SAPEUR_TELEPHONE, payload)
        return data
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
    },

    addFonction({ state, commit }, payload) {
      return SapeurService.addFonction(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.ADD_CURRENT_SAPEUR_FONCTION, data)
        return data
      })
    },
    editFonction({ state, commit }, payload) {
      return SapeurService.editFonction(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.EDIT_CURRENT_SAPEUR_FONCTION, data)
        return data
      })
    },
    removeFonction({ state, commit }, payload) {
      return SapeurService.removeFonction(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.REMOVE_CURRENT_SAPEUR_FONCTION, payload)
        return data
      })
    },

    addGrade({ state, commit }, payload) {
      return SapeurService.addGrade(state.currentSapeur.data.id, payload).then(
        async data => {
          await commit(types.ADD_CURRENT_SAPEUR_GRADE, data)
          return data
        }
      )
    },
    editGrade({ state, commit }, payload) {
      return SapeurService.editGrade(state.currentSapeur.data.id, payload).then(
        async data => {
          await commit(types.EDIT_CURRENT_SAPEUR_GRADE, data)
          return data
        }
      )
    },
    removeGrade({ state, commit }, payload) {
      return SapeurService.removeGrade(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.REMOVE_CURRENT_SAPEUR_GRADE, payload)
        return data
      })
    },

    addCours({ state, commit }, payload) {
      return SapeurService.addCours(state.currentSapeur.data.id, payload).then(
        async data => {
          await commit(types.ADD_CURRENT_SAPEUR_COURS, data)
          return data
        }
      )
    },
    editCours({ state, commit }, payload) {
      return SapeurService.editCours(state.currentSapeur.data.id, payload).then(
        async data => {
          await commit(types.EDIT_CURRENT_SAPEUR_COURS, data)
          return data
        }
      )
    },
    removeCours({ state, commit }, payload) {
      return SapeurService.removeCours(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.REMOVE_CURRENT_SAPEUR_COURS, payload)
        return data
      })
    },

    addMutation({ state, commit }, payload) {
      return SapeurService.addMutation(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.ADD_CURRENT_SAPEUR_MUTATION, data)
        return data
      })
    },
    editMutation({ state, commit }, payload) {
      return SapeurService.editMutation(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.EDIT_CURRENT_SAPEUR_MUTATION, data)
        return data
      })
    },
    removeMutation({ state, commit }, payload) {
      return SapeurService.removeMutation(
        state.currentSapeur.data.id,
        payload
      ).then(async data => {
        await commit(types.REMOVE_CURRENT_SAPEUR_MUTATION, payload)
        return data
      })
    }
  }
}

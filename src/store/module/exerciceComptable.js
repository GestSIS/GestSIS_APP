import types from '../mutationTypes'
import ExerciceComptableService from '../../services/ExerciceComptableService'

export default {
  state: {
    liste: [],
    activeId: null
  },
  mutations: {
    [types.UPDATE_EXERCICE_COMPTABLE_LIST](state, payload) {
      state.liste = payload
      if ((state.activeId || 0) === 0) {
        state.activeId = payload.sort((e1, e2) => e2.annee - e1.annee)[0].id
      }
    },
    [types.SELECT_EXERCICE_COMPTABLE](state, payload) {
      state.activeId = payload
    }
  },
  getters: {
    listExerciceComptable: state => state.liste,
    currentExerciceComptableId: state => state.activeId,
    getExerciceComptable: state => id =>
      state.liste.filter(e => e.id === id)[0],
    exerciceComptableDebut: state => id =>
      state.liste.filter(e => e.id === id)[0].debut,
    exerciceComptableFin: state => id =>
      state.liste.filter(e => e.id === id)[0].fin
  },
  actions: {
    fetchExercicesComptables({ commit }) {
      return ExerciceComptableService.getExercices().then(data =>
        commit(types.UPDATE_EXERCICE_COMPTABLE_LIST, data)
      )
    },
    selectExerciceComptable({ commit }, excuse_type_id) {
      return commit(types.SELECT_EXERCICE_COMPTABLE, excuse_type_id)
    }
  }
}

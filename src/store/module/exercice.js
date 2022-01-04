import types from '../mutationTypes';
import ExerciceService from '../../services/ExerciceService';

export default {
  state: {
    liste: [],
    active: {
      id: 0,
      sapeurs: [],
      data: {},
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.active = {
        id: 0,
        sapeurs: [],
        data: {},
      };
    },
    [types.UPDATE_EXERCICE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((e1, e2) => new Date(e2.date) - new Date(e1.date));
    },
    [types.UPDATE_EXERCICE_STATUT](state, { id, statut }) {
      state.liste = [
        ...state.liste.map((e) => {
          if (e.id !== id) {
            return e;
          } else {
            return {
              ...e,
              statut: statut,
            };
          }
        }),
      ];
      if (state.active.id == id) {
        state.active.data.statut = statut;
      }
    },
    [types.ADD_EXERCICE](state, payload) {
      state.liste = [...state.liste, payload];
    },
    [types.SELECT_CURRENT_EXERCICE](state, payload) {
      state.active.id = payload;
    },
    [types.UPDATE_CURRENT_EXERCICE_DATA](state, payload) {
      state.active.data = payload;
    },
    [types.UPDATE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.active.sapeurs = payload;
    },
    [types.REMOVE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.active.sapeurs = state.active.sapeurs.filter(
        (p) => !payload.includes(p.id)
      );
    },
  },
  getters: {
    activeExerciceId: (state) => state.active.id,
    activeExerciceSapeurs: (state) => state.active.sapeurs,
    activeExerciceData: (state) => state.active.data,
  },
  actions: {
    fetchListeExercice({ getters, commit }) {
      return ExerciceService.getExercices(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_EXERCICE_LISTE, data));
    },
    fetchExercice({ commit }, payload) {
      return ExerciceService.getExercice(payload).then((data) =>
        commit(types.UPDATE_CURRENT_EXERCICE_DATA, data)
      );
    },
    fetchExerciceSapeurs({ commit }, payload) {
      return ExerciceService.getSapeurs(payload).then((data) =>
        commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data)
      );
    },
    selectExercice({ commit }, payload) {
      return commit(types.SELECT_CURRENT_EXERCICE, payload);
    },
    resetActiveExercice({ commit, getters }) {
      commit(types.SELECT_CURRENT_EXERCICE, null);
      commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, []);
      return commit(types.UPDATE_CURRENT_EXERCICE_DATA, {
        id: null,
        localite_id: null,
        exercice_categorie_id: null,
        exercice_comptable_id: getters.currentExerciceComptableId,
        date: null,
        heure: null,
        lieu: '',
        communications: '',
        designation: '',
        duree: null,
        statut: 0,
      });
    },
    createExercice({ state, commit, getters }) {
      return ExerciceService.createExercice({
        ...state.active.data,
        exercice_comptable_id: getters.currentExerciceComptableId,
      }).then(async (data) => {
        await commit(types.ADD_EXERCICE, data);
        await commit(types.SELECT_CURRENT_EXERCICE, data.id);
        await commit(types.UPDATE_CURRENT_EXERCICE_DATA, data);
        return data;
      });
    },
    validerExercice({ commit }, payload) {
      return ExerciceService.validerExercice(payload).then(async (data) => {
        await commit(types.UPDATE_EXERCICE_STATUT, data);
        return data;
      });
    },
    saveActiveExercice({ state, commit }) {
      return ExerciceService.saveExercice(
        state.active.id,
        state.active.data
      ).then(async (data) => {
        await commit(types.UPDATE_CURRENT_EXERCICE_DATA, data);
        return data;
      });
    },

    addSapeurs({ state, commit }, payload) {
      return ExerciceService.addSapeurs(state.active.data.id, {
        sapeurs: payload,
      }).then(async (data) => {
        await commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data.sapeurs);
        await commit(types.UPDATE_EXERCICE_STATUT, {
          id: state.active.data.id,
          statut: data.statut,
        });
        return data;
      });
    },
    editSapeurs({ state, commit }, payload) {
      return ExerciceService.editSapeurs(state.active.data.id, {
        sapeurs: payload,
      }).then(async (data) => {
        await commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data.sapeurs);
        await commit(types.UPDATE_EXERCICE_STATUT, {
          id: state.active.data.id,
          statut: data.statut,
        });
        return data;
      });
    },
    removeSapeurs({ state, commit }, payload) {
      return ExerciceService.removeSapeurs(state.active.data.id, {
        sapeurs: payload,
      }).then(async (data) => {
        await commit(types.REMOVE_CURRENT_EXERCICE_SAPEURS, payload);
        await commit(types.UPDATE_EXERCICE_STATUT, {
          id: state.active.data.id,
          statut: data,
        });
        return data;
      });
    },
  },
};

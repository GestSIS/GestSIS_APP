import types from '../mutationTypes';
import ExerciceService from '../../services/ExerciceService.js';

export default {
  state: {
    liste: [],
    absences: [],
    active: {
      id: 0,
      sapeurs: [],
      data: {},
      sms: [],
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.absences = [];
      state.active = {
        id: 0,
        sapeurs: [],
        data: {},
        sms: [],
      };
    },
    [types.UPDATE_EXERCICE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((e1, e2) => new Date(e2.date) - new Date(e1.date));
    },
    [types.UPDATE_CURRENT_EXERCICE_SMS](state, payload) {
      state.active.sms = payload;
    },
    [types.UPDATE_EXERCICE_ABSENCES](state, payload) {
      state.absences = payload;
    },
    [types.UPDATE_EXERCICE_PRESENCE](state, presence) {
      if (state.active.id == presence.exercice_id) {
        state.active.sapeurs = state.active.sapeurs.map((s) =>
          s.id == presence.id ? presence : s
        );
      }
      state.absences = state.absences.map((s) =>
        s.id == presence.id ? presence : s
      );
    },
    [types.UPDATE_EXERCICE_STATUT](state, { id, statut }) {
      state.liste = state.liste.map((e) => (e.id == id ? { ...e, statut } : e));
      if (state.active.id == id) {
        state.active.data.statut = statut;
      }
    },
    [types.ADD_EXERCICE](state, payload) {
      state.liste = [...state.liste, payload];
    },
    [types.REMOVE_EXERCICE](state, exerciceId) {
      state.liste = state.liste.filter((e) => e.id != exerciceId);
    },
    [types.SELECT_CURRENT_EXERCICE](state, payload) {
      state.active.id = payload;
    },
    [types.UPDATE_CURRENT_EXERCICE_DATA](state, payload) {
      state.active.data = payload;
    },
    [types.ADD_HEURE](state, payload) {
      if (state.active.id == payload.exercice_id) {
        state.active.sapeurs = state.active.sapeurs.map((s) =>
          s.sapeur_id != payload.sapeur_id
            ? s
            : { ...s, heures: [...(s.heures ?? []), payload] }
        );
      }
    },
    [types.UPDATE_HEURE](state, payload) {
      if (state.active.id == payload.exercice_id) {
        state.active.sapeurs = state.active.sapeurs.map((s) =>
          s.sapeur_id != payload.sapeur_id
            ? s
            : {
              ...s,
              heures: (s.heures ?? []).map((h) =>
                h.id == payload.id ? payload : h
              ),
            }
        );
      }
    },
    [types.REMOVE_HEURE](state, payload) {
      if (state.active.id == payload.exercice_id) {
        state.active.sapeurs = state.active.sapeurs.map((s) =>
          s.sapeur_id != payload.sapeur_id
            ? s
            : {
              ...s,
              heures: (s.heures ?? []).filter((h) => h.id != payload.id),
            }
        );
      }
    },
    [types.UPDATE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.active.sapeurs = payload;
    },
    [types.REMOVE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.active.sapeurs = state.active.sapeurs.filter(
        (p) => !payload.includes(p.sapeur_id)
      );
    },
  },
  actions: {
    fetchListeExercice({ commit }, exerciceComptableId) {
      return ExerciceService.getExercices(exerciceComptableId)
        .then((data) => commit(types.UPDATE_EXERCICE_LISTE, data));
    },
    fetchExerciceAbsences({ commit }, exerciceComptableId) {
      return ExerciceService.getAbsences(exerciceComptableId)
        .then((data) => commit(types.UPDATE_EXERCICE_ABSENCES, data));
    },
    fetchExercice({ commit }, exerciceId) {
      return ExerciceService.getExercice(exerciceId)
        .then((data) => commit(types.UPDATE_CURRENT_EXERCICE_DATA, data));
    },
    fetchExerciceSms({ commit }, exerciceId) {
      return ExerciceService.getSms(exerciceId)
        .then((data) => commit(types.UPDATE_CURRENT_EXERCICE_SMS, data));
    },
    fetchExerciceSapeurs({ commit }, exerciceId) {
      return ExerciceService.getSapeurs(exerciceId)
        .then((data) => commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data));
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
        exercice_comptable_id: getters.activeExerciceComptableId,
        date: null,
        heure: null,
        lieu: '',
        communications: '',
        designation: '',
        duree: null,
        statut: 0,
      });
    },
    createExercice({ commit, getters }, exercice) {
      return ExerciceService.createExercice({
        ...exercice,
        exercice_comptable_id: getters.activeExerciceComptableId,
      }).then(async (data) => {
        await commit(types.ADD_EXERCICE, data);
        await commit(types.SELECT_CURRENT_EXERCICE, data.id);
        await commit(types.UPDATE_CURRENT_EXERCICE_DATA, data);
        return data;
      });
    },
    validerExercice({ commit }, exerciceId) {
      return ExerciceService.validerExercice(exerciceId)
        .then(async (data) => {
          await commit(types.UPDATE_EXERCICE_STATUT, {
            id: exerciceId,
            statut: data?.statut,
          });
          return data;
        });
    },
    annulerExercice({ commit }, exerciceId) {
      return ExerciceService.cancelExercice(exerciceId).then(async (data) => {
        await commit(types.UPDATE_EXERCICE_STATUT, {
          id: exerciceId,
          statut: data?.statut,
        });
        return data;
      });
    },
    reactiverExercice({ commit }, exerciceId) {
      return ExerciceService.reactivateExercice(exerciceId)
        .then(async (data) => {
          await commit(types.UPDATE_EXERCICE_STATUT, {
            id: exerciceId,
            statut: data?.statut,
          });
          return data;
        });
    },
    removeExercice({ commit }, exerciceId) {
      return ExerciceService.deleteExercice(exerciceId).then(() => {
        commit(types.REMOVE_EXERCICE, exerciceId);
      });
    },
    saveExercice({ commit }, exercice) {
      return ExerciceService.saveExercice(exercice.id, exercice)
        .then(async (data) => {
          await commit(types.UPDATE_CURRENT_EXERCICE_DATA, data);
          return data;
        }
        );
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
    addHeure({ commit }, heure) {
      return ExerciceService.addHeure(heure).then(async (data) => {
        await commit(types.ADD_HEURE, data);
        return data;
      });
    },
    editHeure({ commit }, heure) {
      return ExerciceService.editHeure(heure).then(async (data) => {
        await commit(types.UPDATE_HEURE, data);
        return data;
      });
    },
    removeHeure({ commit }, heure) {
      return ExerciceService.removeHeure(heure.id).then(async (data) => {
        await commit(types.REMOVE_HEURE, heure);
        return data;
      });
    },
    editPresenceExercice({ commit }, { presenceId, presence }) {
      return ExerciceService.editPresence(presenceId, presence).then(
        async ({ statut, sapeur }) => {
          await commit(types.UPDATE_EXERCICE_PRESENCE, sapeur);
          await commit(types.UPDATE_EXERCICE_STATUT, {
            id: sapeur.exercice_id,
            statut,
          });
          return sapeur;
        }
      );
    },
    removeExcuse({ commit }, presence) {
      return ExerciceService.removeExcuse(
        presence.exercice_id,
        presence.sapeur_id
      ).then(async (data) => {
        await commit(types.UPDATE_EXERCICE_PRESENCE, data);
        return data;
      });
    },
  },
};

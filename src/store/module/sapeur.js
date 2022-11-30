import types from '../mutationTypes';
import SapeurService from '../../services/SapeurService.js';
import ExerciceService from '../../services/ExerciceService';

export default {
  state: {
    liste: [],
    active: {
      id: 0,
      data: {},
      cours: [],
      permis: [],
      grades: [],
      groupes: [],
      fonctions: [],
      mutations: [],
      exercices: [],
      controles: [],
      telephones: [],
      materiels: [],
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.active = {
        id: 0,
        data: {},
        cours: [],
        permis: [],
        grades: [],
        groupes: [],
        fonctions: [],
        mutations: [],
        exercices: [],
        controles: [],
        telephones: [],
        materiels: [],
      };
    },
    [types.UPDATE_SAPEURS_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .map((s) => ({ ...s, nom_prenom: `${s.nom} ${s.prenom}` }))
        .sort((s1, s2) => s1.nom_prenom.localeCompare(s2.nom_prenom));
    },
    [types.SELECT_CURRENT_SAPEUR](state, sapeurId) {
      state.active.id = sapeurId;
    },
    [types.CREATE_SAPEUR](state, payload) {
      state.liste = [
        ...state.liste,
        { ...payload, nom_prenom: `${payload.nom} ${payload.prenom}` },
      ].sort((s1, s2) => s1.nom_prenom.localeCompare(s2.nom_prenom));
    },
    [types.UPDATE_CURRENT_SAPEUR_DATA](state, payload) {
      state.active.data = payload;
      state.liste.map((s) =>
        s.id == payload.id
          ? {
            ...s,
            fonction_id: payload.fonction_id,
            nom: payload.nom,
            prenom: payload.prenom,
            nom_prenom: `${payload.nom} ${payload.prenom}`,
            actif: payload.actif,
            date_naissance: payload.date_naissance,
          } : s
      );
    },
    [types.UPDATE_CURRENT_SAPEUR_TELEPHONES](state, payload) {
      state.active.telephones = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_GRADES](state, payload) {
      state.active.grades = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_GROUPES](state, payload) {
      state.active.groupes = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_COURS](state, payload) {
      state.active.cours = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_FONCTIONS](state, payload) {
      state.active.fonctions = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_MUTATIONS](state, payload) {
      state.active.mutations = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_CONTROLES_MEDICAUX](state, payload) {
      state.active.controles = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_EXERCICES](state, payload) {
      state.active.exercices = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_MATERIELS](state, payload) {
      state.active.materiels = payload;
    },
    [types.ADD_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = [...state.active.permis, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = state.active.permis.filter((p) => p.id !== payload);
    },
    [types.EDIT_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = [
        ...state.active.permis.filter((p) => p.id !== payload.id),
        payload,
      ];
    },
    [types.ADD_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.active.telephones = [...state.active.telephones, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.active.telephones = state.active.telephones.filter(
        (p) => p.id !== payload
      );
    },
    [types.EDIT_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.active.telephones = [
        ...state.active.telephones.filter((p) => p.id !== payload.id),
        payload,
      ];
    },

    [types.ADD_CURRENT_SAPEUR_FONCTION](state, { fonction, main_fonction_id }) {
      state.active.fonctions = [...state.active.fonctions, fonction];
      state.active.data.fonction_id = main_fonction_id;
    },
    [types.EDIT_CURRENT_SAPEUR_FONCTION](
      state,
      { fonction, main_fonction_id }
    ) {
      state.active.fonctions = [
        ...state.active.fonctions.filter((p) => p.id !== fonction.id),
        fonction,
      ];
      state.active.data.fonction_id = main_fonction_id;
    },
    [types.REMOVE_CURRENT_SAPEUR_FONCTION](state, { id, main_fonction_id }) {
      state.active.fonctions = state.active.fonctions.filter(
        (p) => p.id !== id
      );
      state.active.data.fonction_id = main_fonction_id;
    },

    [types.ADD_CURRENT_SAPEUR_GRADE](state, { grade, main_grade_id }) {
      state.active.grades = [...state.active.grades, grade];
      state.active.data.grade_id = main_grade_id;
    },
    [types.EDIT_CURRENT_SAPEUR_GRADE](state, { grade, main_grade_id }) {
      state.active.grades = [
        ...state.active.grades.filter((p) => p.id !== grade.id),
        grade,
      ];
      state.active.data.grade_id = main_grade_id;
    },
    [types.REMOVE_CURRENT_SAPEUR_GRADE](state, { id, main_grade_id }) {
      state.active.grades = state.active.grades.filter((p) => p.id !== id);
      state.active.data.grade_id = main_grade_id;
    },

    [types.ADD_CURRENT_SAPEUR_COURS](
      state,
      { cours, main_fonction_id, main_grade_id }
    ) {
      state.active.cours = [...state.active.cours, cours];
      state.active.data.fonction_id = main_fonction_id;
      state.active.data.grade_id = main_grade_id;
    },
    [types.EDIT_CURRENT_SAPEUR_COURS](state, payload) {
      state.active.cours = [
        ...state.active.cours.filter((c) => c.id !== payload.id),
        payload,
      ];
    },
    [types.REMOVE_CURRENT_SAPEUR_COURS](state, payload) {
      state.active.cours = state.active.cours.filter((c) => c.id !== payload);
    },

    [types.ADD_CURRENT_SAPEUR_MUTATION](
      state,
      { mutation, actif, annee_incorporation }
    ) {
      state.active.mutations = [...state.active.mutations, mutation];
      state.liste = state.liste.map((s) => {
        if (s.id === mutation.sapeur_id) {
          return { ...s, actif, annee_incorporation };
        }
        return s;
      });
    },
    [types.EDIT_CURRENT_SAPEUR_MUTATION](
      state,
      { mutation, actif, annee_incorporation }
    ) {
      state.active.mutations = [
        ...state.active.mutations.filter((c) => c.id !== mutation.id),
        mutation,
      ];
      state.liste = state.liste.map((s) => {
        if (s.id == mutation.sapeur_id) {
          return { ...s, actif, annee_incorporation };
        }
        return s;
      });
    },
    [types.REMOVE_CURRENT_SAPEUR_MUTATION](
      state,
      { sapeurId, actif, annee_incorporation }
    ) {
      state.active.mutations = state.active.mutations.filter(
        (c) => c.id !== sapeurId
      );
      state.liste = state.liste.map((s) => {
        if (s.id == sapeurId) {
          return { ...s, actif, annee_incorporation };
        }
        return s;
      });
    },
  },
  getters: {
    activeSapeurPermis: (state) => state.active.permis,
    activeSapeurTelephones: (state) =>
      state.active.telephones
        .slice(0)
        .sort((t1, t2) => t1.priorite - t2.priorite),
    activeSapeurGrades: (state) =>
      state.active.grades
        .slice(0)
        .sort((g1, g2) => new Date(g1.date) - new Date(g2.date)),
    activeSapeurCours: (state) =>
      state.active.cours
        .slice(0)
        .sort((c1, c2) => new Date(c1.date) - new Date(c2.date)),
    activeSapeurFonctions: (state) =>
      state.active.fonctions
        .slice(0)
        .sort((f1, f2) => new Date(f1.debut) - new Date(f2.debut)),
    activeSapeurMutations: (state) =>
      state.active.mutations
        .slice(0)
        .sort(
          (m1, m2) => new Date(m1.incorporation) - new Date(m2.incorporation)
        ),
    activeSapeurGroupes: (state) => state.active.groupes,
  },
  actions: {
    selectSapeur({ commit }, payload) {
      return commit(types.SELECT_CURRENT_SAPEUR, payload);
    },
    fetchListeSapeur({ commit }) {
      return SapeurService.getSapeurs().then((data) =>
        commit(types.UPDATE_SAPEURS_LISTE, data)
      );
    },
    fetchSapeur({ commit }, sapeurId) {
      return SapeurService.getData(sapeurId).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_DATA, data)
      );
    },
    fetchSapeurPermis({ commit, state }) {
      return SapeurService.getPermis(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
      );
    },
    fetchSapeurTelephones({ commit, state }) {
      return SapeurService.getTelephones(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_TELEPHONES, data)
      );
    },
    fetchSapeurMateriels({ commit, state }) {
      return SapeurService.getMateriels(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_MATERIELS, data)
      );
    },
    fetchSapeurGrades({ commit, state }) {
      return SapeurService.getGrades(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_GRADES, data)
      );
    },
    fetchSapeurFonctions({ commit, state }) {
      return SapeurService.getFonctions(state.active.id).then((data) => {
        commit(types.UPDATE_CURRENT_SAPEUR_FONCTIONS, data);
        return data;
      });
    },
    fetchSapeurCours({ commit, state }) {
      return SapeurService.getCours(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_COURS, data)
      );
    },
    fetchSapeurControlesMedicaux({ commit, state }) {
      return SapeurService.getControlesMedicaux(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_CONTROLES_MEDICAUX, data)
      );
    },
    fetchSapeurMutations({ commit, state }) {
      return SapeurService.getMutations(state.active.id).then((data) =>
        commit(types.UPDATE_CURRENT_SAPEUR_MUTATIONS, data)
      );
    },
    fetchSapeurGroupes({ commit, state }) {
      return SapeurService.getGroupes(state.active.id).then((data) => {
        commit(types.UPDATE_CURRENT_SAPEUR_GROUPES, data);
        return data;
      });
    },
    fetchSapeurExercices({ commit, getters, state }) {
      return SapeurService.getExercices(
        state.active.id,
        getters.currentExerciceComptableId
      ).then((data) => {
        commit(types.UPDATE_CURRENT_SAPEUR_EXERCICES, data);
        return data;
      });
    },
    createSapeur({ commit }, payload) {
      return SapeurService.createSapeur(payload).then((data) => {
        commit(types.CREATE_SAPEUR, data);
        return data;
      });
    },
    saveActiveSapeur({ state, commit }, payload) {
      return SapeurService.saveSapeur(
        state.active.data.id,
        payload || state.active.data
      ).then((data) => {
        commit(types.UPDATE_CURRENT_SAPEUR_DATA, data);
        return data;
      });
    },
    saveNonSapeurStatut({ state, commit }, payload) {
      return SapeurService.saveNonSapeurStatut(
        state.active.data.id,
        payload || state.active.data
      ).then((data) => {
        commit(types.UPDATE_CURRENT_SAPEUR_DATA, data);
        return data;
      });
    },

    addTelephoneSapeur({ state, commit }, telephone) {
      return SapeurService.addTelephone(state.active.id, telephone).then(
        (data) => {
          commit(types.ADD_CURRENT_SAPEUR_TELEPHONE, data);
          return data;
        }
      );
    },
    editTelephoneSapeur({ state, commit }, telephone) {
      return SapeurService.editTelephone(state.active.id, telephone).then(
        (data) => {
          commit(types.EDIT_CURRENT_SAPEUR_TELEPHONE, data);
          return data;
        }
      );
    },
    removeTelephoneSapeur({ state, commit }, telephoneId) {
      return SapeurService.removeTelephone(state.active.id, telephoneId).then(
        (data) =>
          commit(types.REMOVE_CURRENT_SAPEUR_TELEPHONE, telephoneId).then(
            () => data
          )
      );
    },

    addPermis({ state, commit }, payload) {
      return SapeurService.addPermis(state.active.id, payload).then((data) => {
        commit(types.ADD_CURRENT_SAPEUR_PERMIS, data);
        return data;
      });
    },
    editPermis({ state, commit }, payload) {
      return SapeurService.editPermis(state.active.id, payload).then((data) => {
        commit(types.EDIT_CURRENT_SAPEUR_PERMIS, data);
        return data;
      });
    },
    removePermis({ state, commit }, payload) {
      return SapeurService.removePermis(state.active.id, payload).then(
        (data) => {
          commit(types.REMOVE_CURRENT_SAPEUR_PERMIS, payload);
          return data;
        }
      );
    },

    addSapeurFonction({ state, commit }, payload) {
      return SapeurService.addFonction(state.active.id, payload).then(
        (data) => {
          commit(types.ADD_CURRENT_SAPEUR_FONCTION, data);
          return data;
        }
      );
    },
    editSapeurFonction({ state, commit }, payload) {
      return SapeurService.editFonction(state.active.id, payload).then(
        (data) => {
          commit(types.EDIT_CURRENT_SAPEUR_FONCTION, data);
          return data;
        }
      );
    },
    removeSapeurFonction({ state, commit }, fonctionId) {
      return SapeurService.removeFonction(state.active.id, fonctionId).then(
        (data) => {
          commit(types.REMOVE_CURRENT_SAPEUR_FONCTION, {
            id: fonctionId,
            main_fonction_id: data.main_fonction_id,
          });
          return data;
        }
      );
    },

    addSapeurGrade({ state, commit }, payload) {
      return SapeurService.addGrade(state.active.data.id, payload).then(
        (data) => {
          commit(types.ADD_CURRENT_SAPEUR_GRADE, data);
          return data;
        }
      );
    },
    editSapeurGrade({ state, commit }, payload) {
      return SapeurService.editGrade(state.active.data.id, payload).then(
        (data) => {
          commit(types.EDIT_CURRENT_SAPEUR_GRADE, data);
          return data;
        }
      );
    },
    removeSapeurGrade({ state, commit }, gradeId) {
      return SapeurService.removeGrade(state.active.data.id, gradeId).then(
        (data) => {
          commit(types.REMOVE_CURRENT_SAPEUR_GRADE, {
            id: gradeId,
            main_grade_id: data.main_grade_id,
          });
          return data;
        }
      );
    },

    addSapeurCours({ state, commit }, payload) {
      return SapeurService.addCours(state.active.data.id, payload).then(
        (data) => {
          commit(types.ADD_CURRENT_SAPEUR_COURS, data);
          return data;
        }
      );
    },
    editSapeurCours({ state, commit }, payload) {
      return SapeurService.editCours(state.active.data.id, payload).then(
        (data) => {
          commit(types.EDIT_CURRENT_SAPEUR_COURS, data);
          return data;
        }
      );
    },
    removeSapeurCours({ state, commit }, payload) {
      return SapeurService.removeCours(state.active.data.id, payload).then(
        (data) => {
          commit(types.REMOVE_CURRENT_SAPEUR_COURS, payload);
          return data;
        }
      );
    },

    addMutation({ state, commit }, payload) {
      return SapeurService.addMutation(state.active.data.id, payload).then(
        (data) => {
          commit(types.ADD_CURRENT_SAPEUR_MUTATION, data);
          return data;
        }
      );
    },
    editMutation({ state, commit }, payload) {
      return SapeurService.editMutation(state.active.data.id, payload).then(
        (data) => {
          commit(types.EDIT_CURRENT_SAPEUR_MUTATION, data);
          return data;
        }
      );
    },
    removeMutation({ state, commit }, mutationId) {
      return SapeurService.removeMutation(
        state.active.data.id,
        mutationId
      ).then((data) => {
        commit(types.REMOVE_CURRENT_SAPEUR_MUTATION, {
          sapeurId: state.active.data.id,
          actif: data.actif,
        });
        return data;
      });
    },

    finFonctions({ state, commit }, payload) {
      return SapeurService.finFonctions(
        state.active.data.id,
        payload.fin,
        payload.ids
      ).then((data) => {
        commit(types.UPDATE_CURRENT_SAPEUR_FONCTIONS, data);
        return data;
      });
    },

    quitterGroupes({ state, commit }, payload) {
      return SapeurService.quitterGroupes(state.active.data.id, payload).then(
        (data) => {
          commit(types.UPDATE_CURRENT_SAPEUR_GROUPES, payload);
          return data;
        }
      );
    },

    supprimerConvocation({ state }, payload) {
      return SapeurService.supprimerConvocation(state.active.data.id, payload);
    },

    updateSapeurPresencesExercice({ dispatch }, payload) {
      return ExerciceService.updatePresences(payload).then(() => {
        return dispatch('fetchSapeurExercices');
      });
    },
  },
};

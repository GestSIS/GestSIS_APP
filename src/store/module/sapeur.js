import types from '../mutationTypes';
import SapeurService from '../../services/SapeurService';

export default {
  state: {
    liste: [],
    active: {
      id: 0,
      permis: [],
      data: {},
      telephones: [],
      groupes: [],
      grades: [],
      fonctions: [],
      mutations: [],
      cours: [],
      exercices: []
    }
  },
  mutations: {
    [types.UPDATE_SAPEURS_LIST](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((s1, s2) =>
          (s1.nom + s1.prenom).localeCompare(s2.nom + s2.prenom)
        );
    },
    [types.SELECT_CURRENT_SAPEUR](state, payload) {
      state.active.id = payload;
    },
    [types.UPDATE_CURRENT_SAPEUR_DATA](state, payload) {
      state.active.data = payload;
      let index = state.liste.map(s => s.id).indexOf(payload.id);
      state.liste = [
        ...state.liste.slice(0, index),
        {
          ...state.liste[index],
          fonction_id: payload.fonction_id,
          nom: payload.nom,
          prenom: payload.prenom,
          actif: payload.actif
        },
        ...state.liste.slice(index + 1)
      ];
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
    [types.UPDATE_CURRENT_SAPEUR_EXERCICES](state, payload) {
      state.active.exercices = payload;
    },
    [types.ADD_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = [...state.active.permis, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = state.active.permis.filter(p => p.id !== payload);
    },
    [types.EDIT_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.active.permis = [
        ...state.active.permis.filter(p => p.id !== payload.id),
        payload
      ];
    },
    [types.ADD_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.active.telephones = [...state.active.telephones, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.active.telephones = state.active.telephones.filter(
        p => p.id !== payload
      );
    },
    [types.EDIT_CURRENT_SAPEUR_TELEPHONE](state, payload) {
      state.active.telephones = [
        ...state.active.telephones.filter(p => p.id !== payload.id),
        payload
      ];
    },

    [types.ADD_CURRENT_SAPEUR_FONCTION](state, payload) {
      state.active.fonctions = [...state.active.fonctions, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_FONCTION](state, payload) {
      state.active.fonctions = state.active.fonctions.filter(
        p => p.id !== payload
      );
    },
    [types.EDIT_CURRENT_SAPEUR_FONCTION](state, payload) {
      state.active.fonctions = [
        ...state.active.fonctions.filter(p => p.id !== payload.id),
        payload
      ];
    },

    [types.ADD_CURRENT_SAPEUR_GRADE](state, payload) {
      state.active.grades = [...state.active.grades, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_GRADE](state, payload) {
      state.active.grades = state.active.grades.filter(p => p.id !== payload);
    },
    [types.EDIT_CURRENT_SAPEUR_GRADE](state, payload) {
      state.active.grades = [
        ...state.active.grades.filter(p => p.id !== payload.id),
        payload
      ];
    },

    [types.ADD_CURRENT_SAPEUR_COURS](state, payload) {
      state.active.cours = [...state.active.cours, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_COURS](state, payload) {
      state.active.cours = state.active.cours.filter(c => c.id !== payload);
    },
    [types.EDIT_CURRENT_SAPEUR_COURS](state, payload) {
      state.active.cours = [
        ...state.active.cours.filter(c => c.id !== payload.id),
        payload
      ];
    },

    [types.ADD_CURRENT_SAPEUR_MUTATION](state, payload) {
      state.active.mutations = [...state.active.mutations, payload];
    },
    [types.REMOVE_CURRENT_SAPEUR_MUTATION](state, payload) {
      state.active.mutations = state.active.mutations.filter(
        c => c.id !== payload
      );
    },
    [types.EDIT_CURRENT_SAPEUR_MUTATION](state, payload) {
      state.active.mutations = [
        ...state.active.mutations.filter(c => c.id !== payload.id),
        payload
      ];
    }
  },
  getters: {
    getSapeur: state => id => state.liste.filter(s => s.id === id)[0],
    activeSapeur: state => state.active.data,
    activeSapeurPermis: state => state.active.permis,
    activeSapeurTelephones: state =>
      state.active.telephones
        .slice(0)
        .sort((t1, t2) => t1.priorite - t2.priorite),
    activeSapeurGrades: state =>
      state.active.grades
        .slice(0)
        .sort((g1, g2) => new Date(g1.date) - new Date(g2.date)),
    activeSapeurCours: state =>
      state.active.cours
        .slice(0)
        .sort((c1, c2) => new Date(c1.date) - new Date(c2.date)),
    activeSapeurFonctions: state =>
      state.active.fonctions
        .slice(0)
        .sort((f1, f2) => new Date(f1.debut) - new Date(f2.debut)),
    activeSapeurMutations: state =>
      state.active.mutations
        .slice(0)
        .sort(
          (m1, m2) => new Date(m1.incorporation) - new Date(m2.incorporation)
        ),
    activeSapeurGroupes: state => state.active.groupes,
    activeSapeurId: state => state.active.id || 0
  },
  actions: {
    selectSapeur({ commit }, payload) {
      return commit(types.SELECT_CURRENT_SAPEUR, payload);
    },
    fetchListSapeur({ commit }) {
      return SapeurService.getSapeurs().then(data =>
        commit(types.UPDATE_SAPEURS_LIST, data)
      );
    },
    fetchSapeur({ commit }, sapeurId) {
      return SapeurService.getData(sapeurId).then(data =>
        commit(types.UPDATE_CURRENT_SAPEUR_DATA, data)
      );
    },
    fetchSapeurPermis({ commit, state }) {
      return SapeurService.getPermis(state.active.id).then(data =>
        commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
      );
    },
    fetchSapeurTelephones({ commit, state }) {
      return SapeurService.getTelephones(state.active.id).then(data =>
        commit(types.UPDATE_CURRENT_SAPEUR_TELEPHONES, data)
      );
    },
    fetchSapeurGrades({ commit, state }) {
      return SapeurService.getGrades(state.active.id).then(data =>
        commit(types.UPDATE_CURRENT_SAPEUR_GRADES, data)
      );
    },
    fetchSapeurFonctions({ commit, state }) {
      return SapeurService.getFonctions(state.active.id).then(data => {
        commit(types.UPDATE_CURRENT_SAPEUR_FONCTIONS, data);
        return data;
      });
    },
    fetchSapeurCours({ commit, state }) {
      return SapeurService.getCours(state.active.id).then(data =>
        commit(types.UPDATE_CURRENT_SAPEUR_COURS, data)
      );
    },
    fetchSapeurMutations({ commit, state }) {
      return SapeurService.getMutations(state.active.id).then(data =>
        commit(types.UPDATE_CURRENT_SAPEUR_MUTATIONS, data)
      );
    },
    fetchSapeurGroupes({ commit, state }) {
      return SapeurService.getGroupes(state.active.id).then(data => {
        commit(types.UPDATE_CURRENT_SAPEUR_GROUPES, data);
        return data;
      });
    },
    fetchSapeurExercices({ commit, getters, state }) {
      return SapeurService.getExercices(
        state.active.id,
        getters.currentExerciceComptableId
      ).then(data => {
        commit(types.UPDATE_CURRENT_SAPEUR_EXERCICES, data);
        return data;
      });
    },
    saveActiveSapeur({ state }, payload) {
      return SapeurService.saveSapeur(
        state.active.data.id,
        payload || state.active.data
      );
    },

    addTelephone({ state, commit }, telephone) {
      return SapeurService.addTelephone(state.active.id, telephone).then(
        data => {
          commit(types.ADD_CURRENT_SAPEUR_TELEPHONE, data);
          return data;
        }
      );
    },

    editTelephone({ state, commit }, telephone) {
      return SapeurService.editTelephone(state.active.id, telephone).then(
        data => {
          commit(types.EDIT_CURRENT_SAPEUR_TELEPHONE, data);
          return data;
        }
      );
    },
    removeTelephone({ state, commit }, telephoneId) {
      return SapeurService.removeTelephone(state.active.id, telephoneId).then(
        data =>
          commit(types.REMOVE_CURRENT_SAPEUR_TELEPHONE, telephoneId).then(
            () => data
          )
      );
    },

    addPermis({ state, commit }, payload) {
      return SapeurService.addPermis(state.active.id, payload).then(data => {
        commit(types.ADD_CURRENT_SAPEUR_PERMIS, data);
        return data;
      });
    },
    editPermis({ state, commit }, payload) {
      return SapeurService.editPermis(state.active.id, payload).then(data => {
        commit(types.EDIT_CURRENT_SAPEUR_PERMIS, data);
        return data;
      });
    },
    removePermis({ state, commit }, payload) {
      return SapeurService.removePermis(state.active.id, payload).then(data => {
        commit(types.REMOVE_CURRENT_SAPEUR_PERMIS, payload);
        return data;
      });
    },

    addFonction({ state, commit }, payload) {
      return SapeurService.addFonction(state.active.id, payload).then(data => {
        commit(types.ADD_CURRENT_SAPEUR_FONCTION, data);
        return data;
      });
    },
    editFonction({ state, commit }, payload) {
      return SapeurService.editFonction(state.active.id, payload).then(data => {
        commit(types.EDIT_CURRENT_SAPEUR_FONCTION, data);
        return data;
      });
    },
    removeFonction({ state, commit }, payload) {
      return SapeurService.removeFonction(state.active.id, payload).then(
        data => {
          commit(types.REMOVE_CURRENT_SAPEUR_FONCTION, payload);
          return data;
        }
      );
    },

    addGrade({ state, commit }, payload) {
      return SapeurService.addGrade(state.active.data.id, payload).then(
        data => {
          commit(types.ADD_CURRENT_SAPEUR_GRADE, data);
          return data;
        }
      );
    },
    editGrade({ state, commit }, payload) {
      return SapeurService.editGrade(state.active.data.id, payload).then(
        data => {
          commit(types.EDIT_CURRENT_SAPEUR_GRADE, data);
          return data;
        }
      );
    },
    removeGrade({ state, commit }, payload) {
      return SapeurService.removeGrade(state.active.data.id, payload).then(
        data => {
          commit(types.REMOVE_CURRENT_SAPEUR_GRADE, payload);
          return data;
        }
      );
    },

    addCours({ state, commit }, payload) {
      return SapeurService.addCours(state.active.data.id, payload).then(
        data => {
          commit(types.ADD_CURRENT_SAPEUR_COURS, data);
          return data;
        }
      );
    },
    editCours({ state, commit }, payload) {
      return SapeurService.editCours(state.active.data.id, payload).then(
        data => {
          commit(types.EDIT_CURRENT_SAPEUR_COURS, data);
          return data;
        }
      );
    },
    removeCours({ state, commit }, payload) {
      return SapeurService.removeCours(state.active.data.id, payload).then(
        data => {
          commit(types.REMOVE_CURRENT_SAPEUR_COURS, payload);
          return data;
        }
      );
    },

    addMutation({ state, commit }, payload) {
      return SapeurService.addMutation(state.active.data.id, payload).then(
        data => {
          commit(types.ADD_CURRENT_SAPEUR_MUTATION, data);
          return data;
        }
      );
    },
    editMutation({ state, commit }, payload) {
      return SapeurService.editMutation(state.active.data.id, payload).then(
        data => {
          commit(types.EDIT_CURRENT_SAPEUR_MUTATION, data);
          return data;
        }
      );
    },
    removeMutation({ state, commit }, payload) {
      return SapeurService.removeMutation(state.active.data.id, payload).then(
        data => {
          commit(types.REMOVE_CURRENT_SAPEUR_MUTATION, payload);
          return data;
        }
      );
    },

    finFonctions({ state, commit }, payload) {
      return SapeurService.finFonctions(
        state.active.data.id,
        payload.fin,
        payload.ids
      ).then(data => {
        commit(types.UPDATE_CURRENT_SAPEUR_FONCTIONS, data);
        return data;
      });
    },

    quitterGroupes({ state, commit }, payload) {
      return SapeurService.quitterGroupes(state.active.data.id, payload).then(
        data => {
          commit(types.UPDATE_CURRENT_SAPEUR_GROUPES, payload);
          return data;
        }
      );
    },

    supprimerConvocation({ state }, payload) {
      return SapeurService.supprimerConvocation(state.active.data.id, payload);
    }
  }
};

import Api from '@/http/Request';

export default {
  getSapeurs() {
    return Api.api().get('/sapeurs/');
  },
  getData(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId);
  },
  getPermis(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/permis');
  },
  getTelephones(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/telephones');
  },
  getGroupes(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/groupes');
  },
  getGrades(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/grades');
  },
  getFonctions(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/fonctions');
  },
  getCours(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/cours');
  },
  getMutations(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/mutations');
  },
  getExercices(sapeurId, exerciceComptableId) {
    return Api.api().get(
      '/sapeurs/' + sapeurId + '/exercices/' + exerciceComptableId
    );
  },
  saveSapeur(sapeurId, sapeurData) {
    return Api.api().put('/sapeurs/' + sapeurId, sapeurData, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  //Téléphones
  addTelephone(sapeurId, telephoneData) {
    return Api.api().post(
      '/sapeurs/' + sapeurId + '/telephones/',
      telephoneData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  editTelephone(sapeurId, telephoneData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/telephones/' + telephoneData.id,
      telephoneData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  removeTelephone(sapeurId, telephoneId) {
    return Api.api().delete(
      '/sapeurs/' + sapeurId + '/telephones/' + telephoneId
    );
  },

  //Permis
  addPermis(sapeurId, permisData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/permis/', permisData, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  editPermis(sapeurId, permisData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/permis/' + permisData.id,
      permisData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  removePermis(sapeurId, permisId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/permis/' + permisId);
  },

  //Fonctions
  addFonction(sapeurId, fonctionData) {
    return Api.api().post(
      '/sapeurs/' + sapeurId + '/fonctions/',
      fonctionData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  editFonction(sapeurId, fonctionData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/fonctions/' + fonctionData.id,
      fonctionData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  removeFonction(sapeurId, fonctionId) {
    return Api.api().delete(
      '/sapeurs/' + sapeurId + '/fonctions/' + fonctionId
    );
  },

  //Grades
  addGrade(sapeurId, gradeData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/grades/', gradeData, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  editGrade(sapeurId, gradeData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/grades/' + gradeData.id,
      gradeData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  removeGrade(sapeurId, gradeId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/grades/' + gradeId);
  },

  //Cours
  addCours(sapeurId, coursData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/cours/', coursData, {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  editCours(sapeurId, coursData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/cours/' + coursData.id,
      coursData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  removeCours(sapeurId, coursId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/cours/' + coursId);
  },

  //Mutations
  addMutation(sapeurId, mutationData) {
    return Api.api().post(
      '/sapeurs/' + sapeurId + '/mutations/',
      mutationData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  editMutation(sapeurId, mutationData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/mutations/' + mutationData.id,
      mutationData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  },
  removeMutation(sapeurId, mutationId) {
    return Api.api().delete(
      '/sapeurs/' + sapeurId + '/mutations/' + mutationId
    );
  }
};

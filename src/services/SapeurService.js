import Api from '@/http/Request';

export default {
  getSapeurs() {
    return Api.api().get('/sapeurs');
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
  createSapeur(sapeurData) {
    return Api.api().post('/sapeurs', sapeurData);
  },
  saveSapeur(sapeurId, sapeurData) {
    return Api.api().put('/sapeurs/' + sapeurId, sapeurData);
  },
  fetchPhoto(sapeurId) {
    return Api.api().get('/sapeurs/' + sapeurId + '/photo',
      {
        responseType : 'blob'
      }
    ).then(data=>{
      if(data?.type == 'application/json'){
        return null;
      } else {
        return URL.createObjectURL(data);
      }
    });
  },
  updatePhoto(sapeurId, photo) {
    const formData = new FormData();
    formData.append('image', photo);

    return Api.api().post('/sapeurs/' + sapeurId + '/photo', formData,
    {
      headers: {
          'Content-Type': 'multipart/form-data'
      }
    });
  },
  deletePhoto(sapeurId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/photo');
  },

  //Téléphones
  addTelephone(sapeurId, telephoneData) {
    return Api.api().post(
      '/sapeurs/' + sapeurId + '/telephones',
      telephoneData
    );
  },
  editTelephone(sapeurId, telephoneData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/telephones/' + telephoneData.id,
      telephoneData
    );
  },
  removeTelephone(sapeurId, telephoneId) {
    return Api.api().delete(
      '/sapeurs/' + sapeurId + '/telephones/' + telephoneId
    );
  },

  //Permis
  addPermis(sapeurId, permisData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/permis', permisData);
  },
  editPermis(sapeurId, permisData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/permis/' + permisData.id,
      permisData
    );
  },
  removePermis(sapeurId, permisId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/permis/' + permisId);
  },

  //Fonctions
  addFonction(sapeurId, fonctionData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/fonctions', fonctionData);
  },
  editFonction(sapeurId, fonctionData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/fonctions/' + fonctionData.id,
      fonctionData
    );
  },
  removeFonction(sapeurId, fonctionId) {
    return Api.api().delete(
      '/sapeurs/' + sapeurId + '/fonctions/' + fonctionId
    );
  },
  finFonctions(sapeurId, date, fonctionsId) {
    return Api.api().post('/sapeurs/' + sapeurId + '/fin-fonctions', {
      ids: fonctionsId,
      date: date,
    });
  },

  //Grades
  addGrade(sapeurId, gradeData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/grades', gradeData);
  },
  editGrade(sapeurId, gradeData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/grades/' + gradeData.id,
      gradeData
    );
  },
  removeGrade(sapeurId, gradeId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/grades/' + gradeId);
  },

  //Cours
  addCours(sapeurId, coursData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/cours', coursData);
  },
  editCours(sapeurId, coursData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/cours/' + coursData.id,
      coursData
    );
  },
  removeCours(sapeurId, coursId) {
    return Api.api().delete('/sapeurs/' + sapeurId + '/cours/' + coursId);
  },

  //Mutations
  addMutation(sapeurId, mutationData) {
    return Api.api().post('/sapeurs/' + sapeurId + '/mutations', mutationData);
  },
  editMutation(sapeurId, mutationData) {
    return Api.api().put(
      '/sapeurs/' + sapeurId + '/mutations/' + mutationData.id,
      mutationData
    );
  },
  removeMutation(sapeurId, mutationId) {
    return Api.api().delete(
      '/sapeurs/' + sapeurId + '/mutations/' + mutationId
    );
  },

  //Groupes
  quitterGroupes(sapeurId, groupesId) {
    return Api.api().post('/sapeurs/' + sapeurId + '/quitter-groupes', {
      groupes: groupesId,
    });
  },

  supprimerConvocation(sapeurId, convocationsIds) {
    return Api.api().post('/sapeurs/' + sapeurId + '/supprimer-convocations', {
      convocations: convocationsIds,
    });
  },
};

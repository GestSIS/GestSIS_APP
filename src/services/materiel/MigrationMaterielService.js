import Api from "/src/http/Request";

// TEMPORAIRE : service pour la migration article-emplacement (véhicules/hangars).
// À supprimer une fois la migration des données existantes terminée.
export default {
  getEmplacementsSansHangar() {
    return Api.api().get("admin/migration/emplacements-sans-hangar");
  },
  transformerEnHangar(emplacementId, data) {
    return Api.api().post(`admin/migration/emplacements/${emplacementId}/hangar`, data);
  },
  getVehiculesSansEmplacement() {
    return Api.api().get("admin/migration/vehicules-sans-emplacement");
  },
  lierEmplacement(articleId, emplacementId) {
    return Api.api().post(`admin/migration/articles/${articleId}/emplacement`, {
      emplacement_id: emplacementId,
    });
  },
  convertirEnVehicule(emplacementId, data) {
    return Api.api().post(`admin/migration/emplacements/${emplacementId}/vehicule`, data);
  },
};

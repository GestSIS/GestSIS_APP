import Api from '@/http/Request'

export default {
  getIndemniteTypes() {
    return Api.api().get('/indemnites-types/')
  },
  getFraisTypes() {
    return Api.api().get('/frais-types/')
  },
  imputerExercice(exerciceId, payload) {
    return Api.api().post('/imputation/exercice/' + exerciceId, payload)
  },
  imputerIntervention(interventionId, payload) {
    return Api.api().post('/imputation/intervention/' + interventionId, payload)
  },
  imputerAnnuel(exerciceComptableId) {
    return Api.api().post('/imputation/annuel/' + exerciceComptableId)
  },
  getComptes() {
    return Api.api().get('/comptes/')
  },
  getEcritureForCompte(compteId, exerciceComptableId) {
    return Api.api().get(`comptes/${compteId}/ecritures/${exerciceComptableId}`)
  },
  getEcrituresForExercice(exerciceId) {
    return Api.api().get('/ecritures/exercice/' + exerciceId)
  },
  getEcrituresForInterventions(interventionId) {
    return Api.api().get('/ecritures/intervention/' + interventionId)
  },
  getEcrituresAnnuelsForExerciceComptable(exerciceComtableId) {
    return Api.api().get('/ecritures/annuel/' + exerciceComtableId)
  }
}

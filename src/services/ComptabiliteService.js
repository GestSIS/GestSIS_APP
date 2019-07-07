import Api from '@/services/Api'

export default {
  getIndemniteTypes() {
    return Api().get('/indemnites-types/')
  },
  getFraisTypes() {
    return Api().get('/frais-types/')
  },
  imputerExercice(exerciceId, payload) {
    return Api().post('/imputation/exercice/' + exerciceId, payload)
  },
  imputerIntervention(interventionId, payload) {
    return Api().post('/imputation/intervention/' + interventionId, payload)
  },
  imputerAnnuel(exerciceComptableId) {
    return Api().post('/imputation/annuel/' + exerciceComptableId)
  },
  getComptes() {
    return Api().get('/comptes/')
  },
  getEcrituresForExercice(exerciceId) {
    return Api().get('/ecritures/exercice/' + exerciceId)
  },
  getEcrituresForInterventions(interventionId) {
    return Api().get('/ecritures/intervention/' + interventionId)
  },
  getEcrituresAnnuelsForExerciceComptable(exerciceComtableId) {
    return Api().get('/ecritures/annuel/' + exerciceComtableId)
  }
}

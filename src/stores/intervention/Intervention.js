import { defineStore } from "pinia";
import InterventionService from "../../services/InterventionService.js";

export const useInterventionStore = defineStore("intervention", {
  state: () => ({
    liste: [],
    active: {
      id: 0,
      sapeurs: [],
      groupes: [],
      data: {},
      missions: [],
      appels: [],
      quittances: [],
      vehicules: [],
      materiels: [],
      phases: [],
    },
  }),
  actions: {
    async fetchListeIntervention(exerciceComptableId) {
      this.liste = await InterventionService.getInterventions(exerciceComptableId);
    },
    async fetchIntervention(id) {
      this.active.data = await InterventionService.getIntervention(id);
    },
    async fetchInterventionSapeurs(id) {
      this.active.sapeurs = await InterventionService.getSapeurs(id);
    },
    async fetchInterventionQuittances(id) {
      this.active.quittances = await InterventionService.getQuittances(id);
    },
    async fetchInterventionMateriels(interventionId) {
      this.active.materiels = await InterventionService.getMateriels(interventionId);
    },
    async fetchInterventionVehicules(interventionId) {
      this.active.vehicules = await InterventionService.getVehicules(interventionId);
    },
    async fetchInterventionAppels(interventionId) {
      this.active.appels = await InterventionService.getAppels(interventionId);
    },
    async fetchInterventionMissions(interventionId) {
      this.active.missions = await InterventionService.getMissions(interventionId);
    },
    async fetchInterventionPhases(interventionId) {
      this.active.phases = await InterventionService.getPhases(interventionId);
    },
    async fetchInterventionGroupes(interventionId) {
      this.active.groupes = await InterventionService.getGroupes(interventionId);
    },
    selectIntervention(id) {
      this.active.id = id;
    },
    async createIntervention(intervention) {
      const data = await InterventionService.createIntervention(intervention);
      this.liste.push(data);
      this.active.id = data.id;
      this.active.data = data;
      return data;
    },
    async removeIntervention(interventionId) {
      await InterventionService.removeIntervention(interventionId);
      this.liste = this.liste.filter((i) => i.id != interventionId);
    },
    async saveActiveIntervention(intervention) {
      const data = await InterventionService.saveIntervention(intervention.id, intervention);
      this.active.data = data;
      return data;
    },
    async validerIntervention(id) {
      const data = await InterventionService.validerIntervention(id);
      this.liste = this.liste.map((i) => (i.id == id ? { ...i, statut: data } : i));
      return data;
    },
    // Materiel
    async addInterventionMateriel(materiel) {
      const data = await InterventionService.addMateriel(materiel.intervention_id, materiel);
      this.active.materiels = data;
      return data;
    },
    async editInterventionMateriel(materiel) {
      const data = await InterventionService.editMateriel(materiel.intervention_id, materiel);
      this.active.materiels = data;
      return data;
    },
    async removeInterventionMateriel(interventionId, materielId) {
      const data = await InterventionService.removeMateriel(interventionId, materielId);
      this.active.materiels = this.active.materiels.filter((p) => p.id !== materielId);
      return data;
    },
    // Groupes
    async addInterventionGroupes(groupes) {
      const data = await InterventionService.addGroupes(this.active.data.id, groupes);
      this.active.groupes = data;
      return data;
    },
    async removeInterventionGroupes(groupeIds) {
      const data = await InterventionService.removeGroupes(this.active.data.id, groupeIds);
      this.active.groupes = this.active.groupes.filter((p) => !groupeIds.includes(p.id));
      return data;
    },
    // Vehicules
    async addInterventionVehicules(interventionId, vehicules) {
      const data = await InterventionService.addVehicules(interventionId, vehicules);
      this.active.vehicules = data;
      return data;
    },
    async removeInterventionVehicules(interventionId, vehiculeIds) {
      const data = await InterventionService.removeVehicules(interventionId, vehiculeIds);
      this.active.vehicules = this.active.vehicules.filter((p) => !vehiculeIds.includes(p.id));
      return data;
    },
    // Quittances
    async addQuittance(quittance) {
      const data = await InterventionService.addQuittances(this.active.data.id, [quittance]);
      this.active.quittances = data;
      return data;
    },
    async removeQuittance(quittanceId) {
      const data = await InterventionService.removeQuittances(this.active.data.id, [quittanceId]);
      this.active.quittances = this.active.quittances.filter((p) => p.id !== quittanceId);
      return data;
    },
    // Missions
    async addInterventionMission(mission) {
      const data = await InterventionService.addMission(mission.intervention_id, mission);
      this.active.missions = data;
      return data;
    },
    async editInterventionMission(mission) {
      const data = await InterventionService.editMission(mission.intervention_id, mission);
      this.active.missions = data;
      return data;
    },
    async removeInterventionMission(missionId) {
      const data = await InterventionService.removeMission(this.active.data.id, missionId);
      this.active.missions = this.active.missions.filter((p) => p.id !== missionId);
      return data;
    },
    // Appels
    async addInterventionAppel(appel) {
      const data = await InterventionService.addAppel(this.active.data.id, appel);
      this.active.appels = data;
      return data;
    },
    async editInterventionAppel(appel) {
      const data = await InterventionService.editAppel(this.active.data.id, appel);
      this.active.appels = data;
      return data;
    },
    async removeInterventionAppel(appelId) {
      const data = await InterventionService.removeAppel(this.active.data.id, appelId);
      this.active.appels = this.active.appels.filter((p) => p.id !== appelId);
      return data;
    },
    // Sapeurs/Présences
    async addPresences(sapeurs) {
      const data = await InterventionService.addSapeurs(this.active.data.id, { sapeurs });
      this.active.sapeurs = data.sapeurs;
      this.liste = this.liste.map((i) =>
        i.id == this.active.id ? { ...i, statut: data.statut } : i,
      );
      return data;
    },
    async editPresence(sapeur) {
      const data = await InterventionService.editSapeurs(this.active.data.id, {
        sapeurs: [sapeur],
      });
      this.active.sapeurs = this.active.sapeurs.map((s) => (s.id === sapeur.id ? sapeur : s));
      return data;
    },
    async removePresence(sapeurId) {
      const data = await InterventionService.removeSapeurs(this.active.data.id, {
        sapeurs: [sapeurId],
      });
      this.active.sapeurs = this.active.sapeurs.filter((p) => p.id !== sapeurId);
      this.liste = this.liste.map((i) => (i.id == this.active.id ? { ...i, statut: data } : i));
      return data;
    },
    // Phases
    async addPhase(phase) {
      const data = await InterventionService.addPhase(this.active.data.id, phase);
      this.active.phases = data;
      return data;
    },
    async editPhase(phase) {
      const data = await InterventionService.editPhase(this.active.data.id, phase);
      this.active.phases = data;
      return data;
    },
    async removePhase(phaseId) {
      const data = await InterventionService.removePhase(this.active.data.id, phaseId);
      this.active.phases = this.active.phases.filter((p) => p.id !== phaseId);
      return data;
    },
  },
});

import { defineStore } from 'pinia';
import MissionService from '../../services/MissionService.js';

export const useMissionStore = defineStore('mission', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchMissions() {
            this.liste = await MissionService.getMissions();
        },
        async addMission(mission) {
            const data = await MissionService.addMission(mission);
            this.liste.push(data);
            return data;
        },
        async updateMission(mission) {
            const data = await MissionService.updateMission(mission);
            this.liste = this.liste.map((m) => (m.id === mission.id ? data : m));
            return data;
        },
        async removeMission(missionId) {
            const data = await MissionService.removeMission(missionId);
            this.liste = this.liste.filter((m) => m.id != missionId);
            return data;
        },
    },
});

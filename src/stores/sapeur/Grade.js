import { defineStore } from 'pinia';
import GradeService from '../../services/GradeService.js';

export const useGradeStore = defineStore('grade', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchGrades() {
            if (this.liste.length) {
                return Promise.resolve();
            }
            const data = await GradeService.getGrades();
            this.liste = data;
            return data;
        },
        async addGrade(grade) {
            const data = await GradeService.addGrade(grade);
            this.liste.push(data);
            return data;
        },
        async updateGrade(grade) {
            const data = await GradeService.updateGrade(grade);
            this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
            return data;
        },
        async removeGrade(gradeId) {
            const data = await GradeService.removeGrade(gradeId);
            this.liste = this.liste.filter((m) => m.id != gradeId);
            return data;
        },
    },
});

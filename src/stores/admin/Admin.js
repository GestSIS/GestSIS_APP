import { defineStore } from 'pinia';
import AdminService from '../../services/AdminService';
import AuthService from '../../services/AuthService';

export const useAdminStore = defineStore('admin', {
    state: () => ({
        sis: [],
        roles: [],
        users: [],
        contacts: {},
        params: {},
    }),
    actions: {
        async loadAllSis() {
            const { data } = await AuthService.sisListe();
            this.sis = data;
            return data;
        },
        async addSis(sis) {
            const { data } = await AdminService.addSis(sis);
            this.sis.push(data);
            return data;
        },
        async editSis(sis) {
            const { data } = await AdminService.editSis(sis);
            const index = this.sis.findIndex((s) => s.id === sis.id);
            if (index !== -1) {
                this.sis[index] = data;
            }
            return data;
        },
        async loadAllUsers() {
            const { data } = await AdminService.getAllUsers();
            this.users = data;
            return data;
        },
        async loadAllRoles() {
            const { data } = await AdminService.getAllRoles();
            this.roles = data;
            return data;
        },
        async loadAllSisContacts() {
            const data = await AdminService.getAllSisContacts();
            this.contacts = data;
            return data;
        },
        async loadAllSisParams() {
            const data = await AdminService.getAllSisParams();
            this.params = data;
            return data;
        },
        async editUser(user) {
            const { data } = await AdminService.editUser(user);
            const index = this.users.findIndex((u) => u.id === user.id);
            if (index !== -1) {
                this.users[index] = data;
            }
            return data;
        },
        async deleteUser(userId) {
            await AdminService.deleteUser(userId);
            this.users = this.users.filter((u) => u.id !== userId);
        },
        async addUserRole(userId, roleId) {
            const { data } = await AdminService.addUserRole({ user_id: userId, role_id: roleId });
            const user = this.users.find((u) => u.id === userId);
            if (user) {
                user.roles.push(data);
            }
            return data;
        },
        async removeUserRole(userId, roleId) {
            await AdminService.removeUserRole(userId, roleId);
            const user = this.users.find((u) => u.id === userId);
            if (user) {
                user.roles = user.roles.filter((r) => r.id !== roleId);
            }
        },
    },
});

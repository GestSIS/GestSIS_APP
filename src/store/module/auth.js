import types from '../mutationTypes';

import { TokenService } from '../../services/StorageService.js';
import AuthService from '../../services/AuthService.js';
import Api from '../../http/Request';
import { jwtDecode } from 'jwt-decode';
import router from '../../router/index';

export default {
  state: {
    authenticated: !!TokenService.getAccessToken(),
    user: null,
    email: null,
    admin: false,
    validated: false,
    sapeurId: null,
    refreshTokenPromise: null,
    permissions: [],
    roles: [],
    users: [],
    sis: {
      activeId: null,
      activeKey: null,
      sapeurs: {},
      liste: [],
      permissions: [],
      available: [],
      allPermissions: {},
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.roles = [];
      state.users = [];
    },
    [types.AUTH_SUCCESSFULL](state, payload) {
      TokenService.saveAccessToken(payload.accessToken);
      TokenService.saveRefreshToken(payload.refreshToken);
      TokenService.saveUser(payload.user);
      Api.setAccessToken(payload.accessToken);

      state.user = payload.user;

      const jwt = jwtDecode(payload.accessToken);
      const permissionsParSis = jwt.data.permissions ?? {};
      const sapeurParSis = jwt.data.sapeurs ?? {};
      const availableSis = [
        ...new Set([
          ...Object.keys(permissionsParSis),
          ...Object.keys(sapeurParSis),
        ]),
      ];

      state.email = jwt.data.email;
      state.admin = jwt.data.admin;
      state.validated = jwt.data.validated;

      state.sis.sapeurs = sapeurParSis;
      state.sis.available = availableSis;

      if (availableSis.length > 0) {
        let sisKey = availableSis[0];
        if (availableSis.find((v) => v === state.sis.activeKey)) {
          // En cas de reconnexion
          sisKey = state.sis.activeKey;
        } else if (Object.keys(sapeurParSis).length) {
          sisKey = Object.keys(sapeurParSis)[0];
        }

        const sis = state.sis.liste.find((sis) => sis.api_key == sisKey);
        state.sis.activeId = sis.id;
        state.sis.activeKey = sis.api_key;
        state.sis.permissions = permissionsParSis[sis.api_key] ?? [];
        state.sis.allPermissions = permissionsParSis;
        state.sapeurId = sapeurParSis[sis.api_key] ?? null;
        Api.setSisKey(sis.api_key);
      }
    },
    [types.UPDATE_ROLE](state, payload) {
      state.roles = state.roles.map((r) => {
        if (r.id == payload.id) {
          return payload;
        } else {
          return r;
        }
      });
    },
    [types.ADD_ROLE](state, payload) {
      state.roles = [...state.roles, payload];
    },
    [types.UPDATE_USER_ROLE](state, payload) {
      state.users = state.users.map((u) => {
        if (u.id === payload.user_id) {
          return {
            ...u,
            user_roles: payload.roles,
          };
        } else {
          return u;
        }
      });
    },
    [types.DELETE_ROLE](state, roleId) {
      state.roles = state.roles.filter((r) => r.id != roleId);
    },
    [types.AUTH_REFRESH_TOKEN_PROMISES](state, payload) {
      state.refreshTokenPromise = payload;
    },
    [types.AUTH_LOGOUT](state) {
      TokenService.removeAccessToken();
      TokenService.removeRefreshToken();
      TokenService.removeUser();
      Api.setAccessToken('');

      state.user = null;
      state.email = null;
      state.admin = false;
      state.validated = false;

      state.sis.activeId = null;
      state.sis.activeKey = null;
      state.sis.permissions = [];
      state.sis.available = [];
      state.sis.allPermissions = {};

      //location.reload();
    },
    [types.AUTH_SIS_LISTE](state, payload) {
      state.sis.liste = payload;
    },
    [types.AUTH_PERMISSIONS_LISTE](state, payload) {
      state.permissions = payload;
    },
    [types.AUTH_ROLES_LISTE](state, payload) {
      state.roles = payload;
    },
    [types.AUTH_USERS_LISTE](state, payload) {
      state.users = payload;
    },
    [types.AUTH_SELECT_SIS](state, sis) {
      state.sis.activeId = sis?.id;
      state.sis.activeKey = sis?.api_key;
      state.sis.permissions = state.sis.allPermissions[sis?.api_key] ?? [];
      state.sapeurId = state.sis.sapeurs[sis?.api_key] ?? null;

      Api.setSisKey(sis?.api_key);
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    availableSisListe: (state) => {
      return state.sis.liste
        .filter(
          (sis) => state.sis.available.includes(sis.api_key) || state.sis.admin
        )
        .sort((s1, s2) => s1.nom.localeCompare(s2.nom));
    },
  },
  actions: {
    login({ commit }, payload) {
      return AuthService.login(payload).then((data) => {
        return commit(types.AUTH_SUCCESSFULL, data);
      });
    },
    register({ commit }, credentials) {
      return AuthService.register(credentials).then((data) => {
        return commit(types.AUTH_SUCCESSFULL, data);
      });
    },
    forgottenPassword(_, email) {
      return AuthService.forgottenPassword(email);
    },
    resetPassword(_, { token, password }) {
      return AuthService.resetPassword(token, password);
    },
    changePassword({ state }, { password, newPassword }) {
      return AuthService.changePassword({
        email: state.email,
        password: password,
        new_password: newPassword,
      });
    },
    confirmation(_, token) {
      return AuthService.confirmation(token).then((data) => {
        data.data;
      });
    },
    logout({ commit }) {
      return Promise.resolve(commit(types.AUTH_LOGOUT));
    },
    useToken({ commit }, token) {
      return AuthService.useToken(token).then(({ message, accessToken }) => {
        // update new access token
        commit(types.AUTH_SUCCESSFULL, {
          accessToken,
          refreshToken: TokenService.getRefreshToken(),
          user: TokenService.getUser(),
        });
        return message;
      });
    },
    selectSis({ commit, dispatch }, sis) {
      commit(types.AUTH_SELECT_SIS, sis);
      dispatch('fetchLocalitesSis');
      return Promise.resolve(commit(types.CLEAR_CACHE));
    },
    loadSisListe({ commit, state }) {
      if (state.sis.liste.length <= 0) {
        return AuthService.sisListe().then((sis) => {
          return commit(types.AUTH_SIS_LISTE, sis.data);
        });
      } else {
        return Promise.resolve();
      }
    },
    newRegisterToken(_, token) {
      return AuthService.newRegisterToken(token).then((t) => t.data);
    },
    updateUserRoles({ commit }, user) {
      return AuthService.updateUserRoles(user).then((data) => {
        return commit(types.UPDATE_USER_ROLE, {
          user_id: user.id,
          roles: data.data,
        });
      });
    },
    updateRole({ commit }, role) {
      return AuthService.updateRole(role).then((role) => {
        return commit(types.UPDATE_ROLE, role.data);
      });
    },
    createRole({ commit }, role) {
      return AuthService.createRole(role).then((role) => {
        return commit(types.ADD_ROLE, role.data);
      });
    },
    deleteRole({ commit }, roleId) {
      return AuthService.deleteRole(roleId).then(() => {
        return commit(types.DELETE_ROLE, roleId);
      });
    },
    refreshToken({ commit, state }) {
      const callback = () => {
        const p = AuthService.refreshToken(TokenService.getRefreshToken());
        commit(types.AUTH_REFRESH_TOKEN_PROMISES, p);

        // Wait for the UserService.refreshToken() to resolve. On success set the token and clear promise
        // Clear the promise on error as well.
        p.then((data) => {
          commit(types.AUTH_SUCCESSFULL, data);
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, null);
          return data;
        }).catch((e) => {
          commit(types.AUTH_LOGOUT);
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, null);
          router.push({ name: 'login' });
          throw e;
        });
        return p;
      };
      if (!state.refreshTokenPromise) {
        if (state.sis.liste.length == 0) {
          // Charge la liste des SIS
          return AuthService.sisListe()
            .then((sis) => {
              // console.log("Commit sis list")
              return commit(types.AUTH_SIS_LISTE, sis.data);
            })
            .then(async () => await callback());
        } else {
          return callback();
        }
      } else {
        return state.refreshTokenPromise;
      }
    },
    resendValidationEmail() {
      return AuthService.resendValidationEmail();
    },
    fetchPermissions({ commit, state }) {
      if (state.permissions.length > 0) {
        return Promise.resolve();
      }
      return AuthService.getPermissions().then(({ data }) => {
        return commit(types.AUTH_PERMISSIONS_LISTE, data);
      });
    },
    fetchRoles({ commit, state }) {
      if (state.roles.length > 0) {
        return Promise.resolve();
      }
      return AuthService.getRoles().then(({ data }) => {
        return commit(types.AUTH_ROLES_LISTE, data);
      });
    },
    fetchUsers({ commit }) {
      return AuthService.getUsers().then((users) => {
        return commit(types.AUTH_USERS_LISTE, users.data);
      });
    },
  },
};

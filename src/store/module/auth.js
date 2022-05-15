import types from '../mutationTypes';
import permissions from '../permissions';

import { TokenService } from '../../services/StorageService.js';
import AuthService from '../../services/AuthService.js';
import Api from '../../http/Request';
import jwt_decode from 'jwt-decode';
import router from '../../router/index';

export default {
  state: {
    authenticated: !!TokenService.getAccessToken(),
    user: null,
    email: null,
    refreshTokenPromise: null,
    permissions: [],
    roles: [],
    users: [],
    sis: {
      activeId: null,
      activeKey: null,
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

      const jwt = jwt_decode(payload.accessToken);
      const permissionsParSis = jwt.data.permissions;
      const availableSis = Object.keys(permissionsParSis);
      state.sis.available = availableSis;
      state.email = jwt.data.email;
      if (availableSis.length > 0) {
        const firstSisKey = availableSis[0];
        const sis = state.sis.liste.find((sis) => sis.api_key == firstSisKey);
        state.sis.activeId = sis.id;
        state.sis.activeKey = sis.api_key;
        state.sis.permissions = permissionsParSis[sis.api_key];
        state.sis.allPermissions = permissionsParSis;
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
    [types.NEW_ROLE](state, payload) {
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
      // console.log("Refresh token");
      TokenService.saveAccessToken(payload.accessToken);
      TokenService.saveRefreshToken(payload.refreshToken);
      Api.setAccessToken(payload.accessToken);

      state.refreshTokenPromise = payload;

      const jwt = jwt_decode(payload.accessToken);
      const permissionsParSis = jwt.data.permissions;
      const availableSis = Object.keys(permissionsParSis);
      state.sis.available = availableSis;
      state.email = jwt.data.email;
      if (availableSis.length > 0) {
        const firstSisKey = availableSis[0];
        const sis = state.sis.liste.find((sis) => sis.api_key == firstSisKey);
        state.sis.activeId = sis.id;
        state.sis.activeKey = sis.api_key;
        state.sis.permissions = permissionsParSis[sis.api_key];
        state.sis.allPermissions = permissionsParSis;
        Api.setSisKey(sis.api_key);
      }
    },
    [types.AUTH_LOGOUT](state) {
      TokenService.removeAccessToken();
      TokenService.removeRefreshToken();
      TokenService.removeUser();
      Api.setAccessToken("");

      state.user = null;
      state.email = null;
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
      state.sis.activeId = sis.id;
      state.sis.activeKey = sis.key;
      state.sis.permissions = state.sis.allPermissions[sis.api_key];

      Api.setSisKey(sis.api_key);
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
    activePermissions: (state) => {
      return state.sis.permissions;
    },
    availableSisListe: (state) => {
      return state.sis.liste.filter((sis) =>
        state.sis.available.includes(sis.api_key)
      );
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
    changePassword({ state }, { password, newPassword }) {
      return AuthService.changePassword({
        email: state.email,
        password: password,
        new_password: newPassword,
      });
    },
    confirmation({}, token) {
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
    selectSis({ commit }, sis) {
      commit(types.AUTH_SELECT_SIS, sis);
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
    newRegisterToken({}, token) {
      return AuthService.newRegisterToken(token).then((t) => t.data);
    },
    updateUserRoles({ commit, state }, user) {
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
        return commit(types.NEW_ROLE, role.data);
      });
    },
    deleteRole({ commit }, roleId) {
      return AuthService.deleteRole(roleId).then(() => {
        return commit(types.DELETE_ROLE, roleId);
      });
    },
    refreshToken({ commit, state }) {
      //TODO: Improve not to call refreshToken n times
      const callback = () => {
        const p = AuthService.refreshToken(TokenService.getRefreshToken());

        // Wait for the UserService.refreshToken() to resolve. On success set the token and clear promise
        // Clear the promise on error as well.
        p.then((data) => {
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, data);
        })
          .catch((e) => {
            commit(types.AUTH_LOGOUT);
            router.push({name:'login'})
            return e;
          })
          .then(() => {
            return state.refreshTokenPromise;
          });
      };
      if (!state.refreshTokenPromise) {
        if (state.sis.liste.length == 0) {
          // Charge la liste des SIS
          AuthService.sisListe()
            .then((sis) => {
              return commit(types.AUTH_SIS_LISTE, sis.data);
            })
            .then(callback);
        } else {
          callback();
        }
      } else {
        return state.refreshTokenPromise;
      }
    },
    fetchPermissions({ state, commit }) {
      if (state.permissions.length <= 0) {
        return AuthService.getPermissions().then((permissions) => {
          return commit(types.AUTH_PERMISSIONS_LISTE, permissions);
        });
      }
    },
    fetchRoles({ commit }) {
      return AuthService.getRoles().then((roles) => {
        return commit(types.AUTH_ROLES_LISTE, roles);
      });
    },
    fetchUsers({ commit }) {
      return AuthService.getUsers().then((users) => {
        return commit(types.AUTH_USERS_LISTE, users.data);
      });
    },
  },
};

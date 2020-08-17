import types from '../mutationTypes';

import { TokenService } from '../../services/StorageService';
import AuthService from '../../services/AuthService';
import Api from '../../http/Request';

export default {
  state: {
    authenticated: !!TokenService.getAccessToken(),
    user: null,
    refreshTokenPromise: null
  },
  mutations: {
    [types.AUTH_SUCCESSFULL](state, payload) {
      TokenService.saveAccessToken(payload.accessToken);
      TokenService.saveRefreshToken(payload.refreshToken);
      TokenService.saveUser(payload.user);
      Api.setAccessToken(payload.accessToken);

      state.user = payload.user;
    },
    [types.AUTH_LOGOUT](state) {
      TokenService.removeAccessToken();
      TokenService.removeRefreshToken();
      TokenService.removeUser();

      state.user = null;

      //location.reload();
    },
    [types.AUTH_REFRESH_TOKEN_PROMISES](state, payload) {
      TokenService.saveAccessToken(payload.accessToken);
      TokenService.saveRefreshToken(payload.refreshToken);
      Api.setAccessToken(payload.accessToken);

      state.refreshTokenPromise = payload;
    }
  },
  getters: {
    isLoggedIn: state => !!state.user
  },
  actions: {
    login({ commit }, payload) {
      return AuthService.login(payload).then(data => {
        return commit(types.AUTH_SUCCESSFULL, data);
      });
    },
    register({ commit }, credentials) {
      return AuthService.register(credentials).then(data => {
        return commit(types.AUTH_SUCCESSFULL, data);
      });
    },
    logout({ commit }) {
      return commit(types.AUTH_LOGOUT);
    },
    refreshToken({ commit, state }) {
      if (!state.refreshTokenPromise) {
        const p = AuthService.refreshToken(TokenService.getRefreshToken());
        
        // Wait for the UserService.refreshToken() to resolve. On success set the token and clear promise
        // Clear the promise on error as well.
        p.then(data => {
          console.log(data)
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, data);
        }).catch(e => {
          console.log("Disconnected")
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, null);
          //TODO: Redirect to home page or login page
          return e;
        });
      }

      return state.refreshTokenPromise;
    }
  }
};

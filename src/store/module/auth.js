import types from '../mutationTypes'

import { TokenService } from '../../services/StorageService'
import AuthService from '../../services/AuthService'
import Api from '../../http/Request'

export default {
  state: {
    authenticated: !!TokenService.getToken(),
    user: null,
    refreshTokenPromise: null
  },
  mutations: {
    [types.AUTH_SUCCESSFULL](state, payload) {
      state = {
        authenticated: payload.authenticated,
        user: payload.user
      }
      return state
    },
    [types.AUTH_LOGOUT](state) {
      state = {
        authenticated: false,
        user: null
      }
      return state
    },
    [types.AUTH_REFRESH_TOKEN_PROMISES](state, payload) {
      state.refreshTokenPromise = payload
    }
  },
  getters: {
    isAuthenticated: state => state.authenticated
  },
  actions: {
    login({ commit }, payload) {
      return AuthService.login(payload).then(data => {
        TokenService.saveToken(data.accessToken)
        TokenService.saveRefreshToken(data.refreshToken)

        Api.setAccessToken(data.accessToken)

        return commit(types.AUTH_SUCCESSFULL, {
          authenticated: true,
          user: data.user
        })
      })
    },
    register({ commit }, payload) {
      return AuthService.register(payload).then(data => {
        TokenService.saveToken(data.accessToken)
        TokenService.saveRefreshToken(data.refreshToken)

        Api.setAccessToken(data.accessToken)

        return commit(types.AUTH_SUCCESSFULL, {
          authenticated: true,
          user: data.user
        })
      })
    },
    logout({ commit }) {
      TokenService.removeToken()
      TokenService.removeRefreshToken()

      return commit(types.AUTH_LOGOUT)
    },
    refreshToken({ commit, state }) {
      if (!state.refreshTokenPromise) {
        const p = AuthService.refreshToken(TokenService.getRefreshToken())

        commit(types.AUTH_REFRESH_TOKEN_PROMISES, p)

        // Wait for the UserService.refreshToken() to resolve. On success set the token and clear promise
        // Clear the promise on error as well.
        p.then(data => {
          // commit(types.AUTH_SUCCESSFULL, data)
          TokenService.saveToken(data.accessToken)
          TokenService.saveRefreshToken(data.refreshToken)
          Api.setAccessToken(data.accessToken)
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, null)
        }).catch(e => {
          commit(types.AUTH_REFRESH_TOKEN_PROMISES, null)
          return e
        })
      }

      return state.refreshTokenPromise
    }
  }
}

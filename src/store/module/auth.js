import types from '../mutationTypes'

import { TokenService } from '../../services/StorageService'
import AuthService from '../../services/AuthService'
import Api from '../../services/Api'

export default {
  state: {
    authenticated: !!TokenService.getToken(),
    user: null
  },
  mutations: {
    [types.AUTH_SUCCESSFULL](state, payload) {
      console.log('Mutation')
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
    }
  },
  getters: {
    isAuthenticated: state => state.authenticated
  },
  actions: {
    login({ commit, dispatch }, payload) {
      return AuthService.login(payload).then(data => {
        TokenService.saveToken(data.accessToken)
        TokenService.saveRefreshToken(data.resfreshToken)

        const refreshToken = () => {
          return AuthService.refreshToken(TokenService.getRefreshToken()).then(
            data => {
              TokenService.saveToken(data.accessToken)
              TokenService.saveRefreshToken(data.refreshToken)
            }
          )
        }
        const onRefreshFail = () => {
          return dispatch('logout')
        }

        Api.setAccessToken(data.accessToken)

        Api.set401Interceptor(refreshToken, onRefreshFail)

        console.log(data)
        console.log(data.user)

        return commit(types.AUTH_SUCCESSFULL, {
          authenticated: true,
          user: data.user
        })
      })
    },
    register({ commit, dispatch }, payload) {
      return AuthService.register(payload).then(data => {
        TokenService.saveToken(data.data.accessToken)
        TokenService.saveRefreshToken(data.data.resfreshToken)

        const refreshToken = () => {
          return AuthService.refreshToken(TokenService.getRefreshToken()).then(
            data => {
              TokenService.saveToken(data.accessToken)
              TokenService.saveRefreshToken(data.refreshToken)
            }
          )
        }
        const onRefreshFail = () => {
          return dispatch('logout')
        }

        Api.setAccessToken(data.accessToken)
        Api.set401Interceptor(refreshToken, onRefreshFail)

        return commit(types.AUTH_SUCCESSFULL, {
          authenticated: true,
          user: data.user
        })
      })
    },
    logout({ commit }) {
      TokenService.removeToken()
      TokenService.removeRefreshToken()
      Api.remove401Interceptor()

      return commit(types.AUTH_LOGOUT)
    }
  }
}

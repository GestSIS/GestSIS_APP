import AuthService from './apis/Auth'
import { TokenService } from './StorageService'


class AuthenticationError extends Error {
  constructor(errorCode, message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.errorCode = errorCode
  }
}

const UserService = {
  /**
   * Login the user and store the access token to TokenService.
   *
   * @returns access_token
   * @throws AuthenticationError
   **/
  login: async function(email, password) {
    const requestData = {
      method: 'post',
      url: "/o/token/",
      data: {
        grant_type: 'password',
        username: email,
        password: password
      },
      auth: {
        username: process.env.VUE_APP_CLIENT_ID,
        password: process.env.VUE_APP_CLIENT_SECRET
      }
    }

    try {
      const response = await AuthService()::post(requestData)

      TokenService.saveToken(response.data.access_token)
      TokenService.saveRefreshToken(response.data.refresh_token)
      AuthService.setHeader()

      // NOTE: We haven't covered this yet in our ApiService
      //       but don't worry about this just yet - I'll come back to it later
      AuthService.mount401Interceptor();

      return response.data.access_token
    } catch (error) {
      throw new AuthenticationError(error.response.status, error.response.data.detail)
    }
  },

  /**
   * Refresh the access token.
   **/
  refreshToken: async function() {
    const refreshToken = TokenService.getRefreshToken()

    const requestData = {
      method: 'post',
      url: "/o/token/",
      data: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      auth: {
        username: process.env.VUE_APP_CLIENT_ID,
        password: process.env.VUE_APP_CLIENT_SECRET
      }
    }

    try {
      const response = await AuthService.customRequest(requestData)

      TokenService.saveToken(response.data.access_token)
      TokenService.saveRefreshToken(response.data.refresh_token)
      // Update the header in ApiService
      AuthService.setHeader()

      return response.data.access_token
    } catch (error) {
      throw new AuthenticationError(error.response.status, error.response.data.detail)
    }

  },

  /**
   * Logout the current user by removing the token from storage.
   *
   * Will also remove `Authorization Bearer <token>` header from future requests.
   **/
  logout() {
    // Remove the token and remove Authorization header from Api Service as well
    TokenService.removeToken()
    TokenService.removeRefreshToken()
    ApiService.removeHeader()

    // NOTE: Again, we'll cover the 401 Interceptor a bit later.
    ApiService.unmount401Interceptor()
  }
}

export default UserService

export { UserService, AuthenticationError }
const TOKEN_KEY = 'access_token';
const USER_KEY = 'logged_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Manage the how Access Tokens are being stored and retreived from storage.
 *
 * Current implementation stores to localStorage. Local Storage should always be
 * accessed through this instace.
 **/
const TokenService = {
  getUser() {
    return JSON.parse(localStorage.getItem(USER_KEY));
  },
  saveUser(accessToken) {
    localStorage.setItem(USER_KEY, JSON.stringify(accessToken));
  },
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  saveAccessToken(accessToken) {
    if (accessToken === null || accessToken === 'null') {
      this.removeAccessToken();
    } else {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  },
  removeAccessToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  saveRefreshToken(refreshToken) {
    if (refreshToken === null || refreshToken === 'null') {
      this.removeRefreshToken;
    } else {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  removeRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export { TokenService };

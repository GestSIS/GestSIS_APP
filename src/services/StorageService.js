const TOKEN_KEY = "access_token";
const USER_KEY = "logged_user";
const REFRESH_TOKEN_KEY = "refresh_token";
const ADMIN_TOKEN_KEY = "admin_access_token";
const ADMIN_USER_KEY = "admin_logged_user";

/**
 * Manage the how Access Tokens are being stored and retreived from storage.
 *
 * Current implementation stores to localStorage. Local Storage should always be
 * accessed through this instace.
 **/

// Certains navigateurs (stockage bloqué par les préférences de vie privée,
// contexte partitionné, ...) font lever une SecurityError sur tout accès à
// localStorage. On isole ces accès pour ne pas planter l'app au chargement,
// mais on laisse remonter toute autre erreur (ex. QuotaExceededError).
function isSecurityError(err) {
  return err instanceof DOMException && err.name === "SecurityError";
}
function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    if (!isSecurityError(err)) {
      throw err;
    }
    return null;
  }
}
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    if (!isSecurityError(err)) {
      throw err;
    }
    // Stockage indisponible : on ignore, l'utilisateur devra se reconnecter.
  }
}
function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    if (!isSecurityError(err)) {
      throw err;
    }
    // Stockage indisponible : rien à supprimer.
  }
}

const TokenService = {
  getUser() {
    return JSON.parse(safeGetItem(USER_KEY));
  },
  saveUser(accessToken) {
    safeSetItem(USER_KEY, JSON.stringify(accessToken));
  },
  removeUser() {
    safeRemoveItem(USER_KEY);
  },

  getAccessToken() {
    return safeGetItem(TOKEN_KEY);
  },
  saveAccessToken(accessToken) {
    if (accessToken === null || accessToken === "null") {
      this.removeAccessToken();
    } else {
      safeSetItem(TOKEN_KEY, accessToken);
    }
  },
  removeAccessToken() {
    safeRemoveItem(TOKEN_KEY);
  },

  getRefreshToken() {
    return safeGetItem(REFRESH_TOKEN_KEY);
  },
  saveRefreshToken(refreshToken) {
    if (refreshToken === null || refreshToken === "null") {
      this.removeRefreshToken();
    } else {
      safeSetItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  removeRefreshToken() {
    safeRemoveItem(REFRESH_TOKEN_KEY);
  },

  // Session admin mise de côté pendant une usurpation d'identité, pour
  // pouvoir la restaurer via stopImpersonation() même après un F5.
  getAdminAccessToken() {
    return safeGetItem(ADMIN_TOKEN_KEY);
  },
  saveAdminAccessToken(accessToken) {
    safeSetItem(ADMIN_TOKEN_KEY, accessToken);
  },
  removeAdminAccessToken() {
    safeRemoveItem(ADMIN_TOKEN_KEY);
  },

  getAdminUser() {
    return JSON.parse(safeGetItem(ADMIN_USER_KEY));
  },
  saveAdminUser(user) {
    safeSetItem(ADMIN_USER_KEY, JSON.stringify(user));
  },
  removeAdminUser() {
    safeRemoveItem(ADMIN_USER_KEY);
  },
};

export { TokenService };

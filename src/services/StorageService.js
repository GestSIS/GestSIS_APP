import { safeLocalStorage, safeSessionStorage } from "../tools/storage.js";

const TOKEN_KEY = "access_token";
const USER_KEY = "logged_user";
const REFRESH_TOKEN_KEY = "refresh_token";
const ADMIN_TOKEN_KEY = "admin_access_token";
const ADMIN_USER_KEY = "admin_logged_user";
const TWO_FACTOR_NUDGE_KEY = "two_factor_nudge";
const ACTIVE_ORGANISATION_KEY = "active_organisation";

/**
 * Manage the how Access Tokens are being stored and retreived from storage.
 *
 * Relit le stockage à chaque appel : localStorage est partagé entre onglets, un jeton
 * rafraîchi dans un autre onglet doit être vu immédiatement (pas de valeur en cache).
 **/

const TokenService = {
  getUser() {
    return safeLocalStorage.getJson(USER_KEY);
  },
  saveUser(accessToken) {
    safeLocalStorage.setJson(USER_KEY, accessToken);
  },
  removeUser() {
    safeLocalStorage.remove(USER_KEY);
  },

  getAccessToken() {
    return safeLocalStorage.get(TOKEN_KEY);
  },
  saveAccessToken(accessToken) {
    if (accessToken === null || accessToken === "null") {
      this.removeAccessToken();
    } else {
      safeLocalStorage.set(TOKEN_KEY, accessToken);
    }
  },
  removeAccessToken() {
    safeLocalStorage.remove(TOKEN_KEY);
  },

  getRefreshToken() {
    return safeLocalStorage.get(REFRESH_TOKEN_KEY);
  },
  saveRefreshToken(refreshToken) {
    if (refreshToken === null || refreshToken === "null") {
      this.removeRefreshToken();
    } else {
      safeLocalStorage.set(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  removeRefreshToken() {
    safeLocalStorage.remove(REFRESH_TOKEN_KEY);
  },

  // Session admin mise de côté pendant une usurpation d'identité, pour
  // pouvoir la restaurer via stopImpersonation() même après un F5.
  getAdminAccessToken() {
    return safeLocalStorage.get(ADMIN_TOKEN_KEY);
  },
  saveAdminAccessToken(accessToken) {
    safeLocalStorage.set(ADMIN_TOKEN_KEY, accessToken);
  },
  removeAdminAccessToken() {
    safeLocalStorage.remove(ADMIN_TOKEN_KEY);
  },

  getAdminUser() {
    return safeLocalStorage.getJson(ADMIN_USER_KEY);
  },
  saveAdminUser(user) {
    safeLocalStorage.setJson(ADMIN_USER_KEY, user);
  },
  removeAdminUser() {
    safeLocalStorage.remove(ADMIN_USER_KEY);
  },

  // Bandeau d'incitation 2FA : conservé pour survivre à un rechargement de
  // page (qui restaure la session sans repasser par login/refresh).
  getTwoFactorNudge() {
    return safeLocalStorage.getJson(TWO_FACTOR_NUDGE_KEY);
  },
  saveTwoFactorNudge(nudge) {
    safeLocalStorage.setJson(TWO_FACTOR_NUDGE_KEY, nudge);
  },
  removeTwoFactorNudge() {
    safeLocalStorage.remove(TWO_FACTOR_NUDGE_KEY);
  },

  // Organisation active : en sessionStorage pour rester propre à l'onglet (deux onglets
  // peuvent travailler sur deux organisations) tout en survivant à un rechargement.
  getActiveOrganisation() {
    return safeSessionStorage.get(ACTIVE_ORGANISATION_KEY);
  },
  saveActiveOrganisation(orgKey) {
    if (orgKey == null) {
      this.removeActiveOrganisation();
    } else {
      safeSessionStorage.set(ACTIVE_ORGANISATION_KEY, orgKey);
    }
  },
  removeActiveOrganisation() {
    safeSessionStorage.remove(ACTIVE_ORGANISATION_KEY);
  },
};

export { TokenService };

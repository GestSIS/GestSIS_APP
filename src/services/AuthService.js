import Api from "/src/http/Request";

export default {
  login(payload) {
    return Api.auth().post("/login", payload);
  },
  register(credentials) {
    return Api.auth().post("/register", credentials);
  },
  forgottenPassword(email) {
    return Api.auth().post("/forgotten-password", { email });
  },
  resetPassword(token, password) {
    return Api.auth().post("/reset-password", { token, password });
  },
  changePassword(data) {
    return Api.auth().post("/change-password", data);
  },
  useToken(token) {
    return Api.auth().post("/use-token", { token });
  },
  // `email` requis : depuis que l'inscription n'émet plus de session tant
  // que l'email n'est pas confirmé, ce point d'accès n'est plus protégé par
  // un jeton (il n'en existe justement pas encore juste après l'inscription).
  resendValidationEmail(email) {
    return Api.auth().post("/resend-confirmation", { email });
  },
  confirmRegistrationEmail(email, code) {
    return Api.auth().post("/confirmer-email", { email, code });
  },
  newRegisterToken(tokenInfo) {
    return Api.auth().post("/register-token", tokenInfo);
  },
  refreshToken(payload) {
    return Api.auth().post("refresh-token", { token: payload });
  },
  logout(refreshToken) {
    return Api.auth().post("logout", { token: refreshToken });
  },
  getSessions() {
    return Api.auth().get("sessions");
  },
  deleteSession(id) {
    return Api.auth().delete("sessions/" + id);
  },
  me() {
    return Api.auth().get("me");
  },
  updateUserRoles(user) {
    return Api.auth().post("users/" + user.id + "/roles", {
      roles: user.roles,
    });
  },
  createRole(role) {
    return Api.auth().post("roles", role);
  },
  updateRole(role) {
    return Api.auth().put("roles/" + role.id, role);
  },
  deleteRole(roleId) {
    return Api.auth().delete("roles/" + roleId);
  },
  sisListe() {
    return Api.auth().get("sis");
  },
  getPermissions() {
    return Api.auth().get("permissions");
  },
  getApiTokens() {
    return Api.auth().get("api-tokens");
  },
  createApiToken(apiToken) {
    return Api.auth().post("api-tokens", apiToken);
  },
  deleteApiToken(apiTokenId) {
    return Api.auth().delete("api-tokens/" + apiTokenId);
  },
  getRoles() {
    return Api.auth().get("roles");
  },
  getUsers() {
    return Api.auth().get("users");
  },
  // 2FA — statut cross-méthodes (voir stores/auth/Auth.js:loadTwoFactorStatus)
  getTwoFactorStatus() {
    return Api.auth().get("2fa/status");
  },
  // 2FA — TOTP. `2fa/verify` échange un pre-auth token (login sur un compte
  // déjà protégé) contre un code TOTP ou de secours.
  verifyTwoFactor(preAuthToken, code) {
    return Api.authWithToken(preAuthToken).post("2fa/verify", { code });
  },
  // `setupToken` n'est fourni que dans le parcours forcé (politique d'enforcement
  // dépassée, compte pas encore protégé) ; en configuration volontaire, la session
  // déjà active (Api.auth()) sert de credential. `stepUp` ({password, code?})
  // n'est requis que pour ajouter une seconde méthode (voir requireStepUpAuthenticationForAdditionalMethod
  // côté Auth) — absent pour un premier enrôlement.
  enableTwoFactor(setupToken = null, stepUp = null) {
    return setupToken
      ? Api.authWithToken(setupToken).post("2fa/totp/enable", stepUp ?? {})
      : Api.auth().post("2fa/totp/enable", stepUp ?? {});
  },
  confirmTwoFactor(code, setupToken = null) {
    return setupToken
      ? Api.authWithToken(setupToken).post("2fa/totp/confirm", { code })
      : Api.auth().post("2fa/totp/confirm", { code });
  },
  disableTwoFactor(password, code) {
    return Api.auth().post("2fa/totp/disable", { password, code });
  },
  regenerateTwoFactorRecoveryCodes(password, code) {
    return Api.auth().post("2fa/totp/recovery-codes", { password, code });
  },
  // 2FA — WebAuthn. Enregistrement (même logique setupToken/session/stepUp que TOTP).
  getWebauthnRegisterChallenge(setupToken = null, stepUp = null) {
    return setupToken
      ? Api.authWithToken(setupToken).post("2fa/webauthn/register/challenge", stepUp ?? {})
      : Api.auth().post("2fa/webauthn/register/challenge", stepUp ?? {});
  },
  verifyWebauthnRegistration(response, name, setupToken = null) {
    const payload = { response, name };
    return setupToken
      ? Api.authWithToken(setupToken).post("2fa/webauthn/register/verify", payload)
      : Api.auth().post("2fa/webauthn/register/verify", payload);
  },
  getWebauthnCredentials() {
    return Api.auth().get("2fa/webauthn/credentials");
  },
  deleteWebauthnCredential(id, password, code = null) {
    return Api.auth().delete("2fa/webauthn/credentials/" + id, { data: { password, code } });
  },
  // 2FA — WebAuthn, login (pre-auth token, comme verifyTwoFactor).
  getWebauthnLoginChallenge(preAuthToken) {
    return Api.authWithToken(preAuthToken).post("2fa/webauthn/challenge");
  },
  verifyWebauthnLogin(preAuthToken, response) {
    return Api.authWithToken(preAuthToken).post("2fa/webauthn/verify", { response });
  },
};

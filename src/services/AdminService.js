import Api from "/src/http/Request";

export default {
  addSis(sis) {
    return Api.auth().post("/admin/sis", sis);
  },
  editSis(sis) {
    return Api.auth().patch("/admin/sis/" + sis.id, sis);
  },
  getSis(sis) {
    return Api.auth().get("/admin/sis/" + sis.id);
  },
  getUserToken(userId) {
    return Api.auth().get("/admin/token", {
      params: { user_id: userId },
    });
  },
  addUserRole(userRole) {
    return Api.auth().post("/admin/user-roles", userRole);
  },
  removeUserRole(userRoleId) {
    return Api.auth().delete(`/admin/user-roles/${userRoleId}`);
  },
  removeSapeur(sapeurId) {
    return Api.auth().delete(`/admin/sapeurs/${sapeurId}`);
  },
  getAllUsers() {
    return Api.auth().get("/admin/users");
  },
  getAllSisContacts() {
    return Api.api().get("/sis-contacts-tous");
  },
  getAllSisParams() {
    return Api.api().get("/sis-params-tous");
  },
  getAllRoles() {
    return Api.auth().get("/admin/roles");
  },
  getUser(user) {
    return Api.auth().get("/admin/users/" + user.id);
  },
  editUser(user) {
    return Api.auth().patch("/admin/users/" + user.id, user);
  },
  deleteUser(userId) {
    return Api.auth().delete("/admin/users/" + userId);
  },
  getTwoFactorPolicy() {
    return Api.auth().get("/admin/2fa/policy");
  },
  updateTwoFactorPolicy(enforcedAt) {
    return Api.auth().put("/admin/2fa/policy", { enforcedAt });
  },
  getTwoFactorStats() {
    return Api.auth().get("/admin/2fa/stats");
  },
  grantTwoFactorExemption(userId, reason, until) {
    return Api.auth().post(`/admin/users/${userId}/2fa-exemption`, { reason, until });
  },
  revokeTwoFactorExemption(userId) {
    return Api.auth().delete(`/admin/users/${userId}/2fa-exemption`);
  },
  updateSessionPolicy(userId, maxDays) {
    return Api.auth().put(`/admin/users/${userId}/session-policy`, { max_days: maxDays });
  },
  revokeAllSessions(userId) {
    return Api.auth().delete(`/admin/users/${userId}/sessions`);
  },
};

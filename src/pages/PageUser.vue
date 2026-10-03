<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth";
import useNotification from "../composables/useNotification.js";
import { useModalStore } from "../stores/common/Modal";

const jeton = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const newPasswordRepeated = ref("");
const passwordChangeCode = ref("");
const errors = ref({});
const route = useRoute();
const tab = ref(route.query.tab === "2fa" ? "2fa" : "password");

const loading = ref(false);
const { showModal, confirm } = useModalStore();

const ajouter = () =>
  showModal({ component: "ModalApiToken", data: { totpActive: isTotpEnabled.value } });

const authStore = useAuthStore();
Promise.all([authStore.loadApiToken(), authStore.fetchPermissions()])
  .then(() => (loading.value = false))
  .catch(() => (loading.value = false));

const apiTokens = computed(() => authStore.apiTokens);

const isPasswordIdentical = computed(() => newPassword.value === newPasswordRepeated.value);
const awn = useNotification();

const refreshTokens = async () => {
  authStore
    .refreshToken()
    .then(() => awn.success("Permissions rechargées"))
    .catch(() => awn.alert("Vous avez été déconnecté, veuillez-vous reconnecter"));
};
const utiliserJeton = async () => {
  if (!jeton.value) {
    awn.alert("Jeton invalide");
  } else {
    authStore
      .useToken(jeton.value)
      .then((message) => {
        awn.success(message || "Jeton enregistré avec succès");
        jeton.value = "";
      })
      .catch((e) => awn.alert(e?.message || "Jeton déjà utilisé ou invalide."));
  }
};

const changerMotDePasse = async () => {
  errors.value.password = newPassword.value.length < 7;
  if (!isPasswordIdentical.value || errors.value.password) {
    return;
  }

  authStore
    .changePassword({
      password: oldPassword.value,
      newPassword: newPassword.value,
      code: isTotpEnabled.value ? passwordChangeCode.value : null,
    })
    .then((response) => {
      awn.success(response?.message || "Mot de passe mis à jour");
      oldPassword.value = "";
      newPassword.value = "";
      newPasswordRepeated.value = "";
      passwordChangeCode.value = "";
    })
    .catch((e) => awn.alert(e?.message || "Mot de passe incorrect"));
};

const deleteApiToken = async (id) => {
  if (
    await confirm(
      "Êtes-vous sûr de vouloir supprimer ce jeton d'API ?",
      "Attention, l'action est irréversible et un nouveau jeton d'API devra être recréé, les applications utilisant ce jeton perdront l'accès à l'API et devront être reconfigurées avec le nouveau jeton d'API.",
    )
  ) {
    authStore
      .deleteApiToken(id)
      .then(() => awn.success("Jeton d'API supprimé"))
      .catch(() => awn.alert("Erreur lors de la suppression du jeton d'API"));
  }
};

const revocationReasons = {
  password_reset: "réinitialisation du mot de passe",
};
const revocationLabel = (jeton) =>
  `Révoqué le ${new Date(jeton.revoked_at).toLocaleDateString("fr-CH")}` +
  (revocationReasons[jeton.revoked_reason]
    ? ` suite à une ${revocationReasons[jeton.revoked_reason]}`
    : "");

const rowClass = (jeton) => {
  if (jeton.revoked_at) {
    return "table-secondary";
  }
  if (new Date(jeton.expires_at) < new Date()) {
    return "table-danger";
  }
  // Si expiration dans moins de 7 jours
  if (new Date(jeton.expires_at) - new Date() <= 7 * 24 * 3600 * 1000) {
    return "table-warning";
  }
};

// 2FA
// `authStore.user.two_factor_enabled` dit seulement si au moins une méthode
// est active : le statut par méthode vient de 2fa/status (voir
// loadTwoFactorInfo).
const twoFactorMethods = ref([]);
const isTwoFactorEnabled = computed(() => twoFactorMethods.value.length > 0);
const isTotpEnabled = computed(() => twoFactorMethods.value.includes("totp"));
const isWebauthnEnabled = computed(() => twoFactorMethods.value.includes("webauthn"));
const hasBothMethods = computed(() => isTotpEnabled.value && isWebauthnEnabled.value);

const loadTwoFactorInfo = async () => {
  const status = await authStore.loadTwoFactorStatus();
  twoFactorMethods.value = status.availableMethods ?? [];
};
loadTwoFactorInfo();

// Toutes les actions 2FA (activer, ajouter un second moyen, désactiver le
// TOTP, régénérer les codes de secours) passent par une modale plutôt que
// des formulaires inline : plus simple pour quelqu'un qui découvre ces
// notions, et cohérent avec le reste de l'app (ex. "Ajouter" un jeton d'API).
const openChooseMethodModal = () =>
  showModal({
    component: "ModalChooseTwoFactorMethod",
    data: {
      excludeMethods: twoFactorMethods.value,
      // Tout enrôlement volontaire exige le mot de passe (seul le parcours
      // forcé au login en est dispensé, voir TwoFactorForcedSetup).
      requiresStepUp: true,
      totpActive: isTotpEnabled.value,
    },
    // La méthode choisie peut être WebAuthn (y compris pour le tout premier
    // enrôlement) : il faut aussi recharger la liste des clés, sinon le
    // tableau reste vide jusqu'au prochain rechargement de page.
    callback: () => Promise.all([loadTwoFactorInfo(), loadWebauthnCredentials()]),
  });

const openRegenerateRecoveryCodesModal = () =>
  showModal({
    component: "ModalRegenerateRecoveryCodes",
    data: { totpActive: isTotpEnabled.value },
  });

const openDisableTotpModal = () =>
  showModal({
    component: "ModalDisableTotp",
    callback: () => {
      awn.success("Application d'authentification désactivée");
      return loadTwoFactorInfo();
    },
  });

// 2FA — WebAuthn
const webauthnCredentials = ref([]);
const webauthnLoading = ref(true);

const loadWebauthnCredentials = async () => {
  webauthnLoading.value = true;
  try {
    webauthnCredentials.value = await authStore.loadWebauthnCredentials();
  } finally {
    webauthnLoading.value = false;
  }
};
loadWebauthnCredentials();

const openAddWebauthnKeyModal = () =>
  showModal({
    component: "ModalAddWebauthnKey",
    // Ajout direct d'une clé alors que WebAuthn est déjà la méthode active
    // (clé supplémentaire) : 2FA forcément déjà activé ici.
    data: { requiresStepUp: true, totpActive: isTotpEnabled.value },
    callback: () => {
      awn.success("Clé de sécurité ajoutée");
      return Promise.all([loadTwoFactorInfo(), loadWebauthnCredentials()]);
    },
  });

const deleteWebauthnKey = (credential) =>
  showModal({
    component: "ModalDeleteWebauthnKey",
    data: { credential, totpActive: isTotpEnabled.value },
    callback: () => {
      awn.success("Clé de sécurité supprimée");
      return Promise.all([loadTwoFactorInfo(), loadWebauthnCredentials()]);
    },
  });

const webauthnFields = [
  { title: "Nom", key: "name" },
  { title: "Ajoutée le", key: "created_at", type: Date },
  { title: "Dernière utilisation", key: "last_used_at", type: "datetime" },
  { title: "Actions", key: "id", slot: "actions" },
];

// Sessions actives (refresh tokens) : appareils sur lesquels le compte est
// resté connecté, avec la possibilité d'en déconnecter un précisément (ex.
// poste public oublié, appareil perdu) sans devoir changer son mot de passe.
const sessions = ref([]);
const sessionsLoading = ref(true);

const loadSessions = async () => {
  sessionsLoading.value = true;
  try {
    sessions.value = await authStore.loadSessions();
  } finally {
    sessionsLoading.value = false;
  }
};
loadSessions();

const deleteSession = (session) =>
  confirm(
    "Voulez-vous vraiment déconnecter cette session ?",
    "L'appareil devra se reconnecter avec son mot de passe (et le 2FA si actif).",
  ).then(() =>
    authStore
      .deleteSession(session.id)
      .then(() => {
        awn.success("Session déconnectée");
        return loadSessions();
      })
      .catch((e) => awn.alert(e?.message || "Erreur lors de la déconnexion")),
  );

const sessionFields = [
  { title: "Appareil", key: "user_agent", slot: "appareil" },
  { title: "Adresse IP", key: "ip_address" },
  { title: "Se souvenir de moi", key: "remember", type: Boolean },
  { title: "Connecté le", key: "created_at", type: Date },
  // Mise à jour à chaque renouvellement de l'accès (environ toutes les 8 h),
  // pas à chaque requête.
  { title: "Dernier renouvellement", key: "last_used_at", type: "datetime" },
  { title: "Actions", key: "id", slot: "actions" },
];

const fields = [
  { title: "Nom", key: "name" },
  { title: "Description", key: "description" },
  { title: "Créé le", key: "created_at", type: Date },
  { title: "Dernière utilisation", key: "last_used_at", type: "datetime" },
  { title: "Expire le", key: "expires_at", type: Date },
  { title: "Statut", key: "revoked_at", slot: "statut" },
  { title: "Actions", key: "id", slot: "actions" },
];
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Paramètres utilisateur</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12 col-xl-3 mb-2">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Paramètres</h3>
          </div>
          <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
            <a
              class="nav-link"
              :class="{ active: tab === 'password' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'password'"
              >Mot de passe</a
            >
            <a
              class="nav-link"
              :class="{ active: tab === '2fa' }"
              href="#"
              role="tab"
              @click.prevent="tab = '2fa'"
              >Double authentification</a
            >
            <a
              class="nav-link"
              :class="{ active: tab === 'sessions' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'sessions'"
              >Sessions actives</a
            >
            <a
              class="nav-link"
              :class="{ active: tab === 'permissions' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'permissions'"
              >Permissions</a
            >
            <a
              class="nav-link"
              :class="{ active: tab === 'api-tokens' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'api-tokens'"
              >Jetons d'API</a
            >
          </nav>
        </div>
      </div>
      <div class="col-sm-12 col-xl-9">
        <form v-if="tab == 'password'" @submit="changerMotDePasse">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h3>Changer mon mot de passe</h3>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="old-password">Ancien mot de passe</label>
                <input
                  id="old-password"
                  v-model="oldPassword"
                  type="password"
                  placeholder="mot de passe"
                  required
                  autocomplete="off"
                  class="form-control form-control-sm"
                />
              </div>
              <div class="mb-3">
                <label for="new-password">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  v-model="newPassword"
                  type="password"
                  placeholder="mot de passe"
                  minlength="12"
                  required
                  autocomplete="off"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors.password }"
                />
                <div v-if="errors.password" class="invalid-feedback">Taille minimum: 12</div>
              </div>

              <div class="mb-3">
                <label for="new-password-repeated">Répéter le nouveau mot de passe</label>
                <input
                  id="newPasswordRepeated"
                  v-model="newPasswordRepeated"
                  type="password"
                  minlength="12"
                  placeholder="répéter mot de passe"
                  required
                  autocomplete="off"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': !isPasswordIdentical }"
                />
                <div v-if="!isPasswordIdentical" class="invalid-feedback">
                  Mot de passe différent
                </div>
              </div>
              <div v-if="isTotpEnabled" class="mb-3">
                <label for="password-change-code"
                  >Code de votre application d'authentification</label
                >
                <input
                  id="password-change-code"
                  v-model="passwordChangeCode"
                  type="text"
                  autocomplete="one-time-code"
                  autocapitalize="off"
                  placeholder="123456 ou code de secours"
                  required
                  class="form-control form-control-sm"
                />
              </div>
              <button class="btn btn-primary" @click="submit">Changer</button>
            </div>
          </div>
        </form>

        <form v-if="tab == 'permissions'" @submit="utiliserJeton">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h3>Utiliser un jeton de permissions</h3>
              <!-- TODO: afficher les permissions de l'utilisateur -->
              <!-- TODO: améliorer cet UI -->
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="jeton">Jeton</label>
                <input
                  id="jeton"
                  v-model="jeton"
                  type="text"
                  required
                  class="form-control form-control-sm"
                  placeholder="jeton"
                />
              </div>
              <button class="btn btn-primary" submit>Utiliser</button>
            </div>
          </div>
        </form>
        <div v-if="tab == 'permissions'" class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Recharger mes permissions</h3>
          </div>
          <div class="card-body">
            <button class="btn btn-primary" @click="refreshTokens">Charger</button>
          </div>
        </div>

        <div v-if="tab == 'api-tokens'" class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Jetons d'APIs</h3>
            <button
              class="btn btn-outline-primary"
              :disabled="!isTwoFactorEnabled"
              @click="ajouter"
            >
              Ajouter
            </button>
          </div>
          <p class="text-body-secondary px-3 pt-3 mb-0">
            Des jetons pour accéder à l'API de GestSIS depuis un script ou une intégration externe —
            pas pour se connecter à l'application elle-même.
          </p>
          <p v-if="!isTwoFactorEnabled" class="text-body-secondary px-3 pt-2 mb-0">
            Activez la double authentification (onglet « Double authentification ») pour pouvoir
            créer un jeton.
          </p>
          <div class="card-body table-responsive p-0">
            <base-table
              :fields="fields"
              :data="apiTokens"
              :loading="loading"
              no-data="Aucun jeton d'API"
              :selectable="true"
              :row-class="rowClass"
            >
              <template #statut="{ rowData }">
                <span
                  v-if="rowData.revoked_at"
                  class="badge bg-danger"
                  :title="revocationLabel(rowData)"
                >
                  {{ revocationLabel(rowData) }}
                </span>
                <span
                  v-else-if="new Date(rowData.expires_at) < new Date()"
                  class="badge bg-secondary"
                >
                  Expiré
                </span>
                <span v-else class="badge bg-success">Actif</span>
              </template>
              <template #actions="{ rowData }">
                <button class="btn btn-sm btn-outline-danger" @click="deleteApiToken(rowData.id)">
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>

        <div v-if="tab == '2fa'" class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Double authentification</h3>
          </div>
          <div class="card-body">
            <p class="text-body-secondary">
              La double authentification ajoute une étape de vérification à la connexion, en plus de
              votre mot de passe : même si quelqu'un devine ou vole votre mot de passe, il ne pourra
              pas se connecter sans cette seconde preuve d'identité.
            </p>
            <p>
              Statut :
              <span v-if="isTwoFactorEnabled" class="badge bg-success">Activé</span>
              <span v-else class="badge bg-secondary">Désactivé</span>
            </p>

            <button
              v-if="!isTwoFactorEnabled"
              class="btn btn-primary"
              @click="openChooseMethodModal"
            >
              Activer
            </button>

            <template v-else>
              <ul class="list-group mb-3">
                <li
                  v-if="isTotpEnabled"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>Application d'authentification</strong>
                    <div class="small text-body-secondary">
                      Code à 6 chiffres généré par votre téléphone
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline-danger" @click="openDisableTotpModal">
                    Désactiver
                  </button>
                </li>
                <li v-if="isWebauthnEnabled" class="list-group-item">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>Clés de sécurité</strong>
                      <div class="small text-body-secondary">
                        Clé USB, Touch ID, Windows Hello, passkey, …
                      </div>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" @click="openAddWebauthnKeyModal">
                      Ajouter une clé
                    </button>
                  </div>
                  <base-table
                    :fields="webauthnFields"
                    :data="webauthnCredentials"
                    :loading="webauthnLoading"
                    :hide-download="true"
                    no-data="Aucune clé de sécurité enregistrée"
                  >
                    <template #actions="{ rowData }">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteWebauthnKey(rowData)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </template>
                  </base-table>
                </li>
              </ul>

              <button
                v-if="!hasBothMethods"
                class="btn btn-outline-primary me-2"
                @click="openChooseMethodModal"
              >
                Ajouter un second moyen d'authentification
              </button>
              <button class="btn btn-outline-secondary" @click="openRegenerateRecoveryCodesModal">
                Régénérer les codes de secours
              </button>
            </template>
          </div>
        </div>

        <div v-if="tab == 'sessions'" class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Sessions actives</h3>
          </div>
          <p class="text-body-secondary px-3 pt-3 mb-0">
            Les appareils sur lesquels votre compte est resté connecté. Déconnectez-en un si vous ne
            le reconnaissez pas ou s'il s'agit d'un poste public.
          </p>
          <div class="card-body table-responsive p-0">
            <base-table
              :fields="sessionFields"
              :data="sessions"
              :loading="sessionsLoading"
              :hide-download="true"
              no-data="Aucune session active"
            >
              <template #appareil="{ rowData }">
                {{ rowData.user_agent }}
                <span v-if="rowData.current" class="badge bg-primary ms-1">Cet appareil</span>
              </template>
              <template #actions="{ rowData }">
                <!-- Session courante : se déconnecter via le menu, pas depuis cette liste. -->
                <button
                  v-if="!rowData.current"
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteSession(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--
    TODO: Fonctionalitées pour le future
    - Demander un renvoi de la confirmation de l'email si pas validé
    - Supprimer ses accès pour un SIS
    - Changer son email
    - Supprimer son compte
    - Contrôler ses données et signaler des changements -- Autre interface peut-être
  -->
</template>

<style>
.m-td-0 > td {
  padding: 0 !important;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>

import { defineStore } from "pinia";
import { nextTick } from "vue";
import * as Sentry from "@sentry/vue";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { translateWebauthnError } from "../../tools/webauthnErrors.js";
import AuthService from "../../services/AuthService";
import AdminService from "../../services/AdminService";
import { TokenService } from "../../services/StorageService";
import { jwtDecode } from "jwt-decode";
import router from "../../router";
import Api from "../../http/Request";

// Import all stores for cache clearing on SIS selection
import { useArticleStore } from "../materiel/Article";
import { useMaterielCategorieStore } from "../materiel/Categorie";
import { useMaterielTypeStore } from "../materiel/Type";
import { useCouleurStore } from "../materiel/Couleur";
import { useBatterieTypeStore } from "../materiel/BatterieType";
import { useEmplacementStore } from "../materiel/Emplacement";
import { useTuyauDiametreStore } from "../materiel/TuyauDiametre";
import { useUniteStore } from "../common/Unite";
import { useAspsmsParamStore } from "../sms/AspsmsParam";
import { useAvsParamStore } from "../comptabilite/AvsParam";
import { useAbsenceParamStore } from "../absence/AbsenceParam";
import { useConvocationParamStore } from "../exercice/ConvocationParam";
import { useSisParamStore } from "../params/SisParam";
import { useExcuseParamStore } from "../exercice/ExcuseParam";
import { useMedecinStore } from "../controleMedical/Medecin";
import { useControleMedicalTypeStore } from "../controleMedical/ControleMedicalType";
import { useControleMedicalStore } from "../controleMedical/ControleMedical";
import { useInterventionStore } from "../intervention/Intervention";
import { useInterventionTraitementStore } from "../intervention/InterventionTraitement";
import { useMaterielStore } from "../intervention/Materiel";
import { useMissionStore } from "../intervention/Mission";
import { usePhaseTypeStore } from "../intervention/PhaseType";
import { useStatFederalStore } from "../intervention/StatFederal";
import { useStatInterventionStore } from "../intervention/StatIntervention";
import { useTypeInterventionStore } from "../intervention/TypeIntervention";
import { useVehiculeStore } from "../intervention/Vehicule";
import { useExerciceStore } from "../exercice/Exercice";
import { useExcuseTypeStore } from "../exercice/ExcuseType";
import { useExerciceCategorieStore } from "../exercice/ExerciceCategorie";
import { useHeureExerciceStore } from "../exercice/HeureExercice";
import { useAmendeStore } from "../comptabilite/Amende";
import { useCompteStore } from "../comptabilite/Compte";
import { useEcritureCategorieStore } from "../comptabilite/EcritureCategorie";
import { useExerciceComptableStore } from "../comptabilite/ExerciceComptable";
import { useImputationStore } from "../comptabilite/Imputation";
import { useDecompteStore } from "../comptabilite/Decompte";
import { useSapeurStore } from "../sapeur/Sapeur";
import { useCoursStore } from "../sapeur/Cours";
import { useFonctionStore } from "../sapeur/Fonction";
import { useGradeStore } from "../sapeur/Grade";
import { useRtaStore } from "../rta/Rta";
import { useAbsenceStore } from "../absence/Absence";
import { useTelephoneStore } from "../sapeur/Telephone";
import { useCoursSapeurStore } from "../sapeur/CoursSapeur";
import { useTravailStore } from "../travail/Travail";
import { useTravailTypeStore } from "../travail/TravailType";
import { useGroupeStore } from "../groupe/Groupe";
import { useStatistiqueStore } from "../statistique/Statistique";
import { useLocaliteStore } from "../common/Localite";
import { useBaseDataStore } from "../common/BaseData";
import { useMesInfosStore } from "../mesinfos/MesInfos";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: TokenService.getUser() || null,
    email: null,
    admin: false,
    validated: false,
    sapeurId: null,
    refreshTokenPromise: null,
    permissions: [],
    roles: [],
    apiTokens: [],
    users: [],
    impersonating: !!TokenService.getAdminAccessToken(),
    // 2FA — au plus un des deux est non-null à la fois : `twoFactorChallenge`
    // (compte déjà protégé, en attente du code) ou `twoFactorSetupToken`
    // (parcours forcé par la politique d'enforcement, compte pas encore protégé).
    twoFactorChallenge: null,
    twoFactorSetupToken: null,
    // Méthodes 2FA actives sur le compte, renvoyées avec le pre-auth token —
    // permet au front de proposer un choix quand plusieurs sont disponibles.
    twoFactorAvailableMethods: [],
    // Présent tant que le compte n'a pas activé le 2FA et que la politique n'est
    // pas encore obligatoire (période de grâce) : alimente le bandeau d'incitation.
    twoFactorNudge: null,
    sis: {
      activeId: null,
      activeKey: null,
      sapeurs: {},
      liste: [],
      permissions: [],
      available: [],
      allPermissions: {},
    },
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    availableSisListe: (state) => {
      return state.sis.liste
        .filter((sis) => state.sis.available.includes(sis.api_key))
        .sort((s1, s2) => s1.nom.localeCompare(s2.nom));
    },
  },
  actions: {
    // Résout vers les données de connexion complètes (comme avant) quand le
    // compte n'a pas de 2FA, ou vers `{ requiresTwoFactor: true }` /
    // `{ requiresTwoFactorSetup: true }` sinon — l'appelant (PageLogin) doit
    // alors afficher l'étape suivante plutôt que de considérer la connexion terminée.
    async login(payload) {
      const data = await AuthService.login(payload);

      if (data.requiresTwoFactor) {
        this.twoFactorChallenge = data.preAuthToken;
        this.twoFactorAvailableMethods = data.availableMethods ?? ["totp"];
        return { requiresTwoFactor: true };
      }
      if (data.requiresTwoFactorSetup) {
        this.twoFactorSetupToken = data.setupToken;
        return { requiresTwoFactorSetup: true };
      }

      await this.setAuthSuccessful(data);
      return data;
    },
    async verifyTwoFactor(code) {
      const data = await AuthService.verifyTwoFactor(this.twoFactorChallenge, code);
      this.twoFactorChallenge = null;
      await this.setAuthSuccessful(data);
      return data;
    },
    cancelTwoFactorChallenge() {
      this.twoFactorChallenge = null;
      this.twoFactorSetupToken = null;
    },
    // Même endpoint côté API pour les deux parcours (volontaire vs forcé) : le
    // jeton à présenter dépend uniquement de l'état courant du store. `stepUp`
    // ({password, code?}) n'est nécessaire que pour ajouter une seconde
    // méthode — jamais en parcours forcé (rien n'est encore actif alors).
    async enableTwoFactor(stepUp = null) {
      return AuthService.enableTwoFactor(this.twoFactorSetupToken, stepUp);
    },
    async confirmTwoFactor(code) {
      const data = await AuthService.confirmTwoFactor(code, this.twoFactorSetupToken);

      if (this.twoFactorSetupToken) {
        // Parcours forcé : aucune session valide n'existait encore, cette
        // confirmation la crée (accessToken/refreshToken/user inclus).
        this.twoFactorSetupToken = null;
        await this.setAuthSuccessful(data);
      } else {
        // Parcours volontaire : la session ne change pas, seul le statut 2FA
        // affiché du compte doit refléter l'activation.
        await this.loadTwoFactorStatus();
      }

      return data;
    },
    async disableTwoFactor(password, code) {
      const data = await AuthService.disableTwoFactor(password, code);
      // Ne pas supposer que désactiver le TOTP désactive tout le 2FA : une
      // méthode WebAuthn peut rester active sur le compte. loadTwoFactorStatus()
      // relit l'état réel plutôt que de deviner côté front.
      await this.loadTwoFactorStatus();
      return data;
    },
    async regenerateTwoFactorRecoveryCodes(password, code) {
      return AuthService.regenerateTwoFactorRecoveryCodes(password, code);
    },
    // Statut 2FA toutes méthodes confondues (voir TwoFactorStatusController
    // côté Auth) : `user.two_factor_enabled` est recalé ici depuis la source de
    // vérité serveur plutôt que deviné après chaque action 2FA.
    async loadTwoFactorStatus() {
      const data = await AuthService.getTwoFactorStatus();
      if (this.user) {
        this.user = { ...this.user, two_factor_enabled: data.enabled };
        TokenService.saveUser(this.user);
      }
      return data;
    },
    // WebAuthn — enregistrement. `startRegistration`/`startAuthentication`
    // (@simplewebauthn/browser) pilotent navigator.credentials et gèrent tout
    // l'encodage base64url/ArrayBuffer attendu par le navigateur.
    async registerWebauthnCredential(name, stepUp = null) {
      const options = await AuthService.getWebauthnRegisterChallenge(
        this.twoFactorSetupToken,
        stepUp,
      );
      let response;
      try {
        response = await startRegistration({ optionsJSON: options });
      } catch (err) {
        // Erreur navigateur (annulation, refus, timeout...), pas l'API — message
        // natif souvent en anglais, retraduit plutôt que remonté tel quel.
        throw new Error(translateWebauthnError(err));
      }
      const data = await AuthService.verifyWebauthnRegistration(
        response,
        name,
        this.twoFactorSetupToken,
      );

      if (this.twoFactorSetupToken) {
        this.twoFactorSetupToken = null;
        await this.setAuthSuccessful(data);
      } else {
        await this.loadTwoFactorStatus();
      }

      return data;
    },
    async loadWebauthnCredentials() {
      return AuthService.getWebauthnCredentials();
    },
    async loadSessions() {
      return AuthService.getSessions();
    },
    async deleteSession(id) {
      return AuthService.deleteSession(id);
    },
    async deleteWebauthnCredential(id, password, code = null) {
      await AuthService.deleteWebauthnCredential(id, password, code);
      await this.loadTwoFactorStatus();
    },
    // WebAuthn — login. Le pre-auth token joue le même rôle que pour verifyTwoFactor.
    async verifyWebauthnLogin() {
      const options = await AuthService.getWebauthnLoginChallenge(this.twoFactorChallenge);
      let response;
      try {
        response = await startAuthentication({ optionsJSON: options });
      } catch (err) {
        throw new Error(translateWebauthnError(err));
      }
      const data = await AuthService.verifyWebauthnLogin(this.twoFactorChallenge, response);
      this.twoFactorChallenge = null;
      await this.setAuthSuccessful(data);
      return data;
    },
    // Résout vers `{ requiresEmailConfirmation: true, email }` : l'inscription
    // n'émet plus de session tant que l'email n'est pas confirmé (voir
    // confirmRegistrationEmail). L'appelant (PageRegister) doit alors afficher
    // l'étape de saisie du code plutôt que de considérer l'inscription terminée.
    async register(credentials) {
      const data = await AuthService.register(credentials);
      return data;
    },
    // Résout comme login()/verifyTwoFactor() : session complète, ou
    // `{ requiresTwoFactorSetup: true }` si l'enforcement est actif (le compte
    // vient d'être créé, il n'a donc jamais encore pu configurer de 2FA).
    async confirmRegistrationEmail(email, code) {
      const data = await AuthService.confirmRegistrationEmail(email, code);

      if (data.requiresTwoFactorSetup) {
        this.twoFactorSetupToken = data.setupToken;
        return { requiresTwoFactorSetup: true };
      }

      await this.setAuthSuccessful(data);
      return data;
    },
    async forgottenPassword(email) {
      return AuthService.forgottenPassword(email);
    },
    async resetPassword({ token, password }) {
      return AuthService.resetPassword(token, password);
    },
    // `code` : exigé par Auth si le TOTP est actif sur le compte (sinon ignoré).
    async changePassword({ password, newPassword, code = null }) {
      return AuthService.changePassword({
        email: this.email,
        password: password,
        new_password: newPassword,
        ...(code ? { code } : {}),
      });
    },
    // Révoque le refresh token côté serveur (sans attendre la réponse : la
    // déconnexion locale ne dépend pas du réseau). Sans ça, "se déconnecter" ne
    // faisait que vider le stockage local, le refresh token restait valide côté
    // serveur jusqu'à son expiration.
    // Redirige ensuite vers /login avant de vider les stores : si on les vidait avec
    // la page encore montée, ses watchers relanceraient leurs requêtes sans Sis-Key
    // (401 « Sis non sélectionné » non intercepté, voir GESTSIS_APP-50).
    async logout(redirect) {
      const refreshToken = TokenService.getRefreshToken();
      if (refreshToken) {
        AuthService.logout(refreshToken).catch(() => {});
      }

      TokenService.removeAccessToken();
      TokenService.removeRefreshToken();
      TokenService.removeUser();
      // Session admin mise de côté pendant une usurpation : sans cette purge, le
      // prochain utilisateur du poste pourrait la restaurer via stopImpersonation().
      TokenService.removeAdminAccessToken();
      TokenService.removeAdminUser();
      TokenService.removeTwoFactorNudge();
      this.impersonating = false;
      Api.setAccessToken("");
      Api.setSisKey(null);

      // Tokens retirés : le guard du routeur autorise désormais /login
      await router.push({ name: "login", query: redirect ? { redirect } : undefined });
      // Laisse le rendu démonter l'ancienne page avant de toucher aux stores
      await nextTick();

      this.user = null;
      this.email = null;
      this.admin = false;
      this.validated = false;
      this.sapeurId = null;
      this.sis.activeId = null;
      this.sis.activeKey = null;
      this.sis.permissions = [];
      this.sis.available = [];
      this.sis.allPermissions = {};
      this.sis.sapeurs = {};
      this.twoFactorChallenge = null;
      this.twoFactorSetupToken = null;
      this.twoFactorNudge = null;

      // Clear roles/users/apiTokens and every domain-store cache so the next
      // user on this tab cannot see the previous user's data. The global
      // `permissions` catalog is user- and SIS-independent, so it is kept.
      this.clearCache();

      Sentry.setUser(null);
      Sentry.setTag("sis_key", null);
    },
    async useToken(token) {
      // Success responses no longer carry a `message` field (harmonized envelope,
      // see http/Request.js) — the caller (PageUser.vue) already falls back to a
      // default success text when nothing is returned here.
      const { accessToken } = await AuthService.useToken(token);
      await this.setAuthSuccessful({
        accessToken,
        refreshToken: TokenService.getRefreshToken(),
        user: TokenService.getUser(),
      });
    },
    async impersonate(userId) {
      if (userId === this.user?.id) {
        throw new Error("Vous ne pouvez pas usurper votre propre identité.");
      }

      const [{ accessToken }, targetUser] = await Promise.all([
        AdminService.getUserToken(userId),
        AdminService.getUser({ id: userId }),
      ]);

      // Le refresh token n'est pas touché : `admin/token` n'en fournit pas
      // pour la cible, et garder celui de l'admin sert de filet de sécurité
      // (si le token usurpé expire, le flux de refresh existant réémettra
      // silencieusement un token admin, ce qui termine l'usurpation).
      TokenService.saveAdminAccessToken(TokenService.getAccessToken());
      TokenService.saveAdminUser(TokenService.getUser());
      this.impersonating = true;

      this.clearCache();
      await this.setAuthSuccessful({
        accessToken,
        refreshToken: TokenService.getRefreshToken(),
        user: targetUser,
        twoFactorNudge: null,
      });
    },
    async stopImpersonation() {
      const adminAccessToken = TokenService.getAdminAccessToken();
      if (!adminAccessToken) {
        return;
      }
      const adminUser = TokenService.getAdminUser();

      TokenService.removeAdminAccessToken();
      TokenService.removeAdminUser();
      this.impersonating = false;

      this.clearCache();
      await this.setAuthSuccessful({
        accessToken: adminAccessToken,
        refreshToken: TokenService.getRefreshToken(),
        user: adminUser,
      });
    },
    async selectSis(sis) {
      this.sis.activeId = sis?.id;
      this.sis.activeKey = sis?.api_key;
      this.sis.permissions = this.sis.allPermissions[sis?.api_key] ?? [];
      this.sapeurId = this.sis.sapeurs[sis?.api_key] ?? null;

      Sentry.setTag("sis_key", this.sis.activeKey ?? null);

      Api.setSisKey(sis?.api_key);

      // Clear before fetching: the other way around, the freshly fetched
      // localités would be wiped immediately by the reset
      this.clearCache();

      await this.fetchLocalitesSis();
    },
    async loadSisListe() {
      if (this.sis.liste.length <= 0) {
        const sis = await AuthService.sisListe();
        this.sis.liste = sis;
        return sis;
      }
      return Promise.resolve();
    },
    async newRegisterToken(token) {
      return AuthService.newRegisterToken(token);
    },
    async updateUserRoles(user) {
      const data = await AuthService.updateUserRoles(user);
      this.users = this.users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            user_roles: data,
          };
        }
        return u;
      });
      return data;
    },
    async updateRole(role) {
      const result = await AuthService.updateRole(role);
      this.roles = this.roles.map((r) => {
        if (r.id === role.id) {
          return result;
        }
        return r;
      });
      return result;
    },
    async createRole(role) {
      const result = await AuthService.createRole(role);
      this.roles.push(result);
      return result;
    },
    async deleteRole(roleId) {
      await AuthService.deleteRole(roleId);
      this.roles = this.roles.filter((r) => r.id !== roleId);
    },
    async loadApiToken() {
      const result = await AuthService.getApiTokens();
      this.apiTokens = result;
      return result;
    },
    async createApiToken(apiToken) {
      const result = await AuthService.createApiToken(apiToken);
      this.apiTokens.push(result);
      return result;
    },
    async deleteApiToken(apiTokenId) {
      const result = await AuthService.deleteApiToken(apiTokenId);
      this.apiTokens = this.apiTokens.filter((t) => t.id !== apiTokenId);
      return result;
    },
    // `redirectPath` surcharge la page vers laquelle revenir après connexion : au
    // chargement de la page (voir verifySession), la navigation ciblée n'est pas
    // encore reflétée par `router.currentRoute`, donc l'appelant doit la fournir
    // explicitement plutôt que de laisser le catch déduire une destination obsolète.
    async refreshToken(redirectPath = null) {
      if (this.refreshTokenPromise) {
        return this.refreshTokenPromise;
      }

      const callback = async () => {
        try {
          if (this.sis.liste.length === 0) {
            const sis = await AuthService.sisListe();
            this.sis.liste = sis;
          }
          const data = await AuthService.refreshToken(TokenService.getRefreshToken());
          if (this.impersonating) {
            // Le refresh token est celui de l'admin : le jeton d'usurpation
            // (1 h, sans refresh) a expiré et c'est une session admin qui
            // revient. L'usurpation est terminée — sans ce nettoyage, l'UI la
            // croyait encore active et « Arrêter » restaurait un jeton périmé.
            TokenService.removeAdminAccessToken();
            TokenService.removeAdminUser();
            this.impersonating = false;
            this.clearCache();
          }
          await this.setAuthSuccessful(data);
          return data;
        } catch (e) {
          const current = router.currentRoute.value;
          const redirect =
            redirectPath ?? (current.name !== "login" ? current.fullPath : undefined);
          await this.logout(redirect);
          throw e;
        } finally {
          this.refreshTokenPromise = null;
        }
      };

      // Assign synchronously so concurrent 401s share a single refresh request
      this.refreshTokenPromise = callback();
      return this.refreshTokenPromise;
    },
    // `redirectPath` est le `to.fullPath` de la navigation en cours (fourni par le
    // guard de main.js) : en cas d'échec, refreshToken() redirige vers cette page
    // plutôt que vers l'accueil.
    async verifySession(redirectPath) {
      const refreshToken = TokenService.getRefreshToken();

      if (refreshToken === null) {
        // Pas de session à restaurer : un échec ici (service auth indisponible,
        // erreur réseau) ne doit pas bloquer toutes les navigations, /login compris.
        try {
          await this.loadSisListe();
        } catch (e) {
          console.error(
            "Échec de l'initialisation de l'authentification, navigation sans session",
            e,
          );
        }
        return;
      }

      const accessToken = TokenService.getAccessToken();
      if (accessToken !== null) {
        await this.setAuthSuccessful({
          user: TokenService.getUser(),
          accessToken,
          refreshToken,
        });
        try {
          await AuthService.me();
          return; // Token encore valide côté serveur
        } catch (e) {
          // Access token périmé ou révoqué : on retente via le refresh token ci-dessous
        }
      }

      // Un onglet resté ouvert puis rechargé peut porter un access token périmé (ou
      // révoqué côté serveur) : on le renouvelle avant de laisser la page ciblée
      // démarrer, plutôt que de la laisser échouer sur ses propres appels API.
      // En cas d'échec, refreshToken() fait déjà logout() + redirection vers /login,
      // et propage l'erreur pour que l'appelant coupe la navigation en cours.
      await this.refreshToken(redirectPath);
    },
    async resendValidationEmail(email) {
      return AuthService.resendValidationEmail(email ?? this.email);
    },
    async fetchPermissions() {
      if (this.permissions.length > 0) {
        return Promise.resolve();
      }
      const data = await AuthService.getPermissions();
      this.permissions = data;
      return data;
    },
    async fetchRoles() {
      if (this.roles.length > 0) {
        return Promise.resolve();
      }
      const data = await AuthService.getRoles();
      this.roles = data;
      return data;
    },
    async fetchUsers() {
      const users = await AuthService.getUsers();
      this.users = users;
      return users;
    },
    async fetchLocalitesSis() {
      const localiteStore = useLocaliteStore();
      return localiteStore.fetchLocalites();
    },
    // Internal methods
    async setAuthSuccessful(data) {
      this.user = data.user;
      Sentry.setUser(this.user ? { id: this.user.id } : null);

      TokenService.saveAccessToken(data.accessToken);
      TokenService.saveRefreshToken(data.refreshToken);
      TokenService.saveUser(data.user);
      Api.setAccessToken(data.accessToken);

      const jwt = jwtDecode(data.accessToken);

      const permissionsParSis = jwt.data.permissions ?? {};
      const sapeurParSis = jwt.data.sapeurs ?? {};
      const availableSis = [
        ...new Set([...Object.keys(permissionsParSis), ...Object.keys(sapeurParSis)]),
      ];

      this.email = jwt.data.email;
      this.admin = jwt.data.admin;
      this.validated = jwt.data.validated;
      // Présent (éventuellement null) dans les réponses login/refresh ; absent
      // quand la session est restaurée depuis le stockage (rechargement de page)
      // ou juste rééchangée (useToken) : on garde alors la dernière valeur connue.
      if ("twoFactorNudge" in data) {
        this.twoFactorNudge = data.twoFactorNudge ?? null;
        TokenService.saveTwoFactorNudge(this.twoFactorNudge);
      } else {
        this.twoFactorNudge = TokenService.getTwoFactorNudge();
      }

      this.sis.sapeurs = sapeurParSis;
      this.sis.available = availableSis;

      if (availableSis.length > 0) {
        let sisKey = availableSis[0];
        if (availableSis.find((v) => v === this.sis.activeKey)) {
          sisKey = this.sis.activeKey;
        } else if (Object.keys(sapeurParSis).length) {
          sisKey = Object.keys(sapeurParSis)[0];
        }

        await this.loadSisListe();
        const sis = this.sis.liste.find((s) => s.api_key === sisKey);
        if (!sis) return;
        this.sis.activeId = sis.id;
        this.sis.activeKey = sis.api_key;
        this.sis.permissions = permissionsParSis[sis.api_key] ?? [];
        this.sis.allPermissions = permissionsParSis;
        this.sapeurId = sapeurParSis[sis.api_key] ?? null;
        Sentry.setTag("sis_key", this.sis.activeKey);
        Api.setSisKey(sis.api_key);
      }
    },
    clearCache() {
      this.roles = [];
      this.users = [];
      this.apiTokens = [];

      // Reset materiel stores
      useArticleStore().$reset();
      useMaterielCategorieStore().$reset();
      useMaterielTypeStore().$reset();
      useCouleurStore().$reset();
      useBatterieTypeStore().$reset();
      useEmplacementStore().$reset();
      useTuyauDiametreStore().$reset();
      useUniteStore().$reset();

      // Reset param stores
      useAspsmsParamStore().$reset();
      useAvsParamStore().$reset();
      useAbsenceParamStore().$reset();
      useConvocationParamStore().$reset();
      useSisParamStore().$reset();
      useExcuseParamStore().$reset();

      // Reset controle medical stores
      useMedecinStore().$reset();
      useControleMedicalTypeStore().$reset();
      useControleMedicalStore().$reset();

      // Reset intervention stores
      useInterventionStore().$reset();
      useInterventionTraitementStore().$reset();
      useMaterielStore().$reset();
      useMissionStore().$reset();
      usePhaseTypeStore().$reset();
      useStatFederalStore().$reset();
      useStatInterventionStore().$reset();
      useTypeInterventionStore().$reset();
      useVehiculeStore().$reset();

      // Reset exercice stores
      useExerciceStore().$reset();
      useExcuseTypeStore().$reset();
      useExerciceCategorieStore().$reset();
      useHeureExerciceStore().$reset();

      // Reset comptabilite stores
      useAmendeStore().$reset();
      useCompteStore().$reset();
      useEcritureCategorieStore().$reset();
      useExerciceComptableStore().$reset();
      useImputationStore().$reset();
      useDecompteStore().$reset();

      // Reset sapeur stores
      useSapeurStore().$reset();
      useCoursStore().$reset();
      useFonctionStore().$reset();
      useGradeStore().$reset();

      // Reset other stores
      useRtaStore().$reset();
      useAbsenceStore().$reset();
      useTelephoneStore().$reset();
      useCoursSapeurStore().$reset();
      useTravailStore().$reset();
      useTravailTypeStore().$reset();
      useGroupeStore().$reset();
      useStatistiqueStore().$reset();
      useLocaliteStore().$reset();
      useBaseDataStore().$reset();
      useMesInfosStore().$reset();
    },
  },
});

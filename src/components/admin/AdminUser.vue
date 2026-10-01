<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import useNotification from "../../composables/useNotification.js";
import AdminService from "../../services/AdminService";
import { useModalStore } from "../../stores/common/Modal";
import { useAdminStore } from "../../stores/admin/Admin";
import { useAuthStore } from "../../stores/auth/Auth";

const { id } = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const adminStore = useAdminStore();
const authStore = useAuthStore();

const user = ref({});
const loadSis = adminStore.loadAllSis();
const loadRoles = adminStore.loadAllRoles();
adminStore.loadAllUsers();

const loadUser = () => {
  return AdminService.getUser({ id }).then((data) => {
    user.value = data;
  });
};

await Promise.all([loadSis, loadRoles, loadUser()]);

// Vue Router réutilise ce composant quand on navigue entre deux URLs de la
// même route (seul `id` change) : sans ce watcher, l'UI garderait les
// données du précédent utilisateur affiché.
watch(
  () => id,
  () => loadUser(),
);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-CH").slice(0, 10) : "";

const sis = computed(() => adminStore.sis);
const roles = computed(() => adminStore.roles);

const { showModal, confirm } = useModalStore();
const awn = useNotification();

const twoFactorExemptStep = ref("status"); // status | grant
const twoFactorExemptReason = ref("");
const twoFactorExemptUntil = ref("");

// Une exemption dont la date de fin est passée reste enregistrée mais ne
// s'applique plus (voir User::isTwoFactorExempt côté Auth) : elle doit pouvoir
// être renouvelée directement, sans passer par une révocation.
const twoFactorExemptionActive = computed(
  () =>
    !!user.value.two_factor_exempt &&
    (!user.value.two_factor_exempt_until ||
      new Date(user.value.two_factor_exempt_until) > new Date()),
);

const grantTwoFactorExemption = () => {
  adminStore
    .grantTwoFactorExemption(
      user.value.id,
      twoFactorExemptReason.value,
      // `<input type="date">` donne "YYYY-MM-DD", que `new Date()` lirait comme
      // minuit UTC : l'exemption doit couvrir toute la journée choisie, en heure locale.
      twoFactorExemptUntil.value
        ? new Date(`${twoFactorExemptUntil.value}T23:59:59`).toISOString()
        : null,
    )
    .then((data) => {
      user.value = { ...user.value, ...data };
      twoFactorExemptStep.value = "status";
      twoFactorExemptReason.value = "";
      twoFactorExemptUntil.value = "";
      awn.success("Exemption accordée");
    })
    .catch((e) => awn.alert(e?.message || "Erreur lors de l'octroi de l'exemption"));
};

const revokeTwoFactorExemption = () =>
  adminStore
    .revokeTwoFactorExemption(user.value.id)
    .then(() => {
      user.value = {
        ...user.value,
        two_factor_exempt: false,
        two_factor_exempt_reason: null,
        two_factor_exempt_until: null,
      };
      awn.success("Exemption révoquée");
    })
    .catch((e) => awn.alert(e?.message || "Erreur lors de la révocation"));

// Durée maximale des sessions du compte, depuis le login (30 jours par
// défaut) : 90 jours pour une tablette ou un appareil partagé.
const sessionMaxDaysOptions = [
  { id: 30, designation: "30 jours (défaut)" },
  { id: 90, designation: "90 jours (tablette / appareil partagé)" },
];
const sessionMaxDays = computed({
  get: () => user.value.session_max_days ?? 30,
  set: (maxDays) =>
    adminStore
      .updateSessionPolicy(user.value.id, maxDays)
      .then((data) => {
        user.value = { ...user.value, ...data };
        awn.success("Durée des sessions mise à jour");
      })
      .catch((e) => awn.alert(e?.message || "Erreur lors de la mise à jour")),
});

const revokeAllSessions = () =>
  confirm(
    "Déconnecter tous les appareils de cet utilisateur ?",
    "Chaque appareil devra se reconnecter avec le mot de passe (et le 2FA si actif). Utile en cas d'appareil perdu ou volé.",
  ).then(() =>
    adminStore
      .revokeAllSessions(user.value.id)
      .then(() => awn.success("Tous les appareils ont été déconnectés"))
      .catch((e) => awn.alert(e?.message || "Erreur lors de la déconnexion")),
  );

const tokenForUser = (user) =>
  AdminService.getUserToken(user.id).then((data) => {
    navigator.clipboard.writeText(data.accessToken);
    awn.success("Token copié dans le press papier");
  });
const editUser = (user) => showModal({ component: "ModalUser", data: user });
const impersonateUser = (user) =>
  authStore
    .impersonate(user.id)
    .then(() => router.push({ name: "accueil" }))
    .catch((e) => awn.alert(e?.message || "Erreur lors de l'usurpation"));

const computedDataRoles = computed(() =>
  (user.value.user_roles || []).map((ur) => {
    const role = roles.value.find((r) => r.id === ur.role_id);
    if (!role) return { ...ur, organisation: "N/A", role: "N/A" };
    return {
      ...ur,
      organisation: sis.value.find((s) => s.id === role.sis_id)?.nom || "N/A",
      role: role.nom,
    };
  }),
);
const computedDataSapeurs = computed(() =>
  (user.value.sapeur || []).map((e) => {
    return {
      ...e,
      organisation: sis.value.find((s) => s.id === e.sis_id)?.nom || "N/A",
    };
  }),
);

const ajouterRole = () =>
  showModal({
    component: "ModalAdminUserRole",
    data: { user_id: user.value.id },
    callback: loadUser,
  });
const supprimerRole = (userRole) =>
  confirm(
    "Voulez-vous vraiment enlever ce rôle à cet utilisateur ?",
    "Attention, l'action est irréversible.",
  ).then(() => {
    adminStore
      .removeUserRole(userRole)
      .then((res) => awn.success(res?.message || "Rôle supprimé"))
      .then(loadUser)
      .catch((e) => awn.alert(e?.message || "Erreur lors de la suppression"));
  });
const supprimerSapeur = (sapeurLink) =>
  confirm(
    "Voulez-vous vraiment supprimer ce lien sapeur ?",
    "Attention, l'action est irréversible.",
  ).then(() => {
    adminStore
      .removeSapeur(sapeurLink)
      .then((res) => awn.success(res?.message || "Lien sapeur supprimé"))
      .then(loadUser)
      .catch((e) => awn.alert(e?.message || "Erreur lors de la suppression"));
  });

const fieldsRoles = [
  { title: "id", key: "id" },
  { title: "organisation", key: "organisation" },
  { title: "role", key: "role" },
  { title: "Actions", key: "id", slot: "actions" },
];
const fieldsSapeurs = [
  { title: "id", key: "id" },
  { title: "organisation", key: "organisation" },
  { title: "sapeur_id", key: "sapeur_id" },
  { title: "pending_deactivation_at", key: "pending_deactivation_at", type: Date },
  { title: "deactivated_at", key: "deactivated_at", type: Date },
  { title: "Actions", key: "id", slot: "actions" },
];
</script>

<template>
  <div class="row">
    <div class="col-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données</h3>
          <div>
            <button
              type="button"
              class="btn btn-outline-primary me-1"
              :disabled="user.id === authStore.user?.id"
              :title="
                user.id === authStore.user?.id
                  ? 'Vous ne pouvez pas usurper votre propre identité'
                  : 'Usurper l\'identité'
              "
              @click="impersonateUser(user)"
            >
              <font-awesome-icon :icon="['fas', 'user-secret']" />
            </button>
            <button class="btn btn-primary" @click="editUser(user)">Modifier</button>
          </div>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="id">id</label>
            <input
              id="id"
              v-model="user.id"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="id"
            />
          </div>
          <div class="mb-3">
            <label for="name">name</label>
            <input
              id="name"
              v-model="user.name"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="name"
            />
          </div>
          <div class="mb-3">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="user.email"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="email"
            />
          </div>
          <div class="mb-3">
            <input
              id="admin"
              v-model="user.admin"
              name="user-admin"
              type="checkbox"
              disabled
              class="form-check-input"
            />
            <label for="admin" class="ms-1">Admin</label>
          </div>
          <div class="mb-3">
            <label for="pending_deactivation_at">pending_deactivation_at</label>
            <input
              id="pending_deactivation_at"
              :value="formatDate(user.pending_deactivation_at)"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="pending_deactivation_at"
            />
          </div>
          <div class="mb-3">
            <label for="disabled_at">disabled_at</label>
            <input
              id="disabled_at"
              :value="formatDate(user.disabled_at)"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="disabled_at"
            />
          </div>
          <div class="mb-3">
            <label>2FA</label>
            <div>
              <span v-if="user.two_factor_enabled" class="badge bg-success">Activé</span>
              <span v-else class="badge bg-secondary">Désactivé</span>
              <span v-if="twoFactorExemptionActive" class="badge bg-info ms-1">
                Exempté<template v-if="user.two_factor_exempt_until">
                  jusqu'au {{ formatDate(user.two_factor_exempt_until) }}</template
                >
              </span>
              <span v-else-if="user.two_factor_exempt" class="badge bg-warning text-dark ms-1">
                Exemption expirée le {{ formatDate(user.two_factor_exempt_until) }}
              </span>
            </div>
            <p v-if="user.two_factor_exempt_reason" class="text-body-secondary small mb-1 mt-1">
              {{ user.two_factor_exempt_reason }}
            </p>
            <template v-if="twoFactorExemptStep === 'status'">
              <button
                v-if="!twoFactorExemptionActive"
                type="button"
                class="btn btn-sm btn-outline-secondary mt-1 me-1"
                @click="twoFactorExemptStep = 'grant'"
              >
                {{ user.two_factor_exempt ? "Renouveler l'exemption" : "Exempter du 2FA" }}
              </button>
              <button
                v-if="user.two_factor_exempt"
                type="button"
                class="btn btn-sm btn-outline-danger mt-1"
                @click="revokeTwoFactorExemption"
              >
                Révoquer l'exemption
              </button>
            </template>
            <template v-else>
              <div class="mb-2 mt-2">
                <label for="exempt-reason">Raison (obligatoire)</label>
                <input
                  id="exempt-reason"
                  v-model="twoFactorExemptReason"
                  type="text"
                  class="form-control form-control-sm"
                />
              </div>
              <div class="mb-2">
                <label for="exempt-until">Jusqu'au (optionnel)</label>
                <input
                  id="exempt-until"
                  v-model="twoFactorExemptUntil"
                  type="date"
                  class="form-control form-control-sm"
                />
              </div>
              <button
                type="button"
                class="btn btn-sm btn-primary me-1"
                :disabled="!twoFactorExemptReason"
                @click="grantTwoFactorExemption"
              >
                Confirmer
              </button>
              <button
                type="button"
                class="btn btn-sm btn-link"
                @click="twoFactorExemptStep = 'status'"
              >
                Annuler
              </button>
            </template>
          </div>
          <div class="mb-3">
            <base-select
              v-model="sessionMaxDays"
              :options="sessionMaxDaysOptions"
              label="Durée maximale des sessions"
            />
            <p class="text-body-secondary small mb-1 mt-1">
              Au-delà, l'utilisateur doit se reconnecter (2FA compris), même s'il utilise
              l'application tous les jours.
            </p>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger mt-1"
              @click="revokeAllSessions"
            >
              Déconnecter tous les appareils
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h5 class="card-title">Roles</h5>
          <button class="btn btn-primary" @click="ajouterRole">Ajouter</button>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            ref="table"
            :fields="fieldsRoles"
            :data="computedDataRoles"
            :selectable="true"
            :hide-download="true"
            no-data="Aucun rôle attribué"
          >
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerRole(rowData)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
            <template #foot>
              <tr>
                <th :colspan="fieldsRoles.length">Nb roles: {{ user.user_roles?.length }}</th>
              </tr>
            </template>
          </base-table>
        </div>
      </div>
    </div>
    <div class="col-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h5 class="card-title">Sapeurs</h5>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            ref="table"
            :fields="fieldsSapeurs"
            :data="computedDataSapeurs"
            :selectable="true"
            :hide-download="true"
            no-data="Aucun sapeur lié"
          >
            <template #actions="{ rowData }">
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerSapeur(rowData)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
            <template #foot>
              <tr>
                <th :colspan="fieldsSapeurs.length">Nb sapeur: {{ user.sapeur?.length }}</th>
              </tr>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

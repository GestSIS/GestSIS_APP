<script setup>
import { computed, ref, inject } from 'vue';
import AdminService from '../../services/AdminService';
import { useModalStore } from '../../stores/common/Modal';
import { useAdminStore } from '../../stores/admin/Admin';
import { useAuthStore } from '../../stores/auth/Auth';

const { id } = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const adminStore = useAdminStore();
const authStore = useAuthStore();

const user = ref({});
const loadSis = authStore.loadSisListe();
const loadRoles = adminStore.loadAllRoles();
adminStore.loadAllUsers();

const loadUser = () => {
  return AdminService.getUser({ id }).then(({ data }) => {
    user.value = data;
  });
};

await Promise.all([loadSis, loadRoles, loadUser()]);

const sis = computed(() => adminStore.sis);
const roles = computed(() => adminStore.roles);

const { showModal, confirm } = useModalStore();
const awn = inject('awn');

const tokenForUser = (user) =>
  AdminService.getUserToken(user.id).then((data) => {
    navigator.clipboard.writeText(data.accessToken);
    awn.success('Token copié dans le press papier');
  });
const editUser = (user) => showModal({ component: 'ModalUser', data: user });

const computedDataRoles = computed(() =>
  (user.value.user_roles || []).map((ur) => {
    const role = roles.value.find((r) => r.id === ur.role_id);
    return {
      ...ur,
      organisation: sis.value.find((s) => s.id === role.sis_id)?.nom || 'N/A',
      role: role.nom,
    };
  }),
);
const computedDataSapeurs = computed(() =>
  (user.value.sapeur || []).map((e) => {
    return {
      ...e,
      organisation: sis.value.find((s) => s.id === e.sis_id)?.nom || 'N/A',
    };
  }),
);

const ajouterRole = () =>
  showModal({
    component: 'ModalAdminUserRole',
    data: { user_id: user.value.id },
    callback: loadUser,
  });
const supprimerRole = (userRole) =>
  confirm(
    'Voulez-vous vraiment enlever ce rôle à cet utilisateur ?',
    "Attention, l'action est irréversible.",
  ).then(() => {
    adminStore
      .removeUserRole(userRole?.id)
      .then((res) => awn.success(res?.message || 'Rôle supprimé'))
      .then(loadUser)
      .catch((e) => awn.alert(e?.message || 'Erreur lors de la suppression'));
  });

const fieldsRoles = [
  { title: 'id', key: 'id' },
  { title: 'organisation', key: 'organisation' },
  { title: 'role', key: 'role' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
const fieldsSapeurs = [
  { title: 'id', key: 'id' },
  { title: 'organisation', key: 'organisation' },
  { title: 'sapeur_id', key: 'sapeur_id' },
  // { title: 'Actions', key: 'id', slot: 'actions' },
];
</script>

<template>
  <div class="row">
    <div class="col-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données</h3>
          <button class="btn btn-primary" @click="editUser(user)">
            Modifier
          </button>
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
                <th :colspan="fieldsRoles.length">
                  Nb roles: {{ user.user_roles?.length }}
                </th>
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
            <template #foot>
              <tr>
                <th :colspan="fieldsSapeurs.length">
                  Nb sapeur: {{ user.sapeur?.length }}
                </th>
              </tr>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

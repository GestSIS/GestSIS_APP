<script setup>
import { useStore } from 'vuex';
import AdminService from '../../services/AdminService';
import { computed, ref, inject } from 'vue';
import { useModalStore } from '../../stores/common/Modal';

const { id } = defineProps({
  id: {
    type: Number,
    required: true,
  },
});
const store = useStore();

const user = ref({});
const loadSis = store.dispatch('loadSisListe');
const loadRoles = store.dispatch('loadAllRoles');
const loadUser = AdminService.getUser({ id }).then(({ data }) => {
  user.value = data;
});

await Promise.all([loadSis, loadUser]);

const sis = computed(() => store.state.admin.sis);
const roles = computed(() => store.state.admin.roles);

const { showModal, confirm } = useModalStore();
const awn = inject('awn');

const tokenForUser = (user) =>
  AdminService.getUserToken(user.id).then((data) => {
    navigator.clipboard.writeText(data.accessToken);
    awn.success('Token copié dans le press papier');
  });
const editUser = (user) => showModal({ component: 'ModalUser', data: user });
// const deleteUserRole = (userRole) =>
//   confirm(
//     'Voulez-vous vraiment enlever ce rôle à cet utilisateur ?',
//     "Attention, l'action est irréversible.",
//   ).then(() =>
//     store
//       .dispatch('deleteUserRole', userRole?.id)
//       .then((res) => awn.success(res?.message || 'Utilisateur supprimé'))
//       .catch((e) => awn.alert(e?.message || 'Erreur lors de la suppression')),
//   );

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

const fieldsRoles = [
  { title: 'id', key: 'id' },
  { title: 'organisation', key: 'organisation' },
  { title: 'role', key: 'role' },
  // { title: 'Actions', key: 'id', slot: 'actions' },
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
        </div>
      </div>
    </div>
    <div class="col-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h5 class="card-title">Roles</h5>
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
            <template #foot>
              <tr>
                <th :colspan="fieldsRoles.length">
                  Nb rôles: {{ user.user_roles?.length }}
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

<script setup>
import { useStore } from 'vuex';
import AdminService from '../../services/AdminService';
import { computed, inject } from 'vue';
import { useModalStore } from '../../stores/common/Modal';

const store = useStore();

const loadSis = store.dispatch('loadSisListe');
const loadUsers = store.dispatch('loadAllUsers');

await Promise.all([loadSis, loadUsers]);

const users = computed(() => store.state.admin.users);
const sis = computed(() => store.state.admin.sis);

const { showModal, confirm } = useModalStore();
const awn = inject('awn');

const tokenForUser = (user) =>
  AdminService.getUserToken(user.id).then((data) => {
    navigator.clipboard.writeText(data.accessToken);
    awn.success('Token copié dans le press papier');
  });
const editUser = (user) => showModal({ component: 'ModalUser', data: user });
const deleteUser = (user) =>
  confirm(
    'Voulez-vous vraiment supprimer cet utilisateur ?',
    "Attention, l'action est irréversible et l'utilisateur devra recréer un compte pour utiliser GestSIS.",
  ).then(() =>
    store
      .dispatch('deleteUser', user?.id)
      .then((res) => awn.success(res?.message || 'Utilisateur supprimé'))
      .catch((e) => awn.alert(e?.message || 'Erreur lors de la suppression')),
  );

const fields = [
  { title: 'id', key: 'id' },
  { title: 'name', key: 'name' },
  { title: 'email', key: 'email' },
  { title: 'admin', key: 'admin', type: Boolean },
  { title: 'sapeur', key: 'sapeur', slot: 'liste' },
  { title: 'created_at', key: 'created_at', type: Date },
  { title: 'email_verified_at', key: 'email_verified_at', type: Date },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3 col-12">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Utilisateurs</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        ref="table"
        :fields="fields"
        :data="users"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun utilisateur"
      >
        <template #liste="{ value }">
          <span v-for="(item, i) in value" :key="i" class="badge bg-primary">{{
            sis.find((s) => s.id == item.sis_id)?.api_key
          }}</span>
        </template>
        <template #actions="{ rowData }">
          <router-link
            class="btn btn-sm btn-outline-primary border-0"
            :to="{ name: 'admin-user', params: { id: rowData.id } }"
          >
            <font-awesome-icon :icon="['far', 'eye']" />
          </router-link>
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editUser(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="tokenForUser(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'key']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteUser(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
        <template #foot>
          <tr>
            <th :colspan="fields.length">Nb : {{ users.length }}</th>
          </tr>
        </template>
      </base-table>
    </div>
  </div>
</template>

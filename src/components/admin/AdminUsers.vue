<script setup>
import AdminService from "../../services/AdminService";
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal";
import { useAdminStore } from "../../stores/admin/Admin";
import { useAuthStore } from "../../stores/auth/Auth";

const adminStore = useAdminStore();
const authStore = useAuthStore();

const loading = ref(true);
const loadSis = authStore.loadSisListe();
const loadUsers = adminStore.loadAllUsers();

Promise.all([loadSis, loadUsers])
  .then(() => (loading.value = false))
  .catch(() => (loading.value = false));

const users = computed(() => adminStore.users);
const sis = computed(() => adminStore.sis);

const { showModal, confirm } = useModalStore();
const awn = useNotification();

const tokenForUser = (user) =>
  AdminService.getUserToken(user.id).then((data) => {
    navigator.clipboard.writeText(data.accessToken);
    awn.success("Token copié dans le press papier");
  });
const editUser = (user) => showModal({ component: "ModalUser", data: user });
const deleteUser = (user) =>
  confirm(
    "Voulez-vous vraiment supprimer cet utilisateur ?",
    "Attention, l'action est irréversible et l'utilisateur devra recréer un compte pour utiliser GestSIS.",
  ).then(() =>
    adminStore
      .deleteUser(user?.id)
      .then((res) => awn.success(res?.message || "Utilisateur supprimé"))
      .catch((e) => awn.alert(e?.message || "Erreur lors de la suppression")),
  );

const fields = [
  { title: "id", key: "id" },
  { title: "name", key: "name" },
  { title: "email", key: "email" },
  { title: "admin", key: "admin", type: Boolean },
  { title: "sapeur", key: "sapeur", slot: "liste" },
  { title: "created_at", key: "created_at", type: Date },
  { title: "email_verified_at", key: "email_verified_at", type: Date },
  { title: "Actions", key: "id", slot: "actions" },
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
        :loading="loading"
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
          <button type="button" class="btn btn-outline-primary border-0" @click="editUser(rowData)">
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

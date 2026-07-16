<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
import { computed, ref } from "vue";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";

const sapeurStore = useSapeurStore();
const authStore = useAuthStore();

const loadPermissions = authStore.fetchPermissions();
const loadRoles = authStore.fetchRoles();
const loadUsers = authStore.fetchUsers();
const loadSapeurs = sapeurStore.fetchListeSapeur();

const loading = ref(true);
Promise.all([loadUsers, loadPermissions, loadRoles, loadSapeurs]).then(
  () => (loading.value = false),
);

const filters = ref({
  inactif: false,
  special: true,
  user: "",
  sapeur: "",
});

const sisId = computed(() => authStore.sis.activeId);
const users = computed(() => authStore.users);
const roles = computed(() => authStore.roles);
const permissions = computed(() => authStore.permissions);
const sapeurs = computed(() => sapeurStore.liste);

const computedData = computed(() =>
  users.value
    .map((u) => {
      const sapeurId = u.sapeur[0]?.sapeur_id;
      const sapeur = sapeurs.value.find((s) => s.id === sapeurId);
      return {
        ...u,
        special: !sapeurId,
        inactif: !u.user_roles?.length && !sapeur?.actif,
        actifStatut: sapeur?.actif ?? true,
        nom_prenom: !u?.sapeur?.length > 0 ? "-" : (sapeur?.nom_prenom ?? "-"),
        type: !u?.sapeur?.length > 0 ? "-" : sapeur?.type,
      };
    })
    .filter((u) => (filters.value.inactif ? true : !u.inactif))
    .filter((u) => (filters.value.special ? true : !u.special))
    .filter((u) => {
      const sapeurId = u.sapeur[0]?.sapeur_id;
      const sapeur = sapeurs.value?.find((s) => s.id === sapeurId);
      return (
        sapeur?.nom_prenom
          ?.normalize("NFD")
          ?.replace(/[\u0300-\u036f]/g, "")
          ?.toLowerCase()
          ?.includes(
            filters.value.sapeur
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase(),
          ) ?? true
      );
    })
    .filter((u) =>
      u.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(
          filters.value.user
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        ),
    ),
);

const { showModal } = useModalStore();
const formatRole = (id) => roles.value.find((r) => r.id === id)?.nom;

const invite = () => showModal({ component: "ModalRegisterToken" });

const edit = (user) =>
  showModal({
    component: "ModalUserRole",
    data: { ...user, roles: user.user_roles.map((r) => r.role_id) },
  });

const onRowClass = (dataItem) => {
  if (!dataItem) {
    return "";
  }
  return !dataItem?.actifStatut ? "table-danger" : "";
};

const fields = [
  { title: "Utilisateur", key: "name" },
  { title: "Sapeur", slot: "sapeur" },
  { title: "Email", key: "email" },
  { title: "Rôles", key: "roles", slot: "badges" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <div class="col-12 col-md-12 col-xl-8">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Filtres</h3>
      </div>
      <form class="card-body">
        <div class="row">
          <div class="col-md-3">
            <base-checkbox
              v-model="filters.special"
              class="mb-3"
              label="Afficher comptes spéciaux"
            />
          </div>
          <div class="col-md-3">
            <base-checkbox
              v-model="filters.inactif"
              class="mb-3"
              label="Afficher sapeurs inactif"
            />
          </div>
          <div class="col-md-3">
            <input
              v-model="filters.user"
              type="text"
              placeholder="Utilisateur"
              class="form-control form-control-sm"
            />
          </div>
          <div class="col-md-3">
            <input
              v-model="filters.sapeur"
              type="text"
              placeholder="Sapeur"
              class="form-control form-control-sm"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="col-md-12">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3>Liste des utilisateurs</h3>
        <button class="btn btn-outline-primary" @click="invite">Inviter</button>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          no-data="Aucun utilisateur"
          :data="computedData"
          :selectable="true"
          :row-class="onRowClass"
        >
          <template #badges="{ rowData }">
            <span v-for="r in rowData.user_roles" :key="r.id" class="badge bg-primary me-1">{{
              formatRole(r.role_id)
            }}</span>
          </template>
          <template #sapeur="{ rowData }">
            {{ rowData.nom_prenom }}
            <font-awesome-icon v-if="rowData?.type === 1" :icon="['far', 'handshake']" />
          </template>
          <template #actions="{ rowData }">
            <button class="btn btn-outline-primary border-0" @click="edit(rowData)">
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
          </template>
          <template #foot>
            <tr>
              <th colspan="5">Nombre : {{ computedData.length }}</th>
            </tr>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
import { computed, ref } from "vue";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";

const sapeurStore = useSapeurStore();
const authStore = useAuthStore();

const loadPermissions = authStore.fetchPermissions();
const loadRoles = authStore.fetchRoles();
const loadUsers = authStore.fetchUsers();
const loadSapeurs = sapeurStore.fetchSapeurs();

const hasEditPermission = useHasPermission(permissions.UTILISATEUR.MODIFICATION);

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

const users = computed(() => authStore.users);
const roles = computed(() => authStore.roles);
const sapeurs = computed(() => sapeurStore.liste);

const computedData = computed(() =>
  users.value
    .map((u) => {
      const sapeurId = u.sapeur[0]?.sapeur_id;
      const sapeur = sapeurs.value.find((s) => s.id === sapeurId);
      // Pas de sapeur attendu (compte spécial) => actif par défaut.
      // Sapeur attendu mais introuvable (lien orphelin) => considéré inactif, comme un sapeur inactif.
      const actifStatut = !sapeurId ? true : !!sapeur?.actif;
      return {
        ...u,
        special: !sapeurId,
        inactif: !u.user_roles?.length && !actifStatut,
        actifStatut,
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
    <base-card title="Filtres">
      <template #body>
        <form>
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
                label="Afficher sapeurs inactifs"
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
      </template>
    </base-card>
  </div>
  <div class="col-md-12">
    <base-card title="Liste des utilisateurs">
      <template #body-table>
        <base-table
          :loading="loading"
          :fields="fields"
          no-data="Aucun utilisateur"
          :data="computedData"
          show-count
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
            <span v-if="rowData?.type === 1" class="badge bg-info text-dark ms-1">
              <font-awesome-icon :icon="['far', 'handshake']" /> Civil
            </span>
          </template>
          <template #actions="{ rowData }">
            <button
              v-if="hasEditPermission"
              aria-label="Modifier"
              class="btn btn-outline-primary border-0"
              @click="edit(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
          </template>
        </base-table>
      </template>
    </base-card>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

const authStore = useAuthStore();

const loadPermissions = authStore.fetchPermissions();
const loadRoles = authStore.fetchRoles();

await Promise.all([loadPermissions, loadRoles]);

const selectedId = ref(null);
const permissions = computed(() => authStore.permissions.slice().sort((a, b) => a.tri - b.tri));

const formattedRoles = computed(() => {
  return authStore.roles.map((r) => ({
    ...r,
    permissions: r.permission_roles.map((p) => parseInt(p.permission_id)),
  }));
});
const groupedPermissions = computed(() => {
  return Object.entries(
    permissions.value.reduce((acc, p) => {
      const keyParts = p.api_key.split(".");
      const key = keyParts[0];
      const permission = keyParts[1];
      if (!(key in acc)) {
        acc[key] = [];
      }
      acc[key].push({ ...p, permission });
      return acc;
    }, {}),
  );
});

const { confirm, showModal } = useModalStore();
const selectRole = (role) => (selectedId.value = role.id);

const edit = (role) => showModal({ component: "ModalRole", data: role });
const newRole = () => showModal({ component: "ModalRole", data: {} });
const remove = (role) =>
  confirm(
    "Voulez-vous vraiment supprimer ce rôle ?",
    "Attention, la suppression d'un rôle est irréversible ! Les utilisateurs ayant ce rôle perdront ces permissions.",
  ).then(() => authStore.deleteRole(role.id));

const moduleMapping = (key) => {
  // Permet d'améliorer certains textes à afficher
  const mapping = {
    controle_medical: "Contrôles médicaux",
    comptabilite: "Comptabilité",
    organisation: "Groupes",
    sis: "Config générale",
    mat_perso: "Matériel personnel",
    fiche_travail: "Fiche de travail",
  };
  if (key in mapping) {
    return mapping[key];
  }
  return key;
};
const permissionMapping = (key) => {
  // Permet d'améliorer certains textes à afficher
  const mapping = {
    saisie_perso: "Saisie perso",
    saisie_commune: "Saisie commune",
  };
  if (key in mapping) {
    return mapping[key];
  }
  return key;
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Rôles</h3>
      <button type="button" class="btn btn-primary" @click="newRole">Nouveau rôle</button>
    </div>
    <div class="card-body table-responsive p-0">
      <table id="sap-cours" class="table table-sm table-bordered" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th colspan="2" class="sticky"></th>
            <th
              v-for="[key, perms] in groupedPermissions"
              :key="key"
              class="text-center text-capitalize"
              :colspan="perms.length"
              :rowspan="perms.length === 1 ? 2 : 1"
            >
              {{ moduleMapping(key) }}
            </th>
            <th data-field="actions" rowspan="2">Actions</th>
          </tr>
          <tr>
            <th class="sticky" data-field="date">Rôle</th>
            <th class="sticky" data-field="designation">Désignation</th>
            <template
              v-for="[key, perms] in groupedPermissions.filter(([, perms]) => perms.length !== 1)"
              :key="key"
            >
              <th v-for="(p, i) in perms" :key="i" class="text-center text-capitalize">
                {{ permissionMapping(p.permission) }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in formattedRoles"
            :key="r.id"
            :class="{ 'table-primary': selectedId == r.id }"
            @click="selectRole(r)"
          >
            <td class="sticky">{{ r.nom }}</td>
            <td class="sticky">{{ r.description }}</td>
            <td v-for="p in permissions" :key="p.id" class="text-center">
              <input
                :id="p.id + '-' + r.id"
                type="checkbox"
                class="form-check-input"
                :checked="r.permissions.includes(p.id)"
                readonly
                disabled
              />
              <label class="form-check-label" :for="p.id + '-' + r.id"></label>
            </td>
            <td class="align-middle text-center">
              <button type="button" class="btn btn-outline-primary border-0" @click="edit(r)">
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button type="button" class="btn btn-outline-danger border-0" @click="remove(r)">
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
table {
  border-collapse: separate; /* Don't collapse */
}

td,
th {
  border-width: 1px 1px 0px 0px !important;
}
td:first-child,
th:first-child {
  border-left-width: 1px !important;
}

tr:last-child td,
tr:last-child td {
  border-bottom-width: 1px !important;
}

.sticky {
  position: sticky;
  left: 0px;
  width: 100px;
  background-color: var(--bs-table-bg);
  z-index: 1;
}

th:nth-child(2).sticky,
td:nth-child(2).sticky {
  position: sticky;
  left: 56px;
}
</style>

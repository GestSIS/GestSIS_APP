<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AdminService from "../../services/AdminService";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal";
import { useAuthStore } from "../../stores/auth/Auth";

const router = useRouter();
const authStore = useAuthStore();

const { id } = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const sis = ref({});

const loadSis = () => {
  return AdminService.getSis({ id }).then(({ data }) => {
    sis.value = data;
  });
};

await loadSis();

// Vue Router réutilise ce composant quand on navigue entre deux URLs de la
// même route (seul `id` change) : sans ce watcher, l'UI garderait les
// données du SIS précédemment affiché.
watch(
  () => id,
  () => loadSis(),
);

const { showModal } = useModalStore();
const editSis = (sis) => showModal({ component: "ModalSis", data: sis });
const awn = useNotification();

const impersonateUser = (user) =>
  authStore
    .impersonate(user.user_id)
    .then(() => router.push({ name: "accueil" }))
    .catch((e) => awn.alert(e?.message || "Erreur lors de l'usurpation"));

const computedDataUsers = computed(() => {
  const usersById = {};

  (sis.value.roles || []).forEach((role) => {
    (role.user_roles || []).forEach((ur) => {
      usersById[ur.user_id] ??= {
        id: ur.user_id,
        user_id: ur.user_id,
        name: ur.user?.name || "N/A",
        email: ur.user?.email || "N/A",
        roles: [],
        sapeurs: [],
      };
      usersById[ur.user_id].roles.push({ id: `role-${ur.id}`, nom: role.nom });
    });
  });

  // Un utilisateur peut n'avoir aucun rôle et n'apparaître que via un lien
  // sapeur actif (ex: sapeur simple sans rôle de gestion) — sans ce merge il
  // resterait invisible sur la fiche du SIS. Le lien sapeur n'est pas un
  // rôle : il a sa propre colonne (mapping sapeur_id), pas un badge "sapeur"
  // mélangé dans la colonne rôle.
  (sis.value.sapeurs || []).forEach((sapeurLink) => {
    usersById[sapeurLink.user_id] ??= {
      id: sapeurLink.user_id,
      user_id: sapeurLink.user_id,
      name: sapeurLink.user?.name || "N/A",
      email: sapeurLink.user?.email || "N/A",
      roles: [],
      sapeurs: [],
    };
    usersById[sapeurLink.user_id].sapeurs.push({
      id: sapeurLink.id,
      sapeur_id: sapeurLink.sapeur_id,
    });
  });

  return Object.values(usersById);
});

const fieldsUsers = [
  { title: "id", key: "id" },
  { title: "name", key: "name" },
  { title: "email", key: "email" },
  { title: "role", key: "roles", slot: "badges" },
  { title: "sapeur", key: "sapeurs", slot: "sapeurBadges" },
  { title: "Actions", key: "id", slot: "actions" },
];
</script>

<template>
  <div class="row">
    <div class="col-4">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Données</h3>
          <button class="btn btn-primary" @click="editSis(sis)">Modifier</button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="id">id</label>
            <input
              id="id"
              v-model="sis.id"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="id"
            />
          </div>
          <div class="mb-3">
            <label for="api_key">api_key</label>
            <input
              id="api_key"
              v-model="sis.api_key"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="api_key"
            />
          </div>
          <div class="mb-3">
            <label for="nom">Nom</label>
            <input
              id="nom"
              v-model="sis.nom"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="nom"
            />
          </div>
          <div class="mb-3">
            <label for="abreviation">Abréviation</label>
            <input
              id="abreviation"
              v-model="sis.abreviation"
              type="text"
              readonly
              disabled
              class="form-control form-control-sm"
              name="abreviation"
            />
          </div>
          <div class="mb-3">
            <input
              id="mobile"
              v-model="sis.mobile"
              name="sis-mobile"
              type="checkbox"
              disabled
              class="form-check-input"
            />
            <label for="mobile" class="ms-1">Mobile</label>
          </div>
        </div>
      </div>
    </div>
    <div class="col-8">
      <div class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h5 class="card-title">Utilisateurs</h5>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            ref="table"
            :fields="fieldsUsers"
            :data="computedDataUsers"
            :selectable="true"
            :hide-download="true"
            no-data="Aucun utilisateur"
          >
            <template #badges="{ rowData }">
              <span v-for="r in rowData.roles" :key="r.id" class="badge bg-primary me-1">{{
                r.nom
              }}</span>
            </template>
            <template #sapeurBadges="{ rowData }">
              <span v-for="s in rowData.sapeurs" :key="s.id" class="badge bg-secondary me-1"
                >sap:{{ s.sapeur_id }}</span
              >
            </template>
            <template #actions="{ rowData }">
              <router-link
                class="btn btn-sm btn-outline-primary border-0"
                :to="{ name: 'admin-user', params: { id: rowData.user_id } }"
              >
                <font-awesome-icon :icon="['far', 'eye']" />
              </router-link>
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                :disabled="rowData.user_id === authStore.user?.id"
                :title="
                  rowData.user_id === authStore.user?.id
                    ? 'Vous ne pouvez pas usurper votre propre identité'
                    : 'Usurper l\'identité'
                "
                @click="impersonateUser(rowData)"
              >
                <font-awesome-icon :icon="['fas', 'user-secret']" />
              </button>
            </template>
            <template #foot>
              <tr>
                <th :colspan="fieldsUsers.length">
                  Nb utilisateurs: {{ computedDataUsers.length }}
                </th>
              </tr>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

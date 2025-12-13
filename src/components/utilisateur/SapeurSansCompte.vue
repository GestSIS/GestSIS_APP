<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../../stores/auth/Auth.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';

const sapeurStore = useSapeurStore();
const authStore = useAuthStore();

const loadUsers = authStore.fetchUsers();
const loadSapeurs = sapeurStore.fetchListeSapeur();

const loading = ref(true);
Promise.all([loadUsers, loadSapeurs]).then(() => (loading.value = false));

const filters = ref({
  sapeur: '',
  email: '',
});

const sisId = computed(() => authStore.sis.activeId);
const users = computed(() => authStore.users);
const sapeurs = computed(() => sapeurStore.liste);

const computedData = computed(() => {
  const sapeurIds = new Set(
    users.value.flatMap((u) =>
      u.sapeur.filter((s) => s.sis_id == sisId.value).map((s) => s.sapeur_id),
    ),
  );
  return sapeurs.value
    .filter((s) => s.actif)
    .filter((s) => s.type == 0)
    .filter((s) => !sapeurIds.has(s.id))
    .filter((s) =>
      s.nom_prenom
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
          filters.value.sapeur
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase(),
        ),
    )
    .filter((s) =>
      s.email
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
          filters.value.email
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase(),
        ),
    );
});

const fields = [
  { title: 'Sapeur', key: 'nom_prenom' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="col-12 col-md-6 col-xl-3">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Filtres</h3>
      </div>
      <form class="card-body">
        <div class="row">
          <div class="col-md-6">
            <input
              v-model="filters.sapeur"
              type="text"
              placeholder="Sapeur"
              class="form-control form-control-sm"
            />
          </div>
          <div class="col-md-6">
            <input
              v-model="filters.email"
              type="text"
              placeholder="Email"
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
        <h3>Liste des sapeurs n'ayant pas créé de compte</h3>
        <a
          class="btn btn-outline-primary"
          :href="
            'mailto:' +
            computedData
              .map((s) => s.email)
              .filter((s) => s && s != null)
              .join(';')
          "
        >
          Email
        </a>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          no-data="Aucun sapeur à afficher"
          :data="computedData"
          :selectable="true"
        >
          <template #actions="{ rowData }">
            <a
              class="btn btn-sm btn-outline-primary border-0"
              :href="'mailto:' + rowData.email"
            >
              <font-awesome-icon :icon="['fas', 'envelope']" />
            </a>
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

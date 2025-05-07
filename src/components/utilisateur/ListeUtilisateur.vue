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
      <div v-if="loading" class="card-body d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          v-show="!loading"
          :fields="fields"
          no-data="Aucun utilisateur"
          :data="computedData"
          :selectable="true"
          :row-class="onRowClass"
        >
          <template #badges="{ rowData }">
            <span
              v-for="r in rowData.user_roles"
              :key="r.id"
              class="badge bg-primary me-1"
              >{{ formatRole(r.role_id) }}</span
            >
          </template>
          <template #sapeur="{ rowData }">
            {{ rowData.nom_prenom }}
            <font-awesome-icon
              v-if="rowData?.type === 1"
              :icon="['far', 'handshake']"
            />
          </template>
          <template #actions="{ rowData }">
            <button
              class="btn btn-outline-primary border-0"
              @click="edit(rowData)"
            >
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

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';
import store from '/src/store/index';

function loadData(routeTo, next) {
  const loadUsers = store.dispatch('fetchUsers');
  const loadPermissions = store.dispatch('fetchPermissions');
  const loadRoles = store.dispatch('fetchRoles');
  const loadSapeurs = store.dispatch('fetchListeSapeur');

  Promise.all([loadUsers, loadPermissions, loadRoles, loadSapeurs]).then(() => {
    next();
  });
}

export default {
  name: 'ListeUtilisateur',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      toggles: {},
      loading: true,
      filters: {
        inactif: false,
        special: true,
        user: '',
        sapeur: '',
      },
      fields: [
        { title: 'Utilisateur', key: 'name' },
        { title: 'Sapeur', slot: 'sapeur' },
        { title: 'Email', key: 'email' },
        { title: 'Rôles', key: 'roles', slot: 'badges' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      sisId: (state) => state.auth.sis.activeId,
      users: (state) => state.auth.users,
      roles: (state) => state.auth.roles,
      permissions: (state) => state.auth.permissions,
      sapeurs: (state) => state.sapeur.liste,
    }),
    computedData() {
      return this.users
        .map((u) => {
          const sapeurId = u.sapeur[0]?.sapeur_id;
          const sapeur = this.sapeurs.find((s) => s.id === sapeurId);
          return {
            ...u,
            special: !sapeurId,
            inactif:
              (!u.user_roles?.length ?? false) && (!sapeur?.actif ?? false),
            actifStatut: sapeur?.actif ?? true,
            nom_prenom:
              !u?.sapeur?.length > 0 ? '-' : (sapeur?.nom_prenom ?? '-'),
            type: !u?.sapeur?.length > 0 ? '-' : sapeur?.type,
          };
        })
        .filter((u) => (this.filters.inactif ? true : !u.inactif))
        .filter((u) => (this.filters.special ? true : !u.special))
        .filter((u) => {
          const sapeurId = u.sapeur[0]?.sapeur_id;
          const sapeur = this.sapeurs?.find((s) => s.id === sapeurId);
          return (
            sapeur?.nom_prenom
              ?.normalize('NFD')
              ?.replace(/[\u0300-\u036f]/g, '')
              ?.toLowerCase()
              ?.includes(
                this.filters.sapeur
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase(),
              ) ?? true
          );
        })
        .filter((u) =>
          u.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
              this.filters.user
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase(),
            ),
        );
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    formatRole(id) {
      return this.roles.find((r) => r.id === id)?.nom;
    },
    invite() {
      this.SHOW_MODAL({ component: 'ModalRegisterToken' });
    },
    edit(user) {
      this.SHOW_MODAL({
        component: 'ModalUserRole',
        data: { ...user, roles: user.user_roles.map((r) => r.role_id) },
      });
    },
    onRowClass(dataItem) {
      if (!dataItem) {
        return '';
      }

      return !dataItem?.actifStatut ? 'table-danger' : '';
    },
  },
};
</script>

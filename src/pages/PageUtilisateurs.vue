<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Utilisateurs
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline table-responsive">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des utilisateurs</h3>
            <button class="btn btn-outline-primary" @click="invite">
              Inviter
            </button>
          </div>
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :fields="fields"
            no-data="Aucun utilisateur"
            :data="users"
            :selectable="true"
          >
            <template #badges="{ rowData }">
              <span
                v-for="r in rowData.user_roles"
                :key="r.id"
                class="badge bg-primary me-1"
                >{{ formatRole(r.role_id) }}</span
              >
            </template>
            <template #actions="{ rowData }">
              <button
                class="btn btn-outline-primary border-0"
                @click="edit(rowData)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

function loadData(routeTo, next) {
  let loadUsers = store.dispatch('fetchUsers');
  let loadPermissions = store.dispatch('fetchPermissions');
  let loadRoles = store.dispatch('fetchRoles');
  let loadSapeurs = store.dispatch('fetchListeSapeur');

  Promise.all([loadUsers, loadPermissions, loadRoles, loadSapeurs]).then(() => {
    next();
  });
}

export default {
  name: 'PageUtilisateurs',
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
      fields: [
        {
          title: 'Utilisateur',
          key: 'name',
        },
        {
          title: 'Sapeur',
          key: 'sapeur_id',
          formatter: (_, data) => this.formatSapeur(data),
        },
        {
          title: 'Email',
          key: 'email',
        },
        {
          title: 'Rôles',
          key: 'roles',
          slot: 'badges',
        },
        {
          title: 'Actions',
          slot: 'actions',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      users: (state) => state.auth.users,
      roles: (state) => state.auth.roles,
      permissions: (state) => state.auth.permissions,
      sapeurs: (state) => state.sapeur.liste,
    }),
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatRole(id) {
      return (this.roles.find((r) => r.id === id) || { nom: '' }).nom;
    },
    formatSapeur(user) {
      if (!user.sapeur.length > 0) {
        return '-';
      }
      const sapeurId = user.sapeur[0].sapeur_id;
      return this.sapeurs.find((s) => s.id === sapeurId)?.nom_prenom ?? '-';
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
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>

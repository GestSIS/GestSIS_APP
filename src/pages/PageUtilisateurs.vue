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
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <button
            class="nav-item nav-link"
            role="tab"
            :class="{ active: tab == 'users' }"
            @click="tab = 'users'"
          >
            Utilisateurs
          </button>
          <button
            class="nav-item nav-link"
            role="tab"
            :class="{ active: tab == 'sapeurs' }"
            @click="tab = 'sapeurs'"
          >
            Sapeurs sans comptes
          </button>
        </nav>
      </div>
      <div class="col-md-12">
        <div
          v-if="tab == 'users'"
          class="card card-primary card-outline table-responsive"
        >
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
            :fields="fieldsUser"
            no-data="Aucun utilisateur"
            :data="users"
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
                <th colspan="5">Nombre : {{ users.length }}</th>
              </tr>
            </template>
          </base-table>
        </div>
        <div
          v-if="tab == 'sapeurs'"
          class="card card-primary card-outline table-responsive"
        >
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des sapeurs n'ayant pas créé de compte</h3>

            <a
              class="btn btn-outline-primary"
              :href="
                'mailto:' +
                sapeursSansCompte
                  .map((s) => s.email)
                  .filter((s) => s && s != null)
                  .join(';')
              "
            >
              Email
            </a>
          </div>
          <div v-if="loading" class="card-body d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            :fields="fieldsSapeur"
            no-data="Aucun sapeur à afficher"
            :data="sapeursSansCompte"
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
                <th colspan="5">Nombre : {{ sapeursSansCompte.length }}</th>
              </tr>
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
      tab: 'users',
      fieldsUser: [
        { title: 'Utilisateur', key: 'name' },
        {
          title: 'Sapeur',
          key: 'sapeur_id',
          formatter: (_, data) => this.formatSapeur(data),
        },
        { title: 'Email', key: 'email' },
        { title: 'Rôles', key: 'roles', slot: 'badges' },
        { title: 'Actions', slot: 'actions' },
      ],
      fieldsSapeur: [
        { title: 'Sapeur', key: 'nom_prenom' },
        { title: 'Email', key: 'email' },
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
    sapeursSansCompte() {
      const sapeurIds = new Set(
        this.users.flatMap((u) =>
          u.sapeur.filter((s) => s.sis_id == this.sisId).map((s) => s.sapeur_id)
        )
      );
      return this.sapeurs
        .filter((s) => s.actif)
        .filter((s) => s.type == 0)
        .filter((s) => !sapeurIds.has(s.id));
      // return false;
    },
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
      if (!user?.sapeur?.length > 0) {
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
    onRowClass(dataItem) {
      if (!dataItem?.sapeur?.length > 0) {
        return '';
      }

      const sapeurId = dataItem.sapeur[0].sapeur_id;
      return !this.sapeurs.find((s) => s.id === sapeurId)?.actif
        ? 'text-danger'
        : '';
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

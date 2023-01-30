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
    <div class="card card-primary card-outline table-responsive">
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
      <div v-if="loading" class="card-body d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      <base-table
        v-show="!loading"
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
  name: 'SapeurSansCompte',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      filters: {
        sapeur: '',
        email: '',
      },
      loading: true,
      tab: 'users',
      fields: [
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
      sapeurs: (state) => state.sapeur.liste,
    }),
    computedData() {
      const sapeurIds = new Set(
        this.users.flatMap((u) =>
          u.sapeur.filter((s) => s.sis_id == this.sisId).map((s) => s.sapeur_id)
        )
      );
      return this.sapeurs
        .filter((s) => s.actif)
        .filter((s) => s.type == 0)
        .filter((s) => !sapeurIds.has(s.id))
        .filter((s) =>
          s.nom_prenom
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
              this.filters.sapeur
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
            )
        )
        .filter((s) =>
          s.email
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .includes(
              this.filters.email
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
            )
        );
    },
  },
  mounted() {
    this.loading = false;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatSapeur(user) {
      if (!user?.sapeur?.length > 0) {
        return '-';
      }
      const sapeurId = user.sapeur[0].sapeur_id;
      return this.sapeurs.find((s) => s.id === sapeurId)?.nom_prenom ?? '-';
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

<style></style>

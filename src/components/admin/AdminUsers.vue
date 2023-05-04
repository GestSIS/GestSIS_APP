<template>
  <div class="card card-primary card-outline mb-3 col-12 col-lg-6">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Utilisateurs</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        :fields="fields"
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
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editUser(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
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

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadSis = store.dispatch('loadSisListe');
  const loadUsers = store.dispatch('loadAllUsers');

  Promise.all([loadSis, loadUsers]).then(() => {
    next();
  });
}

export default {
  name: 'AdminUsers',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'id', key: 'id' },
        { title: 'name', key: 'name' },
        { title: 'email', key: 'email' },
        { title: 'admin', key: 'admin', type: Boolean },
        { title: 'sapeur', key: 'sapeur', slot: 'liste' },
        // { title: 'api_key', key: 'api_key' },
        // { title: 'Nom', key: 'nom' },
        // { title: 'Abréviation', key: 'abreviation' },
        // { title: 'Mobile', key: 'mobile', type: Boolean },
        { title: 'Actions', key: 'id', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      users: (state) => state.admin.users,
      sis: (state) => state.admin.sis,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    editUser(user) {
      this.SHOW_MODAL({ component: 'ModalUser', data: user });
    },
    deleteUser(user) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cet utilisateur ?',
          question:
            "Attention, l'action est irréversible et l'utilisateur devra recréer un compte pour utiliser GestSIS.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('deleteUser', user?.id)
              .then((res) =>
                this.$awn.success(res?.message || 'Utilisateur supprimé')
              )
              .catch((e) =>
                this.$awn.alert(e?.message || 'Erreur lors de la suppression')
              );
          }
        },
      });
    },
  },
};
</script>

<style scoped></style>

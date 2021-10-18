<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Rôles</h3>
      <button type="button" class="btn btn-primary" @click="newRole">
        Nouveau rôle
      </button>
    </div>
    <div class="card-body">
      <table
        id="sap-cours"
        class="table table-sm table-responsive"
        cellspacing="0"
        width="100%"
      >
        <thead>
          <tr>
            <th data-field="date">Année</th>
            <th data-field="designation">Désignation</th>
            <th v-for="p in permissions" :key="p.id" class="text-center">
              {{ p.nom }}
            </th>
            <th data-field="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in formattedRoles" :key="r.id">
            <td>{{ r.nom }}</td>
            <td>{{ r.description }}</td>
            <td v-for="p in permissions" :key="p.id" class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="p.id + '-' + r.id"
                  :checked="r.permissions.includes(p.id)"
                  disabled
                />
                <label
                  class="custom-control-label"
                  :for="p.id + '-' + r.id"
                ></label>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="edit(r)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="remove(r)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadPermissions = store.dispatch('fetchPermissions');
  const loadRoles = store.dispatch('fetchRoles');

  Promise.all([loadPermissions, loadRoles]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabRoles',
  mounted() {},
  computed: {
    ...mapState({
      permissions: (state) => state.auth.permissions,
      roles: (state) => state.auth.roles,
    }),
    formattedRoles() {
      return this.roles.map((r) => ({
        ...r,
        permissions: r.permission_roles.map((p) => p.permission_id),
      }));
    },
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    edit(role) {
      this.SHOW_MODAL({ component: 'ModalRole', data: role });
    },
    newRole() {
      this.SHOW_MODAL({ component: 'ModalRole', data: {} });
    },
    remove(role) {
      this.$store.dispatch('deleteRole', role.id);
    },
  },
};
</script>

<style scoped></style>

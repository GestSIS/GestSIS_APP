<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Droits</h3>
      <button type="button" class="btn btn-primary">TODO What to do ???</button>
    </div>
    <div class="card-body table-responsive">
      <table id="sap-cours" class="table table-sm" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th data-field="date">Année</th>
            <th data-field="designation">Désignation</th>
            <th v-for="p in permissions" :key="p.id" class="text-center">{{ p.nom }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in formattedRoles" :key="r.id">
            <td>{{ r.nom }}</td>
            <td>{{ r.description }}</td>
            <td v-for="p in permissions" :key="p.id" class="text-center">
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" :id="p.id+'-'+r.id" :checked="r.permissions.includes(p.id)" disabled>
                <label class="custom-control-label" :for="p.id+'-'+r.id"></label>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  disabled
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  disabled
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
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadPermissions = store.dispatch('fetchPermissions');
  const loadRoles = store.dispatch('fetchRoles');

  Promise.all([
    loadPermissions,
    loadRoles,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabDroits',
  computed: {
    ...mapState({
      permissions: state => state.auth.permissions,
      roles: state => state.auth.roles
      // listeExerciceComptable: state => state.exerciceComptable.liste,
      // activeExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    formattedRoles() {
      return this.roles.map(r => ({
        ...r,
        permissions: r.permission_roles.map(p => p.permission_id)
      }))
    }
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {},
  methods: {
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
  watch: {},
};
</script>

<style scoped></style>

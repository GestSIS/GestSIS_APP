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
    <div class="card-body table-responsive">
      <table
        id="sap-cours"
        class="table table-sm table-responsive table-bordered"
        cellspacing="0"
        width="100%"
      >
        <thead>
          <tr>
            <th colspan="2"></th>
            <th
              v-for="[key, permissions] in groupedPermissions"
              :key="key"
              class="text-center text-capitalize"
              :colspan="permissions.length"
              :rowspan="permissions.length === 1 ? 2 : 1"
            >
              {{ moduleMapping(key) }}
            </th>
            <th data-field="actions" rowspan="2">Actions</th>
          </tr>
          <tr>
            <th data-field="date">Rôle</th>
            <th data-field="designation">Désignation</th>
            <template
              v-for="[key, permissions] in groupedPermissions"
              :key="key"
            >
              <th
                v-for="(p, i) in permissions"
                v-if="permissions.length !== 1"
                :key="i"
                class="text-center text-capitalize"
              >
                {{ permissionMapping(p.permission) }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in formattedRoles" :key="r.id">
            <td>{{ r.nom }}</td>
            <td>{{ r.description }}</td>
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadPermissions = store.dispatch('fetchPermissions');
  const loadRoles = store.dispatch('fetchRoles');

  Promise.all([loadPermissions, loadRoles]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabRoles',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      permissions: (state) =>
        state.auth.permissions.sort((a, b) => a.tri - b.tri),
      roles: (state) => state.auth.roles,
    }),
    formattedRoles() {
      return this.roles.map((r) => ({
        ...r,
        permissions: r.permission_roles.map((p) => parseInt(p.permission_id)),
      }));
    },
    groupedPermissions() {
      return Object.entries(
        this.permissions.reduce((acc, p) => {
          const keyParts = p.api_key.split('.');
          const key = keyParts[0];
          const permission = keyParts[1];
          if (!(key in acc)) {
            acc[key] = [];
          }
          acc[key].push({ ...p, permission });
          return acc;
        }, {})
      );
    },
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
    moduleMapping(key) {
      // Permet d'améliorer certains textes à afficher
      const mapping = {
        controle_medical: 'Contrôles médicaux',
        comptabilite: 'Comptabilité',
        organisation: 'Groupes',
        sis: 'Config générale',
        mat_perso: 'Matériel personnel',
        fiche_travail: 'Fiche de travail',
      };
      if (key in mapping) {
        return mapping[key];
      }
      return key;
    },
    permissionMapping(key) {
      // Permet d'améliorer certains textes à afficher
      const mapping = {
        saisie_perso: 'Saisie perso',
        saisie_commune: 'Saisie commune',
      };
      if (key in mapping) {
        return mapping[key];
      }
      return key;
    },
  },
};
</script>

<style scoped></style>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Permis de conduire</h3>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary flex-shrink-1"
        @click.prevent="savePermis"
      >
        Enregistrer
      </button>
    </div>
    <div class="card-body">
      <table class="table table-sm">
        <tbody>
          <tr
            v-for="permis in permisData"
            :key="permis.permis_type_id"
            :class="{ 'table-primary': permis.date }"
          >
            <td class="text-end">
              <font-awesome-icon
                v-if="permis.type.toLowerCase().includes('118')"
                class="text-danger"
                style="font-size: 1.7em"
                :icon="['fab', 'gripfire']"
              />
              <img
                :src="`${publicPath}permis/${permis.type
                  .toLowerCase()
                  .replace(' ', '_')}.gif`"
              />
            </td>
            <td>
              {{ permis.type }}
            </td>
            <td>
              <div class="input-group input-group-sm">
                <div class="input-group-text">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                </div>
                <input
                  v-model="permis.date"
                  type="date"
                  class="form-control form-control-sm"
                  :readonly="!hasEditPermission"
                  :class="{
                    'is-invalid': isInvalid(permis.permis_type_id),
                  }"
                />
                <button
                  v-if="(permis.date || '') !== '' && hasEditPermission"
                  type="button"
                  class="btn btn-outline-danger border-0"
                  @click="supprimerPermis(permis.permis_type_id)"
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
import permissions from '/src/store/permissions.js';

import store from '/src/store/index';
async function loadData(routeTo, next) {
  const loadPermis = store.dispatch('fetchPermisType');
  const loadSapeurPermis = store.dispatch('fetchSapeurPermis');

  Promise.all([loadPermis, loadSapeurPermis]).then(() => {
    next();
  });
}

export default {
  name: 'SapeurPermis',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      publicPath: import.meta.env.BASE_URL,
      permisData: {},
      errors: {},
    };
  },
  computed: {
    ...mapState({
      listPermisType: (state) => state.baseData.permisTypes,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurPermis: (state) => state.sapeur.active.permis,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
  },
  watch: {
    activeSapeurPermis() {
      this.initPermisData();
    },
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurPermis', id).then(() => {
        this.initPermisData();
      });
    },
  },
  mounted() {
    if (this.listPermisType.length === 0) {
      this.$store.dispatch('fetchPermisType').then(() => {
        this.$store
          .dispatch('fetchSapeurPermis', this.activeSapeurId)
          .then(() => {
            this.initPermisData();
          });
      });
    } else {
      this.$store
        .dispatch('fetchSapeurPermis', this.activeSapeurId)
        .then(() => {
          this.initPermisData();
        });
    }
  },
  methods: {
    initPermisData() {
      this.permisData = {};
      this.errors = {};

      this.listPermisType.forEach((p) => {
        this.permisData[p.id] = {
          permis_type_id: p.id,
          type: p.type,
          date: null,
          id: null,
        };
      });
      this.activeSapeurPermis.forEach((p) => {
        this.permisData[p.permis_type_id] = {
          ...this.permisData[p.permis_type_id],
          date: p.date,
          id: p.id,
        };
        this.permisData[p.permis_type_id].date = p.date;
      });
    },
    saveSuccessfull(permis_type_id) {
      this.errors = {
        ...this.errors,
        [permis_type_id]: undefined,
      };
    },
    saveError(permis_type_id, error) {
      this.errors = {
        ...this.errors,
        [permis_type_id]: error,
      };
    },
    supprimerPermis(permis_type_id) {
      this.permisData = {
        ...this.permisData,
        [permis_type_id]: {
          ...this.permisData[permis_type_id],
          date: '',
        },
      };
    },
    savePermis() {
      Object.values(this.permisData).forEach((p) => {
        //New one
        if (p.id === null && p.date !== null) {
          this.$store
            .dispatch('addPermis', {
              permis_type_id: p.permis_type_id,
              date: p.date,
            })
            .then(() => this.saveSuccessfull(p.permis_type_id))
            .catch((err) => this.saveError(p.permis_type_id, err));
        }
        //Removed
        else if (p.id !== null && (p.date === null || p.date === '')) {
          this.$store
            .dispatch('removePermis', p.id)
            .then(() => this.saveSuccessfull(p.permis_type_id))
            .catch((err) => this.saveError(p.permis_type_id, err));
        }
        //Edited
        else if (
          p.id !== null &&
          p.date !==
            this.activeSapeurPermis.find((permis) => permis.id == p.id).date
        ) {
          this.$store
            .dispatch('editPermis', { id: p.id, date: p.date })
            .then(() => this.saveSuccessfull(p.permis_type_id))
            .catch((err) => this.saveError(p.permis_type_id, err));
        } else {
          //Remove potential error messages
          this.saveSuccessfull(p.permis_type_id);
        }
      });
      this.$awn.success('Modifications enregistrées en avec succès');
    },
    isInvalid(key) {
      return this.errors[key] !== undefined;
    },
  },
};
</script>

<style scoped></style>

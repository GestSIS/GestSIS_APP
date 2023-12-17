<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Permis de conduire</h3>
    </div>
    <div class="card-body">
      <table class="table table-sm">
        <tbody>
          <tr v-for="permis in listPermisType" :key="permis.id">
            <!-- :class="{ 'table-primary': permis.date }" -->
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
                  :value="
                    activeSapeurPermis.find(
                      (p) => p.permis_type_id == permis.id
                    )?.date
                  "
                  type="date"
                  class="form-control form-control-sm"
                  disabled
                />
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

import store from '/src/store/index';
async function loadData(routeTo, next) {
  const loadPermisTypes = store.dispatch('fetchPermisType');
  const loadMesPermis = store.dispatch('fetchMesPermis');

  Promise.all([loadMesPermis, loadPermisTypes]).then(() => {
    next();
  });
}

export default {
  name: 'MesPermis',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      publicPath: import.meta.env.BASE_URL,
    };
  },
  computed: {
    ...mapState({
      listPermisType: (state) => state.baseData.permisTypes,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurPermis: (state) => state.mesInfos.permis,
    }),
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
  },
};
</script>

<style scoped></style>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Permis de conduire</h3>
    </div>
    <div class="card-body">
      <base-table
        :fields="fields"
        :data="permisData"
        :selectable="true"
        no-data="Aucun permis"
      >
        <template #head>
          <tr>
            <th colspan="2" class="text-center">Permis</th>
            <th>Date</th>
          </tr>
        </template>
        <template #logo="{ rowData }">
          <font-awesome-icon
            v-if="rowData.type.toLowerCase().includes('118')"
            class="text-danger"
            style="font-size: 1.7em"
            :icon="['fab', 'gripfire']"
          />
          <img
            :src="`${publicPath}permis/${rowData.type
              .toLowerCase()
              .replace(' ', '_')}.gif`"
          />
        </template>
      </base-table>
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
      fields: [
        {
          title: 'Permis',
          slot: 'logo',
          key: 'type',
          columnClass: 'col-1 text-end',
        },
        {
          key: 'type',
          columnClass: 'col-1 ',
        },
        {
          title: 'date',
          key: 'date',
          type: Date,
        },
      ],
    };
  },
  computed: {
    ...mapState({
      listPermisType: (state) => state.baseData.permisTypes,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurPermis: (state) => state.mesInfos.permis,
    }),
    permisData() {
      let permisData = Object.fromEntries(
        this.listPermisType.map((p) => [
          p.id,
          {
            id: p.id,
            type: p.type,
            date: null,
          },
        ])
      );
      this.activeSapeurPermis.forEach((p) => {
        permisData[p.permis_type_id] = {
          ...permisData[p.permis_type_id],
          date: p.date,
        };
      });
      return Object.values(permisData);
    },
  },
};
</script>

<style scoped></style>

<template>
  <div class="card card-primary card-outline mb-3 col-12 col-lg-6">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Sis</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        :fields="fields"
        :data="sis"
        :selectable="true"
        :hide-download="true"
        :detail-row-options="detailRowOptions"
        :detail-row-component="detailRowComponent"
        no-data="Aucun SIS"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editSis(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <!-- <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimer(value)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button> -->
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadSis = store.dispatch('loadSisListe');

  Promise.all([loadSis]).then(() => {
    next();
  });
}

export default {
  name: 'AdminSis',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        {
          title: 'id',
          key: 'id',
          sortKey: 'id',
        },
        {
          title: 'api_key',
          key: 'api_key',
          sortKey: 'api_key',
        },
        {
          title: 'Nom',
          key: 'nom',
          sortKey: 'nom',
        },
        {
          title: 'Description',
          key: 'description',
          sortKey: 'description',
        },
        {
          title: 'Mobile',
          key: 'mobile',
          sortKey: 'mobile',
          type: Boolean,
        },
        {
          title: 'Actions',
          key: 'id',
          slot: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      sis: (state) => state.admin.sis,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    editSis(sis) {
      this.SHOW_MODAL({ component: 'ModalSis', data: sis });
    },
  },
};
</script>

<style scoped></style>

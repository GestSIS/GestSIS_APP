<template>
  <div class="detail-row">
    <div v-if="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
    <table v-else-if="!ecritures.length" class="table mb-0">
      <tr>
        <th>Aucune écriture</th>
      </tr>
    </table>

    <table v-else class="table table-sm mb-0">
      <thead>
        <tr>
          <th
            v-for="(column, index) in columns"
            :key="index"
            :class="column.headerClassName || ''"
          >
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ecriture in ecritures" :key="ecriture.id">
          <td
            v-for="(column, index) in columns"
            :key="index"
            :class="{
              [column.className]: column.className,
              'text-danger':
                column.field === 'total' &&
                comptes.find((c) => c.id === ecriture.compte_id)?.produit,
            }"
          >
            {{
              column?.slot != 'checkbox' ? computeColumn(column, ecriture) : ''
            }}
            <input
              v-if="column?.slot == 'checkbox'"
              type="checkbox"
              disabled
              :checked="computeColumn(column, ecriture)"
              class="form-check-input"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FraisEcritureDetails',
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
    },
    options: {
      type: Object,
    },
  },
  data() {
    return {
      data: {},
      loading: true,
      columns: [],
      ecritures: [],
    };
  },
  computed: {
    ...mapState({
      comptes: (state) => state.compte.liste,
    }),
  },
  mounted() {
    this.loading = true;
    this.columns = this.rowData.columns;
    this.rowData.getEcritures().then((ecritures) => {
      this.ecritures = ecritures;
      this.loading = false;
    });
  },
  methods: {
    computeColumn(column, ecriture) {
      let formatter = column.formatter || ((a) => a);
      return formatter(ecriture[column.field], ecriture);
    },
  },
};
</script>

<style scoped>
.detail-row {
  margin-left: 33px;
  border-left: 1px solid lightgrey;
}

th {
  border-top: none;
}
</style>

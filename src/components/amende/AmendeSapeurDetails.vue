<template>
  <div class="detail-row">
    <div v-if="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
    <table v-else-if="!amendes.length" class="table mb-0">
      <tr>
        <th>Aucune donnée</th>
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
        <tr v-for="amende in amendes" :key="amende.id">
          <td
            v-for="(column, index) in columns"
            :key="index"
            :class="column.className || ''"
          >
            {{ computeColumn(column, amende) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AmendesSapeurDetails',
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
      amendes: [],
    };
  },
  mounted() {
    this.loading = true;
    this.columns = this.rowData.columns;
    this.amendes = this.rowData.amendes;
    this.loading = false;
  },
  methods: {
    computeColumn(column, amende) {
      let formatter = column.formatter || ((a) => a);
      return formatter(amende[column.field]);
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

<template>
  <div class="detail-row">
    <div class="spinner-border" role="status" v-if="loading">
      <span class="sr-only">Chargement...</span>
    </div>
    <table class="table mb-0" v-else-if="!amendes.length">
      <tr>
        <th colspan="*">Aucune donnée</th>
      </tr>
    </table>

    <table class="table mb-0" v-else>
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

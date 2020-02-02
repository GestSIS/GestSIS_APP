<template>
  <div class="detail-row">
    <div class="spinner-border" role="status" v-show="loading">
      <span class="sr-only">Loading...</span>
    </div>
    <table class="table mb-0" v-if="!loading && !ecritures.length">
      <tr>
        <th colspan="*">Aucune donnée</th>
      </tr>
    </table>
    <table class="table mb-0" v-if="!loading && ecritures.length">
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
            :class="column.className || ''"
          >
            {{ computeColumn(column, ecriture) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'FraisEcritureDetails',
  props: {
    rowData: {
      type: Object,
      required: true
    },
    rowIndex: {
      type: Number
    },
    options: {
      type: Object
    }
  },
  data() {
    return {
      data: {},
      loading: true,
      columns: [],
      ecritures: []
    };
  },
  mounted() {
    this.loading = true;
    this.columns = this.rowData.columns;
    this.rowData.getEcritures().then(ecritures => {
      this.ecritures = ecritures;
      this.loading = false;
    });
  },
  methods: {
    computeColumn(column, ecriture) {
      let formatter = column.formatter || (a => a);
      return formatter(ecriture[column.field]);
    }
  }
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

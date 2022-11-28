<template>
  <div class="detail-row">
    <div v-if="loading" class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>

    <base-table
      :loading="loading"
      :fields="options.fields"
      :no-data="options.noData ?? ''"
      :data="data"
      :hide-download="true"
    ></base-table>
  </div>
</template>

<script>
export default {
  name: 'GeneriqueDetailRow',
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
      default: () => {},
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: true,
      data: [],
    };
  },
  mounted() {
    this.loading = true;
    this.rowData.getData().then((data) => {
      this.data = data;
      this.loading = false;
    });
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

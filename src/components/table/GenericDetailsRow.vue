<template>
  <base-table
    :loading="loading"
    :fields="options.fields"
    :no-data="options.noData ?? ''"
    :data="data"
    :hide-download="true"
  />
</template>

<script>
export default {
  name: 'GeneriqueDetailRow',
  props: {
    rowData: {
      type: Object,
      required: true,
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
th {
  border-top: none;
}
</style>

<template>
  <base-table
    :fields="fields"
    :data="presences"
    :hide-download="true"
    no-data="Aucune présence"
  />
</template>

<script>
export default {
  name: 'InterventionPresenceDetails',
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
      data: {},
      loading: true,
      fields: [],
      presences: [],
    };
  },
  mounted() {
    this.loading = true;
    this.fields = this.options.fields;
    this.presences = this.rowData.presences;
  },
};
</script>

<style scoped>
th {
  border-top: none;
}
</style>

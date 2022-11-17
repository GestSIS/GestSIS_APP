<template>
  <div class="detail-row">
    <table v-if="!presences.length" class="table mb-0">
      <tr>
        <th>Aucune présence</th>
      </tr>
    </table>

    <base-table :fields="fields" :data="presences" :hide-download="true" />
  </div>
</template>

<script>
export default {
  name: 'InterventionPresenceDetails',
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
.detail-row {
  margin-left: 33px;
  border-left: 1px solid lightgrey;
}

th {
  border-top: none;
}
</style>

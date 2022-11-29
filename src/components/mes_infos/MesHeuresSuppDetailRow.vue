<template>
  <div class="detail-row">
    <base-table
      :fields="computedFields"
      :data="computedData"
      :hide-download="true"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MesHeuresSuppDetailRow',
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
  computed: {
    ...mapState({
      unites: (state) => state.unite.liste,
    }),
    computedData() {
      return [
        this.rowData.heures.reduce(
          (acc, h) => {
            acc['k' + h.id] = `${h.quantite} ${
              this.unites.find((u) => u.id == h.type_unite_id)?.unite
            }`;
            return acc;
          },
          { id: 1 }
        ),
      ];
    },
    computedFields() {
      return this.rowData.heures.map((h) => ({
        title: h.designation,
        key: 'k' + h.id,
        columnClass: 'col-3',
      }));
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

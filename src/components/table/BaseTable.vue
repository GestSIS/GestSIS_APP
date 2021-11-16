<template>
  <table class="table table-sm table-hover mb-0">
    <thead>
      <tr>
        <th
          v-for="f in fields"
          :key="f.key"
          @click="sort(f)"
          :class="f.titleClass"
        >
          {{ f.title }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!data.length">
        <td :colspan="fields.length">{{ noData }}</td>
      </tr>
      <template v-for="r in computedData">
        <tr
          :key="'main-' + r.id"
          @click="select(r)"
          :class="[
            selected == r[selectKey] ? rowSelectedClass : '',
            rowClass,
            typeof rowClass === 'function'
              ? rowClass(r, selected == r[selectKey])
              : rowClass,
          ]"
        >
          <td v-for="f in fields" :key="f.key" :class="f.columnClass">
            <slot
              :name="f.slot"
              v-bind="{
                key: f.key,
                value: r[f.key],
                actions,
                status: {
                  selected: selected == r[selectKey],
                  detailRowVisible: detailsRowVisibility[r.id],
                },
                rowData: r,
              }"
            >
              {{ (f.formatter || defaultFormatter)(r[f.key]) }}
            </slot>
          </td>
        </tr>
        <tr
          v-if="detailsRowVisibility[r.id]"
          :key="'detail-' + r.id"
          :class="r.rowClass"
        >
          <td :colspan="fields.length" class="p-0">
            <component
              :is="detailRowComponent"
              :class="detailRowClass"
              v-bind="{
                visible: detailsRowVisibility[r.id],
                rowData: r,
              }"
            >
            </component>
          </td>
        </tr>
      </template>
    </tbody>
    <!-- <thead>
      <tr>
        <th v-if="fields.length > 1"></th>
        <th :colspan="Math.max(fields.length - 1, 1)">
          Nb : {{ computedData.length }}
        </th>
      </tr>
    </thead> -->
  </table>
</template>

<script>
export default {
  name: 'base-table',
  props: {
    fields: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    noData: {
      type: String,
      default: () => 'Aucune donné à afficher',
    },
    filter: {
      type: Object,
      default: () => {},
    },
    selectable: {
      type: Boolean,
      default: () => false,
    },
    selectKey: {
      type: String,
      default: () => '',
    },
    rowClass: {
      type: [String, Function],
      default: () => '',
    },
    rowSelectedClass: {
      type: String,
      default: () => '',
    },
    detailRowComponent: {
      type: Object,
      default: () => {},
    },
    detailRowClass: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      sorted: {
        key: null,
        asc: false,
        func: (a) => a,
      },
      selected: null,
      detailsRowVisibility: {},
      defaultFormatter: (e) => e,
    };
  },
  watch: {
    data(val) {
      if (this.selected) {
        // Watcher pour déselectionner l'élément actif en cas de suppression
        const selectedKey = this.selected[this.selectKey];
        if (val.filter((e) => e[this.selectKey] === selectedKey).length <= 0) {
          this.$emit('selected', null);
        }
      }
    },
  },
  computed: {
    computedData() {
      const sorted = [...this.data];

      const func = this.sorted.func;
      const key = this.sorted.key;
      sorted.sort((a, b) => {
        const res = func(a[key]) < func(b[key]);
        return this.sorted.asc ? !res : res;
      });
      return sorted;
    },
    actions() {
      return {
        select: this.select,
        showDetailRow: this.showDetailRow,
        hideDetailRow: this.hideDetailRow,
        toggleDetailRow: this.toggleDetailRow,
      };
    },
  },
  methods: {
    sort(field) {
      if (field.sortKey) {
        if (this.sorted.key === field.sortKey) {
          this.sorted.asc = !this.sorted.asc;
        } else {
          this.sorted = { ...this.sorted, key: field.sortKey, asc: true };
          //TODO: Ajout support pour custom function of sort
        }
      }
    },
    select(row) {
      if (this.selectable) {
        this.selected = row[this.selectKey];
        this.$emit('selected', row);
      }
    },
    showDetailRow(id) {
      this.detailsRowVisibility = {
        ...this.detailsRowVisibility,
        [id]: true,
      };
    },
    hideDetailRow(id) {
      this.detailsRowVisibility = {
        ...this.detailsRowVisibility,
        [id]: false,
      };
    },
    toggleDetailRow(id) {
      this.detailsRowVisibility = {
        ...this.detailsRowVisibility,
        [id]: !this.detailsRowVisibility[id],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
th {
  cursor: pointer;
}
</style>

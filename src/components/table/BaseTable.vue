<template>
  <table class="table table-sm table-hover mb-0">
    <slot name="head">
      <thead>
        <tr>
          <th
            v-for="f in fields"
            :key="f.key"
            :class="f.titleClass"
            @click="sort(f)"
          >
            {{ f.title }}
          </th>
        </tr>
      </thead>
    </slot>
    <tbody>
      <tr v-if="!data.length">
        <td :colspan="fields.length">{{ noData }}</td>
      </tr>
      <!-- TODO: Replace id ? -->
      <template v-for="r in computedData" :key="'main-' + r.id">
        <tr
          :class="[
            selected == r[selectKey] ? rowSelectedClass : '',
            rowClass,
            typeof rowClass === 'function'
              ? rowClass(r, selected == r[selectKey])
              : rowClass,
          ]"
          @click="select(r)"
        >
          <td v-for="f in fields" :key="f.key" :class="f.columnClass">
            <!-- Boolean types -->
            <!-- TODO: Replace id ? -->
            <template v-if="f.type === 'boolean' || f.type === Boolean">
              <input
                :id="f.key + '-' + r.id"
                type="checkbox"
                class="form-check-input"
                :checked="r[f.key]"
                disabled
              /><label v-if="f.labelKey">{{ r[f.labelKey] }}</label>
            </template>
            <!-- Date types -->
            <template v-else-if="f.type === 'date'">
              {{ new Date(r[f.key]).toLocaleDateString() }}
            </template>
            <!-- No type -->
            <slot
              v-else
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
              {{ (f.formatter || defaultFormatter)(r[f.key], r) }}
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
    <tfoot>
      <slot name="foot"></slot>
    </tfoot>
  </table>
  <div v-if="!hideDownload" class="d-grid gap-2 d-md-block m-2">
    <button class="btn" title="Export CSV" @click="toCvs">
      <font-awesome-icon :icon="['fas', 'file-csv']" size="xl" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
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
      default: 'id',
    },
    rowClass: {
      type: [String, Function],
      default: () => '',
    },
    rowSelectedClass: {
      type: String,
      default: 'table-primary',
    },
    detailRowComponent: {
      type: Object,
      default: () => {},
    },
    detailRowClass: {
      type: String,
      default: () => '',
    },
    hideDownload: {
      type: Boolean,
      default: () => false,
    },
  },
  emits: ['selected'],
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
  watch: {
    data(val) {
      if (this.selected) {
        // Watcher pour déselectionner l'élément actif en cas de suppression
        const selectedKey = this.selected; //[this.selectKey];
        if (val.filter((e) => e[this.selectKey] === selectedKey).length <= 0) {
          this.$emit('selected', null);
        }
      }
    },
  },
  methods: {
    toCvs() {
      const data =
        'data:text/csv;charset=utf-8,\ufeff' +
        this.fields
          .filter((f) => !f.slot)
          .map((f) => f.title)
          .join(';') +
        '\n' +
        this.computedData
          .map((e) =>
            this.fields
              .filter((f) => !f.slot)
              .map((f) => {
                switch (f.type) {
                  case 'boolean':
                    return e[f.key] ? 'vrai' : 'faux';
                  case 'date':
                    return new Date(e[f.key]).toLocaleDateString();
                  default:
                    return (f.formatter || this.defaultFormatter)(e[f.key], e);
                }
              })
              .join(';')
          )
          .join('\n');

      // V1
      // const encodedUri = encodeURI(data);
      // window.open(encodedUri);

      // V2
      var encodedUri = encodeURI(data);
      var link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'export_gestsis.csv');
      document.body.appendChild(link); // Required for FF

      link.click();
    },
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

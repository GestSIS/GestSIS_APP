<template>
  <table class="table table-sm table-hover mb-0">
    <slot name="head">
      <thead>
        <tr>
          <th v-if="detailRowColumn && data.length">
            <button
              v-if="Object.values(detailsRowVisibility).find((e) => e)"
              class="btn btn-link border-0"
              @click="hideAllDetailRow"
            >
              <font-awesome-icon
                :icon="['fas', 'down-left-and-up-right-to-center']"
                :rotation="90"
              />
            </button>
            <button
              v-if="!Object.values(detailsRowVisibility).find((e) => e)"
              class="btn btn-link border-0"
              @click="showAllDetailRow"
            >
              <font-awesome-icon
                :icon="['fas', 'up-right-and-down-left-from-center']"
                :rotation="90"
              />
            </button>
          </th>
          <th
            v-for="f in fields"
            :key="f.key"
            :class="[
              f.titleClass,
              f.type === 'boolean' || f.type === Boolean ? 'text-center' : '',
            ]"
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

      <template v-for="r in computedData" :key="'main-' + r[selectKey]">
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
          <td v-if="detailRowColumn" class="details-width">
            <button
              v-if="!detailRowColumnHideButton(r)"
              class="btn btn-link border-0"
              @click="toggleDetailRow(r[selectKey])"
            >
              <font-awesome-icon
                v-if="detailsRowVisibility[r[selectKey]] || false"
                :icon="['fas', 'angle-down']"
              />
              <font-awesome-icon
                v-if="!detailsRowVisibility[r[selectKey]] || false"
                :icon="['fas', 'angle-right']"
              />
            </button>
          </td>
          <td
            v-for="f in fields"
            :key="f.key"
            :class="[
              f.columnClass,
              f.type === 'boolean' || f.type === Boolean ? 'text-center' : '',
            ]"
          >
            <!-- Boolean types -->
            <template v-if="f.type === 'boolean' || f.type === Boolean">
              <input
                :id="f.key + '-' + r[selectKey]"
                type="checkbox"
                class="form-check-input"
                :checked="r[f.key]"
                disabled
              /><label v-if="f.labelKey">{{ r[f.labelKey] }}</label>
            </template>
            <!-- Date types -->
            <template v-else-if="f.type === 'date' || f.type == Date">
              {{
                r[f.key]
                  ? new Date(r[f.key]).toLocaleDateString('fr-CH').slice(0, 10)
                  : ''
              }}
            </template>
            <!-- Date time types -->
            <template v-else-if="f.type === 'datetime'">
              {{ new Date(r[f.key]).toLocaleString('fr-CH').slice(0, 16) }}
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
                  detailRowVisible: detailsRowVisibility[r[selectKey]],
                },
                rowData: r,
              }"
            >
              {{ (f.formatter || defaultFormatter)(r[f.key], r) }}
            </slot>
          </td>
        </tr>
        <tr
          v-if="
            detailsRowVisibility[r[selectKey]] && !detailRowColumnHideButton(r)
          "
          :key="'detail-' + r[selectKey]"
          :class="r.rowClass"
        >
          <td :colspan="fields.length + (detailRowColumn ? 1 : 0)" class="p-0">
            <component
              :is="detailRowComponent"
              :options="detailRowOptions"
              :class="detailRowClass"
              v-bind="{
                visible: detailsRowVisibility[r[selectKey]],
                rowData: r,
              }"
            >
            </component>
          </td>
        </tr>
      </template>
    </tbody>
    <tfoot>
      <slot name="foot" v-bind="{ data }"></slot>
      <div v-if="!hideDownload" class="d-grid gap-2 d-md-block m-2">
        <button class="btn" title="Export CSV" @click="toCvs">
          <font-awesome-icon :icon="['fas', 'file-csv']" size="xl" />
        </button>
      </div>
    </tfoot>
  </table>
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
    detailRowColumn: {
      // Pour afficher la colonne détail-row
      type: Boolean,
      default: () => false,
    },
    detailRowColumnHideButton: {
      // Fonction pour cacher la bouton toggle detail-row de certaines lignes
      type: Function,
      default: () => false,
    },
    detailRowComponent: {
      type: Object,
      default: () => {},
    },
    detailRowOptions: {
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
      detailsRowVisibility: this.detailRowComponent
        ? Object.fromEntries(this.data.map((d) => [d[this.selectKey], false]))
        : {},
      defaultFormatter: (e) => e,
    };
  },
  computed: {
    computedData() {
      const sorted = [...this.data];
      const func = this.sorted.func;
      const key = this.sorted.key;
      sorted.sort((a, b) => {
        const aVal = func(a[key]);
        const bVal = func(b[key]);
        const res =
          typeof aVal === String ? aVal.localeCompare(bVal) : aVal < bVal;
        return (this.sorted.asc ? !res : res) ? 1 : -1;
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
        'data:text/csv;charset=utf-8,﻿' +
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
                  case Boolean:
                    return e[f.key] ? 'vrai' : 'faux';
                  case 'date':
                  case Date:
                    return e[f.key]
                      ? new Date(e[f.key]).toLocaleDateString('fr-CH')
                      : '';
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
      const sortKey = field.sortKey ?? field.key;
      if (sortKey) {
        if (this.sorted.key === sortKey) {
          this.sorted.asc = !this.sorted.asc;
        } else {
          this.sorted = { ...this.sorted, key: sortKey, asc: true };
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
    showAllDetailRow() {
      this.detailsRowVisibility = Object.fromEntries([
        ...Object.keys(this.detailsRowVisibility).map((key) => [key, true]),
        ...this.data.map((d) => [d[this.selectKey], true]),
      ]);
    },
    hideDetailRow(id) {
      this.detailsRowVisibility = {
        ...this.detailsRowVisibility,
        [id]: false,
      };
    },
    hideAllDetailRow() {
      this.detailsRowVisibility = Object.fromEntries({
        ...Object.keys(this.detailsRowVisibility).map((key) => [key, false]),
        ...this.data.map((d) => [d[this.selectKey], false]),
      });
    },
    toggleDetailRow(id) {
      this.detailsRowVisibility = {
        ...this.detailsRowVisibility,
        [id]: !this.detailsRowVisibility[id],
      };
    },
    toggleAllDetailRow() {
      this.detailsRowVisibility = Object.fromEntries({
        ...this.data.map((d) => [d[this.selectKey], true]),
        ...Object.entries(this.detailsRowVisibility).map(([key, value]) => [
          key,
          !value,
        ]),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
th {
  cursor: pointer;
}

.details-width {
  width: 8px;
}
</style>

<script setup>
import { computed, ref, useSlots, watch } from 'vue';

const {
  data,
  groupedData,
  fields,
  filter,
  noData,
  selectable,
  selectKey,
  rowClass,
  rowSelectedClass,
  detailRowColumn,
  detailRowColumnHideButton,
  detailRowComponent,
  detailRowOptions,
  detailRowClass,
  hideDownload,
} = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  groupedData: {
    type: Array,
    default: () => [],
  },
  fields: {
    type: Array,
    default: () => [],
  },
  filter: {
    type: Object,
    default: () => {},
  },
  loading: {
    type: Boolean,
    default: () => {},
  },

  noData: {
    type: String,
    default: () => 'Aucune donné à afficher',
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
});
const emit = defineEmits(['selected']);
const slots = useSlots();

const sorted = ref({
  key: null,
  asc: true,
  func: (a) => a,
});
const selected = ref(null);
const detailsRowVisibility = ref(
  !!slots['detail-row'] || detailRowComponent
    ? Object.fromEntries(data.map((d) => [d[selectKey], false]))
    : {},
);
const defaultFormatter = (e) => e;

const sortedData = computed(() => {
  const sortedData = [...data];
  const func = sorted.value.func;
  const key = sorted.value.key;
  if (key) {
    sortedData.sort((a, b) => {
      let aVal = func(a[key]);
      let bVal = func(b[key]);
      if (parseInt(aVal) == aVal && parseInt(bVal) == bVal) {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      }
      const res =
        typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
      return sorted.value.asc ? res : -1 * res;
    });
  }

  return sortedData;
});

const actions = computed(() => {
  return {
    select: select,
    showDetailRow: showDetailRow,
    hideDetailRow: hideDetailRow,
    toggleDetailRow: toggleDetailRow,
  };
});

watch(
  () => data,
  (val) => {
    if (selected) {
      // Watcher pour déselectionner l'élément actif en cas de suppression
      const selectedKey = selected; //[selectKey];
      if (val.filter((e) => e[selectKey] === selectedKey).length <= 0) {
        emit('selected', null);
      }
    }
  },
);

const toCvs = () => {
  const data =
    'data:text/csv;charset=utf-8,﻿' +
    fields
      .filter((f) => !f.slot)
      .map((f) => f.title)
      .join(';') +
    '\n' +
    sortedData.value
      .map((e) =>
        fields
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
                return (f.formatter || defaultFormatter)(e[f.key], e);
            }
          })
          .join(';'),
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
};

const sort = (field) => {
  const sortKey = field.sortKey ?? field.key;
  if (sortKey) {
    if (sorted.value.key === sortKey) {
      sorted.value.asc = !sorted.value.asc;
    } else {
      sorted.value = { ...sorted.value, key: sortKey, asc: true };
      //TODO: Ajout support pour custom function of sort
    }
  }
};
const select = (row) => {
  if (selectable) {
    selected.value = row[selectKey];
    emit('selected', row);
  }
};
const showDetailRow = (id) => {
  detailsRowVisibility.value = {
    ...detailsRowVisibility.value,
    [id]: true,
  };
};
const showAllDetailRow = () => {
  detailsRowVisibility.value = Object.fromEntries([
    ...Object.keys(detailsRowVisibility.value).map((key) => [key, true]),
    ...data.map((d) => [d[selectKey], true]),
  ]);
};
const hideDetailRow = (id) => {
  detailsRowVisibility.value = {
    ...detailsRowVisibility.value,
    [id]: false,
  };
};
const hideAllDetailRow = () => {
  detailsRowVisibility.value = Object.fromEntries([
    ...Object.keys(detailsRowVisibility.value).map((key) => [key, false]),
    ...data.map((d) => [d[selectKey], false]),
  ]);
};
const toggleDetailRow = (id) => {
  detailsRowVisibility.value = {
    ...detailsRowVisibility.value,
    [id]: !detailsRowVisibility.value[id],
  };
};
const toggleAllDetailRow = () => {
  detailsRowVisibility.value = Object.fromEntries({
    ...data.map((d) => [d[selectKey], true]),
    ...Object.entries(detailsRowVisibility.value).map(([key, value]) => [
      key,
      !value,
    ]),
  });
};

defineExpose({
  toggleAllDetailRow,
  toggleDetailRow,
  hideAllDetailRow,
  hideDetailRow,
  showAllDetailRow,
  showDetailRow,
});
</script>

<template>
  <div v-if="loading" class="p-3 d-flex justify-content-center">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  </div>
  <table v-show="!loading" class="table table-sm table-hover mb-0">
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
            <font-awesome-icon
              v-if="f.key && sorted.key == (f.sortKey ?? f.key) && sorted.asc"
              :icon="['fas', 'sort-down']"
            />
            <font-awesome-icon
              v-else-if="
                f.key && sorted.key == (f.sortKey ?? f.key) && !sorted.asc
              "
              :icon="['fas', 'sort-up']"
            />
            <font-awesome-icon v-else-if="f.key" :icon="['fas', 'sort']" />
            {{ f.title }}
          </th>
        </tr>
      </thead>
    </slot>
    <tbody v-show="loading">
      <tr>
        <td :colspan="fields.length + (detailRowColumn ? 1 : 0)">
          <div class="d-flex justify-content-center m-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
    <tbody
      v-show="!loading"
      v-for="groupe in groupedData.length === 0
        ? [{ key: 'default', data: sortedData }]
        : groupedData"
      :key="groupe.key"
    >
      <tr v-if="!groupe.data.length">
        <td :colspan="fields.length">{{ noData }}</td>
      </tr>

      <tr v-if="groupedData.length > 0" class="table-secondary">
        <th :colspan="fields.length">
          <slot name="groupeHeader" v-bind="groupe">{{ groupe.label }}</slot>
        </th>
      </tr>

      <template v-for="r in groupe.data" :key="'main-' + r[selectKey]">
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
            <template v-else-if="f.type === 'datetime' || f.type == Date">
              {{
                r[f.key]
                  ? new Date(r[f.key]).toLocaleString('fr-CH').slice(0, 16)
                  : ''
              }}
            </template>
            <template v-else-if="f.type === 'time'">
              {{
                r[f.key]
                  ? new Date(r[f.key]).toLocaleString('fr-CH').slice(11, 16)
                  : ''
              }}
            </template>
            <template v-else-if="f.type === 'number' || f.type == Number">
              {{
                r[f.key]
                  ? parseFloat(r[f.key])?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  : ''
              }}
            </template>
            <!-- Multiline types -->
            <template v-else-if="f.type === 'multiline'">
              <template
                v-for="(line, i) in r[f.key].toString().split('\n')"
                :key="i"
              >
                {{ line }}<br />
              </template>
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
                formatter: f.formatter || defaultFormatter,
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
          <td
            :colspan="fields.length + (detailRowColumn ? 1 : 0)"
            class="p-0 detail-row"
          >
            <slot name="detail-row" v-bind="{ rowData: r }">
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
            </slot>
          </td>
        </tr>
      </template>
    </tbody>
    <tfoot v-show="!loading">
      <slot name="foot" v-bind="{ data }"></slot>
      <div v-if="!hideDownload" class="d-grid gap-2 d-md-block m-2">
        <button class="btn" title="Export CSV" @click="toCvs">
          <font-awesome-icon :icon="['fas', 'file-csv']" size="xl" />
        </button>
      </div>
    </tfoot>
  </table>
</template>

<style lang="scss" scoped>
th,
tr {
  cursor: pointer;
}

.details-width {
  width: 8px;
}

.detail-row > * {
  margin-left: 33px;
  border-left: 1px solid lightgrey;
}
</style>

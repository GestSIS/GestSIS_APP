<script setup>
import { computed, ref, useSlots, watch } from "vue";

const {
  data,
  groupedData,
  fields,
  noData,
  selectable,
  selectKey,
  rowClass,
  rowSelectedClass,
  detailRowColumn,
  detailRowColumnHideButton,
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
  loading: {
    type: Boolean,
    default: false,
  },

  noData: {
    type: String,
    default: () => "Aucune donné à afficher",
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  selectKey: {
    type: String,
    default: "id",
  },
  rowClass: {
    type: [String, Function],
    default: () => "",
  },
  rowSelectedClass: {
    type: String,
    default: "table-primary",
  },
  detailRowColumn: {
    // Pour afficher la colonne détail-row
    type: Boolean,
    default: false,
  },
  detailRowColumnHideButton: {
    // Fonction pour cacher la bouton toggle detail-row de certaines lignes
    type: Function,
    default: () => false,
  },
  hideDownload: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["selected"]);
const slots = useSlots();

const sorted = ref({
  key: null,
  asc: true,
  func: (a) => a,
});
const selected = ref(null);
const detailsRowVisibility = ref(
  slots["detail-row"] ? Object.fromEntries(data.map((d) => [d[selectKey], false])) : {},
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
      if (parseInt(aVal, 10) == aVal && parseInt(bVal, 10) == bVal) {
        aVal = parseInt(aVal, 10);
        bVal = parseInt(bVal, 10);
      }
      const res = typeof aVal === "string" ? aVal.localeCompare(bVal) : aVal - bVal;
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
    if (selected.value) {
      // Watcher pour déselectionner l'élément actif en cas de suppression
      if (val.filter((e) => e[selectKey] === selected.value).length <= 0) {
        emit("selected", null);
      }
    }
  },
);

// Neutralise l'injection de formule : une valeur saisie (y compris via le formulaire public
// de recrutement) qui commence par = + - @ ou un caractère de contrôle serait interprétée
// comme formule par Excel/LibreOffice. Les nombres (négatifs inclus) restent intacts.
const isPlainNumber = (s) => /^[-+]?\d+([.,]\d+)?$/.test(s);
const neutralizeFormula = (s) => (/^[=+\-@\t\r]/.test(s) && !isPlainNumber(s) ? "'" + s : s);

// Quote values containing the delimiter, quotes or newlines (RFC 4180),
// otherwise a ";" inside a value shifts the columns of the export
const csvEscape = (value) => {
  const s = neutralizeFormula(String(value ?? ""));
  return /[";\n\r]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
};

const exportRows = computed(() =>
  groupedData.length > 0 ? groupedData.flatMap((g) => g.data) : sortedData.value,
);

const toCvs = () => {
  // "\ufeff" = BOM UTF-8 : sans lui Excel ouvre le CSV en Latin-1 et casse les accents
  const csv =
    "\ufeff" +
    fields
      .filter((f) => !f.slot)
      .map((f) => csvEscape(f.title))
      .join(";") +
    "\n" +
    exportRows.value
      .map((e) =>
        fields
          .filter((f) => !f.slot)
          .map((f) => {
            switch (f.type) {
              case "boolean":
              case Boolean:
                return e[f.key] ? "vrai" : "faux";
              case "date":
              case Date:
                return e[f.key] ? new Date(e[f.key]).toLocaleDateString("fr-CH") : "";
              default:
                return csvEscape((f.formatter || defaultFormatter)(e[f.key], e));
            }
          })
          .join(";"),
      )
      .join("\n");

  // Blob instead of an encodeURI data: URI, which truncated the file at the
  // first "#" (fragment separator) found in a value
  const url = window.URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  var link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "export_gestsis.csv");
  document.body.appendChild(link); // Required for FF
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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
    emit("selected", row);
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
  const allVisible = data.every((d) => detailsRowVisibility.value[d[selectKey]]);
  detailsRowVisibility.value = Object.fromEntries(data.map((d) => [d[selectKey], !allVisible]));
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
  <table v-show="!loading" class="table table-sm table-hover mb-0" v-bind="$attrs">
    <slot name="head">
      <thead>
        <tr>
          <th v-if="detailRowColumn && (data.length || groupedData.length)">
            <button
              v-if="data.every((d) => detailsRowVisibility[d[selectKey]])"
              class="btn btn-link border-0"
              @click="hideAllDetailRow"
            >
              <font-awesome-icon
                :icon="['fas', 'down-left-and-up-right-to-center']"
                :rotation="90"
              />
            </button>
            <button v-else class="btn btn-link border-0" @click="showAllDetailRow">
              <font-awesome-icon
                :icon="['fas', 'up-right-and-down-left-from-center']"
                :rotation="90"
              />
            </button>
          </th>
          <th
            v-for="f in fields"
            :key="f.key"
            :class="[f.titleClass, f.type === 'boolean' || f.type === Boolean ? 'text-center' : '']"
            @click="sort(f)"
          >
            <font-awesome-icon
              v-if="f.key && sorted.key == (f.sortKey ?? f.key) && sorted.asc"
              :icon="['fas', 'sort-down']"
            />
            <font-awesome-icon
              v-else-if="f.key && sorted.key == (f.sortKey ?? f.key) && !sorted.asc"
              :icon="['fas', 'sort-up']"
            />
            <font-awesome-icon v-else-if="f.key" :icon="['fas', 'sort']" />
            {{ f.title }}
          </th>
        </tr>
      </thead>
    </slot>
    <tbody
      v-for="groupe in groupedData.length === 0
        ? [{ key: 'default', data: sortedData }]
        : groupedData"
      v-show="!loading"
      :key="groupe.key"
    >
      <tr v-if="!groupe.data.length">
        <td :colspan="fields.length + (detailRowColumn ? 1 : 0)">
          {{ noData }}
        </td>
      </tr>

      <tr v-if="groupedData.length > 0" class="table-secondary">
        <th :colspan="fields.length + (detailRowColumn ? 1 : 0)">
          <slot name="groupeHeader" v-bind="groupe">{{ groupe.label }}</slot>
        </th>
      </tr>

      <template v-for="r in groupe.data" :key="'main-' + r[selectKey]">
        <tr
          :class="[
            selected == r[selectKey] ? rowSelectedClass : '',
            typeof rowClass === 'function' ? rowClass(r, selected == r[selectKey]) : rowClass,
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
                v-if="!detailsRowVisibility[r[selectKey]]"
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
              {{ r[f.key] ? new Date(r[f.key]).toLocaleDateString("fr-CH").slice(0, 10) : "" }}
            </template>
            <template v-else-if="f.type === 'datetime'">
              {{ r[f.key] ? new Date(r[f.key]).toLocaleString("fr-CH").slice(0, 16) : "" }}
            </template>
            <template v-else-if="f.type === 'time'">
              {{ r[f.key] ? new Date(r[f.key]).toLocaleString("fr-CH").slice(11, 16) : "" }}
            </template>
            <template v-else-if="f.type === 'number' || f.type == Number">
              {{
                r[f.key]
                  ? parseFloat(r[f.key])?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })
                  : ""
              }}
            </template>
            <!-- Multiline types -->
            <template v-else-if="f.type === 'multiline'">
              <template v-for="(line, i) in (r[f.key] ?? '').toString().split('\n')" :key="i">
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
          v-if="detailsRowVisibility[r[selectKey]] && !detailRowColumnHideButton(r)"
          :key="'detail-' + r[selectKey]"
          :class="r.rowClass"
        >
          <td :colspan="fields.length + (detailRowColumn ? 1 : 0)" class="p-0 detail-row">
            <div>
              <slot name="detail-row" v-bind="{ rowData: r }"></slot>
            </div>
          </td>
        </tr>
      </template>
    </tbody>
    <tfoot v-show="!loading">
      <slot name="foot" v-bind="{ data }"></slot>
      <tr v-if="!hideDownload">
        <td :colspan="fields.length + (detailRowColumn ? 1 : 0)" class="p-0">
          <button class="btn m-2" title="Export CSV" @click="toCvs">
            <font-awesome-icon :icon="['fas', 'file-csv']" size="xl" />
          </button>
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<style scoped>
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

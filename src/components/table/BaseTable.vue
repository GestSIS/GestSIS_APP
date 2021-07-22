<template>
  <table class="table table-sm mb-0">
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
      <tr
        v-for="r in computedData"
        :key="r.id"
        @click="select(r)"
        :class="r.rowClass"
      >
        <td v-for="f in fields" :key="f.key">
          <slot
            :name="f.slot"
            v-bind="{ key: f.key, value: r[f.key], rowData: r }"
          >
            {{ r[f.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
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
  },
  data() {
    return {
      sorted: {
        key: null,
        asc: false,
        func: (a) => a,
      },
      selected: null,
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
  methods: {
    sort(field) {
      if (field.sortKey) {
        if (this.sorted.key === field.sortKey) {
          this.sorted.asc = !this.sorted.asc;
        } else {
          (this.sorted.key = field.sortKey), (this.sorted.asc = true);
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
  },
  computed: {
    computedData() {
      const sorted = [...this.data].map((e) => {
        if (e[this.selectKey] == this.selected) {
          return { ...e, rowClass: 'table-primary' };
        } else {
          return e;
        }
      });

      const func = this.sorted.func;
      const key = this.sorted.key;
      sorted.sort((a, b) => {
        const res = func(a[key]) < func(b[key]);
        return this.sorted.asc ? res : !res;
      });
      return sorted;
    },
  },
};
</script>

<style lang="scss" scoped>
th {
  cursor: pointer;
}
</style>
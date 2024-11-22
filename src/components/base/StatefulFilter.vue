<template>
  <slot
    name="default"
    v-bind="{ setFilter, filters, filteredData, reset, canReset }"
  ></slot>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StatefulFilter',
  inheritsAttrs: false,
  props: {
    id: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      filters: {},
    };
  },
  computed: {
    ...mapState({
      sisKey: (state) => state.auth.sis.activeKey,
    }),
    filteredData() {
      return this.data.filter(
        Object.entries(this.filters)
          .filter(
            ([, val]) =>
              (val || val == 0) && (val >= 0 || typeof val == 'function')
          )
          .map(([key, value]) => {
            if (typeof value == 'function') {
              return (x) => value(x[key]);
            } else {
              return (x) => x[key] == value;
            }
          })
          .reduce(
            (f, g) => (x) => f(x) && g(x),
            () => true
          )
      );
    },
    canReset() {
      return !!Object.entries(this.filters).find(([, value]) => value) ?? false;
    },
  },
  watch: {
    sisKey() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.filters = {
        ...JSON.parse(
          localStorage.getItem(`${this.sisKey}-${this.id}`) ?? '{}'
        ),
      };
    },
    setFilter(key, value) {
      const types = new Set(['function', 'undefined']);
      this.filters = {
        ...this.filters,
        [key]: types.has(typeof value) ? value : parseInt(value),
      };
      localStorage.setItem(
        `${this.sisKey}-${this.id}`,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(this.filters).filter(
              ([, value]) => !types.has(typeof value) && value != null
            )
          )
        )
      );
    },
    reset() {
      this.filters = {};
    },
  },
};
</script>

<style lang="scss" scoped></style>

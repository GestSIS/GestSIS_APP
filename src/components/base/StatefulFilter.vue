<template>
  <slot name="default" v-bind="{ setFilter, filteredData }"></slot>
</template>

<script>
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
    filteredData() {
      // return this.data.filter(
      //   Object.entries(this.filters)
      //     .filter(([, val]) => val >= 0)
      //     .map(
      //       ([key, value]) =>
      //         (x) =>
      //           x[key] == value
      //     )
      //     .reduce(
      //       (f, g) => (x) => f(x) && g(x),
      //       () => true
      //     )
      // );

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
  },
  methods: {
    setFilter(key, value) {
      this.filters = {
        ...this.filters,
        [key]: typeof value === 'function' ? value : parseInt(value),
      };
    },
  },
};
</script>

<style lang="scss" scoped></style>

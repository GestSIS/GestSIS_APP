<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
const default_layout = 'default';
const loading = 'empty';

export default {
  computed: {
    layout() {
      return (
        (!this.$route.name
          ? loading
          : this.$route.meta.layout || default_layout) + '-layout'
      );
    },
  },
};
</script>

<style lang="scss">
@import 'floating-vue/dist/style.css';
@import 'nprogress/nprogress.css';

@import './assets/sass/main.scss';
</style>

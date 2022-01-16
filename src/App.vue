<template>
  <component :is="layout">
    <router-view />
    <!-- <notifications group="succes" position="top center" :duration="2000" />
    <notifications group="erreur" position="top center" :duration="2000" /> -->
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

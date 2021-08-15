<template>
  <div>

  </div>
</template>

<script>

import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      reference: (state) => state.rta.data,
      sapeurs: (state) => state.sapeur.liste,
    })
  },
};
</script>

<style lang="scss" scoped>

</style>
<template>
  <div class="wrapper">
    <div class="content">
      <app-navbar />
      <slot />
    </div>
    <app-modal />
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import AppModal from '@/components/AppModal.vue';

export default {
  name: 'NoSidebarLayout',
  components: {
    AppNavbar,
    AppModal,
  },
};
</script>

<style scoped>
.content {
  flex-grow: 1;
  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: auto;
  /*adds scroll to this container*/
}

.wrapper {
  display: flex;
  width: 100%;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}
</style>

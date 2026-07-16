<script setup>
import AppNavbar from "/src/components/AppNavbar.vue";
import AppModal from "/src/components/AppModal.vue";
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <app-navbar :no-sidebar="true" />
      <slot />
    </div>
    <app-modal />
  </div>
</template>

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

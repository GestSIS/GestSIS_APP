<script setup>
import AppModal from "/src/components/AppModal.vue";
import AppTitrePage from "/src/components/AppTitrePage.vue";
</script>

<template>
  <div class="wrapper">
    <main id="contenu" class="content">
      <app-titre-page />
      <slot></slot>
    </main>
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

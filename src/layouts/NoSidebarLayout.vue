<script setup>
import AppNavbar from "/src/components/AppNavbar.vue";
import AppModal from "/src/components/AppModal.vue";
import AppTitrePage from "/src/components/AppTitrePage.vue";
import { allerAuContenu } from "/src/tools/titrePage.js";
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <a
        href="#contenu"
        class="visually-hidden-focusable lien-evitement"
        @click.prevent="allerAuContenu"
      >
        Aller au contenu
      </a>
      <header>
        <app-navbar :no-sidebar="true" />
      </header>
      <main id="contenu">
        <app-titre-page />
        <slot />
      </main>
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

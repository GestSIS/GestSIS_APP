<template>
  <div class="wrapper">
    <div class="content">
      <navbar />
      <slot />
      <footer />
    </div>
    <app-modal />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar';
import AppModal from '@/components/AppModal';

export default {
  components: {
    Navbar,
    AppModal
  }
};
</script>

<style scoped>

.content {
  flex-grow: 1; /*ensures that the container will take up the full height of the parent container*/
  overflow-y: auto; /*adds scroll to this container*/
}

.wrapper {
  display: flex;
  width: 100%;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}
</style>

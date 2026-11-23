<script setup>
// TODO: à implémenter
const photo = ref(null); // https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128
</script>

<template>
  <base-card title="Photo" body-class="text-center">
    <template #body>
      <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
      <img v-else class="img img-responsive" :src="photo" />
    </template>
  </base-card>
</template>

<style scoped>
img {
  max-width: 128px;
}
</style>

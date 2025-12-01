<script setup>
// TODO: à implémenter
const photo = ref(null); // https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=128
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Photo</h3>
    </div>
    <div class="card-body text-center">
      <font-awesome-icon v-if="!photo" :icon="['fas', 'user']" size="10x" />
      <img v-else class="img img-responsive" :src="photo" />
    </div>
  </div>
</template>

<style scoped>
img {
  max-width: 128px;
}
</style>

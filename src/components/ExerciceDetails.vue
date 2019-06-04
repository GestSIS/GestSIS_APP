<template>
  <div id="app">
    <p>Hello World !!! {{ id }}, //TODO</p>
    <router-link
      replace
      tag="button"
      :to="'/exercices/'"
      class="btn btn-outline-primary border-0"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ExerciceDetails',
  data() {
    return {
      data: {}
    }
  },
  computed: {
    self() {
      console.log(this)
      return this.data
    }
  }
}
</script>

<style scoped></style>

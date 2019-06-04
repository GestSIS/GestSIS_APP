<template>
  <div class="d-flex justify-content-center">
    <!--    <router-link-->
    <!--      tag="button"-->
    <!--      :to="'/exercices/' + data.id"-->
    <!--      class="btn btn-outline-primary border-0"-->
    <!--    >-->
    <!--      <font-awesome-icon :icon="['far', 'edit']" />-->
    <!--    </router-link>-->
    <button
      type="button"
      class="btn btn-outline-primary border-0"
      @click="editExercice(5)"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </button>
    <a
      type="button"
      href="#"
      class="btn btn-outline-danger border-0"
      @click="supprimerExercice(12)"
    >
      <font-awesome-icon :icon="['far', 'trash-alt']" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'ExerciceActions',
  data() {
    return {
      data: {}
    }
  },
  computed: {
    test() {
      return this.$store
    }
  },
  methods:{
    editExercice(id){
      this.$router.dispatch('exercices/'+id)
    },
    supprimerExercice(){
      //TODO
    }
  }
}
</script>

<style scoped></style>

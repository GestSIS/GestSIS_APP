<template>
  <div class="exercice-comptable" v-if="currentExerciceComptableId">
    Exercice comptable
    <button class="ml-1 btn btn-outline-primary" @click="details">
      {{ getExerciceComptable(currentExerciceComptableId).annee }}
      <font-awesome-icon class="ml-2" :icon="['fas', 'angle-down']" />
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ExerciceComptable',
  methods: {
    details() {}
  },
  computed: {
    ...mapGetters([
      'listExerciceComptable',
      'currentExerciceComptableId',
      'getExerciceComptable'
    ])
  },
  mounted() {
    if (this.listExerciceComptable.length === 0) {
      this.$store.dispatch('fetchExercicesComptables')
    }
  }
}
</script>

<style scoped>
.exercice-comptable {
  padding: 0.5rem 1rem;
}
</style>

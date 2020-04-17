<template>
  <div class="exercice-comptable" v-if="currentExerciceComptableId">
    <div class="dropdown">
      Exercice comptable
      <button
        class="ml-1 btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-toggle="dropdown"
        @click="dropdown = !dropdown"
      >
        {{ getExerciceComptable(currentExerciceComptableId).annee }}
      </button>
      <div
        class="dropdown-menu"
        :class="{ show: dropdown }"
        aria-labelledby="dropdownMenu2"
      >
        <button
          v-for="e in listExerciceComptable"
          :key="e.id"
          @click="selectExercice(e.id)"
          class="dropdown-item"
          :class="{ active: currentExerciceComptableId === e.id }"
          type="button"
        >
          {{ e.annee }}
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" type="button">Paramètres</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'ExerciceComptable',
  computed: {
    ...mapState({
      listExerciceComptable: state => state.exerciceComptable.liste,
      currentExerciceComptableId: state => state.exerciceComptable.activeId
    }),
    ...mapGetters(['getExerciceComptable'])
  },
  data() {
    return {
      dropdown: false
    };
  },
  mounted() {
    if (this.listExerciceComptable.length === 0) {
      this.$store.dispatch('fetchExercicesComptables');
    }
  },
  methods: {
    selectExercice(id) {
      this.dropdown = false;
      this.$store.dispatch('selectExerciceComptable', id);
    }
  }
};
</script>

<style scoped>
.exercice-comptable {
  padding: 0.5rem 1rem;
}
</style>

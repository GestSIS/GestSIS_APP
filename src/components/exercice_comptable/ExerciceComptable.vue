<template>
  <div
    v-if="activeExerciceComptable"
    class="exercice-comptable d-flex align-items-center"
  >
    <span>Exercice comptable</span>
    <base-dropdown
      ref="dropdown"
      :title="activeExerciceComptable?.annee?.toString()"
      menu-class="dropdown-menu-end"
      button-class="ms-1 btn btn-outline-secondary"
    >
      <template #default>
        <button
          v-for="e in listeExerciceComptable"
          :key="e.id"
          class="dropdown-item"
          :class="{ active: activeExerciceComptable?.id === e.id }"
          :type="activeExerciceComptable?.annee"
          @click="selectExercice(e.id)"
        >
          {{ e.annee }}
        </button>
        <div v-if="hasConfigPermission" class="dropdown-divider"></div>
        <router-link
          v-if="hasConfigPermission"
          v-slot="{ navigate }"
          :to="{
            name: 'param-exercice-comptable',
          }"
          custom
        >
          <button class="dropdown-item" @click="navigate">Paramètres</button>
        </router-link>
      </template>
    </base-dropdown>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'ExerciceComptable',
  computed: {
    ...mapState({
      listeExerciceComptable: (state) =>
        state.exerciceComptable.liste.sort((a, b) => b.annee - a.annee),
      activeExerciceComptable: (state) =>
        state.exerciceComptable.liste.find(
          (e) => e.id == state.exerciceComptable.activeId
        ),
      hasConfigPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.COMPTABILITE.CONFIG),
    }),
  },
  mounted() {
    if (this.listeExerciceComptable.length === 0) {
      this.$store.dispatch('fetchExercicesComptables');
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selectExercice(id) {
      this.$refs.dropdown.close();
      this.dropdown = false;
      this.$store.dispatch('selectExerciceComptable', id);
    },
  },
};
</script>

<style scoped>
.exercice-comptable {
  padding: 0.5rem 1rem;
  padding-right: 0px;
}
</style>

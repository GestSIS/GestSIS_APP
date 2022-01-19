<template>
  <div
    class="exercice-comptable d-flex align-items-center"
    v-if="currentExerciceComptableId"
  >
    <span>Exercice comptable</span>
    <base-dropdown
      :title="getExerciceComptable(currentExerciceComptableId).annee.toString()"
      menuClass="dropdown-menu-end"
      buttonClass="ms-1 btn btn-outline-secondary"
      ref="dropdown"
    >
      <template #default>
        <button
          v-for="e in listeExerciceComptable"
          :key="e.id"
          @click="selectExercice(e.id)"
          class="dropdown-item"
          :class="{ active: currentExerciceComptableId === e.id }"
          :type="getExerciceComptable(currentExerciceComptableId).annee"
        >
          {{ e.annee }}
        </button>
        <div class="dropdown-divider" v-if="hasConfigPermission"></div>
        <router-link
          :to="{ name: 'param-exercice-comptable' }"
          custom
          v-slot="{ navigate }"
          v-if="hasConfigPermission"
        >
          <button
            class="dropdown-item"
            @click="navigate"
          >
          Paramètres
          </button>
        </router-link>
      </template>
    </base-dropdown>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'ExerciceComptable',
  computed: {
    ...mapState({
      listeExerciceComptable: (state) => state.exerciceComptable.liste,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasConfigPermission: (state) =>
        state.auth.sis.permissions.includes(permissions.COMPTABILITE.CONFIG),
    }),
    ...mapGetters(['getExerciceComptable']),
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

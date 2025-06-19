<script setup>
import { computed, useTemplateRef } from 'vue';
import { useStore } from 'vuex';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();

const listeExerciceComptable = computed(() =>
  store.state.exerciceComptable.liste.sort((a, b) => b.annee - a.annee),
);
const activeExerciceComptable = computed(() =>
  store.state.exerciceComptable.liste.find(
    (e) => e.id == store.state.exerciceComptable.activeId,
  ),
);
const hasConfigPermission = useHasPermission(permissions.COMPTABILITE.CONFIG);

if (listeExerciceComptable.value.length === 0) {
  store.dispatch('fetchExercicesComptables');
}

const dropdownComponent = useTemplateRef('dropdown');
const selectExercice = (id) => {
  dropdownComponent.value.close();
  dropdownComponent.value.value = false;
  store.dispatch('selectExerciceComptable', id);
};
</script>

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

<style scoped>
.exercice-comptable {
  padding: 0.5rem 1rem;
  padding-right: 0px;
}
</style>

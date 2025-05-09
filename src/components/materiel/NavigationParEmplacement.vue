<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { groupedByData, indexedData } from '../../tools';
import TagCouleur from './TagCouleur.vue';

const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();

couleurStore.fetchCouleurs();
emplacementStore.fetchEmplacements();

const emplacements = computed(() => emplacementStore.liste);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const emplacementsGroupedByParent = computed(() =>
  groupedByData(emplacements.value, 'parent_id'),
);

const computedData = computed(() => {
  const recursive = (parent_id, level = 0) => {
    return [...(emplacementsGroupedByParent.value[parent_id] ?? [])].flatMap(
      (elem) => [{ ...elem, level }, ...recursive(elem.id, level + 1)],
    );
  };

  return recursive(null);
});
</script>

<template>
  <ul class="list-group list-group-flush">
    <li v-if="computedData.length === 0" class="list-group-item pt-1 pb-1">
      <span class="border-bottom-0">Aucun emplacement</span>
    </li>
    <router-link
      v-for="item in computedData.slice(0)"
      :key="item.globalId"
      v-slot="{ navigate, isExactActive }"
      :style="{
        'padding-left': item.level * 25 + 'px',
      }"
      custom
      :to="{
        name: 'materiel-par-emplacement-details',
        params: { id: item.id },
      }"
    >
      <a
        class="nav-link list-group-item list-group-item-action pt-1 pb-1"
        href="#"
        role="link"
        :class="{ 'bg-primary-subtle': isExactActive }"
        @click="navigate"
      >
        <tag-couleur :couleur="indexedCouleurs[item.couleur_id]">
          {{ item.designation }}
        </tag-couleur>
      </a>
    </router-link>
  </ul>
</template>

<style scoped></style>

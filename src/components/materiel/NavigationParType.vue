<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { groupedByData, indexedData } from '../../tools';

const typeStore = useMaterielTypeStore();
const categorieStore = useMaterielCategorieStore();
const couleurStore = useCouleurStore();

typeStore.fetchMaterielTypes();
categorieStore.fetchMaterielCategories();
couleurStore.fetchCouleurs();

const types = computed(() =>
  [...typeStore.liste].sort((a, b) => a.designation - b.designation)
);
const categories = computed(() =>
  [...categorieStore.liste].sort((a, b) => a.designation - b.designation)
);
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const computedData = computed(() => {
  let typesGroupedByCategorieId = groupedByData(
    types.value,
    'materiel_categorie_id'
  );
  let categoriesGroupedByParentId = groupedByData(
    categories.value,
    'parent_id'
  );

  let data = [];

  const recursive = (categories, level) => {
    categories.forEach((c) => {
      data.push({
        ...c,
        globalId: 'c' + c.id,
        type: 'categorie',
        level: level,
      });
    });

    if (categoriesGroupedByParentId[c.id])
      recursive(categoriesGroupedByParentId[c.id], level + 1);
  };

  recursive(
    categories.value.filter((c) => !c.parent_id),
    0
  );

  return data;
});
</script>

<template>
  <ul class="list-group list-group-flush">
    <li
      v-if="computedData.length === 0"
      class="nav-link list-group-item list-group-item-action pt-1 pb-1"
    >
      <span class="border-bottom-0">Aucun catégorie</span>
    </li>
    <router-link
      v-for="item in computedData"
      :key="item.globalId"
      v-slot="{ navigate, isExactActive }"
      :style="{
        'padding-left': item.level * 25 + 'px',
        color: indexedCouleurs[item.couleur_id]?.texte ?? 'black',
        'background-color': indexedCouleurs[item.couleur_id]?.fond ?? '',
      }"
      custom
      :to="{
        name: 'materiel-par-type-details',
        params: { id: item.id },
      }"
    >
      <a
        v-if="item.type === 'type'"
        class="nav-link list-group-item list-group-item-action pt-1 pb-1"
        href="#"
        role="link"
        :class="{ active: isExactActive }"
        @click="navigate"
        >{{ item.designation }}
      </a>
      <span v-else>{{ item.designation }}</span>
    </router-link>
  </ul>
</template>

<style scoped></style>

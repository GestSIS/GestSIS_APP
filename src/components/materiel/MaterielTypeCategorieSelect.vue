<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { useCouleurStore } from '../../stores/materiel/Couleur';

const typeStore = useMaterielTypeStore();
const categorieStore = useMaterielCategorieStore();
const couleurStore = useCouleurStore();

typeStore.fetchMatPersoTypes();
categorieStore.fetchMaterielCategories();
couleurStore.fetchCouleurs();

const types = computed(() =>
  typeStore.liste.sort((a, b) => a.designation - b.designation)
);
const categories = computed(() =>
  categorieStore.liste.sort((a, b) => a.designation - b.designation)
);
const indexedCouleurs = computed(() =>
  couleurStore.liste.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {})
);

const computedData = computed(() => {
  let indexedTypes = {};

  types.value.forEach((t) => {
    if (!indexedTypes[t.materiel_categorie_id])
      indexedTypes[t.materiel_categorie_id] = [t];
    else indexedTypes[t.materiel_categorie_id].push(t);
  });
  let indexedCategories = {};
  categories.value.forEach((c) => {
    if (!indexedCategories[c.parent_id]) indexedCategories[c.parent_id] = [c];
    else indexedCategories[c.parent_id].push(c);
  });

  let data = [];

  const recursive = (categories, level) => {
    categories.forEach((c) => {
      data.push({
        ...c,
        globalId: 'c' + c.id,
        type: 'categorie',
        level: level,
      });

      if (indexedCategories[c.id])
        recursive(indexedCategories[c.id], level + 1);

      indexedTypes[c.id]?.forEach((t) => {
        data.push({
          ...t,
          globalId: 't' + t.id,
          type: 'type',
          level: level + 1,
        });
      });
    });
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
    <li v-if="computedData.length === 0">
      <td class="border-bottom-0">Aucune catégorie</td>
    </li>
    <router-link
      v-for="item in computedData"
      :key="item.globalId"
      :style="{
        'padding-left': item.level * 25 + 'px',
        color: indexedCouleurs[item.couleur_id]?.texte ?? 'black',
        'background-color': indexedCouleurs[item.couleur_id]?.fond ?? '',
      }"
      v-slot="{ navigate }"
      custom
      :to="{
        name: 'materiel-details',
        params: { id: item.id },
      }"
    >
      <a
        class="list-group-item list-group-item-action pt-1 pb-1"
        href="#"
        role="link"
        @click="navigate"
        >{{ item.designation }}
      </a>
    </router-link>
  </ul>
</template>

<style scoped></style>

<script setup>
import { computed } from 'vue';
<<<<<<< HEAD
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { groupedByData, indexedData } from '../../tools';

const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();

couleurStore.fetchCouleurs();
emplacementStore.fetchEmplacements();

const emplacements = computed(() => emplacementStore.liste);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const emplacementsGroupedByParent = computed(() =>
  groupedByData(emplacements.value, 'parent_id')
);

const computedData = computed(() => {
  const recursive = (parent_id, level = 0) => {
    return [...(emplacementsGroupedByParent.value[parent_id] ?? [])].flatMap(
      (elem) => [{ ...elem, level }, ...recursive(elem.id, level + 1)]
    );
  };

  return recursive(null);
=======
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
>>>>>>> f32c8d3 (Refactor component, file and router structure)
});
</script>

<template>
  <ul class="list-group list-group-flush">
<<<<<<< HEAD
    <li
      v-if="computedData.length === 0"
      class="nav-link list-group-item list-group-item-action pt-1 pb-1"
    >
      <span class="border-bottom-0">Aucun emplacement</span>
    </li>
    <router-link
      v-for="item in computedData.slice(0)"
      :key="item.globalId"
      v-slot="{ navigate, isExactActive }"
      :style="{
        'padding-left': item.level * 25 + 'px',
      }"
=======
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
      v-slot="{ navigate, isExactActive }"
>>>>>>> f32c8d3 (Refactor component, file and router structure)
      custom
      :to="{
        name: 'materiel-par-emplacement-details',
        params: { id: item.id },
      }"
    >
      <a
<<<<<<< HEAD
        class="nav-link list-group-item list-group-item-action pt-1 pb-1 border-0"
        href="#"
        role="link"
        :class="{ 'bg-primary-subtle': isExactActive }"
        @click="navigate"
        ><span
          class="m-0 p-1"
          :style="{
            color: indexedCouleurs[item.couleur_id]?.texte ?? 'black',
            'background-color': indexedCouleurs[item.couleur_id]?.fond ?? '',
          }"
        >
          {{ item.designation }}
        </span>
      </a>
=======
        v-if="item.type === 'type'"
        class="nav-link list-group-item list-group-item-action pt-1 pb-1"
        href="#"
        role="link"
        :class="{ active: isExactActive }"
        @click="navigate"
        >{{ item.designation }}
      </a>
      <span v-else>{{ item.designation }}</span>
>>>>>>> f32c8d3 (Refactor component, file and router structure)
    </router-link>
  </ul>
</template>

<style scoped></style>

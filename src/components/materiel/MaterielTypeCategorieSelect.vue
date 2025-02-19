<template>
  <table class="table table-sm table-hover">
    <thead>
      <tr>
        <th>Designation</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="computedData.length <= 0">
        <td colspan="2">Aucune catégorie</td>
      </tr>
      <tr
        v-for="item in computedData"
        :key="item.globalId"
        :class="{
          'table-primary': item.globalId === selectedId,
        }"
      >
        <td
          :style="{
            'padding-left': item.level * 25 + 'px',
            color: indexedCouleurs[item.couleur_id]?.texte ?? 'black',
            'background-color': indexedCouleurs[item.couleur_id]?.fond ?? '',
          }"
        >
          <label :for="item.globalId">
            <!-- <font-awesome-icon class="me-2 ms-2" :icon="['fas', item.tag]" /> -->
            {{ item.designation }}
          </label>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed, ref } from 'vue';
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
        tag: 'tag',
      });

      if (indexedCategories[c.id])
        recursive(indexedCategories[c.id], level + 1);

      indexedTypes[c.id]?.forEach((t) => {
        data.push({
          ...t,
          globalId: 't' + t.id,
          type: 'type',
          level: level + 1,
          tag: 'shirt',
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

const select = (item, event) => {
  const selected = event.target.checked;
  const categorieIds = new Set(item.type === 'categorie' ? [item.id] : []);

  computedData.forEach((e) => {
    if (e.type === 'categorie' && categorieIds.has(parseInt(e.parent_id))) {
      categorieIds.add(e.id);
      selectedIds.categorie[e.id?.toString()] = selected;
    }
    if (e.type === 'type' && categorieIds.has(e.materiel_categorie_id)) {
      selectedIds.type[e.id] = selected;
    }
  });
  $emit('change', selectedIds);
};
</script>

<style scoped></style>

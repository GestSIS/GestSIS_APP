<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { groupedByData, indexedData } from '../../tools';
import TagCouleur from './TagCouleur.vue';

const typeStore = useMaterielTypeStore();
const categorieStore = useMaterielCategorieStore();
const couleurStore = useCouleurStore();

await Promise.all([
  typeStore.fetchMaterielTypes(),
  couleurStore.fetchCouleurs(),
  categorieStore.fetchMaterielCategories(),
]);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedCategories = computed(() => indexedData(categorieStore.liste));

const linearCategories = (categorieId) => {
  if (categorieId === null) {
    return [];
  }
  const categorie = indexedCategories.value[categorieId] ?? null;
  if (categorie === null) {
    return [];
  }
  return [...linearCategories(categorie.parent_id), categorie];
};

const computedData = computed(() => {
  // TODO: Trier les categories par `tri`
  const sortedCategories = [...categorieStore.liste].sort(
    (a, b) => a.tri - b.tri,
  );

  // Grouper les types par categorie
  const groupedTypesByCategorieId = groupedByData(
    typeStore.liste,
    'materiel_categorie_id',
  );

  // Map categories avec leurs types et les filtrer
  return sortedCategories
    .map((c) => ({
      categorie: c,
      types: groupedTypesByCategorieId[c.id] ?? [],
    }))
    .filter((groupe) => groupe.types.length > 0)
    .flatMap(({ categorie, types }) => [
      { type: 'categorie', globalId: 'c' + categorie.id, data: categorie },
      ...types.map((t) => ({
        type: 'type',
        globalId: 't' + categorie.id,
        data: t,
      })),
    ]);
});
</script>

<template>
  <ul class="list-group list-group-flush">
    <li v-if="computedData.length === 0" class="list-group-item pt-1 pb-1">
      <span class="border-bottom-0">Aucune catégorie</span>
    </li>
    <router-link
      v-for="item in computedData"
      :key="item.globalId"
      v-slot="{ navigate, isExactActive }"
      custom
      :to="{
        name: 'materiel-par-type-details',
        params: { id: item.data.id },
      }"
    >
      <a
        v-if="item.type === 'type'"
        class="nav-link list-group-item list-group-item-action p-1 ps-3"
        href="#"
        role="link"
        :class="{ active: isExactActive }"
        @click="navigate"
      >
        {{ item.data.designation }}
      </a>
      <div v-else class="list-group-item p-1">
        <tag-couleur
          v-for="categorie in linearCategories(item.data.id)"
          :key="categorie.id"
          :couleur="indexedCouleurs[categorie.couleur_id]"
        >
          {{ categorie.designation }}
        </tag-couleur>
      </div>
    </router-link>
  </ul>
</template>

<style scoped></style>

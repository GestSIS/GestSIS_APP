<script setup>
import { computed, ref } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { groupedByData, indexedData } from '../../tools';
import TagCouleur from './TagCouleur.vue';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission';

const typeStore = useMaterielTypeStore();
const categorieStore = useMaterielCategorieStore();
const couleurStore = useCouleurStore();

const hasConfigPermission = useHasPermission(permissions.MATERIEL.CONFIG);

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

const filtre = ref('');

const computedData = computed(() => {
  // TODO: Trier les categories par `tri`
  const sortedCategories = [...categorieStore.liste].sort(
    (a, b) => a.tri - b.tri,
  );

  // Grouper les types par categorie
  const groupedTypesByCategorieId = groupedByData(
    typeStore.liste.filter((t) =>
      t.designation
        .toLowerCase()
        .includes(filtre.value.toLowerCase().trim(' ')),
    ),
    'materiel_categorie_id',
  );

  // Map categories avec leurs types et les filtre
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
        globalId: 't' + t.id,
        data: t,
      })),
    ]);
});
</script>

<template>
  <div class="input-group mb-2">
    <router-link
      v-if="hasConfigPermission"
      :to="{ name: 'param-materiel' }"
      class="btn btn-sm btn-outline-primary"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
    <input
      v-model="filtre"
      type="text"
      class="form-control form-control-sm"
      placeholder="Chercher..."
      aria-label="Chercher..."
      aria-describedby="filtre emplacement"
    />
    <span id="basic-addon1" class="input-group-text">
      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
    </span>
  </div>
  <div class="card mb-2">
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
        <div v-else class="list-group-item p-1 bg-body-secondary">
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
  </div>
</template>

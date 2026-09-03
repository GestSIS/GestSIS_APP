<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { useMaterielCategorieStore } from "../../stores/materiel/Categorie";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { groupedByData, indexedData } from "../../tools/index.js";
import TagCouleur from "./TagCouleur.vue";
import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectInput,
  SelectClear,
  SelectTrailingIcon,
  SelectPopover,
  SelectListbox,
  SelectNoOptions,
  SelectGroup,
  SelectGroupLabel,
  SelectOption,
} from "vue3-select-component/primitives";

const route = useRoute();
const router = useRouter();

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

const filtre = ref("");

// Types groupés par catégorie (triées par `tri`), filtrés par la recherche
// (utilisée par la liste desktop ; en mobile `filtre` reste vide et c'est la
// recherche intégrée du select qui filtre les options).
const categoriesAvecTypes = computed(() => {
  const sortedCategories = [...categorieStore.liste].sort((a, b) => a.tri - b.tri);

  const groupedTypesByCategorieId = groupedByData(
    typeStore.liste.filter((t) =>
      t.designation.toLowerCase().includes(filtre.value.toLowerCase().trim(" ")),
    ),
    "materiel_categorie_id",
  );

  return sortedCategories
    .map((c) => ({
      categorie: c,
      types: (groupedTypesByCategorieId[c.id] ?? []).map((t) => ({
        ...t,
        value: t.id,
        label: t.designation,
      })),
    }))
    .filter((groupe) => groupe.types.length > 0);
});

const computedData = computed(() =>
  categoriesAvecTypes.value.flatMap(({ categorie, types }) => [
    { type: "categorie", globalId: "c" + categorie.id, data: categorie },
    ...types.map((t) => ({
      type: "type",
      globalId: "t" + t.id,
      data: t,
    })),
  ]),
);

const selectedTypeId = computed({
  get: () => (route.name === "materiel-par-type-details" ? Number(route.params.id) : null),
  set: (value) =>
    router.push(
      value == null
        ? { name: "materiel-par-type" }
        : { name: "materiel-par-type-details", params: { id: value } },
    ),
});
</script>

<template>
  <!-- Mobile : select unique, groupé par catégorie (en-têtes non cliquables),
  recherche intégrée sur le type. -->
  <div class="d-md-none mb-2 d-flex gap-2">
    <router-link
      v-if="hasConfigPermission"
      :to="{ name: 'param-materiel' }"
      class="btn btn-sm btn-outline-primary flex-shrink-0"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
    <div data-assembled-select class="flex-grow-1">
      <select-root v-model="selectedTypeId" searchable clearable>
        <select-trigger>
          <select-value placeholder="Sélectionnez un type de matériel" />
          <select-input />
          <select-clear />
          <select-trailing-icon />
        </select-trigger>
        <select-popover>
          <select-listbox>
            <select-no-options>Aucun résultat</select-no-options>
            <select-group v-for="groupe in categoriesAvecTypes" :key="groupe.categorie.id">
              <select-group-label>
                <tag-couleur
                  v-for="categorie in linearCategories(groupe.categorie.id)"
                  :key="categorie.id"
                  :couleur="indexedCouleurs[categorie.couleur_id]"
                >
                  {{ categorie.designation }}
                </tag-couleur>
              </select-group-label>
              <select-option
                v-for="type in groupe.types"
                :key="type.value"
                :value="type.value"
                :label="type.label"
              >
                {{ type.label }}
              </select-option>
            </select-group>
          </select-listbox>
        </select-popover>
      </select-root>
    </div>
  </div>

  <!-- Desktop : liste complète avec recherche externe. -->
  <div class="d-none d-md-block">
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
  </div>
</template>

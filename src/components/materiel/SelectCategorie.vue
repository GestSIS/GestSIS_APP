<script setup>
import { computed } from "vue";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useMaterielCategorieStore } from "../../stores/materiel/Categorie";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectClear,
  SelectTrailingIcon,
  SelectPopover,
  SelectListbox,
  SelectNoOptions,
  SelectOption,
} from "vue3-select-component/primitives";
import { indexedData } from "../../tools/index.js";
import TagCouleur from "./TagCouleur.vue";

const { label, categorieIdToIgnore } = defineProps({
  label: {
    type: String,
    default: () => "",
  },
  categorieIdToIgnore: {
    type: Number,
    default: () => -1,
  },
});

const model = defineModel();

const couleurStore = useCouleurStore();
const categorieStore = useMaterielCategorieStore();

await Promise.all([categorieStore.fetchMaterielCategories(), couleurStore.fetchCouleurs()]);

const indexedCategories = computed(() => indexedData(categorieStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const categories = computed(() => {
  const recursive = (id) => {
    return [
      ...(indexedCategories.value[id]?.parent_id > 0
        ? recursive(indexedCategories.value[id]?.parent_id)
        : []),
      id,
    ];
  };
  return categorieStore.liste
    .map((e) => {
      const ids = recursive(e.id);
      return {
        ...e,
        value: e.id,
        categories: ids,
        label: ids.map((id) => indexedCategories.value[id].designation).join(" "),
      };
    })
    .sort((a, b) => a.tri - b.tri)
    .filter((c) => c.id !== categorieIdToIgnore && !c.categories.includes(categorieIdToIgnore));
});

// Retrouve l'option complète (avec sa hiérarchie) depuis la valeur sélectionnée.
const categorieParValeur = computed(() =>
  Object.fromEntries(categories.value.map((c) => [c.value, c])),
);
</script>

<template>
  <div data-assembled-select>
    <label v-if="label">{{ label }}</label>
    <select-root v-model="model" :options="categories" clearable>
      <select-trigger>
        <select-value placeholder="Sélectionnez une catégorie">
          <template #default="{ selectedOptions }">
            <template v-for="sel in selectedOptions" :key="sel.value">
              <tag-couleur
                v-for="id in categorieParValeur[sel.value]?.categories ?? []"
                :key="id"
                :couleur="indexedCouleurs[indexedCategories[id].couleur_id]"
              >
                {{ indexedCategories[id].designation }}
              </tag-couleur>
            </template>
          </template>
        </select-value>
        <select-clear />
        <select-trailing-icon />
      </select-trigger>
      <select-popover>
        <select-listbox>
          <select-no-options>Aucun résultat</select-no-options>
          <select-option
            v-for="categorie in categories"
            :key="categorie.value"
            :value="categorie.value"
            :label="categorie.label"
          >
            <tag-couleur
              v-for="id in categorie.categories"
              :key="id"
              :couleur="indexedCouleurs[indexedCategories[id].couleur_id]"
            >
              {{ indexedCategories[id].designation }}
            </tag-couleur>
          </select-option>
        </select-listbox>
      </select-popover>
    </select-root>
  </div>
</template>

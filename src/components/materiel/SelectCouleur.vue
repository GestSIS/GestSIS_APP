<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
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
} from 'vue3-select-component/primitives';
import TagCouleur from './TagCouleur.vue';

const { label } = defineProps({
  label: {
    type: String,
    default: () => '',
  },
});

const model = defineModel();

const couleurStore = useCouleurStore();
await couleurStore.fetchCouleurs();
const couleurs = computed(() =>
  couleurStore.liste
    .slice(0)
    .map((c) => ({ ...c, label: c.nom, value: c.id }))
    .sort((c1, c2) => c1.nom.localeCompare(c2.nom)),
);

// Permet de retrouver l'option complète (avec ses couleurs) depuis la valeur
// sélectionnée : le slot #default de SelectValue ne garantit que value/label.
const couleurParValeur = computed(() =>
  Object.fromEntries(couleurs.value.map((c) => [c.value, c])),
);
</script>

<template>
  <!-- data-assembled-select : la lib ne style le trigger que sous ce hook ;
       on en a besoin car on compose les primitives à la main. -->
  <div data-assembled-select>
    <label v-if="label">{{ label }}</label>
    <select-root v-model="model" :options="couleurs" clearable>
      <select-trigger>
        <select-value placeholder="Sélectionnez une couleur">
          <template #default="{ selectedOptions }">
            <tag-couleur
              v-for="sel in selectedOptions"
              :key="sel.value"
              :couleur="couleurParValeur[sel.value]"
            >
              {{ couleurParValeur[sel.value]?.nom }}
            </tag-couleur>
          </template>
        </select-value>
        <select-clear />
        <select-trailing-icon />
      </select-trigger>
      <select-popover>
        <select-listbox>
          <select-no-options>Aucun résultat</select-no-options>
          <select-option
            v-for="couleur in couleurs"
            :key="couleur.value"
            :value="couleur.value"
            :label="couleur.label"
          >
            <tag-couleur :couleur="couleur">
              {{ couleur.nom }}
            </tag-couleur>
          </select-option>
        </select-listbox>
      </select-popover>
    </select-root>
  </div>
</template>

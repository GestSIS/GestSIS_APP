<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
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
import { indexedData } from '../../tools/index.js';
import TagCouleur from './TagCouleur.vue';

const { label, emplacementIdToIgnore, emplacementRacine, disabled, required } =
  defineProps({
    label: {
      type: String,
      default: () => '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    emplacementIdToIgnore: {
      type: Number,
      default: () => -1,
    },
    emplacementRacine: {
      type: Boolean,
      default: () => false,
    },
  });

const model = defineModel();

const couleurStore = useCouleurStore();
const emplacementStore = useEmplacementStore();

await Promise.all([
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
]);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => ({
  ...indexedData(couleurStore.liste),
  racine: { text: 'black', fond: 'white' },
}));
const emplacements = computed(() => {
  const recursive = (id) => {
    return [
      ...(indexedEmplacements.value[id]?.parent_id > 0
        ? recursive(indexedEmplacements.value[id]?.parent_id)
        : []),
      id,
    ];
  };
  return [
    ...(emplacementRacine
      ? [{ value: null, label: 'Sans parent', color_id: 'racine' }]
      : []),
    ...emplacementStore.liste
      .map((e) => {
        const ids = recursive(e.id);
        return {
          ...e,
          value: e.id,
          emplacements: ids,
          label: ids
            .map((id) => indexedEmplacements.value[id].designation)
            .join(' '),
        };
      })
      .sort((a, b) => a.tri - b.tri)
      .filter(
        (c) =>
          c.id !== emplacementIdToIgnore &&
          !c.emplacements.includes(emplacementIdToIgnore),
      ),
  ];
});

// Retrouve l'option complète (avec sa hiérarchie) depuis la valeur sélectionnée.
const emplacementParValeur = computed(() =>
  Object.fromEntries(emplacements.value.map((e) => [e.value, e])),
);
</script>

<template>
  <!-- data-assembled-select : la lib ne style le trigger que sous ce hook ;
       on en a besoin car on compose les primitives à la main. -->
  <div data-assembled-select>
    <label v-if="label">{{ label }}</label>
    <select-root
      v-model="model"
      :options="emplacements"
      :disabled="disabled"
      clearable
    >
      <select-trigger>
        <select-value placeholder="Sélectionnez un emplacement">
          <template #default="{ selectedOptions }">
            <template v-for="sel in selectedOptions" :key="sel.value">
              <tag-couleur
                v-for="id in emplacementParValeur[sel.value]?.emplacements ?? []"
                :key="id"
                :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
              >
                {{ indexedEmplacements[id].designation }}
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
            v-for="emplacement in emplacements"
            :key="emplacement.value"
            :value="emplacement.value"
            :label="emplacement.label"
          >
            <tag-couleur
              v-for="id in emplacement.emplacements ?? []"
              :key="id"
              :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
            >
              {{ indexedEmplacements[id].designation }}
            </tag-couleur>
            <span v-if="emplacement.value === null">{{
              emplacement.label
            }}</span>
          </select-option>
        </select-listbox>
      </select-popover>
    </select-root>
    <!-- La v1 a supprimé la prop `required` : on conserve la validation
         native du formulaire via un input masqué mais focusable. La garde JS
         côté formulaire (ex. ModalArticle) reste le filet de sécurité. -->
    <input
      v-if="required"
      :value="model ?? ''"
      required
      tabindex="-1"
      aria-hidden="true"
      class="emplacement-required-proxy"
    />
  </div>
</template>

<style scoped>
/* Input proxy pour conserver la validation `required` native sans être visible
   (display:none rendrait le contrôle non focusable -> erreur navigateur). */
.emplacement-required-proxy {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  border: 0;
  pointer-events: none;
}

</style>

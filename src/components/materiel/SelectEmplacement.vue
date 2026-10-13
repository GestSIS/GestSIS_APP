<script setup>
import { computed } from "vue";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
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

const { label, emplacementIdToIgnore, emplacementRacine, filtre, disabled, required } = defineProps(
  {
    label: {
      type: String,
      default: () => "",
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
    filtre: {
      type: Function,
      default: () => true,
    },
  },
);

const model = defineModel();

const couleurStore = useCouleurStore();
const emplacementStore = useEmplacementStore();

await Promise.all([emplacementStore.fetchEmplacements(), couleurStore.fetchCouleurs()]);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => ({
  ...indexedData(couleurStore.liste),
  racine: { text: "black", fond: "white" },
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
    ...(emplacementRacine ? [{ value: null, label: "Sans parent", color_id: "racine" }] : []),
    ...emplacementStore.liste
      .map((e) => {
        const ids = recursive(e.id);
        return {
          ...e,
          value: e.id,
          emplacements: ids,
          label: ids.map((id) => indexedEmplacements.value[id].designation).join(" "),
        };
      })
      .sort((a, b) => a.tri - b.tri)
      .filter(
        (c) =>
          c.id !== emplacementIdToIgnore &&
          !c.emplacements.includes(emplacementIdToIgnore) &&
          filtre(c),
      ),
  ];
});

// Retrouve l'option complète (avec sa hiérarchie) depuis la valeur sélectionnée.
const emplacementParValeur = computed(() =>
  Object.fromEntries(emplacements.value.map((e) => [e.value, e])),
);

// Chemin complet en infobulle : l'affichage replié peut en masquer le début.
const cheminSelectionne = computed(() =>
  (emplacementParValeur.value[model.value]?.emplacements ?? [])
    .map((id) => indexedEmplacements.value[id]?.designation)
    .join(" › "),
);
</script>

<template>
  <div data-assembled-select class="select-emplacement" :title="cheminSelectionne">
    <label v-if="label">{{ label }}</label>
    <select-root v-model="model" :options="emplacements" :disabled="disabled" clearable>
      <select-trigger>
        <select-value placeholder="Sélectionnez un emplacement">
          <template #default="{ selectedOptions }">
            <span v-for="sel in selectedOptions" :key="sel.value" class="chemin-selectionne">
              <tag-couleur
                v-for="id in emplacementParValeur[sel.value]?.emplacements ?? []"
                :key="id"
                :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
              >
                {{ indexedEmplacements[id].designation }}
              </tag-couleur>
            </span>
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
            <span v-if="emplacement.value === null">{{ emplacement.label }}</span>
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
/* Valeur sélectionnée sur une seule ligne : si la hiérarchie est trop longue,
   on garde visibles les niveaux les plus précis (la fin du chemin) et c'est
   le début qui est coupé. Le chemin complet reste dans l'infobulle.
   Le conteneur prend la largeur de son contenu (aligné à gauche) tant que
   tout tient, et ne dépasse jamais 100 % : seul le débordement est coupé. */
.select-emplacement :deep([data-select-value]) {
  flex-wrap: nowrap;
}
.chemin-selectionne {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
.chemin-selectionne > * {
  flex-shrink: 0;
  white-space: nowrap;
}

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

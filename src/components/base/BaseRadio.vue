<script setup>
import { ref } from "vue";

const model = defineModel({
  type: [Boolean, Number],
  default: undefined,
});

const { label, options, advancedLabel, buttonStyle, size } = defineProps({
  label: {
    type: String,
    default: () => "",
  },
  // Chaque option : { value, label, disabled?, color? }. `color` (variante
  // Bootstrap : success, danger, warning, ...) et `disabled` ne sont utilisés
  // qu'en mode `buttonStyle`.
  options: {
    required: true,
    type: Array,
  },
  advancedLabel: {
    type: Boolean,
    default: false,
  },
  // Rendu en groupe de boutons Bootstrap (segment visuel façon iOS) plutôt
  // qu'en radios empilées classiques.
  buttonStyle: {
    type: Boolean,
    default: false,
  },
  // Taille du groupe de boutons quand `buttonStyle` est actif (ex. "sm").
  size: {
    type: String,
    default: "",
  },
});

const generateQuickGuid = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Préfixe les id pour éviter les collisions quand plusieurs base-radio de ce
// composant partagent les mêmes valeurs d'options (ex. une ligne par sapeur
// dans un tableau) : un id dupliqué casse l'association <label for="">.
const uuid = ref(generateQuickGuid());
const optionId = (value) => `${uuid.value}-${value}`;

const splittedLabel = (label) => (label ?? "").split("\n");
</script>

<template>
  <div v-if="!buttonStyle">
    <div v-for="option in options" :key="option.value" class="form-check">
      <input
        :id="optionId(option.value)"
        v-model="model"
        class="form-check-input"
        type="radio"
        :name="uuid"
        :value="option.value"
        :disabled="option.disabled"
      />
      <label v-if="!advancedLabel" class="form-check-label" :for="optionId(option.value)">{{
        option.label
      }}</label>
      <label v-else class="form-check-label" :for="optionId(option.value)">
        <template v-for="(l, i) in splittedLabel(option.label)" :key="i">
          {{ l }}<br v-if="i != splittedLabel(option.label).length - 1" />
        </template>
      </label>
    </div>
  </div>
  <div
    v-else
    class="btn-group"
    :class="size ? `btn-group-${size}` : ''"
    role="group"
    :aria-label="label"
  >
    <template v-for="option in options" :key="option.value">
      <input
        :id="optionId(option.value)"
        v-model="model"
        type="radio"
        class="btn-check"
        autocomplete="off"
        :name="uuid"
        :value="option.value"
        :disabled="option.disabled"
      />
      <label
        class="btn"
        :class="`btn-outline-${option.color || 'primary'}`"
        :for="optionId(option.value)"
        >{{ option.label }}</label
      >
    </template>
  </div>
</template>

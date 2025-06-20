<script setup>
import { ref } from 'vue';

const model = defineModel({
  type: [Boolean, Number],
  default: undefined,
});

const { label, options, advancedLabel } = defineProps({
  label: {
    type: String,
    default: () => '',
  },
  options: {
    required: true,
    type: Array,
  },
  advancedLabel: {
    type: Boolean,
    default: false,
  },
});

const generateQuickGuid = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const uuid = ref(generateQuickGuid());

const splittedLabel = (label) => (label ?? '').split('\n');
</script>

<template>
  <div>
    <div v-for="option in options" :key="option.value" class="form-check">
      <input
        :id="option.value"
        v-model="model"
        class="form-check-input"
        type="radio"
        :name="uuid"
        :value="option.value"
      />
      <label
        v-if="!advancedLabel"
        class="form-check-label"
        :for="option.value"
        >{{ option.label }}</label
      >
      <label v-else class="form-check-label" :for="option.value">
        <template v-for="(l, i) in splittedLabel(option.label)" :key="i">
          {{ l }}<br v-if="i != splittedLabel(option.label).length - 1" />
        </template>
      </label>
      <!-- v-html="replaceNewLines(option.label)" -->
    </div>
  </div>
</template>

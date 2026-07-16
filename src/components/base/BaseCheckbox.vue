<script setup>
const model = defineModel({
  type: [Boolean, Number],
  default: undefined,
});
const { label, trueValue, falseValue } = defineProps({
  label: {
    type: String,
    default: () => "",
  },
  trueValue: {
    type: [Boolean, Number, Function],
    default: true,
  },
  falseValue: {
    type: [Boolean, Number, Function],
    default: false,
  },
});
</script>

<template>
  <div class="form-check">
    <input
      :id="label"
      v-model="model"
      class="form-check-input"
      type="checkbox"
      v-bind="$attrs"
      :true-value="trueValue"
      :false-value="falseValue"
    />
    <label v-if="label" class="form-check-label" :for="label">
      {{ label }}
    </label>
  </div>
</template>

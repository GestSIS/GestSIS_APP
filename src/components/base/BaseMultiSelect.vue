<script setup>
const model = defineModel({
  type: Array,
  default: [],
});
const { label, baseOption, options, valueKey, displayKey, formatter } =
  defineProps({
    label: {
      type: String,
      default: () => '',
    },
    baseOption: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      required: true,
    },
    valueKey: {
      type: String,
      default: 'id',
    },
    displayKey: {
      type: String,
      default: 'designation',
    },
    formatter: {
      type: Function,
      default: null,
    },
  });
</script>

<template>
  <div class="mb-3" multiple>
    <label v-if="label" :for="label">{{ label }}</label>
    <select
      :id="label"
      v-model="model"
      multiple
      class="form-select form-select-sm"
      v-bind="{
        ...$attrs,
      }"
    >
      {{
        formatter ? true : false
      }}
      <option v-if="baseOption" :value="undefined">{{ baseOption }}</option>
      <option v-for="o in options" :key="o[valueKey]" :value="o[valueKey]">
        {{ formatter ? formatter(o) : o[displayKey] }}
      </option>
    </select>
  </div>
</template>

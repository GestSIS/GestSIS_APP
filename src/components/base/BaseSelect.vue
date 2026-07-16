<script setup>
import { useTemplateRef } from "vue";

const {
  label,
  placeholder,
  required,
  selectClass,
  baseOption,
  baseValue,
  options,
  formatter,
  valueKey,
  displayKey,
} = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: () => "",
  },
  label: {
    type: String,
    default: () => "",
  },
  selectClass: {
    type: [String, Array, Object],
    default: "",
  },
  baseOption: {
    type: String,
    default: "",
  },
  baseValue: {
    type: [String, Number],
    default: undefined,
  },
  options: {
    type: Array,
    required: true,
  },
  valueKey: {
    type: String,
    default: "id",
  },
  displayKey: {
    type: String,
    default: "designation",
  },
  formatter: {
    type: Function,
    default: null,
  },
});
const model = defineModel();
if (placeholder != "" && !model.value) {
  model.value = "";
}

const input = useTemplateRef("input");
const focus = () => {
  input.value.focus();
};

defineExpose({ focus });
</script>

<template>
  <div>
    <label v-if="label" :for="label">{{ label }}</label>
    <select
      :id="label"
      ref="input"
      v-model="model"
      :required="required"
      :class="['form-select form-select-sm', selectClass]"
      v-bind="{ ...$attrs }"
    >
      <option v-if="placeholder !== ''" value="" disabled hidden>
        {{ placeholder }}
      </option>
      <option v-if="baseOption" :value="baseValue">{{ baseOption }}</option>
      <option v-for="o in options" :key="o[valueKey]" :value="o[valueKey]">
        {{ formatter ? formatter(o) : o[displayKey] }}
      </option>
    </select>
  </div>
</template>

<style scoped>
select,
option {
  cursor: pointer;
}
</style>

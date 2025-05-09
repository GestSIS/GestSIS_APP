<script setup>
const {
  label,
  selectClass,
  baseOption,
  baseValue,
  options,
  formatter,
  valueKey,
  displayKey,
} = defineProps({
  label: {
    type: String,
    default: () => '',
  },
  selectClass: {
    type: [String, Array, Object],
    default: '',
  },
  baseOption: {
    type: String,
    default: '',
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
const model = defineModel();

const focus = () => {
  this.$refs.input.focus();
};
</script>

<template>
  <div>
    <label v-if="label" :for="label">{{ label }}</label>
    <select
      :id="label"
      ref="input"
      v-model="model"
      :class="['form-select form-select-sm', selectClass]"
      v-bind="{ ...$attrs }"
    >
      <option v-if="baseOption" :value="baseValue">{{ baseOption }}</option>
      <option v-for="o in options" :key="o[valueKey]" :value="o[valueKey]">
        {{ formatter ? formatter(o) : o[displayKey] }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
select,
option {
  cursor: pointer;
}
</style>

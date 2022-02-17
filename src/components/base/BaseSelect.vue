<template>
  <div>
    <label v-if="label" :for="label">{{ label }}</label>
    <select
      :class="['form-select form-select-sm', selectClass]"
      :id="label"
      v-model="model"
      v-bind="{ ...$attrs }"
    >
      <option v-if="baseOption" :value="undefined">{{ baseOption }}</option>
      <option
        v-for="o in options"
        :key="o[valueKey]"
        :value="o[valueKey]"
      >{{ formatter ? formatter(o) : o[displayKey] }}</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'base-select',
  inheritsAttrs: false,
  props: {
    label: {
      type: String,
      default: () => '',
    },
    selectClass: {
      type: [String, Array, Object],
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
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
      required: true,
    },
    displayKey: {
      type: String,
      default: '',
    },
    formatter: {
      type: Function,
    },
  },
  data() {
    return {
      model: this.modelValue,
    };
  },
  watch: {
    modelValue(newValue, oldValue) {
      if (oldValue !== newValue) {
        this.model = newValue;
      }
    },
    model(currentValue) {
      this.$emit('update:modelValue', currentValue);
    },
  },
};
</script>

<style lang="scss" scoped></style>

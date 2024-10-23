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

<script>
export default {
  name: 'BaseSelect',
  inheritsAttrs: false,
  props: {
    label: {
      type: String,
      default: () => '',
    },
    selectClass: {
      type: [String, Array, Object],
      default: '',
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
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
  },
  emits: ['update:modelValue'],
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
  methods: {
    focus() {
      this.$refs.input.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
select,
option {
  cursor: pointer;
}
</style>

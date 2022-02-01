<template>
  <div class="mb-3" multiple>
    <label v-if="label" :for="label">{{ label }}</label>
    <select
      class="form-select form-select-sm"
      :id="label"
      v-model="model"
      v-bind="{
        ...$attrs,
      }"
    >
      {{
        formatter ? true : false
      }}
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
  props: {
    label: {
      type: String,
      default: () => '',
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

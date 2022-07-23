<template>
  <div class="form-check">
    <input
      :id="label"
      v-model="model"
      class="form-check-input"
      type="checkbox"
      v-bind="$attrs"
    />
    <label v-if="label" class="form-check-label" :for="label">
      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'BaseCheckbox',
  props: {
    label: {
      type: String,
      default: () => '',
    },
    modelValue: {
      type: [Boolean, Number],
      default: undefined,
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

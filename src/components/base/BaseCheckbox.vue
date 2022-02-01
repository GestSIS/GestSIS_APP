<template>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" :id="label" v-model="model" v-bind="$attrs" />
    <label v-if="label" class="form-check-label" :for="label">
      {{
        label
      }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'base-checkbox',
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

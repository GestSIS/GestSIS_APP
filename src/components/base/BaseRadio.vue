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
      <label
        v-else
        class="form-check-label"
        :for="option.value"
        v-html="replaceNewLines(option.label)"
      ></label>
    </div>
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
    options: {
      required: true,
      type: Array,
    },
    advancedLabel: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const generateQuickGuid = () => {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    };
    return {
      generateQuickGuid: generateQuickGuid,
      uuid: generateQuickGuid(),
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
    replaceNewLines(text) {
      return text.replace('\n', '<br />');
    },
  },
};
</script>

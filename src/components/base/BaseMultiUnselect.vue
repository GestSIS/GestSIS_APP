<template>
  <div class="form-group" :class="wrapperClass">
    <label v-if="label" :for="label">{{ label }}</label>
    <select
      multiple
      class="custom-select custom-select-sm"
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
      <option v-for="o in options" :key="o[valueKey]" :value="o[valueKey]">
        {{ formatter ? formatter(o) : o[displayKey] }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'base-multi-unselect',
  props: {
    label: {
      type: String,
      default: () => '',
    },
    wrapperClass: {
      type: [String, Array],
    },
    value: {
      //Vuejs 3 -> modelValue
      type: Array,
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
    const selected = this.options.map((o) => o[this.valueKey]);
    const unselected = new Set(this.value);
    return {
      model: selected.filter((e) => !unselected.has(e)),
      cachedUnselected: [],
    };
  },
  watch: {
    options(newValue, oldValue) {
      const oldOnes = new Set(oldValue);
      const addedValues = newValue.filter((e) => !oldOnes.has(e));
      this.model = [...this.model, addedValues];
    },
    value(newValue, oldValue) {
      if (oldValue !== newValue) {
        const selected = this.options.map((o) => o[this.valueKey]);
        const unselected = new Set(this.value);
        this.model = selected.filter((e) => !unselected.has(e));
      }
    },
    model(currentValue) {
      const selected = new Set(currentValue);
      const all = this.options.map((o) => o.id);
      const newUnselected = all.filter((e) => !selected.has(e));

      const newSet = new Set(newUnselected);
      const oldSet = new Set(this.cachedUnselected);
      const intersect = [
        ...newUnselected.filter((e) => !oldSet.has(e)),
        ...this.cachedUnselected.filter((e) => !newSet.has(e)),
      ];

      if (intersect.length > 0) {
        this.cachedUnselected = newUnselected;
        this.$emit('input', this.cachedUnselected);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

<template>
  <div class="autocomplete">
    <label :for="'d1_' + _uid">{{ title }}</label>
    <input
      :id="'d1_' + _uid"
      v-model="search"
      class="form-control form-control-sm"
      :class="{ 'is-invalid': error }"
      type="text"
      @input="onChange"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
    />
    <ul
      v-show="isOpen && results.length"
      id="autocomplete-results"
      class="list-group autocomplete-results"
    >
      <li
        v-for="(result, i) in results"
        :key="i"
        class="autocomplete-result list-group-item list-group-item-action"
        :class="{ active: i === arrowCounter }"
        @click="setResult(result)"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'BaseAutocomplete',

  props: {
    modelValue: {
      default: '',
    },
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    error: {
      type: Boolean,
      required: false,
      default: false,
    },
    title: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      isOpen: false,
      results: [],
      search: this.modelValue,
      isLoading: false,
      arrowCounter: 0,
    };
  },
  watch: {
    items: function (val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
      }
    },
    modelValue: function (val) {
      this.search = val;
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  unmounted() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    onChange() {
      // Let's warn the parent that a change was made
      this.$emit('update:modelValue', this.search);

      // Let's  our flat array
      this.filterResults();
      this.isOpen = true;
    },

    filterResults() {
      // first uncapitalize all the things
      this.results = this.items.filter((item) => {
        return item.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      this.search = result;
      this.isOpen = false;
      this.arrowCounter = -1;
      this.$emit('update:modelValue', this.search);
    },
    onArrowDown() {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    onEnter() {
      if (this.results.length === 0 || this.arrowCounter < 0) return;
      this.search = this.results[this.arrowCounter];
      this.isOpen = false;
      this.arrowCounter = -1;
      this.$emit('update:modelValue', this.search);
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
  },
};
</script>

<style>
.autocomplete {
  position: relative;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #ced4da;
  height: 120px;
  overflow: auto;
  width: 100%;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}
</style>

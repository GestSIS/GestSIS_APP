<script setup>
import {
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watchEffect,
} from 'vue';

const search = defineModel({
  type: [Object, Number, String],
  default: '',
});

const { items, error, title } = defineProps({
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
    default: '',
  },
});

const isOpen = ref(false);
const results = ref([]);
const arrowCounter = ref(0);
const uid = ref(Math.random());
const root = useTemplateRef('root');

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));

watchEffect(() => {
  results.value = items.filter((item) => {
    return item.toLowerCase().indexOf(search.value.toLowerCase()) > -1;
  });
  isOpen.value = true;
});

isOpen.value = false;

const setResult = (result) => {
  search.value = result;
  nextTick(() => (isOpen.value = false));
  arrowCounter.value = -1;
};

const onArrowDown = () => {
  if (arrowCounter.value < results.value.length) {
    arrowCounter.value = arrowCounter.value + 1;
  }
};
const onArrowUp = () => {
  if (arrowCounter.value > 0) {
    arrowCounter.value = arrowCounter.value - 1;
  }
};
const onEnter = () => {
  if (results.value.length === 0 || arrowCounter.value < 0) return;
  search.value = results.value[arrowCounter.value];
  nextTick(() => (isOpen.value = false));
  arrowCounter.value = -1;
};
const handleClickOutside = (evt) => {
  if (!root.value.contains(evt.target)) {
    isOpen.value = false;
    arrowCounter.value = -1;
  }
};
</script>

<template>
  <div class="autocomplete" ref="root">
    <label :for="'d1_' + uid">{{ title }}</label>
    <input
      :id="'d1_' + uid"
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

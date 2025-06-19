<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  tag: {
    type: String,
    default: () => 'div',
  },
  buttonClass: {
    type: String,
    default: () => '',
  },
  menuClass: {
    type: String,
    default: () => '',
  },
  title: {
    type: String,
    default: () => '',
  },
});

const dropdown = ref(false);
const listener = ref(null);
const root = ref(null);

onMounted(() => {
  listener.value = function (e) {
    // close dropdown when clicked outside
    if (!root.value.contains(e.target)) {
      dropdown.value = false;
    }
  };
  document.addEventListener('click', listener.value);
});
onUnmounted(() => {
  document.removeEventListener('click', listener.value);
});

// Methods for manipulations from outside
const close = () => {
  dropdown.value = false;
};
const open = () => {
  dropdown.value = true;
};
const trigger = () => {
  dropdown.value = !dropdown.value;
};
defineExpose({
  close,
  open,
  trigger,
});
</script>

<template>
  <component :is="tag" ref="root" class="nav-item dropdown">
    <button
      class="dropdown-toggle"
      :class="buttonClass"
      data-bs-toggle="dropdown"
      @click.prevent="dropdown = !dropdown"
    >
      <slot name="title">{{ title }}</slot>
    </button>
    <div class="dropdown-menu" :class="[dropdown ? 'show' : '', menuClass]">
      <slot name="default"></slot>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.dropdown-menu-end {
  right: 0;
  left: auto;
}
</style>

<template>
  <component :is="type" class="nav-item dropdown">
    <button
      class="nav-link dropdown-toggle"
      :class="buttonClass"
      @click="dropdown = !dropdown"
    >
      <slot name="title">
        {{ title }}
      </slot>
    </button>
    <div class="dropdown-menu" :class="[dropdown ? 'show' : '', menuClass]">
      <slot name="default"></slot>
    </div>
  </component>
</template>

<script>
export default {
  props: {
    type: {
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
  },
  data() {
    return {
      dropdown: false,
      listener: null,
    };
  },
  created() {
    let self = this;
    this.listener = function (e) {
      // close dropdown when clicked outside
      if (!self.$el.contains(e.target)) {
        self.dropdown = false;
      }
    };
    document.addEventListener('click', this.listener);
  },
  destroy() {
    document.removeEventListener('click', this.listener);
  },
  methods: {
    close() {
      this.dropdown = false;
    },
    open() {
      this.dropdown = true;
    },
    trigger() {
      this.dropdown = !this.dropdown;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
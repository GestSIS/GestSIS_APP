<template>
  <div class="tree-node" :class="[!isRoot ? 'tree-node--parent' : '']">
    <div
      class="tree-node-header focusable hoverable"
      :class="{ 'table-primary': active && active.key == node.key }"
      @dblclick="() => expand(data)"
      @click="select(node)"
    >
      <div tabindex="-1" class="focus-helper"></div>
      <svg
        @click.prevent="() => expand(data)"
        v-if="computedChildren.length > 0"
        aria-hidden="true"
        role="presentation"
        focusable="false"
        viewBox="0 0 24 24"
        class="q-tree__arrow q-mr-xs q-icon notranslate tree-node-arrow"
        :class="[expanded ? 'tree-node-arrow--rotate' : '']"
      >
        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"></path>
      </svg>
      <div class="tree-node-content">
        <img v-if="data.avatar" :src="data.avatar" class="tree-node-icon" />
        <font-awesome-icon
          v-else-if="data.icon"
          :icon="data.icon"
          size="xs"
          class="tree-node-icon"
          :color="data.color"
        />
        <div class="user-select-none">{{ data.label }}</div>
      </div>
    </div>
    <transition-expand>
      <div v-show="expanded && data.children" class="tree-node-children">
        <node
          v-for="item in lazyChildren"
          :key="item.key"
          :node="item"
          :_types="_types"
          class="tree-node--parent"
          :select="select"
          :active="active"
        />
      </div>
    </transition-expand>
  </div>
</template>

<script>
import TransitionExpand from '@/components/transition/TransitionExpand.vue';

export default {
  name: 'Node',
  components: {
    TransitionExpand,
  },
  props: {
    _types: {
      required: false,
      type: Object,
      default: () => {},
    },
    node: {
      required: true,
      type: Object,
    },
    isRoot: {
      required: false,
      type: Boolean,
      default: false,
    },
    select: {
      type: Function,
      required: true,
      default: () => {},
    },
    active: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      expanded: false,
      computed: false,
    };
  },
  computed: {
    data() {
      return {
        ...this._types[this.node.type],
        ...this.node,
      };
    },
    computedChildren() {
      return Array.isArray(this.node.children)
        ? this.node.children
        : typeof this.node.children === 'function'
        ? this.node.children()
        : [];
    },
    lazyChildren() {
      const children = this.computedChildren;
      return this.computed ? children : [];
    },
  },
  methods: {
    async expand() {
      if (!this.computed) {
        this.computed = true;
        await this.$nextTick();
      }
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style scoped>
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

<style lang="scss" scoped>
// src/App.vue
.expand-enter-active,
.expand-leave-active {
  transition-property: height;
  transition: height 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}

.focus-helper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 4px;
  opacity: 0;
  transition: background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    opacity 0.4s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.tree-node-icon {
  margin-right: 4px;
}

.focus-helper:before {
  background: #fff;
}
.focus-helper:after {
  background: #000;
}

.focusable:focus > .focus-helper,
.hoverable:hover > .focus-helper,
.manual-focusable--focused > .focus-helper {
  background: currentColor;
  opacity: 0.15;
}
.focusable:focus > .focus-helper:before,
.q-hoverable:hover > .focus-helper:before,
.q-manual-focusable--focused > .focus-helper:before {
  opacity: 0.1;
}
.focusable:focus > .focus-helper:after,
.q-hoverable:hover > .focus-helper:after,
.q-manual-focusable--focused > .focus-helper:after {
  opacity: 0.4;
}
.focusable:focus > .focus-helper,
.q-manual-focusable--focused > .focus-helper {
  opacity: 0.22;
}

.tree-node-arrow {
  width: 1em;
  height: 1em;
  margin-left: 5px;
  transition: transform 0.3s;
}

.tree-node-icon {
  font-size: 28px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  margin-right: 8px;
}

.tree-node-arrow--rotate {
  transform: rotate3d(0, 0, 1, 90deg);
}

.tree-node-content {
  padding-left: 10px;
  display: flex;
  align-items: center;
}

.tree-node .tree-node--parent {
  padding-left: 2px;
}

.tree-node {
  position: relative;
  padding: 0 0 3px 5px;
}

.tree-node-header {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.tree-node.tree-node--parent::after {
  content: '';
  position: absolute;
  top: -3px;
  bottom: 0;
  width: 2px;
  right: auto;
  left: -13px;
  border-left: 1px solid currentColor;
}

.tree-node:last-child:after {
  display: none;
}

.tree-node--parent > .tree-node-header::before {
  content: '';
  position: absolute;
  width: 15px;
  left: -15px;
  top: -3px;
  bottom: 50%;
  border-left: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
}

.tree-node-children {
  padding-left: 25px;
}
</style>

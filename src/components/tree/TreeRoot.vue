<template>
  <div class="tree">
    <tree-node
      v-for="item in tree"
      :key="item.id"
      :node="item"
      :_types="_types"
      :is-root="true"
      :select="select"
      :active="active"
    ></tree-node>
  </div>
</template>

<script>
import TreeNode from '@/components/tree/TreeNode.vue';

export default {
  name: 'TreeRoot',
  components: {
    TreeNode,
  },
  props: {
    _types: {
      type: Object,
      required: false,
      default: () => {},
    },
    tree: {
      type: Array,
      required: true,
    },
    selectable: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  emits: ['selected'],
  data() {
    return {
      active: null,
    };
  },
  methods: {
    select(elem) {
      if (this.selectable) {
        this.active = elem;
        this.$emit('selected', elem);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

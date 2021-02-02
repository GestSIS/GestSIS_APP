<template>
  <div class="tree">
    <node
      v-for="item in tree"
      :key="item.id"
      :node="item"
      :_types="_types"
      :is-root="true"
    ></node>
  </div>
</template>

<script>
import Node from '@/components/tree/Node.vue';

export default {
  name: 'tree',
  components: {
    Node,
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
  },
};
</script>

<style lang="scss" scoped></style>

<template>
  <div class="tree">
    <editable-node
      v-for="(item, index) in tree"
      :key="item.id"
      :node="item"
      :_types="_types"
      :select="select"
      :active="active"
      :is-root="true"
      :is-first="index == 0"
      :is-first-of-level="index == 0"
      :is-last="index + 1 == tree.length"
    ></editable-node>
  </div>
</template>

<script>
import EditableNode from '@/components/editable_tree/EditableNode.vue';

export default {
  name: 'EditableTree',
  components: {
    EditableNode,
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
  data() {
    return {
      active: null,
    };
  },
  methods: {
    select(elem) {
      if (this.selectable) {
        this.active = elem;
        this.$emit("selected", elem);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

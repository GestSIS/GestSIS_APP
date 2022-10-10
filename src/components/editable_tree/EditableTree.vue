<template>
  <div class="tree">
    <div v-if="!tree.length">Aucun élément à afficher</div>
    <editable-node
      v-for="(item, index) in tree"
      ref="node"
      :key="item.id"
      :node="item"
      :_types="_types"
      :select="select"
      :active="localActive"
      :is-root="true"
      :is-first="index == 0"
      :is-first-of-level="index == 0"
      :is-last="index + 1 == tree.length"
      :is-last-of-level="index + 1 == tree.length"
    >
      <template #default="props">
        <slot :node="props.node"></slot>
      </template>
    </editable-node>
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
    active: {
      type: Object,
      required: false,
      default: () => null,
    },
  },
  emits: ['selected'],
  data() {
    return {
      localActive: null,
    };
  },
  watch: {
    active(newValue) {
      this.localActive = newValue.data;
    },
  },
  mounted() {
    this.localActive = this.active?.data;
  },
  methods: {
    contract() {
      this.$refs.node.forEach((node) => node.expand(false));
    },
    expand() {
      this.$refs.node.forEach((node) => node.expand(true));
    },
    select(elem) {
      if (this.selectable) {
        this.localActive = elem.data;
        this.$emit('selected', elem);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

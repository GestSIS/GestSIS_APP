<script setup>
import { ref, useTemplateRef, watch } from "vue";
import EditableNode from "/src/components/editable_tree/EditableNode.vue";

const { types, tree, selectable, active } = defineProps({
  types: {
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
});

const emit = defineEmits(["selected"]);
const localActive = ref(null);

watch(
  () => active,
  (newValue) => {
    localActive.value = newValue.data;
  },
);

localActive.value = active?.data;

const nodeRef = useTemplateRef("node");
const contract = () => nodeRef.forEach((node) => node.expand(false));
const expand = () => nodeRef.forEach((node) => node.expand(true));
const select = (elem) => {
  if (selectable) {
    localActive.value = elem.data;
    emit("selected", elem);
  }
};
defineExpose({
  contract,
  expand,
  select,
});
</script>

<template>
  <div class="tree">
    <div v-if="!tree.length">Aucun élément à afficher</div>
    <editable-node
      v-for="(item, index) in tree"
      ref="node"
      :key="item.id"
      :node="item"
      :types="types"
      :select="select"
      :active="localActive"
      :is-root="true"
      :is-first="index == 0"
      :is-first-of-level="index == 0"
      :is-last="index + 1 == tree.length"
      :is-last-of-level="index + 1 == tree.length"
    >
      <template #default="{ node }">
        <slot :node="node"></slot>
      </template>
    </editable-node>
  </div>
</template>

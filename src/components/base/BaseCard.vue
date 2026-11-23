<script setup>
defineProps({
  tag: { type: String, default: "div" },
  title: { type: String, default: "" },
  headerClass: {
    type: [String, Array, Object],
    default: "d-flex justify-content-between align-items-center",
  },
  bodyClass: { type: [String, Array, Object], default: "" },
});
</script>

<template>
  <component :is="tag" class="card mb-3">
    <div v-if="title || $slots.title || $slots.header" class="card-header" :class="headerClass">
      <h3 v-if="title || $slots.title" class="card-title m-0 fs-5">
        <slot name="title">{{ title }}</slot>
      </h3>
      <slot v-if="$slots.header" name="header"></slot>
    </div>
    <div v-if="$slots.body" class="card-body" :class="bodyClass">
      <slot name="body"></slot>
    </div>
    <div v-if="$slots['body-table']" class="card-body table-responsive p-0">
      <slot name="body-table"></slot>
    </div>
    <slot></slot>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </component>
</template>

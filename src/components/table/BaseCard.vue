<template>
  <div class="card mb-2">
    <div
      v-if="$slots.title || $slots.header"
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h5 v-if="$slots.title" class="card-title m-0">
        <slot name="title"></slot>
      </h5>
      <slot v-if="$slots.header" name="header"></slot>
    </div>
    <div v-if="$slots.body" class="card-body table-responsive p-0">
      <slot name="body"></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

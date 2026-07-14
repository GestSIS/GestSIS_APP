<script setup>
import { defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { useModalStore } from '../stores/common/Modal';

const components = Object.fromEntries(
  Object.entries(import.meta.glob('./modal/*.vue')).map(([key, value]) => {
    const name = key.split('/').pop().replace('.vue', '');
    return [name, defineAsyncComponent(value)];
  }),
);

const modal = useModalStore();

const escapeHandler = (e) => {
  if (e.key === 'Escape' && modal.visible) {
    (modal.callback() ?? Promise.resolve()).then((close) => {
      if (close ?? true) {
        modal.closeModal();
      }
    });
  }
};
onMounted(() => document.addEventListener('keydown', escapeHandler));
onUnmounted(() => document.removeEventListener('keydown', escapeHandler));
</script>

<template>
  <div>
    <!-- Modal -->
    <div
      v-if="modal.visible"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog modal-dialog-scrollable"
        :class="
          {
            [-1]: 'modal-sm',
            0: '', // Default
            1: 'modal-lg',
            2: 'modal-xl',
          }[modal.size]
        "
        role="document"
      >
        <suspense>
          <component
            :is="components[modal.component]"
            :callback="modal.callback"
            :data="modal.data"
            class="modal-content"
          ></component>
          <template #fallback>Loading ...</template>
        </suspense>
      </div>
    </div>
    <!-- Overlay -->
    <div
      v-if="modal.visible"
      id="modal-overlay"
      class="modal-backdrop fade show"
    ></div>
  </div>
</template>

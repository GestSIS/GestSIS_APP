<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
const { closeModal } = useModalStore();
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Chargement en cours ...</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    </div>
  </div>
</template>

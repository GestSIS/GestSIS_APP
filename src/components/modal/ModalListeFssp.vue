<script setup>
import { toLocalIsoDate } from "../../tools/index.js";
import { ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import SapeurService from "../../services/SapeurService";

const date = ref(toLocalIsoDate());

const { showModal, closeModal } = useModalStore();
const awn = useNotification();

const confirmer = () => {
  showModal({ component: "ModalChargement" });
  SapeurService.listeFssp(date.value)
    .catch((error) => {
      awn.warning(error?.message ?? "Erreur lors de la génération de la liste FSSP");
    })
    .then(closeModal);
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Impression liste FSSP</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="numero">Date</label>
        <input id="date" v-model="date" type="date" class="form-control form-control-sm" />
      </div>
    </div>
    <div class="modal-footer">
      <button ref="cancelButton" type="button" class="btn btn-secondary" @click="closeModal">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="confirmer()">Confirmer</button>
    </div>
  </div>
</template>

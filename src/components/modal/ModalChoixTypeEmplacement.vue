<script setup>
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";

const { showModal, closeModal } = useModalStore();
const emplacementStore = useEmplacementStore();

const choisirHangar = () => showModal({ component: "ModalHangar", data: {} });
const choisirEmplacement = () => showModal({ component: "ModalEmplacement", data: {} });
const choisirVehicule = () =>
  showModal({
    component: "ModalArticle",
    data: { vehiculeUniquement: true },
    // La création d'un véhicule crée son emplacement représenté côté serveur sans
    // passer par emplacementStore.addEmplacement, d'où le rafraîchissement manuel.
    callback: () => emplacementStore.fetchEmplacements(),
  });
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Ajouter un emplacement</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row g-3">
        <div class="col-4">
          <button
            type="button"
            class="btn btn-outline-primary w-100 py-4 d-flex flex-column align-items-center"
            @click="choisirHangar"
          >
            <font-awesome-icon :icon="['far', 'house']" size="2x" class="mb-2" />
            Hangar
          </button>
        </div>
        <div class="col-4">
          <button
            type="button"
            class="btn btn-outline-primary w-100 py-4 d-flex flex-column align-items-center"
            @click="choisirEmplacement"
          >
            <font-awesome-icon :icon="['fas', 'box']" size="2x" class="mb-2" />
            Emplacement simple
          </button>
        </div>
        <div class="col-4">
          <button
            type="button"
            class="btn btn-outline-primary w-100 py-4 d-flex flex-column align-items-center"
            @click="choisirVehicule"
          >
            <font-awesome-icon :icon="['fas', 'car']" size="2x" class="mb-2" />
            Véhicule
          </button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Annuler</button>
    </div>
  </div>
</template>

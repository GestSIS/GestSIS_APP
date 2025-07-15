<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const store = useStore();
const sapeurs = computed(() => store.state.sapeur.liste);

const { closeModal } = useModalStore();
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Absences ({{ data.absences.size }})
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <ul>
        <li v-for="sapeurId in data.absences ?? []" :key="sapeurId">
          {{ sapeurs.find((s) => s.id == sapeurId)?.nom_prenom }}
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
    </div>
  </div>
</template>

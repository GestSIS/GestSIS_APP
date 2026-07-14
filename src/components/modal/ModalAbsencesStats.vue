<script setup>
import { computed } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const sapeurStore = useSapeurStore();
sapeurStore.fetchListeSapeur();

const sapeurs = computed(() => sapeurStore.liste);

const { closeModal } = useModalStore();
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Absences ({{ data.absences.size }})</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <ul v-if="data.absences.size">
        <li v-for="sapeurId in data.absences ?? []" :key="sapeurId">
          {{ sapeurs.find((s) => s.id == sapeurId)?.nom_prenom }}
        </li>
      </ul>
      <div v-else>Aucune absence</div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
    </div>
  </div>
</template>

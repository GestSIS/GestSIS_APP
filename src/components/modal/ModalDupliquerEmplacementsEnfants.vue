<script setup>
import { computed, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";
import useNotification from "../../composables/useNotification.js";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const emplacementStore = useEmplacementStore();
await emplacementStore.fetchEmplacements();

const parentIds = computed(() => new Set(emplacementStore.liste.map((e) => e.parent_id)));
const estCibleValide = (e) => e.statut && !parentIds.value.has(e.id);

const cibleId = ref(null);
const enCours = ref(false);

const { closeModal } = useModalStore();
const awn = useNotification();
const dupliquer = async () => {
  enCours.value = true;
  try {
    const crees = await emplacementStore.dupliquerEnfants(data.id, cibleId.value);
    awn.success(`${crees.length} emplacement(s) dupliqué(s)`);
    closeModal();
  } catch (res) {
    awn.alert(res.message || "Erreur lors de la duplication");
  } finally {
    enCours.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="dupliquer">
    <div class="modal-header">
      <h5 class="modal-title">Dupliquer les emplacements enfants</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <p>
        Les sous-emplacements actifs de <strong>{{ data.designation }}</strong> seront copiés dans
        l'emplacement choisi, avec toute leur hiérarchie. Le matériel rangé et les véhicules ne sont
        pas copiés.
      </p>
      <select-emplacement
        v-model="cibleId"
        label="Emplacement de destination (actif, sans sous-emplacement)"
        :emplacement-id-to-ignore="data.id"
        :filtre="estCibleValide"
        required
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary" :disabled="!cibleId || enCours">
        Dupliquer
      </button>
    </div>
  </form>
</template>

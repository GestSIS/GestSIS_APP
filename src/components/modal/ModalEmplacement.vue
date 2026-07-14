<script setup>
import { ref, reactive } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useEmplacementStore } from '../../stores/materiel/Emplacement.js';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';
import SelectCouleur from '../materiel/SelectCouleur.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const emplacementStore = useEmplacementStore();
await emplacementStore.fetchEmplacements();

const errors = ref({});
const form = reactive({
  statut: 1,
  est_etiquete: false,
  est_compartimentable: false,
  ...data,
});

const { closeModal } = useModalStore();
const save = async () => {
  ((form.id || 0) === 0
    ? emplacementStore.addEmplacement
    : emplacementStore.updateEmplacement)(form)
    .then(closeModal)
    .catch(
      (errors) =>
        (errors = {
          ...errors,
        }),
    );
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un emplacement
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <base-checkbox
        v-model="form.est_etiquete"
        label="Est etiqueté"
        class="mb-3"
      />
      <base-checkbox
        v-model="form.est_compartimentable"
        label="Est compartimenté"
        class="mb-3"
      />
      <base-checkbox v-model="form.statut" label="Actif" class="mb-3" />
      <select-emplacement
        v-model="form.parent_id"
        label="Emplacement parent"
        :emplacement-id-to-ignore="form.id"
        :emplacement-racine="true"
        class="mb-3"
      />
      <select-couleur v-model="form.couleur_id" label="Couleur" class="mb-3" />
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="form.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="sumit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { inject, ref } from 'vue';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { useModalStore } from '../../stores/common/Modal.js';
import SelectCategorie from '../materiel/SelectCategorie.vue';
import SelectCouleur from '../materiel/SelectCouleur.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({
  couleur_id: null,
  parent_id: null,
  ...data,
});

const categorieStore = useMaterielCategorieStore();

const { closeModal } = useModalStore();

const awn = inject('awn');
const save = async () => {
  if (activeItem.value.couleur_id == null) {
    awn.alert('Veuillez sélectionnez une couleur');
    return;
  }
  ((activeItem.value.id || 0) === 0
    ? categorieStore.addMaterielCategorie
    : categorieStore.updateMaterielCategorie)(activeItem.value)
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="overflow-visible">
      <div class="modal-header">
        <h5 id="exampleModalLabel" class="modal-title">
          {{ activeItem.id ? 'Modifier' : 'Ajouter' }} une catégorie
        </h5>
        <button type="button" class="btn-close" @click="closeModal"></button>
      </div>
      <div class="modal-body overflow-visible">
        <div class="mb-3">
          <label for="designation">Désignation</label>
          <input
            id="designation"
            v-model="activeItem.designation"
            required
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['designation'] }"
          />
        </div>
        <!-- TODO: Migrer base-select afin de permettre la customization du contenu -->
        <select-categorie
          v-model="activeItem.parent_id"
          label="Catégorie parente"
          :categorie-id-to-ignore="activeItem.id"
          class="mb-3"
        />
        <select-couleur
          v-model="activeItem.couleur_id"
          label="Couleur"
          class="mb-3"
        />
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Fermer
        </button>
        <button type="submit" class="btn btn-primary">
          {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
        </button>
      </div>
    </div>
  </form>
</template>

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
const activeItem = ref({ ...data });

const categorieStore = useMaterielCategorieStore();

const { closeModal } = useModalStore();

const awn = inject('awn');
const save = async () => {
  if (activeItem.value.parent_id == null) {
    awn.alert('Veuillez sélectionnez un catégorie parente');
    return;
  }
  if (activeItem.value.couleur_id == null) {
    awn.alert('Veuillez sélectionnez une couleur');
    return;
  }
  ((activeItem.value.id || 0) === 0
    ? categorieStore.addMaterielCategorie
    : categorieStore.updateMaterielCategorie)(activeItem.value)
    .then(closeModal)
    .catch(
      (errors) =>
        (errors.value = {
          ...errors,
        }),
    );
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
            required
            id="designation"
            v-model="activeItem.designation"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['designation'] }"
          />
        </div>
        <!-- TODO: Migrer base-select afin de permettre la customization du contenu -->
        <select-categorie
          label="Catégorie parente"
          v-model="activeItem.parent_id"
          :categorie-id-to-ignore="activeItem.id"
          class="mb-3"
        />
        <select-couleur
          label="Couleur"
          v-model="activeItem.couleur_id"
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

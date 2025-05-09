<script setup>
import { ref } from 'vue';
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

const save = async () => {
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
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} une catégorie
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body overflow-visible">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
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
      />
      <select-couleur label="Couleur" v-model="activeItem.couleur_id" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>

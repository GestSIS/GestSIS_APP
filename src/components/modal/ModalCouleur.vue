<script setup>
import { ref } from 'vue';
import TagCouleur from '../materiel/TagCouleur.vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({
  ...data,
  fond: data?.fond?.slice(0, 7) ?? '#ffffff',
  texte: data?.texte?.slice(0, 7) ?? '#000000',
});

const couleurStore = useCouleurStore();

const { closeModal } = useModalStore();
const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? couleurStore.addCouleur
    : couleurStore.updateCouleur)(activeItem.value)
    .then(closeModal)
    .catch(
      (err) =>
        (errors.value = {
          ...err,
        }),
    );
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} une couleur
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="nom">Désignation</label>
        <input
          id="nom"
          v-model="activeItem.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
        />
      </div>
      <div class="mb-3">
        <label for="texte">Texte</label>
        <input
          id="texte"
          type="color"
          v-model="activeItem.texte"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texte'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fond">Fond</label>
        <input
          id="fond"
          type="color"
          v-model="activeItem.fond"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fond'] }"
        />
      </div>
      <div class="mb-3">
        <label>Résultat</label>
        <div class="ms-2 mt-2">
          <tag-couleur :couleur="activeItem">{{ activeItem.nom }}</tag-couleur>
        </div>
      </div>
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

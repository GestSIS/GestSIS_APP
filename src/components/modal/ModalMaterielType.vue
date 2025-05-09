<script setup>
import { ref } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useModalStore } from '../../stores/common/Modal.js';
import SelectCategorie from '../materiel/SelectCategorie.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({ ...data });

const typeStore = useMaterielTypeStore();

const { closeModal } = useModalStore();
const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? typeStore.addMaterielType
    : typeStore.updateMaterielType)(activeItem.value)
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
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} un matériel type
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
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
      <select-categorie
        v-model="activeItem.materiel_categorie_id"
        :class="{ 'is-invalid': errors['materiel_categorie_id'] }"
        label="Catégorie"
        class="mb-3"
      />
      <base-checkbox
        v-model="activeItem.est_attribuable"
        class="mb-3"
        label="Est attribuable"
      />
      <base-checkbox
        v-model="activeItem.est_taillee"
        class="mb-3"
        label="Possède une taille"
      />
      <base-checkbox
        v-model="activeItem.est_numerote"
        class="mb-3"
        label="Est numéroté"
      />
      <div v-if="activeItem.est_numerote" class="mb-3">
        <label for="designation">Préfix (numérotation)</label>
        <input
          id="prefix"
          v-model="activeItem.prefix"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['prefix'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Fournisseur</label>
        <input
          id="fournisseur"
          v-model="activeItem.fournisseur"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fournisseur'] }"
        />
      </div>
      <div class="mb-3">
        <label for="prix">Prix</label>
        <input
          id="prix"
          v-model="activeItem.prix"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['prix'] }"
        />
      </div>
      <div class="mb-3">
        <label for="reparateur">Réparateur</label>
        <input
          id="reparateur"
          v-model="activeItem.reparateur"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['reparateur'] }"
        />
      </div>
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="activeItem.remarque"
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
      <button type="button" class="btn btn-primary" @click="save">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>

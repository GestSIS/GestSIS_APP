<script setup>
import { computed, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import SelectEmplacement from '../materiel/SelectEmplacement.vue';

const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({quantite:1, ...data });

const typeStore = useMaterielTypeStore();
await typeStore.fetchMaterielTypes();

const type = computed(() =>
  typeStore.liste.find((t) => t.id == activeItem.value.materiel_type_id),
);

const { closeModal } = useModalStore();

const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? ArticleService.creerArticles
    : ArticleService.updateArticles)([activeItem.value])
    .then(() => {
      closeModal();
      callback();
    })
    .catch(
      (err) =>
        (errors.value = {
          ...err,
        }),
    );
};
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} un article
      </h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body overflow-visible">
      <base-select
        v-model="activeItem.materiel_type_id"
        :disabled="activeItem.id"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_type_id'] }"
        label="Matériel type"
        display-key="designation"
        :options="typeStore.liste"
      />
      <div v-if="!activeItem.id && type && !type.est_numerote" class="mb-3">
        <label for="quantite">Quantité</label>
        <input
          id="quantite"
          v-model="activeItem.quantite"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['quantite'] }"
        />
      </div>
      <select-emplacement
        label="Emplacement"
        v-if="!activeItem.id || activeItem.emplacement_id"
        class="mb-3"
        v-model="activeItem.emplacement_id"
      />
      <div v-if="type && type.type === 3" class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeItem.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div v-if="type && type.type === 3" class="mb-3">
        <label for="immatriculation">Immatriculation</label>
        <input
          id="immatriculation"
          v-model="activeItem.immatriculation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['immatriculation'] }"
        />
      </div>
      <div v-if="type && type.type === 3" class="mb-3">
        <label for="chassis">Chassis</label>
        <input
          id="chassis"
          v-model="activeItem.chassis"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['chassis'] }"
        />
      </div>
      <div
        class="mb-3"
        v-if="type && activeItem.emplacement_id && type.type !== 3"
      >
        <label for="compartiment">Compartiment</label>
        <input
          id="compartiment"
          v-model="activeItem.compartiment"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['compartiment'] }"
        />
      </div>
      <base-checkbox
        class="mb-3"
        label="Est étiquetté correctement"
        v-model="activeItem.est_etiquete"
      />
      <div v-if="type && type.est_numerote" class="mb-3">
        <label for="numero">Numéro</label>
        <input
          id="numero"
          v-model="activeItem.numero"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['numero'] }"
        />
      </div>
      <div v-if="type && type.est_taillee" class="mb-3">
        <label for="taille">Taille</label>
        <input
          id="taille"
          v-model="activeItem.taille"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['taille'] }"
        />
      </div>
      <div class="mb-3">
        <label for="achat">Achat</label>
        <input
          id="achat"
          v-model="activeItem.achat"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['achat'] }"
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

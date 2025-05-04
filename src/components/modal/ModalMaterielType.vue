<script setup>
import { computed, ref } from 'vue';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { groupedByData } from '../../tools';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import useModal from '../../hooks/useModal';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({ ...data });

const typeStore = useMaterielTypeStore();
const categorieStore = useMaterielCategorieStore();
const categories = computed(() =>
  categorieStore.liste.sort((a, b) => a.designation - b.designation),
);
const indexedCategories = computed(() =>
  groupedByData(categorieStore.liste, 'parent_id'),
);

const computedCategories = computed(() => {
  let data = [];

  const recursive = (categories, prefix) => {
    categories.forEach((c) => {
      data.push({
        ...c,
        fullDesignation: prefix + c.designation,
      });
      if (indexedCategories.value[c.id])
        recursive(
          indexedCategories.value[c.id],
          prefix + c.designation + ' > ',
        );
    });
  };

  recursive(
    categories.value.filter((c) => !c.parent_id),
    '',
  );
  return data;
});

const { closeModal } = useModal();
const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? typeStore.addMaterielType
    : typeStore.updateMaterielType)(activeItem.value)
    .then(closeModal)
    .catch(
      (errors) =>
        (this.errors = {
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
      <base-select
        v-model="activeItem.materiel_categorie_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['materiel_categorie_id'] }"
        label="Catégorie"
        display-key="fullDesignation"
        :options="computedCategories"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="close">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>

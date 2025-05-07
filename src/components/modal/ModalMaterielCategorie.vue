<script setup>
import { computed, ref } from 'vue';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { groupedByData } from '../../tools';
import { useModalStore } from '../../stores/common/Modal.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const activeItem = ref({ ...data });

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
      if (c.id === activeItem.value.id) return;
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

const { closeModal } = useModalStore();

const save = async () => {
  ((activeItem.value.id || 0) === 0
    ? categorieStore.addMaterielCategorie
    : categorieStore.updateMaterielCategorie)(activeItem.value)
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
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} une catégorie
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
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
      <!-- TODO: Migrer base-select afin de permettre la customization du contenu -->
      <base-select
        v-model="activeItem.parent_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['parent_id'] }"
        label="Catégorie parente"
        display-key="fullDesignation"
        base-option="<Aucun parent>"
        :base-value="null"
        :options="computedCategories"
      />
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

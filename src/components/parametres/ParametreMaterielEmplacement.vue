<script setup>
import { computed, ref } from 'vue';
import { groupedByData, indexedData } from '../../tools';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import TagCouleur from '../materiel/TagCouleur.vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';

const couleurStore = useCouleurStore();
const emplacementStore = useEmplacementStore();

await Promise.all([
  couleurStore.fetchCouleurs(),
  emplacementStore.fetchEmplacements(),
]);

const emplacements = computed(() => emplacementStore.liste);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const emplacementsGroupedByParent = computed(() =>
  groupedByData(emplacements.value, 'parent_id'),
);

const computedData = computed(() => {
  const recursive = (parent_id, level = 0) => {
    return [...(emplacementsGroupedByParent.value[parent_id] ?? [])].flatMap(
      (elem) => [{ ...elem, level }, ...recursive(elem.id, level + 1)],
    );
  };

  return recursive(null);
});

const { showModal } = useModalStore();

const ajout = () => showModal({ component: 'ModalEmplacement', data: {} });
const update = (elem) =>
  showModal({
    component: 'ModalEmplacement',
    data: { ...elem },
  });

const remove = (elem) => {
  showModal({
    component: 'ModalConfirmation',
    data: {
      title: `Voulez-vous vraiment supprimer cet emplacement ?`,
      question: 'Attention, la suppression de cet élément est irréversible !',
    },
    callback: (confirmed) => {
      if (confirmed) {
        emplacementStore
          .removeEmplacement(elem.id)
          .catch((res) =>
            this.$awn.alert(res.message || 'Erreur lors de la suppression'),
          );
      }
    },
  });
};

const fields = [
  { title: 'Emplacement', slot: 'emplacement' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Emplacements</h3>
      <button type="button" class="btn btn-primary me-2" @click="ajout">
        Ajouter un emplacement
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :data="computedData" :fields="fields">
        <template #emplacement="{ rowData }">
          <div :style="{ 'padding-left': rowData.level * 25 + 'px' }">
            <tag-couleur :couleur="indexedCouleurs[rowData.couleur_id]">
              {{ rowData.designation }}
            </tag-couleur>
          </div>
        </template>
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="update(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="remove(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped></style>

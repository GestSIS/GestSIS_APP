<script setup>
import { computed } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import TagCouleur from '../materiel/TagCouleur.vue';
import { useModalStore } from '../../stores/common/Modal.js';

const couleurStore = useCouleurStore();

await couleurStore.fetchCouleurs();
const couleurs = computed(() =>
  couleurStore.liste.sort((c1, c2) => c1.nom.localeCompare(c2.nom)),
);

const awn = useNotification();
const { confirm, showModal } = useModalStore();

const ajout = () => {
  showModal({ component: 'ModalCouleur', data: {} });
};
const update = (elem) => {
  showModal({
    component: 'ModalCouleur',
    data: { ...elem },
  });
};
const remove = (elem) =>
  confirm(
    'Voulez-vous vraiment supprimer cette couleur ?',
    "Attention, la suppression d'une couleur est irréversible !",
  ).then(() =>
    couleurStore
      .removeCouleur(elem.id)
      .catch((error) =>
        awn.alert(error.message ?? 'Impossible de supprimer cette couleur'),
      ),
  );

const fields = [
  { title: 'Couleur', slot: 'couleur' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Couleurs</h3>
      <button type="button" class="btn btn-primary" @click="ajout">
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="couleurs"
        :fields="fields"
        :selectable="true"
        no-data="Aucune couleur"
      >
        <template #couleur="{ rowData }">
          <tag-couleur :couleur="rowData">A</tag-couleur>
          {{ rowData.nom }}
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

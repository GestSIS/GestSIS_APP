<script setup>
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { groupedByData, indexedData } from '../../tools';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import TagCouleur from '../materiel/TagCouleur.vue';

const store = useStore();
const couleurStore = useCouleurStore();

await couleurStore.fetchCouleurs();
const couleurs = computed(() =>
  couleurStore.liste.sort((c1, c2) => c1.nom.localeCompare(c2.nom)),
);

const selectedId = ref(null);

const ajout = () => {
  console.log('TODO: à implémenter');
  // store.commit('SHOW_MODAL', { component: 'ModalMaterielCategorie', data: {} });
};
const update = (elem) => {
  store.commit('SHOW_MODAL', {
    component: 'modalCouleur',
    data: { ...elem },
  });
};
const remove = (elem) => {
  store
    .dispatch(
      elem.type === 'type' ? 'removeMaterielType' : 'removeMaterielCategorie',
      elem.id,
    )
    .catch((res) =>
      this.$awn.alert(res.message || 'Erreur lors de la suppression'),
    );
};

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

<style scoped></style>

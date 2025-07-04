<script setup>
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import { computed } from 'vue';
import { groupedByData, indexedData } from '../../tools';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import TagCouleur from '../materiel/TagCouleur.vue';
import { useModalStore } from '../../stores/common/Modal.js';

const couleurStore = useCouleurStore();
const typeStore = useMaterielTypeStore();
const categorieStore = useMaterielCategorieStore();

await Promise.all([
  couleurStore.fetchCouleurs(),
  typeStore.fetchMaterielTypes(),
  categorieStore.fetchMaterielCategories(),
]);

const categories = computed(() =>
  categorieStore.liste.sort((a, b) => a.designation - b.designation),
);
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedTypes = computed(() =>
  groupedByData(
    typeStore.liste.sort((a, b) => a.designation - b.designation),
    'materiel_categorie_id',
  ),
);
const indexedCategories = computed(() =>
  groupedByData(categorieStore.liste, 'parent_id'),
);

const computedData = computed(() => {
  let data = [];

  const recursive = (categories, level) => {
    categories.forEach((c) => {
      data.push({
        ...c,
        globalId: 'c' + c.id,
        estCategorie: true,
        level: level,
        tag: 'tag',
      });

      if (indexedCategories.value[c.id])
        recursive(indexedCategories.value[c.id], level + 1);

      indexedTypes.value[c.id]?.forEach((t) => {
        data.push({
          ...t,
          globalId: 't' + t.id,
          estCategorie: false,
          level: level + 1,
          tag: 'shirt',
        });
      });
    });
  };

  recursive(
    categories.value.filter((c) => !c.parent_id),
    0,
  );
  return data;
});

const { showModal, confirm } = useModalStore();

const ajoutCategorie = () =>
  showModal({ component: 'ModalMaterielCategorie', data: {} });
const ajoutType = () => showModal({ component: 'ModalMaterielType', data: {} });
const update = (elem) =>
  showModal({
    component: elem.estCategorie
      ? 'ModalMaterielCategorie'
      : 'ModalMaterielType',
    data: { ...elem },
  });

const remove = (elem) => {
  const designation = elem.estCategorie ? 'cette catégorie' : 'ce type';
  confirm(
    `Voulez-vous vraiment supprimer ${designation} ?`,
    'Attention, la suppression de cet élément est irréversible !',
  ).then(() =>
    (elem.estCategorie
      ? categorieStore.removeMaterielCategorie
      : typeStore.removeMaterielType)(elem.id).catch((res) =>
      this.$awn.alert(res.message || 'Erreur lors de la suppression'),
    ),
  );
};

const fields = [
  { title: 'Designation', slot: 'type' },
  { title: 'Couleur', slot: 'couleur' },
  { title: 'Attribuable', type: Boolean, key: 'est_attribuable' },
  { title: 'Taille', type: Boolean, key: 'est_taillee' },
  { title: 'Numéroté', type: Boolean, key: 'est_numerote' },
  { title: 'Lavable', type: Boolean, key: 'est_lavable' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Catégories et type de matériel</h3>
      <button
        type="button"
        class="btn btn-primary me-2"
        @click="ajoutCategorie"
      >
        Ajouter une catégorie
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :selectable="true"
        @click="ajoutType"
      >
        Ajouter un type de matériel
      </button>
    </div>

    <div class="card-body table-responsive p-0">
      <base-table
        :selectable="true"
        select-key="globalId"
        :data="computedData"
        :fields="fields"
        no-data="Aucune catégorie"
      >
        <template #type="{ rowData }">
          <div :style="{ 'padding-left': rowData.level * 25 + 'px' }">
            <font-awesome-icon
              v-if="!rowData.estCategorie"
              class="me-2"
              :icon="['fas', rowData.tag]"
            />
            <tag-couleur
              class="ms-2"
              v-if="rowData.estCategorie"
              :couleur="indexedCouleurs[rowData.couleur_id]"
            >
              {{ rowData.designation }}
            </tag-couleur>
            <template v-else>{{ rowData.designation }}</template>
          </div>
        </template>
        <template #couleur="{ rowData }">
          <template v-if="rowData.estCategorie">
            <tag-couleur :couleur="indexedCouleurs[rowData.couleur_id]">
              A
            </tag-couleur>
            {{ indexedCouleurs[rowData.couleur_id]?.nom }}
          </template>
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

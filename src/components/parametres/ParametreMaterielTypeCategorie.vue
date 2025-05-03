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

const selectedId = ref(null);

const computedData = computed(() => {
  let data = [];

  const recursive = (categories, level) => {
    categories.forEach((c) => {
      data.push({
        ...c,
        globalId: 'c' + c.id,
        type: 'categorie',
        level: level,
        tag: 'tag',
      });

      if (indexedCategories.value[c.id])
        recursive(indexedCategories.value[c.id], level + 1);

      indexedTypes.value[c.id]?.forEach((t) => {
        data.push({
          ...t,
          globalId: 't' + t.id,
          type: 'type',
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

const select = (item) => {
  selectedId.value = item?.globalId;
};
const ajoutCategorie = () => {
  store.commit('SHOW_MODAL', { component: 'ModalMatPersoCategorie', data: {} });
};
const ajoutType = () => {
  store.commit('SHOW_MODAL', { component: 'ModalMatPersoType', data: {} });
};
const update = (elem) => {
  store.commit('SHOW_MODAL', {
    component:
      elem.type == 'type' ? 'ModalMatPersoType' : 'ModalMatPersoCategorie',
    data: { ...elem },
  });
};
const remove = (elem) => {
  store
    .dispatch(
      elem.type === 'type' ? 'removeMatPersoType' : 'removeMatPersoCategorie',
      elem.id,
    )
    .catch((res) =>
      this.$awn.alert(res.message || 'Erreur lors de la suppression'),
    );
};
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
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="computedData.length <= 0">
            <td colspan="3">Aucune catégorie</td>
          </tr>
          <tr
            v-for="item in computedData"
            :key="item.globalId"
            :class="{
              'table-primary': item.globalId === selectedId,
            }"
            @click="select(item)"
          >
            <td :style="{ 'padding-left': item.level * 25 + 'px' }">
              <font-awesome-icon
                v-if="item.type === 'type'"
                class="me-2"
                :icon="['fas', item.tag]"
              />
              <tag-couleur
                class="ms-2"
                v-if="item.type === 'categorie'"
                :couleur="indexedCouleurs[item.couleur_id]"
              >
                {{ item.designation }}
              </tag-couleur>
              <template v-else>{{ item.designation }}</template>
            </td>
            <td>
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="update(item)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="remove(item)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>

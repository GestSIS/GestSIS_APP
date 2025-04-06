<script setup>
import { computed, ref, watch } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import ArticleService from '../../services/materiel/ArticleService';
import { indexedData } from '../../tools';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielTypeStore = useMaterielTypeStore();
const couleurStore = useCouleurStore();

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParEmplacement(id);
  loading.value = false;
};

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  couleurStore.fetchCouleurs(),
  Promise.resolve(await loadArticles()),
]);

watch(() => id, loadArticles);

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const computedData = computed(() =>
  articles.value.map((a) => ({
    ...a,
    type: indexedTypes.value[a.materiel_type_id],
  })),
);

const piecesColonnes = [
  { title: 'Compartiment', key: 'compartiment' },
  { title: 'Type', key: 'type', slot: 'type' },
  { title: 'Numéro', key: 'numero' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Ajouté', key: 'created_at', type: 'date' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
</script>

<template>
  <div class="card mb-2">
    <div class="card-header">
      <h5 class="m-0">Pièces ({{ articles.length }})</h5>
    </div>
    <base-table
      :data="computedData"
      no-data="Aucune pièce"
      :fields="piecesColonnes"
    >
      <template #type="{ rowData }">
        <div
          :style="{
            color: indexedCouleurs[rowData.type.couleur_id]?.texte ?? 'black',
            'background-color':
              indexedCouleurs[rowData.type.couleur_id]?.fond ?? '',
          }"
        >
          {{ rowData.type.designation }}
        </div>
      </template>
      <template #actions="{ rowData }"> TODO: </template>
    </base-table>
  </div>
</template>

<style></style>

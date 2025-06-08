<script setup>
import { computed, ref, watch } from 'vue';
import { groupedByData, indexedData } from '../../tools';
import ArticleService from '../../services/materiel/ArticleService';
import useConfirmation from '../../hooks/useConfirmation';
import { useModalStore } from '../../stores/common/Modal.js';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useMaterielCategorieStore } from '../../stores/materiel/Categorie';
import TagCouleur from './TagCouleur.vue';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielCategorieStore = useMaterielCategorieStore();
const materielTypeStore = useMaterielTypeStore();
const couleurStore = useCouleurStore();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const articles = ref([]);
const loading = ref(true);
const affichageIndividuel = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParEmplacement(id);
  loading.value = false;
};

loadArticles();
await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  materielCategorieStore.fetchMaterielCategories(),
  couleurStore.fetchCouleurs(),
]);

watch(() => id, loadArticles);

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedCategories = computed(() =>
  indexedData(materielCategorieStore.liste),
);

const computedData = computed(() =>
  Object.entries(
    groupedByData(
      articles.value.map((a) => ({
        ...a,
        type: indexedTypes.value[a.materiel_type_id],
        categorie_id:
          indexedTypes.value[a.materiel_type_id]?.materiel_categorie_id,
      })),
      'categorie_id',
    ),
  )
    .map(([key, values]) => ({ key, data: values, categorie_id: key }))
    .map((data) =>
      affichageIndividuel.value
        ? data
        : {
            ...data,
            data: Object.entries(groupedByData(data.data, 'materiel_type_id'))
              .map(([key, values]) => ({
                key,
                id: key,
                type: values[0].type,
                data: values,
                quantite: values.length,
                compartiments: new Set(values.map((a) => a.compartiment)),
              }))
              .map((a) => ({
                ...a,
                compartiment:
                  a.compartiments.size === 1
                    ? [...a.compartiments][0]
                    : `(${a.compartiments.size})`,
              })),
          },
    ),
);

const linearCategories = (categorieId) => {
  if (categorieId === null) {
    return [];
  }
  const categorie = indexedCategories.value[categorieId] ?? null;
  if (categorie === null) {
    return [];
  }
  return [...linearCategories(categorie.parent_id), categorie];
};

const piecesColonnes = computed(() => [
  { title: 'Type', key: 'type', slot: 'type' },
  { title: 'Compartiment', key: 'compartiment' },
  ...(affichageIndividuel.value
    ? [
        { title: 'Numéro', key: 'numero' },
        { title: 'Taille', key: 'taille' },
        { title: 'Remarque', key: 'remarque' },
        { title: 'Ajouté', key: 'created_at', type: 'date' },
        { title: 'Actions', key: 'id', slot: 'actions' },
      ]
    : [{ title: 'Quantité', key: 'quantite' }]),
]);

const { showModal } = useModalStore();
const infoMateriel = (materiel) =>
  //TODO: Gérer le cas affichageIndividuel
  showModal({
    component: 'ModalArticleInfo',
    data: materiel,
    size: 1,
  });

const editMateriel = (materiel) =>
  showModal({
    component: 'ModalArticle',
    data: materiel,
    callback: loadArticles,
  });

const attribuerMateriel = (materiel) =>
  showModal({
    component: 'ModalAttributionUnique',
    data: materiel,
    callback: loadArticles,
  });

const ajouter = () =>
  showModal({
    component: 'ModalAjoutArticleMultiple',
    callback: loadArticles,
    data: { emplacementId: id },
    size: 2,
  });

const { confirm } = useConfirmation();
const supprimer = (article) =>
  confirm(
    'Voulez-vous vraiment supprimer cet article ?',
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(loadArticles);
</script>

<template>
  <base-card>
    <template #title>Pièces ({{ articles.length }})</template>
    <template #header>
      <div
        class="btn-group"
        role="group"
        aria-label="Basic radio toggle button group"
      >
        <input
          type="radio"
          class="btn-sm btn-check"
          name="groupingBy"
          id="individuel"
          autocomplete="off"
          v-model="affichageIndividuel"
          :value="true"
          checked
        />
        <label class="btn btn-sm btn-outline-primary" for="individuel"
          >Individuel</label
        >
        <input
          type="radio"
          class="btn-sm btn-check"
          name="groupingBy"
          id="par-type"
          v-model="affichageIndividuel"
          :value="false"
          autocomplete="off"
        />
        <label class="btn btn-sm btn-outline-primary" for="par-type"
          >Par type</label
        >
      </div>
      <button
        v-if="hasEditPermission"
        title="Ajouter"
        class="btn btn-sm btn-primary"
        @click="ajouter"
      >
        <font-awesome-icon :icon="['far', 'plus-square']" />
      </button>
    </template>
    <template #body-table>
      <base-table
        :loading="loading"
        :grouped-data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
      >
        <template #groupeHeader="{ categorie_id }">
          <tag-couleur
            v-for="categorie in linearCategories(categorie_id)"
            :key="categorie.id"
            :couleur="indexedCouleurs[categorie.couleur_id]"
          >
            {{ categorie.designation }}
          </tag-couleur>
        </template>

        <template #type="{ rowData }">
          {{ rowData.type.designation }}
        </template>
        <template #actions="{ rowData }">
          <button
            title="Info"
            class="btn btn-outline-secondary border-0"
            @click="infoMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'info-circle']" />
          </button>
          <button
            v-if="affichageIndividuel && hasEditPermission"
            title="Modifier"
            class="btn btn-outline-secondary border-0"
            @click="editMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="
              affichageIndividuel &&
              hasEditPermission &&
              rowData.type.est_attribuable &&
              rowData.sapeur_id !== null
            "
            title="Retour"
            class="btn btn-outline-primary border-0"
            @click="retourMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
          </button>
          <button
            v-if="
              affichageIndividuel &&
              hasEditPermission &&
              rowData.type.est_attribuable &&
              rowData.sapeur_id === null
            "
            title="Attribuer"
            class="btn btn-outline-primary border-0"
            @click="attribuerMateriel(rowData)"
          >
            <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
          </button>
          <button
            v-if="affichageIndividuel && hasEditPermission"
            title="Supprimer"
            class="btn btn-outline-danger border-0"
            @click="supprimer(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>

<style></style>

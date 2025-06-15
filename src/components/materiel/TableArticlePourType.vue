<script setup>
import { computed } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import ArticleService from '../../services/materiel/ArticleService';
import TagCouleur from './TagCouleur.vue';
import { indexedData } from '../../tools';
import { useModalStore } from '../../stores/common/Modal.js';
import useHasPermission from '../../hooks/usePermission';
import permissions from '../../store/permissions';

const {
  loading,
  articles,
  materielType,
  avecEmplacement,
  emplacement,
  refresh,
} = defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
  hideDownload: {
    type: Boolean,
    default: () => false,
  },
  avecEmplacement: {
    type: Boolean,
    default: () => true,
  },
  emplacement: {
    type: Object,
    default: () => {},
  },
  articles: {
    type: Array,
    required: true,
  },
  materielType: {
    type: Object,
    required: true,
  },
  refresh: {
    type: Function,
    required: true,
  },
});

const couleurStore = useCouleurStore();
const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const colonnes = computed(() => [
  ...(materielType.est_numerote ? [{ title: 'Numéro', key: 'numero' }] : []),
  ...(avecEmplacement
    ? [{ title: 'Emplacement', key: 'emplacement_sort', slot: 'emplacement' }]
    : []),
  ...(avecEmplacement || emplacement?.est_compartimentable // TODO: Check si un emplacement est compartimentable pour remplacer le test est_compartimentable
    ? [{ title: 'Compartiment', key: 'compartiment' }]
    : []),
  ...(materielType.type === 3
    ? [
        { title: 'Désignation', key: 'designation' },
        { title: 'Immatriculation', key: 'immatriculation' },
        { title: 'Chassis', key: 'chassis' },
      ]
    : []),
  ...(materielType.est_taillee ? [{ title: 'Taille', key: 'taille' }] : []),
  ...(materielType.est_lavable
    ? [{ title: 'Lavages', key: 'nbLavages', slot: 'lavages' }]
    : []),
  { title: 'Remarque', key: 'remarque' },
  { title: 'Ajouté', key: 'created_at', type: 'date' },
  // { title: 'Inventaire', key: 'inventaire' },
  // { title: 'Maintenance', key: 'maintenance' },
  { title: 'Actions', key: 'id', slot: 'actions' },
]);

const { showModal, confirm } = useModalStore();

const infoMateriel = (materiel) =>
  showModal({
    component: 'ModalArticleInfo',
    data: materiel,
    size: 1,
  });

const editMateriel = (materiel) =>
  showModal({
    component: 'ModalArticle',
    data: materiel,
    callback: refresh,
  });

const retourMateriel = (materiel) =>
  showModal({
    component: 'ModalRetourUnique',
    data: materiel,
    callback: refresh,
  });

const attribuerMateriel = (materiel) =>
  showModal({
    component: 'ModalAttributionUnique',
    data: materiel,
    callback: refresh,
  });

const supprimer = (article) =>
  confirm(
    'Voulez-vous vraiment supprimer cet article ?',
    "Attention, la suppression d'un article est irréversible ! Toutes les données relatives à celui-ci seront supprimées définitivement.",
  )
    .then(() => ArticleService.supprimerArticles([article.id]))
    .then(refresh);
</script>

<template>
  <base-table
    :loading="loading"
    :data="articles"
    no-data="Aucune pièce"
    :fields="colonnes"
    :selectable="true"
    :hideDownload="hideDownload"
  >
    <template #emplacement="{ rowData }">
      <div v-if="rowData.sapeur_id" class="badge bg-primary">
        {{ rowData.sapeur }}
      </div>
      <div v-else>
        <tag-couleur
          v-for="e in rowData.emplacements"
          :key="e.id"
          :couleur="indexedCouleurs[e.couleur_id]"
          >{{ e.designation }}</tag-couleur
        >
      </div>
    </template>

    <template #lavages="{ rowData }">
      <div
        class="badge"
        :class="{
          'bg-danger': rowData.lavages.length >= 10,
          'bg-secondary': rowData.lavages.length < 10,
        }"
      >
        {{ rowData.lavages.length }}
      </div>
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
        v-if="hasEditPermission"
        title="Modifier"
        class="btn btn-outline-secondary border-0"
        @click="editMateriel(rowData)"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
      <button
        v-if="
          hasEditPermission &&
          materielType.est_attribuable &&
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
          hasEditPermission &&
          materielType.est_attribuable &&
          rowData.sapeur_id === null
        "
        title="Attribuer"
        class="btn btn-outline-primary border-0"
        @click="attribuerMateriel(rowData)"
      >
        <font-awesome-icon :icon="['fas', 'person-circle-plus']" />
      </button>
      <button
        v-if="hasEditPermission"
        title="Supprimer"
        class="btn btn-outline-danger border-0"
        @click="supprimer(rowData)"
      >
        <font-awesome-icon :icon="['far', 'trash-alt']" />
      </button>
    </template>
  </base-table>
</template>

<style></style>

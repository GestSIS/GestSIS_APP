<script setup>
import { computed } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useMaterielTypeStore } from '../../stores/materiel/Type';

const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const typeStore = useMaterielTypeStore();
await typeStore.fetchMaterielTypes();

const type = computed(() =>
  typeStore.liste.find((t) => t.id === data.materiel_type_id),
);

const piecesColonnes = computed(() => [
  ...(type.value.est_numerote ? [{ title: 'Numéro', key: 'numero' }] : []),
  { title: 'Emplacement', key: 'emplacement', slot: 'emplacement' },
  { title: 'Compartiment', key: 'compartiment' },
  [
    ...(type.value.est_taillee ? [{ title: 'Taille', key: 'taille' }] : []),
    ...(type.value.est_lavable ? [{ title: 'Lavages', slot: 'lavages' }] : []),
    { title: 'Remarque', key: 'remarque' },
    { title: 'Ajouté', key: 'created_at', type: 'date' },
    { title: 'Actions', key: 'id', slot: 'actions' },
  ],
]);

const { closeModal } = useModalStore();
</script>

<template>
  <div class="overflow-visible">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Articles</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body overflow-visible">
      <base-table
        :loading="loading"
        :data="computedData"
        no-data="Aucune pièce"
        :fields="piecesColonnes"
        :selectable="true"
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
              affichageIndividuel &&
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
              affichageIndividuel &&
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

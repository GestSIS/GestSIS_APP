<script setup>
import { computed } from 'vue';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const emplacementStore = useEmplacementStore();
const materielTypeStore = useMaterielTypeStore();

await Promise.all([
  emplacementStore.fetchEmplacements(),
  materielTypeStore.fetchMatPersoTypes(),
]);

const emplacements = computed(() => emplacementStore.liste);
const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id))
);

const formatEmptyString = (str) => (str === '' ? '-' : str);

// Partie pièces
const piecesColonnes = [
  { title: 'Emplacement', key: 'todo' },
  { title: 'Compartiment', key: 'todo' },
  { title: 'Inventaire', key: 'todo' },
  { title: 'Maintenance', key: 'todo' },
  { title: 'Remarque', key: 'todo' },
  { title: 'Ajouté', key: 'todo' },
];
const pieces = [];
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card mb-2">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="m-0">Description du matériel</h5>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="editMateriel(rowData.id)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-3">Nom</div>
            <div class="col-9">{{ materielType.designation }}</div>
          </div>
          <div class="row">
            <div class="col-3">Prix</div>
            <div class="col-9">{{ materielType.prix }}</div>
          </div>
          <div class="row">
            <div class="col-3">Fournisseur</div>
            <div class="col-9">
              {{ formatEmptyString(materielType.fournisseur) }}
            </div>
          </div>
          <div class="row">
            <div class="col-3">Réparateur</div>
            <div class="col-9">
              {{ formatEmptyString(materielType.reparateur) }}
            </div>
          </div>
          <div class="row">
            <div class="col-3">
              Préfixe
              <font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Préfixe pour l\'étiquettage individuel',
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </div>
            <div class="col-9">
              <span v-if="materielType.est_numerote">{{
                materielType.prefixe
              }}</span>
              <span v-else>(Pas d'étiquettage individuel)</span>
            </div>
          </div>
          <div class="row">
            <div class="col-3">Remarque</div>
            <div class="col-9">
              {{ formatEmptyString(materielType.remarque) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card mb-2">
        <div class="card-header">
          <span>Pièces (TODO)</span>
        </div>
        <base-table no-data="Aucune pièce" :fields="piecesColonnes" />
      </div>
    </div>
    <div class="col-12">
      <div class="card mb-2">
        <div class="card-header">TODO: Contrôle et maintenances</div>
      </div>
    </div>
  </div>
</template>

<style></style>

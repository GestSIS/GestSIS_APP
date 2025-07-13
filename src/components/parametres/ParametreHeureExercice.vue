<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject } from 'vue';
const store = useStore();

const loadFonctions = store.dispatch('fetchFonctions');
const loadComptes = store.dispatch('fetchComptes');
const loadUnites = store.dispatch('fetchUnites');
await store.dispatch('fetchHeuresExercice');

const fields = [
  { title: 'Désignation', key: 'designation' },
  { title: 'Montant', key: 'montant' },
  { title: 'Unité', key: 'unite' },
  { title: 'Compte', key: 'compte' },
  { title: 'Type', key: 'typeLabel' },
  { title: 'Catégorie comptable', key: 'categorie' },
  { title: 'Actions', slot: 'actions' },
];

const heureTypes = computed(() =>
  store.state.heureExercice.liste
    .map((h) => ({
      ...h,
      unite: store.state.unite.liste.find((e) => e.id == h.type_unite_id)
        ?.unite,
      compte: store.state.compte.liste.find((e) => e.id == h.compte_id)?.label,
      categorie: store.state.ecritureCategorie.liste.find(
        (e) => e.id == h.ecriture_categorie_id,
      )?.designation,
      typeLabel: {
        0: 'Autre',
        1: 'Solde',
        2: 'Indemnité',
        3: 'Frais forfaitaire',
        4: 'Frais effectif',
        5: 'Charges AVS/AC',
      }[h.type ?? 0],
    }))
    .sort((a, b) => a.tri - b.tri),
);

const awn = inject('awn');
const { showModal } = useModalStore();
const ajoutHeure = () =>
  showModal({
    component: 'ModalHeureExercice',
    data: {},
  });
const updateHeureType = (heure) =>
  showModal({
    component: 'ModalHeureExercice',
    data: { ...heure },
  });
const deleteHeureType = (heure) =>
  store
    .dispatch('removeExerciceHeure', heure.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Heures additionnelles pour exercice</h3>
      <button type="button" class="btn btn-primary" @click="ajoutHeure">
        Ajouter une heure
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="heureTypes"
        :fields="fields"
        no-data="Aucun heure additionelle"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateHeureType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteHeureType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

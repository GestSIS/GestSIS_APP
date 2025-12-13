<script setup>
import { computed, inject } from 'vue';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useModalStore } from '../../stores/common/Modal.js';

const compteStore = useCompteStore();
const imputationStore = useImputationStore();
const fonctionStore = useFonctionStore();
const uniteStore = useUniteStore();

const loadIndemnites = imputationStore.fetchFraisIndemnitesTypes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();

await Promise.all([loadIndemnites, loadFonctions, loadComptes, loadUnites]);

const fields = [
  { title: 'Numéro', key: 'numero' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Produit / Charge', key: 'typeLabel' },
  { title: 'Actions', slot: 'actions' },
];
const listeCompte = computed(() =>
  compteStore.liste
    .map((c) => ({ ...c, typeLabel: c.produit ? 'Produit' : 'Charge' }))
    .sort((a, b) => a.numero.localeCompare(b.numero)),
);

const { showModal } = useModalStore();
const awn = inject('awn');
const ajoutCompte = () => showModal({ component: 'ModalCompte', data: {} });
const updateCompte = (compte) =>
  showModal({ component: 'ModalCompte', data: { ...compte } });
const deleteCompte = (compteId) =>
  compteStore
    .removeCompte(compteId)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Comptes</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCompte">
        Ajouter un compte
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeCompte"
        :fields="fields"
        no-data="Aucun compte"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateCompte(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteCompte(rowData?.id)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

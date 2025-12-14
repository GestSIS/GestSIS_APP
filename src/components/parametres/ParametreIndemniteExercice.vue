<script setup>
import { computed } from 'vue';
import { useImputationStore } from '../../stores/comptabilite/Imputation.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useModalStore } from '../../stores/common/Modal.js';
import GenericDetailsRow from '../table/GenericDetailsRow.vue';

const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const fonctionStore = useFonctionStore();
const uniteStore = useUniteStore();

const loadIndemnites = imputationStore.fetchFraisIndemnitesTypes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();

await Promise.all([loadIndemnites, loadFonctions, loadComptes, loadUnites]);

const fields = [
  { title: 'Désignation', key: 'designation' },
  { title: 'Unité', key: 'unite' },
  { title: 'Par fonction', key: 'par_fonction', type: Boolean },
  { title: 'Catégorie comptable', key: 'categorie' },
  { title: 'Actions', slot: 'actions' },
];
const detailRowOptions = {
  fields: [
    { title: 'Fonction', key: 'fonction' },
    {
      title: 'Type',
      key: 'type',
      formatter: (type) => {
        const mapping = {
          0: 'Autre',
          1: 'Solde',
          2: 'Indemnité',
          3: 'Frais forfaitaire',
          4: 'Frais effectif',
          5: 'Charges AVS/AC',
        };
        return mapping[type] || '';
      },
    },
    { title: 'Tarif', key: 'tarif' },
    { title: 'Compte', key: 'compte' },
  ],
  noData: 'Aucune indemnité',
};

const computedIndemnites = computed(() =>
  imputationStore.fraisIndemnites.exercices
    .sort((a, b) => a.tri - b.tri)
    .map((e) => ({
      ...e,
      getData: () =>
        Promise.resolve(
          e.fonctions
            .map((e) => ({
              ...e,
              compte: compteStore.liste.find((c) => c.id == e.compte_id)
                ?.designation,
              fonction:
                fonctionStore.liste.find((c) => c.id == e.fonction_id)?.nom ??
                '-',
              fonction_tri:
                fonctionStore.liste.find((c) => c.id == e.fonction_id)?.tri ??
                -10,
            }))
            .sort((e1, e2) => e1.fonction_tri < e2.fonction_tri),
        ),
      categorie: ecritureCategorieStore.liste.find(
        (c) => c.id == e.ecriture_categorie_id,
      )?.designation,
      unite: uniteStore.liste.find((u) => u.id == e.type_unite_id)?.unite,
    })),
);

const { confirm, showModal } = useModalStore();
const ajoutIndemnite = () =>
  showModal({
    component: 'ModalIndemniteExercice',
    data: {},
    size: 2,
  });
const updateIndemnite = (indemnite) =>
  showModal({
    component: 'ModalIndemniteExercice',
    data: { ...indemnite },
    size: 2,
  });
const removeIndemnite = (indemnite) =>
  confirm(
    'Voulez-vous vraiment supprimer cette indemnité ?',
    "Attention, la suppression d'une indemnité est irréversible ! Toutes les données de cette indemnité seront perdues !",
  ).then(() => imputationStore.removeIndemniteExercice(indemnite.id));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Imputation exercice &amp; séance</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnite
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="computedIndemnites"
        :fields="fields"
        no-data="Aucune indemnité"
        :detail-row-column="true"
      >
        <template #detail-row="{ rowData }">
          <generic-details-row
            :options="detailRowOptions"
            :row-data="rowData"
          />
        </template>
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateIndemnite(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="removeIndemnite(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

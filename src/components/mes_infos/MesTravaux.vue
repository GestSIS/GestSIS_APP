<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useTravailTypeStore } from '../../stores/travail/TravailType.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import permissions from '../../store/permissions';
import { useModalStore } from '../../stores/common/Modal.js';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import useHasPermission from '../../hooks/usePermission';

const uniteStore = useUniteStore();
const travailTypeStore = useTravailTypeStore();
const sapeurStore = useSapeurStore();
const infosStore = useMesInfosStore();
const exerciceComptableStore = useExerciceComptableStore();

await exerciceComptableStore.fetchExercicesComptables();
await Promise.all([
  travailTypeStore.fetchTravailTypes(),
  uniteStore.fetchUnites(),
]);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await infosStore.fetchMesTravaux(exerciceComptableStore.activeId);
  loading.value = false;
});

const travaux = computed(() =>
  infosStore.travaux.map((t) => ({
    ...t,
    travail_type: travailTypeStore.liste.find((e) => e.id == t.travail_type_id)
      ?.designation,
    auteur: sapeurStore.liste.find((s) => s.id == t.auteur_id)?.nom_prenom,
    unite: uniteStore.liste.find(
      (u) =>
        u.id ==
        travailTypeStore.liste.find((e) => e.id == t.travail_type_id)
          ?.type_unite_id,
    )?.unite,
  })),
);

const hasSaisiePermission = useHasPermission([
  permissions.FICHE_TRAVAIL.SAISIE_PERSO,
  permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
]);

const { showModal } = useModalStore();
const addTravail = () =>
  showModal({
    component: 'ModalTravail',
    callback: () => infosStore.fetchMesTravaux(exerciceComptableStore.activeId),
  });

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Travail', key: 'travail_type' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Quantité', key: 'quantite' },
  { title: 'Unité', key: 'unite' },
  {
    title: 'Statut',
    key: 'statut',
    formatter(statut) {
      return {
        [-1]: 'Refusé',
        0: 'En attente',
        1: 'Accepté',
        2: 'Imputé',
      }[statut];
    },
  },
  { title: 'Justification', key: 'justification' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Ma fiche de travail</h3>
      <button
        v-if="hasSaisiePermission"
        type="button"
        class="btn btn-primary"
        @click="addTravail"
      >
        Saisir une fiche de travail
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :loading="loading"
        :fields="fields"
        :data="travaux"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun travail pour le moment"
      />
    </div>
  </div>
</template>

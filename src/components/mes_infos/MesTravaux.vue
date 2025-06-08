<script setup>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';
import permissions from '../../store/permissions';
import { useModalStore } from '../../stores/common/Modal.js';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos.js';

const store = useStore();
const infosStore = useMesInfosStore();

await store.dispatch('fetchExercicesComptables');
await Promise.all([
  infosStore.fetchMesTravaux(store.state.exerciceComptable.activeId),
  store.dispatch('fetchTravailTypes'),
  store.dispatch('fetchUnites'),
]);

const anneeComptableId = computed(() => store.state.exerciceComptable.activeId);
watch(anneeComptableId, () =>
  infosStore.fetchMesInterventions(anneeComptableId.value),
);

const travaux = computed(() =>
  infosStore.travaux.map((t) => ({
    ...t,
    travail_type: store.state.travailType.liste.find(
      (e) => e.id == t.travail_type_id,
    )?.designation,
    auteur: store.state.sapeur.liste.find((s) => s.id == t.auteur_id)
      ?.nom_prenom,
    unite: store.state.unite.liste.find(
      (u) =>
        u.id ==
        store.state.travailType.liste.find((e) => e.id == t.travail_type_id)
          ?.type_unite_id,
    )?.unite,
  })),
);

const hasSaisiePermission = computed(
  () =>
    store.state.auth.admin ||
    [
      permissions.FICHE_TRAVAIL.SAISIE_PERSO,
      permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
    ].some((p) => state.auth.sis.permissions.includes(p)),
);

const { showModal } = useModalStore();
const addTravail = () =>
  showModal({
    component: 'ModalTravail',
    callback: () => infosStore.fetchMesTravaux(anneeComptableId.value),
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
        :fields="fields"
        :data="travaux"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun travail pour le moment"
      />
    </div>
  </div>
</template>

<style scoped></style>

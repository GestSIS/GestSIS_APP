<script setup>
import { computed, watchEffect } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import { useStore } from 'vuex';
import { ref } from 'vue';

const store = useStore();
const infosStore = useMesInfosStore();

await Promise.all([
  store.dispatch('fetchExercicesComptables'),
  store.dispatch('fetchLocalites'),
  store.dispatch('fetchTypeInterventions'),
]);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await infosStore.fetchMesInterventions(
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const interventions = computed(() =>
  infosStore.interventions
    .map((i) => ({
      ...i,
      inter_debut: i.date_debut + ' ' + i.heure_debut,
      inter_fin: i.date_fin + ' ' + i.heure_fin,
      duree: Math.abs(new Date(i.debut) - new Date(i.fin)) / 36e5,
      localite: store.state.localite.liste.find((l) => l.id == i.localite_id)
        ?.designation,
      type: store.state.typeIntervention.liste.find(
        (c) => c.id == i.type_intervention_id,
      )?.designation,
    }))
    .sort((i1, i2) => i1.debut.localeCompare(i2.debut)),
);

const computedInterventions = computed(() => {
  const inter = {};
  interventions.value.forEach((i) => {
    if (!inter[i.intervention_id]) {
      inter[i.intervention_id] = { ...i, presences: [i] };
    } else {
      inter[i.intervention_id].presences.push(i);
    }
  });
  return Object.values(inter);
});

const fields = [
  { title: 'Date', key: 'inter_debut', type: 'datetime' },
  { title: 'Type', key: 'type' },
  { title: 'Localite', key: 'localite' },
  { title: 'Lieu', key: 'lieu' },
  { title: 'Objet', key: 'objet' },
];
const detailRowFields = [
  {
    title: 'Début',
    key: 'debut',
    type: 'datetime',
    columnClass: 'col-2',
  },
  { title: 'Fin', key: 'fin', type: 'datetime', columnClass: 'col-2' },
  { title: 'Durée [heure]', key: 'duree', columnClass: 'col-2' },
  {
    title: 'Piquet',
    key: 'piquet',
    type: Boolean,
    titleClass: 'text-center',
    columnClass: 'text-center col-2',
  },
  {}, // Pour que la table soit compressée, ne pas supprimer
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes interventions</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :loading="loading"
        :fields="fields"
        :data="computedInterventions"
        :selectable="true"
        :hide-download="true"
        :detail-row-column="true"
        no-data="Aucune intervention pour le moment"
      >
        <template #detail-row="{ rowData }">
          <base-table
            :fields="detailRowFields"
            :data="rowData.presences"
            :hide-download="true"
            no-data="Aucune présence"
          />
        </template>
      </base-table>
    </div>
  </div>
</template>

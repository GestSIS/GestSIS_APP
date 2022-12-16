<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes décomptes</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="paiements"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun décompte pour le moment"
      >
        <template #actions="{ rowData }">
          <button
            class="btn btn-outline-primary border-0"
            @click="downloadDecompte(rowData)"
          >
            <font-awesome-icon :icon="['far', 'file-pdf']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import MesInfosService from '../../services/MesInfosService';
import store from '@/store/index';

async function loadData(routeTo, next) {
  let loadMesDecomptes = store.dispatch('fetchMesDecomptes');

  Promise.all([loadMesDecomptes]).then(() => {
    next();
  });
}

export default {
  name: 'MesDecomptes',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Date', key: 'date', type: 'date' },
        { title: 'Décompte', key: 'decompte' },
        { title: 'Solde', key: 'solde' },
        { title: 'Indemnité', key: 'indemnite' },
        { title: 'Frais forfaitaires', key: 'frais_forfaitaire' },
        { title: 'Frais effectifs', key: 'frais_effectif' },
        { title: 'Retenue AVS/AC', key: 'avs_ac' },
        { title: 'Autre', key: 'autre' },
        { title: 'Total', key: 'total' },
        { title: 'Actions', slot: 'actions', key: 'id' },
      ],
    };
  },
  computed: {
    ...mapState({
      anneeComptableId: (state) => state.exerciceComptable.activeId,
      paiements: (state) =>
        state.mesInfos.paiements
          .map((e) => ({
            ...e,
          }))
          .sort((e1, e2) => e1.date.localeCompare(e2.date)),
    }),
  },
  watch: {
    anneeComptableId() {
      this.$store.dispatch('fetchMesDecomptes');
    },
  },
  methods: {
    downloadDecompte(paiement) {
      const filename = `${paiement.date}_decompte.pdf`;
      MesInfosService.printMonDecompte(paiement.decompte_id, filename);
    },
  },
};
</script>

<style scoped></style>

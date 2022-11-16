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
        <template #actions="props">
          <button
            class="btn btn-outline-primary border-0"
            @click="downloadDecompte(props.rowData)"
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

export default {
  name: 'MesDecomptes',
  data() {
    return {
      fields: [
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
          type: 'date',
        },
        {
          title: 'Décompte',
          key: 'decompte',
          sortKey: 'decompte',
        },
        {
          title: 'Solde',
          key: 'solde',
          sortKey: 'solde',
        },
        {
          title: 'Indemnité',
          key: 'indemnite',
          sortKey: 'indemnite',
        },
        {
          title: 'Frais forfaitaires',
          key: 'frais_forfaitaire',
          sortKey: 'frais_forfaitaire',
        },
        {
          title: 'Frais effectifs',
          key: 'frais_effectif',
          sortKey: 'frais_effectif',
        },
        {
          title: 'Retenue AVS/AC',
          key: 'avs_ac',
          sortKey: 'avs_ac',
        },
        {
          title: 'Autre',
          key: 'autre',
          sortKey: 'autre',
        },
        {
          title: 'Total',
          key: 'total',
          sortKey: 'total',
        },
        {
          title: 'Actions',
          slot: 'actions',
          key: 'id',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      paiements: (state) =>
        state.mesInfos.paiements
          .map((e) => ({
            ...e,
          }))
          .sort((e1, e2) => e1.date.localeCompare(e2.date)),
    }),
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

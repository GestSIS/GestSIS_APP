<template>
  <div class="card card-primary card-outline mb-5 table-responsive">
    <div class="card-header d-flex justify-content-between">
      <h5>Matériel a récupérer</h5>
    </div>
    <base-table
      :selectable="true"
      select-key="id"
      row-selected-class="table-primary"
      :fields="fields"
      no-data="Aucun matériel personnel à récupérer"
      :data="computedData"
    >
      <!-- @selected="selectSapeur" -->
      <template #actions>
        <button class="btn btn-outline-primary border-0" disabled>
          <font-awesome-icon :icon="['far', 'edit']" />
        </button>
      </template>
    </base-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BaseTable from '@/components/table/BaseTable.vue';
// import permissions from '@/store/permissions.js';

export default {
  name: 'MaterielPersonnelARecuperer',
  components: {
    BaseTable,
  },
  data() {
    return {
      errors: {},
      fields: [
        {
          title: 'Sapeur',
          key: 'nom_prenom',
          sortKey: 'nom_prenom',
        },
        {
          title: 'Nb matériel',
          key: 'nb',
          sortKey: 'nb',
        },
        {
          title: 'Fin de service',
          key: 'fin',
          sortKey: 'fin',
        },
        {
          title: 'Fin de service',
          slot: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      aRecuperer: (state) => state.matPersoMateriel.aRecuperer,
      sapeurs: (state) => state.sapeur.liste,
    }),
    computedData() {
      return Object.values(
        this.aRecuperer.reduce((acc, m) => {
          let reccord = acc[m.sapeur_id] || { sapeur_id: m.sapeur_id, nb: 0 };
          reccord.nb += 1;
          acc[m.sapeur_id] = reccord;
          return acc;
        }, {})
      ).map((m) => {
        const s = this.sapeurs.find((s) => s.id == m.sapeur_id);
        return { ...m, nom_prenom: s?.nom + ' ' + s?.prenom, fin: 'TODO' };
      });
      // TODO: Ajouter fin de service
    },
  },
  methods: {
    async save() {
      //TODO
    },
  },
};
</script>

<style scoped></style>

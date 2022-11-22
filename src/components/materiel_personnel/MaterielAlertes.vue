<template>
  <div class="card card-primary card-outline mb-2 table-responsive">
    <div class="card-header d-flex justify-content-between">
      <h5>Alertes</h5>
    </div>
    <div v-if="loading" class="card-body d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>
    <base-table
      :selectable="true"
      :fields="fields"
      no-data="Aucune alerte"
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

// import permissions from '@/store/permissions.js';

export default {
  name: 'MaterielPersonnelARecuperer',
  data() {
    return {
      errors: {},
      fields: [
        {
          title: 'Titre',
          key: 'titre',
          sortKey: 'titre',
        },
        {
          title: 'Materiel type',
          key: 'nb',
          sortKey: 'nb',
        },
        {
          title: 'Numéro',
          key: 'numero',
          sortKey: 'numero',
        },
        {
          title: 'Sapeur',
          key: 'nom_prenom',
          sortKey: 'nom_prenom',
        },
        {
          title: 'Actions',
          slot: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      alertes: (state) => state.matPersoAlerte.liste,
      sapeurs: (state) => state.sapeur.liste,
    }),
    computedData() {
      return this.alertes;
      // .map((a) => {
      //   const s = this.sapeurs.find((s) => s.id == a.sapeur_id);
      //   return { ...a, nom_prenom: s?.nom + ' ' + s?.prenom, fin: 'TODO' };
      // });
      // TODO: Ajouter metadonnées
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

<template>
  <div class="card card-primary card-outline mb-2">
    <div class="card-header d-flex justify-content-between">
      <h5>Alertes</h5>
    </div>
    <div class="card-body table-responsive p-0">
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
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MaterielAlertes',
  data() {
    return {
      errors: {},
      fields: [
        {
          title: 'Titre',
          key: 'titre',
        },
        {
          title: 'Matériel type',
          key: 'type',
        },
        {
          title: 'Numéro',
          key: 'numero',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
        },
        // {
        //   title: 'Actions',
        //   slot: 'actions',
        // },
      ],
    };
  },
  computed: {
    ...mapState({
      alertes: (state) => state.matPersoAlerte.liste,
      sapeurs: (state) => state.sapeur.liste,
      types: (state) => state.matPersoType.liste,
    }),
    computedData() {
      const sapeurFormat = (sapeurId) =>
        this.sapeurs.find((s) => s.id == sapeurId)?.nom_prenom;

      return this.alertes.map((a) => ({
        ...a,
        numero: a.materiel_nominal?.numero,
        type: this.types.find(
          (t) => t.id == a.materiel_nominal?.materiel?.materiel_type_id
        )?.designation,
        sapeur: sapeurFormat(
          a.materiel_nominal?.materiel?.retour == null
            ? a.materiel_nominal?.materiel?.sapeur_id
            : null
        ),
      }));
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

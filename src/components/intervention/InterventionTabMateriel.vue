<template>
  <div class="col-xs-12 col-lg-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Matériel consommable et en prêt</h3>
        <button
          v-if="hasEditPermission"
          type="button"
          class="btn btn-primary"
          @click="newMateriel"
        >
          Ajouter du matériel
        </button>
      </div>
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="activeMateriels"
          :selectable="true"
          no-data="Aucun matériel consommable ou en prêt"
        >
          <template #actions="{ rowData }">
            <div class="d-flex justify-content-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="editMateriel(rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="supprimerMateriel(rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </div>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'InterventionTabMateriel',
  data() {
    return {
      fields: [
        { title: 'Matériel', key: 'designation' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      materiels: (state) => state.materiel.liste,
      activeMateriels: (state) =>
        state.intervention.active.materiels.map((m) => ({
          ...m,
          designation: state.materiel.liste?.find(
            (mat) => mat.id == m.materiel_id
          )?.designation,
        })),
      activeInterventionId: (state) => state.intervention.active.id,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
  },
  mounted() {
    if (this.materiels.length === 0) {
      this.$store.dispatch('fetchMateriels').then(() => {
        this.$store.dispatch(
          'fetchInterventionMateriels',
          this.activeInterventionId
        );
      });
    } else if (this.activeMateriels.length === 0) {
      this.$store.dispatch(
        'fetchInterventionMateriels',
        this.activeInterventionId
      );
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newMateriel() {
      this.$store.dispatch('resetActiveMateriel');
      this.SHOW_MODAL('ModalInterventionMateriel');
    },
    editMateriel(grade_id) {
      this.$store.dispatch(
        'updateActiveMateriel',
        Object.assign(
          {},
          this.activeMateriels.find((m) => m.id == grade_id)
        )
      );
      this.SHOW_MODAL('ModalInterventionMateriel');
    },
    supprimerMateriel(grade_id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette absence ?',
          question:
            "Attention, la suppression d'un absence est irréversible ! Toutes les données de cette absence seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeAbsence', id);
          }
        },
      });
      this.$store.dispatch('removeInterventionMateriel', grade_id);
    },
  },
};
</script>

<style scoped></style>

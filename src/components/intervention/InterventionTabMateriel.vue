<template>
  <div class="col-xs-12 col-lg-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <!-- /.card-header -->
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Matériel consommable et en prêt</h3>
        <button
          type="button"
          class="btn btn-primary"
          @click="newMateriel"
          v-if="hasEditPermission"
        >Ajouter du matériel</button>
      </div>
      <div class="card-body">
        <table id="int-materiel" class="table table-sm" cellspacing="0" width="100%">
          <thead>
            <tr>
              <th>Matériel</th>
              <th>Quantité</th>
              <th class="text-center" v-if="hasEditPermission">Actions</th>
            </tr>
          </thead>
          <tbody id="materiels">
            <tr v-if="activeMateriels.length <= 0">
              <td :colspan="hasEditPermission ? 3 : 2">Aucun matériel ajouté.</td>
            </tr>
            <tr v-for="m in activeMateriels" :key="m.id">
              <td>
                {{
                  materiels.find((mat) => mat.id == m.materiel_id).designation
                }}
              </td>
              <td>{{ m.quantite }}</td>
              <td v-if="hasEditPermission">
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="editMateriel(m.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerMateriel(m.id)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'InterventionTabMateriel',
  computed: {
    ...mapState({
      materiels: (state) => state.materiel.liste,
      activeMateriels: (state) => state.intervention.active.materiels,
      activeInterventionId: (state) => state.intervention.active.id,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) => state.auth.sis.permissions.includes(
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
      this.$store.dispatch('removeInterventionMateriel', grade_id);
    },
  },
};
</script>

<style scoped></style>

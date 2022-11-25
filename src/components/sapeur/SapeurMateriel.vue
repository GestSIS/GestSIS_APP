<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Matériel personnel</h3>
    </div>
    <!-- /.card-header -->
    <!-- form start -->
    <form role="form">
      <div class="card-body">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Matériel type</th>
              <th>Taille</th>
              <th>Numéro</th>
              <th>Quantité</th>
              <th>Attribution</th>
              <th>Retour</th>
              <th v-if="hasEditPermission" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="materiels.length <= 0">
              <td :colspan="hasEditPermission ? 5 : 4">
                Aucun matériel distribué
              </td>
            </tr>
            <tr v-for="m in materiels" :key="m.id">
              <td>
                {{ types.find((t) => t.id == m.materiel_type_id)?.designation }}
              </td>
              <td>{{ m.taille }}</td>
              <td>{{ m?.materiel?.quantite }}</td>
              <td>{{ m?.materiel?.numero }}</td>
              <td>
                {{
                  m?.attribution
                    ? new Date(m?.attribution).toLocaleDateString('fr-CH')
                    : ''
                }}
              </td>
              <td>
                {{
                  m?.retour
                    ? new Date(m?.retour).toLocaleDateString('fr-CH')
                    : ''
                }}
              </td>
              <td v-if="hasEditPermission">
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    disabled
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    v-if="materiels.length > 1"
                    type="button"
                    class="btn btn-outline-danger border-0"
                    disabled
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

// TODO: Fetch matériel type/categorie

export default {
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      types: (state) => state.matPersoType.liste,
      materiels: (state) => state.sapeur.active.materiels,
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.MATERIEL_PERSONNEL.MODIFICATION
        ),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurMateriels', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchMatPersoTypes');
    this.$store.dispatch('fetchSapeurMateriels', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
  },
};
</script>

<style></style>

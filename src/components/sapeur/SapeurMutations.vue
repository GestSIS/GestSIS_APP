<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Incorporation / Sortie</h3>
    </div>
    <!-- /.card-header -->
    <!-- form start -->
    <form role="form">
      <div class="card-body">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Incorporation</th>
              <th>Sortie</th>
              <th>Motif</th>
              <th>Localité</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="mutations.length <= 0">
              <td colspan="5">Aucune mutation</td>
            </tr>
            <tr v-for="m in mutations" :key="m.id">
              <td>{{ m.incorporation }}</td>
              <td>{{ m.sortie }}</td>
              <td>{{ m.motif }}</td>
              <td>
                {{
                  m.localite_id
                    ? localites.find((l) => l.id == m.localite_id).designation
                    : ''
                }}
              </td>
              <td>
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="editMutation(m.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="removeMutation(m.id)"
                    v-if="mutations.length > 1"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <button
          type="button"
          class="btn btn-outline-primary"
          @click="finService"
          v-if="finServiceButtonState"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />
          Fin de service
        </button>
        <button
          type="button"
          class="btn btn-outline-primary"
          @click="incorporation"
          v-else
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />
          Incorporation
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapState({
      localites: (state) => state.localite.liste,
      mutations: (state) => state.sapeur.active.mutations,
    }),
    finServiceButtonState() {
      return (
        this.mutations.length > 0 &&
        (this.mutations[this.mutations.length - 1].sortie || '') === ''
      );
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
    removeMutation(mutationId) {
      this.$store.dispatch('removeMutation', mutationId);
    },
    editMutation(mutationId) {
      this.$store.dispatch(
        'updateActiveMutation',
        Object.assign(
          {},
          this.mutations.find((m) => m.id == mutationId)
        )
      );
      this.SHOW_MODAL('ModalMutation');
    },
    finService() {
      this.$store.dispatch(
        'updateActiveMutation',
        Object.assign(
          { action: 'finService' },
          this.mutations.find((m) => !m.sortie)
        )
      );
      this.SHOW_MODAL('ModalMutation');
    },
    incorporation() {
      this.$store.dispatch('resetActiveMutation');
      this.SHOW_MODAL('ModalMutation');
    },
  },
};
</script>

<style></style>

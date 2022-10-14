<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Evénements type</h3>
      <button type="button" class="btn btn-primary" @click="ajoutEvent()">
        Ajouter un événement type
      </button>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Validable</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!types.length">
            <td colspan="4">Aucun événement type</td>
          </tr>
          <tr v-for="t in types" :key="t.id">
            <td>{{ t.nom }}</td>
            <td>{{ t.description }}</td>
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                :checked="t.validable"
                disabled
              />
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateEvent(t)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteEvent(t)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ParametreMatPersoEventType',
  computed: {
    ...mapState({
      types: (state) =>
        state.matPersoEventType.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutEvent() {
      this.SHOW_MODAL({ component: 'ModalMatPersoEventType', data: {} });
    },
    updateEvent(event) {
      this.SHOW_MODAL({
        component: 'ModalMatPersoEventType',
        data: { ...event },
      });
    },
    deleteEvent(event) {
      this.$store
        .dispatch('removeMatPersoEventType', event.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>

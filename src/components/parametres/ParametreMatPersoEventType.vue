<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Evénements type</h3>
      <button type="button" class="btn btn-primary" @click="ajoutEvent()">
        Ajouter un événement type
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="types" :fields="fields" no-data="Aucun événement type">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateEvent(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteEvent(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ParametreMatPersoEventType',
  data() {
    return {
      fields: [
        { title: 'Nom', key: 'nom' },
        { title: 'Description', key: 'description' },
        { title: 'Validable', key: 'validable', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
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

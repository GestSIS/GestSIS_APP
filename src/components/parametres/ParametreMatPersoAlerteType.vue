<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Alerte type</h3>
      <button type="button" class="btn btn-primary" @click="ajoutAlerte()">
        Ajouter une alerte type
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="types" :fields="fields" no-data="Aucune alerte type">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateAlerte(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteAlerte(rowData)"
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
  name: 'ParametreMatPersoAlerteType',
  data() {
    return {
      fields: [
        { title: 'Titre', key: 'titre' },
        { title: 'Description', key: 'description' },
        { title: 'Seuil de déclenchement', key: 'seuil_min' },
        { title: 'Dernier événement', key: 'dernier', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      types: (state) =>
        state.matPersoAlerteType.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutAlerte() {
      this.SHOW_MODAL({ component: 'ModalMatPersoAlerteType', data: {} });
    },
    updateAlerte(event) {
      this.SHOW_MODAL({
        component: 'ModalMatPersoAlerteType',
        data: { ...event },
      });
    },
    deleteAlerte(event) {
      this.$store
        .dispatch('removeMatPersoAlerteType', event.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>

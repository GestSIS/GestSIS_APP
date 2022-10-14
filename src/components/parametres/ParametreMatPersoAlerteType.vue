<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Alerte type</h3>
      <button type="button" class="btn btn-primary" @click="ajoutAlerte()">
        Ajouter une alerte type
      </button>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Seuil de déclenchement</th>
            <th>Dernier événement</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!types.length">
            <td colspan="5">Aucune alerte type</td>
          </tr>
          <tr v-for="t in types" :key="t.id">
            <td>{{ t.titre }}</td>
            <td>{{ t.description }}</td>
            <td>{{ t.seuil_min }}</td>
            <td>
              <input
                type="checkbox"
                class="form-check-input"
                :checked="t.dernier"
                disabled
              />
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateAlerte(t)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteAlerte(t)"
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
  name: 'ParametreMatPersoAlerteType',
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

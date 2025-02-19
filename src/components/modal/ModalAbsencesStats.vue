<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Absences ({{ data.absences.size }})
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <ul>
        <li v-for="sapeurId in data.absences ?? []" :key="sapeurId">
          {{ sapeurs.find((s) => s.id == sapeurId)?.nom_prenom }}
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalAbsencesStats',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'SHOW_MODAL']),
  },
};
</script>

<style scoped></style>

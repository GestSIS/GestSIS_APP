<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Convoquer par SMS</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-8">
          TODO: Sélection des sapeurs
        </div>
        <div class="col-4">
          <base-checkbox class="mb-3" label="Envoie différé" />
          <div class="mb-3">
            <label for="date">Date</label>
            <input type="datetime-local" v-model="activeAppel.date2" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date'] }" id="date" :min="min" :max="max" />
          </div>
          <div class="mb-3">
            <label for="origine">Origine</label>
            <input type="text" v-model="activeAppel.origine" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['origine'] }" id="origine" />
          </div>
          <div class="mb-3">
            <label for="commentaire">Message</label>
            <textarea maxlength="500" v-model="activeAppel.commentaire" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['commentaire'] }" id="commentaire"></textarea>
          </div>
          TODO: Ajout balance actuelle du crédit
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save()">{{
        activeAppel.id ? 'Modifier' : 'Ajouter'
      }}</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'ModalSms',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      params: {
        origin: "",
        differe: true,
        date: "",
        selectedSapeurs: []
      },
    };
  },
  computed: {
    ...mapState({
      //TODO: a implémenter
      sapeurs: (state) => state.telephone.liste,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
  },
  mounted() {
    if (this.listTelephones.length === 0) {
      this.$store.dispatch('fetchTelephones');
    }
    this.activeAppel = this.data.appel;

    this.min = DateTime.fromSQL(this.data.min).toISO();
    this.max = DateTime.fromSQL(this.data.max).toISO();

    this.activeAppel.date2 = DateTime.fromSQL(this.activeAppel.date)
      .toISO()
      .slice(0, 16);
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      //Format back dates to SQL Format
      this.activeAppel.date = DateTime.fromISO(this.activeAppel.date2).toFormat(
        this.format
      );

      this.$store
        .dispatch('addInterventionAppel', this.activeAppel)
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
          (this.errors = {
            ...errors,
            date: errors['appels.0.date'],
            nom: errors['appels.0.nom'],
            numero: errors['appels.0.numero'],
            commentaire: errors['appels.0.commentaire'],
          })
        );
    },
  },
};
</script>

<style scoped>
</style>

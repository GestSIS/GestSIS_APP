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
          <base-checkbox class="mb-3" label="Envoie différé" v-model="params.differe" />
          <div class="mb-3">
            <label for="date">Date</label>
            <input type="datetime-local" v-model="params.date" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date'] }" id="date" :min="min" :max="max" />
          </div>
          <!-- <div class="mb-3">
            <label for="origine">Origine</label>
            <input type="text" v-model="params.origine" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['origine'] }" id="origine" />
          </div> -->
          <div class="mb-3">
            <label for="commentaire">Message</label>
            <textarea maxlength="500" v-model="params.message" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['commentaire'] }" id="commentaire"></textarea>
          </div>
          <p>TODO: Ajout balance actuelle du crédit</p>
          <p>TODO: Ajout compteur nb characters restant</p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save()">Envoyer</button>
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
      errors: {},
      params: {
        origin: "GestSIS",
        differe: true,
        date: "",
        selectedSapeurs: [],
        message: "",
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
    // TODO: set date to exercice date
    this.params.date = "";
    // TODO: à compléter
    this.params.message = `Rappel\n` +
      `${"dim. 29.05.2022"} ${"20:00"} ${"Hangar"} à ${"Courgenay"} \n` +
      `${"Séance divers"} : ${"Séance avec Resp.VHC"} `
    // if (this.listTelephones.length === 0) {
    //   this.$store.dispatch('fetchTelephones');
    // }
    // this.max = DateTime.fromSQL(this.data.max).toISO().slice(0, 16);
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      // //Format back dates to SQL Format
      // this.activeAppel.date = DateTime.fromISO(this.activeAppel.date2).toFormat(
      //   this.format
      // );

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

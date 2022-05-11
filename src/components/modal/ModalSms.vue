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
            <label for="commentaire">Message ({{ 500 - params.message.length }})</label>
            <textarea maxlength="500" v-model="params.message" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['commentaire'] }" id="commentaire"></textarea>
          </div>
          <p>Crédit : <span>{{ loadingCredit ? 'chargement...' : credit }}</span></p>
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
      loadingCredit: true,
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
      credit: (state) => state.aspsmsParam.credit,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
    }),
  },
  mounted() {
    this.loadingCredit = true;
    this.$store.dispatch('fetchAspsmsCredit').then(() => this.loadingCredit = false).catch(() => {
      this.loadingCredit = false;
      console.log("ASPSMS non configuré");
    })

    const localite = this.localites.find(l => l.id == this.data.localite_id);
    const categorie = this.categories.find(l => l.id == this.data.exercice_categorie_id);
    this.params.date = this.data.date + " " + this.data.heure;

    this.params.message = `Rappel\n` +
      `${DateTime.fromSQL(this.data.date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)} ${this.data.heure.slice(0, 5)} ${this.data.lieu} à ${localite?.designation ?? ""} \n` +
      `${categorie?.designation} : ${this.data.communications}`
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

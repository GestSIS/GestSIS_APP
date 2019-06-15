<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter du appel</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="heure">Heure</label>
        <!--        <input-->
        <!--          type="datetime-local"-->
        <!--          v-model="activeAppel.date"-->
        <!--          class="form-control"-->
        <!--          :class="{ 'is-invalid': errors['date'] }"-->
        <!--          id="heure"-->
        <!--        />-->
        <datetime
          v-model="activeAppel.date2"
          :format="format"
          type="datetime"
          :input-class="{ 'form-control': true, 'is-invalid': errors['date'] }"
          id="heure"
          :min-datetime="min"
          :max-datetime="max"
        ></datetime>
      </div>
      <div class="form-group">
        <label for="correspondant">Correspondant</label>
        <input
          type="string"
          v-model="activeAppel.nom"
          class="form-control"
          :class="{ 'is-invalid': errors['debut'] }"
          id="correspondant"
        />
      </div>
      <div class="form-group">
        <label for="numero">Numéro</label>
        <input
          type="string"
          v-model="activeAppel.numero"
          class="form-control"
          :class="{ 'is-invalid': errors['debut'] }"
          id="numero"
        />
      </div>
      <div class="form-group">
        <label for="commentaire">Commentaire</label>
        <textarea
          v-model="activeAppel.commentaire"
          class="form-control"
          :class="{ 'is-invalid': errors['commentaire'] }"
          id="commentaire"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeAppel.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { DateTime } from 'luxon'

export default {
  name: 'ModalAppel',
  props: {
    data: {
      type: Object
    }
  },
  data() {
    return {
      errors: {},
      activeAppel: {},
      format: 'yyyy-MM-dd HH:mm',
      min: null,
      max: null
    }
  },
  computed: {
    ...mapState({
      listTelephones: state => state.telephone.liste,
      activeInterventionId: state => state.intervention.active.id
    })
  },
  mounted() {
    if (this.listTelephones.length === 0) {
      this.$store.dispatch('fetchTelephones')
    }
    this.activeAppel = this.data.appel

    this.min = DateTime.fromSQL(this.data.min).toISO()
    this.max = DateTime.fromSQL(this.data.max).toISO()

    this.activeAppel.date2 = DateTime.fromSQL(this.activeAppel.date).toISO()
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      //Format back dates to SQL Format
      this.activeAppel.date = DateTime.fromISO(this.activeAppel.date2).toFormat(
        this.format
      )

      if ((this.activeAppel.id || 0) === 0) {
        this.$store
          .dispatch('addAppel', this.activeAppel)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      } else {
        this.$store
          .dispatch('editAppel', this.activeAppel)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      }
    }
  }
}
</script>

<style scoped></style>

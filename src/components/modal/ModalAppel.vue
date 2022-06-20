<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeAppel.id ? 'Modifier' : 'Ajouter' }} un appel
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="heure">Heure</label>
        <input type="datetime-local" v-model="activeAppel.date2" class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }" id="heure" :min="min" :max="max" />
      </div>
      <div class="mb-3">
        <base-autocomplete v-model="activeAppel.nom" :items="listTelephones.map((t) => t.nom)" :error="!!errors['nom']"
          title="Correspondant" />
      </div>
      <div class="mb-3">
        <label for="numero">Numéro</label>
        <input type="text" v-model="activeAppel.numero" class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['numero'] }" id="numero" />
      </div>
      <div class="mb-3">
        <label for="commentaire">Commentaire</label>
        <textarea v-model="activeAppel.commentaire" class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['commentaire'] }" id="commentaire"></textarea>
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
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

import BaseAutocomplete from '@/components/base/BaseAutocomplete.vue';

export default {
  name: 'ModalAppel',
  components: {
    BaseAutocomplete,
  },
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeAppel: {},
      format: 'yyyy-MM-dd HH:mm',
      min: null,
      max: null,
    };
  },
  computed: {
    ...mapState({
      listTelephones: (state) => state.telephone.liste,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
    responsable() {
      return this.activeAppel.nom;
    },
  },
  watch: {
    responsable(value) {
      let result = this.listTelephones.filter(
        (t) => value.localeCompare(t.nom) === 0
      );
      if (result.length > 0) {
        this.activeAppel.numero = result[0].numero;
      }
    },
  },
  mounted() {
    if (this.listTelephones.length === 0) {
      this.$store.dispatch('fetchTelephones');
    }
    this.activeAppel = this.data.appel;

    this.min = DateTime.fromSQL(this.data.min)?.toISO();
    this.max = DateTime.fromSQL(this.data.max)?.toISO();

    this.activeAppel.date2 = DateTime.fromSQL(this.activeAppel.date)
      ?.toISO()
      ?.slice(0, 16);
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      //Format back dates to SQL Format
      this.activeAppel.date = DateTime.fromISO(this.activeAppel.date2).toFormat(
        this.format
      );

      if ((this.activeAppel.id || 0) === 0) {
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
      } else {
        this.$store
          .dispatch('editInterventionAppel', {
            ...this.activeAppel,
            date2: undefined,
          })
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
      }
    },
  },
};
</script>

<style scoped>
</style>

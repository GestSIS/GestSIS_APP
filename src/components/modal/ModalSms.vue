<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Convoquer par SMS</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6">
          <base-table :fields="fields" :data="computedSapeurs" />
        </div>
        <div class="col-6">
          <base-checkbox
            v-model="params.differe"
            class="mb-3"
            label="Envoie différé"
          />
          <div class="mb-3">
            <label for="date">Date</label>
            <input
              v-if="params.differe"
              id="date"
              v-model="params.date"
              type="datetime-local"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date'] }"
            />
          </div>
          <div class="mb-3">
            <label for="commentaire"
              >Message ({{ 500 - params.message.length }})</label
            >
            <textarea
              id="commentaire"
              v-model="params.message"
              maxlength="500"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['commentaire'] }"
              rows="6"
            ></textarea>
          </div>
          <p>
            Crédit : <span>{{ loadingCredit ? 'chargement...' : credit }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="send()">
        Envoyer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import AspsmsParamService from '../../services/AspsmsParamService';

export default {
  name: 'ModalSmsExercice',

  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      loadingSapeurs: true,
      loadingCredit: true,
      sapeurs: [],
      presences: [],
      params: {
        message: '',
        origin: 'GestSIS',
        differe: false,
        date: '',
        sapeurIds: [],
      },
      fields: [
        {
          title: 'Nom prénom',
          key: 'nom_prenom',
          titleClass: 'align-middle',
        },
        {
          title: 'Portable',
          key: 'portable',
          titleClass: 'align-middle',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      credit: (state) => state.aspsmsParam.credit,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
    }),
    computedSapeurs() {
      return this.sapeurs.map((s) => ({
        ...s,
        portable: s.telephones
          .filter((a) => a.telephone_type_id === 3)
          .sort((a, b) => a.priorite - b.priorite)
          .find(() => true)?.numero,
      }));
    },
  },
  mounted() {
    this.sapeurs = this.data;
    this.loadingCredit = true;
    this.$store
      .dispatch('fetchAspsmsCredit')
      .then(() => (this.loadingCredit = false))
      .catch(() => {
        this.loadingCredit = false;
      });
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async send() {
      const params = {
        ...this.params,
        message: this.params.message
          .replaceAll('‘', "'")
          .replaceAll('’', "'")
          .replaceAll('«', '"')
          .replaceAll('»', '"'),
        numeros: this.computedSapeurs.map((s) => s?.portable).filter((s) => s),
      };

      if (params.numeros.length == 0) {
        return this.$awn.alert('Aucun numéro disponible');
      }

      if (params.differe && new Date(params.date) < new Date()) {
        return this.$awn.alert('Date invalide');
      }

      AspsmsParamService.sendSms(params)
        .then(() => {
          this.errors = {};
          this.$store.dispatch('fetchAspsmsCredit');
          return this.$awn.success('Message envoyé avec succès');
        })
        .catch((errors) => {
          this.errors = { ...errors };
          return this.$awn.alert(
            errors?.message ?? "Erreur lors de l'envoie des SMS"
          );
        });
    },
  },
};
</script>

<style scoped></style>

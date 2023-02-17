<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">paramètres pour excuses</h3>
          <button type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="delai_excuse"
              >Délai pour excuse [Jour]<font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Nb jour disponible pour s\'excuser',
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
            /></label>
            <input
              id="delai_excuse"
              v-model="params.delai_excuse"
              type="number"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['delai_excuse'] }"
            />
          </div>
          <base-checkbox
            v-model="params.email_rappel"
            class="mb-3"
            label="Envoyer email si non excusé"
          />
          <div class="mb-3">
            <label for="texte_email_rappel"
              >Email rappel<font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Envoyer un email de rappel pour demande d\'excuse',
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
            /></label>
            <textarea
              id="texte_email_rappel"
              v-model="params.texte_email_rappel"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_ac'] }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadExcuseParams = store.dispatch('fetchExcuseParams');

  Promise.all([loadExcuseParams]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreExcuse',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      errors: {},
      params: {},
    };
  },
  computed: {
    ...mapState({
      excuseParams: (state) => state.excuseParam.params,
    }),
  },
  mounted() {
    this.params = this.excuseParams ? this.excuseParams : this.params;
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    async save() {
      this.$store
        .dispatch('updateExcuseParams', this.params)
        .then((res) => {
          this.errors = {};
          this.$awn.success(res?.message || 'Modifications enregistrées');
        })
        .catch((e) => {
          this.errors = { ...e };
          this.$awn.alert(e?.message || "Erreur lors de l'enregistrement");
        });
    },
  },
};
</script>

<style scoped></style>

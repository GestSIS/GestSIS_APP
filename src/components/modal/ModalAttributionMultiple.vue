<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6 mb-3">
          <label for="date">Date attribution</label>
          <input
            id="date"
            v-model="activeAttribution.date"
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attributions.0.date'] }"
          />
        </div>
        <div class="col-6">
          <base-select
            v-model="activeAttribution.sapeur_id"
            class="mb-3"
            value-key="id"
            label="Sapeur"
            display-key="nom_prenom"
            :options="sapeurs"
            :select-class="{ 'is-invalid': errors['attributions.0.sapeur_id'] }"
          />
        </div>
        <div class="col-md-12">
          <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
            <button
              class="nav-item nav-link"
              role="tab"
              :class="{ active: tab == 'numerote' }"
              @click="tab = 'numerote'"
            >
              Matériel numéroté
            </button>
            <button
              class="nav-item nav-link"
              role="tab"
              exact-active-class="active"
              :class="{ active: tab == 'generique' }"
              @click="tab = 'generique'"
            >
              Matériel générique
            </button>
          </nav>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Attribuer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalAttributionMultiple',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      tab: 'numerote',
      activeAttribution: {
        date: new Date().toISOString().slice(0, 10),
        sapeur_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) =>
        state.sapeur.liste.map((s) => ({
          ...s,
          nom_prenom: `${s.nom} ${s.prenom}`,
        })),
    }),
  },
  mounted() {
    this.activeAttribution = {
      ...this.activeAttribution,
      id: this.data?.id,
      quantite: this.data?.materiel?.quantite ?? null,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.$store
        .dispatch('attribuerMatPerso', [this.activeAttribution])
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch((errors) => (this.errors = errors));
    },
  },
};
</script>

<style scoped></style>

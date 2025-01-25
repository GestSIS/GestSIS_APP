<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Convocations</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row mb-3">
        <div class="col-12 mb-3">
          <span v-if="!params.sapeurIds.length" class="me-3"
            >Tous les sapeurs actifs</span
          >
          <span v-else-if="params.sapeurIds.length === 1" class="me-3"
            >1 sapeur sélectionné</span
          >
          <span v-else class="me-3"
            >{{ params.sapeurIds.length }} sapeurs sélectionnés</span
          >
          <button
            class="me-3 btn btn-outline-primary"
            type="button"
            @click="select()"
          >
            Sélection des sapeurs
          </button>
          <button
            v-if="params.sapeurIds.length"
            class="btn btn-outline-secondary"
            type="button"
            @click="resetSelection()"
          >
            Annuler la sélection
          </button>
        </div>
        <hr />
        <div class="col-12">
          <h6>Informations</h6>
          <div class="input-group input-group-sm mb-3">
            <span id="titre" class="input-group-text">Titre</span>
            <input
              v-model="convocationParams.titre"
              type="text"
              class="form-control form-control-sm"
              placeholder="Convocation"
              aria-label="Convocation"
              aria-describedby="titre"
              @blur="saveParam"
            />
          </div>
          <base-checkbox
            v-model="convocationParams.afficher_duree"
            class="mb-3"
            label="Affichage de la durée"
            @change="saveParam"
          />
          <base-checkbox
            v-model="convocationParams.afficher_pour_info"
            class="mb-3"
            label="Affichage des personnes 'Pour information'"
            @change="saveParam"
          />
          <div class="input-group input-group-sm mb-3">
            <span id="info" class="input-group-text"
              >Info
              <font-awesome-icon
                v-tooltip.bottom="
                  'Ce texte sera affiché pour les sapeurs ajouté à un exercice mais qui ne sont pas convoqué officiellement.'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </span>
            <input
              v-model="convocationParams.texte_pour_info"
              type="text"
              class="form-control form-control-sm"
              :disabled="!convocationParams.afficher_pour_info"
              placeholder="Pour information"
              aria-label="Pour information"
              aria-describedby="info"
              @blur="saveParam"
            />
          </div>
        </div>
      </div>
      <hr />
      <div class="mb-3">
        <label for="debut">Texte de début de convocation</label>
        <textarea
          id="debut"
          v-model="convocationParams.texte_debut"
          rows="4"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texte_debut'] }"
          @blur="saveParam"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Texte de fin de convocation</label>
        <textarea
          id="fin"
          v-model="convocationParams.texte_fin"
          rows="4"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texte_fin'] }"
          @blur="saveParam"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="convoquer()">
        Convoquer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import ConvocationService from '/src/services/ConvocationService.js';

export default {
  name: 'ModalConvoquer',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      params: {
        sapeurIds: [],
      },
      errors: {},
    };
  },
  computed: {
    ...mapState({
      convocationParams: (state) => state.convocationParam.params,
      exerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
  },
  mounted() {
    if (this.data.remount) {
      this.params = this.data.save;
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'SHOW_MODAL']),
    convoquer() {
      this.SHOW_MODAL({ component: 'ModalChargement' });
      ConvocationService.downloadConvocations(this.exerciceComptableId, {
        ...this.params,
        ...this.convocationParams,
      })
        .then(() => this.HIDE_MODAL())
        .catch(() => this.HIDE_MODAL());
    },
    saveParam() {
      this.$store.dispatch('updateConvocationParams', this.convocationParams);
    },
    select() {
      const save = {
        ...this.data,
        remount: true,
        save: { ...this.params },
      };
      const data = {
        ids: this.params.sapeurIds.slice(0),
      };
      const callback = (res) => {
        if (res) {
          save.save.sapeurIds = res.tous;
        }
        this.SHOW_MODAL({
          component: 'ModalConvoquer',
          size: 1,
          callback,
          data: save,
        });
        return Promise.resolve(false);
      };
      this.SHOW_MODAL({
        component: 'ModalSapeurSelect',
        size: 1,
        callback,
        data,
      });
    },
    resetSelection() {
      this.params.sapeurIds = [];
    },
  },
};
</script>

<style scoped></style>

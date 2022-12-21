<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Convocations</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row mb-3">
        <!-- <div class="col-3">
          <h6>Options d'impression</h6>
          <base-checkbox label="Code NIP" v-model="params.nip" />
          <base-checkbox label="Groupe" v-model="params.groupe" />
          <base-checkbox label="Téléphone" v-model="params.telephone" />
          <base-checkbox label="Adresse SIS" v-model="params.adresse" />
          <base-checkbox label="Exercice détail" v-model="params.details" />
        </div>-->
        <div class="col-12 mb-3">
          <span v-if="!params.sapeurIds.length" class="me-3"
            >Tous les sapeurs actifs</span
          >
          <span v-else-if="params.sapeurIds.length == 1" class="me-3"
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
              v-model="params.titre"
              type="text"
              class="form-control form-control-sm"
              placeholder="Convocation"
              aria-label="Convocation"
              aria-describedby="titre"
            />
          </div>
          <base-checkbox
            v-model="params.info"
            class="mb-3"
            label="Affichage des personnes 'Pour information'"
          />
          <div class="input-group input-group-sm mb-3">
            <span id="info" class="input-group-text">Info</span>
            <input
              v-model="params.pourInfo"
              type="text"
              class="form-control form-control-sm"
              :disabled="!params.info"
              placeholder="Pour information"
              aria-label="Pour information"
              aria-describedby="info"
            />
          </div>
        </div>
      </div>
      <hr />
      <div class="mb-3">
        <label for="debut">Texte de début de convocation</label>
        <textarea
          id="debut"
          v-model="params.texteDebut"
          rows="4"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['textDebut'] }"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Texte de fin de convocation</label>
        <textarea
          id="fin"
          v-model="params.texteFin"
          rows="4"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texteFin'] }"
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
        nip: false,
        groupe: false,
        telephone: false,
        adresse: false,
        details: true,
        format: 1,
        titre: 'Convocation',
        info: true,
        pourInfo: 'Pour information',
        texteDebut: '',
        texteFin: '',
        sapeurIds: [],
      },
      errors: {},
    };
  },
  computed: {
    ...mapState({
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
      ConvocationService.downloadConvocations(
        this.exerciceComptableId,
        this.params
      );
    },
    select() {
      const save = { ...this.data, remount: true, save: { ...this.params } };
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

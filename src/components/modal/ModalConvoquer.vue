<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Convocations</h5>
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
        <div class="col-8">
          <h6>Informations</h6>
          <div class="input-group input-group-sm mb-3">
            <span class="input-group-text" id="titre">Titre</span>
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Convocation"
              aria-label="Convocation"
              aria-describedby="titre"
              v-model="params.titre"
            />
          </div>
          <base-checkbox
            class="mb-3"
            label="Affichage des personnes 'Pour information'"
            v-model="params.info"
          />
          <div class="input-group input-group-sm mb-3">
            <span class="input-group-text" id="info">Info</span>
            <input
              type="text"
              class="form-control form-control-sm"
              :disabled="!params.info"
              placeholder="Pour information"
              aria-label="Pour information"
              aria-describedby="info"
              v-model="params.pourInfo"
            />
          </div>
        </div>
        <div class="col-4">
          <h6>Format</h6>
          <base-radio :advancedLabel="true" v-model="params.format" :options="formats" />
        </div>
      </div>
      <div class="mb-3">
        <label for="debut">Texte de début de convocation</label>
        <textarea
          v-model="params.texteDebut"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['textDebut'] }"
          id="debut"
        />
      </div>
      <div class="mb-3">
        <label for="fin">Texte de fin de convocation</label>
        <textarea
          v-model="params.texteFin"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['texteFin'] }"
          id="fin"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="convoquer()">Convoquer</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import ConvocationService from '@/services/ConvocationService.js';

export default {
  name: 'ModalAppel',
  props: {
    data: {
      type: Object,
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
      },
      formats: [
        { value: 1, label: 'Localité, Lieu\nCatégorie, Communication' },
        { value: 2, label: 'Localité, Lieu, Catégorie\n Communication' },
        { value: 3, label: 'Localité, Lieu, Catégorie, Communication' },
      ],
      errors: {},
    };
  },
  computed: {
    ...mapState({
      exerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    convoquer() {
      ConvocationService.downloadConvocations(
        this.exerciceComptableId,
        this.params
      );
    },
  },
};
</script>

<style scoped></style>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        Ajouter un {{ sapeur.type == 0 ? 'sapeur' : 'politique' }}
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <!-- CIVILITE -->
      <!-- <base-select class="mb-3" label="Type" valueKey="id" displayKey="designation" :options="[
        { designation: 'Sapeur', id: 0 },
        { designation: 'Politique', id: 1 }
      ]" v-model="sapeur.type" /> -->
      <div class="mb-3">
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio1"
            :value="0"
            v-model="sapeur.type"
          />
          <label class="form-check-label" for="inlineRadio1">Sapeur</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio2"
            :value="1"
            v-model="sapeur.type"
          />
          <label class="form-check-label" for="inlineRadio2">Politique</label>
        </div>
      </div>
      <!-- CIVILITE -->
      <div class="mb-3">
        <label for="m-sap-civilite">Civilité</label>
        <select
          class="form-select form-select-sm"
          id="m-sap-civilite"
          :class="{ 'is-invalid': errorsData['civilite_id'] }"
          name="civilite_id"
          v-model="sapeur.civilite_id"
        >
          <option
            v-for="civilite in civilites"
            :value="civilite.id"
            :key="civilite.id"
          >
            {{ civilite.designation }}
          </option>
        </select>
      </div>
      <!-- NOM -->
      <div class="mb-3 row">
        <div class="col-6">
          <label for="m-sap-nom">Nom</label>
          <input
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['nom'] }"
            id="m-sap-nom"
            name="nom"
            v-model="sapeur.nom"
          />
        </div>
        <div class="col-6">
          <label for="m-sap-prenom">Prénom</label>
          <input
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['prenom'] }"
            id="m-sap-prenom"
            name="prenom"
            v-model="sapeur.prenom"
          />
        </div>
      </div>
      <!-- RUE -->
      <div class="mb-3 row">
        <div class="col-4">
          <label for="m-sap-localite">NPA Localité</label>
          <select
            class="form-select form-select-sm"
            required
            id="m-sap-localite"
            :class="{ 'is-invalid': errorsData['localite_id'] }"
            name="localite_id"
            style="width: 100%"
            v-model="sapeur.localite_id"
          >
            <option
              v-for="localite in localites"
              :key="localite.id"
              :value="localite.id"
            >
              {{ localite.npa + ' ' + localite.designation }}
            </option>
          </select>
        </div>
        <div class="col-6">
          <label for="m-sap-rue">Rue</label>
          <input
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['rue'] }"
            id="m-sap-rue"
            name="rue"
            v-model="sapeur.rue"
          />
        </div>
        <div class="col-2">
          <label for="m-sap-no-rue">N°</label>
          <input
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['no_rue'] }"
            id="m-sap-no-rue"
            name="no_rue"
            v-model="sapeur.no_rue"
          />
        </div>
      </div>
      <!-- NPA + LOCALITE -->
      <div class="mb-3"></div>
      <!-- N° AVS -->
      <div class="mb-3">
        <label for="m-sap-avs">N° AVS</label>
        <input
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errorsData['no_avs'] }"
          id="m-sap-avs"
          name="no_avs"
          v-model="sapeur.no_avs"
        />
      </div>
      <!-- Email -->
      <div class="mb-3">
        <label for="m-sap-email">Email</label>
        <div class="input-group input-group-sm mb-3">
          <div class="input-group-text">
            <font-awesome-icon icon="envelope" />
          </div>
          <input
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['email'] }"
            type="email"
            id="m-sap-email"
            name="email"
            v-model="sapeur.email"
          />
        </div>
      </div>
      <!-- DATE NAISSANCE + SUFFIXE -->
      <div class="row mb-3" v-if="sapeur.type === 0">
        <div class="col-6">
          <label for="m-sap-date-naissance">Date de naissance</label>
          <div class="input-group input-group-sm">
            <div class="input-group-text">
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
            </div>
            <input
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['date_naissance'] }"
              type="date"
              id="m-sap-date-naissance"
              name="date_naissance"
              v-model="sapeur.date_naissance"
            />
          </div>
        </div>
        <div class="col-6">
          <label for="m-sap-suffixe">Suffixe</label>
          <font-awesome-icon
            class="ms-1"
            v-tooltip.bottom="
              'Permet de différencier deux personnes ayant le même nom et prénom.'
            "
            :icon="['far', 'question-circle']"
          />
          <input
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['suffixe'] }"
            id="m-sap-suffixe"
            name="suffixe"
            v-model="sapeur.suffixe"
          />
        </div>
      </div>
      <!-- DATE INCORPORATION -->
      <div class="mb-3" v-if="sapeur.type === 0">
        <label for="m-sap-email">Date incorporation</label>
        <div class="input-group input-group-sm mb-3">
          <div class="input-group-text">
            <font-awesome-icon :icon="['far', 'calendar-alt']" />
          </div>
          <input
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['incorporation'] }"
            type="date"
            id="m-sap-incorporation"
            name="date_incorporation"
            v-model="sapeur.incorporation"
          />
        </div>
      </div>
      <!-- REMARQUE -->
      <div class="mb-3">
        <label for="m-sap-remarques">Remarques</label>
        <textarea
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errorsData['remarque'] }"
          rows="3"
          id="m-sap-remarques"
          name="remarques"
          v-model="sapeur.remarque"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="save()">Ajouter</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalSapeur',
  props: ['callback'],
  data() {
    return {
      errorsData: {},
      sapeur: {
        type: 0,
        nom: '',
        prenom: '',
        rue: '',
        no_rue: '',
        localite_id: null,
        no_avs: '',
        email: '',
        date_naissance: '',
        suffixe: '',
        incorporation: '',
        remarque: '',
        civilite_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      civilites: (state) => state.baseData.civilites,
      localites: (state) => state.localite.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    close() {
      (this.callback(null) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    async save() {
      this.$store
        .dispatch('createSapeur', this.sapeur)
        .then((data) => {
          (this.callback(data.id) ?? Promise.resolve()).then((close) => {
            if (close ?? true) {
              this.HIDE_MODAL();
            }
          });
        })
        .catch((errors) => {
          this.errorsData = errors;
        });
    },
  },
};
</script>

<style scoped></style>

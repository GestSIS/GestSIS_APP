<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
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
            id="inlineRadio1"
            v-model="sapeur.type"
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            :value="0"
          />
          <label class="form-check-label" for="inlineRadio1">Sapeur</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            id="inlineRadio2"
            v-model="sapeur.type"
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            :value="1"
          />
          <label class="form-check-label" for="inlineRadio2">Politique</label>
        </div>
      </div>
      <!-- CIVILITE -->
      <div class="mb-3">
        <label for="m-sap-civilite">Civilité</label>
        <select
          id="m-sap-civilite"
          v-model="sapeur.civilite_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errorsData['civilite_id'] }"
          name="civilite_id"
        >
          <option
            v-for="civilite in civilites"
            :key="civilite.id"
            :value="civilite.id"
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
            id="m-sap-nom"
            v-model="sapeur.nom"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['nom'] }"
            name="nom"
          />
        </div>
        <div class="col-6">
          <label for="m-sap-prenom">Prénom</label>
          <input
            id="m-sap-prenom"
            v-model="sapeur.prenom"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['prenom'] }"
            name="prenom"
          />
        </div>
      </div>
      <!-- RUE -->
      <div class="mb-3 row">
        <div class="col-4">
          <label for="m-sap-localite">NPA Localité</label>
          <select
            id="m-sap-localite"
            v-model="sapeur.localite_id"
            class="form-select form-select-sm"
            required
            :class="{ 'is-invalid': errorsData['localite_id'] }"
            name="localite_id"
            style="width: 100%"
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
            id="m-sap-rue"
            v-model="sapeur.rue"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['rue'] }"
            name="rue"
          />
        </div>
        <div class="col-2">
          <label for="m-sap-no-rue">N°</label>
          <input
            id="m-sap-no-rue"
            v-model="sapeur.no_rue"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['no_rue'] }"
            name="no_rue"
          />
        </div>
      </div>
      <!-- NPA + LOCALITE -->
      <div class="mb-3"></div>
      <!-- N° AVS -->
      <div class="mb-3">
        <label for="m-sap-avs">N° AVS</label>
        <input
          id="m-sap-avs"
          v-model="sapeur.no_avs"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errorsData['no_avs'] }"
          name="no_avs"
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
            id="m-sap-email"
            v-model="sapeur.email"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['email'] }"
            type="email"
            name="email"
          />
        </div>
      </div>
      <!-- DATE NAISSANCE + SUFFIXE -->
      <div v-if="sapeur.type === 0" class="row mb-3">
        <div class="col-6">
          <label for="m-sap-date-naissance">Date de naissance</label>
          <div class="input-group input-group-sm">
            <div class="input-group-text">
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
            </div>
            <input
              id="m-sap-date-naissance"
              v-model="sapeur.date_naissance"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errorsData['date_naissance'] }"
              type="date"
              name="date_naissance"
            />
          </div>
        </div>
        <div class="col-6">
          <label for="m-sap-suffixe">Suffixe</label>
          <font-awesome-icon
            v-tooltip.bottom="
              'Permet de différencier deux personnes ayant le même nom et prénom.'
            "
            class="ms-1"
            :icon="['far', 'question-circle']"
          />
          <input
            id="m-sap-suffixe"
            v-model="sapeur.suffixe"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['suffixe'] }"
            name="suffixe"
          />
        </div>
      </div>
      <!-- DATE INCORPORATION -->
      <div v-if="sapeur.type === 0" class="mb-3">
        <label for="m-sap-email">Date incorporation</label>
        <div class="input-group input-group-sm mb-3">
          <div class="input-group-text">
            <font-awesome-icon :icon="['far', 'calendar-alt']" />
          </div>
          <input
            id="m-sap-incorporation"
            v-model="sapeur.incorporation"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errorsData['incorporation'] }"
            type="date"
            name="date_incorporation"
          />
        </div>
      </div>
      <!-- REMARQUE -->
      <div class="mb-3">
        <label for="m-sap-remarques">Remarques</label>
        <textarea
          id="m-sap-remarques"
          v-model="sapeur.remarque"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errorsData['remarque'] }"
          rows="3"
          name="remarques"
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
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
  },
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

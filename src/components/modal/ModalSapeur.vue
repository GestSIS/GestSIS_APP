<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Ajouter un {{ sapeur.type == 0 ? 'sapeur' : 'civil' }}
      </h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <!-- CIVILITE -->
      <!-- <base-select class="mb-3" label="Type" valueKey="id" displayKey="designation" :options="[
        { designation: 'Sapeur', id: 0 },
        { designation: 'Civil', id: 1 }
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
          <label class="form-check-label" for="inlineRadio2">Civil</label>
        </div>
      </div>
      <base-select
        v-model="sapeur.civilite_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['civilite_id'] }"
        label="Civilité"
        :options="civilites"
      />
      <!-- NOM -->
      <div class="mb-3 row">
        <div class="col-6">
          <label for="m-sap-nom">Nom</label>
          <input
            id="m-sap-nom"
            v-model="sapeur.nom"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['nom'] }"
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
            :class="{ 'is-invalid': errors['prenom'] }"
            name="prenom"
          />
        </div>
      </div>
      <!-- RUE -->
      <div class="mb-3 row">
        <base-select
          v-model="sapeur.localite_id"
          class="col-4"
          :class="{ 'is-invalid': errors['localite_id'] }"
          label="Localité"
          :options="localites"
        />
        <div class="col-6">
          <label for="m-sap-rue">Rue</label>
          <input
            id="m-sap-rue"
            v-model="sapeur.rue"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['rue'] }"
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
            :class="{ 'is-invalid': errors['no_rue'] }"
            name="no_rue"
          />
        </div>
      </div>
      <div class="mb-3">
        <label for="m-sap-avs">N° AVS</label>
        <input
          id="m-sap-avs"
          v-model="sapeur.no_avs"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['no_avs'] }"
          name="no_avs"
        />
      </div>
      <div class="mb-3 row">
        <div class="col-6">
          <label for="m-sap-email">Email</label>
          <div class="input-group input-group-sm mb-3">
            <div class="input-group-text">
              <font-awesome-icon icon="envelope" />
            </div>
            <input
              id="m-sap-email"
              v-model="sapeur.email"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['email'] }"
              type="email"
              name="email"
            />
          </div>
        </div>
        <div class="col-6">
          <label for="m-sap-iban">Iban</label>
          <div class="input-group input-group-sm mb-3">
            <div class="input-group-text">
              <font-awesome-icon :icon="['fas', 'building-columns']" />
            </div>
            <input
              id="m-sap-iban"
              v-model="sapeur.iban"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['iban'] }"
              type="iban"
              name="iban"
            />
          </div>
        </div>
      </div>
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
              :class="{ 'is-invalid': errors['date_naissance'] }"
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
            :class="{ 'is-invalid': errors['suffixe'] }"
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
            :class="{ 'is-invalid': errors['incorporation'] }"
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
          :class="{ 'is-invalid': errors['remarque'] }"
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
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

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
      errors: {},
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
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
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
          this.errors = errors;
        });
    },
  },
};
</script>

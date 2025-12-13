<script setup>
import { computed, reactive, ref } from 'vue';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useBaseDataStore } from '../../stores/common/BaseData.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';

const { callback } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
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
});

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const baseDataStore = useBaseDataStore();
const localites = computed(() => localiteStore.liste);
const civilites = computed(() => baseDataStore.civilites);

const { closeModal } = useModalStore();

const save = async () => {
  sapeurStore
    .createSapeur(form)
    .then((data) => {
      (callback(data.id) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          closeModal();
        }
      });
    })
    .catch((err) => {
      errors.value = err;
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Ajouter un {{ form.type == 0 ? 'sapeur' : 'civil' }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <div class="form-check form-check-inline">
          <input
            id="inlineRadio1"
            v-model="form.type"
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
            v-model="form.type"
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            :value="1"
          />
          <label class="form-check-label" for="inlineRadio2">Civil</label>
        </div>
      </div>
      <base-select
        v-model="form.civilite_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['civilite_id'] }"
        label="Civilité"
        :options="civilites"
      />
      <div class="mb-3 row">
        <div class="col-6">
          <label for="m-sap-nom">Nom</label>
          <input
            id="m-sap-nom"
            v-model="form.nom"
            required
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
            v-model="form.prenom"
            required
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['prenom'] }"
            name="prenom"
          />
        </div>
      </div>
      <div class="mb-3 row">
        <base-select
          v-model="form.localite_id"
          :required="true"
          class="col-4"
          :class="{ 'is-invalid': errors['localite_id'] }"
          label="Localité"
          :options="localites"
        />
        <div class="col-6">
          <label for="m-sap-rue">Rue</label>
          <input
            id="m-sap-rue"
            v-model="form.rue"
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
            v-model="form.no_rue"
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
          v-model="form.no_avs"
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
              v-model="form.email"
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
              v-model="form.iban"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['iban'] }"
              type="iban"
              name="iban"
            />
          </div>
        </div>
      </div>
      <div v-if="form.type === 0" class="row mb-3">
        <div class="col-6">
          <label for="m-sap-date-naissance">Date de naissance</label>
          <div class="input-group input-group-sm">
            <div class="input-group-text">
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
            </div>
            <input
              id="m-sap-date-naissance"
              v-model="form.date_naissance"
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
            v-model="form.suffixe"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['suffixe'] }"
            name="suffixe"
          />
        </div>
      </div>
      <div v-if="form.type === 0" class="mb-3">
        <label for="m-sap-email">Date incorporation</label>
        <div class="input-group input-group-sm mb-3">
          <div class="input-group-text">
            <font-awesome-icon :icon="['far', 'calendar-alt']" />
          </div>
          <input
            id="m-sap-incorporation"
            v-model="form.incorporation"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['incorporation'] }"
            type="date"
            name="date_incorporation"
          />
        </div>
      </div>
      <div class="mb-3">
        <label for="m-sap-remarques">Remarques</label>
        <textarea
          id="m-sap-remarques"
          v-model="form.remarque"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
          rows="3"
          name="remarques"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="submit" class="btn btn-primary">Ajouter</button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="closeModal()"
      >
        Annuler
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const model = defineModel();

const store = useStore();
const localites = computed(() => store.state.localite.liste);
const civilites = computed(() => store.state.baseData.civilites);
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Données personnelles</h3>
    </div>
    <div class="card-body">
      <base-select
        v-model="model.civilite_id"
        class="mb-3"
        label="Civilité"
        disabled
        :options="civilites"
      />
      <div class="mb-3">
        <label for="m-sap-nom">Nom</label>
        <input
          id="m-sap-nom"
          v-model="model.nom"
          type="text"
          readonly
          disabled
          class="form-control form-control-sm"
          name="nom"
        />
      </div>
      <div class="mb-3">
        <label for="m-sap-prenom">Prénom</label>
        <input
          id="m-sap-prenom"
          v-model="model.prenom"
          type="text"
          readonly
          disabled
          class="form-control form-control-sm"
          name="prenom"
        />
      </div>
      <div class="row mb-3">
        <div class="col-8">
          <label for="m-sap-rue">Rue</label>
          <input
            id="m-sap-rue"
            v-model="model.rue"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="rue"
          />
        </div>
        <div class="col-4">
          <label for="m-sap-no-rue">N°</label>
          <input
            id="m-sap-no-rue"
            v-model="model.no_rue"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="no_rue"
          />
        </div>
      </div>
      <base-select
        v-model="model.localite_id"
        class="mb-3"
        label="Localité"
        :required="true"
        disabled
        :options="localites"
      />
      <div class="row">
        <div class="mb-3 col-6">
          <label for="m-sap-avs">N° AVS</label>
          <input
            id="m-sap-avs"
            v-model="model.no_avs"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="no_avs"
          />
        </div>
        <div class="mb-3 col-6">
          <label for="m-sap-cotisation_avs">Cotisation AVS</label>
          <font-awesome-icon
            v-tooltip.bottom="
              'A cocher si le sapeur veut côtiser à l\'avs dès le premier Franc au lieu de la franchise défini dans la loi.'
            "
            class="ms-1"
            :icon="['far', 'question-circle']"
          />
          <div class="form-check text-center col-6">
            <input
              id="m-sap-cotisation_avs"
              v-model="model.cotisation_avs"
              type="checkbox"
              disabled
              class="form-check-input"
            />
            <label class="form-check-label" for="m-sap-cotisation_avs"></label>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="m-sap-email">Email</label>
        <div class="input-group input-group-sm mb-3">
          <div class="input-group-text">
            <font-awesome-icon icon="envelope" />
          </div>
          <input
            id="m-sap-email"
            v-model="model.email"
            class="form-control form-control-sm"
            type="email"
            disabled
            name="email"
          />
        </div>
      </div>
      <div v-if="model.type === 0" class="row mb-3">
        <div class="col-6">
          <label for="m-sap-date-naissance">Date de naissance</label>
          <div class="input-group input-group-sm">
            <div class="input-group-text">
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
            </div>
            <input
              id="m-sap-date-naissance"
              v-model="model.date_naissance"
              class="form-control form-control-sm"
              type="date"
              readonly
              disabled
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
            v-model="model.suffixe"
            type="text"
            disabled
            class="form-control form-control-sm"
            name="suffixe"
          />
        </div>
      </div>
      <div class="mb-3">
        <label for="m-sap-remarques">Remarques</label>
        <textarea
          id="m-sap-remarques"
          v-model="model.remarque"
          readonly
          disabled
          class="form-control form-control-sm"
          rows="3"
          name="remarques"
        ></textarea>
      </div>
    </div>
  </div>
</template>

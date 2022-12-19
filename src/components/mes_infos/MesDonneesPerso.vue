<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Données personnelles</h3>
      <button
        v-if="hasEditPermission"
        class="btn btn-primary"
        @click.prevent="saveSapeur"
      >
        Enregistrer
      </button>
    </div>
    <div class="card-body">
      <base-select
        v-model="activeSapeur.civilite_id"
        class="mb-3"
        label="Civilité"
        :disabled="!hasEditPermission"
        :options="civilites"
      />
      <!-- NOM -->
      <div class="mb-3">
        <label for="m-sap-nom">Nom</label>
        <input
          id="m-sap-nom"
          v-model="activeSapeur.nom"
          type="text"
          :readonly="!hasEditPermission"
          :disabled="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
          name="nom"
        />
      </div>
      <!-- PRENOM -->
      <div class="mb-3">
        <label for="m-sap-prenom">Prénom</label>
        <input
          id="m-sap-prenom"
          v-model="activeSapeur.prenom"
          type="text"
          :readonly="!hasEditPermission"
          :disabled="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['prenom'] }"
          name="prenom"
        />
      </div>
      <!-- RUE -->
      <div class="row mb-3">
        <div class="col-8">
          <label for="m-sap-rue">Rue</label>
          <input
            id="m-sap-rue"
            v-model="activeSapeur.rue"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['rue'] }"
            name="rue"
          />
        </div>
        <div class="col-4">
          <label for="m-sap-no-rue">N°</label>
          <input
            id="m-sap-no-rue"
            v-model="activeSapeur.no_rue"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['no_rue'] }"
            name="no_rue"
          />
        </div>
      </div>
      <!-- NPA + LOCALITE -->
      <base-select
        v-model="activeSapeur.localite_id"
        class="mb-3"
        label="Localité"
        required
        :disabled="!hasEditPermission"
        :options="localites"
      />
      <!-- N° AVS -->
      <div class="row">
        <div class="mb-3 col-6">
          <label for="m-sap-avs">N° AVS</label>
          <input
            id="m-sap-avs"
            v-model="activeSapeur.no_avs"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['no_avs'] }"
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
              v-model="activeSapeur.cotisation_avs"
              type="checkbox"
              :disabled="!hasEditPermission"
              class="form-check-input"
            />
            <label class="form-check-label" for="m-sap-cotisation_avs"></label>
          </div>
        </div>
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
            v-model="activeSapeur.email"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['email'] }"
            type="email"
            :disabled="!hasEditPermission"
            name="email"
          />
        </div>
      </div>
      <!-- DATE NAISSANCE + SUFFIXE -->
      <div v-if="activeSapeur.type === 0" class="row mb-3">
        <div class="col-6">
          <label for="m-sap-date-naissance">Date de naissance</label>
          <div class="input-group input-group-sm">
            <div class="input-group-text">
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
            </div>
            <input
              id="m-sap-date-naissance"
              v-model="activeSapeur.date_naissance"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date_naissance'] }"
              type="date"
              :readonly="!hasEditPermission"
              :disabled="!hasEditPermission"
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
            v-model="activeSapeur.suffixe"
            type="text"
            :disabled="!hasEditPermission"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['suffixe'] }"
            name="suffixe"
          />
        </div>
      </div>
      <!-- REMARQUE -->
      <div class="mb-3">
        <label for="m-sap-remarques">Remarques</label>
        <textarea
          id="m-sap-remarques"
          v-model="activeSapeur.remarque"
          :readonly="!hasEditPermission"
          :disabled="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
          rows="3"
          name="remarques"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MesDonneesPerso',
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeSapeur: { ...this.modelValue },
      hasEditPermission: false,
      errors: {},
    };
  },
  computed: {
    ...mapState({
      localites: (state) => state.localite.liste,
      civilites: (state) => state.baseData.civilites,
    }),
  },
};
</script>

<style scoped></style>

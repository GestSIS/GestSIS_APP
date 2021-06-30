<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter un sapeur</h5>
      <button type="button" class="close" @click="close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <!-- CIVILITE -->
        <div class="form-group">
          <label for="m-sap-civilite">Civilité</label>
          <select
            class="custom-select"
            id="m-sap-civilite"
            :class="{ 'is-invalid': errorsData['civilite_id'] }"
            name="civilite_id"
            v-model="sapeur.civilite_id"
          >
            <option
              v-for="civilite in listeCivilites"
              :value="civilite.id"
              :key="civilite.id"
            >
              {{ civilite.designation }}
            </option>
          </select>
        </div>
        <!-- NOM -->
        <div class="form-group">
          <label for="m-sap-nom">Nom</label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errorsData['nom'] }"
            id="m-sap-nom"
            name="nom"
            v-model="sapeur.nom"
          />
        </div>
        <!-- PRENOM -->
        <div class="form-group">
          <label for="m-sap-prenom">Prénom</label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errorsData['prenom'] }"
            id="m-sap-prenom"
            name="prenom"
            v-model="sapeur.prenom"
          />
        </div>
        <!-- RUE -->
        <div class="row">
          <div class="col-8">
            <div class="form-group">
              <label for="m-sap-rue">Rue</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errorsData['rue'] }"
                id="m-sap-rue"
                name="rue"
                v-model="sapeur.rue"
              />
            </div>
          </div>
          <div class="col-4">
            <div class="form-group">
              <label for="m-sap-no-rue">N°</label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errorsData['no_rue'] }"
                id="m-sap-no-rue"
                name="no_rue"
                v-model="sapeur.no_rue"
              />
            </div>
          </div>
        </div>
        <!-- NPA + LOCALITE -->
        <div class="form-group">
          <label for="m-sap-localite">NPA Localité</label>
          <select
            class="custom-select required"
            id="m-sap-localite"
            :class="{ 'is-invalid': errorsData['localite_id'] }"
            name="localite_id"
            style="width: 100%"
            v-model="sapeur.localite_id"
          >
            <option
              v-for="localite in listeLocalitesSis"
              :key="localite.id"
              :value="localite.id"
            >
              {{ localite.npa + ' ' + localite.designation }}
            </option>
          </select>
        </div>
        <!-- N° AVS -->
        <div class="form-group">
          <label for="m-sap-avs">N° AVS</label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errorsData['no_avs'] }"
            id="m-sap-avs"
            name="no_avs"
            v-model="sapeur.no_avs"
          />
        </div>
        <!-- Email -->
        <div class="form-group">
          <label for="m-sap-email">Email</label>
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <div class="input-group-text">
                <font-awesome-icon icon="envelope" />
              </div>
            </div>
            <input
              class="form-control"
              :class="{ 'is-invalid': errorsData['email'] }"
              type="email"
              id="m-sap-email"
              name="email"
              v-model="sapeur.email"
            />
          </div>
        </div>
        <!-- DATE NAISSANCE + SUFFIXE -->
        <div class="row">
          <div class="col-6">
            <div class="form-group">
              <label for="m-sap-date-naissance">Date de naissance</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <div class="input-group-text">
                    <font-awesome-icon :icon="['far', 'calendar-alt']" />
                  </div>
                </div>
                <input
                  class="form-control"
                  :class="{ 'is-invalid': errorsData['date_naissance'] }"
                  type="date"
                  id="m-sap-date-naissance"
                  name="date_naissance"
                  v-model="sapeur.date_naissance"
                />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-group">
              <label for="m-sap-suffixe">Suffixe</label>
              <font-awesome-icon
                class="ml-1"
                v-tooltip.bottom="
                  'Permet de différencier deux personnes ayant le même nom et prénom.'
                "
                :icon="['far', 'question-circle']"
              />
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errorsData['suffixe'] }"
                id="m-sap-suffixe"
                name="suffixe"
                v-model="sapeur.suffixe"
              />
            </div>
          </div>
        </div>
        <!-- Email -->
        <div class="form-group">
          <label for="m-sap-email">Date incorporation</label>
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
            </div>
            <input
              class="form-control"
              :class="{ 'is-invalid': errorsData['incorporation'] }"
              type="date"
              id="m-sap-incorporation"
              name="date_incorporation"
              v-model="sapeur.incorporation"
            />
          </div>
        </div>
        <!-- REMARQUE -->
        <div class="form-group">
          <label for="m-sap-remarques">Remarques</label>
          <textarea
            class="form-control"
            :class="{ 'is-invalid': errorsData['remarque'] }"
            rows="3"
            id="m-sap-remarques"
            name="remarques"
            v-model="sapeur.remarque"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" @click="save()">Ajouter</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex';

export default {
  name: 'ModalSapeur',
  props: ['callback'],
  data() {
    return {
      errorsData: {},
      sapeur: {
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
      listeCivilites: (state) => state.baseData.civilites,
    }),
    ...mapGetters(['listeLocalitesSis', 'getLocalite']),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    close() {
      this.callback(null);
      this.HIDE_MODAL();
    },
    save() {
      this.$store
        .dispatch('createSapeur', this.sapeur)
        .then((data) => {
          this.callback(data.id);
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errorsData = errors;
        });
    },
  },
};
</script>

<style scoped></style>

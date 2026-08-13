<script setup>
import { onMounted, reactive, ref, useTemplateRef } from "vue";
import { useRoute } from "vue-router";
import RecrutementService from "/src/services/RecrutementService.js";
import Api from "/src/http/Request";
import { useModalStore } from "../stores/common/Modal.js";

const { confirm } = useModalStore();

const route = useRoute();
const sisKey = route.params.sisKey;
const token = route.params.token;

const logoUrl = `${Api.API_URL}/sis-logo/${sisKey}`;
const logoOk = ref(true);
const sisNom = ref(null);

const chargement = ref(true);
const valide = ref(false);
const envoye = ref(false);
const submitting = ref(false);
const errors = ref({});
const step = ref(1);
const formRef = useTemplateRef("form");

const civilites = ref([]);
const localites = ref([]);
const telephoneTypes = ref([]);
const permisTypes = ref([]);

const form = reactive({
  civilite_id: null,
  nom: "",
  prenom: "",
  date_naissance: "",
  localite_id: null,
  rue: "",
  no_rue: "",
  no_avs: "",
  profession: "",
  employeur: "",
  lieu_de_travail: "",
  email: "",
  iban: "",
  telephones: [{ numero: "", telephone_type_id: null, priorite: 1 }],
  permis: [],
});

onMounted(async () => {
  try {
    const data = await RecrutementService.verifierFormulaire(sisKey, token);
    valide.value = data.valide;
    sisNom.value = data.sisNom ?? null;
    civilites.value = data.civilites ?? [];
    localites.value = data.localites ?? [];
    telephoneTypes.value = data.telephoneTypes ?? [];
    permisTypes.value = data.permisTypes ?? [];
  } catch {
    valide.value = false;
  } finally {
    chargement.value = false;
  }
});

const etapeSuivante = () => {
  if (formRef.value.reportValidity()) {
    step.value = 2;
  }
};
const etapePrecedente = () => {
  step.value = 1;
};

const ajouterTelephone = () => {
  form.telephones.push({
    numero: "",
    telephone_type_id: null,
    priorite: form.telephones.length + 1,
  });
};
const retirerTelephone = (index) => {
  if (form.telephones.length <= 1) {
    return;
  }
  form.telephones.splice(index, 1);
};

const ajouterPermis = () => {
  form.permis.push({ permis_type_id: null, date: "" });
};
const retirerPermis = (index) => {
  form.permis.splice(index, 1);
};

const soumettre = async () => {
  if (submitting.value) {
    return;
  }

  try {
    await confirm(
      "Confirmer l'inscription",
      "Avez-vous bien vérifié que toutes les informations saisies sont correctes ? Une fois envoyées, elles seront transmises au sis et vous ne pourrez plus les modifier.",
    );
  } catch {
    return;
  }

  submitting.value = true;
  try {
    await RecrutementService.soumettreFormulaire(sisKey, token, {
      ...form,
      telephones: form.telephones.filter((t) => t.numero && t.telephone_type_id),
      permis: form.permis.filter((p) => p.permis_type_id && p.date),
    });
    errors.value = {};
    envoye.value = true;
  } catch (err) {
    errors.value = err ?? {};
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="centered">
    <div class="card inscription-card">
      <div v-if="logoOk" class="text-center pt-3">
        <img
          :src="logoUrl"
          :alt="sisNom ? `Logo du ${sisNom}` : 'Logo du service d\'incendie et de secours'"
          class="img-fluid logo-sis"
          @error="logoOk = false"
        />
      </div>
      <div class="card-body">
        <div v-if="chargement" class="text-center py-4">Chargement…</div>
        <div v-else-if="envoye" class="text-center py-4">
          <font-awesome-icon icon="check" class="text-success fa-2x mb-3" />
          <h4>Inscription enregistrée</h4>
          <p class="text-muted">Merci ! Vos informations ont bien été transmises.</p>
        </div>
        <div v-else-if="!valide" class="text-center py-4">
          <font-awesome-icon icon="ban" class="text-danger fa-2x mb-3" />
          <h4>Lien invalide ou expiré</h4>
          <p class="text-muted">
            Ce lien d'inscription n'est plus valide. Merci de contacter votre SIS pour en obtenir un
            nouveau.
          </p>
        </div>
        <form v-else ref="form" @submit.prevent="soumettre">
          <h4 class="mb-3">Inscription recrue — Étape {{ step }}/2</h4>

          <div v-if="step === 1">
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
                <label for="r-nom">Nom</label>
                <input
                  id="r-nom"
                  v-model="form.nom"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['nom'] }"
                />
              </div>
              <div class="col-6">
                <label for="r-prenom">Prénom</label>
                <input
                  id="r-prenom"
                  v-model="form.prenom"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['prenom'] }"
                />
              </div>
            </div>

            <div class="mb-3">
              <label for="r-date-naissance">Date de naissance</label>
              <input
                id="r-date-naissance"
                v-model="form.date_naissance"
                required
                type="date"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date_naissance'] }"
              />
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
                <label for="r-rue">Rue</label>
                <input
                  id="r-rue"
                  v-model="form.rue"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['rue'] }"
                />
              </div>
              <div class="col-2">
                <label for="r-no-rue">N°</label>
                <input
                  id="r-no-rue"
                  v-model="form.no_rue"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['no_rue'] }"
                />
              </div>
            </div>

            <div class="mb-3">
              <label for="r-email">Email</label>
              <input
                id="r-email"
                v-model="form.email"
                required
                type="email"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['email'] }"
              />
            </div>

            <button type="button" class="btn btn-primary w-100 mt-3" @click="etapeSuivante">
              Suivant
            </button>
          </div>

          <div v-else>
            <div class="mb-3">
              <label for="r-avs">N° AVS</label>
              <input
                id="r-avs"
                v-model="form.no_avs"
                required
                type="text"
                placeholder="756.XXXX.XXXX.XX"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['no_avs'] }"
              />
              <div v-if="errors['no_avs']" class="invalid-feedback d-block">
                {{ errors["no_avs"] }}
              </div>
            </div>

            <div class="mb-3 row">
              <div class="col-4">
                <label for="r-profession">Profession</label>
                <input
                  id="r-profession"
                  v-model="form.profession"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['profession'] }"
                />
              </div>
              <div class="col-4">
                <label for="r-employeur">Employeur</label>
                <input
                  id="r-employeur"
                  v-model="form.employeur"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['employeur'] }"
                />
              </div>
              <div class="col-4">
                <label for="r-lieu-travail">Lieu de travail</label>
                <input
                  id="r-lieu-travail"
                  v-model="form.lieu_de_travail"
                  required
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors['lieu_de_travail'] }"
                />
              </div>
            </div>

            <div class="mb-3">
              <label for="r-iban">IBAN</label>
              <input
                id="r-iban"
                v-model="form.iban"
                required
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['iban'] }"
              />
            </div>

            <div class="mb-3">
              <label class="d-block mb-2">Téléphones</label>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Type</th>
                    <th v-if="form.telephones.length > 1"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(telephone, index) in form.telephones" :key="index">
                    <td>
                      <input
                        v-model="telephone.numero"
                        required
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="+41 ..."
                      />
                    </td>
                    <td>
                      <select
                        v-model="telephone.telephone_type_id"
                        required
                        class="form-select form-select-sm"
                      >
                        <option :value="null" disabled>Choisir…</option>
                        <option v-for="type in telephoneTypes" :key="type.id" :value="type.id">
                          {{ type.type }}
                        </option>
                      </select>
                    </td>
                    <td v-if="form.telephones.length > 1" class="align-middle text-center">
                      <button
                        type="button"
                        class="btn btn-outline-danger border-0 btn-sm"
                        @click="retirerTelephone(index)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                v-if="form.telephones.length < 3"
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="ajouterTelephone"
              >
                <font-awesome-icon icon="plus" /> Ajouter un numéro
              </button>
            </div>

            <div class="mb-3">
              <label class="d-block mb-2">Permis de conduire</label>
              <table v-if="form.permis.length > 0" class="table table-sm">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Date d'obtention</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(permis, index) in form.permis" :key="index">
                    <td>
                      <select
                        v-model="permis.permis_type_id"
                        required
                        class="form-select form-select-sm"
                      >
                        <option :value="null" disabled>Choisir…</option>
                        <option v-for="type in permisTypes" :key="type.id" :value="type.id">
                          {{ type.type }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input
                        v-model="permis.date"
                        required
                        type="date"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td class="align-middle text-center">
                      <button
                        type="button"
                        class="btn btn-outline-danger border-0 btn-sm"
                        @click="retirerPermis(index)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="btn btn-outline-primary btn-sm" @click="ajouterPermis">
                <font-awesome-icon icon="plus" /> Ajouter un permis
              </button>
            </div>

            <div class="d-flex mt-3">
              <button type="button" class="btn btn-outline-secondary me-2" @click="etapePrecedente">
                Précédent
              </button>
              <button type="submit" class="btn btn-primary flex-grow-1" :disabled="submitting">
                {{ submitting ? "Envoi…" : "Envoyer mon inscription" }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.centered {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5 !important;
  padding: 2rem 1rem;
}

.inscription-card {
  width: 100%;
  max-width: 640px;
}

.logo-sis {
  max-height: 200px;
}
</style>

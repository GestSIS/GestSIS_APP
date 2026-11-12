<script setup>
import { onMounted, reactive, ref, useTemplateRef } from "vue";
import { useRoute } from "vue-router";
import RecrutementService from "/src/services/RecrutementService.js";
import Api from "/src/http/Request";
import { formatAvs, formatPhoneNumber } from "../tools/formatters.js";
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
const erreurGenerale = ref(null);
const step = ref(1);
const formRef = useTemplateRef("form");
// Date locale au format AAAA-MM-JJ (toISOString() serait en UTC, décalé d'un jour autour de minuit)
const aujourdhui = new Date().toLocaleDateString("sv-SE");

// Champs affichés à l'étape 1 : si l'API en refuse un, il faut y revenir pour que l'erreur soit visible.
const CHAMPS_ETAPE_1 = [
  "civilite_id",
  "nom",
  "prenom",
  "date_naissance",
  "localite_id",
  "rue",
  "no_rue",
  "email",
];

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
// Empêche de choisir un permis déjà sélectionné sur une autre ligne.
const permisTypesDisponibles = (index) => {
  const dejaChoisis = new Set(
    form.permis
      .filter((p, i) => i !== index && p.permis_type_id !== null)
      .map((p) => p.permis_type_id),
  );
  return permisTypes.value.filter((type) => !dejaChoisis.has(type.id));
};

// N° AVS et IBAN sont facultatifs (une recrue peut ne pas les avoir sous la main), mais le SIS en a
// besoin : s'ils sont vides, on invite la recrue à les saisir avant de la laisser envoyer sans.
// Résout `false` si elle choisit de compléter (le curseur est alors placé sur le premier champ vide).
const confirmerChampsFacultatifsVides = async () => {
  const manquants = [
    { id: "r-avs", vide: !form.no_avs.trim(), libelle: "votre n° AVS" },
    { id: "r-iban", vide: !form.iban.trim(), libelle: "votre IBAN" },
  ].filter((champ) => champ.vide);
  if (manquants.length === 0) {
    return true;
  }

  const libelles = manquants.map((champ) => champ.libelle).join(" et ");
  const continuer = await confirm(
    "Informations manquantes",
    `Vous n'avez pas saisi ${libelles}. Ces informations sont nécessaires au SIS pour le versement de votre solde et le décompte AVS : merci de les saisir si vous les avez. Si vous ne les avez pas sous la main, vous pouvez envoyer votre inscription sans.`,
    { annuler: "Compléter", confirmer: "Je n'ai pas ces informations" },
  );
  if (!continuer) {
    document.getElementById(manquants[0].id)?.focus();
  }
  return continuer;
};

const soumettre = async () => {
  if (submitting.value) {
    return;
  }

  if (!(await confirmerChampsFacultatifsVides())) {
    return;
  }

  if (
    await confirm(
      "Confirmer l'inscription",
      "Avez-vous bien vérifié que toutes les informations saisies sont correctes ? Une fois envoyées, elles seront transmises au sis et vous ne pourrez plus les modifier.",
    )
  ) {
    submitting.value = true;
    try {
      // Lignes envoyées telles quelles (toutes requises) : les erreurs `telephones.N.*` / `permis.N.*`
      // renvoyées par l'API doivent pointer sur la ligne affichée à l'index N.
      await RecrutementService.soumettreFormulaire(sisKey, token, form);
      errors.value = {};
      erreurGenerale.value = null;
      envoye.value = true;
    } catch (err) {
      // Les erreurs Laravel sont des tableaux de messages, celles levées côté métier de simples
      // chaînes : on ne garde que le premier message pour l'afficher sous le champ.
      errors.value = Object.fromEntries(
        Object.entries(err?.errors ?? {}).map(([champ, message]) => [
          champ,
          Array.isArray(message) ? message[0] : message,
        ]),
      );
      const champsEnErreur = Object.keys(errors.value);
      if (champsEnErreur.length > 0) {
        // Un champ obligatoire manquant revient sans message : il est seulement mis en rouge.
        erreurGenerale.value = Object.values(errors.value).every((message) => !message)
          ? "Merci de compléter les champs obligatoires indiqués en rouge."
          : "Certaines informations sont invalides, merci de vérifier les champs indiqués en rouge.";
        if (champsEnErreur.some((champ) => CHAMPS_ETAPE_1.includes(champ))) {
          step.value = 1;
        }
      } else if (err?.response?.status === 404 || err?.message === "Page introuvable") {
        erreurGenerale.value =
          "Ce lien d'inscription n'est plus valide. Merci de contacter votre SIS pour en obtenir un nouveau.";
      } else {
        erreurGenerale.value =
          "L'envoi de votre inscription a échoué. Merci de réessayer dans quelques instants.";
      }
    } finally {
      submitting.value = false;
    }
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

          <div v-if="erreurGenerale" class="alert alert-danger py-2" role="alert">
            {{ erreurGenerale }}
          </div>

          <div v-if="step === 1">
            <div class="mb-3">
              <base-select
                v-model="form.civilite_id"
                :required="true"
                :select-class="{ 'is-invalid': 'civilite_id' in errors }"
                label="Civilité"
                :options="civilites"
              />
              <div v-if="errors['civilite_id']" class="invalid-feedback d-block">
                {{ errors["civilite_id"] }}
              </div>
            </div>

            <div class="mb-3 row">
              <div class="col-6">
                <label for="r-nom">Nom</label>
                <input
                  id="r-nom"
                  v-model="form.nom"
                  required
                  minlength="2"
                  maxlength="255"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'nom' in errors }"
                />
                <div v-if="errors['nom']" class="invalid-feedback d-block">
                  {{ errors["nom"] }}
                </div>
              </div>
              <div class="col-6">
                <label for="r-prenom">Prénom</label>
                <input
                  id="r-prenom"
                  v-model="form.prenom"
                  required
                  minlength="2"
                  maxlength="255"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'prenom' in errors }"
                />
                <div v-if="errors['prenom']" class="invalid-feedback d-block">
                  {{ errors["prenom"] }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="r-date-naissance">Date de naissance</label>
              <input
                id="r-date-naissance"
                v-model="form.date_naissance"
                required
                :max="aujourdhui"
                type="date"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': 'date_naissance' in errors }"
              />
              <div v-if="errors['date_naissance']" class="invalid-feedback d-block">
                {{ errors["date_naissance"] }}
              </div>
            </div>

            <div class="mb-3 row">
              <div class="col-4">
                <base-select
                  v-model="form.localite_id"
                  :required="true"
                  :select-class="{ 'is-invalid': 'localite_id' in errors }"
                  label="Localité"
                  :options="localites"
                />
                <div v-if="errors['localite_id']" class="invalid-feedback d-block">
                  {{ errors["localite_id"] }}
                </div>
              </div>
              <div class="col-6">
                <label for="r-rue">Rue</label>
                <input
                  id="r-rue"
                  v-model="form.rue"
                  required
                  minlength="3"
                  maxlength="255"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'rue' in errors }"
                />
                <div v-if="errors['rue']" class="invalid-feedback d-block">
                  {{ errors["rue"] }}
                </div>
              </div>
              <div class="col-2">
                <label for="r-no-rue">N°</label>
                <input
                  id="r-no-rue"
                  v-model="form.no_rue"
                  required
                  maxlength="255"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'no_rue' in errors }"
                />
                <div v-if="errors['no_rue']" class="invalid-feedback d-block">
                  {{ errors["no_rue"] }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="r-email">Email</label>
              <input
                id="r-email"
                v-model="form.email"
                required
                maxlength="255"
                type="email"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': 'email' in errors }"
              />
              <div v-if="errors['email']" class="invalid-feedback d-block">
                {{ errors["email"] }}
              </div>
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
                @blur="form.no_avs = formatAvs(form.no_avs)"
                maxlength="255"
                type="text"
                placeholder="756.XXXX.XXXX.XX"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': 'no_avs' in errors }"
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
                  maxlength="80"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'profession' in errors }"
                />
                <div v-if="errors['profession']" class="invalid-feedback d-block">
                  {{ errors["profession"] }}
                </div>
              </div>
              <div class="col-4">
                <label for="r-employeur">Employeur</label>
                <input
                  id="r-employeur"
                  v-model="form.employeur"
                  required
                  maxlength="150"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'employeur' in errors }"
                />
                <div v-if="errors['employeur']" class="invalid-feedback d-block">
                  {{ errors["employeur"] }}
                </div>
              </div>
              <div class="col-4">
                <label for="r-lieu-travail">Lieu de travail</label>
                <input
                  id="r-lieu-travail"
                  v-model="form.lieu_de_travail"
                  required
                  maxlength="100"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': 'lieu_de_travail' in errors }"
                />
                <div v-if="errors['lieu_de_travail']" class="invalid-feedback d-block">
                  {{ errors["lieu_de_travail"] }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="r-iban">IBAN</label>
              <input
                id="r-iban"
                v-model="form.iban"
                maxlength="100"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': 'iban' in errors }"
              />
              <div v-if="errors['iban']" class="invalid-feedback d-block">
                {{ errors["iban"] }}
              </div>
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
                        @blur="telephone.numero = formatPhoneNumber(telephone.numero)"
                        required
                        type="text"
                        class="form-control form-control-sm"
                        maxlength="255"
                        placeholder="+41 ..."
                        :class="{ 'is-invalid': `telephones.${index}.numero` in errors }"
                      />
                      <div
                        v-if="errors[`telephones.${index}.numero`]"
                        class="invalid-feedback d-block"
                      >
                        {{ errors[`telephones.${index}.numero`] }}
                      </div>
                    </td>
                    <td>
                      <select
                        v-model="telephone.telephone_type_id"
                        required
                        class="form-select form-select-sm"
                        :class="{ 'is-invalid': `telephones.${index}.telephone_type_id` in errors }"
                      >
                        <option :value="null" disabled>Choisir…</option>
                        <option v-for="type in telephoneTypes" :key="type.id" :value="type.id">
                          {{ type.type }}
                        </option>
                      </select>
                      <div
                        v-if="errors[`telephones.${index}.telephone_type_id`]"
                        class="invalid-feedback d-block"
                      >
                        {{ errors[`telephones.${index}.telephone_type_id`] }}
                      </div>
                    </td>
                    <td v-if="form.telephones.length > 1" class="align-middle text-center">
                      <button
                        aria-label="Supprimer"
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
              <div v-if="errors['telephones']" class="invalid-feedback d-block mb-2">
                {{ errors["telephones"] }}
              </div>
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
                        :class="{ 'is-invalid': `permis.${index}.permis_type_id` in errors }"
                      >
                        <option :value="null" disabled>Choisir…</option>
                        <option
                          v-for="type in permisTypesDisponibles(index)"
                          :key="type.id"
                          :value="type.id"
                        >
                          {{ type.type }}
                        </option>
                      </select>
                      <div
                        v-if="errors[`permis.${index}.permis_type_id`]"
                        class="invalid-feedback d-block"
                      >
                        {{ errors[`permis.${index}.permis_type_id`] }}
                      </div>
                    </td>
                    <td>
                      <input
                        v-model="permis.date"
                        required
                        :max="aujourdhui"
                        type="date"
                        class="form-control form-control-sm"
                        :class="{ 'is-invalid': `permis.${index}.date` in errors }"
                      />
                      <div v-if="errors[`permis.${index}.date`]" class="invalid-feedback d-block">
                        {{ errors[`permis.${index}.date`] }}
                      </div>
                    </td>
                    <td class="align-middle text-center">
                      <button
                        aria-label="Supprimer"
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
              <button
                v-if="form.permis.length < permisTypes.length"
                type="button"
                class="btn btn-outline-primary btn-sm"
                @click="ajouterPermis"
              >
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
  background-color: var(--bs-tertiary-bg);
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

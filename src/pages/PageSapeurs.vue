<script setup>
import permissions from "../composables/permissions.js";
import { useModalStore } from "../stores/common/Modal";
import { useBaseDataStore } from "../stores/common/BaseData.js";
import { useSapeurStore } from "../stores/sapeur/Sapeur.js";
import { useFonctionStore } from "../stores/sapeur/Fonction.js";
import { useGradeStore } from "../stores/sapeur/Grade.js";
import { useLocaliteStore } from "../stores/common/Localite.js";
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";
import SapeurService from "/src/services/SapeurService";
import RecrutementService from "/src/services/RecrutementService.js";
import { useRoute, useRouter } from "vue-router";
import { useHasPermission } from "../composables/useHasPermission.js";
import { computed, onMounted, ref, useTemplateRef, watch, watchEffect } from "vue";
import { useNotification } from "../composables/useNotification.js";
import { exportFileName } from "../tools/index.js";
import { formatPhoneNumber } from "../tools/formatters.js";
import { useDownload } from "../composables/useDownload.js";
import { useSubmit } from "../composables/useSubmit.js";

const TYPE_SAPEUR = 0;
const TYPE_CIVIL = 1;
const TYPE_RECRUE = 2;

const baseDataStore = useBaseDataStore();
const sapeurStore = useSapeurStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();
const localiteStore = useLocaliteStore();

const routes = [
  { texte: "General", to: { name: "sapeur-details" }, civil: true, recrue: true },
  { texte: "Mutations", to: { name: "sapeur-mutations" } },
  {
    texte: "Contrôles médicaux",
    to: { name: "sapeur-controles-medicaux" },
    permission: permissions.CONTROLE_MEDICAL.LECTURE,
  },
  { texte: "Fonctions", to: { name: "sapeur-fonctions" }, civil: true },
  { texte: "Cours", to: { name: "sapeur-cours" } },
  { texte: "Promotion", to: { name: "sapeur-promotions" } },
  { texte: "Materiel", to: { name: "sapeur-materiels" }, civil: true },
  { texte: "Organisation", to: { name: "sapeur-organisation" }, civil: true },
  { texte: "Permis", to: { name: "sapeur-permis" }, recrue: true },
  { texte: "Banque", to: { name: "sapeur-banque" }, civil: true, recrue: true },
  { texte: "Exercice", to: { name: "sapeur-exercices" }, civil: true },
  { texte: "Intervention", to: { name: "sapeur-interventions" } },
];

baseDataStore.fetchCivilites();
localiteStore.fetchLocalites();
gradeStore.fetchGrades();
fonctionStore.fetchFonctions();

await sapeurStore.fetchSapeurs();

const route = useRoute();
const router = useRouter();

const activeSapeurId = computed(() => sapeurStore.active.id);

// Select sapeur
// TODO: Refactor ????
watch(
  () => route.params.id,
  () => {
    if (route.params.id == 0 || !route.params.id) {
      if (activeSapeurId.value > 0) {
        // Sapeur précédemment sélectionné
        router.push({
          name: "sapeur-details",
          params: { id: activeSapeurId.value },
        });
      } else if (sapeurStore.liste.filter((s) => s.actif).length > 0) {
        // Sapeurs disponible
        router.push({
          name: "sapeur-details",
          params: {
            id: sapeurStore.liste.filter((s) => s.actif)[0]?.id,
          },
        });
      }
    } else {
      sapeurStore.selectSapeur(route.params.id);
    }
  },
  { immediate: true },
);

// Fetch sapeur Data
const erreurChargement = ref(false);
const chargerSapeur = async (sapeurId) => {
  erreurChargement.value = false;
  try {
    await sapeurStore.fetchSapeur(sapeurId);
  } catch {
    // Seulement si l'utilisateur n'a pas déjà sélectionné un autre sapeur entre-temps
    if (sapeurStore.active.id == sapeurId) {
      erreurChargement.value = true;
    }
  }
};
watchEffect(() => {
  if (parseInt(sapeurStore.active.id) > 0) {
    chargerSapeur(sapeurStore.active.id);
  }
});
// Chargement en cours : la fiche en mémoire est celle d'un autre sapeur (ou pas encore là).
// On affiche alors un indicateur de chargement plutôt qu'un mélange de l'ancien et du nouveau sapeur.
const chargementSapeur = computed(
  () =>
    parseInt(sapeurStore.active.id) > 0 &&
    !erreurChargement.value &&
    sapeurStore.active.data?.id != sapeurStore.active.id,
);

// Redirect civils/recrues vers les onglets qui leur sont pertinents
watchEffect(() => {
  const type = sapeurStore.active.data?.type;
  const routeName = route.name;
  const routeAutorisee = (r) => {
    if (type === TYPE_CIVIL) {
      return r.civil === true;
    }
    if (type === TYPE_RECRUE) {
      return r.recrue === true;
    }
    return true;
  };
  if (type !== TYPE_SAPEUR && routes.find((r) => r.to.name == routeName && !routeAutorisee(r))) {
    router.push({
      name: "sapeur-details",
      params: { id: sapeurStore.active.id },
    });
  }
});

const filter = ref("actif");
const filters = ref({
  actif: (s) => s.actif,
  inactif: (s) => !s.actif,
  all: () => true,
});
const typeFilter = ref("sapeur");
const typeFilters = ref({
  sapeur: (s) => s.type === TYPE_SAPEUR,
  civil: (s) => s.type === TYPE_CIVIL,
  recrue: (s) => s.type === TYPE_RECRUE,
});
const eventListener = ref(null);

const sapeurs = computed(() => sapeurStore.liste);
const activeSapeur = computed(() => sapeurStore.active.data);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);
const isRecrue = computed(() => activeSapeur.value?.type === TYPE_RECRUE);

// En-tête de la fiche : identité du sapeur affiché, quel que soit l'onglet ouvert.
const TYPE_LABELS = { [TYPE_SAPEUR]: "Sapeur", [TYPE_CIVIL]: "Civil", [TYPE_RECRUE]: "Recrue" };
const enTete = computed(() => {
  const s = activeSapeur.value;
  if (!s?.id) return null;
  return {
    nomPrenom: `${s.nom ?? ""} ${s.prenom ?? ""}`.trim(),
    type: TYPE_LABELS[s.type] ?? "",
    // Rôle dans le corps : fonction principale puis grade
    // (grade_id / fonction_id valent 0 quand ils ne sont pas renseignés)
    details: [
      fonctionStore.liste.find((f) => f.id == s.fonction_id)?.nom,
      gradeStore.liste.find((g) => g.id == s.grade_id)?.designation,
    ]
      .filter(Boolean)
      .join(" · "),
    adresse: adresseSapeur(s),
  };
});

// « Rue de l'Exemple 12, 2800 Localité » ; les parties manquantes sont simplement omises
const adresseSapeur = (s) => {
  const localite = localiteStore.liste.find((l) => l.id == s.localite_id);
  const rue = [s.rue, s.no_rue].filter(Boolean).join(" ");
  const ville = [localite?.npa, localite?.designation].filter(Boolean).join(" ");
  return [rue, ville].filter(Boolean).join(", ");
};

// Numéros de l'en-tête : arrivent avec la fiche (fetchSapeur), l'en-tête n'est affiché
// qu'une fois celle-ci chargée. Libellés des types : information d'appoint.
baseDataStore.fetchTelephoneTypes().catch(() => {});
const telephonesEnTete = computed(() => {
  return sapeurStore.active.telephones
    .slice()
    .sort((t1, t2) => t1.priorite - t2.priorite)
    .map((t) => ({
      id: t.id,
      numero: formatPhoneNumber(t.numero),
      // Lien tel: sans espaces
      href: `tel:${formatPhoneNumber(t.numero).replace(/\s/g, "")}`,
      type: baseDataStore.telephoneTypes.find((tt) => tt.id == t.telephone_type_id)?.type,
    }));
});
const typeFilterOptions = computed(() => [
  {
    value: "sapeur",
    label: "Sapeurs",
    badge: sapeurs.value.filter(typeFilters.value.sapeur).filter(filters.value.actif).length,
  },
  {
    value: "civil",
    label: "Civils",
    badge: sapeurs.value.filter(typeFilters.value.civil).filter(filters.value.actif).length,
  },
  {
    value: "recrue",
    label: "Recrues",
    badge: sapeurs.value.filter(typeFilters.value.recrue).length,
  },
]);

const sapeursDuType = computed(() => sapeurs.value.filter(typeFilters.value[typeFilter.value]));
const actifFilterOptions = computed(() => [
  { value: "actif", label: "Actif" },
  {
    value: "inactif",
    label: "Inactif",
    badge: sapeursDuType.value.filter(filters.value.inactif).length,
  },
  { value: "all", label: "Tous" },
]);

// Recherche sur le nom, la localité et la fonction principale, sans tenir compte
// des majuscules ni des accents (« jerome » trouve « Jérôme »).
const recherche = ref("");
const normaliser = (texte) =>
  String(texte ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
const texteRecherche = (s) =>
  normaliser(
    [
      s.nom_prenom,
      localiteStore.liste.find((l) => l.id == s.localite_id)?.designation,
      fonctionStore.liste.find((f) => f.id == s.fonction_id)?.nom,
    ].join(" "),
  );

const filteredSapeurs = computed(() => {
  const statutPredicate =
    typeFilter.value === "recrue" ? filters.value.all : filters.value[filter.value];
  const termes = normaliser(recherche.value).split(/\s+/).filter(Boolean);
  return sapeurs.value
    .filter(statutPredicate)
    .filter(typeFilters.value[typeFilter.value])
    .filter((s) => {
      if (!termes.length) return true;
      const texte = texteRecherche(s);
      return termes.every((terme) => texte.includes(terme));
    });
});

const currentRouteName = computed(() => route.name);

const listeSapeurComponent = useTemplateRef("liste-sapeurs");
eventListener.value = (e) => {
  if (e.key == "ArrowDown" || e.key == "ArrowUp") {
    e.preventDefault();
  }
};

onMounted(() => {
  listeSapeurComponent.value.addEventListener("keydown", eventListener.value);
  listeSapeurComponent.value.addEventListener("keyup", navigationEventListener);
});

const { confirm, showModal } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const { download } = useDownload();
const awn = useNotification();

const ficheSapeur = () => {
  const sapeur = sapeurs.value.find((s) => s.id == activeSapeurId.value);
  download(
    () =>
      SapeurService.downloadFicheSapeur(
        activeSapeurId.value,
        exportFileName(["fiche-sapeur", sapeur?.nom_prenom], "pdf"),
      ),
    "Erreur lors de la génération du fichier pdf, contactez l'administrateur système",
  );
};
const lienInscription = () => showModal({ component: "ModalRecrutementToken" });
const validerRecrue = () =>
  showModal({
    component: "ModalValiderRecrue",
    callback: (incorporation) =>
      RecrutementService.validerRecrue(activeSapeur.value.id, incorporation)
        .then(async () => {
          await sapeurStore.fetchSapeurs();
          await sapeurStore.fetchSapeur(activeSapeur.value.id);
          awn.success("Recrue validée avec succès");
        })
        .catch((err) => {
          awn.alert(err?.message ?? "Impossible de valider cette recrue");
          throw err;
        }),
  });
const navigationEventListener = async (e) => {
  const ids = filteredSapeurs.value.map((s) => s.id);
  const i = ids.indexOf(parseInt(route.params?.id));
  let nextId = null;
  if (e.key == "ArrowDown" && i < ids.length - 1) {
    nextId = i + 1;
  } else if (e.key == "ArrowUp" && i > 0) {
    nextId = i - 1;
  }
  if (nextId != null) {
    router.push({
      name: route.name,
      params: { id: ids[nextId] },
    });
  }
};
const selectSapeur = (sapeurId) => {
  if (sapeurId != null && sapeurId != activeSapeurId.value) {
    router.push({
      name: route.name,
      params: { id: sapeurId },
    });
  }
};
const addSapeur = () => {
  showModal({
    component: "ModalSapeur",
    size: 2,
    callback: (sapeurId) => {
      sapeurStore.selectSapeur(sapeurId);
      router.push({
        name: "sapeur-details",
        params: { id: sapeurId },
      });
      return true;
    },
  });
};
const deleteSapeur = async () => {
  if (
    !(await confirm(
      isRecrue.value
        ? "Voulez-vous vraiment rejeter cette recrue ?"
        : "Voulez-vous vraiment supprimer ce sapeur ?",
      isRecrue.value
        ? "Attention, le rejet d'une recrue est irréversible ! Toutes ses données seront perdues !"
        : "Attention, la suppression d'un sapeur est irréversible ! Toutes les données de ce sapeur seront perdues !",
    ))
  ) {
    return;
  }
  const { ok } = await submit(
    () => sapeurStore.deleteSapeur(activeSapeur.value.id),
    "Impossible de supprimer ce sapeur",
  );
  if (ok) {
    const newSelectedSapeurId = filteredSapeurs.value[0]?.id;
    sapeurStore.selectSapeur(newSelectedSapeurId);
    router.push({
      name: "sapeur-details",
      params: { id: newSelectedSapeurId },
    });
    awn.success(isRecrue.value ? "Recrue rejetée avec succès" : "Sapeur supprimé avec succès");
  }
};
</script>

<template>
  <div class="container-fluid custom-container">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Sapeurs</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row nested-container">
      <div class="col-3 d-none d-sm-block custom-scroll-column">
        <div class="card card-primary card-outline mb-3">
          <!-- Espacement unique (gap-2) entre tous les blocs : pas de marge propre aux éléments -->
          <div class="card-header d-flex flex-column gap-2">
            <h5 class="card-title mb-0">Effectif</h5>
            <div v-if="hasEditPermission" class="d-flex gap-2">
              <button type="button" class="btn btn-primary w-50" @click="addSapeur">
                <font-awesome-icon :icon="['fas', 'plus']" />
                Ajouter
              </button>
              <button
                type="button"
                title="Lien d'inscription recrues"
                class="btn btn-outline-secondary w-50"
                @click="lienInscription"
              >
                <font-awesome-icon :icon="['fas', 'link']" />
                Lien recrues
              </button>
            </div>
            <label for="recherche-sapeur" class="visually-hidden">Rechercher un sapeur</label>
            <div class="input-group">
              <input
                id="recherche-sapeur"
                v-model="recherche"
                type="search"
                class="form-control"
                placeholder="Rechercher : nom, localité, fonction…"
              />
              <span class="input-group-text" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
              </span>
            </div>
            <base-radio
              v-model="typeFilter"
              class="w-100"
              button-style
              label="Type"
              :options="typeFilterOptions"
            />
            <base-radio
              v-if="typeFilter !== 'recrue'"
              v-model="filter"
              class="w-100"
              button-style
              label="Statut"
              :options="actifFilterOptions"
            />
          </div>
          <ul id="liste-sapeurs" ref="liste-sapeurs" class="list-group list-group-flush">
            <router-link
              v-for="sapeur in filteredSapeurs"
              v-slot="{ navigate }"
              :key="sapeur.id"
              custom
              :to="{
                name: currentRouteName,
                params: { id: sapeur.id },
              }"
            >
              <a
                class="list-group-item list-group-item-action sapeur-item"
                href="#"
                :class="{
                  active: activeSapeurId == sapeur.id,
                }"
                role="link"
                @click="navigate"
                >{{ sapeur.nom_prenom }}
                <font-awesome-icon v-if="sapeur.type === TYPE_CIVIL" :icon="['far', 'handshake']" />
                <font-awesome-icon v-if="sapeur.type === TYPE_RECRUE" icon="person-circle-plus" />
              </a>
            </router-link>
            <li v-if="filteredSapeurs.length === 0" class="list-group-item">
              {{ recherche ? `Aucun résultat pour « ${recherche} »` : "Aucun sapeur" }}
            </li>
          </ul>
        </div>
      </div>
      <div class="col-12 col-sm-9 custom-scroll-column">
        <div class="card card-primary card-outline mb-3 d-sm-none">
          <div class="card-header d-flex flex-column gap-2">
            <h5 class="card-title mb-0">Effectif</h5>
            <div v-if="hasEditPermission" class="d-flex gap-2">
              <button type="button" class="btn btn-primary flex-fill" @click="addSapeur">
                <font-awesome-icon :icon="['fas', 'plus']" />
                Ajouter
              </button>
              <button
                type="button"
                title="Lien d'inscription recrues"
                class="btn btn-outline-secondary flex-fill"
                @click="lienInscription"
              >
                <font-awesome-icon :icon="['fas', 'link']" />
                Lien recrues
              </button>
            </div>
            <label for="recherche-sapeur-mobile" class="visually-hidden"
              >Rechercher un sapeur</label
            >
            <div class="input-group">
              <input
                id="recherche-sapeur-mobile"
                v-model="recherche"
                type="search"
                class="form-control"
                placeholder="Rechercher : nom, localité, fonction…"
              />
              <span class="input-group-text" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
              </span>
            </div>
            <base-radio
              v-model="typeFilter"
              class="w-100"
              button-style
              size="sm"
              label="Type"
              :options="typeFilterOptions"
            />
            <base-radio
              v-if="typeFilter !== 'recrue'"
              v-model="filter"
              class="w-100"
              button-style
              size="sm"
              label="Statut"
              :options="actifFilterOptions"
            />
          </div>
          <base-select
            base-option="&lt;Sapeur&gt;"
            :options="filteredSapeurs"
            display-key="nom_prenom"
            :model-value="activeSapeurId"
            @update:model-value="(value) => selectSapeur(value)"
          />
          <!-- <li v-if="filteredSapeurs.length === 0" class="list-group-item">
              Aucun sapeur
            </li> -->
        </div>
        <!-- Même indicateur que base-table pendant le chargement -->
        <section
          v-if="chargementSapeur"
          class="card card-primary card-outline mb-3"
          aria-busy="true"
        >
          <div
            class="card-body en-tete-chargement d-flex justify-content-center align-items-center"
          >
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement du sapeur…</span>
            </div>
          </div>
        </section>
        <div
          v-else-if="erreurChargement"
          class="alert alert-danger d-flex flex-wrap align-items-center gap-2 mb-3"
          role="alert"
        >
          Impossible de charger ce sapeur.
          <button
            type="button"
            class="btn btn-sm btn-outline-danger"
            @click="chargerSapeur(sapeurStore.active.id)"
          >
            Réessayer
          </button>
        </div>
        <section
          v-else-if="enTete"
          class="card card-primary card-outline mb-3"
          aria-labelledby="fiche-sapeur-nom"
        >
          <div class="card-body d-flex flex-wrap align-items-center gap-3">
            <div class="identite-sapeur d-flex flex-column gap-1">
              <div class="d-flex flex-wrap align-items-center gap-2">
                <h4 id="fiche-sapeur-nom" class="mb-0">{{ enTete.nomPrenom }}</h4>
                <span
                  v-if="!isRecrue"
                  class="badge"
                  :class="activeSapeur.actif ? 'text-bg-success' : 'text-bg-secondary'"
                >
                  {{ activeSapeur.actif ? "Actif" : "Inactif" }}
                </span>
                <span class="badge" :class="isRecrue ? 'text-bg-warning' : 'text-bg-light border'">
                  {{ isRecrue ? "Recrue à valider" : enTete.type }}
                </span>
              </div>
              <div v-if="enTete.details" class="text-body-secondary">{{ enTete.details }}</div>
              <div
                v-if="telephonesEnTete.length || activeSapeur.email"
                class="d-flex flex-wrap column-gap-3 row-gap-1 small"
              >
                <a
                  v-for="t in telephonesEnTete"
                  :key="t.id"
                  :href="t.href"
                  class="text-decoration-none"
                >
                  <font-awesome-icon :icon="['fas', 'phone']" />
                  {{ t.numero }}
                  <span v-if="t.type" class="text-body-secondary">({{ t.type }})</span>
                </a>
                <a
                  v-if="activeSapeur.email"
                  :href="`mailto:${activeSapeur.email}`"
                  class="text-decoration-none"
                >
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                  {{ activeSapeur.email }}
                </a>
              </div>
              <!-- Toujours sur sa propre ligne, sous les numéros -->
              <div v-if="enTete.adresse" class="small">
                <font-awesome-icon :icon="['fas', 'location-dot']" />
                {{ enTete.adresse }}
              </div>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
              <button
                v-if="!isRecrue"
                type="button"
                class="btn btn-outline-primary"
                @click="ficheSapeur"
              >
                <font-awesome-icon :icon="['fas', 'id-card-clip']" />
                Fiche sapeur
              </button>
              <button
                v-if="isRecrue && hasEditPermission"
                type="button"
                class="btn btn-success"
                @click="validerRecrue"
              >
                <font-awesome-icon icon="check" />
                Valider la recrue
              </button>
              <template v-if="hasEditPermission">
                <div class="d-none d-md-block"></div>
                <button
                  :disabled="isSubmitting"
                  type="button"
                  class="btn btn-outline-danger"
                  @click="deleteSapeur"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                  {{ isRecrue ? "Rejeter la recrue" : "Supprimer" }}
                </button>
              </template>
            </div>
          </div>
        </section>
        <base-navigation-tab
          v-if="activeSapeur?.id"
          :routes="
            routes
              .filter(
                (route) =>
                  (activeSapeur.type === TYPE_CIVIL && route.civil) ||
                  (activeSapeur.type === TYPE_RECRUE && route.recrue) ||
                  activeSapeur.type === TYPE_SAPEUR,
              )
              .map((r) => ({
                ...r,
                to: { ...r.to, params: { id: activeSapeurId } },
              }))
          "
        />
        <div id="nav-tabContent" class="tab-content">
          <div id="tab-sapeur-details" class="tab-pane fade show active">
            <div class="row">
              <div v-if="activeSapeur?.id" class="col-12">
                <!-- Pas de placeholder ici : les onglets (base-table) affichent leur propre chargement.
                     En cas d'erreur, on masque l'onglet (v-show : il reste monté) pour ne pas
                     laisser les données du sapeur précédent. -->
                <div v-show="!erreurChargement">
                  <router-view />
                </div>
              </div>
              <div v-else class="col-12">
                <div class="card">
                  <div class="card-body">Commencez par ajouter un sapeur</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins/utilities";
@import "bootstrap/scss/mixins/breakpoints";

// Hauteur proche de celle de l'en-tête chargé : les onglets ne sautent pas à l'affichage
.en-tete-chargement {
  min-height: 6rem;
}

// Prend la place restante ; les actions passent dessous sur écran étroit
.identite-sapeur {
  flex: 1 1 16rem;
  min-width: 0;
}

#liste-sapeurs {
  a {
    padding: 0.25rem 0.75rem;
  }
}

@include media-breakpoint-up(md) {
  .custom-container {
    display: flex;
    flex-flow: column;
    overflow: hidden;
  }

  .nested-container {
    overflow: hidden;
  }

  .custom-scroll-column {
    height: 100%;
    overflow-y: scroll;
  }
}
</style>

<script setup>
import { useModalStore } from "../stores/common/Modal";
import { useLocaliteStore } from "../stores/common/Localite.js";
import { useBaseDataStore } from "../stores/common/BaseData.js";
import { useGroupeStore } from "../stores/groupe/Groupe.js";
import { useFonctionStore } from "../stores/sapeur/Fonction";
import { useGradeStore } from "../stores/sapeur/Grade";
import permissions from "../composables/permissions.js";

import SapeurService from "../services/SapeurService.js";
import { DateTime } from "luxon";
import { downloadOutlookCsv, downloadVcard } from "../tools/exportSapeurs";
import { computed, ref } from "vue";
import useNotification from "../composables/useNotification.js";
import useHasPermission from "../composables/usePermission.js";

const localiteStore = useLocaliteStore();
const baseDataStore = useBaseDataStore();
const groupeStore = useGroupeStore();
const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();

const loadLocalites = localiteStore.fetchLocalites();
const loadCivilites = baseDataStore.fetchCivilites();
const loadGrades = gradeStore.fetchGrades();
const loadFonctions = fonctionStore.fetchFonctions();
const loadGroupes = groupeStore.fetchGroupes();

await Promise.all([loadLocalites, loadCivilites, loadFonctions, loadGrades, loadGroupes]);

const loading = ref(true);
const selectedId = ref(null);
const sapeurs = ref([]);

const localites = computed(() =>
  localiteStore.liste.slice().sort((a, b) => a.designation.localeCompare(b.designation)),
);
const civilites = computed(() => baseDataStore.civilites);
const groupes = computed(() => groupeStore.liste);
const fonctions = computed(() => fonctionStore.liste.filter((f) => f.actif));
const grades = computed(() => gradeStore.liste);
const hasSapeurModificationPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);
const hasSmsEnvoiePermission = useHasPermission(permissions.SMS.ENVOIE);
const hasExerciceModificationPermission = useHasPermission(permissions.EXERCICE.MODIFICATION);

const computedData = computed(() => {
  const idReducer = (map, e) => {
    map.set(e.id, e);
    return map;
  };

  const indexedLocalite = localites.value.reduce(idReducer, new Map());
  const indexedGrades = grades.value.reduce(idReducer, new Map());
  const indexedFonctions = fonctions.value.reduce(idReducer, new Map());
  const indexedGroupes = groupes.value.reduce(idReducer, new Map());

  const porteurIds = new Set(
    fonctions.value.filter((f) => f.nom.toLowerCase().includes("porteur")).map((f) => f.id),
  );
  const b_id = 3;
  const c1_id = 6;
  const c1_118_id = 7;

  return sapeurs.value
    .map((s) => ({
      ...s,
      porteur: s.fonctions
        .map((f) => porteurIds.has(f.fonction_id))
        .reduce((acc, e) => acc || e, false),
      b: s.permis.find((p) => p.permis_type_id == b_id) != undefined,
      c1: s.permis.find((p) => p.permis_type_id == c1_id) != undefined,
      c1_118: s.permis.find((p) => p.permis_type_id == c1_118_id) != undefined,
      fonctions: s.fonctions.filter(
        (f) => f.fin == null || DateTime.fromSQL(f.fin).diff(DateTime.now()) >= 0,
      ),
      fonction: indexedFonctions.get(s.fonction_id)?.nom || "",
      localite: indexedLocalite.get(s.localite_id)?.designation || "",
      fonction_tri: indexedFonctions.get(s.fonction_id)?.tri || 0,
      grade: indexedGrades.get(s.grade_id)?.designation || "",
      grade_tri: indexedGrades.get(s.grade_id)?.tri || 0,
      tel_1: s.telephones.length > 0 ? s.telephones[0].numero : "",
      tel_2: s.telephones.length > 1 ? s.telephones[1].numero : "",
      tel_3: s.telephones.length > 2 ? s.telephones[2].numero : "",
      rta_1: s.telephones.length > 0 ? s.telephones[0].rta : false,
      rta_2: s.telephones.length > 1 ? s.telephones[1].rta : false,
      rta_3: s.telephones.length > 2 ? s.telephones[2].rta : false,
      groupes: s.groupes,
      formatedGroupes: s.groupes
        .map((g) => indexedGroupes.get(g.groupe_id))
        .sort((a, b) => a.no - b.no)
        .filter((g) => g.type)
        .map((g) => g.no)
        .filter((g) => g)
        .join(", "),
    }))
    .sort((a, b) => b.fonction_tri - a.fonction_tri);
});
const filteredLocalites = computed(() => {
  const ids = new Set(sapeurs.value.map((s) => parseInt(s.localite_id)));
  return localites.value.filter((t) => ids.has(t.id));
});
const filteredFonctions = computed(() => {
  const ids = new Set(
    sapeurs.value
      .map((s) => s.fonctions.map((f) => parseInt(f.fonction_id)))
      .reduce((acc, e) => [...acc, ...e], []),
  );
  return fonctions.value.filter((e) => ids.has(e.id));
});
const filteredGrades = computed(() => {
  const ids = new Set(sapeurs.value.map((s) => parseInt(s.grade_id)));
  return grades.value.filter((t) => ids.has(t.id));
});
const filteredGroupes = computed(() => {
  const ids = new Set(
    sapeurs.value
      .map((s) => s.groupes.map((f) => f.groupe_id))
      .reduce((acc, e) => [...acc, ...e], []),
  );
  return groupes.value
    .filter((t) => ids.has(t.id))
    .map((e) => ({
      ...e,
      label: (e.no ? e.no + " " : "") + e.designation,
    }));
});

SapeurService.getEffectif().then((effectif) => {
  sapeurs.value = effectif.map((s) => ({
    ...s,
    nom_prenom: `${s.nom} ${s.prenom}`,
  }));
  loading.value = false;
});

const { showModal, closeModal } = useModalStore();
const awn = useNotification();

const selectSapeur = (id) => (selectedId.value = id);

const trombinoscope = () => {
  showModal({ component: "ModalChargement" });

  SapeurService.downloadTrombinoscope("trombinoscope.pdf")
    .then(closeModal)
    .catch((err) => {
      closeModal();
      awn.alert(err?.message || "Une erreur a eu lieu durant la génération du trombinoscope");
    });
};
const listeFssp = () =>
  showModal({
    component: "ModalListeFssp",
  });
const listeFoad = () =>
  showModal({
    component: "ModalListeFoad",
  });
const sms = (sapeurs) => {
  if (!hasSmsEnvoiePermission.value) {
    awn.alert("Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS");
    return;
  }
  showModal({
    component: "ModalSms",
    size: 1,
    data: sapeurs,
  });
};
const vcard = (sapeurs) => downloadVcard(sapeurs, localites.value);
const outlookCsv = (sapeurs) => downloadOutlookCsv(sapeurs, localites.value);

const fieldsBase = [
  { title: "Nom Prénom", key: "nom_prenom" },
  {
    title: "Fonction principale",
    key: "fonction",
    sortKey: "fonction_tri",
  },
  { title: "Localité", key: "localite" },
  { title: "Année d'incorporation", key: "annee_incorporation" },
  { title: "PAR", key: "porteur", type: Boolean },
  { title: "B", key: "b", type: Boolean },
  { title: "C1", key: "c1", type: Boolean },
  { title: "C1 118", key: "c1_118", type: Boolean },
  { title: "Grade", key: "grade", sortKey: "grade_tri" },
  { title: "Groupes", key: "formatedGroupes" },
  {
    title: "Tel n°1",
    key: "rta_1",
    labelKey: "tel_1",
    type: Boolean,
  },
  {
    title: "Tel n°2",
    key: "rta_2",
    labelKey: "tel_2",
    type: Boolean,
  },
  {
    title: "Tel n°3",
    key: "rta_3",
    labelKey: "tel_3",
    type: Boolean,
  },
  { title: "Naissance", key: "date_naissance", type: Date },
  {
    title: "Actions",
    slot: "actions",
    titleClass: "align-middle text-center",
    columnClass: "align-middle text-center",
  },
];
</script>

<template>
  <stateful-filter
    id="effectif"
    v-slot="{ setFilter, filters, filteredData, canReset, reset }"
    :data="computedData"
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-3">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'accueil' }">Accueil</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Effectif</li>
            </ol>
          </nav>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Actions</h5>
            </div>
            <div class="card-body d-grid gap-2">
              <button class="btn btn-outline-primary" @click="vcard(filteredData)">
                VCard tous
              </button>
              <!-- <button
                class="btn btn-outline-primary"
                @click="outlookCsv(filteredData)"
              >
                CSV Outlook, TODO: caldav server
              </button> -->
              <a
                :disabled="filteredData.length == 0"
                :href="
                  'mailto:?bcc=' +
                  filteredData
                    .map((s) => s.email)
                    .filter((s) => s && s != null)
                    .join(';')
                "
                class="btn btn-outline-primary"
                >Email groupé</a
              >
              <button
                v-if="hasExerciceModificationPermission"
                class="btn btn-outline-primary"
                @click="sms(filteredData)"
              >
                SMS
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Impression</h5>
            </div>
            <div class="card-body d-grid gap-2">
              <button class="btn btn-outline-primary" @click="listeFssp">Liste FSSP</button>
              <button class="btn btn-outline-primary" @click="listeFoad">Liste FOAD</button>
              <button class="btn btn-outline-primary" @click="trombinoscope">Trombinoscope</button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h5>Filtres</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredLocalites"
                  base-option="<Localité>"
                  :model-value="filters.localite_id"
                  @update:model-value="(value) => setFilter('localite_id', value)"
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredFonctions"
                  display-key="nom"
                  base-option="<Fonction>"
                  :model-value="filters.fonctions"
                  @update:model-value="
                    (value) =>
                      setFilter(
                        'fonctions',
                        parseInt(value)
                          ? (fonctions) =>
                              fonctions.find((f) => f.fonction_id == value) != undefined
                          : null,
                      )
                  "
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="civilites"
                  base-option="<Civilité>"
                  :model-value="filters.civilite_id"
                  @update:model-value="(value) => setFilter('civilite_id', value)"
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredGrades"
                  base-option="<Grade>"
                  :model-value="filters.grade_id"
                  @update:model-value="(value) => setFilter('grade_id', value)"
                />
                <base-select
                  class="col-md-6 mb-1"
                  :options="filteredGroupes"
                  display-key="label"
                  base-option="<Groupe>"
                  :model-value="filters.groupes"
                  @update:model-value="
                    (value) =>
                      setFilter(
                        'groupes',
                        parseInt(value)
                          ? (groupes) => groupes.find((f) => f.groupe_id == value) != undefined
                          : undefined,
                      )
                  "
                />
                <div v-if="canReset" class="col-md-6">
                  <button class="btn btn-sm btn-warning w-100" @click="reset">Réinitialiser</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <div class="card card-primary card-outline mb-3">
            <div class="card-body table-responsive p-0">
              <base-table
                :loading="loading"
                :selectable="true"
                :fields="fieldsBase"
                no-data="Aucun sapeur à afficher"
                :data="filteredData"
                @selected="selectSapeur"
              >
                <template #foot>
                  <tr>
                    <th :colspan="fieldsBase.length">
                      Nombre sapeurs : {{ filteredData.length }} /
                      {{ computedData.length }}
                    </th>
                  </tr>
                </template>
                <template #actions="{ rowData }">
                  <router-link
                    v-if="hasSapeurModificationPermission"
                    v-slot="{ navigate }"
                    :to="{ name: 'sapeur-details', params: { id: rowData.id } }"
                    custom
                  >
                    <button class="btn btn-outline-primary border-0" @click="navigate">
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                  </router-link>
                  <a class="btn btn-outline-primary border-0" :href="'mailto:' + rowData.email">
                    <font-awesome-icon :icon="['fas', 'envelope']" />
                  </a>
                  <button class="btn btn-outline-primary border-0" @click="vcard([rowData])">
                    <font-awesome-icon :icon="['far', 'address-card']" />
                  </button>
                </template>
              </base-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </stateful-filter>
</template>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}

table a.btn {
  padding-top: 0;
  padding-bottom: 0;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>

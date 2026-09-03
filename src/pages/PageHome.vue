<script setup>
import { computed, onUnmounted, ref } from "vue";
import useNotification from "../composables/useNotification.js";
import { useAuthStore } from "../stores/auth/Auth.js";
import { useModalStore } from "../stores/common/Modal.js";
import { useMesInfosStore } from "../stores/mesinfos/MesInfos.js";
import { useLocaliteStore } from "../stores/common/Localite.js";
import MesInfosService from "../services/MesInfosService.js";
import ExcuseTypeService from "../services/ExcuseTypeService.js";
import ExcuseParamService from "../services/ExcuseParamService.js";
import ExerciceService from "../services/ExerciceService.js";

const authStore = useAuthStore();
const infosStore = useMesInfosStore();
const localiteStore = useLocaliteStore();
const { showModal, confirm } = useModalStore();

const disableCounter = ref(0);
const disableInterval = ref(null);
const resendCounter = ref(0);
const resendInterval = ref(null);

const listeSis = computed(() => authStore.sis.liste);
const validated = computed(() => authStore.validated);
const availableSisListe = computed(() => authStore.availableSisListe);

const awn = useNotification();

if (listeSis.value.length <= 0) {
  await authStore.loadSisListe();
}

if (!authStore.sis.activeId && availableSisListe.value.length > 0) {
  await authStore.selectSis(availableSisListe.value[0]);
}

await localiteStore.fetchLocalites();

const isSapeur = computed(() => Object.keys(authStore.sis.sapeurs ?? {}).length > 0);

const prochainesConvocationsLoading = ref(isSapeur.value);
const prochainesConvocationsParSis = ref({});
// Types d'excuse et paramètres d'excuse dépendent du SIS : chaque exercice affiché peut appartenir
// à un SIS différent du SIS actif, donc on les charge explicitement par SIS plutôt que via les stores.
const excuseTypesParSis = ref({});
const excuseParamsParSis = ref({});

const fetchProchainesConvocations = () => {
  prochainesConvocationsLoading.value = true;
  return MesInfosService.getMesProchainesConvocations()
    .then((data) => {
      prochainesConvocationsParSis.value = data;
      Object.keys(data).forEach((sisKey) => {
        if (!(sisKey in excuseTypesParSis.value)) {
          ExcuseTypeService.getExcuses(sisKey).then((liste) => {
            excuseTypesParSis.value = { ...excuseTypesParSis.value, [sisKey]: liste };
          });
        }
        if (!(sisKey in excuseParamsParSis.value)) {
          ExcuseParamService.getParams(sisKey).then((params) => {
            excuseParamsParSis.value = { ...excuseParamsParSis.value, [sisKey]: params };
          });
        }
      });
    })
    .catch(() => {
      prochainesConvocationsParSis.value = {};
    })
    .finally(() => {
      prochainesConvocationsLoading.value = false;
    });
};

if (isSapeur.value) {
  fetchProchainesConvocations();
}

// Liste complète (passé + futur), pour la modale "S'excuser" : on doit pouvoir s'excuser sur un
// exercice déjà passé si les conditions du SIS (délai d'excuse) le permettent encore.
const prochainesConvocations = computed(() =>
  Object.entries(prochainesConvocationsParSis.value)
    .flatMap(([sisKey, convocations]) =>
      convocations.map((exercice) => ({
        ...exercice.presence,
        ...exercice,
        categorie: exercice.categorie?.designation,
        localite: localiteStore.liste.find((l) => l.id == exercice.localite_id)?.designation,
        sis_key: sisKey,
        sis_nom: listeSis.value.find((s) => s.api_key === sisKey)?.nom,
        excuse: excuseTypesParSis.value[sisKey]?.find(
          (t) => t.id == exercice.presence?.excuse_type_id,
        )?.designation,
      })),
    )
    .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
);

// Le tableau ne montre que les exercices à venir ; le passé reste accessible via la modale "S'excuser".
const debutAujourdhui = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const convocationsAVenir = computed(() =>
  prochainesConvocations.value.filter(
    (exercice) => !exercice.date || new Date(exercice.date) >= debutAujourdhui(),
  ),
);

// N'affiche le nom du SIS que si le sapeur a un profil sapeur dans plusieurs SIS.
const sapeurDansPlusieursSis = computed(() => Object.keys(authStore.sis.sapeurs ?? {}).length > 1);

onUnmounted(() => {
  if (disableInterval.value != null) {
    clearInterval(disableInterval.value);
    disableInterval.value = null;
  }
  if (resendInterval.value != null) {
    clearInterval(resendInterval.value);
    resendInterval.value = null;
  }
});

const refresh = () => {
  authStore.refreshToken().then(() => {
    if (!validated.value) {
      awn.warning("Votre compte n'est toujours pas validé !");
      disableCounter.value = 5;
      disableInterval.value = setInterval(() => {
        disableCounter.value--;
        if (disableCounter.value <= 0) {
          clearInterval(disableInterval.value);
          disableInterval.value = null;
        }
      }, 1000);
    }
  });
};
const resend = () => {
  const callback = () => {
    resendCounter.value = 30;
    resendInterval.value = setInterval(() => {
      resendCounter.value--;
      if (resendCounter.value <= 0) {
        clearInterval(resendInterval.value);
        resendInterval.value = null;
      }
    }, 1000);
  };
  authStore
    .resendValidationEmail()
    .then((res) => {
      awn.success(res?.message ?? "Un nouvel email vous a été envoyé, controllez votre boîte mail");
      callback();
    })
    .catch((err) => {
      awn.alert(err?.error ?? "Une erreur a eu lieu durant le renvoie de l'email de confirmation");
      callback();
    });
};

// Le bouton principal "S'excuser" (sans ligne précise) doit être visible dès qu'au moins un SIS
// affiché autorise les excuses, même si ce n'est pas le cas de tous.
const peutSExcuser = computed(() => Object.values(excuseParamsParSis.value).some((p) => p?.actif));

// Utilisés par la carte mobile pour savoir si la section excuse a quelque chose à afficher.
const peutAjouterExcuse = (exercice) =>
  !!(
    excuseParamsParSis.value[exercice.sis_key]?.actif &&
    excuseTypesParSis.value[exercice.sis_key] &&
    exercice.convoque &&
    !exercice.excuse_type_id &&
    exercice.statut != 0
  );
const peutRetirerExcuse = (exercice) =>
  !!(
    excuseParamsParSis.value[exercice.sis_key]?.actif &&
    exercice.excuse_type_id &&
    exercice.statut != 0
  );

const addExcuse = (rowData = {}) => {
  showModal({
    component: "ModalSExcuser",
    data: {
      // Liste complète, tous SIS confondus : ModalSExcuser choisit le bon SIS/types d'excuse
      // selon l'exercice sélectionné dans son select.
      exercices: prochainesConvocations.value,
      exerciceId: rowData.exercice_id,
      sisKey: rowData.sis_key,
      excuseTypesBySis: excuseTypesParSis.value,
      excuseParamsBySis: excuseParamsParSis.value,
    },
    callback: fetchProchainesConvocations,
  });
};

const removeExcuse = (rowData) =>
  confirm(
    "Voulez-vous vraiment supprimer votre excuse ?",
    "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
  ).then(() =>
    infosStore
      .removeMonExcuse(rowData, rowData.sis_key)
      .then(() => {
        awn.success("Excuse supprimée avec succès");
        fetchProchainesConvocations();
      })
      .catch((err) => awn.alert(err?.message ?? "Impossible de supprimer l'excuse")),
  );

const downloadJustificatif = (rowData) => {
  ExerciceService.downloadMonExcuseJustificatif(
    rowData.exercice_id,
    "justificatif.pdf",
    rowData.sis_key,
  ).catch((err) => awn.alert(err?.message ?? "Erreur lors du chargement du justificatif"));
};

const prochainesConvocationsFields = computed(() =>
  [
    { title: "Date", key: "date", type: Date },
    { title: "Categorie", key: "categorie" },
    { title: "Heure", key: "heure", formatter: (h) => h?.slice(0, 5) },
    sapeurDansPlusieursSis.value ? { title: "SIS", key: "sis_nom" } : null,
    { title: "Désignation", key: "designation" },
    { title: "Communications", key: "communications" },
    { title: "Localité", key: "localite" },
    { title: "Lieu", key: "lieu" },
    { title: "", slot: "pour-info" },
    { title: "Excuse", slot: "excuse" },
  ].filter(Boolean),
);

// Format court utilisé dans les cartes mobiles, ex. "mardi 18 sept."
const formatDateCourte = (date) =>
  date
    ? new Date(date).toLocaleDateString("fr-CH", {
        weekday: "long",
        day: "numeric",
        month: "short",
      })
    : "";

// Ajouté mais pas convoqué : simple information, mis en évidence pour ne pas le confondre avec une convocation.
const onRowClass = (rowData) => (rowData.convoque ? "" : "table-warning");
</script>

<template>
  <div class="container">
    <div class="row text-muted">
      <div class="col-12 mt-3">
        <p>Bienvenue {{ authStore.user?.name }}</p>
      </div>
      <div v-if="!validated" class="col-12">
        <div class="alert alert-warning" role="alert">
          Attention, votre compte n'est pas encore validé, veuillez cliquer sur le lien reçu dans
          votre boîte mail pour activer votre compte.
          <br />
          <button class="btn btn-secondary mt-2" :disabled="disableCounter > 0" @click="refresh">
            Rafraichir
            <em v-if="disableCounter > 0">[Réessayer dans {{ disableCounter }} s]</em>
          </button>
          <button
            class="btn btn-secondary mt-2 ms-2"
            :disabled="disableCounter > 0"
            @click="resend"
          >
            Renvoyer l'email
            <em v-if="resendCounter > 0">[Réessayer dans {{ resendCounter }} s]</em>
          </button>
        </div>
      </div>

      <div v-if="availableSisListe.length <= 0" class="card col-md-3 col-sm-6 col-xs-12">
        <div class="align-vertical">
          <p v-if="!validated">
            Vous devez valider votre compte afin de pouvoir obtenir des droits depuis votre SIS.
          </p>
          <p v-else>Vous n'avez actuellement aucun droit, demandez des droits à votre SIS.</p>
        </div>
      </div>
    </div>
    <div v-if="peutSExcuser" class="row">
      <div class="col-12 mb-3">
        <button class="btn btn-primary p-3" @click="addExcuse()">
          S'excuser<br /><em>pour 1 événement</em>
        </button>
        <!-- <button class="btn btn-primary p-3 ms-2">Signaler une absence<br /><em>plusieurs jours</em></button> -->
      </div>
    </div>
    <div v-if="isSapeur" class="row">
      <div class="col-12">
        <div class="card card-primary">
          <div
            class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2"
          >
            <h2 class="fs-4 mb-0">Vos prochaines convocations</h2>
            <button
              class="btn btn-outline-primary"
              type="button"
              @click="showModal('ModalCalendarLinks')"
            >
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
              S'abonner à mon agenda
            </button>
          </div>
          <div class="card-body table-responsive p-0 d-none d-md-block">
            <base-table
              class="table-striped"
              :loading="prochainesConvocationsLoading"
              :fields="prochainesConvocationsFields"
              :data="convocationsAVenir"
              :row-class="onRowClass"
              :hide-download="true"
              no-data="Aucun exercice à venir"
            >
              <template #pour-info="{ rowData }">
                <span v-if="!rowData.convoque" class="badge text-bg-warning">Pour info</span>
              </template>
              <template #excuse="{ rowData }">
                <span
                  v-if="rowData.excuse_type_id"
                  class="badge rounded-pill text-bg-primary"
                  :class="{
                    'text-bg-danger': rowData.excuse_statut == -1,
                    'text-bg-secondary': rowData.excuse_statut == 0,
                    'text-bg-success': rowData.excuse_statut == 1,
                  }"
                  >{{ rowData.excuse }}</span
                >
                <button
                  v-if="rowData.justificatif_filename"
                  class="btn"
                  @click="downloadJustificatif(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
                <button
                  v-if="
                    excuseParamsParSis[rowData.sis_key]?.actif &&
                    excuseTypesParSis[rowData.sis_key] &&
                    rowData.convoque &&
                    !rowData.excuse_type_id &&
                    rowData.statut != 0
                  "
                  class="btn btn-outline-primary border-0"
                  @click="addExcuse(rowData)"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
                <button
                  v-else-if="
                    excuseParamsParSis[rowData.sis_key]?.actif &&
                    rowData.excuse_type_id &&
                    rowData.statut != 0
                  "
                  class="btn btn-outline-danger border-0"
                  @click="removeExcuse(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
            </base-table>
          </div>

          <!-- Mobile : liste de cartes plutôt qu'un tableau exigu -->
          <div class="card-body p-0 d-md-none">
            <div v-if="prochainesConvocationsLoading" class="p-3 d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>
            <p v-else-if="!convocationsAVenir.length" class="p-3 mb-0 text-muted">
              Aucun exercice à venir
            </p>
            <div v-else class="d-flex flex-column gap-2 p-2">
              <div
                v-for="exercice in convocationsAVenir"
                :key="exercice.sis_key + '-' + exercice.exercice_id"
                class="border rounded-3 p-3"
                :class="exercice.convoque ? 'bg-body' : 'border-warning-subtle bg-warning-subtle'"
              >
                <span v-if="!exercice.convoque" class="badge text-bg-warning mb-2">Pour info</span>
                <div
                  v-if="exercice.sis_nom && sapeurDansPlusieursSis"
                  class="small text-uppercase text-muted fw-semibold"
                >
                  {{ exercice.sis_nom }}
                </div>
                <div class="fw-bold mt-1">
                  <font-awesome-icon :icon="['far', 'calendar-alt']" />
                  {{ formatDateCourte(exercice.date) }}
                  <span v-if="exercice.heure" class="text-muted fw-normal">
                    {{ exercice.heure.slice(0, 5) }}
                  </span>
                  <font-awesome-icon :icon="['fas', 'location-dot']" class="ms-2" />
                  <span v-if="exercice.localite || exercice.lieu" class="text-muted fw-normal">
                    {{ [exercice.localite, exercice.lieu].filter(Boolean).join(" · ") }}
                  </span>
                </div>
                <div
                  v-if="exercice.designation || exercice.categorie"
                  class="d-flex align-items-center gap-2 mt-1"
                >
                  <span v-if="exercice.categorie" class="badge text-bg-secondary">{{
                    exercice.categorie
                  }}</span>
                  <span v-if="exercice.designation">{{ exercice.designation }}</span>
                </div>
                <div v-if="exercice.communications" class="small text-muted mt-1">
                  {{ exercice.communications }}
                </div>
                <div
                  v-if="
                    exercice.excuse_type_id ||
                    exercice.justificatif_filename ||
                    peutAjouterExcuse(exercice) ||
                    peutRetirerExcuse(exercice)
                  "
                  class="mt-2 pt-2 border-top"
                >
                  <div
                    v-if="exercice.excuse_type_id || exercice.justificatif_filename"
                    class="mb-2"
                  >
                    <div class="d-flex align-items-center flex-wrap gap-2">
                      <span class="small text-muted mb-1">Excusé :</span>
                      <span
                        v-if="exercice.excuse_type_id"
                        class="badge rounded-pill text-bg-primary"
                        :class="{
                          'text-bg-danger': exercice.excuse_statut == -1,
                          'text-bg-secondary': exercice.excuse_statut == 0,
                          'text-bg-success': exercice.excuse_statut == 1,
                        }"
                        >{{ exercice.excuse }}</span
                      >
                      <button
                        v-if="exercice.justificatif_filename"
                        class="btn btn-sm btn-link p-0 text-decoration-none"
                        @click="downloadJustificatif(exercice)"
                      >
                        <font-awesome-icon :icon="['far', 'file-pdf']" />
                      </button>
                    </div>
                  </div>

                  <button
                    v-if="peutAjouterExcuse(exercice)"
                    class="btn btn-sm btn-outline-primary"
                    @click="addExcuse(exercice)"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" /> S'excuser
                  </button>
                  <button
                    v-else-if="peutRetirerExcuse(exercice)"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeExcuse(exercice)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" /> Retirer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

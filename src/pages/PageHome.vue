<script setup>
import { computed, onUnmounted, ref } from "vue";
import useNotification from "../composables/useNotification.js";
import { useAuthStore } from "../stores/auth/Auth.js";
import { useModalStore } from "../stores/common/Modal.js";
import { useMesInfosStore } from "../stores/mesinfos/MesInfos.js";
import MesInfosService from "../services/MesInfosService.js";
import ExcuseTypeService from "../services/ExcuseTypeService.js";
import ExcuseParamService from "../services/ExcuseParamService.js";
import ExerciceService from "../services/ExerciceService.js";

const authStore = useAuthStore();
const infosStore = useMesInfosStore();
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

const prochainesConvocations = computed(() =>
  Object.entries(prochainesConvocationsParSis.value)
    .flatMap(([sisKey, convocations]) =>
      convocations.map((exercice) => ({
        ...exercice.presence,
        ...exercice,
        categorie: exercice.categorie?.designation,
        sis_key: sisKey,
        sis_nom: listeSis.value.find((s) => s.api_key === sisKey)?.nom,
        excuse: excuseTypesParSis.value[sisKey]?.find(
          (t) => t.id == exercice.presence?.excuse_type_id,
        )?.designation,
      })),
    )
    .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
);

const prochainesConvocationsFields = [
  { title: "Date", key: "date", type: Date },
  { title: "Heure", key: "heure", formatter: (h) => h?.slice(0, 5) },
  { title: "SIS", key: "sis_nom" },
  { title: "Désignation", key: "designation" },
  { title: "Communications", key: "communications" },
  { title: "Lieu", key: "lieu" },
  { title: "", slot: "convoque" },
  { title: "Excuse", slot: "excuse" },
];

// Ajouté mais pas convoqué : simple information, mis en évidence pour ne pas le confondre avec une convocation.
const onRowClass = (rowData) => (rowData.convoque ? "" : "table-warning");

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
          <div class="card-header d-flex justify-content-between align-items-center">
            <h2>Vos prochaines convocations</h2>
            <button
              class="btn btn-outline-primary"
              type="button"
              @click="showModal('ModalCalendarLinks')"
            >
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
              S'abonner à mon agenda
            </button>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              class="table-striped"
              :loading="prochainesConvocationsLoading"
              :fields="prochainesConvocationsFields"
              :data="prochainesConvocations"
              :row-class="onRowClass"
              :hide-download="true"
              no-data="Aucun exercice à venir"
            >
              <template #convoque="{ rowData }">
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
                    !rowData.excuse_type_id &&
                    rowData.statut != 0
                  "
                  class="btn btn-outline-primary border-0"
                  @click="addExcuse(rowData)"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
                <button
                  v-else-if="excuseParamsParSis[rowData.sis_key]?.actif && rowData.statut != 0"
                  class="btn btn-outline-danger border-0"
                  @click="removeExcuse(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

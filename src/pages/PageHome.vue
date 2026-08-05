<script setup>
import { computed, onUnmounted, ref } from "vue";
import useNotification from "../composables/useNotification.js";
import { useAuthStore } from "../stores/auth/Auth.js";
import { useModalStore } from "../stores/common/Modal.js";
import MesInfosService from "../services/MesInfosService.js";

const authStore = useAuthStore();
const { showModal } = useModalStore();

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

const prochainsExercicesLoading = ref(isSapeur.value);
const prochainsExercicesParSis = ref({});
if (isSapeur.value) {
  MesInfosService.getMesProchainsExercices()
    .then((data) => {
      prochainsExercicesParSis.value = data;
    })
    .catch(() => {
      prochainsExercicesParSis.value = {};
    })
    .finally(() => {
      prochainsExercicesLoading.value = false;
    });
}

const prochainsExercices = computed(() =>
  Object.entries(prochainsExercicesParSis.value)
    .flatMap(([sisKey, exercices]) =>
      exercices.map((exercice) => ({
        ...exercice,
        sis_nom: listeSis.value.find((s) => s.api_key === sisKey)?.nom,
      })),
    )
    .sort((e1, e2) => e1.date?.localeCompare(e2.date)),
);

const prochainsExercicesFields = [
  { title: "Date", key: "date", type: Date },
  { title: "Heure", key: "heure", formatter: (h) => h?.slice(0, 5) },
  { title: "SIS", key: "sis_nom" },
  { title: "Désignation", key: "designation" },
  { title: "Lieu", key: "lieu" },
  { title: "", key: "convoque", slot: "convoque" },
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
              :loading="prochainsExercicesLoading"
              :fields="prochainsExercicesFields"
              :data="prochainsExercices"
              :row-class="onRowClass"
              :hide-download="true"
              no-data="Aucun exercice à venir"
            >
              <template #convoque="{ value }">
                <span v-if="!value" class="badge text-bg-warning">Pour info</span>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

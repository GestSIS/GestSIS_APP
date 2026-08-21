<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSmsStore } from "../stores/sms/Sms.js";
import { useExerciceComptableStore } from "../stores/comptabilite/ExerciceComptable.js";
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";

const smsStore = useSmsStore();
const exerciceComptableStore = useExerciceComptableStore();

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await smsStore.fetchSms(exerciceComptableStore.activeId);
  loading.value = false;
});

const smsListe = computed(() =>
  smsStore.liste.map((sms) => ({
    ...sms,
    numeros: sms.sms_numeros.map((s) => s.numero).join("; "),
  })),
);

const fields = [
  {
    title: "Programmé le",
    key: "date_envoie",
    titleClass: "align-middle",
    type: "datetime",
  },
  {
    title: "Envoyé le",
    key: "date_programme",
    titleClass: "align-middle",
    type: "datetime",
  },
  {
    title: "Message",
    key: "message",
    type: "multiline",
  },
  {
    title: "Numéros",
    key: "numeros",
    type: "multiline",
  },
];
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">SMS</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3>SMS envoyés</h3>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :loading="loading"
              :fields="fields"
              no-data="Aucun sms"
              :data="smsListe"
            ></base-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

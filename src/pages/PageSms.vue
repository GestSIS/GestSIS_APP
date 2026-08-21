<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSmsStore } from "../stores/sms/Sms.js";
import { useExerciceComptableStore } from "../stores/comptabilite/ExerciceComptable.js";
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";
import SmsListe from "/src/components/sms/SmsListe.vue";

const smsStore = useSmsStore();
const exerciceComptableStore = useExerciceComptableStore();

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await smsStore.fetchSms(exerciceComptableStore.activeId);
  loading.value = false;
});

const smsListe = computed(() => smsStore.liste);
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
            <sms-liste :loading="loading" :sms="smsListe" show-exercice />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSapeurStore } from "../stores/sapeur/Sapeur";
import { useModalStore } from "../stores/common/Modal";
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";
import PublipostageService from "/src/services/PublipostageService.js";

useSapeurStore().fetchListeSapeur();

const sapeurIds = ref([]);

const publipostage = () => PublipostageService.downloadExcel(sapeurIds.value);

const { showModal } = useModalStore();

const resetSelection = () => (sapeurIds.value = []);
const select = () => {
  showModal({
    component: "ModalSapeurSelect",
    size: 1,
    callback: (res) => {
      if (res) {
        sapeurIds.value = res.tous;
      }
      return Promise.resolve();
    },
    data: { ids: sapeurIds.value.slice(0) },
  });
};
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
            <li class="breadcrumb-item active" aria-current="page">Publipostage</li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Publipostage</h3>
      </div>
      <div class="card-body">
        <h5>Sélection des sapeurs</h5>
        <div class="input-group mb-3">
          <input
            type="text"
            disabled
            class="form-control"
            :value="
              sapeurIds.length <= 0
                ? 'Tous les sapeurs'
                : sapeurIds.length + ' sapeurs sélectionnés'
            "
            @click="select"
          />
          <button class="btn btn-outline-primary" @click="select">Sélection</button>
          <button
            v-if="sapeurIds.length > 0"
            class="btn btn-outline-danger"
            @click="resetSelection"
          >
            Réinitialiser
          </button>
        </div>
        <button class="btn btn-primary mb-2" @click="publipostage">
          <font-awesome-icon :icon="['fas', 'download']" /> Fichier Excel
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>

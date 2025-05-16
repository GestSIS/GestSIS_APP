<script setup>
import MesDonneesPerso from './MesDonneesPerso.vue';
import MesDonneesBancaires from './MesDonneesBancaires.vue';
import MesReferencesProfessionelles from './MesReferencesProfessionelles.vue';
import MesTelephones from './MesTelephones.vue';

import { computed, ref } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import { useStore } from 'vuex';

const store = useStore();
const infosStore = useMesInfosStore();

await Promise.all([
  infosStore.fetchMesInfos(),
  store.dispatch('fetchLocalites'),
  store.dispatch('fetchCivilites'),
  store.dispatch('fetchTelephoneTypes'),
  store.dispatch('fetchFonctions'),
  store.dispatch('fetchGrades'),
]);

const hasEditPermission = ref(false);

const sapeur = computed(() => infosStore.infos);
const fonctions = computed(() => store.state.fonction.liste);
const grades = computed(() => store.state.grade.liste);
const estSapeur = computed(() => {
  return sapeur.value.type == 0;
});
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <mes-donnees-perso v-model="sapeur" />
      <mes-donnees-bancaires v-model="sapeur" />
    </div>
    <div class="col-sm-12 col-xl-6">
      <mes-references-professionelles v-if="estSapeur" v-model="sapeur" />

      <div v-if="!estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Civil</h3>
          <button
            v-if="hasEditPermission"
            class="btn btn-primary"
            @click.prevent="saveNonSapeurStatut"
          >
            Enregistrer
          </button>
        </div>
        <form role="form">
          <div class="card-body">
            <div class="mb-3">
              <div class="form-check form-switch">
                <input
                  id="civilActif"
                  v-model="sapeur.actif"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="civilActif">Actif</label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <mes-telephones v-model="sapeur.telephones" :sapeur-type="sapeur.type" />

      <div v-if="estSapeur" class="card card-primary card-outline mb-3">
        <div class="card-header">
          <h3 class="card-title">Informations</h3>
        </div>
        <form role="form">
          <div class="card-body">
            <base-select
              v-model="sapeur.fonction_id"
              class="mb-3"
              label="Fonction principale"
              display-key="nom"
              :options="fonctions"
              disabled
            />
            <base-select
              v-model="sapeur.grade_id"
              class="mb-3"
              label="Grade actuel"
              :options="grades"
              disabled
            />
            <div class="mb-3 form-check">
              <input
                id="actif"
                v-model="sapeur.actif"
                type="checkbox"
                name="actif"
                class="form-check-input"
                disabled
                :true-value="1"
                :false-value="0"
              />
              <label for="actif">Actif</label>
              <font-awesome-icon
                v-if="hasEditPermission"
                v-tooltip.bottom="
                  'Pour désactiver un sapeur, utiliser l\'onglet Mutations !'
                "
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <!-- TODO Porteur checkbox -->
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

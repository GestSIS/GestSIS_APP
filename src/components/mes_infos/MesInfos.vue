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
          <h3 class="card-title">Politique</h3>
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
                  id="politiqueActif"
                  v-model="sapeur.actif"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="politiqueActif"
                  >Actif</label
                >
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

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

import MesDonneesPerso from '@/components/mes_infos/MesDonneesPerso.vue';
import MesDonneesBancaires from '@/components/mes_infos/MesDonneesBancaires.vue';
import MesReferencesProfessionelles from '@/components/mes_infos/MesReferencesProfessionelles.vue';
import MesTelephones from '@/components/mes_infos/MesTelephones.vue';

async function loadData(routeTo, next) {
  let loadMesInfos = store.dispatch('fetchMesInfos');
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadCivilites = store.dispatch('fetchCivilites');
  let loadTelephoneTypes = store.dispatch('fetchTelephoneTypes');
  let loadFonctions = store.dispatch('fetchFonctions');
  let loadGrades = store.dispatch('fetchGrades');

  Promise.all([
    loadMesInfos,
    loadLocalites,
    loadTelephoneTypes,
    loadCivilites,
    loadFonctions,
    loadGrades,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'MesInfos',
  components: {
    MesDonneesPerso,
    MesDonneesBancaires,
    MesReferencesProfessionelles,
    MesTelephones,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      sapeur: (state) => state.mesInfos.infos,
    }),
    estSapeur() {
      return this.sapeur.type == 0;
    },
  },
};
</script>

<style scoped></style>

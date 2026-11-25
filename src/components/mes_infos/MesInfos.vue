<script setup>
import MesDonneesPerso from "./MesDonneesPerso.vue";
import MesDonneesBancaires from "./MesDonneesBancaires.vue";
import MesReferencesProfessionelles from "./MesReferencesProfessionelles.vue";
import MesTelephones from "./MesTelephones.vue";

import { computed } from "vue";
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useGradeStore } from "../../stores/sapeur/Grade.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useBaseDataStore } from "../../stores/common/BaseData.js";
import { STATUT } from "../../tools/sapeur.js";

const fonctionStore = useFonctionStore();
const gradeStore = useGradeStore();
const localiteStore = useLocaliteStore();
const baseDataStore = useBaseDataStore();
const infosStore = useMesInfosStore();

await Promise.all([
  infosStore.fetchMesInfos(),
  localiteStore.fetchLocalites(),
  baseDataStore.fetchCivilites(),
  baseDataStore.fetchTelephoneTypes(),
  fonctionStore.fetchFonctions(),
  gradeStore.fetchGrades(),
]);

const sapeur = computed(() => infosStore.infos);
const fonctions = computed(() => fonctionStore.liste);
const grades = computed(() => gradeStore.liste);
// Est ou a été sapeur
const estSapeur = computed(() => sapeur.value.statut_sapeur !== STATUT.JAMAIS);
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-6">
      <mes-donnees-perso v-model="sapeur" />
      <mes-donnees-bancaires v-model="sapeur" />
    </div>
    <div class="col-sm-12 col-xl-6">
      <mes-references-professionelles v-if="estSapeur" v-model="sapeur" />

      <mes-telephones v-model="sapeur.telephones" :est-sapeur="estSapeur" />

      <base-card title="Informations" v-if="estSapeur">
        <template #body>
          <form role="form">
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
                :checked="sapeur.statut_sapeur === STATUT.ACTIF"
                type="checkbox"
                name="actif"
                class="form-check-input"
                disabled
              />
              <label for="actif">Actif</label>
              <font-awesome-icon
                v-if="hasEditPermission"
                v-tooltip.bottom="'Pour désactiver un sapeur, utiliser l\'onglet Mutations !'"
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
              <!-- TODO Porteur checkbox -->
            </div>
          </form>
        </template>
      </base-card>
    </div>
  </div>
</template>

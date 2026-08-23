<script setup>
import { computed, reactive, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useEmplacementStore } from "../../stores/materiel/Emplacement.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { indexedData } from "../../tools/index.js";
import MigrationMaterielService from "../../services/materiel/MigrationMaterielService.js";

// TEMPORAIRE : page de migration article-emplacement (véhicules/hangars).
// À supprimer une fois la migration des données existantes terminée.

const awn = useNotification();
const localiteStore = useLocaliteStore();
const emplacementStore = useEmplacementStore();
const materielTypeStore = useMaterielTypeStore();

await Promise.all([
  localiteStore.fetchLocalites(),
  emplacementStore.fetchEmplacements(),
  materielTypeStore.fetchMaterielTypes(),
]);

const indexedTypes = computed(() => indexedData(materielTypeStore.liste));

const emplacementsDisponibles = computed(() =>
  emplacementStore.liste.filter((e) => e.article_id === null),
);

// --- Emplacements sans hangar ---
const emplacementsSansHangar = ref([]);
const loadingHangars = ref(true);
const hangarForms = reactive({});

const loadEmplacementsSansHangar = async () => {
  loadingHangars.value = true;
  emplacementsSansHangar.value = await MigrationMaterielService.getEmplacementsSansHangar();
  emplacementsSansHangar.value.forEach((e) => {
    hangarForms[e.id] ??= { rue: "", no_rue: "", localite_id: null };
  });
  loadingHangars.value = false;
};
await loadEmplacementsSansHangar();

const transformerEnHangar = (emplacement) => {
  const form = hangarForms[emplacement.id];
  if (!form.localite_id) {
    awn.warning("Veuillez sélectionner une localité");
    return;
  }
  MigrationMaterielService.transformerEnHangar(emplacement.id, form)
    .then(loadEmplacementsSansHangar)
    .catch((err) => awn.alert(err.message || "Erreur lors de la transformation"));
};

// --- Véhicules sans emplacement ---
const vehiculesSansEmplacement = ref([]);
const loadingVehicules = ref(true);
const emplacementChoisi = reactive({});

const loadVehiculesSansEmplacement = async () => {
  loadingVehicules.value = true;
  vehiculesSansEmplacement.value = await MigrationMaterielService.getVehiculesSansEmplacement();
  loadingVehicules.value = false;
};
await loadVehiculesSansEmplacement();

const lierEmplacement = (article) => {
  const emplacementId = emplacementChoisi[article.id];
  if (!emplacementId) {
    awn.warning("Veuillez sélectionner un emplacement");
    return;
  }
  MigrationMaterielService.lierEmplacement(article.id, emplacementId)
    .then(() => {
      loadVehiculesSansEmplacement();
      emplacementStore.fetchEmplacements();
    })
    .catch((err) => awn.alert(err.message || "Erreur lors de la fusion"));
};
</script>

<template>
  <div class="row">
    <div class="col-12 mb-3">
      <div class="alert alert-warning">
        Page temporaire de migration des données véhicules/hangars, à retirer une fois la migration
        terminée.
      </div>
    </div>
    <div class="col-12 mb-4">
      <div class="card card-primary card-outline">
        <div class="card-header">
          <h3 class="card-title">Transformer un emplacement en hangar</h3>
        </div>
        <div class="card-body table-responsive p-0">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Emplacement</th>
                <th>Rue</th>
                <th>Numéro</th>
                <th>Localité</th>
                <th></th>
              </tr>
            </thead>
            <tbody v-if="!loadingHangars">
              <tr v-if="emplacementsSansHangar.length === 0">
                <td colspan="5">Aucun emplacement candidat.</td>
              </tr>
              <tr v-for="emplacement in emplacementsSansHangar" :key="emplacement.id">
                <td>{{ emplacement.designation }}</td>
                <td>
                  <input
                    v-model="hangarForms[emplacement.id].rue"
                    type="text"
                    class="form-control form-control-sm"
                  />
                </td>
                <td>
                  <input
                    v-model="hangarForms[emplacement.id].no_rue"
                    type="text"
                    class="form-control form-control-sm"
                  />
                </td>
                <td>
                  <base-select
                    v-model="hangarForms[emplacement.id].localite_id"
                    :options="localiteStore.liste"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="transformerEnHangar(emplacement)"
                  >
                    Transformer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header">
          <h3 class="card-title">Fusionner un véhicule avec un emplacement existant</h3>
        </div>
        <div class="card-body table-responsive p-0">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Type</th>
                <th>Emplacement existant à fusionner</th>
                <th></th>
              </tr>
            </thead>
            <tbody v-if="!loadingVehicules">
              <tr v-if="vehiculesSansEmplacement.length === 0">
                <td colspan="4">Aucun véhicule sans emplacement.</td>
              </tr>
              <tr v-for="article in vehiculesSansEmplacement" :key="article.id">
                <td>{{ article.designation }}</td>
                <td>{{ indexedTypes[article.materiel_type_id]?.designation }}</td>
                <td>
                  <base-select
                    v-model="emplacementChoisi[article.id]"
                    placeholder="<Sélectionnez un emplacement>"
                    :options="emplacementsDisponibles"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-primary"
                    @click="lierEmplacement(article)"
                  >
                    Fusionner
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

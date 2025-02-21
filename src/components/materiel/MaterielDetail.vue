<script setup>
import { computed, ref, watch } from 'vue';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import SapeurSansCompte from '../utilisateur/SapeurSansCompte.vue';
import { useStore } from 'vuex';
import { indexedData } from '../../tools';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const store = useStore();
const emplacementStore = useEmplacementStore();
const materielTypeStore = useMaterielTypeStore();

const articles = ref([]);
const loading = ref(true);

const loadArticles = async () => {
  loading.value = true;
  articles.value = await ArticleService.getParMaterielType(id);
  loading.value = false;
};

await Promise.all([
  emplacementStore.fetchEmplacements(),
  materielTypeStore.fetchMatPersoTypes(),
  store.dispatch('fetchListeSapeur'),
  Promise.resolve(await loadArticles()),
]);

watch(() => id, loadArticles);

const emplacements = computed(() => emplacementStore.liste);
const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id))
);

const formatEmptyString = (str) => (str === '' ? '-' : str);

// Partie pièces
const piecesColonnes = [
  { title: 'Numéro', key: 'numero' },
  { title: 'Emplacement', key: 'emplacement', slot: 'emplacement' },
  ...(materielType.value.est_taillee
    ? [{ title: 'Taille', key: 'taille' }]
    : []),
  { title: 'Compartiment', key: 'compartiment' },
  // { title: 'Inventaire', key: 'inventaire' },
  // { title: 'Maintenance', key: 'maintenance' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Ajouté', key: 'created_at', type: 'date' },
];

const indexedEmplacements = computed(() => indexedData(emplacements.value));
const indexedSapeurs = computed(() => indexedData(store.state.sapeur.liste));

const linearEmplacements = (emplacement_id) => {
  if (emplacement_id === null) {
    return [];
  }
  const emplacement = indexedEmplacements[emplacement_id];
  return [...linearEmplacements(emplacement.parent_id), emplacement];
};

const computedData = computed(() =>
  articles.value.map((a) => ({
    ...a,
    emplacements: linearEmplacements(a.emplacement_id),
    sapeur: indexedSapeurs.value[a.sapeur_id]?.nom_prenom ?? '',
  }))
);
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card mb-2">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="m-0">Description du matériel</h5>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="editMateriel(rowData.id)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-6">
              <div class="row">
                <div class="col-3">Nom</div>
                <div class="col-9">{{ materielType.designation }}</div>
              </div>
              <div class="row">
                <div class="col-3">Prix</div>
                <div class="col-9">{{ materielType.prix }}</div>
              </div>
              <div class="row">
                <div class="col-3">Fournisseur</div>
                <div class="col-9">
                  {{ formatEmptyString(materielType.fournisseur) }}
                </div>
              </div>
              <div class="row">
                <div class="col-3">Réparateur</div>
                <div class="col-9">
                  {{ formatEmptyString(materielType.reparateur) }}
                </div>
              </div>
              <div class="row">
                <div class="col-3">Remarque</div>
                <div class="col-9">
                  {{ formatEmptyString(materielType.remarque) }}
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="materielType.est_taillee"
                  id="flexCheckDefault"
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Est taillé
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="materielType.est_attribuable"
                  id="flexCheckDefault"
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Est attribuable
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="materielType.est_numerote"
                  id="flexCheckDefault"
                />
                <label class="form-check-label" for="flexCheckDefault">
                  Est numéroté
                </label>
              </div>
              <div class="row">
                <div class="col-3">
                  Préfixe
                  <font-awesome-icon
                    v-tooltip.bottom="{
                      content: 'Préfixe pour l\'étiquettage individuel',
                    }"
                    class="ms-1"
                    :icon="['far', 'question-circle']"
                  />
                </div>
                <div class="col-9">
                  <span v-if="materielType.est_numerote">{{
                    materielType.prefix === ''
                      ? 'Aucun préfixe'
                      : materielType.prefix
                  }}</span>
                  <span v-else>(Pas d'étiquettage individuel)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card mb-2">
        <div class="card-header">
          <h5 class="m-0">Pièces ({{ articles.length }})</h5>
        </div>
        <base-table
          :data="computedData"
          no-data="Aucune pièce"
          :fields="piecesColonnes"
        >
          <template #emplacement="{ rowData }">
            <div v-if="rowData.sapeur_id" class="badge bg-primary">
              {{ rowData.sapeur }}
            </div>
            <div v-else v-for="e in rowData.emplacements" :key="e.id">
              {{ e }}
            </div>
          </template>
        </base-table>
      </div>
    </div>
    <!-- <div class="col-12">
      <div class="card mb-2">
        <div class="card-header">TODO: Contrôle et maintenances</div>
      </div>
    </div> -->
  </div>
</template>

<style></style>

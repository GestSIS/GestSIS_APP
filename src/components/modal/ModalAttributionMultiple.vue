<script setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  ref,
  useTemplateRef,
} from 'vue';

import { useStore } from 'vuex';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import { indexedData } from '../../tools';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const awn = inject('awn');
const sapeur = useTemplateRef('sapeur');
onMounted(() => {
  sapeur.value.focus();
});

const errors = ref({});
const depuisInventaire = ref(true);
const activeAttribution = ref({
  date: new Date().toISOString().slice(0, 10),
  id: data?.id,
  quantite: data?.materiel?.quantite ?? null,
  sapeur_id: data?.sapeurId ?? null,
  articlesDepuisInventaire: [
    {
      id: null,
      materiel_type_id: null,
      emplacement_id: null,
      taille: null,
      remarque: null,
    },
  ],
  articlesHorsInventaire: [
    {
      materiel_type_id: null,
      taille: null,
      remarque: null,
    },
  ],
});

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const store = useStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  store.dispatch('fetchListeSapeur'),
]);

const types = computed(() => materielTypeStore.liste);
const indexedTypes = computed(() => indexedData(types.value));
const emplacements = computed(() => emplacementStore.liste);
const indexedEmplacements = computed(() => indexedData(emplacements.value));
const articles = ref(await ArticleService.getAttribuable());

// types des articles disponible
const typesDisponible = computed(() => {
  const ids = new Set(articles.value.map((a) => a.materiel_type_id));
  return types.value.filter((t) => ids.has(t.id));
});

const sapeurs = computed(() => store.state.sapeur.liste);

const save = async () => {
  if (!activeAttribution.value.sapeur_id) {
    awn.warning('Veuillez sélectionner un sapeur');
    return;
  }

  // // Masse attribution
  // const baseAttribution = {
  //   sapeur_id: activeAttribution.value.sapeur_id,
  //   date: activeAttribution.value.date,
  // };

  // const numerotes = depuisInventaire.value
  //   ? activeAttribution.value.articlesDepuisInventaire
  //   : activeAttribution.value.articlesHorsInventaire;

  // const attributions = [
  //   ...numerotes
  //     .filter((m) => m.materiel_type_id && m.numero)
  //     .map((m) => ({ ...baseAttribution, ...m, quantite: null })),

  //   ...activeAttribution.value.generiques
  //     .filter((m) => m.materiel_type_id && m.quantite > 0)
  //     .map((m) => ({ ...baseAttribution, ...m })),
  // ];

  // if (attributions.length == 0) {
  //   awn.warning('Aucun matériel saisi');
  //   return;
  // }
  // store
  //   .dispatch('attribuerMatPerso', {
  //     depuisInventaire: depuisInventaire.value,
  //     attributions,
  //   })
  //   .then(() => {
  //     errors = {};
  //     store.commit('HIDE_MODAL');
  //   })
  //   .catch((err) => (errors.value = err));
};
const close = () => {
  store.commit('HIDE_MODAL');
};

const refArticlesDepuisInventaire = useTemplateRef(`article-depuis-inventaire`);
const refArticlesHorsInventaire = useTemplateRef(`article-hors-inventaire`);
const addEmptyLine = () => {
  const data = computed(() =>
    depuisInventaire.value
      ? activeAttribution.value.articlesDepuisInventaire
      : activeAttribution.value.articlesHorsInventaire,
  );

  data.value.push({
    materiel_type_id: null,
    numero: null,
    taille: null,
    remarque: null,
  });

  nextTick(() => {
    const reference = depuisInventaire.value
      ? refArticlesDepuisInventaire.value
      : refArticlesHorsInventaire.value;
    reference[reference.length - 1].focus();
  });
};

const selectMaterielTypeNumerote = (item, value) => {
  // Select première combinaison valable
  // const materiel = materielNumeroteDispo.find(
  //   (m) => m.materiel_type_id == value,
  // );
  // item.id = materiel?.id;
  // item.taille = materiel?.taille;
  // item.numero = materiel?.numero;
  // item.remarque = materiel?.remarque;
};
const selectNumero = (item, value) => {
  // const materiel = materielNumeroteDispo.find((m) => m.id == value);
  // item.taille = materiel?.taille;
  // item.numero = materiel?.numero;
  // item.id = materiel?.id;
  // item.remarque = materiel?.remarque;
};
const selectMaterielTypeGenerique = (item) => {
  // item.quantite = 1;
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6 mb-3">
          <label for="date">Date attribution</label>
          <input
            id="date"
            v-model="activeAttribution.date"
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attributions.0.date'] }"
          />
        </div>
        <div class="col-6">
          <base-select
            ref="sapeur"
            v-model="activeAttribution.sapeur_id"
            class="mb-3"
            label="Sapeur"
            display-key="nom_prenom"
            :options="sapeurs"
            :select-class="{ 'is-invalid': errors['attributions.0.sapeur_id'] }"
          />
        </div>
        <div class="col-md-12 mb-3">
          <div class="form-check form-switch">
            <input
              id="switch-mode-attribution"
              v-model="depuisInventaire"
              class="form-check-input"
              type="checkbox"
              role="switch"
            />
            <label class="form-check-label" for="switch-mode-attribution"
              >Attribuer depuis l'inventaire
            </label>
          </div>
        </div>
        <div class="col-md-12">
          <table class="table table-sm">
            <thead>
              <tr>
                <th class="col-4">Matériel type</th>
                <th class="col-2">Numéro</th>
                <th class="col-2">Taille</th>
                <th v-if="depuisInventaire" class="col-2">Emplacement</th>
                <th>Remarque</th>
                <th class="col-1"></th>
              </tr>
            </thead>
            <tbody v-if="articles.length === 0 && depuisInventaire">
              <tr>
                <td colspan="6">
                  Aucun article dans l'inventaire, utilisez l'attribution hors
                  inventaire ou ajouter du matériel au préalable.
                </td>
              </tr>
            </tbody>
            <!-- Depuis inventaire -->
            <tbody v-else-if="depuisInventaire">
              <tr
                v-for="(
                  item, index
                ) in activeAttribution.articlesDepuisInventaire"
                :key="index"
              >
                <td>
                  <base-select
                    ref="article-depuis-inventaire"
                    v-model="item.materiel_type_id"
                    :options="typesDisponible"
                    base-option="&lt;Matériel type&gt;"
                    @update:model-value="
                      (value) => selectMaterielTypeNumerote(item, value)
                    "
                  />
                </td>
                <td>
                  <base-select
                    v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
                    v-model="item.id"
                    :options="
                      articles.filter(
                        (a) => a.materiel_type_id == item.materiel_type_id,
                      )
                    "
                    base-option="&lt;Aucun matériel correspondant&gt;"
                    display-key="numero"
                    @update:model-value="(value) => selectNumero(item, value)"
                  />
                  <font-awesome-icon
                    v-else
                    class="ms-4"
                    v-tooltip.bottom="'Matériel non numéroté'"
                    :icon="['far', 'circle-question']"
                  />
                </td>
                <td>
                  <base-select
                    v-if="indexedTypes[item.materiel_type_id]?.est_taillee"
                    v-model="item.id"
                    :options="
                      articles.filter(
                        (a) => a.materiel_type_id == item.materiel_type_id,
                      )
                    "
                    base-option="&lt;Aucun matériel correspondant&gt;"
                    display-key="taille"
                    @update:model-value="(value) => selectNumero(item, value)"
                  />
                  <font-awesome-icon
                    v-else
                    class="ms-4"
                    v-tooltip.bottom="'Taille unique'"
                    :icon="['far', 'circle-question']"
                  />
                </td>
                <td>
                  <base-select
                    v-model="item.id"
                    :options="
                      articles.filter(
                        (a) => a.materiel_type_id == item.materiel_type_id,
                      )
                    "
                    base-option="&lt;Aucun matériel correspondant&gt;"
                    display-key="emplacement_id"
                    @update:model-value="(value) => selectNumero(item, value)"
                  />
                  {{ articles }}
                </td>
                <td>{{ item.remarque }}</td>
                <td>
                  <button
                    class="btn btn-outline-danger border-0"
                    @click="
                      activeAttribution.articlesDepuisInventaire.splice(
                        index,
                        1,
                      )
                    "
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
              <tr>
                <td colspan="6">
                  <button class="btn btn-outline-primary" @click="addEmptyLine">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </td>
              </tr>
            </tbody>
            <!-- Hors inventaire -->
            <tbody v-if="!depuisInventaire">
              <tr
                v-for="(
                  item, index
                ) in activeAttribution.articlesHorsInventaire"
                :key="index"
              >
                <td>
                  <base-select
                    ref="article-hors-inventaire"
                    v-model="item.materiel_type_id"
                    base-option="&lt;Matériel type&gt;"
                    :options="types"
                  />
                </td>
                <td>
                  <input
                    v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
                    v-model="item.numero"
                    class="form-control form-control-sm"
                    type="text"
                  />
                  <font-awesome-icon
                    v-else
                    class="ms-4"
                    v-tooltip.bottom="'Matériel non numéroté'"
                    :icon="['far', 'circle-question']"
                  />
                </td>
                <td>
                  <input
                    v-if="indexedTypes[item.materiel_type_id]?.est_taillee"
                    v-model="item.taille"
                    class="form-control form-control-sm"
                    type="text"
                  />
                  <font-awesome-icon
                    v-else
                    class="ms-4"
                    v-tooltip.bottom="'Taille unique'"
                    :icon="['far', 'circle-question']"
                  />
                </td>
                <td>
                  <input
                    v-model="item.remarque"
                    class="form-control form-control-sm"
                    type="text"
                  />
                </td>
                <td>
                  <button
                    class="btn btn-outline-danger border-0"
                    @click="
                      activeAttribution.numerotesHorsInventaire.splice(index, 1)
                    "
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
              <tr>
                <td colspan="5">
                  <button class="btn btn-outline-primary" @click="addEmptyLine">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="close">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Attribuer
      </button>
    </div>
  </div>
</template>

<style scoped></style>

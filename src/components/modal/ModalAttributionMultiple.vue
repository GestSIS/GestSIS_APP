<script setup>
import { computed, inject, nextTick, ref, useTemplateRef } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Materiel';
import { useStore } from 'vuex';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const awn = inject('awn');

const store = useStore();

const errors = ref({});
const tab = ref('numerote');
const depuisInventaire = ref(true);
const activeAttribution = ref({
  date: new Date().toISOString().slice(0, 10),
  id: data?.id,
  quantite: data?.materiel?.quantite ?? null,
  sapeur_id: data?.sapeurId ?? null,
  items: [
    {
      id: null,
      materiel_type_id: null,
      remarque: null,
    },
  ],
});

// FIXME:focus input field
console.log(useTemplateRef('sapeur').value);
// useTemplateRef('sapeur').value.focus();

const materielTypeStore = useMaterielTypeStore();
await Promise.all([
  materielTypeStore.fetchMaterielType(),
  store.dispatch('fetchListeSapeur'),
]);

const types = computed(() => materielTypeStore.liste);
const articles = ref(await ArticleService.getMaterielLavable(id));

const materielDispo = computed(() =>
  articles.value
    .filter(
      (m) => m.materiel.numero && (m.retour != null || m.sapeur_id == null)
    )
    .map((m) => ({ ...m, ...m.materiel, id: m.id }))
);
const sapeurs = computed(() => store.state.sapeur.liste);

const save = async () => {
  if (!activeAttribution.value.sapeur_id) {
    awn.warning('Veuillez sélectionner un sapeur');
  }

  // Masse attribution
  const baseAttribution = {
    sapeur_id: activeAttribution.value.sapeur_id,
    date: activeAttribution.value.date,
  };

  const numerotes = depuisInventaire.value
    ? activeAttribution.value.numerotesDepuisInventaire
    : activeAttribution.value.numerotesHorsInventaire;

  const attributions = [
    ...numerotes
      .filter((m) => m.materiel_type_id && m.numero)
      .map((m) => ({ ...baseAttribution, ...m, quantite: null })),

    ...activeAttribution.value.generiques
      .filter((m) => m.materiel_type_id && m.quantite > 0)
      .map((m) => ({ ...baseAttribution, ...m })),
  ];

  if (attributions.length == 0) {
    awn.warning('Aucun matériel saisi');
    return;
  }
  store
    .dispatch('attribuerMatPerso', {
      depuisInventaire: depuisInventaire.value,
      attributions,
    })
    .then(() => {
      errors = {};
      store.commit('HIDE_MODAL');
    })
    .catch((err) => (errors.value = err));
};
const addNumerote = () => {
  const data = depuisInventaire.value
    ? activeAttribution.value.numerotesDepuisInventaire
    : activeAttribution.value.numerotesHorsInventaire;

  data.push({
    materiel_type_id: null,
    numero: null,
    taille: null,
    remarque: null,
  });

  const count = data.length;
  nextTick(() => {
    useTemplateRef(`numerote-${count - 1}`).value.focus();
  });
};
const addGenerique = () => {
  activeAttribution.value.generiques.push({
    materiel_type_id: null,
    taille: null,
    quantite: null,
    remarque: null,
  });

  const count = activeAttribution.value.generiques.length;
  nextTick(() => {
    useTemplateRef(`generique-${count - 1}`).value.focus();
  });
};
const selectMaterielTypeNumerote = (item, value) => {
  // Select première combinaison valable
  const materiel = materielNumeroteDispo.find(
    (m) => m.materiel_type_id == value
  );
  item.id = materiel?.id;
  item.taille = materiel?.taille;
  item.numero = materiel?.numero;
  item.remarque = materiel?.remarque;
};
const selectNumero = (item, value) => {
  const materiel = materielNumeroteDispo.find((m) => m.id == value);
  item.taille = materiel?.taille;
  item.numero = materiel?.numero;
  item.id = materiel?.id;
  item.remarque = materiel?.remarque;
};
const selectMaterielTypeGenerique = (item) => {
  item.quantite = 1;
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Attribuer du matériel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
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
          <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
            <button
              class="nav-item nav-link"
              role="tab"
              :class="{ active: tab == 'numerote' }"
              @click="tab = 'numerote'"
            >
              Matériel numéroté
            </button>
            <button
              class="nav-item nav-link"
              role="tab"
              exact-active-class="active"
              :class="{ active: tab == 'generique' }"
              @click="tab = 'generique'"
            >
              Matériel générique
            </button>
          </nav>
          <div class="tab-content">
            <div class="tab-pane fade show active" role="tabpanel">
              <table v-if="tab == 'numerote'" class="table table-sm">
                <thead>
                  <tr>
                    <th class="col-4">Matériel type</th>
                    <th class="col-2">Numéro</th>
                    <th class="col-2">Taille</th>
                    <th>Remarque</th>
                    <th class="col-1"></th>
                  </tr>
                </thead>
                <tbody v-if="depuisInventaire">
                  <tr
                    v-for="(
                      item, index
                    ) in activeAttribution.numerotesDepuisInventaire"
                    :key="index"
                  >
                    <td>
                      <base-select
                        :ref="'numerote-' + index"
                        v-model="item.materiel_type_id"
                        :options="
                          types.filter((t) =>
                            materielNumeroteDispo.find(
                              (m) => m.materiel_type_id == t.id
                            )
                          )
                        "
                        base-option="&lt;Matériel type&gt;"
                        @update:model-value="
                          (value) => selectMaterielTypeNumerote(item, value)
                        "
                      />
                    </td>
                    <td>
                      <base-select
                        v-model="item.id"
                        :options="
                          materielNumeroteDispo.filter(
                            (m) =>
                              !item.materiel_type_id ||
                              m.materiel_type_id == item.materiel_type_id
                          )
                        "
                        base-option="&lt;Aucun matériel correspondant&gt;"
                        display-key="numero"
                        @update:model-value="
                          (value) => selectNumero(item, value)
                        "
                      />
                      <!-- -{{ item.materiel_type_id }}-
                      {{ materielNumeroteDispo }} -->
                    </td>
                    <td>
                      {{ item.taille }}
                    </td>
                    <td>{{ item.remarque }}</td>
                    <td>
                      <button
                        class="btn btn-outline-danger border-0"
                        @click="
                          activeAttribution.numerotesDepuisInventaire.splice(
                            index,
                            1
                          )
                        "
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="5">
                      <button
                        class="btn btn-outline-primary"
                        @click="addNumerote"
                      >
                        <font-awesome-icon :icon="['fas', 'plus']" />
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-if="!depuisInventaire">
                  <tr
                    v-for="(
                      item, index
                    ) in activeAttribution.numerotesHorsInventaire"
                    :key="index"
                  >
                    <td>
                      <base-select
                        :ref="'numerote-' + index"
                        v-model="item.materiel_type_id"
                        base-option="&lt;Matériel type&gt;"
                        :options="types"
                      />
                    </td>
                    <td>
                      <input
                        v-model="item.numero"
                        class="form-control form-control-sm"
                        type="text"
                      />
                    </td>
                    <td>
                      <input
                        v-model="item.taille"
                        class="form-control form-control-sm"
                        type="text"
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
                          activeAttribution.numerotesHorsInventaire.splice(
                            index,
                            1
                          )
                        "
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="5">
                      <button
                        class="btn btn-outline-primary"
                        @click="addNumerote"
                      >
                        <font-awesome-icon :icon="['fas', 'plus']" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table v-if="tab == 'generique'" class="table table-sm">
                <thead>
                  <tr>
                    <th class="col-4">Matériel type</th>
                    <th class="col-2">Taille</th>
                    <th class="col-2">Quantité</th>
                    <th>Remarque</th>
                    <th class="col-1"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in activeAttribution.generiques"
                    :key="index"
                  >
                    <td>
                      <base-select
                        :ref="'generique-' + index"
                        v-model="item.materiel_type_id"
                        :options="types"
                        base-option="&lt;Matériel type&gt;"
                        @update:model-value="
                          (value) => selectMaterielTypeGenerique(item, value)
                        "
                      />
                    </td>
                    <td>
                      <input
                        v-model="item.taille"
                        class="form-control form-control-sm"
                        type="text"
                      />
                    </td>
                    <td>
                      <input
                        v-model="item.quantite"
                        class="form-control form-control-sm"
                        type="number"
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
                        @click="activeAttribution.generiques.splice(index, 1)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="5">
                      <button
                        class="btn btn-outline-primary"
                        @click="addGenerique"
                      >
                        <font-awesome-icon :icon="['fas', 'plus']" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Attribuer
      </button>
    </div>
  </div>
</template>

<style scoped></style>

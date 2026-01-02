<script setup>
import { computed, reactive, ref } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useGradeStore } from '../../stores/sapeur/Grade.js';
import { useFonctionStore } from '../../stores/sapeur/Fonction.js';
import { useModalStore } from '../../stores/common/Modal';
import { useBaseDataStore } from '../../stores/common/BaseData.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useGroupeStore } from '../../stores/groupe/Groupe.js';

// TODO:
// - Date anniversaire

const { callback, data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const civil = ref(true);
const inactif = ref(false);
const groupBy = ref('groupe');
const chosenSapeurs = ref(data.ids.slice(0));
const selectedGeneric = ref({
  groupe: {},
  fonction_id: {},
  permis_type_id: {},
  grade_id: {},
  localite_id: {},
  civilite_id: {},
  annee_incorporation: {},
  type: {},
  sapeur: {},
});
const expanded = ref({});

const sapeurStore = useSapeurStore();
const gradeStore = useGradeStore();
const fonctionStore = useFonctionStore();
const baseDataStore = useBaseDataStore();
const localiteStore = useLocaliteStore();
const groupeStore = useGroupeStore();

localiteStore.fetchLocalites();
gradeStore.fetchGrades();
fonctionStore.fetchFonctions();
baseDataStore.fetchCivilites();
baseDataStore.fetchPermisType();

const treeGroupesSapeurs = computed(() => groupeStore.treeGroupesSapeurs);
groupeStore.fetchGroupes().then(() => {
  const recursive = (item) => {
    expanded.value[item.id] = false;
    item.groupes.forEach(recursive);
  };
  treeGroupesSapeurs.value.forEach(recursive);
});

const groupes = computed(() => groupeStore.liste);
const localites = computed(() => localiteStore.liste);
const grades = computed(() => gradeStore.liste);
const fonctions = computed(() => fonctionStore.liste);
const sapeurs = computed(() => sapeurStore.liste);
const civilites = computed(() => baseDataStore.civilites);
const permis = computed(() => baseDataStore.permisTypes);

const filteredSapeurs = computed(() => {
  return sapeurs.value.filter(
    (s) =>
      (inactif.value ? true : s?.actif) && (civil.value ? true : s?.type == 0),
  );
});
const filteredLocalites = computed(() => {
  const localitesIds = new Set(availableSapeur.value.map((s) => s.localite_id));
  return localites.value.filter((l) => localitesIds.has(l.id));
});
const computedChosenSapeurs = computed(() => {
  return chosenSapeurs.value
    .map((sapeurId) => sapeurs.value.find((s) => s.id == sapeurId))
    .sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom));
});
const availableSapeur = computed(() => {
  return filteredSapeurs.value
    .slice(0)
    .filter((s) => (data.filter ?? (() => true))(s))
    .filter((s) => !chosenSapeurs.value.includes(s.id));
});
const listeSapeurSelect = computed(() => {
  const option = selectOptions[groupBy.value];
  if (option.generic) {
    return flattenedSapeurGeneric(
      option.collection(),
      option.comparison ?? ((sapeur, value) => sapeur[groupBy.value] == value),
      option.displayKey,
    );
  }

  if (groupBy.value == 'groupe') {
    return flattenedSapeurGroupe.value;
  }
  return [];
});
const flattenedSapeurGroupe = computed(() => {
  let flattened = [];
  const recursive = (groupe, level) => {
    let expand = expanded.value[groupe.id];
    let flaten = [
      {
        designation: groupeFormatter(groupe),
        level: level,
        leaf: false,
        id: groupe.id,
        expanded: expand,
        empty:
          !groupe.groupes.length &&
          !groupe.sapeurs.filter(filtreSapeur()).length,
      },
    ];
    if (expand) {
      groupe.groupes.forEach(
        (g) => (flaten = [...flaten, ...recursive(g, level + 1)]),
      );
      groupe.sapeurs
        .filter(filtreSapeur())
        .map((s) => filteredSapeurs.value.find((sap) => sap.id == s))
        .filter((s) => s)
        .forEach(
          (s) =>
            (flaten = [
              ...flaten,
              {
                designation: s.nom_prenom,
                leaf: true,
                level: level + 1,
                parent_id: groupe.id,
                id: s.id,
              },
            ]),
        );
    }
    return flaten;
  };

  treeGroupesSapeurs.value.forEach(
    (i) => (flattened = [...flattened, ...recursive(i, 0)]),
  );
  return flattened;
});
const addSapeurState = computed(() => {
  return (
    Object.entries(selectedGeneric.value.sapeur).find(
      ([id, selected]) =>
        selected && !chosenSapeurs.value.includes(parseInt(id)),
    ) != null
  );
});
const removeSapeurState = computed(() => {
  return (
    Object.entries(selectedGeneric.value.sapeur).find(
      ([id, selected]) =>
        selected && chosenSapeurs.value.includes(parseInt(id)),
    ) != null
  );
});

const { closeModal } = useModalStore();
const awn = useNotification();

const flattenedSapeurGeneric = (relation, comparison, displayKey) => {
  let liste = [];
  relation.forEach((elem) => {
    let expand = expanded.value[elem.id];
    liste = [
      ...liste,
      {
        designation: elem[displayKey],
        level: 0,
        leaf: false,
        id: elem.id,
        expanded: expand,
        parent_id: 0,
        empty: !filteredSapeurs.value
          .map((s) => ({ ...s, sapeur_id: s.id }))
          .filter(filtreSapeur())
          .filter((s) => comparison(s, elem.id)).length,
      },
    ];
    if (expand) {
      liste = [
        ...liste,
        ...filteredSapeurs.value
          .map((s) => ({ ...s, sapeur_id: s.id }))
          .filter(filtreSapeur())
          .filter((s) => comparison(s, elem.id))
          // .filter((s) => s[key] == elem.id)
          .map((sapeur) => ({
            designation: sapeur.nom_prenom,
            level: 1,
            leaf: true,
            id: sapeur.id,
            parent_id: elem.id,
          })),
      ];
    }
  });
  return liste;
};
const close = () => {
  (callback(null) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};
const save = () => {
  // Sapeurs ajoutés
  const newSap = chosenSapeurs.value.filter((s) => !data.ids.includes(s));
  // Sapeurs supprimés
  const removedSap = data.ids.filter((s) => !chosenSapeurs.value.includes(s));
  // Sapeurs tous
  const sapeurs = chosenSapeurs.value;

  callback({ ajoute: newSap, supprime: removedSap, tous: sapeurs })
    .then((close) => {
      if (close ?? true) {
        closeModal();
      }
    })
    .catch((errorMessage) => {
      awn.warning(errorMessage);
    });
};
const select = (id, leaf = true) => {
  if (leaf) {
    selectSapeur(id);
  } else if (groupBy.value == 'groupe') {
    selectGroupe(id);
  } else {
    selectGeneric(id);
  }
};
const selectSapeur = (id) => {
  selectedGeneric.value.sapeur[id] = !selectedGeneric.value.sapeur[id];
};
const selectGeneric = (id) => {
  const option = selectOptions[groupBy.value];
  const comparison =
    option.comparison ?? ((sapeur, value) => sapeur[groupBy.value] == value);

  // Get group state
  const state = selectedGeneric.value[groupBy.value][id] ?? false;

  // Select groupe
  selectedGeneric.value[groupBy.value][id] = !state;

  // Select all sapeurs
  availableSapeur.value
    .filter((s) => comparison(s, id) && !chosenSapeurs.value.includes(s.id))
    .forEach((s) => (selectedGeneric.value.sapeur[s.id] = !state));
};
const selectGroupe = (id) => {
  const selected = !(selectedGeneric.value.groupe[id] ?? false);

  // Select groupe itself
  const recursiveSearch = (item) => {
    const found = item.id == id;
    if (found) {
      selectGroupSingle(item, selected, true);
    } else {
      item.groupes.forEach(recursiveSearch);
    }
  };

  // recursive search
  treeGroupesSapeurs.value.forEach(recursiveSearch);
};
const selectGroupSingle = (groupe, state, first = false) => {
  if (!first) {
    selectedGeneric.value.groupe[groupe.id] = state;
  }

  (groupe.sapeur_ids ?? []).filter(filtreSapeur()).forEach((s) => {
    selectedGeneric.value.sapeur[s.sapeur_id] = state;
  });
  groupe.groupes.forEach((g) => selectGroupSingle(g, state));
};
const filtreSapeur = () => {
  return (s) =>
    filteredSapeurs.value.find(
      (sap) => sap.id == s?.sapeur_id || sap.id == s,
    ) != null && !chosenSapeurs.value.includes(s.sapeur_id || s);
};
const groupeFormatter = (g) => {
  return g.no ? g.no + ' ' + g.designation : g.designation;
};
const toggleGroupe = (id) => {
  expanded.value = {
    ...expanded.value,
    [id]: !expanded.value[id],
  };
};
const addSapeurs = () => {
  chosenSapeurs.value = Array.from(
    new Set([
      ...chosenSapeurs.value,
      ...Object.entries(selectedGeneric.value.sapeur)
        .filter(([, selected]) => selected)
        .map(([id]) => parseInt(id)),
    ]),
  );
};
const removeSapeurs = () => {
  const sapeursToRemove = new Set([
    ...Object.entries(selectedGeneric.value.sapeur)
      .filter(([, selected]) => selected)
      .map(([id]) => parseInt(id)),
  ]);
  chosenSapeurs.value = chosenSapeurs.value.filter(
    (id) => !sapeursToRemove.has(id),
  );
};
const addSingleSapeur = (id) => {
  chosenSapeurs.value = [...chosenSapeurs.value, id];
};
const removeSingleSapeur = (id) => {
  chosenSapeurs.value = chosenSapeurs.value.filter((item) => item != id);
};
const computeId = (item) => {
  return item.leaf == true || item.leaf == undefined ? item.id : 'g' + item.id;
};

const selectOptions = {
  none: {
    label: 'Alphabétique',
  },
  groupe: {
    label: 'Groupes',
  },
  localite_id: {
    generic: true,
    label: 'Localité',
    collection: () => filteredLocalites.value,
    displayKey: 'designation',
  },
  fonction_id: {
    generic: true,
    label: 'Fonction',
    comparison: (sapeur, value) =>
      sapeur.fonctions.map((f) => f.fonction_id).includes(value),
    collection: () => fonctions.value,
    displayKey: 'nom',
  },
  permis_type_id: {
    generic: true,
    label: 'Permis de conduire',
    comparison: (sapeur, value) => sapeur.permis.includes(value),
    collection: () => permis.value,
    displayKey: 'type',
  },
  grade_id: {
    generic: true,
    label: 'Grade',
    collection: () => grades.value,
    displayKey: 'designation',
  },
  civilite_id: {
    generic: true,
    label: 'Civilité',
    collection: () => civilites.value,
    displayKey: 'designation',
  },
  annee_incorporation: {
    generic: true,
    label: 'Année incorporation',
    collection: () =>
      [...new Set(filteredSapeurs.value.map((s) => s.annee_incorporation))]
        .sort()
        .map((annee) => ({ designation: annee, id: annee })),
    displayKey: 'designation',
  },
  type: {
    generic: true,
    label: 'Type',
    collection: () => [
      { id: 0, designation: 'Sapeur' },
      { id: 1, designation: 'Civil' },
    ],
    displayKey: 'designation',
  },
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Gérer les sapeurs</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="row mt-2">
        <div class="col-6">
          <div class="mb-2 d-flex align-items-center">
            <label class="form-select-label mb-0 me-2" for="group-by"
              >Afficher&nbsp;par</label
            >
            <select
              id="group-by"
              v-model="groupBy"
              class="form-select form-select-sm"
            >
              <option
                v-for="[key, { label }] in Object.entries(selectOptions)"
                :key="key"
                :value="key"
              >
                {{ label }}
              </option>
            </select>
          </div>
        </div>
        <div class="col-6">
          <div class="mb-2 d-flex align-items-center">
            <div class="form-check form-switch">
              <input
                id="switch-civil"
                v-model="civil"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="switch-civil"
                >Inclure les civil</label
              >
            </div>
            <div class="form-check form-switch ms-3">
              <input
                id="switch-actif"
                v-model="inactif"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="switch-actif"
                >Inclure les inactif</label
              >
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div class="row mb-2">
        <div class="col-6 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            Sapeurs sélectionnés ({{ chosenSapeurs.length }})
          </h6>
          <button
            type="button"
            class="btn btn-outline-danger"
            :disabled="!removeSapeurState"
            @click="removeSapeurs"
          >
            Enlever ces sapeurs
          </button>
        </div>
        <div class="col-6 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Sapeurs disponibles</h6>
          <button
            type="button"
            class="btn btn-outline-primary"
            :disabled="!addSapeurState"
            @click="addSapeurs"
          >
            Ajouter ces sapeurs
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th></th>
                <th>Designation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="computedChosenSapeurs.length <= 0">
                <td colspan="3">Aucun sapeur sélectioné</td>
              </tr>
              <tr
                v-for="item in computedChosenSapeurs"
                :key="item.id"
                :class="{
                  'table-primary': selectedGeneric.sapeur[item.id],
                }"
              >
                <td class="text-center">
                  <div class="form-check d-inline-block ps-0">
                    <input
                      :id="item.id"
                      v-model="selectedGeneric.sapeur[item.id]"
                      type="checkbox"
                      class="form-check-input ms-0"
                      @click="select(item.id, true)"
                    />
                    <label class="form-check-label" :for="item.id"></label>
                  </div>
                </td>
                <td>{{ item.nom_prenom }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="removeSingleSapeur(item.id)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-6">
          <table v-if="groupBy !== 'none'" class="table table-sm">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="listeSapeurSelect.length <= 0">
                <td colspan="2">Aucun sapeur</td>
              </tr>
              <tr
                v-for="item in listeSapeurSelect"
                :key="item.parent_id + '-' + item.id"
                class="clickable"
                :class="{
                  'table-primary':
                    selectedGeneric[item.leaf ? 'sapeur' : groupBy][item.id],
                  'text-muted': item.empty,
                }"
                @dblclick="toggleGroupe(item.id)"
              >
                <td :style="{ 'padding-left': item.level * 25 + 'px' }">
                  <font-awesome-icon
                    v-if="!item.leaf"
                    class="me-2 ms-2"
                    :icon="[
                      'fas',
                      item.expanded ? 'angle-down' : 'angle-right',
                    ]"
                    @click="toggleGroupe(item.id)"
                  />

                  <div class="form-check d-inline-block">
                    <input
                      :id="computeId(item)"
                      v-model="
                        selectedGeneric[item.leaf ? 'sapeur' : groupBy][item.id]
                      "
                      type="checkbox"
                      class="form-check-input"
                      @click="select(item.id, item.leaf)"
                    />
                    <label
                      class="form-check-label"
                      :for="computeId(item)"
                    ></label>
                  </div>
                  {{ item.designation }}
                </td>
                <td>
                  <button
                    v-if="item.leaf"
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="addSingleSapeur(item.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <table v-if="groupBy === 'none'" class="table table-sm table-striped">
            <thead>
              <tr>
                <th></th>
                <th>Designation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="availableSapeur.length == 0">
                <td v-if="sapeurs.length > 0" colspan="3">
                  Tous les sapeurs sont déjà présent dans l'exercice
                </td>
                <td v-if="sapeurs.length == 0" colspan="3">
                  Aucun sapeur dans GestSIS
                </td>
              </tr>
              <tr
                v-for="item in availableSapeur"
                :key="item.id"
                :class="{ 'table-primary': selectedGeneric.sapeur[item.id] }"
              >
                <td>
                  <div class="form-check d-inline-block">
                    <input
                      :id="item.id"
                      v-model="selectedGeneric.sapeur[item.id]"
                      type="checkbox"
                      class="form-check-input"
                      @click="select(item.id)"
                    />
                    <label class="form-check-label" :for="item.id"></label>
                  </div>
                </td>
                <td>{{ item.nom_prenom }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="addSingleSapeur(item.id)"
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
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-primary" @click="save">
        Enregistrer
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="close">
        Annuler
      </button>
    </div>
  </div>
</template>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>

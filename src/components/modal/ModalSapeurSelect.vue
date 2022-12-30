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
                id="switch-politique"
                v-model="politique"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="switch-politique"
                >Inclure les politique</label
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
      <button class="btn btn-outline-primary" @click="save">Enregistrer</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

// TODO:
// - Par cours
// - Date anniversaire
// - Permis de conduire

export default {
  name: 'ModalSapeurSelect',
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    const svm = this;
    return {
      politique: true,
      inactif: false,
      groupBy: 'groupe',
      chosenSapeurs: [],
      selectedGeneric: {
        groupe: {},
        fonction_id: {},
        grade_id: {},
        localite_id: {},
        civilite_id: {},
        annee_incorporation: {},
        type: {},
        sapeur: {},
      },
      expanded: {},
      selectOptions: {
        none: {
          label: 'Alphabétique',
        },
        groupe: {
          label: 'Groupes',
        },
        localite_id: {
          generic: true,
          label: 'Localité',
          collection: () => svm.filteredLocalites,
          displayKey: 'designation',
        },
        fonction_id: {
          generic: true,
          label: 'Fonction',
          comparison: (sapeur, value) => sapeur.fonctions.includes(value),
          collection: () => svm.fonctions,
          displayKey: 'nom',
        },
        grade_id: {
          generic: true,
          label: 'Grade',
          collection: () => svm.grades,
          displayKey: 'designation',
        },
        civilite_id: {
          generic: true,
          label: 'Civilité',
          collection: () => svm.civilites,
          displayKey: 'designation',
        },
        annee_incorporation: {
          generic: true,
          label: 'Année incorporation',
          collection: () =>
            [...new Set(svm.filteredSapeurs.map((s) => s.annee_incorporation))]
              .sort()
              .map((annee) => ({ designation: annee, id: annee })),
          displayKey: 'designation',
        },
        type: {
          generic: true,
          label: 'Type',
          collection: () => [
            { id: 0, designation: 'Sapeur' },
            { id: 1, designation: 'Politique' },
          ],
          displayKey: 'designation',
        },
      },
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
      localites: (state) => state.localite.liste,
      grades: (state) => state.grade.liste,
      fonctions: (state) => state.fonction.liste,
      sapeurs: (state) => state.sapeur.liste,
      civilites: (state) => state.baseData.civilites,
    }),
    ...mapGetters(['treeGroupesSapeurs']),
    filteredSapeurs() {
      return this.sapeurs.filter(
        (s) =>
          (this.inactif ? true : s?.actif) &&
          (this.politique ? true : s?.type == 0)
      );
    },
    filteredLocalites() {
      const localitesIds = new Set(
        this.availableSapeur.map((s) => s.localite_id)
      );
      return this.localites.filter((l) => localitesIds.has(l.id));
    },
    computedChosenSapeurs() {
      return this.chosenSapeurs
        .map((sapeurId) => this.sapeurs.find((s) => s.id == sapeurId))
        .sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom));
    },
    availableSapeur() {
      return this.filteredSapeurs
        .slice(0)
        .filter((s) => (this.data.filter ?? (() => true))(s))
        .filter((s) => !this.chosenSapeurs.includes(s.id));
    },
    listeSapeurSelect() {
      const option = this.selectOptions[this.groupBy];
      if (option.generic) {
        return this.flattenedSapeurGeneric(
          option.collection(),
          option.comparison ??
            ((sapeur, value) => sapeur[this.groupBy] == value),
          option.displayKey
        );
      }

      if (this.groupBy == 'groupe') {
        return this.flattenedSapeurGroupe;
      }
      return [];
    },
    flattenedSapeurGroupe() {
      let flattened = [];
      const svm = this;
      const recursive = function (groupe, level) {
        let expanded = svm.expanded[groupe.id];
        let flaten = [
          {
            designation: svm.groupeFormatter(groupe),
            level: level,
            leaf: false,
            id: groupe.id,
            expanded: expanded,
            empty:
              !groupe.groupes.length &&
              !groupe.sapeurs.filter(svm.filtreSapeur()).length,
          },
        ];
        if (expanded) {
          groupe.groupes.forEach(
            (g) => (flaten = [...flaten, ...recursive(g, level + 1)])
          );
          groupe.sapeurs
            .filter(svm.filtreSapeur())
            .map((s) => svm.filteredSapeurs.find((sap) => sap.id == s))
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
                ])
            );
        }
        return flaten;
      };

      this.treeGroupesSapeurs.forEach(
        (i) => (flattened = [...flattened, ...recursive(i, 0)])
      );
      return flattened;
    },
    addSapeurState() {
      return (
        Object.entries(this.selectedGeneric.sapeur).find(
          ([id, selected]) =>
            selected && !this.chosenSapeurs.includes(parseInt(id))
        ) != null
      );
    },
    removeSapeurState() {
      return (
        Object.entries(this.selectedGeneric.sapeur).find(
          ([id, selected]) =>
            selected && this.chosenSapeurs.includes(parseInt(id))
        ) != null
      );
    },
  },
  mounted() {
    this.chosenSapeurs = this.data.ids.slice(0);

    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchGrades');
    this.$store.dispatch('fetchFonctions');
    this.$store.dispatch('fetchCivilites');

    this.$store.dispatch('fetchGroupes').then(() => {
      let svm = this;
      let recursive = (item) => {
        svm.expanded = { ...svm.expanded, [item.id]: false };
        item.groupes.forEach(recursive);
      };
      this.treeGroupesSapeurs.forEach(recursive);
    });
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    flattenedSapeurGeneric(relation, comparison, displayKey) {
      let liste = [];
      const svm = this;
      relation.forEach((elem) => {
        let expanded = svm.expanded[elem.id];
        liste = [
          ...liste,
          {
            designation: elem[displayKey],
            level: 0,
            leaf: false,
            id: elem.id,
            expanded: expanded,
            parent_id: 0,
            empty: !svm.filteredSapeurs
              .map((s) => ({ ...s, sapeur_id: s.id }))
              .filter(svm.filtreSapeur())
              .filter((s) => comparison(s, elem.id)).length,
          },
        ];
        if (expanded) {
          liste = [
            ...liste,
            ...svm.filteredSapeurs
              .map((s) => ({ ...s, sapeur_id: s.id }))
              .filter(svm.filtreSapeur())
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
    },
    close() {
      (this.callback(null) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    async save() {
      // Sapeurs ajoutés
      const newSap = this.chosenSapeurs.filter(
        (s) => !this.data.ids.includes(s)
      );
      // Sapeurs supprimés
      const removedSap = this.data.ids.filter(
        (s) => !this.chosenSapeurs.includes(s)
      );
      // Sapeurs tous
      const sapeurs = this.chosenSapeurs;

      const svm = this;
      this.callback({ ajoute: newSap, supprime: removedSap, tous: sapeurs })
        .then((close) => {
          if (close ?? true) {
            svm.HIDE_MODAL();
          }
        })
        .catch((errorMessage) => {
          svm.$awn.warning(errorMessage);
        });
    },
    select(id, leaf = true) {
      if (leaf) {
        this.selectSapeur(id);
      } else if (this.groupBy == 'groupe') {
        this.selectGroupe(id);
      } else {
        this.selectGeneric(id);
      }
    },
    selectSapeur(id) {
      this.selectedGeneric.sapeur[id] = !this.selectedGeneric.sapeur[id];
    },
    selectGeneric(id) {
      // Get group state
      const state = this.selectedGeneric[this.groupBy][id] ?? false;

      // Select groupe
      this.selectedGeneric[this.groupBy][id] = !state;

      // Select all sapeurs
      this.availableSapeur
        .filter(
          (s) => s[this.groupBy] == id && !this.chosenSapeurs.includes(s.id)
        )
        .forEach((s) => (this.selectedGeneric.sapeur[s.id] = !state));
    },
    selectGroupe(id) {
      const selected = !(this.selectedGeneric.groupe[id] ?? false);
      const svm = this;

      // Select groupe itself
      const recursiveSearch = (item) => {
        const found = item.id == id;
        if (found) {
          svm.selectGroupSingle(item, selected, true);
        } else {
          item.groupes.forEach(recursiveSearch);
        }
      };

      // recursive search
      this.treeGroupesSapeurs.forEach(recursiveSearch);
    },
    selectGroupSingle(groupe, state, first = false) {
      if (!first) {
        this.selectedGeneric.groupe[groupe.id] = state;
      }

      (groupe.sapeur_ids ?? []).filter(this.filtreSapeur()).forEach((s) => {
        this.selectedGeneric.sapeur[s.sapeur_id] = state;
      });
      groupe.groupes.forEach((g) => this.selectGroupSingle(g, state));
    },
    filtreSapeur() {
      const svm = this;
      return (s) =>
        svm.filteredSapeurs.find(
          (sap) => sap.id == s?.sapeur_id || sap.id == s
        ) != null && !svm.chosenSapeurs.includes(s.sapeur_id || s);
    },
    groupeFormatter(g) {
      return g.no ? g.no + ' ' + g.designation : g.designation;
    },
    toggleGroupe(id) {
      this.expanded = {
        ...this.expanded,
        [id]: !this.expanded[id],
      };
    },
    addSapeurs() {
      this.chosenSapeurs = Array.from(
        new Set([
          ...this.chosenSapeurs,
          ...Object.entries(this.selectedGeneric.sapeur)
            .filter(([, selected]) => selected)
            .map(([id]) => parseInt(id)),
        ])
      );
    },
    removeSapeurs() {
      const sapeursToRemove = new Set([
        ...Object.entries(this.selectedGeneric.sapeur)
          .filter(([, selected]) => selected)
          .map(([id]) => parseInt(id)),
      ]);
      this.chosenSapeurs = this.chosenSapeurs.filter(
        (id) => !sapeursToRemove.has(id)
      );
    },
    addSingleSapeur(id) {
      this.chosenSapeurs = [...this.chosenSapeurs, id];
    },
    removeSingleSapeur(id) {
      this.chosenSapeurs = this.chosenSapeurs.filter((item) => item != id);
    },
    computeId(item) {
      return item.leaf == true || item.leaf == undefined
        ? item.id
        : 'g' + item.id;
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>

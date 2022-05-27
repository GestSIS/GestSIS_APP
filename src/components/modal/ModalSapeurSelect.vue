<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Gérer les sapeurs</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="row mt-2">
        <div class="col-12">
          <div class="mb-3 d-flex align-items-center">
            <label class="form-select-label mb-0 me-2" for="group-by"
              >Afficher&nbsp;par</label
            >
            <select
              class="form-select form-select-sm"
              v-model="groupBy"
              id="group-by"
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
      </div>
      <div class="row mb-2">
        <div class="col-6 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">
            Sapeurs sélectionnés ({{ chosenSapeurs.length }})
          </h6>
          <button
            class="btn btn-outline-danger"
            @click="removeSapeurs"
            :disabled="!removeSapeurState"
          >
            Enlever ces sapeurs
          </button>
        </div>
        <div class="col-6 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Sapeurs disponibles</h6>
          <button
            class="btn btn-outline-primary"
            @click="addSapeurs"
            :disabled="!addSapeurState"
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
                      type="checkbox"
                      class="form-check-input ms-0"
                      :id="item.id"
                      v-model="selectedGeneric.sapeur[item.id]"
                      @click="select(item.id, true)"
                    />
                    <label class="form-check-label" :for="item.id"></label>
                  </div>
                </td>
                <td>{{ item.nomPrenom }}</td>
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
          <table class="table table-sm" v-if="groupBy !== 'none'">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="listeSapeurSelect.length <= 0">
                <td colspan="2">Aucun sapeur ne possède de fonction</td>
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
                    class="me-2 ms-2"
                    :icon="[
                      'fas',
                      item.expanded ? 'angle-down' : 'angle-right',
                    ]"
                    v-if="!item.leaf"
                    @click="toggleGroupe(item.id)"
                  />

                  <div class="form-check d-inline-block">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="computeId(item)"
                      v-model="
                        selectedGeneric[item.leaf ? 'sapeur' : groupBy][item.id]
                      "
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
                    class="btn btn-outline-primary border-0"
                    @click="addSingleSapeur(item.id)"
                    v-if="item.leaf"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <table class="table table-sm table-striped" v-if="groupBy === 'none'">
            <thead>
              <tr>
                <th></th>
                <th>Designation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="availableSapeur.length == 0">
                <td colspan="3" v-if="sapeurs.length > 0">
                  Tous les sapeurs sont déjà présent dans l'exercice
                </td>
                <td colspan="3" v-if="sapeurs.length == 0">
                  Aucun sapeur dans GestSIS
                </td>
              </tr>
              <tr
                v-for="item in availableSapeur.filter((s) => s && s.actif)"
                :key="item.id"
                :class="{ 'table-primary': selectedGeneric.sapeur[item.id] }"
              >
                <td>
                  <div class="form-check d-inline-block">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="item.id"
                      v-model="selectedGeneric.sapeur[item.id]"
                      @click="select(item.id)"
                    />
                    <label class="form-check-label" :for="item.id"></label>
                  </div>
                </td>
                <td>{{ sapeurFormatter(item) }}</td>
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

//TODO:
// - Par fonction -> effectif et non principale
// - Par cours
// - Date anniversaire
// - Permis de conduire

export default {
  name: 'ModalSapeurSelect',
  props: ['callback', 'data'],
  data() {
    const svm = this;
    return {
      groupBy: 'groupe',
      chosenSapeurs: [],
      selectedGeneric: {
        groupe: {},
        fonction_id: {},
        grade_id: {},
        localite_id: {},
        civilite_id: {},
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
          collection: () => svm.grades,
          displayKey: 'designation',
        },
        fonction_id: {
          generic: true,
          label: 'Fonction',
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
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
      localites: (state) => state.localite.liste,
      grades: (state) => state.grade.liste,
      civilites: (state) => state.baseData.civilites,
      fonctions: (state) => state.fonction.liste,
      sapeurs: (state) => state.sapeur.liste,
      civilites: (state) => state.baseData.civilites,
    }),
    ...mapGetters(['treeGroupesSapeurs']),
    filteredLocalites() {
      const localitesIds = new Set(
        this.availableSapeur.map((s) => s.localite_id)
      );
      return this.localites.filter((l) => localitesIds.has(l.id));
    },
    computedChosenSapeurs() {
      return this.chosenSapeurs
        .map((sapeurId) => this.sapeurs.find((s) => s.id == sapeurId))
        .map((s) => ({ ...s, nomPrenom: this.sapeurFormatter(s) }))
        .sort((a, b) => a.nomPrenom.localeCompare(b.nomPrenom));
    },
    availableSapeur() {
      return this.sapeurs
        .slice(0)
        .filter((s) => (this.data.filter ?? (() => true))(s))
        .filter((s) => !this.chosenSapeurs.includes(s.id));
    },
    listeSapeurSelect() {
      const option = this.selectOptions[this.groupBy];
      if (option.generic) {
        return this.flattenedSapeurGeneric(
          option.collection(),
          this.groupBy,
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
            .map((s) => svm.sapeurs.find((sap) => sap.id == s))
            .forEach(
              (s) =>
                (flaten = [
                  ...flaten,
                  {
                    designation: svm.sapeurFormatter(s),
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
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    flattenedSapeurGeneric(relation, key, displayKey) {
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
            empty: !svm.sapeurs
              .map((s) => ({ ...s, sapeur_id: s.id }))
              .filter(svm.filtreSapeur())
              .filter((s) => s[key] == elem.id).length,
          },
        ];
        if (expanded) {
          liste = [
            ...liste,
            ...svm.sapeurs
              .map((s) => ({ ...s, sapeur_id: s.id }))
              .filter(svm.filtreSapeur())
              .filter((s) => s[key] == elem.id)
              .map((sapeur) => ({
                designation: `${sapeur.nom} ${sapeur.prenom}`,
                level: 1,
                leaf: true,
                id: sapeur.id,
                parent_id: sapeur[key],
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
      let svm = this;
      return (s) =>
        svm.sapeurs.find((sap) => sap.id == (s.sapeur_id || s))?.actif == 1 &&
        !svm.chosenSapeurs.includes(s.sapeur_id || s);
    },
    sapeurFormatter(s) {
      return s?.nom + ' ' + s?.prenom;
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
            .filter(([_, selected]) => selected)
            .map(([id, _]) => parseInt(id)),
        ])
      );
    },
    removeSapeurs() {
      const sapeursToRemove = new Set([
        ...Object.entries(this.selectedGeneric.sapeur)
          .filter(([_, selected]) => selected)
          .map(([id, _]) => parseInt(id)),
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

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
            <select class="form-select" v-model="groupBy" id="group-by">
              <option value="none">Alphabétique</option>
              <option value="fonction">Fonction</option>
              <option value="grade">Grade</option>
              <option value="civilite">Civilité</option>
              <option value="groupe">Groupes</option>
              <!-- TODO: Ajouter d'autres options -->
              <!-- TODO: Ajouter option permis -->
              <!-- TODO: Ajouter option Date incorporation -->
              <!-- TODO: Ajouter option Date naissance -->
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
              <tr v-if="chosenSapeurs.length <= 0">
                <td colspan="3">Aucun sapeur sélectioné</td>
              </tr>
              <tr
                v-for="item in chosenSapeurs.map((id) =>
                  sapeurs.find((s) => s.id == id)
                )"
                :key="item.id"
                :class="{
                  'table-primary': displaySelected[computeId(item)],
                }"
              >
                <td class="text-center">
                  <div class="form-check d-inline-block ps-0">
                    <input
                      type="checkbox"
                      class="form-check-input ms-0"
                      :id="item.id"
                      v-model="displaySelected[computeId(item)]"
                      @click="select(item.id, true)"
                    />
                    <label class="form-check-label" :for="item.id"></label>
                  </div>
                </td>
                <td>{{ sapeurFormatter(item) }}</td>
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
          <p
            v-if="
              groupBy != 'groupe' &&
              groupBy != 'none' &&
              groupBy != 'fonction' &&
              groupBy != 'civilite'
            "
          >
            En développement !
          </p>
          <table
            class="table table-sm"
            v-if="
              groupBy == 'groupe' ||
              groupBy == 'fonction' ||
              groupBy == 'grade' ||
              groupBy == 'civilite'
            "
          >
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
                  'table-primary': displaySelected[computeId(item)],
                  'text-muted': item.empty,
                }"
                @dblclick="toggleGroupe(item.id)"
              >
                <td :style="{ 'padding-left': item.level * 25 + 'px' }">
                  <font-awesome-icon
                    class="me-2 ms-2"
                    :icon="['fas', 'angle-down']"
                    v-if="!item.leaf && item.expanded"
                    @click="toggleGroupe(item.id)"
                  />
                  <font-awesome-icon
                    class="me-2 ms-2"
                    :icon="['fas', 'angle-right']"
                    v-if="!item.leaf && !item.expanded"
                    @click="toggleGroupe(item.id)"
                  />
                  <div class="form-check d-inline-block">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="computeId(item)"
                      v-model="displaySelected[computeId(item)]"
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
          <table class="table table-sm table-striped" v-if="groupBy == 'none'">
            <thead>
              <tr>
                <th></th>
                <th>Designation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody v-if="groupBy == 'none'">
              <tr
                v-for="item in availableSapeurs.map((id) =>
                  sapeurs.find((s) => s.id == id)
                )"
                :key="item.id"
                :class="{
                  'table-primary': selectedSapeurs.includes(item.id),
                }"
              >
                <td>
                  <div class="form-check d-inline-block">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="item.id"
                      v-model="displaySelected[item.id]"
                    />
                    <label
                      class="form-check-label"
                      :for="item.id"
                      @click="select(item.id)"
                    ></label>
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
// - Par cours
// - Date anniversaire
// - Permis de conduire

export default {
  name: 'ModalSapeurSelect',
  props: ['callback', 'data'],
  data() {
    return {
      groupBy: 'groupe',
      chosenSapeurs: [],
      selectedSapeurs: [],
      selectedGroups: [],
      expanded: {},
      displaySelected: {},
    };
  },
  mounted() {
    this.chosenSapeurs = this.data.slice(0);

    if (this.grades.length <= 0) {
      this.$store.dispatch('fetchGrades');
    }
    if (this.fonctions.length <= 0) {
      this.$store.dispatch('fetchFonctions');
    }
    if (this.civilites.length <= 0) {
      this.$store.dispatch('fetchCivilites');
    }

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
      grades: (state) => state.grade.liste,
      civilites: (state) => state.baseData.civilites,
      fonctions: (state) => state.fonction.liste,
      sapeurs: (state) => state.sapeur.liste,
      civilites: (state) => state.baseData.civilites,
    }),
    ...mapGetters(['treeGroupesSapeurs']),
    listeSapeurSelect() {
      if (this.groupBy == 'groupe') {
        return this.flattenedSapeurGroupe;
      } else if (this.groupBy == 'fonction') {
        return this.flattenedSapeurGeneric(
          this.fonctions,
          'fonction_id',
          'nom'
        );
      } else if (this.groupBy == 'grade') {
        return this.flattenedSapeurGeneric(
          this.grades,
          'fonction_id',
          'designation'
        );
      } else if (this.groupBy == 'civilite') {
        return this.flattenedSapeurGeneric(
          this.civilites,
          'civilite_id',
          'designation'
        );
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
            .map((s) => svm.sapeurs.find((s) => s.id == s))
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
    availableSapeurs() {
      return this.sapeurs
        .slice(0)
        .filter((s) => !this.chosenSapeurs.includes(s.id))
        .map((s) => s.id);
    },
    addSapeurState() {
      return (
        this.selectedSapeurs.filter((x) => !this.chosenSapeurs.includes(x))
          .length > 0
      );
    },
    removeSapeurState() {
      return (
        this.selectedSapeurs.filter((x) => this.chosenSapeurs.includes(x))
          .length > 0
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
      this.callback(null);
      this.HIDE_MODAL();
    },
    save() {
      // Sapeurs ajoutés
      const newSap = this.chosenSapeurs.filter((s) => !this.data.includes(s));
      // Sapeurs supprimés
      const removedSap = this.data.filter(
        (s) => !this.chosenSapeurs.includes(s)
      );
      // Sapeurs tous
      const sapeurs = this.chosenSapeurs;

      const svm = this;
      this.callback({ ajoute: newSap, supprime: removedSap, tous: sapeurs })
        .then(() => {
          svm.HIDE_MODAL();
        })
        .catch((errorMessage) => {
          console.error(errorMessage);
          svm.$awn.warning(errorMessage);
        });
    },
    select(id, leaf = true) {
      console.log(`Select ${id} ${leaf}`);
      if (leaf) {
        this.selectSapeur(id);
      } else {
        this.selectGroupe(id);
      }
    },
    selectSapeur(id) {
      this.selectedSapeurs = this.selectedSapeurs.includes(id)
        ? this.selectedSapeurs.filter((i) => i != id)
        : [...this.selectedSapeurs, id];
    },
    selectGroupe(id, state = undefined) {
      let selected = state || !this.selectedGroups.includes(id);
      let svm = this;

      // Select groupe itself
      let recursiveSearch = (item) => {
        let found = item.id == id;
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
      let svm = this;
      if (!first) {
        this.displaySelected = {
          ...this.displaySelected,
          [this.computeId({ leaf: false, id: groupe.id })]: state,
        };
      }

      this.selectedGroups = state
        ? Array.from(new Set([...this.selectedGroups, groupe.id]))
        : this.selectedGroups.filter((i) => i != groupe.id);

      if (this.groupBy == 'groupe') {
        groupe.sapeurs.filter(this.filtreSapeur()).forEach((s) => {
          svm.displaySelected = {
            ...svm.displaySelected,
            [svm.computeId({ leaf: true, id: s })]: state,
          };
          svm.selectedSapeurs = state
            ? Array.from(new Set([...svm.selectedSapeurs, s]))
            : svm.selectedSapeurs.filter((i) => i != s);
        });
        groupe.groupes.forEach((g) => svm.selectGroupSingle(g, state));
      } else if (this.groupBy == 'fonction') {
        svm.sapeurs
          .map((s) => ({ ...s, sapeur_id: s.id }))
          .filter(this.filtreSapeur())
          .filter((s) => s.fonction_id == groupe.id)
          .forEach((s) => {
            svm.displaySelected = {
              ...svm.displaySelected,
              [svm.computeId({ leaf: true, id: s.id })]: state,
            };
            svm.selectedSapeurs = state
              ? Array.from(new Set([...svm.selectedSapeurs, s.id]))
              : svm.selectedSapeurs.filter((i) => i != s.id);
          });
      }
    },
    filtreSapeur() {
      let svm = this;
      return (s) =>
        svm.sapeurs.find((s) => s.id == (s.sapeur_id || s)).actif == 1 &&
        !svm.chosenSapeurs.includes(s.sapeur_id || s);
    },
    sapeurFormatter(s) {
      return s.nom + ' ' + s.prenom;
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
        new Set([...this.chosenSapeurs, ...this.selectedSapeurs])
      );
    },
    removeSapeurs() {
      this.chosenSapeurs = this.chosenSapeurs.filter(
        (item) => !this.selectedSapeurs.includes(item)
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

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Gérer les sapeurs</h5>
      <button type="button" class="close" @click="close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="form-group">
            Afficher par
            <select class="form-control" v-model="groupBy">
              <option value="none">Aucun</option>
              <option value="fonction">Fonction</option>
              <option value="grade">Grade</option>
              <option value="civilite">Civilité</option>
              <option value="groupe">Groupes</option>
            </select>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <h6>Sapeur sélectionnés</h6>
          <button class="btn btn-outline-danger" @click="removeSapeurs">
            Enlever ces sapeurs
          </button>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Designation</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in chosenSapeurs.map(getSapeur)"
                :key="item.id"
                :class="{
                  'table-primary': displaySelectedSapeurs[computeId(item)]
                }"
              >
                <td>
                  <div class="custom-control custom-checkbox d-inline">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="item.id"
                      v-model="displaySelectedSapeurs[computeId(item)]"
                    />
                    <label
                      class="custom-control-label"
                      :for="item.id"
                      @click="selectSapeur(item.id)"
                    ></label>
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
          <h6>Sapeur disponibles</h6>
          <button class="btn btn-outline-primary" @click="addSapeurs">
            Ajouter ces sapeurs
          </button>
          <table class="table" v-if="groupBy === 'groupe'">
            <thead>
              <tr>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in flattenedTree"
                :key="item.parent_id + '-' + item.id"
                :class="{
                  'table-primary': displaySelectedSapeurs[computeId(item)]
                }"
              >
                <td :style="{ 'padding-left': item.level * 25 + 'px' }">
                  <font-awesome-icon
                    class="mr-2 ml-2"
                    :icon="['fas', 'angle-down']"
                    v-if="!item.leaf && item.expanded"
                    @click="toggleGroupe(item.id)"
                  />
                  <font-awesome-icon
                    class="mr-2 ml-2"
                    :icon="['fas', 'angle-right']"
                    v-if="!item.leaf && !item.expanded"
                    @click="toggleGroupe(item.id)"
                  />
                  <div class="custom-control custom-checkbox d-inline">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="computeId(item)"
                      v-model="displaySelectedSapeurs[computeId(item)]"
                    />
                    <label
                      class="custom-control-label"
                      :for="computeId(item)"
                      @click="selectSapeur(item.id, item.leaf)"
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
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <table class="table table-striped" v-if="groupBy === 'none'">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Designation</th>
              </tr>
            </thead>
            <tbody v-if="groupBy === 'none'">
              <tr
                v-for="item in availableSapeurs.map(getSapeur)"
                :key="item.id"
                :class="{
                  'table-primary': selectedSapeurs.includes(item.id)
                }"
              >
                <td>
                  <div class="custom-control custom-checkbox d-inline">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="item.id"
                      v-model="displaySelectedSapeurs[item.id]"
                    />
                    <label
                      class="custom-control-label"
                      :for="item.id"
                      @click="selectSapeur(item.id)"
                    ></label>
                  </div>
                </td>
                <td>{{ sapeurFormatter(item) }}</td>
                <td>
                  <button
                    class="btn btn-outline-primary border-0"
                    @click="addSingleSapeur(item.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ModalSapeurSelect',
  props: ['callback'],
  data() {
    return {
      groupBy: 'groupe',
      chosenSapeurs: [],
      availableSapeurs: [],
      selectedSapeurs: [],
      selectedGroups: [],
      expanded: {},
      displaySelectedSapeurs: {}
    }
  },
  mounted() {
    this.chosenSapeurs = [1, 2]
    this.$store.dispatch('fetchGroupesSapeurs').then(() => {
      this.availableSapeurs = this.treeGroupesSapeurs
      let svm = this
      let recursive = item => {
        svm.expanded = { ...svm.expanded, [item.id]: false }
        item.groupes.forEach(recursive)
      }
      this.treeGroupesSapeurs.forEach(recursive)
    })
  },
  computed: {
    ...mapGetters([
      'getSapeur',
      'listSapeur',
      'listFonctions',
      'listGrades',
      'listGroupes',
      'listCivilites',
      'treeGroupesSapeurs'
    ]),
    flattenedTree() {
      let flattened = []
      let svm = this
      let recursive = function(groupe, level) {
        let expanded = svm.expanded[groupe.id]
        let flaten = [
          {
            designation: svm.groupeFormatter(groupe),
            level: level,
            leaf: false,
            id: groupe.id,
            expanded: expanded
          }
        ]
        if (expanded) {
          groupe.groupes.forEach(
            g => (flaten = [...flaten, ...recursive(g, level + 1)])
          )
          groupe.sapeurs
            .filter(svm.filtreSapeur())
            .map(s => svm.getSapeur(s))
            .forEach(
              s =>
                (flaten = [
                  ...flaten,
                  {
                    designation: svm.sapeurFormatter(s),
                    leaf: true,
                    level: level + 1,
                    parent_id: groupe.id,
                    id: s.id
                  }
                ])
            )
        }
        return flaten
      }

      this.treeGroupesSapeurs.forEach(
        i => (flattened = [...flattened, ...recursive(i, 0)])
      )
      return flattened
    }
  },
  watch: {
    groupBy(value) {
      //TODO
      switch (value) {
        case 'none':
          this.availableSapeurs = this.listSapeur
            .slice(0)
            .filter(s => !this.chosenSapeurs.includes(s.id))
            .map(s => s.id)
          break
        case 'fonction':
          //TODO
          break
        case 'grade':
          //TODO
          break
        case 'civilite':
          //TODO
          break
        case 'groupe':
          this.$store.dispatch('fetchGroupesSapeurs').then(() => {
            this.availableSapeurs = this.treeGroupesSapeurs
          })
          break
      }
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    close() {
      this.callback(null)
      this.HIDE_MODAL()
    },
    selectSapeur(id, leaf = true) {
      if (leaf) {
        this.selectedSapeurs = this.selectedSapeurs.includes(id)
          ? this.selectedSapeurs.filter(i => i !== id)
          : [...this.selectedSapeurs, id]
      } else {
        this.selectedGroups = this.selectedGroups.includes(id)
          ? this.selectedGroups.filter(i => i !== id)
          : [...this.selectedGroups, id]
      }
    },
    filtreSapeur() {
      let svm = this
      return s => !svm.chosenSapeurs.includes(s.id || s)
    },
    sapeurFormatter(s) {
      return s.nom + ' ' + s.prenom
    },
    groupeFormatter(g) {
      return g.no ? g.no + ' ' + g.designation : g.designation
    },
    toggleGroupe(id) {
      this.expanded = {
        ...this.expanded,
        [id]: !this.expanded[id]
      }
    },
    addSapeurs() {
      if (this.groupBy === 'groupe') {
        this.chosenSapeurs = Array.from(
          new Set([...this.chosenSapeurs, ...this.selectedSapeurs])
        )
      } else {
        //TODO
      }
    },
    removeSapeurs() {
      if (this.groupBy === 'groupe') {
        this.chosenSapeurs = this.chosenSapeurs.filter(
          item => !this.selectedSapeurs.includes(item)
        )
      } else {
        //TODO
      }
    },
    addSingleSapeur(id) {
      this.chosenSapeurs = [...this.chosenSapeurs, id]
    },
    removeSingleSapeur(id) {
      this.chosenSapeurs = this.chosenSapeurs.filter(item => item !== id)
    },
    computeId(item) {
      return item.leaf === true || item.leaf === undefined
        ? item.id
        : 'g' + item.id
    }
  }
}
</script>

<style scoped></style>
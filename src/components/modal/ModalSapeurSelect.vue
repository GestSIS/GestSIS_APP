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
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Designation</th>
              </tr>
            </thead>
            <draggable v-model="chosenSapeurs" group="sapeurs" tag="tbody">
              <tr
                v-for="item in chosenSapeurs.map(getSapeur)"
                :key="item.id"
                :class="{
                  'table-primary': selectedSapeurs.includes(item.id)
                }"
              >
                <td>
                  <input
                    type="checkbox"
                    :value="selectedSapeurs.includes(item.id)"
                    @click="selectSapeur(item.id)"
                  />
                </td>
                <td>{{ item.nom }} {{ item.prenom }}</td>
                <td>{{ item.sport }}</td>
              </tr>
            </draggable>
          </table>
        </div>
        <div class="col-6">
          <h6>Sapeur disponibles</h6>
          <table class="table" v-if="groupBy === 'groupe'">
            <thead>
              <tr>
                <th>ico</th>
                <th scope="col">Designation</th>
                <th>Action +</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in flattenedTree"
                :key="item.parent_id + '-' + item.id"
              >
                <td>
                  <font-awesome-icon
                    :icon="['fas', 'angle-down']"
                    v-if="!item.leaf && item.expanded"
                  />
                  <font-awesome-icon
                    :icon="['fas', 'angle-right']"
                    v-if="!item.leaf && !item.expanded"
                  />
                </td>
                <td :style="{ 'padding-left': item.level * 25 + 'px' }">
                  <input
                    type="checkbox"
                    :value="selectedSapeurs.includes(item.id)"
                    @click="selectSapeur(item.id)"
                  />
                  {{ item.designation }}
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
            <draggable
              v-model="availableSapeurs"
              tag="tbody"
              group="sapeurs"
              v-if="groupBy === 'none'"
            >
              <tr
                v-for="item in availableSapeurs.map(getSapeur)"
                :key="item.id"
                :class="{
                  'table-primary': selectedSapeurs.includes(item.id)
                }"
              >
                <td>
                  <input
                    type="checkbox"
                    :value="selectedSapeurs.includes(item.id)"
                    @click="selectSapeur(item.id)"
                  />
                </td>
                <td>{{ groupe.nom }} {{ groupe.prenom }}</td>
              </tr>
            </draggable>
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
import Draggable from 'vuedraggable'

export default {
  name: 'ModalSapeurSelect',
  components: {
    Draggable
  },
  data() {
    return {
      groupBy: 'groupe',
      chosenSapeurs: [],
      availableSapeurs: [],
      selectedSapeurs: [],
      expended: []
    }
  },
  mounted() {
    this.chosenSapeurs = [1, 2]
    this.$store.dispatch('fetchGroupesSapeurs').then(() => {
      this.availableSapeurs = this.treeGroupesSapeurs
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
        let flaten = [
          {
            designation: svm.groupeFormatter(groupe),
            level: level,
            leaf: false,
            id: groupe.id,
            expanded: true
          }
        ]
        groupe.groupes.forEach(
          g => (flaten = [...flaten, ...recursive(g, level + 1)])
        )
        groupe.sapeurs
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
          break
        case 'grade':
          break
        case 'civilite':
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
    selectSapeur(id) {
      this.selectedSapeurs = this.selectedSapeurs.includes(id)
        ? this.selectedSapeurs.filter(i => i.id === id)
        : [...this.selectedSapeurs, id]
    },
    filterSapeur(liste) {
      return liste.filter(i => !this.chosenSapeurs.includes(i.id || i))
    },
    sapeurFormatter(s) {
      return s.nom + ' ' + s.prenom
    },
    groupeFormatter(g) {
      return g.no ? g.no + ' ' + g.designation : g.designation
    }
  }
}
</script>

<style scoped></style>

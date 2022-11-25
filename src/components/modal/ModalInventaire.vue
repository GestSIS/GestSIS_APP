<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Modifier l'inventaire</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
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
        </div>
      </div>
      <div class="row">
        <div class="col-3">
          <label>Filtres</label>
          <materiel-type-categorie-select @change="selectTypes" />
        </div>
        <div class="col-9">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Matériel</th>
                <th>Taille</th>
                <th v-if="tab == 'generique'">Quantité</th>
                <th v-if="tab == 'numerote'">Numéro</th>
                <th>Remarque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in filteredInventaire.filter(
                  (m) =>
                    (tab == 'generique' &&
                      (m.materiel?.quantite ?? null) != null) ||
                    (tab == 'numerote' &&
                      (m.materiel?.quantite ?? null) == null)
                )"
                :key="m.id"
              >
                <td>
                  <base-select
                    v-if="!m.id"
                    v-model="m.materiel_type_id"
                    value-key="id"
                    display-key="designation"
                    :options="types"
                    :select-class="{
                      'is-invalid': errors['materiel_type_id'],
                    }"
                  ></base-select>
                  <template v-else>
                    {{
                      types.find((t) => t.id === m.materiel_type_id)
                        ?.designation
                    }}
                  </template>
                </td>
                <td>
                  <input
                    v-if="!m.id"
                    v-model="m.materiel.taille"
                    type="text"
                    class="form-control form-control-sm"
                  />
                  <template v-else>{{ m.taille }}</template>
                </td>
                <td v-if="tab == 'generique'">
                  <input
                    v-model="m.materiel.quantite"
                    type="number"
                    class="form-control form-control-sm"
                  />
                </td>
                <td v-if="tab == 'numerote'">
                  <input
                    v-model="m.materiel.numero"
                    type="text"
                    class="form-control form-control-sm"
                  />
                </td>
                <td>
                  <input
                    v-model="m.remarque"
                    type="text"
                    class="form-control form-control-sm"
                  />
                </td>
                <td colspan="5">
                  <button class="btn btn-outline-danger" @click="remove(m)">
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">
                  <button class="btn btn-outline-primary" @click="add">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import MaterielTypeCategorieSelect from '@/components/materiel_personnel/MaterielTypeCategorieSelect.vue';

export default {
  name: 'ModalInventaire',
  components: {
    MaterielTypeCategorieSelect,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      tab: 'numerote',
      errors: {},
      inventaire: [],
      selectedTypes: {},
      removedIds: [],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      types: (state) => state.matPersoType.liste,
      materiels: (state) =>
        state.matPersoMateriel.liste.filter(
          (m) =>
            m.sapeur_id == null ||
            (m.retour != null &&
              m.sapeur_id != null &&
              m.materiel?.quantite == null)
        ),
    }),
    filteredInventaire() {
      const ids = new Set(
        Object.entries(this.selectedTypes)
          .filter(([, selected]) => selected)
          .map(([id]) => parseInt(id))
      );
      return this.inventaire.filter(
        (m) => ids.has(m.materiel_type_id) || m.materiel_type_id == null
      );
    },
  },
  mounted() {
    this.inventaire = [
      ...this.materiels.map((m) => ({ ...m, materiel: { ...m.materiel } })),
    ];
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    selectTypes(selected) {
      this.selectedTypes = selected.type;
    },
    remove(materiel) {
      this.inventaire = this.inventaire.filter((m) => m.id !== materiel.id);
      this.removedIds.push(materiel.id);
    },
    add() {
      if (this.tab === 'generique') {
        this.inventaire.push({
          id: null,
          remarque: '',
          taille: '',
          attribution: null,
          retour: null,
          sapeur_id: null,
          materiel_type_id: null,
          materiel: { quantite: 0 },
        });
      } else {
        this.inventaire.push({
          id: null,
          remarque: '',
          taille: '',
          attribution: null,
          retour: null,
          sapeur_id: null,
          materiel_type_id: null,
          materiel: { numero: 0 },
        });
      }
    },
    async save() {
      // Create new materiel
      const added = this.inventaire.filter((m) => m.id === null);
      const add = added.length
        ? this.$store.dispatch('addMatPerso', added)
        : Promise.resolve();

      // Update changed materiel
      const updated = this.inventaire.filter((m) => m.id !== null);
      const update = updated.length
        ? this.$store.dispatch('updateMatPerso', updated)
        : Promise.resolve();

      // Delete removed materiel
      const remove = this.removedIds.length
        ? this.$store.dispatch('deleteMatPerso', this.removedIds)
        : Promise.resolve();

      Promise.all([add, update, remove])
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch((errors) => (this.errors = errors));
    },
  },
};
</script>

<style scoped></style>

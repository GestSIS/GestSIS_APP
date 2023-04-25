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

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalAttributionMultiple',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      tab: 'numerote',
      depuisInventaire: true,
      activeAttribution: {
        date: new Date().toISOString().slice(0, 10),
        sapeur_id: null,
        numerotesDepuisInventaire: [
          {
            id: null,
            materiel_type_id: null,
            numero: null,
            taille: null,
            remarque: null,
          },
        ],
        numerotesHorsInventaire: [
          {
            materiel_type_id: null,
            numero: null,
            taille: null,
            remarque: null,
          },
        ],
        generiques: [
          {
            materiel_type_id: null,
            taille: null,
            quantite: null,
            remarque: null,
          },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      types: (state) =>
        state.matPersoType.liste.sort((e1, e2) =>
          e1?.designation.localeCompare(e2?.designation)
        ),
      materielNumeroteDispo: (state) =>
        state.matPersoMateriel.liste
          .filter(
            (m) =>
              m.materiel.numero && (m.retour != null || m.sapeur_id == null)
          )
          .map((m) => ({ ...m, ...m.materiel })),
      materielGeneriqueDispo: (state) =>
        state.matPersoMateriel.liste
          .filter((m) => m.retour != null || m.sapeur_id == null)
          .map((m) => ({ ...m, ...m.materiel })),
      sapeurs: (state) => state.sapeur.liste,
    }),
  },
  mounted() {
    this.$refs.sapeur.focus();
    this.activeAttribution = {
      ...this.activeAttribution,
      id: this.data?.id,
      quantite: this.data?.materiel?.quantite ?? null,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if (!this.activeAttribution.sapeur_id) {
        this.$awn.warning('Veuillez sélectionner un sapeur');
      }

      // Masse attribution
      const baseAttribution = {
        sapeur_id: this.activeAttribution.sapeur_id,
        date: this.activeAttribution.date,
      };

      const numerotes = this.depuisInventaire
        ? this.activeAttribution.numerotesDepuisInventaire
        : this.activeAttribution.numerotesHorsInventaire;

      const attributions = [
        ...numerotes
          .filter((m) => m.materiel_type_id && m.numero)
          .map((m) => ({ ...baseAttribution, ...m, quantite: null })),

        ...this.activeAttribution.generiques
          .filter((m) => m.materiel_type_id && m.quantite > 0)
          .map((m) => ({ ...baseAttribution, ...m })),
      ];

      this.$store
        .dispatch('attribuerMatPerso', {
          depuisInventaire: this.depuisInventaire,
          attributions,
        })
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch((errors) => (this.errors = errors));
    },
    addNumerote() {
      const data = this.depuisInventaire
        ? this.activeAttribution.numerotesDepuisInventaire
        : this.activeAttribution.numerotesHorsInventaire;

      data.push({
        materiel_type_id: null,
        numero: null,
        taille: null,
        remarque: null,
      });

      const count = data.length;
      this.$nextTick(() => {
        this.$refs[`numerote-${count - 1}`][0].focus();
      });
    },
    addGenerique() {
      this.activeAttribution.generiques.push({
        materiel_type_id: null,
        taille: null,
        quantite: null,
        remarque: null,
      });

      const count = this.activeAttribution.generiques.length;
      this.$nextTick(() => {
        this.$refs[`generique-${count - 1}`][0].focus();
      });
    },
    selectMaterielTypeNumerote(item, value) {
      // Select première combinaison valable
      const materiel = this.materielNumeroteDispo.find(
        (m) => m.materiel_type_id == value
      );
      item.id = materiel?.id;
      item.numero = materiel?.numero;
      item.taille = materiel?.taille;
      item.remarque = materiel?.remarque;
    },
    selectNumero(item, value) {
      const materiel = this.materielNumeroteDispo.find(
        (m) => m.materiel_type_id == item.materiel_type_id && m.numero == value
      );
      item.taille = materiel?.taille;
      item.id = materiel?.id;
      item.remarque = materiel?.remarque;
    },
    selectMaterielTypeGenerique(item) {
      item.quantite = 1;
    },
  },
};
</script>

<style scoped></style>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Nouveau événement</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6">
          <base-select
            v-model="activeEvent.materiel_event_type_id"
            class="mb-3"
            label="Événement"
            display-key="nom"
            base-option="&lt;Événement&gt;"
            :options="eventTypes"
          />
        </div>
        <div class="col-6">
          <div class="mb-3">
            <label for="date">Date</label>
            <input
              id="date"
              v-model="activeEvent.date"
              type="date"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date'] }"
            />
          </div>
        </div>
        <div class="col-12">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Matériel</th>
                <th>Numéro</th>
                <th>Sapeur</th>
                <th>Remarque</th>
                <th
                  v-if="
                    eventTypes.find(
                      (t) => t.id == activeEvent.materiel_event_type_id
                    )?.validable
                  "
                  class="text-center"
                >
                  Succès
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(materiel, index) in activeEvent.materiels"
                :key="index"
              >
                <td>
                  <base-select
                    :ref="'materiel-type-' + index"
                    v-model="materiel.materiel_type_id"
                    :options="materielTypes"
                    @update:model-value="
                      (value) => selectMateriel(materiel, value)
                    "
                  />
                </td>
                <td>
                  <base-select
                    v-model="materiel.id"
                    value-key="materiel_nominal_id"
                    display-key="numero"
                    :options="
                      filteredMaterielDispo.filter(
                        (m) =>
                          !materiel.materiel_type_id ||
                          m.materiel_type_id == materiel.materiel_type_id
                      )
                    "
                    @update:model-value="
                      (value) => selectNumero(materiel, value)
                    "
                  />
                </td>
                <td>
                  <base-select
                    v-model="materiel.sapeur_id"
                    display-key="nom_prenom"
                    base-option="&lt;Non-assigné&gt;"
                    :base-value="null"
                    :options="
                      sapeurs.filter((s) =>
                        filteredMaterielDispo.find(
                          (m) =>
                            (!materiel.materiel_type_id ||
                              m.materiel_type_id ==
                                materiel.materiel_type_id) &&
                            m.sapeur_id == s.id &&
                            !m.retour
                        )
                      )
                    "
                    @update:model-value="
                      (value) =>
                        selectSapeur(
                          materiel,
                          materiel.retour == null ? value : null
                        )
                    "
                  />
                </td>
                <td>
                  <input
                    id="remarque"
                    v-model="materiel.remarque"
                    type="text"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['remarque'] }"
                  />
                </td>
                <td
                  v-if="
                    eventTypes.find(
                      (t) => t.id == activeEvent.materiel_event_type_id
                    )?.validable
                  "
                  class="text-center"
                >
                  <input
                    id="materiel-succes-modal"
                    v-model="materiel.succes"
                    type="checkbox"
                    class="form-check-input"
                  />
                </td>
                <td>
                  <button
                    v-if="activeEvent.materiels.length > 1"
                    class="btn btn-outline-danger border-0"
                    @click="activeEvent.materiels.splice(index, 1)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
              <tr>
                <td
                  :colspan="
                    eventTypes.find(
                      (t) => t.id == activeEvent.materiel_event_type_id
                    )?.validable
                      ? 6
                      : 5
                  "
                >
                  <button class="btn btn-outline-primary" @click="addMateriel">
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
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Valider
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalMateriel',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      materielTypeIds: {},
      activeEvent: {
        success: true,
        materiel_event_type_id: null,
        date: new Date().toISOString().slice(0, 10),
        materiels: [{ succes: true }],
      },
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      eventTypes: (state) => state.matPersoEventType.liste,
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
      materielDispo: (state) => state.matPersoMateriel.liste,
    }),
    materielTypes() {
      const eventType = this.eventTypes.find(
        (e) => e.id == this.activeEvent.materiel_event_type_id
      );
      const typeIds = new Set(
        eventType?.materiel_types?.map((t) => parseInt(t.id)) ?? []
      );
      return this.types.filter((t) => typeIds.has(parseInt(t.id)));
    },
    filteredMaterielDispo() {
      const eventType = this.eventTypes.find(
        (e) => e.id == this.activeEvent.materiel_event_type_id
      );
      const typeIds = new Set(
        eventType?.materiel_types?.map((t) => t.id) ?? []
      );
      return this.materielDispo
        .filter((m) => typeIds.has(parseInt(m.materiel_type_id)))
        .map((m) => ({
          ...m,
          ...m.materiel,
          materiel_nominal_id: m.materiel?.id,
        }));
    },
  },
  mounted() {
    this.activeEvent = {
      ...this.activeEvent,
      ...this.data,
    };
    this.$refs[`materiel-type-0`][0].focus();
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    addMateriel() {
      this.activeEvent.materiels.push({ succes: true });

      const count = this.activeEvent.materiels.length;
      this.$nextTick(() => {
        this.$refs[`materiel-type-${count - 1}`][0].focus();
      });
    },
    selectMateriel(materiel, materielTypeId) {
      const mat = this.filteredMaterielDispo.find(
        (m) => m.materiel_type_id == materielTypeId
      );
      materiel.id = mat?.materiel_nominal_id;
      materiel.numero = mat?.numero;
      materiel.sapeur_id = mat?.retour == null ? mat?.sapeur_id : null;
    },
    selectNumero(materiel, matId) {
      if (matId) {
        const mat = this.filteredMaterielDispo.find(
          (m) => m.materiel_nominal_id == matId
        );
        materiel.materiel_nominal_id = mat?.materiel_nominal_id;
        materiel.numero = mat?.numero;
        materiel.sapeur_id = mat?.retour != null ? null : mat?.sapeur_id;
        materiel.materiel_type_id = mat?.materiel_type_id;
      }
    },
    selectSapeur(materiel, sapeurId) {
      if (sapeurId) {
        const mat = this.filteredMaterielDispo.find(
          (m) =>
            m.sapeur_id == sapeurId &&
            (!materiel.materiel_type_id ||
              m.materiel_type_id == materiel.materiel_type_id)
        );
        materiel.materiel_nominal_id = mat?.materiel_nominal_id;
        materiel.numero = mat?.numero;
        materiel.sapeur_id = mat?.retour ? null : mat?.sapeur_id;
        materiel.materiel_type_id = mat?.materiel_type_id;
      }
    },
    async save() {
      const baseData = {
        date: this.activeEvent.date,
        materiel_event_type_id: this.activeEvent.materiel_event_type_id,
        remarque: '',
      };
      const events = this.activeEvent.materiels
        .filter((m) => m.materiel_nominal_id)
        .map((m) => ({
          ...baseData,
          ...m,
          materiel_nominal_id: m.materiel_nominal_id,
        }));

      this.$store
        .dispatch('addMatPersoEvents', events)
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
            (this.errors = {
              ...errors,
            })
        );
    },
  },
};
</script>

<style scoped></style>

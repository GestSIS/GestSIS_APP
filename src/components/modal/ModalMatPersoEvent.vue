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
            value-key="id"
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
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(materiel, index) in activeEvent.materiels"
                :key="index"
              >
                <td>
                  <base-select
                    v-model="materiel.materiel_type_id"
                    class="mb-3"
                    value-key="id"
                    display-key="designation"
                    :options="materielTypes"
                    @update:model-value="
                      (value) => selectMateriel(materiel, value)
                    "
                  />
                </td>
                <td>
                  <base-select
                    v-model="materiel.id"
                    class="mb-3"
                    value-key="id"
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
                    class="mb-3"
                    value-key="id"
                    display-key="label"
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
                      (value) => selectSapeur(materiel, value)
                    "
                  />
                </td>
                <td>
                  <input
                    id="remarque"
                    v-model="activeEvent.remarque"
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
                    v-model="activeEvent.succes"
                    type="checkbox"
                    class="form-check-input"
                  />
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
        {{ activeEvent.id ? 'Modifier' : 'Ajouter' }}
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
        materiels: [{ id: null, numero: null }],
      },
      selectedIds: {
        type: {},
        categorie: {},
      },
    };
  },
  computed: {
    ...mapState({
      categories: (state) =>
        state.matPersoCategorie.liste.sort(
          (a, b) => a.designation - b.designation
        ),
      sapeurs: (state) =>
        state.sapeur.liste.map((s) => ({
          ...s,
          label: `${s.nom} ${s.prenom}`,
        })),
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
        .map((m) => ({ ...m, ...m.materiel }));
    },
    computedData() {
      let indexedTypes = {};
      this.types.forEach((t) => {
        if (!indexedTypes[t.materiel_categorie_id])
          indexedTypes[t.materiel_categorie_id] = [t];
        else indexedTypes[t.materiel_categorie_id].push(t);
      });
      let indexedCategories = {};
      this.categories.forEach((c) => {
        if (!indexedCategories[c.pere_id]) indexedCategories[c.pere_id] = [c];
        else indexedCategories[c.pere_id].push(c);
      });

      let data = [];

      const recursive = (categories, level) => {
        categories.forEach((c) => {
          data.push({
            ...c,
            globalId: 'c' + c.id,
            type: 'categorie',
            level: level,
            tag: 'tag',
          });

          if (indexedCategories[c.id])
            recursive(indexedCategories[c.id], level + 1);

          indexedTypes[c.id]?.forEach((t) => {
            data.push({
              ...t,
              globalId: 't' + t.id,
              type: 'type',
              level: level + 1,
              tag: 'shirt',
            });
          });
        });
      };

      recursive(
        this.categories.filter((c) => !c.pere_id),
        0
      );
      return data;
    },
  },
  mounted() {
    this.activeEvent = {
      ...this.activeEvent,
      ...this.data,
    };

    this.types.forEach((t) => (this.selectedIds.type[t.id] = false));
    this.categories.forEach((t) => (this.selectedIds.categorie[t.id] = false));
    this.data?.materiel_types?.forEach(
      (a) => (this.selectedIds.type[a.id] = true)
    );
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    select(item, event) {
      const selected = event.target.checked;

      const categorieIds = new Set([item.id]);
      this.computedData.forEach((e) => {
        if (e.type === 'categorie' && categorieIds.has(parseInt(e.pere_id))) {
          categorieIds.add(e.id);
          this.selectedIds.categorie[e.id?.toString()] = selected;
        }
        if (e.type === 'type' && categorieIds.has(e.materiel_categorie_id)) {
          this.selectedIds.type[e.id] = selected;
        }
      });
    },
    selectMateriel(materiel, materielTypeId) {
      const mat = this.materielDispo.find(
        (m) => m.materiel_type_id == materielTypeId
      );
      materiel.id = mat?.id;
      materiel.numero = mat?.numero;
      materiel.sapeur_id = mat?.retour ? null : mat?.sapeur_id;
    },
    selectNumero(materiel, matId) {
      if (matId) {
        const mat = this.materielDispo.find((m) => m.id == matId);
        materiel.id = mat?.id;
        materiel.numero = mat?.numero;
        materiel.sapeur_id = mat?.retour ? null : mat?.sapeur_id;
        materiel.materiel_type_id = mat?.materiel_type_id;
      }
    },
    selectSapeur(materiel, sapeurId) {
      if (sapeurId) {
        const mat = this.materielDispo.find(
          (m) =>
            m.sapeur_id == sapeurId &&
            (!materiel.materiel_type_id ||
              m.materiel_type_id == materiel.materiel_type_id) //&&            (!materiel.numero || m.numero == materiel.numero)
        );
        materiel.id = mat?.id;
        materiel.numero = mat?.numero;
        materiel.sapeur_id = mat?.retour ? null : mat?.sapeur_id;
        materiel.materiel_type_id = mat?.materiel_type_id;
      }
    },
    async save() {
      this.activeEvent.materielTypeIds = Object.entries(this.selectedIds.type)
        .filter(([, value]) => value)
        .map(([key]) => key);
      this.$store
        .dispatch(
          (this.activeEvent.id || 0) === 0
            ? 'addMatPersoEventType'
            : 'updateMatPersoEventType',
          this.activeEvent
        )
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

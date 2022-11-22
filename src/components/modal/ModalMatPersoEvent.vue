<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Nouveau événement</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <base-select
        class="mb-3"
        value-key="id"
        display-key="designation"
        base-option="&lt;Type&gt;"
        :options="eventType"
        @input="(value) => onFilter('type_intervention_id', value)"
      />
      <base-select
        class="mb-3"
        value-key="id"
        label="Matériel"
        display-key="label"
        base-option="&lt;Matériel&gt;"
        :options="filteredMateriel"
      />
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="activeEvent.date"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="activeEvent.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
      <div class="mb-3 form-check">
        <input
          id="materiel-succes-modal"
          v-model="activeEvent.succes"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="materiel-succes-modal">OK</label>
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
        materiel_event_id: null,
        date: new Date(),
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
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
    }),
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

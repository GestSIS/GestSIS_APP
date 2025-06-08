<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Retour matériel</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="date">Date du retour</label>
        <input
          id="date"
          v-model="activeAttribution.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['attributions.0.date'] }"
        />
      </div>
      <div class="mb-3">
        <!-- <label>Matériel retourné</label> -->
        <table class="table table-sm table-striped">
          <thead>
            <tr>
              <th>
                <input
                  v-model="all"
                  type="checkbox"
                  class="form-check-input"
                  @change="toggleAll($event.target.checked)"
                />
              </th>
              <th>Matériel</th>
              <th>Quantité</th>
              <th>Taille</th>
              <th>Numéro</th>
              <th>Remarque</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in data"
              :key="item.id"
              :class="{ 'table-primary': selected[item.id] }"
            >
              <td>
                <input
                  :id="item.id"
                  v-model="selected[item.id]"
                  type="checkbox"
                  class="form-check-input"
                />
              </td>
              <td>
                {{
                  types.find((e) => e.id === item.materiel_type_id)?.designation
                }}
              </td>
              <td>{{ item.materiel?.quantite ?? 1 }}</td>
              <td>{{ item.taille }}</td>
              <td>{{ item.materiel?.numero }}</td>
              <td>{{ item.remarque }}</td>
            </tr>
          </tbody>
        </table>
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
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ModalRetourMultiple',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      all: true,
      errors: {},
      activeAttribution: {
        date: new Date().toISOString().slice(0, 10),
      },
      selected: {},
    };
  },
  computed: {
    ...mapState({ types: (state) => state.matPersoType.liste }),
  },
  mounted() {
    this.activeAttribution = {
      ...this.activeAttribution,
    };
    this.data.forEach((m) => (this.selected[m.id] = true));
  },
  methods: {
    ...mapActions(useModalStore, { HIDE_MODAL: 'closeModal' }),
    toggleAll(value) {
      this.selected = Object.fromEntries(this.data.map((e) => [e.id, value]));
    },
    async save() {
      this.$store
        .dispatch('retourMatPerso', {
          date: this.activeAttribution.date,
          materielIds: Object.entries(this.selected)
            .filter(([, selected]) => selected)
            .map(([id]) => id),
        })
        .then(() => {
          this.errors = {};
          this.$store.dispatch('fetchMatPersoARecuperer');
          this.HIDE_MODAL();
        })
        .catch((errors) => (this.errors = errors));
    },
  },
};
</script>

<style scoped></style>

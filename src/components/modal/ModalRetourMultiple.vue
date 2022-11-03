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
              <th></th>
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
                <div class="form-check d-inline-block">
                  <input
                    :id="item.id"
                    v-model="selected[item.id]"
                    type="checkbox"
                    class="form-check-input"
                  />
                  <label class="form-check-label" :for="item.id"></label>
                </div>
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
import { objectToString } from '@vue/shared';
import { mapMutations, mapState } from 'vuex';

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
    ...mapMutations(['HIDE_MODAL']),
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

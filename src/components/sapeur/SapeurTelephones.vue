<template>
  <!-- Téléphones -->
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button @click.prevent="saveTelephones" class="btn btn-primary">
        Enregistrer
      </button>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm">
        <thead>
          <tr>
            <th :class="{ 'd-none': telephones.length <= 1 }">Priorité</th>
            <th>Numéro</th>
            <th>Type</th>
            <th>
              RTA
              <font-awesome-icon
                class="ms-1"
                v-tooltip.bottom="
                  'Cocher pour transmettre à la centrale d\'alarme RTA'
                "
                :icon="['far', 'question-circle']"
              />
            </th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tr v-if="telephones.length <= 0">
          <td colspan="5">Aucun numéro enregistré</td>
        </tr>
        <draggable tag="tbody" v-model="telephones">
          <tr v-for="t in telephones" :key="t.id">
            <td
              class="text-center"
              :class="{ 'd-none': telephones.length <= 1 }"
            >
              {{ t.priorite }}
            </td>
            <td>
              <input
                class="form-control form-control-sm"
                type="text"
                v-model="t.numero"
                placeholder="..."
              />
            </td>
            <td>
              <select
                class="form-select form-select-sm"
                v-model="t.telephone_type_id"
              >
                <option v-for="t in telephonesTypes" :value="t.id" :key="t.id">
                  {{ t.type }}
                </option>
              </select>
            </td>
            <td class="align-middle text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :id="t.priorite"
                v-model="t.rta"
              />
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="removeTelephone(t.priorite)"
                required
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </draggable>
      </table>
      <button
        type="button"
        class="btn btn-outline-primary"
        @click="addTelephone()"
        :disabled="this.telephonesData.length >= 3"
      >
        <font-awesome-icon class="me-1" :icon="['fas', 'plus']" />
        Ajouter un numéro
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import draggable from 'vuedraggable';

export default {
  components: {
    draggable,
  },
  mounted() {
    this.telephonesData = [
      ...this.activeSapeurTelephones.map((t) => Object.assign({}, t)),
    ];
  },
  data() {
    return {
      telephonesData: [],
      errorsTel: {},
    };
  },
  watch: {
    activeSapeurTelephones() {
      this.telephonesData = [
        ...this.activeSapeurTelephones.map((t) => Object.assign({}, t)),
      ];
    },
  },
  computed: {
    ...mapState({
      telephonesTypes: (state) => state.baseData.telephoneTypes,
    }),
    ...mapGetters(['activeSapeurTelephones']),
    telephones: {
      get: function () {
        return this.telephonesData;
      },
      set(telephones) {
        telephones.forEach((t, i) => (t.priorite = i + 1));

        this.telephonesData = telephones.sort(
          (t1, t2) => t1.priorite - t2.priorite
        );
      },
    },
  },
  methods: {
    saveTelephones() {
      //TODO: Validation de toutes les données

      this.activeSapeurTelephones.forEach((t) => {
        //Suppression des numéros supprimé
        if (this.telephones.filter((t2) => t2.id === t.id).length === 0) {
          this.$store.dispatch('removeTelephoneSapeur', t.id);
        }
      });

      this.telephones.forEach((t) => {
        //Numéros modifiés
        if (t.id !== null) {
          this.$store.dispatch('editTelephoneSapeur', t);
        }
        //Nouveaux numéros
        else {
          this.$store.dispatch('addTelephoneSapeur', t);
        }
      });
    },
    addTelephone() {
      if (this.telephonesData.length < 3) {
        this.telephones = [
          ...this.telephones,
          {
            id: null,
            telephone_type_id: 0, //this.listTelephoneTypes[0].id, //TODO Choisir si select de base
            rta: 0,
            priorite: this.telephones.length + 1,
          },
        ];
      }
    },
    removeTelephone(priorite) {
      this.telephones = this.telephones.filter((t) => t.priorite !== priorite);
    },
  },
};
</script>

<style lang="scss" scoped></style>

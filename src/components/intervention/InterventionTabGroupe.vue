<template>
  <div class="col-xs-12 col-md-6">
    <!-- general form elements -->
    <div class="card card-primary card-outline mb-3">
      <!-- /.card-header -->
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Groupes</h3>
        <button type="button" class="btn btn-primary" @click="save">
          Enregistrer
        </button>
      </div>
      <div class="card-body">
        <table id="int-groupes" class="table table-sm">
          <thead>
            <tr>
              <th>Groupe</th>
              <th>Alarmé</th>
            </tr>
          </thead>
          <tbody id="groupes">
            <tr v-if="groupes.length <= 0">
              <td colspan="2">
                Aucun groupe de disponible pour votre SIS, ajoutez-en dans
                <em>organisation</em>.
              </td>
            </tr>
            <tr v-for="g in groupes" :key="g.id">
              <td>
                <label :for="'g-' + g.id">{{
                  (g.no ? g.no + ' ' : '') + g.designation
                }}</label>
              </td>
              <td>
                <div class="mb-3 text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="'g-' + g.id"
                    v-model="selected[g.no]"
                  />
                  <label class="form-check-label" :for="'g-' + g.id"></label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'InterventionTabGroupes',
  data() {
    return {
      selected: {},
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste.filter((g) => g.type === 1),
      interventionGroupes: (state) => state.intervention.active.groupes,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
    filteredGroupes() {
      const nos = new Set(this.interventionGroupes.map((g) => g.no));
      return [
        ...this.interventionGroupes,
        ...this.groupes.filter((g) => !nos.has(g.no)),
      ];
    },
    additionalGroupes() {
      return 0;
    },
  },
  mounted() {
    if (this.groupes.length === 0) {
      this.$store.dispatch('fetchGroupes');
    }
    this.$store
      .dispatch('fetchInterventionGroupes', this.activeInterventionId)
      .then(() => {
        this.updateGroupes(this.interventionGroupes);
      });
  },
  watch: {
    interventionGroupes(value) {
      this.updateGroupes(value);
    },
  },
  methods: {
    async save() {
      let groupesNo = this.interventionGroupes.map((g) => g.no);
      let nos = Object.keys(this.selected)
        .filter((item) => this.selected[item])
        .map((x) => parseInt(x));

      //New One
      let newOnes = nos.filter((item) => !groupesNo.includes(item));

      //Removed
      let removed = groupesNo.filter((item) => !nos.includes(item));
      let removedIds = [
        ...this.interventionGroupes
          .filter((g) => removed.includes(g.no))
          .map((g) => g.id),
      ];

      if (removedIds.length > 0) {
        this.$store.dispatch('removeInterventionGroupes', removedIds);
      }

      if (newOnes.length > 0) {
        this.$store.dispatch('addInterventionGroupes', [
          ...this.groupes.filter((g) => newOnes.includes(g.no)),
        ]);
      }
    },
    updateGroupes(value) {
      this.selected = {};
      let svm = this;

      value.forEach((v) => (svm.selected = { ...svm.selected, [v.no]: true }));
    },
  },
};
</script>

<style scoped></style>

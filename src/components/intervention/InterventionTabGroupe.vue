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
              <td colspan="2">Aucun groupe de disponible pour votre SIS, ajoutez-en dans <em>organisation</em>.</td>
            </tr>
            <tr
              v-for="v in groupes"
              :key="v.id"
            >
              <td>{{ v.designation }}</td>
              <td>
                <div class="form-group">
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'v-' + v.id"
                      v-model="selected[v.id]"
                    />
                    <label
                      class="custom-control-label"
                      :for="'v-' + v.id"
                    ></label>
                  </div>
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
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'InterventionTabGroupes',
  data() {
    return {
      selected: {},
    };
  },
  computed: {
    ...mapGetters(['getGroupe']),
    ...mapState({
      groupes: (state) => state.groupe.liste.filter((g) => (g.actif === 1 && g.type === 1) || state.intervention.active.groupes.find((gi) =>gi.groupe_id === g.id)),
      interventionGroupes: (state) => state.intervention.active.groupes,
      activeInterventionId: (state) => state.intervention.active.id,
    }),
  },
  mounted() {
    if (this.groupes.length === 0) {
      this.$store.dispatch('fetchGroupes')
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
    save() {
      let groupesIds = this.interventionGroupes.map((v) => v.groupe_id);
      let ids = Object.keys(this.selected)
        .filter((item) => this.selected[item])
        .map((x) => parseInt(x));

      //New One
      let newOne = ids.filter((item) => !groupesIds.includes(item));

      //Removed
      let removed = groupesIds.filter((item) => !ids.includes(item));
      let removedIds = removed.map(
        (groupe_id) =>
          this.interventionGroupes
            .filter((v) => v.groupe_id === groupe_id)
            .map((v) => v.id)[0]
      );

      if (removedIds.length > 0) {
        this.$store.dispatch('removeInterventionGroupes', removedIds);
      }
      if (newOne.length > 0) {
        this.$store.dispatch('addInterventionGroupes', newOne);
      }
    },
    updateGroupes(value) {
      this.selected = {};
      let svm = this;

      value.forEach(
        (v) => (svm.selected = { ...svm.selected, [v.groupe_id]: true })
      );
    },
  },
};
</script>

<style scoped></style>

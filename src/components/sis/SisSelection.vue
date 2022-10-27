<template>
  <div>
    <hr class="bg-secondary" />
    <div class="info">
      <div class="mb-3">
        <!--<label class="input-group-text" for="inputGroupSelect01">Options</label>-->
        <select
          id="inputGroupSelect01"
          v-model="sisId"
          class="form-select form-select-sm"
          @change="selectSis($event)"
        >
          <option
            v-for="sis in availableSisListe"
            :key="sis.id"
            :value="sis.id"
          >
            {{ sis.nom }}
          </option>
        </select>
      </div>
      <!-- <a href="#" class="d-block">
             &lt;!&ndash; @if(!empty($user_details['nom']))
             {{ $user_details['prenom'] }} {{ $user_details['nom'] }}
             @else
             {{ $user_details['nom_utilisateur'] }}
             @endif&ndash;&gt;
             John Doe
      </a>-->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'SisSelection',
  data() {
    return {
      sisId: null,
    };
  },
  computed: {
    ...mapGetters(['availableSisListe']),
    ...mapState({
      activeSisId: (state) => state.auth.sis.activeId,
      listeSis: (state) => state.auth.sis.liste,
    }),
  },
  watch: {
    activeSisId() {
      this.sisId = this.activeSisId;
    },
  },
  mounted() {
    this.sisId = this.activeSisId;
  },
  methods: {
    selectSis(event) {
      const sis = this.listeSis.find((s) => s.id == event.target.value);
      this.$store.dispatch('selectSis', sis).then(() => {
        this.$router.push({ name: 'dashboard' });
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>

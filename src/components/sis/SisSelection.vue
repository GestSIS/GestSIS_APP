<template>
  <div>
    <hr class="bg-secondary" />
    <div class="info">
      <base-select
        v-model="sisId"
        class="mb-3"
        display-key="nom"
        :options="availableSisListe"
        @update:model-value="(sisId) => selectSis(sisId)"
      />
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
    selectSis(sisId) {
      const sis = this.listeSis.find((s) => s.id == sisId);
      this.$store.dispatch('selectSis', sis).then(() => {
        this.$router.push({ name: 'dashboard' });
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>

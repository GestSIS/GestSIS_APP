<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const availableSisListe = computed(() => store.getters.availableSisListe);
const activeSisId = computed(() => store.state.auth.sis.activeId);
const listeSis = computed(() => store.state.auth.sis.liste);

const selectSis = (sisId) => {
  if (sisId != activeSisId.value) {
    const sis = listeSis.value.find((s) => s.id == sisId);
    store.dispatch('selectSis', sis).then(() => {
      router.push({ name: 'dashboard' });
    });
  }
};
</script>

<template>
  <div>
    <hr class="bg-secondary" />
    <div class="info">
      <base-select
        :model-value="activeSisId"
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

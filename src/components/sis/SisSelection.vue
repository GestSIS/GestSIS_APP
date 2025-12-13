<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth/Auth.js';

const router = useRouter();
const authStore = useAuthStore();

const availableSisListe = computed(() => authStore.availableSisListe);
const activeSisId = computed(() => authStore.sis.activeId);
const listeSis = computed(() => authStore.sis.liste);

const selectSis = async (sisId) => {
  if (sisId != activeSisId.value) {
    await router.push({ name: 'dashboard' });
    const sis = listeSis.value.find((s) => s.id == sisId);
    authStore.selectSis(sis);
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

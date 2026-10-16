<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth/Auth.js";

const router = useRouter();
const authStore = useAuthStore();

const availableSisListe = computed(() => authStore.availableSisListe);
const activeSisId = computed(() => authStore.organisation.activeId);
const organisations = computed(() => authStore.organisations);

const selectOrganisation = async (id) => {
  if (id != activeSisId.value) {
    await router.push({ name: "accueil" });
    const sis = organisations.value.find((s) => s.id == id);
    authStore.selectOrganisation(sis);
  }
};
</script>

<template>
  <div>
    <hr class="bg-secondary" />
    <div class="info">
      <p v-if="availableSisListe.length == 1">
        {{ availableSisListe.find((s) => s.id == activeSisId)?.nom }}
      </p>
      <base-select
        v-else
        :model-value="activeSisId"
        class="mb-3"
        display-key="nom"
        :options="availableSisListe"
        @update:model-value="(id) => selectOrganisation(id)"
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

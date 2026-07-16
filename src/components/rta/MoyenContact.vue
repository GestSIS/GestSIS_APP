<script setup>
import { formatPhoneNumber } from "../../composables/usePhoneFormatter";

const props = defineProps({
  moyenContact: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <FontAwesomeIcon v-if="props.moyenContact.type === 'Privé'" :icon="['far', 'house']" />
  <FontAwesomeIcon
    v-else-if="props.moyenContact.type === 'Mobile'"
    :icon="['fas', 'mobile-screen']"
  />
  <FontAwesomeIcon v-else-if="props.moyenContact.type === 'Prof'" :icon="['fas', 'industry']" />
  {{ formatPhoneNumber(props.moyenContact.numero || "") }}
</template>

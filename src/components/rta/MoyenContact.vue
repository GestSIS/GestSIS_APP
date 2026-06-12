<script setup>
import { formatPhoneNumber } from '../../composables/usePhoneFormatter';

const props = defineProps({
  moyenContact: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <FontAwesomeIcon
    :icon="['far', 'house']"
    v-if="props.moyenContact.type === 'Privé'"
  />
  <FontAwesomeIcon
    :icon="['fas', 'mobile-screen']"
    v-else-if="props.moyenContact.type === 'Mobile'"
  />
  <FontAwesomeIcon
    :icon="['fas', 'industry']"
    v-else-if="props.moyenContact.type === 'Prof'"
  />
  {{ formatPhoneNumber(props.moyenContact.numero || '') }}
</template>

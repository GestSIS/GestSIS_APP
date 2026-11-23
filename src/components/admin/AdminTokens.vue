<script setup>
import { computed, ref } from "vue";
import { TokenService } from "../../services/StorageService.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { useClipboard } from "../../composables/useClipboard.js";

const authStore = useAuthStore();
const { copy } = useClipboard();

const accessToken = ref(TokenService.getAccessToken());
const refreshToken = ref(TokenService.getRefreshToken());

const tokens = computed(() => [
  { id: "access-token", label: "Access Token", value: accessToken.value },
  { id: "refresh-token", label: "Refresh Token", value: refreshToken.value },
]);

const refreshTokens = () =>
  authStore.refreshToken().then(() => {
    accessToken.value = TokenService.getAccessToken();
    refreshToken.value = TokenService.getRefreshToken();
  });
</script>

<template>
  <div class="row">
    <div class="col-md-6">
      <base-card title="Tokens de la session">
        <template #header>
          <button type="button" class="btn btn-primary btn-sm" @click="refreshTokens">
            Refresh tokens
          </button>
        </template>
        <template #body>
          <div v-for="token in tokens" :key="token.id" class="mb-3">
            <label :for="token.id" class="form-label">{{ token.label }}</label>
            <div class="input-group">
              <input
                :id="token.id"
                type="text"
                class="form-control"
                :value="token.value"
                readonly
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                :title="`Copier le ${token.label}`"
                :aria-label="`Copier le ${token.label}`"
                @click="copy(token.value)"
              >
                <font-awesome-icon :icon="['far', 'clipboard']" />
              </button>
            </div>
          </div>
        </template>
      </base-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import useNotification from '../composables/useNotification.js';
import { useAuthStore } from '../stores/auth/Auth';

const jeton = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const newPasswordRepeated = ref('');
const errors = ref({});

const authStore = useAuthStore();

const isPasswordIdentical = computed(
  () => newPassword.value === newPasswordRepeated.value,
);
const awn = useNotification();

const refreshTokens = async () => {
  authStore
    .refreshToken()
    .then(() => awn.success('Permissions rechargées'))
    .catch(() =>
      awn.alert('Vous avez été déconnecté, veuillez-vous reconnecter'),
    );
};
const utiliserJeton = async () => {
  if (!jeton.value) {
    awn.alert('Jeton invalide');
  } else {
    authStore
      .useToken(jeton.value)
      .then((message) => {
        awn.success(message || 'Jeton enregistré avec succès');
        jeton.value = '';
      })
      .catch((e) => awn.alert(e?.message || 'Jeton déjà utilisé ou invalide.'));
  }
};

const changerMotDePasse = async () => {
  errors.value.password = newPassword.value.length < 7;
  if (!isPasswordIdentical.value || errors.value.password) {
    return;
  }

  authStore
    .changePassword({
      password: oldPassword.value,
      newPassword: newPassword.value,
    })
    .then((response) => {
      awn.success(response?.message || 'Mot de passe mis à jour');
      oldPassword.value = '';
      newPassword.value = '';
      newPasswordRepeated.value = '';
    })
    .catch((e) => awn.alert(e?.message || 'Mot de passe incorrect'));
};
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Paramètres utilisateur
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-sm-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Utiliser un jeton</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="jeton">Jeton</label>
              <input
                id="jeton"
                v-model="jeton"
                type="text"
                class="form-control form-control-sm"
                placeholder="jeton"
              />
            </div>
            <button class="btn btn-primary" @click="utiliserJeton">
              Utiliser
            </button>
          </div>
        </div>
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Recharger mes permission</h3>
          </div>
          <div class="card-body">
            <button class="btn btn-primary" @click="refreshTokens">
              Charger
            </button>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Changer mon mot de passe</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="old-password">Ancien mot de passe</label>
              <input
                id="old-password"
                v-model="oldPassword"
                type="password"
                placeholder="mot de passe"
                required
                autocomplete="off"
                class="form-control form-control-sm"
              />
            </div>
            <div class="mb-3">
              <label for="new-password">Nouveau mot de passe</label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                placeholder="mot de passe"
                required
                autocomplete="off"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.password }"
              />
              <div v-if="errors.password" class="invalid-feedback">
                Taille minimum: 8
              </div>
            </div>

            <div class="mb-3">
              <label for="new-password-repeated"
                >Répéter le nouveau mot de passe</label
              >
              <input
                id="newPasswordRepeated"
                v-model="newPasswordRepeated"
                type="password"
                placeholder="répéter mot de passe"
                required
                autocomplete="off"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': !isPasswordIdentical }"
              />
              <div v-if="!isPasswordIdentical" class="invalid-feedback">
                Mot de passe différent
              </div>
            </div>
            <button class="btn btn-primary" @click="changerMotDePasse">
              Changer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--
  TODO: Fonctionalitées pour le future
  - Demander un renvoi de la confirmation de l'email si pas validé
  - Supprimer ses accès pour un SIS
  - Changer son email
  - Contrôler ses données et signaler des changements
  -->
</template>

<style>
.m-td-0 > td {
  padding: 0 !important;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>

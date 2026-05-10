<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/auth/Auth';
import useNotification from '../composables/useNotification.js';
import { useModalStore } from '../stores/common/Modal';

const jeton = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const newPasswordRepeated = ref('');
const errors = ref({});
const tab = ref('password');

const loading = ref(false);
const { showModal, confirm } = useModalStore();

const ajouter = () => showModal('ModalApiToken');

const authStore = useAuthStore();
Promise.all([authStore.loadApiToken(), authStore.fetchPermissions()])
  .then(() => (loading.value = false))
  .catch(() => (loading.value = false));

const apiTokens = computed(() => authStore.apiTokens);

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

const deleteApiToken = async (id) =>
  confirm(
    "Êtes-vous sûr de vouloir supprimer ce jeton d'API ?",
    "Attention, l'action est irréversible et un nouveau jeton d'API devra être recréé, les applications utilisant ce jeton perdront l'accès à l'API et devront être reconfigurées avec le nouveau jeton d'API.",
  ).then(() =>
    authStore
      .deleteApiToken(id)
      .then(() => awn.success("Jeton d'API supprimé"))
      .catch(() => awn.alert("Erreur lors de la suppression du jeton d'API")),
  );

const rowClass = (jeton) => {
  if (new Date(jeton.expires_at) < new Date()) {
    return 'table-danger';
  }
  // Si expiration dans moins de 7 jours
  if (new Date(jeton.expires_at) - new Date() <= 7 * 24 * 3600 * 1000) {
    return 'table-warning';
  }
};

const fields = [
  { title: 'Nom', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Créé le', key: 'created_at', type: Date },
  { title: 'Dernière utilisation', key: 'last_used_at', type: 'datetime' },
  { title: 'Expire le', key: 'expires_at', type: Date },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
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
      <div class="col-sm-12 col-xl-3 mb-2">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Paramètres</h3>
          </div>
          <nav
            class="nav flex-column nav-pills"
            role="tablist"
            aria-orientation="vertical"
          >
            <a
              class="nav-link"
              :class="{ active: tab === 'password' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'password'"
              >Mot de passe</a
            >
            <a
              class="nav-link"
              :class="{ active: tab === 'permissions' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'permissions'"
              >Permissions</a
            >
            <a
              class="nav-link"
              :class="{ active: tab === 'api-tokens' }"
              href="#"
              role="tab"
              @click.prevent="tab = 'api-tokens'"
              >Jetons d'API</a
            >
          </nav>
        </div>
      </div>
      <div class="col-sm-12 col-xl-9">
        <form @submit="changerMotDePasse" v-if="tab == 'password'">
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
                  minlength="12"
                  required
                  autocomplete="off"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors.password }"
                />
                <div v-if="errors.password" class="invalid-feedback">
                  Taille minimum: 12
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
                  minlength="12"
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
              <button class="btn btn-primary" @click="submit">Changer</button>
            </div>
          </div>
        </form>

        <form @submit="utiliserJeton" v-if="tab == 'permissions'">
          <div class="card card-primary card-outline mb-2">
            <div class="card-header d-flex justify-content-between">
              <h3>Utiliser un jeton de permissions</h3>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="jeton">Jeton</label>
                <input
                  id="jeton"
                  v-model="jeton"
                  type="text"
                  required
                  class="form-control form-control-sm"
                  placeholder="jeton"
                />
              </div>
              <button class="btn btn-primary" submit>Utiliser</button>
            </div>
          </div>
        </form>
        <div
          class="card card-primary card-outline mb-2"
          v-if="tab == 'permissions'"
        >
          <div class="card-header d-flex justify-content-between">
            <h3>Recharger mes permissions</h3>
          </div>
          <div class="card-body">
            <button class="btn btn-primary" @click="refreshTokens">
              Charger
            </button>
          </div>
        </div>

        <div
          class="card card-primary card-outline mb-2"
          v-if="tab == 'api-tokens'"
        >
          <div class="card-header d-flex justify-content-between">
            <h3>Jetons d'APIs</h3>
            <button class="btn btn-outline-primary" @click="ajouter">
              Ajouter
            </button>
          </div>
          <base-table
            :fields="fields"
            :data="apiTokens"
            :loading="loading"
            no-data="Aucun jeton d'API"
            :selectable="true"
            :rowClass="rowClass"
          >
            <template #actions="{ rowData }">
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deleteApiToken(rowData.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </template>
          </base-table>
        </div>
      </div>
    </div>
  </div>
  <!--
  TODO: Fonctionalitées pour le future
  - Demander un renvoi de la confirmation de l'email si pas validé
  - Supprimer ses accès pour un SIS
  - Changer son email
  - Supprimer son compte
  - Contrôler ses données et signaler des changements -- Autre interface peut-être -->
</template>

<style>
.m-td-0 > td {
  padding: 0 !important;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>
